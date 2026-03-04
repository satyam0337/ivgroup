var PaymentTypeConstant = null;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditpayment/wayBillCreditPaymentCancellationFilePath.js',
			'jquerylingua',
			'language',
			'selectizewrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, Selectizewrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal/* , PartyMasterSetUp */) {
			'use strict';
			var jsonObject = new Object(), myNod, remarkNod, corporateAccountId = 0,  _this = '', txnType = 0;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},
				render : function() {
					showLayer();

					var jsonObject = new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/creditpayment/WayBillCreditPaymentCancellation.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						hideLayer();
						
						$("#wayBillNumber").focus();
						
						$("#wayBillNumber").keydown(function() {
							if(event.which == 13) {
								return false;
							}
						});
						
						$('#txnType').change(function(){
							txnType	= $('#txnType').val();
						});
						
						loadLanguageWithParams(FilePath.loadLanguage());
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#wayBillNumber',
							validate: 'presence',
							errorMessage: 'Enter Way Bill Number !'
						});

						myNod.add({
							selector: '#txnType',
							validate: 'presence',
							errorMessage: 'Select Txn Type !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								if(txnType > 0) {
									_this.onFind();
								} else {
									showMessage('error', 'Please Select Txn Type !');
									changeTextFieldColor('txnType', '', '', 'red');
									return false;
								}
							}
						});
					});
				},onFind : function() {
					showLayer();
					var jsonObject = new Object();
					jsonObject.wayBillNumber 	= $('#wayBillNumber').val().trim();
					jsonObject.txnTypeId		= $('#txnType').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillCreditPaymentCancellationWS/getWayBillCreditPaymentDetailsToCancel.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' +  errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					showPartOfPage('bottom-border-boxshadow');
					removeTableRows('billDetails', 'table');
					_this.setDataInTable(response);
					hideLayer();
				},setDataInTable : function(data) {
					remarkNod						= nod();
					var columnArray					= new Array();
					var wayBillCreditPaymentList	= data.wayBillCreditPaymentList;

					for (var i=0; i<wayBillCreditPaymentList.length; i++) {
						var obj	= wayBillCreditPaymentList[i];
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.receivedDateTimeStr + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.remark + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.grandTotal + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.receivedAmount + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.receivedByExecutiveName + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.paymentStatusName + "</td>");											
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='remark"+obj.creditWayBillTxnSummaryId+"' placeholder='Canc. Remark'/> <input  type='hidden' value='"+obj.creditWayBillTxnId+"' id='creditWayBillTxnId"+obj.creditWayBillTxnSummaryId+"'/>")
						columnArray.push("<td style='text-align: center; vertical-align:middle;'><button type='button' class='btn btn-info' id='"+obj.creditWayBillTxnSummaryId+"'>Cancel</button></td>");
						$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						remarkNod.add({
							selector: '#remark'+obj.crossingAgentBillId,
							validate: 'presence',
							errorMessage: 'Enter Cancellation Remark !'
						});

						$("#"+obj.creditWayBillTxnSummaryId).bind("click", function(){
							var elementId						= $(this).attr('id');
							var creditWayBillTxnSummaryId		= elementId.split('_')[0];
							_this.cancelPayment(creditWayBillTxnSummaryId);
						});
						columnArray	= [];
					}
				},cancelPayment : function(creditWayBillTxnSummaryId) {
					remarkNod.performCheck(['#remark' + creditWayBillTxnSummaryId]);

					if(!remarkNod.areAll('valid')){
						return false;								
					}

					showLayer();

					var jsonObject = new Object();
					jsonObject.creditWayBillTxnSummaryId 	= creditWayBillTxnSummaryId;
					jsonObject.creditWayBillTxnId 			= $('#creditWayBillTxnId' + creditWayBillTxnSummaryId).val();
					jsonObject.cancellationRemark 			= $('#remark' + creditWayBillTxnSummaryId).val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillCreditPaymentCancellationWS/cancelWayBillCreditPayment.do', _this.showResponse, EXECUTE_WITH_ERROR);
				},showResponse : function(response) {
					hideLayer();
					
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if (errorMessage.typeName == "success") {	    		  
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					}
				}
			});
		});