define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	myNod,
	_this = '',
	invoiceNo,
	previousInvoiceNo,
	redirectFilter = 0;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 					= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter				= UrlParameter.getModuleNameFromParam('redirectFilter');
		},
		render: function() {
			
			var jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRInvoiceNumberWS/getPreviousInvoiceNumberToUpdate.do?', _this.renderEditLrInvoiceNumber, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		renderEditLrInvoiceNumber : function(response) {
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateLrInvoiceNumber.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#invoiceNo',
					validate		: 'presence',
					errorMessage	: 'Enter Invoice Number !'
				});
				
				hideLayer();
				
				previousInvoiceNo	= response.previousInvoiceNo;
				
				$("#previousInvoiceNo").html('<b>Previous Invoice No. - ' + previousInvoiceNo + '</b>');

				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.editLrInvoiceNumber();
					}
				});
			});
		}, editLrInvoiceNumber : function() {
			
			var jsonObject					= new Object();
			
			invoiceNo						=  $('#invoiceNo').val();
			
			jsonObject.invoiceNo			= invoiceNo;
			jsonObject.waybillId			= wayBillId;
			jsonObject.redirectFilter		= redirectFilter;
			
			if(previousInvoiceNo == invoiceNo) {
				showMessage('error', 'Entered Invoice Number Is Same As Previous Invoice Number');
				return false;
			} 
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRInvoiceNumberWS/updateLrInvoiceNumber.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
});