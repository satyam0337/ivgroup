/**
 * @author Anant Chaudhary	03-10-2015	19:25 P.M.
 */

/**
 * You have to import VariableForErrorMsg.js file also with this file 
 * otherwise functions will not work.;
 */

function showSpecificErrors(errorEl, msg){
	var ele = document.getElementById(errorEl);
	ele.innerHTML = msg;
	ele.className = 'statusErr';
	isValidationError = true;
}

function toogleElement(EleName, style){
	var objEle = document.getElementById(EleName);
	
	if(objEle){
		objEle.style.display = style;
		(style == 'block') ? isValidationError = true : isValidationError = false;
	}
}

function changeError(id,xaxis,yaxis){
	document.getElementById(id).style.borderStyle = "solid";
	document.getElementById(id).style.borderColor = "red";
	document.getElementById(id).focus();
	//window.scrollTo(xaxis,yaxis);
}

function removeError(id){
	if(document.getElementById(id) != null){
		document.getElementById(id).style.borderStyle = "solid";
		document.getElementById(id).style.borderColor = "";
		isValidationError = false;
	}
}

function validateShortNumber(id) {
	if(!validateInput(1, id, id, id, shortNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateWayBillNumber(id){
	if(!validateInput(1, id, id, id, wayBillNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDamageNumber(id) {
	var shortNumber = document.getElementById(id);
	
	if(shortNumber.value <= 0) {
		showMessage('error', damageNumberErrMsg);
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function excessNumber(id) {
	if(!validateInput(1, id, id, id, excessNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function lrNumber(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', lrNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function lsNumber(id) {
	if(!validateInput(1, id, id, id, lsNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateLsNumber(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', lsNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateTurNumber(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', turNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function privateMark(id) {
	if(!validateInput(1, id, id, id, privateMarkErrMsg)) {
		return false;
	}
	
	return true;
}

function validateVehicleNumber(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', vehicleNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function branchName(filter, id) {
	if(!validateInput(filter, id, id, id, branchNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateBranch(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', branchNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateSrcBranch(filter, id) {
	if(!validateInput(1, id, id, id, sourceBranchErrMsg)) {
		return false;
	}
	return true;
}

function region(id) {
	if(!validateInput(1, id, id, id, regionNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateRegion(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', regionNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDestRegion(filter, id) {
	if(!validateInput(filter, id, id, id, destinationRegionErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDestSubRegion(filter, id) {
	if(!validateInput(filter, id, id, id, destinationSubRegionErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDestBranch(filter, id) {
	if(!validateInput(filter, id, id, id, destinationBranchErrMsg)) {
		return false;
	}
	
	return true;
}

function selectType(id) {
	var region = document.getElementById(id);
	
	if(region.value <= 0) {
		showMessage('error', selectTypeErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function subRegion(id) {
	if(!validateInput(1, id, id, id, subRegionNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateSubRegion(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', subRegionNameErrMsg)) {
		return false;
	}
	
	return true;
}

function lounchByParty(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', lounchByPartyErrMsg)) {
		return false;
	}
	
	return true;
}

function claimAmount(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', claimAmountErrMsg)) {
		return false;
	}
	
	return true;
}

function claimType(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', claimTypeErrMsg)) {
		return false;
	}
	
	return true;
}

function claimPersonName(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', claimPersonErrMsg)) {
		return false;
	}
	
	return true;
}

function claimNumber(id) {
	if(!validateInput(1, id, id, id, claimNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function remark(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', ramarkErrMsg)) {
		return false;
	}
	
	return true;
}

function excessNumber(id) {
	var remark	= document.getElementById(id);
	
	if(remark.value <= 0) {
		showMessage('error', excessErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function articleType(id) {
	if(!validateInput(1, id, id, id, articleTypeErrMsg)) {
		return false;
	}
	
	return true;
}

function excessArticle(id) {
	if(!validateInput(1, id, id, id, excessArticleErrMsg)) {
		return false;
	}
	
	return true;
}


function excessArticleType(id) {
	var excessArticle = document.getElementById(id);
	
	if(excessArticle.value <= 0) {
		showMessage('error', excessPackingErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function excessWeight(id) {
	if(!validateInput(1, id, id, id, excessWeightErrMsg)) {
		return false;
	}
	
	return true;
}

function shortArticle(id) {
	var shortArticle = document.getElementById(id);
	
	if(shortArticle.value < 0) {
		showMessage('error', shortArticleErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function damageArticle(id) {
	var damageArticle = document.getElementById(id);
	
	if(damageArticle.value < 0) {
		showMessage('error', damageArticleErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function validateActUnloadWeight(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', actUnloadWeightErrMsg)) {
		return false;
	}
	
	return true;
}

function validateShortWeight(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', shortWeightErrMsg)) {
		return false;
	}
	
	return true;
}

function damageWeight(id) {
	var damageWeight = document.getElementById(id);	
	
	if(damageWeight.value <= 0) {
		showMessage('error', damageWeightErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function shortAmount(id) {
	if(!validateInput(1, id, id, id, shortAmountErrMsg)) {
		return false;
	}
	
	return true;
}

function damageAmount(id) {
	var shortAmount = document.getElementById(id);	
	
	if(shortAmount.value <= 0) {
		showMessage('error', damageAmountErrMsg);
		toogleElement('error','block');
		changeError(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}

function shortSettleType(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', shortSettleWayErrMsg)) {
		return false;
	}
	
	return true;
}

function damageSettleType(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', damageSettleWayErrMsg)) {
		return false;
	}
	
	return true;
}

function excessSettleType(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', excessSettleWayErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDeliverdToName(filter, id) {
	if(!validateInput(filter, id, id, id, deliverdNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateValidDeliveredToName(filter, id) {
	if(!validateInput(filter, id, id, id, properDeliveredToName)) {
		return false;
	}
	
	return true;
}

function validateDeliveredToPhoneNumber(filter, id) {
	if(!validateInput(filter, id, id, id, deliverdPhoneNumErrMsg)) {
		return false;
	}
	
	return true;
}

function validateApprovedBy(filter, id) {
	if(!validateInput(filter, id, id, id, approvedByNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateServiceTaxPaidBy(filter, id) {
	if(!validateInput(filter, id, id, id, stPaidByErrMsg)) {
		return false;
	}
	
	return true;
}

function validateValidLRNumber(filter, id) {
	if(!validateInput(filter, id, id, id, validLRNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePaymentType(filter, id) {
	if(!validateInput(filter, id, id, id, paymentTypeErrMsg)) {
		return false;
	}
	
	return true;
}

function validateRemark(filter, elementId, errorElementId) {
	if(!validateInputTextFeild(filter, elementId, errorElementId, 'error', ramarkErrMsg)) {
		return false;
	}
	
	return true;
}

function validateProperDeliveryCreditor(filter, id) {
	if(!validateInput(filter, id, id, id, properDeliveryCreditorNameErrMsg)) {
		return false;
	}
	
	return true;
}
function validateProperSubRegionDestination(filter, elementId, errorElementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', properSubRegionDestinationErrMsg)) {
		return false;
	}
	
	return true;
}

function validateProperDestination(filter, elementId, errorElementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', properDestinationErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePackingTypeName(filter, id) {
	if(!validateInput(filter, id, id, id, packingTypeNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePackingType(filter, id) {
	if(!validateInput(filter, id, id, id, packingTypeErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePackingTypeGrp(filter, id) {
	if(!validateInput(filter, id, id, id, packingTypeGrpErrMsg)) {
		return false;
	}
	return true;
}

function validateLengthOfMobileNumber(filter, id) {
	if(!validateInput(filter, id, id, id, mobileNumberLenErrMsg)) {
		return false;
	}
	
	return true;
}

function validateLengthOfTinNumber(filter, id) {
	if(!validateInput(filter, id, id, id, tinNumberLenErrMsg)) {
		return false;
	}
	
	return true;
}

function validateBillType(filter, id) {
	if(!validateInput(filter, id, id, id, billSelectionErrMsg)) {
		return false;
	}
	
	return true;
}

function validateManualBillType(filter, id) {
	if(!validateInput(filter, id, id, id, billSelectionErrMsg)) {
		return false;
	}
	
	return true;
}

function validateSequenceMin(filter, id) {
	if(!validateInput(filter, id, id, id, minRangeGTZeroErrMsg)) {
		return false;
	}
	
	return true;
}

function validatebManualSequenceMin(filter, id) {
	if(!validateInput(filter, id, id, id, minRangeGTZeroErrMsg)) {
		return false;
	}
	
	return true;
}

function validateSequenceMax(filter, id) {
	if(!validateInput(filter, id, id, id, maxRangeGTZeroErrMsg)) {
		return false;
	}
	
	return true;
}

function validatebManualSequenceMax(filter, id) {
	if(!validateInput(filter, id, id, id, maxRangeGTZeroErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePhoneNumber(filter, id) {
	if(!validateInput(filter, id, id, id, phoneNumberIncorrectErrMsg)) {
		return false;
	}
	
	return true;
}

function validateEmailAddress(filter, id) {
	if(!isValidEmailId(id)) {
		showMessage('info',' Please, enter a valid email address');
		toogleElement(id, 'block');
		return false;
	} else {
		hideAllMessages();
		return true;
	}
}

function validateChequeNumber(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', chequeNumberErrMsg)) {
		return false;
	} else if($('#' + id).val() == 'Cheque No') {
		showMessage('error', chequeNumberErrMsg);
		changeTextFieldColor('chequeNo', '', '', 'red');
		return false;
	}
	
	return true;
}

function validateChequeAmount(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', chequeAmountErrMsg)) {
		return false;
	} else if($('#' + elementId).val() == 'Cheque Amount') {
		showMessage('error', chequeAmountErrMsg);
		changeTextFieldColor(elementId, '', '', 'red');
		return false;
	}
	
	return true;
}

function validateBankName(filter, elementId) {
	if(!validateInputTextFeild(filter, elementId, elementId, 'error', bankNameErrMsg)) {
		return false;
	} else if($('#' + elementId).val() == 'Bank Name') {
		showMessage('error', bankNameErrMsg);
		changeTextFieldColor(elementId, '', '', 'red');
		return false;
	}
	
	return true;
}

function validateChequeDate(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', chequeDateErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePaymentMode(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', paymentModeErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePaymentType(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', paymentTypeErrMsg)) {
		return false;
	}
	
	return true;
}

function validatePanNumber(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', panNumberErrMsg)) {
		return false;
	}
	
	return true;
}
function validateTanNumber(filter, id) {
	let tanNum = document.getElementById(id);
	
	if(tanNum != null && tanNum.value.length >  0){
		let pattern = /^([a-zA-Z]){4}([0-9]){5}([a-zA-Z]){1}?$/;
		
		if(!tanNum.value.match(pattern)){
			showMessage('error',"Invalid TAN Number");
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		} else {
			toogleElement('error','none');
			removeError(id)
			return true;
		}
	}
	
	return true;
}

function checkValidPanNum(id) {
	var panNum 		= document.getElementById(id);
	var pattern 	= /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
	
	if(panNum != null && panNum.value != '' && (panNum.value).trim().length > 0) {
		if(!panNum.value.match(pattern)) {
			showMessage('error', validPanNumberErrMsg);
			changeTextFieldColor(id, '', '', 'red');
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(id, '', '', 'green');
			return true;
		}
	}
	
	return true;
}

function validateExecutive(filter, id) {
	if(!validateInputTextFeild(filter, id, id, 'error', executiveNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateTruckOwnNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', vehicleNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateTruckNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', truckHisabTruckErrMsg)) {
		return false;
	}
	
	return true;
}

function validateLHPVNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validLhpvNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDDMNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validDdmNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateDDMBranch(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', branchNameErrMsg1)) {
		return false;
	}
	
	return true;
}

function validateValidBranch(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validBranchNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateConsignorName(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', consinorNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateValidConsignorName(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validConsinorNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateConsigneeName(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', consineeNameErrMsg)) {
		return false;
	}
	
	return true;
}

function validateConsignorPhoneNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', consinorMobileNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateConsigneePhoneNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', consineeMobileNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateBillingParty(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validBillingPartyErrMsg)) {
		return false;
	}
	
	return true;
}

function validateInterBranchLSNumber(filter, elementID, errorElementId) {
	if(!validateInputTextFeild(filter, elementID, errorElementId, 'error', validInterBranchLSNumberErrMsg)) {
		return false;
	}
	
	return true;
}

function validateTANNumber(filter, id) {
	return validateInputTextFeild(filter, id, id, 'error', tanNumberErrMsg);
}