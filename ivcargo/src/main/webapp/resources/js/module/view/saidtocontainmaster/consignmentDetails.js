/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		}, render: function(){
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/getConsignmentGoodHistoryByConsignmentGoodsId.do', _this.setHistoryElements, EXECUTE_WITH_ERROR);
		}, setHistoryElements : function(response) {
			hideAllMessages();

			if(response.CorporateAccount != undefined)
				slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}
	});
});

