/**
 * 
 */
var executive					= null;
var grandTotal;
var grandTotalBalanceAmount;
var totalReceivedAmount;
var debitToBranch = false;
var noOfDays	 = 0;
var branchWiseLhpvAmountId	= 0;
var splitLhpvCount = 0;

function setBlhpvDataForClearPayment(response) {
	var blhpvArraylists						= response.blhpvArraylists;
	var paymentTypeConstantsList			= response.paymentTypeConstantsList;
	var PaymentStatusConstants				= response.paymentStatusConstants;
	executive								= response.executive;
	blhpvIdArrlist							= response.blhpvIdArrlist;
	debitToBranch							= response.debitToBranch;
	noOfDays								= response.noOfDays;
	
	grandTotal	 				= 0.0;
	grandTotalBalanceAmount		= 0.0;
	totalReceivedAmount			= 0.0;
	showPartOfPage('bottom-border-boxshadow');
	removeTableRows('billDetails', 'table');
	removeTableRows('grandTotalRow', 'table');
	removeTableRows('reportTable2', 'tbody');
	
	if(debitToBranch)
		$("#debitToBranch").css('display','block');
	
	$('#backdatemessage').empty();
	
	if(noOfDays > 0) {
		$("#paymentDate").show();
		$('#backdatemessage').html('<b>Only ' + noOfDays + ' days back date allow, but you cannot select date before BLHPV Creation date !</b>');
	}

	for(var i = 0; i < blhpvArraylists.length; i++) {
		var blhpv		= blhpvArraylists[i];

		if(blhpv != undefined) {
			var srNo					= i + 1;
			var bLHPVNumber				= blhpv.bLHPVNumber;
			var bLHPVId					= blhpv.bLHPVId;
			var blhpvBranchId			= blhpv.branchId;
			var driverMasterId			= blhpv.driverMasterId;
			var receivedAmtLimit		= blhpv.totalAmount - blhpv.balanceAmount;
			var driver1MobileNumber1	= blhpv.driver1MobileNumber1;
			var creationDateTimeString	= blhpv.creationDateTimeString;
			var totalAmount				= blhpv.totalAmount;
			var balanceAmount			= blhpv.balanceAmount;
			branchWiseLhpvAmountId		= blhpv.branchWiseLhpvAmountId;
			var actualBalanceAmountTaken= blhpv.actualBalanceAmountTaken;
			
			grandTotal					+= totalAmount;
			grandTotalBalanceAmount		+= balanceAmount;
			totalReceivedAmount			+= receivedAmtLimit;
			
			if(branchWiseLhpvAmountId > 0) splitLhpvCount++;
			
			var tableRow				= createRowInTable('tr_' + bLHPVId, '', '');

			var srNoCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
			var hiddenCol				= createColumnInRow(tableRow, '', 'hide', '', '', '', '');
			var bLHPVNumberCol			= createColumnInRow(tableRow, '', 'active', '', '', '', '');
			var dateTimeCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(branchWiseLhpvAmountId > 0)
				var splitLhpvCol		= createColumnInRow(tableRow, '', 'danger', '', '', '', '');
			
			var paymentModeCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			var remarkCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			var paymentStatusCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			var totalAmountCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			var receivedAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			var receiveAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(tdsConfiguration.IsTdsAllow) {
				var tdsAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(tdsConfiguration.IsTDSInPercentAllow)
					var tdspercentAmountCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(tdsConfiguration.IsPANNumberRequired)
					var panNumberCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(tdsConfiguration.IsTANNumberRequired)
					var tanNumberCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
			}
			
			var balanceAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(debitToBranch)
				var creditDebitToCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			if(noOfDays > 0)
				var paymentDateCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			var removeRowCol			= createColumnInRow(tableRow, '', '', '', '', '', '');

			appendValueInTableCol(srNoCol, srNo);
			
			appendValueInTableCol(hiddenCol, createBillNumberField(bLHPVNumber, bLHPVId));
			appendValueInTableCol(hiddenCol, createBillIdField(bLHPVId));
			appendValueInTableCol(hiddenCol, driver1IdIdFeild(driverMasterId, bLHPVId));
			appendValueInTableCol(hiddenCol, driver1MobileNumberFeild(driver1MobileNumber1, bLHPVId));
			appendValueInTableCol(hiddenCol, createReceivedAmtLimitFeild(0, bLHPVId));
			appendValueInTableCol(hiddenCol, createActualBalanceAmountTakenFeild(actualBalanceAmountTaken, bLHPVId));
			appendValueInTableCol(hiddenCol, createBranchWiseLhpvAmountIdField(branchWiseLhpvAmountId, bLHPVId));
			
			appendValueInTableCol(bLHPVNumberCol, bLHPVNumber);
			appendValueInTableCol(dateTimeCol, creationDateTimeString);
			
			if(branchWiseLhpvAmountId > 0)
				appendValueInTableCol(splitLhpvCol, 'Yes');
				
			appendValueInTableCol(paymentModeCol, createPaymentModeSelection(paymentTypeConstantsList, bLHPVId));
			appendValueInTableCol(remarkCol, createRemarkField(bLHPVId));
			appendValueInTableCol(remarkCol, createCheckNumberField(bLHPVId));
			appendValueInTableCol(remarkCol, createBankNameField(bLHPVId));
			appendValueInTableCol(remarkCol, createCheckDateField(bLHPVId));
			appendValueInTableCol(paymentStatusCol, createPaymentTypeSelection(PaymentStatusConstants, bLHPVId));
			appendValueInTableCol(totalAmountCol, createTotalAmountFeild(totalAmount, bLHPVId));
			appendValueInTableCol(receivedAmountCol, createReceivedAmountFeild(receivedAmtLimit, bLHPVId));
			appendValueInTableCol(receiveAmountCol, createReceiveAmountFeild(0, bLHPVId, blhpvBranchId, branchWiseLhpvAmountId));
			
			if(tdsConfiguration.IsTdsAllow) {
				appendValueInTableCol(tdsAmountCol, createTDSAmountFeild(0, bLHPVId, blhpvBranchId, branchWiseLhpvAmountId));
				
				if(tdsConfiguration.IsTDSInPercentAllow)
					appendValueInTableCol(tdspercentAmountCol, createTDSRateSelection(bLHPVId));
				
				if(tdsConfiguration.IsPANNumberRequired)
					appendValueInTableCol(panNumberCol, createPanNumberFeild(bLHPVId));
				
				if(tdsConfiguration.IsTANNumberRequired)
					appendValueInTableCol(tanNumberCol, createTanNumberFeild(bLHPVId));
			}
			
			appendValueInTableCol(balanceAmountCol, createBalanceAmountFeild(balanceAmount, bLHPVId));
			appendValueInTableCol(balanceAmountCol, createBalanceAmount1Feild(balanceAmount, bLHPVId));
			
			if(debitToBranch)
				appendValueInTableCol(creditDebitToCol, createCreditDebitToBranchSelection(debitToBranchArr, bLHPVId));
			
			if(noOfDays > 0)
				appendValueInTableCol(paymentDateCol, createPaymentDateFeild(bLHPVId));
			
			appendValueInTableCol(removeRowCol, "<button type='button' onclick='removeRow(this)' class='btn btn-danger' id='Remove_" + bLHPVId + "'>Remove</button>");

			appendRowInTable('billDetails', tableRow);
			
			if(branchWiseLhpvAmountId > 0) {
				$('#paymentStatus_' + bLHPVId).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
				$('#paymentStatus_' + bLHPVId).attr('disabled', 'disabled');
			}
			
			var tableRow1				= createRowInTable('tr_' + bLHPVId, '', '');

			var srNoCol					= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var bLHPVNumberCol			= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var dateTimeCol				= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var totalAmountCol			= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var receivedAmountCol		= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var balanceAmountCol		= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			
			appendValueInTableCol(srNoCol, srNo);
			appendValueInTableCol(bLHPVNumberCol, bLHPVNumber);
			appendValueInTableCol(dateTimeCol, creationDateTimeString);
			appendValueInTableCol(totalAmountCol, totalAmount);
			appendValueInTableCol(receivedAmountCol, receivedAmtLimit);
			appendValueInTableCol(balanceAmountCol, balanceAmount);
			
			appendRowInTable('billDetailsToPrint', tableRow1);
			
			if(noOfDays > 0) {
				$('#paymentDate_' + bLHPVId).val(response.currentDate);
				
				$( function() {
					$('#paymentDate_' + bLHPVId).datepicker({
						maxDate		: response.currentDate,
						minDate		: blhpv.blhpvMaxBackDateStr,
						showAnim	: "fold",
						dateFormat	: 'dd-mm-yy'
					});
				} );
			}
		}
	}
	
	if(splitLhpvCount <= 0) $('#isSplitLhpv').remove();
	if(splitLhpvCount > 0) $('#backdatemessage').append('Split amount will be clear when all branch will receive payment !');
	
	if(!tdsConfiguration.IsTdsAllow) $('#isTdsAllow').remove();
	if(!tdsConfiguration.IsTDSInPercentAllow) $('#isTdsRateAllow').remove();
	if(!tdsConfiguration.IsPANNumberRequired) $('#isPanNumberAllow').remove();
	if(!tdsConfiguration.IsTANNumberRequired) $('#isTanNumberAllow').remove();
	$('.paymentDate').val(response.currentDate);
	
	$( function() {
		$( '.paymentDate' ).datepicker({
			maxDate		: response.currentDate,
			minDate		: response.previousDate,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	} );
	
	$('.chequeDate').val(response.currentDate);
	
	$( function() {
		$( '.chequeDate' ).datepicker({
			maxDate		: response.currentDate,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	} );

	craeteRowForGrandTotal(grandTotal, totalReceivedAmount, grandTotalBalanceAmount);
}

function removeRow(ele) {
	var blhpvId = (ele.id).split("_")[1];
	$("#totalAmountCol").html(grandTotal - $("#grandTotal_" + blhpvId).val());
	$("#totalReceivedAmtCol").html(totalReceivedAmount - $("#receivedAmt_" + blhpvId).val());
	$("#totalBalanceAmtCol").html(grandTotalBalanceAmount - $("#balanceAmt_" + blhpvId).val() - $("#receiveAmt_" + blhpvId).val());
	$("#totalReceiveAmtCol").html($("#totalReceiveAmtCol").html() - $("#receiveAmt_" + blhpvId).val());
	grandTotal				= $("#totalAmountCol").html();
	totalReceivedAmount		= $("#totalReceivedAmtCol").html();
	grandTotalBalanceAmount	= $("#totalBalanceAmtCol").html();
	//$("#tr_" + blhpvId).remove();
	
	var row = $('#tr_' + blhpvId).closest('tr');
	
	setTimeout(function() { // Simulating ajax
		var siblings = row.siblings();
		row.remove();
		siblings.each(function(index) {
			$(this).children().first().text(index + 1);
		});
	}, 100);
}

function craeteRowForGrandTotal(totalAmount, totalReceivedAmount, grandTotalReceivedAmount) {
	var createRow			= createRowInTable('', 'danger', '');

	var blankCol1			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankHiddenCol		= createColumnInRow(createRow, '', 'text-center hide', '', '', '', '');
	var blankCol2			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol3			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	
	if(branchWiseLhpvAmountId > 0)
		var splitLhpvCol	= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	
	var blankCol4			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol5			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var totalHeadingCol		= createColumnInRow(createRow, '', 'text-left', '', '', '', '');
	var totalAmtCol			= createColumnInRow(createRow, 'totalAmountCol', 'text-right', '', '', '', '');
	var totalReceivedAmtCol	= createColumnInRow(createRow, 'totalReceivedAmtCol', 'text-right', '', '', '', '');
	var totalReceiveAmtCol	= createColumnInRow(createRow, 'totalReceiveAmtCol', 'text-right', '', '', '', '');
	
	if(tdsConfiguration.IsTdsAllow) {
		var totalTDSAmtCol		= createColumnInRow(createRow, 'totalTDSAmtCol', 'text-right', '', '', '', '');
		
		if(tdsConfiguration.IsTDSInPercentAllow)
			var totalTDSRateCol		= createColumnInRow(createRow, 'totalTDSRateCol', 'text-right', '', '', '', '');
		
		if(tdsConfiguration.IsPANNumberRequired)
			var panNumberCol		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
		
		if(tdsConfiguration.IsTANNumberRequired)
			var tanNumberCol		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	}
	
	var totalBalanceCol	= createColumnInRow(createRow, 'totalBalanceAmtCol', 'text-right', '', '', '', '');

	if(debitToBranch)
		var blankCol6			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	
	if(noOfDays > 0)
		var blankCol7			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	
	appendValueInTableCol(blankCol1, '');
	appendValueInTableCol(blankHiddenCol, '');
	appendValueInTableCol(blankCol2, '');
	appendValueInTableCol(blankCol3, '');
	
	if(branchWiseLhpvAmountId > 0) appendValueInTableCol(splitLhpvCol, '');
	
	appendValueInTableCol(blankCol4, '');
	appendValueInTableCol(blankCol5, '');
	appendValueInTableCol(totalHeadingCol, '<b>Total</b>');
	appendValueInTableCol(totalAmtCol, totalAmount);
	appendValueInTableCol(totalReceivedAmtCol, totalReceivedAmount);
	
	if(tdsConfiguration.IsTdsAllow) {
		appendValueInTableCol(totalTDSAmtCol, 0);
		
		if(tdsConfiguration.IsTDSInPercentAllow)
			appendValueInTableCol(totalTDSRateCol, '');
		
		if(tdsConfiguration.IsPANNumberRequired)
			appendValueInTableCol(panNumberCol, '');
		
		if(tdsConfiguration.IsTANNumberRequired)
			appendValueInTableCol(tanNumberCol, '');
	}
	
	appendValueInTableCol(totalReceiveAmtCol, 0);
	appendValueInTableCol(totalBalanceCol, grandTotalReceivedAmount);
	
	if(debitToBranch)
		appendValueInTableCol(blankCol6, '');
	
	if(noOfDays > 0)
		appendValueInTableCol(blankCol7, '');

	appendRowInTable('grandTotalRow', createRow);
}

function createPaymentModeSelection(paymentTypeConstantsList, bLHPVId) {
	var paymentModeSel = $('<select id="paymentMode_'+ bLHPVId +'" name="paymentMode_'+ bLHPVId +'" class="form-control col-xs-2 paymentMode" onchange="hideShowChequeDetails('+ bLHPVId +', this);"/>');
	paymentModeSel.append($("<option>").attr('value', 0).text('---Select Mode---'));

	$(paymentTypeConstantsList).each(function() {
		paymentModeSel.append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
	});
	
	return paymentModeSel;
}

function createCreditDebitToBranchSelection(debitToBranchArr, bLHPVId){
	var debitToBranchSel = $('<select id="debitToBranchSelection_'+ bLHPVId +'" name="debitToBranchSelection_'+ bLHPVId +'" class="form-control col-xs-2" onchange=""/>');
	debitToBranchSel.append($("<option>").attr('value', 0).text('---Select Branch---'));

	$(debitToBranchArr).each(function() {
		debitToBranchSel.append($("<option>").attr('value', this.branchId).text(this.branchName));
	});
	
	return debitToBranchSel;
}

function createPaymentTypeSelection(PaymentStatusConstants, bLHPVId) {
	var paymentStatusSel = $('<select id="paymentStatus_'+ bLHPVId +'" name="paymentStatus_'+ bLHPVId +'" class="form-control col-xs-2" onchange="setReceiveAmountOnPaymentStatus(this);"/>');
	paymentStatusSel.append($("<option>").attr('value', 0).text('---Select Type---'));

	$(PaymentStatusConstants).each(function() {
		paymentStatusSel.append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
	});
	
	return paymentStatusSel;
}

function createBillNumberField(bLHPVNumber, bLHPVId) {
	var billNumberFeild			= $("<input/>", { 
		type		: 'hidden', 
		id			: 'billNumber_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'billNumber_' + bLHPVId, 
		value 		: bLHPVNumber, 
		placeholder	: 'Bill Number'});

	return billNumberFeild;
}

function createBillIdField(bLHPVId) {
	var billIdFeild				= $("<input/>", { 
		type		: 'hidden', 
		id			: 'billId_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'billId_' + bLHPVId, 
		value 		: bLHPVId, 
		placeholder	: 'Bill Id'});
	
	return billIdFeild;
}

function driver1IdIdFeild(driver1Id, bLHPVId) {
	var driver1IdFeild			= $("<input/>", { 
		type		: 'hidden', 
		id			: 'driver1Id_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'driver1Id_' + bLHPVId, 
		value 		: driver1Id, 
		placeholder	: 'Driver Id'});
	
	return driver1IdFeild;
}

function driver1MobileNumberFeild(driver1MobileNumber1, bLHPVId) {
	var driver1MobileNumber1Feild	= $("<input/>", { 
		type		: 'hidden', 
		id			: 'driver1MobileNumber1_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'driver1MobileNumber1_' + bLHPVId, 
		value 		: driver1MobileNumber1, 
		placeholder	: 'Driver Mobile'});
	
	return driver1MobileNumber1Feild;
}

function createReceivedAmtLimitFeild(receivedAmtLimit, bLHPVId) {
	var receivedAmtLimitFeild	= $("<input/>", { 
		type		: 'hidden', 
		id			: 'receivedAmtLimit_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'receivedAmtLimit_' + bLHPVId, 
		value 		: receivedAmtLimit, 
		placeholder	: 'Remark'});
	
	return receivedAmtLimitFeild;
}

function createActualBalanceAmountTakenFeild(actualBalanceAmountTaken, bLHPVId) {
	var receivedAmtLimitFeild	= $("<input/>", { 
		type		: 'hidden', 
		id			: 'actualBalanceAmountTaken_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'actualBalanceAmountTaken_' + bLHPVId, 
		value 		: actualBalanceAmountTaken});
	
	return receivedAmtLimitFeild;
}

function createRemarkField(bLHPVId) {
	var remarkFeild			= $("<input/>", { 
		type		: 'text', 
		id			: 'remark_' + bLHPVId, 
		class		: 'form-control', 
		name		: 'remark_' + bLHPVId, 
		placeholder	: 'Remark'});
	
	return remarkFeild;
}

function createCheckNumberField(bLHPVId) {
	var checkNumberFeild		= $("<input/>", { 
		type			: 'text', 
		id				: 'chequeNumber_' + bLHPVId, 
		class			: 'form-control hide', 
		name			: 'chequeNumber_' + bLHPVId, 
		placeholder		: 'Cheque No / Txn No.'});

	return checkNumberFeild;
}

function createBankNameField(bLHPVId) {
	var bankNameFeild		= $("<input/>", { 
		type			: 'text', 
		id				: 'bankName_' + bLHPVId, 
		class			: 'form-control hide', 
		name			: 'bankName_' + bLHPVId, 
		style			: "text-transform : UPPERCASE",
		placeholder		: 'Bank Name'});

	return bankNameFeild;
}

function createCheckDateField(bLHPVId) {
	var checkDateFeild			= $("<input/>", { 
		type		: 'text', 
		id			: 'chequeDate_' + bLHPVId, 
		class		: 'form-control hide chequeDate', 
		name		: 'chequeDate_' + bLHPVId, 
		placeholder	: 'Cheque Date / Txn Date', 
		onkeyup 	: 'setMonthYear(this);'});

	return checkDateFeild;
}

function createTotalAmountFeild(totalAmount, bLHPVId) {
	var totalAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'grandTotal_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'grandTotal_' + bLHPVId, 
		value 		: totalAmount, 
		placeholder	: 'Total Amount',
		readonly 	: 'readonly',
		maxlength 	: '7'});
	
	return totalAmountFeild;
}

function createReceivedAmountFeild(receivedAmount, bLHPVId) {
	var receivedAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'receivedAmt_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'receivedAmt_' + bLHPVId, 
		value 		: receivedAmount, 
		readonly	: true,
		placeholder	: 'Received Amount'});
	
	return receivedAmountFeild;
}

function createBranchWiseLhpvAmountIdField(branchWiseLhpvAmountId, bLHPVId) {
	var branchWiseLhpvAmountField	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'branchWiseLhpvAmountId_' + bLHPVId, 
		class			: 'form-control', 
		name			: 'branchWiseLhpvAmountId_' + bLHPVId, 
		value 			:  branchWiseLhpvAmountId, 
		placeholder		: ''});

	return branchWiseLhpvAmountField;
}

function createReceiveAmountFeild(receiveAmount, bLHPVId, blhpvBranchId, branchWiseLhpvAmountId) {
	var isReadOnly		= false;
	
	if(executive.branchId != blhpvBranchId && branchWiseLhpvAmountId <= 0)
		isReadOnly		= true;
	
	if(allowBLHPVCreditPaymentInAnyBrnach)
		isReadOnly = false
	
	var receivedAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'receiveAmt_' + bLHPVId, 
		class		: 'form-control text-right', 
		name		: 'receiveAmt_' + bLHPVId, 
		value 		: receiveAmount, 
		readonly	: isReadOnly,
		placeholder	: 'Receive Amount',
		onfocus		: 'resetTextFeild(this, 0);',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);validateReceiveAmount(this);setPaymentStatus(this);",
		onkeypress 	: "return noNumbers(event ,this);",
		onkeyup 	: "validateReceiveAmount(this);setPaymentStatus(this);"});
	
	return receivedAmountFeild;
}

function createTDSAmountFeild(balanceAmount, bLHPVId, blhpvBranchId, branchWiseLhpvAmountId) {
	var isReadOnly		= false;
	
	if(executive.branchId != blhpvBranchId && branchWiseLhpvAmountId <= 0)
		isReadOnly		= true;
	
	if(allowBLHPVCreditPaymentInAnyBrnach)
		isReadOnly = false
	
	var tdsAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'tdsAmt_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'tdsAmt_' + bLHPVId, 
		value 		: 0, 
		readonly	: isReadOnly,
		maxlength 	: '7',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);calculateTDS("+ bLHPVId +");",
		onkeyup 	: 'calculateTDS('+ bLHPVId +');',
		placeholder	: 'TDS Amount'});
	
	return tdsAmountFeild;
}

function createTDSRateSelection(bLHPVId) {
	var tdsRateSel = $('<select id="tdsRate_'+ bLHPVId +'" name="tdsRate_'+ bLHPVId +'" class="form-control col-xs-4" onchange="calculateTDS('+ bLHPVId +');" style="width : 70px;"/>');
	tdsRateSel.append($("<option>").attr('value', 0).text('---Select Rate---'));
	
	$(tdsChargeList).each(function() { //tdsChargeList coming on initialize
		tdsRateSel.append($("<option>").attr('value', this).text(this));
	});
	
	return tdsRateSel;
}

function createPanNumberFeild(bLHPVId) {
	var panNumberFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'panNumber_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'panNumber_' + bLHPVId, 
		value 		: '', 
		maxlength 	: '10',
		style		: 'text-transform: uppercase;',
		placeholder	: 'PAN number',
	});
	
	return panNumberFeild;
}

function createTanNumberFeild(bLHPVId) {
	var tanNumberFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'tanNumber_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'tanNumber_' + bLHPVId, 
		value 		: '', 
		maxlength 	: '10',
		style		: 'text-transform: uppercase;',
		placeholder	: 'TAN number',
	});
	
	return tanNumberFeild;
}

function createBalanceAmountFeild(balanceAmount, bLHPVId) {
	var balanceAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'balanceAmt_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'balanceAmt_' + bLHPVId, 
		value 		: balanceAmount, 
		readonly 	: 'readonly',
		maxlength 	: '7',
		placeholder	: 'Balance Amount'});
	
	return balanceAmountFeild;
}

function createBalanceAmount1Feild(balanceAmount, bLHPVId) {
	var balanceAmountFeild		= $("<input/>", { 
		type		: 'hidden', 
		id			: 'balanceAmt1_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-right', 
		name		: 'balanceAmt1_' + bLHPVId, 
		value 		: balanceAmount, 
		readonly 	: 'readonly',
		maxlength 	: '7',
		placeholder	: 'Balance Amount'});
	
	return balanceAmountFeild;
}

function createPaymentDateFeild(bLHPVId) {
	var paymentDateFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'paymentDate_' + bLHPVId, 
		class		: 'form-control col-xs-1 text-center', 
		name		: 'paymentDate_' + bLHPVId, 
		value 		: '', 
		readonly 	: 'readonly',
		onkeyup		: 'setMonthYear(this);',
		onclick		: 'setMonthYear(this);',
		placeholder	: 'Payment Date'});
	
	return paymentDateFeild;
}

function hideShowChequeDetails(bLHPVId, obj) {
	if(BankPaymentOperationRequired) {
		$('#uniqueWayBillId').val($('#billId_' + bLHPVId).val());
		$('#uniqueWayBillNumber').val($('#billNumber_' + bLHPVId).val());
		$('#uniquePaymentType').val($('#paymentMode_' + bLHPVId).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + bLHPVId + " option:selected").text());

		hideShowBankPaymentTypeOptions(obj); //defined in paymentTypeSelection.js
	} else if(obj.value != PAYMENT_TYPE_CASH_ID && obj.value != 0) {
		switchHtmlTagClass('chequeNumber_' + bLHPVId, 'hide', 'show');
		switchHtmlTagClass('bankName_' + bLHPVId, 'hide', 'show');
		switchHtmlTagClass('chequeDate_' + bLHPVId, 'hide', 'show');
	} else { 
		switchHtmlTagClass('chequeNumber_' + bLHPVId, 'show', 'hide');
		switchHtmlTagClass('bankName_' + bLHPVId, 'show', 'hide');
		switchHtmlTagClass('chequeDate_' + bLHPVId, 'show', 'hide');
	}
}

function setReceiveAmountOnPaymentStatus(obj) {
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	var bLHPVId			= mySplitResult[1];
	
	if(validatePaymentSelection(bLHPVId))
		return false;
	
	var paymentStatus	= $('#paymentStatus_' + bLHPVId).val();
	var totalAmount		= $('#grandTotal_' + bLHPVId).val();
	var receivedAmount	= $('#receivedAmt_' + bLHPVId).val();
	var balanceAmount	= $('#balanceAmt_' + bLHPVId).val();
	var receiveAmount	= 0;
	var balanceAmount	= 0;
	
	if($('#receiveAmt_' + bLHPVId).is('[readonly]')) {
		showAlertMessage('error', 'Not allow to receive other branch payment !');
		return;
	}

	if(paymentStatus == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID && !$('#receiveAmt_' + bLHPVId).is('[readonly]')) {
		receiveAmount		= totalAmount - receivedAmount;
		balanceAmount		= totalAmount - receivedAmount - receiveAmount;
		
		if(receiveAmount < 0)
			$('#receiveAmt_' + bLHPVId).val(-receiveAmount);
		else
			$('#receiveAmt_' + bLHPVId).val(receiveAmount);
		
		if(balanceAmount < 0)
			$('#balanceAmt_' + bLHPVId).val(-balanceAmount);
		else
			$('#balanceAmt_' + bLHPVId).val(balanceAmount);
		
		calculateTDS(bLHPVId);
	} else if($('#receiveAmt_' + bLHPVId).val() > 0) {
		$('#balanceAmt_' + bLHPVId).val($('#receiveAmt_' + bLHPVId).val());
		$('#receiveAmt_' + bLHPVId).val(0);
	}
	
	calTotalAmounts();
}

function validatePaymentSelection(bLHPVId) {
	var paymentStatus	= $('#paymentStatus_' + bLHPVId).val();
	var balanceAmount	= parseFloat($('#balanceAmt_' + bLHPVId).val());
	var grandTotal		= parseFloat($('#grandTotal_' + bLHPVId).val());
	
	if(grandTotal <= 0) {
		if(balanceAmount >= 0 && paymentStatus != BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			showMessage('warning', otherPaymentTypeSelectionWarningMsg);
			$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		}
	} else if(balanceAmount <= 0 && paymentStatus != BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
		showMessage('warning', otherPaymentTypeSelectionWarningMsg);
		$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
	}
}

function validateReceiveAmount(obj) {
	var objName 		= obj.name;
	var objVal			= 0;
	var splitVal 		= objName.split("_");
	var bLHPVId			= splitVal[1];
	
	if(!validateBeforeSave(obj)) {
		$('#receiveAmt_' + bLHPVId).val(0);
		return false;
	}
	
	var maxAmt 			= parseInt($('#balanceAmt1_' + bLHPVId).val());
	var minAmt 			= parseInt($('#receivedAmtLimit_' + bLHPVId).val());

	if(obj.value.length > 0)
		objVal = parseInt(obj.value, 10);
	
	if(maxAmt > 0 && minAmt > 0)
		maxAmt = maxAmt - minAmt;
	
	if(maxAmt < 0)
		$('#balanceAmt_' + bLHPVId).val(maxAmt + (minAmt + objVal));
	else
		$('#balanceAmt_' + bLHPVId).val(maxAmt - (minAmt + objVal));
	
	var grandTotal			= parseInt($('#grandTotal_' + bLHPVId).val());
	var balanceAmt			= $('#balanceAmt_' + bLHPVId).val();

	if($('#branchWiseLhpvAmountId_' + bLHPVId).val() <= 0) {
		if(grandTotal > 0 && balanceAmt <= 0)
			$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		else if(grandTotal > 0 && balanceAmt > 0) {
			if($('#paymentStatus_' + bLHPVId).val() != PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
				$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
		} else if(grandTotal <= 0 && balanceAmt >= 0)
			$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		else if(balanceAmt > 0)
			$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		else
			$('#paymentStatus_' + bLHPVId).val(BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
	}
	
	calculateTDS(bLHPVId);
	
	calTotalAmounts();
	
	if($('#paymentStatus_' + bLHPVId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID && 
		!validateDiscountLimit(discountInPercent, Number($('#grandTotal_'+ bLHPVId).val() - $('#receivedAmt_'+ bLHPVId).val()), balanceAmt, $('#receiveAmt_'+ bLHPVId)))
			return false;
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

function setPaymentStatus(obj) {
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var bLHPVId			= splitVal[1];
	var paymentStatus 	= parseInt($('#paymentStatus_' + bLHPVId).val());
	var balanceAmount	= parseInt($('#balanceAmt_' + bLHPVId).val());
	
	if(parseInt(obj.value, 10) > 0 && paymentStatus != PAYMENT_TYPE_STATUS_NEGOTIATED_ID && balanceAmount != 0)
		$('#paymentStatus_' + bLHPVId).val(PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
}

function calTotalAmounts() {
	var totalAmount			= 0;
	var totalReceiveAmount	= 0;
	var totalBalanceAmount 	= 0;
	var totalTdsAmount		= 0;
	
	for(var i = 0; i < blhpvIdArrlist.length; i++) {
		if($('#grandTotal_' + blhpvIdArrlist[i]).val() > 0)
			totalAmount 		= Number(totalAmount) + Number($('#grandTotal_' + blhpvIdArrlist[i]).val());
		
		if($('#receiveAmt_' + blhpvIdArrlist[i]).val() > 0)
			totalReceiveAmount 	= Number(totalReceiveAmount) + Number($('#receiveAmt_' + blhpvIdArrlist[i]).val());
		
		if($('#balanceAmt_' + blhpvIdArrlist[i]).val() > 0)
			totalBalanceAmount 	= Number(totalBalanceAmount) + Number($('#balanceAmt_' + blhpvIdArrlist[i]).val());
		
		if($('#tdsAmt_' + blhpvIdArrlist[i]).val() > 0)
			totalTdsAmount 		= Number(totalTdsAmount) + Number($('#tdsAmt_' + blhpvIdArrlist[i]).val());
	}	
	
	$('#totalAmountCol').html(totalAmount);
	$('#totalReceiveAmtCol').html(totalReceiveAmount);
	$('#totalBalanceAmtCol').html(totalBalanceAmount);
	$('#totalTDSAmtCol').html(totalTdsAmount);
}

function onPaymentTypeSelect() {
	var paymentType		= $('#paymentType').val();
	
	$('.paymentMode').val(paymentType);
	
	if(paymentType > 0)
		$('.paymentMode').attr('disabled' , 'disabled');
	else
		$('.paymentMode').removeAttr('disabled');
	
	if(paymentType > 0) {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
	
	$('#storedPaymentDetails').empty();
	
	if(BankPaymentOperationRequired)
		hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
}

function onPaymentStatusSelect() {
	
	var paymentStatus		= $('#paymentStatus').val();
	
	for(var i = 0; i < blhpvIdArrlist.length; i++) {
		$('#paymentStatus_' + blhpvIdArrlist[i]).val(paymentStatus);
		
		if(paymentStatus > 0)
			$('#paymentStatus_' + blhpvIdArrlist[i]).attr('disabled' , 'disabled');
		else
			$('#paymentStatus_' + blhpvIdArrlist[i]).removeAttr('disabled');
		
		if(paymentStatus == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			$('#receiveAmt_' + blhpvIdArrlist[i]).val(Number($('#balanceAmt_' + blhpvIdArrlist[i]).val()) + Number($('#receiveAmt_' + blhpvIdArrlist[i]).val()));
			$('#balanceAmt_' + blhpvIdArrlist[i]).val(0);
			$('#totalReceiveAmtCol').html(Number($('#totalBalanceAmtCol').html()) + Number($('#totalReceiveAmtCol').html()));
			$('#totalBalanceAmtCol').html(0);
		} else if($('#receiveAmt_' + blhpvIdArrlist[i]).val() > 0) {
			$('#balanceAmt_' + blhpvIdArrlist[i]).val(Number($('#balanceAmt_' + blhpvIdArrlist[i]).val()) + Number($('#receiveAmt_' + blhpvIdArrlist[i]).val()));
			$('#receiveAmt_' + blhpvIdArrlist[i]).val(0);
			$('#totalBalanceAmtCol').html(Number($('#totalBalanceAmtCol').html()) + Number($('#totalReceiveAmtCol').html()));
			$('#totalReceiveAmtCol').html(0);
		}
	}
}

function validateBeforeSave(obj) {

	var objName			= obj.name;
	var mySplitResult 	= objName.split("_");
	var bLHPVId			= mySplitResult[1];
	
	var blhpvNumber			= $("#billNumber_" + bLHPVId).val();
	var receiveAmount		= $("#receiveAmt_" + bLHPVId).val();
	var paymentMode			= $("#paymentMode_" + bLHPVId).val();
	var balanceAmt 			= Number($("#balanceAmt_" + bLHPVId).val());
	var actualBalanceAmt 	= Number($('#balanceAmt1_' + bLHPVId).val());

	if(!validatePaymentMode(1, 'paymentMode_' + bLHPVId))
		return false;
	
	if(!BankPaymentOperationRequired) {
		if(paymentMode == PAYMENT_TYPE_CHEQUE_ID) {
			if(!validateChequeNumber(1, 'chequeNumber_' + bLHPVId))
				return false;
			
			if(!validateChequeDate(1, 'chequeDate_' + bLHPVId))
				return false;
		}
	}
	
	if(!validatePaymentType(1, 'paymentStatus_' + bLHPVId))
		return false;
	
	if(BankPaymentOperationRequired && isValidPaymentMode(paymentMode) && receiveAmount > 0) { //Defined in paymentTypeSelection.js
		if(!$('#paymentDataTr_' + bLHPVId).exists() && !$('#paymentDataTr_0').exists()) {
			showMessage('info', iconForInfoMsg + 'Please, Add Payment details for this BLHPV ' + openFontTag + blhpvNumber + closeFontTag + ' !');
			return false;
		}
	}
	
	if(isBalanceAmountValidation && balanceAmt < 0) {
		$("#balanceAmt_" + bLHPVId).val(actualBalanceAmt);
		showMessage("info", iconForInfoMsg + "Receive amount can not be greater than balance amount.");
		return false;
	}
	
	if(tdsConfiguration.IsPANNumberRequired
			&& tdsConfiguration.IsPANNumberMandetory) {
		if($('#tdsAmt_' + bLHPVId).val() > 0 && !validateInputTextFeild(1, 'panNumber_' + bLHPVId, 'panNumber_' + bLHPVId, 'error', panNumberErrMsg))
			return false;
		else if(!validateInputTextFeild(8, 'panNumber_' + bLHPVId, 'panNumber_' + bLHPVId, 'info', validPanNumberErrMsg))
			return false;
	}
	
	if(tdsConfiguration.IsTANNumberRequired && tdsConfiguration.IsTANNumberMandetory) {
		if($('#tdsAmt_' + bLHPVId).val() > 0 && !validateInputTextFeild(1, 'tanNumber_' + bLHPVId, 'tanNumber_' + bLHPVId, 'error', tanNumberErrMsg))
			return false;
		else if(!validateInputTextFeild(13, 'tanNumber_' + bLHPVId, 'tanNumber_' + bLHPVId, 'info', validTanNumberErrMsg))
			return false;
	}
	
	return true;
}

function calculateTDS(bLHPVId) {
	var tdsRate			= $('#tdsRate_' + bLHPVId).val();
	var receiveAmt		= $('#receiveAmt_' + bLHPVId).val();
	var tdsAmt			= 0; 
	var totalTdsAmount	= 0;
	
	if(tdsRate > 0 && receiveAmt > 0) {
		tdsAmt	= (tdsRate * receiveAmt) / 100;
		
		$('#tdsAmt_' + bLHPVId).val(tdsAmt);
	}
	
	for(var i = 0; i < blhpvIdArrlist.length; i++) {
		if($('#tdsAmt_' + blhpvIdArrlist[i]).val() > 0) {
			totalTdsAmount 		= Number(totalTdsAmount) + Number($('#tdsAmt_' + blhpvIdArrlist[i]).val());
		}
	}	
	
	$('#totalTDSAmtCol').html(totalTdsAmount);
}