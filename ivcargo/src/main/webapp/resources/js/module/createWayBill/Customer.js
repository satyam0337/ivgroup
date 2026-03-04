var addNewPartyOverlay	= false;
var globalPartyToPartyConfigList = null;
var singleLrTypeAllowedForPartyToPartyConfig = false;

function configurePartyInfo() {
	if (configuration.makeBillingBranchFieldReadOnly == 'true')
		$('#billingBranch').prop('readonly', true);
	
	if (configuration.NewPartyAutoSave == 'true' || configuration.newPartySaveOnGstNumberAvailable == 'true')
		setNewPartyType();

	if(configuration.TinNumber == 'true') {
		switchHtmlTagClass('ConsinorTinOption', 'show', 'hide');
		switchHtmlTagClass('ConsineeTinOption', 'show', 'hide');
	}
	
	if(configuration.PartyCodeWiseBooking == 'true' || configuration.PartyCodeWiseBooking == true) {
		switchHtmlTagClass('PartyCodeDetailsConsignor', 'show', 'hide');
		switchHtmlTagClass('PartyCodeDetailsConsignee', 'show', 'hide');
	}
	
	if(configuration.gstnNumber == 'true') {
		if(isGSTNumberWiseBooking()) {
			$("#gstnCorpConsignor").css("display", "table-cell");
			$("#gstnCorpConsignee").css("display", "table-cell");
			$('#cnorGstn1').removeClass('hide');
			$('#cgneeGstn1').removeClass('hide');
		} else {
			$("#gstnConsignor").css("display", "table-cell");
			$("#gstnConsignee").css("display", "table-cell");
		}
	}

	if(configuration.gstnVerificationLink == 'true') {
		if(isGSTNumberWiseBooking()) {
			$("#gstnCorpConsignorVerify").css("display", "table-cell");
			$("#gstnCorpConsigneeVerify").css("display", "table-cell");
		} else {
			$("#gstnConsignorVerify").css("display", "table-cell");
			$("#gstnConsigneeVerify").css("display", "table-cell");
		}
	}
	
	if(configuration.Pincode == 'true') {
		if(isGSTNumberWiseBooking()) {
			$("#consignorCorpPinOption").css("display", "table-cell");
			$("#consigneeCorpPinOption").css("display", "table-cell");
			$("#consignorPinOption").remove();
			$("#consigneePinOption").remove();
		} else{
			$("#consignorPinOption").css("display", "table-cell");
			$("#consigneePinOption").css("display", "table-cell");
			$("#consignorCorpPinOption").remove();
			$("#consigneeCorpPinOption").remove();
		}
		
		$('#hiddenConsignorPin').remove();
		$('#hiddenConsigneePin').remove();
	} else {
		$("#consignorPinOption").remove();
		$("#consigneePinOption").remove();
		$("#consignorCorpPinOption").remove();
		$("#consigneeCorpPinOption").remove();
	}
	
	if (configuration.consignerAddress == 'true')
		$('#consignorAddress').show();
	else
		$('#consignorAddress').hide();
	
	if (configuration.consigneeAddress == 'true')
		$('#consigneeAddress').show();
	else
		$('#consigneeAddress').hide();
		
	if (configuration.hideConsignorMobileField == 'true' || configuration.hideConsignorMobileField == true)
		$('.hideConsignorMobileField').hide();
							
	if (configuration.hideConsigneeMobileField == 'true' || configuration.hideConsigneeMobileField == true)
		$('.hideConsigneeMobileField').hide();
	
	if(configuration.VolumetricWiseAddArticle == 'true') {
		$('#consignorCFTOption').show();
		$('#consigneeCFTOption').show();
	}
	
	if(configuration.disableCopyPasteOnConsignorConsigneeInput == 'true'){
		$('#consignorName').bind("cut copy paste",function(e) {
			e.preventDefault();
		});
		
		$('#consigneeName').bind("cut copy paste",function(e) {
			e.preventDefault();
		});
	}
	
	if(configuration.showConsignorSMSCheckBox == 'true')
		$('#hideSendsmsConr').removeClass('hide');
	else
		$('#hideSendsmsConr').remove();

	if(configuration.showConsigneeSMSCheckBox == 'true')
		$('#hideSendSmsConee').removeClass('hide');
	else
		$('#hideSendSmsConee').remove();
	
	if(configuration.landlineNoAllowedInMobileNoFeild == 'true' || configuration.landlineNoAllowedInMobileNoFeild == true){
		$('#consignorPhn').prop('maxlength', 11);
		$('#consigneePhn').prop('maxlength', 11);
	}
	
	$('#consignorPartyCode').attr('maxlength', configuration.PartyCodeMaxLength);
	$('#consigneePartyCode').attr('maxlength', configuration.PartyCodeMaxLength);
	
	if(configuration.showConsignorConsigneeEmailField == 'true') {
		switchHtmlTagClass('showhideconsignerdetails', 'show', 'hide');
		switchHtmlTagClass('Consigneradd', 'visibility-hidden', 'visibility-visible');
		switchHtmlTagClass('Consignersub', 'visibility-hidden', 'visibility-visible');
		$("#consignorContactPerson").closest("td").hide()
		$("#consignorDept").closest("td").hide(); 
		$("#consignorFax").closest("td").hide();
		$("#consignorPin").closest("td").hide();
		$("#consignorEmail").after('<span style="color: red; font-size: 25px;">*</span>');
		
		switchHtmlTagClass('showhideconsigneedetails', 'show', 'hide');
		switchHtmlTagClass('Consigneeadd', 'visibility-hidden', 'visibility-visible');
		switchHtmlTagClass('Consigneesub', 'visibility-hidden', 'visibility-visible');
		$("#consigneeContactPerson").closest("td").hide()
		$("#consigneeDept").closest("td").hide(); 
		$("#consigneeFax").closest("td").hide();
		$("#consigneePin").closest("td").hide();
		$("#consigneeEmail").after('<span style="color: red; font-size: 25px;">*</span>');
	}
	
	if(configuration.disableCopyPasteOnGSTInput == 'true') {                       //  Disable Copy Paste On GST Input
		$('#consignorGstn').bind("cut copy paste", function(e) {
			e.preventDefault();
		});
		
		$('#consignoCorprGstn').bind("cut copy paste", function(e) {
			e.preventDefault();
		});
			
		$('#consigneeGstn').bind("cut copy paste", function(e) {
			e.preventDefault();
		});
			
		$('#consigneeCorpGstn').bind("cut copy paste", function(e) {
			e.preventDefault();
		});
	}
}

function checkForNewParty(objId) {
	if (isBookingFromDummyLS) return;

	const obj = document.getElementById(objId);
	const objValue = obj?.value?.trim() || '';
	if (!objValue) return false;

	const consignorParty 	= ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB === 'false') ? $('#consignorCorpId').val() : $('#partyMasterId').val();
	const consigneeParty	= $('#consigneePartyMasterId').val();
	const selfPartyId		= Number(selfCorporateAccountId);

	const consignorGstn = getConsignorGSTNumber();
	const consigneeGstn = getConsigneeGSTNumber();

	updateGstIfRequired(obj, consignorParty, consignorGstn, consigneeParty, consigneeGstn);

	if (configuration.NewPartyAutoSave === 'true') {
		obj.value = objValue.replace(stringNew, '');

		if (obj.id === 'consignorName')
			return handleConsignorParty(objValue, consignorParty, consignorGstn, selfPartyId);
		else if (obj.id === 'consigneeName')
			return handleConsigneeParty(objValue, consigneeParty, consigneeGstn, selfPartyId);
	}

	return false;
}

function updateGstIfRequired(obj, consignorParty, consignorGstn, consigneeParty, consigneeGstn) {
	if (configuration.updatePartyGstNumber !== 'true') return;

	const checkGSTUniqueness = configuration.checkGSTNumberForUnique === 'true';

	if (obj.id === 'consignorName' && isValidInput(obj.value)) {
		if (shouldUpdateGST(consignorParty, consignorGstn, '#prevConsignorGstn', checkGSTUniqueness))
			updatePartyGstNumber(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
	} else if (Number(consigneeParty) > 0 && isValidInput(obj.value)) {
		if (shouldUpdateGST(consigneeParty, consigneeGstn, '#prevConsigneeGstn', checkGSTUniqueness))
			updatePartyGstNumber(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
	}
}

function shouldUpdateGST(partyId, currentGstn, prevGstSelector, checkUnique) {
	const prevGst = $(prevGstSelector).val();
	
	return Number(partyId) > 0 && Number(partyId) !== Number(selfCorporateAccountId) 
	&& (prevGst === '' && currentGstn !== '' || checkUnique && prevGst !== currentGstn);
}

function isValidInput(value) {
	return value && value.trim().toLowerCase() !== '';
}

function handleConsignorParty(name, consignorParty, gstn, selfPartyId) {
	if (!isValidInput(name)) return false;

	if (configuration.newPartySaveOnGstNumberAvailable === 'true' && !gstn) return false;
	if (configuration.validateGstNumberForNewParty === 'true' && !validateGstnForConsignor()) return false;

	if (Number(consignorParty) <= 0) {
		showAddNewPartyDailog(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
		return true;
	} else if (Number(consignorParty) !== selfPartyId) {
		const zerosReg = /[1-9]/g;
		const phoneChanged = $('#prevConsignorPhn').val() !== $('#consignorPhn').val();
		const validPhone = $('#consignorPhn').val() && zerosReg.test($('#consignorPhn').val());

		if (configuration.updatePartyContact === 'true' && phoneChanged && validPhone)
			updatePartyContactDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
		
		return true;
	}
	
	return false;
}

function handleConsigneeParty(name, consigneeParty, gstn, selfPartyId) {
	if (!isValidInput(name)) return false;

	if (Number(consigneeParty) <= 0) {
		if (configuration.newPartySaveOnGstNumberAvailable === 'true' && !gstn) return false;
		if (configuration.validateGstNumberForNewParty === 'true' && !validateGstnForConsignee()) return false;

		showAddNewPartyDailog(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
	} else if (Number(consigneeParty) !== selfPartyId) {
		const zerosReg = /[1-9]/g;
		const phoneChanged = $('#prevConsigneePhn').val() !== $('#consigneePhn').val();
		const validPhone = $('#consigneePhn').val() && zerosReg.test($('#consigneePhn').val());

		if (configuration.updatePartyContact === 'true' && phoneChanged && validPhone)
			updatePartyContactDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
	}
	
	return false
}

function showAddNewPartyDailog(partyType) {
	resetAddNewPartyElements();
	document.getElementById('newPartyType').selectedIndex = partyType;
	
	var newPartyName 			= '';
	var newPartyMobileNumber 	= '';
	var destination 			= '';
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		if(!validateConsignorMobile()) {
			$('#consignorPhn').val('');
			return false;
		}
		
		if (!validateLengthOfConsignorMobileNumber())
			return false;
		
		if (!validateLengthOfConsinorTinNumber())
			return false;
		
		if (!validateLengthOfConsinorGSTNumber())
			return false;

		newPartyName			= $('#consignorName').val();
		newPartyMobileNumber	= $('#consignorPhn').val();
		var sourceBranch		= $("#sourceBranch").val();

		if(newPartyName.length > 0 && (newPartyName.toLowerCase()!= '')) {
			$('#newPartyName').val(newPartyName.replace(stringNew, '')); //stringNew defined in VariableForCreateWayBill.js
			$('#tinNo').val($('#consignorTin').val());

			if(newPartyMobileNumber.length > 0 && (newPartyMobileNumber.toLowerCase() != ''))
				$('#newPartyMobileNumber').val(newPartyMobileNumber);
			else
				$('#newPartyMobileNumber').val('0000000000');
		}

		if (configuration.showCityNameInsteadOfBranchName == 'true') {
			$('#newPartyAddress').val(executive.cityName);
			$('#consignorAddress').val(executive.cityName);
		} else if (configuration.enableNewPartyAddressBySourceBranch == 'true') {
			if (sourceBranch != undefined) {
				$('#consignorAddress').val(sourceBranch);
				$('#newPartyAddress').val(sourceBranch);
			} else {
				$('#newPartyAddress').val(executive.branchName);
				$('#consignorAddress').val(executive.branchName);
			}
		} else {
			$('#newPartyAddress').val(executive.branchName);
			$('#consignorAddress').val(executive.branchName);
		}

		if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
			$('#newPartyGstNumber').val($('#consignoCorprGstn').val());
		else
			$('#newPartyGstNumber').val($('#consignorGstn').val());
		
		$('#newPartyPincode').val($('#consignorPin').val());
	} else {
		if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
			if(!validateConsigneeMobile()) {
				$('#consigneePhn').val('');
				return false;
			}
			
			if (!validateLengthOfConsigneeMobileNumber())
				return false;
			
			if (!validateLengthOfConsineeTinNumber())
				return false;
			
			if (!validateLengthOfConsineeGSTNumber())
				return false;

			newPartyName 			= $('#consigneeName').val();
			newPartyMobileNumber 	= $('#consigneePhn').val();
						
			if(newPartyName.length > 0 && (newPartyName.toLowerCase() != '')) {
				$('#newPartyName').val(newPartyName.replace(stringNew, ''));  //stringNew defined in VariableForCreateWayBill.js
				$('#tinNo').val($('#consigneeTin').val());

				if(newPartyMobileNumber.length > 0 && (newPartyMobileNumber.toLowerCase() != ''))
					$('#newPartyMobileNumber').val(newPartyMobileNumber);
				else
					$('#newPartyMobileNumber').val('0000000000');
			}
			
			if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
				$('#newPartyGstNumber').val($('#consigneeCorpGstn').val());
			else
				$('#newPartyGstNumber').val($('#consigneeGstn').val());

			$('#newPartyPincode').val($('#consigneePin').val());
		}
		
		//Comment By Chayan
		// If destination branch from other group then use executive subregion name in consignee address
		if(executive.accountGroupId == destBranchAccountGroupId) { 
			if(configuration.ShowCityAndDestinationBranch == 'true' && !isManualWayBill)
				destination = $('#destinationIdEle').val();
			else if(configuration.showSubRegionwiseDestinationBranchField == 'true')
				destination = $("#DestBranchIdEle option:selected").text();
			else
				destination = $('#destination').val();
			
			if(configuration.ShowCityAndDestinationBranch == 'true' && !isManualWayBill || (destination.indexOf('(') - 1) < 0) {
				$('#newPartyAddress').val(destination.substring(0, destination.length));
				$('#consigneeAddress').val(destination.substring(0, destination.length));
			} else if(configuration.showCityNameInsteadOfBranchName == 'true') {
				$('#newPartyAddress').val(destination.substring(destination.indexOf('(') + 1, destination.indexOf(')') - 1));
				$('#consigneeAddress').val(destination.substring(destination.indexOf('(') + 1, destination.indexOf(')') - 1));
			} else {
				$('#newPartyAddress').val(destination.substring(0, destination.indexOf('(') - 1));
				$('#consigneeAddress').val(destination.substring(0, destination.indexOf('(') - 1));
			}
		} else {  
			if(configuration.ShowCityAndDestinationBranch == 'true' && !isManualWayBill)
				destination = $('#destinationIdEle').val();
			else
				destination = $('#destination').val();
			
			if(destination != undefined || destination != 'undefined'){
				if(configuration.showCityNameInsteadOfBranchName == 'true') {
					$('#newPartyAddress').val(destination.substring(destination.indexOf('(') + 1, destination.indexOf(')') - 1));
					$('#consigneeAddress').val(destination.substring(destination.indexOf('(') + 1, destination.indexOf(')') - 1));
				} else {
					$('#newPartyAddress').val(destination.substring(0, destination.indexOf('(') - 1));
					$('#consigneeAddress').val(destination.substring(0, destination.indexOf('(') - 1));
				}
			} else {
				$('#newPartyAddress').val(executive.branchName);
				$('#consigneeAddress').val(executive.branchName);
			}
		}
	}
	
	if(configuration.AddNewPartyOverlay == 'true') {
		document.getElementById('dialog-title').textContent = 'Add New Party';
		
		if(configuration.addNewPartyPermissionBased == 'true') {
			if(jsondata.PARTY_AUTO_SAVE) {
				showHideTinNumberField();
				hidePincodeField();
				showHidePanNumberField();
				
				var partyType = $('#newPartyType').val();
				
				if(confirm("Are you sure you want to save Party ?"))
					ShowDialog(true);
				else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING)
					setNextEleFocusForConsinor();
				else if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
					setNextEleFocusForConsignee();
			}
		} else {
			showHideTinNumberField();
			hidePincodeField();
			showHidePanNumberField();
			
			var partyType = $('#newPartyType').val();
			
			if(confirm("Are you sure you want to save Party ?"))
				ShowDialog(true);
			else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING)
				setNextEleFocusForConsinor();
			else if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
				setNextEleFocusForConsignee();
		}
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING || partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		if(configuration.partyPanelType == '2') {
			if($('#newPartyMobileNumber').val() != '0000000000')
				saveNewParty(partyType);
		} else
			saveNewParty(partyType);
	}
}

function showHideTinNumberField() {
	if(configuration.ShowTinNumberWhileAddNewParty == 'true')
		$("#tinNumberRW").show();
	else
		$("#tinNumberRW").hide();
}

function hidePincodeField() {
	if(configuration.Pincode == 'false')
		$("#pincodeRW").hide();
}

function showHidePanNumberField() {
	if(configuration.showPanCardNoFeildOnPartySavePopUp == 'false' || configuration.showPanCardNoFeildOnPartySavePopUp == false)
		$("#panNumberRW").hide();
}

function setNextEleFocusForConsinor() {
	if(isGSTNumberWiseBooking()) {
		if (configuration.showConsignorConsigneeEmailField == 'true')
			next   = 'consignorEmail';
		else
			next  =  'consigneeCorpGstn';
	} else if(configuration.partyPanelType == '1'){
		if($('#billingPartyId').val() == 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT && $("#consignorName").val() != '')
			next = 'billingPartyName';
		else
			next	= 'consigneeName';
	}else
		next	= 'consigneePhn';
}

function setNextEleFocusForConsignee() {
	if(configuration.SetFocusAfterAddConsigneePartyOnChargeType == 'true' && configuration.ChargeType == 'true') {
		if (configuration.showConsignorConsigneeEmailField == 'true')
			next	= 'consigneeEmail'
		else
			next	= 'chargeType';
	} else if (configuration.showConsignorConsigneeEmailField == 'true')
		next	= 'consigneeEmail'
	else
		next	= 'quantity';
}

/*
 * This function is work to save Consignor party as source branch level or Destination Branch Level
 */
function getBranchIdForConsignorParty() {
	var partyBranchId	= 0;
	
	var ConsignorPartySaveBranchFlavor	= configuration.ConsignorPartySaveBranchFlavor;
	
	switch (Number(ConsignorPartySaveBranchFlavor)) {
	case 1:		//Source Branch Flavor
		partyBranchId	= executive.branchId;
		break;
	case 2:		//Destination Branch Flavor
		partyBranchId	= $('#destinationBranchId').val();
		break;
	default:
		partyBranchId	= executive.branchId;
		break;
	}
	
	return partyBranchId;
}

/*
 * This function is work to save Consignee party as source branch level or Destination Branch Level
 */
function getBranchIdForConsigneeParty() {
	var partyBranchId	= 0;
	
	var ConsigneePartySaveBranchFlavor	= configuration.ConsigneePartySaveBranchFlavor;
	
	switch (Number(ConsigneePartySaveBranchFlavor)) {
	case 1:		//Source Branch Flavor
		partyBranchId	= executive.branchId;
		break;
	case 2:		//Destination Branch Flavor
		partyBranchId	= $('#destinationBranchId').val();
		break;
	default:
		partyBranchId	= executive.branchId;
		break;
	}
	
	return partyBranchId;
}

function saveNewParty(partyType) {
	if($('#newPartyName').val() == 'No Record Found')
		return false;
	
	var partyTypeId = $('#newPartyType').val();
	var isCheckGstnOnPartyAndLrType		= false;

	if((configuration.doNotValidateGSTNOnConsignorId == 'true' || configuration.doNotValidateGSTNOnConsignorId == true) && partyTypeId == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		isCheckGstnOnPartyAndLrType		= true;

	if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY && configuration.DestinationAutocomplete == 'true') {
		if(!validateDestinationBranch()) return false;
	}
	
	if(configuration.AddNewPartyOverlay == 'true') {
		if(!validateNewPartyType()) return false;
		if(!validateNewPartyName()) return false;
		
		if (configuration.ConsigneeMobileNoValidate == 'true') {
			if(!validateNewPartyMobileNumber()) return false;
		}
	
		if (configuration.ConsignorMobileNoValidate == 'true') {
			if(!validateNewPartyMobileNumber()) return false;
		}

		if(!validateNewPartyAddress()) return false;
		if(!validateTinNumberOnPopup()) return false;
		
		if ((configuration.validateGSTNumberOnPartySavePopUp == 'true' || configuration.validateGSTNumberOnPartySavePopUp == true)
		&& !validateInputTextFeild(1, 'newPartyGstNumber', 'newPartyGstNumber', 'info', gstnErrMsg))
			return false;
			
		if(!validateInputTextFeild(9, 'newPartyGstNumber', 'newPartyGstNumber', 'info', gstnValidationErrMsg))
			return false;

		if((configuration.showPanCardNoFeildOnPartySavePopUp == 'true' || configuration.showPanCardNoFeildOnPartySavePopUp == true)
			&& (configuration.validatePanCardNoOnPartySavePopUp == 'true' || configuration.validatePanCardNoOnPartySavePopUp == true)) {
			if(!validateInputTextFeild(1, 'newPartyPanNo', 'newPartyPanNo', 'info', panNumberErrMsg))
				return false;  

			if(!validateInputTextFeild(8, 'newPartyPanNo', 'newPartyPanNo', 'info', validPanNumberErrMsg)) {
				setValueToTextField('newPartyPanNo', '');
				return false;
			}
		}
	}
	
	if(addNewPartyOverlay && !validateInputTextFeild(9, 'newPartyGstNumber', 'newPartyGstNumber', 'info', gstnValidationErrMsg))
		return false;

	var partyType = $('#newPartyType').val();
	var partyName = document.getElementById('newPartyName').value.toUpperCase();

	var partyMobileNumber 	= $('#newPartyMobileNumber').val();
	var partyAddress 		= $('#newPartyAddress').val();
	var partyBranchId 		= 0;
	var partyId 			= 0;
	var sourceBranch 		= $("#sourceBranch").val();
		
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		setNextEleFocusForConsinor();
		partyBranchId 	= getBranchIdForConsignorParty();
		
		if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
			partyId = $('#consignorCorpId').val();
		else
			partyId = $('#partyMasterId').val();
		
	} else if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		setNextEleFocusForConsignee();
		partyId = $('#consigneePartyMasterId').val();
		//Comment By Chayan
		// If destination branch from other group then use executive branch id as consignee party branch id
		if(executive.accountGroupId == destBranchAccountGroupId) {
			if(configuration.ShowCityAndDestinationBranch == 'true' && !isManualWayBill)
				partyBranchId 	= $('#destinationIdEle_primary_key').val();
			else
				partyBranchId	= getBranchIdForConsigneeParty();
		} else
			partyBranchId 	= executive.branchId;
	}
	
	var tinNo		  	= $('#tinNo').val();
	var panNumber		= $('#newPartyPanNo').val();
	
	if(partyBranchId > 0) {
		var jsonObject					= new Object();

		jsonObject.partyType			= CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH;
		jsonObject.partyName			= partyName;
		if (configuration.enableNewPartyAddressBySourceBranch == 'true') {
			if (sourceBranch != undefined)
				jsonObject.partyAddress = sourceBranch;
			else
				jsonObject.partyAddress = partyAddress;
		} else
			jsonObject.partyAddress = partyAddress;
		
		jsonObject.partyMobileNumber	= partyMobileNumber;
		jsonObject.partyBranchId		= partyBranchId;
		jsonObject.tinNo				= tinNo;
		jsonObject.gstn					= $('#newPartyGstNumber').val();
		jsonObject.panNumber			= panNumber;
		jsonObject.pincode				= $('#newPartyPincode').val();
		jsonObject.isValidPartyGstn		= validUpdateGstn;
		jsonObject.isCheckGstnOnPartyAndLrType	= isCheckGstnOnPartyAndLrType;
		
		if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING)
			jsonObject.isTaxRqrd		= configuration.ConsignorTaxPaidByTransporter;
		else if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
			jsonObject.isTaxRqrd		= configuration.ConsigneeTaxPaidByTransporter;
		
		jsonObject.isPodRequired		= podConfiguration.defaultPODRequiredOnPartySave;
		
		if(partyId > 0)
			jsonObject.partyId = partyId;
		
		var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("CorporatePartySaveAjaxAction.do?pageId=9&eventId=17",
					{json:jsonStr}, function(data) {
						if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							if(typeof data.errorDescription != 'undefined') {
								showMessage('error', data.errorDescription);
								resetGSTNumberIfDuplicate();
							}
						} else {
							addNewPartyOverlay	= false;
							var newPartyId = parseInt(data.partyid);

							if(newPartyId > 0) {
								if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
									isPartyChargeInclusive	= false;
									$('#consignorName').val(partyName);
									$('#consignorPhn').val(partyMobileNumber);
									if (configuration.enableNewPartyAddressBySourceBranch == 'true') {
										if (sourceBranch != undefined)
											$('#consignorAddress').val(sourceBranch);
										else 
											$('#consignorAddress').val(partyAddress);
									} else
										$('#consignorAddress').val(partyAddress);
									
									$('#consignorTin').val(tinNo);
									$('#consignorPin').val($('#newPartyPincode').val());
									$('#consignorGstn').val(data.gstn);
									$('#consignoCorprGstn').val(data.gstn);
									$('#consignorPan').val(panNumber);
					
									if($('#wayBillType').val() != WAYBILL_TYPE_CREDIT) {
										$('#partyMasterId').val(newPartyId);
										//Called from Rate.js
										AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, 'partyMasterId');
									} else
										$('#consignorCorpId').val(newPartyId);
										
									if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'true')
										$('#partyMasterId').val(newPartyId);
									
									$('#partyOrCreditorId').val(newPartyId);
								} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
									$('#consigneeName').val(partyName);
									$('#consigneePhn').val(partyMobileNumber);
									$('#consigneeAddress').val(partyAddress);
									$('#consigneeTin').val(tinNo);
									$('#consigneePin').val($('#newPartyPincode').val());
									$('#consigneeGstn').val(data.gstn);
									$('#consigneeCorpGstn').val(data.gstn);
									$('#consigneePan').val(panNumber);
									$('#consigneePartyMasterId').val(newPartyId);
									
									//Called from Rate.js
									AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, 'consigneePartyMasterId');
								}
							} else {
								alert('There was an error while saving, please try again !');
								return;
							}
						}
					});
					
					validUpdateGstn = false;
		}
	HideDialog();
}

function resetAddNewPartyElements() {
	$('#newPartyName').val('');
	$('#newPartyMobileNumber').val('');
	$('#newPartyAddress').val('');
	$('#newPartyGstNumber').val('');
	$('#newPartyPanNo').val('');
	$('#newPartyPincode').val('');
		
	if ($('#tinNo').exists())
		$('#tinNo').val('')

	//toogleElement('addNewPartyErrorDiv','none');
	hideAllMessages();
	removeError('newPartyType');
	removeError('newPartyName');
	removeError('newPartyMobileNumber');
	removeError('newPartyGstNumber');
	removeError('newPartyPanNo');
	removeError('newPartyPincode');
	removeError('newPartyAddress');
}

function getCorporateAccountId() { // Name change from isPartyExist() 
	var corporateAccountId1 = 0;

	if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		corporateAccountId1	= $('#consigneePartyMasterId').val();
	else
		corporateAccountId1	= $('#partyMasterId').val();

	return corporateAccountId1;
}

function getPartyDetails(partyId, name, no, tin, add, pin, conName, email, dept, fax, partyType, gstn, cftValue) {
	let jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.getCharge			= 1;
	jsonObject.partyPanelType		= configuration.partyPanelType;
	jsonObject.partyType			= getGeneralPartyDetails;
	jsonObject.wayBillTypeId		= Number($('#wayBillType').val());
	isValidatedPartyGstn 			= false;
	jsonObject.partyTypeId			= partyType;
	jsonObject.destinationBranchId	= $('#destinationBranchId').val();
	
	if(configuration.lrTypeWisePartyToPartyConfiguration == 'true' && partyType == PARTY_TYPE_CONSIGNEE) {
		jsonObject.sourceBranchId		= isManualWayBill ? $('#sourceBranchId').val() : executive.branchId;
		jsonObject.destinationBranchId	= $('#destinationBranchId').val();
		jsonObject.consignorId			= [$('#consignorCorpId').val(), $('#partyMasterId').val()].filter(v => v && v !== "0")[0] || null;
		jsonObject.consigneeId			= [$('#consigneeCorpId').val(), $('#consigneePartyMasterId').val()].filter(v => v && v !== "0")[0] || null;
	}

	let jsonStr = JSON.stringify(jsonObject);
	showLayer();
	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					hideLayer();
						
					if (partyType == PARTY_TYPE_CONSIGNOR) {
						resetConsignor();
						$("#consignorName").focus();
					} else if (partyType == PARTY_TYPE_CONSIGNEE) {
						resetConsignee();
						$("#consigneeName").focus();
					}
				} else {
					hideLayer();
					
					if(!data.partyDetails)
						return;

					let party = data.partyDetails;
					
					if(configuration.lrTypeWisePartyToPartyConfiguration == 'true' && data.partyToPartyConfigList && data.partyToPartyConfigList.length > 0) {
						globalPartyToPartyConfigList = data.partyToPartyConfigList;
						
						if(!lrTypesValidationForPartyToPartyConfig())
							return;
					}
					
					partyWiseDataHM[party.corporateAccountId]	= party;
					partyWiseMinimumValueDataHM[party.corporateAccountId]	= data.minimumValueRateList;
					slabWisePartyMinimumAmtHM[party.corporateAccountId] 	= data.slabWisePartyMinimumAmtList;
					
					if(configuration.showAlertMsgInTopayAndPaidBookingForTBBParty == 'true')
						showAlertMessageForTBBPartyInTopayAndPaidBooking(party.tBBParty);
						 
					if(!doNotAllowTBBPartyInTopayAndPaidBooking(partyType, party.tBBParty, configuration.doNotAllowTBBPartyInTopayAndPaidBooking))
						return false;
						
					if(configuration.showPartyIsBlackListedParty == 'true' && party.blackListed > 0) {
						if(partyType == PARTY_TYPE_CONSIGNOR) {
							$("#consignorName").css("border-color", "red");
							showMessage('error',CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_NAME+' Party is BlackListed');
						} else if(partyType == PARTY_TYPE_CONSIGNEE) {
							$("#consigneeName").css("border-color", "red");
							setTimeout(function(){
								showMessage('error',CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_NAME+' Party is BlackListed');
							},100);
						}
					}
					
					if(configuration.doNotAllowBookingForBlackListedParty == 'true' 
							&& (party.blackListed == 1 || party.blackListed == 3)) {
						if(partyType == PARTY_TYPE_CONSIGNOR)
							resetConsignor();
						else if(partyType == PARTY_TYPE_CONSIGNEE)
							resetConsignee();

						showMessage('info',"You Can not Book  Lr for "+party.displayName);
						return false;
					} 
			
					if(partyType == PARTY_TYPE_CONSIGNOR) {
						isConsignorTBBParty		= party.tBBParty;
						consignorRateConfigured	= party.rateConfigured;
						consignorPodRequired	= party.podRequired;
						consignorTaxType		= party.taxType;
						cnorPartyDeliveryAt			= 0;
						
						if(configuration.paidTopayBookingAllowForBillingParty == 'false' && isConsignorTBBParty && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT){
							showMessage('error','You Can not Book Paid/Topay/FOC Lr For TBB Customer !');
							$('#consignorName').val('');
							$('#consignorPhn').val('');
							$('#consignorAddress').val('');
							isValidationError = true;
							return;
						}
						
						$('#partyMasterId').val(party.corporateAccountId);
						$('#partyOrCreditorId').val(party.corporateAccountId);
						$('#consignorPan').val(party.panNumber);
						
						if($('#wayBillType').val() == WAYBILL_TYPE_PAID)
							$('#panNumber').val(party.panNumber);
						
						$('#consignorPanNumber').val(party.panNumber);
						$('#prevConsignorPhn').val(party.mobileNumber);
						$('#prevConsignorGstn').val(party.gstn);
						$('#prevConsignorPincode').val(party.pincode);
						$('#shortCreditAllowOnTxnType').val(party.shortCreditAllowOnTxnType);

						if(configuration.allowShortCreditPaymentTypeOnShortCreditParty == 'true' || configuration.allowShortCreditPaymentTypeOnShortCreditParty == true){
							if(Number(party.shortCreditAllowOnTxnType) == SHORT_CREDIT_TXN_TYPE_BOOKING || 
								Number(party.shortCreditAllowOnTxnType) == SHORT_CREDIT_TXN_TYPE_BOTH)
								$('#paymentType').val(PAYMENT_TYPE_CREDIT_ID);
							else
								$('#paymentType').val(PAYMENT_TYPE_CASH_ID);
						}
												
						if(party.gstn != undefined && party.gstn !='')
							isConsignorGSTNPresent = true;
						
						if(isConsignorGSTNPresent && party.validatedPartyGstn != undefined && party.validatedPartyGstn)
							isValidatedPartyGstn = true;
							
						if(isValidGSTChecking() && $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
							if(isConsignorGSTNPresent)
								$('#consigneeName').focus();
							else
								$('#consignorGstn').focus();
						}
					
						$('#consignorPartyCode').val(party.partyCode);
						setPartyWiseInvoiceNumber();
						smsRequiredId		= party.smsRequiredId;
						
						if(smsRequiredId > 0) {
							isSmsRequiredBasedOnParty 		= true;
							$('#smsRequired').prop( "checked", isSmsRequiredBasedOnParty );
							$('#isSmsSendToConr').prop( "checked", isSmsRequiredBasedOnParty );
							$('#isSmsSendToConee').prop( "checked", isSmsRequiredBasedOnParty );
						} else
							isSmsRequiredBasedOnParty 		= false;
					
						if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == true || configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true')		
							$("#consigneeName").attr("readonly",false);	
							
						if(configuration.seperateSequenceRequiredForPartyInPaidLR == 'true' && ($('#wayBillType').val() == WAYBILL_TYPE_PAID)
						|| (configuration.branchAndPartyCodeWiseLrSequenceForConsignor == true || configuration.branchAndPartyCodeWiseLrSequenceForConsignor == 'true'))
							getPartyWiseLrSequence(party.corporateAccountId, party, partyType);
							
						if(configuration.showShortCreditOutstandingAmount == "true")
							getShortCreditDueAmount();
							
						if(configuration.DeliveryAt == 'true' && party.deliveryAt > 0)
							cnorPartyDeliveryAt = party.deliveryAt;
						
						if (configuration.searchWithPartyToPartyConfig == 'true')
							initialiseConsigneeAutocomplete(party.corporateAccountId, $('#destinationBranchId').val())
					} else {
						cneePartyDeliveryAt			= 0;
						consigneeRateConfigured		= party.rateConfigured;
						consigneePodRequired		= party.podRequired;
						consigneeTaxType			= party.taxType;
						isConsigneeTBBParty         = party.tBBParty; 
						
						$('#consigneePartyMasterId').val(party.corporateAccountId);
						$('#consigneePanNumber').val(party.panNumber);
						$('#consigneePan').val(party.panNumber);
						$('#consigneePhoneNumber').val(party.phoneNumber);
						$('#prevConsigneePhn').val(party.mobileNumber);
						$('#prevConsigneeGstn').val(party.gstn);
						$('#prevConsigneePincode').val(party.pincode);					
						$('#consigneePartyCode').val(party.partyCode);
												
						if(party.gstn != undefined && party.gstn !='')
							isConsigneeGSTNPresent = true;
					
						if(isConsigneeGSTNPresent && party.validatedPartyGstn != undefined && party.validatedPartyGstn)
							isValidatedPartyGstn = true;
					
						if(isValidGSTChecking() && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {				
							if(isConsigneeGSTNPresent)
								$('#quantity').focus();
							else
								$('#consigneeGstn').focus();
						}
							
						if (configuration.changeWayBillTypeFromToPayToTbb == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && party.tBBParty) {
							setTimeout(function() {
								showMessage('info',"As per your Consignee Party Selection, your LR type Should be TBB!");
							},100);	

							convertLRTypeToTBBWhenPartyIsBilling();
						}
					
						if(configuration.disablePartyFeildsWhenDataValidateFromGSTApi == true || configuration.disablePartyFeildsWhenDataValidateFromGSTApi == 'true')	
							$("#consigneeName").attr("readonly", false);
						
						if(configuration.seperateSequenceRequiredForPartyInToPayLR == 'true' && ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY))	
							getPartyWiseLrSequence(party.corporateAccountId, party, partyType); 

						if(configuration.DeliveryAt == 'true' && party.deliveryAt > 0)
							cneePartyDeliveryAt = party.deliveryAt;
					}
					
					doNotAllowTBBPartyForConsignorAndConsigneeInPaidAndToPayBooking(isConsignorTBBParty, isConsigneeTBBParty);
					
					if(configuration.autoConvertWaybillTypeToTBBForTBBParty == 'true' && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT && (isConsignorTBBParty || isConsigneeTBBParty)) {
						showMessage('error', "PAID / TOPAY / FOC booking not allowed for billing party.");
						convertLRTypeToTBBWhenPartyIsBilling();
					}
						
					if(configuration.customSetGstPaidByExemptedOnParty == 'true') {
						if(partyType == PARTY_TYPE_CONSIGNOR && $('#wayBillType').val() == WAYBILL_TYPE_PAID)
							isTransporterForConsignor = party.transporter;
						else if(partyType == PARTY_TYPE_CONSIGNEE && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
							isTransporterForConsignee = party.transporter;
					}
					
					if(($('#wayBillType').val() == WAYBILL_TYPE_PAID && partyType == PARTY_TYPE_CONSIGNOR) ||
							($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && partyType == PARTY_TYPE_CONSIGNEE))
						weightTypeForRateApply = party.weightType;
					
					if(party.chargedWeightRound == true) {
						if(($('#wayBillType').val() == WAYBILL_TYPE_PAID && partyType == PARTY_TYPE_CONSIGNOR) ||
								($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && partyType == PARTY_TYPE_CONSIGNEE)) {
							chargedWeightRoundOffValue = party.chargedWeightRoundOffValue;
						}
					}
					
					$('#'+name).val(party.displayName);
					$('#'+add).val(party.address);
					$('#'+pin).val(party.pincode);
					$('#'+conName).val(party.contactPerson);
					$('#'+dept).val(party.department);
					
					let mobileNumber	= party.mobileNumber;
					
					if(configuration.doNotShowConsigneePartyContactNumber == 'true') {
						if(partyType != PARTY_TYPE_CONSIGNEE)
							$('#' + no).val(mobileNumber);
					} else if(configuration.doNotShowPartyContactNumber == 'false') {
						if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && mobileNumber != undefined)
							$('#' + no).val(mobileNumber.replace(/.(?=.{1}$)/g, '*').replace(/^(.)(.*)(.)$/, '$1' + '*'.repeat(mobileNumber.length - 2) + '$3'));
						else
							$('#' + no).val(mobileNumber);
					}
					
					if(configuration.disablePartyPhoneIfFromPartyMaster == 'true') {
						$('#' + no).prop('readonly', mobileNumber != undefined && mobileNumber != '');
						
						$('#consignorPhn').on('keydown', function (event) {
							if (event.which === 13 || event.which == 9) {
								event.preventDefault(); 
								$('#consignorAddress').focus(); 
							}
						});
						
						$('#consigneePhn').on('keydown', function (event) {
							if (event.which === 13 || event.which === 9) {
								event.preventDefault(); 
								$('#consigneeAddress').focus(); 
							}
						});
					}

					$('#'+fax).val(party.faxNumber);
					$('#'+email).val(party.emailAddress);
					
					if(configuration.disablePartyEmailIfFromPartyMaster == 'true') {
						$('#' + email).prop('readonly', party.emailAddress != undefined && party.emailAddress != '');						
						
						addEventOnConsignorMailAfterDisable();

						$('#consigneeEmail').on('keydown', function (event) {
							if (event.which === 13 || event.which === 9) {
								event.preventDefault(); 
								setTimeout(function () {
									$('#chargeType').focus();
								}, 50);
							}	
						});
					}

					if(configuration.TinNumber == 'true')
						$('#'+tin).val(party.tinNumber);

					if(configuration.gstnNumber == 'true' && configuration.allowToEnterGstNoManually == 'false' || isValidatedPartyGstn)
						$('#' + gstn).val(party.gstn);
					
					$('#' + cftValue).val(party.cftValue);
					
					if(party.cftValue <= 0) {
						if(cftValue == 'consignorCft')
							$('#consignorCft').removeAttr('disabled');
						
						if(cftValue == 'consigneeCft')
							$('#consigneeCft').removeAttr('disabled');
					}
					
					if(chargeTypeFlavour != '4') {
						resetArticleWithTable();
						resetSpecificCharges();
					}

					if(configuration.gstnNumber == 'true') {
						setSTPaidByOnGSTNumber();
					} else if(partyType == PARTY_TYPE_CONSIGNOR && $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
						if (party.serviceTaxRequired && configuration.sTPaidByChangeReqOnParty == 'true') {
							selectSTPaidBy(TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt(); defined in commonFunctionForCreateWayBill.js
							stPaidBySelectionByParty	= true;
						} else {
							selectSTPaidBy(configuration.DefaultSTPaidByForPaidLR); //replaced with StPaidByConsignoropt(); defined in commonFunctionForCreateWayBill.js
							stPaidBySelectionByParty	= false;
						}
					} else if (partyType == PARTY_TYPE_CONSIGNEE && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
						if (party.serviceTaxRequired && configuration.sTPaidByChangeReqOnParty == 'true') {
							selectSTPaidBy(TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt(); defined in commonFunctionForCreateWayBill.js
							stPaidBySelectionByParty	= true;
						} else {
							selectSTPaidBy(configuration.DefaultSTPaidByForToPayLR); // replaced with StPaidByConsigneeopt(); defined in commonFunctionForCreateWayBill.js
							stPaidBySelectionByParty	= false;
						}
					} else {
						setDefaultSTPaidBy($('#wayBillType').val()); // replaced with StPaidByConsignoropt(); defined in commonFunctionForCreateWayBill.js
						stPaidBySelectionByParty	= false;
					}
					
					if(isValidGSTChecking() && party.gstn != undefined && party.gstn !='')
						validateGSTNumberByApi1(partyType);
					
					getMinimumValueConfiguration(data, party);
					
					if(configuration.partyWiseChargeWeightLessAllow == 'true') {
						if(($('#wayBillType').val() == WAYBILL_TYPE_PAID && partyType == PARTY_TYPE_CONSIGNOR) ||
								($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && partyType == PARTY_TYPE_CONSIGNEE)) {
							chgwgtActWgtConditionForLess = party.chgwgtActWgtConditionForLess;
						}
					}
					
					if(configuration.VolumetricWiseAddArticle == 'true' && ($('#wayBillType').val() == WAYBILL_TYPE_PAID && partyType == PARTY_TYPE_CONSIGNOR
						|| $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && partyType == PARTY_TYPE_CONSIGNEE))
						getPartyCftUnitAndValue(party);
					
					if(partyType == PARTY_TYPE_CONSIGNOR && configuration.TBBBookingLockingOnPartyLimit == 'true') {
						if(party.tBBParty && data.partyLimit != undefined && $('#billingPartyId').val() > 0)
							$('#limit').html('Limit : ' + data.partyLimit);
						else
							$('#limit').html('');
					}

					if(partyType == PARTY_TYPE_CONSIGNOR) {
						validateInvoiceNumberForConsignor  = data.validateInvoiceNumber != undefined && data.validateInvoiceNumber;
						validatePartNumberForConsignor = data.validatePartNumber != undefined && data.validatePartNumber;
					} else if(partyType == PARTY_TYPE_CONSIGNEE) {
						validateInvoiceNumberForConsignee  = data.validateInvoiceNumber != undefined && data.validateInvoiceNumber;
						validatePartNumberForConsignee = data.validatePartNumber != undefined && data.validatePartNumber;
					}
							
					if(partyType == PARTY_TYPE_CONSIGNOR && configuration.calcRateOnWeightAndTruckCapacityForTBB  == 'true' && party.tBBParty && $('#billingPartyId').val() > 0) {
						if(data.deduction != undefined)
							partyDeductionPercent = data.deduction;
						else
							partyDeductionPercent = 0;
						
						if(data.deviation != undefined)
							partyDeviationPercent = data.deviation;
						else
							partyDeviationPercent = 0;
					}
					
					blockBookingOnGSTNumber(null);
					validateConsignorAndConsigneeNumberForSame();
					
					if(partyType == PARTY_TYPE_CONSIGNOR)
						checkConsignorPartyExempted(party.corporateAccountId, party.exempted);
					else if(partyType == PARTY_TYPE_CONSIGNEE)
						checkConsigneePartyExempted(party.corporateAccountId, party.exempted);
					
					if(partyType == PARTY_TYPE_CONSIGNEE && configuration.destinationBranchWisePartyMapping == 'true' && data.partyMappedBranchIds != undefined) {
						const partyMappedBranchIds = data.partyMappedBranchIds.split(',').map(id => id.trim());
							
						if(!partyMappedBranchIds.includes($('#destinationBranchId').val())) {
							resetConsignee();
							showMessage('error', party.displayName + " is Not Allowed To Book For " + $('#destination').val() + "!");
						}
					}
					
					setStPaidByFromParyMaster(party);
					setDeliveryAtFromPartyMaster();
				}
			});
}

function setBillingParty(party, isExempted) {
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) {
		if(isExempted != undefined && (isExempted == true || isExempted == 'true')) {
			isTBBPartyExempted = true;
			$('#BillingPartyDetailsConsignor').append("<input name='billingExempted_"+party.corporateAccountId+"' id='billingExempted_"+party.corporateAccountId+"'  type='hidden' value='"+isExempted+"'/>");
			$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID);
			$('#STPaidBy').attr('disabled','true');
		} else {
			$('#STPaidBy').removeAttr('disabled','false');
			setDefaultSTPaidBy(Number($('#wayBillType').val()));
		}
	}
	
	tbbPartyCode 		= party.partyCode;
	
	if(configuration.showAssignedBillingPartyOfConsignor == 'true' && !party.tBBParty) {
		$('#billingPartyId').val(party.billingPartyId);
		$('#billingPartyName').val(party.billingPartyName);
	} else {
		$('#billingPartyId').val(party.corporateAccountId);
		$('#billingPartyName').val(party.displayName);
	}

	$('#billingPartyId').val(party.corporateAccountId);
	$('#billingPartyName').val(party.displayName);
	$('#billingPartyPhone').val(party.mobileNumber);
	$('#billingPartyCreditorId').val(party.corporateAccountId);
	$('#prevBillingGstn').val(party.gstn);
	$('#billingGstn').val(party.gstn);
	
	if(configuration.resetConsignorAddrToBillingPartyAddr == 'true'
		&& configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'false')
		$('#consignorAddress').val(party.address);
	
	$('#billingPartyPanNumber').val(party.panNumber);
	$('#billingPartyPan').val(party.panNumber);
	$('#prevConsignorPhn').val(party.mobileNumber);
	$('#consignorCft').val(party.cftValue);

	setCompanyWiseTaxes(party.branchId);
	
	if(configuration.partyPanelType == '3' && party.mobileNumber != undefined && party.mobileNumber.length > 0)
		$('#consignorPhn').val(party.mobileNumber);

	if(configuration.showBillingPartyGSTNumber == 'true') {
		if(configuration.doNotReplceConsignorGSTNWithTBBPartyGSTNInTTBLR == 'true') {
			if(!isConsignorGSTNPresent && configuration.isAllowToShowBillingPartyGSTN == 'false') {
				$('#prevConsignorGstn').val(party.gstn);
				$('#consignorGstn').val(party.gstn);
				$('#consignoCorprGstn').val(party.gstn);
				isConsignorGSTNPresent = false; 
			}
		} else if(party.gstn != undefined && party.gstn !='') {
			$('#prevConsignorGstn').val(party.gstn);
			$('#consignorGstn').val(party.gstn);
			$('#consignoCorprGstn').val(party.gstn);
		} else if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.overrideConsignorGSTNWithBillingPartyGSTNInTBB == 'true')
			$('#consignorGstn').val('');
	}
	
	if(configuration.allowToEnterGstNoManually == 'true')
		$('#consignorGstn').val('');

	if (party.serviceTaxRequired && configuration.sTPaidByChangeReqOnParty == 'true') {
		selectSTPaidBy(TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID); // replaced with StPaidByTranporteropt();
		stPaidBySelectionByParty	= true;
	} else {
		//selectSTPaidBy(defaultSTPaidBy); // replaced with StPaidByConsignoropt();
		setDefaultSTPaidBy($('#wayBillType').val())
		stPaidBySelectionByParty	= false;
	}
	
	if(configuration.seperateSequenceRequiredForTbbParty == 'true' 
		|| (configuration.branchAndPartyCodeWiseLrSequenceForConsignor == true || configuration.branchAndPartyCodeWiseLrSequenceForConsignor == 'true'))
		getPartyWiseLrSequence(party.corporateAccountId, party, partyType); 			//Calling from lrSequenceCounter.js
	
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true)
		validatePartyExemptionOnGSTN();
	
	setSaidToContainAutocomplteByParty(party.tBBParty ? party.corporateAccountId : party.billingPartyId);
}

function validatePartyExemptionOnGSTN(){
	var gstn = $('#consignoCorprGstn').val();
	if($('#consignoCorprGstn') != undefined && gstn.length > 0){
		$('#STPaidBy').removeAttr('disabled','false');
		setDefaultSTPaidBy(Number($('#wayBillType').val()));
	}
}

function setCreditorParty(party, isExempted) {
	if(configuration.customSetGstPaidByExemptedOnParty == 'true')
		$('#partyMasterId').val(party.corporateAccountId);
	
	$('#consignorCorpId').val(party.corporateAccountId);
	$('#partyOrCreditorId').val(party.corporateAccountId);
	$('#consignorName').val(party.displayName);
	$('#consignorAddress').val(party.address);
	$('#consignorPin').val(party.pincode);
	$('#consignorContactPerson').val(party.contactPerson);
	$('#prevConsignorPhn').val(party.mobileNumber);
	
	if(configuration.showAssignedBillingPartyOfConsignor == 'true') {
		if(party.billingPartyId > 0 && !party.tBBParty) {
			$('#billingPartyId').val(party.billingPartyId);
			$('#billingPartyName').val(party.billingPartyName);
		} else {
			 $('#billingPartyId').val('0');
			 $('#billingPartyName').val('');
		}
	}
	
	if(party.gstn != undefined && party.gstn !='') {
		isConsignorGSTNPresent	= true;
		$('#consignorGstn').val('');
		$('#consignoCorprGstn').val('');
	} else
		isConsignorGSTNPresent	= false;
	
	if(configuration.allowToEnterGstNoManually == 'false'  || isValidatedPartyGstn) {
		if(configuration.allowToEnterGstNoManuallySecondTime == 'false' && $('#prevConsignorGstn').val() == party.gstn)
			$('#prevConsignorGstn').val();
		else {
			$('#prevConsignorGstn').val(party.gstn);
			$('#consignorGstn').val(party.gstn);
			$('#consignoCorprGstn').val(party.gstn);
		}
	}
	
	$('#consignorCft').val(party.cftValue);

	if(configuration.PartyNameIdentifiers != CorporateAccount.MOBILE_NUMBER_LEVEL_PARTY_SAVE_IDENTIFIER) {
		if(party.mobileNumber != undefined && party.mobileNumber.length > 0) {
			if(configuration.doNotShowPartyContactNumber == 'false') {
				if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && party.mobileNumber != undefined)
					$('#consignorPhn').val(party.mobileNumber.replace(/.(?=.{1}$)/g, '*').replace(/^(.)(.*)(.)$/, '$1' + '*'.repeat(party.mobileNumber.length - 2) + '$3'));
				else
					$('#consignorPhn').val(party.mobileNumber);
			}
		} else if(party.phoneNumber != undefined && party.phoneNumber.length > 0) {
			var stdCodeAndPhNo = (party.phoneNumber).split("-");
	
			if(configuration.doNotShowPartyContactNumber == 'false') {
				if(stdCodeAndPhNo[1] != undefined && stdCodeAndPhNo[1].length > 0)
					$('#consignorPhn').val(stdCodeAndPhNo[1]);
				else
					$('#consignorPhn').val(stdCodeAndPhNo[0]);
			}
		}
	}
	
	if(configuration.partyPanelType == '3' && party.mobileNumber != undefined && party.mobileNumber.length > 0)
		$('#consignorPhn').val(party.mobileNumber);
	
	if(configuration.TinNumber == 'true')
		$('#consignorTin').val(party.tinNumber);

	$('#consignorEmail').val(party.emailAddress);
	$('#consignorDept').val(party.department);
	$('#consignorFax').val(party.faxNumber);
	
	if(configuration.disablePartyPhoneIfFromPartyMaster == 'true') {
		$('#consignorPhn').prop('readonly', mobileNumber != undefined && mobileNumber != '');
		
		$('#consignorPhn').on('keydown', function (event) {
			if (event.which === 13 || event.which === 9) {
				event.preventDefault(); 
				setTimeout(function () {
					$('#billingPartyName').focus();
				}, 50);
			}
		});
	}
	
	if(configuration.disablePartyEmailIfFromPartyMaster == 'true') {
		$('#consignorEmail').prop('readonly', party.emailAddress != undefined && party.emailAddress != '');
						
		addEventOnConsignorMailAfterDisable();
	}
		
	if(configuration.automaticallySetBillingPartyDetailsIfConsignorIsTBB == 'true'
		&& parseInt($('#billingPartyId').val()) <= 0 && party.tBBParty)
		setBillingParty(party , isExempted);

	if(party.tBBParty == true || party.tBBParty =='true')	
		setSaidToContainAutocomplteByParty(party.corporateAccountId);
}

function getTBBPartyDetails(corpId, tBBpartyType) {
	var jsonObject					= new Object();
	jsonObject.filter				= 2;
	jsonObject.getCharge			= 1;
	jsonObject.partyId				= corpId;
	jsonObject.partyPanelType		= configuration.partyPanelType;
	jsonObject.partyType			= getBillingPartyDetails;
	
	partyType = jsonObject.partyType;

	var jsonStr = JSON.stringify(jsonObject);

	
	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if(!data.partyDetails)
						return;

					var party = data.partyDetails;

					if (tBBpartyType == TBB_BILLING || party.tBBParty) {
						riskCoverage = 0;
						riskcoveragePercentage = false;

						if (data.riskCoverage != undefined) riskCoverage = data.riskCoverage;
						if (data.riskCoveragePercentage != undefined) riskcoveragePercentage = data.riskCoveragePercentage;
						
						if(tBBpartyType == TBB_CREDITOR) {
							validateInvoiceNumberForConsignor	= data.validateInvoiceNumber != undefined && data.validateInvoiceNumber;
							validatePartNumberForConsignor		= data.validatePartNumber != undefined && data.validatePartNumber;
						} else {
							validateInvoiceNumberForTBB = data.validateInvoiceNumber != undefined && data.validateInvoiceNumber;
							validatePartNumberForTBB	= data.validatePartNumber != undefined && data.validatePartNumber;
						}
					} else if(tBBpartyType == TBB_CREDITOR) {
						validateInvoiceNumberForConsignor	= data.validateInvoiceNumber != undefined && data.validateInvoiceNumber;
						validatePartNumberForConsignor		= data.validatePartNumber != undefined && data.validatePartNumber;
					}
					
					if (configuration.getBillingBranchOfBillingPartyFromPartyMaster == 'true')
						getBillingBranch(party.corporateAccountId);
					
					partyWiseDataHM[party.corporateAccountId]	= party;
					partyWiseMinimumValueDataHM[party.corporateAccountId]	= data.minimumValueRateList;
					slabWisePartyMinimumAmtHM[party.corporateAccountId] 	= data.slabWisePartyMinimumAmtList;

					if(configuration.showPartyIsBlackListedParty == 'true' && party.blackListed > 0) {
						$("#billingPartyName").css("border-color", "red");
						setTimeout(function() {
							showMessage('error','TBB Party is BlackListed');
						},150);					
					}
					
					isTBBPartyDeliveryAtExist 	= false;
					tbbPartyDeliveryAt			= 0;
					
					if(configuration.DeliveryAt == 'true' && party.deliveryAt > 0)
						tbbPartyDeliveryAt 			= party.deliveryAt;
					
					if(configuration.doNotAllowBookingForBlackListedParty == 'true'
							&& (party.blackListed == 1 || party.blackListed == 3)) {
						resetBillingParty();
						
						if($('#consignorCorpId').val() == party.corporateAccountId)
							resetConsignor();	
						
						showMessage('info','You Can not Book  for ' + party.displayName);
						return false;
					}
					
					if (configuration.searchWithPartyToPartyConfig == 'true')
						initialiseConsigneeAutocomplete(corpId, $('#destinationBranchId').val())
					
					if(configuration.seperateSequenceRequiredForTbbParty == 'true')
						getPartyWiseLrSequence(corpId, party, partyType);			//Calling from lrSequenceCounter.js
					
					if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true')
						checkWayBillTypeWiseLRSequence(party);
					
					if(configuration.VolumetricWiseAddArticle == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
						getPartyCftUnitAndValue(party);
						TBBCFTUnit	= party.cftUnit;
					}
					
					if(configuration.showTBBPartyNameInConsignor == 'true' && configuration.showSameConsignorAndBillingParty == 'true' && party.tBBParty) {
						setCreditorParty(party, party.exempted);
						$('#partyMasterId').val(party.corporateAccountId);
					}
					
					if(configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'true') {
						if (parseInt($('#billingPartyId').val()) <= 0 && party.tBBParty)
							setBillingParty(party, isExempted);
					} else if (tBBpartyType == TBB_CREDITOR)
						setCreditorParty(party, party.exempted);
					else if (tBBpartyType == TBB_BILLING)
						setBillingParty(party, party.exempted);

					/*if(party.gstn != undefined && party.gstn !='') {
						isConsignorGSTNPresent = true;
					}*/

					if(party.chargedWeightRound == true)
						chargedWeightRoundOffValue = party.chargedWeightRoundOffValue;

					if(weightTypeForRateApply <= 0)
						weightTypeForRateApply = party.weightType;

					$('#consignorPartyCode').val(party.partyCode);
					setPartyWiseInvoiceNumber();
					
					smsRequiredId		= party.smsRequiredId;
					
					if(smsRequiredId > 0) {
						isSmsRequiredBasedOnParty 		= true;
						$('#smsRequired').prop( "checked", isSmsRequiredBasedOnParty );
						$('#isSmsSendToConr').prop( "checked", isSmsRequiredBasedOnParty );
						$('#isSmsSendToConee').prop( "checked", isSmsRequiredBasedOnParty );
					} else
						isSmsRequiredBasedOnParty 		= false;
					
					getMinimumValueConfiguration(data, party);
					
					chgwgtActWgtConditionForLess 	= party.chgwgtActWgtConditionForLess;
					consignorRateConfigured			= party.rateConfigured;
					consignorPodRequired			= party.podRequired;
					billingTaxType					= party.taxType;
					tbbPartyGstn					= party.gstn;
					
					if(data.partyBranchstateCode != null && data.partyBranchstateCode != undefined && data.partyBranchstateCode != 'undefined')
						tbbPartyBranchStateCode			= data.partyBranchstateCode;
					
					if(party.tBBParty && data.partyLimit != undefined && configuration.TBBBookingLockingOnPartyLimit == 'true')
						$('#limit').html('Limit : ' + data.partyLimit);
					else
						$('#limit').html('');
					
					if(party.tBBParty && configuration.calcRateOnWeightAndTruckCapacityForTBB  == 'true') {
						if(data.deduction != undefined)
							partyDeductionPercent = data.deduction;
						else
							partyDeductionPercent = 0;
						
						if(data.deviation != undefined)
							partyDeviationPercent = data.deviation;
						else
							partyDeviationPercent = 0;
					}
			
					checkBillingPartyExempted(party.corporateAccountId, party.exempted);
					setStPaidByFromParyMaster(party);
					setDeliveryAtFromPartyMaster();
				}
				
				if(configuration.customSetGstPaidByExemptedOnParty == 'true') {
					if(!party.tBBParty)
						isTransporterForConsignor	= party.transporter;
						
					if(party.tBBParty && configuration.customSetGstPaidByExemptedOnTbbParty == 'true')
						isTransporterForConsignor	= party.transporter;
					
					setSTPaidByOnGSTNumber();
				}
			});
}

function getPartyDetailsData(partyMasterId, partyType) {
	
	if(configuration.isAllowNewGstNumberOnAutoSave && typeof partyMasterId == 'undefined')
		return;
		
	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && partyType == PARTY_TYPE_CONSIGNOR 
	&& (configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == false || configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'false')) {
		setCustData('consignorName', 'consignorCorpId', partyMasterId);
		var consignorPhn = $('#consignorPhn').val();

		if(configuration.partyPanelType == '2')
			getConsinorTBBPartyDetailsOnPhoneNumber(partyMasterId, consignorPhn, TBB_CREDITOR);
		else
			getTBBPartyDetails(partyMasterId, TBB_CREDITOR);
	} else if(partyType == PARTY_TYPE_CONSIGNOR) {
		setCustData('consignorName', 'partyMasterId', partyMasterId);
		AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, 'partyMasterId');
			
		var consignorPhn = $('#consignorPhn').val();

		if(configuration.partyPanelType == '2')
			getConsinorDetailsOnPhoneNumber(partyMasterId, consignorPhn, partyType);
		else {
			if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
				getPartyDetails(partyMasterId, 'consignorName', 'consignorPhn', 'consignorTin', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax', partyType, 'consignoCorprGstn', 'consignorCft');
			else
				getPartyDetails(partyMasterId, 'consignorName', 'consignorPhn', 'consignorTin', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax', partyType, 'consignorGstn', 'consignorCft');
				
			getNumberTypeDetailsByParty(partyMasterId);
		}
	} else {
		setCustData('consigneeName', 'consigneePartyMasterId', partyMasterId);
		AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, 'consigneePartyMasterId');
			
		var consigneePhn = $('#consigneePhn').val();
		
		if(configuration.partyPanelType == '2')
			getConsineeDetailsOnPhoneNumber(partyMasterId, consigneePhn, partyType);
		else {
			if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
				getPartyDetails(partyMasterId, 'consigneeName', 'consigneePhn', 'consigneeTin', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', partyType, 'consigneeCorpGstn', 'consigneeCft');
			else if(configuration.replaceConsigneeAddressWithDoorDeliveryAddress == 'true' && ($('#typeOfLocation').val() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE))
				getPartyDetails(partyMasterId, 'consigneeName', 'consigneePhn', 'consigneeTin', '','consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', partyType, 'consigneeGstn', 'consigneeCft');
			else
				getPartyDetails(partyMasterId, 'consigneeName', 'consigneePhn', 'consigneeTin', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', partyType, 'consigneeGstn', 'consigneeCft');
				
			getNumberTypeDetailsByParty(partyMasterId);
		}
		
		if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT
		&& (configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == true || configuration.automaticallySetBillingPartyDetailsIfConsigneeIsTBB == 'true'))
			getTBBPartyDetails(partyMasterId, TBB_CREDITOR);
	}
}

function getConsinorDetailsOnPhoneNumber(partyMasterId, consignorPhn, partyType) {
	if(consignorPhn == '0000000000' || consignorPhn == '') {
		if(configuration.ConsignorMobileNoValidate != 'true') {
			getPartyDetails(partyMasterId, 'consignorName', 'consignorPhn', 'consignorTin', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax', partyType,'consignorGstn', 'consignorCft');
			getNumberTypeDetailsByParty(partyMasterId);
		} else {
			validateConsignorMobile();
			setConsignorNameAutoComplete();
		}
	} else {
		getPartyDetails(partyMasterId, 'consignorName', 'consignorPhn', 'consignorTin', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax', partyType,'consignorGstn', 'consignorCft');
		getNumberTypeDetailsByParty(partyMasterId);
	}
}

function getConsineeDetailsOnPhoneNumber(partyMasterId, consigneePhn, partyType) {
	if(consigneePhn == '0000000000' || consigneePhn == '') {
		if(configuration.ConsigneeMobileNoValidate != 'true') {
			getPartyDetails(partyMasterId, 'consigneeName', 'consigneePhn', 'consigneeTin', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', partyType,'consigneeGstn', 'consigneeCft');
			getNumberTypeDetailsByParty(partyMasterId);
		} else {
			validateConsigneeMobile();
			setConsigneeNameAutoComplete();
		}
	} else {
		getPartyDetails(partyMasterId, 'consigneeName', 'consigneePhn', 'consigneeTin', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', partyType,'consigneeGstn', 'consigneeCft');
		getNumberTypeDetailsByParty(partyMasterId);
	}
}

function getConsinorTBBPartyDetailsOnPhoneNumber(partyMasterId, consignorPhn, TBB_CREDITOR) {
	if(consignorPhn == '0000000000' || consignorPhn == '') {
		if(configuration.ConsignorMobileNoValidate != 'true')
			getTBBPartyDetails(partyMasterId, TBB_CREDITOR);
		else {
			validateConsignorMobile();
			setConsignorNameAutoComplete();
		}
	} else
		getTBBPartyDetails(partyMasterId, TBB_CREDITOR);
}

//Added By Anant Chaudhary	17-02-2016
function getNumberTypeDetailsByParty(partyMasterId) {
	if(configuration.GenerateNumberTypeFieldsByParty != 'true')
		return false;
	
	var jsonObject					= new Object();

	jsonObject.filter				= 22;
	jsonObject.partyId				= partyMasterId;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if(!data.numberTypeDetails)
						return;

					numberTypes = data.numberTypeDetails;
					
					if(numberTypes.length > 0) {
						for(var i = 0 ; i < numberTypes.length; i++) {
							var numberType		= numberTypes[i];
							var numberTypeId	= numberType.numberTypeId;
							var numberTypeName	= numberType.numberTypeName;
							
							var jsonObjectNumberType	= new Object();
							
							jsonObjectNumberType.type	= 'text';
							jsonObjectNumberType.name	= 'numberType' + numberTypeId;
							jsonObjectNumberType.id		= 'numberType' + numberTypeId;
							jsonObjectNumberType.class	= 'numberType' + numberTypeId;
							jsonObjectNumberType.onblue	= 'hideInfo()';
							jsonObjectNumberType.style	= 'text-transform: uppercase;';
							
							if(i != 0)
								jsonObjectNumberType.style	= 'margin-left: 50px; text-transform: uppercase;';
							
							jsonObjectNumberType.onfocus		= "showInfo(this,'" + numberTypeName + "');";
							jsonObjectNumberType.placeholder	= numberTypeName;
							
							createInput($("#noTypePanel"), jsonObjectNumberType);
						}
						
						initialiseFocus();
					}
				}
			});
}

function getPartyDetailsDataOnPanel2(partyMasterId, partyType) {
	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && partyType == PARTY_TYPE_CONSIGNOR) {
		setCustData('consignorName', 'consignorCorpId', partyMasterId);
		getTBBPartyDetails(partyMasterId, TBB_CREDITOR);
	} else if(partyType == PARTY_TYPE_CONSIGNOR) {
		setCustData('consignorName', 'partyMasterId', partyMasterId);
		getPartyDetailsOnPanel2(partyMasterId, 'consignorName', 'consignorGstn', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax', 'consignorPhn', partyType);
	} else {
		setCustData('consigneeName', 'consigneePartyMasterId', partyMasterId);
		getPartyDetailsOnPanel2(partyMasterId, 'consigneeName', 'consigneeGstn', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeEmail', 'consigneeDept', 'consigneeFax', 'consigneePhn', partyType);
	}
}

function getPartyDetailsOnPanel2(partyId, name, gstn, add, pin, conName, email, dept, fax, no, partyType) {
	var jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.getCharge			= 1;
	jsonObject.partyPanelType		= configuration.partyPanelType;
	jsonObject.partyType			= getGeneralPartyDetails;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					console.log(data);

					if(!data.partyDetails)
						return;

					var party = data.partyDetails;

					if(partyType == PARTY_TYPE_CONSIGNOR) {
						$('#partyMasterId').val(party.corporateAccountId);
						$('#partyOrCreditorId').val(party.corporateAccountId);
					} else
						$('#consigneePartyMasterId').val(party.corporateAccountId);

					$('#'+name).val(party.displayName);
					$('#'+add).val(party.address);
					$('#'+pin).val(party.pincode);
					$('#'+conName).val(party.contactPerson);
					$('#'+dept).val(party.department);
					$('#'+fax).val(party.faxNumber);
					$('#'+email).val(party.emailAddress);
					$('#'+no).val(party.mobileNumber);
					$('#'+gstn).val(party.gstn);
					
					getMinimumValueConfiguration(data, party);
				}
			});
}

function getMinimumValueConfiguration(data, party) {
	if (data.MinWght && Number(data.MinWght) > 0) {
		minWeight										= data.MinWght;
		jsonPartyMinWeight[party.corporateAccountId]	= data.MinWght;
	} else {
		minWeight 										= configuration.MinWeight;
		jsonPartyMinWeight[party.corporateAccountId]	= configuration.MinWeight;
	}

	if (data.DDSlab && Number(data.DDSlab) > 0) {
		ddSlabAmount								= data.DDSlab;
		jsonPartyMinSlab[party.corporateAccountId]	= data.DDSlab;
	} else {
		ddSlabAmount 								= 0;
		jsonPartyMinSlab[party.corporateAccountId]	= 0;
	}
	
	if (data.minAmount && Number(data.minAmount) > 0)
		jsonPartyMinAMt[party.corporateAccountId]	= data.minAmount;
	else
		jsonPartyMinAMt[party.corporateAccountId]	= 0;
}

function updatePartyContactDetail(partyType) {
	let partyMobileNumber 	= '';
	let partyId				= 0;
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consignorPhn").val().includes("*"))
			return;
			
		if (!validateInput(2, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsinorMobileErrMsg)
		|| configuration.landlineNoAllowedInMobileNoFeild == 'false'
					&& configuration.ConsignorMobileNoLengthValidate == 'true' 
					&& !validateInput(5, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberLenErrMsg))
			return;
		
		partyMobileNumber		= $('#consignorPhn').val();
		partyId 				= $('#partyMasterId').val();
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		if (configuration.showConsigneeAndConsignorMobileNumberWithAsterisk == 'true' && $("#consigneePhn").val().includes("*"))
			return;
				
		if (!validateInput(2, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsineeMobileErrMsg)
		|| configuration.landlineNoAllowedInMobileNoFeild == 'false'
				&& configuration.ConsigneeMobileNoLengthValidate == 'true'
				&& !validateInput(5, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberLenErrMsg))
			return;
			
		partyMobileNumber 	= $('#consigneePhn').val();
		partyId 			= $('#consigneePartyMasterId').val();
	}
	
	let jsonObject				= new Object();
	
	jsonObject["partyMobileNumber"]	= partyMobileNumber;
	jsonObject["partyId"]			= partyId;
	jsonObject["updateType"]		= UPDATE_MOBILE_NUMBER;
	jsonObject["updateEvent"]		= 1;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyContactDetail.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			console.log(data);
		}
	});
}

function updatePartyGstNumber(partyType){
	var partyGstNumber 		= '';
	var partyId				= 0;
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		if (!validateLengthOfConsinorGSTNumber())
			return false;
	
		if(configuration.partyPanelType == '3')
			partyGstNumber 		= $('#consignoCorprGstn').val();
		else
			partyGstNumber 		= $('#consignorGstn').val();
		
		partyId 			= $('#partyMasterId').val();
	} else {
		if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
			
			if (!validateLengthOfConsineeGSTNumber())
				return false;

			if(configuration.partyPanelType == '3')
				partyGstNumber 		= $('#consigneeCorpGstn').val();
			else
				partyGstNumber 		= $('#consigneeGstn').val();

			partyId 			= $('#consigneePartyMasterId').val();
		}
	}
	
	var jsonObject				= new Object();
	
	jsonObject["gstNumber"]				= partyGstNumber;
	jsonObject["corporateAccountId"]	= partyId;
	jsonObject["updateType"]			= UPDATE_GST;
	jsonObject["updateEvent"]			= 1;
	
	if(configuration.checkGSTNumberForUnique == 'true') {
		jsonObject["filter"]				= 1;
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/partyMasterWS/checkUniqueGstNumber.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.error != undefined) {
					var errorMessage = data.error;
					showMessage('error', errorMessage);
					resetGSTNumberIfDuplicate();
				} else {
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyGstNumber.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							console.log(data);
						}
					});
				}
			}
		});
	} else {
		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyGstNumber.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				console.log(data);
			}
		});
	}
}

function updatePartyPincode(objId) {
	let consignorParty = 0;
	let zerosReg = /[1-9]/g;
	
	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		consignorParty = $('#consignorCorpId').val();
	else
		consignorParty = $('#partyMasterId').val();
	
	let obj 	= document.getElementById(objId);
	
	if(configuration.updatePartyPincode == 'true') {
		if(obj.id == 'consignorName' && obj.value.length > 0 && obj.value.toLowerCase() != '') {
			if(consignorParty > 0 && selfCorporateAccountId != Number(consignorParty)
				&& $('#prevConsignorPincode').val() != $('#consignorPin').val()
				&& (($('#consignorPin').val() != '' || $('#consignorPin').val() != 0)  && zerosReg.test($('#consignorPin').val())))
					updatePartyPincodeDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
		} else if(Number($('#consigneePartyMasterId').val()) > 0 && (selfCorporateAccountId != Number($('#consigneePartyMasterId').val()))
			&& $('#prevConsigneePincode').val() != $('#consigneePin').val()
			&& (($('#consigneePin').val() != '' || $('#consigneePin').val() != 0)  && zerosReg.test($('#consigneePin').val())))
				updatePartyPincodeDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
	}
}

function updatePartyPincodeDetail(partyType) {
	var partyPincode		= '';
	var partyId				= 0;
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		partyPincode		= $('#consignorPin').val();
		partyId 			= $('#partyMasterId').val();
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		partyPincode	 	= $('#consigneePin').val();
		partyId 			= $('#consigneePartyMasterId').val();
	}
	
	var jsonObject				= new Object();
	
	jsonObject["partyPincode"]			= partyPincode;
	jsonObject["corporateAccountId"]	= partyId;
	jsonObject["updateType"]			= UPDATE_PINCODE;
	jsonObject["updateEvent"]			= 1;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyPincode.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			console.log(data);
		}
	});
}

function getPartyDetailsByGstn(partyType) {
	
	var billSelection = ($('#billSelection').val() == BOOKING_WITH_BILL || ($('#billSelection').val() == undefined && configuration.defaultBillSelectionId == BOOKING_WITH_BILL));

	if (configuration.setPartyOnGSTNChange == 'true'|| configuration.doNotCreatePartySameGstNumber == 'true') {
		if(billSelection || configuration.doNotCreatePartySameGstNumber == 'true') {
			var jsonObject		= new Object();

		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID) {
			jsonObject["gstn"]					= $('#consignorGstn').val();
			jsonObject["PartyType"]				= CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID;
		} else if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
			jsonObject["gstn"]					= $('#consigneeGstn').val();
			jsonObject["PartyType"]				= CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID;
			jsonObject["destinationBranchId"]	= $('#destinationBranchId').val();
		}

		if(jsonObject["gstn"] == '')
			return false;

		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/partyMasterWS/getPartyDetailsByGstn.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				var corporateAccount	= data.CorporateAccount;

				if(corporateAccount != null && typeof corporateAccount != 'undefined') {
					var isBlackListed	= corporateAccount.corporateAccountBlackListed == 1;

					var ui 	 = new Object();
					var item = { 
							id		 		: corporateAccount.corporateAccountId,
							isBlackListed 	: isBlackListed,
							isPODRequired	: corporateAccount.podRequired
					};

					ui.item	= item;

					if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
						$('#partyMasterId').val(corporateAccount.corporateAccountId);
						$('#partyOrCreditorId').val(corporateAccount.corporateAccountId);
						$('#consignorCorpId').val(corporateAccount.corporateAccountId);
						$('#consignorName').val(corporateAccount.corporateAccountDisplayName);
						$('#consignorPhn').val(corporateAccount.corporateAccountMobileNumber);
						$('#consignorAddress').val(corporateAccount.corporateAccountAddress);
				
						setPartyAutocomplete(ui, partyType, '');

						if(corporateAccount.corporateAccountTBBParty && (configuration.automaticallySetBillingPartyDetailsIfConsignorIsTBB == 'true' || configuration.automaticallySetBillingPartyDetailsIfConsignorIsTBB == true)) {
							$('#billingPartyName').val(corporateAccount.corporateAccountDisplayName);
							$('#billingPartyCreditorId').val(corporateAccount.corporateAccountId);
							$('#billingPartyPhone').val(corporateAccount.corporateAccountMobileNumber);
						}
					} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
						$('#consigneePartyMasterId').val(corporateAccount.corporateAccountId);
						$('#consigneeName').val(corporateAccount.corporateAccountDisplayName);
						$('#consigneePhn').val(corporateAccount.corporateAccountMobileNumber);
						$('#consigneeAddress').val(corporateAccount.corporateAccountAddress);
						setPartyAutocomplete(ui, partyType ,'');
					}
				}
			}
		});
	 }
  }
}

function getDataByTinNumber(obj, partyType) {

	var tinNumber		= obj.value;
	
	if(tinNumber.length >= 6 && tinNumber != '0000000000' 
		&& tinNumber != '' && tinNumber != '1111111111'){

		var jsonObject						= new Object();
		jsonObject.tinNumber 				= tinNumber;
		jsonObject.filter					= 2;
		
		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("AjaxAction.do?pageId=9&eventId=16",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						if(typeof data.errorDescription != 'undefined')
							showMessage('error', data.errorDescription);
					} else {
						if(!data.partyDetails)
							return;
					
						var party	  = data.partyDetails;
							
						if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING)
							setConsignorDetails(party);
						else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
							setConsigneeDetails(party);
					}
				});
	}
}

function setConsignorDetails(party) {
	$('#partyMasterId').val(party.corporateAccountId);
	$('#consignorCorpId').val(party.corporateAccountId);
	$('#partyOrCreditorId').val(party.corporateAccountId);
	$('#consignorName').val(party.displayName);
	$('#consignorPhn').val(party.mobileNumber);
	$('#consignorAddress').val(party.address);
	$('#consignorPin').val(party.pincode);
	$('#consignorGstn').val(party.gstn);
	$('#consignorEmail').val(party.emailAddress);
	$('#consignorDept').val(party.department);
	$('#consignorFax').val(party.faxNumber);
	$('#consignorContactPerson').val(party.contactPerson);
												
	if(party.tBBParty && (configuration.automaticallySetBillingPartyDetailsIfConsignorIsTBB == 'true' || configuration.automaticallySetBillingPartyDetailsIfConsignorIsTBB == true)) {
		$('#billingPartyId').val(party.corporateAccountId);
		$("#billingPartyName").val(party.displayName);
	}
}

function setConsigneeDetails(party) {
	$('#consigneePartyMasterId').val(party.corporateAccountId);
	$('#consigneeName').val(party.displayName);
	$('#consigneePhn').val(party.mobileNumber);
	$('#consigneeAddress').val(party.address);
	$('#consigneePin').val(party.pincode);
	$('#consigneeGstn').val(party.gstn);
}

/**	
	work done for falcon(50)
	
	Reset party GST Number fields if already assign to another party but allow booking
*/
function resetGSTNumberIfDuplicate() {
	if(configuration.resetGSTNumberIfDuplicate == 'false') return;
	var partyType  = $('#newPartyType').val();
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		$('#consignorGstn').val('');
		$('#consignoCorprGstn').val('');
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
		$('#consigneeGstn').val('');
}

function getWaybillTypeName(wayBillTypeId) {
	let wayBillTypeName = '';

	if (wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		wayBillTypeName = WAYBILL_TYPE_NAME_TOPAY;
	else if (wayBillTypeId == WAYBILL_TYPE_PAID)
		wayBillTypeName = WAYBILL_TYPE_NAME_PAID;

	return wayBillTypeName;
}

function showAlertMessageForTBBPartyInTopayAndPaidBooking(isTBBParty) {
	var wayBillTypeId 	= $('#wayBillType').val();
	var wayBillTypeName = getWaybillTypeName(wayBillTypeId);

	if (isTBBParty && (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID))
		alert("You are booking a " + wayBillTypeName + " LR for TBB party" ); 
	
	return true;
}

function doNotAllowTBBPartyInTopayAndPaidBooking(partyType, isTBBParty, doNotAllowTBBPartyInTopayAndPaidBooking) {
	if(doNotAllowTBBPartyInTopayAndPaidBooking == true || doNotAllowTBBPartyInTopayAndPaidBooking == 'true') {
		if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID || $('#wayBillType').val() == WAYBILL_TYPE_FOC) {
			if(isTBBParty) {
				//setTimeout(() => {
					if(partyType == PARTY_TYPE_CONSIGNOR) {
						$("#consignorName").val('');
						$("#consignorPhone").val('');
						$("#consignorPhn").val('');
						$("#consignorGst").val('');
						$("#consignorGstn").val('');
						$("#consignorName").focus();
					} else if (partyType == PARTY_TYPE_CONSIGNEE) {
						$("#consigneeName").val('');
						$("#consigneePhone").val('');
						$("#consigneeGst").val('');
						$("#consigneePhn").val('');
						$("#consignorGstn").val('');
						$("#consigneeName").focus();
					}
					
					showMessage('error', "PAID / TOPAY / FOC booking not allowed for billing party. Please press F9 to create TBB LR.");
					return false;
				//}, 100);
			}
		}
	}
	
	return true;
}

function doNotAllowTBBPartyForConsignorAndConsigneeInPaidAndToPayBooking(isConsignorTBBParty, isConsigneeTBBParty) {
	if (configuration.blockPaidBookingForConsignorBillingParty == 'true' && 
		isConsignorTBBParty && $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		setTimeout(() => {
			resetConsignor();
		})
		
		$("#consignorName").focus();
		showMessage('error', "PAID bookings are not allowed if the consignor is the billing party");
	} else if (configuration.blockTopayBookingForConsigneeBillingParty == 'true' 
		&& isConsigneeTBBParty && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
		setTimeout(() => {
			resetConsignee();
		})
		
		$("#consigneeName").focus();
		showMessage('error', "TOPAY bookings are not allowed if the consignee is the billing party");
	}
}

function updatePartyAddress(partyType) {
	if (configuration.updatePartyAddressWhileBooking == 'true') {
		let partyId			= 0;
		let partyAddress	= null;

		if(partyType == 1) {
			partyAddress 		= $('#consignorAddress').val();
			partyId 			= $('#partyMasterId').val();
			
			if(partyId == 0)
				partyId 		= $('#partyOrCreditorId').val();
		} else if(partyType == 2) {
			partyAddress 		= $('#consigneeAddress').val();
			partyId 			= $('#consigneePartyMasterId').val();
		}
		
		let jsonObject					= new Object();

		jsonObject.partyAddress			= partyAddress.trim();
		jsonObject.corporateAccountId	= partyId;
		
		if(partyAddress != null && partyId > 0) {
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL + '/partyMasterWS/updatePartyAddressDetail.do',
				data		: jsonObject,
				dataType	: 'json',
				success		: function(data) {
				}
			});
		}
	}
}

function updateEmailAddress(partyType) {
	if (configuration.updatePartyEmailAddressWhileBooking == 'true') {
		let partyEmail	= null;
		let partyId		= 0;

		if(partyType == 1) {
			if (!isValidEmailId("consignorEmail")) return;
			
			partyEmail 			= $('#consignorEmail').val().trim();;
			partyId 			= $('#partyMasterId').val();
			
			if(partyId == 0)
				partyId 		= $('#partyOrCreditorId').val();
		} else if(partyType == 2) {
			if (!isValidEmailId("consigneeEmail")) return;
			
			partyEmail	 		= $('#consigneeEmail').val().trim();;
			partyId 			= $('#consigneePartyMasterId').val();
		}
		
		let jsonObject					= new Object();

		jsonObject.EmailAddress			= partyEmail.trim();
		jsonObject.corporateAccountId	= partyId;
		
		if(partyEmail != null && partyId > 0) {
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL + '/partyMasterWS/updatePartyEmailAddressDetail.do',
				data		: jsonObject,
				dataType	: 'json',
				success		: function(data) {
				}
			});
		}
	}
}

function checkConsignorPartyExempted(partyId, exempted) {
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) {
		if(partyId > 0 && $('#consignorName').length) {
			isConsignorExempted = exempted;

			if( $('#cnorExempted_' + partyId).exists())
				$('#cnorExempted_' + partyId).val(exempted);
			else
				$('#consignorNameAndPhn').append("<input name='cnorExempted_" + partyId + "' id='cnorExempted_" + partyId + "'  type='hidden' value='" + exempted + "'/>");

			if($('#wayBillType').val() == WAYBILL_TYPE_PAID) {
				if(exempted != undefined && (exempted == true || exempted == 'true')) {
					$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID);
					$('#STPaidBy').attr('disabled','true');
				} else {
					$('#STPaidBy').removeAttr('disabled','false');
					setDefaultSTPaidBy(Number($('#wayBillType').val()));
				}
			}
		} else {
			$('#STPaidBy').removeAttr('disabled','false');
			setDefaultSTPaidBy(Number($('#wayBillType').val()));
		}
	}
}

function checkConsigneePartyExempted(partyId, exempted) {
	if(configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) {
		if(partyId > 0) {
			isConsigneeExempted = exempted;
					
			if( $('#cneeExempted_' + partyId).exists())
				$('#cneeExempted_' + partyId).val(exempted);
			else
				$('#consigneeNameAndPhn').append("<input name='cneeExempted_" + partyId + "' id='cneeExempted_" + partyId + "' type='hidden' value='" + exempted + "'/>");

			if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
				if(exempted != undefined && exempted){
					$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID);
					$('#STPaidBy').attr('disabled','true');
				} else {
					$('#STPaidBy').removeAttr('disabled','false');
					setDefaultSTPaidBy(Number($('#wayBillType').val()));
				}
			}
		} else {
			$('#STPaidBy').removeAttr('disabled','false');
			setDefaultSTPaidBy(Number($('#wayBillType').val()));
		}
	}
}

function checkBillingPartyExempted(partyId, exempted) {
	if( (configuration.partyExemptedChecking == 'true' || configuration.partyExemptedChecking == true) && partyId > 0) {
		isTBBPartyExempted = exempted;
					
		if( $('#billingExempted_' + partyId).exists())
			$('#billingExempted_' + partyId).val(exempted);
		else
			$('#BillingPartyDetailsConsignor').append("<input name='billingExempted_" + partyId + "' id='billingExempted_" + partyId + "'  type='hidden' value='" + exempted + "'/>");
					
		if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
			if(exempted != undefined && exempted) {
				setTimeout(() => {
					$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID);
					$('#STPaidBy').attr('disabled','true');
				}, 200);
			} else {
				$('#STPaidBy').removeAttr('disabled','false');
				setDefaultSTPaidBy(Number($('#wayBillType').val()));
			}
		}
	}
}

function getPartyDataByPartyCode(obj, partyType) {
	var partyCode		= obj.value;

	if(partyCode != '0000000000' && partyCode != '') {
		var jsonObject					= new Object();
		jsonObject.partyCode 			= partyCode;
		jsonObject.filter				= 2;
		jsonObject.getCharge			= 1;
		
		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("AjaxAction.do?pageId=9&eventId=16",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						if(typeof data.errorDescription != 'undefined')
							showMessage('error', data.errorDescription);
					} else {
						if(!data.partyDetails) {
							showMessage('info', 'Party code not found, please update in party master !');
							
							if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING)
								$('#consignorPartyCode').val("");
							else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY)
								$('#consigneePartyCode').val("");
							return;
						}

						var party	  			= data.partyDetails;
						var corporateAccountId	= party.corporateAccountId;
						
						partyWiseDataHM[party.corporateAccountId]	= party;
						partyWiseMinimumValueDataHM[party.corporateAccountId]	= data.minimumValueRateList;
						slabWisePartyMinimumAmtHM[party.corporateAccountId] 	= data.slabWisePartyMinimumAmtList;
							
						if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
							setConsignorDetails(party);
							
							if($('#consignorPhn').val() == '' || $('#consignorPhn').val() == '0000000000')
								$("#consignorPhn").focus();
							else if($('#consignorGstn').val() == '')
								$("#consignorGstn").focus();
							else
								$("#consigneePartyCode").focus();
						} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
							setConsigneeDetails(party);
							
							if($('#consigneePhn').val() == '' || $('#consigneePhn').val() == '0000000000')
								$("#consigneePhn").focus();
							else if($('#consigneeGstn').val() == "")
								$("#consigneeGstn").focus();
							else
								$("#chargeType").focus();
						}
						
						if(isManualWayBill && configuration.ApplyRateInManual != 'true')
							return false;
			
						//Calling from Rate.js
						getFlavourWiseRates(corporateAccountId, partyType);
						
						if(chargeTypeFlavour != '4') {
							resetArticleWithTable();
							resetSpecificCharges();
						}
						
						if(isValidGSTChecking() && party.gstn != undefined && party.gstn !='')
							validateGSTNumberByApi1(partyType);
							
						getMinimumValueConfiguration(data, party);
					}
				});
	}
}

function getConsignorGSTNumber() {
	if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
		return $('#consignoCorprGstn').val();
	
	return $('#consignorGstn').val();
}

function getConsigneeGSTNumber() {
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
		return $('#consigneeCorpGstn').val();
		
	return $('#consigneeGstn').val();
}

function addUpdatePartyGSTN(partyType){
	resetAddNewPartyElements();
	
	var partyId = 0;
	var partyTypeName = '';
	var partyName = '';
	var partyPhnMob = '';
	var partyAddress = '';
	var partyTinNo = '';
	var partyGstn = '';
	var partyPincode = '';
	
	validUpdateGstn 	= false;
	addNewPartyOverlay 	= false;

	document.getElementById('newPartyType').selectedIndex = partyType;
	document.getElementById('dialog-title').textContent = 'Add - Update Party GST Number';

	if (partyType == 1) {
		partyTypeName 	= 'Consignor';
		partyName 		= $('#consignorName').val();
		partyPhnMob 	= $('#consignorPhn').val();
		partyAddress 	= $('#consignorAddress').val();
		partyTinNo 		= $('#consignorTin').val();
		partyPincode 	= $('#consignorPin').val();

		if ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
			partyId 	= $('#consignorCorpId').val();
		else
			partyId 	= $('#partyMasterId').val();

		if ($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
			partyGstn 	= $('#consignoCorprGstn').val();
		else
			partyGstn = $('#consignorGstn').val();
	} else if (partyType == 2) {
		partyTypeName 		= 'Consignee';
		partyName 			= $('#consigneeName').val();
		partyPhnMob 		= $('#consigneePhn').val();
		partyAddress 		= $('#consigneeAddress').val();
		partyTinNo 			= $('#consigneeTin').val();
		partyId 			= $('#consigneePartyMasterId').val();
		partyPincode 		= $('#consigneePin').val();

		if ($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
			partyGstn 		= $('#consigneeCorpGstn').val();
		else
			partyGstn 		= $('#consigneeGstn').val();
	}

	if(partyId <= 0) {
		showMessage('error', 'Select Valid ' + partyTypeName + ' Party');
		return;
	}

	showHideTinNumberField();
	hidePincodeField();
	showHidePanNumberField();

	if (partyName.length > 0 && (partyName.toLowerCase() != '')) {
		$('#newPartyName').val(partyName.replace(stringNew, '')); //stringNew defined in VariableForCreateWayBill.js
		$('#tinNo').val(partyTinNo);

		if (partyPhnMob.length > 0 && (partyPhnMob.toLowerCase() != ''))
			$('#newPartyMobileNumber').val(partyPhnMob);
		else
			$('#newPartyMobileNumber').val('0000000000');

		$('#newPartyAddress').val(partyAddress);
		$('#newPartyGstNumber').val(partyGstn);
		$('#newPartyPincode').val(partyPincode);
	}

	validUpdateGstn = true;
	
	addNewPartyOverlay	= true;
	ShowDialog(true);
}

function getPartyCftUnitAndValue(party) {
	CFTUnit		= party.cftUnit;
	CFTValue	= party.cftValue;
	$('#cftRate').val(CFTValue);
}

function checkGstNumberForPartySave(objId) {
	let branchLevelFlag = false;

	if (configuration.gstValidationBranchLevel == 'true' && configuration.branchIdsForGstValidation != undefined) {
		let branchIdsArray = (configuration.branchIdsForGstValidation).split(',');
		branchLevelFlag	= isValueExistInArray(branchIdsArray, branchId);
	}
	
	let obj 	= document.getElementById(objId);
	
	if(branchLevelFlag || configuration.gstValidationGroupLevel == 'true') {
		if(obj.id == 'consignorName' && obj.value.length > 0 && !(obj.value.toLowerCase() == '')) {
			let consignorGstno	= getConsignorGSTNumber();
			
			if(consignorGstno != undefined && consignorGstno.length > 0)
				return false;
		} else if(obj.id == 'consigneeName' && obj.value.length > 0 && !(obj.value.toLowerCase() == '')) {
			let consigneeGstno	= getConsigneeGSTNumber();
			
			if(consigneeGstno != undefined && consigneeGstno.length > 0)
				return false;
		}
	}
	
	return true;
}

function setStPaidByFromParyMaster(party) {
	if(configuration.changeStPaidByFromPartyMaster  == 'false')
		return
	
	let wayBillType = $('#wayBillType').val();
	
	if(wayBillType == WAYBILL_TYPE_PAID) {
		if(party.serviceTaxPaid && partyType == PARTY_TYPE_CONSIGNOR) 
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID).trigger('change');
	} else if(wayBillType == WAYBILL_TYPE_TO_PAY) {
		if(party.serviceTaxPaid && partyType == PARTY_TYPE_CONSIGNEE) 
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID).trigger('change');
	} else if(wayBillType == WAYBILL_TYPE_CREDIT) {
		if(party.serviceTaxPaid && party.tBBParty) 
			$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID).trigger('change');
	}
}

function getBillingBranch(corporateAccountId) {
	const jsonObject = { billingBranchId: corporateAccountId };

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/partyMasterWS/getBillingBranchForParty.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {

			if (data) {
				if (data.branchName) {
					$('#billingBranch').val(data.branchName);
					$('#billingBranchId').val(data.branchId);
				} else if (data.executiveBranchName) {
					$('#billingBranch').val(data.executiveBranchName);
					$('#billingBranchId').val(data.executiveBranchId);
				}
			} 
		},
	});

}

function setDeliveryAtFromPartyMaster() {
	if(configuration.selectDeliveryTypeFromPartyMaster == 'false')
		return;
	
	$("#deliveryTo").attr("disabled", false);
	
	if(configuration.byDefaultDeliveryAt == 'true' && (configuration.BookingType == 'false' || getBookingType() != DIRECT_DELIVERY_DIRECT_VASULI_ID))
		$("#deliveryTo").val(configuration.DefaultDeliveryAt);
	
	let wayBillType	= $('#wayBillType').val();
					
	if(getBookingType() != DIRECT_DELIVERY_DIRECT_VASULI_ID) {
		if(wayBillType == WAYBILL_TYPE_PAID) {
			if (Number(cnorPartyDeliveryAt) > 0) {
				$("#deliveryTo").val(cnorPartyDeliveryAt);
				$('#deliveryTo').attr('disabled', true);
			}
		} else if(wayBillType == WAYBILL_TYPE_TO_PAY) {
			if(Number(cneePartyDeliveryAt) > 0) {
				$("#deliveryTo").val(cneePartyDeliveryAt);
				$('#deliveryTo').attr('disabled', true);
			}
		} else if(wayBillType == WAYBILL_TYPE_CREDIT) {
			if(Number(tbbPartyDeliveryAt) > 0) {
				$("#deliveryTo").val(tbbPartyDeliveryAt);
				$('#deliveryTo').attr('disabled', true);
			}
		}
	}
}

function lrTypesValidationForPartyToPartyConfig() {
	singleLrTypeAllowedForPartyToPartyConfig = false;
	
	if(globalPartyToPartyConfigList == null || globalPartyToPartyConfigList.length === 0)
		return true;
	
	const wayBillTypeKeyMap		= new Map([[1, "F7"], [2, "F8"], [3, "F10"], [4, "F9"]]);
	const wayBillTypeMap		= new Map([[1, "PAID"], [2, "TO PAY"], [3, "FOC"], [4, "TBB"]]);

	let wayBillType = $("#wayBillType").val();
	const { lrTypeIds } = globalPartyToPartyConfigList[0];

	const allowedTypes = lrTypeIds.split(",").map(id => id.trim());

	if (allowedTypes.length === 1 && !allowedTypes.includes(wayBillType)) {
		singleLrTypeAllowedForPartyToPartyConfig = true;
		if(!isManualWayBill) {
			changeWayBillType(wayBillTypeKeyMap.get(Number(allowedTypes[0])), true);
		} else {
			$('#WBTypeManual').val(Number(allowedTypes[0]));
			changeWayBillTypeManual(Number(allowedTypes[0]));
		}
		
		return true;
	}

	if (!allowedTypes.includes(String(wayBillType))) {
		showMessage('error', `LR Type ${wayBillTypeMap.get(Number(wayBillType))} Is Not Allowed For This Party Configuration.`);
		resetConsignee();
		return false;
	}

	return true;
}

function convertLRTypeToTBBWhenPartyIsBilling() {
	if(!isManualWayBill)
		changeWayBillType('F9', true);
	else {
		$('#WBTypeManual').val(WAYBILL_TYPE_CREDIT);
		changeWayBillTypeManual(WAYBILL_TYPE_CREDIT);
	}
}

function addEventOnConsignorMailAfterDisable() {
	$('#consignorEmail').on('keydown', function (event) {
		if (event.which === 13 || event.which === 9) {
			event.preventDefault(); 
			setTimeout(function () {
				if(isGSTNumberWiseBooking())
					$('#consigneeCorpGstn').focus();
				else if(configuration.partyPanelType == '1')
					$('#consigneeName').focus();
			}, 50);
		}
	});
}
