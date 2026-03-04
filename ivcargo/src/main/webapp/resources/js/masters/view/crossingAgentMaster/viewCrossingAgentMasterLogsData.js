define([
	 'slickGridWrapper2'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
],function(slickGridWrapper2, UrlParameter) {
	'use strict';
	var jsonObject = new Object(), _this = '', crossingAgentId = 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			crossingAgentId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			_this = this;
		},render : function() {
			jsonObject.crossingAgentId	= crossingAgentId;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingAgentMasterWS/viewCrossingAgentMasterLogsData.do?',	_this.setMasterDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setMasterDetails : function(response) {
			$("*[data-selector=header]").html('Crossing Agent Log Details');
			
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