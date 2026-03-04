define([
	'marionette'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'validation'
	,'focusnavigation'
	], function(Marionette, UrlParameter, slickGridWrapper2) {
	'use strict'; 
	let dispatchLedgerId, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			this.$el.html(this.template);
		}, render : function() {
			let jsonObject = new Object();
			jsonObject["dispatchLedgerId"] = dispatchLedgerId ;
			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/getAllEWayBillDetailsOfDispatch.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/allEwayBillOnDispatch.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				hideLayer();
				
				if(response.message != undefined) {
					setTimeout(function() {
						window.close();
					}, 2000);
					
					return;
				}
					
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
				
				hideLayer();
			});
		}
	});
});