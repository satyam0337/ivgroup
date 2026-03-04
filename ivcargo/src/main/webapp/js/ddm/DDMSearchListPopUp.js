var myMap 			= new Map();
let selectedOrder = [];
var isNewDDMCreation = false;

function handleCheckboxClick(checkbox, id) {
    if (checkbox.checked) {
        selectedOrder.push(id + 1);
    } else {
        const index = selectedOrder.indexOf(id);
        if (index > -1) {
            selectedOrder.splice(index, 1);
        }
    }
}

function addToDispatchList() {
	showLayer();
	let tableEl = document.getElementById("results");
	let	counter = 0;
    let wayBillNumberArr    = [];
	let wayBillIds = [];
	
	if(selectedOrder && selectedOrder.length > 0) {
		for(let id of selectedOrder) {
			let row = tableEl.rows[id];
			
			if(row.cells[0].firstChild && row.cells[0].firstChild.checked && row.cells[2].firstChild.nodeValue !== " "
			&& !checkDifferentCases(row, wayBillIds, wayBillNumberArr))
				return;
				
				counter++;
			}
	} else {
		for(let i = 2; i < tableEl.rows.length; i++) {
			let row = tableEl.rows[i];
			
			if(row.cells[0].firstChild && row.cells[0].firstChild.checked && row.cells[2].firstChild.nodeValue !== " "
			&& !checkDifferentCases(row, wayBillIds, wayBillNumberArr))
				return;
			
				counter++;
			}
		}
	
	if(wayBillNumberArr.length > 0) {
		hideLayer();
		showMessage('error', "Please First Create PickUp LS of LRs " + wayBillNumberArr.join(', '));
		return false;
	}
	
	if(counter == 0) {
		hideLayer();
		showMessage('error', "Please select the LR !!");
		return false;
	}

	getDeliveryChargesForMultipleIds(wayBillIds.toString(), tableEl);
}

function checkDifferentCases(row, wayBillIds, wayBillNumberArr) {
	wayBillIds.push(row.cells[3].firstChild.nodeValue);

	if(Number(row.cells[25].firstChild.nodeValue) == 0 && allowDDMCreationAfterPickUpLS)
		wayBillNumberArr.push(row.cells[2].firstChild.nodeValue);
				
	let flagValue = row.cells[27].firstChild.nodeValue.trim();
	let waybillNumber = row.cells[2].firstChild.nodeValue.trim();
				
	if (flagValue === "true") {
		showMessage('error', "Payment Not Done for LR Number: " + waybillNumber + "!");
		hideLayer();
		return false;
	}
	
	let ddAmount 		= row.cells[28].firstChild.nodeValue.trim();
	let wayBillTypeId	= row.cells[18].firstChild.nodeValue;
	let lrTypes			= wayBillTypeForCheckDoorDeliveryAmount.split(',');
				
	if (checkDoorDeliveryAmount && isValueExistInArray(lrTypes, wayBillTypeId) && (ddAmount == "0" || ddAmount == 0)) {
		showMessage('error', "Door Delivery Amount is Missing for LR Number: " + waybillNumber + "!");
		hideLayer();
		return false;
	}
	
	return true;
}

function showResults(tableEl) {
	let flag = false;
	
	if(selectedOrder && selectedOrder.length > 0){
		for(let id of selectedOrder){
			let row = tableEl.rows[id];
			if(row.cells[0].firstChild && row.cells[0].firstChild.checked){
				setTimeout(function() { console.log('adding ddm data.....');}, 3000);

				if (isNewDDMCreation)
					addLRDetailsToMainTable(id);
				else
					add(id);

				flag = true;
			}
		}
	}else{
		for(let i = 2; i < tableEl.rows.length; i++){
			if(tableEl.rows[i].cells[0].firstChild && tableEl.rows[i].cells[0].firstChild.checked){
				setTimeout(function() { console.log('adding ddm data.....'); }, 3000);

				if (isNewDDMCreation)
					addLRDetailsToMainTable(i);
				else
					add(i);

				flag = true;
			}
			
		}
	}
	
	if(isNewDDMCreation)
		window.opener.updateSummary();
	
	opener.initialiseFocus();

	if(!flag) {
		showMessage('error', "Please select the LR !!");
		return false;
	} else
		hideAllMessages();
	
	if(isNewDDMCreation)
		opener.showLRAndSummaryDetails();
	else
		opener.showTruckLoadingDetails();
	
	window.close();
}

var executeOnlyOnce =  false;

function addLRDetailsToMainTable(row) {
	let tableEl			= document.getElementById("results");
	let blackListedObj 	= new Object();

	let blackListedPartyStr			= tableEl.rows[row].cells[24].firstChild.nodeValue;
	
	if(blackListedPartyStr != '') {
		let blackListedParty = blackListedPartyStr.split("_");
		
		blackListedObj.showPartyIsBlackListedParty 		= blackListedParty[0];
		blackListedObj.consignorBlackListed 	   		= blackListedParty[1];
		blackListedObj.consigneeBlackListed 	   		= blackListedParty[2];
		blackListedObj.tbbBlackListed 			   		= blackListedParty[3];
		blackListedObj.allowDeliveryForBlackListedParty = blackListedParty[4];
	}	
	
	let object = new Object();
	
	object.accountGroupId 				= tableEl.rows[row].cells[21].firstChild.nodeValue;
	object.actualWeight 				= tableEl.rows[row].cells[8].firstChild.nodeValue;
	object.branchId		 				= tableEl.rows[row].cells[14].firstChild.nodeValue;
	object.consigneeCorpId		 		= tableEl.rows[row].cells[22].firstChild.nodeValue;
	object.consigneeDetailsName		 	= tableEl.rows[row].cells[12].firstChild.nodeValue;
	object.consigneePhoneNumber		 	= tableEl.rows[row].cells[15].firstChild.nodeValue;
	object.consignorBlackListed		 	= blackListedObj.consignorBlackListed;
	object.consignorDetailsName		 	= tableEl.rows[row].cells[11].firstChild.nodeValue;
	object.ctoDetainedStatus		 	= tableEl.rows[row].cells[17].firstChild.nodeValue;
	object.deliveryTo		 			= tableEl.rows[row].cells[10].firstChild.nodeValue;
	object.deliveryToForUser		 	= tableEl.rows[row].cells[10].firstChild.nodeValue;
	object.destinationBranch		 	= tableEl.rows[row].cells[5].firstChild.nodeValue;
	object.destinationBranchId		 	= tableEl.rows[row].cells[6].firstChild.nodeValue;
	object.grandTotal		 			= tableEl.rows[row].cells[9].firstChild.nodeValue;
	object.locationId		 			= '';
	object.pendingQuantity		 		= tableEl.rows[row].cells[7].firstChild.nodeValue;
	object.quantity		 				= tableEl.rows[row].cells[7].firstChild.nodeValue;
	object.sourceBranch		 			= tableEl.rows[row].cells[4].firstChild.nodeValue;
	object.tbbBlackListed		 		= blackListedObj.tbbBlackListed;
	object.wayBillId		 			= tableEl.rows[row].cells[3].firstChild.nodeValue;
	object.wayBillNumber		 		= tableEl.rows[row].cells[2].firstChild.nodeValue;
	object.wayBillTypeId		 		= tableEl.rows[row].cells[18].firstChild.nodeValue;
	object.wayBillTypeStr		 		= tableEl.rows[row].cells[13].firstChild.nodeValue;

	window.opener.setLRDetailsHeader(object);
	window.opener.setSummaryTable();
	window.opener.setLRDetailsTable(object);
}

function add(row) {
	let tableEl			= document.getElementById("results");
	let blackListedObj = new Object();

	let srcBranchAbrCode			= ''	

	if(tableEl.rows[row].cells[19].firstChild!= null)
		srcBranchAbrCode			= tableEl.rows[row].cells[19].firstChild.nodeValue;

	let destBranchAbrCode			= '';

	if(tableEl.rows[row].cells[20].firstChild != null)
		destBranchAbrCode			= tableEl.rows[row].cells[20].firstChild.nodeValue;

	let accountGroupId				= tableEl.rows[row].cells[21].firstChild.nodeValue;
	let blackListedPartyStr			= tableEl.rows[row].cells[24].firstChild.nodeValue;
	let showBlackListedParty 		= false;
	
	if(blackListedPartyStr != '') {
		let blackListedParty =  blackListedPartyStr.split("_");

		blackListedObj.showPartyIsBlackListedParty 		= blackListedParty[0];
		blackListedObj.consignorBlackListed 	   		= blackListedParty[1];
		blackListedObj.consigneeBlackListed 	   		= blackListedParty[2];
		blackListedObj.tbbBlackListed 			   		= blackListedParty[3];
		blackListedObj.allowDeliveryForBlackListedParty = blackListedParty[4];
			
		if(blackListedObj.showPartyIsBlackListedParty == true || blackListedObj.showPartyIsBlackListedParty == 'true') {
			showBlackListedParty = (Number(blackListedObj.consignorBlackListed) > 0 && Number(blackListedObj.tbbBlackListed) > 0
				|| Number(blackListedObj.consignorBlackListed) > 0 || Number(blackListedObj.consigneeBlackListed) > 0
				|| Number(blackListedObj.tbbBlackListed) > 0);
		}
	}
	
	let ddm	= {};
	
	ddm.creationDateForUser	= tableEl.rows[row].cells[1].firstChild.nodeValue;
	ddm.wayBillNumber		= tableEl.rows[row].cells[2].firstChild.nodeValue;
	ddm.wayBillId			= tableEl.rows[row].cells[3].firstChild.nodeValue;
	ddm.sourceBranch		= tableEl.rows[row].cells[4].firstChild.nodeValue;
	ddm.srcBranchAbrCode	= srcBranchAbrCode;
	ddm.destinationBranch	= tableEl.rows[row].cells[5].firstChild.nodeValue;
	ddm.destBranchAbrCode	= destBranchAbrCode;
	ddm.destinationBranchId = tableEl.rows[row].cells[6].firstChild.nodeValue;
	ddm.quantity			= tableEl.rows[row].cells[7].firstChild.nodeValue;
	ddm.actualWeight 		= tableEl.rows[row].cells[8].firstChild.nodeValue;
	ddm.grandTotal			= tableEl.rows[row].cells[9].firstChild.nodeValue;
	ddm.deliveryToForUser	= tableEl.rows[row].cells[10].firstChild.nodeValue;
	ddm.consignorDetailsName	= tableEl.rows[row].cells[11].firstChild.nodeValue;
	ddm.consigneeDetailsName	= tableEl.rows[row].cells[12].firstChild.nodeValue;
	ddm.wayBillTypeStr			= tableEl.rows[row].cells[13].firstChild.nodeValue;
	ddm.branchId				= tableEl.rows[row].cells[14].firstChild.nodeValue;
	ddm.locationId				= '';
	ddm.locationName			= '';
	ddm.consigneePhoneNumber	= tableEl.rows[row].cells[15].firstChild.nodeValue;
	ddm.ctoDetainedStatus		= tableEl.rows[row].cells[17].firstChild.nodeValue;
	ddm.wayBillTypeId			= tableEl.rows[row].cells[18].firstChild.nodeValue;
	ddm.consigneeCorpId			= tableEl.rows[row].cells[22].firstChild.nodeValue;
	ddm.showBlackListedParty	= showBlackListedParty;
	ddm.ddbWiseSelfPartyId		= tableEl.rows[row].cells[23].firstChild.nodeValue;
	ddm.billSelectionId			= tableEl.rows[row].cells[26].firstChild.nodeValue;
	ddm.lrWiseLorryHireAmount	= tableEl.rows[row].cells[28].firstChild.nodeValue;
	
	ddm.discountAmount			= tableEl.rows[row].cells[29].firstChild.nodeValue;
	ddm.discountMasterId		= tableEl.rows[row].cells[30].firstChild.nodeValue;
	ddm.divisionId				= tableEl.rows[row].cells[32].firstChild.nodeValue;
	ddm.subRegionId				= tableEl.rows[row].cells[33].firstChild.nodeValue;
	
	if(accountGroupId == 270)
		window.opener.addWithNewOrder(ddm);
	else
		window.opener.add(ddm);
}

function getDeliveryChargesForMultipleIds(wayBillIds, tableEl) {
	let jsonObjectdata = new Object();
	jsonObjectdata.filter 			= 21; 
	jsonObjectdata.wayBillIds 	= wayBillIds; 

	let jsonStr = JSON.stringify(jsonObjectdata);

	$.getJSON("WayBillAjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if(data.wbIdWiseBookingCharges)
					window.opener.wbIdWiseBookingCharges		= data.wbIdWiseBookingCharges;
				
				if(data.wbIdWiseDeliveryCharges)
					window.opener.wbIdWiseDeliveryCharges	= data.wbIdWiseDeliveryCharges;

				if(data.isNewDDMCreation)
					isNewDDMCreation = data.isNewDDMCreation;
					
				showResults(tableEl);
			});		
}

function selectAllOutboundCargo(param) {
	if(document.getElementById('results')) {
		let tab 	= document.getElementById('results');
		let count 	= parseFloat(tab.rows.length-1);

		for (let row = count; row > 0; row--) {
			if(tab.rows[row].style.display == '')
				tab.rows[row].cells[0].firstChild.checked = param;
		}

		if(param)
			document.getElementById("Add").focus();
	}
}

function isValueExistInArray(arr, value) {
	
	if(arr == null) return false;

	for(const element of arr) {
		if(element == value)
			return true;
	}
	
	return false;
}