var PaymentTypeConstant = null;
define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/crossinghisab/crossingHisabSettlementCancellationFilePath.js',
		 'jquerylingua',
		 'language',
		 'selectizewrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 /* PROJECT_IVUIRESOURCES+'/resources/js/module/view/partymaster/partymastersetup.js' */],
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language,  Selectizewrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					 BootstrapModal,Selection/* , PartyMasterSetUp */) {
			'use strict';
			var jsonObject = new Object(), myNod, remarkNod,  _this = '';
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentHisabSettlementCancellationWS/loadCrossingAgentBillDetails.do', _this.setData, EXECUTE_WITH_ERROR); //submit JSON
					return _this;
				}, setData : function(response) {
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/crossingHisab/crossingHisabSettlementCancellation.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						
						loadLanguageWithParams(FilePath.loadLanguage());
						
						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.branch,
							valueField		:	'branchId',
							labelField		:	'branchName',
							searchField		:	'branchName',
							elementId		:	'branchName'
						});
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#billNumber',
							validate: 'presence',
							errorMessage: 'Enter Bill Number !'
						});

						myNod.add({
							selector: '#branchName_wrapper',
							validate: 'validateAutocomplete:#branchName',
							errorMessage: 'Select Proper Branch !'
						});
						
						initialiseFocus()
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind();
						});
					});
				}, onFind : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.billNumber 	= $('#billNumber').val();
					jsonObject.branchId 	= $('#branchName').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentHisabSettlementCancellationWS/getCrossingAgentBillDetailsToCancel.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					removeTableRows('billDetails', 'table');
					_this.setDataInTable(response);
					hideLayer();
				}, setDataInTable : function(data) {
					remarkNod	= nod();
					var columnArray	= new Array();
					var crossingAgentBillClearance	= data.crossingAgentBillClearance;
					
					$("*[data-agent-name='agentName']").html(crossingAgentBillClearance[0].crossingAgentName);
					$("*[data-agent-type='type']").html(crossingAgentBillClearance[0].txnTypeName);
					
					for (var i = 0; i < crossingAgentBillClearance.length; i++) {
						var obj	= crossingAgentBillClearance[i];
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billNumber + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.creationDateTimeString + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.paymentModeString + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.remark + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.statusString + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.grandTotal + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalReceivedAmount + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.balanceAmount + "</td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='remark"+obj.crossingAgentBillId+"' placeholder='Canc. Remark'/>")
						columnArray.push("<td style='text-align: center; vertical-align:middle;'><button type='button' class='btn btn-info' id='"+obj.crossingAgentBillId+"'>Cancel</button></td>");
						$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						
						addElementToCheckEmptyInNode(remarkNod, 'remark' + obj.crossingAgentBillId, 'Enter Cancellation Remark !');
						
						$("#" + obj.crossingAgentBillId).bind("click", function() {
						    _this.cancelInvoice(obj.crossingAgentBillId);
						});
						
						columnArray	= [];
					}
				},cancelInvoice : function(crossingAgentBillId) {
					remarkNod.performCheck(['#remark' + crossingAgentBillId]);
					
					if(!remarkNod.areAll('valid'))
						return false;								
					
					showLayer();
					var jsonObject = new Object();
					jsonObject.crossingAgentBillId 	= crossingAgentBillId;
					jsonObject.cancellationRemark 	= $('#remark' + crossingAgentBillId).val();
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentHisabSettlementCancellationWS/cancelCrossingAgentInvoiceSettlement.do', _this.showResponse, EXECUTE_WITH_ERROR);
				},showResponse : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if (errorMessage.typeName == "success") {	    		  
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							//setTimeout(function(){ location.reload(); }, 3000);
						}
					}
				}
			});
		});