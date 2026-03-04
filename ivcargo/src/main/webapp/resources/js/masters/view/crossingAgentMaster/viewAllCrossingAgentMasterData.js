define([
	 'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
],function(slickGridWrapper2) {
	'use strict';
	var jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingAgentMasterWS/viewAllCrossingAgentMasterData.do?',	_this.setMasterDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setMasterDetails : function(response) {
			$("*[data-selector=header]").html('Crossing Agent Details');
			
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				setTimeout(function() {
					window.close();
				}, 200);
				
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/master/vehicleNumberMasterDetail.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined)
					slickGridWrapper2.setGrid(response);
				
				hideLayer();
				
			});
			
		}
	});
});