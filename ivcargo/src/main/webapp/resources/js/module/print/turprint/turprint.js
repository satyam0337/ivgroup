define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/print/turprint/turprintsetup.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language'
	], function(UrlParameter, turprintsetup) {
	'use strict';
	var _this;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			var jsonObject = new Object()
			jsonObject.dispatchLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/receiveWs/getTURPrintData.do?', _this.setTURPrintData, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setTURPrintData : function(response) {
			hideLayer();
			
			let path	= '/ivcargo/html/module/turprint/' + response.turPrintFlavor + '.html';
			
			if(!urlExists(path)) response.turPrintFlavor = 'turprint_default';
			
			require([turprintsetup.getConfiguration(response), turprintsetup.getFilePathForLabel(response)], function(View, FilePath) {
				_this.$el.html(_.template(View));
				loadLanguageWithParams(FilePath.loadLanguage(response.turPrintFlavor));
				turprintsetup.setData(response)
				setLogo()
			});
		}
	});
});