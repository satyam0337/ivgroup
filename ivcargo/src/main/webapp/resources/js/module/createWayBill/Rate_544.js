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

		calculatePackingTypeRates(quantity, typeofPacking,consignmentGoodsId);

		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
			checkRateForPackingType(qtyAmount, 1);
		else
			checkRateForPackingType(qtyAmount, quantity);
		
		idNum++
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
	if(configuration.validateArtDetailsAfterEnterQtyAmount == 'true') {
		if(validateAddArticle()) {
			var qtyAmount = $('#qtyAmount').val();
			var quantity  = $('#quantity').val();
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
				checkRateForPackingType(qtyAmount, 1);
			else
				checkRateForPackingType(qtyAmount, quantity);
		}
	} else {
		if(!validateConsignmentTables())
			return false;

		var qtyAmount = $('#qtyAmount').val();
		var quantity  = $('#quantity').val();
		
		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
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
		$('#searchRate').val(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyAmt));
	} else {
		var tempString		= new Array();
		var fromsearchRate	= $('#searchRate').val();
		var qtyRateFromEle	= fromsearchRate.split(",");
		var amount = 0;
		var finalQtyRate = 0;
		
		for(var j = 0; j < qtyRateFromEle.length; j++){
			var chargeTypeId	= parseInt(qtyRateFromEle[j].split("=")[0]);
			var qtyrate			= parseFloat(qtyRateFromEle[j].split("=")[1]);
			
			if(qtyRateFromEle[j].split("=")[0] == BookingChargeConstant.FREIGHT) {
				qtyrate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);

				isFreightRateExist = true;
				finalQtyRate = qtyrate;
			}
			
			if(configuration.deductHamaliChargeFromFreight == 'true' && qtyRateFromEle[j].split("=")[0] == BookingChargeConstant.SRS_HAMALI_BOOKING)
				hamaliChargeAmt = qtyrate;
			
			if(calculateMinimumQtyAmt(qtyRateFromEle[j].split("=")[0], qtyAmount, chargeTypeId))
				qtyrate = MinQtyAmtTobeAssigned;
			
			tempString.push(chargeTypeId+"="+qtyrate);
		}
		
		if(!isFreightRateExist) {
			finalQtyRate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
			
			if(finalQtyRate > hamaliChargeAmt && configuration.deductHamaliChargeFromFreight == 'true')
				tempString.push(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate - hamaliChargeAmt))
			else
				tempString.push(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate))
		}
	
		if(configuration.deductHamaliChargeFromFreight == 'true'){
			for(var i = 0; i < tempString.length; i++) {
				if(tempString[i].split("=")[0] == BookingChargeConstant.HAMALI) {
					amount = parseFloat(amount) + parseFloat(tempString[i].split("=")[1]);
					
					if(finalQtyRate < amount)
						tempString.splice(i, 1); 
				} else if(tempString[i].split("=")[0] == BookingChargeConstant.FREIGHT) {
					tempString.splice(i, 1); 
					
					if(hamaliChargeAmt >= finalQtyRate)
						tempString.push(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate))
					else
						tempString.push(BookingChargeConstant.FREIGHT + '=' + parseFloat(finalQtyRate - hamaliChargeAmt))
				}
			}
		}
		
		if(tempString != "" && tempString != null){
			$('#searchRate').val(tempString);
		};
	};
}


function calculateChargeAmount(filter, qtyAmount, quantity) {
	if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		quantity = Number($('#actualWeight').val()); 
	
	var artActWeight	= 1;
	
	if(configuration.WeightWiseConsignmentAmount == 'true' && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
		artActWeight	= $('#artActWeight').val();
	
	var amt = 0;

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
		amt = 0;
		break;
	}
	
	if(Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER && distance > 0)
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
			
			if(chargeTypeId == BookingChargeConstant.FREIGHT) {
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
		tempString += "," + BookingChargeConstant.FREIGHT + '=' + calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);;

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
		if(partyCategory == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)) {

			addRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_NAME);
			setRateType();
		} else if(partyCategory == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID
				&& document.getElementById(partyMasterId).value > 0
				&& !rateTypeExists(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)) {
			addRateType(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_NAME);
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

	if(currentWayBillTypeId == WayBillType.WAYBILL_TYPE_PAID)
		$("#rateType").val(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
	else if(currentWayBillTypeId == WayBillType.WAYBILL_TYPE_TO_PAY)
		$("#rateType").val(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
}

function removeRateType(val) {
	$("#rateType option[value='" + val + "']").remove();
}

function editChargedWeight(obj) {

	var actualWeight  		= parseFloat($('#actualWeight').val());
	var chargedWeight 		= parseFloat($('#chargedWeight').val());

	minWeight			= partyMinimumWeight();
	
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
	
	if(configuration.setDefaultChargeWeight == 'true' && !chgwgtActWgtConditionForLess && Number($('#chargedWeight').val()) < configuration.defaultChargeWeightValue) {
		var actualWeight	= Number($('#actualWeight').val());
		
		if(actualWeight > 0) {
			showMessage('info', chargedWeightLessThanInfoMsg(configuration.defaultChargeWeightValue));
			$('#chargedWeight').val(configuration.defaultChargeWeightValue)
			setTimeout(function(){ $('#chargedWeight').focus(); }, 0);
			return false;
		}
	}
}

function editWeightRate() { 
	//weightFromDb is globally defined

	if(configuration.AllowLessWeightRateApplyFromRateMater == 'true')
		return;

	var weightRate		= 0.0;

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

	var quantityAmount	= 0;

	if(getValueFromInputField('qtyAmount') != null)
		quantityAmount	= getValueFromInputField('qtyAmount')

	if(quantityAmount < qtyAmt) {
		setValueToTextField('qtyAmount', qtyAmt);
		//alert('You can not enter Qty Amount less than ' + qtyAmt);
		showMessage('info', qtyAmountLessThanInfoMsg(qtyAmt));
		return false;
	}
}

function calculateChargedWeight(obj) {
	var bookingType 	= $('#bookingType').val();
	var actualWeight	= $('#actualWeight').val();
	chargedWeight		= $('#chargedWeight').val();
	var isWeightAllow	= true;
	var capacity		= 0;
	var totalQty		= $('#totalQty').html();
	minWeight			= partyMinimumWeight();
	var newChargeWeight = Number(totalQty) * Number(configuration.configWghtToCalculateChargeWght);

	if(configuration.IsDisplayAlertToSelectLCV == 'true'
		&& Number(actualWeight) >= configuration.MaxWeightToShowAlertForLCV && getBookingType() == configuration.OnBookingTypeToShowAlertForLCV)
		alert('Please Select LCV');

	if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
		var vehicleTypeValue = $('#vehicleType').val();

		if(vehicleTypeValue != 0 && vehicleTypeValue != null) {
			var val 	= vehicleTypeValue.split(",");
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

	if(isWeightAllow) {		
		if(actualWeight == 0)
			$('#chargedWeight').val(0);
		else if(configuration.calChargeWghtIfActualWghtLessThanConfiguredWght == 'true' && actualWeight >= 1 && newChargeWeight > actualWeight && actualWeight <= Number(configuration.minActualWghtToCalChargeWghtWithConfigWght) && !isManualWayBill)
			$('#chargedWeight').val(newChargeWeight);
		else if(actualWeight >= 1 && actualWeight <= parseInt(minWeight))
			$('#chargedWeight').val(parseInt(minWeight));
		else if((obj.id == 'actualWeight') && (parseInt(actualWeight) > parseInt(configuration.actualWeightValue)) && (configuration.checkActualWeight == 'true') ){
			if(bookingType == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID){
				confirm("You are booking LR with more than " + parseInt(configuration.actualWeightValue) + " kg.\n\nAre you sure you want to book in 'SUNDRY' ?");
				$('#chargedWeight').val(actualWeight);
			}
		} else if(configuration.roundOffChargeWeight  == 'true') {
			/*
			 * Here we are calculating round off value of charge Weight on Particular party
			 */
			$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
		} else
			$('#chargedWeight').val(actualWeight);

		$('#previousActualWeight').val(actualWeight);

		if(bookingType == BookingTypeConstant.BOOKING_TYPE_FTL_ID && actualWeight < capacity) {
			alert('Not Optimizing the space of Vehicle');
			$('#chargedWeight').val(actualWeight);
		}
	} else {
		$('#actualWeight').val($('#previousActualWeight').val());
		alert('Capacity of Selected Vehicle is ' + capacity + ' so you can not enter Actual Weight more than that');
	}

	if(configuration.AllowMinActualWeight == 'true') {
		var minActWght = configuration.MinActualWeight;

		if(Number(actualWeight) > Number(minActWght)) {
			$('#actualWeight').val(actualWeight);
			$('#chargedWeight').val(actualWeight);
		} else {
			$('#actualWeight').val(minActWght);
			$('#chargedWeight').val(minActWght);
		}
	}

	if(configuration.AllowMinChargedWeight == 'true') {
		var minChrdWght = configuration.MinChargedWeight;

		if(Number(actualWeight) == 0)
			$('#actualWeight').val(actualWeight);
		else if(Number(actualWeight) < Number(minChrdWght))
			$('#chargedWeight').val(minChrdWght);
	}

	if(configuration.roundOffIncreasedChargedWeightValue == 'true') {
		var number 		= configuration.numberToRoundOffChargedWeight;
		var branches	= (configuration.roundOffChargedWeightByTensForBranchs).split(",");
		
		if(configuration.roundOffChargedWeightByTens == 'true') {
			for(var i = 0 ; i < branches.length; i++) {
				if(branches[i] == branchId)  //branchId is gloabally defined, it is Executive branch Id
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
	var weigthFreightRate 	= $('#weigthFreightRate').val();
	var chargedWeight 		= parseFloat($('#chargedWeight').val());

	if(chargedWeight != 0 && weigthFreightRate != 0) {
		var total = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);
		
		if(!lrWiseDecimalAmountAllow($('#wayBillType').val()))
			total 	= Math.round(total);
		else
			total	= total.toFixed(2);

		$('#weightAmount').val(total);
	}
}

function getChargesRates() {
	var	corporateAccountId	= 0;
	var configObject		= null;
	var configData			= new Object();
	isSlabRateNotExists 	= false;
	
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

	var	branchId		= getSourceBranchForRate();
	var destBranchId	= $('#destinationBranchId').val();
	
	configObject = filterLRLevelRates(3, branchId, destBranchId, corporateAccountId, 0, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'false' && (configObject == null || configObject.length == 0)) {
		configObject = filterLRLevelRates(3, branchId, destBranchId, 0, 0, 0, 0);
		checkAndInsertRates(configObject, configData, 0, 3);
	}
	
	return configData;
}

//get rates from ratemaster and charge configuration table
function checkAjaxRates() {
	if ($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC)
		return;

	var destBranchId		= $('#destinationBranchId').val();
	var corporateAccountId	= getLRTypeWisePartyId();

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

	var jsonObject	= setDataToGetRate(destBranchId, corporateAccountId, partyTypeId);

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("RouteAndLRLevelWiseRate.do?pageId=9&eventId=15",
			{json:jsonStr,filter:4}, function(data) {
				resetBusinessType();
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						resetDisabledCharges();
						console.log("No rates");
						packingTypeList			= null;
						consignmentGoodsListHM	= null;
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
					//businessTypeId				= data.businessTypeId;
					
					if(freightRatePartyId > 0) {
						var party	= partyWiseDataHM[freightRatePartyId];
						
						if(party != undefined)
							businessTypeId	= party.businessTypeId;
						
						if(businessTypeId > 0) {
							$('#businessType').val(businessTypeId);
							$('#businessType').prop('disabled', true);
						}
					}

					partyMinimumRates();
					partyMinimumWeight();

					if(chargeTypeFlavour != '4') {
						getWeightTypeRates();
						getPackingTypeRates();
						applyRates();
						loadRatesDef.resolve();
					}
				}
			});
}

function applyRateForPartyType(){
}

//filter rate as par user selection get revert filterd data 
function filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;
	var newDestBranchId	= destBranchId;
	var businessTypeId 	= 0;
	
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

			if(chargeSectionId == RateMaster.CHARGE_SECTION_FIXED_PARTY_RATE_ID && datarates.chargeSectionId == chargeSectionId)//fix party rate
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
			
			if(chargeSectionId == RateMaster.CHARGE_SECTION_FIXED_RATE_ID) { //fixed rate
				if(datarates.chargedFixed && datarates.chargeSectionId == chargeSectionId) {
					if(Number(datarates.accountGroupId) 				== Number(accountGroupId)
							&& Number(datarates.branchId) 				== Number(srcBranchId)
							&& Number(datarates.destinationBranchId) 	== Number(destBranchId)
							&& Number(datarates.corporateAccountId) 	== Number(corporateAccountId)) {
						arr.push(wayBillRates[i]);
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
				&& Number(datarates.businessTypeId) 		== Number(businessTypeId)
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}
	
	return arr;
}

//filter rate as par user selection get revert filterd data 
function filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			
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
			
			if(Number(datarates.accountGroupId) 				== Number(accountGroupId)
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
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}
	
	return arr;
}

//filter rate as par user selection get revert filterd data 
function filterLRLevelRates(filter, srcBranchId, destBranchId, corporateAccountId, applicableOnCatetgoryId, fieldId, declaredValue) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();

	switch (filter) {
	case 3 :
		if(!jQuery.isEmptyObject(chargesConfigRates) && chargesConfigRates.length > 0) {
			for (var i = 0; i < chargesConfigRates.length; i++) {
				var rates = chargesConfigRates[i];
				
				if(Number(rates.destinationBranchId) == 0)
					destBranchId		= 0;
				
				if(Number(rates.accountGroupId) 			== Number(accountGroupId)
						&& Number(rates.branchId) 			== Number(srcBranchId)
						&& Number(rates.corporateAccountId) == Number(corporateAccountId)
						&& Number(rates.destinationBranchId) == Number(destBranchId)
				) {
					arr.push(chargesConfigRates[i]);
				}
			}
		}

		break;
	case 4 :
		if(!jQuery.isEmptyObject(chargesConfigRates)) {
			for (var i = 0; i < chargesConfigRates.length; i++) {
				var rates = chargesConfigRates[i];

				if(Number(rates.accountGroupId) 					== Number(accountGroupId)
						&& Number(rates.branchId) 					== Number(srcBranchId)
						&& Number(rates.corporateAccountId) 		== Number(corporateAccountId)
						&& Number(rates.applicableOnCatetgoryId) 	== Number(applicableOnCatetgoryId)
						&& Number(rates.fieldId) 					== Number(fieldId)
						&& Number(rates.destinationBranchId)		== Number(destBranchId)
						&& Number(declaredValue) > 0
				) {
					arr.push(chargesConfigRates[i]);
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

//filter rate as par user selection get revert filterd data 
function filterPartyMinRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, applicableOnCatetgoryId, fieldId, declaredValue) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];

			if(Number(datarates.accountGroupId) 				== Number(accountGroupId)
					&& Number(datarates.branchId) 				== Number(srcBranchId)
					&& Number(datarates.destinationBranchId) 	== Number(destBranchId)
					&& Number(datarates.vehicleTypeId) 			== Number(vehicleTypeId)
					&& Number(datarates.packingTypeId) 			== Number(packingTypeId)
					&& Number(datarates.categoryTypeId) 		== Number(categoryTypeId)
					&& Number(datarates.corporateAccountId) 	== Number(corporateAccountId)
					&& Number(datarates.chargeTypeId) 			== Number(chargeTypeId)
					&& Number(datarates.chargeSectionId) 		== Number(chargeSectionId)
			) {
				arr.push(wayBillRates[i]);
			}
		}
	}

	return arr;
}

//check if rates is availabe and insert in array 
function checkAndInsertRates(rateMaster ,rateId_mast, userInput, filter) {
	switch (filter) {
	case 1:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null || (typeof rateId_mast[rateMaster[i].chargeTypeMasterId] == 'undefined') || rateId_mast[rateMaster[i].chargeTypeMasterId] == 0) {
					if(rateMaster[i].minWeight > 0 && rateMaster[i].maxWeight > 0) {
						if((configuration.isApplyFixRateonArticleRate == 'true' || configuration.isApplyFixRateonArticleRate == true)
							&& rateMaster[i].minWeight == rateMaster[i].maxWeight) {
							rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
							actualSlabValue = rateMaster[i].minWeight;
							isApplyFixRateonArticleRateMinMaxArticleWise = true;
						}
						
						if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight) {
							rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
						} else {
							isSlabRateNotExists = true;
							rateId_mast[rateMaster[i].chargeTypeMasterId] = 0;
						}
					} else {
						isSlabRateNotExists = true;
						rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
						isApplyFixRateonArticleRateMinMaxArticleWise = false;
					}
					
					if(rateMaster[i].chargedFixed && rateMaster[i] && rateMaster[i].rate > 0 && rateMaster[i].chargeSectionId == RateMaster.CHARGE_SECTION_FIXED_RATE_ID)
						fixedChargeRateObj[rateMaster[i].chargeTypeMasterId] = true;
				} else {
					if(rateMaster[i].minWeight > 0 && rateMaster[i].maxWeight > 0
						&& (configuration.isApplyFixRateonArticleRate == 'true' || configuration.isApplyFixRateonArticleRate == true)
						&& rateMaster[i].rate > rateId_mast[rateMaster[i].chargeTypeMasterId] && rateMaster[i].minWeight == rateMaster[i].maxWeight) {
						rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
						actualSlabValue = rateMaster[i].minWeight;
						isApplyFixRateonArticleRateMinMaxArticleWise = true;
					}

					if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight && isSlabRateNotExists) {
						isSlabRateNotExists = false;
							
						if(rateId_mast[rateMaster[i].chargeTypeMasterId] <= 0)
							rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
							
						isApplyFixRateonArticleRateMinMaxArticleWise = false;
					}
				}
			}
		}
		break;

	case 2:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null && rateMaster[i].rate > 0) {
					rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
					configuredChargeTypeIdWithCharge[rateMaster[i].chargeTypeMasterId] = rateMaster[i].chargeTypeId;
				}
			}
		}
		break;

	case 3:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null || (typeof rateId_mast[rateMaster[i].chargeTypeMasterId] == 'undefined'))
					rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
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
	var chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_WEIGHT;
	
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var chargeSectionId		= 0;
	isSlabRateNotExists 	= false;

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
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_PARTY_RATE_ID, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId)
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0)
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
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId)
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0)
		checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	}
	

	return rateId_mast;
}

//applied various condition for packing type rates form rate master
function getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, packingTypeId, packingGrpTypeId, userArticleInput, rateTypeId, consignmentGoodsId, consigneeId) {

	var chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_QUANTITY;
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var chargeSectionId		= 0;
	isSlabRateNotExists 	= false;

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
	
	//Fixed Party charges
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_PARTY_RATE_ID, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Fix Rate
	rateMaster = filterRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
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
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Filter Slab Wise Rate
		rateMaster = filterSlabRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, consigneeId);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput,1);
		
		//Filter Fix Rate
		rateMaster = filterRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, rateTypeId, RateMaster.CHARGE_SECTION_FIXED_RATE_ID, 0, 0, 0);
		checkAndInsertRates(rateMaster, rateId_mast, userArticleInput,1);
	}

	return rateId_mast;
}

//condition for party minimim rates
function partyMinRate(srcBranchId,destBranchId,corporateAccountId,categoryTypeId,rateTypeId) {

	var rateId_mast			= new Object();
	var chargeSectionId		= RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID;

	rateMaster = filterPartyMinRates(srcBranchId, destBranchId, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, chargeSectionId, 0, 0, 0);
	
	if(rateMaster != null && rateMaster.length > 0) {
		for (var i = 0; i < rateMaster.length; i++) {
			if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null && rateMaster[i].rate > 0)
				rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
		}
	}

	if(jQuery.isEmptyObject(rateId_mast)) {
		rateMaster = filterPartyMinRates(srcBranchId, destBranchId, RateMaster.CATEGORY_TYPE_GENERAL_ID, 0, 0, 0, 0, 0, chargeSectionId, 0, 0, 0);
		
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
	
	if(Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRate == 'true' && configuration.ChargeCubicRateCBMWise == 'true')
		return;
	
	var chargedWeight		= $('#chargedWeight').val();
	var typeofPacking		= 0;
	var consignmentGoodsId	= 0;

	if($('#typeofPackingId1').html() > 0)
		typeofPacking 		= $('#typeofPackingId1').html();
	else
		typeofPacking 		= $('#typeofPackingId').val();
	
	if($('#consignmentGoodsId1').html() > 0)
		consignmentGoodsId	= $('#consignmentGoodsId1').html();
	
	var weightAmnt			= calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId);
	$('#qtyAmount').val(weightAmnt);

	if((configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true)
		&& getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
		var vehicleTypeValue = $('#vehicleType').val();

		if(vehicleTypeValue != 0 && vehicleTypeValue != null) {
			var val 	= vehicleTypeValue.split(",");
			capacity	= parseFloat(val[1]);

			if(Number($('#chargedWeight').val()) > Number(capacity)){
				var F= Number($('#charge1').val());
				var R= Number($('#fixAmount').val());
				var C= Number(capacity);
				var W= Number($('#chargedWeight').val());
				$('#fixAmount').val(Math.round(F + (R/C) * (W - C)));
			}
		}
	}
}

function calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId) {
	if(configuration.applyRateAuto == 'false')
		return;

	var	srcBranchId			= getSourceBranchForRate();
	var destBranchId		= $('#destinationBranchId').val();
	var vehicleTypeValue	= $('#vehicleType').val();
	var vehicleTypeId		= 0;
	var packingGrpTypeId	= 0;
	var val					= new Array();
	var visibleRate	= 0;

	if ($('#vehicleType').exists() && vehicleTypeValue != 0 && vehicleTypeValue != null) {
		val				= vehicleTypeValue.split(",");
		vehicleTypeId	= parseInt(val[0]);
	}

	var corporateAccountId	= 0;
	var categoryTypeId		= 0;
	var rateTypeId			= 0;
	var billingPartyId		= Number($('#billingPartyId').val());
	var partyMasterId		= Number($('#partyMasterId').val());
	var consigneeId			= Number($('#consigneePartyMasterId').val());

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
	} else {
		corporateAccountId	= 0;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
		rateTypeId			= 0;
	}

	for(var i = 0; i < PackingGroupMappingArr.length; i++) {
		if(PackingGroupMappingArr[i].packingTypeMasterId == typeofPacking) {
			packingGrpTypeId	= PackingGroupMappingArr[i].packingGroupTypeId;
		}
	}
	
	fixedChargeRateObj					= {};

	if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		var response =  getWghtTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, chargedWeight, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response && !jQuery.isEmptyObject(response)) {
			weightFromDb		= 0;
			weightFromDb 		= getFreightChargeForRates(response);
			purefrieghtAmount	= getFreightChargeForRates(response);
			var actualWeight	= Number($('#actualWeight').val());
			var chargedWeight 	= Number($('#chargedWeight').val());

			$('#weigthFreightRate').val(configuration.defaultWeigthFreightRateAmount);
			$('#weightAmount').val(0);
			$('#fixAmount').val(0);
			visibleRate = getVisibleRates(response);

			if(weightFromDb > 0) {
				var weightAmount	= 0;
				
				if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
					weightAmount	= parseFloat(weightFromDb * actualWeight);
				else
					weightAmount	= parseFloat(weightFromDb * chargedWeight);
				
				$('#weightAmount').val(weightAmount.toFixed(2));

				$('#weigthFreightRate').val(weightFromDb);
				$('#visibleRateAmt').val(visibleRate);
				
				if (configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true)
					$('#fixAmount').val(weightFromDb);
				
				if(configuration.disableRateIfFoundFromDB == 'true' && $('#weigthFreightRate').val() > 0)
					$('#weigthFreightRate').prop('readonly', true); 
			}

			$('#pureFrieghtAmt').html(purefrieghtAmount);
			
			if(configuration.specificFreightChargeAmount <= 0)
				displaySpecificRate(response);
			
			var tempString;
			
			if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT)
				tempString		= getTempStringForRates(response, actualWeight);
			else
				tempString		= getTempStringForRates(response, chargedWeight);

			weightTypeArr = new Array();
			weightTypeArr.push(tempString);
		} else {
			weightTypeArr = new Array();
			$('#charge' + BookingChargeConstant.LR_CHARGE).val(0);
			calculateWeigthRate();
			checkIfnotPresent();
			resetSpecificCharges();
		}
		
		applyRates();
	} 
}

function displaySpecificRate(response) {
	var charges	= jsondata.charges;

	for(var i = 0; i < charges.length; i++) {
		if(response[charges[i].chargeTypeMasterId] == undefined)
			response[charges[i].chargeTypeMasterId]	= 0;

		setValueToHtmlTag('SpecificRate_' + charges[i].chargeTypeMasterId, Number(response[charges[i].chargeTypeMasterId].rate));
	}
}

function getPackingTypeRates() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return false;
	
	var quantity			= $('#quantity').val();
	
	var typeofPacking = 0;
	
	if($('#typeofPacking').val() > 0)
		typeofPacking		= $('#typeofPacking').val();
	else
		typeofPacking		= $('#typeofPackingId').val();
	
	var consignmentGoodsId	= 0;
	
	if(configuration.rateApplicableOnSaidToContain == 'true')
		consignmentGoodsId	= $('#consignmentGoodsId').val();
	
	qtyAmt				= calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);
	
	if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt <= 0 && $('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
		enableDisableInputField('qtyAmount', 'false');
	
	$('#qtyAmount').val(qtyAmt);
	
	if ($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC
		&& (configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true)) {
		if(qtyAmt <= 0)
			enableDisableInputField('qtyAmount', 'true');
		else
			enableDisableInputField('qtyAmount', 'false');
	}
}

function getFreightChargeForRates(response) {
	var amnt = 0;

	if(response[BookingChargeConstant.FREIGHT] != null)
		amnt	= response[BookingChargeConstant.FREIGHT];
		
	return Number(amnt.rate);
} 
function getVisibleRates(response) {
	var amnt = null;;

	if(response[BookingChargeConstant.FREIGHT] != null)
		amnt	= response[BookingChargeConstant.FREIGHT];
		
	if(amnt != null && amnt.visibleRate != undefined)
		return Number(amnt.visibleRate);
	else 
		return 0;
} 

function getAOCPercentageValue(response) {
	var AOCPercentageValue	= 0;

	if(response[BookingChargeConstant.AOC] != null)
		AOCPercentageValue	= Number(response[BookingChargeConstant.AOC]);

	return AOCPercentageValue;
}

function getFOVChargeValue(response) {
	var FOVChargeValue	= 0;

	if(response[BookingChargeConstant.FOV] != null)
		FOVChargeValue	= Number(response[BookingChargeConstant.FOV]);

	return FOVChargeValue;
}

function getTempStringForRates(response,quantity){
	var tempString = "";
	var chargeMasterId	= 0;
	var qtyAmt			= 0;
	var chargeType		= $('#chargeType').val();
	var totalQty		= $('#totalQty').html();
	var actualWeight	= $('#actualWeight').val();
	var rateObj = null;

	for (var key in response) {
		chargeMasterId	= Number(key);
		rateObj = response[key];
		
	if(rateObj.rate != undefined && rateObj.rate != 'undefined'){
		if(configuration.ApplyArticleWiseRateOnWeightType == 'true' && getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID
				&& jQuery.inArray(chargeMasterId + "", chargesToApplyArticleWiseRateOnWeightType) != -1) { //chargesToApplyArticleWiseRateOnWeightType coming from property
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
				qtyAmt	= Number(rateObj.rate) * Number(quantity);
			else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
				if(actualWeight > 0)
					qtyAmt	= Number(rateObj.rate) * Number(totalQty);
				else
					qtyAmt	= Number(rateObj.rate) * Number(quantity);
			} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(rateObj.rate) * Number(totalQty) * distance;
			else
				qtyAmt	= Number(rateObj.rate);
			
		} else if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && jQuery.inArray(chargeMasterId + "", aplyRateForCharges) != -1 ) { //aplyRateForCharges coming from Property
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(rateObj.rate) * Number(quantity) * distance;
			else
				qtyAmt	= Number(rateObj.rate) * Number(quantity);
		} else {
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
				qtyAmt	= Number(rateObj.rate) * distance;
			else
				qtyAmt	= Number(rateObj.rate);
		}
		
		if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
			if(configuredChargeTypeIdWithCharge[chargeMasterId] != null) {
				var chargeType	= configuredChargeTypeIdWithCharge[chargeMasterId];
				
				if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
					qtyAmt	= Number(rateObj.rate) * Number(totalQty);
				else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
					qtyAmt	= Number(rateObj.rate) * Number($('#chargedWeight').val());
			}
		}
		
		if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID 
				&& fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId]) {
			qtyAmt	= Number(rateObj.rate);
		}
		
		tempString += chargeMasterId+'='+qtyAmt+',';
		}
	}

	return tempString;
}

function chargeDisableFromRate() {
	if (configuration.DisableChargesToApplyArticleWiseRateOnWeightType == 'true' ||
			configuration.DisableChargesToApplyArticleWiseRateOnWeightType == true) {
		var charges	= chargesToApplyArticleWiseRateOnWeightType;
		
		if(configuration.ApplyArticleWiseRateOnWeightType == 'true' || configuration.ApplyArticleWiseRateOnWeightType == true) {
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

	var	srcBranchId			= getSourceBranchForRate();
	var destBranchId		= $('#destinationBranchId').val();
	var vehicleTypeValue	= $('#vehicleType').val();

	var vehicleTypeId		= 0;
	var packingGrpTypeId	= 0;

	if ($('#vehicleType').exists() && vehicleTypeValue != 0 && vehicleTypeValue != null) {
		var val			= vehicleTypeValue.split(",");
		vehicleTypeId	= parseInt(val[0]);
	}
	
	var corporateAccountId	= 0;
	var categoryTypeId		= 0;
	var rateTypeId			= 0;
	var billingPartyId		= Number($('#billingPartyId').val());
	var partyMasterId		= Number($('#partyMasterId').val());
	var chargeTypeId		= Number($('#chargeType').val());
	var consigneeId			= Number($('#consigneePartyMasterId').val());

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
	} else {
		corporateAccountId	= 0;
		categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
		rateTypeId			= 0;
	}

	var qtyAmt = 0;
	var visibleQuantityRateAmt = 0;
	
	for(var i = 0; i < PackingGroupMappingArr.length; i++) {
		if(PackingGroupMappingArr[i].packingTypeMasterId == typeofPacking)
			packingGrpTypeId	= PackingGroupMappingArr[i].packingGroupTypeId;
	}
	
	//configuredChargeTypeIdWithCharge	= {};
	fixedChargeRateObj					= {};
	
	if(typeofPacking > 0 && $('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		var response = getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, quantity, rateTypeId, consignmentGoodsId, consigneeId);
		
		visibleQuantityRateAmt = getVisibleRates(response);
		$('#visibleQuantityRateAmt').val(visibleQuantityRateAmt);
		
		if(response && !jQuery.isEmptyObject(response)) {
			if(applyRateForSpecificArticle && noOfArticlesAdded == 0 && chargeTypeId != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) { // 3 is Article Type
				if(getFreightChargeForRates(response) > 0) { 
					$('#chargeType').val(ChargeTypeConstant.CHARGETYPE_ID_QUANTITY); //  3 is Article Type
					changeOnChargeType();
					qtyAmt 				= getFreightChargeForRates(response);
				}
			} else if(chargeTypeId == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
				qtyAmt 				= getFreightChargeForRates(response);

			var tempString		=	getTempStringForRates(response,quantity);
			$('#searchRate').val(tempString);
			
			if(configuration.disableRateIfFoundFromDB == 'true' && qtyAmt > 0)
				enableDisableInputField('qtyAmount', 'true');
			
			purefrieghtAmount	= getFreightChargeForRates(response);
			setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);
			
			if(configuration.specificFreightChargeAmount <= 0)
				displaySpecificRate(response);
			
			applyExtraCharges();
		} else
			resetSpecificCharges();
	} 

	return qtyAmt;
}

function getPartyIdForMinimum() {
	var corporateAccountId 		= 0;
	var billingPartyId			= Number($('#billingPartyId').val());
	var partyMasterId			= Number($('#partyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
	} else if($("#rateType").val() != null && $("#rateType").val() != '') {
		setRateType();
		
		if($("#rateType").val() == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
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
		return false;

	var corporateAccountId	= getPartyIdForMinimum();

	if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		minAmt	= Number(jsonPartyMinAMt[corporateAccountId]);
		if(minAmt) $('#partyMinimumRate').val(Number(minAmt));
	} else {
		minAmt = 0;
	};
}

function partyMinimumWeight() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return false;
	
	if(configuration.ApplyMinimumWeightOnPartyFromRateMaster == 'true') {
		var chargeType = document.getElementById('chargeType');
	
		if(chargeType != null  && chargeType.value == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
			return false;
	}

	var corporateAccountId	= getPartyIdForMinimum();
	var minWeight			= Number(jsonPartyMinWeight[corporateAccountId]);

	if(isNaN(minWeight))
		minWeight 			= configuration.MinWeight;

	return minWeight;
}

function partyMinimumSlab() {
	if(isManualWayBill && configuration.ApplyRateInManual != 'true')
		return false;

	var corporateAccountId	= getPartyIdForMinimum();

	return jsonPartyMinSlab[corporateAccountId];
}

function calculateLBHOnChargeType(obj) {
	var chargeType = document.getElementById('chargeType');

	if(chargeType.value == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE || (configuration.VolumetricRate) == 'true') {
		var length   	= $('#length').val();
		var breadth  	= $('#breadth').val();
		var height   	= $('#height').val();
		var lbhTotal 	= document.getElementById('lbhTotal');

		lbhTotal.value = length * breadth * height;

		if(lbhTotal.value > 0) {
			if(configuration.defaultLBHOperator == TransportCommonMaster.LBH_OPERATOR_MULTIPLY_ID) {
				$('#actualWeight').val(Math.round((lbhTotal.value) * (configuration.defaultLBHValue)));
				
				if (configuration.TemporaryWght == 'true')
					$('#tempWeight').val(Math.round((lbhTotal.value) * (configuration.defaultLBHValue)));
			} else if(configuration.defaultLBHOperator == TransportCommonMaster.LBH_OPERATOR_DIVIDE_ID) {
				$('#actualWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				
				if (configuration.TemporaryWght == 'true')
					$('#tempWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
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
	
	if(chargeType.value == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE && (configuration.ChargeCubicRateCBMWise == 'true')) {
		var CBMValue   	= $('#CBMValue').val();
		var CBMRate  	= $('#CBMRate').val();
		
		$("#charge"+BookingChargeConstant.FREIGHT).val(Number(CBMValue)*Number(CBMRate));
	}
}

function calcDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		if(Number($("#discountPercentage").val()) <= Number(configuration.maximumDiscountValue)) {
			$('#discount').val((parseFloat($("#discountPercentage").val()) * parseFloat($("#charge" + BookingChargeConstant.FREIGHT).val())) / 100);
		} else {
			showMessage('error','Discount not allowed more than '+configuration.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
}

function checkAndUpdateDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		var discountPercentage = (parseFloat($("#discount").val()) / parseFloat($("#charge" + BookingChargeConstant.FREIGHT).val())) * 100;

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
	var amount				= getAmountToCalculateEncludedTax();
	var serviceTaxExclude 	= getServiceTaxExcludeCharges();
	var	discAmount 			= getDiscountedAmount(amount, serviceTaxExclude);
	var grandtotal 			= parseFloat(discAmount) + parseFloat(serviceTaxExclude);

	serviceTaxAmount = 0;

	if(configuration.doNotCalculateAutomaticTax == 'false' || configuration.doNotCalculateAutomaticTax == false)
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
	$("#totalAmt").val(getTotalAmt());
	
	remarkApend();
	calcGrandtotal();
	calTDSAmount(this.id);
}

function validateCCAttachedAmount(chargeMasterId){
	var chargeValueForCCAttached	= Number(configuration.chargeValueForCCAttached);
	var wayBillTypeId 				= $('#wayBillType').val();
	
	if(chargeIdsForCCAttachedArr != null && wayBillTypeId != WayBillType.WAYBILL_TYPE_FOC) {
		if(chargeIdsForCCAttachedArr.includes(Number(chargeMasterId))) {
			var chargeVal 	= Number($('#charge' + chargeMasterId).val());
			
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
	var chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	
	if(configuration.setChargeOnCCAttachedConfig == 'true' && !validateCCAttachedAmount(chargeMasterId))
		return false;
	
	var chargeRate		= null;
	var actualInput		= Number($('#actualInput'+chargeMasterId).val());
	
	if (chargesRates != null) {
		if(chargesRates[chargeMasterId])
			chargeRate		= chargesRates[chargeMasterId];
		
		if (chargeRate && chargeRate != null) {
			var editMaxAmount	= 0;
			var editMinAmount	= 0;
			var editMaxValue	= 0;
			var chargeValue		= obj.value;

			if (chargeRate.editAmountType == ChargeConfiguration.EDIT_AMOUNT_TYPE_SIMPLE) {
				editMaxAmount	= chargeRate.editMaxAmount;
				editMinAmount	= chargeRate.editMinAmount;
				editMaxValue	= chargeRate.editMaxValue;
			} else if (chargeRate.editAmountType == ChargeConfiguration.EDIT_AMOUNT_TYPE_PERCENTAGE) {
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

	if(configuration.AllowEnableDoorDelivery == 'true' && (chargeMasterId == configuration.doorDeliveryChargeId) && configuration.DoorDeliveryChargeValidate != 'true') {
		var isReadOnly = document.getElementById('charge' + chargeMasterId).readOnly;

		if(((configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == 'true' 
			|| configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == true) && Number(maximumSlabValue) > 0)) {

			if(!(Number($('#chargedWeight').val()) > Number(maximumSlabValue)) && isReadOnly != true
				&& !validateInput(1, 'charge' + chargeMasterId, 'charge' + chargeMasterId, 'error', 'Please Enter Door Delivery Charge !')) {
				setTimeout(function(){ document.getElementById('charge' + chargeMasterId).focus(); }, 10);
				return false;
			}
		} else if (isReadOnly != true && !validateInput(1, 'charge' + chargeMasterId, 'charge' + chargeMasterId, 'error', 'Please Enter Door Delivery Charge !')) { 
			setTimeout(function(){ document.getElementById('charge' + chargeMasterId).focus(); }, 10);
			return false;
		}
	}

	if(configuration.editDeliveryAtBasedOnDlyChrges == 'true' && chargeMasterId == configuration.doorDeliveryChargeId
		&& $('#charge' + chargeMasterId).val() > 0 && $('#deliveryTo').val() != TransportCommonMaster.DELIVERY_TO_DOOR_ID)
		$('#deliveryTo').val(TransportCommonMaster.DELIVERY_TO_DOOR_ID);
	
	if(configuration.checkChargesAfterApplyRateInAuto == 'true'){
		var actualInput		= Number($('#actualChargeAmount'+chargeMasterId).val());
		var chargeValue		= obj.value;
		
		if(chargeValue < actualInput && actualInput > 0){
			//alert("You can not enter less then this " + (actualInput) + " amount.");
			showMessage('info', 'You can not enter less then this '+actualInput+' /-');
			setTimeout(function(){ $('#charge'+chargeMasterId).focus(); }, 0);
			$('#charge' + chargeMasterId).val(actualInput);
			//return false;
		}
	}
		
	includeLoadingChargeOnFreight();
}

function setPartyMinimumRates() {
	var minimumParty = 0;
	
	if($('#partyMinimumRate').val() == "")
		minimumParty = 0;
	else
		minimumParty = $('#partyMinimumRate').val();

	if (minimumParty > Number($('#charge' + BookingChargeConstant.FREIGHT).val())) {
		$("#freightAmountRate").fadeIn(500);
		setTimeout(function () {$("#freightAmountRate").fadeOut(500);}, 3000);
		$('#charge'+BookingChargeConstant.FREIGHT).val(minimumParty);
	}
}

function calculateWeightAndQuantityWiseFreightAmount(chargeMasterId) {
	var qtyAmnt			= 0;
	var weightAmnt		= 0;

	if(quantityTypeArr != null)
		qtyAmnt			= getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr);
	
	if(weightTypeArr != null)
		weightAmnt			= getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr);

	if(!lrWiseDecimalAmountAllow($('#wayBillType').val())) {
        if(qtyAmnt % 1 != 0)
            qtyAmnt                = Math.round(qtyAmnt * 100) / 100;
    
        if(weightAmnt % 1 != 0)
            weightAmnt            = Math.round(weightAmnt * 100) / 100;
    } else {
    	qtyAmnt		= qtyAmnt.toFixed(2);
    	weightAmnt	= weightAmnt.toFixed(2);
    }

	if (configuration.isQtyAmntAndWeightAmntCompare == 'true') {
		if (qtyAmnt > weightAmnt) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(qtyAmnt));
		} else {
			if(chargeMasterId == BookingChargeConstant.LR_CHARGE)
				$('#lrChargeValue').val(Number(weightAmnt));
			
			if(configuration.calculateLoadingChargeOnFreightAmount == 'false')
				$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		}
	} else {
		var chargeType	= $('#chargeType').val();
		
		if(configuredChargeTypeIdWithCharge[chargeMasterId] != null)
			chargeType	= configuredChargeTypeIdWithCharge[chargeMasterId];

		if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(qtyAmnt));
		} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
			if(chargeMasterId == BookingChargeConstant.LR_CHARGE)
				$('#lrChargeValue').val(Number(weightAmnt));

			$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER) {
			$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		}  else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_FIX) {
			$('#charge' + chargeMasterId).val(Number(weightAmnt));
			
			if(chargeMasterId == ChargeTypeMaster.FREIGHT)
				$('#freightChargeValue').val(Number(weightAmnt));
		}
	}
}

function calculateLRLevelCharges(chargesRates, chargeMasterId, masterIdsArr) {
	if(configuration.AllowEnableDoorDelivery == 'true') {
		if($("#deliveryTo").val() ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID && Number($('#wayBillType').val()) != Number(WayBillType.WAYBILL_TYPE_FOC)) {
			$('#charge' + configuration.doorDeliveryChargeId).removeAttr("readonly");
		} else {
			$('#charge' + configuration.doorDeliveryChargeId).val(0);
			$('#charge' + configuration.doorDeliveryChargeId).prop("readonly", "true");
		}
	} else if(configuration.disableSpecificCharges == 'false') {
		$('#charge' + chargeMasterId).removeAttr('disabled');
		$('#charge' + chargeMasterId).removeAttr("readonly");
	}
	
	setNonEditableFreightCharge();

	if (chargesRates != null) {
		var chargeRate	= chargesRates[chargeMasterId];
		
		if (chargeRate) {
			if (!chargeRate.applicable) {
				$('#charge' + chargeMasterId).prop("disabled", "true");

				if(configuration.resetAmountForChargeNotApplicable == 'true')
					$('#charge' + chargeMasterId).val(0);
			} else
				$('#charge' + chargeMasterId).removeAttr('disabled');
			
			if (!chargeRate.editable)
				$('#charge' + chargeMasterId).prop("readonly", "true");
			else
				$('#charge' + chargeMasterId).removeAttr("readonly");

			if(configuration.AllowEnableDoorDelivery == 'true' && $("#deliveryTo").val() ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
				$('#charge' + configuration.doorDeliveryChargeId).removeAttr("readonly");

			if ($('#charge'+chargeMasterId).val() < chargeRate.chargeMinAmount) {
				if (chargeRate.chargeMinAmount != 0) {
					if(chargeRate.ispercent) {
						if(($('#charge' + chargeRate.chargeApplicableOn).val()) > 0)
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, 1));	
						else if(chargeRate.fieldId > 0)
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.fieldId, 2));
						else
							$('#charge' + chargeMasterId).val(0);
					} else if(configuration.setRatesChargeTypeWise == 'true' && _.contains(masterIdsArr, chargeMasterId)) {
						if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT && Number($('#chargedWeight').val()) >= Number(configuration.minWeightForApplyRates))
							$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
					} else if(configuration.AllowEnableDoorDelivery == 'true' && chargeMasterId == configuration.doorDeliveryChargeId) {
						var deliveryTo = $('#deliveryTo').val();
							
						if(deliveryTo ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
							$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
						else
							$('#charge' + chargeMasterId).val(0);
					} else
						$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
				} else
					$('#charge' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
			}

			$('#actualInput' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
			
			var chargeIdsToEnableSpecificChargesArr	= (configuration.chargeIdsToEnableSpecificCharges).split(',');
			
			if(configuration.disableChargeIfFoundFromDB == 'true' && Number($('#charge' + chargeMasterId).val()) > 0 && (!isValueExistInArray(chargeIdsToEnableSpecificChargesArr, chargeMasterId)))
				$('#charge' + chargeMasterId).prop("readonly", true);
		}
	}

	if(configuration.disableBookingCharges == 'true' && !isManualWayBill)
		$('#charge' + chargeMasterId).prop("readonly", "true");
}

function getChargesIdForChargeTypeWiseRate() {
	var masterIdsArr 	= new Array();
	
	if(configuration.setRatesChargeTypeWise == 'true') {
		var masterId		= (configuration.chargeMasterIdForChargeTypeWiseRate).split(",");

		for(var i = 0; i < masterId.length; i++) {
			masterIdsArr.push(Number(masterId[i]));
		}
	}
	
	return masterIdsArr;
}

function resetDisabledCharges() {
	if(configuration.disableRateIfFoundFromDB == 'true' || configuration.disableRateIfFoundFromDB == true) {
		if(jsondata.charges) {
			var chargeTypeModel = jsondata.charges;
			
			for (var i = 0; i < chargeTypeModel.length; i++) {
				var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;
				
				if(configuration.disableChargeIfFoundFromDB == 'true' && Number($('#charge'+chargeMasterId).val()) <= 0)
					$('#charge' + chargeMasterId).prop("readonly", false);
			}
		}
		
		if(configuration.disableRateIfFoundFromDB == 'true' && $('#weigthFreightRate').val() <= 0)
			$('#weigthFreightRate').prop("readonly", false);
	}
}

function applyRates() {
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC) {
		resetOnChargeTypeExcludingPackageDetails();
		return true;
	}
	
	if(Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRateCBMWise == 'true')
		return;
	
	if(isManualWayBill && configuration.ApplyRateInManual == 'false') {
		if(jsondata.charges) {
			var chargeTypeModel = jsondata.charges;
			
			for (var i = 0; i < chargeTypeModel.length; i++) {
				calculateWeightAndQuantityWiseFreightAmount(chargeTypeModel[i].chargeTypeMasterId);
			}
		}

		frightCalcForST();
		calcTotal();

		return false;
	}

	chargesRates		= getChargesRates();
	var masterIdsArr	= getChargesIdForChargeTypeWiseRate();

	if(jsondata.charges) {
		var chargeTypeModel = jsondata.charges;
		for (var i = 0; i < chargeTypeModel.length; i++) {

			var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;

			/*
			 * Calculate Weight And Quantity Wise Freight Charge with Comparision
			 */
			calculateWeightAndQuantityWiseFreightAmount(chargeMasterId);

			/*
			 * Calculate LR Level Charges
			 */
			calculateLRLevelCharges(chargesRates, chargeMasterId, masterIdsArr);

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
	
	//Default LR level charges
	if($('#charge' + BookingChargeConstant.LR_CHARGE).val() <= 0)
		$('#charge' + BookingChargeConstant.LR_CHARGE).val(Math.round(configuration.LRCharge));
	
	if($('#charge' + BookingChargeConstant.STATISTICAL).val() <= 0)
		$('#charge' + BookingChargeConstant.STATISTICAL).val(configuration.defaultStatisticalCharge);
		
	if($('#charge' + BookingChargeConstant.STATIONARY_BOOKING).val() <= 0)
		$('#charge' + BookingChargeConstant.STATIONARY_BOOKING).val(configuration.DefaultStationaryCharge);
	
	includeLoadingChargeOnFreight();
	
	loadingChargeAmount	= $('#charge'+BookingChargeConstant.LOADING).val();
	makeChargeEditable(); // Called from Consignment.js file
	calculateCarrierRiskPerArticle();
	setPartyMinimumRates();
	frightCalcForST();
	checkIfPartyIsExempted();
	totalWithExtraAddedAmount();
	applyExtraCharges();
	chargeDisableFromRate();
	disableChargesForAgentBranches();
	disableChargesForDoorPickUpCharge();
	hideAllRateOnBookingPage();
	
	if(LRTypeChargeIdHMToShowCharge) {
		for(var key in LRTypeChargeIdHMToShowCharge) {
			var lrTypeList	= LRTypeChargeIdHMToShowCharge[key];
			
			if(!isValueExistInArray(lrTypeList, $('#wayBillType').val()))
				$("#charge" + key).val(0);
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
		if(chargeUnit == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
			if ($("#chargedWeight").val() > 0)
				chargeAmount = (chargeValue * $("#chargedWeight").val());
		} else if(chargeUnit == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			var totalQty	= 0;
			
			if(configuration.isPackingGroupTypeWiseChargeAllow == 'true')
				totalQty	= totalConsignmentQuantity;
			else
				totalQty	= getTotalAddedArticleTableQuantity();
			
			chargeAmount 	= (chargeValue * totalQty);
		}
	}

	return chargeAmount;
}

function getFlavourWiseRates(customerId, partyType){
	if(configuration.applyRateAuto == 'false')
		return;

	resetArticleWithTable();
		
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

function frightCalcForST() {
	var fright = document.getElementById('charge'+BookingChargeConstant.FREIGHT);
	var wayBillTypeId  = $('#wayBillType').val();

	if (fright == null)
		return;

	if (stPaidBySelectionByParty)
		selectSTPaidBy(TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt();
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
	
	for(var i = 0; i < quantityTypeArr.length; i++) {
		sliptedByUnderScore		= quantityTypeArr[i].split("_");
		sliptedByCommas			= sliptedByUnderScore[1].split(",");

		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true') {
			if(sliptedByCommas[0].split("=")[0] == chargeMasterId) {
				amount = parseFloat(amount) + parseFloat(sliptedByCommas[0].split("=")[1]);
				break;
			}
		} else {
			for(var j = 0; j < sliptedByCommas.length; j++) {
				if(sliptedByCommas[j].split("=")[0] == chargeMasterId) {
					if(fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId])
						amount = parseFloat(sliptedByCommas[j].split("=")[1]);
					else
						amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
					
					break;
				}
			}
		}
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
		var fixAmt = 0;

		if($('#fixAmount').exists() && $('#fixAmount').val() != '')
			fixAmt = Number($('#fixAmount').val());

		amount = fixAmt;
	}

	return amount;
}

function getAmntFromWeightAmntArr(chargeMasterId,weightTypeArr){
	var amount = 0;
	var sliptedByCommas = new Array();

	for(var i = 0 ; i < weightTypeArr.length; i++) {
		sliptedByCommas = weightTypeArr[i].split(",");
		
		for(var j = 0; j < sliptedByCommas.length; j++) {
			if(sliptedByCommas[j].split("=")[0] == chargeMasterId) {
				if(fixedChargeRateObj[chargeMasterId] != null && fixedChargeRateObj[chargeMasterId])
					amount = parseFloat(sliptedByCommas[j].split("=")[1]);
				else
					amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
				
				break;
			}
		}
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
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
		var chargeApplicableOn 	= ($('#charge' + chargeApplicableOnId).val());
		
		if( chargeApplicableOn > 0)
			calculateChargeMinAmount = (calculateChargeMinAmount*chargeApplicableOn) / 100;
	} else if(filter == 2 && chargeApplicableOnId == ChargeConfiguration.FIELD_ID_DECLARED_VALUE) {
		if ($("#declaredValue").val() > 0) {
			var declaredValue		= $('#declaredValue').val();
			var chargeEle			= document.getElementById('charge' + chargeMasterId);
				
			if(chargeEle && declaredValue > 0)
				calculateChargeMinAmount = ((calculateChargeMinAmount * declaredValue) / 100);
		} else
			calculateChargeMinAmount = 0;
	}

	var decVal = $('#declaredValue').val();

	if( configuration.isRiskAllocationAllow && chargeMasterId == BookingChargeConstant.CARRIER_RISK)
		return Math.round(calculateChargeMinAmount);

	if((configuration.compareFOVWithDecVal == 'true' || configuration.compareFOVWithDecVal == true) && chargeMasterId == BookingChargeConstant.FOV && decVal < 200000)
		return 0;
	
	if(configuration.roundoffServiceCharge)
		return Math.round(calculateChargeMinAmount);
	
	return calculateChargeMinAmount;
} 

function setBookingChargeAmt(obj) {
	var chargeTypeMasterId = (obj.id).split("_");
	$('#charge' + chargeTypeMasterId[1]).val($("#"+obj.id).val());
}

function setHiddenValuesForCharges(chargeMasterId){
	setTimeout(function(){ $('#actualChargeAmount'+chargeMasterId).val($('#charge'+chargeMasterId).val());}, 200);
}