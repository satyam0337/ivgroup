var PaymentTypeConstant = null;
define(
		[
		 'JsonUtility',
		 'messageUtility',
          PROJECT_IVUIRESOURCES + '/resources/js/report/collectionreport/creditLimitUsageReport/creditLimitUsageReportFilepath.js',
		 'jquerylingua',
		 'language',
		 'slickGridWrapper2',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'],//PopulateAutocomplete
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language, slickGridWrapper2, NodValidation, FocusNavigation,
				 BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet,  _this;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditLimitUsageReportWS/getCreditLimitUsageElement.do?', _this.renderRechargeRequestElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderRechargeRequestElements : function(response) {
					showLayer();
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/report/collectionreport/creditLimitUsageReport.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject 		= Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show)
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}
						
						response.sourceAreaSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						masterLangObj 		= FilePath.loadLanguage();
											
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#regionEle',
							validate		: 'presence',
							errorMessage	: 'Select Region !'
						});
							
						myNod.add({
							selector		: '#subRegionEle',
							validate		: 'presence',
							errorMessage	: 'Select Sub-Region !'
						});
							
						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
								
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind(_this);
						});
					});
				},onFind : function() {
					showLayer();
					var jsonObject 			= new Object();
					
					jsonObject.regionId 		= $('#regionEle_primary_key').val();
					jsonObject.subRegionId		= $('#subRegionEle_primary_key').val();
					jsonObject.sourceBranchId	= $('#branchEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/creditLimitUsageReportWS/getCreditLimitUsageData.do?', _this.setData, EXECUTE_WITH_ERROR);
				},setData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
						return;
					}
					
					if(response.creditLimitUsageList != undefined && response.creditLimitUsageList.CorporateAccount != undefined) {
						hideAllMessages();
						
						$('#bottom-border-boxshadow').removeClass('hide');
						var ColumnConfig 			= response.creditLimitUsageList.columnConfiguration;
						var columnKeys				= _.keys(ColumnConfig);
						
						var bcolConfig				= new Object();
						
						for (var i = 0; i < columnKeys.length; i++) {
							var bObj	= ColumnConfig[columnKeys[i]];
							
							if (bObj != null && bObj.show)
								bcolConfig[columnKeys[i]] = bObj;
						}
						
						response.creditLimitUsageList.columnConfiguration	= bcolConfig;
						response.creditLimitUsageList.Language				= masterLangKeySet;
						
						slickGridWrapper2.setGrid(response.creditLimitUsageList);
					}
					
					hideLayer();
				}
			});
});