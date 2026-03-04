var doneTheStuff				= false;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/tallydata/tallyDatafilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			],
			
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					slickGridWrapper2,BootstrapModal,UrlParameter,Selection,Selectizewrapper,datePickerUI) {
			'use strict';
			var 
			myNod, 
			corporateAccountId = 0,
			_this = '',
			viewObject,
			gridObject, 
			masterLangObj, 
			masterLangKeySet,
			CrossingAgentLedgerAccount,
			allCrossingAgentLedgerDetailsList,
			billIdIdArrayList =new Array();
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/tallyDataWS/getTallyDataElementConfiguration.do?',_this.crossingAgentLedgerElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, crossingAgentLedgerElements : function(response) {
					showLayer();
					var jsonObject 			= new Object();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/tallydata/tallyData.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == true) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
							}
						}
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						loadLanguageWithParams(FilePath.loadLanguage());
						
						var elementConfiguration				= new Object();
						elementConfiguration.dateElement		= $('#dateEle');
						response.elementConfiguration			= elementConfiguration;
						response.isCalenderSelection			= true;
						
						elementConfiguration.dateElement		= $('#dateEle');
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.sourceAreaSelection	= true;
						response.isPhysicalBranchesShow	= true;
						response.AllOptionsForRegion  	 = false;
						response.AllOptionsForSubRegion  = false;
						response.AllOptionsForBranch 	 = false;
						
						Selection.setSelectionToGetData(response);
						
						var regionList	= new Array();
						_.each(response.regionList,function(key){
							if (key.regionId != -1){
								regionList.push(key);
							}
						})
						
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onSubmit();								
							}
						});
					});
				},onSubmit : function(){
					showLayer();
					var jsonObject = new Object();

					if($("#dateEle").attr('data-startdate') != undefined){
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
					}
					if($("#dateEle").attr('data-enddate') != undefined){
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}
					
					jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/tallyDataWS/getTallyDataDetails.do?', _this.tallyDataDetails, EXECUTE_WITH_ERROR);
				},tallyDataDetails : function(response){
					hideLayer();
										
					var fileName	= response.fileName;
		        	
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						if(fileName != undefined && fileName != 'undefined'){
							var request = new XMLHttpRequest();
							request.open('GET', "Ajax.do?pageId=356&eventId=1&fileName="+fileName, true);
							request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
							request.responseType = 'blob';

							request.onload = function(e) {
								if (this.status === 200) {
									var blob = this.response;

									if(window.navigator.msSaveOrOpenBlob) {
										window.navigator.msSaveBlob(blob, fileName);
									} else {
										var downloadLink 		= window.document.createElement('a');
										var contentTypeHeader 	= request.getResponseHeader("Content-Type");
										downloadLink.href 		= window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
										downloadLink.download 	= fileName;
										document.body.appendChild(downloadLink);
										downloadLink.click();
										document.body.removeChild(downloadLink);
									}
								}
							};
							request.send();
						}
		        	}
				}
			});
		});