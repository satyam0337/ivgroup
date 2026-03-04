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
				selector		: '#driverName',
				validate		: 'presence',
				errorMessage	: 'Insert Driver Name !'
			});
			
			myNod.add({
				selector		: '#driverNumber',
				validate		: 'integer',
				errorMessage	: 'Should be numeric'
			});
			
			var driverName = new Object();
			driverName.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getDriverAutocomplete.do';
			driverName.primary_key 	= 'driverMasterId';
			driverName.callBack 	= _this.setDriverDetailsOnDriverSelect;
			driverName.field 		= 'driverName';
			
			$("#driverName").autocompleteCustom(driverName);
			
			$(".ok").on('click', function() {
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();
	
					if(deliveryRunSheetLedger.deliveryRunSheetLedgerId > 0) {
						jsonObjectNew["deliveryRunSheetLedgerId"] 	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
						jsonObjectNew["driverName"] 				= $('#driverName').val();
						jsonObjectNew["driverMasterId"] 			= Number($('#driverName_primary_key').val());
						jsonObjectNew["MobileNumber"] 				= $('#driverNumber').val();
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Driver Details ?",
						modalWidth 	: 	30,
						title		:	'Update Driver Details',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					console.log(jsonObjectNew);
	
					btModalConfirm.on('ok', function() {
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/deliveryRunsheetWS/updateDDMDriverDetails.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, setDriverDetailsOnDriverSelect : function() {
			var jsonObject = new Object();
			jsonObject.driverMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/driverWS/getDriverDetailsById.do', _this.setDriverDetails, EXECUTE_WITHOUT_ERROR);
		}, setDriverDetails : function(response) {
			var driverMaster	= response.DriverMaster;
			
			if(driverMaster != undefined) {
				$('#driverNumber').val(driverMaster.mobileNumber);
			}
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				$('#DriverName').html(response.driverName);
				$('#DriverNumber').html(response.MobileNumber);
				btModalConfirm.close();
				hideLayer();
				return;
			}
		}
	});
});

