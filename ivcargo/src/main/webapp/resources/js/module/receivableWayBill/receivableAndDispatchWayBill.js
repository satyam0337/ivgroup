function ReceiveDispatchWayBills(tableId) {
	disableButtons();
	
	if(!isDDDV) {
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
	
	openReceiveAndDispatchModel();
}

function createButtonForReceiveAndDispatch() {
	var ddmSettlementButton		= new Object();

	ddmSettlementButton.onclick		= "receiveAndDipatchWayBills('results','receiveAndDispatch');";
	ddmSettlementButton.html		= 'Receive & Dispatch'; 
	ddmSettlementButton.class		= 'btn btn-primary';
	ddmSettlementButton.id			= 'receiveDispatch';
	ddmSettlementButton.style		= 'float:right;';
	ddmSettlementButton.type		= 'button';
	
	createButton($('#receiveDispatchDiv'), ddmSettlementButton);
}

function openReceiveAndDispatchModel() {
	// Get the modal
	var modal = document.getElementById('receivemodal');
	
	$('#receiveDispatchDiv').empty();
	createButtonForReceiveAndDispatch();

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("receive-close")[0];
	    
	modal.style.display = "block";

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}
	
	$('#receiveDispatch').attr('disabled', 'disabled');
	$('#modelHeader').html('Receive & Dispatch');

	setDestWiseWayBillReceivableModel(); //Defined in receivableWayBill.js
}

function receiveAndDipatchWayBills(resultsTableId, receiveAndDispatchTableId) {

	var len					= wayBillReceivableModel.length;
	
	var tableEl 			= document.getElementById(resultsTableId);
	var count 				= parseInt(tableEl.rows.length - 1);
	var ch					= 0;
	var chkBx 				= null;
	var checkedCounter		= 0;
	
	for(var i = 1; i < count; i++) {
		chkBx = tableEl.rows[i].cells[0].children[0];
		
		if(chkBx && chkBx.checked) {
			ch = ch + 1;
		}
	}

	var tableEl1 = document.getElementById(receiveAndDispatchTableId);
	var count1 	 = parseInt(tableEl1.rows.length - 1);
	
	var destBranchIds	= new Array();
	
	for(var index = 0; index <= count1; index++) {
		chkBx = tableEl1.rows[index].cells[0].children[0];
		
		if(chkBx && chkBx.checked) {
			destBranchIds.push(tableEl1.rows[index].cells[0].firstElementChild.value);
			
			checkedCounter++;
		}
	}
	
	var wayBillsForDispatch	= new Array();
	
	for(var j = 0 ; j < wayBillReceivableModel.length; j++) {
		if(isValueExistInArray(destBranchIds, wayBillReceivableModel[j].destinationBranchId))
			wayBillsForDispatch.push(wayBillReceivableModel[j].wayBillId);
	}
	
	if(checkedCounter == 0) {
		showMessage('error', '<i class="fa fa-times-circle"></i> Please, Select atleast 1 destination to dispatch !');
		return false;
	}
	
	if(!validateTruckDestination(1, 'truckDestination'))
		return false;
	
	$('#subRegionExistForArriveAndDispatch').val(false);
	$('#wayBillsForDispatch').val(wayBillsForDispatch);
	
	// Get the modal
	var modal = document.getElementById('receivemodal');
	modal.style.display = "none";
	
	finallyReceivedWayBills(ch,len);  // Defined in receivableWayBill.js
}