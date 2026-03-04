define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/print/branchIncomeVoucherPrint/branchIncomeVoucherPrintsetup.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language'
	], function(UrlParameter, branchIncomeVoucherPrintsetup) {
	'use strict';
	let _this;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			let jsonObject = new Object()
			jsonObject.branchIncomeVoucherDetailsId = UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/print/branchIncomeVoucherPrintWS/getBranchIncomeVoucherPrint.do?', _this.setBranchIncomeVoucherPrintData, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setBranchIncomeVoucherPrintData : function(response) {
			hideLayer();
			
			let path	= '/ivcargo/html/print/branchIncomeVoucherPrint/' + response.branchIncomeVoucherPrintFlavor + '.html';
			
			if(!urlExists(path)) response.branchIncomeVoucherPrintFlavor = 'branchIncomeVoucherPrint_default';
			
			require([branchIncomeVoucherPrintsetup.getConfiguration(response), branchIncomeVoucherPrintsetup.getFilePathForLabel(response)], function(View, FilePath) {
				_this.$el.html(_.template(View));
				loadLanguageWithParams(FilePath.loadLanguage(response.branchIncomeVoucherPrintFlavor));
				branchIncomeVoucherPrintsetup.setData(response)
				setLogo()
			});
		}
	});
});