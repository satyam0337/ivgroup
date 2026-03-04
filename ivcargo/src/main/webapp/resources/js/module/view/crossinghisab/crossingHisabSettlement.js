var PaymentTypeConstantArray		= null;
var moduleId						= null;
var incomeExpenseModuleId			= null;
var ModuleIdentifierConstant		= null;
var	BankPaymentOperationRequired	= false;
var PaymentTypeConstant				= null;	
var PaymentStatusConstants;
var GeneralConfiguration			= null;
var	centralizePaymentModeSelection	= false;
var isAllowMultipleCrossingBillReceiptPrint = false;
var isShowSupplierBillNo 			= false;
var isShowSupplierBillDate 			= false;
let crossingAgentBillClearConfig;
let invoicePrintHyperlinkOnInvoiceNumber = false;
var isTDSAllow					= false;
define(
		[
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/crossinghisab/setBillDetailToClearPayment.js'
			], function() {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', allowBackDate, CROSSING_AGENT_SELECTION = 1, BILL_NUMBER_SELECTION = 2, 
			billSelectionFlag = false, crossingAgentMasterId = 0, allowPaymentClearanceToOtherBranchUser = false, paymentClearanceRegionWise = false;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/loadCrossingAgentBill.do?',_this.renderCrossingAgentBill, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCrossingAgentBill : function(response) {
					PaymentTypeConstantArray		= response.paymentTypeConstants;
					moduleId						= response.moduleId;
					incomeExpenseModuleId			= response.incomeExpenseModuleId;
					ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
					PaymentTypeConstant				= response.PaymentTypeConstant;
					PaymentStatusConstants			= response.paymentStatusConstants;
					GeneralConfiguration			= response.GeneralConfiguration;
					crossingAgentBillClearConfig	= response.CrossingAgentBillClearConfig;
					BankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
					centralizePaymentModeSelection			= crossingAgentBillClearConfig.centralizePaymentModeSelection;
					invoicePrintHyperlinkOnInvoiceNumber	= crossingAgentBillClearConfig.invoicePrintHyperlinkOnInvoiceNumber;
					isShowSupplierBillNo					= crossingAgentBillClearConfig.isShowSupplierBillNo;
					isShowSupplierBillDate					= crossingAgentBillClearConfig.isShowSupplierBillDate;
					isAllowMultipleCrossingBillReceiptPrint = crossingAgentBillClearConfig.isAllowMultipleCrossingBillReceiptPrint;
					allowPaymentClearanceToOtherBranchUser	= crossingAgentBillClearConfig.allowPaymentClearanceToOtherBranchUser;
					paymentClearanceRegionWise				= crossingAgentBillClearConfig.paymentClearanceRegionWise;

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					let paymentHtml	= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					if(BankPaymentOperationRequired)
						loadelement.push(paymentHtml);

					$("#mainContent").load("/ivcargo/html/module/crossingHisab/crossingHisabSettlement.html",
							function() {
						baseHtml.resolve();
					});
					
					if(BankPaymentOperationRequired) {
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
								function() {
								paymentHtml.resolve();
						});
					}

					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						
						if(!allowPaymentClearanceToOtherBranchUser && (response.CrossingAgentDetails == undefined || (response.CrossingAgentDetails).length == 0)) {
							showAlertMessage('info', '<i class="fa fa-info-circle"></i> No Crossing found for Bill Clearing. No records found, please try again. ');
							hideLayer();
							return;
						}

						let crossingAgentAutoComplete 			= new Object();
						crossingAgentAutoComplete.primary_key 	= 'crossingAgentId';
						crossingAgentAutoComplete.url 			= response.CrossingAgentDetails;
						crossingAgentAutoComplete.field 		= 'name';
						$("#crossingAgent").autocompleteCustom(crossingAgentAutoComplete);

						let txnTypeAutoComplete 			= new Object();
						txnTypeAutoComplete.primary_key 	= 'txnTypeId';
						txnTypeAutoComplete.url 			= response.txnTypeArr;
						txnTypeAutoComplete.field 			= 'txnTypeName';
						$("#crossingAgentType").autocompleteCustom(txnTypeAutoComplete);

						let branchAutoComplete 				= new Object();
						branchAutoComplete.primary_key 		= 'branchId';
						branchAutoComplete.field 			= 'branchName';
						branchAutoComplete.url 				= response.branchList;
						$("#branchEle").autocompleteCustom(branchAutoComplete);

						myNod = nod();

						if (allowPaymentClearanceToOtherBranchUser) {
							$(".searchBy").removeClass('hide');
							let options = [
								{ optionId: 1, optionName: "Crossing Agent Wise" },
								{ optionId: 2, optionName: "Bill Number Wise" }
							];
							
							if(response.CrossingAgentDetails == undefined || (response.CrossingAgentDetails).length == 0)
	        					options = options.filter(option => option.optionId !== 1);
							
							let optionAutoComplete = {
								primary_key: 'optionId',
								field: 'optionName',
								url: options,
								callBack : searchVisibility
							};

							$("#searchByOption").autocompleteCustom(optionAutoComplete);
						} else {
							$(".crossingAgentDiv, .typeidDiv").removeClass('hide');
						}
						
						myNod.configure({
							parentClass:'validation-message'
						});
						

						function searchVisibility() {
							let value = $('#searchByOption_primary_key').val();
							
							const elements = {
								billNumberDiv: $(".billNumberDiv"),
								crossingAgentDiv: $(".crossingAgentDiv"),
								typeidDiv: $(".typeidDiv"),
								branch: $(".branch")
							};

							elements.billNumberDiv.addClass('hide');
							elements.crossingAgentDiv.addClass('hide');
							elements.typeidDiv.addClass('hide');
							elements.branch.addClass('hide');

							if (value == CROSSING_AGENT_SELECTION) {
								elements.typeidDiv.removeClass('hide');
								elements.crossingAgentDiv.removeClass('hide');
								$("#branchEle_primary_key").val('');
								$("#branchEle").val('');
								$('#crossingAgent').val('');
								$('#crossingAgent_primary_key').val('');
								billSelectionFlag = false;
								$("#billNumberEle").val('');
								
								addAutocompleteElementInNode(myNod, 'crossingAgent', 'Select Crossing Agent !');
								removeElementFromCheckEmptyInNode(myNod,'branchEle')
							} else if (value == BILL_NUMBER_SELECTION) {
								elements.billNumberDiv.removeClass('hide');
								elements.typeidDiv.removeClass('hide');
								elements.branch.removeClass('hide');
								billSelectionFlag = true;
								$('#crossingAgent').val('');
								$('#crossingAgent_primary_key').val('');
								addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
								removeElementFromCheckEmptyInNode(myNod,'crossingAgent')
							}
						}
						
						addAutocompleteElementInNode(myNod, 'crossingAgentType', 'Select Type !');
						
						hideLayer();

						if(BankPaymentOperationRequired) {
							$("#viewPaymentDetails").css("display", "block");
							$("#viewPaymentDetails").removeClass('hide');
						}
						
						if(BankPaymentOperationRequired) {
							$("#viewPaymentDetails").click(function() {
								openAddedPaymentTypeModel();
							});
							
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
						}
						
						if(centralizePaymentModeSelection) 
							$('#paymentTypeDiv').show(); 

						if(isShowSupplierBillNo)
							$('#supplierBillNo').show(); 

						if(isShowSupplierBillDate)
							$('#supplierBillDate').show(); 
						
						if(!BankPaymentOperationRequired)
							$('#viewPaymentDetails').remove();

						$("#findBtn").click(function() {
							myNod.performCheck()

							if (billSelectionFlag && !validateInputTextFeild(1, 'billNumberEle', 'billNumberEle', 'error', billNumberErrMsg))
								return false;

							if(myNod.areAll('valid'))
								_this.onFind();								
						});

						$(".saveBtn").click(function() {
							_this.createBill();
						});
					});
				}, onFind : function() {
					showLayer();
					
					if ($('#crossingAgent_primary_key').val() == 0)
						$('#crossingAgent_primary_key').val(crossingAgentMasterId);

					let jsonObject = new Object();

					jsonObject["crossingAgentId"] 	= $('#crossingAgent_primary_key').val();
					jsonObject["txnTypeId"] 		= $('#crossingAgentType_primary_key').val();
					jsonObject["allowPaymentClearanceToOtherBranchUser"] = allowPaymentClearanceToOtherBranchUser;
					jsonObject["paymentClearanceRegionWise"] = paymentClearanceRegionWise;
					
					if(billSelectionFlag)
						jsonObject["billNumber"] 		= $('#billNumberEle').val().trim();
					
					jsonObject["branchId"] 			= $("#branchEle_primary_key").val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/getCrossingAgentBillDetails.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, setBillDetailsData : function(response) {
					hideLayer();
					
					if (response.message != undefined) {
						if(!billSelectionFlag)
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					if($('#billIdford_' + response.billId).exists()) {
						showAlertMessage('error', "Bill Number Already Added !");
						return;
					}

					if(billSelectionFlag)
						crossingAgentMasterId = response.crossingAgentMaster.crossingAgentMasterId;
					else {
						removeTableRows('billDetails', 'table');
						removeTableRows('grandTotalRow', 'table');
					}
					
					if(response.BillDetailsForBillClearance != undefined) {
						$('#bottom-border-boxshadow').show();
						$('#crossingBillReceiptslist tbody tr').remove();
						$('#middle-border-boxshadow').addClass('hide');
						enableButtons();
						response.allowRoundOffAmount = crossingAgentBillClearConfig.allowRoundOffAmount;
						setBillDetailsData(response);
					}
					
					_this.setBackDate(response);

					hideLayer();
				}, setBackDate : function(response) {
					let currentDate					= response.currentDate;
					let previousDate				= response.previousDate;
						allowBackDate				= response.allowBackDate;
					let noOfDays					= response.noOfDays;
					
					if(allowBackDate) {
						$( function() {
							$('#backDate').val(dateWithDateFormatForCalender(new Date(),"-"));
							$('#backDate').datepicker({
								maxDate		: currentDate,
								minDate		: previousDate,
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						} );

						$( "#backDate" ).val(currentDate);
						$( "#backDate" ).prop("readonly", true);
						$('#backdatemessage').html('<b>Back Date only allow till ' + noOfDays + ' days before ! Back Date cannot be less than Minimum Bill Date !</b>');
					} else {
						$('#backdatemessagemarquee').remove();
						$('.backDate').remove();
					}
				}, createBill : function() {
					let isAllowFlag				= false;
					let billDetailsListSize		= $('#billDetails tr').length;

					for (let i = 1; i <= billDetailsListSize; i++) {
						if(parseInt($('#receiveAmt_' + parseInt(i)).val()) > 0) {
							if(!formValidation(document.getElementById('receiveAmt_' + parseInt(i))))
								return false;
							
							if($('#paymentStatus_'+ parseInt(i)).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
								&&!validateDiscountLimit(discountInPercent, parseInt(($('#grandTotal_'+ parseInt(i)).val() - $('#receivedAmt_'+ parseInt(i)).val())) , parseInt($('#balanceAmt_' + parseInt(i)).val()), $('#receiveAmt_' + parseInt(i))))
								return false;

							isAllowFlag	= true;
						} else if(parseInt($('#receiveAmt_' + parseInt(i)).val()) < 0
								&& parseInt($('#grandTotal_' + parseInt(i)).val()) < 0) {
							if(!formValidation(document.getElementById('receiveAmt_' + parseInt(i))))
								return false;

							isAllowFlag	= true;
						}
					}
					
					if(!isAllowFlag) {
						showMessage('error', billAmountForReceiveErrMsg);
						return false;
					}
					
					disableButtons();
					
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to clear these Bills ?",
						modalWidth 	: 	30,
						title		:	'Crossing Hisab Payment',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						let totalBillArr		= new Array();

						for(let i = 1; i <= billDetailsListSize; i++) {
							let receiveAmt			= $('#receiveAmt_' + i).val();

							if(receiveAmt > 0) {
								let billData				= new Object();

								billData.crossingAgentBillId	= $('#billId_' + i).val();
								billData.billNumber				= $('#billNumber_' + i).val();
								billData.crossingAgentId		= $('#creditorId_' + i).val();
								billData.grandTotal				= $('#grandTotal_' + i).val();
								billData.totalReceivedAmount	= receiveAmt;
								billData.balanceAmount			= $('#balanceAmt_' + i).val();
								billData.paymentType			= $('#paymentStatus_' + i).val();
								billData.paymentMode			= $('#paymentMode_' + i).val();
								billData.chequeDate				= $('#chequeDate_' + i).val();
								billData.chequeNumber			= $('#chequeNumber_' + i).val();
								billData.remark					= $('#remark_' + i).val();
								billData.billDate				= $('#billDate_' + i).html();
								billData.txnTypeId				= $('#crossingAgentType_primary_key').val();
								billData.tdsAmount				= $('#tdsAmt_' + i).val();

								totalBillArr.push(billData);
							}
						}

						let jsonObjectData		= new Object();

						jsonObjectData.BillDataArr		= JSON.stringify(totalBillArr);

						let rowCount 		= $('#storedPaymentDetails tr').length;

						if($('#paymentCheckBox').exists() && rowCount > 0)
							jsonObjectData.paymentValues	= getAllCheckBoxSelectValue('paymentCheckBox').join(',');
						
						if(allowBackDate)
							jsonObjectData.createDate		= $('#backDate').val();

						getJSON(jsonObjectData, WEB_SERVICE_URL + '/crossingAgentBillWS/clearCrossingAgentBill.do', _this.getResponseData, EXECUTE_WITH_ERROR);
						$('#billNumberEle').val('');
						showLayer();
					});
					
					btModalConfirm.on('cancel', function() {
						enableButtons();
						hideLayer();
					});
				}, getResponseData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showAlertMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						enableButtons();
						
						if(errorMessage.typeName == 'success') {
							$('#storedPaymentDetails tr').remove();
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							$('#billDetails').empty();
						}
						
						let crossingBillReceiptslist	= response.crossingBillReceiptslist;
						
						let columnArray			= new Array();
						
						if(crossingBillReceiptslist != undefined) {
							$('#crossingBillReceiptslist tbody tr').remove();
							$('#middle-border-boxshadow').removeClass('hide');
							
							let billReceiptIds = null;
							let billReceiptIdsArr  	= [];
							
							if(isAllowMultipleCrossingBillReceiptPrint){
								for(const element of crossingBillReceiptslist) {
									billReceiptIdsArr.push(element.crossingBillReceiptId);
								}
								
								billReceiptIds 			= billReceiptIdsArr.join(',');
							}
							
							for(let i = 0; i < crossingBillReceiptslist.length; i++) {
								let obj	= crossingBillReceiptslist[i];
								let receivedAmount	= obj.receivedAmount;
								
								if(receivedAmount < 0)
									receivedAmount	= -receivedAmount;
								
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");						
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.receiptNumber + "</td>");						
								columnArray.push("<td style='text-align: center; vertical-align: middle;'  id='crossingAgentBillId_" + obj.crossingAgentBillId + "'>" + obj.billNumber + "</td>");						
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + receivedAmount + "</td>");	
								
								if(!isAllowMultipleCrossingBillReceiptPrint)	
									columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' id='print_" + obj.crossingBillReceiptId + "_"+ obj.crossingAgentBillId + "' class='btn btn-primary'>Print</button></td>");
								
								$('#crossingBillReceiptslist tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
									
								if(!isAllowMultipleCrossingBillReceiptPrint)	{
									$('.printInvoice').removeClass('hide');
									$('.print_All').remove();
									
									$("#print_" + obj.crossingBillReceiptId + "_"+ obj.crossingAgentBillId).bind("click", function() {
										let elementId				= $(this).attr('id');
										let	crossingBillReceiptIds	= elementId.split('_')[1];
										_this.printBillReceipt(crossingBillReceiptIds);
									});	
								}
								
								columnArray	= [];
							}
							
							if(isAllowMultipleCrossingBillReceiptPrint)	{
								$('.printInvoice').remove();
								$('.print_All').removeClass('hide');
									
								$(".print_All").bind("click", function() {
									_this.printBillReceipt(billReceiptIds);
								});
							}
						}
					}

					hideLayer();
				}, printBillReceipt : function(crossingBillReceiptIds) {
					if(isAllowMultipleCrossingBillReceiptPrint) {
						localStorage.setItem('crossingBillReceiptIds', crossingBillReceiptIds);
						window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=crossingBillReceiptMultiplePrintData', 'newwindow', 'config=height=810,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=yes');
					} else
						window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=crossingBillReceiptPrint&crossingBillReceiptId='+crossingBillReceiptIds, 'newwindow', 'config=height=810,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=yes');
				}
			});
		});