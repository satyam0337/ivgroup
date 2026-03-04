define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
         ,'JsonUtility'
         ,'messageUtility'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, Selectizewrapper2) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	wayBillId,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/generatePartialCRWS/getPartialConsignmentDetailsByWaybillId.do?', _this.setConsignmentDetails, EXECUTE_WITHOUT_ERROR);
		}, setConsignmentDetails : function(response) {
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/waybill/partialConsignmentDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 2000);
					return;
				}
				
				hideLayer();
				Selectizewrapper2.setGrid(response);
			});
		}
	});
});