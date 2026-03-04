
define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(),  _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allBranchCashStatementReportWS/getAllBranchCashStatementReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/cashstatementreport/allBranchCashStatementReport.html",function() {
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
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.AllOptionsForRegion	= false;
				response.AllOptionsForSubRegion	= true;
				response.AllOptionsForBranch	= true;
				response.isPhysicalBranchesShow	= true;

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
			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchCashStatementReportWS/getAllBranchCashStatementReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			$("#allBranchCashStatementReportDiv").empty();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}
			
			hideLayer();
		}
	});
});

function wayBillSearch(grid, dataView, row) {
	window.open('SearchWayBillAction.do?pageId=50&eventId=156&fromDate='+ $("#dateEle").attr('data-startdate') + '&toDate=' +  $("#dateEle").attr('data-enddate')+'&regionId=' +  dataView.getItem(row).regionId+'&subRegionId=' +  dataView.getItem(row).subRegionId+'&branchId=' +  dataView.getItem(row).branchId);
}