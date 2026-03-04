define([
	'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/stbs/shortcreditlrsummaryfilepath.js'
	,'jquerylingua'
	,'language'
	,'slickGridWrapper2'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, SlickGridWrapper){
	'use strict';
	var jsonObject = new Object(), _this = '',btModal, masterLangObj,gridObject, masterLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/stbsBillRegisterReportWS/getAllLrDetailsByStbsShortCreditCollectionLedgerId.do?', _this.renderLrDetailsElements, EXECUTE_WITH_ERROR);
			return _this;
		},renderLrDetailsElements : function(response){
			
			hideLayer();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/stbsbillregisterreport/STBSLrSummaryReport.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.message != undefined){
				refreshAndHidePartOfPage('STBSLrSummaryDiv', 'hide');
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				btModal.close();
				return;
			}
			$.when.apply($, loadelement).done(function(){
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
				
				var ColumnConfig = response.tableConfig.columnConfiguration;
				var columnKeys	= _.keys(ColumnConfig);
				var bcolConfig	= new Object();
				for (var i=0; i<columnKeys.length; i++) {

					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				}
				
				response.tableConfig.columnConfiguration	= bcolConfig;
				response.tableConfig.Language				= masterLangKeySet;
				if(response.tableConfig.CorporateAccount != undefined) {
					
					response.tableConfig.CorporateAccount.sort(function (a, b) {
						return a.lrbillstatus > b.lrbillstatus;
					}).map(function (entry) {
						return entry.lrbillstatus;
					}).reverse()
					
					$('#STBSLrSummaryDiv').show();
					hideAllMessages();
					gridObject = SlickGridWrapper.setGrid(response.tableConfig);
				}
				_this.dueLRColour(gridObject);
				
				$('h4').append("<div><b class='dot'></b><span style='font-size:10px;font-style:italic;margin-left:7px;position:absolute;margin-top:3px;'>   Indicates Due LRs</span></div>")
				hideLayer();
			});
		},dueLRColour:function(slickgrid){
			SlickGridWrapper.updateRowColor(slickgrid,'lrbillstatus',1,'highlight-row-onchange');
		}
	});
})