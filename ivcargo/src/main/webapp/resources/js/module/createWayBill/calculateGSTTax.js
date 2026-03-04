/**
 * 
 */

function calculateGSTTaxes(taxes, taxPaidByEle, grandtotal, discAmount, sourceBranchStateId, destinationBranchStateId) {
	
	if ($('#billSelection').val() == BOOKING_WITHOUT_BILL && configuration.doNotCalculateGSTForEstimateLR == 'true')
		return grandtotal;

	let taxPaidByVal			= $('#' + taxPaidByEle).val();
	let wayBillType				= $('#wayBillType').val();
	let applyCgstAndSgst			= false;
	let checkSrcDestBranchStateId	= true;

	leastTaxableAmount			= 0;
	let taxAmount				= 0;
	let finalTaxAmount			= 0;
	let isGSTNumberAvailable	= checkGSTNumberAvailable();
	let consignoCorprGstn	= null;
	let consigneeCorprGstn	= null;
	
	if(isGSTNumberWiseBooking()) {
		consignoCorprGstn		= $('#consignoCorprGstn').val();
		consigneeCorprGstn		= $('#consigneeCorpGstn').val();
	} else {
		consignoCorprGstn		= $('#consignorGstn').val();
		consigneeCorprGstn		= $('#consigneeGstn').val();
	}
	
	if(wayBillType == WAYBILL_TYPE_CREDIT && configuration.isAllowToShowBillingPartyGSTN == 'true')
		consignoCorprGstn = $('#billingGstn').val();
	
	let	consignorStateCode		= getStateCode(consignoCorprGstn);
	let	consigneeStateCode		= getStateCode(consigneeCorprGstn);
	let	loggedInBranchStateCode = getStateCode(loggedInBranch.gstn);
	let	destinationStateCode	= getStateCode(destinationBranchGstn);
	let	tbbPartyStateCode		= getStateCode(tbbPartyGstn);	
		
	if(configuration.applyCgstSgstOnBillingPartyState == 'true' && wayBillType == WAYBILL_TYPE_CREDIT) {
		if(!jQuery.isEmptyObject(consignorStateCode) && consignorStateCode == loggedInBranchStateCode) {
			applyCgstAndSgst = true;
			$('#tax' + IGST_MASTER_ID).val("0");
		} else {
			checkSrcDestBranchStateId = false;
			$('#tax' + SGST_MASTER_ID).val("0");
			$('#tax' + CGST_MASTER_ID).val("0");
		}
	}

	if(configuration.applyOnlyCgstSgstForPaidLrs == 'true' && wayBillType == WAYBILL_TYPE_PAID)
		applyCgstAndSgst = true;
		
	let isGstCodeMatchedWithPartyGstSateCode = isFixedGstCodeMatchedWithPartyGstSateCode(wayBillType, consignorStateCode, consigneeStateCode, tbbPartyStateCode);
		
	if(!jQuery.isEmptyObject(taxes)) {
		for (const element of taxes) {
			let tax				= element;
			taxAmount			= 0.00;
			$('#tax' + tax.taxMasterId).val(0);

			leastTaxableAmount	= tax.leastTaxableAmount;
			/*
			 * destnationBranchId is set in autocomplete.js 
			 */
			if(typeof destnationBranchIdForOverNite !== 'undefined' && destnationBranchIdForOverNite > 0)
				leastTaxableAmount = 0;
				
			if(parseInt(taxPaidByVal) == TAX_PAID_BY_TRANSPORTER_ID) {
				if(discAmount > leastTaxableAmount) {
					if (tax.isTaxPercentage) {
						if(configuration.showGstType == 'true') {
							if($('#gstType').val() == SGST_MASTER_ID && (isSgstOrCgst(tax))
							|| $('#gstType').val() == IGST_MASTER_ID && tax.taxMasterId == IGST_MASTER_ID)
							taxAmount	= calculateTax(discAmount, tax);
						} else {
							if(configuration.gstCalculateOnPartyAndBranchStateCode == 'true') {
								if(configuration.validatePartyGstnWithGstnCodeFromDb == 'true') {
									if(isGstCodeMatchedWithPartyGstSateCode && isSgstOrCgst(tax) || !isGstCodeMatchedWithPartyGstSateCode && tax.taxMasterId == IGST_MASTER_ID)
										taxAmount	= calculateTax(discAmount, tax);
								} else if(configuration.calculateTaxIfGstnFoundForPaidLrs == 'true' && wayBillType == WAYBILL_TYPE_PAID) {
									if(consignorStateCode > 0 && (loggedInBranchStateCode > 0 && consignorStateCode == loggedInBranchStateCode) 
									|| (stateGSTCode > 0 && consignorStateCode == stateGSTCode) ) {
										if(isSgstOrCgst(tax))
											taxAmount	= calculateTax(discAmount, tax);
									} else if(consignorStateCode > 0 && loggedInBranchStateCode > 0	 && tax.taxMasterId == IGST_MASTER_ID)
										taxAmount	= calculateTax(discAmount, tax);
								} else	if(configuration.checkConsigneeGstWithDestinationBranchGst == 'true' && wayBillType == WAYBILL_TYPE_TO_PAY) {//checkConsigneeGstWithDestinationBranchGst for ToPay Lrs
									if(consigneeStateCode > 0 &&  destinationStateCode > 0 && consigneeStateCode == destinationStateCode) {
										if(isSgstOrCgst(tax))
											taxAmount	= calculateTax(discAmount, tax);
									} else if(consigneeStateCode > 0 && destinationStateCode > 0 && tax.taxMasterId == IGST_MASTER_ID)
										taxAmount	= calculateTax(discAmount, tax);
								} else if(configuration.checkBillingPartyGstWithBillingBranchGst == 'true' && wayBillType  == WAYBILL_TYPE_CREDIT) {
									if(tbbPartyStateCode > 0 && tbbPartyBranchStateCode > 0 &&	tbbPartyStateCode == tbbPartyBranchStateCode) {
										if(isSgstOrCgst(tax))
											taxAmount	= calculateTax(discAmount, tax);
									} else if(tbbPartyStateCode > 0 && tbbPartyBranchStateCode > 0 && tax.taxMasterId == IGST_MASTER_ID)
										taxAmount	= calculateTax(discAmount, tax);
								} else if(Number(configuration.partyTypeToGstCalculateOnPartyAndBranchStateCode) == CUSTOMER_TYPE_CONSIGNOR_ID
									|| wayBillType != WAYBILL_TYPE_TO_PAY) {//Consignor in all LR Type
									if(consignorStateCode == 0 || consignorStateCode == loggedInBranchStateCode || consignorStateCode == stateGSTCode) {
										if(isSgstOrCgst(tax))
											taxAmount	= calculateTax(discAmount, tax);
									} else if(tax.taxMasterId == IGST_MASTER_ID)
										taxAmount	= calculateTax(discAmount, tax);
								} else if(consigneeStateCode == 0 || (consigneeStateCode == loggedInBranchStateCode || consigneeStateCode == stateGSTCode)) {
									if(isSgstOrCgst(tax))
										taxAmount	= calculateTax(discAmount, tax);
								} else if(tax.taxMasterId == IGST_MASTER_ID)
									taxAmount	= calculateTax(discAmount, tax);
							} else if(sourceBranchStateId == destinationBranchStateId && checkSrcDestBranchStateId || applyCgstAndSgst) {
								if(isSgstOrCgst(tax))
									taxAmount	= calculateTax(discAmount, tax);
							} else if(tax.taxMasterId == IGST_MASTER_ID)
								taxAmount	= calculateTax(discAmount, tax);
						}
						
						finalTaxAmount += taxAmount;
					}
				} else
					$('#tax' + tax.taxMasterId).val(taxAmount)
			} else
				$('#tax' + tax.taxMasterId).val(taxAmount);

			if (isGSTNumberAvailable)
				$('#tax' + tax.taxMasterId).val(0.00);
		}
	}
	
	if(configuration.gstCalculateOnPartyAndBranchStateCode == 'true' || !isGSTNumberAvailable) {
		if(configuration.applyIncludedTax == 'false')
			grandtotal	= grandtotal + finalTaxAmount;
	}
	
	if(configuration.applyIncludedTax == 'true') {
		$('#charge1').val(Math.round(discAmount - finalTaxAmount));

		let total	= getTotalAmt();
		
		$("#totalAmt").val(total);
		
		grandtotal	= finalTaxAmount + Number(total);
	}

	return grandtotal;
}

function checkGSTNumberAvailable() {
	let consignorGSTNVal	= null;
	let consigneeGSTNVal	= null;
	
	if(isGSTNumberWiseBooking()) {
		consignorGSTNVal		= $('#consignoCorprGstn').val();
		consigneeGSTNVal		= $('#consigneeCorpGstn').val();
	} else {
		consignorGSTNVal		= $('#consignorGstn').val();
		consigneeGSTNVal		= $('#consigneeGstn').val();
	}

	let wayBillType				= $('#wayBillType').val();
	
	if(wayBillType == WAYBILL_TYPE_CREDIT && configuration.isAllowToShowBillingPartyGSTN == 'true')
		consignorGSTNVal = $('#billingGstn').val();
	
	let isGSTNumberAvailable	= true;

	if(configuration.allowGSTOnTransporterAtAnyCondition == 'true' || configuration.customGSTPaidByOnWayBillType == 'true' || jQuery.isEmptyObject(consignorGSTNVal) && jQuery.isEmptyObject(consigneeGSTNVal))
		return false;
		
	if(configuration.customSetGstPaidByTransporterOnGstNumber == 'true' || configuration.customSetGstPaidByExemptedOnParty == 'true') {
		if((wayBillType == WAYBILL_TYPE_PAID || wayBillType == WAYBILL_TYPE_CREDIT) && jQuery.isEmptyObject(consignorGSTNVal)
			|| wayBillType == WAYBILL_TYPE_TO_PAY && jQuery.isEmptyObject(consigneeGSTNVal))
			isGSTNumberAvailable	= false;
	}
	
	if (wayBillType == WAYBILL_TYPE_CREDIT && configuration.gstPaidByTransporterAtAnyConditionInTbbLr == 'true') 
		isGSTNumberAvailable	= false;

	if(configuration.calculateTaxOnlyOnTaxTypeFCM == 'true' && Number($('#taxTypeId').val()) > 0  && Number($('#taxTypeId').val()) == FCM)
		isGSTNumberAvailable	= false;
				
	if (configuration.disableTaxCalculationIfPartyGSTAvailable == 'true' && wayBillType == WAYBILL_TYPE_CREDIT && !jQuery.isEmptyObject(consignorGSTNVal)) 
		isGSTNumberAvailable = true;
	
	return isGSTNumberAvailable;
}

function isSgstOrCgst(tax) {
	return tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID;
}

function isIgst(tax) {
	return tax.taxMasterId == IGST_MASTER_ID;
}

function isFixedGstCodeMatchedWithPartyGstSateCode(wayBillType, consignorStateCode, consigneeStateCode, tbbPartyStateCode) {
	return (configuration.gstCodeToValidateWithPartyGstn == consignorStateCode && wayBillType == WAYBILL_TYPE_PAID)
				|| (configuration.gstCodeToValidateWithPartyGstn == consigneeStateCode && wayBillType == WAYBILL_TYPE_TO_PAY) 
				|| (configuration.gstCodeToValidateWithPartyGstn == tbbPartyStateCode && wayBillType == WAYBILL_TYPE_CREDIT)
}

function validateSTPaidByOnGSTN() {
	let gtsn	= null;
	let wayBillType				= $('#wayBillType').val();
	
	if(configuration.partyExemptedChecking == 'true') {
		if(wayBillType == WAYBILL_TYPE_CREDIT) {
			if(configuration.isAllowToShowBillingPartyGSTN == 'true')
				gtsn = $('#billingGstn').val();
			else
				gtsn = $('#consignorGstn').val();
			
			isExempted = isTBBPartyExempted;
		} else if(wayBillType == WAYBILL_TYPE_TO_PAY) {
			gtsn = document.getElementById('consigneeGstn').value;
			isExempted = isConsigneeExempted;
		} else if (wayBillType == WAYBILL_TYPE_PAID) {
			gtsn = $('#consignorGstn').val();
			isExempted = isConsignorExempted;
		}

		if(gtsn != undefined && (gtsn != null && gtsn != "")) {
			isExempted = false;
			$('#STPaidBy').removeAttr('disabled','false');
			setDefaultSTPaidBy(Number($('#wayBillType').val()));
			
			if(wayBillType == WAYBILL_TYPE_CREDIT)
				$('#billingExempted_' + $('#billingPartyId').val()).val(false);
			else if(wayBillType == WAYBILL_TYPE_TO_PAY)
				$('#cneeExempted_' + $('#consigneePartyMasterId').val()).val(false);
			else if(wayBillType == WAYBILL_TYPE_PAID)
				$('#cnorExempted_' + $('#partyMasterId').val()).val(false);
		} else if(isExempted != undefined && (isExempted == true || isExempted == 'true')) {
			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			$('#STPaidBy').attr('disabled','true');
		} else {
			$('#STPaidBy').removeAttr('disabled','false');
			setDefaultSTPaidBy(Number(wayBillType));
				
			if(wayBillType == WAYBILL_TYPE_CREDIT)
				$('#billingExempted_' + $('#billingPartyId').val()).val(true);
			else if(wayBillType == WAYBILL_TYPE_TO_PAY)
				$('#cneeExempted_' + $('#consigneePartyMasterId').val()).val(true);
			else if(wayBillType == WAYBILL_TYPE_PAID)
				$('#cnorExempted_' + $('#partyMasterId').val()).val(true);
		}
	}
}

function setSTPaidByOnGSTNumber() {
	if ($('#billSelection').val() == BOOKING_WITHOUT_BILL && configuration.doNotCalculateGSTForEstimateLR == 'true')
		return;
			
	let consignorGSTNVal	= null;
	let consigneeGSTNVal	= null;
			
	if(isGSTNumberWiseBooking()) {
		consignorGSTNVal		= $('#consignoCorprGstn').val();
		consigneeGSTNVal		= $('#consigneeCorpGstn').val();
	} else {
		consignorGSTNVal		= $('#consignorGstn').val();
		consigneeGSTNVal		= $('#consigneeGstn').val();
	}
	
	let consignorNameVal			= $('#consignorCorpId').val();
	let consigneeNameVal			= $('#consigneePartyMasterId').val();
	let billingPartyNameVal			= $('#billingPartyId').val();

	let wayBillType				= $('#wayBillType').val();
	let hideStPaidByExempted	= true;
	
	var billSelectionId = Number($('#billSelection').val());
	var taxTypeId = Number($('#taxTypeId').val());
	
	if(wayBillType == WAYBILL_TYPE_CREDIT && configuration.isAllowToShowBillingPartyGSTN == 'true')
		consignorGSTNVal = $('#billingGstn').val();

	let isConsignorGSTNumberAvailable	= !jQuery.isEmptyObject(consignorGSTNVal);
	let isConsigneeGSTNumberAvailable	= !jQuery.isEmptyObject(consigneeGSTNVal);
	let gstNumberArray					= configuration.gstNumbersForStPaidByExempted.split(',');	

	if(configuration.allowGSTOnTransporterAtAnyCondition == 'true') {
		if(configuration.allowToChangeGStPaidBy == 'true' && !isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable)
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);

		return;
	} else if(configuration.allowToChangeGStPaidBy == 'true' && setDefaultStPaidBy)
		return;
	
	if(configuration.changeStPaidbyOnPartyGSTN == 'true') {
		if(wayBillType == WAYBILL_TYPE_PAID) {
			if(!isConsignorGSTNumberAvailable)
				$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID)
			else
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID)
		} else if(wayBillType == WAYBILL_TYPE_TO_PAY) {
			if(!isConsigneeGSTNumberAvailable)
				 $('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID)
			else
				 $('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID)
		} else if(wayBillType == WAYBILL_TYPE_CREDIT) {
			if(consignorNameVal == billingPartyNameVal && isConsignorGSTNumberAvailable)
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
			else if(consigneeNameVal == billingPartyNameVal && isConsigneeGSTNumberAvailable)
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
			else
				$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
		}

		if(configuration.calculateTaxOnlyOnTaxTypeFCM == 'true')
			setCustomStPaidByForTax(isConsignorGSTNumberAvailable, isConsigneeGSTNumberAvailable);
	}else if(configuration.calculateTaxOnlyOnTaxTypeFCM == 'true'){
		setSTPaidOnTaxType(billSelectionId, taxTypeId);
	}else {
		if(wayBillType == WAYBILL_TYPE_PAID || wayBillType == WAYBILL_TYPE_CREDIT) {
			if(configuration.customStPaidByExempted == 'true' && !isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable && $("#totalAmt").val() > taxableAmount) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				return;
			} else if(configuration.customStPaidByExempted == 'true' && !isConsignorGSTNumberAvailable && $("#totalAmt").val() > taxableAmount) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			} else if(isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
				if(typeof isTransporterForConsignor !== 'undefined' && isTransporterForConsignor)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
			} else if(isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable) {
				if(configuration.showStPaidBySelect == 'true') {
					if($("#totalAmt").val() < 750)
						$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
				} else if(typeof isTransporterForConsignor !== 'undefined' && isTransporterForConsignor)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
			} else if(!isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable) {
				if(configuration.setGSTPaidByOnGSTNumber == 'true')
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
				else
					$('#STPaidBy').val(setDefaultGSTPaidBy($('#wayBillType').val()));
			} else if (!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
				if(configuration.setGSTPaidByOnGSTNumber == 'true')
					$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
			
			if(configuration.customGSTPaidByOnWayBillType == 'true' && !isConsignorGSTNumberAvailable) {
				if(configuration.hideStPaidByTransporter == 'true')
					$('#STPaidBy').val(setDefaultGSTPaidBy($('#wayBillType').val()));
				else
					$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
					
			if(configuration.customSetGstPaidByTransporterOnGstNumber == 'true' && !isConsignorGSTNumberAvailable) {
				if(typeof isTransporterForConsignor !== 'undefined' && isTransporterForConsignor)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
					
			if(configuration.customSetGstPaidByOnGstnAndBookingTotal == 'true') {
				if(isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable)
					$('#STPaidBy'). val(TAX_PAID_BY_CONSINGOR_ID);
						
				if(!isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable)
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
						
				if(!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
					if(configuration.freezeGSTPaidNotApplicableONGSTNumber == 'true')
						$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
					else
						$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
				}
			}
		} else if(wayBillType == WAYBILL_TYPE_TO_PAY) {
			if(configuration.customStPaidByExempted == 'true'
				&& !isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable && $("#totalAmt").val() > taxableAmount) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				return;
			} else if(configuration.customStPaidByExempted == 'true'
				&& !isConsigneeGSTNumberAvailable && $("#totalAmt").val() > taxableAmount) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			} else if(!isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable) {
				if(typeof isTransporterForConsignee !== 'undefined' && isTransporterForConsignee)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
			} else if(isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable) {
				if(configuration.showStPaidBySelect == 'true') {
					if($("#totalAmt").val() < 750)
						$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
				} else if(typeof isTransporterForConsignee !== 'undefined' && isTransporterForConsignee)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
			} else if(isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
				if(configuration.setGSTPaidByOnGSTNumber == 'true')
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
				else
					$('#STPaidBy').val(setDefaultGSTPaidBy($('#wayBillType').val()));
			} else if (!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
				if(configuration.setGSTPaidByOnGSTNumber == 'true')
					$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
			
			if(configuration.customGSTPaidByOnWayBillType == 'true') {
				if(!isConsigneeGSTNumberAvailable) {
					if(configuration.hideStPaidByTransporter == 'true')
						$('#STPaidBy').val(setDefaultGSTPaidBy($('#wayBillType').val()));
					else
						$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
				}
			}

			if(configuration.customSetGstPaidByTransporterOnGstNumber == 'true' && !isConsigneeGSTNumberAvailable) {
				if(typeof isTransporterForConsignee !== 'undefined' && isTransporterForConsignee)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				else
					$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
					
			if(configuration.customSetGstPaidByOnGstnAndBookingTotal == 'true') {
				if((isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable))
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
						
				if((!isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable))
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
					
				if((isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable))
					$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
						
				if(!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) {
					if(typeof configuration !== 'undefined' && configuration.freezeGSTPaidNotApplicableONGSTNumber == 'true')
						$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
					else
						$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
				}
			}
		}
	}
	
	if(configuration.setStPaidByExemptedOnGSTNNumber == 'true' && (wayBillType == WAYBILL_TYPE_PAID || wayBillType == WAYBILL_TYPE_CREDIT) && isValueExistInArray(gstNumberArray, consignorGSTNVal))
		$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	else if(configuration.setStPaidByExemptedOnGSTNNumber == 'true' && wayBillType == WAYBILL_TYPE_TO_PAY && isValueExistInArray(gstNumberArray, consigneeGSTNVal))
		$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	
	if(configuration.customSetGstPaidByTransporterOnGstNumber == 'true') {
		if(!isConsigneeGSTNumberAvailable && !isConsignorGSTNumberAvailable) {
			if(typeof isTransporterForConsignor !== 'undefined' && isTransporterForConsignor)
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			else if(typeof isTransporterForConsignee !== 'undefined' && isTransporterForConsignee)
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			else
				$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
		}
	}
	
	if(configuration.customGSTPaidByOnWayBillType == 'false'
		&& !isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable && discAmount > taxableAmount) {
		if(configuration.hideStPaidByTransporter == 'true') {
			if(configuration.freezeGSTPaidNotApplicableONGSTNumber == 'true')
				$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
			else
				$('#STPaidBy').val(setDefaultGSTPaidBy($('#wayBillType').val()));
		} else if(typeof isTransporterForConsignor !== 'undefined' && isTransporterForConsignor)
			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
		else if(typeof isTransporterForConsignee !== 'undefined' && isTransporterForConsignee)
			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
		else
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
	}
	
	if(configuration.hideStPaidByExempted == 'false')
		hideStPaidByExempted	= false;
		
	if(typeof isConsignmentExempted !== 'undefined' && (isConsignmentExempted == 'true' || isConsignmentExempted == true) && !hideStPaidByExempted)
		$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	
	if(typeof notAplicablePackingTypeId !== 'undefined' && notAplicablePackingTypeId)
		$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	
	if(configuration.showStPaidBySelect == 'true') {
		if(isConsignorGSTNumberAvailable && isConsigneeGSTNumberAvailable) {
			if($("#totalAmt").val() >= 750) {
				removeOption('STPaidBy', TAX_PAID_BY_NOT_APPLICABLE_ID, TAX_PAID_BY_NOT_APPLICABLE_NAME);

				gstPaidSelectExists = 0 != $('#STPaidBy option[value=-1]').length;

				if(!gstPaidSelectExists)
					$('#STPaidBy').prepend("<option value='-1' selected='selected'>--Select--</option>");
			} else {
				removeOption('STPaidBy', -1, '--Select--');
				gstPaidSelectExists	= false;
					
				if(configuration.hideStPaidByNotApplicable == 'false') {
					removeOption('STPaidBy', TAX_PAID_BY_NOT_APPLICABLE_ID, TAX_PAID_BY_NOT_APPLICABLE_NAME);
					createOption('STPaidBy', TAX_PAID_BY_NOT_APPLICABLE_ID, TAX_PAID_BY_NOT_APPLICABLE_NAME);
				}
			}
		} else {
			removeOption('STPaidBy', -1, '--Select--');
			gstPaidSelectExists	= false;
				
			if(configuration.hideStPaidByNotApplicable == 'false') {
				removeOption('STPaidBy', TAX_PAID_BY_NOT_APPLICABLE_ID, TAX_PAID_BY_NOT_APPLICABLE_NAME);
				createOption('STPaidBy', TAX_PAID_BY_NOT_APPLICABLE_ID, TAX_PAID_BY_NOT_APPLICABLE_NAME);
			}
		}
		
		if(!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable && configuration.freezeGSTPaidNotApplicableONGSTNumber == 'true')
			$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
	}
	
	if(configuration.ChangeSTPaidToExempetdIfGSTNumberAvailable == 'true') {
		if((!isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) || (wayBillType == WAYBILL_TYPE_TO_PAY && isConsignorGSTNumberAvailable && !isConsigneeGSTNumberAvailable) || ((wayBillType == WAYBILL_TYPE_CREDIT || wayBillType == WAYBILL_TYPE_PAID) && isConsigneeGSTNumberAvailable && !isConsignorGSTNumberAvailable)) 
			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	}
			
	if(configuration.gstPaidByTransporterAtAnyConditionInTbbLr =='true' && wayBillType == WAYBILL_TYPE_CREDIT)
		$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
}

function validateSTPaidSelection() {
	if(configuration.validateGSTPaidOnTransporter == 'false')
		return;

	let taxPaidByVal			= $('#STPaidBy').val(); 
	let isGSTNumberAvailable	= checkGSTNumberAvailable();

	if(configuration.disableTaxCalculationIfPartyGSTAvailable == 'false' && isGSTNumberAvailable && taxPaidByVal == TAX_PAID_BY_TRANSPORTER_ID) {
		$('#STPaidBy').val(0);
		alert('You cannot select GST Paid by Transporter if Consignor or Consignee GST no. available !');
	}
}

function setDefaultGSTPaidBy(waybillTypeId) {
	let typeId	= 0;
	
	if(Number(waybillTypeId) == WAYBILL_TYPE_PAID)
		typeId		= Number(configuration.DefaultSTPaidByForPaidLR);
	else if(Number(waybillTypeId) == WAYBILL_TYPE_TO_PAY)
		typeId		= Number(configuration.DefaultSTPaidByForToPayLR)
	else if(Number(waybillTypeId) == WAYBILL_TYPE_CREDIT)
		typeId		= Number(configuration.DefaultSTPaidByForTBBLR);
	else if(Number(waybillTypeId) == WAYBILL_TYPE_FOC)
		typeId		= Number(configuration.DefaultSTPaidByForFOCLR);
	else
		typeId		= Number(configuration.DefaultSTPaidBy);
	
	return typeId;
}


function calculateTax(discAmount, tax) {
	let taxAmount	= 0;
	
	if(configuration.applyIncludedTax == 'true') {
		taxAmount	= Number(((discAmount * tax.taxAmount) / (100 + tax.taxAmount)));
		let amt		= discAmount - taxAmount;
		taxAmount	= Number(((tax.taxAmount * amt) / 100).toFixed(2));
		taxAmount	= Math.round(taxAmount);
	} else
		taxAmount	= Number(((tax.taxAmount) * discAmount / 100).toFixed(2));
	
	if(configuration.doNotCalculateAutomaticTax == 'false')
		$('#tax' + tax.taxMasterId).val(taxAmount);
	
	return taxAmount ;
}

function calculateVATTax(taxes, grandtotal, discAmount) {
	let finalTaxAmount	= 0;
	
	if(!jQuery.isEmptyObject(taxes)) {
		for (const element of taxes) {
			let tax					= element;
			let leastTaxableAmount	= tax.leastTaxableAmount;
			let taxAmount			= 0.00;

			if(discAmount > leastTaxableAmount) {
				if (tax.isTaxPercentage)
					taxAmount		= calculateTax(discAmount, tax);
				else
					taxAmount		= element.taxAmount;

				finalTaxAmount	+= taxAmount;
			}

			if(configuration.doNotCalculateAutomaticTax == 'false')
				$('#tax' + tax.taxMasterId).val(taxAmount);
		}
	}
	
	if(configuration.doNotCalculateAutomaticTax == 'true')
		grandtotal	= 0;
	
	return grandtotal + finalTaxAmount;
}

function validateSTPaidOnEstimateBooking() {
	if($('#billSelection').val() == BOOKING_WITHOUT_BILL && configuration.doNotCalculateGSTForEstimateLR == 'true') {
		$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
		return false;
	}
	
	return true;
}

function setCustomStPaidByForTax(isConsignorGSTNumberAvailable, isConsigneeGSTNumberAvailable) {
	if(configuration.showTaxType == 'false')
		return;

	let wayBillType 	= $('#wayBillType').val();
	
	let consignorNameVal			= $('#consignorCorpId').val();
	let consigneeNameVal			= $('#consigneePartyMasterId').val();
	let billingPartyNameVal			= $('#billingPartyId').val();
	
	if($('#taxTypeId').val() != undefined && Number($('#taxTypeId').val()) > 0 && Number($('#taxTypeId').val()) == FCM)
		$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID)
	else if(wayBillType == WAYBILL_TYPE_PAID && !isConsignorGSTNumberAvailable)
		$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
	else if (wayBillType == WAYBILL_TYPE_TO_PAY && !isConsigneeGSTNumberAvailable)
		$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
	else if(wayBillType == WAYBILL_TYPE_CREDIT && ((consignorNameVal == billingPartyNameVal && !isConsignorGSTNumberAvailable) || (consigneeNameVal == billingPartyNameVal && !isConsigneeGSTNumberAvailable)))
		$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
}