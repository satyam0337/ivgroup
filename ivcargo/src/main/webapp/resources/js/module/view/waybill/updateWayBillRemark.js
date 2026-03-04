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
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillRemarkWS/getPreviousRemarkToUpdate.do?', _this.renderUpdateWayBillRemark, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		renderUpdateWayBillRemark : function(response) {
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWayBillRemark.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#remark',
					validate		: 'presence',
					errorMessage	: 'Insert Remark !'
				});
				
				hideLayer();

				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.updateWayBillRemark();
					}
				});
			});
		}, updateWayBillRemark : function() {
			
			if(!confirm('Are you sure you want Update Remark?')) {
				return;
			}
			
			var jsonObject			= new Object();
			
			jsonObject.remark			= $('#remark').val();
			jsonObject.waybillId		= wayBillId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillRemarkWS/updateWayBillRemark.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
});