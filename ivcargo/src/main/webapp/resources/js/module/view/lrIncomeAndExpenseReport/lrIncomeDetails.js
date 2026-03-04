
define([
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrIncomeAndExpenseReport/lrIncomeDetailsfilepath.js'
	,'jquerylingua'
	,'language'//import in require.config
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Lingua,Language,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var _this = '', btModal;
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0;

	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData;
			btModal			= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrIncomeAndExpenseReportWS/getLRIncomeDetails.do?',	_this.setElementData, EXECUTE_WITHOUT_ERROR);
		},setElementData : function(response) {

			$("#lrIncomeDetailsDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);

				return;
			}

			console.log("response --> ", response);
			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/report/lrIncomeAndExpenseReport/lrIncomeDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				showLayer();

				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);

				if(response.LRIncomeAndExpenseReportModel != null){
					var lrIncomeAndExpenseReportModelColumnConfig	= response.LRIncomeAndExpenseReportModel.columnConfiguration;
					var lrIncomeAndExpenseReportModelKeys			= _.keys(lrIncomeAndExpenseReportModelColumnConfig);
					var bcolConfig									= new Object();

					for (var i=0; i<lrIncomeAndExpenseReportModelKeys.length; i++) {
						var bObj	= lrIncomeAndExpenseReportModelColumnConfig[lrIncomeAndExpenseReportModelKeys[i]];
						
						if (bObj.show == true) {
							bcolConfig[lrIncomeAndExpenseReportModelKeys[i]]	= bObj;
						}
					}
					response.LRIncomeAndExpenseReportModel.columnConfiguration		= bcolConfig;
					response.LRIncomeAndExpenseReportModel.Language					= masterLangKeySet;
				}

				if(response.LRIncomeAndExpenseReportModel.CorporateAccount != undefined && response.LRIncomeAndExpenseReportModel.CorporateAccount.length > 0) {
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.LRIncomeAndExpenseReportModel);
				} else {
					$('#bottom-border-boxshadow').addClass('hide');
				}

				hideLayer();
			})
		}
	});
});
