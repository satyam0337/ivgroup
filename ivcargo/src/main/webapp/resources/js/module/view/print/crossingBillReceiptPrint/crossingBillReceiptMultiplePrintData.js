define([
		'JsonUtility'
		,'messageUtility'
		],
		function() {
		'use strict';// this basically give strictness to this specific js
		let  _this = ''
		,jsonObject	= new Object();
		
		return Marionette.LayoutView.extend({
			initialize: function() {
				_this = this;
			}, render: function() {
				jsonObject.CrossingBillReceiptId 	= localStorage.getItem("crossingBillReceiptIds");
			 
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingBillReceiptPrintWS/getCrossingBillReceiptMultiplePrintData.do?', _this.setMultiplePrintDetails, EXECUTE_WITHOUT_ERROR);
			}, setMultiplePrintDetails : function(response) {
				hideLayer();
				require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/print/crossingBillReceiptPrint/' + response.printFlavor + '.js'], function(billReceiptPrintSheetSetup) {
					let flag	= 1;
					billReceiptPrintSheetSetup.renderElements(response, _this, flag);
					localStorage.removeItem("crossingBillReceiptIds");
				});
				
				setTimeout(function() {
					window.print();
				}, 500);
			}
		});
});