
define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
], function(UrlParameter) {
	'use strict'; 

	let jsonObject = new Object(),  _this = '', doorPickupLedgerIds;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			doorPickupLedgerIds				= UrlParameter.getModuleNameFromParam('doorPickupledgerIds');
		}, render: function() {
			jsonObject["doorPickupLedgerIds"] = doorPickupLedgerIds;
			getJSON(jsonObject, WEB_SERVICE_URL + '/print/prePickupUnloadingPrintWS/getPrePickupUnloadingPrint.do', _this.renderPrePickupUnloadingPrintData, EXECUTE_WITH_ERROR);
			return _this;
		}, renderPrePickupUnloadingPrintData: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			let path = "/ivcargo/html/print/prePickupUnloadingPrint/" + response.prePickupUnloadingPrintType + ".html";
		
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
				require(['/ivcargo/resources/js/module/print/prePickupUnloadingPrint/prePickupUnloadingPrintsetup.js'], function(prePickupUnloadingPrintsetup) {
					prePickupUnloadingPrintsetup.setHeaderDetails(response.PrintHeaderModel);
					prePickupUnloadingPrintsetup.setPrePickupUnloadingPrintData(response);
					setTimeout(function() { window.print(); }, 100);
				});
			});
		},
	});
});