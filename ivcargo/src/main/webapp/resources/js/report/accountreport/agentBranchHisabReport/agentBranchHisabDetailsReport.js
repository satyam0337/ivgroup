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
			let jsonObject = new Object(), myNod, _this; 
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentBranchHisabReportWS/agentBranchHisabReportElement.do?',_this.renderAgentBranchHisabReportElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderAgentBranchHisabReportElements : function(response) {					
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/report/accountreport/agentBranchHisabReport/agentBranchHisabDetailsReport.html",
							function() {
								baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element]) 
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						response.showOnlyAgentBranch = true;

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
								_this.onFind();
						});
					});
				}, onFind : function() {
					showLayer();
					let jsonObject 			= Selection.getElementData();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/agentBranchHisabReportWS/getAgentBranchHisabReportData.do', _this.setAgentBranchHisabReport, EXECUTE_WITH_ERROR);
				}, setAgentBranchHisabReport : function(response) {
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						hideLayer();
						return;
					}
					
					hideAllMessages();
					$('#bottom-border-boxshadow').removeClass('hide');
					slickGridWrapper2.setGrid(response);
					
					hideLayer();
				}			
					
		});
});
