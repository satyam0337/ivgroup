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
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/directDeliveryDirectVasuliReportWS/loadDirectDeliveryDirectVasuliReportData.do?', _this.setDirectDeliveryDirectVasuliReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDirectDeliveryDirectVasuliReportElements: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/directDeliveryDirectVasuliReport.html", function() {
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

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;

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
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/directDeliveryDirectVasuliReportWS/getDirectDeliveryDirectVasuliReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();

			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			$('#bottom-border-boxshadow').removeClass('hide');

			slickGridWrapper2.setGrid(response);
		}
	});
});

