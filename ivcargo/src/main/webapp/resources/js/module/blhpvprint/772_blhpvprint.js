/**
 *   Modified	: Anant Chaudhary	06-06-2016
 */

/*
 * Please call this function in blhpvprint.js;
 */

function printBlhpvWindow() {

	//window.resizeTo(0,0);
	//window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/jsp/print/blhpv/772/batpsBLHPVPrint.html", function() {
		//window.setTimeout(printAfterDelay, 500);	
		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {
	var blhpvDate = null;
	var lhpvDate  = null;
	var blhpvDateWithTime	= null;
	
	blhpvDate 	= getDateInDMYFromTimestamp(blhpv.creationDateTimeStamp);
	blhpvDateWithTime	= blhpv.creationDateTimeString
	
	lhpvDate	= getDateInDMYFromTimestamp(blhpv.lHPVDate);
	
	setValueToHtmlTag('bLHPVNumber', blhpv.bLHPVNumber);
	setValueToHtmlTag('balanceAmount', blhpv.balanceAmount);
	setValueToHtmlTag('blhpvPreparedBy', blhpv.blhpvPreparedBy);
	setValueToHtmlTag('driverName', blhpv.driverName);
	setValueToHtmlTag('lHPVNumber', blhpv.lHPVNumber);
	setValueToHtmlTag('ownerName', blhpv.ownerName);
	setValueToHtmlTag('paymentMadeTo', blhpv.paymentMadeTo);
	setValueToHtmlTag('paymentMode', blhpv.paymentMode);
	setValueToHtmlTag('refund', 0);
	setValueToHtmlTag('remark', blhpv.remark);
	setValueToHtmlTag('totalAmount', blhpv.totalAmount);
	setValueToHtmlTag('totalPkgsInLhpv', blhpv.totalPkgsInLhpv);
	setValueToHtmlTag('vehicleNumber', blhpv.vehicleNumber);
	setValueToHtmlTag('blhpvDate', blhpvDateWithTime);
	setValueToHtmlTag('lhpvDate', lhpvDate);
	setValueToHtmlTag('driverName', blhpv.driverName);
	setValueToHtmlTag('turNumberString', blhpv.turNumberString);
	
	setValueToHtmlTag('totalwithoutBillQuantity', totalWithoutBillQty);
	setValueToHtmlTag('totalwithBillQuantity', totalWithBillQty);
	setValueToHtmlTag('Excess', 0);
	setValueToHtmlTag('part', 0);
	setValueToHtmlTag('nr', 0);
	setValueToHtmlTag('companyName', reportViewModel.accountGroupName);
	setValueToHtmlTag('companyAddress', reportViewModel.branchAddress);
	
	setBlhpvCharges();
	setLhpvCharges();
	setSourceDestBranch();
	getTotalAmt();
	setTotal();
	setRemark();
	ShowDialogForPrint();
}

function setBlhpvCharges() {
	
	var blhpvSettlementCharges	= null;
	var claimAmount	= 0; // clamamount = claimamount + local + other(BLHPV Charges) REFER OP TICKET #4583
	if(blhpvChargesHashMap != null) {
		/*for(var key in blhpvChargesHashMap) {*/
			/*if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.CLAIM)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.CLAIM];
				setValueToHtmlTag('CLAIM', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('CLAIM', 0);
			}
		
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.LOCAL_CHARGE)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.LOCAL_CHARGE];
				setValueToHtmlTag('LOCAL_CHARGE', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('LOCAL_CHARGE', 0);
			}
		
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.OTHER_ADDITIONAL)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.OTHER_ADDITIONAL];
				setValueToHtmlTag('OTHER_ADDITIONAL', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('OTHER_ADDITIONAL', 0);
			}*/
		
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.CLAIM)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.CLAIM];
				claimAmount	+= blhpvSettlementCharges.chargeAmount;
			}
			
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.LOCAL_CHARGE)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.LOCAL_CHARGE];
				claimAmount	+= blhpvSettlementCharges.chargeAmount;
			}
			
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.OTHER_ADDITIONAL)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.OTHER_ADDITIONAL];
				claimAmount	+= blhpvSettlementCharges.chargeAmount;
			}
			
			setValueToHtmlTag('CLAIM', claimAmount);
			
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.ACTUAL_BALANCE)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.ACTUAL_BALANCE];
				setValueToHtmlTag('ACTUAL_BALANCE', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('ACTUAL_BALANCE', 0);
			}

			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.HAMALI_DEDUCT)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.HAMALI_DEDUCT];
				setValueToHtmlTag('HAMALI_DEDUCT', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('HAMALI_DEDUCT', 0);
			}
			
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.LATE_DATE)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.LATE_DATE];
				setValueToHtmlTag('LATE_DATE', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('LATE_DATE', 0);
			}
			
			if(blhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.DELIVERY_COMMISSION)) {
				blhpvSettlementCharges		= blhpvChargesHashMap[LhpvChargeTypeMaster.DELIVERY_COMMISSION];
				setValueToHtmlTag('DELIVERY_COMMISSION', blhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('DELIVERY_COMMISSION', 0);
			}
			
		/*}*/
	}
	
}  //end of setCharges()

function setLhpvCharges() {
	var lhpvSettlementCharges	= null;
	if(lhpvChargesHashMap != null) {
		/*for(var key in lhpvChargesHashMap) {*/
			if(lhpvChargesHashMap.hasOwnProperty(-1)) {
				lhpvSettlementCharges		= lhpvChargesHashMap[-1];
				setValueToHtmlTag('LORRY_HIRE', lhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('LORRY_HIRE', 0);
			}
			
			if(lhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.ADVANCE_AMOUNT)) {
				lhpvSettlementCharges		= lhpvChargesHashMap[LhpvChargeTypeMaster.ADVANCE_AMOUNT];
				setValueToHtmlTag('ADVANCE_AMOUNT', lhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('ADVANCE_AMOUNT', 0);
			}
			if(lhpvChargesHashMap.hasOwnProperty(LhpvChargeTypeMaster.CO_LH)) {
				lhpvSettlementCharges		= lhpvChargesHashMap[LhpvChargeTypeMaster.CO_LH];
				setValueToHtmlTag('CO_LH', lhpvSettlementCharges.chargeAmount);
			} else {
				setValueToHtmlTag('CO_LH', 0);
			}
		/*}*/
	 } 
}
	
function getTotalAmt() {

	var totalAmount = 0;
	var looryHire   = 0;
	var advance   	= 0;
	var delComm		= 0;
	var hamali		= 0;
	var claim		= 0;
	var lateDate	= 0;

	looryHire   = getValueFromHtmlTag('LORRY_HIRE');
	advance		= getValueFromHtmlTag('ADVANCE_AMOUNT');
	delComm		= getValueFromHtmlTag('DELIVERY_COMMISSION');
	hamali		= getValueFromHtmlTag('HAMALI_DEDUCT');
	claim		= getValueFromHtmlTag('CLAIM');
	lateDate	= getValueFromHtmlTag('LATE_DATE');

	totalAmount = Number(looryHire) - Number(advance) - Number(delComm) - Number(hamali) - Number(claim) - Number(lateDate);

	setValueToHtmlTag('total', totalAmount);
}

function setSourceDestBranch() {
	var sourceBranch   	= null;
	var destBranch	 	= null;
	var lsNumber		= null;
	if(lsDetails != null) {
		var i = 0;
		for(var key in lsDetails) {
			var dispatchDetails	= lsDetails[key];

			sourceBranch    = dispatchDetails.sourceBranch;
			destBranch		= dispatchDetails.destinationBranch;
			driverMobNum	= dispatchDetails.driver1MobileNumber1;
			if (i == 0) {
				lsNumber	= dispatchDetails.lsNumber;
			} else {
				lsNumber	= lsNumber + "," + dispatchDetails.lsNumber;
			}
			i++;
		}

		setValueToHtmlTag('destBranch', destBranch);
		setValueToHtmlTag('sourceBranch', sourceBranch);
		setValueToHtmlTag('driverMobNum', driverMobNum);
		setValueToHtmlTag('lsNumber', lsNumber);
	}

}//end of setSourceDestBranch()

function setTotal() {
	var withLr 		= 0;
	var excess 		= 0;
	var total1  	= 0;
	var nr	   		= 0;
	var total2  	= 0;
	
	withLr 		= getValueFromHtmlTag('totalwithBillQuantity');
	excess 		= getValueFromHtmlTag('Excess');
	nr	  		= getValueFromHtmlTag('nr');

	total1		= Number(withLr) + Number(excess);
	
	setValueToHtmlTag('total1', total1);
	//setValueToHtmlTag('total1', blhpv.totalPkgsInLhpv);

	//total2 		= Number(blhpv.totalPkgsInLhpv) - Number(nr);
	total2		= Number(total1) - Number(nr);
	setValueToHtmlTag('total2', total2);
}

function setRemark() {
	
	var remark = blhpv.remark;
	
	if(remark.length > 250) {
		remark =  remark.substring(0, 249);
	}
	
	setValueToHtmlTag('remark', remark);
}