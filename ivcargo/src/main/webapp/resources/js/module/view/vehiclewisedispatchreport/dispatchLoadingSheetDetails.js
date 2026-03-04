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
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
		}, render: function(){
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/vehiclewiseDispatchReportWS/getLrDeatilsInLoadingSheetDetails.do', _this.setElements, EXECUTE_WITH_ERROR);
		},setElements : function(response) {
			hideLayer();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#lrDetailsModal").load("/ivcargo/html/module/vehiclewisedispatchreport/VehicleWiseDispatchDetailsWithLrDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
				
			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined)
					slickGridWrapper2.setGrid(response);
				
				hideLayer();
			})
			
		}
	});
});