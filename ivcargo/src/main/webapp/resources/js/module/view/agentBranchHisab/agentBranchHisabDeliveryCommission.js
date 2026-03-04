define([
	'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentBranchHisab/agentbranchhisabdeliverycommissionfilepath.js'
	,'jquerylingua'
	,'language'
	,'slickGridWrapper2'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, SlickGridWrapper){
	'use strict';
	var jsonObject = new Object(), _this = '',btModal, masterLangObj, masterLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/agentBranchHisabWS/getAgentBranchHisabDeliveryCommissionDetails.do?', _this.renderAgentBranchHisabTopayBookingElements, EXECUTE_WITH_ERROR);
			return _this;
		},renderAgentBranchHisabTopayBookingElements : function(response){
			console.log(response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/AgentBranchHisab/agentBranchHisabDeliveryCommission.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			if(response.message != undefined){
				refreshAndHidePartOfPage('deliveryCommissionDetailsDiv', 'hide');
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				btModal.close();
				return;
			}
			$.when.apply($, loadelement).done(function(){
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
				
				var ColumnConfig = response.tableConfig.columnConfiguration;
				var columnKeys	= _.keys(ColumnConfig);
				var bcolConfig	= new Object();
				for (var i=0; i<columnKeys.length; i++) {

					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				}
				
				response.tableConfig.columnConfiguration	= bcolConfig;
				response.tableConfig.Language				= masterLangKeySet;
				
				if(response.tableConfig.CorporateAccount != undefined) {
					$('#deliveryCommissionDetailsDiv').show();
					hideAllMessages();
					SlickGridWrapper.setGrid(response.tableConfig);
				}
				hideLayer();
			});
		}
	});
})