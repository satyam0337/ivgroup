/**
 * 
 */define(['marionette'
	,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/damageSettlement/damagereceivesettlementdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'],
	 function(Marionette, JsonUtility, MessageUtility, UrlParameter,FilePath, Lingua, Language,slickGridWrapper2){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	damageReceiveId,
	masterLangKeySet,
	masterLangObj,
	gridObject,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			damageReceiveId = UrlParameter.getModuleNameFromParam('damageReceiveId');
			jsonObject.damageReceiveId			= damageReceiveId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/damageReceiveWS/getDamageReceiveSettlementDetail.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getResponseForView : function(response){
			hideLayer();
			var responseOut = response;
			console.log('responseOut ',responseOut)
			
			if(responseOut.DamageReceiveSettlement.CorporateAccount.length <= 0){
				showMessage("info","Damage Settlement pending !");
				$('#top-border-boxshadow').addClass('hide');
				setTimeout(function(){
					window.close();
				},2000);
				return;
			}
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/damageReceiveSettlementDetail.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.DamageReceiveSettlement != undefined) {
					var damageReceiveSettlementColumnConfig = response.DamageReceiveSettlement.columnConfiguration;
					var damageReceiveSettlementColumnKeys	= _.keys(damageReceiveSettlementColumnConfig);
					var damageReceiveSettlementConfig		= new Object();
					
					for (var i = 0; i < damageReceiveSettlementColumnKeys.length; i++) {
						
						var bObj	= damageReceiveSettlementColumnConfig[damageReceiveSettlementColumnKeys[i]];
						
						if (bObj.show == true) {
							damageReceiveSettlementConfig[damageReceiveSettlementColumnKeys[i]] = bObj;
						}
					}
				
					response.DamageReceiveSettlement.columnConfiguration	= damageReceiveSettlementConfig;
					response.DamageReceiveSettlement.Language				= masterLangKeySet;
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.DamageReceiveSettlement);
				}
				hideLayer();
			});
		}
	});
});