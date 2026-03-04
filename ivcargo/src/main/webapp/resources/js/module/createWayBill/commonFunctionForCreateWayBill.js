/**
 * @Author Anant Chaudhary	28-01-2016
 */
function getBookingType() {
	if (configuration.BookingType == 'true')
		return Number($('#bookingType').val());
	else
		return Number(getDefaultBookingType());
}

function getSTPaidByValue() {
	if (configuration.STPaidBy == 'true')
		return getValueFromInputField('STPaidBy');
	else
		return getDefaultSTPaidBy(getValueFromInputField('wayBillType'));
}

function getPanNumber(jsonObject) {
	jsonObject.panNumber	= getValueFromInputField('panNumber');
}

function getPaymentType() {
	if(configuration.PaymentType == 'true')
		return $('#paymentType').val();
	else
		return defaultPaymentType;
}

function getServiceType(jsonObject){
	let serviceTypeId		= $('#serviceType').val();
	
	if(serviceTypeId == undefined)
		serviceTypeId	= Number(configuration.defaultServiceType);

	jsonObject.serviceTypeId 		= serviceTypeId;
}

function changeOnBookingType() {
	if (configuration.BookingType != 'true')
		return;
	
	checkTopayLRBookingAllow();
	
	let bookingTypeId	= Number(getBookingType());
	
	switch (bookingTypeId) {
	case BOOKING_TYPE_FTL_ID:
		if (configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true) {
			$('#chargeType').val(TransportCommonMaster.CHARGETYPE_ID_FIX);
			changeOnChargeType();
		}

		createDeliveryTo();
		
		if(configuration.cargoType == 'true')
			$('#cargoTypePanel').removeClass('hide');
		else
			$('#cargoTypePanel').addClass('hide');
		
		break;
	case BOOKING_TYPE_SUNDRY_ID:
	case BOOKING_TYPE_MAIL_ID:
	case BOOKING_TYPE_PARCEL_CARGO_ID:
		if(configuration.showActualAndChargedWeightInMerticTon == 'true'){
			setWeight();
			$("#actualmetricTon").hide();
			$("#chargedmetricTon").hide();
			
			$("#actualInKg").show();
			$("#chargedInKg").show();
		}
		
		createDeliveryTo();

		if(configuration.cargoType == 'true')
			$('#cargoTypePanel').addClass('hide');
		
		break;
	case DIRECT_DELIVERY_DIRECT_VASULI_ID:
		if(configuration.showActualAndChargedWeightInMerticTon == 'true'){
			resetWeight();
			$("#actualmetricTon").show();
			$("#chargedmetricTon").show();
			
			$("#actualInKg").hide();
			$("#chargedInKg").hide();
		}
		
		createDeliveryTo();
		
		if(configuration.cargoType == 'true')
			$('#cargoTypePanel').addClass('hide');
		
		break;

	default:
		break;
	}
	
	showVehicleNumberAndTruckTypeOnBookingType(bookingTypeId);
}

function checkIfPartyIsExempted(){
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) {
		let partyMasterId	= 0;
		let partyExempted 	= 0;

		if(Number($('#wayBillType').val()) == WAYBILL_TYPE_PAID) {
			partyMasterId	= $('#partyMasterId').val();
			partyExempted 	= $('#cnorExempted_'+partyMasterId).val();
		} else if (Number($('#wayBillType').val()) == WAYBILL_TYPE_TO_PAY) {
			partyMasterId	= $('#consigneePartyMasterId').val();
			partyExempted 	= $('#cneeExempted_'+partyMasterId).val();
		} else if (Number($('#wayBillType').val()) == WAYBILL_TYPE_CREDIT) {
			partyMasterId	= $('#billingPartyId').val();
			partyExempted 	= $('#billingExempted_'+partyMasterId).val();
		}
		
		if( (partyExempted != undefined || partyExempted != 'undefined') &&
				(partyExempted == true || partyExempted == 'true') ){

			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			$('#STPaidBy').attr('disabled','true');
			return true;
		}
		
		return false;
	} 
	
	return false;
}

var counterrr 			= 0 ;
var counterForNonEmpty 	= 0 ;

function executeAddScript() {
	
	if(!addConsingmentGstn())
		return false;

	if(configuration.validateConsignmentOnExempted == 'true' || configuration.validateConsignmentOnExempted == true) {
		if(!checkIfPartyIsExempted()) {
			if(noOfArticlesAdded == 0) {
				preIsConsignmentExempted	= isConsignmentExempted;
				
				if(isConsignmentExempted == "true" || isConsignmentExempted == true)
					$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			}

			if(preIsConsignmentExempted != isConsignmentExempted) {
				showMessage('error', 'All consignments should be either "Exempted" Or "Not Exempted"');
				resetArticleDetails();
				return;
			}
		}
	}
	
	if(configuration.isAllowEWayBillExemptedValidation == 'true' || configuration.isAllowEWayBillExemptedValidation == true) {
		for (let [key, value] of Object.entries(consignmentEWayBillExemptedObj)) {
			if(key && isConsignmentEWayBillExempted.toString() != value.toString()) {
				showMessage('error', 'All consignments should be either "EWayBill Exempted" Or "Not EWayBill Exempted"');
				resetArticleDetails();
				return;
			}
		}
		
		$('#isEWayBillExempted').val(isConsignmentEWayBillExempted);
	}

	if(typeof checkPackingTypeAllowedOnTempWeight != 'undefined' && !checkPackingTypeAllowedOnTempWeight())
		return;

	ArticleWeightWiseErrMsg	= false;
	
	if(typeof validateArticleAmountWithWeight != 'undefined' && !validateArticleAmountWithWeight()) {
		ArticleWeightWiseErrMsg	= true;
		$('#saidToContain').focus();
		return;
	}
	
	$('#typeofPackingId').val(getPackingTypeId());

	if(basicFormValidation()) {
		if(validateAddArticle()) {
			hideAllMessages();

			if(configuration.AddArticleForLMT != 'true')
				checkIfRateNotPresent();
			
			checkAndAddConsignment(); // Defined in Consignment.js file
			setNextFocusOnPaymentTypeAfterAddArticle();
			setNextFocusOnBookingChargeAfterAddArticle();
			setFocusOnInvoiceNumberAfterAddArticle();
			setFocusAfterAddBasedOnChargeTypeSelection();
			validateFreightCharge();
			addAmountToFreightOnPerArticleData();
			
			if(typeof validateInsuranceCharge != 'undefined')
				validateInsuranceCharge();
			
			if(configuration.checkConsignmentGoodForApplyRate == 'true' || configuration.checkConsignmentGoodForApplyRate == true)
				chargesForGroup();
			
			$('#consignmentGoodsId').val(0);
			
			if(consignmentGoods != undefined)
				setDefaultSaidToContain(consignmentGoods);
			
			setDeliveryToDoorDeliveryForOvernightCarrier();
			if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
			
			if(configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true)
				resetLBHFeild();
			
			setNextPrevAfterArticleAdd();
			return true;
		}
	}
}

function chargesForGroup() {
	if(cnsgnmentGoodsId.length == 0)
		return;

	let consignmentGoodsIdArray 	= (configuration.consignmentGoodsIdsForSkipAutoRate).split(",");
	let chargeIdArray 				= (configuration.chargeIdsForResetOnConsignmentGood).split(",");

	for(let i = 0; consignmentGoodsIdArray.length > i; i++) {
		for(let j = 0; cnsgnmentGoodsId.length > j; j++) {
			if(Number(consignmentGoodsIdArray[i]) == Number(cnsgnmentGoodsId[j].split("_")[0])) {
				for(let k = 0; chargeIdArray.length > k; k++) {
					$('#charge' + chargeIdArray[k]).val(0);
					calculateTotalQty();
					
					if(configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true)
						calculateTotalParcelSize();
				}
			}
		}
	}
}

function setNextFocusOnPaymentTypeAfterAddArticle() {
	let currentWayBillTypeId	= getValueFromInputField('wayBillType');

	if(configuration.isSetFocusToPaymentTypeAfterAdd == 'false')
		return;

	if(currentWayBillTypeId == WAYBILL_TYPE_PAID) {
		next = "paymentType";
		prev = "quantity";
	} else if(currentWayBillTypeId == WAYBILL_TYPE_TO_PAY) {
		next = "charge1";
		prev = "quantity";
	} else if(currentWayBillTypeId == WAYBILL_TYPE_CREDIT) {
		next = "charge1";
		prev = "quantity";
	}  
}

function setNextPrevAfterMannualLrNoPanel(){
	if(configuration.allowMannualNextPrevAfterMannualLrNo == 'true'){
		next = 'consignorName';
	}
}

function setNextFocusOnBookingChargeAfterAddArticle() {
	if(configuration.isSetFocusToBookingChargesAfterAdd == 'false')
		return;

	let currentWayBillTypeId	= getValueFromInputField('wayBillType');
	
	if(currentWayBillTypeId == WAYBILL_TYPE_PAID || currentWayBillTypeId == WAYBILL_TYPE_TO_PAY || currentWayBillTypeId == WAYBILL_TYPE_CREDIT) {
		next 	= configuration.defNext;
		prev 	= configuration.defPrev;
	} else if(currentWayBillTypeId == WAYBILL_TYPE_FOC) {
		next 	= configuration.focNext;
		prev 	= configuration.focPrev;
	}
}

function setFocusOnInvoiceNumberAfterAddArticle() {
	if(configuration.setFocusOnInvoiceNoAfterAddArticle == 'false' || $('#chargeType').val() == CHARGETYPE_ID_WEIGHT)
		return;

	next 	= 'invoiceNo';
	prev 	= 'quantity';
}

function setFocusAfterAddBasedOnChargeTypeSelection(){
	if(configuration.setFocusAfterAddBasedOnChargeTypeSelection != 'true')
		return;

	if(configuration.setFocusAfterAddBasedOnChargeTypeSelection == 'true') {
		let currentChargeTypeId	= getValueFromInputField('chargeType');
		
		if(currentChargeTypeId == CHARGETYPE_ID_QUANTITY) {
			if($('#privateMark').exists())
				next = "privateMark";
			else
				next = "singleFormTypes";
		} else if(currentChargeTypeId == CHARGETYPE_ID_WEIGHT)
			next = "actualWeight";
		else if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
			if(currentChargeTypeId == CHARGETYPE_ID_FIX)
				next = "fixAmount";
		} else
			next = "singleFormTypes";
	}
}

function bindNextElementFocusOnConsignorName(){
	if((configuration.gstnNumber == 'true') && (($('#prevConsignorGstn').val() == '')))
		next	= 'consignorGstn';
	else
		next	= 'consigneePhn';
}

function bindNextElementFocusOnConsigneeName(){
	if((configuration.gstnNumber == 'true') && (($('#prevConsigneeGstn').val() == '')))
		next	= 'consigneeGstn';
	else if(configuration.ChargeType == 'true')
		next	= 'chargeType';
	else
		next	= 'quantity';
}

function getDestination(branchId, destBranchName) {
	//var bookingType = document.getElementById('bookingType');
	var destinationBranchId		= 0;
	var subRegionId				= 0;
	var regionId				= 0;
	var pincode					= 0;
	var destData 				= new Array();
	var isAgentBranch;
	destData 		= branchId.split("_");
	var branchId 	= parseInt(destData[0]);
	var stateId		= parseInt(destData[2]);
	var typeOfLoc	= parseInt(destData[3]);
	
	if(destData[6] != undefined && destData[6] != null)
		subRegionId	= parseInt(destData[6]);
	
	if(destData[7] != undefined && destData[7] != null)
		pincode	= parseInt(destData[7]);
	
	if(destData[8] != undefined && destData[8] != null)
		regionId	= parseInt(destData[8]);
	
	if(destData[9] != undefined && destData[9] != null)
		isAgentBranch	= destData[9];

	$('#destinationBranchId').val(branchId);
	$('#destinationStateId').val(stateId);
	$('#typeOfLocation').val(typeOfLoc);
	$('#destinationSubRegionId').val(subRegionId);
	$('#destinationRegionId').val(regionId);
	$('#consigneePin').val(pincode);
	//$('#isDestAgentBranch').val(isAgentBranch);
	
	setSubregionWiseRateValidation(subRegionId);

	resetOnChargeTypeExcludingPackageDetails(); // Replaced from resetCharges();
	checkForDoorDeliveryForDeliveryLocations();
	
	if(configuration.showSelectedDestinationBranchSubRegionName == 'true')
		$('#showSubRegion').html(destSubRegion.name);

	destinationBranchId			= branchId;

	if (configuration.FrightuptoDestination == 'true') {
		if (typeOfLoc == Branch.TYPE_OF_LOCATION_PHYSICAL) {
			setValueToTextField('freightUptoBranchId', branchId);
			enableDisableInputField('freightUptoBranch', 'true');
		} else {
			enableDisableInputField('freightUptoBranch', 'false');

			if (configuration.FreightUptoBranchAutocomplete == 'true')
				setSourceToAutoComplete('freightUptoBranch', "Ajax.do?pageId=9&eventId=13&filter=8&otherBranchIds="+branchId+"&responseFilter="+configuration.BookingFreightUptoBranchAutocompleteResponse);
			
			if(configuration.DestinationBranchInFrightuptoDestination == 'true')
				setDestinationBranchInFrightUpToDestination(destBranchName);
			else if (configuration.resetFreightUptoBranch != 'true')
				getHandlingBranch(branchId);					
			else {					
				next = 'freightUptoBranch';
				setValueToTextField('freightUptoBranch', '')
			}
		}
	}

	initialisePartyAutocomplete(destinationBranchId);
}

function initialisePartyAutocomplete(destinationBranchId) {
	if (configuration.searchWithPartyToPartyConfig == 'true') {
		if($('#consignorCorpId').val() > 0)
			initialiseConsigneeAutocomplete($('#consignorCorpId').val(), destinationBranchId);
		else if($('#partyMasterId').val() > 0)
			initialiseConsigneeAutocomplete($('#partyMasterId').val(), destinationBranchId);
	} else if(configuration.partyPanelType == '2') {
		if(configuration.ConsigneePhnAutocomplete == 'true' && configuration.fetchDataByRedisCache != 'true')
			setSourceToAutoComplete('consigneePhn', "Ajax.do?pageId=9&eventId=18&isNumberAutocomplete=true&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneePhnAutocompleteResponse);

		if(configuration.ConsigneeNameAutocompleteOnPanelType2 == 'true' && configuration.fetchDataByRedisCache != 'true')
			setSourceToAutoComplete('consigneeName', "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse);
	} else if (configuration.ConsigneeNameAutocomplete == 'true' && !configuration.fetchDataByRedisCache != 'true')
		setSourceToAutoComplete('consigneeName', "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName);
}

function initialiseConsigneeAutocomplete(consignorId, destinationBranchId) {
	setSourceToAutoComplete('consigneeName', "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId + "&consignorId=" + consignorId + "&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName);
}

function setDestinationBranchInFrightUpToDestination(destBranchName) {
	$('#freightUptoBranchId').val($('#destinationBranchId').val());
	$('#freightUptoBranch').val(destBranchName);
}

function getHandlingBranch(branchId) {
	var jsonObject					= new Object();

	jsonObject.filter				= 1;
	jsonObject.destinationBranchId	= branchId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					$('#freightUptoBranchId').val(data.id);
					$('#freightUptoBranch').val(data.name);
				}
			});
}

function selectSTPaidBy(value) {
	if (configuration.STPaidBy == 'false')
		return;

	var typeId	= TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;

	switch (parseInt(value)) {
	case TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID :
		typeId = TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
		break;

	case TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID :
		typeId = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
		break;

	case TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID :
		typeId = TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID;
		break;

	case TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_ID :
		typeId = TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_ID;
		break;

	case TAX_PAID_BY_EXEMPTED_ID :
		typeId = TAX_PAID_BY_EXEMPTED_ID;
		break;

	default:
		typeId = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
	break;
	}

	$('#STPaidBy').val(typeId);

	//setStPaidByBoolean();
	if(typeof calcGrandtotal != 'undefined')
		calcGrandtotal(); //Defined In Rate.js
}

function setDefaultSTPaidBy(waybillTypeId) {
	if (configuration.STPaidBy != 'true' || $('#billSelection').val() == BOOKING_WITHOUT_BILL && (configuration.doNotCalculateGSTForEstimateLR == 'true' || configuration.doNotCalculateGSTForEstimateLR == true))
		return;
		
	switch (Number(waybillTypeId)) {
	case WAYBILL_TYPE_PAID:
		$('#STPaidBy').val(configuration.DefaultSTPaidByForPaidLR);
		break;

	case WAYBILL_TYPE_TO_PAY:
		$('#STPaidBy').val(configuration.DefaultSTPaidByForToPayLR);
		break;

	case WAYBILL_TYPE_CREDIT:
		$('#STPaidBy').val(configuration.DefaultSTPaidByForTBBLR);
		break;

	case WAYBILL_TYPE_FOC:
		$('#STPaidBy').val(configuration.DefaultSTPaidByForFOCLR);
		break;
	default : 
		$('#STPaidBy').val(configuration.DefaultSTPaidBy);
	}
	
	if(gstPaidSelectExists) $('#STPaidBy').val(-1);

	if(isConsignmentExempted == "true" || isConsignmentExempted == true)
		$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	//setStPaidByBoolean();
	
	if(typeof calcGrandtotal != 'undefined')
		calcGrandtotal(); //Defined In Rate.js

	disableSTPaidBy(waybillTypeId);
	hideSTPaidByOnWayBillType(waybillTypeId);
}

function disableSTPaidBy(waybillTypeId) {
	if (configuration.STPaidBy != 'true')
		return;

	switch (Number(waybillTypeId)) {
	case WAYBILL_TYPE_PAID:
		$('#STPaidBy').prop("disabled", configuration.disableSTPaidBy == 'true') 
		break;

	case WAYBILL_TYPE_TO_PAY:
		$('#STPaidBy').prop("disabled", configuration.disableSTPaidBy == 'true') 
		break;

	case WAYBILL_TYPE_CREDIT:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", configuration.disableSTPaidByOnTBB == 'true') 
		break;

	case WAYBILL_TYPE_FOC:
		if (configuration.disableSTPaidBy == 'true')
			$('#STPaidBy').prop("disabled", configuration.disableSTPaidByOnTBB == 'true') 
		break;
	default : 
		$('#STPaidBy').prop("disabled", false) 
	}
}

function hideSTPaidByOnWayBillType(waybillTypeId) {
	if (configuration.hideSTPaidByOnWayBillType == 'false')
		return;
	
	var wayBillTypeIdList = (configuration.wayBillTypeIdsToHideSTPaidBy).split(',');
	$('#STPaidBy').css("display", isValueExistInArray(wayBillTypeIdList, waybillTypeId) ? 'none' : 'block');
}

function getDefaultSTPaidBy(waybillTypeId) {
	var defaultStPaidBy = 0;
	switch (waybillTypeId) {
	case WAYBILL_TYPE_PAID:
		defaultStPaidBy = configuration.DefaultSTPaidByForPaidLR;
		break;

	case WAYBILL_TYPE_TO_PAY:
		defaultStPaidBy = configuration.DefaultSTPaidByForToPayLR;
		break;

	case WAYBILL_TYPE_CREDIT:
		defaultStPaidBy = configuration.DefaultSTPaidByForTBBLR;
		break;

	case WAYBILL_TYPE_FOC:
		defaultStPaidBy = configuration.DefaultSTPaidByForFOCLR;
		break;
	default : 
		defaultStPaidBy = configuration.DefaultSTPaidBy;
	}
	
	return defaultStPaidBy;
}

function getLastCharge() {
	var charges		= jsondata.charges;
	prev			= 'charge' + charges[charges.length - 1].chargeTypeMasterId;
}

function checkDiscountValidation() {
	if(isBookingDiscountAllow) {
		var discnt  = document.getElementById("discount");
		var disType = document.getElementById("discountTypes");

		if(disType != null && !isBookingDiscountPercentageAllow) {
			if(discnt.value > 0 && disType.value <= 0) {
				showMessage('error', discountTypeErrMsg);
				changeError1('discountTypes','0','0');
				return false;
			} else {
				removeError('discountTypes');
				hideAllMessages();
			}
		}
	}
	
	return true;
}

function disableDiv(id,dis) {
	$('#'+id + ' :input').attr("disabled", dis);
}

function onSaveWayBill() {
	//setFocusForNewLR();
	if(isReserveBookingChecked) {
		onReserveWayBill();
	} else {
		disableButton();
		
		if(!isWayBillSaving) {
			isWayBillSaving = true;
			isFromDynamicPaymentTypeSelection = false;
			
			if(!isWayBillSaved && !formValidations()) {
				enableButton();
				isWayBillSaving = false;
			}
		}
	}
}

function reprintWindow(reprint) {
	childwin = window.open(lrPrintLink + reprint ,'newwindow', config= lrPrintLinkConfig);
}

function mrPrintWindow(reprint) {
	childwin = window.open('printMoneyReceipt.do?pageId=3&eventId=16&wayBillId='+pervwayBillId+'&moduleIdentifier=6', 'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function billPrintWindow(reprint) {
	childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billIdForInvoicePrint + '&isBkgDlyTimeInvoicePrint='+ true, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function billPrintWindowAfterBooking(openInvoicePrintPopUpAfterBkgDly) {
	childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billIdForInvoicePrint + '&isBkgDlyTimeInvoicePrint='+ true +'&openInvoicePrintPopUpAfterBkgDly='+openInvoicePrintPopUpAfterBkgDly+ '&billPdfEmailAllowed='+ true ,     '_blank', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function setRePrintOption(data, pervwayBillId) {
	switchHtmlTagClass('reprintdiv', 'show', 'hide');

	setValueToContent('prevlrnum', 'htmlTag', '<a href="javascript:openWindowForView(' + pervwayBillId + ',' + LR_SEARCH_TYPE_ID + ', 0);">' + data.wayBillNumber + '</a>');
	setValueToContent('prevwbtype', 'htmlTag', data.wayBillType);
	setValueToContent('prevdest', 'htmlTag', data.destinationBranchName);
	setValueToContent('prevgrndtotal', 'htmlTag', data.grandTotal);

	if(configuration.ShowLRTypeWiseBookingAmountToGroupAdmin == 'true') {
		let lrTypeList	= (configuration.LRTypeToShowBookingAmountToGroupAdmin).split(',');
		
		if(isValueExistInArray(lrTypeList, $('#wayBillType').val()) && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN)
			$("#prevGrandTotal").css('display','none');
		else
			$("#prevGrandTotal").css('display','table-cell');
	}
	
	if(configuration.isMoneyReceiptRequired == 'true' && configuration.showMrPrintButtonOnBookingPage == 'true') {
		let lrTypeList1	= (configuration.wayBillTypeIdsForMoneyReceipt).split(',');
		
		if(data.wayBillTypeId == WAYBILL_TYPE_PAID) {
			if(!isValueExistInArray(lrTypeList1, data.wayBillTypeId) 
				|| configuration.doNotAllowToCreateMRForPaidShortCreditLR == 'true' && $('#paymentType').val() == PAYMENT_TYPE_CREDIT_ID)
				$("#mrPrintOption").addClass("hide");
			else
				$("#mrPrintOption").removeClass("hide");
		} else
			$("#mrPrintOption").addClass("hide");
	}

	if(configuration.allowToCreateInvoiceForPaidLR == 'true') {
		if(data.wayBillTypeId == WAYBILL_TYPE_PAID)
			$("#billPrintOption").removeClass("hide");
		else
			$("#billPrintOption").addClass("hide");
	}
}

function openWindowForView(id, type, branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + type + '&BranchId=' + branchId);
}

/**
 * This methos is used to set value of destination city & deastination branch for PTT new
 * combo box
 * @param jsonObject
 */
function getDestinationData1(jsonObject){
	jsonObject.destinationBranchId		= $('#destinationIdEle_primary_key').val();
	jsonObject.destinationCityId		= $('#destinationCitySelectEle_primary_key').val();
}

function getDiscountTypes(jsonObject) {
	jsonObject.discountTypes	= $('#discountTypes').val();
	
	if(isBookingDiscountPercentageAllow) {
		jsonObject.discountTypes	= parseInt(configuration.defaultDiscountType);
	}
}

function getExciseInvoice(jsonObject) {
	jsonObject.exciseInvoice		= $('#exciseInvoice').val();
	jsonObject.exciseInvoiceName	= $("#exciseInvoice option:selected").text();
}

function getConsignmentInsured(jsonObject) {
	jsonObject.consignmentInsured		= $('#consignmentInsured').val();
	jsonObject.consignmentInsuredName	= $("#consignmentInsured option:selected").text();
}

function getSequnceTypeSelection(jsonObject) {
	if(configuration.hideSequenceTypeSelection == 'true')
		jsonObject.SequenceTypeSelection	= Number(configuration.defaultSequenceType);
	else if($('#SequenceTypeSelection').val() != undefined && $('#SequenceTypeSelection').val() != null)
		jsonObject.SequenceTypeSelection	= Number($('#SequenceTypeSelection').val());
}

function getSTPaidBy(jsonObject) {
	if ($('#STPaidBy').exists())
		jsonObject.STPaidBy		= getSTPaidByValue();
}

function getChargeType(jsonObject) {
	if ($('#chargeType').exists()) {
		jsonObject.chargeTypeId		= $('#chargeType').val();
		
		if (getValueFromInputField('chargeType') == TransportCommonMaster.CHARGETYPE_ID_CUBIC_RATE
				|| ((configuration.VolumetricRate == 'true' || configuration.VolumetricRate == true)
						&& $('#volumetric').is(':checked'))) {
			jsonObject.length		= getValueFromInputField('length');
			jsonObject.height		= getValueFromInputField('height');
			jsonObject.breadth		= getValueFromInputField('breadth');
			jsonObject.cftWeight	= $('#cftWeight').val();
		}
	}
}

function calculateMinimumQtyAmt(qtyRateFromEl, qtyAmount, chargeMasterTypeId) {
	switch (configuration.QuantityAmountConfigFlavor) {
	case configuration.QuantityAmountConfigFlavor :
		if (jQuery.inArray(chargeMasterTypeId + "", quantityAmountCharges) != -1
			&& qtyRateFromEl == ChargeTypeMaster.LOADING && qtyAmount < minimumQuantityAmount)
			return true;
		
		break;
	default:
		break;
	}
}

function getChequeDetails(jsonObject) {
	jsonObject.chequeDate		= $('#chequeDate').val();
	jsonObject.chequeNumber		= $('#chequeNo').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.payerName		= $('#payerName').val();
	jsonObject.bankName			= $('#bankName').val();
	jsonObject.bankNameId		= $('#bankName_primary_key').val();
	jsonObject.accountNo		= $('#accountNo').val();
	jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
}

//function to get the values from input field for credit card - Ravi Prajapati
function getCreditDebitCardDetails(jsonObject){
	jsonObject.chequeNumber		= $('#cardNo').val();
	jsonObject.cardNo			= $('#cardNo').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();

	if($('#creditBankName').exists())
		jsonObject.bankName		= $('#creditBankName').val();
	else
		jsonObject.bankName		= $('#bankName').val();

	jsonObject.payerName		= $('#payerName').val();
	jsonObject.bankNameId		= $('#bankName_primary_key').val();
	jsonObject.accountNo		= $('#accountNo').val();
	jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
}

function getPaytmDetails(jsonObject) {
	jsonObject.chequeNumber		= $('#referenceNumber').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.referenceNumber	= $('#referenceNumber').val();
	jsonObject.payerName		= $('#payerName').val();
	jsonObject.UpiId			= $('#UpiId').val();
	if( validatePhonePayTransaction && $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID){
		jsonObject.qrCodeMapperId =$('#qrCodeMapperId').val();
		
		if (allowDynamicPhonepeQR) {
			jsonObject.isPaidByDynamicQRCode 	= isPaidByDynamicQRCode;
			jsonObject.transactionId 			= $('#transactionFld').val();
			jsonObject.merchantId 				= $('#merchantIdFld').val();
			jsonObject.apiReqResDataId 			= $('#apiReqResDataIdFld').val();
		}
		
	}
}

function getIMPSDetails(jsonObject) {
	jsonObject.bankName			= $('#bankName').val();
	jsonObject.bankNameId		= $('#bankName_primary_key').val();
	jsonObject.chequeNumber		= $('#referenceNumber').val();
	jsonObject.referenceNumber	= $('#referenceNumber').val();
	jsonObject.payerName		= $('#payerName').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.accountNo		= $('#accountNo').val();
	jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
}

function getConsignor(jsonObject) {
	jsonObject.cnorCustomerDetailsId	= $('#cnorCustomerDetailsId').val();

	jsonObject.consignorCorpId			= $('#consignorCorpId').val();
	
	if(jsonObject.consignorCorpId <= 0 && $('#partyMasterId').exists())
		jsonObject.consignorCorpId = $('#partyMasterId').val();

	if(jsonObject.consignorCorpId <= 0 && $('#consignorCodeCorpId').exists())
		jsonObject.consignorCorpId = $('#consignorCodeCorpId').val();
	
	jsonObject.billingPartyId			= $('#billingPartyId').val();
	jsonObject.partyMasterId			= $('#partyMasterId').val();
	
	if(jsonObject.partyMasterId <= 0 && $('#consignorCorpId').exists())
		jsonObject.partyMasterId = $('#consignorCorpId').val();
	
	if(jsonObject.partyMasterId <= 0 && $('#partyMasterCodeId').exists())
		jsonObject.partyMasterId = $('#partyMasterCodeId').val();
	
	jsonObject.consignorName			= $('#consignorName').val();
	jsonObject.billingPartyName			= $('#billingPartyName').val();
	jsonObject.billingPartyPhone		= $('#billingPartyPhone').val();
	jsonObject.consignorPartyCode		= $('#consignorPartyCode').val();
	jsonObject.isConsignorTBBParty		= isConsignorTBBParty;	
	
	if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consignorPhn").val().includes("*"))
		jsonObject.consignorPhn = $('#prevConsignorPhn').val();
	else
		jsonObject.consignorPhn = $('#consignorPhn').val();
		
	if(jsonObject.consignorPhn == '' && $('#consignorCodePhn').exists())
		jsonObject.consignorPhn	= $('#consignorCodePhn').val();

	if (getValueFromInputField('consignorAddress') != "" && getValueFromInputField('consignorAddress') != "Address")
		jsonObject.consignorAddress		= getValueFromInputField('consignorAddress');

	jsonObject.consignorPin				= $('#consignorPin').val();
	jsonObject.consignorContactPerson	= $('#consignorContactPerson').val();
	jsonObject.consignorEmail			= $('#consignorEmail').val();
	jsonObject.consignorFax				= $('#consignorFax').val();
	jsonObject.consignorDepartment		= $('#consignorDepartment').val();
	jsonObject.consignorTin				= $('#consignorTin').val();
	jsonObject.consignorPan				= $('#consignorPan').val();
	jsonObject.billingPartyPan			= $('#billingPartyPan').val();
	jsonObject.isSmsSendToConr			= $("#isSmsSendToConr").prop( "checked");
	
	if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
		jsonObject.consignorGstn		= $('#consignoCorprGstn').val();
	else
		jsonObject.consignorGstn		= $('#consignorGstn').val();
		
	jsonObject.billingPartyGSTN			= $('#billingGstn').val();

	if(consignorAutofillShortcutAllow) {
		$('#prevConsignorName').val(jsonObject.consignorName);
		$('#prevConsignorPhn').val(jsonObject.consignorPhn);
		$('#prevConsignorAddress').val(jsonObject.consignorAddress);
		$('#prevConsignorTin').val(jsonObject.consignorTin);
		$('#prevConsignorCorpId').val(jsonObject.consignorCorpId);
		$('#prevConsignorPartyMasterId').val(jsonObject.partyMasterId);
		$('#prevConsignorGstn').val(jsonObject.consignorGstn);
		$('#prevBillingPartyId').val(jsonObject.billingPartyId);
		$('#prevBillingPartyName').val(jsonObject.billingPartyName);
		$('#prevBillingPartyPhone').val(jsonObject.billingPartyPhone);
		$('#prevBillingGstn').val(jsonObject.billingPartyGSTN);
	}
}

function getConsignee(jsonObject) {
	jsonObject.cgneeCustomerDetailsId		= $('#cgneeCustomerDetailsId').val();
	jsonObject.consigneePartyMasterId		= $('#consigneePartyMasterId').val();
	jsonObject.consigneeName				= $('#consigneeName').val();
	jsonObject.consigneePhoneNumber			= $('#consigneePhoneNumber').val();
		
	if(configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consigneePhn").val().includes("*"))
		jsonObject.consigneePhn = $('#prevConsigneePhn').val();
	else
		jsonObject.consigneePhn = $('#consigneePhn').val();

	jsonObject.isConsigneeTBBParty			= isConsigneeTBBParty;	
	jsonObject.consigneePartyCode			= $('#consigneePartyCode').val();

	if (getValueFromInputField('consigneeAddress') != "" && getValueFromInputField('consigneeAddress') != "Address")
		jsonObject.consigneeAddress		= getValueFromInputField('consigneeAddress');
	
	jsonObject.consigneePin				= $('#consigneePin').val();
	jsonObject.consigneeContactPerson	= $('#consigneeContactPerson').val();
	jsonObject.consigneeEmail			= $('#consigneeEmail').val();
	jsonObject.consigneeFax				= $('#consigneeFax').val();
	jsonObject.consigneeDepartment		= $('#consigneeDepartment').val();
	jsonObject.consigneeTin				= $('#consigneeTin').val();
	jsonObject.consigneePan				= $('#consigneePan').val();
	
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
		jsonObject.consigneeGstn		= $('#consigneeCorpGstn').val();
	else
		jsonObject.consigneeGstn		= $('#consigneeGstn').val();
	
	jsonObject.isSmsSendToConee			= $("#isSmsSendToConee").prop( "checked");
	
	if(consigneeAutofillShortcutAllow) {
		$('#prevConsigneeName').val((jsonObject.consigneeName).trim());
		$('#prevConsigneePhn').val(jsonObject.consigneePhn);
		$('#prevConsigneeAddress').val(jsonObject.consigneeAddress);
		$('#prevConsigneeTin').val(jsonObject.consigneeTin);
		$('#prevConsigneeCorpId').val(jsonObject.consigneePartyMasterId);
		$('#prevConsigneePartyMasterId').val(jsonObject.consigneePartyMasterId);
		$('#prevConsigneeGstn').val(jsonObject.consigneeGstn);
	}
}

function getWayBillType(jsonObject) {
	if($('#wayBillType').val() != '') {
		jsonObject.wayBillType		= Number($('#wayBillType').val());
		jsonObject.wayBillTypeId	= Number($('#wayBillType').val());
	}
}

function getPartialPaymentDetails(jsonObject) {
	if (configuration.paidPartialPaymentOnBooking == 'true') {
		jsonObject.receivedAmt			= getValueFromInputField('receivedAmount');
		jsonObject.balanceAmt			= getValueFromInputField('balanceAmount');
		jsonObject.partialPaymentMode	= getValueFromInputField('paymentMode');
		jsonObject.partialChequeDate	= getValueFromInputField('partialChequeDate');
		jsonObject.partialChequeNo		= getValueFromInputField('partialChequeNo');
		jsonObject.partialBankName		= getValueFromInputField('partialBankName');
	}
}

function getFormTypeDetails(jsonObject) {
	var formTypeArray = [];

	if(configuration.FormsWithSingleSlection == 'true') {
		var formTypeId = Number(getSeletedValueFromList('singleFormTypes'));
		
		if(formTypeId > 0)
			formTypeArray.push(formTypeId);
	} else
		formTypeArray	= getAllCheckBoxSelectValue('multiselect_formTypes');
		
	if($('#form_403_402').val() > 0)
		formTypeArray.push($('#form_403_402').val());
			
	if($('#CTForm').val() > 0)
		formTypeArray.push($('#CTForm').val());
	
	if(isCCAttached)
		formTypeArray.push(FormTypeConstant.CC_ATTACHED_FORM_ID);
		
	jsonObject.FormTypes	= formTypeArray.join(',');
}

function getBillSelection(jsonObject) {
	var billSelectionId		= $('#billSelection').val();
	
	if(billSelectionId == undefined) {
		if(isManualWayBill && configuration.defaultbillselectionForManualLr == 'true')
			billSelectionId		= Number(configuration.defaultBillSelectionIdForManualLr);
		else
			billSelectionId		= Number(configuration.defaultBillSelectionId);
	}
			
	jsonObject.billSelection 		= billSelectionId;
	jsonObject.billSelectionId 		= billSelectionId;
}

function getRiskAllocation(jsonObject) {
	var riskAllocation				= $('#riskallocation').val();
	
	if(riskAllocation == undefined && (configuration.byDefaultRiskAllocationAllowed == 'true' || configuration.byDefaultRiskAllocationAllowed == true))
		riskAllocation	= configuration.DefaultRiskAllocationId;
	
	jsonObject.riskAllocation		= riskAllocation;
}

function getFormNumber(jsonObject) {
	var tempFormNumber = null;
	var ewayBillIds		= "";
	
	if(checkBoxArray.length > 0) {
		tempFormNumber = checkBoxArray.join(',');
		
		if (tempFormNumber.startsWith(','))
	   		tempFormNumber = tempFormNumber.slice(1);
	  		
	  	if (tempFormNumber.endsWith(','))
	   		tempFormNumber = tempFormNumber.slice(0, -1);
  	}
	
	if (configuration.FormsWithMultipleSelection == 'true') {
		jsonObject.sugamNumber			= $("#sugamNumber").val();
		jsonObject.hsnNumber			= $('#hsnNumber').val();
		jsonObject.sacNumber			= $('#sacNumber').val();
		
		getSingleFormNumber(jsonObject, tempFormNumber);
	} else if($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID)
		getSingleFormNumber(jsonObject, tempFormNumber);
	else
		jsonObject.formNumber		=  $('#formNumber').val();
		
	if (Object.keys(eWayBillDetailsIdHM).length > 0) {
   	 	ewayBillIds = Object.values(eWayBillDetailsIdHM).join(',');
    }
    
    jsonObject.eWayBillDetailsIds	= ewayBillIds;
}

function getSingleFormNumber(jsonObject, tempFormNumber) {
	let ewayBillNumber	= $('#ewayBillNumber').val();
	
	if(configuration.isShowSingleEwayBillNumberField == 'true') {
		if(ewayBillNumber.length == 12)
			jsonObject.formNumber	= ewayBillNumber;
	} else
		jsonObject.formNumber		= tempFormNumber;
}

//Added By Anant Chaudhary	17-02-2016
function getNumberTypesDetails(jsonObject) {
	let numberTypesArr			= new Array();

	if(numberTypes != null) {
		for(let i = 0; i < numberTypes.length; i++) {
			let numberTypesData		= new Object();

			numberTypesData.accountGroupId	= accountGroupId;
			numberTypesData.numberTypeId	= numberTypes[i].numberTypeId;
			numberTypesData.numberTypeValue	= getValueFromInputField('numberType' + numberTypes[i].numberTypeId);
			numberTypesData.partyId			= getValueFromInputField('partyMasterId');

			numberTypesArr.push(numberTypesData);
		}
	}

	jsonObject.WBNumberTypeArr	= numberTypesArr;
}

function getRemarkDetailOnBookingCharge(jsonObject){
	if(configuration.wayBillChargeWiseRemarkNeeded == 'false')
		return true;

	var chargeIdList 		= (configuration.waybillChargeMasterIdsForRemark).split(',');
	var wayBillBookingChargeRemarkArray	= new Array();

	var charges	= jsondata.charges;

	for(var i = 0; i < charges.length; i++) {
		let chargeId	= charges[i].chargeTypeMasterId;

		if(isValueExistInArray(chargeIdList, chargeId)) {
			let wayBillBookingChargeRemarkObject = new Object();

			wayBillBookingChargeRemarkObject.txnTypeId				= 1;
			wayBillBookingChargeRemarkObject.accountGroupId			= accountGroupId;
			wayBillBookingChargeRemarkObject.wayBillChargeMasterId	= charges[i].chargeTypeMasterId;
			wayBillBookingChargeRemarkObject.wayBillChargeRemark	= getValueFromInputField('remark_' + charges[i].chargeTypeMasterId);
			wayBillBookingChargeRemarkArray.push(wayBillBookingChargeRemarkObject);
		}
	}

	jsonObject.wayBillBookingChargeRemarkArray	= wayBillBookingChargeRemarkArray;
}

function getBookingTypeandDetails(jsonObject) {
	let bookingTypeId	= getBookingType();
	jsonObject.bookingType		= bookingTypeId;

	if ($('#bookingType').exists()
		&& (bookingTypeId == BOOKING_TYPE_FTL_ID
			|| bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID
			|| (bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID && configuration.ShowTruckTypeOnDDDV == 'true')
			|| (bookingTypeId == BOOKING_TYPE_SUNDRY_ID && configuration.showVehicleNumberAndVehicleTypeOnSundry == 'true')
			|| (configuration.isShowVehicleNumberForAllBookingType == 'true' || configuration.isShowVehicleNumberForAllBookingType == true))) {
		jsonObject.vehicleNumber	= $('#vehicleNumber').val();
		jsonObject.vehicleType		= $('#vehicleType').val();
	}
}

function getReamrk(jsonObject) {
    var appendRemark    = remarkApend();
    jsonObject.remark   = appendRemark != "" ? (appendRemark + $('#remark').val()) : $('#remark').val();
    jsonObject.wayBillRemark	= jsonObject.remark;
}

function getCBMValueRate(jsonObject) {
	jsonObject.CBMValue	= $('#CBMValue').val();
	jsonObject.CBMRate	= $('#CBMRate').val();
}

function getPaymentTypeandDetails(jsonObject) {
	if(Number($('#wayBillType').val()) == WAYBILL_TYPE_PAID || Number($('#wayBillType').val()) == WAYBILL_TYPE_TO_PAY) {
		jsonObject.paymentType 					= getPaymentType();
		jsonObject.consignmentSummaryPaymentType= getPaymentType();
	}
	
	if ($('#paymentType').exists()) {
		if ($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID)
			getChequeDetails(jsonObject);
		else if ($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
			jsonObject.selectedCollectionPersonId	= $('#selectedCollectionPersonId').val();
		else if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_POS_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_TRANSFER_ID)
			getPaytmDetails(jsonObject);
		else if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID)
			getCreditDebitCardDetails(jsonObject);
		else if($('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID)
			getIMPSDetails(jsonObject);
		
		jsonObject.paymentValues = $('#paymentCheckBox').val();
	}
}

//modified function of delivery to with default configurations
function getDeliveryTo(jsonObject) {
	let deliveryTo	= $('#deliveryTo').val();
	
	jsonObject.deliveryTo			= deliveryTo;
	
	if(configuration.DeliveryAt == 'false' && (deliveryTo == undefined || deliveryTo == 0))
		jsonObject.deliveryTo	= defaultDeliveryAt;
}

function getChargeDetails(jsonObject) {
	var charges		= jsondata.charges;
	var chargesColl = new Array(); 
	
	for ( var i = 0; i < charges.length; i++) {
		let chargeTypeMasterId	= charges[i].chargeTypeMasterId;
		jsonObject[$('#charge' + chargeTypeMasterId).attr("id")] = $('#charge' + chargeTypeMasterId).val();
		chargesColl[chargeTypeMasterId] = $('#charge' + chargeTypeMasterId).val();
	}
}

function getDiscount(jsonObject) {
	if(isBookingDiscountAllow) {
		jsonObject.discount				= getValueFromInputField('discount');
		
		if(document.getElementById("isDiscountPercent") != null)
			jsonObject.isDiscountPercent	= document.getElementById("isDiscountPercent").checked;
		else
			jsonObject.isDiscountPercent	= false;
	} else if(applyDiscountThroughMaster == true || applyDiscountThroughMaster == 'true')
		jsonObject.discount				= getValueFromInputField('discount');
}

function checkPhotoValidation() {
	if(servicePermission.isPhotoTxnService) {
		if(configuration.stopPhotoValidationForReverseBooking == 'true' || configuration.stopPhotoValidationForReverseBooking == true) {
			if((Number($('#manualEntryType').val()) != TransportCommonMaster.MANUAL_REVERSE_ENTRY) && isCanvasBlank('pictureCanvas')) {
				showMessage('error', "Please take customer photo !");
				hideLayer();
				return false;
			}
		} else if (isCanvasBlank('pictureCanvas')) {
			showMessage('error', "Please take customer photo !");
			hideLayer();
			return false;
		}
	}
	
	return true;
}

function setFocusOnBillSelection() {
	$('#billSelection').focus();

	$(document).one("keyup",function(e) {
		if (e.keyCode === 27)
			$('#billSelection').focus();   // esc
	});
}

function disableButton() {
	//$('#save').prop("disabled", "true");
	document.getElementById('save').disabled = true
	document.getElementById('Consigneradd').focus();
}

function enableButton() {
	$('#save').removeAttr("disabled");
}

function isChargeDisplayable() {
	var wayBillType	= document.getElementById("wayBillType").value;

	wayBillType = wayBillType.replace(/\n/g,'');
	wayBillType = wayBillType.replace(/\r/g,'');
	wayBillType = wayBillType.toUpperCase();

	return !(wayBillType == "FOC" || wayBillType == "CREDIT");
}

function ShowDialog(modal) {
	switchHtmlTagClass('overlay', 'show', 'hide');
	$("#dialog").fadeIn(300);
	$('#newPartyType').focus();
	
	if (modal)
		$("#overlay").unbind("click");
	else {
		$("#overlay").click(function (){
			HideDialog();
		});
	}
}

function HideDialog() {
	switchHtmlTagClass('overlay', 'hide', 'show');
	$("#dialog").fadeOut(300);
}

var localAutocompletedata	= null;
var count = 1;

//Customer

function showhidedetails(div, ahref) {
	if(ahref == 'Consigneradd') {
		switchHtmlTagClass(div, 'show', 'hide');
		switchHtmlTagClass('Consigneradd', 'visibility-hidden', 'visibility-visible');
		switchHtmlTagClass('Consignersub', 'visibility-visible', 'visibility-hidden');
		$('#consignorAddress').show();
	} else if(ahref == 'Consignersub') {
		switchHtmlTagClass(div, 'hide', 'show');
		switchHtmlTagClass('Consigneradd', 'visibility-visible', 'visibility-hidden');
		switchHtmlTagClass('Consignersub', 'visibility-hidden', 'visibility-visible');
		$('#consignorAddress').show();
	} else if(ahref == 'Consigneeadd') {
		switchHtmlTagClass(div, 'show', 'hide');
		switchHtmlTagClass('Consigneeadd', 'visibility-hidden', 'visibility-visible');
		switchHtmlTagClass('Consigneesub', 'visibility-visible', 'visibility-hidden');
		$('#consigneeAddress').show();
	} else if(ahref == 'Consigneesub') {
		switchHtmlTagClass(div, 'hide', 'show');
		switchHtmlTagClass('Consigneeadd', 'visibility-visible', 'visibility-hidden');
		switchHtmlTagClass('Consigneesub', 'visibility-hidden', 'visibility-visible');
		$('#consigneeAddress').show();
	}
}

function hidePaidHamali() {
	changeDisplayProperty('label19', 'none');
	changeDisplayProperty('charge19', 'none');
}

function hideCharge(chargeId) {
	changeDisplayProperty('label' + chargeId, 'none');
	changeDisplayProperty('charge' + chargeId, 'none');
}

function showCharge(chargeId) {
	changeDisplayProperty('label' + chargeId, 'block');
	changeDisplayProperty('charge' + chargeId, 'block');
}

function showPaidHamali() {
	changeDisplayProperty('label19', 'block');
	changeDisplayProperty('charge19', 'block');
}

function disableHamaliCharge() {
	if(disableHamliChargeOnTopay == 'true') {
		changeDisplayProperty('label24', 'none');
		changeDisplayProperty('charge24', 'none');
	}
}

function enableHamaliCharge() {
	changeDisplayProperty('label24', 'block');
	changeDisplayProperty('charge24', 'block');
}

function disableCharge(chargeId) {
	setTimeout(() => {
		$("#charge" + chargeId).attr('readonly', true);
	}, 200);
}

function displayCommissionFeild(){
	switchHtmlTagClass('commissionPanel', 'show', 'hide');
}

function ShowBillSelectionDialog(){
	$('#billSelection').switchClass("show", "hide");
	$("#billSelectionDialog").fadeIn(300);
	$('#billSelection').focus();
}

function HideBillSelectionDialog(){
	$('#billSelection').switchClass("hide", "show");
	$("#billSelectionDialog").fadeOut(300);
	showBillSelectionTextField();
}

function bindFocusBillSelection() {
	if (jsondata.SHOW_BILL_SELECTION) {
		$("#billSelection").keypress(function () {
			setNextOnBillSelection(this);
		});	

		showBillSelectionTextField();
	}
}

function showBillSelectionTextField(){
	var billSelectionId = $('#billSelection').val();
	
	if(billSelectionId == undefined)
		billSelectionId	= Number(configuration.defaultBillSelectionId);

	if($('#billSelection').val() == BOOKING_WITH_BILL) {
		$('#billSelectionText').html(BOOKING_WITH_BILL_NAME);
		$('#billSelectionText').removeClass("withoutbill").removeClass("billSelectionGst").addClass("withbill");
	} else if($('#billSelection').val() == BOOKING_WITHOUT_BILL) {
		$('#billSelectionText').html(BOOKING_WITHOUT_BILL_NAME);
		$('#billSelectionText').removeClass("withbill").removeClass("billSelectionGst").addClass("withoutbill");
		changeDisplayProperty('invoiceMandatory', 'none');
		changeDisplayProperty('declaredMandatory', 'none');
	} else if($('#billSelection').val() == BOOKING_GST_BILL) {
		$('#billSelectionText').html(BOOKING_GST_BILL_NAME);
		$('#billSelectionText').removeClass("withbill").removeClass("withoutbill").addClass("billSelectionGst");
		changeDisplayProperty('invoiceMandatory', 'none');
		changeDisplayProperty('declaredMandatory', 'none');
	}
	
	hideShowGstOnEstimateLR();
}

function hideShowGstOnEstimateLR() {
	if(configuration.hideGstnForEstimateLR == 'true' && $('#billSelection').val() == BOOKING_WITHOUT_BILL) {
		$('#gstnCorpConsignor').hide()
		$('#gstnCorpConsignee').hide()
	} else {
		$('#gstnCorpConsignor').show()
		$('#gstnCorpConsignee').show()
	}
}

function bindFocusOnFormNumber() {
	var waybillnumber	= $('#singleFormTypes').val();

	if(waybillnumber == FormTypeConstant.WAY_BILL_FORM_ID  || waybillnumber == FormTypeConstant.WAYBILL_AND_CC_ID)
		next = 'formNumber';
	else if(waybillnumber == FormTypeConstant.E_SUGAM_NO_ID)
		next = 'sugamNumber';
	else if(waybillnumber == FormTypeConstant.E_WAYBILL_ID) {
		if(configuration.isAllowEWayBillExemptedValidation == 'true' && noOfArticlesAdded >= 1 && counterForNonEmpty > 0 
				&& (Object.values(consignmentEWayBillExemptedObj)[0] == 'true' || Object.values(consignmentEWayBillExemptedObj)[0] == true))
			return;
			
		if($('#addMutipleEwayBill').exists())
			next = 'addMutipleEwayBill';
		else
			next = 'ewayBillNumber';
	} else if(waybillnumber == FormTypeConstant.HSN_CODE) {
		if(configuration.isAllowEWayBillExemptedValidation == 'true' && noOfArticlesAdded >= 1 && counterForNonEmpty > 0 
				&& (Object.values(consignmentEWayBillExemptedObj)[0] == 'true' || Object.values(consignmentEWayBillExemptedObj)[0] == true))
			return;
			
		next = 'ewayBillNumber';
	} else 
		next = 'STPaidBy';
}	

function moveCursorToSTPaid(elObj) {
	if(configuration.gstnNumber == 'true')
		return;

	var amount 		= parseFloat(getValueFromInputField('totalAmt'));
	var discount	= 0;

	if($('#discount').exists())
		discount	= $('#discount').val();

	var discAmount 	= 0;

	if($('#isDiscountPercent').exists()) {
		if(isCheckBoxChecked('isDiscountPercent'))
			discAmount	= amount - parseFloat(discount) * amount / 100;
		else
			discAmount	= amount - parseFloat(discount);
	} else
		discAmount	= amount - parseFloat(discount);

	discAmount = Math.round(discAmount);

	if(discAmount > 750) {
		if(!isServiceTaxPaidBy) {
			var STPaidBycombo = document.wayBillForm.STPaidBy;

			STPaidBycombo.length			= 4;
			STPaidBycombo.options[0].text 	= '--- Select ---';
			STPaidBycombo.options[0].value 	= 0;
			STPaidBycombo.options[1].text 	= TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME;
			STPaidBycombo.options[1].value 	= TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
			STPaidBycombo.options[2].text 	= TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME;
			STPaidBycombo.options[2].value 	= TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID;
			STPaidBycombo.options[3].text 	= TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME;
			STPaidBycombo.options[3].value 	= TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;

			if (elObj.id !='STPaidBy')
				STPaidBycombo.selectedIndex = 0;
		}

		isPanNumberRequired = true;
	}
}

function setPartialReceivedAmount() {

	var modal = document.getElementById('partialPaymentModal');
	var span = document.getElementsByClassName("close")[0];
	var partialPaymentType	= $('#partialPaymentType').val();

	if(configuration.paidPartialPaymentOnBooking == 'true' && partialPaymentType == SHORT_CREDIT_PARTIAL_PAYMENT){
		$("#partialPaymentModal").removeClass("hide")
		modal.style.display = "block";
	}
	
	span.onclick = function() {
		modal.style.display = "none";
		setValueToTextField('partialPaymentType',0);
	}

	$('#receivedAmtEle').focus();
	$('#grandTotalEle').val($('#grandTotal').val());
	setPaymentModeOption();
	showpartialChequeDetails();
}

function calculateBalance() {

	var grandTotal = $('#grandTotal').val();
	var receivedAmt = $('#receivedAmtEle').val();

	if(Number(grandTotal) == Number(receivedAmt)) {
		showMessage('error', "If You Are Receive Full Amount, Then Please Select Cash Payment Type !");
		setValueToTextField('balanceAmtEle', 0);
	} else if(Number(grandTotal) < Number(receivedAmt)) {
		showMessage('error', "You Can Not Enter Excess Amount !");
		setValueToTextField('balanceAmtEle', 0);
		resetPartialChequePaymentDetails();
	} else {
		setValueToTextField('balanceAmtEle', (Number(grandTotal) - Number(receivedAmt)));
		return true;
	}
	
	return false;
}

function setResetPartialPaymentOption(obj) {
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
		switchHtmlTagClass('tableSearchCollectionPerson', 'show', 'hide');

		if(configuration.paidPartialPaymentOnBooking == 'true') {
			switchHtmlTagClass('partialPaymentTypeDiv', 'show', 'hide');
			switchHtmlTagClass('receivedAmountlPanel', 'show', 'hide');
			switchHtmlTagClass('balanceAmountPanel', 'show', 'hide');
		}
	} else {
		resetPartialPaymentDetails();
		resetPartialChequePaymentDetails();
		switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
		switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
		switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		switchHtmlTagClass('tableSearchCollectionPerson', 'hide', 'show');
		resetTableSearchCollectionPerson();
	}
	
	if(configuration.isAlertOnCashPayment == true || configuration.isAlertOnCashPayment == 'true') {
		var branchIdListForAlertOnCashPayment	= (configuration.branchIdsForAlertOnCashPayment).split(',');

		if(isValueExistInArray(branchIdListForAlertOnCashPayment, executive.branchId)) {
			if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
				$('#confirmSaveLR').bPopup({
					 	modalClose: false,
			            opacity: 0.6,
			            positionStyle: 'fixed'
				}, function() {
					var _thisMod = this;
					next	= "confirmDiv";
					$('#confirmDiv').focus();
					
					$(this).html("<div class='confirm' id = 'confirmDiv' style='height:150px;width:250px; padding:5px'>"
					+"<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Are you sure you are receiving cash payment ?</b><div><br/>"		
					+"<button autofocus id='confirm'>OK</button></center>"
					+"<button id='cancelButton'>Cancel</button></div>")
					
						$("#confirm").click(function() {
							$('#confirmDiv').focus();
							obj.value = PaymentTypeConstant.PAYMENT_TYPE_CASH_ID;
							_thisMod.close();
							$('#podRequiredStatus').focus();
						})
						
						$("#cancelButton").click(function() {
							$('#confirmDiv').focus();
							for(i=0;i<paymentTypeArr.length;i++){
								if(paymentTypeArr[i].paymentTypeId == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID){
									obj.value = PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID;
									$('#paymentType').focus();
									break;
								} else {
									obj.value = 0;
									$('#paymentType').focus();
								}
							}
							_thisMod.close();
						})
				})
			}
		}
	}
}

function setReceivedAndBalanceAmount() {
	if(!calculateBalance())
		return;
	
	if( $('#receivedAmtEle').val() == 0) {
		showMessage('error', receivedAmountErrMsg);
		return;
	}

	if($('#paymentMode').val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
		if( $('#partialChequeNo').val() == '') {
			showMessage('error', chequeNumberErrMsg);
			return;
		}

		if($('#partialBankName').val() == '') {
			showMessage('error', bankNameErrMsg);
			return;
		}
	}

	bindFocusOnLastCharge();
	var modal = document.getElementById('partialPaymentModal');
	setValueToTextField('receivedAmount', $('#receivedAmtEle').val());
	setValueToTextField('balanceAmount', $('#balanceAmtEle').val());
	modal.style.display = "none";
}

function showpartialChequeDetails() {
	if($("#paymentMode").val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
		switchHtmlTagClass('partialChequeDetails', 'show', 'hide');
	else
		switchHtmlTagClass('partialChequeDetails', 'hide', 'show');
	
	$( function() {
		$('#partialChequeDate').daterangepicker({
			singleDatePicker: true,
			showDropdowns: true,
			maxDate	: moment().add(3, 'month').endOf('month'),
			minDate	: moment().subtract(3, 'month').startOf('month')
		});
	} );
}

function setPartialChequeAmount() {
	if($("#partialChequeAmount").exists()) {
		if($("#paymentMode").val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
			$("#partialChequeAmount").val($("#receivedAmtEle").val());
		else
			$("#partialChequeAmount").val('');
	}
}

function setConsignorShortcut() {
	if(consignorAutofillShortcutAllow) {
		$('#consignorName').val($('#prevConsignorName').val());
		$('#consignorPhn').val($('#prevConsignorPhn').val());
		$('#consignorAddress').val($('#prevConsignorAddress').val());
		$('#consignorTin').val($('#prevConsignorTin').val());
		$('#consignorCorpId').val($('#prevConsignorCorpId').val());
		$('#partyMasterId').val($('#prevConsignorPartyMasterId').val());
		$('#consignorGstn').val($('#prevConsignorGstn').val());
		$('#consignoCorprGstn').val($('#prevConsignorGstn').val());
		$('#billingPartyId').val($('#prevBillingPartyId').val());
		$('#billingPartyName').val($('#prevBillingPartyName').val());
		$('#billingGstn').val($('#prevBillingGstn').val());
	}
}

function setConsigneeShortcut() {
	if(consigneeAutofillShortcutAllow) {
		$('#consigneeName').val($('#prevConsigneeName').val());
		$('#consigneePhn').val($('#prevConsigneePhn').val());
		$('#consigneeAddress').val($('#prevConsigneeAddress').val());
		$('#consigneeTin').val($('#prevConsigneeTin').val());
		$('#consigneeCorpId').val($('#prevConsigneeCorpId').val());
		$('#consigneePartyMasterId').val($('#prevConsigneePartyMasterId').val());
		$('#consigneeGstn').val($('#prevConsigneeGstn').val());
		$('#consigneeCorpGstn').val($('#prevConsigneeGstn').val());
	}
}

function checkWayBillTypeAndDestinationBranchWiseBooking() {

	let jsonObject	= new Object();
	jsonObject.sourceBranchId		= getSourceBranchId();
	jsonObject.destinationBranchId	= Number($('#destinationBranchId').val());
	jsonObject.wayBillTypeId		= Number($('#wayBillType').val());
	jsonObject.filter				= 7;
	
	let jsonStr	= JSON.stringify(jsonObject);
	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13", {json:jsonStr}, function(data) {
		if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
			showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
			hideLayer();
		} else if(!data.flag) {
			setTimeout(function(){
			showMessage('error', iconForErrMsg + '<b style="font-size : 20px;">You are not allow to Book '+$("#lrType").html()+' LR For '+$("#destination").val()+' Branch</b>'); // show message to show system processing error massage on top of the window.
			}, 100);
			resetDestination();
			$('#destination').focus();
			isValidationError=true;
			return false;
		}
	});	
}

function getHtmlForLrType() {
	var waybillType		= null;
	var grandTotal		= $("#grandTotal").val();
	var grandTotalAmt 	= "";
	var tdsAmount = Number($("#tdsAmount").val()) || 0;
	
	if(configuration.showLrAmountInSavePopup == 'true' && Number($('#wayBillType').val()) != WAYBILL_TYPE_FOC)
		var grandTotalAmt = "Of <br> <b style='color: #4A61A8;font-size:25px'> Amount "+(grandTotal-tdsAmount)+"</b>" ; 
	
	if(Number($('#wayBillType').val()) == WAYBILL_TYPE_PAID)
		waybillType		= "<b style='background-color: #0073BA; color: #FFF;font-size:40px'>PAID </b> LR "+grandTotalAmt+" ? ";
	else if(Number($('#wayBillType').val()) == WAYBILL_TYPE_TO_PAY)
		waybillType		= "<b style='background-color: #E77072; color: #FFF;font-size:25px'>TO PAY</b> LR "+grandTotalAmt+" ? ";
	else if(Number($('#wayBillType').val()) == WAYBILL_TYPE_CREDIT)
		waybillType		= "<b style='background-color: #52AEC6; color: #FFF;font-size:25px'>TBB</b> LR "+grandTotalAmt+" ? ";
	else if(Number($('#wayBillType').val()) == WAYBILL_TYPE_FOC)
		waybillType		= "<b style='background-color: #2CAE54; color: #FFF;font-size:25px'>FOC</b> LR "+grandTotalAmt+" ? ";

	return waybillType;
}

//showMsgToConfirm door delivery charge enterd or not
function showMsgToConfirm() {
	var el = false;
	
	if(configuration.DoorDeliveryChargeValidate == 'true') {
		if($('#charge' + ChargeTypeMaster.DOOR_DLY_BOOKING) != undefined) {
			var doorDeliveryCharge 	= $('#charge' + ChargeTypeMaster.DOOR_DLY_BOOKING).val();
			var isReadOnly 			= document.getElementById('charge' + ChargeTypeMaster.DOOR_DLY_BOOKING).readOnly;
			
			if (isReadOnly != true && doorDeliveryCharge == 0) { 
				el = true;
				//var el = confirm("You are booking LR for Door delivery,\t\n\n but Door Delivery charge is missing.\t\n\n Are you sure you want to continue ?\n ");
				return el;
			}
		}
	}
	
	return false;
}

function beforeSaveLrPopup(value){
	if(configuration.isRateCheckingBeforeLrSave == 'true') {
		if ($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
			if(executive.subRegionId != SubRegion.SUBREGION_ID_HEAD_OFFICE) {			//(Head-office subRegionId)	
				confirmSaveLRPopup(value);
				return;
			}
			
			var ans = false;
			var currentChargeTypeId	= getValueFromInputField('chargeType');
			
			if(currentChargeTypeId == CHARGETYPE_ID_QUANTITY) {
				if(qtyAmt <= 0) {
					ans = confirm("Lr Rate Not Found For Article. Are you sure to Create LR Without Rate..?")
					
					if(!ans) {
						return false;
					} else {
						setTimeout(function(){
							confirmSaveLRPopup(value);
						}, 100);
					}
				} else
					confirmSaveLRPopup(value);
			} else if(currentChargeTypeId == CHARGETYPE_ID_WEIGHT) {
				if(weightFromDb <= 0){
					ans = confirm("Lr Rate Not Found For Weight. Are you sure to Create LR Without Rate..?");
					
					if(!ans) {
						return false;
					} else {
						setTimeout(function(){
							confirmSaveLRPopup(value);
						}, 100);
					}
				} else
					confirmSaveLRPopup(value);
			} else
				confirmSaveLRPopup(value);
		} else
			confirmSaveLRPopup(value);
	} else
		confirmSaveLRPopup(value);
}

function confirmSaveLRPopup(value){
	if(!checkPhotoValidation()){
		enableButton();
		return false;
	}
	
	var msg = showMsgToConfirm();  //= delivery charge confirmation..
	$('#confirmSaveLR').bPopup({
		escClose: true,
		onOpen: function() {
			$('#save').addClass("hide");
			$("#save").attr("disabled", true);
		}, onClose: function() {
			$('#save').removeClass("hide");
			$("#save").attr("disabled", false);
		}
	},function(){
		$('#save').addClass("hide");
		$("#save").attr("disabled", true);
		
		var _thisMod = this;
		let waybillType	= getHtmlForLrType();
		
		if(isPaidByDynamicQRCode){
			_thisMod.close();
			setPartyOrCreditorIdInDDDVCase(value);
			isWayBillSaved = true;
			showLayer();

			if (!doneTheStuff)
				createWayBill();
		}else{
			if(!isPinodeForIns || !isAddressForIns) {
				$(this).html("<div class='confirm' style='height:230px;'><h1 style='color: red;font-size:20px;'>Pincode or Address is missing, Insurance will not be generate.<br><br><span style='color: #2CAE54;font-size:18px;'> Are you sure you want to Save " + waybillType + " without Insurance !</span><br><p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p></h1><button id='cancelButton'>Cancel</button><button autofocus id='confirm'>Ok</button></div>")
			} else if(msg) {
				if ($('#wayBillType').val() != WAYBILL_TYPE_FOC)
					$(this).html("<div class='confirm' style='height:230px;'><h1 style='color: red;font-size:20px;'>You are booking LR for Door delivery, but Door Delivery charge is missing.<br><br><span style='color: #2CAE54;font-size:18px;'> Are you sure you want to Save " + waybillType + " </span><br><p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p></h1><button id='cancelButton'>Cancel</button><button autofocus id='confirm'>Ok</button></div>")
				else
					$(this).html("<div class='confirm' style='height:230px;'><h1 style='color: red;font-size:20px;'>Are you sure you want to Save " + waybillType + " </span><br><p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p></h1><button id='cancelButton'>Cancel</button><button autofocus id='confirm'>Ok</button></div>")
			} else
				$(this).html("<div class='confirm'><h1 style='color: #2CAE54;font-size:20px'>Do you want to Save " + waybillType + "  </h1><p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>")
				
			$("#confirm").focus();
			$("#confirm").one('click',function(){
				_thisMod.close();
				setPartyOrCreditorIdInDDDVCase(value);
				isWayBillSaved=true;
				showLayer();
				
				if(!doneTheStuff)
					createWayBill();
			})
	
			$("#confirm").one('keydown', function(e) {
				if (e.which == 27)  //escape
					_thisMod.close();
			});
			
			$("#cancelButton").click(function(){
				doneTheStuff 	= false
				isWayBillSaved	= false;   //Change flag
				$('#save').removeClass("hide");
				$("#save").attr("disabled", false);
				_thisMod.close();
			})
		}
	});
}

function viewAllConsignmentGoods(event) {
	var modal 		= document.getElementById('viewAllConsignmentGoodsModal');
	var span 		= document.getElementsByClassName("closet")[0];

	showLayer();

	if(consignmentGoodsArrList == null) {
		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL+'/consignmentGoodsWS/getAllConsignmentGoodsDetailsByAccountGroupId.do',
			dataType: 'json',
			success: function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + "No Record Found !");
					hideLayer();
				} else if(data != null && data.consignmentGoodsArrList != null) {
					consignmentGoodsArrList	= data.consignmentGoodsArrList;
					setConsignmentGoodsInTable(consignmentGoodsArrList);
				}
			}
		});
	} else
		setConsignmentGoodsInTable(consignmentGoodsArrList);

	$('#viewAllConsignmentGoodsModal .modal-content-saidToContain').css("top", Number(event.clientY)+33);
	$('#viewAllConsignmentGoodsModal .stick ').css("top", Number(event.clientY)+8);

	$("#viewAllConsignmentGoodsModal").removeClass("hide")
	modal.style.display = "block";

	span.onclick = function() {
		modal.style.display = "none";
		$("#viewAllConsignmentGoodsModal").addClass("hide");
		$("#myInput").val('');
	}
	
	hideLayer();
}

function setConsignmentGoodsInTable(consignmentGoodsArrList) {
	$('.consignmentGoodsTable').empty();
	
	for(let i = 0; i < consignmentGoodsArrList.length; i++) {
		tableRow		= createRow(i, '');

		srNo				= createColumnInRow(tableRow, '', i, '10%', 'left', 'padding-left : 25px;height:20px;', '');
		saidToContain		= createColumnInRow(tableRow, '', i+1, '20%', 'left', 'padding-left : 25px;height:20px;', '');

		appendValueInTableCol(srNo,  (i+1));
		appendValueInTableCol(saidToContain,  (consignmentGoodsArrList[i].name));

		$('.consignmentGoodsTable').append(tableRow);
	}
}

function showLBHPanel() {
	resetArticleWithTableAfterSave();
	
	if ($('#volumetric').is(':checked')) {
		if (configuration.VolumetricWiseAddArticle == 'true') {
			$('#volumetricDiv').removeClass('hide');
			
			if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
				$('#volumetricSelectionDiv').removeClass('hide');

			if($("#chargeType").val() ==  CHARGETYPE_ID_WEIGHT && configuration.showVolumetricOnWeight == "true") {
				$("#actualWeight").attr("readonly", "readonly");
				$('#cftWeightDiv').removeClass('hide');
			} else {
				$('#actualWeight').removeAttr('readonly');
				$('#cftWeightDiv').addClass('hide');
			}
			
			if(configuration.isCftEditable == 'false')
				$("#cftRate").attr("readonly", "readonly");
				
			getWeightTypeRates();
		} else {
			switchHtmlTagClass('LBH', 'show', 'hide');
			
			if($('#length').val()=='' || $('#length').val() == 0)
				$('#length').focus();
		}
	} else {
		switchHtmlTagClass('LBH', 'hide', 'show');
		$('#volumetricSelectionDiv').addClass('hide');
		$('#volumetric').attr('checked', false);
		$('#volumetricDiv').addClass('hide');
		$('#cftWeightDiv').addClass('hide');
		
		resetLBH();
		$('#actualWeight').removeAttr('readonly');
		$('#chargedWeight').removeAttr('readonly');
		
		$('#myTBody tr').remove();
		$('#myTBody1 tr').remove();
		
		artActWeightArr 	= {};
		artChrgWeightArr	= {};
		
		$("#myTBody").hide();
		$("#myTBody1").hide();
	}
	
	applyRates();
}

function setActualChargesWeight() {
	let tempWeight		= $('#tempWeight').val();
	$('#actualWeight').val(tempWeight);
	$('#chargedWeight').val(tempWeight);

}

function checkWayBillTypeWiseTaxCalculation() {
	let	isWayBillTypeWiseTaxCalculationAllow = configuration.isWayBillTypeWiseTaxCalculationAllow;

	if(isWayBillTypeWiseTaxCalculationAllow == 'true' || isWayBillTypeWiseTaxCalculationAllow == true) {
		let wayBillTypeList = (configuration.wayBillTypeIdToNotAllowForTax).split(',');
		let branchList 		= (configuration.branchesToNotAllowForTax).split(',');
		let taxPaidByVal	= $('#STPaidBy').val(); 
		let checkBranch 	= isValueExistInArray(branchList, branchId);

		for(const element of wayBillTypeList) {
			if(Number($('#wayBillType').val()) == element && checkBranch && taxPaidByVal == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID) {
				showMessage('info', taxErrMsg);
				$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID);
				return false;
			}
		}
	}

	return true;

}

function checkExemptedSelectionAllow() {
	if(configuration.validateConsignmentOnExempted == 'true' || configuration.validateConsignmentOnExempted == true) {
		if(!checkIfPartyIsExempted()) {
			if(isConsignmentExempted == "true" || isConsignmentExempted == true) {
				$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
			} else if (isConsignmentExempted == "false" || isConsignmentExempted == false) {
				if($('#STPaidBy').val() == TAX_PAID_BY_EXEMPTED_ID) {
					showMessage('info', 'You can not select "Exempted"');
					setDefaultSTPaidBy(Number($('#wayBillType').val()));
				}
			}
		} else
			$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID);
	}
}

function setDefaultRiskAllocation(){
	if (configuration.isRiskAllocationAllow != 'true')
		return;

	if(configuration.byDefaultRiskAllocationAllowed == 'true' || configuration.byDefaultRiskAllocationAllowed == true)
		$('#riskallocation').val(configuration.DefaultRiskAllocationId);
}

function getBranchPincodeList(destBranchId) {
	branchPincodeConfigList	= null;
	let jsonObject			= new Object();

	jsonObject["configBranchId"]	= destBranchId;

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchPincodeConfigurationWS/getBranchPincodeListByAssignBranchId.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			branchPincodeConfigList	= data.branchPincodeConfigList;
		}
	});
}

function getAccountNumberForGroup(){
	bankAccountList = null;
	
	var jsonObject			= new Object();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/bankAccountWS/getBankAccountForGroup.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			bankAccountList	= data.BankAccount;
			
			if(bankAccountList != undefined && bankAccountList.length == 1) {
				$("#accountNo").val(bankAccountList[0].bankAccountNumber);
				$("#accountNo_primary_key").val(bankAccountList[0].bankId);
				$("#bankAccountId").val(bankAccountList[0].bankId);
				$("#bankName").focus();
			}
		}
	});
}

function getShortCreditConfigLimitForBranch(){
	shortCreditConfigLimit	= null;
	var jsonObject			= new Object();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getShortCreditConfigLimitForBranch.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			shortCreditConfigLimit = data;
			
			if(shortCreditConfigLimit.shortCreditConfigLimit.creditType == 1)
				showMessage('info', 'Available Short Credit Limit ' + shortCreditConfigLimit.shortCreditConfigLimit.creditLimit + ' !');
			else if(shortCreditConfigLimit.shortCreditConfigLimit.creditType == 2)
				showMessage('info', 'Available Short Credit Balance ' + shortCreditConfigLimit.shortCreditConfigLimit.balance + ' !');
		}
	});
}

function invoiceNumberMandatatoryOnFocus() {
	if(isPackingTypeExistForSkipInvoiceNoValidation())
		return true;
	
	if(!isReserveBookingChecked) {
		if(configuration.invoiceNumberMandatory == 'true'){
			if($('#invoiceNo').val() == '') {
				setTimeout(function() { 
					$('#invoiceNo').focus(); 
					showMessage('error', " Please Enter Invoice Number !");	
				}, 200);
				return false;
			}
		}
	}
}

function calculateInsuranceOnRiskCover() {
	let decVal 			= Number($('#declaredValue').val());
	let perRiskCover 	= $('#percentageRiskCover').val();

	if(configuration.PercentageRiskCover == 'true' && decVal && decVal != "" && perRiskCover && perRiskCover != "") {
		if(decVal > configuration.declaredValueForInsuranceChargeOnRiskCover)
			$('#charge' + INSURANCE).val((decVal * perRiskCover) / 100);
		else
			$('#charge' + INSURANCE).val(configuration.minimumInsuranceChargeOnRiskCover);
	}
	
	if (configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {
		if (decVal == 0 || decVal == "") {
			$('#charge' + INSURANCE).val(0).prop("readonly", true);
			$('#declaredValueCheckBox').prop("checked", false);
			$('#percentageRiskCover').val(0).addClass("hide");
		} else
			$('#charge' + INSURANCE).val((decVal * perRiskCover) / 100);
	}
}

function calcLoadingChrg(tbl_amt, quantity){
	var totalLoading	= 0;
	
	if(tbl_amt == 0){
		totalLoading += 0;
	} else if(tbl_amt > 0 && tbl_amt <= 50){
		totalLoading += (10 * quantity);
	} else if(tbl_amt >= 51 && tbl_amt <= 100){
		totalLoading += (20 * quantity);
	} else if(tbl_amt >= 101 && tbl_amt <= 200){
		totalLoading += (40 * quantity);
	} else if(tbl_amt >= 201 && tbl_amt <= 300){
		totalLoading += (60 * quantity);
	} else if(tbl_amt >= 301 && tbl_amt <= 400){
		totalLoading += (80 * quantity);
	} else if(tbl_amt >= 401 && tbl_amt <= 500){
		totalLoading += (100 * quantity);
	} else if(tbl_amt >= 501 && tbl_amt <= 600){
		totalLoading += (120 * quantity);
	} else if(tbl_amt >= 601 && tbl_amt <= 700){
		totalLoading += (140 * quantity);
	} else if(tbl_amt >= 701 && tbl_amt <= 800){
		totalLoading += (160 * quantity);
	} else if(tbl_amt >= 801 && tbl_amt <= 900){
		totalLoading += (180 * quantity);
	} else if(tbl_amt >= 901 && tbl_amt <= 1000){
		totalLoading += (200 * quantity);
	} else if(tbl_amt >= 1001 && tbl_amt <= 1200){
		totalLoading += (240 * quantity);
	} else if(tbl_amt >= 1201 && tbl_amt <= 1400){
		totalLoading += (280 * quantity);
	} else if(tbl_amt >= 1401 && tbl_amt <= 1600){
		totalLoading += (320 * quantity);
	} else if(tbl_amt >= 1601 && tbl_amt <= 2000){
		totalLoading += (400 * quantity);
	} else if(tbl_amt >= 2001){
		totalLoading += (500 * quantity);
	}
	return totalLoading;
}

function lrWiseDecimalAmountAllow(wayBillType) {
	if(configuration.allowRateInDecimal == 'true') {
		if(configuration.lrTypeWiseAmountInDecimal == 'true') {
			var lrTypeArray 	= (configuration.LRTypeForAllowRateInDecimal).split(",");
			
			if(isValueExistInArray(lrTypeArray, wayBillType)) {
				return true;
			}
		} else {
			return true;
		}
	}
	
	return false;
}

function invoiceNumberValidationInADay(){
	
	if(configuration.invoiceNoValidateForDuplicateInSameDay == 'false'){
		invalidInvoiceNumber	= false;
	} 
	
	if(configuration.invoiceNoValidateForDuplicateInSameDay == 'true' ){
		
		var invoiceNo			= $('#invoiceNo').val();
		if($('#lrDateManual') != undefined){
			var lrDateManual		= $('#lrDateManual').val();
		}
		if( Number($('#partyMasterId').val()) > 0){
			var corporateId			= $('#partyMasterId').val();
		} else {
			var corporateId			= $('#consignorCorpId').val();
		}
		var jsonObject			= new Object();
		
		jsonObject["invoiceNumber"]			= invoiceNo;
		jsonObject["corporateAccountId"]	= corporateId;
		if(lrDateManual != undefined){
			jsonObject["lrDateManual"]		= lrDateManual;
		}

		if(invoiceNo != undefined && invoiceNo != '' && corporateId > 0){
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/wayBillWS/validateInvoiceNumberForDuplicate.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data != null) {
						if(data.invalid){
							showMessage('error', iconForErrMsg + ' ' + data.massege);
							changeTextFieldColor('invoiceNo', '', '', 'red');
							$('#invoiceNo').val('');
							invalidInvoiceNumber	= true;
						} else {
							changeTextFieldColorWithoutFocus('invoiceNo', '', '', 'green');
							invalidInvoiceNumber	= false;
						}
					}
				},
			});
		} 
	}
	return invalidInvoiceNumber;
}

function declaredValueValidationForEwayBill(){
	
	if(configuration.validateEwaybillOnDeclaredValueWhileBooking == 'true'){
		var declaredVal			= $('#declaredValue').val();

		if(isConsignorGSTNPresent)
			var consignorGstn			= $('#consignoCorprGstn').val();
		
		if(isConsigneeGSTNPresent)
			var consigneeGstn			= $('#consigneeCorpGstn').val(); 
		
		var jsonObject			= new Object();
		
		jsonObject["isFormNumberPresent"]	= !validateEwayBillNumberByApi();
		jsonObject["declaredValue"]	= declaredVal;
		jsonObject["consignorGstn"]	= consignorGstn;
		jsonObject["consigneeGstn"]	= consigneeGstn;

		if(declaredVal != undefined && declaredVal != '' && declaredVal > 0){
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/wayBillWS/validateForDuplicateEwayBillWhileBooking.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data != null) {
						if(data.invalid){
							showMessage('error', iconForErrMsg + ' ' + data.massege);
							changeTextFieldColor('declaredValue', '', '', 'red');
							$('#declaredValue').val('');
						} else {
							changeTextFieldColorWithoutFocus('declaredValue', '', '', 'green');
						}
					}
				},
			});
		} 
	}
}
function loadJS(file) {
	   // DOM: Create the script element
	   var jsElm = document.createElement("script");
	   // set the type attribute
	   jsElm.type = "text/javascript";
	   // make the script element load file
	   jsElm.src = file;
	   // finally insert the element to the body element in order to load the script
	   document.body.appendChild(jsElm);
}

function getTDSDetails(jsonObject) {
	jsonObject.tdsAmount				= $('#tdsAmount').val();
	jsonObject.tdsOnAmount				= $('#tdsOnAmount').val();
	jsonObject.tdsCharge				= $('#tdsPercent').val();
}

function getChequeBouncePaymentDetails(jsonObject) {
	jsonObject.isAllowChequePayment	= isAllowChequePayment;
}

function swapConsignorConsigneeGstnPanel(){
	if (configuration.setPartyOnGSTNChange == 'true') {
		isSwapCustomerNamePanel	= true;
		$('#cnorGstn1').removeClass('hide');
		$('#cnorGstn').addClass('hide');
		$('#cgneeGstn1').removeClass('hide');
		$('#cgneeGstn').addClass('hide');
	 	initialiseFocus();	
	}
}

function setEwayBillFocus(){
	if($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID){
		if(configuration.isShowSingleEwayBillNumberField == 'true'){
			next	= 'ewayBillNumber';
		} else {
			next	= 'addMutipleEwayBill';
		}
	} else if($('#singleFormTypes').val() == FormTypeConstant.E_SUGAM_NO_ID){
		next	= 'sugamNumber';
	} else if($('#singleFormTypes').val() == FormTypeConstant.WAY_BILL_FORM_ID || $('#singleFormTypes').val() == FormTypeConstant.WAYBILL_AND_CC_ID){
		next	= 'formNumber';
	} else {
		//next	='STPaidBy';
		initialiseFocus();
	}
}

function savephoto(jsonObj){
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/bookingTimePhotoServices.do',
		data		:	jsonObj,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
		hideLayer();
		}
	});
}

function getBranchCommission(destBranchId){
	if(configuration.showExcludeCommissionOption == 'true') {
		commissionValue	= 0;

		var jsonObj		= new Object();

		jsonObj.accountGroupId			= executive.accountGroupId;

		if(isManualWayBill == true) {
			jsonObj.txnBranchId			= Number($('#sourceBranchId').val());
		} else {
			jsonObj.txnBranchId			= executive.branchId;
		}

		jsonObj.txnTypeId				= 1;
		jsonObj.bookingTypeId			= BOOKING_TYPE_SUNDRY_ID;
		jsonObj.applicalbeOnBranchId	= destBranchId;
		jsonObj.wayBillTypeId			= Number($('#wayBillType').val());

		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/branchCommissionWS/getBranchCommission.do',
			data		:	jsonObj,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.commissionValue != undefined && data.commissionValue > 0) {
					commissionValue	= data.commissionValue;
				}
			}
		});
	}
}

function setFreightAmtOnCommissionValue() {
	if(configuration.showExcludeCommissionOption == 'true') {
		if($('#excludeCommission').exists() && $('#excludeCommission').is(":visible")) {
			var newChargeRates = null;
			
			if (chargesRates != null)
				newChargeRates	= chargesRates[BookingChargeConstant.SERVICE_CHARGE];
			
			if($('#excludeCommission').prop( "checked")) {
				$('#charge' + BookingChargeConstant.FREIGHT).val(Number(Math.round((Number($('#charge' + BookingChargeConstant.FREIGHT).val()) * 100) / (100 - commissionValue))));
			
				if(newChargeRates != null && $('#charge' + BookingChargeConstant.FREIGHT).val() > 0)
					$('#charge' + BookingChargeConstant.SERVICE_CHARGE).val(Math.round((newChargeRates.chargeMinAmount * $('#charge' + BookingChargeConstant.FREIGHT).val()) / 100));
				
				calcTotal();
			} else {
				$('#charge' + BookingChargeConstant.FREIGHT).val(Number(freightToCalculate));
				
				if(newChargeRates != null && freightToCalculate > 0)
					$('#charge' + BookingChargeConstant.SERVICE_CHARGE).val(Math.round((newChargeRates.chargeMinAmount * freightToCalculate) / 100));
				
				calcTotal();
			}
		}
	}
}

function saveIDProofDetails(data) {
	var jsonObj	= new Object();
	
	jsonObj.idProofDataObjectConsignor	= JSON.stringify(idProofDataObject1);
	jsonObj.idProofDataObjectConsignee	= JSON.stringify(idProofDataObject2);
	jsonObj.ConsignorCorporateAccountId	= data.consignorId;
	jsonObj.ConsigneeCorporateAccountId	= data.consigneeId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/idProofPhotoService.do',
		data		:	jsonObj,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				$('#storedIDProofDetails tr').remove();
				$('#storedIDProofDetails1 tr').remove();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function getTotalParcelWeight(jsonObject){
	jsonObject.actualWeight 		= getTotalAddedArticleWeight();
	jsonObject.chargedWeight		= getTotalAddedArticleWeight();
}

function getEWayBillExemptedLR(jsonObject){
	if($('#eWayBillExempted') != undefined)
		jsonObject.isEWayBillExempted   = $('#eWayBillExempted').prop('checked');
}

function validateAddressSuggestion() {
	if((configuration.showConsignorAddressSuggestion == 'true' || configuration.showConsignorAddressSuggestion == true)
		&& $('#consignorName') != undefined && $('#consignorName').val().length < 3)
		$('#consignorAddressAutoCompleteField').hide();
}

function getOTLRNumber(jsonObject){
	jsonObject.otLrNumber	= $('#otLrNumber').val();
}

function getConsignmentDetails(jsonObject) {
	getChargeType(jsonObject);
	getConsignmentAmount(jsonObject);
	jsonObject.weigthFreightRate		= $('#weigthFreightRate').val();
	jsonObject.visibleRate				= $('#visibleRateAmt').val();
	
	if($('#saidToContain').val() != '') 
		jsonObject.saidToContain		= $('#saidToContain').val();

	let bookingType = $('#bookingType').val();

	if($('#actualWeight').val() != '') {
		if(configuration.showActualAndChargedWeightInMerticTon == 'true' && bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID)
			jsonObject.actualWeight			= $('#actualWeight').val() * 1000;
		else
			jsonObject.actualWeight			= $('#actualWeight').val();
		
		if(configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true)
			getTotalParcelWeight(jsonObject);
	} else
		jsonObject.actualWeight			= 0;
	
	if($('#chargedWeight').val() != '') {
		if(configuration.showActualAndChargedWeightInMerticTon == 'true' && bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID)
			jsonObject.chargedWeight		= $('#chargedWeight').val() * 1000;
		else
			jsonObject.chargedWeight		= $('#chargedWeight').val();
		if(configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true)
			getTotalParcelWeight(jsonObject);
	} else
		jsonObject.chargedWeight		= 0;
	
	let consignmentDataArray	= [];
	
	for (let k in consignmentDataHM) {
		consignmentDataArray.push(consignmentDataHM[k]);
	}
	
	jsonObject.consignmentDataArray	= consignmentDataArray;
	
	if($('#cftRate').val() > 0)
		jsonObject.cftValue		= $('#cftRate').val();
}

function getCFTValue() {
	var cft	= 0;
	
	cft	= $('#cftRate').val();;
	
	return cft;
}

function validateCFTValue() {
	
	var cft		= getCFTValue();
	
	if(cft <= 0) {
		setTimeout(function() {
			showMessage('error', configuration.cftRateLabel + ' not Exist . Please enter ' + configuration.cftRateLabel + ' !');
		}, 300);
		return false;
	}
	
	return true;
}

function calculateVolumetricChrgWgt() {
	let noOfArt		= $('#quantity').val();
	let length 		= $('#articleLength').val();
	let bredth 		= $('#articleBredth').val();
	let height 		= $('#articleHeight').val();
	let cftUnitId	= $('#cftUnit').val();
	
	if(configuration.hideCFTValueFieldOnBookingPage == 'false' && !validateCFTValue())
		return false;
	
	let cftValue	= getCFTValue();
	let chrgWeight	= 0;
	let volume		= Number(length) * Number(bredth) * Number(height);

	if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true') {
		if($('#volumetricFactorId').val() > 0) {
			let artChargeWeight	= (volume * noOfArt) / Number($('#volumetricFactorId').val());
			$('#artChargeWeight').val(artChargeWeight.toFixed(2));
		} else
			$('#artChargeWeight').val(0);
	} else if(configuration.cftWeightCalcinCMandINCH == 'true') {
		if(CFTUnit == CFT_UNIT_CM_ID || cftUnitId == CFT_UNIT_CM_ID)
			chrgWeight	= (volume * cftValue * noOfArt) / 27000;
		else if(CFTUnit == CFT_UNIT_INCH_ID || cftUnitId == CFT_UNIT_INCH_ID)
			chrgWeight	= (volume * cftValue * noOfArt) / 1728;
		else if(CFTUnit == CFT_UNIT_FEET_ID || cftUnitId == CFT_UNIT_FEET_ID)
			chrgWeight	= (volume * cftValue * noOfArt);
			
		$('#artChargeWeight').val(chrgWeight.toFixed(2));
	} else if(configuration.cftWeightCalcInINCH == 'true' && cftUnitId == CFT_UNIT_FEET_ID)
		$('#artChargeWeight').val(volume.toFixed(2));
	else if(configuration.hideCFTValueFieldOnBookingPage == 'true')
		$('#artChargeWeight').val(((volume * noOfArt) / configuration.valueToDivideForValumetricCalculation).toFixed(2));
	else if(configuration.chargedWeightCalcForCubicFeet == 'true')
		$('#artChargeWeight').val((volume * cftValue).toFixed(2));
	else
		$('#artChargeWeight').val(((volume * cftValue * noOfArt) / 27000).toFixed(2));
}

function setJsonDataforCreateWayBill(jsonObject) {
	calculateDestBranchToDoorDlyDistance();
	getWayBillType(jsonObject);
	getBookingTypeandDetails(jsonObject);
	getLRNumberManual(jsonObject);
	getOTLRNumber(jsonObject);
	jsonObject.billingBranchId		= $('#billingBranchId').val()
	jsonObject.freightUptoBranchId	= $('#freightUptoBranchId').val();
	getReamrk(jsonObject);
	getConsignmentDetails(jsonObject);
	jsonObject.purchaseOrderNumber	= $('#purchaseOrderNumber').val();
	getCBMValueRate(jsonObject);
	jsonObject.additionalRemark	= $('#additionalremark').val();
	getSTPaidBy(jsonObject);
	getCFTAmtAndRate(jsonObject);
	getCBMAmtAndRate(jsonObject);
	jsonObject.declaredValue	= $('#declaredValue').val();
	jsonObject.invoiceNumber	= $('#invoiceNo').val();
	jsonObject.invoiceDate	= $('#invoiceDate').val();
	getConsignor(jsonObject);
	getConsignee(jsonObject);
	getPaymentTypeandDetails(jsonObject);
	jsonObject.pickupTypeId 	= $('#PickupType').val();
	getDeliveryTo(jsonObject);
	jsonObject.deliveryPlaceId	= $('#deliveryPlaceId').val();
	jsonObject.deliveryPlace	= $('#deliveryPlace').val();
	getChargeDetails(jsonObject);
	getDiscount(jsonObject);
	getDiscountTypes(jsonObject);
	getFormTypeDetails(jsonObject);
	jsonObject.privateMark		= $('#privateMark').val();
	jsonObject.roadPermitNumber		= $('#roadPermitNumber').val();
	jsonObject.movementTypeId		= $('#movementType').val()

	if ($('#bookingPrintDate').val() != '')
		jsonObject.bookingPrintDate	= $('#bookingPrintDate').val();
	
	getExciseInvoice(jsonObject);
	getConsignmentInsured(jsonObject);
	getRiskAllocation(jsonObject);
	getBillSelection(jsonObject);
	getFormNumber(jsonObject);
	getPartialPaymentDetails(jsonObject);
	getNumberTypesDetails(jsonObject);
	getRemarkDetailOnBookingCharge(jsonObject);
	getServiceType(jsonObject);
	getEWayBillExemptedLR(jsonObject);
	
	jsonObject.rfqNumber			= $('#rfqNumber').val();
	jsonObject.billOfEntriesNumber	= $('#billOfEntriesNumber').val();
	jsonObject.shipmentNumber		= $('#shipmentNumber').val();
	jsonObject.gstType				= $('#gstType').val();
	jsonObject.bookedBy				= $('#bookedBy').val();
	jsonObject.deliveryOrderNumber	= $('#deliveryOrderNumber').val();
	jsonObject.shipmentEndDate		= $('#shipmentEndDate').val();
	jsonObject.insurancebkg			= $('#insurancebkg').val();
	jsonObject.codAmount			= $('#cod').val();
	jsonObject.approvalTypeId		= $('#approvalTypeId').val();
	jsonObject.sealNumber			= $('#sealNumber').val();
	jsonObject.vehiclePONumber		= $('#vehiclePONumber').val();
	
	if($('#cargoType').exists() && $('#cargoType').is(":visible"))
		jsonObject.cargoType	= $('#cargoType').val();
		
	if(containerDetailsArray != undefined)
		jsonObject.containerDetailsArray  = containerDetailsArray;
		
	jsonObject.agentcommission		= $('#agentcommission').val();	
	jsonObject.transporterNameId		=  $('#transporterName').val();
	getupdatePrepaidAmount(jsonObject);
	jsonObject.purchaseOrderDate	= $('#purchaseOrderDate').val();
	setWeightAmountAndFixAmount(jsonObject);
	getTaxType(jsonObject);
	
	jsonObject.podRequired			= $('#podRequiredStatus').val();
	jsonObject.paymentRequired		= $('#paymentRequiredStatus').val();
	jsonObject.articleTypeMasterId	= $('#natureOfArticle').val();
	
	if(invoiceDetailArrayForInsurance.length > 0)
		jsonObject.invoiceDetailsArr  = invoiceDetailArrayForInsurance;
	else if(invoiceDetailArray.length > 0)
		jsonObject.invoiceDetailsArr  = invoiceDetailArray;
	
	if(($('#smsRequired').prop( "checked") || isSmsRequiredBasedOnParty)
		&& $('#smsRequired').prop( "checked") && !isSmsRequiredBasedOnParty) {
			jsonObject.smsService		= true;
	}
	
	jsonObject.commodityType		= $('#commodityType').val();
	jsonObject.transportationMode	= $('#transportationMode').val();
	jsonObject.percentageRiskCover	= $('#percentageRiskCover').val();
	getTDSDetails(jsonObject);
	jsonObject.panNumber	= $('#panNumber').val();
	jsonObject.tanNumber	= $('#tanNumber').val();
	jsonObject.serviceTaxAmount = serviceTaxAmount;
	jsonObject.transportationCategory	= $('#transportationCategory').val();
	
	jsonObject.createInvoice	= $('#createInvoice').prop("checked");

	if(isManualWayBill) {
		jsonObject.isReservedLR			= isReserveBookingChecked;
		jsonObject.wayBillTypeString	= getValueTextFromOptionField('WBTypeManual');
		jsonObject.sourceBranchId		= $('#sourceBranchId').val();
		
		jsonObject.destinationBranchId		= $('#destinationBranchId').val();
		getSequnceTypeSelection(jsonObject);
		
		jsonObject.diffAmtAfterRoundOffForOther		= 0;
		jsonObject.manualLRDate				= getValueFromInputField('lrDateManual');
		jsonObject.lrDateManual				= jsonObject.manualLRDate;
		jsonObject.isManual					= true;
		jsonObject.wayBillIsManual			= true;
		jsonObject.isReverseEntry			= isReverseEntry;
		jsonObject.isExecutiveBranchWiseSeqCounterChecked  = isExecutiveBranchWiseSeqCounterChecked;
	} else {
		getPartyLRManualSequence(jsonObject);

		jsonObject.isExecutiveBranchWiseSeqCounterChecked  = false;
		
		if (configuration.FutureDate == 'true' && $('#wbDate').val() != 0)
			jsonObject.wbDate	= $('#wbDate').val();

		if (configuration.ShowCityAndDestinationBranch == 'true')
			getDestinationData1(jsonObject);
		else
			jsonObject.destinationBranchId		= $('#destinationBranchId').val();

		if($("#diffAmtAfterRoundOffForOther").val() > 0)
			jsonObject.diffAmtAfterRoundOffForOther		= $("#diffAmtAfterRoundOffForOther").val();
		else
			jsonObject.diffAmtAfterRoundOffForOther		= 0;
		
		if(configuration.regionWiseSourceBranchWork == 'true' && configuration.sourceBranchAuto == 'true'){
			var regionIds 		= configuration.regionIdsForSourceBranchWork;
			var regionIdsArr 	= regionIds.split(",");
		
			if(isValueExistInArray(regionIdsArr, executive.regionId))
				jsonObject.sourceBranchId		= $('#sourceBranchId').val();
			else
				jsonObject.sourceBranchId		= executive.branchId;
		} else
			jsonObject.sourceBranchId		= executive.branchId;
		
		if( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
				&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true'))
			getChequeBouncePaymentDetails(jsonObject);
	}
	
	jsonObject.token	= token;
	jsonObject.distance	= distance;
	jsonObject.packingTypeWiseAmount	= packingTypeWiseAmount.join(',');
	
	jsonObject.partyIdForCommission		= partyIdForCommission;
	jsonObject.isValuationCharge		= $('#declaredValueCheckBox').prop("checked");
	
	jsonObject.doorDeliveryAddress		= $('#dest_search').val();
	jsonObject.deliveryDistance			= $('#doorDistance').html();
	$('#dest_search').val("");
	$('#doorDistance').html("");
	jsonObject.directorExecutiveId  	= $('#directorId').val();
	jsonObject.tax5  					= $('#tax5').val();
	jsonObject.businessTypeId			= $('#businessType').val();
	jsonObject.cftUnitId				= $('#cftUnit').val();
	jsonObject.categoryType				= $("#categoryType").val();
	jsonObject.tbbPartyCode				= tbbPartyCode;
	jsonObject.totalConsignmentQuantity	= TotalQty;
	jsonObject.branchServiceTypeId		= $('#branchServiceTypeId').val();
	jsonObject.companyId				= groupWiseCompanyNameId;
	jsonObject.policyGenerationRequestId	= policyGenerationRequestId;
	jsonObject.invoiceQty				= $('#invoiceQty').val();
	jsonObject.forwardTypeId			= $('#forwardTypeId').val();
	jsonObject.hsnCode					= $('#hsnCodeId').val();
	jsonObject.insurancePolicyNumber	= $('#insurancePolicyNo').val();
	jsonObject.temperature				= $('#temperature').val();
	jsonObject.dataLoggerNumber			= $('#dataLoggerNo').val();
	jsonObject.connectivityTypeId		= $('#connectivityTypeId').val();
	
	if (configuration.showMultipleDeclarationType == 'true') {
		const declarationTypeIds = [...document.querySelectorAll('#declarationTypeNewId input[type="checkbox"]:checked')].map(cb => cb.value).join(',');
		jsonObject.declarationTypeId = declarationTypeIds || '';
	} else
		jsonObject.declarationTypeId = $('#declarationTypeId').val();

	if (jsondata.taxes != undefined && jsondata.taxes.length > 1)
		jsonObject.gstPercent			= jsondata.taxes[2].taxAmount;
	
	jsonObject.dispatchLedgerId			= dispatchLedgerIdForManualLS;
	jsonObject.LsBranchId				= lsBranchId;
	jsonObject.crossingAgentId			= crossingAgentId;
	jsonObject.crossingHireAmount		= $('#crossingHireAmount').val();
	jsonObject.recoveryBranchId			= $('#selectedRecoveryBranchId').val();
	jsonObject.divisionId				= $('#waybillDivisionId').val();
}

function getDistanceBySourceDestination(destBranchId) {
	if(configuration.KilometerChargeTypeWiseRate == 'false')
		return;
	
	var jsonObject	= new Object();
	
	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill){
		
		if($('#sourceBranchId').val() == 0)
			return;
		
		jsonObject.fromBrachId			= $('#sourceBranchId').val();
	} else {
		if(configuration.regionWiseSourceBranchWork == 'true' && configuration.sourceBranchAuto == 'true'){
			var regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
		
			if(isValueExistInArray(regionIdsArr, executive.regionId))
				jsonObject.fromBrachId		= $('#sourceBranchId').val();
			else
				jsonObject.fromBrachId		= executive.branchId;
		} else
			jsonObject.fromBrachId		= executive.branchId;
	}
	
	jsonObject.toBranchId	= destBranchId;
	
	distance	= 0;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getDistanceBySourceDestination.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				hideLayer();
				return;
			}
			
			distance	= data.distance;
			
			$('#distance').html('(distance = ' + distance + ")");
		}
	});
}

function disablePODStatus() {
	if(podConfiguration.setDefaultValueYesForPodRequiredAtBooking) {
		if(podConfiguration.disablePODRequiredBySubRegionIDWise) {
			let subregionIdsArr = (podConfiguration.subRegionIDSToDisablePOD).split(",");
			
			if(isValueExistInArray(subregionIdsArr, executive.subRegionId))
				$('#podRequiredStatus').prop('disabled', true);
		} else
			$('#podRequiredStatus').prop('disabled', true);
	}
}

function remarkApend() {
	if(configuration.packingTypeIdsToAppendRemark <= 0) 
		return "";
	
	var packingTypeIdsToAppendRemark	= (configuration.packingTypeIdsToAppendRemark).split(',');
	
	var risk	= false;
	
	if(consigAddedtableRowsId.length > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#typeofPackingId' + consigAddedtableRowsId[i]).html() > 0) {
				packingTypeId 	= parseInt($('#typeofPackingId' + consigAddedtableRowsId[i]).html());
				
				if(isValueExistInArray(packingTypeIdsToAppendRemark, packingTypeId)) {
					risk	= true;
					break;
				}
			}
		}
	}
	
	if(risk)
		return "No risk ";
	
	return "";
}

function setFocusOnBookingType() {
	if($('#natureOfArticle').exists())
		$('#natureOfArticle').focus();
	else if($('#bookingType').exists())
		$('#bookingType').focus();
	else if($("#transportationCategory").exists())
		$('#transportationCategory').focus();
	else if($("#transportationMode").exists())
		$('#transportationMode').focus();
	else if($('#lrNumberManual').exists())
		$('#lrNumberManual').focus();
	else if($('#subRegion').exists())
		$('#subRegion').focus();
	else if($('#sourceBranch').exists())
		$('#sourceBranch').focus();
	else if($('#destinationCitySelectEle').exists())
		$('#destinationCitySelectEle').focus();
	else{
		setTimeout(()=>{
			$('#destination').focus();
		},500);
	}
}

function checkEwaybillNumber(){
	var stateIdArr				= (configuration.stateIdForEwayBillAmountAboveOneLakh).split(',');
	var exeBranchStateCheck		= isValueExistInArray(stateIdArr, executive.stateId);
	var destBranchStateCheck	= isValueExistInArray(stateIdArr, destinationBranchStateId);
	
	if(configuration.selectEwayBillByStateId == 'true' && destBranchStateCheck && exeBranchStateCheck && executive.stateId == destinationBranchStateId) {
		if(Number($('#declaredValue').val()) > Number(configuration.declaredValueSelectEwayBillByStateId)) {
			$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
			showEWaybillNumberFormType();
			
			if(Number($('#wayBillType').val()) == WAYBILL_TYPE_PAID)
				consignorGstNMandotory	= true;
			else if (Number($('#wayBillType').val()) == WAYBILL_TYPE_TO_PAY)
				consigneeGstNMandotory	= true;
			else if(Number($('#wayBillType').val()) == WAYBILL_TYPE_CREDIT)
				consignorGstNMandotory	= true;
		} else {
			consignorGstNMandotory	= false;
			consigneeGstNMandotory	= false;
		}		
	} else if(configuration.selectEWayBillONDeclaredValue == 'true'
			&& Number(configuration.declaredValueForSelectEwayBill) > 0 
			&& Number($('#declaredValue').val()) > Number(configuration.declaredValueForSelectEwayBill)) {
		$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
		showEWaybillNumberFormType();
		
		if(Number($('#wayBillType').val()) == WAYBILL_TYPE_PAID)
			consignorGstNMandotory	= true;
		else if (Number($('#wayBillType').val()) == WAYBILL_TYPE_TO_PAY)
			consigneeGstNMandotory	= true;
		else if(Number($('#wayBillType').val()) == WAYBILL_TYPE_CREDIT)
			consignorGstNMandotory	= true;
	} else {
		consignorGstNMandotory	= false;
		consigneeGstNMandotory	= false;
	}
}
function setWithoutBillOption(){
	$('#billSelection').val(BOOKING_WITHOUT_BILL);
}

function getupdatePrepaidAmount(jsonObject) {
	
	jsonObject.prepaidAmountId	= prepaidAmountId;
	jsonObject.filter			= 1;
}
function setWeightAmountAndFixAmount(jsonObject) {
	
	jsonObject.weightAmount	= $('#weightAmount').val();
	jsonObject.fixAmount	= $('#fixAmount').val();
	jsonObject.actualWeightRateAmt	= actualWeightRateAmt;
}

function getTaxType(jsonObject) {
	jsonObject.taxTypeId			=  $('#taxTypeId').val();
}

function chargeValueRequired() {
	var recquiredChargeIdsToBookLrArr	= (configuration.recquiredChargeIdsToBookLr).split(",");

	if(recquiredChargeIdsToBookLrArr != null && recquiredChargeIdsToBookLrArr.length > 0 && $('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		for (let i = 0; i < recquiredChargeIdsToBookLrArr.length; i++) {
			var chargeId		= recquiredChargeIdsToBookLrArr[i];
			
			if($('#charge' + chargeId).val() == 0) {
				showMessage('error', 'Booking Without ' + $('#label' + chargeId).html() + ' Charge is not Allowed.');
				return false;
			}
		}
	}
	
	return true;
}

function getExtraDataForPrint() {
	var jsonObject	= {};
	
	jsonObject.taxTypeName				= $('#taxTypeId').find('option:selected').text();
	jsonObject.transporterName			= $('#transporterName').find('option:selected').text();
	jsonObject.wayBillTypeName			= $('#lrType').html();
	jsonObject.podRequiredName			= $("#podRequiredStatus option:selected").text();
	jsonObject.chargeTypeName			= $("#chargeType option:selected").text();
	jsonObject.consignmentSummaryTaxByString		= $("#STPaidBy option:selected").text();
	jsonObject.paymentTypeName			= $("#paymentType option:selected").text();
	jsonObject.pickupTypeName 			= $("#PickupType option:selected").text();
	jsonObject.deliveryToString 		= $("#deliveryTo option:selected").text();
	jsonObject.vehicleTypeName			= $("#vehicleType option:selected").text();
	jsonObject.insuredBy 				= $("#riskallocation option:selected").text();
	jsonObject.bookingTypeName			= $("#bookingType option:selected").text();
	
	let transportModeList = jsondata.transportModeList;
	
	if(transportModeList != undefined && transportModeList.lngth > 0) {
		let transportationMode	= $('#transportationMode').val();
		transportModeList = transportModeList.filter(function(obj) {return obj.transportModeId == Number(transportationMode);});
		
		if(transportModeList.length > 0)
			jsonObject.transportationModeName	= transportModeList[0].shortName;
	} else
		jsonObject.transportationModeName	= $("#transportationMode option:selected").text();
		
	jsonObject.categoryTypeName			= $("#categoryType option:selected").text();
	jsonObject.transportationCategoryName	= $("#transportationCategory option:selected").text();
	jsonObject.approvalTypeName			= $("#approvalTypeId option:selected").text();
	jsonObject.forwardTypeName			= $("#forwardTypeId option:selected").text();
	jsonObject.connectivityTypeName		= $("#connectivityTypeId option:selected").text();

	if($('#serviceType').val() > 0)
		jsonObject.serviceTypeName 		= $("#serviceType option:selected").text();
		
	jsonObject.consignorRateConfigured	= consignorRateConfigured;
	jsonObject.consignorPodRequired		= consignorPodRequired;
	jsonObject.consigneeRateConfigured	= consigneeRateConfigured;
	jsonObject.consigneePodRequired		= consigneePodRequired;
	jsonObject.bookingTypeId 			= $('#bookingType').val();
	jsonObject.invoiceQty				= $('#invoiceQty').val();
	jsonObject.divisionName				= $("#waybillDivisionId option:selected").text();

	return jsonObject;
}

function getBranchRemark(branchId) {

	$.getJSON("Ajax.do?pageId=9&eventId=13&filter=43&destinationBranchId="+branchId,
		 function(data) {
			if (!jQuery.isEmptyObject(data)) {
				showMessage('info', data.remark);	
			}
		});
}

function showVolumetricRateSubregionWise() {
	var subRegionIdsForVolumetricRate	= configuration.subRegionIdsForVolumetricRate;
	
	if(configuration.showVolumetricRateSubRegionWise == 'true'
		&& subRegionIdsForVolumetricRate != undefined 
		&& subRegionIdsForVolumetricRate.length > 0) {
						
		var subRegionIdsForVolumetricRateList	 		= subRegionIdsForVolumetricRate.split(',');
		checkSubRegionIdsForVolumetricRate				= isValueExistInArray(subRegionIdsForVolumetricRateList, executive.subRegionId);
		
		if(checkSubRegionIdsForVolumetricRate) {
			configuration.VolumetricRate										= 'true';
			configuration.VolumetricWiseAddArticle								= 'true';
			configuration.showVolumetricOnWeight								= 'true';
			configuration.volumetricAndChgWghtHigherValueOnChargeWgtField		= 'true';
			configuration.showCFTWeightFeild									= 'true';
			configuration.cftWeightCalcinCMandINCH								= 'true';
		}
	}
}

function changeFlavourTypeSubregionWise() {
	var subRegionIdsForChargeTypeFlavour	= configuration.subRegionIdsForChargeTypeFlavour;
					
	if(configuration.subRegionWiseChargeTypeFlavour == 'true'
		&& subRegionIdsForChargeTypeFlavour != undefined 
		&& subRegionIdsForChargeTypeFlavour.length > 0) {
						
		var subRegionIdsForChargeTypeFlavourList 		= subRegionIdsForChargeTypeFlavour.split(',');
		checkSubRegionIdsForChargeTypeFlavour			= isValueExistInArray(subRegionIdsForChargeTypeFlavourList, executive.subRegionId);
	
		if(checkSubRegionIdsForChargeTypeFlavour)
			configuration.ChargeTypeFlavour = 1;
	}
}


function showOwnBranchInDestinationInManualOpenBooking() {
	if ((configuration.showOwnBranchInDestinationInManualOpenBooking || configuration.showOwnBranchInDestinationInManualOpenBooking == 'true')
	 && jsondata.OPEN_MANUAL) {
		configuration.isOwnBranchRequired = true;
	}
}

function checkBranchIdForGstValidation() {
	if (configuration.gstValidationBranchLevel == 'true' && configuration.branchIdsForGstValidation != undefined) {
		var branchIdsArray = (configuration.branchIdsForGstValidation).split(',');

		if (isValueExistInArray(branchIdsArray, branchId)) {
			configuration.gstnVerificationLink						= false;
			configuration.showExtraSingleEwaybillField              = true
			configuration.showDataByEwaybillApiOnBookingScreen  	= true
			validateEwaybillNumberThroughApi			  			= true
		}
	}
}
/*
	Function to set recharge amount
*/
function setRechargeAmount(wayBillTypeId) {
	let	wayBillTypeList		= (configuration.wayBillTypeWiseAllowPrepaidAmount).split(',');
					
	if(configuration.allowPrepaidAmount == 'true' && typeof branchWisePrepaidAmount !== 'undefined' && branchWisePrepaidAmount != null
		&& isValueExistInArray(wayBillTypeList, wayBillTypeId)) {
		$("#rechrgamnt").css("display", "inline");
		let rechargeAmount	= (branchWisePrepaidAmount.rechargeAmount);
		let isParentBranch	= loggedInExecutiveBranch.parentBranch;
		let branchLimit		= branchWisePrepaidAmount.branchLimit;
		let thresholdLimit	= branchWisePrepaidAmount.thresholdLimit;
		prepaidAmountId		= branchWisePrepaidAmount.prepaidAmountId;
		let thresholdAmnt   = -(thresholdLimit * branchLimit) / 100
		
		if(isParentBranch && thresholdAmnt > rechargeAmount) {
			$("#rechrgamnt").css("color", "red");
			$("#rechrgamnt").css("background-color", "beige");
		} else 
			$("#rechrgamnt").css("color", "white");
		
		if(isParentBranch || (configuration.useBranchLimitWithoutParentChildOrSharing == 'true')) {
			$("#balanceLimitAmnt").css("display", "inline");
			setValueToHtmlTag('balanceLimitAmnt', ' ( BRANCH LIMIT =  '+ branchLimit + ' )');
		} else
			$("#balanceLimitAmnt").css("display", "none");
		
		setValueToHtmlTag('rechrgamnt', ' ( BALANCE =  '+ rechargeAmount + ' )');
	}  else {
		$("#rechrgamnt").css("display", "none");
		$("#balanceLimitAmnt").css("display", "none");
	}
}

function setFtlTypeAutomatically() {
	if(configuration.convertAutomaticallyFTLWithCondns == 'true') {
		var famt         		= Number($('#charge' + BookingChargeConstant.FREIGHT).val());
		var chargeWeight 		= Number($('#chargedWeight').val());
		var bookingType			= Number($('#bookingType').val());
		var totalQuantity		= Number($('#totalQty').html());
		
		if (bookingType == BOOKING_TYPE_SUNDRY_ID && (totalQuantity > Number(configuration.maxArticleCount) || chargeWeight > Number(configuration.maxWeight) || famt > Number(configuration.maxFreightAmt))) {
			showMessage('error', 'You cannot book this LR in ' + BookingTypeConstant.BOOKING_TYPE_SUNDRY_NAME + ', Book this LR in ' + configuration.BookingTypeFtlName);
			return false;
		} else if (bookingType == BOOKING_TYPE_FTL_ID && (totalQuantity < Number(configuration.maxArticleCount) && chargeWeight < Number(configuration.maxWeight) && famt < Number(configuration.maxFreightAmt))) {
			showMessage('error', 'You cannot book this LR in ' + configuration.BookingTypeFtlName + ', Book this LR in ' + BookingTypeConstant.BOOKING_TYPE_SUNDRY_NAME + ' !');
			return false;
		}
	}
	
	return true;
}

function setSubregionWiseRateValidation(destSubRegionId) {
	if(configuration.SubRegionWiseRateRequired == 'true') {
		var subRegionRateList	= configuration.subRegionRateValues.split(',');
		var subRegionList		= new Array();
			
		for(var i = 0; i < subRegionRateList.length; i++)
			subRegionList.push(subRegionRateList[i].split('_')[0]);
			
		var checkData = isValueExistInArray(subRegionList, destSubRegionId)
			
		if(checkData) {
			validateRateFromRateMasterForLR 					= false;
			validateRateFromRateMasterForLRWithoutDisableFields = false;
		} else {
			validateRateFromRateMasterForLR						= configuration.validateRateFromRateMasterForLR == 'true' || configuration.validateRateFromRateMasterForLR == true;
			validateRateFromRateMasterForLRWithoutDisableFields	= configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true;
		}
	}
}

function validateRateFromRateMaster() {
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return true;
	
	var chargeType			= $('#chargeType').val();

	if((validateRateFromRateMasterForLR || validateRateFromRateMasterForLRWithoutDisableFields)
		&& chargeType == CHARGETYPE_ID_QUANTITY) {
		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'false' || configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == false) {
			var rateFound = $("#qtyAmount").val() > 0;
			
			if(!rateFound) {
				showMessage('error', 'Rate Not Found.');
				removeConsignmentTables();
				resetArticleDetails();
				$('#chargeType').focus();
				return false;
			}
		} 
	}
	
	if(configuration.validateRateFromRateMasterForBillingParty == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT && chargeType == CHARGETYPE_ID_QUANTITY) {
		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'false' || configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == false) {
			var rateFound = qtyAmt > 0;
			if(!rateFound) {
				showMessage('error', 'Rate For This Destination Is Not Available Please Contact To Your Head Office For Rate.');
				removeConsignmentTables();
				resetArticleDetails();
				$('#chargeType').focus();
				return false;
			}
		} 
	}
		
	return true;
}

function validateWeightRateFromRateMaster() {
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return true;
	
	var chargeType			= $('#chargeType').val();
		
	if((validateRateFromRateMasterForLR || validateRateFromRateMasterForLRWithoutDisableFields)
		&& chargeType == CHARGETYPE_ID_WEIGHT) {

		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'false' || configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == false) {
			var rateFound = weightFromDb > 0;
			
			if(configuration.mergeCrossingCartageAndFreightRateInWeightRate == 'true')
				rateFound	= weightFromDbOnFrt > 0;
			
			if(!rateFound) {
				showMessage('error', 'Rate Not Found.');
				removeConsignmentTables();
				resetArticleDetails();
				$('#chargeType').focus();
				return false;
			}
		} 
	}
	
	if(configuration.validateRateFromRateMasterForBillingParty == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT && chargeType == CHARGETYPE_ID_WEIGHT){
		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'false' || configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == false) {
			var rateFound = weightFromDb > 0;
			if(configuration.mergeCrossingCartageAndFreightRateInWeightRate == 'true')
				rateFound	= weightFromDbOnFrt > 0;
			
			if(!rateFound) {
				showMessage('error', 'Rate For This Destination Is Not Available Please Contact To Your Head Office For Rate');
				removeConsignmentTables();
				resetArticleDetails();
				$('#chargeType').focus();
				return false;
			}
		} 
	}
		
	return true;
}

function getChargesTotal() {
	let charges	= jsondata.charges;
	let total	= 0;
	
	for (const element of charges) {
		let chargeMasterId	= element.chargeTypeMasterId;
		
		if ($("#charge" + chargeMasterId).val() != "") {
			let chargeValue = parseFloat($("#charge" + chargeMasterId).val());
		
			if(configuration.BookingChargesFloatValueAllowed != 'true')
				$("#charge" + chargeMasterId).val(Math.round(parseFloat($("#charge" + chargeMasterId).val())));
			
			if(configuration.isAllowOperationTypeWiseChargesEffect == 'true') {
				if(element.operationType == OPERATION_TYPE_NUETRAL)
					chargeValue = 0;
				else if(element.operationType == CHARGE_OPERATION_TYPE_SUBTRACT)
					chargeValue = -Math.abs(chargeValue);
			}
			
			total += chargeValue;
		}
	}
	
	return total;
}

function getTotalAmt() {
	let total	= getChargesTotal();
	
	if (lrWiseDecimalAmountAllow($('#wayBillType').val()))
		total = total.toFixed(2);
	else	
		total = Math.round(total).toFixed();
		
	return total;
}

function getAmountToCalculateEncludedTax() {
	if(configuration.applyIncludedTax == 'true')
		return getConsignmentFreightAmount();
	
	return parseFloat($("#totalAmt").val());
}

function getConsignmentFreightAmount() {
	let amount	= 0.0;
	
	if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
		for(const element of consigAddedtableRowsId) {
			if($('#qtyAmountTotal' + element).html() > 0)
				amount		+= parseFloat($('#qtyAmountTotal' + element).html());
		}
	} else if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT)
		amount		= $("#weightAmount").val();
	else if($('#chargeType').val() == CHARGETYPE_ID_FIX)
		amount		= $("#fixAmount").val();
		
	return amount;
}

function getDiscountedAmount(amount, serviceTaxExclude) {
	var discAmount	= 0;
	
	if(isBookingDiscountAllow) {
		if(document.getElementById('isDiscountPercent') != null && document.getElementById('isDiscountPercent').checked)
			discAmount	= amount - parseFloat($('#discount').val()) * parseFloat(amount) / 100;
		else
			discAmount	= amount - parseFloat($('#discount').val());
	} else if(configuration.applyDiscountThroughMaster == 'true' && jsondata.DiscountMaster != undefined)
		discAmount	= amount - parseFloat($('#discount').val());
	else
		discAmount 	= amount;
	
	if(configuration.applyIncludedTax != 'true')
		discAmount = parseFloat(discAmount) - parseFloat(serviceTaxExclude);
		
	return discAmount;
}

function removeCommissionFromGrandTotal(grandtotal) {
	var agentcommission	= document.getElementById("agentcommission");
		
	if(agentcommission != null) {
		var  agentCommissionPercentageAllowed 	= agentCommissionValue;		//Coming from Property
		agentCommissionValueAllowed 			= (grandtotal * agentCommissionPercentageAllowed) / 100;
			
		if(parseFloat(agentcommission.value) <= agentCommissionValueAllowed)
			grandtotal = grandtotal - parseFloat(agentcommission.value);
	}
		
	return grandtotal;
}

function getServiceTaxExcludeCharges() {
	var charges	= jsondata.charges;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;
		
		if($("#charge" + chargeMasterId).exists() && $("#charge" + chargeMasterId).is(":visible") && charges[i].taxExclude)
			total  += Number($("#charge" + chargeMasterId).val());
	}
	
	return total;
}

function getGrandTotalWithTax(grandtotal, discAmount) {
	if(configuration.showTransportationCategory == 'true')
		changeGstRatesOnTransportCategory();
	
	if(configuration.gstnNumber == 'true' && executive.countryId == INDIA) {
		setSTPaidByOnGSTNumber();
		grandtotal	= calculateGSTTaxes(jsondata.taxes, 'STPaidBy', grandtotal, discAmount, sourceBranchStateId, destinationBranchStateId);
	} else if (executive.countryId == NIGERIA)
		grandtotal	= calculateVATTax(jsondata.taxes, grandtotal, discAmount);
	
	return grandtotal;
}

function getSourceBranchForRate() {
	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill)
		var srcBranchId			= $('#sourceBranchId').val();
	else
		var srcBranchId			= executive.branchId;
		
	return srcBranchId;
}

function roundOfGrandTotalToNextZero() {
	var roundOfGrandTotalToNextZeroByWayBillType	= configuration.roundOfGrandTotalToNextZeroByWayBillType;
	
	if(configuration.roundOffGrandTotalDontAllowInManual == 'true' && isManualWayBill)
		return;
	
	if(roundOfGrandTotalToNextZeroByWayBillType == 'true' || roundOfGrandTotalToNextZeroByWayBillType == true) {
		var roundOffGrandTotalToNextZeroValueArr	= (configuration.roundOffGrandTotalToNextZeroValue).split(',');
		var roundOffToNextFive						= false;
		var wayBillType								= $('#wayBillType').val();
		var grandTotal 								= parseFloat($('#grandTotal').val());

		for(j = 0; j < roundOffGrandTotalToNextZeroValueArr.length; j++) {
			var roundOffGrandTotalToNextZero	= roundOffGrandTotalToNextZeroValueArr[j];
			var wayBillTypeId					= roundOffGrandTotalToNextZero.split('_')[0];
			var roundOfMultiplyValue			= roundOffGrandTotalToNextZero.split('_')[1];

			if(Number(roundOfMultiplyValue)	== 5)
				roundOffToNextFive	= true;
			
			if(wayBillTypeId == wayBillType) {
				var lenOfAW		= 0;
				var lastOfAW	= 0;
				var i 			= 0;

				for(i = Math.round(grandTotal); i <= (Number(grandTotal) + Number(roundOfMultiplyValue)) - 1; i++) {
					lenOfAW  = i.toString().length;
					lastOfAW = i.toString().substring(lenOfAW, lenOfAW - 1);

					if(roundOffToNextFive == true || roundOffToNextFive == 'true') {
						if(lastOfAW == 0 || lastOfAW == 5) {
							addRoundedOffDiffChargeToOther((parseInt(i) - parseInt(Math.round(grandTotal))));
							$('#grandTotal').val(parseInt(i));
							break;
						}
					} else if(lastOfAW == 0) {
						addRoundedOffDiffChargeToOther((parseInt(i) - parseInt(Math.round(grandTotal))));
						$('#grandTotal').val(parseInt(i));
						break;
					}
				}
			}		
		}
	}
}

function addRoundedOffDiffChargeToOther(diffAmtAfterRoundOff) {
	$("#diffAmtAfterRoundOffForOther").val(Number(diffAmtAfterRoundOff));
}

function setDataToGetRate(destBranchId, corporateAccountId, partyTypeId) {
	var jsonObject					= new Object();

	jsonObject.srcBranchId					= getSourceBranchForRate();
	jsonObject.destBranchId					= destBranchId;
	jsonObject.corporateAccountId			= corporateAccountId;
	
	getCreditorPartyId(jsonObject, corporateAccountId);
	getConsignorPartyId(jsonObject, corporateAccountId);
	getConsigneePartyId(jsonObject, corporateAccountId);
		
	jsonObject.transportationModeId			= $('#transportationMode').val();
	jsonObject.wayBillTypeId				= $('#wayBillType').val();
	jsonObject.isLRManual					= isManualWayBill;
	jsonObject.partyTypeId					= partyTypeId;
	
	if(configuration.showBranchServiceTypeAfterBookingType == 'true' || configuration.showBranchServiceTypeAfterBookingType == true)
		jsonObject.branchServiceTypeId		= $('#branchServiceTypeId').val();
	
	if(configuration.deliveryAtAfterBookingType == 'true' || configuration.deliveryAtAfterBookingType == true)
		jsonObject.deliveryToId				= $('#deliveryTo').val();
	
	getBillSelection(jsonObject);
	
	return jsonObject;
}

function getLRTypeWisePartyId() {
	var partyId = 0;
	
	switch(Number(configuration.ChargeTypeFlavour)) {
	case 1:
		partyId		= $('#partyMasterId').val();
		break;
	case 2:
		if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
			partyId		= $('#consigneePartyMasterId').val();
		else if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
			partyId		= $('#billingPartyId').val();
		else if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
			partyId		= $('#partyMasterId').val();
		break;
	}
		
	return partyId;
}

function getCreditorPartyId(jsonObject, corporateAccountId) {
	if($('#billingPartyId').val() > 0)
		jsonObject.BillingPartyId		= $('#billingPartyId').val();
	else if($('#billingPartyCreditorId').val() > 0)
		jsonObject.BillingPartyId		= $('#billingPartyCreditorId').val();
	else
		jsonObject.BillingPartyId		= corporateAccountId;
}

function getConsignorPartyId(jsonObject, corporateAccountId) {
	if ($('#partyMasterId').val() > 0)
		jsonObject.ConsignorCorporateAccountId = $('#partyMasterId').val();
	else if ($('#consignorCorpId').val() > 0)
		jsonObject.ConsignorCorporateAccountId = $('#consignorCorpId').val();
	else
		jsonObject.ConsignorCorporateAccountId = corporateAccountId;
}

function getConsigneePartyId(jsonObject, corporateAccountId) {
	if($('#consigneePartyMasterId').val() > 0)
		jsonObject.ConsigneeCorporateAccountId	= $('#consigneePartyMasterId').val();
	else if($('#consigneeCorpId').val() > 0)
		jsonObject.ConsigneeCorporateAccountId	= $('#consigneeCorpId').val();
	else
		jsonObject.ConsigneeCorporateAccountId	= corporateAccountId;
}

function setFixChargesOnBookingTypeFTL() {
	isFixedValuationAmount	= false;
	
	if((configuration.AllowFixChargesInBookingTypeFTL == 'true') && Number($('#bookingType').val()) == BOOKING_TYPE_FTL_ID) {
		let fixChargesWithAmountInBookingTypeFTL	= (configuration.FixChargesWithAmountInBookingTypeFTL).split(',');
		
		for(const element of fixChargesWithAmountInBookingTypeFTL) {
			let chargeId_amount	= element.split('_');
				
			$('#charge' + chargeId_amount[0]).val(chargeId_amount[1]);
			$('#actualChargeAmount' + chargeId_amount[0]).val(chargeId_amount[1]);
				
			if(chargeId_amount[0] == BookingChargeConstant.VALUATION)
				isFixedValuationAmount	= true;
		}
	}
}

function setFixChargesOnBookingTypeSundry() {
	if((configuration.allowFixChargesInBookingTypeSundry == 'true' || configuration.allowFixChargesInBookingTypeSundry == true)
		&& Number($('#bookingType').val()) == BOOKING_TYPE_SUNDRY_ID) {
		let fixChargesWithAmountInBookingTypeSundry	= (configuration.fixChargesWithAmountInBookingTypeSundry).split(',');
		
		for(const element of fixChargesWithAmountInBookingTypeSundry) {
			let chargeId_amount	= element.split('_');
				
			$('#charge' + chargeId_amount[0]).val(chargeId_amount[1]);
			$('#actualChargeAmount' + chargeId_amount[0]).val(chargeId_amount[1]);
			
			disableCharge(chargeId_amount[0]);
		}
	}
}

function getBranchLatitudeLongitude(branchId){
	if(configuration.validateDoorDeliveryPinCodeWithDestinationPincode != 'true')
		return;
	
	jsonObjectdata = new Object();
	jsonObjectdata.filter = 23; 
	jsonObjectdata.branchId = branchId; 
	var jsonStr = JSON.stringify(jsonObjectdata);
	
	$.getJSON("AjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					hideLayer();
				} else {
					if(data.branch.typeOfLocation == 1) {
						if(data.branch.latitude == undefined && data.branch.longitude == undefined) {
							showMessage('error', 'Set Destination Branch Location.');
						} else {
							srcLatitude 		= data.branch.latitude;
							srcLongitude		= data.branch.longitude;
						}
					} else if(data.handlingBranch != undefined) {
						if(data.handlingBranch.latitude == undefined && data.handlingBranch.longitude == undefined)
							showMessage('error', 'Set Handling Branch Location of Destination Branch.');
						else {
							 srcLatitude 		= data.handlingBranch.latitude;
							 srcLongitude		= data.handlingBranch.longitude;
						}
					}
					
					deliveryBranchPincode = data.branch.pincode;
					
					if($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
						$('#dest_search').val(deliveryBranchPincode);
				}
				
				hideLayer();
			});
}

function setDoorDeliveryLatLong(){
	var destLocationAutocomplete = new google.maps.places.Autocomplete((document.getElementById('dest_search')), {
		types: ['geocode'],
		componentRestrictions: {
			country: "IN"
		}
	});

	google.maps.event.addListener(destLocationAutocomplete, 'place_changed', function() {
		var near_place = destLocationAutocomplete.getPlace();
		destLatitude = near_place.geometry.location.lat();
		destLongitude = near_place.geometry.location.lng();

	});
}

function calculateDestBranchToDoorDlyDistance() {
	
	 if (((srcLatitude == destLatitude) && (srcLongitude == destLongitude) ) || srcLatitude <= 0 || destLatitude <= 0) {	 
		 return 0;
	 } else {
		 getpostalCode(destLatitude, destLongitude);
		 var radlat1 = Math.PI * srcLatitude / 180;
		 var radlat2 = Math.PI * destLatitude / 180;
		 var theta = srcLongitude - destLongitude;
		 var radtheta = Math.PI * theta / 180;
		 var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	
		 if (dist > 1)
			 dist = 1;
		 
		 dist = Math.acos(dist);
		 dist = dist * 180 / Math.PI;
		 dist = dist * 60 * 1.1515;
		 dist = dist * 1.609344;
	
		 $('#doorDistance').html(dist.toFixed(2));
		 $('#consigneeAddress').val($('#dest_search').val());
	 }
 }

function getpostalCode(destLatitude, destLongitude) {
		var latlng = new google.maps.LatLng(destLatitude, destLongitude);
		geocoder = new google.maps.Geocoder();
		
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK && results[0]) {
				for (j = 0; j < results[0].address_components.length; j++) {
					if (results[0].address_components[j].types[0] == 'postal_code')
						doorDeliveryAddressPinCode = Number(results[0].address_components[j].short_name);
				}
			} 
		});
}

function calculateInsuranceChrgsOnDifferenceDeclaredValue() {
	if(configuration.calculateInsuranceChrgsOnDifferenceDeclaredValue == 'false')
		return;
			
	if(Number($('#declaredValue').val()) > Number(configuration.DeclareValCalculateInsuranceChrgs)) {
		let	insuranceAmt = Math.round(((Number($('#declaredValue').val()) - Number(configuration.DeclareValCalculateInsuranceChrgs)) * configuration.percentageValToCalculateInsuranceChrgsOnDeclareVal) / 100);
		$('#charge' + INSURANCE).val(insuranceAmt);
	} else
		$('#charge' + INSURANCE).val(0);
}

function calculateFragileCharge() {
	if(configuration.calculateFragileChargeOnFreight == 'false')
		return;
		
	var freightValue = Number($('#charge' + BookingChargeConstant.FREIGHT).val());
	
	var countfragile	= 0;
	
	if(consigAddedtableRowsId.length > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#goodsClassificationId' + consigAddedtableRowsId[i]).html() > 0) {
				var goodsClassificationId 	= parseInt($('#goodsClassificationId' + consigAddedtableRowsId[i]).html());
				
				if(goodsClassificationId == GOODS_CLASSIFICATION_FRAGILE)
					countfragile++;
			}	
		}
	}
	
	if(countfragile > 0)
    	$('#charge' + FRAGILE).val(freightValue * configuration.fragileRate / 100);
}

function checkValidateNextLRNumberOnLogin() {
	var branchIdsForNextLRNumberOnLogin	= configuration.branchIdsForNextLRNumberOnLogin;
	
	if(configuration.validateNextLRNumberOnLogin == 'true' && branchIdsForNextLRNumberOnLogin != undefined && branchIdsForNextLRNumberOnLogin.length > 0) {
		var branchIdsForNextLRNumberOnLoginList 		= branchIdsForNextLRNumberOnLogin.split(',');
		
		if(isValueExistInArray(branchIdsForNextLRNumberOnLoginList, executive.branchId))
			configuration.validateNextLRNumberOnLogin = 'true';
		else
			configuration.validateNextLRNumberOnLogin = 'false';
	}
}

function showVehicleNumberAndTruckTypeOnBookingType(bookingTypeId) {
	if(bookingTypeId == BOOKING_TYPE_FTL_ID
		|| (configuration.showVehicleNumberAndVehicleTypeOnSundry == 'true' && bookingTypeId == BOOKING_TYPE_SUNDRY_ID)
		|| configuration.isShowVehicleNumberForAllBookingType == 'true') {
		$('#vehicleTypeDiv').switchClass('show', 'hide');
		$('#vehicleNumberDiv').switchClass('show', 'hide');
	} else if(bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
		if (configuration.ShowTruckTypeOnDDDV == 'true')
			$('#vehicleTypeDiv').switchClass('show', 'hide');
		else
			$('#vehicleTypeDiv').switchClass('hide', 'show');

		if(configuration.ShowTruckNumberOnDDDV == 'true')
			$('#vehicleNumberDiv').switchClass('show', 'hide');
		else
			$('#vehicleNumberDiv').switchClass('hide', 'show');
	} else {
		$('#vehicleTypeDiv').switchClass('hide', 'show');
		$('#vehicleNumberDiv').switchClass('hide', 'show');
	}
	
	$('#vehicleType').val(0);
	$('#vehicleNumber').val('');
}


function editWeightAmt() { 
	if(configuration.changeWeightRateOnWeightAmountChange != 'true')
		return;
	
	var weightRate		= 0.0;

	var chargeWeight    = Number($('#chargedWeight').val());
	var weightAmount    = Number($('#weightAmount').val());
	
	if(chargeWeight > 0)
		weightRate		= weightAmount / chargeWeight;
		
	weightRate		= (weightRate).toFixed(2)
	
	if(weightRate < weightFromDb) {
		setValueToTextField('weightAmount', (chargeWeight * weightFromDb));
		setValueToTextField('weigthFreightRate', weightFromDb);
		showMessage('info', 'You can not enter Weight Amount less than ' + (chargeWeight * weightFromDb) + ' !');
		checkIfnotPresent();
		return false;
	} else {
		setValueToTextField('weigthFreightRate', weightRate);
		checkIfnotPresent();
	}
}

function calculateCustomChargesOnDeclaredValue() {
	calcInsuranceOnDeclareVal();
	calculateInsuranceOnRiskCover();
	calculateInsuranceChrgsOnDifferenceDeclaredValue();
	calculateOtherChargeBasedOnDeclaredValue();
	calculateRiskCoverageOnDeclaredValue();
	calcTotal();
}

function calcInsuranceOnDeclareVal() {
	let decVal = $('#declaredValue').val();

	if(configuration.calculateInsuranceChrgsOnDeclareVal == 'true') {
		let insuranceAmt = Math.round((decVal * configuration.percentageValToCalculateInsuranceChrgsOnDeclareVal) / 100);
		
		if(configuration.DeclareValCalculateInsuranceChrgs != 0 && configuration.DeclareValCalculateInsuranceChrgs != 0.0) {
			if(decVal > configuration.DeclareValCalculateInsuranceChrgs)
				$('#charge' + INSURANCE).val(insuranceAmt);
			else
				$('#charge' + INSURANCE).val(0);
		} else
			$('#charge' + INSURANCE).val(insuranceAmt);
	}
}

function calculateOtherChargeBasedOnDeclaredValue() {
	if(configuration.allowRiskChargeCalculationBasedOnWeightAndDeclaredValue == 'false')
		return;
	
	if($('#wayBillType').val() != WAYBILL_TYPE_CREDIT && $('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		var weight = $('#tempWeight').val();
		
		if(weight > 0.5) {
			var declaredValue = $('#declaredValue').val();
		
			if(declaredValue > 0) {
				var riskValue = declaredValue * (Number(configuration.chargeRateBasedOnDeclaredValue) / 100);
				$('#charge' + OTHER_BOOKING).val(Math.ceil(riskValue / configuration.rickChargeValueRoundOffBy) * configuration.rickChargeValueRoundOffBy);
				$('#charge' + OTHER_BOOKING).prop("readonly", "true");
				calcTotal();
			}
		}
	}
}

function getCityList() {
	showLayer();
	
	let jsonObject			= new Object();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/CityListWS/getCityDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			hideLayer();
			
			$('#etaSourceCityId').find('option').remove().end();
			$('#etaDestinationCityId').find('option').remove().end();
			
			if(data == undefined || data.newCityList == undefined) {
				showMessage('error', 'No City Found !');
				return;
			}
			
			let cityListObj  = data.newCityList;
					
			let cityArray = new Array();
				
			cityArray.push('<option value="' + 0 + '" id="' + 0 + '">Please select </option>');
				
			for (const element of cityListObj) {
				cityArray.push('<option value="' + element.cityId + '" id="' + element.cityId  + '">' + element.name + '</option>');
			}
			
			$('#etaSourceCityId').append(cityArray);
			$('#etaDestinationCityId').append(cityArray);
		}
	});
}			

function getBranchList(cityId, branchElementId) {
	var jsonObject			= new Object();
	jsonObject.CityId		= cityId;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/branchMasterWS/getBranchesOnCity.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			hideLayer();
			
			$('#' + branchElementId).find('option').remove().end();
			
			if(data == undefined || data.branches == undefined) {
				showMessage('error', 'No Branch Found !');
				return;
			}
			
			var branchList  = data.branches;
			
			var branchArray = new Array();
			
			branchArray.push('<option value="' + 0 + '" id="' + 0 + '">Please select </option>');
			
			for (var i= 0; i < branchList.length; i++) {
				branchArray.push('<option value="' + branchList[i].branchId + '" id="' + branchList[i].branchId + '">' + branchList[i].branchName + '</option>');
			}
					
			$('#' + branchElementId).append(branchArray);
		}			
	});
}

function validateSelectionForETA() {
	return validateInputTextFeild(1, 'etaSourceCityId', 'etaSourceCityId', 'error', cityNameErrMsg)
		&& validateInputTextFeild(1, 'ETABranchId', 'ETABranchId', 'error', branchNameErrMsg)
		&& validateInputTextFeild(1, 'etaDestinationCityId', 'etaDestinationCityId', 'error', cityNameErrMsg)
		&& validateInputTextFeild(1, 'ETAdestinationBranchId', 'ETAdestinationBranchId', 'error', branchNameErrMsg)
		&& checkForSameBranch();
}

function checkForSameBranch() {
	if($('#ETABranchId').val() == $('#ETAdestinationBranchId').val()) {
		showMessage('error', 'Source and Destination Branch cannot be same !');
		return false;
	}
	
	return true;
}

function hoursToShow() {
	var jsonObject			= new Object();
	jsonObject.fromBrachId		= $('#ETABranchId').val();
	jsonObject.toBranchId		= $('#ETAdestinationBranchId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getDistanceBySourceDestination.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
					
			if(data == undefined || data == null || data.hours == 0) {
				//showMessage('error', 'No Record Found !');
				$('#hourspara').html('<p style="text-align:center;font-weight: bold;font-size: 110%;color: red;text-indent: 30px;text-transform: uppercase;">Days Not Configured !</p>');
				return;
			}
					
			var sourceName 		= document.getElementById("ETABranchId");
			var source			= sourceName.options[sourceName.selectedIndex].text;
			var destinationName = document.getElementById("ETAdestinationBranchId");
			var destination		= destinationName.options[destinationName.selectedIndex].text;
					
			var days		= Math.round(data.hours / 24);
			var daysValue	= days == 1 ? (days + ' Day') : (days + ' Days');
			
			if(days == 0)
				$('#hourspara').html('<p style="text-align:center;font-weight: bold;font-size: 110%;color: red;text-indent: 30px;text-transform: uppercase;">Days Not Configured !</p>');
			else
				$('#hourspara').html('<p style="text-align:center;font-weight: bold;font-size: 110%;color: navy;text-indent: 30px;text-transform: uppercase;"><br> From ' + source + ' To ' + destination + ' Will Take ' + daysValue + '</p>')
		}, error : function(e) {
			console.log(" **** ", e);
		}
	});	
}

function resetETAData() {
	$('#hourspara').text('');
	$('#ETAdestinationBranchId').find('option').remove().end();
	$('#ETAdestinationBranchId').append('<option value="' + 0 + '" id="' + 0 + '">Please select </option>');
	$('#ETABranchId').find('option').remove().end();
	$('#ETABranchId').append('<option value="' + 0 + '" id="' + 0 + '">Please select </option>');
	$('#ratePara').text('');
}

function showETARate() {
	var jsonObj	= new Object();
	
	jsonObj.sourceBranchId 			= $('#ETABranchId').val();
	jsonObj.destinationBranchId 	= $('#ETAdestinationBranchId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/bookingRateWS/getRateForEta.do',
		data		:	jsonObj,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				$('#ratePara').html('<p style="text-align:center;font-weight: bold;font-size: 110%;color: red;text-indent: 30px;text-transform: uppercase;">Rate Not Configured !</p>');
				hideLayer();
				return;
			} 
			
			var source			= $("#ETABranchId option:selected").text();
			var destination		= $("#ETAdestinationBranchId option:selected").text();
			
			let  rateArr	= [];
			
			rateArr.push('<p style="text-align:center;font-weight: bold;font-size: 110%;color: navy;text-indent: 30px;">Rate From ' + source + ' To ' + destination + ':');
			
			rateArr.push('PTL Freight Rate is : &#x20B9; ' + data.ptlFreightRate + ' Per Kg.');
			rateArr.push('Sundry Freight Rate is : &#x20B9; ' + data.sundryFreightRate + ' Per Kg.');
			
			rateArr.push('</p>');
				
			$('#ratePara').html(rateArr.join('<br>'));
			hideLayer();
		}
	});
}

function setDestinationBranchLimit(destinationBranchId,isAgentBranch){
	if((configuration.allowPrepaidAmount == 'true' || configuration.allowPrepaidAmount == true) && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY 
	&&  Number(destinationBranchId) > 0 && (isAgentBranch == 'true' || isAgentBranch == true)){ 
		var jsonObject						= new Object();
		jsonObject.branchId					= destinationBranchId;
		jsonObject.accountGroupId			= executive.accountGroupId;
		jsonObject.isParentBranchDataNeeded	= true;
		jsonObject.deductBalanceFromHandlingBranchOfDestinationBranch = configuration.deductBalanceFromHandlingBranchOfDestinationBranch;

		$.ajax({
			type		: 	"POST",
			url			: 	'/ivwebservices/BranchWisePrepaidAmountWS/getBranchWisePrepaidAmountByBranchId.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.message != undefined){
					$("#branchBalance").removeClass('hide');
					$("#branchBalance").html('<span style="color: red;">Destination Balance : </span> 0');
					switchHtmlTagClass('destinationbranchpanel', 'width-60per', 'width-20per');
				} else if(data.branchNotAllowedForPrepaidRecharge == true || data.branchNotAllowedForPrepaidRecharge == 'true'){
					$("#branchBalance").addClass('hide');
				} else {
					/*
					if(configuration.updateClosingBalanceInPrepaidAmount == 'true' || configuration.updateClosingBalanceInPrepaidAmount == true){
						var balance = Number(-(data.rechargeAmount) + data.branchLimit);
					} else {
						var balance = Number((data.rechargeAmount) + data.branchLimit);
					}
					*/
					var balance = Number(data.rechargeAmount + data.branchLimit);
					$("#branchBalance").removeClass('hide');
					
					if(data.parentBranchRechargeAmt != undefined) {
						var parentBalance = Number(data.parentBranchRechargeAmt + data.parentBranchLimit).toFixed(2);
						$("#branchBalance").html('<span style="color: red;">Dest Balance: </span>' + balance.toFixed(2) + '<span style="color: blue;"> Parent Balance: </span>'+parentBalance);
						switchHtmlTagClass('destinationbranchpanel', 'width-100per', 'width-20per');
					} else {
						if(configuration.useBranchLimitWithoutParentChildOrSharing == 'true' && Number(data.branchLimit).toFixed(2) > 0){
							$("#branchBalance").html('<span style="color: red;">Dest Balance: </span>' + Number(data.rechargeAmount).toFixed(2) +' <span style="color: blue;">(Branch Limit = ' + Number(data.branchLimit).toFixed(2) + ')</span>');
						} else {
							$("#branchBalance").html('<span style="color: red;">Dest Balance: </span>' + balance.toFixed(2));
							switchHtmlTagClass('destinationbranchpanel', 'width-60per', 'width-20per');
						}
					}
				}
			}
		});
	} else {
		$("#branchBalance").addClass('hide');
	}
}

function setCustomeLebelForBookingPage(configuration){
	$('#consignorLebel').text(configuration.consignorFeildLebel); 
	$('#consignorName').attr("placeholder", configuration.consignorFeildLebel +" Name");
	
	$('#consignorName').bind('focus', function () {
		partyType = 1;
		showInfo(this, configuration.consignorFeildLebel + " Name");
	});
	
	$('#consignorName').bind('focus', function () {
		partyType = 1;
		showInfo(this, configuration.consignorFeildLebel + " Name");
	});
	
	$('#consignorPhn').bind('focus', function () {
		showInfo(this, configuration.consignorFeildLebel + " Phone");
	});
	
	$('#consignorPhn').bind('keyup', function () {
		showInfo(this, configuration.consignorFeildLebel + " Phone");
	});
	
	$('#consignorAddress').bind('focus', function () {
		showInfo(this, configuration.consignorFeildLebel + " Address");
	});
	
	$('#consignorDept').bind('focus', function () {
		showInfo(this, configuration.consignorFeildLebel + " Department");
	});
	
	$('#consignorFax').bind('focus', function () {
		showInfo(this, configuration.consignorFeildLebel + " Fax");
	});
	
	$('#consignorPin').bind('focus', function () {
		showInfo(this, configuration.consignorFeildLebel + " Pincode");
	});
	
	$('#consigneeLebel').text(configuration.consigneeFeildLebel); 
	$('#consigneeName').attr("placeholder", configuration.consigneeFeildLebel + " Name"); 
	
	$('#consigneeName').bind('focus', function () {
		partyType = 2;
		showInfo(this, configuration.consigneeFeildLebel + " Name");
	});
	
	$('#consigneePhn').bind('focus', function () {
		showInfo(this, configuration.consigneeFeildLebel + " Phone");
	});
	
	$('#consigneePhn').bind('keyup', function () {
		showInfo(this, configuration.consigneeFeildLebel + " Phone");
	});
	
	$('#consigneeAddress').bind('focus', function () {
		showInfo(this, configuration.consigneeFeildLebel + " Address");
	});
	
	$('#consigneeDept').bind('focus', function () {
		showInfo(this, configuration.consigneeFeildLebel + " Department");
	});
	
	$('#articleDetailsLebel').text(configuration.articleDetailsLebel);
	$('#totalArtLebel').text('Total ' + configuration.articleFeildLebel);
	$('#itemsLebel').text(configuration.articleFeildLebel);
	
	$('#quantity').bind('focus', function () {
		showInfo(this, 'No. of ' + configuration.articleFeildLebel);
	});
	
	$('#packingTypeAutoCompleter').bind('focus', function () {
		showInfo(this, configuration.articleFeildLebel + ' Type');
	});
	
	$('#packingTypeAutoCompleter').attr("placeholder", configuration.articleFeildLebel + ' Type');
	
	$('#typeofPacking').bind('focus', function () {
		showInfo(this, configuration.articleFeildLebel+" Type");
	});
	
	$('#artAmtLebel').text(configuration.articleFeildLebel + ' Amt');
	
	$('#artAmtLebel').bind('focus', function () {
		showInfo(this,  configuration.articleFeildLebel + ' Amt');
	});
	
	$('#saidToContain').attr("placeholder", configuration.saidToContainsLebel);
	
	$('#saidToContain').bind('focus', function () {
		if(configuration.showSelectedPackingTypeAndSaidToContainsInTooltip == true || configuration.showSelectedPackingTypeAndSaidToContainsInTooltip =='true') {
			if(this.value != '')
				showInfo(this, this.value);
			else
				showInfo(this, configuration.saidToContainsLebel);
		} else
			showInfo(this, configuration.saidToContainsLebel);
	});

	$('#additionalremark').attr("placeholder", configuration.additionalRemarkFeildLebel);
	$('#additionalremark').bind('focus', function () {
		showInfo(this,  configuration.additionalRemarkFeildLebel);
	});
	
	$('#chargeType option:contains("Article")').text(configuration.chargeTypeArticleLebel); 
}

function getDestinationBranchDetails(id, label) {
	var destData = (id).split("_");
	
	if(configuration.SourceDestinationWiseWayBillNumberGeneratorAllow == 'true' || configuration.subRegionWiseSourceDestinationWiseSequence == 'true') {
		if(!isManualWayBill) {
			if(configuration.TokenWiseAutoLrSequence == 'true' && !isAutoSequenceCounter)
				getTokenWiseLrSequence(parseInt(destData[0]), ""); //calling from lrSequenceCounter.js
			else if(configuration.sourceDestinationSubRigionWiseWayBillSequence == 'true') {
				var SubRegionWiseSourceDestinationSequence = configuration.branchIdsForSubRegionWiseSourceDestinationWiseSequence.split(",");
				
				if(isValueExistInArray(SubRegionWiseSourceDestinationSequence, branchId)) {
					configuration.BranchCodeWiseWayBillNumberGeneration = false;
					checkSourceDestinationWiseSequence(parseInt(destData[0])); //Calling from lrSequenceCounter.js
				}
			} else
				checkSourceDestinationWiseSequence(parseInt(destData[0])); //Calling from lrSequenceCounter.js
		}
	} else if(configuration.showBranchCodeWiseTokenLrNumberInManualLRField == 'true')
		getTokenWiseLrSequence(parseInt(destData[0]), loggedInBranch.branchCode)
				
	if(configuration.ChargeTypeFlavour == '4') {
		resetCustomer();
		resetBillingParty();
		chargesConfigRates				= null;
		wayBillRates					= null;
		billingPartyChargeConfigRates	= false;
		consignorPartyChargeConfigRates	= false;
		consigneeChargeConfigRates		= false;
		isBranchChargeConfigRate		= false;
		isConsignorIncreaseChargeWeight = false;
		isConsigneeIncreaseChargeWeight	= false;
		weightTypeArr				= new Array();
		quantityTypeArr				= new Array();
	}
				
	var isAgentBranch			= false;
	
	if(destData[9] != undefined && destData[9] != null)
		isAgentBranch	= destData[9];
	else if(destData[5] != undefined && destData[5] != null)
		isAgentBranch	= destData[5];
		
	if(configuration.DeliveryDestinationBy == DELIVERY_DESTINATION_WITH_PINCODE) {
		if(destBranch != undefined){
			isAgentBranch	= destBranch.agentBranch
		}
	}
		
	$('#isDestAgentBranch').val(isAgentBranch);
	setDestinationBranchLimit(destData[0], isAgentBranch);
	
	var partyType	= 1;
	
	if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3')
		partyType = $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY ? 2 : 1;
				
	getRates(parseInt(destData[0]), getLRTypeWisePartyId(), partyType);
		//if(typeof getChargesConfigRates != 'undefined') getChargesConfigRates(partyMasterId, parseInt(destData[0]));
	getDistanceBySourceDestination(parseInt(destData[0]));
				
	if(configuration.showTransporterName == 'true')
		setTransporterName(parseInt(destData[0]));
			
	if(configuration.showExcludeCommissionOption == 'true')
		getBranchCommission(destData[0]);
		
	if(configuration.makeWeightMandatoryForBranchCommission == 'true')
		checkBranchCommissionForWeight(destData[0]);

	if(subRegionIdsForOverNite != undefined && subRegionIdsForOverNite.length > 0){
		var overNiteSubRegionIdList = subRegionIdsForOverNite.split(',');
		var checkSubRegion 			= isValueExistInArray(overNiteSubRegionIdList, Number(destData[6]));

		if(checkSubRegion)
			destnationBranchIdForOverNite = destData[6];
		else
			destnationBranchIdForOverNite = 0;

		if(checkSubRegion) {
			if($('#wayBillType').val() != WAYBILL_TYPE_PAID) {
				showMessage('info', 'Your Are  Allowed To Booked For Paid LR Only !');
				$('#destination').focus()
				return false;
			}
		}
					
		changeGstRatesOnTransportMode();
	}

	resetArticleWithTable();
	getDestination(id, label); // function defined in commonFunctionForCreateWayBill.js
	
	if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true')
		checkWayBillTypeAndDestinationBranchWiseBooking();

	if(configuration.MatchConsigneePincodeWithDestinationBranchPincode == 'true')
		getBranchPincodeList(parseInt(destData[0])); // function defined in commonFunctionForCreateWayBill.js
				
	if(configuration.shortCreditConfigLimitAllowed == 'true')
		getShortCreditConfigLimitForBranch();
				
	var regionIds 		= configuration.regionIdsForSourceBranchWork;
	var regionIdsArr 	= regionIds.split(",");
				
	if(configuration.showBranchRemarkOnOperationalBranch == 'true' 
			&& configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, executive.regionId)){
		getBranchRemark(parseInt(destData[0]));
	}

	destBranchAccountGroupId 	= parseInt(destData[4]);
	destinationBranchStateId	= parseInt(destData[2]);
	destinationBranchGstn		= destData[10];
	
	validateDestinationSubRegionForDDDVBooking();
	setCompanyWiseTaxes(0);
		
	getBranchLatitudeLongitude(parseInt(destData[0])); // function defined in commonFunctionForCreateWayBill.js
	
	if(configuration.freightUptoDestSameAsDestOnDoorDly == 'true'){
		setFreightUptoDestOnDoorDly();
	}
}

function isGSTNumberWiseBooking() {
	return configuration.gstNumberWiseBooking == 'true' || configuration.gstNumberWiseBooking == true;
}

function checkGSTNumberEntered(gstn) {
	return gstn != undefined && gstn != '' && gstn.length >= 15;
}

function setChequeAmount() {
	if($("#chequeAmount").exists()) {
		if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
			$("#chequeAmount").val($("#grandTotal").val());
			$('#addedPaymentTxnAmount').val($("#grandTotal").val());
		} else if($("#paymentType").val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
			$("#chequeAmount").val($("#grandTotal").val());
		else
			$("#chequeAmount").val('');
	}
}

function showDropDownAtWayBillTypeFoc() {
	if(configuration.showFocApprovedBy == 'false' || configuration.showFocApprovedBy == false)
		return;
		
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC)
		$("#DirectorDetails").show();
	else {
		$("#DirectorDetails").hide();
		$('#directorId').val(0);
	}
}

function addAmountToFreightOnPerArticleData(){
	if(configuration.allowToAddRatePerArticleToFreight == 'false' || isManualWayBill || $('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return;
		
	if(executive.branchId == 40)
		return;
	
	var qtyAmount				= Number($('#qtyAmount').val());
	var totalQuantity			= Number($('#totalQty').html());
	var totalAmt				= totalQuantity * Number(configuration.ratePerArticleToAddOnFreight);
	
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
		
	let consignorGSTNVal		= $('#' + consignorGstnEle).val();
	let consigneeGSTNVal		= $('#' + consigneeGstnEle).val();

	var isConsignorGSTNumberAvailable	= !jQuery.isEmptyObject(consignorGSTNVal);
	var isConsigneeGSTNumberAvailable	= !jQuery.isEmptyObject(consigneeGSTNVal);

	if(totalQuantity > 0 && !isConsignorGSTNumberAvailable || !isConsigneeGSTNumberAvailable)
		 $('#charge1').val(qtyAmount + totalAmt);
	else if(totalQuantity > 0)
		$('#charge1').val(qtyAmount);
	else
		$('#charge1').val(0);
}

function checkMinimumChargeWght(){
	if(configuration.validateMinimumChargeWeightToApplyChargeTypeFix == 'false' || isManualWayBill)
		return; 
		
	if(!isMinimumChargeWeightToApplyChargeTypeFix()) {
		$("#chargeType option[value='2']").remove();
		$('#qtyAmount').attr('readOnly','true');
	} else {
		$('#qtyAmount').removeAttr('readOnly');
		setChargeType();
	}
}

function isMinimumChargeWeightToApplyChargeTypeFix() {
	return Number($('#chargedWeight').val()) > configuration.minimumChargeWeightToApplyChargeTypeFix;
}

function calculateDiscountAmount() {
	var disAmt 			= 0.00;
	var totalAmt		= $('#totalAmt').val();

	if($("#isDiscountPercent").exists() && $("#isDiscountPercent").prop("checked"))
		disAmt = (parseFloat($("#discount").val()) * parseFloat(totalAmt)) / 100;
	else
		disAmt = $('#discount').val();
	
	if(!validateDiscountLimit(discountInPercent, totalAmt, disAmt, $('#discount')))
		return false;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
			
		if(element != undefined && element != null)
			changeTextFieldColorNew(element, '', '', 'red');

		return false;
	}

	return true;
}

function checkBranchIdForServiceTaxCalculation() {
	if (configuration.serviceTaxCalculationBranchLevel == 'true' && configuration.branchIdForServiceTaxCalculation != undefined) {
		var branchIdsArray = (configuration.branchIdForServiceTaxCalculation).split(',');
		
		if (isValueExistInArray(branchIdsArray, branchId)) {
			configuration.hideStPaidByTransporter		= 'false'
			configuration.hideStPaidByNotApplicable     = true
			configuration.showStPaidByConsignor		    = false
			configuration.showStPaidByConsignee		    = false
			configuration.DefaultSTPaidBy				= 3
			configuration.DefaultSTPaidByForPaidLR		= 3
			configuration.DefaultSTPaidByForToPayLR		= 3
			configuration.DefaultSTPaidByForTBBLR		= 3
			configuration.DefaultSTPaidByForFOCLR		= 3
		}
	}
}

function getCFTAmtAndRate(jsonObject) {
	if($('#cftAmount').val() > 0)
		jsonObject.cftValue 		= $('#cftAmount').val();
		
	if($('#cftFreightRate').val() > 0)	
		jsonObject.cftRate			= $('#cftFreightRate').val();
}

function getCBMAmtAndRate(jsonObject) {
	if($('#cbmAmount').val() > 0)
		jsonObject.CBMValue 	= $('#cbmAmount').val();
	
	if($('#cbmFreightRate').val() > 0)	
		jsonObject.CBMRate		= $('#cbmFreightRate').val();
}

function getSourceBranchIdForApplyRate() {
	let branchId	= 0;
	
	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill)
		branchId	= $('#sourceBranchId').val();
	else
		branchId	= executive.branchId;
	
	return branchId;
}

function showPartyDetailsPopUpOnMultipleGstn(data){
	
	let conorList = data.consignorGstnList;
	let coneeList = data.consigneeGstnList;
	let conorHM = data.consignorGstnHm;
	let coneeHM = data.consigneeGstnHm;
	let conorCorporateId = 0;
	let coneeCorporateId = 0;
	let consignorObj = null;
	let consigneeObj = null;
	let isPartySelect = true;
	let consignorGstn 	= null;
	let consigneeGstn 	= null;
	let ewayBillData = data.getEwaybillDetails;
	
	if(ewayBillData){
		consignorGstn = ewayBillData.gstin_of_consignor;
		consigneeGstn = ewayBillData.gstin_of_consignee;
	}
	
	if(coneeList != undefined)
		consigneeObj	= coneeList[coneeList.length-1]
	
	if(conorList != undefined && coneeList != undefined && conorList.length == 1) {
		isPartySelect	= false;
		setConorAndConeeOnMultiGstn(conorList[0], consignorGstn, conorList[0].corporateAccountId, coneeList[coneeList.length-1], consigneeGstn, coneeList[coneeList.length-1].corporateAccountId)
	} else
		$('#partyDetailsOnGstnModal').modal('show');
	
	if(conorList != undefined) {
		let options = '<option value="-1">Please Select</option>';
	
		if(conorList.length > 1) {
			for(const element of conorList) {
				options += '<option value="'+element.corporateAccountId+'">'+element.corporateAccountDisplayName+'</option>';
			}
		}
			
		$('#cnorDetailsId').html(options);
	}
			
	$("#applyDetailsBtn").click(function() {
		if(Number($('#cnorDetailsId').val()) == -1)
			return false;
		else {
			isPartySelect = false;
			conorCorporateId  = $('#cnorDetailsId').val();
				
			consignorObj = conorHM[conorCorporateId];
				
			setConorAndConeeOnMultiGstn(consignorObj, consignorGstn,conorCorporateId, consigneeObj, consigneeGstn, consigneeObj.corporateAccountId)
			$('#destination').focus();
		}
	});
		
	if(isPartySelect) {
		resetConsignor();
		resetConsignee();
		resetBillingParty();
	}
		
	setConsigneeEwaybill(consigneeObj, consigneeGstn);
	setMultipleInvoiceAndDeclareValue();
}

function setConorAndConeeOnMultiGstn(consignorObj, consignorGstn, conorCorporateId, consigneeObj, consigneeGstn, coneeCorporateId){
	setRateType();
	setConsignorEwaybill(consignorObj, consignorGstn);
	setConsigneeEwaybill(consigneeObj, consigneeGstn);
			
	$('#partyDetailsOnGstnModal').modal('hide');
	hideLayer();
	
	let waybilltypeId 		= $('#wayBillType').val();
	let destinationBranchId	= $('#destinationBranchId').val();
	
	if(configuration.ChargeTypeFlavour == '1' || waybilltypeId == WAYBILL_TYPE_PAID
		|| waybilltypeId == WAYBILL_TYPE_CREDIT && consignorObj.corporateAccountTBBParty)
		getRates(destinationBranchId, conorCorporateId, CUSTOMER_TYPE_CONSIGNOR_ID);
	else if(waybilltypeId == WAYBILL_TYPE_TO_PAY)
		getRates(destinationBranchId, coneeCorporateId, CUSTOMER_TYPE_CONSIGNEE_ID);
}

function setFixChargesOnBookingTypeDDV() {
	isFixedValuationAmount	= false;
	
	if((configuration.AllowFixChargesInBookingTypeDDV == 'true' || configuration.AllowFixChargesInBookingTypeDDV == true)
		&& Number($('#bookingType').val()) == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
		let fixChargesWithAmountInBookingTypeDDV	= (configuration.FixChargesWithAmountInBookingTypeDDV).split(',');
		
		for(const element of fixChargesWithAmountInBookingTypeDDV) {
			let chargeId_amount	= element.split('_');
				
			$('#charge' + chargeId_amount[0]).val(chargeId_amount[1]);
			$('#actualChargeAmount' + chargeId_amount[0]).val(chargeId_amount[1]);
				
			if(chargeId_amount[0] == VALUATION)
				isFixedValuationAmount	= true;
		}
	}
}

function setNextWayBillNumberByBranchCode() {
	let sequenceNumberFormat = Number(configuration.sequenceNumberFormat);
	
	if(sequenceNumberFormat > 0) {
		if(sequenceNumberFormat == 17)
			setValueToHtmlTag('lrnumber', ' Next LR No : ' + loggedInBranch.branchCode + "-" + destBranch.branchCode + "-" + nextLrNumberSeq);
	} else if(configuration.showNextLRNumberWithDestBranchCode == true || configuration.showNextLRNumberWithDestBranchCode == 'true')
		setValueToHtmlTag('lrnumber', ' Next LR No : ' + loggedInBranch.branchCode +"/"+ destBranch.branchCode+"/"+nextLrNumberSeq);
}

function createInsurance() {
	invoiceDetailArrayForInsurance	= [];
	removeInsuranceCharges();
	
	if(singleInvoiceDetailsArr.length > 0 && invoiceDetailArray.length > 0)
		invoiceDetailArrayForInsurance	= singleInvoiceDetailsArr.concat(invoiceDetailArray);
	else if(singleInvoiceDetailsArr.length > 0)
		invoiceDetailArrayForInsurance	= singleInvoiceDetailsArr;
	else if(invoiceDetailArray.length > 0)
		invoiceDetailArrayForInsurance	= invoiceDetailArray;
	
	if (invoiceDetailArrayForInsurance.length > 0) {
		let jsonObject = new Object();
		jsonObject.invoiceDetailsArr = JSON.stringify(invoiceDetailArrayForInsurance);
			
		showLayer();	
		$.ajax({
			type		: "POST",
			url			:  WEB_SERVICE_URL + '/insuranceServiceWS/getTotalInsuranceAmount.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				hideLayer();
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					removeInsuranceCharges();
					return;
				}

				//$('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val(data.totalInsurance);
				
				let totalInsurance = 0;
					
				for(const obj of invoiceDetailArrayForInsurance) {
					let premiumAmount	= data['invoiceNumber' + obj.invoiceNumber];
					
					const subCommObj = subCommodityHM.get(Number(obj.subCommodityMasterId));
					
					if(subCommObj != undefined && subCommObj.insuranceRequired && premiumAmount != undefined) {
						obj.premiumAmount	= premiumAmount;
						totalInsurance += obj.premiumAmount;
					}
				}
				
				$('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val(totalInsurance);
				
				calcTotal();
					
				policyGenerationRequestId	= data.policyGenerationRequestId;
			},error: function(jqXHR, textStatus, errorThrown) {
				console.error("AJAX Error: ", textStatus, errorThrown);
			}
		});			
	}
}

function removeInsuranceCharges() {
	$('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val(0);
	calcTotal();
}

function hideShowTaxTypeSelection() {
	if(configuration.showTaxType == 'false')
		return;

	if($('#billSelection').val() != BOOKING_GST_BILL  && configuration.showTaxTypeOnlyForBillSelectionGST == 'true') {
		$('#taxTypeId').val(0);
		$('#taxTypePanel').addClass('hide');
	} else{
		$('#taxTypePanel').removeClass('hide');
	}
	
 	checkTaxTypeForTaxCalculation();
}

function isPackingTypeExistForSkipInvoiceNoValidation() {
	var isExsist = false;

	if(consigAddedtableRowsId.length > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#typeofPackingId' + consigAddedtableRowsId[i]).html() > 0) {
				var packingTyepIds	= (configuration.packingTypeIdForSkipInvoiceNoValidation).split(",");
				
				if(isValueExistInArray(packingTyepIds, parseInt($('#typeofPackingId' + consigAddedtableRowsId[i]).html()))) {
					isExsist = true;
					break;
				}
			}
		}
	}
	
	return isExsist;
}

function isPackingTypeExistForSkipDeclareValueValidation() {
	var isExsist = false;

	if(consigAddedtableRowsId.length > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#typeofPackingId' + consigAddedtableRowsId[i]).html() > 0) {
				var packingTyepIds		= (configuration.packingTypeIdForSkipDeclaredValueValidation).split(",");
				
				if(isValueExistInArray(packingTyepIds, parseInt($('#typeofPackingId' + consigAddedtableRowsId[i]).html()))) {
					isExsist = true;
					break;
				}
			}
		}
	}
	
	return isExsist;
}

function getShortCreditDueAmount() {
	let paymentType 	= $('#paymentType').val();
	let consignorParty 	= $('#partyMasterId').val();
	let consignorName 	= $('#consignorName').val()

	if (paymentType == PAYMENT_TYPE_CREDIT_ID && consignorParty > 0) {
		let jsonObject = new Object();

		jsonObject["corporateAccountId"] = consignorParty;

		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/creditPaymentModuleWS/getShortCreditDueAmount.do',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if(data.outStandingAmount > 0){
					$('#NameforPopup').html(`The Previous Short Credit Amount of <b>${consignorName}</b> is  Rs `)
					$('#AmountSection').html(data.outStandingAmount)
					$('#exampleModalforShortCredit').modal('show')
					localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
					
					$(() => {
						$('#AmountSection').on('click', function() {
							childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditOutStandingReportLR&masterid=&tab=6", "_blank");
						})
					})
				}
			}
		});
	}
}

function isLrTypeWiseInsuranceService(wayBillTypeId) {
	if (configuration.allowLRTypeWiseInsuranceService == 'true' && jsondata.allowBranchWiseInsuranceService)
		return isValueExistInArray((configuration.lrTypesForInsuranceService).split(","), wayBillTypeId);
	
	return jsondata.allowBranchWiseInsuranceService;
}

function calculateRiskCoverageOnDeclaredValue() {
	let percentageToCalculateRiskCoverageOnDeclareValue = configuration.percentageToCalculateRiskCoverageOnDeclareValue;

	if(percentageToCalculateRiskCoverageOnDeclareValue == 0.0)
		return;
		
	let wayBillType		= $('#wayBillType').val();
	let declaredValue	= $('#declaredValue').val();
	
	const checkbox = $('#declaredValueCheckBox');

	if (configuration.calculateRiskCoverageBasedOnPartyInTbb == 'true' && wayBillType == WAYBILL_TYPE_CREDIT) {
		$("#charge" + RISK_COVERAGE).val(0);
		
		if (riskcoveragePercentage)
			$("#charge" + RISK_COVERAGE).val((declaredValue * riskCoverage / 100).toFixed(2));
		else
			$("#charge" + RISK_COVERAGE).val(riskCoverage);

		$('#charge' + RISK_COVERAGE).prop("readonly", true);
		checkbox.prop("disabled", true);
		return;
	}

	if (configuration.nonEditableRiskCoverageCharge == 'true' && wayBillType == WAYBILL_TYPE_CREDIT)
		return;

	$("#charge" + RISK_COVERAGE).val((declaredValue * percentageToCalculateRiskCoverageOnDeclareValue / 100).toFixed(2));
}

function getLSDetailsForAppend() {
	
	showLayer();
	
	let jsonObject	= {};
	
	jsonObject.lsNumber	= $('#lsNumber').val();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL+'/dispatchWs/getManualLSDetailsForAppendLR.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			hideLayer();
			
			$('#dispatchDetails table').empty();
			dispatchLedgerIdForManualLS	= 0;
			crossingAgentId	= 0;
			
			if (data.message != undefined) {
				setTimeout(function() {
					$('#lsNumber').val('');
					$('#lsNumber').focus();
					let errorMessage	= data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}, 100)
				return;
			}
			
			dispatchLedger	= data.dispatchLedger;
			
			if(dispatchLedger.totalNoOfWayBills == 100) {
				$('#lsNumber').val('');
				$('#dispatchDetails table').empty();
				alert('100 LRs has been added, Sorry you cannot add more LRs ?');
				return;
			}
			
			setDispatchDetails();
			creatOptionForPaymentType(paymentTypeArr, 'paymentType');
		}
	});
}

function submitInvoice() {
	jsonObjectNew 	= new Object();
	let totalFile 		= 0;
	let $inputs = $('#photoContainer :input');
	//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
	$inputs.each(function (index) {
		if($(this).val() != "") {
			let fileName	= $(this).attr('name');
			let nameArr		= fileName.split('_');
			let pdfFileName	= "pdfFileName_" + nameArr[1];

			if (this.files && this.files[0]) {
				let FR	= new FileReader();
				jsonObjectNew[pdfFileName] = this.files[0]['name']
				
				FR.addEventListener("load", function(e) {
					jsonObjectNew[fileName] = e.target.result;
				}); 

				FR.readAsDataURL(this.files[0]);
			}
			
			totalFile++;
		}
	});
	
	jsonObjectNew.noOfFileToUpload	= totalFile;
	
	if(totalFile == 0) {
		showMessage('error', selectFileToUploadErrMsg);
		return false;
	} else {
		$('#uploadInvoiceModal').modal('hide');
		
		$('#uploadInvoiceModal').on('hidden.bs.modal', function () {
			document.getElementById('declaredValue').focus();
		});

		document.getElementById('submitInvoice').addEventListener('click', function () {
			$('#uploadInvoiceModal').modal('hide'); // Close the modal
			document.getElementById('declaredValue').focus(); // Set focus to invoiceNo
		});
		
		showMessage('success', 'Document Uploaded Successfuly!');
	}
}

function uploadInvoiceDocument (noOfFileToUpload, uploadPdfDetailsList, maxSizeOfFileToUpload) {
	$('#photoContainer').empty();
	let updatedFileTypes = uploadPdfDetailsList.map(type => '.' + type).join(',');
	
	if(noOfFileToUpload > 0) {
		for(let i = 1; i <= noOfFileToUpload; i++) {
			let fileInputId = 'document_' + i;
			let fileInputHTML = '<input type="file" name="' + fileInputId + '" id="' + fileInputId + '" class="form-control photo-upload" style="margin-top: 10px; width: 310px;" accept="' + updatedFileTypes + '" />';
	
			$('#photoContainer').append(fileInputHTML);
		}
	
		validateDifferentFileTypeAndSize(noOfFileToUpload, maxSizeOfFileToUpload, uploadPdfDetailsList);
	}
}

function saveInvoiceDocument(jsonObjectNew) {
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/uploadPdfDetailsWS/uploadPdfWayBills.do',
		data		:	jsonObjectNew,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				//showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function showBillingGstnAfterBillingPartyPanel(){
	const gstField 	= document.getElementById("consignorGstn");
	const nameField = document.getElementById("billingPartyName");
	const parent 	= gstField.closest("tr").parentNode;

	switchHtmlTagClass('BillingGstn', 'show', 'hide');
	parent.insertBefore(gstField.closest("tr"), nameField.closest("tr"));
	initialiseFocus();
}

function bindEventOnDeclaredValueCheckBox() {
	$( "#declaredValueCheckBox" ).change(function() {
		if (typeof calculateValuationCharge === 'function') calculateValuationCharge(); 
		if (typeof setNonEditableRiskCoverageCharge === 'function') setNonEditableRiskCoverageCharge();
	});
	
	$( "#declaredValueCheckBox" ).click(function() {
		showHideInsuranceRateFeild();
	});
}

function showCheckboxToCalculateInsuranceOnDeclareValue() {
	if (configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {
		$('#percentageRiskCover').addClass("hide");
		$('#declaredValueCheckBox').prop("checked", false).removeClass("hide").show();
		$("#declaredValueCheckBoxlbl").html('<b>Calculate Insurance on Declare Val.</b>').removeClass("hide").show();
								
		if(document.getElementById("percentageRiskCover") != null) {
			document.getElementById("percentageRiskCover").dataset.info =
			document.getElementById("percentageRiskCover").placeholder = "% Insurance Rate";
		}
	} else if(configuration.PercentageRiskCover == 'true') {
		document.getElementById("percentageRiskCover").dataset.info =
		document.getElementById("percentageRiskCover").placeholder = "% Risk Cover";
	}
								
	if(document.getElementById("percentageRiskCover") != null) {
		document.getElementById("percentageRiskCover").onfocus = function () {
			showInfo(this, this.dataset.info);
		};
	}
}

function handleNoPermission() {
	showMessage("error", "You Don't Have Permission To Book LR !");

	const shouldRedirect =
		configuration.redirectToHomePageIfBookingPermissionNotGivenToAdmin === true ||
		configuration.redirectToHomePageIfBookingPermissionNotGivenToAdmin === 'true';

	if (shouldRedirect && executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN)
		globalThis.location.href = "Home.do?pageId=0&eventId=0";

	hideLayer();
}

function setStPaidByBasisOfBillSelection() {
	if (configuration.showGstPaidByBasisOfBillSelection == 'true') {
		let billSelectionId 	= Number($('#billSelection').val());
		removeOption('STPaidBy', null);
		createOptionForSTPaidBy();

		if (billSelectionId === BOOKING_WITH_BILL) $('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
		else if (billSelectionId === BOOKING_WITHOUT_BILL) $('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
	}
}

function setStPaidByBasisOfDivisionSelection() {
	if (configuration.showGstPaidByBasisOfDivisionSelection == 'true') {
		let divisionSelectionId 			= Number($('#waybillDivisionId').val());
		removeOption('STPaidBy', null);
		createOptionForSTPaidBy();

		if (divisionSelectionId === MAHINDRA_TRANS_LOGISTICS)
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID).prop({disabled: true, readonly: true}).addClass('disabled-field');
		else if (divisionSelectionId === MAHINDRA_CARGO_LOGISTICS)
			$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID).prop({disabled: true, readonly: true}).addClass('disabled-field');
		else if (divisionSelectionId === VIJAYA_POPULAR_LOGISTICS)
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID).prop({ disabled: false, readonly: false }).removeClass('disabled-field');
		else if (divisionSelectionId === VIJAYA_POPULAR_TRANSPORT)
			$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID).prop({ disabled: true, readonly: true }).addClass('disabled-field');
		else
			$('#STPaidBy').prop({disabled: false, readonly: false}).removeClass('disabled-field');
	}
}

function getSourceBranchId() {
	if(isManualWayBill)
		return Number($('#sourceBranchId').val());
	
	return executive.branchId;
}

function checkBranchCommissionForWeight(destBranchId) {
	let jsonObj = new Object();
	
	jsonObj.accountGroupId		= executive.accountGroupId;
	jsonObj.txnTypeId			= 2;
	jsonObj.branchId			= destBranchId;
	jsonObj.commissionTypeId	= COMMISSION_TYPE_ON_WEIGHT_ID
	jsonObj.wayBillTypeId		= Number($('#wayBillType').val());

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/branchCommissionWS/checkBranchCommissionForCommissionType.do',
		data: jsonObj,
		dataType: 'json',
		success: function(data) {
			isBranchCommissionOnWeight = data;
		}
	});
}