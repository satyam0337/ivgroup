var Total	 										= 0;
var TotalReceived									= 0;
var TotalBalnce	 									= 0;
var TotalReceivedAmt								= 0;
var GrandTotal	 									= 0;
var BalanceAMT		 								= 0;
var TotalBillCount	 								= 0;
var paymentTypeArr 									= new Array();
var clearWaybill 									= new Array();
var jsObjForWaybillids 								= new Object();
var jsObjForBalanceAmt 								= new Object();
var moduleId										= 0;
var incomeExpenseModuleId							= 0;
var typeOfSelect									= 0;
var bankAccountNotMandatory							= false;
var cardNumberNotMandatory							= true;
var allowBillClearancePartialPayment				= false;
var allowBillClearanceNegotiatedPayment				= false;
var corporateAccountId								= 0;
var	bills											= null;
var allowChequeBouncePayment						= false;
var accountGroupId									= 0;
var ModuleIdentifierConstant						= null;
var executive										= null;
var billCreationDate								= null;
var billcreationDateString							= null;
var debitToBranch									= false;
var debitToBranchArr								= null;
var discountInPercent								= 0;
var partialBillId									= 0;
var partialBillAmt									= 0;
var totalBillAmount									= 0;
var totalBillReceived								= 0;
var curSystemDate 	= new Date('<%=new SimpleDateFormat("MMMMM d, yyyy HH:mm:ss").format(new Date())%>');
var curDate 		= new Date(curSystemDate);
var onAccountDetailsList							= null;
var onAccountDetailsArr								= new Array();
var onAccountDetailsObj								= null;
var totalOnAccountBalanceAmount						= 0.0;
var totalBillReceivedAmount							= 0.0;
var selectedBillNoList								= new Array();
var isBillChecked									= false;
var billDateArray									= new Array();
var onAccountPaymentValuesArray						= new Array();
var invoicePaymentType_0							= 0;
var GeneralConfiguration							= null;
var billClearanceBadDebtPayment						= false;
var isBadDepthPayment								= false;
var	subIdsStr 										= null;
var billIdsStr 										= null;
var PaymentTypeConstant								= null;
var TOKEN_KEY										= null;
var TOKEN_VALUE										= null;	
var tokenWiseCheckingForDuplicateTransaction		= false;
var totalTdsAmount									= 0;
var allowAllPaymentTypeForOnAccount					= false;

function setupMultipleBillClearanceDetails(typeOfSel, response) {
	bills						= response.bills;
	typeOfSelect				= typeOfSel;
	allowChequeBouncePayment	= response.allowChequeBouncePayment;
	accountGroupId				= response.accountGroupId;
	executive					= response.executive;
	debitToBranch				= response.debitToBranch;
	debitToBranchArr			= response.debitToBranchArr;
	partialBillId				= response.partialBillId;
	partialBillAmt				= response.partialBillAmt;
	onAccountDetailsList		= response.onAccountDetailsList
	billClearanceBadDebtPayment = response.billClearanceBadDebtPayment;
	TOKEN_KEY					= response.TOKEN_KEY;
	TOKEN_VALUE					= response.TOKEN_VALUE;
	tokenWiseCheckingForDuplicateTransaction	=	response.tokenWiseCheckingForDuplicateTransaction;
	
	for (let row = 0; bills.length > row; row++) {
		Total 				= parseFloat(bills[row].grandTotal);
		TotalReceived		= parseFloat(bills[row].totalReceivedAmount);
		TotalBalnce 		= parseFloat(bills[row].balAmount);
		GrandTotal 			+= Total;
		BalanceAMT 			+= TotalBalnce;	
		TotalReceivedAmt	+= TotalReceived;
		TotalBillCount++;
	}
	
	loadDataForBillClearncePannel(bills);
	
	setTimeout(() => {
		if(partialBillId > 0){
			setPartialBillDetails();
		}
	}, 200);
	
}

function setPartialBillDetails(){
	let bal = Number($('#balanceInnerTbl_'+partialBillId).val());
	bal 	= bal - partialBillAmt;
	
	let tableEl = document.getElementById("ratessubEditTable");
	let rows	= tableEl.children[1].rows;
	
	for(const element of rows) {
		let col 			= element.cells[4].childNodes[0];
		col.value			= 2;
		let id				= col.id;
		$('#balanceInnerTbl_' + id).val(0)
		$('#' + id).prop('disabled', true);
	}
	
	$('#paymentType').val(2);
	$('#paymentType').prop('disabled',true);
	$('#jsPanelDataContentForBill').css('display','block');
	$('#paymenttypeInnerTbl_' + partialBillId).val(3);
	$('#paymenttypeInnerTbl_' + partialBillId).prop('disabled', true);
	$('#txnAmtInnerTbl_' + partialBillId).val(partialBillAmt);
	$('#txnAmtInnerTbl_' + partialBillId).prop('disabled', true);
	$('#recAmtInnerTbl_' + partialBillId).val(partialBillAmt);
	
	if (billPaymentConfig.allowToEnterAmountInDecimal)
		$('#balanceInnerTbl_' + partialBillId).val(toFixedWhenDecimal(bal));
	else
		$('#balanceInnerTbl_' + partialBillId).val(Math.round(bal));
}

function loadDataForBillClearncePannel(bills) {

	showLayer();
	let jsonObject		= new Object();
	jsonObject.filter	= 1;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MakePaymentAjaxAction.do?pageId=303&eventId=1",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else{
					jsondata							= data;
					tdsConfiguration					= jsondata.tdsConfiguration;
					TDSTxnDetailsIdentifiers			= jsondata.TDSTxnDetailsIdentifiers;
					IsPANNumberMandetory				= tdsConfiguration.IsPANNumberMandetory;
					IsTANNumberMandetory				= tdsConfiguration.IsTANNumberMandetory;
					isTDSChargeInPercentAllow			= tdsConfiguration.IsTDSInPercentAllow;
					BillClearanceTDSChargeInPercent		= tdsConfiguration.TDSChargeInPercent;
					allowBackDateEntryForBillPayment	= jsondata.allowBackDateEntryForBillPayment;
					previousDate						= jsondata.previousDate;
					billPaymentConfig					= jsondata.billPaymentConfig;
					paymentTypeArr						= jsondata.paymentTypeArr;
					moduleId							= jsondata.moduleId;
					incomeExpenseModuleId				= jsondata.incomeExpenseModuleId;
					allowBillClearancePartialPayment	= jsondata.allowBillClearancePartialPayment;
					allowBillClearanceNegotiatedPayment	= jsondata.allowBillClearanceNegotiatedPayment;
					ModuleIdentifierConstant			= jsondata.ModuleIdentifierConstant;
					discountInPercent					= jsondata.discountInPercent;
					GeneralConfiguration				= jsondata.GeneralConfiguration
					PaymentTypeConstant					= jsondata.PaymentTypeConstant;
					allowAllPaymentTypeForOnAccount		= billPaymentConfig.allowAllPaymentTypeForOnAccount;		

					setPaymentType();
					setPaymentMode('paymentMode');
					setTotalAmt();
					setBalanceAmount();
					setTotalReceivedAmount();
					setReceivedAmount();
					setDataForBillWiseTable(bills);
					showHideColIfTdsAllow();
					setDateCalender();
					setAmountForPayment();
					loadPaymentTypeModal();
					loadChequeBounceModal();
					setOnAccountDetails();
					showHideTaxCol();
					
					if(tdsConfiguration.tdsRateSelectionAllow) {
						$('#tdsContainer').closest('td').removeClass('hide');
											
						if(jsondata.tdsChargeList != undefined && jsondata.tdsChargeList != null)
							createTDSDropdown(jsondata.tdsChargeList, bills);
						
						if(!tdsConfiguration.IsCheckboxOptionToAllowTDS)
							$('#tdsCheckBox').remove();
					}

					hideLayer();
				}
			});

}

function setPaymentType() {
	removeOption('paymentType', null);
	createOption('paymentType', 0, '--Payment Type--');
	createOption('paymentType', PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	
	if(billPaymentConfig.showBillPaymentOptionsPermissionWise) {
		if(allowBillClearanceNegotiatedPayment)
			createOption('paymentType', PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		
		if(allowBillClearancePartialPayment)
			createOption('paymentType', PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	} else {
		createOption('paymentType', PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		createOption('paymentType', PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	}

	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > 0) {
		$('#paymentType' + " option[value='" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID + "']").remove();
		$('#paymentType').prepend("<option value='" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID + "' selected='selected'>" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME + "</option>");
		$('#paymentType').change();
		$('#paymentType').prop('disabled', true);
	}
	
	if(billClearanceBadDebtPayment)
		createOption('paymentType', PAYMENT_TYPE_STATUS_BAD_DEBT_ID, PAYMENT_TYPE_STATUS_BAD_DEBT_NAME);
}

function setPaymentMode(elementId) {
    /*
     * Property based will be done
     */
    removeOption('paymentMode', null);
    createOption('paymentMode', 0, '---Select Mode---');

    if(!jQuery.isEmptyObject(paymentTypeArr)) {
        
        if(allowAllPaymentTypeForOnAccount && typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null){
            $('#' + elementId).append('<option value="' + PAYMENT_TYPE_CASH_ID + '" id="' + PAYMENT_TYPE_CASH_ID + '">' + PAYMENT_TYPE_CASH_NAME + '</option>');
        } else {
            for(const element of paymentTypeArr) {
                if(element != null)
                    $('#' + elementId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
            }
        }
    }
}

function setTotalAmt() {
	$("#totalAmount").val(GrandTotal);
}

function setBalanceAmount() {
	if(billPaymentConfig.showReceivedAmountFeild) {
		if($('#receivedAmountValue').val() > 0) {
			if (billPaymentConfig.allowToEnterAmountInDecimal)
				$("#balanceAmount").val(toFixedWhenDecimal(BalanceAMT - $('#receivedAmountValue').val()));	
			else
				$("#balanceAmount").val(Math.round(BalanceAMT - $('#receivedAmountValue').val()));	

			if((BalanceAMT - $('#receivedAmountValue').val()) == 0)
				$("#paymentType").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);	
		} else if (billPaymentConfig.allowToEnterAmountInDecimal)
			$("#balanceAmount").val(toFixedWhenDecimal(BalanceAMT));
		else
			$("#balanceAmount").val(Math.round(BalanceAMT));
	} else if (billPaymentConfig.allowToEnterAmountInDecimal)
		$("#balanceAmount").val(toFixedWhenDecimal(BalanceAMT));
	else
		$("#balanceAmount").val(Math.round(BalanceAMT));	
}

function setTotalReceivedAmount() {
	$("#totalReceivedAmount").val(TotalReceivedAmt);
}

function setReceivedAmount() {
	$("#receivedAmtLimit").val(GrandTotal - BalanceAMT);

	if((billPaymentConfig.showReceivedAmountFeild || billPaymentConfig.showReceivedAmountFeild == true)
		&& $('#receivedAmountValue').val() > 0)
		$("#receivedAmount").val($('#receivedAmountValue').val());
}

function setDataForBillWiseTable(bills) {
	makepayementbillnolist = new Array();
	
	if(debitToBranch)
		$("#debitToBranchCol").css('display','block');
	
	billDateArray	= new Array();
	
	for (const element of bills) {
		let bno 				= element.billNumber;
		let billId				= parseInt(element.billId);
		let creditorId			= parseInt(element.creditorId);
		let panNumber			= element.panNumber;
		
		
		let branchId			= parseInt(element.branchId);
		corporateAccountId		= parseInt(element.creditorId);
		billCreationDate		= (element.billCreationTimestamp);
		billcreationDateString	= (element.creationDateTimeStampString);
		let billCreationDateStr	= (element.creationDateTimeStampString);
		
		billDateArray.push(billCreationDateStr);
		
		let receivedAmount	= 0;
		let balanceAmount	= 0;
		let status			= 0;
		let receivedAmtLimit = 0;
		let billCheckBox 	= null;
		let panNumberCol 	= null;
		let tanNumberCol 	= null;
		let debitToBranchCol= null;
		let txnAmountCol	= null;
		let tdsAmtCol		= null;
		let claimAmtCol		= null;
		let deductionAmtCol	= null;
		
		if (billPaymentConfig.allowToEnterAmountInDecimal)
			receivedAmtLimit = (parseFloat(element.totalReceivedAmount)).toFixed(2);
		else
			receivedAmtLimit = parseInt(element.totalReceivedAmount);

		if(billPaymentConfig.showReceivedAmountFeild && jsDataPanelHM != null && jsDataPanelHM.hasOwnProperty(billId)) {
			let jsDataPanelObject = jsDataPanelHM[billId];

			receivedAmount	= jsDataPanelObject.ReceivedAmount;
			balanceAmount	= jsDataPanelObject.BalanceAmount;
			status 			= jsDataPanelObject.Status;
		}

		let billRow					= createRowInTable('tr_' + billId, 'tr_' + billId, '');
		let billNoCol				= createColumnInRow(billRow , 'BillNo_' + billId, 'BillNo_' + billId, '5%', 'left', '', '');
		
		if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null) {
			$('#billCheckBox').removeClass('hide');
			billCheckBox 		= createColumnInRow(billRow , 'billCheckBox_' + billId, 'billCheckBox_' + billId, '5%', 'center', '', '');
		} else
			$('#billCheckBox').addClass('hide');
		
		if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsPANNumberRequired)
			panNumberCol	 		= createColumnInRow(billRow , 'panNumber_' + billId, 'panNumber_' + billId, '10%', 'left', '', '');
		
		if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsTANNumberRequired)
			tanNumberCol	 		= createColumnInRow(billRow , 'tanNumber_' + billId, 'tanNumber_' + billId, '10%', 'left', '', '');

		let paymentModeCol 			= createColumnInRow(billRow , 'PaymentMode_' + billId, 'PaymentMode_' + billId, '10%', 'left', '', '');
		let remarkCol	 			= createColumnInRow(billRow , 'remark_' + billId, 'remark_' + billId, '10%', 'left', '', '');
		let paymentTypeCol	 		= createColumnInRow(billRow , 'PaymentType_' + billId, 'PaymentType_' + billId, '10%', 'left', '', '');

		if(billPaymentConfig.showCgstSgstIgstColumn) {
			var totalAmtWithoutTaxCol	= createColumnInRow(billRow , 'TotalAmtWithoutTax_' + billId, 'TotalAmtWithoutTax_' + billId, '8%','left','','');
			var cgstAmountCol		 	= createColumnInRow(billRow , 'CGSTAmount_' + billId, 'CGSTAmount_' + billId, '5%','left','','');
			var sgstAmountCol		 	= createColumnInRow(billRow , 'SGSTAmount_' + billId, 'SGSTAmount_' + billId, '5%','left','','');
			var igstAmountCol		 	= createColumnInRow(billRow , 'IGSTAmount_' + billId, 'IGSTAmount_' + billId, '5%','left','','');									
		}
		
		let totalAmountCol	 		= createColumnInRow(billRow , 'TotalAmount_' + billId, 'TotalAmount_' + billId, '10%','left','','');
		let receivedAmountCol	 	= createColumnInRow(billRow , 'ReceivedAmount_' + billId, 'TotalAmount_' + billId, '8%','left','','');

		if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
			txnAmountCol	 		= createColumnInRow(billRow , 'txnAmount_' + billId, 'txnAmount_' + billId, '10%','left','','');

		if(tdsConfiguration.IsTdsAllow)
			tdsAmtCol		 		= createColumnInRow(billRow , 'tdsAmount_' + billId, 'tdsAmount_' + billId, '7%','left','','');
		
		if(billPaymentConfig.isAllowClaimEntry)
			claimAmtCol				= createColumnInRow(billRow , 'claimAmount_' + billId, 'claimAmount_' + billId, '7%','left','','');
		
		if(billPaymentConfig.isAllowDeductionEntry)
			deductionAmtCol			= createColumnInRow(billRow , 'deductionAmount_' + billId, 'deductionAmount_' + billId, '7%','left','','');
		
		let billCreationDateCol		= createColumnInRow(billRow , 'billCreationDate_' + billId, 'billCreationDate_' + billId, '7%','left','display:none','');
		
		let receiveAmtCol	 		= createColumnInRow(billRow , 'ReceiveAmt_' + billId, 'ReceiveAmt_' + billId, '10%','left','','');
		let balanceCol		 		= createColumnInRow(billRow , 'Balance_' + billId, 'Balance_' + billId, '20%','left','','');
		
		if(debitToBranch)
			debitToBranchCol		= createColumnInRow(billRow , 'debitToBranch_' + billId, 'debitToBranch_' + billId, '20%','left','','');
		
		appendValueInTableCol(billNoCol, bno);
		appendValueInTableCol(billNoCol, '<input name="billNoInnerTbl_' + billId + '" id="billNoInnerTbl_' + billId + '" type="hidden" value=' + bno + '>');
		appendValueInTableCol(billNoCol, '<input name="creditorIdInnerTbl_' + billId + '" id="creditorIdInnerTbl_' + billId + '" type="hidden" value=' + creditorId + '>');
		appendValueInTableCol(billNoCol, '<input name="receivedAmtLimitInnerTbl_' + billId + '" id="receivedAmtLimitInnerTbl_' + billId + '" type="hidden" value=' + receivedAmtLimit + '>');
		appendValueInTableCol(billNoCol, '<input name="branchIdInnerTbl_' + billId + '" id="branchIdInnerTbl_' + billId + '" type="hidden" value=' + branchId + '>');
		
		if(billCheckBox != null)
			appendValueInTableCol(billCheckBox, '<input name="billCheckBoxInnerTbl_' + billId + '" id="billCheckBoxInnerTbl_' + billId + '" type="checkbox">');
		
		if(panNumberCol != null)
			appendValueInTableCol(panNumberCol, '<input name="panNumberInnerTbl_' + billId + '" id="panNumberInnerTbl_' + billId + '" maxlength="10" width="250px;" class="form-control panNumberInnerTblCls" placeholder="PAN Number"/>');
		
		if(tanNumberCol != null)
			appendValueInTableCol(tanNumberCol, '<input name="tanNumberInnerTbl_' + billId + '" id="tanNumberInnerTbl_' + billId + '" maxlength="10" width="250px;" class="form-control tanNumberInnerTblCls" placeholder="TAN Number"/>');

		appendValueInTableCol(paymentModeCol, '<select name="paymentModeInnerTbl_' + billId + '" id="paymentModeInnerTbl_' + billId + '" width="250px;" onchange="setValueToInnerTableOnPaymentModeChange(' + billId + ',this);removeError(paymentModeInnerTbl_' + billId + ');" class="form-control paymentModeInnerTblCls" ></select>');
		
		if(billPaymentConfig.chequeBounceRequired)
			appendValueInTableCol(paymentModeCol, '<input align="right" name="isAllowChequePaymentInnerTbl_' + billId + '" id="isAllowChequePaymentInnerTbl_' + billId + '" type="hidden" value="0">');
		
		appendValueInTableCol(remarkCol, '<input align="right" name="remarkInnerTbl_' + billId + '" id="remarkInnerTbl_' + billId + '" maxlength="50" class="form-control remarkInnerTblCls"  type="text" placeholder="Remark" >');
		appendValueInTableCol(remarkCol, '<div class= "ChequeBlockInnerTblCLs"><input align="right" style="display :none;" name="chequeInnerTbl_' + billId + '" id="chequeInnerTbl_' + billId + '" type="text" class = "form-control ChequeInnerTblClass" placeholder="Cheque No/ Txn. ID" /></div><input align="right" name="ChequeDateInnerTbl_' + billId + '" id="ChequeDateInnerTbl_' + billId + '" placeholder="Cheque / Txn. Date" type="text" onkeyup="setMonthYear(this);" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"; style="display :none;" class = "form-control ChequeDateInnerTblClass" /><input align="right" name="bankNameInnerTbl_' + billId+'" id="bankNameInnerTbl_' + billId + '" type="text" style="display :none;" class = "form-control bankNameInnerTblClass" placeholder="Bank Name" />');
		appendValueInTableCol(remarkCol, '');

		if(billPaymentConfig.showReceivedAmountFeild) {
			if($('#receivedAmountValue').val() > 0)
				appendValueInTableCol(paymentTypeCol, '<select style="height: " id="paymenttypeInnerTbl_' + billId + '" value="'+status+'" class="form-control paymenttypeInnerTblCls"  name="paymenttypeInnerTbl_' + billId + '" ></select>');
			else
				appendValueInTableCol(paymentTypeCol, '<select style="height: " id="paymenttypeInnerTbl_' + billId + '" class="form-control paymenttypeInnerTblCls" onchange="setValueToInnerTablePayment(' + billId + '); setValueToInnerTableReceviedChange(' + billId + '); displayPartialPaymentSelectionDropdown(' + billId + ');removeError(paymenttypeInnerTbl_' + billId + ');" name="paymenttypeInnerTbl_' + billId + '" ></select>');
		} else
			appendValueInTableCol(paymentTypeCol, '<select style="height: " id="paymenttypeInnerTbl_' + billId + '" class="form-control paymenttypeInnerTblCls" onchange="setValueToInnerTablePayment(' + billId + '); setValueToInnerTableReceviedChange(' + billId + '); displayPartialPaymentSelectionDropdown(' + billId + ');removeError(paymenttypeInnerTbl_' + billId + ');" name="paymenttypeInnerTbl_' + billId + '" ></select>');

		if(billPaymentConfig.showCgstSgstIgstColumn) {
			appendValueInTableCol(totalAmtWithoutTaxCol, '<input align="right" name="amountInnerTbl_' + billId + '"  id="amountInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
			appendValueInTableCol(cgstAmountCol, '<input align="right" name="cgstAmtInnerTbl_' + billId + '"  id="cgstAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
			appendValueInTableCol(sgstAmountCol, '<input align="right" name="sgstAmtInnerTbl_' + billId + '"  id="sgstAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
			appendValueInTableCol(igstAmountCol, '<input align="right" name="igstAmtInnerTbl_' + billId + '"  id="igstAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
		}
		
		appendValueInTableCol(totalAmountCol, '<input align="right" name="totAmtInnerTbl_' + billId + '"  id="totAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
		appendValueInTableCol(receivedAmountCol, '<input align="right" name="receivedAmtInnerTbl_' + billId + '"  id="receivedAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control" value="' + receivedAmtLimit + '"/>');

		if(txnAmountCol != null) {
			if(billPaymentConfig.allowToEnterAmountInDecimal)
				appendValueInTableCol(txnAmountCol, '<input align="right" name="txnAmtInnerTbl_' + billId + '"  id="txnAmtInnerTbl_' + billId + '" placeholder="0" class="form-control" type="text" value="0" maxlength="10" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);validateTxnAmount(this);calculateTDS(this);allowTdsOnPaymentTypeSelection(' + billId + ');" onkeypress="return isNumberKeyWithDecimal(event,this.id);" onkeyup="validateTxnAmount(this);calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');allowTdsOnPaymentTypeSelection(' + billId + ');"/>');
			else
				appendValueInTableCol(txnAmountCol, '<input align="right" name="txnAmtInnerTbl_' + billId + '"  id="txnAmtInnerTbl_' + billId + '" placeholder="0" class="form-control" type="text" value="0" maxlength="7" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);validateTxnAmount(this);calculateTDS(this);allowTdsOnPaymentTypeSelection(' + billId + ');" onkeypress="return noNumbers(event ,this);" onkeyup="validateTxnAmount(this);calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');allowTdsOnPaymentTypeSelection(' + billId + ');"/>');
		}

		if(tdsAmtCol != null) {
			if(billPaymentConfig.allowToEnterAmountInDecimal && tdsConfiguration.IsAllowEditableTdsAmount) 
                appendValueInTableCol(tdsAmtCol, '<input align="right" name="tdsAmtInnerTbl_' + billId + '" maxlength="10" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return isNumberKeyWithDecimal(event,this.id);if(getKeyCode(event) == 17){return false;}"  id="tdsAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
            else if(billPaymentConfig.allowToEnterAmountInDecimal)
				appendValueInTableCol(tdsAmtCol, '<input align="right" name="tdsAmtInnerTbl_' + billId + '" maxlength="10" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);allowTdsOnPaymentTypeSelection(' + billId + ');" onkeypress="return isNumberKeyWithDecimal(event,this.id);if(getKeyCode(event) == 17){return false;}"  id="tdsAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');allowTdsOnPaymentTypeSelection(' + billId + ');"/>');
			else if(tdsConfiguration.IsAllowEditableTdsAmount)
				appendValueInTableCol(tdsAmtCol, '<input align="right" name="tdsAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="tdsAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
			else
				appendValueInTableCol(tdsAmtCol, '<input align="right" name="tdsAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);allowTdsOnPaymentTypeSelection(' + billId + ');" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="tdsAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');allowTdsOnPaymentTypeSelection(' + billId + ');"/>');
		}
		
		if(claimAmtCol != null) {
			if(billPaymentConfig.allowToEnterAmountInDecimal)
				appendValueInTableCol(claimAmtCol, '<input align="right" name="claimAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return isNumberKeyWithDecimal(event,this.id);if(getKeyCode(event) == 17){return false;}"  id="claimAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
			else
				appendValueInTableCol(claimAmtCol, '<input align="right" name="claimAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="claimAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
		}
		
		if(deductionAmtCol != null) {
			if(billPaymentConfig.allowToEnterAmountInDecimal)
				appendValueInTableCol(deductionAmtCol, '<input align="right" name="deductionAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return isNumberKeyWithDecimal(event,this.id);if(getKeyCode(event) == 17){return false;}"  id="deductionAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
			else
				appendValueInTableCol(deductionAmtCol, '<input align="right" name="deductionAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);calculateTDS(this);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="deductionAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="calculateTDS(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
		}
		
		appendValueInTableCol(billCreationDateCol, '<input align="left" name="billCreationDateInnerTbl_' + billId + '" maxlength="7" placeholder="Bill Date" class="form-control" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);" onkeypress=""  id="billCreationDateInnerTbl_' + billId + '" type="text" value="" onkeyup="" readonly="readonly"/>');

		appendValueInTableCol(receiveAmtCol, '<span><select id="partialPaymentSelection_' + billId + '" class="form-control partialPaymentSelectionTblCls col-sm-3 hide" onchange="setValueToInnerTablePayment(' + billId + ');setValueToInnerTableReceviedChange(' + billId + ');" name="partialPaymentSelectionInnerTbl_' + billId + '" ></select></span>');

		if(billPaymentConfig.showReceivedAmountFeild){
			if($('#receivedAmountValue').val() > 0)
				appendValueInTableCol(receiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount"  class="form-control recAmtInnerTblCls"  id="recAmtInnerTbl_' + billId + '" value="'+ receivedAmount +'" type="text" readonly="readonly"></span>');
			else
				appendValueInTableCol(receiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');removeError(recAmtInnerTbl_' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="resetTextFeild(this, 0);clearOnfocus(this);" onblur="resetTextFeild(this, 0);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text"></span>');
		} else if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
			appendValueInTableCol(receiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');removeError(recAmtInnerTbl_' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="clearOnfocus(this);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text" readonly="readonly"></span>');
		else
			appendValueInTableCol(receiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');removeError(recAmtInnerTbl_' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="resetTextFeild(this, 0);clearOnfocus(this);" onblur="resetTextFeild(this, 0);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text"></span>');

		if(billPaymentConfig.showReceivedAmountFeild) {
			if($('#receivedAmountValue').val() > 0)
				appendValueInTableCol(balanceCol, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" id="balanceInnerTbl_' + billId + '" value="'+ balanceAmount +'" type="text" readonly="readonly" class="form-control" >');
			else
				appendValueInTableCol(balanceCol, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" readonly="readonly" id="balanceInnerTbl_' + billId + '" type="text" class="form-control" >');
		} else
			appendValueInTableCol(balanceCol, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" readonly="readonly" id="balanceInnerTbl_' + billId + '" type="text" class="form-control" >');
		
		if(debitToBranchCol != null)
			appendValueInTableCol(debitToBranchCol, '<select  style="height: " id="debitToBranchSelectionInnerTbl_' + billId + '" class="form-control" onchange="" name="debitToBranchSelectionInnerTbl_' + billId + '" ></select>');
		
		$('#ratessubEditTable').append(billRow);

		$( function() {
			$('#ChequeDateInnerTbl_' + billId).datepicker({
				maxDate: new Date(),
				showAnim: "fold",
				dateFormat: 'dd-mm-yy'
			});
		} );

		setPaymentModeInnerTable(billId, 'paymentModeInnerTbl_');
		setDebitToBranchInnerTable(billId, 'debitToBranchSelectionInnerTbl_');
		
		let totAmtForInnerTable 	= element.grandTotal;
		let totAmtForInnerTable1 	= element.balAmount;
		let cgstTaxAmt 		   		= element.cgstTax;
		let sgstTaxAmt 		   		= element.sgstTax;
		let igstTaxAmt 		   		= element.igstTax;
		let totalAmtWithoutTax 		= element.totalAmtWithoutTax;
		
		if (billPaymentConfig.allowToEnterAmountInDecimal) {
			totAmtForInnerTable		= toFixedWhenDecimal(totAmtForInnerTable);
			totAmtForInnerTable1	= toFixedWhenDecimal(totAmtForInnerTable1);
		} else {
			totAmtForInnerTable 	= Math.round(totAmtForInnerTable);
			totAmtForInnerTable1 	= Math.round(totAmtForInnerTable1);
		}

		if(billPaymentConfig.showReceivedAmountFeild) {
			if($('#receivedAmountValue').val() > 0)
				setTotalAmtInnerTable(billId, balanceAmount, totAmtForInnerTable1);
			else
				setTotalAmtInnerTable(billId, totAmtForInnerTable, totAmtForInnerTable1);
		} else
			setTotalAmtInnerTable(billId, totAmtForInnerTable, totAmtForInnerTable1);

		if(billPaymentConfig.showCgstSgstIgstColumn)
			setTaxes(billId, cgstTaxAmt, sgstTaxAmt, igstTaxAmt, totalAmtWithoutTax);
		
		setPaymentTypeInnerTable(billId, status);
		makepayementbillnolist.push(billId);
		setPartialPaymentSelection(billId);
		
		if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
			setValueToInnerTablePayment(billId);
			setBillCreationDate(billId, billCreationDateStr);
		}
		
		setPanNumber(panNumber, billId);
	}
	
}

function setTaxes(row,cgstTaxAmt, sgstTaxAmt, igstTaxAmt, totalAmtWithoutTax) {
	$("#cgstAmtInnerTbl_" + row).val(cgstTaxAmt);
	$("#sgstAmtInnerTbl_" + row).val(sgstTaxAmt);
	$("#igstAmtInnerTbl_" + row).val(igstTaxAmt);
	$("#amountInnerTbl_" + row).val(totalAmtWithoutTax);
}

function showHideTaxCol() {
	if(billPaymentConfig.showCgstSgstIgstColumn) {
		$(".amtWithoutTaxCol").show();
		$(".cgstAmountCol").show();
		$(".sgstAmountCol").show();
		$(".igstAmountCol").show();
	}
}

function setTotalAmtInnerTable(row,totAmtForInnerTable, totAmtForInnerTable1) {
	$("#totAmtInnerTbl_" + row).val(totAmtForInnerTable);
	$("#balanceInnerTbl_" + row).val(totAmtForInnerTable1);
	jsObjForBalanceAmt[row] = totAmtForInnerTable1;
}

function setPaymentModeInnerTable(billId, elementId) {
	/*
	 * Property based will be done
	 */
	removeOption('paymentModeInnerTbl_' + billId, null);

	createOption('paymentModeInnerTbl_' + billId, 0, '----Select Mode----');

	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(const element of paymentTypeArr) {
			if(element != null)
				$('#' + elementId + billId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
		}
	}
	
	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > 0) {
		$('#paymentModeInnerTbl_' + billId + " option[value='"+PAYMENT_TYPE_CASH_ID+"']").remove();
		$('#paymentModeInnerTbl_' + billId).prepend("<option value='"+PAYMENT_TYPE_CASH_ID+"' selected='selected'>"+PAYMENT_TYPE_CASH_NAME+"</option>");
	}
}

function setDebitToBranchInnerTable(billId, elementId){
	removeOption('debitToBranchSelectionInnerTbl_' + billId, null);

	createOption('debitToBranchSelectionInnerTbl_' + billId, 0, '----Select Branch----');
	
	if(!jQuery.isEmptyObject(debitToBranchArr)) {
		for(const element of debitToBranchArr) {
			if(element != null)
				$('#' + elementId + billId).append('<option value="' + element.branchId + '" id="' + element.branchId + '">' + element.branchName + '</option>');
		}
	}
}

function setPaymentTypeInnerTable(billId,status) {

	removeOption('paymenttypeInnerTbl_' + billId, null);

	createOption('paymenttypeInnerTbl_' + billId, 0, '--Payment Type--');
	createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	
	if(billPaymentConfig.showBillPaymentOptionsPermissionWise) {
		if(allowBillClearanceNegotiatedPayment)
			createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		
		if(allowBillClearancePartialPayment)
			createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	} else {
		createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	}
	
	if(billClearanceBadDebtPayment)
		createOption('paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_BAD_DEBT_ID, PAYMENT_TYPE_STATUS_BAD_DEBT_NAME);
	
	if(billPaymentConfig.showReceivedAmountFeild) {
		if($('#receivedAmountValue').val() > 0) {
			$('#paymenttypeInnerTbl_'+ billId + " option[value='" + status + "']").remove();

			if(status == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
				$('#paymenttypeInnerTbl_' + billId).prepend("<option value='" + status + "' selected='selected'>" + PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME + "</option>");
			else if(status == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
				$('#paymenttypeInnerTbl_' + billId).prepend("<option value='" + status + "' selected='selected'>" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME + "</option>");

			$('#paymenttypeInnerTbl_' + billId).change();
			$('#paymenttypeInnerTbl_' + billId).prop('disabled', true);
		}
	}
	
	if(!allowAllPaymentTypeForOnAccount && typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
		$('#paymentTypeInnerTableTh').addClass('hide');
		$('#PaymentType_' + billId).addClass('hide');
		$('#paymenttypeInnerTbl_' + billId).addClass('hide');
		
		$('#paymentModeInnerTableTh').addClass('hide');
		$('#PaymentMode_' + billId).addClass('hide');
		$('#paymentModeInnerTbl_' + billId).addClass('hide');
	} else {
		$('#paymentTypeInnerTableTh').removeClass('hide');
		$('#PaymentType_' + billId).removeClass('hide');
		$('#paymenttypeInnerTbl_' + billId).removeClass('hide');
		
		$('#paymentModeInnerTableTh').removeClass('hide');
		$('#PaymentMode_' + billId).removeClass('hide');
		$('#paymentModeInnerTbl_' + billId).removeClass('hide');
	}
}

function setPartialPaymentSelection(billId) {
	operationOnSelectTag('partialPaymentSelection_' + billId, 'removeAll', null, null);
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', '----Select----', '0');
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', LR_WISE_PARTIAL_PAYMENT_NAME, LR_WISE_PARTIAL_PAYMENT_ID);
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', WITHOUT_LR_WISE_PARTIAL_PAYMENT_NAME, WITHOUT_LR_WISE_PARTIAL_PAYMENT_ID);
}

function setBillCreationDate(billId,billCreationDateStr) {
	$("#billCreationDateInnerTbl_" + billId).val(billCreationDateStr);
}

function showHideColIfTdsAllow() {
	if(tdsConfiguration.IsTdsAllow) {
		if(tdsConfiguration.IsPANNumberRequired)
			$(".panNumberCol").show();
		
		if(tdsConfiguration.IsTANNumberRequired)
			$(".tanNumberCol").show();
			
		$(".txnAmountCol").show();
		$(".tdsAmountCol").show();
	}
	
	if(billPaymentConfig.isAllowClaimEntry) { 
		$(".txnAmountCol").show();
		$(".claimAmountCol").show();
	}
	
	if(billPaymentConfig.isAllowDeductionEntry) { 
		$(".txnAmountCol").show();
		$(".deductionAmountCol").show();
	}
}

function setDateCalender() {

	$( function() {
		$('#jspanelchequedate').datepicker({
			maxDate		: new Date(),
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy',
			onSelect	: function(datetext) {
				let d = new Date(); // for now
				let h = d.getHours();
				h = (h < 10) ? ("0" + h) : h ;

				let m = d.getMinutes();
				m = (m < 10) ? ("0" + m) : m ;

				let s = d.getSeconds();
				s = (s < 10) ? ("0" + s) : s ;

				datetext = datetext + " " + h + ":" + m + ":" + s;
				setInnerTableDate(datetext);
			},
		});
	} );

	$( function() {
		$('#backDate').datepicker({
			maxDate		: new Date(),
			minDate		: previousDate,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy',
			onSelect: function(datetext){
				let d = new Date(); // for now
				let h = d.getHours();
				h = (h < 10) ? ("0" + h) : h ;

				let m = d.getMinutes();
				m = (m < 10) ? ("0" + m) : m ;

				let s = d.getSeconds();
				s = (s < 10) ? ("0" + s) : s ;

				datetext = datetext + " " + h + ":" + m + ":" + s;
				$('#backDate').val(datetext);
			},
		});

		$("#backDate").datepicker("setDate", new Date());
	} );

	if(!allowBackDateEntryForBillPayment)
		$("#backDate").attr('disabled', true);
}

function setAmountForPayment() {

	totalTdsAmount		= 0;
	let typeOfSelection	= typeOfSelect;

	if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL) {
		$("#jsPanelDataContentForBill").show();
		$("#jsPanelDataContent").hide();
		$("#jsPanelDataContent").empty();
	}
	
	if(!allowAllPaymentTypeForOnAccount && typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
		$("#paymentType").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		$(".paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			
		$('#paymentTypeTh').addClass('hide');
		$('#paymentTypeTd').addClass('hide');
		$('#paymentType').addClass('hide');
		
		$('#paymentModeTh').addClass('hide');
		$('#paymentModeTd').addClass('hide');
		$('#paymentMode').addClass('hide');
	} else {
		$('#paymentTypeTh').removeClass('hide');
		$('#paymentTypeTd').removeClass('hide');
		$('#paymentType').removeClass('hide');
		
		$('#paymentModeTh').removeClass('hide');
		$('#paymentModeTd').removeClass('hide');
		$('#paymentMode').removeClass('hide');
	}
	
	$('#paymentMode').prop('disabled', false);
	$('#paymentMode' + " option[value='" + PAYMENT_TYPE_BAD_DEBT_ID + "']").remove();
	
	if($("#paymentType").val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		$(".paymentModeInnerTblCls").val($("#paymentMode").val());
		$(".paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		$("#receivedAmount").val(BalanceAMT);
		$("#txnAmount").val(BalanceAMT);
		$("#balanceAmount").val(0);
		$("#jsPanelDataContentForBill").show();
		
		if(billPaymentConfig.allowToEnterAmountInDecimal)
			$('.totalBillReceivedAmount').html(toFixedWhenDecimal(BalanceAMT));
		else
			$('.totalBillReceivedAmount').html(Math.round(BalanceAMT));

		if(tdsConfiguration.IsTdsAllow) {
			$("#tdsAmount").val(totalTdsAmount);

			if(totalTdsAmount > 0) {
				if(billPaymentConfig.allowToEnterAmountInDecimal) {
					$("#receivedAmount").val(toFixedWhenDecimal(BalanceAMT - Number(totalTdsAmount)));
					$('.totalBillReceivedAmount').html(toFixedWhenDecimal(BalanceAMT - Number(totalTdsAmount)));
				} else {
					$("#receivedAmount").val(Math.round(BalanceAMT - Number(totalTdsAmount)));
				    $('.totalBillReceivedAmount').html(Math.round(BalanceAMT - Number(totalTdsAmount)));
				}
			}
		}
	} else if($("#paymentType").val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		$("#receivedAmount").val(0);
		$("#txnAmount").val(0);
		$("#balanceAmount").val(BalanceAMT);
		$('.totalBillReceivedAmount').html(0);

		$("#jsPanelDataContentForBill").show();

		if(tdsConfiguration.IsTdsAllow)
			$("#tdsAmount").val(0);
		
		if(billPaymentConfig.isAllowClaimEntry) 
			$("#claimAmount").val(0);
		
		if(billPaymentConfig.isAllowDeductionEntry)
			$("#deductionAmount").val(0);
	} else if($("#paymentType").val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
		$("#jsPanelDataContentForBill").show();
		$("#receivedAmount").attr('readonly', true);
		$(".paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_NEGOTIATED_ID);
		$("#balanceAmount").val(BalanceAMT);
		$("#receivedAmount").val(0);
		$(".paymentModeInnerTblCls").val($("#paymentMode").val());

		if(tdsConfiguration.IsTdsAllow)
			$("#tdsAmount").val(0);
		
		if(billPaymentConfig.isAllowClaimEntry)
			$("#claimAmount").val(0);
		
		if(billPaymentConfig.isAllowDeductionEntry)
			$("#deductionAmount").val(0);
	} else if($("#paymentType").val() == PAYMENT_TYPE_STATUS_BAD_DEBT_ID) {
		$(".paymentModeInnerTblCls").val($("#paymentMode").val());
		$(".paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_BAD_DEBT_ID);
		$("#receivedAmount").val(0);
		$("#txnAmount").val(0);
		$("#balanceAmount").val(BalanceAMT);
		$("#jsPanelDataContentForBill").show();
		$('#paymentMode').prepend("<option value='" + PAYMENT_TYPE_BAD_DEBT_ID + "' selected='selected'>Bad Debt</option>");
		$('#paymentMode').prop('disabled', true);
		
		$('.totalBillReceivedAmount').html(0);

	}

	setDataToInnerTable();
}

function allowTdsOnPaymentTypeSelection(billId) {
	if(tdsConfiguration.IsTdsAllow) {
		if(isTDSChargeInPercentAllow) {
			let tdsCharge 		= Number(BillClearanceTDSChargeInPercent);

			let receivedAmtLimit= parseInt($("#receivedAmtLimitInnerTbl_" + billId).val());
			let totalAmt		= parseInt($("#totAmtInnerTbl_" + billId).val());
			let txnAmount		= parseInt($("#txnAmtInnerTbl_" + billId).val());
			
			let	actTotalAmt		= totalAmt - receivedAmtLimit;
			let	tdsAmt			= (txnAmount * tdsCharge) / 100;
			if(isNaN(tdsAmt)) tdsAmt = 0;

			if(billPaymentConfig.allowToEnterAmountInDecimal) {
				tdsAmt	= toFixedWhenDecimal(tdsAmt);
				$("#tdsAmtInnerTbl_" + billId).val(tdsAmt);
				$("#recAmtInnerTbl_" + billId).val(toFixedWhenDecimal(txnAmount - tdsAmt));
				$("#balanceInnerTbl_" + billId).val(toFixedWhenDecimal(actTotalAmt - txnAmount));
			} else {
				tdsAmt    = Math.round(tdsAmt);
				$("#tdsAmtInnerTbl_" + billId).val(tdsAmt);
				$("#recAmtInnerTbl_" + billId).val(Math.round(txnAmount - tdsAmt));
				$("#balanceInnerTbl_" + billId).val(Math.round(actTotalAmt - txnAmount));
			}
			
			totalTdsAmount	+= tdsAmt;
		}
	}
}

//Called In billClearanceSetReset.js
function displayPartialPaymentSelectionDropdown(billId) {
	if(!billPaymentConfig.DisplayPartialPaymentSelectionDropdown)
		return;

	let paymentType		= $("#paymenttypeInnerTbl_" + billId).val();

	if(paymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID)
		switchHtmlTagClass('partialPaymentSelection_' + billId, 'show', 'hide');
	else
		switchHtmlTagClass('partialPaymentSelection_' + billId, 'hide', 'show');
}

function loadPaymentTypeModal() {
	let bankPaymentOperationModel		= new $.Deferred();	//

	if(billPaymentConfig.BankPaymentOperationRequired) {
		$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
			bankPaymentOperationModel.resolve();
		});
	}  else
		$( "#bankPaymentOperationPanel").remove();

	let loadelement 	= new Array();

	loadelement.push(bankPaymentOperationModel);

	$.when.apply($, loadelement).done(function() {
		setIssueBankAutocomplete();
		setAccountNoAutocomplete();
	}).fail(function() {
		console.log("Some error occured");
	});
}

function loadChequeBounceModal() {
	let chequeBounceModel		= new $.Deferred();	//
	
	if(billPaymentConfig.chequeBounceRequired) {
		$("#chequeBounceDetailsPanel").load("/ivcargo/jsp/createWayBill/includes/chequeBounceDetails.html", function() {
			chequeBounceModel.resolve();
		});
	}  else
		$( "#chequeBounceDetailsPanel").remove();

	let loadelement 	= new Array();
	loadelement.push(chequeBounceModel);
}

function clearOnfocus(ele){
	if(ele.value=='0')
		ele.value="";
}

function setValueToInnerTableReceviedChange(billId) {

	calulateFinalReceivedAmount(); //coming from MakePayment.js
	
	let totamt 		= jsObjForBalanceAmt[billId];
	let paymentType = $("#paymenttypeInnerTbl_" + billId).val();

	if(paymentType == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
		if($("#balanceInnerTbl_" + billId).val() >= 1) {
			let recamt = totamt - $("#recAmtInnerTbl_" + billId).val();  

			if(recamt <= $("#totAmtInnerTbl_" + billId).val()) {
				if(billPaymentConfig.allowToEnterAmountInDecimal)
					$("#balanceInnerTbl_" + billId).val(toFixedWhenDecimal(recamt));	
				else
					$("#balanceInnerTbl_" + billId).val(Math.round(recamt));
			}
		} else if($("#balanceInnerTbl_" + billId).val() <= 0 ) {
			$("#paymenttypeInnerTbl_" + billId).val(0);	
			
			if(billPaymentConfig.allowToEnterAmountInDecimal)
				$("#balanceInnerTbl_" + billId).val(toFixedWhenDecimal(totamt));
			else
				$("#balanceInnerTbl_" + billId).val(Math.round(totamt));
			
			$("#recAmtInnerTbl_" + billId).val(0);	
		}
	} else if(paymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID
			|| paymentType == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID
			|| paymentType == 0) {
		if($("#balanceInnerTbl_" + billId).val() >= 1) {
			let recamt = totamt - $("#recAmtInnerTbl_" + billId).val();  

			if(recamt <= $("#totAmtInnerTbl_" + billId).val()) {
				if(billPaymentConfig.allowToEnterAmountInDecimal)
					$("#balanceInnerTbl_" + billId).val(toFixedWhenDecimal(recamt));	
			    else
					$("#balanceInnerTbl_" + billId).val(Math.round(recamt));
			}
			
			$("#paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
		} else if($("#balanceInnerTbl_" + billId).val() == 0)
			$("#paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);	
		else if($("#balanceInnerTbl_" + billId).val() < 0)
			$("#paymenttypeInnerTbl_" + billId).val(0);
	}
	
	if(paymentType == PAYMENT_TYPE_STATUS_NEGOTIATED_ID && 
		!validateDiscountLimit(discountInPercent, Number( $("#totAmtInnerTbl_" + billId).val() - $("#receivedAmtInnerTbl_" + billId).val()), $("#balanceInnerTbl_" + billId).val(), $("#txnAmtInnerTbl_" + billId)))
			return false;
}

//Calculate total received amount.
function calulateFinalReceivedAmount() {
	let totalReceivedAmt 		= 0;
	let totalTxnAmount			= 0;
	totalTdsAmount			= 0;
	let totalClaimAmount		= 0;
	let totalDeductionAmount	= 0;

	for(const billId of makepayementbillnolist) {
		totalReceivedAmt 	+= Number($('#recAmtInnerTbl_' + billId).val());
		
		if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
			totalTxnAmount		+= Number($('#txnAmtInnerTbl_' + billId).val());

		if(tdsConfiguration.IsTdsAllow)
			totalTdsAmount		+= Number($('#tdsAmtInnerTbl_' + billId).val());
		
		if(billPaymentConfig.isAllowClaimEntry)
			totalClaimAmount	+= Number($('#claimAmtInnerTbl_' + billId).val());
		
		if(billPaymentConfig.isAllowDeductionEntry)
			totalDeductionAmount	+= Number($('#deductionAmtInnerTbl_' + billId).val());
	}
	
	let balanceAmount	= 0;
	
	if(billPaymentConfig.allowToEnterAmountInDecimal) {
		balanceAmount		= toFixedWhenDecimal(BalanceAMT - totalReceivedAmt);
		totalTxnAmount		= toFixedWhenDecimal(totalTxnAmount);
		totalTdsAmount		= toFixedWhenDecimal(totalTdsAmount);
		totalClaimAmount	= toFixedWhenDecimal(totalClaimAmount);
		totalDeductionAmount= toFixedWhenDecimal(totalDeductionAmount);
	} else {
		balanceAmount		= Math.round(BalanceAMT - totalReceivedAmt);
		totalTxnAmount		= Math.round(totalTxnAmount);
		totalTdsAmount		= Math.round(totalTdsAmount);
		totalClaimAmount	= Math.round(totalClaimAmount);
		totalDeductionAmount= Math.round(totalDeductionAmount);
	}
	
	if(!tdsConfiguration.IsTdsAllow && !billPaymentConfig.isAllowClaimEntry && !billPaymentConfig.isAllowDeductionEntry)
		$('#balanceAmount').val(balanceAmount);
	
	if(billPaymentConfig.allowToEnterAmountInDecimal)
		balanceAmount	= toFixedWhenDecimal(BalanceAMT - totalTxnAmount);
	else
		balanceAmount	= Math.round(BalanceAMT - totalTxnAmount);
	
	$('#txnAmount').val(totalTxnAmount);
	$('#tdsAmount').val(totalTdsAmount);
	$('#balanceAmount').val(balanceAmount);
	$('#claimAmount').val(totalClaimAmount);
	$('#deductionAmount').val(totalDeductionAmount);
	
	if(billPaymentConfig.allowToEnterAmountInDecimal) {
		$('#receivedAmount').val(toFixedWhenDecimal(totalReceivedAmt));
		$('.totalBillReceivedAmount').html(toFixedWhenDecimal(totalReceivedAmt));
	} else {
		$('#receivedAmount').val(Math.round(totalReceivedAmt));
		$('.totalBillReceivedAmount').html(Math.round(totalReceivedAmt));
	}
	
	if(tdsConfiguration.IsTdsAllow && totalTdsAmount > totalTxnAmount && $('#recAmtInnerTbl_' + billId).val() < 0) {
		showMessage('error', 'TDS Amount Cannot Be Greater Than Txn Amount');
		changeTextFieldColorNew($("#tdsAmtInnerTbl_" + billId), '', '', 'red');
		return false;
	}
	
	if(billPaymentConfig.isAllowClaimEntry && totalClaimAmount > totalTxnAmount && $('#recAmtInnerTbl_' + billId).val() < 0) {
		showMessage('error', 'Claim Amount Cannot Be Greater Than Txn Amount');
		changeTextFieldColorNew($("#claimAmtInnerTbl_" + billId), '', '', 'red');
		return false;
	}
	
	if(billPaymentConfig.isAllowDeductionEntry && totalDeductionAmount > totalTxnAmount && $('#recAmtInnerTbl_' + billId).val() < 0) {
		showMessage('error', 'Deduction Amount Cannot Be Greater Than Txn Amount');
		changeTextFieldColorNew($("#deductionAmtInnerTbl_" + billId), '', '', 'red');
		return false;
	}
}

function setValueToInnerTablePayment(billId) {
	isBadDepthPayment = false;
	
	let totamt = jsObjForBalanceAmt[billId];
	
	if(!allowAllPaymentTypeForOnAccount && typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0)
		$("#paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID)
		
	$("#tdsAmtInnerTbl_" + billId).attr('readonly', false);
	$("#paymentModeInnerTbl_" + billId).attr('disabled', false);
	$('#paymentModeInnerTbl_'+ billId + " option[value='" + PAYMENT_TYPE_BAD_DEBT_ID + "']").remove();
	
	if($("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		if(tdsConfiguration.IsTdsAllow) {
			$("#txnAmtInnerTbl_" + billId).val(totamt);
			
			if(billPaymentConfig.allowToEnterAmountInDecimal)
				$("#recAmtInnerTbl_" + billId).val(toFixedWhenDecimal(totamt - $("#tdsAmtInnerTbl_" + billId).val()));
			else
				$("#recAmtInnerTbl_" + billId).val(Math.round(totamt - $("#tdsAmtInnerTbl_" + billId).val()));
		
			$("#txnAmtInnerTbl_" + billId).attr('readonly', true);
		} else
			$("#recAmtInnerTbl_" + billId).val(totamt);
		
		$("#recAmtInnerTbl_" + billId).attr('readonly', true);
		$("#balanceInnerTbl_" + billId).val(0);
	} else if($("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || $("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		if(billPaymentConfig.allowToEnterAmountInDecimal)
			$("#balanceInnerTbl_" + billId).val(toFixedWhenDecimal(totamt));
		else
			$("#balanceInnerTbl_" + billId).val(Math.round(totamt));
		
		$("#recAmtInnerTbl_" + billId).val(0);

		if(billPaymentConfig.allowToChangePaymentTypeInMultipleBillClear)
			$("#txnAmtInnerTbl_" + billId).prop('disabled', false);
		
		if(tdsConfiguration.IsTdsAllow) {
			$("#txnAmtInnerTbl_" + billId).val(0);
			$("#recAmtInnerTbl_" + billId).attr('readonly', true);
			$("#txnAmtInnerTbl_" + billId).attr('readonly', false);
		} else
			$("#recAmtInnerTbl_" + billId).attr('readonly', false);
	} else if($("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_BAD_DEBT_ID) {
		$("#txnAmtInnerTbl_" + billId).val(0);
		$('#paymentModeInnerTbl_'+ billId).prepend("<option value='" + PAYMENT_TYPE_BAD_DEBT_ID + "' selected='selected'>Bad Debt</option>");
		$("#paymentModeInnerTbl_" + billId).attr('disabled', true);
		$("#recAmtInnerTbl_" + billId).val(0);
		$("#tdsAmtInnerTbl_" + billId).val(0);
		$("#recAmtInnerTbl_" + billId).attr('readonly', true);
		$("#txnAmtInnerTbl_" + billId).attr('readonly', true);
		$("#tdsAmtInnerTbl_" + billId).attr('readonly', true);
		isBadDepthPayment = true;
	}
	
	allowTdsOnPaymentTypeSelection(billId);
}

function setValueToInnerTableOnPaymentModeChange(billId,obj) {
	if($('#paymentMode').exists() && $('#paymentMode').is(":visible"))
		invoicePaymentType_0  = $('#paymentMode').val();
	else
		invoicePaymentType_0	= 0;
	
	if(invoicePaymentType_0 <= 0) {
		$('#uniqueWayBillId').val(billId);
		$('#uniqueWayBillNumber').val($('#billNoInnerTbl_' + billId).val());
		$('#uniquePaymentType').val($('#paymentModeInnerTbl_' + billId).val());
		$('#uniquePaymentTypeName').val($("#paymentModeInnerTbl_" + billId + " option:selected").text());
	} else {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
	
	let accountGroupId	= executive.accountGroupId;
	let type			= ModuleIdentifierConstant.BILL_PAYMENT;
	let branchId		= executive.branchId;
	
	if(billPaymentConfig.chequeBounceRequired) {
		if($("#paymentModeInnerTbl_" + billId + " option:selected").val() == PAYMENT_TYPE_CHEQUE_ID){
			chequeBounceChecking(accountGroupId, corporateAccountId, type, branchId);
			
			setTimeout(function () {
				let size = checkObjectSize(chequeBounceDetails);
				
				if(size > 0) {
					if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0) {
						if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
							hideShowBankPaymentTypeOptions(obj);
							isAllowChequePayment	= 1;
							$('#isAllowChequePaymentInnerTbl_' + billId).val(isAllowChequePayment);
						} else {
							setChequeBounceDetails(chequeBounceDetails);
							$("#paymentModeInnerTbl_" + billId + "").val(0);
						}
					} else {
						setChequeBounceDetails(chequeBounceDetails);
						$("#paymentModeInnerTbl_" + billId + "").val(0);
					}
				} else
					hideShowBankPaymentTypeOptions(obj);
			},500);
		} else
			hideShowBankPaymentTypeOptions(obj);
	} else
		hideShowBankPaymentTypeOptions(obj);
}

function resetTable1() {
	$('#lrDetailsJsPannel #Lrdetails').dataTable({
		"bPaginate": false,
		"bInfo": true,
		"scrollCollapse": true,
		"sDom": "frtiS",
		"bJQueryUI" : true,

		destroy: true,
	});

	changeDisplayProperty('Lrdetails_filter', 'none');
}


function createBill() {
	let flag	= false;
	
	if(validateMainPannel()  && validateMainPannelForInnerTable() && validateMainPannelForInnerTableOnly()) {
		calculateGrandTotal();
		
		if(allowBackDateEntryForBillPayment)
			flag = validateBackdate(billCreationDate, billcreationDateString);
		
		if(!flag) {
			onAccountDetailsArr	= new Array();
			
			totalBillReceivedAmount		= 0;
			totalOnAccountBalanceAmount	= 0;
			
			if(!validateInvoicePaymentDetails(makepayementbillnolist))
				return false;
			
			if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null) {
				selectedBillNoList	= new Array();
				
				for (const billId of makepayementbillnolist) {
					isBillChecked	= $('#billCheckBoxInnerTbl_' + billId).prop('checked');
					
					if(typeof isBillChecked !== 'undefined' && isBillChecked) {
						totalBillReceivedAmount += Number($('#recAmtInnerTbl_' + billId).val());
						
						selectedBillNoList.push(billId);
					}
				}
				
				if(selectedBillNoList != null && selectedBillNoList.length > 0) {
					makepayementbillnolist	= new Array();
					
					for (let k = 0; k <= selectedBillNoList.length - 1; k++) {
						makepayementbillnolist.push(selectedBillNoList[k])
					}
				} else {
					showMessage('error', 'Please Select Atleast 1 Bill !');
					return false;
				}
				
				let onAccountDetailsTable		= document.getElementById('onAccountDetailsTable');
				
				if(typeof onAccountDetailsTable !== 'undefined') {
					let rowCount	= onAccountDetailsTable.rows.length;
					
					for(let m = 0; m < rowCount - 1; m++) {
						let chkBx = document.getElementById("onAccountCheckBoxEle_" + m);
						
						if(chkBx && chkBx.checked) {
							totalOnAccountBalanceAmount	+= Number($('#onAccountBalanceAmountEle_' + m).val());
							
							onAccountDetailsObj	= new Object;
							
							onAccountDetailsObj.onAccountId			= Number(chkBx.value);
							onAccountDetailsObj.onAccountNumber		= document.getElementById("onAccountNumberEle_" + m).value;
							onAccountDetailsObj.balanceAmount		= Number(document.getElementById("onAccountBalanceAmountEle_" + m).value);
							onAccountDetailsObj.paymentType			= Number(document.getElementById("onAccountPaymentTypeEle_" + m).value);
							
							if(onAccountDetailsObj.paymentType != PAYMENT_TYPE_CASH_ID) {
								onAccountDetailsObj.chequeNumber	= document.getElementById("onAccountChequeNumberEle_" + m).value;
								onAccountDetailsObj.bankName		= document.getElementById("onAccountBankNameEle_" + m).value;
							}
							
							onAccountDetailsObj.totalAmount			= document.getElementById("onAccountTotalAmountEle_" + m).value;
							
							onAccountDetailsArr.push(onAccountDetailsObj);
						} 
					}
				}
				
				if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
					if(totalBillReceivedAmount > 0 && totalBillReceivedAmount > totalOnAccountBalanceAmount) {
						showMessage('info', 'Total Bill Amount ' + totalBillReceivedAmount + ' Cannot Be More Than Total Voucher Amount ' + totalOnAccountBalanceAmount);
						return false;
					}
				} else {
					showMessage('error', 'Please Select Atleast 1 Voucher/On Account !');
					return false;
				}
			}

			var onAccountPaymentValues			= new Array();

			if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
				if(onAccountDetailsArr[0].paymentType != PAYMENT_TYPE_CASH_ID) {
					if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
						for (let i = 0; i <= onAccountDetailsList.length - 1; i++) {
							for (let j = 0; j <= onAccountDetailsArr.length - 1; j++) {
								if(onAccountDetailsArr[j].onAccountId == onAccountDetailsList[i].onAccountId)
									onAccountDetailsArr[j] = onAccountDetailsList[i];
							}
						}
					}

					let paymentType			= 0;
					let amount 				= 0;
					let chequeNumber		= null;
					let payerName			= null;
					let payeeName			= null;
					let bankAccountNumber	= null;
					let cardNo 				= null;
					let referenceNumber		= null;
					let bankName			= null;
					let chequeGivenTo		= null;
					let chequeGivenBy		= null;
					let upiId				= null;

					paymentType	= onAccountDetailsArr[0].paymentType;

					if(typeof onAccountDetailsArr[0].bankPaymentChequeNumber !== 'undefined')
						chequeNumber = onAccountDetailsArr[0].bankPaymentChequeNumber;

					if(typeof onAccountDetailsArr[0].payerName !== 'undefined')
						payerName = onAccountDetailsArr[0].payerName;

					if(typeof onAccountDetailsArr[0].payeeName !== 'undefined')
						payeeName = onAccountDetailsArr[0].payeeName;

					if(typeof onAccountDetailsArr[0].bankAccountNumber !== 'undefined')
						bankAccountNumber = onAccountDetailsArr[0].bankAccountNumber;

					if(typeof onAccountDetailsArr[0].cardNo !== 'undefined')
						cardNo = onAccountDetailsArr[0].cardNo;

					if(typeof onAccountDetailsArr[0].referenceNumber !== 'undefined')
						referenceNumber = onAccountDetailsArr[0].referenceNumber;

					if(typeof onAccountDetailsArr[0].bankName !== 'undefined')
						bankName = onAccountDetailsArr[0].bankName;

					if(typeof onAccountDetailsArr[0].chequeGivenTo !== 'undefined')
						chequeGivenTo = onAccountDetailsArr[0].chequeGivenTo;

					if(typeof onAccountDetailsArr[0].chequeGivenBy !== 'undefined')
						chequeGivenBy = onAccountDetailsArr[0].chequeGivenBy;

					if(typeof onAccountDetailsArr[0].upiId !== 'undefined')
						upiId = onAccountDetailsArr[0].upiId;

					if(typeof onAccountDetailsArr !== 'undefined' && onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
						for (let i = 0; i <= onAccountDetailsArr.length - 1; i++) {
							if(Number(paymentType) != Number(onAccountDetailsArr[i].paymentType)) {
								showMessage('info', 'Please Select Vouchers With Same Payment Type !');
								return false;
							}
							
							if(typeof onAccountDetailsArr[i].bankPaymentChequeNumber == 'undefined')
								onAccountDetailsArr[i].bankPaymentChequeNumber	= null;

							if(typeof onAccountDetailsArr[i].payerName == 'undefined')
								onAccountDetailsArr[i].payerName	= null;

							if(typeof onAccountDetailsArr[i].payeeName == 'undefined')
								onAccountDetailsArr[i].payeeName	= null;

							if(typeof onAccountDetailsArr[i].bankAccountNumber == 'undefined')
								onAccountDetailsArr[i].bankAccountNumber	= null;

							if(typeof onAccountDetailsArr[i].cardNo == 'undefined')
								onAccountDetailsArr[i].cardNo	= null;

							if(typeof onAccountDetailsArr[i].referenceNumber == 'undefined')
								onAccountDetailsArr[i].referenceNumber	= null;

							if(typeof onAccountDetailsArr[i].bankName == 'undefined')
								onAccountDetailsArr[i].bankName	= null;

							if(typeof onAccountDetailsArr[i].chequeGivenTo == 'undefined')
								onAccountDetailsArr[i].chequeGivenTo	= null;

							if(typeof onAccountDetailsArr[i].chequeGivenBy == 'undefined')
								onAccountDetailsArr[i].chequeGivenBy	= null;

							if(typeof onAccountDetailsArr[i].upiId == 'undefined')
								onAccountDetailsArr[i].upiId	= null;
							
							if(Number(paymentType) == Number(onAccountDetailsArr[i].paymentType)) {
								if(chequeNumber != onAccountDetailsArr[i].bankPaymentChequeNumber
									|| payerName != onAccountDetailsArr[i].payerName
									|| payeeName != onAccountDetailsArr[i].payeeName
									|| bankAccountNumber != onAccountDetailsArr[i].bankAccountNumber
									|| cardNo != onAccountDetailsArr[i].cardNo
									|| referenceNumber != onAccountDetailsArr[i].referenceNumber
									|| bankName != onAccountDetailsArr[i].bankName
									|| chequeGivenTo != onAccountDetailsArr[i].chequeGivenTo
									|| chequeGivenBy != onAccountDetailsArr[i].chequeGivenBy
									|| upiId != onAccountDetailsArr[i].upiId
								) {
									showMessage('info', 'Please Select Vouchers With Same Payment Type !');
									return false;
								}
							}
						}
					}

					for (let i = 0; i <= makepayementbillnolist.length - 1; i++) {
						let billId 		= makepayementbillnolist[i];
						let billno 		= $('#billNoInnerTbl_' + billId).val();

						let onAccountPaymentValuesStr	 = (i + 1) + '_' + billno + '_' + billId + '_' + onAccountDetailsArr[0].issueBankId + '_' + chequeNumber + '_' + onAccountDetailsArr[0].chequeDateStr + '_' + amount + '_' + payerName + '_' + bankAccountNumber + '_' + cardNo + '_' + referenceNumber + '_' + onAccountDetailsArr[0].mobileNumber + '_' + onAccountDetailsArr[0].bankAccountId + '_' + bankName + '_' + payeeName + '_' + onAccountDetailsArr[0].paymentType + '_' + chequeGivenTo + '_' + chequeGivenBy +'_'+ upiId;

						onAccountPaymentValuesArray	= onAccountPaymentValuesStr.split("_");

						onAccountPaymentValues.push(onAccountPaymentValuesArray.join("_"))
					}
				}
			}
 		
		if(confirm('Are you sure you want to receive payment ?')) {
			showLayer();
			let billArray	= new Array();

			for (let i = 0; i <= makepayementbillnolist.length - 1; i++) {
				let billData	= new Object();

				let billId = makepayementbillnolist[i];

				billData.billId 		= billId;

				billData.billNumber 	= $('#billNoInnerTbl_' + billId).val();
				billData.creditorId 	= $('#creditorIdInnerTbl_' + billId).val();
				billData.branchId	 	= $('#branchIdInnerTbl_' + billId).val();
				billData.panNumber		= $('#panNumberInnerTbl_' + billId).val();
				billData.tanNumber		= $('#tanNumberInnerTbl_' + billId).val();
				billData.paymentMode	= $('#paymentModeInnerTbl_' + billId).val();
				billData.remark			= $('#remarkInnerTbl_' + billId).val();
				billData.bankName		= $('#bankNameInnerTbl_' + billId).val();
				billData.OnlineTXNType  = $('#OnlineTXNTypeInnerTbl_' + billId).val();
				billData.cheque			= $('#chequeInnerTbl_' + billId).val();
				billData.chequeDate		= $('#ChequeDateInnerTbl_' + billId).val();
				billData.paymentType	= $('#paymenttypeInnerTbl_' + billId).val();
				billData.totalAmount	= $('#totAmtInnerTbl_' + billId).val();

				if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
					billData.txnAmount	= $('#txnAmtInnerTbl_' + billId).val();
				
				billData.prevRecAmount	= $('#receivedAmtInnerTbl_' + billId).val();
				billData.recAmount		= $('#recAmtInnerTbl_' + billId).val();

				if(tdsConfiguration.IsTdsAllow) {
					billData.tdsAmount	= $('#tdsAmtInnerTbl_' + billId).val();
					billData.tdsRate	= Number(BillClearanceTDSChargeInPercent);
				}
				
				if(billPaymentConfig.isAllowClaimEntry)
					billData.claimAmount	= $('#claimAmtInnerTbl_' + billId).val();
				
				if(billPaymentConfig.isAllowDeductionEntry)
					billData.deductionAmount	= $('#deductionAmtInnerTbl_' + billId).val();

				billData.balAmount		= $('#balanceInnerTbl_' + billId).val();
				billData.partPmtSelec	= $('#partialPaymentSelection_' + billId).val();
				
				if(debitToBranch)
					billData.debitToBranchId	= $('#debitToBranchSelectionInnerTbl_' + billId).val();
				
				if(billPaymentConfig.chequeBounceRequired)
					billData.isAllowChequePayment	= $('#isAllowChequePaymentInnerTbl_' + billId).val();
				
				if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0)
					billData.isOnAccountParty	= !billPaymentConfig.showReceivedAmountInOnAccountBillPayment;
				else
					billData.isOnAccountParty	= false;
				
				billData.waybillids		= jsObjForWaybillids;
				billData.billCreationDate	= $('#billCreationDateInnerTbl_' + billId).val();
				billArray.push(billData);
			}

			let jsonObjectdata = new Object();
			jsonObjectdata.filter = 2;
			jsonObjectdata.totalBillCount = TotalBillCount;
			
			jsonObjectdata.BackDate			= $("#backDate").val();
			jsonObjectdata.PaymentType		= $("#paymentType").val();

			jsonObjectdata.typeOfSelection	= typeOfSelect;

			if(tdsConfiguration.IsTdsAllow) {
				jsonObjectdata.TransactionAmount 	= $("#txnAmount").val();
				jsonObjectdata.TDSGrandAmount 		= $("#tdsAmount").val();
			}
			
			let rowCount 		= $('#storedPaymentDetails tr').length;
			
			if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
				let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');
				jsonObjectdata.paymentValues	= paymentCheckBoxArr.join(',');
			}
			
			if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0 && typeof onAccountPaymentValues !== 'undefined') {
				jsonObjectdata.PaymentType		= onAccountDetailsArr[0].paymentType;
				jsonObjectdata.paymentValues	= onAccountPaymentValues.join(',');
			}
			
			jsonObjectdata.invoicePaymentType_0	= invoicePaymentType_0;

			jsonObjectdata.billArray			= JSON.stringify(billArray);
			jsonObjectdata.onAccountDetailsArr	= JSON.stringify(onAccountDetailsArr);
			jsonObjectdata.billCreationDate		= billcreationDateString;
			jsonObjectdata.billDateStr			= billDateArray.join(',');
			
			jsonObjectdata.showReceivedAmountInOnAccountBillPayment	= billPaymentConfig.showReceivedAmountInOnAccountBillPayment;
			
			let mrNumber = $('#mrNumber').val();

			if(mrNumber != null && mrNumber != "") {
				jsonObjectdata.isManualMr		= true;
				jsonObjectdata.mrNumber			= $('#mrNumber').val();
				jsonObjectdata.partyAdvDate		= $('#backDate').val();
			}
			
			if(tokenWiseCheckingForDuplicateTransaction){
				jsonObjectdata.tokenKey = TOKEN_KEY;
				jsonObjectdata.tokenValue = TOKEN_VALUE;
				jsonObjectdata.tokenWiseCheckingForDuplicateTransaction = tokenWiseCheckingForDuplicateTransaction;
			}
		
			let jsonStr = JSON.stringify(jsonObjectdata);
			
			$.post("MakePaymentAjaxAction.do?pageId=303&eventId=1",
					{json:jsonStr}, function(data) {
						if(!data || jQuery.isEmptyObject(data) || data.errorDescription){
							if(typeof data.errorDescription !== 'undefined')
								showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
							else
								showMessage('error', iconForErrMsg + ' ' + "Sorry an error occourd in system !!"); // show message to show system processing error massage on top of the window.
							
							hideLayer();
						} else {
							let notallow				= data.notallow;
							let noOfDays				= data.noOfDays;
							let backDateNotValid		= data.backDateNotValid;
							let futureDateNotAllowed	= data.futureDateNotAllowed;
							let billCreateDateTime		= data.billCreateDate;

							if(notallow != undefined && !notallow) {
								showMessage('info', billClearanceNotAllowed(noOfDays));
								hideLayer();
								return;
							}
							
							if(data.error)
						 		showMessage('error', iconForSuccessMsg + ' ' + "MR Sequence Not Defined Please contact  on Support "); 
							
							if(backDateNotValid != undefined && backDateNotValid && billCreateDateTime != undefined && billCreateDateTime != null) {
								showMessage('info', 'Back Date Should Not Be Less Than Bill Creation Date ' + billCreateDateTime);
								hideLayer();
								return;
							}
							
							if(futureDateNotAllowed != undefined && futureDateNotAllowed) {
								showMessage('info', futureDateNotAllowdErrMsg);
								hideLayer();
								return;
							}
							
							if(data.success) {
								Total	 			= 0;
								TotalReceived		= 0;
								TotalBalnce	 		= 0;
								TotalReceivedAmt	= 0;
								GrandTotal	 		= 0;
								BalanceAMT		 	= 0;
								TotalBillCount	 	= 0;
								
								showMessage('success', iconForSuccessMsg + ' ' + "Bill clearance process completed successfully!");
								
								if(data.moneyRecepiptList != undefined) {
									$("#top-border-boxshadow").addClass('hide');
									$("#middle-border-boxshadow").removeClass('hide');
									createHeader();
									setReceiptDataResult(data.moneyRecepiptList,data.showOnlyCurrentPaymentWithSingleMRNumber);
								} else {
									setTimeout(function(){ window.close(); }, 1000);	
								}
							}
						}
						hideLayer();
					});
			}
		}
	}
}

function createHeader(){
	$('#headingReceipttr').empty();
	
	let createRow					= createRowInTable('', '', '');
	
	let mrNumberCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let mrDateCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let billingPartyNameCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let billNumberCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let billAmtCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let mrPrintCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	appendValueInTableCol(mrNumberCol, '<b>MR Number</b>');
	appendValueInTableCol(mrDateCol, '<b>MR Date</b>');
	appendValueInTableCol(billingPartyNameCol, '<b>Party Name</b>');
	appendValueInTableCol(billNumberCol, '<b>Bill Number</b>');
	appendValueInTableCol(billAmtCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
	appendValueInTableCol(mrPrintCol, '');
	
	appendRowInTable('headingReceipttr', createRow);
}

function setReceiptDataResult(moneyRecepiptList,showOnlyCurrentPaymentWithSingleMRNumber){
	removeTableRows('moneyReceiptDetailsDiv', 'tbody');
	var subIdArray					= new Array();
	var billIdArray					= new Array();
	for(const element of moneyRecepiptList){
		let createRow				= createRowInTable('', '', '');
		
		let mrNumber				= element.moneyReceiptNumber;
		let mrDate					= element.txnDateTimeString;
		let billingPartyName		= element.billingPartyName;
		let billNumber				= element.billNumber;
		let billAmt					= element.moneyReceiptTotalAmount;
		let mrPrint					= '<button id="mrPrintBtn" class="btn btn-primary" onclick="getMRPrintDetailsData(' + element.id + ','+12+','+element.subId+');">MR Print</button>';
		
		subIdArray.push(element.subId);
		billIdArray.push(element.id);
		
		let mrNumberCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
		let mrDateCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
		let billingPartyNameCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
		let billNumberCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
		let billAmtCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
		let mrPrintCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
		
		appendValueInTableCol(mrNumberCol, mrNumber);
		appendValueInTableCol(mrDateCol, mrDate);
		appendValueInTableCol(billingPartyNameCol, billingPartyName);
		appendValueInTableCol(billNumberCol, billNumber);
		appendValueInTableCol(billAmtCol, billAmt);

		if(showOnlyCurrentPaymentWithSingleMRNumber!=undefined && showOnlyCurrentPaymentWithSingleMRNumber)
			appendValueInTableCol(mrPrintCol, '<button id="" class="btn btn-primary" onclick="getMultiMRPrintDetailsData();">MR Print</button>');
		else
			appendValueInTableCol(mrPrintCol, mrPrint);
		
		appendRowInTable('moneyReceiptDetailsDiv', createRow);
	}
	
		subIdsStr = subIdArray.join(',');
	 	billIdsStr = billIdArray.join(',');
}

function getMRPrintDetailsData(billId,Identifier,clearanceId){
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+billId+"&moduleIdentifier="+Identifier+"&clearanceId="+clearanceId,'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function getMultiMRPrintDetailsData(){
	
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&billIds="+billIdsStr+"&moduleIdentifier=12&billClearanceIds="+subIdsStr+"&differentMrPrintForParitalPayment=true",'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function calculateGrandTotal() {
	let grandTotalReceiveAmount		= 0;
	let grandTotalTxnAmount			= 0;
	let grandTotalTdsAmount			= 0;
	let grandTotalClaimAmount		= 0;
	let grandTotalDeductionAmount	= 0;
	let grandTotalBalanceAmount		= 0;

	for (let i = 0; i <= makepayementbillnolist.length - 1; i++) {
		let billId = makepayementbillnolist[i];
		
		if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
			grandTotalTxnAmount	+= Number($('#txnAmtInnerTbl_' + billId).val());

		if(tdsConfiguration.IsTdsAllow)
			grandTotalTdsAmount	+= Number($('#tdsAmtInnerTbl_' + billId).val());
		
		if(billPaymentConfig.isAllowClaimEntry)
			grandTotalClaimAmount	+= Number($('#claimAmtInnerTbl_' + billId).val());
		
		if(billPaymentConfig.isAllowDeductionEntry)
			grandTotalDeductionAmount	+= Number($('#deductionAmtInnerTbl_' + billId).val());

		grandTotalReceiveAmount	+= Number($('#recAmtInnerTbl_' + billId).val());
		grandTotalBalanceAmount	+= Number($('#balanceInnerTbl_' + billId).val());
	}

	if(tdsConfiguration.IsTdsAllow) {
		$("#txnAmount").val(grandTotalTxnAmount);
		$("#tdsAmount").val(grandTotalTdsAmount);
	}
	
	if(billPaymentConfig.isAllowClaimEntry) {
		$("#txnAmount").val(grandTotalTxnAmount);
		$("#claimAmount").val(grandTotalClaimAmount);
	}
	
	if(billPaymentConfig.isAllowDeductionEntry) {
		$("#txnAmount").val(grandTotalTxnAmount);
		$("#deductionAmount").val(grandTotalDeductionAmount);
	}

	$("#receivedAmount").val(grandTotalReceiveAmount);
	$("#balanceAmount").val(grandTotalBalanceAmount);
}

//set Data On PaymentMode changed
function setValueToTableOnPaymentModeChange(){
	setDataToInnerTable();
}

function setDataToInnerTable() {
	let tdsAmount 		= 0.00;
	let claimAmount 	= 0.00;
	let deductionAmount = 0.00;
	
	if($("#paymentType").val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		for(const element of makepayementbillnolist) {
			if($('#paymenttypeInnerTbl_' + element).val() != PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
				if(tdsConfiguration.IsTdsAllow)
					tdsAmount = $("#tdsAmtInnerTbl_" + element).val();
				
				if(billPaymentConfig.isAllowClaimEntry)
					claimAmount = $("#claimAmtInnerTbl_" + element).val();
				
				if(billPaymentConfig.isAllowDeductionEntry)
					deductionAmount = $("#deductionAmtInnerTbl_" + element).val();
				
				if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry) {
					$("#txnAmtInnerTbl_" + element).val($("#totAmtInnerTbl_" + element).val() - $("#receivedAmtInnerTbl_" + element).val());
					$("#txnAmtInnerTbl_" + element).attr('disabled', true);
				} 
				
				if(!tdsConfiguration.IsTdsAllow && !billPaymentConfig.isAllowClaimEntry && !billPaymentConfig.isAllowDeductionEntry)
					$("#recAmtInnerTbl_" + element).val($("#totAmtInnerTbl_" + element).val());
				else
					$("#recAmtInnerTbl_" + element).val($("#txnAmtInnerTbl_" + element).val() - tdsAmount - claimAmount - deductionAmount);
				
				$('#balanceInnerTbl_' + element).val(0);
			}
			
			$(".paymentModeInnerTblCls").val($("#paymentMode").val());
			
			if(Number($('#paymentMode').val()) > 0)
				setValueToInnerTableOnPaymentModeChange(element,document.getElementById("paymentMode"));

			$("#paymentModeInnerTbl_" + element).attr('disabled', true);
			$("#remarkInnerTbl_" + element).attr('disabled', true);
			$("#paymenttypeInnerTbl_" + element).attr('disabled', !billPaymentConfig.allowToChangePaymentTypeInMultipleBillClear);
		}
	} else if($("#paymentType").val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || $("#paymentType").val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		for(const element of makepayementbillnolist) {
			$('#balanceInnerTbl_' + element).val(jsObjForBalanceAmt[element]);
			$('#recAmtInnerTbl_' + element).val(0);
			$("#paymenttypeInnerTbl_" + element).val($("#paymentType").val());
			$(".paymentModeInnerTblCls").val($("#paymentMode").val());

			setValueToInnerTableOnPaymentModeChange(element,document.getElementById("paymentMode"));

			if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry) {
				$("#txnAmtInnerTbl_" + element).val(0);
				$("#txnAmtInnerTbl_" + element).attr('disabled', false);
			}

			$("#paymentModeInnerTbl_" + element).attr('disabled', true);
			$("#remarkInnerTbl_" + element).attr('disabled', true);
			$("#paymenttypeInnerTbl_" + element).attr('disabled', !billPaymentConfig.allowToChangePaymentTypeInMultipleBillClear);
		}
	} else if($("#paymentType").val() == PAYMENT_TYPE_STATUS_BAD_DEBT_ID ){
		for(const element of makepayementbillnolist) {
			$("#txnAmtInnerTbl_" + element).val(0);
			$('#paymentModeInnerTbl_'+ element).prepend("<option value='" + PAYMENT_TYPE_BAD_DEBT_ID + "' selected='selected'>Bad Debt</option>");
			$('#paymenttypeInnerTbl_'+ element).prepend("<option value='" + PAYMENT_TYPE_STATUS_BAD_DEBT_ID + "' selected='selected'>Bad Debt</option>");
			$("#paymentModeInnerTbl_" + element).attr('disabled', true);
			$("#paymenttypeInnerTbl_" + element).attr('disabled', true);
			$("#recAmtInnerTbl_" + element).val(0);
			$("#tdsAmtInnerTbl_" + element).val(0);
			$("#recAmtInnerTbl_" + element).attr('readonly', true);
			$("#txnAmtInnerTbl_" + element).attr('readonly', true);
			$("#tdsAmtInnerTbl_" + element).attr('readonly', true);
			isBadDepthPayment = true;
			
			setValueToInnerTableOnPaymentModeChange(element,document.getElementById("paymentMode"));
		}
	}

	for(const element of makepayementbillnolist) {
		allowTdsOnPaymentTypeSelection(element);
		displayPartialPaymentSelectionDropdown(element);
	}
}

function setRemarkInInnerTable() {
	$(".remarkInnerTblCls").val($("#remark").val());
}

//---------------------------------------------------------------------------------------------------
//Validate Panel For Common Table 

function validateMainPannel() {
	let typeOfSelection	= typeOfSelect;

	if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL)
		return true;

	if(!validateMainPaymentMode("#paymentMode"))
		return false;

	return validateMainPaymentType("#paymentType");
}

//Validate Billwise details table

function validateMainPannelForInnerTable() {
	
	let typeOfSelection	= typeOfSelect;

	if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL)
		return true;

	let paymentType		= $("#paymentType").val();

	if(paymentType == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || paymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		for(const billId of makepayementbillnolist) {	
			if($("#balanceInnerTbl_" + billId).val() == 0)
				$("#paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);

			if($("#balanceInnerTbl_" + billId).val() < 0) {
				let blc = parseInt($("#totAmtInnerTbl_" + billId).val()) - parseInt($("#receivedAmtInnerTbl_" + billId).val());

				if(billPaymentConfig.isBalanceAmountValidation) {
					if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
						showMessage('error', 'Transaction Amount Can not be greater than Balance amount ('+blc+') !');
					else
						showMessage('error', 'Receive Amount Can not be greater than Balance amount ('+blc+') !');

					$("#recAmtInnerTbl_" + billId).focus();
					$("#recAmtInnerTbl_" + billId).css({"border-color": "red"});
					return false;
				}
			}

			if(!validateMainPaymentMode("#paymentModeInnerTbl_" + billId))
				return false;

			if(!validateMainPaymentType("#paymenttypeInnerTbl_" + billId))
				return false;

			if(!validateMainReceiveAmount("#recAmtInnerTbl_" + billId))
				return false;
				
			if(billPaymentConfig.IsRemarkValidationAllow && !validateRemark("remarkInnerTbl_" + billId))
				return false
			
			if($("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
				&& !validateDiscountLimit(discountInPercent, Number( $("#totAmtInnerTbl_" + billId).val() - $("#receivedAmtInnerTbl_" + billId).val()), $("#balanceInnerTbl_" + billId).val(), $("#txnAmtInnerTbl_" + billId)))
				return false;
				
			if(!validatePanNumber(billId)) return false;
		}

		return true;
	}

	return true;
}

//Validate Billwise details table Inner Only

function validateMainPannelForInnerTableOnly() {

	let typeOfSelection	= typeOfSelect;

	if(typeOfSelection == SEARCH_BY_MULTIPLE_BILL
	 && !tdsConfiguration.IsTdsAllow && !billPaymentConfig.isAllowClaimEntry && !billPaymentConfig.isAllowDeductionEntry)
		return true;

	for(const billId of makepayementbillnolist) {
		if($("#balanceInnerTbl_" + billId).val() == 0)
			$("#paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);

		if($("#balanceInnerTbl_" + billId).val() < 0) {
			let blc = parseInt($("#totAmtInnerTbl_" + billId).val()) - parseInt($("#receivedAmtInnerTbl_" + billId).val());
			
			if(billPaymentConfig.isBalanceAmountValidation){
				if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
					showMessage('error', 'Transaction Amount Can not be greater than Balance amount ('+blc+') !');
				else
					showMessage('error', 'Receive Amount Can not be greater than Balance amount ('+blc+') !');
				
				$("#recAmtInnerTbl_" + billId).focus();
				$("#recAmtInnerTbl_" + billId).css({"border-color": "red"});
				return false;
			}
		}
		
		if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL) {
			if(!validateMainPaymentMode("#paymentModeInnerTbl_" + billId))
				return false;

			if(!validateMainPaymentType("#paymenttypeInnerTbl_" + billId))
				return false;

			if(!validateMainReceiveAmount("#recAmtInnerTbl_" + billId))
				return false;
				
			if(billPaymentConfig.IsRemarkValidationAllow && !validateRemark("remarkInnerTbl_" + billId))
				return false
			
			if($("#paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
				&& !validateDiscountLimit(discountInPercent, Number( $("#totAmtInnerTbl_" + billId).val() - $("#receivedAmtInnerTbl_" + billId).val()), $("#balanceInnerTbl_" + billId).val(), $("#txnAmtInnerTbl_" + billId)))
				return false;
				
		}
		
		if(tdsConfiguration.IsTdsAllow
			&& Number($('#tdsAmtInnerTbl_' + billId).val()) > Number($('#recAmtInnerTbl_' + billId).val()) && $('#recAmtInnerTbl_' + billId).val() < 0) {
			showMessage('error', 'TDS Amount Cannot Be Greater Than Received Amount');
			changeTextFieldColorNew($("#tdsAmtInnerTbl_" + billId), '', '', 'red');
			
			return false;
		}
		
		if(billPaymentConfig.isAllowClaimEntry
			&& Number($('#claimAmtInnerTbl_' + billId).val()) > Number($('#recAmtInnerTbl_' + billId).val()) && $('#recAmtInnerTbl_' + billId).val() < 0) {
			showMessage('error', 'Claim Amount Cannot Be Greater Than Received Amount');
			changeTextFieldColorNew($("#claimAmtInnerTbl_" + billId), '', '', 'red');
			return false;
		}
		
		if(billPaymentConfig.isAllowDeductionEntry
			&& Number($('#deductionAmtInnerTbl_' + billId).val()) > Number($('#recAmtInnerTbl_' + billId).val()) && $('#recAmtInnerTbl_' + billId).val() < 0) {
			showMessage('error', 'Deduction Amount Cannot Be Greater Than Received Amount');
			changeTextFieldColorNew($("#deductionAmtInnerTbl_" + billId), '', '', 'red');
			return false;
		}
		
		if(!validatePanNumber(billId)) return false;
	}

	return true;
}

function validateMainPaymentMode(elementId) {
	if($(elementId).exists() && $(elementId).is(":visible")) {
		let payMode 		= $(elementId).val();

		if(payMode == 0 && !isBadDepthPayment) {
			showMessage('error', paymentModeErrMsg);
			$(elementId).focus();
			$(elementId).css({"border-color": "red"});
			return false;
		}
	}

	return true;
}

function validateMainPaymentType(elementId) {
	let paymentType 	= $(elementId).val(); 

	if(paymentType == 0) {
		showMessage('error', paymentTypeErrMsg);
		$(elementId).focus();
		$(elementId).css({"border-color": "red"});
		return false;
	}

	return true;
}

function validateMainReceiveAmount(elementId) {
	let receiveAmount		= $(elementId).val();

	if((receiveAmount == '' || receiveAmount == 0) && !isBadDepthPayment) {
		if(tdsConfiguration.IsTdsAllow || billPaymentConfig.isAllowClaimEntry || billPaymentConfig.isAllowDeductionEntry)
			showMessage('error', txnAmountErrMsg);
		else
			showMessage('error', receivedAmountCantBeBlankErrMsg);
		
		$(elementId).focus();
		$(elementId).css({"border-color": "red"});
		return false;
	}

	return true;
}

function removeError(id){
	$(id).css({"border-color": ""});
}

function calculateTDS(obj) {
	let objName 		= obj.name;
	let splitVal 		= objName.split("_");
	let tdsAmt			= 0.00;
	let claimAmt		= 0.00;
	let deductionAmt	= 0.00;

	let receivedAmtLimit= parseFloat($("#receivedAmtLimitInnerTbl_" + splitVal[1]).val());
	let	totalAmt 		= parseFloat($("#totAmtInnerTbl_" + splitVal[1]).val());
		
	let	actTotalAmt		= totalAmt - receivedAmtLimit
	
	let txnAmtEle		= $("#txnAmtInnerTbl_" + splitVal[1]).val();
	let tdsAmtEle		= $("#tdsAmtInnerTbl_" + splitVal[1]).val();
	let claimAmtEle		= $("#claimAmtInnerTbl_" + splitVal[1]).val();
	let deductionAmtEle	= $("#deductionAmtInnerTbl_" + splitVal[1]).val();
	let txnAmount		= 0;
	
	if(txnAmtEle != undefined && txnAmtEle != '') txnAmount = txnAmtEle;
	if(tdsAmtEle != undefined && tdsAmtEle != '') tdsAmt = tdsAmtEle;
	if(claimAmtEle != undefined && claimAmtEle != '') claimAmt = claimAmtEle;
	if(deductionAmtEle != undefined && deductionAmtEle != '') deductionAmt = deductionAmtEle;
		
	if (billPaymentConfig.allowToEnterAmountInDecimal) {
		$("#recAmtInnerTbl_" + splitVal[1]).val(toFixedWhenDecimal(txnAmount - tdsAmt - claimAmt - deductionAmt));
		$("#balanceInnerTbl_" + splitVal[1]).val(toFixedWhenDecimal(actTotalAmt - txnAmount));
	} else {
		$("#recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt - claimAmt - deductionAmt));
		$("#balanceInnerTbl_" + splitVal[1]).val(Math.round(actTotalAmt - txnAmount));
	}
	
}

function validateBackdate(billCreationDate,billcreationDateString){
	let flag = false;
	let backDate	= $("#backDate").val();
	let billdate	= billCreationDate;
	
	if(backDate != '' && backDate != undefined && backDate != "undefined") {
		let billBackDate  	= backDate.split(' ');
		let dateParts		= billBackDate[0].split('-');
		let currentDate 	= new Date(curDate);
		let newBilldate 	= new Date(billdate);
		let billPaymentDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds());
		
		if(newBilldate != undefined && newBilldate != "undefined")
			newBilldate.setHours(0, 0, 0, 0);
		
		if(billPaymentDate.getTime() <= newBilldate.getTime()) {
			showMessage('error',"Back Date Should Not Be Less Than Bill Creation Date "+billcreationDateString);
			$("#backDate").css('border-color', 'red');
			flag = true;
			return flag;
		} else {
			$("#backDate").css('border-color', 'gray');
		}
	}
	
	return flag;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	let discountAmtLimit	 = Math.round((totalAmount * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(enteredAmount) > Number(discountAmtLimit)) {
		showMessage('error', "Discount Amount Cannot Be Greater Than " +discountAmtLimit);
		changeTextFieldColorNew(element, '', '', 'red');
		return false;
	}

	return true;
}

function setOnAccountDetails() {
	if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
		$('#onAccountDetailsHeader').removeClass('hide');
		$('#onAccountDetailsDiv').removeClass('hide');
		
		let columnArray		= new Array();
		
		for (let i = 0; i < onAccountDetailsList.length; i++) {
			let obj		= onAccountDetailsList[i];
			
			let chequeDateString 	= '--';
			let chequeNumber 		= '--';
			let bankName 			= '--';
			
			if(typeof obj.chequeDateString !== 'undefined')
				chequeDateString	= obj.chequeDateString;
			
			if(typeof obj.chequeNumber !== 'undefined')
				chequeNumber	= obj.chequeNumber;
			
			if(typeof obj.bankName !== 'undefined')
				bankName	= obj.bankName;
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='checkbox' name='onAccountCheckBoxEle_" + i + "' style='text-transform: uppercase;' id='onAccountCheckBoxEle_" + i + "' value='"+obj.onAccountId+"' onclick='' /></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.onAccountNumber+"</b><input type='hidden' id ='onAccountNumberEle_"+i+"' value='"+obj.onAccountNumber+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.partyName+"</b><input type='hidden' id ='onAccountPartyEle_"+i+"' value='"+obj.partyName+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.totalAmount+"</b><input type='hidden' id ='onAccountTotalAmountEle_"+i+"' value='"+obj.totalAmount+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+obj.balanceAmount+"</b><input type='hidden' id ='onAccountBalanceAmountEle_"+i+"' value='"+obj.balanceAmount+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+obj.paymentTypeString+"</b><input type='hidden' id ='onAccountPaymentTypeEle_"+i+"' value='"+obj.paymentType+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+chequeDateString+"</b><input type='hidden' id ='onAccountChequeDateEle_"+i+"' value='"+chequeDateString+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+chequeNumber+"</b><input type='hidden' id ='onAccountChequeNumberEle_"+i+"' value='"+chequeNumber+"'/></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+bankName+"</b><input type='hidden' id ='onAccountBankNameEle_"+i+"' value='"+bankName+"'/></td>");
			$('#onAccountDetailsTable tbody').append('<tr id="onAccountDetails_'+ obj.onAccountId +'">' + columnArray.join(' ') + '</tr>');
			
			columnArray	= [];
		}
	} else {
		$('#onAccountDetailsHeader').addClass('hide');
		$('#onAccountDetailsDiv').addClass('hide');
	}
}

function isNumberKeyWithDecimal(evt, id) {
	let charCode = (evt.which) ? evt.which : evt.keyCode;

	if(charCode == 46) {
		let txt = document.getElementById(id).value;

		if(txt.indexOf(".") <= -1)
			return true;
	}
	
	return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

function validateInvoicePaymentDetails(makepayementbillnolist) {
	if(invoicePaymentType_0 > 0) {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
	
	for (const billId of makepayementbillnolist) {
		let invoicePaymentMode	= $('#paymentModeInnerTbl_' + billId).val();
		let billno 				= $('#billNoInnerTbl_' + billId).val();

		if(billPaymentConfig.BankPaymentOperationRequired) {
			if(invoicePaymentType_0 > 0 && isValidPaymentMode(invoicePaymentType_0)) {
				let rowCount 		= $('#storedPaymentDetails tr').length;
				
				if(rowCount <= 0) {
					showMessage('info', 'Please, Add Payment details !');
					return false;
				}
			} else if(isValidPaymentMode(invoicePaymentMode) && !$('#paymentDataTr_' + billId).exists()) {
				showMessage('info', '<i class="fa fa-info-circle"></i> Please, Add Payment details for this Bill <font size="5" color="red">' + billno + '</font> !');
				return false;
			}
		}
	}
	
	return true;
}

function setPanNumber(panNumber, billId) {
	$("#panNumberInnerTbl_" + billId).val(panNumber);
	$('#panNumber').val(panNumber);
}

function validatePanNumber(billId) {
	if(!tdsConfiguration.IsTdsAllow || !tdsConfiguration.IsPANNumberRequired)
		return true;
	
	let panNumber	= $('#panNumberInnerTbl_' + billId).val();
	let tdsAmount	= $('#tdsAmtInnerTbl_' + billId).val();
	let billNumber	= $('#billNoInnerTbl_' + billId).val();
	
	if (IsPANNumberMandetory && Number(tdsAmount) > 0 && (panNumber == '' || panNumber == undefined)) {
		showMessage('error', ' Please Enter PAN Number for Bill Number ' + billNumber + '!');
		$('#panNumber_' + billId).focus();
		return false;
	}
	
	return true;
}

function setPanNumberInInnerTable() {
	$(".panNumberInnerTblCls").val($("#panNumber").val());
}

function setTanNumberInInnerTable() {
	$(".tanNumberInnerTblCls").val($("#tanNumber").val());
}

function createTDSDropdown(tdsChargeList, bills) {
	const container = document.getElementById("tdsContainer");
	const oldDropdown = document.getElementById("tdsPercentageSelect");

	if (oldDropdown) container.removeChild(oldDropdown);

	const select = document.createElement("select");
	select.id = "tdsPercentageSelect";
	select.style.display = "none";
	select.style.marginLeft = "15px";

	for (const element of tdsChargeList) {
		const option = document.createElement("option");
		option.value = element;
		option.text = element + "%";
		select.appendChild(option);
	}

	function updateTotalTDSAmount() {
		let totalTDS = 0;

		bills.forEach(bill => {
			const val = parseFloat($(`#tdsAmtInnerTbl_${bill.billId}`).val()) || 0;
			totalTDS += val;
		});
		
		$('#tdsAmount').val(totalTDS.toFixed(2));
	}

	$('#tdsAmount').prop('disabled', true);

	select.onchange = function () {
		bills.forEach(bill => {
			if (this.value > 0)
				onTDSDropdownChange(this, bill.billId);
			else
				BillClearanceTDSChargeInPercent = 0;
		});

		updateTotalTDSAmount();
	};

	container.appendChild(select);

	const checkbox = document.getElementById("tdsCheckBox");
	
	if (checkbox) {
		checkbox.onclick = function () {
			select.style.display = this.checked ? "inline-block" : "none";

			if (this.checked) {
				if (select.options.length > 0 && select.value > 0) {
					bills.forEach(bill => {
						onTDSDropdownChange(select, bill.billId);
						$('#tdsAmtInnerTbl_' + bill.billId).prop('disabled', true);
					});
				
					updateTotalTDSAmount();
				}
			} else {
				select.selectedIndex = 0;
				
				bills.forEach(bill => {
					$(`#tdsAmtInnerTbl_${bill.billId}`).val("0.00");
					
					if(tdsConfiguration.IsAllowEditableTdsAmount)
						$('#tdsAmtInnerTbl_' + bill.billId).prop('disabled', false);
				});
				
				$('#tdsAmount').val("0.00");
			}
		};
		
		bills.forEach(bill => {
			if(!tdsConfiguration.IsAllowEditableTdsAmount)
				$('#tdsAmtInnerTbl_' + bill.billId).prop('disabled', true);
		});
	}
}

function onTDSDropdownChange(selectElement, billId) {
	BillClearanceTDSChargeInPercent = selectElement.value;
	allowTdsOnPaymentTypeSelection(billId);
}