define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/allBranchWiseAnalysisReport/allBranchWiseAnalysisLRDetailsfilepath.js'
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
			jsonObject		= jsonObjectData;
			btModal			= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchWiseAnalysisReportWS/getLrDetailsForAllBranchWiseAnalysisReport.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			
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
				$("#modalBody").load("/ivcargo/html/report/allBranchWiseAnalysisReport/AllBranchWiseAnalysisLRDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				showLayer();
					
				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);
				
				if(response.AllBranchWiseAnalysisReportModel != undefined){
					var LRDetailsColumnConfig  = response.AllBranchWiseAnalysisReportModel.columnConfiguration;
					var LRDetailsColumnKeys	= _.keys(LRDetailsColumnConfig);
					var LRDetailsConfig		= new Object();
					for (var i = 0; i < LRDetailsColumnKeys.length; i++) {
						
						var bObj	= LRDetailsColumnConfig[LRDetailsColumnKeys[i]];
						
						if (bObj.show == true) {
							LRDetailsConfig[LRDetailsColumnKeys[i]] = bObj;
						}
					}
					response.AllBranchWiseAnalysisReportModel.columnConfiguration		= LRDetailsConfig;
					response.AllBranchWiseAnalysisReportModel.Language					= masterLangKeySet;
				}
				if(response.AllBranchWiseAnalysisReportModel != undefined && response.AllBranchWiseAnalysisReportModel.CorporateAccount != undefined) {
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.AllBranchWiseAnalysisReportModel);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
				
			hideLayer();
			})
		}
	});
});