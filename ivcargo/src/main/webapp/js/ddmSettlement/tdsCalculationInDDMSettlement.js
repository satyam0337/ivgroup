/**
 * 
 */

function calTDSAmount(id, wayBillId, wayBillTypeId) {
	
	var billAmount 		= $('#deliveryAmt_' + wayBillId).val();
	var tdsAmount		= $('#tdsAmount_' + wayBillId).val();
	var tdsOnAmount		= 0;
	var tdsRate			= 0;
	
	if(id == 'tdsAmount_' + wayBillId) {
		var tdsAmount		= parseInt(tdsAmount);  
		
		if(billAmount > 0)
			$('#actBillAmount_' + wayBillId).val(parseInt(billAmount) - tdsAmount);
		
		$('#tdsOnAmount_' + wayBillId).val(getTDSOnAmount(wayBillId, wayBillTypeId));
	} else {
		tdsRate					= parseFloat(LMTDeliveryTimeTDSRate, 10);  //LMTDeliveryTimeTDSRate //Comming from property file and GenericDDMSettlement.js

		tdsOnAmount 			= getTDSOnAmount(wayBillId, wayBillTypeId);
		
		if(isTDSAllowInPercent)
			tdsAmount			= Math.round((tdsOnAmount * tdsRate) / 100);
		else
			tdsAmount			= Math.round($('#tdsAmount_' + wayBillId).val());
		
		$('#tdsOnAmount_' + wayBillId).val(tdsOnAmount);
		$('#tdsAmount_' + wayBillId).val(tdsAmount);
		$('#actBillAmount_' + wayBillId).val(Math.round(parseInt(billAmount) - tdsAmount));
	}
}


function getTDSOnAmount(wayBillId, wayBillTypeId) {
	
	var deliveryPaymentType		= $('#paymentType_' + wayBillId).val();
	var tdsOnAmount				= 0;
	var delChrgsAmtForTDSCalc	= 0;
	var bgkTimeGrandTotal		= 0;
	var dlyTimeServiceTaxAmt	= 0;
	var dlyTimeDiscountAmt		= 0;
	
	if(deliveryPaymentType == PAYMENT_TYPE_BILL_CREDIT_ID)
		return 0;
	
	if(deliveryPaymentType == PAYMENT_TYPE_CASH_ID
			|| deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID
			|| deliveryPaymentType == PAYMENT_TYPE_ONLINE_RTGS_ID
			|| deliveryPaymentType == PAYMENT_TYPE_ONLINE_NEFT_ID
			|| deliveryPaymentType == PAYMENT_TYPE_CREDIT_CARD_ID
			|| deliveryPaymentType == PAYMENT_TYPE_DEBIT_CARD_ID
			|| deliveryPaymentType == PAYMENT_TYPE_IMPS_ID
			|| deliveryPaymentType == PAYMENT_TYPE_PAYTM_ID
			|| deliveryPaymentType == PAYMENT_TYPE_UPI_ID
			|| deliveryPaymentType == PAYMENT_TYPE_PHONE_PAY_ID
			|| deliveryPaymentType == PAYMENT_TYPE_GOOGLE_PAY_ID
			|| deliveryPaymentType == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
	
		bgkTimeGrandTotal		= $('#bookingTimeGrandTotal_' + wayBillId).val();
		
		if(isNaN(bgkTimeGrandTotal))
			bgkTimeGrandTotal	= 0;
		else
			bgkTimeGrandTotal	= parseInt(bgkTimeGrandTotal);
		
		delChrgsAmtForTDSCalc 	= getDeliveryChargesAmtAfterExcludedChargesAmount(wayBillId);
		dlyTimeServiceTaxAmt	= getDeliveryTimeSTAmount(wayBillId);
		
		if ($('#discount_' + wayBillId).exists()) {
			if($('#discount_' + wayBillId).val() == '')
				$('#discount_' + wayBillId).val(0);
			
			dlyTimeDiscountAmt = parseFloat($('#discount_' + wayBillId).val());
		}
		
		if(parseInt(wayBillTypeId) == WAYBILL_TYPE_TO_PAY)
			tdsOnAmount	= parseInt(bgkTimeGrandTotal) + parseInt(delChrgsAmtForTDSCalc, 10) + parseInt(dlyTimeServiceTaxAmt, 10) - dlyTimeDiscountAmt;
		else
			tdsOnAmount	= parseInt(delChrgsAmtForTDSCalc, 10) + parseInt(dlyTimeServiceTaxAmt, 10) - dlyTimeDiscountAmt;
	}
	
	return tdsOnAmount;
}

function getDeliveryChargesAmtAfterExcludedChargesAmount(wayBillId) {
	
	var delChrgsAmtForTDSCalc	= 0;
	
	//deliveryTimeChargeIdsForTDSCalculation
	//Comming from GenericDDMSettlement.js
	
	if(deliveryTimeChargeIdsForTDSCalculation != null && deliveryTimeChargeIdsForTDSCalculation.length > 0) {
		for(var m = 0; m < deliveryTimeChargeIdsForTDSCalculation.length; m++) {
			if(parseInt(deliveryTimeChargeIdsForTDSCalculation[m], 10) > 0 && document.getElementById('delCharge_' + deliveryTimeChargeIdsForTDSCalculation[m] + '_' + wayBillId) != null) {
				var deliveryCharge		= $('#delCharge_' + deliveryTimeChargeIdsForTDSCalculation[m] + '_' + wayBillId).val();
				
				if(!isNaN(parseInt(deliveryCharge)))
					delChrgsAmtForTDSCalc 	+= parseInt(deliveryCharge);
			}
		}
	} else {
		for(var chargeId in activeDeliveryCharges) {
			if(activeDeliveryCharges.hasOwnProperty(chargeId)) {
				if(document.getElementById('delCharge_' + chargeId + '_' + wayBillId) != null) {
					var deliveryCharge		= $('#delCharge_' + chargeId + '_' + wayBillId).val();
					
					if(!isNaN(parseInt(deliveryCharge)))
						delChrgsAmtForTDSCalc 	+= parseInt(deliveryCharge);
				}
			}
		}
	}
	
	return delChrgsAmtForTDSCalc;
}

function getDeliveryTimeSTAmount(wayBillId) {
	
	var delTimeSTAmount	= 0;
	
	if(taxes != null) {
		for(var i = 0; i < taxes.length; i++) {
			if($('#tax_' +taxes[i].taxMasterId + '_' + wayBillId).exists()) {
				if(!isNaN(parseInt($('#tax_' +taxes[i].taxMasterId + '_' + wayBillId).val())))
					delTimeSTAmount 	+= parseInt($('#tax_' +taxes[i].taxMasterId + '_' + wayBillId).val());
			}
		}
	}

	return delTimeSTAmount;
}