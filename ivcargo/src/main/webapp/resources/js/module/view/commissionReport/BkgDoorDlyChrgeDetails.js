/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/BkgDoorDlyChrgeDetailsfilepath.js'//FilePath
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
	var _this = '',
	filterConfiguration = new Object(),
	jsonObject,
	btModal,
	masterLangObj,
	gridObject,
	masterLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
			console.log("jsonObjectData ", jsonObjectData)
			btModal			= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getBkgDoorDlyChargeAmount.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			console.log("response",response)
			
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			} 
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#modalBody").load("/ivcargo/html/module/commissionReport/BkgDDlyChrgeDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.BkgDoorDlyChrgeDetails != undefined){
					var BkgDoorDlyChrgeDetailsColumnConfig  = response.BkgDoorDlyChrgeDetails.columnConfiguration;
					var BkgDoorDlyChrgeDetailsColumnKeys	= _.keys(BkgDoorDlyChrgeDetailsColumnConfig);
					var BkgDoorDlyChrgeDetailsConfig		= new Object();
					for (var i = 0; i < BkgDoorDlyChrgeDetailsColumnKeys.length; i++) {
						
						var bObj	= BkgDoorDlyChrgeDetailsColumnConfig[BkgDoorDlyChrgeDetailsColumnKeys[i]];
						
						if (bObj.show == true) {
							BkgDoorDlyChrgeDetailsConfig[BkgDoorDlyChrgeDetailsColumnKeys[i]] = bObj;
						}
					}
				
					response.BkgDoorDlyChrgeDetails.columnConfiguration	= BkgDoorDlyChrgeDetailsConfig;
					response.BkgDoorDlyChrgeDetails.Language				= masterLangKeySet;
				}
				if(response.BkgDoorDlyChrgeDetails != undefined && response.BkgDoorDlyChrgeDetails.CorporateAccount != undefined) {
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.BkgDoorDlyChrgeDetails);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
				
				
			hideLayer();
			});
		}
	});
});