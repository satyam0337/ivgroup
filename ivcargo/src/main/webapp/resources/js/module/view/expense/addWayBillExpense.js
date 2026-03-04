var ExpenseVoucherConfig			= null;
var ExpenseDetails					= null;
var isExpenseChargeValidation		= false;
var	moduleId; 							
var ModuleIdentifierConstant;
var PaymentTypeConstant	;
var generalConfiguration = null;
define(
		[
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'selectizewrapper',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ],
		 function(UrlParameter, Selectizewrapper) {
			'use strict';
			var jsonObject = new Object(), _this = null, wayBillId = 0, wayBillNumber, deliveryTo = 0, expTypes,
			wayBillChargesDetails, BranchExpenseConfiguration, exepenseVoucherDetailsId = 0, 
			paymentVoucherSequenceNumber = "",isRedirectAllow=false,consigneeCorpAccountId,validateChargeIds,paymentTypeArr,showPaymentModeSelection=false;
						return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					wayBillId						= UrlParameter.getModuleNameFromParam('wayBillId');
					consigneeCorpAccountId			= UrlParameter.getModuleNameFromParam('consigneeCorpAccountId');
					exepenseVoucherDetailsId		= UrlParameter.getModuleNameFromParam('exepenseVoucherDetailsId');
					paymentVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('paymentVoucherSequenceNumber');
					isRedirectAllow  				= UrlParameter.getModuleNameFromParam('isRedirectAllow');
				}, render : function() {
					jsonObject.waybillId		= wayBillId; 
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseWS/loadWayBillExpense.do?', _this.loadWayBillExpense, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadWayBillExpense : function(response) {
					showLayer();
					moduleId 						= response.moduleId;
					ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
					PaymentTypeConstant				= response.PaymentTypeConstant;
					generalConfiguration			= response.GeneralConfiguration;
					BranchExpenseConfiguration		= response.BranchExpenseConfiguration;
					showPaymentModeSelection 		= BranchExpenseConfiguration.showPaymentModeSelectionInLRExpense;

					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					var paymentHtml		= new $.Deferred();
			
					loadelement.push(baseHtml);
					
					if(showPaymentModeSelection && generalConfiguration.BankPaymentOperationRequired)
						loadelement.push(paymentHtml);
					
					$("#mainContent").load("/ivcargo/html/module/expense/AddWayBillExpense.html", function() {
						baseHtml.resolve();
					});
					
					if (showPaymentModeSelection && generalConfiguration.BankPaymentOperationRequired) {
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
							paymentHtml.resolve();
						});
					}
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						wayBillNumber					= response.wayBillNumber;
						
						$("*[data-selector=header]").html('<b>Add LR Expense</b> (LR Number : ' + wayBillNumber + ')</h4>');
						
						expTypes						= response.expTypes;
						wayBillChargesDetails			= response.wayBillChargesDetails;
						isExpenseChargeValidation 		= BranchExpenseConfiguration.isExpenseChargeValidation;
						validateChargeIds				= BranchExpenseConfiguration.validateIncomeExpenseChargeIds;
						deliveryTo						= response.deliveryTo;
						PaymentTypeConstant				= response.PaymentTypeConstant;
						paymentTypeArr					= response.paymentTypeArr;
						
						if(typeof response.previousDate != 'undefined') {
							$( function() {
								$('#date_1').val(dateWithDateFormatForCalender(new Date(),"-"));
								$('#date_1').datepicker({
									maxDate		: response.currentDate,
									
									minDate		: response.previousDate,
									showAnim	: "fold",
									dateFormat	: 'dd-mm-yy',
									onSelect: function (selectedDate) {
										$( "#dateForAll" ).val(selectedDate);
						            }
								});
							} );
							
							$('#backdatemessage').html('<b>Only ' + response.noOfDays + ' days back date allow but cannot be less than Booking Date !</b>');
						} else {
							$('#backdatemessagemarquee').remove();
						}
					
						if(showPaymentModeSelection && generalConfiguration.BankPaymentOperationRequired) {
							setAccountNoAutocomplete();
							setIssueBankAutocomplete();
						}
						
						$( "#date_1" ).val(response.currentDate);
						$( "#date_1" ).prop("readonly", true);
						$( "#dateForAll" ).val($( "#date_1" ).val());
						
						if(typeof wayBillChargesDetails != 'undefined') {
							for(var chargeId in wayBillChargesDetails) {
								if (wayBillChargesDetails.hasOwnProperty(chargeId)) {
									$('#wayBillChargeTypeIdCol').append(createWayBillChargeTypeField(chargeId, wayBillChargesDetails[chargeId]));
									//$('#wayBillChargeTypeIdCol').append("<input type='hidden' value='"+ wayBillChargesDetails[chargeId] +"' id = 'wayBillChargeTypeId_'" + i + "/>");
								}
							}
						}
						
						function createWayBillChargeTypeField(chargeId, chargeAmount) {
							var wayBillChargeTypeFeild	= $("<input/>", { 
								type		: 'hidden', 
								id			: 'wayBillChargeTypeId_' + chargeId, 
								class		: 'form-control', 
								name		: 'wayBillChargeTypeId_' + chargeId, 
								value 		: chargeAmount
							});

							return wayBillChargeTypeFeild;
						}
				
						if(showPaymentModeSelection && generalConfiguration.BankPaymentOperationRequired) {
							$('#paymentTypeSelection').removeClass('hide');
						
							Selectizewrapper.setAutocomplete({
								jsonResultList	: 	paymentTypeArr,
								valueField		:	'paymentTypeId',
								labelField		:	'paymentTypeName',
								searchField		:	'paymentTypeName',
								elementId		:	'paymentType',
								onChange		:	_this.onPaymentTypeSelect
							});
						} else
							$('#paymentTypeSelection').empty();

						$('#expenseType_1').find('option').remove().end();
						$('#expenseType_1').append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');

						for(var i = 0; i < expTypes.length; i++) {
							var value	= expTypes[i].incomeExpenseChargeMasterId + "_" + expTypes[i].mappingChargeTypeId;
							$('#expenseType_1').append('<option value="' + value + '" id="' + expTypes[i].incomeExpenseChargeMasterId + '">' + expTypes[i].chargeName + '</option>');
						}
						
						if(exepenseVoucherDetailsId > 0) {
							$('#datasaved').html('<b style="font-size: 16px;"> LR Expense Saved successfully ! Voucher No :</b> is <b>' + paymentVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							$("#reprintBtn").bind("click", function() {
								_this.printLRExpenseVoucher(exepenseVoucherDetailsId);
							});
						}
						
						$(".expenseType_1").bind("change keydown keypress keyup", function() {
							_this.validateForAmountBySelectingExpenseCharge();
						});
						
						$(".amount_1").bind("blur", function() {
							_this.validateForAmountByEnteringExpenseAmount(this);
						});

						$("#expenseType_1").bind("change keydown keypress keyup", function() {
							if(isExpenseChargeValidation)
								_this.checkExpenseEntry();
						});

						$("#save").click(function(event) {
							event.preventDefault();
							_this.saveWayBillExpenses();
						});
					});
				}, validateExpenseEntryOnLS : function(wayBillChargeId) {
					
					var jsonObject 			= new Object();
					jsonObject.waybillId	= wayBillId;
					
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/expenseVoucherConfigWS/getLSDateByWayBillId.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							if(data != null && (data.creationDateTimeStamp != null && data.creationDateTimeStamp != undefined)) {
								var dispatchDate = data.creationDateTimeStamp;
								_this.getLRByWBId(dispatchDate, wayBillChargeId);
							} 
						}
					});
					
				}, getLRByWBId : function(dispatchDate, wayBillChargeId) {
					var jsonObject 									= new Object();
				
					jsonObject.waybillId							= wayBillId;
					jsonObject.corporateAccountId					= consigneeCorpAccountId;
					jsonObject.dispatchDate							= dispatchDate;
					jsonObject.incomeExpenseChargeMasterId			= wayBillChargeId;
					
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/expenseVoucherConfigWS/validateExpenseEntryOnLS.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							if(data != null ) {
								ExpenseDetails 		= data.ExpenseDetails;
								
								if(ExpenseDetails != null) {
									var voucherNumber 	= ExpenseDetails.voucherNumber;
									var wayBillNumber 	= ExpenseDetails.wayBillNumber;
									showMessage('info','Expense no : '+voucherNumber+' already created for LR No, : '+wayBillNumber+'.');
									$('#expenseType_1').val(0);
									return;
								}
							} 
						}
					});
				}, onPaymentTypeSelect	: function(_this) {
					hideShowBankPaymentTypeOptions(document.getElementById('paymentType'));
				}, checkExpenseEntry : function() {
					ExpenseVoucherConfig	= null;
					var obj				= document.getElementById('expenseType_1');
					var wayBillChargeId	= parseInt(obj.options[obj.selectedIndex].value);
					
					var jsonObject = new Object;
					jsonObject.incomeExpenseChargeMasterId 	= wayBillChargeId;
					jsonObject.corporateAccountId			= consigneeCorpAccountId;
					
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/expenseVoucherConfigWS/checkExpenseAllowEntry.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							$('#amount_1').val(0);
							
							if(data.chargeAllowed != null) {
								ExpenseVoucherConfig = data.ExpenseVoucherConfig;
								
								if(!data.chargeAllowed) {
									showMessage('info','Expense not allowed. Contact to your Head Office!');
									$('#expenseType_1').val(0);
									return;
								} else {
								//	$('#amount_1').val(ExpenseVoucherConfig.limit);
									
									if(validateChargeIds.includes(wayBillChargeId)) {
										if(ExpenseDetails == null)
											_this.validateExpenseEntryOnLS(wayBillChargeId);
										else {
											var voucherNumber 	= ExpenseDetails.voucherNumber;
											var wayBillNumber 	= ExpenseDetails.wayBillNumber;
											showMessage('info','Expense no : '+voucherNumber+' already created for LR No, : '+wayBillNumber+'.');
											$('#expenseType_1').val(0);
											return;
										}
									}
								}
							}
						}
					});
				}, validateForAmountBySelectingExpenseCharge : function() {
					var obj				= document.getElementById('expenseType_1');
					var objName			= obj.name;
					var mySplitVal		= objName.split("_");
					var wayBillChargeId	= parseInt(obj.options[obj.selectedIndex].value);
					var amount			= parseInt(Math.round($('#amount_' + mySplitVal[1]).val()));
					
					if(wayBillChargeId > 0 && amount > 0) {
						if($('#wayBillChargeTypeId_' + wayBillChargeId).exists()) {
							var wbAmount = parseInt($('#wayBillChargeTypeId_' + wayBillChargeId).val());
							
							if(amount > wbAmount)
								alert('You are entering more amount than collected for this charge !');
						}
					}
				}, validateForAmountByEnteringExpenseAmount : function(obj) {
					var objName			= obj.name;
					var mySplitVal		= objName.split("_");
					var enteredWBCharge	= obj.value;
					var expenseType		= ($('#expenseType_' + mySplitVal[1]).val()).split("_")[1];
					
					if(expenseType > 0 && enteredWBCharge > 0) {
						if($('#wayBillChargeTypeId_' + expenseType).exists()) {
							var wbAmount = parseInt($('#wayBillChargeTypeId_' + expenseType).val());
							
							if(enteredWBCharge > wbAmount) {
								alert('You are entering more amount than collected for this charge !');
							}
						}
					}
				}, saveWayBillExpenses : function() {
					if(!_this.validateDetails())
						return false;
						
					if(isExpenseChargeValidation && !validateExpenseLimit($('#amount_1').val()))
						return false;
						
					let paymentType	= $('#paymentType').val();
						
					if(showPaymentModeSelection && (paymentType == undefined || paymentType == 0)) {
						showMessage('error', iconForErrMsg + ' Please, Select Payment Mode !');
						return false;
					}
					
					$("#save").addClass('hide');

					var jsonObject	= new Object();

					jsonObject.waybillId			= wayBillId;
					jsonObject.wayBillNumber		= wayBillNumber;
					jsonObject.amount				= $('#amount_1').val();
					jsonObject.remark				= $('#remark_1').val();
					jsonObject.headId				= $('#expenseType_1').val();
					jsonObject.incomeExpheadName	= getValueTextFromOptionField('expenseType_1');
					jsonObject.wayBillExpensesCount	= 1;
					jsonObject.expenseDateForAll	= $("#dateForAll").val();
					jsonObject.paymentValues		= $('#paymentCheckBox').val();
					jsonObject.paymentType			= paymentType;

					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to add these LR Expense ?",
						modalWidth 	: 	30,
						title		:	'LR Expense',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/addWayBillExpense.do', _this.setResponseAfterExpense, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
					btModalConfirm.on('cancel', function() {
						$("#save").removeClass('hide');
						hideLayer();
					});
				}, setResponseAfterExpense : function(response) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					$("#save").removeClass('hide');
					
					if (response.exepenseVoucherDetailsId != undefined) {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=addWayBillExpense&exepenseVoucherDetailsId=' + response.exepenseVoucherDetailsId + '&paymentVoucherSequenceNumber=' + response.PaymentVoucherSequenceNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						
						_this.printLRExpenseVoucher(response.exepenseVoucherDetailsId);
					}
					
					if(!isRedirectAllow || isRedirectAllow == 'false')
						window.close();
					
					hideLayer();
				}, validateDetails() {
					for (var i = 1; i <= 1; i++) {
						if(!validateInputTextFeild(1, 'expenseType_' + i, 'expenseType_' + i, 'error', expenseTypeErrMsg))
							return false;
						
						if(BranchExpenseConfiguration.validateUpdateDeliveryToInLRExpense && !_this.validateUpdateDeliveryTo(i))
							return false;
						
						if(!validateInputTextFeild(1, 'amount_' + i, 'amount_' + i, 'error', iconForErrMsg + ' Enter Amount'))
							return false;

						if(!validateInputTextFeild(1, 'remark_' + i, 'remark_' + i, 'error', iconForErrMsg + ' Enter Remark'))
							return false;
					}

					return true;
				}, validateUpdateDeliveryTo : function(i) {
					var expenseType		= $('#expenseType_' + i).val();
					var expArr 			= expenseType.split("_");	
					
					if(parseInt(expArr[1]) == DOOR_DELIVERY_BOOKING && Number(deliveryTo) != DELIVERY_TO_DOOR_ID) {
						showMessage('info', iconForInfoMsg + ' Please, First update Delivery To from Godown To Door !');
						return false;
					}
					
					return true;
				}, printLRExpenseVoucher : function(exepenseVoucherDetailsId) {
					if(!isRedirectAllow || isRedirectAllow == 'false')
						newwindow = window.open('WayBillExpensePrint.do?pageId=25&eventId=10&voucherDetailsId='+exepenseVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					else
						window.open('WayBillExpensePrint.do?pageId=25&eventId=10&voucherDetailsId='+exepenseVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});

function checkExpenseLimit(object) {
	var enteredWBCharge		= object.value; 
	
	validateExpenseLimit(enteredWBCharge);
}

function validateExpenseLimit(enteredWBCharge) {
	if(ExpenseVoucherConfig != null && enteredWBCharge > ExpenseVoucherConfig.limit) {
		$('#amount_1').val(ExpenseVoucherConfig.limit);
		showMessage('info','Amount should be less than ' + ExpenseVoucherConfig.limit);
		hideLayer();
		return false;
	}
	
	return true;
}

function checkExpense(){
	var obj				= document.getElementById('expenseType_1');
	var wayBillChargeId	= parseInt(obj.options[obj.selectedIndex].value);
	if(Number(wayBillChargeId) <= 0){
		showMessage('error', 'Please enter expense first.');
		obj.options[obj.selectedIndex].value = 0;
		$('#expenseType_1').focus();
		return false;
	}
}
