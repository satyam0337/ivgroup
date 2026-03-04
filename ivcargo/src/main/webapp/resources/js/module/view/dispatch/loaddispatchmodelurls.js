define(function(require) {
	return {
		urlCrossingModelCollection:function(pendingDispatch) {
			urlArray = new Array();
			
			if(pendingDispatch.crossingAgent)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/crossingagent.json'));
			
			if(pendingDispatch.destinationArea) {
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/destinationarea.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/agentdestinationarea.json'));
			}
			
			return urlArray;
		}, urlModelCollection:function(pendingDispatch){
			urlArray = new Array();
			
			if(pendingDispatch.sourcesubregion)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/sourcesubregionmodel.json'));
			
			if(pendingDispatch.sourcebranch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/sourcemodel.json'));
			
			if(pendingDispatch.subregion)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/subregionmodel.json'));
			
			if(pendingDispatch.branch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/branchmodel.json'));
			
			if(pendingDispatch.TransportModeForSearch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/transportmodemodelforselect.json'));
			
			if(pendingDispatch.DeliveryAtForSearch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/deliveryatmodelforselect.json'));

			if(pendingDispatch.billSelection)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/billselectionmodel.json'));
			
			if(pendingDispatch.unloadingCrossingBranch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/crossingBranchModel.json'));
		
			return urlArray;
		}, urlLrModelCollection : function(pendingDispatch) {
			urlArray = new Array();
			
			if(pendingDispatch.singlelr)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/singlelrmodel.json'));

			return urlArray;
		},urlPlsModelCollection: function(pendingDispatch) {
			urlArray = new Array();
			if(pendingDispatch.plsNumber){
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/singleplsmodel.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/singleplslabelmodel.json'));
			}
			
			return urlArray;
		}, urlSearchOperationModelCollection : function(pendingDispatch) {
			urlArray = new Array();
			
			if(pendingDispatch.searchByOption)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/searchoperationmodel.json'));
			
			return urlArray;
		}, urlSearchCollection : function(pendingDispatch){
			urlArray = new Array();

			var dispatchModel  = new Object();
			
			dispatchModel.BookingOrUnloading 		=  require('text!/ivcargo/resources/js/model/dispatch/unloadingorbookingmodel.json');
			dispatchModel.WaybillNumber 			=  require('text!/ivcargo/resources/js/model/dispatch/waybillnumbermodel.json');
			dispatchModel.SourceBranch 				=  require('text!/ivcargo/resources/js/model/dispatch/sourcebranchmodel.json');
			dispatchModel.DestinationBranch 		=  require('text!/ivcargo/resources/js/model/dispatch/destinationbranchmodel.json');
			dispatchModel.Consignor 				=  require('text!/ivcargo/resources/js/model/dispatch/consignornamemodel.json');
			dispatchModel.Consignee 				=  require('text!/ivcargo/resources/js/model/dispatch/consigneenamemodel.json');
			dispatchModel.ActualTotalArticles	 	=  require('text!/ivcargo/resources/js/model/dispatch/actualtotalarticlemodel.json');
			dispatchModel.TotalArticles 			=  require('text!/ivcargo/resources/js/model/dispatch/totalarticlemodel.json');
			dispatchModel.ArticleDetails 			=  require('text!/ivcargo/resources/js/model/dispatch/articledetailsmodel.json');
			dispatchModel.PackingGroup	 			=  require('text!/ivcargo/resources/js/model/dispatch/packinggroupmodel.json');
			dispatchModel.Weight 					=  require('text!/ivcargo/resources/js/model/dispatch/weightmodel.json');
			dispatchModel.DeliveryType 				=  require('text!/ivcargo/resources/js/model/dispatch/deliverytypemodel.json');
			dispatchModel.WaybillType 				=  require('text!/ivcargo/resources/js/model/dispatch/waybilltypemodel.json');
			dispatchModel.Amount 					=  require('text!/ivcargo/resources/js/model/dispatch/amountmodel.json');
			dispatchModel.FreightUpto 				=  require('text!/ivcargo/resources/js/model/dispatch/freightuptomodel.json');
			dispatchModel.LrRemark 					=  require('text!/ivcargo/resources/js/model/dispatch/lrremarkmodel.json');
			dispatchModel.ConsigneeNumber 			=  require('text!/ivcargo/resources/js/model/dispatch/consigneenumber.json');
			dispatchModel.ChargeWeight 				=  require('text!/ivcargo/resources/js/model/dispatch/chargeweight.json');
			dispatchModel.ActualWeight 				=  require('text!/ivcargo/resources/js/model/dispatch/actualweight.json');
			dispatchModel.ToPayAmount 				=  require('text!/ivcargo/resources/js/model/dispatch/topayamountmodel.json');
			dispatchModel.PaidAmount 				=  require('text!/ivcargo/resources/js/model/dispatch/paidamountmodel.json');
			dispatchModel.Freight		 			=  require('text!/ivcargo/resources/js/model/dispatch/freight.json');
			dispatchModel.PrivateMark		 		=  require('text!/ivcargo/resources/js/model/dispatch/privateMark.json');
			dispatchModel.executiveName		 		=  require('text!/ivcargo/resources/js/model/dispatch/executivename.json');

			var elements =  pendingDispatch.configuration;
			
			for (var key in elements) {
				if (key != null && dispatchModel[elements[key]] != undefined) {
					urlArray.push(dispatchModel[elements[key]]);
				}
			}
			return urlArray;
		}, 
		crossingChargesCollection : function(pendingDispatch) {
			urlArray = new Array();
			
			var showDeliveryChargesAtCrossing = pendingDispatch.showDeliveryChargesAtCrossing;
			var dispatchModel  = new Object();
			
			dispatchModel.NetLoading 			=  require('text!/ivcargo/resources/js/model/dispatch/netloadingmodel.json');
			dispatchModel.NetUnloading 			=  require('text!/ivcargo/resources/js/model/dispatch/netunloadingmodel.json');
			dispatchModel.CrossingHire 			=  require('text!/ivcargo/resources/js/model/dispatch/crossinghiremodel.json');
			dispatchModel.CrossingLrNumber 		=  require('text!/ivcargo/resources/js/model/dispatch/crossinglrnumbermodel.json');
			dispatchModel.LocalTempo 			=  require('text!/ivcargo/resources/js/model/dispatch/localtempomodel.json');
			dispatchModel.DoorDelivery 			=  require('text!/ivcargo/resources/js/model/dispatch/doordeliverymodel.json');
			dispatchModel.LrCommission 			=  require('text!/ivcargo/resources/js/model/dispatch/lrCommissionModel.json');
			
			if(isCheckBoxChecked('isAgentCrossing') && showDeliveryChargesAtCrossing){
				dispatchModel.DelyChargesbtn 		=  require('text!/ivcargo/resources/js/model/dispatch/addDeliveryChargesButton.json');
			}
			
			
			var elements =  pendingDispatch.configuration;
			
			for (var key in elements) {
				if (key != null && dispatchModel[elements[key]] != undefined) {
					urlArray.push(dispatchModel[elements[key]]);
				}
			}
			
			return urlArray;
		},
		urlModelForActionButton : function(){
			urlArray = new Array();
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/dispatchbuttonmodel.json'));
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/excessbuttonmodel.json'));
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/viewexcessbuttonmodel.json'));

			return urlArray;

		},
		urlPartialConsignment : function(){
			urlArray = new Array();
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/consignmentpackingtypemodel.json'));
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/consignmentquantitymodel.json'));
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/consignmentdispatchquantitymodel.json'));

			return urlArray;

		},urlPartialWeight:function(){
			urlArray = new Array();
			
			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/partialweightmodel.json'));
			
			return urlArray;
		}, lsreprint:function() {
			urlArray = new Array();

			urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/lsreprintbuttonmodel.json'));
			
			return urlArray;
		}, lhpvCharges:function() {
			return require('text!/ivcargo/resources/js/model/lhpvcharges/lhpvchargemodel.json');
		}, setLorryHireNumber : function(pendingDispatch){
			urlArray = new Array();

			if(pendingDispatch.LorryHireNumber) {
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/truckingagementslipnumber.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/lorryHireId.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/lhpvId.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/lhpvNumber.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/lhpvBranchId.json'));
			}
			
			return urlArray;
		}
	}
})