define(
		[	'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/dateWiseBookingSummaryReport/dateWiseBookingSummaryReportFilePath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'slickGridWrapper2',
			'bootstrapSwitch',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			'nodvalidation',
			'focusnavigation'],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, slickGridWrapper2, BootstrapSwitch,
					BootstrapModal, Selection, NodValidation, ElementFocusNavigation) {
			'use strict';

			var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,gridObject1 , _this;

			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					var sourceBranchList = null;
				},
				render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/DateWiseBookingSummaryWS/loadDataForDateWiseBookingSummary.do?', _this.renderDataForDateWiseBookingSummary, EXECUTE_WITH_ERROR);
					return _this;
				},
				renderDataForDateWiseBookingSummary : function(response) {
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					var lrTypeList 		= response.WAYBILL_TYPE;
					var subRegionList 	= response.subRegion;

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/dateWiseBookingSummaryReport/dateWiseBookingSummaryReport.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						//date picker
						var options		= new Object();
						$("#dateEle").DatePickerCus(options);

						//LR type auto complete
						var lrTypeAutoComplete 			= new Object();
						lrTypeAutoComplete.primary_key 	= 'wayBillTypeId';
						lrTypeAutoComplete.url 			= lrTypeList;
						lrTypeAutoComplete.field 		= 'wayBillType';
						$("#lrTypeId").autocompleteCustom(lrTypeAutoComplete);

						//Source Subregion auto complete
						var sourceSubregionAutoComplete 		= new Object();
						sourceSubregionAutoComplete.primary_key = 'subRegionId';
						sourceSubregionAutoComplete.url 		= subRegionList;
						sourceSubregionAutoComplete.callBack 	= _this.onSelectSourceSubRegion;
						sourceSubregionAutoComplete.field 		= 'subRegionName';
						$("#sourceSubRegion").autocompleteCustom(sourceSubregionAutoComplete);

						//Source branch auto complete
						var sourceBranchAutoComplete 			= new Object();
						sourceBranchAutoComplete.primary_key 	= 'branchId';
						sourceBranchAutoComplete.field 			= 'branchName';
						$("#sourceBranch").autocompleteCustom(sourceBranchAutoComplete);

						//Destination Subregion auto complete
						var destinationSubregionAutoComplete 			= new Object();
						destinationSubregionAutoComplete.primary_key 	= 'subRegionId';
						destinationSubregionAutoComplete.url 			= subRegionList;
						destinationSubregionAutoComplete.callBack 		= _this.onSelectDestinationSubRegion;
						destinationSubregionAutoComplete.field 			= 'subRegionName';
						$("#destinationSubRegion").autocompleteCustom(destinationSubregionAutoComplete);

						//Destination branch auto complete
						var destinationBranchAutoComplete 			= new Object();
						destinationBranchAutoComplete.primary_key 	= 'branchId';
						destinationBranchAutoComplete.field 		= 'branchName';
						$("#destinationBranch").autocompleteCustom(destinationBranchAutoComplete);

						//find button activities
						$("#find").on('click',function(){
							_this.inputFieldValidation();
							//Take data from front-end
							var jsonObject	= new Object();
							if($("#dateEle").attr('data-startdate') != undefined){
								jsonObject.fromDate = $("#dateEle").attr('data-startdate'); 
							}
							if($("#dateEle").attr('data-enddate') != undefined){
								jsonObject.toDate = $("#dateEle").attr('data-enddate'); 
							}
							jsonObject.wayBillTypeId 			= $("#lrTypeName_primary_key").val();
							jsonObject.sourceSubRegionId		= $("#sourceSubRegion_primary_key").val();
							jsonObject.sourceBranchId			= $("#sourceBranch_primary_key").val();
							jsonObject.destinationSubRegionId	= $("#destinationSubRegion_primary_key").val();
							jsonObject.destinationBranchId		= $("#destinationBranch_primary_key").val();

							myNod.performCheck();
							if(String(myNod.areAll('valid')) == 'true') {
								//Get date wise booking summary records
								showLayer();
								getJSON(jsonObject, WEB_SERVICE_URL + '/DateWiseBookingSummaryWS/getDateWiseBoookingSummaryData.do?', _this.allLRDetails, EXECUTE_WITH_ERROR);
							}

							return _this;
						});

					});

					hideLayer();
				},
				inputFieldValidation : function() {
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					myNod.add({
						selector		: '#dateEle',
						validate		: 'presence',
						errorMessage	: 'Please select date'
					});
					myNod.add({
						selector		: '#lrTypeId',
						validate		: 'validateAutocomplete:#lrTypeId',
						errorMessage	: 'Please select LR type'
					});
					myNod.add({
						selector		: '#sourceSubRegion',
						validate		: 'validateAutocomplete:#sourceSubRegion_primary_key',
						errorMessage	: 'Please select source subregion'
					});
					myNod.add({
						selector		: '#sourceBranch',
						validate		: 'validateAutocomplete:#sourceBranch_primary_key',
						errorMessage	: 'Please select source branch'
					});
					myNod.add({
						selector		: '#destinationSubRegion',
						validate		: 'validateAutocomplete:#destinationSubRegion_primary_key',
						errorMessage	: 'Please select destination subregion'
					});
					myNod.add({
						selector		: '#destinationBranch',
						validate		: 'validateAutocomplete:#destinationBranch_primary_key',
						errorMessage	: 'Please select destination branch'
					});
					myNod.performCheck();
				},
				onSelectSourceSubRegion : function(){
					var jsonArray = new Array();
					jsonArray.push('#sourceBranch');
					_this.resetAutoComplete(jsonArray);
					var jsonObject = new Object();
					jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do', _this.setSourceBranch,EXECUTE_WITH_ERROR);
				},
				onSelectDestinationSubRegion : function(){
					var jsonArray = new Array();
					jsonArray.push('#destinationBranch');
					_this.resetAutoComplete(jsonArray);
					var jsonObject = new Object();
					jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do', _this.setDestinationBranch,EXECUTE_WITH_ERROR);
				},
				resetAutoComplete : function (jsonArray) {
					for ( var eleId in jsonArray) {
						var elem = $(jsonArray[eleId]).getInstance();
						$(elem).each(function() {
							var elemObj = this.elem.combo_input;
							$(elemObj).each(function() {
								$("#" + $(this).attr("id")).val('');
								$("#" + $(this).attr("id") + '_primary_key').val("");
							})
						})
					}
				},
				setSourceBranch : function (jsonObj) {
					var autoBranchName = $("#sourceBranch").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = jsonObj.sourceBranch;
					})
				},
				setDestinationBranch : function (jsonObj) {
					var autoBranchName = $("#destinationBranch").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = jsonObj.sourceBranch;
					})
				}, allLRDetails : function(response){

					$("#divLrDetailsHeader").empty();
					$("#divCategoryWiseDetailsHeader").empty();
					$("#divLrDetailsHeader").removeClass('hide');
					$("#divCategoryWiseDetailsHeader").removeClass('hide');

					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						$('.divLrDetailsHeader').hide();
						$('.divCategoryWiseDetailsHeader').hide();
						return;
					}
					$("#allLRDetailsUsingPhoneNumberDiv1").removeClass('hide');
					var viewLrDetailsColumnConfig			= response.dateWiseDataModel.columnConfiguration;
					var viewLrDetailsReportKeys				= _.keys(viewLrDetailsColumnConfig);
					if(response.dateWiseDataModel.CorporateAccount != undefined) {
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						var bcolConfig							= new Object();

						for (var i=0; i<viewLrDetailsReportKeys.length; i++) {
							var bObj	= viewLrDetailsColumnConfig[viewLrDetailsReportKeys[i]];
							if(bObj != null){
								if (bObj.show == true) {
									bcolConfig[viewLrDetailsReportKeys[i]]	= bObj;
								}
							}
						}
						response.dateWiseDataModel.columnConfiguration	= bcolConfig;
						response.dateWiseDataModel.Language				= masterLangKeySet;

						$('.divLrDetailsHeader').show();
						gridObject = slickGridWrapper2.setGrid(response.dateWiseDataModel);

					}else{
						$('.divLrDetailsHeader').hide();
					} 

					if(response.BookedBookingRegister != undefined) {
						var BookedBookingRegisterColumnConfig = response.BookedBookingRegister.columnConfiguration;
						var BookedBookingRegisterColumnKeys	= _.keys(BookedBookingRegisterColumnConfig);
						var BookedBookingRegisterConfig		= new Object();

						var NewBookedBookingRegisterColumnKeys	= new Array();

						for(var i = 0;BookedBookingRegisterColumnKeys.length > i; i++) {
							if(BookedBookingRegisterColumnKeys[i] != 'taxAmount') {
								
								NewBookedBookingRegisterColumnKeys.push(BookedBookingRegisterColumnKeys[i]);
							} else {
								break;
							}
						}

						if(response.chargesNameHM != undefined) {
							var chargesNameHM	= response.chargesNameHM;
							for(var j in chargesNameHM) {
								if(chargesNameHM[j] != null) {
									NewBookedBookingRegisterColumnKeys.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
									BookedBookingRegisterColumnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {	 
											"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
											,"dataType":"number"
											,"languageKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
											,"searchFilter":false
											,"listFilter":false
											,"columnHidden":false
											,"displayColumnTotal":false
											,"columnMinimumDisplayWidthInPx":90
											,"columnInitialDisplayWidthInPx":110
											,"columnMaximumDisplayWidthInPx":140
											,"columnPrintWidthInPercentage":12
											,"elementCssClass":""
											,"columnDisplayCssClass":""
											,"columnPrintCssClass":""
											,"sortColumn":true
											,"show":true
									};
									masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
								}
							}
						}

						NewBookedBookingRegisterColumnKeys = _.union(NewBookedBookingRegisterColumnKeys, BookedBookingRegisterColumnKeys);
						for (var i = 0; i < NewBookedBookingRegisterColumnKeys.length; i++) {
							var bObj	= BookedBookingRegisterColumnConfig[NewBookedBookingRegisterColumnKeys[i]];

							if(bObj != null) {
								if (bObj.show != undefined && bObj.show == true) {
									BookedBookingRegisterConfig[NewBookedBookingRegisterColumnKeys[i]] = bObj;
								}
							}
						}

						response.BookedBookingRegister.columnConfiguration	= _.values(BookedBookingRegisterConfig);
						response.BookedBookingRegister.Language				= masterLangKeySet;
					}

					if(response.BookedBookingRegister != undefined && response.BookedBookingRegister.CorporateAccount != undefined) {

						for(var i=0;response.BookedBookingRegister.CorporateAccount.length > i; i++) {
							var chargesNameHM	= response.chargesNameHM;
							for(var k in chargesNameHM) {
								if(chargesNameHM[k] != null) {
									response.BookedBookingRegister.CorporateAccount[i][chargesNameHM[k].replace(/[' ',.,/]/g,"")] = 0;
								}
							}
							if(response.BookedBookingRegister.CorporateAccount[i].chargesCollection != undefined) {
								var chargeHM	= response.BookedBookingRegister.CorporateAccount[i].chargesCollection;
								for(var l in chargeHM) {
									if(l.split("_")[1] != undefined) {
										response.BookedBookingRegister.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = chargeHM[l];
									}
								} 
							}
						}
						
						$('.divCategoryWiseDetailsHeader').show();
						gridObject1 = slickGridWrapper2.setGrid(response.BookedBookingRegister);
						hideLayer();
					}else{
						$('.divCategoryWiseDetailsHeader').hide();
					}
				}
			});
		});