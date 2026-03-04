/**
 * 
 */

var groupConfig					= null;
var partyType					= 0;
var consignor					= null;
var consignee					= null;
var wayBill						= null;
var executive					= null;
var isUpdateCustomer			= false;
var isUpdateTBBCustomer			= false;
var isUpdateBillingParty		= false;
var isConsignor					= false;
var isConsignee					= false;
var CorporateAccountConstant	= null;
var isAutoPartySave				= false;
var isUpdateCustomerWithRate	= false;
var isAutoRateRequires			= false;
var partyWiseRateHM				= null;
var bookingCharges				= null;
var EditLRRateConfiguration		= null;
var applyRateWithUpdateCustomer	= false;
var WayBillTypeConstant			= null;
var showPartyIsBlackListedParty = false;
var jsondata					= null;
var doneTheStuff 				= false;
var rateApplyOnChargeType		= 0;
var branchId					= 0;
var stringNew					= '(New)';
var overrideConsignorGSTNWithBillingPartyGSTN = false;
var allowToEditCustomerAddress	= false;
var isAllowToShowBillingPartyGSTN	= false;

function loadPageToUpdateCustomer(wayBillId) {

	let jsonObject		= new Object();
		
	jsonObject.filter					= 1;
	jsonObject.waybillId				= wayBillId;
	jsonObject.isUpdateCustomerWithRate	= $('#isUpdateCustomerWithRate').val();
	jsonObject.isUpdateCustomer			= $('#isUpdateCustomer').val();

	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/updateCustomerWS/loadUpdateCustomeData.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			jsondata					= data;

			if(data.message != undefined) {
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

				setTimeout(() => {
					window.close();
				}, 1500);
			}

			groupConfig					= data.GroupConfiguration;
			groupConfiguration			= data.GroupConfiguration;
			wayBill						= data.wayBill;
			consignor					= data.consignor;
			consignee					= data.consignee;
			executive					= data.executive;
			CorporateAccountConstant	= data.CorporateAccountConstant;
			isAutoPartySave				= data.isAutoPartySave;
			isAutoRateRequires			= data.isAutoRateRequires;
			EditLRRateConfiguration		= data.EditLRRateConfiguration;
			applyRateWithUpdateCustomer	= EditLRRateConfiguration.ApplyRate;
			WayBillTypeConstant			= data.WayBillTypeConstant;
			showPartyIsBlackListedParty	= groupConfig.showPartyIsBlackListedParty;
			branchId					= executive.branchId;
			allowToEditCustomerAddress 	= data.allowToEditCustomerAddress;
			overrideConsignorGSTNWithBillingPartyGSTN	= groupConfig.overrideConsignorGSTNWithBillingPartyGSTNInTBB;
			isAllowToShowBillingPartyGSTN				= groupConfig.isAllowToShowBillingPartyGSTN;

			isUpdateCustomer			= $('#isUpdateCustomer').val();
			isUpdateTBBCustomer			= $('#isUpdateTBBCustomer').val();
			isUpdateBillingParty		= $('#isUpdateBillingParty').val();
			isUpdateCustomerWithRate	= $('#isUpdateCustomerWithRate').val();

			$('#wayBillNo').val(wayBill.wayBillNumber);
			$('#lrNumber').html('<b>LR No :- ' + wayBill.wayBillNumber + '</b>');
			$('#sourceSubRegion').val(data.sourceSubRegion);
			$('#sourceBranchId').val(wayBill.wayBillSourceBranchId);
			$('#destinationBranchId').val(wayBill.wayBillDestinationBranchId);
			$('#remark').val(wayBill.remark);
			$('#destinationSubRegion').val(data.destinationSubRegion);
			$('#wayBillType').val(wayBill.wayBillTypeId);
			
			if(allowToEditCustomerAddress) {
				$('#consignorAddressRow').removeClass('hide');
				$('#consigneeAddressRow').removeClass('hide');
			}

			if(isUpdateCustomer == 'true') {
				$('#updateCustomerHeader').html('Update Customer');
				setConsignorDetails();
				setConsigneeDetails();
				$('#remarkDetails').switchClass('show', 'hide');
				document.getElementById('consignorName').focus();
			}

			if(isUpdateTBBCustomer == 'true') {
				$('#updateCustomerHeader').html('Update TBB Customer');
				setConsignorDetails();
				setConsigneeDetails();
				setBillingPartyDetails();
				document.getElementById('consignorName').focus();
			}

			if(isUpdateBillingParty == 'true') {
				$('#updateCustomerHeader').html('Update Billing Party');
				$('#billingPartyDetails').switchClass('show', 'hide');
				document.getElementById('billingParty').focus();
				setBillingPartyDetails();

				$('#consignorGstRow').remove();
				$('#consigneeGstRow').remove();
			}

			if(isUpdateCustomerWithRate == 'true') {
				$('#updateCustomerHeader').html('Update Customer With Rate');
				setConsignorDetails();
				setConsigneeDetails();
				$('#remarkDetails').switchClass('show', 'hide');

				if(isAutoRateRequires) {
					$('#ApplyAutoRates').attr('checked', true);
					$('#applyRateDetails').removeClass('hide');
					applyRateWithUpdateCustomer	= false;
				}

				document.getElementById('consignorName').focus();
			}

			if(groupConfig.gstnNumber) {
				$('#consigneeGstRow').removeClass('hide');
				$('#consignorGstRow').removeClass('hide');
			}

			if(applyRateWithUpdateCustomer) {
				$("#partyWiseRateDiv").load( "/ivcargo/html/module/waybill/editCustomer/partyWiseRatePanel.html", function() {
					$('#ApplyRatesWithChangePartyDetail').removeClass('hide');
				});
			}
			
			if(groupConfig.applyPartyCommissionFromPartyMaster && EditLRRateConfiguration.checkApplyRateAutomatically)
				getRateToApplyOnUpdateParty();

			if(groupConfig.landlineNoAllowedInMobileNoFeild) {
				$('#consignorPhone').prop('maxlength', 11);
				$('#consigneePhone').prop('maxlength', 11);					
			}

			setAutocompleters(wayBill);

			initialiseFocus();
			hideLayer();
		}
	});
}

function setConsignorDetails() {
	if(consignor != undefined) {
		$('#consignorDetails').switchClass('show', 'hide');

		$('#consignorId').val(consignor.customerDetailsId);
		$('#consignorAddress').val(consignor.customerDetailsAddress);
		$('#consignorContactPerson').val(consignor.customerDetailsContactPerson);
		$('#consignorPin').val(consignor.customerDetailsPincode);
		$('#consignorPartyId').val(consignor.corporateAccountId);
		$('#prevConsignorPartyId').val(consignor.corporateAccountId);
		$('#consignorName').val(consignor.customerDetailsName);
		$('#consignorPhone').val(consignor.customerDetailsMobileNumber);
		$('#consignorGst').val(consignor.gstn);
		$('#prevConsignorName').val(consignor.customerDetailsName);
		$('#prevConsignorContact').val(consignor.customerDetailsMobileNumber);
		$('#prevConsignorGst').val(consignor.gstn);
		$('#consignorEmail').val(consignor.customerDetailsEmailAddress);

		if(showPartyIsBlackListedParty && consignor.consignorBlackListed > 0) {
			setTimeout(function() {
				showMessage('error', 'Consignor Party is Blacklisted !');
			}, 300);
		}
		
		if(consignor.corporateAccountId > 0 && (isUpdateCustomer == 'true' || isUpdateCustomerWithRate == 'true'))
			isConsignor		= true;
	}
}

function setConsigneeDetails() {
	if(consignee != undefined) {
		$('#consigneeDetails').switchClass('show', 'hide');

		$('#consigneeId').val(consignee.customerDetailsId);
		$('#consigneeAddress').val(consignee.customerDetailsAddress);
		$('#consigneeContactPerson').val(consignee.customerDetailsContactPerson);
		$('#consigneePin').val(consignee.customerDetailsPincode);
		$('#consigneePartyId').val(consignee.corporateAccountId);
		$('#prevConsigneePartyId').val(consignee.corporateAccountId);
		$('#consigneeName').val(consignee.customerDetailsName);
		$('#consigneePhone').val(consignee.customerDetailsMobileNumber);
		$('#consigneeGst').val(consignee.gstn);
		$('#prevConsigneeName').val(consignee.customerDetailsName);
		$('#prevConsigneeContact').val(consignee.customerDetailsMobileNumber);
		$('#prevConsigneeGst').val(consignee.gstn);
		$('#consigneeEmail').val(consignee.customerDetailsEmailAddress);
		
		if(showPartyIsBlackListedParty && consignee.consigneeBlackListed > 0)
			showMessage('error', 'Consignee Party is blacklisted');
		
		if(consignee.corporateAccountId > 0 && (isUpdateCustomer == 'true' || isUpdateCustomerWithRate == 'true'))
			isConsignee		= true;
	}
}

function setBillingPartyDetails() {
	if(consignor != undefined) {
		$('#consignorId').val(consignor.customerDetailsId);
		$('#billingPartyId').val(consignor.customerDetailsBillingPartyId);
		$('#prevBillingPartyId').val(consignor.customerDetailsBillingPartyId);
		$('#billingParty').val(consignor.customerDetailsBillingPartyName);
		$('#billingPartyGstn').val(consignor.customerDetailsBillingPartyGstn);
		
		if(showPartyIsBlackListedParty && consignor.tbbBlackListed)
			showMessage('error', 'TBB Party is blacklisted ');
	}
}

function validateForm() {
	if($('#consignorGst').exists() && $('#consignorGst').is(":visible"))
		var consignorGstNo = $("#consignorGst").val(); 
	
	if($('#consigneeGst').exists() && $('#consigneeGst').is(":visible"))
		var consigneeGstNo = $("#consigneeGst").val(); 
	
	if(isUpdateCustomer == 'true' || isUpdateCustomerWithRate == 'true') {
		if(isConsignor && !validateConsignorParty())
			return false;

		if(isConsignee && !validateConsigneeParty())
			return false;
		
		if(!validateConsignorName(1, 'consignorName', 'consignorName'))
			return false;

		if(!groupConfig.landlineNoAllowedInMobileNoFeild
					&& groupConfig.ConsignorMobileNoLengthValidate 
					&& !validateConsignorPhoneNumber(5, 'consignorPhone', 'consignorPhone')) {
			$('#consignorPhone').val('0000000000');
			return false;
		}

		if(!validateConsigneeName(1, 'consigneeName', 'consigneeName'))
			return false;

		if(!groupConfig.landlineNoAllowedInMobileNoFeild
					&& groupConfig.ConsigneeMobileNoLengthValidate 
					&& !validateConsigneePhoneNumber(5, 'consigneePhone', 'consigneePhone')) {
			$('#consigneePhone').val('0000000000');
			return false;
		}
		
		if(!validateRemark(1, 'remark', 'remark'))
			return false;
	}
	
	if(isUpdateTBBCustomer == 'true') {
		if(!validateConsignorName(1, 'consignorName', 'consignorName'))
			return false;

		if(!groupConfig.landlineNoAllowedInMobileNoFeild
					&& groupConfig.ConsignorMobileNoLengthValidate 
					&& !validateConsignorPhoneNumber(5, 'consignorPhone', 'consignorPhone')) {
			$('#consignorPhone').val('0000000000');
			return false;
		}

		if(!validateConsigneeName(1, 'consigneeName', 'consigneeName'))
			return false;

		if(!groupConfig.landlineNoAllowedInMobileNoFeild
					&& groupConfig.ConsigneeMobileNoLengthValidate 
					&& !validateConsigneePhoneNumber(5, 'consigneePhone', 'consigneePhone')) {
			$('#consigneePhone').val('0000000000');
			return false;
		}
		
		if(!validateBillingParty(1, 'billingPartyId', 'billingParty'))
			return false;
		
		if(!validateConsignorParty())
			return false;
		
		if(!validateConsigneeParty())
			return false;
	}
	
	if(isUpdateBillingParty == 'true') {
		if(!validateBillingParty(1, 'billingPartyId', 'billingParty'))
			return false;
		
		if(!validateBillingParty(1, 'prevBillingPartyId', 'billingParty'))
			return false;
		
		if(!updateSameBillingParty())
			return false;
	}
	
	if($('#consignorGst').exists() && $('#consignorGst').is(":visible")){
		if(groupConfig.validatePanNumberInGstFeild && consignorGstNo.length == 10) {
			if(!validateInputTextFeild(8, "consignorGst", "consignorGst", "error", "Please Enter Valid Pan Number"))
				return false;
		} else if(!validateInputTextFeild(9, "consignorGst", "consignorGst", "error", "Please Enter Valid Gst Number"))
			return false;
	}
	
	if($('#consigneeGst').exists() && $('#consigneeGst').is(":visible")) {
		if(groupConfig.validatePanNumberInGstFeild && consigneeGstNo.length == 10) {
			if(!validateInputTextFeild(8, "consigneeGst", "consigneeGst", "error", "Please Enter Valid Pan Number"))
				return false;
		} else if(!validateInputTextFeild(9, "consigneeGst", "consigneeGst", "error", "Please Enter Valid Gst Number"))
			return false;
	}
	
	return true;
}

function updateSameBillingParty() {
	let billingPartyId			= $('#billingPartyId').val();
	let prevBillingPartyId		= $('#prevBillingPartyId').val();
	
	if(Number(billingPartyId) == Number(prevBillingPartyId)) {
		resetBillingParty();
		$('#billingParty').val('Billing Party Name');
		showMessage('info', sameBillingPartyInfoMsg);
		return false;
	}
	
	return true;
}

function validateConsignorParty() {
	let consignorPartyId		= $('#consignorPartyId').val();
	let prevConsignorPartyId	= $('#prevConsignorPartyId').val();

	if(!EditLRRateConfiguration.consignorValidateInUpdateCustomer && prevConsignorPartyId <= 0 && consignorPartyId <= 0){
		showMessage('error', validPartyNameErrMsg);
		$('#consignorName').val('');
		return false;
	} 

	return !(groupConfig.ConsignorValidate && groupConfig.ConsignorNameAutocomplete
		&& !validateInputTextFeild(1, 'consignorPartyId', 'consignorName', 'error', validConsinorNameErrMsg));
}

function validateConsigneeParty() {
	let consigneePartyId 		= $('#consigneePartyId').val();
	let prevConsigneePartyId 	= $('#prevConsigneePartyId').val();
	
	if(!EditLRRateConfiguration.consigneeValidateInUpdateCustomer  && prevConsigneePartyId <= 0 && consigneePartyId <= 0) {
		showMessage('error', validPartyNameErrMsg);
		$('#consigneeName').val('');
		return false;
	} 
	
	return !(groupConfig.ConsigneeValidate && groupConfig.ConsigneeNameAutocomplete
		&& !validateInputTextFeild(1, 'consigneePartyId', 'consigneeName', 'error', consineeNameErrMsg));
}

function showAddNewPartyDailog(partyType,obj) {
	let newPartyName 			= '';
	let newPartyMobileNumber 	= '';
	let newGstNumber			= '';
	
	if(isUpdateTBBCustomer == 'true' || isUpdateBillingParty == 'true')
		return;
	
	if(groupConfig.gstnNumber){
		if((obj.id == 'consignorGst' || obj.id == 'consigneeGst') && !validateGstn(obj))
			return;
		
		if(obj.id == 'consignorPhone' || obj.id == 'consigneePhone')
			return;
	}
	
	if(!isAutoPartySave)
		return;
	
	if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING) {
		newPartyName 			= $('#consignorName').val();
		newPartyMobileNumber 	= $('#consignorPhone').val();
		newGstNumber			= $('#consignorGst').val();

		if(newPartyName.length > 0) {
			$('#newPartyName').val(newPartyName);

			if(newPartyMobileNumber.length > 0)
				$('#newPartyMobileNumber').val(newPartyMobileNumber);
			else
				$('#newPartyMobileNumber').val('0000000000');
			
			if(newGstNumber.length > 0)
				$('#newGstNumber').val(newGstNumber);
			else
				$('#newGstNumber').val('');
		}

		$('#newPartyAddress').val($('#sourceSubRegion').val());
	} else {
		if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_DELIVERY) {
			newPartyName 			= $('#consigneeName').val();
			newPartyMobileNumber 	= $('#consigneePhone').val();
			newGstNumber			= $('#consigneeGst').val();

			if(newPartyName.length > 0 ){
				$('#newPartyName').val(newPartyName);
				
				if(newPartyMobileNumber.length > 0)
					$('#newPartyMobileNumber').val(newPartyMobileNumber);
				else
					$('#newPartyMobileNumber').val('0000000000');
				
				if(newGstNumber.length > 0)
					$('#newGstNumber').val(newGstNumber);
				else
					$('#newGstNumber').val('');
			}
		}

		$('#newPartyAddress').val($('#destinationSubRegion').val());
	}
	
	saveNewParty(partyType);
}

function saveNewParty(partyType) {
	
	if(!validateNewPartyName()) {return false;}
	if(!validateNewPartyMobileNo()) {return false;}

	let partyName 			= $('#newPartyName').val().toUpperCase();
	let partyMobileNumber 	= $('#newPartyMobileNumber').val();
	let partyAddress 		= $('#newPartyAddress').val();
	let partyBranchId 		= 0;
	let oldPartyMasterId	= 0;
	let partyGstn			= $('#newGstNumber').val();

	if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING) {
		partyBranchId 		= $('#sourceBranchId').val();
		oldPartyMasterId	= $('#consignorPartyId').val();
	} else if (partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_DELIVERY) {
		partyBranchId 		= $('#destinationBranchId').val();
		oldPartyMasterId	= $('#consigneePartyId').val();
	}

	if(partyBranchId > 0) {
		$.get("/ivcargo/jsp/transport/ajaxinterfaceForTransport.jsp",{
			filter:69,name:partyName,branchId:partyBranchId},function(data) {
				let party 	= $.trim(data);
				party 		= party.split(",");
				let partyMasterId 	= parseInt(party[0],10);
				
				if(partyMasterId > 0) {
					if(parseInt(oldPartyMasterId) != partyMasterId) {
						if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING)
							getParty(partyMasterId ,'consignorPartyId', 'consignorName', 'consignorPhone','consignorAddress', 'consignorPin', 'consignorContactPerson', partyType);
						else
							getParty(partyMasterId ,'consigneePartyId', 'consigneeName', 'consigneePhone', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', partyType);				
					}
				} else {
					//Add new Party
					let submit	= false;

					if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING)
						submit	= consignerDetailsLength('consignorName', 'Consignor Name');	
					else
						submit	= consignerDetailsLength('consigneeName', 'Consignee Name');	

					if(submit == true)
						saveParty(partyType, partyName, partyAddress, partyMobileNumber, partyBranchId, partyGstn, partyDeatil);
				}
			});
	}
}

function partyDeatil(response, partyType, partyName, partyMobileNumber, partyAddress, gstNumber) {
	let newPartyId	= response.partyid;

	if(newPartyId > 0) {
		if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING) {
			$('#consignorName').val(partyName);
			$('#consignorPhone').val(partyMobileNumber);
			$('#consignorAddress').val(partyAddress);
			$('#consignorPartyId').val(newPartyId);
			$('#cnorPartyId').val(newPartyId);
		} else if(partyType == CorporateAccountConstant.CORPORATEACCOUNT_TYPE_DELIVERY) {
			$('#consigneeName').val(partyName);
			$('#consigneePhone').val(partyMobileNumber);
			$('#consigneeAddress').val(partyAddress);
			$('#cneePartyId').val(newPartyId);
			$('#consigneePartyId').val(newPartyId);
		}
		
		$('#newPartyName').val('');
		$('#newPartyMobileNumber').val('');
		$('#newPartyAddress').val('');
	} else {
		$('#newPartyName').val('');
		$('#newPartyMobileNumber').val('');
		$('#newPartyAddress').val('');
		alert('There was an error while saving, please try again !');
	}
}

function validateNewPartyName() {
	return validateInputTextFeild(1, 'newPartyName', 'newPartyName', 'error', partyNameErrMsg);
}

function validateNewPartyMobileNo() {
	return validateInputTextFeild(1, 'newPartyMobileNumber', 'newPartyMobileNumber', 'error', mobileNumberErrMsg);
}

function setAutocompleters(wayBill) {
	if(isUpdateTBBCustomer == 'true')
		setConsignorNameAutocompleteForTBB();
	else
		setConsignorNameAutocomplete(wayBill.wayBillSourceBranchId);
	
	setConsigneeNameAutocomplete(wayBill.wayBillDestinationBranchId);
	setBillingPartyNameAutocomplete();
}

function setConsignorNameAutocompleteForTBB() {
	$("#consignorName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType="+CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BOOKING+"&responseFilter="+groupConfig.BookingConsignorNameAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			let name		= ui.item.label;

			$('#consignorName').val(name.replace(stringNew, ''));
			$('#consignorPartyId').val(0);
			
			if(ui.item.id != 0)
				getCreditorDetails(ui.item.id);
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setConsignorNameAutocomplete(sourceBranchId) {
	
	$("#consignorName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&sourceBranchId="+sourceBranchId+"&responseFilter="+groupConfig.BookingConsignorNameAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				let name		= ui.item.label;
				
				$('#consignorName').val(name.replace(stringNew, ''));
				
				$('#consignorPartyId').val(0);
				getParty(ui.item.id, 'consignorPartyId', 'consignorName', 'consignorPhone', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorGst', 1, 'consignorEmail');
			}
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setConsigneeNameAutocomplete(destinationBranchId) {
	$("#consigneeName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&destinationId="+destinationBranchId+"&responseFilter="+groupConfig.BookingConsigneeNameAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				let name		= ui.item.label;
				
				$('#consigneeName').val(name.replace(stringNew, ''));
				
				$('#consigneePartyId').val(0);
				getParty(ui.item.id , 'consigneePartyId', 'consigneeName', 'consigneePhone', 'consigneeAddress', 'consigneePin', 'consigneeContactPerson', 'consigneeGst', 2, 'consigneeEmail');
			}
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setBillingPartyNameAutocomplete() {
	$("#billingParty").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing="+CorporateAccountConstant.CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				let name		= ui.item.label;
				$('#billingPartyId').val(ui.item.id);

				if(name.indexOf("(") >= 0) {
					$('#billingParty').val(name.replace(stringNew, ''));
					
					if(!ui.item.isBlackListed)
						getCreditorDetails(ui.item.id)
				}
			}
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function resetBillingParty() {
	$('#billingPartyId').val(0);
}

function resetConsignorParty() {
	$('#consignorPartyId').val(0);
}

function resetConsigneeParty() {
	$('#consigneePartyId').val(0);
}

function getParty(partyId, id, name, no, add, pin, contact, gstn, selection, email) {
	setCustData(name, id, partyId);
	getPartyDetails(partyId, id, name, no, add, pin, contact, gstn, selection, email);
}

function setCustData(obj, hiddenObj, partyMasterId) {
	let custObj		= document.getElementById(obj);
	let custObjVal	= custObj.value;
	
	if(custObjVal.indexOf("(") >= 0)
		custObj.value 	= custObjVal.substring(0, custObjVal.indexOf('('));
	
	document.getElementById(hiddenObj).value = partyMasterId;
}

function getPartyDetails(partyId, id, name, no, add, pin, contact, gstn, selection, email) {
	let jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.getCharge			= 1;
	jsonObject.partyType			= selection;
	jsonObject.partyPanelType		= 1;
	jsonObject.wayBillTypeId		= wayBill.wayBillTypeId;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("AjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					
					if (partyType == PARTY_TYPE_CONSIGNOR) {
						$("#consignorName").focus();
						$('#consignorName').val('');
					} else if (partyType == PARTY_TYPE_CONSIGNEE) {
						$("#consigneeName").focus();
						$('#consigneeName').val('');
					}
				} else {
					if(!data.partyDetails)
						return;
					
					let party = data.partyDetails;
					
					if(showPartyIsBlackListedParty && party.blackListed > 0)
						showMessage('error','Party '+party.displayName +' is  blacklisted')
					
					if(!doNotAllowTBBPartyInTopayAndPaidBooking (selection, party.tBBParty, groupConfig.doNotAllowTBBPartyInTopayAndPaidBooking))
						return false;
					
					$('#' + id).val(party.corporateAccountId);
					$('#' + name).val(party.displayName);
					$('#' + add).val(party.address);
					$('#' + pin).val(party.pincode);
					$('#' + contact).val(party.contactPerson);
					$('#' + gstn).val(party.gstn);
					$('#' + email).val(party.emailAddress);
					
					if(EditLRRateConfiguration.checkApplyRateAutomatically)
						getRateToApplyOnUpdateParty();
					
					let newPartyMobileNumber 	= $('#newPartyMobileNumber').val();
					
					if(newPartyMobileNumber.length > 0) {
						$('#' + no).val($('#newPartyMobileNumber').val());
						$('#newPartyName').val('');
						$('#newPartyMobileNumber').val('');
						$('#newPartyAddress').val('');
					} else {
						$('#' + no).val(party.mobileNumber);
						$('#newPartyName').val('');
						$('#newPartyMobileNumber').val('');
						$('#newPartyAddress').val('');
					}
				}
			});
}

function getCreditorDetails(corporateAccountId) {
	if(corporateAccountId > 0) {
		let consignorName		= $('#consignorName').val();

		$('#consignorName').val(consignorName.substring(0, consignorName.indexOf('(')));

		let jsonObject					= new Object();

		jsonObject.filter				= 2;
		jsonObject.getCharge			= 1;
		jsonObject.partyId				= corporateAccountId;
		jsonObject.partyPanelType		= 1;
		jsonObject.partyType			= 2;

		let jsonStr = JSON.stringify(jsonObject);

		$.getJSON("Ajax.do?pageId=9&eventId=16",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log(data);
						
						if(!data.partyDetails)
							return;
						
						let party = data.partyDetails;
						
						if((showPartyIsBlackListedParty) && (party.blackListed > 0))
							showMessage('error','Party '+party.displayName +' is  blacklisted')
						
						$('#consignorPartyId').val(party.corporateAccountId);
						$('#consignorPhone').val(party.mobileNumber);
						$('#consignorGst').val(party.gstn);
						
						if(party.tBBParty && (overrideConsignorGSTNWithBillingPartyGSTN || isAllowToShowBillingPartyGSTN))
							$('#billingPartyGstn').val(party.gstn);

						if(EditLRRateConfiguration.checkApplyRateAutomatically)
							getRateToApplyOnUpdateParty();
					}
				});
			} else {
				alert('Unable to get Data, Please enter again.');
			}
}

function updateCustomer() {
	if(applyRateWithUpdateCustomer) {
		if($('#ApplyRatesWithChangeParty').is(":checked") && freightAmount <= 0) { //freightAmount coming from editRate.js, globally defined
			showMessage('error', 'Rate not found !');
			return false;
		}
	}
	
	let consignorName		= $('#consignorName').val();
	let consigneeName		= $('#consigneeName').val();
	
	consignorName.toUpperCase();
	consigneeName.toUpperCase();
	
	if(validateForm()) {
		if(!doneTheStuff) {
			$("#Update").addClass('hide');
			
			if($('#ApplyRatesWithChangeParty').is(":checked"))
				var answer = confirm ("Highlighted charges will be replaced with old value! \n Are you sure you want to update ?");
			else
				var answer = confirm ("Are you sure you want to update ?");
			
			if(answer) {
				doneTheStuff		= true;
				let jsonObject		= new Object();
				
				getDetailsToUpdateCustomer(jsonObject);
				
				if($('#ApplyRatesWithChangeParty').is(":checked") && freightAmount > 0) {
					jsonObject.STPaidBy				= $('#STPaidBy').val();
					jsonObject.bookingGrandTotal	= $('#grandTotal').val();
					jsonObject.serviceTaxAmount		= $('#wayBillTaxes_1').val();
					
					let chargesColl = new Object(); 
					
					for (const element of bookingCharges) {
						chargesColl['charge_' + element.chargeTypeMasterId] = $('#wayBillCharge_' + element.chargeTypeMasterId).val();
					}
					
					jsonObject.lrBookingCharges 	= JSON.stringify(chargesColl);
					jsonObject.qtyTypeWiseRateHM 	= qtyTypeWiseRateHM;
				}
				
				if(typeof partyIdForCommission !== 'undefined' && partyIdForCommission > 0)
					jsonObject.partyIdForCommission	= partyIdForCommission;
				else
					jsonObject.partyIdForCommission	= 0;
				
				showLayer();
			
				$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/updateCustomerWS/updateCustomer.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data.message != undefined) {
							let errorMessage = data.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
							hideLayer();
							doneTheStuff = false;
							
							if(errorMessage.type == 1) {//success
								setTimeout(() => {
									redirectToAfterUpdate(data);
								}, 1000);
							}
						}
						hideLayer();
					}
				});
			} else {
				doneTheStuff = false;
				setTimeout(() => {
					$("#Update").removeClass('hide');
				}, 200);
			}
		}
	}
}

function getDetailsToUpdateCustomer(jsonObject) {
	jsonObject.isUpdateCustomer			= $('#isUpdateCustomer').val();
	jsonObject.isUpdateTBBCustomer		= $('#isUpdateTBBCustomer').val();
	jsonObject.isUpdateBillingParty		= $('#isUpdateBillingParty').val();
	jsonObject.isUpdateCustomerWithRate	= $('#isUpdateCustomerWithRate').val();
	jsonObject.consignorName			= $('#consignorName').val();
	jsonObject.consigneeName			= $('#consigneeName').val();
	jsonObject.consignorPhone			= $('#consignorPhone').val();
	jsonObject.consigneePhone			= $('#consigneePhone').val();
	jsonObject.billingPartyName			= $('#billingParty').val();
	jsonObject.billingPartyGSTN			= $('#billingPartyGstn').val();
	jsonObject.prevBillingPartyName		= $('#prevBillingParty').val();
	jsonObject.consignorPartyId			= $('#consignorPartyId').val();
	jsonObject.prevConsignorPartyId		= $('#prevConsignorPartyId').val();
	jsonObject.consigneePartyId			= $('#consigneePartyId').val();
	jsonObject.prevConsigneePartyId		= $('#prevConsigneePartyId').val();
	jsonObject.consignorbillingPartyId	= $('#billingPartyId').val();
	jsonObject.prevBillingPartyId		= $('#prevBillingPartyId').val();
	jsonObject.remark					= $('#remark').val();
	jsonObject.wayBillId				= $('#wayBillId').val();
	jsonObject.consignorId				= $('#consignorId').val();
	jsonObject.consigneeId				= $('#consigneeId').val();
	jsonObject.consignorGstn			= $('#consignorGst').val();
	jsonObject.consigneeGstn			= $('#consigneeGst').val();
	jsonObject.consigneeEmail			= $('#consigneeEmail').val();
	jsonObject.consignorEmail			= $('#consignorEmail').val();
	
	let applyAutoRates					= false;
	let applyRatesWithChangeParty		= false;
	
	if($('#ApplyAutoRates').is(":checked"))
		applyAutoRates					= true;
	
	if($('#ApplyRatesWithChangeParty').is(":checked"))
		applyRatesWithChangeParty		= true;

	jsonObject.weightFreightRate		= weightFreightRate;
	jsonObject.applyAutoRates			= applyAutoRates;
	jsonObject.applyRatesWithChangeParty= applyRatesWithChangeParty;
	jsonObject.wayBillNo				= $('#wayBillNo').val();
	jsonObject.consignorAddress			= $('#consignorAddress').val();
	jsonObject.consigneeAddress			= $('#consigneeAddress').val();
	jsonObject.consignorPin				= $('#consignorPin').val();
	jsonObject.consigneePin				= $('#consigneePin').val();
	jsonObject.consignorContactPerson	= $('#consignorContactPerson').val();
	jsonObject.consigneeContactPerson	= $('#consigneeContactPerson').val();
	jsonObject.filter1					= $('#filter').val();
	jsonObject.redirectFilter			= $('#redirectFilter').val();
	jsonObject.rateApplyOnChargeType	= rateApplyOnChargeType;
	jsonObject.allowToEditCustomerAddress	= allowToEditCustomerAddress;
}

function checkChargeType() {
	return $('#ApplyRatesWithChangeParty').is(":checked");
}

function validateGstn(element){
	if($('#consignorGst').exists() && $('#consignorGst').is(":visible"))
		var consignorGst = $("#consignorGst").val();
		
	if($('#consigneeGst').exists() && $('#consigneeGst').is(":visible"))
		var consigneeGst = $("#consigneeGst").val(); 

	if($('#consignorGst').exists() && $('#consignorGst').is(":visible") && $('#consigneeGst').exists() && $('#consigneeGst').is(":visible")){
		if(groupConfig.validatePanNumberInGstFeild && consignorGst.length == 10) {
			if(!validateInputTextFeild(8, "consignorGst", "consignorGst", "error", "Please Enter Valid Pan Number"))
				return false;
		} else if(groupConfig.validatePanNumberInGstFeild && consigneeGst.length == 10) {
			if(!validateInputTextFeild(8, "consigneeGst", "consigneeGst", "error", "Please Enter Valid Pan Number"))
				return false;
		} else if(!validateInputTextFeild(10, element.id, element.id, "error", "Please Enter Valid Gst Number"))
			return false;
	} 

	return true;
}

function alphaNumericCharacter(e){
	let regex = new RegExp("^[a-zA-Z0-9]+$");
	let str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
	if (regex.test(str)) {
		return true;
	} else if(e.which == 8 || e.which == 13 || e.which == 0){
		return true;
	} else
		e.preventDefault();
	return false;
}

function doNotAllowTBBPartyInTopayAndPaidBooking(partyType, isTBBParty, doNotAllowTBBPartyInTopayAndPaidBooking) {
	if(doNotAllowTBBPartyInTopayAndPaidBooking){
		if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
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
					
					showMessage('error', "PAID / TOPAY booking not allowed for billing party. Please press F9 to create TBB LR.");
					return false;
				//}, 100);
			}
		}
	}
	
	return true;
}

function validateContactForSms(obj) {
	if(obj.value.length == 10 || obj.value.length == 0 || groupConfig.landlineNoAllowedInMobileNoFeild) {
		toogleElement('basicError','none');
		removeError(obj.id);
		return true;
	} else if(obj.value !='0000000000') {
		showSpecificErrors('basicError',"Phone Number may be incorrect, Please Check !");
		toogleElement('basicError','block');
		changeError1(obj.id,'0','0');
		return false;
	}
}

function validateGSTNumberByApi1(partyTypeId, obj) {
	if (!validateGstn(obj) || !isValidGSTChecking())
		return;
		
	let partyType = Number(partyTypeId);
	
	consignorGSTNVal = $('#consignorGst').val();
	consigneeGSTNVal = $('#consigneeGst').val();

	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && partyType == PARTY_TYPE_CONSIGNOR)
		return;
	
	let jsonObject = new Object();
	
	if (partyType == PARTY_TYPE_CONSIGNOR) {
		jsonObject["gstn"] 		= consignorGSTNVal;
		jsonObject.partyNameEle = $('#consignorName').val();
		jsonObject.partyId 		= $('#prevConsignorPartyId').val();
	} else if (partyType == PARTY_TYPE_CONSIGNEE) {
		jsonObject["gstn"] 		= consigneeGSTNVal;
		jsonObject.partyNameEle = $('#consigneeName').val();
		jsonObject.partyId 		= $('#prevConsigneePartyId').val();
	}

	showLayer();
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/FetchGSTDetailsWS/validateGSTNumberByApi.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			hideLayer();

			if (data == undefined || data.gstDetails == undefined || (data != undefined && !data.isValidGSTNumber)) {
				showMessage('error', 'Enter Valid GST Number !');
			
				if (partyType == PARTY_TYPE_CONSIGNOR)
					$('#consignorGst').val('');
				else if (partyType == PARTY_TYPE_CONSIGNEE)
				 	$('#consigneeGst').val('');
				
				return;
			}

			if (data.exceptionCode == 404)
				showMessage('error', 'Server not found !');

			if (partyType == PARTY_TYPE_CONSIGNOR) {
				if ($('#consignorName').val() != data.gstDetails.tradeName) {
					$('#consignorName').val(data.gstDetails.tradeName);
					hideLayer();			
				} else
					$('#consignorName').val();
			}

			if (partyType == PARTY_TYPE_CONSIGNEE) {
				if ($('#consigneeName').val() != data.gstDetails.tradeName) {
					$('#consigneeName').val(data.gstDetails.tradeName);
					hideLayer();
				} else
					$('#consigneeName').val();
			}
		}
	});
}

function isValidGSTChecking() {
	if (!groupConfig.gstValidationGroupLevel && !groupConfig.gstValidationBranchLevel)
		return false;

	if (groupConfig.gstValidationBranchLevel && groupConfig.branchIdsForGstValidation != undefined) {
		let branchIdsArray = (groupConfig.branchIdsForGstValidation).split(',');

		return isValueExistInArray(branchIdsArray, branchId);
	}
	
	return true;
}