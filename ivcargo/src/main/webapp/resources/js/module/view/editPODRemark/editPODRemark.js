define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/editPODRemark/loadeditPODRemarkmodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editPODRemark/editPODRemarkfilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'elementmodel'
	,'nodvalidation'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,UrlParameter,ElementModel,NodValidation,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '',	myNod, ElementModelArray, jsonObject, btModalConfirm, wayBillId, redirectFilter = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

		/*These two value coming from Search module if Remark is edited from Search module*/
		wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
		redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
		
		//initialize is the first function called on call new view()
		//append template first 
		//the html would be set in the el element
		//this object is not found in other function so _this has been created
		_this 					= this;
		jsonObject				= jsonObjectData;
	},
		render: function() {
		if(wayBillId > 0) {
			_this.setElements();
		}
	},setElements : function() {
		if(redirectFilter <= 0) {
			ElementModelArray = loadModelUrls.elementCollection(jsonObject);
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
		}
		
		setTimeout(_this.loadElements,200);

		hideLayer();
	},loadElements : function() {
			if(redirectFilter > 0) {
				var jsonObject 	= new Object();
				var loadelement = new Array();
				var baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/editPODRemark/EditPODRemark.html",
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
	
					if(wayBillId > 0) {
						jsonObjectNew["waybillId"] 	= wayBillId;
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
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/podWayBillsWS/editPODRemark.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.redirectTo > 0) {
				redirectToAfterUpdate(response);
			} else {
				$('#Remark').html(response.remark);
				btModalConfirm.close();
				hideLayer();
				return;
			}
		}
	});
});

