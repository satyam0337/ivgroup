/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/lsLrExpenseDetailsfilepath.js'//FilePath
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
	var _this = '',filterConfiguration = new Object(),jsonObject,btModal,gridObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getLrExpenseVoucherDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			} 
			

				showLayer();
				var masterLangObj 			= FilePath.loadLanguage();
				var masterLangKeySet 		= loadLanguageWithParams(masterLangObj);	
				var columnConfig			= response.CommissionReportModel.columnConfiguration;
				var keys					= _.keys(columnConfig);
				var bcolConfig				= new Object();
				
				var columnKeysArray	= new Array();
				
				for(var i = 0;keys.length > i; i++) {
					columnKeysArray.push(keys[i]);
				}
				
				
				if(response.lrExpenseChargesNameHM != undefined) {
					var chargesNameHM	= response.lrExpenseChargesNameHM;
					for(var j in chargesNameHM) {
						if(chargesNameHM[j] != null) {
							columnKeysArray.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
							columnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {	 
									"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
									,"dataType":"number"
									,"languageKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
									,"searchFilter":false
									,"listFilter":false
									,"columnHidden":false
									,"displayColumnTotal":true
									,"columnMinimumDisplayWidthInPx":70
									,"columnInitialDisplayWidthInPx":90
									,"columnMaximumDisplayWidthInPx":120
									,"columnPrintWidthInPercentage":8
									,"elementCssClass":""
									,"columnDisplayCssClass":""
									,"columnPrintCssClass":""
									,"sortColumn":true
									,"show":true
							};
							masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
						}
					}
				}
				
				columnKeysArray = _.union(columnKeysArray, keys);
				for (var i=0; i<columnKeysArray.length; i++) {
					var bObj	= columnConfig[columnKeysArray[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeysArray[i]]	= bObj;
					}
				}
				
				response.CommissionReportModel.columnConfiguration	= bcolConfig;
				response.CommissionReportModel.Language				= masterLangKeySet;
				
				
				
				for(var i=0;response.CommissionReportModel.CorporateAccount.length > i; i++) {
					var chargesNameHM	= response.lrExpenseChargesNameHM;
					
					if(response.CommissionReportModel.CorporateAccount[i].lrExpenseChargesCollection != undefined) {
						var chargeHM	= response.CommissionReportModel.CorporateAccount[i].lrExpenseChargesCollection;
						
						for(var l in chargeHM) {
							if(l != undefined && chargesNameHM[l] != null) {
								response.CommissionReportModel.CorporateAccount[i][chargesNameHM[l].replace(/[' ',.,/]/g,"")] = chargeHM[l];
							}
						} 
					}
				}
				
				if(response.CommissionReportModel.CorporateAccount != undefined && response.CommissionReportModel.CorporateAccount.length > 0) {
					gridObject = slickGridWrapper2.setGrid(response.CommissionReportModel);
				}
				
			hideLayer();
			
		}
	});
});

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	
	if(dataView.getItem(row).waybillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).waybillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	}
}