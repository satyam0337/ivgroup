var executive;
var tdsConfiguration;
var grandTotal;
var grandTotalBalanceAmount;
var totalReceivedAmount;
var PaymentVoucherDetails;
var primaryId;
var PaymentTypeConstant;

function setPaymentPanel(response) {

	var columnArray				= new Array();
	PaymentVoucherDetails		= response.PaymentVoucherDetails;
	var obj1					= PaymentVoucherDetails;
	BillClearanceStatusConstant = response.BillClearanceStatusConstant;
	
	PaymentTypeConstant			= response.PaymentTypeConstant;
	grandTotal	 				= 0.0;
	grandTotalBalanceAmount		= 0.0;
	totalReceivedAmount			= 0.0;
	showPartOfPage('bottom-border-boxshadow');
	removeTableRows('billDetails', 'table');
	removeTableRows('grandTotalRow', 'table');
	removeTableRows('reportTable2', 'tbody');


	for(var i = 0; i < PaymentVoucherDetails.length; i++) {
		var voucher		= PaymentVoucherDetails[i];

		if(voucher != undefined) {
			var srNo					= i + 1;
			var paymentVoucherNumber	= voucher.paymentVoucherNumber;
			primaryId					= voucher.exepenseVoucherDetailsId;
			var branchId				= voucher.branchId;
			var receivedAmtLimit		= voucher.totalAmount - voucher.settelAmount;
			var totalAmount				= voucher.totalAmount;
			var settelAmount			= voucher.settelAmount;
			expenseDateTime 			= voucher.expenseDateTimeStr ;

			grandTotal					+= totalAmount;
			grandTotalBalanceAmount		+= settelAmount;
			totalReceivedAmount			+= receivedAmtLimit;
			
			var tableRow				= createRowInTable('tr_' + primaryId, '', '');

			var srNoCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
			var hiddenCol				= createColumnInRow(tableRow, '', 'hide', '', '', '', '');
			var bLHPVNumberCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			var dateTimeCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			var remarkCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			var totalAmountCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
			var receivedAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			var receiveAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			console.log('tdsConfiguration --- ', tdsConfiguration)
			
			tdsConfiguration.IsTdsAllow = false;
			if(tdsConfiguration.IsTdsAllow) {
				var tdsAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
				
				if(tdsConfiguration.IsTDSInPercentAllow) {
					var tdspercentAmountCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
				}
			}
			
			var balanceAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
			
			appendValueInTableCol(srNoCol, srNo);
			
			appendValueInTableCol(hiddenCol, createBillNumberField(paymentVoucherNumber, primaryId));
			appendValueInTableCol(hiddenCol, createBillIdField(primaryId));
			appendValueInTableCol(hiddenCol, createReceivedAmtLimitFeild(0, primaryId));
			
			appendValueInTableCol(bLHPVNumberCol, paymentVoucherNumber);
			appendValueInTableCol(dateTimeCol, expenseDateTime);
			appendValueInTableCol(remarkCol, createRemarkField(primaryId));
			appendValueInTableCol(totalAmountCol, createTotalAmountFeild(totalAmount, primaryId));
			appendValueInTableCol(receivedAmountCol, createReceivedAmountFeild(settelAmount, primaryId));
			appendValueInTableCol(receiveAmountCol, createReceiveAmountFeild(0, primaryId, branchId));
			
			if(tdsConfiguration.IsTdsAllow) {
				appendValueInTableCol(tdsAmountCol, createTDSAmountFeild(0, primaryId, branchId));
				
				if(tdsConfiguration.IsTDSInPercentAllow) {
					appendValueInTableCol(tdspercentAmountCol, createTDSRateSelection(primaryId));
				}
			}
			
			appendValueInTableCol(balanceAmountCol, createBalanceAmountFeild(receivedAmtLimit, primaryId));
			appendValueInTableCol(balanceAmountCol, createBalanceAmount1Feild(receivedAmtLimit, primaryId));

			appendRowInTable('billDetails', tableRow);
			
			var tableRow1				= createRowInTable('tr_' + primaryId, '', '');

			var srNoCol					= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var bLHPVNumberCol			= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var dateTimeCol				= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var totalAmountCol			= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var receivedAmountCol		= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			var balanceAmountCol		= createColumnInRow(tableRow1, '', 'datatd', '', '', '', '');
			
			appendValueInTableCol(srNoCol, srNo);
			appendValueInTableCol(bLHPVNumberCol, paymentVoucherNumber);
			appendValueInTableCol(dateTimeCol, expenseDateTime);
			appendValueInTableCol(totalAmountCol, totalAmount);
			appendValueInTableCol(receivedAmountCol, settelAmount);
			appendValueInTableCol(balanceAmountCol, receivedAmtLimit);
			
			appendRowInTable('billDetailsToPrint', tableRow1);
		}
	}
	
	if(!tdsConfiguration.IsTdsAllow) {
		$('#isTdsAllow').remove();
	}

	if(!tdsConfiguration.IsTDSInPercentAllow) {
		$('#isTdsRateAllow').remove();
	}
	
	$('.chequeDate').val(dateWithDateFormatForCalender(new Date(), "-")); //dateFormatForCalender defined in genericfunctions.js file
	
	$( function() {
		$( '.chequeDate' ).datepicker({
			maxDate		: new Date(),
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	} );

	craeteRowForGrandTotal(grandTotal, totalReceivedAmount, grandTotalBalanceAmount);
}

function craeteRowForGrandTotal(totalAmount, totalReceivedAmount, grandTotalReceivedAmount) {
	var createRow			= createRowInTable('', 'panel-footer panel-primary', 'background-color: #e19d9d;');

	var blankCol1			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankHiddenCol		= createColumnInRow(createRow, '', 'text-center hide', '', '', '', '');
	var blankCol2			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol3			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var totalHeadingCol		= createColumnInRow(createRow, '', 'text-left', '', '', '', '');
	var totalAmtCol			= createColumnInRow(createRow, 'totalAmountCol', 'text-right', '', '', '', '');
	var totalReceivedAmtCol	= createColumnInRow(createRow, 'totalReceivedAmtCol', 'text-right', '', '', '', '');
	var totalReceiveAmtCol	= createColumnInRow(createRow, 'totalReceiveAmtCol', 'text-right', '', '', '', '');
	
	if(tdsConfiguration.IsTdsAllow) {
		var totalTDSAmtCol		= createColumnInRow(createRow, 'totalTDSAmtCol', 'text-right', '', '', '', '');
		
		if(tdsConfiguration.IsTDSInPercentAllow) {
			var totalTDSRateCol		= createColumnInRow(createRow, 'totalTDSRateCol', 'text-right', '', '', '', '');
		}
	}
	
	var totalBalanceCol	= createColumnInRow(createRow, 'totalBalanceAmtCol', 'text-right', '', '', '', '');

	
	appendValueInTableCol(blankCol1, '');
	appendValueInTableCol(blankHiddenCol, '');
	appendValueInTableCol(blankCol2, '');
	appendValueInTableCol(blankCol3, '');
	appendValueInTableCol(totalHeadingCol, '<b>Total</b>');
	appendValueInTableCol(totalAmtCol, totalAmount);
	appendValueInTableCol(totalReceivedAmtCol, grandTotalReceivedAmount);
	
	if(tdsConfiguration.IsTdsAllow) {
		appendValueInTableCol(totalTDSAmtCol, 0);
		
		if(tdsConfiguration.IsTDSInPercentAllow) {
			appendValueInTableCol(totalTDSRateCol, '');
		}
	}
	
	appendValueInTableCol(totalReceiveAmtCol, 0);
	appendValueInTableCol(totalBalanceCol, totalReceivedAmount);

	appendRowInTable('grandTotalRow', createRow);
}
function createPaymentModeSelection(paymentTypeConstantsList, primaryId) {
	var paymentModeSel = $('<select id="paymentMode' +'" name="paymentMode' +'" class="form-control col-xs-2" onchange="hideShowChequeDetails('+ primaryId +', this);"/>');
	paymentModeSel.append($("<option>").attr('value', 0).text('---Select Mode---'));

	$(paymentTypeConstantsList).each(function() {
		paymentModeSel.append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
	});
	
	return paymentModeSel;
}

function createPaymentTypeSelection(PaymentStatusConstants, primaryId) {
	var paymentStatusSel = $('<select id="paymentStatus_'+ primaryId +'" name="paymentStatus_'+ primaryId +'" class="form-control col-xs-2" onchange="setReceiveAmountOnPaymentStatus(this);"/>');
	paymentStatusSel.append($("<option>").attr('value', 0).text('---Select Type---'));

	$(PaymentStatusConstants).each(function() {
		paymentStatusSel.append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
	});
	
	return paymentStatusSel;
}

function createBillNumberField(bLHPVNumber, primaryId) {
	var billNumberFeild			= $("<input/>", { 
					type		: 'hidden', 
					id			: 'billNumber_' + primaryId, 
					class		: 'form-control', 
					name		: 'billNumber_' + primaryId, 
					value 		: bLHPVNumber, 
					placeholder	: 'Bill Number'});

	return billNumberFeild;
}

function createBillIdField(primaryId) {
	var billIdFeild				= $("<input/>", { 
					type		: 'hidden', 
					id			: 'billId_' + primaryId, 
					class		: 'form-control', 
					name		: 'billId_' + primaryId, 
					value 		: primaryId, 
					placeholder	: 'Bill Id'});
	
	return billIdFeild;
}

function createReceivedAmtLimitFeild(receivedAmtLimit, primaryId) {
	var receivedAmtLimitFeild	= $("<input/>", { 
					type		: 'hidden', 
					id			: 'receivedAmtLimit_' + primaryId, 
					class		: 'form-control', 
					name		: 'receivedAmtLimit_' + primaryId, 
					value 		: receivedAmtLimit, 
					placeholder	: 'Remark'});
	
	return receivedAmtLimitFeild;
}

function createRemarkField(primaryId) {
	var remarkFeild			= $("<input/>", { 
				type		: 'text', 
				id			: 'remark_' + primaryId, 
				class		: 'form-control', 
				name		: 'remark_' + primaryId, 
				placeholder	: 'Remark'});
	
	return remarkFeild;
}

function createCheckNumberField(primaryId) {
	var checkNumberFeild		= $("<input/>", { 
		type			: 'text', 
		id				: 'chequeNumber_' + primaryId, 
		class			: 'form-control hide', 
		name			: 'chequeNumber_' + primaryId, 
		placeholder		: 'Cheque No / Txn No.'});

	return checkNumberFeild;
}

function createBankNameField(primaryId) {
	var bankNameFeild		= $("<input/>", { 
		type			: 'text', 
		id				: 'bankName_' + primaryId, 
		class			: 'form-control hide', 
		name			: 'bankName_' + primaryId, 
		style			: "text-transform : UPPERCASE",
		placeholder		: 'Bank Name'});

	return bankNameFeild;
}

function createCheckDateField(primaryId) {
	var checkDateFeild			= $("<input/>", { 
		type		: 'text', 
		id			: 'chequeDate_' + primaryId, 
		class		: 'form-control hide chequeDate', 
		name		: 'chequeDate_' + primaryId, 
		placeholder	: 'Cheque Date / Txn Date', 
		onkeyup 	: 'setMonthYear(this);'});

	return checkDateFeild;
}

function createTotalAmountFeild(totalAmount, primaryId) {
	var totalAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'grandTotal_' + primaryId, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'grandTotal_' + primaryId, 
					value 		: totalAmount, 
					placeholder	: 'Total Amount',
					readonly 	: 'readonly',
					maxlength 	: '7'});
	
	return totalAmountFeild;
}

function createReceivedAmountFeild(receivedAmount, primaryId) {
	var receivedAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'receivedAmt_' + primaryId, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'receivedAmt_' + primaryId, 
					value 		: receivedAmount, 
					readonly	: true,
					placeholder	: 'Received Amount'});
	
	return receivedAmountFeild;
}

function createReceiveAmountFeild(receiveAmount, primaryId, branchId) {
	var isReadOnly		= false;
	
	if(executive.branchId != branchId) {
		isReadOnly		= true;
	}
	
	var receivedAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'receiveAmt_' + primaryId, 
					class		: 'form-control text-right', 
					name		: 'receiveAmt_' + primaryId, 
					value 		: receiveAmount, 
					readonly	: isReadOnly,
					placeholder	: 'Receive Amount',
					onfocus		: 'resetTextFeild(this, 0);',
					onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);validateReceiveAmount(this);setPaymentStatus(this);",
					onkeypress 	: "return noNumbers(event ,this);",
					onkeyup 	: "validateReceiveAmount(this);setPaymentStatus(this);"});
	
	return receivedAmountFeild;
}

function createTDSAmountFeild(balanceAmount, primaryId, branchId) {
	var isReadOnly		= false;
	
	if(executive.branchId != branchId) {
		isReadOnly		= true;
	}
	
	var tdsAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'tdsAmt_' + primaryId, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'tdsAmt_' + primaryId, 
					value 		: 0, 
					readonly	: isReadOnly,
					maxlength 	: '7',
					onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);calculateTDS("+ primaryId +");",
					onkeyup 	: 'calculateTDS('+ primaryId +');',
					placeholder	: 'TDS Amount'});
	
	return tdsAmountFeild;
}

function createTDSRateSelection(primaryId) {
	var tdsRateSel = $('<select id="tdsRate_'+ primaryId +'" name="tdsRate_'+ primaryId +'" class="form-control col-xs-4" onchange="calculateTDS('+ primaryId +');" style="width : 70px;"/>');
	tdsRateSel.append($("<option>").attr('value', 0).text('---Select Rate---'));
	
	$(tdsChargeList).each(function() { //tdsChargeList coming on initialize
		tdsRateSel.append($("<option>").attr('value', this).text(this));
	});
	
	return tdsRateSel;
}

function createBalanceAmountFeild(balanceAmount, primaryId) {
	var balanceAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'balanceAmt_' + primaryId, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'balanceAmt_' + primaryId, 
					value 		: balanceAmount, 
					readonly 	: 'readonly',
					maxlength 	: '7',
					placeholder	: 'Balance Amount'});
	
	return balanceAmountFeild;
}

function createBalanceAmount1Feild(balanceAmount, primaryId) {
	var balanceAmountFeild		= $("<input/>", { 
					type		: 'hidden', 
					id			: 'balanceAmt1_' + primaryId, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'balanceAmt1_' + primaryId, 
					value 		: balanceAmount, 
					readonly 	: 'readonly',
					maxlength 	: '7',
					placeholder	: 'Balance Amount'});
	
	return balanceAmountFeild;
}

function createPaymentDateFeild(primaryId) {
	var paymentDateFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'paymentDate_' + primaryId, 
					class		: 'form-control col-xs-1 text-center paymentDate', 
					name		: 'paymentDate_' + primaryId, 
					value 		: '', 
					readonly 	: 'readonly',
					onkeyup		: 'setMonthYear(this);',
					onclick		: 'setMonthYear(this);',
					placeholder	: 'Payment Date'});
	
	return paymentDateFeild;
}

function hideShowChequeDetails(primaryId, obj) {
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	
	if(BankPaymentOperationRequired) {
		$('#uniqueWayBillId').val($('#billId_' + primaryId).val());
		$('#uniqueWayBillNumber').val($('#billNumber_' + primaryId).val());
		$('#uniquePaymentType').val($('#paymentMode').val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + primaryId + " option:selected").text());
	
		hideShowBankPaymentTypeOptions(obj); //defined in paymentTypeSelection.js
	} else {
		if(obj.value != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID && obj.value != 0) {
			switchHtmlTagClass('chequeNumber_' + primaryId, 'hide', 'show');
			switchHtmlTagClass('bankName_' + primaryId, 'hide', 'show');
			switchHtmlTagClass('chequeDate_' + primaryId, 'hide', 'show');
		} else { 
			switchHtmlTagClass('chequeNumber_' + primaryId, 'show', 'hide');
			switchHtmlTagClass('bankName_' + primaryId, 'show', 'hide');
			switchHtmlTagClass('chequeDate_' + primaryId, 'show', 'hide');
		}
	}
}

function setReceiveAmountOnPaymentStatus(obj) {
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	var primaryId			= mySplitResult[1];
	
	if(validatePaymentSelection(primaryId)) {
		return false;
	}
	
	var paymentStatus	= $('#paymentStatus').val();
	var totalAmount		= $('#grandTotal_' + primaryId).val();
	var receivedAmount	= $('#receivedAmt_' + primaryId).val();
	var balanceAmount	= $('#balanceAmt_' + primaryId).val();
	var receiveAmount	= 0;
	var balanceAmount	= 0;

	if(paymentStatus == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		receiveAmount		= totalAmount - receivedAmount;
		balanceAmount		= totalAmount - receivedAmount - receiveAmount;
		
		if(receiveAmount < 0) {
			$('#receiveAmt_' + primaryId).val(-receiveAmount);
		} else {
			$('#receiveAmt_' + primaryId).val(receiveAmount);
		}
		
		if(balanceAmount < 0) {
			$('#balanceAmt_' + primaryId).val(-balanceAmount);
		} else {
			$('#balanceAmt_' + primaryId).val(balanceAmount);
		}
		
		calculateTDS(primaryId);
	} else {
		if($('#receiveAmt_' + primaryId).val() > 0) {
			$('#balanceAmt_' + primaryId).val($('#receiveAmt_' + primaryId).val());
			$('#receiveAmt_' + primaryId).val(0);
		}
	}
	
	calTotalAmounts();
}

function validatePaymentSelection(primaryId) {
	var paymentStatus	= $('#paymentStatus').val();
	var balanceAmount	= parseFloat($('#balanceAmt_' + primaryId).val());
	var grandTotal		= parseFloat($('#grandTotal_' + primaryId).val());
	
	if(grandTotal <= 0) {
		if(balanceAmount >= 0 && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			showMessage('warning', otherPaymentTypeSelectionWarningMsg);
			$('#paymentStatus').val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		}
	} else {
		if(balanceAmount <= 0 && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			showMessage('warning', otherPaymentTypeSelectionWarningMsg);
			$('#paymentStatus').val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		}
	}
}

function validateReceiveAmount(obj) {
	var objName 		= obj.name;
	var objVal			= 0;
	var splitVal 		= objName.split("_");
	var primaryId			= splitVal[1];
	
	var maxAmt 			= parseInt($('#balanceAmt1_' + primaryId).val());
	var minAmt 			= parseInt($('#receivedAmtLimit_' + primaryId).val());
	var isLess = false;

	if(obj.value.length > 0) {
		objVal = parseInt(obj.value, 10);
	}
	
	if(maxAmt > 0 && minAmt > 0) {
		maxAmt = maxAmt - minAmt;
	}
	
	if(maxAmt < 0) {
		$('#balanceAmt_' + primaryId).val(maxAmt + (parseInt($('#receivedAmtLimit_' + primaryId).val()) + objVal));
	} else {
		$('#balanceAmt_' + primaryId).val(maxAmt - (parseInt($('#receivedAmtLimit_' + primaryId).val()) + objVal));
	}
	
	var grandTotal			= parseInt($('#grandTotal_' + primaryId).val());
	var balanceAmt			= $('#balanceAmt_' + primaryId).val();

	if(grandTotal > 0 && balanceAmt <= 0) {
		$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
	} else if(grandTotal > 0 && balanceAmt > 0) {
		if($('#paymentStatus').val() != PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID){
			$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
		}
	} else if(grandTotal <= 0 && balanceAmt >= 0) {
		$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
	} else {
		if(balanceAmt > 0) {
			$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		} else {
			$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
		}
	}
	
	calculateTDS(primaryId);
	
	calTotalAmounts();
	
}

function setPaymentStatus(obj) {
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var primaryId			= splitVal[1];
	var objVal			= 0;
	var paymentStatus 	= parseInt($('#paymentStatus').val());
	var balanceAmount	= parseInt($('#balanceAmt_' + primaryId).val());
	
	if(parseInt(obj.value, 10) > 0 && paymentStatus != PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID && balanceAmount != 0) {
		$('#paymentStatus').val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
	}
}

function calTotalAmounts() {
	var totalAmount			= 0;
	var totalReceiveAmount	= 0;
	var totalBalanceAmount 	= 0;
	var totalTdsAmount		= 0;
	
	for(var i = 0; i < PaymentVoucherDetails.length; i++) {
		if($('#grandTotal_' + primaryId).val() > 0) {
			totalAmount 		= Number(totalAmount) + Number($('#grandTotal_' + primaryId).val());
		}
		
		if($('#receiveAmt_' + primaryId).val() > 0) {
			totalReceiveAmount 	= Number(totalReceiveAmount) + Number($('#receiveAmt_' + primaryId).val());
		}
		
		if($('#balanceAmt_' + primaryId).val() > 0) {
			totalBalanceAmount 	= Number(totalBalanceAmount) + Number($('#balanceAmt_' + primaryId).val());
		}
		
		if($('#tdsAmt_' + primaryId).val() > 0) {
			totalTdsAmount 		= Number(totalTdsAmount) + Number($('#tdsAmt_' + primaryId).val());
		}
	}	
	
	$('#totalAmountCol').html(totalAmount);
	$('#totalReceiveAmtCol').html(totalReceiveAmount);
	$('#totalBalanceAmtCol').html(totalBalanceAmount);
	$('#totalTDSAmtCol').html(totalTdsAmount);
}

function onPaymentTypeSelect() {
	var obj = new Object();
	 obj.value				= $('#paymentType').val();
	console.log('obj --- ', obj.value)
	
	var paymentType		= $('#paymentType').val();
	var tableEl  		= document.getElementById("billDetails");
	
	for(var i = 0; i < PaymentVoucherDetails.length; i++) {
		$('#paymentMode').val(paymentType);
		
		if(paymentType > 0) {
			$('#paymentMode').attr('disabled' , 'disabled');
		} else {
			$('#paymentMode').removeAttr('disabled');
		}
	}
	
	if(paymentType > 0) {
		$('#uniqueWayBillNumber').val('');
	}
	
	$('#storedPaymentDetails').empty();
	
	if(BankPaymentOperationRequired) {
		hideShowBankPaymentTypeOptions(obj);
		
	}
}

function onPaymentStatusSelect() {
	
	var paymentStatus		= $('#paymentStatus').val();
	
	for(var i = 0; i < PaymentVoucherDetails.length; i++) {
		$('#paymentStatus').val(paymentStatus);
		
		if(paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			$('#receiveAmt_' + primaryId).val(Number($('#balanceAmt_' + primaryId).val()) + Number($('#receiveAmt_' + primaryId).val()));
			$('#receiveAmt_' + primaryId).attr('disabled' , 'disabled');
			$('#balanceAmt_' + primaryId).val(0);
			$('#totalReceiveAmtCol').html(Number($('#totalBalanceAmtCol').html()) + Number($('#totalReceiveAmtCol').html()));
			$('#totalBalanceAmtCol').html(0);
		} else {
			$('#receiveAmt_' + primaryId).removeAttr('disabled');
			
			if($('#receiveAmt_' + primaryId).val() > 0) {
				$('#balanceAmt_' + primaryId).val(Number($('#balanceAmt_' + primaryId).val()) + Number($('#receiveAmt_' + primaryId).val()));
				$('#receiveAmt_' + primaryId).val(0);
				$('#totalBalanceAmtCol').html(Number($('#totalBalanceAmtCol').html()) + Number($('#totalReceiveAmtCol').html()));
				$('#totalReceiveAmtCol').html(0);
			}
		}
	}
}

function validateBeforeSave(obj) {

	var objName			= obj.name;
	var mySplitResult 	= objName.split("_");
	var primaryId			= mySplitResult[1];
	
	var blhpvNumber			= $("#billNumber_" + primaryId).val();
	var receiveAmount		= $("#receiveAmt_" + primaryId).val();
	var paymentMode			= $("#paymentType").val();
	var balanceAmt 			= $("#balanceAmt_" + primaryId).val();

	if(!validatePaymentMode(1, 'paymentType')) {
		return false;
	}
	
	if(!BankPaymentOperationRequired) {
		if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
			if(!validateChequeNumber(1, 'chequeNumber_' + primaryId)) {
				return false;
			}
			
			if(!validateChequeDate(1, 'chequeDate_' + primaryId)) {
				return false;
			}
		}
	}
	
	if(!validatePaymentType(1, 'paymentStatus')) {
		return false;
	}
	
	if(balanceAmt < 0) {
		showMessage("info", iconForInfoMsg + "Receive amount can not be greater than balance amount.");
		$("#receiveAmt_" + primaryId).val(0);
		return false;
	}
	
	return true;
}

function calculateTDS(primaryId) {
	var tdsRate			= $('#tdsRate_' + primaryId).val();
	var receiveAmt		= $('#receiveAmt_' + primaryId).val();
	var tdsAmt			= 0; 
	var totalTdsAmount	= 0;
	
	if(tdsRate > 0 && receiveAmt > 0) {
		tdsAmt	= (tdsRate * receiveAmt) / 100;
		
		$('#tdsAmt_' + primaryId).val(tdsAmt);
	}
	
	for(var i = 0; i < PaymentVoucherDetails.length; i++) {
		if($('#tdsAmt_' + primaryId).val() > 0) {
			totalTdsAmount 		= Number(totalTdsAmount) + Number($('#tdsAmt_' + primaryId).val());
		}
	}	
	
	$('#totalTDSAmtCol').html(totalTdsAmount);
}