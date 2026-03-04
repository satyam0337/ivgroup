define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/creditorInvoice/loadcreditorinvoicemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editcreditorinvoicefilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'nodvalidation'
	,'elementTemplateJs'
	,'autocompleteWrapper'
	,'selectizewrapper'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,ElementModel,NodValidation,Elementtemplateutils,AutoCompleteWrapper,Selectizewrapper,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	myNod,
	ElementModelArray,
	jsonObject,
	bill,
	btModalConfirm;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject				= jsonObjectData;
			bill					= jsonObjectData.bill;
		},
		render: function() {
			if(bill.billBillId > 0) {
				_this.setElements();
			}
		},setElements : function() {
			ElementModelArray = loadModelUrls.elementCollection(jsonObject);
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(function() {
				_this.loadElements();
			}, 1000);

			hideLayer();
		},loadElements : function() {
			//load language is used to get the value of labels 
			var langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			initialiseFocus('.modal-body');
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector		: '#editBillingPartyName',
				validate		: 'validateAutocomplete:#editBillingPartyName',
				errorMessage	: 'Select Proper Party Name !'
			});
			
			Selectizewrapper.setAutocomplete({
				url 				: 	WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?',
				valueField			:	'corporateAccountId',
				labelField			:	'corporateAccountDisplayName',
				searchField			:	'corporateAccountDisplayName',
				elementId			:	'editBillingPartyName',
				responseObjectKey 	: 	'result',
				create				: 	false,
				maxItems			: 	1
			});
			
			$(".ok").on('click', function() {
				var previousPartyId	= bill.billCreditorId;
				var partyId			= Number($('#editBillingPartyName').val());
				
				if(partyId == previousPartyId) {
					showMessage('error', 'Please, Select other Party !');
					return false;
				}
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();
	
					if(bill.billBillId > 0) {
						jsonObjectNew["billId"] 				= bill.billBillId;
						jsonObjectNew["previousPartyId"] 		= previousPartyId;
						jsonObjectNew["corporateAccountId"] 	= partyId;
						jsonObjectNew["previousExecutiveId"] 	= bill.billExecutiveId;
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Billing Party Name ?",
						modalWidth 	: 	30,
						title		:	'Update Billing Party Name',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateBillingPartyName.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=editCreditorInvoice&billId=' + response.billId + '&billNumber=' + response.billNumber+'&print=true',{trigger: true});
				setTimeout(function(){ location.reload(); }, 1000);
				hideLayer();
				return;
			}
		}
	});
});

