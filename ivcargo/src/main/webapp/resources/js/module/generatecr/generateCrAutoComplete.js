/**
 * 
 */

function setDeliveryCreditorAutoComplete() {

	if (configuration.DeliveryCreditorAutocomplete != "true") {
		return;
	}
	var creditorType=0;
	if(executive!=undefined && executive.accountGroupId <= 591)
		creditorType	= CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY;
	
	$("#deliveryCreditor").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType="+creditorType+"&billing="+CorporateAccount.CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#selectedDeliveryCreditorId').val(ui.item.id);
				matadiChargesApplicableForBillCredit	= ui.item.matadiChargesApplicable;
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setSearchCollectionPersonAutoComplete() {

	if (configuration.SearchCollectionPersonAutocomplete != "true") {
		return;
	}

	$("#searchCollectionPerson").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter=1",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#selectedCollectionPersonId').val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setDeliveredToNameAutoComplete() {

	if (configuration.DeliveredToNameAutoComplete != "true") {
		return;
	}

	$("#deliveredToName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=16",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#selectedDeliveryCustomerId').val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setConsineeNameAutoComplete(consigneeNameId) {
	
	if (configuration.ConsineeNameAutoComplete != 'true') {
		return;
	}

	$("#"+consigneeNameId).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destBranchId+"&responseFilter=2&isBlackListPartyCheckingAllow="+configuration.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=2",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				setConsigneeDetails(ui.item.id); //Defined in generatecrSetReset.js
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setVehicleNumberAutocomplete(){
	
	$("#VehicleNumber").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=20",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0){
				console.log("setVehicleNumberAutocomplete",ui.item)
				vehicleNumberMasterId	= ui.item.id;
				vehicleNumber			= ui.item.value;
			} else if(ui.item.id == "0") {
				vehicleNumberMasterId	= 0;
				//vehicleNumber			= ui.item.value;
				//createNewVehicle(this);
			} else {
				setLogoutIfEmpty(ui);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setBillingBranchAutoComplete(){
	
	if (configuration.billingBranch != 'true') {
		$('#billingBranch').prop("autocomplete","on");
		return true;
	}

	$('#billingBranch').prop("autocomplete","off");

	$("#billingBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getBillingBranch(ui.item.id, ui.item.label); // function defined in commonFunctionForCreateWayBill.js
				
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}

function setRecoveryBranchAutoComplete(){
	if (configuration.showRecoveryBranchForShortCredit == 'false') {
		$('#recoveryBranch').prop("autocomplete","on");
		return true;
	}

	$('#recoveryBranch').prop("autocomplete","off");

	$("#recoveryBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getRecoveryBranch(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}