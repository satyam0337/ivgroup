define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	],function(SlickGridWrapper){
	'use strict';
	var jsonObject = new Object(), _this = '',btModal;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseLrSequenceCounterWS/getPartyEditLogs.do?', _this.renderPartyHistoryElements, EXECUTE_WITH_ERROR);
			return _this;
		}, renderPartyHistoryElements : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/sequencecounter/partyHistorySequenceCounter.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				btModal.close();
				return;
			}
			
			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined) {
					hideAllMessages();
					SlickGridWrapper.setGrid(response);
				}
				
				hideLayer();
			});
		}
	});
})