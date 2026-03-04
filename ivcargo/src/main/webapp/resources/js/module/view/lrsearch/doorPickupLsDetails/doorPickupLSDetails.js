define(['marionette'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,'slickGridWrapper2'
	,'JsonUtility'
	 ,'messageUtility'
	 ],
	 function(Marionette, UrlParameter, slickGridWrapper2){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	waybillId,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
			waybillId = UrlParameter.getModuleNameFromParam(MASTERID);
			jsonObject.waybillId			= waybillId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/doorPickupDispatchWS/getDoorPickupLSDetail.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getResponseForView : function(response){
			hideLayer();
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/pickupLSDetail.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				if(response.CorporateAccount != undefined)
					slickGridWrapper2.setGrid(response);

				hideLayer();
			});
		}
	});
});


function pickupLsPrint(grid, dataView, row) {
	var item 			 = dataView.getItem(row);
	var doorPickupNumber = item.doorPickupLedgerId;
	
	if(item.doorPickupNumber != undefined)
		window.open('InterBranch.do?pageId=340&eventId=10&modulename=pickupLoadingSheetPrint&masterid='+doorPickupNumber+'&isReprint=true', '', 'location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
}

function pickupLSSettlementPaymentStatusDetail(grid, dataView, row) {
	var item 			 	= dataView.getItem(row);
	var amtSettlementStatus = Number(item.doorPickupLedgerLorryHireAmountSettlementStatus);
		
	if(item.doorPickupLedgerLorryHireAmountSettlementStatus != undefined && (amtSettlementStatus == PICKUP_LS_LORRYHIREAMOUNT_SETTLEMENT_STATUS_CLEAR || amtSettlementStatus == PICKUP_LS__LORRYHIREAMOUNT_SETTLEMENT_STATUS_PARTIAL)){
		window.open('viewDetails.do?pageId=340&eventId=2&modulename=doorPickupLsPaymentDetails&masterid=' + item.doorPickupLedgerId + '&incExpMappingId=11', 'newwindow', config = 'height=500,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
	}

}
