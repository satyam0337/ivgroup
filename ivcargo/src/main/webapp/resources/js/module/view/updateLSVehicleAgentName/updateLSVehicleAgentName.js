define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(UrlParameter, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	let 	_this = '',	myNod, dispatchLedgerId, redirectTo;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');		
		}, render: function() {
			let jsonObject = new Object();
			jsonObject["dispatchLedgerId"] 		= dispatchLedgerId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/getUpdateVehicleAgentNameElement.do', _this.renderUpdateVehicleAgent, EXECUTE_WITH_ERROR);
			return _this;
		}, renderUpdateVehicleAgent : function (response){
			if(response.message != undefined){
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					window.close();
				}, 2000);
				return;
			}
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/updateLSVehicleAgentName/updateLSVehicleAgentName.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				hideLayer();
					
				Selectizewrapper.setAutocomplete({
					url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?',
					valueField			: 'vehicleAgentMasterId',
					labelField			: 'name',
					searchField			: 'name',
					elementId			: 'vehicleAgentEle',
					responseObjectKey 	: 'result'
				});
							
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				addAutocompleteElementInNode1(myNod, 'vehicleAgentEle', 'Select Vehicle Agent !');
							
				hideLayer();

				$("#updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
			
			return _this;
		}, onSubmit : function() {
			showLayer();
			
			let answer = confirm ("Are you Sure to Update Vehicle Agent Name ?");
				
			if (answer) {
				let jsonObject = new Object();
					
				jsonObject["dispatchLedgerId"] 		= dispatchLedgerId;
				jsonObject["vehicleAgentMasterId"] 	= $('#vehicleAgentEle').val();
				jsonObject["redirectTo"]			= redirectTo;
							
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/updateVehicleAgentName.do', _this.setEditVehicleAgentResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setEditVehicleAgentResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}	
			redirectToAfterUpdate(response);
			hideLayer();
		}
	});
});

