define(function(require) {
	return {
		urlModelCollection:function(pendingDDMConf){
			var urlArray 					= new Array();
			var pendingDDM  			= new Object();

			pendingDDM.UnloadDate 			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/unloaddate.json');
			pendingDDM.WayBillNumber 		= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/waybillnumber.json');
			pendingDDM.SourceBranch			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/sourcebranch.json');
			pendingDDM.DestinationBranch	= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/destinationbranch.json');
			pendingDDM.Quantity				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/quantity.json');
			pendingDDM.ActualWeight			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/actualweight.json');
			pendingDDM.GrandTotal			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/grandtotal.json');
			pendingDDM.DeliveryTo			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/deliveryto.json');
			pendingDDM.Consignor			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/consignor.json');
			pendingDDM.Consignee			= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/consignee.json');
			pendingDDM.LRType				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/lrtype.json');
			pendingDDM.Remark				= require('text!/ivcargo/resources/js/model/ddmqrcodescanner/remark.json');

			var elements =  pendingDDMConf.configuration;
			for (var key in elements) {
				if (key != null && pendingDDM[elements[key]] != undefined) {
					urlArray.push(pendingDDM[elements[key]]);
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