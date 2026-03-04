define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/companywisegstreport/companywisegstreportfilepath.js'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'slickGridWrapper2'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
				 slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod,  _this = '', gridObject, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/companyWiseGstReportWS/getCompanyWiseGstReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},getElementConfigDetails : function(response){
					
					let loadelement = new Array();
					let baseHtml = new $.Deferred();
					let executive	= response.executive;
					
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/companywisegstreport/CompanyWiseGstReport.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
					
						let keyObject = Object.keys(response);
					
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						response.isCalenderSelection					= true;
						response.companyWiseStateAndBranchSelection		= true;
						response.destinationBranchWithStateSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.dateElement		= $('#dateEle');
						elementConfiguration.companyNameElement	= $("#companyNameEle");
						elementConfiguration.srcStateElement	= $("#srcStateEle");
						elementConfiguration.branchElement		= $("#srcBranchEle");
						elementConfiguration.destStateElement	= $("#toStateEle");
						elementConfiguration.destBranchElement	= $("#toBranchEle");

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						
						_this.setGSTPaidBy(response.taxPaidByList);
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						if (executive.executiveType == 1) {
							myNod.add({
								selector: '#companyNameEle',
								validate: 'validateAutocomplete:#companyNameEle_primary_key',
								errorMessage: 'Select Proper Company !'
							});
							
							myNod.add({
								selector: '#srcStateEle',
								validate: 'validateAutocomplete:#srcStateEle_primary_key',
								errorMessage: 'Select Proper Source State !'
							});
							
							myNod.add({
								selector: '#srcBranchEle',
								validate: 'validateAutocomplete:#srcBranchEle_primary_key',
								errorMessage: 'Select Proper Source Branch !'
							});
						}
						
						hideLayer();
						
						$("#saveBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onSubmit();								
						});
					});

				},setReportData : function(response) {
					$("#partyMasterDiv").empty();
					$("#bookedSummaryDiv").empty();
					$("#partyMasterDiv2").empty();
					$("#deliveredSummaryDiv").empty();
					
					if(response.message != undefined) {
						hideLayer();
						$('#middle-border-boxshadow').addClass('hide');
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					if(response.booking != undefined && response.booking.CorporateAccount.length > 0) {
						$('#middle-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.booking);
					} else {
						$('#middle-border-boxshadow').addClass('hide');
					}
					
					if(response.stateWiseBkgGSTSummaryModelArrList != undefined && response.stateWiseBkgGSTSummaryModelArrList.length > 0) {
						$("#bookedSummary").removeClass('hide');
						hideAllMessages();
						$('#bookedSummaryDiv').append(_this.setSummaryDetails(response.stateWiseBkgGSTSummaryModelArrList,"bookedSummary"));
					} else {
						$("#bookedSummary").addClass('hide');
					}
					
					if(response.delivery != undefined && response.delivery.CorporateAccount.length > 0) {
						$('#bottom-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.delivery);
					} else {
						$('#bottom-border-boxshadow').addClass('hide');
					}
					
					if(response.stateWiseDlyGSTSummaryModelArrList != undefined && response.stateWiseDlyGSTSummaryModelArrList.length > 0) {
						$("#deliveredSummary").removeClass('hide');
						hideAllMessages();
						$('#deliveredSummaryDiv').append(_this.setSummaryDetails(response.stateWiseDlyGSTSummaryModelArrList,"deliveredSummary"));
					} else {
						$("#deliveredSummary").addClass('hide');
					}
					
					hideLayer();
				},setSummaryDetails : function(stateWiseGSTSummaryModelArrList,id) {
					
					hideAllMessages();
					
					let table = $('<table class="table-bordered print"/>');
					let totalFreight	= 0.0;
					let totalTaxOn		= 0.0;
					let totalCgst		= 0.0;
					let totalSgstS		= 0.0;
					let totalIgst		= 0.0;
					let totalGst		= 0.0;
					
					for (let i = 0; i < stateWiseGSTSummaryModelArrList.length; i++){

						if(i == 0) {
							let tr 	=  $('<tr style="background-color: lightblue; class="'+id+'"/>'); 
							
							let th1 	=  $('<th/>');
							let th2 	=  $('<th/>');
							let th3 	=  $('<th/>');
							let th4 	=  $('<th/>');
							let th5 	=  $('<th/>');
							let th6 	=  $('<th/>');
							let th7 	=  $('<th/>');
							let th8 	=  $('<th/>');
							
							th1.append("From State");
							th2.append("To State");
							th3.append("Freight");
							th4.append("Tax On");
							th5.append("CGST");
							th6.append("SGST");
							th7.append("IGST");
							th8.append("Total GST");
							
							tr.append(th1);
							tr.append(th2);
							tr.append(th3);
							tr.append(th4);
							tr.append(th5);
							tr.append(th6);
							tr.append(th7);
							tr.append(th8);
							
							table.append(tr);
						} 
							let tr 	=  $('<tr/>'); 

							let td1 	=  $('<td/>');
							let td2 	=  $('<td/>');
							let td3 	=  $('<td/>');
							let td4 	=  $('<td/>');
							let td5 	=  $('<td/>');
							let td6 	=  $('<td/>');
							let td7 	=  $('<td/>');
							let td8 	=  $('<td/>');
							
							td1.append(stateWiseGSTSummaryModelArrList[i].srcStateName);
							td2.append(stateWiseGSTSummaryModelArrList[i].toStateName);
							td3.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].grandTotal) * 100) / 100);
							td4.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].taxOnAmount) * 100) / 100);
							td5.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].cgstAmount) * 100) / 100);
							td6.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].sgstAmount) * 100) / 100);
							td7.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].igstAmount) * 100) / 100);
							td8.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].totalGstAmount) * 100) / 100);
							
							tr.append(td1);
							tr.append(td2);
							tr.append(td3);
							tr.append(td4);
							tr.append(td5);
							tr.append(td6);
							tr.append(td7);
							tr.append(td8);
							
							table.append(tr);
							
							totalFreight	+= stateWiseGSTSummaryModelArrList[i].grandTotal;
							totalTaxOn		+= stateWiseGSTSummaryModelArrList[i].taxOnAmount;
							totalCgst		+= stateWiseGSTSummaryModelArrList[i].cgstAmount;
							totalSgstS		+= stateWiseGSTSummaryModelArrList[i].sgstAmount;
							totalIgst		+= stateWiseGSTSummaryModelArrList[i].igstAmount;
							totalGst		+= stateWiseGSTSummaryModelArrList[i].totalGstAmount;
							
							if(i == (stateWiseGSTSummaryModelArrList.length - 1)) {
								let tr 	=  $('<tr style="background-color: lightblue;"/>');
								
								let th1 	=  $('<th/>');
								let th2 	=  $('<th/>');
								let th3 	=  $('<th/>');
								let th4 	=  $('<th/>');
								let th5 	=  $('<th/>');
								let th6 	=  $('<th/>');
								let th7 	=  $('<th/>');
								let th8 	=  $('<th/>');
								
								th1.append("Total");
								th2.append("");
								th3.append(Math.round(totalFreight));
								th4.append(Math.round(totalTaxOn));
								th5.append(Math.round(totalCgst));
								th6.append(Math.round(totalSgstS));
								th7.append(Math.round(totalIgst));
								th8.append(Math.round(totalGst));
								
								tr.append(th1);
								tr.append(th2);
								tr.append(th3);
								tr.append(th4);
								tr.append(th5);
								tr.append(th6);
								tr.append(th7);
								tr.append(th8);
								
								table.append(tr);
							}
					}
					return table;
				}, setGSTPaidBy : function(taxPaidByList){
					_this.setGSTPaidByAutocompleteInstance();
					
					let autoGSTPaidBy = $("#GSTPaidByEle").getInstance();

					$(autoGSTPaidBy).each(function() {
						this.option.source = taxPaidByList;
					})
				},setGSTPaidByAutocompleteInstance : function() {
					let autoGSTPaidByName 			= new Object();
					autoGSTPaidByName.primary_key 	= 'stPaidByid';
					autoGSTPaidByName.field 		= 'stPaidByName';

					$("#GSTPaidByEle").autocompleteCustom(autoGSTPaidByName)
				},onSubmit : function() {
					showLayer();
					let jsonObject = new Object();
					
					if($("#dateEle").attr('data-startdate') != undefined){
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
					}

					if($("#dateEle").attr('data-enddate') != undefined){
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}

					jsonObject["companyHeadMasterId"] 	= $("#companyNameEle_primary_key").val();
					jsonObject["stateId"] 				= $('#srcStateEle_primary_key').val();
					jsonObject["sourceBranchId"] 		= $('#srcBranchEle_primary_key').val();
					jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
					jsonObject["destinationBranchId"] 	= $('#toBranchEle_primary_key').val();
					jsonObject["GSTPaidBy"] 			= $('#GSTPaidByEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/companyWiseGstReportWS/getCompanyWiseGstReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}
			});
		});
function lrModificationDetails(grid,dataView,row){
	if(dataView.getItem(row).edit) {
		window.open('ViewConfigHamaliLhPVSummary.do?pageId=50&eventId=97&wayBillId='+dataView.getItem(row).wayBillId+'&taxTxnTypeId='+dataView.getItem(row).taxTxnTypeId+'&wayBillNumber='+dataView.getItem(row).wayBillNumber+'', 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		showMessage('info','WayBillNumber '+dataView.getItem(row).wayBillNumber+'  is not Modified !');
	}
}