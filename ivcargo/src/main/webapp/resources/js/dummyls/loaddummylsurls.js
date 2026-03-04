define(function(require) {
	return {
		elementCollection:function(config){
			var urlArray = new Array();

			var dispatchModel  = new Object();
			
			dispatchModel.BookingOrUnloading 	=  require('text!/ivcargo/resources/js/model/dummyls/unloadingorbookingmodel.json');
			dispatchModel.WaybillNumber 		=  require('text!/ivcargo/resources/js/model/dummyls/waybillnumbermodel.json');
			dispatchModel.SourceBranch 			=  require('text!/ivcargo/resources/js/model/dummyls/sourcebranchmodel.json');
			dispatchModel.DestinationBranch 	=  require('text!/ivcargo/resources/js/model/dummyls/destinationbranchmodel.json');
			dispatchModel.TotalArticles 		=  require('text!/ivcargo/resources/js/model/dummyls/totalarticlemodel.json');
			dispatchModel.Weight 				=  require('text!/ivcargo/resources/js/model/dummyls/weightmodel.json');
			dispatchModel.WaybillType 			=  require('text!/ivcargo/resources/js/model/dummyls/waybilltypemodel.json');
			dispatchModel.Amount 				=  require('text!/ivcargo/resources/js/model/dummyls/amountmodel.json');
			dispatchModel.DeliveryType 			=  require('text!/ivcargo/resources/js/model/dummyls/deliverytypemodel.json');
			dispatchModel.Consignor 			=  require('text!/ivcargo/resources/js/model/dummyls/consignornamemodel.json');
			dispatchModel.Consignee 			=  require('text!/ivcargo/resources/js/model/dummyls/consigneenamemodel.json');

			var elements =  config.configuration;
			
			for (var key in elements) {
				if (key != null && dispatchModel[elements[key]] != undefined) {
					urlArray.push(dispatchModel[elements[key]]);
				}
			}
			
			return urlArray;
		}
	}
})