function saveSettlementData() {
	makeSettlement(generateJSONDataForSettlement());
}

function generateJSONDataForSettlement() {
	let jsonObj	= new Object();
	
	jsonObj.deliveryRunSheetLedgerId	= getValueFromInputField('deliveryRunSheetLedgerId');
	jsonObj.vehicleNumberMasterId		= getValueFromInputField('vehicleNumberMasterId');
	jsonObj.vehicleNo					= getValueFromInputField('vehicleNumber');
	jsonObj.deliveryPaymentType0		= deliveryPaymentType_0;

	jsonObj.wbWiseObj					= getSelectedWayBills();
	let rowCount 		= $('#storedPaymentDetails tr').length;

	if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
		let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');

		jsonObj.paymentValues	= paymentCheckBoxArr.join(',');
	}
	
	if($('#endKilometerEle').exists() && $('#endKilometerEle').is(":visible"))
		jsonObj.endKilometer	= $('#endKilometerEle').val();
		
	if($("#tokenWiseCheckingForDuplicateTransaction").val()){
		jsonObj.token = $("#token").val();
	}
	
	return jsonObj; 
}

function getSelectedWayBills() {
	
	var uniqueId 				= -1;
	var wbWiseObj				= new Object;
	
	$('input[name="wayBills"]:checked').each(function() {
		uniqueId	= this.value;
		
		var wbDetailsObj	= new Object();
		
		wbDetailsObj.waybillId					= uniqueId; 
			
		var wayBillNumber				= $('#wayBillNumber_' + uniqueId).val();
		var deliveryPaymentType			= Number($('#paymentType_' + uniqueId).val());
		
		if(deliveryPaymentType == 0) {
			showMessage('info', 'Please, Select Payment Type for LR Number ' + wayBillNumber + ' !');
			return;	
		}

		wbDetailsObj.deliveryPaymentType		= $('#paymentType_' + uniqueId).val();
		wbDetailsObj.crNumber					= $('#crNumber_' + uniqueId).val();
		wbDetailsObj.deliveredToName			= $('#deliveredToName_' + uniqueId).val();
		wbDetailsObj.deliveredToPhoneNo			= $('#deliveredToPhoneNo_' + uniqueId).val();
		wbDetailsObj.deliveryContactDetailsId	= $('#deliveryContactDetailsId_' + uniqueId).val();
		wbDetailsObj.chequeDate					= $('#chequeDate_' + uniqueId).val();
		wbDetailsObj.chequeNo					= $('#chequeNo_' + uniqueId).val();
		wbDetailsObj.chequeAmount				= $('#chequeAmount_' + uniqueId).val();
		wbDetailsObj.bankName					= $('#bankName_' + uniqueId).val();
		wbDetailsObj.selectedDeliveryCreditorId	= $('#selectedDeliveryCreditorId_' + uniqueId).val();
		wbDetailsObj.discount					= $('#discount_' + uniqueId).val();
		wbDetailsObj.discountTypes				= $('#discountTypes_' + uniqueId).val();
		wbDetailsObj.remark						= $('#remark_' + uniqueId).val();
		wbDetailsObj.paidLoading				= $('#paidLoading_' + uniqueId).val();
		wbDetailsObj.consignorId				= $('#consignorId_' + uniqueId).val();
		wbDetailsObj.wayBillNumber				= wayBillNumber;
		wbDetailsObj.wayBillType				= $('#wayBillType_' + uniqueId).val();
		wbDetailsObj.commissionAmt				= $('#commissionAmt_' + uniqueId).val();
		wbDetailsObj.isStbsCreationAllow		= $('#stbsCheckBoxId_' + uniqueId).is(':checked');
		wbDetailsObj.searchCollectionPerson		= $('#searchCollectionPerson_' + uniqueId).val();
		wbDetailsObj.selectedCollectionPersonId	= $('#selectedCollectionPersonId_' + uniqueId).val();
		wbDetailsObj.recoveryBranchId			= $('#recoveryBranchId_' + uniqueId).val();
		
		if(ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
			wbDetailsObj.manualCRNo				= $('#manualCrNumber_' + uniqueId).val();

		if(ddmSettlementConfig.allowBackDateForSettlement)
			wbDetailsObj.createDate			= $('#DateEle' + uniqueId).val();
		else
			wbDetailsObj.createDate			= "";
		if(ddmSettlementConfig.allowBackTimeForSettlement) 
			wbDetailsObj.createTime			=$('#TimeEle'+uniqueId).val();
		else
			wbDetailsObj.createTime			= "";
		if(ddmSettlementConfig.showReceiverToName)
			wbDetailsObj.receiverName		= $('#receiverName_' + uniqueId).val();
		else
			wbDetailsObj.receiverName		= "";
		
		if(ddmSettlementConfig.isServiceTaxPaidByShow) {
			wbDetailsObj.stPaidBy			= $('#STPaidBy_' + uniqueId).val();
			wbDetailsObj.Taxes				= getTaxDetails(uniqueId);
			wbDetailsObj.taxBy				= $('#taxBy_' + uniqueId).val();
		}
		
		if(isTDSAllow) {
			wbDetailsObj.tdsAmount			= $('#tdsAmount_' + uniqueId).val();
			wbDetailsObj.tdsOnAmount		= $('#tdsOnAmount_' + uniqueId).val();
			wbDetailsObj.panNumber			= $('#panNumber_' + uniqueId).val();
		}
		
		if(podConfiguration.AllowPodReceiveOption) {
			var podStatus			= $('#podStatusColumn_' + uniqueId).val();
			wbDetailsObj.podStatus	= podStatus;
			
			/* setDefaultPODStatusNo refers that pod proof is not RECEIVED yet if TRUE*/
			if(podConfiguration.setDefaultPODStatusNo)
				wbDetailsObj.podStatus	= 1;
			
			if(podStatus == '2' && $('#podDocType_' + uniqueId).val() != null && $('#podDocType_' + uniqueId).val() != undefined) {
				wbDetailsObj.podDocType	= $('#podDocType_' + uniqueId).val().join(',');
			}
		}
		
		wbDetailsObj.wbCharges					= getWBChargesData(uniqueId);
		
		wbWiseObj[uniqueId]						= wbDetailsObj;
		
	});
	
	return wbWiseObj;
}

function getTaxDetails(wayBillId) {
	let taxesArr		= new Array();
	
	if(taxes != null) {  //taxes coming from GenericDDMSettlement.js
		for(let i = 0; i < taxes.length; i++) {
			let taxData			= new Object();

			taxData.taxMasterId					= taxes[i].taxMasterId;
			taxData.taxValue					= $('#tax_' + taxes[i].taxMasterId + '_' + wayBillId).val();
			taxData.unAddedST					= $('#unAddedST_' + taxes[i].taxMasterId + '_' + wayBillId).val();
			taxData.actualTax					= $('#actualTax_' + taxes[i].taxMasterId + '_' + wayBillId).val();
			taxData.calculateSTOnAmount			= $('#calculateSTOnAmount_' + taxes[i].taxMasterId + '_' + wayBillId).val();
			taxesArr.push(taxData);					
		}
	}
	
	return taxesArr;
}

function getWBChargesData(uniqueId) {
	let wbCharges		= new Object;
	
	for(var deliveryChargeId in activeDeliveryChargesGlobal) {
		if(activeDeliveryChargesGlobal.hasOwnProperty(deliveryChargeId)) {
			let chargeId 	= 'delCharge_' + deliveryChargeId + '_' + uniqueId;
			
			wbCharges[chargeId] 	= getValueFromInputField(chargeId);
		}
	}
	
	return wbCharges;
}

function makeSettlement(jsonData) {
	let jsonStr 	= JSON.stringify(jsonData);
	
	$.post("GenerateDDMSettlementAction.do?pageId=305&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					hideLayer();
					showReceiveButton();
				} else {
					var deliveryRunSheetLedgerId 	= null;
					
					if(data.deliveryRunSheetLedgerId) {
						switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
						switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
						
						deliveryRunSheetLedgerId = data.deliveryRunSheetLedgerId; 
						
						resetDDMSettlementPage();
						
						if(typeof data.deliveryContactDetailsId !== 'undefined' && data.deliveryContactDetailsId > 0 && typeof data.mrNumber !== 'undefined' && data.mrNumber != null)  {
							window.open('DDMSettlementPrint.do?pageId=305&eventId=4&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId+"&deliveryContactDetailsId="+data.deliveryContactDetailsId+'&moduleIdentifier='+data.moduleId+"&mrNumber="+data.mrNumber);
						} else {
							window.open('DDMSettlementPrint.do?pageId=305&eventId=4&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId);
						}

						searchedDDMNumber 	= 0; //reset DDM Number to search again
					} else {
						showMessage('error', 'Try Again !!');
						showReceiveButton();
					}	
					
					hideLayer();
				}
				
				hideLayer();
			});
}