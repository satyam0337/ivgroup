define(function(require) {
	return {
		urlModelCollection:function(godownStockConf){
			var urlArray = new Array();
			var godownStock  = new Object();

			godownStock.Region = require('text!/ivcargo/resources/js/model/godownstock/regionmodel.json');
			godownStock.SubRegion = require('text!/ivcargo/resources/js/model/godownstock/subregionmodel.json');
			godownStock.SourceBranch = require('text!/ivcargo/resources/js/model/godownstock/sourcebranchmodel.json');
			godownStock.Godown = require('text!/ivcargo/resources/js/model/godownstock/godown.json');
			godownStock.DestinationBranch = require('text!/ivcargo/resources/js/model/godownstock/destinationBranch.json');
			godownStock.TotalLRs = require('text!/ivcargo/resources/js/model/godownstock/totallrs.json');
			godownStock.TotalQuantity = require('text!/ivcargo/resources/js/model/godownstock/totalquantity.json');
			godownStock.TotalWeight = require('text!/ivcargo/resources/js/model/godownstock/totalweight.json');
			godownStock.BookingAmount = require('text!/ivcargo/resources/js/model/godownstock/bookingAmount.json');
			//godownStock.blankCol = require('text!/ivcargo/resources/js/model/godownstock/blankCol.json');
			godownStock.LRNo = require('text!/ivcargo/resources/js/model/godownstock/waybillnumbermodel.json');
			godownStock.Date = require('text!/ivcargo/resources/js/model/godownstock/datemodel.json');
			godownStock.Article = require('text!/ivcargo/resources/js/model/godownstock/quantitymodel.json');
			godownStock.ActualWeight = require('text!/ivcargo/resources/js/model/godownstock/actualWeight.json');
			godownStock.ChargeWeight = require('text!/ivcargo/resources/js/model/godownstock/chargeWeight.json');
			godownStock.WayBillType = require('text!/ivcargo/resources/js/model/godownstock/wayBillType.json');
			console.log(godownStockConf);
			var elements =  godownStockConf.configuration;
			for (var key in elements) {
				if (key != null && godownStock[elements[key]] != undefined) {
					urlArray.push(godownStock[elements[key]]);
				}
			}
			
			return urlArray;
		}
	}
})