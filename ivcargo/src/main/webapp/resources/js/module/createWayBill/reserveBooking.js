function setReservedBooking() {
	
	var reservedCheck = document.getElementById("isReservedCheck");
	
	if (reservedCheck.checked) {
		isReserveBookingChecked = true;
		$("#reservedLRDiv").css("background-color", "#6497b1");
		changeAttributeOfJSEvent('add', 'onkeyup', 'executeReserveAddScript();');
		changeAttributeOfJSEvent('add', 'onmouseup', 'executeReserveAddScript();');
		$("#save").html("Reserve");
	} else {
		isReserveBookingChecked = false;
		$("#reservedLRDiv").css("background-color", "white");
		changeAttributeOfJSEvent('add', 'onkeyup', 'executeAddScript();');
		changeAttributeOfJSEvent('add', 'onmouseup', 'executeAddScript();');
		$("#save").html("Save");
	}
}

function executeReserveAddScript() {
	
	if(noOfArticlesAdded > 0){
		return true;
	}

	if(reservedBasicFormValidation()) {
		if(validateReserveAddArticle()) {
			hideAllMessages();
			checkAndAddConsignment(); // Defined in Consignment.js file
			$('#consignmentGoodsId').val(0);
			return true;
		}
	}
	return false;
}

function onReserveWayBill(execFunctionName) {

	resetCharges();
	disableButton();

	if(!isWayBillSaving) {
		isWayBillSaving = true;
		if(!isWayBillSaved) {
			if(!reservedFormValidations(execFunctionName)) {
				enableButton();
				isWayBillSaving = false;
			}
		}
	}
}

function validateReserveAddArticle() {
	
	if (configuration.ChargeType == 'true') {
		if(!validateInput(1, 'chargeType', 'chargeType', 'packageError',  chargeTypeErrMsg)) {
			return false;
		}
	}
	
	if (configuration.Qty == 'true') {
		if(!validateInput(1, 'quantity', 'quantity', 'packageError',  quantityErrMsg)) {
			return false;
		}
	}
	
	if (configuration.ArticleType == 'true') {
		if(!validateInput(1, 'typeofPacking', 'typeofPacking', 'packageError',  articleTypeErrMsg)) {
			return false;
		}
	}
	
	if(configuration.SaidToContainValidate == 'true') {
		
		if (configuration.SaidToContain == 'true') {
			if(!validateInput(1, 'saidToContain', 'saidToContain', 'packageError',  saidToContaionErrMsg)) {
				return false;
			}
		}
		
		if (configuration.SaidToContainAutocomplete == 'true') {
			if(!validateInput(1, 'consignmentGoodsId', 'saidToContain', 'packageError',  properSaidToContaionErrMsg)) {
				return false;
			}
		}
	}
	
	return true;
}

function reservedFormValidations(execFunctionName) {

	if(reservedBasicFormValidation()) {
		if(!validateConsignmentTables()) {
			return false;
		}

		if(!isChargeDisplayable()) {
			checkAndAddConsignment(); // Name Change from getCharges() {
		}

		calcTotal();

		if(isReserveBookingChecked && $("#wayBillType").val() != WayBillType.WAYBILL_TYPE_PAID) {
			saveWayBill($("#wayBillType").val(),execFunctionName);
		}
	}
}

function reservedBasicFormValidation() {

	if(isManual){
		if(!sourceValidation()) {
			return false;
		}
	}

	if (!destinationValidation()) {
		return false;
	}

	if (!freightUptoBranchValidation()) {
		return false;
	}
	

	if(isManualWayBill){
		if(!lrDateValidation()) {
			return false;
		}
	}

	if(!validateConsignor()) {
		return false;
	}

	if(!validateConsignorMobile()) {
		return false;
	}

	if (!validateLengthOfConsignorMobileNumber()) {
		return false;
	}

	if(!billingPartyValidation()) {
		return false;
	}
	return true;
}