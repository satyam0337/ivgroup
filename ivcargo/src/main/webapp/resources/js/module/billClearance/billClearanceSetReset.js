/**
 * @Anant Chaudhary	16-04-2016
 */

function setPaymentType() {
	removeOption('makePaymentJsPannel #paymentType', null);
	createOption('makePaymentJsPannel #paymentType', 0, '--Payment Type--');
	createOption('makePaymentJsPannel #paymentType', PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	
	if(billPaymentConfig.showBillPaymentOptionsPermissionWise) {
		if(allowBillClearanceNegotiatedPayment)
			createOption('makePaymentJsPannel #paymentType', PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		
		if(allowBillClearancePartialPayment)
			createOption('makePaymentJsPannel #paymentType', PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	} else {
		createOption('makePaymentJsPannel #paymentType', PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		createOption('makePaymentJsPannel #paymentType', PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	}

	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > 0) {
		$('#makePaymentJsPannel #paymentType' + " option[value='" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID + "']").remove();
		$('#makePaymentJsPannel #paymentType').prepend("<option value='" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID + "' selected='selected'>" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME + "</option>");
		$('#makePaymentJsPannel #paymentType').change();
		$('#makePaymentJsPannel #paymentType').prop('disabled', true);
	}
}

function setPaymentMode() {
	/*
	 * Property based will be done
	 */
	removeOption('makePaymentJsPannel #paymentMode', null);
	createOption('makePaymentJsPannel #paymentMode', 0, '---Select Mode---');
	
	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(const element of paymentTypeArr) {
			if(element != null)
				$('#makePaymentJsPannel #paymentMode').append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
		}
	}

	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > 0) {
		$('#makePaymentJsPannel #paymentMode' + " option[value='" + PAYMENT_TYPE_CASH_ID + "']").remove();
		$('#makePaymentJsPannel #paymentMode').prepend("<option value='" + PAYMENT_TYPE_CASH_ID + "' selected='selected'>" + PAYMENT_TYPE_CASH_NAME + "</option>");
	}
}

function setPartialPaymentSelection(billId) {
	operationOnSelectTag('partialPaymentSelection_' + billId, 'removeAll', null, null);
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', '----Select----', '0');
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', LR_WISE_PARTIAL_PAYMENT_NAME, LR_WISE_PARTIAL_PAYMENT_ID);
	operationOnSelectTag('partialPaymentSelection_' + billId, 'addNew', WITHOUT_LR_WISE_PARTIAL_PAYMENT_NAME, WITHOUT_LR_WISE_PARTIAL_PAYMENT_ID);
}

function setTotalAmt() {
	$("#makePaymentJsPannel #totalAmount").val(GrandTotal);
}

function setReceivedAmount() {
	$("#makePaymentJsPannel #receivedAmtLimit").val(GrandTotal - BalanceAMT);

	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > 0)
		$("#makePaymentJsPannel #receivedAmount").val($('#receivedAmountValue').val());
}

function setPaymentTypeInnerTable(billId, status) {
	removeOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, null);

	createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, 0, '--Payment Type--');
	createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	
	if(billPaymentConfig.showBillPaymentOptionsPermissionWise) {
		if(allowBillClearanceNegotiatedPayment)
			createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		
		if(allowBillClearancePartialPayment)
			createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	} else {
		createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_NEGOTIATED_ID, PAYMENT_TYPE_STATUS_NEGOTIATED_NAME);
		createOption('makePaymentJsPannel #paymenttypeInnerTbl_' + billId, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
	}
	
	if(billPaymentConfig.showReceivedAmountFeild) {
		if($('#receivedAmountValue').val() > 0){
			$('#makePaymentJsPannel #paymenttypeInnerTbl_'+ billId + " option[value='" + status + "']").remove();

			if(status == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
				$('#makePaymentJsPannel #paymenttypeInnerTbl_'+ billId).prepend("<option value='" + status + "' selected='selected'>" + PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME + "</option>");
			else if(status == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
				$('#makePaymentJsPannel #paymenttypeInnerTbl_'+ billId).prepend("<option value='" + status + "' selected='selected'>" + PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME + "</option>");

			$('#makePaymentJsPannel #paymenttypeInnerTbl_'+ billId).change();
			$('#makePaymentJsPannel #paymenttypeInnerTbl_'+ billId).prop('disabled', true);
		}
	}
}

function setPaymentModeInnerTable(billId) {

	/*
	 * Property based will be done
	 */
	removeOption('makePaymentJsPannel #paymentModeInnerTbl_' + billId, null);

	createOption('makePaymentJsPannel #paymentModeInnerTbl_' + billId, 0, '----Select Mode----');
	
	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(const element of paymentTypeArr) {
			if(element != null) {
				$('#makePaymentJsPannel #paymentModeInnerTbl_' + billId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
			}
		}
	}

	if(billPaymentConfig.showReceivedAmountFeild){
		if($('#receivedAmountValue').val() > 0){
			$('#makePaymentJsPannel #paymentModeInnerTbl_'+ billId + " option[value='"+PAYMENT_TYPE_CASH_ID+"']").remove();
			$('#makePaymentJsPannel #paymentModeInnerTbl_'+ billId).prepend("<option value='"+PAYMENT_TYPE_CASH_ID+"' selected='selected'>"+PAYMENT_TYPE_CASH_NAME+"</option>");
		}
	}
}

function setTotalAmtInnerTable(row,totAmtForInnerTable,totAmtForInnerTable1) {
	$("#makePaymentJsPannel #totAmtInnerTbl_" + row).val(totAmtForInnerTable1);
	$("#makePaymentJsPannel #balanceInnerTbl_" + row).val(totAmtForInnerTable);
	jsObjForBalanceAmt[row] = totAmtForInnerTable;
}

//Set date picker for inner table
function setDateForInnertable(billId){
	if (datefield.type!="date"){ //if browser doesn't support input type="date", initialize date picker widget:
		jQuery(function($){ //on document.ready
			$('#makePaymentJsPannel #ChequeDateInnerTbl_' + billId).datepicker({
			});
		});
	}
}

//Show Bill Wise Data

function setDataForBillWiseTable(){
	let backDateRow		= createRowInTable('tr_', 'tr_', '');
	
	let backDateNameCol 		= createColumnInRow(backDateRow , '', '', '10%', 'left', '', '');
	let backDateCol 			= createColumnInRow(backDateRow , '', '', '50%', '', '');
	
	appendValueInTableCol(backDateNameCol, '<b>Date : </b>');
	appendValueInTableCol(backDateCol, '<input name="jspanelbackDate" id="jspanelbackDate" type="text" value="" onkeyup="setMonthYear(this);" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}" class="form-control">');
	
	$('#makePaymentJsPannel #backDateSelectPanel').append(backDateRow);
	
	let tableEl 		= document.getElementById("billClrTable");
	makepayementbillnolist = new Array();
	billDateArray		   = new Array();
	for (let row = tableEl.rows.length-2; row > 0; row--) {

		if(tableEl.rows[row].cells[1].getElementsByTagName("input")[0]) {
			if(tableEl.rows[row].cells[1].getElementsByTagName("input")[0].checked) {

				let bno 				= tableEl.rows[row].cells[2].getElementsByTagName("input")[0].value;
				
				if(tableEl.rows[row].cells[2].getElementsByTagName("input")[1] != undefined){
					if(tableEl.rows[row].cells[2].getElementsByTagName("input")[1] != undefined)
						var billId				= parseInt(tableEl.rows[row].cells[2].getElementsByTagName("input")[1].value);
					
					if(tableEl.rows[row].cells[2].getElementsByTagName("input")[2] != undefined)
						var creditorId			= parseInt(tableEl.rows[row].cells[2].getElementsByTagName("input")[2].value);
					
					if(tableEl.rows[row].cells[2].getElementsByTagName("input")[3] != undefined)
						var receivedAmtLimit	= parseInt(tableEl.rows[row].cells[2].getElementsByTagName("input")[3].value);
					
					if(tableEl.rows[row].cells[2].getElementsByTagName("input")[4] != undefined)
						var branchId			= parseInt(tableEl.rows[row].cells[2].getElementsByTagName("input")[4].value);
					
					if(tableEl.rows[row].cells[2].getElementsByTagName("input")[5] != undefined)
						var billCreationDateStr	= tableEl.rows[row].cells[2].getElementsByTagName("input")[5].value;
					
					billDateArray.push(billCreationDateStr);
					
					let receivedAmount	 = 0;
					let balanceAmount	 = 0;
					let status			 = 0;
	
					if(billPaymentConfig.showReceivedAmountFeild
						&& jsDataPanelHM != null && jsDataPanelHM.hasOwnProperty(billId)) {
						let jsDataPanelObject = jsDataPanelHM[billId];
	
						receivedAmount	= jsDataPanelObject.ReceivedAmount;
						balanceAmount	= jsDataPanelObject.BalanceAmount;
						status 			= jsDataPanelObject.Status;
					}
	
					let billRow					= createRowInTable('tr_' + billId, 'tr_' + billId, '');
					let billNo 					= createColumnInRow(billRow , 'BillNo_' + billId, 'BillNo_' + billId, '5%', 'left', '', '');
	
					if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsPANNumberRequired)
						var PanNumber	 		= createColumnInRow(billRow , 'panNumber_' + billId, 'panNumber_' + billId, '10%', 'left', '', '');
					
					if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsTANNumberRequired)
						var TanNumber	 		= createColumnInRow(billRow , 'tanNumber_' + billId, 'tanNumber_' + billId, '10%', 'left', '', '');
	
					let PaymentMode 			= createColumnInRow(billRow , 'PaymentMode_' + billId, 'PaymentMode_' + billId, '10%', 'left', '', '');
					let Remark		 			= createColumnInRow(billRow , 'remark_' + billId, 'remark_' + billId, '10%', 'left', '', '');
					let PaymentType		 		= createColumnInRow(billRow , 'PaymentType_' + billId, 'PaymentType_' + billId, '10%', 'left', '', '');
					let TotalAmount		 		= createColumnInRow(billRow , 'TotalAmount_' + billId, 'TotalAmount_' + billId, '10%','left','','');
					let ReceivedAmountCol	 	= createColumnInRow(billRow , 'ReceivedAmount_' + billId, 'TotalAmount_' + billId, '8%','left','','');
					
					if(tdsConfiguration.IsCheckboxOptionToAllowTDS)
						var checkBoxForTDSCol		 		= createColumnInRow(billRow , 'checkBoxForTDS_' + billId, 'checkBoxForTDS_' + billId, '2%','left','','');
					
					if(tdsConfiguration.IsTdsAllow) {
						var TxnAmount		 	= createColumnInRow(billRow , 'txnAmount_' + billId, 'txnAmount_' + billId, '10%','left','','');
						var TdsAmt			 	= createColumnInRow(billRow , 'tdsAmount_' + billId, 'tdsAmount_' + billId, '7%','left','','');
					}
	
					let ReceiveAmtCol	 		= createColumnInRow(billRow , 'ReceiveAmt_' + billId, 'ReceiveAmt_' + billId, '10%','left','','');
					let Balance			 		= createColumnInRow(billRow , 'Balance_' + billId, 'Balance_' + billId, '20%','left','','');
					
					if(chequeBounceRequired)
						var isAllowChequePayment	= createColumnInRow(billRow , 'isAllowChequePayment_' + billId, 'isAllowChequePayment_' + billId, '20%','left','','');
					
					appendValueInTableCol(billNo, bno);
					appendValueInTableCol(billNo, '<input name="billNoInnerTbl_' + billId + '" id="billNoInnerTbl_' + billId + '" type="hidden" value=' + bno + '>');
					appendValueInTableCol(billNo, '<input name="creditorIdInnerTbl_' + billId + '" id="creditorIdInnerTbl_' + billId + '" type="hidden" value=' + creditorId + '>');
					appendValueInTableCol(billNo, '<input name="receivedAmtLimitInnerTbl_' + billId + '" id="receivedAmtLimitInnerTbl_' + billId + '" type="hidden" value=' + receivedAmtLimit + '>');
					appendValueInTableCol(billNo, '<input name="branchIdInnerTbl_' + billId + '" id="branchIdInnerTbl_' + billId + '" type="hidden" value=' + branchId + '>');
					appendValueInTableCol(billNo, '<input name="billCreationDateInnerTbl_' + billId + '" id="billCreationDateInnerTbl_' + billId + '" type="hidden" value=' + billCreationDateStr + '>');
	
					if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsPANNumberRequired)
						appendValueInTableCol(PanNumber, '<input name="panNumberInnerTbl_' + billId + '" id="panNumberInnerTbl_' + billId + '" maxlength="10" width="250px;" class="form-control panNumberInnerTblCls" placeholder="PAN Number"/>');
					
					if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsTANNumberRequired)
						appendValueInTableCol(TanNumber, '<input name="tanNumberInnerTbl_' + billId + '" id="tanNumberInnerTbl_' + billId + '" maxlength="10" width="250px;" class="form-control tanNumberInnerTblCls" placeholder="TAN Number"/>');
	
					appendValueInTableCol(PaymentMode, '<select   name="paymentModeInnerTbl_' + billId + '" id="paymentModeInnerTbl_' + billId + '" width="250px;" onchange="setValueToInnerTableOnPaymentModeChange(' + billId + ');" class="form-control paymentModeInnerTblCls" ></select>');
	
					appendValueInTableCol(Remark, '<input align="right" name="remarkInnerTbl_' + billId + '" id="remarkInnerTbl_' + billId + '" maxlength="50" class="form-control remarkInnerTblCls"  type="text" placeholder="Remark" >');
					appendValueInTableCol(Remark, '<div class= "ChequeBlockInnerTblCLs"><input align="right" style="display :none;" name="chequeInnerTbl_' + billId + '" id="chequeInnerTbl_' + billId + '" type="text" class = "form-control ChequeInnerTblClass" placeholder="Cheque No/ Txn. ID" /></div><input align="right" name="ChequeDateInnerTbl_' + billId + '" id="ChequeDateInnerTbl_' + billId + '" placeholder="Cheque / Txn. Date" type="text" onkeyup="setMonthYear(this);" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"; style="display :none;" class = "form-control ChequeDateInnerTblClass" /><input align="right" name="bankNameInnerTbl_' + billId+'" id="bankNameInnerTbl_' + billId + '" type="text" style="display :none;" class = "form-control bankNameInnerTblClass" placeholder="Bank Name" />');
					appendValueInTableCol(Remark, '');
	
					if(billPaymentConfig.showReceivedAmountFeild) {
						if($('#receivedAmountValue').val() > 0)
							appendValueInTableCol(PaymentType, '<select  style="height: " id="paymenttypeInnerTbl_' + billId + '" value="'+status+'" class="form-control paymenttypeInnerTblCls"  name="paymenttypeInnerTbl_' + billId + '" ></select>');
						else
							appendValueInTableCol(PaymentType, '<select  style="height: " id="paymenttypeInnerTbl_' + billId + '" class="form-control paymenttypeInnerTblCls" onchange="setValueToInnerTablePayment(' + billId + '); displayPartialPaymentSelectionDropdown(' + billId + ')" name="paymenttypeInnerTbl_' + billId + '" ></select>');
					} else
						appendValueInTableCol(PaymentType, '<select  style="height: " id="paymenttypeInnerTbl_' + billId + '" class="form-control paymenttypeInnerTblCls" onchange="setValueToInnerTablePayment(' + billId + '); displayPartialPaymentSelectionDropdown(' + billId + ')" name="paymenttypeInnerTbl_' + billId + '" ></select>');
	
					appendValueInTableCol(TotalAmount, '<input align="right" name="totAmtInnerTbl_' + billId + '"  id="totAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control"/>');
					appendValueInTableCol(ReceivedAmountCol, '<input align="right" name="receivedAmtInnerTbl_' + billId + '"  id="receivedAmtInnerTbl_' + billId + '" readonly="readonly" type="text" class="form-control" value="' + receivedAmtLimit + '"/>');
	
					if(tdsConfiguration.IsCheckboxOptionToAllowTDS)
						appendValueInTableCol(checkBoxForTDSCol, '<input align="center" name="checkBoxTDSInnerTbl_' + billId + '" onclick="" id="checkBoxTDSInnerTbl_' + billId + '" class="form-control" type="checkbox"/>');
					
					if(tdsConfiguration.IsTdsAllow) {
						appendValueInTableCol(TxnAmount, '<input align="right" name="txnAmtInnerTbl_' + billId + '"  id="txnAmtInnerTbl_' + billId + '" placeholder="0" class="form-control" type="text" value="0" maxlength="7" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);validateTxnAmount(this);tdsCalculation(this);" onkeypress="return noNumbers(event ,this);" onkeyup="validateTxnAmount(this);tdsCalculation(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
						appendValueInTableCol(TdsAmt, '<input align="right" name="tdsAmtInnerTbl_' + billId + '" maxlength="7" placeholder="0" class="form-control tdsAmtInnerTblCls" onfocus="resetTextFeild(this, 0);" onblur="resetTextFeild(this, 0);clearIfNotNumeric(this,0);tdsCalculation(this);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="tdsAmtInnerTbl_' + billId + '" type="text" value="0" onkeyup="tdsCalculation(this);setValueToInnerTableReceviedChange(' + billId + ');"/>');
					}
	
					appendValueInTableCol(ReceiveAmtCol, '<span><select id="partialPaymentSelection_' + billId + '" class="form-control partialPaymentSelectionTblCls col-sm-3 hide" onchange="setValueToInnerTablePayment(' + billId + ')" name="partialPaymentSelectionInnerTbl_' + billId + '" ></select></span>');
	
					if(billPaymentConfig.showReceivedAmountFeild){
						if($('#receivedAmountValue').val() > 0)
							appendValueInTableCol(ReceiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount"  class="form-control recAmtInnerTblCls"  id="recAmtInnerTbl_' + billId + '" value="'+ receivedAmount +'" type="text" readonly="readonly"></span>');
						else
							appendValueInTableCol(ReceiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="resetTextFeild(this, 0);clearOnfocus(this);openLrwiseCOnfigOnRceive(' + billId + ');" onblur="resetTextFeild(this, 0);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text"></span>');
					} else if(tdsConfiguration.IsTdsAllow)
						appendValueInTableCol(ReceiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="clearOnfocus(this);openLrwiseCOnfigOnRceive(' + billId + ');" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text" readonly="readonly"></span>');
					else
						appendValueInTableCol(ReceiveAmtCol, '<span><input align="right" name="recAmtInnerTbl_' + billId + '" maxlength="7" placeholder="Received Amount" onkeyup="setValueToInnerTableReceviedChange(' + billId + ');" class="form-control recAmtInnerTblCls" onfocus="resetTextFeild(this, 0);clearOnfocus(this);openLrwiseCOnfigOnRceive(' + billId + ');" onblur="resetTextFeild(this, 0);" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;}"  id="recAmtInnerTbl_' + billId + '" type="text"></span>');
	
					if(billPaymentConfig.showReceivedAmountFeild){
						if($('#receivedAmountValue').val() > 0)
							appendValueInTableCol(Balance, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" id="balanceInnerTbl_' + billId + '" value="'+ balanceAmount +'" type="text" readonly="readonly" class="form-control" >');
						else
							appendValueInTableCol(Balance, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" readonly="readonly" id="balanceInnerTbl_' + billId + '" type="text" class="form-control" >');
					} else
						appendValueInTableCol(Balance, '<input align="right" name="balanceInnerTbl_' + billId + '" placeholder="Balance" readonly="readonly" id="balanceInnerTbl_' + billId + '" type="text" class="form-control" >');
					
					if(chequeBounceRequired)
						appendValueInTableCol(isAllowChequePayment, '<input align="right" name="isAllowChequePaymentInnerTbl_' + billId + '" id="isAllowChequePaymentInnerTbl_' + billId + '" type="hidden" value="0">');
					
					$('#makePaymentJsPannel #ratessubEditTable').append(billRow);
	
					$('#ChequeDateInnerTbl_' + billId).val(dateWithDateFormatForCalender(new Date(),"-"));
					
					$( function() {
						$('#ChequeDateInnerTbl_' + billId).datepicker({
							maxDate: new Date(),
							showAnim: "fold",
							dateFormat: 'dd-mm-yy'
						});
					} );
					
					setPaymentModeInnerTable(billId);
					let totAmtForInnerTable 	= parseInt(tableEl.rows[row].cells[8].firstChild.nodeValue);
					let totAmtForInnerTable1 	= parseInt(tableEl.rows[row].cells[10].firstChild.nodeValue);
	
					if(billPaymentConfig.showReceivedAmountFeild) {
						if($('#receivedAmountValue').val() > 0)
							setTotalAmtInnerTable(billId, balanceAmount, totAmtForInnerTable1);
						else
							setTotalAmtInnerTable(billId, totAmtForInnerTable, totAmtForInnerTable1);
					} else
						setTotalAmtInnerTable(billId, totAmtForInnerTable, totAmtForInnerTable1);
					
					setPaymentTypeInnerTable(billId,status);
					makepayementbillnolist.push(billId);
					setPartialPaymentSelection(billId);
					setBillCreationDate(billId,billCreationDateStr);
				}
			}
		}
	}
	
	setDateCalender();
}

function setBillCreationDate(billId,billCreationDateStr) {
	$("#makePaymentJsPannel #billCreationDateInnerTbl_" + billId).val(billCreationDateStr);
}

function showHideColIfTdsAllow() {
	if(tdsConfiguration.IsTdsAllow) {
		$(".txnAmountCol").show();
		$(".tdsAmountCol").show();
	}
	
	if(tdsConfiguration.IsCheckboxOptionToAllowTDS)
		$(".checkBoxForTDSCol").show();
	
	if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsPANNumberRequired)
		$(".panNumberCol").show();
	
	if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsTANNumberRequired)
		$(".tanNumberCol").show();
}

function setDetailsWhileNoPatialLrFind(billId){
	$('#lrDetailsJsPannel #Lrdetails').hide();
	$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(jsObjForBalanceAmt[billId]);
	$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(0);
	$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', true);
}

function setDatatable(tableId) {
	let tabledata = $(tableId).DataTable( {
		"paging": 		  false,
		"searching": 	  false,
		"bPaginate": 	  false,
		"bInfo":     	  false,
		"bautoWidth":     true,
		"sDom": '<"top"l>rt<"bottom"ip><"clear">',
		"fnDrawCallback": function ( oSettings ) {

			//Need to redo the counters if filtered or sorted 
			if ( oSettings.bSorted || oSettings.bFiltered ) {
				for ( let i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
					$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
				}
			}
		},
		"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
		"aaSorting": [[ 1, 'asc' ]]
	});

	return tabledata;
}

function setValueToInnerTableOnPaymentModeChange(billId) {
	if($("#makePaymentJsPannel #paymentModeInnerTbl_" + billId).val() == PAYMENT_TYPE_CASH_ID) {
		$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
		$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).hide();
		$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).hide();
		$("#makePaymentJsPannel #chequeInnerTbl_" + billId).hide();
	} else if($("#makePaymentJsPannel #paymentModeInnerTbl_" + billId).val() == PAYMENT_TYPE_CHEQUE_ID) {
		let corporateAccountId	= $('#creditorId_1').val();
		let accountGroupId	= executive.accountGroupId;
		let type			= BILL_PAYMENT;
		let branchId		= executive.branchId;
		
		if(chequeBounceRequired) {
			if(!allowChequeBouncePayment) {
				chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
				setTimeout(function (){
					let size = checkObjectSize(chequeBounceDetails);
					if(size > 0){
						if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0){
							if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
								showChequePayment(billId);
								isAllowChequePayment	= 1;
								$('#isAllowChequePaymentInnerTbl_'+billId).val(isAllowChequePayment);
							} else {
								setChequeBounceDetails(chequeBounceDetails);
								$("#paymentModeInnerTbl_" + billId + "").val(0);
								hideChequePayment(billId);
							}
						} else {
							setChequeBounceDetails(chequeBounceDetails);
							$("#paymentModeInnerTbl_" + billId + "").val(0);
							hideChequePayment(billId);
						}
					} else {
						$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
						$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).show();
						$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).show();
						$("#makePaymentJsPannel #chequeInnerTbl_" + billId).show();
					}
				},500);
			} else {
				$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
				$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).show();
				$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).show();
				$("#makePaymentJsPannel #chequeInnerTbl_" + billId).show();
			}
		} else {
			$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
			$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).show();
			$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).show();
			$("#makePaymentJsPannel #chequeInnerTbl_" + billId).show();
		}
	} else if($("#makePaymentJsPannel #paymentModeInnerTbl_" + billId).val() == PAYMENT_TYPE_ONLINE_RTGS_ID
		|| $("#makePaymentJsPannel #paymentModeInnerTbl_" + billId).val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
		$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).show();
		$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).show();
		$("#makePaymentJsPannel #chequeInnerTbl_" + billId).show();
	}
}

function showChequePayment(billId){
	$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
	$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).show();
	$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).show();
	$("#makePaymentJsPannel #chequeInnerTbl_" + billId).show();
}

function hideChequePayment(billId){
	$("#makePaymentJsPannel #remarkInnerTbl_" + billId).show();
	$("#makePaymentJsPannel #ChequeDateInnerTbl_" + billId).hide();
	$("#makePaymentJsPannel #bankNameInnerTbl_" + billId).hide();
	$("#makePaymentJsPannel #chequeInnerTbl_" + billId).hide();
}

//set Data On PaymentMode changed
function setValueToTableOnPaymentModeChange(){
	if($("#makePaymentJsPannel #paymentMode").val() == PAYMENT_TYPE_CASH_ID) {
		$("#makePaymentJsPannel #ChequeBlock").hide();
		$("#makePaymentJsPannel #BankName").hide();
		$("#makePaymentJsPannel #jspanelchequedate").hide();
	} else if($("#makePaymentJsPannel #paymentMode").val() == PAYMENT_TYPE_CHEQUE_ID) {
		let corporateAccountId	= $('#CreditorId').val();
		
		if(corporateAccountId == 0)
			corporateAccountId	= $('#creditorIdForCheck').val();

		let accountGroupId	= executive.accountGroupId;
		let type			= BILL_PAYMENT;
		let branchId		= executive.branchId;

		if(chequeBounceRequired) {
			chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);

			setTimeout(function (){
				let size = checkObjectSize(chequeBounceDetails);

				if(size > 0){
					if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0){
						if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
							$("#makePaymentJsPannel #ChequeBlock").show();
							$("#makePaymentJsPannel #BankName").show();
							$("#makePaymentJsPannel #jspanelchequedate").show();
							isAllowChequePayment	= 1;
							$('#isAllowChequePaymentInnerTbl').val(isAllowChequePayment);
						} else {
							setChequeBounceDetails(chequeBounceDetails);
							$("#makePaymentJsPannel #paymentMode").val(0);
							$("#makePaymentJsPannel #ChequeBlock").hide();
							$("#makePaymentJsPannel #BankName").hide();
							$("#makePaymentJsPannel #jspanelchequedate").hide();
						}
					} else {
						setChequeBounceDetails(chequeBounceDetails);
						$("#makePaymentJsPannel #paymentMode").val(0);
						$("#makePaymentJsPannel #ChequeBlock").hide();
						$("#makePaymentJsPannel #BankName").hide();
						$("#makePaymentJsPannel #jspanelchequedate").hide();
					}
				} else {
					$("#makePaymentJsPannel #ChequeBlock").show();
					$("#makePaymentJsPannel #BankName").show();
					$("#makePaymentJsPannel #jspanelchequedate").show();
				}
			},500);
		} else {
			$("#makePaymentJsPannel #ChequeBlock").show();
			$("#makePaymentJsPannel #BankName").show();
			$("#makePaymentJsPannel #jspanelchequedate").show();
		}
	} else if($("#makePaymentJsPannel #paymentMode").val() == PAYMENT_TYPE_ONLINE_RTGS_ID
	 || $("#makePaymentJsPannel #paymentMode").val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		$("#makePaymentJsPannel #ChequeBlock").show();
		$("#makePaymentJsPannel #jspanelchequedate").show();
		$("#makePaymentJsPannel #ChequeDate").show();
		$("#makePaymentJsPannel #BankName").show();
	}

	setDataToInnerTable();
}

function setAmountForPayment() {

	totalTdsAmount		= 0;
	let typeOfSelection	= $('#typeOfSelection').val();
	
	if(Number(typeOfSelection) != Number(SEARCH_BY_MULTIPLE_BILL)) {
		$("#makePaymentJsPannel #jsPanelDataContentForBill").show();
		$("#makePaymentJsPannel #jsPanelDataContent").hide();
	}

	if($("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		$("#makePaymentJsPannel .paymentModeInnerTblCls").val($("#makePaymentJsPannel #paymentMode").val());
		$("#makePaymentJsPannel .paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		$("#makePaymentJsPannel #receivedAmount").val(BalanceAMT);
		$("#makePaymentJsPannel #txnAmount").val(BalanceAMT);
		$("#makePaymentJsPannel #balanceAmount").val(0);
		$("#makePaymentJsPannel #jsPanelDataContentForBill").show();

		if(tdsConfiguration.IsTdsAllow) {
			$("#makePaymentJsPannel #tdsAmount").val(totalTdsAmount);

			if(totalTdsAmount > 0)
				$("#makePaymentJsPannel #receivedAmount").val(BalanceAMT - Number(totalTdsAmount));
		}
	} else if($("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		$("#makePaymentJsPannel #receivedAmount").val(0);
		$("#makePaymentJsPannel #txnAmount").val(0);
		$("#makePaymentJsPannel #balanceAmount").val(BalanceAMT);

		$("#makePaymentJsPannel #jsPanelDataContentForBill").show();

		if(tdsConfiguration.IsTdsAllow)
			$("#makePaymentJsPannel #tdsAmount").val(0);
	} else if($("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
		$("#makePaymentJsPannel #jsPanelDataContentForBill").show();
		$("#makePaymentJsPannel #receivedAmount").attr('readonly', true);
		$("#makePaymentJsPannel .paymenttypeInnerTblCls").val(PAYMENT_TYPE_STATUS_NEGOTIATED_ID);
		$("#makePaymentJsPannel #balanceAmount").val(BalanceAMT);
		$("#makePaymentJsPannel #receivedAmount").val(0);
		$("#makePaymentJsPannel .paymentModeInnerTblCls").val($("#makePaymentJsPannel #paymentMode").val());

		if(tdsConfiguration.IsTdsAllow)
			$("#makePaymentJsPannel #tdsAmount").val(0);
	}

	setDataToInnerTable();
}

function setDataToInnerTable() {

	if($("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		for(const element of makepayementbillnolist) {
			if(tdsConfiguration.IsTdsAllow) {
				$("#makePaymentJsPannel #txnAmtInnerTbl_" + element).val($("#makePaymentJsPannel #totAmtInnerTbl_" + element).val() - $("#makePaymentJsPannel #receivedAmtInnerTbl_" + element).val());
				$("#makePaymentJsPannel #recAmtInnerTbl_" + element).val($("#makePaymentJsPannel #txnAmtInnerTbl_" + element).val() - $("#makePaymentJsPannel #tdsAmtInnerTbl_" + element).val());
				$("#makePaymentJsPannel #txnAmtInnerTbl_" + element).attr('disabled', true);
			} else
				$("#makePaymentJsPannel #recAmtInnerTbl_" + element).val($("#makePaymentJsPannel #balanceInnerTbl_" + element).val());

			$('#makePaymentJsPannel #balanceInnerTbl_' + element).val(0);

			$("#makePaymentJsPannel .ChequeDateInnerTblClass").val($("#makePaymentJsPannel #jspanelchequedate").val());
			$("#makePaymentJsPannel .ChequeInnerTblClass").val($("#makePaymentJsPannel #Cheque").val());
			$("#makePaymentJsPannel .bankNameInnerTblClass").val($("#makePaymentJsPannel #BankName").val());
			$("#makePaymentJsPannel .panNumberInnerTblCls").val($("#makePaymentJsPannel #panNumber").val());
			$("#makePaymentJsPannel .tanNumberInnerTblCls").val($("#makePaymentJsPannel #tanNumber").val());
			$("#makePaymentJsPannel .paymentModeInnerTblCls").val($("#makePaymentJsPannel #paymentMode").val());
			setValueToInnerTableOnPaymentModeChange(element);

			$("#makePaymentJsPannel #panNumberInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #tanNumberInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #paymentModeInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #remarkInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #chequeInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #ChequeDateInnerTbl_" + element).attr('disabled', true);
			$("#makePaymentJsPannel #bankNameInnerTbl_" + element).attr('disabled', true);
		}
	} else if($("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || $("#makePaymentJsPannel #paymentType").val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		for(const element of makepayementbillnolist) {
			$('#makePaymentJsPannel #balanceInnerTbl_' + element).val(jsObjForBalanceAmt[element]);
			$('#makePaymentJsPannel #recAmtInnerTbl_' + element).val(0);
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + element).val($("#makePaymentJsPannel #paymentType").val());
			$("#makePaymentJsPannel .ChequeDateInnerTblClass").val($("#makePaymentJsPannel #jspanelchequedate").val());
			$("#makePaymentJsPannel .ChequeInnerTblClass").val($("#makePaymentJsPannel #Cheque").val());
			$("#makePaymentJsPannel .bankNameInnerTblClass").val($("#makePaymentJsPannel #BankName").val());
			$("#makePaymentJsPannel .panNumberInnerTblCls").val($("#makePaymentJsPannel #panNumber").val());
			$("#makePaymentJsPannel .tanNumberInnerTblCls").val($("#makePaymentJsPannel #tanNumber").val());
			$("#makePaymentJsPannel .paymentModeInnerTblCls").val($("#makePaymentJsPannel #paymentMode").val());

			setValueToInnerTableOnPaymentModeChange(element);

			if(tdsConfiguration.IsTdsAllow) {
				$("#makePaymentJsPannel #txnAmtInnerTbl_" + element).val(0);
				$("#makePaymentJsPannel #txnAmtInnerTbl_" + element).attr('disabled', false);
			}

			$("#makePaymentJsPannel #panNumberInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #tanNumberInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #paymentModeInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #remarkInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #chequeInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #ChequeDateInnerTbl_" + element).attr('disabled', false);
			$("#makePaymentJsPannel #bankNameInnerTbl_" + element).attr('disabled', false);
		}
	}

	for(const element of makepayementbillnolist) {
		allowTdsOnPaymentTypeSelection(element);
		displayPartialPaymentSelectionDropdown(element);
	}
}

function setPanNumberInInnerTable() {
	let panNumber		= $("#makePaymentJsPannel #panNumber").val();

	$("#makePaymentJsPannel .panNumberInnerTblCls").val(panNumber.toUpperCase());
}

function setTanNumberInInnerTable() {
	let tanNumber		= $("#makePaymentJsPannel #tanNumber").val();
	
	$("#makePaymentJsPannel .tanNumberInnerTblCls").val(tanNumber.toUpperCase());
}

function setRemarkInInnerTable() {
	$("#makePaymentJsPannel .remarkInnerTblCls").val($("#makePaymentJsPannel #remark").val());
}

function setCheckNumberInInnerTable() {
	$("#makePaymentJsPannel .ChequeInnerTblClass").val($("#makePaymentJsPannel #Cheque").val());
}

function setCheckDateInInnerTable() {
	$("#makePaymentJsPannel .ChequeDateInnerTblClass").val($("#makePaymentJsPannel #jspanelchequedate").val());
}

function setBankeNameInInnerTable() {
	$("#makePaymentJsPannel .bankNameInnerTblClass").val($("#makePaymentJsPannel #BankName").val());
}

function setBalanceAmount() {
	if(billPaymentConfig.showReceivedAmountFeild) {
		if($('#receivedAmountValue').val() > 0){
			$("#makePaymentJsPannel #balanceAmount").val(BalanceAMT - $('#receivedAmountValue').val());	

			if((BalanceAMT - $('#receivedAmountValue').val()) == 0)
				$("#makePaymentJsPannel #paymentType").val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);	
		} else
			$("#makePaymentJsPannel #balanceAmount").val(BalanceAMT);	
	} else
		$("#makePaymentJsPannel #balanceAmount").val(BalanceAMT);	
}

function setTotalReceivedAmount() {
	$("#makePaymentJsPannel #totalReceivedAmount").val(TotalReceivedAmt);
}

function setValueToInnerTablePayment(billId) {
	if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {

		if(tdsConfiguration.IsTdsAllow) {
			$("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val(jsObjForBalanceAmt[billId]);
			$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val($("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val() - $("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val());
			$("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).attr('readonly', true);
		} else
			$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(jsObjForBalanceAmt[billId]);
		
		if(tdsConfiguration.IsCheckboxOptionToAllowTDS){
			if ($('#checkBoxTDSInnerTbl_' + billId).prop('checked'))
				$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val($("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val() - $("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val());
			else
				$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val($("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val());
		}

		$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', true);
		$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(0);
	} else if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || $("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
		$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(jsObjForBalanceAmt[billId]);
		$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(0);

		if(tdsConfiguration.IsTdsAllow) {
			$("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val(0);
			$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', true);
			$("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).attr('readonly', false);
		} else
			$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', false);
	}

	allowTdsOnPaymentTypeSelection(billId);
}

function allowTdsOnPaymentTypeSelection(billId) {

	if(tdsConfiguration.IsTdsAllow) {
		if(isTDSChargeInPercentAllow) {
			let tdsCharge 		= Number(BillClearanceTDSChargeInPercent);

			let receivedAmtLimit= parseInt($("#makePaymentJsPannel #receivedAmtLimitInnerTbl_" + billId).val());

			let totalAmt		= parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val());
			let actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
			let txnAmount		= parseInt($("#makePaymentJsPannel #txnAmtInnerTbl_" + billId).val());

			let tdsAmt		= Math.round((txnAmount * tdsCharge ) / 100);

			totalTdsAmount	+= tdsAmt;
			
			if(!tdsConfiguration.IsCheckboxOptionToAllowTDS){
				$("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val(tdsAmt);
			} else {
				if ($('#checkBoxTDSInnerTbl_' + billId).prop('checked')) {
					$("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val(tdsAmt);
					$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(Math.round(txnAmount - tdsAmt));
				}
				
				$("#checkBoxTDSInnerTbl_" + billId).on('click', function() {
					if ($('#checkBoxTDSInnerTbl_' + billId).prop('checked')) {
						$("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val(tdsAmt);
						$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(Math.round(txnAmount - tdsAmt));
					} else {
						$("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId).val(0);
						$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(Math.round(txnAmount));
					}
				});
			}
			
			if(!tdsConfiguration.IsCheckboxOptionToAllowTDS) {
				$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(Math.round(txnAmount - tdsAmt));
				$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(actTotalAmt - txnAmount);
			}
		}
	}
}

function setValueToInnerTableReceviedChange(billId) {
	calulateFinalReceivedAmount(); //coming from MakePayment.js

	if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
		if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() >= 1) {
			let totamt =  jsObjForBalanceAmt[billId];  
			let recamt =  totamt - $("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val();  

			if(recamt <= $("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val())
				$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(recamt);
		} else if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() <= 0 ) {
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(0);	
			$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(jsObjForBalanceAmt[billId]);	
			$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val(0);	
		}
	} else if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID
			|| $("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID
			|| $("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == 0) {
		if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() >= 1) {
			let totamt =  jsObjForBalanceAmt[billId];  ;  
			let recamt =  totamt - $("#makePaymentJsPannel #recAmtInnerTbl_" + billId).val();  

			if(recamt<= $("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val())
				$("#makePaymentJsPannel #balanceInnerTbl_" + billId).val(recamt);	
			
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID);
		} else if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() <= 0) {
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);	
				
			if(showMessagePaymentTypeChange)
				showMessage('info', 'You have enter total amount so payment Type is change to Clear Payment  !');	
		} else if($("#makePaymentJsPannel #balanceInnerTbl_" + billId).val() < 0)
			$("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val(0);
	}
	
	if(tdsConfiguration.IsTdsAllow && Number($('#tdsAmtInnerTbl_'+ billId).val()) > Number($('#txnAmtInnerTbl_'+ billId).val()) && $('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val() < 0) {
		showMessage('error', 'TDS Amount Cannot Be Greater Than Txn Amount');
		changeTextFieldColorNew($("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId), '', '', 'red');
		return false;
	}
	
	if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID
		&& !validateDiscountLimit(discountInPercent, Number( $("#makePaymentJsPannel #totAmtInnerTbl_" + billId).val() - $("#makePaymentJsPannel #receivedAmtInnerTbl_" + billId).val()), $("#makePaymentJsPannel #balanceInnerTbl_" + billId).val())) {
			changeTextFieldColor('txnAmtInnerTbl_' + billId,'','','red');
			return false;
	}
}

function loadChequeBounceModal() {
	let chequeBounceModel		= new $.Deferred();	//
	
	if(chequeBounceRequired) {
		$("#chequeBounceDetailsPanel").load( "/ivcargo/jsp/createWayBill/includes/chequeBounceDetails.html", function() {
			chequeBounceModel.resolve();
		});
	} else {
		$( "#chequeBounceDetailsPanel").remove();
	}

	let loadelement 	= new Array();

	loadelement.push(chequeBounceModel);
}