/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		}, render: function(){
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/allBranchWiseBkgDlyStockAmountReportWS/getAllBranchWiseBkgDlyLrDetails.do', _this.setPendingLRDetails, EXECUTE_WITHOUT_ERROR);
		}, setPendingLRDetails : function(response) {
			if(response.message != undefined){
				btModal.close()
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			hideAllMessages();

			if(response.CorporateAccount != undefined) {
				setTimeout(function() {
					slickGridWrapper2.setGrid(response);
				}, 500);
			}
				
			
			hideLayer();
		}
	});
});

