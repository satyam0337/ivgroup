var chargesRates 					= null;
var wayBillRates 					= null;
var ChargeConfiguration				= null;
var quantityTypeArr					= null;
var weightTypeArr					= null;
var octroiTypeArr					= null;
var fixTypeArr						= null;
var deliveryChargesConfigRates		= null;

//get rates from ratemaster.
function getDeliveryRates(corporateAccountId,consmDtls, consignmentSummary, wayBillId) {
	weightTypeArr						= new Array();
	quantityTypeArr						= new Array();
	octroiTypeArr						= new Array();
	fixTypeArr							= new Array();

	var jsonObject						= new Object();

	jsonObject.srcBranchId			= executive.branchId;
	jsonObject.corporateAccountId	= corporateAccountId;
	
	if(isFocLR(wayBillId))
		return;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:8}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
					}
				} else {
					wayBillRates	= null;
					wayBillRates	= data.wayBillRates;
					getPackingTypeRates(corporateAccountId, consmDtls, wayBillId);
					getWeightTypeRates(corporateAccountId, consignmentSummary, consmDtls, wayBillId);
					getOctroiRates(corporateAccountId, wayBillId);
					getFixRates(corporateAccountId, wayBillId);
					applyRates(wayBillId);
				}
			});
}

function isFocLR(wayBillId) {
	return wayBillId > 0 &&  $('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_FOC || wayBillId == 0 && $('#waybillTypeId').val() == WAYBILL_TYPE_FOC;
}

function getPackingTypeRates(corporateAccountId, consmDtls, wayBillId) {
	if(isFocLR(wayBillId))
		return;
	
	quantityTypeArr						= new Array();
	
	for(var i = 0; i < consmDtls.length; i++) {
		var temp =  consmDtls[i];

		var quantity			= temp.quantity;
		var typeofPacking		= temp.packingTypeMasterId;
		calculatePackingTypeRates(corporateAccountId, quantity, typeofPacking);
	}
}

//Calculate packing type rate
function calculatePackingTypeRates(corporateAccountId, quantity, typeofPacking) {
	var srcBranchId			= executive.branchId;
	var corporateAccountId	= corporateAccountId;

	var response = getPackTyprRates(srcBranchId, typeofPacking, quantity, corporateAccountId);

	if(response && !jQuery.isEmptyObject(response)) {
		var tempString	= getTempStringForRates(response, quantity, 1);
		quantityTypeArr.push(tempString);
	} else {
		response = new Object();
	}
}

//applied various condition for packing type rates form rate master
function getPackTyprRates(srcBranchId, packingTypeId, quantity, corporateAccountId) {

	var chargeTypeId		= CHARGETYPE_ID_QUANTITY;
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var filterToGetRates	= 1;

	//Specfic packing type Rates with party
	rateMaster = filterRates(filterToGetRates, srcBranchId,CATEGORY_TYPE_PARTY_ID, packingTypeId, corporateAccountId,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, quantity, 1);
	//Generic Packing Type Rates with party
	rateMaster = filterRates(filterToGetRates, srcBranchId,CATEGORY_TYPE_PARTY_ID, 0, corporateAccountId,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, quantity, 1);
	
	//Specfic packing type Rates with general
	rateMaster = filterRates(filterToGetRates, srcBranchId,CATEGORY_TYPE_GENERAL_ID, packingTypeId, 0,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, quantity, 1);
	
	//Generic Packing Type Rates with general
	rateMaster = filterRates(filterToGetRates, srcBranchId,CATEGORY_TYPE_GENERAL_ID, 0, 0,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, quantity, 1);

	return rateId_mast;
}

function getWeightTypeRates(corporateAccountId, consignmentSummary, consmDtls, wayBillId) {
	if(isFocLR(wayBillId))
		return;
	
	for(var i = 0; i < consmDtls.length; i++) {
		var temp =  consmDtls[i];

		var typeofPacking		= temp.packingTypeMasterId;
		calculateWeightTypeRates(consignmentSummary.chargeWeight, corporateAccountId, typeofPacking, wayBillId);
	}
}

function calculateWeightTypeRates(chargedWeight, corporateAccountId, packingTypeId, wayBillId) {
	var srcBranchId			= executive.branchId;
	
	var response =  getWghtTypeRates(srcBranchId, packingTypeId, corporateAccountId, chargedWeight);
		
	if(response && !jQuery.isEmptyObject(response)) {
		var tempString		= getTempStringForRates(response, chargedWeight, 1);
		weightTypeArr = new Array();
		weightTypeArr.push(tempString);
	} else
		weightTypeArr = new Array();
		
	applyRates(wayBillId);
}


//applied various condition for weight type rates form rate master
function getWghtTypeRates(srcBranchId, packingTypeId, corporateAccountId, userWeightInput) {

	var chargeTypeId		= CHARGETYPE_ID_WEIGHT;
	var rateId_mast			= new Object();
	var rateMaster			= null;
	var filterToGetRates	= 1;
	
	rateMaster = filterRates(filterToGetRates, srcBranchId, CATEGORY_TYPE_PARTY_ID,  packingTypeId, corporateAccountId, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);

	rateMaster = filterRates(filterToGetRates, srcBranchId,  CATEGORY_TYPE_PARTY_ID,  0, corporateAccountId, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	rateMaster = filterRates(filterToGetRates, srcBranchId,  CATEGORY_TYPE_PARTY_ID, 0, corporateAccountId, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	//if Party rates not defined then apply general rates
	
	rateMaster = filterRates(filterToGetRates, srcBranchId,  CATEGORY_TYPE_GENERAL_ID,  packingTypeId, 0, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput ,1);
	
	rateMaster = filterRates(filterToGetRates, srcBranchId,  CATEGORY_TYPE_GENERAL_ID,  0, 0, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 2);
	
	rateMaster = filterRates(filterToGetRates, srcBranchId,  CATEGORY_TYPE_GENERAL_ID,  0, 0, chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, userWeightInput, 1);
	
	return rateId_mast;
}

function getOctroiRates(corporateAccountId, wayBillId) {
	if(isFocLR(wayBillId))
		return;
	
	calculateOctroiRates(corporateAccountId, wayBillId);
}

function calculateOctroiRates(corporateAccountId, wayBillId){

	var srcBranchId			= executive.branchId;
	
	var response =  getOctroiTypeFilterRates(srcBranchId,corporateAccountId);

	if(response && !jQuery.isEmptyObject(response)) {
		var tempString		=	getTempStringForRates(response,0,2);
		octroiTypeArr = new Array();
		octroiTypeArr.push(tempString);
	} else {
		octroiTypeArr = new Array();
	}

	applyRates(wayBillId);
}

function getOctroiTypeFilterRates(srcBranchId, corporateAccountId) {

	var rateId_mast			= new Object();
	var rateMaster			= null;
	var filterToGetRates	= 1;
	
	rateMaster = filterRates(filterToGetRates, srcBranchId, CATEGORY_TYPE_PARTY_ID,0,corporateAccountId,0);
	checkAndInsertRates(rateMaster, rateId_mast, 0, 1);

	rateMaster = filterRates(filterToGetRates, srcBranchId, CATEGORY_TYPE_GENERAL_ID,0,0,0);
	checkAndInsertRates(rateMaster, rateId_mast, 0, 2);
	
	return rateId_mast;
}

function getFixRates(corporateAccountId, wayBillId) {
	if(isFocLR(wayBillId))
		return;
	
	calculateFixRates(corporateAccountId, wayBillId);
}

function calculateFixRates(corporateAccountId, wayBillId) {

	var srcBranchId			= executive.branchId;

	var response =  getFixTypeFilterRates(srcBranchId, corporateAccountId);
	
	if(response && !jQuery.isEmptyObject(response)) {
		var tempString		=	getTempStringForRates(response,0,2);
		fixTypeArr = new Array();
		fixTypeArr.push(tempString);
	} else {
		fixTypeArr = new Array();
	}
	
	applyRates(wayBillId);
}

function getFixTypeFilterRates(srcBranchId,corporateAccountId) {

	var rateId_mast			= new Object();
	var rateMaster			= null;
	var filterToGetRates	= 1;
	var chargeTypeId		= CHARGETYPE_ID_FIX;
	
	rateMaster = filterRates(filterToGetRates, srcBranchId, CATEGORY_TYPE_PARTY_ID,0,corporateAccountId,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, 0, 1);

	rateMaster = filterRates(filterToGetRates, srcBranchId, CATEGORY_TYPE_GENERAL_ID,0,0,chargeTypeId);
	checkAndInsertRates(rateMaster, rateId_mast, 0, 2);
	
	return rateId_mast;
}


function calculateOctroiCharge(chargeTypeMasterId, isRateApply){
	var octAmt 		= 0;
	var amnt		= getAmntFromWeightAmntArr(chargeTypeMasterId,octroiTypeArr);
	var chargeAmount = 0;
	
	if(!jQuery.isEmptyObject(wayBillRates)) {
		
		if(chargeTypeMasterId == OCTROI_SERVICE){
			document.getElementById('octroiServiceCharge').value = 0;
			for (var i = 0; i < wayBillRates.length; i++) {
				var datarates = wayBillRates[i];
				
				if(chargeTypeMasterId == datarates.chargeTypeMasterId){

					if ($('#deliveryCharge' + datarates.applicableOn).exists()) {
						octAmt			= parseInt($('#deliveryCharge'+datarates.applicableOn).val());
					
						if(datarates.chargePercent == true) {
							setValueToHtmlTag('label' + chargeTypeMasterId, 'Octroi Service ( ' + datarates.rate + ' %)');
							
							if(($('#deliveryCharge'+datarates.applicableOn).val())>0){
								chargeAmount = calculateChargeMinAmount(amnt, datarates.applicableOn, 0)
								document.getElementById('octroiServiceCharge').value = Math.round(chargeAmount);
								
								if(configuration.IsUserDefinedRateAllow == 'false') {
									if ($('#deliveryCharge'+chargeTypeMasterId).val() < chargeAmount){
										$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(chargeAmount));	
									} 
								} else if (isRateApply == 'true')
									$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(chargeAmount));	
							}else{
								//$('#deliveryCharge'+chargeTypeMasterId).val(0);
							}
						} else if(configuration.IsUserDefinedRateAllow == 'false') {
							if ($('#deliveryCharge'+chargeTypeMasterId).val() < amnt)
								$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(amnt));
						} else if (isRateApply == 'true')
							$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(chargeAmount));	
					}
				}
			}
		} else if(chargeTypeMasterId == OCTROI_FORM){
			for (var i = 0; i < wayBillRates.length; i++) {
				var datarates = wayBillRates[i];
				if ($('#deliveryCharge'+datarates.applicableOn).exists()){
					octAmt	= parseInt($('#deliveryCharge'+datarates.applicableOn).val());
					
					if (octAmt > 0) {
						if(configuration.IsUserDefinedRateAllow == 'false') {
							if ($('#deliveryCharge'+chargeTypeMasterId).val() < amnt) {
								$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(amnt));
							}
						} else if (isRateApply)
							$('#deliveryCharge'+chargeTypeMasterId).val(Math.round(amnt));	
					} else {
						//$('#deliveryCharge'+chargeTypeMasterId).val(0);
					}
				}
			}
		}
	}
}

function calculateChargeMinAmount(chargeMinAmount, chargeApplicableOnId, wayBillId) {
	let chargeApplicableOn	= null;
	
	if(wayBillId > 0)
		chargeApplicableOn 	= $('#deliveryCharge' + chargeApplicableOnId + "_" + wayBillId).val();
	else
		chargeApplicableOn 	= $('#deliveryCharge' + chargeApplicableOnId).val();
	
	var calculateChargeMinAmount = chargeMinAmount; 
		
	if( chargeApplicableOn > 0)
		return (calculateChargeMinAmount * chargeApplicableOn) / 100;
		
	return calculateChargeMinAmount;
}

//get rates from delivery charge configuration table
function getDeliveryChargesConfigRates(corporateAccountId, wayBillId) {
	if(isFocLR(wayBillId))
		return;
	
	var jsonObject					= new Object();
	jsonObject.branchId				= executive.branchId;
	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.requestType			= DeliveryChargeConfiguration.REQUEST_TYPE_GENERATE_CR;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:6}, function(data) {

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {

						console.log("error");
						showMessage('error', data.errorDescription);
					} else {

					//	console.log("No rates");
					}
				} else {
					deliveryChargesConfigRates	= data.chargesConfigRates;
					chargesRates	= getDeliveryChargesRates(corporateAccountId);
					applyRates(wayBillId);
				}
			});
}

//get all charges 
function getDeliveryChargesRates(corporateAccountId) {

	var configObject		= null;
	var configObject1		= null;
	var configData			= new Object();

	configObject = filterRates(3, executive.branchId,0, 0, corporateAccountId,0);
	checkAndInsertRates(configObject, configData, 0, 3);

	configObject1 = filterRates(3, executive.branchId,0,0, 0,0);
	checkAndInsertRates(configObject1, configData, 0, 3);

	return configData;

}

function applyRates(wayBillId) {
	var bookingtotal = 0;
	
	if(isFocLR(wayBillId)) {
		resetDeliveryCharges(wayBillId);
		return;
	}
	
	if($('#bookingTotalAmnt') != null)
		bookingtotal = Number($('#bookingTotalAmnt').val());
	
	if(jsondata.deliverChgs) {
		var chargeTypeModel = jsondata.deliverChgs;

		for (var i = 0; i < chargeTypeModel.length; i++) {
			var chargeMasterId	= chargeTypeModel[i].chargeTypeMasterId;
			
			var qtyAmnt			= getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr);
			var weightAmnt		= getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr);
			var fixAmnt			= getAmntFromWeightAmntArr(chargeMasterId, fixTypeArr);
			
			let chargeEle	= null;
			
			if(configuration.wayBillTypeWiseApplyChargeRate == true || configuration.wayBillTypeWiseApplyChargeRate == "true") {
				if(wayBillId > 0 && $('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_PAID || wayBillId == 0 && $('#waybillTypeId').val() == WAYBILL_TYPE_PAID || wayBillId > 0 &&  $('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY || wayBillId == 0 && $('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY) {
					if(wayBillId > 0)
						chargeEle	= $('#deliveryCharge' + UNLOADING + '_' + wayBillId);
					else
						chargeEle	= $('#deliveryCharge' + UNLOADING);
				}
			} else if(wayBillId > 0)
				chargeEle	= $('#deliveryCharge' + chargeMasterId + '_' + wayBillId);
			else
				chargeEle	= $('#deliveryCharge' + chargeMasterId);
			
			if(chargeEle != null && chargeEle != undefined && (chargeEle.val() < Number(qtyAmnt) || chargeEle.val() < Number(weightAmnt) || chargeEle.val() < Number(fixAmnt))) {
				if (qtyAmnt > weightAmnt && qtyAmnt > fixAmnt)
					chargeEle.val(Math.round(qtyAmnt));
				else if (weightAmnt > qtyAmnt && weightAmnt > fixAmnt)
					chargeEle.val(Math.round(weightAmnt));
				else if (fixAmnt > qtyAmnt && fixAmnt > weightAmnt)
					chargeEle.val(Math.round(fixAmnt));
			}
			
			if(configuration.isChargeAppliedOnBookingTotal == 'true') {
				if(wayBillId > 0 &&  $('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_PAID || wayBillId == 0 && $('#waybillTypeId').val() == WAYBILL_TYPE_PAID || wayBillId > 0 && $('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY || wayBillId == 0 && $('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY) {
					if(configuration.UnloadingChargeId == chargeMasterId && bookingtotal <= Number(configuration.BookingTotalAmount)) {
						if(wayBillId > 0)
							$('#deliveryCharge' + chargeMasterId + '_' + wayBillId).val(0);
						else
							$('#deliveryCharge' + chargeMasterId).val(0);
					}
				}
			}
			
			if(configuration.minimumBookingAmountForNoDeliveryCharges == 'true' || configuration.minimumBookingAmountForNoDeliveryCharges == true) {
				if(bookingtotal < Number(configuration.bookingTotalAmountForNoDeliveryCharges))
					$('#deliveryCharge' + chargeMasterId).val(0);
			}
			
			if(configuration.showDlyChargeOnlyForGodown == 'true') {
				var wayBillTypeList        = (configuration.lrTypeForDeliveryCharge).split(",");

				if(configuration.DeliverytoId != 0) {
					var deliveryToIdList	= (configuration.DeliverytoId).split(",");
					var deliveryChargeId	= configuration.deliveryChargeId;

					if(wayBillId > 0) {
						if(isValueExistInArray(wayBillTypeList, $('#waybillTypeId_' + wayBillId).val())
								&& (isValueExistInArray(deliveryToIdList, $('#deliveryTypeId_' + wayBillId).val()))
								&& (deliveryChargeId == chargeMasterId)) {
							$('#deliveryCharge' + deliveryChargeId + "_" + wayBillId).val();
						} else
							$('#deliveryCharge' + deliveryChargeId + "_" + wayBillId).val(0);
					} else if(isValueExistInArray(wayBillTypeList, $('#waybillTypeId').val())
						&& (isValueExistInArray(deliveryToIdList, $('#deliveryTypeId').val()))
						&& (deliveryChargeId == chargeMasterId)) {
						$('#deliveryCharge' + deliveryChargeId).val();
					} else
						$('#deliveryCharge' + deliveryChargeId).val(0);
				}
			}
			
			calculateOctroiCharge(chargeMasterId, 'true');
			setDeliveryChargesTotal();
			
			if (chargesRates != null) {
				var chargeRate	= chargesRates[chargeMasterId];
			
				if (chargeRate) {
					if(wayBillId > 0)
						checkChargeRateWithWaybillId(chargeRate,wayBillId)
					else
						checkChargeRate(chargeRate, chargeMasterId);
				}
			}
		}
	}
	
	if(configuration.applyUnLoadingChargeOnFreightChargeAmt == 'true' || configuration.applyUnLoadingChargeOnFreightChargeAmt == true) {
		if(Number($('#deliveryCharge' + FREIGHT).val()) > Number(configuration.minimumFreightChargeValueToApplyDeliveryRate)
		|| Number($('#deliveryCharge' + FREIGHT + "_" + wayBillId).val()) > Number(configuration.minimumFreightChargeValueToApplyDeliveryRate)) {
			if(unloadingChargeAmount > $('#deliveryCharge' + UNLOADING).val() || unloadingChargeAmount > $('#deliveryCharge' + UNLOADING + '_' + wayBillId).val()) {
				if(wayBillId > 0)
					$('#deliveryCharge' + UNLOADING +'_' + wayBillId).val(unloadingChargeAmount);
				else
					$('#deliveryCharge' + UNLOADING).val(unloadingChargeAmount);
			}
		} else if($('#deliveryCharge' + UNLOADING).val() < 0  || $('#deliveryCharge' + UNLOADING + '_' + wayBillId).val() < 0) {
			if(wayBillId > 0)
				$('#deliveryCharge' + UNLOADING + '_' + wayBillId).val(0);
			else
				$('#deliveryCharge' + UNLOADING).val(0);
		}
	}
	
	if(configuration.allowToRemoveDefaultUnloadingCharge == 'true') {
		if(wayBillId > 0)
			unloadingChargeAmount = $('#deliveryCharge' + UNLOADING + '_' + wayBillId).val();
		else
			unloadingChargeAmount = $('#deliveryCharge' + UNLOADING).val();
	}
		
	if(wayBillId > 0)
		calulateBillAmount(wayBillId);
	else
		calulateBillAmount();
}

function filterRates(filter, srcBranchId, categoryTypeId, packingTypeId, corporateAccountId, chargeTypeId) {
	
	var accountGroupId	= executive.accountGroupId;
	var arr = new Array();
	
	switch (filter) {
	case 1:
		if(!jQuery.isEmptyObject(wayBillRates)) {
			for (var i = 0; i < wayBillRates.length; i++) {
				var datarates = wayBillRates[i];
				
				if(Number(datarates.accountGroupId) == Number(accountGroupId)
						&& Number(datarates.branchId) == Number(srcBranchId)
						&& Number(datarates.packingTypeId) == Number(packingTypeId)
						&& Number(datarates.categoryTypeId) == Number(categoryTypeId)
						&& Number(datarates.corporateAccountId) == Number(corporateAccountId)
						&& Number(datarates.chargeTypeId) == Number(chargeTypeId)
				) {
					arr.push(wayBillRates[i]);
				}
			}
		}

		break;

	case 3 :
		if(!jQuery.isEmptyObject(deliveryChargesConfigRates)) {
			for (var i = 0; i < deliveryChargesConfigRates.length; i++) {
				var rates = deliveryChargesConfigRates[i];

				if(Number(rates.accountGroupId) == Number(accountGroupId)
						&& Number(rates.branchId) == Number(srcBranchId)
						&& Number(rates.corporateAccountId) == Number(corporateAccountId)
				) {
					arr.push(deliveryChargesConfigRates[i]);
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

//check if rates is available and insert in array 
function checkAndInsertRates(rateMaster ,rateId_mast, userInput, filter) {

	switch (filter) {
	case 1:
		if(rateMaster != null && rateMaster.length > 0) {
			for (var i = 0; i < rateMaster.length; i++) {
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null) {
					if(rateMaster[i].minWeight > 0 && rateMaster[i].maxWeight > 0) {
						if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight) {
							rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
						}
					} else {
						rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
					}
				} else {
					if(parseFloat(userInput) >= rateMaster[i].minWeight && parseFloat(userInput) <= rateMaster[i].maxWeight) {
						rateId_mast[rateMaster[i].chargeTypeMasterId] = rateMaster[i].rate;
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
				if(rateId_mast[rateMaster[i].chargeTypeMasterId] == null) {
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


function checkDeliveryChargesRates(obj) {
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

			if (chargeRate.editAmountType == DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_SIMPLE) {
				editMaxAmount	= chargeRate.editMaxAmount;
				editMinAmount	= chargeRate.editMinAmount;
				editMaxValue	= chargeRate.editMaxValue;
			} else if (chargeRate.editAmountType == DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_PERCENTAGE) {
				editMaxAmount	= (actualInput * chargeRate.editMaxAmount) / 100;
				editMinAmount	= (actualInput * chargeRate.editMinAmount) / 100;
				editMaxValue	= (actualInput * chargeRate.editMaxValue) / 100;
			}

			if(configuration.IsUserDefinedRateAllow == 'true') {
				return;
			}
			
			if (editMinAmount > 0 && ((actualInput - chargeValue) > editMinAmount)) {
				alert("Enter Amount is less then this " + (actualInput - editMinAmount) + " amount.");
				$('#deliveryCharge'+chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
			} else if (editMaxAmount > 0 && ((chargeValue - actualInput) > editMaxAmount)) {
				alert("Enter Amount is more then this " + (actualInput + editMaxAmount) + " amount.");
				$('#deliveryCharge'+chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
			} else if (editMaxValue > 0 && ((actualInput - chargeValue) > editMaxValue)) {
				alert("You can not enter less then this " + (actualInput - editMaxValue) + " amount.");
				$('#deliveryCharge'+chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
			}
		}
	}
}

function resetDeliveryCharges(wayBillId) {
	if(isFocLR(wayBillId))
		$("#deliveryCharge input:text").val("0");

	if(wayBillId > 0)
		calulateBillAmount(wayBillId);
	else
		calulateBillAmount();
}

function getAmntFromQtyAmntAr(chargeMasterId, quantityTypeArr) {
	var amount 			= 0;
	var sliptedByCommas = new Array();

	for(const element of quantityTypeArr) {
		sliptedByCommas = element.split(",");
		
		for(var j = 0; j < sliptedByCommas.length; j++) {
			if(sliptedByCommas[j].split("=")[0] == chargeMasterId) {
				
				if(configuration.showDlyChargeOnlyForGodown == 'true' && configuration.DeliverytoId == 0
					&& chargeMasterId == configuration.deliveryChargeId){
					amount	=  parseFloat(amount) + disableDoorDelivery(sliptedByCommas, j, chargeMasterId);
				}else{
					amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
					break;
				}
			}
		}
	}
	
	return amount;
}

function getAmntFromWeightAmntArr(chargeMasterId, weightTypeArr) {
	var amount 			= 0;
	var sliptedByCommas = new Array();

	if(weightTypeArr != null) {
		for(var i = 0 ; i < weightTypeArr.length; i++) {
			sliptedByCommas = weightTypeArr[i].split(",");
		
			for(var j = 0; j < sliptedByCommas.length; j++) {
				if(sliptedByCommas[j].split("=")[0] == chargeMasterId) {
					if(configuration.showDlyChargeOnlyForGodown == 'true' && configuration.DeliverytoId == 0
							&& chargeMasterId == configuration.deliveryChargeId){
						amount	= disableDoorDelivery(sliptedByCommas, j, chargeMasterId);
					}else{
						amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
						break;
					}
				}
			}
		}
	}
	
	return amount;
}

function disableDoorDelivery(sliptedByCommas, j, chargeMasterId) {
	var amount	= 0;
	
	var wayBillTypeList        = (configuration.lrTypeForDeliveryCharge).split(",");
	
	if(isValueExistInArray(wayBillTypeList, $('#waybillTypeId').val())) {
		amount = parseFloat(amount) + parseFloat(sliptedByCommas[j].split("=")[1]);
		$('#deliveryCharge'+chargeMasterId).prop("readonly", "true");
	}else{
		$('#deliveryCharge'+chargeMasterId).removeAttr("readonly");
	}
	
	return amount;
}

function getTempStringForRates(response,quantity, filter) {
	var tempString = "";
	var chargeTypeId	= 0;
	var qtyAmt			= 0;
	
	for (var key in response) {
		chargeTypeId	= Number(key);
		
		if(filter == 1) {
			qtyAmt	= Number(response[key]) * Number(quantity);
		} else if(filter == 2) {
			qtyAmt	= Number(response[key]);
		}
		
		tempString += chargeTypeId+'='+qtyAmt+',';
	}
	
	return tempString;
}

//get Demmerage Charge Details
function getDeliveryDemmerageRates(corporateAccountId,wayBillId) {
	
	var jsonObject					= new Object();
	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.waybillId			= $('#waybillId').val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=353&eventId=1",
			{json:jsonStr}, function(data) {

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {

						console.log("error");
						showMessage('error', data.errorDescription);
					} else {

						console.log("No rates");
					}
				} else {
					$('#configDamerageAmount').val(data.damerage);
					if ( $('#deliveryCharge' + DAMERAGE).exists() ) {
						$('#deliveryCharge' + DAMERAGE).val(data.damerage);
					}
					applyRates(wayBillId);
				}
			});
}

function setDefaultCharges(wayBillId) {
	if(configuration.setDefaultDRCharge == 'true') {
		$('#deliveryCharge' + DR_CHARGE).val(configuration.setDefaultDRChargeAmount);
	}
}

//get getBookingRates
function getBookingRates(corporateAccountId,wayBillId) {
	
	var jsonObject						= new Object();
	
	jsonObject["waybillId"]				= $('#waybillId').val();
	jsonObject["corporateAccountId"] 	= corporateAccountId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/deliveryWayBillWS/getTotalBookingRateByParty.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
			} else {
				
				setDiscountType();
				$('#txtDelDisc').val(0);
				setExtraAmountOnCharges(data,wayBillId);
			}
		}
	});
}

function setExtraAmountOnCharges(data,wayBillId) {
	var totalBookingPartyRate	= data.totalBookingPartyRate;
	var bookingTotalAmnt		= $('#bookingTotalAmnt').val();
	
	var chargesList		= (configuration.ChargesToAddExtraAmountOnChangeOfConsigneePartyRate).split(',');
	
	for(var i = 0; i < chargesList.length; i++) {
		$('#deliveryCharge' + chargesList[i]).val(0);
	}
	
	if(totalBookingPartyRate > 0) {
		if(totalBookingPartyRate > bookingTotalAmnt) {
			for(var i = 0; i < chargesList.length; i++) {
				$('#deliveryCharge' + chargesList[i]).val(Math.round(totalBookingPartyRate - bookingTotalAmnt));
			}
		} else if(bookingTotalAmnt > totalBookingPartyRate) {
			$('#discountTR').switchClass("show", "hide");
			$('#discountTypesTR').switchClass("show", "hide");
			createOption('discountTypes', 1, 'Freight');
			$('#txtDelDisc').val(Math.round(bookingTotalAmnt - totalBookingPartyRate));
		}
	}
	
	if(wayBillId > 0)
		calulateBillAmount(wayBillId);
	else
		calulateBillAmount();
}

function checkChargeRate(chargeRate, chargeMasterId) {
	if (!chargeRate.applicable) {
		$('#deliveryCharge' + chargeMasterId).prop("disabled", "true");
		$('#deliveryCharge' + chargeMasterId).val(0);
	} else
		$('#deliveryCharge' + chargeMasterId).removeAttr("disabled");

	if (!chargeRate.editable)
		$('#deliveryCharge' + chargeMasterId).prop("readonly", "true");
	else
		$('#deliveryCharge' + chargeMasterId).removeAttr("readonly");

	if ($('#deliveryCharge' + chargeMasterId).val() < chargeRate.chargeMinAmount) {
		if (chargeRate.chargeMinAmount != 0) {
			if (chargeRate.ispercent) {
				if (($('#deliveryCharge' + chargeRate.chargeApplicableOn).val()) > 0)
					$('#deliveryCharge' + chargeMasterId).val(Math.round(calculateChargeMinAmount(chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, 0)));
				else
					$('#deliveryCharge' + chargeMasterId).val(0);
			} else
				$('#deliveryCharge' + chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
		} else
			$('#deliveryCharge' + chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
	}

	$('#actualInput' + chargeMasterId).val(Math.round(chargeRate.chargeMinAmount));
}

function checkChargeRateWithWaybillId(chargeRate, wayBillId) {
	if (!chargeRate.applicable) {
		$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).prop("disabled", "true");
		$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val(0);
	} else
		$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).removeAttr("disabled");

	if (!chargeRate.editable)
		$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).prop("readonly", "true");
	else
		$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).removeAttr("readonly");

	if ($('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val() < chargeRate.chargeMinAmount) {
		if (chargeRate.chargeMinAmount != 0) {
			if (chargeRate.ispercent) {
				if (($('#deliveryCharge' + chargeRate.chargeApplicableOn + "_" + wayBillId).val()) > 0)
					$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val(Math.round(calculateChargeMinAmount(chargeRate.chargeMinAmount, chargeRate.chargeApplicableOn, wayBillId)));
				else
					$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val(0);
			} else
				$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val(Math.round(chargeRate.chargeMinAmount));
		} else
			$('#deliveryCharge' + chargeMasterId + "_" + wayBillId).val(Math.round(chargeRate.chargeMinAmount));
	}
	
	$('#actualInput' + chargeMasterId + "_" + wayBillId).val(Math.round(chargeRate.chargeMinAmount));
}
function setDeliveryChargesTotal() {
	
	if(configuration.showSummaryTable) {

		let tableEl 				= document.getElementById(tableId);
		let charges					= jsondata.deliverChgs;
		let totalLrs				= 0;
		let bookingTotal			= 0;
		let deliveryChargesTotal	= 0;
		let grandTotal				= 0;

		for (let i = 0, row; row = tableEl.rows[i]; i++) {

			let wayBillId 		= 0;
			let wayBillTypeId	= 0;

			if(document.getElementById('LRRow_' + row.id)) {
				wayBillId 		= document.getElementById('LRRow_' + row.id).value;
				wayBillTypeId	= $('#waybillTypeId_' + wayBillId).val();
			}

			if(wayBillId > 0) {
				totalLrs++;
				for (const element of charges) {

					let chargeMasterId	= element.chargeTypeMasterId;

					if ($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val() != "") {
						deliveryChargesTotal += parseFloat($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val());
					}
				}

				if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					bookingTotal	+= Number($('#Amount_' + wayBillId).html());
				}

				grandTotal 		+= Number($('#billAmount_' + wayBillId).val());
			}
		}

		$('#totalLrs').html(totalLrs);
		$('#bookingTotal').html(bookingTotal);
		$('#deliveryChargesTotal').html(deliveryChargesTotal);
		$('#grandTotal').html(grandTotal);
		
	}
}
