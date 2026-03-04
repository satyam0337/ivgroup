define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', jsonObject = new Object();

	return Marionette.LayoutView.extend({
		initialize: function(){
			_this 			= this;
			jsonObject		= JSON.parse(localStorage.getItem("jsonObject"));
			localStorage.removeItem("jsonObject");
		}, render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/toPayLRDetailsReportWS/getToPayDetailsReportLRWiseData.do', _this.setElementData, EXECUTE_WITH_NEW_ERROR);
		}, setElementData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				return;
			}

			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/toPayLRDetailsReport/toPayDetailsReportLRDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				showLayer();

				if(response.CorporateAccount != undefined) {
					slickGridWrapper2.setGrid(response);
					hideLayer();
				}
			})
		}
	});
});

