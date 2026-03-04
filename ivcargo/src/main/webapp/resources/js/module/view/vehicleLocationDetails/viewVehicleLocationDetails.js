var wayBillId;
define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'focusnavigation'
],
	function(Marionette, UrlParameter) {
		'use strict';// this basically give strictness to this specific js
		var jsonObject = new Object(), _this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId = UrlParameter.getModuleNameFromParam('wayBillId');
				jsonObject.waybillId = wayBillId;
			}, render: function() {
				jsonObject = new Object();
				jsonObject.waybillId = wayBillId;

				getJSON(jsonObject, WEB_SERVICE_URL + '/vehicleLocationDetailsWS/getVehicleLocationDetailsByWayBillId.do?', _this.setVehicleDetails, EXECUTE_WITHOUT_ERROR);
			}, setVehicleDetails: function(response) {
				var loadelement = new Array();
				var baseHtml = new $.Deferred();

				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/waybill/viewVehicleLocationDetails/viewVehicleLocationDetails.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();

					hideLayer();
					
					if (response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					
					_this.setlocationDetails(response);
				});
			}, setlocationDetails: function(response) {
				var obj = response.vehicleDetails;

				$("*[ data-vehicle='number']").html(obj.vehicleNo);

				$("#location").click(function() {
					window.location.href = response.googleMapLink;
				});
			}

		});
	})