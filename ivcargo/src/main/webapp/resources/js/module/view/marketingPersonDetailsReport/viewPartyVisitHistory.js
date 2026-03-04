var bookingWayBillTxn;
define([
	'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/marketingPersonDetailsReport/marketingPersonDetailsReportFilePath.js'
	,'jquerylingua'
	,'language'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/marketingPersonDetailsReport/viewPartyDetails.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, SlickGridWrapper, PartyVisit){
	'use strict';
	var jsonObject = new Object(), _this = '',btModal, masterLangObj, masterLangKeySet,selectedGridObject;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			console.log('jsonObjectData >>> ', jsonObjectData)
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			selectedGridObject 	= jsonObjectData.gridObj;
		},render : function() {
			console.log('jsonObject ',jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/marketingPersonDetailsReportWS/getPartyVisitHistory.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			console.log('party visit',response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody1").load("/ivcargo/html/module/marketingPersonDetailsReport/viewPartyVisitHistory.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			
			$.when.apply($, loadelement).done(function(){
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
				
				var ColumnConfig = response.PartyVisitHistory.columnConfiguration;
				var columnKeys	= _.keys(ColumnConfig);
				var bcolConfig	= new Object();
				for (var i=0; i<columnKeys.length; i++) {

					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				}
				
				response.PartyVisitHistory.columnConfiguration	= bcolConfig;
				response.PartyVisitHistory.Language				= masterLangKeySet;
				
				if(response.PartyVisitHistory.CorporateAccount != undefined) {
					hideAllMessages();
					SlickGridWrapper.setGrid(response.PartyVisitHistory);
				}
				hideLayer();
			});
		}
	});
})
