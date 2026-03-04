var PaymentTypeConstant = null;
var billClearanceList	= null;
var PAYMENT_TYPE_STATUS_NEGOTIATED_ID	= 4;
var PAYMENT_TYPE_STATUS_BAD_DEBT_ID		= 7;
var sequenceWiseCancelBadDepthAndNegotiateBill	= false;
define(
		[
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
			function(JsonUtility, MessageUtility, Lingua, Language, BootstrapSwitch, NodValidation, FocusNavigation,
					Selection, BootstrapModal) {
			'use strict';
			var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '';
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/billClearanceWS/loadBillPaymentDetailsForCancellation.do?',	_this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/creditorInvoice/invoicePaymentCancellation.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						hideLayer();
						
						$("#billNumberEle").focus();

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						sequenceWiseCancelBadDepthAndNegotiateBill	= response.sequenceWiseCancelBadDepthAndNegotiateBill;
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector	: '#billNumberEle',
							validate	: 'presence',
							errorMessage: 'Enter Bill Number !'
						});

						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(0);
							}
						});
					});
				},onFind : function(billBillId) {
					showLayer();
					var jsonObject = new Object();
					
					var BillNumber				= $('#billNumberEle').val();

					jsonObject.billId			= billBillId;
					jsonObject.billNumber		= BillNumber.replace(/\s+/g, "");
					jsonObject.sourceBranchId	= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/billClearanceWS/getBillPaymentDetailsForCancellation.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					showPartOfPage('middle-border-boxshadow');
					removeTableRows('billDetails', 'tbody');
					removeTableRows('reportTable', 'tbody');
					removeTableRows('reportTable', 'tfoot');
					_this.setDataInTable(response);
				},setDataInTable : function(data) {
					var columnArray			= new Array();
					var bill				= data.bill;
					
					if(bill != undefined) {
						for (var i = 0; i < bill.length; i++) {
							var obj	= bill[i];
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
							
							if(bill.length > 1) {
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='billNumber_" + obj.billBillId + "'>" + obj.billBillNumber + "</a></td>");
							} else {
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billBillNumber + "</td>");
							}
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billCreditorName + "</td>");						
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billCreationDateString + "</td>");						
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billGrandTotal + "</td>");
							
							$('#billDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
							
							columnArray	= [];
							
							if(bill.length > 1) {
								$("#billNumber_" + obj.billBillId).bind("click", function() {
									var elementId		= $(this).attr('id');
									var billBillId		= elementId.split('_')[1];
									_this.onFind(billBillId);
								});
							}
						}
						
						if(bill.length > 1) {
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							return;
						}
					} else {
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
					}
					
					showPartOfPage('bottom-border-boxshadow');
					
					billClearanceList	= data.billClearanceList;
					var totalReceivedAmt	= 0;
					var grandTotal			= 0;

					for (var i = 0; i < billClearanceList.length; i++) {
						var obj	= billClearanceList[i];
						
						totalReceivedAmt	+= obj.billClearanceTotalReceivedAmount;
						grandTotal			= obj.billClearanceGrandTotal;
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						/*columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceBillNumber + "</td>");*/						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceCreationDateTimeStampString + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceBranchName + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceRemark + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceGrandTotal + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceTotalReceivedAmount + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceExecutiveName + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearancePaymentModeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billClearanceStatusName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='remark" + obj.billClearanceId + "' placeholder='Canc. Remark'/> <input  type='hidden' value='" + obj.billClearanceId + "' id='billClearanceId" + obj.billClearanceId + "'/>")
						columnArray.push("<td style='text-align: center; vertical-align:middle;'><button type='button' class='btn btn-danger' id='cancel_" + obj.billClearanceId + "'>Cancel</button></td>");
						$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						$("#cancel_" + obj.billClearanceId).bind("click", function() {
							var elementId			= $(this).attr('id');
							var billClearanceId		= elementId.split('_')[1];
							_this.cancelPayment(billClearanceId);
						});
						
						columnArray	= [];
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan='4'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + totalReceivedAmt + "</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan='5'></td>");
					$('#reportTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}, cancelPayment : function(billClearanceId) {
					
					if(sequenceWiseCancelBadDepthAndNegotiateBill && billClearanceList != null && billClearanceList != undefined){
						for (var i = 0; i < billClearanceList.length; i++) {
							var obj	= billClearanceList[i];
							if(obj.billClearanceStatus	== PAYMENT_TYPE_STATUS_NEGOTIATED_ID && obj.billClearanceId != billClearanceId){
								showMessage('error', iconForErrMsg + ' Please Cancel Negotiate Bill First !');
								return false;
							} else if(obj.billClearanceStatus == PAYMENT_TYPE_STATUS_BAD_DEBT_ID && obj.billClearanceId != billClearanceId){
								showMessage('error', iconForErrMsg + ' Please Cancel Bad Depth Bill First  !');
								return false;
							}
						}
					}
					
					if($('#remark' + billClearanceId).val() ==  '') {
						showAlertMessage('error', iconForErrMsg + ' Enter Cancellation Remark !');
						return false;
					}

					showLayer();

					var jsonObject = new Object();
					
					jsonObject.billClearanceId 		= billClearanceId;
					jsonObject.remark			 	= $('#remark' + billClearanceId).val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/billClearanceWS/cancelInvoicePayment.do', _this.showResponse, EXECUTE_WITH_ERROR);
				},showResponse : function(response) {
					hideLayer();
					
					var errorMessage = response.message;
					
					if (errorMessage.typeName == "success")
						_this.onFind(0);
				}
			});
		});