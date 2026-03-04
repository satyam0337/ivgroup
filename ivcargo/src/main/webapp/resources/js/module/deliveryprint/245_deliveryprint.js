/**
 * 
 */
/**
 * @Author Manish Kumar Singh 26/05/2016
 */
function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load("/ivcargo/html/print/delivery/245.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();

	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {
	var delDate = null;
	var bookDate = null;

	delDate 		= getDateInDMYFromTimestamp(wayBillArray[0].creationDateTimeStamp);
	
	bookDate 		=  getDateInDMYFromTimestamp(wayBillArray[0].bookingDateTime);
	var date1  		=  bookDate.substring(0, 2);
	var month1  	=  bookDate.substring(3, 5);
	
	bookDate 		= date1+"/"+month1;
	var currentdate		= new Date();

	if(currentdate.getHours() < 12) {
		var currenttime1 	= currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() +"  AM";
	} else {
		var currenttime1 	= currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() +"  PM";
	}
		
	$('.datetime').append(getCurrentDate() + ' ' + currenttime1);
	
	var consignee = consigneeHM;
	var consignee_values = new Array();
	
	for (var key in consignee) {
		consignee_values.push(consignee[key]);
	}
	
	var consignmentSummary = consignmentSummaryHM;
	var consignmentSummary_values = new Array();
	
	for (var key in consignmentSummary) {
		consignmentSummary_values.push(consignmentSummary[key]);
	}
	
	var consignmentDetails = consignmentDetailsHM;
	var consignmentDetails_values = new Array();
	
	for (var key in consignmentDetails) {
		consignmentDetails_values.push(consignmentDetails[key]);
	}
	
	$('.sourceBranchAddress').append(reportViewModel.branchAddress);
	$('.sourceBranchMobile').append(LoggedInBranchDetails.mobileNumber);
	
	$('.CrNo').append(dcdArray[0].wayBillDeliveryNumber);
	$('.consigneeName').append(consignee_values[0].name+" &nbsp; "+"("+consignee_values[0].mobileNumber+")");
	
	if(dcdArray[0].paymentType == 1) {
		$('.paymentType').append('Cash');
	} else if (dcdArray[0].paymentType == 2) {
		$('.paymentType').append('Cheque');
	} else if (dcdArray[0].paymentType == 3) {
		$('.paymentType').append('Short - Credit');
	}
	
	$('.deliveredTo').append(dcdArray[0].deliveredToName);
	$('.delDate').append(delDate);
	
	var scrBranch1  = wayBillArray[0].sourceBranch;
	scrBranch1 		= scrBranch1.toUpperCase();
	$('.scrBranch').append(scrBranch1);
	
	var destBranch1  	= wayBillArray[0].destinationBranch;
	destBranch1 		= destBranch1.toUpperCase();
	
	$('.destBranch').append(destBranch1);
	$('.lrNo').append(wayBillArray[0].wayBillNumber);   
	$('.bookDate').append(bookDate);
	$('.ArtQnt').append(consignmentSummary_values[0].quantity);
	$('.type').append(wayBillArray[0].wayBillType);
	  
	if((wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) || (wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT)) {
		$('.bookTotal').append(0);
	} else {
		$('.bookTotal').append(totalBookingTotal);
	}
	   
	var wbIdWiseBookChgs   	= wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId + "_" + 1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);
			}
		}
	}
	
	$('.saidToCont').append(consignmentDetails_values[0].saidToContain);
	$('.remark').append(wayBillArray[0].remark);
	$('.User').append(executive.name);
	
	setLogo(wayBillArray[0].accountGroupId);	
	setCharges();
	
	$('.conscopy').append("consinee copy");
}

function setCharges() {
	var freight			= 0;
	var octroi 			= 0;
	var octroi_exp 		= 0;
	var hamali			= 0;
	var other			= 0;
	var demrage			= 0;
	var door_delivery 	= 0;
	var dly_comm 		= 0;
	var total			= 0;
	var service_chrg	= 0;
	var discount		= 0;
	var delivery_gic    = 0;
	var delivery_osc	= 0;
	var delivery_b_form	= 0;
	var totalGrandTotal1= 0;
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId + "_" + 1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);				
			}	
		}
	}

	for(var key in chargeIdWiseAmount) {

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OTHER_DELIVERY)) {
			other = chargeIdWiseAmount[ChargeTypeMaster.OTHER_DELIVERY];
		}

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DAMERAGE)) {
			demrage = chargeIdWiseAmount[ChargeTypeMaster.DAMERAGE];
		}

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OCTROI_EXPENSE)) {
			octroi_exp = chargeIdWiseAmount[ChargeTypeMaster.OCTROI_EXPENSE];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.SERVICE_CHARGE)) {
			service_chrg = chargeIdWiseAmount[ChargeTypeMaster.SERVICE_CHARGE];
		}

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_COMMISSION)) {
			dly_comm = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_COMMISSION];
		}

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OCTROI_DELIVERY)) {
			octroi = chargeIdWiseAmount[ChargeTypeMaster.OCTROI_DELIVERY];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.HAMALI_DELIVERY)) {
			hamali = chargeIdWiseAmount[ChargeTypeMaster.HAMALI_DELIVERY];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY)) {
			door_delivery = chargeIdWiseAmount[ChargeTypeMaster.DOOR_DELIVERY_DELIVERY];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_GIC)) {
			delivery_gic = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_GIC];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_OSC)) {
			delivery_osc = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_OSC];
		}
		
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_B_FORM)) {
			delivery_b_form = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_B_FORM];
		}

	}

	$('.HAMALI_DELIVERY').append(hamali);

	if(demrage > 0) {
		$('.DAMERAGE').append(demrage);
	} else {
		$( ".demurrageRow" ).hide();
	}

	if(other > 0) {
		$('.OTHER_DELIVERY').append(other);
	} else {
		$( ".otherRow" ).hide();
	}

	if(door_delivery > 0) {
		$('.DOOR_DELIVERY').append(door_delivery);
	} else {
		$( ".DOOR_DELIVERYRow" ).hide();
	}

	if(octroi > 0) {
		$('.OCTROI_DELIVERY').append(octroi);
	} else {
		$( ".OCTROI_DELIVERYRow" ).hide();
	}

	if(delivery_gic > 0) {
		$('.DELIVERY_GIC').append(delivery_gic);
	} else {
		$( ".DELIVERY_GICRow" ).hide();
	}

	if(delivery_osc > 0) {
		$('.DELIVERY_OSC').append(delivery_osc);
	} else {
		$( ".DELIVERY_OSCRow" ).hide();
	}

	if(delivery_b_form > 0) {
		$('.DELIVERY_B_FORM').append(delivery_b_form);
	} else {
		$( ".DELIVERY_B_FORMRow" ).hide();
	}


	if((wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) || (wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT)) {
		$('.totalBookingTotal').append(0);
	} else {
		$('.totalBookingTotal').append(totalBookingTotal);
	}

	if((wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) || (wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT)) {

		totalGrandTotal1 = totalGrandTotal- totalBookingTotal;
		$('.totalGrandTotal').append(totalGrandTotal1);
	} else {
		$('.totalGrandTotal').append(totalGrandTotal);
	}

	if(wayBillArray[0].wayBillType == WayBillType.WAYBILL_TYPE_NAME_TOPAY) {
		freight =  (wayBillArray[0].bookingTotal) - discount;

	} else {
		freight =  0;
	}

	discount		= dcdArray[0].deliveryDiscount;

	total   = Math.round(other + dly_comm + octroi_exp + demrage + freight+octroi);
	$('.TotalAmt').append(total);

	$('.discount').append(wayBillArray[0].deliveryDiscount);

	getTotalAmt();
}

function getTotalAmt() {
	var TotalAmt 		= 0;
	var freight			= 0;
	var octroi 			= 0;
	var octroi_exp 		= 0;
	var hamali			= 0;
	var other			= 0;
	var demrage			= 0;
	var door_delivery 	= 0;
	var dly_comm 		= 0;
	var discount		= 0;
	
	if(dcdArray[0].settledByBranchId == 17018 || dcdArray[0].settledByBranchId == 17032 || dcdArray[0].settledByBranchId == 17031){
		freight			= getValueFromHtmlTag("FREIGHT");
		hamali			= getValueFromHtmlTag("HAMALI_DELIVERY");
		dly_comm		= getValueFromHtmlTag("DELIVERY_COMMISSION");
		door_delivery	= getValueFromHtmlTag("DOOR_DELIVERY_DELIVERY");
		demrage			= getValueFromHtmlTag("DAMERAGE");

		if(WayBillType == "PAID") {
			freight = 0;
		}
		
		TotalAmt = (Number(freight) + Number(hamali) + Number(dly_comm) + Number(door_delivery) + Number(demrage));
	} else {
		freight			= getValueFromHtmlTag("FREIGHT");
		octroi 			= getValueFromHtmlTag(ChargeTypeMaster.OCTROI_DELIVERY);
		octroi_exp 		= getValueFromHtmlTag(ChargeTypeMaster.OCTROI_EXPENSE);
		other			= getValueFromHtmlTag(ChargeTypeMaster.OTHER_DELIVERY);
		demrage			= getValueFromHtmlTag(ChargeTypeMaster.DAMERAGE);
		dly_comm 		= getValueFromHtmlTag(ChargeTypeMaster.DELIVERY_COMMISSION);
		
		if(WayBillType == "PAID") {
			freight = 0;
		}

		TotalAmt = (Number(freight) + Number(octroi) + Number(dly_comm) + Number(octroi_exp) + Number(demrage) + Number(other));
	}
	
	return TotalAmt;
}
function setLogo(accountGroupId) {
	let imgPath	= $('#companyLogoSrcPath').val();
	
	if(imgPath != undefined && imageSrcExists(imgPath))
		$(".companyLogo").attr("src", imgPath);
	else {
		imgPath	= "/ivcargo/images/Logo/" + accountGroupId;
		setLogos(imgPath, 'companyLogo');
	}
}