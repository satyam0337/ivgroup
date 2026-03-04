define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/creditorInvoice/loadcreditorinvoicemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editcreditorinvoicefilepath.js'
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
	var 
	_this = '',
	myNod,
	ElementModelArray,
	jsonObject,
	bill,
	btModalConfirm,
	billId,
	wayBillId,
	redirectFilter = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			/*These two value coming from Search module if Remark is edited from Search module*/
			billId 					= UrlParameter.getModuleNameFromParam('billId');
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
			
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject				= jsonObjectData;
			
			if(billId == null || billId == 0) {
				bill	= jsonObjectData.bill;
				billId	= bill.billBillId;
				wayBillId = jsonObjectData.wayBillId;
			}
		},
		render: function() {
			if(billId > 0) {
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
			
			setTimeout(function() {
				_this.loadElements();
			}, 1000);

			hideLayer();
		},loadElements : function() {
			if(redirectFilter > 0) {
				var loadelement = new Array();
				var baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/creditorInvoice/EditCreditorInvoiceRemark.html",
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
	
					if(billId > 0) {
						jsonObjectNew["billId"] 	= billId;
						jsonObjectNew["waybillId"] 	= wayBillId;
						jsonObjectNew["remark"] 	= $('#remark').val();
						jsonObjectNew["redirectTo"] = Number(redirectFilter);
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Remark?",
						modalWidth 	: 	30,
						title		:	'Update Remark',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					console.log(jsonObjectNew);
	
					btModalConfirm.on('ok', function() {
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateLRBillRemark.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				if(response.redirectTo > 0) {
					redirectToAfterUpdate(response);
				} else {
					btModalConfirm.close();
					hideLayer();
					return;
				}
			}
		}
	});
});

