define([
	'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/collectionPersonMasterDetails/collectionpersonmasterdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
],function(JsonUtility, MessageUtility, FilePath, Lingua, Language,slickGridWrapper2,UrlParameter){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,_this = '';
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/collectionPersonMasterWS/getCollectionPersonMasterDetail.do?',	_this.setCollectionPersonDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setCollectionPersonDetails : function(response){
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/master/collectionPersonMasterDetail.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.collectionPersonMasterDetailList != undefined){
					var collectionPersonMasterDetailColumnConfig  = response.collectionPersonMasterDetailList.columnConfiguration;
					var collectionPersonMasterDetailColumnKeys	= _.keys(collectionPersonMasterDetailColumnConfig);
					var collectionPersonMasterDetailConfig		= new Object();
					for (var i = 0; i < collectionPersonMasterDetailColumnKeys.length; i++) {
						
						var bObj	= collectionPersonMasterDetailColumnConfig[collectionPersonMasterDetailColumnKeys[i]];
						
						if (bObj.show == true) {
							collectionPersonMasterDetailConfig[collectionPersonMasterDetailColumnKeys[i]] = bObj;
						}
					}
				
					response.collectionPersonMasterDetailList.columnConfiguration	= collectionPersonMasterDetailConfig;
					response.collectionPersonMasterDetailList.Language				= masterLangKeySet;
				}
				
				if(response.collectionPersonMasterDetailList != undefined && response.collectionPersonMasterDetailList.CorporateAccount != undefined) {
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.collectionPersonMasterDetailList);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
				
				hideLayer();
				
			});
			
		}
	});
});