define([
		PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/print/crossingBillReceiptPrint/crossingBillReceiptPrintSetup.js',
		'JsonUtility',
		'messageUtility',
		'jquerylingua',
		'language'
	],
	function(UrlParameter, crossingBillReceiptPrintSetup) {
	'use strict';// this basically give strictness to this specific js
	let masterId = "0",
	jsonObject	= new Object(),
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId 				= UrlParameter.getModuleNameFromParam('crossingBillReceiptId');
			_this 		= this;
		}, render: function() {
			jsonObject.CrossingBillReceiptId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingBillReceiptPrintWS/getCrossingBillReceiptPrint.do?', _this.setPrintDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setPrintDetails : function(response) {
			hideLayer();
			let printHeaderModel 	= _this.setCrossingBillHeaderData(response.PrintHeaderModel) ;
			
			require(['text!' + crossingBillReceiptPrintSetup.getConfiguration(response),
				crossingBillReceiptPrintSetup.getFilePathForLabel()], function(View, FilePath) {
						
				_this.$el.html(_.template(View));
				loadLanguageWithParams(FilePath.loadLanguage(response.printFlavor));
				crossingBillReceiptPrintSetup.getCrossingBillData(response.CrossingBillReceiptPrint);
				crossingBillReceiptPrintSetup.getCrossingBillHeaderData(printHeaderModel, response.customGroupLogoAllowed);
			});
		}, setCrossingBillHeaderData : function(PrintHeaderModel) {
			let headerData	= new Object();
			headerData.AccountGroupName	 						 = PrintHeaderModel.accountGroupName;
			headerData.CrossingBillReceiptBranchMobileNumber	 = PrintHeaderModel.crossingBillReceiptBranchMobileNumber;
			headerData.ImagePath	 							 = PrintHeaderModel.imagePath;
			headerData.DispatchByBranchId	 					 = PrintHeaderModel.dispatchByBranchId;
			_this.printBillWindow();
			return headerData;
		}, printBillWindow : function () {
			window.resizeTo(1000, 1000);

			setTimeout(function() { 
				window.print();
			}, 500);
		}
	});
});