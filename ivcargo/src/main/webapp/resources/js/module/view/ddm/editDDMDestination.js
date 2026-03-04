define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/ddm/loadddmupdatemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/updateddmdetailsfilepath.js'
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
	btModal,
	jsonObject,
	deliveryRunSheetLedger,
	btModalConfirm;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject				= jsonObjectData;
			btModal					= jsonObjectData.btModal;
			deliveryRunSheetLedger	= jsonObjectData.deliveryRunSheetLedger;
		},
		render: function() {
			if(deliveryRunSheetLedger.deliveryRunSheetLedgerId > 0) {
				_this.setElements();
			}
		},setElements : function() {
			ElementModelArray = loadModelUrls.elementCollection(jsonObject);
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(_this.loadElements,200);

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
				selector		: '#ddmDestination',
				validate		: 'validateAutocomplete:#ddmDestination_primary_key',
				errorMessage	: 'Select Proper Destination !'
			});
			
			var driverName = new Object();
			driverName.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteOnRegion.do';
			driverName.primary_key 	= 'branchId';
			driverName.field 		= 'branchName';
			
			$("#ddmDestination").autocompleteCustom(driverName);
			
			$(".ok").on('click', function() {
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();
	
					if(deliveryRunSheetLedger.deliveryRunSheetLedgerId > 0) {
						jsonObjectNew["deliveryRunSheetLedgerId"] 	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
						jsonObjectNew["destinationBranchId"] 		= Number($('#ddmDestination_primary_key').val());
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Destination ?",
						modalWidth 	: 	30,
						title		:	'Update Destination',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					console.log(jsonObjectNew);
	
					btModalConfirm.on('ok', function() {
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/deliveryRunsheetWS/updateDDMDestination.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				$('#ToBranch').html(response.branchName);
				btModalConfirm.close();
				hideLayer();
				return;
			}
		}
	});
});

