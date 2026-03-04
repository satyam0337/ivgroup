define([ 
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'autocomplete',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation'
	], function(UrlParameter) {
		var  jsonObject = new Object(), fromRange,toRange,fromDate,toDate;
		return Marionette.LayoutView.extend({
			initialize : function() {
			_this = this;
			fromRange = localStorage.getItem('fromRange');
			toRange = localStorage.getItem('toRange');
			fromDate = localStorage.getItem('fromDate');
			toDate = localStorage.getItem('endDate');
			

			this.$el.html(this.template);
		}, render : function() {
			
			jsonObject.fromRange = fromRange;
			jsonObject.toRange = toRange;
			jsonObject.fromDate = fromDate;
			jsonObject.toDate = toDate;

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/qrCodePrintLableWS/getQRPrintLableDataByWayBillNumbers.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			hideLayer();
			
			$("#mainContent").load("/ivcargo/html/print/qrCodePrintLable/qrCodeDataPrintLable.html",function() {
				_this.setData(response);
			});
		}, setData : function(response) {
			hideLayer();
		 	let path	= '/ivcargo/resources/js/module/print/'+ response.accountGroupId +'/qrCodeDataPrintLable/qrCodeDataPrint.js';
			
			if(urlExists(path)) {
				require([path], function(qrCodePrintLable) {
					qrCodePrintLable.renderElements(response);
				});
			} else {
				require(['/ivcargo/resources/js/module/print/qrCodeDataPrintLable/qrCodeDataPrint.js'], function(qrCodePrintLable) {
					qrCodePrintLable.renderElements(response);
				});
			}
		}
	});
});
