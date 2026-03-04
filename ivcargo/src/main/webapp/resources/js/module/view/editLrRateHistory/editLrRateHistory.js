define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editLrRateHistory/editLrRateHistoryFilePath.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'slickGridWrapper2',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	masterLangKeySet,
	gridObject,
	masterLangObj,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			
			jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLRRateHistoryWS/getLrRateEditHistory.do?', _this.setLrRateHistory, EXECUTE_WITHOUT_ERROR);
	
		}, setLrRateHistory : function(response) {
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/waybill/editLrRateHistory/editLrRateHistory.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				
				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 2000);
					return;
				}
				if(response.EditLrRateHistory == undefined){
					return;
				}
				var ColumnConfig		= response.EditLrRateHistory.columnConfiguration;
				var columnKeys			= _.keys(ColumnConfig);
				var bcolConfig			= new Object();
				
				for (var i=0; i<columnKeys.length; i++) {
					var bObj		= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]]	= bObj;
					}
				}
				response.EditLrRateHistory.columnConfiguration		= _.values(bcolConfig);
				response.EditLrRateHistory.Language					= masterLangKeySet;
				
				hideLayer();
				//$("*[data-selector='header']").html("LR Remarks");
				gridObject = Selectizewrapper2.setGrid(response.EditLrRateHistory);
			});
		}
	});
});