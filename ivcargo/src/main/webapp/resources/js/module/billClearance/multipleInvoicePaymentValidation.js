/**
 * 
 */

//Validate Panel For Common Table 

function validatePannel() {
	let typeOfSelection	= $('#typeOfSelection').val();

	if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL)
		return true;
	
	if(!validatePaymentMode("#makePaymentJsPannel #paymentMode"))
		return false;
	
	if(!validatePaymentType("#makePaymentJsPannel #paymentType"))
		return false;
	
	let paymentType		= $("#makePaymentJsPannel #paymentType").val();
	
	if(paymentType != PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID && !validatePaymentMode("#makePaymentJsPannel #paymentMode"))
		return false;
	
	if(billPaymentConfig != null && billPaymentConfig.IsRemarkValidationAllow && !validateRemark("#makePaymentJsPannel #remark"))
		return false;
	
	return validateCheckDetails("#makePaymentJsPannel #paymentMode");
}

//Validate Billwise details table

function validatePannelForInnerTable() {
	for(const element of makepayementbillnolist){
		let billId 			= element;
		let paymentType		= $("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val();
		
		if(!validatePaymentMode("#makePaymentJsPannel #paymentModeInnerTbl_" + billId))
			return false;
		
		if(!validateChequeDetailsForInnerTable(billId))
			return false;
		
		if(!validatePaymentType("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId))
			return false;
		
		if(paymentType == PAYMENT_TYPE_STATUS_NEGOTIATED_ID 
				|| paymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
			if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() == 0)
				$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);

			if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() < 0) {
				let blc = parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val())-parseInt($("#makePaymentJsPannel #receivedAmtInnerTbl_" + billId).val())
				
				if(billPaymentConfig.isBalanceAmountValidation) {
					if(tdsConfiguration.IsTdsAllow)
						showMessage('error', 'Transaction Amount Can not be greater than Balance amount ('+blc+') !');
					else
						showMessage('error', 'Receive Amount Can not be greater than Balance amount ('+blc+') !');
					
					return false;
				}
			}
			
			if(!validatePaymentMode("#makePaymentJsPannel #paymentModeInnerTbl_" + billId))
				return false;
			
			if(billPaymentConfig.IsRemarkValidationAllow && !validateRemark("#makePaymentJsPannel #remarkInnerTbl_" + billId))
				return false;
			
			if(!validatePaymentType("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId))
				return false;
			
			if(tdsConfiguration.IsTdsAllow && !validateTxnAmount($("#txnAmtInnerTbl_" + billId)[0]))
					return false;
			
			if(!validateReceiveAmount("#makePaymentJsPannel #recAmtInnerTbl_" + billId))
				return false;
			
			if(!validateChequeDetailsForInnerTable(billId))
				return false;
		} else if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() < 0) {
			let blc = parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val())-parseInt($("#makePaymentJsPannel #receivedAmtInnerTbl_" + billId).val())

			if(billPaymentConfig.isBalanceAmountValidation) {
				if(tdsConfiguration.IsTdsAllow)
					showMessage('error', 'Transaction Amount Can not be greater than balance amount ('+blc+') !');
				else
					showMessage('error', 'Receive Amount Can not be greater than balance amount ('+blc+') !');
				
				return false; 
			}
		}
		
		if(tdsConfiguration.IsTdsAllow
			&& $('#tdsAmtInnerTbl_' + billId).val() > $('#makePaymentJsPannel #txnAmtInnerTbl_' + billId).val() && $('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val() < 0) {
				showMessage('error', 'TDS Amount Cannot Be Greater Than Txn Amount');
				changeTextFieldColorNew($("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId), '', '', 'red');
				return false;
		}
		
		if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
			&& !validateDiscountLimit(discountInPercent, Number( $("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val() - $("#makePaymentJsPannel #receivedAmtInnerTbl_" + billId).val()), $("#makePaymentJsPannel #balanceInnerTbl_" + billId).val())) {
				changeTextFieldColor('txnAmtInnerTbl_' + billId,'','','red');
				return false;
		}
	}
	
	if(tdsConfiguration.IsTdsAllow) {
		if($("#tdsAmtInnerTbl_" + billId).val() > 0 && !validateSelection(billId))
			return false;

		if($('#tdsAmtInnerTbl_' + billId).val() > $('#makePaymentJsPannel #txnAmtInnerTbl_' + billId).val() && $('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val() < 0) {
			showMessage('error', 'TDS Amount Cannot Be Greater Than Txn Amount');
			changeTextFieldColorNew($("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId), '', '', 'red');
			return false;
		}
	}
	
	return true;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount) {
	let discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);

		return false;
	}

	return true;
}


//Validate Billwise details table Inner Only

function validatePannelForInnerTableOnly() {
	let typeOfSelection	= $('#typeOfSelection').val();

	if(typeOfSelection == SEARCH_BY_MULTIPLE_BILL)
		return true;

	for(const element of makepayementbillnolist){
		let billId = element;

		if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() == 0)
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);

		if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() < 0) {
			let blc = parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val()) - parseInt($("#makePaymentJsPannel #receivedAmtInnerTbl_" + billId).val())
			
			if(billPaymentConfig.isBalanceAmountValidation) {
				if(tdsConfiguration.IsTdsAllow)
					showMessage('error', 'Transaction Amount Can not be greater than Balance amount ('+blc+') !');
				else
					showMessage('error', 'Receive Amount Can not be greater than Balance amount ('+blc+') !');
				
				return false;
			}
		}

		if(!validatePaymentMode("#makePaymentJsPannel #paymentModeInnerTbl_" + billId))
			return false;

		if(billPaymentConfig.IsRemarkValidationAllow && !validateRemark("#makePaymentJsPannel #remarkInnerTbl_" + billId))
			return false;

		if(!validatePaymentType("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId))
			return false;

		if(tdsConfiguration.IsTdsAllow && !validateTxnAmount("#makePaymentJsPannel #txnAmtInnerTbl_" + billId))
			return false;

		if(!validateReceiveAmount("#makePaymentJsPannel #recAmtInnerTbl_" + billId))
			return false;

		if(!validateChequeDetailsForInnerTable(billId))
			return false;
	}

	return true;
}

function validateReceiveAmount(elementId) {
	let receiveAmount		= $(elementId).val();
	
	if(receiveAmount == '' || receiveAmount == 0) {
		showMessage('error', receivedAmountCantBeBlankErrMsg);
		$(elementId).focus();
		changeError($(elementId), '0', '0');
		return false;
	}
	
	return true;
}

function validatePaymentMode(elementId) {
	let PayMode 		= $(elementId).val();
	
	if(PayMode != undefined && PayMode == 0) {
		showMessage('error', paymentModeErrMsg);
		$(elementId).focus();
		changeError($(elementId), '0', '0');
		return false;
	}
	
	return true;
}

function validateRemark(elementId) {
	let remark 			= $(elementId).val(); 
	
	if(remark == '') {
		showMessage('error', ramarkErrMsg);
		$(elementId).focus();
		changeError($(elementId), '0', '0');
		return false;
	} 
	
	return true;
}

function validatePaymentType(elementId) {
	let paymentType 	= $(elementId).val(); 
	
	if(paymentType == 0) {
		showMessage('error', paymentTypeErrMsg);
		$(elementId).focus();
		changeError($(elementId),'0','0');
		return false;
	}
	
	return true;
}

function validateTxnAmount(elementId) {
	let txnAmount 	= $(elementId).val(); 
	
	if(txnAmount == 0) {
		showMessage('error', txnAmountErrMsg);
		$(elementId).focus();
		changeError($(elementId),'0','0');
		return false;
	}
	
	return true;
}

function validateChequeNumber(elementId) {
	let chequeNumber		= $(elementId).val();
	
	if(chequeNumber == '') {
		showMessage('error', selectChecqueNoOrTXNNoErrMsg);
		$(elementId).focus();
		changeError($(elementId), '0', '0');
		return false;
	} 
	
	return true;
}

function validateChequeDate(elementId) {
	if($(elementId).val() == "") {
		showMessage('error', dateErrMsg);
		$(elementId).focus();
		changeError($(elementId), '0', '0');
		return false;
	}
	
	if(!isValidDate($(elementId).val())) {
		showMessage('error', 'Please Enter Valid Date!');
		changeTextFieldColor(elementId, '', '', 'red');
		changeError($(elementId), '0', '0');
		$(elementId).focus();
		return false;
	}
	
	return true;
}

function validateBankName(elementId) {
	let bankName		= $(elementId).val();
	
	if(bankName == '') {
		changeError($(elementId), '0', '0');
		$(elementId).focus();
		showMessage('error', bankNameErrMsg);
		return false;
	}
	
	return true;
}
 
function validateCheckDetails(elementId) {
	let payMode 		= $(elementId).val();
	
	if(payMode == PAYMENT_TYPE_CHEQUE_ID || payMode == PAYMENT_TYPE_ONLINE_RTGS_ID || payMode == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		if(!validateChequeNumber("#makePaymentJsPannel #Cheque"))
			return false;
		
		if(!validateChequeDate("#makePaymentJsPannel #jspanelchequedate"))
			return false;
		
		if(!validateBankName("#makePaymentJsPannel #BankName"))
			return false;
	}
	
	return true;
	
}

function validateChequeDetailsForInnerTable(billId) {
	let paymentMode		= $("#makePaymentJsPannel #paymentModeInnerTbl_" + billId).val();
	
	if(paymentMode == PAYMENT_TYPE_CHEQUE_ID || paymentMode == PAYMENT_TYPE_ONLINE_RTGS_ID || paymentMode == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		if(!validateChequeNumber("#makePaymentJsPannel #chequeInnerTbl_" + billId))
			return false;

		if(!validateChequeDate("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId))
			return false;

		if(!validateBankName("#makePaymentJsPannel #bankNameInnerTbl_" + billId))
			return false;
	}

	return true;
}

function validatePartialPaymentTypeSelection(billId) {
	if(!billPaymentConfig.DisplayPartialPaymentSelectionDropdown)
		return;
	
	return validateInputTextFeild(1, 'partialPaymentSelection_' + billId, 'partialPaymentSelection_' + billId, 'error', partialPaymentTypeErrMsg);
}

function validateCreditor() {
	return validateInputTextFeild(1, 'CreditorId', 'CreditorId', 'error', creditorSelectErrMsg);
}

function validateBillNumber() {
	return validateInputTextFeild(1, 'billNumber', 'billNumber', 'error', billNumberErrMsg);
}

function validateBranchName() {
	return validateInputTextFeild(1, 'searchByBranch', 'searchByBranch', 'error', branchNameErrMsg);
}

function validateValidBranchName() {
	return validateInputTextFeild(1, 'branchId', 'searchByBranch', 'error', validBranchNameErrMsg);
}

function validateToGetBillData() {
	if(billPaymentConfig != null && billPaymentConfig.billNumberWiseSelection) {
		let selectionType	= $('#typeOfSelection').val();
		
		if(selectionType == 0) {
			showMessage('error', typeSelectErrMsg);
			changeTextFieldColor('typeOfSelection', '', '', 'red');
			return false;
		} else if(selectionType == SEARCH_BY_BILL_NO) {
			if(!validateBillNumber())
				return false;
			
			if(!validateBranchName())
				return false;
			
			if(!validateValidBranchName())
				return false;
		} else if(selectionType == SEARCH_BY_CREDITOR) {
			if(!validateCreditor())
				return false;
		}
	} else if(!validateCreditor())
		return false;
	
	return true;
}

function isValidDate(date) {
	if(date != null){

		if ( date.match(/^(\d{1,2})\-(\d{1,2})\-(\d{4})$/) ) {
			let dd = RegExp.$1;
			let mm = RegExp.$2;
			let yy = RegExp.$3;

			// try to create the same date using Date Object
			let dt = new Date(parseFloat(yy), parseFloat(mm)-1, parseFloat(dd), 0, 0, 0, 0);
			// invalid day
			if ( parseFloat(dd) != dt.getDate() ) { return false; }
			// invalid month
			if ( parseFloat(mm)-1 != dt.getMonth() ) { return false; }
			// invalid year
			return !(parseFloat(yy) != dt.getFullYear());
		} else {
			// not even a proper date
			return false;
		}
	}
}