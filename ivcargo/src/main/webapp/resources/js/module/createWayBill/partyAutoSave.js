/**
 * 
 */

function saveParty(partyType, partyName, partyAddress, partyMobileNumber, partyBranchId, gstNumber, setPartyDeatil) {
	var jsonObject					= new Object();

	var CORPORATEACCOUNT_TYPE_BOTH	= 3;

	jsonObject.partyTypeEle_primary_key	= CORPORATEACCOUNT_TYPE_BOTH;
	jsonObject.partyNameEle				= partyName;
	jsonObject.addressEle				= partyAddress;
	jsonObject.mobileNumber1Ele			= partyMobileNumber;
	jsonObject.branchEle				= partyBranchId;
	jsonObject.gstnEle					= gstNumber;
	jsonObject.displayNameEle			= partyName;

	/*var jsonStr = JSON.stringify(jsonObject);

	console.log(jsonStr);*/
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/partyMasterWS/addNewParty.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			setPartyDeatil(data, partyType, partyName, partyMobileNumber, partyAddress, gstNumber);
		}
	});
}

function updateGSTNForPartyAutoSave(partyType) {
	var partyGstNumber 		= '';
	var partyId				= 0;
	if(partyType == 1){
		if (!validateConsignorGstn()) {
			return false;
		}
		
		partyGstNumber 		= $('#consignorGstn').val();
		partyId 			= $('#partyMasterId').val();
	} else {
		if(partyType == 2){
			if (!validateConsigneeGstn()) {
				return false;
			}
			partyGstNumber 		= $('#consigneeGstn').val();
			partyId 			= $('#consigneePartyMasterId').val();
		}
	}
	var jsonObject					= new Object();

	jsonObject.gstNumber			= partyGstNumber;
	jsonObject.corporateAccountId	= partyId;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/partyMasterWS/updatePartyGstNumber.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}
	});
}

