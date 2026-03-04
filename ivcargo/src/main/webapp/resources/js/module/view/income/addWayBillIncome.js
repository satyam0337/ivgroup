define(
		[
		 'JsonUtility',
		 'messageUtility',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 'selectizewrapper',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'],
		 function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,Selectizewrapper,
				 BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), _this = null, myNod, wayBillId = 0, wayBillNumber, BranchIncomeConfiguration = null, executive, btModalConfirm, incmCharges,
			wayBillDetailsModel, wayBillIncomeCount = 0, INCOME_CHARGE_TOPAY_TO_PAID = 1, wayBillIncomeVoucherDetailsId = 0, receiptVoucherSequenceNumber = "";
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					wayBillId						= UrlParameter.getModuleNameFromParam('wayBillId');
					wayBillNumber					= UrlParameter.getModuleNameFromParam('wayBillNumber');
					wayBillIncomeVoucherDetailsId	= UrlParameter.getModuleNameFromParam('wayBillIncomeVoucherDetailsId');
					receiptVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('receiptVoucherSequenceNumber');
				}, render : function() {
					jsonObject.waybillId		= wayBillId; 
					jsonObject.wayBillNumber	= wayBillNumber; 
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseWS/loadWayBillIncome.do?', _this.loadWayBillIncome, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadWayBillIncome : function(response) {
					showLayer();

					var jsonObject 		= new Object();
					
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					var paymentHtml		= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/income/AddWaybillIncome.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						executive						= response.executive;
						BranchIncomeConfiguration		= response.BranchIncomeConfiguration;
						incmCharges						= response.incmCharges;
						wayBillDetailsModel				= response.wayBillDetailsModel;
						
						if(typeof response.previousDate != 'undefined') {
							$( function() {
								$('#date_1').val(dateWithDateFormatForCalender(new Date(),"-"));
								$('#date_1').datepicker({
									maxDate		: new Date(),
									minDate		: response.previousDate,
									showAnim	: "fold",
									dateFormat	: 'dd-mm-yy',
									onSelect: function (selectedDate) {
										$( "#dateForAll" ).val(selectedDate);
						            }
								});
							} );
							
							$('#backdatemessage').html('<b>Only ' + response.noOfDays + ' days back date allow !</b>');
						} else {
							$('#backdatemessagemarquee').remove();
						}
						
						$( "#date_1" ).val(response.currentDate);
						$( "#date_1" ).prop("readonly", true);
						$( "#dateForAll" ).val($( "#date_1" ).val());
						
						if(typeof wayBillDetailsModel != 'undefined') {
							$('#lrGrandTotal').val(wayBillDetailsModel.grandTotal);
						}
						
						if(incmCharges && !jQuery.isEmptyObject(incmCharges)) {
							$('#incomeCharge_1').find('option').remove().end();
							$('#incomeCharge_1').append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');

							for(const element of incmCharges) {
								$('#incomeCharge_1').append('<option value="' + element.incomeExpenseChargeMasterId + '" id="' + element.incomeExpenseChargeMasterId + '">' + element.chargeName + '</option>');
							}
						}
						
						if(wayBillIncomeVoucherDetailsId > 0) {
							$('#datasaved').html('<b style="font-size: 16px;"> LR Income Saved successfully ! Voucher No :</b> is <b>' + receiptVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							$("#reprintBtn").bind("click", function() {
								_this.printLRIncomeVoucher(wayBillIncomeVoucherDetailsId);
							});
						}
						
						$(".incomeCharge_1").bind("change keydown keypress keyup", function() {
							_this.validateForAmountBySelectingIncomeCharge();
						});
						
						$(".amount_1").bind("blur", function() {
							_this.validateForAmountByEnteringIncomeAmount(this);
						});

						$("#save").click(function(event) {
					        event.preventDefault();
					        _this.saveWayBillIncome();
					    });
					});
				}, validateForAmountBySelectingIncomeCharge : function() {
					var obj			= document.getElementById('incomeCharge_1');
					var objName		= obj.name;
					var mySplitVal	= objName.split("_");
					var val 		= parseInt(obj.options[obj.selectedIndex].value);
					var amount		= parseInt(Math.round($('#amount_' + mySplitVal[1]).val()));
					var lrGrandTotal= parseInt(Math.round($('#lrGrandTotal').val()));
					
					if(amount > 0 && val == INCOME_CHARGE_TOPAY_TO_PAID) {
						if(amount > lrGrandTotal) {
							$('#amount_' + mySplitVal[1]).val(0);
							showMessage('info', 'You are entering more amount than collected for this charge !');
							return false;
						}
					}
					
					return true;
				}, validateForAmountByEnteringIncomeAmount : function(obj) {
					var objName			= obj.name;
					var mySplitVal		= objName.split("_");
					var enteredWBCharge	= Math.round(obj.value);
					var incomeCharge	= $('#incomeCharge_' + mySplitVal[1]).val();
					var lrGrandTotal	= parseInt(Math.round($('#lrGrandTotal').val()));

					if(enteredWBCharge > 0 && incomeCharge == INCOME_CHARGE_TOPAY_TO_PAID) {
						if(enteredWBCharge > lrGrandTotal) {
							obj.value = '0';
							showMessage('info', 'You are entering more amount than collected for this charge !');
						}
					}
				}, saveWayBillIncome : function() {
					if(!_this.validateDetails()) {
						return false;
					} else if(!_this.validateForAmountBySelectingIncomeCharge()) {
						return false;
					}
					
					$("#save").addClass('hide');

					var jsonObject	= new Object();

					jsonObject.waybillId			= wayBillId;
					jsonObject.wayBillNumber		= wayBillNumber;
					jsonObject.amount				= $('#amount_1').val();
					jsonObject.remark				= $('#remark_1').val();
					jsonObject.headId				= $('#incomeCharge_1').val();
					jsonObject.incomeExpheadName	= getValueTextFromOptionField('incomeCharge_1');
					jsonObject.wayBillIncomeCount	= wayBillIncomeCount;
					jsonObject.incomeDateForAll		= $("#dateForAll").val();

					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to add these LR Income ?",
						modalWidth 	: 	30,
						title		:	'LR Income',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/addWayBillIncome.do', _this.setResponseAfterIncome, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
					btModalConfirm.on('cancel', function() {
						$("#save").removeClass('hide');
						hideLayer();
					});
				}, setResponseAfterIncome : function(response) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					$("#save").removeClass('hide');
					
					if (response.wayBillIncomeVoucherDetailsId != undefined) {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=addWayBillIncome&wayBillIncomeVoucherDetailsId=' + response.wayBillIncomeVoucherDetailsId + '&receiptVoucherSequenceNumber=' + response.ReceiptVoucherSequenceNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						
						_this.printLRIncomeVoucher(response.wayBillIncomeVoucherDetailsId);
					}
					
					hideLayer();
				}, validateDetails() {
					for (var i = 1; i <= 1; i++) {
						if(!validateInputTextFeild(1, 'incomeCharge_' + i, 'incomeCharge_' + i, 'error', incomeTypeErrMsg)) {
							return false;
						}
						
						if(!validateInputTextFeild(1, 'amount_' + i, 'amount_' + i, 'error', iconForErrMsg + ' Enter Amount')) {
							return false;
						}

						if(!validateInputTextFeild(1, 'remark_' + i, 'remark_' + i, 'error', iconForErrMsg + ' Enter Remark')) {
							return false;
						}
					}

					return true;
				}, printLRIncomeVoucher : function(wayBillIncomeVoucherDetailsId) {
					window.open('WayBillIncomePrint.do?pageId=25&eventId=14&wayBillIncomeVoucherDetailsId='+wayBillIncomeVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});