
define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
], function(UrlParameter) {
	'use strict'; // this basically gives strictness to this specific js

	var jsonObject = new Object(), tripHisabSettlementId, _this = '';

	// this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			tripHisabSettlementId = UrlParameter.getModuleNameFromParam("tripHisabSettlementId");
		}, render: function() {
			jsonObject.TripHisabSettlementId = tripHisabSettlementId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/tripHisabSettlementPrintWS/getTripHisabPrintDataDetails.do', _this.renderTripHisabSettlementDataForPrint, EXECUTE_WITH_ERROR);
			return _this;
		}, renderTripHisabSettlementDataForPrint: function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			let path = "/ivcargo/html/print/tripHisabSettlementPrint/" + response.tripHisabPrintType + ".html";
			
			if(!urlExists(path)) {
				showMessage('info', 'File not found !');
				
				setTimeout(function() {
					window.close();
				}, 1000);
			}

			$("#mainContent").load(path, function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				require(['/ivcargo/resources/js/module/print/tripHisabSettlementPrintSetup.js'], function(tripHisabSettlementPrintSetup) {
					tripHisabSettlementPrintSetup.setHeaderDetails(response.PrintHeaderModel);
					tripHisabSettlementPrintSetup.setTripHisabSettlementPrintData(response);
					setTimeout(function() { window.print(); window.close(); }, 100);
				});
			});
		},
	});
});