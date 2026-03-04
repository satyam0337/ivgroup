define([
	'marionette'
	,'slickGridWrapper2'
	,'JsonUtility'
    ,'messageUtility'
    ,'focusnavigation'
    ,'nodvalidation'
],function(Marionette, slickGridWrapper2) {
	'use strict';
	var jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/driverWS/getDriverMasterDetail.do?', _this.setDriveMasterDetails, EXECUTE_WITHOUT_ERROR);
		}, setDriveMasterDetails : function(response){
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/driverMaster/driverMasterDetail.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined) {
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
				}
				
				hideLayer();
			});
		}
	});
});