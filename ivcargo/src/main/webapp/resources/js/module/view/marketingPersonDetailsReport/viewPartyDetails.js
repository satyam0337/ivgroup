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
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			selectedGridObject 	= jsonObjectData.gridObj;
		},render : function() {
			jsonObject.branchId 	= -1;
			jsonObject.subRegionId 	= -1;
			console.log('jsonObject ',jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/marketingPersonDetailsReportWS/getPartyDetails.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			console.log(response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/marketingPersonDetailsReport/viewPartyDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				setTimeout(() => {
					window.close();
				}, 1000);
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
				
				var ColumnConfig = response.PartyDetails.columnConfiguration;
				var columnKeys	= _.keys(ColumnConfig);
				var bcolConfig	= new Object();
				for (var i=0; i<columnKeys.length; i++) {

					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				}
				
				response.PartyDetails.columnConfiguration	= bcolConfig;
				response.PartyDetails.Language				= masterLangKeySet;
				
				if(response.PartyDetails.CorporateAccount != undefined) {
					hideAllMessages();
					SlickGridWrapper.setGrid(response.PartyDetails);
				}
				hideLayer();
			});
		}
	});
})
var donePartyVisit = false;
function getPartyVisitHistory(grid,dataView,row){
		console.log('getPartiesByMarketingPerson >>> ', dataView.getItem(row))
		hideLayer();
		require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/marketingPersonDetailsReport/viewPartyVisitHistory.js'], function(PartyVisit){
			if(dataView.getItem(row).marketingPersonExecId != undefined){
				var jsonObject 							= new Object();
				jsonObject.marketingPersonExecId 		= dataView.getItem(row).marketingPersonExecId;
				jsonObject.corporateAccountId	 		= dataView.getItem(row).corporateAccountId;
				var object 								= new Object();
				object.elementValue 					= jsonObject;
				object.gridObj 							= grid;
				object.marketingPersonExecId			= dataView.getItem(row).marketingPersonExecId;
				object.corporateAccountId				= dataView.getItem(row).corporateAccountId;
				console.log('object >>> ', object)
				var btModal = new Backbone.BootstrapModal({
					content: new PartyVisit(object),
					modalWidth : 80,
					title:'Party Visit',
					modalBodyId: 'modalBody1'
	
				}).open();
				object.btModal = btModal;
				new PartyVisit(object)
				btModal.open();
				
			};
		});
}

function getLRDetails(grid,dataView,row){
	if(dataView.getItem(row).marketingPersonExecId != undefined){
		var jsonObject 				= new Object();
		var corporateAccountId		= dataView.getItem(row).corporateAccountId;
	}
	window.open('PartyWiseLRDetailReport.do?pageId=50&eventId=108&isRedirectFromReport=true&corporateAccountId='+corporateAccountId+'', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no, directories=no, status=no');
}