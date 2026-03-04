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

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		}, render: function() {
			showLayer();
		  	getJSON(jsonObject, WEB_SERVICE_URL + '/billDetailsReportWS/getBillLrDetails.do', _this.setElementsNew, EXECUTE_WITH_ERROR);
		}, setElementsNew : function(response){
			  setTimeout(function() {
               		_this.setElements(response);
               }, 1500);
		},setElements : function(response){			
			if(response.CorporateAccount != undefined) 
				slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}
	});
});
