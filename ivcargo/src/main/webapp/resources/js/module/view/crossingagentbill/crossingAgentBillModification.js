var PaymentTypeConstant = null;
define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/crossingagentbill/crossingAgentBillModificationFilePath.js',
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
			var jsonObject = new Object(), myNod, advAmtNod, billData, _this = '',doneTheStuff = false,modal;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				},
				render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/loadCrossingAgentBillDetailsModification.do', _this.setData, EXECUTE_WITH_ERROR); //submit JSON
					return _this;
				},
				setData : function(response) {
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/crossingagentbill/crossingAgentBillModification.html",
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
						
						advAmtNod	= nod();
						advAmtNod.configure({
							parentClass:'validation-message'
						});
						advAmtNod.add({
							selector: '#additionalAdvanceEle',
							validate: 'presence',
							errorMessage: 'Enter Proper Amount !'
						});
						advAmtNod.add({
							selector: '#additionalAdvanceEle',
							validate: 'integer',
							errorMessage: 'Enter Proper Amount !'
						});
						initialiseFocus()
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onFind();
							}
						});
						
						$('#updateBtn').bind("click", function(){
					    	_this.updateAdditionalAdvance();
						});
					});
					
				}, onFind : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.billNumber 	= $('#billNumber').val();
					jsonObject.branchId 	= $('#branchName').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/getCrossingAgentBillDetailsByNumberAndBranch.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					removeTableRows('billDetails', 'table');
					_this.setDataInTable(response);
					hideLayer();
				},setDataInTable : function(data) {
					var columnArray	= new Array();
					var crossingAgentBill	= data.CrossingAgentBill;
					
					$("*[data-agent-name='agentName']").html(crossingAgentBill[0].crossingAgentName);
					$("*[data-agent-type='type']").html(crossingAgentBill[0].txnTypeName);
					
					for (var i=0; i<crossingAgentBill.length; i++) {
						var obj	= crossingAgentBill[i];
						billData	= obj;
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.billNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.creationDateTimeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.remark + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.paidAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.topayAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.crossingHire + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.netAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.localTempoBhada + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.doorDelivery + "</td>");
						columnArray.push("<td id='td"+obj.crossingAgentBillId+"'style='text-align: center; vertical-align: middle;'>" + obj.additionalAdvance + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align:middle;'><button type='button' class='btn btn-info' id='"+obj.crossingAgentBillId+"'>Add&nbsp;Adv.</button></td>");
						$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						
						$("#"+obj.crossingAgentBillId).bind("click", function(){
						    _this.addAdditionalAdvance();
						});
						
						columnArray	= [];
					}
				},addAdditionalAdvance : function() {
					$('#billNumberEle').val(billData.billNumber);
					$('#netAmountEle').val(billData.netAmount);
					$('#additionalAdvanceEleHidden').val(billData.additionalAdvance);
					$('#additionalAdvanceEle').val(billData.additionalAdvance);
					modal = document.getElementById('editAdditionalDiscount');
					var span = document.getElementsByClassName("close")[0];
					modal.style.display = "block";
					$('#updateBtn').prop('disabled', true);
					
					span.onclick = function() {
						modal.style.display = "none";
					}
					
					window.onclick = function(event) {
					   if (event.target == modal) {
					        modal.style.display = "none";
					    }
					}
					
					$('#additionalAdvanceEle').bind('keyup', function(){
						_this.enableButton();
					});
				},enableButton : function() {
					if ($("#additionalAdvanceEleHidden").val() == $( "#additionalAdvanceEle" ).val()) {
						$('#updateBtn').prop('disabled', true);
					} else {
						$('#updateBtn').prop('disabled', false);
					}
				},updateAdditionalAdvance : function() {
					advAmtNod.performCheck();
				
					if(!advAmtNod.areAll('valid')){
						return false;
					}
				
					showLayer();
				
					var jsonObject = new Object();
				
					jsonObject.crossingAgentBillId		= billData.crossingAgentBillId;
					jsonObject.additionalAdvance		= $( "#additionalAdvanceEle" ).val();
					jsonObject.txnTypeId				= billData.txnTypeId;
					jsonObject.paidAmount				= billData.paidAmount;
					jsonObject.toPayAmount				= billData.topayAmount;
					jsonObject.crossingHire				= billData.crossingHire;
					jsonObject.localTempoBhada			= billData.localTempoBhada;
					jsonObject.doorDelivery				= billData.doorDelivery;
					jsonObject.netAmount				= billData.netAmount;
				
					if(!doneTheStuff) {	
						getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/updateCrossingAgentBillAdditionalAdvanceAmount.do', _this.showResponse, EXECUTE_WITH_ERROR);
						doneTheStuff = true;
					}
				},showResponse : function(response) {
					hideLayer();
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if (errorMessage.typeName == "success") {	    		  
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							modal.style.display = "none";
							doneTheStuff = false;
							_this.onFind();
							//setTimeout(function(){ location.reload(); }, 3000);
						}
					}
				}
			});
		});