/**
 * 
 */
let discountInPercent = 0;
let BillDetailsForBillClearanceAll = null;
let allowRoundOffAmount	= false;

function setBillDetailsData(response) {
	let BillClearanceDetails			= response.BillClearanceDetails;
	let BillDetailsForBillClearance		= response.BillDetailsForBillClearance;
	let CrossingAgentMaster				= response.crossingAgentMaster;
	BillDetailsForBillClearanceAll		= response.BillDetailsForBillClearance;
	isTDSAllow							= response.isTDSAllow;
	allowRoundOffAmount				= response.allowRoundOffAmount;

	if(response.discountInPercent != undefined)
		discountInPercent = response.discountInPercent;
	
	if(isTDSAllow)
		$('.tdsColumn').removeClass('hide');
	
	showPartOfPage('bottom-border-boxshadow');

	$("*[data-agent-name='agentName']").html(CrossingAgentMaster.name);
	$("*[data-agent-type='type']").html(response.txnTypeName);

	let totalAmount 				= 0.0;
	let grandTotalReceivedAmount	= 0.0;
	let grandTotalBalanceAmount		= 0.0;
	
	createPaymentModeSelectionForAll(PaymentTypeConstantArray);

	for(let i = 0; i < BillDetailsForBillClearance.length; i++) {
		let billClearance		= BillDetailsForBillClearance[i];

		let status				= billClearance.status;
		
		let tdsAmountCol			= null;
		let supplierNoCol			= null;
		let supplierDateCol			= null;
		let billNumberLinkAttr		= null;

		if(billClearance.status != PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
			let srNo					= i + 1;
			let billNumber				= billClearance.billNumber;
			let crossingAgentBillId		= billClearance.crossingAgentBillId;
			let crossingAgentId			= billClearance.crossingAgentId;
			let receivedAmtLimit		= 0;
			let crossingAgentName		= billClearance.crossingAgentName;
			let creationDateTimeString	= billClearance.creationDateTimeString;
			let branchName				= billClearance.branchName;
			let crossingHire			= billClearance.crossingHire;
			let supplierNo				= billClearance.supplierBillNo;
			let supplierDateString		= billClearance.supplierBillDateString;
			
			if(allowRoundOffAmount)
				crossingHire = Math.round(crossingHire);
			else
				crossingHire = toFixedWhenDecimal(crossingHire);
			
			totalAmount					+= crossingHire;
			grandTotalBalanceAmount		+= crossingHire;

			let tableRow				= createRowInTable('', '', '');

			let srNoCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
			let billNoCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			let dateTimeCol				= createColumnInRow(tableRow, 'billDate_' + srNo, '', '', '', '', '');
			let branchCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(isShowSupplierBillNo)
				supplierNoCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(isShowSupplierBillDate)
				supplierDateCol			= createColumnInRow(tableRow, '' + srNo, '', '', '', '', '');
			
			let paymentModeCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			let remarkCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			let paymentStatusCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			let totalAmountCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			let receivedAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			let receiveAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(isTDSAllow)
				tdsAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');

			let balanceAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');

			appendValueInTableCol(srNoCol, srNo);
			appendValueInTableCol(srNoCol, createBillNumberField(billNumber, srNo));
			appendValueInTableCol(srNoCol, createBillIdField(crossingAgentBillId, srNo));
			appendValueInTableCol(srNoCol, createCreditorIdFeild(crossingAgentId, srNo));
			appendValueInTableCol(srNoCol, createReceivedAmtLimitFeild(receivedAmtLimit, srNo));

			if(invoicePrintHyperlinkOnInvoiceNumber)
				billNumberLinkAttr		= createLinkForBillNumberPrint(crossingAgentBillId, billNumber);
			else
				billNumberLinkAttr		= createLinkForBillNumber(crossingAgentBillId, billNumber, status, crossingAgentName);

			appendValueInTableCol(billNoCol, billNumberLinkAttr);
			appendValueInTableCol(dateTimeCol, creationDateTimeString);
			appendValueInTableCol(branchCol, branchName);
			
			if(supplierNoCol != null) appendValueInTableCol(supplierNoCol, supplierNo);
			if(supplierDateCol != null) appendValueInTableCol(supplierDateCol, supplierDateString);
			
			appendValueInTableCol(paymentModeCol, createPaymentModeSelection(PaymentTypeConstantArray, srNo));
			appendValueInTableCol(remarkCol, createRemarkField(srNo));
			appendValueInTableCol(remarkCol, createCheckNumberField(srNo));
			appendValueInTableCol(remarkCol, createCheckDateField(srNo));
			appendValueInTableCol(paymentStatusCol, createPaymentTypeSelection(PaymentStatusConstants, srNo));
			appendValueInTableCol(totalAmountCol, createTotalAmountFeild(crossingHire, srNo));
			appendValueInTableCol(receivedAmountCol, createReceivedAmountFeild(0, srNo));
			appendValueInTableCol(receiveAmountCol, createReceiveAmountFeild(0, srNo));
			
			if(tdsAmountCol != null)
				appendValueInTableCol(tdsAmountCol, createTdsAmountFeild(0, srNo));
			
			appendValueInTableCol(balanceAmountCol, createBalanceAmountFeild(crossingHire, srNo));

			appendRowInTable('billDetails', tableRow);
		} else if(BillClearanceDetails != undefined) {
				let crossingAgentBillClearance	= BillClearanceDetails[billClearance.crossingAgentBillId];

				let srNo					= i + 1;
				let billNumber				= crossingAgentBillClearance.billNumber;
				let crossingAgentBillId		= crossingAgentBillClearance.crossingAgentBillId;
				let crossingAgentId			= crossingAgentBillClearance.crossingAgentId;
				let receivedAmtLimit		= crossingAgentBillClearance.totalReceivedAmount;
				let crossingAgentName		= crossingAgentBillClearance.crossingAgentName;
				let creationDateTimeString	= crossingAgentBillClearance.creationDateTimeString;
				let branchName				= crossingAgentBillClearance.branchName;
				let grandTotal				= crossingAgentBillClearance.grandTotal;
				let totalReceivedAmount		= crossingAgentBillClearance.totalReceivedAmount;
				
				let balanceAmount			= parseFloat(grandTotal) - parseFloat(totalReceivedAmount);
				let supplierNo				= crossingAgentBillClearance.supplierBillNo;
				let supplierDateString		= crossingAgentBillClearance.supplierBillDateString;
				
				if(allowRoundOffAmount) {
					grandTotal			= Math.round(grandTotal);
					totalReceivedAmount = Math.round(totalReceivedAmount);
					balanceAmount		= Math.round(balanceAmount);
				} else {
					grandTotal			= toFixedWhenDecimal(grandTotal);
					totalReceivedAmount = toFixedWhenDecimal(totalReceivedAmount);
					balanceAmount		= toFixedWhenDecimal(balanceAmount);
				}

				totalAmount					+= grandTotal;
				grandTotalReceivedAmount	+= totalReceivedAmount;
				grandTotalBalanceAmount		+= balanceAmount;

				let tableRow				= createRowInTable('', '', '');

				let srNoCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
				let billNoCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
				let dateTimeCol				= createColumnInRow(tableRow, 'billDate_' + srNo, '', '', '', '', '');
				let branchCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(isShowSupplierBillNo) supplierNoCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
				if(isShowSupplierBillDate) supplierDateCol		= createColumnInRow(tableRow, '' , '', '', '', '', '');
	
				let paymentModeCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
				let remarkCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
				let paymentStatusCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
				let totalAmountCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
				let receivedAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
				let receiveAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(isTDSAllow)
					tdsAmountCol			= createColumnInRow(tableRow, '', '', '', '', '', '');

				let balanceAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');

				appendValueInTableCol(srNoCol, srNo);
				appendValueInTableCol(srNoCol, createBillNumberField(billNumber, srNo));
				appendValueInTableCol(srNoCol, createBillIdField(crossingAgentBillId, srNo));
				appendValueInTableCol(srNoCol, createBillIdFieldForDuplicate(crossingAgentBillId));
				appendValueInTableCol(srNoCol, createCreditorIdFeild(crossingAgentId, srNo));
				appendValueInTableCol(srNoCol, createReceivedAmtLimitFeild(receivedAmtLimit, srNo));

				if(invoicePrintHyperlinkOnInvoiceNumber)
					billNumberLinkAttr		= createLinkForBillNumberPrint(crossingAgentBillId, billNumber);
				else
					billNumberLinkAttr		= createLinkForBillNumber(crossingAgentBillId, billNumber, status, crossingAgentName);

				appendValueInTableCol(billNoCol, billNumberLinkAttr);
				appendValueInTableCol(dateTimeCol, creationDateTimeString);
				appendValueInTableCol(branchCol, branchName);

				if(supplierNoCol != null) appendValueInTableCol(supplierNoCol, supplierNo);
				if(supplierDateCol != null) appendValueInTableCol(supplierDateCol, supplierDateString);
				
				appendValueInTableCol(paymentModeCol, createPaymentModeSelection(PaymentTypeConstantArray, srNo));
				appendValueInTableCol(remarkCol, createRemarkField(srNo));
				appendValueInTableCol(remarkCol, createCheckNumberField(srNo));
				appendValueInTableCol(remarkCol, createCheckDateField(srNo));
				appendValueInTableCol(paymentStatusCol, createPaymentTypeSelection(PaymentStatusConstants, srNo));
				appendValueInTableCol(totalAmountCol, createTotalAmountFeild(grandTotal, srNo));
				appendValueInTableCol(receivedAmountCol, createReceivedAmountFeild(totalReceivedAmount, srNo));
				appendValueInTableCol(receiveAmountCol, createReceiveAmountFeild(0, srNo));
				
				if(tdsAmountCol != null)
					appendValueInTableCol(tdsAmountCol, createTdsAmountFeild(0, srNo));
					
				appendValueInTableCol(balanceAmountCol, createBalanceAmountFeild(balanceAmount, srNo));

				appendRowInTable('billDetails', tableRow);
			}
	}

	$('.chequeDate').val(dateWithDateFormatForCalender(new Date(),"/")); //dateFormatForCalender defined in genericfunctions.js file
	
	$( function() {
		$( '.chequeDate' ).datepicker({
			maxDate: new Date(),
			showAnim: "fold",
			dateFormat: 'dd/mm/yy'
		});
	} );

	craeteRowForGrandTotal(totalAmount, grandTotalReceivedAmount, grandTotalBalanceAmount);
}

function craeteRowForGrandTotal(totalAmount, grandTotalReceivedAmount, grandTotalBalanceAmount) {
	if(!allowRoundOffAmount) {
		totalAmount					= toFixedWhenDecimal(totalAmount);
		grandTotalReceivedAmount	= toFixedWhenDecimal(grandTotalReceivedAmount);
		grandTotalBalanceAmount		= toFixedWhenDecimal(grandTotalBalanceAmount);
	}
	
	let createRow		= createRowInTable('', 'panel-footer panel-primary', 'background-color: red;');

	let srNoCol			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(srNoCol, '');
		
	let billNoCol			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(billNoCol, '');
	
	let dateTimeCol			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(dateTimeCol, '');
	
	let branchCol			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(branchCol, '');
	
	if(isShowSupplierBillNo) {
		let supplierNoCol	= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
		appendValueInTableCol(supplierNoCol, '');
	}
	
	if(isShowSupplierBillDate) {
		let supplierDateCol		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
		appendValueInTableCol(supplierDateCol, '');
	}
	
	let paymentModeCol			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(paymentModeCol, '');
	
	let remarkCol				= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	appendValueInTableCol(remarkCol, '');
	
	let paymentStatusCol		= createColumnInRow(createRow, '', 'text-left', '', '', '', '');
	appendValueInTableCol(paymentStatusCol, '<b>Total</b>');
	
	let totalAmountCol			= createColumnInRow(createRow, 'totalAmountCol', 'text-right', '', '', '', '');
	appendValueInTableCol(totalAmountCol, totalAmount);
	
	let receivedAmountCol		= createColumnInRow(createRow, 'totalReceivedAmtCol', 'text-right', '', '', '', '');
	appendValueInTableCol(receivedAmountCol, grandTotalReceivedAmount);
	
	let receiveAmountCol		= createColumnInRow(createRow, 'totalReceiveAmtCol', 'text-right', '', '', '', '');
	appendValueInTableCol(receiveAmountCol, '');
	
	if(isTDSAllow) {
		let tdsAmountCol		= createColumnInRow(createRow, 'totalTdsAmtCol', 'text-right', '', '', '', '');
		appendValueInTableCol(tdsAmountCol, '');
	}
	
	let balanceAmountCol		= createColumnInRow(createRow, 'totalBalanceAmtCol', 'text-right', '', '', '', '');
	appendValueInTableCol(balanceAmountCol, grandTotalBalanceAmount);

	appendRowInTable('grandTotalRow', createRow);
}

function createPaymentModeSelection(PaymentTypeConstantArray, srNo) {
	let paymentModeSel = $('<select id="paymentMode_'+ srNo +'" name="paymentMode_'+ srNo +'" class="form-control col-xs-2" onchange="showHideChequeDetails('+ srNo +',this);"/>');
	paymentModeSel.append($("<option>").attr('value', 0).text('---Select Mode---'));

	$(PaymentTypeConstantArray).each(function() {
		paymentModeSel.append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
	});

	return paymentModeSel;
}

function createPaymentTypeSelection(PaymentStatusConstants, srNo) {
	let paymentStatusSel = $('<select id="paymentStatus_'+ srNo +'" name="paymentStatus_'+ srNo +'" class="form-control col-xs-2" onchange="setReceiveAmountOnPaymentStatus(this);"/>');
	paymentStatusSel.append($("<option>").attr('value', 0).text('---Select Type---'));

	$(PaymentStatusConstants).each(function() {
		paymentStatusSel.append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
	});

	return paymentStatusSel;
}

function createBillNumberField(billNumber, srNo) {
	let billNumberFeild			= $("<input/>", { 
		type		: 'hidden', 
		id			: 'billNumber_' + srNo, 
		class		: 'form-control', 
		name		: 'billNumber_' + srNo, 
		value 		: billNumber, 
		placeholder	: 'Bill Number'});

	return billNumberFeild;
}

function createBillIdField(crossingAgentBillId, srNo) {
	let billIdFeild				= $("<input/>", { 
		type		: 'hidden', 
		id			: 'billId_' + srNo, 
		class		: 'form-control', 
		name		: 'billId_' + srNo, 
		value 		: crossingAgentBillId, 
		placeholder	: 'Bill Id'});

	return billIdFeild;
}

function createBillIdFieldForDuplicate(crossingAgentBillId) {
	let billIdFeild				= $("<input/>", { 
		type		: 'hidden', 
		id			: 'billIdford_' + crossingAgentBillId, 
		class		: 'form-control', 
		name		: 'billIdford_' + crossingAgentBillId, 
		value 		: crossingAgentBillId, 
		placeholder	: 'Bill Id'});

	return billIdFeild;
}

function createCreditorIdFeild(crossingAgentId, srNo) {
	let creditorIdFeild			= $("<input/>", { 
		type		: 'hidden', 
		id			: 'creditorId_' + srNo, 
		class		: 'form-control', 
		name		: 'creditorId_' + srNo, 
		value 		: crossingAgentId, 
		placeholder	: 'Creditor Id'});

	return creditorIdFeild;
}

function createReceivedAmtLimitFeild(receivedAmtLimit, srNo) {
	let receivedAmtLimitFeild	= $("<input/>", { 
		type		: 'hidden', 
		id			: 'receivedAmtLimit_' + srNo, 
		class		: 'form-control', 
		name		: 'receivedAmtLimit_' + srNo, 
		value 		: receivedAmtLimit, 
		placeholder	: 'Remark'});

	return receivedAmtLimitFeild;
}

function createRemarkField(srNo) {
	let remarkFeild			= $("<input/>", { 
		type		: 'text', 
		id			: 'remark_' + srNo, 
		class		: 'form-control', 
		name		: 'remark_' + srNo, 
		placeholder	: 'Remark'});

	return remarkFeild;
}

function createBankNameField(srNo) {
	let bankNameFeild			= $("<input/>", { 
		type			: 'hidden', 
		id				: 'bankName_' + srNo, 
		class			: 'form-control hide', 
		name			: 'bankName_' + srNo, 
		placeholder		: 'Bank Name'});

	return bankNameFeild;
}

function createCheckNumberField(srNo) {
	let checkNumberFeild		= $("<input/>", { 
		type			: 'text', 
		id				: 'chequeNumber_' + srNo, 
		class			: 'form-control hide', 
		name			: 'chequeNumber_' + srNo, 
		placeholder		: 'Cheque No / Txn No.'});

	return checkNumberFeild;
}

function createCheckDateField(srNo) {
	let checkDateFeild			= $("<input/>", { 
		type		: 'text', 
		id			: 'chequeDate_' + srNo, 
		class		: 'form-control hide chequeDate', 
		name		: 'chequeDate_' + srNo, 
		placeholder	: 'Cheque Date / Txn Date', 
		onkeyup 	: 'setMonthYear(this);'});

	return checkDateFeild;
}


function createTotalAmountFeild(crossingHire, srNo) {
	let totalAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'grandTotal_' + srNo, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'grandTotal_' + srNo, 
		value 		: crossingHire, 
		placeholder	: 'Total Amount',
		readonly 	: 'readonly',
		maxlength 	: '7'});

	return totalAmountFeild;
}

function createReceivedAmountFeild(receivedAmount, srNo) {
	let roundOffReceivedAmount = Math.round(receivedAmount);
	
	let receivedAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'receivedAmt_' + srNo, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'receivedAmt_' + srNo, 
		value 		: roundOffReceivedAmount, 
		placeholder	: 'Received Amount',
		readonly 	: 'readonly',});

	return receivedAmountFeild;
}

function createReceiveAmountFeild(receiveAmount, srNo) {
	let roundOffReceiveAmount = Math.round(receiveAmount);

	let receivedAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'receiveAmt_' + srNo, 
		class		: 'form-control text-right', 
		name		: 'receiveAmt_' + srNo, 
		value 		: roundOffReceiveAmount, 
		placeholder	: 'Receive Amount',
		onfocus		: 'resetTextFeild(this, 0);',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);setPaymentStatus(this);validateReceiveAmount(this);",
		onkeypress 	: "return noNumbers(event, this);",
		onkeyup 	: "setPaymentStatus(this);validateReceiveAmount(this);"});

	return receivedAmountFeild;
}

function createBalanceAmountFeild(crossingHire, srNo) {
	let balanceAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'balanceAmt_' + srNo, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'balanceAmt_' + srNo, 
		value 		: crossingHire, 
		readonly 	: 'readonly',
		maxlength 	: '7',
		placeholder	: 'Balance Amount'});

	return balanceAmountFeild;
}

function createTdsAmountFeild(tdsAmount, srNo) {
	let roundOffTdsAmount = Math.round(tdsAmount);
	
	let tdsAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'tdsAmt_' + srNo, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'tdsAmt_' + srNo, 
		value 		: roundOffTdsAmount, 
		placeholder	: 'TDS Amount',
		onfocus		: 'resetTextFeild(this, 0);',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);validateTdsAmount(this);",
		onkeypress 	: "return noNumbers(event ,this);",
		onkeyup 	: "setPaymentStatus(this);validateTdsAmount(this);"});

	return tdsAmountFeild;
}

function createLinkForBillNumberPrint(crossingAgentBillId,billNumber) {
	let billNumberLinkFeild		= new Object();

	billNumberLinkFeild.href	= 'javascript:viewBillSummaryPrint("' + crossingAgentBillId + '")';
	billNumberLinkFeild.html	= billNumber; 

	return createHyperLink(billNumberLinkFeild);
}

function viewBillSummaryPrint(billId) {
	let pageId = 249;
	let eventId = 5;
	let url = 'TURView.do?pageId=' + pageId + '&eventId=' + eventId + '&billId=' + billId;
	window.open(url, 'mywin', 'left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}

function createLinkForBillNumber(crossingAgentBillId, billNumber, status, crossingAgentName) {
	let billNumberLinkFeild		= new Object();

	billNumberLinkFeild.href		= 'javascript:viewBillSummary("' + crossingAgentBillId + '", "' + billNumber + '", "' + status + '", "' + crossingAgentName + '")';
	billNumberLinkFeild.html		= billNumber; 

	return createHyperLink(billNumberLinkFeild);
}

function viewBillSummary(billId, billNo, billStatusId, crossingAgentName) {
	window.open('viewBillSummary.do?pageId=250&eventId=4&billId='+billId+'&billNo='+billNo+'&billStatusId='+billStatusId+'&crossingAgentName='+crossingAgentName,'mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}

function validateReceiveAmount(obj) {
	let objName 		= obj.name;
	let objVal			= 0;
	let splitVal 		= objName.split("_");
	
	if(!formValidation(obj)) {
		$('#receiveAmt_' + splitVal[1]).val(0);
		return false;
	}
	
	let maxAmt 			= parseInt($('#grandTotal_' + splitVal[1]).val());
	let isLess = false;
	let isObjValshldzero = false;

	if(maxAmt > 0) {
	
		if(obj.value.length > 0)
			objVal = parseInt(obj.value, 10);

		if(isObjValshldzero) {
			obj.value = 0;
			objVal = 0;
		}
	} else if(maxAmt < 0) {
		if(obj.value.length > 0)
			objVal = parseInt(obj.value, 10);

		if(isObjValshldzero) {
			obj.value = 0;
			objVal = 0;
		}

		isLess = true;
	}

	if(isLess)
		objVal = - objVal;
	
	let grandTotal			= parseInt($('#grandTotal_' + splitVal[1]).val());
	let receivedAmtLimit	= parseInt($('#receivedAmtLimit_' + splitVal[1]).val()) + objVal;
	let balanceAmt			= $('#balanceAmt_' + splitVal[1]).val();
	
	$('#balanceAmt_' + splitVal[1]).val(grandTotal - (receivedAmtLimit));
		
	if(Math.abs(receivedAmtLimit) > Math.abs(grandTotal)) {
		let received 	 	= parseInt($('#receivedAmt_' + splitVal[1]).val());
		let balanceAmount   = (Math.abs(grandTotal) - Math.abs(received));
		showMessage('info',  'Receive Amount Not greater than  Total Amount : ' + balanceAmount + '!');
		
		if(allowRoundOffAmount)
			$('#balanceAmt_' + splitVal[1]).val(Math.round(grandTotal - received));
		else
			$('#balanceAmt_' + splitVal[1]).val(toFixedWhenDecimal(grandTotal - received));
		
		$('#paymentStatus_' + splitVal[1]).val(0);
		$('#receiveAmt_' + splitVal[1]).val(0);
		calTotalAmounts();
		return false;
	}

	if(Math.abs(receivedAmtLimit) == Math.abs(grandTotal))
		$('#paymentStatus_' + splitVal[1]).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
	
	calTotalAmounts();
	
	if($('#paymentStatus_'+ splitVal[1]).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
		&& (!validateDiscountLimit(discountInPercent, Number($('#grandTotal_'+ splitVal[1]).val() - $('#receivedAmt_'+ splitVal[1]).val()), balanceAmt, $('#receiveAmt_' + splitVal[1]))))
			return false;
}

function validateTdsAmount(obj){
	calTotalAmounts();
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	let discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
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

function formValidation(obj) {

	let objName			= obj.name;
	let mySplitResult 	= objName.split("_");
	
	let receiveAmount	= $("#receiveAmt_" + mySplitResult[1]).val();
	let paymentMode		= $("#paymentMode_" + mySplitResult[1]).val();
	let billNumber		= $("#billNumber_" + mySplitResult[1]).val();
	let billId			= $("#billId_" + mySplitResult[1]).val();

	if(!validatePaymentMode(1, 'paymentMode_' + mySplitResult[1]))
		return false;
	
	if(!validatePaymentType(1, 'paymentStatus_' + mySplitResult[1]))
		return false;
	
	if(!BankPaymentOperationRequired && paymentMode == PAYMENT_TYPE_CHEQUE_ID) {
		if(!validateChequeNumber(1, 'chequeNumber_' + mySplitResult[1]))
			return false;
			
		if(!validateChequeDate(1, 'chequeDate_' + mySplitResult[1]))
			return false;
	}
	
	if(BankPaymentOperationRequired && isValidPaymentMode(paymentMode) && receiveAmount > 0
		&& !$('#paymentDataTr_' + billId).exists() && (!$('#paymentDataTr_0' ).exists() && centralizePaymentModeSelection)) {
		showMessage('info', iconForInfoMsg + 'Please, Add Payment details for this Bill ' + openFontTag + billNumber + closeFontTag + ' !');
		return false;
	}
	
	return true;
}

function enableButtons() {
	$('#UpSaveButton').removeClass('hide');
	$('#DownSaveButton').removeClass('hide');
}

function disableButtons() {
	$('#UpSaveButton').addClass('hide');
	$('#DownSaveButton').addClass('hide');
}

function setPaymentStatus(obj) {
	let objName 		= obj.name;
	let splitVal 		= objName.split("_");
	let paymentStatus 	= parseInt(getValueFromInputField('paymentStatus_' + splitVal[1]));
	let balanceAmount	= parseInt(getValueFromInputField('balanceAmt_' + splitVal[1]));
	
	if(parseInt(obj.value, 10) > 0 && paymentStatus != PAYMENT_TYPE_STATUS_NEGOTIATED_ID &&  balanceAmount != 0)
		$('#paymentStatus_' + splitVal[1]).val(PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
}

function showHideChequeDetails(srNo, obj) {
	if(BankPaymentOperationRequired){
		if(srNo > 0) {
			$('#uniqueWayBillId').val($('#billId_' + srNo).val());
			$('#uniqueWayBillNumber').val($('#billNumber_' + srNo).val());
			$('#uniquePaymentType').val($('#paymentMode_' + srNo).val());
			$('#uniquePaymentTypeName').val($("#paymentMode_" + srNo + " option:selected").text());
		} else {
			$('#uniqueWayBillId').val(0);
			$('#uniqueWayBillNumber').val("All");
			$('#uniquePaymentType').val($('#paymentMode_0').val());
			$('#uniquePaymentTypeName').val($("#paymentMode_0 option:selected").text());
		}
		
		hideShowBankPaymentTypeOptions(obj);
	} else {
		let objName 		= obj.name;
		let mySplitResult 	= objName.split("_");

		if(obj.value != PAYMENT_TYPE_CASH_ID && obj.value != 0) {
			switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'hide', 'show');
			switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'hide', 'show');
		} else { 
			switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'show', 'hide');
			switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'show', 'hide');
		}
	}
}

function setReceiveAmountOnPaymentStatus(obj) {
	let objName 		= obj.name;
	let mySplitResult 	= objName.split("_");
	
	let totalAmount		= $('#grandTotal_' + mySplitResult[1]).val();
	let receivedAmount	= $('#receivedAmt_' + mySplitResult[1]).val();
	let balanceAmount	= 0;
	let receiveAmount	= 0;
	
	if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		receiveAmount		= totalAmount - receivedAmount;
		balanceAmount		= totalAmount - receivedAmount - receiveAmount;
		
		if(allowRoundOffAmount) {
			receiveAmount	= Math.round(receiveAmount);
			balanceAmount	= Math.round(balanceAmount);
		} else {
			receiveAmount	= toFixedWhenDecimal(receiveAmount);
			balanceAmount	= toFixedWhenDecimal(balanceAmount);
		}
		
		if(receiveAmount < 0)
			$('#receiveAmt_' + mySplitResult[1]).val(-receiveAmount);
		else
			$('#receiveAmt_' + mySplitResult[1]).val(receiveAmount);
		
		if(balanceAmount < 0)
			$('#balanceAmt_' + mySplitResult[1]).val(-balanceAmount);
		else
			$('#balanceAmt_' + mySplitResult[1]).val(balanceAmount);
	} else {
		$('#receiveAmt_' + mySplitResult[1]).val(0);
		
		if(allowRoundOffAmount)
			$('#balanceAmt_' + mySplitResult[1]).val(Math.round(totalAmount - receivedAmount));
		else
			$('#balanceAmt_' + mySplitResult[1]).val(toFixedWhenDecimal(totalAmount - receivedAmount));
	}
	
	calTotalAmounts();
}

function calTotalAmounts() {
	let tableRowLength	= $('#billDetails tr').length;
	
	let totalAmount			= 0;
	let totalReceiveAmount	= 0;
	let totalBalanceAmount 	= 0;
	let totalTdsAmount 		= 0;
	
	for(let row = 1; row < tableRowLength + 1; row++) {
		if (allowRoundOffAmount) {
			totalAmount 		+= Math.round(Number($('#grandTotal_' + row).val()));
			totalReceiveAmount	+= Math.round(Number($('#receiveAmt_' + row).val()));
			totalBalanceAmount	+= Math.round(Number($('#balanceAmt_' + row).val()));
			totalTdsAmount		+= Math.round(Number($('#tdsAmt_' + row).val()));
		} else {
			totalAmount			+= toFixedWhenDecimal(Number($('#grandTotal_' + row).val()));
			totalReceiveAmount	+= toFixedWhenDecimal(Number($('#receiveAmt_' + row).val()));
			totalBalanceAmount 	+= toFixedWhenDecimal(Number($('#balanceAmt_' + row).val()));
			totalTdsAmount 		+= toFixedWhenDecimal(Number($('#tdsAmt_' + row).val()));
		}
	}
	
	if(!allowRoundOffAmount) {
		totalAmount			= toFixedWhenDecimal(totalAmount);
		totalReceiveAmount	= toFixedWhenDecimal(totalReceiveAmount);
		totalBalanceAmount	= toFixedWhenDecimal(totalBalanceAmount);
		totalTdsAmount		= toFixedWhenDecimal(totalTdsAmount);
	}

	$('#totalAmountCol').html(totalAmount);
	$('#totalReceiveAmtCol').html(totalReceiveAmount);
	$('#totalBalanceAmtCol').html(totalBalanceAmount);
	$('#totalTdsAmtCol').html(totalTdsAmount);
}

function setPaymentTypeForAllBill() {
	let paymentType_0  = $('#paymentMode_0').val();

	for(let i = 0; i < BillDetailsForBillClearanceAll.length; i++) {
		$('#paymentMode_' + (i + 1)).val(paymentType_0);
	}
}
	
function createPaymentModeSelectionForAll(PaymentTypeConstantArray) {
	$('#paymentMode_0 option[value]').remove()

	createOption('paymentMode_0', 0, '----Select Payment Type----');

	for(const element of PaymentTypeConstantArray) {
		createOption('paymentMode_0', element.paymentTypeId, element.paymentTypeName);
	}
}
	
