// Global variable for Current System DateTime
if (typeof curDate != 'undefined' && curDate != undefined) {
	var hours					= curDate.getHours();
	var minutes					= curDate.getMinutes();
	var seconds					= curDate.getSeconds();
	var currentTimeFromServer	= hours+":"+minutes+":"+seconds;
}

var sessionTimer = self.setInterval(function(){
	if(configuration != null && configuration.applyDiscountThroughMaster  == 'true') { 
		refreshSession();
	}				
},10*1000);

function refreshSession(){
	var isDiscountStarted		= false;
	var isDiscountEnded			= false;
	var discountMaster			= jsondata.DiscountMaster;
	var noRecords				= jsondata.noRecords;
	var discountTimeList		= jsondata.discountTimeList;
	var currentTimeMilisecond	= curDate.getTime();
	
	if(noRecords == false && discountTimeList != undefined){
		for(const element of discountTimeList){
			var startTimeMilisecond = element.startTimeMilisecond;
			var endTimeMilisecond	= element.endTimeMilisecond;
			
			if((currentTimeMilisecond >= startTimeMilisecond && currentTimeMilisecond <= endTimeMilisecond))
				isDiscountStarted = discountMaster == undefined || discountMaster == 'undefined';
			else if((startTimeMilisecond <= currentTimeMilisecond && currentTimeMilisecond >= endTimeMilisecond)){
				if((discountMaster != undefined && discountMaster != 'undefined'))
					isDiscountEnded	  = true;
			}
		}
		
		if(isDiscountStarted) {
			if(confirm("Happy Hours are Started, Please Press OK to apply Discount."))
				location.reload();
		} else if(isDiscountEnded && confirm("Happy Hours are Ended, Please Press OK to remove Discount."))
			location.reload();
	}
}

function applyReCalculatedRates() {
	setRatesTableWise();
}

function setRatesTableWise() {
	setRateType();
	checkAndApplyDeviationWiseRate = false;
	
	for (let k in consignmentDataHM) {
		let qtyAmount			= consignmentDataHM[k].amount;
		let quantity			= consignmentDataHM[k].quantity;
		let typeofPacking		= consignmentDataHM[k].packingTypeMasterId;
		let consignmentGoodsId	= consignmentDataHM[k].consignmentGoodsId;

		calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);

		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
			checkRateForPackingType(qtyAmount, 1);
		else
			checkRateForPackingType(qtyAmount, quantity);
		
		idNum++
		addinqtyArr(idNum);
		applyRates();
	}
	
	getWeightTypeRates();
	getCFTWiseRate();
	getCBMWiseRate();
	getFixedHamaliSlabRates();
	checkIfnotPresent();
	applyRates();
}

function findifNewRate() {
	$('#searchRate').val('');
}

function checkIfRateNotPresent() {
	if(configuration.validateArtDetailsAfterEnterQtyAmount == 'true') {
		if(validateAddArticle()) {
			var qtyAmount = $('#qtyAmount').val();
			var quantity  = $('#quantity').val();
			
			if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
				checkRateForPackingType(qtyAmount, 1);
			else
				checkRateForPackingType(qtyAmount, quantity);
		}
	} else {
		if(!validateConsignmentTables())
			return false;

		var qtyAmount = $('#qtyAmount').val();
		var quantity  = $('#quantity').val();
		
		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
			checkRateForPackingType(qtyAmount, 1);
		else
			checkRateForPackingType(qtyAmount, quantity);
	}
}

function checkRateForPackingType(qtyAmount, quantity ) {
	var searchRate = $('#searchRate').val();
	var isFreightRateExist	= false;

	if(searchRate == "") {
		finalQtyAmt = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
		$('#searchRate').val(FREIGHT + '=' + parseFloat(finalQtyAmt));
	} else {
		let tempString		= new Array();
		let fromsearchRate	= $('#searchRate').val();
		let qtyRateFromEle	= fromsearchRate.split(",");
		let amount = 0;
		let finalQtyRate = 0;
		
		for(const element of qtyRateFromEle){
			let chargeTypeId	= parseInt(element.split("=")[0]);
			let qtyrate			= parseFloat(element.split("=")[1]);
			
			if(element.split("=")[0] == FREIGHT) {
				qtyrate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);

				isFreightRateExist = true;
				finalQtyRate = qtyrate;
			}
			
			if(configuration.deductHamaliChargeFromFreight == 'true' && element.split("=")[0] == SRS_HAMALI_BOOKING)
				hamaliChargeAmt = qtyrate;
			
			if(calculateMinimumQtyAmt(element.split("=")[0], qtyAmount, chargeTypeId))
				qtyrate = MinQtyAmtTobeAssigned;
			
			tempString.push(chargeTypeId+"="+qtyrate);
		}
		
		if(!isFreightRateExist) {
			finalQtyRate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
			
			if(finalQtyRate > hamaliChargeAmt && configuration.deductHamaliChargeFromFreight == 'true')
				tempString.push(FREIGHT + '=' + parseFloat(finalQtyRate - hamaliChargeAmt))
			else
				tempString.push(FREIGHT + '=' + parseFloat(finalQtyRate))
		}
	
		if(configuration.deductHamaliChargeFromFreight == 'true') {
			for(let i = 0; i < tempString.length; i++) {
				if(tempString[i].split("=")[0] == HAMALI) {
					amount = parseFloat(amount) + parseFloat(tempString[i].split("=")[1]);
					
					if(finalQtyRate < amount)
						tempString.splice(i, 1); 
				} else if(tempString[i].split("=")[0] == FREIGHT) {
					tempString.splice(i, 1); 
					
					if(hamaliChargeAmt >= finalQtyRate)
						tempString.push(FREIGHT + '=' + parseFloat(finalQtyRate))
					else
						tempString.push(FREIGHT + '=' + parseFloat(finalQtyRate - hamaliChargeAmt))
				}
			}
		}
	
		if(!isFixedArticleSlab && tempString != "" && tempString != null)
			$('#searchRate').val(tempString);
	}
}


function calculateChargeAmount(filter, qtyAmount, quantity) {
	if(weightTypeForRateApply == WEIGHT_TYPE_ID_ACTUAL_WEIGHT && Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT)
		quantity = Number($('#actualWeight').val()); 
	
	var artActWeight	= 1;
	
	if(configuration.WeightWiseConsignmentAmount == 'true' && Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT)
		artActWeight	= $('#artActWeight').val();
	
	var amt = 0;

	switch (Number(filter)) {
	case 1:
		amt = parseFloat(qtyAmount * quantity);
		break;

	case 2:
		if(getBookingType() == BOOKING_TYPE_SUNDRY_ID)
			amt = parseFloat(qtyAmount * quantity * artActWeight);
		else
			amt = parseFloat(qtyAmount);
		break;
	default:
		amt = 0;
		break;
	}
	
	if(Number($('#chargeType').val()) == CHARGETYPE_ID_KILO_METER && distance > 0)
		amt	= amt * distance;

	return amt;
}

function checkIfnotPresent() {
	var tempString			= "";
	var chargeTypeId		= 0;
	var wghtAmt				= 0;
	var chargedWeight		= parseFloat($('#chargedWeight').val());
	var weigthFreightRate	= 0;

	if($('#weigthFreightRate').val() != '')
		weigthFreightRate	= $('#weigthFreightRate').val();
	
	if (configuration.VolumetricWiseAddArticle == 'true' && Number($('#actualWeight').val()) > Number($('#chargedWeight').val()))
		chargedWeight		= $('#actualWeight').val();

	var isFreightRateExist	= false;
	var sliptedByCommas		= new Array();

	for(var j = 0; j < weightTypeArr.length; j++) {
		sliptedByCommas	= weightTypeArr[j].split(",");
		
		for(var i = 0; i < sliptedByCommas.length; i++) {
			chargeTypeId = sliptedByCommas[i].split("=")[0];
			
			if(chargeTypeId == FREIGHT) {
				if (checkAndApplyDeviationWiseRate)
					wghtAmt = calculateDeviationWise(weigthFreightRate);
				else
					wghtAmt = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);
					
				isFreightRateExist = true;
			} else
				wghtAmt = parseFloat(sliptedByCommas[i].split("=")[1]);
			
			if(!lrWiseDecimalAmountAllow($('#wayBillType').val()))
				wghtAmt = Math.round(wghtAmt);

			if(i == 0)
				tempString += chargeTypeId+'='+wghtAmt;
			else
				tempString += ','+chargeTypeId+'='+wghtAmt;
		}
	};

	if(!isFreightRateExist)
		tempString += "," + FREIGHT + '=' + calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);;

	if(tempString != null && tempString != '') {
		$('#searchRate').val(tempString);
		weightTypeArr = new Array();
		weightTypeArr.push(tempString);
	}

	applyRates();
}

function AddRemoveRateTypeOptions(partyCategory,partyMasterId) {
	var rateType = document.getElementById('rateType');

	if(rateType != null) {
		if(partyCategory == CUSTOMER_TYPE_CONSIGNOR_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CUSTOMER_TYPE_CONSIGNOR_ID)) {

			addRateType(CUSTOMER_TYPE_CONSIGNOR_ID, CUSTOMER_TYPE_CONSIGNOR_NAME);
			setRateType();
		} else if(partyCategory == CUSTOMER_TYPE_CONSIGNEE_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CUSTOMER_TYPE_CONSIGNEE_ID)) {
			addRateType(CUSTOMER_TYPE_CONSIGNEE_ID, CUSTOMER_TYPE_CONSIGNEE_NAME);
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
	var currentWayBillTypeId = $('#wayBillType').val();

	if(currentWayBillTypeId == WAYBILL_TYPE_PAID)
		$("#rateType").val(CUSTOMER_TYPE_CONSIGNOR_ID);
	else if(currentWayBillTypeId == WAYBILL_TYPE_TO_PAY)
		$("#rateType").val(CUSTOMER_TYPE_CONSIGNEE_ID);
}

function removeRateType(val) {
	$("#rateType option[value='" + val + "']").remove();
}

function lrTypeToAvoidMinimumChargeWeight() {
	if(configuration.doNotSetMinChargeWeightInTBB == 'false')
		return false;
		
	return $('#wayBillType').val() == WAYBILL_TYPE_CREDIT;
}

function editChargedWeight(obj) {
	var actualWeight		= parseFloat($('#actualWeight').val());
	var chargedWeight		= parseFloat($('#chargedWeight').val());

	minWeight			= partyMinimumWeight();

	if(configuration.allowPackingTypeWiseMinWeightCal == 'true')
		minWeight = setPackingTypeWiseBranchMinWeight();
	
	if(actualWeight <= minWeight) {
		if(chargedWeight < minWeight) {
			if(!lrTypeToAvoidMinimumChargeWeight())
				showMessage('info', chargedWeightLessThanInfoMsg(minWeight));
			 
			calculateChargedWeight(obj);
			return false;
		}
	} else if(!chgwgtActWgtConditionForLess && (chargedWeight < actualWeight)) {
		showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
		calculateChargedWeight(obj);
		return false;
	}
	
	if(configuration.setDefaultChargeWeight == 'true' && !chgwgtActWgtConditionForLess && Number($('#chargedWeight').val()) < configuration.defaultChargeWeightValue) {
		if(actualWeight > 0) {
			showMessage('info', chargedWeightLessThanInfoMsg(configuration.defaultChargeWeightValue));
			$('#chargedWeight').val(configuration.defaultChargeWeightValue)
			setTimeout(function(){ $('#chargedWeight').focus(); }, 0);
			return false;
		}
	}
	
	if (configuration.validateMinimumChargeWtRegionWise == 'true' && regionWiseFixMinimumChargeWt()) {
		let minimumChargeAmnt = Number(configuration.minimumChargeWtForRegion);
		
		if (chargedWeight < minimumChargeAmnt) {
			showMessage('error', 'Please Enter Charged Wt Above ' + minimumChargeAmnt + ' !');
			setTimeout(function() {
				$('#chargedWeight').focus();
			}, 100)

			return false;
		}
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
	
	var quantityAmount	= 0;

	if(getValueFromInputField('qtyAmount') != null)
		quantityAmount	= getValueFromInputField('qtyAmount')
		
	if(configuration.checkingRateAmountAndQuantityAmount == 'true' && Number(quantityAmount) < Number(calRateAmt)) {
		if(configuration.quantityAmtDontAllowFromRateMasterAmt == 'true') {
			setTimeout(function() {
				showMessage('error', 'You can not enter less than this ' + calRateAmt + '!');
			}, 10);
			
			setValueToTextField('qtyAmount', calRateAmt);
		} else {
			setTimeout(function() {
				showMessage('info', 'Quantity amount is less than rate amount ' + calRateAmt);
			}, 10);
		}
	}

	if(configuration.AllowLessQuantityAmtApplyFromRateMaster == 'true')
		return;

	if(quantityAmount < qtyAmt) {
		setValueToTextField('qtyAmount', qtyAmt);
		//alert('You can not enter Qty Amount less than ' + qtyAmt);
		showMessage('info', qtyAmountLessThanInfoMsg(qtyAmt));
		return false;
	}
}

function calculateChargedWeight(obj) {
	let bookingType		= $('#bookingType').val();
	let actualWeight	= $('#actualWeight').val();
	chargedWeight		= $('#chargedWeight').val();
	let isWeightAllow	= true;
	let capacity		= 0;
	let corporateAccountId = 0;
	let totalQty		= $('#totalQty').html();
	minWeight			= partyMinimumWeight();
	let newChargeWeight = Number(totalQty) * Number(configuration.configWghtToCalculateChargeWght);

	if(configuration.IsDisplayAlertToSelectLCV == 'true'
		&& Number(actualWeight) >= configuration.MaxWeightToShowAlertForLCV && getBookingType() == configuration.OnBookingTypeToShowAlertForLCV)
		alert('Please Select LCV');
	
	corporateAccountId	= $('#partyMasterId').val();

	if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
		corporateAccountId	= $('#partyMasterId').val();
	else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		corporateAccountId	= $('#consigneePartyMasterId').val();
	else if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		corporateAccountId	= $('#billingPartyId').val();

	if(getBookingType() == BOOKING_TYPE_FTL_ID && $('#vehicleType').exists()) {
		let vehicleTypeValue = $('#vehicleType').val();

		if(vehicleTypeValue != 0 && vehicleTypeValue != null) {
			let val		= vehicleTypeValue.split(",");
			capacity	= parseFloat(val[1]);

			if(parseFloat(actualWeight) > parseFloat(val[1]))
				isWeightAllow	= configuration.FTLWeightAllowMoreThenTruck == 'true';//Vehicle Capacity Check
		} else {
			showMessage('error', truckTypeErrMsg);
			$('#actualWeight').val(0);
			$('#previousActualWeight').val(0);
			$('#chargedWeight').val(0);
			return false;
		}
	}
	
	let number		= configuration.numberToRoundOffChargedWeight;

	if(isWeightAllow) {
		if(actualWeight == 0)
			$('#chargedWeight').val(0);
		else if(configuration.calChargeWghtIfActualWghtLessThanConfiguredWght == 'true' && actualWeight >= 1 && newChargeWeight > actualWeight && actualWeight <= Number(configuration.minActualWghtToCalChargeWghtWithConfigWght) && !isManualWayBill)
			$('#chargedWeight').val(newChargeWeight);
		else if(actualWeight >= 1 && actualWeight <= parseInt(minWeight) && !lrTypeToAvoidMinimumChargeWeight())
			$('#chargedWeight').val(parseInt(minWeight));
		else if((obj.id == 'actualWeight') && (parseInt(actualWeight) > parseInt(configuration.actualWeightValue)) && (configuration.checkActualWeight == 'true') ){
			if(bookingType == BOOKING_TYPE_SUNDRY_ID) {
				confirm("You are booking LR with more than " + parseInt(configuration.actualWeightValue) + " kg.\n\nAre you sure you want to book in 'SUNDRY' ?");
				$('#chargedWeight').val(actualWeight);
			}
		} else if(configuration.roundOffChargeWeight  == 'true') {
			/*
			 * Here we are calculating round off value of charge Weight on Particular party
			 */
			let minimumWeightForRoundOffChargeWeightInPaidTopay = parseFloat(configuration.minimumWeightForRoundOffChargeWeightInPaidTopay);
		
			if(configuration.partyWiseChargeWeightRoundOff == 'true') {
				if(chargedWeightRoundOffValue > 0)
					$('#chargedWeight').val(Math.ceil(actualWeight / chargedWeightRoundOffValue) * chargedWeightRoundOffValue);
				else if(corporateAccountId > 0)
					$('#chargedWeight').val(actualWeight);
				else
					$('#chargedWeight').val(Math.ceil(actualWeight / number) * number);
			} else if(($('#wayBillType').val() == WAYBILL_TYPE_PAID || $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) && minimumWeightForRoundOffChargeWeightInPaidTopay > 0) {
				if(actualWeight > 0) {
					if(Number(actualWeight) <= minimumWeightForRoundOffChargeWeightInPaidTopay)
						$('#chargedWeight').val(minimumWeightForRoundOffChargeWeightInPaidTopay);
					else if(Number(actualWeight) > minimumWeightForRoundOffChargeWeightInPaidTopay)
						$('#chargedWeight').val(Math.ceil(actualWeight / number) * number);
				}
			} else
				$('#chargedWeight').val(Math.ceil(actualWeight / number) * number);
		} else 
		  $('#chargedWeight').val(actualWeight);
		
		$('#previousActualWeight').val(actualWeight);

		if(bookingType == BOOKING_TYPE_FTL_ID && actualWeight < capacity) {
			alert('Not Optimizing the space of Vehicle');
			$('#chargedWeight').val(actualWeight);
		}
		
		if(bookingType == BOOKING_TYPE_FTL_ID && configuration.isAllowToExceedVehicleCapacityBeyondLimit == 'true') {
			let percCapacityIncreased	= configuration.percentageAllowedBeyondVehicleCapacity;
			let exceededCapacity		= capacity + ((capacity * percCapacityIncreased) / 100);

			if(parseFloat(actualWeight) > exceededCapacity){
				$('#actualWeight').val($('#previousActualWeight').val());
				$('#chargedWeight').val($('#previousActualWeight').val());
				
				if(configuration.doNotAllowIfActualWeightExccedVehicleCapacity == 'true')
					alert('Capacity of Selected Vehicle is ' + exceededCapacity + ' so you can not enter Actual Weight more than that');
			}
		}
	} else {
		if(configuration.doNotAllowIfActualWeightExccedVehicleCapacity == 'true')
			$('#actualWeight').val($('#previousActualWeight').val());
		
		alert('Capacity of Selected Vehicle is ' + capacity + ' so you can not enter Actual Weight more than that');
	}

	if(configuration.AllowMinActualWeight == 'true') {
		let minActWght = configuration.MinActualWeight;

		if(Number(actualWeight) > Number(minActWght)) {
			$('#actualWeight').val(actualWeight);
			
			if(Number($('#chargedWeight').val()) < Number(actualWeight))
				$('#chargedWeight').val(actualWeight);
		} else {
			$('#actualWeight').val(minActWght);
			$('#chargedWeight').val(minActWght);
		}
	}

	if(configuration.AllowMinChargedWeight == 'true' && (configuration.allowMinChargedWeightInTBB != 'true' || $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)) {
		let minChrdWght = configuration.MinChargedWeight;
		
		if(minWeight > 0)
			minChrdWght	= minWeight;
			
		if(Number(actualWeight) == 0)
			$('#actualWeight').val(actualWeight);
		else if(Number(actualWeight) < Number(minChrdWght))
			$('#chargedWeight').val(minChrdWght);
		else if(Number(actualWeight) > Number(minChrdWght) && Number(minChrdWght) > 0)
			$('#chargedWeight').val(actualWeight);
		
		if(configuration.roundOffChargeWeight  == 'true' && configuration.partyWiseChargeWeightRoundOff == 'false' && configuration.minimumWeightForRoundOffChargeWeightInPaidTopay == 0) {
			actualWeight	= $('#actualWeight').val();
			
			if(Number(actualWeight) > Number(minChrdWght))
				$('#chargedWeight').val(Math.ceil(actualWeight / number) * number);
		}
	}

	if(configuration.roundOffIncreasedChargedWeightValue == 'true') {
		let branches	= (configuration.roundOffChargedWeightByTensForBranchs).split(",");
		
		if(configuration.roundOffChargedWeightByTens == 'true') {
			for(const element of branches) {
				if(element == branchId)	 //branchId is gloabally defined, it is Executive branch Id
					$('#chargedWeight').val(Math.round($('#chargedWeight').val() / 10) * 10);
				else
					$('#chargedWeight').val(Math.ceil($('#chargedWeight').val() / number) * number);
			}
		}
	}
	
	setMinimumWeight();
}

function setMinimumWeight() {
	var actualWeight	= Number($('#actualWeight').val());
	
	if(configuration.setDefaultChargeWeight == 'true' && actualWeight > 0)
		$('#chargedWeight').val(configuration.defaultChargeWeightValue);
}

function checkPackingTypeAllowedOnWeight() {
	return true;
}

function checkCommission() {
	var agentcommission	= $('#agentcommission').val();
	
	if(agentcommission != null && agentcommission > agentCommissionValueAllowed) {
		$('#agentcommission').val(0);
		showMessage('info', commissionError(agentCommissionValueAllowed));
		setTimeout(function(){$('#agentcommission').focus(); }, 10);
		return false;
	}
	
	return true;
}

function calculateWeigthRate() {
	if(configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true' && $('#chargeType').val() == CHARGETYPE_ID_WEIGHT && isFixedSlab)
		return;

	var weigthFreightRate	= $('#weigthFreightRate').val();
	var chargedWeight		= parseFloat($('#chargedWeight').val());
	var total				= 0;;
	
	if(chargedWeight != 0 && weigthFreightRate != 0) {
		if(checkAndApplyDeviationWiseRate)
			total = calculateDeviationWise(weigthFreightRate);
		else
			total = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);

		if(!lrWiseDecimalAmountAllow($('#wayBillType').val()))
			total	= Math.round(total);
		else
			total	= total.toFixed(2);

		$('#weightAmount').val(total);
		
	}
}

function calculateDeviationWise(wRate) {
	let vehicleTypeValue = $('#vehicleType').val();
	let actualWeight	 = parseFloat($('#actualWeight').val()) || 0;
	let finalFreight	 = Number(wRate);

	if(!vehicleTypeValue) {
		return parseFloat(finalFreight);
	}

	let val = vehicleTypeValue.split(",");
	let capacity = parseFloat(val[1]) || 0;

	if (capacity > 0) {
		let deviation  = capacity * partyDeviationPercent/100;
		let lowerLimit = capacity - deviation;
		let upperLimit = capacity + deviation;
		let ratePerKg  = finalFreight / capacity;
		
		if(actualWeight >= lowerLimit && actualWeight < capacity) {
			let weightDifference = capacity - actualWeight;
			let discount = ratePerKg * weightDifference * partyDeductionPercent/100;
			finalFreight = Number(finalFreight - discount);
		} else if (actualWeight > capacity && actualWeight <= upperLimit ){
			let excessWeight = actualWeight - capacity;
			let extraCharge = ratePerKg * excessWeight * partyDeductionPercent/100;
			finalFreight = Number(finalFreight + extraCharge);
		}
	}
	
	return parseFloat(finalFreight);
}

function getChargesRates() {
	let	corporateAccountId	= 0;
	let configObject		= null;
	let configData			= new Object();
	isSlabRateNotExists		= false;
	
	if(configuration.ChargeTypeFlavour == '1') {
		corporateAccountId	= $('#billingPartyId').val();
		
		if(corporateAccountId == 0)
			corporateAccountId	= $('#partyMasterId').val();
	} else if (Number($('#billingPartyId').val()) > 0)
		corporateAccountId	= $('#billingPartyId').val();
	else if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
		if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
			corporateAccountId	= $('#partyMasterId').val();	
		else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
			if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay)
				corporateAccountId	= $('#partyMasterId').val();
			else
				corporateAccountId	= $('#consigneePartyMasterId').val();
		}
	} else
		corporateAccountId	= $('#partyMasterId').val();
	
	if(configuration.ChargeTypeFlavour == '4') {
		corporateAccountId	= 0;
		
		if(billingPartyChargeConfigRates)
			corporateAccountId	= $('#billingPartyId').val();
		else if(consignorPartyChargeConfigRates)
			corporateAccountId	= $('#partyMasterId').val();
		else if(consigneeChargeConfigRates)
			corporateAccountId	= $('#consigneePartyMasterId').val();
		else if(isBranchChargeConfigRate)
			corporateAccountId	= 0;
	}
	
	if(chargeConfigPartyId > 0)
		corporateAccountId	= chargeConfigPartyId;
	
	/*
		Read property here
	*/
	if(configuration.applyOnlyPartyWiseLRLrLevelChargeIfRouteWiseChargeFound == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT){
		if(freightRatePartyId > 0 && !jQuery.isEmptyObject(chargesConfigRates) && chargesConfigRates.length > 0) {
			chargesConfigRates	= chargesConfigRates.filter(function (el) {
				return el.corporateAccountId == freightRatePartyId
			});
		}
	}
	
	let declaredValue = 0;

	if ($("#declaredValue").val() > 0)
		declaredValue = $("#declaredValue").val();
	
	let	branchId		= getSourceBranchForRate();
	let destBranchId	= $('#destinationBranchId').val();
	
	if (configuration.CalculateCarrierRiskChargeOnDeclaredValue == 'true' || configuration.CalculateFOVChargeOnDeclaredValue == 'true') {
		configObject = filterLRLevelRates(4, branchId, destBranchId, corporateAccountId, APPLICABLE_ON_CATEGORY_ID_FIELD, FIELD_ID_DECLARED_VALUE, declaredValue);
		checkAndInsertRates(configObject, configData, 0, 3);

		if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'false' || configuration.CalculateFOVChargeOnDeclaredValue == 'true') {
			configObject = filterLRLevelRates(4, branchId, destBranchId, 0, APPLICABLE_ON_CATEGORY_ID_FIELD, FIELD_ID_DECLARED_VALUE, declaredValue);
			checkAndInsertRates(configObject, configData, 0, 3);
		}
	}
	
	configObject = filterLRLevelRates(3, branchId, destBranchId, corporateAccountId, 0, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'false' && (configObject == null || configObject.length == 0)) {
		configObject = filterLRLevelRates(3, branchId, destBranchId, 0, 0, 0, 0);
		checkAndInsertRates(configObject, configData, 0, 3);
	}
	
	configObject = filterLRLevelRates(5, 0, 0, 0, 0, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	configObject = filterLRLevelRates(5, branchId, destBranchId, corporateAccountId, APPLICABLE_ON_CATEGORY_ID_CHARGE, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	return configData;
}

function getFilteredChargesToCalculateFSCharge() {
	if(configuration.calcFsRate == 'false')
		return;
	
	let corporateAccountId	= 0;
	
	if($('#billingPartyId').val() > 0)
		corporateAccountId	= $('#billingPartyId').val();
	else if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
		if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
			corporateAccountId	= $('#partyMasterId').val();	
		else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
			if(applyConsignorRateOnTopay)
				corporateAccountId	= $('#partyMasterId').val();
			else
				corporateAccountId	= $('#consigneePartyMasterId').val();
		}
	} else
		corporateAccountId	= $('#partyMasterId').val();

	if(configuration.ChargeTypeFlavour == '4') {
		corporateAccountId	= 0;
		
		if(billingPartyChargeConfigRates)
			corporateAccountId	= $('#billingPartyId').val();
		else if(consignorPartyChargeConfigRates)
			corporateAccountId	= $('#partyMasterId').val();
		else if(consigneeChargeConfigRates)
			corporateAccountId	= $('#consigneePartyMasterId').val();
		else if(isBranchChargeConfigRate)
			corporateAccountId	= 0;
	}
	
	let applicableOnChargeTypeMasterIds	= null;
	
	if(chargesConfigRates != null) {
		for(const element of chargesConfigRates) {
			if(corporateAccountId > 0 && Number(element.corporateAccountId) == Number(corporateAccountId)) {
				applicableOnChargeTypeMasterIds	= element.applicableOnChargeTypeMasterIds;
				chargeMinAmountforFSCharge		= element.chargeMinAmount;
			}
			
			if(applicableOnChargeTypeMasterIds == null && element.branchId == executive.branchId) {
				applicableOnChargeTypeMasterIds	= element.applicableOnChargeTypeMasterIds;
				chargeMinAmountforFSCharge		= element.chargeMinAmount;
			}
		}
	}

	if(applicableOnChargeTypeMasterIds != null)
		applicableOnChargeTypeMasterIdArr	= applicableOnChargeTypeMasterIds.split(',');
}

//get rates from ratemaster and charge configuration table
function checkAjaxRates() {
	if ($('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return;

	let destBranchId		= $('#destinationBranchId').val();
	let corporateAccountId	= getLRTypeWisePartyId();

	if (wayBillRates == null && (chargesRates == null || jQuery.isEmptyObject(chargesRates)))
		getRates(destBranchId, corporateAccountId, 1);
}

//get rates from ratemaster
function getRates(destBranchId, corporateAccountId, partyTypeId) {
	if(configuration.applyRateAuto == 'false' || $('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return;

	// they are initilise here to reset the data of quantity type and weight type when new rates Ajax will apply
	weightTypeArr		= new Array();
	quantityTypeArr		= new Array();

	let chargeTypeIdFromRateMaster	= new Array();
	let jsonObject	= setDataToGetRate(destBranchId, corporateAccountId, partyTypeId);
	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("RouteAndLRLevelWiseRate.do?pageId=9&eventId=15",
			{json:jsonStr,filter:4}, function(data) {
				resetBusinessType();
				resetDisabledCharges();
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
						packingTypeList			= null;
						consignmentGoodsListHM	= null;
					
						if(Number($('#billingPartyId').val()) > 0 && configuration.resetTBBPartyDetailOnRateNotExist == 'true')
							resetTBBPartyData();
					}
					
					$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
				} else {
					wayBillRates				= data.wayBillRates;
					packingTypeList				= data.packingTypeList;
					consignmentGoodsListHM		= data.consignmentGoodsListHM;
					chargesConfigRates			= data.chargesConfigRates;
					chargesRates				= null;
					chargeTypeIdsFromRateMaster	= data.chargeTypeIdsFromRateMaster;
					freightRatePartyId			= data.corporateAccountId;
					chargeConfigPartyId			= data.chargeConfigPartyId;
					fixedSlabAmtExist			= data.fixedSlabAmtExist;
					declaredValueRates			= data.declaredValueRate;
					//businessTypeId				= data.businessTypeId;
					
					if (data.isRateExpiredOnParty)
						showMessage('info', data.msgForPartyRateExpired);

					if(freightRatePartyId > 0) {
						var party	= partyWiseDataHM[freightRatePartyId];
						
						if(party != undefined)
							businessTypeId	= party.businessTypeId;
						
						if(businessTypeId > 0) {
							$('#businessType').val(businessTypeId);
							$('#businessType').prop('disabled', true);
						}
					}
					
					if(configuration.applyPartyCommissionFromPartyMaster == 'true' && freightRatePartyId > 0)
						partyIdForCommission	= freightRatePartyId;
					
					if(configuration.chargeTypeBasedOnRate == 'true') {
						setChargeType();
						
						if(!jQuery.isEmptyObject(chargeTypeIdsFromRateMaster)) {
							chargeTypeIdFromRateMaster	= chargeTypeIdsFromRateMaster.split(',');
							$('#chargeType').val(chargeTypeIdFromRateMaster[0]);
							changeOnChargeType();
						}
						
						if(!jQuery.isEmptyObject(data.msgForChargeTypeSelection))
							showMessage('info', data.msgForChargeTypeSelection);
					}

					if(configuration.allowConsigorRatesOnTopayLR == 'true' && !showRatesNotFound) {
						for(const element of wayBillRates) {
							if(Number(corporateAccountId) > 0 && Number(element.corporateAccountId) == Number(corporateAccountId))
								showRatesNotFound	= true;
						}
						
						if(showRatesNotFound)
							$('#rateInfoMsg').addClass('hide');
						else
							$('#rateInfoMsg').removeClass('hide');
					}

					if(Number($('#billingPartyId').val()) > 0 && configuration.resetTBBPartyDetailOnRateNotExist == 'true'
						&& freightRatePartyId == 0)
							resetTBBPartyData();

					partyMinimumRates();
					partyMinimumWeight();

					if(chargeTypeFlavour != '4') {
						getWeightTypeRates();
						getPackingTypeRates();
						getCFTWiseRate();
						getCBMWiseRate();
						getFixedHamaliSlabRates();
						applyRates();
						loadRatesDef.resolve();
					}
				}
			});
}

//get Slab from Slab Master
function getMaximumSlabValue(corporateAccountId) {
	if(configuration.applyRateAuto == 'false' || $('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return;

	let jsonObject				= new Object();
	jsonObject["partyId"]		= corporateAccountId;

	$.ajax({
		url: WEB_SERVICE_URL+'/slabMasterWS/getSlabDetailsByPartyId.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', data.errorDescription);
			} else {
				maximumSlabValue	= 0;
				if(data.SlabMaster != undefined)
					maximumSlabValue	= data.SlabMaster[0].maxValue;
				else
					maximumSlabValue	= 0;
			}
		}
	});
}

function applyRateForPartyType(){
}

//filter rate as par user selection get revert filterd data 
function filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;
	var newDestBranchId	= destBranchId;
	var businessTypeId	= 0;
	
	if(configuration.businessTypeSelection == 'true' && $('#businessType').exists() && freightRatePartyId <= 0)
		businessTypeId	= $('#businessType').val();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			
			if(Number(datarates.packingGroupTypeId) == 0)
				packingGrpId		= 0;
			else
				packingGrpId = packingGrpTypeId;
			
			if(Number(datarates.destinationBranchId) == 0)
				destBranchId	= 0;
			else
				destBranchId	= newDestBranchId;

			if(chargeSectionId == CHARGE_SECTION_FIXED_PARTY_RATE_ID && datarates.chargeSectionId == chargeSectionId)//fix party rate
				chargeTypeId		= datarates.chargeTypeId;

			/*
			 * In case of Party to Party rate make this true
			 */
			//if(configuration.applyWayBillTypeWiseRates == 'true' || configuration.applyWayBillTypeWiseRates == true) {
				if(Number(datarates.wayBillTypeId) == 0)
					wayBillTypeId		= 0;
				else
					wayBillTypeId		= $('#wayBillType').val();
			//}
			
			var transportationModeId	= TRANSPORTATION_MODE_ROAD_ID;
			
			if(configuration.transportationModeWiseRateAllow == 'true')
				transportationModeId	= $('#transportationMode').val();
			
			if(chargeSectionId == CHARGE_SECTION_FIXED_RATE_ID) { //fixed rate
				if(datarates.chargedFixed && datarates.chargeSectionId == chargeSectionId) {
					if(Number(datarates.accountGroupId)					== Number(accountGroupId)
							&& Number(datarates.branchId)				== Number(srcBranchId)
							&& Number(datarates.destinationBranchId)	== Number(destBranchId)
							&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)) {
						arr.push(wayBillRates[i]);
					}
				}
			} else if(Number(datarates.accountGroupId)		== Number(accountGroupId)
				&& Number(datarates.branchId)				== Number(srcBranchId)
				&& Number(datarates.destinationBranchId)	== Number(destBranchId)
				&& Number(datarates.vehicleTypeId)			== Number(vehicleTypeId)
				&& Number(datarates.packingTypeId)			== Number(packingTypeId)
				&& Number(datarates.packingGroupTypeId)		== Number(packingGrpId)
				&& Number(datarates.categoryTypeId)			== Number(categoryTypeId)
				&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)
				&& Number(datarates.chargeTypeId)			== Number(chargeTypeId)
				&& Number(datarates.wayBillTypeId)			== Number(wayBillTypeId)
				&& Number(datarates.chargeSectionId)		!= CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID
				&& Number(datarates.chargeSectionId)		!= CHARGE_SECTION_FIXED_HAMALI_SLAB_RATE_ID
				&& Number(datarates.consignmentGoodsId)		== Number(consignmentGoodsId)
				&& Number(datarates.consigneePartyId)		== Number(consigneeId)
				&& Number(datarates.transportationModeId)	== Number(transportationModeId)
				&& Number(datarates.businessTypeId)			== Number(businessTypeId)
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}
	
	var lrDateManual	=	$('#lrDateManual').val();
	
	if (!jQuery.isEmptyObject(arr) && checkAndApplyDeviationWiseRate && isManualWayBill && lrDateManual != null && lrDateManual != "") {
		var lrDateManualParts = lrDateManual.split("-");

		var manualLRDate = new Date(
			parseInt(lrDateManualParts[2], 10),
			parseInt(lrDateManualParts[1], 10) - 1,
			parseInt(lrDateManualParts[0], 10)
		);

		arr = arr.filter(function(rate) {
			if(!rate.validFrom || !rate.validTill)
				return false;
		
			var validFrom = new Date(rate.validFrom);
			var validTill = new Date(rate.validTill);

			var validFromDate = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
			var validTillDate = new Date(validTill.getFullYear(), validTill.getMonth(), validTill.getDate());
			var manualDate = new Date(manualLRDate.getFullYear(), manualLRDate.getMonth(), manualLRDate.getDate());

			
			return (manualDate >= validFromDate && manualDate <= validTillDate);
		});
	}
	
	return arr;
}

//filter rate as par user selection get revert filterd data 
function filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (const element of wayBillRates) {
			var datarates = element;
			
			if(Number(datarates.packingGroupTypeId) == 0)
				packingGrpId = 0;
			else
				packingGrpId = packingGrpTypeId;

			if(Number(datarates.destinationBranchId) == 0)
				destBranchId	= 0;

			if(Number(datarates.wayBillTypeId) == 0)
				wayBillTypeId		= 0;
			else
				wayBillTypeId		= $('#wayBillType').val();
			
			if(Number(datarates.accountGroupId)					== Number(accountGroupId)
					&& Number(datarates.branchId)				== Number(srcBranchId)
					&& Number(datarates.destinationBranchId)	== Number(destBranchId)
					&& Number(datarates.vehicleTypeId)			== Number(vehicleTypeId)
					&& Number(datarates.packingTypeId)			== Number(packingTypeId)
					&& Number(datarates.packingGroupTypeId)		== Number(packingGrpId)
					&& Number(datarates.categoryTypeId)			== Number(categoryTypeId)
					&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)
					&& Number(datarates.chargeTypeId)			== Number(chargeTypeId)
					&& Number(datarates.wayBillTypeId)			== Number(wayBillTypeId)
					&& Number(datarates.chargeSectionId)		!= CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID
					&& Number(datarates.consignmentGoodsId)		== Number(consignmentGoodsId)
					&& Number(datarates.consigneePartyId)		== Number(consigneeId)
			) {
				arr.push(element);
			}
		}
	}
	
	var lrDateManual	=	$('#lrDateManual').val();
	
	if (!jQuery.isEmptyObject(arr) && checkAndApplyDeviationWiseRate && isManualWayBill && lrDateManual != null && lrDateManual != "") {
		var lrDateManualParts = lrDateManual.split("-");

		var manualLRDate = new Date(
			parseInt(lrDateManualParts[2], 10),
			parseInt(lrDateManualParts[1], 10) - 1,
			parseInt(lrDateManualParts[0], 10)
		);

		arr = arr.filter(function(rate) {
			if(!rate.validFrom || !rate.validTill)
				return false;
		
			var validFrom = new Date(rate.validFrom);
			var validTill = new Date(rate.validTill);

			var validFromDate = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
			var validTillDate = new Date(validTill.getFullYear(), validTill.getMonth(), validTill.getDate());
			var manualDate = new Date(manualLRDate.getFullYear(), manualLRDate.getMonth(), manualLRDate.getDate());

			
			return (manualDate >= validFromDate && manualDate <= validTillDate);
		});
	}
	
	return arr;
}

//filter rate as par user selection get revert filterd data 
function filterLRLevelRates(filter, srcBranchId, destBranchId, corporateAccountId, applicableOnCatetgoryId, fieldId, declaredValue) {
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();
	var wayBillTypeId	= 0;

	switch (filter) {
	case 3 :
		if(!jQuery.isEmptyObject(chargesConfigRates) && chargesConfigRates.length > 0) {
			chargesConfigRates.sort((a, b) => b.destinationBranchId - a.destinationBranchId);
			
			for (const element of chargesConfigRates) {
				var rates = element;
				
				if(Number(rates.destinationBranchId) == 0)
					destBranchId		= 0;
					
				if (Number(rates.wayBillTypeId) == 0)
					wayBillTypeId = 0;
				else
					wayBillTypeId = $('#wayBillType').val();
					
				if(Number(rates.accountGroupId)				== Number(accountGroupId)
						&& Number(rates.branchId)			== Number(srcBranchId)
						&& Number(rates.corporateAccountId) == Number(corporateAccountId)
						&& Number(rates.destinationBranchId) == Number(destBranchId)
						&& Number(rates.wayBillTypeId)		== Number(wayBillTypeId)
						&& (rates.isGroupLevel == undefined || !rates.isGroupLevel)
				) {
					arr.push(element);
				}
			}
		}

		break;
	case 4 :
		if(!jQuery.isEmptyObject(chargesConfigRates)) {
			for (const element of chargesConfigRates) {
				var rates = element;

				if(Number(rates.accountGroupId)						== Number(accountGroupId)
						&& Number(rates.branchId)					== Number(srcBranchId)
						&& Number(rates.corporateAccountId)			== Number(corporateAccountId)
						&& Number(rates.applicableOnCatetgoryId)	== Number(applicableOnCatetgoryId)
						&& Number(rates.fieldId)					== Number(fieldId)
						&& Number(rates.destinationBranchId)		== Number(destBranchId)
						&& Number(declaredValue) > 0
				) {
					arr.push(element);
				}
			}
		}

		break;
	case 5 :
		if(!jQuery.isEmptyObject(chargesConfigRates)) {
			for (const element of chargesConfigRates) {
				var rates = element;
				
				if (Number(rates.wayBillTypeId) == 0)
					wayBillTypeId = 0;
				else
					wayBillTypeId = $('#wayBillType').val();

				if(Number(rates.accountGroupId)						== Number(accountGroupId)
						&& Number(rates.branchId)					== 0
						&& Number(rates.corporateAccountId)			== 0
						&& Number(rates.applicableOnCatetgoryId)	== Number(applicableOnCatetgoryId)
						&& Number(rates.fieldId)					== Number(fieldId)
						&& Number(rates.destinationBranchId)		== 0
						&& Number(rates.wayBillTypeId)				== Number(wayBillTypeId)
						&& (rates.isGroupLevel != undefined && rates.isGroupLevel && rates.chargeMinAmount > 0)
				) {					
					if(configuration.setSubRegionWiseGroupLevelFixCharge == 'true') {
						if(isSubregionForGroupLevelFixCharge())
							arr.push(element);
					} else if(configuration.setRegionWiseGroupLevelFixCharge == 'true') {
						if(isRegionForGroupLevelFixCharge())
							arr.push(element);
					} else
						arr.push(element);
				}
			}
		}

		break;
	default:
		alert("Wrong Choice");
	break;
	}

	return arr;
}

function shouldSkipRate(chargeId, skipForSubRegion, skipForBranch) {
	const srcSubRegionId	= Number(executive.subRegionId);
	const destSubRegionId	= Number($("#destinationSubRegionId").val());
	const destBranchId		= Number($("#destinationBranchId").val());
	const srcBranchId		= getSourceBranchForRate();

	const isSkipBySubRegion		= skipForSubRegion.some(skipRule => skipRule.src === srcSubRegionId && skipRule.dest === destSubRegionId && skipRule.charge === chargeId);
	const isSkipBySubRegionR	= skipForSubRegion.some(skipRule => skipRule.src === destSubRegionId && skipRule.dest === srcSubRegionId && skipRule.charge === chargeId);
	const isSkipByBranch		= skipForBranch.some(skipRule => skipRule.src === srcSubRegionId && skipRule.destBranch === destBranchId && skipRule.charge === chargeId);
	const isSkipByBranchR		= skipForBranch.some(skipRule => skipRule.destBranch === srcBranchId && skipRule.src === destSubRegionId && skipRule.charge === chargeId);

	return isSkipBySubRegion || isSkipByBranch || isSkipBySubRegionR || isSkipByBranchR;
}

//filter rate as par user selection get revert filterd data 
function filterPartyMinRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, applicableOnCatetgoryId, fieldId, declaredValue) {
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (const element of wayBillRates) {
			var datarates = element;

			if(Number(datarates.accountGroupId)					== Number(accountGroupId)
					&& Number(datarates.branchId)				== Number(srcBranchId)
					&& Number(datarates.destinationBranchId)	== Number(destBranchId)
					&& Number(datarates.vehicleTypeId)			== Number(vehicleTypeId)
					&& Number(datarates.packingTypeId)			== Number(packingTypeId)
					&& Number(datarates.categoryTypeId)			== Number(categoryTypeId)
					&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)
					&& Number(datarates.chargeTypeId)			== Number(chargeTypeId)
					&& Number(datarates.chargeSectionId)		== Number(chargeSectionId)
			) {
				arr.push(element);
			}
		}
	}

	return arr;
}

//check if rates is availabe and insert in array 
function checkAndInsertRates(rateMaster, rateId_mast, userInput, filter) {
	if(accountGroupId == 869) {
		if(Number($('#chargeType').val()) == CHARGETYPE_ID_QUANTITY) {
			if($('#totalQty').html() > 0)
				userInput	= Number($('#totalQty').html());
			else if($('#quantity').val() > 0)
				userInput	= Number($('#quantity').val());
		}
			
		if(Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT)
			userInput	= Number($('#chargedWeight').val());
	}
	switch (filter) {
	case 1:
		if(rateMaster != null && rateMaster.length > 0) {
			for (const element of rateMaster) {
				if(rateId_mast[element.chargeTypeMasterId] == null || (typeof rateId_mast[element.chargeTypeMasterId] == 'undefined') || rateId_mast[element.chargeTypeMasterId] == 0) {
					if(element.minWeight >= 0 && element.maxWeight > 0) {
						if((configuration.isApplyFixRateonArticleRate == 'true')
							&& element.minWeight == element.maxWeight) {
							rateId_mast[element.chargeTypeMasterId] = element.rate;
							actualSlabValue = element.minWeight;
							isApplyFixRateonArticleRateMinMaxArticleWise = true;
						}
						
						if(parseFloat(userInput) >= element.minWeight && parseFloat(userInput) <= element.maxWeight && element.chargeTypeMasterId == FREIGHT) {
							isFixedSlab = element.isFixedSlabAmt;
							rateId_mast[element.chargeTypeMasterId] = element.rate;
						} else if(parseFloat(userInput) >= element.minWeight && parseFloat(userInput) <= element.maxWeight) {
							rateId_mast[element.chargeTypeMasterId] = element.rate;
						} else {
							isSlabRateNotExists = true;
							rateId_mast[element.chargeTypeMasterId] = 0;
						}
					} else {
						isSlabRateNotExists = true;
						rateId_mast[element.chargeTypeMasterId] = element.rate;
						isApplyFixRateonArticleRateMinMaxArticleWise = false;
					}
					
					if(element.chargedFixed && element && element.rate > 0 && element.chargeSectionId == CHARGE_SECTION_FIXED_RATE_ID)
						fixedChargeRateObj[element.chargeTypeMasterId] = true;
				} else {
					if(element.minWeight >= 0 && element.maxWeight > 0
						&& configuration.isApplyFixRateonArticleRate == 'true'
						&& element.rate > rateId_mast[element.chargeTypeMasterId] && element.minWeight == element.maxWeight) {
						rateId_mast[element.chargeTypeMasterId] = element.rate;
						actualSlabValue = element.minWeight;
						isApplyFixRateonArticleRateMinMaxArticleWise = true;
					}

					if(parseFloat(userInput) >= element.minWeight && parseFloat(userInput) <= element.maxWeight && isSlabRateNotExists) {
						isSlabRateNotExists = false;
							
						if(rateId_mast[element.chargeTypeMasterId] <= 0)
							rateId_mast[element.chargeTypeMasterId] = element.rate;
							
						isApplyFixRateonArticleRateMinMaxArticleWise = false;
					}
				}

				if(rateId_mast['cftValue'] == null || (typeof rateId_mast['cftValue'] == 'undefined')) {
					if(Number(element.cftRate) > 0 && Number($('#chargeType').val()) != CHARGETYPE_ID_FIX)
						rateId_mast['cftValue']	= element.cftRate;
				}
			}
		}
		break;

	case 2:
		if(rateMaster != null && rateMaster.length > 0) {
			for (const element of rateMaster) {
				if(rateId_mast[element.chargeTypeMasterId] == null && element.rate > 0 && element.chargeSectionId != CHARGE_SECTION_FIXED_HAMALI_SLAB_RATE_ID) {
					rateId_mast[element.chargeTypeMasterId] = element.rate;
					configuredChargeTypeIdWithCharge[element.chargeTypeMasterId] = element.chargeTypeId;
				}
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
	var chargeTypeId		= CHARGETYPE_ID_WEIGHT;
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var chargeSectionId		= 0;
	isSlabRateNotExists		= false;

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
	
	//Fixed Party charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_PARTY_RATE_ID, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId)
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0)
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//if Party rates not defined then apply general rates
	if(categoryTypeId == CATEGORY_TYPE_PARTY_ID ) {

		//Route level charges
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);

		//Loading type charges
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
		//Loading type charges
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId)
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0)
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	}

	return rateId_mast;
}

//applied various condition for packing type rates form rate master
function getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, packingTypeId, packingGrpTypeId, userArticleInput, rateTypeId, consignmentGoodsId, consigneeId) {

	var chargeTypeId		= CHARGETYPE_ID_QUANTITY;
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var chargeSectionId		= 0;
	isSlabRateNotExists		= false;

	//Specific Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Fixed Party charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_PARTY_RATE_ID, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

	//if Party rates not defined then apply general rates
	if(categoryTypeId == CATEGORY_TYPE_PARTY_ID) {
		//Specific Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Specific Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);

		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkSpecificArticleRate(rateMaster);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput,1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput,1);
	}

	return rateId_mast;
}

//condition for party minimim rates
function partyMinRate(srcBranchId,destBranchId,corporateAccountId,categoryTypeId,rateTypeId) {

	var rateId_mast			= new Object();
	var chargeSectionId		= CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID;

	rateMaster = filterPartyMinRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, chargeSectionId, 0, 0, 0);
	
	if(rateMaster != null && rateMaster.length > 0) {
		for (var i = 0; i < rateMaster.length; i++) {
			if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null && rateMaster[i].rate > 0)
				rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
		}
	}

	if(jQuery.isEmptyObject(rateId_mast)) {
		rateMaster = filterPartyMinRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, 0, chargeSectionId, 0, 0, 0);
		
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null && rateMaster[i].rate > 0)
					rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
			}
		}
	}

	return rateId_mast;
}

function getWeightTypeRates() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return false;
	
	if(Number($("#chargeType").val()) == CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRate == 'true' && configuration.ChargeCubicRateCBMWise == 'true'
|| configuration.isQtyAmntAndWeightAmntCompare == 'false' && Number($("#chargeType").val()) != CHARGETYPE_ID_WEIGHT)
		return;
	
	let chargedWeight		= $('#chargedWeight').val();
	let typeofPacking		= 0;
	let consignmentGoodsId	= 0;

	if($('#typeofPackingId1').html() > 0)
		typeofPacking		= $('#typeofPackingId1').html();
	else
		typeofPacking		= $('#typeofPackingId').val();
	
	if($('#consignmentGoodsId1').html() > 0)
		consignmentGoodsId	= $('#consignmentGoodsId1').html();
	
	calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId);

	if((configuration.customFunctionalityOnBookingTypeFTL == 'true')
		&& getBookingType() == BOOKING_TYPE_FTL_ID) {
		let vehicleTypeValue = $('#vehicleType').val();

		if(vehicleTypeValue != 0 && vehicleTypeValue != null) {
			let val		= vehicleTypeValue.split(",");
			capacity	= parseFloat(val[1]);

			if(Number($('#chargedWeight').val()) > Number(capacity)){
				let F= Number($('#charge1').val());
				let R= Number($('#fixAmount').val());
				let C= Number(capacity);
				let W= Number($('#chargedWeight').val());
				$('#fixAmount').val(Math.round(F + (R/C) * (W - C)));
			}
		}
	}
}

function calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId) {
	if(configuration.applyRateAuto == 'false')
		return;

	let	srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	let vehicleTypeValue	= $('#vehicleType').val();
	let vehicleTypeId		= 0;
	let packingGrpTypeId	= 0;
	isFixedSlab				= false;

	if ($('#vehicleType').exists() && vehicleTypeValue != 0 && vehicleTypeValue != null) {
		let val			= vehicleTypeValue.split(",");
		vehicleTypeId	= parseInt(val[0]);
	}
	
	if(configuration.multiplyRateWithPerQuantityAndWeightInFtl == 'true' && getBookingType() == BOOKING_TYPE_FTL_ID)
		vehicleTypeId	= 1;

	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());

	checkAndApplyDeviationWiseRate = (configuration.calcRateOnWeightAndTruckCapacityForTBB == 'true' && getBookingType() == BOOKING_TYPE_FTL_ID && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT && billingPartyId > 0);

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
		if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay) {
			corporateAccountId	= $('#partyMasterId').val();
			rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		} else {
			corporateAccountId	= $('#consigneePartyMasterId').val();
			rateTypeId			= CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
		}
					
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
	} else if(partyMasterId > 0) {
		corporateAccountId	= partyMasterId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else
		categoryTypeId		= CATEGORY_TYPE_GENERAL_ID;

	if(freightRatePartyId > 0)
		corporateAccountId	= freightRatePartyId;
		
	for(const element of PackingGroupMappingArr) {
		if(element.packingTypeMasterId == typeofPacking) {
			packingGrpTypeId	= element.packingGroupTypeId;
		}
	}
	
	fixedChargeRateObj					= {};
	disableFreightCharge				= false;

	if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		let response =	getWghtTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, chargedWeight, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response && !jQuery.isEmptyObject(response)) {
			weightFromDb		= 0;
			actualWeightRateAmt = 0;
			weightFromDb		= getFreightChargeForRates(response);
			purefrieghtAmount	= getFreightChargeForRates(response);
			let actualWeight	= Number($('#actualWeight').val());
			let chargedWeight	= Number($('#chargedWeight').val());
			
			getCftWeightRate(response);
	
			$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
			$('#weightAmount').val(0);
			$('#fixAmount').val(0);

			if(weightFromDb > 0) {
				let weightAmount	= 0;
				
				if(configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true' && $('#chargeType').val() == CHARGETYPE_ID_WEIGHT && isFixedSlab)
					weightAmount	= parseFloat(weightFromDb);
				else if(checkAndApplyDeviationWiseRate)
					weightAmount	= calculateDeviationWise(weightFromDb);
				else if(weightTypeForRateApply == WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
					weightAmount	= parseFloat(weightFromDb * actualWeight);
				else
					weightAmount	= parseFloat(weightFromDb * chargedWeight);
				
				$('#weightAmount').val(weightAmount.toFixed(2));

				$('#weigthFreightRate').val(weightFromDb);
				
				if (configuration.customFunctionalityOnBookingTypeFTL == 'true')
					$('#fixAmount').val(weightFromDb);
				
				if(configuration.disableRateIfFoundFromDB == 'true' && $('#weigthFreightRate').val() > 0) {
					$('#weigthFreightRate').prop('readonly', true);
					disableFreightCharge = true;
				}
					
				if(isCalculateCommissionOnDiffRate(configuration, $('#wayBillType').val(), $('#chargeType').val())) {
					actualWeightRateAmt	= weightFromDb.toFixed(2);
					$('#weigthFreightRate').prop('readonly', false); 
				}
			}

			$('#pureFrieghtAmt').html(purefrieghtAmount);
			
			if(configuration.specificFreightChargeAmount <= 0)
				displaySpecificRate(response);
			
			let tempString;
			  
			if(weightTypeForRateApply == WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
				tempString		= getTempStringForRates(response, actualWeight);
			else
				tempString		= getTempStringForRates(response, chargedWeight);

			weightTypeArr = new Array();
			weightTypeArr.push(tempString);
		} else {
			weightTypeArr = new Array();
			$('#charge' + LR_CHARGE).val(0);
			calculateWeigthRate();
			checkIfnotPresent();
			resetSpecificCharges();
		}
		
		applyRates();
	} 
}

function displaySpecificRate(response) {
	let charges	= jsondata.charges;

	for(const element of charges) {
		if(response[element.chargeTypeMasterId] == undefined)
			response[element.chargeTypeMasterId]	= 0;

		setValueToHtmlTag('SpecificRate_' + element.chargeTypeMasterId, Number(response[element.chargeTypeMasterId]));
	}
}

function getPackingTypeRates() {
	if(isManualWayBill && configuration.ApplyRateInManual == 'false')
		return false;
	
	let quantity			= 0;
	
	if(configuration.isCheckForWeightSlabInsteadOfArticleSlab == 'true')
		quantity			= $('#tempWeight').val();
	else
		quantity			= $('#quantity').val();
	
	let typeofPacking = 0;
	
	if($('#typeofPacking').val() > 0)
		typeofPacking		= $('#typeofPacking').val();
	else
		typeofPacking		= $('#typeofPackingId').val();
	
	let consignmentGoodsId	= 0;
	
	if(configuration.rateApplicableOnSaidToContain == 'true')
		consignmentGoodsId	= $('#consignmentGoodsId').val();
	
	qtyAmt				= calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);
	
	if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt <= 0 && $('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
		enableDisableInputField('qtyAmount', 'false');

//	If Amount is not found from Rate Master Then applying Static Rates After checking the Following Conditions
	if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && $('#wayBillType').val() == WAYBILL_TYPE_PAID && configuration.setConstantArticleAmount == 'true') {
		let packingTypeIds	= (configuration.packingTypeIdsForsetConstantArtAmount).split(",");
		qtyAmt	= 0;
		
		for(const element of packingTypeIds) {
			if(Number(element) == Number(typeofPacking))
				qtyAmt	= configuration.amountToSetConstantArtAmount;
		}
	}
	
	if ($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && ($('#wayBillType').val() == WAYBILL_TYPE_PAID || $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) && configuration.packingTypeWiseApplyRateForCharges == 'true' && $('#consignorGstn').val() !== '') {
		let packingTypeIds = (configuration.packingTypeIdAndChargeIdWithAmountUsingGstNo).split(",");
		qtyAmt = 0;

		for (const element of packingTypeIds) {
			let charges = (element).split('_');

			if (Number(charges[0]) == Number(typeofPacking) && Number(charges[1]) == FREIGHT)
				qtyAmt = Number(charges[2]);
		}
	} else if ($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && configuration.packingTypeWiseApplyRateForCharges == 'true' && $('#consigneeGstn').val() !== '') {
		let packingTypeIds = (configuration.packingTypeIdAndChargeIdWithAmountUsingGstNo).split(",");
		qtyAmt = 0;
		
		if((configuration.fixQtyAmountForPacketPackingType == 'true') && typeofPacking == PACKING_TYPE_PACKET) {
			qtyAmt = 90;
		} else {
			for (const element of packingTypeIds) {
				let charges = (element).split('_');

				if (Number(charges[0]) == Number(typeofPacking) && Number(charges[1]) == FREIGHT)
					qtyAmt = Number(charges[2]);
			}
		}
	} else if ($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && $('#wayBillType').val() != WAYBILL_TYPE_FOC && configuration.packingTypeWiseApplyRateForCharges == 'true') {
		let packingTypeIds = (configuration.packingTypeIdAndChargeIdWithAmount).split(",");
		qtyAmt = 0;
		
		if(configuration.fixQtyAmountForPacketPackingType == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && typeofPacking == PACKING_TYPE_PACKET) {
			qtyAmt = 84;
		} else {
			for (const element of packingTypeIds) {
				let charges = (element).split('_');

				if (Number(charges[0]) == Number(typeofPacking) && Number(charges[1]) == FREIGHT)
					qtyAmt = Number(charges[2]);
			}
		}
	}

	if(configuration.isApplyFixRateonArticleRate == 'true' && qtyAmt > 0 && isApplyFixRateonArticleRateMinMaxArticleWise) {
		setValueToTextField('chargeType', CHARGETYPE_ID_FIX);	
		enableDisableInputField('fixAmount', 'false');
		enableDisableInputField('weightAmount', 'true');
		enableDisableInputField('weigthFreightRate', 'true');
		enableDisableInputField('qtyAmount', 'true');
		
		if(configuration.VolumetricRate == 'true') {
			if (volumetric.checked)
				switchHtmlTagClass('LBH', 'show', 'hide');
		} else
			switchHtmlTagClass('LBH', 'hide', 'show');
		
		$('#fixAmount').val((qtyAmt / actualSlabValue) * quantity);
		return;
	}
	
	$('#qtyAmount').val(qtyAmt);
	
	if ($('#wayBillType').val() != WAYBILL_TYPE_FOC
		&& (configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true')) {
		if(qtyAmt <= 0)
			enableDisableInputField('qtyAmount', 'true');
		else
			enableDisableInputField('qtyAmount', 'false');
	}
	
	if ($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'true') {
			if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
				if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT
						|| $('#chargeType').val() == CHARGETYPE_ID_KILO_METER
						|| $('#chargeType').val() == CHARGETYPE_ID_FIX) {
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'true');
				} else if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'false');
				}
			} else if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT) {
				enableDisableInputField('fixAmount', 'true');
				enableDisableInputField('weightAmount', 'false');
				enableDisableInputField('weigthFreightRate', 'false');
				enableDisableInputField('qtyAmount', 'true');
			} else if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
				enableDisableInputField('fixAmount', 'true');
				enableDisableInputField('weightAmount', 'true');
				enableDisableInputField('weigthFreightRate', 'true');
				enableDisableInputField('qtyAmount', 'false');
			} else if($('#chargeType').val() == CHARGETYPE_ID_FIX) {
				enableDisableInputField('fixAmount', 'false');
				enableDisableInputField('weightAmount', 'true');
				enableDisableInputField('weigthFreightRate', 'true');
				enableDisableInputField('qtyAmount', 'true');
			}
		}
	}
}

function getFreightChargeForRates(response) {
	var amnt = 0;

	if(response[FREIGHT] != null)
		amnt	= Number(response[FREIGHT]);
		
	return amnt;
} 

function getAOCPercentageValue(response) {
	var AOCPercentageValue	= 0;

	if(response[AOC] != null)
		AOCPercentageValue	= Number(response[AOC]);

	return AOCPercentageValue;
}

function getFOVChargeValue(response) {
	var FOVChargeValue	= 0;

	if(response[FOV] != null)
		FOVChargeValue	= Number(response[FOV]);

	return FOVChargeValue;
}

function getTempStringForRates(response, quantity) {
	let tempString = "";
	let chargeMasterId	= 0;
	let qtyAmt			= 0;
	let chargeType		= $('#chargeType').val();
	let totalQty		= $('#totalQty').html();
	let actualWeight	= $('#actualWeight').val();
 
	for (let key in response) {
		chargeMasterId	= Number(key);
		
		if(configuration.ApplyArticleWiseRateOnWeightType == 'true' 
		&& (getBookingType() == BOOKING_TYPE_SUNDRY_ID || configuration.multiplyRateWithPerQuantityAndWeightInFtl == 'true' && getBookingType() == BOOKING_TYPE_FTL_ID)
				&& jQuery.inArray(chargeMasterId + "", chargesToApplyArticleWiseRateOnWeightType) != -1) { //chargesToApplyArticleWiseRateOnWeightType coming from property
			if(chargeType == CHARGETYPE_ID_QUANTITY)
				qtyAmt	= Number(response[key]) * Number(quantity);
			else if(chargeType == CHARGETYPE_ID_WEIGHT)
				qtyAmt	= Number(response[key]) * Number(totalQty);
			else if(chargeType == CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(response[key]) * Number(totalQty) * distance;
			else
				qtyAmt	= Number(response[key]);
		} else if((getBookingType() == BOOKING_TYPE_SUNDRY_ID || configuration.multiplyRateWithPerQuantityAndWeightInFtl == 'true' && getBookingType() == BOOKING_TYPE_FTL_ID) 
		&& jQuery.inArray(chargeMasterId + "", aplyRateForCharges) != -1 ) { //aplyRateForCharges coming from Property
			if(chargeType == CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(response[key]) * Number(quantity) * distance;
			else
				qtyAmt	= Number(response[key]) * Number(quantity);
		} else {
			if(chargeType == CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(response[key]) * distance;
			else
				qtyAmt	= Number(response[key]);
		}
		
		if(getBookingType() == BOOKING_TYPE_SUNDRY_ID) {
			if(configuredChargeTypeIdWithCharge[chargeMasterId] != null) {
				let chargeType	= configuredChargeTypeIdWithCharge[chargeMasterId];
				
				if(chargeType == CHARGETYPE_ID_QUANTITY)
					qtyAmt	= Number(response[key]) * Number(totalQty);
				else if(chargeType == CHARGETYPE_ID_WEIGHT)
					qtyAmt	= Number(response[key]) * Number($('#chargedWeight').val());
			}
		}
		
		if(getBookingType() == BOOKING_TYPE_SUNDRY_ID 
				&& fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId]) {
			qtyAmt	= Number(response[key]);
		}
		
		tempString += chargeMasterId+'='+qtyAmt+',';
	}
	
	return tempString;
}

function chargeDisableFromRate() {
	if (configuration.DisableChargesToApplyArticleWiseRateOnWeightType == 'true') {
		var charges	= chargesToApplyArticleWiseRateOnWeightType;
		
		if(configuration.ApplyArticleWiseRateOnWeightType == 'true') {
			for (var i = 0; i < charges.length; i++) {
				if($('#charge' + charges[i]).val() > 0)
					$('#charge' + charges[i]).prop("readonly", "true");
			}
		}
	}
}

function calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId) {
	if(configuration.applyRateAuto == 'false')
		return;

	let	srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	let vehicleTypeValue	= $('#vehicleType').val();

	let vehicleTypeId		= 0;
	let packingGrpTypeId	= 0;

	if ($('#vehicleType').exists() && vehicleTypeValue != 0 && vehicleTypeValue != null) {
		let val			= vehicleTypeValue.split(",");
		vehicleTypeId	= parseInt(val[0]);
	}
	
	if(configuration.multiplyRateWithPerQuantityAndWeightInFtl == 'true' && getBookingType() == BOOKING_TYPE_FTL_ID)
		vehicleTypeId	= 1;
	
	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let chargeTypeId		= Number($('#chargeType').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else if($("#rateType").val() != null && $("#rateType").val() != '') {
		setRateType();
		
		if($("#rateType").val() == CUSTOMER_TYPE_CONSIGNEE_ID) {
			if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
				if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay)
					corporateAccountId	= $('#partyMasterId').val();
				else
					corporateAccountId	= $('#consigneePartyMasterId').val();
					
				categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
			} else {
				corporateAccountId	= partyMasterId;
				categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else {
			corporateAccountId	= partyMasterId;
			categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
			rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		}
	} else if(partyMasterId > 0) {
		corporateAccountId	= partyMasterId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else
		categoryTypeId		= CATEGORY_TYPE_GENERAL_ID;

	if(freightRatePartyId > 0)
		corporateAccountId	= freightRatePartyId;
		
	let qtyAmt = 0;
	
	for(const element of PackingGroupMappingArr) {
		if(element.packingTypeMasterId == typeofPacking)
			packingGrpTypeId	= element.packingGroupTypeId;
	}
	
	fixedChargeRateObj					= {};
	
	if(typeofPacking > 0 && $('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		let response	= null;
		
		if(configuration.calculateFixedMinimumQtyAmtWithMultipliedExtraQtyAmt == 'true' && fixedSlabAmtExist)
			response = getPackingTypeWiseMixedRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, quantity, rateTypeId, consignmentGoodsId, consigneeId);
		else
			response = getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, quantity, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response != null && response && !jQuery.isEmptyObject(response)) {
			if(configuration.calculateFixedMinimumQtyAmtWithMultipliedExtraQtyAmt == 'true' && fixedSlabAmtExist)
				getMixedSlabRates(response, chargeTypeId, quantity);
			else {
				if(applyRateForSpecificArticle && noOfArticlesAdded == 0 && chargeTypeId != CHARGETYPE_ID_QUANTITY) { // 3 is Article Type
					if(getFreightChargeForRates(response) > 0) { 
						$('#chargeType').val(CHARGETYPE_ID_QUANTITY); //  3 is Article Type
						changeOnChargeType();
						qtyAmt				= getFreightChargeForRates(response);
					}
				} else if(chargeTypeId == CHARGETYPE_ID_QUANTITY)
					qtyAmt				= getFreightChargeForRates(response);
					
				getCftWeightRate(response);
				
				let tempString		= getTempStringForRates(response, quantity);
				$('#searchRate').val(tempString);
				
				if(configuration.disableRateIfFoundFromDBOnlyInTBB == 'true') {
					if(qtyAmt > 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
						enableDisableInputField('qtyAmount', 'true');
						disableFreightCharge = true;
					}
				} else if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt > 0) {
					enableDisableInputField('qtyAmount', 'true');
					disableFreightCharge = true;
				}
					
				purefrieghtAmount	= getFreightChargeForRates(response);
				setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);
				
				if(configuration.specificFreightChargeAmount <= 0)
					displaySpecificRate(response);
				
				applyExtraCharges();
			}
		} else
			resetSpecificCharges();
	} 

	return qtyAmt;
}

function getPartyIdForMinimum() {
	var corporateAccountId		= 0;
	var billingPartyId			= Number($('#billingPartyId').val());
	var partyMasterId			= Number($('#partyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
	} else if($("#rateType").val() != null && $("#rateType").val() != '') {
		setRateType();
		
		if($("#rateType").val() == CUSTOMER_TYPE_CONSIGNEE_ID) {
			if(chargeTypeFlavour == '2' || chargeTypeFlavour == '3') {
				if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay)
					corporateAccountId	= $('#partyMasterId').val();
				else
					corporateAccountId	= $('#consigneePartyMasterId').val();
			}
		} else
			corporateAccountId	= partyMasterId;
	} else if(partyMasterId > 0)
		corporateAccountId	= partyMasterId;
	else
		corporateAccountId	= 0;
		
	return corporateAccountId;
}

function partyMinimumRates() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return 0;
	
	$('#partyMinimumRate').val("");

	let corporateAccountId	= getPartyIdForMinimum();

	if($('#wayBillType').val() != WAYBILL_TYPE_FOC && configuration.calculateSlabWisePartyMinimumRateOnChargeWeight == 'false') {
		minAmt	= Number(jsonPartyMinAMt[corporateAccountId]);
		if(minAmt) $('#partyMinimumRate').val(Number(minAmt));
	} else {
		minAmt = 0;
	};
}

function partyMinimumWeight() {
	if(isManualWayBill && configuration.ApplyRateInManual == 'false')
		return 0;
	
	if(configuration.ApplyMinimumWeightOnPartyFromRateMaster == 'true') {
		let chargeType = document.getElementById('chargeType');
	
		if(chargeType != null  && chargeType.value == CHARGETYPE_ID_QUANTITY)
			return 0;
	}

	let corporateAccountId	= getPartyIdForMinimum();
	let minWeight = 0;
	
	if(configuration.allowPackingTypeWiseMinWeightCal == 'true')
		minWeight = setPackingTypeWiseBranchMinWeight();
		
	if(minWeight == 0)
		minWeight			= Number(jsonPartyMinWeight[corporateAccountId]);

	if(isNaN(minWeight) || minWeight == 0)
		minWeight			= configuration.MinWeight;

	return minWeight;
}

function partyMinimumSlab() {
	if(isManualWayBill && configuration.ApplyRateInManual == 'false')
		return 0;

	var corporateAccountId	= getPartyIdForMinimum();

	return jsonPartyMinSlab[corporateAccountId];
}

function calculateLBHOnChargeType(obj) {
	var chargeType = document.getElementById('chargeType');

	if(chargeType.value == CHARGETYPE_ID_CUBIC_RATE || configuration.VolumetricRate == 'true') {
		var length		= $('#length').val();
		var breadth		= $('#breadth').val();
		var height		= $('#height').val();
		var lbhTotal	= document.getElementById('lbhTotal');

		lbhTotal.value = length * breadth * height;

		if(lbhTotal.value > 0) {
			if(configuration.defaultLBHOperator == LBH_OPERATOR_MULTIPLY_ID) {
				$('#actualWeight').val(Math.round((lbhTotal.value) * (configuration.defaultLBHValue)));
				
				if (configuration.TemporaryWght == 'true')
					$('#tempWeight').val(Math.round((lbhTotal.value) * (configuration.defaultLBHValue)));
			} else {
				$('#actualWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				
				if (configuration.TemporaryWght == 'true')
					$('#tempWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
			}
			
			calculateChargedWeight(obj);
			getWeightTypeRates();
		}
	}
}

function calculateCUBICOnChargeType(obj) {
	var chargeType = document.getElementById('chargeType');
	
	if(chargeType.value == CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRateCBMWise == 'true') {
		var CBMValue	= $('#CBMValue').val();
		var CBMRate		= $('#CBMRate').val();
		
		$("#charge" + FREIGHT).val(Number(CBMValue)*Number(CBMRate));
	}
}

function calcDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		if(Number($("#discountPercentage").val()) <= Number(configuration.maximumDiscountValue)) {
			$('#discount').val((parseFloat($("#discountPercentage").val()) * parseFloat($("#charge" + FREIGHT).val())) / 100);
		} else {
			showMessage('error','Discount not allowed more than '+configuration.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
}

function checkAndUpdateDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		var discountPercentage = (parseFloat($("#discount").val()) / parseFloat($("#charge" + FREIGHT).val())) * 100;

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
	$('#discountTypes').val(FREIGHT);
}

function calculateDiscountThroughMaster() {
	var DiscountMaster			= jsondata.DiscountMaster;
	var isPercent				= DiscountMaster.isPercent;
	var	discountValue			= DiscountMaster.discountValue;
	var	applicableOnCharges		= DiscountMaster.applicableOnCharges;
	var	applicableOnChargesArr	= new Array();
	var	discountAmount			= 0;
	var	chargeSum				= 0;
	applicableOnChargesArr		= applicableOnCharges.split(',');

	if(isPercent == true || isPercent == 'true'){
		for(var i = 0; i < applicableOnChargesArr.length; i++) {
			chargeSum += Number($("#charge"+applicableOnChargesArr[i]).val());
		}
		
		discountAmount = Math.round((chargeSum * discountValue) / 100);
		$('#discount').val(discountAmount);
	} else {
		for(var i = 0; i < applicableOnChargesArr.length; i++) {
			chargeSum += Number($("#charge"+applicableOnChargesArr[i]).val());
		}
		
		$('#discount').val(discountValue);
	}
}

function calcGrandtotal() {
	var amount				= getAmountToCalculateEncludedTax();
	var serviceTaxExclude	= getServiceTaxExcludeCharges();
	var	discAmount			= getDiscountedAmount(amount, serviceTaxExclude);
	var grandtotal			= parseFloat(discAmount) + parseFloat(serviceTaxExclude);

	serviceTaxAmount = 0;

	if(configuration.doNotCalculateAutomaticTax == 'false')
		grandtotal			= getGrandTotalWithTax(grandtotal, discAmount);

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
	deductChargesFromFreight();
	$("#totalAmt").val(getTotalAmt());
	
	remarkApend();
	calcGrandtotal();
	calTDSAmount(this.id);
}

function validateCCAttachedAmount(chargeMasterId){
	var chargeValueForCCAttached	= Number(configuration.chargeValueForCCAttached);
	var wayBillTypeId				= $('#wayBillType').val();
	
	if(chargeIdsForCCAttachedArr != null && wayBillTypeId != WAYBILL_TYPE_FOC) {
		if(chargeIdsForCCAttachedArr.includes(Number(chargeMasterId))) {
			var chargeVal	= Number($('#charge' + chargeMasterId).val());
			
			if($('#ccAttached').prop('checked') && chargeVal < chargeValueForCCAttached) {
				showMessage('info', 'You can not enter less then ' + chargeValueForCCAttached + ' /-');
				$('#charge' + chargeMasterId).val(chargeValueForCCAttached);
				return false;
			}
		}
	}
	
	return true;
}

function checkChargesRates(obj) {
	
	let chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	
	if(configuration.setChargeOnCCAttachedConfig == 'true' && !validateCCAttachedAmount(chargeMasterId))
		return false;
	
	let chargeRate		= null;
	let actualInput		= Number($('#actualInput'+chargeMasterId).val());
	
	if (chargesRates != null) {
		if(chargesRates[chargeMasterId])
			chargeRate		= chargesRates[chargeMasterId];
		
		if (chargeRate && chargeRate != null) {
			let editMaxAmount	= 0;
			let editMinAmount	= 0;
			let editMaxValue	= 0;
			let chargeValue		= obj.value;

			if (chargeRate.editAmountType == EDIT_AMOUNT_TYPE_SIMPLE) {
				editMaxAmount	= chargeRate.editMaxAmount;
				editMinAmount	= chargeRate.editMinAmount;
				editMaxValue	= chargeRate.editMaxValue;
			} else if (chargeRate.editAmountType == EDIT_AMOUNT_TYPE_PERCENTAGE) {
				editMaxAmount	= (actualInput * chargeRate.editMaxAmount) / 100;
				editMinAmount	= (actualInput * chargeRate.editMinAmount) / 100;
				editMaxValue	= (actualInput * chargeRate.editMaxValue) / 100;
			}
			
			if (editMinAmount > 0 && actualInput > chargeValue && ((actualInput - chargeValue) > editMinAmount)) {
				alert("Enter Amount is less than this " + (actualInput - editMinAmount) + " amount.");
				$('#charge' + chargeMasterId).val(chargeRate.chargeMinAmount);
			} else if (editMinAmount > 0 && chargeValue < editMinAmount) {
				alert("Enter Amount is less than this " + editMinAmount + " amount.");
				$('#charge' + chargeMasterId).val(chargeRate.chargeMinAmount);
			} else if (editMaxAmount > 0 && ((chargeValue - actualInput) > editMaxAmount)) {
				alert("Enter Amount is more than this " + (actualInput + editMaxAmount) + " amount.");
				$('#charge' + chargeMasterId).val(chargeRate.chargeMinAmount);
			} else if (editMaxValue > 0 && ((actualInput - chargeValue) > editMaxValue)) {
				alert("You can not enter less than this " + (actualInput - editMaxValue) + " amount.");
				$('#charge' + chargeMasterId).val(chargeRate.chargeMinAmount);
			}
		}
	}
	
	if (configuration.skipDoorDeliveryChargeValidationOnLrType.split(',').includes(getWayBillTypeId().toString()))
		return true;
	else if(configuration.AllowEnableDoorDelivery == 'true' && (chargeMasterId == configuration.doorDeliveryChargeId) && configuration.DoorDeliveryChargeValidate != 'true') {
		var isReadOnly = document.getElementById('charge' + chargeMasterId).readOnly;

		if(((configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == 'true' 
			|| configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == true) && Number(maximumSlabValue) > 0)) {	
			if(Number($('#chargedWeight').val()) <= Number(maximumSlabValue) && isReadOnly != true
				&& !validateInput(1, 'charge' + chargeMasterId, 'charge' + chargeMasterId, 'error', 'Please Enter Door Delivery Charge !')) {
				setTimeout(function(){ document.getElementById('charge' + chargeMasterId).focus(); }, 10);
				return false;
			}
		} else if (isReadOnly != true && !validateInput(1, 'charge' + chargeMasterId, 'charge' + chargeMasterId, 'error', 'Please Enter Door Delivery Charge !')) { 
			setTimeout(function(){ document.getElementById('charge' + chargeMasterId).focus(); }, 10);
			return false;
		}
	}

	if(configuration.editDeliveryAtBasedOnDlyChrges == 'true' && (Number(chargeMasterId) == Number(configuration.doorDeliveryChargeId))) {
		if(Number($('#charge' + chargeMasterId).val()) > 0 && $('#deliveryTo').val() != DELIVERY_TO_DOOR_ID
		|| configuration.selectDoorDeliveryManuallyWithoutDoorDeliveryCharge == 'true' && $('#deliveryTo').val() == DELIVERY_TO_DOOR_ID)
			$('#deliveryTo').val(DELIVERY_TO_DOOR_ID);
		else
			$('#deliveryTo').val(configuration.DefaultDeliveryAt);
	}
	
	if(configuration.checkChargesAfterApplyRateInAuto == 'true'){
		actualInput		= Number($('#actualChargeAmount'+chargeMasterId).val());
		let chargeValue		= obj.value;
		
		if(chargeValue < actualInput && actualInput > 0){
			showMessage('info', 'You can not enter less than this '+actualInput+' /-');
			setTimeout(function(){ $('#charge'+chargeMasterId).focus(); }, 0);
			$('#charge' + chargeMasterId).val(actualInput);
		}
	}
	
	if(configuration.applyDiscountThroughMaster == 'true' && jsondata.DiscountMaster != undefined)
		calculateDiscountThroughMaster();
		
	includeLoadingChargeOnFreight();
	calculateFreightOnChargesChange();
	validateRiskaCovrageCharge();
	excludeLoadingChargeOnFreight();
}

function setPartyMinimumRates() {
	let minimumParty = 0;
	
	getFilteredPartyMinimumRate();
	
	if($('#partyMinimumRate').val() != "")
		minimumParty = $('#partyMinimumRate').val();

	if (minimumParty > Number($('#charge' + FREIGHT).val())) {
		$("#freightAmountRate").fadeIn(500);
		setTimeout(function () {$("#freightAmountRate").fadeOut(500);}, 3000);
		$('#charge' + FREIGHT).val(minimumParty);
	}
}

function getFilteredPartyMinimumRate() {
	let	srcBranchId			= Number(getSourceBranchForRate());
	let destBranchId		= Number($('#destinationBranchId').val());
	let userInput			= Number($('#chargedWeight').val());
	let chargeType			= $('#chargeType').val();
	
	if(configuration.calculateSlabWisePartyMinimumRateOnChargeWeight == 'true' && chargeType != CHARGETYPE_ID_WEIGHT) {
		$('#partyMinimumRate').val("");
		return;
	}
	
	let corporateAccountId	= getPartyIdForMinimum();
	let partyMinimumAmtArr	= slabWisePartyMinimumAmtHM[corporateAccountId];

	if(configuration.calculateSlabWisePartyMinimumRateOnChargeWeight == 'true'
		&& (corporateAccountId < 0 || corporateAccountId > 0 && partyMinimumAmtArr == null))
		$('#partyMinimumRate').val("");
	
	if(partyMinimumAmtArr != null && partyMinimumAmtArr.length > 0) {
		for(const element of partyMinimumAmtArr) {
			if(element.slabMasterId > 0 && userInput >= element.minWeight && userInput <= element.maxWeight && srcBranchId == element.branchId && destBranchId == element.destinationBranchId
			&& element.chargeSectionId == CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID) {
				 $('#partyMinimumRate').val(element.rate);
				 break;
			}
		}
	} else if(configuration.destinationWiseMinimumFreight == 'true' && wayBillRates != null && wayBillRates != undefined && wayBillRates.length > 0) {
		let filteredRate = wayBillRates.filter(function (el) {
					return srcBranchId == el.branchId && destBranchId == el.destinationBranchId && corporateAccountId == el.corporateAccountId
						&& el.chargeSectionId == CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID
				});
				
		if(filteredRate.length == 0) {
			filteredRate = wayBillRates.filter(function (el) {
					return srcBranchId == el.branchId && destBranchId == el.destinationBranchId && el.corporateAccountId == 0
						&& el.chargeSectionId == CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID
				});
		}
		
		if(filteredRate.length > 0)
			$('#partyMinimumRate').val(filteredRate[0].rate);
	}
}

function calculateWeightAndQuantityWiseFreightAmount(chargeMasterId) {
	let qtyAmnt			= 0;
	let weightAmnt		= 0;
	let weigthFreightRate = $('#weigthFreightRate').val();
	let chargeType	= $('#chargeType').val();
	
	if(chargeType == CHARGETYPE_ID_WEIGHT && configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true')
		$('#charge' + chargeMasterId).val(0);
	
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
	
	if (configuration.isQtyAmntAndWeightAmntCompare == 'true') {
		if(chargeType == CHARGETYPE_ID_WEIGHT && configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true' && isFixedSlab) {
			$('#charge' + FREIGHT).val(Number(weigthFreightRate));
			
			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(weigthFreightRate));
		} else if (qtyAmnt > weightAmnt) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(qtyAmnt));
		} else {
			if(chargeMasterId == LR_CHARGE)
				$('#lrChargeValue').val(Number(weightAmnt));
			
			if(configuration.calculateLoadingChargeOnFreightAmount == 'false')
				$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		}
	} else {
		if(configuredChargeTypeIdWithCharge[chargeMasterId] != null)
			chargeType	= configuredChargeTypeIdWithCharge[chargeMasterId];

		if(chargeType == CHARGETYPE_ID_QUANTITY) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(qtyAmnt));
		} else if(chargeType == CHARGETYPE_ID_WEIGHT) {
			if(chargeMasterId == LR_CHARGE)
				$('#lrChargeValue').val(Number(weightAmnt));

			//if(weightAmnt > 0)
				$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));

			if(configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true' && isFixedSlab)
				$('#charge' + FREIGHT).val(Number(weigthFreightRate));
		} else if(chargeType == CHARGETYPE_ID_KILO_METER || chargeType == CHARGETYPE_ID_FIX) {
			$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		}
	}
	
	if(configuration.disableChargesIfFixedInRateMaster == 'true' && chargeMasterId != FREIGHT) {
		$('#charge' + chargeMasterId).removeAttr("readonly");
		
		if(fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId])
			disableCharge(chargeMasterId);
	}
}

function calculateLRLevelCharges(chargesRates, chargeMasterId, masterIdsArr) {
	if (configuration.applyLRLevelChargesOnlyInWeight == 'true' && $('#chargeType').val() != CHARGETYPE_ID_WEIGHT)
		chargesRates = null;

	if(configuration.AllowEnableDoorDelivery == 'true') {
		if($("#deliveryTo").val() ==  DELIVERY_TO_DOOR_ID && Number($('#wayBillType').val()) != WAYBILL_TYPE_FOC) {
			$('#charge' + configuration.doorDeliveryChargeId).removeAttr("readonly");
		} else {
			$('#charge' + configuration.doorDeliveryChargeId).val(0);
			$('#charge' + configuration.doorDeliveryChargeId).prop("readonly", "true");
		}
	} else if(configuration.disableSpecificCharges == 'false') {
		$('#charge' + chargeMasterId).removeAttr('disabled');
		$('#charge' + chargeMasterId).removeAttr("readonly");
	}

	if(configuration.blockConvenienceChargeOnBookingScreen == 'true')
		$('#charge' + CONVENIENCE).prop("readonly", "true");
	else
		$('#charge' + CONVENIENCE).removeAttr("readonly");
	
	setNonEditableGSTCharge();
	setNonEditableFreightCharge();
	setNonEditableRiskCoverageCharge();
	setNonEditableDocCharge();
	
	if (chargesRates != null) {
		let chargeRate	= chargesRates[chargeMasterId];
		
		if (chargeRate) {
			if (!chargeRate.applicable) {
				$('#charge' + chargeMasterId).prop("disabled", "true");

				if(configuration.resetAmountForChargeNotApplicable == 'true')
					$('#charge' + chargeMasterId).val(0);
			} else
				$('#charge' + chargeMasterId).removeAttr('disabled');
			
			if (!chargeRate.editable) {
				let	enableAllChargesForGroupAdmin	= configuration.enableAllChargesForGroupAdmin;
				
				if(configuration.setSubRegionWiseGroupLevelFixCharge == 'true') {
					if(isSubregionForGroupLevelFixCharge() && (enableAllChargesForGroupAdmin == 'true' && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN
					|| enableAllChargesForGroupAdmin == 'false'))
						$('#charge' + chargeMasterId).prop("readonly", "true");
				} else if(configuration.setRegionWiseGroupLevelFixCharge == 'true') {
					if(isRegionForGroupLevelFixCharge() && (enableAllChargesForGroupAdmin == 'true' && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN
					|| enableAllChargesForGroupAdmin == 'false'))
						$('#charge' + chargeMasterId).prop("readonly", "true");
				} else
					$('#charge' + chargeMasterId).prop("readonly", "true");
			} else
				$('#charge' + chargeMasterId).removeAttr("readonly");

			if(configuration.AllowEnableDoorDelivery == 'true' && $("#deliveryTo").val() ==	 DELIVERY_TO_DOOR_ID)
				$('#charge' + configuration.doorDeliveryChargeId).removeAttr("readonly");

			if ($('#charge' + chargeMasterId).val() < chargeRate.chargeMinAmount) {
				if (chargeRate.chargeMinAmount != 0) {
					if(chargeRate.ispercent) {
						if(($('#charge' + chargeRate.chargeApplicableOn).val()) > 0)
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, 1));	
						else if(chargeRate.fieldId > 0)
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.fieldId, 2));
						else
							$('#charge' + chargeMasterId).val(0);
					} else if(configuration.setRatesChargeTypeWise == 'true' && _.contains(masterIdsArr, chargeMasterId)) {
						if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT && Number($('#chargedWeight').val()) >= Number(configuration.minWeightForApplyRates))
							$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
					} else if(configuration.AllowEnableDoorDelivery == 'true' && chargeMasterId == configuration.doorDeliveryChargeId) {
						let deliveryTo = $('#deliveryTo').val();
							
						if(deliveryTo ==  DELIVERY_TO_DOOR_ID)
							$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
						else
							$('#charge' + chargeMasterId).val(0);
					} else
						$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
				} else
					$('#charge' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
			}

			$('#actualInput' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
			
			let chargeIdsToEnableSpecificChargesArr	= (configuration.chargeIdsToEnableSpecificCharges).split(',');
			
			if(configuration.disableChargeIfFoundFromDB == 'true' && Number($('#charge' + chargeMasterId).val()) > 0 && (!isValueExistInArray(chargeIdsToEnableSpecificChargesArr, chargeMasterId)))
				$('#charge' + chargeMasterId).prop("readonly", true);
		}
	}

	if(configuration.disableBookingCharges == 'true' && !isManualWayBill)
		$('#charge' + chargeMasterId).prop("readonly", "true");
	
	if(configuration.calculateLateNightChargeOnFreightAmount == 'true' && !isManualWayBill
		&& currentTimeFromServer != null && currentTimeFromServer != undefined
		&& currentTimeFromServer > configuration.lateNightStartTime && currentTimeFromServer < configuration.lateNightEndTime)
			$('#charge'+ LATE_NIGHT).val(Math.round((Number($('#charge'+ FREIGHT).val()) * Number(configuration.calculateLateNightChargeOnFreightAmountPercentageRate))/100));
}

function getChargesIdForChargeTypeWiseRate() {
	var masterIdsArr	= new Array();
	
	if(configuration.setRatesChargeTypeWise == 'true') {
		var masterId		= (configuration.chargeMasterIdForChargeTypeWiseRate).split(",");

		for(var i = 0; i < masterId.length; i++) {
			masterIdsArr.push(Number(masterId[i]));
		}
	}
	
	return masterIdsArr;
}

function resetDisabledCharges() {
	if(configuration.disableRateIfFoundFromDB == 'true') {
		if(jsondata.charges) {
			var chargeTypeModel = jsondata.charges;
			
			for (var i = 0; i < chargeTypeModel.length; i++) {
				var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;
				
				if(configuration.disableChargeIfFoundFromDB == 'true' && Number($('#charge'+chargeMasterId).val()) <= 0)
					$('#charge' + chargeMasterId).prop("readonly", false);
			}
		}
		
		if($('#weigthFreightRate').val() <= 0)
			$('#weigthFreightRate').prop("readonly", false);
	}
}

function applyRates() {
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC) {
		resetOnChargeTypeExcludingPackageDetails();
		return true;
	}
	
	if(Number($("#chargeType").val()) == CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRateCBMWise == 'true')
		return;
	
	if(isManualWayBill && configuration.ApplyRateInManual == 'false') {
		if(jsondata.charges) {
			let chargeTypeModel = jsondata.charges;
			
			for (const element of chargeTypeModel) {
				calculateWeightAndQuantityWiseFreightAmount(element.chargeTypeMasterId);
			}
		}

		frightCalcForST();
		calcTotal();

		return false;
	}
	
	chargesRates		= getChargesRates();
	
	let masterIdsArr	= getChargesIdForChargeTypeWiseRate();
	getFilteredChargesToCalculateFSCharge();

	if(jsondata.charges) {
		let chargeTypeModel = jsondata.charges;
		
		for (const element of chargeTypeModel) {
			let chargeMasterId	= element.chargeTypeMasterId;

			/*
			 * Calculate Weight And Quantity Wise Freight Charge with Comparision
			 */
			calculateWeightAndQuantityWiseFreightAmount(chargeMasterId);

			/*
			 * Calculate LR Level Charges
			 */
			calculateLRLevelCharges(chargesRates, chargeMasterId, masterIdsArr);
			calculateFSOnOtherCharge(chargeMasterId);

			if(configuration.wayBillChargeWiseRemarkNeeded == 'true')
				showHideRemark(chargeMasterId); //defined in WayBillSetReset.js

			if(configuration.checkChargesAfterApplyRateInAuto == 'true' && !isManualWayBill) {
				var chargeIdsToAvoidCheckInAutoArr = configuration.chargeIdsToAvoidCheckInAuto.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInAutoArr.includes(Number(chargeMasterId)))
					setHiddenValuesForCharges(chargeMasterId);
			}

			if(configuration.checkChargesAfterApplyRateInManual == 'true' && isManualWayBill) {
				var chargeIdsToAvoidCheckInManual = configuration.chargeIdsToAvoidCheckInManual.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInManual.includes(Number(chargeMasterId)))
					setHiddenValuesForCharges(chargeMasterId);
			}
		}
	}
	
	if(configuration.showExcludeCommissionOption == 'true') {
		freightToCalculate	= $('#charge' + FREIGHT).val();
		
		if($('#excludeCommission').exists() && $('#excludeCommission').is(":visible") && $('#excludeCommission').prop( "checked")) {
			$('#charge' + FREIGHT).val(Math.round((Number($('#charge' + FREIGHT).val()) * 100) / (100 - commissionValue)));
				
			if (chargesRates != null) {
				let newChargeRates	= chargesRates[SERVICE_CHARGE];
					
				if(newChargeRates != null && $('#charge' + FREIGHT).val() > 0)
					$('#charge' + SERVICE_CHARGE).val(Math.round((newChargeRates.chargeMinAmount * $('#charge' + FREIGHT).val()) / 100));
			}
		}
	}
	
	var wayBillTypeId = $('#wayBillType').val();
	
	//Default LR level charges
	if($('#charge' + LR_CHARGE).val() <= 0) $('#charge' + LR_CHARGE).val(Math.round(configuration.LRCharge));
	if($('#charge' + STATISTICAL).val() <= 0) $('#charge' + STATISTICAL).val(configuration.defaultStatisticalCharge);
	if($('#charge' + STATIONARY_BOOKING).val() <= 0) $('#charge' + STATIONARY_BOOKING).val(configuration.DefaultStationaryCharge);
	if($('#charge' + STATIONARY_CHARGE).val() <= 0) $('#charge' + STATIONARY_CHARGE).val(configuration.DefaultStationaryCharge);
	
	if(configuration.allowConditionalLRLevelCharges == 'true') {
		if(wayBillTypeId != WAYBILL_TYPE_PAID) $('#charge' + LR_CHARGE).val(0);
		if(wayBillTypeId == WAYBILL_TYPE_TO_PAY && $("#actualWeight").val() > 20) $('#charge' + STATISTICAL).val(30);
		if(wayBillTypeId != WAYBILL_TYPE_TO_PAY) $('#charge' + STATISTICAL).val(0);
	}
	
	if(Number(configuration.fixedMinimumIAndSChargeAmount) > 0)
		$('#charge' + I_AND_S).val(configuration.fixedMinimumIAndSChargeAmount);

	if(configuration.applyLoadingChargeOnFreightChargeAmt == 'true') {
		var totalConsignmentQuantity	= getTotalAddedArticleTableQuantity();
		var wayBillTypeId	= getValueFromInputField('wayBillType');
		
		if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
			if(Number($('#charge' + FREIGHT).val()) > Number(configuration.minimumFreightChargeValueToApplyRate))
				$('#charge' + LOADING).val(10 * totalConsignmentQuantity);
			else
				$('#charge' + LOADING).val(0);
		} else
			$('#charge' + LOADING).val(0);
	}
	
	includeLoadingChargeOnFreight();
	excludeLoadingChargeOnFreight();
	validateRiskaCovrageCharge();

	loadingChargeAmount	= $('#charge' + LOADING).val();
	makeChargeEditable(); // Called from Consignment.js file
	calculateCarrierRiskPerArticle();
	partyMinimumRates();
	setPartyMinimumRates();
	frightCalcForST();
	checkIfPartyIsExempted();
	totalWithExtraAddedAmount();
	applyExtraCharges();
	chargeDisableFromRate();
	disableChargesForAgentBranches();
	disableChargesForDoorPickUpCharge();
	hideAllRateOnBookingPage();
	setFixChargesOnBookingTypeFTL();//commonFunctionForCreateWayBill.js
	setFixChargesOnBookingTypeSundry();//commonFunctionForCreateWayBill.js
	setFixChargesOnBookingTypeDDV();//commonFunctionForCreateWayBill.js
	setStPaidByBasisOfBillSelection();//commonFunctionForCreateWayBill.js
	setStPaidByBasisOfDivisionSelection();//commonFunctionForCreateWayBill.js
	
	if(configuration.checkConsignmentGoodForApplyRate == 'true')
		chargesForGroup();
	
	if(configuration.applyDiscountThroughMaster == 'true' && jsondata.DiscountMaster != undefined)
		calculateDiscountThroughMaster();
	
	if(LRTypeChargeIdHMToShowCharge) {
		for(var key in LRTypeChargeIdHMToShowCharge) {
			var lrTypeList	= LRTypeChargeIdHMToShowCharge[key];
			
			if(!isValueExistInArray(lrTypeList, $('#wayBillType').val()))
				$("#charge" + key).val(0);
		}
	}
	
	if((isFreightChargeEnableBranchListForTopay && Number($('#typeofPackingId1').html()) == PACKING_TYPE_NAG && parseInt($('#wayBillType').val()) == WayBillType.WAYBILL_TYPE_TO_PAY)
		|| (isFreightChargeEnableBranchList && Number($('#typeofPackingId1').html()) == PACKING_TYPE_GANTH && parseInt($('#wayBillType').val()) == WayBillType.WAYBILL_TYPE_CREDIT)) {
		$('#charge' + FREIGHT).removeAttr("readonly");
	}
	
	if(configuration.customCalculateArticleChargeOnPerArticle == 'true' && $('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
		$('#charge' + ARTICLE_BOOKING).val(Number($('#totalQty').html()) * configuration.rateToCalculateArticleCharge);
		$('#charge' + ARTICLE_BOOKING).prop("readonly", true);
	}

	disableCharge(REIMBURSEMENT_OF_INSURANCE_PREMIUM);
	
	setRatesOnDeclaredValue();
	setInternalStateCharges();
	chargeExemptedForBillingParty();
	validateFOVOnDeclareVal();
	getFixedHamaliSlabRates();
	setFreightAndCrossing();
	setRegionWiseFixedCharge();
	calculateArticleBasedCharge();
	calculateLoadingChargeOnFreightSlab();
	
	if(showRegionWiseMovementType)
		setDirectAndCrossingChargesOnMovementType();
	
	if(configuration.srcDestSubregionAndBranchWiseSkipCharges == 'true' && jsondata.charges) {
		const skipForSubRegion = configuration.skipChargesForSrcDestSubRegionsAndViceVersa.split(",").map(s => s.trim()).filter(s => s !== "")
			.map(entry => { const [src, dest, charge] = entry.split("_").map(Number);
			return { src, dest, charge };
		});

		const skipForBranch = configuration.skipChargesForSrcSubRegionDestBranchAndViceVersa.split(",").map(s => s.trim()).filter(s => s !== "")
			.map(entry => { const [src, destBranch, charge] = entry.split("_").map(Number);
			return { src, destBranch, charge };
		});
		
		let chargeTypeModel = jsondata.charges;
				
		for (const element of chargeTypeModel) {
			if(shouldSkipRate(element.chargeTypeMasterId, skipForSubRegion, skipForBranch))
				$('#charge' + element.chargeTypeMasterId).val(0);
		}
	}
	
	calcTotal();
}

/*
 * LR Level Charges
 */
function calculateCustomChargesAmount(chargeMasterId, chargeValue, chargeUnit) {
	chargeAmount	= chargeValue;
	
	if(chargeUnit > 0) {
		if(chargeUnit == CHARGETYPE_ID_WEIGHT) {
			if ($("#chargedWeight").val() > 0)
				chargeAmount = (chargeValue * $("#chargedWeight").val());
		} else if(chargeUnit == CHARGETYPE_ID_QUANTITY) {
			let totalQty	= 0;
			
			if(configuration.isPackingGroupTypeWiseChargeAllow == 'true')
				totalQty	= totalConsignmentQuantity;
			else
				totalQty	= getTotalAddedArticleTableQuantity();
			
			chargeAmount	= (chargeValue * totalQty);
		}
	} else if(isRatePerArticle(chargeMasterId)) {
		let totalQty	= 0;
					
		if(configuration.isPackingGroupTypeWiseChargeAllow == 'true')
			totalQty	= totalConsignmentQuantity;
		else
			totalQty	= getTotalAddedArticleTableQuantity();
					
		chargeAmount	= (chargeValue * totalQty);
	}
	
	if(chargeMasterId == LOADING && configuration.isPackingGroupWiseRateApplicable == 'true') {
		let loadingCharge		= document.getElementById('charge'+chargeMasterId);
			
		if(loadingCharge)
			chargeAmount = (chargeValue * totalConsignmentQuantity);
	}

	return chargeAmount;
}

function getFlavourWiseRates(customerId, partyType){
	if(configuration.applyRateAuto == 'false')
		return;

	resetArticleWithTable();
		
	switch(Number(configuration.ChargeTypeFlavour)) {
	case 0:
	case 1:
		if(partyType == CUSTOMER_TYPE_CONSIGNOR_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		break;
	case 2:
		if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && partyType == CUSTOMER_TYPE_CONSIGNEE_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		else if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
			if(partyType != CUSTOMER_TYPE_CONSIGNEE_ID || configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'true')
				getRates($('#destinationBranchId').val(), customerId, partyType);
		} else if($('#wayBillType').val() == WAYBILL_TYPE_PAID && partyType == CUSTOMER_TYPE_CONSIGNOR_ID)
			getRates($('#destinationBranchId').val(), customerId, partyType);
		break;
	}
}

function frightCalcForST() {
	var fright = document.getElementById('charge' + FREIGHT);
	var wayBillTypeId  = $('#wayBillType').val();

	if (fright == null)
		return;

	if (stPaidBySelectionByParty)
		selectSTPaidBy(TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt();
	else if(!setDefaultStPaidBy)			
		setDefaultSTPaidBy(wayBillTypeId);
}

function setLrChargeForNwParty() {
	if(chargeTypeFlavour == '4')
		return;

	var partyId = parseInt($('#partyMasterId').val());
	
	if(partyId == 0)
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

function getAmntFromQtyAmntAr(chargeMasterId,quantityTypeArr) {
	var amount = 0;
	var sliptedByUnderScore = new Array();
	var sliptedByCommas = new Array();
	
	for(const element of quantityTypeArr) {
		sliptedByUnderScore		= element.split("_");
		sliptedByCommas			= sliptedByUnderScore[1].split(",");

		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true') {
			if(sliptedByCommas[0].split("=")[0] == chargeMasterId) {
				amount = parseFloat(amount) + parseFloat(sliptedByCommas[0].split("=")[1]);
				break;
			}
		} else {
			for(const element of sliptedByCommas) {
				if(element.split("=")[0] == chargeMasterId) {
					if(fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId])
						amount = parseFloat(element.split("=")[1]);
					else
						amount = parseFloat(amount) + parseFloat(element.split("=")[1]);
					
					break;
				}
			}
		}
		
		if(configuration.allowConditionalRouteWiseCharges == 'true') {
			var hamaliCharge = $("#chargedWeight").val() * 0.50;
			
			if(sliptedByCommas[0].split("=")[0] == HAMALI) {
				if(hamaliCharge > sliptedByCommas[0].split("=")[1])
					$("#charge" + sliptedByCommas[0].split("=")[0]).val(hamaliCharge);
				else
					$("#charge" + sliptedByCommas[0].split("=")[0]).val(sliptedByCommas[0].split("=")[1]);
			}
		}
	}

	if($('#chargeType').val() == CHARGETYPE_ID_FIX && chargeMasterId == FREIGHT) {
		var fixAmt = 0;

		if($('#fixAmount').exists() && $('#fixAmount').val() != '')
			fixAmt = Number($('#fixAmount').val());

		amount = fixAmt;
	}

	return amount;
}

function getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr) {
	var amount = 0;
	var sliptedByCommas = new Array();

	if(configuration.calculateSlabWiseFixedWeightRateAmtOnChargeWeight == 'true'  && $('#chargeType').val() == CHARGETYPE_ID_WEIGHT && isFixedSlab)
		return amount;
		
	for(const element of weightTypeArr) {
		sliptedByCommas = element.split(",");
		
		for(var j = 0; j < sliptedByCommas.length; j++) {
			if(sliptedByCommas[j].split("=")[0] == chargeMasterId) {
				if(fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId])
					amount = parseFloat(sliptedByCommas[j].split("=")[1]);
				else
					amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
				
				break;
			}
			
			if(configuration.allowConditionalRouteWiseCharges == 'true') {
				var hamaliCharge = $("#chargedWeight").val() * 0.50;
				
				if(sliptedByCommas[j].split("=")[0] == HAMALI) {
					if(hamaliCharge > sliptedByCommas[j].split("=")[1])
						$("#charge"+sliptedByCommas[j].split("=")[0]).val(hamaliCharge);
					else
						$("#charge"+sliptedByCommas[j].split("=")[0]).val( sliptedByCommas[j].split("=")[1]);
				}
			}
		}
	}

	if($('#chargeType').val() == CHARGETYPE_ID_FIX && chargeMasterId == FREIGHT) {
		var fixAmt = 0;

		if($('#fixAmount').exists() && $('#fixAmount').val() != '')
			fixAmt = Number($('#fixAmount').val());

		amount = fixAmt;
	}
	
	return amount;
}

function calculateChargeMinAmount(chargeMasterId, chargeMinAmount, chargeApplicableOnId,filter){
	var calculateChargeMinAmount = chargeMinAmount; 
	
	if(filter == 1){
		var chargeApplicableOn	= ($('#charge' + chargeApplicableOnId).val());
		
		if( chargeApplicableOn > 0)
			calculateChargeMinAmount = (calculateChargeMinAmount*chargeApplicableOn) / 100;
	} else if(filter == 2 && chargeApplicableOnId == FIELD_ID_DECLARED_VALUE) {
		if ($("#declaredValue").val() > 0) {
			var declaredValue		= $('#declaredValue').val();
			var chargeEle			= document.getElementById('charge' + chargeMasterId);
				
			if(chargeEle && declaredValue > 0)
				calculateChargeMinAmount = ((calculateChargeMinAmount * declaredValue) / 100);
		} else
			calculateChargeMinAmount = 0;
	}

	var decVal = $('#declaredValue').val();

	if( configuration.isRiskAllocationAllow && chargeMasterId == CARRIER_RISK)
		return Math.round(calculateChargeMinAmount);

	if(configuration.compareFOVWithDecVal == 'true' && chargeMasterId == FOV && decVal < 200000)
		return 0;
	
	if(configuration.roundoffServiceCharge)
		return Math.round(calculateChargeMinAmount);
	
	return calculateChargeMinAmount;
} 

function setBookingChargeAmt(obj) {
	var chargeTypeMasterId = (obj.id).split("_");
	$('#charge' + chargeTypeMasterId[1]).val($("#"+obj.id).val());
}

/*
 * Apply AOC Charge on Total of every charge except AOC charge
 */
function applyAOCCharge() {

	if(configuration.applyAOCChargeOnTotalOfAllCharges == 'true') {
		var chargesToApplyAOCCharge		= configuration.chargesToApplyAOCCharge; 

		/*
		 *	chargesToApplyAOCCharge - coming from property file
		 *	Put charges with comma separated without space in property file
		 */

		var chargesArr					= chargesToApplyAOCCharge.split(',');

		var chargesVal		= 0;

		for(i = 0; i < chargesArr.length; i++) {
			chargesVal		+= parseFloat(getValueFromInputField('charge' + chargesArr[i]));
		}

		if(isManualWayBill)
			chargesVal		= 0;

		var aocCharge		= (chargesVal * parseFloat(AOCPercentageValue)) / 100;

		if(aocCharge % 1 != 0)
			aocCharge		= Math.round(aocCharge * 100) / 100;

		//AOCPercentageValue		comming from Rate master

		if(isManualWayBill)
			setValueToHtmlTag('SpecificRate_' + AOC, 0);
		else
			setValueToTextField('charge' + AOC, Math.round(aocCharge));

		setValueToHtmlTag('label' + AOC, 'AOC ' + AOCPercentageValue + ' %');
	}
}

/*
 * Reset AOC charge if aoc value is less than 0
 */
function resetAOC() {
	var aocVal	= getValueFromInputField('charge' + AOC);

	if(aocVal <= 0)
		AOCPercentageValue = 0;
}

/*
 * Apply extra charge for FOV on Declared Value
 * 
 */

function applyExtraCharges() {
	if(configuration.ApplyExtraChargeForFOVOnDeclareValue == 'false')
		return;

	var wayBillTypeId	= getValueFromInputField('wayBillType');

	if(wayBillTypeId != WAYBILL_TYPE_FOC) {
		var fovCharge		= getValueFromInputField('charge' + FOV);
		var chargedWeight	= getValueFromInputField('chargedWeight');

		if(chargedWeight > 0) {
			var declaredValue = 0;

			declaredValue		= $('#declaredValue').val()

			if(declaredValue == '' || declaredValue == 'Declared Value') {
				declaredValue		= 0;
				setValueToTextField('declaredValue', '0');
			}

			// FOVChargeValue	coming from Rate Master

			var fovCharge		= parseInt(declaredValue) * FOVChargeValue / 100;

			if(fovCharge % 1 != 0)
				fovCharge		= Math.round(fovCharge * 100) / 100;

			if(!isManualWayBill)
				setValueToTextField('charge' + FOV, Math.round(fovCharge));
			else if($('#SpecificRate_' + FOV).exists())
				setValueToHtmlTag('SpecificRate_' + FOV, fovCharge);
			else
				setValueToHtmlTag('SpecificRate_' + FOV, 0);
		}

		applyAOCCharge();
		calcTotal();
	}
}

/*
 * Change Freight amount if Freight amount not equals to Qty Amount
 * set Charge type to fix
 */
function changeFreightAmount() {
	if(configuration.ChangeFreightAmount == 'false')
		return;

	var consignmentAmount = $('#qtyAmount').val();
	var freightAmount	  = getValueFromInputField('charge' + FREIGHT);

	if(consignmentAmount != freightAmount) {
		if(consignmentAmount == '')
			consignmentAmount	= 0;

		setValueToTextField('charge' + FREIGHT, consignmentAmount);
		setValueToTextField('chargeType', CHARGETYPE_ID_FIX);
	}

	calcTotal();
}

/*
 * Get Rate for LMT ON weight
 * 
 * Added by		- Anant Chaudhary	14-12-2016
 */
function ajaxCallForRates() {
	if(configuration.applyWeightTypeRateForLMT == 'false')
		return;

	formChargeRatesDB = 0;

	if(getValueFromInputField('wayBillType') != WAYBILL_TYPE_FOC
			&& getValueFromInputField('actualWeight') > 0) {

		if(getValueFromInputField('bookingType') == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
			setValueToTextField('billingPartyId', 0);
			setValueToTextField('partyMasterId', 0);
		}

		var chargedWeight	= $('#chargedWeight').val();

		if($('#chargedWeight').val() == '')
			chargedWeight	= 0;

		if (getValueFromInputField('billingPartyId') > 0)
			ajaxForWeightForCorp(chargedWeight);
		else if(getValueFromInputField('partyMasterId') > 0)
			ajaxForWeightForCorp(chargedWeight);
		else
			ajaxForWeightQtyCompare(chargedWeight);

		setBillingPartyIdInDDDVCase($('#wayBillType').val());
	} else {
		resetCharges();
		resetSpecificCharges();
		setValueToTextField('qtyAmount', 0);
		setValueToTextField('chargeType', configuration.DefaultChargeType);
	}
}

function resetAjaxCallForRates() {
	if(configuration.applyWeightTypeRateForLMT == 'false')
		return;

	if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		var actualWeight	= $('#actualWeight').val();
		var chargedWeight	= $('#chargedWeight').val();

		if($('#chargedWeight').val() == '')
			chargedWeight	= 0;

		if($('#actualWeight').val() == '')
			actualWeight	= 0;

		if(actualWeight > 0 && chargedWeight > 0) {
			if (getValueFromInputField('billingPartyId') > 0)
				ajaxForWeightForCorp(chargedWeight);
			else if(getValueFromInputField('partyMasterId') > 0)
				ajaxForWeightForCorp(chargedWeight);
			else
				ajaxForWeightQtyCompare(chargedWeight);
		}
	}
}

function changeAmountOnChargeType() {
	var wayBillType		= getValueFromInputField('wayBillType');
	var partyMasterId	= getValueFromInputField('partyMasterId');
	var bookingType		= 0;
	var chargeType		= getValueFromInputField('chargeType');

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(wayBillType != WAYBILL_TYPE_FOC && wayBillType != WAYBILL_TYPE_CREDIT && partyMasterId <= 0
			&& bookingType != DIRECT_DELIVERY_DIRECT_VASULI_ID) {

		if(chargeType == CHARGETYPE_ID_QUANTITY)
			getQuantityTypeRates();
		else if(chargeType == CHARGETYPE_ID_FIX)
			getFixedTypeRates();
		else if(chargeType == CHARGETYPE_ID_WEIGHT)
			ajaxForWeightType();
	}
}

/*
 * Get rate from rate master according to party
 * 
 * Added by		- Anant Chaudhary	14-12-2016
 */
function ajaxForWeightForCorp(chargedWeight) {
	var forms			= null;

	var destBranchId	= $('#destinationBranchId').val();
	var bookingType		= 0;

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(configuration.FormsWithSingleSlection == 'true')
		forms			= $('#singleFormTypes').val();
	else
		forms			= $('#formTypes').val();

	var packagesStr		= 0;
	var categoryId		= 1;
	var vehicleTypeId	= 0;
	var qty				= 0;

	if($('#billingPartyId').val() > 0) {
		corporateAccountId		= $('#billingPartyId').val();
		categoryId				= 3;
	}

	if($('#partyMasterId').val() > 0) {
		corporateAccountId		= $('#partyMasterId').val();
		categoryId				= 2;
	}
	
	if(configuration.consigneeWiseRateApplyInToPayLrs == 'true' && $('#consigneePartyMasterId').val() > 0 
	&& $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
		corporateAccountId		= $('#consigneePartyMasterId').val();
		categoryId				= 2;
	}

	if(bookingType == BOOKING_TYPE_FTL_ID) {
		var vehicleType = $('#vehicleType').val();

		if(vehicleType == 0) {
			showMessage('error', truckTypeErrMsg);
			return false;
		} else {
			var tempQty = vehicleType.split(",");

			vehicleTypeId	= parseInt(tempQty[0]);
		}
	} 

	if((destBranchId != 0 || bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID) && consigAddedtableRowsId.length >= 1) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			qty			+= parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
			packagesStr = packagesStr + parseInt($('#typeofPackingId' + consigAddedtableRowsId[i]).html()) + '=' + $('#quantity' + consigAddedtableRowsId[i]).html() + ',';
		}

		packagesStr = packagesStr.substring(0,packagesStr.length - 1);
	} else {
		if(!isManualWayBill)
			resetOnChargeTypeExcludingPackageDetails();
		
		showMessage('info', 'For getting Charges, Please fill up the all necessary fields !');
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.categoryId			= categoryId;

	jsonObject.srcBranchId			= getSourceBranchForRate();;
	jsonObject.destBranchId			= destBranchId;
	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.bookingTypeId		= bookingType;
	jsonObject.packagesStr			= packagesStr;
	jsonObject.forms				= forms;
	jsonObject.vehicleTypeId		= vehicleTypeId;
	jsonObject.weight				= chargedWeight;
	jsonObject.qty					= qty;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:14}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
					}

					if(!isManualWayBill)
						resetOnChargeTypeExcludingPackageDetails();
				} else {
					var recordnotfound			= data.recordnotfound;

					if(recordnotfound != undefined) {
						if(categoryId == 2) {
							isAppliedGeneralRateForParty = true;
							ajaxForWeightQtyCompare(chargedWeight);
						} else if(!isManualWayBill) {
							resetOnChargeTypeExcludingPackageDetails();
							showMessage('info', 'Rate not defined. Please try again !');
						} else
							resetSpecificCharges();
					} else {
						var purefrieghtAmount				= data.purefrieghtAmount;
						var purefrieghtQtyAmount			= data.purefrieghtQtyAmount;
						var rateId_ChargeAmt				= data.rateId_ChargeAmt;
						//var isPerArticleWiseRateapply		= data.isPerArticleWiseRateapply;

						if(purefrieghtAmount > 0)
							setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);
						else if(purefrieghtQtyAmount > 0)
							setValueToHtmlTag('pureFrieghtAmt', purefrieghtQtyAmount);
							
							//if(isPerArticleWiseRateapply)
							//	setValueToTextField('chargeType', CHARGETYPE_ID_QUANTITY);
							//else	
							//	setValueToTextField('chargeType', CHARGETYPE_ID_WEIGHT);

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i))
								applyCorporateCharges(i, Math.round(rateId_ChargeAmt[i]), parseFloat(rateId_ChargeAmt[i]));
						}

						applyExtraCharges();
						calculateCustomFormCharge();
						setRegionWiseStatisticalCharges();
						
						if(!isManualWayBill) {
							calcTotal();
							moveCursorToSTPaid(document.wayBillForm.chargeType);
						}
					}
				}
			});
}

function applyCorporateCharges(chargeId, chargeAmount, floatChargeAmount) {

	var actualWeight		= getValueFromInputField('actualWeight');
	 var totalAmt			= 0;
	
	if(isGSTNumberWiseBooking()) {
		var consignorGSTNVal		= $('#consignoCorprGstn').val();
		var consigneeGSTNVal		= $('#consigneeCorpGstn').val();
	} else {
		var consignorGSTNVal		= $('#consignorGstn').val();
		var consigneeGSTNVal		= $('#consigneeGstn').val();
	}

	var isConsignorGSTNumberAvailable	= !jQuery.isEmptyObject(consignorGSTNVal);
	var isConsigneeGSTNumberAvailable	= !jQuery.isEmptyObject(consigneeGSTNVal);
	
	applyDoorDeliveryCharge = actualWeight < parseInt(ddSlabAmount);
	
	if(chargeId == FREIGHT) {
		if(!isManualWayBill) {
			if(configuration.alowToAddRatePerArticleToFreight == 'true' && (!isConsignorGSTNumberAvailable || !isConsigneeGSTNumberAvailable)) {
				var totalQuantity		= Number($('#totalQty').html());
				totalAmt	= totalQuantity * Number(configuration.ratePerArticleToAddOnFreight);
			 }
	
			calRateAmt	= chargeAmount;
			setValueToTextField('charge' + chargeId, chargeAmount +totalAmt);
			setValueToTextField('qtyAmount', parseInt(chargeAmount));
		}

		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);

	} else if (chargeId == HAMALI) {
		if(!isManualWayBill)
			setValueToTextField('charge' + chargeId, chargeAmount);

		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	} else if (chargeId == DOOR_DELIVERY_BOOKING) {
		var deliveryTo		= $('#deliveryTo').val();

		if(deliveryTo == DELIVERY_TO_DOOR_ID && applyDoorDeliveryCharge) {
			if(!isManualWayBill)
				setValueToTextField('charge' + chargeId, chargeAmount);
			else
				setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
		} else if(isManualWayBill)
			setValueToHtmlTag('SpecificRate_' + chargeId, 0);
		else
			setValueToTextField('charge' + chargeId, 0);
	} else if (chargeId == AOC)
		AOCPercentageValue = floatChargeAmount;
	else if(chargeId == FOV)
		FOVChargeValue = floatChargeAmount;
	else if(configuration.addDefaultFormChargeWhenEWayBillNotEntered  == 'true' && chargeId == FORM_CHARGES)		
		formChargeRatesDB = floatChargeAmount;
	else if(isManualWayBill)
		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	else
		setValueToTextField('charge' + chargeId, chargeAmount);
}

/*
 * Get rate from rate master to apply rate after comparison
 * 
 * Added by		- Anant Chaudhary	14-12-2016
 */

function ajaxForWeightQtyCompare(chargedWeight) {
	var bookingType		= 0;

	var destBranchId	= getValueFromInputField('destinationBranchId');
	var forms			= null;

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(configuration.FormsWithSingleSlection == 'true')
		forms			= getValueFromInputField('singleFormTypes');
	else
		forms			= getValueFromInputField('formTypes');

	var qty				= 0;
	var vehicleTypeId	= 0;
	var categoryId		= 0;

	if((destBranchId != 0 || bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID) && consigAddedtableRowsId.length >= 1) {
		if(bookingType == BOOKING_TYPE_FTL_ID) {
			var vehicleType = getValueFromInputField('vehicleType');

			if(vehicleType == 0) {
				showMessage('error', truckTypeErrMsg);
				return false;
			} else {
				var tempQty		= vehicleType.split(",");
				vehicleTypeId	= parseInt(tempQty[0]);
			}
		} 

		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#quantity' + consigAddedtableRowsId[i]).html() > 0)
				qty += parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
		}
	} else {
		if(!isManualWayBill)
			resetOnChargeTypeExcludingPackageDetails();
		
		showMessage('info', 'For getting Charges, Please fill up the all necessary fields !');
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.categoryId			= categoryId;

	jsonObject.srcBranchId			= getSourceBranchForRate();
	jsonObject.destBranchId			= destBranchId;
	jsonObject.bookingTypeId		= bookingType;
	jsonObject.forms				= forms;
	jsonObject.vehicleTypeId		= vehicleTypeId;
	jsonObject.weight				= chargedWeight;
	jsonObject.qty					= qty;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:15}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription)
						showMessage('error', data.errorDescription);
					else
						console.log("No rates");

					if(!isManualWayBill)
						resetOnChargeTypeExcludingPackageDetails();
				} else {
					var recordnotfound			= data.recordnotfound;

					if(recordnotfound != undefined) {
						if(!isManualWayBill) {
							resetOnChargeTypeExcludingPackageDetails();
							showMessage('info', 'Rate not defined. Please try again !');
						}
					} else if(bookingType == BOOKING_TYPE_FTL_ID || bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
						setValueToHtmlTag('pureFrieghtAmt', 0);

						var rateId_ChargeAmt		= data.rateId_ChargeAmt;

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i))
								applyFTLValue(i, Math.round(rateId_ChargeAmt[i]), parseFloat(rateId_ChargeAmt[i]));
						}

						applyExtraCharges();
						calcTotal();
					} else if(bookingType == BOOKING_TYPE_SUNDRY_ID) {
						totalFreightAmountByPackingType		= data.frieghtAmount;
						totalHamaliAmountByPackingType		= data.hamaliAmount;	

						var rateId_ChargeAmt		= data.rateId_ChargeAmt;

						var totalOfPackages = 0;
						var totalOfWeight	= 0;
						totalOfPackages += parseInt(totalFreightAmountByPackingType);

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i)) {
								if(parseInt(i) == FREIGHT)
									totalOfWeight += Math.round(rateId_ChargeAmt[i]);

								applyGreaterValue(i, Math.round(rateId_ChargeAmt[i]), data.purefrieghtAmount, data.purefrieghtQtyAmount, parseFloat(rateId_ChargeAmt[i]), totalOfWeight, totalOfPackages);
							}
						}

						if(totalOfWeight >= totalOfPackages) {
							setValueToTextField('chargeType', CHARGETYPE_ID_WEIGHT);
							document.getElementById('quantity').disabled		= false;
						} else {
							setValueToTextField('chargeType', CHARGETYPE_ID_QUANTITY);
							document.getElementById('quantity').disabled		= false;
						}

						if(!isManualWayBill) {
							applyExtraCharges();
							calcTotal();
							moveCursorToSTPaid(document.wayBillForm.chargeType);
						}
					}
				}
			});
}

function applyFTLValue(chargeId, chargeAmount, floatChargeAmount) {
	if(chargeId == FREIGHT) {
		if(!isManualWayBill) {
			setValueToTextField('charge' + chargeId, chargeAmount);
			setValueToTextField('qtyAmount', parseInt(chargeAmount));
		}

		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	} else if (chargeId ==	HAMALI) {
		if(!isManualWayBill)
			setValueToTextField('charge' + chargeId, chargeAmount);

		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	} else if (chargeId == DOOR_DELIVERY_BOOKING) {
		if(getValueFromInputField('deliveryTo') == DELIVERY_TO_DOOR_ID) {
			if(!isManualWayBill) {
				if($('#charge' + DOOR_DELIVERY_BOOKING).val() == 0)
					setValueToTextField('charge' + chargeId, chargeAmount);
			} else
				setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
		} else if(!isManualWayBill)
			setValueToTextField('charge' + chargeId, '0');
		else
			setValueToHtmlTag('SpecificRate_' + chargeId, 0);
	} else if (chargeId == AOC)
		AOCPercentageValue	= floatChargeAmount;
	else if (chargeId == FOV)
		FOVChargeValue		= floatChargeAmount;
	else if(!isManualWayBill)
		setValueToTextField('charge' + chargeId, chargeAmount);
	else
		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
}

/*
 * Apply greater value in case of Sundry booking type
 */
function applyGreaterValue(chargeId, chargeAmount, freightPureQtyAmt, freightPureWghtAmt, floatChargeAmount, totalOfWeight, totalOfPackages) {
	if(chargeId == FREIGHT) {
		if(totalFreightAmountByPackingType >= chargeAmount) {
			setValueToHtmlTag('pureFrieghtAmt', freightPureQtyAmt);

			if(!isManualWayBill) {
				setValueToTextField('charge' + FREIGHT, totalFreightAmountByPackingType);
				setValueToTextField('qtyAmount', parseInt(totalFreightAmountByPackingType));
			} else
				setValueToHtmlTag('SpecificRate_' + chargeId, totalFreightAmountByPackingType);
		} else {
			if(!isManualWayBill) {
				setValueToTextField('charge' + FREIGHT, chargeAmount);
				setValueToTextField('qtyAmount', parseInt(chargeAmount));
			} else
				setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);

			setValueToHtmlTag('pureFrieghtAmt', freightPureWghtAmt);
		}

		if(!isManualWayBill) {
			if(totalOfWeight >= totalOfPackages)
				setValueToHtmlTag('SpecificRate_' + FREIGHT, chargeAmount);
			else
				setValueToHtmlTag('SpecificRate_' + FREIGHT, totalFreightAmountByPackingType);
		}
	} else if (chargeId == HAMALI) {
		if(totalHamaliAmountByPackingType >= chargeAmount) {
			if(!isManualWayBill)
				setValueToTextField('charge' + chargeId, totalHamaliAmountByPackingType);
			else
				setValueToHtmlTag('SpecificRate_' + HAMALI, totalHamaliAmountByPackingType);
		} else if(!isManualWayBill)
			setValueToTextField('charge' + chargeId, chargeAmount);
		else
			setValueToHtmlTag('SpecificRate_' + HAMALI, chargeAmount);

		if(!isManualWayBill) {
			if(totalOfWeight >= totalOfPackages)
				setValueToHtmlTag('SpecificRate_' + HAMALI, chargeAmount);
			else
				setValueToHtmlTag('SpecificRate_' + HAMALI, totalHamaliAmountByPackingType);
		}
	} else if (chargeId == DOOR_DELIVERY_BOOKING) {
		if(getValueFromInputField('deliveryTo') == DELIVERY_TO_DOOR_ID) {
			if(!isManualWayBill) {
				if(getValueFromInputField('charge' + chargeId) == 0)
					setValueToTextField('charge' + chargeId, chargeAmount);
			} else
				setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
		} else if(!isManualWayBill)
			setValueToTextField('charge' + chargeId, '0');
		else
			setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	} else if (chargeId == AOC)
		AOCPercentageValue	= floatChargeAmount;
	else if (chargeId == FOV)
		FOVChargeValue		= floatChargeAmount;
	else if(!isManualWayBill)
		setValueToTextField('charge' + chargeId, chargeAmount);
	else
		setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
}

function getFixedTypeRates() {
	var bookingType		= 0;

	var destBranchId	= getValueFromInputField('destinationBranchId');
	var chargeTypeIds	= HAMALI;
	var actualWeight	= getValueFromInputField('actualWeight');
	var chargedWeight	= getValueFromInputField('chargedWeight');
	var forms			= null;

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(configuration.FormsWithSingleSlection == 'true')
		forms			= getValueFromInputField('singleFormTypes');
	else
		forms			= getValueFromInputField('formTypes');

	var minWgt			= 0;
	var maxWgt			= 0;
	var qty				= 0;
	var vehicleTypeId	= 0;
	var categoryId		= 0;

	if(bookingType == BOOKING_TYPE_FTL_ID) {
		var vehicleType = getValueFromInputField('vehicleType');

		if(vehicleType == 0) {
			showMessage('error', truckTypeErrMsg);
			return false;
		} else {
			var tempQty		= vehicleType.split(",");
			vehicleTypeId	= parseInt(tempQty[0]);
		}
	} 

	if(destBranchId != 0 && (consigAddedtableRowsId.length >= 1) && actualWeight > 0 && chargedWeight > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#quantity' + consigAddedtableRowsId[i]).html() > 0)
				qty += parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
		}
	} else {
		showMessage('info', 'For getting Charges, Please fill up the all necessary fields !');
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.categoryId			= categoryId;
	jsonObject.srcBranchId			= getSourceBranchForRate();;
	jsonObject.destBranchId			= destBranchId;
	jsonObject.bookingTypeId		= bookingType;
	jsonObject.forms				= forms;
	jsonObject.vehicleTypeId		= vehicleTypeId;
	jsonObject.weight				= chargedWeight;
	jsonObject.qty					= qty;
	jsonObject.minWgt				= minWgt;
	jsonObject.maxWgt				= maxWgt;
	jsonObject.chargedWeight		= chargedWeight;
	jsonObject.chargeTypeIds		= chargeTypeIds;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:16}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription)
						showMessage('error', data.errorDescription);
					else
						console.log("No rates");
				} else {
					var recordnotfound			= data.recordnotfound;

					if(recordnotfound != undefined) {

					} else {
						var frieghtAmount			= data.frieghtAmount;
						var hamaliAmount			= data.hamaliAmount;
						var rateId_ChargeAmt		= data.rateId_ChargeAmt;

						totalFreightAmountByPackingType = Math.round(frieghtAmount);
						totalHamaliAmountByPackingType	= Math.round(hamaliAmount);

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i))
								applyGreaterValueForHamali(parseInt(i), Math.round(rateId_ChargeAmt[i]), '0', '0', parseFloat(rateId_ChargeAmt[i]));
						}

						if(!isManualWayBill) {
							applyExtraCharges();
							calcTotal();
							moveCursorToSTPaid(document.wayBillForm.chargeType);
						}
					}
				}
			});
}

function applyGreaterValueForHamali(chargeId, chargeAmount, freightPureQtyAmt, freightPureWghtAmt, floatChargeAmount) {
	if(chargeId == FREIGHT) {
		if(totalFreightAmountByPackingType >= chargeAmount) {
			setValueToHtmlTag('SpecificRate_' + chargeId, totalFreightAmountByPackingType);
			setValueToHtmlTag('pureFrieghtAmt', freightPureQtyAmt);
		} else {
			setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
			setValueToHtmlTag('pureFrieghtAmt', freightPureWghtAmt);
		}
	} else if (chargeId == HAMALI) {
		if(totalHamaliAmountByPackingType >= chargeAmount)
			setValueToHtmlTag('SpecificRate_' + chargeId, totalHamaliAmountByPackingType);
		else
			setValueToHtmlTag('SpecificRate_' + chargeId, chargeAmount);
	}
}

function ajaxForWeightType() {
	var bookingType		= 0;

	var destBranchId	= getValueFromInputField('destinationBranchId');
	var chargeTypeIds	= FREIGHT + ',' + HAMALI;
	var actualWeight	= getValueFromInputField('actualWeight');
	var chargedWeight	= getValueFromInputField('chargedWeight');
	var forms			= null;

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(configuration.FormsWithSingleSlection == 'true')
		forms			= getValueFromInputField('singleFormTypes');
	else
		forms			= getValueFromInputField('formTypes');

	var minWgt			= 1;
	var maxWgt			= 1;
	var vehicleTypeId	= 0;
	var categoryId		= 0;

	if(bookingType == BOOKING_TYPE_FTL_ID) {
		var vehicleType = getValueFromInputField('vehicleType');

		if(vehicleType == 0) {
			showMessage('error', truckTypeErrMsg);
			return false;
		} else {
			var tempQty		= vehicleType.split(",");
			vehicleTypeId	= parseInt(tempQty[0]);

			minWgt			= 0;
			maxWgt			= 0;
		}
	} 

	if(destBranchId != 0 && (consigAddedtableRowsId.length >= 1) && actualWeight > 0 && chargedWeight > 0) {
	} else {
		showMessage('info', 'For getting Charges, Please fill up the all necessary fields !');
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.categoryId			= categoryId;
	jsonObject.srcBranchId			= getSourceBranchForRate();
	jsonObject.destBranchId			= destBranchId;
	jsonObject.bookingTypeId		= bookingType;
	jsonObject.forms				= forms;
	jsonObject.vehicleTypeId		= vehicleTypeId;
	jsonObject.weight				= chargedWeight;
	jsonObject.minWgt				= minWgt;
	jsonObject.maxWgt				= maxWgt;
	jsonObject.chargedWeight		= chargedWeight;
	jsonObject.chargeTypeIds		= chargeTypeIds;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:18}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription)
						showMessage('error', data.errorDescription);
					else
						console.log("No rates");

					resetSpecificCharges();

					if(!isManualWayBill)
						alert('Weight Rate not defined !!!');
				} else {
					var recordnotfound			= data.recordnotfound;
					var purefrieghtAmount		= data.purefrieghtAmount;
					var rateId_ChargeAmt		= data.rateId_ChargeAmt;

					if(recordnotfound != undefined) {
						resetSpecificCharges();

						if(!isManualWayBill)
							showMessage('info', 'Rate not defined. Please try again !');
					} else {
						setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i))
								setValueToHtmlTag('SpecificRate_' + parseInt(i), Math.round(rateId_ChargeAmt[i]));
						}

						if(!isManualWayBill) {
							applyExtraCharges();
							moveCursorToSTPaid(document.wayBillForm.chargeType);
						}
					}
				}
			});
}

function getQuantityTypeRates() {
	var bookingType		= 0;

	var destBranchId	= getValueFromInputField('destinationBranchId');
	var chargeTypeIds	= FREIGHT + ',' + HAMALI;
	var actualWeight	= getValueFromInputField('actualWeight');
	var chargedWeight	= getValueFromInputField('chargedWeight');
	var forms			= null;

	if($('#bookingType').val() > 0)
		bookingType		= $('#bookingType').val();
	else
		bookingType		= getDefaultBookingType();

	if(configuration.FormsWithSingleSlection == 'true')
		forms			= getValueFromInputField('singleFormTypes');
	else
		forms			= getValueFromInputField('formTypes');

	var minWgt			= 0;
	var maxWgt			= 0;
	var qty				= 0;
	var vehicleTypeId	= 0;
	var categoryId		= 0;

	if(bookingType == BOOKING_TYPE_FTL_ID) {
		var vehicleType = getValueFromInputField('vehicleType');

		if(vehicleType == 0) {
			showMessage('error', truckTypeErrMsg);
			return false;
		} else {
			var tempQty		= vehicleType.split(",");
			vehicleTypeId	= parseInt(tempQty[0]);
		}
	} 

	if(destBranchId != 0 && (consigAddedtableRowsId.length >= 1) && actualWeight > 0 && chargedWeight > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#quantity' + consigAddedtableRowsId[i]).html() > 0)
				qty += parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
		}
	} else {
		showMessage('info', 'For getting Charges, Please fill up the all necessary fields !');
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.categoryId			= categoryId;
	jsonObject.srcBranchId			= getSourceBranchForRate();
	jsonObject.destBranchId			= destBranchId;
	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.bookingTypeId		= bookingType;
	jsonObject.forms				= forms;
	jsonObject.vehicleTypeId		= vehicleTypeId;
	jsonObject.weight				= chargedWeight;
	jsonObject.minWgt				= minWgt;
	jsonObject.maxWgt				= maxWgt;
	jsonObject.qty					= qty;
	jsonObject.chargedWeight		= chargedWeight;
	jsonObject.chargeTypeIds		= chargeTypeIds;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:17}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription)
						showMessage('error', data.errorDescription);
					else
						console.log("No rates");

					resetSpecificCharges();

					if(!isManualWayBill)
						alert('Quantity Rate not defined !!!');
				} else {
					var recordnotfound			= data.recordnotfound;

					if(recordnotfound != undefined) {
						resetSpecificCharges();

						if(!isManualWayBill)
							alert('Quantity Rate not defined !!!');
					} else {
						var purefrieghtAmount		= data.purefrieghtAmount;
						var rateId_ChargeAmt		= data.rateId_ChargeAmt;

						if(data.purefrieghtAmount != undefined)
							setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);

						for(var i in rateId_ChargeAmt) {
							if (rateId_ChargeAmt.hasOwnProperty(i))
								setValueToHtmlTag('SpecificRate_' + parseInt(i), Math.round(rateId_ChargeAmt[i]));
						}

						if(!isManualWayBill) {
							applyExtraCharges();
							moveCursorToSTPaid(document.wayBillForm.chargeType);
						}
					}
				}
			});
}

function filterPartyRate(destBranchId, corporateAccountId) {
	var	srcBranchId		= getSourceBranchForRate();
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			if(Number(datarates.branchId)						== Number(srcBranchId)
					&& Number(datarates.destinationBranchId)	== Number(destBranchId)
					&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)
					&& Number(datarates.accountGroupId)			== Number(accountGroupId)
					&& Number(datarates.chargeSectionId)		!= 5
			) {
				arr.push(wayBillRates[i]);
			} else if(Number(datarates.branchId)				== Number(srcBranchId)
					&& Number(datarates.corporateAccountId)		== Number(corporateAccountId)
					&& Number(datarates.accountGroupId)			== Number(accountGroupId)
					&& Number(datarates.chargeSectionId)		!= 5
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}

	return arr;
}

function filterBranchRate(destBranchId) {
	var	srcBranchId		= getSourceBranchForRate();
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			if(Number(datarates.branchId)						== Number(srcBranchId)
					&& Number(datarates.destinationBranchId)	== Number(destBranchId)
					&& Number(datarates.corporateAccountId)		== 0
					&& Number(datarates.accountGroupId)			== Number(accountGroupId)
					&& Number(datarates.chargeSectionId)		!= 5
			) {
				arr.push(wayBillRates[i]);
			} else if(Number(datarates.branchId)				== Number(srcBranchId)
					&& Number(datarates.corporateAccountId)		== 0
					&& Number(datarates.accountGroupId)			== Number(accountGroupId)
					&& Number(datarates.chargeSectionId)		!= 5
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}

	return arr;
}

function filterPartyChargeConfigRate(corporateAccountId) {
	var	srcBranchId		= getSourceBranchForRate();
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();

	if(!jQuery.isEmptyObject(chargesConfigRates)) {
		for (var i = 0; i < chargesConfigRates.length; i++) {
			var rates = chargesConfigRates[i];

			if(Number(rates.accountGroupId)			== Number(accountGroupId)
					&& Number(rates.branchId)			== Number(srcBranchId)
					&& Number(rates.corporateAccountId) == Number(corporateAccountId)
			) {
				arr.push(chargesConfigRates[i]);
			}
		}
	}

	return arr;
}

function filterBranchChargeConfigRate() {
	var	srcBranchId		= getSourceBranchForRate();
	var accountGroupId	= executive.accountGroupId;
	var arr				= new Array();

	if(!jQuery.isEmptyObject(chargesConfigRates)) {
		for (var i = 0; i < chargesConfigRates.length; i++) {
			var rates = chargesConfigRates[i];

			if(Number(rates.accountGroupId)			== Number(accountGroupId)
					&& Number(rates.branchId)			== Number(srcBranchId)
					&& Number(rates.corporateAccountId) == 0
			) {
				arr.push(chargesConfigRates[i]);
			}
		}
	}

	return arr;
}

function checkSpecificArticleRate(rateMaster) {
	if(configuration.allowSpecificArticleRateToApply == 'true') {
		for (var i = 0; i < rateMaster.length; i++) {
			if(Number(rateMaster[i].packingTypeId) > 0)
				applyRateForSpecificArticle	= true;
		}
	}
}

function getAgentCommission(sourceBranchId){
	var jsonObject					= new Object();
	jsonObject.filter				= 8;
	jsonObject.sourceBranchId		= sourceBranchId;

	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {

				} else {
					agentCommissionValue = data.agentCommissionValue;
				}
			});
}

function setHiddenValuesForCharges(chargeMasterId){
	setTimeout(function(){ $('#actualChargeAmount'+chargeMasterId).val($('#charge'+chargeMasterId).val());}, 200);
}

function resetTBBPartyData() {
	$("#consignorName").val("");
	$("#consignorCorpId").val("0");
	$("#consignorPhn").val("");
	$("#consignorGstn").val("");
	$("#billingPartyName").val("");
	$("#billingPartyId").val("0");
	$("#consignorName").focus();
	showMessage('error', "Rates not found for Party. Please contact Head Office !");
}

function calculateFSOnOtherCharge(chargeTypeMasterId) {
	if(configuration.calcFsRate == 'true' || configuration.calcFsRate == true) {
		let fsRateCalculateOnAMt	= 0;

		if(applicableOnChargeTypeMasterIdArr != null) {
			for(const element of applicableOnChargeTypeMasterIdArr) {
				fsRateCalculateOnAMt	+= Number($('#charge' + element).val());
			}
			
			$('#charge' + BookingChargeConstant.FS).val(Math.round(chargeMinAmountforFSCharge * fsRateCalculateOnAMt / 100));
		}
	}
}

function calculateLoadingChargeOnFreight(totalFreight, quantity, typeofPackingId) {
	var loadingPerParcel	= 0;
	var bracnhIdsForLoadingCharge	= (configuration.branchIdsRateAppliedOnLoadingCharge).split(",");
	var bracnhIdsForLoadingCharge30	= (configuration.branchIdsToallowLoadingCharge30).split(",");
	
	if(totalFreight == 0) {
		loadingPerParcel = 0;
	} else {
		if(isOwnBranchCityList) {
			if(configuration.waybillTypeWiseRateAppliedOnLoadingCharge == 'true'
					&& ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID)
					&& isValueExistInArray(bracnhIdsForLoadingCharge, branchId))
				loadingPerParcel = 10;
			else if(totalFreight > 0 && totalFreight <= 90)
				loadingPerParcel = 10;
			else if(checkBranchForFixLoadingCharge)
				loadingPerParcel = 20;
			else if(isBranchListForSkipAmountValidation && (totalFreight >= 81 && totalFreight <= 85))
				loadingPerParcel = 15;
			else if(totalFreight >= 91 && totalFreight <= 120)
				loadingPerParcel	= (isNewLoadingChargeBranch ? 30 : 20);
			else if(totalFreight >= 121 && totalFreight < 150)
				loadingPerParcel	= (isNewLoadingChargeBranch ? 30 : 20);
			else if(totalFreight >= 150 && totalFreight <= 250)
				loadingPerParcel	= (isNewLoadingChargeBranch ? 40 : 30);
			else if(totalFreight >= 251 && totalFreight <= 400)
				loadingPerParcel	= (isNewLoadingChargeBranch ? 50 : 40);
			else if(totalFreight > 400)
				loadingPerParcel	= (isNewLoadingChargeBranch ? 60 : 50);
		} else
			loadingPerParcel = 10;

		 if(isNewFreightChargeBranchList && typeofPackingId == PACKING_TYPE_CARTOON
			&& totalFreight > 0 && totalFreight <= 80)
			loadingPerParcel	= 20;

			if(branchId == 90058 || branchId == 22170){
				loadingPerParcel	= 20;
			}
		//31958 - KALPANA OFFICE
		//13736 - KALPANA AND KAMLA CARGO
		//32174 - BEHROR GHANSHYAM
		//13734 - V S TRANPORT
		//19378 - BHARAT TRAVELS
		//35169 - KALPANA CARGO KANPUR
		if(branchId == 31958 || branchId == 13736 || branchId == 32174 || branchId == 13734 || branchId == 19378 || branchId == 35169)
			loadingPerParcel	= 10;
	}
	
	if(typeofPackingId == PACKING_TYPE_MOTOR_CYCLE)
		loadingPerParcel	= 150;
	
	if(typeofPackingId == PACKING_TYPE_SCOOTY)
		loadingPerParcel	= 100;
	
	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		if(isValueExistInArray(bracnhIdsForLoadingCharge30, branchId)
				&& typeofPackingId != PACKING_TYPE_LIFFAFA
				&& typeofPackingId != PACKING_TYPE_PACKET
				&& typeofPackingId != PACKING_TYPE_LETTER
				&& typeofPackingId != PACKING_TYPE_MOTOR_CYCLE
				&& typeofPackingId != PACKING_TYPE_SCOOTY) {
			loadingPerParcel = 30;
		}
	}
	
	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		if(isValueExistInArray(bracnhIdsForLoadingCharge30, branchId) &&
				(typeofPackingId == PACKING_TYPE_LIFFAFA
				|| typeofPackingId == PACKING_TYPE_PACKET
				|| typeofPackingId == PACKING_TYPE_LETTER))
			loadingPerParcel = 0;
	}
	
	
	return loadingPerParcel * quantity;
}

function calculateBranchWiseDiscountOnLoading(amount) {
	var branchWiseDiscountOnLoading	= configuration.branchWiseDiscountOnLoading;
	
	var checkBranchForDiscout	= (configuration.branchWiseDiscountOnFreightAndLoadingCharge).split(',');
	var checkDestBranch			= (configuration.destinationBranchWiseDiscount).split(',');
	
	var subRegionIdForDiscount	= (configuration.subRegionIdForCartoonPackingTypeDiscount).split(',');
	var cartoonTypeSubreionId	= isValueExistInArray(subRegionIdForDiscount, executive.subRegionId);
	
	var totalLoading			= $('#charge' + LOADING).val();
	var dicountOnFreightg		= 0;
	amountWithDiscount			= 0;
	totalLoadingWithDiscount	= 0;
	var destinationBranchId	= $('#destinationBranchId').val();
	
	if((branchWiseDiscountOnLoading || cartoonTypeSubreionId) 
		&& (isValueExistInArray(checkBranchForDiscout, branchId) || cartoonTypeSubreionId)
		&& (totalQuantityOfCartoon > 0 && (isValueExistInArray(checkDestBranch, destinationBranchId) || totalQuantityOfCartoon > 4)))
			dicountOnFreightg			= totalQuantityOfCartoon * 10;
			totalLoadingWithDiscount	= totalLoading - dicountOnFreightg
			amountWithDiscount			= amount - dicountOnFreightg;
	
	if(isManualWayBill && checkBranchForFreightIncreaseOrDecrease) {
		amountWithDiscount		 = amount - 10;
		amountWithIncreaseAmount = amount + 10;
	}
	
	if(dicountOnFreightg > 0)
		$('#charge' + FREIGHT).removeAttr("readonly");
	else
		$('#charge' + FREIGHT).prop("readonly", "true");
	
	if(isManualWayBill) {
		if(amountWithIncreaseAmount > 0)
			$('#charge' + FREIGHT).removeAttr("readonly");
		else
			$('#charge' + FREIGHT).prop("readonly", "true");
	}
	
	$('#charge' + LOADING).val(totalLoading);
	$('#charge' + FREIGHT).val(amount);
}

function calculateLoadingChargeOnFreightInManual(totalFreight, quantity, typeofPackingId) {
	var loadingPerParcel	= 0;
	var bracnhIdsForLoadingCharge	= (configuration.branchIdsRateAppliedOnLoadingCharge).split(",");
	var bracnhIdsForLoadingCharge30	= (configuration.branchIdsToallowLoadingCharge30).split(",");

	
	if(totalFreight != 0) {
		if(configuration.waybillTypeWiseRateAppliedOnLoadingCharge == 'true'
			&& ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID)
			&& isValueExistInArray(bracnhIdsForLoadingCharge, branchId))
			loadingPerParcel	= 10;
		else if((typeofPackingId == PACKING_TYPE_CARTOON && isNewFreightChargeBranchList && totalFreight > 0 && totalFreight <= 80)
			|| checkBranchForFixLoadingCharge)
			loadingPerParcel	= 20;
		else if(isBranchListForSkipAmountValidation && (totalFreight >= 81 && totalFreight <= 85))
			loadingPerParcel	= 15;
		else if(totalFreight > 0 && totalFreight <= 90)
			loadingPerParcel	= 10;
		else if(totalFreight >= 91 && totalFreight <= 120)
			loadingPerParcel	= (isNewLoadingChargeBranch ? 30 : 20);
		else if(totalFreight >= 121 && totalFreight < 150)
			loadingPerParcel	= (isNewLoadingChargeBranch ? 30 : 20);
		else if(totalFreight >= 150 && totalFreight <= 250)
			loadingPerParcel	= (isNewLoadingChargeBranch ? 40 : 30);
		else if(totalFreight >= 251 && totalFreight <= 400)
			loadingPerParcel	= (isNewLoadingChargeBranch ? 50 : 40);
		else if(totalFreight > 400)
			loadingPerParcel	= (isNewLoadingChargeBranch ? 60 : 50);
			
		//KALPANA OFFICE
		if(branchId == 31958 || isLoadingChargeFixLimitedBranchList)
			loadingPerParcel	= 10;
	}
	
	if(typeofPackingId == PACKING_TYPE_MOTOR_CYCLE)
		loadingPerParcel	= 150;
	
	if(typeofPackingId == PACKING_TYPE_SCOOTY)
		loadingPerParcel	= 100;
	
	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		if(isValueExistInArray(bracnhIdsForLoadingCharge30, branchId)
				&& typeofPackingId != PACKING_TYPE_LIFFAFA
				&& typeofPackingId != PACKING_TYPE_PACKET
				&& typeofPackingId != PACKING_TYPE_LETTER
				&& typeofPackingId != PACKING_TYPE_MOTOR_CYCLE
				&& typeofPackingId != PACKING_TYPE_SCOOTY) {
			loadingPerParcel = 30;
		}
	}
	
	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		if(isValueExistInArray(bracnhIdsForLoadingCharge30, branchId) &&
				(typeofPackingId == PACKING_TYPE_LIFFAFA
				|| typeofPackingId == PACKING_TYPE_PACKET
				|| typeofPackingId == PACKING_TYPE_LETTER))
			loadingPerParcel = 0;
	}
	
	if(branchId == 90058 || branchId == 22170){
					loadingPerParcel	= 20;
	}
	return loadingPerParcel * quantity;
}

function calculateBuiltyCharge(totalFreight, quantity, typeofPackingId) {
	var builtyPerParcel						= 0;
	var bracnhIdsForLrWiseBuiltyCharge10	= (configuration.branchIdsToallowLrWiseBuiltyCharge10).split(",");
	
	if(typeofPackingId == PACKING_TYPE_MOTOR_CYCLE)
		builtyPerParcel		= 50;
	
	if(typeofPackingId == PACKING_TYPE_SCOOTY)
		builtyPerParcel		= 50;
	
	if(isValueExistInArray(bracnhIdsForLrWiseBuiltyCharge10, branchId) && ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID)) {
		if( typeofPackingId != PACKING_TYPE_LIFFAFA
				&& typeofPackingId != PACKING_TYPE_PACKET
				&& typeofPackingId != PACKING_TYPE_LETTER
				&& typeofPackingId != PACKING_TYPE_MOTOR_CYCLE
				&& typeofPackingId != PACKING_TYPE_SCOOTY)
			builtyPerParcel = 10;
		
		return builtyPerParcel;
	}
	
	return builtyPerParcel * quantity;
}

function calculateBuiltyChargeInManual(totalFreight, quantity, typeofPackingId) {
	var builtyPerParcel						= 0;
	var bracnhIdsForLrWiseBuiltyCharge10	= (configuration.branchIdsToallowLrWiseBuiltyCharge10).split(",");
	
	if(typeofPackingId == PACKING_TYPE_MOTOR_CYCLE)
		builtyPerParcel		= 50;

	if(typeofPackingId == PACKING_TYPE_SCOOTY)
		builtyPerParcel		= 50;
	
	if(isValueExistInArray(bracnhIdsForLrWiseBuiltyCharge10, branchId) && ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID)){
		if(typeofPackingId != PACKING_TYPE_LIFFAFA
				&& typeofPackingId != PACKING_TYPE_PACKET
				&& typeofPackingId != PACKING_TYPE_LETTER
				&& typeofPackingId != PACKING_TYPE_MOTOR_CYCLE
				&& typeofPackingId != PACKING_TYPE_SCOOTY)
			builtyPerParcel = 10;
		
		return builtyPerParcel;
	}
		
	return builtyPerParcel * quantity;
}

function calculateDoorPickUpCharge(totalFreight, quantity, typeofPackingId) {
	var doorPickUpPerParcel						= 0;
	var bracnhIdsForDoorPickUpCharge20			= (configuration.branchIdsToallowDoorPickUpCharge20).split(",");
	
	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		if(isValueExistInArray(bracnhIdsForDoorPickUpCharge20, branchId)
				&& typeofPackingId != PACKING_TYPE_LIFFAFA
				&& typeofPackingId != PACKING_TYPE_PACKET
				&& typeofPackingId != PACKING_TYPE_LETTER)
			doorPickUpPerParcel = 20;

	}
	
	return doorPickUpPerParcel * quantity;
}

function includeLoadingChargeOnFreight() {
	var amount		= getConsignmentFreightAmount();
	
	if((configuration.includeLoadingChargeOnFreight == 'true' || configuration.calculateUnloadingChargeOnFreightForBooking == 'true') && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT) {
		var loadingCharge	= Math.round((Number(amount) * configuration.percentageToIncludeLoadingChargeOnFreight) / 100);
		var freight			= Math.round(amount - loadingCharge);
		
		if(configuration.includeLoadingChargeOnFreight == 'true') {
			$('#charge' + LOADING).val(loadingCharge);
			$('#charge' + LOADING).prop("readonly", "true");
			$('#charge' + FREIGHT).val(freight);
		}

		if(configuration.calculateUnloadingChargeOnFreightForBooking == 'true') {
			$('#charge' + UNLOADING_BOOKING).val(amount * Number(configuration.percentageToCalculateUnloadingChargeOnFreightForBooking) / 100);
			$('#charge' + UNLOADING_BOOKING).prop("readonly", "true");
		}

		if (configuration.calculateDoorDlyChargeOnFreightOnChangeDeliveryToDoor == 'true' && $('#deliveryTo').val() == DELIVERY_TO_DOOR_ID) {
			if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
				let newDoorDlyAmnt = amount * Number(configuration.percentageToCalculateDoorDlyChargeOnFreightForBooking) / 100;
				
				if (configuration.makeDoorDlyChargesEditable == 'true') {
					let doorDlyAmnt		= $('#charge' + DOOR_DLY_BOOKING).val();
				
					if (Number(doorDlyAmnt) < Number(newDoorDlyAmnt))
						$('#charge' + DOOR_DLY_BOOKING).val(Number(newDoorDlyAmnt));
				} else {
					$('#charge' + DOOR_DLY_BOOKING).val(Number(newDoorDlyAmnt));
					$('#charge' + DOOR_DLY_BOOKING).prop("readonly", "true");
				}
			}
		}
	}
}

function validateRiskaCovrageCharge() {
	if(configuration.nonEditableRiskCoverageCharge == 'true' ) {
		let lrTypesArray	= (configuration.nonEditableRiskCoverageChargeOnLRType).split(',');
	
		if(isValueExistInArray(lrTypesArray, $('#wayBillType').val()))
			$('#charge' + RISK_COVERAGE).prop("readonly", "true");
	}
	
	if(configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true')
		$('#charge' + INSURANCE).prop("readonly", true);
}

function calculateFreightOnChargesChange() {
	if(configuration.inclusiveFreightCharge == 'false')
		return;
	
	let freight				= getConsignmentFreightAmount();
	
	let chargeTypeModel = jsondata.charges;
	
	for (const element of chargeTypeModel) {
		let chargeMasterId	= element.chargeTypeMasterId;
		
		if(chargeMasterId == FREIGHT)
			continue;
		
		freight	= freight - Number($('#charge' + chargeMasterId).val());
	}

	$('#charge' + FREIGHT).val(freight);
		
	calcTotal();
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
				if(Number(abc[1]) == FREIGHT) {
					if(Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT
						&& Number(abc[2]) > Number($('#charge' + FREIGHT).val())) {
						$('#charge' + abc[1]).val(abc[2]);
						$('#actualChargeAmount' + abc[1]).val(abc[2]);
					}
				} else {
					$('#charge' + abc[1]).val(abc[2]);
					$('#actualChargeAmount' + abc[1]).val(abc[2]);
				}
				
				chargeMasterIdsArr.push(abc[1]);
				chargeAddedFromProperty = true;
			}
		}
		
		if(chargeAddedFromProperty) {
			for(const element of charges) {
				if(!isValueExistInArray(chargeMasterIdsArr, element.chargeTypeMasterId)) {
					$("#charge" + element.chargeTypeMasterId).val(0);
					$('#actualChargeAmount' + element.chargeTypeMasterId).val(0);
				}
			}
		}
	}
}

function getCFTWiseRate() {
	if(isManualWayBill && configuration.ApplyRateInManual == 'false' || configuration.applyRateAuto == 'false' || Number($("#chargeType").val()) != CHARGETYPE_ID_CFT)
		return false;
	
	let srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	
	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let chargeTypeId		= Number($('#chargeType').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());
		
	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else {
		if($("#rateType").val() != null && $("#rateType").val() != '') {
			setRateType();
			if($("#rateType").val() == CUSTOMER_TYPE_CONSIGNEE_ID) {
				if(configuration.ChargeTypeFlavour == '2'){
					corporateAccountId	= $('#consigneePartyMasterId').val();
					categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
				}else{
					corporateAccountId	= partyMasterId;
					categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
				}
			}else{
				corporateAccountId	= partyMasterId;
				categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else if(partyMasterId > 0) {
			corporateAccountId	= partyMasterId;
			categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
			rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		} else {
			corporateAccountId	= 0;
			categoryTypeId		= CATEGORY_TYPE_GENERAL_ID;
			rateTypeId			= 0;
		}
	}
	
	let vehicleTypeId		= 0;
	let val					= new Array();

	if ($('#vehicleType').exists()) {
		let vehicleTypeValue	= $('#vehicleType').val();
		
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
	}
	
	if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		let response	= getCftCbmTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, chargedWeight, rateTypeId, consigneeId, 0, 0, 0,chargeTypeId);
				
		if (response && !jQuery.isEmptyObject(response)) {
			weightFromDb = getFreightChargeForRates(response);
			purefrieghtAmount = getFreightChargeForRates(response);

			$('#cftFreightRate').val(0);

			if (weightFromDb > 0) {
				$('#cftFreightRate').val(weightFromDb);
			}
		} else {
			$('#charge' + LR_CHARGE).val(0);
			checkIfnotPresent();
			resetSpecificCharges();
		}
		applyRates();	
	}
}

function getCBMWiseRate() {
	if(isManualWayBill && configuration.ApplyRateInManual == 'false' || configuration.applyRateAuto == 'false' || Number($("#chargeType").val()) != CHARGETYPE_ID_CBM)
		return false;
	
	let srcBranchId			= getSourceBranchForRate();
	let destBranchId		= $('#destinationBranchId').val();
	
	let corporateAccountId	= 0;
	let categoryTypeId		= 0;
	let rateTypeId			= 0;
	let billingPartyId		= Number($('#billingPartyId').val());
	let partyMasterId		= Number($('#partyMasterId').val());
	let chargeTypeId		= Number($('#chargeType').val());
	let consigneeId			= Number($('#consigneePartyMasterId').val());
		
	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
		categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
		rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
	} else {
		if($("#rateType").val() != null && $("#rateType").val() != '') {
			setRateType();
			if($("#rateType").val() == CUSTOMER_TYPE_CONSIGNEE_ID) {
				if(configuration.ChargeTypeFlavour == '2'){
					corporateAccountId	= $('#consigneePartyMasterId').val();
					categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
				}else{
					corporateAccountId	= partyMasterId;
					categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
				}
			}else{
				corporateAccountId	= partyMasterId;
				categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else if(partyMasterId > 0) {
			corporateAccountId	= partyMasterId;
			categoryTypeId		= CATEGORY_TYPE_PARTY_ID;
			rateTypeId			= CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
		} else {
			corporateAccountId	= 0;
			categoryTypeId		= CATEGORY_TYPE_GENERAL_ID;
			rateTypeId			= 0;
		}
	}
	
	let vehicleTypeId		= 0;
	let val					= new Array();

	if ($('#vehicleType').exists()) {
		let vehicleTypeValue	= $('#vehicleType').val();
		
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
	}
	
	if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
		let response	= getCftCbmTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, chargedWeight, rateTypeId, consigneeId, 0, 0, 0,chargeTypeId);
		
		if (response && !jQuery.isEmptyObject(response)) {
			weightFromDb = getFreightChargeForRates(response);
			purefrieghtAmount = getFreightChargeForRates(response);

			$('#cbmFreightRate').val(0);

			if (weightFromDb > 0) {
				$('#cbmFreightRate').val(weightFromDb);
			}
		} else {
			$('#charge'+LR_CHARGE).val(0);
			checkIfnotPresent();
			resetSpecificCharges();
		}
		applyRates();	
	}
	
}

//applied letious condition for weight type rates form rate master
function getCftCbmTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, userWeightInput, rateTypeId, consigneeId, packingTypeId, packingGrpTypeId, consignmentGoodsId, chargeTypeId) {
	let rateId_mast			= new Object();
	let rateMaster			= null;
	let chargeSectionId		= 0;
	isSlabRateNotExists		= false;

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
	
	//Fixed Party charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, 8, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//if Party rates not defined then apply general rates
	if(categoryTypeId == CATEGORY_TYPE_PARTY_ID ) {

		//Route level charges
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);

		//Loading type charges
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
		//Loading type charges
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	}

	return rateId_mast;
}

function calculateTotalCftCbmOnChargeType(obj) {	
	let chargeTypeId		= Number($('#chargeType').val());
	
	if(chargeTypeId == CHARGETYPE_ID_CFT) {
		let cftAmount		= $('#cftAmount').val();
		let cftFreightRate	= $('#cftFreightRate').val();
		
		$("#charge" + FREIGHT).val(Number(cftAmount) * Number(cftFreightRate));
	} else if(chargeTypeId == CHARGETYPE_ID_CBM) {
		let cbmAmount		= $('#cbmAmount').val();
		let cbmFreightRate	= $('#cbmFreightRate').val();
		
		$("#charge" + FREIGHT).val(Number(cbmAmount) * Number(cbmFreightRate));
	}
	
	calcTotal();
}

function getCftWeightRate(response) {
	if(response['cftValue'] != null) {
		if(Number(response['cftValue']) > 0) {
			$('#cftRate').val(response['cftValue']);
			$('#cftRate').attr("disabled", "disabled");
		} else
			$('#cftRate').removeAttr("disabled");
	} else 
		$('#cftRate').removeAttr("disabled");
}

function getMixedSlabRates(response, chargeTypeId, quantity) {
	let calCharge		= 0;
	let tempString;
	let slabMinRangeHM	= new Map();
	let responseHm		= new Object();
	let noneSlab		= 0;
	isFixedArticleSlab	= false;
	
	if(freightRatePartyId > 0) {
		response	= response.filter(function (el) {
			return el.corporateAccountId == freightRatePartyId
		});
	}
	
	for(let i = 0; i < response.length; i++) {
		let wayBillRates	= response[i];
		noneSlab = 0;
	
		if(wayBillRates.slabMasterId == 0 && wayBillRates.chargeTypeMasterId == FREIGHT) {
			noneSlab = wayBillRates.rate;
			responseHm[wayBillRates.chargeTypeMasterId] = wayBillRates.rate;
			break;
		}
	}
	
	for(let i = 0; i < response.length; i++) {
		let wayBillRatesObejct	= response[i];

		if(wayBillRatesObejct.slabMasterId > 0 && quantity >= wayBillRatesObejct.minWeight && quantity <= wayBillRatesObejct.maxWeight) {
			if(wayBillRatesObejct.chargeTypeMasterId == FREIGHT) {
				responseHm[wayBillRatesObejct.chargeTypeMasterId] = wayBillRatesObejct.rate;
				tempString	= wayBillRatesObejct.chargeTypeMasterId + "=" + wayBillRatesObejct.rate;
				break;
			}
		} else if(wayBillRatesObejct.slabMasterId > 0 && quantity > wayBillRatesObejct.maxWeight) {
			slabMinRangeHM.set(wayBillRatesObejct.slabMasterId, wayBillRatesObejct.maxWeight);

			if (slabMinRangeHM.size > 0) {
				let maxValue = 0;

				for (const [key, value] of slabMinRangeHM.entries()) {
					maxValue = (!maxValue || maxValue < value) ? value : maxValue;

					if (maxValue == value && key == wayBillRatesObejct.slabMasterId && wayBillRatesObejct.chargeTypeMasterId == FREIGHT) {
						let diff	= Number(quantity - maxValue);//maxValue
						calCharge	= wayBillRatesObejct.rate + (diff * noneSlab);
						tempString	= wayBillRatesObejct.chargeTypeMasterId + "=" + calCharge;
						break;
					}
				}
			}
		}
	}
	
	let qtyAmt	= 0;
						
	if (chargeTypeId == CHARGETYPE_ID_QUANTITY)
		qtyAmt = getFreightChargeForRates(responseHm);

	if (tempString != undefined) {
		$('#searchRate').val(tempString);
		isFixedArticleSlab	= true;
		enableDisableInputField('qtyAmount', 'true');
	} else
		$('#qtyAmount').val(qtyAmt);
}

function getPackingTypeWiseMixedRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, packingTypeId, packingGrpTypeId, userArticleInput, rateTypeId, consignmentGoodsId, consigneeId) {
	let chargeTypeId		= CHARGETYPE_ID_QUANTITY;
	let rateMasterArr		= new Array();
	let rateMaster			= null;
	let chargeSectionId		= 0;
	isSlabRateNotExists		= false;

	//Specific Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, consigneeId);
	checkSpecificArticleRate(rateMaster);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Specific Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Generic Packing Type Rates (Only Route level charges)
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Generic Packing Type Rates (Only Loading Type level charges)
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Fixed Party charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_PARTY_RATE_ID, 0, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
	checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

	//if Party rates not defined then apply general rates
	if(categoryTypeId == CATEGORY_TYPE_PARTY_ID) {
		//Specific Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, consigneeId);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

		//Specific Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, packingTypeId, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Generic Packing Type Rates (Only Route level charges)
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);

		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, consignmentGoodsId, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Generic Packing Type Rates (Only Loading Type level charges)
		rateMaster = filterRates(srcBranchId, 0, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, 0, chargeTypeId, 0, chargeSectionId, packingGrpTypeId, 0, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
		checkAndInsertRatesByCharges(rateMaster, rateMasterArr);
	}

	return rateMasterArr;
}

function checkAndInsertRatesByCharges(rateMaster, rateMasterArr) {
	if(rateMaster != null && rateMaster.length > 0) {
		for (var i = 0; i < rateMaster.length; i++) {
			rateMasterArr.push(rateMaster[i]);
		}
	}
}

var chargesChanged = false;

function excludeLoadingChargeOnFreight() {
	if(configuration.excludeLoadingChargeOnFreight == 'false')
		return;
	
	$("#charges input").add("#save").on("change", function() {
		chargesChanged = true;
	});
	
	if(chargesChanged) {
		$('#charge' + LOADING).val($('#charge' + LOADING).val());
		return;
	}
		
	let branchArray	= null;
	
	if(configuration.branchesToExcludeLoadingChargeOnFreightInChargeType != '0')
		branchArray										= (configuration.branchesToExcludeLoadingChargeOnFreightInChargeType).split(",");
	
	let chargeTypeArray									= (configuration.chargeTypeIdsForExcludeLoadingChargeOnFreight).split(",");
	let chargeTypeForLoadingCalculationOnFreight		= isValueExistInArray(chargeTypeArray, $('#chargeType').val()); 
	
	if((isValueExistInArray(branchArray, branchId) && chargeTypeForLoadingCalculationOnFreight
		|| branchArray == null && chargeTypeForLoadingCalculationOnFreight) && consigAddedtableRowsId.length > 0) {
		let		amount		= getConsignmentFreightAmount();
		let	qtyTot		= 0;

		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if ($('#quantity' + consigAddedtableRowsId[i]).html() > 0)
				qtyTot += parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
		}
		
		let loadingCharge	= Math.round(qtyTot * configuration.perArticleAmountFromFreightForLoadingCharge);
			
		if(amount < loadingCharge) {
			$('#charge' + FREIGHT).val(amount);
			return;
		}

		if(amount > loadingCharge) {
			$('#charge' + FREIGHT).val(Math.round(amount - loadingCharge));
			$('#charge' + LOADING).val(loadingCharge);
		}
	}
}

function setRatesOnDeclaredValue() {
	if (declaredValueRates == null) return;
	
	let declaredValueInput = $('#declaredValue').val();
	let declaredValueRatesNew	= [];
	
	if(freightRatePartyId > 0) {
		declaredValueRatesNew	= declaredValueRates.filter(function (el) {
			return el.corporateAccountId == freightRatePartyId
		});
	}
	
	if(declaredValueRatesNew.length == 0) {
		declaredValueRatesNew	= declaredValueRates.filter(function (el) {
			return el.corporateAccountId == 0
		});
	}
	
	let isSlabExist	= false;
	
	for(const item of declaredValueRatesNew) {
		let minValue = parseFloat(item.minValue);
		let maxValue = parseFloat(item.maxValue);
		
		isSlabExist = false;
	
		if (declaredValueInput >= minValue && declaredValueInput <= maxValue) {
			$('#charge' + item.chargeTypeMasterId).val(item.rate);
			$('#charge' + item.chargeTypeMasterId).prop('readonly', true);
			isSlabExist	= true;
			break;
		} else if(!isSlabExist || (declaredValueInput == '' || declaredValueInput == 0)) {
			$('#charge' + item.chargeTypeMasterId).val(0);
			$('#charge' + item.chargeTypeMasterId).prop('readonly', false);
		}
	}
}


function isSubregionForGroupLevelFixCharge() {
	return isValueExistInArray((configuration.subRegionIdsForGroupLevelFixCharge).split(','), executive.subRegionId);
}

function isRegionForGroupLevelFixCharge() {
	return isValueExistInArray((configuration.regionIdsForGroupLevelFixCharge).split(','), executive.regionId);
}

function calculateCustomFormCharge() {
	if(configuration.addDefaultFormChargeWhenEWayBillNotEntered == 'false')
		return;
	
	let formChargeValue = Number(configuration.defaultFormChargeAmount);
	let freightCharge	= Number($('#charge1').val())
	let freightAmtToCmp = Number(configuration.freightAmountToCompareForFormTypeCharge);
	let formChargeAmountForLessFreight = Number(configuration.formChargeAmountForLessFreight);
	let chargeWeightToCompareForFormTypeCharges= Number(configuration.chargeWeightToCompareForFormTypeCharges);
	let	chgweight			= Number($('#chargedWeight').val());
	
	if(isAllowToAddDefaultFormCharge())	{
		if(freightCharge > Number(freightAmtToCmp))
			 $('#charge' + FORM_CHARGES).val(formChargeRatesDB + formChargeValue);
		else
			$('#charge' + FORM_CHARGES).val(formChargeRatesDB + formChargeAmountForLessFreight);  
		
		if(chgweight > chargeWeightToCompareForFormTypeCharges) {
			if(($('#charge' + FORM_CHARGES).val() - formChargeRatesDB) < formChargeValue)
				 $('#charge' + FORM_CHARGES).val(formChargeRatesDB + formChargeValue);
		} else if(($('#charge' + FORM_CHARGES).val() - formChargeRatesDB) < formChargeAmountForLessFreight)
			$('#charge' + FORM_CHARGES).val(formChargeRatesDB + formChargeAmountForLessFreight);
	} else
		$('#charge' + FORM_CHARGES).val(formChargeRatesDB);
		
	calcTotal();
}

function getFixedHamaliSlabRates() {
	let	srcBranchId			= getSourceBranchForRate();
	let userInput			= Number($('#chargedWeight').val());	

	let corporateAccountId	= $('#partyMasterId').val();
	let wayBillTypeId 		= $('#wayBillType').val();
	
	if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
		corporateAccountId	= $('#partyMasterId').val();
	else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		corporateAccountId	= $('#consigneePartyMasterId').val();
	else if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		corporateAccountId	= $('#billingPartyId').val();
	
	if($('#wayBillType').val() != WAYBILL_TYPE_FOC && !jQuery.isEmptyObject(wayBillRates)) {
		let newArray = wayBillRates.filter(function (el) {
			return el.chargeSectionId == CHARGE_SECTION_FIXED_HAMALI_SLAB_RATE_ID && el.chargeTypeMasterId == HAMALI && el.slabMasterId > 0;
		});
		
		if(newArray.length == 0) return;
			
		let hamaliMinimumAmtArr = filterFixedHamaliRates(newArray, srcBranchId, corporateAccountId, wayBillTypeId);
		
		if(hamaliMinimumAmtArr.length == 0)
			hamaliMinimumAmtArr = filterFixedHamaliRates(newArray, srcBranchId, corporateAccountId, 0);

		for (const element of hamaliMinimumAmtArr) {
			let wayBillRatesObejct = element;
				
			if(userInput >= wayBillRatesObejct.minWeight && userInput <= wayBillRatesObejct.maxWeight) {
				setValueToTextField('charge' + HAMALI, wayBillRatesObejct.rate);
				$('#charge' + HAMALI).prop("readonly", "true");
				break;
			} else {
				setValueToTextField('charge' + HAMALI, 0);
				$('#charge' + HAMALI).prop('readonly', false);
			}
		}
	}
	
	calcTotal();

}

function filterFixedHamaliRates(wayBillRates, srcBranchId, corporateAccountId, wayBillTypeId) {
	let arr				= new Array();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		if(arr.length === 0) {
			arr	= wayBillRates.filter(function (el) {
				return Number(el.branchId) == Number(srcBranchId)
					&& Number(el.corporateAccountId) == Number(corporateAccountId)
					&& Number(el.categoryTypeId) == Number(CATEGORY_TYPE_PARTY_ID)
					&& Number(el.wayBillTypeId) == Number(wayBillTypeId);
			});
		}
		
		if(arr.length === 0) {
			arr = wayBillRates.filter(function (el) {
				return Number(el.branchId) == 0
					&& (el.isGroupLevel != undefined && el.isGroupLevel)
					&& Number(el.corporateAccountId) === Number(corporateAccountId)
					&& Number(el.categoryTypeId) === Number(CATEGORY_TYPE_PARTY_ID)
					&& Number(el.wayBillTypeId) === Number(wayBillTypeId);
				});
		}

		if(arr.length === 0) {
			arr	= wayBillRates.filter(function (el) {
				return Number(el.branchId) == Number(srcBranchId)
					&& Number(el.corporateAccountId) == 0
					&& Number(el.categoryTypeId) == Number(CATEGORY_TYPE_GENERAL_ID)
					&& Number(el.wayBillTypeId) == Number(wayBillTypeId);
			});
		}
	}
		
	return arr;
}

function setInternalStateCharges() {
	if(configuration.isAllowtoRemoveStaticalChargeFromFreight == 'false')
		return;
	
	let freightAmt					= getFreightAmountFromAddedConsignemnt();
	let sourceBranchStateId			= loggedInBranch.stateId;
	let destinationBranchStateId	= $('#destinationStateId').val();
	
	let staticalChargeAmtToMinusFromFreight = configuration.staticalChargeAmtToMinusFromFreight;

	if (configuration.allowInternalStateFixCharge === 'true' && sourceBranchStateId == destinationBranchStateId) {
		let chargesArray = configuration.internalStateChargeDetails.split(',');

		chargesArray.forEach(chargeDetail => {
			let chargeParts = chargeDetail.split('_');
			
			if (chargeParts.length === 4) {
				$('#charge' + STATICAL).val(0);
				$('#charge' + STATICAL).prop('readonly', false);
				
				let [srcStateId, destStateId, chargeId, chargeValue] = chargeParts;

				if (sourceBranchStateId == srcStateId && destinationBranchStateId == destStateId && freightAmt > chargeValue) {
					$('#charge' + STATICAL).prop('readonly', true);
					
					$('#charge' + chargeId).val(chargeValue);
					let finalFrightAmt = Number(freightAmt - chargeValue);
					
					if(lrWiseDecimalAmountAllow($('#wayBillType').val()))
						$('#charge' + FREIGHT).val(Number(finalFrightAmt.toFixed(2)));
					else
						$('#charge' + FREIGHT).val(Number(Math.round(finalFrightAmt)));
				}
			}
		});
	} else if(staticalChargeAmtToMinusFromFreight > 0) {
		$('#charge' + STATICAL).val(0);
		$('#charge' + STATICAL).prop('readonly', false);
		
		if(freightAmt > staticalChargeAmtToMinusFromFreight) {
			$('#charge' + STATICAL).val(staticalChargeAmtToMinusFromFreight);
			let finalFrightAmt = Number(freightAmt - staticalChargeAmtToMinusFromFreight);
			
			if(lrWiseDecimalAmountAllow($('#wayBillType').val()))
				$('#charge' + FREIGHT).val(Number(finalFrightAmt.toFixed(2)));
			else
				$('#charge' + FREIGHT).val(Number(Math.round(finalFrightAmt)));
			
			$('#charge' + STATICAL).prop('readonly', true);
		}
	}
}

function setRegionWiseStatisticalCharges() {
	let sourceBranchRegionId			= loggedInBranch.regionId
	let destinationBranchRegionId		= $('#destinationRegionId').val();
	let minimumStatisticalCharge		= Number(configuration.minimumStatisticalCharge);

	if (configuration.allowRegionWiseStatisticalCharge == 'true') {
		let chargesArray = configuration.regionWiseStatisticalChargeDetails.split(',');

		chargesArray.forEach(chargeDetail => {
			let chargeParts = chargeDetail.split('_');
			
			if (chargeParts.length === 3) {
				let [srcRegionId, destRegionId, chargeValue] = chargeParts;
				
				if (sourceBranchRegionId != destinationBranchRegionId && (sourceBranchRegionId == srcRegionId || destinationBranchRegionId == destRegionId))
					$('#charge' + STATISTICAL).val(chargeValue);
				else 
					$('#charge' + STATISTICAL).val(minimumStatisticalCharge);
			}
		});
	}
}

function chargeExemptedForBillingParty() {
	if ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.donotAllowLoadingChargeForBillingParty == 'true' && configuration.partyIdForLoadingChargeExemption != undefined) {
		let corporateId = configuration.partyIdForLoadingChargeExemption.split(',');

		if (isValueExistInArray(corporateId, $('#billingPartyId').val())) {
			$('#charge' + LOADING).val(0);
			$('#charge' + LOADING).prop("disabled", true);
		}
	}
}

function validateFOVOnDeclareVal() {
	if(configuration.validateFovChargeOnDeclareValue == 'false' || $('#wayBillType').val() == WAYBILL_TYPE_FOC)
		return;
	
	let typeofPacking		= 0;
	let fovChargeVal 		= 0;	
		
	if($('#typeofPackingId1').html() > 0)
		typeofPacking		= $('#typeofPackingId1').html();
	else
		typeofPacking		= $('#typeofPackingId').val();
	
	let packingTypeIdList = (configuration.exemptedPackingTypeIdForFOVChargeValidationOnDeclareValue).split(',');

	if (isValueExistInArray(packingTypeIdList, typeofPacking))
		return

	let minimumFovCharge = Number(configuration.minimumFovCharge);

	let declaredVal		= Number($("#declaredValue").val());

	if(chargesRates != undefined && chargesRates != null) {
		var chargeRate	= chargesRates[FOV];
		if (chargeRate && chargeRate != null) {
			fovChargeVal = Number((declaredVal * chargeRate.chargeMinAmount) / 100).toFixed(2);
		}
	}
	
	if (fovChargeVal < minimumFovCharge)
		$('#charge' + FOV).val(minimumFovCharge);
	else
		$('#charge' + FOV).val(fovChargeVal);
		
	$('#charge' + FOV).prop("readonly", "true");
}

function getFreightAmountFromAddedConsignemnt() {
	let freight	= 0;
	
	if(Number($('#chargeType').val()) == CHARGETYPE_ID_WEIGHT) {
		freight	= $('#weightAmount').val();
	} else if(Number($('#chargeType').val()) == CHARGETYPE_ID_QUANTITY) {
		if(consigAddedtableRowsId.length > 0) {
			for(const element of consigAddedtableRowsId) {
				if($('#qtyAmountTotal' + element).html() > 0)
					freight		+= parseFloat($('#qtyAmountTotal' + element).html());
			}
		}
	}
	
	return freight;
}

function regionWiseFixMinimumChargeWt() {
	return isValueExistInArray((configuration.regionToValidateMinimumChargeWt).split(','), executive.regionId);
}

function setFreightAndCrossing() {
	let totalFreight 							= getFreightAmountFromAddedConsignemnt();
	let srcDestRegionIdsForCrossingAndFrt 		= configuration.srcDestRegionIdsForCharges.split(',');
	let chargeIdsWithPercentageBasedOnRegion 	= configuration.chargeIdsWithPercentageForRegionToRegionRate.split(',');
	let srcDestSubRegionIdsForCrossingAndFrt 	= configuration.srcRegionDestSubRegionsForCharges.split(',');
	let chargeIdsWithPercentageBasedOnBranch 	= configuration.chargeIdsWithPercentageBasedOnBranch.split(',');

	let destinationRegionId 		= Number($('#destinationRegionId').val());
	let destinationSubRegionId 		= Number($('#destinationSubRegionId').val());
	let sourceRegionId 				= loggedInBranch.regionId;
	let logInBranchId				= loggedInBranch.branchId;

	let isSubRegionWiseChecking		= false;
	
	if (configuration.applyRegionToSubRegionPercentageChargeRateOnBookingTotal == 'true' && srcDestSubRegionIdsForCrossingAndFrt.length > 0) {
		srcDestSubRegionIdsForCrossingAndFrt.forEach(function(subRegionPair) {
			const [sourceRegionID, destSubID] = subRegionPair.split('_');
			
			if (sourceRegionId == sourceRegionID && destSubID == destinationSubRegionId) {
				isSubRegionWiseChecking	= true;
				
				if (totalFreight > 0) {
					let freight	= 1;
					$('#charge' + FREIGHT).val(freight);
					$('#charge' + CROSSING_BOOKING).val(totalFreight - freight);
					$('#charge' + CROSSING_BOOKING).prop("readonly", true);
					$('#charge' + FREIGHT).prop("readonly", true);
				}
			}
		});
	}

	if (!isSubRegionWiseChecking && configuration.applyRegionToRegionPercentageChargeRateOnBookingTotal == 'true' && chargeIdsWithPercentageBasedOnRegion.length > 0) {
		srcDestRegionIdsForCrossingAndFrt.forEach(function(regionPair) {
			const [sourceID, destID] = regionPair.split('_');
			
			if (sourceRegionId == sourceID && destinationRegionId == destID) {
				chargeIdsWithPercentageBasedOnRegion.forEach(function(chargeData) {
					const [chargeId, percentage] = chargeData.split('_');
				
					let calculatedAmount = (totalFreight * parseFloat(percentage)) / 100;
					$('#charge' + chargeId).val(calculatedAmount);
					$('#charge' + chargeId).prop("readonly", true);
				});
			}
		});
	}
	
	if (!isSubRegionWiseChecking && configuration.applyBranchPercentageChargeRateOnBookingTotal == 'true' && chargeIdsWithPercentageBasedOnBranch.length > 0) {
		chargeIdsWithPercentageBasedOnBranch.forEach(function(chargeData) {
			const [branchId, chargeId, percentage] = chargeData.split('_');

			if(logInBranchId == branchId) {
				let calculatedAmount = (totalFreight * parseFloat(percentage)) / 100;
				$('#charge' + chargeId).val(calculatedAmount);
				$('#charge' + chargeId).prop("readonly", true);
			}
		});
	}
}

function setPackingTypeWiseBranchMinWeight() {
	let	srcBranchId		= getSourceBranchForRate();
	let chargeSectionId	= CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID;
	let minimumWeight	= 0;
	
	let corporateAccountId 	= getPartyIdForMinimum();
	
	if(!jQuery.isEmptyObject(wayBillRates) && consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			let typeofPackingId 	= parseInt($('#typeofPackingId' + element).html());
			
			let arr	= wayBillRates.filter(function (el) {
				return Number(el.branchId)				== Number(srcBranchId)
					&& Number(el.corporateAccountId) 	== Number(corporateAccountId)
					&& Number(el.packingTypeId)			== typeofPackingId
					&& Number(el.categoryTypeId) 		== Number(CATEGORY_TYPE_PARTY_ID)
					&& Number(el.chargeSectionId)		== Number(chargeSectionId);
			});

			if(arr.length === 0) {
				arr	= wayBillRates.filter(function (el) {
					return Number(el.branchId) 				== Number(srcBranchId)
						&& Number(el.corporateAccountId) 	== 0
						&& Number(el.packingTypeId)			== typeofPackingId
						&& Number(el.categoryTypeId) 		== Number(CATEGORY_TYPE_GENERAL_ID)
						&& Number(el.chargeSectionId)		== Number(chargeSectionId);
				});
			}
			
			let qty	= Number($('#quantity' + element).html());
					
			for (const element1 of arr) {
				minimumWeight += element1.rate * qty;
			}
		}
	}
	
	return Math.round(minimumWeight);
}

function setRegionWiseFixedCharge() {
	if(configuration.isRegionWiseFixedCharge == 'false')
		return;
	
	let regionWiseFixedChargeArr	= (configuration.regionsWithFixedChargeAmount).split(',');
	
	for(let element of regionWiseFixedChargeArr) {
		let regionId	= element.split('_')[0];
		let chargeId	= element.split('_')[1];
		
		if(executive.regionId == regionId) {
			$('#charge' + chargeId).val(element.split('_')[2]);
			$('#charge' + chargeId).prop("readonly", "true");
		}
	}
}

function deductChargesFromFreight () {
	if(configuration.chargesToDeductFromFreight == '0') return;
	
	let freightToCalculate	= getConsignmentFreightAmount();
	
	let	chargesToDeductFromFreightArr	= configuration.chargesToDeductFromFreight.split(',');	
		
	totalChargesToDeductFromFreight = chargesToDeductFromFreightArr.reduce((sum, el) => {
		const val = $("#charge" + el).val();
		const num = Number(val);
		return val && !isNaN(num) && num > 0 ? sum + num : sum;
	}, 0);
	
	if(freightToCalculate >= totalChargesToDeductFromFreight)
		$('#charge' + FREIGHT).val(freightToCalculate - totalChargesToDeductFromFreight);		
}

function isRatePerArticle(chargeTypeMasterId) {
	if(configuration.chargesToCalculatePerArticle == '0')
		return false;
		
	let chargesToCalculatePerArticleArr	= (configuration.chargesToCalculatePerArticle).split(',');
	
	return isValueExistInArray(chargesToCalculatePerArticleArr, chargeTypeMasterId);
}

function calculateLoadingChargeOnFreightSlab() {
	if(configuration.calculateLoadingPerArticleOnFreightSlab == 'true') {
		let totalLoading = 0;
		
		if(consigAddedtableRowsId.length > 0) {
			for(const element of consigAddedtableRowsId) {
				let quantity	= parseInt($('#quantity' + element).html());
				let qtyAmount	= parseInt($('#qtyAmount' + element).html());
				
				totalLoading	+= loadingPerArticle(qtyAmount, quantity);
			}
		}
		
		$('#charge' + LOADING).val(totalLoading);
	}
}

function loadingPerArticle(totalFreight, quantity) {
	let loadingPerParcel	= 0;
		
	/*if(totalFreight > 0 && totalFreight <= 100)
		loadingPerParcel	= 10;
	else */if(totalFreight > 100 && totalFreight <= 250)
		loadingPerParcel	= 20;
	else if(totalFreight > 250)
		loadingPerParcel	= 30;
		
	return quantity * loadingPerParcel;
}

function isDifferentRegionForDirectAndCrossing() {
	let sourceRegionId		= loggedInBranch.regionId;
	let destRegionId		= Number($('#destinationRegionId').val());
	
	return sourceRegionId != destRegionId
}

function setDirectAndCrossingChargesOnMovementType() {
	if(!isDifferentRegionForDirectAndCrossing()) {
		$('#charge' + DIRECT_BOOKING).val(0);
		$("#charge" + DIRECT_BOOKING).prop('readonly', false).prop('disabled', false);
		return;
	}
	
	let movementVal			= $('#movementType').val();
	let freightAmount		= Number($('#charge' + FREIGHT).val());
	let freightToSet		= 1;
	let percentage			= 45;
	let crossingAmt			= Number($('#charge' + CROSSING_BOOKING).val());
	
	freightAmount -= freightToSet;

	disableCharge(CROSSING_BOOKING)
	disableCharge(DIRECT_BOOKING)
	
	if (!(freightAmount > 0 && movementVal > 0))
		return;
	
	let amount1 = freightAmount * (percentage / 100);
	let amount2 = freightAmount - amount1;
	let amtSetToCrossing = 0;

	if(crossingAmt > 0)	{
		if(movementVal == MOVEMENT_TYPE_DIRECT_ID)
			amtSetToCrossing = amount1 + crossingAmt;
		else if (movementVal == MOVEMENT_TYPE_CROSSING_ID) {
			amount2 += freightToSet;
			amtSetToCrossing = amount2 + crossingAmt
		}	
	} else if(movementVal == MOVEMENT_TYPE_DIRECT_ID)
		amtSetToCrossing = amount1;
	else if (movementVal == MOVEMENT_TYPE_CROSSING_ID)
		amtSetToCrossing = amount2 + freightToSet;
		
	if(movementVal == MOVEMENT_TYPE_DIRECT_ID) {
		$('#charge' + FREIGHT).val(Math.round(freightToSet));
		$('#charge' + CROSSING_BOOKING).val(Math.round(amtSetToCrossing));
		$('#charge' + DIRECT_BOOKING).val(Math.round(amount2));
		$("#charge" + DIRECT_BOOKING).prop('readonly', false).prop('disabled', false);
		$("#charge" + CROSSING_BOOKING).prop('readonly', false).prop('disabled', false);
	} else if (movementVal == MOVEMENT_TYPE_CROSSING_ID) {
		$('#charge' + FREIGHT).val(Math.round(amount1));
		$('#charge' + CROSSING_BOOKING).val(Math.round(amtSetToCrossing));
		$("#charge" + CROSSING_BOOKING).prop('readonly', false).prop('disabled', false);
	}
}