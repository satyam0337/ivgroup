define([  
		 'slickGridWrapper2'
		  ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		 ,'messageUtility'
		 ,'nodvalidation'
		 ,'focusnavigation'//import in require.config
		 ],function(slickGridWrapper2, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '';
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchAccountReportWS/getBranchAccountReportElement.do?',	_this.renderBranchAccountElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderBranchAccountElements : function(response){
					let loadelement 			= new Array();
					let baseHtml 				= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/report/accountreport/branchAccount/branchAccountReport.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						let keyObject = Object.keys(response);
						
						for (let i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]]) {
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
							}
						}
						
						let elementConfiguration					= new Object();
				
						elementConfiguration.dateElement			= $('#dateEle');
						elementConfiguration.regionElement			= $('#regionEle');
						elementConfiguration.subregionElement		= $('#subRegionEle');
						elementConfiguration.branchElement			= $('#branchEle');
		
						elementConfiguration.destRegionElement		= $('#destRegionEle');
						elementConfiguration.destSubregionElement	= $('#destSubRegionEle');
						elementConfiguration.destBranchElement		= $('#destBranchEle');
		
						response.elementConfiguration				= elementConfiguration;
						response.isCalenderSelection	    		= true;
						response.sourceAreaSelection				= true;
						response.isPhysicalBranchesShow				= true;
						response.AllOptionsForDestSubRegion			= true;
						response.AllOptionForDestinationBranch		= true;
		
						Selection.setSelectionToGetData(response);
						
						myNod = Selection.setNodElementForValidation(response);
						
						hideLayer();

						$("#saveBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onSubmit();								
						});
					});

				}, onSubmit : function() {
					showLayer();
					let jsonObject = Selection.getElementData();

					getJSON(jsonObject, WEB_SERVICE_URL+'/branchAccountReportWS/getBranchAccountReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
				}, setReportData : function(response) {
					hideLayer();

					if(response.message != undefined)
						return;

					if(response.booking != undefined && response.booking.CorporateAccount != undefined) {
						$('#middle-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.booking);
					} else
						$('#middle-border-boxshadow').addClass('hide');
					
					if(response.delivery != undefined && response.delivery.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.delivery);
					} else
						$('#bottom-border-boxshadow').addClass('hide');
				}
			});
});