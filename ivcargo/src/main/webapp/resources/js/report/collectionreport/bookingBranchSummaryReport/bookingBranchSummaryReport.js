define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'nodvalidation',
	'focusnavigation'
], function(slickGridWrapper2, Selection) {
	'use strict';

	let jsonObject = {}, myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			// Auto-generated render function for JSP: bookingBranchSummaryReport
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/bookingBranchSummaryReportWS/loadBookingBranchSummaryReportData.do?', _this.setBookingBranchSummaryReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingBranchSummaryReportElements: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/collectionreport/bookingBranchSummaryReport/bookingBranchSummaryReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				$("*[data-selector=header]").html(response.reportName);

				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$('*[data-attribute=' + element + ']').removeClass('hide');
				}

				let elementConfiguration = new Object();

				elementConfiguration.dateElement		= $('#dateEle')
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration = elementConfiguration;

				response.isCalenderSelection = true;
				response.sourceAreaSelection = true;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$('#findBtn').click(function() {
					myNod.performCheck();
					if (myNod.areAll('valid')) _this.onSubmit();
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/bookingBranchSummaryReportWS/getBookingBranchSummaryReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
				slickGridWrapper2.setGrid(response);
			else
				$('#bottom-border-boxshadow').addClass('hide');
			
			hideLayer();
		}
	});
});