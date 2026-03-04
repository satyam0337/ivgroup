define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/invoiceAndGSTDetails/invoiceandgstdetailsreportfilepath.js'
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
						masterLangKeySet, caLangObj, caLangKeySet;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/invoiceAndGstDetailsReportWS/getInvoiceAndGstDetailsReportElement.do?',	_this.renderInvoiceAndGstDetailsElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderInvoiceAndGstDetailsElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					var executive		= response.executive;
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/invoiceandgstdetailsreport/invoiceAndGstDetailsReport.html",function() {
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
						
						_this.setSelectType();	
						var executive				= response.executive;
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isOneYearCalenderSelection	= true;
						Selection.setSelectionToGetData(response);
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						if(executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
							myNod.add({
								selector: '#regionEle',
								validate: 'validateAutocomplete:#regionEle_primary_key',
								errorMessage: 'Select proper Region !'
							});

							myNod.add({
								selector: '#subRegionEle',
								validate: 'validateAutocomplete:#subRegionEle_primary_key',
								errorMessage: 'Select proper Area !'
							});

							myNod.add({
								selector: '#branchEle',
								validate: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage: 'Select proper Branch !'
							});
						}

						if(executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
							myNod.add({
								selector: '#subRegionEle',
								validate: 'validateAutocomplete:#subRegionEle_primary_key',
								errorMessage: 'Select proper Area !'
							});

							myNod.add({
								selector: '#branchEle',
								validate: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage: 'Select proper Branch !'
							});

						}

						if(executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN ) {

							myNod.add({
								selector: '#branchEle',
								validate: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage: 'Select proper Branch !'
							});
						}
						myNod.add({
							selector: '#selectTypeEle',
							validate: 'validateAutocomplete:#selectTypeEle_primary_key',
							errorMessage: 'Select proper Tax Type !'
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
					if(response.message != undefined){
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}
					
					var stbsReportColumnConfig		= response.tableConfig.columnConfiguration;
					var stbsReportKeys				= _.keys(stbsReportColumnConfig);
					var bcolConfig					= new Object();
					
					for (var i=0; i<stbsReportKeys.length; i++) {
						var bObj	= stbsReportColumnConfig[stbsReportKeys[i]];
						if (bObj.show == true) {
							bcolConfig[stbsReportKeys[i]]	= bObj;
						}
					}
					
					response.tableConfig.columnConfiguration	= bcolConfig;
					response.tableConfig.Language				= masterLangKeySet;
					
					if(response.tableConfig.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						gridObject = slickGridWrapper2.setGrid(response.tableConfig);
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
					} 
					
					jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
					jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
					jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
					jsonObject["taxType"] 				= $('#selectTypeEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/invoiceAndGstDetailsReportWS/getInvoiceAndGstReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				},setSelectType : function(){
					
					_this.setSelectTypeAutocompleteInstance();
					
					var autoSelectType = $("#selectTypeEle").getInstance();
					
					var SelectTYPE = [
					        { "taxTypeId":1, "taxTypeName": "FCM" },
					        { "taxTypeId":2, "taxTypeName": "RCM" },
					    ]
					
					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				},setSelectTypeAutocompleteInstance : function() {
					var autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'taxTypeId';
					autoSelectTypeName.field 		= 'taxTypeName';

					$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
				}
			});
		});
