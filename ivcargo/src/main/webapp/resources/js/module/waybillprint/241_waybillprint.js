/**
 * @Author Kuldip Phadatare	26-02-2016
 */

var wayBillChrg			= null;

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load("/ivcargo/html/print/waybill/241_waybillprint.html", function() {
		window.setTimeout(printAfterDelay, 500);	

		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

//Method Calling form CommonFunction.js file
var currentdate1	= getCurrentDate();
var currentdate		= new Date();
var currenttime1 	= currentdate.getHours() + ":" + currentdate.getMinutes();

function setPrintData() {
	
	setCharges();
	var accoungrpName			= sourceBranch
	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	var destinationBranchname	= (destinationBranch.name).length > 15 ? (destinationBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : (destinationBranch.name).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";
	var deliveryTo              = (consignmentSummary.consignmentSummaryDeliveryToString) != null ? consignmentSummary.consignmentSummaryDeliveryToString : "--" ;
	
	
	//var Booking_Date			= BookingDate;

	var now					= wayBill.bookingDateTime;
	var jsDate 				= toJSDate(now);
	var BookingDate 		= jsDate.toLocaleDateString();

	consignorDetailsname		=	consignorDetailsname.toLowerCase(); 
	consigneeDetailsname		=	consigneeDetailsname.toLowerCase(); 
	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");

	$('.wayBillNumber').append("MMT-" + wayBill.wayBillNumber);
	$('.crtdate').append(currentdate1);
	$('.frombranch').append(sourceBranchName);
	$('.tobranch').append(destinationBranchname);
	$('.wayBillType').append(wayBillType);
	$('.consignorName').append(consignorDetailsname);
	$('.consignorPhoneNo').append(consignorDetailsphone);
	$('.consigneeName').append(consigneeDetailsname);
	$('.consigneePhoneNo').append(consigneeDetailsphone);
	$('.name').append((executive.name)!= null ? (executive.name ): " ");
	$('.invoiceNo').append((consignmentSummary.invoiceNo) != null ? consignmentSummary.invoiceNo : " ");
	$('.grandTotal').append((wayBill.grandTotal != null) ? (wayBill.grandTotal).toFixed(): " ");
	$('.quantity').append((consignmentSummary.quantity != null) ? (consignmentSummary.quantity).toFixed(): " ");
	$('.declaredValue').append((consignmentSummary.declaredValue != null) ? (consignmentSummary.declaredValue).toFixed(): " ");
	$('.bookingDate').append(BookingDate);
	$('.deliveryTo').append(deliveryTo);
	if(destinationBranch.accountGroupId == mmtAccntgrpId){
		$('.delivery').append(destinationBranchname+" Phone: "+destinationBranch.phoneNumber);
	}else{
		$('.delivery').append(destinationBranch.destAccountGroupName +" At "+destinationBranch.subRegionName+" Phone: "+destinationBranch.phoneNumber);
	}
	
	

	if(wayBillTaxTxn.length > 0){
		for(var i = 0; i < wayBillTaxTxn.length; i++) {
			$(".sTax").append((wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
		}
	} else {
		$(".sTax").append((wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
	}
}

function setCharges() {

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

	if (wayBillChrg != null) {
		$('.FREIGHT').append((wayBillChrg.chargeAmount).toFixed());
	} else	{
		$('.FREIGHT').append(0);

	}

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FOV];

	if (wayBillChrg != null) {
		$('.FOV').append((wayBillChrg.chargeAmount).toFixed());
	} else	{
		$('.FOV').append(0);
	}

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.MISC_BOOKING];

	if (wayBillChrg != null) {
		$('.MISC_BOOKING').append((wayBillChrg.chargeAmount).toFixed());
	} else  {
		$('.MISC_BOOKING').append(0);
	}
}