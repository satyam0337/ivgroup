/**
 * 
 */

function setPaymentType(elementId, wayBillId) {

	removeOption(elementId, null);

	createOption(elementId, 0, '-- Select --');

	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_CASH];
	
	if(execFeildPermission != null)
		createNewOption(elementId, 'paymenttypecash_' + wayBillId, PAYMENT_TYPE_CASH_ID, PAYMENT_TYPE_CASH_NAME);

	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_CHEQUE];
	
	if(execFeildPermission != null)
		createNewOption(elementId, 'paymenttypecheque_' + wayBillId, PAYMENT_TYPE_CHEQUE_ID, PAYMENT_TYPE_CHEQUE_NAME);

	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_SHORT_CREDIT];
	
	if(execFeildPermission != null)
		createNewOption(elementId, 'paymenttypecredit_' + wayBillId, PAYMENT_TYPE_CREDIT_ID, PAYMENT_TYPE_CREDIT_NAME);

	execFeildPermission = execFldPermissions[FeildPermissionsConstant.CREDIT_DELIVERY];
	
	if(showbillCredit && execFeildPermission != null)
		createNewOption(elementId, 'paymenttypebillcredit_' + wayBillId, PAYMENT_TYPE_BILL_CREDIT_ID, PAYMENT_TYPE_BILL_CREDIT_NAME);
}

function setSTPaidBy(elementId) {

	removeOption(elementId, null);

	createOption(elementId, 0, '-- Select --');

	for(const element of taxPaidByList) {
		createOption(elementId, element.stPaidByid, element.stPaidByName);
	}
}

function setDefaultSTPaidBy(elementId, waybillTypeId) {

	switch (waybillTypeId) {
	case WAYBILL_TYPE_PAID:
		$('#'+elementId).val(configuration.DeliveryDefaultSTPaidByForPaid);
		break;

	case WAYBILL_TYPE_TO_PAY:
		$('#'+elementId).val(configuration.DeliveryDefaultSTPaidByForToPay);
		break;

	case WAYBILL_TYPE_CREDIT:
		$('#'+elementId).val(configuration.DeliveryDefaultSTPaidByForTBB);
		break;

	case WAYBILL_TYPE_FOC:
		$('#'+elementId).val(configuration.DeliveryDefaultSTPaidByForFOC);
		break;
	default : 
		$('#'+elementId).val(configuration.DeliveryDefaultSTPaidBy);
	}
}

function setDeliverySequenceCounter() {

	if (!(jsondata.DeliverySequenceCounter)) {
		$('#manualSequenceDefined').html('[ CR Manual Sequence not defined !! ]');
		return true;
	}

	$('#deliverySequenceCounter').switchClass("show", "hide");

	let DSCounter	= jsondata.DeliverySequenceCounter;

	$('#MaxRange').val(DSCounter.maxRange);
	$('#MinRange').val(DSCounter.minRange);
	$('#manualCRDate').val(date(new Date(), "-"));
	$('#sequenceRange').html(DSCounter.minRange + ' - ' + DSCounter.maxRange);
}

function setDiscountType(elementId) {

	removeOption(elementId, null);

	let discountTypes = jsondata.discountTypes;

	createOption(elementId, 0, '--Select--');

	if(!jQuery.isEmptyObject(discountTypes)) {
		for(const element of discountTypes) {
			createOption(elementId, element.split("_")[0], element.split("_")[1]);
		}
	}
}

function setTaxes() {

	let taxes	= jsondata.taxes;

	if (!configuration.DeliveryTimeServiceTax) {
		return;
	}

	if(jQuery.isEmptyObject(taxes)) {
		return;
	}

	taxableAmount	= taxes[0].leastTaxableAmount;

	for (const element of taxes) {
		createTaxesInput(element);
	}
}

function createTaxesInput(taxes) {

	let jsonObject1	= new Object();
	let jsonObject2	= new Object();

	let tableRow1	= null;
	let tableCol1	= null;
	let tableCol2	= null;
	let taxvalue	= null;	
	let input2		= null;

	tableRow1	= createRow('tr_'+taxes.taxModelId+"1",'');
	tableCol1	= createColumn(tableRow1, 'td_'+taxes.taxModelId+'_1','60%','left','','');

	taxvalue	= taxes.taxName;

	if (taxes.isTaxPercentage) {
		let taxAmnt = (taxes.taxAmount).toFixed(2);
		taxvalue	+= ' '+taxAmnt + '%';
	}

	createLabel(tableCol1, taxes.taxName, taxvalue, '', 'width-100px', '');
	tableCol2	= createColumn(tableRow1,'td_'+taxes.taxModelId+'_2','40%','right','','');

	jsonObject1.id				= 'tax'+taxes.taxMasterId;
	jsonObject1.type			= 'text';
	jsonObject1.name			= 'tax'+taxes.taxMasterId;
	jsonObject1.class			= 'width-100px text-align-right';
	jsonObject1.readonly		= true;

	jsonObject2.id				= 'Perctax'+taxes.taxMasterId;
	jsonObject2.type			= 'checkbox';
	jsonObject2.value			= (taxes.taxAmount).toFixed(2);
	jsonObject2.name			= 'Perctax'+taxes.taxMasterId;
	jsonObject2.class			= 'hide';

	if (taxes.isTaxPercentage) {
		jsonObject1.value			= 0;

		createInput(tableCol2, jsonObject1);
		input2			= createInput(tableCol2, jsonObject2);
		$(input2).attr('checked','checked');
	} else {
		jsonObject1.value			= (taxes.taxAmount).toFixed(2);
		jsonObject2.readonly		= true;

		createInput(tableCol2, jsonObject1);
		createInput(tableCol2, jsonObject2);
	}

	$('#taxes').append(tableRow1);
}

function setReceivableTypes(elementId, wayBillId) {
	operationOnSelectTag(elementId, 'removeAll', '', '');
	
	operationOnSelectTag(elementId, 'addNew', '--Select--', 0);
	
	let receivableTypeArr		= (configuration.ReceivableTypeListByOrder).split(',');
	
	for(const element of receivableTypeArr) {
		createReceivableTypeListByOrder(element, elementId);
	}
}

function createReceivableTypeListByOrder(receivableTypeId, elementId) {
	switch (parseInt(receivableTypeId)) {
	case ReceivableTypeConstant.CONSINEE_COPY_ID:
		operationOnSelectTag(elementId, 'addNew', ReceivableTypeConstant.CONSINEE_COPY_NAME, ReceivableTypeConstant.CONSINEE_COPY_ID);
		break;
	case ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID:
		operationOnSelectTag(elementId, 'addNew', ReceivableTypeConstant.AGAINST_LETTER_HEAD_NAME, ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID);
		break;
	case ReceivableTypeConstant.AGAINST_BOND_ID:
		operationOnSelectTag(elementId, 'addNew', ReceivableTypeConstant.AGAINST_BOND_NAME, ReceivableTypeConstant.AGAINST_BOND_ID);
		break;
	case ReceivableTypeConstant.NOT_APPLICABLE_ID:
		operationOnSelectTag(elementId, 'addNew', ReceivableTypeConstant.NOT_APPLICABLE_NAME, ReceivableTypeConstant.NOT_APPLICABLE_ID);
		break;
	default:
		break;
	}
}

function setDefaultReceivableType(wayBillId) {
	switch (parseInt(configuration.DefaultReceivableType)) {
	case ReceivableTypeConstant.CONSINEE_COPY_ID :
		setValueToTextField('receivable_' + wayBillId, ReceivableTypeConstant.CONSINEE_COPY_ID);
		switchHtmlTagClass('approvedBy_' + wayBillId, 'hide', 'show');
		break;

	case ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID :
		setValueToTextField('receivable_' + wayBillId, ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID);
		break;

	case ReceivableTypeConstant.AGAINST_BOND_ID :
		setValueToTextField('receivable_' + wayBillId, ReceivableTypeConstant.AGAINST_BOND_ID);
		break;

	case ReceivableTypeConstant.NOT_APPLICABLE_ID :
		setValueToTextField('receivable_' + wayBillId, ReceivableTypeConstant.NOT_APPLICABLE_ID);
		break;
		
	default:
		break;
	}
}

function setConsineeDetails(partyId, wayBillId) {
	
	let jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.partyPanelType		= 1;
	jsonObject.partyType			= PartyMaster.PARTY_TYPE_CONSIGNEE;
	
	let jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {

					console.log(data);

					if(!data.partyDetails) {
						return;
					}

					let party = data.partyDetails;
					
					setValueToTextField('consigneeNameId_' + wayBillId, partyId);
					setValueToTextField('consigneeNameAutocomplete_' + wayBillId, party.name);
					setValueToTextField('consigneePartyAddress_' + wayBillId, party.address);
					setValueToTextField('consigneePartyPincode_' + wayBillId, party.pincode);
					setValueToTextField('consigneeConsineePerson_' + wayBillId, party.contactPerson);
					setValueToTextField('consigneePhoneNumber_' + wayBillId, party.phoneNumber);
					setValueToTextField('consigneeMobileNumber_' + wayBillId, party.mobileNumber);
					setValueToTextField('consigneeBillingPartyId_' + wayBillId, 0);
					setValueToTextField('consigneePartyType_' + wayBillId, party.corporateAccountType);
				}
			});
}

function setPaymentTypeForAll(elementId) {

	$('#' + elementId).find('option').remove().end();
	$('#' + elementId).append('<option value="' + 0 + '">-- Select --</option>');

	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(const element of paymentTypeArr) {
			if(element != null) {
				$('#' + elementId).append('<option value="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
			}
		}
	}
}

function setDeliveryCashPaymentTypeForMultipleLr() {
	var tableEl 		= document.getElementById(tableId);
	var wayBillId 		= 0;
	var consignorGstn	= null;
	var consigneeGstn	= null;
	var paymentFlag	= false;
	
	if(configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == 'true'|| configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == true){
		
		for (var i = 1, row; row = tableEl.rows[i]; i++) {
		if(document.getElementById('LRRow_' + row.id))
			wayBillId = document.getElementById('LRRow_' + row.id).value;
		
		if(wayBillId > 0) {
		consignorGstn = document.getElementById('ConsignorGstn_' + wayBillId).innerHTML;
		consigneeGstn = document.getElementById('ConsigneeGstn_' + wayBillId).innerHTML;
		
			if ((consignorGstn == null || consignorGstn == '--') && (consigneeGstn == null || consigneeGstn == '--')) {
				if ( $('#deliveryPaymentType').val() != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
					paymentFlag = true;
					$('#deliveryPaymentType').val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
					setTimeout(function(){ 
						$('#deliveryPaymentType').focus(); 
						showMessage('info', " Please update consignor and consignee GST ");	
					}, 200);
				}
			}
		}
	}
	
	if(paymentFlag){
		for (var i = 1, row; row = tableEl.rows[i]; i++) {
		if(document.getElementById('LRRow_' + row.id))
			wayBillId = document.getElementById('LRRow_' + row.id).value;
		
			if(wayBillId > 0) {
				$("#deliveryPaymentType_" + wayBillId).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			}
		}
	}
	}
}


function validateVehicleNumberOnBlur() {
	
	var truckNumber	= $("#VehicleNumber").val().trim();
	vehicleNumber	= truckNumber.toUpperCase();
	var pattern  = /^(?:[a-zA-z]{2}[0-9]{2}[a-zA-z]{1,2}[0-9]{4}|[a-zA-z]{2}[ -][0-9]{2}[ -][a-zA-z]{1,2}[ -][0-9]{4})$/;

	if(truckNumber != undefined && truckNumber != ''){
		if (truckNumber.match(pattern) || truckNumber.toUpperCase().includes("OTH")){
			return true;
		} else {
			$('#VehicleNumber').focus();
			$("#VehicleNumber").val("")
			showMessage('error', " Vehicle Number "+ truckNumber +" is Invalid !");	
			vehicleNumber			= null;
			vehicleNumberMasterId	= 0;
			return false;
		}						
	}
}

function showDeliveryCreditorName(val){
	if(configuration.showCentralizedDeliveryCreditor) {
		if(deliveryPaymentType.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
			$('.DeliveryCreditorNamediv').removeClass('hide')
			$('#DeliveryCreditorName').focus()
		} else {
			$('#DeliveryCreditorName').val('')
			$('.DeliveryCreditorNamediv').addClass('hide')
		}
	}
}