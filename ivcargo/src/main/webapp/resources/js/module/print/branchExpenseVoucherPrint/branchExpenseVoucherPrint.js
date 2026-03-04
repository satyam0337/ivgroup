define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/print/branchExpenseVoucherPrint/branchExpenseVoucherPrintSetup.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language'
	], function(UrlParameter, branchExpenseVoucherPrintSetup) {
	'use strict';
	var _this;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			var jsonObject = new Object()
			jsonObject.branchExpenseVoucherDetailsId = UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/print/branchExpenseVoucherPrintWS/getBranchExpenseVoucherPrint.do?', _this.setBranchIncomeVoucherPrintData, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setBranchIncomeVoucherPrintData : function(response) {
			hideLayer();
			
			let path	= '/ivcargo/html/print/branchExpenseVoucherPrint/' + response.branchExpenseVoucherPrintFlavor + '.html';
			
			if(!urlExists(path)) response.branchExpenseVoucherPrintFlavor = 'branchExpenseVoucherPrint_default';
			
			require([branchExpenseVoucherPrintSetup.getConfiguration(response), branchExpenseVoucherPrintSetup.getFilePathForLabel(response)], function(View, FilePath) {
				_this.$el.html(_.template(View));
				loadLanguageWithParams(FilePath.loadLanguage(response.branchExpenseVoucherPrintFlavor));
				branchExpenseVoucherPrintSetup.setData(response)
				setLogo()
			});
		}
	});
});