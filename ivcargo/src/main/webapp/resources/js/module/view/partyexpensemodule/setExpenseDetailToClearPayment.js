function setExpenseDetailsData(response) {
	var PartyWiseExpenseDetailList		= response.partyWiseExpenseDetailList;
	var PaymentTypeConstants			= response.paymentTypeConstants;
	
	showPartOfPage('bottom-border-boxshadow');
	removeTableRows('expenseDetails', 'table');
	removeTableRows('grandTotalRow', 'table');

	var totalAmount 				= 0.0;
	var grandTotalReceivedAmount	= 0.0;

	for(var i = 0; i < PartyWiseExpenseDetailList.length; i++) {
		var PartyWiseExpenseDetail		= PartyWiseExpenseDetailList[i];
		var srNo						= i + 1;
		var partyExpenseNumber			= PartyWiseExpenseDetail.partyExpenseNumber;
		var partyWiseExpenseDetailsId	= PartyWiseExpenseDetail.partyWiseExpenseDetailsId;
		var corporateAccountId			= PartyWiseExpenseDetail.corporateAccountId;
		var corporateAccountName		= PartyWiseExpenseDetail.corporateAccountName;
		var creationDateTimeString		= PartyWiseExpenseDetail.creationDateTimeString;
		var branchName					= PartyWiseExpenseDetail.branchName;
		var amount						= PartyWiseExpenseDetail.amount;
		var previousRemark				= PartyWiseExpenseDetail.remark;
		
		totalAmount		+= amount;
		
		var bankNameFeild			= createBankNameField(srNo);
		
		var tableRow				= createRowInTable(''+srNo+'', '', '');
		
		var checkBoxCol						= createColumnInRow(tableRow, '', '', '', '', '', '');
		var srNoCol							= createColumnInRow(tableRow, '', '', '', '', '', '');
		var partyExpenseNumberCol			= createColumnInRow(tableRow, 'partyExpenseNumber'+srNo+'', '', '', '', '', '');
		var partyWiseExpenseDetailsIdCol	= createColumnInRow(tableRow, 'partyWiseExpenseDetailsId'+srNo+'', '', '', '', 'display:none;', '');
		var previousRemarkCol				= createColumnInRow(tableRow, 'previousRemark'+srNo+'', '', '', '', '', '');
		var	corporateAccountIdCol			= createColumnInRow(tableRow, 'corporateAccountId'+srNo+'', '', '', '', 'display:none;', '');
		var	corporateAccountNameCol			= createColumnInRow(tableRow, 'corporateAccountName'+srNo+'', '', '', '', '', '');
		var creationDateTimeStringCol		= createColumnInRow(tableRow, 'creationDateTimeString'+srNo+'', '', '', '', '', '');
		var branchNameCol					= createColumnInRow(tableRow, 'partyExpenseNumber'+srNo+'', '', '', '', '', '');
		var paymentModeCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
		var remarkCol						= createColumnInRow(tableRow, '', '', '', '', '', '');
	//	var preRemarkCol					= createColumnInRow(tableRow, '', '', '', '', '', '');
		var amountCol						= createColumnInRow(tableRow, '', 'text-right', '', '', '', '');
		
		appendValueInTableCol(checkBoxCol, createCheckBoxColumn(srNo));
		appendValueInTableCol(srNoCol, srNo);
		appendValueInTableCol(partyExpenseNumberCol, partyExpenseNumber);
		appendValueInTableCol(partyWiseExpenseDetailsIdCol, partyWiseExpenseDetailsId);
		appendValueInTableCol(previousRemarkCol, previousRemark);
		appendValueInTableCol(corporateAccountIdCol, corporateAccountId);
		appendValueInTableCol(corporateAccountNameCol, corporateAccountName);
		appendValueInTableCol(creationDateTimeStringCol, creationDateTimeString);
		appendValueInTableCol(branchNameCol, branchName);
		appendValueInTableCol(paymentModeCol, createPaymentModeSelection(PaymentTypeConstants, srNo));
		appendValueInTableCol(remarkCol, createRemarkField(srNo));
		appendValueInTableCol(remarkCol, createCheckNumberField(srNo));
		appendValueInTableCol(remarkCol, createCheckDateField(srNo));
		appendValueInTableCol(remarkCol, createBankNameField(srNo));
		appendValueInTableCol(amountCol, createReceivedAmountFeild(amount,srNo));
		appendRowInTable('expenseDetails', tableRow);
											
	}
	
	$( function() {
	    $( '.chequeDate' ).datepicker({
	    	maxDate: new Date(),
	    	showAnim: "fold",
	    	 dateFormat: 'dd/mm/yy'
	    });
	  } );
	
	craeteRowForGrandTotal(totalAmount);
}

function createCheckBoxColumn(srNo){
	var checkBoxFeild		= $("<input/>",{
		type				:"checkbox",
		id					:'checkBox_'+srNo,
		name				: 'checkBox_' + srNo,
	});
	return checkBoxFeild;
}

function createBankNameField(srNo) {
	var bankNameFeild			= $("<input/>", { 
				type			: 'hidden', 
				id				: 'bankName_' + srNo, 
				class			: 'form-control hide', 
				name			: 'bankName_' + srNo, 
				placeholder		: 'Bank Name'});
	
	return bankNameFeild;
}
function createRemarkField(srNo) {
	var remarkFeild			= $("<input/>", { 
				type		: 'text', 
				id			: 'remark_' + srNo, 
				class		: 'form-control', 
				name		: 'remark_' + srNo, 
				placeholder	: 'Remark'});
	
	return remarkFeild;
}
function createPaymentModeSelection(PaymentTypeConstants, srNo) {
	var paymentModeSel = $('<select id="paymentMode_'+ srNo +'" name="paymentMode_'+ srNo +'" class="form-control col-xs-2" onchange="showHideChequeDetails(this);"/>');
	paymentModeSel.append($("<option>").attr('value', 0).text('---Select Mode---'));

	$(PaymentTypeConstants).each(function() {
		paymentModeSel.append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
	});
	
	return paymentModeSel;
}

function showHideChequeDetails(obj) {
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");

	if(obj.value != 1 && obj.value != 0) {
		switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'hide', 'show');
		switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'hide', 'show');
		switchHtmlTagClass('bankName_' + mySplitResult[1], 'hide', 'show');
	} else { 
		switchHtmlTagClass('chequeNumber_' + mySplitResult[1], 'show', 'hide');
		switchHtmlTagClass('chequeDate_' + mySplitResult[1], 'show', 'hide');
		switchHtmlTagClass('bankName_' + mySplitResult[1], 'show', 'hide');
	}
}

function createCheckNumberField(srNo) {
	var checkNumberFeild		= $("<input/>", { 
				type			: 'text', 
				id				: 'chequeNumber_' + srNo, 
				class			: 'form-control hide', 
				name			: 'chequeNumber_' + srNo, 
				placeholder		: 'Cheque No / Txn No.'});
	
	return checkNumberFeild;
}

function createCheckDateField(srNo) {
	var checkDateFeild			= $("<input/>", { 
					type		: 'text', 
					id			: 'chequeDate_' + srNo, 
					class		: 'form-control hide chequeDate', 
					name		: 'chequeDate_' + srNo, 
					placeholder	: 'Cheque Date / Txn Date', 
					onkeyup 	: 'setMonthYear(this);'});
	
	return checkDateFeild;
}

function createBankNameField(srNo) {
	var bankNameFeild			= $("<input/>", { 
				type			: 'text', 
				id				: 'bankName_' + srNo, 
				class			: 'form-control hide', 
				name			: 'bankName_' + srNo, 
				placeholder		: 'Bank Name'});
	
	return bankNameFeild;
}

function craeteRowForGrandTotal(totalAmount) {
	var createRow			= createRowInTable('totalCol', 'panel-footer panel-primary', 'background-color: red;');

	var blankCol1			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol2			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol3			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol4			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol5			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol6			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol7			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol8			= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var totalHeadingCol		= createColumnInRow(createRow, '', 'text-right', '', '', '', '');
	var totalAmountCol		= createColumnInRow(createRow, 'total', 'text-right', '', '', ' font-weight: bold', '');

	appendValueInTableCol(blankCol1, '');
	appendValueInTableCol(blankCol2, '');
	appendValueInTableCol(blankCol3, '');
	appendValueInTableCol(blankCol4, '');
	appendValueInTableCol(blankCol5, '');
	appendValueInTableCol(blankCol6, '');
	appendValueInTableCol(blankCol7, '');
	appendValueInTableCol(blankCol8, '');
	appendValueInTableCol(totalHeadingCol, '<b>Total</b>');
	appendValueInTableCol(totalAmountCol, ''+totalAmount+'');
	appendRowInTable('grandTotalRow', createRow);
}

function createReceivedAmountFeild(receivedAmount, srNo) {
	var receivedAmountFeild		= $("<input/>", { 
					type		: 'text', 
					id			: 'receivedAmt_' + srNo, 
					class		: 'form-control col-xs-1 text-right', 
					name		: 'receivedAmt_' + srNo, 
					value 		: receivedAmount, 
					placeholder	: 'Received Amount',
					readonly 	: 'readonly',});
	
	return receivedAmountFeild;
}
function formValidation(obj) {
	var objName			= obj.name;
	var mySplitResult 	= objName.split("_");
	
	var paymentMode		= getValueFromInputField('paymentMode_' + mySplitResult[1]);

	if(!validatePaymentMode(1, 'paymentMode_' + mySplitResult[1])) {
		return false;
	}
	
	if(paymentMode == 2) {
		if(!validateChequeNumber(1, 'chequeNumber_' + mySplitResult[1])) {
			return false;
		}
		
		if(!validateChequeDate(1, 'chequeDate_' + mySplitResult[1])) {
			return false;
		}
	}
	
	return true;
}
function enableButtons() {
	changeDisplayProperty('UpSaveButton', 'inline-block');
	changeDisplayProperty('DownSaveButton', 'inline-block');
}

function disableButtons() {
	changeDisplayProperty('UpSaveButton', 'none');
	changeDisplayProperty('DownSaveButton', 'none');
}