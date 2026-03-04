define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',	myNod, btModalConfirm, lhpvId, redirectFilter = 0;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);

			lhpvId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter   	= UrlParameter.getModuleNameFromParam(MASTERID2);
		}, render: function() {
			if(lhpvId > 0)
				_this.setElements();
		}, setElements : function() {
			setTimeout(_this.loadElements,200);

			hideLayer();
		}, loadElements : function() {
			if(redirectFilter > 0) {
				let loadelement = new Array();
				let baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/editLHPV/editLhpvPan.html",
						function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					hideLayer();
					_this.setModel();
				});
			} else
				_this.setModel();
		}, setModel : function() {
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector	: '#panNumber',
				validate	: 'presence',
				errorMessage: 'Enter Pan Number !'
			});

			$(".ok").on('click', function() {
				myNod.performCheck();

				if(myNod.areAll('valid')) {
					let jsonObjectNew 	= new Object();

					if(lhpvId > 0) {
						jsonObjectNew["lhpvId"] 	= lhpvId;
						jsonObjectNew["PanNumber"] 	= $('#panNumber').val();
						jsonObjectNew["redirectTo"] = Number(redirectFilter);
					}

					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Edit PAN Number?",
						modalWidth 	: 	30,
						title		:	'Edit PAN Number',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/LHPVWS/updateLHPVPan.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}	
			
			setTimeout(function() {
				redirectToAfterUpdate(response);
			},1500);
			
			hideLayer();
		}
	});
});