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
	,'nodvalidation'
	,'elementTemplateJs'
	,'autocompleteWrapper'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,ElementModel,NodValidation,AutoCompleteWrapper,Elementtemplateutils,constant,BootstrapModal) {
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
				selector		: '#collectionPersonName',
				validate		: 'validateAutocomplete:#collectionPersonName_primary_key',
				errorMessage	: 'Select Proper Collection Person !'
			});
			
			var collectionPerson = new Object();
			collectionPerson.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getCollectionPersonAutocomplete.do';
			collectionPerson.primary_key 	= 'collectionPersonMasterId';
			collectionPerson.field 			= 'name';
			
			$("#collectionPersonName").autocompleteCustom(collectionPerson);
			
			$(".ok").on('click', function() {
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();
	
					if(bill.billBillId > 0) {
						jsonObjectNew["billId"] 				= bill.billBillId;
						jsonObjectNew["preCollectionPersonId"] 	= bill.billCollectionPersonId;
						jsonObjectNew["collectionPersonId"] 	= Number($('#collectionPersonName_primary_key').val());
						jsonObjectNew["previousExecutiveId"] 	= bill.billExecutiveId;
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Collection Person?",
						modalWidth 	: 	30,
						title		:	'Update Collection Person',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						console.log(jsonObjectNew);
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateBillCollectionPerson.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				var CollectionPersonMaster	= response.CollectionPersonMaster;
				$('#CollectionPersonName').html(CollectionPersonMaster.name);
				btModalConfirm.close();
				hideLayer();
				return;
			}
		}
	});
});

