/**
 * @Author Anant Chaudhary	25-05-2016
 */

/*
* Called in setPartyAutocomplete function in autocomplete.js
* Get Form Type Wise Charges by Party to apply rate
*/
function getFlavourWiseFormTypeWiseCharges(customerId, partyType) {
	switch(formTypeWiseChargesFlavour) {			//formTypeWiseChargesFlavour globally defined
	case '1':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID) {
			getFormTypeWiseCharges(customerId);
		}
		break;
	case '2':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
			getFormTypeWiseCharges(customerId);
		}
		break;
	default:
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID) {
			getFormTypeWiseCharges(customerId);
		}
		break;
	}
}

function getFormTypeWiseCharges(customerId) {
	if(configuration.FormTypeWiseChargeAllow == 'false') {
		return;
	}
	
	totalFormChargeAmount		= 0;
	
	var jsonObject					= new Object();
	jsonObject.branchId				= branchId;  //branchId globally defined
	jsonObject.corporateAccountId	= customerId;
	
	$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/bookingRateWS/getFormTypeWiseChargesByPartyOrBranch.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					if(formTypeWiseCharges == null || formTypeWiseCharges == undefined)
						getFormTypeWiseChargeAmountByBranch();
				} else {
					formTypeWiseCharges	 = data.FormTypeWiseCharges;
				}
			}
	});
}

/*
* Function to get All Charge Weight to increase by party 
*/
function getFormTypeWiseChargeAmountByBranch() {
	if(configuration.FormTypeWiseChargeAllow == 'false') {
		return;
	}
	
	var jsonObject				= new Object();
	jsonObject.branchId			= branchId;  //branchId globally defined
	
	$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/bookingRateWS/getFormTypeWiseChargesByPartyOrBranch.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					console.log("No Form Type Wise Charges");
				} else {
					formTypeWiseChargesByBranch	 = data.FormTypeWiseCharges;
				}
			}
	});
}

/*
 * Called in formTypes.js to apply rate
 */
function getChargeAmountByFormType(formTypeId, checked) {
	if(checked) {
		getTotalFormChargeAmountOnCheck(formTypeId);
	} else {
		getTotalFormChargeAmountOnUnCheck(formTypeId);
	}
}

function setFormTypeChargesArray(formTypeId, chargeAmount) {
	var formTypeChargesArr		= [];
	
	formTypeChargesArr.push({formTypeId:formTypeId, chargeAmount:chargeAmount});
	
	return formTypeChargesArr;
}

function getTotalFormChargeAmountOnCheck(formTypeId) {
	var corporateAccountId	= getValueFromInputField('partyMasterId');
	formChargeAmount		= 0;	// Globally Defined
	
	if (configuration.FormsWithSingleSlection == 'true') {
		totalFormChargeAmount	= 0;
	}
	
	if(formTypeWiseCharges != null && formTypeWiseCharges != undefined) {
		for(var i = 0; i < formTypeWiseCharges.length; i++) {
			var formTypeWiseChargesAmount	= formTypeWiseCharges[i];
	
			if(Number(formTypeWiseChargesAmount.accountGroupId) 			== Number(accountGroupId)
					&& Number(formTypeWiseChargesAmount.branchId) 			== Number(branchId)
					&& Number(formTypeWiseChargesAmount.corporateAccountId) == Number(corporateAccountId)
					&& Number(formTypeWiseChargesAmount.formTypeId) 		== Number(formTypeId)
			) {
				formChargeAmount		= formTypeWiseChargesAmount.chargeAmount;
				totalFormChargeAmount	+= formChargeAmount;
			}
		}
	} else if(formTypeWiseChargesByBranch != null && formTypeWiseChargesByBranch != undefined) {
		for(var i = 0; i < formTypeWiseChargesByBranch.length; i++) {
			var formTypeWiseChargesAmount	= formTypeWiseChargesByBranch[i];
	
			if(Number(formTypeWiseChargesAmount.accountGroupId) 			== Number(accountGroupId)
					&& Number(formTypeWiseChargesAmount.branchId) 			== Number(branchId)
					&& Number(formTypeWiseChargesAmount.formTypeId) 		== Number(formTypeId)
			) {
				formChargeAmount		= formTypeWiseChargesAmount.chargeAmount;
				totalFormChargeAmount	+= formChargeAmount;
			}
		}
	}
	
	setValueToTextField('charge' + ChargeTypeMaster.FORM_CHARGES, totalFormChargeAmount);
}

function getTotalFormChargeAmountOnUnCheck(formTypeId) {
	var corporateAccountId	= getValueFromInputField('partyMasterId');
	formChargeAmount		= 0;	// Globally Defined
	
	if(formTypeWiseCharges != null && formTypeWiseCharges != undefined) {
		for(var i = 0; i < formTypeWiseCharges.length; i++) {
			var formTypeWiseChargesAmount	= formTypeWiseCharges[i];
	
			if(Number(formTypeWiseChargesAmount.accountGroupId) 			== Number(accountGroupId)
					&& Number(formTypeWiseChargesAmount.branchId) 			== Number(branchId)
					&& Number(formTypeWiseChargesAmount.corporateAccountId) == Number(corporateAccountId)
					&& Number(formTypeWiseChargesAmount.formTypeId) 		== Number(formTypeId)
			) {
				formChargeAmount		= formTypeWiseChargesAmount.chargeAmount;
				totalFormChargeAmount	-= formChargeAmount;
			}
		}
	} else if(formTypeWiseChargesByBranch != null && formTypeWiseChargesByBranch != undefined) {
		for(var i = 0; i < formTypeWiseChargesByBranch.length; i++) {
			var formTypeWiseChargesAmount	= formTypeWiseChargesByBranch[i];
	
			if(Number(formTypeWiseChargesAmount.accountGroupId) 			== Number(accountGroupId)
					&& Number(formTypeWiseChargesAmount.branchId) 			== Number(branchId)
					&& Number(formTypeWiseChargesAmount.formTypeId) 		== Number(formTypeId)
			) {
				formChargeAmount		= formTypeWiseChargesAmount.chargeAmount;
				totalFormChargeAmount	-= formChargeAmount;
			}
		}
	}
	
	setValueToTextField('charge' + ChargeTypeMaster.FORM_CHARGES, totalFormChargeAmount);
}