define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
],function(slickGridWrapper2){
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/configHamaliMasterForVehicleTypeWS/getConfigHamaliRateDetails.do?',	_this.setConfigHamaliRateDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setConfigHamaliRateDetails : function(response) {
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
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/master/vehicleNumberMasterDetail.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				if(response.CorporateAccount != undefined) {
					$("*[data-selector=header]").html('Vehicle Cofig Hamali Details');
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
				}
				
				hideLayer();
				
			});
		}
	});
});

function updateConfigHamaliRates(grid, dataView,row) {	
	hideLayer();
	
	require([PROJECT_IVUIRESOURCES+'/resources/js/masters/view/configHamaliMasterForVehicleType/updateConfigHamaliMaster.js'], function(UpdateConfigHamaliMaster){
		if(dataView.getItem(row).configHamaliForVehicleTypeId != undefined) {
			let jsonObject 			= new Object();
			jsonObject 				= dataView.getItem(row);

			let object 				= new Object();
			object.dataView 		= jsonObject;
			object.gridObj 			= grid;
			object.configHamaliForVehicleTypeId			= dataView.getItem(row).configHamaliForVehicleTypeId;
			
			let btModal = new Backbone.BootstrapModal({
				content: new UpdateConfigHamaliMaster(object),
				modalWidth : 100,
				title:'Update Config Hamali Details'

			}).open();
			object.btModal = btModal;
			new UpdateConfigHamaliMaster(object)
			btModal.open();
		}
	});
}

function deleteConfigHamaliRates(grid, dataView,row) {
	showLayer();
	
	let jsonObject 								= new Object();
	jsonObject.configHamaliForVehicleTypeId 	= dataView.getItem(row).configHamaliForVehicleTypeId;
	
	getJSON(jsonObject, WEB_SERVICE_URL	+ '/configHamaliMasterForVehicleTypeWS/deleteConfigHamaliRates.do?', setSuccessAfterDelete, EXECUTE_WITH_ERROR);
}

function setSuccessAfterDelete(response) {
	if(response.message != undefined) {
		hideLayer();
		$('#middle-border-boxshadow').addClass('hide');
		childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=configHamaliMasterDetails','newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}