let isValidConsignorGst = false;
let validatedConsignorGst = '';
let isValidConsigneeGst = false;
let validatedConsigneeGst = '';
var consignorGSTNVal;
var consigneeGSTNVal;

function validateGSTNumberByApi(partyType) {
	if (isGSTNumberWiseBooking()) {
		setTimeout(function() { validateGSTNumberByApi1(partyType) }, 600);
	} else
		validateGSTNumberByApi1(partyType);
}

function validateGSTNumberByApi1(partyType) {
	if (!isValidGSTChecking())
		return;
		
	if (isGSTNumberWiseBooking()) {
		consignorGSTNVal = $('#consignoCorprGstn').val();
		consigneeGSTNVal = $('#consigneeCorpGstn').val();
	} else {
		consignorGSTNVal = $('#consignorGstn').val();
		consigneeGSTNVal = $('#consigneeGstn').val();
	}
	
	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && partyType == CUSTOMER_TYPE_CONSIGNOR_ID
	    && configuration.doNotValidateNormalPartyGstNumberFromAPIForTBBBooking == 'true'){
		return;
	}
	
	var jsonObject = new Object();
	
	if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID) {
		jsonObject["gstn"] 		= consignorGSTNVal;
		jsonObject.partyNameEle = $('#consignorName').val();
		jsonObject.partyId 		= $('#partyMasterId').val();
		jsonObject.isConsignorTBBParty 		= isConsignorTBBParty;
		jsonObject.partyType 				= partyType;
		
		if (!checkGSTNumberEntered(consignorGSTNVal) || isValidConsignorGst && consignorGSTNVal == validatedConsignorGst)
			return;
	} else if (partyType == CUSTOMER_TYPE_CONSIGNEE_ID) {
		jsonObject["gstn"] 		= consigneeGSTNVal;
		jsonObject.partyNameEle = $('#consigneeName').val();
		jsonObject.partyId 		= $('#consigneePartyMasterId').val();
		jsonObject.isConsigneeTBBParty 		= isConsigneeTBBParty;
		jsonObject.partyType 				= partyType;
		
		if (!checkGSTNumberEntered(consigneeGSTNVal) || isValidConsigneeGst && consigneeGSTNVal == validatedConsigneeGst)
			return;
	}
	
	jsonObject.doNotValidateGstNumberFromAPIForTBBParty	= configuration.doNotValidateGstNumberFromAPIForTBBParty;

	showLayer();
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/FetchGSTDetailsWS/validateGSTNumberByApi.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			hideLayer();
			
			if (data == undefined || data.gstDetails == undefined || !data.isValidGSTNumber) {
				showMessage('error', 'Enter Valid GST Number !');
			
				if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID) {
					$('#consignorGstn').val('');
					$('#consignoCorprGstn').val('');
				} else if (partyType == CUSTOMER_TYPE_CONSIGNEE_ID) {
				 	$('#consigneeGstn').val('');
					$('#consigneeCorpGstn').val('');
				}
				
				return;
			}
						
			if (configuration.doNotValidateGstNumberFromAPIForTBBParty == 'true' || configuration.doNotValidateGstNumberFromAPIForTBBParty == true) {
				if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID && isConsignorTBBParty)
					return;
				
				if (partyType == CUSTOMER_TYPE_CONSIGNEE_ID && isConsigneeTBBParty)
					return;
			}

			if (data.exceptionCode == 404)
				showMessage('error', 'Server not found !');
				
			if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID) {
				if ($('#consignorName').val() != data.gstDetails.tradeName) {
					$('#consignorName').val(data.gstDetails.tradeName);
					$('#newPartyName').val(data.gstDetails.tradeName);
					
				if (configuration.displayAddressWhenDataSearchByGstApi == 'true' || configuration.displayAddressWhenDataSearchByGstApi == true) 
					$('#consignorAddress').val(data.gstDetails.fullAddress)
					
					hideLayer();			
				} 
	
				if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == true || configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true') 
					disablePartyDetailsOnGstn(partyType);
			}

			if (partyType == CUSTOMER_TYPE_CONSIGNEE_ID) {
				if ($('#consigneeName').val() != data.gstDetails.tradeName) {
					$('#consigneeName').val(data.gstDetails.tradeName);
					$('#newPartyName').val(data.gstDetails.tradeName);
					
				if (configuration.displayAddressWhenDataSearchByGstApi == 'true' || configuration.displayAddressWhenDataSearchByGstApi == true) 
					$('#consigneeAddress').val(data.gstDetails.fullAddress)
					
					hideLayer();
				}
			
				if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == true || configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true') 
					disablePartyDetailsOnGstn(partyType);
			}
			
			if(jsonObject.partyId == 0 || configuration.selectDeliveryTypeFromPartyMaster == 'true')
				partyCheckAndInsertOnGstNumber($('#consignorName').val(), consignorGSTNVal, $('#consigneeName').val(), consigneeGSTNVal, partyType)
		}
	});
}

function isValidGSTChecking() {
	if ((configuration.gstValidationGroupLevel == 'false' || configuration.gstValidationGroupLevel == false) 
		&& (configuration.gstValidationBranchLevel == 'false' || configuration.gstValidationBranchLevel == false))
		return false;

	if (configuration.gstValidationBranchLevel == 'true' &&  configuration.branchIdsForGstValidation != undefined) {
		let branchIdsArray = (configuration.branchIdsForGstValidation).split(',');

		if (!isValueExistInArray(branchIdsArray, branchId))
			return false;
	}
	
	return true;
}

function partyCheckAndInsertOnGstNumber(consginorName, consignorGstn, consgineeName, consigneeGstn, partyType) {
	var jsonObject				= new Object();
	jsonObject.consignorGstn		= consignorGstn;
	jsonObject.consigneeGstn		= consigneeGstn;
	jsonObject.consignorName		= consginorName;
	jsonObject.consigneeName		= consgineeName;
	jsonObject.isAlloWPartyAtAnyLevel	= true;
	jsonObject.isTokenWayBill		= isTokenWayBill;
	jsonObject.singleEwaybillNo		= $('#singleEwaybillNo').val();
	jsonObject.destinationBranchId	= $('#destinationBranchId').val();
	jsonObject.wayBillTypeId		= $('#wayBillType').val();
	jsonObject.applyRateAuto		= !isManualWayBill && (configuration.applyRateAuto == 'true' || configuration.applyRateAuto == true) || isManualWayBill && (configuration.ApplyRateInManual == 'true' || configuration.ApplyRateInManual == true);
	jsonObject.consignorAddress		= $('#consignorAddress').val();
	jsonObject.consigneeAddress		= $('#consigneeAddress').val();

	showLayer();
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/partyMasterWS/checkAndInsertPartyOnGSTEwaybill.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			var consignorDetails = data.ConsignorDetails;
			var consigneeDetails = data.ConsigneeDetails;
			isConsignorTBBParty	= data.isConsignorTBBParty;
			isConsigneeTBBParty	= data.isConsigneeTBBParty;
			hideLayer();
			
			cnorPartyDeliveryAt = 0
			cneePartyDeliveryAt	= 0;
			
			if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID && consignorDetails != undefined) {
				isConsignorGSTNPresent = true;
				cnorPartyDeliveryAt = consignorDetails.deliveryAt;
				setConsignorEwaybill(consignorDetails, jsonObject.consignorGstn);
				$("#consignorPhn").val('1111111111');
			}

			if (partyType == CUSTOMER_TYPE_CONSIGNEE_ID && consigneeDetails != undefined) {
				cneePartyDeliveryAt	 = consigneeDetails.deliveryAt;
				setConsigneeEwaybill(consigneeDetails, jsonObject.consigneeGstn);
				$("#consigneePhn").val('1111111111');
			}
			
			setDeliveryAtFromPartyMaster();
		}
	});
}

function disablePartyDetailsOnGstn(partyType){
	if((partyType == CUSTOMER_TYPE_CONSIGNOR_ID)) {
		setTimeout(function() {
			$("#consignorName").attr("readonly", true);
			isConsignorGstnValidatedFromApi = true;
		}, 500);
	}
	
	if((partyType == CUSTOMER_TYPE_CONSIGNEE_ID)) {
		setTimeout(function() {
			$("#consigneeName").attr("readonly", true);
			isConsigneeGstnValidatedFromApi = true;
		}, 500);
	}
}