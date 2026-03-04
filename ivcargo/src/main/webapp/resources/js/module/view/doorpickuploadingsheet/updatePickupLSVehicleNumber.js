let doneTheStuff = false;
define(['marionette'
	, PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],	function(Marionette, UrlParameter, Selection) {
		'use strict';// this basically give strictness to this specific js
		let btModalConfirm, doorPickupLedgerId, _this = '';
		return Marionette.LayoutView.extend({
			initialize: function() {
				_this = this;
				
				doorPickupLedgerId	= UrlParameter.getModuleNameFromParam(MASTERID);
				
				let jsonObject = new Object();
				jsonObject.doorPickupLedgerId	= doorPickupLedgerId;
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/getDoorPickupDispatchElement.do',_this.renderUpdateVehicleNumber, EXECUTE_WITHOUT_ERROR);
			}, renderUpdateVehicleNumber: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);
			
				$("#mainContent").load("/ivcargo/html/module/doorpickupls/update/updatePickupLSVehicleNumber.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					response.vehicleSelection	= true;
					response.vehicleNo			= true;
					
					let elementConfiguration	= {};
					
					elementConfiguration.vehicleElement	= $("#vehicleNoEle");
					response.elementConfiguration	= elementConfiguration;
					
					Selection.setSelectionToGetData(response);
										
					let myNod = Selection.setNodElementForValidation(response);

					$("#update").bind("click", function() {
						myNod.performCheck();
						
						if (myNod.areAll('valid')) {
							if(response.vehicleNumberMasterId == $('#vehicleNoEle_primary_key').val()) {
								showMessage('error', 'Can not update same Vehicle Number !');
								return;
							}	
							
							_this.updateVehicleNumber();
						}
					});

					hideLayer();
				});
			}, updateVehicleNumber: function() {
				let jsonObject = new Object();
				
				jsonObject["doorPickupLedgerId"] 		= doorPickupLedgerId;
				jsonObject["vehicleNumberMasterId"]		= $('#vehicleNoEle_primary_key').val();
												
				if (!doneTheStuff) {
					doneTheStuff = true;
					$('#update').hide();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: "Do You Want To Update Vehicle Number?",
						modalWidth	: 30,
						title		: 'Update Vehicle Number',
						okText		: 'YES',
						showFooter	: true,
						okCloses	: false
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						$('#update').hide();
						getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/updateDoorPickupLedgerVehicleNumber.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
					});

					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
						$('#update').show();
					});
				}
			}, onUpdate: function(response) {
				redirectToAfterUpdate(response);
			}
		});
	});