define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	],function(SlickGridWrapper){
	'use strict';
	var jsonObject, _this = '',btModal, url;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			url					= jsonObjectData.url;
		},render : function() {
			getJSON(jsonObject, url, _this.renderDeliveredTopayWaybillElements, EXECUTE_WITH_ERROR);
			return _this;
		},renderDeliveredTopayWaybillElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/incomingtopayreport/incomingTopayReportLRDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.message != undefined){
				hideLayer();
				btModal.close();
				return;
			}

			$.when.apply($, loadelement).done(function(){
				if(response.CorporateAccount != undefined) {
					hideAllMessages();
					SlickGridWrapper.setGrid(response);
				}
				
				hideLayer();
			});
		}
	});
})