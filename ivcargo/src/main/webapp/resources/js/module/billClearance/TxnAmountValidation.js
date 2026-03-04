/**
 * 
 */

function validateTxnAmount(obj) {

	let objName 			= obj.name;
	let objVal				= 0;
	let splitVal 			= objName.split("_");
	let grandTotal 			= parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + splitVal[1]).val());
	let receivedAmtLimit 	= parseInt($("#makePaymentJsPannel #receivedAmtLimit_" + splitVal[1]).val());
	let txnAmount			= parseInt($("#makePaymentJsPannel #txnAmtInnerTbl_" + splitVal[1]).val());
	
	if(!validateSelection(splitVal[1])) {
		$("#makePaymentJsPannel #txnAmtInnerTbl_" + splitVal[1]).val(0);
		return false;
	}
	
	if(receivedAmtLimit > 0)
		grandTotal = grandTotal - receivedAmtLimit;
	
	if(txnAmount > grandTotal)
		showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + grandTotal);

	$("#makePaymentJsPannel #balanceInnerTbl_" + splitVal[1]).val(grandTotal - objVal);
	
	if($("#makePaymentJsPannel #balanceInnerTbl_" + splitVal[1]).val() <= 0)
		$("#makePaymentJsPannel #paymenttypeInnerTbl_" + splitVal[1]).val(0);
}

function validateSelection(splitVal) {
	if(IsPANNumberMandetory) {
		if(!validatePanNumber(1, 'panNumberInnerTbl_' + splitVal)) {
			if(!validateTanNumber(1, 'tanNumberInnerTbl_' + splitVal))
				return false;
		} else if(!checkValidPanNum('panNumberInnerTbl_' + splitVal))
			return false;
	}
	
	if(IsTANNumberMandetory
		&& !validateTanNumber(1, 'tanNumberInnerTbl_' + splitVal)
			&& (!validatePanNumber(1, 'panNumberInnerTbl_' + splitVal) || !checkValidPanNum('panNumberInnerTbl_' + splitVal)))
		return false;
	
	if(!validatePaymentMode('#paymentModeInnerTbl_' + splitVal))
		return false;
	
	return validatePaymentType('#paymenttypeInnerTbl_' + splitVal);
}

function validateTxnAmount1() {
	let objVal				= 0;
	let grandTotal 			= parseInt($("#makePaymentJsPannel #totalAmount").val());
	let receivedAmtLimit 	= parseInt($("#makePaymentJsPannel #receivedAmtLimit").val());
	let txnAmount			= parseInt($("#makePaymentJsPannel #txnAmount").val());
	
	if(receivedAmtLimit > 0)
		grandTotal = grandTotal - receivedAmtLimit;
	
	if(txnAmount > grandTotal)
		showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than '+grandTotal);

	$("#makePaymentJsPannel #balanceAmount").val(grandTotal - objVal);
	
	if($("#makePaymentJsPannel #balanceAmount").val() <= 0)
		$("#makePaymentJsPannel #paymentType").val(0);
}

function validateSelection1() {
	if(IsPANNumberMandetory && !validatePanNumber(1, 'makePaymentJsPannel #panNumber'))
		return false;
	
	if(!validatePaymentMode(1, 'makePaymentJsPannel #paymentMode'))
		return false;
	
	return validatePaymentType(1, 'makePaymentJsPannel #paymentType');
}