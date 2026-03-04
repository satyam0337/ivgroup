/**
 * @Author Anant Chaudhary	08-02-2016
 */

var TBB_BILLING		= 2;
var TBB_CREDITOR	= 1;

function setBillingPartyNameAutoComplete() {
	$('#billingPartyName').prop("autocomplete", "off");

	$("#billingPartyName").autocomplete({
		source : "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=4&customerType=1&responseFilter=3",
		minLength : 3,
		delay : 10,
		autoFocus : true,
		select : function(event, ui) {
			if (ui.item.id != 0) {
				resetBillingPartyData();
				getTBBPartyDetails(ui.item.id, TBB_BILLING);
			}
		},
		response : function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function resetBillingPartyData() {
	if ($('#billingPartyId').val() <= 0) {
		return true;
	}
	$('#billingPartyId').val('0');
	if(typeof resetCharges != 'undefined') resetCharges(); //resetOnChargeTypeExcludingPackageDetails(); // Replaced With resetCharges();
}

function setNextPrevForConsignorBillingPartyName() {
	prev = 'consignorPhn';
	next = 'consigneeName';
}

function setLogoutIfEmpty(ui) {
	if (ui.content) {
		if (ui.content.length < 1) {
			ui.content.push({
				"label" : "You are logged out, Please login again !",
				"id" : "0"
			});
		}
	}
}

function getTBBPartyDetails(corpId, tBBpartyType) {
	var jsonObject = new Object();

	jsonObject.filter 			= 2;
	jsonObject.partyId 			= corpId;
	jsonObject.partyType 		= tBBpartyType;
	jsonObject.partyPanelType	= 1;

	var jsonStr = JSON.stringify(jsonObject);
	
	setValueToTextField('billingPartyId', corpId);

	$.getJSON("Ajax.do?pageId=9&eventId=16", {
		json : jsonStr
	}, function(data) {
		if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.result == '0') {
			//showMessage('error', data.errorDescription);
			showMessage('info', data.partyNotFound);
		} else {
			console.log(data);
			if (!data.partyDetails) {
				return;
			}

			var party = data.partyDetails;

			if (tBBpartyType == TBB_CREDITOR) {
				setCreditorParty(party);
			} else if (tBBpartyType == TBB_BILLING) {
				//setBillingParty(party);
			}
		}
	});
}

//get key perss code. works in chrome in firefox
function getKeyCode(event) {
	return event.which || event.keyCode;
}

function printLaserData(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {

	var table = $('#results').DataTable();
	table.destroy();
	
	detailHeader = document.getElementById('reportName').innerHTML;
	
	childwin = window.open(
					'jsp/printData.jsp?accountGroupName='
							+ accountGroupName + '&branchAddress='
							+ branchAddress + '&branchPhoneNo='
							+ branchPhoneNo + '&detailHeader='
							+ detailHeader,
					'newwindow',
					config = 'height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForLaserDelay, 1000);
	setTimeout(resetTable, 1000);
}

function waitForLaserDelay() {
	//Remove Check box Column

	childwin.document.getElementById('data').innerHTML = document.getElementById('reportData').innerHTML;
	// $('#results td:first-child,th:first-child,',childwin.document).remove(); 
	childwin.print();
}

function resetError(el) {
	toogleElement('basicError', 'none');
	toogleElement('msg', 'none');
	removeError(el.id);
}

function hideInfo() {
	refreshAndHidePartOfPage('toolTipInfo', 'hide');
}