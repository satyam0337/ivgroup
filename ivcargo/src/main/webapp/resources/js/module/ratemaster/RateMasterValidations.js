/**
 * @Author Anant Chaudhary	13-04-2016
 */

//Validation from category type branch and party. its compulsory for all except. 
function validateMainSection(filter) {

	if(!validateCategoryType()) return false;
	
	if((filter == 1 || filter == 2) && rateMasterConfiguration.billSelectionWiseRate && !validateBillSelection()) return false;

	if(isCityWiseRates) {
		if(!validateCity()) return false;
	} else if(isRegionWiseRates) {
		if(!validateRegion()) return false;
	} else if(!validateBranch()) return false;

	return validateParty();
}

function validateCategoryType() {
	return validateInputTextFeild(1, 'categoryType', 'categoryType', 'error', selectCategoryType);
}

function validateChargeTypeSection() {
	return validateInputTextFeild(1, 'chargeSection', 'chargeSection', 'error', selectChargeTypeSection);
}

function validatePartySelection() {
	let categoryType		= $('#categoryType').val();

	if(categoryType != partyTypeCategory) {
		showMessage('error', selectOnlyPartyErrMsg);
		setValueToContent('categoryType', 'formField', 0);
		
		//Calling from RateMasterNew.js
		changeOnCategoryType();
		changeTextFieldColorWithoutFocus('categoryType', '', '', 'red');
		return false;
	}
	
	return true;
}

function validateBranch() {
	return validateInputTextFeild(1, 'branchId', 'branchName', 'error', branchNameErrMsg);
}

function validateCity() {
	return validateInputTextFeild(1, 'cityId', 'cityName', 'error', cityNameErrMsg);
}

function validateRegion() {
	return validateInputTextFeild(1, 'regionId', 'regionName', 'error', regionNameErrMsg);
}

function validateCopyDestinationCity() {
	return validateInputTextFeild(1, 'destinationCityId', 'copyDestinationCity', 'error', cityNameErrMsg);
}

function validateCopyDestinationRegion() {
	return validateInputTextFeild(1, 'destinationRegionId', 'copyDestinationRegion', 'error', regionNameErrMsg);
}

function validateParty() {
	let categoryType		= $('#categoryType').val();
	
	if (categoryType == RateMasterConstant.CATEGORY_TYPE_PARTY_ID) {
		if(!validateInputTextFeild(1, 'partyId', 'partyName', 'error', partyNameErrMsg)) {
			return false;
		}
	}
	
	return true;
}

function validateBillSelection() {
	return validateInputTextFeild(1, 'billSelection', 'billSelection', 'error', 'Select, Bill Type');
}

function validateChargeWeight() {
	return validateInputTextFeild(1, 'chargeWeight', 'chargeWeight', 'error', chargeWeightErrMsg);
}

function validatePackingType() {
	return validateInputTextFeild(1, 'articleType1', 'articleType1', 'error', packingTypeErrMsg);
}

function validateCTFormPackingType() {
	return validateInputTextFeild(1, 'ctFormPackingType', 'ctFormPackingType', 'error', packingTypeErrMsg);
}

function validatePackingTypeGrp() {
	return validateInputTextFeild(1, 'ctFormPackingTypeGroup', 'ctFormPackingTypeGroup', 'error', packingGroupErrMsg);
}

function validatePackingTypeInArticleWiseWeight() {
	return validateInputTextFeild(1, 'articleType2', 'articleType2', 'error', packingTypeErrMsg);
}

function validateEditAmountChargesDropdown1() {
	return validateInputTextFeild(1, 'chargesDropDown1', 'chargesDropDown1', 'error', chargeErrMsg);
}

function validateEditAmountChargesDropdown2() {
	return validateInputTextFeild(1, 'chargesDropDown2', 'chargesDropDown2', 'error', chargeErrMsg);
}

function validateLRLevelChargesDropdown3() {
	return validateInputTextFeild(1, 'chargesDropDown3', 'chargesDropDown3', 'error', chargeErrMsg);
}

function validateBookingType() {
	return validateInputTextFeild(1, 'bookingType', 'bookingType', 'error', bookingTypeErrMsg);
}

function validateChargeType() {
	return validateInputTextFeild(1, 'chargeType', 'chargeType', 'error', chargeTypeErrMsg);
}

function validateRoundOffChargeWeight() {
	return validateInputTextFeild(1, 'chargeWeightRoundOffAmt', 'chargeWeightRoundOffAmt', 'error', chargeWeightErrMsg);
}

function validateArticleType() {
	if ($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		let options = $('#articleType > option:selected');
		if(options.length == 0) {
			showMessage('error', articleTypeErrMsg);
			return false;
		}
	} else {
		//$('#articleType').val(0);
	}
	return true;
}

function validatePackingGroupType() {
	if ($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
		if(rateMasterConfiguration.isWeightRateOnArticleGroup && rateMasterConfiguration.PackingGroupTypeMaster) {
			var selected				= $("#packingGroupType option:selected");
			
			if(selected.length == 0) {
				$("#packingGroupType").focus();
				showMessage('error', 'Please, Select Packing Group !');
				return false;
			}
		}
	}
	
	return true;
}

function validateFormType() {

	let options = $('#formType > option:selected');

	if(options.length == 0) {
		showMessage('error', formTypeErrMsg);
		changeTextFieldColor('formType', '', '', 'red');
		return false;
	}

	return true;
}
function validateFSRATE() {
	
	if(!rateMasterConfiguration.showFsRateConfigurationPanel){
		return true;
	}
	
	let options = $('#chargeNameforFs > option:selected');

	if(options.length == 0) {
		showMessage('error', 'Select Booking Charges');
		changeTextFieldColor('.multiselect', '', '', 'red');
		return false;
	}
	
	return true;
}

function validateCTFormType() {
	
	let element = document.getElementById('ctFormType').value;

	if(element == 0) {
		showMessage('error', ctFormTypeErrMsg);
		changeTextFieldColor('ctFormType', '', '', 'red');
		return false;
	}

	return true;
}

function validateSlabs() {
	return validateInputTextFeild(1, 'slabs', 'slabs', 'error', slabErrMsg);
}

function validateRouteWiseSlabs() {
	return validateInputTextFeild(1, 'routeSlabs', 'routeSlabs', 'error', slabErrMsg);
}

function validateRouteDestination() {
	return validateInputTextFeild(1, 'destination', 'destination', 'error', destinationTypeErrMsg);
}

function validateDestinationForCopy() {
	return validateInputTextFeild(1, 'source', 'source', 'error', destinationTypeErrMsg);
}

function validateRouteWiseDestinationTypes() {
	if ($("#multiIdlist").find('tr').length == 0) {
		if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
			showMessage('info', destinationBranchInfoMsg);
			changeTextFieldColor('destinationBranch', '', '', 'red');
			return false;
		} else if ($('#destination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
			showMessage('info', destinationAreaInfoMsg);
			changeTextFieldColor('destinationArea', '', '', 'red');
			return false;
		}
	}
	return true;
}

function validateDestinationTypesForCopy() {
	if (!$("#sourceMultiIdlist").exists() || $("#sourceMultiIdlist").find('tr').length == 0) {
		if ($('#source').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
			showMessage('info', destinationBranchInfoMsg);
			changeTextFieldColor('sourceBranch', '', '', 'red');
			return false;
		} else if ($('#source').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
			showMessage('info', destinationAreaInfoMsg);
			changeTextFieldColor('sourceArea', '', '', 'red');
			return false;
		}
	}
	return true;
}

function validateIncreaseAndDecreaseRateArea() {
	if(!isCheckValidation){
		
		if(!validateInputTextFeild(1, 'incDecDestination', 'incDecDestination', 'error', destinationTypeErrMsg)) {
			return false;
		}
		if ($("#incDecMultiIdlist").find('td').length == 0) {
			if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
				showMessage('info', destinationBranchInfoMsg);
				changeTextFieldColor('incDecDestinationBranch', '', '', 'red');
				return false;
			} else if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
				showMessage('info', destinationAreaInfoMsg);
				changeTextFieldColor('incDecDestinationArea', '', '', 'red');
				return false;
			} else if ($('#incDecDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
				showMessage('info', destinationRegionInfoMsg);
				changeTextFieldColor('incDecDestinationRegion', '', '', 'red');
				return false;
			}
		}
	}
	return true;
}


function validaterouteWiseSlabRateArea() {
	if(!validateInputTextFeild(1, 'slabWiseRoutedestination', 'slabWiseRoutedestination', 'error', destinationTypeErrMsg)) {
		return false;
	}
	
	if ($("#slabWiseDestMultiIdlist").find('td').length == 0) {
		if ($('#slabWisedestinationBranch').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
			showMessage('info', destinationBranchInfoMsg);
			changeTextFieldColor('slabWisedestinationBranch', '', '', 'red');
			return false;
		} else if ($('#slabWisedestinationBranch').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
			showMessage('info', destinationAreaInfoMsg);
			changeTextFieldColor('slabwisedestinationArea', '', '', 'red');
			return false;
		} else if ($('#slabWisedestinationBranch').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
			showMessage('info', destinationRegionInfoMsg);
			changeTextFieldColor('slabwisedestinationRegion', '', '', 'red');
			return false;
		}
	}
	return true;
}

function validateRouteAmount() {
	return validateInputTextFeild(1, 'routeAmount', 'routeAmount', 'error', routeAmountErrMsg);
}

function validateMinimumChargeAmount(){
	return validateInputTextFeild(1, 'minRouteAmount', 'minRouteAmount', 'error', minChargeAmountAmountErrMsg);
}

function validateExtraSizeChargeAmount(){
	return validateInputTextFeild(1, 'extraAmtPerSqft', 'extraAmtPerSqft', 'error', extraChargeAmountPerSqftErrMsg);
}

function validateSlabWiseLoadingChargeAmount(){
	return validateInputTextFeild(1, 'slabWiseLoadingPerArt', 'slabWiseLoadingPerArt', 'error', slabWiseLoadingAmounErrMsg);
}

function validateIncreasedChargeAmountPerKg(){
	return validateInputTextFeild(1, 'increasedAmountPerKg', 'increasedAmountPerKg', 'error', increasedChargeAmounPerKgErrMsg);
}

function validateFormTypeAmount() {
	return validateInputTextFeild(1, 'formAmount', 'formAmount', 'error', formTypeAmountErrMsg);
}

function validateCTFormTypeAmount() {
	return validateInputTextFeild(1, 'ctFormAmount', 'ctFormAmount', 'error', ctFormTypeAmountErrMsg);
}

function validateVehicleType() {
	if(bookingType.value == BOOKING_TYPE_FTL_ID && rateMasterConfiguration.ShowVehicleType) {
		if(!validateInputTextFeild(1, 'vehicleType', 'vehicleType', 'error', truckTypeErrMsg)) {
			return false;
		}
	}
	
	return true;
}

function validateMinValueInArticleWiseWeight() {
	if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff) {
		if(!validateInputTextFeild(1, 'minValue', 'minValue', 'error', minValueGTZeroErrMsg)) {
			return false;
		}
	}
	
	return true;
}

function validateMaxValueInArticleWiseWeight(elementId1, elementId2) {
	if(!validateInputTextFeild(1, elementId2, elementId2, 'error', maxValueGTOneErrMsg)) {
		return false;
	} else if(!validateRange(elementId1, elementId2, 'basicError', maxValueGTMinValueErrMsg)) {
		return false;
	}
	
	return true;
}

function validateRange(elementId1, elementId2, errorElementId, errorMsg){
	let element1 = parseInt(getValueFromInputField(elementId1));
	let element2 = parseInt(getValueFromInputField(elementId2));
	if(element2 <= element1){
		showMessage('error', errorMsg);
		element1.value = "";
		element2.value = "";
		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
		return true;
	}
}

function routeWiseValidation() {
	let isChargedFixed = false;
	
	if(rateMasterConfiguration.showRouteWiseDateSelection && !rateMasterConfiguration.showRouteWiseDateSelectionForParty &&  !validateDateSelection())
		return false;
		
	if(rateMasterConfiguration.showRouteWiseDateSelectionForParty && $('#categoryType').val() == CATEGORY_TYPE_PARTY_ID &&  !validateDateSelection())
		return false;

	if($('#isChargedFixed').exists())
		isChargedFixed  = $('#isChargedFixed').prop('checked');
	
	if(!validateMainSection(1)) return false;

	if(!validateEditAmountChargesDropdown2()) return false;

	if(!isChargedFixed && !validateBookingType()) return false;
	
	if(!validateVehicleType()) return false;

	if(!isChargedFixed && !validateChargeType()) return false;
	
	if(!validatePackingGroupType()) return false;
	
	if (rateMasterConfiguration.slabWiseDestinationBranchWork && (getValueFromInputField('slabs') == '0-0' || getValueFromInputField('slabs') == '0')) {
		if(!rateMasterConfiguration.PackingGroupTypeMaster && !isChargedFixed && !validateArticleType())
			return false;
	} else if(!rateMasterConfiguration.slabWiseDestinationBranchWork && !rateMasterConfiguration.PackingGroupTypeMaster 
		&& (getValueFromInputField('slabs') == '0-0' || getValueFromInputField('slabs') == '0')
		&& !isChargedFixed && !validateArticleType())
			return false;

	if(rateMasterConfiguration.isSlabFeildValidationAllow) {
		if(!validateSlabs()) return false;
	}
	
	if(!validateRouteAmount()) return false;

	if (rateMasterConfiguration.slabWiseDestinationBranchWork && (getValueFromInputField('slabs') == '0-0' || getValueFromInputField('slabs') == '0')
	|| !rateMasterConfiguration.slabWiseDestinationBranchWork) {
		if(!validateRouteDestination()) return false;
		if(!validateRouteWiseDestinationTypes()) return false;
	}

	return true;
}

function validateDateSelection() {
	let validFrom = $('#validFromEle').val();
	let validTill = $('#validTillEle').val();

	if (validFrom == '' || validFrom == undefined) {
		showMessage('error', "Enter Valid From Date!");
		$('#validFromEle').focus();
		return false;
	}

	if(validTill == '' || validTill == undefined) {
		showMessage('error', 'Enter Valid Till Date!');
		$('#validTillEle').focus();
		return false;
	}

	let validFromDate = new Date(validFrom);
	let validTillDate = new Date(validTill);

	if (validTillDate < validFromDate) {
		showMessage('error', "Valid Till Cannot Be Smaller than Valid From!");
		$('#validTillEle').focus();
		return false;
	}

	return true;
}

function routeWiseSlabValidation(){
	
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	if(!validateRouteWiseSlabs()) return false;
	if(!validateMinimumChargeAmount()) return false;
	
	/*if(!validateExtraSizeChargeAmount()) {
		return false;
	}

	if(!validateIncreasedChargeAmountPerKg()) {
		return false;
	}*/
	
	return validaterouteWiseSlabRateArea();
}

function fixedPartyRateValidation() {
	
	if(!validateFixedMainSection()) return false;
	
	if(!validateFixedChargesDropdown()) return false;

	if(!validateFixedChargeType()) return false;

	return validateFixedPartyAmount();
}

function validateFixedChargesDropdown() {
	return validateInputTextFeild(1, 'fixedPartyChargesDropDown', 'fixedPartyChargesDropDown', 'error', chargeErrMsg);
}

function validateFixedChargeType() {
	return validateInputTextFeild(1, 'fixedPartyChargeType', 'fixedPartyChargeType', 'error', chargeTypeErrMsg);
}

function validateFixedPartyAmount() {
	return validateInputTextFeild(1, 'fixedPartyAmount', 'fixedPartyAmount', 'error', routeAmountErrMsg);
}

function copyChargesValidation() {
	if(!validateMainSection(1)) return false;
	
	if(isCityWiseRates && !validateCopyDestinationCity())
		return false;
	else if(isRegionWiseRates && !validateCopyDestinationRegion())
		return false;
	else if ($('#source').val() == SOURCE_TYPE_TO_PARTY) {
		if(!validateInputTextFeild(1, 'partyId', 'partyName', 'error', partyNameErrMsg)) return false;
	} else {
		if(!validateDestinationForCopy()) return false;
		if(!validateDestinationTypesForCopy()) return false;
	}

	return true;
}

function formTypeWiseValidation() {

	if(!validateMainSection(0)) return false;
	if(!validateFormType()) return false;
	return validateFormTypeAmount();
}
/*
 * Validation for CT Form Type Wise Charges
 */

function ctFormTypeWiseValidation() {

	if(!validateMainSection(0)) return false;
	if(!validateCTFormType()) return false;
	if(!validateCTFormPackingType()) return false;
	if(!validatePackingTypeGrp()) return false;
	return validateCTFormTypeAmount();
}

//Validation from category type branch and party. its compulsory for all except. 
function validateMainSectionForRateConfigured() {

	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;

	return validateInputTextFeild(1, 'partyId', 'partyName', 'error', partyNameErrMsg);
}

function validateFixedMainSection() {
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	
	return validateInputTextFeild(1, 'partyId', 'partyName', 'error', partyNameErrMsg);
}

//Validation from category type branch and party. its compulsory for all except. 
function validateIncreaseDecreaseRateSection() {
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	
	if(!validateInputTextFeild(1, 'chargesDropDown4', 'chargesDropDown4', 'error', chargeErrMsg))
		return false;
	
	if(!validateInputTextFeild(1, 'increaseDecreaseAmount', 'increaseDecreaseAmount', 'error', amountEnterErrMsg))
		return false;
	
	return validateIncreaseAndDecreaseRateArea();
}

function weightSlabValidation() {
	if(!validateMinQty()) return false;
	if(!validateMaxQty()) return false;
	return validateWeightAmount();
}

function validateMinQty() {
	return validateInputTextFeild(1, 'minQty', 'minQty', 'error', "Add Min Quantity");
}

function validateMaxQty() {
	return validateInputTextFeild(1, 'maxQty', 'maxQty', 'error', "Add Max Quantity");
} 

function validateWeightAmount() {
	return validateInputTextFeild(1, 'weight', 'weight', 'error', "Add Weight Amount");
}

function updateSlabWeightValidation() {
	if(!validateSlaWeightDropDown()) return false;
	return validateEditWeight();
}

function validateSlaWeightDropDown() {
	return validateInputTextFeild(1, 'slabWeightDropDown', 'slabWeightDropDown', 'error', chargeErrMsg);
}

function validateEditWeight() {
	return validateInputTextFeild(1, 'editWeight', 'editWeight', 'error', "Add Weight Amount");
}

function quantityAmountValidation() {
	
	if(!validateQuantityAmt()) return false;
	
	return validateOtherQuantityAmt();
}

function validateApplOnQuantity() {
	return validateInputTextFeild(1, 'applOnQuantity', 'applOnQuantity', 'error', "Add Applicable Quantity");
}

function validateQuantityAmt() {
	return validateInputTextFeild(1, 'quantityAmt', 'quantityAmt', 'error', "Add Quantity Amount");
}

function validateOtherQuantityAmt() {
	return validateInputTextFeild(1, 'otherQuantityAmt', 'otherQuantityAmt', 'error', "Add Remaining Quantity Amount");
}

function validateDestinationCity() {
	return validateInputTextFeild(1, 'destinationCity', 'destinationCity', 'error', "Add Destination City");
}

function validateSlabSelectionOnFixSlab() {
	if($('#isFixedSlabAmt').prop("checked")
		&& (getValueFromInputField('slabs') == '0-0' || getValueFromInputField('slabs') == '0')) {
		showMessage('error', slabErrMsg);
		$('#isFixedSlabAmt').prop("checked", false);
	}
}

function hamaliSlabWiseValidation() {
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	if(!validateHamaliSlabs()) return false;
	
	return validateMinimumHamaliAmount();
}

function validateHamaliSlabs() {
	return validateInputTextFeild(1, 'slabs3', 'slabs3', 'error', slabErrMsg);
}

function validateMinimumHamaliAmount() {
	return validateInputTextFeild(1, 'minHamaliAmount', 'minHamaliAmount', 'error', minChargeAmountAmountErrMsg);
}

function validateCopyIncreaseDecreaseRateSection() {
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	
	if(!validateInputTextFeild(1, 'chargesDropDown6', 'chargesDropDown6', 'error', chargeErrMsg))
		return false;
	
	return validateInputTextFeild(1, 'copyIncreaseDecreaseAmount', 'copyIncreaseDecreaseAmount', 'error', amountEnterErrMsg);
}

function validatePackingTypes(selected) {
	if(selected.length == 0) {
		showMessage('error', packingTypeErrMsg);
		return false;
	}
	
	return true;
}

function validateAddMinimumPartyRatesData() {
	if(!validateCategoryType() 
		|| !validateBranch() 
		|| rateMasterConfiguration.showDestinationInMinimumValueConfig && !validateDestinationForMinimumRates()
		|| rateMasterConfiguration.showSlabSelectionInMinimumValueConfig && !validateSlabInMinimumValueConfig()
	) 
		return false;
	
	return !(rateMasterConfiguration.showPackingTypeInMinimumValueConfiguration && !validatePackingType());
}

function validateDestinationForMinimumRates() {
	if(!validateInputTextFeild(1, 'minValConfigDestination', 'minValConfigDestination', 'error', destinationTypeErrMsg))
		return false;
		
	if ($("#minValConfigMultiIdlist").find('td').length == 0) {
		if ($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
			showMessage('error', destinationBranchInfoMsg);
			changeTextFieldColor('minValConfigDestinationBranch', '', '', 'red');
			return false;
		} else if ($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
			showMessage('error', destinationAreaInfoMsg);
			changeTextFieldColor('minValConfigDestinationArea', '', '', 'red');
			return false;
		} else if ($('#minValConfigDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
			showMessage('error', destinationRegionInfoMsg);
			changeTextFieldColor('minValConfigDestinationRegion', '', '', 'red');
			return false;
		}
	}
	
	return true;
}

function validateSlabInMinimumValueConfig() {
	if ($('#slabs1').val() == 0) {
		showMessage('error', slabErrMsg);
		changeTextFieldColor('slabs1', '', '', 'red');
		return false;
	}
			
	return true;
}