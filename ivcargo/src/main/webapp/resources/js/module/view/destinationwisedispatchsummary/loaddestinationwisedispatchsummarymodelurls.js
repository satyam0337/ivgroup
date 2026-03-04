define(function(require) {
	return {
		urlModelCollection:function(destWiseDispatchSumConf){
			var urlArray 				= new Array();
			var destWiseDispatchSum  			= new Object();
			
			destWiseDispatchSum.Date 			= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/datemodel.json');
			destWiseDispatchSum.Region 			= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/regionmodel.json');
			destWiseDispatchSum.SubRegion 		= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/subregionmodel.json');
			destWiseDispatchSum.SourceBranch 	= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/sourcebranchmodel.json');
			destWiseDispatchSum.VehicleNumber 	= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/vehiclenumbermodel.json');

			destWiseDispatchSum.DestinationBranchName 	= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/destinationbranchmodel.json');
			destWiseDispatchSum.WayBillTypeName 		= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/waybilltypemodel.json');
			destWiseDispatchSum.TotalArticle 			= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/totalarticle.json');
			destWiseDispatchSum.BookingChargeTotal		= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/totalfreight.json');
			destWiseDispatchSum.TotalServiceTax 		= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/totalservicetax.json');
			destWiseDispatchSum.TotalBookingAmount 		= require('text!/ivcargo/resources/js/model/destinationwisedispatchsummary/totalbookingamount.json');
			
			var elements =  destWiseDispatchSumConf.configuration;
			var chargesColl =  destWiseDispatchSumConf.CHARGE_TYPE_MASTER;
			var chargeNameColl = destWiseDispatchSumConf.CHARGE_TYPE_MASTER_LABEL_ID;
			
			for (var key in elements) {
				if (key != null && destWiseDispatchSum[elements[key]] != undefined) {
					if(elements[key] == 'BookingChargeTotal'){
						var bookingCharges = destWiseDispatchSum[elements[key]];
						for(var charge in chargesColl){
							var chargeMod = JSON.parse(bookingCharges);
							var charge = chargesColl[charge]+'';
							chargeMod.dataDtoKey = charge.replace(/\s+/g, '');;
							chargeMod.labelValue = chargeNameColl[charge.replace(/\s+/g, '')];
							urlArray.push(chargeMod);
						}
						
					}else{
						urlArray.push(JSON.parse(destWiseDispatchSum[elements[key]]));
					}
				}
			}
			
			return urlArray;
		}
	}
})