var PaymentTypeConstant 			= null;
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var idProofConstantArr				= null;
var IDProofConstant					= null;
var maxFileSizeToAllow 				= 0;
var doneTheStuff					= false;
var luggageStorageChargePerQuantityAllowed = false;
var luggageStorageChargePerQuantity = 0;
var luggageStorageChargesId = 0;
var GeneralConfiguration            = null;
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
			var jsonObject = new Object(), _this = null, myNod, BranchIncomeConfiguration = null, executive, btModalConfirm,
			branchIncomeCount = 1, branchIncomeVoucherDetailsId = 0, receiptVoucherSequenceNumber = "", allowMultipleIncomeType = false, paymentTypeArr = null,
			tdsConfiguration = null, tdsChargeList = null,noOfIncomeAllowToAdd = 0, bankPaymentOperationRequired = false, isAllowToEnterIDProof = false,branchIncomePrintFromWS=false;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					branchIncomeVoucherDetailsId	= UrlParameter.getModuleNameFromParam('branchIncomeVoucherDetailsId');
					receiptVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('receiptVoucherSequenceNumber');
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseWS/loadBranchIncome.do?', _this.loadBranchVoucherExpenseEelements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadBranchVoucherExpenseEelements : function(response) {
					showLayer();

					isAllowToEnterIDProof			= response.idProofEntryALlow;
					maxFileSizeToAllow				= response.maxFileSizeToAllow;
					GeneralConfiguration			= response.GeneralConfiguration;
					bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
					luggageStorageChargePerQuantityAllowed	= response.BranchIncomeConfiguration.LuggageStorageChargePerQuantityAllowed;
					luggageStorageChargePerQuantity			= response.BranchIncomeConfiguration.LuggageStorageChargePerQuantity;
					branchIncomePrintFromWS				= response.BranchIncomeConfiguration.branchIncomePrintFromWS;
					
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					var paymentHtml		= new $.Deferred();
					var idProofHtml		= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					if(bankPaymentOperationRequired) {
						loadelement.push(paymentHtml);
					}
					
					if(isAllowToEnterIDProof) {
						loadelement.push(idProofHtml);
					}
					
					$("#mainContent").load("/ivcargo/html/module/income/BranchIncome.html",
							function() {
								baseHtml.resolve();
					});
					
					if(bankPaymentOperationRequired) {
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
								function() {
								paymentHtml.resolve();
						});
					}
					
					if(isAllowToEnterIDProof) {
						$("#idProofOperationPanel").load("/ivcargo/html/module/idproofdetails/idproofdetails.html",
								function() {
								idProofHtml.resolve();
						});
					}
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						//loadLanguageWithParams(FilePath.loadLanguage());
						
						executive						= response.executive;
						PaymentTypeConstant				= response.PaymentTypeConstant;
						paymentTypeArr					= response.paymentTypeArr;
						moduleId						= response.moduleId;
						ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
						incomeExpenseModuleId			= response.incomeExpenseModuleId;
						tdsConfiguration				= response.tdsConfiguration;
						tdsChargeList					= response.tdsChargeList;
						BranchIncomeConfiguration		= response.BranchIncomeConfiguration;
						allowMultipleIncomeType			= BranchIncomeConfiguration.allowMultipleIncomeType;
						noOfIncomeAllowToAdd			= BranchIncomeConfiguration.noOfIncomeAllowToAdd;
						luggageStorageChargesId			= BranchIncomeConfiguration.LuggageStorageChargesId;
						idProofConstantArr				= response.idProofConstantArr;
						IDProofConstant					= response.IDProofConstant;
						
						if(typeof response.previousDate != 'undefined') {
							$( function() {
								$('#date_1').val(dateWithDateFormatForCalender(curDate,"-"));
								$('#date_1').datepicker({
									maxDate		: new Date(curDate),
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
						
						$( "#date_1" ).val(dateWithDateFormatForCalender(curDate,"-"));
						$( "#date_1" ).prop("readonly", true);
						$( "#dateForAll" ).val($( "#date_1" ).val());
						
						if(!allowMultipleIncomeType) {
							$('#allowMultipleIncome').remove();
						}
						
						if(luggageStorageChargePerQuantityAllowed == false || luggageStorageChargePerQuantityAllowed == 'false'){
							$(".luggageIncome").css('display','none');
						}
						
						if(!tdsConfiguration.IsTdsAllow) {
							$('#tdsTable').remove();
						} else {
							$("#tdsRate").bind("change", function() {
								_this.calculateTDS();
							});
							
							$("#tdsAmount").bind("keyup", function() {
								_this.calculateTDS();
							});
						}
						
						if(!tdsConfiguration.IsPANNumberRequired) {
							$('.panNumberRow').remove();
						}
						
						if(!tdsConfiguration.IsTANNumberRequired) {
							$('.tanNumberRow').remove();
						}
						
						if(tdsConfiguration.IsTdsAllow) {
							if(typeof response.tdsChargeList == 'undefined') {
								$('.tdsRateCol').remove();
							} else {
								var tdsRateList	= response.tdsChargeList;
								var tdsRateLst	= [];
								
								for (var i = 0; i < tdsRateList.length; i++) {
									var tdsObject		= new Object();
									var tdsRate			= tdsRateList[i];
									tdsObject.tdsRate	= tdsRate + '%';
									tdsObject.tdsValue	= tdsRate;
									tdsRateLst.push(tdsObject);
								}
								
								Selectizewrapper.setAutocomplete({
									jsonResultList	: 	tdsRateLst,
									valueField		:	'tdsValue',
									labelField		:	'tdsRate',
									searchField		:	'tdsRate',
									elementId		:	'tdsRate',
									create			: 	false,
									onChange		:	_this.calculateTDS,
									maxItems		: 	1
								});
							}
						}
						
						$("#IncomeExpheadName_1").autocomplete({
						    source: function (request, response) {
						        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getActiveIncomeExpenseHeadersList.do?term=' + request.term + '&incExpType=1&chargeType=3', function (data) {
						            response($.map(data.result, function (item) {
						                return {
						                    label		: item.chargeName,
						                    value		: item.chargeName,
						                    id			: item.incomeExpenseChargeMasterId
						                };
						            }));
						        });
						    }, select: function (e, u) {
						    	$('#headId_1').val(u.item.id);
						    	
						    	if(isAllowToEnterIDProof) {
						    		_this.openModelForIDProof(u.item.id);
						    	}
						    	
						    	if(luggageStorageChargePerQuantityAllowed){
						    		if(u.item.id != luggageStorageChargesId){
						    			$('#quantity_1').val(0);
						    			$('#amountPerArt_1').val(0);
						    			$('#quantity_1').prop("disabled", true);
						    			$('#amountPerArt_1').prop("disabled", true);
						    		} else{
						    			$('#amountPerArt_1').val(luggageStorageChargePerQuantity);
						    			$('#amountPerArt_1').prop("disabled", true);
						    			$('#quantity_1').prop("disabled", false);
						    		}
						    	}
						    	
						    	$('#amount_1').focus();
						    },
						    minLength	: 2,
						    delay		: 20,
						    autoFocus	: true
						});
						
						if(branchIncomeVoucherDetailsId > 0) {
							$('#datasaved').html('<b style="font-size: 16px;"> Office Income Saved successfully ! Voucher No :</b> is <b>' + receiptVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							$("#reprintBtn").bind("click", function() {
								_this.printBranchIncomeVoucher(branchIncomeVoucherDetailsId);
							});
						}
						
						$("#viewAllHeadsBtn").bind("click", function() {
							window.open ('viewDetails.do?pageId=340&eventId=2&modulename=incomeExpenseHeadDetails&incExpType=3&chargeType=3','newwindow', 'config=height=500,width=650, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
						});
						
						if(paymentTypeArr && !jQuery.isEmptyObject(paymentTypeArr)) {
							$('#paymentType').find('option').remove().end();
							$('#paymentType').append('<option value="' + 0 + '" id="' + 0 + '">-- Select Mode--</option>');

							if(!jQuery.isEmptyObject(paymentTypeArr)) {
								for(var i = 0; i < paymentTypeArr.length; i++) {
									if(paymentTypeArr[i] != null) {
										$('#paymentType').append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
									}
								}
							}
						} else {
							 $("#paymenttypediv").hide();
						}
						
						if(bankPaymentOperationRequired) {
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
							$('#myModal').remove();
							
							$("#paymentType").bind("change", function() {
								hideShowBankPaymentTypeOptions(this);
							});
						} else {
							$('#paymenttypediv').remove();
							$('#paymentTypeSelection').remove();
						}
						
						if(!isAllowToEnterIDProof) {
							$('#viewIDProofDetails').remove();
							$('.addIdProof').css('display','none');
						}
						
						$("#addRow").bind("click", function() {
							_this.addNewRow();
						});
						
						/*$("#addIdProof_1").bind("click", function() {
							if($('#headId_1').val() == luggageStorageChargesId){
								_this.openModelForIDProof($('#headId_1').val());
							}
						});*/
						
						$(".deleteRow").bind("click", function() {
							_this.deleteCurRow(this);
						});
						
						$('.IncomeExpheadName').keyup(function(event) {
							if(getKeyCode(event) == 8 || getKeyCode(event) == 46) {
								_this.resetHeadId(this);
							}
						});
						
						if(tdsConfiguration.IsTdsAllow) {
							$('.amount').keyup(function(event) {
								_this.calculateTDS();
							});
						}
						
						$('#tdsAmount').keyup(function(event) {
							_this.calculateTDS();
						});

						$("#save").click(function(event) {
					        event.preventDefault();
					        _this.saveWayBillIncome();
					    });
					});
				}, addNewRow : function() {
					let rowCount 		= $("#mainTable  tr").length;
					
					if (Number(rowCount) >= noOfIncomeAllowToAdd) {
						showMessage('info', iconForInfoMsg + ' You can not add more then ' + noOfIncomeAllowToAdd + ' Income !');
						return false;
					}

					var table 		= document.getElementById('mainTable');
					
					var row 	= table.insertRow(rowCount);
					var curRow 	= table.rows[rowCount - 1];
					var curId 	= parseInt(curRow.id);
					var nextId 	= curId + 1;

					row.id			= nextId + 'row';
					
					var cell1 = row.insertCell(0);
					
					/*if(isAllowToEnterIDProof){
						var cell1 = row.insertCell(1);
						var element1 			= document.getElementById('addIdProof_'+curId).cloneNode(true);
						element1.style.display 	= 'table-cell';
						element1.id 			= 'addIdProof_'+nextId;
						element1.name 			= 'addIdProof_'+nextId;
						cell1.appendChild(element1);
					}*/
					
					var cell2 				= row.insertCell(1);
					var element3 			= document.getElementById('IncomeExpheadName_' + curId).cloneNode(true);
					element3.id 			= 'IncomeExpheadName_' + nextId;
					element3.name 			= 'IncomeExpheadName_' + nextId;
					element3.value 			= '';
					element3.selectedIndex	= 0;

					var elementhead 			= document.getElementById('headId_' + curId).cloneNode(true);
					elementhead.id 				= 'headId_' + nextId;
					elementhead.name 			= 'headId_' + nextId;
					elementhead.value 			= '0';
					elementhead.selectedIndex	= 0;

					cell2.appendChild(elementhead);
					cell2.appendChild(element3);
					
					if(luggageStorageChargePerQuantityAllowed){
						
						var cell3 			= row.insertCell(2);
						var element4 		= document.getElementById('quantity_' + curId).cloneNode(true);
						element4.id 		= 'quantity_' + nextId;
						element4.name 		= 'quantity_' + nextId;
						element4.value 		= '';
						element4.onfocus 	= "prev='" + 'IncomeExpheadName_' + nextId + "';next='" + 'amount_' + nextId + "';";
						element4.disabled	= false;
						cell3.appendChild(element4);
						
						var cell4 			= row.insertCell(3);
						var element5 		= document.getElementById('amountPerArt_' + curId).cloneNode(true);
						element5.id 		= 'amountPerArt_' + nextId;
						element5.name 		= 'amountPerArt_' + nextId;
						element5.value 		= '';
						element5.disabled	= false;
						cell4.appendChild(element5);
						
						var cell5 			= row.insertCell(4);
						var element6 		= document.getElementById('amount_' + curId).cloneNode(true);
						element6.id 		= 'amount_' + nextId;
						element6.name 		= 'amount_' + nextId;
						element6.value 		= '';
						element6.onfocus 	= "prev='" + 'quantity_' + nextId + "';next='" + 'remark_' + nextId + "';";
						cell5.appendChild(element6);
						
						var cell6 		= row.insertCell(5);
						var element7 	= document.getElementById('remark_' + curId).cloneNode(true);
						element7.id 	= 'remark_' + nextId;
						element7.name 	= 'remark_' + nextId;
						element7.value 	= '';
						cell6.appendChild(element7);

						var cell7 				= row.insertCell(6);
						var element8 			= document.getElementById(curId + 'deleteRow').cloneNode(true);
						element8.style.display 	= 'table-cell';
						element8.id 			= nextId + 'deleteRow';
						element8.name 			= nextId + 'deleteRow';
						cell7.appendChild(element8);
						
					} else {
						
						var cell3 			= row.insertCell(2);
						var element4 		= document.getElementById('amount_' + curId).cloneNode(true);
						element4.id 		= 'amount_' + nextId;
						element4.name 		= 'amount_' + nextId;
						element4.value 		= '';
						element4.onfocus 	= "prev='" + 'IncomeExpheadName_' + nextId + "';next='" + 'remark_' + nextId + "';";
						cell3.appendChild(element4);
						
						var cell4 		= row.insertCell(3);
						var element5 	= document.getElementById('remark_' + curId).cloneNode(true);
						element5.id 	= 'remark_' + nextId;
						element5.name 	= 'remark_' + nextId;
						element5.value 	= '';
						cell4.appendChild(element5);

						var cell5 				= row.insertCell(4);
						var element6 			= document.getElementById(curId + 'deleteRow').cloneNode(true);
						element6.style.display 	= 'table-cell';
						element6.id 			= nextId + 'deleteRow';
						element6.name 			= nextId + 'deleteRow';
						cell5.appendChild(element6);
						
					}
					
					branchIncomeCount++;
					_this.autocompForIncomeType(nextId, element3.id);
					
					$(".deleteRow").bind("click", function() {
						_this.deleteCurRow(this);
					});
					
					/*$("#addIdProof_"+nextId).bind("click", function() {
						if($('#headId_'+nextId).val() == luggageStorageChargesId){
							_this.openModelForIDProof($('#headId_'+nextId).val());
						}
					});*/
					
					$('.IncomeExpheadName').keyup(function(event) {
						if(getKeyCode(event) == 8 || getKeyCode(event) == 46) {
							_this.resetHeadId(this);
						}
					});
					
					if(tdsConfiguration.IsTdsAllow) {
						$('.amount').keyup(function(event) {
							_this.calculateTDS();
						});
					}
				}, autocompForIncomeType : function(rowid, incomeExpheadNames) {
					$("#" + incomeExpheadNames).autocomplete({
					    source: function (request, response) {
					        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getActiveIncomeExpenseHeadersList.do?term=' + request.term + '&incExpType=1&chargeType=3', function (data) {
					            response($.map(data.result, function (item) {
					                return {
					                    label		: item.chargeName,
					                    value		: item.chargeName,
					                    id			: item.incomeExpenseChargeMasterId
					                };
					            }));
					        });
					    }, select: function (e, u) {
					    	
					    	$('#headId_' + rowid).val(u.item.id);
					    	
					    	if(isAllowToEnterIDProof) {
					    		_this.openModelForIDProof(u.item.id);
					    	}
					    		
					    	$('#amount_' + rowid).focus();
					    	
					    	if(luggageStorageChargePerQuantityAllowed){
					    		if(u.item.id != luggageStorageChargesId){
					    			$('#quantity_' + rowid).val(0);
					    			$('#amountPerArt_' + rowid).val(0);
					    			$('#quantity_' + rowid).prop("disabled", true);
					    			$('#amountPerArt_' + rowid).prop("disabled", true);
					    		} else{
					    			$('#amountPerArt_' + rowid).val(luggageStorageChargePerQuantity);
					    			$('#amountPerArt_' + rowid).prop("disabled", true);
					    			$('#quantity_'+ rowid).prop("disabled", false);
					    		}
					    	}
					    	
					    },
					    minLength	: 2,
					    delay		: 20,
					    autoFocus	: true
					});
				}, openModelForIDProof : function(expenseMasterId) {
					if(luggageStorageChargesId == expenseMasterId) {
						openIdProofModel();
					}
				}, deleteCurRow : function(obj) {
					var table 		= document.getElementById('mainTable');
					var rowCount 	= table.rows.length;

					if (rowCount > 0) {
						if(obj.id == '1deleteRow') {
							showMessage('info', iconForInfoMsg + ' You can not delete this row');
							return;
						}

						branchIncomeCount--;
						
						var curId = parseInt(obj.id);
						$(document.getElementById(curId + 'row')).remove();
					} else {
						showMessage('info', iconForInfoMsg + ' You can not delete this row');
					}
				}, resetHeadId : function(obj) {
					$('#headId_' + obj.id.split('_')[1]).val(0);
				}, calculateTDS : function() {
					var tdsRate			= $('#tdsRate').val();
					var tdsAmount		= 0;
					var totalIncomeAmt	= 0;
					
					$('#mainTable tr').each(function() {
						if($('.amount', this).val() > 0) {
							totalIncomeAmt	+= Number($('.amount', this).val());
						}
					});
					
					if($('#tdsAmount').exists()) {
						tdsAmount		= $('#tdsAmount').val();
					}
					
					if(totalIncomeAmt > 0 && tdsAmount >= totalIncomeAmt) {
						$('#tdsAmount').val(0);
						showMessage('info', iconForInfoMsg + ' TDS Amount cannot be greater than Income Amount !');
						return;
					}
					
					if(tdsRate > 0) {
						tdsAmount	= Math.round((totalIncomeAmt * tdsRate) / 100);
						$('#tdsAmount').val(tdsAmount);
					}
				}, saveWayBillIncome : function() {
					if(!_this.validateDetails())
						return false;
					
					$("#save").addClass('hide');

					let jsonObjectdata = null;

					let ary = [];
					let tdsOnAmount		= 0;
					
					$('#mainTable tr').each(function() {
						if($('.amount', this).val() > 0) {
							jsonObjectdata			= new Object();
	
							tdsOnAmount		+= Number($('.amount', this).val());
							
							jsonObjectdata.amount					= $('.amount', this).val();
							jsonObjectdata.remark					= $('.remark', this).val();
							jsonObjectdata.headId					= $('.headId', this).val();
							jsonObjectdata.incomeExpheadName		= $('.IncomeExpheadName', this).val();
							jsonObjectdata.quantity					= $('.quantity', this).val();
							jsonObjectdata.amountPerArt				= $('.amountPerArt', this).val();
							ary.push(jsonObjectdata);
						}
				    });
					
					if(ary.length == 0) {
						$("#save").removeClass('hide');
						showMessage('error', 'Amount Details Not Entered, Try Again !');
						return;
					}

					let jsonObject	= new Object();

					jsonObject.branchIncomeCount	= branchIncomeCount;
					jsonObject.incomeDateForAll		= $("#dateForAll").val();
					jsonObject.branchIncomes		= JSON.stringify(ary);
					
					jsonObject.paymentType  	= $('#paymentType').val();
					jsonObject.tdsRate			= $("#tdsRate").val();
					jsonObject.tdsAmount		= $("#tdsAmount").val();
					jsonObject.tdsOnAmount		= tdsOnAmount;
					jsonObject.PanNumber		= $("#panNumber").val();
					jsonObject.TanNumber		= $("#tanNumber").val();

					if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
						jsonObject.chequeNumber			= $('#chequeNo').val();
						jsonObject.chequeDate			= $('#chequeDate').val();

						if($('#accountNo_primary_key').exists()) {
							jsonObject.bankAccountId		= $('#accountNo_primary_key').val();
						} else {
							jsonObject.bankAccountId		= $('#bankName').val();
						}

						jsonObject.chequeGivenTo			= $('#payeeName').val();
					}

					if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID 
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
						jsonObject.chequeNumber				= $('#cardNo').val();
					}

					if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID 
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID
							|| $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
						jsonObject.chequeNumber				= $('#referenceNumber').val();
					}

					jsonObject.paymentValues		= $('#paymentCheckBox').val();
					if(typeof idProofDataObject !== 'undefined'){
						jsonObject.idProofDataObject	= JSON.stringify(idProofDataObject);
					}
					
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to save these Branch Income ?",
						modalWidth 	: 	30,
						title		:	'Branch Income',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					btModalConfirm.on('ok', function() {
						if(!doneTheStuff) {
							doneTheStuff = true;
							getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/insertBranchIncome.do', _this.setResponseAfterIncome, EXECUTE_WITH_ERROR);
							showLayer();
						}	
					});
					
					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
						$("#save").removeClass('hide');
						hideLayer();
					});
				}, setResponseAfterIncome : function(response) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if (response.wayBillIncomeVoucherDetailsId != undefined) {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=branchIncome&branchIncomeVoucherDetailsId=' + response.wayBillIncomeVoucherDetailsId + '&receiptVoucherSequenceNumber=' + response.ReceiptVoucherSequenceNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						
						if(branchIncomePrintFromWS)
							_this.wsBranchIncomePrint(response.wayBillIncomeVoucherDetailsId);
						else
							_this.printBranchIncomeVoucher(response.wayBillIncomeVoucherDetailsId);
					}
					
					hideLayer();
				}, validateDetails() {
					for (var i = 1; i <= noOfIncomeAllowToAdd; i++) {
						if(!validateInputTextFeild(1, 'headId_' + i, 'IncomeExpheadName_' + i, 'error', properIncomeTypeErrMsg)) {
							return false;
						}
						
						if(!validateInputTextFeild(1, 'IncomeExpheadName_' + i, 'IncomeExpheadName_' + i, 'error', incomeTypeErrMsg)) {
							return false;
						}
						
						if(!validateInputTextFeild(1, 'amount_' + i, 'amount_' + i, 'error', iconForErrMsg + ' Enter Amount')) {
							return false;
						}

						if(!validateInputTextFeild(1, 'remark_' + i, 'remark_' + i, 'error', iconForErrMsg + ' Enter Remark')) {
							return false;
						}
						
						if(luggageStorageChargePerQuantityAllowed){
							if($("#headId_"+i).val() == luggageStorageChargesId){
								if(!validateInputTextFeild(1, 'quantity_' + i, 'quantity_' + i, 'error', iconForErrMsg + ' Enter Quantity')) {
									return false;
								}
							}
						}
					}
					
					if (tdsConfiguration.IsPANNumberMandetory && $('#tdsAmount').val() > 0) {
						if(!validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', iconForErrMsg + ' Please Enter Pan Number !')) {
							return false;
						}
						
						if(!validateInputTextFeild(8, 'panNumber', 'panNumber', 'error', iconForErrMsg + ' Please Enter Proper Pan Number !')) {
							return false;
						}
					}
					
					if (tdsConfiguration.IsTANNumberMandetory && $('#tdsAmount').val() > 0) {
						if(!validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', iconForErrMsg + ' Please Enter Tan Number !')) {
							return false;
						}
						
						if(!validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'error', iconForErrMsg + ' Please Enter Proper Tan Number !')) {
							return false;
						}
					}
					
					if(bankPaymentOperationRequired) {
						var paymentType = $('#paymentType').val();
						
						if(!validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', iconForErrMsg + ' Please, Select Payment Type for this income !')) {
							return false;
						}

						if(isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
							var trCount = $("#storedPaymentDetails  tr").length;
							
							if(trCount == 0) {
								showMessage('error', iconForErrMsg + ' Please, Add Payment details for this income !');
								return false;
							}	
						}
					}

					return true;
				}, printBranchIncomeVoucher : function(branchIncomeVoucherDetailsId) {
					window.open('WayBillIncomePrint.do?pageId=52&eventId=9&branchIncomeVoucherDetailsId='+branchIncomeVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, wsBranchIncomePrint : function(branchIncomeVoucherDetailsId) {
					window.open('prints.do?pageId=340&eventId=10&modulename=branchIncomeVoucherPrint&masterid=' + branchIncomeVoucherDetailsId);
				}
			});
		});

function calculateAmount(ele){
	
	var id = ele.id.split("_")[1];
	var chargeMasterId = $('#headId_'+id).val();
	
	if(chargeMasterId == luggageStorageChargesId){
		
		if($('#quantity_'+id).val() > 0){
			var quantity = $('#quantity_'+id).val();
			var ratePerArt = $('#amountPerArt_'+id).val();
			$('#amount_'+id).val(quantity * ratePerArt);
		} else{
			$('#amount_'+id).val(0);
		}
		
	}
	
}

function validateAmount(ele){
	
	if(luggageStorageChargePerQuantityAllowed){
		
		var id = ele.id.split("_")[1];
		
		var chargeMasterId = $('#headId_'+id).val();
		
		if(chargeMasterId == luggageStorageChargesId){
			
			var amount = $('#amount_'+id).val();
			var quantity 	= $('#quantity_'+id).val();
			var ratePerArt 	= $('#amountPerArt_'+id).val();
			
			if(amount < (quantity*ratePerArt)){
				$('#amount_'+id).val(quantity * ratePerArt);
				showMessage('error', iconForErrMsg + ' You can not select Amount Less Than '+ (quantity * ratePerArt) +' !');
			}
			
		}
		
	}
	
}