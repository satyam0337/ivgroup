define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/gstreport/gstreportfilepath.js'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/gstreport/gstReportHandle.js'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'slickGridWrapper2'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
				 slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation) {
			'use strict';
			var jsonObject = new Object(), myNod,  _this = '', gridObject, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet,isStateWiseFlaver,showbillingPartyGSTNInTBBLR,showCrosingHireAmountInSummaryTable,freightAmountInTaxOnColumn,allowDynamicWhereClauseLogic,displayWithBillLr,
			showWithAndWithoutTransporterData,gstPaidByHM,showDownloadtoExcel,allowDownloadExcelForUpdateGstStatus = false, downloadExcelForGstStatusUpdate = false;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/gstReportWS/gstTaxReportElement.do?',	_this.renderServicetaxElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderServicetaxElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					var executive	= response.executive;
					isStateWiseFlaver = response.isStateWiseFlaver;
					freightAmountInTaxOnColumn = response.freightAmountInTaxOnColumn;
					showbillingPartyGSTNInTBBLR = response.showbillingPartyGSTNInTBBLR;
					showCrosingHireAmountInSummaryTable = response.showCrosingHireAmountInSummaryTable;
					allowDynamicWhereClauseLogic = response.allowDynamicWhereClauseLogic;
					displayWithBillLr= response.displayWithBillLr
					gstPaidByHM	= response.gstPaidByHM;
					showDownloadtoExcel	= response.showDownloadtoExcel
					allowDownloadExcelForUpdateGstStatus	= response.allowDownloadExcelForUpdateGstStatus;
					showWithAndWithoutTransporterData		= response.showWithAndWithoutTransporterData;
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/gstreport/GstReport.html",function() {
						baseHtml.resolve();
					});
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]]) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
							}
						}
						var options		= new Object();

						options.monthLimit	= response.months;
						$("#dateEle").DatePickerCus(options);
						var regionAutoComplete = new Object();
						regionAutoComplete.primary_key = 'regionId';
						regionAutoComplete.callBack = _this.onRegionSelect;
						regionAutoComplete.field = 'regionName';
						
						$("#regionEle").autocompleteCustom(regionAutoComplete);
						if (executive.executiveType == 1) {
							var autoRegionName = $("#regionEle").getInstance();
							$(autoRegionName).each(function() {
								this.option.source = response.regionList;
							});
						}
						var stateAutoComplete = new Object();
						stateAutoComplete.primary_key = 'stateId';
						stateAutoComplete.callBack = _this.onStateSelect;
						stateAutoComplete.field = 'stateName';
						$("#stateEle").autocompleteCustom(stateAutoComplete);
						var autoStateName = $("#stateEle").getInstance();
						$(autoStateName).each(function() {
							this.option.source = response.stateList;
						});
						
//						toStateEle

						var toStateAutoComplete = new Object();
						toStateAutoComplete.primary_key = 'stateId';
						toStateAutoComplete.callBack = _this.onToStateSelect;
						toStateAutoComplete.field = 'stateName';
						$("#toStateEle").autocompleteCustom(toStateAutoComplete);
						var toAutoStateName = $("#toStateEle").getInstance();
						$(toAutoStateName).each(function() {
							this.option.source = response.stateList;
						});
						
						var subRegionAutoComplete = new Object();
						subRegionAutoComplete.primary_key = 'subRegionId';
						subRegionAutoComplete.callBack = _this.onSubRegionSelect;
						subRegionAutoComplete.field = 'subRegionName';
						$("#subRegionEle").autocompleteCustom(subRegionAutoComplete);
						var branchAutoComplete = new Object();
						branchAutoComplete.primary_key = 'branchId';
						branchAutoComplete.field = 'branchName';
						$("#branchEle").autocompleteCustom(branchAutoComplete);
						
						var toBranchAutoComplete = new Object();
						toBranchAutoComplete.primary_key = 'branchId';
						toBranchAutoComplete.field = 'branchName';
						$("#toBranchEle").autocompleteCustom(toBranchAutoComplete);
						
						_this.setGSTPaidBy();
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						if(isStateWiseFlaver){
							myNod.add({
								selector: '#stateEle',
								validate: 'validateAutocomplete:#stateEle_primary_key',
								errorMessage: 'Select proper State !'
							});
						}else{
							myNod.add({
							selector: '#regionEle',
							validate: 'validateAutocomplete:#regionEle_primary_key',
							errorMessage: 'Select proper Region !'
						});

						myNod.add({
							selector: '#subRegionEle',
							validate: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage: 'Select proper Area !'
						});
						}
						
						myNod.add({
							selector: '#branchEle',
							validate: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage: 'Select proper Branch !'
						});
						if (executive.executiveType == 6) {
							$("#regionEle_primary_key").val(executive.regionId);
							var autoSubRegionName = $("#subRegionEle").getInstance();

							$(autoSubRegionName).each(function() {
								this.option.source = response.subRegionList;
							});
						}
						if (executive.executiveType == 7) {
							$("#regionEle_primary_key").val(executive.regionId);
							$("#subRegionEle_primary_key").val(executive.subRegionId);
							var autoBranchName = $("#branchEle").getInstance();

							$(autoBranchName).each(function() {
								this.option.source = response.branchList;
							})
						}
						if (executive.executiveType == 3) {
							$("#regionEle_primary_key").val(executive.regionId);
							$("#subRegionEle_primary_key").val(executive.subRegionId);
							$("#branchEle_primary_key").val(executive.branchId);
						}
						if(showDownloadtoExcel == true || showDownloadtoExcel == 'true'){
							$('#downloadtoExcelBtn').css('display','inline')
						}else{
							$('#downloadtoExcelBtn').css('display','none')
						}
						
						if(allowDownloadExcelForUpdateGstStatus)
							$('#gstStatusdownloadtoExcelBtn').removeClass('hide');
						else
							$('#gstStatusdownloadtoExcelBtn').remove();
						
						hideLayer();
						
						$("#downloadtoExcelBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onExcelBtn(_this);								
							}
						});
						
						$("#gstStatusdownloadtoExcelBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								downloadExcelForGstStatusUpdate = true;
								_this.onExcelBtn(_this);								
							}
						});
						
						$("#saveBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onSubmit(_this);								
							}
						});
					});

				},setReportData : function(response) {
					$("#partyMasterDiv").empty();
					$("#bookedSummaryDiv").empty();
					$("#partyMasterDiv2").empty();
					$("#deliveredSummaryDiv").empty();
					
					if(response.message != undefined){
						hideLayer();
						$('#middle-border-boxshadow').hide();
						$('#btnprint_viewPartyMaster').hide();
						$("#bookedSummary").hide();
						$("#bookedSummaryDiv").hide();
						$('#bottom-border-boxshadow').hide();
						$('#btnprint_viewPartyMaster2').hide();
						$("#deliveredSummary").hide();
						$("#deliveredSummaryDiv").hide();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}
					var bookingColumnConfig		= response.booking.columnConfiguration;
					var bookingKeys		= _.keys(bookingColumnConfig);
					var bcolConfig	= new Object();
					for (var i=0; i<bookingKeys.length; i++) {
						var bObj	= bookingColumnConfig[bookingKeys[i]];
						if (bObj.show == true) {
							bcolConfig[bookingKeys[i]]	= bObj;
						}
					}
					response.booking.columnConfiguration	= bcolConfig;
					
					var deliveryColumnConfig	= response.delivery.columnConfiguration;
					var deliveryKeys	= _.keys(deliveryColumnConfig);
					var dcolConfig	= new Object();
					for (var i=0; i<deliveryKeys.length; i++) {
						var dObj	= deliveryColumnConfig[deliveryKeys[i]];
						if (dObj.show == true) {
							dcolConfig[deliveryKeys[i]]	= dObj;
						}
					}
					response.delivery.columnConfiguration	= dcolConfig;
					
					response.booking.Language	= masterLangKeySet;
					response.delivery.Language	= masterLangKeySet;
					
					if(response.booking.CorporateAccount != undefined && response.booking.CorporateAccount.length > 0) {
						$('#middle-border-boxshadow').show();
						$('#btnprint_viewPartyMaster').show();
						gridObject = slickGridWrapper2.setGrid(response.booking);
					} else {
						$('#middle-border-boxshadow').hide();
						$('#btnprint_viewPartyMaster').hide();
					}
					
					if(response.stateWiseBkgGSTSummaryModelArrList != undefined && response.stateWiseBkgGSTSummaryModelArrList.length > 0) {
						$("#bookedSummary").show();
						$("#bookedSummaryDiv").show();
						hideAllMessages();
						$('#bookedSummaryDiv').append(_this.setSummaryDetails(response.stateWiseBkgGSTSummaryModelArrList,"bookedSummary"));
						
					} else {
						$("#bookedSummary").hide();
						$("#bookedSummaryDiv").hide();
					}
					
					if(response.delivery.CorporateAccount != undefined && response.delivery.CorporateAccount.length > 0) {
						$('#bottom-border-boxshadow').show();
						$('#btnprint_viewPartyMaster2').show();
						gridObject = slickGridWrapper2.setGrid(response.delivery);
					} else {
						$('#bottom-border-boxshadow').hide();
						$('#btnprint_viewPartyMaster2').hide();
					}
					
					if(response.stateWiseDlyGSTSummaryModelArrList != undefined && response.stateWiseDlyGSTSummaryModelArrList.length > 0) {
						$("#deliveredSummary").show();
						$("#deliveredSummaryDiv").show();
						hideAllMessages();
						$('#deliveredSummaryDiv').append(_this.setSummaryDetails(response.stateWiseDlyGSTSummaryModelArrList,"deliveredSummary"));
						
					} else {
						$("#deliveredSummary").hide();
						$("#deliveredSummaryDiv").hide();
					}
					setTimeout(function(){
						$('.waybillForExcel').css('color', 'white'); 
					});
					hideLayer();
				},setSummaryDetails : function(stateWiseGSTSummaryModelArrList,id) {
					
					hideAllMessages();
					
					var table = $('<table class="table-bordered print" id="'+id+'" style="width: 100%;"/>');
					var totalFreight	= 0.0;
					var totalTaxOn		= 0.0;
					var totalCgst		= 0.0;
					var totalSgstS		= 0.0;
					var totalIgst		= 0.0;
					var totalGst		= 0.0;
					var totalCrossingAmount	= 0.0;
					for (var i = 0; i < stateWiseGSTSummaryModelArrList.length; i++){

						if(i == 0) {
							var tr 	=  $('<tr style="background-color: lightblue; class="'+id+'"/>'); 
							
							var th1 	=  $('<th/>');
							var th2 	=  $('<th/>');
							var th3 	=  $('<th/>');
							var th4 	=  $('<th/>');
							var th5 	=  $('<th/>');
							var th6 	=  $('<th/>');
							var th7 	=  $('<th/>');
							var th8 	=  $('<th/>');
							if(showCrosingHireAmountInSummaryTable){
								var th9 	=  $('<th/>');
							}
							
							th1.append("From State");
							th2.append("To State");
							th3.append("Freight");
							th4.append("Tax On");
							th5.append("CGST");
							th6.append("SGST");
							th7.append("IGST");
							th8.append("Total GST");
							if(showCrosingHireAmountInSummaryTable){
								th9.append("Crossing Amount");
							}
							tr.append(th1);
							tr.append(th2);
							tr.append(th3);
							tr.append(th4);
							tr.append(th5);
							tr.append(th6);
							tr.append(th7);
							tr.append(th8);
							if(showCrosingHireAmountInSummaryTable){
								tr.append(th9);
							}
							table.append(tr);
						} 
							var tr 	=  $('<tr/>'); 

							var td1 	=  $('<td/>');
							var td2 	=  $('<td/>');
							var td3 	=  $('<td/>');
							var td4 	=  $('<td/>');
							var td5 	=  $('<td/>');
							var td6 	=  $('<td/>');
							var td7 	=  $('<td/>');
							var td8 	=  $('<td/>');
							if(showCrosingHireAmountInSummaryTable){
								var td9 	=  $('<td/>');
							}
							td1.append(stateWiseGSTSummaryModelArrList[i].srcStateName);
							td2.append(stateWiseGSTSummaryModelArrList[i].toStateName);
							td3.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].grandTotal) * 100) / 100);
							td4.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].taxOnAmount) * 100) / 100);
							td5.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].cgstAmount) * 100) / 100);
							td6.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].sgstAmount) * 100) / 100);
							td7.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].igstAmount) * 100) / 100);
							td8.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].totalGstAmount) * 100) / 100);
							if(showCrosingHireAmountInSummaryTable){
								td9.append(Math.round(Number(stateWiseGSTSummaryModelArrList[i].crossingAmount) * 100) / 100);
							}
							tr.append(td1);
							tr.append(td2);
							tr.append(td3);
							tr.append(td4);
							tr.append(td5);
							tr.append(td6);
							tr.append(td7);
							tr.append(td8);
							if(showCrosingHireAmountInSummaryTable){
								tr.append(td9);
							}
							
							table.append(tr);
							
							totalFreight	+= stateWiseGSTSummaryModelArrList[i].grandTotal;
							totalTaxOn		+= stateWiseGSTSummaryModelArrList[i].taxOnAmount;
							totalCgst		+= stateWiseGSTSummaryModelArrList[i].cgstAmount;
							totalSgstS		+= stateWiseGSTSummaryModelArrList[i].sgstAmount;
							totalIgst		+= stateWiseGSTSummaryModelArrList[i].igstAmount;
							totalGst		+= stateWiseGSTSummaryModelArrList[i].totalGstAmount;
							totalCrossingAmount	+= stateWiseGSTSummaryModelArrList[i].crossingAmount;
							
							if(i == (stateWiseGSTSummaryModelArrList.length - 1)) {
								var tr 	=  $('<tr style="background-color: lightblue; class="'+id+'"/>');
								
								var th1 	=  $('<th/>');
								var th2 	=  $('<th/>');
								var th3 	=  $('<th/>');
								var th4 	=  $('<th/>');
								var th5 	=  $('<th/>');
								var th6 	=  $('<th/>');
								var th7 	=  $('<th/>');
								var th8 	=  $('<th/>');
								if(showCrosingHireAmountInSummaryTable){
									var th9 	=  $('<th/>');
								}
								
								th1.append("Total");
								th2.append("");
								th3.append(Math.round(totalFreight));
								th4.append(Math.round(totalTaxOn));
								th5.append(Math.round(totalCgst));
								th6.append(Math.round(totalSgstS));
								th7.append(Math.round(totalIgst));
								th8.append(Math.round(totalGst));
								if(showCrosingHireAmountInSummaryTable){
									th9.append(Math.round(totalCrossingAmount));
								}
								
								tr.append(th1);
								tr.append(th2);
								tr.append(th3);
								tr.append(th4);
								tr.append(th5);
								tr.append(th6);
								tr.append(th7);
								tr.append(th8);
								if(showCrosingHireAmountInSummaryTable){
									tr.append(th9);
								}
								
								table.append(tr);
							}
					}
					return table;
				},onRegionSelect : function() {
					var jsonArray = new Array();
					jsonArray.push('#subRegionEle');
					jsonArray.push('#branchEle');
					_this.resetAutcomplete(jsonArray);
					var jsonObject = new Object();
					jsonObject.regionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegion,EXECUTE_WITHOUT_ERROR);
				},setSubRegion : function(jsonObj) {
					var autoSubRegionName = $("#subRegionEle").getInstance();

					$(autoSubRegionName).each(function() {
						this.option.source = jsonObj.subRegion;
					});
				},onSubRegionSelect : function() {
					var jsonArray = new Array();
					jsonArray.push('#branchEle');
					_this.resetAutcomplete(jsonArray);
					jsonObject = new Object();
					jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setBranch,EXECUTE_WITHOUT_ERROR);
				},onStateSelect : function() {
					jsonObject = new Object();
					jsonObject.isOnlyPhysicalBranch = true;
					jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByStateId.do', _this.setBranchForState,EXECUTE_WITHOUT_ERROR);
				},onToStateSelect : function() {
					jsonObject = new Object();
					jsonObject.isOnlyPhysicalBranch = true;
					jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByStateId.do', _this.setDestinationBranchForState,EXECUTE_WITHOUT_ERROR);
				},setCity : function (jsonObj) {
					var autoCityName = $("#cityEle").getInstance();

					$(autoCityName).each(function() {
						this.option.source = jsonObj.city;
					})
				},setBranch : function (jsonObj) {
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = jsonObj.sourceBranch;
					})
				},setBranchForState : function (jsonObj) {
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = jsonObj.branchList;
					})
				},setDestinationBranchForState : function (jsonObj) {
					var toAutoBranchName = $("#toBranchEle").getInstance();

					$(toAutoBranchName).each(function() {
						this.option.source = jsonObj.branchList;
					})
				},setState : function (jsonObj) {
					var autoBranchName = $("#operationalBranchEle").getInstance();
					$(autoBranchName).each(function() {
						this.option.source = jsonObj.stateList;
					})
				},resetAutcomplete : function (jsonArray) {
					for ( var eleId in jsonArray) {
						var elem = $(jsonArray[eleId]).getInstance();
						$(elem).each(function() {
							var elemObj = this.elem.combo_input;
							$(elemObj).each(function() {
								$("#" + $(this).attr("id")).val('');
								$("#" + $(this).attr("id") + '_primary_key').val("");
							})
						})
					}
				},setGSTPaidBy : function(){
					
					_this.setGSTPaidByAutocompleteInstance();
					
					var autoGSTPaidBy = $("#GSTPaidByEle").getInstance();
					var gstPaidByArr = [];
					
					if(gstPaidByHM != undefined){
						for(var key in gstPaidByHM) {
							var object = new Object();
							
							object['GSTPaidById'] 	= key;
							object['GSTPaidByName']	= gstPaidByHM[key];
							
							gstPaidByArr.push(object);
						}
						
						/*GSTPaidBy = [
					        { "GSTPaidById":1, "GSTPaidByName": "Consignor" },
					        { "GSTPaidById":2, "GSTPaidByName": "Consignee" },
					        { "GSTPaidById":3, "GSTPaidByName": "Transporter" },
					        { "GSTPaidById":4, "GSTPaidByName": "Exempted" },
					        { "GSTPaidById":0, "GSTPaidByName": "Not applicable" },
					    ]*/
					}
					
					$(autoGSTPaidBy).each(function() {
						this.option.source = gstPaidByArr;
					})
				},setGSTPaidByAutocompleteInstance : function() {
					var autoGSTPaidByName 			= new Object();
					autoGSTPaidByName.primary_key 	= 'GSTPaidById';
					autoGSTPaidByName.field 		= 'GSTPaidByName';

					$("#GSTPaidByEle").autocompleteCustom(autoGSTPaidByName)
				},onSubmit : function() {
					showLayer();
					var jsonObject = new Object();
					if($("#dateEle").attr('data-startdate') != undefined){
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
					}

					if($("#dateEle").attr('data-enddate') != undefined){
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}

					jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
					jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
					jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
					jsonObject["stateId"] 				= $('#stateEle_primary_key').val();
					jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
					jsonObject["destinationBranchId"] 	= $('#toBranchEle_primary_key').val();
					jsonObject["isStateWiseFlaver"] 	= isStateWiseFlaver;
					jsonObject["freightAmountInTaxOnColumn"] 	= freightAmountInTaxOnColumn;
					jsonObject["showbillingPartyGSTNInTBBLR"] 	= showbillingPartyGSTNInTBBLR;
					jsonObject["allowDynamicWhereClauseLogic"] 	= allowDynamicWhereClauseLogic;
					jsonObject["displayWithBillLr"] 	         = displayWithBillLr;
					jsonObject["showWithAndWithoutTransporterData"] 	= showWithAndWithoutTransporterData;
					
					jsonObject["GSTPaidBy"] 			= $('#GSTPaidByEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/gstReportWS/getGstReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				},onExcelBtn : function() {
					showLayer();
					var jsonObject = new Object();
					if($("#dateEle").attr('data-startdate') != undefined){
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
					}

					if($("#dateEle").attr('data-enddate') != undefined){
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}

					jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
					jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
					jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
					jsonObject["stateId"] 				= $('#stateEle_primary_key').val();
					jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
					jsonObject["destinationBranchId"] 	= $('#toBranchEle_primary_key').val();
					jsonObject["GSTPaidBy"] 			= $('#GSTPaidByEle_primary_key').val();
					jsonObject["isStateWiseFlaver"] 	= isStateWiseFlaver;
					jsonObject.isDownloadForExcel	 	= true;
					jsonObject.downloadExcelForGstStatusUpdate	 	= downloadExcelForGstStatusUpdate;
					jsonObject["allowDynamicWhereClauseLogic"] 		= allowDynamicWhereClauseLogic;
					jsonObject["showWithAndWithoutTransporterData"] = showWithAndWithoutTransporterData;
					getJSON(jsonObject, WEB_SERVICE_URL+'/gstReportWS/getDownloadToExcelDetails.do', _this.setExcelReportData, EXECUTE_WITH_ERROR);
				},setExcelReportData : function(response){
					var data = response;
					if(data.message.messageId == 21){
		        		var errorMessage = data.message;
		        		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
		        		hideLayer();
		        		return false;
		        	}
		        	
		        	generateFileToDownload(response);
					hideLayer();
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