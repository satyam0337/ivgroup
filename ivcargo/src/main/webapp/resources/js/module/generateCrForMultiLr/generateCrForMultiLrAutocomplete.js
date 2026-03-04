/**
 * 
 */

function setDeliveryCreditorAutoComplete(id) {
	$("#deliveryCreditor_"+id).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType="+CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY+"&billing="+CorporateAccount.CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#selectedDeliveryCreditorId_'+id).val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
	if(configuration.showCentralizedDeliveryCreditor)  {
	$("#DeliveryCreditorName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType="+CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY+"&billing="+CorporateAccount.CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#centralizedDelCreditorId').val(ui.item.label);
				var tableEl = document.getElementById(tableId);
				var wayBillId = 0;
				
				for (var i = 1, row; row = tableEl.rows[i]; i++) {
					wayBillId	= 0;
					
					if (document.getElementById('LRRow_' + row.id))
						wayBillId = document.getElementById('LRRow_' + row.id).value;
					
					if (wayBillId > 0) {
						$('#selectedDeliveryCreditorId_' + wayBillId).val(ui.item.id);
						$('#deliveryCreditor_' + wayBillId).val(ui.item.label);
						$('#deliveryCreditor_' + wayBillId).attr('readonly', true);
					}
				}
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	}
}

function setSearchCollectionPersonAutoComplete(id) {

	$("#searchCollectionPerson_"+id).autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#selectedCollectionPersonId_'+id).val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setDeliveredToNameAutoComplete() {

	if (!configuration.DeliveredToNameAutoComplete) {
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

function setConsineeNameAutoComplete(consigneeNameId, destBranchId, wayBillId) {
	
	if (!configuration.ConsineeNameAutoComplete) {
		return;
	}

	$("#"+consigneeNameId).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destBranchId+"&responseFilter=1",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				setConsineeDetails(ui.item.id, wayBillId); // Calling from generateCrForMultiLrSetReset.js
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

function setRecoveryBranchAutoComplete(id) {
	$("#recoveryBranch_"+id).autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#recoveryBranchId_'+id).val(ui.item.id);
				$('#recoveryBranch_'+id).val(ui.item.label);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}