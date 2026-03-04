define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
], function(slickGridWrapper2) {
	'use strict';
	let jsonObject = new Object(),_this = '', btModal;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 		= this;
			btModal		= jsonObjectData.btModal;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bankAccountWS/getAllBankDetailsByAccountGroupId.do?', _this.setBankAccountDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBankAccountDetails : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				setTimeout(function() {
					btModal.close();
				}, 200);
				
				return;
			}
			
			setTimeout(function() {
				slickGridWrapper2.setGrid(response);
			}, 200);
				
			hideLayer();
		}
	});
});