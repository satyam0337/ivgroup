//adjust booking type as par waybill type

function resetBookingTypeByWayBillType(key) {
	if (configuration.showAstrikOnPrivateMarkField == 'true')
		updatePrivateMark();

	if (configuration.BookingType != 'true')
		return;

	setBillingBranch(Number($('#wayBillType').val()));

	if (configuration.showTaxType == 'true') setTaxTypePartyWise();

	if (isTokenWayBill)
		resetDataForTokenBooking();

	showHideDDDVBookingTypeLRTypeWise(Number($('#wayBillType').val()));

	setWayBillBookingType();
	setDeclredValueOnFoc();
	resetPage();
}

//cerate DDDV option as per configuration
function createDDDVOption() {
	var bookingTypeIdArr	= (configuration.BookingTypeIds).split(",");
	
	if (isValueExistInArray(bookingTypeIdArr, DIRECT_DELIVERY_DIRECT_VASULI_ID) 
		&& $("#bookingType option[value=" + DIRECT_DELIVERY_DIRECT_VASULI_ID +"]").length < 1)
		createOption('bookingType', DIRECT_DELIVERY_DIRECT_VASULI_ID, DIRECT_DELIVERY_DIRECT_VASULI_NAME);
}

function changeSTPaidByForPartyExemptedOnLRType(partyExempted) {
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) {
		if(partyExempted != undefined && partyExempted != 'undefined') {
			if(partyExempted) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
				$('#STPaidBy').attr('disabled', 'true');
			} else {
				$('#STPaidBy').removeAttr('disabled', 'false');
				setDefaultSTPaidBy(Number($('#wayBillType').val()));
			}
		} else {
			$('#STPaidBy').removeAttr('disabled', 'false');
			setDefaultSTPaidBy(Number($('#wayBillType').val()));
		}
	}
}

//cerate Rate Apply For option as per configuration
function createRateApplyConfigOption() {
	removeOption('applyRateFor', null);
	createOption('applyRateFor', CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_NAME);
	createOption('applyRateFor', CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_NAME);
}

function resetPage() {
	let wayBillTypeId = $('#wayBillType').val();
	resetCharges();
	
	if(configuration.showEwaybillPopUpOnLoad == 'true' && showEwayBillPopupOnLoad)
		addMultipleEwayBillNo();
	
	/* Do not change this switch case */
	
	switch (wayBillTypeId) {
	case WAYBILL_TYPE_PAID:
	case WAYBILL_TYPE_TO_PAY:
	case WAYBILL_TYPE_CREDIT:
	case WAYBILL_TYPE_FOC:
		resetElements();
		break;
	}
}


//Added By Anant Chaudhary	27-01-2016
function resetTinNumbers() {
	setValueToTextField('consignorTin', "");
	setValueToTextField('consigneeTin', "");
}

//Added By Anant Chaudhary	17-02-2016
function resetNumberTypes() {
	emptyInnerValue('noTypePanel');
}

function resetVehicleNumber() {
	setValueToTextField('vehicleNumber', '');
}

function resetRoadPermitNumber() {
	setValueToTextField('roadPermitNumber', '');
}

function resetNextLRNumber() {
	if (configuration.operationalBranchWiseLRSeqCounter == 'true' && isManual)
		setValueToHtmlTag('seqRange', '');

	if(configuration.SourceDestinationWiseWayBillNumberGeneratorAllow == 'true' || configuration.showNextLRNumberWithDestBranchCode == 'true')
		setValueToContent('lrnumber', 'htmlTag', '');
}

function resetElements() {
	$('#diffAmtAfterRoundOffForOther').val("0");

	resetBillingParty();
	resetDestination();
	resetSubRegion();
	resetSourceBranch();
	resetLrNumberManual();
	
	resetLrDate();
	resetOTLrNumber();
	
	if (configuration.FrightuptoDestination == 'true')
		resetFreightUptoBranch();

	resetCharges(); // Reset Charges
	
	if(!isManual)
		resetAllComboboxes();
	
	resetAllTextboxErrors();
	resetAllErrortags();
	selectSTPaidBy(setDefaultGSTPaidBy($('#wayBillType').val())); // replaced with StPaidByConsignoropt();
	resetInvoiceNo();
	resetInvoiceDate();
	resetDeclaredValue();
	resetRemark();
	resetPaymentDetails();
	resetWeight();
	resetTinNumbers();

	$('#consignmentAmount').val("0");
	$('#dest_search').val("");
	setDefaultChargeType();
	setWayBillBookingType();
	setFocusForNewLR();
	setWeight();
	resetPartialPaymentOptions();
	setDefaultDestinationBranch(); 
	resetCUBIC();
	resetPurchaseOrderDate();
	isFixedValuationAmount = false;
	totalChargesToDeductFromFreight = 0;
	if(typeof calculateChargedWeightFromSlabWeight != 'undefined') calculateChargedWeightFromSlabWeight();
}

function resetPartialPaymentOptions() {
	switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
	switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
	switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
}

function resetPackingType() {
	if($('#typeofPacking').exists() && $('#typeofPacking').is(":visible"))
		$('#typeofPacking').val('');
	else
		$('#packingTypeAutoCompleter').val('');
}

function resetBillSelectionText() {
	if(configuration.ShowBillSelectionText == 'true')
		$('#billSelectionText').html('');
}

function resetAllErrortags() {
	toogleElement('packageError','none');
	toogleElement('consignorError','none');
	toogleElement('basicError','none');
	toogleElement('consignmentError','none');
	toogleElement('weightError','none');
	toogleElement('addNewPartyErrorDiv','none');
}

function resetAllComboboxes() {
	let table	= document.getElementById('mainTable');
	let combos	= table.getElementsByTagName("select");

	for(const element of combos) {
		let control = element;
		control.selectedIndex = 0;
		removeError(control.id);
		$("#"+control.id).trigger( "onchange" );
	}
	
	if(configuration.applyDiscountThroughMaster  == 'true' || configuration.applyDiscountThroughMaster  == true)
		setDefaultDiscountType();
}

function resetAllTextboxErrors() {
	let table	= document.getElementById('mainTable');
	let texBoxes= table.getElementsByTagName("input");

	for(const element of texBoxes) {
		let control = element;
		
		if(control.type != 'hidden')
			removeError(control.id);
	}
}

function resetDefaultWaybillType() {
	if(configuration.SetDefaultWayBillTypeAfterBooking == 'true') {
		if(!isManualWayBill)
			changeWayBillType(configuration.DefaultWayBillType, true);
		else {
			$('#WBTypeManual').val(configuration.DefaultWayBillTypeForManual);
			changeWayBillTypeManual(configuration.DefaultWayBillTypeForManual);
		}
	}
}

function resetWaybillType() {
	let key;

	switch ($('#wayBillType').val()) {
	case WAYBILL_TYPE_PAID:
		key	=	'F7';
		break;

	case WAYBILL_TYPE_TO_PAY:
		key	=	'F8';
		break;

	case WAYBILL_TYPE_CREDIT:
		key	=	'F9';
		break;

	case WAYBILL_TYPE_FOC:
		key	=	'F10';
		break;
	default:
		key	=	configuration.DefaultWayBillType;
	break;
	}

	setDefaultParty(key);
}

function resetManualEntryType() {
	var element	= document.getElementById('manualEntryType');

	if(element){
		element.selectedIndex = 0;
		$("#"+element.id).trigger( "onchange" );
	}
}

function resetAllData() {
	
	isConsignmentExempted				= false;
	notAplicablePackingTypeId			= false;
	disableFreightCharge			= false;
	
	weightTypeArr				= new Array();
	quantityTypeArr				= new Array();
	quantityWiseChargeObj		= {};
	weightWiseChargeAmount		= {};
	cnsgnmentGoodsId 			= new Array();
	checkBoxArray				= new Array();
	fixTypeArr 					= new Array();
	calcDDChargeArr				= new Array();
	calcDDCharge				= false;

	wayBillRates					= null;
	chargesConfigRates				= null;
	chargesConfigRates1				= null;
	chargeWeightConfig				= null;
	chargesRates					= null;
	jsonObjectNew					= null;
	consignorTxnType				= 0;
	consigneeTaxType				= 0;
	billingTaxType					= 0;

	if(!isManual)
		resetAllComboboxes();
	
	clearCanvas('pictureCanvas');
	clearCanvas('signaturepad');
	destnationBranchIdForOverNite = 0;
	changeGstRatesOnTransportMode();
	
	if((configuration.setSourceDestinationByDefaultManual == 'false') ||
		(configuration.setSourceDestinationByDefaultManual == 'true' && !isManual)) {
		resetDestination();
		resetSourceBranch();
	}
	
	resetAllCharge();
	resetPaymentDetails();
	resetTableSearchCollectionPerson();
	resetArticleWithTableAfterSave();
	resetWeight();
	resetTaxes();
	resetCustomer();
	resetSubRegion();
	setBillingBranch(parseInt($('#wayBillType').val()));
	resetLrNumberManual();
	resetLrDate();
	resetFreightUptoBranch();
	resetBillingParty();
	resetDiscount();
	resetCommission();
	resetPanNumber();
	resetPrivateMark();
	resetRemark();
	resetPurchaseOrderNumber();
	resetAdditionalRemark();
	resetDeliveryTo();
	resetCommodityType();
	$('#subCommodityType').val(0);
	resetInvoiceNo();
	resetInvoiceDate();
	resetDeclaredValue();
	setDefaultChargeType();
	resetTinNumbers();
	resetBillSelectionText();
	resetNumberTypes();
	resetVehicleNumber();
	resetRoadPermitNumber();
	resetPartyPanelData();
	resetNextLRNumber();
	resetPartialPaymentOptions();
	consignorIdProofMandatory();
	resetPurchaseOrderDate();
	$('#insurancebkg').val("");
	$('#rfqNumber').val("");
	$('#shipmentNumber').val("");
	$('#billOfEntriesNumber').val("");
	$('#bookedBy').val("");
	$('#cod').val("");
	invoiceDetailArray = [];
	singleInvoiceDetailsArr = [];
	invoiceDetailArrayForInsurance = [];
	$('#sealNumber').val("");
	$('#vehiclePONumber').val("");

	if(configuration.cargoTypeSelectionWiseShowCharges == 'true') {
		$('#cargoType').val(0);
		hideSpecificCharge(document.getElementById('cargoType'));
	}
	
	resetOTLrNumber();
	viewEwaybillNumber();
	resetCUBIC();
	resetChargesRemark();
	
	if(configuration.showVolumetricAllChargetype == 'false') {
		$('#volumetric').attr('checked', false);
		resetLBH();
	}

	$('#searchCollectionPerson').val("");
	$('#selectedCollectionPersonId').val("0");
	$('#tempWeight').val("0");
	$('#partyMinimumRate').val(0);
	$('#percentageRiskCover').val("");
	$('#invoiceDate').val("");
	$('#cftRate').val(0);
	$('#recoveryBranch').val("");
	$('#selectedRecoveryBranchId').val("0");
	
	if(configuration.showExcludeCommissionOption == 'true') {
		if($('#excludeCommission').exists() && $('#excludeCommission').is(":visible"))
			$('#excludeCommission').attr('checked', false);
		
		freightToCalculate				= 0.00;
	}
	
	$('#save').removeClass("hide");
	doneTheStuff					= false;
	isWayBillSaved  				= false;
	isWayBillSaving 				= false;
	applyRateForSpecificArticle		= false;
	isSlabRateNotExists         	= false;
	resetWaybillType();
	resetDefaultWaybillType();
	setWayBillBookingType();
	setWeight();
	setDeclredValueOnFoc();
	//Functions calling from formTypes.js 
	resetFormTypes();
	if(configuration.showTaxType == 'true') setTaxTypePartyWise();
	
	//Functions calling from CommonFunctions.js
	resetMultipleRemark();
	
	if(configuration.showTransporterName == 'true')
		setTransporterName();
	
	$('#formNumber').val('');
	$('#ewayBillNumber').val('');
	formTypeWiseCharges				= null;
	ctFormTypeWiseCharges			= null;
	formTypeWiseChargesByBranch		= null;
	ctFormTypeWiseChargesByBranch	= null;
	totalFormChargeAmount			= 0;
	TotalQty						= 0;
	idNum							= 0;
	packingGroupMappingCounter		= 0;
	weightFromDb					= 0;
	aticleWiseMinWeight				= 0;
	aticleWiseMaxWeight				= 0;
	maximumSlabValue				= 0;
	isReverseEntry					= false;
	isAgentBranchBoolean			= false;
	agentBranchId					= 0;
	maxRangeForLrSequence			= 0;
	minRangeForLrSequence			= 0;
	partyWiseSequence				= false;
	partySequenceExists				= false;
	isTransporter					= false;
	tbbPartyCode					= null;
	resetManualEntryType();
	setDefaultSTPaidBy($('#wayBillType').val());
	setLoggedBranchInSourceBranch();

	AOCPercentageValue		= 0;
	FOVChargeValue			= 0;
	form403_402ChargeAmt	= 0;
	ctFormTypeWiseChargeAmt	= 0;
	actualSlabValue			= 0;
	isPanNumberRequired 	= false;
	isServicetaxSet    		= false;
	isManualLRNumberAlreadyExist	= false;
	isPODRequiredBasedOnBillingParty	= false;
	isPODRequiredBasedOnConsignor		= false;
	isPODRequiredBasedOnConsignee		= false;
	isConsignorGSTNPresent				= false;
	isConsigneeGSTNPresent				= false;
	isGSTNAlreadyExist					= false;
	isReserveBookingChecked				= false;
	isApplyFixRateonArticleRateMinMaxArticleWise = false;
	chargedWeightRoundOffValue			= 0;
	configuredChargeTypeId				= 0;
	packingTypeList						= null;
	invalidInvoiceNumber				= false;
	isShowConfirmPopup					= false;
	rechrgAmnt							= 0;
	isCCAttached						= false;
	validateInvoiceOnDeclaredValueOnSave= false;
	imageArr                            = new Array();
	imageCount							= 0;
	freightRatePartyId					= 0;
	chargeConfigPartyId					= 0;
	actualWeightRateAmt					= 0;

	$('#isReservedCheck').attr('checked', false);
	$("#reservedLRDiv").css("background-color", "white");
	$('#typeofPackingId').val(0);
	
	if(configuration.isSourceBranchWiseSeqCounterByDefaultChecked == 'true')
		$('#isSourceBranchWiseSeqCounter').prop('checked', 'true');
	else{
		$('#isSourceBranchWiseSeqCounter').attr('checked', false);
		$("#sequenceCounterCheckDiv").css("background-color", "white");
	}
	
	setDefaultDestinationBranch();
	getPartyWiseLrSequenceForManulLr();

	setRateType();

	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		$("#viewAddedPaymentDetailsCreate").addClass("hide");
		$('#storedPaymentDetails').empty();
	}

	if(configuration.partyWiseArticleSelectionList == 'true')
		resetConsignementGoods();

	if(configuration.showSmsRequiredFeild == 'true')
		$('#smsRequired').prop( "checked", false );
	
	if(configuration.isShowSingleEwayBillNumberField == 'false')
		resetEwayBillData();
	
	$('#cnorCustomerDetailsId').val(0);
	$('#cgneeCustomerDetailsId').val(0);
	isTokenWayBill		= false;
	$('#storedIDProofDetails tr').remove();
	$('#storedIDProofDetails1 tr').remove();
	$("#branchBalance").addClass('hide');
	
	if (typeof idProofDataObject1 != 'undefined')
		idProofDataObject1	= null;
	
	if (typeof idProofDataObject2 != 'undefined')
		idProofDataObject2	= null;
	
	if(configuration.ShowEwaybillExemptedOption == 'true' && $('#eWayBillExempted').exists() && $('#eWayBillExempted').is(":visible"))
		$('#eWayBillExempted').attr('checked', false);
	
	if(configuration.showCCAttechedCheckBox == 'true' && $('#ccAttached').exists() && $('#ccAttached').is(":visible"))
		$('#ccAttached').attr('checked', false);
	
	if (configuration.cargoType == 'true')
		resetContainerDetails();
	
	$('#STPaidBy').removeAttr('disabled','false');
	artActWeightArr			= {};
	artChrgWeightArr		= {};
	cftWeightArr			= {};
	consigAddedtableRowsId	= [];
	$('#distance').html('');
	configuredChargeTypeIdWithCharge = {};
	fixedChargeRateObj				 = {};
	applicableChargeRateObj			= {};
	isValidEWayBill					= false;
	eWayBillNumberArray				= new Array();
	eWayBillValidationHM			= new Map();
	isFromViewEWayBill				= false;
	$("#isValidEwaybillMsg").addClass('hide');
	$("#noEwaybillMsg").addClass('hide');
	$("#natureOfArticle option[value=1]").attr("selected", "selected");
	isFreightChargeEnable = false;
	$('#singleEwaybillNo').val('');
	packingTypeWiseAmount = [];
	$('#charge' + ChargeTypeMaster.AOC).val(0);
	$('#charge' + ChargeTypeMaster.AOC).prop('readonly', false);
	$('#addArticlePanel').show();
	isValidateEwaybillFromPopup = false;
	isConsigneeIncreaseChargeWeight	= false;
	isConsignorIncreaseChargeWeight	= false;
	$('#declaredValueCheckBox').prop('checked'); 
	inclusiveChargeRateObj	= {};
	
	if(configuration.validateMinimumChargeWeightToApplyChargeTypeFix == 'true')
		$('#qtyAmount').removeAttr('readOnly');
	
	consignmentEWayBillExemptedObj	= {};
	isConsignmentEWayBillExempted	= false;
	
	partyWiseDataHM = {};
	partyWiseMinimumValueDataHM = {};
	consignmentDataHM = {};
	resetBusinessType();
	$('#categoryType').val(0);
	hideAndResetTDS();
	eWayBillHM	= {};
	
	if(configuration.validateTransportationMode == 'true')
		$('#transportationMode').val(0);
		
	setDefaultTransportationMode();
	eWayBillDetailsIdHM	= {};
	setDefaultRiskAllocation();
	setDefaultBranchServiceType();
	setDeclredValue();
	$('#approvalTypeId').val(0);
	$('#invoiceQty').val(0);
	$('#forwardTypeId').val(0);
	$('#hsnCode').val(0);
	$('#temperature').val(0);
	$('#insurancePolicyNo').val('');
	$('#declarationId').val(0);
	$('#dataLoggerNo').val('');
	$('#declarationTypeNewId').val(0);
	$('#connectivityTypeId').val(0);
	document.querySelectorAll('#declarationTypeNewId input[type="checkbox"]').forEach(cb => cb.checked = false); 

	setLRDetailsFromDispatch();
	if(allowReverseEntryLRBooking) setManualEntryType();
	
	isPaidByDynamicQRCode = false;
	$('#transactionFld').val("");
	$('#merchantIdFld').val("");
	$('#apiReqResDataIdFld').val("");
	$('#crossingHireAmount').val(0);
	hideShowGstOnEstimateLR();
	disableSpecificChargesOnTBB();
	isFromDynamicPaymentTypeSelection = false;
	
	if(configuration.showHsnCodeBasedOnTransportMode == 'false')
		$('#hsnCodeId').prop("disabled", false);
	
	$('#hsnCodeId').val(0);
	
	if(configuration.seperateSequenceRequiredForTbbParty == 'true' && !isManualWayBill)
		$('#lrNumberManual').prop("disabled", true);
	
	$("#waybillDivisionId").val(0);
	
	resetOtpData();
	
	isConsignorTBBParty = false;
	isConsigneeTBBParty = false;
	
	if(configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {
		$('#percentageRiskCover').addClass("hide");
		$('#percentageRiskCover').val(0);
		$('#declaredValueCheckBox').prop("checked", false);
	}
	
	validateInvoiceNumberPartyWiseForConsignor = false;
	validatePartNumberForConsignor = false;	
	validateInvoiceNumberPartyWiseForTBB	= false;
	validatePartNumberForTBB = false;
	validateInvoiceNumberPartyWiseForConsignee = false;
	validatePartNumberForConsignee = false;
}

function setBookingType() {
	removeOption('bookingType', null);
	
	let bookingTypeIdArr	= (configuration.BookingTypeIds).split(",");
	let bookingTypeList		= jsondata.bookingTypeList;
	
	if(configuration.allowFullLoadBookingOnly == 'true') {
		if(jsondata.ALLOW_FULL_LOAD_BOOKING_ONLY) {
			configuration.defaultBookingTypeForPAID 	= 3;
			configuration.defaultBookingTypeForTOPAY 	= 3;
			configuration.defaultBookingTypeForTBB 		= 3;
			configuration.defaultBookingTypeForFOC 		= 3;
		} else if (isValueExistInArray(bookingTypeIdArr, BOOKING_TYPE_SUNDRY_ID))
			createOption('bookingType', BOOKING_TYPE_SUNDRY_ID, BOOKING_TYPE_SUNDRY_NAME);

		if (isValueExistInArray(bookingTypeIdArr, BOOKING_TYPE_FTL_ID))
			createOption('bookingType', BOOKING_TYPE_FTL_ID, configuration.BookingTypeFtlName);

		if (isValueExistInArray(bookingTypeIdArr, DIRECT_DELIVERY_DIRECT_VASULI_ID))
			createOption('bookingType', DIRECT_DELIVERY_DIRECT_VASULI_ID, DIRECT_DELIVERY_DIRECT_VASULI_NAME);
	} else {
		for(const element of bookingTypeList) {
			createOption('bookingType', element.bookingTypeId, element.bookingTypeName);
			
			if (!isValueExistInArray(bookingTypeIdArr, configuration.DefaultBookingType)) {
				configuration.defaultBookingTypeForPAID 	= bookingTypeList[0].bookingTypeId;
				configuration.defaultBookingTypeForTOPAY 	= bookingTypeList[0].bookingTypeId;
				configuration.defaultBookingTypeForTBB 		= bookingTypeList[0].bookingTypeId;
				configuration.defaultBookingTypeForFOC 		= bookingTypeList[0].bookingTypeId;
			}
		}
	}

	if (!isValueExistInArray(bookingTypeIdArr, BOOKING_TYPE_FTL_ID))
		$("#vehicleType").remove();
}

function setBillSelection() {
	let billSelectionList	= jsondata.billSelectionList;
	
	let billSelection = $('#billSelection').val();
	removeOption('billSelection', null);
	
	for(const element of billSelectionList) {
		createOption('billSelection', element.billSelectionId, element.billSelectionName);
	}
	
	if(billSelection != undefined)
		$('#billSelection').val(billSelection);
}

function setSequenceType() {
	removeOption('SequenceTypeSelection', null);
	createOption('SequenceTypeSelection', 1, "Auto");
	createOption('SequenceTypeSelection', 2, 'Manual');
	setSequenceTypeSelection();
}

function setSequenceTypeSelection() {
	if(configuration.setDeafaultSequenceType == 'true') {
		$('#SequenceTypeSelection').val(configuration.defaultSequenceValue);
		$("#lrnumbermanualpanel" ).show();
	}
}

function setSequeceCounterType() {
	let sequenceTypeSelection	= Number($('#SequenceTypeSelection').val());
	
	doNotHideLRNumberManual = sequenceTypeSelection == 1 && configuration.branchCodeWiseMunualLrNumberForAutoInManual == 'true';
	
	if(sequenceTypeSelection == 1 && configuration.hideManualLrOnAutoSelectionInManual == "true")
		doNotHideLRNumberManual = false;
		
	if((sequenceTypeSelection == 1 || !jsondata.AUTO_LR_NUMBER_IN_MANUAL) && !doNotHideLRNumberManual) {
		if(configuration.allowAutoSequenceOnManual == 'true')
			$("#lrnumbermanualpanel" ).hide();
	} else {
		next = 'lrNumberManual';
		$("#lrNumberManual" ).val('');
		$("#lrnumbermanualpanel" ).show();
	}
	
	if(configuration.hideSequenceRangeOfAutoBookingInManual == 'true') {
		if((sequenceTypeSelection == 1 || jsondata.AUTO_LR_NUMBER_IN_MANUAL) && configuration.allowAutoSequenceOnManual == 'true')
			$("#seqRange" ).hide();
		else
			$("#seqRange" ).show();
	}
	
	if(configuration.hideSequenceTypeSelection == 'true')
		$("#sequenceTypepanel" ).remove();
	
	if(configuration.hideManualLRNumberInAutoSelection == 'true' && sequenceTypeSelection == 1) {
		$("#lrnumbermanualpanel" ).hide();
		$("#lrNumberManual" ).val('');
		next = 'lrDateManual';
	}
}

function setSequeceCounterTypeSele(event) {
	var sequenceTypeSelection	= Number($('#SequenceTypeSelection').val());
	var sourceBranchId			= Number($('#sourceBranchId').val());
	doNotHideLRNumberManual = sequenceTypeSelection == 1 && configuration.branchCodeWiseMunualLrNumberForAutoInManual == 'true'
	
	if(configuration.showNextLrNumberInManualAuto == 'true' && sequenceTypeSelection == 2){
		$("#lrnumber" ).hide();
		$("#lrnumbermanualpanel" ).hide();
		$("#lrNumberManual" ).val('');
	}
	
	if(configuration.showNextLrNumberInManualAuto == 'true' && sequenceTypeSelection == 1){
		$("#lrnumber" ).show()
		$("#lrnumbermanualpanel" ).show();
	}

	if(sequenceTypeSelection == 1 && configuration.hideManualLrOnAutoSelectionInManual == "true" )
		doNotHideLRNumberManual = false;
		
	if(jsondata.AUTO_LR_SEQUENCE_COUNTER_CHECK_BOX_IN_MANUAL) {
		if(sequenceTypeSelection == 2) {
			$("#LRSequenceCounterCheckpanel" ).hide();
			$('#isSourceBranchWiseSeqCounter').attr('checked', false);
		} else {
			$("#LRSequenceCounterCheckpanel" ).show();

			if(configuration.isSourceBranchWiseSeqCounterByDefaultChecked == 'true')
				$('#isSourceBranchWiseSeqCounter').prop('checked', 'true');
		}
	}

	if(configuration.executiveBranchWiseOnlyManualRangeSequenceCounter == 'true')
		setManualSequenceRange();
		
	if (configuration.operationalBranchWiseLRSeqCounter == 'true') {
		if (sequenceTypeSelection == 2) 
			setValueToHtmlTag('seqRange', '');
			
		document.getElementById('SequenceTypeSelection').addEventListener('change', function() {
			$('#sourceBranch').val("");
		});
	}

	if(sequenceTypeSelection == 1 || !jsondata.AUTO_LR_NUMBER_IN_MANUAL) {
		if(configuration.allowAutoSequenceOnManual == 'true') {
			if(getKeyCode(event) == 13 && doNotHideLRNumberManual)
				next = 'lrNumberManual';
			else
				next = 'lrDateManual';
			
			if(!doNotHideLRNumberManual) {
				$("#lrnumbermanualpanel" ).hide();
				$("#lrNumberManual" ).val('');
			}
		}
	} else if(!isReserveBookingChecked) {
		next = 'lrNumberManual';
		$("#lrNumberManual" ).val('');
		$("#lrnumbermanualpanel" ).show();
	} else {
		$("#SequenceTypeSelection").val(1);
		showMessage('error', iconForErrMsg + ' You can not book "Manual" LR for reserved!');
	}
	
	if(configuration.hideManualLRNumberInAutoSelection == 'true' && sequenceTypeSelection == 1){
			$("#lrnumbermanualpanel" ).hide();
			$("#lrNumberManual" ).val('');
			next = 'lrDateManual';
		}
		
	getSourceBranchWiseManualLrSequence(sourceBranchId);
}

function setRiskAllocation() {
	removeOptionValFromList('riskallocation', null);

	createOptionInSelectTag('riskallocation', TransportCommonMaster.CARRIER_RISK, TransportCommonMaster.CARRIER_RISK, TransportCommonMaster.CARRIER_RISK_NAME);
	createOptionInSelectTag('riskallocation', TransportCommonMaster.OWNER_RISK, TransportCommonMaster.OWNER_RISK, TransportCommonMaster.OWNER_RISK_NAME);	
}

function setManualEntryType() {
	removeOption('manualEntryType', null);

	createOption('manualEntryType', TransportCommonMaster.MANUAL_NORMAL_ENTRY, TransportCommonMaster.MANUAL_NORMAL_ENTRY_NAME);
	createOption('manualEntryType', TransportCommonMaster.MANUAL_REVERSE_ENTRY, TransportCommonMaster.MANUAL_REVERSE_ENTRY_NAME);	

	document.getElementById('manualEntryType').value = configuration.defaultManualEntryType;
	setReverseEntry();
}

function setExciseInvoice() {
	removeOption('exciseInvoice', null);

	createOption('exciseInvoice', TransportCommonMaster.EXCISE_INVOICE_NO, TransportCommonMaster.EXCISE_INVOICE_NO_NAME);
	createOption('exciseInvoice', TransportCommonMaster.EXCISE_INVOICE_YES, TransportCommonMaster.EXCISE_INVOICE_YES_NAME);
}

function setConsignmentInsured() {
	removeOption('consignmentInsured', null);

	createOption('consignmentInsured', TransportCommonMaster.CONSIGNMENT_INSURED_NO, TransportCommonMaster.CONSIGNMENT_INSURED_NO_NAME);
	createOption('consignmentInsured', TransportCommonMaster.CONSIGNMENT_INSURED_YES, TransportCommonMaster.CONSIGNMENT_INSURED_YES_NAME);
}

function setVehicleType() {
	removeOption('vehicleType', null);

	let vehicleType = jsondata.vehicleType;

	createOption('vehicleType',0, '--Truck Type--');

	if(!jQuery.isEmptyObject(vehicleType)) {
		for(const element of vehicleType) {
			createOption('vehicleType', element.vehicleTypeId + "," + element.capacity, element.name);
		}
	}
}

function VehicleTypeWithConstantValue() {
	removeOption('vehicleType', null);

	createOption('vehicleType', vehicleTypeConstant.VEHICLE_TYPE_BUS_ID, vehicleTypeConstant.VEHICLE_TYPE_BUS_NAME);
	createOption('vehicleType', vehicleTypeConstant.VEHICLE_TYPE_TRUCK_ID, vehicleTypeConstant.VEHICLE_TYPE_TRUCK_NAME);

	$('#vehicleTypeDiv').removeClass('hide');
}

function movementTypeWithConstantValue(movementType) {
   removeOption('movementType', null);
   
   createOption('movementType',0, '--Movement Type--');
    
	$.each(movementType, function (key, value) {
		createOption('movementType', key, value);
	});

	$('#movementTypeDiv').removeClass('hide');
}

function setFutureDate() {
	var tomorrowDate = new Date(serverCurrentDate);
	tomorrowDate.setTime(tomorrowDate.getTime() + (1000*3600*24));
	var month = getFormattedMonth(tomorrowDate.getMonth());
	var futureDate = tomorrowDate.getDate()+"-"+month+"-"+tomorrowDate.getFullYear();
	var ddl = document.getElementById( 'wbDate' );
	var theOption = new Option;
	theOption.text = futureDate;
	theOption.value = futureDate;
	ddl.options[1] = theOption;
}

function setDefaultDateOnManual() {
	if(isManual) {
		if((configuration.setDefaultDateOnManual != undefined && configuration.setDefaultDateOnManual == 'true') || (configuration.allowBackDateForManualLr == true || configuration.allowBackDateForManualLr == 'true')) {
			if(jsondata.ALLOW_BACK_DATE_FOR_MANUAL_LR) {
				$('#lrDateManual').val('');
				enableDisableInputField('lrDateManual', 'false');
				return;
			}
			
			if($('#manualEntryType').val() != TransportCommonMaster.MANUAL_REVERSE_ENTRY) {
				var tomorrowDate 	= serverCurrentDate;
				var month 			= getFormattedMonth(tomorrowDate.getMonth());
				var futureDate 		= getFormattedDate(tomorrowDate.getDate()) + "-" + month + "-" + tomorrowDate.getFullYear();
				$('#lrDateManual').val(futureDate);
				
				if(configuration.isEditAllowedOnCurrentDateInManual != undefined  && configuration.isEditAllowedOnCurrentDateInManual == 'true')
					enableDisableInputField('lrDateManual', 'false');
				else
					enableDisableInputField('lrDateManual', 'true');
			} else {
				$('#lrDateManual').val('');
				enableDisableInputField('lrDateManual', 'false');
			}
		}
	}
}

function getFormattedDate(date) {
	return date < 10 ? "0" + (date) : date;
}

function getFormattedMonth(month) {
	return (month + 1) < 10 ? "0" + (month + 1) : month + 1;
}  

function resetOnVehicleType() {
	resetArticleWithTable();
	resetWeight();
	resetSpecificCharges();
	isAppliedGeneralRateForParty = false;
}

function setWeight(){
	if($('#actualWeight').exists())
		$('#actualWeight').val(parseInt(defaultActualWeight));

	if($('#chargedWeight').exists())
		$('#chargedWeight').val(parseInt(defaultActualWeight));
}

function setChargeType() {
	removeOption('chargeType', null);
	
	let chargeTypeConstantHM	= jsondata.chargeTypeConstantHM;
	let chargeTypeArray 		= null;
	let wayBillType				= $('#wayBillType').val();
	
	if(isValueExistInArray((configuration.branchesToShowChargeTypeList).split(","), executive.branchId))	
		chargeTypeArray = (configuration.createBranchWiseChargeTypeList).split(',');
	else	
		chargeTypeArray = (configuration.CreateChargeTypeListByOrder).split(',');
		
	let setDefaultChargeTypeOption	= true;
	
	for(const element of chargeTypeArray) {
		 if(configuration.showOnlyWeightChargeTypeForPaidAndTbbLr == 'true'
			&& !isManualWayBill && (wayBillType == WAYBILL_TYPE_PAID || wayBillType == WAYBILL_TYPE_CREDIT)) {
			if(element == CHARGETYPE_ID_WEIGHT) {
				createOption('chargeType', element, chargeTypeConstantHM[parseInt(element)]);
				setDefaultChargeTypeOption	= false;
				break;
			}
		} else
			createOption('chargeType', element, chargeTypeConstantHM[parseInt(element)]);
	}
	
	if(setDefaultChargeTypeOption)
		setDefaultChargeType();
}

function setChargeWiseRemarkPanel() {
	let chargeIdList 		= (configuration.waybillChargeMasterIdsForRemark).split(',');
	var charges	= jsondata.charges;
	
	for(const element of charges) {
		let chargeId	= element.chargeTypeMasterId;

		if(isValueExistInArray(chargeIdList, chargeId)){
			let chargeName	= element.chargeName;
			let jsonObjectChargeType	= new Object();

			jsonObjectChargeType.type	= 'text';
			jsonObjectChargeType.name	= 'remark_' + chargeId;
			jsonObjectChargeType.id		= 'remark_' + chargeId;
			jsonObjectChargeType.class	= 'remark_' + chargeId;
			jsonObjectChargeType.onblur	= 'hideInfo()';
			jsonObjectChargeType.style	= 'margin-left: 20px;text-transform: uppercase;display:none;';

			jsonObjectChargeType.onfocus		= "showInfo(this,'" + chargeName + " Remark');";
			jsonObjectChargeType.placeholder	= chargeName+" Remark";

			createInput($("#chargeWiseRemarkPanel"), jsonObjectChargeType);
		}
	}
}

function setExpressChargeWiseDeliveryToOption(chargeId) {
	var overNiteSubRegionIdList = null;
	
	if(configuration.isOnlyDoorDeliveryAllowedForOvernightCarrier == true 
			|| configuration.isOnlyDoorDeliveryAllowedForOvernightCarrier =='true')
		overNiteSubRegionIdList 	= subRegionIdsForOverNite.split(',');
	
	if (configuration.wayBillExpressChargeWiseDeliveryAtNeeded == 'true' && ($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC)) {
		var deliveryTo			= $('#deliveryTo').val();
		var ExpressDlyAmt		= parseInt($('#charge' + BookingChargeConstant.EXPRESS).val());
		var freightAmount		= parseInt($('#charge' + BookingChargeConstant.FREIGHT).val());
		var subRegionId 		= $('#destinationSubRegionId').val();
		
		if(Number($('#deliveryTo').val()) != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID) {
			$('#charge' + BookingChargeConstant.EXPRESS).val('0');
			return true;
		}
		
		if(overNiteSubRegionIdList != null) {
			if(isValueExistInArray(overNiteSubRegionIdList, subRegionId)) {
				if($('#deliveryTo').val() != InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
					setTimeout(function() { 
						$('#deliveryTo').val(InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID);
						showMessage('info', " Your Are  Allowed To Booked For Door Delivery Lrs Only !");	
					}, 200);
					return false;
				}
			} else if(Number($('#charge' + BookingChargeConstant.EXPRESS).val()) > 0 && deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID  && configuration.expressAmtGreaterthanFreight == 'true') {
				showMessage('error', expressDeliveryErrMsg);
				$('#deliveryTo').focus();
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus('deliveryTo', '', '', 'green');
			}
		} else if(ExpressDlyAmt > 0 && deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID  && configuration.expressAmtGreaterthanFreight == 'true') {
			$('#deliveryTo').val(InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID);
			showMessage('error', expressDeliveryErrMsg);
			$('#deliveryTo').focus();
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus('deliveryTo', '', '', 'green');
		}
		
		if(deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID && configuration.expressAmtGreaterthanFreight == 'true')
			$('#charge' + BookingChargeConstant.EXPRESS).val('0');
		
		if(deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID) {
			if(configuration.expressAmtGreaterthanFreight == 'true') {
				$('#charge'+ BookingChargeConstant.EXPRESS).val(parseInt(freightAmount));

				if((chargeId == BookingChargeConstant.EXPRESS) && Number(ExpressDlyAmt) < Number(freightAmount)) {
					setTimeout(function(){ $('#charge' + BookingChargeConstant.EXPRESS).focus(); }, 0);
					//	$('#charge'+ BookingChargeConstant.EXPRESS).focus();
					showMessage('error', expressAmtLessthanFreightError);
					return false;
				}
				
				if((chargeId == BookingChargeConstant.EXPRESS) && Number(ExpressDlyAmt) >= Number(freightAmount))
					$('#charge' + BookingChargeConstant.EXPRESS).val(parseInt(ExpressDlyAmt));
				
				$('#charge' + BookingChargeConstant.EXPRESS).on('blur',function() {
					setTimeout(function(){ $('#save').focus(); }, 10);
				});
			}
			
			if(overNiteSubRegionIdList != null) {
				if(isValueExistInArray(overNiteSubRegionIdList, subRegionId)) {
					if($('#deliveryTo').val() != InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
						setTimeout(function() { 
							$('#deliveryTo').val(InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID);
							showMessage('info', " Your Are  Allowed To Booked For Door Delivery Lrs Only !");	
						}, 200);
						return false;
					}
				} else if(ExpressDlyAmt > 0 && deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID && configuration.expressAmtGreaterthanFreight != 'true') {
						showMessage('error', expressDeliveryErrMsg);
						$('#deliveryTo').focus();
						return false;
					} else {
						hideAllMessages();
						changeTextFieldColorWithoutFocus('deliveryTo', '', '', 'green');
					} 
			} else if(ExpressDlyAmt > 0 && deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID  && configuration.expressAmtGreaterthanFreight != 'true') {
				showMessage('error', expressDeliveryErrMsg);
				$('#deliveryTo').focus();
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus('deliveryTo', '', '', 'green');
			}

			if(overNiteSubRegionIdList != null) {
				if(isValueExistInArray(overNiteSubRegionIdList, subRegionId)) {
					if($('#deliveryTo').val() != InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
						setTimeout(function() { 
							$('#deliveryTo').val(InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID);
							showMessage('info', " Your Are  Allowed To Booked For Door Delivery Lrs Only !");	
						}, 200);
						return false;
					}
				} else if((ExpressDlyAmt == isNaN || ExpressDlyAmt == 0) && deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID && configuration.expressAmtGreaterthanFreight != 'true'){
					setTimeout(function(){ $('#charge'+ BookingChargeConstant.EXPRESS).focus(); }, 0);
					showMessage('error', expressChargeErrMsg);
					return false;
				}
			} else if((ExpressDlyAmt == isNaN || ExpressDlyAmt == 0) && deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_EXPRESS_DELIVERY_ID && configuration.expressAmtGreaterthanFreight != 'true'){
				setTimeout(function(){ $('#charge'+ BookingChargeConstant.EXPRESS).focus(); }, 0);
				showMessage('error', expressChargeErrMsg);
				return false;
			}
		}
	}

	return true;
}

function showHideRemark(chargeId){
	if(configuration.wayBillChargeWiseRemarkNeeded == 'false')
		return true;

	var chargeValue = $('#charge' + chargeId).val();

	if(chargeValue != '' && Number(chargeValue) > 0) {
		$('#remark_' + chargeId).show();
	} else {
		$('#remark_' + chargeId).val("");
		$('#remark_' + chargeId).hide();
	}
}

function setPackingType() {
	removeOption('typeofPacking', null);

	var packingTypeMasters = jsondata.packingType;

	createOption('typeofPacking', 0, 'Articles Type');
	
	if(!jQuery.isEmptyObject(packingTypeMasters)) {
		for(const element of packingTypeMasters) {
			createOption('typeofPacking', element.packingTypeMasterId, element.name);
		}
	}
}

function setTransporterName(destinationBranchId) {
	let object	= new Object();
	object.destinationBranchId = destinationBranchId;
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/TransporterNameMasterWS/getTransporterNameAutoComplete.do',
		data		:	object,
		dataType	: 	'json',
		success		: 	function(data) {
			removeOption('transporterName',null);
			createOption('transporterName',0, '-- Select --');
			
			if (data != undefined && data != '') {
				var transporterNameMaster = data.transporterNameMaster;
				
				if(transporterNameMaster != undefined && transporterNameMaster != null){
					for(const element of transporterNameMaster) {
						createOption('transporterName', element.transporterNameMasterId, element.transporterName);
					}
				}
				
				hideLayer();
			}
		}
	});
}

function validateTransporterNameMaster() {
	if(configuration.validateTransporterName == 'true') {
		var transporterName = $('#transporterName').val(); 
		
		if(transporterName == 0) {
			showMessage('error','Please Select Transporter Name ');
			$("#transporterName").focus();
			return false;
		}
	}
	
	return true;
}

function resetArticleWithTable() {
	if(configuration.isResetArticleOnChangeOfChargeType == 'true' && !isTokenWayBill)
		resetArticleWithTableAfterSave();
	else {
		setComboBoxIndex('typeofPacking', 0);
		resetPackingType();
	}
	
	if(configuration.partyWiseArticleSelectionList == 'true')
		resetConsignementGoods();

	resetCharges();
	if(typeof getFixTypeRates != 'undefined') getFixTypeRates();
}

function resetArticleWithTableAfterSave() {
	noOfArticlesAdded	= 0;
	resetArticleDetails();
	
	$('#totalQty').html("0");
	$('#totalSize').html("0");
	$('#length').val("0");
	$('#height').val("0");
	$('#breadth').val("0");
	$('#myTBody tr').remove();
	$('#myTBody1 tr').remove();
	$('#cftRate').removeAttr("disabled");
	totalConsignmentQuantity = 0;
	totalConsignmentSize	 = 0;
	resetWeight();
	consigAddedtableRowsId	= [];
	idNum = 0;
	countArticleRate = {};
	articleWiseFreightRate = {};
	consignmentDataHM	= {};
	
	if(configuration.packingTypeWiseMaxArticleValidate == 'true' && isCoverPackingTypeAdded) {
		configuration.disableBookingCharges = 'false';
		isCoverPackingTypeAdded = false;
		disableBookingCharges();
	}
	
	setWeight();
}

function resetArticleDetails() {
	isFixedArticleSlab	= false;
	$('#quantity').val("0");
	setComboBoxIndex('typeofPacking', 0);
	resetPackingType();
	$('#consignmentStorageId').val("0");
	$('#consignmentAmount').val("0");
	$('#saidToContain').val("");
	$('#consignmentRemark').val("");
	$('#qtyAmount').val("0");
	$('#typeofPackingId').val("0");
	$('#articleLength').val(0);
	$('#articleBredth').val(0);
	$('#articleHeight').val(0);
	$('#artActWeight').val(0);
	$('#artChargeWeight').val(0);
	
	if(consignmentGoods != undefined)
		setDefaultSaidToContain(consignmentGoods);
	
	if(packingTypeGoods != undefined)
		setDefaultPackingType(packingTypeGoods);
}

function resetAmountOnDelete(deleteButtonId) {
	if(calcDDChargeArr != null && calcDDChargeArr != undefined && calcDDChargeArr.length > 0)
		resetAmountOnDeleteTablerowForAllChargeType(deleteButtonId);
	else if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
		resetAmountOnDeleteTablerow(deleteButtonId);
}

function resetAmountOnDeleteTablerow(deleteButtonId) {
	var num 				= deleteButtonId;
	var minimumAmount 		= $('#partyMinimumRate').val();
	var qtyAmnt				= $('#qtyAmountTotal' + num.split('_')[1]).html();

	if(jsondata.charges) {
		var chargeTypeModel = jsondata.charges;

		for (var i = 0; i < chargeTypeModel.length; i++) {
			var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;
			var totalamount		= $('#charge' + chargeMasterId).val();

			if(totalamount > 0) {
				var subAmnt = 0;

				if(quantityWiseChargeObj != null && Object.keys(quantityWiseChargeObj).length > 0) {
					quantityWiseChargeAmount	= quantityWiseChargeObj[Number(num.split('_')[1])];
					
					if(quantityWiseChargeAmount[chargeMasterId])
						totalamount = totalamount - quantityWiseChargeAmount[chargeMasterId];
					
					subAmnt	= totalamount;
				} else {
					if ((jQuery.inArray(chargeMasterId + "", aplyRateForCharges) != -1) || (configuration.ApplyArticleWiseRateOnWeightType == 'true'
						&& jQuery.inArray(chargeMasterId + "", chargesToApplyArticleWiseRateOnWeightType) != -1)) {
						if (chargeMasterId == BookingChargeConstant.FREIGHT) {
							subAmnt = parseFloat(totalamount) - parseFloat(qtyAmnt);
						} else {
							for(var j = 0; j < quantityTypeArr.length; j++) {
								var arrId = quantityTypeArr[j].split("_")[0];

								if(arrId == Number(num.split('_')[1])) {
									var sliptedByUnderScore		= quantityTypeArr[j].split("_");
									var sliptedByCommas			= sliptedByUnderScore[1].split(",");

									for(var k = 0; k < sliptedByCommas.length; k++) {
										if(sliptedByCommas[k].split("=")[0] == chargeMasterId) {
											subAmnt = parseFloat(totalamount) - parseFloat(sliptedByCommas[k].split("=")[1]);
											break;
										}
									}
								}
							}
						}
					}
				}

				if(minimumAmount > 0 && minimumAmount > subAmnt && chargeMasterId == BookingChargeConstant.FREIGHT) {
					$('#charge' + chargeMasterId).val(parseFloat(minimumAmount));
					$("#freightAmountRate").fadeIn(500);
					setTimeout(function () {$("#freightAmountRate").fadeOut(500);}, 3000);
				} else if (subAmnt <= 0)
					$('#charge' + chargeMasterId).val(0);
				else
					$('#charge' + chargeMasterId).val(subAmnt);
				
				resetPartialPaymentDetails();
				resetPartialChequePaymentDetails();
			}
			
			if (chargesRates != null)
				calculateLRLevelCharges(chargesRates, chargeMasterId);
				
			calculateFragileCharge;
			
			calcTotal();
		}
	}
}

function resetAmountOnDeleteTablerowForAllChargeType(deleteButtonId) {
	var num 				= deleteButtonId;
	var minimumAmount 		= $('#partyMinimumRate').val();
	var qtyAmnt				= $('#qtyAmountTotal' + num.split('_')[1]).html();
	
	if(jsondata.charges) {
		var chargeTypeModel = jsondata.charges;

		for (var i = 0; i < chargeTypeModel.length; i++) {
			var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;
			var totalamount		= $('#charge' + chargeMasterId).val();
			
			if(totalamount > 0) {
				var subAmnt = 0;
				
				if (chargeMasterId == BookingChargeConstant.FREIGHT) {
					if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
						subAmnt = parseFloat(totalamount) - parseFloat(qtyAmnt);
				} else {
					for(var j = 0; j < quantityTypeArr.length; j++) {
						var arrId = quantityTypeArr[j].split("_")[0];
							
						if(arrId == Number(num.split('_')[1])) {
							var sliptedByUnderScore		= quantityTypeArr[j].split("_");
							var sliptedByCommas			= sliptedByUnderScore[1].split(",");

							for(var k = 0; k < sliptedByCommas.length; k++) {
								if(sliptedByCommas[k].split("=")[0] == chargeMasterId) {
									subAmnt = parseFloat(totalamount) - parseFloat(sliptedByCommas[k].split("=")[1]);
									break;
								}
							}
						}
					}
						
					for(var d = 0; d < calcDDChargeArr.length; d++) {
						var arrId = calcDDChargeArr[d].split("_")[0];

						if(arrId == Number(num.split('_')[1])) {
							var sliptedByUnderScore		= calcDDChargeArr[d].split("_");
							var sliptedByCommas			= sliptedByUnderScore[1].split(",");

							for(var s = 0; s < sliptedByCommas.length; s++) {
								if(sliptedByCommas[s].split("=")[0] == chargeMasterId) {
									subAmnt = parseFloat(totalamount) - parseFloat(sliptedByCommas[s].split("=")[1]);
									break;
								}
							}
						}
					}
				}
					
				if(minimumAmount > 0 && minimumAmount > subAmnt && chargeMasterId == BookingChargeConstant.FREIGHT) {
					$('#charge' + chargeMasterId).val(parseFloat(minimumAmount));
					$("#freightAmountRate").fadeIn(500);
					setTimeout(function () {$("#freightAmountRate").fadeOut(500);}, 3000);
				} else if (subAmnt <= 0)
					$('#charge' + chargeMasterId).val(0);
				else
					$('#charge' + chargeMasterId).val(subAmnt);
				
				resetPartialPaymentDetails();
				resetPartialChequePaymentDetails();

				calcTotal();
			}
		}
	}
}

function resetPartialPaymentDetails() {
	$('#receivedAmount').val(0);
	$('#balanceAmount').val(0);
	$('#receivedAmtEle').val(0);
	$('#balanceAmtEle').val(0);
	setValueToTextField('partialPaymentType', 0);
}

function resetLBHFeild(){
	$('#articleLength').val(0);
	$('#articleBredth').val(0);
	$('#tempWeight').val(0);
}

function resetPartialChequePaymentDetails() {
	setValueToTextField('paymentMode', 1);
	$('#partialChequeAmount').val(0);
	$('#partialChequeNo').val('');
	$('#partialBankName').val('');
	switchHtmlTagClass('partialChequeDetails', 'hide', 'show');
}

function setWayBillBookingType() {
	$('#bookingType').val(Number(getDefaultBookingType()));

	changeOnBookingType();
	setFocusOnPaymentType();
}

function getDefaultBookingType() {
	var typeId = 0;

	switch (Number($('#wayBillType').val())) {
	case WayBillType.WAYBILL_TYPE_PAID:
		typeId = configuration.defaultBookingTypeForPAID;
		break;

	case WayBillType.WAYBILL_TYPE_TO_PAY:
		typeId = configuration.defaultBookingTypeForTOPAY;
		break;

	case WayBillType.WAYBILL_TYPE_CREDIT:
		typeId = configuration.defaultBookingTypeForTBB;
		break;

	case WayBillType.WAYBILL_TYPE_FOC:
		typeId = configuration.defaultBookingTypeForFOC;
		break;

	default:
		typeId = configuration.DefaultBookingType;
	break;
	}

	return typeId;
}

function resetDeclaredValue() {
	if (configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true')
		$('#declaredValue').val("");
}

function resetLrNumberManual() {
	if (configuration.LRNumberManual == 'true')
		$('#lrNumberManual').val("");
}

function resetOTLrNumber() {
	if (configuration.OTLrNumber == 'true')
		$('#otLrNumber').val("");
}

function resetLrDate() {
	if (configuration.LRDate == 'true' )
		$('#lrDateManual').val("");
}

function resetDeliveryPlace() {
	$('#deliveryPlaceId').val("0");
	$('#deliveryPlace').val("0");
}

function setDeliveryTo() {
	removeOption('deliveryTo',null);
	
	for(const element of deliveryToArray) {
		createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
	}
	
	$("#deliveryTo").val(configuration.DefaultDeliveryAt);
}

function createDeliveryTo() {
	removeOption('deliveryTo', null);
	let regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
	
	if(configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, executive.regionId) 
			&& $('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE 
			&& (getBookingType() != DIRECT_DELIVERY_DIRECT_VASULI_ID))
		createOption('deliveryTo', DELIVERY_TO_DOOR_ID, DELIVERY_TO_DOOR_NAME);
	else if(getBookingType() == DIRECT_DELIVERY_DIRECT_VASULI_ID)
		createOption('deliveryTo', DIRECT_DELIVERY_DIRECT_VASULI_ID, DIRECT_DELIVERY_DIRECT_VASULI_NAME);
	else if (configuration.showDeliveryToOpionsOnLRTypeAndBookingType == 'true' && configuration.deliveryToWithLRTypeAndBookingType.length > 0) {
		const setDeliveryToBasedOnBookingTypeAndLRType = configuration.deliveryToWithLRTypeAndBookingType.split(',');
		
		let deliveryToArr	= [];

		setDeliveryToBasedOnBookingTypeAndLRType.forEach(function (deliveryToConfig) {
			const values = deliveryToConfig.split('_');
			if (values.length !== 3) return;

			const [lrTypeID, bookingTypeID, deliveryToID] = values;

			if (getBookingType() == bookingTypeID && $('#wayBillType').val() == lrTypeID) {
				deliveryToArr = deliveryToArray.filter(function(obj) {return obj.deliveryAtId == Number(deliveryToID);});
			}
		});
		
		if(deliveryToArr.length > 0) {
			for(const element of deliveryToArr) {
				createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
			}
		} else {
			for(const element of deliveryToArray) {
				if(element.deliveryAtId != DIRECT_DELIVERY_DIRECT_VASULI_ID && element.deliveryAtId != FROM_VEHICLE_ID)
					createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
			}
		}
	} else {
		for(const element of deliveryToArray) {
			if(element.deliveryAtId != DIRECT_DELIVERY_DIRECT_VASULI_ID && element.deliveryAtId != FROM_VEHICLE_ID)
				createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
		}

		if($('#wayBillType').val() != Number(WAYBILL_TYPE_PAID))
			removePassenger();
	}

	if(configuration.byDefaultDeliveryAt == 'true' && (configuration.BookingType == 'false' || getBookingType() != DIRECT_DELIVERY_DIRECT_VASULI_ID))
		$("#deliveryTo").val(configuration.DefaultDeliveryAt);
	
	setDefaultDeliveryToOnWayBillType();
}

function setDefaultDeliveryToOnWayBillType() {
	if(configuration.selectDeliveryToOnWayBillType == 'false') return;

	$('#deliveryTo option:selected').removeAttr('selected');

	let wayBillTypeIdsToDeliveryAtArr = (configuration.wayBillTypeIdsForDoorDeliveryTo).split(",");
	
	if(isValueExistInArray(wayBillTypeIdsToDeliveryAtArr, $('#wayBillType').val())) {
		$("#deliveryTo").val(DELIVERY_TO_DOOR_ID);
		$("#deliveryTo option[value=" + DELIVERY_TO_DOOR_ID+"]").attr("selected","selected") ;
	} else {
		for(const element of deliveryToArray) {
			if(element.deliveryAtId != DIRECT_DELIVERY_DIRECT_VASULI_ID && element.deliveryAtId != FROM_VEHICLE_ID)
				createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
		}
	}
}

function createDeliveryToOption() {
	removeOption('deliveryTo', null);

	for(const element of deliveryToArray) {
		createOption('deliveryTo', element.deliveryAtId, element.deliveryAtName);
	}
	
}

function resetDestinationPointData() {
	resetDestinationIds();
	resetOnChargeTypeExcludingPackageDetails(); // Replaced from resetCharges();
	resetFreightUptoBranch();
	
	if(configuration.ChargeTypeFlavour == '4') {
		resetCustomer();
		resetBillingParty();
		chargesConfigRates	= null;
		wayBillRates	= null;
		billingPartyChargeConfigRates	= false;
		consignorPartyChargeConfigRates	= false;
		consigneeChargeConfigRates		= false;
		isBranchChargeConfigRate		= false;
		isConsignorIncreaseChargeWeight = false;
		isConsigneeIncreaseChargeWeight	= false;
	}
}
	
function resetBillingBranchData() {
	$('#billingBranchId').val(0);
	$('#billingBranch').val('');
}

function resetFreightUptoBranch() {
	if (configuration.FrightuptoDestination == 'true') {
		var futb = document.getElementById('freightUptoBranch');
		futb.value  = '';
		futb.disabled  = true;
		resetFreightUptoBranchId();
	}
}

function resetFreightUptoBranchId() {
	$('#freightUptoBranchId').val(0);
}

function resetDestinationIds() {
	if(configuration.ShowCityAndDestinationBranch == 'true') {
		$('#destinationCitySelectEle_primary_key').val(0);
		$('#destinationIdEle_primary_key').val(0);
	} else {
		$('#destinationBranchId').val(0);
		$('#destinationStateId').val("0");
		$('#typeOfLocation').val("0");
	}
	
	$('#destinationSubRegionId').val(0);
	destBranchAccountGroupId = 0;
}

function resetSubRegion() {
	if (configuration.showSubRegionwiseDestinationBranchField == 'true') {
		$('#destSubRegionId').val(0);
		$('#subRegion').val("");
		$('#DestBranchIdEle').val("");
		resetDestination();
	}
}

function resetDestination() {
	if (configuration.DeliveryDestination == 'true') {
		if(configuration.ShowCityAndDestinationBranch == 'true'&& !isManualWayBill) {
			$('#destinationCitySelectEle').val("");
			$('#destinationIdEle').val("");
		} else
			$('#destination').val("");

		resetDestinationIds();
	}
}

function resetSourceBranch() {
	if (configuration.sourceBranch == 'true') {
		$('#sourceBranch').val("");
		$('#sourceBranchId').val(0);
		selectedSource = 0;
	}
}

function resetInvoiceNo() {
	if (configuration.InvoiceNo == 'true')
		$('#invoiceNo').val("");
}

function resetInvoiceDate() {
	if (configuration.showInvoiceDate == 'true')
		$('#invoiceDate').val("");
}

function resetPurchaseOrderDate() {
	if (configuration.purchaseOrderDate == 'true')
		$('#purchaseOrderDate').val("");
}

function setPickupType() {
	removeOption('PickupType', null);
	if (configuration.validatePickupType == true || configuration.validatePickupType == 'true')
		createOption('PickupType', 0, '--Select--');
	createOption('PickupType', PICK_UP_TYPE_OFFICE_ID, PICK_UP_TYPE_GODOWN_NAME);
	createOption('PickupType', PICK_UP_TYPE_FEILD_ID, PICK_UP_TYPE_DOOR_NAME);
}

function setServiceType(){
	removeOption('serviceType',null);
	createOption('serviceType',ServiceTypeConstant.SERVICE_TYPE_NORMAL_ID, ServiceTypeConstant.SERVICE_TYPE_NORMAL_NAME);
	createOption('serviceType',ServiceTypeConstant.SERVICE_TYPE_EXPRESS_ID, ServiceTypeConstant.SERVICE_TYPE_EXPRESS_NAME);
}

function setPaymentModeOption() {
	removeOption('paymentMode',null);

	createOption('paymentMode',PaymentTypeConstant.PAYMENT_TYPE_CASH_ID, PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
	createOption('paymentMode',PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID, PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME);
}

function resetPrivateMark() {
	if (configuration.PrivateMark == 'true' || configuration.PrivateMarkBeforeFormType == 'true')
		$('#privateMark').val("");
}

function resetPanNumber() {
	if (configuration.PanNumber == 'true') {
		setValueToTextField('panNumber', '');
		setValueToTextField('consignorPanNumber', '');
		setValueToTextField('consigneePanNumber', '');
		setValueToTextField('billingPartyPanNumber', '');
	}
}

function resetRemark() {
	if (configuration.Remark == 'true')
		$('#remark').val("");
}

function resetPurchaseOrderNumber() {
	if (configuration.purchaseOrderNumber == 'true')
		$('#purchaseOrderNumber').val("");
}

function resetAdditionalRemark() {
	if (configuration.additionalRemark == 'true')
		$('#additionalremark').val("");
}

function resetDeliveryTo() {
	if (configuration.DeliveryAt == 'true' || configuration.deliveryAtAfterBookingType == 'true' || configuration.deliveryAtAfterBookingType == true)
		$('#deliveryTo').val(configuration.DefaultDeliveryAt);
}

function resetChargesRemark() {
	if (configuration.wayBillChargeWiseRemarkNeeded == 'true') {
		var chargeIdList 	= (configuration.waybillChargeMasterIdsForRemark).split(',');
		
		for(var i = 0 ; i < chargeIdList.length; i++) {
			$('#remark_' + chargeIdList[i]).val("");
			showHideRemark(chargeIdList[i]);
		}
	}
}

function resetCommodityType() {
	if (configuration.CommodityType == 'true')
		$('#commodityType').val(0);
}

function setSTPaidBy() {
	removeOption('STPaidBy', null);

	createOptionForSTPaidBy();
}

function createOptionForSTPaidBy() {
	if(configuration.BranchWiseDataHide == 'true' || configuration.BranchWiseDataHide == true) {
		var branchArr = (configuration.branchIdsToHide).split(',');
		
		var checkBranch = isValueExistInArray(branchArr, branchId);
		
		if(checkBranch)
			configuration.hideStPaidByTransporter = 'true';
	}
	
	if(configuration.hideStPaidByNotApplicable == 'false' || configuration.hideStPaidByNotApplicable == false)
		createOption('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_ID, TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_NAME);
	
	if(configuration.showStPaidByConsignor == 'true' || configuration.showStPaidByConsignor == true)
		createOption('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID, TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME);
	
	if(configuration.showStPaidByConsignee == 'true' || configuration.showStPaidByConsignee == true)
		createOption('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID, TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME);
	
	if(configuration.hideStPaidByTransporter == 'false')
		createOption('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID, TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME);
	
	if(configuration.hideStPaidByExempted == 'false')
		createOption('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID, TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME);
}

function setBookingCharges(wayBillType) {
	let charges						= jsondata.charges;
		
	if (configuration.removeTopayAdvanceFieldFromChargesTable == 'true' || configuration.removeTopayAdvanceFieldFromChargesTable == true) 
		  charges 					= charges.filter(charge => charge.chargeTypeMasterId != PAID_HAMALI);
	
	if(configuration.BranchWiseDataHide == 'true' || configuration.BranchWiseDataHide == true) {
		var branchArr 	= (configuration.branchIdsToHide).split(',');
		
		var checkBranch = isValueExistInArray(branchArr, branchId);
		
		if(checkBranch) {
			var bookingChargeArr = (configuration.bookingChargeIds).split(',');
			
			for(const element of charges) {
				var chargeAllowed = isValueExistInArray(bookingChargeArr, element.chargeTypeMasterId);
				
				if(chargeAllowed)
					createBookingChargeInput(element, wayBillType);
			}
		} else {
			$('#charges').empty();

			for(const element of charges)
				createBookingChargeInput(element, wayBillType);
		}
	} else {
		$('#charges').empty();

		for(const element of charges)
			createBookingChargeInput(element, wayBillType);
	}
	
	if((configuration.AllowSpecificChargeShow == true || configuration.AllowSpecificChargeShow == 'true')
		&& configuration.hideChargesIds != undefined && configuration.hideChargesIds != '0')
		hideCharges((configuration.hideChargesIds).split(","));
	else if(configuration.otherChargesToAddInFreight != undefined && configuration.otherChargesToAddInFreight != '0')
		hideCharges((configuration.otherChargesToAddInFreight).split(","));
	
	hideSpecificCharge(document.getElementById('cargoType'));
	disableSpecificCharges();
	
	if(!jsondata.allowBranchWiseInsuranceService)
		hideCharge(REIMBURSEMENT_OF_INSURANCE_PREMIUM);
}

function disableSpecificCharges() {
	let disableSpecificCharges		= configuration.disableSpecificCharges;
	
	if(disableSpecificCharges == true || disableSpecificCharges == 'true') {
		let disableChargeIdArray			= (configuration.disableChargeIds).split(",");
		let bracnhIdsForEnableChargesArr	= (configuration.bracnhIdsForEnableCharges).split(",");
		let bracnhIdsForDisableChargesArr	= (configuration.bracnhIdsForDisableCharges).split(",");
		
		if(disableChargeIdArray != null && disableChargeIdArray.length > 0) {
			for (const element of disableChargeIdArray) {
				 if(configuration.enableChargesForSpecificBranch == true || configuration.enableChargesForSpecificBranch == 'true' || configuration.disableChargesForSpecificBranch == true || configuration.disableChargesForSpecificBranch == 'true') {
					 if(!isValueExistInArray(bracnhIdsForEnableChargesArr, branchId) || isValueExistInArray(bracnhIdsForDisableChargesArr, branchId))
						 disableCharge(element);
				 } else
					 disableCharge(element);
			}
		}
	}

	if(configuration.disableBranchwisePickupCharge == 'true') {
		var pickupChargeIdForDisable					   = Number(configuration.pickupChargeIdForDisable);
		var branchIdsForDisablePickupChargeArr 	 	       = (configuration.branchIdsForDisablePickupCharge).split(",");
			
		if(isValueExistInArray(branchIdsForDisablePickupChargeArr, branchId))
			disableCharge(pickupChargeIdForDisable);
	}
	
	disableCharge(REIMBURSEMENT_OF_INSURANCE_PREMIUM);
}

function isDisableSpecificCharges(chargeMasterId) {
	var disableChargeIdArray			   = (configuration.disableChargeIds).split(",");
	var pickupChargeIdForDisable		   = Number(configuration.pickupChargeIdForDisable);
	var branchIdsForDisablePickupChargeArr = (configuration.branchIdsForDisablePickupCharge).split(",");
	
	return (isValueExistInArray(disableChargeIdArray, chargeMasterId) ||
	(isValueExistInArray(branchIdsForDisablePickupChargeArr, branchId) &&  (Number(chargeMasterId) == pickupChargeIdForDisable)));
}

function disableBookingCharges() {
	if(jsondata.charges) {
		var chargeTypeModel = jsondata.charges;
		
		for (var i = 0; i < chargeTypeModel.length; i++)
			disableChargeWiseBookingCharges(chargeTypeModel[i].chargeTypeMasterId)
	}	
}

function disableChargeWiseBookingCharges(chargeMasterId) {
	if(configuration.disableBookingCharges == 'true' && !isManualWayBill)
		$('#charge' + chargeMasterId).prop("readonly", "true");
	else if (isDisableSpecificCharges(chargeMasterId))
		$('#charge' + chargeMasterId).prop("readonly", "true");
	else
		$('#charge' + chargeMasterId).removeAttr("readonly");
}

function hideSpecificCharge(cargoType) {
	if(configuration.cargoTypeSelectionWiseShowCharges == true || configuration.cargoTypeSelectionWiseShowCharges == 'true') {
		let	bookinghargeIdArray 		= (configuration.hideBookingChargeIds).split(",");
		let containerChargeIdsArray 	= (configuration.hideContainerChargeIds).split(",");
		
		if(cargoType != null && cargoType.value == ContainerDetails.CARGO_TYPE_CONTAINER) {
			hideCharges(bookinghargeIdArray);
			showCharges(containerChargeIdsArray);
		} else {
			showCharges(bookinghargeIdArray);
			hideCharges(containerChargeIdsArray);
		}
	}
}

function hideCharges(otherChargesList) {
	if(otherChargesList.length > 0) {
		for (let i = 0; i < otherChargesList.length; i++)
			hideCharge(otherChargesList[i]);
	}
}

function showCharges(otherChargesList) {
	if(otherChargesList.length > 0) {
		for (let i = 0; i < otherChargesList.length; i++)
			showCharge(otherChargesList[i]);
	}
}

function SpecificChargeReset() {
	if(configuration.cargoTypeSelectionWiseShowCharges == true || configuration.cargoTypeSelectionWiseShowCharges == 'true') {
		var freight	= Number($("#charge1").val());

		for(var j = 0; j < charges.length; j++)
			$("#charge" + charges[j].chargeTypeMasterId).val(0);

		$("#charges input:text").val("0");

		$("#charge1").val(freight);

		if(typeof calcTotal != 'undefined')
			calcTotal();
		
		diffAmtAfterRoundOff = 0;
		resetTDSDetails();
	}
}

function setPreBookingCharges() {
	var preChargeId	= configuration.PreBookingChargeId;
	var charges	= jsondata.charges;

	for(var i = 0; i < charges.length; i++) {
		if(preChargeId == charges[i].chargeTypeMasterId)	
			createPreBookingChargeInput(charges[i]);
	}
}

function createBookingChargeInput(charge, wayBillType) {
	var inputAttr1		= new Object();
	var inputAttr2		= new Object();
	var inputAttr3		= new Object();
	var divAttr1		= new Object();

	var chargeId		= charge.chargeTypeMasterId;

	var tableRow			= createRow('tr_'+chargeId,'');
	var chargeLabelCol		= createColumn(tableRow,'td_'+chargeId,'70%','left','','');
	var chargeFeildCol		= createColumn(tableRow,'td_'+chargeId,'30%','right','','');
	var specificRateCol		= createColumn(tableRow,'td_'+chargeId,'30%','right','','');

	inputAttr1.id			= 'charge'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'charge'+chargeId;
	//inputAttr1.style		= 'width: 100px;text-align: right;';
	inputAttr1.class		= 'width-100px text-align-right';
	inputAttr1.maxlength	= 6;
	inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"/*+'; getPrevNextCharge(this);'*/; // setActualInputAmount(this)';
	inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');';
	inputAttr1.onblur		= 'validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
	
	if(configuration.disableBookingCharges == 'true' && !isManualWayBill)
		inputAttr1.readonly	= true;
	
	if (lrWiseDecimalAmountAllow(wayBillType))
		inputAttr1.onkeypress	= 'return validAmount(event);return validateFloatKeyPress(event,this);if(getKeyCode(event) == 17){return false;}';
	else
		inputAttr1.onkeypress	= 'return validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
	
	inputAttr1.onpaste		= 'removeSpecialCharacterAfterPaste(this);';

	if(configuration.ApplyAOCCharge == 'true') {
		if(chargeId != BookingChargeConstant.AOC)
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); checkChargesRates(this); calcTotal(); applyAOCCharge();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');validatePickupCartageCharge('+PICKUP_CARTAGE+');';
		else
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); checkChargesRates(this); calcTotal(); resetAOC();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');validatePickupCartageCharge('+PICKUP_CARTAGE+');';
	} else
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0); checkChargesRates(this); chargeValidation(' + chargeId + '); calcTotal();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');validatePickupCartageCharge('+PICKUP_CARTAGE+');';

	if (configuration.LRChargeValidate == 'true') {
		if (chargeId == BookingChargeConstant.LR_CHARGE) {
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateLrCharge();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');';
			inputAttr1.onfocus		= 'validateLrCharge();';
		}
	}
	
	if (configuration.validateServiceCharge == 'true') {
		if (chargeId == BookingChargeConstant.SERVICE_CHARGE) {
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateServiceCharge();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			//inputAttr1.onkeyup		= 'validateServiceCharge();';
		}
	}

	if (configuration.applyLoadingChargeOnFreightChargeAmt == 'true' && chargeId == BookingChargeConstant.LOADING) {
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);chargeValidation(BookingChargeConstant.LOADING); calcTotal(); validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
		inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
	}

	if(configuration.AllowEnableDoorDelivery == 'true') {
		if (lrWiseDecimalAmountAllow(wayBillType))
			inputAttr1.onkeypress	= 'hideAllMessages();removeError(this.id);validAmount(event);return validateFloatKeyPress(event,this);if(getKeyCode(event) == 17){return false;}';
		else
			inputAttr1.onkeypress	= 'hideAllMessages();removeError(this.id);validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';

		inputAttr1.onblur		= 'hideInfo();clearIfNotNumeric(this,0); checkChargesRates(this); chargeValidation(' + chargeId + '); calcTotal();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
	}
	
	if(chargeId == FREIGHT) {
		//inputAttr1.readonly		= true;

		divAttr1.id		= 'freightAmountRate';
		divAttr1.style	= 'border:0px solid #ffd971;background-color:#fffdce;padding:1px;width:110px;font-size: small;position:absolute;box-shadow: 5px 5px 2.5px #888888; border-radius: 4px;display: none;';
		divAttr1.align	= 'center';
		divAttr1.html	= 'Min&nbsp;Rate&nbsp;defined is&nbsp;more';
		createDiv(chargeLabelCol, divAttr1);

		if (configuration.FreightChargeValidate == 'true' && chargeId == FREIGHT) {
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateFreightCharge();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
			inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
			inputAttr1.onkeyup		= 'validateFreightCharge();showHideRemark('+chargeId+');';
		}
	}
	
	if (configuration.regionWiseDoorDeliveryChargeSet == 'true' && chargeId == BookingChargeConstant.DOOR_DELIVERY_BOOKING)
		inputAttr1.onblur		= 'validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');validateDoorDeliveryChargeToRegionWiseMinValue();';

	if(chargeId == CR_INSUR_BOOKING) {
		//inputAttr1.readonly		= true;

		divAttr1.id		= 'freightAmountRate';
		divAttr1.style	= 'border:0px solid #ffd971;background-color:#fffdce;padding:1px;width:110px;font-size: small;position:absolute;box-shadow: 5px 5px 2.5px #888888; border-radius: 4px;display: none;';
		divAttr1.align	= 'center';
		divAttr1.html	= 'Min&nbsp;Rate&nbsp;defined is&nbsp;more';
		createDiv(chargeLabelCol, divAttr1);

		if (configuration.FreightChargeValidate == 'true') {
			if (chargeId == CR_INSUR_BOOKING) {
				if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateInsuranceCharge();validateRemarkOnCharge('+chargeId+');';
				else
					inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateRemarkOnCharge('+chargeId+');';

				inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
				
				if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
					inputAttr1.onkeyup		= 'validateInsuranceCharge();showHideRemark('+chargeId+');';
				else
					inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');';
			}
		}
	}

	if (configuration.addDefaultFormChargeWhenEWayBillNotEntered == 'true' && chargeId == FORM_CHARGES)
		inputAttr1.onblur		= 'validateFormChargeMinValue();';
	
	/*
	if (configuration.allowRegionWiseStatisticalCharge == 'true' && chargeId == STATISTICAL)
		inputAttr1.onblur		= 'chargeValidation(' + chargeId + ');';
	*/

	if (chargeId == BookingChargeConstant.EXPRESS) {
		divAttr1.id		= 'freightAmountRate';
		divAttr1.style	= 'border:0px solid #ffd971;background-color:#fffdce;padding:1px;width:110px;font-size: small;position:absolute;box-shadow: 5px 5px 2.5px #888888; border-radius: 4px;display: none;';
		divAttr1.align	= 'center';
		divAttr1.html	= 'Min&nbsp;Rate&nbsp;defined is&nbsp;more';
		createDiv(chargeLabelCol, divAttr1);

		if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateInsuranceCharge();validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
		else
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0); calcTotal(); validateRemarkOnCharge('+chargeId+');calculateFSOnOtherCharge('+chargeId+');setExpressChargeWiseDeliveryToOption('+chargeId+');';
		
		inputAttr1.onkeydown	= 'hideAllMessages();removeError(this.id);';
		
		if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
			inputAttr1.onkeyup		= 'validateInsuranceCharge();showHideRemark('+chargeId+');';
		else
			inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');';
	}
	
	if(accountGroupId == 383) {
		if (chargeId == BookingChargeConstant.SERVICE_CHARGE)
			inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');if(event.which == 13){setNextPrevAfterCharge('+chargeId+');}';
		
		if (chargeId == BookingChargeConstant.DOOR_DELIVERY_BOOKING)
			inputAttr1.onkeyup		= 'showHideRemark('+chargeId+');if(event.which == 13){setNextPrevAfterCharge('+chargeId+');}';
	}

	inputAttr2.id			= 'actualInput'+chargeId;
	inputAttr2.type			= 'hidden';
	inputAttr2.value		= '0';
	inputAttr2.name			= 'actualInput'+chargeId;

	inputAttr3.id			= 'actualChargeAmount'+chargeId;
	inputAttr3.type			= 'hidden';
	inputAttr3.value		= '0';
	inputAttr3.name			= 'actualChargeAmount'+chargeId;

	createLabel(chargeLabelCol, 'label'+chargeId, charge.displayName , '', 'width-100px', 'Charges');
	createInput(chargeFeildCol, inputAttr1);//,'charge'+chargeId,'text','0','charge'+chargeId,Style,'textfield_medium',false,ReadOnly,5,Onblur,Onkeypress,Onfocus,Onkeydown,Onkeyup);
	createInput(chargeFeildCol, inputAttr2);
	createInput(chargeFeildCol, inputAttr3);

	setSpecificRate(specificRateCol, chargeId);

	createDiv(chargeFeildCol, 'desccharge'+chargeId, '','');

	$('#charges').append(tableRow);
	
	setNonEditableGSTCharge();
	setNonEditableFreightCharge();
	enableDisableExpressServiceCharge();
	setNonEditableRiskCoverageCharge();
	setNonEditableDocCharge();
	
	$( "#charge" + chargeId ).blur(function() {
		doNotAllowLesserAmount(this);
		doNotAllowLesserFreightAmount(this);
	});
}

function setSpecificRate(specificRateCol, chargeId) {
	if(isManualWayBill) {
		if(configuration.DisplaySpecificRateInManualBooking == 'true') {
			var chargesIdArr	= (configuration.ChargesForShowSpecificRateInManualBooking).split(',');
			var specificFreightChargeAmount	= configuration.specificFreightChargeAmount;

			for(var i = 0; i < chargesIdArr.length; i++) {
				if(chargeId == chargesIdArr[i])
					createLabel(specificRateCol, 'SpecificRate_' + chargeId, specificFreightChargeAmount, 'width: 40px; text-align: right; background-color: #D6D5D9;', '', '');
			}

			setSpacesInColumn();
		}
	} else {
		if(configuration.DisplaySpecificRateInBooking == 'true') {
			var chargesId		= configuration.ChargesForShowSpecificRateInBooking;
			var chargesIdArr	= chargesId.split(',');
			var specificFreightChargeAmount	= configuration.specificFreightChargeAmount;

			for(var i = 0; i < chargesIdArr.length; i++) {
				if(chargeId == chargesIdArr[i])
					createLabel(specificRateCol, 'SpecificRate_' + chargeId, specificFreightChargeAmount, 'width: 40px; text-align: right; background-color: #D6D5D9;', '', '');
			}

			setSpacesInColumn();
		}
	}
}

function setSpacesInColumn() {
	setValueToHtmlTag('totalRightCol', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
	setValueToHtmlTag('discountRightCol', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
	setValueToHtmlTag('discountTypeRightCol', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
	setValueToHtmlTag('taxRightCol', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
	setValueToHtmlTag('grandTotalRightCol', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
}

function createPreBookingChargeInput(charge) {
	
	var inputAttr1		= new Object();

	var chargeId		= charge.chargeTypeMasterId;

	var tableRow		= createRow('tr_'+chargeId,'');
	var tableCol1		= createColumn(tableRow,'td_'+chargeId,'10%','left','','');
	var tableCol		= createColumn(tableRow,'td_'+chargeId,'70%','left','','');

	inputAttr1.id			= 'preCharge_'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'preCharge_'+chargeId;
	inputAttr1.class		= 'width-100px text-align-right';
	inputAttr1.maxlength	= 5;
	inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"/*+'; getPrevNextCharge(this);'*/; // setActualInputAmount(this)';
	inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
	inputAttr1.onblur		= 'setBookingChargeAmt(this);clearIfNotNumeric(this,0); calcTotal();';

	createLabel(tableCol1, 'label'+chargeId, charge.chargeName , 'font-size: 15px;', 'width-100px', 'Charges');
	createInput(tableCol,inputAttr1);

	$('#preCharge').append(tableRow);
}

function checkDeliveryDeatails() {
	if(configuration.AllowEnableDoorDelivery == 'true') {
		var deliveryTo = getValueFromInputField("deliveryTo");
		if(deliveryTo ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID && Number($('#wayBillType').val()) != Number(WayBillType.WAYBILL_TYPE_FOC)) {
			$('#charge' + Number(configuration.doorDeliveryChargeId)).removeAttr("readonly");
			
			if($('#charge' + Number(configuration.doorDeliveryChargeId)).val() <= 0)
				applyRates();
		} else {
			setValueToTextField('charge' + Number(configuration.doorDeliveryChargeId), 0)
			$('#charge' + Number(configuration.doorDeliveryChargeId)).prop("readonly", "true");
			calcTotal();
		}
	}

	if(podConfiguration.handlePodVisibility == 'true' || podConfiguration.handlePodVisibility == true)
		handlePodVisibility();
		
}

function setDiscountType() {
	if(configuration.DiscountTypes == 'false') {
		$('#rowdiscountTypes').remove();
		return;
	}
	
	removeOption('discountTypes', null);
	var discountTypes = jsondata.discountTypes;

	createOption('discountTypes',0, '--Select--');

	if(!jQuery.isEmptyObject(discountTypes)) {
		for(var i = 0; i < discountTypes.length; i++) {
			createOption('discountTypes', discountTypes[i].split("_")[0], discountTypes[i].split("_")[1]);
		}
	}
}

function setTaxes() {
	if(configuration.BranchWiseDataHide == 'true') {
		var branchArr = (configuration.branchIdsToHide).split(',');
		
		if(!isValueExistInArray(branchArr, branchId)) {
			var taxes	= jsondata.taxes;
			
			if(jQuery.isEmptyObject(taxes))
				return;
			
			taxableAmount	= taxes[0].leastTaxableAmount;
			
			for (const element of taxes) {
				createTaxesInput(element);
			}
		} 
	} else {
		if(configuration.allowTransportModeWiseTax  == 'true') {
			defaultTransportationModeId			= configuration.defaultTransportationModeId;
			
			if($("#transportationMode").val() != null)
				defaultTransportationModeId = $("#transportationMode").val();
			
			jsondata.taxes = taxModelHm[accountGroupId + "_" + defaultTransportationModeId];
		} else if(configuration.allowTransportCategoryWiseTax  == 'true') {
			let defaultTransportationCategoryId = 0;
						
			if($("#transportationCategory").val() != null)
				defaultTransportationCategoryId = Number($("#transportationCategory").val());

			jsondata.taxes = taxModelHm[accountGroupId + "_" + defaultTransportationCategoryId];
		} else if(configuration.allowTaxTypeWiseTax == 'true') {
			let defaultTaxTypeId = 0;
			
			if($("#taxTypeId").val() != null)
				defaultTaxTypeId = Number($("#taxTypeId").val());
				
			if(configuration.defaultTaxType != undefined && defaultTaxTypeId == 0)
				defaultTaxTypeId = configuration.defaultTaxType;
			
			if(taxModelHm != undefined)
				jsondata.taxes = taxModelHm[accountGroupId + "_" + defaultTaxTypeId];
		}
		
		var taxes	= jsondata.taxes;
		
		if(jQuery.isEmptyObject(taxes))
			return;
		
		taxableAmount	= taxes[0].leastTaxableAmount;
		
		for (var i = 0; i < taxes.length; i++) {
			createTaxesInput(taxes[i]);
		}
	}
	
}

function createTaxesInput(taxes) {
	
	var jsonObject1	= new Object();
	var jsonObject2	= new Object();
	var jsonObject3	= new Object();

	var tableRow1	= null;
	var tableRow2	= null;
	var tableCol1	= null;
	var tableCol2	= null;
	var tableCol3	= null;
	var taxvalue	= null;	
	var input2		= null;
	
	var isTaxInclusive = 0;

	if (taxes.isExclusive) {
		tableRow1	= createRow('tr_'+taxes.taxModelId+"1",'');
		tableRow2	= createRow('tr_'+taxes.taxModelId+"2",'');
		tableCol1	= createColumn(tableRow1, 'td_'+taxes.taxModelId+'_1','50%','left','','');
		tableCol3	= createColumn(tableRow2, 'td_'+taxes.taxModelId+'_3', '50%', '', '', '3');

		jsonObject3.id				= 'isAppliedOnBase'+taxes.taxMasterId;
		jsonObject3.type			= 'hidden';
		jsonObject3.value			= taxes.isApplicableOnBaseValue;
		jsonObject3.name			= 'isAppliedOnBase';

		createInput(tableCol3, jsonObject3);

		taxvalue	= taxes.taxName;

		if (taxes.isTaxPercentage) {
			var taxAmnt = (taxes.taxAmount).toFixed(2);
			taxvalue	+= ' ' + taxAmnt + '%';
		}

		createLabel(tableCol1, taxes.taxName, taxvalue, '', 'width-100px', '');
		tableCol2	= createColumn(tableRow1,'td_'+taxes.taxModelId+'_2','50%','right','','');
		createColumn(tableRow1, 'taxRightCol', '', '', '');

		jsonObject1.id				= 'tax'+taxes.taxMasterId;
		jsonObject1.type			= 'text';
		jsonObject1.name			= 'tax'+taxes.taxMasterId;
		//jsonObject1.style			= 'width: 100px;text-align: right;';
		jsonObject1.class			= 'width-100px text-align-right';
		
		if(configuration.doNotCalculateAutomaticTax == 'false' || configuration.doNotCalculateAutomaticTax == false)
			jsonObject1.readonly	= true;
		else {
			jsonObject1.onkeyup		= "next='save'";
			jsonObject1.onblur		= 'calculateTaxManually(this);clearIfNotNumeric(this,0);';
			jsonObject1.onfocus		= "if(this.value==0)this.value=''";
			jsonObject1.onkeypress	= "return validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}";
		}

		jsonObject2.id				= 'Perctax'+taxes.taxMasterId;
		jsonObject2.type			= 'checkbox';
		jsonObject2.value			= (taxes.taxAmount).toFixed(2);
		jsonObject2.name			= 'Perctax'+taxes.taxMasterId;
		//jsonObject2.style			= 'display: none';
		jsonObject2.class			= 'hide';

		if (taxes.isTaxPercentage) {
			jsonObject1.value			= 0;

			createInput(tableCol2, jsonObject1);
			input2			= createInput(tableCol2, jsonObject2);
			$(input2).attr('checked','checked');
		} else {
			jsonObject1.value			= (taxes.taxAmount).toFixed(2);
			
			if(configuration.doNotCalculateAutomaticTax == 'false' || configuration.doNotCalculateAutomaticTax == false)
				jsonObject2.readonly	= true;
			else {
				jsonObject2.onkeyup		= "next='save'";
				jsonObject2.onblur		= 'calculateTaxManually(this);clearIfNotNumeric(this,0);';
				jsonObject2.onfocus		= "if(this.value==0)this.value=''";
				jsonObject2.onkeypress	= "return validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}";
			}

			createInput(tableCol2, jsonObject1);
			input2		= createInput(tableCol2, jsonObject2);
		}
	} else
		isTaxInclusive = 1;

	if (isTaxInclusive == 1)
		$('#Taxes_Inclusive').html('Taxes Inclusive');

	$('#taxes').append(tableRow1);
	$('#taxes').append(tableRow2);
}

function resetCharges() {

	$('#freightChargeValue').val(0);
	$('#insuranceChargeValue').val(0);

	for(var j = 0; j < charges.length; j++) {
		$("#charge" + charges[j].chargeTypeMasterId).val(0);
		$('#actualChargeAmount' + charges[j].chargeTypeMasterId).val(0);
	}

	$("#charges input:text").val("0");
	setValueToHtmlTag('pureFrieghtAmt', 0);

	$('#receivedAmount').val(0);
	$('#balanceAmount').val(0);
	$('#receivedAmtEle').val(0);
	$('#balanceAmtEle').val(0);
	resetTDSDetails();
	$('#searchRate').val("");
	$('#partyMinimumRate').val("");
	
	resetSpecificCharges();

	weightTypeArr 		= new Array();
	quantityTypeArr		= new Array();
	calcDDCharge		= false;
	calcDDChargeArr		= new Array();
	
	if(typeof calcTotal != 'undefined') calcTotal();
	
	setBuiltyAndFreightCharge();
	
	diffAmtAfterRoundOff = 0;
	
	if(isFreightChargeEnable && Number($('#chargeType').val()) != 0 && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && isTokenWayBill)
		$('#charge' + BookingChargeConstant.FREIGHT).removeAttr("readonly", "true");
		
	disableCharge(REIMBURSEMENT_OF_INSURANCE_PREMIUM);
}

function resetSpecificCharges() {

	var charges	= jsondata.charges;
	var specificFreightChargeAmount	= configuration.specificFreightChargeAmount;

	for(const element of charges) {
		if($('#wayBillType').val() == WAYBILL_TYPE_FOC)
			setValueToHtmlTag('SpecificRate_' + element.chargeTypeMasterId, 0);
		else
			setValueToHtmlTag('SpecificRate_' + element.chargeTypeMasterId, specificFreightChargeAmount);
	}
}

function resetOnChargeTypeExcludingPackageDetails() {
	resetCharges();
	resetSpecificCharges();
	resetDataExcludingPackageDetails();
	
	if(configuration.cargoTypeSelectionWiseShowCharges == true || configuration.cargoTypeSelectionWiseShowCharges == 'true'){
		$('#cargoType').val(0);
		hideSpecificCharge(document.getElementById('cargoType'));
	}
}

function resetDataExcludingPackageDetails() {
	if(configuration.ResetDataExcludingPackageDetails == 'true') {
		$('#actualWeight').val(0);
		$('#chargedWeight').val(0);
		$('#qtyAmount').val(0);
		$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
		$('#weightAmount').val(0);
		$('#cftWeight').val(0);
		$('#cftAmount').val(0);
		$('#cftFreightRate').val(0);
		$('#cbmAmount').val(0);
		$('#cbmFreightRate').val(0);
		
		$('#label' + BookingChargeConstant.AOC).html('AOC');
	} else {
		//resetArticleWithTable();
	}

	isAppliedGeneralRateForParty = false;
}

function resetAllCharge() {
	$('#fixAmount').val("0");
	$('#totalAmt').val("0");
	$('#grandTotal').val("0");
	$('#diffAmtAfterRoundOffForOther').val(0);
	$("#charges input:text").val("0");
	$('#charge'+BookingChargeConstant.LR_CHARGE).val(defaultlrCharge);
	$('#receivedAmount').val(0);
	$('#balanceAmount').val(0);
	$('#receivedAmtEle').val(0);
	$('#balanceAmtEle').val(0);
}

function resetDiscount() {
	if (isBookingDiscountAllow) {
		$('#discount').val("0");
		
		if(document.getElementById("isDiscountPercent"))
			document.getElementById("isDiscountPercent").checked	= false;

		if ($('#discountTypes') && (typeof $('#discountTypes').val() !== 'undefined'))
			setComboBoxIndex('discountTypes', 0);
	}

	if(isBookingDiscountPercentageAllow)
		$('#discountPercentage').val("0");
}

function resetCommission() {
	$('#agentcommission').val("0");
}

function resetTaxes() {
	var taxes	= jsondata.taxes;

	if(jQuery.isEmptyObject(taxes))
		return;

	for (const element of taxes) {
		$('#tax'+element.taxMasterId).val("0");
	}
	
	if(configuration.taxCalculationBasedOnGSTSelection == 'true') {
		resetGSTTaxes(defaultTaxValue);
		//for manual bookong reset
		$('#gstSelection').val(0)
	}
}

function resetWeight() {
	$('#actualWeight').val("0");
	$('#chargedWeight').val("0");
	$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
	$('#weightAmount').val("0");	
	$('#cftWeight').val("0");
}

function setNewPartyType() {
	removeOption('newPartyType', null);

	createOption('newPartyType', 0, '------ Select Type -----');

	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING, 'Consignor');
	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY, 'Consignee');
	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH, 'Both');
}

function setPartialPaymentTypeOption() {
	removeOption('partialPaymentType', null);
	createOption('partialPaymentType', 0, '---Select Payment Type---');
	createOption('partialPaymentType', 60, 'Partial Payment');
}

function resetCorporateData() {
	if($('#consignorCorpId').val() <= 0)
		return true;

	$('#consignorCorpId').val('0');
	$('#partyOrCreditorId').val('0');
	$('#billingPartyCreditorId').val('0');
}

function resetPartyData() {
	if(configuration.resetTBBDataAfterResetConsignorName == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
		$('#billingPartyId').val('0');
		$('#billingPartyName').val('');
		resetConsignor();
				
		resetCharges();
				
		if(configuration.partyWiseArticleSelectionList == 'true')
			resetConsignementGoods();
	}
	
	if($('#partyMasterId').val() <= 0)
		return true;
	
	$('#partyMasterId').val('0');
	$('#partyOrCreditorId').val('0');
	minWeight		=	0;
	ddSlabAmount	=  	0;
	resetCharges(); 
	removeRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
	$('#billingPartyCreditorId').val('0');

	emptyInnerValue('noTypePanel');
	
	if(configuration.allowToChangePartyDetailsOnGstNumber == 'false')
		resetConsignor();		
	
	if(configuration.partyWiseArticleSelectionList == 'true')
		resetConsignementGoods();
	
	$('#cftRate').val("0");
}

function resetConsineePartyData() {
	if(getValueFromInputField('consigneePartyMasterId') <= 0)
		return true;

	$('#consigneePartyMasterId').val('0');
	removeRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
	
	if(configuration.allowToChangePartyDetailsOnGstNumber == 'false')
		resetConsignee();
	
	resetArticleWithTable();
	
	if(configuration.partyWiseArticleSelectionList == 'true')
		resetConsignementGoods();
}

function resetBillingPartyData() {
	if($('#billingPartyId').val() <= 0)
		return true;
	
	$('#billingPartyId').val('0');
	$('#cftRate').val("0");
	validateInvoiceNumberForTBB	= false;
	validatePartNumberForTBB = false;
	minWeight		=	0;
	ddSlabAmount	=  	0;
	resetCharges(); 

	if(configuration.partyWiseArticleSelectionList == 'true')
		resetConsignementGoods();
		
	if (configuration.getBillingBranchOfBillingPartyFromPartyMaster == 'true') {
		$('#billingBranch').val('');
		$('#billingBranchId').val(0);
	}
}

function resetConsignor() {
	$('#consignorName').val("");
	$('#consignorPhn').val("");
	$('#consignorPartyCode').val("");
	$('#consignorGstn').val("");
	$('#prevConsignorGstn').val("");
	$('#consignoCorprGstn').val("");
	$('#consignorAddress').val("");
	$('#consignorPin').val("");
	$('#consignorContactPerson').val("");
	$('#consignorEmail').val("");
	$('#consignorDept').val("");
	$('#consignorFax').val("");
	$('#consignorCorpId').val(0);
	$('#partyMasterId').val("0");
	$('#partyOrCreditorId').val("0");
	$('#consignorTin').val("");
	$('#consignorCft').val(0);
	$('#cftRate').val(0);
	$("#isSmsSendToConr").prop( "checked", false);
	$('#billingGstn').val("");
	$('#prevBillingGstn').val("");
		
	isTransporterForConsignor	= false;
	isConsignorTBBParty	= false;
	validateInvoiceNumberForConsignor = false;
	validatePartNumberForConsignor = false;	
	
	if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true')
		$("#consignorName").attr("readonly",false);
	
	if(configuration.customSetGstPaidByExemptedOnParty == 'true')
		setSTPaidByOnGSTNumber();
		
	$('#consignorPhn').prop('readonly', false);
	$('#consignorEmail').prop('readonly', false);
}

function resetConsignee() {
	$('#consigneeName').val("");
	$('#consigneePhn').val("");
	$('#consigneeGstn').val("");
	$('#prevConsigneeGstn').val("");
	$('#consigneePartyCode').val("");
	$('#consigneeCorpGstn').val("");
	$('#consigneeAddress').val("");
	$('#consigneePin').val("");
	$('#consigneeContactPerson').val("");
	$('#consigneeEmail').val("");
	$('#consigneeDept').val("");
	$('#consigneeFax').val("");
	$('#consigneeCorpId').val("0");
	$('#consigneePartyMasterId').val("0");
	$('#consigneeTin').val("");
	$('#consigneeCft').val(0);
	$('#cftRate').val(0);
	$("#isSmsSendToConee").prop( "checked", false);
	isTransporterForConsignee	= false;
	isConsigneeTBBParty	= false;
	validateInvoiceNumberForConsignee = false;
	validatePartNumberForConsignee = false;
	$('#consigneePhn').prop('readonly', false);
	$('#consigneeEmail').prop('readonly', false);
						
	if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true')
		$("#consigneeName").attr("readonly", false);
	
	if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true' || configuration.customSetGstPaidByExemptedOnParty == 'true')
		setSTPaidByOnGSTNumber();
}

function resetCustomer() {
	$('#billingPartyName').val("");
	$('#limit').html('');
	resetConsignor();
	resetConsignee();
	resetAddNewPartyElements();
	partyDeviationPercent = 0;
	partyDeductionPercent = 0;
}

function resetBillingParty() {
	if ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
		$('#billingPartyId').val(0);
		$('#billingPartyName').val("");
		$('#billingPartyCreditorId').val("0");
		$('#cftRate').val(0);
		
		if (configuration.getBillingBranchOfBillingPartyFromPartyMaster == 'true') {
			$('#billingBranch').val('');
			$('#billingBranchId').val(0);
		}
	}
}

function setActualInputAmount(obj) {
	var chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	$('#actualInput'+chargeMasterId).val(obj.value);
}

/*
 * Called in autocomplete.js
 * Function created to set Vehicle Type details after Selecting Vehicle Number
 */
function setVehicleTypeDetails(id, capacity, name) {
	if(!$('#vehicleType').exists()) return;
	
	if(configuration.setVehicleNumberWiseVehicleType == 'true') {
		if(id > 0) {
			operationOnSelectTag('vehicleType', 'removeAll', '', null);
			operationOnSelectTag('vehicleType', 'addNew', name, id + "," + capacity);
		}
	} else
		$('#vehicleType').val(id + "," + capacity);
}

/*
 * Called in VehicleNumber.html page
 */
function resetVehicleTypeOnVehicleNumber() {
	if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') {
		setVehicleType();
		enableDisableInputField('vehicleType', 'false');
	}
}

function setPartyAutocomplete(ui, partyType, nextValue) {
	if(ui.item.id != 0) {
		if(ui.item.isBlackListed == true) {
			showMessage('error', iconForErrMsg + ' ' +ui.item.errorDescription);
			ui.item.value = "";

		} else {
			//Calling from Customer.js		
			getPartyDetailsData(ui.item.id, partyType);
			
			if(isManualWayBill && configuration.ApplyRateInManual != 'true')
				return false;

			//Calling from Rate.js
		  getFlavourWiseRates(ui.item.id, partyType);

			if(configuration.IncreaseChargeWeight == 'true')
				getFlavourWiseChargeWeightToIncrease(ui.item.id, partyType);

			if(configuration.FormTypeWiseChargeAllow == 'true')
				getFlavourWiseFormTypeWiseCharges(ui.item.id, partyType);
			
			if(ui.item.isPODRequired == true) {
				if(partyType == PartyMaster.PARTY_TYPE_CONSIGNOR) {
					isPODRequiredBasedOnConsignor 		= true;
					isPODRequiredBasedOnBillingParty 	= true;
				} else if(partyType == PartyMaster.PARTY_TYPE_CONSIGNEE)
					isPODRequiredBasedOnConsignee = true;
				
				setPODRequiredFeild();
			} else {
				if(podConfiguration.setPODRequiredBasedOnTBBParty) {
					if(!isPODRequiredBasedOnBillingParty)
						isPODRequiredBasedOnBillingParty 	= false;
				} else
					isPODRequiredBasedOnBillingParty 	= false;
				
				isPODRequiredBasedOnConsignor 		= false;
				isPODRequiredBasedOnConsignee 		= false;
				setPODRequiredFeild();
			}
			
			if(isTokenWayBill) {
				filterArticleChargeTypeWiseRate();
				filterWeightChargeTypeWiseRate();
			}
		}
	} else if(Number($('#destination').val()) == 0 && partyType == PartyMaster.PARTY_TYPE_CONSIGNEE){
		setTimeout(function(){ 
			$('#destination').focus(); 
			$('#consigneeName').val('');
			showMessage('error', " Please Select Destination !");	
		}, 200);
	}
}

function setPODRequiredFeild() {
	let wayBillType	= $('#wayBillType').val();
	
	if(wayBillType == WAYBILL_TYPE_PAID && isPODRequiredBasedOnConsignor
		|| wayBillType == WAYBILL_TYPE_TO_PAY && isPODRequiredBasedOnConsignee
		|| wayBillType == WAYBILL_TYPE_CREDIT && isPODRequiredBasedOnBillingParty)
		$('#podRequiredStatus').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
}

function setPODRequiredBasedOnTBBParty() {
	let wayBillType	= $('#wayBillType').val();
	
	if(podConfiguration.editPODRequiredForAdminAtBooking
		&& wayBillType == WAYBILL_TYPE_CREDIT && executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN)
		isPODRequiredBasedOnBillingParty  = false;

	if(podConfiguration.setPODRequiredBasedOnTBBParty
		&& wayBillType == WAYBILL_TYPE_CREDIT && isPODRequiredBasedOnBillingParty)
		$('#podRequiredStatus').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
}

function setPartyAutocompleteOnPanel2(ui, partyType) {
	if(ui.item.id != 0) {
		if(ui.item.isBlackListed == true) {
			showMessage('error', iconForErrMsg + ' ' +ui.item.errorDescription);
		} else {
			//Calling from Customer.js
			getPartyDetailsDataOnPanel2(ui.item.id, partyType);
		}
	} 
}

function bindPackingTypeFunction(){
	findifNewRate();
	getPackingTypeRates();
	hideAllMessages();
	removeError('typeofPacking');
}

function setAutoCompleters() {
	//All Functions called from autocomplete.js
	setSourceBranchAutoComplete();
	
	if(configuration.destinationBranchComboboxAutocomplete == 'true')
		setDestinationBranchComboboxAutocomplete();
	else
		setDestinationAutoComplete();
	
	setFreightUptoBranchAutoComplete();
	
	if (configuration.showSubRegionwiseDestinationBranchField)
		setSubRegionAutoComplete();
	
	if(configuration.partyPanelType == '2') {
		setConsignorPhnAutoComplete();
		setConsigneePhnAutoComplete();
		setConsignorNameAutocompleteOnPanel2();
		setConsigneeNameAutocompleteOnPanel2();
	} else if(configuration.partyPanelType == '3') {
		setConsignorPhnAutoComplete();
		setConsigneePhnAutoComplete();
		setConsignorGstnAutoComplete();
		setConsigneeGstnAutoComplete();	
	} else {
		setConsignorNameAutoComplete();
		setConsigneeNameAutoComplete();
		
		if(isGSTNumberWiseBooking()) {
			setConsignorGstnAutoComplete();
			setConsigneeGstnAutoComplete();	
		}
	}

	setBillingPartyNameAutoComplete();
	setSaidToContainAutoComplete();
	setSearchCollectionPersonAutoComplete();
	setBillingBranchAutoComplete();
	setRecoveryBranchAutoComplete();
	
	if(configuration.partyWiseArticleSelectionList == 'true' || configuration.setDefaultPackingTypeGroupWise == 'true') {
		if(configuration.setDefaultPackingTypeGroupWise == 'true')
			$('#typeofPackingCol').empty();
		
		$("#typeofPackingCol").load( "/ivcargo/jsp/createWayBill/includes/PackingTypeInput.html", function() {
			setPackingTypeAutoCompleterWithOutCombobox();
			
			if(configuration.setDefaultPackingTypeGroupWise == 'true' && packingTypeGoods != undefined ){
				setDefaultPackingType(packingTypeGoods);
			}
		});
	} else if(configuration.allowPackingTypeAutocompleteWithCombobox == 'true') {
		$('#saidToContainSelect').remove();
		setPackingTypeAutoCompleters();
	}

	setVehicleNumberAutoComplete();
	
	if (configuration.showCategoryType == 'true')
		setCategoryType();

	if(configuration.ShowCityAndDestinationBranch == 'true')
		setDestinationBranchByCityAutocomplete();

	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		setIssueBankAutocomplete();
		setAccountNoAutocomplete();
	}
}

function showTBBPartyNameInConsignor() {
	if(configuration.showTBBPartyNameInConsignor == 'false')
		return;
	
	if(configuration.showTBBPartyNameInConsignor == 'true'){
		var headOfficeSubregionArr = (configuration.subRegionIdsForTbbPartyInConsignor).split(",");
		resetConsignor();
	}
	
	if((configuration.showTBBPartyNameInConsignor == 'true' && (isValueExistInArray(headOfficeSubregionArr, executive.subRegionId)
			|| isValueExistInArray(headOfficeSubregionArr, 0))) && $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT)	//(Head-office subRegionId)
		setCreditorPartyNameInConsignor();
	else
		setConsignorNameAutoComplete();
}

function setPartyOrCreditorIdInDDDVCase(WBVal) {
	let partyOrCreditorId	= $('#partyOrCreditorId').val();

	if(WBVal == WayBillType.WAYBILL_TYPE_CREDIT)
		$('#consignorCorpId').val(partyOrCreditorId);
	else
		$('#partyMasterId').val(partyOrCreditorId);
}

function setBillingPartyIdInDDDVCase(WBVal) {
	if(WBVal == WayBillType.WAYBILL_TYPE_CREDIT)
		$('#billingPartyId').val($('#billingPartyCreditorId').val());
}

function setCustData(obj,hiddenObj,partyMasterId) {
	let custObj		= document.getElementById(obj);
	let custObjVal	= custObj.value;
	
	if(custObjVal.indexOf("(") >= 0)
		custObj.value = custObjVal.substring(0,custObjVal.indexOf('('));
	
	document.getElementById(hiddenObj).value = partyMasterId;
}

function setDefaultParty(keys) {
	if (!jsondata.PartyMasterDetails)
		return;
	
	let partyMaster = jsondata.PartyMasterDetails;

	if(jQuery.isEmptyObject(partyMaster))
		return;
	
	if(configuration.DBWiseSelfPartyForBoth == 'true' || configuration.DBWiseSelfPartyForBoth == true) {
		if(configuration.AllowDBWiseSelfPartyInManualOnly == 'true' || configuration.AllowDBWiseSelfPartyInManualOnly == true) {
			if(isManualWayBill) {
				if(keys == 'F9' || keys == WayBillType.WAYBILL_TYPE_CREDIT) {
					$('#consignorCorpId').val(partyMaster.corporateAccountId);
					var billingParty = partyMaster.TBB;
					if(parseInt($('#billingPartyId').val()) <= 0 && (billingParty == true || billingParty == 'true')) {
						$('#billingPartyId').val(partyMaster.corporateAccountId);
						$('#billingPartyName').val(partyMaster.name);
						$('#billingPartyCreditorId').val(partyMaster.corporateAccountId);
					}
				} else
					$('#partyMasterId').val(partyMaster.corporateAccountId);

				$('#partyOrCreditorId').val(partyMaster.corporateAccountId);

				$('#consignorName').val(partyMaster.name);
				$('#consignorAddress').val(partyMaster.address);
				$('#consignorPin').val(partyMaster.pincode);
				$('#consignorContactPerson').val(partyMaster.contactPerson);
				$('#consignorDept').val(partyMaster.department);
				$('#consignorPhn').val(partyMaster.mobileNumber);
				$('#consignorFax').val(partyMaster.faxNumber);
				$('#consignorEmail').val(partyMaster.emailAddress);

				$('#consigneePartyMasterId').val(partyMaster.corporateAccountId);
				$('#consigneeName').val(partyMaster.name);
				$('#consigneeAddress').val(partyMaster.address);
				$('#consigneePin').val(partyMaster.pincode);
				$('#consigneeContactPerson').val(partyMaster.contactPerson);
				$('#consigneeDept').val(partyMaster.department);
				$('#consigneePhn').val(partyMaster.mobileNumber);
				$('#consigneeFax').val(partyMaster.faxNumber);
				$('#consigneeEmail').val(partyMaster.emailAddress);
			}
		} else {
			if(keys == 'F9' || keys == WayBillType.WAYBILL_TYPE_CREDIT) {
				$('#consignorCorpId').val(partyMaster.corporateAccountId);
				var billingParty = partyMaster.TBB;
				if(parseInt($('#billingPartyId').val()) <= 0 && (billingParty == true || billingParty == 'true')) {
					$('#billingPartyId').val(partyMaster.corporateAccountId);
					$('#billingPartyName').val(partyMaster.name);
					$('#billingPartyCreditorId').val(partyMaster.corporateAccountId);
				}
			} else
				$('#partyMasterId').val(partyMaster.corporateAccountId);

			$('#partyOrCreditorId').val(partyMaster.corporateAccountId);

			$('#consignorName').val(partyMaster.name);
			$('#consignorAddress').val(partyMaster.address);
			$('#consignorPin').val(partyMaster.pincode);
			$('#consignorContactPerson').val(partyMaster.contactPerson);
			$('#consignorDept').val(partyMaster.department);
			$('#consignorPhn').val(partyMaster.mobileNumber);
			$('#consignorFax').val(partyMaster.faxNumber);
			$('#consignorEmail').val(partyMaster.emailAddress);

			$('#consigneePartyMasterId').val(partyMaster.corporateAccountId);
			$('#consigneeName').val(partyMaster.name);
			$('#consigneeAddress').val(partyMaster.address);
			$('#consigneePin').val(partyMaster.pincode);
			$('#consigneeContactPerson').val(partyMaster.contactPerson);
			$('#consigneeDept').val(partyMaster.department);
			$('#consigneePhn').val(partyMaster.mobileNumber);
			$('#consigneeFax').val(partyMaster.faxNumber);
			$('#consigneeEmail').val(partyMaster.emailAddress);
		}
	} else if(configuration.DBWiseSelfPartyForConsignor == 'true' || configuration.DBWiseSelfPartyForConsignor == true) {
		if(configuration.AllowDBWiseSelfPartyInManualOnly == 'true' || configuration.AllowDBWiseSelfPartyInManualOnly == true) {
			if(isManualWayBill) {
				if(keys == 'F9' || keys == WayBillType.WAYBILL_TYPE_CREDIT) {
					$('#consignorCorpId').val(partyMaster.corporateAccountId);
					var billingParty = partyMaster.TBB;
					
					if(parseInt($('#billingPartyId').val()) <= 0 && (billingParty == true || billingParty == 'true')) {
						$('#billingPartyId').val(partyMaster.corporateAccountId);
						$('#billingPartyName').val(partyMaster.name);
						$('#billingPartyCreditorId').val(partyMaster.corporateAccountId);
					}
				} else
					$('#partyMasterId').val(partyMaster.corporateAccountId);

				$('#partyOrCreditorId').val(partyMaster.corporateAccountId);

				$('#consignorName').val(partyMaster.name);
				$('#consignorAddress').val(partyMaster.address);
				$('#consignorPin').val(partyMaster.pincode);
				$('#consignorContactPerson').val(partyMaster.contactPerson);
				$('#consignorDept').val(partyMaster.department);
				$('#consignorPhn').val(partyMaster.mobileNumber);
				$('#consignorFax').val(partyMaster.faxNumber);
				$('#consignorEmail').val(partyMaster.emailAddress);
			}
		} else {
			if(keys == 'F9' || keys == WayBillType.WAYBILL_TYPE_CREDIT) {
				$('#consignorCorpId').val(partyMaster.corporateAccountId);
				var billingParty = partyMaster.TBB;
				
				if(parseInt($('#billingPartyId').val()) <= 0 && (billingParty == true || billingParty == 'true')) {
					$('#billingPartyId').val(partyMaster.corporateAccountId);
					$('#billingPartyName').val(partyMaster.name);
					$('#billingPartyCreditorId').val(partyMaster.corporateAccountId);
				}
			} else
				$('#partyMasterId').val(partyMaster.corporateAccountId);

			$('#partyOrCreditorId').val(partyMaster.corporateAccountId);

			$('#consignorName').val(partyMaster.name);
			$('#consignorAddress').val(partyMaster.address);
			$('#consignorPin').val(partyMaster.pincode);
			$('#consignorContactPerson').val(partyMaster.contactPerson);
			$('#consignorDept').val(partyMaster.department);
			$('#consignorPhn').val(partyMaster.mobileNumber);
			$('#consignorFax').val(partyMaster.faxNumber);
			$('#consignorEmail').val(partyMaster.emailAddress);
		}
	} else if(configuration.DBWiseSelfPartyForConsignee == 'true' || configuration.DBWiseSelfPartyForConsignee == true) {
		if(configuration.AllowDBWiseSelfPartyInManualOnly == 'true' || configuration.AllowDBWiseSelfPartyInManualOnly == true) {
			if(isManualWayBill) {
				$('#consigneePartyMasterId').val(partyMaster.corporateAccountId);
				$('#consigneeName').val(partyMaster.name);
				$('#consigneeAddress').val(partyMaster.address);
				$('#consigneePin').val(partyMaster.pincode);
				$('#consigneeContactPerson').val(partyMaster.contactPerson);
				$('#consigneeDept').val(partyMaster.department);
				$('#consigneePhn').val(partyMaster.mobileNumber);
				$('#consigneeFax').val(partyMaster.faxNumber);
				$('#consigneeEmail').val(partyMaster.emailAddress);
			}
		} else {
			$('#consigneePartyMasterId').val(partyMaster.corporateAccountId);
			$('#consigneeName').val(partyMaster.name);
			$('#consigneeAddress').val(partyMaster.address);
			$('#consigneePin').val(partyMaster.pincode);
			$('#consigneeContactPerson').val(partyMaster.contactPerson);
			$('#consigneeDept').val(partyMaster.department);
			$('#consigneePhn').val(partyMaster.mobileNumber);
			$('#consigneeFax').val(partyMaster.faxNumber);
			$('#consigneeEmail').val(partyMaster.emailAddress);
		}
	}
}

function setWaybillType() {
	removeOption('WBTypeManual', null);

	if(showWayBillTypes != null && showWayBillTypes.length > 0) {
		for(var i = 0; i < showWayBillTypes.length; i++) {
			var wayBillTypeId = showWayBillTypes[i].wayBillTypeId;

			if(wayBillTypeId == ConfigParam.CONFIG_KEY_WAYBILLTYPE_PAID && isPaidBookingPermission)
				createOption('WBTypeManual', WayBillType.WAYBILL_TYPE_PAID, WayBillType.WAYBILL_TYPE_NAME_PAID);

			if(wayBillTypeId == ConfigParam.CONFIG_KEY_WAYBILLTYPE_TO_PAY && isTopayBookingPermission)
				createOption('WBTypeManual', WayBillType.WAYBILL_TYPE_TO_PAY, WayBillType.WAYBILL_TYPE_NAME_TOPAY);

			if(wayBillTypeId == ConfigParam.CONFIG_KEY_WAYBILLTYPE_FOC && isFocBookingPermission)
				createOption('WBTypeManual', WayBillType.WAYBILL_TYPE_FOC, WayBillType.WAYBILL_TYPE_NAME_FOC);

			if(wayBillTypeId == ConfigParam.CONFIG_KEY_WAYBILLTYPE_CREDITOR && isTbbBookingPermission)
				createOption('WBTypeManual', WayBillType.WAYBILL_TYPE_CREDIT, WayBillType.WAYBILL_TYPE_NAME_CREDITOR);
		}
	}

	$("#WBTypeManual").val(configuration.DefaultWayBillType);
}

function setNextPreviousForSaidToContain() {
	var qtyAmount			= null;

	if(document.getElementById('qtyAmount') != null)
		qtyAmount			= document.getElementById('qtyAmount');

	if(configuration.SetFocusOnAddButtonAfterAddingSaidToContain == 'true')
		next = 'add';
	else if(qtyAmount.disabled)
		next = 'add';
	else
		next = 'qtyAmount';
}

function clearNewForSting(obj) {
	if((obj.value).includes(stringNew)) {
		obj.value	= ((obj.value).replace(stringNew, '')).trim();
		
		if(obj.id == 'consignorName')
			setValueToTextField('partyMasterId', '0');
		else if(obj.id == 'consigneeName')	
			setValueToTextField('consigneePartyMasterId', '0')
	}
}

function clearNew(obj){
	obj.value = obj.value.substring(0, 10);
}

function setDateAutoComplete(obj){
	var d = new Date();
	var mnth = d.getMonth();
	var year = d.getFullYear();
	$("#"+obj.id).val(obj.value+"-"+(mnth+1)+"-"+year);
}

function setFocusOnQuantityAfterAddArticle(ele){
	var quantity	= $('#quantity').val();

	if(ele.id == 'add'){
		next = "quantity"; 
	} else if(ele.id == 'quantity') {
		if(quantity > 0){
			if ($('#packingTypeAutoCompleter').exists())
				next = "packingTypeAutoCompleter";
			else
				next = "typeofPacking";	
		}else if(noOfArticlesAdded > 0) {
			next = "actualWeight"; 		
			goToPosition('weightandamountpanel', 'slow');
		} else {
			if ($('#packingTypeAutoCompleter').exists())
				next = "packingTypeAutoCompleter";
			else
				next = "typeofPacking";	

			if(!validateInput(1, 'quantity', 'quantity', 'quantityError', quantityErrMsg))
				return false;
		}
	}
}

function setFocusOnQuantityAfterLBHHeight(ele) {
	if (!ArticleWeightWiseErrMsg && ele.id == 'add' && $('#tempWeight').val() > 0)
		next = 'STPaidBy';

	if(ele.id == 'height')
		next = 'quantity';
}

function setFocusOnPartialPayment(ele){
	if(ele.id == $("#charges tr:last input")[0].id)
		next = "partialPaymentType"; 
	else if(ele.id == 'partialPaymentType')
		next = "save"; 
	else if(ele.id == 'saveBtn')
		next = "save"; 
	else if(ele.id == 'paymentMode') {
		if($("#paymentMode").val() == 1)
			next = "saveBtn"; 
		else
			next = "partialChequeDate";
	} else if(ele.id == 'receivedAmtEle') {
		if($("#receivedAmtEle").val() == 0)
			next = "receivedAmtEle";
		else
			next = "paymentMode";
	}
}

function setNextOnBillSelection(ele) {
	if (configuration.showTransportationCategory == 'true')
		$('#transportationCategory').focus();
	else if (configuration.showTransportationMode == 'true')
		$('#transportationMode').focus();
	else if (configuration.BookingType == 'true') {
		if(isManualWayBill)
			next = "WBTypeManual";
		else
			next = "bookingType";
	} else
		next = "destination";
}

function setNonEditableGSTCharge() {
	if (configuration.nonEditableGSTChargeIfTBBBooking =='true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
		setReadOnly('charge' + GST_CHARGE, true);
		$('#charge' + GST_CHARGE).val(0);
	} else
		setReadOnly('charge' + GST_CHARGE, false);
}

function setNonEditableFreightCharge() {
	if(isTokenThroughLRBooking && $('#charge' + FREIGHT).val() <= 0 && isTokenWayBill && isFreightChargeEnable && Number($('#chargeType').val()) != 0 && Number($('#chargeType').val()) == CHARGETYPE_ID_QUANTITY)
		return;
	
	disableFreightCharge = disableFreightCharge || Object.keys(articleWiseFreightRate).length > 0;
	
	if(isManualWayBill) {
		if(configuration.nonEditableFreightChargeInManual == 'true' || disableFreightCharge)
			setReadOnly('charge' + FREIGHT, true);
	} else if(configuration.nonEditableFreightCharge == 'true' || disableFreightCharge)
		setReadOnly('charge' + FREIGHT, true);
}

function setNonEditableRiskCoverageCharge() {
	let wayBillType = $('#wayBillType').val();
	const checkbox = $('#declaredValueCheckBox');
	
	if(configuration.checkboxToApplyRiskCoverageOnDeclareValue == 'true')
		$('#declaredValueCheckBoxlbl').html('<b>Risk Coverage</b>');

	checkbox.prop("disabled", false);
	
	if(configuration.nonEditableRiskCoverageCharge == 'true' ) {
		if(wayBillType == WAYBILL_TYPE_CREDIT  && configuration.calculateRiskCoverageBasedOnPartyInTbb == 'false')
			return;
		
		let lrTypesArray	= (configuration.nonEditableRiskCoverageChargeOnLRType).split(',');
			
		if(isValueExistInArray(lrTypesArray, wayBillType)) {
			checkbox.prop("checked", true);
			checkbox.prop("disabled", true); 
			setReadOnly('charge'+ RISK_COVERAGE, true);
		} else if(!isValueExistInArray(lrTypesArray, wayBillType)) {
			if(!$('#declaredValueCheckBox').prop("checked")) {
				$('#charge' + RISK_COVERAGE).prop("readonly", true);
				$('#charge' + RISK_COVERAGE).val(0);
			} else {
				$('#charge' + RISK_COVERAGE).prop("readonly", false);
				calculateRiskCoverageOnDeclaredValue();
			}
		}
	}
	calcTotal();
}

function setNonEditableDocCharge() {
	let wayBillType				= $('#wayBillType').val();
	
	setReadOnly('charge' + DOC_CHARGE, 	configuration.nonEditableDocChargeInPaid == 'true' && wayBillType == WAYBILL_TYPE_PAID
			|| configuration.nonEditableDocChargeInTopay == 'true' && wayBillType == WAYBILL_TYPE_TO_PAY);
}

function enableDisableExpressServiceCharge() {
	if(configuration.ServiceType == 'false')
		return true;

	var serviceTypeId = $('#serviceType').val();
	
	if(serviceTypeId == ServiceTypeConstant.SERVICE_TYPE_NORMAL_ID) {
		$('#charge' + BookingChargeConstant.EXPRESS_CHARGE).val(0);
		setReadOnly('charge' + BookingChargeConstant.EXPRESS_CHARGE, true);
	} else if(serviceTypeId == ServiceTypeConstant.SERVICE_TYPE_EXPRESS_ID)
		setReadOnly('charge' + BookingChargeConstant.EXPRESS_CHARGE, false);
}

function setReverseEntry() {
	var manualEntryType  = document.getElementById('manualEntryType');
	
	if(manualEntryType) {
		if(manualEntryType.value == TransportCommonMaster.MANUAL_REVERSE_ENTRY) {
			isReverseEntry = true;
			setDestinationAutocompleterForReverseEntry();
			setSourceAutocompleterForReverseEntry();
			bindFocusOnSourceForReverseEntry();
			destinationValidationForReverseEntry();
			setDefaultDateOnManual();
		} else {
			isReverseEntry = false;
			resetSourceBranch();
			resetDestination();
			resetSubRegion();
			setSourceAutocompleter();
			setLoggedBranchInSourceBranch();
			setDestinationAutocompleter();
			setDefaultDateOnManual();
		}
	}
}

function bindFocusOnSourceForReverseEntry(){
	$("#destination").focus(function () {
		if($('#sourceBranchId').val() <= 0)
			next = "sourceBranch"; 
	});	
	
	$("#destination").keypress(function () {
		if($('#sourceBranchId').val() <= 0)
			next = "sourceBranch"; 
	});
}

function setLoggedBranchInSourceBranch() {
	
	if(configuration.DefaultLoggedBranchInSourceBranch == 'true') {
		setValueToTextField('sourceBranchId', executive.branchId);
		setValueToTextField('sourceBranch', loggedInBranch.name);
	}
}

function setLoggedBranchInDestinationBranch() {
	if(configuration.DefaultLoggedBranchInDestinationBranch == 'true') {
		setValueToTextField('destinationBranchId', executive.branchId);
		setValueToTextField('destinationCityId', executive.cityId);
		setValueToTextField('destinationStateId', executive.stateId);
		
		destBranchAccountGroupId = executive.accountGroupId;
		
		if(configuration.ShowAccountGroupInBranchAutoCompleteOnBookingPage == 'true' || configuration.ShowAccountGroupInBranchAutoCompleteOnBookingPage == true)
			setValueToTextField('destination', loggedInBranch.name+' ( '+loggedInExecutiveSubregion.name+' )'+' ( '+accountGroup.accountGroupCode+' )');
		else
			setValueToTextField('destination', loggedInBranch.name);

		if(configuration.partyPanelType == '2') {		
			if(configuration.ConsigneePhnAutocomplete == 'true')
				setSourceToAutoComplete('consigneePhn', "Ajax.do?pageId=9&eventId=18&isNumberAutocomplete=true&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+executive.branchId+"&responseFilter="+configuration.BookingConsigneePhnAutocompleteResponse);
		} else if (configuration.ConsigneeNameAutocomplete == 'true')
			setSourceToAutoComplete('consigneeName', "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+executive.branchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName);
	}
}

function setCommodityType() {
	operationOnSelectTag('commodityType', 'removeAll', null, null);

	var commodities = jsondata.commodities;

	operationOnSelectTag('commodityType', 'addNew', 'Commodity Type', 0);

	if(!jQuery.isEmptyObject(commodities)) {
		for(const element of commodities) {
			if(!element.markForDelete)
				operationOnSelectTag('commodityType', 'addNew', element.name, element.commodityId);
		}
	}
	
	sortDropDownList('commodityType');
}

function setServiceTaxPaidBy() {
	var panNumber	  = getValueFromInputField('panNumber');

	if(panNumber != null && panNumber != '' && panNumber.length > 4) {
		if(((panNumber)[3]).toUpperCase()  == 'P') {
			isServicetaxSet = true;
			setValueToTextField('STPaidBy', TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID);
		} else
			isServicetaxSet = false;
	}
}

function setPanNumber() {
	if(configuration.SetPanNumberOnSTPaidBy == 'false')
		return;

	isServicetaxSet		= false;

	var wayBillType 	= getValueFromInputField('wayBillType');
	var STPaidBy 		= getValueFromInputField('STPaidBy');
	var panNumber		= getValueFromInputField('panNumber');

	if(!isServicetaxSet && panNumber == '') {
		if (wayBillType == WayBillType.WAYBILL_TYPE_CREDIT)
			setValueToTextField('panNumber', getValueFromInputField('billingPartyPanNumber'));
		else if(STPaidBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID)
			setValueToTextField('panNumber', getValueFromInputField('consignorPanNumber'));
		else if(STPaidBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID)
			setValueToTextField('panNumber', getValueFromInputField('consigneePanNumber'));
		else if(STPaidBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID) {
			if (wayBillType == WayBillType.WAYBILL_TYPE_PAID)
				setValueToTextField('panNumber', getValueFromInputField('consignorPanNumber'));
			else if (wayBillType == WayBillType.WAYBILL_TYPE_TO_PAY)
				setValueToTextField('panNumber', getValueFromInputField('consigneePanNumber'));
		}

		setServiceTaxPaidBy();
	}

	if(isServicetaxSet && (STPaidBy != TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID)) {
		showMessage('error', stPaidByTransporterErrMsg);
		return false;
	}
}

function setNextForChargeType() {
	/*var bookingType		= $('#bookingType').val();
	var chargeType		= $('#chargeType').val();

	if(bookingType == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID || chargeType == ChargeTypeConstant.CHARGETYPE_ID_FIX) {
		next			= 'qtyAmount';
	} else {
		next			= 'charge' + BookingChargeConstant.FREIGHT;
	}*/
}

function setFocusOnQtyAmount() {
	var bookingType		= $('#bookingType').val();

	if(bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID)
		next			= 'destination';
	else
		next			= 'charge' + FREIGHT;

	prev	= 'chargeType';
}

function setFocusOnChequeNo(ele){
	if(configuration.setFocusOnBuiltyChargeifpaymentTypeCheque == 'true') {
		var selectedPayMentType	= $('#paymentType').val();

		if(selectedPayMentType == PAYMENT_TYPE_CHEQUE_ID)
			next = 'chequeNo';
		else
			next = 'charge' + BUILTY_CHARGE;
	}
}

function validateServiceCharge() {
	var freight		  = document.getElementById("charge" + FREIGHT).value;
	var serviceCharge = document.getElementById("charge" + SERVICE_CHARGE).value;

	var serAmt 		= (Number(freight) * 15) / 100;

	if(serviceCharge < serAmt)
		showMessage('error', "Service Charge Can not be less than "+serAmt+" Rs/-");
}

function setDeclredValue() {
	if((configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true')
		&& configuration.setDefaultDeclaredValue == 'true'
		&& ($('#declaredValue').val() == '' || $('#declaredValue').val() == 0))
			$('#declaredValue').val(configuration.DefaultDeclaredValue);


	if (configuration.showCheckBoxToCalulateValuationChrgOnDeclareValue == 'true' ||configuration.checkboxToApplyRiskCoverageOnDeclareValue == 'true')
		$('#declaredValueCheckBox').prop('checked');
		
	if((configuration.ApplyRatesOnDeclaredValue == 'true') && configuration.EditableQtyAmountOnOtherChargeType != 'true')
	applyRates();
}

function setDefaultDestinationBranch() {
	if(configuration.isDefaultDestinationNeeded == 'true') {
		if(destinationBranch != undefined && destinationBranchIds != undefined) { // destinationBranch and destinationBranchIds globally defined
			var destData = (destinationBranchIds).split("_");
			$('#destination').val(destinationBranch);
			getRates(parseInt(destData[0]), $('#partyMasterId').val());
			resetArticleWithTable();
			if(typeof getChargesConfigRates != 'undefined') getChargesConfigRates(0);
			getDestination(destinationBranchIds, destinationBranch);
			setCompanyWiseTaxes(0);
		
			if(configuration.SourceDestinationWiseWayBillNumberGeneratorAllow == 'true') {
				if(!isManualWayBill) {
					if(configuration.TokenWiseAutoLrSequence == 'true' && !isAutoSequenceCounter)
						getTokenWiseLrSequence(parseInt(destData[0], "")); //calling from lrSequenceCounter.js
					else
						checkSourceDestinationWiseSequence(parseInt(destData[0])); //Calling from lrSequenceCounter.js
				}
			}

			if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true')
				checkWayBillTypeAndDestinationBranchWiseBooking();

			destBranchAccountGroupId = parseInt(destData[4]);
		}
	}
}

function resetLBH() {
	$('#length').val(0);
	$('#breadth').val(0);
	$('#height').val(0);
	$('#lbhTotal').val(0);
	$('#tempWeight').val(0);
	$('#actualWeight').val(0);
	$('#chargedWeight').val(0);
	$('#articleLength').val(0);
	$('#articleBredth').val(0);
	$('#articleHeight').val(0);
	$('#artActWeight').val(0);
	$('#artChargeWeight').val(0);
	switchHtmlTagClass('LBH', 'hide', 'show');
	$('#volumetricDiv').addClass('hide');
	$('#volumetric').attr('checked', (configuration.showVolumetricAllChargetype == true || configuration.showVolumetricAllChargetype == 'true'));
}

function resetCUBIC() {
	$('#CBMValue').val(0);
	$('#CBMRate').val(0);
	switchHtmlTagClass('CUBIC', 'show', 'hide');
	$('#CUBIC').removeClass('show');
	$('#CUBIC').css('display','none');
}
function bindEventOnDeclaredValue() {
	if(configuration.showDeclaredValueLabel == "true")
		$("#DeclaredValueLable").removeClass('hide');
			
	setDeclredValue();
	
	$("#declaredValue").blur(function (event) {
		hideInfo();
		if(typeof applyExtraCharges != 'undefined') applyExtraCharges();
		clearIfNotNumeric(this,'0');
		selectFormValidation();
		setDeclredValue();
		calculateCustomChargesOnDeclaredValue();
		declaredValueValidations(event);
		selectEwaybillByStateValidation();
		if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
		minimumDeclaredValueValidation();
		showEwayBillNumberWarningMsg();
		declaredValueValidationForEwayBill();
		validateFOVOnDeclareVal();
			
		if(configuration.ApplyRatesOnDeclaredValue == 'true')
			applyRates();

		if (configuration.selectEWayBillONDeclaredValue == 'true')
			selectEWayBillOnDeclaredValue();
			
		if (configuration.selectEWayBillONDeclaredValueWithBill == 'true')
			showEwayBillNumberWarningMsgNew();
		
		if(isInsuranceServiceAllow)
			setInvoiceDetailsForInsurance();
		if(typeof setNonEditableRiskCoverageCharge != 'undefined') setNonEditableRiskCoverageCharge();
	});
								
	$("#declaredValue").keyup(function (event) {
		calculateCustomChargesOnDeclaredValue();
		if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
		if(getKeyCode(event) == 13 || getKeyCode(event) == 9){			
			setNextPrevAfterDeclaredValue();
			setFocusOnGodownAfterDeclareValue();
			setFocusOnRemarkAfterDeclareValue();
			setFocusOnChargesAfterDeclaredValue();
		}

		bindFocusOnStPaidBy(this.value);
	});
								
	$("#declaredValue").keydown(function (event) {
		hideAllMessages();
		removeError('declaredValue');
		validateDeclaredValueInput(event);
		declaredValueValidations(event);
		validateEWayBillNumberOnDeclareValue(event);
		if(getKeyCode(event) == 13){validateInvoiceOnDeclaredValue()}
	});
								
	$("#declaredValue").keypress(function (event) {
		if(getKeyCode(event) == 17){return false;}
		else if(!allowDecimalCharacterOnly(event)) {return false;}
		else {validateEWayBillNumberOnDeclareValue(event);}
	});
	
	$("#declaredValue").change(function() {
		if(typeof calculateValuationCharge != 'undefined') calculateValuationCharge();
		if(typeof setRatesOnDeclaredValue != 'undefined') setRatesOnDeclaredValue();
		showHideInsuranceRateFeild();
	});
}

function selectEWayBillOnDeclaredValue() {
	var declaredValue	= $('#declaredValue').val();
	
	if(configuration.selectEWayBillONDeclaredValue == 'true' && configuration.selectHSNCodeOnDeclaredValue == 'false' && Number(declaredValue) > Number(configuration.declaredValueForSelectEwayBill)){
		$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
		showEWaybillNumberFormType();
	} else if(configuration.selectEWayBillONDeclaredValue == 'true' || configuration.selectHSNCodeOnDeclaredValue == 'true'){
		if(configuration.selectHSNCodeOnDeclaredValue == 'true' && $('#singleFormTypes').val() == FormTypeConstant.HSN_CODE) {
			$('#singleFormTypes').val(FormTypeConstant.HSN_CODE);
			showHSNCodeFormType(FormTypeConstant.HSN_CODE);
		} else if(configuration.selectEWayBillONDeclaredValue == 'true' && $('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID) {
			$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
			showEWaybillNumberFormType(FormTypeConstant.E_WAYBILL_ID);
		}
	} else {
		$('#singleFormTypes').val(configuration.DefaultFormType);

		if(configuration.DefaultFormType != FormTypeConstant.E_WAYBILL_ID)
			hideEWaybillNumberFormType();
	}
}

function setDefaultSaidToContain(consignmentGoods){
	$('#saidToContain').val(consignmentGoods.name);
	$("#consignmentGoodsId").val(consignmentGoods.consignmentGoodsId);
	isConsignmentExempted			= consignmentGoods.exempted;
	isConsignmentEWayBillExempted	= consignmentGoods.eWayBillExempted;
}

function setDefaultPackingType(packingTypeGoods){
	$('#packingTypeAutoCompleter').val(packingTypeGoods.name);
	$("#typeofPackingId").val(packingTypeGoods.packingTypeMasterId);
	$("#typeofPacking").val(packingTypeGoods.name);
}

function setNextPrevAfterConsigneeGstn() {
	if(configuration.isCustomNavigationAllowedAfterConsigneeGstn != 'true')
		return true;

	if(configuration.Pincode == 'true') {
		next = "consigneePin";
		prev = "consigneeGstn";
	} else if(configuration.consigneeAddress == 'true' && configuration.setFocusOnConsigneeAddressAfterGst=='true') {
		next = "consigneeAddress";
		prev = "consigneeGstn";
		
	} else {
		next = "quantity";
		prev = "chargeType";
	}
}

function setPaymentType(elementId) {
	$('#' + elementId).find('option').remove().end();

	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		let topayPaymentTypeArr = paymentTypeArr.filter(function(obj) {
			return obj.paymentTypeId != PAYMENT_TYPE_CREDIT_ID && obj.paymentTypeId != PAYMENT_TYPE_BILL_CREDIT_ID;
		});
		
		if(configuration.isAllowPaymentTypeInToPay == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
			creatOptionForPaymentType(topayPaymentTypeArr, elementId);
		else
			creatOptionForPaymentType(paymentTypeArr, elementId);
	 }

	 defaultPaymentType	= getDefaultPaymentMode();
	
	if(defaultPaymentType > 0)
		$('#' + elementId).val(defaultPaymentType);
}

function creatOptionForPaymentType(paymentTypeArr, elementId) {
	$('#' + elementId).empty();
	
	if (crossingAgentId > 0) {
		$('#' + elementId).append('<option value="' + PAYMENT_TYPE_CROSSING_CREDIT_ID + '" selected="selected">' + PAYMENT_TYPE_CROSSING_CREDIT_NAME + '</option>');
		$('#' + elementId).val(PAYMENT_TYPE_CROSSING_CREDIT_ID);
		$('#' + elementId).closest('td, div').hide();
		hideAndResetTDS();
		return;
	}

	$('#' + elementId).show();
	
	if(configuration.addSelectOptionInPaymentType == 'true')
		$('#' + elementId).append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');
	
	for(var i = 0; i < paymentTypeArr.length; i++) {
		if(paymentTypeArr[i] != null) {
			$('#' + elementId).append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
		}
	}
}

function hideShowBankPaymentNew(obj){
	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		if( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
				&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true')) {
				if( Number($('#partyMasterId').val()) > 0)
					var corporateId			= $('#partyMasterId').val();
				else
					var corporateId			= $('#consignorCorpId').val();

				accountGroupId		= executive.accountGroupId;
				corporateAccountId	= corporateId;
				type				= ModuleIdentifierConstant.BOOKING;
				branchId			= executive.branchId;

				chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
				setTimeout(function () {
					var size = checkObjectSize(chequeBounceDetails);

					if(size > 0){
						if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0) {
							if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
								getBankPayment(obj)
								isAllowChequePayment	= 1;
							} else
								setChequeBounceDetails(chequeBounceDetails);
						} else
							setChequeBounceDetails(chequeBounceDetails);
					} else {
						hideShowBankPaymentTypeOptions(obj);

						$(document).keypress(function(e) { 
							if (e.keyCode == 27) 
								hideBTModel();
						});

						if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
							switchHtmlTagClass('tableSearchCollectionPerson', 'show', 'hide');
						} else {
							if(configuration.paidPartialPaymentOnBooking == 'true') {
								resetPartialPaymentDetails();
								resetPartialChequePaymentDetails();
								switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
								switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
								switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
							}
							
							switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
							resetTableSearchCollectionPerson();
						}
					}
				},500);
		} else {
			hideShowBankPaymentTypeOptions(obj);
			setTimeout(function() { 
				getAccountNumberForGroup();
			}, 200);
			
			$(document).keypress(function(e) { 
				if (e.keyCode == 27)
					hideBTModel();
			});
			
			if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
				switchHtmlTagClass('tableSearchCollectionPerson', 'show', 'hide');
			} else {
				if(configuration.paidPartialPaymentOnBooking == 'true') {
					resetPartialPaymentDetails();
					resetPartialChequePaymentDetails();
					switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
					switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
					switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
				}
				
				switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
				resetTableSearchCollectionPerson();
			}
		}
	}	
}

function getBankPayment(obj){
	hideShowBankPaymentTypeOptions(obj);
	
	$(document).keypress(function(e) { 
		if (e.keyCode == 27)
			hideBTModel();
	});
	
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
		switchHtmlTagClass('tableSearchCollectionPerson', 'show', 'hide');
	} else {
		if(configuration.paidPartialPaymentOnBooking == 'true') {
			resetPartialPaymentDetails();
			resetPartialChequePaymentDetails();
			switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
			switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
			switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		}
		
		switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
		resetTableSearchCollectionPerson();
	}
}

function hideShowPaymentTypeOptions(obj) {
	if(!setCashPaymentType())
		return;
	
	if(obj.value == PAYMENT_TYPE_CREDIT_ID || obj.value == PAYMENT_TYPE_CROSSING_CREDIT_ID)
		hideAndResetTDS();
	else
		$('#isTdsRequired').show();
	
	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		$('#storedPaymentDetails').empty();
		
		if(executive.countryId == NIGERIA)
			hideShowBankPaymentNew(obj);
		
		return;
	}

	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
		if( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
				&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true')){
				if( Number($('#partyMasterId').val()) > 0)
					var corporateId			= $('#partyMasterId').val();
				else
					var corporateId			= $('#consignorCorpId').val();
				
				accountGroupId		= executive.accountGroupId;
				corporateAccountId	= corporateId;
				type				= ModuleIdentifierConstant.BOOKING;
				branchId			= executive.branchId;
				
				chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
				
				setTimeout(function () {
					var size = checkObjectSize(chequeBounceDetails);
					
					if(size > 0) {
						if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0) {
							if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0) {
								switchHtmlTagClass('chequeDetails', 'show', 'hide');
								isAllowChequePayment	= 1;
							} else
								setChequeBounceDetails(chequeBounceDetails);
						} else
							setChequeBounceDetails(chequeBounceDetails);
					} else
						switchHtmlTagClass('chequeDetails', 'show', 'hide');
				},500);
		} else
			switchHtmlTagClass('chequeDetails', 'show', 'hide');
	} else {
		switchHtmlTagClass('chequeDetails', 'hide', 'show');
		resetChequeDetail();
	}
	
	//to reset credit payment fields - Ravi Prajapati
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
		switchHtmlTagClass('creditCardDetails', 'show', 'hide');
	} else {
		switchHtmlTagClass('creditCardDetails', 'hide', 'show');
		resetCreditDebitCardDetail();
	}

//	to reset paytm payment field - Ravi Parjapati
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID) {
		switchHtmlTagClass('paytmDetails', 'show', 'hide');
	} else {
		switchHtmlTagClass('paytmDetails', 'hide', 'show');
		resetPaytmDetail();
	}

	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
		switchHtmlTagClass('tableSearchCollectionPerson', 'show', 'hide');
		hideAndResetTDS();
	} else {
		if(configuration.paidPartialPaymentOnBooking == 'true'){
			resetPartialPaymentDetails();
			resetPartialChequePaymentDetails();
			switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
			switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
			switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		}
		
		switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
		resetTableSearchCollectionPerson();
		$('#isTdsRequired').show();
	}
}

function resetPaymentDetails() {
	$('#chequeDate').val(date(new Date(),"-"));
	$('#paymentType').val(0);
	$('#chequeNo').val("");
	$('#chequeAmount').val("0");
	$('#bankName').val("");
	$('#paytmTransactionNo').val("");
	$('#cardNo').val("");
	$('#creditBankName').val('');
	$('#bankName_primary_key').val(0);
	$('#impsNumber').val('');
	$('#referenceNumber').val('');
	$('#payerName').val('');
	$('#mobileNumber').val('');
	$('#accountNo').val('');
	$('#accountNo_primary_key').val(0);
	$('#upiId').val('');
	$('#paymentCheckBox').val('');
	
	defaultPaymentType	= getDefaultPaymentMode();
	
	if(defaultPaymentType > 0)
		$('#paymentType').val(defaultPaymentType);
}

function resetChequeDetail() {
	$('#chequeDate').val(date(new Date(),"-"));
	$('#chequeNo').val("");
	$('#chequeAmount').val("0");
	$('#bankName').val("");
}

function resetPaytmDetail(){
	$('#paytmTransactionNo').val("");
}

function resetTableSearchCollectionPerson() {
	$("#searchCollectionPerson").val('');
	$("#selectedCollectionPersonId").val(0);
}

function resetCreditDebitCardDetail(){
	$('#cardNo').val("");
	$('#creditBankName').val('');
}

function hidePaymentTypeandDetails() {
	switchHtmlTagClass('paymentTypeDiv', 'hide', 'show');
	switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
	switchHtmlTagClass('chequeDetails', 'hide', 'show');
	switchHtmlTagClass('paytmDetails', 'hide', 'show');
	resetPaymentDetails();
}

function setPartyWiseInvoiceNumber(){
	if(configuration.partyWiseInvoiceNumberGenerationAllowed == 'false')
		return;
	
	var partyCode = $('#consignorPartyCode').val();
	
	if(partyCode != undefined && partyCode != '')
		setValueToTextField('invoiceNo', partyCode + '/');
}

function setDefaultPodRequired(wayBillTypeId){
	let wayBillType 	= $('#wayBillType').val();
	
	if(podConfiguration.isDefaultPodRequiredAtBooking) {
		let waybillTypeArr	= podConfiguration.DefaultPODRequiredYesOnWayBillTypeAtBooking.split(",");
		let subregionIdsArr = podConfiguration.subRegionIDSToDisablePOD.split(",");

		if(isValueExistInArray(waybillTypeArr, wayBillType) || (podConfiguration.disablePODRequiredBySubRegionIDWise && isValueExistInArray(subregionIdsArr, executive.subRegionId)))
			if(podConfiguration.handlePodVisibility == true || podConfiguration.handlePodVisibility == 'true')
				$('#podRequiredStatus').val(PODRequiredConstant.POD_REQUIRED_YES_ID).prop('disabled', true);
			else	
				$('#podRequiredStatus').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
		else
			$('#podRequiredStatus').val(podConfiguration.defaultPodRequiredIdAtBooking);
	}
}

function handlePodVisibility() {
	
	if ($('#bookingType').val() == BOOKING_TYPE_FTL_ID || $('#deliveryTo').val() == DELIVERY_TO_DOOR_ID || $('#wayBillType').val() == WAYBILL_TYPE_CREDIT
	|| $('#deliveryTo').val() == DELIVERY_TO_TRUCK_DELIVERY_ID || $('#deliveryTo').val() == DELIVERY_TO_DD_WITH_HAMALI_ID) {
	    $('#podRequiredStatus')
	        .val(PODRequiredConstant.POD_REQUIRED_YES_ID)
	        .prop('disabled', true);
	}else {
	    $('#podRequiredStatus')
			.val(PODRequiredConstant.POD_REQUIRED_NO_ID)
			.prop('disabled', false);
	}
}

function checkLRTypeExistForPackingRateList() {
	let wayBillType 	= $('#wayBillType').val();
	let waybillTypeIds 	= (configuration.wayBillTypeIdsForPartyWiseArticleSelectionList).split(",");
	
	return configuration.partyWiseArticleSelectionList == 'true' && isValueExistInArray(waybillTypeIds, wayBillType);
}

function checkPartyWisePackingRateList() {
	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY
		&& checkLRTypeExistForPackingRateList())
		return packingTypeList != null && packingTypeList.length > 0;
	
	return false;
}

function reCreatePackingTypeList() {
	if(checkLRTypeExistForPackingRateList()) {
		$('#typeofPackingCol').empty();
		
		if(checkPartyWisePackingRateList()) {
			$('#typeofPackingCol').append(createTypeofPackingSelection(packingTypeList));
			
			//open dropdown
			if(configuration.showOpenTypeOfPackingDropDown == true || configuration.showOpenTypeOfPackingDropDown == "true")
				$("#typeofPacking").attr('size', $('#typeofPacking> option').length);
		} else {
			$('#typeofPackingCol').append(createPackingTypeFeild());
			setPackingTypeAutoCompleterWithOutCombobox();

			$('#saidToContainSelect').addClass('hide');
			$('#saidToContain').removeClass('hide');
			setSaidToContainAutoComplete();

			if(typeof obj !== 'undefined' && obj.id == 'typeofPacking') {
				next 	= 'saidToContain';
				prev	= 'quantity';
			}
		}
	}
}

function createTypeofPackingSelection(packingTypeList) {
	var typeofPackingSelection = $('<select id="typeofPacking" name="typeofPacking" class="width-135px" onchange="findifNewRate();getPackingTypeRates();hideAllMessages();createSaidToContainList(this);" onkeyup="if(getKeyCode(event) != 13 && getKeyCode(event) != 27) { getPackingTypeRates(); }" onkeydown="validateTypeOfPackingInput(event);createSaidToContainList(this);" onblur="hideInfo();return validatePackingGroupChecking();createSaidToContainList(this);"/>');
	typeofPackingSelection.append($("<option>").attr('value', 0).text('Select Packing Type'));

	$(packingTypeList).each(function() {
		typeofPackingSelection.append($("<option>").attr('value', this.packingTypeId).text(this.packingTypeName));
	});

	return typeofPackingSelection;
}

function createSaidToContainSelection(goodsList) {
	$('#saidToContainSelect').append($("<option>").attr('value', 0).text('Select SaidToContain'));

	$(goodsList).each(function() {
		let consignmentGoodsId	= this.consignmentGoodsId;
		
		$('#saidToContainSelect').append($("<option>").attr('value', consignmentGoodsId).text(this.consignmentGoodsName));
		
		if(consignmentGoodsListForParty != undefined && consignmentGoodsListForParty.length > 0) {
			$(consignmentGoodsListForParty).each(function() {
				if(consignmentGoodsId != this.consignmentGoodsId)
					$('#saidToContainSelect').append($("<option>").attr('value', this.consignmentGoodsId).text(this.name));
			});
		}
	});
}

function createSaidToContainFeild() {
	var saidToContainFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'saidToContain', 
		class		: 'width-100px ui-autocomplete-input', 
		name		: 'saidToContain', 
		value 		: '',
		style		: 'text-transform: uppercase;',
		maxlength	: 50,
		placeholder	: 'Contains',
		onfocus		: 'showInfo(this,"Said to Contain");showTooltipForPackingType()',
		onblur 		: "hideInfo();checkForNewSaidToContain(this);checkPackingTypeRateWithSaidToContain(this);",
		onkeydown	: "hideAllMessages(); removeError('saidToContain');if(getKeyCode(event) == 8 || getKeyCode(event) == 46) {document.getElementById('consignmentGoodsId').value=0;};validateSaidToContainInput(event);showTooltipForPackingType()",
		onkeypress 	: "return allowAlphaNumericAndSpecialCharacters(event); checkPackingTypeRateWithSaidToContain(this); return validateChars(event);if(getKeyCode(event) == 17){return false;}",
		onkeyup 	: "if(getKeyCode(event) == 8 || getKeyCode(event) == 46) {document.getElementById('consignmentGoodsId').value=0;}"});

	return saidToContainFeild;
}

function createSaidToContainList(obj) {
	$('#typeofPackingId').val(obj.value);

	var wayBillType 	= $('#wayBillType').val();
	var waybillTypeIds 	= (configuration.wayBillTypeIdsForPartyWiseArticleSelectionList).split(",");

	if(configuration.partyWiseArticleSelectionList == 'true' && isValueExistInArray(waybillTypeIds, wayBillType)
		&& $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		var packingTypeId	= obj.value;
		var goodsList		= null;

		$('#typeofPackingId').val(packingTypeId);

		if(consignmentGoodsListHM != undefined)
			goodsList		= consignmentGoodsListHM[packingTypeId];

		$('#saidToContainSelect').empty();

		if(goodsList != undefined && goodsList.length > 0 && goodsList[0].consignmentGoodsId > 0) {
			$('#saidToContainSelect').removeClass('hide');
			$('#saidToContain').addClass('hide');
			createSaidToContainSelection(goodsList)

			//open dropdown
			if(configuration.showOpenSaidToContainedDropDown == true || configuration.showOpenSaidToContainedDropDown == "true")
				$("#saidToContainSelect").attr('size', $('#saidToContainSelect> option').length);

			if(obj.id == 'typeofPacking') {
				next 	= 'saidToContainSelect';
				prev	= 'quantity';
			}
		} else { 
			$('#saidToContainSelect').addClass('hide');
			$('#saidToContain').removeClass('hide');
			
			setSaidToContainAutoComplete();
			
			if(obj.id == 'typeofPacking') {
				next 	= 'saidToContain';
				prev	= 'quantity';
			}
		}
	}
}

function setSelectedConsignmentGoods(obj) {
	$("#consignmentGoodsId").val(obj.value);
}

function resetConsignementGoods() {
	$('#typeofPackingCol').empty();
	$('#saidToContainSelect').empty();
	$('#saidToContainSelect').addClass('hide');
	$('#saidToContain').removeClass('hide');

	$('#typeofPackingCol').append(createPackingTypeFeild());
	setPackingTypeAutoCompleterWithOutCombobox();
	setSaidToContainAutoComplete();
}

function createPackingTypeFeild() {
	var packingTypeFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'typeofPacking', 
		class		: 'width-135px', 
		name		: 'typeofPacking', 
		value 		: '',
		style		: 'text-transform: uppercase;',
		maxlength	: 50,
		placeholder	: 'Packing Type',
		onfocus		: 'showInfo(this,"Articles Type");showTooltipForPackingType()',
		onblur 		: "hideInfo();return validatePackingGroupChecking();bindFocusOnPackingType(this);getPackingTypeRates();",
		onkeydown	: "validateTypeOfPackingInput(event);showTooltipForPackingType()",
		onkeypress 	: "findifNewRate();getPackingTypeRates();hideAllMessages();removeError('typeofPacking');bindFocusOnPackingType(this);",
		onkeyup 	: "if(getKeyCode(event) != 13 && getKeyCode(event) != 27) { getPackingTypeRates();}"});

	return packingTypeFeild;
}

function bindFocusOnPackingType(obj) {
	if(obj.id == 'typeofPacking') {
		next 	= 'saidToContain';
		prev	= 'quantity';
	}
}

function calculateServiceChargeOnPassengerOnChange(){
	if(configuration.calculateServiceChargeOnPassengerOnChange == 'false')
		return true;

	if(configuration.DeliveryToPassenger == 'true' && $('#deliveryTo').val() == InfoForDeliveryConstant.DELIVERY_TO_PASSENGER_ID)
		$('#charge' + BookingChargeConstant.SERVICE_CHARGE).val('0');
	else
		applyRates();
}

function calculateDoorDlyChargeOnFreightOnChangeDeliveryToDoor() {
	if(configuration.calculateDoorDlyChargeOnFreightOnChangeDeliveryToDoor == 'false')
		return;
		
	let wayBillType = $('#wayBillType').val();
	
	if($('#deliveryTo').val() == DELIVERY_TO_DOOR_ID && (wayBillType == WAYBILL_TYPE_PAID|| wayBillType == WAYBILL_TYPE_TO_PAY)) {
		applyRates();		
	} else {
		$('#charge' + DOOR_DLY_BOOKING).val('0');
		setReadOnly('charge' + DOOR_DLY_BOOKING, false);
	}
}

function setFocusOnPaymentType() {
	let wayBillType = $('#wayBillType').val();
	
	if(configuration.setShortCreditPaymentTypeForPaidLr =='true' && wayBillType ==  WayBillType.WAYBILL_TYPE_PAID)
		$('select option:contains('+PaymentTypeConstant.PAYMENT_TYPE_CREDIT_NAME+')').prop('selected', true);
}

function setTransportationMode() {
	removeOption('transportationMode', null);
		
	let transportModeList = jsondata.transportModeList;

	if(configuration.validateTransportationMode == 'true')
		createOption('transportationMode', 0, '--Select--');

	for(const element of transportModeList) {
		createOption('transportationMode', element.transportModeId, element.transportModeName);
	}
		
	setDefaultTransportationMode();
}

function setDefaultTransportationMode() {
	if(Number(configuration.defaultTransportationModeId) > 0) {
		$('#transportationMode').val(configuration.defaultTransportationModeId);
		
		changeHsnCodeOnTransportMode();
	}
}

function removePassenger() {
	for(const element of deliveryToArray) {
		if(parseInt(element.deliveryAtId) == DELIVERY_TO_PASSENGER_ID)
			removeOptionValFromList('deliveryTo', DELIVERY_TO_PASSENGER_ID);
	}
}

function removeDoorDelivery() {
	if(configuration.removeDoorDeliveryOptionExceptForPaidLr == 'true') {
		for(const element of deliveryToArray) {
			if(parseInt(element.deliveryAtId) == DELIVERY_TO_DOOR_ID)
				removeOptionValFromList('deliveryTo', DELIVERY_TO_DOOR_ID);
		}
	}
}

function changeGstRatesOnTransportMode() {
	var transportMode	= $("#transportationMode").val();
	
	if(configuration.customTaxAmountCalculation == 'true') {
		if(transportMode == TRANSPORTATION_MODE_AIR_ID || destnationBranchIdForOverNite > 0) {
			for(var i in jsondata.taxes) {
				jsondata.taxes[i].taxAmount = jsondata.taxes[i].taxMasterId == IGST_MASTER_ID ? 18 : 9;
			}
		} else {
			for(var i in jsondata.taxes) {
				jsondata.taxes[i].taxAmount = jsondata.taxes[i].taxMasterId == IGST_MASTER_ID ? 5 : 2.5;
			}
		}
	}
	
	resetTaxes();
	$('#taxes').empty();
	
	if(configuration.hideTaxeDetailsPanel == 'false')
		setTaxes();
}

function changeHsnCodeOnTransportMode() {
	if(configuration.showHsnCodeBasedOnTransportMode == 'false')
		return;
		
	let transportMode = $("#transportationMode").val();
	let transportModeIdAndHsnCodeIds = (configuration.transportModeWithHsnCode).split(',');
	let hsnFound = false;

	transportModeIdAndHsnCodeIds.forEach(function(transportModeIdPair) {
		const [transportModeId, hsnCode] = transportModeIdPair.split('_');

		if (transportMode === transportModeId.trim()) {
			$('#hsnCodeId').val(hsnCode.trim());
			hsnFound = true;
		}
	});

	if (!hsnFound)
		$('#hsnCodeId').val('');
}

function changeGstRatesOnTransportCategory() {
	let transportCategory	= Number($("#transportationCategory").val());
		
	if(transportCategory > 0) {
		for(let i in jsondata.taxes) {
			if(transportCategory == TRANSPORTATION_CATEGORY_COURIER_ID && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
				jsondata.taxes[i].taxAmount = jsondata.taxes[i].taxMasterId == IGST_MASTER_ID ? 18 : 9;
			else
				jsondata.taxes[i].taxAmount = jsondata.taxes[i].taxMasterId == IGST_MASTER_ID ? 5 : 2.5;
		}
	
		resetTaxes();
		$('#taxes').empty();
	
		if(configuration.hideTaxeDetailsPanel == 'false')
			setTaxes();
	}
}

function setTDSChargeInPercent() {
	if(tdsChargeInPercent != undefined) {
		$('#tdspercentcol').show();
		$('#tdsPercent').empty();
		$('#tdsPercent').append('<option value="-1">--Select--</option>');
		
		for(const element of tdsChargeInPercent) {
			$('#tdsPercent').append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
		} 
	}
}

function resetTDSDetails() {
	$('#tdsPercent').val(-1);
	$('#tdsAmount').val(0);
}

function setDefaultChargeType() {
	var typeId	= CHARGETYPE_ID_QUANTITY;
	
	if(configuration.DefaultChargeType > 0)
		typeId	= parseInt(configuration.DefaultChargeType);

	$('#chargeType').val(typeId);

	changeOnChargeType();
}

function changeOnChargeType() {
	if(configuration.validateMinimumChargeWeightToApplyChargeTypeFix == 'true' && isManualWayBill && !isMinimumChargeWeightToApplyChargeTypeFix())
		return;
		
	if(configuration.chargeTypeBasedOnRate == 'true' && !jQuery.isEmptyObject(chargeTypeIdsFromRateMaster)) {
		if (configuration.chargeTypeSelectionOnPartyAndBranchRate == 'true' 
		|| configuration.chargeTypeSelectiononBranchRateForTBB == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT
		|| configuration.chargeTypeSelectiononBranchRateForTBB == 'true' && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT && freightRatePartyId > 0) {
			let chargeTypeIdFromRateMaster = chargeTypeIdsFromRateMaster.split(",");
			
			if(chargeTypeIdFromRateMaster.length == 1) {
				let chargeTypeConstantHM	= jsondata.chargeTypeConstantHM;
				let element	= chargeTypeIdFromRateMaster[0];
				removeOption('chargeType', null);
				createOption('chargeType', element, chargeTypeConstantHM[parseInt(element)]);
			}
		} else if(configuration.chargeTypeSelectiononBranchRateForTBB == 'false') {
			let chargeTypeIdFromRateMaster	= chargeTypeIdsFromRateMaster.split(",");
			
			if(!isValueExistInArray(chargeTypeIdFromRateMaster, parseInt($('#chargeType').val()))) {
				$('#chargeType').val(chargeTypeIdFromRateMaster[0]);
				//showMessage('error', 'Rate not applied for this charge type !');
				return;
			}
		}
	}
	
	let	chargeType				= parseInt($('#chargeType').val()); 
	let currentWayBillTypeId 	= parseInt($('#wayBillType').val());
	
	let branchArrayToHideWeightRate 	= (configuration.branchIdsToDisableWeightRate).split(",");
	let branchArrayToHideArticleAmount	= (configuration.branchIdsTodisableArticleAmount).split(",");
		
	if(!isManualWayBill) {
		if(isValueExistInArray(branchArrayToHideWeightRate,executive.branchId)) {
			configuration.weightRateDisable= 'true';
			//	configuration.disableRateIfFoundFromDB = 'true';
		}
			
		if(isValueExistInArray(branchArrayToHideArticleAmount,executive.branchId)) {
			configuration.disableArticleAmount = 'true';
			//configuration.disableRateIfFoundFromDB = 'true';
		}
	}
	
	if(configuration.EditableQtyAmountOnOtherChargeType == 'false') {
		enableDisableInputField('fixAmount', 'true');
		enableDisableInputField('weigthFreightRate', 'true');
		enableDisableInputField('weightAmount', 'true');
		enableDisableInputField('qtyAmount', 'true');
		$('#fixAmount').val(0);
		$('#qtyAmount').val(0);
		$('#weightAmount').val(0);
		$('#cftAmount').val(0);
		$('#cftFreightRate').val(0);
		$('#cbmAmount').val(0);
		$('#cbmFreightRate').val(0);
		$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
		isFixedArticleSlab	= false;
		
		if (configuration.WeightWiseConsignmentAmount == 'true') {
			enableDisableInputField('artActWeight', 'true');
			$('#artActWeight').val(0);
		}
		
		if(configuration.VolumetricRate == 'true') {
			if ($('#volumetric').is(':checked'))
				switchHtmlTagClass('LBH', 'show', 'hide');
		} else
			switchHtmlTagClass('LBH', 'hide', 'show');
		
		if(configuration.ChargeCubicRateCBMWise == 'true') {
			resetCUBIC();
			switchHtmlTagClass('CUBIC', 'hide', 'show');
		}
		
		if(configuration.VolumetricWiseAddArticle == 'true') {
			resetLBH();
			$('#volumetricFeild').removeClass('hide');
		}

		if(currentWayBillTypeId == WAYBILL_TYPE_FOC) {
		} else {
			if(chargeType == CHARGETYPE_ID_WEIGHT || chargeType == CHARGETYPE_ID_QUANTITY
					|| chargeType == CHARGETYPE_ID_FIX || chargeType == CHARGETYPE_ID_KILO_METER) {
				if(configuration.showVolumetricAllChargetype == true || configuration.showVolumetricAllChargetype == 'true') {
					$('#volumetricDiv').removeClass('hide');
					$('#volumetricFeild').addClass('hide');
					$('#volumetric').attr('checked', true);
					artActWeightArr = new Array();
					artChrgWeightArr = new Array();
				}
			}
			
			 if(chargeType == CHARGETYPE_ID_CFT) {
				$("#cftRateDiv").removeClass("hide");
				$("#cftAmountDiv").removeClass("hide");
				$("#cbmRateDiv").addClass("hide");
				$("#cbmAmountDiv").addClass("hide");
				$('#weigthFreightRate').closest("div").hide();
				$('#weightAmount').closest("div").hide();
				$('#fixAmount').closest("div").hide();
			} else if(chargeType == CHARGETYPE_ID_CBM) {
				$("#cbmRateDiv").removeClass("hide");
				$("#cbmAmountDiv").removeClass("hide");
				$("#cftRateDiv").addClass("hide");
				$("#cftAmountDiv").addClass("hide");
				$('#weigthFreightRate').closest("div").hide();
				$('#weightAmount').closest("div").hide();
				$('#fixAmount').closest("div").hide();
			} else {
				$("#cbmRateDiv").addClass("hide");
				$("#cbmAmountDiv").addClass("hide");
				$("#cftRateDiv").addClass("hide");
				$("#cftAmountDiv").addClass("hide");
				$('#weigthFreightRate').closest("div").show();
				$('#weightAmount').closest("div").show();
				$('#fixAmount').closest("div").show();
			}
			
			if(chargeType == CHARGETYPE_ID_WEIGHT) {
				enableDisableInputField('weightAmount', 'false');
				
				if(configuration.hideChargeTypeReletedFields == 'true') {
					$('#weigthFreightRate').closest("div").show();
					$('#artAmt').closest("span").hide();
					$('#weightAmount').closest("div").show();
					$('#fixAmount').closest("div").hide();
					$('#chargedWeight').closest("div").show();
				}
				
				if (configuration.WeightWiseConsignmentAmount == 'true') {
					enableDisableInputField('artActWeight', 'false');
					$('#artActWeight').val(0);
				}
				
				if(configuration.weightRateDisable == 'false')
					enableDisableInputField('weigthFreightRate', 'false');
			} else if(chargeType == CHARGETYPE_ID_CUBIC_RATE) {
				enableDisableInputField('weightAmount', 'false');
				enableDisableInputField('weigthFreightRate', 'false');
				switchHtmlTagClass('LBH', 'show', 'hide');
				
				if(configuration.ChargeCubicRateCBMWise == 'true') {
					switchHtmlTagClass('LBH', 'hide', 'show');
					switchHtmlTagClass('CUBIC', 'show', 'hide');
				}
			} else if(chargeType == CHARGETYPE_ID_QUANTITY) {
				if(configuration.disableArticleAmount == 'false')
					enableDisableInputField('qtyAmount', 'false');
					
				if(configuration.hideChargeTypeReletedFields == 'true') {
					$('#artAmt').closest("span").show();
					$('#weigthFreightRate').closest("div").hide();
					$('#weightAmount').closest("div").hide();
					$('#fixAmount').closest("div").hide();
					$('#chargedWeight').closest("div").show();
				}
			} else if(chargeType == CHARGETYPE_ID_FIX) {
				enableDisableInputField('fixAmount', 'false');
				
				if(configuration.hideChargeTypeReletedFields == 'true') {
					$('#fixAmount').closest("div").show();
					$('#artAmt').closest("span").hide();
					$('#weigthFreightRate').closest("div").hide();
					$('#weightAmount').closest("div").hide();
					$('#chargedWeight').closest("div").hide();
				}
			} else if(chargeType == CHARGETYPE_ID_KILO_METER) {
				if(configuration.weightRateDisable == 'false')
					enableDisableInputField('weigthFreightRate', 'false');
				
				if(distance <= 0) {
					showMessage('error', 'Please configure distance from source to destination !');
					return;
				}
			}
		}

		showLRTypeWiseBookingAmountToGroupAdmin(currentWayBillTypeId);

		if(typeof applyRates != 'undefined')
			applyRates();
	} else if(currentWayBillTypeId == WAYBILL_TYPE_FOC) {
		$('#qtyAmount').val(0);
		enableDisableInputField('qtyAmount', 'true');
	} else
		enableDisableInputField('qtyAmount', 'false');

	if(configuration.resetActualWeightChargeWeightOnChargeType == 'true') {
		var currentChargeTypeId	= getValueFromInputField('chargeType');
		
		if(currentChargeTypeId == CHARGETYPE_ID_QUANTITY) {
			$('#actualWeight').val("60");
			$('#chargedWeight').val("60");
		} else if(currentChargeTypeId == CHARGETYPE_ID_WEIGHT) {
			$('#actualWeight').val("0");
			$('#chargedWeight').val("0");
		}
	}

	if(configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true) {
		if(getBookingType() == BOOKING_TYPE_FTL_ID) {
			if($('#chargeType').val() != CHARGETYPE_ID_FIX)
				showMessage('info', 'You can not Select other than "Fix" while your Booking Type is "FTL"');
			
			$('#chargeType').val(CHARGETYPE_ID_FIX);
			enableDisableInputField('fixAmount', 'false');
			enableDisableInputField('weightAmount', 'true');
			enableDisableInputField('weigthFreightRate', 'true');
			enableDisableInputField('qtyAmount', 'true');
			
			if(configuration.VolumetricRate == 'true') {
				if ($('#volumetric').is(':checked'))
					switchHtmlTagClass('LBH', 'show', 'hide');
			} else
				switchHtmlTagClass('LBH', 'hide', 'show');
		}
	}

	if ($('#wayBillType').val() != WAYBILL_TYPE_FOC && (configuration.validateRateFromRateMasterForLR == 'true' || configuration.validateRateFromRateMasterForLR == true)) {
		enableDisableInputField('fixAmount', 'true');
		enableDisableInputField('weightAmount', 'true');
		enableDisableInputField('weigthFreightRate', 'true');
		enableDisableInputField('qtyAmount', 'true');
	}
	
	$('#chargeWt').html(configuration.volumetricChargeWeightLabel);
	$('#cftRateLabel').html(configuration.cftRateLabel);

	if(configuration.showVolumetricActualWeight == 'true' || configuration.showVolumetricActualWeight == true)
		$('#actualWt').removeClass('hide');
	
	if(configuration.showVolumetricOnWeight == "true" ) {
		if(($("#chargeType").val() == CHARGETYPE_ID_WEIGHT)) {
			$('#volumetricFeild').removeClass('hide')
			
			if($('#volumetric').is(':checked')) {
				$('#cftWeightDiv').removeClass('hide')
				$("#actualWeight").attr("readonly", "readonly");
			} else {
				$('#cftWeightDiv').addClass('hide')
				$('#actualWeight').removeAttr('readonly');
			}
		} else {
			$('#volumetricFeild').addClass('hide')
			$('#cftWeightDiv').addClass('hide')
			$('#actualWeight').removeAttr('readonly');
		}
	} else {
		$('#volumetricFeild').removeClass('hide')
		$('#cftWeightDiv').addClass('hide')
		$('#actualWeight').removeAttr('readonly');
	}
	
	if(configuration.nonEditableChargeWeight == 'true')
		enableDisableInputField('chargedWeight', 'true');
					
	if(isTokenWayBill && isFreightChargeEnable && $('#consignorName').val() != '' && $('#consigneeName').val() != ''  && $('#chargeType').val() > 0)
		next = 'actualWeight';
	else if(isTokenWayBill && $('#chargeType').val() <= 0 )
		next = 'chargeType';
		
	if(configuration.WeightValidate == 'true' && Number(configuration.WeightValidateFlover) == GroupConfigurationProperties.WEIGHT_VALIDATE_WITH_CHARGETYPE_WEIGHT_OR_QUANTITY) {
		if($("#chargeType").val() == CHARGETYPE_ID_WEIGHT || $("#chargeType").val() == CHARGETYPE_ID_QUANTITY) {
			$('#showActualWeightAstrek').removeClass('hide');
			$('#showChargeWeightAstrek').removeClass('hide');
		} else {
			$('#showActualWeightAstrek').addClass('hide');
			$('#showChargeWeightAstrek').addClass('hide');
		}
	} else if(Number(configuration.WeightValidateFlover) == 0) {
		$('#showActualWeightAstrek').removeClass('hide');
		$('#showChargeWeightAstrek').removeClass('hide');
	}
}

function changeChargeTypeToWeightOnAboveFixedActualWeight() {
	let chargeType		= parseInt($('#chargeType').val()); 
	let actualWeight 	= parseInt($('#actualWeight').val())
	
	if(configuration.changeChargeTypeToWeightOnAboveFixedActualWeight == 'true'
	&& actualWeight > Number(configuration.fixedActualWeightToChangeChargeTypeToWeight) && (chargeType == CHARGETYPE_ID_QUANTITY || chargeType == CHARGETYPE_ID_FIX)) {
		$("#chargeType").val(CHARGETYPE_ID_WEIGHT);
		showMessage('info', 'Above fixed weight ' + configuration.fixedActualWeightToChangeChargeTypeToWeight + 'kg, you can only book in weight !');
		changeOnChargeType();
		resetArticleWithTable();
		$('#quantity').focus();
		$('#actualWeight').val(actualWeight);
		$('#chargedWeight').val(actualWeight);
	}
}

function setDeliveryToDoorDeliveryForOvernightCarrier() {
	if(configuration.isOnlyDoorDeliveryAllowedForOvernightCarrier == true || configuration.isOnlyDoorDeliveryAllowedForOvernightCarrier =='true'){
		var subRegionId 			= $('#destinationSubRegionId').val();
		var overNiteSubRegionIdList = subRegionIdsForOverNite.split(',');
		
		if(isValueExistInArray(overNiteSubRegionIdList, subRegionId))
			$('#deliveryTo').val(DELIVERY_TO_DOOR_ID);
	}
}

function resetPartyPanelData(){
	$('#consignorPhn').val('');
	$('#consignorName').val('');
	$('#consignorGstn').val('');
	$('#consignorAddress').val('');
	$('#consignorCorpId').val(0);
	$('#partyMasterId').val(0);

	$('#consigneePhn').val('');
	$('#consigneeName').val('');
	$('#consigneeGstn').val('');
	$('#consigneeAddress').val('');
	$('#consigneePartyMasterId').val(0);
	$('#billingPartyId').val(0);
	$('#billingPartyName').val('');
	consignorRateConfigured	= false;
	consigneeRateConfigured = false;
	isConsigneeIncreaseChargeWeight	= false;
	isConsignorIncreaseChargeWeight	= false;
}

function setNextPrevAfterConsignorName() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterConsignorName, accountGroupId))
		return;
	
	next = "consigneeName";
	prev = "destination";
}

function setNextPrevAfterConsigneeName() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterConsigneeName, accountGroupId))
		return;

	next = "quantity";
	prev = "consignorName";
}

function setNextPrevAfterPackingType() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterPackingType, accountGroupId))
		return;
	
	if(($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC)) {
		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			next = "qtyAmount";
			prev = "quantity";
		} else {
			next = "add";
			prev = "quantity";
		}
	} else {
		next = "add";
		prev = "quantity";
	}
}

function setNextPrevAfterFormType() {
	if(accountGroupId != 383 && accountGroupId != 650)
		return;
		
	if($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID && accountGroupId == 650) {
		next = "STPaidBy";
		prev = "quantity";
	} else if($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID) {
		next = "addMutipleEwayBill";
		prev = "quantity";
	} else {
		next = "declaredValue";
		prev = "quantity";
	}
}

function bindFocusOnStPaidBy(value) {
	if (configuration.bindFocusOnStPaidBy == 'true' && Number(value) < configuration.declaredValueForSelectEwayBill) {
		if(accountGroupId == 434 || accountGroupId == 574) {
			next="deliveryTo"
		} else if (accountGroupId == 526 && configuration.DeclaredValueBeforeFormType == 'true') {
			next = "singleFormTypes";
			prev = "invoiceNo";
		} else {
			if (accountGroupId == 517 || accountGroupId == 631) 
				next = "deliveryTo";
			else if(configuration.DeclaredValueBeforeFormType == 'true') {
				if(!isInsuranceServiceAllow)
					next = "STPaidBy";
			}
				
			prev = "invoiceNo";
		}
	}
}

function setNextPrevAfterDeclaredValue() {
	if(accountGroupId == 3) {
		if($('#declaredValue').val() < Number(configuration.declaredValueForSelectEwayBill))
			next = "privateMark";
	} else if(accountGroupId == 383  || accountGroupId == 563) {
		next = "remark";
		prev = "singleFormTypes";
	} else if((accountGroupId == 567 || accountGroupId == 544 || accountGroupId == 609) && ($('#declaredValue').val() > Number(configuration.declaredValueForSelectEwayBill))) {
		var eWayBillNumber		= checkBoxArray.join(',');
		
		if(eWayBillNumber == null || eWayBillNumber == '')
			next = "singleFormTypes";
		else 	
			next = "STPaidBy";
	} else if(accountGroupId == 573 && $('#declaredValue').val() > Number(configuration.declaredValueForSelectEwayBill))
		next = "singleFormTypes";
	else if(accountGroupId == 566)
		next = "privateMark";
}

function setNextPrevAfterStPaidby() {
	if(accountGroupId == 594)
		next = "remark";
	
	if(accountGroupId != 573)
		return;
	
	next = "deliveryTo";
	prev = "STPaidBy";
}

function setNextPrevAfterRemark() {
	if(accountGroupId != 383 && accountGroupId != 3)
		return;
	
	if(($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) && accountGroupId != 3) {
		next = "charge25";
		prev = "declaredValue";
	} else if (configuration.branchWisePaymentTypeSelection == 'true' && configuration.PaymentType == 'true'
			&& $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID) {
		next = "paymentType";
		prev = "remark";
	} else {
		next = "save";
		prev = "declaredValue";
	}
}

function setNextPrevAfterConsignmetAdd() {
	if(accountGroupId != 264)
		return;

	next = "declaredValue";
	prev = "add";
}

function setNextPrevAfterCharge(chargeId) {
	if (chargeId == BookingChargeConstant.SERVICE_CHARGE) {
		next = "charge25";
		prev = "remark";
	} else if (chargeId == BookingChargeConstant.DOOR_DELIVERY_BOOKING) {
		next = "save";
		prev = "charge22";
	}
}

function setNextPrevAfterAddEwayBill() {
	if(accountGroupId != 383)
		return;

	next = "declaredValue";
	prev = "btRemove";
}

function setNextPrevAfterAddARticleToRemark() {
//439->Pavan Travels Company (PTC)
	if(accountGroupId != 439)
		return;
		
	next = "remark";
	prev = "qtyAmount";
}

function setNextPrevAfterRemarkToSave() {
	//439->Pavan Travels Company (PTC)
	if(accountGroupId != 439)
		return;
	
	next = "save";
	prev = "add";
}

function setNextPrevAfterAddARticleToCharges() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterAddArticleToCharges, accountGroupId))
		return;
	
	if($('#chargeType').val() != ChargeTypeConstant.CHARGETYPE_ID_FIX) {
		next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges
		prev = "qtyAmount";
	}
}

var eWayBillCount = 1;

function setNextPrevAfterEwayBillEscape(escapePressed) {
	if(accountGroupId == 442)
		escapePressed = true;
	
	if(!isValueExistInArray(groupIdsForNextPrevAfterEwayBillEscape, accountGroupId))
		return;
	
	if(accountGroupId == 270 || accountGroupId == 355 || accountGroupId == 280 || 
			accountGroupId == 385 || accountGroupId == 281 || accountGroupId == 202 || accountGroupId == 201 || accountGroupId == 447 || accountGroupId == 442 || accountGroupId == 227 || accountGroupId == 402) {
		if(escapePressed)
			prev = "STPaidBy";
		else
			prev = "bookingType";
	} else if(accountGroupId == 50) {
		if(escapePressed)
			prev = "STPaidBy";
		else if(isManual)
			prev = "manualEntryType";
		else
			prev = "destination";
	} else if(accountGroupId == 454 || accountGroupId == 467 || accountGroupId == 399 || accountGroupId == 572 || accountGroupId == 573 || accountGroupId == 580 || accountGroupId == 592 || accountGroupId == 544 || accountGroupId == 609 || accountGroupId == 644) {
		if($('#billSelectionDialog').is(':visible'))
			prev = "billSelection";
		else
			prev = "STPaidBy";
	} else if(accountGroupId == 9) {
		if(escapePressed)
			prev = "invoiceNo";
		else if(isManual)
			prev = "sourceBranch";
		else
			prev = "destination";
	} else if(accountGroupId == 3)
			prev = "remark";
	else if(accountGroupId == 285)
		prev = "invoiceNo";
	else if(accountGroupId == 466) {
		if(escapePressed)
			prev = "invoiceNo";
		else
			prev = "bookingType";
	} else if(accountGroupId == 740) {
		if (configuration.BranchCode == 'true' && !isAutoSequenceCounter) {
			if(isManual)
				$("#sourceBranch").focus();
			else
				$("#lrNumberManual").focus();	
		} else if(isManual)
			$("#sourceBranch").focus();
		else
			$("#destination").focus();	
	} else if(closeOrSubmitClicked)
		prev = "remark";
	else if(isManual)
		prev = "sourceBranch";
	else
		prev = "destination";
			
	eWayBillCount++;
}

function setFocusOnInvoiceNoAfterPrivateMark(event) {
	if(configuration.setFocusOnInvoiceNoAfterPrivateMark === "true") {
		event.stopPropagation();
		
		 if(event.key === "Enter")
			$("#invoiceNo").focus();
	 }
}

function setNextPrevAfterEwayBillSubmit(closeOrSubmitClicked){
	//439->Pavan Travels Company (PTC)
	if(!isValueExistInArray(groupIdsForNextPrevAfterEwayBillSubmit, accountGroupId))
		return;
	
	if(accountGroupId == 270 || accountGroupId == 355 || accountGroupId == 280 || 
			accountGroupId == 385 || accountGroupId == 281 || accountGroupId == 202 || accountGroupId == 201 || accountGroupId == 442 || accountGroupId == 447 || accountGroupId == 467 || accountGroupId == 227 || accountGroupId == 402 || accountGroupId == 399) {
		if(closeOrSubmitClicked) {
			next = "STPaidBy";
			prev = "STPaidBy";
		} else
			next = "bookingType";
	} else if (accountGroupId == 454 || accountGroupId == 580 || accountGroupId == 592 || accountGroupId == 566 || accountGroupId == 609 || accountGroupId == 572 ||  accountGroupId == 669 || accountGroupId == 581 || accountGroupId == 22 || accountGroupId == 709|| accountGroupId == 724 || accountGroupId == 520) {
		if(isManual)
			next = "sourceBranch";
		else
			next = "destination";
    } else if(accountGroupId == 740) {
		if (configuration.BranchCode == 'true' && !isAutoSequenceCounter) {
			if(isManual)
				$("#sourceBranch").focus();
			else
				$("#lrNumberManual").focus();	
		} else if(isManual)
			$("#sourceBranch").focus();
		else
			$("#destination").focus();	
	} else if(accountGroupId == 50) {
		if(closeOrSubmitClicked) {
			next = "STPaidBy";
			prev = "STPaidBy";
		} else if(isManual)
			next = "manualEntryType";
		else
			next = "destination";
	} else if(accountGroupId == 9) {
		if(closeOrSubmitClicked)
			$("#invoiceNo").focus();
		else if(isManual) {
			if(Number($('#sourceBranchId').val()) <= 0)
				$("#sourceBranch").focus();
		} else if(Number($('#destinationBranchId').val()) <= 0)
			$("#destination").focus();
	} else if(accountGroupId == 3) {
		next = "remark";
		prev = "remark";
		$("#remark").focus();
	} else if(accountGroupId == 466) {
		if(closeOrSubmitClicked)
			$("#deliveryTo").focus();
		else
			$("#bookingType").focus();
	} else if(accountGroupId == 285) {
		next = "invoiceNo";
		prev = "invoiceNo";
		$("#invoiceNo").focus();
	} else if(closeOrSubmitClicked) {
		next = "remark";
		prev = "remark";
	} else if(accountGroupId == 792 ||accountGroupId == 918) {
		next = "remark";
		$("#remark").focus();
	} else if(isManual)
		next = "sourceBranch";
	else
		next = "destination";
}

function validateContainerBeforeSave(count){
	if(count == 0) {
		showMessage('info','Please enter container details!');
		$("#containerType").focus();
		return false;
	}
	
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")) {
		count = $("#containerDetailsDivSummaryDiv tr").length;
		
		if(Number(count) == 1) {
			let containerType = $("#actualContainerType").val();
			
			if(containerType == 2) {
				showMessage('info','Please add one more container, as you have selected 20ft double!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return false;
			}
		}
	}
	
	return true;
}

function validateContainerFields() {
	if($("#containerType").val() <= 0) {
		showMessage('info','Please select container type!');
		$("#containerType").val(0);
		$("#containerType").focus();
		return false;
	}
	
	if($("#containerNo").val() == '') {
		showMessage('info','Please enter container number!');
		$("#containerNo").val('');
		$("#containerNo").focus();
		return false;
	}
	
	if($("#containerSize").val() == '' || $("#containerSize").val() <= 0) {
		showMessage('info','Please enter container size!');
		$("#containerSize").val('');
		$("#containerSize").focus();
		return false;
	}

	if($("#sealNo").val() == '') {
		showMessage('info','Please enter seal number!');
		$("#sealNo").val('');
		$("#sealNo").focus();
		return false;
	}
	
	return true;
}

var dr = 0;

function addContainerDetailsFunc() {
	if(!validateContainerFields())
		return;

	let containerType 				= $('#containerType').val();
	let containerSize 				= $('#containerSize').val();

	if(containerType == 3) {
		if(dr > 1) {
			showMessage('info','Cannot add more!');
			return;
		}
		
		if(containerSize > 40) {
			showMessage('info','Cannot add more than 40ft!');
			$('#containerSize').val('');
			$('#containerSize').focus();
			return;
		}
	} else {
		if(dr > 2) {
			showMessage('info','Cannot add more!');
			return;
		}
		
		if(containerSize > 20) {
			showMessage('info','Cannot add more than 20ft!');
			$('#containerSize').val('');
			$('#containerSize').focus();
			return;
		}
	}
	
	let containerNo 				= $('#containerNo').val();
	let containerTypeStr			= "";

	if(containerType == 3)
		containerTypeStr = "40 FT Single";
	else if(containerType == 2)
		containerTypeStr = "20 FT Double";
	else if(containerType == 1)
		containerTypeStr = "20 FT Single";

	let sealNo 						= $('#sealNo').val();

	if (containerNo.length > 15)						
		containerNo = containerNo.substring(0, 15) + '..';
	
	if (sealNo.length > 15)						
		sealNo = sealNo.substring(0, 15) + '..';
	
	if(!$('#containerDetailsSummary'+dr ).exists()) {
		alreadyAdded = true;
		let row 						= createRowInTable('containerDetailsSummary' + dr, '', '');
		let containerTypeCol 			= createColumnInRow(row, 'containerTypeStr_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		let containerNoCol 				= createColumnInRow(row, 'containerNo_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		let containerSizeCol 			= createColumnInRow(row, 'containerSize_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		let sealNoCol 					= createColumnInRow(row, 'sealNo_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');

		appendValueInTableCol(containerTypeCol, containerTypeStr.toUpperCase());
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="row_'+ (dr + 1) +'" value= ' + dr + ' />');
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="actualContainerType" value= ' + $('#containerType').val() + ' />');
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="containerType_' + (dr + 1) + '" value= ' + containerType + ' />');
		appendValueInTableCol(containerNoCol, containerNo.toUpperCase());
		appendValueInTableCol(containerSizeCol, containerSize);
		appendValueInTableCol(sealNoCol, sealNo.toUpperCase());
		appendValueInTableCol(createColumnInRow(row, 'removeRow_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', ''), '<button type="button" id="remove_'+ (dr + 1) + '" class="btn btn-danger">Remove</button>');

		$("#containerDetailsDivSummaryDiv").append(row);
		$("#containerDetailsDiv").removeClass('hide');

		$("#remove_"+(dr + 1)).bind("click", function() {
			removeContainerRow(dr-1);
		});

		dr = dr + 1;
		$("#containerNo").val('');
		$("#sealNo").val('');
		$("#containerSize").val('');
		$("#containerType").val(0);
		setTimeout(() => {
			$("#containerType").focus();
		}, 200);

	}
}

function saveContainerDetailsFunc() {
	containerDetailsArray 	= new Array();
	var count				= $("#containerDetailsDivSummaryDiv tr").length;

	if(!validateContainerBeforeSave(count))
		return;
	
	if(Number(count) > 0) {
		for(let i = 0; i < count; i++) {
			let containerDetailsData 	= {};

			containerDetailsData.accountGroupId				= accountGroupId;
			containerDetailsData.containerNumber			= $("#containerNo_" + (i + 1)).html();
			containerDetailsData.containerSize				= $("#containerSize_" + (i + 1)).html();
			containerDetailsData.containerType				= $("#containerType_" + (i + 1)).val();
			containerDetailsData.sealNumber					= $("#sealNo_" + (i + 1)).html();
			containerDetailsData.row						= $("#row_" + (i + 1)).val();

			containerDetailsArray.push(containerDetailsData);
		}
	}
	
	$('#popUpForCargoType').modal('hide');
	$('#viewContainerDetailsDiv').removeClass('hide');
}

function viewContainerDetailsFunc() {
	$("#popUpForCargoType").modal({
		backdrop: 'static',
		keyboard: false
	});
}

function resetContainerDetails() {
	$("#containerNo").val('');
	$("#sealNo").val('');
	$("#containerSize").val('');
	$("#containerType").val(0);
	$('#popUpForCargoType').modal('hide');
	$('#viewContainerDetailsDiv').addClass('hide');
	$('#containerDetailsDiv').addClass('hide');
	$('#containerDetailsDivSummaryDiv').empty();
	containerDetailsArray 	= [];
	dr = 0;
}

function addCargoType(cargoType){
	resetContainerDetails();
	
	if(cargoType.value == 1) {
		$("#popUpForCargoType").modal({
			backdrop: 'static',
			keyboard: false
		});
		
		setTimeout(() => {
			$('#containerType').focus();
		}, 500);
		
		$("#addContainerDetails").bind("click", function() {
			addContainerDetailsFunc();
		});
		
		$("#saveContainerDetails").bind("click", function() {
			saveContainerDetailsFunc();
		});
	}
	
}

function removeContainerRow(id){
	let row = $('#row_'+(id+1)).val();
	$('#containerDetailsSummary'+id).remove();
	dr = dr - 1; 
	
	containerDetailsArray = containerDetailsArray.filter(function(obj) {return obj.row != Number(row);});
		
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")) {
		let count = $("#containerDetailsDivSummaryDiv tr").length;
	
		if(count == 0)
			containerDetailsArray 	= [];
	}
}

function setBillingBranch(wayBillTypeId) {
	if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
		if(jsondata.defaultBillingBranch != undefined) {
			$('#billingBranchId').val(jsondata.billingBranchId);
			$('#billingBranch').val(jsondata.defaultBillingBranch);
		} else if(configuration.loggedInBranchAsBillingBranch == 'true'
			&& $('#billingBranch').exists() && $('#billingBranch').is(":visible")) {
			$('#billingBranchId').val(executive.branchId);
			$('#billingBranch').val(loggedInBranch.name);
		}
	} else {
		$('#billingBranchId').val(0);
		$('#billingBranch').val('');
	}
}

function setChargesOnCCAttached() {
	let setChargeOnCCAttachedConfig = configuration.setChargeOnCCAttachedConfig;
	let chargeValueForCCAttached	= Number(configuration.chargeValueForCCAttached);
	let wayBillTypeId 				= $('#wayBillType').val();
	
	if(setChargeOnCCAttachedConfig == 'true' && chargeIdsForCCAttachedArr != null && wayBillTypeId != WAYBILL_TYPE_FOC) {
		for(const element of chargeIdsForCCAttachedArr) {
			let chargeId 	= element;
			let chargeVal 	= Number($('#charge' + chargeId).val());
		
			if($('#ccAttached').prop('checked'))
				chargeVal = Number(chargeVal) + Number(chargeValueForCCAttached);
			else if(chargeVal >= chargeValueForCCAttached)
				chargeVal = Number(chargeVal) - Number(chargeValueForCCAttached);
			
			$('#charge' + chargeId).val(Number(chargeVal));
			calcTotal();
		}
	}
}

function setNextPrevAfterArticleAdd() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterArticleAdd, accountGroupId))
		return;

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		if(accountGroupId == 412 || accountGroupId == 389) {
			next = "deliveryTo";
			prev = "chargeType";
		} else {
			next = "invoiceNo";
			prev = "chargeType";
		}
	} else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
		next = "actualWeight";
		prev = "chargeType";
	} else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX) {
		if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
			next = "fixAmount";
			prev = "chargeType";
		} else if(accountGroupId == 412 || accountGroupId == 389) {
			next = "deliveryTo";
			prev = "chargeType";
		} else {
			next = "invoiceNo";
			prev = "chargeType";
		}
	}
}

function setNextAfterChargeWeight() {
	let branchIdArr = (configuration.branchesForFocusFromChargeWeightToPrivateMark).split(",");
	
	if(!isValueExistInArray(groupIdsForNextPrevAfterChargeWeight, accountGroupId))
		return;
	
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC && $('#chargeType').val() == CHARGETYPE_ID_WEIGHT) {
		next = "deliveryTo";
		prev = "chargedWeight"
	}

	if(accountGroupId == 399 || isValueExistInArray(branchIdArr, branchId)) {
		$("#chargedWeight").keypress(function(event) {
			if(getKeyCode(event) == 13) {
				next = "privateMark";
			//	$("#privateMark").focus();
			}
		});
	}
	if(accountGroupId == 634 ||accountGroupId == 635) {
		$("#chargedWeight").keypress(function(event) {
			if(getKeyCode(event) == 13) {
				next = "addMutipleInvoiceDetailsDiv";
			}
		});
	} 
}

function setNextPrevAfterWeightRate() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterWeightRate, accountGroupId))
		return;
	
	if(accountGroupId == 412 || accountGroupId == 389) {
		next = "deliveryTo";
		prev = "weigthFreightRate";
	} else {
		next = "invoiceNo";
		prev = "weigthFreightRate";
	}
}

function setNextPrevAfterFixedValue() {
	if(!isValueExistInArray(groupIdsForNextPrevAfterFixedValue, accountGroupId))
		return;
	
	if(accountGroupId == 412 || accountGroupId == 389) {
		next = "deliveryTo";
		prev = "fixAmount";
	} else if(accountGroupId == 484 || accountGroupId == 487 || accountGroupId == 481) {
		next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges
		prev = "add";
	} else {
		next = "invoiceNo";
		prev = "fixAmount";
	}
}

function disableChargesForAgentBranches() {
	if(configuration.ownBranchCityList != 0 && !isOwnBranchCityList && !isManualWayBill) {
		$('#charge' + LOADING).prop("readonly", "true");
		$('#charge' + BUILTY_CHARGE).prop("readonly", "true");
	}
}

function disableChargesForDoorPickUpCharge() {
	let bracnhIdsForDoorPickUpCharge20	= (configuration.branchIdsToallowDoorPickUpCharge20).split(",");
	
	if(isValueExistInArray(bracnhIdsForDoorPickUpCharge20, branchId))
		$('#charge' + DOOR_PICKUP).prop("readonly", "true");
}

function readCustomAmountCalculationProperty() {
	if(configuration.CustomAmountCalculation == 'false')
		return;
	
	let loadingIncreaseBranchList				= (configuration.loadingIncreaseBranchList).split(',');
	let loadingIncreaseManualBranchList			= (configuration.loadingIncreaseManualBranchList).split(',');
	let ownBranchCityList						= (configuration.ownBranchCityList).split(',');
	let newLoadingChargeBranchList				= (configuration.newLoadingChargeBranchList).split(',');
	let branchListForSkipAmountValidation		= (configuration.branchListForSkipAmountValidation).split(',');
	let newFreightChargeBranchList				= (configuration.newFreightChargeBranchList).split(',');
	let packingTypefreightChargeBranchList		= (configuration.packingTypefreightChargeBranchList).split(',');
	let freightChargeEnableBranchList			= (configuration.freightChargeEnableBranchList).split(',');
	let freightChargeEnableBranchListForTopay	= (configuration.freightChargeEnableBranchListForTopay).split(',');
	let loadingChargeFixBranchList				= (configuration.loadingChargeFixBranchList).split(',');
	let loadingChargeFixLimitedBranchList		= (configuration.loadingChargeFixLimitedBranchList).split(',');
	let freightIncreaseOrDecreaseBranchList		= (configuration.freightIncreaseOrDecreaseBranchList).split(',');
	
	if(isManualWayBill)
		isLoadingIncreaseBranchList				= isValueExistInArray(loadingIncreaseManualBranchList, branchId);
	else
		isLoadingIncreaseBranchList				= isValueExistInArray(loadingIncreaseBranchList, branchId);
		
	isOwnBranchCityList						= isValueExistInArray(ownBranchCityList, executive.cityId);
	isNewLoadingChargeBranch				= isValueExistInArray(newLoadingChargeBranchList, branchId);
	isBranchListForSkipAmountValidation		= isValueExistInArray(branchListForSkipAmountValidation, branchId);
	isNewFreightChargeBranchList			= isValueExistInArray(newFreightChargeBranchList, branchId);
	isPackingTypefreightChargeBranchList	= isValueExistInArray(packingTypefreightChargeBranchList, branchId);
	isFreightChargeEnableBranchList			= isValueExistInArray(freightChargeEnableBranchList, branchId);
	isFreightChargeEnableBranchListForTopay	= isValueExistInArray(freightChargeEnableBranchListForTopay, branchId);
	checkBranchForFixLoadingCharge			= isValueExistInArray(loadingChargeFixBranchList, branchId);
	isLoadingChargeFixLimitedBranchList		= isValueExistInArray(loadingChargeFixLimitedBranchList, branchId);
	checkBranchForFreightIncreaseOrDecrease	= isValueExistInArray(freightIncreaseOrDecreaseBranchList, branchId);
}

function checkForPartyAutoFill() {
	if(configuration.branchWiseConsignorAutofillShortcutAllow == 'true') {
		var branchList 		= (configuration.branchCodeListForConsigneeAutofillShortcutAllow).split(',');
		var checkBranch 	= isValueExistInArray(branchList, branchId);
		
		if(checkBranch || (configuration.allBranchConsignorAutofillShortcutAllow == 'true'))
			consignorAutofillShortcutAllow	= true;
	}
	
	if(configuration.branchWiseConsigneeAutofillShortcutAllow == 'true') {
		var branchList 		= (configuration.branchCodeListForConsigneeAutofillShortcutAllow).split(',');
		var checkBranch 	= isValueExistInArray(branchList, branchId);

		if(checkBranch || (configuration.allBranchConsigneeAutofillShortcutAllow == 'true'))
			consigneeAutofillShortcutAllow	= true;
	}
}

function removeStarFromInvoiceAndDeclaredValue() {
	if(configuration.removeMandetoryFromInvoiceNumber == 'true' || configuration.removeMandetoryFromInvoiceNumber == true)
		$('#invoiceMandatory').remove();

	if(configuration.removeMandetoryFromDeclaredValue == 'true' || configuration.removeMandetoryFromDeclaredValue == true)
		$('#declaredMandatory').remove();
}

function setFocusOnGodownAfterDeclareValue() {
	if(configuration.STPaidBy == 'false')
		configuration.bindFocusOnStPaidBy = 'false';
	
	if((configuration.focusOnGodownAfterDaclareValue == 'true' || configuration.focusOnGodownAfterDaclareValue == true)
		&& (configuration.bindFocusOnStPaidBy == 'false' || configuration.bindFocusOnStPaidBy == false)) {
		next = 'deliveryTo';
	}
}

function setFocusOnRemarkAfterDeclareValue() {
	if(configuration.STPaidBy == 'false')
		configuration.bindFocusOnStPaidBy = 'false';
		
	if(configuration.focusOnRemarkAfterDaclareValue == 'true' && configuration.bindFocusOnStPaidBy == 'false')
		next = 'remark';
}

function setFocusOnChargesAfterDeclaredValue() {
	if(configuration.STPaidBy == 'false')
		configuration.bindFocusOnStPaidBy = 'false';
		
	if((configuration.setFocusOnChargesAfterDeclaredValue == 'true' || configuration.setFocusOnChargesAfterDeclaredValue == true) &&
		(configuration.bindFocusOnStPaidBy == 'false' || configuration.bindFocusOnStPaidBy == false)) {
		next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges;
	}
}

function setArticleType() {
	removeOption('natureOfArticle', null);

	//createOption('natureOfArticle', 0, 'Nature of Article');

	for(var i = 0; i < articleTypeForGroup.length; i++) {
		createOption('natureOfArticle', articleTypeForGroup[i].articleTypeMasterId, articleTypeForGroup[i].articleTypeName);
	}
	
	//document
	$("#natureOfArticle option[value=1]").attr("selected", "selected");
}

function resetBookingPageByRegionId() {
	var regionArr = (configuration.resetBookingPageOnRegionIds).split(",");
	var isAllowRegionResetBookingPage = isValueExistInArray(regionArr, executive.regionId);
	
	if(isAllowRegionResetBookingPage) {
		configuration.declaredValueAndInvoiceNumberMandatoryOnGstNo		= 'true';
		configuration.validateInvoiceDate								= 'false';
		configuration.freezeGSTPaidNotApplicableONGSTNumber				= 'true';
		configuration.showStPaidBySelect								= 'true';
		configuration.allowToSelectNotApplicableInAnyCase				= 'true';
		configuration.invoiceNoMandatoryOnGstn							= 'true';
		configuration.decValMandatoryOnGstn								= 'true';
		configuration.invoiceDateMandatoryOnGStn						= 'true';
		configuration.declaredValueForSelectEwayBill					= 49999;
		configuration.showInvoiceDate									= 'true';
		configuration.consignorAndConsigneeIdProofMandatoryOnGstn		= 'true';
	}
}

function setBuiltyAndFreightCharge() {
	$('#charge' + BookingChargeConstant.BUILTY_CHARGE).val(0);
	
	if(configuration.freightChargeEnableBranchList != 0 || configuration.freightChargeEnableBranchListForTopay != 0) {
		if(($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT && isFreightChargeEnableBranchList) 
				|| ($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY && isFreightChargeEnableBranchListForTopay)) {
			$('#charge' + BookingChargeConstant.FREIGHT).removeAttr("readonly");
			$('#charge' + BookingChargeConstant.BUILTY_CHARGE).removeAttr("readonly");
		} else {
			$('#charge' + BookingChargeConstant.FREIGHT).prop("readonly", "true");
			$('#charge' + BookingChargeConstant.BUILTY_CHARGE).prop("readonly", "true");
			
			if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT)
				$('#charge' + BookingChargeConstant.BUILTY_CHARGE).val(20);
		}
		
		calcTotal();
	}
}

function focusOnInVoiceNumberForTokenBooking() {
	if(accountGroupId != 442)//only for batco
		return;
	
	var valres = validateDetailsForTokenLRBooking();
	
	if(!isManualWayBill && (valres || (configuration.showExtraSingleEwaybillField == 'true' || configuration.showExtraSingleEwaybillField == true))) {
		next = "invoiceNo";
		return false;
	} else if(isManualWayBill && (configuration.showExtraSingleEwaybillFieldOnManualScreen == 'true' || configuration.showExtraSingleEwaybillFieldOnManualScreen == true)) {
		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
			next = "weigthFreightRate";
			return false;
		}
		
		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			next = "privateMark";
			return false;
		}
	}
}

function setFocusOnActualWtAfterLrCharge() {
	if((configuration.setChargeTypeWiseFocusOnCharges == 'true' || configuration.setChargeTypeWiseFocusOnCharges == true)
		&& $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
			next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges;		
}

function setFocusOnWtRateAfterLrCharge() {
	if((configuration.setChargeTypeWiseFocusOnCharges == 'true' || configuration.setChargeTypeWiseFocusOnCharges == true) 
		&& $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
			next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges
}

function setFocusOnFixAmtAfterLrCharge() {
	if((configuration.setChargeTypeWiseFocusOnCharges == 'true' || configuration.setChargeTypeWiseFocusOnCharges == true)
		&& $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
			next = 'charge' + configuration.chargeIdToSetChargeTypeWiseFocusOnCharges
}

function setTaxType() {
	removeOption('taxTypeId', null);
	createOption('taxTypeId', 0, "-- Select --");
	
	for(var key in taxTypeHm) {
		createOption('taxTypeId', key, taxTypeHm[key]);
	}

	if(configuration.allowTaxTypeWiseTax == 'true') {
		$('#taxTypeId').val(configuration.defaultTaxType);
		resetTaxes();
		$('#taxes').empty();
		setTaxes();
	}
}

function setTaxTypePartyWise() {
	var waybilltypeId = $('#wayBillType').val();
	
	if(waybilltypeId == WAYBILL_TYPE_PAID && typeof consignorTaxType !== 'undefined') {
		if(consignorTaxType > 0) {
			$('#taxTypeId').val(consignorTaxType);
			$('#taxTypeId').attr('disabled','true');
		} else {
			$('#taxTypeId').removeAttr('disabled','false');
			setTaxType();
		}
	} else if(waybilltypeId == WAYBILL_TYPE_TO_PAY && typeof consigneeTaxType !== 'undefined') {
		if(consigneeTaxType > 0) {
			$('#taxTypeId').val(consigneeTaxType);
			$('#taxTypeId').attr('disabled', 'true');
		} else{
			$('#taxTypeId').removeAttr('disabled', 'false');
			setTaxType();
		}
	} else if(waybilltypeId == WAYBILL_TYPE_CREDIT && typeof billingTaxType !== 'undefined') {
		if(billingTaxType > 0) {
			$('#taxTypeId').val(billingTaxType);
			$('#taxTypeId').attr('disabled', 'true');
		} else {
			$('#taxTypeId').removeAttr('disabled', 'false');
			setTaxType();
		}
	} else {
		$('#taxTypeId').removeAttr('disabled', 'false');
		setTaxType();
	}
}

function setCompanyWiseTaxes(branchId){
	if(configuration.allowCompanyWiseTax == 'false')
		return;

	var branch;

	if(isManualWayBill) {
		if(Number($('#sourceBranchId').val()) > 0 && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAID)
			 branch			= branchcache[Number($('#sourceBranchId').val())];
		else if(Number($('#destinationBranchId').val()) > 0 && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
			 branch			= branchcache[Number($('#destinationBranchId').val())];
		else if(branchId > 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
			 branch			= branchcache[branchId];
	} else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		branch			= branchcache[Number($('#destinationBranchId').val())];
	else if(branchId > 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		branch			= branchcache[branchId];
	else
		branch			= branchcache[executive.branchId];
	
	if(typeof branch == 'undefined' )
		 branch			= branchcache[executive.branchId];
	
	jsondata.taxes	= taxModelHm[accountGroupId + "_" + branch.companyHeadMasterId];
	$('#taxes').empty();
	resetTaxes();
	setTaxes();
}

function setDeliveryToDoorDeliveryOnOperationBranch() {
	if(configuration.setDoorDeliveryOnOpearationalBranch == 'true')
		createDeliveryTo();
}

function nextPrevAfterQuntity() {
	if(configuration.setDefaultPackingTypeGroupWise != 'true' || accountGroupId == 566)
		return;
		
	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		next = "qtyAmount";
		prev = "chargeType";
	} else {
		next = "add";
		prev = "chargeType";
	}
 }

function setFocusOnSequenceTypeSelection(event) {
	if(getKeyCode(event) == 27)
		$('#SequenceTypeSelection').focus();
}

function bindEventOnDeliveryTo() {
	$( "#deliveryTo" ).keyup(function() {
		checkDeliveryDeatails();
		checkForDoorDeliveryForDeliveryLocations();
		calculateServiceChargeOnPassengerOnChange();
		calculateDoorDlyChargeOnFreightOnChangeDeliveryToDoor();
		if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
		if(typeof calculateRiskCoverageOnDeclaredValue != 'undefined') calculateRiskCoverageOnDeclaredValue();
	});
	
	$( "#deliveryTo" ).change(function() {
		checkDeliveryDeatails();
		checkForDoorDeliveryForDeliveryLocations();
		calculateServiceChargeOnPassengerOnChange();
		calculateDoorDlyChargeOnFreightOnChangeDeliveryToDoor();
		setExpressChargeWiseDeliveryToOption(this);
		addAddressFieldOnOperationalBranch(this);
		setPrefixValueOnPrivateMarkField();
		setFreightUptoDestOnDoorDly();
		if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
		if(typeof calculateRiskCoverageOnDeclaredValue != 'undefined') calculateRiskCoverageOnDeclaredValue();
		disableChargesOnPassengerBooking();
	});
	
	$( "#deliveryTo" ).keypress(function(event) {
		if(getKeyCode(event) == 17){return false;} else {checkDeliveryDeatails()};
	});
	
	$( "#deliveryTo" ).blur(function() {
		hideInfo();validateDeliveryAt();
	});
	
}

function resetDataForTokenBooking() {
	resetBillingParty();
	resetDestination();
	resetSourceBranch();
	resetLrNumberManual();
	resetLrDate();
	resetArticleDetails();
	resetPartyData();
	resetConsineePartyData();
	resetBillingPartyData();
	resetConsignementGoods();
	resetArticleWithTableAfterSave();
	
	showMessage('info', iconForErrMsg + ' Please, Select same LR Type Token Number !');
	isTokenWayBill = false;
}

function resetDataOnWayBillType(key) {
	if(!consignorNameAutocomplete) {
		configuration.ConsignorNameAutocomplete	= 'false';
		
		try {
			if(configuration.ConsignorNameAutocompleteOnPanelType2 == 'false')
				$( "#consignorName" ).autocomplete( "destroy" );
		} catch(err) {
			//console.log(err);
		}
	}
		
	switch (key) {
	case 'F7':  
	case 'F8':
	case 'F10':
		setSourceToAutoCompleteConsignor();
		break;
	case 'F9':
		setSourceToAutoCompleteConsignor();
		
		if(configuration.showTBBPartyNameInConsignor == 'true'){
			var subregionIds = configuration.subRegionIdsForTbbPartyInConsignor;
			var headOfficeSubregionArr = subregionIds.split(",");
		}
		
		if (!consignorNameAutocomplete) {
			if(configuration.showTBBPartyNameInConsignor == 'true')
				configuration.ConsignorNameAutocomplete	= 'true';
			else
				configuration.ConsignorNameAutocomplete	= 'false';
			
			setConsignorNameAutoComplete();
		}
		
		if(configuration.showTBBPartyNameInConsignor == 'true' && (isValueExistInArray(headOfficeSubregionArr, executive.subRegionId)
				|| isValueExistInArray(headOfficeSubregionArr, 0))) {		//(Head-office subRegionId)
			setSourceToAutoComplete('consignorName', "Ajax.do?pageId=9&eventId=18&billing=4&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&responseFilter="+configuration.BookingBillingPartyNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName);
		}
		
		break;
	}
	
	if (isInsuranceServiceAllow)
		invoiceDetailArray = [];
}

function setSourceToAutoCompleteConsignor() {
	try {
		if (configuration.ConsignorNameAutocomplete == 'true' && configuration.fetchDataByRedisCache != 'true')
			setSourceToAutoComplete('consignorName', "Ajax.do?pageId=9&eventId=18&customerType=" + PartyMaster.PARTY_TYPE_CONSIGNOR + "&responseFilter=" + configuration.BookingConsignorNameAutocompleteResponse + "&isBlackListPartyCheckingAllow=" + configuration.isBlackListPartyCheckingAllow + "&moduleFilterForBlackListPartyChecking=1&showRateConfiguredSignInPartyName=" + configuration.ShowRateConfiguredSignInPartyName);
	} catch(err) {
	//console.log(err);
	}
}

function bindEventOnBookingType() {
	$( "#bookingType" ).change(function() {
		changeOnBookingType(); 
		resetOnChargeTypeExcludingPackageDetails();
		setBookingTypeWiseSequenceCounter();
		checkForDoorDeliveryForDeliveryLocations();
		resetArticleWithTable();
	});
							
	$( "#bookingType" ).keyup(function() {
		changeOnBookingType();
		setBookingTypeWiseSequenceCounter();
		checkForDoorDeliveryForDeliveryLocations();
	});
							
	$( "#bookingType" ).focus(function() {
		changeOnBookingType();
	});
}

function bindEventOnSubRegion() {
	$( "#subRegion" ).keyup(function(event) {
		if(getKeyCode(event) == 8 || getKeyCode(event) == 46){
			removeOption('DestBranchIdEle', null);
			createOption('DestBranchIdEle', 0, '--Select Destination--');
 			resetSubRegion();
		}
	});
				
}

function bindEventOnDestBranchEle() {
	$('#DestBranchIdEle').on('change', function() {
		let selectedBranchId 	= $(this).val(); // Get the selected branch ID
		let selectedBranchName 	= $(this).find('option:selected').text(); // Get the selected branch name

		if($('#DestBranchIdEle').val() != undefined && Number(selectedBranchId) > 0) {
			$('#destination').val(selectedBranchName);
			$('#destinationBranchId').val(Number(selectedBranchId));
			setDestinationDetails(Number(selectedBranchId));
			//getDestinationBranchDetailsById(Number(selectedBranchId));
		} else {
			resetDestination();
			resetDestinationPointData();
			resetArticleWithTable();
			resetWeight();
			resetSpecificCharges();
		}
	});			
}

function bindEventOnDestination() {
	$( "#destination" ).keyup(function(event) {
		if(getKeyCode(event) == 8 || getKeyCode(event) == 46)
			resetDestinationPointData();
		
		if(typeof enableInsuranceChargeForBranch != 'undefined') enableInsuranceChargeForBranch();
	});
							
	$( "#destination" ).blur(function() {
		hideInfo();
		if(typeof enableInsuranceChargeForBranch != 'undefined') enableInsuranceChargeForBranch();
		validateDateDestOvernitecarrier();
		validateDestinationSubRegionForDDDVBooking();
		setDeliveryToDoorDeliveryOnOperationBranch();
	});
							
	$( "#destination" ).keydown(function(event) {
		hideAllMessages();removeError('destination');
		validateDeliveryInput(event);
		if(typeof enableInsuranceChargeForBranch != 'undefined') enableInsuranceChargeForBranch();
	});

	if(configuration.destinationBranchWisePartyMapping == 'true') {	
		$("#destination").change(function() {
			resetConsignee();
		});
	}
	
	if(configuration.freightUptoDestSameAsDestOnDoorDly == 'true'){
		$("#destination").keyup(function() {
				setFreightUptoDestOnDoorDly();
			});
	}
	
}

function bindEventOnMultipleInvoiceDetails() {
	setTimeout(function() {
		$("#addMutipleInvoice").bind("click", function() {
			addMultipleInvoiceDetails();
		});
		
		$("#viewMultipleInvoice").bind("click", function() {
			viewMultipleInvoiceDetails();
		});
	},200);
}

function bindEventOnFormNumber() {
	$( "#singleFormTypes" ).change(function() {
		singleSelectFormType(this);
	});
	
	$( "#singleFormTypes" ).blur(function() {
		selectFormValidation();
	});
	
	$( "#singleFormTypes" ).keyup(function(event) {
		if(event.which == 13){setEwayBillFocus();setNextPrevAfterFormType();}
	});
	
	$( "#formNumber" ).keyup(function(event) {
		validateFormNumberInput(event);
	});
	
	$( "#formNumber, #sugamNumber, #hsnNumber, #sacNumber" ).keypress(function(event) {
		if(getKeyCode(event) == 17){return false;}
	});
	
	$( "#formNumber" ).keydown(function(event) {
		validateEWayBillNumberOnDeclareValue(event);
	});
	
	$( "#sugamNumber" ).keyup(function(event) {
		validateESugamNumberInput(event);
	});
	
	$( "#ewayBillNumber" ).keypress(function(event) {
		if(!allowDecimalCharacterOnly(event)) return false;
		if(getKeyCode(event) == 17){return false;};
		validateEWayBillNumberOnDeclareValue(event);
	});
	
	$( "#ewayBillNumber" ).keydown(function(event) {
		validateEWayBillNumberOnDeclareValue(event);
	});
	
	$( "#ewayBillNumber" ).keyup(function(event) {
		validateEWayBillNumberOnDeclareValue(event);
	});
	
	$("#addMutipleEwayBill").bind("click", function() {
		addMultipleEwayBillNo();
	});
	
	$("#viewEwayBill").bind("click", function() {
		viewEwayBillNo();
	});
}

function addAddressFieldOnOperationalBranch(id) {
	if(configuration.calculateDestBranchToDoorDlyDistance != 'true'){
		$('#branchAddress').hide();
		return;
	}
	
	if(($('#typeOfLocation').val() != Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) &&  id !=undefined && id.id !="deliveryTo")
		resetDeliveryTo();
	
	if(($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) || ($('#sourceTypeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) || ($('#deliveryTo').val() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)){
		$('#branchAddress').show();
		$( "#dest_search" ).focus();
		prev = "destination";
		$('#deliveryTo').val(InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID);
	} else{
		$('#branchAddress').hide();
		$('#dest_search').val('');
	}
}

function changeDestinationToolTip(event){
	if(accountGroupId == 201)
		showInfo(event,'Delivery Destination / Pincode');
}

function resetDoorDeliveryPinCode(){
	doorDeliveryAddressPinCode = 0;
	destLatitude = 0;
	destLongitude = 0;
}

function setGoodsClassification() {
	if(configuration.goodsClassificationSelection == 'false')
		return;

	var goodsClassificationList	= jsondata.GoodsClassificationList;
	
	if(goodsClassificationList == undefined)
		return;
		
	$('#goodsClassificationCol').css('display', 'inline');
	
	removeOption('goodsClassification', null);
	
	for(let i = 0; i < goodsClassificationList.length; i++) {
		createOption('goodsClassification', goodsClassificationList[i].goodsClassificationId, goodsClassificationList[i].goodsClassificationName);
	}
}

function showHideDDDVBookingTypeLRTypeWise(wayBillType) {
	if(configuration.showLRTypeWiseDDDVBookingType == 'false')
		return;

	var lrTypesArrayForDDDVBookingType	= (configuration.LRTypesToShowDDDVBookingType).split(',');

	if(isValueExistInArray(lrTypesArrayForDDDVBookingType, wayBillType))
		createDDDVOption();
	else
		removeOption('bookingType', TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID);
}

function showLRTypeWiseBookingAmountToGroupAdmin(wayBillType) {
	if(configuration.ShowLRTypeWiseBookingAmountToGroupAdmin == 'true') {
		var wayBillTypeArr 	= (configuration.LRTypeToShowBookingAmountToGroupAdmin).split(',');
			
		if(isValueExistInArray(wayBillTypeArr, wayBillType) && executive.executiveType != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
			switchHtmlTagClass('chargesbg', 'hide', 'show');
				
			if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				switchHtmlTagClass('artAmt', 'hide', 'show');
				switchHtmlTagClass('weightRateDiv', 'show', 'hide');
			} else if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT
				|| Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER) {
				switchHtmlTagClass('artAmt', 'show', 'hide');
				switchHtmlTagClass('weightRateDiv', 'hide', 'show');
			}
		} else if(!isValueExistInArray(wayBillTypeArr, wayBillType)) {
			switchHtmlTagClass('chargesbg', 'show', 'hide');
			switchHtmlTagClass('artAmt', 'show', 'hide');
			switchHtmlTagClass('weightRateDiv', 'show', 'hide');
		}
	}
}

function bindEventOnETA() {
	if (!jsondata.showEstimatedTimeArrival)
		return;
	
	$("#ETA").click(function () {
		getCityList();//commonFunctionForCreateWayBill.js
		resetETAData();
	});
	
	$("#etaSourceCityId").change(function () {
		getBranchList($(this).val(), 'ETABranchId');//commonFunctionForCreateWayBill.js
	});
	
	$("#etaDestinationCityId").change(function () {
		getBranchList($(this).val(), 'ETAdestinationBranchId');//commonFunctionForCreateWayBill.js
	});
	
	$("#etaTxnDetailsBtn").click(function () {
		if(validateSelectionForETA()) {
			hoursToShow();//commonFunctionForCreateWayBill.js
			showETARate();//commonFunctionForCreateWayBill.js
		}
	});
	
	$("#etaSourceCityId").change(function () {
		$('#ratePara').html('');
		$('#hourspara').html('');
	});
	
	$("#etaDestinationCityId").change(function () {
		$('#ratePara').html('');
		$('#hourspara').html('');
	});
	
	$("#ETABranchId").change(function () {
		$('#ratePara').html('');
		$('#hourspara').html('');
	});
	
	$("#ETAdestinationBranchId").change(function () {
		$('#ratePara').html('');
		$('#hourspara').html('');
	});
}

function bindEventsOnDifferentFeilds() {
	allowSpecialCharacterForPartyName		= configuration.allowSpecialCharacterForPartyName == 'true' || configuration.allowSpecialCharacterForPartyName == true;
	allowedSpecialCharactersForPartyName	= configuration.allowedSpecialCharactersForPartyName;
					
	bindEventOnConsignorPartyCode();
	bindEventOnConsigneePartyCode();
	bindEventOnConsignorName();
	bindEventOnConsigneeName();
	bindEventOnBillingParty();
	bindEventOnConsignorPhone();
	bindEventOnConsigneePhone();
	bindEventOnConsignorGSTN();
	bindEventOnConsigneeGSTN();
	bindEventOnBillingGSTN();
	bindEventOnConsignorTinNumber();
	bindEventOnConsigneeTinNumber();
	bindFocusOnAddButton();
	bindFocusOnLastCharge();
	bindFocusOnChequeNo();
	bindFocusOnActWeight();
	bindFocusOnQuantity();
	bindEventOnDirectorId();
	setGSTPaidByOnAmount();
	addAddressFieldOnOperationalBranch();
	bindEventOnNewPartyGstNumber();
	bindEventOnETA();
	showTooltipForPackingType();
	bindEventOnConsigneeAddress();
	bindEventOnInvoiceNo();
	bindEventOnDivisionField();
}

function bindFocusOnChequeNo(){
	if (configuration.PaymentType == 'true') {
		if(configuration.PaymentTypeCheque == 'true'){
			$("#paymentType").keyup(function (){
				setFocusOnChequeNo(this);
			});
		}
	}
}

function bindFocusOnActWeight(){
	if(configuration.setNextAfterActWeight == 'true') {
		$("#actualWeight").keyup(function (){
			setFocusOnPrivateMarkAfterActualWeight(this);
		});
	}
}

function bindFocusOnQuantity(){
	if(configuration.setFocusOnQuantityAfterLBHHeight == 'true') {
		$("#height").keyup(function (){
			setFocusOnQuantityAfterLBHHeight(this);
		});
	}
}

function bindEventOnConsignorName() {
	$( "#consignorName" ).keyup(function(event) {
		validateAddressSuggestion();
		
		if(getKeyCode(event) > 0 && getKeyCode(event) != 13 && getKeyCode(event) == 27) {
			resetPartyData(); 
			resetCorporateData();
		}

		if(configuration.partyPanelType != '2' && (getKeyCode(event) == 8 || getKeyCode(event) == 46) 
			&& event.key != '.') {
			resetPartyData();
			resetCorporateData();
		}

		validateConsignorNameInput(event);
		
		if(configuration.partyPanelType == '2')
			bindNextElementFocusOnConsignorName();
		else if(event.which == 13)
			setNextPrevAfterConsignorName();
	});
	
	$( "#consignorName" ).keypress(function(event) {
		if(configuration.partyPanelType == '2') {
			if(getKeyCode(event) == 17){return false;}
			
			if(getKeyCode(event) == 13 && configuration.gstnNumber == 'false') {
				if(!checkForNewParty('consignorName')){getCorporateAccountId();} 
			}
			
			if(!allowSpecialCharactersIn(event, 'consignorName')) {
				event.preventDefault(); return false;
			}
		} else {
			if(getKeyCode(event) != 13 && (getKeyCode(event) == 8 || getKeyCode(event) == 46)
						&& event.key != '.') {
				resetPartyData();
				resetCorporateData();
			} 
			
			if(getKeyCode(event) == 17){return false;}
			
			if(!allowSpecialCharactersIn(event, 'consignorName')) {
				event.preventDefault(); return false;
			} else if(configuration.isAllowAlphnumericWithSpecialCharacters == 'true'
				&& !allowAlphaNumericAndSpecialCharacters(event)) return;
			
			if(getKeyCode(event) == 13 && (configuration.partyPanelType == '3' || configuration.savePartyAfterName == 'true')
										&& configuration.savePartyAfterGstNumber == 'false' && configuration.SavePartyAfterTinNumber == 'false') {
				if(!checkForNewParty('consignorName')){getCorporateAccountId();} 
			}
		}
	});
	
	$( "#consignorName" ).blur(function(event) {
		hideInfo(); 
		
		if(!allowSpecialCharactersIn(event, 'consignorName')) {
			$( "#consignorName" ).val('');
			return false
		}
			
		if(configuration.partyPanelType == '2' || configuration.partyPanelType == '3') {
			//if(! checkForNewParty('consignorName')){getCorporateAccountId();} 
		} else {
			clearNewForSting(this); 
			calculateDestBranchToDoorDlyDistance();
		}

		setLrChargeForNwParty();
	});
}

function bindEventOnConsigneeName() {
	$( "#consigneeName" ).keyup(function(event) {
		validateAddressSuggestion();
		
		if(configuration.partyPanelType != '2' 
			&& getKeyCode(event) > 0 && getKeyCode(event) != 13 && (getKeyCode(event) == 27 || getKeyCode(event) == 8 || getKeyCode(event) == 86)) {
			resetConsineePartyData();
		}
		
		validateConsigneeNameInput(event);
		
		if(configuration.partyPanelType == '2')
			bindNextElementFocusOnConsigneeName();
		else if(event.which == 13)
			setNextPrevAfterConsigneeName();
	});
	
	$( "#consigneeName" ).keypress(function(event) {
		if(configuration.partyPanelType == '2') {
			if(getKeyCode(event) == 17){return false;}
			
			if(getKeyCode(event) == 13 && configuration.gstnNumber == 'false') {
				if(!checkForNewParty('consigneeName')){getCorporateAccountId();} 
			}
			
			if(!allowSpecialCharactersIn(event, 'consigneeName')) {
				event.preventDefault(); return false;
			}
		} else {
			if(getKeyCode(event) != 13)
				resetConsineePartyData();
			
			if(getKeyCode(event) == 17){return false;}
			
			if(!allowSpecialCharactersIn(event, 'consigneeName')) {
				event.preventDefault(); return false;
			} else if(configuration.isAllowAlphnumericWithSpecialCharacters == 'true'
				&& !allowAlphaNumericAndSpecialCharacters(event)) return;
			
			if(getKeyCode(event) == 13 && (configuration.partyPanelType == '3' || configuration.savePartyAfterName == 'true')
										&& configuration.savePartyAfterGstNumber == 'false' && configuration.SavePartyAfterTinNumber == 'false') {
				if(!checkForNewParty('consigneeName')){getCorporateAccountId();} 
			}
			
		}
	});
	
	$("#consigneeName").blur(function(event) {
		hideInfo();

		if (!allowSpecialCharactersIn(event, 'consigneeName')) {
			$("#consigneeName").val('');
			return false
		}

		if (configuration.partyPanelType == '2' || configuration.partyPanelType == '3') {
			//if(! checkForNewParty('consignorName')){getCorporateAccountId();} 
		} else {
			clearNewForSting(this);
			validateDoorDeliveryPincodeWithDestination();;
		}

		setLrChargeForNwParty();
	});
}

function bindEventOnConsignorPhone() {
	$( "#consignorPhn" ).keyup(function(event) {
		showInfo(this, configuration.consignorFeildLebel + " Phone");
		validateConsignorMobileInput(event);
		
		if((configuration.partyPanelType == '3' || configuration.partyPanelType == '2') && getKeyCode(event) > 0 && (getKeyCode(event) == 8 || getKeyCode(event) == 46)) {
			resetPartyData();
			resetCorporateData();
		}
	});
	
	$( "#consignorPhn" ).keypress(function(event) {
		if(getKeyCode(event) == 13 && configuration.partyPanelType == '1' && configuration.savePartyAfterGstNumber == 'false'
				&& configuration.savePartyAfterName == 'false' && configuration.SavePartyAfterTinNumber == 'false'
				&& !checkForNewParty('consignorName')) {
			getCorporateAccountId();
		}
		
		if(getKeyCode(event) == 17){return false;}
		return noNumbers(event);
	});
	
	$( "#consignorPhn" ).blur(function() {
		hideInfo(); 
		
		if(configuration.partyPanelType == '2' || configuration.partyPanelType == '3') {
			hideInfo();
			clearNew(this);
		}
		
		clearNewForSting(this);
		
		if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consignorPhn").val().includes("*")) {
			if (!$("#consignorPhn").val().includes("*"))
				clearIfNotNumeric(this, '');
		} else
			clearIfNotNumeric(this, '');
				
		setTimeout(function() { validateConsignorMobile()}, 200);
		setTimeout(function() { blockBookingOnMobileNumber(this);}, 200);
	});
}

function bindEventOnConsigneePhone() {
	$( "#consigneePhn" ).keyup(function(event) {
		showInfo(this, configuration.consigneeFeildLebel + " Phone");
		validateConsigneeMobileInput(event);
		
		if((configuration.partyPanelType == '2' || configuration.partyPanelType == '3') 
				&& getKeyCode(event) > 0 && getKeyCode(event) != 13 && (getKeyCode(event) == 27 || getKeyCode(event) == 8)) {
			resetConsineePartyData();
		}
	});
	
	$( "#consigneePhn" ).keypress(function(event) {
		if(getKeyCode(event) == 13 && configuration.partyPanelType == '1' && configuration.savePartyAfterGstNumber == 'false'
				&& configuration.savePartyAfterName == 'false' && configuration.SavePartyAfterTinNumber == 'false'
				&& !checkForNewParty('consigneeName')) {
			getCorporateAccountId();
		}
		
		if(getKeyCode(event) == 17){return false;}
		return noNumbers(event);
	});
	
	$( "#consigneePhn" ).blur(function() {
		hideInfo(); 
		
		if(configuration.partyPanelType == '2' || configuration.partyPanelType == '3') {
			hideInfo();
			clearNew(this);
		}
		
		if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consigneePhn").val().includes("*")) {
			if (!$("#consigneePhn").val().includes("*"))
				clearIfNotNumeric(this, '');
		} else
			clearIfNotNumeric(this, '');
			
		setTimeout(function() { validateConsigneeMobile() }, 200);
		setFocusForTokenBooking();
		setTimeout(function() { blockBookingOnMobileNumber(this);}, 200);
	});
}

function bindEventOnConsignorGSTN() {
	$( "#consignorGstn, #consignoCorprGstn").keyup(function(event) {
		showInfo(this, 'GST Number');
		
		if(configuration.partyPanelType == '3') {
			if(getKeyCode(event) == 8 || getKeyCode(event) == 46){resetPartyData();resetCorporateData();}
		}
		
		if(isGSTNumberWiseBooking() && configuration.partyPanelType == '1'  && configuration.resetConsignorDetailsOnGstNumberChange == 'true')
			if(getKeyCode(event) == 8 || getKeyCode(event) == 46){resetPartyData();resetCorporateData(); resetConsignor()}

		calcGrandtotal();
		setSTPaidByOnGSTNumber();
		resetPartyDetailsOnGSTNumberChange(this.id);	
		
		if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true'
			 && isConsignorGstnValidatedFromApi && event.target.value === '') {
			resetConsignor();
			isConsignorGstnValidatedFromApi = false;
			isValidConsignorGst	= false;
		}
	});
	
	$( "#consignorGstn, #consignoCorprGstn" ).keypress(function(event) {
		if(getKeyCode(event) == 17){return false;}
		if(!allowOnlyAlphanumeric(event)) {return false;}
		
		if(getKeyCode(event) == 13) {
			//validateGSTNumberByApi(1); // stop two times hit (onBlur and enter btn)
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consignorName'))
				getCorporateAccountId();
		}
	});
	
	$( "#consignorGstn, #consignoCorprGstn" ).blur(function(e) {
		hideInfo();

		validateLRTypeWiseConsignorGSTNumber();
		
		validateGstNumberWhenExistingGSTNumberRemoved(this.id);
		
		setTimeout(function() { 
			if(gstNoValidation(e.target.id))
				validateGSTNumberByApi1(PartyMaster.PARTY_TYPE_CONSIGNOR);
		}, 1000);
			
		//if(!isGSTNumberWiseBooking()) {
			validateLengthOfConsinorGSTNumber();
			if(!blockBookingOnGSTNumber(this)) {return;}
		//}
		
		if(configuration.partyPanelType == '1') {
			getPartyDetailsByGstn(1);
			validateSTPaidByOnGSTN();
		}
	});
	
	$( "#consignorGstn, #consignoCorprGstn" ).keydown(function(event) {
		hideAllMessages();
		removeError('consignorGstn');
		removeError('consignoCorprGstn');
		
		if(configuration.partyPanelType != '3' && !isGSTNumberWiseBooking())
			validateConsignorGstnInput(event);
			
		if(getBrowserName() == 'chrome' && getKeyCode(event) == 13) {
			validateGSTNumberByApi(1);
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consignorName'))
				getCorporateAccountId();
		} 
		
		if(getKeyCode(event) == 9) {
			validateGSTNumberByApi(1);
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consignorName'))
				getCorporateAccountId();
		}
	});
}

function bindEventOnBillingGSTN() {
	$( "#billingGstn").keyup(function(event) {
		showInfo(this, 'GST Number');

		calcGrandtotal();
		setSTPaidByOnGSTNumber();
	});
	
	$( "#billingGstn" ).keypress(function(event) {
		if(getKeyCode(event) == 17){return false;}
		if(!allowOnlyAlphanumeric(event)) {return false;}
	});
	
	$( "#billingGstn" ).blur(function(e){
		hideInfo();
		
		validateLRTypeWiseBillingGSTNumber();
		validateGstNumberWhenExistingGSTNumberRemoved(this.id);
		validateLengthOfConsinorGSTNumber();
		if(!blockBookingOnGSTNumber(this)) {return;}
		validateSTPaidByOnGSTN();
	});
	
	$( "#billingGstn" ).keydown(function(event) {
		hideAllMessages();
		removeError('billingGstn');
		validateBillingGstnInput(event);
	});
}

function bindEventOnConsigneeGSTN() {
	$( "#consigneeGstn, #consigneeCorpGstn" ).keyup(function(event) {
		showInfo(this, 'GST Number');
		
		if(configuration.partyPanelType == '3') {
			setNextPrevAfterConsigneeGstn();
			
			if(getKeyCode(event) > 0 && getKeyCode(event) != 13 && (getKeyCode(event) == 27 || getKeyCode(event) == 8))
				resetConsineePartyData();
		} else if(configuration.partyPanelType == '1')
			setNextPrevAfterConsigneeGstn();
		
		calcGrandtotal();
		setSTPaidByOnGSTNumber();
		resetPartyDetailsOnGSTNumberChange(this.id);
		
		if((configuration.disablePartyFeildsWhenDataValidateFromGSTApi == true || configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true')  && isConsigneeGstnValidatedFromApi && event.target.value === ''){ 
			resetConsignee();
			isConsigneeGstnValidatedFromApi = false;
			isValidConsigneeGst	= false;
		}
		
		if (configuration.businessTypeSelection == 'true') {
			next = 'businessType'
			bindEventOnBusinessType();
		}
	});
	
	$( "#consigneeGstn, #consigneeCorpGstn" ).keypress(function(event) {
		if(getKeyCode(event) == 17){return false;}
		if(!allowOnlyAlphanumeric(event)) return;
		
		if(getKeyCode(event) == 13) {
			//validateGSTNumberByApi(2); // stop two times hit (onBlur and enter btn)
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consigneeName'))
				getCorporateAccountId();
		}
	});
	
	$( "#consigneeGstn, #consigneeCorpGstn" ).blur(function(e) {
		hideInfo();
		
		validateGstNumberWhenExistingGSTNumberRemoved(this.id);
		
		setTimeout(function() { 
			if(gstNoValidation(e.target.id))
				validateGSTNumberByApi1(PartyMaster.PARTY_TYPE_CONSIGNEE);
		}, 1000);
		
		//if(!isGSTNumberWiseBooking()) {
			validateLengthOfConsineeGSTNumber();
			if(!blockBookingOnGSTNumber(this)) {return;}
		//}
		
		if(configuration.partyPanelType == '1') {
			getPartyDetailsByGstn(2);
			validateSTPaidByOnGSTN();
		}
	});
	
	$( "#consigneeGstn, #consigneeCorpGstn" ).keydown(function(event) {
		hideAllMessages();
		removeError('consigneeGstn');
		removeError('consigneeCorpGstn');
		
		if(configuration.partyPanelType != '3' && !isGSTNumberWiseBooking())
			validateConsigneeGstnInput(event);
			
		if(getBrowserName() == 'chrome' && getKeyCode(event) == 13) {
			validateGSTNumberByApi(2);
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consigneeName'))
				getCorporateAccountId();
		}
		
		if(getKeyCode(event) == 9) {
			validateGSTNumberByApi(2);
			
			if (configuration.partyPanelType != '3' && configuration.savePartyAfterGstNumber == 'true' && !checkForNewParty('consigneeName'))
				getCorporateAccountId();
		}
	});
}

function bindEventOnConsignorTinNumber() {
	$( "#consignorTin" ).keypress(function(event) {
		//getDataByTinNumber(this, 1);
		if(getKeyCode(event) == 17){return false;}
		
		if(!noNumbers(event)) return false;
		
		if (configuration.SavePartyAfterTinNumber == 'true' && !checkForNewParty('consignorName'))
			getCorporateAccountId();
	});
	
	$( "#consignorTin" ).blur(function() {
		hideInfo(); 
		validateConsignorTinNumber();
		
		if(configuration.partyPanelType == '1')
			getDataByTinNumber(this, 1);
	});
}

function bindEventOnConsigneeTinNumber() {
	$( "#consigneeTin" ).keypress(function(event) {
		//getDataByTinNumber(this, 1);
		if(getKeyCode(event) == 17){return false;}
		
		if(!noNumbers(event)) return false;
		
		if (configuration.SavePartyAfterTinNumber == 'true' && !checkForNewParty('consigneeName')) {
			getCorporateAccountId();
		}
	});
	
	$( "#consigneeTin" ).blur(function() {
		hideInfo(); 
		validateConsigneeTinNumber();
		
		if(configuration.partyPanelType == '1')
			getDataByTinNumber(this, 2);
	});
}

function setDirectorList() {
	let directorsList  = jsondata.directorList;	
	
	removeOption('directorId', null);
	
	createOption('directorId', 0, '--Select--');
	
	for(const element of directorsList) {
		createOption('directorId', element.executiveId, element.executiveName);
	}
}

function setNextPrevAfterFoc() {	
	next = "ETA";
	prev = "remark";
}

function bindEventOnDirectorId() {
	$( "#directorId" ).keyup(function(event) {
		if(event.which == 13) {setNextPrevAfterFoc();}
	});
}

function setGSTPaidByOnAmount() {
	$("#"+$("#charges tr:last input")[0].id).blur(function (){
		stPaidByValidation();
	});
}

function bindEventOnLRNumberManual() {
	$( "#lrNumberManual" ).blur(function() {
		clearTxtFeildIfNotNumeric(this,'');hideInfo();regIsDigit(this);
		setNextLRNumberAfterBookingOnAutoBooking();
		checkSequenceRangeInPartyWiseLrSequenceForManualLrField();
		
		if(!isTokenThroughLRBooking)
			checkIfManualLRNumberAndDate();
	});
}

function setBusinessType() {
	let businessTypeList	= jsondata.businessTypeList;
	
	if(businessTypeList == undefined || businessTypeList.length == 0)
		return;
		
	$('.businessTypeSelection').removeClass('hide');
		
	createBusinessTypeOption(businessTypeList);
	
	if(configuration.applyRateOnBusinessTypeSelection == 'true') {
		$('#businessType').removeAttr('disabled');
		
		$( "#businessType" ).change(function() {
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
				getWeightTypeRates();
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
				getPackingTypeRates();
				
			if($('#chargeType').val() == CHARGETYPE_ID_CFT)
				if(typeof getCFTWiseRate != 'undefined') getCFTWiseRate();
			
			if($('#chargeType').val() == CHARGETYPE_ID_CBM)
				if(typeof getCBMWiseRate != 'undefined') getCBMWiseRate();
		});
	}
}

function createBusinessTypeOption(businessTypeList) {
	removeOption('businessType', null);
	
	createOption('businessType', 0, '--Select--');
	
	for(const element of businessTypeList)
		createOption('businessType', element.businessTypeId, element.businessTypeName);
}

function hideAllRateOnBookingPage() {
	if (!jsondata.SHOW_BOOKING_AMOUNT && jsondata.showZeroAmount) {
		let lrTypes	= (jsondata.wayBillTypeIdToShowZeroAmount).split(",");
		
		if (jsondata.charges) {
			if(isValueExistInArray(lrTypes, $('#wayBillType').val()))
				hideChargesAmount();
			else
				showChargesAmount();
		}
	}
}

function hideChargesAmount() {
	var chargeTypeModel = jsondata.charges;
				
	for (const element of chargeTypeModel) {
		var chargeMasterId = element.chargeTypeMasterId;
		$('#charge' + chargeMasterId).prop("readonly", "true");
		$('#charge' + chargeMasterId).css('color', 'transparent');
	}

	$('#totalAmt').css('color', 'transparent');
	$('#totalAmt').prop("readonly", "true");
	$('#weigthFreightRate').css('color', 'transparent');
	$('#weigthFreightRate').prop("readonly", "true");
	$('#weightAmount').css('color', 'transparent');
	$('#weightAmount').prop("readonly", "true");
	$('#discount').prop("readonly", "true");
	$('#discount').css('color', 'transparent');
	$('#grandTotal').prop("readonly", "true");
	$('#grandTotal').css('color', 'transparent');
	$('#agentcommission').prop("readonly", "true");
	$('#agentcommission').css('color', 'transparent');
}

function showChargesAmount() {
	var chargeTypeModel = jsondata.charges;
				
	for (const element of chargeTypeModel) {
		var chargeMasterId = element.chargeTypeMasterId;
		$('#charge' + chargeMasterId).prop("readonly", "false");
		$('#charge' + chargeMasterId).css('color', '');
	}

	$('#totalAmt').css('color', '');
	$('#totalAmt').prop("readonly", "true");
	$('#weigthFreightRate').css('color', '');
	$('#weigthFreightRate').prop("readonly", "false");
	$('#weightAmount').css('color', '');
	$('#discount').prop("readonly", "false");
	$('#discount').css('color', '');
	$('#grandTotal').prop("readonly", "false");
	$('#grandTotal').css('color', '');
	$('#agentcommission').prop("readonly", "false");
	$('#agentcommission').css('color', '');
	
	setNonEditableFreightCharge();
}

function bindEventOnConsignorPartyCode() {
	$("#consignorPartyCode").keyup(function(event) {
		if(getKeyCode(event) > 0 && getKeyCode(event) != 13 && getKeyCode(event) == 27) {
			resetPartyData(); resetCorporateData();
		}
		
		validateConsignorNameInput(event);
		if(getKeyCode(event) == 8 || getKeyCode(event) == 46){resetConsignor();}	
	});
	
	$("#consignorPartyCode").keypress(function(event) {
		if(getKeyCode(event) == 13 && configuration.partyPanelType == '1')
			getPartyDataByPartyCode(this, 1);	
	});
}

function bindEventOnConsigneePartyCode() {
	$("#consigneePartyCode").keyup(function(event) {
		if(getKeyCode(event) > 0 && getKeyCode(event) != 13 && getKeyCode(event) == 27) {
			resetPartyData(); resetCorporateData();
		}
		
		validateConsigneeNameInput(event);
		if(getKeyCode(event) == 8 || getKeyCode(event) == 46){resetConsignee();}	
	});
	
	$("#consigneePartyCode").keypress(function(event) {
		if(getKeyCode(event) == 13 && configuration.partyPanelType == '1')	
			getPartyDataByPartyCode(this, 2);	
	});
}

function resetBusinessType() {
	businessTypeId	= 0;
	
	if(configuration.applyRateOnBusinessTypeSelection == 'true')
		$('#businessType').removeAttr('disabled');
		
	$('#businessType').val(businessTypeId);
}

function bindEventOnNewPartyGstNumber() {
	$("#newPartyGstNumber").keyup(function(event) {
		showInfo(this, 'GST Number');

		if (getKeyCode(event) == 17) { return false; }
		if (!allowOnlyAlphanumeric(event)) return;

		if (getKeyCode(event) == 13) {
			if (partyType == PartyMaster.PARTY_TYPE_CONSIGNOR)
				validateGSTNumberByApi(1);
			else if (partyType == PartyMaster.PARTY_TYPE_CONSIGNEE)
				validateGSTNumberByApi(2);
		}
	});
}

function setCFTUnitSelection() {
	let cftUnitList	= jsondata.cftUnitList;
	
	if(cftUnitList == undefined || cftUnitList.length == 0)
		return;
		
	$('#cftSelectionSpan').removeClass('hide');
		
	removeOption('cftUnit', null);
	
	createOption('cftUnit', 0, '--Select--');
	
	for(const element of cftUnitList)
		createOption('cftUnit', element.cftUnitId, element.cftUnitName);
		
	if(configuration.defaultCFTUnit > 0)
		$('#cftUnit').val(configuration.defaultCFTUnit);
		
	$( "#cftUnit" ).change(function() {
		if(typeof filterCFTValueOnCFTUnit !== 'undefined'){
			filterCFTValueOnCFTUnit();
		}
	});
}

function hideAndResetTDS() {
	if($('#wayBillType').val() == Number(WAYBILL_TYPE_PAID)
		&& $('#paymentType').val() != PAYMENT_TYPE_CREDIT_ID
		&& $('#paymentType').val() != PAYMENT_TYPE_CROSSING_CREDIT_ID)
		return;
	
	$('#isTdsRequired').hide();
	resetTDSDetails();
}

function eventOnCFTAmount() {
	$( "#cftAmount" ).keypress(function(event) {
		if(!validAmount(event)) return;
		calculateTotalCftCbmOnChargeType(this);
		if(getKeyCode(event) == 17){return false;}
	});
	
	$( "#cftAmount" ).keyup(function() {
		if(this.value=='0')
			this.value='';
		calculateTotalCftCbmOnChargeType(this);
	});
	
	$( "#cftAmount" ).blur(function() {
		hideInfo();clearIfNotNumeric(this,'0');
		calculateTotalCftCbmOnChargeType(this)
	});
	
	$( "#cftAmount" ).keydown(function() {
		hideAllMessages();removeError('cftAmount');isValidationError=false;
	});
}

function eventOnCBMAmount() {
	$( "#cbmAmount" ).keypress(function(event) {
		if(!validAmount(event)) return;
		calculateTotalCftCbmOnChargeType(this);if(getKeyCode(event) == 17){return false;}
	});
	
	$( "#cbmAmount" ).keyup(function() {
		if(this.value=='0')
			this.value='';
		calculateTotalCftCbmOnChargeType(this);
	});
	
	$( "#cbmAmount" ).blur(function() {
		hideInfo();clearIfNotNumeric(this,'0');
		calculateTotalCftCbmOnChargeType(this);
	});
	
	$( "#cbmAmount" ).keydown(function() {
		hideAllMessages();removeError('cbmAmount');isValidationError=false;
	});
}

function eventOnCFTFreightRate() {
	$( "#cftFreightRate" ).keypress(function(event) {
		if(!validAmount(event)) return;
		calculateTotalCftCbmOnChargeType(this);
		if(getKeyCode(event) == 17){return false;}
	});
	
	$( "#cftFreightRate" ).blur(function() {
		hideInfo();clearIfNotNumeric(this,'0');
		checkIfnotPresent();calculateTotalCftCbmOnChargeType(this);
	});
	
	$( "#cftFreightRate" ).keydown(function() {
		hideAllMessages();removeError('cftAmount');
		calculateTotalCftCbmOnChargeType(this);
	});
}

function eventOnCBMFreightRate() {
	$( "#cbmFreightRate" ).keypress(function(event) {
		if(!validAmount(event)) return;
		calculateTotalCftCbmOnChargeType(this);
		if(getKeyCode(event) == 17){return false;}
	});
	
	$( "#cbmFreightRate" ).blur(function() {
		hideInfo();clearIfNotNumeric(this,'0');checkIfnotPresent();;
		calculateTotalCftCbmOnChargeType(this);
	});
	
	$( "#cbmFreightRate" ).keydown(function() {
		hideAllMessages();removeError('cbmFreightRate');
		calculateTotalCftCbmOnChargeType(this);
	});
}

function bindEventOnBillingParty() {
	$( "#billingPartyName" ).keyup(function(event) {
		if(getKeyCode(event) == 8 || getKeyCode(event) == 46){resetBillingPartyData();}
	});
	
	$( "#billingPartyName" ).keypress(function(event) {
		if(event.altKey == 1){return false;}
		
		if(!allowSpecialCharactersIn(event, 'billingPartyName')) {
			event.preventDefault(); return false;
		}
	});
	
	$( "#billingPartyName" ).blur(function(event) {
		hideInfo();
		
		if (!allowSpecialCharactersIn(event, 'billingPartyName')) {
			$('#billingPartyName').val('');
			return false
		}
		
		autoCompleteListCount = null; validateTBBPartyInput();
	});

	$( "#billingPartyName" ).keydown(function(event) {
		hideAllMessages();removeError('billingPartyName');validateBillingPartyNameInput(event);
	});
	
}

function createBranchServiceTypeOption(branchServiceTypeList) {
	removeOption('branchServiceTypeId', null);
	createOption('branchServiceTypeId', 0, '--Select Delivery Type--');

	for (const element of branchServiceTypeList) {
		createOption('branchServiceTypeId', element.branchServiceTypeId, element.branchServiceTypeName);
	}
	
	setDefaultBranchServiceType();
}

function setDefaultBranchServiceType() {
	$('#branchServiceTypeId').val(configuration.defaultBranchServiceType);
}

function createTransportationCategoryOption(transportationCategoryList) {
	removeOption('transportationCategory', null);
	
	for(const element of transportationCategoryList)
		createOption('transportationCategory', element.transportCategoryId, element.transportCategoryName);
}

function setSequenceCounterOnCheckBox() {
	var isSourceBranchWiseSeqCounter = document.getElementById("isSourceBranchWiseSeqCounter");
	var sourceBranchId = Number($('#sourceBranchId').val());

	if (isSourceBranchWiseSeqCounter.checked) {
		isExecutiveBranchWiseSeqCounterChecked = false;
		
		if(sourceBranchId > 0)
			getSourceBranchWiseManualLrSequence(sourceBranchId);

	} else {
		isExecutiveBranchWiseSeqCounterChecked = true;
		getSourceBranchWiseManualLrSequence(executive.branchId);
	}

}
function changeBranchServiceType(){
		resetDestination();
}
function changeDeliveryTo(){
		resetDestination();
}

function bindEventOnConsigneeAddress(){
	$("#consigneeAddress").keyup(function() {
		showInfo(this, 'Consignee Address');
		
	if(configuration.consigneeAddress == 'true' && configuration.setFocusOnConsigneeAddressAfterGst == 'true') {	
		next = "chargeType";
		prev = "consigneeGstn";
	 }
  });
}

function bindEventOnInvoiceNo() {
	$("#invoiceNo").blur(function() {
		hideInfo();selectFormValidation();invoiceNumberValidationInADay();
		
		if(isInsuranceServiceAllow)
			setInvoiceDetailsForInsurance();
		
		return invoiceNumberMandatatoryOnFocus();
	});
	
	$("#invoiceNo").keydown(function(event) {
		hideAllMessages();removeError('invoiceNo');validateInvoiceNoInput(event);
		if(getKeyCode(event) == 13){validateInvoiceOnDeclaredValue();} invalidInvoiceNumber = true;
	});
}

function setDeclredValueOnFoc() {
	if (configuration.doNotSetDefaultDeclaredValueOnFOC == 'true')
		$('#declaredValue').val(Number($('#wayBillType').val()) == WAYBILL_TYPE_FOC ? 0 : configuration.DefaultDeclaredValue);
}

function setGSTPerSelection() {
	let taxArr = configuration.bookingTaxPercent.split(',');
	
	removeOption('gstSelection', null);
	createOption('gstSelection', 0, 'Select Percentage');

	for(per of taxArr)
		createOption('gstSelection', per, per + '%');
}

function changeGSTPercent() {
	if(parseInt($('#gstSelection').val()) > 0){
		resetGSTTaxes(parseInt($('#gstSelection').val(), 10));
		calcGrandtotal();
	}
}

function resetGSTTaxes(taxValue) {
	let sgstAndCgstAmn	= taxValue / 2;
		
	$('#SGST').text('SGST ' + sgstAndCgstAmn.toFixed(2) + '%');
	$('#CGST').text('CGST ' + sgstAndCgstAmn.toFixed(2) + '%');
	$('#IGST').text('IGST ' + taxValue.toFixed(2) + '%');
	
	var taxes = jsondata.taxes;
	
	if(taxes != undefined && taxes.length > 0){
		taxes[0].taxAmount = taxValue / 2;
		taxes[1].taxAmount = taxValue / 2;
		taxes[2].taxAmount = taxValue;
	}
}

function checkTaxTypeForTaxCalculation() {
	var billSelectionId = Number($('#billSelection').val());
	var taxTypeId 		= Number($('#taxTypeId').val());

	setSTPaidOnTaxType(billSelectionId,taxTypeId);
	
	if(configuration.allowTaxTypeWiseCategoryType == 'true') {
		let taxTypeIds = (configuration.taxTypeIdMapWithCategoryTypeId).split(",");
		
		for(const element of taxTypeIds) {
			let taxTypeId_CategoryTypeId = (element).split('_');
			
			if(taxTypeId_CategoryTypeId[0] == taxTypeId)
				$('#categoryType').val(taxTypeId_CategoryTypeId[1]);
		}		
	}
	
	if(configuration.allowTaxTypeWiseTax == 'true') {
		resetTaxes();
		$('#taxes').empty();
		
		if(configuration.hideTaxeDetailsPanel == 'false')
			setTaxes();
		
		calcGrandtotal();
	}
}	

function setSTPaidOnTaxType(billSelectionId,taxTypeId) {
	if(configuration.calculateTaxOnlyOnTaxTypeFCM == 'true') {
		$('#STPaidBy').empty();

		if(billSelectionId > 0 && billSelectionId != BOOKING_GST_BILL) {
			setSTPaidBy();
			removeOption('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
			$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
		} else if($('#taxTypeId').val() != undefined && Number($('#taxTypeId').val()) > 0) {
			if(taxTypeId != FCM) {
				setSTPaidBy();
				removeOption('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
				$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
			} else {
				removeOption('STPaidBy', null);
				createOption('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
				$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
			}
		} else
			setSTPaidBy();
	}
}


function updatePrivateMark() {
	$('#privateMark').val('');

	let privateMarkField = document.getElementById('privateMark');
	
	let asterisk = document.createElement('span');
	asterisk.style.color = 'red';
	asterisk.style.fontSize = '25px';
	asterisk.textContent = '*';

	let parentElement = privateMarkField.parentElement;
	
	if (!parentElement.querySelector('span'))
		parentElement.appendChild(asterisk);
}

function setPrefixValueOnPrivateMarkField() {
	if (configuration.addPrefixInPrivateMarkOnDoorDelivery == 'true') {
		let privateMarkField = $('#privateMark');
		
		if (Number($('#deliveryTo').val()) === DELIVERY_TO_DOOR_ID && !privateMarkField.val().startsWith(configuration.prefixValueInPrivateMarkOnDoorDelivery))
			privateMarkField.val(configuration.prefixValueInPrivateMarkOnDoorDelivery + privateMarkField.val());
		else
			privateMarkField.val('');
	}
}

function setFreightUptoDestOnDoorDly(){
	if(configuration.freightUptoDestSameAsDestOnDoorDly == 'true'){
		if($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && Number($('#deliveryTo').val()) === DELIVERY_TO_DOOR_ID){
			let destBranchName = $('#destination').val();
			let destBranchId = $('#destinationBranchId').val();
		
			$('#freightUptoBranch').val(destBranchName);
			$('#freightUptoBranchId').val(destBranchId);
			enableDisableInputField('freightUptoBranch', 'true');
		}else if($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
			$('#freightUptoBranch').val('');
			$('#freightUptoBranchId').val(0);
			enableDisableInputField('freightUptoBranch', 'false');
		}else if($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_PHYSICAL){
			$('#freightUptoBranch').val('');
			$('#freightUptoBranchId').val(0);
			enableDisableInputField('freightUptoBranch', 'true');
		}
	}
}

function setSubCommodityType() {
	let subCommodityList	= jsondata.subCommodityList;
	subCommodityHM = new Map(subCommodityList.map((obj) => [obj.subCommodityMasterId, obj]));
	createSubCommodityOption('subCommodityType');
	bindEventOnSubCommodityType();
}
 
function createSubCommodityOption(elementId) {
	removeOption(elementId, null);
	createOption(elementId, 0, '--Select SubCommodity--');

	for (const element of jsondata.subCommodityList) {
		if(!element.insuranceRequired)
			createOption(elementId, element.subCommodityMasterId, element.subCommodityDescription + " ( - ) ");
		else
			createOption(elementId, element.subCommodityMasterId, element.subCommodityDescription);
	}
}

function bindEventOnSubCommodityType() {
	$("#subCommodityType").blur(function() {
		setInvoiceDetailsForInsurance();
	});
		
	$("#subCommodityType").change(function() {
		setInvoiceDetailsForInsurance();
	});
}

function setInvoiceDetailsForInsurance() {
	if(!isInsuranceServiceAllow) return;
	
	singleInvoiceDetailsArr = [];
	let subCommodityId = Number($("#subCommodityType").val());
	
	if(subCommodityId > 0) {
		if(!validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg)
		|| !validateInput(1, 'invoiceDate', 'invoiceDate', 'packageError',  invoiceDateErrMsg)
		|| !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg)) {
			showMessage('error', ' Invoice No, Date and Declare Value is mandatory for Insurance !');
			$("#subCommodityType").val(0);
			removeInsuranceCharges();
			return;
		}
		
		if(!validateInvalidSubcommdityForInsurance('subCommodityType', subCommodityId))
			return;
	}
	
	if(subCommodityId == 0) {
		removeInsuranceCharges();
		return;
	}
	
	let singleInvoiceDetailsObject = {};
			
	singleInvoiceDetailsObject.idNum	= 0;
	singleInvoiceDetailsObject.accountGroupId		= accountGroupId;
	singleInvoiceDetailsObject.invoiceNumber		= $('#invoiceNo').val();
	singleInvoiceDetailsObject.invoiceDate			= $('#invoiceDate').val();
	singleInvoiceDetailsObject.declaredValue		= $('#declaredValue').val();
	singleInvoiceDetailsObject.subCommodityMasterId	= $('#subCommodityType').val();
	singleInvoiceDetailsObject.subCommodity			= $("#subCommodityType option:selected").text();
	
	singleInvoiceDetailsArr.push(singleInvoiceDetailsObject);
	
	createInsurance();
}

function bindEventOnBusinessType() {
	$("#businessType").keydown(function (event) {
		hideAllMessages();
		validateBusinessType();
	});
}

function validateInvalidSubcommdityForInsurance(id, subCommodityId) {
	if(subCommodityId > 0) {
		const subCommObj = subCommodityHM.get(Number(subCommodityId));

		if (!subCommObj)
			return false;

		if (!subCommObj.insuranceRequired) {
			$("#" + id).val(0);
			removeInsuranceCharges();
			showMessage('error', 'With Selected Sub Commodity You Cannot Take Insurance !');
			return false;
		}
	}
	
	return true;
}

function createApprovalTypeOption() { 
	removeOption('approvalTypeId', null);
	createOption('approvalTypeId', 0, '--Select--');
	
	for (const element of jsondata.approvalTypeList) {
		createOption('approvalTypeId', element.approvalTypeId, element.approvalTypeName);
	}
}

function createForwardTypeOption() { 
	removeOption('forwardTypeId', null);
	createOption('forwardTypeId', 0, '--Select--');
	
	for (const element of jsondata.forwardTypeList) {
		createOption('forwardTypeId', element.forwardTypeId, element.forwardTypeName);
	}
}

function createOptionForHsnCode() {
	removeOption('hsnCodeId', null);
	createOption('hsnCodeId', 0, '--Select--');

	let hsnCodeList = (configuration.hsnCodeIds).split(',');

	for (const element of hsnCodeList) {
		createOption('hsnCodeId', element.trim(), element.trim());
	}
	
	if(configuration.showHsnCodeBasedOnTransportMode == 'true')
		$('#hsnCodeId').prop("disabled", true);
}

function createOptionForConnectivityFeild() {
	removeOption('connectivityTypeId', null);
	createOption('connectivityTypeId', 0, '--Select--');

	createOption('connectivityTypeId', CONNECTIVITY_TYPE_DIRECT_ID, CONNECTIVITY_TYPE_DIRECT_NAME);
	createOption('connectivityTypeId', CONNECTIVITY_TYPE_INDIRECT_ID, CONNECTIVITY_TYPE_INDIRECT_NAME);
}

function createOptionForVolumetricFeild() {
	removeOption('volumetricFactorId', null);
	createOption('volumetricFactorId', 0, '--Select--');

	let volumetricCalculationAmountList = (configuration.volumetricFactorValuesForVolumetricWeightCalculation).split(',');

	for (const element of volumetricCalculationAmountList) {
		createOption('volumetricFactorId', element, element);
	}
	
	$("#volumetricFactorId").change(function() {
		calculateVolChrgWghtOnVolumetricSelection();
	});	
}

function calculateVolChrgWghtOnVolumetricSelection() {
	let noOfArt		= $('#quantity').val();
	let length 		= $('#articleLength').val();
	let bredth 		= $('#articleBredth').val();
	let height 		= $('#articleHeight').val();
	
	let volume		= Number(length) * Number(bredth) * Number(height) * noOfArt;
	
	if($('#volumetricFactorId').val() > 0)
		$('#artChargeWeight').val((volume / Number($('#volumetricFactorId').val())).toFixed(2));
	else
		$('#artChargeWeight').val(0);
}

function createOptionForTemperature() {
	removeOption('temperature', null);
	createOption('temperature', 0, '--Select Temperature--');
	
	let temperatureList 	= (configuration.tempratureForSelection).split(',');

	for(const element of temperatureList) {
		createOption('temperature', element, element);
	}	
}

function createOptionForDeclaration() {
	if (configuration.showMultipleDeclarationType  == 'true') {
		$('#declarationFeildDiv').addClass('hide');
		$('#declarationNewFeildDiv').removeClass('hide');

		$('declarationNewFeildDiv').show()
		$('declarationFeildDiv').hide()
		
		for (const element of jsondata.declarationTypeList) {
			createOption('declarationTypeId', element.declarationTypeId, element.declarationTypeName);
			
			$('#declarationTypeNewId').append(`
				<li>
					<input type="checkbox" id='${element.declarationTypeId}' name='${element.declarationTypeId}' value='${element.declarationTypeId}'>
					<label for='${element.declarationTypeId}'>${element.declarationTypeName}</label>
				</li>
			`);
		}

		const dropdown = document.getElementById('declarationNewFeildDiv');
		const header = dropdown.querySelector('.dropdown-header');
		const options = dropdown.querySelector('.dropdown-options');

		header.addEventListener('click', () => {
			options.style.display = options.style.display === 'block' ? 'none' : 'block';
		});

		document.addEventListener('click', (e) => {
			if (!dropdown.contains(e.target))
				options.style.display = 'none';
		});
	} else {
		$('#declarationNewFeildDiv').addClass('hide');
		$('#declarationFeildDiv').removeClass('hide');
		
		removeOption('declarationTypeId', null);
		createOption('declarationTypeId', 0, '--Select--');

		for (const element of jsondata.declarationTypeList) {
			createOption('declarationTypeId', element.declarationTypeId, element.declarationTypeName);
		}
	}
}

function setInvoiceDate() {
	if(configuration.showCurrentDateInInvoiceDate == 'true')
		$('#invoiceDate').val(getCurrrentDate());
}

function setBookingPrintDate() {
	let tomorrowDate = new Date(serverCurrentDate);
	tomorrowDate.setTime(tomorrowDate.getTime() + (1000 * 3600 * 24));
	let month = getFormattedMonth(tomorrowDate.getMonth());
	let futureDate = tomorrowDate.getDate() + "-" + month + "-" + tomorrowDate.getFullYear();
	let ddl = document.getElementById('bookingPrintDate');
	let theOption = new Option;
	theOption.text = futureDate;
	theOption.value = futureDate;
	ddl.options[1] = theOption;

	let object = new Object();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/branchBookingConfigTimeMasterWS/getBranchBookingConfigTimeDetails.do',
		data: object,
		dataType: 'json',
		success: function(data) {
			if (data.bookingTimeDatalist != undefined && data.bookingTimeDatalist != '') {
				const cutOffTime = data.bookingTimeDatalist[0].cutOffTime;

				const now = new Date();
				const currentTimeStr = now.toTimeString().slice(0, 5);

				if (currentTimeStr >= cutOffTime)
					$('#bookingPrintDate').val(futureDate);
				else
					$('#bookingPrintDate').addClass('hide');

				hideLayer();
			}
		}
	});
}

function bindEventAndShowLSDetails() {
	$('#dispatchDetailsTable').removeClass('hide');
									
	$("#isManualLS").click(function (event) {
		changeOnLSNumberCheckbox(this.checked);
	});
									
	$("#lsNumber").keypress(function (event) {
		if(getKeyCode(event) == 17){return false;}
										
		if(getKeyCode(event) == 13 && $('#lsNumber').val() != '')
			getLSDetailsForAppend();
	});
									
	if(dispatchLedgerIdForManualLS > 0 && dispatchLedger != undefined) {
		$('#isManualLS').attr('checked', true);
		$('#lsNumber').val(dispatchLedger.lsNumber);
		resetSequenceTypeSelection();
											
		setDispatchDetails();
	}
}

function resetSequenceTypeSelection() {
	if(!(jsondata.AUTO_LR_NUMBER_IN_MANUAL && configuration.allowAutoSequenceOnManual == 'true'))
		return;
	
	$('#sequenceTypepanel').addClass('hide');
	$('#SequenceTypeSelection').val(2);
	setSequeceCounterType();
}

function changeOnLSNumberCheckbox(checked) {
	if(checked) {
		$('#lsNumberDiv').removeClass('hide');
		$('#waybillbookingtypepanel').addClass('hide');
		resetSequenceTypeSelection();
		setWayBillBookingType();
		$('#lsNumber').focus();
	} else {
		$('#paymentType').show();
		$('#lsNumberDiv').addClass('hide');
		$('#waybillbookingtypepanel').removeClass('hide');
		
		if(jsondata.AUTO_LR_NUMBER_IN_MANUAL && configuration.allowAutoSequenceOnManual == 'true')
			$('#sequenceTypepanel').removeClass('hide');
	
		$("#lsNumber").val('');
		$('#dispatchDetails table').empty();
		$('#crossingHireAmountPanel').addClass('hide');
		$('#crossingHireAmount').val(0);
		dispatchLedgerIdForManualLS	= 0;
		crossingAgentId = 0;
		lsBranchId = 0;
	}
}

function setDispatchDetails() {
	if(dispatchLedger == undefined)
		return;
	
	dispatchLedgerIdForManualLS	= dispatchLedger.dispatchLedgerId;
	
	let tr 	= $('<tr>');
	
	tr.append('<td><b>LS Number: </b>'+ dispatchLedger.lsNumber + '</td>');
	tr.append('<td><b>LS Date:  </b>' + dispatchLedger.tripDateTimeForString + '</td>');
	tr.append('<td><b>Vehicle Number:  </b>' + dispatchLedger.vehicleNumber + '</td>');
	tr.append('<td><b>Agent Name:  </b>' + dispatchLedger.crossingAgentName + '</td>');
	tr.append('<td><b>Source:  </b>' + dispatchLedger.sourceBranch + '</td>');
	tr.append('<td><b>Destination:  </b>' + dispatchLedger.destinationBranch + '</td>');
	tr.append('<td><b>LRs: </b><span id="lrCountInLS">' + dispatchLedger.totalNoOfWayBills + '</span></td>');
	
	$('#dispatchDetails table').append(tr);
	
	setLRDetailsFromDispatch();
}

function setLRDetailsFromDispatch() {
	if(dispatchLedger == undefined)
		return;
		
	$('#sourceBranch').val(dispatchLedger.sourceBranch);
	$('#destination').val(dispatchLedger.destinationBranch);
	$('#sourceBranchId').val(dispatchLedger.sourceBranchId);
	$('#destinationBranchId').val(dispatchLedger.destinationBranchId);
	$('#destinationSubRegionId').val(jsondata.destinationSubRegionId);
	$('#destinationRegionId').val(jsondata.destinationRegionId);
	$('#destinationStateId').val(jsondata.destinationStateId);
	$('#lrDateManual').val(dispatchLedger.tripDateTimeForString);
	
	if (dispatchLedger.crossingAgentId > 0)
		$('#crossingHireAmountPanel').removeClass('hide');

	sourceBranchStateId	= jsondata.sourceStateId;
	destinationBranchId	= dispatchLedger.destinationBranchId;
	lsBranchId			= dispatchLedger.lsBranchId;
	crossingAgentId		= dispatchLedger.crossingAgentId;
	
	creatOptionForPaymentType(paymentTypeArr, 'paymentType');
	initialisePartyAutocomplete(destinationBranchId);
}

function addAsteriskStarForMandatoryFields() {
	if (configuration.validateVehiclePoNumber == 'true')
		$('#vehiclePONumberMandatory').removeClass('hide');

	if (configuration.validateSealNumber == 'true')
		$('#sealNumberMandatory').removeClass('hide');
}

function disableCategoryType() {
	if(configuration.showCategoryType == 'true' && configuration.allowTaxTypeWiseCategoryType == 'true')
		$('#categoryType').attr('disabled', 'true'); 
}
function disableSpecificChargesOnTBB() {
	if ((configuration.disableSpecificChargesOnTBB == true || configuration.disableSpecificChargesOnTBB == 'true' ) && $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
		let disableChargeIdArray = (configuration.chargeIdsToDisableOnTBB).split(",");

		if (disableChargeIdArray != null && disableChargeIdArray.length > 0) {
			for (const element of disableChargeIdArray) {
				disableCharge(element);
			}
		}
	}
}

function hideShowRecoveryBranch() {
	if(configuration.showRecoveryBranchForShortCredit == 'true') {
		if(Number($('#paymentType').val()) == PAYMENT_TYPE_CREDIT_ID && getWayBillTypeId() == WAYBILL_TYPE_PAID)
			switchHtmlTagClass('tableSearchRecoveryBranch', 'show', 'hide');
		else
			switchHtmlTagClass('tableSearchRecoveryBranch', 'hide', 'show');
	} else
		switchHtmlTagClass('tableSearchRecoveryBranch', 'hide', 'show');

	setRecoveryBranch();
}

function setRecoveryBranch(){
	if($('#recoveryBranch').exists() && $('#recoveryBranch').is(":visible")){
		$('#selectedRecoveryBranchId').val(executive.branchId);
		$('#recoveryBranch').val(executive.branchName);
	}
}

function resetRecoveryBranch() {
	if($('#recoveryBranch').exists() && $('#recoveryBranch').is(":visible")) {
		$('#recoveryBranch').val("");
		$('#selectedRecoveryBranchId').val(executive.branchId);
	}
}

function createOptionForDivisionField(divisionList) {
	removeOption('waybillDivisionId', null);
	createOption('waybillDivisionId', 0, '--Select Division--');

	for (const element of divisionList) {
		createOption('waybillDivisionId', element.divisionMasterId, element.name);
	}
	
	if(configuration.defaultDivisionId > 0)
		$('#waybillDivisionId').val(configuration.defaultDivisionId);
}

function bindEventOnDivisionField () {
	if(configuration.showDivisionSelection == 'false')
		return;
	
	$("#waybillDivisionId").on('keyup', function() {
		validateDivsion();
	});
	
	$("#waybillDivisionId").on('keypress', function(event) {
		if(event.keyCode == 13) {setStPaidByBasisOfDivisionSelection();}
	});
	
	$("#waybillDivisionId").on('change', function() {
		getLRSequenceOnDivisionSelection();
		setStPaidByBasisOfDivisionSelection();
	});
}

function resetPartyDetailsOnGSTNumberChange(id) {
	if(configuration.resetPartyDetailsOnGstChange == 'true') {
		if(id == 'consignorGstn' || id == 'consignoCorprGstn')
			resetConsignor();
		
		if(id == 'consigneeGstn' || id == 'consigneeCorpGstn') {
			resetConsignee();
			
			if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'true')
				resetBillingParty();
		}
	}
}

function showHideInsuranceRateFeild() {	
	if(configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'false')	
		return;
	
	if ($("#declaredValue").val() > 0 && $("#declaredValue").val() !== "") {
		$('#percentageRiskCover').toggleClass("hide", !$('#declaredValueCheckBox').prop("checked"));
	} else if ($('#declaredValueCheckBox').prop("checked")) {
		showMessage('error', iconForErrMsg + ' Please Enter Declared Value to Enable Insurance Rate!');
		$('#percentageRiskCover').addClass("hide");
		$('#declaredValueCheckBox').prop("checked", false);
	}
	
	$('#charge' + INSURANCE).val(0);
	$('#percentageRiskCover').val(0);
}

function setPackageCondition() {
	let packageConditionList	= jsondata.packageConditionList;
	
	if(packageConditionList == undefined || packageConditionList.length == 0)
		return;
		
	$('.packageConditionSelection').removeClass('hide');
	createOptionForPackageCondition(packageConditionList);
}

function createOptionForPackageCondition(packageConditionList) {
	removeOption('packageCondition', null);
	createOption('packageCondition', 0, '--Select--');
	
	for(const element of packageConditionList)
		createOption('packageCondition', element.packageConditionMasterId, element.packageConditionName);
}

function disableChargesOnPassengerBooking() {
	if(configuration.disableChargesOnPassengerBooking == 'true') {
		let disabledChargeIds = configuration.chargesToDisableForPassengerBooking.split(",");
		
		if($('#deliveryTo').val() == DELIVERY_TO_PASSENGER_ID) {
			disabledChargeIds.forEach(function (chargeId) {
				$('#charge' + chargeId).val(0).prop("disabled", true);
				
				showHideRemark(chargeId);
			});
		} else {
			disabledChargeIds.forEach(function (chargeId) {
				$('#charge' + chargeId).prop("disabled", false);
			});
		}
	}
}


function getDefaultPaymentMode() {
	if (configuration.setBranchWisePaymentModeShortCreditByDefault == 'true') {
		let creditPaymentTypeArr = paymentTypeArr.filter(function(obj) {
			return obj.paymentTypeId == PAYMENT_TYPE_CREDIT_ID;
		});
				
		let branchPaymentArr = configuration.branchIdsForShortCreditPaymentModeByDefault.split(',');

		if (isValueExistInArray(branchPaymentArr, executive.branchId) && creditPaymentTypeArr.length > 0)
			return PAYMENT_TYPE_CREDIT_ID;
	}
	
	return configuration.DefaultPaymentType;
}
