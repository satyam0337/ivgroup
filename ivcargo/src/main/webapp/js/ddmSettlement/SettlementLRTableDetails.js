var activeDeliveryChargesArr;
var totAmt			= 0.00;
var WAYBILL_STATUS_RECEIVED  = 7;
var WAYBILL_STATUS_DELIVERED = 9;
var WAYBILL_STATUS_DUEUNDELIVERED = 11; 
var isReadOnly = false;
let checkOtp = true;
let otpIsValid = false;

$(document).on('mousedown', 'input, select, textarea, button', function (e) {
	const active = document.activeElement;

	if (!otpIsValid && $(active).hasClass('is-invalid')) {
		e.preventDefault(); 
		setTimeout(() => {
			active.focus();
		}, 0);
	}
});


function generateLRWiseSettlementTableSimple(activeDeliveryCharges) {
	if(ddmSettlementConfig.subRegionIdsToShowSTBSCreationCheckBox != '0')
		headOfficeSubregionArr 				 	    = (ddmSettlementConfig.subRegionIdsToShowSTBSCreationCheckBox).split(",");
	
	parentTable = $('#lrDetailsTableNew');
	
	tableRow 	= createRow('lrWiseSettlementTable', '');
	appendHeaderRow(parentTable.attr('id'), tableRow);

	allCol 				= createColumn(tableRow, 'allCol', '', 'left', '', '');
	lrNumberColumn		= createColumn(tableRow, 'lrNoCol', '', 'left', '', '');
	
	if(ddmSettlementConfig.isCrNumberColumnDisplay)
		crNumberColumn		= createColumn(tableRow, 'crNoCol', '', 'left', '', '');
	
	if(ddmSettlementConfig.allowBackDateForSettlement)
		dateColumn			= createColumn(tableRow, 'dateCol', '', 'left', '', 2);

	if(ddmSettlementConfig.allowBackTimeForSettlement)	
		timeColumn			= createColumn(tableRow, 'timeCol', '', 'left', '', 2);
	
	fromColumn 			= createColumn(tableRow, 'fromCol', '', 'left', '', '');
	toColumn			= createColumn(tableRow, 'toCol', '', 'left', '', '');
	cneeNameColumn 		= createColumn(tableRow, 'cneeNameCol', '', 'left', '', '');
	cneeNoColumn		= createColumn(tableRow, 'cneeNoCol', '', 'left', '', '');
	lrTypeColumn		= createColumn(tableRow, 'lrTypeCol', '', 'left', '', '');
	bkgTotalColumn	 	= createColumn(tableRow, 'bookingTotalCol', '', 'left', 'width:80px', '');
	amountColumn		= createColumn(tableRow, 'amtCol', '', 'left', '', '');
	articleColumn		= createColumn(tableRow, 'artCol', '', 'left', '', '');
	actBkgWgtColumn 	= createColumn(tableRow, 'actBkgWgtCol', '', 'left', '', '');
	rcvDlyAsColumn 		= createColumn(tableRow, 'rcvDlyAsCol', '', 'left', '', '');
	ctoDetainStatusCol	= createColumn(tableRow, 'ctoDetainStatusCol', '', 'left', 'display:none', '');
	paidLoadingColumn	= createColumn(tableRow, 'paidLoadingTotalCol', '', 'left', 'width:80px', '');
	

	if(ddmSettlementConfig.isShowStbsColumn)
		stbsColumn 		= createColumn(tableRow, 'StbsCol', '', 'left', '', '');
	
	if(isPanNumberRequired)
		panNumberColumn 	= createColumn(tableRow, 'panNumberCol', '', 'center', '', '');

	dlyDetailsColumn	= createColumn(tableRow, 'delDetailsCol', '', 'left', 'width:250px;', '');
	
	if(ddmSettlementConfig.allowAddLrExpenseButton)
		addLrExpenseButtonColumn		= createColumn(tableRow, 'addLrExpenseButtonColumn', '', 'left', '', '');

	if(ddmSettlementConfig.showReceiverToName)
		receiverToNamecolumn = createColumn(tableRow,'receiverToNamecolumn','','left','width:250px;','')

	if(podConfiguration.AllowPodReceiveOption) {
		if(!podConfiguration.setDefaultPODStatusNo) {
			podStatusColumn		= createColumn(tableRow, 'podStatusCol', '', 'left', '', '');
			
			if(podConfiguration.showPODDocuments)
				podDocTypeColumn		= createColumn(tableRow, 'podDocType', '', 'left', '', '');
		}
	}

	for(let chargeId in activeDeliveryCharges) {
		if(activeDeliveryCharges.hasOwnProperty(chargeId)) {
			dlyChrgColumn 	= createColumn(tableRow, 'col_delivery_' + chargeId, '', 'left', 'display: none;', '');

			appendValueInTableCol(dlyChrgColumn, activeDeliveryCharges[chargeId]);

			if(chargeId == OCTROI_SERVICE)
				appendValueInTableCol(dlyChrgColumn, ' ' + Math.round(octroiServiceCharge) + ' %');

			//Calling from below
			hideDeliveryChargesCol(chargeId, '');
		}
	}

	if(ddmSettlementConfig.isServiceTaxPaidByShow){
		stPaidByColumn 		= createColumn(tableRow, 'stPaidByCol', '', 'left', '', '');

		appendValueInTableCol(stPaidByColumn, 'ST Paid By');

		if(taxes != null && taxes.length > 0) { //taxes coming from GenericDDMSettlement.js
			for(const element of taxes) {
				stColumn 	= createColumn(tableRow, 'stCol', '', 'left', '', '');

				if(element.isTaxPercentage)
					appendValueInTableCol(stColumn, element.taxName + '<br/>' + element.taxAmount + ' %');
				else
					appendValueInTableCol(stColumn, element.taxName);
			}
		}
	}
	
 	if(ddmSettlementConfig.isDiscountShow) {
		discountColumn 		= createColumn(tableRow, 'discontCol', '', 'left', '', '');
		discountTypeColumn 	= createColumn(tableRow, 'discountTypeCol', '', 'left', 'width:80px;', '');
	}

	remarkColumn			= createColumn(tableRow, 'remarkCol', '', 'left', '', '');

	if(ddmSettlementConfig.isCommissionAmountColumnDisplay)
		commissionAmtCol 	= createColumn(tableRow, 'commissionAmtCol', '', 'left', 'width:50px;', '');
	
	if(ddmSettlementConfig.allowReceivedAmt) {
		deliveryAmtAmountCol 	= createColumn(tableRow, 'deliveryAmtAmountCol', '', 'left', 'width:50px;', '');
		receivedAmountCol 		= createColumn(tableRow, 'receivedAmountCol', '', 'left', 'width:50px;', '');
	}

	if(ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		manualCRNoCol			= createColumn(tableRow, 'manualCRNoCol', '', 'left', '', '');
	
	if(isTDSAllow)
		tdsColumn 		= createColumn(tableRow, 'tdsCol', '', 'left', '', '');
	
	if(ddmSettlementConfig.allowOtpBasedDDMSettlement)
		ddmSettlementOTPCol	= createColumn(tableRow, 'ddmSettlementOTPCol', '', 'left', '', '');

	appendValueInTableCol(allCol, 'ALL');

	// Add Value For each Column

	checkBox	= new Object();

	checkBox.type		= 'checkbox';
	checkBox.id			= 'selectAll';
	checkBox.name		= 'selectAll';
	checkBox.value		= '';
	checkBox.class		= '';
	checkBox.onclick	= 'selectAllWayBills(this.checked); calcSlctdAmntType();';

	createInput(allCol, checkBox);

	appendValueInTableCol(lrNumberColumn, 'LR No');
	
	if(ddmSettlementConfig.isCrNumberColumnDisplay)
		appendValueInTableCol(crNumberColumn, 'CR NO');
	
	if(ddmSettlementConfig.allowBackDateForSettlement)
		appendValueInTableCol(dateColumn, 'Date');
		
	if(ddmSettlementConfig.allowBackTimeForSettlement)
		appendValueInTableCol(timeColumn, 'Time');
	
	appendValueInTableCol(fromColumn, 'From');
	appendValueInTableCol(toColumn, 'To');
	appendValueInTableCol(cneeNameColumn, 'C/nee Name');
	appendValueInTableCol(cneeNoColumn, 'C/nee No');
	appendValueInTableCol(lrTypeColumn, 'LR Type');
	appendValueInTableCol(bkgTotalColumn, 'Booking Total');
	appendValueInTableCol(amountColumn, 'Amt');
	appendValueInTableCol(articleColumn, 'Art');
	appendValueInTableCol(actBkgWgtColumn, 'Act Bkg Wgt');
	appendValueInTableCol(rcvDlyAsColumn, 'Rcv Dly AS');
	
	appendValueInTableCol(paidLoadingColumn, 'Paid Loading');
	
	if(ddmSettlementConfig.isShowStbsColumn)
		appendValueInTableCol(stbsColumn, 'Allow Stbs');
	
	appendValueInTableCol(ctoDetainStatusCol, 'Detain Status');
	
	if(isPanNumberRequired)
		appendValueInTableCol(panNumberColumn, 'PAN Number');

	appendValueInTableCol(dlyDetailsColumn, 'Delivery Details');
	
	if(ddmSettlementConfig.allowAddLrExpenseButton)
		appendValueInTableCol(addLrExpenseButtonColumn, 'Add Expense');

	if(ddmSettlementConfig.showReceiverToName)
		appendValueInTableCol(receiverToNamecolumn, 'Receiver Name');	

	if(podConfiguration.AllowPodReceiveOption) {
		if(!podConfiguration.setDefaultPODStatusNo) {
			appendValueInTableCol(podStatusColumn, 'POD Received');

			if(podConfiguration.showPODDocuments)
				appendValueInTableCol(podDocTypeColumn, 'POD Document');
		}
	}

	if(ddmSettlementConfig.isDiscountShow) {
		appendValueInTableCol(discountColumn, 'Discount');
		appendValueInTableCol(discountTypeColumn, 'Discount Type');
	}
	
	appendValueInTableCol(remarkColumn, 'Remark');

	if(ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		appendValueInTableCol(manualCRNoCol, 'Manual CR No');

	if(ddmSettlementConfig.isCommissionAmountColumnDisplay)
		appendValueInTableCol(commissionAmtCol, 'Commission');
	
	if(ddmSettlementConfig.allowReceivedAmt) {
		appendValueInTableCol(deliveryAmtAmountCol, 'Delivery Amount');
		appendValueInTableCol(receivedAmountCol, 'Received Amount')
	}

	if(isTDSAllow)
		appendValueInTableCol(tdsCol, 'TDS');
		
	if(ddmSettlementConfig.allowOtpBasedDDMSettlement)
		appendValueInTableCol(ddmSettlementOTPCol,'OTP Number')

	//Calling from below
	hideDDMTableHeading();
}

//This function called in displayLRDetailsTable function
function createSingleRowForDDMLRDetailsNormalTable(waybillModel, counter, activeDeliveryCharges, paymentTypePermissions, discountTypes, wbIdWiseDeliveryCharges, panNumberHM, lrColl, bookingCharges) {
	var	chargeMasterIdWiseAmount	= null;
	var	chargeAmount				= '';
	var	wayBillId					= waybillModel.wayBillId;
	var wayBill						= null;
	var idArray;
	var flag 						= false;
	var disableChargeIds			= null;
	var disableChargeIdsArray		= new Array();
	var status						= waybillModel.status;
	var wayBillStatusCheck			= true;
	
	if(wbIdWiseDeliveryCharges && wbIdWiseDeliveryCharges[wayBillId] && !jQuery.isEmptyObject(wbIdWiseDeliveryCharges[wayBillId]))
		chargeMasterIdWiseAmount = wbIdWiseDeliveryCharges[wayBillId];

	if(lrColl != null && lrColl.hasOwnProperty(waybillModel.wayBillId))
		wayBill			= lrColl[waybillModel.wayBillId];

	let parentTable 	= $('#'+lrDetailsTableNewId);//	document.getElementById(lrDetailsTableNewId);

	let tableRow 		= createRow('checkBoxtr', '');

	checkBoxColumn 		= createColumn(tableRow, 'checkBoxAr', '', 'left', '', '');

	if(ddmSettlementConfig.checkWayBillStatusForSettlement && (status == WAYBILL_STATUS_RECEIVED || status == WAYBILL_STATUS_DELIVERED || status == WAYBILL_STATUS_DUEUNDELIVERED))
		wayBillStatusCheck	=	false;

	if(waybillModel.paymentType <= 0 && wayBillStatusCheck) { // payment type should be 0 or less then 0 to create check box for LR
		createCheckBox(checkBoxColumn, waybillModel.wayBillId); 

		let paidLoadingObj			= new Object();

		paidLoadingObj.type			= 'hidden';
		paidLoadingObj.id			= 'paidLoading_' + waybillModel.wayBillId;
		paidLoadingObj.name			= 'paidLoading_' + waybillModel.wayBillId;
		paidLoadingObj.value		= waybillModel.paidLoading;

		createInput(checkBoxColumn, paidLoadingObj);

		appendValueInTableCol(checkBoxColumn, createInputForWayBillNumber(waybillModel.wayBillNumber, waybillModel.wayBillId));

		let wayBillTypeObj			= new Object();

		wayBillTypeObj.type			= 'hidden';
		wayBillTypeObj.id			= 'wayBillType_' + waybillModel.wayBillId;
		wayBillTypeObj.name			= 'wayBillType_' + waybillModel.wayBillId;
		wayBillTypeObj.value		= waybillModel.wayBillTypeId;

		createInput(checkBoxColumn, wayBillTypeObj);

		let crNumberObj				= new Object();

		crNumberObj.type			= 'hidden';
		crNumberObj.id				= 'crNumber_' + waybillModel.wayBillId;
		crNumberObj.name			= 'crNumber_' + waybillModel.wayBillId;
		crNumberObj.value			= waybillModel.crNumber;

		createInput(checkBoxColumn, crNumberObj);

		let dcdIdObj				= new Object();

		dcdIdObj.type				= 'hidden';
		dcdIdObj.id					= 'deliveryContactDetailsId_' + waybillModel.wayBillId;
		dcdIdObj.name				= 'deliveryContactDetailsId_' + waybillModel.wayBillId;
		dcdIdObj.value				= waybillModel.deliveryContactDetailsId;

		createInput(checkBoxColumn, dcdIdObj);

		let consignorIdObj			= new Object();

		consignorIdObj.type			= 'hidden';
		consignorIdObj.id			= 'consignorId_' + waybillModel.wayBillId;
		consignorIdObj.name			= 'consignorId_' + waybillModel.wayBillId;
		consignorIdObj.value		= waybillModel.consignorId;

		createInput(checkBoxColumn, consignorIdObj);
		
		let consigneeCorporateAccountIdObj			= new Object();

		consigneeCorporateAccountIdObj.type			= 'hidden';
		consigneeCorporateAccountIdObj.id			= 'consigneeCorporateAccountId_' + waybillModel.wayBillId;
		consigneeCorporateAccountIdObj.name			= 'consigneeCorporateAccountId_' + waybillModel.wayBillId;
		consigneeCorporateAccountIdObj.value		= waybillModel.consigneeCorporateAccountId;

		createInput(checkBoxColumn, consigneeCorporateAccountIdObj);
	}

	lrNumberColumn			= createColumn(tableRow, 'lrNumColumn' + waybillModel.wayBillId, '', 'left', '', '');
	
	if(ddmSettlementConfig.isCrNumberColumnDisplay)
		crNumberColumn			= createColumn(tableRow, 'crNumColumn' + counter, '', 'left', '','');
	
	if(ddmSettlementConfig.allowBackDateForSettlement)
		dateColumn				= createColumn(tableRow, 'dateColumn' + waybillModel.wayBillId, '', 'left', '', 2);
		
	if(ddmSettlementConfig.allowBackTimeForSettlement)
		timeColumn				= createColumn(tableRow, 'timeColumn' + waybillModel.wayBillId, '', 'left', '', 2);	
	
	fromColumn				= createColumn(tableRow, 'fromColumn' + counter, '', 'left', '', '');
	toColumn				= createColumn(tableRow, 'toColumn' + counter, '', 'left', '', '');
	cneeNameColumn			= createColumn(tableRow, 'cneeNameColumn' + counter, '', 'left', '', '');	
	cneeNoColumn			= createColumn(tableRow, 'cneeNoColumn' + counter, '', 'left', '', '');
	lrTypeColumn			= createColumn(tableRow, 'lrTypeColumn' + counter, '', 'left', '', '');
	bkgTotalColumn			= createColumn(tableRow, 'bkgTotalColumn' + counter, '', 'left', '', '');	
	amountColumn			= createColumn(tableRow, 'amtColumn' + counter, '', 'left', '', '');
	articleColumn			= createColumn(tableRow, 'artColumn' + counter, '', 'left', '', '');	
	actBkgWgtColumn			= createColumn(tableRow ,'actBkgWgtColumn' + counter, '', 'left', '', '');
	rcvDlyAsColumn			= createColumn(tableRow, 'rcvDlyAsColumn' + counter, '', 'left', '', '');
	paidLoadingColumn		= createColumn(tableRow, 'paidLoadingColumn' + counter, '', 'left', '', '');	

	if(ddmSettlementConfig.isShowStbsColumn) {
		stbsColumn = createColumn(tableRow, 'stbsColumn' + counter, '', 'center', '', '');
		
		if(isValueExistInArray(headOfficeSubregionArr, subRegionId) || headOfficeSubregionArr == null)
			appendValueInTableCol(stbsColumn, createStbsCheckBox(stbsColumn, waybillModel.wayBillId));
		else
			appendValueInTableCol(stbsColumn, "");
	}
	
	ctoDetainStatusCol		= createColumn(tableRow, 'ctoDetainStatusCol' + waybillModel.wayBillId, '', 'left', 'display:none', '');
	
	if(isPanNumberRequired) {
		panNumberColumn		= createColumn(tableRow, 'panNumberColumn' + counter, '', 'center', '', '');

		let panNo			= "";

		if(panNumberHM && panNumberHM.hasOwnProperty(waybillModel.wayBillId))
			panNo 			= panNumberHM[waybillModel.wayBillId];

		appendValueInTableCol(panNumberColumn, createInputForPanNumber(waybillModel.wayBillId, panNo));
	}

	dlyDetailsColumn		= createColumn(tableRow, 'dlyDetailsColumn' + counter, '', 'left', '', '');

	if(ddmSettlementConfig.showReceiverToName) {
		receiverToNamecolumn		= createColumn(tableRow, 'receiverToNamecolumn' + counter, '', 'left', '', '');	
		appendValueInTableCol(receiverToNamecolumn, createInputForReceiverName(waybillModel.wayBillId, ''));
	}

	if(podConfiguration.AllowPodReceiveOption) {
		if(!podConfiguration.setDefaultPODStatusNo) {
			podStatusColumn		= createColumn(tableRow, 'podStatusColumn' + counter, '', 'left', '', '');
			
			if(podConfiguration.showPODDocuments)
				podDocTypeColumn		= createColumn(tableRow, 'podDocType' + counter, '', 'left', 'visibility: hidden;', '');
		}
	}
	
	if(ddmSettlementConfig.allowAddLrExpenseButton)
		addLrExpenseButtonColumn			= createColumn(tableRow, 'addLrExpenseButtonColumn' + counter, '', 'left', '', '');	
	
	idArray 				= (ddmSettlementConfig.HideChargesIds).split(',');
	disableChargeIdsArray	= (ddmSettlementConfig.disableChargeIds).split(',');

	for(let chargeId in activeDeliveryCharges) {
		if(activeDeliveryCharges.hasOwnProperty(chargeId)) {
			dlyChrgColumn	= createColumn(tableRow, 'col_delivery_' + chargeId + counter, '', 'left', 'display: none;', '');

			chargeAmount 	= '';

			if(chargeMasterIdWiseAmount && chargeMasterIdWiseAmount[chargeId])
				chargeAmount 	= chargeMasterIdWiseAmount[chargeId];

			if(waybillModel.deliveryTo == DELIVERY_TO_DOOR_ID)
				flag = isValueExistInArray(idArray, chargeId);
			
			if(ddmSettlementConfig.disableSpecificCharges)
				flag = isValueExistInArray(disableChargeIdsArray, chargeId);

			appendValueInTableCol(dlyChrgColumn, createInputForDeliveryCharge(waybillModel, chargeId, chargeAmount, counter, flag));
			flag = false;
		}
	}

	if(ddmSettlementConfig.isServiceTaxPaidByShow) {
		stPaidByColumn			= createColumn(tableRow, 'stPaidByColumn' + counter, '', 'left', '', '');

		if(taxes != null) {
			for(var i = 0; i < taxes.length; i++) {
				serviceTaxColumn		= createColumn(tableRow, 'serviceTaxColumn_' + taxes[i].taxMasterId, '', 'left', '', '');

				appendValueInTableCol(serviceTaxColumn, createInputForUnAddedST(waybillModel.wayBillId, taxes[i].taxMasterId));
				appendValueInTableCol(serviceTaxColumn, createInputForActualTax(waybillModel.wayBillId, taxes[i].taxMasterId));
				appendValueInTableCol(serviceTaxColumn, createInputForServiceTax(waybillModel.wayBillId, taxes[i].taxMasterId));
				appendValueInTableCol(serviceTaxColumn, createInputForPerctax(waybillModel.wayBillId, taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].isTaxPercentage));
				appendValueInTableCol(serviceTaxColumn, createInputForCalculateSTOnAmount(waybillModel.wayBillId, taxes[i].taxMasterId));
			}
		}

		if(taxDtlsColl != null) {
			let wayBillTaxTxn	= taxDtlsColl[waybillModel.wayBillId];

			if(wayBillTaxTxn != null) {
				var taxAmount	= 0;

				for(var i = 0; i < wayBillTaxTxn.length; i++) {
					if(wayBillTaxTxn[i].taxAmount > 0)
						taxAmount	+= wayBillTaxTxn[i].taxAmount;
					else
						taxAmount	+= wayBillTaxTxn[i].unAddedTaxAmount;
				}

				appendValueInTableCol(stPaidByColumn, createInputForBookingTaxTxn(waybillModel.wayBillId, taxAmount));
			}
		}
	}

	if(ddmSettlementConfig.isDiscountShow) {
		discountColumn			= createColumn(tableRow, 'discountColumn' + counter, '', 'left', '', '');
		discountTypeColumn		= createColumn(tableRow, 'discountTypeColumn' + counter, '', 'left', '', '');
	}
	
	remarkColumn			= createColumn(tableRow, 'remarkColumn' + counter, '', 'left', '', '');

	if(ddmSettlementConfig.isCommissionAmountColumnDisplay)
		commissionAmtCol	= createColumn(tableRow, 'commissionAmtCol' + counter, '10%', 'left', '', '');
	
	if(ddmSettlementConfig.allowReceivedAmt) {
		deliveryAmtAmountCol	= createColumn(tableRow, 'deliveryAmtAmountCol' + counter, '10%', 'left', '', '');
		receivedAmountCol		= createColumn(tableRow, 'receivedAmountCol' + counter, '10%', 'left', '', '');
	}
	
	if(ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		manualCRNoCol            = createColumn(tableRow, 'manualCRNoCol' + counter, '', 'left', '', '');

	if(ddmSettlementConfig.allowOtpBasedDDMSettlement)
		ddmSettlementOTPCol		= createColumn(tableRow, 'ddmSettlementOTPCol' + counter, '10%', 'left', '', '');

	appendRow(parentTable.attr('id'), tableRow);

	for(let chargeId in activeDeliveryCharges) {
		//Calling from below
		hideDeliveryChargesCol(chargeId, counter);
	}

	// append values in columns

	appendValueInTableCol(lrNumberColumn, waybillModel.wayBillNumber);
	
	if(ddmSettlementConfig.isCrNumberColumnDisplay)
		appendValueInTableCol(crNumberColumn, waybillModel.crNumber);
		
	appendValueInTableCol(fromColumn, waybillModel.sourceBranch);
	appendValueInTableCol(toColumn, waybillModel.destinationBranch);		
	appendValueInTableCol(cneeNameColumn, waybillModel.consigneeName);
	appendValueInTableCol(cneeNoColumn, waybillModel.consigneePhoneNumber);
	appendValueInTableCol(lrTypeColumn, waybillModel.wayBillType);
	appendValueInTableCol(lrTypeColumn, createInputForBookingTimeGrandTotal(waybillModel.wayBillId, wayBill));
	appendValueInTableCol(bkgTotalColumn, waybillModel.bookingAmount);
	appendValueInTableCol(paidLoadingColumn, waybillModel.paidLoading);

	if(ddmSettlementConfig.isServiceTaxPaidByShow) {
		appendValueInTableCol(lrTypeColumn, createInputForWayBillGrandTotal(waybillModel.wayBillId, wayBill));
		appendValueInTableCol(lrTypeColumn, createInputForWayBillDeliveryAmount(waybillModel.wayBillId, wayBill));
		appendValueInTableCol(lrTypeColumn, createInputForWayBillDeliveryDiscount(waybillModel.wayBillId, wayBill));
		appendValueInTableCol(lrTypeColumn, createInputForTaxBy(waybillModel.wayBillId, waybillModel.taxBy));
	}

	appendValueInTableCol(amountColumn, waybillModel.grandTotal);
	appendValueInTableCol(articleColumn, waybillModel.packageDetails);
	
	if(ddmSettlementConfig.allowAddLrExpenseButton) {
		var combo = $("<a href='javascript:void(0)' class='btn btn-success btn-sm' id='lrNumber_"+waybillModel.wayBillNumber+"' onclick='addWayBillExpense("+waybillModel.wayBillId + ',' + waybillModel.consigneeCorporateAccountId +");'><b>Add</b></a>");
		appendValueInTableCol(addLrExpenseButtonColumn, combo);
	}
	
	appendValueInTableCol(actBkgWgtColumn, waybillModel.actualWeight);

	if(paymentTypePermissions && !jQuery.isEmptyObject(paymentTypePermissions)) {
		if(ddmSettlementConfig.SetDeliveryChargesForLMT)
			var combo = $("<select></select>").attr("id", 'paymentType_' + waybillModel.wayBillId).attr("name", 'paymentType_' + waybillModel.wayBillId).attr("onchange", 'calcSlctdAmntType(); setChequeAmount(' + waybillModel.wayBillId + '); hideShowDelDetails(this, ' + counter + ',' + waybillModel.wayBillId + '); calulateBillAmount(' + waybillModel.wayBillId + ',' + waybillModel.wayBillTypeId + ',' + waybillModel.sourceBranchStateId + ',' + waybillModel.destinationBranchStateId + ',"' + waybillModel.consignorGstn + '","' + waybillModel.consigneeGstn + '");').attr("onkeyup", 'setChequeAmount(' + waybillModel.wayBillId + ');').attr("class", 'width-100px');
		else
			var combo = $("<select></select>").attr("id", 'paymentType_' + waybillModel.wayBillId).attr("name", 'paymentType_' + waybillModel.wayBillId).attr("onchange",   'calcSlctdAmntType(); ' +  'validateShortCreditAllowOnTxnType(' + waybillModel.wayBillId + '); ' + 'showShortCreditDueAmout(this,"' + waybillModel.consigneeName + '", ' + waybillModel.consignorId + '); ' + 'hideShowDelDetails(this, ' + counter + ', ' + waybillModel.wayBillId + '); ' + 'disableChargesOnPaymentType(' + waybillModel.wayBillId + ')').attr("class", 'width-100px paymentType');

		appendValueInTableCol(rcvDlyAsColumn, combo);
		
		if(ddmSettlementConfig.allowBackDateForSettlement){
			let settleDateColumn = $($.parseHTML('<div id="date" class="width-100px" data-attribute="date" ><div class=""><div class="left-inner-addon"><input class="form-control" type="text" name="DateEle" data-tooltip="Date" id="DateEle'+ waybillModel.wayBillId+'" readonly /></div></div></div>'));
			appendValueInTableCol(dateColumn, settleDateColumn);
			$("#DateEle"+ waybillModel.wayBillId).datepicker({
				showAnim	: "fold",
				maxDate		: new Date(curDate),
				defaultDate	: new Date(curDate),
				minDate	: backDate,
				dateFormat	: 'dd-mm-yy'
			});
			
			$("#DateEle"+ waybillModel.wayBillId).val(dateWithDateFormatForCalender(curDate,"-"));
		}
		
		if(ddmSettlementConfig.allowBackTimeForSettlement) {
			let settleTimeColumn = $($.parseHTML('<div id="time" class="width-100px" data-attribute="time"><div class=""><div class="left-inner-addon"><input class="form-control" type="text" name="TimeEle" data-tooltip="Time" id="TimeEle' + waybillModel.wayBillId + '" readonly/></div></div></div>'));
			appendValueInTableCol(timeColumn, settleTimeColumn);
			
			$("#TimeEle" + waybillModel.wayBillId).timepicker({
				showMeridian: true
			});
			
			$("#TimeEle" + waybillModel.wayBillId).val(curTime);
		}	
			
		createOption($(combo).attr('id'), 0, '--Select--');
		
		for(let id in paymentTypePermissions) {
			if(paymentTypePermissions.hasOwnProperty(id))
				createOption($(combo).attr('id'), id, paymentTypePermissions[id]);
		}

		if (waybillModel.wayBillTypeId != WAYBILL_TYPE_TO_PAY ) {
			$('#paymentType_' + waybillModel.wayBillId + ' option').each(function(){
				if(this.value == PAYMENT_TYPE_BILL_CREDIT_ID)
					this.disabled = true;
			});
		}
	}
	
	if(podConfiguration.AllowPodReceiveOption && waybillModel.showPod && !podConfiguration.setDefaultPODStatusNo) {
		setPODReceive(waybillModel.wayBillId , counter);
		setPODDocument(waybillModel.wayBillId);
	}

	//Called from below
	createDeliveryDetailsTableForSingleRow(dlyDetailsColumn, waybillModel.wayBillId ,waybillModel);
	
	if(ddmSettlementConfig.isServiceTaxPaidByShow)
		setSTPaidBy(waybillModel);
		
	if(ddmSettlementConfig.isDiscountShow) {
		appendValueInTableCol(discountColumn, createInputForDiscount(waybillModel.wayBillId, counter, waybillModel.bookingAmount, waybillModel.grandTotal, waybillModel.wayBillTypeId, waybillModel.deliveryDiscount));
		setDiscountType(waybillModel.wayBillId, discountTypes);
		
		let isReadOnly	= (ddmSettlementConfig.readOnlyDeliveryDiscount || waybillModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY && ddmSettlementConfig.readOnlyDeliveryDiscountForToPayOnly);
		
		setTimeout(function() {
			$('#discountTypes_' + waybillModel.wayBillId).val(waybillModel.discountType);
			
			if(isReadOnly) {
				$('#discountTypes_' + waybillModel.wayBillId).prop("disabled", isReadOnly);
				$('#discount_' + waybillModel.wayBillId).prop("readonly", isReadOnly);
			}
			
			$('#discountTypes_' + waybillModel.wayBillId).css({"color": "black", "font-weight": "bold"});
		}, 200);
	}

	appendValueInTableCol(remarkColumn, createInputForRemark(waybillModel.wayBillId));

	if(ddmSettlementConfig.isCommissionAmountColumnDisplay)
		appendValueInTableCol(commissionAmtCol, createInputForCommissionAmount(waybillModel.wayBillId,waybillModel.commissionAmt));
	
	if(waybillModel.destinationBranchIsAgentBranch == false || waybillModel.destinationBranchIsAgentBranch == 'false'){
		$('#commissionAmt_'+waybillModel.wayBillId).hide();
		$('#commissionAmtCol'+counter).append('<b>Not Agent Branch</b>');
	}
	
	if(ddmSettlementConfig.allowReceivedAmt) {	
		let delAmt = 0;

		if(document.getElementById('wayBillType_' + waybillModel.wayBillId) != null && document.getElementById('wayBillType_' + wayBillId).value == WAYBILL_TYPE_TO_PAY)
			delAmt =  waybillModel.bookingAmount;

		appendValueInTableCol(deliveryAmtAmountCol, createInputForDeliveryAmount(waybillModel.wayBillId, delAmt));
		appendValueInTableCol(receivedAmountCol, createInputForReceivedAmount(waybillModel.wayBillId));
	}
	
	if(isTDSAllow) {
		if(waybillModel.wayBillTypeId == WAYBILL_TYPE_FOC)
			hideShowTableCol('tdsCol', 'hide');
		else {
			tdsColumn = createColumn(tableRow, 'panNumberColumn' + counter, '', 'center', '', '');

			appendValueInTableCol(tdsColumn, createInputForTds(waybillModel.wayBillId, waybillModel.wayBillTypeId));
			appendValueInTableCol(tdsColumn, createInputForTdsOnAmount(waybillModel.wayBillId));
		}
	}

	actBillAmountColumn		= createColumn(tableRow, '', '', 'center', 'display: none;', '');

	appendValueInTableCol(actBillAmountColumn, createInputForActBillAmount(waybillModel.wayBillId));
	appendValueInTableCol(ctoDetainStatusCol, waybillModel.ctoDetainStatus);
	calculateUnloadingChargeOnFreight(waybillModel.wayBillTypeId, bookingCharges,waybillModel.wayBillId)
	setTotalDeliveryAmount(waybillModel.deliveryDiscount,waybillModel.wayBillId, counter);
	
	if(ddmSettlementConfig.allowOtpBasedDDMSettlement)
		appendValueInTableCol(ddmSettlementOTPCol, createInputForOTPNumber(waybillModel.wayBillId, waybillModel.otpNumber));
	
	if(ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		appendValueInTableCol(manualCRNoCol, createInputForManualCrNumber(waybillModel.wayBillId));

	//Calling from below
	hideDDMTableColumns(counter);
	
	if(ddmSettlementConfig.allowShortCreditPaymentTypeOnShortCreditParty) {
		if(shortCreditAllowOnTxnTypeHM && shortCreditAllowOnTxnTypeHM.hasOwnProperty(wayBillId)) {
			let shortCreditTxnType 	= shortCreditAllowOnTxnTypeHM[wayBillId];
			
			if(shortCreditTxnType == SHORT_CREDIT_TXN_TYPE_DELEIVERY || shortCreditTxnType == SHORT_CREDIT_TXN_TYPE_BOTH)
				$('#paymentType_' + wayBillId).val(PAYMENT_TYPE_CREDIT_ID);
			else
				$('#paymentType_' + wayBillId).val(PAYMENT_TYPE_CASH_ID);
		} else
			$('#paymentType_' + wayBillId).val(PAYMENT_TYPE_CASH_ID);
			
		hideShowDelDetails('#paymentType_' + wayBillId, counter, wayBillId );
		calcSlctdAmntType();
		validateShortCreditAllowOnTxnType(wayBillId)
	}
}

function calculateUnloadingChargeOnFreight(wayBillTypeId,bookingCharges,wayBillId) {
	if(!ddmSettlementConfig.calculateUnloadingChargeOnFreight )
		return;
		
	let unloadingChargeAmt	= $('#delCharge_' + UNLOADING+ '_'+wayBillId).val();
	
	if(Number(unloadingChargeAmt) > 0){
		$('#delCharge_' + UNLOADING+ '_' + wayBillId).prop("readonly", "true");
	} else if(Number(unloadingChargeAmt) <= 0 && (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID)) {
		let freightCharge = 0;
		
		for(var i = 0; i < bookingCharges.length; i++) {
			if(bookingCharges[i].wayBillChargeMasterId == FREIGHT)
				freightCharge	= bookingCharges[i].chargeAmount;
		}
		
		$('#delCharge_' + UNLOADING + '_' + wayBillId).val(Math.round(Number(freightCharge) * Number(ddmSettlementConfig.percentageToCalculateUnloadingChargeOnFreight)) / 100);
		$('#delCharge_' + UNLOADING + '_' + wayBillId).prop("readonly", "true");
	}
}

function setSTPaidBy(waybillModel) {

	removeOption('STPaidBy_' + waybillModel.wayBillId, null);

	let combo = $("<select></select>").attr("id", 'STPaidBy_' + waybillModel.wayBillId).attr("name", 'STPaidBy_' + waybillModel.wayBillId).attr("onchange", 'calulateBillAmount(' + waybillModel.wayBillId + ',' + waybillModel.wayBillTypeId + ',' + waybillModel.sourceBranchStateId + ',' + waybillModel.destinationBranchStateId + ',"' + waybillModel.consignorGstn + '","' + waybillModel.consigneeGstn + '")').attr("class", 'width-80px');

	appendValueInTableCol(stPaidByColumn, combo);

	createOptionForSTPaidBy(waybillModel.wayBillId);
}

function setDiscountType(wayBillId, discountTypes) {
	if(discountTypes && !jQuery.isEmptyObject(discountTypes)) {
		let combo = $("<select></select>").attr("id", 'discountTypes_' + wayBillId).attr("name", 'discountTypes_' + wayBillId).attr("onchange", '').attr("class", 'width-80px');

		appendValueInTableCol(discountTypeColumn, combo);

		createOption($(combo).attr('id'), 0, '--Select--');

		for(let id in discountTypes) {
			if(discountTypes.hasOwnProperty(id))
				createSecondOptions($(combo).attr('id'), id, discountTypes[id]);
		}
	}
}

function setPODReceive(wayBillId , counter) {
	let combo = $("<select></select>").attr("id", 'podStatusColumn_' + wayBillId).attr("name", 'podStatusColumn_' + wayBillId).attr("onchange", 'loadPodDocumentSelection('+wayBillId+','+counter+')').attr("class", 'width-80px');
	appendValueInTableCol(podStatusColumn, combo);
	createOption($(combo).attr('id'), 1, 'NO');
	createSecondOptions($(combo).attr('id'), 2, 'YES');
}

function setPODDocument(wayBillId) {
	if(podConfiguration.showPODDocuments) {
		removeOption('podDocType_'+wayBillId, null);
		let combo1 = $("<select multiple='multiple'></select>").attr("id", 'podDocType_'+ wayBillId).attr("name", 'podDocType_' + wayBillId).attr("onclick", '');

		appendValueInTableCol(podDocTypeColumn, combo1);

		if(!jQuery.isEmptyObject(podDocumentTypeArr)) {	
			for(var i = 0; i < podDocumentTypeArr.length; i++) {
				createOption('podDocType_'+ wayBillId, podDocumentTypeArr[i].podDocumentTypeId, podDocumentTypeArr[i].podDocumentTypeName);
			}
		}

		multiselectPodDocumentType(wayBillId);
	}
}

function createOptionForSTPaidBy(wayBillId) {
	createOption('STPaidBy_' + wayBillId, TAX_PAID_BY_CONSINGEE_ID, TAX_PAID_BY_CONSINGEE_NAME);

	if(!ddmSettlementConfig.hideStPaidByTransporter)
		createOption('STPaidBy_' + wayBillId, TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
}

function createInputForBookingTimeGrandTotal(wayBillId, wayBill) {
	let bookingTimeGrandTotalFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'bookingTimeGrandTotal_' + wayBillId,
		name			: 'bookingTimeGrandTotal_' + wayBillId,
		value			: Math.round(parseInt(wayBill.grandTotal) - parseInt(wayBill.deliveryAmount) - parseInt(wayBill.deliveryDiscount))});

	return bookingTimeGrandTotalFeild;
}

function createInputForWayBillGrandTotal(wayBillId, wayBill) {
	var wayBillGrandTotalFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'wayBillGrandTotal_' + wayBillId,
		name			: 'wayBillGrandTotal_' + wayBillId,
		value			: Math.round(parseInt(wayBill.grandTotal))});

	return wayBillGrandTotalFeild;
}

function createInputForWayBillDeliveryAmount(wayBillId, wayBill) {
	var wayBillDeliveryAmountFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'wayBillDeliveryAmount_' + wayBillId,
		name			: 'wayBillDeliveryAmount_' + wayBillId,
		value			: Math.round(parseInt(wayBill.deliveryAmount))});

	return wayBillDeliveryAmountFeild;
}

function createInputForWayBillDeliveryDiscount(wayBillId, wayBill) {
	var wayBillDeliveryDiscountFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'wayBillDeliveryDiscount_' + wayBillId,
		name			: 'wayBillDeliveryDiscount_' + wayBillId,
		value			: Math.round(parseInt(wayBill.deliveryDiscount))});
		
	return wayBillDeliveryDiscountFeild;
}

function validateDeliveryDiscount(obj, counter, bookingAmount, grandTotal, lrType) {
	var array 			= obj.id.split('_',2);
	var wayBillId 		= array[1];
	var discountAmount  = Number(obj.value);

	if(lrType == 2){
		if(activeDeliveryChargesArr != null){
			for(var chargeid in activeDeliveryChargesArr){
				bookingAmount += Number($('#delCharge_' + chargeid + '_' + wayBillId).val());
			}
		}

		if(discountAmount > bookingAmount){
			showMessage('error','Discount cannot be more than Delivery Amount');
			setTotalDeliveryAmount(discountAmount,wayBillId,counter);
			$("#"+obj.id).focus();
			$("#"+obj.id).val(0);
			return false;
		}
	}else{
		if(activeDeliveryChargesArr != null){
			for(var chargeid in activeDeliveryChargesArr){
				grandTotal += Number($('#delCharge_' + chargeid + '_' + wayBillId).val());
			}
		}
		
		if(discountAmount > grandTotal){
			showMessage('error','Discount cannot be more than Delivery Charges');
			setTotalDeliveryAmount(discountAmount,wayBillId,counter);
			$("#"+obj.id).focus();
			$("#"+obj.id).val(0);
			return false;
		}
	}
	
	setTotalDeliveryAmount(discountAmount,wayBillId,counter);
	
	totAmt = 0.00;
	
	totAmt = Number($('#deliveryAmt_'+ wayBillId).val()) + Number($('#discount_' + wayBillId).val());
	
	if($('#paymentType_'+ wayBillId).val() != PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID 
		&& !validateDiscountLimit(discountInPercent, totAmt, $('#discount_' + wayBillId).val(), $('#'+obj.id)))
			return false;
}

function createInputForTaxBy(wayBillId, taxBy) {
	var taxByFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'taxBy_' + wayBillId,
		name			: 'taxBy_' + wayBillId,
		value			: taxBy});

	return taxByFeild;
}

function createInputForUnAddedST(wayBillId, taxMasterId) {
	var panNumberFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'unAddedST_' + taxMasterId + '_' + wayBillId,
		name			: 'unAddedST_' + taxMasterId + '_' + wayBillId,
		value			: '0'});

	return panNumberFeild;
}

function createInputForActualTax(wayBillId, taxMasterId) {
	var panNumberFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'actualTax_' + taxMasterId + '_' + wayBillId,
		name			: 'actualTax_' + taxMasterId + '_' + wayBillId,
		value			: '0'});

	return panNumberFeild;
}

function createInputForPanNumber(wayBillId, panNo) {  
	var panNumberFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'panNumber_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'panNumber_' + wayBillId,
		value			: panNo,
		maxlength		: 10,
		placeholder		: 'PAN Number'});

	return panNumberFeild;
}

function createInputForDiscount(wayBillId, counter, bookingAmount, grandTotal, lrType, deliveryDiscount) {
	var tdsFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'discount_' + wayBillId,
		class			: 'width-50px text-align-right', 
		name			: 'discount_' + wayBillId,
		value			: deliveryDiscount,
		onkeypress		: 'return noNumbers(event);',
		onkeyup			: 'validateDeliveryDiscount(this,'+counter+','+bookingAmount+','+grandTotal+','+lrType+');',
		placeholder		: '0'});
	return tdsFeild;
}

function createInputForRemark(wayBillId) {
	var tdsFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'remark_' + wayBillId,
		class			: '', 
		name			: 'remark_' + wayBillId,
		value			: '',
		placeholder		: 'Remark'});

	return tdsFeild;
}

function createInputForManualCrNumber(wayBillId) {
        
        var input	= $("<input/>", { 
		type					: 'text',
		id						: 'manualCrNumber_' + wayBillId,
		name					: 'manualCrNumber_' + wayBillId,
		value					:	'' ,
		class					: 'width-100px text-align-right',
		maxlength				: 8,
		placeholder				: 'CR No'
	});
	
	input.on('blur', function () {
        checkDuplicateCR(wayBillId, this);
    });

    return input;
}


function checkDuplicateCR(wayBillId, inputElement) {
	let value = inputElement.value.trim();

	if (value === "") return;

	let allInputs = document.querySelectorAll('[id^="manualCrNumber_"]');
	let duplicateFound = false;

	allInputs.forEach(function(inp) {
		if (inp !== inputElement && inp.value.trim() === value) {
			duplicateFound = true;
		}
	});

	if (duplicateFound) {
		showMessage("error", "Manual CR Number already entered, Please enter a different number !");
		inputElement.focus();
		return false;
	}

	let jsonData = {
		filter: 5,
		manualCRNumber: inputElement.value,
		manualCRDate:date(new Date(serverCurrentDate),"-")
	};

	$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16", { json: JSON.stringify(jsonData) 
		}, function (data) {
			if (!data || data.errorDescription) {
				showMessage('error', data?.errorDescription || "System error");
				return;
			}

			if (data.isManualCRNoExists === true) {
				showMessage('error', crNumberAlreadyCreatedInfoMsg);
				$("#manualCrNumber_" + wayBillId).focus();
				checkDuplicate=false;
				return false;
			} else {
				checkDuplicate=true;
				hideAllMessages();
			}
		}
	);
}
function createInputForWayBillNumber(wayBillNumber, wayBillId) {
	var wayBillNumberFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'wayBillNumber_' + wayBillId,
		class			: '', 
		name			: 'wayBillNumber_' + wayBillId,
		value			: wayBillNumber,
		placeholder		: ''});

	return wayBillNumberFeild;
}

function createInputForDeliveryCharge(waybillModel, chargeId, chargeAmount, counter, flag) {
	var readonlyValue		= false;
	var onblurValue			= '';
	var onfocusValue		= '';
	var onkeyupValue		= 'setTotalDeliveryAmount(' +waybillModel.deliveryDiscount + ',' + waybillModel.wayBillId + ', ' + counter + ');validatePaymentTypeSelection(' + waybillModel.wayBillId + ')';

	if(ddmSettlementConfig.SetDeliveryChargesForLMT) {
		onblurValue			= 'if(this.value=="")this.value="0"; clearIfNotNumeric(this,"0");calulateBillAmount(' + waybillModel.wayBillId + ',' + waybillModel.wayBillTypeId + ',' + waybillModel.sourceBranchStateId + ',' + waybillModel.destinationBranchStateId + ',"' + waybillModel.consignorGstn + '","' + waybillModel.consigneeGstn + '");validatePaymentTypeSelection(' + waybillModel.wayBillId + ')';
		onfocusValue		= "if(this.value=='0')this.value=''";
		onkeyupValue		= "calulateBillAmount(" + waybillModel.wayBillId + ',' + waybillModel.wayBillTypeId + ',' + waybillModel.sourceBranchStateId + ',' + waybillModel.destinationBranchStateId + ',"' + waybillModel.consignorGstn + '","' + waybillModel.consigneeGstn + '");validatePaymentTypeSelection(' + waybillModel.wayBillId + ')';

		if(chargeId == OCTROI_DELIVERY) {
			if(Math.round(waybillModel.wayBillChargeConfigAmount) > 0)
				chargeAmount	= waybillModel.wayBillChargeConfigAmount;
			else
				chargeAmount	= 0;
		} else if(chargeId == OCTROI_SERVICE)
			chargeAmount		= waybillModel.octroiServiceAmount;
		else
			chargeAmount		= 0;

		if(chargeId == OCTROI_DELIVERY && Math.round(waybillModel.wayBillChargeConfigAmount) > 0)
			readonlyValue		= true;
	}
	//here if flag is true then we are making charges read only for NDT
	if(flag){
		var deliveryChargeFeild	= $("<input/>", { 
			type					: 'text',
			id						: 'delCharge_' + chargeId + '_' + waybillModel.wayBillId,
			name					: 'delCharge_' + chargeId + '_' + waybillModel.wayBillId,
			value					: chargeAmount,
			class					: 'width-50px text-align-right',
			onkeypress				: 'return noNumbers(event);',
			onkeyup					: onkeyupValue,
			maxlength				: 7,
			onblur					: onblurValue,
			onfocus					: onfocusValue,
			onclick					: '',
			placeholder				: '0',
			readonly				:true
		});
	}else{
		var deliveryChargeFeild	= $("<input/>", { 
			type					: 'text',
			id						: 'delCharge_' + chargeId + '_' + waybillModel.wayBillId,
			name					: 'delCharge_' + chargeId + '_' + waybillModel.wayBillId,
			value					: chargeAmount,
			class					: 'width-50px text-align-right',
			onkeypress				: 'return noNumbers(event);',
			onkeyup					: onkeyupValue,
			maxlength				: 7,
			readonly				: readonlyValue,
			onblur					: onblurValue,
			onfocus					: onfocusValue,
			onclick					: '',
			placeholder				: '0'
		});
	}


	return deliveryChargeFeild;
}
function disableChargesOnPaymentType(wayBillId){
	var paymentTypeId	= $('#paymentType_' + wayBillId).val();
	const isCrossingCredit = (paymentTypeId == PAYMENT_TYPE_CROSSING_CREDIT_ID);

	for(var id in activeDeliveryChargesGlobal) {
		if (isCrossingCredit) {
			$("#delCharge_" + id + "_" + wayBillId).prop('disabled', true).val('0');
			$("#tdsAmount_"+wayBillId).prop('disabled', true).val('0');
		} else {
			$("#delCharge_" + id + "_" + wayBillId).prop('disabled', false);
			$("#tdsAmount_"+wayBillId).prop('disabled', false);
			if($('#wayBillType_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) 
				$("#deliveryAmt_"+wayBillId).val(parseInt($('#bookingTimeGrandTotal_' + wayBillId).val()));
		}
	}
}
function createInputForDeliveryAmount(wayBillId, delAmt) {
	var deliveryAmountFeild	= $("<input/>", { 
		type					: 'text',
		id						: 'deliveryAmt_' + wayBillId,
		name					: 'deliveryAmt_' + wayBillId,
		value					: delAmt,
		class					: 'width-50px text-align-right',
		onkeypress				: 'return noNumbers(event);',
		onkeyup					: '',
		maxlength				: 7,
		readonly				: 'readonly',
		onclick					: '',
		placeholder				: '0'
	});

	return deliveryAmountFeild;
}
function createInputForCommissionAmount(wayBillId,commAmt) {
	var commissionAmountFeild	= $("<input/>", { 
		type					: 'text',
		id						: 'commissionAmt_' + wayBillId,
		name					: 'commissionAmt_' + wayBillId,
		class					: 'width-50px text-align-right',
		onkeypress				: 'return noNumbers(event);',
		value					: commAmt,
		onkeyup					: '',
		maxlength				: 7,
		onclick					: '',
		placeholder				: '0'
	});
	
	return commissionAmountFeild;
}


function createInputForOTPNumber(wayBillId,otpNumber) {
	let otpNumberField	= $("<input/>", { 
		type					: 'text',
		id						: 'otpNumber_' + wayBillId,
		name					: 'otpNumber_' + wayBillId,
		value					: '',
		class					: 'width-50px text-align-right',
		onkeypress				: 'return noNumbers(event);',
		onkeyup					: '',
		maxlength				: '',
		onblur					: `validateOtp(this,${wayBillId},${otpNumber})`,
		onkeydown				: `return handleOtpKeyDown(event, this, ${wayBillId},${otpNumber});`,
		placeholder				: '0'
	});

	return otpNumberField;
}

function createInputForReceivedAmount(wayBillId) {
	var receivedAmountFeild	= $("<input/>", { 
		type					: 'text',
		id						: 'reciveAmt_' + wayBillId,
		name					: 'reciveAmt_' + wayBillId,
		value					: '0',
		class					: 'width-50px text-align-right',
		onkeypress				: 'return noNumbers(event);',
		onkeyup					: 'setRecevedAmount(this,' + wayBillId + ')',
		maxlength				: 7,
		onclick					: 'resetTextFeild(this, 0)',
		placeholder				: '0'
	});

	return receivedAmountFeild;
}

function createInputForServiceTax(wayBillId, taxMasterId) {
	var serviceTaxFeild	= $("<input/>", { 
		type				: 'text', 
		id					: 'tax_' + taxMasterId + '_' + wayBillId,
		class				: 'width-50px', 
		name				: 'tax_' + taxMasterId + '_' + wayBillId,
		value				: '0',
		maxlength			: '5',
		readonly			: 'readonly',
		//style				: 'display: none',
		onkeypress			: 'return noNumbers(event);',
		onblur				: 'if(this.value=="")this.value="0"; clearIfNotNumeric(this,"0");',
		onfocus				: 'if(this.value=="0")this.value="";',
		placeholder			: ''});

	return serviceTaxFeild;
}

function createInputForPerctax(wayBillId, taxMasterId, taxAmount, taxPercentage) {

	var isChecked		= null;

	if(taxPercentage)
		isChecked		= 'checked';
	else
		isChecked		= 'unchecked';

	var perctaxFeild	= $("<input/>", { 
		type			: 'checkbox', 
		id				: 'perctax_' + taxMasterId + '_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'perctax_' + taxMasterId + '_' + wayBillId,
		value			: taxAmount,
		style			: 'display: none',
		checked			: isChecked,
		placeholder		: ''});

	return perctaxFeild;
}

function createInputForCalculateSTOnAmount(wayBillId, taxMasterId) {
	var tdsFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'calculateSTOnAmount_' + taxMasterId + '_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'calculateSTOnAmount_' + taxMasterId + '_' + wayBillId,
		value			: '0',
		placeholder		: ''});

	return tdsFeild;
}

function createInputForTds(wayBillId, wayBillTypeId) {
	var tdsFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'tdsAmount_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'tdsAmount_' + wayBillId,
		value			: '0',
		onkeyup			: 'calTDSAmount(this.id, ' + wayBillId + ',' + wayBillTypeId + ')',
		onblur			: 'if(this.value=="")this.value="0";clearIfNotNumeric(this,"0");calTDSAmount(this.id, ' + wayBillId + ',' + wayBillTypeId + ')',
		onkeypress		: 'return noNumbers(event);',
		onfocus			: 'if(this.value=="0")this.value="";',
		maxlength		: 7,
		placeholder		: '0'});

	return tdsFeild;
}

function createInputForTdsOnAmount(wayBillId) {
	var tdsFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'tdsOnAmount_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'tdsOnAmount_' + wayBillId,
		value			: '0',
		onkeypress		: 'return noNumbers(event);',
		maxlength		: 7,
		placeholder		: '0'});

	return tdsFeild;
}

function createInputForActBillAmount(wayBillId) {
	var actBillAmountFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'actBillAmount_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'actBillAmount_' + wayBillId,
		value			: '0',
		style			: 'display: none',
		placeholder		: '0'});

	return actBillAmountFeild;
}

function createInputForBookingTaxTxn(wayBillId, taxAmount) {
	var bookingTaxTxnFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'bookingTaxTxn_' + wayBillId,
		name			: 'bookingTaxTxn_' + wayBillId,
		value			: taxAmount,
		style			: 'display: none'});

	return bookingTaxTxnFeild;
}

function setTotalDeliveryAmount(deliveryDiscount, wayBillId, counter) {
	var deliveryAmt = 0 ;

	for(var id in activeDeliveryChargesGlobal) {
		deliveryAmt += Number($("#delCharge_" + id + "_" + wayBillId).val());
		
		if(ddmSettlementConfig.doNotAllowNegitiveChargeValue && Number($("#delCharge_" + id + "_" + wayBillId).val()) < 0) {
			showMessage('error', amountGTZeroInfoMsg);
			$("#delCharge_" + id + "_" + wayBillId).val(0)
		}
	}

	if($('#wayBillType_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) {
		deliveryAmt = deliveryAmt + Number($("#bkgTotalColumn" + counter).html()) -  Number($("#paidLoadingColumn" + counter).html());
		
		$("#deliveryAmt_" + wayBillId).val(deliveryAmt - deliveryDiscount);
	} else {
		$("#deliveryAmt_" + wayBillId).val(deliveryAmt - deliveryDiscount);
	}
	
	if(Number($("#deliveryAmt_" + wayBillId).val()) < 0) {
		$("#deliveryAmt_" + wayBillId).val(deliveryAmt);
		return false;
	}
	
	totAmt = deliveryAmt;
}

//Function for received amount configuration

function setRecevedAmount(ele, wayBillId){

	var exesAmt 	= 0;
	var discountAmt = 0;
	if($(ele).val() == 0 ){

		$("#discount_" + wayBillId).val(0);
		$("#delCharge_" + deliverychargForExessAmt + "_" + wayBillId).val(0);
	}

	if(Number($(ele).val()) > Number($("#deliveryAmt_" + wayBillId).val()) ){
		exesAmt = Number($(ele).val()) - Number($("#deliveryAmt_" + wayBillId).val());

		$("#discount_" + wayBillId).val(0);
	}

	$("#delCharge_" + deliverychargForExessAmt + "_" + wayBillId).val(exesAmt);

	if(Number($(ele).val()) < Number($("#deliveryAmt_" + wayBillId).val()) && Number($(ele).val()) != 0){
		discountAmt = Number($("#deliveryAmt_" + wayBillId).val()) - Number($(ele).val());
		$("#delCharge_" + deliverychargForExessAmt + "_" + wayBillId).val(0);
	}

	if(discountAmt != 0)
		$("#discount_" + wayBillId).val(discountAmt);
	else
		$("#discount_" + wayBillId).val(0);
} 

function showChequeDetailsRow(wayBillId) {
	switchHtmlTagClass(chequeDetailsRowId + "_" + wayBillId, 'show', 'hide');
}

function hideChequeDate(wayBillId){
	switchHtmlTagClass("chequeDate_" + wayBillId, 'hide', 'show');
}

function hideChequeNumber(wayBillId){
	switchHtmlTagClass("chequeNo_" + wayBillId, 'hide', 'show');
}

function hideBankName(wayBillId){
	switchHtmlTagClass("bankName_" + wayBillId, 'hide', 'show');
}

function showDeliveryCreditorRow(wayBillId) {
	switchHtmlTagClass(DeliveryCreditorRowId + "_" + wayBillId, 'show', 'hide');
}

function showDeliveredToRow(wayBillId) {
	switchHtmlTagClass(deliveredToRowId + "_" + wayBillId, 'show', 'hide');
}

function showDeliveredToCollectionPersonRow(wayBillId) {
	switchHtmlTagClass(deliveredToCollectionPersonRowId + "_" + wayBillId, 'show', 'hide');
}

function showRecoveryBranchRow(wayBillId) {
	switchHtmlTagClass(recoveryBranchRowId + "_" + wayBillId, 'show', 'hide');
}

function showStbsCheckBox(wayBillId) {
	$("#stbsCheckBoxId_"+ wayBillId).css('display','block');
	
	if(isValueExistInArray(headOfficeSubregionArr, subRegionId)){
		$("#stbsCheckBoxId_"+ wayBillId).prop('checked', true);
		$("#stbsCheckBoxId_"+ wayBillId).prop('disabled', true);
	}
}

function hideChequeDetailsRow(wayBillId) {
	switchHtmlTagClass(chequeDetailsRowId + "_" + wayBillId, 'hide', 'show');
}

function hideDeliveryCreditorRow(wayBillId) {
	switchHtmlTagClass(DeliveryCreditorRowId + "_" + wayBillId, 'hide', 'show');
}

function setConsigneeDtls(wayBillId, counter) {
	if(ddmSettlementConfig.setAutoConsigneeDtls) {
		$('#deliveredToName_' + wayBillId).val($('#cneeNameColumn' + counter).html());
		$('#deliveredToPhoneNo_' + wayBillId).val($('#cneeNoColumn' + counter).html());
	}
}

function hideDeliveredToRow(wayBillId) {
	switchHtmlTagClass(deliveredToRowId + "_" + wayBillId, 'hide', 'show');
}

function hideDeliveredToCollectionPersonRow(wayBillId) {
	switchHtmlTagClass(deliveredToCollectionPersonRowId + "_" + wayBillId, 'hide', 'show');
}

function hideRecoveryBranchRow(wayBillId) {
	switchHtmlTagClass(recoveryBranchRowId + "_" + wayBillId, 'hide', 'show');
}

function hideStbsCheckBox(wayBillId) {
	$("#stbsCheckBoxId_"+ wayBillId).css('display','none');
	$("#stbsCheckBoxId_"+ wayBillId).prop("checked", false);
}

function hidePodRequiured(wayBillId){
	$('#podStatusColumn_' + wayBillId).hide();
}

function showPodRequiured(wayBillId){
	$('#podStatusColumn_' + wayBillId).show();
}

function hideShowDelDetails(ele, counter, wayBillId) {
	var rcvDlyAs		= $(ele).val();
	
	if(ddmSettlementConfig.BankPaymentOperationRequired){
		uniqueDataForBankPayment(wayBillId, rcvDlyAs);

		if(ddmSettlementConfig.differentPaymentInMultiplePayment){
			$('#uniqueWayBillId').val(wayBillId);
			$('#uniqueWayBillNumber').val($('#lrNumColumn' + wayBillId).text());
			$('#uniquePaymentType').val($('#paymentType_' + wayBillId).val());
			$('#uniquePaymentTypeName').val($("#paymentType_" + wayBillId + " option:selected").text());
			
			if(typeof hideShowBankPaymentTypeOptions != 'undefined')
				hideShowBankPaymentTypeOptions(ele);
		} else {
			if(deliveryPaymentType_0 > 0 && wayBillId > 0) {
				rcvDlyAs	= deliveryPaymentType_0;
				$('#paymentType_' + wayBillId).val(deliveryPaymentType_0);
			} else if(typeof hideShowBankPaymentTypeOptions != 'undefined')
				hideShowBankPaymentTypeOptions(ele);
		}
	}
	
	switch (rcvDlyAs) {

	case '0':
		hideDeliveredToRow(wayBillId);
		hideChequeDetailsRow(wayBillId);
		hideDeliveryCreditorRow(wayBillId);
		hideDeliveredToCollectionPersonRow(wayBillId);
		
		if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
			hideRecoveryBranchRow(wayBillId);

		$('#tdsAmount_' + wayBillId).attr('readonly', false);
		break;

	case '1'://cash
		cashSelected(wayBillId);
		setConsigneeDtls(wayBillId, counter);
		break;

	case '2'://cheque
		chequeSelected(wayBillId);
		setConsigneeDtls(wayBillId, counter);
		break;

	case '3'://short credit
		shortCreditSelected(wayBillId);
		setConsigneeDtls(wayBillId, counter);
		break;

	case '4'://bill credit
		billCreditSelected(wayBillId);
		break;

	case '5'://receive at godown
		receivedAtGodownSelected(wayBillId);
		break;

	case '6'://due undeliverd
		receivedAtGodownSelected(wayBillId);
		break;

	case '8'://rtgs
	case '9'://neft
	case '10'://credit card
	case '11'://debit card
	case '15'://paytm
	case '16'://imps
	case '17'://upid
	case '18'://phone pay
	case '19'://google pay
	case '20'://whatsapp
		chequeSelected(wayBillId);
		setConsigneeDtls(wayBillId, counter);
		break;
	}
	
	if(ddmSettlementConfig.isShowStbsColumn && rcvDlyAs == 3) {
		showStbsCheckBox(wayBillId);
	} else {
		hideStbsCheckBox(wayBillId);
	}
}

function uniqueDataForBankPayment(wayBillId, rcvDlyAs) {
	if(deliveryPaymentType_0 <= 0) {
		$('#uniqueWayBillId').val(wayBillId);
		$('#uniquePaymentType').val(rcvDlyAs);
		$('#uniquePaymentTypeName').val($("#paymentType_" + wayBillId + " option:selected").text());
		$('#uniqueWayBillNumber').val($('#lrNumColumn' + wayBillId).text());
	} else {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
}

function cashSelected(wayBillId) {

	showDeliveredToRow(wayBillId);
	hideChequeDetailsRow(wayBillId);
	hideDeliveryCreditorRow(wayBillId);
	showPodRequiured(wayBillId);
	hideDeliveredToCollectionPersonRow(wayBillId);

	if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
		hideRecoveryBranchRow(wayBillId);

	$('#tdsAmount_' + wayBillId).attr('readonly', false);
}

function chequeSelected(wayBillId) {
	if(!ddmSettlementConfig.BankPaymentOperationRequired)
		showChequeDetailsRow(wayBillId);
	
	showDeliveredToRow(wayBillId);
	hideDeliveryCreditorRow(wayBillId);
	showPodRequiured(wayBillId);
	hideDeliveredToCollectionPersonRow(wayBillId);
	
	if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
		hideRecoveryBranchRow(wayBillId);
	
	$('#tdsAmount_' + wayBillId).attr('readonly', false);
}

function shortCreditSelected(wayBillId) {
	showDeliveredToRow(wayBillId);
	hideChequeDetailsRow(wayBillId);
	hideDeliveryCreditorRow(wayBillId);
	showPodRequiured(wayBillId);
	showDeliveredToCollectionPersonRow(wayBillId);
	
	if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
		showRecoveryBranchRow(wayBillId);
	
	$('#tdsAmount_' + wayBillId).attr('readonly', false);
}

function billCreditSelected(wayBillId) {
	showDeliveryCreditorRow(wayBillId);
	hideChequeDetailsRow(wayBillId);
	hideDeliveredToRow(wayBillId);
	showPodRequiured(wayBillId);
	hideDeliveredToCollectionPersonRow(wayBillId);
	
	if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
		hideRecoveryBranchRow(wayBillId);

	$('#tdsAmount_' + wayBillId).attr('readonly', true);
}

function receivedAtGodownSelected(wayBillId) {
	hideChequeDetailsRow(wayBillId);
	hideDeliveryCreditorRow(wayBillId);
	hideDeliveredToRow(wayBillId);
	hidePodRequiured(wayBillId);
	hideDeliveredToCollectionPersonRow(wayBillId);

	if(ddmSettlementConfig.showRecoveryBranchForShortCredit)
		hideRecoveryBranchRow(wayBillId);
	
	$('#tdsAmount_' + wayBillId).attr('readonly', false);
//	removeAllDeliveryChagres(wayBillId);
}

function removeAllDeliveryChagres(wayBillId) {
	for(var deliveryChargeId in activeDeliveryChargesGlobal) {
		if(activeDeliveryChargesGlobal.hasOwnProperty(deliveryChargeId))
			$('#delCharge_' + deliveryChargeId + '_' + wayBillId).val('');
	}
}

//This function called in createSingleRowForDDMLRDetailsNormalTable function
function createDeliveryDetailsTableForSingleRow(dlyDetailsColumn, wayBillId, waybillModels) {
	
	var deliveryDetailsTblClone	= $('#' + deliveryDetailsDefaultTblId).clone();
	
	//$(dlyDetailsColumn).append(deliveryDetailsTblClone);
	appendValueInTableCol(dlyDetailsColumn, deliveryDetailsTblClone);
	
	changeElementId(deliveryDetailsTblClone, deliveryDetailsTblId + '_' + wayBillId);

	var commonId	= '';
	var eleId		= '';
	var ele			= null;

	commonId	= '#' + dlyDetailsColumn.attr('id') + ' #' + deliveryDetailsTblClone.attr('id');

	//change row Id for each LR
	eleId	= commonId + ' #' + chequeDetailsRowId;
	ele		= $(eleId);

	changeElementId(ele, chequeDetailsRowId + '_' + wayBillId);

	eleId	= commonId +' #'+ DeliveryCreditorRowId;
	ele		= $(eleId);

	changeElementId(ele, DeliveryCreditorRowId + '_' + wayBillId);

	eleId	= commonId + ' #' + deliveredToRowId;
	ele		= $(eleId);

	changeElementId(ele, deliveredToRowId + '_' + wayBillId);
	
	eleId	= commonId + ' #' + deliveredToCollectionPersonRowId;
	ele		= $(eleId);

	changeElementId(ele, deliveredToCollectionPersonRowId + '_' + wayBillId);
	
	eleId	= commonId + ' #' + recoveryBranchRowId;
	ele		= $(eleId);

	changeElementId(ele, recoveryBranchRowId + '_' + wayBillId);

	//change column Id inside that LR's
	eleId	= commonId + ' #chequeDate';
	ele		= $(eleId);

	changeElementId(ele, 'chequeDate_' + wayBillId);
	changeElementName(ele, 'chequeDate_' + wayBillId);

	eleId	= commonId + ' #chequeNo';
	ele		= $(eleId);

	changeElementId(ele, 'chequeNo_' + wayBillId);
	changeElementName(ele, 'chequeNo_' + wayBillId);

	eleId	= commonId + ' #chequeAmount';
	ele		= $(eleId);

	changeElementId(ele, 'chequeAmount_' + wayBillId);
	changeElementName(ele, 'chequeAmount_' + wayBillId);

	eleId	= commonId + ' #bankName';
	ele		= $(eleId);

	changeElementId(ele, 'bankName_' + wayBillId);
	changeElementName(ele, 'bankName_' + wayBillId);

	eleId	= commonId + ' #selectedDeliveryCreditorId';
	ele		= $(eleId);

	changeElementId(ele, 'selectedDeliveryCreditorId_' + wayBillId);
	changeElementName(ele, 'selectedDeliveryCreditorId_' + wayBillId);

	eleId	= commonId + ' #deliveryCreditor';
	ele		= $(eleId);

	changeElementId(ele, 'deliveryCreditor_' + wayBillId);
	changeElementName(ele, 'deliveryCreditor_' + wayBillId);

	eleId	= commonId + ' #deliveredToName';
	ele		= $(eleId);

	changeElementId(ele, 'deliveredToName_' + wayBillId);
	changeElementName(ele, 'deliveredToName_' + wayBillId);

	eleId	= commonId + ' #deliveredToPhoneNo';
	ele		= $(eleId);

	changeElementId(ele, 'deliveredToPhoneNo_' + wayBillId);
	changeElementName(ele, 'deliveredToPhoneNo_' + wayBillId);
	
	eleId	= commonId + ' #searchCollectionPerson';
	ele		= $(eleId);

	changeElementId(ele, 'searchCollectionPerson_' + wayBillId);
	changeElementName(ele, 'searchCollectionPerson_' + wayBillId);
	
	eleId	= commonId + ' #selectedCollectionPersonId';
	ele		= $(eleId);

	changeElementId(ele, 'selectedCollectionPersonId_' + wayBillId);
	changeElementName(ele, 'selectedCollectionPersonId_' + wayBillId);
	
	eleId	= commonId + ' #recoveryBranch';
	ele		= $(eleId);

	changeElementId(ele, 'recoveryBranch_' + wayBillId);
	changeElementName(ele, 'recoveryBranch_' + wayBillId);
	
	eleId	= commonId + ' #recoveryBranchId';
	ele		= $(eleId);

	changeElementId(ele, 'recoveryBranchId_' + wayBillId);
	changeElementName(ele, 'recoveryBranchId_' + wayBillId);
	
	eleId	= commonId + ' #defaultRecoveryBranchId';
	ele		= $(eleId);

	changeElementId(ele, 'defaultRecoveryBranchId_' + wayBillId);
	changeElementName(ele, 'defaultRecoveryBranchId_' + wayBillId);

	if(!ddmSettlementConfig.isDeliveredToPhoneDisplay)	
		changeDisplayProperty('deliveredToPhoneNo_' + wayBillId, 'none');
	
	if(!ddmSettlementConfig.ValidateCollectionPersonNameInShortCredit)
		changeDisplayProperty('searchCollectionPerson_' + wayBillId, 'none');

	if(!ddmSettlementConfig.deliveredToNameFillWithDriverName && waybillModels.deliveredToName)
		$('#deliveredToName_' + wayBillId).val(waybillModels.deliveredToName);
	
	if(ddmSettlementConfig.deliveredToNumberFillWithDriverNumber && waybillModels.deliveredToNumber)
		$('#deliveredToPhoneNo_' + wayBillId).val(waybillModels.deliveredToNumber);
		
	if(ddmSettlementConfig.showRecoveryBranchForShortCredit){
		setRecoveryBranch(wayBillId,waybillModels.destinationBranchId,waybillModels.destinationBranch);
		$('#defaultRecoveryBranchId_' + wayBillId).val(waybillModels.destinationBranchId);		
	}else
		changeDisplayProperty('recoveryBranch_' + wayBillId, 'none');	
		
	//Called from DeliveryCreditorAutoComplete.js file
	initializeCreditorAutoComplete(wayBillId);
	initializeCollectionPersonAutoComplete(wayBillId);
	initializeSetRecoveryBranchAutoComplete(wayBillId);	
}

function validateLRDetails() {
	if(!ddmSettlementAllow) {
		showMessage('error', 'You cannot settle other Branch DDM !');
		return false;
	}
	
	hideReceiveButton();

	var tableEl = document.getElementById(lrDetailsTableNewId);

	var count 	= parseInt(tableEl.rows.length);
	var ch		= 0;
	var chkBox 	= null;
	
	if(ddmSettlementConfig.allowShortCreditPaymentForSavedParties) {
		var waybillArray = new Array();	
		
		for(var i = 1; i < count; i++) {
			chkBox = tableEl.rows[i].cells[0].children[0];
			
			if(chkBox && chkBox.checked) {
				if(!validateInput(1, 'paymentType_' + waybillId, 'paymentType_' + waybillId, '', receivedDeliveryAsErrMsg))
					return false;
				
				if($('#paymentType_' + chkBox.value).val() == PAYMENT_TYPE_CREDIT_ID && $('#consigneeCorporateAccountId_' + chkBox.value).val() == 0)
					waybillArray.push($('#wayBillNumber_' + chkBox.value).val());
			}
		}
		
		if(waybillArray.length > 0) {
			showMessage('info','Short Credit Delivery Of '+waybillArray.join()+'LRs not Allowed as Consignee not added in party master, please add it first for short credit payment. !');
			showReceiveButton();
			return false;
		}
	}
	
	let endKilometerRequired = typeof tripHisabProperties != 'undefined' && tripHisabProperties.tripHisabDDMRequired && tripHisabProperties.endKilometerRequired;
	
	if (endKilometerRequired || ddmSettlementConfig.showClosingKMField) {
		if ($('#endKilometerEle').exists() && ($('#endKilometerEle').val() == undefined || $('#endKilometerEle').val() == 'undefined' || $('#endKilometerEle').val() == 0)) {
			showMessage('info', 'Please enter end kilometer');
			$('#endKilometerEle').focus();
			showReceiveButton();
			return false;
		}
			
		if (ddmSettlementConfig.showClosingKMField && $('#endKilometerEle').val() <= $('#openingKilometerEle').val()) {
			showMessage('error', 'Closing KM must be more than Opening KM ' + $('#openingKilometerEle').val() + ' KM');
			$('#endKilometerEle').focus();
			showReceiveButton();
			return false;
		}
	}
	
	if(ddmSettlementConfig.shortCreditConfigLimitAllowed) {
		var totalShortCreditAmount = 0;

		for(var i = 1; i < count; i++) {
			chkBox = tableEl.rows[i].cells[0].children[0];
		
			if(chkBox && chkBox.checked) {
				var waybillId = chkBox.value;
				if(!validateInput(1, 'paymentType_' + waybillId, 'paymentType_' + waybillId, '', receivedDeliveryAsErrMsg))
					return false;
				
				if($('#paymentType_' + waybillId).val() == PAYMENT_TYPE_CREDIT_ID)
					totalShortCreditAmount = totalShortCreditAmount + Number($('#deliveryAmt_' + waybillId).val());
			}
		}

		if(shortCreditConfigLimit != null && shortCreditConfigLimit != 'null' 
			&& shortCreditConfigLimit != undefined &&  shortCreditConfigLimit != 'undefined'){
			if(shortCreditConfigLimit.creditType == 1){
				var waybillArray = new Array();	
				for(var i = 1; i < count; i++) {
					chkBox = tableEl.rows[i].cells[0].children[0];
					if(chkBox && chkBox.checked) {
						if(!validateInput(1, 'paymentType_' + waybillId, 'paymentType_' + waybillId, '', receivedDeliveryAsErrMsg))
							return false;
						
						if($('#paymentType_' + chkBox.value).val() == PAYMENT_TYPE_CREDIT_ID
							&& Number($('#deliveryAmt_' + chkBox.value).val()) > shortCreditConfigLimit.creditLimit)
							waybillArray.push($('#wayBillNumber_' + chkBox.value).val());
					}
				}
				
				if(waybillArray.length > 0){
					showMessage('info','Short Credit Limit Of '+shortCreditConfigLimit.creditLimit+' exceeded For LR Nos '+waybillArray.join() +' !');
					showReceiveButton();
					return false;
				}
			} else if(shortCreditConfigLimit.creditType == 2 && totalShortCreditAmount > 0 && totalShortCreditAmount > shortCreditConfigLimit.balance){
				showMessage('info','Short Credit Balance Limit Of '+shortCreditConfigLimit.balance+' exceeded !');
				showReceiveButton();
				return false;
			}
		}
	}

	for(var i = 1; i < count; i++) {
		chkBox = tableEl.rows[i].cells[0].children[0];
		
		if(chkBox && chkBox.checked) {
			ch = ch + 1;

			if(!validateSingleLR(chkBox.value)) {
				showReceiveButton();
				return false;
			}
		}
	}
	
	finallyReceivedWayBills(ch);
}

function checkGodown(wayBillId) {
	if(!godownExist && $('#paymentType_' + wayBillId).val() == 6) {
		showMessage('error', godownDoesNotExistErrMsg);
		changeError1('paymentType_' + wayBillId,'0','0');
		document.getElementById('paymentType_' + wayBillId).focus();
		$('#paymentType_' + wayBillId).val(0);
		return false;
	}

	return true;
}

//Called in GenericDDM.js file
function validateSingleLR(wayBillId) {
	if(ddmSettlementConfig.allowBackDateForSettlement){
		var ddmCreationDateVal 	= getDateFromString(ddmCreationDate);
		var ddmSettleDate   	= getDateFromString($("#DateEle"+ wayBillId).val());
		
		if(ddmCreationDateVal > ddmSettleDate){
			setTimeout(function() {
				showMessage('error','Settlement Date Cannnot Be Less Than DDM Creation Date !');
				$("#DateEle"+ wayBillId).focus();
				$("#DateEle"+ wayBillId).css('border-color','red');
			}, 200);
			backDateValid	= false;
			return false;
		} else {
			$("#DateEle"+ wayBillId).css('border-color','green');
			backDateValid	= true;
		}
	}
	
	if(!validateInput(1, 'paymentType_' + wayBillId, 'paymentType_' + wayBillId, '', receivedDeliveryAsErrMsg)
	|| !checkGodown(wayBillId))
		return false;
		
	if(ddmSettlementConfig.allowOtpBasedDDMSettlement && !validateInput(1, 'otpNumber_' + wayBillId, 'otpNumber_' + wayBillId, '', "Please Enter OTP!"))
		return false;

	var dlvryPmtTyp = $('#paymentType_' + wayBillId).val();
	var paidLoading = parseInt($('#paidLoading_' + wayBillId).val());
	var lrNo		= $('#wayBillNumber_' + wayBillId).val();
	var dlvrToNo 	= null;
	var allPmtType	= $('#deliveryPaymentType_0').val();
	
	if(dlvryPmtTyp == PAYMENT_TYPE_DUE_UNDELIVERED_ID) 
		return true;
	
	if(ddmSettlementConfig.BankPaymentOperationRequired) {
		if(ddmSettlementConfig.differentPaymentInMultiplePayment){
			if(!$('#paymentDataTr_0').exists() && isValidPaymentMode(deliveryPaymentType_0)) {
				showMessage('info', 'Please, Add Payment details !');
				return false;
			} else if(allPmtType != dlvryPmtTyp && isValidPaymentMode(dlvryPmtTyp) && !$('#paymentDataTr_' + wayBillId).exists()) {
				showMessage('info', '<i class="fa fa-info-circle"></i> Please, Add Payment details for this LR <font size="5" color="red">' + lrNo + '</font> !');
				return false;
			}
		} else {
			//DO Nothing
			if(deliveryPaymentType_0 > 0 && isValidPaymentMode(deliveryPaymentType_0)) {
				if($('#storedPaymentDetails').is(':empty')) {
					showMessage('info', 'Please, Add Payment details !');
					return false;
				}
			} else if(isValidPaymentMode(dlvryPmtTyp) && !$('#paymentDataTr_' + wayBillId).exists()) {
				showMessage('info', '<i class="fa fa-info-circle"></i> Please, Add Payment details for this LR <font size="5" color="red">' + lrNo + '</font> !');
				return false;
			}
		}
	} 
	
	if(!ddmSettlementConfig.BankPaymentOperationRequired && dlvryPmtTyp == PAYMENT_TYPE_CHEQUE_ID) {
		if(!validateInput(1, 'chequeDate_' + wayBillId, 'chequeDate_' + wayBillId, '', chequeDateErrMsg)) 
			return false;
	
		if(!validateDate(getValueFromInputField('chequeDate_' + wayBillId))) {
			showMessage('error', dateInProperFormatErrMsg);
			changeError1('chequeDate_' + wayBillId, '0', '0');
			document.getElementById('chequeDate_' + wayBillId).focus();
			return false;
		} else
			removeError('chequeDate_' + wayBillId);

		if(!validateInput(1, 'chequeNo_' + wayBillId, 'chequeNo_' + wayBillId, '', chequeNumberErrMsg)) 
			return false;
	
		if(document.getElementById('wayBillType_' +wayBillId) != null && document.getElementById('wayBillType_' + wayBillId).value == WAYBILL_TYPE_TO_PAY) {
			if(!validateInput(1, 'chequeAmount_' + wayBillId, 'chequeAmount_' + wayBillId, '', chequeAmountErrMsg))
				return false;
		}
	
		if(!validateInput(1, 'bankName_' + wayBillId, 'bankName_' + wayBillId, '', bankNameErrMsg)) 
			return false;
	
		if(!validateInput(1, 'deliveredToName_' + wayBillId, 'deliveredToName_' + wayBillId, '', deliverdNameErrMsg)) 
			return false;
	
	} else if(dlvryPmtTyp == PAYMENT_TYPE_BILL_CREDIT_ID) {
		if(paidLoading <= 0){
			if(!validateInput(1, 'selectedDeliveryCreditorId_' + wayBillId, 'deliveryCreditor_' + wayBillId, '', invalidCreditorNameErrMsg)) 
				return false;
		} else {
			alert("Please change Paid Loading charge with other charge for LR No. " + lrNo + " from Edit LR Rate because Paid Loading is only applicable for ToPay LR and after Bill Credit LR Type will Change From ToPay to TBB ! ");
			return false;
		}
	} else if ( dlvryPmtTyp!= null && (dlvryPmtTyp == PAYMENT_TYPE_CREDIT_ID && ddmSettlementConfig.ValidateCollectionPersonNameInShortCredit)) {
		if(!validateInput(1, 'selectedCollectionPersonId_' + wayBillId, 'searchCollectionPerson_' + wayBillId, '', invalidCollectionPersonNameErrMsg))
			return false;
		
		if($("#selectedCollectionPersonId_").val() == 0) {
			showMessage('error', invalidCollectionPersonNameErrMsg);
			enableButton();
			return false;
		}	
	} else  if(dlvryPmtTyp == PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID || dlvryPmtTyp == PAYMENT_TYPE_CROSSING_CREDIT_ID) {
		//do not validate
		//do not remove this condition
	} else if(!validateInput(1, 'deliveredToName_' + wayBillId, 'deliveredToName_' + wayBillId, '', deliverdNameErrMsg))
		return false;
	
	dlvrToNo 	= getValueFromInputField('deliveredToPhoneNo_' + wayBillId);

	if (dlvrToNo == '' || dlvrToNo == ' ')
		setValueToTextField('deliveredToPhoneNo_' + wayBillId, '0000000000');
	
	if(ddmSettlementConfig.isDiscountShow) {
		var disc = getValueFromInputField("discount_" + wayBillId);

		if (disc > 0 && !validateInput(1, 'discountTypes_' + wayBillId, 'discountTypes_' + wayBillId, '', discountTypeErrMsg))
			return false;
	}

	if(isTDSAllow && isPanNumberRequired) {
		let panNumber	= $('#panNumber_' + wayBillId);
		
		if(panNumber.exists() && panNumber.val() != '') {
			if(!checkValidPanNum('panNumber_' + wayBillId)) return false;
		}

		if(isPanNumberMandetory && ($('#tdsAmount_' + wayBillId).val() > 0 && (panNumber.val() == '' || panNumber.val() == undefined))) {
			showMessage('error', ' Please Enter PAN Number!');
			panNumber.focus();
			return false;
		}
	}
	
	if(Number($('#ctoDetainStatusCol'+wayBillId).html()) == 1){
		showMessage('error','You Can Not Do Settelement Of ' + ddmSettlementConfig.ctoDetainStatusName + ' LR Please Remove LR No. :' + $('#lrNumColumn'+wayBillId).html());
		return false;
	}

	return !(dlvryPmtTyp != PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID
		&& !validateDiscountLimit(discountInPercent, totAmt , $('#discount_' + wayBillId).val(), $('#discount_' + wayBillId)));
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
			
		if(element != undefined && element != null)
			changeTextFieldColorNew(element, '', '', 'red');

		return false;
	}

	return true;
}

function finallyReceivedWayBills(ch) {
	var doneTheStuff		 = false;
	
	if(ch == 0) {
		showMessage('error', selectLrToReceiveErrMsg);
		showReceiveButton();
	} else {
		var answer = confirm ("Receive " + ch + " LR?");

	if(answer) {
		 if(!doneTheStuff) {
			//require(["ddmSettlement/SaveDDMSettlement"], function(result1) {
				setTimeout(function(){ console.log(''); }, 4000);
				doneTheStuff = true;
				//Called from GenericDDMSettlement.js
				hideReceiveButton();
				showLayer();
				saveSettlementData();

			//});
		 }	
		} else {
			doneTheStuff = false;
			showReceiveButton();
			return false;
		};
	};
}

function calcSlctdAmntType(){
	var tableEl 	= document.getElementById(lrDetailsTableNewId);

	for(var i = 1; i < tableEl.rows.length - 1; i++){
		$('#totalCashLRs').val(0);
		$('#totalChequeLRs').val(0);
		$('#totalShortCreditLRs').val(0);
		$('#totalBillCreditLRs').val(0);
		$('#totalBalanceLRs').val(0);
		$('#netReceived').val(0);
		$('#shortCreditAmt').val(0);
		$('#billCreditAmt').val(0);
		$('#cashAmt').val(0);
		$('#chequeAmt').val(0);
		$('#totalShort').val(0);
		$('#netBalance').val(0);

		var cash 			= 0;
		var cheque 			= 0;
		var shortCredit 	= 0;
		var billCredit 		= 0;
		var recAtGdwn 		= 0;
		var netRecievedAmnt = 0;
		var shortCreditAmnt = 0;
		var billCreditAmnt 	= 0;
		var cashAmnt 		= 0;
		var chequeAmnt 		= 0;
		var discount 		= 0;//do not remove this
		var checkNan 		= false;
		var totalShort 		= 0;

		for(var j = 1; j < tableEl.rows.length; j++) {
			if(tableEl.rows[j].cells[0].children[0] != undefined) {
				wayBillId 	= tableEl.rows[j].cells[0].children[0].value;
				checkNan	= false;

				if (ddmSettlementConfig.isDiscountShow)
					checkNan = isNaN(parseInt($('#discount_' + wayBillId).val()));

				if($('#wayBillType_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) {
					var amntType 	= 0;

					if(tableEl.rows[j].cells[0].children.length > 0) {
						if(tableEl.rows[j].cells[0].children[0].checked){
							amntType	= $('#paymentType_' + wayBillId).val();

							if(amntType == PAYMENT_TYPE_CASH_ID) {
								cash++;
								$('#totalCashLRs').val(cash);

								netRecievedAmnt	+= parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());
								$('#netReceived').val(netRecievedAmnt);

								cashAmnt 		+= parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());
								$('#cashAmt').val(cashAmnt);

								if (ddmSettlementConfig.isDiscountShow)
									checkNan = isNaN(parseInt($('#discount_' + wayBillId).val()));

								if(!checkNan && ddmSettlementConfig.isDiscountShow)
									discount += parseInt($('#discount_' + wayBillId).val());
							} else if(amntType == PAYMENT_TYPE_CHEQUE_ID) {
								cheque++;
								$('#totalChequeLRs').val(cheque);

								netRecievedAmnt += parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());
								$('#netReceived').val(netRecievedAmnt);

								chequeAmnt 		+= parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());
								$('#chequeAmt').val(chequeAmnt);

								if(!checkNan && ddmSettlementConfig.isDiscountShow)
									discount 	+= parseInt($('#discount_' + wayBillId).val());
							} else if(amntType == PAYMENT_TYPE_CREDIT_ID) {
								shortCredit++;
								$('#totalShortCreditLRs').val(shortCredit);

								shortCreditAmnt 	+= parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());

								$('#shortCreditAmt').val(shortCreditAmnt);
						
								if(ddmSettlementConfig.isDiscountShow)
									discount += parseInt($('#discount_' + wayBillId).val());
								totalShort 	= totalShort + 1;
								$('#totalShort').val(totalShort);
							} else if(amntType == PAYMENT_TYPE_BILL_CREDIT_ID) {
								billCredit++;
								$('#totalBillCreditLRs').val(billCredit);

								billCreditAmnt 		+= parseInt($('#bookingTimeGrandTotal_' + wayBillId).val());
								$('#billCreditAmt').val(billCreditAmnt);
								
								if (ddmSettlementConfig.isDiscountShow) 
									discount += parseInt($('#discount_' + wayBillId).val());
							} else if(amntType == PAYMENT_TYPE_DUE_UNDELIVERED_ID) {
								recAtGdwn++;
								$('#totalBalanceLRs').val(recAtGdwn);
							};
						};

						$('#netBalance').val(parseInt(Math.round($('#totalValueLRs').val()) - netRecievedAmnt));
					};
				};
			}
		};
	};
}

function selectAllWayBills(param) {
	var tab 	= document.getElementById(lrDetailsTableNewId);
	var count 	= parseFloat(tab.rows.length - 1);
	var row;

	for (row = count; row > 0; row--) {
		if(tab.rows[row].cells[0].firstElementChild)
			tab.rows[row].cells[0].firstElementChild.checked = param;
	}
}

function validateDate(str) {
	var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
	return (m) ? true : false;
}

//Called in GenericDDMSettlement.js
function displayLRDetailsTable(waybillModels, activeDeliveryCharges, paymentTypePermissions, discountTypes, wbIdWiseDeliveryCharges, panNumberHM, lrColl,wayBillDetails) {
	if(!waybillModels || jQuery.isEmptyObject(waybillModels))
		return;

	var	waybillModel	= null;
	var	bookingCharges	= null;
	
	if(ddmSettlementConfig.showPaymentTypeForAllLR ){
		removeOption('deliveryPaymentType_0', null);
		createPaymentTypeForAllLR(paymentTypePermissions);
	} else if(document.getElementById('paymentTypeDiv'))
		document.getElementById('paymentTypeDiv').style.display = 'none';
	
	backDateForAll();
	backTimeForAll();
	//Called from top
	activeDeliveryChargesArr	= activeDeliveryCharges;
	generateLRWiseSettlementTableSimple(activeDeliveryCharges);

	for(var i = 0; i < waybillModels.length; i++) {
		waybillModel 	= waybillModels[i];

		if(!waybillModel || jQuery.isEmptyObject(waybillModel))
			continue;

		if(ddmSettlementConfig.calculateUnloadingChargeOnFreight && wayBillDetails != null && !jQuery.isEmptyObject(wayBillDetails) && wayBillDetails != undefined){
			bookingCharges	=	wayBillDetails[waybillModel.wayBillId].wayBillCharges;
		}

		//Called from top
		createSingleRowForDDMLRDetailsNormalTable(waybillModel, i+1, activeDeliveryCharges, paymentTypePermissions, discountTypes, wbIdWiseDeliveryCharges, panNumberHM, lrColl, bookingCharges);
	}
	
	if(ddmSettlementConfig.showPaymentTypeForAllLR  && ddmSettlementConfig.isDefaultPaymentTypeSelected){
		var triggerPaymentModeForAll 	= document.getElementById('deliveryPaymentType_0');
		triggerPaymentModeForAll.value	= ddmSettlementConfig.defaultPaymentTypeSelected;
		triggerPaymentModeForAll.dispatchEvent(new Event('change'));
	}
}

function createCheckBox(parentEle, checkBoxValue) {

	var createCheckBox			= new Object();
	createCheckBox.type			= 'checkbox';
	createCheckBox.id			= 'wayBills';
	createCheckBox.name			= 'wayBills';
	createCheckBox.value		= checkBoxValue;
	createCheckBox.onclick		= 'calcSlctdAmntType()';
	
	return createInput(parentEle, createCheckBox);
}
function createStbsCheckBox(parentEle, wayBillId) {

	var createCheckBox			= new Object();
	createCheckBox.type			= 'checkbox';
	createCheckBox.id			= 'stbsCheckBoxId_'+wayBillId;
	createCheckBox.name			= 'stbsCheckBoxId_'+wayBillId;
	createCheckBox.value		= wayBillId;
	createCheckBox.style		= 'display:none';

	return createInput(parentEle, createCheckBox);
}

function resetsettlementLRTbl() {

	removeTableData('lrDetailsTableNew');
}

function hideDDMTableHeading() {
	if(!ddmSettlementConfig.isFromColumnDisplay)
		hideShowTableCol('fromCol', 'hide');

	if(!ddmSettlementConfig.isToColumnDisplay)
		hideShowTableCol('toCol', 'hide');

	if(!ddmSettlementConfig.isConsineeNameColumnDisplay)
		hideShowTableCol('cneeNameCol', 'hide');

	if(!ddmSettlementConfig.isConsineeNumberColumnDisplay)
		hideShowTableCol('cneeNoCol', 'hide');

	if(!ddmSettlementConfig.isLRTypeColumnDisplay)
		hideShowTableCol('lrTypeCol', 'hide');

	if(!ddmSettlementConfig.isBookingTotalDisplay)
		hideShowTableCol('bookingTotalCol', 'hide');

	if(!ddmSettlementConfig.isAmountColumnDisplay)
		hideShowTableCol('amtCol', 'hide');

	if(!ddmSettlementConfig.isArtColumnDisplay)
		hideShowTableCol('artCol', 'hide');

	if(!ddmSettlementConfig.isActBookedWeightColumnDisplay)
		hideShowTableCol('actBkgWgtCol', 'hide');

	if(!ddmSettlementConfig.isRemarkColumnDisplay)
		hideShowTableCol('remarkCol', 'hide');

	if(!ddmSettlementConfig.isReceiveAmountColumnDisplay)
		hideShowTableCol('receivedAmountCol', 'hide');

	if(!ddmSettlementConfig.isDeliveryAmountColumnDisplay)
		hideShowTableCol('deliveryAmtAmountCol', 'hide');
	
	hideShowTableCol('paidLoadingTotalCol', 'hide');
	
	if(!ddmSettlementConfig.isCommissionAmountColumnDisplay)
		hideShowTableCol('commissionCol', 'hide');

	if(!isPanNumberRequired)
		hideShowTableCol('panNumberCol', 'hide');

	if(!isTDSAllow)
		hideShowTableCol('tdsCol', 'hide');
	
	if(!ddmSettlementConfig.isServiceTaxPaidByShow) {
		hideShowTableCol('stPaidByCol', 'hide');
		hideShowTableCol('stCol', 'hide');
	}

	if(!ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		hideShowTableCol('manualCRNoCol', 'hide');

}

function hideDDMTableColumns(counter) {
	if(!ddmSettlementConfig.isFromColumnDisplay)
		hideShowTableCol('fromColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isToColumnDisplay)
		hideShowTableCol('toColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isConsineeNameColumnDisplay)
		hideShowTableCol('cneeNameColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isConsineeNumberColumnDisplay)
		hideShowTableCol('cneeNoColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isLRTypeColumnDisplay)
		hideShowTableCol('lrTypeColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isBookingTotalDisplay)
		hideShowTableCol('bkgTotalColumn' + counter, 'hide');
	
	if(!ddmSettlementConfig.isAmountColumnDisplay)
		hideShowTableCol('amtColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isArtColumnDisplay)
		hideShowTableCol('artColumn' + counter, 'hide');
		
	if(!ddmSettlementConfig.isActBookedWeightColumnDisplay)
		hideShowTableCol('actBkgWgtColumn' + counter, 'hide');
	
	if(!ddmSettlementConfig.isRemarkColumnDisplay)
		hideShowTableCol('remarkColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isDeliveryDetailsColumnDisplay)
		hideShowTableCol('cneeNameColumn' + counter, 'hide');

	if(!ddmSettlementConfig.isReceiveAmountColumnDisplay)
		hideShowTableCol('receivedAmountCol' + counter, 'hide');

	if(!ddmSettlementConfig.isDeliveryAmountColumnDisplay)
		hideShowTableCol('deliveryAmtAmountCol' + counter, 'hide');

	if(!isPanNumberRequired)
		hideShowTableCol('panNumber' + counter, 'hide');
	
	hideShowTableCol('paidLoadingColumn' + counter, 'hide');

	if(!isTDSAllow)
		hideShowTableCol('tds' + counter, 'hide');

	if(!ddmSettlementConfig.isServiceTaxPaidByShow){
		hideShowTableCol('stPaidByCol'+ counter, 'hide');
		hideShowTableCol('stCol' + counter, 'hide');
	}

	if(!ddmSettlementConfig.isAllowManualCRWithoutSeqCounter)
		hideShowTableCol('manualCRNoCol' + counter, 'hide');

}

function hideDeliveryChargesCol(deliveryChargeId, counter) {
	if(deliveryChargeIds == 0) {
		hideShowTableCol('col_delivery_' + deliveryChargeId + counter, 'show');
	} else if(chargeIdArray != null) {
		for(var i = 0; i < chargeIdArray.length; i++) {
			if(chargeIdArray[i] == deliveryChargeId)
				hideShowTableCol('col_delivery_' + deliveryChargeId + counter, 'show');
		}
	}
}

function calulateBillAmount(wayBillId, wayBillTypeId, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn) {
	if(!validatePaymentTypeSelection(wayBillId))
		return false;

	if(wayBillTypeId != WAYBILL_TYPE_FOC) {
		var amount		= 0;
		var totalAmount = 0;
		var discount    = 0;

		for(var id in activeDeliveryChargesGlobal) {
			amount		= 0;

			if(!isNaN($('#delCharge_' + id + '_' + wayBillId).val())) {
				amount = Number($("#delCharge_" + id + "_" + wayBillId).val());

				if(amount != '')
					totalAmount = parseFloat(amount) + parseFloat(totalAmount);
			}
		}

		if($('#discount_' + wayBillId).exists() && $('#discount_' + wayBillId).val() != '')
			discount	= $('#discount_' + wayBillId).val();
	}

	$('#deliveryAmt_' + wayBillId).val(parseFloat(totalAmount) - parseFloat(discount));

	if(isNaN($('#deliveryAmt_' + wayBillId).val()))
		$('#deliveryAmt_' + wayBillId).val(0);

	if(ddmSettlementConfig.isServiceTaxPaidByShow)
		calculateDeliveryTimeST(wayBillId, wayBillTypeId, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn);

	setChequeAmount(wayBillId); 

	if(isTDSAllow)
		calTDSAmount('', wayBillId, wayBillTypeId);
}

function setChequeAmount(wayBillId) {

	if(document.getElementById('paymentType_' + wayBillId)) {
		if($('#paymentType_' + wayBillId).val() == PAYMENT_TYPE_CHEQUE_ID) {
			if($('#actBillAmount_' + wayBillId).val() != '')
				$('#chequeAmount_' + wayBillId).val($('#actBillAmount_' + wayBillId).val());
		} else
			$('#chequeAmount_' + wayBillId).val(0);
	}
}

function calculateDeliveryTimeST(wayBillId, wayBillTypeId, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn) {
	var billAmt			= parseInt($('#deliveryAmt_' + wayBillId).val());
	var id 				= 'delCharge_' + OCTROI_DELIVERY + '_' + wayBillId;
	var octObj			= document.getElementById(id);
	var octroiAmt		= '0';

	if(octObj && octObj.value != '')
		octroiAmt	= parseInt(octObj.value);

	var calculateSTOn	= billAmt - octroiAmt;
	var isSTAllow		= false;
	var grandTotal		= $('#wayBillGrandTotal_' + wayBillId).val();
	var deliveryAmount	= $('#wayBillDeliveryAmount_' + wayBillId).val();
	var deliveryDiscount= $('#wayBillDeliveryDiscount_' + wayBillId).val();
	var taxBy			= parseInt($('#taxBy_' + wayBillId).val()) ;
	var STPaidBy 		= $('#STPaidBy_' + wayBillId).val();

	if(!document.getElementById('bookingTaxTxn_' + wayBillId))
		calculateSTOn 	= parseInt(calculateSTOn) + parseInt(grandTotal - (parseInt(deliveryAmount) - parseInt(deliveryDiscount)));
	else
		isSTAllow 		= true;

	if((taxBy == TAX_PAID_BY_CONSINGOR_ID
			|| taxBy == TAX_PAID_BY_CONSINGEE_ID)
			&& (wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_TO_PAY)) {

		calculateSTOn = parseInt(calculateSTOn) + parseInt(grandTotal - (parseInt(deliveryAmount) - parseInt(deliveryDiscount)));
	}

	//Called from calculateDeliveryGSTTax.js file 
	calculateDDMGSTTaxes(taxes, wayBillId, STPaidBy, calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, isSTAllow);

	if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		$('#deliveryAmt_' + wayBillId).val(parseInt($('#deliveryAmt_' + wayBillId).val()) + parseInt(grandTotal - (deliveryAmount - deliveryDiscount)));
}

function validatePaymentTypeSelection(wayBillId) {
	var paymentTypeId	= $('#paymentType_' + wayBillId).val();

	if(paymentTypeId == 0) {
		showMessage('error', paymentTypeErrMsg);
		changeTextFieldColor('paymentType_' + wayBillId, '', '', 'red');
		return false;
	}

	return true;
}

function loadPodDocumentSelection(wayBillId , counter){
	var select = $('#podStatusColumn_' + wayBillId).val();
	
	if(podConfiguration.showPODDocuments) {
		if(select == '2')
			document.getElementById('podDocType'+ counter).style.visibility = "visible";
		else
			document.getElementById('podDocType'+ counter).style.visibility = "hidden";
	}
}

function destroyMultiselectPodDocumentType(wayBillId) {
	$('#podDocType_'+ wayBillId).multiselect('destroy');
}

function multiselectPodDocumentType(wayBillId) {
	destroyMultiselectPodDocumentType(wayBillId);

	$('#podDocType_' + wayBillId).multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	});
}

function createInputForReceiverName(wayBillId,receiverName){
	var receiverToName	= $("<input/>", { 
		type			: 'text', 
		id				: 'receiverName_' + wayBillId,
		class			: 'width-100px text-align-right', 
		name			: 'receiverName_' + wayBillId,
		value			: receiverName,
		maxlength		: 100,
		placeholder		: 'Receiver Name'});

	return receiverToName;
}

function createPaymentTypeForAllLR(paymentTypePermissions){
	var  paymentModeForAll    = document.getElementById('deliveryPaymentType_0');
	
	if(paymentTypePermissions && !jQuery.isEmptyObject(paymentTypePermissions) && paymentModeForAll) {
		createOption('deliveryPaymentType_0', 0, '--Select Mode--');
		
		for(var id in paymentTypePermissions) {
			if(paymentTypePermissions.hasOwnProperty(id))
				createOption('deliveryPaymentType_0', id, paymentTypePermissions[id]);
		}
	}
	
	document.getElementById('paymentTypeDiv').style.display = 'block';
}

function backDateForAll(){
	$("#backDateForAll").datepicker({
		showAnim	: "fold",
		maxDate		: new Date(curDate),
		defaultDate	: new Date(curDate),
		minDate	: backDate,
		dateFormat	: 'dd-mm-yy',
		onSelect: function(date) {
		    setBackDateForAll(date);
		}
		
	});
	$('#backDateForAll').val(dateWithDateFormatForCalender(curDate,"-"));
	
}

var curTime = "12:00 AM";

function backTimeForAll() {
	$("#backTimeForAll").timepicker({
		showMeridian	: true,
		defaultTime		: curTime
			
	});
	$('#backTimeForAll').val(timeWithTimeFormatForCalender(curTime,"-"));
	$(".ui-corner-all").on("click", function() {
    setBackTimeForAll(this);
});
}

function setBackTimeForAll() {
	
    if (!waybillModelsGlobal || jQuery.isEmptyObject(waybillModelsGlobal))
        return;

    for (var i = 0; i < waybillModelsGlobal.length; i++) {
        var waybillModel = waybillModelsGlobal[i];

        if (!waybillModel || jQuery.isEmptyObject(waybillModel))
            continue;

        $("#TimeEle" + waybillModel.wayBillId).val($('#backTimeForAll').val());
    }
}


function setBackDateForAll(date) {
	var backDateParse 		= date.split("-");

	if(!waybillModelsGlobal || jQuery.isEmptyObject(waybillModelsGlobal))
		return;
	
	for(var i = 0; i < waybillModelsGlobal.length; i++) {
		waybillModel 	= waybillModelsGlobal[i];

		if(!waybillModel || jQuery.isEmptyObject(waybillModel))
			continue;
		
		//$("#DateEle"+ waybillModel.wayBillId).val(dateWithDateFormatForCalender(date,"-"));
		$("#DateEle"+ waybillModel.wayBillId).datepicker('setDate', new Date(backDateParse[2], backDateParse[1] - 1, backDateParse[0]));
	}
}


function setPaymentTypeForAllLR(){
	if(!waybillModelsGlobal || jQuery.isEmptyObject(waybillModelsGlobal))
		return;
	
	$( "#storedPaymentDetails" ).empty();
	deliveryPaymentType_0  = document.getElementById('deliveryPaymentType_0').value;

	for(var i = 0; i < waybillModelsGlobal.length; i++) {
		waybillModel 	= waybillModelsGlobal[i];

		if(!waybillModel || jQuery.isEmptyObject(waybillModel))
			continue;

		if(waybillModel.paymentType <= 0) {
			if(deliveryPaymentType_0 == PAYMENT_TYPE_BILL_CREDIT_ID && 
				waybillModel.wayBillTypeId != WAYBILL_TYPE_TO_PAY) {
				
				$('#paymentType_' + waybillModel.wayBillId+' option').each(function() {
					if(this.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
						this.disabled = true;
					}
				});
			} else {
				if(!ddmSettlementConfig.differentPaymentInMultiplePayment){
					if(deliveryPaymentType_0 > 0)
						$("#paymentType_" + waybillModel.wayBillId).attr('readonly', 'readonly');
					else
						$("#paymentType_" + waybillModel.wayBillId).removeAttr('readonly');
				}
				
				$('#paymentType_' + waybillModel.wayBillId).val(deliveryPaymentType_0);
				$('#paymentType_' + waybillModel.wayBillId).change();
			}
		}
	}
	
	if(ddmSettlementConfig.differentPaymentInMultiplePayment){
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val("All");
		$('#uniquePaymentType').val($('#deliveryPaymentType_0').val());
		$('#uniquePaymentTypeName').val($("#deliveryPaymentType_0 option:selected").text());
	}
	
	if(typeof hideShowBankPaymentTypeOptions != 'undefined')
		hideShowBankPaymentTypeOptions(document.getElementById('deliveryPaymentType_0'));
}

function showHideAllChequeDetails(obj) {
	if(ddmSettlementConfig.BankPaymentOperationRequired)
		return;
	
	if(obj.value == PAYMENT_TYPE_CHEQUE_ID){
		document.getElementById('allLRchequeNumber').style.display = 'block';
		document.getElementById('allLRbankName').style.display = 'block';
		document.getElementById('allLRchequeDate').style.display = 'block';
	} else {
		document.getElementById('allLRchequeNumber').style.display = 'none';
		document.getElementById('allLRbankName').style.display = 'none';
		document.getElementById('allLRchequeDate').style.display = 'none';
		document.getElementById('allLRchequeNumber').value = '';
		document.getElementById('allLRbankName').value = '';
		document.getElementById('allLRchequeDate').value = '';
	}
}

function setChequeDetailsForAllLR(obj){
	for(var i = 0; i < waybillModelsGlobal.length; i++) {
		waybillModel 	= waybillModelsGlobal[i];

		if(!waybillModel || jQuery.isEmptyObject(waybillModel))
			continue;

		if(obj.id == 'allLRchequeNumber') {
			document.getElementById('chequeNo_' + waybillModel.wayBillId).value   = obj.value;
			
			if(document.getElementById('wayBillType_' + waybillModel.wayBillId) != null && document.getElementById('wayBillType_' + waybillModel.wayBillId).value == WAYBILL_TYPE_TO_PAY) 
				document.getElementById('chequeAmount_' + waybillModel.wayBillId).value   = waybillModel.bookingAmount;
		}
		
		if(obj.id == 'allLRbankName')
			document.getElementById('bankName_' + waybillModel.wayBillId).value   = obj.value;
		
		if(obj.id == 'allLRchequeDate')
			document.getElementById('chequeDate_' + waybillModel.wayBillId).value = obj.value;
	}
}

function getDateFromString(date){
	var parts = date.split("-");
	return new Date(parts[2], parts[1] - 1, parts[0]);
}

function addWayBillExpense(wayBillId, consigneeCorpAccountId) {
	childwin = window.open ("addWayBillExpense.do?pageId=340&eventId=2&modulename=addWayBillExpense&wayBillId=" + wayBillId + "&consigneeCorpAccountId=" + consigneeCorpAccountId +'&isRedirectAllow=false',"newwindow",config="height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function validateShortCreditAllowOnTxnType(id) {
	var shortCreditTxnType  = 0;
	
	if(shortCreditAllowOnTxnTypeHM && shortCreditAllowOnTxnTypeHM.hasOwnProperty(id)) 
		shortCreditTxnType 			= shortCreditAllowOnTxnTypeHM[id];
		
	if(ddmSettlementConfig.validateShortCreditAllowOnTxnTypeWithSubRegion) {
		var subRegionList 		= (ddmSettlementConfig.subRegionIdsForShortCredit).split(',');
		var checkSubRegion 		= isValueExistInArray(subRegionList, subRegionId);
		let paymentType			= $('#paymentType_' + id).val();
		
		if(checkSubRegion && paymentType == PAYMENT_TYPE_CREDIT_ID && !(shortCreditTxnType == SHORT_CREDIT_TXN_TYPE_DELEIVERY || shortCreditTxnType == SHORT_CREDIT_TXN_TYPE_BOTH)) {
			showMessage('error', "Short Credit Delivery Not Allowed For This Party !");
			$('#paymentType_' + id).val(0);
		}
	}
}

function initializeCollectionPersonAutoComplete(wbId) {
	$("#searchCollectionPerson_"+wbId).autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+$("#branchId").val()+"&responseFilter=1",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0)
				document.getElementById('selectedCollectionPersonId_' + wbId).value = ui.item.id;
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function initializeSetRecoveryBranchAutoComplete(wbId) {
	$("#recoveryBranch_"+wbId).autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0)
				setRecoveryBranch(wbId,ui.item.id,ui.item.label);
				
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function resetCollectionPerson (ele) {
	if(document.getElementById('selectedCollectionPersonId_'+ele.id.split("_")[1]))
		document.getElementById('selectedCollectionPersonId_'+ele.id.split("_")[1]).value = 0;
}

function resetRecoveryBranch (ele) {
	if(document.getElementById('recoveryBranch_'+ele.id.split("_")[1]))
		document.getElementById('recoveryBranchId_'+ele.id.split("_")[1]).value = document.getElementById('defaultRecoveryBranchId_'+ele.id.split("_")[1]).value;
}

function setRecoveryBranch(wbId, branchId, branchName) {
	document.getElementById('recoveryBranchId_' + wbId).value = branchId;
	document.getElementById('recoveryBranch_' + wbId).value = branchName;
} 

function showShortCreditDueAmout(obj,consigneeName , corporateAccId){
	if (ddmSettlementConfig.showShortCreditOutstandingAmount == "true" || ddmSettlementConfig.showShortCreditOutstandingAmount == true) {
		if (obj.value == PAYMENT_TYPE_CREDIT_ID) {
			let jsonObject = new Object();
			jsonObject["corporateAccountId"] = corporateAccId;
			$.ajax({
				type: "POST",
				url: WEB_SERVICE_URL + '/creditPaymentModuleWS/getShortCreditDueAmount.do',
				data: jsonObject,
				dataType: 'json',
				success: function(data) {
					if(data.outStandingAmount > 0){
					$('#NameforPopup').html(`The Previous Short Credit Amount of <b>${consigneeName}</b> is  Rs `)
					$('#AmountSection').html(data.outStandingAmount)
					$('#exampleModalforShortCredit').modal('show')
					localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
					$(() => {
						$('#AmountSection').on('click', function() {
							childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditOutStandingReportLR&masterid=&tab=6", "_blank");
						})
					})
				}
				}
			});
		}
	}
}


function validateOtp(enteredValue, wayBillId, otpNumber) {
	if (enteredValue.value != otpNumber) {
		showMessage('error', "Please Enter Valid OTP!");
		hideReceiveButton();
		$(enteredValue).addClass("is-invalid");

		otpIsValid = false;
		setTimeout(() => {
			enteredValue.focus();
		}, 100);
	} else {
		$(enteredValue).removeClass("is-invalid");
		otpIsValid = true;
		showReceiveButton();
	}
}


function handleOtpKeyDown(event, inputElement, wayBillId, otpNumber) {
	const key = event.key;

	if (key === "Enter" || key === "Tab") {
		if (inputElement.value != otpNumber) {
			showMessage('error', "Please Enter Valid OTP!");
			hideReceiveButton();
			$(inputElement).addClass("is-invalid");
			event.preventDefault();
			setTimeout(() => {
				inputElement.focus();
			}, 100);

			return false;
		} else {
			$(inputElement).removeClass("is-invalid");
			showReceiveButton();
		}
	}
	return true;
}


