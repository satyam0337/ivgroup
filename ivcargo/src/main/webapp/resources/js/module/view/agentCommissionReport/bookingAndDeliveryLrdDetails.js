/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentCommissionReport/bookingAndDeliveryLrdDetailsfilepath.js'//FilePath
	,'language'//import in require.config
	,'slickGridWrapper'
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Language,slickGridWrapper,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	LangKeySet,
	columnHeaderArr,
	allGridObject,
	viewObject,
	gridObejct,
	jsonObject,
	gridObject, 
	gridObjectNew, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet,
	masterLangObj,
	masterLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionReportWS/getAgentBookingCommissionLRDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/agentCommissionReport/BookingAndDeliveryLrdDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.bookingCommissionLRDetails.CorporateAccount.length <= 0 && response.deliveryCommissionLRDetails.CorporateAccount.length <= 0){
				showMessage('error', "NO LR Found");
			}
			
				$.when.apply($, loadelement).done(function() {
					showLayer();
					if(response.bookingCommissionLRDetails != undefined){
						
						masterLangObj 								= FilePath.loadLanguage();
						masterLangKeySet 							= loadLanguageWithParams(masterLangObj);
						
						var agentCommissionReportColumnConfig		= response.bookingCommissionLRDetails.columnConfiguration;
						var bookingCommissionKeys					= _.keys(agentCommissionReportColumnConfig);
						var bcolConfig								= new Object();
						
					
						for (var i=0; i<bookingCommissionKeys.length; i++) {
							var bObj	= agentCommissionReportColumnConfig[bookingCommissionKeys[i]];
							if (bObj.show == true) {
								bcolConfig[bookingCommissionKeys[i]]	= bObj;
							}
						}
						
						response.bookingCommissionLRDetails.columnConfiguration		= bcolConfig;
						response.bookingCommissionLRDetails.Language				= masterLangKeySet;

						if(response.bookingCommissionLRDetails.CorporateAccount != undefined && response.bookingCommissionLRDetails.CorporateAccount.length > 0) {
							$('#bookingLR').show();
								gridObject		 = slickGridWrapper2.setGrid(response.bookingCommissionLRDetails);
						}
						
					}else {
						$('#bookingLR').hide();
					}
					
					if(response.deliveryCommissionLRDetails != undefined){
						
						masterLangObj 									= FilePath.loadLanguage();
						masterLangKeySet 								= loadLanguageWithParams(masterLangObj);
						
						var deliveryCommissionLRDetailsColumnConfig		= response.deliveryCommissionLRDetails.columnConfiguration;
						var deliveryCommissionKeys						= _.keys(deliveryCommissionLRDetailsColumnConfig);
						var bcolConfigNew								= new Object();
						
						for (var i=0; i<deliveryCommissionKeys.length; i++) {
							var bObj	= deliveryCommissionLRDetailsColumnConfig[deliveryCommissionKeys[i]];
							if (bObj.show == true) {
								bcolConfigNew[deliveryCommissionKeys[i]]	= bObj;
							}
						}
						response.deliveryCommissionLRDetails.columnConfiguration	= bcolConfigNew;
						response.deliveryCommissionLRDetails.Language				= masterLangKeySet;

						if(response.deliveryCommissionLRDetails.CorporateAccount != undefined && response.deliveryCommissionLRDetails.CorporateAccount.length > 0) {
							$('#deliveryLr').show();
							gridObjectNew 	 = slickGridWrapper2.setGrid(response.deliveryCommissionLRDetails);
						}
						
					}else {
						$('#deliveryLr').hide();
					}
					
				hideLayer();
				})
		
		
		}
	});
});