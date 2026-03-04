/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehiclewisedispatchreport/dispatchLoadingSheetDetails.js'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (slickGridWrapper2, LRDetails) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	gridObejct,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
		}, render: function(){
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/vehiclewiseDispatchReportWS/getLoadingSheetDetails.do', _this.setElements, EXECUTE_WITH_ERROR);
		}, setElements : function(response) {
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/vehiclewisedispatchreport/VehicleWiseDispatchDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined) {
					gridObejct = slickGridWrapper2.setGrid(response);
					gridObejct.onDblClick.subscribe(function (e, args) {
						var cell 		= gridObejct.getCellFromEvent(e)
						var row 		= cell.row;
						var dataView 	= gridObejct.getData();
						var item 		= dataView.getItem(row);
						
						var dispatchLedgerId	= item.dispatchLedgerId;
						
						if(cell.cell == 1) {
							setTimeout(_this.getLrDeatilsInLoadingSheetDetails(dispatchLedgerId),200);
						}
					});
				}
				
				hideLayer();
			});
		}, getLrDeatilsInLoadingSheetDetails : function(dispatchLedgerId) {
			initialiseFocus('#lrDetailsModal');
			
			let jsonObject = new Object();
			jsonObject["dispatchLedgerId"]	= dispatchLedgerId;
			
			let object 			= new Object();
			object.jsonObject		= jsonObject;
			
			new Backbone.BootstrapModal({
				content: new LRDetails(object),
				modalBodyId	:	'lrDetailsModal',
				modalWidth 	: 90,
				title		:'LR Details',
			}).open();
		}
	});
});