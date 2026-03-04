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
				masterId = UrlParameter.getModuleNameFromParam('shortCreditCollLedgerId');
				_this = this;
			},render: function() {
				jsonObject.shortCreditCollLedgerId = masterId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/stbsWS/getShortCreditCollectionSheetSummaryPrintByShortCreditCollLedgerId.do?', _this.onGetShortCreditSummaryPrint, EXECUTE_WITHOUT_ERROR);
				return _this;
			},onGetShortCreditSummaryPrint : function(response){
				hideLayer();
				require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/stbs/shortCreditSummaryPrintSetup.js']
				,function(shortCreditSummaryPrintSetup){
					shortCreditSummaryPrintSetup.renderElements(response, _this);
				});
				
			}
		});
});