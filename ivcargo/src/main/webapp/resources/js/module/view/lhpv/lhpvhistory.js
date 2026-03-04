define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/lhpv/lhpvHistoryDetailsfilepath.js'
			,'slickGridWrapper2',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
			function(FilePath, slickGridWrapper2, JsonUtility, MessageUtility, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch,
					UrlParameter,BootstrapModal) {
			'use strict';
			var jsonObject = new Object(), myNod,myNod2, corporateAccountId = 0,  _this = '', masterLangObj, masterLangKeySet,gridObject,lhpvId;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					lhpvId 				= UrlParameter.getModuleNameFromParam(MASTERID);
					_this = this;
				}, render : function() {
					jsonObject				= new Object();
					jsonObject["lhpvId"] 	= lhpvId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/LHPVWS/getLHPVHistoryByLhpvId.do?',	_this.renderLHPVHistoryDetailsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderLHPVHistoryDetailsElements : function(response) {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/lhpv/lhpvHistoryDetails.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						_this.viewLHPVHistoryDetails(response);
					});
				}, viewLHPVHistoryDetails	: function(response) {
					if(response.message != undefined){
						hideLayer();
						var errorMessage = response.message;
						showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
						
						setTimeout(function() {
							window.close();
						}, 1000);
						
						return;
					}
					
					if(response.editLhpvChargesHistoryDetails != undefined && response.editLhpvChargesHistoryDetails.CorporateAccount.length > 0) {
						$('#top-border-boxshadow').removeClass('hide');
						
						var editLhpvChargesHistoryDetailsColumnConfig	= response.editLhpvChargesHistoryDetails.columnConfiguration;
						var sequenceKeys	= _.keys(editLhpvChargesHistoryDetailsColumnConfig);
						var dcolConfig		= new Object();
						
						for (var i = 0; i < sequenceKeys.length; i++) {
							var dObj	= editLhpvChargesHistoryDetailsColumnConfig[sequenceKeys[i]];
							
							if (dObj.show == true) {
								dcolConfig[sequenceKeys[i]]	= dObj;
							}
						}
						
						response.editLhpvChargesHistoryDetails.columnConfiguration	= dcolConfig;
						
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						response.editLhpvChargesHistoryDetails.Language	= masterLangKeySet;
						
						slickGridWrapper2.setGrid(response.editLhpvChargesHistoryDetails);
					}
					
					if(response.lhpvUpdateHistoryDetails != undefined && response.lhpvUpdateHistoryDetails.CorporateAccount.length > 0) {
						$('#middle-border-boxshadow').removeClass('hide');
						
						var lhpvUpdateHistoryDetailsColumnConfig	= response.lhpvUpdateHistoryDetails.columnConfiguration;
						var sequenceKeys	= _.keys(lhpvUpdateHistoryDetailsColumnConfig);
						var dcolConfig		= new Object();
						
						for (var i = 0; i < sequenceKeys.length; i++) {
							var dObj	= lhpvUpdateHistoryDetailsColumnConfig[sequenceKeys[i]];
						
							if (dObj.show == true) {
								dcolConfig[sequenceKeys[i]]	= dObj;
							}
						}
						response.lhpvUpdateHistoryDetails.columnConfiguration	= dcolConfig;
						
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						response.lhpvUpdateHistoryDetails.Language	= masterLangKeySet;
						
						slickGridWrapper2.setGrid(response.lhpvUpdateHistoryDetails);
					}
					
					hideLayer();
					
				}
			});
		});