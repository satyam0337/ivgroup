define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, AutoComplete, AutoCompleteWrapper,
        		 NodValidation,ElementFocusNavigation) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', waybillId, redirectTo, consignmentSummary, previousVehicleNumber = "", lrNumber = "";
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			waybillId 						= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
		},render : function() {
			
			if(waybillId > 0) {
				jsonObject	= new Object();
				jsonObject.waybillId	= waybillId;
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLRVehicleNumberWS/getEditVehicleNumberElement.do', _this.renderUpdateVehicleNumber, EXECUTE_WITH_ERROR);
			}
			
			return _this;
		},renderUpdateVehicleNumber : function (response){
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLRVehicleNumber/editLRVehicleNumber.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var autoVehicleNumber 			= new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);
				
				consignmentSummary		= response.consignmentSummary;
				lrNumber				= consignmentSummary.wayBillNumber;
				previousVehicleNumber	= consignmentSummary.vehicleNumber;

				$('#lrNumber').html(lrNumber);
				$('#previousVehicleNumber').html(previousVehicleNumber);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector	: '#vehicleNumber',
					validate	: 'validateAutocomplete:#vehicleNumber_primary_key',
					errorMessage: 'Select Vehicle Number !'
				});

				hideLayer();
				
				$("#updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		
		}, onSubmit : function() {
			showLayer();
			var answer = confirm ("Are you Sure to Update Vehicle Number ?");
			
			if (answer) {
				var jsonObject = new Object();
				
				jsonObject["waybillId"] 			= waybillId;
				jsonObject["vehicleNumber"] 		= $('#vehicleNumber').val();
				jsonObject["previousVehicleNumber"] = previousVehicleNumber;
				jsonObject["redirectTo"]			= redirectTo;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLRVehicleNumberWS/editLRVehicleNumber.do', _this.setEditVehicleNumberResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setEditVehicleNumberResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'success') {
					setTimeout(() => {
						redirectToAfterUpdate(response);
					}, 2000);
				}
			}
		}
	});
});