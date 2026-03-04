function applyReCalculatedRates() {
	setRatesTableWise(tableEl1);
}

function setRatesTableWise() {
	setRateType();

	for (let k in consignmentDataHM) {
		let qtyAmount			= consignmentDataHM[k].amount;
		let quantity			= consignmentDataHM[k].quantity;
		let typeofPacking		= consignmentDataHM[k].packingTypeMasterId;
		let consignmentGoodsId	= consignmentDataHM[k].consignmentGoodsId;

		calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);

		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true')
			checkRateForPackingType(qtyAmount, 1);
		else
			checkRateForPackingType(qtyAmount, quantity);
		
		addinqtyArr();
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
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true') {
				checkRateForPackingType(qtyAmount, 1);
			} else {
				checkRateForPackingType(qtyAmount, quantity);
			}
		}
	} else {
		if(!validateConsignmentTables()) {
			return false;
		}

		var qtyAmount = $('#qtyAmount').val();
		var quantity  = $('#quantity').val();
		if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true') {
			checkRateForPackingType(qtyAmount, 1);
		} else {
			checkRateForPackingType(qtyAmount, quantity);
		}
	}
}

function checkRateForPackingType(qtyAmount, quantity ) {
	var searchRate = $('#searchRate').val();
	var isFreightRateExist	= false;

	if(searchRate == "") {
		finalQtyAmt = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
		$('#searchRate').val(BookingChargeConstant.FREIGHT+'='+parseFloat(finalQtyAmt));
	} else {
		var tempString		= "";
		var fromsearchRate	= $('#searchRate').val();
		var qtyRateFromEle	= fromsearchRate.split(",");
		for(var j=0;j<qtyRateFromEle.length;j++){
			var chargeTypeId	= parseInt(qtyRateFromEle[j].split("=")[0]);
			var qtyrate			= parseFloat(qtyRateFromEle[j].split("=")[1]);
			if(qtyRateFromEle[j].split("=")[0] == BookingChargeConstant.FREIGHT) {

				qtyrate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);

				isFreightRateExist = true;
			}
			if(calculateMinimumQtyAmt(qtyRateFromEle[j].split("=")[0],qtyAmount,chargeTypeId)){
				qtyrate = MinQtyAmtTobeAssigned;
			}
			if(j == 0) {
				tempString += chargeTypeId+"="+qtyrate;
			} else {
				tempString += ","+chargeTypeId+"="+qtyrate;
			};
		}
		if(!isFreightRateExist) {
			var finalQtyRate = 0;
			finalQtyRate = calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity);
			if(tempString != "") {
				tempString += ","+BookingChargeConstant.FREIGHT+'='+parseFloat(finalQtyRate);
			} else {
				tempString = BookingChargeConstant.FREIGHT+'='+parseFloat(finalQtyRate);
			};
		}
		if(tempString != ""){
			$('#searchRate').val(tempString);
		};
	};
}


function calculateChargeAmount(filter, qtyAmount, quantity) {

	if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT && Number($('#chargeType').val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT){
		quantity = Number($('#actualWeight').val()); 
	}

	var amt = 0;

	switch (Number(filter)) {
	case 1:
		amt = parseFloat(qtyAmount * quantity);
		break;

	case 2:
		if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
			amt = parseFloat(qtyAmount * quantity);
		} else {
			amt = parseFloat(qtyAmount);
		}
		break;
	default:
		amt = 0;
	break;
	}

	return amt;
}

function checkIfnotPresent() {

	var tempString			= "";
	var chargeTypeId		= 0;
	var wghtAmt				= 0;
	var chargedWeight		= parseFloat($('#chargedWeight').val());
	var weigthFreightRate	= 0;

	if($('#weigthFreightRate').val() != '') {
		weigthFreightRate	= $('#weigthFreightRate').val();
	}

	var isFreightRateExist	= false;
	var sliptedByCommas		= new Array();

	for(var j=0;j<weightTypeArr.length;j++){
		sliptedByCommas	= weightTypeArr[j].split(",");
		for(var i=0;i<sliptedByCommas.length;i++) {
			chargeTypeId = sliptedByCommas[i].split("=")[0];
			if(chargeTypeId == BookingChargeConstant.FREIGHT) {

				wghtAmt = calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);

				isFreightRateExist = true;
			} else {
				wghtAmt = parseFloat(sliptedByCommas[i].split("=")[1]);
			}

			wghtAmt = Math.round(wghtAmt);

			if(i == 0) {
				tempString += chargeTypeId+'='+wghtAmt;
			} else {
				tempString += ','+chargeTypeId+'='+wghtAmt;
			};
		}
	};

	if(!isFreightRateExist) {
		tempString += "," + BookingChargeConstant.FREIGHT + '=' + calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight);;
	}

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
	var currentWayBillTypeId = $('#wayBillType').val();

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

	var actualWeight  		= parseFloat($('#actualWeight').val());
	var chargedWeight 		= parseFloat($('#chargedWeight').val());

	minWeight			= 0;
	
	if(actualWeight <= minWeight) {
		if(chargedWeight < minWeight) {
			showMessage('info', chargedWeightLessThanInfoMsg(minWeight));
			calculateChargedWeight(obj);
			return false;
		}
	} else {
		if(!chgwgtActWgtConditionForLess && (chargedWeight < actualWeight)) {
			showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
			calculateChargedWeight(obj);
			return false;
		}
	}
	if(configuration.setDefaultChargeWeight == 'true'){
		if(!chgwgtActWgtConditionForLess && Number($('#chargedWeight').val()) < configuration.defaultChargeWeightValue){
			var actualWeight	= Number($('#actualWeight').val());
			if(actualWeight > 0){
				showMessage('info', chargedWeightLessThanInfoMsg(configuration.defaultChargeWeightValue));
				$('#chargedWeight').val(configuration.defaultChargeWeightValue)
				setTimeout(function(){ $('#chargedWeight').focus(); }, 0);
				return false;
			}
		}
	}
}

function editWeightRate() { 

	//weightFromDb is globally defined

	if(configuration.AllowLessWeightRateApplyFromRateMater == 'true') {
		return;
	}

	var weightRate		= 0.0;

	if(getValueFromInputField('weigthFreightRate') != null) {
		weightRate		= parseFloat(getValueFromInputField('weigthFreightRate'));
	}

	if(weightRate < weightFromDb) {
		setValueToTextField('weigthFreightRate', weightFromDb);
		showMessage('info', weightRateLessThanInfoMsg(weightFromDb));
		return false;
	}
}

function editQuantityAmount() {

	//qtyAmt is globally defined

	if(configuration.AllowLessQuantityAmtApplyFromRateMaster == 'true') {
		return;
	}

	var quantityAmount	= 0;

	if(getValueFromInputField('qtyAmount') != null) {
		quantityAmount	= getValueFromInputField('qtyAmount')
	}

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
	var corporateAccountId = 0;


	minWeight			= 0;

	if(configuration.IsDisplayAlertToSelectLCV == 'true') {
		if(Number(actualWeight) >= configuration.MaxWeightToShowAlertForLCV && getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
			alert('Please Select LCV');
		}
	}
	
	corporateAccountId	= $('#partyMasterId').val();

	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID) {
		corporateAccountId	= $('#partyMasterId').val();
	} else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY) {
		corporateAccountId	= $('#consigneePartyMasterId').val();
	} else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
		corporateAccountId	= $('#billingPartyId').val();
	}

	if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {

		var vehicleTypeValue = $('#vehicleType').val();

		if(vehicleTypeValue != 0) {
			var val = new Array();
			val 		= vehicleTypeValue.split(",");
			capacity	= parseFloat(val[1]);

			if(parseFloat(actualWeight) > parseFloat(val[1])) {
				if(configuration.FTLWeightAllowMoreThenTruck == 'true') {
					isWeightAllow	= true;
				} else {
					isWeightAllow	= false;//Vehicle Capacity Check
				}
			}
		} else {
			showMessage('error', truckTypeErrMsg);
			$('#actualWeight').val(0);
			$('#previousActualWeight').val(0);
			$('#chargedWeight').val(0);
			return false;
		}
	}

	if(isWeightAllow) {		
		if(actualWeight == 0) {
			$('#chargedWeight').val(0);
		} else if(actualWeight >= 1 && actualWeight <= parseInt(minWeight)) {
			$('#chargedWeight').val(parseInt(minWeight));
		} else if( (obj.id == 'actualWeight') && ( parseInt(actualWeight) > parseInt(configuration.actualWeightValue)) && (configuration.checkActualWeight == 'true') ){
			if(bookingType == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID){
				confirm("You are booking LR with more than " + parseInt(configuration.actualWeightValue) + " kg.\n\nAre you sure you want to book in 'SUNDRY' ?");
				$('#chargedWeight').val(actualWeight);
			}
		} else {
			if(configuration.roundOffChargeWeight  == 'true') {
				/*
				 * Here we are calculating round off value of charge Weight on Particular party
				 */
				if(configuration.partyWiseChargeWeightRoundOff == 'true') {
					if(chargedWeightRoundOffValue > 0) {
						$('#chargedWeight').val(Math.ceil(actualWeight / chargedWeightRoundOffValue) * chargedWeightRoundOffValue);
					} else if(corporateAccountId > 0) {
						$('#chargedWeight').val(actualWeight);
					} else {
						$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
					}
				} else {
					$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
				}
			} else {
				$('#chargedWeight').val(actualWeight);
			}
		}

		$('#previousActualWeight').val(actualWeight);

		if(bookingType == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
			if(actualWeight < capacity) {
				alert('Not Optimizing the space of Vehicle');
				$('#chargedWeight').val(actualWeight);
			}
		}
		if(bookingType == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
			if(configuration.isAllowToExceedVehicleCapacityBeyondLimit == 'true') {
				var percCapacityIncreased 	= configuration.percentageAllowedBeyondVehicleCapacity;
				var exceededCapacity 		= capacity + ((capacity * percCapacityIncreased) / 100);

				if(parseFloat(actualWeight) > exceededCapacity){
					$('#actualWeight').val($('#previousActualWeight').val());
					$('#chargedWeight').val($('#previousActualWeight').val());
					alert('Capacity of Selected Vehicle is ' + exceededCapacity + ' so you can not enter Actual Weight more than that');
				}
			}
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

		if(Number(actualWeight) == 0) {		
			$('#actualWeight').val(actualWeight);
		} else if(Number(actualWeight) < Number(minChrdWght)) {
			$('#chargedWeight').val(minChrdWght);
		}
	}

	if(configuration.roundOffIncreasedChargedWeightValue == 'true') {

		var rndOffChrgdWghtByTensForBrnchs = configuration.roundOffChargedWeightByTensForBranchs;
		var branches	= new Array();
		branches =  rndOffChrgdWghtByTensForBrnchs.split(",");

		if(configuration.roundOffChargedWeightByTens == 'true') {
			for(var i = 0 ; i < branches.length ; i++){
				if(branches[i] == branchId){   //branchId is gloabally defined, it is Executive branch Id
					$('#chargedWeight').val(Math.round($('#chargedWeight').val() / 10) * 10);
				} else {
					$('#chargedWeight').val(Math.ceil($('#chargedWeight').val() / 5) * 5);
				}
			}
		} 
	}

	setMinimumWeight();
}

function setMinimumWeight(){
	if(configuration.setDefaultChargeWeight == 'true'){
		var chargeType		= Number($('#chargeType').val());
		var actualWeight	= Number($('#actualWeight').val());
		if(actualWeight>0){
			$('#chargedWeight').val(configuration.defaultChargeWeightValue);
		}
	}
}

function checkPackingTypeAllowedOnWeight() {
	return true;
}

function checkCommission(){
	var agentcommission	= $('#agentcommission').val();
	if(agentcommission != null){
		if(agentcommission > agentCommissionValueAllowed){
			$('#agentcommission').val(0);
			showMessage('info', commissionError(agentCommissionValueAllowed));
			setTimeout(function(){$('#agentcommission').focus(); }, 10);
			return false;
		} 
	}
	return true;
}

function calculateWeigthRate() {
	var weigthFreightRate 	= $('#weigthFreightRate').val();
	var chargedWeight 		= parseFloat($('#chargedWeight').val());
	var actualWeight 		= parseFloat($('#actualWeight').val());

	if(chargedWeight != 0 && weigthFreightRate != 0) {
		var total = 0;
		total = Math.round(calculateChargeAmount(configuration.WghtFlavor, weigthFreightRate, chargedWeight));
		$('#weightAmount').val(total);
	}
}

function getChargesRates() {

	var	corporateAccountId	= 0;
	var	branchId			= 0;
	var configObject		= null;
	var configData			= new Object();
	isSlabRateNotExists 	= false;
	
	if(configuration.ChargeTypeFlavour == '1') {
		corporateAccountId	= $('#billingPartyId').val();
		
		if(corporateAccountId == 0) {
			corporateAccountId	= $('#partyMasterId').val();
		}
	} else {
		if (Number($('#billingPartyId').val()) > 0) {
			corporateAccountId	= $('#billingPartyId').val();
		} else {
			if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3') {
				if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID) {
					corporateAccountId	= $('#partyMasterId').val();	
				} else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY) {
					if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay) {
						corporateAccountId	= $('#partyMasterId').val();
					} else {
						corporateAccountId	= $('#consigneePartyMasterId').val();
					}
				}
			} else {
				corporateAccountId	= $('#partyMasterId').val();
			}
		}
	}

	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill){
		branchId	= $('#sourceBranchId').val();
	} else {
		branchId	= executive.branchId;
	}
	
	var destBranchId	= $('#destinationBranchId').val();

	configObject = filterLRLevelRates(3, branchId, destBranchId, '', '', '', corporateAccountId, '', '', '', 0, 0, 0);
	checkAndInsertRates(configObject, configData, 0, 3);
	
	if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'false') {
		if(configObject == null || configObject.length == 0) {
			configObject = filterLRLevelRates(3, branchId, destBranchId, '', '', '', 0, '', '', '', 0, 0, 0);
			checkAndInsertRates(configObject, configData, 0, 3);
		}
	}

	return configData;
}

//get rates from ratemaster and charge configuration table
function checkAjaxRates() {
	if ($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC)
		return true;

	var destBranchId		= $('#destinationBranchId').val();
	var corporateAccountId	= getLRTypeWisePartyId();

	if (wayBillRates == null && (chargesRates == null || jQuery.isEmptyObject(chargesRates))) {
		getRates(destBranchId, corporateAccountId, 1);
		resetArticleWithTable();
	}
}

//get rates from charge configuration table
function getChargesConfigRates(corporateAccountId, destinationBranchId) {
	if(configuration.applyRateAuto == 'false' || $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC){
		return;
	}

	var jsonObject					= new Object();

	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill){
		jsonObject.branchId				= $('#sourceBranchId').val();
	} else {
		jsonObject.branchId				= executive.branchId;
	}

	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.requestType			= ChargeConfiguration.REQUEST_TYPE_CREATEWAYBILL;
	jsonObject.destinationBranchId	= destinationBranchId;

	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:5}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
					}
				} else {
					chargesConfigRates			= null;
					chargesConfigRates			= data.chargesConfigRates;

					chargesRates	= null;
					applyRates();
				}
			});
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

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:4}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
						packingTypeList			= null;
						consignmentGoodsListHM	= null;
					}
				} else {
					wayBillRates			= data.wayBillRates;
					packingTypeList			= data.packingTypeList;
					consignmentGoodsListHM	= data.consignmentGoodsListHM;
					chargesConfigRates		= data.chargesConfigRates;
					chargesRates			= null;
					
					getWeightTypeRates();
					getPackingTypeRates();
					applyRates();
					loadRatesDef.resolve();
				}
			});
}

function calculateRouteWiseSlabRates(){
	if(configuration.routeWiseSlabConfigurationAllowed == 'false' || configuration.routeWiseSlabConfigurationAllowed == false)
		return false;
	
	var destBranchId = $('#destinationBranchId').val();
	var corporateAccountId = 0;
	
	if(configuration.ChargeTypeFlavour == '1') {
		corporateAccountId	= $('#billingPartyId').val();
		
		if(corporateAccountId == 0) {
			corporateAccountId	= $('#partyMasterId').val();
		}
	} else {
		if(configuration.ChargeTypeFlavour == '2'){
			if (Number($('#billingPartyId').val()) > 0) {
				corporateAccountId	= $('#billingPartyId').val();
			} else{
				if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID) {
					corporateAccountId	= $('#partyMasterId').val();	
				} else if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY) {
					corporateAccountId	= $('#consigneePartyMasterId').val();
				}
			}
		}
	}
	
	getRouteWiseSlabConfig(destBranchId,corporateAccountId);
	
}

function getRouteWiseSlabConfig(destBranchId, corporateAccountId){
	if(configuration.applyRateAuto == 'false' || $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC
			|| (isManualWayBill && configuration.ApplyRateInManual == 'false')) {
		return;
	}
	
	var jsonObject					= new Object();
	
	jsonObject.srcBranchId			= getSourceBranchForRate();
	jsonObject.destBranchId			= destBranchId;
	jsonObject.corporateAccountId	= corporateAccountId;

	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:19}, function(data){
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription){
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
					}
				} else {
					wayBillRates			= null;
					wayBillRates			= data.wayBillRates;
					applyRouteWiseRates();
				}
			});
	
}

function applyRouteWiseRates(){
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC || wayBillRates == null || wayBillRates.length == 0)
		return true;
	
	var destBranchId = $('#destinationBranchId').val();
	
	var articleSize 		= 0;
	var articleWeight 		= 0;
	var articleQty 			= 0;
	var partyRates				= null;
	var branchRates				= null;
	
	$('#charge' + ChargeTypeMaster.FREIGHT).val(0);
	$('#charge' + ChargeTypeMaster.LOADING).val(0);
	
	if(consigAddedtableRowsId.length > 0) {
		for(var i = 0; i < consigAddedtableRowsId.length; i++) {
			if($('#quantity' + consigAddedtableRowsId[i]).html() > 0)
				articleQty		= parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
			
			if($('#lengthCol' + consigAddedtableRowsId[i]).html() > 0
					&& $('#breadthCol' + consigAddedtableRowsId[i]).html() > 0)
				articleSize 	= articleQty * parseInt($('#lengthCol' + consigAddedtableRowsId[i]).html()) * parseInt($('#breadthCol' + consigAddedtableRowsId[i]).html());
			
			if($('#lengthCol' + consigAddedtableRowsId[i]).html() > 0)
				articleWeight 	= articleQty * parseInt($('#lengthCol' + consigAddedtableRowsId[i]).html());
			
			var weightDifference 		= 0;
			var extraAmtPerIncreasedKg 	= 0;
			var increasedFreightAmount	= 0;
			var sizeDifference			= 0;
			var extraAmountPerSqft		= 0;
			var increasedFreightAmtPerSqft 	= 0;
			partyRates				= new Array();
			branchRates				= new Array();
			
			for(var j = 0; j < wayBillRates.length; j++) {
				if(wayBillRates[j].destinationBranchId == destBranchId) {
					if(wayBillRates[j].corporateAccountId > 0) {
						if( articleWeight >= wayBillRates[j].minValue && articleWeight <= wayBillRates[j].maxValue)
							partyRates.push(wayBillRates[j]);
					} else if( articleWeight >= wayBillRates[j].minValue && articleWeight <= wayBillRates[j].maxValue)
						branchRates.push(wayBillRates[j]);
				}
			}
			
			if(partyRates.length <= 0 && branchRates.length <= 0){
				deleteConsignments('delete_' + consigAddedtableRowsId[i]);
				showMessage('info', 'Rate Not Found for Weight Slab ! Please Configure Rate in Master & Try again !');
				return false;
			}
			
			if(partyRates != null && partyRates.length > 0){
				for(var k = 0;k< partyRates.length;k++){
					if(partyRates[k].chargeTypeMasterId == ChargeTypeMaster.FREIGHT){
						$('#charge' + ChargeTypeMaster.FREIGHT).val(Number($('#charge' + ChargeTypeMaster.FREIGHT).val())+Number(partyRates[k].rate));
						
						if(articleWeight > configuration.minSlabWeight){
							weightDifference 		= articleWeight - (partyRates[k].minValue - 1);
							extraAmtPerIncreasedKg 	= partyRates[k].increasedAmountPerKg;
							increasedFreightAmount	= weightDifference*extraAmtPerIncreasedKg;
						}
						
						if(parseInt(articleSize) > parseInt(configuration.minSizePerSqft)){
							sizeDifference				= parseInt(articleSize) - parseInt(configuration.minSizePerSqft);
							extraAmountPerSqft			= partyRates[k].extraAmtPerSqft;
							increasedFreightAmtPerSqft 	= sizeDifference*extraAmountPerSqft;
						}
						
						$('#charge' + ChargeTypeMaster.FREIGHT).val(Number($('#charge' + ChargeTypeMaster.FREIGHT).val())+Number(increasedFreightAmount)+Number(increasedFreightAmtPerSqft));
					} else if(partyRates[k].chargeTypeMasterId == ChargeTypeMaster.LOADING){
						var rate = partyRates[k].rate;
						$('#charge' + ChargeTypeMaster.LOADING).val(Number($('#charge' + ChargeTypeMaster.LOADING).val())+(articleQty*rate));
					}
				}
			} else if(branchRates != null && branchRates.length > 0){
				for(var l = 0; l < branchRates.length;l++){
					if(branchRates[l].chargeTypeMasterId == ChargeTypeMaster.FREIGHT){
						$('#charge' + ChargeTypeMaster.FREIGHT).val(Number($('#charge' + ChargeTypeMaster.FREIGHT).val())+Number(branchRates[l].rate));
					
						if(articleWeight > configuration.minSlabWeight){
							weightDifference 		= articleWeight - (branchRates[l].minValue - 1);
							extraAmtPerIncreasedKg 	= branchRates[l].increasedAmountPerKg;
							increasedFreightAmount	= weightDifference*extraAmtPerIncreasedKg;
						}
						
						if(parseInt(articleSize) > parseInt(configuration.minSizePerSqft)){
							sizeDifference				= parseInt(articleSize) - parseInt(configuration.minSizePerSqft);
							extraAmountPerSqft			= branchRates[l].extraAmtPerSqft;
							increasedFreightAmtPerSqft 	= sizeDifference*extraAmountPerSqft;
						}
					
						$('#charge' + ChargeTypeMaster.FREIGHT).val(Number($('#charge' + ChargeTypeMaster.FREIGHT).val())+Number(increasedFreightAmount)+Number(increasedFreightAmtPerSqft));
					} else if(branchRates[l].chargeTypeMasterId == ChargeTypeMaster.LOADING){
						var rate = branchRates[l].rate;
						$('#charge' + ChargeTypeMaster.LOADING).val(Number($('#charge' + ChargeTypeMaster.LOADING).val())+(articleQty*rate));
					}
				}
			}
		}
	}
	
	calcTotal();
}

function applyRateForPartyType(){
}

function openRateSelectionPopUp() {
}

//filter rate as par user selection get revert filterd data 
function filterRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;

	var configuredChargeMasterId	= configuration.configuredChargeMasterId;

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			
			if(Number(datarates.packingGroupTypeId) == 0) {
				packingGrpId		= 0;
			} else {
				packingGrpId = packingGrpTypeId;
			}

			if(Number(datarates.destinationBranchId) == 0) {
				destBranchId	= 0;
			}

			if(configuration.configureApplyRateOnChargeTypeRespectToCharge == 'true') {
				if(Number(configuredChargeMasterId) == Number(datarates.chargeTypeMasterId)) {
					chargeTypeId			= datarates.chargeTypeId;
					configuredChargeTypeId 	= chargeTypeId;
				}
			}

			/*
			 * In case of Party to Party rate make this true
			 */
			if(configuration.applyWayBillTypeWiseRates == 'true' || configuration.applyWayBillTypeWiseRates == true) {
				if(Number(datarates.wayBillTypeId) == 0) {
					wayBillTypeId		= 0;
				} else {
					wayBillTypeId		= $('#wayBillType').val();
				}
			}
			
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
function filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, packingGrpTypeId, consignmentGoodsId, consigneeId) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();
	var packingGrpId	= 0;
	var wayBillTypeId	= 0;

	if(!jQuery.isEmptyObject(wayBillRates)) {
		for (var i = 0; i < wayBillRates.length; i++) {
			var datarates = wayBillRates[i];
			
			if(Number(datarates.packingGroupTypeId) == 0) {
				packingGrpId		= 0;
			} else {
				packingGrpId = packingGrpTypeId;
			}

			if(Number(datarates.destinationBranchId) == 0) {
				destBranchId	= 0;
			}

			if(Number(datarates.wayBillTypeId) == 0) {
				wayBillTypeId		= 0;
			} else {
				wayBillTypeId		= $('#wayBillType').val();
			}
			
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
function filterLRLevelRates(filter, srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, chargeSectionId, applicableOnCatetgoryId, fieldId, declaredValue) {
	var accountGroupId	= executive.accountGroupId;
	var arr 			= new Array();
	
	var chargeIdToAvoid  = configuration.chargeIdsToAvoiddoNotApplyBranchRateIfArtType.split(',').map(function(item) {
		return parseInt(item.trim(), 10);
	});

	switch (filter) {
	case 3 :
		if(!jQuery.isEmptyObject(chargesConfigRates) && chargesConfigRates.length > 0) {
			for (var i = 0; i < chargesConfigRates.length; i++) {
				var rates = chargesConfigRates[i];
				
				if(Number(rates.destinationBranchId) == 0) {
					destBranchId		= 0;
				}
				
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

//check if rates is availabe and insert in array 
function checkAndInsertRates(rateMaster ,rateId_mast, userInput, filter) {

	switch (filter) {
	case 1:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null || (typeof rateId_mast[rateMaster[i].chargeTypeMasterId] == 'undefined')) {
					if(rateMaster[i].minWeight > 0 && rateMaster[i].maxWeight > 0) {
						if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight) {
							rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
						} else {
							isSlabRateNotExists = true;
							rateId_mast[rateMaster[i].chargeTypeMasterId] = 0;
						}
					} else {
						isSlabRateNotExists = true;
						rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
						isApplyFixRateonArticleRateMinMaxArticleWise = false;
					}
				} else {
					if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight) {
						if(isSlabRateNotExists){
							isSlabRateNotExists = false;
							
							if(rateId_mast[rateMaster[i].chargeTypeMasterId] <= 0) {
								rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
							}
							
							isApplyFixRateonArticleRateMinMaxArticleWise = false;
						}
					}
				}
			}
		}
		break;

	case 2:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null) {
					rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
				}
			}
		}
		break;

	case 3:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null || (typeof rateId_mast[rateMaster[i].chargeTypeMasterId] == 'undefined')) {
					rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i];
				}
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
	rateMaster = filterRates(srcBranchId, 0, categoryTypeId, 0, 0, corporateAccountId, 0, rateTypeId, 8, 0, 0, 0);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
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
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, consigneeId);
	checkAndInsertRates(rateMaster, rateId_mast, userArticleInput, 1);
	
	//Filter Slab Wise Rate
	rateMaster = filterSlabRates(srcBranchId, destBranchId, categoryTypeId, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, 0, 0, 0, 0);
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
	}

	return rateId_mast;
}

function getWeightTypeRates() {
	if(isManualWayBill) {
		if(configuration.ApplyRateInManual != 'true') {
			return false;
		}
	}
	if(Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRateCBMWise == 'true') {
		return;
	}

	var chargedWeight		= $('#chargedWeight').val();
	var typeofPacking		= 0;
	var consignmentGoodsId	= 0;

	if($('#typeofPackingId1').html() > 0) {
		typeofPacking 		= $('#typeofPackingId1').html();
	} else {
		typeofPacking 		= $('#typeofPackingId').val();
	}
	
	if($('#consignmentGoodsId1').html() > 0) {
		consignmentGoodsId	= $('#consignmentGoodsId1').html();
	}
	
	var weightAmnt			= calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId);
	$('#qtyAmount').val(weightAmnt);

	if(configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true) {
		if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {

			var vehicleTypeValue = $('#vehicleType').val();

			if(vehicleTypeValue != 0) {
				var val = new Array();
				val 		= vehicleTypeValue.split(",");
				capacity	= parseFloat(val[1]);

				if(Number($('#chargedWeight').val()) > Number(capacity)){
					var F= Number($('#charge1').val());
					var R= Number($('#fixAmount').val());
					var C= Number(capacity);
					var W= Number($('#chargedWeight').val());

					F = F + (R/C) * (W-C);
					$('#fixAmount').val(Math.round(F));
				}
			}
		}
	}
}

function calculateWeightTypeRates(chargedWeight, typeofPacking, consignmentGoodsId) {
	if(configuration.applyRateAuto == 'false'){
		return;
	}

	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill){
		var srcBranchId			= $('#sourceBranchId').val();
	} else {
		var srcBranchId			= executive.branchId;
	}

	var destBranchId		= $('#destinationBranchId').val();
	var vehicleTypeValue	= $('#vehicleType').val();
	var vehicleTypeId		= 0;
	var packingGrpTypeId	= 0;
	var val					= new Array();

	if ($('#vehicleType').exists()) {
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
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
	} else {

		if($("#rateType").val() != null && $("#rateType").val() != '') {
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
			}else{
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else {
			if(partyMasterId > 0) {
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			} else {
				corporateAccountId	= 0;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
				rateTypeId			= 0;
			}
		}
	}

	for(var i = 0; i < PackingGroupMappingArr.length; i++) {
		if(PackingGroupMappingArr[i].packingTypeMasterId == typeofPacking) {
			packingGrpTypeId	= PackingGroupMappingArr[i].packingGroupTypeId;
		}
	}

	if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		var response =  getWghtTypeRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, chargedWeight, rateTypeId, consignmentGoodsId, consigneeId);
		if(response && !jQuery.isEmptyObject(response)) {

			weightFromDb		= 0;
			weightFromDb 		= getFreightChargeForRates(response);
			purefrieghtAmount	= getFreightChargeForRates(response);
			var actualWeight	= Number($('#actualWeight').val());
			var chargedWeight 	= Number($('#chargedWeight').val());

			$('#weigthFreightRate').val(0);
			$('#weightAmount').val(0);
			$('#fixAmount').val(0);

			if(weightFromDb > 0) {
				if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT){
					$('#weightAmount').val(parseFloat(weightFromDb * actualWeight));
				} else{
					$('#weightAmount').val(parseFloat(weightFromDb * chargedWeight));
				}

				$('#weigthFreightRate').val(weightFromDb);
				if (configuration.customFunctionalityOnBookingTypeFTL == 'true' || configuration.customFunctionalityOnBookingTypeFTL == true) {
					$('#fixAmount').val(weightFromDb);
				}
			}

			$('#pureFrieghtAmt').html(purefrieghtAmount);

			displaySpecificRate(response);
			var tempString;
			if(weightTypeForRateApply == ChargeTypeConstant.WEIGHT_TYPE_ID_ACTUAL_WEIGHT){
				tempString		=	getTempStringForRates(response,actualWeight);
			} else{
				tempString		=	getTempStringForRates(response,chargedWeight);
			}


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

function displaySpecificRate(response) {
	var charges	= jsondata.charges;

	for(var i = 0; i < charges.length; i++) {
		if(response[charges[i].chargeTypeMasterId] == undefined) {
			response[charges[i].chargeTypeMasterId]	= 0;
		}

		setValueToHtmlTag('SpecificRate_' + charges[i].chargeTypeMasterId, Number(response[charges[i].chargeTypeMasterId]));
	}
}

function getPackingTypeRates() {
	if(isManualWayBill) {
		if(configuration.ApplyRateInManual != 'true') {
			return false;
		}
	}
	
	var quantity			= 0;
	
	if(configuration.isCheckForWeightSlabInsteadOfArticleSlab == 'true' || configuration.isCheckForWeightSlabInsteadOfArticleSlab == true) {
		quantity			= $('#tempWeight').val();
	} else {
		quantity			= $('#quantity').val();
	}
	
	var typeofPacking = 0;
	
	if($('#typeofPacking').val() > 0) {
		typeofPacking		= $('#typeofPacking').val();
	} else {
		typeofPacking		= $('#typeofPackingId').val();
	}
	
	var consignmentGoodsId	= 0;
	
	if(configuration.rateApplicableOnSaidToContain == 'true') {
		consignmentGoodsId	= $('#consignmentGoodsId').val();
	}
	
	qtyAmt				= calculatePackingTypeRates(quantity, typeofPacking, consignmentGoodsId);

//	If Amount is not found from Rate Master Then applying Static Rates After checking the Following Conditions
	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && qtyAmt == 0 && $('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID && configuration.setConstantArticleAmount == 'true') {
		var packingTypeIds	= (configuration.packingTypeIdsForsetConstantArtAmount).split(",");
		qtyAmt	= 0;
		
		for(var i=0; i < packingTypeIds.length; i++) {
			if(Number(packingTypeIds[i]) == Number(typeofPacking)) {
				qtyAmt	= configuration.amountToSetConstantArtAmount;
			}
		}
	}

	if((configuration.isApplyFixRateonArticleRate == 'true' || configuration.isApplyFixRateonArticleRate == true) && qtyAmt > 0 && isApplyFixRateonArticleRateMinMaxArticleWise) {
		setValueToTextField('chargeType', ChargeTypeConstant.CHARGETYPE_ID_FIX);	
		enableDisableInputField('fixAmount', 'false');
		enableDisableInputField('weightAmount', 'true');
		enableDisableInputField('weigthFreightRate', 'true');
		enableDisableInputField('qtyAmount', 'true');
		
		if(configuration.VolumetricRate == 'true'){
			if (volumetric.checked) {
				switchHtmlTagClass('LBH', 'show', 'hide');
			}
		} else {
			switchHtmlTagClass('LBH', 'hide', 'show');
		}
		
		$('#fixAmount').val((qtyAmt / actualSlabValue) * quantity);
		return;
	}
	
	$('#qtyAmount').val(qtyAmt);
	
	if ($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		if(configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true) {
			if(qtyAmt <= 0) {
				enableDisableInputField('qtyAmount', 'true');
			} else {
				enableDisableInputField('qtyAmount', 'false');
			}
		}
	}
	if ($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		if(configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == 'true' || configuration.AllowToBookTbbLrWithZeroAmountIfRateNotDefined == true) {
			if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
				if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT){
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'true');
				}else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY){
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'false');
				}else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX){
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'true');
				}
			} else {
				if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT){
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'false');
					enableDisableInputField('weigthFreightRate', 'false');
					enableDisableInputField('qtyAmount', 'true');
				}else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY){
					enableDisableInputField('fixAmount', 'true');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'false');
				}else if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX){
					enableDisableInputField('fixAmount', 'false');
					enableDisableInputField('weightAmount', 'true');
					enableDisableInputField('weigthFreightRate', 'true');
					enableDisableInputField('qtyAmount', 'true');
				}
			}
		}
	}
}

function getFreightChargeForRates(response) {
	var amnt = 0;

	if(response[BookingChargeConstant.FREIGHT] != null) {
		amnt	= Number(response[BookingChargeConstant.FREIGHT]);
	}

	return amnt;
} 

function getTempStringForRates(response,quantity){
	var tempString = "";
	var chargeTypeId	= 0;
	var qtyAmt			= 0;
	var chargeType		= $('#chargeType').val();
	var totalQty		= $('#totalQty').html();
	var actualWeight	= $('#actualWeight').val();

	for (var key in response) {
		chargeTypeId	= Number(key);

		if(configuration.ApplyArticleWiseRateOnWeightType == 'true' && getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID
				&& jQuery.inArray(chargeTypeId + "", chargesToApplyArticleWiseRateOnWeightType) != -1) { //chargesToApplyArticleWiseRateOnWeightType coming from property
			if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				if(actualWeight > 0) {
					qtyAmt	= Number(response[key]) * Number(totalQty);
				} else {
					qtyAmt	= Number(response[key]) * Number(quantity);
				}
			} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
				qtyAmt	= Number(response[key]) * Number(totalQty);
			} else {
				qtyAmt	= Number(response[key]);
			}
		} else if(getBookingType() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID
				&& jQuery.inArray(chargeTypeId + "", aplyRateForCharges) != -1 ) { //aplyRateForCharges coming from Property
			qtyAmt	= Number(response[key]) * Number(quantity);
		} else {
			qtyAmt	= Number(response[key]);
		}

		tempString += chargeTypeId+'='+qtyAmt+',';
	}

	return tempString;
}

function calculatePackingTypeRates(quantity, typeofPacking,consignmentGoodsId){
	if(configuration.applyRateAuto == 'false'){
		return;
	}

	if ((configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == 'true' 
		|| configuration.applyRatesOnManualLrBasedOnEnteredSourceBranchId == true) && isManualWayBill){
		var srcBranchId			= $('#sourceBranchId').val();
	} else {
		var srcBranchId			= executive.branchId;
	}

	var destBranchId		= $('#destinationBranchId').val();
	var vehicleTypeValue	= $('#vehicleType').val();

	var vehicleTypeId		= 0;
	var packingGrpTypeId	= 0;
	var val					= new Array();

	if ($('#vehicleType').exists()) {
		if(vehicleTypeValue != 0) {
			val				= vehicleTypeValue.split(",");
			vehicleTypeId	= parseInt(val[0]);
		}
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
	} else {

		if($("#rateType").val() != null && $("#rateType").val() != '') {
			setRateType();
			if($("#rateType").val() == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
				if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3'){
					if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay) {
						corporateAccountId	= $('#partyMasterId').val();
					} else {
						corporateAccountId	= $('#consigneePartyMasterId').val();
					}
					categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID;//Consignee
				}else{
					corporateAccountId	= partyMasterId;
					categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
					rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
				}
			}else{
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			}
		} else {
			if(partyMasterId > 0) {
				corporateAccountId	= partyMasterId;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_PARTY_ID;
				rateTypeId			= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;//Consignor
			} else {
				corporateAccountId	= 0;
				categoryTypeId		= RateMaster.CATEGORY_TYPE_GENERAL_ID;
				rateTypeId			= 0;
			}
		}
	}

	var qtyAmt = 0;
	
	for(var i = 0; i < PackingGroupMappingArr.length; i++) {
		if(PackingGroupMappingArr[i].packingTypeMasterId == typeofPacking) {
			packingGrpTypeId	= PackingGroupMappingArr[i].packingGroupTypeId;
		}
	}

	if(typeofPacking > 0 && $('#wayBillType').val() != WayBillType.WAYBILL_TYPE_FOC) {
		var response = getPackTyprRates(srcBranchId, destBranchId, vehicleTypeId, corporateAccountId, categoryTypeId, typeofPacking, packingGrpTypeId, quantity, rateTypeId, consignmentGoodsId, consigneeId);
		
		if(response && !jQuery.isEmptyObject(response)) {
			if(applyRateForSpecificArticle && noOfArticlesAdded == 0 && chargeTypeId != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) { // 3 is Article Type
				if(getFreightChargeForRates(response) > 0) { 
					$('#chargeType').val(ChargeTypeConstant.CHARGETYPE_ID_QUANTITY); //  3 is Article Type
					changeOnChargeType();
					qtyAmt 				= getFreightChargeForRates(response);
				}
			} else {
				if(chargeTypeId == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
					qtyAmt 				= getFreightChargeForRates(response);
				}
			}

			var tempString		=	getTempStringForRates(response,quantity);
			$('#searchRate').val(tempString);

			purefrieghtAmount	= getFreightChargeForRates(response);
			setValueToHtmlTag('pureFrieghtAmt', purefrieghtAmount);
			displaySpecificRate(response);
			applyExtraCharges();
		} else {
			resetSpecificCharges();
		}
	} 

	return qtyAmt;
}

function partyMinimumSlab() {
	if(isManualWayBill) {
		if(configuration.ApplyRateInManual != 'true') {
			return false;
		}
	}

	var corporateAccountId 		= 0;
	var minSlab					= 0;
	var billingPartyId			= Number($('#billingPartyId').val());
	var partyMasterId			= Number($('#partyMasterId').val());

	if(billingPartyId > 0) {
		corporateAccountId	= billingPartyId;
	} else {
		if($("#rateType").val() != null && $("#rateType").val() != '') {
			setRateType();
			if($("#rateType").val() == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
				if(configuration.ChargeTypeFlavour == '2' || configuration.ChargeTypeFlavour == '3'){
					if(configuration.ChargeTypeFlavour == '3' && applyConsignorRateOnTopay) {
						corporateAccountId	= $('#partyMasterId').val();
					} else {
						corporateAccountId	= $('#consigneePartyMasterId').val();
					}
				}
			} else {
				corporateAccountId	= partyMasterId;
			}
		} else {
			if(partyMasterId > 0) {
				corporateAccountId	= partyMasterId;
			} else {
				corporateAccountId	= 0;
			}
		}
	}

	minSlab	= jsonPartyMinSlab[corporateAccountId];

	return minSlab;
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
				if (configuration.TemporaryWght == 'true') {
					$('#tempWeight').val(Math.round((lbhTotal.value) * (configuration.defaultLBHValue)));
				}
			} else if(configuration.defaultLBHOperator == TransportCommonMaster.LBH_OPERATOR_DIVIDE_ID) {
				$('#actualWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				if (configuration.TemporaryWght == 'true') {
					$('#tempWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				}
			} else {
				$('#actualWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				if (configuration.TemporaryWght == 'true') {
					$('#tempWeight').val(Math.round((lbhTotal.value) / (configuration.defaultLBHValue)));
				}
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
		var discountAmount	= 0;
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
		var discountPercentage = 0;
		var discountAmount	= 0;

		discountPercentage = (parseFloat($("#discount").val()) / parseFloat($("#charge"+BookingChargeConstant.FREIGHT).val())) * 100;

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
function calculateDiscountThroughMaster(){
	var DiscountMaster			= jsondata.DiscountMaster;
	var isPercent				= DiscountMaster.isPercent;
	var	discountValue			= DiscountMaster.discountValue;
	var	applicableOnCharges		= DiscountMaster.applicableOnCharges;
	var	applicableOnChargesArr	= new Array();
	var	discountAmount			= 0;
	var	chargeSum				= 0;
	applicableOnChargesArr		= applicableOnCharges.split(',');

	if(isPercent == true || isPercent == 'true'){
		for(var i = 0; i < applicableOnChargesArr.length; i++){
			chargeSum += Number($("#charge"+applicableOnChargesArr[i]).val());
		}
		discountAmount = Math.round((chargeSum * discountValue) / 100);
		$('#discount').val(discountAmount);
	} else {
		for(var i = 0; i < applicableOnChargesArr.length; i++){
			chargeSum += Number($("#charge"+applicableOnChargesArr[i]).val());
		}
		$('#discount').val(discountValue);
	}
}

function calcGrandtotal() {
	var grandtotal 	= 0;
	
	var amount				= getAmountToCalculateEncludedTax();
	var serviceTaxExclude 	= getServiceTaxExcludeCharges();
	discAmount 				= getDiscountedAmount(amount, serviceTaxExclude);
	
	grandtotal 		= parseFloat(discAmount) + parseFloat(serviceTaxExclude);

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
	var total	= getChargesTotal();
	
	if (lrWiseDecimalAmountAllow($('#wayBillType').val())) {
		$("#totalAmt").val(total.toFixed(2));
	} else {		
		$("#totalAmt").val(Math.round(total).toFixed());
	}
	
	calcGrandtotal();
	calTDSAmount(this.id);
}

function getChargesTotal() {
	var charges	= jsondata.charges;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;

		if ($("#charge"+chargeMasterId).val() != "") {
			total += parseFloat($("#charge"+chargeMasterId).val());
			if(configuration.BookingChargesFloatValueAllowed != 'true') {
				$("#charge"+chargeMasterId).val(Math.round(parseFloat($("#charge"+chargeMasterId).val())));
			}
		}
	}
	return total;
}

function checkChargesRates(obj) {
	var chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	var chargeRate		= null;
	var actualInput		= Number($('#actualInput'+chargeMasterId).val());
	if (chargesRates != null) {
		if(chargesRates[chargeMasterId]) {
			chargeRate		= chargesRates[chargeMasterId];
		}
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
			if (editMinAmount > 0 && ((actualInput - chargeValue) > editMinAmount)) {
				alert("Enter Amount is less than this " + (actualInput - editMinAmount) + " amount.");
				$('#charge'+chargeMasterId).val(chargeRate.chargeMinAmount);
			} else if (editMaxAmount > 0 && ((chargeValue - actualInput) > editMaxAmount)) {
				alert("Enter Amount is more than this " + (actualInput + editMaxAmount) + " amount.");
				$('#charge'+chargeMasterId).val(chargeRate.chargeMinAmount);
			} else if (editMaxValue > 0 && ((actualInput - chargeValue) > editMaxValue)) {
				alert("You can not enter less than this " + (actualInput - editMaxValue) + " amount.");
				$('#charge'+chargeMasterId).val(chargeRate.chargeMinAmount);
			}
		}
	}

	if(configuration.AllowEnableDoorDelivery == 'true' && chargeMasterId == Number(configuration.doorDeliveryChargeId) && configuration.DoorDeliveryChargeValidate != 'true') {
		var isReadOnly = document.getElementById('charge'+chargeMasterId).readOnly;

		if (isReadOnly != true){ 
			if(!validateInput(1, 'charge'+chargeMasterId, 'charge'+chargeMasterId, 'error', 'Please Enter Door Delivery Charge !')) {
				setTimeout(function(){ document.getElementById('charge'+chargeMasterId).focus(); }, 10);
				return false;
			}
		}
	}

	if(configuration.editDeliveryAtBasedOnDlyChrges == 'true' && chargeMasterId == BookingChargeConstant.DOOR_DELIVERY_BOOKING) {
		if($('#charge'+chargeMasterId).val() > 0 && $('#deliveryTo').val() != TransportCommonMaster.DELIVERY_TO_DOOR_ID){
			$('#deliveryTo').val(TransportCommonMaster.DELIVERY_TO_DOOR_ID);
		}
	}
	if(configuration.checkChargesAfterApplyRateInAuto == 'true'){
		var actualInput		= Number($('#actualChargeAmount'+chargeMasterId).val());
		var chargeValue		= obj.value;
		if(chargeValue < actualInput && actualInput > 0){
			//alert("You can not enter less then this " + (actualInput) + " amount.");
			showMessage('info', 'You can not enter less then this '+actualInput+' /-');
			setTimeout(function(){ $('#charge'+chargeMasterId).focus(); }, 0);
			$('#charge'+chargeMasterId).val(actualInput);
			//return false;

		}
	}
	if(configuration.applyDiscountThroughMaster == 'true' && jsondata.DiscountMaster != undefined){
		calculateDiscountThroughMaster();
	}
}

function calculateWeightAndQuantityWiseFreightAmount(chargeMasterId) {
	var qtyAmnt			= 0;
	var weightAmnt		= 0;

	if(quantityTypeArr != null) {
		qtyAmnt			= getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr);
	}

	if(weightTypeArr != null) {
		weightAmnt			= getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr);
	}

	if(qtyAmnt % 1 != 0) {
		qtyAmnt				= Math.round(qtyAmnt * 100) / 100;
	}

	if(weightAmnt % 1 != 0) {
		weightAmnt			= Math.round(weightAmnt * 100) / 100;
	}

	if (configuration.isQtyAmntAndWeightAmntCompare == 'true') {
		if (qtyAmnt > weightAmnt) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT) {
				$('#freightChargeValue').val(Number(qtyAmnt));
			}
		} else {
			if(chargeMasterId == BookingChargeConstant.LR_CHARGE) {
				$('#lrChargeValue').val(Number(weightAmnt));
			}
			if(configuration.calculateLoadingChargeOnFreightAmount == 'false'){
				$('#charge' + chargeMasterId).val(Number(weightAmnt));
			}

			if(chargeMasterId == ChargeTypeMaster.FREIGHT) {
				$('#freightChargeValue').val(Number(weightAmnt));
			}
		}
	} else {
		var chargeType	=	0;
		if(configuration.configureApplyRateOnChargeTypeRespectToCharge == 'true'  && chargeMasterId == Number(configuration.configuredChargeMasterId)) {
			if(configuredChargeTypeId == ChargeTypeConstant.CHARGETYPE_ID_FIX) {
				chargeType	= ChargeTypeConstant.CHARGETYPE_ID_QUANTITY;
			} else {
				chargeType	= configuredChargeTypeId;
			}
		} else {
			chargeType	= $('#chargeType').val();
		}

		if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			$('#charge' + chargeMasterId).val(Number(qtyAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT) {
				$('#freightChargeValue').val(Number(qtyAmnt));
			}
		} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
			if(chargeMasterId == BookingChargeConstant.LR_CHARGE) {
				$('#lrChargeValue').val(Number(weightAmnt));
			}

			$('#charge' + chargeMasterId).val(Number(weightAmnt));

			if(chargeMasterId == ChargeTypeMaster.FREIGHT) {
				$('#freightChargeValue').val(Number(weightAmnt));
			}
		} else if(chargeType == ChargeTypeConstant.CHARGETYPE_ID_FIX){
			$('#charge' + chargeMasterId).val(Number(weightAmnt));
			if(chargeMasterId == ChargeTypeMaster.FREIGHT) {
				$('#freightChargeValue').val(Number(weightAmnt));
			}	
		}
	}
}

function calculateLRLevelCharges(chargesRates, chargeMasterId, masterIdsArr) {
	if(configuration.AllowEnableDoorDelivery == 'true') {
		if($("#deliveryTo").val() ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID && Number($('#wayBillType').val()) != Number(WayBillType.WAYBILL_TYPE_FOC)) {
			$('#charge' + Number(configuration.doorDeliveryChargeId)).removeAttr("readonly");
		} else {
			$('#charge' + Number(configuration.doorDeliveryChargeId)).val(0);
			$('#charge' + Number(configuration.doorDeliveryChargeId)).prop("readonly", "true");
		}
	} else {
		$('#charge' + chargeMasterId).removeAttr('disabled');
		$('#charge' + chargeMasterId).removeAttr("readonly");
	}

	setNonEditableFreightCharge();

	if (chargesRates != null) {
		var chargeRate	= chargesRates[chargeMasterId];
		
		if (chargeRate) {
			if ((chargeRate.applicable) == false) {
				$('#charge' + chargeMasterId).prop("disabled", "true");

				if(configuration.resetAmountForChargeNotApplicable == 'true') {
					$('#charge' + chargeMasterId).val(0);
				}
			} else {
				$('#charge' + chargeMasterId).removeAttr('disabled');
			}

			if(configuration.AllowEnableDoorDelivery == 'true' && chargeMasterId != Number(configuration.doorDeliveryChargeId)) {
				if ((chargeRate.editable) == false) {
					$('#charge' + chargeMasterId).prop("readonly", "true");
				} else {
					$('#charge' + chargeMasterId).removeAttr("readonly");
				}
			}

			if ($('#charge'+chargeMasterId).val() < chargeRate.chargeMinAmount) {
				if (chargeRate.chargeMinAmount != 0 ) {
					if(chargeRate.ispercent == true) { 
						if(($('#charge' + chargeRate.chargeApplicableOn).val()) > 0) {
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, 1));	
						} else if(chargeRate.fieldId > 0) {
							$('#charge' + chargeMasterId).val(calculateChargeMinAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.fieldId, 2));
						} else {
							$('#charge' + chargeMasterId).val(0);
						}
					} else {
						if(configuration.setRatesChargeTypeWise == 'true' && _.contains(masterIdsArr, chargeMasterId)) {
							if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT && Number($('#chargedWeight').val()) >= Number(configuration.minWeightForApplyRates)) {
								$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
							}
						} else {
							if(configuration.AllowEnableDoorDelivery == 'true' && chargeMasterId == Number(configuration.doorDeliveryChargeId)) {
								var deliveryTo = $('#deliveryTo').val();
							
								if(deliveryTo ==  InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID){
									$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
								} else {
									$('#charge' + chargeMasterId).val(0);
								}
							} else {
								$('#charge' + chargeMasterId).val(calculateCustomChargesAmount(chargeMasterId, chargeRate.chargeMinAmount, chargeRate.chargeUnit));
							}
						}
					}
				} else {
					$('#charge' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
				}
			}

			$('#actualInput' + chargeMasterId).val(Number(chargeRate.chargeMinAmount));
		}
	}

	if(configuration.disableBookingCharges == 'true' && !isManualWayBill){
		$('#charge'+chargeMasterId).prop("readonly", "true");
	}
	if(configuration.calculateLateNightChargeOnFreightAmount == 'true' && !isManualWayBill) {
		if(currentTimeFromServer != null && currentTimeFromServer != undefined) {
			if(currentTimeFromServer > configuration.lateNightStartTime && currentTimeFromServer < configuration.lateNightEndTime) {
				$('#charge'+ BookingChargeConstant.LATE_NIGHT).val(Math.round((Number($('#charge'+ BookingChargeConstant.FREIGHT).val()) * Number(configuration.calculateLateNightChargeOnFreightAmountPercentageRate))/100));
			}
		}
	}
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

function applyRates() {

	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_FOC) {
		resetOnChargeTypeExcludingPackageDetails();
		return true;
	}
	if(Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_CUBIC_RATE && configuration.ChargeCubicRateCBMWise == 'true') {
		return;
	}
	
	if(isManualWayBill) {
		if(configuration.ApplyRateInManual == 'false') {
			if(jsondata.charges) {
				var chargeTypeModel = jsondata.charges;
				for (var i = 0; i < chargeTypeModel.length; i++) {

					var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;

					calculateWeightAndQuantityWiseFreightAmount(chargeMasterId);
				}
			}

			frightCalcForST();
			calcTotal();

			return false;
		}
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

			if(configuration.wayBillChargeWiseRemarkNeeded == 'true') {
				showHideRemark(chargeMasterId); //defined in WayBillSetReset.js
			}


			if(configuration.checkChargesAfterApplyRateInAuto == 'true' && !isManualWayBill) {
				var chargeIdsToAvoidCheckInAutoArr = configuration.chargeIdsToAvoidCheckInAuto.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInAutoArr.includes(Number(chargeMasterId))) {
					setHiddenValuesForCharges(chargeMasterId);
				}
			}

			if(configuration.checkChargesAfterApplyRateInManual == 'true' && isManualWayBill) {
				var chargeIdsToAvoidCheckInManual = configuration.chargeIdsToAvoidCheckInManual.split(',').map(function(item) {
					return parseInt(item.trim(), 10);
				});

				if(!chargeIdsToAvoidCheckInManual.includes(Number(chargeMasterId))) {
					setHiddenValuesForCharges(chargeMasterId);
				}
			}
		}
	}
	
	var wayBillTypeId = $('#wayBillType').val();
	
	//Default LR level charges
	if($('#charge'+BookingChargeConstant.LR_CHARGE).val() <= 0) {
		$('#charge'+BookingChargeConstant.LR_CHARGE).val(configuration.LRCharge);
	}
	
	if($('#charge'+BookingChargeConstant.STATISTICAL).val() <= 0) {
		$('#charge'+BookingChargeConstant.STATISTICAL).val(configuration.defaultStatisticalCharge);
	}
	
	if(configuration.allowConditionalLRLevelCharges == 'true'){
		if(wayBillTypeId != WayBillType.WAYBILL_TYPE_PAID){
			$('#charge'+BookingChargeConstant.LR_CHARGE).val(0);
		}
		
		if(wayBillTypeId == WayBillType.WAYBILL_TYPE_TO_PAY){
			if($("#actualWeight").val() > 20) {
				$('#charge'+BookingChargeConstant.STATISTICAL).val(30);
			}
		}
		
		if(wayBillTypeId != WayBillType.WAYBILL_TYPE_TO_PAY){
			$('#charge'+BookingChargeConstant.STATISTICAL).val(0);
		}
	}

	if(configuration.applyLoadingChargeOnFreightChargeAmt == 'true' || configuration.applyLoadingChargeOnFreightChargeAmt == true){
		var totalConsignmentQuantity	= getTotalAddedArticleTableQuantity();
		if(Number($('#charge' + BookingChargeConstant.FREIGHT).val()) > Number(configuration.minimumFreightChargeValueToApplyRate)){
			$('#charge'+BookingChargeConstant.LOADING).val(10 * totalConsignmentQuantity);
		} else {
			$('#charge'+BookingChargeConstant.LOADING).val(0);
		}
	}
	loadingChargeAmount	= $('#charge'+BookingChargeConstant.LOADING).val();
	makeChargeEditable(); // Called from Consignment.js file
	calculateCarrierRiskPerArticle();
	frightCalcForST();
	totalWithExtraAddedAmount();
	applyExtraCharges();

	if(configuration.checkConsignmentGoodForApplyRate == 'true' || configuration.checkConsignmentGoodForApplyRate == true) {
		chargesForGroup();
	}
	
	if(configuration.applyDiscountThroughMaster == 'true' && jsondata.DiscountMaster != undefined){
		calculateDiscountThroughMaster();
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
			if ($("#chargedWeight").val() > 0) {
				chargeAmount = (chargeValue * $("#chargedWeight").val());
			}
		} else if(chargeUnit == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
			var totalQty	= 0;
			
			if(configuration.isPackingGroupTypeWiseChargeAllow == 'true') {
				totalQty	= totalConsignmentQuantity;
			} else {
				totalQty	= getTotalAddedArticleTableQuantity();
			}
			
			chargeAmount 	= (chargeValue * totalQty);
		}
	}
	
	if(chargeMasterId == BookingChargeConstant.LOADING) {
		if(configuration.isPackingGroupWiseRateApplicable == 'true'){
			var loadingCharge		= document.getElementById('charge'+chargeMasterId);
			
			if(loadingCharge) {
				chargeAmount = (chargeValue * totalConsignmentQuantity);
			}
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

	if (fright == null) {
		return;
	}

	if (stPaidBySelectionByParty) {
		selectSTPaidBy(TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt();
	} else {
		if(!setDefaultStPaidBy){			
			setDefaultSTPaidBy(wayBillTypeId);
		}
	}
}

function setLrChargeForNwParty() {
	var partyId = parseInt($('#partyMasterId').val());
	if(partyId == 0) {
		getWeightTypeRates();
	}
	
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
					amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
					break;
				}
			}
		}
		
		if(configuration.allowConditionalRouteWiseCharges == 'true'){
			var hamaliCharge = 0;
			hamaliCharge = $("#chargedWeight").val()*0.50;
			if(sliptedByCommas[0].split("=")[0] == BookingChargeConstant.HAMALI){
				if(hamaliCharge > sliptedByCommas[0].split("=")[1]){
					$("#charge"+sliptedByCommas[0].split("=")[0]).val(hamaliCharge);
				} else{
					$("#charge"+sliptedByCommas[0].split("=")[0]).val( sliptedByCommas[0].split("=")[1]);
				}
			}
		}
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
		var fixAmt = 0;

		if($('#fixAmount').exists()) {
			if($('#fixAmount').val() != '') {
				fixAmt = parseInt($('#fixAmount').val());
			}
		}

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
				amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
				break;
			}
			if(configuration.allowConditionalRouteWiseCharges == 'true'){
				var hamaliCharge = 0;
				hamaliCharge = $("#chargedWeight").val()*0.50;
				if(sliptedByCommas[j].split("=")[0] == BookingChargeConstant.HAMALI){
					if(hamaliCharge > sliptedByCommas[j].split("=")[1]){
						$("#charge"+sliptedByCommas[j].split("=")[0]).val(hamaliCharge);
					} else{
						$("#charge"+sliptedByCommas[j].split("=")[0]).val( sliptedByCommas[j].split("=")[1]);
					}
				}
			}
		}
		
	}

	if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_FIX && chargeMasterId == BookingChargeConstant.FREIGHT) {
		var fixAmt = 0;

		if($('#fixAmount').exists()) {
			if($('#fixAmount').val() != '') {
				fixAmt = parseInt($('#fixAmount').val());
			}
		}

		amount = fixAmt;
	}
	return amount;
}

function calculateChargeMinAmount(chargeMasterId,chargeMinAmount,chargeApplicableOnId,filter){

	var calculateChargeMinAmount = chargeMinAmount; 
	if(filter == 1){
		var chargeApplicableOn 	= ($('#charge'+chargeApplicableOnId).val());
		if( chargeApplicableOn > 0){
			calculateChargeMinAmount = (calculateChargeMinAmount*chargeApplicableOn)/100;
		}
	} else if(filter == 2){
		if(chargeApplicableOnId == ChargeConfiguration.FIELD_ID_DECLARED_VALUE){
			if ($("#declaredValue").length > 0) {
				var declaredValue		= $('#declaredValue').val();
				var chargeEle			= document.getElementById('charge'+chargeMasterId);
				if(chargeEle && declaredValue > 0){
					calculateChargeMinAmount = ((calculateChargeMinAmount * declaredValue) / 100);
				} 
			}
		}
	}

	var decVal = $('#declaredValue').val();

	if( configuration.isRiskAllocationAllow && chargeMasterId == BookingChargeConstant.CARRIER_RISK) {
		return Math.round(calculateChargeMinAmount);
	} 

	if((configuration.compareFOVWithDecVal == 'true' || configuration.compareFOVWithDecVal == true) && chargeMasterId == BookingChargeConstant.FOV && decVal < 200000) {
		return 0;
	}
	if(configuration.roundoffServiceCharge) {
		return Math.round(calculateChargeMinAmount);
	}
	return calculateChargeMinAmount;

} 

function setBookingChargeAmt(obj) {
	var chargeTypeMasterId = (obj.id).split("_");
	$('#charge'+chargeTypeMasterId[1]).val($("#"+obj.id).val());
}

/*
 * Apply AOC Charge on Total of every charge except AOC charge
 */
function applyAOCCharge() {}

/*
 * Reset AOC charge if aoc value is less than 0
 */
function resetAOC() {}

/*
 * Apply extra charge for FOV on Declared Value
 * 
 */

function applyExtraCharges() {}

/*
 * Change Freight amount if Freight amount not equals to Qty Amount
 * set Charge type to fix
 */
function changeFreightAmount() {
	if(configuration.ChangeFreightAmount == 'false') {
		return;
	}

	var consignmentAmount = $('#qtyAmount').val();
	var freightAmount	  = getValueFromInputField('charge' + BookingChargeConstant.FREIGHT);

	if(consignmentAmount != freightAmount) {

		if(consignmentAmount == '') {
			consignmentAmount	= 0;
		}

		setValueToTextField('charge' + BookingChargeConstant.FREIGHT, consignmentAmount);
		setValueToTextField('chargeType', ChargeTypeConstant.CHARGETYPE_ID_FIX);
	}

	calcTotal();
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

function calculateFSOnOtherCharge(chargeTypeMasterId) {
	//don't delete this function
}