/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchroutemaster/dispatchroutemasterfilepath.js'//FilePath
	,'language'//import in require.config
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Language,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	masterLangKeySet,
	gridObject,
	columnHeaderArr,
	allGridObject,
	viewObject,
	gridObejct,
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},
		render: function(){
			showLayer();
			_this.setDispatchRouteHistoryDetails(jsonObject.response);
		},setDispatchRouteHistoryDetails : function(response) {
			hideAllMessages();
			console.log("response : " , response);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/dispatchroutemaster/DispatchRouteHistoryDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				hideLayer();
				masterLangKeySet = loadLanguageWithParams(FilePath.loadLanguage());

				var dispatchRouteHistoryColumnConfig	= response.DispatchRouteHistory.columnConfiguration;
				var dispatchRouteHistoryKeys			= _.keys(dispatchRouteHistoryColumnConfig);
				var bcolConfig					= new Object();

				for (var i=0; i<dispatchRouteHistoryKeys.length; i++) {
					var bObj	= dispatchRouteHistoryColumnConfig[dispatchRouteHistoryKeys[i]];
					if (bObj.show == true) {
						bcolConfig[dispatchRouteHistoryKeys[i]]	= bObj;
					}
				}

				response.DispatchRouteHistory.columnConfiguration	= bcolConfig;
				response.DispatchRouteHistory.Language				= masterLangKeySet;

				if(response.DispatchRouteHistory.CorporateAccount != undefined && response.DispatchRouteHistory.CorporateAccount.length > 0) {
					gridObject = slickGridWrapper2.setGrid(response.DispatchRouteHistory);
				}
			});

			hideLayer();
		}
	});
});

