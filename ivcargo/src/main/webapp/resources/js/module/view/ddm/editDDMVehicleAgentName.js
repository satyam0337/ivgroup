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
	let 
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
				selector		: '#vehicleAgentName',
				validate		: 'validateAutocomplete:#vehicleAgentName_primary_key',
				errorMessage	: 'Select Vehicle Agent !'
			});
			
			let vehicleAgentName			= new Object();
			vehicleAgentName.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do';
			vehicleAgentName.primary_key 	= 'vehicleAgentMasterId';
			vehicleAgentName.field 			= 'name';
			
			$("#vehicleAgentName").autocompleteCustom(vehicleAgentName);
			
			$(".ok").on('click', function() {
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					let jsonObjectNew 	= new Object();
	
					jsonObjectNew["deliveryRunSheetLedgerId"] 	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					jsonObjectNew["vehicleAgentId"] 			= Number($('#vehicleAgentName_primary_key').val());
					jsonObjectNew["vehicleAgentName"] 			= $('#vehicleAgentName').val();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Vehicle Agent Name?",
						modalWidth 	: 	30,
						title		:	'Update Vehicle Agent Name',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						console.log(jsonObjectNew);
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/deliveryRunsheetWS/updateDDMVehicleAgentName.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.vehicleAgentName != undefined) {
				$('#VehicleAgentName').html(response.vehicleAgentName);
				btModalConfirm.close();
				hideLayer();
			}
		}
	});
});

