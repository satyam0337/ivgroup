define(['marionette'
	,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/shortSettlement/shortreceivesettlementdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'],
	 function(Marionette, JsonUtility, MessageUtility, UrlParameter,FilePath, Lingua, Language,slickGridWrapper2){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	shortReceiveId,
	masterLangKeySet,
	masterLangObj,
	gridObject,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			shortReceiveId = UrlParameter.getModuleNameFromParam('shortReceiveId');
			jsonObject.shortReceiveId			= shortReceiveId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/shortReceiveWS/getShortReceiveSettlementDetail.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getResponseForView : function(response){
			hideLayer();
			var responseOut = response;
			console.log('responseOut ',responseOut)
			
			if(responseOut.ShortReceiveSettlement.CorporateAccount.length <= 0){
				showMessage("info","Short Settlement pending or Settled against Excess/Claim !");
				$('#top-border-boxshadow').addClass('hide');
				setTimeout(function(){
					window.close();
				},2000);
				return;
			}
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/shortReceiveSettlementDetail.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.ShortReceiveSettlement != undefined) {
					var shortReceiveSettlementColumnConfig = response.ShortReceiveSettlement.columnConfiguration;
					var shortReceiveSettlementColumnKeys	= _.keys(shortReceiveSettlementColumnConfig);
					var shortReceiveSettlementConfig		= new Object();
					
					for (var i = 0; i < shortReceiveSettlementColumnKeys.length; i++) {
						
						var bObj	= shortReceiveSettlementColumnConfig[shortReceiveSettlementColumnKeys[i]];
						
						if (bObj.show == true) {
							shortReceiveSettlementConfig[shortReceiveSettlementColumnKeys[i]] = bObj;
						}
					}
				
					response.ShortReceiveSettlement.columnConfiguration		= shortReceiveSettlementConfig;
					response.ShortReceiveSettlement.Language				= masterLangKeySet;
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.ShortReceiveSettlement);
				}
				hideLayer();
			});
		}
	});
});