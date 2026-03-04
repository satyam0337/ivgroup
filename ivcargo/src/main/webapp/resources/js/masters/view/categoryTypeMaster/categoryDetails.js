/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '', dataViewDetails,
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 				= this;
			btModal				= jsonObjectData.btModal;
		}, render: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/getAllCategory.do', _this.setDetails, EXECUTE_WITHOUT_ERROR);
		}, setDetails : function(response) {
			if(response.message != undefined) {
				btModal.close()
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			hideAllMessages();

			setTimeout(function() {
				response.tableProperties.callBackFunctionForPartial = _this.updateMFD;
				slickGridWrapper2.setGrid(response);
			}, 1000);
			
			hideLayer();
		}, updateMFD : function(grid, dataView, row) {
			hideLayer();
			
			dataViewDetails	= dataView.getItem(row);

			if(dataViewDetails.markForDelete == false) {
				showMessage('error', 'Category is not deleted !');
				return;
			}
			
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Activate ?",
				modalWidth 	: 	30,
				title		:	'Activate Category',
				okText		:	'Activate',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			btModalConfirm.on('ok', function() {
				var jsonObject = new Object();
				jsonObject["categoryTypeId"] 	= dataViewDetails.categoryTypeId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/updateMFDCategoryById.do', _this.setResponse, EXECUTE_WITHOUT_ERROR);
			});
		}, setResponse : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				
				if(errorMessage.type == 1 && dataViewDetails != undefined)//success
					dataViewDetails.deleted = '';
				
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
});