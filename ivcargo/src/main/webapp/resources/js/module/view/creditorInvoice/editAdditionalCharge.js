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
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,ElementModel,NodValidation,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	ElementModelArray,
	myNod,
	jsonObject,
	bill, additionalChargeLable = '',
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
			additionalChargeLable	= jsonObject.additionalChargeLable;
		}, render: function() {
			if(bill.billBillId > 0)
				_this.setElements();
		}, setElements : function() {
			ElementModelArray = loadModelUrls.elementCollection(jsonObject);
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(function() {
				_this.loadElements();
			}, 1000);

			hideLayer();
		}, loadElements : function() {
			//load language is used to get the value of labels 
			let langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			initialiseFocus('.modal-body');
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector	: '#additionalAmount',
				validate	: 'presence',
				errorMessage: 'Enter Amount !'
			});
			
			myNod.add({
				selector		: '#additionalAmount',
				validate		: 'integer',
				errorMessage	: 'Should be numeric'
			});
			
			$(".ok").on('click', function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					let jsonObjectNew 	= new Object();
	
					if(bill.billBillId > 0) {
						jsonObjectNew["billId"] 					= bill.billBillId;
						jsonObjectNew["previousAdditionalAmount"] 	= bill.billAdditionalCharge;
						jsonObjectNew["additionalAmount"] 			= $('#additionalAmount').val();
						jsonObjectNew["previousExecutiveId"] 		= bill.billExecutiveId;
					}
	
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update " + additionalChargeLable + "?",
						modalWidth 	: 	30,
						title		:	'Update ' + additionalChargeLable,
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						console.log(jsonObjectNew);
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateBillAdditionalAmount.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				$('#AdditionalCharge').html(response.additionalAmount);
				$('#BillTotal').html(response.billGrandTotal);
				$('#igst').html(response.igst);
				$('#sgst').html(response.sgst);
				$('#cgst').html(response.cgst);
				$('#totaltaxamount').html(response.totalserviceTaxAmount);
				btModalConfirm.close();
				hideLayer();
			}
		}
	});
});

