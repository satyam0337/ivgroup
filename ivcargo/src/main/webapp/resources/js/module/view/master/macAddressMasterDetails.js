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
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '', jsonObject, btModal;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		}, render: function(){
			showLayer();
			_this.setMacIPAddressMasterDetails(jsonObject.response);
		}, setMacIPAddressMasterDetails : function(response) {
			hideAllMessages();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/master/MacAddressMasterViewAll.html", function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				hideLayer();

				if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
					slickGridWrapper2.setGrid(response);
			});

			hideLayer();
		}
	});
});