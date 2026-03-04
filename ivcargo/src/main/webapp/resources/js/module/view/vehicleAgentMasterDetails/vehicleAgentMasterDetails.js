define([
	 	'slickGridWrapper2'
		,'JsonUtility'
		,'messageUtility'
],function(slickGridWrapper2) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleAgentMasterWS/getVehicleAgentMasterDetails.do?',	_this.setVehicleAgentDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setVehicleAgentDetails : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(function() {
					window.close();
				}, 500);
				
				return;
			}
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/vehicleAgentMasterDetails.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				slickGridWrapper2.setGrid(response);
			});
		}
	});
});