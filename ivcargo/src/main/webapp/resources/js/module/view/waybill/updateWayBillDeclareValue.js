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
	declareValue = 0;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillDeclareValueWS/getPreviousDeclaredValueToUpdate.do?', _this.renderUpdateWayBillRemark, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		renderUpdateWayBillRemark : function(response) {
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWayBillDeclareValue.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {

				declareValue	= response.declareValue;
					
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#declareValue',
					validate		: 'presence',
					errorMessage	: 'Insert Declare Value !'
				});
				
				hideLayer();

				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.updateWayBillDeclareValue();
					}
				});
			});
		}, updateWayBillDeclareValue : function() {
			
			if(declareValue == Number($('#declareValue').val())) {
				showMessage('error', 'Please Enter Different Declare Value !');
				return;
			}
			
			if(!confirm('Are you sure you want Update Declare Vlaue?')) {
				return;
			}
			
			var jsonObject			= new Object();
			
			jsonObject.declareValue		= $('#declareValue').val();
			jsonObject.waybillId		= wayBillId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillDeclareValueWS/updateWayBillDeclaredValue.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
});