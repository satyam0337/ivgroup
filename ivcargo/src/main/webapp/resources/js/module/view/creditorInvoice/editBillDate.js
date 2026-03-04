define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/creditorInvoice/loadcreditorinvoicemodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editcreditorinvoicefilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'language'//import in require.config
	,'errorshow'
	, 'moment'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'nodvalidation'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,moment,datepickerWrapper,JsonUtility,MessageUtility,ElementModel,NodValidation,Elementtemplateutils,constant,BootstrapModal) {
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
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector	: '#remark',
				validate	: 'presence',
				errorMessage: 'Select Bill Date !'
			});
			
			$('#billDate').SingleDatePickerCus({
				minDate : moment().subtract(bill.manualInvoiceDaysAllowed, 'days')
			});
			
			$(".ok").on('click', function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var jsonObjectNew 	= new Object();
	
					if(bill.billBillId > 0) {
						jsonObjectNew["billId"] 				= bill.billBillId;
						jsonObjectNew["previousBillDate"]		= toDateTimeString(new Date(bill.billCreationDateTimeStamp));
						jsonObjectNew["billDate"] 				= $('#billDate').val();
						jsonObjectNew["previousExecutiveId"] 	= bill.billExecutiveId;
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Bill Date?",
						modalWidth 	: 	30,
						title		:	'Update Bill Date',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
	
					btModalConfirm.on('ok', function() {
						console.log(jsonObjectNew);
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/creditorInvoiceWS/updateBillDate.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				$('#BillDate').html(response.billDate);
				btModalConfirm.close();
				hideLayer();
				return;
			}
		}
	});
});

