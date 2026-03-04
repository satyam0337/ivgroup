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
				masterId = UrlParameter.getModuleNameFromParam("receivedLedgerId")
				_this = this;
			},render: function() {
				jsonObject.ReceivedLedgerId = masterId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/hamaliDetailsWs/getUnLoadingHamaliDetailsPrintByDispatchLedgerId.do?', _this.onGetMinifiedLSPrintByDLId, EXECUTE_WITHOUT_ERROR);
				return _this;
			},onGetMinifiedLSPrintByDLId : function(response){
				hideLayer();
				console.log('response222',response);
				require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/hamaliDetailsPrint/unloadingHamaliPrint/unloadingHamaliPrint_544.js'],function(MinifiedLoadingSheetSetup){
					var flag	= 1;
					MinifiedLoadingSheetSetup.renderElements(response, _this, flag);
				})
				setTimeout(function() {
					window.print();
				}, 500);
				
				
			},onPrint:function(){
				MinifiedLoadingSheetSetup.onPrint();
			}
			
		});
});