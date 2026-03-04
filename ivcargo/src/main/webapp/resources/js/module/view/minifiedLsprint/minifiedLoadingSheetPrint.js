define([
        'JsonUtility'
        ,'messageUtility'
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ,'jquerylingua'
        ,'language'
        ],
        function(JsonUtility,MessageUtility,UrlParameter,jquerylingua, language){
		'use strict';// this basically give strictness to this specific js
		var 
		masterId = "0"
		,_this = ''
		,jsonObject	= new Object();
		return Marionette.LayoutView.extend({
			initialize: function(masterObj){
				masterId = UrlParameter.getModuleNameFromParam(MASTERID)
				_this = this;
			},render: function() {
				jsonObject.dispatchLedgerId = masterId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/getMinifiedLoadingSheetPrintByDispatchLedgerId.do?', _this.onGetMinifiedLSPrintByDLId, EXECUTE_WITHOUT_ERROR);
				return _this;
			},onGetMinifiedLSPrintByDLId : function(response){
				hideLayer();
				require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/minifiedLsprint/minifiedloadingsheetsetup_1.js'],function(MinifiedLoadingSheetSetup){
					var flag	= 1;
					MinifiedLoadingSheetSetup.renderElements(response, _this, flag);
				})
				
			},onPrint:function(){
				MinifiedLoadingSheetSetup.onPrint();
			}
			
		});
});