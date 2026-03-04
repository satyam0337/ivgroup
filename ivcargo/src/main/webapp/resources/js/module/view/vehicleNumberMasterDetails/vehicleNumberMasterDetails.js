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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleNumberMasterWS/getAllVehicleNumberMasterDetail.do?',	_this.setVehicleNumberMasterDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setVehicleNumberMasterDetails : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
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
			
			$.when.apply($, loadelement).done(function(){
				if(response.CorporateAccount != undefined) {
					$("*[data-selector=header]").html('Vehicle Number Master Detail');
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
				}
				
				hideLayer();
				
			});		
		}
	});
});