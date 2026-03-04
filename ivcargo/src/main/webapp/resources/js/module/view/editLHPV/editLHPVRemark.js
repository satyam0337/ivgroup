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
	],function(JsonUtility, MessageUtility, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation, BootstrapModal,UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '',	myNod, ElementModelArray, jsonObject, btModalConfirm, lhpvId, redirectFilter = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			_this = this;
			this.$el.html(this.template);

			lhpvId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter   	= UrlParameter.getModuleNameFromParam(MASTERID2);
		},
		render: function() {
			if(lhpvId > 0) {
				_this.setElements();
			}
		},setElements : function() {
			setTimeout(_this.loadElements,200);

			hideLayer();
		},loadElements : function() {
			if(redirectFilter > 0) {
				var jsonObject 	= new Object();
				var loadelement = new Array();
				var baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/editLHPV/EditLHPVRemark.html",
						function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					hideLayer();
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
				selector	: '#remark',
				validate	: 'presence',
				errorMessage: 'Enter Remark !'
			});

			$(".ok").on('click', function() {
				myNod.performCheck();

				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();

					if(lhpvId > 0) {
						jsonObjectNew["lhpvId"] 	= lhpvId;
						jsonObjectNew["remark"] 	= $('#remark').val();
						jsonObjectNew["redirectTo"] = Number(redirectFilter);
					}

					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Edit Remark?",
						modalWidth 	: 	30,
						title		:	'Edit Remark',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/LHPVWS/updateLHPVRemark.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON

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

