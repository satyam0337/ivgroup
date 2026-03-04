define([	
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation'
			], function(slickGridWrapper2, Selection) {
					'use strict';
			
			let jsonObject = new Object() , _this, CATEGORY_PARTY = 2 , CATEGORY_REGION = 4, showCentralizedUpdateDeleteButtons = false, chargeTypeSectionValObj = null;
			
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/rateMasterWS/loadViewAllRateMaster.do?', _this.renderAllRates, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderAllRates : function(response) {
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					let finalListOfCategory = response.finalListOfCategory;
					chargeTypeSectionValObj = response.chargeTypeSectionValObj;
					
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/viewAllRatesByRouteWise/viewAllRatesByRouteWise.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#destRegionEle');
						elementConfiguration.subregionElement	= $('#destSubRegionEle');
						elementConfiguration.branchElement		= $('#destBranchEle');
						
						response.elementConfiguration		= elementConfiguration;
						response.sourceAreaSelection		= true;
						response.partySelection				= true;
						
						showCentralizedUpdateDeleteButtons  = response.showCentralizedUpdateDeleteButtons;
						
						Selection.setSelectionToGetData(response);
						
						if(response.showRateTypeSelection)
							$('#chargeTypeSelectionDiv').removeClass("hide");
						else
							$('#chargeTypeSelectionDiv').remove();
						
						let keys ;
						
						if(finalListOfCategory != undefined)
							 keys = Object.keys(finalListOfCategory);
						
						$('#categoryType').append('<option value="0" id="0">--Select category--</option>');
						
						for(const element of keys) {
							$('#categoryType').append('<option value="'+element+'" id="'+finalListOfCategory[element]+'" >'+finalListOfCategory[element]+'</option>');
						}
						
						$('#categoryType').on('change',function(){
							_this.resetPartyAndBranch();
							_this.hideAndShowAccordindToCategoryFeild();							
						});
						
						if(response.showRateTypeSelection)
							_this.createChargeTypeDropdown();
						
						//Source Branch auto complete
						let sourceBranchAutoComplete 			= new Object();
						sourceBranchAutoComplete.url 			= response.srcBranchList;
						sourceBranchAutoComplete.primary_key 	= 'branchId';
						sourceBranchAutoComplete.field 			= 'branchName';
						$("#branchEle").autocompleteCustom(sourceBranchAutoComplete);
						
						$('#rateByChrgConfgDiv').hide();
						$('#rateByRateMasterDiv').hide();
						$('#rateByPartyMinConfigDiv').hide();
						
						//find button activities
						$("#find").on('click', function() {
							showLayer();
							let jsonObject 		= Selection.getElementData();
							jsonObject.isExcludeOperationalBranch	= $('#isExcludeOperationalBranch').is(':checked');
							let categoryType						= $('#categoryType').val();
							
							if(categoryType == CATEGORY_REGION) {
								if(jsonObject.sourceBranchId == "" || jsonObject.sourceBranchId == undefined) {
									showAlertMessage('error','Please Select Source Branch! ');
									$('#branchEle').focus();
									$('#branchEle').css('border-color','red');
									hideLayer();
									return false;
								}
							
								if(jsonObject.destinationRegionId == "" || jsonObject.destinationRegionId == undefined) {
									showAlertMessage('error','Please Select Destination Region! ');
									$('#destRegionEle').focus();
									$('#destRegionEle').css('border-color','red');
									hideLayer();
									return false;
								}
							
								if(jsonObject.destinationSubRegionId == "" || jsonObject.destinationSubRegionId == undefined) {
									showAlertMessage('error','Please Select Destination Sub Region! ');
									$('#destSubRegionEle').focus();
									$('#destSubRegionEle').css('border-color','red');
									hideLayer();
									return false;
								}
							
								if(jsonObject.destinationBranchId == "" || jsonObject.destinationBranchId == undefined) {
									showAlertMessage('error','Please Select Destination Branch! ');
									$('#destBranchEle').focus();
									$('#destBranchEle').css('border-color','red');
									hideLayer();
									return false;
								}
							
								if(response.doNotSelectALLInBoth) {
									let sourceBranchId 				= $("#branchEle_primary_key").val();
							
									if(sourceBranchId == -1 && (jsonObject.destinationRegionId ==  -1 ||  jsonObject.destinationSubRegionId == -1 || jsonObject.destinationBranchId == -1)){
										showAlertMessage('error','You Can Not Select All In Source And Destination Both !');
										$('#destRegionEle').val("");
										$('#destSubRegionEle').val("");
										$('#destBranchEle').val("");
										$('#destBranchEle').css('border-color','red');
										hideLayer();
										return false;
									}
								}
								
								jsonObject.corporateAccountId = 0;
							}
							
							if(categoryType == CATEGORY_PARTY) {
								if(jsonObject.corporateAccountId == "") {
									showAlertMessage('error','Please Select Party ! ');
									$('#partyNameEle').focus();
									$('#partyNameEle').css('border-color','red');
									hideLayer();
									return false;
								}
							}

							jsonObject.chargeSectionTypeList = $('#rateTypeEle').val() || "";
							
							getJSON(jsonObject, WEB_SERVICE_URL + '/rateMasterWS/viewAllRateDetails.do?', _this.allRatesByPartyAndBranch, EXECUTE_WITH_ERROR);	
							
							return _this;
						});
						
					});
					
					hideLayer();
				}, resetPartyAndBranch : function() {
					$("#branchEle_primary_key").val("");
					$("#destBranchEle_primary_key").val("");
					$("#partyName_primary_key").val("");
				}, createChargeTypeDropdown : function() {
					const selector = '#rateTypeEle';
					let chargeSectionOptions = [];

					if (chargeTypeSectionValObj && Object.keys(chargeTypeSectionValObj).length > 0) {
						for (let key in chargeTypeSectionValObj) {
							chargeSectionOptions.push({
								chargeSectionId: key,
								chargeSectionName: chargeTypeSectionValObj[key]
							});
						}
					}

					if($(selector).length && $(selector)[0].selectize)
						$(selector)[0].selectize.destroy();

					return $(selector).selectize({
						options: chargeSectionOptions,
						valueField: 'chargeSectionId',
						labelField: 'chargeSectionName',
						searchField: 'chargeSectionName',
						create: false,
						maxItems: chargeSectionOptions.length,
						placeholder: '-- Select Rate Type --'
					});
				},	hideAndShowAccordindToCategoryFeild : function() {
					let categoryType		= $('#categoryType').val();
					
					if(categoryType == CATEGORY_REGION) {
						$('#branchPanel').removeClass("hide");
						$('#destinationRegionPanel').removeClass("hide");
						$('#destinationSubRegionPanel').removeClass("hide");
						$('#isOperationalPanel').removeClass("hide");
						$('#destinationBranchPanel').removeClass("hide");
						$('#partyPanel').addClass("hide");
						$('#find').removeClass("hide");
					} else if(categoryType == CATEGORY_PARTY) {
						$('#branchPanel').addClass("hide");
						$('#destinationRegionPanel').addClass("hide");
						$('#destinationSubRegionPanel').addClass("hide");
						$('#destinationBranchPanel').addClass("hide");
						$('#isOperationalPanel').addClass("hide");
						$('#partyPanel').removeClass("hide");
						$('#find').removeClass("hide");
					}
				}, allRatesByPartyAndBranch : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#rateByChrgConfgDiv').hide();
						$('#rateByRateMasterDiv').hide();
						$('#rateByPartyMinConfigDiv').hide();
						return;
					}
					
					//Rate By ChargeConfiguration Details
					if(response.ChargeConfigurationRate != undefined && response.ChargeConfigurationRate.CorporateAccount != undefined) {
						$('#rateByChrgConfgDiv').show();
						slickGridWrapper2.setGrid(response.ChargeConfigurationRate);
					} else
						$('#rateByChrgConfgDiv').hide();
						
					if(response.PartyMinValConfigRate != undefined && response.PartyMinValConfigRate.CorporateAccount != undefined) {
						$('#rateByPartyMinConfigDiv').show();
						slickGridWrapper2.setGrid(response.PartyMinValConfigRate);
					} else
						$('#rateByPartyMinConfigDiv').hide();
					
					//Rate By RateMaster Details
					if(response.RateMasterRate != undefined && response.RateMasterRate.CorporateAccount != undefined) {
						$('#rateByRateMasterDiv').show();
												
						let grid = slickGridWrapper2.setGrid(response.RateMasterRate);
						
						if (showCentralizedUpdateDeleteButtons) {
							$('#rateMasterActionButtons').removeClass('hide');

							$('#deleteMultipleRateMaster').off('click').on('click', function() {
								_this.rateDeleteMultiple(grid);
							});
														
							$('#updateMultipleRateMaster').off('click').on('click', function() {
								_this.rateUpdateMultiple(grid);
							});
						}
					} else
						$('#rateByRateMasterDiv').hide();
					
					hideLayer();
				}, rateUpdateMultiple : function(grid) {
					let selectedRows = grid.getSelectedRows();   
					let dataView = grid.getData();
					
					if (selectedRows.length === 0) {
						showAlertMessage('error', 'Please select at least one rate to update');
						return;
					}

					let btModalConfirm = new Backbone.BootstrapModal({
						content: "Are you sure you want to update " + selectedRows.length + " selected rates?",
						modalWidth: 25,
						title: 'Update Rates',
						okText: 'YES',
						showFooter: true,
						okCloses: true
					}).open();

					btModalConfirm.on('ok', function() {
						var jsonObject = new Object();

						let idWiseRatesMap = new Object;

						for (let i = 0; i < selectedRows.length; i++) {
							let item = dataView.getItem(selectedRows[i]);
							idWiseRatesMap[item.rateMasterId] = item.rate;
						}
						
						jsonObject["idWiseRates"]			= JSON.stringify(idWiseRatesMap);
					
						getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/updateMultipleRates.do', _this.rateUpdateAction, EXECUTE_WITH_ERROR);
					});	
				}, rateUpdateAction : function() {
					let MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&dataUpdate='+true+'&dataDelete='+false);
					$('#find').click();
				}, rateDeleteMultiple : function(grid) {
					let selectedRows = grid.getSelectedRows();
					let dataView = grid.getData();

					if (selectedRows.length === 0) {
						showAlertMessage('error', 'Please select at least one checkbox to delete !');
						return;
					}

					let btModalConfirm = new Backbone.BootstrapModal({
						content: "Are you sure you want to delete " + selectedRows.length + " selected rates?",
						modalWidth: 25,
						title: 'Delete Rates',
						okText: 'YES',
						showFooter: true,
						okCloses: true
					}).open();

					btModalConfirm.on('ok', function() {
						var jsonObject = new Object();
						var rateMasterIds = [];
					
						for (let i = 0; i < selectedRows.length; i++) {
							rateMasterIds.push(dataView.getItem(selectedRows[i]).rateMasterId);
						}
						
						jsonObject["rmIds"] = rateMasterIds.join(",");
						
						getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/deleteMultipleRates.do', _this.rateDeleteAction, EXECUTE_WITH_ERROR);
					}); 					
				}, rateDeleteAction : function(response) {
					let MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&dataUpdate='+false+'&dataDelete='+true);
					$('#find').click();
				}
			});
		});
		
function rateUpdate(grid, dataView, row) {
	
	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Update ?",
		modalWidth 	: 	25,
		title		:	'Update',
		okText		:	'YES',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		var jsonObject = new Object();

		jsonObject["rateMasterId"] 		= dataView.getItem(row).rateMasterId;
		jsonObject["rate"] 				= dataView.getItem(row).rate;

		getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/updateRateMasterRate.do', rateUpdateAction, EXECUTE_WITH_ERROR); //submit JSON
	});	
}

function  rateUpdateAction(response) {
	var MyRouter = new Marionette.AppRouter({});
	MyRouter.navigate('&dataUpdate='+true+'&dataDelete='+false);
	$('#find').click();
}

function rateDelete(grid, dataView, row) {
	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Delete ?",
		modalWidth 	: 	25,
		title		:	'Delete',
		okText		:	'YES',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		var jsonObject = new Object();

		jsonObject["rateMasterId"] 		= dataView.getItem(row).rateMasterId;

		getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/deleteRateMasterRate.do', rateDeleteAction, EXECUTE_WITH_ERROR); //submit JSON
	});	
}

function rateDeleteAction(response) {
	var MyRouter = new Marionette.AppRouter({});
	MyRouter.navigate('&dataUpdate='+false+'&dataDelete='+true);
	$('#find').click();
}
