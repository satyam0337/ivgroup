/**
 * Anant 12-Apr-2024 3:58:57 pm 2024
 */
define([  
		'slickGridWrapper2'
		, PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		, 'JsonUtility'
        , 'messageUtility'
        , 'nodvalidation'
        , 'focusnavigation'//import in require.config
        ],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/transferLedgerReportWS/loadTransferLedgerReportData.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/trancereport/transferLedgerReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.reportName);
				
				let keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				if(response.isCalenderSelection)
					$("*[data-attribute=date]").removeClass("hide");

				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;

				Selection.setSelectionToGetData(response);
				
				let myNod	= Selection.setNodElementForValidation(response);

				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject	= Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/transferLedgerReportWS/getTransferLedgerReportData.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData : function(response) {
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
