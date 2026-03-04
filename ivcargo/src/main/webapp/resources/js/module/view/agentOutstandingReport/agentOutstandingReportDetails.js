/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentOutstandingReport/agentOutstandingReportFilePath.js'//FilePath
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
			_this.setPackingTypeConsignmentGoodsMappingDetsils(jsonObject.response);
		},setPackingTypeConsignmentGoodsMappingDetsils : function(response) {
			hideAllMessages();
			console.log("responseNeww Details : " , response);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/agentOutstandingReport/agentOutstandingReportSummary.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				hideLayer();
				masterLangKeySet = loadLanguageWithParams(FilePath.loadLanguage());
				
				if(response.agentOustandingUnbilledSummaryList != undefined) {
					var agentOustandingUnbilledSummaryColumnConfig		= response.agentOustandingUnbilledSummaryList.columnConfiguration;
					var agentOustandingSummaryKeys						= _.keys(agentOustandingUnbilledSummaryColumnConfig);
					var agentOustandingConfig							= new Object();

					for (var i=0; i<agentOustandingSummaryKeys.length; i++) {
						var agentOustandingSummaryObj	= agentOustandingUnbilledSummaryColumnConfig[agentOustandingSummaryKeys[i]];
						if (agentOustandingSummaryObj.show == true) {
							agentOustandingConfig[agentOustandingSummaryKeys[i]]	= agentOustandingSummaryObj;
						}
					}
					response.agentOustandingUnbilledSummaryList.columnConfiguration		= agentOustandingConfig;
					response.agentOustandingUnbilledSummaryList.Language				= masterLangKeySet;

					if(response.agentOustandingUnbilledSummaryList.CorporateAccount != undefined && response.agentOustandingUnbilledSummaryList.CorporateAccount.length > 0) {
						gridObject = slickGridWrapper2.setGrid(response.agentOustandingUnbilledSummaryList);
					} 
				} else if(response.agentOustandingBilledSummaryList != undefined) {
					var agentOustandingBilledSummaryColumnConfig		= response.agentOustandingBilledSummaryList.columnConfiguration;
					var agentOustandingSummaryKeys						= _.keys(agentOustandingBilledSummaryColumnConfig);
					var agentOustandingConfig							= new Object();

					for (var i=0; i<agentOustandingSummaryKeys.length; i++) {
						var agentOustandingSummaryObj	= agentOustandingBilledSummaryColumnConfig[agentOustandingSummaryKeys[i]];
						if (agentOustandingSummaryObj.show == true) {
							agentOustandingConfig[agentOustandingSummaryKeys[i]]	= agentOustandingSummaryObj;
						}
					}
					response.agentOustandingBilledSummaryList.columnConfiguration	= agentOustandingConfig;
					response.agentOustandingBilledSummaryList.Language				= masterLangKeySet;

					if(response.agentOustandingBilledSummaryList.CorporateAccount != undefined && response.agentOustandingBilledSummaryList.CorporateAccount.length > 0) {
						gridObject = slickGridWrapper2.setGrid(response.agentOustandingBilledSummaryList);
					} 
				}
			});

			hideLayer();
		}
	});
});