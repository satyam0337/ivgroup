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
	var _this = '', categoryTypeId, btModal, jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 				= this;
			btModal				= jsonObjectData.btModal;
			categoryTypeId		= jsonObjectData.categoryTypeId;
		}, render: function() {
			showLayer();
			
			jsonObject	= {};
			
			jsonObject.categoryTypeId	= categoryTypeId;
			
			if(categoryTypeId > 0)
				getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/getCategoryEditLogsByCategory.do', _this.setDetails, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/getCategoryEditLogs.do', _this.setDetails, EXECUTE_WITH_ERROR);
		}, setDetails : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				btModal.close()
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			hideAllMessages();

			setTimeout(function() {
				slickGridWrapper2.setGrid(response);
			}, 1000);
			
			hideLayer();
		}
	});
});