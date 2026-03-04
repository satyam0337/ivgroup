define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrBlockingReport/lrBlockingReportfilepath.js'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'slickGridWrapper2'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
				 slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI, Selection, ElementFocusNavigation) {
			'use strict';
			var jsonObject = new Object(), myNod, tab = "createTab", _this = '', gridObject, masterLangObj, 
						masterLangKeySet;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/lrBlockingReportWS/getLRBlockingReportElement.do?',	_this.renderLRBlockingReportElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderLRBlockingReportElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					var executive		= response.executive;
					console.log("response>>>>",response)
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/lrBlockingReport/lrBlockingReport.html",function() {
						baseHtml.resolve();
					});
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == false) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
							}
						}
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isOneYearCalenderSelection	= response.configuration.isOneYearCalenderSelection;
						Selection.setSelectionToGetData(response);
						
						if(response.configuration.viewAllData == 'true' || response.configuration.viewAllData == true) {
							$('#viewAllData').removeClass('hide');
							
							$('#viewAllCheck').click(function(){
								if ($('#viewAllCheck').is(':checked')) {
							       $('#dateDiv').addClass('hide');
							    } else {
							    	$('#dateDiv').removeClass('hide');
							    }
							});
						} else {
							$('#viewAllData').addClass('hide');
						}
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						hideLayer();
						$("#find").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onSubmit(_this);								
							}
						});
					});

				},setReportData : function(response) {
					console.log("response 11>>>>>", response)
					if(response.message != undefined){
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}
					
					var lrBlockingReportColumnConfig		= response.LRBlockingReportModel.columnConfiguration;
					var lrBlockingReportKeys				= _.keys(lrBlockingReportColumnConfig);
					var bcolConfig					= new Object();
					
					for (var i=0; i<lrBlockingReportKeys.length; i++) {
						var bObj	= lrBlockingReportColumnConfig[lrBlockingReportKeys[i]];
						if (bObj.show == true) {
							bcolConfig[lrBlockingReportKeys[i]]	= bObj;
						}
					}
					
					response.LRBlockingReportModel.columnConfiguration	= bcolConfig;
					response.LRBlockingReportModel.Language				= masterLangKeySet;
					
					if(response.LRBlockingReportModel.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						gridObject = slickGridWrapper2.setGrid(response.LRBlockingReportModel);
					}
					hideLayer();
				},onSubmit : function() {
					showLayer();
					var jsonObject = new Object();
					
					if($('#dateEle').is(":visible")){
						if($("#dateEle").attr('data-startdate') != undefined){
							jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
						}
						
						if($("#dateEle").attr('data-enddate') != undefined){
							jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
						}
					} else {
						jsonObject["fromDate"] = '01-01-2018'; //mindate for now
						if($("#dateEle").attr('data-startdate') != undefined){
							jsonObject["fromDate"] = '01-01-2018';
						}
						
						if($("#dateEle").attr('data-enddate') != undefined){
							jsonObject["toDate"] = '01-01-2018';// set , so that no null error at java side
						}
					}

					jsonObject["viewAllData"] 		= $('#viewAllCheck').is(':checked');
					getJSON(jsonObject, WEB_SERVICE_URL+'/lrBlockingReportWS/getLRBlockingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}
			});
		});
