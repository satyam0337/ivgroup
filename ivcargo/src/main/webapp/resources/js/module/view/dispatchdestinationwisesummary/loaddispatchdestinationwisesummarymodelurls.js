define(function(require) {
	return {
		urlModelCollection:function(destWiseDispatchSumConf){
			var urlArray 				= new Array();
			var destWiseDispatchSum  			= new Object();
			
			destWiseDispatchSum.Date 			= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/datemodel.json');
			destWiseDispatchSum.Region 			= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/regionmodel.json');
			destWiseDispatchSum.SubRegion 		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/subregionmodel.json');
			destWiseDispatchSum.SourceBranch 	= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/sourcebranchmodel.json');
			destWiseDispatchSum.DestSubRegion 		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/destsubregionmodel.json');
			destWiseDispatchSum.DestBranch 	= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/destbranchmodel.json');
			
			destWiseDispatchSum.DestinationBranchName 	= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/destinationbranchmodel.json');
			destWiseDispatchSum.WayBillTypeName 		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/waybilltypemodel.json');
			destWiseDispatchSum.TotalArticle 			= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/totalarticle.json');
			destWiseDispatchSum.BookingChargeTotal		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/totalfreight.json');
			destWiseDispatchSum.TotalServiceTax 		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/totalservicetax.json');
			destWiseDispatchSum.TotalBookingAmount 		= require('text!/ivcargo/resources/js/model/dispatchdestinationwisesummary/totalbookingamount.json');
			
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