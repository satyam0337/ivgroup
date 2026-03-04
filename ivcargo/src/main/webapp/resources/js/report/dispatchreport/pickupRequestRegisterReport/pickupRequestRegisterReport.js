
 define(
		[
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'slickGridWrapper2'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'focusnavigation'//import in require.config
		 ],//PopulateAutocomplete
		 function(Selection, slickGridWrapper2) {
			'use strict';
			var jsonObject = new Object(), myNod, _this; 
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/pickupRequestRegisterReportWS/getPickupRequestRegisterReportElement.do?',	_this.renderPickupRegisterReportElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPickupRegisterReportElements : function(response) {
					showLayer();
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/report/dispatchreport/pickupRequestRegisterReport/pickupRequestRegisterReport.html",
							function() {
								baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject 		= Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]]) 
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
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
								_this.onFind();
						});
					});
				},onFind : function() {
					showLayer();
					var jsonObject 			= Selection.getElementData();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/pickupRequestRegisterReportWS/getPickupRequestRegisterReportData.do', _this.setPickupRequestRegisterData, EXECUTE_WITH_ERROR);
				},setPickupRequestRegisterData : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					$('#bottom-border-boxshadow').removeClass('hide');
					slickGridWrapper2.setGrid(response);
				}			
			});
});