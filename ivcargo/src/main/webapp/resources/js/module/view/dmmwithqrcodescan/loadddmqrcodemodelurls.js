define(function(require) {
	return {
		urlModelCollection:function(pendingReceiveConf){
			var urlArray 					= new Array();
			var pendingReceive  			= new Object();

			pendingReceive.UnloadDate 			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/unloaddate.json');
			pendingReceive.WayBillNumber 		= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/waybillnumber.json');
			pendingReceive.SourceBranch			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/sourcebranch.json');
			pendingReceive.DestinationBranch	= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/destinationbranch.json');
			pendingReceive.Quantity				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/quantity.json');
			pendingReceive.ActualWeight			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/actualweight.json');
			pendingReceive.GrandTotal			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/grandtotal.json');
			pendingReceive.DeliveryTo			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/deliveryto.json');
			pendingReceive.Consignor			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/consignor.json');
			pendingReceive.Consignee			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/consignee.json');
			pendingReceive.LRType				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/lrtype.json');
			pendingReceive.Remark				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/remark.json');

			var elements =  pendingReceiveConf.configuration;
			for (var key in elements) {
				if (key != null && pendingReceive[elements[key]] != undefined) {
					urlArray.push(pendingReceive[elements[key]]);
				}
			}

			return urlArray;
		},
		urlModelChargeCollection:function(chargeTypeModelList) {
			var urlArray 		= new Array();
			
			for (var i = 0; i<chargeTypeModelList.length; i++) {
				var chargeObject	= new Object();
				chargeObject		= JSON.parse(require('text!/ivcargo/resources/js/model/ddmqrcodescanner/chargeTypeModel.json'));
				chargeObject.labelId	= chargeTypeModelList[i].chargeTypeMasterName;
				chargeObject.elementConfigKey	= "charge_"+chargeTypeModelList[i].chargeTypeMasterId;
				chargeObject.dataDtoKey	= "charge_"+chargeTypeModelList[i].chargeTypeMasterId;
				urlArray.push(JSON.stringify(chargeObject));
			}
			
			return urlArray;
		}
	}
});