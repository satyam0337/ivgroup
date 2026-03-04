/**
 * 
 */
var checkBoxArray	= new Array();
var formTypeDetailsId = 0;

function getWayBillDetailsByTokenNumber(manulLRNumber) {
	isFreightChargeEnable = false;
	var jsonObject					= new Object();
	
	selectedTokenLRType	= 0;
	
	if(manulLRNumber == '0')
		return;
	
	isTokenWayBill					= false;
	
	jsonObject.wayBillNumber		= manulLRNumber;
	
	if(Number($('#sourceBranchId').val() > 0) && Number($('#sourceBranchId').val()) != executive.branchId)
		jsonObject.sourceBranchId		= Number($('#sourceBranchId').val());
	else 
		jsonObject.sourceBranchId		= executive.branchId;
		
	jsonObject.destinationBranchId	= Number($('#destinationBranchId').val());
	jsonObject.wayBillTypeId		= Number($('#wayBillType').val());
	
	getBillSelection(jsonObject);
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getWayBillDetailsByTokenNumber.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				if(data.waybillId > 0) {
					var errorMessage		= data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					setTimeout(function(){ $('#lrNumberManual').focus(); }, 10);
					hideLayer();
					return;
				} else {
					hideLayer();
					var jsonObject		= new Object();
	
					jsonObject.filter			= 3;
					jsonObject.lrNumberManual	= manulLRNumber;
	
					var jsonStr = JSON.stringify(jsonObject);
	
					$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
							{json:jsonStr}, function(data) {
								if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
									showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
									setTimeout(function(){ $('#lrNumberManual').focus(); }, 10);
								}
							});
					return;
				}
			}
			
			hideLayer();
			resetArticleWithTableAfterSave();
			var tempArr         = new Array();
			isTokenWayBill		= true;
			
			if(isTokenThroughLRBooking && isTokenWayBill && data.setDestnBranchUsingToken!= undefined && data.setDestnBranchUsingToken)
				setDestinationBranchDetails(data.branchModel, data.branchIds);	
			
			if(data.combinationWayBillRates)
				combinationWayBillRates	= data.combinationWayBillRates;
					
			if(data.chargesConfigRates1) {
				chargesConfigRates1				= data.chargesConfigRates1;
				destinationWiseLRLevelCharges	= data.destinationWiseLRLevelCharges;
			}
			
			if(data.wayBillRates) {
				wayBillRates					= data.wayBillRates;
				consignorPartyWayBillRates		= data.consignorPartyWayBillRates;
				consigneeWayBillRates			= data.consigneeWayBillRates;
				billingPartyWayBillRates		= data.billingPartyWayBillRates;
				isBranchRate					= data.isBranchRate;
			}
				
			if(data.chargesConfigRates) {
				chargesConfigRates				= data.chargesConfigRates;
				destinationWiseLRLevelCharges	= data.destinationWiseLRLevelCharges;
				consignorPartyChargeConfigRates	= data.consignorPartyChargeConfigRates;
				consigneeChargeConfigRates		= data.consigneeChargeConfigRates;
				isBranchChargeConfigRate		= data.isBranchChargeConfigRate;
			}
				
			consignmentDetails	= data.CONSIGNMENTDETAILS;
			
			if(data.formNumberObj != undefined && data.formNumberObj.formTypesList != undefined && data.formNumberObj.formTypesList.length > 0){
				formTypeDetailsId =  data.formNumberObj.formTypesList[0]["formTypesDetailId"];
				
				for(var i = 0; i <data.formNumberObj.formTypesList.length; i++) {
					var formTypeNumbers = data.formNumberObj.formTypesList[i]["formNumber"];
					
					if(formTypeNumbers != undefined && formTypeNumbers.length > 0) {
						var formTypeNumbersArr = formTypeNumbers.split(",");
						
						if(formTypeNumbersArr!=undefined && formTypeNumbersArr.length > 0) {
							for(var j = 0; j < formTypeNumbersArr.length; j++) {
								tempArr.push(formTypeNumbersArr[j]);
							}
						}
					}
				}
				
				if(tempArr != undefined && tempArr.length > 0) {
					var uniqueNewEwaybill = [...new Set(tempArr)];
					checkBoxArray = uniqueNewEwaybill;
				}
			}
			
			if(data != undefined && data.wayBillDate != undefined)
				$('#lrDateManual').val(data.wayBillDate);
			
			setWaybillTypeData(data);	
			setConsignor(data.ConsignorDetails);
			setConsignee(data.ConsigneeDetails);
			setBillingParty1(data.BillingPartyDetails);
			setConsignmentSummary(data.consignmentSummary);
			setConsignmentDetails(consignmentDetails);
			
			getRate();
		}
	});
}

function setConsignor(consignorDetails) {
	$('#cnorCustomerDetailsId').val(consignorDetails.customerDetailsId);
	$('#consignorName').val(consignorDetails.consignorName);
	$('#consignorPhn').val(consignorDetails.customerDetailsMobileNumber);
	$('#consignorGstn').val(consignorDetails.gstn);
	$('#consignoCorprGstn').val(consignorDetails.gstn);
	$('#consignorAddress').val(consignorDetails.customerDetailsAddress);
	$('#consignorCorpId').val(consignorDetails.corporateAccountId);
	$('#partyMasterId').val(consignorDetails.corporateAccountId);
	$('#partyOrCreditorId').val(consignorDetails.customerDetailsBillingPartyId);
}

function setConsignee(consigneeDetails) {
	$('#cgneeCustomerDetailsId').val(consigneeDetails.customerDetailsId);
	$('#consigneeName').val(consigneeDetails.consigneeName);
	$('#consigneePhn').val(consigneeDetails.customerDetailsMobileNumber);
	$('#consigneeGstn').val(consigneeDetails.gstn);
	$('#consigneeCorpGstn').val(consigneeDetails.gstn);
	$('#consigneeAddress').val(consigneeDetails.customerDetailsAddress);
	$('#consigneeCorpId').val(consigneeDetails.corporateAccountId);
	$('#consigneePartyMasterId').val(consigneeDetails.corporateAccountId);
}

function setBillingParty1(billingPartyDetails) {
	if(billingPartyDetails != null) {
		$('#billingPartyId').val(billingPartyDetails.corporateAccountId);
		$('#billingPartyName').val(billingPartyDetails.customerDetailsName);
		$('#billingPartyCreditorId').val(billingPartyDetails.corporateAccountId);
		
		if($('#consignorGstn').val() == '') {
			$('#consignorGstn').val(billingPartyDetails.gstn);
		}
	}
}

function setConsignmentSummary(consignmentSummary) {
	$('#actualWeight').val(consignmentSummary.consignmentSummaryActualWeight);
	$('#chargedWeight').val(consignmentSummary.consignmentSummaryChargeWeight);
	$('#chargeType').val(consignmentSummary.consignmentSummaryChargeTypeId);
	$('#privateMark').val(consignmentSummary.consignmentSummaryPrivateMark);
	$('#invoiceNo').val(consignmentSummary.consignmentSummaryInvoiceNo);
	$('#vehicleNumber').val(consignmentSummary.vehicleNumber);
	
}

function setConsignmentDetails(consignmentDetails) {
	noOfClmn	= 6;
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true ) {
		noOfClmn 	= noOfClmn + 3;
	} else if(configuration.VolumetricWiseAddArticle == 'true') {
		noOfClmn	= noOfClmn + 5;
	}
	
	checkaddConsignmentTableStructure();
	
	for(var i = 1; i <= consignmentDetails.length; i++) {
		if(noOfClmn <= 6) {
			if(i % 2 == 0) {
				addConsignmentRow(consignmentDetails[i - 1]);
			} else {
				addConsignmentRow(consignmentDetails[i - 1]);
			}
		} else {
			addConsignmentRow(consignmentDetails[i - 1]);
		}
	}
}

function getRate() {
	if(isTokenWayBill) {
		filterArticleChargeTypeWiseRate();
		filterWeightChargeTypeWiseRate();
	}
	
	var famt = $('#charge' + BookingChargeConstant.FREIGHT).val();
	
	if(isFreightChargeEnable && Number($('#chargeType').val()) != 0 && Number($('#chargeType').val()) != CHARGETYPE_ID_QUANTITY)
		$('#charge' + BookingChargeConstant.FREIGHT).removeAttr("readonly", "true");

	if(isTokenThroughLRBooking && !isFreightChargeEnable  && $('#consignorName').val() != '' && $('#consigneeName').val() != '' && famt > 0) {
	   $('#actualWeight').focus();
	   $('#addArticlePanel').hide();
	}
	
	if(isTokenThroughLRBooking && isTokenWayBill  && $('#consignorName').val() != '' && $('#consigneeName').val() != '' && famt < 0){
		if($('#chargeType').val() ==   null || Number($('#chargeType').val()) == 0){
			$("#chargeType").focus();
		}
	}
}

function filterArticleChargeTypeWiseRate() {
	idNum	= 0;
	$('#searchRate').val('');
	quantityTypeArr	= new Array();
	var chargeTypeId	= 0;
	
	packingTypeWiseAmount	= [];
	isFreightChargeEnable	= false;
	
	for(var i = 1; i <= consignmentDetails.length; i++) {
		var consignmentDetails1	= consignmentDetails[i - 1];
		
		var qtyAmt 	= calculatePackingTypeRates(consignmentDetails1.quantity, consignmentDetails1.packingTypeMasterId, consignmentDetails1.consignmentGoodsId);
		
		if(qtyAmt > 0) {
			chargeTypeId	= CHARGETYPE_ID_QUANTITY;
			$('#chargeType').val(CHARGETYPE_ID_QUANTITY);
			enableDisableInputField('weigthFreightRate', 'true');
			enableDisableInputField('qtyAmount', 'false');
		}
		
		$('#qtyAmount' + i).html(qtyAmt);
		$('#qtyAmountTotal' + i).html(consignmentDetails1.quantity * qtyAmt);
		
		if(qtyAmt != undefined){
			packingTypeWiseAmount.push(consignmentDetails1.packingTypeMasterId + "_" + qtyAmt);
		}
		
		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY && configuration.applyRatesOnlyOnceOnLRForArticleType == 'true') {
			checkRateForPackingType(qtyAmt, 1);
		} else {
			checkRateForPackingType(qtyAmt, consignmentDetails1.quantity);
		}
		
		idNum++;
		addinqtyArr(idNum);
	}
	
	if(chargeTypeId == 0)
		isFreightChargeEnable = true;
}

function filterWeightChargeTypeWiseRate() {
	var consignmentDetails1	= consignmentDetails[0];
	
	calculateWeightTypeRates($('#chargedWeight').val(), consignmentDetails1.packingTypeMasterId, consignmentDetails1.consignmentGoodsId);
}

function setWaybillTypeData(dataOBJ) {
	var waybillTypeConstantData = dataOBJ.wayBillTypeConstant;
	var selectedLRTYPE      	= dataOBJ.selectedLRType;
	selectedTokenLRType      	= dataOBJ.selectedLRType;
	
	var currentWayBillTypeId	= $('#wayBillType').val();
	
	if(Number(currentWayBillTypeId) == selectedLRTYPE)
		return;
	
	if(selectedLRTYPE == waybillTypeConstantData.WAYBILL_TYPE_TO_PAY) {
		createForm('F8');
	} else if(selectedLRTYPE == waybillTypeConstantData.WAYBILL_TYPE_PAID) {
		createForm('F7');
	} else if(selectedLRTYPE == waybillTypeConstantData.WAYBILL_TYPE_CREDIT) {
    	createForm('F9');
	} else {
		createForm('F10');
	}
}

function setDestinationBranchDetails(branchModel, branchIds) {
	if(branchModel != undefined){
		$('#destination').val(branchModel.branchName);
		$('#singleEwaybillNo').focus();
		getDestination(branchIds, branchModel.branchName); // function defined in commonFunctionForCreateWayBill.js
	}
}