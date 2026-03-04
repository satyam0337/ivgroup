define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],//PopulateAutocomplete
		 function(slickGridWrapper2, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/allPartyLRDetailsReportWS/getAllPartyLRDetailsReportElement.do?', _this.renderAllPartyLRDetailsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderAllPartyLRDetailsElements : function(response) {
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/report/collectionreport/allPartyLRDetailsReport/allPartyLRDetailsReport.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute=" + element + "]").removeClass("hide");
						}
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						myNod = Selection.setNodElementForValidation(response);
						
						hideLayer();
					
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind(false);
						});
						
						$("#excelBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind(true);
						});
					});
				}, onFind : function(isExcel) {
					showLayer();
					let jsonObject 			= Selection.getElementData();
					
					jsonObject.isExcel		= isExcel;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/allPartyLRDetailsReportWS/getAllPartyLRDetailsList.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}, setReportData : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						
						if(response.FilePath != undefined)
							generateFileToDownload(response);
						
						return;
					}
					
					if(response.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').removeClass('hide');
						
						let bookingChargesNameHM	= response.chargesNameHM;
						
						if(bookingChargesNameHM != undefined) {
							for(const obj of response.CorporateAccount) {
								let chargesMap	= obj.chargesCollection;
								
								for(let chargeId in bookingChargesNameHM) {
									let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
									
									obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
								}
							}
						}
						
						slickGridWrapper2.setGrid(response);
					}
										
					hideLayer();
				}
			});
});