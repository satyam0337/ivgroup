/**
 * 
 */

function tdsCalculation(obj) {
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	
	var receivedAmtLimit= parseInt($("#makePaymentJsPannel #receivedAmtLimitInnerTbl_" + splitVal[1]).val());
	var totalAmt		= parseInt($("#makePaymentJsPannel #totAmtInnerTbl_" + splitVal[1]).val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	var txnAmount		= parseInt($("#makePaymentJsPannel #txnAmtInnerTbl_" + splitVal[1]).val());
	
	if(isTDSChargeInPercentAllow) {
		var tdsCharge 		= Number(BillClearanceTDSChargeInPercent);

		if($("#makePaymentJsPannel #txnAmtInnerTbl_" + splitVal[1]).val() != '') {
			if(splitVal[0] == 'txnAmtInnerTbl') {
				var tdsAmt		= Math.round((txnAmount * tdsCharge ) / 100);
				
				$("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val(tdsAmt);
				$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt));
				$("#makePaymentJsPannel #balanceInnerTbl_" + splitVal[1]).val(actTotalAmt - txnAmount);
				
				if ($('#checkBoxTDSInnerTbl_'+splitVal[1]).prop('checked') && isCheckboxOptionToAllowTDS) {
					$("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val(tdsAmt);
					$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt));
				} else if(isCheckboxOptionToAllowTDS) {
					$("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val(0);
					$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount));
				}
			} else if(splitVal[0] == 'tdsAmtInnerTbl') {
				var tdsAmt		= $("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val();

				$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt));
				$("#makePaymentJsPannel #balanceInnerTbl_" + splitVal[1]).val(actTotalAmt - txnAmount);
			}
		}
		
		if(isCheckboxOptionToAllowTDS) {
			$("#checkBoxTDSInnerTbl_" + splitVal[1]).on('click',function() {
				if ($('#checkBoxTDSInnerTbl_' + splitVal[1]).prop('checked')) {
					$("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val(tdsAmt);
					$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt));
				} else {
					$("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val(0);
					$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount));
				}
			});
		}
	} else {
		var tdsAmt		= Math.round($("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val());

		if($("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val() != '') {

			var tdsAmt		= Math.round($("#makePaymentJsPannel #tdsAmtInnerTbl_" + splitVal[1]).val());

			$("#makePaymentJsPannel #recAmtInnerTbl_" + splitVal[1]).val(Math.round(txnAmount - tdsAmt));
			$("#makePaymentJsPannel #balanceInnerTbl_" + splitVal[1]).val(actTotalAmt - txnAmount);
		}
	}
}

function tdsCalculation1() {
	var receivedAmtLimit= parseInt($("#makePaymentJsPannel #receivedAmtLimit").val());
	var totalAmt		= parseInt($("#makePaymentJsPannel #totalAmount").val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	var txnAmount		= parseInt($("#makePaymentJsPannel #txnAmount").val());
	var tdsCharge 		= Number(BillClearanceTDSChargeInPercent);
	
	if(isTDSChargeInPercentAllow) {
		if($("#makePaymentJsPannel #txnAmount").val() != '') {

			var tdsAmt		= Math.round((txnAmount * tdsCharge ) / 100);

			$("#makePaymentJsPannel #receivedAmount").val(txnAmount - tdsAmt);
			$("#makePaymentJsPannel #tdsAmount").val(tdsAmt);
			$("#makePaymentJsPannel #balanceAmount").val(actTotalAmt - txnAmount);
		}
	} else {
		if($("#makePaymentJsPannel #tdsAmount").val() != '') {

			var tdsAmt		= Math.round($("#makePaymentJsPannel #tdsAmount").val());

			$("#makePaymentJsPannel #receivedAmount").val(Math.round(txnAmount - tdsAmt));
			$("#makePaymentJsPannel #balanceAmount").val(actTotalAmt - txnAmount);
		}
	}
}