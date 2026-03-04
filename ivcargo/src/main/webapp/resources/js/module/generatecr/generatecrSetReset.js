/**
 * 
 */
var TAX_PAID_BY_CONSINGOR_ID	= 1;
var TAX_PAID_BY_CONSINGEE_ID	= 2;
var TAX_PAID_BY_TRANSPORTER_ID	= 3;

function setCharges(chargemodel, tablename, chargeType) {
	var charges	= chargemodel;
	
	for ( var i = 0; i < charges.length; i++) {
		createChargeInput(charges[i], tablename, chargeType);
	}
}

function createChargeInput(charge, tablename, chargeType) {

	var inputAttr1		= new Object();
	var inputAttr2		= new Object();
	var divAttr1		= new Object();
	var chargeId		= charge.chargeTypeMasterId;
	var tableRow		= createRow('tr_'+chargeId,'');
	var tableCol1		= createColumn(tableRow,'td_'+chargeId,'60%','left','','');
	var tableCol		= createColumn(tableRow,'td_'+chargeId,'40%','right','','');

	inputAttr1.id			= 'deliveryCharge'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'deliveryCharge'+chargeId;
	inputAttr1.class		= 'width-100px text-align-right';
	inputAttr1.maxlength	= 6;
	inputAttr1.style		= 'font-weight: bold; font-size : 14px;';

	if (chargeType == BOOKING_CHARGE) {
		inputAttr1.readonly		= true;
	}

	if (chargeType == DELIVERY_CHARGE) {
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+'; getPrevNextCharge(this);';
		if(configuration.allowOnlyNumericInCharges == 'true')
		    inputAttr1.onkeypress	= 'return allowDecimalCharacterOnly(event);';
		else
			inputAttr1.onkeypress	= 'return noNumbers(event);';
			
		inputAttr1.onkeyup		= 'calulateBillAmount();changeRecAmount();';
		inputAttr1.onkeydown	= 'hideAllMessages();';
		
		inputAttr1.onpaste		= 'removeSpecialCharacterAfterPaste(this);';
		
		if(configuration.IsUserDefinedRateAllow == 'false') {
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); applyRates();checkDeliveryChargesRates(this);calulateBillAmount();chargeValidation("' + chargeId + '");';
		} else {
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); checkDeliveryChargesRates(this);calulateBillAmount();chargeValidation("' + chargeId + '");';
		}

		if (configuration.OctroiValidate == 'true') {
			if (chargeId == DeliveryChargeConstant.OCTROI_SERVICE) {
				if(configuration.IsUserDefinedRateAllow == 'false') {
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0); applyRates();calulateBillAmount(); chargeValidation(ChargeTypeMaster.OCTROI_SERVICE);';
				} else {
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); calulateBillAmount(); chargeValidation(ChargeTypeMaster.OCTROI_SERVICE);';
				}
				inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
				inputAttr1.onkeyup		= 'chargeValidation(ChargeTypeMaster.OCTROI_SERVICE);changeRecAmount();';
			}
			if (chargeId == DeliveryChargeConstant.OCTROI_DELIVERY) {
				if(configuration.IsUserDefinedRateAllow == 'false') {
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0);applyRates(); calulateBillAmount(); chargeValidation(ChargeTypeMaster.OCTROI_SERVICE);';
				} else {
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); calulateBillAmount(); chargeValidation(ChargeTypeMaster.OCTROI_SERVICE);';
				}
				inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
				inputAttr1.onkeyup		= 'chargeValidation(ChargeTypeMaster.OCTROI_DELIVERY);calulateBillAmount();changeRecAmount();';
			}
		}
		if (chargeId == DeliveryChargeConstant.DAMERAGE) {
			if(configuration.IsUserDefinedRateAllow == 'false') {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); applyRates();calulateBillAmount(); chargeValidation(ChargeTypeMaster.DAMERAGE);';
			} else {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); calulateBillAmount(); chargeValidation(ChargeTypeMaster.DAMERAGE);';
			}
			
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			inputAttr1.onkeyup		= 'chargeValidation(ChargeTypeMaster.DAMERAGE);calulateBillAmount();changeRecAmount();';
		}
		if (chargeId == DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY) {
			if(configuration.IsUserDefinedRateAllow == 'false') {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); applyRates();calulateBillAmount(); chargeValidation(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY);';
			} else {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); calulateBillAmount(); chargeValidation(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY);';
			}
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			inputAttr1.onkeyup		= 'chargeValidation(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY);calulateBillAmount();changeRecAmount();';
		}
		if (chargeId == DeliveryChargeConstant.DR_CHARGE) {
			if(configuration.IsUserDefinedRateAllow == 'false') {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); applyRates();calulateBillAmount(); chargeValidation(ChargeTypeMaster.DR_CHARGE);';
			} else {
				inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calculateOctroiCharge("' + chargeId + '",false); calulateBillAmount(); chargeValidation(ChargeTypeMaster.DR_CHARGE);';
			}
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			inputAttr1.onkeyup		= 'chargeValidation(ChargeTypeMaster.DR_CHARGE);calulateBillAmount();changeRecAmount();';
		}
	}

	createLabel(tableCol1, 'label'+chargeId, charge.displayName , 'font-size: 14px;', 'width-100px', 'Charges'); //to change chargename to display name
	var newInput = createInput(tableCol,inputAttr1);

	newInput.attr('data-chargeid', chargeId);

	inputAttr2.id			= 'actualInput'+chargeId;
	inputAttr2.type			= 'hidden';
	inputAttr2.value		= '0';
	inputAttr2.name			= 'actualInput'+chargeId;

	createInput(tableCol,inputAttr2);

	$('#' +tablename).append(tableRow);
	
	var disableSpecificCharges 		= configuration.disableSpecificCharges;
	var disableChargeIds			= null;
	var disableChargeIdArray 		= new Array();
	
	if(disableSpecificCharges || disableSpecificCharges == 'true') {
		disableChargeIds 				= configuration.disableChargeIds;
		disableChargeIdArray			= disableChargeIds.split(",");
		
		if(disableChargeIdArray != null && disableChargeIdArray.length > 0) {
			for (i = 0; i < disableChargeIdArray.length; i++) {
				 chargeId		= disableChargeIdArray[i];
				 disableCharge(disableChargeIdArray[i]);
			}
		}

	}
	
	if(charge.chargeTypeMasterId == 16 && executive.branchId == 13681){
		disableCharge(charge.chargeTypeMasterId);
	}
}

function setDeliveryDetails(consigneeDetails) {
	$('#deliveredToName').val(consigneeDetails.name);
	$('#deliveredToPhoneNo').val(consigneeDetails.phoneNumber);

	var partyCode	= consigneeDetails.partyCode;

	if(typeof partyCode !== 'undefined' && partyCode != null)
		$('#deliveredToName').val(consigneeDetails.partyCode);
}

function setPaymentType(elementId, paymentTypeArr) {

	$('#' + elementId).find('option').remove().end();
	$('#' + elementId).append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');

	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(var i = 0; i < paymentTypeArr.length; i++) {
			if(paymentTypeArr[i] != null)
				$('#' + elementId).append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
		}
	}
}

function setdeliveryCashPaymentType() {
	if(configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == 'true'|| configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == true){
		if ((consignorGstn == null || consignorGstn == '--') && (consigneeGstn == null || consigneeGstn == '--')) {
			if ( $('#deliveryPaymentType').val() != PAYMENT_TYPE_CASH_ID) {
				$('#deliveryPaymentType').val(PAYMENT_TYPE_CASH_ID);
				setTimeout(function(){ 
					$('#deliveryPaymentType').focus(); 
					showMessage('info', " Please update consignor and consignee GST ");	    
				}, 200);
			}
		}
	}
	
	if(configuration.validateLRTypeWiseConsigneeGSTInCashlessPayment == 'true') {	
		let lrTypeArr	= (configuration.lrTypesToValidateConsigneeGSTInCashlessPayment).split(",");
		
		if ((consigneeGstn == null || consigneeGstn == '--') && isValueExistInArray(lrTypeArr, Number($('#waybillTypeId').val()))) {
			if ($('#deliveryPaymentType').val() != PAYMENT_TYPE_CASH_ID
					&& $('#deliveryPaymentType').val() != PAYMENT_TYPE_CREDIT_ID
					&& $('#deliveryPaymentType').val() != PAYMENT_TYPE_BILL_CREDIT_ID) {
				setTimeout(function() { 
					showMessage('error', " Please update Consignee GST For cashless payment");	    
				}, 200);
			}
		}
	}
}

function setDefaultPaymentType(DefaultPaymentType){
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_SHORT_CREDIT];
	
	if(execFeildPermission != null) {
		if(configuration.SearchCollectionPersonAutocomplete == "true" && DefaultPaymentType == PAYMENT_TYPE_CREDIT_ID) {
			$('#tableSearchCollectionPerson').switchClass("show", "hide");
			changeDisplayProperty('searchCollectionPerson', 'table-cell');
		}
		
		setValueToTextField('deliveryPaymentType', DefaultPaymentType);
	} else
		setValueToTextField('deliveryPaymentType', 0);
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_CASH];
	
	if(execFeildPermission != null)
		setValueToTextField('deliveryPaymentType', DefaultPaymentType);
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.DELIVERY_TIME_PAYMENT_CHEQUE];
	
	if(execFeildPermission != null)
		setValueToTextField('deliveryPaymentType', DefaultPaymentType);
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.CREDIT_DELIVERY];
	
	if(showbillCredit && execFeildPermission != null)
		setValueToTextField('deliveryPaymentType', DefaultPaymentType);
}

function validateDeliveryTypeOnPaymentTypeChange() {
	if(configuration.isDeliveryTimeShortCreditAllowedOnGodownDelivery == 'false') {
		if((deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID) && ($('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID)){
			setValueToTextField('deliveryPaymentType', configuration.DefaultPaymentType);
			showMessage('info', 'You can not select Short Credit for Godown Delivery LR');
			return false;
		}
	}

	return true;
}

function disableDiscountOnShortCredit() {
	if(configuration.disableDiscountOnShortCreditDelivery == 'false' || configuration.disableDiscountOnShortCreditDelivery == false)
		return;
	
	if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY && $('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID) {
		$('#txtDelDisc').val(0);
		$('#txtDelDisc').prop("readonly", true);
		$('#discountTypes').prop("disabled", true);
	} else {
		$('#txtDelDisc').prop("readonly", false);
		$('#discountTypes').prop("disabled", false);
	}
}

function applyDiscountFieldLogic() {
	const waybillType = $('#waybillTypeId').val();
	const $deliveryPaymentElem = $('#deliveryPaymentType');
	const deliveryPayment = $deliveryPaymentElem.length > 0 ? $deliveryPaymentElem.val() : null;

	const isHideDiscount	= configuration.hideDiscountOnLrTypeTbb == "true";
	const isDisableDiscount = configuration.disableDiscountOnShortCreditDelivery !== "false" && configuration.disableDiscountOnShortCreditDelivery !== false;

	let shouldDisable = false;

	if (isHideDiscount)
		shouldDisable = waybillType == WAYBILL_TYPE_CREDIT
					|| waybillType == WAYBILL_TYPE_TO_PAY && deliveryPayment == PAYMENT_TYPE_BILL_CREDIT_ID && configuration.showDiscountOnBillCredit == "false";

	if (!shouldDisable && isDisableDiscount && waybillType == WAYBILL_TYPE_TO_PAY && deliveryPayment == PAYMENT_TYPE_CREDIT_ID)
		shouldDisable = true;

	if (shouldDisable) {
		$('#txtDelDisc').val(0).attr("readonly", "readonly");
		$('#discountTypes').attr("disabled", "disabled");
	} else {
		$('#txtDelDisc').removeAttr("readonly");
		$('#discountTypes').removeAttr("disabled");
	}
	
	calulateBillAmount();
}

function validatePartyOnShortCreditPayment(){
	if(configuration.allowShortCreditPaymentForSavedParties == 'false' || configuration.allowShortCreditPaymentForSavedParties == false)
		return true;
	
	if (($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY) && ($('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID)) {
		var consigneeId = $('#consigneeCorpAccId').val();

		if(consigneeId <= 0){
			setTimeout(function(){ 
				$('#deliveryPaymentType').val(0);
				$('#deliveryPaymentType').focus(); 
				showMessage('info', " Short Credit Not Allowed For Consignee Party !");	
			}, 200);
			return false;
		}

		return true;
	}
}

function setSTPaidBy() {
	removeOption('STPaidBy', null);

	createOption('STPaidBy', 0, 'GST Paid By');

 	if(configuration.disableConsignorOption != 'true')
 		createOption('STPaidBy', TAX_PAID_BY_CONSINGOR_ID, TAX_PAID_BY_CONSINGOR_NAME);
	
	createOption('STPaidBy', TAX_PAID_BY_CONSINGEE_ID, TAX_PAID_BY_CONSINGEE_NAME);
	
	if(configuration.disableTransporterOption != 'true')
		createOption('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
}

function setDeliverySequenceCounter() {
	/*if(configuration.hideMannualCRSequenceMsg == 'true'){
		$('#manualSequenceDefined').switchClass("hide", "show");
	} else {
		
	}*/
	
	if (!(jsondata.DeliverySequenceCounter)) {
		//showMessage('info',manualCrSequenceErr);
		return true;
	}

	$('#deliverySequenceCounter').switchClass("show", "hide");

	var DSCounter	= jsondata.DeliverySequenceCounter;

	$('#MaxRange').val(DSCounter.maxRange);
	$('#MinRange').val(DSCounter.minRange);
	$('#manualCRDate').val(date(new Date(curDate),"-"));
	$('#sequenceRange').html(DSCounter.minRange + ' - ' + DSCounter.maxRange);
	
}

function setDiscountType() {
	if (!isDeliveryDiscountAllow) {
		if ($('#discountTR').exists())
			$('#discountTR').switchClass("hide", "show");

		if ($('#discountTypesTR').exists())
			$('#discountTypesTR').switchClass("hide", "show");
		
		return;
	}

	removeOption('discountTypes',null);

	var discountTypes = jsondata.discountTypes;

	createOption('discountTypes',0, '--Select--');

	if(!jQuery.isEmptyObject(discountTypes)) {
		for(var i = 0; i < discountTypes.length; i++) {
			createOption('discountTypes', discountTypes[i].split("_")[0], discountTypes[i].split("_")[1]);
		}
	}
}

function setTaxes(wayBillId) {
	if (configuration.DeliveryTimeServiceTax != 'true' && configuration.DeliveryTimeServiceTax != true)
		return;

	if(jQuery.isEmptyObject(taxes))
		return;

	taxableAmount	= taxes[0].leastTaxableAmount;

	for (var i = 0; i < taxes.length; i++) {
		createTaxesInput(taxes[i], wayBillId);
	}
}

function createTaxesInput(taxes, wayBillId) {
	var jsonObject1	= new Object();
	var jsonObject2	= new Object();
	var jsonObject3	= new Object();
	var jsonObject4	= new Object();
	var jsonObject5	= new Object();

	var tableRow1	= null;
	var tableCol1	= null;
	var tableCol2	= null;
	var taxvalue	= null;	
	var label		= null;
	var input1		= null;
	var input2		= null;

	tableRow1	= createRow('tr_'+taxes.taxModelId+"1",'');
	tableCol1	= createColumn(tableRow1, 'td_'+taxes.taxModelId+'_1','60%','left','','');

	taxvalue	= taxes.taxName;

	if (taxes.isTaxPercentage) {
		var taxAmnt = (taxes.taxAmount).toFixed(2);
		taxvalue	+= ' '+taxAmnt + '%';
	}

	label		= createLabel(tableCol1, taxes.taxName, taxvalue, 'font-size: 14px;', 'width-100px', '');
	tableCol2	= createColumn(tableRow1,'td_' + taxes.taxModelId+'_2','40%','right','','');

	jsonObject1.id				= 'tax_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject1.type			= 'text';
	jsonObject1.name			= 'tax_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject1.class			= 'width-100px text-align-right';
	jsonObject1.readonly		= true;
	jsonObject1.style			= 'font-weight: bold; font-size : 14px;';

	jsonObject2.id				= 'Perctax_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject2.type			= 'checkbox';
	jsonObject2.value			= (taxes.taxAmount).toFixed(2);
	jsonObject2.name			= 'Perctax_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject2.class			= 'hide';
	jsonObject2.style			= 'font-weight: bold; font-size : 14px;';

	jsonObject3.id				= 'actualTax_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject3.type			= 'hidden';
	jsonObject3.name			= 'actualTax_' + taxes.taxMasterId + '_' + wayBillId;
	
	jsonObject4.id				= 'unAddedST_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject4.type			= 'hidden';
	jsonObject4.name			= 'unAddedST_' + taxes.taxMasterId + '_' + wayBillId;
	
	jsonObject5.id				= 'calculateSTOnAmount_' + taxes.taxMasterId + '_' + wayBillId;
	jsonObject5.type			= 'hidden';
	jsonObject5.name			= 'calculateSTOnAmount_' + taxes.taxMasterId + '_' + wayBillId;

	if (taxes.isTaxPercentage) {
		jsonObject1.value			= 0;

		input1			= createInput(tableCol2, jsonObject1);
		input2			= createInput(tableCol2, jsonObject2);
		
		$(input2).attr('checked','checked');
	} else {
		jsonObject1.value			= (taxes.taxAmount).toFixed(2);
		jsonObject2.readonly		= true;

		input1		= createInput(tableCol2, jsonObject1);
		input2		= createInput(tableCol2, jsonObject2);
	}
	
	createInput(tableCol2, jsonObject3);
	createInput(tableCol2, jsonObject4);
	createInput(tableCol2, jsonObject5);

	$('#taxes').append(tableRow1);
}

function setAutocompleters() {
	//All Function calling from generateCrAutoComplete.js file
	setDeliveryCreditorAutoComplete();
	setSearchCollectionPersonAutoComplete();
	setDeliveredToNameAutoComplete();
	//setConsineeNameAutoComplete('consigneeNameAutocomplete');
	
	if (configuration.BankPaymentOperationRequired == 'true' || configuration.BankPaymentOperationRequired == true) {
		setIssueBankAutocomplete();
		setAccountNoAutocomplete();
	}
}

function setDefaultSTPaidBy(waybillTypeId) {
	
	switch (waybillTypeId) {
	case WayBillType.WAYBILL_TYPE_PAID:
		if(changeStPaidbyOnPartyGSTN){
			if(consignorGstn == null || consignorGstn == '--')
				setValueToTextField('STPaidBy',TAX_PAID_BY_TRANSPORTER_ID);
			else
				setValueToTextField('STPaidBy',TAX_PAID_BY_CONSINGOR_ID);
		} else
		   setValueToTextField('STPaidBy', configuration.DeliveryDefaultSTPaidByForPaid);
		
		break;

	case WayBillType.WAYBILL_TYPE_TO_PAY:
		if(changeStPaidbyOnPartyGSTN){
			if(consigneeGstn == null || consigneeGstn == '--')
				setValueToTextField('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID);
				else
				setValueToTextField('STPaidBy', TAX_PAID_BY_CONSINGEE_ID);
		} else
			setValueToTextField('STPaidBy', configuration.DeliveryDefaultSTPaidByForToPay);
			
		break;

	case WayBillType.WAYBILL_TYPE_CREDIT:
		if(changeStPaidbyOnPartyGSTN){
			if((consignorCorpId == billingPartyId) && (consignorGstn != null || consignorGstn != '--'))
				setValueToTextField('STPaidBy',TAX_PAID_BY_CONSINGOR_ID);
			else if((consigneeCorpId == billingPartyId) && (consigneeGstn == null || consigneeGstn == '--'))
				setValueToTextField('STPaidBy', TAX_PAID_BY_CONSINGEE_ID);
			else
				setValueToTextField('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID);
		}else
		  setValueToTextField('STPaidBy', configuration.DeliveryDefaultSTPaidByForTBB);
		break;

	case WayBillType.WAYBILL_TYPE_FOC:
		setValueToTextField('STPaidBy', configuration.DeliveryDefaultSTPaidByForFOC);
		break;
	default : 
		setValueToTextField('STPaidBy', configuration.DeliveryDefaultSTPaidBy);
	}
}

function disableSTPaidBy(waybillTypeId) {
	if (configuration.DeliverySTPaidBy != 'true')
		return;

	switch (Number(waybillTypeId)) {
	case WayBillType.WAYBILL_TYPE_PAID:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", true) 
		break;
	case WayBillType.WAYBILL_TYPE_TO_PAY:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", true) 
		break;
	case WayBillType.WAYBILL_TYPE_CREDIT:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", true) 
		break;
	case WayBillType.WAYBILL_TYPE_FOC:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", true) 
		break;
	default : 
		$('#STPaidBy').prop("disabled", false) 
	}
}

function setConsignmentDetails(consinDets) {		
	resetConsignmentDetailsTable();
	
	for (var i = 0; i < consinDets.length; i++) {

		var temp		= consinDets[i];

		var tableRow1	= createRow('tr_'+temp.consignmentDetailsId+"1",'');
		var tableCol1	= createColumn(tableRow1, 'td_'+temp.consignmentDetailsId+'_1','','center','','');
		var tableCol2	= createColumn(tableRow1, 'td_'+temp.consignmentDetailsId+'_2','','center','','');
		var tableCol3	= createColumn(tableRow1, 'td_'+temp.consignmentDetailsId+'_3','','center','','');

		tableCol1.append(temp.quantity);
		tableCol2.append(temp.packingTypeName);
		tableCol3.append(temp.saidToContain);

		$('#consignmentTable tbody').append(tableRow1);
	}
}

function setWaybillBookingCharges(wbBookingChargs) {
	for (var i = 0; i < wbBookingChargs.length; i++) {
		var temp		= wbBookingChargs[i];
		$('#deliveryCharge'+temp.wayBillChargeMasterId).val(temp.chargeAmount);
	}
}

function setWaybillDeliveryCharges(waybillDeliveryChgs) {
	for (var i = 0; i < waybillDeliveryChgs.length; i++) {
		var temp		= waybillDeliveryChgs[i];
		$('#deliveryCharge'+temp.wayBillChargeMasterId).val(temp.chargeAmount);
	}
}

function setChequeAmount() {
	var chequeAmount = document.getElementById("chequeAmount");
	
	if (configuration.BankPaymentOperationRequired == 'true' || configuration.BankPaymentOperationRequired == true) {
		if(chequeAmount != null) {
			if($('#deliveryPaymentType').val() != PAYMENT_TYPE_CASH_ID
					&& $('#deliveryPaymentType').val() != PAYMENT_TYPE_CREDIT_ID
					&& $('#deliveryPaymentType').val() != PAYMENT_TYPE_BILL_CREDIT_ID) {
				if($('#billAmount').exists()) {
					chequeAmount.value = $('#billAmount').val();
				}
			} else {
				chequeAmount.value = '0';
			}
		}
	} else if(chequeAmount != null) {
		if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CHEQUE_ID) {
			if($('#billAmount').exists())
				chequeAmount.value = $('#billAmount').val();
			else
				chequeAmount.value = '0';
		}
	}
}

function resetBankName() {
	if($('#bankName').val() != '') {
		$('#bankNameId').val('0');
		$('#bankName').val('');
	}
}

function resetData() {
	if (typeof hideEditLinks != 'undefined') {
		hideEditLinks(); // for hide edit view print links of lr
	}

	switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
	switchHtmlTagClass('photoCaptureSuccess', 'hide', 'show');

	hideAllMessages();
	hideInfo();

	$('#waybillId').val(0);
	$('#lrNum').html('');
	$('#receivedAt').html('');
	$('#waybillCurrStatus').html('');
	$('#waybillType').html('');
	$('#sourceBranch').html('');
	$('#destBranch').html('');
	$('#currStatusDate').html('');
	$('#consignorName').html('');
	$('#consignorPhone').html('');
	$('#consignorAddr').html('');
	$('#consigneeName').html('');
	$('#consigneePhone').html('');
	$('#consigneeAddr').html('');
	$('#consignorInv').html('');
	$('#declrdVal').html('');
	$('#Remark').html('');
	$('#ActlWt').html('');
	$('#ChgdWt').html('');
	$('#bookingType').html('');
	$('#DeliveryTo').html('');
	$('#formType').html('');
	$('#totalAmnt').val(0);
	$('#bookingTotalAmnt').val(0);
	$('#GrandAmnt').val(0);
	$('#billAmount').val(0);
	$('#waybillTypeId').val(0);
	$('#showbillCredit').val(0);
	$('#checkForServTax').val(0);
	$('#serviceTaxBY').val(0);
	$('#destBranchId').val(0);
	$('#ConsignorId').val(0);
	$('#ConsigneeId').val(0);
	$('#wbBookingDate').val(0);
	$('#deliveryPaymentType').val(0);
	$('#deliveredToName').val('');
	$('#selectedDeliveryCustomerId').val(0);
	$('#deliveredToPhoneNo').val('');
	$('#deliveryRemark').val('');
	$('#searchCollectionPerson').val('');
	$('#selectedCollectionPersonId').val(0);
	$('#OTPNumber').val('');
	$('#paidLoading').html('');
	$('#deliveryRunSheetLedgerId').val(0);
	$('#chequeDetails').switchClass("hide", "show");
	$('#chequeNo').val('');
	$('#chequeAmount').val('');
	$('#bankName').val('');
	$('#referenceNumber').val('');
	$('#mobileNumber').val('');
	$('#upiId').val('');
	$('#payerName').val('');
	$('#discountTypes').val(0);

	if ($('#deliveryCreditor')) {
		$('#deliveryCreditor').val('');
		$('#selectedDeliveryCreditorId').val(0);
	}

	if($('#txtDelDisc')!= null)
		$('#txtDelDisc').val(0);
	
	if($('#claimAmount')!= null)
		$('#claimAmount').val(0);
	
	if($('#isManualCR'))
		$("#isManualCR").attr("checked", false);
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_MANUAL_CR_DATE];
	
	if(configuration != null){
		if ((configuration.showOnlyManualCrDate == 'true' || configuration.showOnlyManualCrDate == true) || 
				((execFeildPermission != null && execFeildPermission != undefined) && (configuration.showManualCrOptionForUserWise == 'true'|| configuration.showManualCrOptionForUserWise == true))) {
			$('#manualCRDate').val(date(new Date(curDate),"-"));
		}
	}
	
	$('#ErrorForNorecords').html('');
	
	if ($('#selectionCriteria').exists()) {
		$("selectionCriteria").switchClass("hide", "show");
		$('#manualCRNumber').val();
		hideAllMessages();
	}

	if($('#paymenttypecredit').exists())
		$('#paymenttypecredit').prop('disabled', false);

	if ($('#paymenttypebillcredit').exists())
		$('#paymenttypebillcredit').prop('disabled', false);

	if ($('#tableSearchCollectionPerson').exists())
		$('#tableSearchCollectionPerson').switchClass("hide", "show");

	if ($('#selectedDeliveryCreditorPanel').exists())
		$('#selectedDeliveryCreditorPanel').switchClass("hide", "show");

	setValueToTextField('approvedBy', '');
	
	resetConsignmentDetailsTable();
	resetWaybillBookingCharges();
	
	weightTypeArr				= new Array();
	quantityTypeArr				= new Array();

	wayBillRates					= null;
	deliveryChargesConfigRates		= null;
	chargesRates					= null;
	transportModeId					= 1;
	
	$("#partialDetails").empty();
	$("#statusDetails").empty();
	$("#dispatchDetails").empty();
	$("#receiveSingleLR").empty();
	setValueToTextField('tdsAmount', 0);
	setValueToTextField('tdsOnAmount', 0);
	setValueToTextField('actBillAmount', 0);
	checkedUnchecked('applyTDSEffect', 'false');
	setValueToTextField('deliveryPanNumber', '');
	resetBankName();
	
	if ( $('#deliveryPaymentType').exists() ) {
		$('#deliveryPaymentType option').each(function(){
				$("#"+$(this).attr("id")).prop('disabled', false);
		});
	}
	
	if(configuration != null){
		if (configuration.BankPaymentOperationRequired == 'true' || configuration.BankPaymentOperationRequired == true) {
			$("#viewAddedPaymentDetailsCreate").addClass("hide");
			$('#storedPaymentDetails').empty();
		}
	}

	$('#consigneeCorpAccId').val(0);
	
	if (typeof idProofDataObject != 'undefined')
		idProofDataObject	= null;

	deliveryReminderLRDetails	= null;
	$("#VehicleNumber").val('');
	vehicleNumberMasterId	= 0;
	vehicleNumber			= null;
	
	matadiChargesApplicable	= false;
	matadiChargesApplicableForBillCredit = false;
	
	if(configuration != null && configuration.billingBranch == true || configuration.billingBranch == 'true')
		resetBillingBranch();

	isstbscreationanReset();
	ConsigneePartyMasterIdArr		= new Array();
	
	isPaidByDynamicQRCode = false;
	$('#transactionFld').val("");
	$('#merchantIdFld').val("");
	$('#apiReqResDataIdFld').val("");
	
	resetRecoveryBranch();
}

function resetWaybillBookingCharges() {
	$("#waybillBookingchargesList input:text").val("0");
	$("#waybillBookingChgs input:text").val("0");
	$("#deliveryCharges input:text").val("0");
	$("#waybillDlvryChgs input:text").val("0");
}

function resetConsignmentDetailsTable() {
	$('#consignmentTable tbody').empty();
}

function setReceivableTypes() {
	operationOnSelectTag('receivable', 'removeAll', '', '');
	
	operationOnSelectTag('receivable', 'addNew', '--Select--', 0);
	
	var receivableTypeIds		= configuration.ReceivableTypeListByOrder;
	var receivableTypeArr		= receivableTypeIds.split(',');
	
	for(var i = 0; i < receivableTypeArr.length; i++) {
		createReceivableTypeListByOrder(receivableTypeArr[i]);
	}
	
	setDefaultReceivableType();
}

function createReceivableTypeListByOrder(receivableTypeId) {
	
	switch (parseInt(receivableTypeId)) {
	case ReceivableTypeConstant.CONSINEE_COPY_ID:
		if(configuration.ConsigneeCopy == 'true')
			operationOnSelectTag('receivable', 'addNew', ReceivableTypeConstant.CONSINEE_COPY_NAME, ReceivableTypeConstant.CONSINEE_COPY_ID);
		break;
	case ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID:
		if(configuration.AgainstLetterHead == 'true')
			operationOnSelectTag('receivable', 'addNew', ReceivableTypeConstant.AGAINST_LETTER_HEAD_NAME, ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID);
		break;
	case ReceivableTypeConstant.AGAINST_BOND_ID:
		if(configuration.AgainstBond == 'true')
			operationOnSelectTag('receivable', 'addNew', ReceivableTypeConstant.AGAINST_BOND_NAME, ReceivableTypeConstant.AGAINST_BOND_ID);
		break;
	case ReceivableTypeConstant.NOT_APPLICABLE_ID:
		if(configuration.NotApplicable == 'true')
			operationOnSelectTag('receivable', 'addNew', ReceivableTypeConstant.NOT_APPLICABLE_NAME, ReceivableTypeConstant.NOT_APPLICABLE_ID);
		break;
	default:
		break;
	}
}

function setConsigneeDetails(partyId) {
	
	var jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.partyPanelType		= 1;
	jsonObject.partyType			= PartyMaster.PARTY_TYPE_CONSIGNEE;
	
	var jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if(!data.partyDetails)
						return;

					var party = data.partyDetails;
					
					$('#newConsigneeCorpAccId').val(partyId);
					$('#consigneeNameAutocomplete').val(party.displayName);
					
					if(configuration.showClaimAmountField == 'true' && typeof party.claimAmount !== 'undefined') {
						$('#claimAmountSpan').html(party.claimAmount);
						$('#totalClaimAmount').val(party.claimAmount);
					} else {
						$('#claimAmountTd').addClass('hide');
					}
					
					$('#consigneeNameAutocomplete').val(party.displayName);
					
					if(configuration.applyRateAuto == 'true'){
						$("#deliveryCharges input:text").val("0");
						getDeliveryChargesConfigRates($('#newConsigneeCorpAccId').val(),wayBillId);
						getDeliveryRates($('#newConsigneeCorpAccId').val(), wayBillConsignmentDetails,wayBillConsignmentSummary);
						getDeliveryDemmerageRates($('#newConsigneeCorpAccId').val());
					}
					
					var wayBillTypeId		= $('#waybillTypeId').val();

					if(jsondata.WayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate) {
						var wayBillTypeList		= (configuration.WayBillTypeIdsForDiscountAmountOnChangeOfConsigneePartyRate).split(',');
						
						var checkWayBillTypeId 	= isValueExistInArray(wayBillTypeList, wayBillTypeId);
							
						if(checkWayBillTypeId)
							getBookingRates($('#newConsigneeCorpAccId').val(),wayBillId); //defined in ApplyRate.js
					}
				}
			});
}

function setDefaultReceivableType() {
	switch (parseInt(configuration.DefaultReceivableType)) {
	case ReceivableTypeConstant.CONSINEE_COPY_ID :
		setValueToTextField('receivable', ReceivableTypeConstant.CONSINEE_COPY_ID)
		break;

	case ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID :
		setValueToTextField('receivable', ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID);
		break;

	case ReceivableTypeConstant.AGAINST_BOND_ID :
		setValueToTextField('receivable', ReceivableTypeConstant.AGAINST_BOND_ID);
		break;
		
	case ReceivableTypeConstant.NOT_APPLICABLE_ID :
		setValueToTextField('receivable', ReceivableTypeConstant.NOT_APPLICABLE_ID);
		break;

	default:
		break;
	}
}

function setBookingTaxAmount(wbData) {
	var bookingServiceTax = 0;
	
	wayBillTax	= wbData.wayBillTaxes;
	
	if(wayBillTax != undefined) {
		for(var i = 0; i < wayBillTax.length; i++) {
			if(wayBillTax[i] != undefined)
				bookingServiceTax += wayBillTax[i].taxAmount;
		}
	}
	
	if(bookingServiceTax > 0) {
		setValueToTextField('bookingServiceTax', bookingServiceTax);
		changeDisplayProperty('servicetax', 'table-row');
	} 
	
	return bookingServiceTax;
}

function loadPodDocumentSelection(){
	var select = $("#podStatus").val();
	var multiselect= $("#podDocTypeSelection");

	if(podConfiguration.showPODDocuments){
		if(select == '2'){
			multiselect.removeClass("hide");
			destroyMultiselectPodDocumentType();
			setPodDocumentTypes();
		} else {
			multiselect.addClass("hide");
			destroyMultiselectPodDocumentType();
		}
	}
}

function destroyMultiselectPodDocumentType(){
	$("#podDocType").multiselect('destroy');
}

function multiselectPodDocumentType(){
	destroyMultiselectPodDocumentType();

	if(document.getElementById('podDocType') != null) {
		document.getElementById('podDocType').onfocus = function(){ showInfo(this, 'Document Type');}
	}
	
	$('#podDocType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}

function setPodDocumentTypes() {
	removeOption('podDocType', null);
	
	if(!jQuery.isEmptyObject(podDocumentTypeArr)) {			//formTypeMastersArray - Coming from Database, Globally Defined
		for(var i = 0; i < podDocumentTypeArr.length; i++) {
			createOption('podDocType', podDocumentTypeArr[i].podDocumentTypeId, podDocumentTypeArr[i].podDocumentTypeName);
		}
	}
	
	multiselectPodDocumentType();
}

function validateDeliveredToNameOnBlur() {
	if (configuration.isValidateDeliveredToNameAndNumberOnBlur == "true" && !validateDeliverdToName(1, 'deliveredToName'))
		return false;
}

function validateDeliveredToPhoneNoOnBlur() {
	let deliveredToPhoneNo	= document.getElementById('deliveredToPhoneNo');
	
	if (configuration.isValidateDeliveredToNameAndNumberOnBlur == "true") {
		if (!validateDeliveredToPhoneNumber(1, 'deliveredToPhoneNo'))
			return false;
		
		if ( deliveredToPhoneNo != null ) {
			if ( deliveredToPhoneNo.value.length < 8 || deliveredToPhoneNo.value.length > 10 ) {
				showMessage('error', validPhoneNumberErrMsg);
				changeError1('deliveredToPhoneNo','0','0');
				next='deliveredToPhoneNo';
			} else if (invalidNumberRegex.test(deliveredToPhoneNo.value)) {
				showMessage('error', "Invalid phone number. Please enter a valid number.");
				changeError1('deliveredToPhoneNo', '0', '0');
				next = 'deliveredToPhoneNo';
            } else if($('#STPaidBy').exists() && $('#STPaidBy').is(':visible'))
				next='STPaidBy';
		}
	}
}

function validateShortCreditLimit(){
	if(configuration.shortCreditConfigLimitAllowed == 'false' || configuration.shortCreditConfigLimitAllowed == false)
		return true;
	
	if(Number($('#deliveryPaymentType').val()) != PAYMENT_TYPE_CREDIT_ID)
		return true;
	
	if(shortCreditConfigLimit != undefined){
		if(Number(shortCreditConfigLimit.creditType) == 1) {
			var grandTotal = $("#billAmount").val();
			
			if(grandTotal > shortCreditConfigLimit.creditLimit) {
				setTimeout(function(){ 
					$('#paymentType').focus(); 
					showMessage('info', " Short Credit Amount Limit of "+ shortCreditConfigLimit.creditLimit +" Exceeded !");	
				}, 200);
				return false;
			}
		} else if(Number(shortCreditConfigLimit.creditType) == 2){
			var grandTotal = $("#billAmount").val();
			
			if(grandTotal > shortCreditConfigLimit.balance){
				setTimeout(function(){ 
					$('#paymentType').focus(); 
					showMessage('info', " Short Credit Amount Limit of "+ shortCreditConfigLimit.balance +" Exceeded !");	
				}, 200);
				return false;
			}
		}
	}
	
	return true;
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

function resetBillingBranch(){
	$('#billingBranch').val("");
	resetBillingBranchData();
}

function resetBillingBranchData(){
	$('#billingBranchId').val(0);
}

function setBillingBranch(){
	if(configuration.loggedInBranchAsBillingBranch == true || configuration.loggedInBranchAsBillingBranch == 'true'){
		if($('#billingBranch').exists() && $('#billingBranch').is(":visible")){
			$('#billingBranchId').val(executive.branchId);
			$('#billingBranch').val(executive.branchName);
		}
	}
}

function isstbscreationanReset(){
	$("#stbscreationallowId").css('display','none');
	$("#isstbscreationallowId").prop("checked", false);
}

function setRecoveryBranch(){
	if($('#recoveryBranch').exists() && $('#recoveryBranch').is(":visible")){
		$('#recoveryBranchId').val(executive.branchId);
		$('#recoveryBranch').val(executive.branchName);
	}
}

function resetRecoveryBranch() {
	if ($('#recoveryBranch').exists() && $('#recoveryBranch').is(":visible")) {
		$('#recoveryBranch').val("");
		$('#recoveryBranchId').val(executive.branchId);
	}
}
