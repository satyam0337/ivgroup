define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/DlyDiscountDetailsfilepath.js'//FilePath
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
	masterLangKeySet,
	gridObject;
	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
			console.log("jsonObjectData ", jsonObjectData)
			btModal			= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getDlyDiscountAmount.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			console.log("response",response)
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			} 
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/commissionReport/DlyDiscountDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				showLayer();
					
				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);
				
				if(response.DiscountDetails != undefined){
					var DiscountDetailsColumnConfig  = response.DiscountDetails.columnConfiguration;
					var DiscountDetailsColumnKeys	= _.keys(DiscountDetailsColumnConfig);
					var DiscountDetailsConfig		= new Object();
					for (var i = 0; i < DiscountDetailsColumnKeys.length; i++) {
						
						var bObj	= DiscountDetailsColumnConfig[DiscountDetailsColumnKeys[i]];
						
						if (bObj.show == true) {
							DiscountDetailsConfig[DiscountDetailsColumnKeys[i]] = bObj;
						}
					}
				
					response.DiscountDetails.columnConfiguration	= DiscountDetailsConfig;
					response.DiscountDetails.Language				= masterLangKeySet;
				}
				if(response.DiscountDetails != undefined && response.DiscountDetails.CorporateAccount != undefined) {
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.DiscountDetails);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
				
			hideLayer();
			})
		}
	});
});