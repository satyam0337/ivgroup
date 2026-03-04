define([  
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/servicetaxreport/servicetaxreportfilepath.js'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/servicetaxreport/serviceTaxReportHandle.js'
		 ,'slickGridWrapper2'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,'JsonUtility'
		 ,'messageUtility'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ],function(FilePath, Handle, slickGridWrapper2, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/serviceTaxReportWS/getServiceTaxReportElement.do?',	_this.renderServicetaxElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderServicetaxElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/servicetaxreport/ServiceTaxReport.html",function() {
						baseHtml.resolve();
					});
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == false) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
							}
						}
						
						let elementConfiguration	= {};
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.monthLimit				= response.serviceTaxConfig.htData.reportSelectionRange.months;
						response.isCalenderSelection	= true;
						response.sourceAreaSelection	= true;
						response.isPhysicalBranchesShow	= true;
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

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
						
						myNod.add({
							selector: '#branchEle',
							validate: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage: 'Select proper Branch !'
						});

						hideLayer();

						$("#saveBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onSubmit(_this);								
							}
						});
					});

				},setReportData : function(response) {
					if(response.message != undefined){
						hideLayer();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
						$('#middle-border-boxshadow').addClass('hide');
						$('#bottom-border-boxshadow').addClass('hide');
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
					
					if(response.booking.CorporateAccount != undefined) {
						$('#middle-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.booking);
					}
					if(response.delivery.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.delivery);
					}
					hideLayer();
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
					getJSON(jsonObject, WEB_SERVICE_URL+'/serviceTaxReportWS/getServiceTaxReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
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