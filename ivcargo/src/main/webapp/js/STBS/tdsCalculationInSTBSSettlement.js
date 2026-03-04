/**
 * 
 */
var discountInPercent = 0;

function tdsCalculation(obj) {
	
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var txnAmount		= 0;

	var receivedAmtObj	= document.getElementById("receiveAmt_" + splitVal[1]);
	var receivedAmtLimit= parseInt(document.getElementById("receivedAmtLimit_" + splitVal[1]).value,10);
	
	var totalAmt		= parseInt($("#finalAmount_" + splitVal[1]).val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	
	if($('#txnAmount_' + splitVal[1]).val() != '') {
		txnAmount		= parseInt($('#txnAmount_' + splitVal[1]).val());
	}
	
	var tdsCharge 		= $('#tdsRate_' + splitVal[1]).val();
	
	if(tdsConfiguration.IsTdsAllow) {
		if(tdsConfiguration.IsTDSInPercentAllow) {
			if(splitVal[0] == 'txnAmount') {
				if($('#txnAmount_' + splitVal[1]).val() != '') {
					var tdsAmt				= Math.round((txnAmount * tdsCharge ) / 100);
				
					$("#tdsAmount_" + splitVal[1]).val(tdsAmt);
					$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - tdsAmt));
					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			} else if(splitVal[0] == 'tdsAmt') {
				if($("#tdsAmount_" + splitVal[1]).val() != '') {
		
					var tdsAmt				= Math.round($("#tdsAmount_" + splitVal[1]).val());
					
					$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - tdsAmt));
					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			}
		} else { 
			if(splitVal[0] == 'txnAmount') {
				if($('#txnAmount_' + splitVal[1]).val() != '') {
					$("#tdsAmount_" + splitVal[1]).val(0);
					$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - $("#tdsAmount_" + splitVal[1]).val()));
					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			} else if(splitVal[0] == 'tdsAmount') {
				if($('#tdsAmount_' + splitVal[1]).val() != '') {
					
					var tdsAmt				= Math.round($("#tdsAmount_" + splitVal[1]).val());
					var txnAmt				= Math.round($("#txnAmount_" + splitVal[1]).val());
					
					$("#receiveAmt_" + splitVal[1]).val(txnAmt - tdsAmt);
					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - txnAmt);
				}
			}
		}
	} else {
		$('#balanceAmt_' + splitVal[1]).val(actTotalAmt - $("#receiveAmt_" + splitVal[1]).val());
	}
	
	return receivedAmtObj.value;
}

function validateTxnAmount(obj) {
	
	var objName 			= obj.name;
	var objVal				= 0;
	var splitVal 			= objName.split("_");
	var totalAmt 			= parseInt($("#finalAmount_" + splitVal[1]).val());
	var receivedAmtLimit	= parseInt($("#receivedAmtLimit_" + splitVal[1]).val());
	var tdsAmt				= parseInt($("#tdsAmount_" + splitVal[1]).val());
	var txnAMount			= parseInt($("#txnAmount_" + splitVal[1]).val());
	var balanceAmount		= parseInt($("#balanceAmt_" + splitVal[1]).val());
	
	if(receivedAmtLimit > 0) {
		totalAmt = totalAmt - receivedAmtLimit;
	}

	if(obj.value.length > 0) {
		objVal = parseInt(obj.value, 10);
	}
	
	if(objVal > totalAmt) {
			showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + totalAmt);
			obj.value 	= 0;
			objVal 		= 0;
	}
	
	var maxRecAmt = $('#receiveAmt_Party').val();
	
	if(objVal > totalAmt && maxRecAmt > 0) {
		showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + totalAmt);
		obj.value 	= 0;
		objVal 		= 0;
	}
	
	$("#balanceAmt_" + splitVal[1]).val(totalAmt - objVal);
	$("#receiveAmt_" + splitVal[1]).val(txnAMount - tdsAmt);
	
	if($("#balanceAmt_" + splitVal[1]).val() <= 0) {
		$("#paymentStatus_" + splitVal[1]).val(stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
	}
	
	if($("#paymentStatus_" + splitVal[1]).val() == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_NEGOTIATED_ID
		&& !validateDiscountLimit(discountInPercent, Number(totalAmt - receivedAmtLimit), balanceAmount, $("#txnAmount_" + splitVal[1])))
			return false;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
			
		if(element != undefined && element != null)
			changeTextFieldColorNew(element, '', '', 'red');

		return false;
	}

	return true;
}