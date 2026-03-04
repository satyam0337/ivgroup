let doneTheStuff = false;
define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'
	, '/ivcargo/resources/js/ajax/autocompleteutils.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],	function(Marionette, UrlParameter) {
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
			
				$("#mainContent").load("/ivcargo/html/module/doorpickupls/update/updatePickupLSSourceDestination.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					$('#pickupSourceEle').val(response.pickUpSource);
					$('#pickupDestinationEle').val(response.pickUpDestination);
		
					$("#update").bind("click", function() {
						if ($('#pickupSourceEle').val() == '') {
							showMessage('error', 'Please Enter Proper Pick Up Source');
							changeError1('pickupSourceEle', '0', '0');
							return false;
						}

						if ($('#pickupDestinationEle').val() == '') {
							showMessage('error', 'Please Enter Proper Pick Up Destination');
							changeError1('pickupSourceEle', '0', '0');
							return false;
						}
							
						if ($('#pickupSourceEle').val() == response.pickUpSource && $('#pickupDestinationEle').val() == response.pickUpDestination) {
							showMessage('error', 'Can not update same Pickup Source And  Pickup Destination!');
							changeError1('pickupSourceEle', '0', '0');
							return false;
						}
													
						_this.updateSourceDestination();
					});

					hideLayer();
				});
			}, updateSourceDestination: function() {
				let jsonObject = new Object();
				
				jsonObject["doorPickupLedgerId"] 		= doorPickupLedgerId;
				jsonObject.pickUpSource					= $('#pickupSourceEle').val();
				jsonObject.pickUpDestination 			= $('#pickupDestinationEle').val();
															
				if (!doneTheStuff) {
					doneTheStuff = true;
					$('#update').hide();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: "Do You Want To Update PickUp Source And Destination?",
						modalWidth	: 30,
						title		: 'PickUp Source And Destination',
						okText		: 'YES',
						showFooter	: true,
						okCloses	: false
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						$('#update').hide();
						getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/updatePickupSourceDestination.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
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