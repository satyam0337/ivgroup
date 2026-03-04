
let jsondata 				= null;
let rateMasterConfiguration			= null;
let executive				= null;
let BookingChargeConstant	= null;
let RateMasterConstant		= null;
let chargeTypeSectionValObj	= null;
let BranchLocationTypeConstant					= null;
let WayBill					= null;
let ChargeConfigurationConstant		= null;
let lrLevelCharges			= null;
let chargesConfigRates		= null;
let FormTypeConstant		= null;
let checkboxcount					= 5;
let checkForFieldInApplicableOn 	= false;
let PackingGroupTypeMaster			= null;
let packingGroupMappingObjectListHM = null;
let packingType						= null;
let charges							= null;
let branchTypeCategory				= 1;
let partyTypeCategory				= 2;
let destRegionWiseRouteCharges		= false;
let destSubRegionWiseRouteCharges	= false;
let destBranchWiseRouteCharges		= false;
let formTypeMastersArray			= null;
let partyRouteWiseCharge			= null;
let RateMasterHeaderConstant		= null;
let ChargeTypeConstant				= null;
let routeWiseCharge					= null;
let isCheckValidation				= false;
let partyAutoCompleteWithNameAndGST	= false;
let chargeTypeList					= null;
let transportationModeList			= null;
let	valuationChargeList				= null;
let	wayBillTypeList					= null;

let VALUATION_CHARGE				= 204;
let isCityWiseRates					= false;
let isRegionWiseRates				= false;
let SLAB_TYPE_BRANCH 		= 1;
let SLAB_TYPE_PARTY    		= 2;
let SLAB_TYPE_REGION  		= 3;

let branchServiceTypeList			= null;
let deliveryToList					= null;
let billSelectionList				= null;

/*
 * Loads and set data on page initialization.
 * if got any error form server it remove all page contains and print the error
 */
function loadRateMasterData() {

	showLayer();
	let jsonObject		= new Object();

	$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/loadRateMaster.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}

					jsondata						= data;

					executive						= jsondata.executive;
					BookingChargeConstant			= jsondata.BookingChargeConstant;
					RateMasterConstant				= jsondata.RateMasterConstant;
					BranchLocationTypeConstant		= jsondata.BranchLocationTypeConstant;
					WayBill							= jsondata.WayBill;
					ChargeConfigurationConstant		= jsondata.ChargeConfigurationConstant;
					rateMasterConfiguration			= jsondata.rateMasterConfiguration;
					lrLevelCharges					= jsondata.lrLevelCharges;
					FormTypeConstant				= jsondata.FormTypeConstant;
					PackingGroupTypeMaster			= rateMasterConfiguration.PackingGroupTypeMaster;
					packingGroupMappingObjectListHM = jsondata.packingGroupMappingObjectListHM;
					packingType						= jsondata.packingType;
					charges							= jsondata.charges;
					chargeTypeSectionValObj			= jsondata.chargeTypeSectionValObj;
					formTypeMastersArray 			= jsondata.formTypeMastersArray;
					ChargeTypeConstant				= jsondata.ChargeTypeConstant;
					routeWiseCharge					= jsondata.routeWiseCharge;
					partyAutoCompleteWithNameAndGST	= rateMasterConfiguration.partyAutoCompleteWithNameAndGST;
					chargeTypeList					= jsondata.chargeTypeList;
					transportationModeList			= jsondata.transportationModeList;
					isCityWiseRates					= rateMasterConfiguration.isCityWiseRates;
					isRegionWiseRates				= rateMasterConfiguration.isRegionWiseRates;
					branchServiceTypeList			= jsondata.branchServiceTypeList;
					deliveryToList					= jsondata.deliveryToArray;
					wayBillTypeList					= jsondata.wayBillTypeList;
					billSelectionList				= jsondata.billSelectionList;

					showHideByProperty();
					setCategoryType();
					
					if(rateMasterConfiguration.billSelectionWiseRate)
						setBillselectionType();
					else
						$('#billPanel').remove();
					
					if(isCityWiseRates) {
						$("#sourcePanel").load("/ivcargo/jsp/masters/RateMasterNew/bookingCityPanel.html", function() {
							setCityAutoComplete();
						});
						
						$("#destinationRouteBranchesPanel").load("/ivcargo/jsp/masters/RateMasterNew/deliveryCityPanel.html", function() {
							$('#destinationRouteBranchesPanel').removeClass('hide');
							setDestinationCityAutoComplete('destinationCity');
						});
						
						$("#copyRateDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/copyDestinationCityPanel.html", function() {
							$('#copyRateDestinationPanel').removeClass('hide');
							setDestinationCityAutoComplete('copyDestinationCity');
						});
						
						$("#minimumValueConfigDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/minValConfigDestinationCityPanel.html", function() {
							setDestinationCityAutoComplete('minValCofigDestinationCity');
						});
					} else if(isRegionWiseRates) {
						$("#sourcePanel").load("/ivcargo/jsp/masters/RateMasterNew/bookingRegionPanel.html", function() {
							setRegionAutoComplete();
						});
						
						$("#destinationRouteBranchesPanel").load("/ivcargo/jsp/masters/RateMasterNew/deliveryRegionPanel.html", function() {
							$('#destinationRouteBranchesPanel').removeClass('hide');
							setDestinationRegionAutoComplete('destinationRegion');
						});
						
						$("#copyRateDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/copyRateDestinationRegionPanel.html", function() {
							$('#copyRateDestinationPanel').removeClass('hide');
							setDestinationRegionAutoComplete('copyDestinationRegion');
						});
						
						if(rateMasterConfiguration.showDestinationInMinimumValueConfig) {
							$("#minimumValueConfigDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/minValConfigDestinationRegionPanel.html", function() {
								setDestinationRegionAutoComplete('minValConfigDestinationRegion');
							});
						}
					} else {
						$("#sourcePanel").load("/ivcargo/jsp/masters/RateMasterNew/bookingBranchPanel.html", function() {
							setBranchAutoComplete();
						});
						
						$("#destinationRouteBranchesPanel").load("/ivcargo/jsp/masters/RateMasterNew/deliveryRouteWisePanel.html", function() {
							$('#destinationRouteBranchesPanel').removeClass('hide');
							setDestination();
						});
						
						if(rateMasterConfiguration.showDestinationInMinimumValueConfig) {
							$("#minimumValueConfigDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/minValConfigDestinationPanel.html", function() {
								setMinValConfigDestination();
							});
						}
						
						if (rateMasterConfiguration.copyRatesToOtherBranch) {
							$("#copyRateDestinationPanel").load("/ivcargo/jsp/masters/RateMasterNew/copyDestinationBranchSelectionPanel.html", function() {
								$('#copyRateDestinationPanel').removeClass('hide');
		
								if(rateMasterConfiguration.allowCopyWithIncreaseDecreaseRate)
									$('#copyWithIncAndDecCheckBox').removeClass('hide');
								
								setSource();
								setSourceBranchAutoComplete();
								//setDestinationSubRegionAutoComplete('sourceArea');
								//setDestinationRegionAutoComplete('sourceRegion');
								setDestinationToPartyAutoComplete('toParty');
							});
						}
					}
					
					$("#partyPanel").load("/ivcargo/jsp/masters/RateMasterNew/bookingPartyPanel.html", function() {
						setPartyAutoComplete();
					});
					
					$("#partyGSTNPanel").load("/ivcargo/jsp/masters/RateMasterNew/bookingPartyGSTNPanel.html", function() {
						setPartyGSTNAutoComplete();
					});
						
					setChargeTypeSection();
					setLRSectionCharges();
					setSlabWiseLRSectionCharges();
					setChargesApplicable();
					setChargesDropDown();
					setFieldDropDownInApplicableOn();
					setBookingType();
					setWayBillType("wayBillType");
					setWayBillType("wayBillTypeForSlabRate");
					
					if(rateMasterConfiguration.ShowVehicleType)
						setVehicleType();
					else
						$('#vehicleTypeCol').remove();
						
					setChargeType();
					setFormType();
					setFormTypeForEdit();
					setPackingTypeAutoComplete();
					setPackingTypeGroup();
					setCTForm();
					setArticleTypeForPartyChargeWeightPannel();
					setWayBillTypeForLRLevelSelection(wayBillTypeList);
										
					if (rateMasterConfiguration.transportationMode) {
						$('#transportationModeDiv').removeClass('hide');
						setTransportationMode();
					}
					
					if(rateMasterConfiguration.showBranchServiceType)
						setBranchServiceType();
						
					if(rateMasterConfiguration.showDeliveryTo)
						setDeliveryTo();

					//Called from articleWiseWeightDifference.js file
					setArticleTypeForArticleWiseWeightDiffPannel();
					
					if(rateMasterConfiguration.LRLevelSection)
						setLRLevelDestination();
					
					if(rateMasterConfiguration.IncreaseAndDecreaseRatePanel)
						setIncreaseDecreseDestination();
					
					if(rateMasterConfiguration.SlabWiseRouteConfigurationPanel)
						setRouteWiseSlabConfigDestination();
					
					setConsigneePartyAutoComplete();
					setSaidToContainAutoComplete();
					$('#minHamaliAmount').val("0");
					setSlabs(0, 0);
					setPackingGroupType();
					
					if(rateMasterConfiguration.roundOffChargeWeight)
						$('#chargeWeightRoundOffAmt').val("0");

					if(rateMasterConfiguration.allowCopyWithIncreaseDecreaseRate){
						$('#copyIncreasedDecreasedRate').attr('checked', false);
						$('#percentToCopyIncreaseDecrease').attr('checked', false);
						$('#copyIncreaseDecreaseAmount').val("0");
					}
					
					if(rateMasterConfiguration.SlabWeightPanel)
						setSlabWeightDropDown();
					
					if(rateMasterConfiguration.ValuationChargePanel)
						getChargesConfigRatesForValuationCharge();
					
					$("#RateCalculationOnBookingChargesTab").click(function (){
						setBookingChargeDropDownForFs(charges ,BookingChargeConstant);
					});
					
					$('input:text').css("text-transform","uppercase");	// transform all text content to uppercase
					$('input:text').prop("autocomplete","off");	// Auto suggestion off
					$("input:text").focus(function() {$(this).select(); });	// to select all text content onfocus

					hideLayer();
				}
			});
}

function showHideByProperty() {
	if (rateMasterConfiguration.LRLevelSection) {
		showPartOfPage('lrlevelSectionTab');
		showPartOfPage('lrlevelSection');
	}

	if(rateMasterConfiguration.showConditionalChargesDiv) {
		$('#conditionalChargesLabel').show();
		$('#conditionalCharges').show();
	} else {
		$('#conditionalChargesLabel').hide();
		$('#conditionalCharges').hide();
	}

	if (rateMasterConfiguration.ChargeApplicable) {
		showPartOfPage('chargeapplicableTab');
		showPartOfPage('chargeapplicable');
	}

	if (rateMasterConfiguration.ChargeAmount) {
		showPartOfPage('chargeamountTab');
		showPartOfPage('chargeamount');
	}

	if (rateMasterConfiguration.RouteWiseCharge) {
		if(rateMasterConfiguration.setFixChargeRate) {
			$('#isChargedFixedDiv').removeClass('hide');
			$("#isChargedFixed").prop("checked", false);
			selectFixCharge(false);
		}
		
		showPartOfPage('routewisechargeTab');
		showPartOfPage('routewisecharge');
	}

	if(rateMasterConfiguration.showRouteWiseDateSelection)
		$('#dateSelectionDiv').removeClass('hide');
	else
		$('#dateSelectionDiv').remove();
		
	if (rateMasterConfiguration.PartyMinimumAmount) {
		showPartOfPage('partyminimumamountTab');
		showPartOfPage('partyminimumamount');
	}

	if (rateMasterConfiguration.FixedHamaliSlabRate) {
		showPartOfPage('fixedHamaliSlabRateTab');
		showPartOfPage('fixedHamaliSlabRate');
	}

	if (rateMasterConfiguration.ShowAllCheckboxInChargeApplicable)
		showPartOfPage('allChargesApplicableRW');

	if (rateMasterConfiguration.PartyChargeWeightToIncrease) {
		showPartOfPage('partychargeweighttoincreaseTab');
		showPartOfPage('partychargeweighttoincrease');						
	}

	if (rateMasterConfiguration.ArticleWiseWeightDifference) {
		showPartOfPage('articlewiseweightdifferenceTab');
		showPartOfPage('articlewiseweightdifference');						
	}
	
	if (rateMasterConfiguration.FormTypeWiseCharge) {
		showPartOfPage('formTypeWiseChargeTab');
		showPartOfPage('formTypeWiseCharge');	
	}

	if (rateMasterConfiguration.CTFormTypeWiseCharge) {
		showPartOfPage('CTformTypeWiseChargeTab');
		showPartOfPage('CTformTypeWiseCharge');							
	}

	if (rateMasterConfiguration.copyRatesToOtherBranch) {
		showPartOfPage('CopyRatesToOtherBranchTab');
		showPartOfPage('CopyRatesToOtherBranch');
	}

	if (rateMasterConfiguration.roundOffChargeWeight) {
		showPartOfPage('roundOffChargeWeightTab');
		showPartOfPage('roundOffChargeWeight');						
	}

	if(rateMasterConfiguration.DisplayAllDataForIncreaseChargeWeightConfig)
		changeDisplayProperty('chargeWeightConfigView', 'block');

	if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff)
		changeDisplayProperty('minValueInArt', 'block');

	if(rateMasterConfiguration.showDownloadToExcelButton && jsondata.DOWNLOAD_TO_EXCEL_IN_RATE_MASTER)
		changeDisplayProperty('downloadToExelPanel', 'block');
	
	if(rateMasterConfiguration.allowWayBillTypeWiseRate)
		$('#wayBillType').show();
	else
		$('#wayBillType').hide();
	
	if(rateMasterConfiguration.showRateConfigurationPanel)
		changeDisplayProperty('rateConfiguredPanel', 'block');
	
	if(rateMasterConfiguration.showFsRateConfigurationPanel) {
		showPartOfPage('RateCalculationOnBookingChargesTab');
		changeDisplayProperty('RateCalculationOnBookingCharges', 'block');
	}
	
	if(rateMasterConfiguration.showFixedPartyChargesPanel) {
		showPartOfPage('FixedPartyChargesTab');
		changeDisplayProperty('FixedPartyCharges', 'block');
	}
	
	if(!rateMasterConfiguration.allowPartyToPartyRate)
		$('#consigneePartyNameCol').remove();
	
	if(rateMasterConfiguration.destinationWiseLRLevelCharges)
		changeDisplayProperty('lrLeveldestinationPanel', 'block');
	
	if(rateMasterConfiguration.IncreaseAndDecreaseRatePanel) {
		showPartOfPage('IncreaseAndDecreaseRateTab');
		changeDisplayProperty('IncreaseAndDecreaseRates', 'block');
	}
	
	if(rateMasterConfiguration.SlabWiseRouteConfigurationPanel){
		showPartOfPage('SlabWiseRouteConfigRateTab');
		changeDisplayProperty('SlabWiseRouteConfigRates', 'block');
	}
	
	if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff)
		changeDisplayProperty('destBranchDiv', 'block');
	
	if(rateMasterConfiguration.SlabWeightPanel) {
		showPartOfPage('WeightSlabTab');
		changeDisplayProperty('WeightSlab', 'block');
	}
	
	if(rateMasterConfiguration.ValuationChargePanel) {
		showPartOfPage('valuationChargeOnQtyTab');
		changeDisplayProperty('valuationChargeOnQty', 'block');
	}
	
	if(rateMasterConfiguration.declaredValueSlabRatePanel) {
		showPartOfPage('chargesOnDeclaredValueTab');
		changeDisplayProperty('chargesOnDeclaredValue', 'block');
	}
	
	if(rateMasterConfiguration.showSlabSelectionInMinimumValueConfig) {
		$('#minimumValueSlabsDiv').removeClass('hide');
		$('#minimumPartyViewPanel').removeClass('hide');
	} else
		$('#minimumValueSlabsDiv').remove();
	
	if(rateMasterConfiguration.showDestinationInMinimumValueConfig)
		$('#minimumValueConfigDestinationPanel').removeClass('hide');
	else
		$('#minimumValueConfigDestinationPanel').remove();
	
	if(rateMasterConfiguration.showWayBillTypeInLRLevelSection)
		$('#wayBillTypeIds').show();
	else
		$('#wayBillTypeIds').hide();
		
	if(rateMasterConfiguration.isGroupLevelConditionalLRLevelCharges)
		$('#isGroupLevelDiv').removeClass('hide');
	else
		$('#isGroupLevelDiv').remove();
		
	if(rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate)
		$('#isEditableDiv').removeClass('hide');
	else
		$('#isEditableDiv').remove();
			
	if(!rateMasterConfiguration.minimumWeight)
		$('#minimumWeightDiv').remove();
	
	if(!rateMasterConfiguration.minimumAmount)
		$('#minimumAmountDiv').remove();
	
	if(!rateMasterConfiguration.ddSlab)
		$('#ddSlabDiv').remove();
	
	if(!rateMasterConfiguration.showPackingTypeInMinimumValueConfiguration)
		$('#minimumPackingTypeDiv').remove();
}

//charges applicable permission for branch. save if new update if exist
function addBookingApplicableCharges(obj) {
	if(!validateMainSection(0)) {
		obj.checked	= !obj.checked;
		
		return false;
	}

	selectChargeApplicableAllCheckBox();

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= obj.getAttribute("data-value");
			jsonObject["isApplicable"]			= obj.checked;

			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL + '/rateMasterWS/updateChargeApplicable.do',
				data		: jsonObject,
				dataType	: 'json',
				success		: function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						getChargesConfigRates(); //defined in lrlevelsectionCharges.js
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			obj.checked	= false;
			if ($("#selectAllChargeApplicableChargeId").length > 0) {
				$('#selectAllChargeApplicableChargeId').prop('checked', false);
			}
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

//charges edit amounts and editable permission. save if new update if exist
function addChargessAmount() {
	if(!validateMainSection(0))
		return false;

	if(!validateEditAmountChargesDropdown1())
		return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown1').val();
			jsonObject["isEditable"]			= $('#editable').prop("checked");

			if ($('#editAmountTypePercent').prop("checked"))
				jsonObject["editAmountType"]	= ChargeConfigurationConstant.EDIT_AMOUNT_TYPE_PERCENTAGE;
			else
				jsonObject["editAmountType"]	= ChargeConfigurationConstant.EDIT_AMOUNT_TYPE_SIMPLE;
			
			jsonObject["editMaxValue"]		= $('#maxEditValue').val();
			jsonObject["editMinAmount"]		= $('#editableMinVal').val();
			jsonObject["editMaxAmount"]		= $('#editableMaxVal').val();

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateChargeEditAmount.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						getChargesConfigRates(); //defined in lrlevelsectionCharges.js
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

//save minimum weight and ddslab amount in rate master
function addMinimumPartyRates() {
	if(!validateParty())
		return false;
		
	if(!validateAddMinimumPartyRatesData())
		return false;

	$.confirm({
		text: "Are you sure you want to save minimum amount ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			if(rateMasterConfiguration.OnlyPartyWiseMinimumValueConfigAllow)
				jsonObject["sourceBranchId"]	= 0;
			else
				jsonObject["sourceBranchId"]	= $('#branchId').val();
			
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["minWeightRate"]			= $('#minWeight').val();
			jsonObject["ddSlab"]				= $('#ddSlab').val();
			jsonObject["minAmount"]				= $('#minAmount').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["slabs"]					= $('#slabs1').val();
			jsonObject["destination"]			= $('#minValConfigDestination').val();
			jsonObject["packingTypeIds"]		= getPackingTypeIds($("#articleType1 option:selected"));//calling from routWiseCharges.js
			
			let checkBoxArray	= new Array();
			
			$("input[name=minValConfigMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]		= checkBoxArray.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/addPartyMinimumRates.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

//save minimum weight and ddslab amount in rate master
function getMinimumPartyRates() {
	let jsonObject		= new Object();
	
	if(rateMasterConfiguration.OnlyPartyWiseMinimumValueConfigAllow)
		jsonObject["sourceBranchId"]	= 0;
	else
		jsonObject["sourceBranchId"]	= $('#branchId').val();
	
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["categoryTypeId"]		= $('#categoryType').val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getPartyMinimumRates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				$("#minWeight").val(0);
				$("#ddSlab").val(0);
				$("#minAmount").val(0);
				hideLayer();
				return;
			}
			
			$("#minWeight").val(0);
			$("#ddSlab").val(0);
			$("#minAmount").val(0);

			let rateList		= data.rateList;
			let rateMaster		= null;

			if(typeof rateList != 'undefined') {
				if(rateList.hasOwnProperty(RateMasterConstant.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID)) {
					rateMaster			= rateList[RateMasterConstant.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID];
					$('#minWeight').val(rateMaster.rate);
				}

				if(rateList.hasOwnProperty(RateMasterConstant.CHARGE_SECTION_PARTY_DDSLAB_ID)) {
					rateMaster			= rateList[RateMasterConstant.CHARGE_SECTION_PARTY_DDSLAB_ID];
					$('#ddSlab').val(rateMaster.rate);
				}

				if(rateList.hasOwnProperty(RateMasterConstant.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID)) {
					rateMaster			= rateList[RateMasterConstant.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID];
					$('#minAmount').val(rateMaster.rate);
				}
			}
			
			hideLayer();
		}
	});
}

function updateRouteWiseSlabMasterRate(rateMasterId, rate, extraAmtPerSqftrateValue, increasedAmountPerKgValue){
	let jsonObject				= new Object();
	
	jsonObject["rateMasterId"]				= rateMasterId;
	jsonObject["rate"]						= rate;
	jsonObject["extraAmtPerSqft"]			= extraAmtPerSqftrateValue;
	jsonObject["increasedAmountPerKg"]		= increasedAmountPerKgValue;
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateRouteWiseSlabRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}
	});

}

function deleteRateMasterRate(rateMasterId, rmIds) {
	let jsonObject				= new Object();
	
	jsonObject["rateMasterId"]		= rateMasterId;
	jsonObject["rmIds"]				= rmIds;
	jsonObject["sourceCityId"] 		= $('#cityId').val();
	jsonObject["corporateAccountId"]= $('#partyId').val();
	jsonObject["categoryTypeId"]	= $('#categoryType').val();
	jsonObject["sourceRegionId"] 	= $('#regionId').val();
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteRateMasterRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}
	});
}

function deleteRouteWiseSlabRateMasterRate(rateMasterId){
	
	let jsonObject				= new Object();
	
	jsonObject["rateMasterId"]	= rateMasterId;
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteRouteWiseSlabRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}
	});
}

//set content on page initialization.
function setCategoryType() {
	removeOption('categoryType',null);
	createOption('categoryType', 0, "-- Select Category --");
	
	if(isCityWiseRates)
		createOption('categoryType', CATEGORY_TYPE_GENERAL_ID, 'City');
	else if(isRegionWiseRates)
		createOption('categoryType', CATEGORY_TYPE_GENERAL_ID, 'Region');
	else
		createOption('categoryType', CATEGORY_TYPE_GENERAL_ID, 'Branch');
		
	createOption('categoryType', CATEGORY_TYPE_PARTY_ID, 'Party');
}

//set content on page initialization.
function setBillselectionType() {
	removeOption('billSelection', null);
	createOption('billSelection', 0, "-- Select Bill Type --");
	
	for(const element of billSelectionList) {
		createOption('billSelection', element.billSelectionId, element.billSelectionName);
	}
}

//set content on page initialization.
function setChargeTypeSection() {

	createOption('chargeSection', 0, "-- Select Category --");
	for (let key in chargeTypeSectionValObj) {
		createOption('chargeSection',key, chargeTypeSectionValObj[key]);
	} 
	createOption('chargeSection',-1, "ALL");
	// Set Selectize with Default value
	setSelectize('chargeSection','-- Select Category --');
}

function setSlabs(slabPartyId, slabTypeId) {
	if(!rateMasterConfiguration.isSlabFeildDisplay) {
		changeDisplayProperty('slabsFeild', 'none');
		removeHtmlAttribute(2, 'routeAmountFeild', 'style');
	}

	removeOption('slabs', null);
	createOption('slabs', 0, "-- Select Slab --");
	createOption('slabs', "0-0", "none");
	
	removeOption('slabs1', null);
	createOption('slabs1', 0, "-- Select Slab --");
	createOption('slabs1', "0-0", "none");
	
	removeOption('slabs2', null);
	createOption('slabs2', 0, "-- Select Slab --");
	createOption('slabs2', "0-0", "none");
	
	removeOption('slabs3', null);
	createOption('slabs3', 0, "-- Select Slab --");
	createOption('slabs3', "0-0", "none");
	
	removeOption('routeSlabs', null);
	createOption('routeSlabs', 0, "-- Select Slab --");
	createOption('routeSlabs', "0-0", "none");

	if(!(rateMasterConfiguration.isSlabFeildDisplay
		|| rateMasterConfiguration.showSlabSelectionInMinimumValueConfig
		|| rateMasterConfiguration.FixedHamaliSlabRate
		|| rateMasterConfiguration.declaredValueSlabRatePanel
		|| rateMasterConfiguration.SlabWiseRouteConfigurationPanel))
		return;
	
	if(rateMasterConfiguration.isFixedSlabAmount)
		$('#fixSlabsFeild').removeClass('hide');
	else
		$('#fixSlabsFeild').remove();

	let jsonObjectData = new Object();
	
	if(slabTypeId == SLAB_TYPE_PARTY)
		jsonObjectData.corporateAccountId 	= slabPartyId;
	else if(slabTypeId == SLAB_TYPE_BRANCH)
		jsonObjectData.sourceBranchId 		= slabPartyId;
	else if(slabTypeId == SLAB_TYPE_REGION)
		jsonObjectData.sourceRegionId 		= slabPartyId;
		
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/viewAllConfigSlab.do',
		data		: jsonObjectData,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined)
				return;
				
			let slabMasterList	= data.SlabMaster;
			
			for(const element of slabMasterList) {
				createOption('slabs', element.slabMasterId, element.minValue + "-" + element.maxValue);
				createOption('slabs1', element.slabMasterId, element.minValue + "-" + element.maxValue);
				createOption('slabs2', element.slabMasterId, element.minValue + "-" + element.maxValue);
				createOption('slabs3', element.slabMasterId, element.minValue + "-" + element.maxValue);
				createOption('routeSlabs', element.slabMasterId, element.minValue + "-" + element.maxValue);
			}
					
			hideLayer();
		}
	});
}

function setLRSectionCharges() {
	for (const element of charges) {
		if(jQuery.inArray(element.chargeTypeMasterId, lrLevelCharges) != -1)
			createLRSectionChargesInput(element, '#tr_lrSectionCharges');
	}
}

function setSlabWiseLRSectionCharges(){
	for (const element of charges) {
		if(jQuery.inArray(element.chargeTypeMasterId, routeWiseCharge) != -1)
			createSlabWiseLRSectionChargesInput(element, '#tr_slabWiselrSectionCharges');
	}
}

function createLRSectionChargesInput(charge,tableRow) {

	let inputAttr1		= new Object();
	let inputAttr2		= new Object();
	let inputAttr3		= new Object();
	let inputAttr4		= new Object();
	let chargeId		= charge.chargeTypeMasterId;
	let tableCol		= createColumn(tableRow,'td_'+chargeId,'10%','left','','');

	inputAttr1.id			= 'charge'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'charge'+chargeId;
	inputAttr1.style		= 'width: 60px; text-align: right;';
	inputAttr1.class		= 'textfield_medium form-control';
	inputAttr1.maxlength	= 5;
	inputAttr1.onkeypress	= 'return validAmount(event);';
	inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';

	createLabel(tableCol, 'label'+chargeId, charge.chargeTypeMasterDisplayName + '', '', '', '');
	createInput(tableCol, inputAttr1);
	
	inputAttr2.id			= 'chargeUnit' + chargeId;
	inputAttr2.type			= 'hidden';
	inputAttr2.value		= charge.chargeUnit;
	inputAttr2.name			= 'chargeUnit' + chargeId;
	
	inputAttr3.id			= 'isGroupLevel_' + chargeId;
	inputAttr3.type			= 'checkbox';
	inputAttr3.name			= 'isGroupLevel_' + chargeId;
	
	inputAttr4.id			= 'isEditable_' + chargeId;
	inputAttr4.type			= 'checkbox';
	inputAttr4.checked		= 'checked';
	inputAttr4.name			= 'isEditable_' + chargeId;

	if(charge.chargeUnit > 0)
		tableCol.append($('<span />').html(charge.chargeUnitName));
	
	if(rateMasterConfiguration.ChargeApplicableOnQuantity && rateMasterConfiguration.ChargeListApplicableOnQuantity != 0) {
		let chargeArr		= (rateMasterConfiguration.ChargeListApplicableOnQuantity).split(',');
		
		if(isValueExistInArray(chargeArr, chargeId)) {
			inputAttr2.value		= ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY;
			tableCol.append($('<span />').html(ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY_NAME));
		}
	}
	
	if(rateMasterConfiguration.ChargeApplicableOnWeight && rateMasterConfiguration.ChargeListApplicableOnWeight != 0) {
		let chargeArr		= (rateMasterConfiguration.ChargeListApplicableOnWeight).split(',');
		
		if(isValueExistInArray(chargeArr, chargeId)) {
			inputAttr2.value		= ChargeTypeConstant.CHARGE_TYPE_UNIT_WEIGHT;
			tableCol.append($('<span />').html(ChargeTypeConstant.CHARGE_TYPE_UNIT_WEIGHT_NAME));
		}
	}
	
	createInput(tableCol, inputAttr2);
	
	if(rateMasterConfiguration.isGroupLevelLRLevelCharges) {
		tableCol.append($('<span />').html('<br>'));
		createInput(tableCol, inputAttr3);
		tableCol.append($('<span />').html(' Is Group Level'));
	}
	
	//if(rateMasterConfiguration.isGroupLevelLRLevelCharges) {
		tableCol.append($('<span />').html('<br>'));
		createInput(tableCol, inputAttr4);
		tableCol.append($('<span />').html(' Is Editable'));
	//}
}

function createSlabWiseLRSectionChargesInput(charge,tableRow){
	
	let inputAttr1		= new Object();
	let inputAttr2		= new Object();
	let chargeId		= charge.chargeTypeMasterId;
	let tableCol		= createColumn(tableRow,'td_'+chargeId,'10%','left','','');

	inputAttr1.id			= 'routecharge'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'routecharge'+chargeId;
	inputAttr1.style		= 'width: 60px; text-align: right;';
	inputAttr1.class		= 'textfield_medium form-control';
	inputAttr1.maxlength	= 5;
	inputAttr1.onkeypress	= 'return validAmount(event);';
	inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';

	createLabel(tableCol, 'label'+chargeId, charge.chargeTypeMasterDisplayName + '', '', '', '');
	createInput(tableCol, inputAttr1);
	
	inputAttr2.id			= 'chargeUnit' + chargeId;
	inputAttr2.type			= 'hidden';
	inputAttr2.value		= charge.chargeUnit;
	inputAttr2.name			= 'chargeUnit' + chargeId;

	if(charge.chargeUnit > 0)
		tableCol.append($('<span />').html(charge.chargeUnitName));
	
	if(rateMasterConfiguration.ChargeApplicableOnQuantity && rateMasterConfiguration.ChargeListApplicableOnQuantity != 0) {
		let chargeArr		= (rateMasterConfiguration.ChargeListApplicableOnQuantity).split(',');
		
		if(isValueExistInArray(chargeArr, chargeId)) {
			inputAttr2.value		= ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY;
			tableCol.append($('<span />').html(ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY_NAME));
		}
	}
	
	if(rateMasterConfiguration.ChargeApplicableOnWeight && rateMasterConfiguration.ChargeListApplicableOnWeight != 0) {
		let chargeArr		= (rateMasterConfiguration.ChargeListApplicableOnWeight).split(',');
		
		if(isValueExistInArray(chargeArr, chargeId)) {
			inputAttr2.value		= ChargeTypeConstant.CHARGE_TYPE_UNIT_WEIGHT;
			tableCol.append($('<span />').html(ChargeTypeConstant.CHARGE_TYPE_UNIT_WEIGHT_NAME));
		}
	}
	
	createInput(tableCol, inputAttr2);
}

var tableRow	= null;
var counts		= 5;

function setChargesApplicable() {
	for ( let i = 0; i < charges.length; i++) {
		if (i % counts == 0)
			tableRow		= createRow('tr_'+i,'');
		
		createChargesApplicableInput(charges[i],tableRow);
	}
}

function createChargesApplicableInput(charge,tableRow) {

	let chargeId		= charge.chargeTypeMasterId;
	let tableCol		= createColumn(tableRow,'td_'+chargeId,'20%','','','');
	let input			= null;
	let inputAttr1		= new Object();

	inputAttr1.id			= 'applicableCharge'+chargeId;
	inputAttr1.type			= 'checkbox';
	inputAttr1.value		= chargeId;
	inputAttr1.name			= 'ChargesApplicableCB';
	inputAttr1.onclick		= 'addBookingApplicableCharges(this);';

	input	= createInput(tableCol,inputAttr1);
	input.attr( {
		'data-value' : chargeId
	});

	$(tableCol).append("&emsp;" + charge.chargeTypeMasterDisplayName);
	$('#chargesApplicable').append(tableRow);
}

function setChargesDropDown() {
	removeOption('chargesDropDown1',null);
	createOption('chargesDropDown1', 0, "-- Select Charges --");
	removeOption('chargesDropDown2',null);
	createOption('chargesDropDown2', 0, "-- Select Charges --");
	removeOption('chargesDropDown3',null);
	createOption('chargesDropDown3', 0, "-- Select Charges --");
	removeOption('chargesDropDown4',null);
	createOption('chargesDropDown4', 0, "-- Select Charges --");
	removeOption('chargesDropDown5',null);
	createOption('chargesDropDown5', 0, "-- Select Charges --");
	removeOption('chargesDropDown6',null);
	createOption('chargesDropDown6', 0, "-- Select Charges --");
	
	removeOption('chargesDropDownForLrLevel',null);
	createOption('chargesDropDownForLrLevel', 0, "-- Select Charges --");
	removeOption('chargesApplicableForLrLevel',null);
	createOption('chargesApplicableForLrLevel', 0, "-- Select Charges --");
	removeOption('fixedPartyChargesDropDown',null);
	createOption('fixedPartyChargesDropDown', 0, "-- Select Charges --");
	
	for (const element of charges) {
		createOption('chargesDropDown1', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		createOption('chargesDropDown2', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		createOption('chargesDropDownForLrLevel', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		createOption('chargesApplicableForLrLevel', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		createOption('fixedPartyChargesDropDown', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		

		if(jQuery.inArray(element.chargeTypeMasterId, lrLevelCharges) != -1)
			createOption('chargesDropDown3', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		
		if(rateMasterConfiguration.IncreaseAndDecreaseRatePanel)
			createOption('chargesDropDown4', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		
		if(rateMasterConfiguration.declaredValueSlabRatePanel)
			createOption('chargesDropDown5', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		
		if(rateMasterConfiguration.allowCopyWithIncreaseDecreaseRate)
			createOption('chargesDropDown6', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
	}
	
	$('#chargesDropDown2').val(rateMasterConfiguration.RouteWiseDefaultCharge);
}

function changeOnChargeDropDown () {
	if(rateMasterConfiguration.removeDestinationDropDown ){
		let chargeDropDownArr	= new  Array();

		for (const element of charges) {
			let chargeTypeMasterId		   = element.chargeTypeMasterId;
			let lrLevelSectionChargesArr   = (rateMasterConfiguration.LRLevelSectionChargesList).split(",");
			
			if(isValueExistInArray(lrLevelSectionChargesArr, chargeTypeMasterId))
				chargeDropDownArr.push(chargeTypeMasterId);
		}
		
		$("#incDecDestinationTypeComboPanel").removeClass('hide');
		$("#incDecDeleteSelection").removeClass('hide');
		$("#incDecDestinationRegion").removeClass('hide');
		$("#incDecDestinationArea").removeClass('hide');
		$("#incDecDestinationBranch").removeClass('hide');
		isCheckValidation = false;
		
		if(chargeDropDownArr != null) {
			for (const element of chargeDropDownArr) {
				if(element == Number($('#chargesDropDown4').val())){
					$("#incDecDestinationTypeComboPanel").addClass('hide');
					$("#incDecDeleteSelection").addClass('hide');
					$("#incDecDestinationRegion").addClass('hide');
					$("#incDecDestinationArea").addClass('hide');
					$("#incDecDestinationBranch").addClass('hide');
					isCheckValidation = true;
				}
			}
		}
	}
}

function setFieldDropDownInApplicableOn() {
	if (rateMasterConfiguration.ShowDeclaredValueFieldInApplicableOn) {
		createOption('chargesApplicableForLrLevel', 0, "-- Select Field --");
		createOption('chargesApplicableForLrLevel', "declaredValue_" + ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE, ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE_NAME);
		$("#declaredValue_"+ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE).val(ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE);
	}
	
	if(rateMasterConfiguration.ValuationChargePanel) {
		removeOption('applChargeDropDownValCharge', null);
		createOption('applChargeDropDownValCharge', 0, "-- Select Field --");
		createOption('applChargeDropDownValCharge', ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE, ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE_NAME);
	}
}

function checkForApplicableOnDeclaredValue() {
	let chargeApplicableOnLrLevelEle = document.getElementById('chargesApplicableForLrLevel');

	checkForFieldInApplicableOn = rateMasterConfiguration.ShowDeclaredValueFieldInApplicableOn
		&& chargeApplicableOnLrLevelEle
			&& chargeApplicableOnLrLevelEle.options[chargeApplicableOnLrLevelEle.selectedIndex].text == ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE_NAME;
}

function setBookingType() {
	let bookingTypeList		= jsondata.bookingTypeList;
	
	removeOption('bookingType', null);
	createOption('bookingType', 0, "-- Select Booking Type --");

	for(const element of bookingTypeList) {
		createOption('bookingType', element.bookingTypeId, element.bookingTypeName);
	}
	
	$('#bookingType').val(rateMasterConfiguration.RouteWiseDefaultBookingType);
}

function setWayBillType(id) {
	removeOption(id, null);
	createOption(id, 0, "-- Select LR Type --");
	
	createOption(id, WAYBILL_TYPE_PAID, WAYBILL_TYPE_NAME_PAID);
	createOption(id, WAYBILL_TYPE_TO_PAY, WAYBILL_TYPE_NAME_TOPAY);
	createOption(id, WAYBILL_TYPE_CREDIT, WAYBILL_TYPE_NAME_CREDITOR);
}

function setChargeType() {
	removeOption('chargeType', null);
	createOption('chargeType', 0, "-- Select Charge Type --");
	
	removeOption('fixedPartyChargeType',null);
	createOption('fixedPartyChargeType', 0, "-- Select Charge Type --");
	
	for(const element of chargeTypeList) {
		let ct = element;
		
		createOption('chargeType', ct.chargeTypeId, ct.chargeTypeName);
		createOption('fixedPartyChargeType', ct.chargeTypeId, ct.chargeTypeName);
	}
}

function setDestination() {
	removeOption('destination', null);
	removeOption('destinationArea',null);
	removeOption('sourceArea',null);
	createOption('destination', 0, "-- Select Destination --");
	createOption('destinationArea', 0, "-- Select Area --");
	createOption('sourceArea', 0, "-- Select Area --");

	if(rateMasterConfiguration.DestinationRegionWiseRouteCharges) {
		createOption('destination', RateMasterConstant.DESTINATION_TYPE_REGION, 'Region');
		setDestinationRegionAutoComplete('destinationRegion');
	}

	if(rateMasterConfiguration.DestinationSubRegionWiseRouteCharges) {
		createOption('destination', RateMasterConstant.DESTINATION_TYPE_SUB_REGION, 'Sub-Region');
		setDestinationSubRegionAutoComplete('destinationArea');
	}

	if(rateMasterConfiguration.DestinationBranchWiseRouteCharges) {
		createOption('destination', RateMasterConstant.DESTINATION_TYPE_BRANCH, 'Branch');
		setDestinationBranchAutoComplete('destinationBranch');
	}
	
	setArticleWiseWeightDiffDestBranchAutoComplete();
}

function setMinValConfigDestination() {
	removeOption('minValConfigDestination', null);
	removeOption('minValConfigDestinationArea',null);
	removeOption('sourceArea',null);
	createOption('minValConfigDestination', 0, "-- Select Destination --");
	createOption('minValConfigDestinationArea', 0, "-- Select Area --");
	createOption('sourceArea', 0, "-- Select Area --");

	if(rateMasterConfiguration.DestinationRegionWiseRouteCharges) {
		createOption('minValConfigDestination', RateMasterConstant.DESTINATION_TYPE_REGION, 'Region');
		setDestinationRegionAutoComplete('minValConfigDestinationRegion');
	}

	if(rateMasterConfiguration.DestinationSubRegionWiseRouteCharges) {
		createOption('minValConfigDestination', RateMasterConstant.DESTINATION_TYPE_SUB_REGION, 'Sub-Region');
		setDestinationSubRegionAutoComplete('minValConfigDestinationArea');
	}

	if(rateMasterConfiguration.DestinationBranchWiseRouteCharges) {
		createOption('minValConfigDestination', RateMasterConstant.DESTINATION_TYPE_BRANCH, 'Branch');
		setDestinationBranchAutoComplete('minValConfigDestinationBranch');
	}
	
	setArticleWiseWeightDiffDestBranchAutoComplete();
}

function setLRLevelDestination() {
	removeOption('lrLevelDestination', null);
	createOption('lrLevelDestination', 0, "-- Select Destination --");
	
	if(rateMasterConfiguration.DestinationRegionWiseRouteCharges) {
		createOption('lrLevelDestination', RateMasterConstant.DESTINATION_TYPE_REGION, 'Region');
		setDestinationRegionAutoComplete('lrLevelDestinationRegion');
	}
	
	if(rateMasterConfiguration.DestinationSubRegionWiseRouteCharges) {
		createOption('lrLevelDestination', RateMasterConstant.DESTINATION_TYPE_SUB_REGION, 'Sub-Region');
		setDestinationSubRegionAutoComplete('lrLevelDestinationArea');
	}
	
	if(rateMasterConfiguration.DestinationBranchWiseRouteCharges) {
		createOption('lrLevelDestination', RateMasterConstant.DESTINATION_TYPE_BRANCH, 'Branch');
		setDestinationBranchAutoComplete('lrLevelDestinationBranch');
	}
}

function setIncreaseDecreseDestination() {
	removeOption('incDecDestination', null);
	createOption('incDecDestination', 0, "-- Select Destination --");
	
	createOption('incDecDestination', RateMasterConstant.DESTINATION_TYPE_REGION, 'Region');
	createOption('incDecDestination', RateMasterConstant.DESTINATION_TYPE_SUB_REGION, 'Sub-Region');
	createOption('incDecDestination', RateMasterConstant.DESTINATION_TYPE_BRANCH, 'Branch');
	
	setDestinationBranchAutoComplete('incDecDestinationBranch');
	setDestinationSubRegionAutoComplete('incDecDestinationArea');
	setDestinationRegionAutoComplete('incDecDestinationRegion');
}

function setRouteWiseSlabConfigDestination() {
	removeOption('slabWiseRoutedestination', null);
	createOption('slabWiseRoutedestination', 0, "-- Select Destination --");
	
	if(rateMasterConfiguration.DestinationRegionWiseRouteCharges) {
		createOption('slabWiseRoutedestination', RateMasterConstant.DESTINATION_TYPE_REGION, 'Region');
		setDestinationRegionAutoComplete('slabwisedestinationRegion');
	}
	
	if(rateMasterConfiguration.DestinationSubRegionWiseRouteCharges) {
		createOption('slabWiseRoutedestination', RateMasterConstant.DESTINATION_TYPE_SUB_REGION, 'Sub-Region');
		setDestinationSubRegionAutoComplete('slabwisedestinationArea');
	}
	
	if(rateMasterConfiguration.DestinationBranchWiseRouteCharges) {
		createOption('slabWiseRoutedestination', RateMasterConstant.DESTINATION_TYPE_BRANCH, 'Branch');
		setDestinationBranchAutoComplete('slabWisedestinationBranch');
	}
}

function setSource() {
	removeOption('source', null);
	createOption('source', 0, "-- Select Destination --");

	if(rateMasterConfiguration.DestinationSubRegionSelectionForCopyRate)
		createOption('source', RateMasterConstant.SOURCE_TYPE_SUB_REGION, 'Sub-Region');

	if(rateMasterConfiguration.DestinationBranchWiseRouteCharges)
		createOption('source', RateMasterConstant.SOURCE_TYPE_BRANCH, 'Branch');
		
	createOption('source', SOURCE_TYPE_TO_PARTY, 'Party');
}

function setVehicleType() {
	removeOption('vehicleType',null);

	let vehicleType = jsondata.vehicleType;

	createOption('vehicleType',0, '--Truck Type--');

	if(!jQuery.isEmptyObject(vehicleType)) {
		for(const element of vehicleType) {
			createOption('vehicleType', element.vehicleTypeId, element.name);
		}
	}
}

function changeOnCategoryType() {
	if ($('#categoryType').val() == CATEGORY_TYPE_GENERAL_ID) {
		$('#sourcePanel').show();
		$('#partyPanel').hide();
		$('#billPanel').removeClass('hide');
		$('#partyGSTNPanel').hide();
		$('#specificPartyGSTNPanel').hide();
		$('#partySelectionOnGSTN').hide();
		
		if (rateMasterConfiguration.showPartyCommissionButton)
			$('#partyComm').hide();
		
		if(rateMasterConfiguration.showRouteWiseDateSelectionForParty)
			$('#dateSelectionDiv').addClass('hide');
		
		if (rateMasterConfiguration.isGroupLevelFixedHamaliRateForParty)
			 $("#groupLevelFixedHamaliDiv").hide();
	} else if ($('#categoryType').val() == CATEGORY_TYPE_PARTY_ID) {
		$('#sourcePanel').show();

		if(rateMasterConfiguration.showSearchByGstnCheckBox)
			$('#specificPartyGSTNPanel').show();
		
		$('#partyGSTNPanel').hide();
		$('#partySelectionOnGSTN').hide();
		
		$('#partyPanel').show();
		$('#billPanel').removeClass('hide');
		
		if (rateMasterConfiguration.showPartyCommissionButton)
			$('#partyComm').show();
		
		if(rateMasterConfiguration.showRouteWiseDateSelectionForParty)
			$('#dateSelectionDiv').removeClass('hide');
		
		if (rateMasterConfiguration.isGroupLevelFixedHamaliRateForParty)
			 $("#groupLevelFixedHamaliDiv").show();
	} else {
		$('#sourcePanel').hide();
		$('#partyPanel').hide();
		$('#specificPartyGSTNPanel').hide();
		$('#partyGSTNPanel').hide();
		$('#partySelectionOnGSTN').hide();
		$('#partyComm').hide();
		$('#billPanel').addClass('hide');
	
		if(rateMasterConfiguration.showRouteWiseDateSelectionForParty)
			$('#dateSelectionDiv').addClass('hide');

		$("#groupLevelFixedHamaliDiv").hide();
	}

	$('#branchName').val("");
	$('#partyName').val("");
	$('#partyGSTN').val("");
	$('#cityName').val("");
	$('#regionName').val("");
	$('#branchId').val(0);
	$('#partyId').val(0);
	$('#cityId').val(0);
	$('#regionId').val(0);
	$('#billSelection').val(0);
	$('#specificPartyGSTN').prop("checked", false);
	destroyMultiselectPartySelect();
	removeOption('partySelectOnGSTN',null);
}

function changeOnDestinationBranch() {
	if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		$('#destinationTypeComboPanel').prop('colspan', '0');
		$('#destinationBranchPanel').show();
		$('#deleteSelection').show();
		$('#destinationAreaPanel').hide();
		$('#destinationRegionPanel').hide();
	} else if($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
		$('#destinationTypeComboPanel').prop('colspan', '0');
		$('#destinationRegionPanel').show();
		$('#deleteSelection').show();
		$('#destinationAreaPanel').hide();
		$('#destinationBranchPanel').hide();
	} else if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
		$('#destinationTypeComboPanel').prop('colspan', '0');
		$('#destinationAreaPanel').show();
		$('#deleteSelection').show();
		$('#destinationBranchPanel').hide();
		$('#destinationRegionPanel').hide();
	} else {
		$('#destinationBranchPanel').hide();
		$('#destinationAreaPanel').hide();
		$('#destinationRegionPanel').hide();
		$('#deleteSelection').hide();
		$('#destinationTypeComboPanel').prop('colspan', '7');
	}

	$('#multiIdlist').empty();
	$('#destinationBranch').val("");
	$('#destinationArea').val("");
	$('#destinationRegion').val("");
}

function changeOnMinValConfigDestinationBranch() {
	if ($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		$('#minValConfigDestinationComboPanel').prop('colspan', '0');
		$('#minValConfigDestinationBranchPanel').show();
		$('#minValConfigDeleteSelection').show();
		$('#minValConfigDestinationAreaPanel').hide();
		$('#minValConfigDestinationRegionPanel').hide();
	} else if($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
		$('#minValConfigDestinationComboPanel').prop('colspan', '0');
		$('#minValConfigDestinationRegionPanel').show();
		$('#minValConfigDeleteSelection').show();
		$('#minValConfigDestinationAreaPanel').hide();
		$('#minValConfigDestinationBranchPanel').hide();
	} else if ($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
		$('#minValConfigDestinationComboPanel').prop('colspan', '0');
		$('#minValConfigDestinationAreaPanel').show();
		$('#minValConfigDeleteSelection').show();
		$('#minValConfigDestinationBranchPanel').hide();
		$('#minValConfigDestinationRegionPanel').hide();
	} else {
		$('#minValConfigDestinationBranchPanel').hide();
		$('#minValConfigDestinationAreaPanel').hide();
		$('#minValConfigDestinationRegionPanel').hide();
		$('#minValConfigDeleteSelection').hide();
		$('#minValConfigDestinationComboPanel').prop('colspan', '7');
	}

	$('#minValConfigMultiIdlist').empty();
	$('#minValConfigDestinationBranch').val("");
	$('#minValConfigDestinationArea').val("");
	$('#minValConfigDestinationRegion').val("");
}

function changeOnLRLevelDestinationBranch() {
	if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#lrLevelDestinationBranchPanel').show();
		$('#lrLevelDeleteSelection').show();
		$('#lrLevelDestinationAreaPanel').hide();
		$('#lrLevelDestinationRegionPanel').hide();
	} else if($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#lrLevelDestinationRegionPanel').show();
		$('#lrLevelDeleteSelection').show();
		$('#lrLevelDestinationAreaPanel').hide();
		$('#lrLevelDestinationBranchPanel').hide();
	} else if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#lrLevelDestinationAreaPanel').show();
		$('#lrLevelDeleteSelection').show();
		$('#lrLevelDestinationBranchPanel').hide();
		$('#lrLevelDestinationRegionPanel').hide();
	} else {
		$('#lrLevelDestinationBranchPanel').hide();
		$('#lrLevelDestinationAreaPanel').hide();
		$('#lrLevelDestinationRegionPanel').hide();
		$('#lrLevelDeleteSelection').hide();
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '7');
	}
	
	$('#lrLevelMultiIdlist').empty();
	$('#lrLevelDestinationBranch').val("");
	$('#lrLevelDestinationArea').val("");
	$('#lrLevelDestinationRegion').val("");
}

function changeOnIncDecDestinationBranch() {
	if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#incDecDestinationBranchPanel').show();
		$('#incDecDeleteSelection').show();
		$('#incDecDestinationAreaPanel').hide();
		$('#incDecDestinationRegionPanel').hide();
	} else if($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#incDecDestinationRegionPanel').show();
		$('#incDecDeleteSelection').show();
		$('#incDecDestinationAreaPanel').hide();
		$('#incDecDestinationBranchPanel').hide();
	} else if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '0');
		$('#incDecDestinationAreaPanel').show();
		$('#incDecDeleteSelection').show();
		$('#incDecDestinationBranchPanel').hide();
		$('#incDecDestinationRegionPanel').hide();
	} else {
		$('#incDecDestinationBranchPanel').hide();
		$('#incDecDestinationAreaPanel').hide();
		$('#incDecDestinationRegionPanel').hide();
		$('#incDecDeleteSelection').hide();
		$('#lrLevelDestinationTypeComboPanel').prop('colspan', '7');
	}
	
	$('#incDecMultiIdlist').empty();
	$('#incDecDestinationBranch').val("");
	$('#incDecDestinationArea').val("");
	$('#incDecDestinationRegion').val("");
}


function changeOnSlabWiseDestinationBranch() {
	if ($('#slabWiseRoutedestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		$('#slabwisedestinationTypeComboPanel').prop('colspan', '0');
		$('#slabwisedestinationBranchPanel').show();
		$('#slabwisedeleteSelection').show();
		$('#slabwisedestinationAreaPanel').hide();
		$('#slabwisedestinationRegionPanel').hide();
	} else if($('#slabWiseRoutedestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
		$('#slabwisedestinationTypeComboPanel').prop('colspan', '0');
		$('#slabwisedestinationRegionPanel').show();
		$('#slabwisedeleteSelection').show();
		$('#slabwisedestinationAreaPanel').hide();
		$('#slabwisedestinationBranchPanel').hide();
	} else if ($('#slabWiseRoutedestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
		$('#slabwisedestinationTypeComboPanel').prop('colspan', '0');
		$('#slabwisedestinationAreaPanel').show();
		$('#slabwisedeleteSelection').show();
		$('#slabwisedestinationBranchPanel').hide();
		$('#slabwisedestinationRegionPanel').hide();
	} else {
		$('#slabwisedestinationBranchPanel').hide();
		$('#slabwisedestinationAreaPanel').hide();
		$('#slabwisedestinationRegionPanel').hide();
		$('#slabwisedeleteSelection').hide();
		$('#slabwisedestinationTypeComboPanel').prop('colspan', '7');
	}
	
	$('#slabWiseDestMultiIdlist').empty();
	$('#slabWisedestinationBranch').val("");
	$('#slabwisedestinationArea').val("");
	$('#slabwisedestinationRegion').val("");
}

function changeOnSourceType() {
	if ($('#source').val() == RateMasterConstant.SOURCE_TYPE_BRANCH) {
		$('#sourceTypeComboPanel').prop('colspan', '0');
		$('#sourceBranchPanel').show();
		$('#deleteSourceSelection').show();
		$('#sourceAreaPanel').hide();
		$('#sourceRegionPanel').hide();
		$('#toPartyPanel').hide();
	} else if($('#source').val() == RateMasterConstant.SOURCE_TYPE_REGION) {
		$('#sourceTypeComboPanel').prop('colspan', '0');
		$('#sourceRegionPanel').show();
		$('#deleteSourceSelection').show();
		$('#sourceAreaPanel').hide();
		$('#sourceBranchPanel').hide();
		$('#toPartyPanel').hide();
	} else if ($('#source').val() == RateMasterConstant.SOURCE_TYPE_SUB_REGION) {
		$('#sourceTypeComboPanel').prop('colspan', '0');
		$('#sourceAreaPanel').show();
		$('#deleteSourceSelection').show();
		$('#sourceBranchPanel').hide();
		$('#sourceRegionPanel').hide();
		$('#toPartyPanel').hide();
	} else if ($('#source').val() == SOURCE_TYPE_TO_PARTY) {
		$('#sourceTypeComboPanel').prop('colspan', '0');
		$('#sourceBranchPanel').show();
		$('#toPartyPanel').show();
		$('#deleteSourceSelection').show();
		$('#sourceRegionPanel').hide();
	} else {
		$('#sourceBranchPanel').hide();
		$('#sourceAreaPanel').hide();
		$('#sourceRegionPanel').hide();
		$('#deleteSourceSelection').hide();
		$('#toPartyPanel').hide();
		$('#sourceTypeComboPanel').prop('colspan', '7');
	}

	$('#sourceMultiIdlist').empty();
	$('#sourceBranch').val("");
	$('#sourceArea').val("");
	$('#sourceRegion').val("");
	$('#toParty').val("");
}

function changeOnBookingType() {
	if($('#bookingType').val() == BOOKING_TYPE_FTL_ID && rateMasterConfiguration.ShowVehicleType) {
		$('#vehicleTypeCol').removeClass('hide');
	} else {
		$('#vehicleTypeCol').addClass('hide');
		$('#vehicleType').val(0);
	}
}

//apply rates for selected branch or party
function applyRates() {

	resetAllConfigurationCharges();

	let chargeIds = new Array();

	if (chargesConfigRates != null) {
		// set charges form db
		for (const element of chargesConfigRates) {
			let chargeId	= element.chargeTypeMasterId;

			if(jQuery.inArray(chargeId, lrLevelCharges) != -1
				&& element.applicableOnCatetgoryId != ChargeConfigurationConstant.APPLICABLE_ON_CATEGORY_ID_FIELD)
					$('#charge' + chargeId).val(element.chargeMinAmount);

			$('#applicableCharge' + chargeId).prop("checked", element.applicable);
			$('#isGroupLevel_' + chargeId).prop("checked", element.isGroupLevel);
			$('#isEditable_' + chargeId).prop("checked", element.editable);

			if (chargeId == $('#chargesDropDown1').val()) {
				$('#editable').prop("checked", element.editable);

				if (element.editAmountType == ChargeConfigurationConstant.EDIT_AMOUNT_TYPE_SIMPLE)
					$('#editAmountTypePercent').prop("checked", false);
				else if (element.editAmountType == ChargeConfigurationConstant.EDIT_AMOUNT_TYPE_PERCENTAGE)
					$('#editAmountTypePercent').prop("checked", true);

				$('#maxEditValue').val(element.editMaxValue);
				$('#editableMinVal').val(element.editMinAmount);
				$('#editableMaxVal').val(element.editMaxAmount);
			}
			
			chargeIds.push(chargeId);
		}
	}
	// set default charges if not found in db

	for (const element of charges) {
		let chargeId	= element.chargeTypeMasterId;

		if(jQuery.inArray(chargeId, chargeIds) == -1) {
			$('#applicableCharge' + chargeId).prop("checked", true);

			if (chargeId == $('#chargesDropDown1').val())
				$('#editable').prop("checked", true);
		}
	}

	selectChargeApplicableAllCheckBox();
}

//Check box creation code when selecting route wise charges destination
function createCheckBoxInMutliIdList(id, name) {
	let rowscounts = $("#multiIdlist").find('tr').length;
	let columnscounts = 0;

	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#multiIdlist").find('tr:last')[0].cells.length;

	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');

	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');

	inputAttr1.id			= 'checkboxRoute' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'multiIdCheckBox';
	inputAttr1.onclick		= 'checkAllCheckBox();';
	inputAttr1.value		= id;

	createInput(tableCol,inputAttr1);

	if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		name = name.substring(0,name.indexOf('(')-1);
	}

	$(tableCol).append(name);
	$('#multiIdlist').append(tableRow);
}

//Check box creation code when selecting route wise charges destination
function createCheckBoxInMinValConfigMultiIdlist(id, name) {
	let rowscounts = $("#minValConfigMultiIdlist").find('tr').length;

	let columnscounts = 0;

	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#minValConfigMultiIdlist").find('tr:last')[0].cells.length;

	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');

	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');

	inputAttr1.id			= 'checkboxMinValConfig' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'minValConfigMultiIdCheckBox';
	inputAttr1.onclick		= 'checkAllMinValCongiCheckBox();';
	inputAttr1.value		= id;

	createInput(tableCol,inputAttr1);

	if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
		name = name.substring(0,name.indexOf('(')-1);
	}

	$(tableCol).append(name);
	$('#minValConfigMultiIdlist').append(tableRow);
}

//Check box creation code when selecting route wise charges destination
function createCheckBoxInLRLevelMultiIdlist(id, name) {
	let rowscounts = $("#lrLevelMultiIdlist").find('tr').length;
	let columnscounts = 0;
	
	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#lrLevelMultiIdlist").find('tr:last')[0].cells.length;
	
	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');
	
	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');
	
	inputAttr1.id			= 'checkbox' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'lrLevelMultiIdCheckBox';
	inputAttr1.onclick		= 'checkAllLRLevelCheckBox();';
	inputAttr1.value		= id;
	
	createInput(tableCol,inputAttr1);
	
	if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH)
		name = name.substring(0,name.indexOf('(')-1);
	
	$(tableCol).append(name);
	$('#lrLevelMultiIdlist').append(tableRow);
}

//Check box creation code when selecting route wise charges destination
function createCheckBoxInIncreseDecreseMultiIdlist(id, name) {
	let rowscounts = $("#incDecMultiIdlist").find('tr').length;
	let columnscounts = 0;
	
	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#incDecMultiIdlist").find('tr:last')[0].cells.length;
	
	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');
	
	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');
	
	inputAttr1.id			= 'incDecCheckbox' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'incDecMultiIdCheckBox';
	inputAttr1.onclick		= 'checkAllIncDecCheckBox();';
	inputAttr1.value		= id;
	
	createInput(tableCol,inputAttr1);
	
	if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH)
		name = name.substring(0,name.indexOf('(')-1);
	
	$(tableCol).append(name);
	$('#incDecMultiIdlist').append(tableRow);
}

function createCheckBoxInSlabWiseMultiIdlist(id, name) {
	let rowscounts = $("#slabWiseDestMultiIdlist").find('tr').length;
	let columnscounts = 0;
	
	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#slabWiseDestMultiIdlist").find('tr:last')[0].cells.length;
	
	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');
	
	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');
	
	inputAttr1.id			= 'slabWiseDestCheckbox' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'slabWiseDestMultiIdCheckBox';
	inputAttr1.onclick		= 'checkAllSlabWiseDecCheckBox();';
	inputAttr1.value		= id;
	
	createInput(tableCol,inputAttr1);
	
	if ($('#slabWiseRoutedestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH)
		name = name.substring(0,name.indexOf('(')-1);
	
	$(tableCol).append(name);
	$('#slabWiseDestMultiIdlist').append(tableRow);
}

//Check box creation code when selecting route wise charges destination
function createSourceCheckBoxInMutliIdList(id, name) {
	let rowscounts = $("#sourceMultiIdlist").find('tr').length;
		
	if (rowscounts > 0 && $('#source').val() == SOURCE_TYPE_TO_PARTY) {
		showMessage('warning', 'You cannot add Branch More than one!');
		return; 
	} else 	if (rowscounts > 2 && $('#source').val() == RateMasterConstant.SOURCE_TYPE_BRANCH) {
		showMessage('warning', 'You cannot add Branch More than 3!');
		return; 
	}

	let columnscounts = 0;

	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#sourceMultiIdlist").find('tr:last')[0].cells.length;

	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');

	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');

	inputAttr1.id			= 'checkbox' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'sourceMultiIdCheckBox';
	inputAttr1.value		= id;

	createInput(tableCol,inputAttr1);

	if ($('#source').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH)
		name = name.substring(0,name.indexOf('(')-1);

	$(tableCol).append(name);
	$('#sourceMultiIdlist').append(tableRow);
}


function createPartyIdCheckBoxInMutliIdList(id, name) {
	let rowscounts = $("#multiPartyIdlist").find('td').length;
	
	let columnscounts = 0;
	
	if (rowscounts == 5) {
		showMessage('warning', 'You cannot add More than 5 parties!');
		return; 
	}
		
	if (rowscounts == 0)
		tableRow		= createRow('tr_'+id,'');
	else
		columnscounts = $("#multiPartyIdlist").find('tr:last')[0].cells.length;

	if (columnscounts % checkboxcount == 0)
		tableRow		= createRow('tr_'+id,'');

	let inputAttr1		= new Object();
	let tableCol		= createColumn(tableRow,'td_' + id,'20%','','','');

	inputAttr1.id			= 'checkbox' + id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'multiPartyIdCheckBox';
	inputAttr1.value		= id;

	createInput(tableCol,inputAttr1);

	if ($('#source').val() == SOURCE_TYPE_TO_PARTY)
		name = name.substring(0,name.indexOf('(')-1);

	$(tableCol).append(name);
	$('#multiPartyIdlist').append(tableRow);
}

//Select all checkboxes
function selectAllCheckbox(flag) {
	$("input[name='multiIdCheckBox']").prop("checked" , flag);
}

//Select all checkboxes
function lrLevelSelectAllCheckbox(flag) {
	$("input[name='lrLevelMultiIdCheckBox']").prop("checked" , flag);
}

//Select all checkboxes
function selectAllSourceCheckbox(flag) {
	$("input[name='sourceMultiIdCheckBox']").prop("checked" , flag);
	$("input[name='multiPartyIdCheckBox']").prop("checked" , flag);
}

//Select all checkboxes
function minValConfigSelectAllCheckbox(flag) {
	$("input[name='minValConfigMultiIdCheckBox']").prop("checked" , flag);
}

function selectChargeApplicableAllCheckBox(){
	let	checkAllCheckBoxChecked = true;
	
	if ($("#selectAllChargeApplicableChargeId").length > 0) {
		$('#chargesApplicable').find('input[type="checkbox"]').not('#selectAllChargeApplicableChargeId').each(function () {
			if(!this.checked){
				checkAllCheckBoxChecked = false; 
			}
		});
		
		$('#selectAllChargeApplicableChargeId').prop('checked', checkAllCheckBoxChecked); 
	}
}

//Select all charge applicable charges checkbox
function selectAllChargeApplicableChargesCheckbox(obj) {
	if(!validateMainSection(0)) {
		obj.checked	= !obj.checked;
		return false;
	}
	
	$("input[name='ChargesApplicableCB']").prop("checked" , obj.checked);
}

function saveAllChargeApplicabeCharges() {
	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			let jsonObjectdata  = null; 
			let jsonObjectArray = [];

			if ($("#selectAllChargeApplicableChargeId").length > 0) {
				$('#chargesApplicable').find('input[type="checkbox"]').not('#selectAllChargeApplicableChargeId').each(function () {
					jsonObjectdata 				= new Object();

					jsonObjectdata.sourceBranchId		= $('#branchId').val();
					jsonObjectdata.corporateAccountId	= $('#partyId').val();

					jsonObjectdata.isApplicable			= this.checked;
					jsonObjectdata.chargeTypeMasterId 	= this.value;
					
					jsonObjectArray.push(jsonObjectdata);
				});
			}
			jsonObject.chargeWiseDataObject = JSON.stringify(jsonObjectArray);;
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertUpdateChargeApplicable.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						getChargesConfigRates();
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});

}

//Check and uncheck checkboxs select all functionaly
function checkAllCheckBox() {
	if ($("input[name='multiIdCheckBox']").length == $("input[name='multiIdCheckBox']:checked").length) {
		$("#selectAllMultiId").prop("checked", true);
	} else {
		$("#selectAllMultiId").prop("checked", false);
	}
}

//Check and uncheck checkboxs select all functionaly
function checkAllLRLevelCheckBox() {
	$("#lrLevelSelectAllMultiId").prop("checked", $("input[name='lrLevelMultiIdCheckBox']").length == $("input[name='lrLevelMultiIdCheckBox']:checked").length);
}

//Check and uncheck checkboxs select all functionaly
function checkAllMinValCongiCheckBox() {
	$("#minValConfigSelectAllMultiId").prop("checked", $("input[name='minValConfigMultiIdCheckBox']").length == $("input[name='minValConfigMultiIdCheckBox']:checked").length);
}

function checkAllSourceCheckBox() {
	let allBranchIds = [];

		$("input[name='sourceMultiIdCheckBox']").each(function() {
			allBranchIds.push($(this).val());
		});
		
	return allBranchIds;
}
function checkAllPartyIdCheckBox() {
	let allPartyIds = new Array();

	$("input[name='multiPartyIdCheckBox']").each(function() {
		allPartyIds.push($(this).val());
	});
	
	return allPartyIds;
}
//delete checkbox
function deleteMultiIdList() {
	if ($("#selectAllMultiId").prop("checked"))
		$('#multiIdlist').empty();
	else
		$("input[name='multiIdCheckBox']:checked").closest("td").remove(); // closest function find closest tag of given id. 
}

//delete checkbox
function lrLevelDeleteMultiIdList() {
	if ($("#lrLevelSelectAllMultiId").prop("checked"))
		$('#lrLevelMultiIdlist').empty();
	else
		$("input[name='lrLevelMultiIdCheckBox']:checked").closest("td").remove(); // closest function find closest tag of given id. 
}

function minValConfigDeleteMultiIdList() {
	if ($("#minValConfigSelectAllMultiId").prop("checked"))
		$('#minValConfigMultiIdlist').empty();
	else
		$("input[name='minValConfigMultiIdCheckBox']:checked").closest("td").remove(); // closest function find closest tag of given id. 
}

//delete checkbox
function deleteSourceMultiIdList() {		
	if ($("#selectAllSourceMultiId").prop("checked")) {
		$('#sourceMultiIdlist').empty();
		$('#multiPartyIdlist').empty();
	} else {
		$("input[name='multiPartyIdCheckBox']:checked").each(function() {
			let td = $(this).closest("td");
			let tr = td.closest("tr");
			td.remove();

			if (tr.find("td").length === 0) {
				tr.remove();
			}
		});
		$("input[name='sourceMultiIdCheckBox']:checked").closest("td").remove();
	} 
}

//delete checkbox
function incDecDeleteMultiIdList() {
	if ($("#selectIncDecAllMultiId").prop("checked"))
		$('#incDecMultiIdlist').empty();
	else
		$("input[name='incDecMultiIdCheckBox']:checked").closest("td").remove(); // closest function find closest tag of given id. 
}

//reset full page to default
function resetAllConfigurationCharges() {
	$("input[name='rateConfigured']:checkbox").prop('checked', typeof partyRouteWiseCharge != 'undefined' && partyRouteWiseCharge != null && partyRouteWiseCharge.length > 0);
	$("input[name='percent']:checkbox").prop('checked', false);
	$("input[name='ChargesApplicableCB']:checkbox").prop('checked', false);
	$("#ratePanels input[type=text]").val("");
	$("#maxEditValue").val(0);
	$("#editableMinVal").val(0);
	$("#editableMaxVal").val(0);
	$("#routeAmount").val(0);

	for (const element of charges) {
		if(jQuery.inArray(element.chargeTypeMasterId, lrLevelCharges) != -1)
			$('#charge'+element.chargeTypeMasterId).val(0);
	}
}

//main section barnch autocomplete
function setCityAutoComplete() {
	$("#cityName").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getCityNameAutocomplete.do?term=' + request.term+'&isShowActiveBranchCities=true', function (data) {
				if(data && data.cityForGroup) {
					response($.map(data.cityForGroup, function (item) {
						return {
							label			: item.cityName,
							value			: item.cityName,
							id				: item.cityId,
						};
		        	}));
		       	}
			});
		}, select: function (e, u) {
		   	$('#cityId').val(u.item.id);
		   	getChargesConfigRates(); //defined in lrlevelsectionCharges.js
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setDestinationCityAutoComplete(id) {
	$("#" + id).autocomplete({
		 source: function (request, response) {
			   $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getCityNameAutocomplete.do?term=' + request.term+'&isShowActiveBranchCities=true', function (data) {
		          if(data && data.cityForGroup) {
		           response($.map(data.cityForGroup, function (item) {
		               return {
		                   label			: item.cityName,
		                   value			: item.cityName,
		                   id				: item.cityId,
		                };
		            }));
		           }
		        });
		}, select: function (e, u) {
		   	$('#destinationCityId').val(u.item.id);
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

//main section barnch autocomplete
function setBranchAutoComplete() {
	$("#branchName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+BranchLocationTypeConstant.PHYSICAL+"&showPhysicalOrOperationalBothBranch="+rateMasterConfiguration.showPhysicalOrOperationalBothBranch,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getDestination(ui.item.id);
				getMinimumPartyRates();
				setSlabs((ui.item.id).split("_")[0], 1);
				
				if(rateMasterConfiguration.SlabWeightPanel)
					setSlabWeightDropDown();
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//route wise barnch autocomplete
function setDestinationBranchAutoComplete(id) {
	$("#" + id).autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=3&deliveryDestinationBy="+rateMasterConfiguration.DeliveryDestinationBy+"&branchNetworkConfiguration=false&locationId="+executive.branchId,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				if(id == 'destinationBranch')
					getDestinationBranchForRoute(ui.item.id, ui.item.label);
				else if(id == 'lrLevelDestinationBranch')
					getDestinationBranchForLRLevel(ui.item.id, ui.item.label);
				else if(id == 'incDecDestinationBranch')
					getDestinationBranchForIncreseDecreaseRate(ui.item.id, ui.item.label);
				else if(id == 'slabWisedestinationBranch')
					getSlabWiseRouteDestinationBranchForIncreseDecreaseRate(ui.item.id, ui.item.label);
				else if(id == 'minValConfigDestinationBranch')
					getDestinationBranchForMinValConfig(ui.item.id, ui.item.label);
			}
			
			$("#" + id).val("");
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		},
		close: function( event, ui ) {
			$("#" + id).val("");
		}
	});
}

function setRegionAutoComplete() {
	$("#regionName").autocomplete({
		 source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getRegionAutocomplete.do?term=' + request.term, function (data) {
				if(data && data.regionList) {
		           response($.map(data.regionList, function (item) {
		               return {
		                   label			: item.regionName,
		                   value			: item.regionName,
		                   id				: item.regionId,
		                };
		            }));
		       		}
		        });
		}, select: function (e, u) {
		   	$('#regionId').val(u.item.id);
		   	getChargesConfigRates(); //defined in lrlevelsectionCharges.js
		   	setSlabs(u.item.id, 3);
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setDestinationSubRegionAutoComplete(id) {
	$("#" + id).autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getSubRegionAutocomplete.do?term=' + request.term, function (data) {
				if(data && data.result) {
					response($.map(data.result, function (item) {
						return {
							label			: item.subRegionName,
							value			: item.subRegionName,
							id				: item.subRegionId,
						};
					}));
		 		}
			});
		}, select: function (e, ui) {
			if(!isRegionWiseRates && id == 'destinationArea')
				getDestinationAreaForRoute(ui.item.id, ui.item.label);
			else if(id == 'lrLevelDestinationArea')
				getDestinationAreaForLRLevel(ui.item.id, ui.item.label);
			else if(id == 'incDecDestinationArea')
				getDestinationAreaForIncreaseDecreaseRate(ui.item.id, ui.item.label);
			else if(id == 'slabwisedestinationArea')
				getDestinationAreaForSlabWiseRouteRate(ui.item.id, ui.item.label);
			else if(id == 'sourceArea')
				getSourceAreaForRoute(ui.item.id, ui.item.label);
			else if(id == 'minValConfigDestinationArea')
				getDestinationAreaForMinValConfig(ui.item.id, ui.item.label);
			else
				$('#destinationRegionId').val(ui.item.id);
		}, close: function (e, u) {
			$("#" + id).val('');
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setDestinationRegionAutoComplete(id) {
	$("#" + id).autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getRegionAutocomplete.do?term=' + request.term, function (data) {
				if(data && data.regionList) {
					response($.map(data.regionList, function (item) {
						return {
							label			: item.regionName,
							value			: item.regionName,
							id				: item.regionId,
						};
					}));
					}
				});
		}, select: function (e, ui) {
			if(!isRegionWiseRates && id == 'destinationRegion')
				getDestinationRegionForRoute(ui.item.id, ui.item.label);
			else if(id == 'lrLevelDestinationRegion')
				getDestinationRegionForLRLevel(ui.item.id, ui.item.label);
			else if(id == 'incDecDestinationRegion')
				getDestinationRegionForIncreaseDecreaseRate(ui.item.id, ui.item.label);
			else if(id == 'slabwisedestinationRegion')
				getDestinationRegionForSlabWiseRouteRate(ui.item.id, ui.item.label);
			else if(id == 'sourceRegion')
				getSourceRegionForRoute(ui.item.id, ui.item.label);
			else if(id == 'minValConfigDestinationRegion')
				getDestinationRegionForMinValConfig(ui.item.id, ui.item.label);
			else
				$('#destinationRegionId').val(ui.item.id);
		}, close: function (e, u) {
			$("#" + id).val('');
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setDestinationToPartyAutoComplete() {
	$("#toParty").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyAutoCompleteWithNameAndGST="+partyAutoCompleteWithNameAndGST,
		minLength: 5,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getToPartyList(ui.item.id, ui.item.label);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		},
		close: function( event, ui ) {
			$("#toParty").val("");
		}
	});
}

//Copy Charges barnch autocomplete
function setSourceBranchAutoComplete() {
	$("#sourceBranch").autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=3",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0){
				getSourceBranchForRoute(ui.item.id, ui.item.label);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		},
		close: function( event, ui ) {
			$("#sourceBranch").val("");
		}
	});
}

function setArticleWiseWeightDiffDestBranchAutoComplete() {
	$("#destBranch").autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=3&deliveryDestinationBy="+rateMasterConfiguration.DeliveryDestinationBy+"&branchNetworkConfiguration=false&locationId="+executive.branchId,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				let destBranchArr = ui.item.id.split("_");
				
				if(destBranchArr != null) {
					$('#destBranchId').val(destBranchArr[0]);
				}
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//main section party autocomplete
function setPartyAutoComplete() {
	$("#partyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyAutoCompleteWithNameAndGST="+partyAutoCompleteWithNameAndGST,
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#partyId').val(ui.item.id);
				getChargesConfigRates();
				getMinimumPartyRates();
				setSlabs(ui.item.id, 2);
				getPartyDetails(ui.item.id);
				
				if(rateMasterConfiguration.SlabWeightPanel)
					setSlabWeightDropDown();
				
				if(rateMasterConfiguration.showRateConfigurationPanel)
					getRouteWiseRateConfigured(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//main section party autocomplete
function setConsigneePartyAutoComplete() {
	$("#consigneePartyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0)
				$('#consigneePartyId').val(ui.item.id);
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setSaidToContainAutoComplete() {
	$("#saidToContain").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=12",
		minLength: 2,
		delay: 250,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#consignmentGoodsId").val((ui.item.id).split("_")[0]);
			} else {
				$("#consignmentGoodsId").val(0);
			}
		}, open: function(){
			$('.ui-autocomplete').css('width', '250px'); // HERE
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}

//set branch and city id from auto complete. work on onselect of autocomplete
function getDestination(branchId_CityId) {
	let destData = branchId_CityId.split("_");
	$('#branchId').val(parseInt(destData[0]));

	getChargesConfigRates(); //defined in lrlevelsectionCharges.js
}

//check if branch rate exist or not and add check box with area name and id. work on onselect of autocomplete
function getDestinationBranchForRoute(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");
	let branchId = parseInt(destData[0]);
	
	if($("#checkboxRoute" + branchId).length == 0) {
		createCheckBoxInMutliIdList(branchId, branchName);
	} else {
		setValueToTextField('destinationBranch', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

function getDestinationBranchForLRLevel(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");
	
	let branchId 	= parseInt(destData[0]);
	
	if($("#checkbox" + branchId).length == 0) {
		createCheckBoxInLRLevelMultiIdlist(branchId, branchName);
	} else {
		setValueToTextField('lrLevelDestinationBranch', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

function getDestinationBranchForMinValConfig(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");	
	let branchId 	= parseInt(destData[0]);
	
	if($("#checkboxMinValConfig" + branchId).length == 0) {
		createCheckBoxInMinValConfigMultiIdlist(branchId, branchName);
	} else {
		setValueToTextField('minValConfigDestinationBranch', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

function getDestinationBranchForIncreseDecreaseRate(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");
	
	let branchId 	= parseInt(destData[0]);
	
	if($("#incDecCheckbox" + branchId).length == 0) {
		createCheckBoxInIncreseDecreseMultiIdlist(branchId, branchName);
	} else {
		setValueToTextField('incDecDestinationBranch', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

function getSlabWiseRouteDestinationBranchForIncreseDecreaseRate(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");
	
	let branchId 	= parseInt(destData[0]);
	
	if($("#slabWiseDestCheckbox" + branchId).length == 0) {
		createCheckBoxInSlabWiseMultiIdlist(branchId, branchName);
	} else {
		setValueToTextField('slabWiseRoutedestination', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

function getToPartyList(partyId, partyName) {	
	if($("#checkbox" + partyId).length == 0)
		createPartyIdCheckBoxInMutliIdList(partyId, partyName);
	else {
		setValueToTextField('toParty', '');
		showMessage('warning', 'Party Already Added !');
		return true;
	}
}

//check if branch rate exist or not and add check box with area name and id. work on onselect of autocomplete
function getSourceBranchForRoute(branchId_CityId, branchName) {
	let destData = branchId_CityId.split("_");

	let branchId 	= parseInt(destData[0]);

	if($("#checkbox" + branchId).length == 0) {
		createSourceCheckBoxInMutliIdList(branchId, branchName);
	} else {
		setValueToTextField('sourceBranch', '');
		showMessage('warning', 'Branch Already Added !');
		return true;
	}
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationAreaForRoute(areaId, areaName) {
	if($("#checkboxRoute" + areaId).length == 0)
		createCheckBoxInMutliIdList(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationAreaForLRLevel(areaId, areaName) {
	if($("#checkbox" + areaId).length == 0)
		createCheckBoxInLRLevelMultiIdlist(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationAreaForMinValConfig(areaId, areaName) {
	if($("#checkboxMinValConfig" + areaId).length == 0)
		createCheckBoxInMinValConfigMultiIdlist(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationAreaForIncreaseDecreaseRate(areaId, areaName) {
	if($("#incDecCheckbox" + areaId).length == 0)
		createCheckBoxInIncreseDecreseMultiIdlist(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

function getDestinationAreaForSlabWiseRouteRate(areaId, areaName) {
	if($("#slabWiseDestCheckbox" + areaId).length == 0)
		createCheckBoxInSlabWiseMultiIdlist(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getSourceAreaForRoute(areaId, areaName) {
	if($("#checkbox" + areaId).length == 0)
		createSourceCheckBoxInMutliIdList(areaId, areaName);
	else
		showMessage('warning', 'Area Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationRegionForRoute(regionId, regionName) {
	if($("#checkboxRoute" + regionId).length == 0)
		createCheckBoxInMutliIdList(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

function getDestinationRegionForMinValConfig(regionId, regionName) {
	if($("#checkboxMinValConfig" + regionId).length == 0)
		createCheckBoxInMinValConfigMultiIdlist(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationRegionForLRLevel(regionId, regionName) {
	if($("#checkbox" + regionId).length == 0)
		createCheckBoxInLRLevelMultiIdlist(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getDestinationRegionForIncreaseDecreaseRate(regionId, regionName) {
	if($("#incDecCheckbox" + regionId).length == 0)
		createCheckBoxInIncreseDecreseMultiIdlist(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

function getDestinationRegionForSlabWiseRouteRate(regionId, regionName) {
	if($("#slabWiseDestCheckbox" + regionId).length == 0)
		createCheckBoxInSlabWiseMultiIdlist(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

//add check box with area name and id. work on onselect of autocomplete
function getSourceRegionForRoute(regionId, regionName) {
	if($("#checkbox" + regionId).length == 0)
		createSourceCheckBoxInMutliIdList(regionId, regionName);
	else
		showMessage('warning', 'Region Already Added !');
}

var jspanelforratesEdit	= null;
function createJsPanel(title) {
	let jspanelContent	= $('#jsPanelMainContent').html();

	jspanelforratesEdit = $.jsPanel({
		id: 'routewisejspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

var routewiseslabjspanelforratesEdit	= null;
function createRouteWiseJsPanel(title){
	let jspanelContent	= $('#jsPanelMainContentForRouteWiseSlabCharges').html();

	jspanelforratesEdit = $.jsPanel({
		id: 'routewiseslabjspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function setHtml(col, value) {
	if (value != null && value != 'null' && value != '')
		col.append(value);
	else
		col.append('--');
}

function updateRouteWiseSlabRate(obj) {
	let rmId		= obj.getAttribute('data-value');
	let rateValue	= $('#routewisejspanel #rate'+rmId).val();
	let extraAmtPerSqftrateValue	= $('#routewisejspanel #extraAmtPerSqftrate'+rmId).val();
	let increasedAmountPerKgValue	= $('#routewisejspanel #increasedAmountPerKg'+rmId).val();
	updateRouteWiseSlabMasterRate(rmId,rateValue,extraAmtPerSqftrateValue,increasedAmountPerKgValue);
	$('#routewisejspanel #rate'+rmId).prop('disabled', true);
	$('#routewisejspanel #extraAmtPerSqftrate'+rmId).prop('disabled', true);
	$('#routewisejspanel #increasedAmountPerKg'+rmId).prop('disabled', true);
	$('#routewisejspanel #edit'+rmId).show();
	$(obj).hide();
}


function deleteCftRate(obj){
	if (confirm("Rate Will be deleted do You want to continue ?")) {
		let rmId		= obj.getAttribute('data-value');
		deleteRateMasterRate(rmId, null);
		$(obj).closest("tr").remove(); // closest function find closest tag of given id.
	}
}

function deleteRouteWiseSlabRate(obj) {
	let rmId		= obj.getAttribute('data-value');

	deleteRouteWiseSlabRateMasterRate(rmId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

//create Datatable
function setDatatable(tableId) {
	let tabledata = $(tableId).DataTable( {

		"bPaginate": 	  false,
		"bInfo":     	  false,
		"bautoWidth":     true,
		"sDom": '<"top"l>rt<"bottom"ip><"clear">',
		"fnDrawCallback": function ( oSettings ) {

			//Need to redo the counters if filtered or sorted 
			if ( oSettings.bSorted || oSettings.bFiltered ) {
				for ( let i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
					$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
				}
			}
		},
		"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
		"aaSorting": [[ 1, 'asc' ]]
	});

	return tabledata;
}

function applySearchonDatatable(table, colIdx, searchId, searchFunction, toggalFilterId, toggelAllowed) {
	// Apply the search
	$( searchId, table.column( colIdx ).footer() ).on( searchFunction, function () {
		let valto	= this.value;
		table
		.column( colIdx )
		.search( valto, true, false, true)
		.draw();

		if (toggelAllowed)
			$(this).closest(toggalFilterId).toggle(); // closest function find closest tag of given id.			
	});
}

//Set Serach Items
function createCheckBoxForMultiSearchFilter(table, tableColumnToIterate, colIdx, appendTableId) {
	let srcBranchArr	= new Array();
	
	$(tableColumnToIterate).each(function () {
		if (srcBranchArr.indexOf($(this).html()) == -1) {
			srcBranchArr.push($(this).html());
			let row		= createRow("tr_", '');
			let col1	= createColumn(row, "td_", '200px', 'left', '', '2');
			let inputAttr1			= new Object();
			inputAttr1.id			= 'filter'+$(this).html();
			inputAttr1.type			= 'checkbox';
			inputAttr1.value		= $(this).html();
			inputAttr1.name			= 'filterCB';
			inputAttr1.onclick		= 'setFilter(this);';

			let input	= createInput(col1,inputAttr1);
			input.attr( {
				'data-columnIdx' : colIdx
			});
			$(col1).append("&emsp;" + $(this).html());
			$( appendTableId, table.column( colIdx ).footer() ).append(row);
		}
	});
}

function setFilterOnTop(dataId, headerId) {
	$(dataId).insertAfter($(headerId));
}

function setFilterOverlayPopupToggle(popurId) {
	$(popurId).click(function() {
		$(this).closest("th").find('#popup').toggle(); // closest function find closest tag of given id.
	});
}

function setDataTableToJsPanel() {
	let tableId	= '#routewisejspanel #ratesEditTable';
	setDatatable(tableId);
	// get DataTable Instance
	let table = $(tableId).DataTable();
	
	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#routewisejspanel #ratesEditTable #ratesEditTableTBody  td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#routewisejspanel #ratesEditTable #ratesEditTableTFoot .tfootClass', '#routewisejspanel #ratesEditTable #ratesEditTableTHead  tr');
	setFilterOverlayPopupToggle('#routewisejspanel  #toggle-popup');
}

function setRouteWiseSlabDataTableToJsPanel(){
	let tableId	= '#routewiseslabjspanel #routeWiseSlabRatesEditTable';
	setDatatable(tableId);
	// get DataTable Instance
	let table = $(tableId).DataTable();

	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#routewiseslabjspanel #routeWiseSlabRatesEditTable #routeWiseSlabEditTableTBody td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#routewiseslabjspanel #routeWiseSlabRatesEditTable #routeWiseSlabEditTableTFoot .tfootClass', '#routewiseslabjspanel #routeWiseSlabRatesEditTable #routeWiseSlabEditTableTHead tr');
	setFilterOverlayPopupToggle('#routewiseslabjspanel #toggle-popup');
}

//set Filter button
function setFilter(obj) {
	let btnVal = $(obj).closest("#popup").find('#setData').val(); // closest function find closest tag of given id.
	if(obj.checked) {
		if(btnVal == "")
			$(obj).closest("#popup").find('#setData').val(obj.value);
		else
			$(obj).closest("#popup").find('#setData').val(btnVal + '|' + obj.value);
	} else {
		if (btnVal.match(/\|/g) == null) {
			btnVal	= "";
		} else {
			if (btnVal.substr(0, btnVal.indexOf('|')) == obj.value)
				btnVal	= btnVal.replace(obj.value + '|', '');
			else
				btnVal	= btnVal.replace('|' + obj.value, '');
		}
		
		$(obj).closest("#popup").find('#setData').val(btnVal);
	}
}

function setChargesApplicableDropDown(obj){
	removeOption(obj.id,null);
	createOption(obj.id, 0, "-- Select Charges --");

	for (const element of charges) {
		createOption(obj.id, element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
	}
}

function populateNextDropDown(obj, select_id){
	for(let i = select_id.options.length - 1; i >= 0; i--) {
		if(select_id.options[i].value == obj.value)
			select_id.remove(i);
	}
	
	defaultLrChargeAmount();
}

function defaultLrChargeAmount(){
	if($("#chargesDropDownForLrLevel").val() == BookingChargeConstant.CARRIER_RISK){
		//Default LR Level Charge
		$("#chargeValueId").val(rateMasterConfiguration.lrLeveldefaultCarrierRiskChargeAmount);
		$("#percentCheck").prop("checked", rateMasterConfiguration.lrLeveldefaultCarrierRiskPercentCheck);
		
		if(rateMasterConfiguration.lrLevelDefaultCarrierRiskChargeDeclaredValue){
			$("#declaredValue_"+ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE).prop("selected",true);
			checkForApplicableOnDeclaredValue();
		}
	} else{
		$("#chargeValueId").val(0);
		$("#percentCheck").prop("checked", false);
		$("#declaredValue_"+ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE).prop("selected",false);
	}
}

function setAmountType(text_id, obj) {
	if(!validateInputTextFeild(1, text_id.id, text_id.id, 'info', chargeGTZeroInfoMsg)){
		$('#'+obj.id).prop("checked", false);
		
		if(rateMasterConfiguration.showConditionalChargesDivOnRouteWise)
			$('#conditionalChargePanel').hide();
		
		return false;
	}

	text_id.value = text_id.value.replace('%', "");

	if(obj.checked && text_id.value > 0) {
		if(rateMasterConfiguration.showConditionalChargesDivOnRouteWise)
			$('#chargesApplicableForRouteWisePanel').show();
		
		$('#' + text_id.id).val(text_id.value + '%');
	} else {
		if(rateMasterConfiguration.showConditionalChargesDivOnRouteWise)
			$('#chargesApplicableForRouteWisePanel').hide();
			
		$('#' + text_id.id).val(text_id.value);
	}
}

function setRouteAmountType(obj) {
	if(!validateInputTextFeild(1, 'routeAmount', 'routeAmount', 'info', chargeGTZeroInfoMsg)){
		$('#'+obj.id).prop("checked", false);
		return;
	}
	
	let routeAmount 	= $('#routeAmount').val();

	if(obj.checked && routeAmount > 0)
		$('#chargesApplicableForRouteWisePanel').show();
	else
		$('#chargesApplicableForRouteWisePanel').hide();
	
	return true;
}

function createJsPanelForRateMaster(title, mainId) {
	let jspanelContent	= $('#' + mainId).html();

	jspanelforratesEdit = $.jsPanel({
		id: 'routewisejspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass) {
	let ttableId	= '#routewisejspanel' + ' #' + tableId;
	setDatatable(ttableId);
	// get DataTable Instance
	let table = $(ttableId).DataTable();
	
	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#routewisejspanel' +' #' + tableId + ' #' + tbodyId +' td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#routewisejspanel' + ' #' + tableId + ' #' + tfootId + ' .' + tfootRowClass, '#routewisejspanel' + ' #' + tableId + ' #' + theadId +' tr');
	setFilterOverlayPopupToggle('#routewisejspanel #toggle-popup');
}

//Method for Display Rates Pop up for download Rates Excel
function showDialogForDownload() {
	if(!validateMainSection(0))
		return false;
	
	let modal = $('#downloadToExcelPanel')[0];
	let span = $('.close')[0];
	let closeBtn = $('#closeBtn')[0];
	$("#downloadToExcelPanel").removeClass("hide")
	modal.style.display = "block";
	setChargeTypeSection();

	span.onclick = function() {
		modal.style.display = "none";
		// Reset the Selectize values to default
		resetSelectize('chargeSection');
	}
	
	closeBtn.onclick = function() {
		modal.style.display = "none";
		// Reset the Selectize values to default
		resetSelectize('chargeSection');
	}

	$('#chargeSection').focus();
}

//Method for get the Rates For download as Excel
function downloadRateToExcel() {
	if(!validateChargeTypeSection())
		return false;
	
	showLayer();
	let jsonObject						= new Object();

	jsonObject["branchId"]				= getValueFromInputField('branchId');
	jsonObject["corporateAccountId"]	= getValueFromInputField('partyId');
	jsonObject["chargeSectionId"]		= getValueFromInputField('chargeSection');
	jsonObject["categoryTypeId"]		= getValueFromInputField('categoryType');

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL+'/rateMasterWS/getChargeSectionWiseChargesDetails.do',
		data:jsonObject,
		dataType: 'json',
		success: function(data) {
			let modal = document.getElementById('downloadToExcelPanel');
			modal.style.display = "none";
			
			resetSelectize('chargeSection');
			hideLayer();

			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
			} else {
				RateMasterHeaderConstant	= data.RateMasterHeaderConstant;
				chargesDownloadToExcel(data);
			}
		}
	});
}

function  setSelectize(id,value) {
	let $select = $("#"+id).selectize();
	let selectize = $select[0].selectize;
	selectize.setValue(selectize.search(value).items[0].id);
}

function  resetSelectize(id) {
	let $select = $('#'+id).selectize();
	let control = $select[0].selectize;
	control.clear();
}

function chargesDownloadToExcel(data) {
	let ep=new ExcelPlus();
	let sheet = 1;
	
	for(let key in data) {
		if(sheet == 1){
			ep.createFile(key);
		} else if(key != 'RateMasterHeaderConstant') {
			ep.createSheet(key);
		}
		
		if(key != 'RateMasterHeaderConstant') {
			for (let i = 0; i< data[key].length; i++){
				if(i == 0) {
					if(data[key][i].articleWiseWeightDiffId != undefined || data[key][i].chargeConfigurationId != undefined
					|| data[key][i].chargeWeightConfigId != undefined || data[key][i].rateMasterId != undefined
					|| data[key][i].formTypeWiseChargesId != undefined || data[key][i].ctFormTypeWiseChargesId != undefined) {
						ep.writeRow(i+1, data[key][i].headerList);
						ep.writeNextRow(getDataRowForShow(data[key][i]));
					}
				} else if(data[key][i].articleWiseWeightDiffId != undefined || data[key][i].chargeConfigurationId != undefined
					|| data[key][i].chargeWeightConfigId != undefined || data[key][i].rateMasterId != undefined
					|| data[key][i].formTypeWiseChargesId != undefined || data[key][i].ctFormTypeWiseChargesId != undefined) {
						ep.writeNextRow(getDataRowForShow(data[key][i]));
				}
			}
			sheet++;
		}
	}
	ep.saveAs("RateMaster.xlsx");
}

function getDataRowForShow(data) {
	let finalJsonObj = new  Array();
	
	if(data.branchName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.BRANCH_NAME))
		finalJsonObj.push(data.branchName);

	if(data.branch != undefined && _.contains(data.headerList, RateMasterHeaderConstant.BRANCH_NAME))
		finalJsonObj.push(data.branch);

	if(data.destinationBranch != undefined && _.contains(data.headerList, RateMasterHeaderConstant.DESTINATION_NAME))
		finalJsonObj.push(data.destinationBranch);
	
	if(data.destinationBranchName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.DESTINATION_NAME))
		finalJsonObj.push(data.destinationBranchName);

	if(data.partyName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.PARTY_NAME))
		finalJsonObj.push(data.partyName);

	if(data.ctFormName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.CT_FORM_TYPE))
		finalJsonObj.push(data.ctFormName);
	
	if(data.packingTypeName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.ARTICLE_TYPE))
		finalJsonObj.push(data.packingTypeName);

	if(data.minWeight != undefined && _.contains(data.headerList, RateMasterHeaderConstant.MIN_WEIGHT))
		finalJsonObj.push(data.minWeight);

	if(data.maxWeight != undefined && _.contains(data.headerList, RateMasterHeaderConstant.MAX_WEIGHT))
		finalJsonObj.push(data.maxWeight);

	if(data.chargeTypeName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.CHARGE_TYPE))
		finalJsonObj.push(data.chargeTypeName);

	if(data.articleType != undefined && _.contains(data.headerList, RateMasterHeaderConstant.ARTICLE_TYPE))
		finalJsonObj.push(data.articleType);

	if(data.packingGroupName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.PACKING_GROUP))
		finalJsonObj.push(data.packingGroupName);
	
	if(data.packingGroupTypeName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.PACKING_GROUP))
		finalJsonObj.push(data.packingGroupTypeName);

	if(data.vehicleType != undefined && _.contains(data.headerList, RateMasterHeaderConstant.VEHICLE_TYPE))
		finalJsonObj.push(data.vehicleType);

	if(data.chargeName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.CHARGE_NAME))
		finalJsonObj.push(data.chargeName);

	if(data.ispercent != undefined && _.contains(data.headerList, RateMasterHeaderConstant.IS_PERCENT))
		finalJsonObj.push(data.isPercentString);

	if(data.chargeApplicableOnName != undefined && _.contains(data.headerList, RateMasterHeaderConstant.APPLICABLE_ON))
		finalJsonObj.push(data.chargeApplicableOnName);

	if(data.chargeMinAmount != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.AMOUNT))
		finalJsonObj.push(data.chargeMinAmount);

	if(data.chargeWeight != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.CHARGE_WEIGHT))
		finalJsonObj.push(data.chargeWeight);

	if(data.formTypeName != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.FORM_TYPE))
		finalJsonObj.push(data.formTypeName);
	
	if(data.chargeAmount != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.RATE))
		finalJsonObj.push(data.chargeAmount);
	
	if(data.rate != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.RATE))
		finalJsonObj.push(data.rate);
	
	if(data.bookingType != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.BOOKING_TYPE))
		finalJsonObj.push(data.bookingType);
	
	if(data.wayBillType != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.LR_TYPE))
		finalJsonObj.push(data.wayBillType);
	
	if(data.consigneePartyName != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.CONSIGNEE_NAME))
		finalJsonObj.push(data.consigneePartyName);
	
	if(data.consignmentGoodsName != undefined  && _.contains(data.headerList, RateMasterHeaderConstant.SAID_TO_CONTAIN))
		finalJsonObj.push(data.consignmentGoodsName);
	
	return finalJsonObj;
}

function copyChargesToOtherBranch() {
	if(!copyChargesValidation())
		return false;
	
	$.confirm({
		text: "Are you sure you want to Copy Rates ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["sourceCityId"]			= $('#cityId').val();
			jsonObject["destinationCityId"]		= $('#destinationCityId').val();
			jsonObject["sourceRegionId"]		= $('#regionId').val();
			jsonObject["destinationRegionId"]	= $('#destinationRegionId').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["source"]				= $('#source').val();
			jsonObject["billSelectionId"] 		= $('#billSelection').val();

			let checkBoxArray	= checkAllSourceCheckBox();
			let checkBoxArr		= checkAllPartyIdCheckBox();

			jsonObject["sourceIds"]	= checkBoxArray.join(',');
			jsonObject["partyIds"]	= checkBoxArr.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/copyChargesToOtherBranches.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetCopyChargesTab();
						hideLayer();
						return;
					}
					
					resetCopyChargesTab();
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

function resetCopyChargesTab() {
	$('#sourceMultiIdlist').empty();
	$('#routeAmount').val("0");
	setComboBoxIndex('copyChargesTable select', 0);
	$("#source").trigger( "onchange" );
	$("#multiPartyIdlist").empty();
}

function setSlabWiseRateConfig(){
	if (rateMasterConfiguration.slabWiseDestinationBranchWork && (getValueFromInputField('slabs') != '0-0' && getValueFromInputField('slabs') != '0'))
		$('#destinationTypeComboPanel').addClass('hide');
	else
		$('#destinationTypeComboPanel').removeClass('hide');

	if (rateMasterConfiguration.declaredValueSlabRatePanel && (getValueFromInputField('slabs2') != '0-0' && getValueFromInputField('slabs2') != '0'))
		$('#destinationTypeComboPanel').addClass('hide');
	else
		$('#destinationTypeComboPanel').removeClass('hide');		
	
	if (rateMasterConfiguration.slabWisePackingTypeWork && (getValueFromInputField('slabs') != '0-0' && getValueFromInputField('slabs') != '0')) {
		$('#articleTypePanel').addClass('hide');
		$('#saidToContainPanel').addClass('hide');
		$('#consignmentGoodsId').val(0);
		changeOnChargeType();
	} else {
		$('#saidToContainPanel').removeClass('hide');
		$('#articleTypePanel').removeClass('hide');
	}
}

function getPartyDetails(partyId) {
	if(!rateMasterConfiguration.showRateConfigurationPanel)
		return;
	
	let jsonObject					= new Object();

	jsonObject.filter				= 24;
	jsonObject.partyId				= partyId;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if(!data.partyDetails)
						return;
					
					let party = data.partyDetails;
					
					$('#rateConfigured').prop("checked", party.rateConfigured);	
				}
			});
}

//update rate configured of party
function updateRateConfigured() {
	if (!validateMainSectionForRateConfigured())
		return false;

	$.confirm({
		text: "Are you sure you want to update configuration ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();

			jsonObject["corporateAccountId"]			= getValueFromInputField('partyId');
			jsonObject["isRateConfigured"]				= isCheckBoxChecked('rateConfigured');
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyRateConfiguration.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function() {
					hideLayer();
				}
			});
			
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}
//send to party commision master 
function reDirectPartyCommisionMaster() {
	let branchId 			= $('#branchId').val();
	let partyId				= $('#partyId').val();
	
	if(partyId <= 0) {
		showMessage('error', 'Please, Select Party !');
		return;
	}
	
	let partyName			= $('#partyName').val().substring(0, $('#partyName').val().indexOf("(")).trim();
	let branchName			= $('#branchName').val().substring(0, $('#branchName').val().indexOf("(")).trim();
	
	window.open('masters.do?pageId=340&eventId=1&modulename=partyCommissionMaster&branchId='+branchId+'&partyId='+partyId+'&partyName='+partyName+'&branchName='+branchName);
}	

function setAmountTypeToIncreaseDecrease(text_id, obj) {
	if (!validateInputTextField(1, text_id.id, text_id.id, 'info', chargeGTZeroInfoMsg)) {
		$('#' + obj.id).prop("checked", false);
		return false;
	}

	text_id.value = text_id.value.replace('%', "");

	$('#' + text_id.id).val(text_id.value);
}

function increaseRateBy() {
	if(!validateIncreaseDecreaseRateSection())
		return false;
	
	$.confirm({
		text: "Are you sure you want to Increase Rate by " + $('#increaseDecreaseAmount').val() + "?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();

			jsonObject["incDecDestination"]		= $('#incDecDestination').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown4').val();
			jsonObject["isPercent"]				= $('#percentToIncreaseDecrease').prop("checked");
			jsonObject["amount"]				= $('#increaseDecreaseAmount').val();
			jsonObject["isIncreaseAmount"]		= true;

			let checkBoxArray	= new Array();
			
			$("input[name=incDecMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/increaseAndDecreaseRate.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

function decreaseRateBy() {
	if(!validateIncreaseDecreaseRateSection())
		return false;
	
	$.confirm({
		text: "Are you sure you want to Decrease Rate by " + $('#increaseDecreaseAmount').val() + "?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();

			jsonObject["incDecDestination"]		= $('#incDecDestination').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown4').val();
			jsonObject["isPercent"]				= $('#percentToIncreaseDecrease').prop("checked");
			jsonObject["amount"]				= $('#increaseDecreaseAmount').val();
			jsonObject["isDecreaseAmount"]		= true;

			let checkBoxArray	= new Array();
			
			$("input[name=incDecMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/increaseAndDecreaseRate.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

function selectFixCharge(checked) {
	if(checked) {
		$('.bookingTypeCol').addClass('hide');
		$('.vehicleTypeCol').addClass('hide');
		$('#vehicleType').val(0);
		$('#chargeType').addClass('hide');
		refreshAndHidePartOfPage('articleTypePanel', 'hide');
		refreshAndHidePartOfPage('saidToContainPanel', 'hide');
		$('#slabsFeild').addClass('hide');
		$('#routeAmountFeild').css('margin-left', '9px');
		$('#bookingType').val("0")
		$('#wayBillType').val("0")
		changeOnWayBillType();
		$('#chargeType').val("0")
		$('#consignmentGoodsId').val("0")
		destroyMultiselectPackingType();
		removeOption('articleType',null);
		$('#saidToContain').val("");
	} else {
		$('.bookingTypeCol').removeClass('hide');
		$('#wayBillType').removeClass('hide');
		$('#chargeType').removeClass('hide');
		$('#slabsFeild').removeClass('hide');
		$('#routeAmountFeild').css('margin-left', '70px');
		
		$('#bookingType').val('0');
		$('#wayBillType').val('0');
		$('#chargeType').val('0');
	}
}

function setTransportationMode() {
	removeOption('transportationMode', null);

	for(const element of transportationModeList) {
		createOption('transportationMode', element.transportModeId, element.transportModeName);
	}
}

function showConditionalPanel() {
	if(rateMasterConfiguration.allowConditionalChargesOnOtherCharge) {
		let chargeMasterIdsArr 		= (rateMasterConfiguration.chargeMasterIds).split(",");
		
		if(isValueExistInArray(chargeMasterIdsArr, $('#chargesDropDown2').val()))
			$('#conditionalChargePanel').show();
		else
			$('#conditionalChargePanel').hide();
	
		removeOption('chargesApplicableForRouteWise',null);
		createOption('chargesApplicableForRouteWise', 0, "-- Select Charges --");
		
		for (const element of charges) {
			if(isValueExistInArray(chargeMasterIdsArr, $('#chargesDropDown2').val()) 
				&& element.chargeTypeMasterId != $('#chargesDropDown2').val())
					createOption('chargesApplicableForRouteWise', element.chargeTypeMasterId, element.chargeTypeMasterDisplayName);
		}
	}

	if($('#chargesDropDown2').val() == FREIGHT && rateMasterConfiguration.showVisibleRate)
		$('#visibleAmountFeild').removeClass('hide');
	else {
		$('#visibleAmountFeild').addClass('hide');
		$('#visibleAmount').html(0);
	}
}

function setBranchServiceType() {
	$('#branchServiceTypePanel').removeClass('hide');
	removeOption('branchServiceTypeId', null);
	createOption('branchServiceTypeId', 0, "-- Select Branch Service Type --");
	
	for(const element of branchServiceTypeList) {
		createOption('branchServiceTypeId', element.branchServiceTypeId, element.branchServiceTypeName);
	}
}

function setDeliveryTo() {
	$('#deliveryToPanel').removeClass('hide');
	removeOption('deliveryToId', null);
	createOption('deliveryToId', 0, "-- Select Delivery To --");
	
	for(const element of deliveryToList) {
		createOption('deliveryToId', element.deliveryAtId, element.deliveryAtName);
	}
}

function setWayBillTypeForLRLevelSelection(wayBillTypeList) {
	/*$('#wayBillTypeIds').append("<option value='"+0+"'>" + 'Select LR Type' + "</option>");
	
	if (typeof wayBillTypeList !== 'undefined') {
		wayBillTypeList.forEach(function(wayBillType) {
			$('#wayBillTypeIds').append("<option value='" + wayBillType.wayBillTypeId + "'>" + wayBillType.wayBillType + "</option>");
		});
	}*/
	setWayBillType('wayBillTypeIds');
}

function showPartyGSTNPanel(){
	if($('#specificPartyGSTN').prop("checked") && $('#categoryType').val() == CATEGORY_TYPE_PARTY_ID){
		$('#partyPanel').hide();
		$('#partyGSTNPanel').show();		
	} else {
		$('#partyGSTNPanel').hide();
		$('#partyPanel').show();
	}
	
	$('#partyName').val("");
	$('#partyGSTN').val("");
	$('#partyId').val(0);
	$('#partySelectionOnGSTN').hide();
	destroyMultiselectPartySelect();
	removeOption('partySelectOnGSTN',null);
}

function setPartyGSTNAutoComplete() {
		$("#partyGSTN").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&responseFilter=3&gstNumberWiseBooking="+true,
			minLength: 5,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				if(ui.item.id != 0){
					var label = ui.item.label;
					var gstNumber = label.split(" ")[0];  // Extracting the GST number
					getPartyListByGSTN(gstNumber);
	
					$('#partyId').val(ui.item.id);
					getChargesConfigRates();
					getMinimumPartyRates();
					setSlabs(ui.item.id, 2);
					getPartyDetails(ui.item.id);

					if (rateMasterConfiguration.SlabWeightPanel)
						setSlabWeightDropDown();

					if (rateMasterConfiguration.showRateConfigurationPanel)
						getRouteWiseRateConfigured(ui.item.id);
				}

			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
}

function getPartyListByGSTN(gstNumber) {

	var jsonObject					= new Object();
	jsonObject["gstn"]				= gstNumber;

	$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/partyMasterWS/getAllPartyDetailsByGstn.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				var partyDetailsArray	= data.partyDetailsArray;

				if (partyDetailsArray != null && partyDetailsArray.length > 1) {
					$('#partySelectionOnGSTN').show();
					setPartyOptions(partyDetailsArray);
				}else{
					$('#partySelectionOnGSTN').hide();
					destroyMultiselectPartySelect();
					removeOption('partySelectOnGSTN', null);
				}
			}
		});
}

function setPartyOptions(partyDetailsArray) {
	removeOption('partySelectOnGSTN', null);  // Assuming you have a function to remove existing options

	if (!jQuery.isEmptyObject(partyDetailsArray)) {
		for (var i = 0; i < partyDetailsArray.length; i++) {
			createOption('partySelectOnGSTN', partyDetailsArray[i].corporateAccountId, partyDetailsArray[i].corporateAccountDisplayName);
		}
	}

	multiselectPartySelect();
}

function multiselectPartySelect() {
	destroyMultiselectPartySelect();
	$('#partySelectOnGSTN').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200,
		overflowX: 'auto',
		width: 250,
		labelPadding: '0px 10px 3px 10px'
	});
}

function destroyMultiselectPartySelect() {
	$("#partySelectOnGSTN").multiselect('destroy');
}

function getSelectedPartyIdsOnGstn() {
	var partyIdArr			= [];
	var selected			= $("#partySelectOnGSTN option:selected");
	var corporateAccountId  = $('#partyId').val();
	
	selected.each(function () {
		partyIdArr.push($(this).val());
	});

	if(partyIdArr.length > 0 && !partyIdArr.includes(corporateAccountId))
		partyIdArr.push(corporateAccountId);

	return partyIdArr.join(',');
}

function copyWithIncAndDecPanel(){
	if($('#copyIncreasedDecreasedRate').prop("checked")){
		$("#CopyWithIncDecDiv").removeClass('hide');
		$("#copyIncRateSave").removeClass('hide');
		$("#copyDecRateSave").removeClass('hide');
		$("#copyRateSave").addClass('hide');
	} else {
		$("#CopyWithIncDecDiv").addClass('hide');
		$("#copyIncRateSave").addClass('hide');
		$("#copyDecRateSave").addClass('hide');
		$("#copyRateSave").removeClass('hide');
	}
}

function copyIncDecChargesToOtherBranch(id) {
	if(!copyChargesValidation())
		return false;
	
	if(!validateCopyIncreaseDecreaseRateSection())
		return false;

	$.confirm({
		text: "Are you sure you want to Copy Rates ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["sourceCityId"]			= $('#cityId').val();
			jsonObject["destinationCityId"]		= $('#destinationCityId').val();
			jsonObject["sourceRegionId"]		= $('#regionId').val();
			jsonObject["destinationRegionId"]	= $('#destinationRegionId').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["source"]				= $('#source').val();
			jsonObject["billSelectionId"] 		= $('#billSelection').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown4').val();
			jsonObject["isPercent"]				= $('#percentToCopyIncreaseDecrease').prop("checked");
			jsonObject["amount"]				= $('#copyIncreaseDecreaseAmount').val();
			jsonObject["copyWithIncreasedRates"] = id == 1;
			jsonObject["copyWithDecreasedRates"] = id == 2;
			
			let checkBoxArray	= new Array();
			
			$("input[name=sourceMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["sourceIds"]	= checkBoxArray.join(',');
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/copyChargesToOtherBranches.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						$('#copyIncreaseDecreaseAmount').val("0");
						resetCopyChargesTab();
						hideLayer();
						return;
					}
					$('#copyIncreaseDecreaseAmount').val("0");
					resetCopyChargesTab();
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

