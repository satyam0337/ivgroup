/**
 * 
 */

var GeneralConfiguration = null;
var ModuleIdentifierConstant	= null;
var PaymentTypeConstant	= null;
var incomeExpenseModuleId	= 0;
var moduleId	= 0;
var discountInPercent	= 0;
var godownArr	= null;
var receiveConfigProperty	= null;
var permissionBasedTruckDeliveryReceiveAllowed	= false;
var InfoForDeliveryConstant	= null;
var shortCreditConfigLimitAllowed	= false;
var allowShortCreditPaymentForSavedParties	= false;
var CREDIT_TYPE_LR_LEVEL	= 1;
var CREDIT_TYPE_BRANCH_LEVEL	= 2;
var WAYBILL_TYPE_TO_PAY	= 2;
var totAmt	  = 0.00;
var totalAmnt = parseInt(0);

function setDDMSettlementSummaryModel(ddmSettlementSummaryModel) {
	$('#totalRecoveryAmount').val(Math.round(ddmSettlementSummaryModel.totalRecoveryAmount));
	$('#netrecieved').val(Math.round(ddmSettlementSummaryModel.totalReceivedAmount));
	$('#totalShortAmount').val(Math.round(ddmSettlementSummaryModel.totalDiscountedAmount));
	$('#shortCreditAmnt').val(Math.round(ddmSettlementSummaryModel.totalShortCreditAmount));
	$('#billCreditAmnt').val(Math.round(ddmSettlementSummaryModel.totalBillCreditAmount));
	$('#netBalance').val(Math.round(ddmSettlementSummaryModel.totalBalanceAmount));
	$('#totalLRs').val(ddmSettlementSummaryModel.totalLRs);
	$('#cashLrs').val(ddmSettlementSummaryModel.totalCashLRs);
	$('#chequeLrs').val(ddmSettlementSummaryModel.totalChequeLRs);
	$('#shrtCrdtLrs').val(ddmSettlementSummaryModel.totalShortCreditLRs);
	$('#srtBillCrdtLrs').val(ddmSettlementSummaryModel.totalBillCreditLRs);
	$('#ttlBalLrs').val(ddmSettlementSummaryModel.totalBalanceLRs);
	$('#cashAmnt').val(Math.round(ddmSettlementSummaryModel.totalCashAmount));
	$('#chequeAmnt').val(Math.round(ddmSettlementSummaryModel.totalChequeAmount));
}

function changeView(id, view){
	if(document.getElementById(id) != null)
		document.getElementById(id).style.display = view;
}

function changeDeliveryDetails(elObj){
	var wbId = elObj.id.split("_")[1];
	
	var paymentTypeId = Number(elObj.value);
	
	if(bankPaymentOperationRequired == 'true' | bankPaymentOperationRequired == true) {
		if(deliveryPaymentType_0 <= 0) {
			$('#uniqueWayBillId').val($('#wayBills_' + wbId).val());
			$('#uniqueWayBillNumber').val($('#wayBillNumber_' + wbId).val());
			$('#uniquePaymentType').val($('#deliveryPaymentType_' + wbId).val());
			$('#uniquePaymentTypeName').val($("#deliveryPaymentType_" + wbId + " option:selected").text());
		} else {
			$('#uniqueWayBillId').val(0);
			$('#uniqueWayBillNumber').val('');
			$('#uniquePaymentType').val(0);
			$('#uniquePaymentTypeName').val('');
		}

		if(deliveryPaymentType_0 > 0 && wbId > 0) {
			paymentTypeId	= deliveryPaymentType_0;
			$('#deliveryPaymentType_' + wbId).val(deliveryPaymentType_0);
		} else
			hideShowBankPaymentTypeOptions(elObj);
	}
	
	switch (Number(paymentTypeId)) {
	case PaymentTypeConstant.PAYMENT_TYPE_CASH_ID: 
		cashSelected(wbId);
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID: 
		chequeSelected(wbId);
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID:
		shortCreditSelected(wbId);
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID:
		billCreditSelected(wbId);
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID:
		receivedAtGodownSelected(wbId);
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID://rtgs
	case PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID://neft
	case PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID://credit card
	case PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID://debit card
	case PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_UPI_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID:
	case PaymentTypeConstant.PAYMENT_TYPE_AMAZON_PAY_ID:
		otherPaymentSelected(wbId);
		break;
	case 0:
		changeView("chequeDetails_"+wbId,"none");
		changeView("godownSelect_"+wbId,"none");
		changeView("deleveryCreditorDetails_"+wbId,"none");
		changeView("deliveryContact_"+wbId,"none");
		changeView("discount_"+wbId,"none");
		changeView("discountTypes_"+wbId,"none");
		changeView("podStatus_"+wbId,"none");
		changeChargesView(wbId, "none");
		break;
	};
}

function cashSelected(wbId) {
	changeView("godownSelect_"+wbId,"none");
	changeView("chequeDetails_"+wbId,"none");
	changeView("deleveryCreditorDetails_"+wbId,"none");
	changeView("discountTypes_"+wbId,"inline");
	changeView("discount_"+wbId,"inline");
	changeView("deliveryContact_"+wbId,"inline");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "inline");
}

function chequeSelected(wbId) {
	if(bankPaymentOperationRequired == 'false' || bankPaymentOperationRequired == false) {
		changeView("chequeDetails_"+wbId,"block");
	}
	
	changeView("godownSelect_"+wbId,"none");
	changeView("deleveryCreditorDetails_"+wbId,"none");
	changeView("deliveryContact_"+wbId,"inline");
	changeView("discount_"+wbId,"inline");
	changeView("discountTypes_"+wbId,"inline");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "inline");
}

function shortCreditSelected(wbId) {
	changeView("chequeDetails_"+wbId,"none");
	changeView("godownSelect_"+wbId,"none");
	changeView("deleveryCreditorDetails_"+wbId,"none");
	changeView("deliveryContact_"+wbId,"inline");
	changeView("discount_"+wbId,"inline");
	changeView("discountTypes_"+wbId,"inline");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "inline");
}

function billCreditSelected(wbId) {
	changeView("chequeDetails_"+wbId,"none");
	changeView("godownSelect_"+wbId,"none");
	changeView("deleveryCreditorDetails_"+wbId,"inline");
	changeView("deliveryContact_"+wbId,"none");
	changeView("discount_"+wbId,"inline");
	changeView("discountTypes_"+wbId,"inline");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "inline");
}

function receivedAtGodownSelected(wbId) {
	changeView("chequeDetails_"+wbId,"none");
	changeView("godownSelect_"+wbId,"inline");
	changeView("deleveryCreditorDetails_"+wbId,"none");
	changeView("deliveryContact_"+wbId,"none");
	changeView("discount_"+wbId,"none");
	changeView("discountTypes_"+wbId,"none");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "none");
}

function otherPaymentSelected(wbId) {
	changeView("godownSelect_"+wbId,"none");
	changeView("deleveryCreditorDetails_"+wbId,"none");
	changeView("deliveryContact_"+wbId,"inline");
	changeView("discount_"+wbId,"inline");
	changeView("discountTypes_"+wbId,"inline");
	changeView("podStatus_"+wbId,"inline");
	changeChargesView(wbId, "inline");
}

function changeChargesView(wbId, view) {
	 for(var i = 0; i < deliveryCharges.length; i++) {
		var id = 'deliveryCharge_' + deliveryCharges[i].chargeTypeMasterId + '_' + wbId;
		document.getElementById(id).style.display = view;		
	 }
}

function setActualUnloadWeight(obj) {

	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var entWgt			= parseInt(obj.value);
	var actWgt			= parseInt(document.getElementById("LRDispatchedWeight_"+splitVal[1]).value);

	if(entWgt > actWgt) {
		document.getElementById(obj.id).value = actWgt;
		alert('You can not enter weight more than '+actWgt+'');
	}
}

function setActualUnloadWeightAfterShortDamage(obj ,shortLugg ,damageLugg) {

	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var shortLuggObj	= document.getElementById(shortLugg+"_"+splitVal[1]).value;
	var damageLuggObj	= document.getElementById(damageLugg+"_"+splitVal[1]).value;
	var LRDispatchedWeight	= parseInt(document.getElementById("LRDispatchedWeight_"+splitVal[1]).value);
	var enterWeight		= parseInt(document.getElementById("actualUnloadWeight_"+splitVal[1]).value);

	if((shortLuggObj > 0 || damageLuggObj > 0)
			&& LRDispatchedWeight == enterWeight) {
		document.getElementById("actualUnloadWeight_"+splitVal[1]).value = '0';
	}
}

function setDefaultActualWeight(obj) {

	var objName			= obj.name;
	var splitVal 		= objName.split("_");
	var shortLuggObj	= document.getElementById("shortLuggage_"+splitVal[1]).value;
	var damageLuggObj	= document.getElementById("damageLuggage_"+splitVal[1]).value;

	if(shortLuggObj == 0 && damageLuggObj == 0) {
		document.getElementById("actualUnloadWeight_"+splitVal[1]).value = parseInt(document.getElementById("LRDispatchedWeight_"+splitVal[1]).value);
	}
}

function validateActualWeight(obj) {

	var splitVal 		= obj.id.split("_");

	if (document.getElementById(obj.id).value < document.getElementById('actualUnloadWeight_'+splitVal[1]).value){
		showMessage('error',"Please enter Actual Weight");
		toogleElement('error','block');
		changeError1('actualUnloadWeight_'+splitVal[1],'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError('actualUnloadWeight_'+splitVal[1]);
	}
}

function validateElement(id){
	var el = document.getElementById(id);
	var chkValue = 0;
	var msg = '';
	if(el.type == 'text'){
		var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
		if(el.value == 0 || (el.value.toUpperCase() == el.title.toUpperCase())){
			chkValue = 0;
		}else{
			var str = el.value.replace(reg, '');
			chkValue = str.length;
		}
		msg = 'Please Enter '+el.title+' !';
	} else if(el.type == 'select-one'){
		chkValue = el.value;
		msg = 'Please Select '+el.title+' !';
	}
	if (chkValue <= 0){
		showMessage('error', msg);
		changeError1(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
	}
	return true;
}

function validateHiddenValue(hiddenEleId, targetId, msg){
	var el = document.getElementById(hiddenEleId);
	if(el.value.length > 0 && el.value <= 0 ){
		showMessage('error', msg);
		toogleElement('error','block');
		changeError1(targetId,'0','0');
		document.getElementById(targetId).value = '';
		return false;
	}else{
		toogleElement('error','none');
		removeError(targetId);
	}
	return true;
}
function calcDiscountLimit(wayBillId) {
	if(Number($('#deliveryAmount_'+ wayBillId).val()) < Number($('#discount_' + wayBillId).val())) {
		showMessage('error','Discount cannot be more than Delivery Charges');
		changeTextFieldColor('discount_'+wayBillId, '', '', 'red');
		$('#discount_'+ wayBillId).focus();
		$('#discount_'+ wayBillId).val(0);
		return false;
	}
	
	totAmt = 0.00;
	totAmt = Number($('#deliveryAmount_'+ wayBillId).val()) + Number($('#discount_' + wayBillId).val());
	
	if($('#deliveryPaymentType_'+wayBillId).val() != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID){
		if(!validateDiscountLimit(discountInPercent, totAmt, $('#discount_'+wayBillId).val())) {
			changeTextFieldColor('discount_'+wayBillId, '', '', 'red');
			$('#discount_'+wayBillId).focus();
			return false;
		}
	}
}

function setPartyNameAutoComplete(wayBillId) {
	$("#deliveryCreditor_" + wayBillId).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType=2&billing=4",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			$('#selectedDeliveryCreditorId_' + wayBillId).val(ui.item.id);
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function validateLR(wbId){
	if(bankPaymentOperationRequired == 'true' && $('#deliveryPaymentType_0').val() > 0 && isValidPaymentMode($('#deliveryPaymentType_0').val())) {
		if($('#storedPaymentDetails').is(':empty')) {
			showMessage('info', 'Please, Add Payment details !');
			return false;
		}
	}
	
	if(!validateElement('unloadByExecutiveId')) return false;
	if(!validateElement('deliveryPaymentType_'+wbId)) return false;
	var dlvryPmtTyp = parseInt(document.getElementById('deliveryPaymentType_'+wbId).value);
	var paidLoading = parseInt(document.getElementById('paidLoading_'+wbId).value);
	var lrNo		= (document.getElementById('wayBillNumber_'+wbId).value);
	var dispatchedQuantity =  parseInt(document.getElementById('dispatchedQuantity_'+wbId).value);
	var totalQuantity	   =  parseInt(document.getElementById('totalArt_'+wbId).value);
	var dlvrToNo = null;
	var discountAmount	   = parseInt(document.getElementById('discount_'+wbId).value);
	
	if(dlvryPmtTyp != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
		/* if(dispatchedQuantity != totalQuantity){
			alert("You can not deliver "+lrNo+" because LR quantity in loading sheet mismatch with total quantity ! ");
			return false;
		} */
		
		if(bankPaymentOperationRequired == 'true' && $('#deliveryPaymentType_0').val() <= 0 && isValidPaymentMode(dlvryPmtTyp)) {
			if(!$('#paymentDataTr_' + wbId).exists()) {
				showMessage('info', '<i class="fa fa-info-circle"></i> Please, Add Payment details for this LR <font size="5" color="red">' + lrNo + '</font> !');
				return false;
			}
		}
		
		if(bankPaymentOperationRequired == 'false' && dlvryPmtTyp == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
			if(!validateElement('chequeDate_'+wbId)) return false;
			if(!validateElement('chequeNo_'+wbId)) return false;
			if(!validateElement('chequeAmount_'+wbId)) return false;
			if(!validateElement('bankName_'+wbId)) return false;
			if(!validateElement('deliveredToName_'+wbId)) return false;
		}else if(dlvryPmtTyp == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
			if(paidLoading <= 0) {
				if(!validateElement('deliveryCreditor_' + wbId)) return false;
				if(!validateHiddenValue('selectedDeliveryCreditorId_'+wbId, 'deliveryCreditor_'+wbId,'Invalid Creditor Name please enter again !')) return false;
			} else {
				alert("Please change Paid Loading charge with other charge for LR No. "+lrNo+" from Edit LR Rate because Paid Loading is only applicable for ToPay LR and after Bill Credit LR Type will Change From ToPay to TBB ! ");
				return false;
			}
		}else{
			if(!validateElement('deliveredToName_'+wbId)) return false;
		}
	}else{
		if(godownArr != null) {
			if(!validateElement('godownId_'+wbId)) return false;
		}
	}
	
	dlvrToNo = document.getElementById('deliveredToPhoneNo_'+wbId);
	if(dlvrToNo.value == dlvrToNo.title){
		dlvrToNo.value = '0000000000';
	};
	
	// Validation for Discount Type (start)
	var disc		= document.getElementById("discount_"+wbId).value;
	
	if(disc > 0 ){ 
		if(!validateElement('discountTypes_'+wbId)) return false;
	}
	// Validation for Discount Type (end)
	
	if(dlvryPmtTyp != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID){
		if(!validateDiscountLimit(discountInPercent, totAmt, discountAmount)) {
			changeTextFieldColor('discount_'+wbId, '', '', 'red');
			$('#discount_'+wbId).focus();
			return false;
		}
	}
	
	return true;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);

		return false;
	}

	return true;
}

function defaultReceivePaymentType(optionVal) {
	if(jsonData.defaultReceivePaymentType != undefined) {
		changeReceivePaymentType(jsonData.defaultReceivePaymentType);
		$("#deliveryPaymentType_0").val(jsonData.defaultReceivePaymentType);
	}
}

function changeReceivePaymentType(optionVal) {
	$( "#storedPaymentDetails" ).empty();
	
	if(wayBillReceivableModel != null) {
		for(var k = 0; k < wayBillReceivableModel.length; k++) {
			var wayBillId		= wayBillReceivableModel[k].wayBillId;

			var triggerPaymentModeForAll 		= document.getElementById('deliveryPaymentType_' + wayBillId);

			if(optionVal > 0) {
				$("#deliveryPaymentType_" + wayBillId).attr('readonly', 'readonly');
			} else {
				$("#deliveryPaymentType_" + wayBillId).removeAttr('readonly');
			}

			if(triggerPaymentModeForAll != null) {
				triggerPaymentModeForAll.value	= optionVal;
				$("#deliveryPaymentType_" + wayBillId).change();
			}
		}
	}
	
	hideShowBankPaymentTypeOptions(document.getElementById('deliveryPaymentType_0'));
}

function setTotalDeliveryAmount(wayBillId) {
	var deliveryAmt = 0.0;
	
	 for(var i = 0; i < deliveryCharges.length;i++) {
		var id 	= 'deliveryCharge_' + deliveryCharges[i].chargeTypeMasterId + '_' + wayBillId;
		var obj	= document.getElementById(id);
		
		deliveryAmt = Number(deliveryAmt) + Number(obj.value);
	 }
	
	if($('#wayBillType_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) {
		deliveryAmt = deliveryAmt + Number($('#grandTotal_' + wayBillId).val()) ;
		$("#deliveryAmount_" + wayBillId).val(deliveryAmt - Number($('#discount_' + wayBillId).val()));
	}
	
	$("#deliveryAmount_" + wayBillId).val(deliveryAmt - Number($('#discount_' + wayBillId).val()));

	if(Number($("#deliveryAmount_" + wayBillId).val()) < 0) {
		$("#deliveryAmount_" + wayBillId).val(deliveryAmt);
		return false;
	}
	
	totAmt = deliveryAmt;
}

function loadPodDocumentSelection(obj) {
	var wayBillId = (obj.id).split('_')[1];
	var elementExists = $('#podStatus_' + wayBillId).val();

	if(elementExists) {
		if($('#podStatus_' + wayBillId).val() == 2) {
			$('#podDocumentTypeArr_' + wayBillId).css("visibility", "visible");
		} else {
			$('#podDocumentTypeArr_' + wayBillId).css("visibility", "hidden");
			$('.inputcheck' + wayBillId).prop('checked', false); // Unchecks it
			//document.getElementById("inputcheck").checked = false;
		}
	}
}

function addWayBillExpense(wayBillId, consigneeCorpAccountId) {
	childwin = window.open ("addWayBillExpense.do?pageId=340&eventId=2&modulename=addWayBillExpense&wayBillId=" + wayBillId + '&consigneeCorpAccountId=' + consigneeCorpAccountId + '&isRedirectAllow=false',"newwindow",config="height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function checkWayBIllReceivability (isReceivable) {
	if(configuration.checkReceivability) {
		if(!isReceivable || isReceivable == 'false') {
			showMessage('error',"You can not Receive/Deliver LR Whose handling branch is not your branch. To Receive/Deliver this LR Please change the destination accordingly!");
		}
	}
}

function changeColour() {
	for(var k = 0; k < wayBillReceivableModel.length; k++) {
		var wayBillId		= wayBillReceivableModel[k].wayBillId;
		
		if($('#wayBills_' + wayBillId).is(":checked")) {
			$('#checkBoxtr_' + wayBillId).addClass('active');
		} else {
			$('#checkBoxtr_' + wayBillId).removeClass('active');
		}
	
		if(configuration.checkReceivability) {
			var isReceivable	= wayBillReceivableModel[k].receivable;
			
			if(!isReceivable)
				$('#wayBills_' + wayBillId).prop('checked', false);
			else
				$('#checkBoxtr_' + wayBillId).addClass('active');
		}
	}
}

function changeColour2(wayBillId) {
	if($('#wayBills_' + wayBillId).is(":checked")) {
		$('#checkBoxtr_' + wayBillId).addClass('active');
	} else {
		$('#checkBoxtr_' + wayBillId).addClass('warning');//ffb2b2
	}
}

function calcSlctdAmntTyp() {
	if(ddmSettlementSummaryModel != null) {
		$('#cashLrs').val(0);
		$('#chequeLrs').val(0);
		$('#shrtCrdtLrs').val(0);
		$('#srtBillCrdtLrs').val(0);
		$('#ttlBalLrs').val(0);
		$('#netrecieved').val(0);
		$('#shortCreditAmnt').val(0);
		$('#billCreditAmnt').val(0);
		$('#cashAmnt').val(0);
		$('#chequeAmnt').val(0);
		$('#totalShortAmount').val(0);
		$('#netBalance').val(0);
		
		var cash = 0;
		var cheque = 0;
		var shortCredit = 0;
		var billCredit = 0;
		var recAtGdwn = 0;
		var netRecievedAmnt = 0;
		var shortCreditAmnt = 0;
		var billCreditAmnt = 0;
		var cashAmnt = 0;
		var chequeAmnt = 0;
		var discount = 0;
		var netBalance = 0;	
		var checkNan = 0;
		
		var wayBills = getAllCheckBoxSelectValue('wayBills');
		
		if(wayBillRecModelsHM != null) {
			for(var i = 0; i < wayBills.length; i++) {
				let wayBillId	= wayBills[i];
				
				var wayBillReceivableModel	= wayBillRecModelsHM[wayBillId];
				
				if($('#wayBills_' + wayBillId).is(":checked")) {
					checkNan = isNaN(parseInt($('#discount_' + wayBillId).val()));
					var grandTotal	= wayBillReceivableModel.grandTotal;
					
					if(wayBillReceivableModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						var amntType = $('#deliveryPaymentType_' + wayBillId).val();

						if(amntType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
							cash++;
							netRecievedAmnt += grandTotal;
							cashAmnt 		+= grandTotal;

							if(!checkNan) discount += parseInt(parseInt($('#discount_' + wayBillId).val()));
						} else if((bankPaymentOperationRequired == 'true' && isValidPaymentMode(amntType)) ||
								(bankPaymentOperationRequired == 'false' && amntType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)) {
							cheque++;
							netRecievedAmnt += grandTotal;
							chequeAmnt 		+= grandTotal;

							if(!checkNan) discount += parseInt($('#discount_' + wayBillId).val());
						} else if(amntType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
							shortCredit++;
							shortCreditAmnt += grandTotal;
							
							if(!checkNan) discount += parseInt($('#discount_' + wayBillId).val());
						} else if(amntType == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
							billCredit++;
							billCreditAmnt += grandTotal;

							if(!checkNan) discount += parseInt($('#discount_' + wayBillId).val());
						} else if(amntType == PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
							recAtGdwn++;
						}
					}
				}
			}
		}
		
		$('#cashLrs').val(cash);
		$('#netrecieved').val(netRecievedAmnt);
		$('#cashAmnt').val(cashAmnt);
		$('#chequeLrs').val(cheque);
		$('#chequeAmnt').val(chequeAmnt);
		$('#shrtCrdtLrs').val(shortCredit);
		$('#shortCreditAmnt').val(shortCreditAmnt);
		$('#srtBillCrdtLrs').val(billCredit);
		$('#billCreditAmnt').val(billCreditAmnt);
		$('#ttlBalLrs').val(recAtGdwn);
		$('#totalShortAmount').val(discount);
		
		netBalance = parseInt(Math.round(ddmSettlementSummaryModel.totalRecoveryAmount) - netRecievedAmnt);
		
		$('#netBalance').val(netBalance);
	}
}

function resetOnDelete(e, elObj) {
	var wbId = elObj.id.split("_")[1];
	var keynum;
	
	if(window.event) { // IE
		keynum = e.keyCode;
	} else if(e.which) { // Netscape/Firefox/Opera
		keynum = e.which;
	}
	
	if(keynum == 8  || keynum == 46) {
		$('#selectedDeliveryCreditorId_' + wbId).val(0);
	}
}

function totalChequeAmount(waybillId) {
	var chqAmnt = parseInt($('#chequeAmount_' + waybillId).val());
	
	var wayBill = new Array();
	wayBill[waybillId] = chqAmnt;
	
	totalAmnt += chqAmnt;
	$('#chequeAmount').val(totalAmnt);
}

function validateForShortCreditDelivery(shortCreditLRArray) {
	if(shortCreditLRArray.length > 0) {
		showMessage('info','Short Credit Delivery Of ' + shortCreditLRArray.join() + 'LRs not Allowed as Consignee not added in party master, please add it first for short credit payment. !');
		return false;
	}
	
	return true;
}

function shortCreditLimitOnLRLevel(wayBillId) {
	let lrNumber	= 0;
	
	var wayBillReceivableModel	= wayBillRecModelsHM[wayBillId];
	
	var deliveryAmt = shortCreditLimitOnBranchLevel(wayBillId);

	if( Number(deliveryAmt) > shortCreditConfigLimit.creditLimit)
		lrNumber = wayBillReceivableModel.wayBillNumber;
	
	return lrNumber;
}

function shortCreditLimitOnBranchLevel(wayBillId) {
	var deliveryAmt = 0.0;
	
	var wayBillReceivableModel	= wayBillRecModelsHM[wayBillId];
	
	if(Number($("#deliveryPaymentType_" + wayBillId).val()) == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
		for(var i = 0; i < deliveryCharges.length; i++)
			deliveryAmt = Number(deliveryAmt) + Number($('#deliveryCharge_' + deliveryCharges[i].chargeTypeMasterId + '_' + wayBillId).val());
			
		if($('#wayBillType_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) {
			if(document.getElementById('#discount_' + wayBillId) != null)
				deliveryAmt = deliveryAmt + wayBillReceivableModel.grandTotal - Number($('#discount_' + wayBillId).val()) ;
			else
				deliveryAmt = deliveryAmt + wayBillReceivableModel.grandTotal;
		} else if(document.getElementById('#discount_' + wayBillId) != null)
			deliveryAmt = deliveryAmt - Number($('#discount_' + wayBillId).val());
	}
	
	return Number(deliveryAmt);
}

function validateForShortCreditConfigLimit(shortCreditLimitLRArray, totalShortCreditAmount) {
	if(shortCreditConfigLimit != null) {
		if(shortCreditConfigLimit.creditType == CREDIT_TYPE_LR_LEVEL && shortCreditLimitLRArray.length > 0) {
			showMessage('info','Short Credit Limit Of ' + shortCreditConfigLimit.creditLimit + ' exceeded For LR Nos ' + shortCreditLimitLRArray.join() +' !');
			return false;
		} else if (shortCreditConfigLimit.creditType == CREDIT_TYPE_BRANCH_LEVEL && totalShortCreditAmount > 0 && (totalShortCreditAmount > shortCreditConfigLimit.balance)) {
			showMessage('info','Short Credit Balance Limit Of ' + shortCreditConfigLimit.balance + ' exceeded !');
			return false;
		}
	}
	
	return true;
}