define(function(require) {
	return {
		urlModelCollection:function(pendingReceiveConf){
			var urlArray 					= new Array();
			var pendingReceive  			= new Object();

			pendingReceive.WayBillNumber 		= require('text!/ivcargo/resources/js/model/qrcodescanner/waybillnumber.json');
			pendingReceive.WayBillTypeName 		= require('text!/ivcargo/resources/js/model/qrcodescanner/waybilltypename.json');
			pendingReceive.Quantity 			= require('text!/ivcargo/resources/js/model/qrcodescanner/quantity.json');
			pendingReceive.LSNumber 			= require('text!/ivcargo/resources/js/model/qrcodescanner/lsnumber.json');

			var elements =  pendingReceiveConf.configuration;
			for (var key in elements) {
				if (key != null && pendingReceive[elements[key]] != undefined) {
					urlArray.push(pendingReceive[elements[key]]);
				}
			}
			return urlArray;
		}
	}
});