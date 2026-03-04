/**
* Ashish Tiwari 	-	11/08/2016
* Anant Chaudhary	-	08-10-2016
**/

function setPaymentModeSelection() {
	createOptionInSelectTag('paymentMode', '0', '0', '---Select Mode---');
	createOptionInSelectTag('paymentMode', PAYMENT_TYPE_CASH_ID, PAYMENT_TYPE_CASH_ID, PAYMENT_TYPE_CASH_NAME);
	createOptionInSelectTag('paymentMode', PAYMENT_TYPE_CHEQUE_ID, PAYMENT_TYPE_CHEQUE_ID, PAYMENT_TYPE_CHEQUE_NAME);
	createOptionInSelectTag('paymentMode', PAYMENT_TYPE_ONLINE_RTGS_ID, PAYMENT_TYPE_ONLINE_RTGS_ID, PAYMENT_TYPE_ONLINE_RTGS_NAME);
	createOptionInSelectTag('paymentMode', PAYMENT_TYPE_ONLINE_NEFT_ID, PAYMENT_TYPE_ONLINE_NEFT_ID, PAYMENT_TYPE_ONLINE_NEFT_NAME);
}

function setPaymentTypeSelection() {
	createOptionInSelectTag('paymentType', '0', '0', '--Payment Type--');
	createOptionInSelectTag('paymentType', PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	createOptionInSelectTag('paymentType', PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	createOptionInSelectTag('paymentType', PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
}

function setValueToTableOnPaymentModeChange() {
	var paymentMode		= getValueFromInputField('paymentMode');

	if(paymentMode == PAYMENT_TYPE_CASH_ID) {
		changeDisplayProperty('ChequeBlock', 'none');
	} else if(paymentMode == PAYMENT_TYPE_CHEQUE_ID) {
		changeDisplayProperty('ChequeBlock', 'inline-block');
	} else if(paymentMode == PAYMENT_TYPE_ONLINE_RTGS_ID) {
		changeDisplayProperty('ChequeBlock', 'inline-block');
	} else if(paymentMode == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		changeDisplayProperty('ChequeBlock', 'inline-block');
	} else {
		changeDisplayProperty('ChequeBlock', 'none');
	}
}

function validateReceiveAmount(obj) {
	if(!validateSelection()) {
		setValueToTextField('receivedAmount', '0');
		return false;
	}
	
	var totalAmount		= getValueFromInputField('totalAmount');
	var receivedAmount	= getValueFromInputField('receivedAmount');
	
	if(parseFloat(totalAmount) < 0) {
		if(parseFloat(receivedAmount) > parseFloat(-totalAmount)) {
			showMessage('info', receivedAmtCantBeGTToatlAmtInfoMsg(totalAmount));
			setValueToTextField('receivedAmount', '0');
			return false;
		}
		
		setValueToTextField('balanceAmount', (parseFloat(totalAmount) + parseFloat(receivedAmount)));
	} else {
		if(parseFloat(receivedAmount) > parseFloat(totalAmount)) {
			showMessage('info', receivedAmtCantBeGTToatlAmtInfoMsg(totalAmount));
			setValueToTextField('receivedAmount', '0');
			return false;
		}
		
		setValueToTextField('balanceAmount', (parseFloat(totalAmount) - parseFloat(receivedAmount)));
	}
}

function validateSelection() {
	if(!validatePaymentModeSelection()) {
		return false;
	}
	
	if(!validatePaymentTypeSelection()) {
		return false;
	}
	
	return true;
}

function setAmountForPayment() {
	
	if(!validatePaymentModeSelection()) {
		setValueToTextField('paymentType', 0);
		return false;
	}
	
	var paymentType		= getValueFromInputField('paymentType');
	var totalAmount		= getValueFromInputField('totalAmount');
	
	if(paymentType == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		if(parseFloat(totalAmount) < 0) {
			setValueToTextField('receivedAmount', parseFloat(-totalAmount));
			enableDisableInputField('receivedAmount', 'true');
		} else {
			setValueToTextField('receivedAmount', totalAmount);
			enableDisableInputField('receivedAmount', 'false');
		}
	} else {
		setValueToTextField('receivedAmount', 0);
		enableDisableInputField('receivedAmount', 'false');
	}
}

function validatePaymentModeSelection() {
	var paymentMode		= getValueFromInputField('paymentMode');
	
	if(paymentMode == 0) {
		changeTextFieldColorWithoutFocus('paymentMode', '', '', 'red');
		showMessage('error', paymentModeErrMsg);
		return false;
	} 
	
	return true;
}

function validatePaymentTypeSelection() {
	var paymentType		= getValueFromInputField('paymentType');
	
	if(paymentType == 0) {
		changeTextFieldColorWithoutFocus('paymentType', '', '', 'red');
		showMessage('error', paymentTypeErrMsg);
		return false;
	}
	
	return true;
}

function showHideChequeDetails(obj) {

	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");

	if(obj.value != 1 && obj.value != 0) {
		switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'hide', 'show');
		switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'hide', 'show');
	} else { 
		switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'show', 'hide');
		switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'show', 'hide');
	}
}

function createBill() {
	if(!validateSelection()) {
		return false;
	}
	
	hideButton();
	
	$.confirm({
		text: "Are you sure. You want to clear payment ?",
		confirm: function() {
			showLayer();
			var jsonObject			= new Object();
			
			jsonObject["dispatchLedgerId"]		= getValueFromInputField('dispatchLedgerId');
			jsonObject["paymentMode"]			= getValueFromInputField('paymentMode');
			jsonObject["chequeNumber"]			= getValueFromInputField('chequeNo');
			jsonObject["remark"] 				= getValueFromInputField('remark');
			jsonObject["chequeDate"]			= getValueFromInputField('chequeDate');
			jsonObject["paymentType"] 			= getValueFromInputField('paymentType');
			jsonObject["grandTotal"] 			= getValueFromInputField('totalAmount');
			jsonObject["totalReceivedAmount"] 	= getValueFromInputField('receivedAmount');
			jsonObject["balanceAmount"] 		= getValueFromInputField('balanceAmount');
				
			var jsonStr = JSON.stringify(jsonObject);
			
			$.ajax({
		      type: "POST",
		      url: WEB_SERVICE_URL+'/crossingAgentBillWS/createCrossingAgentBill.do',
		      data:jsonObject,
		      success: function(data) {
		    	  if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
						hideLayer();
					} else {
						$('#showAdvancePaymentOpt').empty();
						refreshAndHidePartOfPage('showAdvancePaymentOpt', 'hide');
						
						if(data.message != undefined) {
							var msg	= data.message;
							changeDisplayProperty('showAdvancePaymentOpt', 'none');
							changeDisplayProperty('hideAdvancePaymentDetails', 'none');
							showMessage('success', iconForSuccessMsg + ' ' + ' Bill Clear Successfully !'); // show message to show system processing error massage on top of the window.					
						} else {
							var msg	= data.message;
							showMessage('success', iconForWarningMsg + ' ' + ' Bill Clear Successfully !'); // show message to show system processing error massage on top of the window.										
						}
						
						hideLayer();
					}
		      }
		    });
		},
		cancel: function() {
			showButton();
			return false;
		},
		dialogClass: "modal-dialog modal-lg"
	});
}

function hideButton() {
	changeDisplayProperty('simpleConfirm', 'none');
}

function showButton() {
	changeDisplayProperty('simpleConfirm', 'inline-block');
}