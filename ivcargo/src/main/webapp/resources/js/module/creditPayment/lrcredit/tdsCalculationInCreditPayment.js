/**
 * 
 */
function tdsCalculation(obj) {
	
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var txnAmount		= 0;
	var typeOfSelection	= $('#typeOfSelection').val();
	var tdsCharge 		= 0;

	var receivedAmtObj	= document.getElementById("receiveAmt_" + splitVal[1]);
	var receivedAmtLimit= parseInt(document.getElementById("receivedAmtLimit_" + splitVal[1]).value,10);
	
	var totalAmt		= parseInt($("#grandTotal_" + splitVal[1]).val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	
	if($('#txnAmount_' + splitVal[1]).val() != '') {
		txnAmount		= parseInt($('#txnAmount_' + splitVal[1]).val());
	}
	
	if(allowToCalculateTDSOnManualPercentage && $('#applyTDSPercent').val() != undefined)
		tdsCharge = $('#applyTDSPercent').val();
	else
		tdsCharge = Number(tdsRate);
	
	if(tdsConfiguration.IsTdsAllow) {
		if(tdsConfiguration.IsTDSInPercentAllow || allowToCalculateTDSOnManualPercentage || (isApplyTDS && tdsConfiguration.IsAllowTDSOnlyMultipleClear && typeOfSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#moduleType').val()) == 2)) {
			if(splitVal[0] == 'txnAmount') {
				if($('#txnAmount_' + splitVal[1]).val() != '') {
					let tdsAmt = 0;
					
					if(tdsConfiguration.calculateTdsOnTotal) {
						if(!$("#tdsAmt_" + splitVal[1]).prop("readonly"))
							tdsAmt			= (totalAmt * tdsCharge ) / 100;
					} else
						tdsAmt			= (txnAmount * tdsCharge ) / 100;

					if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
						$("#tdsAmt_" + splitVal[1]).val(toFixedWhenDecimal(tdsAmt));
						$("#receiveAmt_" + splitVal[1]).val(toFixedWhenDecimal($('#txnAmount_' + splitVal[1]).val() - toFixedWhenDecimal(tdsAmt)));
					} else {
						$("#tdsAmt_" + splitVal[1]).val(Math.round(tdsAmt));
						$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - Math.round(tdsAmt)));
					}

					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			} else if(splitVal[0] == 'tdsAmt') {
				if($("#tdsAmt_" + splitVal[1]).val() != '') {
					let tdsAmt	= $("#tdsAmt_" + splitVal[1]).val();

					if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
						$("#receiveAmt_" + splitVal[1]).val(toFixedWhenDecimal($('#txnAmount_' + splitVal[1]).val() - toFixedWhenDecimal(tdsAmt)));
					else
						$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - Math.round(tdsAmt)));

					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			}
		} else { 
			if(splitVal[0] == 'txnAmount') {
				if($('#txnAmount_' + splitVal[1]).val() != '') {
					$("#tdsAmt_" + splitVal[1]).val(0);
					$("#receiveAmt_" + splitVal[1]).val(Math.round($('#txnAmount_' + splitVal[1]).val() - $("#tdsAmt_" + splitVal[1]).val()));
					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - $('#txnAmount_' + splitVal[1]).val());
				}
			} else if(splitVal[0] == 'tdsAmt') {
				if($('#tdsAmt_' + splitVal[1]).val() != '') {
					var txnAmt				= Math.round($("#txnAmount_" + splitVal[1]).val());
					let tdsAmt				= $("#tdsAmt_" + splitVal[1]).val();

					if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
						$("#receiveAmt_" + splitVal[1]).val(toFixedWhenDecimal(txnAmt - toFixedWhenDecimal(tdsAmt)));
					else
						$("#receiveAmt_" + splitVal[1]).val(txnAmt - Math.round(tdsAmt));

					$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - txnAmt);
				}
			}
		}
	} else {
		$('#balanceAmt_' + splitVal[1]).val(actTotalAmt - $("#receiveAmt_" + splitVal[1]).val());
	}
	
	calTotalAmounts();
	
	return receivedAmtObj.value;
}

function validateTxnAmount(obj) {
	
	var objName 			= obj.name;
	var objVal				= 0;
	var splitVal 			= objName.split("_");
	var totalAmt 			= parseInt($("#grandTotal_" + splitVal[1]).val());
	var receivedAmtLimit	= parseInt($("#receivedAmtLimit_" + splitVal[1]).val());
	var tdsAmtLimit			= parseInt($("#tdsAmtLimit_" + splitVal[1]).val());
	var tdsAmt				= parseInt($("#tdsAmt_" + splitVal[1]).val());
	var txnAMount			= parseInt($("#txnAmount_" + splitVal[1]).val());
	var balanceAmount		= parseInt($("#balanceAmt_" + splitVal[1]).val());
	
	if(receivedAmtLimit > 0) {
		totalAmt = totalAmt - receivedAmtLimit;
	}

	if(obj.value.length > 0) {
		objVal = parseInt(obj.value, 10);
	}
	
	if(objVal > totalAmt) {
		if(lrCreditConfig.isBalanceAmountValidation){
			showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + totalAmt);
			obj.value 	= 0;
			objVal 		= 0;
		}
	}
	
	var maxRecAmt = $('#receiveAmt_Party').val();
	
	if(objVal > totalAmt && maxRecAmt > 0) {
		showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + totalAmt);
		obj.value 	= 0;
		objVal 		= 0;
	}
	
	$("#balanceAmt_" + splitVal[1]).val(totalAmt - objVal);
	$("#receiveAmt_" + splitVal[1]).val(txnAMount - tdsAmt);
	
	if($("#balanceAmt_" + splitVal[1]).val() <= 0) {
		$("#paymentStatus_" + splitVal[1]).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
	}
	
	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) { // is for multiple clear case
		validateTxnAmountForMultipleClear();
		
		if(allowToCalculateTDSOnManualPercentage){
			var discountType = 	$('#discountTypes_CreditClearanceTable-1').val();
			if(discountType > 0 && $("#paymentStatus_" + splitVal[1]).val() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID)
				$('#discountTypes_' + splitVal[1]).val(discountType);
			else
				$('#discountTypes_' + splitVal[1]).val(0);
		}
	}
	
	if($("#paymentStatus_" + splitVal[1]).val() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
		if(!validateDiscountLimit(discountInPercent, totalAmt, balanceAmount, $("#txnAmount_" + splitVal[1]))) {
			return false;
		}
	}
}

function validateTxnAmountForMultipleClear() {
	
	var tableEl 		= document.getElementById("reportTable");
	var balanceAmount 	= 0;
	var receiveAmount 	= 0;
	var txnAmount 		= 0;
	var tdsAmount 		= 0;
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	for (var i = 1; i <= tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null){
			
			if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && lrCreditConfig.settleOnlySelectedLrs && !$("#check1_"+i).prop("checked"))
				continue;
						
			var wayBillId = tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;

			balanceAmount	+= Number($('#balanceAmt_' + wayBillId).val());
			receiveAmount 	+= Number($('#receiveAmt_' + wayBillId).val());
			txnAmount 	 	+= Number($('#txnAmount_' + wayBillId).val());
			tdsAmount 	 	+= Number($('#tdsAmt_' + wayBillId).val());

		};
	}
	
	if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
		document.getElementById('receiveAmt_CreditClearanceTable-1').value = toFixedWhenDecimal(receiveAmount);
		document.getElementById('tdsAmt_CreditClearanceTable-1').value = toFixedWhenDecimal(tdsAmount);
	} else {
		document.getElementById('receiveAmt_CreditClearanceTable-1').value = receiveAmount;
		document.getElementById('tdsAmt_CreditClearanceTable-1').value = tdsAmount;
	}

	document.getElementById('balanceAmt_CreditClearanceTable-1').value 	= balanceAmount;
	document.getElementById('txnAmount_CreditClearanceTable-1').value 	= txnAmount;
}
function setAllTxnAmount(obj, tableId) {
	
	var paymentStatus = $("#paymentStatus_CreditClearanceTable-1").val();
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	if(allowToCalculateTDSOnManualPercentage && paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
		&& creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
			
		var tableEl 		= document.getElementById("reportTable");
		var	negotiateAmt	= 0;
		var negotiateRemAmt	= 0;
		var totalTxnAmount = Number($('#txnAmount_CreditClearanceTable-1').val());
		var remTxnAmt = 0;
		var totalGrandTotal 			= Number($('#grandTotal_CreditClearanceTable-1').val());
		$('#applyTDSPercent').val(0);
		
		if(obj.value > totalGrandTotal){
			showMessage('info', '<i class="fa fa-info-circle"></i> You can not enter greater value than ' + totalGrandTotal);
			obj.value 	= 0;
			for (var i = 1; i <= tableEl.rows.length -1; i++){
				if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null){
					var wayBillId 			= tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
					$('#txnAmount_' + wayBillId).val(0);
					$('#receiveAmt_' + wayBillId).val(0);
					$('#balanceAmt_' + wayBillId).val(0);
				}
			}
			return false;
		}
		
		negotiateAmt = Math.round(totalTxnAmount / (tableEl.rows.length -1 ));
		negotiateRemAmt = Number(negotiateAmt * (tableEl.rows.length -1 )) - totalTxnAmount;
		
		if(totalTxnAmount > 0){
		
			for (var i = 1; i <= tableEl.rows.length -1; i++){
				if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null){
					var wayBillId 			= tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
					var receivedAmtLimit	= parseInt($("#receivedAmtLimit_" + wayBillId).val());
					var totalAmt			= parseInt($("#grandTotal_" + wayBillId).val());
					var actTotalAmt			= Math.round(totalAmt - receivedAmtLimit);
					
					if(actTotalAmt >= negotiateAmt){
						if(i == tableEl.rows.length -1){
							$('#txnAmount_' + wayBillId).val(negotiateAmt - (negotiateRemAmt));
							$('#receiveAmt_' + wayBillId).val(negotiateAmt - (negotiateRemAmt));
							$('#balanceAmt_' + wayBillId).val(actTotalAmt - negotiateAmt + (negotiateRemAmt));
						} else{
							$('#txnAmount_' + wayBillId).val(negotiateAmt);
							$('#receiveAmt_' + wayBillId).val(negotiateAmt);
							$('#balanceAmt_' + wayBillId).val(actTotalAmt - negotiateAmt);
						}
					} else {
						$('#txnAmount_' + wayBillId).val(actTotalAmt);
						$('#receiveAmt_' + wayBillId).val(actTotalAmt);
						$('#balanceAmt_' + wayBillId).val(0);
						if(i == tableEl.rows.length -1)
							remTxnAmt	=	remTxnAmt + negotiateAmt - (negotiateRemAmt) - actTotalAmt; 
						else
							remTxnAmt	=	remTxnAmt + negotiateAmt - actTotalAmt; 
					}
					
					$('#tdsAmt_' + wayBillId).val(0);
					$('#discountTypes_' + wayBillId).val(1);
				}
			}
			
			for (var i = 1; i <= tableEl.rows.length -1; i++){
				if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null){
					var wayBillId = tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
					if(remTxnAmt >0){
						var txnAmt2 = Number($('#txnAmount_'+ wayBillId).val());
						var receivedAmtLimit2	= parseInt($("#receivedAmtLimit_" + wayBillId).val());
						var totalAmt2			= parseInt($("#grandTotal_" + wayBillId).val());
						var actTotalAmt2		= Math.round(totalAmt2 - receivedAmtLimit2);
						var remWayBillAmt  		= actTotalAmt2 - txnAmt2;
						
						if(remTxnAmt>=remWayBillAmt){
							$('#txnAmount_'+ wayBillId).val(actTotalAmt2)
							$('#receiveAmt_'+ wayBillId).val(actTotalAmt2)
							$('#balanceAmt_' + wayBillId).val(0);
							remTxnAmt = remTxnAmt-remWayBillAmt;
						}else{
							$('#txnAmount_'+ wayBillId).val(txnAmt2+remTxnAmt);
							$('#receiveAmt_'+ wayBillId).val(txnAmt2+remTxnAmt);
							$('#balanceAmt_' + wayBillId).val(actTotalAmt2 - (txnAmt2+remTxnAmt));
							remTxnAmt = remTxnAmt-remWayBillAmt;
						}
					}else{
						break;
					}
					
					}
				}
			}
	}
}