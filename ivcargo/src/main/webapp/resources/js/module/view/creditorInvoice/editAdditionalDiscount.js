define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/creditorInvoice/loadcreditorinvoicemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editcreditorinvoicefilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'elementmodel'
	,'elementTemplateJs'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls, FilePath, ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	ElementModelArray,
	myNod,
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
			
			$('#additionalDiscountPercentage').bootstrapSwitch({
				on 				: 'YES',
				off 			: 'NO',
				onLabel 		: 'YES',
				offLabel 		: 'NO',
				deactiveContent : 'Do you want to take in percentage ?',
				activeContent 	: 'Do you want to take in percentage ?'
			});
			
			$(".ok").on('click', function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					let jsonObjectNew 	= new Object();
					
					jsonObjectNew["billId"] 				= bill.billBillId;
					jsonObjectNew["additionalDiscount"] 	= $('#AdditionalDiscount').val();
					jsonObjectNew["percentage"]				= $('#additionalDiscountPercentage').is(':checked');
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Additional Discount?",
						modalWidth 	: 	30,
						title		:	'Update Additional Discount',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						console.log(jsonObjectNew);
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateBillAdditionalDiscount.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				$('#additionalDiscount').html(response.additionalDiscount);
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

