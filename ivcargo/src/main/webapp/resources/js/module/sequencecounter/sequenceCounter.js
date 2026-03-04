function displaySequenceData(sourceBranchId) {
	let jsonObject = new Object();

	jsonObject.sourceBranchId = sourceBranchId;
	
	if(isTruckArrivalSequence == true || isTruckArrivalSequence == 'true')
		displayTrcukArrivalSequence(jsonObject);
		
	if(isPickupLSSequence == true || isPickupLSSequence == 'true')
		displayPickupLSSequence(jsonObject)
	
	if(isMRSequence == true || isMRSequence == 'true')
		displayMRSequence(jsonObject)
	
	if(isPendingLSPaymentSequence == true || isPendingLSPaymentSequence == 'true')
		displayPendingLSPaymentSequence(jsonObject)
	
	if(isConsolidatedBlhpvSequence == true || isConsolidatedBlhpvSequence == 'true')
		displayConsolidateBLhpvSequence(jsonObject)
}

function displayPickupLSSequence(jsonObject) {
	$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/master/doorPickupSequenceCounterWS/getPickupLsSequenceDetails.do?',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				let minRange = 0;
				let maxRange = 0;
				let nextVal = 0;
				
				if (data?.pickUpLsSeqCounter && Object.keys(data).length !== 0) {
					let pickUpLsSeqCounter = data.pickUpLsSeqCounter;
					minRange	= pickUpLsSeqCounter.minimumRange;
					maxRange	= pickUpLsSeqCounter.maximumRange;
					nextVal		= pickUpLsSeqCounter.nextValue;
				}

				$('#pickupLSSequenceMin').val(minRange)
				$('#pickupLSSequenceMax').val(maxRange)
				$('#pickupLSSequenceNext').val(nextVal)
				$('#pickupLSSequenceNextForUpdate').val(nextVal)

				hideLayer();
			}, error: function(xhr, status, error) {
				showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
				hideLayer();
			}
		});
}

function addPickupLsSequencee(Obj) {
	if(!formValidation(Obj))
		return false;

	let jsonObject		= new Object();

	let pickupLsSeqMin 		= $('#pickupLSSequenceMin').val();
	let pickupLsSeqMax		= $('#pickupLSSequenceMax').val();
	let pickupLsSeqNext		= $('#pickupLSSequenceNext').val();
	
	if (pickupLsSeqMin.trim() === "" || pickupLsSeqMin <= 0) {
		showMessage('error', 'Min Value Must Be Greater than 0');
		toogleElement('error', 'block');
		changeError1('pickupLSSequenceMin', '0', '0');
		$("#pickupLSSequenceMin").focus();
		return false;
	}

	if(pickupLsSeqMax.trim() === "" || pickupLsSeqMax <= 0) {
		showMessage('error','Max Value Must Be Greater than 0');
		toogleElement('error','block');
		changeError1('pickupLSSequenceMax','0','0');
		$("#pickupLSSequenceMax").focus(); 
		return false;
	}
	
	if (!validateRanges(pickupLsSeqMin, pickupLsSeqMax)) { return false; }
	
	let ans = confirm("Are you sure you want to add this Range ?");

	if (!ans) return;

	jsonObject.minRange 			= pickupLsSeqMin;
	jsonObject.maxRange 			= pickupLsSeqMax;
	jsonObject.nextValue 			= pickupLsSeqNext;
	jsonObject.sourceBranchId		= $('#searchBranch').val();
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/doorPickupSequenceCounterWS/insertPickupLsSequence.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				resetValues();
			}
			
			hideLayer();
		}
	});
}

function addMRSequencee(Obj) {
	if(!formValidation(Obj))
		return false;

	let jsonObject		= new Object();

	let ans = confirm("Are you sure you want to add  ?");

	if (!ans) return;

	jsonObject.nextValue 			= $('#mrSequenceNext').val();
	jsonObject.sourceBranchId		= $('#searchBranch').val();
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/mrSequenceCounterWS/insertMRSequenceCounter.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			hideLayer();
		}
	});
}

function addArrivalSequence(obj){
	if(!formValidation(obj))
		return false;

	let jsonObject		= new Object();

	let arrivalSeqNext		= $('#arrivalSequenceNext').val();
		
	let ans = confirm("Are you sure you want to add ?");

	if (!ans) return;

	jsonObject.nextValue 			= arrivalSeqNext;
	jsonObject.sourceBranchId		= $('#searchBranch').val();
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/truckArrivalSequenceCounterWS/insertTruckArrivalSequenceCounter.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			hideLayer();
		}
	});
	
}

function displayTrcukArrivalSequence(jsonObject) {
	$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/truckArrivalSequenceCounterWS/getTruckArrivalSequenceCounterToDisplay.do?',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				let nextVal = 0;
				if (Array.isArray(data.truckArrivalSeqCounter) && data.truckArrivalSeqCounter.length > 0) {
					let truckArrivalSeqCounter = data.truckArrivalSeqCounter[0]; // access first object
					nextVal = truckArrivalSeqCounter.nextVal;
				}
				$('#arrivalSequenceNext').val(nextVal)
				$('#arrivalSequenceNextForUpdate').val(nextVal)

				hideLayer();
			}, error: function(xhr, status, error) {
				showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
				hideLayer();
			}
		});
}

function resetValues() {
	$('#pickupLSSequenceMin').val(0);
	$('#pickupLSSequenceMax').val(0);
	$('#pickupLSSequenceNext').val(0);
}

function validateRanges(min,max){
	let maxVal = Number(max);
	let minVal = Number(min)
	let msg = "Max Range Must Be Grater Than Min Range";
	
	if(minVal >= maxVal){
		showMessage('info',msg);
		toogleElement('error','block');
		changeError1(min,'0','0');
		changeError1(max,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(min);		
		removeError(max);		
	}
	
	return true;
}

function addPickupLsSequenceNextForUpdatee(obj) {
	if(!formValidation(obj))
		return false;
	
	let ans = confirm("Are you sure you want to update this Range ?");

	if (!ans) return;
	
	showLayer();

	let jsonObject		= new Object();
	
	jsonObject.nextValue		= $('#pickupLSSequenceNextForUpdate').val();
	jsonObject.sourceBranchId	= $('#searchBranch').val();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/doorPickupSequenceCounterWS/updatePickupLsNextSequence.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				$('#pickupLSSequenceNext').val(jsonObject.nextValue);
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				resetValues();
			}
			
			hideLayer();
		}
	});
}

function viewAllLrSequence(filter) {
	window.open("masters.do?pageId=340&eventId=1&modulename=viewDetails&filter=" + filter, "_blank");	
}

function displayLRSequence(obj) {
	if(!branchValidation()) {
		$('#billSelection').val(0);
		$('#gstSelection').val(-1);
		$('#divisionSelection').val(-1);
		return false;
	}
		
	let billSelectionElement		= document.getElementById("billSelection");
	let billSelection				= billSelectionElement ? billSelectionElement.value : 0;
	let gstSelectionElement			= document.getElementById("gstSelection");
	let gstSelection				= gstSelectionElement ? gstSelectionElement.value : 0;
	let divisionSelectionElement	= document.getElementById("divisionSelection");
	let divisionId					= divisionSelectionElement ? divisionSelectionElement.value : 0;
		
	let jsonObject = new Object();

	jsonObject.sourceBranchId = $('#searchBranch').val();
	jsonObject.billSelectionId = billSelection;
	jsonObject.gstSelection = gstSelection;
	jsonObject.divisionId = divisionId;
	
	showLayer();
		
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/lrSequenceCounterWS/getSequenceCounterForLogs.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let minRange = 0;
			let maxRange = 0;
			let nextVal = 0;
				
			if (data?.sequenceCounter && Object.keys(data).length !== 0) {
				let sequenceCounter = data.sequenceCounter;
				minRange	= sequenceCounter.minRange;
				maxRange	= sequenceCounter.maxRange;
				nextVal		= sequenceCounter.nextVal;
			}

			$('#bookingSequenceMin').val(minRange)
			$('#bookingSequenceMax').val(maxRange)
			$('#bookingSequenceNext').val(nextVal + 1);
			$('#lrSequenceNextForUpdate').val(nextVal + 1)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function addLRSeqenceCounter(insertBranchLRSeqence, nextValue, isNextValueUpdate) {
	let	minRange = document.getElementById('bookingSequenceMin') != null ? document.getElementById('bookingSequenceMin').value : 0;
	let	maxRange = document.getElementById('bookingSequenceMax') != null ? document.getElementById('bookingSequenceMax').value : 0;

	let billSelectionElement		= document.getElementById("billSelection");
	let billSelection				= billSelectionElement ? billSelectionElement.value : 0;
	let gstSelectionElement			= document.getElementById("gstSelection");
	let gstSelection				= gstSelectionElement ? gstSelectionElement.value : 0;
	let divisionSelectionElement	= document.getElementById("divisionSelection");
	let divisionId					= divisionSelectionElement ? divisionSelectionElement.value : 0;
		
	let jsonObject = new Object();

	jsonObject.sourceBranchId	= $('#searchBranch').val();
	jsonObject.billSelectionId	= billSelection;
	jsonObject.gstSelection		= gstSelection;
	jsonObject.nextValue		= nextValue;
	jsonObject.isNextValueUpdate= isNextValueUpdate;
	jsonObject.divisionId		= divisionId;

	if(!insertBranchLRSeqence) {
		jsonObject.minRange		= minRange;
		jsonObject.maxRange		= maxRange;
	}
			
	if(insertBranchLRSeqence && confirm('Are you sure you want to Insert ?') 
		|| !insertBranchLRSeqence && confirm('Are you sure you want to Update ?')) {  
		showLayer();
			
		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/lrSequenceCounterWS/insertLRSequence.do?',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if(errorMessage.type != 1)
						insertBranchLRSeqence = false;
				}
				
				if(insertBranchLRSeqence) {
					document.SequenceCounterMasterForm.bookingSequenceNext.disabled = false;
					document.SequenceCounterMasterForm.bookingSequenceNext.readOnly = false;
					document.SequenceCounterMasterForm.addLRSeq.style.display='block';
					document.SequenceCounterMasterForm.addBranchLRSeq.style.display='none';
					$("#branchSequenceErrorMsg").css('display','none');
					document.SequenceCounterMasterForm.bookingSequenceNext.value = 1;
					document.SequenceCounterMasterForm.lrSequenceNextForUpdate.disabled = false;
					document.SequenceCounterMasterForm.addLrSequenceNextForUpdate.style.display='block'; 
					document.SequenceCounterMasterForm.lrSequenceNextForUpdate.value = 1;
				}
				
				hideLayer();
			}, error: function(xhr, status, error) {
				showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
				hideLayer();
			}
		});
	}
}

function addLRSeqenceCounterManual() {
	let	minRange = document.getElementById('bookingSequenceMinManual') != null ? document.getElementById('bookingSequenceMinManual').value : 0;
	let	maxRange = document.getElementById('bookingSequenceMaxManual') != null ? document.getElementById('bookingSequenceMaxManual').value : 0;

	let jsonObject = new Object();

	jsonObject.sourceBranchId	= $('#searchBranch').val();
	jsonObject.minRange			= minRange;
	jsonObject.maxRange			= maxRange;
	jsonObject.isManual			= true;
			
	if(confirm('Are you sure you want to Insert Sequence ?')) {  
		showLayer();
		
		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/lrSequenceCounterWS/insertLRSequence.do?',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}
				
				hideLayer();
			}, error: function(xhr, status, error) {
				showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
				hideLayer();
			}
		});
	}
}

function branchValidation() {
	let regionId = $("#region").val(); 
	let subRegionId = $("#subRegion").val(); 
	let branchId = $("#searchBranch").val(); 
	
	if(regionId <=0){
		showMessage('error','Please Select Region !');
		toogleElement('error','block');
		changeError1('region','0','0');
		$("#region").focus(); 
		return false;
	}
	
	if(subRegionId <=0){
		showMessage('error','Please Select SubRegion !');
		toogleElement('error','block');
		changeError1('subRegion','0','0');
		$("#subRegion").focus(); 
		return false;
	}
	
	if(branchId <=0){
		showMessage('error','Please Select Branch !');
		toogleElement('error','block');
		changeError1('searchBranch','0','0');
		$("#searchBranch").focus(); 
		return false;
	}	
		
	return true;
}

function validateBillSelection() {
	let billSelectionElement	= document.getElementById("billSelection");
	
	if(billSelectionElement && Number(billSelectionElement.value) == 0) {
		showMessage('error','Select Bill Selection !');
		toogleElement('error','block');
		changeError1('billSelection','0','0');
		return false;
	}
	
	return true;
}

function validateGSTSelection() {
	let gstSelectionElement		= document.getElementById("gstSelection");
	
	if(gstSelectionElement && Number(gstSelectionElement.value) == -1) {
		showMessage('error','Select GST Selection !');
		toogleElement('error','block');
		changeError1('gstSelection','0','0');
		return false;
	}
	
	return true;
}

function displayMRSequence(jsonObject) {
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/mrSequenceCounterWS/getMRSequenceCounterToDisplay.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let nextVal = 0;
				
			let moneyReceiptTxnSequence = data.moneyReceiptTxnSequence; // access first object
				
			if (moneyReceiptTxnSequence != null && moneyReceiptTxnSequence != undefined)
				nextVal = moneyReceiptTxnSequence.nextVal;
				
			$('#mrSequenceNext').val(nextVal)
			$('#mrSequenceNextForUpdate').val(nextVal)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function addPendingLSPaymentSequence(Obj) {
	if(!formValidation(Obj))
		return false;

	let jsonObject		= new Object();

	let pickupLsSeqMin 		= $('#pendingLsPaymentSequenceMin').val();
	let pickupLsSeqMax		= $('#pendingLsPaymentSequenceMax').val();
	let pickupLsSeqNext		= $('#pendingLsPaymentSequenceNext').val();
	
	if (pickupLsSeqMin.trim() === "" || pickupLsSeqMin <= 0) {
		showMessage('error', 'Min Value Must Be Greater than 0');
		toogleElement('error', 'block');
		changeError1('pendingLsPaymentSequenceMin', '0', '0');
		$("#pendingLsPaymentSequenceMin").focus();
		return false;
	}

	if(pickupLsSeqMax.trim() === "" || pickupLsSeqMax <= 0) {
		showMessage('error','Max Value Must Be Greater than 0');
		toogleElement('error','block');
		changeError1('pendingLsPaymentSequenceMax','0','0');
		$("#pendingLsPaymentSequenceMax").focus(); 
		return false;
	}
	
	if (!validateRanges(pickupLsSeqMin, pickupLsSeqMax)) { return false; }
	
	let ans = confirm("Are you sure you want to add this Range ?");

	if (!ans) return;

	jsonObject.minRange 			= pickupLsSeqMin;
	jsonObject.maxRange 			= pickupLsSeqMax;
	jsonObject.nextValue 			= pickupLsSeqNext;
	jsonObject.sourceBranchId		= $('#searchBranch').val();
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/pendingLSPaymentSequenceCounterWS/insertPendingLSPaymentSequenceCounter.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				$('#pendingLsPaymentSequenceMin').val(0);
				$('#pendingLsPaymentSequenceMax').val(0);
				$('#pendingLsPaymentSequenceNext').val(0);
			}
			
			hideLayer();
		}
	});
}

function displayPendingLSPaymentSequence(jsonObject) {
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/pendingLSPaymentSequenceCounterWS/getSequenceCounterToDisplay.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let nextVal = 0;

			let pendingLsPaymentSequenceCounter = data.PendingLsPaymentSequenceCounter; // access first object
				
			if (pendingLsPaymentSequenceCounter != null && pendingLsPaymentSequenceCounter != undefined)
				nextVal = pendingLsPaymentSequenceCounter.nextVal;
				
			$('#pendingLsPaymentSequenceNext').val(nextVal)
			$('#pendingLsPaymentSequenceNextForUpdate').val(nextVal)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function addPendingLsPaymentSequenceNextForUpdatee(obj) {
	if(!formValidation(obj))
		return false;
	
	let ans = confirm("Are you sure you want to update next value ?");

	if (!ans) return;
	
	showLayer();

	let jsonObject		= new Object();
	
	jsonObject.nextValue		= $('#pendingLsPaymentSequenceNextForUpdate').val();
	jsonObject.sourceBranchId	= $('#searchBranch').val();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/pendingLSPaymentSequenceCounterWS/updatePendingLsPaymentNextSequence.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				$('#pendingLsPaymentSequenceNextForUpdate').val(jsonObject.nextValue);
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				resetValues();
			}
			
			hideLayer();
		}
	});
}

function displayDDMSequence(obj) {
	if(!branchValidation()) {
		$('#ddmBillSelection').val(0);
		return false;
	}
	
	let billSelectionElement	= document.getElementById("ddmBillSelection");
	let billSelection			= billSelectionElement ? billSelectionElement.value : 0;
		
	let jsonObject = new Object();

	jsonObject.sourceBranchId = $('#searchBranch').val();
	jsonObject.billSelectionId = billSelection;
	
	showLayer();
		
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/doorDeliveryMemoSequenceCounterWS/getDDMSequenceCounterForLogs.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let minRange = 0;
			let maxRange = 0;
			let nextVal = 0;
				
			if (data?.sequenceCounter && Object.keys(data).length !== 0) {
				let sequenceCounter = data.sequenceCounter;
				minRange	= sequenceCounter.doorDeliveryMemoSequenceCounterMinimumRange;
				maxRange	= sequenceCounter.doorDeliveryMemoSequenceCounterMaximumRange;
				nextVal		= sequenceCounter.doorDeliveryMemoSequenceCounterNextValue;
			}

			$('#doorDeliveryMemoSequenceMin').val(minRange)
			$('#doorDeliveryMemoSequenceMax').val(maxRange)
			$('#doorDeliveryMemoSequenceNext').val(nextVal + 1);
			$('#ddmSequenceNextForUpdate').val(nextVal + 1)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function addConsolidatedSequenceNextForUpdate(obj){
	if(!formValidation(obj))
		return false;

	let jsonObject		= new Object();

	let consolidatedBlhpvSeqNext = $('#consolidatedBlhpvSequenceNextForUpdate').val();
		
	let ans = confirm("Are you sure you want to add ?");

	if (!ans) return;

	jsonObject.nextValue 			= consolidatedBlhpvSeqNext;
	jsonObject.sourceBranchId		= $('#searchBranch').val();
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/blhpvSequenceCounterWS/addConsolidatedBLhpvSeqCounter.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			hideLayer();
		}
	});	
}

function displayConsolidateBLhpvSequence(jsonObject) {
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/master/blhpvSequenceCounterWS/getConsolidatedBLhpvSequenceDetails.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			
			let nextVal = 0;				
			let consolidatedBLHPVSequenceCounter = data.consolidatedBLHPVSequenceCounter; // access first object				
			
			if (consolidatedBLHPVSequenceCounter != null && consolidatedBLHPVSequenceCounter != undefined)
				nextVal = consolidatedBLHPVSequenceCounter.nextVal + 1;
				
			$('#consolidatedBlhpvSequenceNextForUpdate').val(nextVal);
			
			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function displayCreditorInvoiceSequence(obj) {
	if(!branchValidation()) {
		$('#creditorInvoiceBillSelection').val(0);
		return false;
	}
	
	let billSelectionElement	= document.getElementById("creditorInvoiceBillSelection");
	let billSelection			= billSelectionElement ? billSelectionElement.value : 0;
	let billDivisionElement		= document.getElementById("billDivisionSelection");
	let divisionId				= billDivisionElement ? billDivisionElement.value : 0;
	
	let jsonObject = new Object();

	jsonObject.sourceBranchId = $('#searchBranch').val();
	jsonObject.billSelectionId = billSelection;
	jsonObject.divisionId 		= divisionId;

	showLayer();
		
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/billSequenceCounterWS/getBillSequenceCounterForLogs.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let minRange = 0;
			let maxRange = 0;
			let nextVal = 0;
				
			if (data?.sequenceCounter && Object.keys(data).length !== 0) {
				let sequenceCounter = data.sequenceCounter;
				minRange	= sequenceCounter.minRange;
				maxRange	= sequenceCounter.maxRange;
				nextVal		= sequenceCounter.nextVal;
			}

			$('#billSequenceMin').val(minRange)
			$('#billSequenceMax').val(maxRange)
			$('#billSequenceNext').val(nextVal + 1);
			$('#billSequenceNextForUpdate').val(nextVal + 1)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}

function validateDivisionSelection() {
	let divisionSelectionElement	= document.getElementById("divisionSelection");
	
	if(divisionSelectionElement && Number(divisionSelectionElement.value) == 0) {
		showMessage('error','Select Division !');
		toogleElement('error','block');
		changeError1('divisionSelection','0','0');
		return false;
	}
	
	return true;
}

function validateDivisionSelectionLhpv() {
	let divisionSelectionElement	= document.getElementById("divisionSelectionLhpv");
	
	if(divisionSelectionElement && Number(divisionSelectionElement.value) == 0) {
		showMessage('error','Select Division !');
		toogleElement('error','block');
		changeError1('divisionSelectionLhpv','0','0');
		return false;
	}
	
	return true;
}

function displayLhpvSequence(obj) {
	if(!branchValidation()) {
		$('#divisionSelectionLhpv').val(0);
		return false;
	}
	
	var divisionId = 0;
		
	if ($('#divisionSelectionLhpv').length > 0)
		divisionId = $('#divisionSelectionLhpv').val();
		
	let jsonObject = new Object();

	jsonObject.sourceBranchId = $('#searchBranch').val();
	jsonObject.divisionId = divisionId;
	
	showLayer();
		
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/lhpvSequenceCounterWS/getLhpvSequenceCounterForLogs.do?',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			let minRange = 0;
			let maxRange = 0;
			let nextVal = 0;
				
			if (data?.lhpvSequenceCounter && Object.keys(data).length !== 0) {
				let sequenceCounter = data.lhpvSequenceCounter;
				minRange	= sequenceCounter.minRange;
				maxRange	= sequenceCounter.maxRange;
				nextVal		= sequenceCounter.nextVal;
			}

			$('#lhpvSequenceMin').val(minRange)
			$('#lhpvSequenceMax').val(maxRange)
			$('#lhpvSequenceNext').val(nextVal + 1);
			$('#lhpvSequenceNextForUpdate').val(nextVal + 1)

			hideLayer();
		}, error: function(xhr, status, error) {
			showMessage('error', iconForErrMsg + ' ' + (xhr.responseJSON?.errorDescription || error || 'Error fetching data'));
			hideLayer();
		}
	});
}