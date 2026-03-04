define([
	'slickGridWrapper2',
	'messageUtility'
], function(slickGridWrapper2) {
	'use strict';
	var _this = '', btModal, jsonObject;

	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this 			= this;
			btModal 		= jsonObjectData.btModal;
			jsonObject 		= jsonObjectData.elementValue;
		}, render: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/branchIncomeReportWS/getBranchIncomeLrDetailsByBranchId.do', _this.setBranchIncomeLrDetails, EXECUTE_WITHOUT_ERROR);
		}, setBranchIncomeLrDetails: function(response) {
			hideLayer();
			
			if(response.message !== undefined) {
				if(btModal !== undefined) btModal.close();
				return;
			}
			
			setTimeout(function() {
				slickGridWrapper2.setGrid(response);
			}, 1000);
		}
	});
});