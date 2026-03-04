/**
 * @Author Ashish Tiwari	23-03-2016
 */

var wayBillChrg			= null;

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	
	$("#tableContain").load("/ivcargo/html/print/waybill/242_waybillprint.html", function() {
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
var hours = currentdate.getHours();

if(hours > 12){
	hours = (hours - 12) + ":" +currentdate.getMinutes() + " PM" ;
	
}else{
	hours = hours + ":" +currentdate.getMinutes() + " AM";
}
var currenttime1 	= currentdate1 + " "+hours;
var material = '';
var date = '';

function setPrintData() {
	setCharges();
	/*$.each(consignmentDetails, function(index, value){
		// material = material + value + ",";
		 alert( index + ": " + value );
	});*/
	var consignmentDetailArr=consignmentDetails;
	$.each(consignmentDetailArr, function(index, value){
		// material = material + value + ",";
		material=material + value.packingTypeName+",";
	});
	material = material.substring(0, material.length-1);
	
	date =wayBill.creationDateTimeStamp;
	date = date.substring(0, date.length-5);
	date1 = date.substring(0,10);
	var year = date1.substring(0,4);
	var month = date1.substring(5,7);
	var day = date1.substring(8,10);
	time = date.substring(14,16);
	var hour = date.substring(11,13);
	if(hour > 12){
		date = day+"-"+month+"-"+year +" "+  (hour-12)+":"+ time + " PM";
	}else{
		date = day+"-"+month+"-"+year +" "+  hour+":"+ time + " AM";
	}
	$(".wayBillNumber").append(wayBill.wayBillNumber);
	$(".bookingDate").append(date);
	$(".srcBranch").append(sourceBranch.name);
	$(".destBranch").append(destinationBranch.name);
	$('.subRegionName1').append((destinationBranch.subRegionName != null) ? (destinationBranch.subRegionName): " ");
	$(".consignorName").append(consignorDetails.name);
	$(".consigneeName").append(consigneeDetails.name);
	$(".consignorPhone").append(consignorDetails.phoneNumber);
	$(".consigneePhone").append(consigneeDetails.phoneNumber);
	$(".wayBillType").append(wayBill.wayBillType);
	$(".material").append(material);
	$(".quantity").append((consignmentSummary.quantity != null) ? (consignmentSummary.quantity).toFixed(): " ");
	$(".grandTotal").append(wayBill.bookingTotal);
	$(".bookedBy").append(executive.name);
	$(".printedBy").append(executive.name);
	$(".printDate").append(currenttime1);
	$(".deliveryAt").append(destinationBranch.name);

}

function setCharges() {
	
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];
		
		

		if (wayBillChrg != null) {
			$('.freight').append((wayBillChrg.chargeAmount).toFixed());
		} else	{
			$('.freight').append(0);

		}
		
		loading		= wayBillCharges[ChargeTypeMaster.LOADING];
		
		if (loading != null) {
			$('.loading').append((loading.chargeAmount).toFixed());
		} else	{
			$('.loading').append(0);

		}

		other		= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];
		
		if (other != null) {
			$('.others').append((other.chargeAmount).toFixed());
		} else	{
			$('.others').append(0);

		}

}
