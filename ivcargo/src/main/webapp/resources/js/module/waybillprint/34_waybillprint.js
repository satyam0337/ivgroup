/**
 * @Author Kuldip Phadatare	26-02-2016
 */

var wayBillChrg			= null;

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load("/ivcargo/html/print/waybill/34_waybillprint.html", function() {

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

	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	var destinationBranchname	= (destinationBranch.name).length > 15 ? (destinationBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : (destinationBranch.name).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";
	var wayBillNumber	        = consignmentSummary != null ? consignmentSummary.wayBillNumber+" " :" ";
	var remark	        		= wayBill != null ? wayBill.remark+" " :" ";

	consignorDetailsname		=	consignorDetailsname.toUpperCase(); 
	consigneeDetailsname		=	consigneeDetailsname.toUpperCase(); 

	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");

	var name	             = executive != null ? (executive.name) == ("0000000000") ? " " : " "+executive.name+" " :" ";

	var now					= wayBill.bookingDateTime;
	var jsDate = toJSDate(now);

	var BookingDate = jsDate.toLocaleDateString();

	date =wayBill.creationDateTimeStamp;
	//alert('date with timestamp : ' + date);
	date = date.substring(0, date.length-5);
	//alert('date with  : ' + date);
	date1 = date.substring(0,10);

	time = date.substring(14,16);

	var hour = date.substring(11,13);
	if(hour > 12){
		date = date1 +" "+  (hour-12)+":"+ time + " PM";
	}else{
		date = date + " AM";
	}
	//alert(date)
	$('.srcCityName').append(srcCity.name);
	$('.destCityName').append(destCity.name);
	$('.wayBillNumber').append(wayBillNumber);
	$('.crtdate').append(currentdate1);
	$('.crttime').append(currenttime1);
	$('.frombranch').append(" (" + sourceBranchName + ") ");
	$('.tobranch').append(" (" + destinationBranchname + ") ");
	$('.consignorName').append(consignorDetailsname);
	$('.consignorPhoneNo').append(consignorDetailsphone);
	$('.consigneeName').append(consigneeDetailsname);
	$('.consigneePhoneNo').append(consigneeDetailsphone);
	$('.name').append((executive.name)!= null ? (executive.name ): " ");
	$('.invoiceNo').append((consignmentSummary.invoiceNo) != null ? consignmentSummary.invoiceNo : " ");
	$('.grandTotal').append((wayBill.grandTotal != null) ? (wayBill.grandTotal).toFixed(): " " );
	$('.wayBillType').append( " - " +  wayBillType);
	$('.remark').append(remark);

	$('.quantity').append((consignmentSummary.quantity != null)  ? (consignmentSummary.quantity).toFixed ()  + ' ( '+  extractPkgDetails(consignmentDetails)+ ' )' : " ");

	$('.declaredValue').append((consignmentSummary.declaredValue != null) ? (consignmentSummary.declaredValue).toFixed(): " ");
	$('.bookingDate').append(wayBill.bookingDateTimeStr);

	if(consignmentDetails.length > 0){
		for(var i = 0; i < consignmentDetails.length; i++) {
			$(".saidToContain").append((consignmentDetails[i].packingTypeName != null) ? "  " +  "  "  + "" + " " + " ) " + consignmentDetails[i].packingTypeName : 0 );
		}
	} else {
		$(".saidToContain").append((consignmentDetails[i].packingTypeName != null) ? consignmentDetails[i].packingTypeName : 0);
	}
	
	if(formTypes.length > 0){
		for(var i = 0; i < formTypes.length; i++) {
			$(".formTypeNumber").append((formTypes[i].formNumber != null) ? "  " +  "  "  + "" + " "  + formTypes[i].formNumber : 0 );
		}
	} else {
		$(".formTypeNumber").append((formTypes[i].formNumber != null) ? formTypes[i].formNumber : 0);
	}
}

function extractPkgDetails(consignmentDetails)
{
	var pkgDetails = "";

	if(consignmentDetails.length > 0){
		for(var i = 0; i < consignmentDetails.length; i++) {
			pkgDetails = (consignmentDetails[i].packingTypeName != null) ? "  " +  "  "  + "" + " " +  consignmentDetails[i].quantity + " " +  consignmentDetails[i].packingTypeName : 0 ;
		}
	}

	return 	pkgDetails;

}

function setCharges() {
	if(wayBillCharges != null){
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

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.LOADING];

		if (wayBillChrg != null) {
			$('.LOADING').append((wayBillChrg.chargeAmount).toFixed());
		} else	{
			$('.LOADING').append(0);
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DELIVERY_BOOKING];

		if (wayBillChrg != null) {
			$('.DOOR_DELIVERY_BOOKING').append((wayBillChrg.chargeAmount).toFixed());
		} else	{
			$('.DOOR_DELIVERY_BOOKING').append(0);
		}
		
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.BUILTY_CHARGE];

		if (wayBillChrg != null) {
			$('.BILTY_CHARGE').append((wayBillChrg.chargeAmount).toFixed());
		} else	{
			$('.BILTY_CHARGE').append(0);
		}
		
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];

		if (wayBillChrg != null) {
			$('.OTHER').append((wayBillChrg.chargeAmount).toFixed());
		} else	{
			$('.OTHER').append(0);
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.MISC_BOOKING];

		if (wayBillChrg != null) {
			$('.MISC_BOOKING').append((wayBillChrg.chargeAmount).toFixed());
		} else  {
			$('.MISC_BOOKING').append(0);
		}
	}else{
		$('.FREIGHT').append(0);
		$('.FOV').append(0);
		$('.LOADING').append(0);
	}
}
