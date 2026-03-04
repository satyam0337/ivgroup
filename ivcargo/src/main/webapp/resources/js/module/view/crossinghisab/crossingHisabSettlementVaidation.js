/**
 * PaymentTypeConstant gloabaly defined, comming from crossingHisabSettlementVaidation.js file
 */

function validateReceiveAmount(obj) {
	var objName 		= obj.name;
	var objVal			= 0;
	var splitVal 		= objName.split("_");
	
	if(!formValidation(obj)) {
		$('#receiveAmt_' + splitVal[1]).val(0);
		return false;
	}
	
	var maxAmt 			= parseInt($('#grandTotal_' + splitVal[1]).val());
	var minAmt 			= parseInt($('#receivedAmtLimit_' + splitVal[1]).val());
	var isLess = false;

	if(maxAmt > 0){
		if(minAmt > 0) {
			maxAmt = maxAmt - minAmt;
		}
		var isObjValshldzero = false;
	
		if(obj.value.length > 0) {
			objVal = parseInt(obj.value,10);
		}

		if(isObjValshldzero) {
			obj.value = 0;
			objVal = 0;
		}
	} else if(maxAmt < 0){
		if(obj.value.length > 0) {
			objVal = parseInt(obj.value,10);
		}
		if(isObjValshldzero) {
			obj.value = 0;
			objVal = 0;
		}
		isLess = true;
	}

	if(isLess){
		objVal = - objVal;
	}
	
	var grandTotal			= parseInt($('#grandTotal_' + splitVal[1]).val());
	var receivedAmtLimit	= parseInt($('#receivedAmtLimit_' + splitVal[1]).val()) + objVal;
	var balanceAmt			= $('#balanceAmt_' + splitVal[1]).val();
	
	$('#balanceAmt_' + splitVal[1]).val(grandTotal - (receivedAmtLimit));

	if(balanceAmt <= 0) {
		$('#paymentStatus_' + splitVal[1]).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
	}
}

function formValidation(obj) {

	var objName			= obj.name;
	var mySplitResult 	= objName.split("_");
	
	var receiveAmount	= $("#receiveAmt_" + mySplitResult[1]).val();
	var paymentMode		= $("#paymentMode_" + mySplitResult[1]).val();
	var billNumber		= $("#billNumber_" + mySplitResult[1]).val();
	var billId			= $("#billId_" + mySplitResult[1]).val();

	if(!validatePaymentMode(1, 'paymentMode_' + mySplitResult[1])) {
		return false;
	}
	
	if(!validatePaymentType(1, 'paymentStatus_' + mySplitResult[1])) {
		return false;
	}
	
	if(!BankPaymentOperationRequired) {
		if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
			if(!validateChequeNumber(1, 'chequeNumber_' + mySplitResult[1])) {
				return false;
			}
			
			if(!validateChequeDate(1, 'chequeDate_' + mySplitResult[1])) {
				return false;
			}
		}
	}
	
	if(BankPaymentOperationRequired && isValidPaymentMode(paymentMode) && receiveAmount > 0) {
		if(!$('#paymentDataTr_' + billId).exists()) {
			showMessage('info', iconForInfoMsg + 'Please, Add Payment details for this Bill ' + openFontTag + billNumber + closeFontTag + ' !');
			return false;
		}
	}
	
	return true;
}

function enableButtons() {
	changeDisplayProperty('UpSaveButton', 'inline-block');
	changeDisplayProperty('DownSaveButton', 'inline-block');
}

function disableButtons() {
	changeDisplayProperty('UpSaveButton', 'none');
	changeDisplayProperty('DownSaveButton', 'none');
}

function setPaymentStatus(obj) {
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var objVal			= 0;
	var paymentStatus 	= parseInt(getValueFromInputField('paymentStatus_' + splitVal[1]));
	var balanceAmount	= parseInt(getValueFromInputField('balanceAmt_' + splitVal[1]));
	
	if(parseInt(obj.value, 10) > 0 && paymentStatus != PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID &&  balanceAmount != 0) {
		$('#paymentStatus_' + splitVal[1]).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
	}
}

function showHideChequeDetails(srNo,obj) {
	if(BankPaymentOperationRequired){
		$('#uniqueWayBillId').val($('#billId_' + srNo).val());
		$('#uniqueWayBillNumber').val($('#billNumber_' + srNo).val());
		$('#uniquePaymentType').val($('#paymentMode_' + srNo).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + srNo + " option:selected").text());

		hideShowBankPaymentTypeOptions(obj);
	} else {
		var objName 		= obj.name;
		var mySplitResult 	= objName.split("_");

		if(obj.value != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID && obj.value != 0) {
			switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'hide', 'show');
			switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'hide', 'show');
		} else { 
			switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'show', 'hide');
			switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'show', 'hide');
		}
	}
}

function setReceiveAmountOnPaymentStatus(obj) {
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	
	var totalAmount		= $('#grandTotal_' + mySplitResult[1]).val();
	var receivedAmount	= $('#receivedAmt_' + mySplitResult[1]).val();
	var balanceAmount	= $('#balanceAmt_' + mySplitResult[1]).val();
	var receiveAmount	= 0;
	var balanceAmount	= 0;
	
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		receiveAmount		= totalAmount - receivedAmount;
		balanceAmount		= totalAmount - receivedAmount - receiveAmount;
		
		if(receiveAmount < 0) {
			$('#receiveAmt_' + mySplitResult[1]).val(-receiveAmount);
		} else {
			$('#receiveAmt_' + mySplitResult[1]).val(receiveAmount);
		}
		
		if(balanceAmount < 0) {
			$('#balanceAmt_' + mySplitResult[1]).val(-balanceAmount);
		} else {
			$('#balanceAmt_' + mySplitResult[1]).val(balanceAmount);
		}
	} else {
		$('#receiveAmt_' + mySplitResult[1]).val(0);
	}
}