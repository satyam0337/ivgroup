function validateLBH() {
	let lengthEle	= 'length';
	let breadthEle	= 'breadth';
	let heightEle	= 'height';
			
	if(configuration.VolumetricWiseAddArticle == 'true') {
		lengthEle	= 'articleLength';
		breadthEle	= 'articleBredth';
		heightEle	= 'articleHeight';
	}

	if(!validateInput(1, lengthEle, lengthEle, 'packageError',  lengthErrMsg)) {
		setTimeout(function(){ 
			$('#' + lengthEle).focus(); 
			showMessage('error', lengthErrMsg);	
		}, 200);
		return false;
	}

	if(!validateInput(1, breadthEle, breadthEle, 'packageError',  breadthErrMsg)) {
		setTimeout(function(){ 
			$('#' + breadthEle).focus(); 
			showMessage('error', breadthErrMsg);	
		}, 200);
		return false;
	}

	if(!validateInput(1, heightEle, heightEle, 'packageError',  heightErrMsg)) {
		setTimeout(function(){ 
			$('#' + heightEle).focus(); 
			showMessage('error', heightErrMsg);	
		}, 200);
		return false;
	}
	
	if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true'
		&& !validateInputTextFeild(1, 'volumetricFactorId', 'volumetricFactorId', 'error',  volumetricFactorErrMsg)) {
		setTimeout(function(){ 
			$('#volumetricFactorId').focus(); 
		}, 200);
		return false;
	}

	return true;
}
function charsForDate(e){
	var keynum	= null;
	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
	}

	if(keynum == 8 || keynum == 45){
		return true;
	}

	if (keynum < 48 || keynum > 57 ) {
		return false;
	}

	return true;
}

function validateLRDateWithDispatchDate(date) {
	if(dispatchLedger == undefined)
		return true;
		
	let dispatchDate  	= new Date(dispatchLedger.tripDateTimeForString);
	let manualLRDate 	= new Date(dispatchLedger.tripDateTimeForString);
	
	let manualLRDateParts 	= new String(date).split("-");
	manualLRDate.setFullYear(parseInt(manualLRDateParts[2], 10));
	manualLRDate.setMonth(parseInt(manualLRDateParts[1] - 1, 10));
	manualLRDate.setDate(parseInt(manualLRDateParts[0], 10));
	
	let dispatchDateParts 	= new String(dispatchLedger.tripDateTimeForString).split("-");
	dispatchDate.setFullYear(parseInt(dispatchDateParts[2], 10));
	dispatchDate.setMonth(parseInt(dispatchDateParts[1] - 1, 10));
	dispatchDate.setDate(parseInt(dispatchDateParts[0], 10));
	
	//alert(dispatchLedger.tripDateTimeForString)
	
	if(manualLRDate.getTime() > dispatchDate.getTime()) {
		showMessage('error', 'LR Date cannot be more than LS Date !');
		$('#lrDateManual').val(dispatchLedger.tripDateTimeForString);
		changeError1('lrDateManual','0','0');
		isValidationError=true;
		return false;
	}
	
	return true;
}

function chkDate(date) {

	if(isValidDate(date)) {
		var currentDate  			= new Date(serverCurrentDate);
		var previousDate 			= new Date(serverCurrentDate);
		var manualLRDate 			= new Date(serverCurrentDate);
		var pastDaysAllowed 		= maxNoOfDaysAllowBeforeCashStmtEntry;
		var currentWayBillTypeId 	= 0;
		
		var manualLRDateParts 	= new String(date).split("-");
		manualLRDate.setFullYear(parseInt(manualLRDateParts[2],10));
		manualLRDate.setMonth(parseInt(manualLRDateParts[1]-1,10));
		manualLRDate.setDate(parseInt(manualLRDateParts[0],10));

		var diffDays 			= diffBetweenTwoDate(manualLRDate, currentDate);
		
		var wayBillTypeWiseBackDaysAllow 		 	= configuration.wayBillTypeWiseBackDaysAllow;
		var wayBillTypeIdAndBackDaysConfiguration	= configuration.wayBillTypeIdAndBackDaysConfiguration;
		var currentDateAllowedInReverseEntry 		= configuration.currentDateAllowedInReverseEntry;
		var futureDaysAllowed 						= configuration.maxNoOfDaysAllowForFutureDate;

		if(getValueFromInputField('wayBillType') != null)
			currentWayBillTypeId = getValueFromInputField('wayBillType');

		if(wayBillTypeWiseBackDaysAllow == 'true') {
			var wayBillTypeIdAndBackDaysConfigurationArray	= wayBillTypeIdAndBackDaysConfiguration.split(',');
			
			if(wayBillTypeIdAndBackDaysConfigurationArray != null) {
				for(i = 0; i < wayBillTypeIdAndBackDaysConfigurationArray.length; i++) {
					var wayBillTypeId				= wayBillTypeIdAndBackDaysConfigurationArray[i].split('_')[0];
					var backDaysAllow				= wayBillTypeIdAndBackDaysConfigurationArray[i].split('_')[1];

					if(wayBillTypeId == currentWayBillTypeId) {
						pastDaysAllowed = backDaysAllow;
						break;
					} 
				}
			}
		}

		if (pastDaysAllowed < '0') {
			//showMessage('error', 'Please Configure Manual Delivery Days Allowed For Branch !!');
			showMessage('error', configManualBokingErrMsg);
			changeError1('lrDateManual','0','0');
			isValidationError=true;
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);
		
		if(configuration.backDateAllowedInCurrentMonthOnly == 'true') {
			if(manualLRDate.getMonth() != currentDate.getMonth()) {
				$("#lrDateManual").val('');
				showMessage('info', backDateInCurrentMonthOnlyErrMsg);
				changeError1('lrDateManual','0','0');
				isValidationError=true;
				return false;
			}
		}

		if(manualLRDate.getTime() > currentDate.getTime()) {
			if(isReserveBookingChecked) {
				if(Number(-diffDays) > Number(futureDaysAllowed)) {
					showMessage('info', futureDayFromTodayInfoMsg(futureDaysAllowed));
					changeError1('lrDateManual','0','0');
					isValidationError=true;
					return false;
				}
			} else {
				//showMessage('error', 'Future Date not allowed !!');
				showMessage('error', futureDateNotAllowdErrMsg);
				changeError1('lrDateManual','0','0');
				isValidationError=true;
				return false;
			}
		} else {
			if(configuration.AllowPreviousDateForGroupAdminOnly == 'true') {
				if(executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
					if(Number(diffDays) > Number(1)) {
						$("#lrDateManual").val('');
						showMessage('info', dateTillDayFromTodayInfoMsg(1));
						changeError1('lrDateManual','0','0');
						isValidationError=true;
						return false;
					}
				}
			}
			
			if(manualLRDate.getTime() > previousDate.getTime()) {
				if(isReverseEntry){
					if(diffDays < 1 && !(currentDateAllowedInReverseEntry)){
						showMessage('error', lrDateBeforeForReverseEntry);
						changeError1('lrDateManual','0','0');
						return false;
					} else {
						hideAllMessages();
						removeError('lrDateManual');
						return true;
					}
				}  else {
					hideAllMessages();
					removeError('lrDateManual');
					return validateLRDateWithDispatchDate(date);
				}
			} else {
				//showMessage('error', "Please enter date till "+pastDaysAllowed+" days back from today !!");
				showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
				changeError1('lrDateManual','0','0');
				isValidationError=true;
				return false;
			};
		};
	} else {
		//showMessage('error', 'Please, Enter Valid Date !');
		showMessage('error', validDateErrMsg);
		changeError1('lrDateManual','0','0');
		isValidationError=true;
		return false;
	}
	
	return validateLRDateWithDispatchDate(date);
}

function destinationValidation() {
	if (configuration.DestinationValidate != 'true')
		return true;

	if(configuration.ShowCityAndDestinationBranch=='true' && !isManualWayBill){
		if (!validateInput(1, 'destinationIdEle_primary_key', 'destinationIdEle', 'basicError', destinationErrMsg))
			return false;
	} else if (!validateInput(1, 'destination', 'destination', 'basicError', destinationErrMsg))
		return false;

	if (configuration.DestinationAutocomplete == 'true') {
		if(configuration.ShowCityAndDestinationBranch=='true' && !isManualWayBill){
			if(!validateInput(1, 'destinationIdEle_primary_key', 'destinationIdEle', 'basicError', properDestinationErrMsg))
				return false;
		} else if(!validateInput(1, 'destinationBranchId', 'destination', 'basicError', properDestinationErrMsg))
			return false;
	}

	return true;
}

function lrNumberManualValidation() {
	if (configuration.LRNumberManualValidate != 'true')
		return true;
	
	if((jsondata.AUTO_LR_NUMBER_IN_MANUAL || configuration.allowAutoSequenceOnManual == 'true')
		&& Number($('#SequenceTypeSelection').val()) == 1 && configuration.allowManualLrNumberInManualInAuto == 'false') //1 for Auto
		return true;

	if(!validateInput(1, 'lrNumberManual', 'lrNumberManual', 'basicError', lrNumberErrMsg)) {
		if(configuration.setFocusOnManualLrNumber == 'true') {
			setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
		}
		
		return false;
	}

	if(configuration.allowManualLrNumberInManualInAuto == 'true' && !isManual)
		return true;
		
	//2 & 3 Condition is For Check LR number is Whithin the Range or Not on Auto LR Booking
	if (configuration.isManualLrRangeCheck == 'true' || (configuration.isAutoBookingTokenWiseLrRangeCheck == 'true' && !isManual) || (configuration.isSequenceRangeCheckOnAutoLRBooking == 'true' && !isManual)) {
		checkLrWithinRange(); //Calling from lrSequenceCounter.js
	}
	
	checkManualLRLengthValidation();
	return true;
}

function freightUptoBranchValidation() {
	if (configuration.FreightUptoValidate != 'true')
		return true;

	var isReadOnly = document.getElementById('freightUptoBranch').disabled;

	if (isReadOnly != true) { 
		//Freight Upto Validation
		if(!validateInput(1, 'freightUptoBranch', 'freightUptoBranch', 'basicError', frieghtUptoDestinationErrMsg))
			return false;
		
		if (configuration.FreightUptoBranchAutocomplete == 'true'
			&& !validateInput(1, 'freightUptoBranchId', 'freightUptoBranch', 'basicError', properFrieghtUptoDestinationErrMsg))
			return false;
	}
	
	return true;	
}

function gstnValidation() {
	let consignorGstn	= getConsignorGstnEle();
	let consigneeGstn	= getConsigneeGstnEle();
		
	if((configuration.validateGstnOnWithBill === 'true' && $('#' + consignorGstn).val() === '' && $('#' + consigneeGstn).val() === '') ||
		(configuration.validateBothGstnOnWithBill === 'true' && ($('#' + consignorGstn).val() === '' || $('#' + consigneeGstn).val() === '')) ||
		(configuration.validateGSTNForOneParty === 'true' && ($('#' + consignorGstn).val() === '' && $('#' + consigneeGstn).val() === ''))) {
		
		if (configuration.validateBothGstnOnWithBill === 'true') {
			if ($('#' + consignorGstn).val() === '') {
				showMessage('error', enterBothGstnErrorMsg);
				$('#' + consignorGstn).css('border-color', 'red');
				$('#' + consigneeGstn).css('border-color', 'red');
				$('#' + consignorGstn).focus();
				isValidationError = true;
			} else if ($('#' + consigneeGstn).val() === '') {
				showMessage('error', enterBothGstnErrorMsg);
				$('#' + consigneeGstn).css('border-color', 'red');
				$('#' + consigneeGstn).focus();
				isValidationError = true;
			}
		} else if (configuration.validateGstnOnWithBill === 'true' || configuration.validateGSTNForOneParty == 'true') {
			showMessage('error', enterAnyOneGstnErrorMsg);
			$('#' + consignorGstn).css('border-color', 'red');
			$('#' + consigneeGstn).css('border-color', 'red');
			$('#' + consignorGstn).focus();
			isValidationError = true;
		}
	 
		return false;
	}
	
	return true;
}

function checkGstnOnEstimateBill() {
	let consignorGstn	= getConsignorGstnEle();
	let consigneeGstn	= getConsigneeGstnEle();
		
	if($('#' + consignorGstn).val() != '' && $('#' + consigneeGstn).val() != '') {
		showMessage('error', bothPartiesCheckForEstimateBillError);
		$('#consignorName').css('border-color', 'red');
		$('#consigneeName').css('border-color', 'red');
		$('#consignorName').focus();
		$('#consigneeName').focus();
		isValidationError = true;
		return false;
	} else if($('#' + consignorGstn).val() != '') {
		showMessage('error', consignorPartyForEstimateBillError);
		$('#consignorName').css('border-color', 'red');				
		$('#consignorName').focus();				
		isValidationError = true;
		return false;
	} else if($('#' + consigneeGstn).val() != '') {
		showMessage('error', consigneePartyForEstimateBillError);
		$('#consigneeName').css('border-color', 'red');
		$('#consigneeName').focus();
		isValidationError = true;
		return false;
	}

	return true;	
}

function validateForm_403_402Type() {
	if (configuration.Form_403_402Validate != 'true')
		return true;

	var destStateId	 		= $('#destinationStateId').val();
	var form_403_402 		= $('#form_403_402').val();

	if((executive.stateId == STATE_ID_GUJARAT || destStateId == STATE_ID_GUJARAT) && executive.stateId != destStateId) {
		//State is Gujrat
		if(!validateInput(1, 'form_403_402', 'form_403_402', 'form_403_402', form_403_402ErrMsg))
			return false;

		if(form_403_402 == FORM_403_402_NOT_APPLICABLE_ID) {
			changeTextFieldColor('form_403_402', '', '', 'red');
			showMessage('error', form_403_402ErrMsg);
			return false;
		}
	}

	return true;
}

function selectEwaybillByStateValidation() {
	if(configuration.ShowEwaybillExemptedOption == 'true') {
		//for falcon
		if(!validateEwayBillNo())
			return true;
	}
	
	var eWayBillNumber = null;
	var declaredValue	= $('#declaredValue').val();
	
	if(configuration.isShowSingleEwayBillNumberField == 'false')
		eWayBillNumber	= checkBoxArray.join(',');
	else
		eWayBillNumber	= $('#ewayBillNumber').val();

	//for Radha Daily Parcel Service
	if(configuration.isAllowEWayBillExemptedValidation == 'true') {
		var temp = _.filter(cnsgnmentGoodsId, function(num){return num.split("_")[0] != 0});
		var	flag = temp && temp.length > 0;
			
		if(consignmentEWayBillExemptedObj != undefined && !jQuery.isEmptyObject(consignmentEWayBillExemptedObj)) {
			flag 							= Object.keys(consignmentEWayBillExemptedObj).length > 0;
			isConsignmentEWayBillExempted 	= Object.values(consignmentEWayBillExemptedObj)[0];
		}
		
		if(flag && (isConsignmentEWayBillExempted == false || isConsignmentEWayBillExempted == 'false')) { 
			var declaredMinimumAmount	= minimumDeclareValue();
			
			if(Number(declaredValue) >= declaredMinimumAmount && eWayBillNumber == '') {
				showEWaybillNumberFormType();
				setTimeout(function(){ $('#ewayBillNumber').focus(); }, 100);
				showMessage('error', eWayBillNumberErrMsg);
				return false;
			}
		}
	} else if(configuration.selectEwayBillByStateId == 'true' && Number(declaredValue) >= Number(configuration.declaredValueSelectEwayBillByStateId)) {
		if(isSameStateForEWayBill() && eWayBillNumber == "") {
			$('#singleFormTypes').val(E_WAYBILL_ID);
			showEWaybillNumberFormType();
			setTimeout(function(){ $('#ewayBillNumber').focus(); }, 100);
			showMessage('error', ewayBillNumberErrorMsgOnDeclareValue(configuration.declaredValueSelectEwayBillByStateId));
			return false;
		}
	}
	
	return true;
}

function selectFormValidation() {
	if (configuration.FormsWithMultipleSelection != 'true')
		return true;

	if (configuration.Form_403_402Validate != 'true')
		return true;

	let destStateId	 		= $('#destinationStateId').val();

	let form403NAIsChecked	= isCheckBoxChecked('ui-multiselect-0-1010');
	let form403RIsChecked	= isCheckBoxChecked('ui-multiselect-0-1011');
	let form403NRIsChecked	= isCheckBoxChecked('ui-multiselect-0-1012');

	if((executive.stateId == STATE_ID_GUJARAT || destStateId == STATE_ID_GUJARAT) && executive.stateId != destStateId) { //State is Gujrat
		if(form403NAIsChecked && (!form403RIsChecked && !form403NRIsChecked)
		|| form403NAIsChecked && (!form403RIsChecked || !form403NRIsChecked)
		|| !form403NAIsChecked && (!form403RIsChecked && !form403NRIsChecked)
		|| form403NAIsChecked && form403RIsChecked && form403NRIsChecked) {
			showMessage('error', form_403_402ErrMsg);
			return false;
		} else {
			hideAllMessages();
		}
	}
	
	return true;
}

//CTformValidation
function CTFormValidation() {
	if (configuration.FormsWithMultipleSelection != 'true')
		return true;

	if (configuration.CTFormValidate != 'true')
		return true;

	let destStateId	 		= $('#destinationStateId').val();
	let ctFormNAIsChecked	= isCheckBoxChecked('ui-multiselect-0-1013');
	let ctFormRIsChecked	= isCheckBoxChecked('ui-multiselect-0-1014');
	let ctFormNRIsChecked	= isCheckBoxChecked('ui-multiselect-0-1015');

	if((executive.stateId == STATE_ID_GUJARAT || destStateId == STATE_ID_GUJARAT) && (executive.stateId != destStateId)
			|| (configuration.CTFormValidateForAllState == "true")
	) { //State is Gujrat

		if(!ctFormNAIsChecked || !ctFormRIsChecked || !ctFormNRIsChecked) {
			showMessage('error', ctFormTypeErrMsg);
			return false;
		} else {
			hideAllMessages();
		}
	}

	return true ;
}

function invoiceNoValidation() {
	let billType = 0;

	if($('#billSelection').val() != undefined)
		billType = $('#billSelection').val();

	if($('#billSelection').val() == undefined)
		billType = Number(configuration.defaultBillSelectionId);
	
	if(isPackingTypeExistForSkipInvoiceNoValidation())
    	return true;

	if (configuration.InvoiceNoValidate == 'true') {
		if(configuration.validateInvoiceNumberDeclaredValueByLRType == 'true') {
			let wayBillTypeIds		= (configuration.wayBillTypeForInvoiceNoValidation).split(",");
			let wayBillTypeExist 	= isValueExistInArray(wayBillTypeIds, getWayBillTypeId());
			
			if(wayBillTypeExist && !validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg))
				return false;
		} else if(!validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg))
			return false;
	} else if(billType == BOOKING_WITH_BILL && configuration.invoiceNoValidateOnWithBill == 'true' && !validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg))
		return false;

	return true;
}

function checkForNewSaidToContain(objId) {
	if(configuration.SaidToContainAutoSave == 'true') {
		var obj = document.getElementById('saidToContain');
		
		if(obj.value != '' && $('#consignmentGoodsId').val() <= 0 && confirm(addSaidToContainAlertMsg)) {
			var valObj = obj.value;
					
			if(valObj.indexOf("(") >= 0)
				valObj = valObj.substring(0,valObj.indexOf('('));
					
			$('#newSaidToConatainName').val(valObj);
			ShowDialogForSaidToContain(true);
		}
	}
}

function ShowDialogForSaidToContain(modal){
	switchHtmlTagClass('saidToContainOverlay', 'show', 'hide');
	//$("#saidToContainOverlay").show();
	$("#saidToContainDialog").fadeIn(300);
	$('#newSaidToConatainName').focus();
	
	if (modal){
		$("#saidToContainOverlay").unbind("click");
	} else {
		$("#saidToContainOverlay").click(function (e) {
			HideSaidToContainDialog();
		});
	}
}

function HideSaidToContainDialog() {
	$('#saidToContainOverlay').switchClass("hide", "show");
	//$("#saidToContainOverlay").hide();
	$("#saidToContainDialog").fadeOut(300);
}

function validateConsignor() {
	if(isBookingFromDummyLS)
		return true;

	if($('#consignorName').exists() && $('#consignorName').is(":visible")) {
		if (!validateInput(1, 'consignorName', 'consignorName', 'consignorError', validPartyNameErrorMsg(configuration.consignorFeildLebel)))
			return false;
	}

	if (configuration.ConsignorValidate == 'true') {
		if(getWayBillTypeId() == WAYBILL_TYPE_CREDIT && (configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'false')) {
			if (configuration.ConsignorNameAutocomplete == 'true' && !validateInput(1, 'consignorCorpId', 'consignorName', 'consignorError', validPartyNameErrorMsg(configuration.consignorFeildLebel)))
				return false;
		} else if (configuration.ConsignorNameAutocomplete == 'true' && !validateInput(1, 'partyMasterId', 'consignorName', 'consignorError', validPartyNameErrorMsg(configuration.consignorFeildLebel)))
			return false;
	}

	return true;
}

function validateConsignee() {
	if(isBookingFromDummyLS)
		return true;

	if(!validateInput(1, 'consigneeName', 'consigneeName', 'consignorError', validPartyNameErrorMsg(configuration.consigneeFeildLebel)))
		return false;

	return !(configuration.ConsigneeValidate == 'true' && !consigneePartyMasterValidation());
}

function validateGstnForConsignor() {
	let consignoCorprGstn	= 'consignorGstn';
	
	if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
		consignoCorprGstn	= 'consignoCorprGstn';
		
	return validateInputTextFeild(1, consignoCorprGstn, consignoCorprGstn, 'error', gstnErrMsg);
}

function validateGstnForBilling() {
	let billingPartyGstn = 'billingGstn';
	
	if(!$('#' + billingPartyGstn).exists() && !$('#' + billingPartyGstn).is(":visible"))
		return true;
		
	return validateInputTextFeild(1, billingPartyGstn, billingPartyGstn, 'error', gstnErrMsg);
}

function validateGstnForConsignee() {
	let consigneeCorprGstn	= 'consigneeGstn';
	
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
		consigneeCorprGstn	= 'consigneeCorpGstn';
		
	return validateInputTextFeild(1, consigneeCorprGstn, consigneeCorprGstn, 'error', gstnErrMsg);
}

function basicFormValidation() {
	if(!validateArticleType()) return false;

	hideAllRateOnBookingPage();
	setStPaidByBasisOfBillSelection();

	var regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
	
	if((isManual || (configuration.sourceBranchAuto == 'true' && configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, executive.regionId)))
		&& !sourceValidation())
			return false;
	
	if (!destinationValidation()) return false;
	if (!validateDoorDeliveryPincodeWithDestination()) return false;
	if (!freightUptoBranchValidation()) return false;
	if (!billingBranchValidateValidation()) return false;
	if(!isAutoSequenceCounter && !lrNumberManualValidation()) return false;

	if(isManualWayBill) {
		if(isManualLRNumberAlreadyExist) {
			showMessage('error', iconForErrMsg + ' ' + 'LR Number ' + $('#lrNumberManual').val() +' already exist !');
			return false;
		}

		if(!lrDateValidation()) return false;
	}

	if (configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
		calculateVolChrgWghtOnVolumetricSelection();

	if(configuration.validateGSTNForOneParty == 'true' && !gstnValidation()
		|| configuration.requiredBothPartyGstNumber == 'true' && !validateGstNumberForEveryParty()
		|| configuration.gstNumberValidationForAnyOneParty == 'true' && !validateGstNumberForOnyOneParty()
		|| $('#billSelection').val() == BOOKING_WITH_BILL && !gstnValidation()
		|| configuration.hideGstnForEstimateLR == 'true' && $('#billSelection').val() == BOOKING_WITHOUT_BILL && !checkGstnOnEstimateBill()
		|| configuration.validateGSTNumberOnPayablePartyInWithBill == 'true' && $('#billSelection').val() == BOOKING_WITH_BILL && !validateGSTNumberOnPayablePartyInWithBill()) return false;

	if(!vehicleTypeValidation()) return false;
	if(!validateConsignor()) return false;
	if(!validateLRTypeWiseConsignorGSTNumber()) return false;
	if(!validateConsignorMobile()) return false;
	if(!validateLengthOfConsignorMobileNumber()) return false;
	if(!billingPartyValidation()) return false;
	if(!validateConsignee()) return false;
	if(!validateConsigneeMobile()) return false;
	if(!validateLengthOfConsigneeMobileNumber()) return false;
	if(!invoiceAndDeclearedValuesValidateByTaxType()) return false;
	
	/*if (!validateConsinorConsigneeTinNumber()) {
		return false;
	}*/
	
	if(!validateConsigneePincode()) return false;

	if(lrExists) {
		$("#lrNumberManual").focus();
		return false;
	}

	if(!validateConsigneeAddressOnDoorDelivery()) return false;
	if(!validateConsignorAndConsigneeNumberForSame()) return false;
	if(!validateTransportationMode()) return false;
	if(!validateForwardType()) return false;
	if(!validateHsnCode()) return false;
	if(!validateDivsion()) return false;
	
	if(parseInt($('#chargeType').val()) == CHARGETYPE_ID_KILO_METER && distance <= 0) {
		showMessage('error', 'Please configure distance from source to destination !');
		return false;
	}
	
	/*
	if(($('#chargeType').val() == CHARGETYPE_ID_CUBIC_RATE || configuration.VolumetricRate == 'true' || configuration.VolumetricWiseAddArticle == 'true')
		&& $('#volumetric').is(':checked') && !validateLBH())
		return false;
	*/

	if(configuration.lrTypeWisePartyToPartyConfiguration == 'true' && !lrTypesValidationForPartyToPartyConfig()) {
		setTimeout(() => {
			$("#consigneeName").focus();
		}, 0);
		
		return false;
	}
	
	return checkDiscountValidation();
}

function validateConsigneeAddressOnDoorDelivery() {
	var deliveryTo			= $('#deliveryTo').val();
	var consigneeAddress	= $('#consigneeAddress').val().trim();
	var doorDeliveryId 		= $('#charge' + configuration.doorDeliveryChargeId).val();

	if(configuration.validateConsigneeAddressOnDoorDelivery == 'true' && (deliveryTo == DELIVERY_TO_DOOR_ID || doorDeliveryId > 0)) {
		if(consigneeAddress == '' || consigneeAddress.length == 0) {
			showMessage('error', consineeAddressErrorMsg(configuration.consigneeFeildLebel));
			changeTextFieldColor('consigneeAddress', '', '', 'red');
			return false;					
		} else if(parseInt(configuration.minimumConsigneeAddressValidateLength) > 0
			&& consigneeAddress.length < parseInt(configuration.minimumConsigneeAddressValidateLength)) {
			showMessage('error', consineeAddressErrorLengthMsg(configuration.consigneeFeildLebel, configuration.minimumConsigneeAddressValidateLength));
			changeTextFieldColor('consigneeAddress', '', '', 'red');
			return false;	
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus('consigneeAddress', '', '', 'green');
		}
	}

	if(configuration.doNotAllowDestinationNameInConsigneeAddress == 'true'){
		var consigneeAddressWithTrim	= $('#consigneeAddress').val().trim();
		var destination = $("#destination").val().split("(")[0];
		var destinationwithTrim			= destination.trim();
		//if(bookingType == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID || deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
			if(deliveryTo == DELIVERY_TO_DOOR_ID) {
				if(destinationwithTrim.toUpperCase()  == consigneeAddressWithTrim.toUpperCase()) {
					showMessage('error', "Please Enter Valid Consignee Address");
					changeTextFieldColor('consigneeAddress', '', '', 'red');
					return false;
				}else {
					hideAllMessages();
					changeTextFieldColorWithoutFocus('consigneeAddress', '', '', 'green');
				}
			}
	//	}
	}

	return true;
}

function declaredValueValidations(event) {
	if (configuration.DeclaredValueValidate == 'false')
		return true;
	
	if(!declareValueChanges)
		return true;
	
	if(isPackingTypeExistForSkipDeclareValueValidation())
		return true;

	switch (configuration.DeclaredValueFlavorType) {
	case configuration.GeneralValidate :
		if(event != '' && getKeyCode(event) == 13) {	
			if(!validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg))
				return false;
		} else if(!validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg))
			return false;
			
		break;
	case configuration.ValidateOnInvoiceNo :
		if ($('#invoiceNo').val() != '' && !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg))
			return false;
			
		break;
	default:
		break;
	}
	
	if(configuration.validateInvoiceNumberDeclaredValueByLRType == 'true') {
		let wayBillTypeIds		= (configuration.wayBillTypeForDeclaredValueValidation).split(",");
		let wayBillTypeExist 	= isValueExistInArray(wayBillTypeIds, getWayBillTypeId());
		
		if(wayBillTypeExist && !validateInput(1, 'declaredValue', 'declaredValue', 'packageError',  declaredValueErrMsg))
			return false;
	}
	
	return true;

}

function minimumDeclaredValueValidation() {
	
	if(!declaredValueValidations(''))
		return false;
	
	if(Number($('#declaredValue').val()) < configuration.minimumDeclaredValue) {
		showMessage('info', 'Declared Value Should Be More Than '+ configuration.minimumDeclaredValue);
		
		setTimeout(() => {
			$('#declaredValue').focus();
		}, 200);
		
		return false;
	}
	
	return true;
}

function validateWeight() {
	if (configuration.ActualWght == 'true' && !validateInput(1, 'actualWeight', 'actualWeight', 'packageError',  actWeightErrMsg))
		return false;

	return !(configuration.ChargedWght == 'true' && !validateInput(1, 'chargedWeight', 'chargedWeight', 'packageError',  'Charged Weight can not be 0.'));
}

function validateWeightWithFlover() {

	switch (Number(configuration.WeightValidateFlover)) {
	case GroupConfigurationProperties.WEIGHT_VALIDATE_WITHOUT_CHARGETYPE_WEIGHT:
		if(configuration.WeightValidate == 'true' && !validateWeight())
			return false;
		break;

	case GroupConfigurationProperties.WEIGHT_VALIDATE_WITH_CHARGETYPE_WEIGHT:
		if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT && !validateWeight())
			return false;
		break;
		
	case GroupConfigurationProperties.WEIGHT_VALIDATE_WITH_CHARGETYPE_WEIGHT_OR_QUANTITY:
		if( ($('#chargeType').val() == CHARGETYPE_ID_QUANTITY || $('#chargeType').val() == CHARGETYPE_ID_WEIGHT) && !validateWeight())
			return false;
		break;
	default:
		console.log('Unknown Validation flover');
	break;
	}

	return true;
}

function validateRemark() {
	if((configuration.RemarkValidate == 'true' 
		|| configuration.validateRemarkForFOCBooking == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_FOC
		|| configuration.validateRemarkOnDeliveryToPassenger == 'true' && configuration.DeliveryToPassenger == 'true' && $('#deliveryTo').val() == DELIVERY_TO_PASSENGER_ID
		|| configuration.remarkMandaoryOnOtherChargeAmount == 'true' && Number($('#charge8').val()) > 0) 
			&& !validateInput(1, 'remark', 'remark', 'packageError', ramarkErrMsg))
		return false;
	
	if(configuration.validateRemarkIfGSTNAndEwaybillNotAvailable == 'true') {
		let consignorGstn 	= document.getElementById('consignorGstn');
		let consigneeGstn 	= document.getElementById('consigneeGstn');
		let eWaybillNumber	= document.getElementById('formNumber');
		
		if(consignorGstn && consignorGstn.value == '' && consigneeGstn && consigneeGstn.value == '' && eWaybillNumber && eWaybillNumber.value == ''
			&& !validateInput(1, 'remark', 'remark', 'packageError',  ramarkErrMsg))
			return false;
	}
	
	return true;
}

function validatePrivateMark() {
	if(configuration.validateOnEveryFeild == 'true' && configuration.PrivateMarkValidate == 'true' && !validateInput(1, 'privateMark', 'privateMark', 'packageError',  privateMarkErrMsg)) {
		setTimeout(function(){ $("#privateMark").focus(); }, 10);
		return false;
	}

	return true;
}
function validateDeliveryAt() {
	if(configuration.DeliveryAtValidate == 'true' && $('#deliveryTo').val() == "0"
		&& !validateInput(1, 'deliveryTo', 'deliveryTo', 'packageError',  deliveryAtErrMsg)) {
			setTimeout(function(){ $("#deliveryTo").focus(); }, 10);
			return false;
	}
	
	return true;
}

function validatePickupType() {
	if(configuration.validatePickupType == 'true' && $('#PickupType').val() == "0"
		&& !validateInput(1, 'PickupType', 'PickupType', 'PickupTypeError',  "Please select a valid Pickup Type!")) {
			setTimeout(function(){ $("#PickupType").focus(); }, 10);
			return false;
	}
	
	return true;
}

function validateStPaidBy() {
	if(configuration.showStPaidBySelect == 'true' && Number($('#STPaidBy').val()) == -1) {
		showMessage('error',stPaidByErrMsg );
		$('#STPaidBy').focus();
		changeTextFieldColor('STPaidBy', '', '', 'red');
		return false;
	}

	return true;
}

function validatePaymentType() {
	return !($('#paymentType').exists() && getWayBillTypeId() == WAYBILL_TYPE_PAID
		&& $('#paymentType').val() <= 0 && !validateInput(1, 'paymentType', 'paymentType', 'paymentTypeError',  paymentTypeErrMsg));
}

function validateForms() {
	return configuration.FormsValidate == 'false' || (configuration.FormsValidate == 'true' && validateInput(1, 'forms', 'forms', 'packageError',  form_403_402ErrMsg));
}

function validateCollectionPerson() {
	if(configuration.CollectionPersonValidate == 'false')
		return true;
	
    if($("#paymentType").val() != PAYMENT_TYPE_CREDIT_ID)
        return true;
    
    if(!validateInput(1, 'searchCollectionPerson', 'searchCollectionPerson', 'searchCollectionPersonError', validCollectionPersionErrMsg))
    	return false;
        
	if(configuration.validateCollectionPersonFromMaster == 'true' && $("#selectedCollectionPersonId").val() <= 0){
		showMessage('error', validCollectionPersionErrMsg);
		return false;
	}
		
    return true;
}

//function validateCollectionPerson() {	
//	return configuration.CollectionPersonValidate == 'false'
//		|| $("#paymentType").val() != PAYMENT_TYPE_CREDIT_ID
//		|| (configuration.CollectionPersonValidate == 'true'
//		&& $("#paymentType").val() == PAYMENT_TYPE_CREDIT_ID && validateInput(1, 'searchCollectionPerson', 'searchCollectionPerson', 'searchCollectionPersonError',  validCollectionPersionErrMsg)
//		&& (configuration.validateCollectionPersonFromMaster != 'true' || $('#selectedCollectionPersonId').val() > 0));
//}

function validateTinNumber() {
	let billSelection = $('#billSelection').val();

	if(configuration.TinNumberValidateOnBillSelection == 'true') {
		if(billSelection == BOOKING_WITH_BILL && !validateConsinorConsigneeTinNumber())
			return false;
	} else if(!validateConsinorConsigneeTinNumber())
		return false;

	return !(!validateConsinorConsigneeTinNumber());
}

function validateConsinorConsigneeTinNumber() {
	if(!validateConsignorTinNumber())
		return false;

	return !(!validateConsigneeTinNumber());
}

function validateConsignorTinNumber() {
	if(configuration.TinNumberValidateForConsignor == 'true') {
		if(!validateInput(1, 'consignorTin', 'consignorTin', 'consignorError',  consinorTinNumberErrMsg))
			return false;
		else if (!validateLengthOfConsinorTinNumber())
			return false;
	} /*else if (!validateLengthOfConsinorTinNumber()) {
		return false;
	}*/

	return true;
}

function validateTinNumberOnPopup() {
	let billSelection = $('#billSelection').val();

	if(configuration.isBranchWiseTinNumberValidateForConsignee == 'true') {
		let branchList 	= (configuration.branchCodeListForTinNumberValidateForConsignee).split(',');

		let checkBranch = isValueExistInArray(branchList, branchId);

		if(!checkBranch) {
			if(configuration.TinNumberValidateOnBillSelection == 'true') {
				if(billSelection == BOOKING_WITH_BILL && partyType == CORPORATEACCOUNT_TYPE_DELIVERY) {
					if(!validateInput(1, 'tinNo', 'tinNo', 'tinNoError',  tinNumberErrMsg)
					|| !validateLengthOfTinNumberOnPopup())
						return false;
				}
			} else if (!validateLengthOfTinNumberOnPopup())
				return false;
		}
	} else if(configuration.TinNumberValidateOnBillSelection == 'true') {
		if(billSelection == BOOKING_WITH_BILL && partyType == CORPORATEACCOUNT_TYPE_DELIVERY) {
			if(!validateInput(1, 'tinNo', 'tinNo', 'tinNoError',  tinNumberErrMsg)
			|| !validateLengthOfTinNumberOnPopup())
				return false;
		}
	} else if (!validateLengthOfTinNumberOnPopup())
		return false;

	return true;
}

function validateLengthOfTinNumberOnPopup() {
	return validateInput(4, 'tinNo', 'tinNo', 'tinNoError', tinNumberLenErrMsg);
}

function validateNewPartyMobileNumber() {
	return validateInput(1, 'newPartyMobileNumber', 'newPartyMobileNumber', 'addNewPartyErrorDiv', mobileNumberErrMsg);
}

function validateNewPartyName() {
	return validateInput(1, 'newPartyName', 'newPartyName', 'addNewPartyErrorDiv', partyNameErrMsg);
}

function validateNewPartyType() {
	return validateInput(1, 'newPartyType', 'newPartyType', 'addNewPartyErrorDiv', partyTypeErrMsg);
}

function validateNewPartyAddress() {
	return validateInput(1, 'newPartyAddress', 'newPartyAddress', 'addNewPartyErrorDiv', addressErrMsg);
}

function validateDestinationBranch() {
	if(configuration.ShowCityAndDestinationBranch == 'true' && !isManualWayBill)
		if(!validateInput(1, 'destinationIdEle_primary_key', 'destinationIdEle', 'basicError', properDestinationErrMsg)) {
			return false;
	} else if(!validateInput(1, 'destinationBranchId', 'destination', 'basicError', properDestinationErrMsg))
		return false;

	return true;
}

function validateConsigneeTinNumber1() {
	if(!validateInput(1, 'consigneeTin', 'consigneeTin', 'consigneeError',  consineeTinNumberErrMsg)) {
		return false;
	} /*else if (!validateLengthOfConsineeTinNumber()) {
		return false;
	}*/

	return true;
}

function validateConsigneeTinNumber() {
	if(configuration.TinNumberValidateForConsignee == 'true') {
		if(configuration.isBranchWiseTinNumberValidateForConsignee == 'true') {
			var branchList 		= (configuration.branchCodeListForTinNumberValidateForConsignee).split(',');
			var checkBranch 	= isValueExistInArray(branchList, branchId);

			if(!checkBranch) {
				if(configuration.TinNumberValidateOnBillSelection == 'true')
					if(!validateTinNumberOnBillSelection()) return false;
				else if(!validateConsigneeTinNumber1()) return false;
			}
		} else if(configuration.TinNumberValidateOnBillSelection == 'true')
			if(!validateTinNumberOnBillSelection()) return false;
		else if(!validateConsigneeTinNumber1()) return false;
	}

	/*if (!validateLengthOfConsineeTinNumber()) {
		return false;
	}*/

	return true;
}

function validateTinNumberOnBillSelection() {
	var billSelection = $('#billSelection').val();
	
	if(configuration.ConsigneeTinNumberValidationOnWithBill == 'true' && billSelection == BOOKING_WITH_BILL
		&& !validateConsigneeTinNumber1())
		return false;
	else if(configuration.ConsigneeTinNumberValidationOnWithOutBill == 'true' && billSelection == BOOKING_WITHOUT_BILL
		&& !validateConsigneeTinNumber1())
		return false;
	
	return true;
}

function validateLengthOfConsinorTinNumber() {
	return validateInput(4, 'consignorTin', 'consignorTin', 'consignorTinError', consinorTinNumberLenErrMsg);
}

function validateLengthOfConsineeTinNumber() {
	return validateInput(4, 'consigneeTin', 'consigneeTin', 'consigneeTinError', consineeTinNumberLenErrMsg);
}

function validateLengthOfConsinorGSTNumber() {
	let consignoCorprGstn	= getConsignorGstnEle();
	
	let gstNumber	= $('#' + consignoCorprGstn).val();

	if(configuration.urpValidationBookingPage == 'true' && gstNumber.toUpperCase() == configuration.urpValidationConstant)
		return true;
			
	if(configuration.validatePanNumberInGstFeild == 'true' && gstNumber.length == 10)
		return validateInputTextFeild(8, consignoCorprGstn, consignoCorprGstn, 'info', panNoErrMsg);
	else if(!validateInputTextFeild(9, consignoCorprGstn, consignoCorprGstn, 'info', gstnErrMsg))
		return false;

	return true;
}

function validateLengthOfBillingGSTNumber() {
	let billingGstn	= 'billingGstn';
	
	let gstNumber	= $('#' + billingGstn).val();

	if(configuration.urpValidationBookingPage == 'true' && gstNumber.toUpperCase() == configuration.urpValidationConstant)
		return true;
			
	if(configuration.validatePanNumberInGstFeild == 'true' && gstNumber.length == 10)
		return validateInputTextFeild(8, billingGstn, billingGstn, 'info', panNoErrMsg);
	else if(!validateInputTextFeild(9, billingGstn, billingGstn, 'info', gstnErrMsg))
		return false;

	return true;
}

function validateLengthOfConsineeGSTNumber() {
	let consigneeCorpGstn	= 'consigneeGstn';
	
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
		consigneeCorpGstn	= 'consigneeCorpGstn';

	let gstNumber	= $('#' + consigneeCorpGstn).val();

	if(configuration.urpValidationBookingPage == 'true' && gstNumber.toUpperCase() == configuration.urpValidationConstant)
		return true;
			
	if(configuration.validatePanNumberInGstFeild == 'true' && gstNumber.length == 10)
		return validateInputTextFeild(8, consigneeCorpGstn, consigneeCorpGstn, 'info', panNoErrMsg);
	else if(!validateInputTextFeild(9, consigneeCorpGstn, consigneeCorpGstn, 'info', gstnErrMsg))
		return false;

	return true;
}

function formValidations() {
	if(configuration.TokenWiseAutoLrSequence == 'true' && !isAutoSequenceCounter && !isManualWayBill
		&& configuration.isAllowOnlyNumeric == 'true' && !regIsDigit(document.getElementById("lrNumberManual")))
			return false;

	if(configuration.LRNumberManual == 'true' && !isAutoSequenceCounter
		&& configuration.isAllowOnlyNumeric == 'true' && !regIsDigit(document.getElementById("lrNumberManual")))
			return false;

	if(isManualWayBill)
		checkIfManualLRNumberAndDate();
	
	if(configuration.validateBookingGodownDelvryForBranches == 'true'){
		if (!validateDeliveryAtGodown()) {return false;}
	}
	
	var regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
	
	if(configuration.validateDoorDeliveryChargeOnDoorDelivery == 'true' 
			|| (configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, 0))){
		if (!validateDoorDeliveryChargeOnDoorDelivery()) {return false;}
	}
	
	if(basicFormValidation()) {
		if(!validateConsignmentTables())
			return false;
			
		if(!isChargeDisplayable())
			checkAndAddConsignment(); // Name Change from getCharges() {

		if(isBookingDiscountAllow && $('#discount').val() != '' && $('#discount').val() != 0 && $('#remark').val() == '') {
			showMessage('error', ramarkErrMsg);
			document.getElementById('remark').focus();
			return false;
		}
		
		if($('#chargeType').exists() && !validateInputTextFeild(1, 'chargeType', 'chargeType', 'error', 'Select Charge Type !'))
			return false;
			
		if(!checkManualLRLengthValidation()) return false;
		if(!validateLrNumber()) return false;
		
		if(isManualWayBill && isManualLRNumberAlreadyExist) {
			showMessage('error', iconForErrMsg + ' ' + 'LR Number ' + $('#lrNumberManual').val() +' already exist !');
			return false;
		}
		
		if(!validateDeclaredValueAndInvoiceNumber()) return false;
		if(!validateWeightWithFlover()) return false;
		if(!validateLrCharge()) return false;
		if(!selectFormValidation()) return false;
		if(!selectEwaybillByStateValidation()) return false;
		if(!validateForm_403_402Type()) return false;
		if(!CTFormValidation()) return false;
		if(!validateWeigthFreightRate()) return false;
		if(!checkForDoorDeliveryForDeliveryLocations()) return false;
		if(!validateDoorDeliverySelection()) return false;
		
		if(configuration.validateOnEveryFeild == 'true') {
			var formNumber = $("#formNumberDiv").css("display");

			if (formNumber != 'none' && !validateInput(1, 'formNumber','formNumber', 'error', wayBillNumberErrMsg))
				return false;
		}

		if (!invoiceNoValidation()) return false;
		if (!invoiceDateValidation()) return false;
		if (!declaredValueValidations('')) return false;
		if (!minimumDeclaredValueValidation()) return false;
		if (!validateDeclaredValueBillWise()) return false;
		if (!commodityTypeValidation()) return false;
		if (!validateRemark()) return false;
		if (!validatePrivateMark()) return false;
		if (!validateDeliveryAt()) return false;
		if (!validateStPaidBy()) return false;
		if (!validatePaymentType()) return false;
		if (!validateForms()) return false;
		if (!validatePanNumber()) return false;
		if (!validateTanNumber()) return false;
		if (!validateCollectionPerson()) return false;
		if (!validateConsignorOrConsigneeMobile()) return false;
		if (!purchaseOrderDateValidation()) return false;
		if (!validateTaxType()) return false;
	 	if (!blockBookingOnGSTNumber(null)) return false;
		if (!categoryTypeValidation()) return false;
		if (!gstTypeValidation()) return false;
		if (!validateBookedBy()) return false;
		if (!blockBookingOnMobileNumber(null)) return false;
		if (!validatePickupType()) return false;
		if (!validateDeclarationType()) return false;

		if (configuration.selectEWayBillONDeclaredValueWithBill == 'true' && !showEwayBillNumberWarningMsgNew())
			return false;

		if (configuration.validateOCChargeOnDoorDeliverySelection == 'true' && ($('#wayBillType').val() != WAYBILL_TYPE_FOC))
			if(!validationOCCharge()) return false;
		
		if(!branchServiceTypeSelectionValidation()) return false;
		
		showAlertForDeclaredValue();

		if(configuration.AllowEnableDoorDelivery == 'true' && configuration.DoorDeliveryChargeValidate != 'true') {
			var doorDeliveryCharge	= document.getElementById('charge' + configuration.doorDeliveryChargeId);
			
			if(doorDeliveryCharge != null) {
				var isReadOnly = doorDeliveryCharge.readOnly;
				
				if(((configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == 'true' 
					|| configuration.skipDoorDeliveryAmountValidationOnExeededSlabValue == true) && Number(maximumSlabValue) > 0)) {

					if(Number($('#chargedWeight').val()) < Number(maximumSlabValue)) {
						if (!validateDoorDeliveryCharge(isReadOnly)) return false;
					}
				} else if (!validateDoorDeliveryCharge(isReadOnly)) return false;
			}
		}
		
		changeConsignmentAmount();
		
		if(typeof changeFreightAmount != undefined)
			changeFreightAmount(); // Comming from Rate.js 
		
		if(!validateFreightCharge()) return false;
		
		if(configuration.routeWiseSlabConfigurationAllowed == 'false'
			&& typeof validateArticleAmountWithWeight != 'undefined' && !validateArticleAmountWithWeight())
				return false;
				
		if(configuration.isIncreaseCRInsuranceChargeAllow == 'true' && !validateInsuranceCharge()) return false;
		if(!checkPackingTypeAllowedOnWeight()) return false;

		if(configuration.checkConsignmentGoodForApplyRate == 'true' || configuration.checkConsignmentGoodForApplyRate == true)
			chargesForGroup();
			
		addAmountToFreightOnPerArticleData();
		calcTotal();

		if(configuration.validateShortCreditAllowOnTxnType == 'true' && !validateShortCreditAllowOnTxnType())
			return false;
			
		if(configuration.validateShortCreditAllowOnTxnTypeWithSubRegion == 'true' && !validateShortCreditAllowOnTxnType())
			return false;
		
		if(configuration.packingTypeWiseAdditionalRemarkRequired == 'true' && !validateAdditionalRemark())
			return false;
		
		if(configuration.validateConsignmentAmount == 'true' && !validateConsignmentAmount())
			return false;
			
		if(configuration.validateQuantityAmountMismatch == 'true' && !validateQuantityAmountMismatch()) return false;
		
		if(getWayBillTypeId() == WAYBILL_TYPE_PAID || (getWayBillTypeId() == WAYBILL_TYPE_CREDIT && configuration.allowZeroAmountInTBB == 'false')) {
			if(!validateFixAmount())
				return false;
		} else if(getWayBillTypeId() == WAYBILL_TYPE_TO_PAY && configuration.allowZeroAmountInToPay == 'false' && !validateFixAmount())
			return false;
		
		if(configuration.doNotBookLrWithoutChargeValue == 'true' && !chargeValueRequired())
			return false;
		
		if(!validateGstInputOnGrandTotal()) return false;
		if(!validateLengthOfConsinorGSTNumber()) return false;
		if(!validateLengthOfConsineeGSTNumber()) return false;
		if(configuration.isAllowToShowBillingPartyGSTN == 'true' && !validateLengthOfBillingGSTNumber()) return false;
		
		if(configuration.wayBillChargeWiseRemarkNeeded == 'true') {
			let chargeIdList 		= (configuration.waybillChargeMasterIdsForRemark).split(',');
			
			for(const element of chargeIdList) {
				if(!validateRemarkOnCharge(element))
					return false;
			}
		}
		
		if(!validateServiceType()) return false;
		
		if(configuration.isShowSingleEwayBillNumberField == 'true' && !validateEWayBillNumberOnDeclareValue())
			return false;
		
		if(configuration.isShowSingleEwayBillNumberField == 'false' && !validateEWayBillNumberOnDeclareValueOnSave())
			return false;
			
		if(!validateDateDestOvernitecarrier()) return false;
		if(!validateDeliveryToForOvernightFreightCarriers()) return false;
		if(!validateSourceDestinationBranchAbbrevation()) return false;
		
		let wayBillType = document.getElementById("wayBillType");
		let value		= wayBillType.value;

		if(!validateForPaymentTypeCheque()) return false;
		if(!stPaidByValidation()) return false;
		if(configuration.invoiceNoValidateForDuplicateInSameDay == 'true' && invalidInvoiceNumber) return false;
		if(!validatePartyOnShortCreditPayment()) return false;
		if(!validateDestinationSubRegionForDDDVBooking()) return false;
		if(!validateShortCreditLimit()) return false;
		if(!validateDoorDeliveryChargeToRegionWiseMinValue()) return false;
		
		if(configuration.regionWiseTollChargeMandatory == 'true' && !validateTollChargeRegionWise())
			return false;
		
		if(configuration.paidTopayBookingAllowForBillingParty == 'false' && isConsignorTBBParty && value != WAYBILL_TYPE_CREDIT) {
			showMessage('error','You Can not Book Paid/Topay/FOC Lr For TBB Customer !');
			return false;
		}
		
		if(!setExpressChargeWiseDeliveryToOption(BookingChargeConstant.EXPRESS)){
			showMessage('error', expressChargeErrMsg);
			return false;
		}
		
		if(!jsondata.WIHOUT_GST_NUMBER_BOOKING_ALLOW && !validateGstNoInputOnGrandTotal())
			return false;

		if(!validateFormChargeMinValue()) return false;
		//if(!chargeValidation(STATISTICAL)) return false;
		if(!validateGstNumberInputOnGrandTotalWithWayBillType()) return false;
		if(!addConsingmentGstn()) return false;
		
		if(typeof calculateOtherChargeBasedOnDeclaredValue != 'undefined') calculateOtherChargeBasedOnDeclaredValue();
		
		if(checkDiscountValidation()) {
			let disAmt 			= 0.00;
			let totalAmt		= 0.00;

			totalAmt = $('#totalAmt').val();

			if($("#isDiscountPercent").exists() && $("#isDiscountPercent").prop("checked") == true)
				disAmt = (parseFloat($("#discount").val()) * parseFloat(totalAmt)) / 100;
			else
				disAmt = $('#discount').val();

			if(!validateDiscountLimit(discountInPercent, totalAmt, disAmt, $('#discount')))
				return false;
		}
		
		if(!minimumLrBookingTotal(configuration, getWayBillTypeId(), Number($("#grandTotal").val()), branchId)) return false;
		if(!blockBookingOnGrandTotalAmount()) return false;
		if(!consignorIdProofMandatory()) return false;
		if(!consignorAndConsigneeIdProofMandatoryOnGstn()) return false;
		if(!validateFreightChargeConfigAmount(value, configuration, Number($('#charge' + FREIGHT).val()), executive.subRegionId)) return false;
		if(!validateActualWeightOnSundry()) return false;
		
		if(configuration.validateInvoiceNoOnDecalredValue == 'true'){
			validateInvoiceOnDeclaredValueOnSave = true;
		
			if(!validateInvoiceOnDeclaredValue())
				return false;
		}
		
		if((validateInvoiceDetailsOnConfiguredParty() || configuration.validateMultipleInvoiceDetails == 'true') && (invoiceDetailArray == undefined || invoiceDetailArray.length == 0)) {
			showMessage('error', 'Please, Add multiple invoice details !');
			return false;
		}
		
		if(validateEwaybillNumberThroughApi && !validateEWayBillNumbers())
			return false

		if(!validateTransporterNameMaster())
			return false;
			
		//Consignment.js
		changeDeclareValue();
		
		if(configuration.branchListForSkipAmountValidation != 0 && !lrTypeAndPackingTypeWiseValidation())
			return false;
			
		if(!calculateAndvalidateBuiltyChgValue()) return false;
		if(!validateFreightLessThanZero()) return false;
		if(!validateFragileCharge()) return false;
		if(!validateDoorDeliveryChargesOnWeight()) return false;
		if(!validatePickupCartageCharge(PICKUP_CARTAGE)) return false;
		if(!validateDoorDeliveryPincodeWithDestination()) return false;
		if(!setFtlTypeAutomatically()) return false;
		if(!validateFocApprovedBy()) return false;
		if(!validateVehiclePONumber()) return false;
		if(!validateSealNumber()) return false;

		let isExist = false;

		if (isManualWayBill && configuration.skipRateValidationForManualLrTypes) {
		    const wayBillTypeIds = configuration.skipRateValidationForManualLrTypes.split(',');
		    const wayBillType    = $('#wayBillType').val();
		    isExist              = isValueExistInArray(wayBillTypeIds, wayBillType);
		}

		if (!isExist && totalLoadingWithDiscount > 0 && $('#charge' + LOADING).val() < totalLoadingWithDiscount) {
		    showMessage('error', 'Loading Charge Can not be less than calculated configuration.');

		    setTimeout(function() {
		        $('#charge' + LOADING).focus();
		    }, 100);

		    $('#charge' + LOADING).val(loadingValue);

		    return false;
		}

		
		isPinodeForIns	= true;
		isAddressForIns	= true;
		
		if(isInsuranceServiceAllow && $('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val() > 0) {
			if(value == WAYBILL_TYPE_TO_PAY) {
				if(!validateConsigneeMobile()) return false;
				if(configuration.validatePincodeForInsurance == 'true' && !validateConsigneePincode()) return false;
				if(configuration.validateAddressForInsurance == 'true' && !validateConsigneeAddress()) return false;
				//if(!validateConsigneeEmail()) return false;
				
				if(configuration.validatePincodeForInsurance == 'true') {
					if(!validateConsigneePincode()) return false;
				} else
					isPinodeForIns	= $('#consigneePin').val() > 0;
				
				if(configuration.validateAddressForInsurance == 'true') {
					if(!validateConsigneeAddress()) return false;
				} else 
					isAddressForIns	= $('#consigneeAddress').val() != '';
			} else {
				if(!validateConsignorMobile()) return false;
				if(configuration.validatePincodeForInsurance == 'true' && !validateConsignorPincode()) return false;
				if(configuration.validateAddressForInsurance == 'true' && !validateConsignorAddress()) return false;
				//if(!validateConsignorEmail()) return false;
				
				if(configuration.validatePincodeForInsurance == 'true') {
					if(!validateConsignorPincode()) return false;
				} else
					isPinodeForIns	= $('#consignorPin').val() > 0;
					
				if(configuration.validateAddressForInsurance == 'true') {
					if(!validateConsignorAddress()) return false;
				} else 
					isAddressForIns	= $('#consignorAddress').val() != '';				
			}
		}
		
		if(isCalculateCommissionOnDiffRate(configuration, $('#wayBillType').val(), $('#chargeType').val()) && actualWeightRateAmt <= 0) {
			showMessage('error', 'Weight Rate Missing!');
			return false;
		}
		
		if(configuration.validateConsignorConsigneeEmail == 'true') {
			if (!validateEmailId("consignorEmail"))
				return false;	
			
			if (!validateEmailId("consigneeEmail"))
				return false;
		}

		if($('#otpCheckBox').is(':checked') && !isOtpVerified){
			showMessage('error', 'Please verify OTP !');
			return false;
		}

		if(configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true' && $('#declaredValueCheckBox').prop("checked") && ($('#percentageRiskCover').val() == 0 || $('#percentageRiskCover').val() == "")) {
			showMessage('error', 'Please add insurance rate!');
			$('#percentageRiskCover').focus();
			return false;
		}
		
		if(isFromDynamicPaymentTypeSelection)
			return true;
		
		if(value == WAYBILL_TYPE_FOC || configuration.allowZeroAmountInTBB == 'true' || configuration.allowZeroAmountInToPay == 'true' || configuration.allowZeroAmountInPaid == 'true') {
			if(document.getElementById('isDiscountPercent') != null)
				document.getElementById('isDiscountPercent').checked = false;

			saveWayBill(value);
		} else if($("#grandTotal").val() <= 0 && ($('#chargeType').val() != CHARGETYPE_ID_FIX
			|| $('#chargeType').val() == CHARGETYPE_ID_FIX && configuration.allowZeroAmountInFixArticleType == 'false'))
			alert('Charges Missing');
		else if(configuration.isLimitMaxBookingAmt == 'true' && $('#grandTotal').val() > parseInt(configuration.maxAmtAllowedForBooking))
			showMessage('error','Booking total Greater than  '+parseInt(configuration.maxAmtAllowedForBooking)+'/- Rs not allowed !');
		else
			saveWayBill(value);
	}
}

function validateConsignmentAmount() {
	var wayBillType			= getWayBillTypeId();
	var consignmentAmount	= $('#qtyAmount').val();

	if(wayBillType != WAYBILL_TYPE_FOC && (configuration.doNotAllowToBookTopayLRWithAmount == 'false' || Number(wayBillType) != WAYBILL_TYPE_TO_PAY) && consignmentAmount == 0) {
		showMessage('error', 'Consignment Amount can not be 0 !');
		changeTextFieldColorWithoutFocus('qtyAmount', '', '', 'red');
		return false;
	} else {
		hideAllMessages();
		changeTextFieldColorWithoutFocus('qtyAmount', '', '', 'green');
		return true;
	}
}

function validateForPaymentTypeCheque() {
	var paymentType		= $('#paymentType').val();
	
	if(isPaidByDynamicQRCode)
		return true;
			
	if(isFromDynamicPaymentTypeSelection && !isPaidByDynamicQRCode)
		return true;
	
	if(GeneralConfiguration.BankPaymentOperationRequired == 'true' && getWayBillTypeId() == WAYBILL_TYPE_PAID) {
		if(paymentType > 0 && paymentType != PAYMENT_TYPE_CASH_ID && paymentType != PAYMENT_TYPE_CREDIT_ID && paymentType != PAYMENT_TYPE_CROSSING_CREDIT_ID) {
			if($('#storedPaymentDetails').html() == '') {
				showMessage('error', 'Please, Add Payment Details !');
				return false;
			}
		}
		
		return true;
	}

	if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID) {
		if(!validateInput(1, 'chequeDate', 'chequeDate', 'packageError', chequeDateErrMsg))
			return false;

		if(!validateInput(1, 'chequeNo', 'chequeNo', 'packageError', chequeNumberErrMsg))
			return false;

		if(!validateInput(1, 'bankName', 'bankName', 'packageError', branchNameErrMsg1))
			return false;

		if(!validateInput(1, 'chequeAmount', 'chequeAmount', 'packageError', chequeAmountErrMsg))
			return false;
	}

	return true;
}

function validateChars(e){
	var keynum = window.event ? e.keyCode : e.which;
	
	return keynum != 95;
}

function vehicleTypeValidation() {
	return !(configuration.VehicleTypeValidate == 'true' 
		&& getBookingType() == BOOKING_TYPE_FTL_ID && !validateInput(1, 'vehicleType', 'vehicleType', 'basicError', truckTypeErrMsg));
}

function sourceValidation() {
	if (configuration.sourceTypeValidate == 'true') {
		if(configuration.sourceBranch == 'true' && !validateInput(1, 'sourceBranchId', 'sourceBranch', 'basicError', sourceBranchErrMsg))
			return false;
		
		if(dispatchLedgerIdForManualLS == 0 && configuration.DefaultLoggedBranchInSourceBranch == 'false' && (selectedSource == null || selectedSource == 0))
			return false;
	}

	return true;
}

function lrDateValidation() {
	if (configuration.LRDate == 'true') {
		if(!validateInput(1, 'lrDateManual', 'lrDateManual', 'basicError', dateErrMsg))
			return false;

		if(!chkDate(getValueFromInputField('lrDateManual')))
			return false;
	}
	
	return true;
}

function invoiceDateValidation() {
	if(configuration.validateInvoiceDate == 'true') {
		if(!validateInput(1, 'invoiceDate', 'invoiceDate', 'basicError', dateErrMsg))
			return false;

		if(!validateInvoiceDate(getValueFromInputField('invoiceDate')))
			return false;
	}
	
	return true;
}

function validateInvoiceDate(date) {
	if(isValidDate(date)) {
		var currentDate  			= new Date(curSystemDate);
		var manualLRDate 			= new Date(curSystemDate);
		
		var manualLRDateParts 	= new String(date).split("-");
		manualLRDate.setFullYear(parseInt(manualLRDateParts[2],10));
		manualLRDate.setMonth(parseInt(manualLRDateParts[1]-1,10));
		manualLRDate.setDate(parseInt(manualLRDateParts[0],10));
		
		if(manualLRDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			changeError1('invoiceDate','0','0');
			isValidationError=true;
			return false;
		}
	} else {
		showMessage('error', validDateErrMsg);
		changeError1('invoiceDate','0','0');
		isValidationError=true;
		return false;
	}
	
	return true;
}

function lrNumberValidation() {
	return vehicleTypeValidation();
}

function stPaidByValidation() {
	var amount 			= parseFloat($("#totalAmt").val());
	var discountAmount 	= 0;
	
	if (configuration.showGstPaidByBasisOfDivisionSelection == 'true' || configuration.showGstPaidByBasisOfBillSelection == 'true')
		return true;
	
	if(isBookingDiscountAllow) {
		if(document.getElementById('isDiscountPercent') != null && document.getElementById('isDiscountPercent').checked)
			discountAmount	= amount - parseFloat($('#discount').val()) * parseFloat(amount) / 100;
		else
			discountAmount	= amount - parseFloat($('#discount').val());
	} else
		discountAmount = amount;
	
	if(configuration.applyIncludedTax == 'true') {
		var amount	= 0;
		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
			for(const element of consigAddedtableRowsId) {
				if($('#qtyAmountTotal' + element).html() > 0)
					amount		+= parseFloat($('#qtyAmountTotal' + element).html());
			}
		} else if($('#chargeType').val() == CHARGETYPE_ID_WEIGHT)
			amount		= $("#weightAmount").val();
		else if($('#chargeType').val() == CHARGETYPE_ID_FIX)
			amount		= $("#fixAmount").val();
		 
		discountAmount = amount;
	}
	
	if(!jQuery.isEmptyObject(jsondata.taxes)) {
		if(Number(discountAmount) <= Number(jsondata.taxes[0].leastTaxableAmount) && jsondata.taxes[0].leastTaxableAmount > 0) {
			if(configuration.hideStPaidByNotApplicable == 'false' || configuration.hideStPaidByNotApplicable == false)
				$('#STPaidBy').val(TAX_PAID_BY_NOT_APPLICABLE_ID);
			
			consignorIdProofMandatory();
			return true;
		} else {
			validateStPaidBy();
			setSTPaidByOnGSTNumber();
			validateSTPaidOnEstimateBooking();

			if(configuration.calculateTaxOnlyOnTaxTypeFCM == 'true')
				return true;

		 	if($('#billSelection').val() == BOOKING_WITH_BILL || configuration.doNotCalculateGSTForEstimateLR == 'false') {
				if(configuration.allowToSelectNotApplicableInAnyCase == 'false' && ((configuration.validateGstNoInputOnGrandTotalWayBillTypeWise == 'false' || ((configuration.validateGstNoInputOnGrandTotalWayBillTypeWiseOnRegionIds.indexOf(executive.regionId+'') == -1))))
				&& !validateInput(1, 'STPaidBy', 'STPaidBy', 'consignmentError', "You can not select Not Applicable because LR amount is more than "+jsondata.taxes[0].leastTaxableAmount +"/-"))
					return false;
			}
		}
	}

	return true;
}

function billingPartyValidation() {
	//chk for Billing Party
	if (configuration.BillingPartyValidate == 'true') {
		if(getWayBillTypeId() == WAYBILL_TYPE_CREDIT) {
			if(!validateInput(1, 'billingPartyName', 'billingPartyName', 'consignorError', validBillingPartyErrMsg))
				return false;

			if (configuration.BillingPartyNameAutocomplete == 'true' && !validateInput(1, 'billingPartyId', 'billingPartyName', 'consignorError', validBillingPartyErrMsg))
				return false;
		}
	}

	return true;
}

function consigneePartyMasterValidation() {
	return configuration.ConsigneeNameAutocomplete == 'false' || (configuration.ConsigneeNameAutocomplete == 'true' && validateInput(1, 'consigneePartyMasterId', 'consigneeName', 'consigneeError', validPartyNameErrorMsg(configuration.consigneeFeildLebel)));
}
/*this is work done for khtc(204) validate one mobileNUmber field.
 * if both mobileNUmber field is invalid then Booking is Not applicable.
 * Any one mobile number field is valid then booking is applicable.
 */
function validateConsignorOrConsigneeMobile() {
	if(configuration.validateConsignorOrConsigneeMobile == 'false') return true;
	
	var consignorValidate = checkValidMobileNumber('consignorPhn');
	var consigneeValidate = checkValidMobileNumber('consigneePhn');
	
	if(($('#consignorPhn').val() == "" && $('#consigneePhn').val() == "") || (!consignorValidate && !consigneeValidate)) {
		showMessage('error', validConsinorAndConsigneeMobileErrMsg);
		return false;
	} else if($('#consignorPhn').val() == "" && !consigneeValidate) {
		showMessage('error', validConsineeMobileErrMsg);
		return false;
	} else if($('#consigneePhn').val() == "" && !consignorValidate) {
		showMessage('error', validConsinorMobileErrMsg);
		return false;
	}
	
	return true;
}

function validateConsignorMobile() {
	if (configuration.validateOnEveryFeild == 'true' 
		|| configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consignorPhn").val().includes("*"))
		return true;
	
	if (configuration.ConsignorMobileNoValidate == 'true') {
		if((configuration.validateConsignorMobileForAutoBooking == 'true' && !isManualWayBill) 
				|| (configuration.validateConsignorMobileForManualBooking == 'true' && isManualWayBill) 
				|| (configuration.validateConsignorMobileForAutoManualBooking == 'true')) {
			switch (configuration.ConsignorMobileNumberValidationFlavor) {
			case '1':
				if($('#consignorPhn').exists() && $('#consignorPhn').is(":visible")) {
					if (!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorError', consinorMobileNumberErrMsg)
					|| !validateLengthOfConsignorMobileNumber())
						return false;
				} else if($('#consignorCodePhn').exists() && $('#consignorCodePhn').is(":visible")) {
					if (!validateInput(1, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', consinorMobileNumberErrMsg)
					|| !validateLengthOfConsignorMobileNumber())
						return false;
				}
				break;
			case '2':
				if($('#consignorPhn').exists() && $('#consignorPhn').is(":visible")) {
					if (!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorError', consinorMobileNumberErrMsg)
					|| !validateInput(2, 'consignorPhn', 'consignorPhn', 'consignorError', validConsinorMobileErrMsg)
					|| !validateLengthOfConsignorMobileNumber())
						return false;
				} else if($('#consignorCodePhn').exists() && $('#consignorCodePhn').is(":visible")) {
					if (!validateInput(1, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', consinorMobileNumberErrMsg)
					|| !validateInput(2, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', validConsinorMobileErrMsg)
					|| !validateLengthOfConsignorMobileNumber())
						return false;
				}
				
				break;
			default:
				break;
			}
		}
	} else if(configuration.partyPanelType == '2' && configuration.ConsignorMobileNumberValidationFlavor == '0' && $('#consignorPhn').val() == '') {
		$('#consignorPhn').val('0000000000');
		return true;
	} else if (!validateLengthOfConsignorMobileNumber())
		return false;

	return true;
}

function validateConsigneeMobile() {

	if (configuration.lockFocusIfConsigneeMobileEmpty == 'true' && $("#consigneePhn").val().trim() == "") {
		$("#consigneePhn").focus(); 
		return false;
	}
		  
	if (configuration.validateOnEveryFeild == 'true' 
		|| configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consigneePhn").val().includes("*"))
		return true;

	if (configuration.ConsigneeMobileNoValidate == 'true') {
		if((configuration.validateConsigneeMobileForAutoBooking == 'true' && !isManualWayBill) 
				|| (configuration.validateConsigneeMobileForManualBooking == 'true' && isManualWayBill) 
				|| (configuration.validateConsigeeMobileForAutoManualBooking == 'true')) {
			switch (configuration.ConsigneeMobileNumberValidationFlavor) {
			case '1':
				if (!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg)
				|| !validateLengthOfConsigneeMobileNumber())
					return false;
				break;
			case '2':
				if (!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg)
				|| !validateInput(2, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsineeMobileErrMsg)
				|| !validateLengthOfConsigneeMobileNumber())
					return false;
				break;
			default:
				break;
			}
		}
	} else if(configuration.partyPanelType == '2' && configuration.ConsigneeMobileNumberValidationFlavor == '0' && $('#consigneePhn').val() == '') {
		$('#consigneePhn').val('0000000000');
		return true;
	} else if(!validateLengthOfConsigneeMobileNumber())
		return false;

	validateConsignorOrConsigneeMobile();
	//setFocusForTokenBooking();
	return true;
}

function validateLengthOfConsignorMobileNumber() {
	if(configuration.landlineNoAllowedInMobileNoFeild == 'false') {
		if(configuration.ConsignorMobileNoLengthValidate == 'true' && !validateInput(5, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberLenErrMsg))
			return false;
	} else if (!validateInput(7, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsignorPhoneOrMobileNumber))
		return false;

	return true;
}

function validateLengthOfConsigneeMobileNumber() {
	if(configuration.landlineNoAllowedInMobileNoFeild == 'false') {
		if(configuration.ConsigneeMobileNoLengthValidate == 'true' && !validateInput(5, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberLenErrMsg))
			return false;
	} else if (!validateInput(7, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsigneePhoneOrMobileNumber))
		return false;

	return true;
}

function invoiceAndDeclearedValuesValidateByTaxType() {
	let taxTypeId = $('#taxTypeId').val();

	if(configuration.invoiceAndDeclearedValuesMandataryForTaxTypeFcm == 'true') {
		if(taxTypeId > 0  && taxTypeId == CorporateAccount.FCM) {
			return !(!validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError', invoiceNumberErrMsg)
			|| !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg));
		}
	}
	
	return true;
}

function validateWeightRate() {
	return validateInput(1, 'weigthFreightRate', 'weigthFreightRate', 'weigthFreightRateError', weightRateRequiredErrMsg);
}

function validateFixAmount() {
	if($('#chargeType').val() == CHARGETYPE_ID_FIX && configuration.allowZeroAmountInFixArticleType == 'true')
		return true;
	
	return $('#chargeType').val() != CHARGETYPE_ID_FIX 
		|| $('#chargeType').val() == CHARGETYPE_ID_FIX
		&& validateInput(1, 'fixAmount', 'fixAmount', 'packageError', fixAmountRequiredErrMsg);
}

/*
 * Validate Empty Input Feild
 */

function validateSourceBranchInput(event) {
	if(configuration.validateOnEveryFeild == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'sourceBranch', 'sourceBranch', 'sourceBranchError', sourceBranchErrMsg))
			return false;
	}

	return true;
}

function validateDeliveryInput(event) {

	if(configuration.validateOnEveryFeild == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'destination', 'destination', 'destinationError', destinationErrMsg))
			return false;
	} else if(configuration.showSubRegionwiseDestinationBranchField == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'subRegion', 'subRegion', 'subRegionError', subRegionErrMsg))
			return false;
	}

	return true;
}

function validateConsignorNameInput(event) {
	if(configuration.validateOnEveryFeild == 'true' || configuration.validateOnConsignorAndConsigneeNameField == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'consignorName', 'consignorName', 'consignorError', consinorNameErrMsg))
			return false;
	}

	return true;
}

function validateConsignorGstnInput(event) {
	return !(getKeyCode(event) == 13 && !validateLengthOfConsinorGSTNumber());
}

function validateConsigneeGstnInput(event){
	return !(getKeyCode(event) == 13 && !validateLengthOfConsineeGSTNumber());
}

function validateBillingGstnInput(event) {
	return !(getKeyCode(event) == 13 && !validateLengthOfBillingGSTNumber());
}

function validateGstInputOnGrandTotal() {
	if(configuration.validateGstInputOnGrandTotal == 'false')
		return true;

	let grandTotal 		= $('#grandTotal').val();
	let wayBillType		= getWayBillTypeId();
	let stPaidBy		= $('#STPaidBy').val();
	let	leastTaxableAmount	= 0;

	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
		
	if(!jQuery.isEmptyObject(jsondata.taxes))
		leastTaxableAmount	= Number(jsondata.taxes[0].leastTaxableAmount)

	if(configuration.validateGstInputOnGSTPaidBySelection == 'true') {
		if(grandTotal > leastTaxableAmount && Number(stPaidBy) == TAX_PAID_BY_CONSINGOR_ID) {
			if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
				return false;
		} else if (grandTotal > leastTaxableAmount && Number(stPaidBy) == TAX_PAID_BY_CONSINGEE_ID) {
			if(!validateInputTextFeild(10, consigneeGstnEle, consigneeGstnEle, 'info', gstnErrMsg))
				return false;
		}
	} else {
		if(Number(wayBillType) == WAYBILL_TYPE_PAID || Number(wayBillType) == WAYBILL_TYPE_CREDIT) {
			if(grandTotal > leastTaxableAmount && Number(stPaidBy) !== TAX_PAID_BY_TRANSPORTER_ID) {
				if(configuration.validateConsignmentOnExempted == 'true') {
					if(isConsignmentExempted == "false" || isConsignmentExempted == false) {
						if(configuration.partyExemptedChecking == 'true') {
							if(!isExempted && !validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
								return false;
						} else if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
							return false;
					}
				} else if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
					return false;
			}
		} else if(Number(wayBillType) == WAYBILL_TYPE_TO_PAY) {
			if(grandTotal > leastTaxableAmount && Number(stPaidBy) !== TAX_PAID_BY_TRANSPORTER_ID) {
				if(configuration.validateConsignmentOnExempted == 'true') {
					if(isConsignmentExempted == "false" || isConsignmentExempted == false) {
						if(configuration.partyExemptedChecking == 'true') {
							if(!isExempted && !validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
								return false;
						} else if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
							return false;
					}
				} else if(!validateInputTextFeild(10, consigneeGstnEle, consigneeGstnEle, 'info', gstnErrMsg))
					return false;
			}
		}
	}

	return true;
}

function validateConsignorMobileInput(event) {
	var billselection = $('#billSelection').val();
	
	if(configuration.ConsignorMobileNumberValidationOnWithOutBill == 'true') {
		if(configuration.validateOnEveryFeild == 'true' && configuration.ConsignorMobileNoValidate == 'true'){
			if(getKeyCode(event) == 13) {
				if(!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberErrMsg))
					return false;
				
				if (configuration.landlineNoAllowedInMobileNoFeild == 'false'
					&& configuration.ConsignorMobileNoLengthValidate == 'true' 
					&& !validateInput(5, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberLenErrMsg))
					return false;
			}
		}
	} else {
		if(Number(billselection) == BOOKING_WITH_BILL) {
			if(configuration.validateOnEveryFeild == 'true' && configuration.ConsignorMobileNoValidate == 'true'){
				if(getKeyCode(event) == 13){
					if(!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberErrMsg))
						return false;
						
					if (!validateInput(7, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsignorPhoneOrMobileNumber))
						return false;
				}
			}
		} else if(Number(billselection) == BOOKING_WITHOUT_BILL) {
			if(getKeyCode(event) == 13 && !validateInput(7, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsignorPhoneOrMobileNumber))
				return false;
		}
	}

	return true;
}

function validateConsigneeNameInput(event) {
	if(configuration.validateOnEveryFeild == 'true' || configuration.validateOnConsignorAndConsigneeNameField == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'consigneeName', 'consigneeName', 'consignorError', consineeNameErrMsg))
			return false;
	}

	return true;
}

function validateConsigneeMobileInput(event) {
	if(configuration.ConsigneeMobileNumberValidationOnWithOutBill == 'true') {
		if(configuration.validateOnEveryFeild == 'true' && configuration.ConsigneeMobileNoValidate == 'true'
			&& getKeyCode(event) == 13) {
			if(!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg))
				return $('#billSelectionText').html() == 'Bill'
				
			if (configuration.landlineNoAllowedInMobileNoFeild == 'false'
					&& configuration.ConsigneeMobileNoLengthValidate == 'true' 
					&& !validateInput(5, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberLenErrMsg))
				return false;
		}
	} else {
		let billselection = $('#billSelection').val();
		
		if(Number(billselection) == BOOKING_WITH_BILL) {
			if(configuration.validateOnEveryFeild == 'true' && configuration.ConsigneeMobileNoValidate == 'true'
				&& getKeyCode(event) == 13) {
				if(!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg))
					return $('#billSelectionText').html() == 'Bill'
					
				if (!validateInput(7, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsigneePhoneOrMobileNumber))
					return false;
			}
		} else if(Number(billselection) == BOOKING_WITHOUT_BILL) {
			if(getKeyCode(event) == 13 && !validateInput(7, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsigneePhoneOrMobileNumber))
				return false;
		}
	}


	return true;
}

function validateConsigneeTinNumberInput(event) {
	var billSelection = 0;

	if(jsondata.SHOW_BILL_SELECTION)
		billSelection = $('#billSelection').val();

	if(configuration.validateOnEveryFeild == 'true') {
		if(getKeyCode(event) == 13) {
			if(configuration.TinNumberValidateForConsignee == 'true') {
				if(configuration.isBranchWiseTinNumberValidateForConsignee == 'true') {/*
					var branchCodeList 	= configuration.branchCodeListForTinNumberValidateForConsignee;
					var branchList 		= new Array();
					branchList 			= branchCodeList.split(',');

					var checkBranch 	= isValueExistInArray(branchList, branchId);

					if(!checkBranch || checkBranch == 'undefined') {
						if(billSelection == BOOKING_WITHOUT_BILL) {
							if(configuration.ConsigneeTinNumberValidationOnWithOutBill == 'true') {
								if(!validateConsigneeTinNumber1()) {
									return false;
								}
							} else if (!validateLengthOfConsineeTinNumber()) {
								return false;
							}
						} else if(billSelection == BOOKING_WITH_BILL) {
							if(configuration.ConsigneeTinNumberValidationOnWithBill == 'true') {
								if(!validateConsigneeTinNumber1()) {
									return false;
								}
							} else if (!validateLengthOfConsineeTinNumber()) {
								return false;
							}
						}
					}
				*/} else {/*
					if(billSelection == BOOKING_WITHOUT_BILL) {
						if(configuration.ConsigneeTinNumberValidationOnWithOutBill == 'true') {
							if(!validateConsigneeTinNumber1()) {
								return false;
							}
						} else if (!validateLengthOfConsineeTinNumber()) {
							return false;
						}
					} else if(billSelection == BOOKING_WITH_BILL) {
						if(configuration.ConsigneeTinNumberValidationOnWithBill == 'true') {
							if(!validateConsigneeTinNumber1()) {
								return false;
							}
						} else if (!validateLengthOfConsineeTinNumber()) {
							return false;
						}
					}
				*/}
			} 
		}
	}

	if (!validateLengthOfConsineeTinNumber())
		return false;

	return true;
}

function validateTypeOfPackingInput(event) {
	if(configuration.validateOnEveryFeild == 'true' || configuration.validateOnConsignorAndConsigneeNameField == 'true') {
		if(getKeyCode(event) == 13) {
			if($('#packingTypeAutoCompleter').exists()
				&& !validateInput(1, 'packingTypeAutoCompleter', 'packingTypeAutoCompleter', 'packingTypeAutoCompleterError', articleTypeErrMsg))
					return false;
			
			if($('#typeofPacking').exists() && !validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error', articleTypeErrMsg))
				return false;
			
			if($('#typeofPackingId').exists() && !validateInputTextFeild(1, 'typeofPackingId', 'typeofPacking', 'error', articleTypeErrMsg))
				return false;
		}
	}

	return true;
}

function validatePackingGroupChecking(){

	var typeofPackingId		= $('#typeofPacking').val();
	var typeofPackingVal	= $('#typeofPacking option:selected').text();
	
	if(configuration.isPackingGroupCheckingAllowed == 'true'){
		var wayBillTypeIdList 	= (configuration.waybillTypeIdForPackingGroupChecking).split(',');
		var checkWayBillType 	= isValueExistInArray(wayBillTypeIdList, getWayBillTypeId());

		if(checkWayBillType){
			for(const element of PackingGroupMappingArr) {
				//PackingGroup - for Konduskar packing Group 	Document	2
				if(element.packingTypeMasterId == typeofPackingId && element.packingGroupTypeId == 2) {
					showMessage('error', packingGroupError(typeofPackingVal));
					$('#packingTypeAutoCompleter').val('');
					$('#typeofPacking').val(0);
					return false;
				}
			}
		}
	}
	return true;

} 

function validateSaidToContainInput(event) {

	if(configuration.validateOnEveryFeild == 'true' && configuration.SaidToContainValidate == 'true'){
		if(getKeyCode(event) == 13){
			if($('#saidToContainSelect').exists() && $('#saidToContainSelect').is(":visible")) {
				if(!validateInputTextFeild(1, 'saidToContainSelect', 'saidToContainSelect', 'error', saidToContaionErrMsg))
					return false;
			} else if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg))
				return false;
		}
	}

	return true;
}

function validateActualWeightInput(event) {
	return !(configuration.validateOnEveryFeild == 'true' && configuration.ActualWght == 'true'
		&& getKeyCode(event) == 13 && !validateInput(1, 'actualWeight', 'actualWeight', 'actualWeightError', actWeightErrMsg));
}

function validateWeigthFreightRateInput(event) {
	return !(configuration.validateOnEveryFeild == 'true'
		&& getKeyCode(event) == 13 && !validateInput(1, 'weigthFreightRate', 'weigthFreightRate', 'weigthFreightRateError', wgtFrghtRateErrMsg));
}

function validateFormNumberInput(event) {
	return !(configuration.validateFormNumberInput == 'true'
		&& getKeyCode(event) == 13 && !validateInput(1, 'formNumber', 'formNumber', 'formNumber', wayBillNumberErrMsg));
}

function validateESugamNumberInput(event) {
	if(configuration.validateESugamNumberInput == 'true' && getKeyCode(event) == 13) {
		if(!validateInput(1, 'sugamNumber', 'sugamNumber', 'sugamNumber', eSugamNumberErrMsg)
		|| !validateInput(4, 'sugamNumber', 'sugamNumber', 'sugamNumber', eSugamNumberLenErrMsg))
			return false;
	}

	return true;
}

function validateSaidToContainOnDeclaredValue() {
	var declaredMinimumAmount	= minimumDeclareValue();

	if(Number($('#declaredValue').val()) > Number(declaredMinimumAmount)) {
		var temp = _.filter(cnsgnmentGoodsId, function(num){return num.split("_")[0] != 0});
		var flag = temp && temp.length;
		
		if(!flag ){ //for empty
			showMessage('error', 'Said To contain Required !');
			return false;
		}
	}
	
	return true;
}

function validateEWayBillNumberOnDeclareValue(event) {
	var bookingType 	= getValueFromInputField('bookingType');
	
	if(configuration.doNotValidateEwayBillNumberOnDeclareValue == "true" || (configuration.doNotValidateEwayBillNumberOnDeclareValueOnDDDVBooking == "true" && bookingType == DIRECT_DELIVERY_DIRECT_VASULI_ID))
		return false;
	
	if(configuration.isShowSingleEwayBillNumberField == 'true') {
		var declaredMinimumAmount	= minimumDeclareValue();
		
		if(configuration.selectEWayBillONDeclaredValue == 'true' && $('#singleFormTypes').val() == E_WAYBILL_ID) {
			if(configuration.FormsWithSingleSlection == 'true' && $('#singleFormTypes').val() == E_WAYBILL_ID && $('#declaredValue').val() > declaredMinimumAmount) {
				if(typeof event != undefined && typeof event != 'undefined') {
					if(consignmentEWayBillExemptedObj != undefined && !jQuery.isEmptyObject(consignmentEWayBillExemptedObj)
						&& (Object.values(consignmentEWayBillExemptedObj)[0] == 'true' || Object.values(consignmentEWayBillExemptedObj)[0] == true))
						return true;
					else if(getKeyCode(event) == 13) {
						if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', eWayBillNumberErrMsg))
							return false;
						else if(!validateEWaybillNumLength())
							return false;
					}
				} else if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', eWayBillNumberErrMsg))
					return false;
				else if(!validateEWaybillNumLength())
					return false;
			}
			
			if( $('#ewayBillNumber').val() != '') {
				if(!validateEWaybillNumLength())
					return false;
				else if(typeof event != undefined && typeof event != 'undefined' && getKeyCode(event) == 13) {
					if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', eWayBillNumberErrMsg))
						return false;
					else if(!validateEWaybillNumLength())
						return false;
				}
			}
		} else if(configuration.selectHSNCodeOnDeclaredValue == 'true' && $('#singleFormTypes').val() == HSN_CODE) {
			if($('#declaredValue').val() > declaredMinimumAmount) {
				if(typeof event != undefined && typeof event != 'undefined') {
					if(getKeyCode(event) == 13
						&& !validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
							return false;
				} else if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
					return false;
			} else
				return true;
		} else if(configuration.selectEWayBillONDeclaredValue == 'true' && configuration.selectHSNCodeOnDeclaredValue == 'true' &&  $('#declaredValue').val() > declaredMinimumAmount){
			if($('#singleFormTypes').val() != E_WAYBILL_ID && $('#singleFormTypes').val() != HSN_CODE) {
				showMessage('error', formTypeSelectionErrorMsg);
				return false;
			} else if($('#singleFormTypes').val() != E_WAYBILL_ID && $('#ewayBillNumber').val() == '') {
				showMessage('error', eWayBillNumberErrMsg);
				return false;
			} else if($('#singleFormTypes').val() != HSN_CODE && $('#ewayBillNumber').val() == '') {
				showMessage('error', hsnCodeErrorMsg);
				return false;
			}
		} else if(configuration.FormsWithSingleSlection != 'true' && configuration.FormsWithMultipleSelection == 'true') {
			var formTypeArray	= getAllCheckBoxSelectValue('multiselect_formTypes');
				
			if(isValueExistInArray(formTypeArray, E_WAYBILL_ID)) {
				if(typeof event == undefined || typeof event == 'undefined') {
					if(!validateInput(1, 'formNumber', 'formNumber', 'formNumber', eWayBillNumberErrMsg))
						return false;
					else if(!validateEWaybillNumLength())
						return false;
				} else {
					if(getKeyCode(event) == 13){
						if(!validateInput(1, 'formNumber', 'formNumber', 'formNumber', eWayBillNumberErrMsg))
							return false;
					} else if(!validateEWaybillNumLength())
						return false;
				}
			}
		} else {
			if(Number($('#singleFormTypes').val()) == E_WAYBILL_ID) {
				if(typeof event == undefined || typeof event == 'undefined') {
					if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', eWayBillNumberErrMsg))
						return false;
					else if(!validateEWaybillNumLength())
						return false;
				} else if(getKeyCode(event) == 13) {
					if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', eWayBillNumberErrMsg))
						return false;
				} else if(!validateEWaybillNumLength())
					return false;
			}
				
			if(Number($('#singleFormTypes').val()) == HSN_CODE) {
				if(typeof event == undefined || typeof event == 'undefined') {
					if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
						return false;
				} else if(getKeyCode(event) == 13 && !validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
					return false;
			}
		}
		
		return true;
	} else {
		validateEWayBillNumberOnDeclareValueOnSave(event);
	}
}

function validateBillingPartyNameInput(event) {
	if(configuration.validateOnEveryFeild == 'true' || configuration.validateOnConsignorAndConsigneeNameField == 'true') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'billingPartyName', 'billingPartyName', 'billingPartyNameError', billingPartyErrMsg))
			return false;
	}

	return true;
}

function validateInvoiceNoInput(event) {
	let billType = 0;

	if($('#billSelection').val() != undefined)
		billType = $('#billSelection').val()
	
	if($('#billSelection').val() == undefined)
		billType = Number(configuration.defaultBillSelectionId);
	
	if(configuration.validateOnEveryFeild == 'true'
		&& billType == BOOKING_WITH_BILL
		&& getKeyCode(event) == 13 
		&& !validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg))
				return false;
	
	if(configuration.invoceNumberSameAsPrivatMarka == 'true')
		$("#privateMark").val($("#invoiceNo").val());
	
	return true;
}

function validateDeclaredValueInput(event) {
	let billType = 0;

	if($('#billSelection').val() != undefined)		
		billType = $('#billSelection').val()
	
	if($('#billSelection').val() == undefined)
		billType = Number(configuration.defaultBillSelectionId);
	
	return !(configuration.validateOnEveryFeild == 'true'
		&& billType == BOOKING_WITH_BILL 
		&& getKeyCode(event) == 13 
		&& !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg));
}

function validateDeclaredValueBillWise() {
	let billType = 0;

	if($('#billSelection').val() != undefined)
		billType = $('#billSelection').val()

	if($('#billSelection').val() == undefined)		
		billType = Number(configuration.defaultBillSelectionId);
	
	return !(configuration.validateOnEveryFeild == 'true'
		&& billType == BOOKING_WITH_BILL 
		&& !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg));
}

function validateWeigthFreightRate() {
	let freight 		= $('#charge1').val();
	let wayBillType		= getWayBillTypeId();

	return !(freight <= 0 && $('#chargeType').val() == 1 && configuration.allowZeroAmountInTBB == 'false'
		&& configuration.validateOnEveryFeild == 'true'
		&& Number(wayBillType) != WAYBILL_TYPE_FOC 
		&& !(configuration.doNotAllowToBookTopayLRWithAmount == 'true' && Number(wayBillType) == WAYBILL_TYPE_TO_PAY)
		&& !validateInput(1, 'weigthFreightRate', 'weigthFreightRate', 'weigthFreightRateError', wgtFrghtRateErrMsg));
}

function destinationValidationForReverseEntry() {
	resetDestination();
	resetSourceBranch();
	setLoggedBranchInDestinationBranch();
	
	return validateInput(1, 'destination', 'destination', 'basicError', destinationErrMsgForRevereEntry);
}

function validateFreightUptoInput(event) {
	return !(configuration.FreightUptoValidate == 'true'
		&& getKeyCode(event) == 13 && !validateInput(1, 'freightUptoBranch', 'freightUptoBranch', 'freightUptoBranchError', frieghtUptoDestinationErrMsg));
}

function validateDoorDeliverySelection() {
	if(configuration.ValidateDoorDeliverySelectionAfterRateApplied == 'true') {
		let deliveryTo		= $('#deliveryTo').val();
		let doorDlyAmt		= parseInt(getValueFromInputField('charge' + DOOR_DELIVERY_BOOKING));

		if(doorDlyAmt > 0 && deliveryTo != DELIVERY_TO_DOOR_ID) {
			showMessage('error', doorDeliveryErrMsg);
			$('#deliveryTo').focus();
			return false;
		}
	}

	return true;
}

function validatePanNumber() {
	enableButton();
	
	if (configuration.PanNumber == 'true' || tdsConfiguration.IsPANNumberRequired) {
		if(configuration.PanNumberValidate == 'true' && isPanNumberRequired && !validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', panNumberErrMsg))
			return false;
		
		if($('#tdsAmount').val() > 0 && tdsConfiguration.IsPANNumberMandetory && !validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', panNumberErrMsg)) {
			showMessage('error', panNumberErrMsg);
			return false;
		}

		if(!validateInputTextFeild(8, 'panNumber', 'panNumber', 'info', validPanNumberErrMsg)) {
			setValueToTextField('panNumber', '');
			return false;
		}
		
	}

	return true;
}

function validateTanNumber() {
	enableButton();
	
	if (configuration.TanNumber == 'true' || tdsConfiguration.IsTANNumberRequired) {
		if($('#tdsAmount').val() > 0 && tdsConfiguration.IsTANNumberMandetory
			&& !validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', tanNumberErrMsg))
				return false;

		if(!validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'info', validTanNumberErrMsg)) {
			setValueToTextField('tanNumber', '');
			return false;
		}
	}

	return true;
}

function checkForDoorDeliveryForDeliveryLocations() {
	if(configuration.checkForDoorDeliveryForDeliveryLocations == 'true') {
		let bookingType 	= getValueFromInputField('bookingType');
		let typeOfLocation  = getValueFromInputField('typeOfLocation');
		let deliveryTo		= getValueFromInputField('deliveryTo');

		if(bookingType != DIRECT_DELIVERY_DIRECT_VASULI_ID) {
			if(typeOfLocation == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
				if(deliveryTo != DELIVERY_TO_DOOR_ID) {
					showMessage('error', doorDeliveryErrMsg);
					//changeTextFieldColor('deliveryTo', '', '', 'red');
					return false;
				} else {
					hideAllMessages();
					changeTextFieldColorWithoutFocus('deliveryTo', '', '', 'green');
					return true;
				}
			}
		}
	}
	
	return true;
}

function showAlertForDeclaredValue() {
	if(configuration.DeclaredValueAlertMessage == 'true') {
		var declaredValue	= $('#declaredValue').val();

		if(declaredValue == 0)
			alert('Declared Value not entered !');
	}
}

function commodityTypeValidation(event) {
	if (configuration.CommodityType != 'true')
		return true;

	if(typeof event != 'undefined') {
		if(getKeyCode(event) == 13 && !validateInput(1, 'commodityType', 'commodityType', 'consignmentError', commodityTypeErrMsg))
			return false;
	} else if(!validateInput(1, 'commodityType', 'commodityType', 'consignmentError', commodityTypeErrMsg))
		return false;

	return true;
}

function checkManualLRLengthValidation(){
	let  isLengthcheck = false ;
	let allowedLenghtForManualLR = configuration.allowedLenghtForManualLR;
	
	if(configuration.manualLRLengthValidation == 'true') {
		let LrNumber = $('#lrNumberManual').val();
		
		if(isManualWayBill) {
			if(configuration.DestinationRegionWiseManualLrLengthNeeded == 'true') {
				let regionList 	= (configuration.destinationRegionIds).split(',');
				let	regionId	= $('#destinationRegionId').val();
				let checkRegion = isValueExistInArray(regionList, regionId);
				
				if(checkRegion)
					allowedLenghtForManualLR = 6;
				
				isLengthcheck = true;
			} else if(configuration.branchSubRegionWiseManualLrLengthNeeded == 'true' && Number($('#SequenceTypeSelection').val()) == 2) {
				let subregionList 	= (configuration.branchSubRegionIds).split(',');
				let	subRegionId		= executive.subRegionId;
				let checkSubRegion  = isValueExistInArray(subregionList, subRegionId);
				
				if(checkSubRegion) {
					allowedLenghtForManualLR = 7;
					isLengthcheck = true;
				} else
					isLengthcheck = false;
			}
			
			if(LrNumber.length != Number(allowedLenghtForManualLR) && isLengthcheck) {
				showMessage('error', 'LR Number length should  be Equal to  '+Number(allowedLenghtForManualLR)+' !');
				setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
				return false;
			}
		}
	}
	
	return true;
}

function validateRemarkOnCharge(chargeId){
	if(configuration.wayBillChargeWiseRemarkNeeded == 'false')
		return true;

	var chargeValue = $('#charge'+chargeId).val();

	if(chargeValue > 0){
		let chargeRemark = $('#remark_' + chargeId).val();
		
		if(chargeRemark == "") {
			changeTextFieldColorWithoutFocus('remark_' + chargeId, '', '', 'red');
			$('#remark_' + chargeId).focus();
			showMessage('info', chargeRemarkError);
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus('remark_' + chargeId, '', '', 'green');
		}
	} 
	
	return true;
}

function validateServiceType(){
	if(configuration.ServiceType == 'false')
		return true;

	var serviceTypeId = $('#serviceType').val();
	
	if(serviceTypeId == ServiceTypeConstant.SERVICE_TYPE_EXPRESS_ID) {
		var chargeValue	= $('#charge' + EXPRESS_CHARGE).val();
		
		if(chargeValue <= 0) {
			changeTextFieldColorWithoutFocus('charge' + EXPRESS_CHARGE, '', '', 'red');
			$('#charge' + EXPRESS_CHARGE).focus();
			showMessage('info',expressChargeErr);
			return false;
		}
	}
	
	return true;
}

function validateConsignorPincode(event) {
	if(typeof event != 'undefined') {
		if(getKeyCode(event) == 13) {
			if(!validateInputTextFeild(11, 'consignorPin', 'consignorPin', 'info', pincodeLengthInfoMsg))
				return false;
			
			isValidationError	= false;
		}
	} else if(isInsuranceServiceAllow && getWayBillTypeId() != WAYBILL_TYPE_TO_PAY && $('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val() > 0
		&& !validateInputTextFeild(1, 'consignorPin', 'consignorPin', 'error', consignorPincodeErrMsg)) {
		return false;
	}
	
	return true;
}

function validateConsigneePincode(event) {
	if(typeof event != 'undefined') {
		if(getKeyCode(event) == 13) {
			if(configuration.ValidateConsigneePincode == 'true' || isInsuranceServiceAllow && getWayBillTypeId() == WAYBILL_TYPE_TO_PAY && $('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val() > 0) {
				if(!validateInputTextFeild(1, 'consigneePin', 'consigneePin', 'error', consigneePincodeErrMsg)) {
					isValidationError	= true;
					return false;
				} else if(!validateInputTextFeild(11, 'consigneePin', 'consigneePin', 'info', pincodeLengthInfoMsg))
					return false;
			} 
			
			if(configuration.MatchConsigneePincodeWithDestinationBranchPincode == 'true') {
				if(typeof branchPincodeConfigList == 'undefined') {
					//$('#consigneePin').val('');
					isValidationError	= true;
					showMessage('error', iconForErrMsg + ' Please configure pincode for Destination Branch !');
					return false;
				} else if(!branchPincodeConfigList.includes(Number($('#consigneePin').val()))) {  // branchPincodeConfigList defined in commonFunctionForCreateWayBill.js
					//$('#consigneePin').val('');
					isValidationError	= true;
					showMessage('error', validConsigneePincodeErrMsg);
					return false;
				} else
					updatePartyPincode('consigneeName');
			} else
				updatePartyPincode('consigneeName');
			
			isValidationError	= false;
		}
	} else {
		if((configuration.ValidateConsigneePincode == 'true' || isInsuranceServiceAllow && getWayBillTypeId() == WAYBILL_TYPE_TO_PAY && $('#charge' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).val() > 0)
		&& !validateInputTextFeild(1, 'consigneePin', 'consigneePin', 'error', consigneePincodeErrMsg)) {
			$('#consigneePin').val('');
			return false;
		}
		
		if(configuration.MatchConsigneePincodeWithDestinationBranchPincode == 'true') {
			if(typeof branchPincodeConfigList == 'undefined') {
				$('#consigneePin').val('');
				showMessage('error', iconForErrMsg + ' Please configure pincode for Destination Branch !');
				return false;
			} else if(!branchPincodeConfigList.includes(Number($('#consigneePin').val()))) {  // branchPincodeConfigList defined in commonFunctionForCreateWayBill.js
				$('#consigneePin').val('');
				showMessage('error', validConsigneePincodeErrMsg);
				return false;
			} else
				updatePartyPincode('consigneeName');
		} else
			updatePartyPincode('consigneeName');
	}
	
	return true;
}

function validatePincodeOnPopup() {
	if(configuration.ValidateConsigneePincode == 'true'
		&& !validateInput(1, 'newPartyPincode', 'newPartyPincode', 'newPartyPincode',  consigneePincodeErrMsg))
			return false;
	
	if(configuration.MatchConsigneePincodeWithDestinationBranchPincode == 'true') {
		if(typeof branchPincodeConfigList == 'undefined') {
			$('#newPartyPincode').val('');
			showMessage('error', iconForErrMsg + ' Please configure pincode for Destination Branch !');
			return false;
		} else if(!branchPincodeConfigList.includes(Number($('#newPartyPincode').val()))) {  // branchPincodeConfigList defined in commonFunctionForCreateWayBill.js
			$('#newPartyPincode').val('');
			showMessage('error', validConsigneePincodeErrMsg);
			return false;
		}
	}

	return true;
}

function validateShortCreditAllowOnTxnType(){
	if(configuration.validateShortCreditAllowOnTxnType == 'true' && getWayBillTypeId() == WAYBILL_TYPE_PAID && Number($('#paymentType').val()) == PAYMENT_TYPE_CREDIT_ID && !isManualWayBill) {
		if(Number($('#partyMasterId').val()) == 0){
			if(!jsondata.ALLOW_SHORT_CREDIT_BOOKING_FOR_GENERAL_PARTY) {
				showMessage('error', " You Are Not Allowed For Short Credit Booking  For General Party !");
				return false;
			}
		} else if(Number($('#paymentType').val()) == PAYMENT_TYPE_CREDIT_ID && !(Number($('#shortCreditAllowOnTxnType').val()) == CorporateAccount.SHORT_CREDIT_TXN_TYPE_BOOKING_STRING || Number($('#shortCreditAllowOnTxnType').val()) == CorporateAccount.SHORT_CREDIT_TXN_TYPE_BOTH_NAME_STRING)) {
			showMessage('error', "Short Credit Booking Not Allowed For This Party !");
			return false;
		}
	}
	
	if(configuration.validateShortCreditAllowOnTxnTypeWithSubRegion == 'true') {
		var	subRegionId			= executive.subRegionId;
		var subregionList 		= (configuration.subRegionIdsForShortCredit).split(',');
		var checkSubRegion 		= isValueExistInArray(subregionList, subRegionId);
		
		if(getWayBillTypeId() == WAYBILL_TYPE_PAID) {
			if(checkSubRegion && Number($('#paymentType').val()) == PAYMENT_TYPE_CREDIT_ID 
					&& !(Number($('#shortCreditAllowOnTxnType').val()) == CorporateAccount.SHORT_CREDIT_TXN_TYPE_BOOKING_STRING || Number($('#shortCreditAllowOnTxnType').val()) == CorporateAccount.SHORT_CREDIT_TXN_TYPE_BOTH_NAME_STRING) ) {
				showMessage('error', "Short Credit Booking Not Allowed For This Party !");
				return false;
			}
		}
	}
	
	if(configuration.showShortCreditOutstandingAmount == "true")
		getShortCreditDueAmount();

	return true;
}

function validateConsignorNameInputOnBlur(){
	if((configuration.NewPartyAutoSave == 'false' || (configuration.addNewPartyPermissionBased == 'true' && !jsondata.PARTY_AUTO_SAVE)) 
			&& configuration.ConsignorValidate == 'true' && configuration.GeneralPartyAllowed == 'false'){
		if (configuration.ConsignorNameAutocomplete == 'true') {
			var consignorCorpId	= 0;
			
			if(getWayBillTypeId() == WAYBILL_TYPE_CREDIT)
				consignorCorpId	= Number($('#consignorCorpId').val());
			else
				consignorCorpId	= Number($('#partyMasterId').val());
			
			if (configuration.ConsignorNameAutocomplete == 'true') {
				if(consignorCorpId == 0) {
					setTimeout(function() { 
						$('#consignorName').focus(); 
						showMessage('error', " Please Select Party From Suggestion !");	
						$('#consignorName').val(''); 
					}, 200);
					
					return false;
				}
			}
		}
	}
}

function validateConsigneeNameInputOnBlur(){
	if((configuration.NewPartyAutoSave == 'false' || (configuration.addNewPartyPermissionBased == 'true' && !jsondata.PARTY_AUTO_SAVE)) 
			&& configuration.ConsigneeValidate == 'true' && configuration.GeneralPartyAllowed == 'false'){
		if (configuration.ConsigneeNameAutocomplete == 'true') {
			if(Number($('#consigneePartyMasterId').val()) == 0) {
				setTimeout(function(){ 
					$('#consigneeName').focus(); 
					showMessage('error', " Please Select Party From Suggestion !");	
					$('#consigneeName').val(''); 
				}, 200);
				
				return false;
			}
		}
	}
}

function validateEWaybillNumLength(){
	return validateInputTextFeild(12, 'ewayBillNumber', 'ewayBillNumber', 'error', 'Please Enter 12 digit E-Waybill Number');
}

function validateAdditionalRemark(){
	if(configuration.packingTypeWiseAdditionalRemarkRequired == 'false')
		return true;
	
	var packingTypeId			= 0;
	var packingTypeIdList 		= configuration.packingTypeIdsForRemark.split(',');
	
	if(consigAddedtableRowsId.length > 0){
		for(const element of consigAddedtableRowsId){
			packingTypeId 			= parseInt($('#typeofPackingId' + element).html());
			var checkPackingType	= isValueExistInArray(packingTypeIdList, packingTypeId);
		
			if(checkPackingType){
				var additionalremark	= $('#additionalremark').val();
		
				if(additionalremark == ''){
					setTimeout(function(){ 
						$('#additionalremark').focus(); 
						showMessage('error', " Please Enter Additional Remark !");	
					}, 200);
					
					return false;
				}
			}
		}
	}
	
	return true;
	  
}

function validateTBBPartyInput() {
	if(configuration.isValidBillingParty == 'true'){
		var partyname = $('#billingPartyName').val();
		
		if( partyname == '' || partyname == undefined || partyname == null || partyname == 'No Record Found'){
			setTimeout(function(){ 
				$('#billingPartyName').focus(); 
				showMessage('error', " Please Enter Valid Billing Party !");	
			}, 200);
			return false;
		}
	}
	
	return true;
}

function validateEwayBillInput(filter, elementID, errorElementId, errorId, errorMsg) {
	var element = document.getElementById(elementID);
	
	if(!element) {
		console.log('Element not found');
		return true;
	}
		
	if (element.value == '' || element.value == 0 || element.value < 0) {
		showMessage('error', errorMsg);
		changeError1(errorElementId, '0', '0');
		$('#addMutipleEwayBill').focus();
		isValidationError=true;
				
		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
	}
}

function isSameStateForEWayBill() {
	var stateIdArr				= (configuration.stateIdForEwayBillAmountAboveOneLakh).split(',');
	var exeBranchStateCheck		= isValueExistInArray(stateIdArr, executive.stateId);
	var destBranchStateCheck	= isValueExistInArray(stateIdArr, Number($('#destinationStateId').val()));
	
	return configuration.selectEwayBillByStateId == 'true' && destBranchStateCheck &&
				exeBranchStateCheck && executive.stateId == Number($('#destinationStateId').val());
}

function minimumDeclareValue() {
	if(isSameStateForEWayBill())
		return Number(configuration.declaredValueSelectEwayBillByStateId);

	return Number(configuration.declaredValueForSelectEwayBill);
}

function validateEWayBillNumberOnDeclareValueOnSave(event) {
	var bookingType 	= getValueFromInputField('bookingType');
	
	if((configuration.doNotValidateEwayBillNumberOnDeclareValue == "true" || configuration.doNotValidateEwayBillNumberOnDeclareValue == true) || ((configuration.doNotValidateEwayBillNumberOnDeclareValueOnDDDVBooking == "true" || configuration.doNotValidateEwayBillNumberOnDeclareValueOnDDDVBooking == true) && bookingType == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID))
		return true;
	
	if(configuration.ShowEwaybillExemptedOption == 'true' && !validateEwayBillNo())
		return true;
	
	if(configuration.validateSaidToContainOnDeclaredValue == 'true' && !validateSaidToContainOnDeclaredValue())
		return false;
	
	var declaredMinimumAmount 	= Number(configuration.declaredValueForSelectEwayBill);
	var eWayBillNumber			= checkBoxArray.join(',');
	
	if(configuration.selectEWayBillONDeclaredValue == 'true' && configuration.selectHSNCodeOnDeclaredValue == 'false' && $('#declaredValue').val() > declaredMinimumAmount){
		$('#singleFormTypes').val(E_WAYBILL_ID);
		
		if(eWayBillNumber == null || eWayBillNumber == '')
			showEWaybillNumberFormType();
	}
	
	if(configuration.selectEWayBillONDeclaredValue == 'true' && $('#singleFormTypes').val() == E_WAYBILL_ID) {
		if(isSameStateForEWayBill()) {
			//do not do anything
		} else if(configuration.FormsWithSingleSlection == 'true' && $('#singleFormTypes').val() == E_WAYBILL_ID && $('#declaredValue').val() > declaredMinimumAmount) {
			if(typeof event != undefined && typeof event != 'undefined') {
				if(consignmentEWayBillExemptedObj != undefined && !jQuery.isEmptyObject(consignmentEWayBillExemptedObj))
					isConsignmentEWayBillExempted 	= Object.values(consignmentEWayBillExemptedObj)[0];
					
				if((getKeyCode(event) == 13) && (isConsignmentEWayBillExempted == false || isConsignmentEWayBillExempted == 'false')) {
					if(eWayBillNumber == null || eWayBillNumber == '') {
						showMessage('error', eWayBillNumberErrMsg);
						//changeError1('addMutipleEwayBill', '0', '0');
						$('#addMutipleEwayBill').focus();
						isValidationError=true;
						return false;
					} else {
						hideAllMessages();
						//removeError('ewayBill0');
					}
				}
			} else {
				if(configuration.isAllowEWayBillExemptedValidation == 'true') {
					if(noOfArticlesAdded >= 1 && counterForNonEmpty > 0) {
						if(consignmentEWayBillExemptedObj != undefined && !jQuery.isEmptyObject(consignmentEWayBillExemptedObj))
							isConsignmentEWayBillExempted 	= Object.values(consignmentEWayBillExemptedObj)[0];
		
						if(isConsignmentEWayBillExempted == false || isConsignmentEWayBillExempted == 'false') {
							if(eWayBillNumber == null || eWayBillNumber == '') {
								showMessage('error', 'Enter E-Way Bill Number');
								$('#addMutipleEwayBill').focus();
								isValidationError=true;
								return false;
							} else
								hideAllMessages();
						}
					} else {
						showMessage('error', 'Said To contain Required !');
						return false;
					}
				} else if(eWayBillNumber == null || eWayBillNumber == '') {
					showMessage('error', 'Enter E-Way Bill Number');
					$('#addMutipleEwayBill').focus();
					isValidationError=true;
					return false;
				}
				
				hideAllMessages();
			}
		}
	} else if(configuration.selectHSNCodeOnDeclaredValue == 'true' && $('#singleFormTypes').val() == HSN_CODE) {
		if($('#declaredValue').val() > declaredMinimumAmount) {
			if(typeof event != undefined && typeof event != 'undefined') {
				if(getKeyCode(event) == 13 && !validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
					return false;
			} else if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
				return false;
		} else
			return true;
	} else if(configuration.selectEWayBillONDeclaredValue == 'true' && configuration.selectHSNCodeOnDeclaredValue == 'true' &&  $('#declaredValue').val() > declaredMinimumAmount){
		if($('#singleFormTypes').val() != E_WAYBILL_ID && $('#singleFormTypes').val() != HSN_CODE) {
			showMessage('error', formTypeSelectionErrorMsg);
			return false;
		} else if($('#singleFormTypes').val() != E_WAYBILL_ID && $('#ewayBillNumber').val() == '') {
			showMessage('error', eWayBillNumberErrMsg);
			return false;
		} else if($('#singleFormTypes').val() != HSN_CODE && $('#ewayBillNumber').val() == '') {
			showMessage('error', hsnCodeErrorMsg);
			return false;
		}
	} else if(configuration.FormsWithSingleSlection != 'true' && configuration.FormsWithMultipleSelection == 'true') {
		let formTypeArray	= getAllCheckBoxSelectValue('multiselect_formTypes');
			
		if(isValueExistInArray(formTypeArray, E_WAYBILL_ID)) {
			if(typeof event == undefined || typeof event == 'undefined') {
				if(!validateInput(1, 'formNumber', 'formNumber', 'formNumber', eWayBillNumberErrMsg)
				|| !validateEWaybillNumLength())
					return false;
			} else if(getKeyCode(event) == 13) {
				if(!validateInput(1, 'formNumber', 'formNumber', 'formNumber', eWayBillNumberErrMsg))
					return false;
			} else if(!validateEWaybillNumLength())
				return false;
		}
	} else {
		if(Number($('#singleFormTypes').val()) == E_WAYBILL_ID) {
			if(typeof event == undefined || typeof event == 'undefined') {
				if(eWayBillNumber == null || eWayBillNumber == '') {
					showMessage('error', eWayBillNumberErrMsg);
					changeError1('addMutipleEwayBill', '0', '0');
					$('#addMutipleEwayBill').focus();
					isValidationError=true;
					return false;
				}
			} else if(getKeyCode(event) == 13){
				if(eWayBillNumber == null || eWayBillNumber == '') {
					showMessage('error', eWayBillNumberErrMsg);
					changeError1('addMutipleEwayBill', '0', '0');
					$('#addMutipleEwayBill').focus();
					isValidationError=true;
					return false;
				}
			}
				
			hideAllMessages();
			removeError('ewayBill0');
		}
			
		if(Number($('#singleFormTypes').val()) == HSN_CODE) {
			if(typeof event == undefined || typeof event == 'undefined') {
				if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
					return false;
			} else if(getKeyCode(event) == 13) {
				if(!validateInput(1, 'ewayBillNumber', 'ewayBillNumber', 'ewayBillNumber', hsnCodeErrorMsg))
					return false;
			}
		}
	}
	
	return true;
}

function validateDateDestOvernitecarrier(){
	
	if(configuration.isAllowPaidLrsOnlyForOvernightCarrier =='true'){
		var subRegionId 			= $('#destinationSubRegionId').val();
		var overNiteSubRegionIdList = subRegionIdsForOverNite.split(',');
		
		if(getWayBillTypeId() != WAYBILL_TYPE_PAID){
			if(isValueExistInArray(overNiteSubRegionIdList, subRegionId)){
				setTimeout(function(){ 
					$('#destination').focus(); 
					showMessage('info', " Your Are  Allowed To Booked For Paid LR Only !");	
				}, 200);
				return false;
			}
		}
	}
	
	return true;
}

function validateDeliveryToForOvernightFreightCarriers(){
	if(configuration.isOnlyDoorDeliveryAllowedForOvernightCarrier =='true'){
		var subRegionId 			= $('#destinationSubRegionId').val();
		var overNiteSubRegionIdList = subRegionIdsForOverNite.split(',');
		
		if(isValueExistInArray(overNiteSubRegionIdList, subRegionId)){
			if($('#deliveryTo').val() != DELIVERY_TO_DOOR_ID){
				setTimeout(function(){ 
					$('#deliveryTo').focus();
					showMessage('info', " Your Are  Allowed To Booked For Door Delivery Lrs Only !");	
				}, 200);
				return false;
			}
		}
	}
	return true;
}

function validateSourceDestinationBranchAbbrevation(){
	if(!isManualWayBill && configuration.branchAbbrevationWiseWayBillNumberGenerationAllow =='true'){
		if((loggedInBranch.abbrevationName == undefined || loggedInBranch.abbrevationName == 'undefined') 
				|| destBranch != null && (destBranch.abbrevationName == undefined || destBranch.abbrevationName == 'undefined')) {
			showMessage('info', " Branch Abbrevation Code Missing for Source Or destination ! Update Branch Abbrevation and Try Again !");	
			return false;
		}
	}
	
	return true;
}


function validateDoorDeliveryChargeToRegionWiseMinValue(){
	if(configuration.regionWiseDoorDeliveryChargeSet == true || configuration.regionWiseDoorDeliveryChargeSet =='true'){
		var regionIdsForDoorDeliveryChargeSet = configuration.regionIdesForDoorDeliveryChargeSet;
		var regionId 				= $('#destinationBranchId').val();
		var regionIdListForCheckDD	= regionIdsForDoorDeliveryChargeSet.split(',');
		var doorDeliveryValue		= $('#charge'+DOOR_DELIVERY_BOOKING).val();
		
		if(Number(doorDeliveryValue) < 10 && isValueExistInArray(regionIdListForCheckDD, regionId)){
			if((getWayBillTypeId() == WAYBILL_TYPE_PAID || getWayBillTypeId() == WAYBILL_TYPE_TO_PAY)
					&& $('#deliveryTo').val() == DELIVERY_TO_DOOR_ID){
				showMessage("error","You Can not Enter Door Delivery Amount Less than 10.");
				changeError1('charge'+DOOR_DELIVERY_BOOKING, '0', '0');
				$('#charge'+DOOR_DELIVERY_BOOKING).focus();
				
				setTimeout(function(){ 
					$('#charge'+DOOR_DELIVERY_BOOKING).focus();	
				}, 100);
				
				return false;
			}
		} else {
			removeError('charge'+DOOR_DELIVERY_BOOKING);
			return true;
		}
	} 
	
	return true;
}

function validateGstNoInputOnGrandTotal() {
	let grandTotal 		= $('#grandTotal').val();
	
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
	
	if(configuration.validateGstNoInputOnGrandTotal == 'true' && (Number(getWayBillTypeId()) == WAYBILL_TYPE_TO_PAY) && configuration.consigneeGSTCompulsaryInTOPAY == 'true') {
		if(Number(grandTotal) >= Number(configuration.validateGstNoInputOnGrandTotalAmt)
			&& !validateInputTextFeild(10, consigneeGstnEle, consigneeGstnEle, 'info', gstnErrMsg))
			return false;
	} else if((configuration.validateGstNoInputOnGrandTotal == 'true')
		&& Number(grandTotal) >= Number(configuration.validateGstNoInputOnGrandTotalAmt)) {
		if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
			return false;
				
		if(!validateInputTextFeild(10, consigneeGstnEle, consigneeGstnEle, 'info', gstnErrMsg))
			return false;
	}
	
	if(configuration.validateGstNoInputOnGrandTotalWayBillTypeWise == 'true') {
		if(configuration.validateGstNoInputOnGrandTotalWayBillTypeWiseOnRegionIds.indexOf(executive.regionId+'') != -1){ // region wise checking allowed
			if(Number(grandTotal) >= Number(configuration.validateGstNoInputOnGrandTotalAmt)) {
				$("#STPaidBy option[value='" + TAX_PAID_BY_TRANSPORTER_ID + "']").remove(); // remove transporter option
				if(Number(getWayBillTypeId()) == WAYBILL_TYPE_PAID || Number(getWayBillTypeId()) == WAYBILL_TYPE_CREDIT) {
					if($('#' + consignorGstnEle).val() == '') {
						setTimeout(function() { 
							showMessage('info', " Consignor GSTN Required For Booking Amount Greater than or More Than "+configuration.validateGstNoInputOnGrandTotalAmt);	
						}, 1500);
					} else
						$("#STPaidBy").val(TAX_PAID_BY_CONSINGOR_ID);
					
					if(!validateInputTextFeild(10, consignorGstnEle, consignorGstnEle, 'info', gstnErrMsg))
						return false;
				} else if(Number(getWayBillTypeId()) == WAYBILL_TYPE_TO_PAY) {
					if($('#' + consigneeGstnEle).val() == '') {
						setTimeout(function() { 
							showMessage('info', " Consignee GSTN Required For Booking Amount Greater than or More Than "+configuration.validateGstNoInputOnGrandTotalAmt);	
						}, 1500);
					} else
						$("#STPaidBy").val(TAX_PAID_BY_CONSINGEE_ID);
					
					if(!validateInputTextFeild(10, consigneeGstnEle, consigneeGstnEle, 'info', gstnErrMsg))
						return false;
				}
			} else if(!($("#STPaidBy option[value='"+ TAX_PAID_BY_TRANSPORTER_ID + "']").length > 0))
				$("#STPaidBy").append('<option value="'+ TAX_PAID_BY_TRANSPORTER_ID + '">Transporter</option>');
		}
	}
	
	return true;
}

function validateDeclaredValueAndInvoiceNumber() {
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
			
	if($('#' + consignorGstnEle).val() != "" || $('#' + consigneeGstnEle).val() != "") {
		if((configuration.invoiceNoMandatoryOnGstn == 'true' || configuration.invoiceNoMandatoryOnGstn == true)
			&& !validateInput(1, 'invoiceNo', 'invoiceNo', 'packageError',  invoiceNumberErrMsg))
				return false;
		
		if((configuration.decValMandatoryOnGstn == 'true' || configuration.decValMandatoryOnGstn == true)
			&& !validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg))
				return false;
		
		if((configuration.invoiceDateMandatoryOnGStn == 'true' || configuration.invoiceDateMandatoryOnGStn == true)
			&& !validateInput(1, 'invoiceDate', 'invoiceDate', 'basicError', dateErrMsg))
				return false;
	}
	
	return true;
}

function validateSize() {
	if(configuration.routeWiseSlabConfigurationAllowed == 'false' || configuration.routeWiseSlabConfigurationAllowed == false)
		return true;
	
	if(!validateInput(1, 'articleLength', 'articleLength', 'packageError',  lengthErrMsg)) {
		setTimeout(function(){ 
			$('#articleLength').focus(); 
			showMessage('error', lengthErrMsg);	
		}, 200);
		return false;
	}

	if(!validateInput(1, 'articleBredth', 'articleBredth', 'packageError',  breadthErrMsg)) {
		setTimeout(function(){ 
			$('#articleBredth').focus(); 
			showMessage('error', breadthErrMsg);	
		}, 200);
		return false;
	}

	return true;
}
function validateEwayBillNo() {
	return !($('#eWayBillExempted').prop('checked'));
 }
 
function validateccAttached() {
	isCCAttached = $('#ccAttached').prop('checked');
}

function validateLrNumber(){
	if(configuration.allowManualNumberStartingWithZero == 'true' || configuration.allowManualNumberStartingWithZero == true)
		return true;
	
	var regExp = /^0[0-9].*$/;
	var LrNumber = $('#lrNumberManual').val();
		
	if(regExp.test(LrNumber)){
		setTimeout(function(){ 
			$('#lrNumberManual').val('');
			$('#lrNumberManual').focus(); 
			showMessage('info', " Number can not be start with 0 !");	
		}, 200);
		
		return false;
	}
	
	return true;
}

function validateManualLrNumberAndAutoLrSequence(){
	if(configuration.validateLrManualNumberAndAutoSequenceOnAutoPage == 'true' && !isManualWayBill)
		checkLrWithinRange();
}

function validatePartyOnShortCreditPayment(){
	if(configuration.allowShortCreditPaymentForSavedParties == 'false' || configuration.allowShortCreditPaymentForSavedParties == false)
		return true;
	
	if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_ID){
		var consignorId = $('#partyMasterId').val();
		if(consignorId <= 0){
			setTimeout(function(){ 
				$('#consignorName').val('');
				$('#consignorName').focus(); 
				showMessage('info', " Short Credit Not Allowed For Consignor Party !");	
			}, 200);
			return false;
		}
	}
	
	return true;
}

function setCashPaymentType() {
	if(configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == 'true' || configuration.showCashPaymentTypeGstOnCongisneeAndConsignor == true) {
		let consignorGstnEle	= getConsignorGstnEle();
		let consigneeGstnEle	= getConsigneeGstnEle();
		
		let consignorGSTNValue		= $('#' + consignorGstnEle).val();
		let consigneeGSTNValue		= $('#' + consigneeGstnEle).val();
		
		if(jQuery.isEmptyObject(consignorGSTNValue) && jQuery.isEmptyObject(consigneeGSTNValue)) {
			if ( $('#paymentType').val() != PAYMENT_TYPE_CASH_ID) {
				$('#paymentType').val(PAYMENT_TYPE_CASH_ID);
				setTimeout(function(){ 
					$('#paymentType').focus(); 
					showMessage('info', " Please enter consignor and consignee GST ");	
				}, 200);
				
				return false;
			}
		}
	} 
	
	return true;
}

function validateDestinationSubRegionForDDDVBooking() {
	if(configuration.AllowOnlyDDDVBookingForSpecificSubRegion == 'false' || configuration.AllowOnlyDDDVBookingForSpecificSubRegion == false)
		return true;
	
	var subRegionArr 		= (configuration.AllowedSubRegionIds).split(',');
	
	var destinationSubRegionId 	= $('#destinationSubRegionId').val();
	var checkSubRegion 			= isValueExistInArray(subRegionArr, destinationSubRegionId);
	var bookingType				= $('#bookingType').val();
	
	if(checkSubRegion && bookingType != DIRECT_DELIVERY_DIRECT_VASULI_ID) {
		setTimeout(function() { 
			$('#destination').focus(); 
			showMessage('info', " Only DDDV Booking Allowed for " + $('#destination').val() + " !");	
		}, 200);
		
		return false;
	}
	
	return true;
}

function validateShortCreditLimit() {
	if(configuration.shortCreditConfigLimitAllowed == 'false' || configuration.shortCreditConfigLimitAllowed == false)
		return true;
	
	if(Number($('#paymentType').val()) != PAYMENT_TYPE_CREDIT_ID)
		return true;
	
	if(Number(shortCreditConfigLimit.shortCreditConfigLimit.creditType) == 1){
		var grandTotal = $("#grandTotal").val();
		
		if(grandTotal > shortCreditConfigLimit.shortCreditConfigLimit.creditLimit){
			setTimeout(function(){ 
				$('#paymentType').focus(); 
				showMessage('info', " Short Credit Amount Limit of "+ shortCreditConfigLimit.shortCreditConfigLimit.creditLimit +" Exceeded !");	
			}, 200);
			return false;
		}
		
	} else if(Number(shortCreditConfigLimit.shortCreditConfigLimit.creditType) == 2){
		var grandTotal = $("#grandTotal").val();
		
		if(grandTotal > shortCreditConfigLimit.shortCreditConfigLimit.balance){
			setTimeout(function(){ 
				$('#paymentType').focus(); 
				showMessage('info', " Short Credit Balance Limit of "+ shortCreditConfigLimit.shortCreditConfigLimit.balance +" Exceeded !");	
			}, 200);
			return false;
		}
	}
	
	return true;
}

function validateInputForQRPayment() {
	if(!allowDynamicPhonepeQR)
		return true;

	isWayBillSaved = false;
	
	if(Number($('#paymentType').val()) == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) {
		isFromDynamicPaymentTypeSelection = true;
		
		if(!formValidations()){
			setPaymentType('paymentType')
			return false;
		}
	}

	isFromDynamicPaymentTypeSelection = false;
	return true;
}

function validateGstNumberInputOnGrandTotalWithWayBillType() {
	let grandTotal 		= $('#grandTotal').val();
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
	
	if(configuration.wayBillTypeWiseGstValidationAllowed == 'true') {
		if(Number(getWayBillTypeId()) == WAYBILL_TYPE_PAID || Number(getWayBillTypeId()) == WAYBILL_TYPE_TO_PAY) {
			let validateConsignorAndConsigneeGSTN = jQuery.isEmptyObject($('#' + consignorGstnEle).val()) && jQuery.isEmptyObject($('#' + consigneeGstnEle).val());
			
			if(validateConsignorAndConsigneeGSTN && grandTotal >= 750) {
				setTimeout(function() { 
					$('#' + consignorGstnEle).focus(); 
					showMessage('info', " Consignor or Consignee GSTN Required For Booking Amount Greater than or More Than " + configuration.validateGstNoInputOnGrandTotalAmt);	
				}, 200);
				return false;
			}
		} else if(Number(getWayBillTypeId()) == WAYBILL_TYPE_CREDIT && parseInt($('#billingPartyId').val()) > 0) {
			if(jQuery.isEmptyObject($('#' + consignorGstnEle).val()) && grandTotal >= 750) {
				setTimeout(function() { 
					$('#' + consignorGstnEle).focus(); 
					showMessage('info', " Billing Party GSTN Required For Booking Amount Greater than or More Than "+configuration.validateGstNoInputOnGrandTotalAmt);	
				}, 200);
				return false;
			}
		}
	}
	
	return true;
}

function validateGstNumberForOnyOneParty() {
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
		
	if(jQuery.isEmptyObject($('#' + consignorGstnEle).val()) && jQuery.isEmptyObject($('#' + consigneeGstnEle).val())) {
		if($('#' + consignorGstnEle) != null || $('#' + consigneeGstnEle) == null) {
			setTimeout(function(){ 
				$('#' + consignorGstnEle).focus(); 
				showMessage('info', " Consignor or Consignee GSTN Required");	
			}, 200);
			return false;
		}
	}
	return true;
}

function getConsignorGstnEle() {
	let consignoCorprGstn	= 'consignorGstn';
		
	if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
		consignoCorprGstn	= 'consignoCorprGstn';
	
	return consignoCorprGstn;
}

function getConsigneeGstnEle() {
	let consignoCorprGstn	= 'consigneeGstn';
		
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
		consignoCorprGstn	= 'consigneeCorpGstn';
	
	return consignoCorprGstn;
}

function validateGstNumberForEveryParty() {
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
	
	let consignorGstn = $('#' + consignorGstnEle).val();
	let consigneeGstn = $('#' + consigneeGstnEle).val();

	if (consignorGstn == null || consignorGstn == "") {
		setTimeout(function() {
			$('#' + consignorGstnEle).focus()
			showMessage('info', "Consignor GSTN Required");
		}, 200);
		return false;
	} else if (consigneeGstn == null || consigneeGstn == "") {
		setTimeout(function() {
			$('#' + consigneeGstnEle).focus();
			showMessage('info', "Consignee GSTN Required");
		}, 200);
		return false;
	}

	return true;
}

function validateInvoiceOnDeclaredValue() {
	if(configuration.validateInvoiceNoOnDecalredValue == 'false')
		return true;
		
	var amount			= Number(configuration.declaredValueForInvoiceNo);
	var declaredValue 	= Number($('#declaredValue').val());
	var invoiceNo 		= $('#invoiceNo').val().trim();
	
	if(invoiceNo != '' && invoiceNo.length > 0)
		return true;
	
	if(validateInput(1, 'declaredValue', 'declaredValue', 'packageError', declaredValueErrMsg) && declaredValue > amount) {
		if(validateInvoiceOnDeclaredValueOnSave) {
			$('#invoiceNo').focus();
			changeTextFieldColor('invoiceNo', '', '', 'red');
			showMessage('error', 'Please Enter Invoice No !');
			return false;
		} else {
			setTimeout(() => {
				$('#invoiceNo').focus();
				changeTextFieldColor('invoiceNo', '', '', 'red');
				showMessage('error', 'Please Enter Invoice No !');
				return false;
			}, 200);
		}
	}
	
	return true;
}

function viewEwaybillNumber() {
	if(configuration.showEwaybillNumberOnBookingPage == 'true'){
		$("#viewEwaybillTable").css("display", "none");
		$('#eWayBillDetails1').empty();
		setTimeout(function(){
			if(checkBoxArray === undefined  || checkBoxArray.length == 0){
				$('#eWayBillDetails').html('&#9746; No records found !');
				return false;
			}

			var columnArray		= new Array();

			$("#viewEwaybillTable").css("display", "block");

			for (var i = 0; i < checkBoxArray.length; i++) {
				var obj		= checkBoxArray[i];
				columnArray.push("<td style='text-align: center; vertical-align: middle;font-size: 15px;'>" + (i + 1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;font-size: 15px;' id='ewaybillNumber" + i + "' name='ewaybillNumber" + i + "' value='"+ obj +"'>" + (obj) + "</td>");
				$('#viewEwaybillTable tbody').append('<tr id="ewaybillNumber'+ i +'">' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
			}
		},100);
	}
}

function billingBranchValidateValidation() {
	if(configuration.billingBranchValidate == 'true' && getWayBillTypeId() == WAYBILL_TYPE_CREDIT)
		return validateInput(1, 'billingBranch', 'billingBranch', 'basicError', billingBranchErrMsg);
	
	return true;
}

function validateContainerArray() {
	if(containerDetailsArray != undefined && containerDetailsArray.length > 0)
		$('#viewContainerDetailsDiv').removeClass('hide');
	else
		$('#viewContainerDetailsDiv').addClass('hide');
}

function validateContainerType(typeObj){
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")){
		let count = $("#containerDetailsDivSummaryDiv tr").length;
		
		if(Number(count) == 2){
			showMessage('info','Cannot add more!');
			$("#containerType").val(0);
			$("#containerType").focus();
			return;
		} else if(Number(count) == 1){
			let containerType = $("#actualContainerType").val();

			if(containerType != 2){
				showMessage('info','Cannot add more!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return;
			} 

			if(typeObj.value != containerType ){
				showMessage('info','Cannot select different container type!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return;
			}
		}
	}
}

function validateContainerSize(sizeObj){
	
	let size 			= sizeObj.value;
	let containerType 	= $('#containerType').val();

	if(containerType <= 0){
		showMessage('info','Please select container type!');
		$("#"+sizeObj.id).val('');
		$("#containerType").focus();
		return false;
	}
	
	if(containerType == 3) {
		if(size > 40) {
			showMessage('info','Cannot enter size greater than 40ft.');
			setTimeout(() => {
				$("#"+sizeObj.id).val('');
				$("#"+sizeObj.id).focus();
			}, 500);
			return false;
		}
	} else if(size > 20) {
		showMessage('info','Cannot enter size greater than 20ft.');
		setTimeout(() => {
			$("#"+sizeObj.id).val('');
			$("#"+sizeObj.id).focus();
		}, 500);
		return false;
	}
	
	return true;
}

function validateLRTypeWiseConsignorGSTNumber() {
	let wayBillTypeIds	= (configuration.wayBillTypeIdsForConsignorGstnValid).split(",");
	
	if(wayBillTypeIds.length > 0) {
		let checkWayBillType = isValueExistInArray(wayBillTypeIds, getWayBillTypeId());
		
		if(checkWayBillType && !validateGstnForConsignor())
			return false;
	}
	
	return true;
}

function addConsingmentGstn() {
	let agentBranch 	= false;
	let isAgentBranchId = 0;
	
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
	
	let	 consignorGstn = $("#" + consignorGstnEle).val();
	let	 consigneeGstn = $("#" + consigneeGstnEle).val();
	
	if(isManual || isManual == 'true') {
		agentBranch		= isAgentBranchBoolean;
		isAgentBranchId	= agentBranchId;
	} else {
		agentBranch		= loggedInBranch.agentBranch;
		isAgentBranchId	= loggedInBranch.branchId;
	}
	
	let	agentBranchIds	= configuration.consignorOrConsigneeGstNotRequiredForSourceBranchAgent;
	 
	if(configuration.consignorOrConsigneeGstRequiredForSourceBranchAgent == 'true' && agentBranch){
		if(agentBranchIds != undefined && !agentBranchIds.includes(isAgentBranchId)) {
			if(consignorGstn == '' && consigneeGstn == '') {
				setTimeout(() => {
					if(consigneeGstn == '' ) {
						$('#' + consignorGstn).focus();
						changeTextFieldColor(consignorGstn, '', '', 'red');
					}
				}, 200);
				showMessage('error', 'Please Enter Valid Consignor or Consignee GSTN');
				return false;
			}
		}
	}
	
	return true;
}

function consignorIdProofMandatory() {
	/*
		Do not Validate Invoice Number, Invoice Date, Declared Value on GST Not Applicable
	*/
	if(configuration.removeValidationSelectForNotApplicable == 'true') {
		let STPaidBy = Number($("#STPaidBy").val());
		
		if(STPaidBy == TAX_PAID_BY_NOT_APPLICABLE_ID) {
			configuration.showInvoiceDate   	  = false;
			configuration.InvoiceNoValidate       = false;
			configuration.DeclaredValueValidate   = false;
		} else {
			configuration.showInvoiceDate   	  = 'true';
			configuration.InvoiceNoValidate       = 'true';
			configuration.DeclaredValueValidate   = 'true';
		}
	
		if(STPaidBy == TAX_PAID_BY_NOT_APPLICABLE_ID && idProofDataObject1 == null){
			showMessage('error', "Please Add Id Proof Detail !");
			$('.consignorIdProof').focus();
			return false;
		}
	}

	return true;
}

function consignorAndConsigneeIdProofMandatoryOnGstn() {
	let consignorGstnEle	= getConsignorGstnEle();
	let consigneeGstnEle	= getConsigneeGstnEle();
		
	 return !(isAllowToEnterIDProof && configuration.consignorAndConsigneeIdProofMandatoryOnGstn == 'true'
		&& $('#' + consignorGstnEle).val() == '' && $('#' + consigneeGstnEle).val() == '' && ((idProofDataObject1 == undefined || idProofDataObject1 == null) 
		&& (idProofDataObject2 == undefined || idProofDataObject2 == null))
			&& !validateInput(1, 'consignorIdProof', 'consignorIdProof', 'basicError', "Please Add Id Proof Detail !! "));
 }
 
 function showEwayBillNumberWarningMsg(){
	let bookingType = getValueFromInputField('bookingType');
	
	if((configuration.doNotValidateEwayBillNumberOnDeclareValueOnDDDVBooking == "true" || configuration.doNotValidateEwayBillNumberOnDeclareValueOnDDDVBooking == true) && bookingType == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID)
	 	 return false;
	 	 	 	 
	if(configuration.isAllowEWayBillExemptedValidation == 'true' && noOfArticlesAdded >= 1 && counterForNonEmpty > 0 
		&& (Object.values(consignmentEWayBillExemptedObj)[0] == 'true' || Object.values(consignmentEWayBillExemptedObj)[0] == true))
	 	return true;
	 	
	let declaredMinimumAmount	= minimumDeclareValue();
	
	if((configuration.doNotValidateEwayBillNumberOnDeclareValue == "false") && declaredMinimumAmount > 0) {
		 let declareValues = Number($("#declaredValue").val());
		 
		 if(configuration.showExtraSingleEwaybillField == "true") {
			 if(declareValues > declaredMinimumAmount && $('#singleEwaybillNo').val() == '' && $('#singleEwaybillNo').val().length == 0 && checkBoxArray.length == 0) {
				 showMessage('warning', ewayBillNumberWarningMsgOnDeclareValue(declaredMinimumAmount));
				 $('#addMutipleEwayBill').focus();
				 return false;
			 }
		 } else if(declareValues > declaredMinimumAmount && checkBoxArray != undefined && checkBoxArray.length == 0) {
			 showMessage('warning', ewayBillNumberWarningMsgOnDeclareValue(declaredMinimumAmount));
			 $('#addMutipleEwayBill').focus();
			 return false;
		 }
	 }
	 
	 return true
}
 
 function showEwayBillNumberWarningMsgNew(){
	 let declareValues = Number($("#declaredValue").val());
	 let billselection = Number($('#billSelection').val());
	 
	 if(declareValues <= 0 && billselection == BOOKING_WITH_BILL){
		showMessage('error', "Declare value is not to be 0!");
		return false;
	}

	if(declareValues > Number(configuration.declaredValueForSelectEwayBill) && billselection == BOOKING_WITH_BILL) {
		if(Number(checkBoxArray.length) == 0 || checkBoxArray == undefined) {
			changeDisplayProperty('eWayBillNumberDiv', 'inline');
			$('#singleFormTypes').val(E_WAYBILL_ID);
			showMessage('error', eWayBillNumberWarningMsg);
			$('#addMutipleEwayBill').focus();
			return false;
		}
	} else
		$('#deliveryTo').focus();
		
	return true;
} 
 
function lrTypeAndPackingTypeWiseValidation() {
	if(isManualWayBill) return true;
	if(isBranchListForSkipAmountValidation) return true;
	
	let isPackingTypeExists	= false;
	let wbType					= parseInt(getWayBillTypeId());
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#typeofPackingId' + element).html() > 0) {
				let packingTypeId 	= parseInt($('#typeofPackingId' + element).html());
			
				if(packingTypeId == PACKING_TYPE_LETTER || packingTypeId == PACKING_TYPE_LIFFAFA) {
					isPackingTypeExists	= true;
					break;
				}
			}
		}
	}
	
	if(isPackingTypeExists && wbType != WAYBILL_TYPE_PAID && wbType != WAYBILL_TYPE_FOC) {
		showMessage('error', 'Only Paid Booking Allow for Letter, Liffafa');
		return false;
	}
	
	return true;
}

function calculateAndvalidateBuiltyChgValue() {
	if(configuration.CustomAmountCalculation == 'false') return true;

	var bracnhIdsForLrWiseBuiltyCharge10	= (configuration.branchIdsToallowLrWiseBuiltyCharge10).split(",");
	var wbType								= parseInt(getWayBillTypeId());
	var builtyChgValue 						= 10;

	if(!isValueExistInArray(bracnhIdsForLrWiseBuiltyCharge10, branchId)){
		if(wbType == WAYBILL_TYPE_TO_PAY || branchId == 13924 || branchId == 70932)//VISHWAKARMA CARGO
			builtyChgValue = 20;
	}
	
	if(wbType == WAYBILL_TYPE_TO_PAY && (branchId == 31958 || branchId == 13682))//KALPANA OFFICE, MAYUR TRAVELS
		builtyChgValue = 10;

	if(wbType == WAYBILL_TYPE_PAID && branchId == 13924) {//VISHWAKARMA CARGO
		builtyChgValue  = TotalQty * 10;
		$('#charge' + BUILTY_CHARGE).val(builtyChgValue);

		if(isManualWayBill)
			$('#charge' + BUILTY_CHARGE).prop("readonly", "true");
	}

	if(wbType == WAYBILL_TYPE_TO_PAY && branchId == 13924) {//VISHWAKARMA CARGO
		builtyChgValue = TotalQty * 20;
		$('#charge' + BUILTY_CHARGE).val(builtyChgValue);

		if(isManualWayBill)
			$('#charge' + BUILTY_CHARGE).prop("readonly", "true");
	}

	if(branchId == configuration.branchIdForBuiltyCharge || branchId == 31958 || branchId == 52914) {//KALPANA CARGO
		builtyChgValue = TotalQty * 10;
		$('#charge' + BUILTY_CHARGE).val(builtyChgValue);
	}
	
	if(parseInt($('#totalAmt').val()) > 60) {
		if(parseInt($('#charge' + BUILTY_CHARGE).val()) == 0) {
			$('#charge' + BUILTY_CHARGE).val(builtyChgValue);
		} else if(parseInt($('#charge' + BUILTY_CHARGE).val()) > 0 && parseInt($('#charge' + BUILTY_CHARGE).val()) < builtyChgValue) {
			showMessage('error','Builty Charge should be greater than or equal to ' + builtyChgValue + '/-');
			setTimeout(function() {
				$('#charge' + BUILTY_CHARGE).focus();
			}, 100);
			$('#charge' + BUILTY_CHARGE).val(builtyChgValue);
			return false;
		}
	} else
		$('#charge' + BUILTY_CHARGE).val(0);

	if(isFreightChargeEnableBranchList &&  isFreightChargeEnableGanth && wbType == WAYBILL_TYPE_CREDIT)
		$('#charge' + BUILTY_CHARGE).val(0);

	/*if(isFreightChargeEnableBranchListForTopay && isFreightChargeEnableBranchListForTopayNAG && wbType == WAYBILL_TYPE_TO_PAY) {
		$('#charge' + BUILTY_CHARGE).val(0);
	}*/

	calcTotal();

	return true;
}

function doNotAllowLesserAmount(obj) {
	if(configuration.doNotAllowLesserAmount == 'false')
		return;
		
	if(configuration.skipRateValidationForManualLrTypes != undefined){
		let wayBillTypeIds    = [];
		wayBillTypeIds	      = configuration.skipRateValidationForManualLrTypes.split(',');
		let wayBillType 	  = $('#wayBillType').val();	
		if (isManualWayBill && wayBillTypeIds.includes(wayBillType))
		  return;
	}
		
	if(obj.id == 'charge' + LOADING) {
		if(isManualWayBill) {
			if($('#charge' + LOADING).val() < totalLoadingWithDiscount) {
				obj.value = totalLoadingWithDiscount;
				showMessage('error', 'Loading Charge Can not be less than ' + totalLoadingWithDiscount + ' Rs/-');
			} else if(totalLoadingWithDiscount <= 0 && (loadingValue - Number($('#charge' + LOADING).val())) > 10) {
				obj.value = loadingValue;
				showMessage('error', 'Loading Charge Can not be less than ' + loadingValue + ' Rs/-');
			} else if((Number($('#charge' + LOADING).val()) > loadingValue)
					&& (Number($('#charge' + LOADING).val()) - loadingValue) > 10
					&& !isLoadingIncreaseBranchList) {
				obj.value = loadingValue;
				showMessage('error', 'Loading Charge Can not be greater than ' + loadingValue + ' Rs/-');
			}
		} else if($('#charge' + LOADING).val() < totalLoadingWithDiscount) {
			obj.value = totalLoadingWithDiscount;
			showMessage('error', 'Loading Charge Can not be less than ' + totalLoadingWithDiscount + ' Rs/-');
		} else if(totalLoadingWithDiscount <= 0 && $('#charge' + LOADING).val() < loadingValue) {
			obj.value = loadingValue;
			showMessage('error', 'Loading Charge Can not be less than ' + loadingValue + ' Rs/-');
		} else if($('#charge' + LOADING).val() > loadingValue && !isLoadingIncreaseBranchList) {
			obj.value = loadingValue;
			showMessage('error', 'Loading Charge Can not be greater than ' + loadingValue + ' Rs/-');
		}
	} else if(obj.id == 'charge' + BUILTY_CHARGE && $('#totalAmt').val() > 50) { 
		if(obj.value < 10) {
			obj.value = 10;
			showMessage('error', 'Builty Charge can not be less than 10 Rs/-');
		}
	}
}

function doNotAllowLesserFreightAmount(obj) {
	if(obj.id == 'charge' + FREIGHT) {
		if(isManualWayBill && checkBranchForFreightIncreaseOrDecrease) {
			if(parseInt($("#charge" + FREIGHT).val()) < amountWithDiscount) {
				showMessage('error', 'Freight Charge Can not be less than ' + amountWithDiscount + ' Rs/-');
				obj.value = amountWithDiscount;
			} else if(parseInt($("#charge" + FREIGHT).val()) > amountWithIncreaseAmount) {
				showMessage('error', 'Freight Charge Can not be greater than ' + amountWithIncreaseAmount + ' Rs/-');
				obj.value = amountWithIncreaseAmount;
			}
		} else if(amountWithDiscount > 0) {
			if(parseInt($("#charge" + FREIGHT).val()) < amountWithDiscount) {
				showMessage('error', 'Freight Charge Can not be less than ' + amountWithDiscount + ' Rs/-');
				obj.value = amountWithDiscount;
			}
		}
	}
}

function validateDoorDeliveryCharge(isReadOnly) {
	if (configuration.skipDoorDeliveryChargeValidationOnLrType.split(',').includes(getWayBillTypeId().toString())) {
		return true;
	} else if (isReadOnly == false && $('#deliveryTo').val() == DELIVERY_TO_DOOR_ID) {
		let lebel = $('#label' + configuration.doorDeliveryChargeId).html();
		
		if(!validateInput(1, 'charge' + configuration.doorDeliveryChargeId, 'charge' + configuration.doorDeliveryChargeId, 'error', 'Please Enter ' + lebel + ' Charge !'))
			return false;
	}
	
	return true;
}

function validateArticleType() {
	if(configuration.documentTypeSelection == 'false')
		return true;
		
	return !(!validateInputTextFeild(1, 'natureOfArticle', 'natureOfArticle', 'error', 'Please, Select Nature of Article !'));
}

function validateDeliveryAtGodown() {
	let destinationbranchId 					= getValueFromInputField('destinationBranchId');
	let subregionIdsForGodownDelvry				= (configuration.subregionIdsForGodownDelivery).split(",");
	let branchIdsForGodownDelvry				= (configuration.branchIdsForGodownDelivery).split(",");
	let isAllow									= true;
	
	if(subregionIdsForGodownDelvry.length > 0 && branchIdsForGodownDelvry.length > 0) {
		let checkSubregionIdsForGodownDelvry 		=  isValueExistInArray(subregionIdsForGodownDelvry, executive.subRegionId);
		let checkBranchIdsForGodownDelvry 			=  isValueExistInArray(branchIdsForGodownDelvry, destinationbranchId);
		 
	 	if(checkSubregionIdsForGodownDelvry && checkBranchIdsForGodownDelvry && ($('#deliveryTo').val() == DELIVERY_TO_BRANCH_ID)) {
			showMessage('error', "You can not Book Godown Delivery LR For Daman.");
			isAllow  = false
		}
	}

	return isAllow;
}

function validateSingleEwaybillNumber() {
	isValidateEwaybillFromPopup = false;
	eWayBillNumberArray	= [];	
	checkBoxArray       = [];
	
	if((configuration.validateDestinationBranchOnEwayBillApi  == "true" || configuration.validateDestinationBranchOnEwayBillApi == true) && $('#destinationBranchId').val() <= 0){
		showMessage('info', " Please Enter Destination First !");
		return;
	}
	
	if(isManualWayBill) {
		if($('#singleEwaybillNo').val().length > 0 &&  $('#singleEwaybillNo').val().length < 12) {
			showMessage('info', " Please Enter 12 Digit Ewaybill Number !");
			$('#singleEwaybillNo').focus();
		}
	
		if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length <= 0)
			next = "consignorName";
	
		if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length > 0 && $('#singleEwaybillNo').val().length < 12) {
			showMessage('info', " Please Enter 12 Digit Ewaybill Number !");
			$('#singleEwaybillNo').focus();
			return;
		} else {
			var ewNumber = $('#singleEwaybillNo').val()

			if(ewNumber != '') {
				eWayBillNumberArray.push(ewNumber);
				checkBoxArray.push(ewNumber);
			}
			
			var res = validateEwayBillNumberByApi();
			
			if(res!= null && res!= undefined && res)
				next = "consignorName";
		}
	} else {
		if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length > 0 && $('#singleEwaybillNo').val().length < 12) {
			showMessage('info', " Please Enter 12 Digit Ewaybill Number !");
			$('#singleEwaybillNo').focus();
			return;
		} else if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length == 0) {
			if(isTokenThroughLRBooking && isTokenWayBill) {
				if($('#consignorName').val() == '' || $('#consignorName').val().length == 0) {
					$('#consignoCorprGstn').focus();
					return;
				}
				
				if($('#consigneeName').val() == '' || $('#consigneeName').val().length == 0) {
					$('#consigneeCorpGstn').focus();
					return;
				}
			}
		} else {
			var ewNumber = $('#singleEwaybillNo').val();
			
			if(ewNumber != '') {
				eWayBillNumberArray.push(ewNumber);
				checkBoxArray.push(ewNumber);
				validateEwayBillNumberByApi();
			}
			
			if(isTokenThroughLRBooking && isTokenWayBill) {
				if($('#consignorName').val() == '' || $('#consignorName').val().length == 0) {
					$('#consignoCorprGstn').focus();
					return;
				}
				
				if($('#consigneeName').val() == '' || $('#consigneeName').val().length == 0) {
					$('#consigneeCorpGstn').focus();
					return;
				}
			}
		}
	}
}

function setFocusForTokenBooking() {
	let famt = $('#charge' + FREIGHT).val();
	
	if(!isFreightChargeEnable && famt > 0 && $('#consignorName').val().length > 0 && $('#consigneeName').val().length  > 0 && $('#chargeType').val() > 0 && $('#charge1').val() > 0  && validateDetailsForTokenLRBooking()){
		$('#charge' + FREIGHT).prop("readonly", true);
		$('#actualWeight').focus();
		$('#addArticlePanel').hide();
	}
}

function validateDetailsForTokenLRBooking() {
	let tokendetailsValidate = false;
     
	if(isTokenThroughLRBooking && isTokenWayBill)
		tokendetailsValidate = $('#consignorName').val() != '' && $('#consigneeName').val() != '' && $('#chargeType').val() > 0;

	return tokendetailsValidate;
}

function checkPoNoInpute() {
	if(configuration.validatePODateOnPoNumber != 'true')
		return;
	
	if($('#purchaseOrderNumber').val() != "")
		configuration.validatePurchaseOrderDate = true;
}

function purchaseOrderDateValidation() {
	if(configuration.validatePODateOnPoNumber == 'true') {
		if($('#purchaseOrderNumber').val() === "") {
			$('#purchaseOrderDate').val("")
			return true;
		}
	}
	
	if(configuration.validatePurchaseOrderDate == 'true' || configuration.validatePurchaseOrderDate == true) {
		if(!validateInput(1, 'purchaseOrderDate', 'purchaseOrderDate', 'basicError', dateErrMsg))
			return false;

		if(!validatePurchaseOrderDate(getValueFromInputField('purchaseOrderDate')))
			return false;
	}
	
	return true;
}

function validatePurchaseOrderDate(date) {
	if(isValidDate(date)) {
		let currentDate  			= new Date(curSystemDate);
		let manualLRDate 			= new Date(curSystemDate);
		
		let manualLRDateParts 	= new String(date).split("-");
		manualLRDate.setFullYear(parseInt(manualLRDateParts[2],10));
		manualLRDate.setMonth(parseInt(manualLRDateParts[1]-1,10));
		manualLRDate.setDate(parseInt(manualLRDateParts[0],10));
		
		if(manualLRDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			changeError1('purchaseOrderDate','0','0');
			isValidationError=true;
			$('#purchaseOrderDate').val("");
			return false;
		}
	} else {
		showMessage('error', validDateErrMsg);
		changeError1('purchaseOrderDate','0','0');
		isValidationError=true;
		return false;
	}
	
	return true;
}

function validateTaxType() {
	if($('#billSelection').val() != BOOKING_GST_BILL && configuration.showTaxTypeOnlyForBillSelectionGST == 'true') 
		return true;
	
	if(configuration.showTaxType == 'true' && ($('#taxTypeId').val() <= 0 || $('#taxTypeId').val()  == undefined)) {
		showMessage('error', 'Please Select Tax Type !');
		$("#taxTypeId").focus();
		return false;
	}
	
	return true;
}

function validateTokenLRType(keys) {
	if(!isTokenThroughLRBooking || !isTokenWayBill) return true;
	
	if($('#lrNumberManual').val() == '') return true;
	
	let lrTypeName = getLRTypeNameById(selectedTokenLRType);
	
	if(keys == 'F7' && selectedTokenLRType != WAYBILL_TYPE_PAID) {
		showMessage('info', iconForErrMsg + " You cannot book Paid LR for " + lrTypeName + " token LR " + $('#lrNumberManual').val());
		return false;
	}
	
	if(keys == 'F8' && selectedTokenLRType != WAYBILL_TYPE_TO_PAY) {
		showMessage('info', iconForErrMsg + " You cannot book ToPay LR for " + lrTypeName + " token LR " + $('#lrNumberManual').val());
		return false;
	}
	
	if(keys == 'F9' && selectedTokenLRType != WAYBILL_TYPE_CREDIT) {
		showMessage('info', iconForErrMsg + " You cannot book TBB LR for " + lrTypeName + " token LR " + $('#lrNumberManual').val());
		return false;
	}
	
	if(keys == 'F10' && selectedTokenLRType != WAYBILL_TYPE_FOC) {
		showMessage('info', iconForErrMsg + " You cannot book FOC LR for " + lrTypeName + " token LR " + $('#lrNumberManual').val());
		return false;
	}
	
	return true;
}

function getLRTypeNameById(selectedTokenLRType) {
	switch(selectedTokenLRType) {
		case WAYBILL_TYPE_PAID:
			return "Paid";
		case WAYBILL_TYPE_TO_PAY:
			return "To Pay";
		case WAYBILL_TYPE_CREDIT:
			return "TBB";
		case WAYBILL_TYPE_FOC:
			return "FOC";
	}	
}

function validateDoorDeliveryChargeOnDoorDelivery() {
	if(getWayBillTypeId() == WAYBILL_TYPE_FOC)
		return true;
	
	let deliveryTo			= $('#deliveryTo').val();
	let doorDeliveryId 		= $('#charge' + configuration.doorDeliveryChargeId).val();
	let lebel				= $('#label' + configuration.doorDeliveryChargeId).html();
	
	if(configuration.isWeightWiseDoorDeliveryChargeValidate == 'true') {
		let wightInKG	= configuration.weightInKGToValidateDoorDeliveryCharge;
		
		if(deliveryTo == DELIVERY_TO_DOOR_ID 
				&& (doorDeliveryId < 0 || doorDeliveryId == 0 || doorDeliveryId == '')
				&& Number($('#actualWeight').val()) < wightInKG) {
			showMessage('error', 'Please Enter ' + lebel + ' Charge !');
			changeTextFieldColor('charge' + configuration.doorDeliveryChargeId, '', '', 'red');
			return false;
		}
	} else if(deliveryTo == DELIVERY_TO_DOOR_ID && (doorDeliveryId < 0 || doorDeliveryId == 0 || doorDeliveryId == '')) {
		showMessage('error', 'Please Enter ' + lebel + ' Charge !');
		changeTextFieldColor('charge' + configuration.doorDeliveryChargeId, '', '', 'red');
		return false;
	} else {
		hideAllMessages();
		changeTextFieldColorWithoutFocus('charge' + configuration.doorDeliveryChargeId, '', '', 'green');
	}
	
	return true;
}

function validateFreightLessThanZero() {
	if(Number($('#charge' + FREIGHT).val()) < 0) {
		showMessage('warning', "Freight can't be less than 0 !");
		return false;
	}
	
	if(totalChargesToDeductFromFreight > 0 && Number($('#freightChargeValue').val()) < totalChargesToDeductFromFreight) {
		showMessage('error', "Freight can't be less than " + totalChargesToDeductFromFreight + " Rs.!");
		return false;
	}
	
	return true;
}

function blockBookingOnGrandTotalAmount() {
	if(configuration.blockBookingOnGrandTotalAmount == 'false') return true;
	
	if(Number($('#grandTotal').val()) > configuration.grandTotalAmountToBlockBooking) {
		showMessage('error', "Booking not allowed more than" + configuration.grandTotalAmountToBlockBooking + " Rs.");
		return false;
	}
	
	return true;
}

function validateFreightCharge() {
	if (configuration.FreightChargeValidate == 'true' && !isPartyChargeInclusive) {
		let ele				= document.getElementById('charge' + FREIGHT);
	
		if(ele) {
			let freightCurrentCharge	= parseFloat(ele.value);
			let freightDfaultCharge		= parseFloat($('#freightChargeValue').val());
			
			if(freightDfaultCharge > 0) {
				if(isNaN(freightCurrentCharge) || freightCurrentCharge == '' || freightCurrentCharge < freightDfaultCharge) {
					showMessage('error', 'You can not enter Freight Charge Less Than ' + freightDfaultCharge + '/-');
					changeError1(ele.id);
					isValidationError = true;
					return false;
				} else {
					removeError(ele.id);
					hideAllMessages();
				}
			}
		}
	}
	
	return true;
}


function chargeValidation(filter) {
	let amount	 	= configuration.fixedMinimumIAndSChargeAmount;
	let calcAmount 	= $('#actualInput' + filter).val();
	let minAmount 	= Number(calcAmount * TotalQty); 
	let wayBillTypeId	= getWayBillTypeId();
	
	switch (Number(filter)) {
	case LOADING:
		if((configuration.applyLoadingChargeOnFreightChargeAmt == 'true' || configuration.applyLoadingChargeOnFreightChargeAmt == true)
			&& (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY)
			&& (Number(loadingChargeAmount) > Number($('#charge' + filter).val())))
				$('#charge' + filter).val(loadingChargeAmount);
		
		break;
	case STATISTICAL:
		if (configuration.allowRegionWiseStatisticalCharge == 'true' && $('#wayBillType').val() != WAYBILL_TYPE_FOC) {
			let sourceBranchRegionId			= loggedInBranch.regionId
			let destinationBranchRegionId 		= $('#destinationRegionId').val();
			let minimumStatisticalCharge		= Number(configuration.minimumStatisticalCharge);
			let stasticalChargeValue 			= $('#charge' + filter).val();
			let chargesArray 					= configuration.regionWiseStatisticalChargeDetails.split(',');

			chargesArray.forEach(chargeDetail => {
				let chargeParts = chargeDetail.split('_');
			
				if (chargeParts.length === 3) {
					let [srcRegionId, destRegionId, chargeValue] = chargeParts;
						
					if (sourceBranchRegionId != destinationBranchRegionId && (sourceBranchRegionId == srcRegionId || destinationBranchRegionId == destRegionId)) {
						if (Number(stasticalChargeValue) < Number(chargeValue)) {
							showMessage("error", "You Can not Enter Stastical Charge Amount Less than " + Number(chargeValue) + ".");
							changeError1('charge' + filter, '0', '0');
							setTimeout(function() {
								$('#charge' + filter).focus();
							}, 100);
							return false;
						} 
					} else if (Number(stasticalChargeValue) < Number(minimumStatisticalCharge)) {
						showMessage("error", "You Can not Enter Stastical Charge Amount Less than " + Number(minimumStatisticalCharge) + ".");
						changeError1('charge' + filter, '0', '0');
						setTimeout(function() {
							$('#charge' + filter).focus();
						}, 100);
						return false;
					}
				}
			});
				
			removeError('charge' + filter);
		}
		
		break;
	case I_AND_S:
		if(configuration.validateFixedMinimumIAndSChargeAmount == 'true' && Number($('#charge' + filter).val()) < Number(amount)) {
			showMessage("error", "You Can not Enter I & S Charge Amount Less than " + Number(amount) + ".");
			$('#charge' + filter).val(amount);
			changeError1('charge' + filter, '0', '0');
			setTimeout(function() {
				$('#charge' + filter).focus();
			}, 100);
			return false;
		}
		removeError('charge' + filter);
	
		break;
	case HANDLING_BOOKING:
		if(configuration.doNotAllowIncreaseInHandlingCharge == 'true' && Number($('#charge' + filter).val()) > Number(minAmount) && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
			showMessage("error", "You cannot enter Handling Charge greater than " + Number(minAmount) + ".");
			$('#charge' + filter).val(Number(minAmount));
			changeError1('charge' + filter, '0', '0');
			setTimeout(function() {
				$('#charge' + filter).focus();
			}, 100);
			return false;
		}
		break;
	default:
		break;
	}
	return true;
}

function validateLrCharge() {

	if (configuration.LRChargeValidate == 'true') {
		let ele				= document.getElementById('charge' + LR_CHARGE);
		
		if(ele) {
			let lrCurrentCharge	= parseFloat(ele.value);
			let lrDfaultCharge	= parseFloat($('#lrChargeValue').val());
			
			if(tempLrCharge == 0)
				tempLrCharge = lrCurrentCharge;

			if(lrDfaultCharge > 0 || tempLrCharge > 0) {
				if(isNaN(lrCurrentCharge) || lrCurrentCharge < lrDfaultCharge || lrCurrentCharge < tempLrCharge ) {
					if(lrDfaultCharge > 0) {
						showMessage('error', 'You can not enter LR Charge Less Than ' + lrDfaultCharge + '/-');
						$('#charge' + LR_CHARGE).val(lrDfaultCharge);
					} else {
						showMessage('error', 'You can not enter LR Charge Less Than ' + tempLrCharge + '/-');
						$('#charge' + LR_CHARGE).val(tempLrCharge);
					}
					
					changeError1(ele.id);
					return false;
				} else {
					removeError(ele.id);
					hideAllMessages();
				}
			}
		}
	}
	
	return true;
}
 
function blockBookingOnGSTNumber(obj) {
	let consignorGstn	= 'consignorGstn';
	let consigneeGstn	= 'consigneeGstn';
	
	if(obj == null || obj == undefined)
		  return true;
	
	if(obj.id == 'consignoCorprGstn')
		consignorGstn	= 'consignoCorprGstn';
		
	if(configuration.isAllowToShowBillingPartyGSTN == 'true' && getWayBillTypeId() == WAYBILL_TYPE_CREDIT && obj.id == 'billingGstn')
		consignorGstn = $('#billingGstn').val();
	
	if(obj.id == 'consigneeCorpGstn')
		consigneeGstn= 'consigneeCorpGstn';
	
	if(configuration.BlockBookingOnGSTNumbers == 'true') {
		let gstNumberForGstWiseBlockingArr	= (configuration.GSTNumbersToBlockBooking).toUpperCase().split(",");
		
		if(obj != null && obj.id == consignorGstn) {
			if(isValueExistInArray(gstNumberForGstWiseBlockingArr, $("#" + consignorGstn).val())) {
				showMessage('error', blockGSTNumberErrorMsg($("#" + consignorGstn).val()));
				$("#" + consignorGstn).val('');
				return false;
			}
		} else if(obj != null && obj.id == consigneeGstn) {
			if(isValueExistInArray(gstNumberForGstWiseBlockingArr, $("#" + consigneeGstn).val())) {
				showMessage('error', blockGSTNumberErrorMsg($("#" + consigneeGstn).val()));
				$("#" + consigneeGstn).val('');
				return false;
			}
		} else if($('#' + consignorGstn).exists() && isValueExistInArray(gstNumberForGstWiseBlockingArr, $("#" + consignorGstn).val().toUpperCase())) {
			showMessage('error', blockGSTNumberErrorMsg($("#" + consignorGstn).val()));
			$("#" + consignorGstn).val('');
			return false;
		} else if($('#' + consigneeGstn).exists() && isValueExistInArray(gstNumberForGstWiseBlockingArr, $("#" + consigneeGstn).val().toUpperCase())) {
			showMessage('error', blockGSTNumberErrorMsg($("#" + consigneeGstn).val()));
			$("#" + consigneeGstn).val('');
			return false;
		}
	}
		
	return true;
}

function validateDoorDeliveryChargesOnWeight() {
	if($('#deliveryTo').val() != DELIVERY_TO_DOOR_ID)
		return true;
	
	if(configuration.isWeightWiseDoorDeliveryChargeValidate == 'true' && (Number($('#chargedWeight').val()) > Number(configuration.weightInKGToValidateDoorDeliveryCharge)) && $('#charge' + DOOR_DELIVERY_BOOKING).val() <= 0){
		showMessage('error', "Please Enter Door Delivery Charges !");
		return false;
	}
	
	return true;
}

function validateDoorDeliveryPincodeWithDestination() {
	if(configuration.calculateDestBranchToDoorDlyDistance == 'false')
		return true;
	
	calculateDestBranchToDoorDlyDistance();
	
	if($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
		if(!validateInput(1, 'dest_search', 'dest_search', 'packageError', doorDeliveyAddressErrMsg))
			return false;
		else if(doorDeliveryAddressPinCode == 0) {
			showMessage('error', "Please, Enter Door Delivey Address !");
			return false;
		}
	}
	
	if(doorDeliveryAddressPinCode > 0 && doorDeliveryAddressPinCode != deliveryBranchPincode) {
		showMessage('error', "Delivery Destination Pincode Does Not Match With Door Delivery Pincode!");
		$('#dest_search').focus();
		changeError1('dest_search','0','0');
		return false;
	}
	
	return true;
}

function validateFragileCharge() {
	if(getWayBillTypeId() != WAYBILL_TYPE_FOC && consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#goodsClassificationId' + element).html() > 0) {
				let goodsClassificationId     = parseInt($('#goodsClassificationId' + element).html());
 
				if(Number($('#charge' + BookingChargeConstant.FRAGILE).val()) == 0 && goodsClassificationId == GOODS_CLASSIFICATION_FRAGILE) {
		 			showMessage('warning', "FRAGILE Amount can  not be  zero!");
					return false;
				}
			}
		}
	}

	return true;
}

function validatePickupCartageCharge(chargeId) {
	if(configuration.validatePickupCartageChargeOnFreightCharge == 'true') {
		let freightCharge 				= $('#charge' + FREIGHT).val();
		let pickUpCartageCharge			= $('#charge' + chargeId).val();
		
		if(Number(pickUpCartageCharge) > Number(freightCharge) * 2) {
			$('#charge' + chargeId).val(0);
			showMessage('error', "Pickup cartage should not be greater than two times freight !");
			return false;
		}
	}
	
	return true;
}

function validateConsignorAndConsigneeNumberForSame() {
	let consignorNumber = ""
	let consigneeNumber = ""
	
	if(configuration.validateConsignorAndConsigneeNumberForSame == 'true') {
		if($('#consignorPhn').exists() && $('#consignorPhn').is(":visible"))
			consignorNumber = $('#consignorPhn').val();
			
		if($('#consigneePhn').exists() && $('#consigneePhn').is(":visible"))
			consigneeNumber = $('#consigneePhn').val();

		if(consignorNumber == consigneeNumber) {
			showMessage('error', configuration.consignorFeildLebel + ' And ' + configuration.consigneeFeildLebel + ' Mobile Number Should Not be Same !');
			return false;
		}
	}
	
	return true;
}

function validateFocApprovedBy() {
	if(configuration.showFocApprovedBy == 'false')
		return true;
	
	return !(getWayBillTypeId() == WAYBILL_TYPE_FOC && !validateInputTextFeild(1, 'directorId', 'directorId', 'error', 'Please, Select Approved By !'));
}

function gstNoValidation(elementID) {
	let element 	= document.getElementById(elementID);

	if(configuration.validatePanNumberInGstFeild == 'true' && (element.value).length == 10)
		return false;
		  
	return validateValidGSTNumber(elementID, 'error');			
}

function validateQuantityAmountMismatch() {
	if(getWayBillTypeId() == WAYBILL_TYPE_FOC || Number($('#chargeType').val()) != CHARGETYPE_ID_QUANTITY)
		return true;
		
	let srcDestRegionIdsForCrossingAndFrt = configuration.srcDestRegionIdsForCharges.split(',');
	let sourceRegionId = loggedInBranch.regionId;
	let destinationRegionId = Number($('#destinationRegionId').val());
	let validateFreightAmount = true;
	
	if (configuration.applyRegionToRegionPercentageChargeRateOnBookingTotal == 'true') {
		srcDestRegionIdsForCrossingAndFrt.forEach(function(regionPair) {
			const [sourceID, destID] = regionPair.split('_');
	
			if (sourceRegionId == sourceID && destinationRegionId == destID)
				validateFreightAmount = false;
		});
	}
	
	let freight			= Number($('#charge' + FREIGHT).val());
	let qtyAmountTotal	= 0;
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#qtyAmountTotal' + element).html() > 0)
				qtyAmountTotal 	+= parseInt($('#qtyAmountTotal' + element).html());
		}
	}

	if(validateFreightAmount && freight != qtyAmountTotal) {
		showMessage('error', ' Freight and Article amount mismatch, Please delete consignment and add again !');
		return false;
	}
	
	return true;
}

function categoryTypeValidation() {
	if (configuration.doNotValiadteCategoryTypeForSundry == 'true' && getBookingType() == BOOKING_TYPE_SUNDRY_ID) 
        return true; 
    
	return configuration.validateCategoryType == 'false'
	|| configuration.validateCategoryType == 'true' && validateInputTextFeild(1, 'categoryType', 'categoryType', 'error', selectCategoryType);
}

function gstTypeValidation() {
	return configuration.validateGstType == 'false'
	|| configuration.validateGstType == 'true' && validateInputTextFeild(1, 'gstType', 'gstType', 'error', selectGSTType);
}

function validateBookedBy() {
	return configuration.validateBookedBy == 'false'
	|| configuration.validateBookedBy == 'true' && validateInputTextFeild(1, 'bookedBy', 'bookedBy', 'error', enterBookedByErrMsg);
}

function branchServiceTypeSelectionValidation() {
	if (configuration.validateBranchServiceType == 'false')
		return true;
		
	if(!validateInputTextFeild(1, 'branchServiceTypeId', 'branchServiceTypeId', 'error', selectBranchServiceTypeErrMsg))
		return false

	let branchServiceTypeId = $('#branchServiceTypeId').val();

	if(branchServiceTypeId == TYPE_OF_BRANCH_ECONOMY && destBranchServiceTypeId != TYPE_OF_BRANCH_ECONOMY && destBranchServiceTypeId != TYPE_OF_BRANCH_BOTH 
		|| branchServiceTypeId == TYPE_OF_BRANCH_EXPRESS && destBranchServiceTypeId != TYPE_OF_BRANCH_EXPRESS && destBranchServiceTypeId != TYPE_OF_BRANCH_BOTH) {
		showMessage('info', 'Please Select Proper Branch Service Delivery Type !');
		$('#branchServiceTypeId').focus();
		return false;
	}
	
	return true;
}

function validateGSTNumberOnPayablePartyInWithBill() {
	let consignoCorprGstn	= getConsignorGstnEle();
	let consigneeCorprGstn	= getConsigneeGstnEle();
	
	if(configuration.isAllowToShowBillingPartyGSTN == 'true' && getWayBillTypeId() == WAYBILL_TYPE_CREDIT)
		consignoCorprGstn = $('#billingGstn').val();
	
	return !(getWayBillTypeId() == WAYBILL_TYPE_PAID && !validateInputTextFeild(1, consignoCorprGstn, consignoCorprGstn, 'error', enterGstnErrorMsgConsignor)
		|| getWayBillTypeId() == WAYBILL_TYPE_CREDIT && !validateInputTextFeild(1, consignoCorprGstn, consignoCorprGstn, 'error', enterGstnErrorMsgBillingParty)
		|| getWayBillTypeId() == WAYBILL_TYPE_TO_PAY && !validateInputTextFeild(1, consigneeCorprGstn, consigneeCorprGstn, 'error', enterGstnErrorMsgConsignee));
}

function getWayBillTypeId() {
	return $('#wayBillType').val();
}

function blockBookingOnMobileNumber(obj) {
	return !(configuration.BlockBookingOnMobileNumbers == 'true'
		&& (obj != null && !blockBookingOnCustomerNumber(obj.id)
			|| !blockBookingOnCustomerNumber('consignorPhn')
			|| !blockBookingOnCustomerNumber('consigneePhn')));
}

function blockBookingOnCustomerNumber(elementId) {
	let mobileNumbersForBlocking = (configuration.MobileNumbersToBlockBooking).split(",");
	
	if(isValueExistInArray(mobileNumbersForBlocking, $('#' + elementId).val())) {
		showMessage('error', blockMobileNumberErrorMsg($('#' + elementId).val()));	
		$("#" + elementId).val('');
		setTimeout(function() {$('#' + elementId).focus();}, 200);
		return false;
	}
	
	return true;
}

function validateGstNumberWhenExistingGSTNumberRemoved(elementId) {
	if(configuration.validateGstNumberWhenExistingGSTNumberRemoved == 'false')
		return true
	
	if((elementId == 'consignorGstn' || elementId == 'consignoCorprGstn') && $('#prevConsignorGstn').val() != '' && !validateGstnForConsignor()) {
		$('#' + elementId).val($('#prevConsignorGstn').val());
		return false;
	} else if((elementId == 'consigneeGstn' || elementId == 'consigneeCorpGstn') && $('#prevConsigneeGstn').val() != '' && !validateGstnForConsignee()) {
		$('#' + elementId).val($('#prevConsigneeGstn').val());
		return false;
	} else if(elementId == 'billingGstn' && $('#prevBillingGstn').val() != '' && !validateGstnForBilling()) {
		$('#' + elementId).val($('#prevBillingGstn').val());
		return false;
	}
		
	return true;
}

function minimumQtyAmnt() {
	let wayBillType		= getWayBillTypeId();
	
	if(Number(wayBillType) == WAYBILL_TYPE_FOC)
		return true;
		
	let artAmount					= Number($("#qtyAmount").val());
	let minimumArtAmount			= Number(configuration.minimumArtAmount);
	let minimumArtAmountForPaid		= Number(configuration.minimumArtAmountForPaid);
	let minimumArtAmountForToPay 	= Number(configuration.minimumArtAmountForToPay);
		
	if(configuration.checkingForMinimumArtAmount == 'true' && artAmount > 0 && artAmount < minimumArtAmount) {
		showMessage('error', 'Article Amount Cannot Be Less Than ' + minimumBookingAmount + ' Rs !');
		return false;
	}
	
	if(configuration.checkingForMinimumArtAmountForPaid == 'true' && wayBillType == WAYBILL_TYPE_PAID
		&& artAmount > 0 && artAmount < minimumArtAmountForPaid) {
		showMessage('error', 'Article Amount Cannot Be Less Than ' + minimumArtAmountForPaid + ' Rs !');
		return false;
	}
	
	if(configuration.checkingForMinimumArtAmountForToPay == 'true' && wayBillType == WAYBILL_TYPE_TO_PAY
		&& artAmount > 0 && artAmount < minimumArtAmountForToPay) {
		showMessage('error', 'Article Amount Cannot Be Less Than '+minimumArtAmountForToPay+' Rs !');
		return false;
	}

	return true;
}


function validateConsignorAddress() {
	return validateInputTextFeild(1, 'consignorAddress', 'consignorAddress', 'error', 'Please Enter Consignor Address');
}

function validateConsigneeAddress() {
	return validateInputTextFeild(1, 'consigneeAddress', 'consigneeAddress', 'error', 'Please Enter Consignee Address');
}

function validateConsignorEmail() {
	return validateInputTextFeild(1, 'consignorEmail', 'consignorEmail', 'error', 'Please Enter Consignor Email');
}

function validateConsigneeEmail() {
	return validateInputTextFeild(1, 'consigneeEmail', 'consigneeEmail', 'error', 'Please Enter Consignee Email');
}

function validateActualWeightOnSundry() {
	if (configuration.isValidateActualWeightOnSundryToChangeInFtl != 'true')
		return true;

	if(parseInt($('#actualWeight').val()) >= configuration.actualWeightOnSundryBookingToChangeInFtl && getBookingType() == BOOKING_TYPE_SUNDRY_ID) {
		showMessage('error', 'Actual Weight Is More Than ' + configuration.actualWeightOnSundryBookingToChangeInFtl + ' Please Select ' + BOOKING_TYPE_FTL_NAME);
		return false;
	}
	
	return true;
}

function isAllowToAddDefaultFormCharge() {
	let wayBillTypeId 		= getWayBillTypeId();
	
	return configuration.addDefaultFormChargeWhenEWayBillNotEntered == 'true' && $('#singleEwaybillNo').val() == '' && checkBoxArray.length == 0
	&& isValueExistInArray((configuration.branchIdsToAddDefaultFormCharge).split(','), branchId) && isValueExistInArray((configuration.wayBillTypeIdsToAddDefaultForFormCharge).split(','), wayBillTypeId);
}

function validateFormChargeMinValue() {
	let formChargeValue 	= $('#charge' + FORM_CHARGES).val();
	let	minFormChargeAmt 	= Number(configuration.defaultFormChargeAmount);
	let freightCharge		= Number($('#charge1').val())
	let freightAmtToCmp 	= Number(configuration.freightAmountToCompareForFormTypeCharge);
	let formChargeAmountForLessFreight = Number(configuration.formChargeAmountForLessFreight);
	let chargeWeightToCompareForFormTypeCharges= Number(configuration.chargeWeightToCompareForFormTypeCharges);
	let	chgweight			= Number($('#chargedWeight').val());

	if(isAllowToAddDefaultFormCharge()) {
		if(freightCharge <= Number(freightAmtToCmp) && chgweight <= chargeWeightToCompareForFormTypeCharges)
			minFormChargeAmt = formChargeAmountForLessFreight;
		
		if (Number(formChargeValue) < minFormChargeAmt) {
			showMessage("error", "You Can not Enter Form Charges Amount Less than " + minFormChargeAmt + ".");
			changeError1('charge' + FORM_CHARGES, '0', '0');

			setTimeout(function() {
				$('#charge' + FORM_CHARGES).focus();
			}, 100);

			return false;
		}
			
		removeError('charge' + FORM_CHARGES);
	}

	return true;
}

function checkInvoiceDate() {
 	let invoiceDateVal = $('#invoiceDate').val();
	
	if(invoiceDateVal !== '' && !isValidDateFormat(invoiceDateVal)) {
		showMessage('error', 'Invalid date format. Use "dd-mm-yyyy".');
		$('#invoiceDate').val(''); // Reset the input field
		return false;
	}
}

function validateBusinessType() {
	if(configuration.validateBussinessType == 'false')
		return true;
	
	if (!validateInputTextFeild(1, 'businessType', 'businessType', 'error', bussinesErrMsg)) {
		isValidationError = true;
		return false;
	}
	
	return true;
}

function validateTollChargeRegionWise() {
	let tollCharge = Number($('#charge' + TOLL ).val());
	
	if (tollCharge <= 0 && regionToValidateTollCharge()) {
		showMessage("error", "Toll Charge Cannot be 0.");
		setTimeout(function() {
			$('#charge' + TOLL).focus();
		}, 100)

		return false;
	}
	
	return true;
}

function regionToValidateTollCharge() {
	return isValueExistInArray((configuration.regionToValidateTollCharge).split(','), executive.regionId);
}

function validateSealNumber() {
	return configuration.validateSealNumber == 'false' || validateInputTextFeild(1, 'sealNumber', 'sealNumber', 'error', 'Please Enter Seal Number');
}

function validateVehiclePONumber() {
	return configuration.validateVehiclePoNumber == 'false' || validateInputTextFeild(1, 'vehiclePONumber', 'vehiclePONumber', 'error', 'Please Enter Vehicle PO Number');
}

function validateDeclarationType() {
	if(configuration.validateMultipleDeclarationType == 'false')
		return true;
	
	const declarationTypeIds	= [...document.querySelectorAll('#declarationTypeNewId input[type="checkbox"]')]
	.filter(cb => cb.checked).map(cb => cb.value).join(',');

	let notSelected	= [];
	
	for(const element of (configuration.declarationTypeIdsForValidation).split(',')) {
		if(!declarationTypeIds.includes(element))
			notSelected.push(element);
	}
	
	let result = (jsondata.declarationTypeList).filter(function (el) {
		return notSelected.indexOf(String(el.declarationTypeId)) >= 0; 
	});
	
	if (result.length > 0) {
		const labels = result.map(obj => obj.declarationTypeName).join(', ');
		showMessage('error', `Please select ${labels} declaration types!`);
		return false;
	}
	
	return true;
}

function validateForwardType() {
	return configuration.showForwardType == 'false' || validateInput(1, 'forwardTypeId', 'forwardTypeId', 'error', forwardTypeErrMsg);
}

function validateHsnCode() {
	return configuration.showHsnCodeSelection == 'false' || validateInput(1, 'hsnCodeId', 'hsnCodeId', 'error', hsnCodeErrMsg);
}

function validateTransportationMode() {
	return configuration.validateTransportationMode == 'false' || validateInput(1, 'transportationMode', 'transportationMode', 'error', 'Select Transporation Mode !');
}

function validationOCCharge() {
	let selectedDeliveryId = Number($('#deliveryTo').val()); 

	if (selectedDeliveryId === DELIVERY_TO_DOOR_ID) {  
		let ocCharge = $('#charge' + OC_CHARGE).val();
	
		if (!ocCharge || ocCharge <= 0) { 
			showMessage('error', 'OC Charge cannot be empty!');
 			return false;  
		}
	}

	return true; 
}

function validateDivsion() {
	return configuration.showDivisionSelection == 'false' || validateInput(1, 'waybillDivisionId', 'waybillDivisionId', 'error', 'Select Division !');
}

function validatePackageCondition() {
	if (configuration.validatePackageCondition == 'true') {
		if (!validateInputTextFeild(1, 'packageCondition', 'packageCondition', 'error', 'Select Package Condition !')) {
			isValidationError = true;
			setTimeout(function() { 
			$('#packageCondition').focus(); 
		}, 200);
			return false;
		}
	}

	return true;
}

function validateInvoiceDetailsOnConfiguredParty() {
	if($('#wayBillType').val() == WAYBILL_TYPE_FOC) return false;
	
	 validatePartNumber = validatePartNumberForConsignor || validatePartNumberForConsignee || validatePartNumberForTBB;
	 validateInvoiceNumber = validateInvoiceNumberForConsignor || validateInvoiceNumberForConsignee || validateInvoiceNumberForTBB;

	return validatePartNumber || validateInvoiceNumber;
}

function validateWeightField($field, fieldName) {
	const val = Number($field.val());
	
	if (!val || val <= 0) {
		showMessage('error', `Please enter ${fieldName}!`);
		  setTimeout(() => {
			$field.focus();
		}, 10);
		return false;
	} else {
		hideInfo();
	}
	
	return true;
}