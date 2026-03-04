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
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
		}, render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyAgentCommissionReportWS/getPartyAgentCommissionLRDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		}, setElementData : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/partyAgentCommissionReport/PartyAgentLRDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				showLayer();
					
				if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
					slickGridWrapper2.setGrid(response);
				
				hideLayer();
			});
		}
	});
});