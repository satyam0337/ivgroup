/**
 * @Author Anant Chuadhary	24-11-2016
 */

function isTDSEffect() {
	return isCheckBoxChecked('applyTDSEffect');
}

function resetTDSBox() {
	if(!validatePaymentType(1, 'deliveryPaymentType')) {
		checkedUnchecked('applyTDSEffect', 'false');
		return false;
	}
	
	if(isTDSEffect())
		calulateBillAmount();
	else
		setValueToTextField('tdsAmount', 0);
	
	hideShowTDSBox();
}

function hideShowTDSBox() {
	if(isTDSEffect())
		enableDisableInputField('tdsAmount', 'false');
	else
		enableDisableInputField('tdsAmount', 'true');
}

function getTDSOnAmount() {
	
	let deliveryPaymentType		= $('#deliveryPaymentType').val();
	let tdsOnAmount				= 0;
	let delChrgsAmtForTDSCalc	= 0;
	let bgkTimeGrandTotal		= 0;
	let dlyTimeServiceTaxAmt	= 0;
	let dlyTimeDiscountAmt		= 0;
	let wayBillTypeId			= $('#waybillTypeId').val();
	
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
			|| deliveryPaymentType == PAYMENT_TYPE_UPI_ID) {
	
		bgkTimeGrandTotal		= $('#GrandAmnt').val();
		delChrgsAmtForTDSCalc 	= getDeliveryChargesAmtAfterExcludedChargesAmount();
		dlyTimeServiceTaxAmt	= getDeliveryTimeSTAmount();
		
		if(document.getElementById('txtDelDisc')) {
			let txtDelDisc		= $('#txtDelDisc').val();
			
			if(txtDelDisc == '')
				$('#txtDelDisc').val(0);
			
			dlyTimeDiscountAmt = parseFloat($('#txtDelDisc').val());
		}
		
		if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
			tdsOnAmount	= parseInt(bgkTimeGrandTotal) + parseInt(delChrgsAmtForTDSCalc, 10) + parseInt(dlyTimeServiceTaxAmt, 10) - dlyTimeDiscountAmt;
		else
			tdsOnAmount	= parseInt(delChrgsAmtForTDSCalc, 10) + parseInt(dlyTimeServiceTaxAmt, 10) - dlyTimeDiscountAmt;
	}
	
	return tdsOnAmount;
}

function calTDSAmount(id) {
	if(id == 'tdsAmount') {
		// no need to store tdsOnAmount bcoz onload its always goes in else part & tdsOnAmount will store that time
		let tdsAmount			= parseInt($('#tdsAmount').val());  
		
		if($('#billAmount').val() > 0)
			$('#actBillAmount').val(Math.round(parseInt($('#billAmount').val()) - tdsAmount));
	} else {
		let isTDSAllowInPercent	= tdsConfiguration.IsTDSInPercentAllow;
		let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
		let tdsRate				= 0;
		
		if(tdsChargeInPercent != undefined && tdsChargeInPercent.includes(","))
			tdsRate				= tdsChargeInPercent.split(",")[0];
		else
			tdsRate				= tdsChargeInPercent;
		 // deliveryTdsRate globally defined and Coming from Property file
		
		$('#tdsOnAmount').val(getTDSOnAmount());
		
		let tdsAmount			= 0;

		if(isTDSAllowInPercent)
			tdsAmount			= Math.round((getTDSOnAmount() * tdsRate) / 100);
		else
			tdsAmount			= Math.round($('#tdsAmount').val());
		
		$('#tdsAmount').val(tdsAmount);
		
		if($('#billAmount').val() > 0)
			$('#actBillAmount').val(Math.round(parseInt($('#billAmount').val()) - tdsAmount));
	}
}

function getDeliveryChargesAmtAfterExcludedChargesAmount() {
	let delChrgsAmtForTDSCalc	= 0;
	
	if(chargeIdsForTDSCalculation != null && chargeIdsForTDSCalculation.length > 0) {
		for(let m = 0; m < chargeIdsForTDSCalculation.length; m++) {
			if(parseInt(chargeIdsForTDSCalculation[m], 10) > 0 && document.getElementById('deliveryCharge' + chargeIdsForTDSCalculation[m]) != null) {
				if(!isNaN(parseInt($('#deliveryCharge' + chargeIdsForTDSCalculation[m]).val())))
					delChrgsAmtForTDSCalc 	+= parseInt($('#deliveryCharge' + chargeIdsForTDSCalculation[m]).val());
			}
		}
	}
	
	return delChrgsAmtForTDSCalc;
}

function getDeliveryTimeSTAmount() {
	let delTimeSTAmount		= 0;
	let taxes				= jsondata.taxes;
	let wayBillId			= $('#waybillId').val();
	
	if(taxes != null) {
		for (let i = 0; i < taxes.length; i++) {
			delTimeSTAmount += parseInt($('#tax_' + taxes[i].taxMasterId + '_' + wayBillId).val());	
		}
	}

	return delTimeSTAmount;
}