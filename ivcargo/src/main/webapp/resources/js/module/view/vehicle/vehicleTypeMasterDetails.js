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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleTypeWS/viewAllVehicleTypeDetails.do?', _this.setVehicleTypeDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setVehicleTypeDetailsData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				setTimeout(function() {
					window.close();
				}, 200);
				
				return;
			}
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/vehicleTypeMasterDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideAllMessages();
				slickGridWrapper2.setGrid(response);
			});
		}
	});
});