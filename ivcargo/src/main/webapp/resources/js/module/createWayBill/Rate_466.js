function applyReCalculatedRates() {
	setRatesTableWise();
}

function setRatesTableWise() {
	setRateType();
	
	for (let k in consignmentDataHM) {
		let qtyAmount			= consignmentDataHM[k].amount;
		let quantity			= consignmentDataHM[k].quantity;
		let typeofPacking		= consignmentDataHM[k].packingTypeMasterId;
		let consignmentGoodsId	= consignmentDataHM[k].consignmentGoodsId;

		calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);
		checkRateForPackingType(qtyAmount, quantity);
		
		idNum++;
		addinqtyArr(idNum);
		applyRates();

		getWeightTypeRates();
		checkIfnotPresent();

		applyRates();
	}
}

function findifNewRate() {
	$('#searchRate').val('');
}

function checkIfRateNotPresent() {
	let qtyAmount = $('#qtyAmount').val();
	let quantity  = $('#quantity').val();
	
	if(configuration.validateArtDetailsAfterEnterQtyAmount == 'true') {
		if(validateAddArticle()) {
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
				checkRateForPackingType(qtyAmount, 1);
			else
				checkRateForPackingType(qtyAmount, quantity);
		}
	} else if(!validateConsignmentTables())
		return false;
		
	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
		checkRateForPackingType(qtyAmount, 1);
	else
		checkRateForPackingType(qtyAmount, quantity);
}

function checkRateForPackingType(qtyAmount, quantity ) {
	let searchRate = $('#searchRate').val();
	let isFreightRateExist	= false;

	if(searchRate == "") {
		let finalQtyAmt = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
		$('#searchRate').val(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyAmt));
	} else {
		let tempString		= "";
		let fromsearchRate	= $('#searchRate').val();
		let qtyRateFromEle	= fromsearchRate.split(",");
	
		for(let j = 0; j < qtyRateFromEle.length; j++) {
			let chargeTypeId	= parseInt(qtyRateFromEle[j].split("=")[0]);
			let qtyrate			= parseFloat(qtyRateFromEle[j].split("=")[1]);
			
			if(qtyRateFromEle[j].split("=")[0] == BookingChargeConstant.FREIGHT) {
				qtyrate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
				isFreightRateExist = true;
			}
			
			if(calculateMinimumQtyAmt(qtyRateFromEle[j].split("=")[0], qtyAmount, chargeTypeId))
				qtyrate = MinQtyAmtTobeAssigned;
			
			if(j == 0)
				tempString += chargeTypeId + "=" + qtyrate;
			else
				tempString += "," + chargeTypeId + "=" + qtyrate;
		}
		
		if(!isFreightRateExist) {
			let finalQtyRate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
		
			if(tempString != "")
				tempString += "," + BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate);
			else
				tempString = BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate);
		}
		
		if(tempString != "")
			$('#searchRate').val(tempString);
	};
}

function calculateChargeAmount(filter, qtyAmount, quantity) {
	if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		quantity = Number($('#actualWeight').val()); 
	
	let artActWeight	= 1;
	
	if(configuration.WeightWiseConsignmentAmount == 'true' && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		artActWeight	= $('#artActWeight').val();
	
	let amt = 0;
	switch (Number(filter)) {
	case 1:
		amt = parseFloat(qtyAmount * quantity);
		break;

	case 2:
		if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID)
			amt = parseFloat(qtyAmount * quantity * artActWeight);
		else
			amt = parseFloat(qtyAmount);
		break;
	default:
		break;
	}
	
	if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER && distance > 0)
		amt	= amt * distance;

	return amt;
}

function checkIfnotPresent() {
	let tempString			= "";
	let chargeTypeId		= 0;
	let wghtAmt				= 0;
	let chargedWeight		= parseFloat($('#chargedWeight').val());
	let weigthFreightRate	= 0;

	if($('#weigthFreightRate').val() != '')
		weigthFreightRate	= $('#weigthFreightRate').val();

	weigthFreightRate1	= document.getElementById('weigthFreightRate');
	actualWeight		= getValueFromInputField('actualWeight');
	
	if(configuration.VolumetricWiseAddArticle == 'true' && Number($('#actualWeight').val()) > Number($('#chargedWeight').val())) 
		chargedWeight		= $('#actualWeight').val();

	let isFreightRateExist	= false;

	for(const element of weightTypeArr) {
		let sliptedByCommas	= element.split(",");
		
		for(let i = 0; i < sliptedByCommas.length; i++) {
			chargeTypeId = sliptedByCommas[i].split("=")[0];
			
			if(chargeTypeId == BookingChargeConstant.FREIGHT) {
				wghtAmt = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);
				isFreightRateExist = true;
			} else
				wghtAmt = parseFloat(sliptedByCommas[i].split("=")[1]);
			
			if(!lrWiseDecimalAmountAllow($('#wayBillType').val()))
				wghtAmt = Math.round(wghtAmt);

			if(i == 0)
				tempString += chargeTypeId + '=' + wghtAmt;
			else
				tempString += ',' + chargeTypeId + '=' + wghtAmt;
		}
	};

	if(!isFreightRateExist)
		tempString += "," + BookingChargeConstant.FREIGHT + '=' + calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);;

	if(tempString != null && tempString != '') {
		$('#searchRate').val(tempString);
		weightTypeArr = new Array();
		weightTypeArr.push(tempString);
	}

	applyRates();
}


function AddRemoveRateTypeOptions(partyCategory,partyMasterId) {
	let rateType = document.getElementById('rateType');

	if(rateType != null) {

		if(partyCategory == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)) {

			addRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID,CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_NAME);
			setRateType();

		} else if(partyCategory == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)) {

			addRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID,CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_NAME);
			setRateType();
		}
	}
}

function rateTypeExists(val) {
	return $("#rateType option[value='" + val + "']").length != 0;
}

function addRateType(value,text) {
	$('#rateType').append('<option value='+value+'>'+text+'</option>');
	$("#rateType").val(value);
}

function setRateType() {
	let currentWayBillTypeId = $('#wayBillType').val();

	if(currentWayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) {
		$("#rateType").val(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
	} else if(currentWayBillTypeId == WayBillType.WAYBILL_TYPE_TO_PAY) {
		$("#rateType").val(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
	}
}

function removeRateType(val) {
	$("#rateType option[value='" + val + "']").remove();
}

function editChargedWeight(obj) {
	
	let actualWeight  		= parseFloat($('#actualWeight').val());
	let chargedWeight 		= parseFloat($('#chargedWeight').val());
	
	if(configuration.allowMinimumChargedWeightOnWeight == 'true' && Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT)
		minWeight 	= Number(configuration.MinChargedWeight);
	else
		minWeight	= partyMinimumWeight();
	
	if(actualWeight <= minWeight) {	
		if(chargedWeight < minWeight) {
			showMessage('info', chargedWeightLessThanInfoMsg(minWeight));
			calculateChargedWeight(obj);
			return false;
		}
	} else if(!chgwgtActWgtConditionForLess && (chargedWeight < actualWeight)) {
		showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
		calculateChargedWeight(obj);
		return false;
	}
	
	if(configuration.setDefaultChargeWeight == 'true'
		&& !chgwgtActWgtConditionForLess && Number($('#chargedWeight').val()) < configuration.defaultChargeWeightValue) {
		if(actualWeight > 0) {
			showMessage('info', chargedWeightLessThanInfoMsg(configuration.defaultChargeWeightValue));
			$('#chargedWeight').val(configuration.defaultChargeWeightValue)
			setTimeout(function(){ $('#chargedWeight').focus(); }, 0);
			return false;
		}
	}
	
	if(configuration.isAllowPackingTypeWiseEditChargeWeight == 'true' && chargedWeight < chrWeightAmt && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT){
		showMessage('info', chargedWeightLessThanInfoMsg(chrWeightAmt));
		$('#chargedWeight').val(chrWeightAmt);
		return false;
	}
	
	if(configuration.allowMinimumChargedWeightOnWeight == 'true' && Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT && actualWeight > 0 && chargeWeight < minChrdWght) {
		$('#chargedWeight').val(minChrdWght);
		showMessage('info', chargedWeightLessThanInfoMsg(minChrdWght));
		return false;
	}
} 

function editWeightRate() { 
	//weightFromDb is globally defined
	if(configuration.AllowLessWeightRateApplyFromRateMater == 'true')
		return;

	let weightRate		= 0.0;

	if(getValueFromInputField('weigthFreightRate') != null)
		weightRate		= parseFloat(getValueFromInputField('weigthFreightRate'));

	if(weightRate < weightFromDb) {
		setValueToTextField('weigthFreightRate', weightFromDb);
		showMessage('info', weightRateLessThanInfoMsg(weightFromDb));
		return false;
	}
}

function editQuantityAmount() {
	//qtyAmt is globally defined
	if(configuration.AllowLessQuantityAmtApplyFromRateMaster == 'true')
		return;
		
	let quantityAmount	= 0;

	if(getValueFromInputField('qtyAmount') != null)
		quantityAmount	= getValueFromInputField('qtyAmount')

	if(quantityAmount < qtyAmt) {
		setValueToTextField('qtyAmount', qtyAmt);
		showMessage('info', qtyAmountLessThanInfoMsg(qtyAmt));
		return false;
	}
}

function calculateChargedWeight(obj) {
	let bookingType 	= $('#bookingType').val();
	let actualWeight	= $('#actualWeight').val();
	let isWeightAllow	= true;
	let capacity		= 0;
	let corporateAccountId = 0;

	minWeight			= partyMinimumWeight();
	
	if(configuration.IsDisplayAlertToSelectLCV == 'true'
		&& Number(actualWeight) >= configuration.MaxWeightToShowAlertForLCV && getBookingType() == configuration.OnBookingTypeToShowAlertForLCV)
			alert('Please Select LCV');
	
	corporateAccountId	= $('#partyMasterId').val();
	
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID)
		corporateAccountId	= $('#partyMasterId').val();
	else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY)
		corporateAccountId	= $('#consigneePartyMasterId').val();
	else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT)
		corporateAccountId	= $('#billingPartyId').val();

	if(isWeightAllow) {		
		if(actualWeight == 0)
			$('#chargedWeight').val(0);
		else if(actualWeight >= 1 && actualWeight <= parseInt(minWeight))
			$('#chargedWeight').val(parseInt(minWeight));
		else if( (obj.id == 'actualWeight') && ( parseInt(actualWeight) > parseInt(configuration.actualWeightValue)) && (configuration.checkActualWeight == 'true') ){
			if(bookingType == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
				confirm("You are booking LR with more than " + parseInt(configuration.actualWeightValue) + " kg.\n\nAre you sure you want to book in 'SUNDRY' ?");
				$('#chargedWeight').val(actualWeight);
			}
		} else if(configuration.roundOffChargeWeight  == 'true') {
			/*
			 * Here we are calculating round off value of charge Weight on Particular party
			 */
			if(configuration.partyWiseChargeWeightRoundOff == 'true') {
				if(chargedWeightRoundOffValue > 0)
					$('#chargedWeight').val(Math.ceil(actualWeight / chargedWeightRoundOffValue) * chargedWeightRoundOffValue);
				else if(corporateAccountId > 0)
					$('#chargedWeight').val(actualWeight);
				else
					$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
			} else
				$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
		} else
			$('#chargedWeight').val(actualWeight);

		$('#previousActualWeight').val(actualWeight);
	} else {
		$('#actualWeight').val($('#previousActualWeight').val());
		alert('Capacity of Selected Vehicle is ' + capacity + ' so you can not enter Actual Weight more than that');
	}

	if(configuration.AllowMinActualWeight == 'true') {
		let minActWght = configuration.MinActualWeight;

		if(Number(actualWeight) > Number(minActWght)) {
			$('#actualWeight').val(actualWeight);
			$('#chargedWeight').val(actualWeight);
		} else {
			$('#actualWeight').val(minActWght);
			$('#chargedWeight').val(minActWght);
		}
	}

	if(configuration.AllowMinChargedWeight == 'true')
		setMinimumChargeWeight(actualWeight);

	if(configuration.roundOffIncreasedChargedWeightValue == 'true') {
		let number 		= configuration.numberToRoundOffChargedWeight;
		let branches	= (configuration.roundOffChargedWeightByTensForBranchs).split(",");
		
		if(configuration.roundOffChargedWeightByTens == 'true') {
			for(const element of branches) {
				if(element == branchId)  //branchId is gloabally defined, it is Executive branch Id
					$('#chargedWeight').val(Math.round($('#chargedWeight').val() / 10) * 10);
				else
					$('#chargedWeight').val(Math.ceil($('#chargedWeight').val() / number) * number);
			}
		}
	}
	
	setMinimumWeight();
}

function setMinimumChargeWeight(actualWeight) {
	if(!validateActualAndChargeWeightForPackingType())
		return 0;
	
	let minChrdWght = configuration.MinChargedWeight;
	

	if(Number(actualWeight) == 0)
		$('#actualWeight').val(actualWeight);
	else if(Number(actualWeight) < Number(minChrdWght))
		$('#chargedWeight').val(minChrdWght);
	
	return minChrdWght;
}

function setMinimumWeight(){
	if (configuration.allowMinimumChargedWeightOnWeight == 'true' && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		 $('#chargedWeight').prop('disabled', false).prop('readonly', false);
	
	if(configuration.setDefaultChargeWeight == 'true') {
		let actualWeight	= Number($('#actualWeight').val());
	
		if(actualWeight > 0)
			$('#chargedWeight').val(configuration.defaultChargeWeightValue);
	}
}

function checkPackingTypeAllowedOnWeight() {
	return true;
}

function checkCommission() {
	let agentcommission	= $('#agentcommission').val();
	
	if(agentcommission != null && agentcommission > agentCommissionValueAllowed){
		$('#agentcommission').val(0);
		showMessage('info', commissionError(agentCommissionValueAllowed));
		setTimeout(function(){$('#agentcommission').focus(); }, 10);
		return false;
	}
	
	return true;
}

function calculateWeigthRate() {
	let weigthFreightRate 	= $('#weigthFreightRate').val();
	let chargedWeight 		= parseFloat($('#chargedWeight').val());

	if(chargedWeight != 0 && weigthFreightRate != 0) {
		let previousWghtAmt = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);
		
		if(!lrWiseDecimalAmountAllow($('#wayBillType').val()))
			previousWghtAmt = Math.round(previousWghtAmt);
		else
			previousWghtAmt	= previousWghtAmt.toFixed(2);

		$('#weightAmount').val(previousWghtAmt);
	}
	
	if(weigthFreightRate <= 0)
		$('#weigthFreightRate').prop("readonly", true);
	else
		$('#weigthFreightRate').prop("readonly", false);
		
	getInclusiveAmount();
 }

function getChargesRates() {
	let	corporateAccountId	= 0;
	let configObject		= null;
	let configData			= new Object();
	
	if(configuration.ChargeTypeFlavour == '1') {
		corporateAccountId	= $('#billingPartyId').val();
		
		if(corporateAccountId == 0)
			corporateAccountId	= $('#partyMasterId').val();
	} else if (Number($('#billingPartyId').val()) > 0)
		corporateAccountId	= $('#billingPartyId').val();
	else if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
		if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID)
			corporateAccountId	= $('#partyMasterId').val();	
		else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY) {
			if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay)
				corporateAccountId	= $('#partyMasterId').val();
			else
				corporateAccountId	= $('#consigneePartyMasterId').val();
		}
	} else
		corporateAccountId	= $('#partyMasterId').val();

	let	branchId		= getSourceBranchForRate();
	let destBranchId	= $('#destinationBranchId').val();
	
	configObject = filterLRLevelRates(3, branchId, destBranchId, corporateAccountId, 0, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'false') {
		configObject = filterLRLevelRates(3, branchId, destBranchId, 0, 0, 0, 0);
		checkAndInsertRates(configObject, configData, 0, 3);
	}
	
	return configData;
}

//get rates from ratemaster and charge configuration table
function checkAjaxRates() {
	if ($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC)
		return true;

	let destBranchId		= $('#destinationBranchId').val();
	let corporateAccountId	= getLRTypeWisePartyId();

	if (wayBillRates == null && (chargesRates == null || jQuery.isEmptyObject(chargesRates)))
		getRates(destBranchId, corporateAccountId, 1);
}

//get rates from ratemaster
function getRates(destBranchId, corporateAccountId, partyTypeId) {
	if(configuration.applyRateAuto == 'false' || $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC)
		return;

	// they are initilise here to reset the data of quantity type and weight type when new rates Ajax will apply
	weightTypeArr		= new Array();
	quantityTypeArr		= new Array();
	
	let jsonObject	= setDataToGetRate(destBranchId, corporateAccountId, partyTypeId);

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("RouteWiseRate.do?pageId=9&eventId=15",
			{json:jsonStr,filter:4}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
						packingTypeList			= null;
						consignmentGoodsListHM	= null;
					}
					
					$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
				} else {
					wayBillRates				= data.wayBillRates;
					packingTypeList				= data.packingTypeList;
					consignmentGoodsListHM		= data.consignmentGoodsListHM;
					chargeTypeIdsFromRateMaster	= data.chargeTypeIdsFromRateMaster;
					isPartyChargeInclusive		= data.isChargeInclusive;
					chargesConfigRates			= data.chargesConfigRates;
					freightRatePartyId			= data.corporateAccountId;
					chargesRates				= null;
					stateWiseRateMap			= data.stateWiseRateMap;
					
					if(configuration.applyPartyCommissionFromPartyMaster == 'true' && freightRatePartyId > 0)
                        partyIdForCommission    = freightRatePartyId;

					getWeightTypeRates();
					getPackingTypeRates();
					applyRates();
					loadRatesDef.resolve();
				}
			});
}

function applyRateForPartyType(){
}

function openRateSelectionPopUp() {
}

//filter rate as par user selection get revert filterd data 
function filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	let accountGroupId	= executive.accountGroupId;
	let arr 			= new Array();
	let packingGrpId	= 0;
	let wayBillTypeId	= 0;
	let newDestBranchId	= destBranchId;

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (const element of wayBillRates) {
			let datarates = element;
			
			if(Number(datarates.packingGroupTypeId) == 0)
				packingGrpId		= 0;
			else
				packingGrpId = packingGrpTypeId;
			
			if(Number(datarates.destinationBranchId) == 0)
				destBranchId	= 0;
			else
				destBranchId	= newDestBranchId;

			if(chargeSectionId == RateMaster.CHARGE_SECTION_FIXED_PARTY_RATE_ID && datarates.chargeSectionId == chargeSectionId)//fix party rate
				chargeTypeId		= datarates.chargeTypeId;

			/*
			 * In case of Party to Party rate make this true
			 */
			if(Number(datarates.wayBillTypeId) == 0)
				wayBillTypeId		= 0;
			else
				wayBillTypeId		= $('#wayBillType').val();
			
			let transportationModeId	= TRANSPORTATION_MODE_ROAD_ID;
			
			if(chargeSectionId == RateMaster.CHARGE_SECTION_FIXED_RATE_ID) { //fixed rate
				if(datarates.chargedFixed && datarates.chargeSectionId == chargeSectionId) {
					if(Number(datarates.accountGroupId) 				== Number(accountGroupId)
							&& Number(datarates.branchId) 				== Number(srcBranchId)
							&& Number(datarates.destinationBranchId) 	== Number(destBranchId)
							&& Number(datarates.corporateAccountId) 	== Number(corporateAccountId)) {
						arr.push(element);
					}
				}
			} else if(Number(datarates.accountGroupId) 		== Number(accountGroupId)
				&& Number(datarates.branchId) 				== Number(srcBranchId)
				&& Number(datarates.destinationBranchId) 	== Number(destBranchId)
				&& Number(datarates.vehicleTypeId) 			== Number(vehicleTypeId)
				&& Number(datarates.packingTypeId) 			== Number(packingTypeId)
				&& Number(datarates.packingGroupTypeId) 	== Number(packingGrpId)
				&& Number(datarates.categoryTypeId) 		== Number(categoryTypeId)
				&& Number(datarates.corporateAccountId) 	== Number(corporateAccountId)
				&& Number(datarates.chargeTypeId) 			== Number(chargeTypeId)
				&& Number(datarates.wayBillTypeId) 			== Number(wayBillTypeId)
				&& Number(datarates.chargeSectionId) 		!= 5
				&& Number(datarates.consignmentGoodsId) 	== Number(consignmentGoodsId)
				&& Number(datarates.consigneePartyId) 		== Number(consigneeId)
				&& Number(datarates.transportationModeId) 	== Number(transportationModeId)
			) {
				arr.push(element);
			}
		}
	}
	
	return arr;
}

//filter rate as par user selection get revert filterd data 
function filterLRLevelRates(filter, srcBranchId, destBranchId, corporateAccountId, applicableOnCatetgoryId, fieldId, declaredValue) {
	let accountGroupId	= executive.accountGroupId;
	let arr 			= new Array();

	switch (filter) {
	case 3 :
		if(!jQuery.isEmptyObject(chargesConfigRates) && chargesConfigRates.length > 0) {
			for (const element of chargesConfigRates) {
				if(Number(element.accountGroupId) 				== Number(accountGroupId)
						&& Number(element.branchId) 			== Number(srcBranchId)
						&& Number(element.corporateAccountId) 	== Number(corporateAccountId)
						&& Number(element.chargeTypeMasterId) 	!= BookingChargeConstant.VALUATION
				)
					arr.push(element);
			}
		}

		break;
	case 4 :
		if(!jQuery.isEmptyObject(chargesConfigRates)) {
			for (const element of chargesConfigRates) {
				if(Number(element.accountGroupId) 					== Number(accountGroupId)
						&& Number(element.branchId) 				== Number(srcBranchId)
						&& Number(element.corporateAccountId) 		== Number(corporateAccountId)
						&& Number(element.applicableOnCatetgoryId) 	== Number(applicableOnCatetgoryId)
						&& Number(element.fieldId) 					== Number(fieldId)
						&& Number(element.destinationBranchId)		== Number(destBranchId)
						&& Number(declaredValue) > 0
				)
					arr.push(element);
			}
		}

		break;
	default:
		alert("Wrong Choice");
	break;
	}

	return arr;
}

//check if rates is availabe and insert in array 
function checkAndInsertRates(rateMaster ,rateId_mast, userInput, filter) {
	switch (filter) {
	case 1:
		if(rateMaster != null && rateMaster.length > 0) {
			for (const element of rateMaster) {
				if(rateId_mast[element.chargeTypeMasterId] == null || (typeof rateId_mast[element.chargeTypeMasterId] == 'undefined') || rateId_mast[element.chargeTypeMasterId] == 0) {
					if(element.minWeight > 0 && element.maxWeight > 0) {
						if(parseFloat(userInput) >= element.minWeight && parseFloat(userInput) <= element.maxWeight)
							rateId_mast[element.chargeTypeMasterId] = element.rate;
						else
							rateId_mast[element.chargeTypeMasterId] = 0;
					} else
						rateId_mast[element.chargeTypeMasterId] = element.rate;
				}
			}
		}
		break;

	case 2:
		if(rateMaster != null && rateMaster.length > 0) {
			for (const element of rateMaster) {
				if(rateId_mast[element.chargeTypeMasterId] == null && element.rate > 0)
					rateId_mast[element.chargeTypeMasterId] = element.rate;
			}
		}
		break;

	case 3:
		if(rateMaster != null && rateMaster.length > 0) {
			for (const element of rateMaster) {
				if(rateId_mast[element.chargeTypeMasterId] == null || (typeof rateId_mast[element.chargeTypeMasterId] == 'undefined'))
					rateId_mast[element.chargeTypeMasterId] = element;
			}
		}
		break;

	default:
		alert("Wrong Choice");
	break;
	}
}

//applied various condition for weight type rates form rate master
function getWghtTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, packingTypeId, packingGrpTypeId, userWeightInput, rateTypeId, consignmentGoodsId, consigneeId) {
	let chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_WEIGHT;
	
	let rateId_mast			= new Object();
	let rateMaster			= null;
	let chargeSectionId		= 0;

	//Route level charges
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Loading type charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Loading type charges
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//if Party rates not defined then apply general rates
	if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID ) {

		//Route level charges
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);

		//Loading type charges
		rateMaster = filterRates(srcBranchId, 0, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
		//Loading type charges
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	}
	

	return rateId_mast;
}

//applied various condition for packing type rates form rate master
function getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, packingTypeId, packingGrpTypeId, userArticleInput, rateTypeId, consignmentGoodsId, consigneeId) {

	let chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_QUANTITY;
	let rateId_mast			= new Object();
	let rateMaster			= null;
	let chargeSectionId		= 0;
	//Specific Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//if Party rates not defined then apply general rates
	if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID) {
		//Specific Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Specific Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	}

	return rateId_mast;
}

function getWeightTypeRates() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return false;
		
	let chargeType		= getValueFromInputField('chargeType');
		
	if(chargeType != ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		return;
	
	let chargedWeight		= $('#chargedWeight').val();
	
	let typeofPacking		= 0;
	let consignmentGoodsId	= 0;

	if($('#typeofPackingId1').html() > 0)
		typeofPacking 		= $('#typeofPackingId1').html();
	else
		typeofPacking 		= $('#typeofPackingId').val();
	
	if($('#consignmentGoodsId1').html() > 0)
		consignmentGoodsId	= $('#consignmentGoodsId1').html();
		
		
	
	let weightAmnt			= calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId);
	$('#qtyAmount').val(weightAmnt);
}

function calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId) {
	if(configuration.applyRateAuto == 'false')
		return 0;

	let srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	let vehicleTypeValue	= $('#vehicleType').val();
	let vehicleTypeId		= 0;
	let packingGrpTypeId	= 0;
	let val					= new Array();

	if ($('#vehicleType').exists()) {
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
	}

	if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID)
		vehicleTypeId			= 1; 	
	
	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else if($("#rateType").val() != null && $("#rateType").val() != '') {
		setRateType();
			
		if($("#rateType").val() == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
			if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3'){
				if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay) {
					corporateAccountId	= $('#partyMasterId').val();
					rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
				} else {
					corporateAccountId	= $('#consigneePartyMasterId').val();
					rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
				}
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
			} else {
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else {
			corporateAccountId	= partyMasterId;
			categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
			rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		}
	} else if(partyMasterId > 0) {
		corporateAccountId	= partyMasterId;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else
		categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
	
	if(freightRatePartyId > 0)
		corporateAccountId	= freightRatePartyId;

	for(const element of PackingGroupMappingArr)
		if(element.packingTypeMasterId == typeofPacking) {
			packingGrpTypeId	= element.packingGroupTypeId;
	}
	
	if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		weightFromDb = 0;
		weightFromDbOnFrt	= 0;
		let response =  getWghtTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, chargedWeight, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response && !jQuery.isEmptyObject(response)) {
			weightFromDb		= 0;
			weightFromDbOnFrt	= 0;
			weightFromDb 		= getFreightChargeForRates(response);
			purefrieghtAmount	= getFreightChargeForRates(response);
			let actualWeight	= Number($('#actualWeight').val());
			
			$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
			$('#weightAmount').val(0);
			$('#fixAmount').val(0);
			$('#crossingCartageRate').html('CC rate (0)');

			if(weightFromDb > 0) {
				let weightAmount	= 0;
				
				if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
					weightAmount	= parseFloat(weightFromDb * actualWeight);
				else
					weightAmount	= parseFloat(weightFromDb * chargedWeight);
				
				$('#weightAmount').val(weightAmount.toFixed(2));
				$('#weigthFreightRate').val(weightFromDb);
				$('#weigthFreightRate').prop("readonly", false);
				
				let crossingCartage = 0;

				if(response[DELIVERY_CARTAGE] != null && response[DELIVERY_CARTAGE] != undefined)
					crossingCartage	= Number(response[DELIVERY_CARTAGE]);
				
				$('#crossingCartageRate').html('CC rate (' + crossingCartage + ')');
			}
			
			$('#pureFrieghtAmt').html(purefrieghtAmount);
			
			let tempString;
		
			if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
				tempString		= getTempStringForRates(response, actualWeight);
			else
				tempString		= getTempStringForRates(response, chargedWeight);

			weightTypeArr = new Array();
			weightTypeArr.push(tempString);
		} else {
			weightTypeArr = new Array();
			$('#charge'+BookingChargeConstant.LR_CHARGE).val(0);
			calculateWeigthRate();
			checkIfnotPresent();
			resetSpecificCharges();
		}
		applyRates();
	} 
}

function getPackingTypeRates() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return;
	
	let chargeType		= getValueFromInputField('chargeType');
		
	if(chargeType != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY || $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC)
		return;
		
	let quantity		= $('#quantity').val();
	let typeofPacking 	= getPackingTypeId();
	
	let consignmentGoodsId	= 0;
	
	if(configuration.rateApplicableOnSaidToContain == 'true')
		consignmentGoodsId	= $('#consignmentGoodsId').val();
		
	qtyAmt				= calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);
	
	if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt <= 0 && $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
		enableDisableInputField('qtyAmount', 'false');
		
	
//	If Amount is not found from Rate Master Then applying Static Rates After checking the Following Conditions
	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && $('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC && configuration.packingTypeWiseApplyRateForCharges == 'true') {
		let packingTypeIds	= (configuration.packingTypeIdAndChargeIdWithAmount).split(",");
		let packingTypeIdsForOuterState = (configuration.packingTypeIdForOuterState).split(",");
		qtyAmt	= 0;
		
		for(const element of packingTypeIds) {
			let charges	= (element).split('_');
			let pkgTypeIds	= charges[0];
			
			if (isValueExistInArray(packingTypeIdsForOuterState, pkgTypeIds) && (sourceBranchStateId != destinationBranchStateId)) {
				if(Number(charges[0]) == Number(typeofPacking) && Number(charges[1]) == BookingChargeConstant.FREIGHT)
					qtyAmt	= Number(charges[3]);
			}else{
				if(Number(charges[0]) == Number(typeofPacking) && Number(charges[1]) == BookingChargeConstant.FREIGHT)
					qtyAmt	= Number(charges[2]);
			}
		} 
		
	 if(configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true) {
		if(qtyAmt <= 0)
			enableDisableInputField('qtyAmount', 'true');
		else
			enableDisableInputField('qtyAmount', 'false');
	 }
		
	} else if(configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true) {
		if(qtyAmt <= 0)
			enableDisableInputField('qtyAmount', 'true');
		else
			enableDisableInputField('qtyAmount', 'false');
	}
	
	$('#qtyAmount').val(qtyAmt);
}

function getFreightChargeForRates(response) {
	let amnt = 0;

	if(response[BookingChargeConstant.FREIGHT] != null) {
		amnt				= Number(response[BookingChargeConstant.FREIGHT]);
		weightFromDbOnFrt	= Number(response[BookingChargeConstant.FREIGHT]);
	}
		
	if(configuration.mergeCrossingCartageAndFreightRateInWeightRate == 'true' && response[BookingChargeConstant.DELIVERY_CARTAGE] != null && !isPartyChargeInclusive)
		amnt = amnt +  Number(response[BookingChargeConstant.DELIVERY_CARTAGE]);
	
	$('#weightAmount').removeAttr("readonly");
	return amnt;
} 

function getTempStringForRates(response, quantity) {
	let tempString = "";
	let chargeMasterId	= 0;
	let qtyAmt			= 0;
	let chargeType		= $('#chargeType').val();
	let totalQty		= $('#totalQty').html();
	let actualWeight	= $('#actualWeight').val();
	let chargesAmtHm	= {};

	for (let key in response) {
		chargeMasterId	= Number(key);
		
		if(configuration.ApplyArticleWiseRateOnWeightType == 'true' && (getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID || getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID)
				&& jQuery.inArray(chargeMasterId + "", chargesToApplyArticleWiseRateOnWeightType) != -1) { //chargesToApplyArticleWiseRateOnWeightType coming from property
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
				qtyAmt	= Number(response[key]) * Number(quantity);
			else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
				if(actualWeight > 0)
					qtyAmt	= Number(response[key]) * Number(totalQty);
				else
					qtyAmt	= Number(response[key]) * Number(quantity);
			} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(response[key]) * Number(totalQty) * distance;
			else
				qtyAmt	= Number(response[key]);
			
		} else if((getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID || getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) && jQuery.inArray(chargeMasterId + "", aplyRateForCharges) != -1 ) { //aplyRateForCharges coming from Property
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(response[key]) * Number(quantity) * distance;
			else
				qtyAmt	= Number(response[key]) * Number(quantity);
		} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
			qtyAmt	= Number(response[key]) * distance;
		else
			qtyAmt	= Number(response[key]);
			
		chargesAmtHm[chargeMasterId] = qtyAmt;
		
		if(chargeType != ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
			tempString += chargeMasterId + '=' + qtyAmt + ',';
	}
	
	if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		tempString	= getTempStringInWeight(chargesAmtHm);
	
	return tempString;
}

function getTempStringInWeight(chargesAmtHm) {
	let freightAmount	= 0;
	let tempString = "";
	
	for (let [key, value] of Object.entries(chargesAmtHm)) {
		if(key == FREIGHT || key == DELIVERY_CARTAGE)
			freightAmount	+= Number(value);
	}
	
	chargesAmtHm[FREIGHT] 			= freightAmount;
	chargesAmtHm[DELIVERY_CARTAGE] 	= 0;
	
	for (let [key, value] of Object.entries(chargesAmtHm)) {
		tempString += key + '=' + value + ',';
	}
	
	return tempString;
}

function calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId){
	if(configuration.applyRateAuto == 'false')
		return;

	let srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	let vehicleTypeValue	= $('#vehicleType').val();

	let vehicleTypeId		= 0;
	let packingGrpTypeId	= 0;
	let val					= new Array();
	
	if ($('#vehicleType').exists()) {
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
	}
	
	if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID)
		vehicleTypeId			= 1; 	
	
	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else if($("#rateType").val() != null && $("#rateType").val() != '') {
		setRateType();
		
		if($("#rateType").val() == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
			if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
				if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay)
					corporateAccountId	= $('#partyMasterId').val();
				else
					corporateAccountId	= $('#consigneePartyMasterId').val();
				
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
			} else {
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else {
			corporateAccountId	= partyMasterId;
			categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
			rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		}
	} else if(partyMasterId > 0) {
		corporateAccountId	= partyMasterId;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else
		categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
	
	if(freightRatePartyId > 0)
		corporateAccountId	= freightRatePartyId;
		
	let qtyAmt = 0;
	
	for(const element of PackingGroupMappingArr) {
		if(element.packingTypeMasterId == typeofPacking)
			packingGrpTypeId	= element.packingGroupTypeId;
	}
	
	if(typeofPacking > 0 && $('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		let response = getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, quantity, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response && !jQuery.isEmptyObject(response)) {
			qtyAmt 				= getFreightChargeForRates(response);
			let tempString		= getTempStringForRates(response, quantity);
			
			$('#searchRate').val(tempString);
			
			if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt > 0)
				enableDisableInputField('qtyAmount', 'true');
				
			purefrieghtAmount	= getFreightChargeForRates(response);
			setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);
		}
	} 

	return qtyAmt;
}

function partyMinimumRates() {}

function partyMinimumWeight() {
	return 0;
}

function partyMinimumSlab() {}

function calculateLBHOnChargeType(obj) {}
function calculateCUBICOnChargeType(obj) {}

function calcDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		let discountAmount	= 0;
		
		if(Number($("#discountPercentage").val()) <= Number(configuration.maximumDiscountValue)) {
			discountAmount = (parseFloat($("#discountPercentage").val()) * parseFloat($("#charge"+BookingChargeConstant.FREIGHT).val())) / 100;
			$('#discount').val(discountAmount);
		} else {
			showMessage('error','Discount not allowed more than '+configuration.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
}

function checkAndUpdateDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		let discountPercentage = (parseFloat($("#discount").val()) / parseFloat($("#charge"+BookingChargeConstant.FREIGHT).val())) * 100;

		if(Number(discountPercentage) <= Number(configuration.maximumDiscountValue)) {
			$("#discountPercentage").val(discountPercentage);
		} else {
			showMessage('error','Discount not allowed more than '+configuration.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
}
function setDefaultDiscountType(){
	$('#discountPanel').show();
	$('#isDiscountPercentDiv').hide();
	$('#discount').show();
	$('#discount').attr('readOnly',true);
	setTimeout(function() {
		$('#discountTypes').prop('disabled',true);
	}, 10)
	$('#discountTypes').val(BookingChargeConstant.FREIGHT);
}

function calcGrandtotal() {
	let amount				= getAmountToCalculateEncludedTax();
	let serviceTaxExclude 	= getServiceTaxExcludeCharges();
	discAmount 				= getDiscountedAmount(amount, serviceTaxExclude);
	
	let grandtotal 		= parseFloat(discAmount) + parseFloat(serviceTaxExclude);

	// Tax Calculation
	serviceTaxAmount = 0;

	grandtotal		= getGrandTotalWithTax(grandtotal, discAmount);

	if(amount != 0)
		grandtotal = removeCommissionFromGrandTotal(grandtotal);
	else
		grandtotal = 0;
	
	if (lrWiseDecimalAmountAllow($('#wayBillType').val()))
		$("#grandTotal").val((grandtotal).toFixed(2));
	else			
		$("#grandTotal").val(Math.round(grandtotal));
	
	roundOfGrandTotalToNextZero();
	setChequeAmount();
}

function setStPaidByBoolean() {
	setDefaultStPaidBy = true;
}

function calcTotal() {
	$("#totalAmt").val(getTotalAmt());
	
	remarkApend();
	calcGrandtotal();
	calTDSAmount(this.id);
}

function validateCCAttachedAmount(chargeMasterId){
	
	let chargeValueForCCAttached	= Number(configuration.chargeValueForCCAttached);
	let wayBillTypeId 				= $('#wayBillType').val();
	
	if(chargeIdsForCCAttachedArr != null && wayBillTypeId != WayBillType.WAYBILL_TYPE_FOC){
		if(chargeIdsForCCAttachedArr.includes(Number(chargeMasterId))){
			let chargeVal 	= Number($('#charge'+chargeMasterId).val());
			
			if($('#ccAttached').prop('checked')){
				if(chargeVal < chargeValueForCCAttached){
					showMessage('info', 'You can not enter less then '+chargeValueForCCAttached+' /-');
					$('#charge'+chargeMasterId).val(chargeValueForCCAttached);
					return false;
				}
			}
		}
	}
	return true;
}

function checkChargesRates(obj) {
	let chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	
	let actualInput		= Number($('#actualInput' + chargeMasterId).val());
	
	let isReadOnly 		= document.getElementById('charge' + chargeMasterId).readOnly;
	
	if(isReadOnly)
		return;
	
	if(configuration.checkChargesAfterApplyRateInAuto == 'true') {
		actualInput		= Number($('#actualChargeAmount' + chargeMasterId).val());
		let chargeValue		= obj.value;
		
		if(chargeValue < actualInput && actualInput > 0) {
			showMessage('info', 'You can not enter less then this ' + actualInput + ' /-');
			setTimeout(function(){ $('#charge' + chargeMasterId).focus(); }, 0);
			$('#charge' + chargeMasterId).val(actualInput);
		}
	}
	
	getInclusiveAmount();
}

function calculateWeightAndQuantityWiseFreightAmount(chargeMasterId) {
	let qtyAmnt			= 0;
	let weightAmnt		= 0;

	if(quantityTypeArr != null)
		qtyAmnt			= getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr);
		
	if(weightTypeArr != null)
		weightAmnt		= getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr);

	if(lrWiseDecimalAmountAllow($('#wayBillType').val())) {
		qtyAmnt		= qtyAmnt.toFixed(2);
		weightAmnt	= weightAmnt.toFixed(2);
	} else {
		if(qtyAmnt % 1 != 0)
			qtyAmnt			= Math.round(qtyAmnt * 100) / 100;

		if(weightAmnt % 1 != 0)
			weightAmnt		= Math.round(weightAmnt * 100) / 100;
	}

	let chargeType	= $('#chargeType').val();

	if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		$('#charge' + chargeMasterId).val(Number(qtyAmnt));

		if(chargeMasterId == ChargeTypeMaster.FREIGHT)
			$('#freightChargeValue').val(Number(qtyAmnt));
	} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
		$('#charge' + chargeMasterId).val(Number(weightAmnt));

		if(chargeMasterId == ChargeTypeMaster.FREIGHT)
			$('#freightChargeValue').val(Number(weightAmnt));
	}
}

function calculateLRLevelCharges(chargesRates, chargeMasterId) {
	if(configuration.disableSpecificCharges == 'false') {
		$('#charge' + chargeMasterId).removeAttr('disabled');
		$('#charge' + chargeMasterId).removeAttr("readonly");
	}
	
	setNonEditableFreightCharge();

	if (chargesRates != null) {
		let chargeRate	= chargesRates[chargeMasterId];
		
		if (chargeRate) {
			if (!chargeRate.applicable)
				$('#charge' + chargeMasterId).prop("disabled", "true");
			else
				$('#charge' + chargeMasterId).removeAttr('disabled');
				
			if (!chargeRate.editable)
				$('#charge' + chargeMasterId).prop("readonly", "true");
			else
				$('#charge' + chargeMasterId).removeAttr("readonly");

			if ($('#charge' + chargeMasterId).val() < chargeRate.chargeMinAmount) {
				if (chargeRate.chargeMinAmount != 0) {
					if(chargeRate.ispercent) {
						if(!isPartyChargeInclusive)
							$('#charge' + chargeMasterId).val(getPercentageLRLevelCharges(chargeMasterId, chargeRate));
					} else
						$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeRate.chargeMinAmount, chargeRate.chargeUnit));
				} else
					$('#charge' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
			}

			$('#actualInput' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
		}
	}

	disableChargeWiseBookingCharges(chargeMasterId);
}

function applyRates() {
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC) {
		resetOnChargeTypeExcludingPackageDetails();
		return true;
	}
	
	let chargeTypeModel = jsondata.charges;
	
	if(isManualWayBill) {
		if(configuration.ApplyRateInManual == 'false') {
			if(chargeTypeModel) {
				for (const element of chargeTypeModel) {
					calculateWeightAndQuantityWiseFreightAmount(element.chargeTypeMasterId);
				}
			}

			calcTotal();

			return false;
		}
	}

	chargesRates		= getChargesRates();
	
	if(chargeTypeModel) {
		for (const element of chargeTypeModel) {
			let chargeMasterId	= element.chargeTypeMasterId;
			
			if(chargeMasterId == BookingChargeConstant.VALUATION)
				continue;

			/*
			 * Calculate Weight And Quantity Wise Freight Charge with Comparision
			 */
			calculateWeightAndQuantityWiseFreightAmount(chargeMasterId);
			/*
			 * Calculate LR Level Charges
			 */
			calculateLRLevelCharges(chargesRates, chargeMasterId);
			
			if(configuration.checkChargesAfterApplyRateInAuto == 'true' && !isManualWayBill) {
				let chargeIdsToAvoidCheckInAutoArr = configuration.chargeIdsToAvoidCheckInAuto.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInAutoArr.includes(Number(chargeMasterId)))
					setHiddenValuesForCharges(chargeMasterId);
			}

			if(configuration.checkChargesAfterApplyRateInManual == 'true' && isManualWayBill) {
				let chargeIdsToAvoidCheckInManual = configuration.chargeIdsToAvoidCheckInManual.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInManual.includes(Number(chargeMasterId)))
					setHiddenValuesForCharges(chargeMasterId);
			}
		}
	}
	
	setFixChargesOnBookingTypeFTL();//commonFunctionForCreateWayBill.js
	calculateValuationCharge();
	getInclusiveAmount();
}

function inclusiveCharge(amount) {
	if(isPartyChargeInclusive && amount > 0) {
		$('#charge' + BookingChargeConstant.FREIGHT).val(Number($('#charge' + BookingChargeConstant.FREIGHT).val()) - amount);
		setHiddenValuesForCharges(BookingChargeConstant.FREIGHT);
	}
}

/*
 * LR Level Charges
 */
function calculateCustomChargesAmount(chargeValue, chargeUnit) {
	let chargeAmount	= chargeValue;
	
	if(chargeUnit > 0) {
		if(chargeUnit == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
			if ($("#chargedWeight").val() > 0)
				chargeAmount = (chargeValue * $("#chargedWeight").val());
		} else if(chargeUnit == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			let totalQty	= 0;
			
			if(configuration.isPackingGroupTypeWiseChargeAllow == 'true')
				totalQty	= totalConsignmentQuantity;
			else
				totalQty	= getTotalAddedArticleTableQuantity();
			
			chargeAmount 	= (chargeValue * totalQty);
		}
	}

	return chargeAmount;
}

function getPercentageValue(chargesRates) {
	let chargeAmount	= 0;
	
	if(!jsondata.charges) return;
	
	let chargeTypeModel = jsondata.charges;
	
	for (const element of chargeTypeModel) {
		let chargeMasterId	= element.chargeTypeMasterId;
		
		if (chargesRates != null) {
			let chargeRate	= chargesRates[chargeMasterId];
			
			if(chargeRate && chargeRate.ispercent && isPartyChargeInclusive) {
				$('#charge' + chargeMasterId).val(getPercentageLRLevelCharges(chargeMasterId, chargeRate));
				setHiddenValuesForCharges(chargeMasterId);
				chargeAmount += Number($('#charge' + chargeMasterId).val());
			}
		}
	}
	
	return chargeAmount;
}

function getPercentageLRLevelCharges(chargeMasterId, chargeRate) {
	let chargeAmount	= 0;
	
	if(($('#charge' + chargeRate.chargeApplicableOn).val()) > 0)
		chargeAmount = calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, 1);	
	else if(chargeRate.fieldId > 0)
		chargeAmount = calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.fieldId, 2);
		
	return chargeAmount;
}

function getFlavourWiseRates(customerId, partyType) {
	if(configuration.applyRateAuto == 'false')
		return;
		
	resetArticleWithTable();
	
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY)
		partyType		= CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID;
		
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID)
		partyType		= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;
	
	switch(Number(configuration.ChargeTypeFlavour)) {
	case 1:
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		break;
	case 2:
		if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY && partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
			if(partyType != CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)
				getRates($('#destinationBranchId').val(), customerId, partyType);
		} else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID && partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		break;
	}
}

function setLrChargeForNwParty() {
	if(chargeTypeFlavour == '4')
		return;

	if(parseInt($('#partyMasterId').val()) == 0)
		getWeightTypeRates();
}

function reCalculateRates(destId, partyId ){
	if(chargeTypeFlavour == '2' || chargeTypeFlavour == '3') {
		loadRatesDef		= new $.Deferred();
		getRates(destId, partyId, 2);
		$.when(loadRatesDef).done(function () {
			applyReCalculatedRates();
		});
	}
}

function getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr) {
	let amount = 0;
	
	for(const element of quantityTypeArr) {
		let sliptedByUnderScore		= element.split("_");
		let sliptedByCommas			= sliptedByUnderScore[1].split(",");

		for(const element1 of sliptedByCommas) {
			if(element1.split("=")[0] == chargeMasterId) {
				amount = parseFloat(amount) + parseFloat(element1.split("=")[1]);
				break;
			}
		}
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
		let fixAmt = 0;

		if($('#fixAmount').exists() && $('#fixAmount').val() != '')
			fixAmt = Number($('#fixAmount').val());

		amount = fixAmt;
	}

	return amount;
}

function getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr){
	let amount = 0;

	for(const element of weightTypeArr) {
		let sliptedByCommas = element.split(",");
		
		for(const element1 of sliptedByCommas) {
			if(Number(element1.split("=")[0]) == chargeMasterId) {
				if(configuration.mergeCrossingCartageAndFreightRateInWeightRate == 'true'){
					if(Number(element1.split("=")[0]) != BookingChargeConstant.DELIVERY_CARTAGE)
						amount = parseFloat(amount) + parseFloat(element1.split("=")[1]);
				} else 
					amount = parseFloat(amount) + parseFloat(element1.split("=")[1]);
					
				break;
			}
		}
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
		let fixAmt = 0;

		if($('#fixAmount').exists() && $('#fixAmount').val() != '')
			fixAmt = Number($('#fixAmount').val());

		amount = fixAmt;
	}
	
	return amount;
}

function calculateChargeMinAmount(chargeMasterId, chargeMinAmount, chargeApplicableOnId, filter){
	let calculateChargeMinAmount = chargeMinAmount; 
	
	if(filter == 1) {
		let chargeApplicableOn 	= ($('#charge' + chargeApplicableOnId).val());
		
		if( chargeApplicableOn > 0)
			calculateChargeMinAmount = (calculateChargeMinAmount * chargeApplicableOn) / 100;
	} else if(filter == 2 && chargeApplicableOnId == ChargeConfiguration.FIELD_ID_DECLARED_VALUE){
		if ($("#declaredValue").val() > 0) {
			let declaredValue		= $('#declaredValue').val();
			let chargeEle			= document.getElementById('charge' + chargeMasterId);
				
			if(chargeEle && declaredValue > 0)
				calculateChargeMinAmount = ((calculateChargeMinAmount * declaredValue) / 100);
		} else
			calculateChargeMinAmount = 0;
	}
	
	return calculateChargeMinAmount;
} 

function setBookingChargeAmt(obj) {
	let chargeTypeMasterId = (obj.id).split("_");
	$('#charge'+chargeTypeMasterId[1]).val($("#"+obj.id).val());
}

/*
 * Apply AOC Charge on Total of every charge except AOC charge
 */
function applyAOCCharge() {
}

/*
 * Reset AOC charge if aoc value is less than 0
 */
function resetAOC() {
}

/*
 * Apply extra charge for FOV on Declared Value
 * 
 */

function applyExtraCharges() {}

/*
 * Change Freight amount if Freight amount not equals to Qty Amount
 * set Charge type to fix
 */
function changeFreightAmount() {}

/*
 * Get Rate for LMT ON weight
 * 
 * Added by 	- Anant Chaudhary	14-12-2016
 */
function ajaxCallForRates() {}

function resetAjaxCallForRates() {}

function changeAmountOnChargeType() {}

/*
 * Get rate from rate master according to party
 * 
 * Added by 	- Anant Chaudhary	14-12-2016
 */
function ajaxForWeightForCorp(chargedWeight) {}
function applyCorporateCharges(chargeId, chargeAmount, floatChargeAmount) {}

function getFixedTypeRates() {}
function ajaxForWeightType() {}

function validateArticleAmountWithWeight() {
	return true;
}

function getAgentCommission(sourceBranchId){}

function setHiddenValuesForCharges(chargeMasterId){
	$('#actualChargeAmount' + chargeMasterId).val($('#charge' + chargeMasterId).val());
}

function resetTBBPartyData() {}

function calculateChargedWeightFromSlabWeight() {
	let actualWeight	= $('#actualWeight').val();
	let totalQuantity	= getTotalAddedArticleTableQuantity();
	let isSlabExists	= false;
	let totalQty		= $('#totalQty').html();
	let chargeWgtAmt	= 0;
	
	if(configuration.allowMinChargedWeightOnQty == 'true' && totalQty > 10) {
		chargeWgtAmt	= setMinimumChargeWeight(actualWeight);
		isSlabExists    = true;

		if(Number(actualWeight) > Number(chargeWgtAmt))
			chargeWgtAmt = actualWeight;
	} else if(!jQuery.isEmptyObject(slabWeightList) && $("#bookingType").val() != BOOKING_TYPE_FTL_ID) {
		$('#chargedWeight').val(0);
		
		for(const element of slabWeightList) {
			if(parseFloat(totalQuantity) >= element.minArticle && parseFloat(totalQuantity) <= element.maxArticle) {
				let calculatedChargeWight = totalQuantity * element.slabWeight;
				isSlabExists  = true;
				
				if(actualWeight > calculatedChargeWight)
					chargeWgtAmt	= actualWeight;
				else
					chargeWgtAmt	= calculatedChargeWight;
				
				break;
			}
		}
	}

	$('#chargedWeight').val(chargeWgtAmt);
	
	chrWeightAmt	= chargeWgtAmt;
		
	var packingTypeIds				 = (configuration.packingTypeIdWiseEditChargeWeight).split(",");
		
	if(configuration.isAllowPackingTypeWiseEditChargeWeight == 'true' && consigAddedtableRowsId.length > 0 && Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT) {
		for(const element of consigAddedtableRowsId) {
			if($('#typeofPackingId' + element).html() > 0){
				packingTypeId 	= parseInt($('#typeofPackingId' + element).html());
					
				if(isValueExistInArray(packingTypeIds, packingTypeId)) {
					enableDisableInputField('chargedWeight', 'false');
					break;
				} else
					enableDisableInputField('chargedWeight', 'true');
			}
		}
	}
		
	if(!isSlabExists && $("#bookingType").val() != BOOKING_TYPE_FTL_ID)
		$('#chargedWeight').val(actualWeight);
		
	validateActualAndChargeWeightForPackingType();
}

function calculateValuationCharge() {
	if ($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC || isFixedValuationAmount && !$('#declaredValueCheckBox').prop("checked")) {
		if(isFixedValuationAmount)
			$('#charge' + BookingChargeConstant.VALUATION).val($('#actualChargeAmount' + BookingChargeConstant.VALUATION).val());
		return;
	}
		
	let totalQtiy				= getTotalAddedArticleTableQuantity();
	let decValAmt				= 0;
	let totalAmt				= 0;
	let applOnQuantity			= 0;
	let applOnQuantityAmt		= 0;
	let remainingQuantity		= 0;
	let remainingQuantityAmt	= 0;
	let declaredValue			= $('#declaredValue').val();
	let replaceValuationChrgWithDocumentChrg	= configuration.replaceValuationChrgWithDocumentChrg;
	var branchWiseDocumentChargesApplyOnStateWiseRateOnly	= configuration.branchWiseDocumentChargesApplyOnStateWiseRateOnly;
	let branchAllowed	= false;
	
	if(branchWiseDocumentChargesApplyOnStateWiseRateOnly == true || branchWiseDocumentChargesApplyOnStateWiseRateOnly == 'true') {
		let branchArray = (configuration.branchIdsToDocumentChargesApplyOnStateWiseRateOnly).split(",");
		branchAllowed 	= isValueExistInArray(branchArray, executive.branchId);
	}
	
	if(replaceValuationChrgWithDocumentChrg == 'true' && Number($('#bookingType').val()) != BOOKING_TYPE_FTL_ID)
		$('#charge' + BookingChargeConstant.DOCUMENT).val(0);

	$('#charge' + BookingChargeConstant.VALUATION).val(0);
		
	if(!jQuery.isEmptyObject(valuationChargeList) && totalQtiy > 0) {
		for(const element of valuationChargeList) {
			if(declaredValue > 0 && element.fieldId == ChargeConfiguration.FIELD_ID_DECLARED_VALUE) {
				if(element.ispercent)
					decValAmt 		= ((element.chargeMinAmount * declaredValue) / 100);
				else
					decValAmt 		= (element.chargeMinAmount * declaredValue);
			} 
			
			if(element.applOnQuantityId == ChargeConfiguration.APPLICABLE_QUANTITY_ID) {
				applOnQuantity		= element.applOnQuantity;
				
				if(stateWiseRateMap != undefined && stateWiseRateMap[BookingChargeConstant.DOCUMENT] != undefined)
					applOnQuantityAmt 	= applOnQuantity * Number(stateWiseRateMap[BookingChargeConstant.DOCUMENT]);
				else
					applOnQuantityAmt	= applOnQuantity * element.quantityAmt;
			}
				
			if(element.applOnQuantityId == ChargeConfiguration.OTHER_QUANTITY_ID && !branchAllowed) {
				remainingQuantity	 = totalQtiy - applOnQuantity;
				remainingQuantityAmt = remainingQuantity * element.quantityAmt;
				
				if(stateWiseRateMap != undefined && stateWiseRateMap[BookingChargeConstant.DOCUMENT] != undefined)
					remainingQuantityAmt = remainingQuantity * element.quantityAmt;
			}
			
			if(stateWiseRateMap != undefined)
				totalAmt = applOnQuantityAmt + remainingQuantityAmt;
			else if(replaceValuationChrgWithDocumentChrg == 'true' && sourceBranchStateId != destinationBranchStateId)
				totalAmt = 2 * applOnQuantityAmt + remainingQuantityAmt;
			else
				totalAmt = applOnQuantityAmt + remainingQuantityAmt;
		}
		
		if(stateWiseRateMap != undefined || replaceValuationChrgWithDocumentChrg == 'true') {
			if($('#declaredValueCheckBox').prop("checked") )
				$('#charge' + BookingChargeConstant.VALUATION).val(Math.round(decValAmt));
				
			if(Number($('#bookingType').val()) != BOOKING_TYPE_FTL_ID)
				$('#charge' + BookingChargeConstant.DOCUMENT).val(Math.round(totalAmt));
		} else if(declaredValue > 2000 && $('#declaredValueCheckBox').prop("checked")) {
			if(decValAmt > totalAmt)
				$('#charge' + BookingChargeConstant.VALUATION).val(Math.round(decValAmt));
			else
				$('#charge' + BookingChargeConstant.VALUATION).val(Math.round(totalAmt));
		} else
			$('#charge' + BookingChargeConstant.VALUATION).val(Math.round(totalAmt));
	}
	
	//if(Number($('#actualChargeAmount' + BookingChargeConstant.VALUATION).val()) > Number($('#charge' + BookingChargeConstant.VALUATION).val()))
		//$('#charge' + BookingChargeConstant.VALUATION).val($('#actualChargeAmount' + BookingChargeConstant.VALUATION).val());
		
	packingTypeWiseApplyRateForCharges();
	
	if($('#declaredValueCheckBox').prop('checked') && $('#declaredValue').val() < 100) {
		$('#charge' + BookingChargeConstant.VALUATION).val(1)
		calcTotal();
	}
}

function packingTypeWiseApplyRateForCharges() {
	if(configuration.packingTypeWiseApplyRateForCharges == 'true') {
		let packingTypeIdAndChargeIdWithAmountArr	= (configuration.packingTypeIdAndChargeIdWithAmount).split(",");
		let charges	= jsondata.charges;
		let chargeMasterIdsArr = new Array();
		let chargeAddedFromProperty = false;
	
		for(const element of packingTypeIdAndChargeIdWithAmountArr) {
			let abc				= element.split("_");
			let packingTypeId	= abc[0];
			
			if((Number($('#typeofPacking').val()) == packingTypeId) || ((Number($('#typeofPackingId1').html())) == packingTypeId)) {
				if(Number(abc[1]) == BookingChargeConstant.FREIGHT) {
					if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT
						&& Number(abc[2]) > Number($('#charge' + BookingChargeConstant.FREIGHT).val())) {
						$('#charge' + abc[1]).val(abc[2]);
						setHiddenValuesForCharges(abc[1]);
					}
				} else {
					$('#charge' + abc[1]).val(abc[2]);
					setHiddenValuesForCharges(abc[1]);
				}
				
				chargeMasterIdsArr.push(abc[1]);
				chargeAddedFromProperty = true;
			}
		}
		
		if(chargeAddedFromProperty) {
			for(const element of charges) {
				if(!isValueExistInArray(chargeMasterIdsArr, element.chargeTypeMasterId)) {
					$("#charge" + element.chargeTypeMasterId).val(0);
					setHiddenValuesForCharges(element.chargeTypeMasterId);
				}
			}
		}
	}
}

function getInclusiveAmount() {
	if(!isPartyChargeInclusive) {
		addOtherChargesInFreight();
		calcTotal();
		return;
	}
	
	let excludedChargeArr	= [];
	
	if(typeof configuration.excludedChargeIdsForInclusiveParty !== 'undefined')
		excludedChargeArr	= (configuration.excludedChargeIdsForInclusiveParty).split(',');
	
	let freight			= getFreightAmountFromAddedConsignemnt();
	
	let chargeTypeModel = jsondata.charges;
	
	for (const element of chargeTypeModel) {
		let chargeMasterId	= element.chargeTypeMasterId;
		
		if(chargeMasterId == BookingChargeConstant.FREIGHT || chargeMasterId == BookingChargeConstant.FUEL_SURCHARGE
			|| isValueExistInArray(excludedChargeArr, chargeMasterId))
			continue;
		
		freight	= freight - Number($('#charge' + chargeMasterId).val());
	}
	
	$('#charge' + BookingChargeConstant.FREIGHT).val(freight);
	setHiddenValuesForCharges(BookingChargeConstant.FREIGHT);
		
	inclusiveCharge(getPercentageValue(chargesRates));
	
	addOtherChargesInFreight();
	
	calcTotal();
}

function getFreightAmountFromAddedConsignemnt() {
	let freight	= 0;
	
	if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
		freight	= $('#weightAmount').val();
	} else if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		if(consigAddedtableRowsId.length > 0) {
			for(const element of consigAddedtableRowsId) {
				if($('#qtyAmountTotal' + element).html() > 0)
					freight		+= parseFloat($('#qtyAmountTotal' + element).html());
			}
		}
	}
	
	return freight;
}

function addOtherChargesInFreight() {
	if(configuration.otherChargesToAddInFreight == '0' || configuration.otherChargesToAddInFreight == undefined)
		return;
	
	let otherChargesList	= (configuration.otherChargesToAddInFreight).split(",");
	
	let totalCharge	= 0;
	
	for(const charge of otherChargesList) {
		totalCharge	+= Number($('#actualChargeAmount' + charge).val());
		$('#charge' + charge).val(0);
	}
	
	let freightChargeValue	= Number($('#freightChargeValue').val());
	let actualChargeAmount	= Number($('#actualChargeAmount' + FREIGHT).val());
	
	if(actualChargeAmount > 0)
		$('#charge' + FREIGHT).val(actualChargeAmount + totalCharge);
	else if(freightChargeValue)
		$('#charge' + FREIGHT).val(freightChargeValue + totalCharge);
	else
		$('#charge' + FREIGHT).val(totalCharge);
}

