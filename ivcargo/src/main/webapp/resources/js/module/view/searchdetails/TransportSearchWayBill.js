function openWindowForView(id,number,type,branchId,subRegionId,searchBy) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&wayBillNumber='+number+'&TypeOfNumber='+type+'&BranchId='+branchId+'&SubRegionId='+subRegionId+'&searchBy='+searchBy);
}
function openWindowForMoneyReceiptView(id, type, branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + type + '&BranchId=' + branchId);
}
function openPrint(dispatchLedgerId) {
	newwindow=window.open('DoorDelivery.do?pageId=274&eventId=6&dispatchLedgerId='+dispatchLedgerId+'&isSearchModule='+true, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openWindowForViewFundTransferDetail(fundTransferId) {	
	childwin = window.open ('ViewFundTransferDetails.do?pageId=240&eventId=5&fundTransferId='+fundTransferId ,'newwindow', config='height=400,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openWindowForFundTransferPrint(fundTransferId) {	
	childwin = window.open('FundTransferPrint.do?pageId=340&eventId=10&modulename=fundTranferPrint&masterid='+fundTransferId+'&isReprint=true','newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showPodBillSignature(masterid, moduleIdentifier,accountGroupId) {
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + masterid + '&moduleId=' + moduleIdentifier+'&photoSignature=true&getSignaturePhoto=true&accountGroupId='+accountGroupId+'&NoencodeImage=true','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function cancelLS(isMathadiCreated, isManual, lhpvId, isCancelLSOfRawanaVoucher, isVoucherExpenseCreated, isLSCancelAfterTimeLimit, maxHoursForEditLS,tripSheetStatusId) {
	 if(tripSheetStatusId == TRIPSHEET_CLOSED) {
		showMessage('info','<i class="fa fa-info-circle"></i> You cannot cancel LS Because Tripsheet Is Closed !');
		return false;
	} else if(isVoucherExpenseCreated) {
		showMessage('info','<i class="fa fa-info-circle"></i> You cannot cancel LS if Hamali/Labour Voucher is Created !');
		return false;
	} else if(isMathadiCreated) {
		showMessage('info','<i class="fa fa-info-circle"></i> You cannot cancel LS if Mathadi is Created !');
		return false;
	} else if(isManual) {
		showMessage('info', manualLSCancelInfoMsg);
		return false;
	} else if(lhpvId > 0) {
		showMessage('info', lsCancelAfterLHPVCreationInfoMsg);
		return false;
	} else if(!isCancelLSOfRawanaVoucher) {
		showMessage('info', '<i class="fa fa-info-circle"></i> You cannot cancel LS if Rawana Voucher Created !');
		return false;
	}  else if(isLSCancelAfterTimeLimit) {
		showMessage('info', '<i class="fa fa-info-circle"></i> Cannot Cancel LS After ' + maxHoursForEditLS + ' hrs. Contact Head Office.!');
		return false;
	} else {
		ans = confirm(lsCancelAlertMsg);
		if(ans) {
			// go as flow goes on
		} else {
			return false;
		}
	}
}

function openEditLS(dispatchLedgerId, lsNo, tripStatusId) {
    if (tripStatusId == TRIPSHEET_CLOSED) {
        showMessage('info','<i class="fa fa-info-circle"></i> Trip Sheet is already CLOSED. Edit LS is not allowed !');
		return false;
    }

    window.open('EditLS.do?pageId=25&eventId=25&dispatchLedgerId=' + dispatchLedgerId + '&lsNo=' + lsNo,'', 'location=0,status=0,scrollbars=1,width=950,height=600,resizable=1' );
}

function cancelShortCreditSheet(){
	ans = confirm("Are you sure you want to cancel this Bill ?");
	if(ans) {
		document.listForm.pageId.value	= "286";
		document.listForm.eventId.value	= "9";
		document.listForm.action		= "ShortCreditLedgerCancellation.do";
		disableButtons();
		//Disable page
		showLayer();
		document.listForm.submit();
	} else {
		return false;
	};
}

function printShortCreditSummary(shortCreditCollLedgerId) {
	window.open('Dispatch.do?pageId=340&eventId=10&modulename=shortCreditCollLedgerSummaryPrint&shortCreditCollLedgerId='+shortCreditCollLedgerId, 'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}
function printWindowForMoneyReceipt(billId,moduleIdentifier,clearanceId,moneyReceiptNumber){
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+billId+"&moduleIdentifier="+moduleIdentifier+"&clearanceId="+clearanceId+'&moneyReceiptNumber='+moneyReceiptNumber,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no"); 
}
function deliveredToNameWiseSTBSSummaryPrint(shortCreditCollLedgerId) {
	window.open('Dispatch.do?pageId=340&eventId=10&modulename=deliveredToNameWiseSTBSSummaryPrint&shortCreditCollLedgerId='+shortCreditCollLedgerId, 'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}
function lhpvCancellationProcess(lhpvEditRemarkRequired, centralizedLhpvCancellation, pumpReceiptLHPVdetailsId, lhpvId, deliveryRunSheetLedgerId, isLHPVCancelAfterTimeLimit, maxHoursForEditLHPV) {
	if(pumpReceiptLHPVdetailsId > 0) {
		showMessage('info', 'To cancel LHPV, Cancel Pump receipt first !');
		return false;
	}
	
	if(isLHPVCancelAfterTimeLimit) {
		showMessage('info', '<i class="fa fa-info-circle"></i> Cannot Cancel LHPV After ' + maxHoursForEditLHPV + ' hrs. Contact Head Office.!');
		return false;
	}
	
	if(lhpvEditRemarkRequired) {
		var remarkValidate = validateRemark();
		
		if(!remarkValidate)
			return false;
	}
	
	if(centralizedLhpvCancellation && $('#cancelLhpvForExecutive').val() <= 0 
		&& !validateInput(1, 'cancelLhpvForExecutive', 'cancelLhpvForExecutive', 'executiveNameErr',  executiveNameErrMsg))
		return false;

	ans = confirm("Are you sure you want to cancel LHPV ?");

	if(ans) {
		var accountGroupId	= Number($('#accountGroupId').val());
		
		if(accountGroupId == 204) {
			cancelLHPV(lhpvId, deliveryRunSheetLedgerId);
		} else {
			document.listForm.pageId.value	= "19";
			document.listForm.eventId.value	= "8";
			document.listForm.action		= "LHPVCancellation.do";
			disableButtons();
			//Disable page
			showLayer();
			document.listForm.submit();
		}
	} else {
		return false;
	};
}

function cancelLHPV(lhpvId, deliveryRunSheetLedgerId) {
	var jsonObject			= new Object();

	jsonObject["lhpvId"]					= lhpvId;
	jsonObject["cancelLhpvExecutiveId"]		= $('#cancelLhpvForExecutive').val();
	jsonObject["deliveryRunSheetLedgerId"]	= deliveryRunSheetLedgerId;
		
	showLayer();
	$.ajax({
		url: WEB_SERVICE_URL+'/LHPVWS/cancelLHPV.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'success') {
					document.wayBillSearchForm.pageId.value			= "5";
					document.wayBillSearchForm.eventId.value		= "3";
					document.wayBillSearchForm.wayBillNumber.value	= $('#wayBillNumber').val();
					document.wayBillSearchForm.TypeOfNumber.value	= "3";
					document.wayBillSearchForm.action				= "LHPVCancellation.do";
					document.wayBillSearchForm.submit();
				}
			}
		}
	});
}

function blhpvCancellationProcess(blhpvId, bLHPVNumber, lhpvId) {
	ans = confirm("Are you sure you want to cancel BLHPV ?");
	
	if(!ans) {
		return false;
	}
	
	var creditPaymentDone;
	var ans;
	var bLHPVBranchId;
	var blhpvId;
	var foundMultipleEntries ;
	
	if(document.getElementById("creditPaymentDone")!=null){
		creditPaymentDone = document.getElementById("creditPaymentDone").value;	
		
		if(document.getElementById("foundMultipleEntries")!=null){
			foundMultipleEntries 	= document.getElementById("foundMultipleEntries").value;
			bLHPVBranchId			= document.getElementById("bLHPVBranchId").value;
			creditPaymentDone 		= creditPaymentDone;	
			my_window	= window.open('Module.do?pageId=340&eventId=2&modulename=cancelBLHPVCreditPayment&blhpvId='+blhpvId+'&bLHPVBranchId='+bLHPVBranchId, 'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
			ans	= false;
		}else{
			ans = true;
		}
	}else{
		ans = true;
	}
	if(ans){
		if(creditPaymentDone!=null && foundMultipleEntries ==null){
			ans = confirm("Credit Payment Already Done Still you want to cancel BLHPV ?\nPayment amount will be credited after cancellation");
		}
	}
	if(ans){
		var jsonObject			= new Object();

		jsonObject["blhpvId"]	= blhpvId;
		jsonObject["lhpvId"]	= lhpvId;
		
		showLayer();
		$.ajax({
			url: WEB_SERVICE_URL+'/blhpvWS/cancelBLHPV.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined){
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if(errorMessage.typeName == 'success')
						redirectAfterPaymentCancel(bLHPVNumber, 9);
				} else {
					hideLayer();
				}
				hideLayer();
			}
		}); 
	} else {
		return false;
	};
}
function closeWin() {
    myWindow.close();   // Closes the new window
}

function incomeCancellationProcess(incomeVoucherDetailsId, receiptVoucherNumber) {

	let tripHisabSettlementId	= Number($('#tripHisabSettlementId').val());
	
	if(tripHisabSettlementId > 0) {
		showMessage('info', '<i class="fa fa-info-circle"></i> You cannot cancel Income Voucher of Settled Trip Hisab !');
		return false;
	}
	
	let jsonObject			= new Object();

	jsonObject["wayBillIncomeVoucherDetailsId"]	= incomeVoucherDetailsId;
	jsonObject["receiptVoucherNumber"]			= receiptVoucherNumber;
	
	ans = confirm("Are you sure you want to cancel this Receipt Voucher ?");
	if (!ans) {
		return false;
	} 
	showLayer();
	$.ajax({
		url: WEB_SERVICE_URL+'/branchIncomeExpenseWS/receiptVoucherCancellationProcess.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'success')
					redirectAfterPaymentCancel(receiptVoucherNumber, 8);
			} else {
				hideLayer();
			}
			hideLayer();
		}
	});
}

function callToEditWayBills(id) {

	document.getElementById("wayBillId").value	= id;
	document.getElementById("id").value			= 'serach';
	document.listForm.pageId.value				= "3";
	document.listForm.eventId.value				= "8";
	disableButtons();
	showLayer();	
	document.listForm.submit();
}

function openPrintForSupplementaryBill(billId) {
	newwindow	= window.open('printWayBill.do?pageId=340&eventId=10&modulename=supplementrybillprint&masterid=' + billId, 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewBillSummary(billId ,billNo ,billStatusId,creditorName) {
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=billPaymentDetails&billId='+billId,'newwindow', config='height=400,width=1500, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}

function viewCancelledBillSummary(billId ,billNo ,billStatusId,creditorName) {
	window.open('viewBillSummary.do?pageId=216&eventId=4&billId='+billId+'&billNo='+billNo+'&billStatusId='+billStatusId+'&creditorName='+creditorName+'&hidePartialDetails=true','mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}

function disableButtons(){
	var lhpvCancelButton= document.getElementById("lhpvCancel");
	if(lhpvCancelButton != null){
		lhpvCancelButton.className = 'btn_print_disabled';
		lhpvCancelButton.disabled=true;
		lhpvCancelButton.style.display ='none';
	};
}

function printWindow(wayBillId){
	childwin = window.open('edit.do?pageId=3&eventId=10&wayBillId='+wayBillId , 'newwindow', config='height=0,width=0, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function podPrintWindow(podDispatchId){
	childwin = window.open('InterBranch.do?pageId=340&eventId=10&modulename=podDispatchPrint&masterid='+podDispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function partyAgentCommPrintWindow(partyAgentCommisionSummaryId){
	childwin = window.open('InterBranch.do?pageId=340&eventId=10&modulename=partyAgentCommisionPrint&masterid='+partyAgentCommisionSummaryId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function agentCommBillPrintWindow(agentCommisionBillingSummaryId){
	childwin = window.open('InterBranch.do?pageId=340&eventId=10&modulename=agentCommisionBillingPrint&masterid='+agentCommisionBillingSummaryId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editPODDestination(podDispatchId){
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editPODDestination&masterid='+podDispatchId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editBlhpv(blhpvId, lhpvId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&blhpvId='+blhpvId+'&lhpvId='+lhpvId+'&modulename=editBlhpv','newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editBlhpvDate(blhpvId, lhpvId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&blhpvId='+blhpvId+'&lhpvId='+lhpvId+'&modulename=editBlhpvDate','newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editBlhpvPaymentMode(blhpvId, lhpvId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&blhpvId='+blhpvId+'&lhpvId='+lhpvId+'&modulename=editBlhpvPaymentMode','newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function appendLrToLS(dispatchLedgerId, billSelectionId, tripStatusId) {
	 if (tripStatusId == TRIPSHEET_CLOSED) {
        showMessage('info','<i class="fa fa-info-circle"></i> Trip Sheet is already CLOSED. Edit LS is not allowed !');
		return false;
    }
	window.open('Dispatch.do?pageId=340&eventId=1&modulename=appendLrInLoadingSheet&dispatchLedgerId='+dispatchLedgerId+'&billSelectionId='+billSelectionId);
}

function appendLrToLSNew(dispatchLedgerId, lsSourceBranchId, billSelectionId, tripStatusId) {
	 if (tripStatusId == TRIPSHEET_CLOSED) {
        showMessage('info','<i class="fa fa-info-circle"></i> Trip Sheet is already CLOSED. Edit LS is not allowed !');
		return false;
    }
	
	window.open('Dispatch.do?pageId=340&eventId=1&modulename=appendLRinLSNew&dispatchLedgerId='+dispatchLedgerId+'&lsSourceBranchId='+lsSourceBranchId+'&billSelectionId='+billSelectionId);
}

function appendLrToPreLoadingSheet(preLoadingSheetLedgerId, preLoadingSheetBranchId, plsNumber){
	window.open('Dispatch.do?pageId=340&eventId=1&modulename=appendLrInPreLoadingSheet&preLoadingSheetLedgerId='+preLoadingSheetLedgerId+'&preLoadingSheetBranchId='+preLoadingSheetBranchId+'&plsNumber='+plsNumber);
}
function editLSDestination(dispatchLedgerId, lsStatus, isAnyLRReceived) {
	if(lsStatus == 2) {
		showMessage('error',"LS is Cancelled you can not change destination");
		return false;
	}  else if(lsStatus == 1 || isAnyLRReceived) {
		showMessage('error',"LS is already Received you can not change destination!");
		return false;
	}

	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=editLSDestination&dispatchLedgerId=' + dispatchLedgerId + '&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editLSVehicleType(dispatchLedgerId,VehicleTypeId){
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&dispatchLedgerId='+dispatchLedgerId+'&VehicleTypeId='+VehicleTypeId +'&modulename=editlsVehicleType'+'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getLsPrintError(lsNumber){
	showMessage('info', 'Lhpv Not Created For This LS '+lsNumber+' Create Lhpv First!');
}

function printPreloadingSheet(dispatchLedgerId) {
	window.open('/ivcargo/SearchWayBill.do?pageId=340&eventId=10&modulename=preunloadingsheet&masterid=' + dispatchLedgerId,  'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');

	//setTimeout(function(){childwin.print();},500);
}

function cancelFundTransfer(fundTransferNumber){
	var branchId	= document.getElementById('BranchId').value;
	childwin = window.open('FundTransferCancellation.do?pageId=340&eventId=1&modulename=fundCancellation&fundTransferNumber='+ fundTransferNumber + '&branchId='+ branchId + '&redirectFilter=13','newwindow', config='height=400,width=1500, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}

function showEditLPHRemark(lhpvId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHVPRemark&masterid='+lhpvId+'&masterid2=13','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showLPHVHistory(lhpvId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=lhpvhistory&masterid='+lhpvId+'&masterid2=13','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditLHPVDate(lhpvId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHPVDate&masterid='+lhpvId+'&masterid2=13','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditLHPVAdvanceVoucherDate(Id, lhpvId) {
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHPVAdvanceVoucherDate&masterid='+Id+'&lhpvId=' + lhpvId,'newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditLHPVAdvanceVoucherPaymentMode(Id) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHPVAdvanceVoucherPaymentMode&masterid='+Id+'&masterid2=13','newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editLHPVVehicleAgent(lhpvId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHPVVehicleAgent&masterid='+lhpvId+'&masterid2=13','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showEditLHVPKilometers(lhpvId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLHVPKilometers&lhpvId='+lhpvId+'&masterid2=13','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function cancelAgentBill(agentCommisionBillingSummaryId) {

	var jsonObject			= new Object();

	jsonObject["agentCommisionBillingSummaryId"]	= agentCommisionBillingSummaryId;
	jsonObject["agentCommisionBillingNumber"]		= document.getElementById('wayBillNumber').value;

	ans = confirm("Are you sure you want to cancel bill ?");
	if (!ans) {
		return false;
	} 
	showLayer();
	$.ajax({
		url: WEB_SERVICE_URL+'/agentCommissionBillingModuleWS/cancelAgentCommissionBill.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage('error', errorMessage.description);
			} else {
				hideLayer();
				document.location.reload(true);
			}
			hideLayer();
		}
	});
}

function expenseCancellationProcess(exepenseVoucherDetailsId, paymentVoucherNumber, filter) {
	let ans = confirm("Are you sure you want to cancel this Payment Voucher ?");
	
	if (!ans) {
		return false;
	}
	
	let url = '';
	let baseUrl	= WEB_SERVICE_URL+'/branchIncomeExpenseWS/';
	
	switch(filter) {
		case 1:
			url = baseUrl + 'paymentVoucherCancellationProcess.do';
			break;
		case 2:
			url = baseUrl + 'cancelMultipleLHPVAdvancePaymentVoucher.do';
			break;
		case 3:
			url	= baseUrl + 'cancelMultiplePickUpLorryHirePaymentVoucher.do';
			break;
		case 4:
			url	= baseUrl + 'cancelMultipleDDMLorryHirePaymentVoucher.do';
			break;
		default:
			break;
	}
	
	let jsonObject			= new Object();

	jsonObject["exepenseVoucherDetailsId"]	= exepenseVoucherDetailsId;
	
	showLayer();
	$.ajax({
		url	: url,
		type	: "POST",
		dataType: 'json',
		data	:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(() => {
					if(errorMessage.typeName == 'success')
						redirectAfterPaymentCancel(paymentVoucherNumber, 7);
				}, 1000);
			} else {
				hideLayer();
			}
			hideLayer();
		}
	}); 
}

function redirectAfterPaymentCancel(paymentVoucherNumber, typeOfNumber) {
	document.wayBillSearchForm.pageId.value			= "5";
	document.wayBillSearchForm.eventId.value		= "3";
	document.wayBillSearchForm.wayBillNumber.value	= paymentVoucherNumber;
	document.wayBillSearchForm.TypeOfNumber.value	= typeOfNumber;
	document.wayBillSearchForm.BranchId.value		= $('#BranchId').val();
	document.wayBillSearchForm.action				= "PaymentVoucherCancellation.do";
	document.wayBillSearchForm.submit();
}

var myNod	= nod();
myNod.configure({
	parentClass:'validation-message'
});
myNod.add({
	selector: '#ddmLorryHireAmountEle',
	validate: 'presence',
	errorMessage: 'Enter Proper Amount !'
});
myNod.add({
	selector: '#ddmLorryHireAmountEle',
	validate: 'integer',
	errorMessage: 'Enter Proper Amount !'
});
function enableButton() {
	if ($("#ddmLorryHireAmountEleHidden").val() == $( "#ddmLorryHireAmountEle" ).val()) {
	$('#saveBtn').prop('disabled', true);
	} else {
	$('#saveBtn').prop('disabled', false);
	}
}
function editDDMLorryHireAmount(ddmNumber,lorryHireAmount,dispatchLedgerId) {
	var modal = document.getElementById('editDDMLorryHireModal');
	var span = document.getElementsByClassName("close")[0];
	//alert();
	document.getElementById('ddmNumberEle').value = ddmNumber;
	document.getElementById('ddmLorryHireAmountEle').value = Number($('#lorryHireAmount'+dispatchLedgerId).html());
	document.getElementById('ddmLorryHireAmountEleHidden').value = Number($('#lorryHireAmount'+dispatchLedgerId).html());
	document.getElementById('dispatchLedgerIdHidden').value = Number(dispatchLedgerId);
	
	//ddmNumberEle
	//ddmLorryHireAmountEle
	
    modal.style.display = "block";
    $('#saveBtn').prop('disabled', true);
	span.onclick = function() {
	    modal.style.display = "none";
	}
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
}

function editDDMLorryHireAmountAfterSettlemet(ddmNumber,lorryHireAmount,dispatchLedgerId,isAllLRSettled) {
	
	if(isAllLRSettled){
		showMessage('error',"DDM is Setteled you can not edit Amount");
	return false;
	}
	var modal = document.getElementById('editDDMLorryHireModal');
	var span = document.getElementsByClassName("close")[0];
	//alert();
	document.getElementById('ddmNumberEle').value = Number(ddmNumber);
	document.getElementById('ddmLorryHireAmountEle').value = Number($('#lorryHireAmount'+dispatchLedgerId).html());
	document.getElementById('ddmLorryHireAmountEleHidden').value = Number($('#lorryHireAmount'+dispatchLedgerId).html());
	document.getElementById('dispatchLedgerIdHidden').value = Number(dispatchLedgerId);
	
	//ddmNumberEle
	//ddmLorryHireAmountEle
	
    modal.style.display = "block";
    $('#saveBtn').prop('disabled', true);
	span.onclick = function() {
	    modal.style.display = "none";
	}
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
}

function updateLorryHire() {
	
	dispatchLedgerId	= document.getElementById('dispatchLedgerIdHidden').value;
	myNod.performCheck();
	if(!myNod.areAll('valid')){
		return false;
	}
	
	var $remarkEl = $("#remarkEle");
	var remark = $remarkEl.length ? $remarkEl.val().trim() : "";

	if ($remarkEl.length && !remark) {
		showMessage("error", "Remark cannot be empty.");
		return false;
	}
	
	showLayer();
	var data = new Object();
	
	data.deliveryRunSheetLedgerId	= dispatchLedgerId;
	data.LorryHireAmount			= $( "#ddmLorryHireAmountEle" ).val();
	data.remark						= $( "#remarkEle" ).val();
	
	$.ajax({
	      type: "POST",
	      url: WEB_SERVICE_URL+"/deliveryRunsheetWS/updateDDMLorryHireAmount.do?",
	      data: data,
	      dataType: "json",
	      success: function(resultData){
	    	  hideLayer();
	    	  if (resultData.message.type == 2) {
	    	  	showMessage(resultData.typeName, resultData.message);
	    	  }
	    	  
	    	  if (resultData.message.type == 1) {	    		  
	    	  	showMessage(resultData.typeName, resultData.message);
	    	  	$( "#lorryHireAmount"+dispatchLedgerId ).html(data.LorryHireAmount);
	    	  	$( "#ddmLorryHireAmountEleHidden" ).html(data.LorryHireAmount);
	    	  	$( "#ddmLorryHireAmountEle" ).html(data.LorryHireAmount);
				$( "#lorryHireRemark" ).html(data.remark);
	    	  	let modal = document.getElementById('editDDMLorryHireModal');
	    	  	modal.style.display = "none";
	    	  }
	      },error: function(result){
	    	  hideLayer();
	    	  showMessage('error', 'Something Really Bad Happened !');
	      }
	});
}

function blhpvPaymentDetails(blhpvId) {
	newwindow=window.open('BlhpvPaymentDetails.do?pageId=340&eventId=2&modulename=blhpvPaymentDetails&blhpvId='+blhpvId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function stbsBillPaymentDetails(shortCreditCollLedgerId) {
	newwindow=window.open('stbsBillPaymentDetails.do?pageId=340&eventId=2&modulename=stbsBillPaymentDetails&shortCreditCollLedgerId='+shortCreditCollLedgerId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getBillCoveringLetterPrint(billCoveringLetterId) {
	newwindow=window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=billCoveringLetterPrint&billCoveringLetterId='+billCoveringLetterId+'&isSearchModule=true','newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editBillCoveringLetter(billCoveringLetterId) {
	newwindow=window.open('editBillCoveringLetter.do?pageId=340&eventId=2&modulename=editBillCoveringLetter&billCoveringLetterId='+billCoveringLetterId,'newwindow', config='left=180,height=610,width=1055, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function cancelBillCoveringLetter(billCoveringLetterId,billCoveringLetterNo,isAllowtoCancel) {
	if(isAllowtoCancel == 'false'){
		showMessage('info', 'Cancellation not allowed, as payment is taken for some of the Bills.');
		return false;
	}
	
	if (confirm('Are you sure you want to cancel Bill Cover Letter?')) {
		
		var jsonObject 								= new Object();
		jsonObject["billCoveringLetterId"] 			= billCoveringLetterId;
		
		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL+"/creditorInvoiceWS/cancelBillCoverLetter.do?",
			data: jsonObject,
			dataType: "json",
			success: function(response){
				if(response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					setTimeout(() => {
						window.close();
					},200);
					
					redirectAfterPaymentCancel(billCoveringLetterNo, 28);
				}
			}
		});
		
	} else{
		hideLayer();
	}
}

function printCrossingBillReceipt(crossingBillReceiptId, crossingAgentBillId) {
	newwindow=window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=crossingBillReceiptPrint&crossingBillReceiptId='+crossingBillReceiptId+'&crossingAgentBillId='+crossingAgentBillId, 'newwindow', config='height=810,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=yes');
}

function printMathadiNumberReceipt(mathadiNumberId,mathadiNumber) {
 newwindow=window.open('MathadiCalculation.do?pageId=340&eventId=10&modulename=mathadiCalculationPrint&mathadiNumberId='+mathadiNumberId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');

}

function printMultipleCrossingBillReceipt(crossingBillReceiptIds) {
	localStorage.setItem('crossingBillReceiptIds', crossingBillReceiptIds);
	newwindow = window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=crossingBillReceiptMultiplePrintData', 'newwindow', 'config=height=810,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=yes');
}

function validateRemark() {
	var remark = $('#cancelLhpvRemark').val();
	if(remark == "") {
		showMessage('error', 'Please Enter Remark');
		$('#cancelLhpvRemark').focus();
		return false;
	} else {
		return true;
	}
}

function showPhoto(masterid, moduleIdentifier) {
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + masterid + '&moduleId=' + moduleIdentifier,'newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showIDProofPhoto(masterid, moduleIdentifier) {
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + masterid + '&moduleId=' + moduleIdentifier + '&isIDProofPhotoDetails=true','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function setValueForParentWindow(flag){
	if(flag){
		$('#searchButton').trigger('click');
	}
}

function downloadToExcelLoadingSheet(dispatchLedgerId) {
	var data = new Object();
	
	data.dispatchLedgerId	= dispatchLedgerId;
	
	showLayer();
	
	$.ajax({
	      type: "POST",
	      url: WEB_SERVICE_URL+"/dispatchWs/getDispatchPrintExcel.do?",
	      data: data,
	      dataType: "json",
	      success: function(resultData){
	    	  hideLayer();
	    	  
			if(resultData.message != undefined) {
				var errorMessage = resultData.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				generateFileToDownload(resultData);
	        }
	      },error: function(result){
	    	  hideLayer();
	    	  showMessage('error', 'Something Really Bad Happened !');
	      }
	});
}

function agentCommisionBillPaymentDeatilsAgentBill(agentCommisionBillingSummaryId) {
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=agentCommisionBillPaymentDetails&agentCommisionBillingSummaryId='+agentCommisionBillingSummaryId,'newwindow', config='height=400,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function validateInputs() {
	
	var vehicleId	= Number($('#selectedVehicleNoId').val());
	
	if(vehicleId <= 0) {
		showMessage('error','Please Enter Valid Vehicle Number!');
		changeTextFieldColor('searchVehicle', '', '', 'red');
		return false;
	}
	return true;
}

function openPrintForTripHisab(tripHisabSettlementId) {
	newwindow=window.open('print.do?pageId=340&eventId=10&modulename=tripHisabSettlementPrint&tripHisabSettlementId='+tripHisabSettlementId+'&isSearchModule='+true, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getTripHisabSettlementDetails(id,number,searchType,branchId,vehicleId) {  
	
	var jsonObject	= new Object();

	jsonObject.number					= number;
	jsonObject.vehicleNumberMasterId	= vehicleId;
	
	$('#bottom-border-boxshadow').addClass('hide');
	
	$('#truckHisabVoucherDetailsDiv').empty();
	$('#fuelHisabVoucherDetailsDiv').empty();
	$('#pumpReceiptDetailsDiv').empty();
	$('#onAccountDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/tripHisabSettlementWS/getTripHisabSettlementDetailsByNumber.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}


			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#tripHisabSettlementDetailsDiv").load("/ivcargo/html/search/tripHisabSettlement.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
			if(response.tripHisabSettlementList != undefined) {
				
					$('#bottom-border-boxshadow').addClass('hide');
					$('#middle-border-boxshadow').removeClass('hide');

					let tripHisabSettlementList	= response.tripHisabSettlementList;

					let columnArray		= new Array();

					for (const element of tripHisabSettlementList) {
						var obj		= element;

						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.tripHisabSettlementNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.settlementDateTimeStr + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.vehicleNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.settledBy + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.driverName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.finalSettlementAmount + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.totalRunningKM + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.endKMReading + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.remark + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + "<a href='javascript:void(0);' class='btn btn-primary' onclick='openPrintForTripHisab(" + obj.tripHisabSettlementId  + ")'>Print</a>" +  "</td>");

						$('#tripHisabSettlementDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}
			});
		}
	});
}


function getTruckHisabVoucherDetails(id,number,searchType,branchId,vehicleId) {
	
	var jsonObject	= new Object();
	
	jsonObject.truckHisabVoucherId		= id;
	jsonObject.truckHisabNumber			= number;
	jsonObject.vehicleNumberMasterId	= vehicleId;
	
	$('#bottom-border-boxshadow').addClass('hide');
	
	$('#tripHisabSettlementDetailsDiv').empty();
	$('#fuelHisabVoucherDetailsDiv').empty();
	$('#pumpReceiptDetailsDiv').empty();
	$('#onAccountDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/truckHisabVoucherWS/getTruckHisabVoucherDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}


			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#truckHisabVoucherDetailsDiv").load("/ivcargo/html/search/truckHisabVoucher.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
			if(response.truckHisabVoucherList != undefined) {
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');
					var truckHisabVoucherList		= response.truckHisabVoucherList;
					var blank						= '';

					var columnArray		= new Array();

					for (var i = 0; i < truckHisabVoucherList.length; i++) {
						var obj		= truckHisabVoucherList[i];

						if(obj.status == TRUCK_HISAB_VOUCHER_SETTLED_ID) {
							columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Print' class='button button-3d button-rounded button-tiny button-icon-txt-small button-primary' onclick='getDataforPrint("+obj.truckHisabVoucherId+", "+obj.vehicleId+");'/>" + obj.truckHisabNumber + "</td>");
						} else {
							columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.truckHisabNumber + "</td>");
						}

						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.createDateTimeString + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.vehicleNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.driverName + "</td>");
						
						if(obj.lhpvNumber == null) {
							columnArray.push("<td class='datatd' style='text-align: left;'>--</td>");
						} else {
							columnArray.push("<td class='datatd' style='text-align: left;'><a href=' ' onclick='openWindowForView("+obj.lhpvId+","+obj.lhpvNumber+","+SEARCH_TYPE_ID_LHPV+",0,0,"+blank+")'/a> " + obj.lhpvNumber + "</td>");
						}
						
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.statusString + "</td>");

						$('#truckHisabVoucherDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}
			});
		}
	});
}

function showEditFuelPumpName(Id) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editFuelPumpName&masterid='+Id+'&masterid2=13','newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getPumpReceiptDetails(id,number,searchType,branchId,vehicleId) {
	
	var jsonObject	= new Object();
	
	jsonObject.pumpReceiptId			= id;
	jsonObject.pumpReceiptNumber		= number;
	jsonObject.branchId					= branchId;
	
	$('#bottom-border-boxshadow').addClass('hide');
	
	$('#tripHisabSettlementDetailsDiv').empty();
	$('#truckHisabVoucherDetailsDiv').empty();
	$('#fuelHisabVoucherDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/pumpReceiptWS/getPumpReceiptDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#pumpReceiptDetailsDiv").load("/ivcargo/html/search/pumpReceipt.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				if(response.pumpReceiptList != undefined) {
					$('#bottom-border-boxshadow').addClass('hide');
					$('#middle-border-boxshadow').removeClass('hide');

					var pumpReceiptList				= response.pumpReceiptList;
					var executive					= response.executive;
					var cancelPumpReceipt			= response.cancelPumpReceipt;
					var centralizedCancellation		= response.centralizedCancellation;
					var isAllowEditPumpName			= response.isAllowEditPumpName;


					var columnArray		= new Array();

					for (var i = 0; i < pumpReceiptList.length; i++) {
						var obj		= pumpReceiptList[i];
						if(obj.status)
							columnArray.push("<td class='datatd' style='text-align: left;'>"+ obj.pumpReceiptNumber + "</td>");
						else
							columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Print' class='button button-3d button-rounded button-tiny button-icon-txt-small button-primary' onclick='getPumpReceiptDataforPrint("+obj.pumpReceiptDetailsId+","+obj.pumpReceiptId+");'/>" + obj.pumpReceiptNumber + "</td>");
						
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.createDateTimeString + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.vehicleNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + Math.round(obj.fuelToFillUp) + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.fuelUnitRate + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + Math.round(obj.fuelTotalRate) + "</td>");
						
						if(obj.status && obj.cancellationRemark != null){
							$('#cancelRemark').show();
							columnArray.push("<td class='datatd' style='word-break: break-all;white-space: normal;width: 379px;'>" + obj.cancellationRemark + "</td>");
						} else
							$('#cancelRemark').hide();
							
						if(!obj.status && isAllowEditPumpName){
							$('#editFuelPump').show();
							//columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Edit' style='width:120px;'class='btn btn-primary' onclick='showEditFuelPumpName("+obj.pumpReceiptId+");'/></td>");
							columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Edit Pump Name' style='width:120px;'class='btn btn-primary'  onclick='showEditFuelPumpName("+obj.pumpReceiptId+");'/></td>");
						}else
							$('#editFuelPump').hide();
							
							
						if(!obj.status && centralizedCancellation && cancelPumpReceipt){
							$('#cancel').show();
							columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Cancel' style='width:120px;'class='btn btn-primary'  onclick='cancelPumpReceipt("+obj.pumpReceiptDetailsId+","+obj.pumpReceiptId+","+obj.branachId+","+obj.executiveId+","+obj.totalFuel+","+obj.fuelToFillUp+");'/></td>");
						}else if(!obj.status && (obj.branachId == executive.branchId && cancelPumpReceipt)){
							$('#cancel').show();
							columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Cancel' style='width:120px;'class='btn btn-primary'  onclick='cancelPumpReceipt("+obj.pumpReceiptDetailsId+","+obj.pumpReceiptId+","+obj.branachId+","+obj.executiveId+","+obj.totalFuel+","+obj.fuelToFillUp+");'/></td>");
						}else{
							$('#cancel').hide();
						}

						$('#pumpReceiptDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
					}
				}
			});
		}
	});
}

function getFuelHisabVoucherDetails(id,number,searchType,branchId,vehicleId) {
	
	var jsonObject	= new Object();
	
	jsonObject.fuelHisabVoucherNumber	= number;
	jsonObject.vehicleNumberMasterId	= vehicleId;
	
	$('#bottom-border-boxshadow').addClass('hide');
	
	$('#pumpReceiptDetailsDiv').empty();
	$('#tripHisabSettlementDetailsDiv').empty();
	$('#truckHisabVoucherDetailsDiv').empty();
	$('#onAccountDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/fuelHisabSettlementWS/getFuelHisabVoucherDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}


			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#fuelHisabVoucherDetailsDiv").load("/ivcargo/html/search/fuelHisabVoucher.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
			if(response.fuelHisabVoucherList != undefined) {
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');

					var fuelHisabVoucherList		= response.fuelHisabVoucherList;

					var columnArray		= new Array();

					for (var i = 0; i < fuelHisabVoucherList.length; i++) {
						var obj		= fuelHisabVoucherList[i];

						columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Print' class='button button-3d button-rounded button-tiny button-icon-txt-small button-primary' onclick='getFuelHisabVoucherPrint("+obj.fuelHisabVoucherId+");'/>" + obj.fuelHisabVoucherNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.creationDateTimeString + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.vehicleNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.voucherKilometer + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.fuelBalance + "</td>");
						
						$('#fuelHisabVoucherDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}
			});
		}
	});
}

function getLoadingHamaliDetails(id,number,searchType,branchId) {
	
	var jsonObject	= new Object();
	
	jsonObject.loadingHamaliNumber	= number;
	jsonObject.branchId				= branchId;
	
	$('#middle-border-boxshadow').addClass('hide');
	$('#pumpReceiptDetailsDiv').empty();
	$('#tripHisabSettlementDetailsDiv').empty();
	$('#loadingHamaliDetailsDiv').empty();
	$('#unLoadingHamaliDetailsDiv').empty();
	$('#onAccountDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/ConfigLoadingAndUnLoadingHamaliDetailsWS/getLoadingHamaliDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#loadingHamaliDetailsDiv").load("/ivcargo/html/search/loadingHamali.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
			if(response.loadingHmaliList != undefined) {
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');

					var loadingHmaliList		= response.loadingHmaliList;
					var columnArray		= new Array();
					
					for (var i = 0; i < loadingHmaliList.length; i++) {
						var obj		= loadingHmaliList[i];

						columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Print' class='button button-3d button-rounded button-tiny button-icon-txt-small button-primary' onclick='loadingHamaliPrintData("+obj.loadingHamaliLedgerId+");'/>&nbsp;" + obj.loadingHamaliNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.loadingHamaliDate + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.executiveName + "</td>");
						
						$('#loadingHamaliDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
					}
				}
			});
		}
	});
}
function getUnLoadingHamaliDetails(id,number,searchType,branchId) {
	
	var jsonObject	= new Object();
	
	jsonObject.unLoadingHamaliNumber = number;
	jsonObject.branchId				 = branchId;
	
	$('#middle-border-boxshadow').addClass('hide');
	$('#pumpReceiptDetailsDiv').empty();
	$('#tripHisabSettlementDetailsDiv').empty();
	$('#loadingHamaliDetailsDiv').empty();
	$('#unLoadingHamaliDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/ConfigLoadingAndUnLoadingHamaliDetailsWS/getUnLoadingHamaliDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {

			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#unLoadingHamaliDetailsDiv").load("/ivcargo/html/search/unLoadingHamali.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
			if(response.unLoadingHmaliList != undefined) {
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');

					var unLoadingHmaliList		= response.unLoadingHmaliList;
					var columnArray		= new Array();
					
					for (var i = 0; i < unLoadingHmaliList.length; i++) {
						var obj		= unLoadingHmaliList[i];

						columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Print' class='button button-3d button-rounded button-tiny button-icon-txt-small button-primary' onclick='unLoadingHamaliPrintData("+obj.unLoadingHamaliLedgerId+");'/>&nbsp;" + obj.unLoadingHamaliNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.unLoadingHamaliDate + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: left;'>" + obj.executiveName + "</td>");
						
						$('#unLoadingHamaliDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
					}
				}
			});
		}
	});
}
		
function stbsEditParty(shortCreditCollLedgerId) {
	newwindow=window.open('stbsEditParty.do?pageId=340&eventId=2&modulename=stbsEditParty&shortCreditCollLedgerId='+shortCreditCollLedgerId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function openEditLHPVAmount(lhpvId) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=editLhpvAmount&masterid=' + lhpvId,'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function openEditLHPVPanNumber(lhpvId) {
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLhpvPan&masterid='+lhpvId+'&masterid2=13','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showLHPVAmount(lhpvId) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=editLhpvAmount&masterid=' + lhpvId + '&isShowCharges=true','newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editLhpvOtherData(lhpvId) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=editLhpvOtherData&masterid=' + lhpvId,'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function loadingHamaliPrintData(loadingHamaliLedgerId) {
	childwin = window.open('VehicleConfigHamaliPrint.do?pageId=262&eventId=2&loadingHamaliLedgerId=' + loadingHamaliLedgerId ,'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function unLoadingHamaliPrintData(unLoadingHamaliLedgerId) {
	childwin = window.open('VehicleConfigHamaliPrint.do?pageId=262&eventId=3&unLoadingHamaliLedgerId=' + unLoadingHamaliLedgerId ,'newwindow', config='height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openEditManualLS(dispatchLedgerId,lsNumber,lsDate) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=editManualLSNumber&dispatchLedgerId='+dispatchLedgerId+'&lsNumber='+lsNumber+'&lsDate='+lsDate, 'newwindow', config='height=500,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openEditManualLHPV(lhpvId,lhpvNumber,lhpvDate) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=editManualLHPVNo&lhpvId='+lhpvId+'&lhpvNumber='+lhpvNumber+'&lhpvDate='+lhpvDate , 'newwindow', config='height=500,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getOnAccountDetails(id,number,searchType) {
	var jsonObject	= new Object();

	jsonObject.id					= id;
	jsonObject.number				= number;
	
	$('#bottom-border-boxshadow').addClass('hide');
	
	$('#truckHisabVoucherDetailsDiv').empty();
	$('#fuelHisabVoucherDetailsDiv').empty();
	$('#pumpReceiptDetailsDiv').empty();
	$('#onAccountDetailsDiv').empty();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/onAccountWS/getOnAccountDetailsByNumber.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {
			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#onAccountDetailsDiv").load("/ivcargo/html/search/onAccount.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				if(response.onAccountDetailsList != undefined) {
					$('#bottom-border-boxshadow').addClass('hide');
					$('#middle-border-boxshadow').removeClass('hide');

					var onAccountDetailsList	= response.onAccountDetailsList;
					var allowOnAccountCancel	= response.allowOnAccountCancel;

					var columnArray		= new Array();
					
					if(allowOnAccountCancel)
						$('#onAccountCan').removeClass('hide');
					
					for (var i = 0; i < onAccountDetailsList.length; i++) {
						var obj		= onAccountDetailsList[i];
						
						columnArray.push("<tr>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.onAccountNumber + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.creationDateTimestr + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.branchName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.executivName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.partyName + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" + obj.totalAmount + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center;'>" +
								"<table id='paymentTable' style='border: 1px solid;width:100%;'>" +
									"<tr>" +
										"<td class='titletd'>Payment Type</td>" +
										"<td class='titletd'>Cheque Date</td>" +
										"<td class='titletd'>Cheque No</td>" +
										"<td class='titletd'>Bank Name</td>" +
									"</tr>" +
									"<tr>" +
										"<td class='datatd'>"+obj.paymentTypeString+"</td>" +
										"<td class='datatd'>"+obj.chequeDateStr+"</td>" +
										"<td class='datatd'>"+obj.chequeNumber+"</td>" +
										"<td class='datatd'>"+obj.bankName+"</td>" +
									"</tr>" +
									"</table></td>");
						if(allowOnAccountCancel) {
							if(obj.cancel)
								columnArray.push("<td class='datatd' style='text-align: center;'>Cancelled</td>");
							else
								columnArray.push("<td class='datatd' style='text-align: left;'><input type='button' value='Cancel' class='btn btn-danger' onclick='cancelOnAccountDetails("+obj.onAccountId+", "+obj.onAccountNumber+");'/></td>");
						}
						
						columnArray.push("</tr>");
					}
					$('#onAccountDetailsTable').append('<tr>' + columnArray.join(' ') + '</tr>');
				}
			});
		}
	});
}

function insertDataOnUnblockLhpv(lhpvId,accountGroupId,branchId,executiveId,creationDateTime) { 
	$('#popUpForUnblockLhpv').bPopup({
	},function(){
		var _thisMod = this;
		$(this).html("<div class='confirm' style='height:170px;width:450px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
				+"<b style='font-size:18px; text-align:center; color:DodgerBlue;'>Remark</b><br/><br/>"		
				+ "<textarea type='text' id='remark' name='remark' size='65' maxlength='100' style='height: 90px; width: 414px;'></textarea><br/><br/>"
				+"<button type='button' id='Submit' class = 'btn btn-success' style='font-size: 15px;font-weight: bold;background-color: green;color: #fff;'>Submit</button>"
				+"<button type='button' id='Cancel' class = 'btn btn-danger' style='font-size: 15px;font-weight: bold;background-color: red;color: #fff;'>Cancel</button></div>")


		$("#Submit").click(function() {
			if($('#remark').val() != "" && $('#remark').val() != undefined){
				var remark = $('#remark').val();
				var jsonObject 								= new Object();
				jsonObject["lhpvId"] 						= lhpvId;
				jsonObject["accountGroupId"] 				= accountGroupId;
				jsonObject["branchId"] 						= branchId;
				jsonObject["executiveId"] 					= executiveId;
				jsonObject["remark"] 						= remark;
				jsonObject["creationDateTime"] 				= creationDateTime;

				$.ajax({
					type: "POST",
					url: WEB_SERVICE_URL+"/LHPVWS/insertUnblockLhpvDetails.do?",
					data: jsonObject,
					dataType: "json",
					success: function(response){

						if(response.message != undefined) {
							var errorMessage = response.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
							$("#unblockLhpv").css("display", "none");
						}
					}
				});
			}
			_thisMod.close();
		});

		$("#Cancel").click(function() {
			_thisMod.close();
		});
	});
}

function updateWayBillDeliveryPaymentType(crId){
	childwin = window.open ('updateWayBillDeliveryPaymentType.do?pageId=340&eventId=2&modulename=updateWayBillDeliveryPaymentType&masterid=' + crId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function cancelPumpReceipt(pumpReceiptDetailsId, pumpReceiptId, branachId, executiveId, totalFuel, fuelToFillUp) { 
	$('#cancelPumpReceipt').bPopup({
	},function(){
		var _thisMod = this;
		$(this).html("<div class='confirm' style='height:170px;width:350px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
				+"<b style='font-size:18px; text-align:center; color:DodgerBlue;'>Remark</b><br/><br/>"		
				+ "<input type='text' id='remark' name='remark' size='50' maxlength='512'><br/><br/>"
				+"<input type='button' id='Submit' value='Submit' class = 'btn btn-success'/>"
				+"<input type='button' id='Cancel' value='Cancel' class = 'btn btn-success'/></div>")
				$("#remark").focus();
				
				$("#Submit").click(function() {
					
					if($('#remark').val() == "" || $('#remark').val() == undefined){
						showMessage('error', "Please Enter Remark");
						return true;
					}
					if($('#remark').val() != "" && $('#remark').val() != undefined){
						var jsonObject 								= new Object();
						jsonObject["pumpReceiptDetailsId"] 			= pumpReceiptDetailsId;
						jsonObject["pumpReceiptId"] 				= pumpReceiptId;
						jsonObject["branachId"] 					= branachId;
						jsonObject["executId"] 						= executiveId;
						jsonObject["remark"] 						= $('#remark').val();
						jsonObject["totalFuel"] 					= totalFuel;
						jsonObject["fuelToFillUp"] 					= fuelToFillUp;

						$.ajax({
							type: "POST",
							url: WEB_SERVICE_URL+"/pumpReceiptWS/cancelPumpReceipt.do?",
							data: jsonObject,
							dataType: "json",
							success: function(response){
								if(response.message != undefined) {
									var errorMessage = response.message;
									showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
									$('#searchButton').prop('type','button');
									$('#TypeOfNumber').val(response.typeOfNumber);
									$("#searchButton").trigger("click");
								}
							}
						});
					}
					_thisMod.close();
				});

		$("#Cancel").click(function() {
			_thisMod.close();
		});
	});
}

function editLSRemark(dispatchLedgerId){
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&dispatchLedgerId='+dispatchLedgerId+'&modulename=editlsRemark'+'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
      
function editCommissionAndExpenseOfLS(dispatchLedgerId){
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&dispatchLedgerId='+dispatchLedgerId+'&modulename=editCommissionAndExpenseOfLS'+'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updatePickupLSVehicleNumber(doorPickupLedgerId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=updatePickupLSVehicleNumber&masterid=' + doorPickupLedgerId +'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updatePickupLSLorryHireAmount(doorPickupLedgerId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=updatePickupLSLorryHireAmount&masterid=' + doorPickupLedgerId +'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updatePickupLSSourceDestination(doorPickupLedgerId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=updatePickupLSSourceDestination&masterid=' + doorPickupLedgerId +'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function printWindowForMultipleMoneyReceipt(billIds,moduleIdentifier,clearanceIds,branchId,mrPrintFromInvoiceSearch){
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&billIds="+billIds+"&moduleIdentifier="+moduleIdentifier+"&billClearanceIds="+clearanceIds+"&differentMrPrintForParitalPayment=true&billClearanceBranchId="+branchId+"&mrPrintFromInvoiceSearch="+mrPrintFromInvoiceSearch+"",'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function updatePickupLSDate(doorPickupLedgerId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=updatePickupLSDate&masterid=' + doorPickupLedgerId +'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editMRRemark(moneyReceiptId, moduleIdentifier){
	childwin = window.open('editMRRemark.do?pageId=340&eventId=2&moneyReceiptId='+moneyReceiptId+"&moduleIdentifier="+moduleIdentifier+'&modulename=editMrRemark'+'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function consolidatedBlhpvCancellationProcess(consolidatedBlhpvId, consolidatedBlhpvNumber) {
	ans = confirm('Are you sure you want to cancel consolidated BLHPV number : '+consolidatedBlhpvNumber+'?');
	
	if(!ans){
		return false;
	}
	
	if(ans){
		var jsonObject = new Object();
	
		jsonObject["consolidatedBlhpvId"] = consolidatedBlhpvId;
		jsonObject["consolidatedBlhpvNumber"] = consolidatedBlhpvNumber;
		
		showLayer();
		$.ajax({
			url: WEB_SERVICE_URL+'/consolidatedBlhpvWS/cancelConsolidatedBLHPV.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined){
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if(errorMessage.typeName == 'success')
						redirectAfterPaymentCancel(consolidatedBlhpvNumber, 26);
				}
			}
		}); 
	} else {
		hideLayer();
		return false;
	};
	hideLayer();
}

function editLSDate(dispatchLedgerId){
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&dispatchLedgerId='+dispatchLedgerId+'&modulename=editlsDate'+'&redirectTo=13','newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateLSVehicleAgentName(dispatchLedgerId) {
	childwin = window.open('Dispatch.do?pageId=340&eventId=2&modulename=updateLSVehicleAgentName&masterid=' + dispatchLedgerId + '&redirectTo=13', 'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function openWindowForNewSearch(id, number, type, branchId, vehicleNumberMasterId) {
	window.open('modules.do?pageId=340&eventId=1&modulename=searchDetails&masterid='+id+'&masterid2='+number+'&TypeOfNumber='+type+'&branchId='+branchId+'&vehicleNumberMasterId='+vehicleNumberMasterId);
}
function cancelOnAccountDetails(id,number){
	ans = confirm('Are you sure you want to cancel');
	
	if(!ans)
		return false;
	
	if(ans){
		var jsonObject = new Object();
	
		jsonObject["onAccountId"] = id;
		jsonObject["onAccountNumber"] = number;
		
		showLayer();
		$.ajax({
			url: WEB_SERVICE_URL+'/onAccountWS/cancelOnAccountPartyDetails.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined){
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					
					if(errorMessage.type == MESSAGE_TYPE_SUCCESS) {
						setTimeout(() => {
							getOnAccountDetails(id, number, 33);
						}, 1000);
					}
				}
			}
		}); 
	} else {
		hideLayer();
	}
}

function viewAllEwayBillOnDispatch(dispatchLedgerId) {
	window.open('modules.do?pageId=340&eventId=1&modulename=viewAllEwayBillOnDispatch&masterid=' + dispatchLedgerId);
}

function pickupLSSettlementPaymentStatusDetail(doorPickupLedgerId) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=doorPickupLsPaymentDetails&masterid=' + doorPickupLedgerId + '&incExpMappingId=11', 'newwindow', config = 'height=500,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}

function viewDDMUpdateHistory(deliveryRunSheetLedgerId) {
	childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=viewDDMUpdateHistory&deliveryRunSheetLedgerId=' + deliveryRunSheetLedgerId, 'newwindow', config='width=1055,height=500, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function downloadToCSVCreditInvoice(billId) {
	var data = new Object();
	
	data.billId	= billId;
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL+'/billPrintWS/getInvoicePrintCSV.do?',
		data: data,
		dataType: "json",
		success: function(resultData){
			hideLayer();
			if(resultData.message != undefined) {
				var errorMessage = resultData.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				generateFileToDownload(resultData);
			}
		},error: function(result){
			hideLayer();
			showMessage('error', 'Something Really Bad Happened !');
		}
	});
}


function showLSHistory(dispatchLedgerId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editLSHistory&masterid='+dispatchLedgerId,'newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function printTur(receivedLedgerId, dispatchLedgerId, isReprint,isShortExcessDetails) {
	newwindow=window.open('print.do?pageId=221&eventId=5&receivedLedgerId=' + receivedLedgerId + '&dispatchLedgerId=' + dispatchLedgerId + '&isReprint=' + isReprint+ '&isShortExcessDetails=' + isShortExcessDetails, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function agentBranchHisabPrint(agentBranchHisabLedgerId) {
	newwindow=window.open('print.do?pageId=340&eventId=10&modulename=agentBranchHisabPrint&masterid=' + agentBranchHisabLedgerId + '&isReprint=true', 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function editCrossingAgentOnDispatch(dispatchLedgerId) {
	window.open('modules.do?pageId=340&eventId=1&modulename=editcrossinghire&masterid=' + dispatchLedgerId);
}