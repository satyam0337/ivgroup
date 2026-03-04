/**
 * @Author Ashish Tiwari 04/05/2016
 */
function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/aakash/aakashDeliveryPrint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();

	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {
	
	var freight = 0;
	var delDate = null;
	var bookDate = null;
	var Date 	= (wayBillArray[0].creationDateTimeStamp).substring(0, 16) ;
	var year  = Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	delDate = day+"-"+month+"-"+year;
	
	var Date1 					= (wayBillArray[0].bookingDateTime).substring(0, 16) ;
	var year1  =Date1.substring(0,4);
	var month1 = Date1.substring(5,7);
	var day1	  = Date1.substring(8,10);
	bookDate = day1+"-"+month1+"-"+year1;
	
	var consignee = consigneeHM;
	var consignee_values = new Array();
	var a = new Array();
	for (var key in consignee) {
		consignee_values.push(consignee[key]);
	}
	
	var consignmentSummary = consignmentSummaryHM;
	var consignmentSummary_values = new Array();
	var a = new Array();
	for (var key in consignmentSummary) {
		consignmentSummary_values.push(consignmentSummary[key]);
	}
	var consignmentDetails = consignmentDetailsHM;
	var consignmentDetails_values = new Array();
	var a = new Array();
	for (var key in consignmentDetails) {
		consignmentDetails_values.push(consignmentDetails[key]);
	}

	
	if(isRePrint){
		setValueToHtmlTag('CrNo', dcdArray[0].wayBillDeliveryNumber +" ( R )" );
	}else{
		setValueToHtmlTag('CrNo', dcdArray[0].wayBillDeliveryNumber);
	}
	setValueToHtmlTag('consigneeName', consignee_values[0].name);
	if(dcdArray[0].paymentType == 1){
		setValueToHtmlTag('paymentType', 'Cash');
	}else if (dcdArray[0].paymentType == 2) {
		setValueToHtmlTag('paymentType', 'Cheque');
	}else if (dcdArray[0].paymentType == 3) {
		setValueToHtmlTag('paymentType', 'Short - Credit');
	}
	setValueToHtmlTag('deliveredTo', consignee_values[0].name+ " ( "+consignee_values[0].mobileNumber+" )");
	setValueToHtmlTag('delDate', delDate);
	setValueToHtmlTag('scrBranch', wayBillArray[0].sourceBranch);
	setValueToHtmlTag('destBranch', wayBillArray[0].destinationBranch);
	setValueToHtmlTag('lrNo', wayBillArray[0].wayBillNumber);remark
	setValueToHtmlTag('bookDate', bookDate);
	setValueToHtmlTag('ArtQnt', consignmentSummary_values[0].quantity);
	
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId+"_"+1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);
			}
		}
	}
	if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID){
		freight = 0;
	} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		freight = 0;
	} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC){
		freight = 0;
	}else {
		freight =  (wayBillArray[0].bookingTotal);
	}
	
	setValueToHtmlTag('FrtAmt', freight);
	setValueToHtmlTag('saidToCont', consignmentDetails_values[0].saidToContain);
	setValueToHtmlTag('remark', wayBillArray[0].remark);
	setValueToHtmlTag('User', executive.name);
	setCharges();
}

function setCharges() {
	var hamali	= 0;
	var Total	= 0;
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId+"_"+1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);
				Total = Total + wbIdWiseBookChgs_values[i].chargeAmount;
			}	
		}
	}
	if(chargeIdWiseAmount != null){
		for(var key in chargeIdWiseAmount){
			if(key == ChargeTypeMaster.HAMALI_DELIVERY){
				setValueToHtmlTag('HAMALI_DELIVERY', chargeIdWiseAmount[key]);
			}else if (key == ChargeTypeMaster.DOOR_DELIVERY_DELIVERY) {
				setValueToHtmlTag('DOOR_DELIVERY_DELIVERY', chargeIdWiseAmount[key]);
			}else if (key == ChargeTypeMaster.DAMERAGE) {
				setValueToHtmlTag('DAMERAGE', chargeIdWiseAmount[key]);
			}else if (key == ChargeTypeMaster.OTHER_DELIVERY) {
				setValueToHtmlTag('OTHER_DELIVERY', chargeIdWiseAmount[key]);
			}
		}
	}
	setValueToHtmlTag('discount', wayBillArray[0].deliveryDiscount);
		
	getTotalAmt();
}
function getTotalAmt() {
	var TotalAmt = 0;
	var FrtAmt = 0;
	var hamali	= 0;
	var dd_Chrg = 0;
	var dem	= 0;
	var other = 0;
	var discount = 0;
	
	
	FrtAmt = getValueFromHtmlTag("FrtAmt");
	hamali	= getValueFromHtmlTag("HAMALI_DELIVERY");
	dd_Chrg= getValueFromHtmlTag("DOOR_DELIVERY_DELIVERY");
	dem	= getValueFromHtmlTag("DAMERAGE");
	other = getValueFromHtmlTag("OTHER_DELIVERY"); 
	discount = getValueFromHtmlTag("discount"); 
	 TotalAmt = (Number(FrtAmt)+Number(hamali)+Number(dd_Chrg)+Number(dem)+Number(other))-Number(discount);
	 setValueToHtmlTag('Total', TotalAmt);
}

