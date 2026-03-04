define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'nodvalidation',
	'focusnavigation'
], function(slickGridWrapper2, Selection, UrlParameter) {
	'use strict';

	let jsonObject = {}, myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/dailyCollectionReportWS/getDailyCollectionReportElement.do?', _this.setDailyCollectionReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDailyCollectionReportElements: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let executive = response.executive;
			let showDownloadExcelButton = response.showDownloadExcelButton;
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/dailyCollectionReport/dailyCollectionReport.html", function() {
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

				elementConfiguration.executiveElement				= $('#executiveEle');
				elementConfiguration.dateElement					= $('#dateEle')
				elementConfiguration.destSubregionElement			= $('#destSubRegionEle');
				elementConfiguration.destBranchElement				= $('#destBranchEle');

				response.elementConfiguration = elementConfiguration;

				response.isCalenderSelection = true;
				response.destinationSubRegionBranchSelection = true;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$('#findBtn').click(function() {
					myNod.performCheck();
					if (myNod.areAll('valid')) _this.onSubmit();
				});

				if (showDownloadExcelButton) {
					$('#downloadExcel').click(function() {
						myNod.performCheck();
						if (myNod.areAll('valid')) _this.setExcelData();
					});
				}

			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/dailyCollectionReportWS/getDailyCollectionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			slickGridWrapper2.setGrid(response);
		}
	});
});

