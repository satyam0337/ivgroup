function minimumLrBookingTotal(configuration, wayBillType, grandTotal, branchId) {
	let	checkPackingType	= false;
	
	if(Number(wayBillType) == WAYBILL_TYPE_FOC || (configuration.doNotAllowToBookTopayLRWithAmount == 'true' || configuration.doNotAllowToBookTopayLRWithAmount == true) && Number(wayBillType) == WAYBILL_TYPE_TO_PAY)
		return true;
		
	if((configuration.checkingForMinimumLrBookingAmount == 'false' || configuration.checkingForMinimumLrBookingAmount == false) 
		&& (configuration.checkingForMinimumLrBookingAmountForPaid == 'false' || configuration.checkingForMinimumLrBookingAmountForPaid == false)
		&& (configuration.checkingForMinimumLrBookingAmountForToPay == 'false' || configuration.checkingForMinimumLrBookingAmountForToPay == false) 
		&& (configuration.checkingForMinimumLrBookingAmountForTBB == 'false' || configuration.checkingForMinimumLrBookingAmountForTBB == false))
		return true;
		
	if(configuration.checkingPackingTypeIdsToSkipMinimumAmountRestrictions == 'true' || configuration.checkingPackingTypeIdsToSkipMinimumAmountRestrictions == true) {
		let packingTypeIdList 		= (configuration.packingTypeIdsToSkipMinimumAmountRestrictions).split(',');
		
		if(typeof articleArray != 'undefined' && articleArray != null) {
			for(const element of articleArray) {
				if(element.packingTypeMasterId > 0 && isValueExistInArray(packingTypeIdList, element.packingTypeMasterId)) {
					checkPackingType	= true;
					break;
				}
			}
		} else if(typeof consignmentDetailsList != 'undefined') {
			for(const element of consignmentDetailsList) {
				if(isValueExistInArray(packingTypeIdList, element.packingTypeMasterId)) {
					checkPackingType	= true;
					break;
				}
			}
		} else if(typeof consigAddedtableRowsId != 'undefined' && consigAddedtableRowsId != undefined) {
			for(const element of consigAddedtableRowsId) {
				if($('#typeofPackingId' + element).html() > 0 && isValueExistInArray(packingTypeIdList, parseInt($('#typeofPackingId' + element).html()))) {
					checkPackingType	= true;
					break;
				}
			}
		}
	}
	
	let branchList 				= (configuration.branchesToSkipMinimumBookingAmountRestrictions).split(',');
	let branchExist				= isValueExistInArray(branchList, branchId);
	
	if(checkPackingType || branchExist) return true;
		
	if(configuration.checkingForMinimumLrBookingAmount == 'true' || configuration.checkingForMinimumLrBookingAmount == true) {
		let minimumBookingAmount	= Number(configuration.MinimumLrAmount);
			
		if(grandTotal < minimumBookingAmount) {
			showMessage('error', 'LR Amount Cannot Be Less Than ' + minimumBookingAmount + ' Rs !');
			return false;
		}
	} else {
		let minimumBookingAmountForPaid		= Number(configuration.miniMumBookingAmountForPaid)
		let minimumBookingAmountForToPay 	= Number(configuration.minimumBookingAmountForToPay)
		let minimumBookingAmountForTBB 		= Number(configuration.minimumBookingAmountForTBB)
	
		if((configuration.checkingForMinimumLrBookingAmountForPaid == 'true' || configuration.checkingForMinimumLrBookingAmountForPaid == true) 
			&& wayBillType == WAYBILL_TYPE_PAID
			&& grandTotal < minimumBookingAmountForPaid) {
			showMessage('error', 'LR Amount Cannot Be Less Than ' + minimumBookingAmountForPaid + ' Rs !');
			return false;
		}
			
		if((configuration.checkingForMinimumLrBookingAmountForToPay == 'true' || configuration.checkingForMinimumLrBookingAmountForToPay == true) 
			&& wayBillType == WAYBILL_TYPE_TO_PAY
			&& grandTotal < minimumBookingAmountForToPay) {
			showMessage('error', 'LR Amount Cannot Be Less Than ' + minimumBookingAmountForToPay + ' Rs !');
			return false;
		}
			
		if((configuration.checkingForMinimumLrBookingAmountForTBB == 'true' || configuration.checkingForMinimumLrBookingAmountForTBB == true) && wayBillType == WAYBILL_TYPE_CREDIT
			&& grandTotal < minimumBookingAmountForTBB) {
			showMessage('error', 'LR Amount Cannot Be Less Than ' + minimumBookingAmountForTBB + ' Rs !');
			return false;
		}
	}
	
	return true;
}

function isCalculateCommissionOnDiffRate(configuration, wayBillType, chargeTypeId) {
	return (configuration.allowCalculateCommissionOnDiffBookingRate == 'true' || configuration.allowCalculateCommissionOnDiffBookingRate == true) 
		&& chargeTypeId == CHARGETYPE_ID_WEIGHT
		&& (wayBillType == WAYBILL_TYPE_TO_PAY || wayBillType == WAYBILL_TYPE_PAID)
}

function validateFreightChargeConfigAmount(wayBillType, configuration, famt, subRegionId) {
	if (configuration.validateToPayAmountOnBasicFreightSubRegionLevel == 'true')
		return isSubregionForSkip(subRegionId, configuration) || minimumFreigtValidationForTopayLR(configuration, wayBillType, famt);
	
	return minFreightAmountValidation(wayBillType, configuration, famt);
}

function isSubregionForSkip(subRegionId, configuration) {
	if(configuration.exceptionalSubRegionIdsForValidateToPayAmount != undefined) {
		let subregionList	= (configuration.exceptionalSubRegionIdsForValidateToPayAmount).split(',');
		let checkSubRegion	= isValueExistInArray(subregionList, subRegionId);
				
		if (checkSubRegion)
			return true;
	}
	
	return false;
}

function minimumFreigtValidationForTopayLR(configuration, wayBillType, famt) {
	let amountForRestriction = Math.round(configuration.amountForRestrictionForToPayBooking);

	if ((configuration.amountRestrictionForToPayBooking == true || configuration.amountRestrictionForToPayBooking == 'true')
		&& famt < amountForRestriction && wayBillType == WAYBILL_TYPE_TO_PAY) {
		showMessage('error', "You Cannot Book To Pay LR For Freight Amount Less Than  " + amountForRestriction + " !");
		return false;
	}
	
	return true;
}

function minFreightAmountValidation(wayBillType, configuration, famt) {
	if(wayBillType == WAYBILL_TYPE_FOC
		|| wayBillType == WAYBILL_TYPE_TO_PAY && (configuration.doNotAllowToBookTopayLRWithAmount == 'true' || configuration.doNotAllowToBookTopayLRWithAmount == true)
		|| configuration.restrictBookingOnMinFreightAmount == 'false' || configuration.restrictBookingOnMinFreightAmount == false
	) return true;
	
	let minFreightAmt			= configuration.minFreightAmt;
	let minFreightAmtForPaidLR	= configuration.minFreightAmtForPaidLR;
	
	if (minFreightAmt > 0 && famt < Number(minFreightAmt)) {
		showMessage('error', 'Minimum Freight Amount should be ' + minFreightAmt + ' ! ');
		return false;
	} else if (wayBillType == WAYBILL_TYPE_PAID && minFreightAmtForPaidLR > 0 && famt < Number(minFreightAmtForPaidLR)) {
		showMessage('error', 'You cannot Book Paid LR for Frieght Amount Less than ' + minFreightAmtForPaidLR + ' ! ');
		return false;
	} else if (!minimumFreigtValidationForTopayLR(configuration, wayBillType, famt))
		return false;
	
	return true;
}