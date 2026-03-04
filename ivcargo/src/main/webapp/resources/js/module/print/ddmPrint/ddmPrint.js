
define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
], function(UrlParameter) {
	'use strict'; 

	let jsonObject = new Object(),  _this = '', deliveryRunSheetLedgerIds;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			deliveryRunSheetLedgerIds				= UrlParameter.getModuleNameFromParam('deliveryRunSheetLedgerIds');
		}, render: function() {
			jsonObject["deliveryRunSheetLedgerIds"] = deliveryRunSheetLedgerIds;
			getJSON(jsonObject, WEB_SERVICE_URL + '/print/DDMPrintWS/getDDMPrint.do', _this.renderDDMPrintData, EXECUTE_WITH_ERROR);
			return _this;
		}, renderDDMPrintData: function(response) {
			
			hideLayer();
			
			let htmlPath	= '/ivcargo/html/print/ddmPrint/' + response.ddmPrintFlavor + '.html';
						
			if (!urlExists(htmlPath))
				htmlPath = '/ivcargo/html/print/ddmPrint/ddmPrint_default.html';

			let setupPath = '/ivcargo/resources/js/module/print/ddmPrint/' + response.ddmPrintFlavor + '.js';

			if (!urlExists(setupPath))
				setupPath = '/ivcargo/resources/js/module/print/ddmPrint/ddmPrintSetup.js';
				
			
			require([setupPath], function(ddmPrintsetup) {
				let templatePath = _this.getConfiguration(htmlPath);

				require([templatePath], function(View) {
					_this.$el.html(_.template(View));
					ddmPrintsetup.setData(response);
				});
			});
		}, getConfiguration: function(htmlPath) {
			return 'text!' + htmlPath;
		}
	});
});