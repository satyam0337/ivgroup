define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'JsonUtility'
         ,'messageUtility'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
         function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	redirectFilter,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');

			jsonObject.waybillId		= wayBillId;
			jsonObject.redirectFilter	= redirectFilter;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/moneyReceiptTxnWS/createMoneyReceiptForLR.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, redirectToPage : function(response) {
			let errorMessage = response.message;
			showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			hideLayer();
				
			if(errorMessage.type != 1)//success
				return false;

			setTimeout(() => {
				redirectToAfterUpdate(response);
			}, 1000);
		}
	});
});