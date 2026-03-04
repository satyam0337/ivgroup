define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	'focusnavigation', 
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function(UrlParameter) {
	'use strict';
	let _this = '', 
		myNod, 
		btModalConfirm, 
		lhpvId, 
		redirectFilter = 0;
		 return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);

			lhpvId 			= UrlParameter.getModuleNameFromParam("lhpvId");
			redirectFilter	= UrlParameter.getModuleNameFromParam("masterid2");
		}, render: function() {
			let jsonObject = new Object();
			jsonObject.lhpvId = lhpvId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/getLHPVDataToUpdateKilometers.do', _this.loadElements, EXECUTE_WITH_ERROR);
		}, loadElements: function(response) {
			hideLayer();
			
			if (redirectFilter > 0) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/editLHPV/editLhpvKilometers.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					if (response.message != undefined) {
						$('#kilometers').hide()
						hideLayer();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if (errorMessage.type == 1) {
							setTimeout(() => {
								window.close();
							}, 1500);
						}
					}
					
					_this.setPreviuosLHPVData(response);
					_this.setModel();
				});
			} else {
				_this.setModel();
			}
		}, setPreviuosLHPVData: function(response) {
			$('#openingKilometer').val(response.openingKilometer)
			$('#closingKilometer').val(response.closingKilometer)
		}, setModel: function() {
			myNod = nod();
			myNod.configure({
				parentClass: 'validation-message'
			});

			myNod.add({
				selector: '#openingKilometer',
				validate: 'presence',
				errorMessage: 'Enter Opening KM !'
			});

			myNod.add({
				selector: '#closingKilometer',
				validate: 'presence',
				errorMessage: 'Enter Closing KM !'
			});

			$(".ok").on('click', function() {
				myNod.performCheck();

				if (myNod.areAll('valid')) {
					let jsonObjectNew = new Object();

					if (lhpvId > 0) {
						jsonObjectNew["lhpvId"]				= lhpvId;
						jsonObjectNew["openingKilometer"]	= $('#openingKilometer').val();
						jsonObjectNew["closingKilometer"]	= $('#closingKilometer').val();
						jsonObjectNew["redirectTo"] 		= Number(redirectFilter);
					}

					btModalConfirm = new Backbone.BootstrapModal({
						content: "Are you sure you want to Update Kilometers?",
						modalWidth: 30,
						title: 'Edit LHPV Kilometers',
						okText: 'YES',
						showFooter: true,
						okCloses: true
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObjectNew, WEB_SERVICE_URL + '/LHPVWS/updateLHPVKilometers.do', _this.onUpdate, EXECUTE_WITH_ERROR);
					});
				} else {
					return false;
				}
			});
		}, onUpdate: function(response) {
			if (response.message !== undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			setTimeout(function() {
				redirectToAfterUpdate(response);
			}, 1500);

			hideLayer();
		}
	});
});
