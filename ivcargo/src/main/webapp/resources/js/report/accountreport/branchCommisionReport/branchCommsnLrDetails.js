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
	let _this = '', jsonObject;
	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this 			= this;
			jsonObject		= jsonObjectData;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchCommisionReportWS/getBranchCommsnLrDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		}, setElementData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			} 
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#modalBody").load("/ivcargo/html/report/accountreport/branchCommisionReport/branchCommsnLrDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				slickGridWrapper2.setGrid(response);
				
				hideLayer();
			});
		}
	});
});