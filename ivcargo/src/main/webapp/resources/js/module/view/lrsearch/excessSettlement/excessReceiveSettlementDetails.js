define(['marionette'
	,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/excessSettlement/excessreceivesettlementdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'],
	 function(Marionette, JsonUtility, MessageUtility, UrlParameter,FilePath, Lingua, Language,slickGridWrapper2){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	excessReceiveId,
	masterLangKeySet,
	masterLangObj,
	gridObject,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			excessReceiveId = UrlParameter.getModuleNameFromParam('excessReceiveId');
			jsonObject.excessReceiveId			= excessReceiveId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/excessReceiveWS/getExcessReceiveSettlementDetail.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getResponseForView : function(response){
			hideLayer();
			var responseOut = response;
			console.log('responseOut ',responseOut)
			if(responseOut.ExcessReceiveSettlement.CorporateAccount.length <= 0){
				showMessage("info","Excess Settlement pending or Settled against Short !");
				$('#top-border-boxshadow').addClass('hide');
				setTimeout(function(){
					window.close();
				},2000);
				return;
			}
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/excessReceiveSettlementDetail.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.ExcessReceiveSettlement != undefined) {
					var excessReceiveSettlementColumnConfig = response.ExcessReceiveSettlement.columnConfiguration;
					var excessReceiveSettlementColumnKeys	= _.keys(excessReceiveSettlementColumnConfig);
					var excessReceiveSettlementConfig		= new Object();
					
					for (var i = 0; i < excessReceiveSettlementColumnKeys.length; i++) {
						
						var bObj	= excessReceiveSettlementColumnConfig[excessReceiveSettlementColumnKeys[i]];
						
						if (bObj.show == true) {
							excessReceiveSettlementConfig[excessReceiveSettlementColumnKeys[i]] = bObj;
						}
					}
				
					response.ExcessReceiveSettlement.columnConfiguration	= excessReceiveSettlementConfig;
					response.ExcessReceiveSettlement.Language				= masterLangKeySet;
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.ExcessReceiveSettlement);
				}
				hideLayer();
			});
		}
	});
});