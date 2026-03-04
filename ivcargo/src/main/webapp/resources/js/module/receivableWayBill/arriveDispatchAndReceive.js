function arriveDispatchAndReceiveWayBills(tableId) {
	disableButtons();

	if(!isDDDV && !configuration.hideGodown) {
		if(!validateGodownId(1, 'godownIdMaster'))
			return false;
		
		$.each($("input[name=wayBills]:checked"), function() { 
			if(!validateGodownId(1, 'godownId_' + Number($(this).val())))
				return false;
		});
		
		if(configuration.TruckUnloadedByUser && !validateUnloadByExecutiveId(1, 'unloadByExecutiveId'))
			return false;
	}
	
	if(configuration.TruckUnloadedByHamal && !validateUnloadedByHamal(1, 'unloadedByHamal'))
		return false;
	
	if(!validateManualTURSequence(tableId))
		return false;
	
	openArriveDispatchAndReceiveModel();
}

function createButtonForArriveAndDispatch() {
	var createButtonForArriveAndDispatch		= $("<input/>", { 
					type		: 'button', 
					id			: 'receiveDispatch', 
					class		: 'fpure-button pure-button-primary button', 
					name		: 'receiveDispatch', 
					style		: 'float:right;',
					value 		: 'Arrive & Dispatch', 
					onclick		: "arriveDispatchAndReceive('results','receiveAndDispatch');"});
	return createButtonForArriveAndDispatch;
}

function openArriveDispatchAndReceiveModel() {
	// Get the modal
	var modal = document.getElementById('receivemodal');
	
	$('#receiveDispatchDiv').html(createButtonForArriveAndDispatch());

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("receive-close")[0];
	    
	modal.style.display = "block";

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}
	
	$('#receiveDispatch').attr('disabled', 'disabled');
	$('#modelHeader').html('Arrive & Dispatch');

	setDestWiseWayBillReceivableModel();  //Defined in receivableWayBill.js
}

function arriveDispatchAndReceive(resultsTableId, arriveDispatchAndReceiveTableId) {

	var len				= wayBillReceivableModel.length;
	
	var chkBx 				= null;
	var checkedCounter		= 0;
	
	var tableEl1 = document.getElementById(arriveDispatchAndReceiveTableId);
	var count1 	 = parseInt(tableEl1.rows.length - 1);
	
	var destBranchIds	= new Array();
	
	for(var index = 0; index <= count1; index++) {
		chkBx = tableEl1.rows[index].cells[0].children[0];
		
		if(chkBx && chkBx.checked) {
			destBranchIds.push(tableEl1.rows[index].cells[0].firstElementChild.value);
			
			checkedCounter++;
		}
	}
	
	wayBillsForDispatch		= new Array();
	wayBillsForReceive		= new Array();
	
	for(var j = 0; j < wayBillReceivableModel.length; j++) {
		if(isValueExistInArray(destBranchIds, wayBillReceivableModel[j].destinationBranchId)) {
			wayBillsForDispatch.push(wayBillReceivableModel[j].wayBillId);
		} else {
			wayBillsForReceive.push(wayBillReceivableModel[j].wayBillId);
		}
	}
	
	if(checkedCounter == 0) {
		showMessage('error', "Please, Select atleast 1 destination to dispatch !");
		return false;
	}
	
	if(!validateTruckDestination(1, 'truckDestination')) {
		return false;
	}
	
	if(wayBillsForReceive != null && wayBillsForReceive.length == 0) {
		showMessage('info', "You cannot do Arrive and Dispatch all LR's");
		return false;
	}
	
	$('#subRegionExistForReceiveAndDispatch').val(false);
	$('#wayBillsForDispatch').val(wayBillsForDispatch);
	$('#wayBillsForReceive').val(wayBillsForReceive);
	
	// Get the modal
	var modal = document.getElementById('receivemodal');
	modal.style.display = "none";
	
	finallyReceivedWayBills(wayBillsForReceive.length, len); // Defined in receivableWayBill.js
}

function hideLinkForShortDamageButton() {
	if(wayBillsForDispatch == null)
		return;
	
	for(var j = 0; j < wayBillReceivableModel.length; j++) {
		if(isValueExistInArray(wayBillsForDispatch, wayBillReceivableModel[j].wayBillId)) {
			$('#hideLinkForShort_' + wayBillReceivableModel[j].wayBillId).addClass('hide');
			$('#hideLinkForDamage_' + wayBillReceivableModel[j].wayBillId).addClass('hide');
		}
	}
}

function showLinkForShortDamageButton() {
	if(wayBillsForDispatch == null)
		return;
	
	for(var j = 0; j < wayBillReceivableModel.length; j++) {
		if(isValueExistInArray(wayBillsForDispatch, wayBillReceivableModel[j].wayBillId)) {
			$('#hideLinkForShort_' + wayBillReceivableModel[j].wayBillId).removeClass('hide');
			$('#hideLinkForDamage_' + wayBillReceivableModel[j].wayBillId).removeClass('hide');
		}
	}
}