define([
	 'JsonUtility',
	 'messageUtility',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/module/view/podbill/podbillphotosignatureupload.js'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	
],//PopulateAutocomplete
function(JsonUtility, MessageUtility, Lingua, Language, BootstrapSwitch,  NodValidation, FocusNavigation,
		 BootstrapModal, PODPhotoUpload,UrlParameter){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet,_this, noOfFileToUpload, maxSizeOfFileToUpload,billId,billNumber,noOfFileToUploadForSignature
	,ElementModelArray,
	SignatureModelArray;
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			billId = UrlParameter.getModuleNameFromParam('billId');
			billNumber = UrlParameter.getModuleNameFromParam('billNumber');
		},render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/podBillWS/getPodBillPhotoConfiguration.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},getResponseForView : function(response){
			
			noOfFileToUpload		= response.podBillProperties.noOfFileToUpload;
			maxSizeOfFileToUpload	= response.podBillProperties.maxSizeOfFileToUpload;
			noOfFileToUploadForSignature  = response.podBillProperties.noOfFileToUploadForSignature;
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/podBill/podBill.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				var jsonObject 		= new Object();
				jsonObject["billId"] 	= billId;
				jsonObject["billNumber"] 	= billNumber;
				
				var object 						= new Object();
				object.elementValue	 			= jsonObject;
				object.noOfFileToUpload 					= noOfFileToUpload;
				object.noOfFileToUploadForSignature 		= noOfFileToUploadForSignature;
				object.maxSizeOfFileToUpload 	= maxSizeOfFileToUpload;

				var btModal = new Backbone.BootstrapModal({
					content		: new PODPhotoUpload(object),
					modalWidth 	: 80,
					title		:'POD Photo/Signature Upload for Bill No. <b>' + billNumber + '</b>',
					okText		: 'Upload',
					showFooter	: true,
					modalBodyId	: 'photoModal',
					okCloses	:	false
				}).open();
				
				object.btModal = btModal;
				
				new PODPhotoUpload(object);
				btModal.open();
				
				btModal.on('cancel', function() {
					window.close();
				});
				
			});
			
		
			
		}
	});
});