define([  'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation, BootstrapModal,UrlParameter, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '',	myNod, ElementModelArray, jsonObject = new Object(), btModalConfirm, lhpvId, redirectFilter = 0, lhpv = null;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			_this = this;
			this.$el.html(this.template);

			lhpvId 				= UrlParameter.getModuleNameFromParam(MASTERID);
		},
		render: function() {
			jsonObject.lhpvId			= lhpvId;
			if(lhpvId > 0) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/getDataToUpdateVehicleAgent.do', _this.setElements, EXECUTE_WITH_ERROR);
			}
		},setElements : function(data) {
				var loadelement = new Array();
				var baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);
				
				console.log('data ', data);

				$("#mainContent").load("/ivcargo/html/module/editLHPV/editLHPVVehicleAgent.html",
						function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					hideLayer();
					
					lhpv	= data.lhpv;
					$('#oldVehicleAgent').val(lhpv.vehicleAgentName);
					$('#oldVehicleAgentId').val(lhpv.vehicleAgentMasterId);
					
							Selectizewrapper.setAutocomplete({
								url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?',
								valueField			: 'vehicleAgentMasterId',
								labelField			: 'name',
								searchField			: 'name',
								elementId			: 'vehicleAgentEle',
								responseObjectKey 	: 'vehicleAgentAutoCompleteList'
							});
							
							setTimeout(() => {
								
								var vehicleAgentSelectize 	= $('#vehicleAgentEle').get(0).selectize;
								
								if(typeof vehicleNumberMaster !== 'undefined') {
									if(typeof vehicleAgentSelectize.search(response.vehicleNumberMaster.vehicleAgentName).items[0] !== 'undefined'){
										vehicleAgentSelectize.setValue(vehicleAgentSelectize.search(response.vehicleNumberMaster.vehicleAgentName).items[0].id);
									} else {
										vehicleAgentSelectize.setValue();
									}
									
									$("#vehicleAgentEle").val(vehicleNumberMaster.vehicleAgentMasterId)
								}
							}, 600);
					
					_this.setModel();
				});
			
			hideLayer();
		},loadElements : function() {
			if(redirectFilter > 0) {
				var jsonObject 	= new Object();
				var loadelement = new Array();
				var baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/editLHPV/editLHPVVehicleAgent.html",
						function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					hideLayer();
					
					lhpv	= 
					
					_this.setModel();
				});
			} else {
				_this.setModel();
			}
		}, setModel : function() {
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector	: '#vehicleAgentEle',
				validate	: 'presence',
				errorMessage: 'Select Vehicle Agent !'
			});

			$(".ok").on('click', function() {
				myNod.performCheck();

				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();

					if(lhpvId > 0) {
						jsonObjectNew["lhpvId"] 			= lhpvId;
						jsonObjectNew["vehicleAgentId"] 	= $('#vehicleAgentEle').val();
					}
					
					//if(Number($('#vehicleAgentEle').val()) == Number($('#oldVehicleAgent').val()))

					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Edit Vehicle Agent?",
						modalWidth 	: 	30,
						title		:	'Edit Vehicle Agent',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/LHPVWS/updateLHPVVehicleAgent.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON

					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}	
			
			setTimeout(function() {
				redirectToAfterUpdate(response);
			},1500);
			
			hideLayer();
		}
	});
});

