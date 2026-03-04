define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/ddm/loadddmupdatemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/updateddmdetailsfilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'elementmodel'
	,'elementTemplateJs'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'nodvalidation'
	,'autocompleteWrapper'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls, FilePath, ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', myNod, ElementModelArray, jsonObject, deliveryRunSheetLedger, btModalConfirm;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject				= jsonObjectData;
			deliveryRunSheetLedger	= jsonObjectData.deliveryRunSheetLedger;
		}, render: function() {
			if(deliveryRunSheetLedger.deliveryRunSheetLedgerId > 0)
				_this.setElements();
		}, setElements : function() {
			ElementModelArray = loadModelUrls.elementCollection(jsonObject);
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(_this.loadElements,200);

			hideLayer();
		},loadElements : function() {
			//load language is used to get the value of labels 
			let langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			initialiseFocus('.modal-body');
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector		: '#lorryHireAmount',
				validate		: 'presence',
				errorMessage	: 'Enter Lorry Hire !'
			});
			
			myNod.add({
				selector		: '#lorryHireAmount',
				validate		: 'integer',
				errorMessage	: 'Should be number'
			});
			
			myNod.add({
				selector		: '#remark',
				validate		: 'presence',
				errorMessage	: 'Enter Remark !'
			});
			
			$(".ok").on('click', function() {
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					let jsonObjectNew 	= new Object();
	
					if(deliveryRunSheetLedger.deliveryRunSheetLedgerId > 0) {
						jsonObjectNew["deliveryRunSheetLedgerId"] 	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
						jsonObjectNew["LorryHireAmount"] 			= Number($('#lorryHireAmount').val());
						jsonObjectNew["remark"] 					= $('#remark').val();
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Lorry Hire ?",
						modalWidth 	: 	30,
						title		:	'Update Lorry Hire',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/deliveryRunsheetWS/updateDDMLorryHireAmount.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.LorryHireAmount != undefined) {
				$('#LorryHireAmout').html(response.LorryHireAmount);
				btModalConfirm.close();
				hideLayer();
			}
		}
	});
});

