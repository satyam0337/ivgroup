/**
 * @Author Ashish Tiwari 04/05/2016
 */

function printBillWindow(company) {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/net/netPrintWayBill.html", function() {
		
		window.setTimeout(printAfterDelay, 500);
		console.log(company);
		if(company != ''){
			document.getElementById('CompanyLabel').innerHTML=company;
		}
		
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
var currenttime1 	= currentdate.getHours() + ":" + currentdate.getMinutes()+ ":" +currentdate.getSeconds();


var totalQtty		= 0;

function setPrintData() {
	setCharges();
	var containDetails = null;
	var AmtInWords = '';
	var totalQtty	   = 0;
	var saidToContain	= '';
	var bookTime		= '';
	var bookDate		= '';
	var barnchoffice			= (executive.address != null ) ? executive.address : "A " ;
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var privateMarka			= consignmentSummary.privateMarka;
	var srcBranchAdd			= (sourceBranch.address).length > 60 ? (sourceBranch.address).substring(0, 60): sourceBranch.address;
	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var LRType					= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_PAID
	var Date 					= (wayBill.actualBookingDateTime).substring(0, 16) ;
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	bookDate = day+"/"+month+"/"+year;
	
	var Time = (wayBill.actualBookingDateTime).substring(11, 16) ;
	var hour = Time.substring(0,2);
	var min  = Time.substring(3,5);
	if(hour > 12){
		bookTime = (hour - 12) +":"+min+" PM";
	}else {
		bookTime = hour +":"+min+" AM";
	}
	AmtInWords = convertNumberToWord(wayBill.bookingTotal);
	for( var i = 0 ; i < consignmentDetails.length;i++){
		totalQtty			+= consignmentDetails[i].quantity;
		containDetails += consignmentDetails[i].quantity + " " + consignmentDetails[i].packingTypeName + ", ";
		var first = containDetails.substring(4,containDetails.length)
		var goods	= first.substring(0,first.length-2) ;
		saidToContain += consignmentDetails[i].saidToContain+ ", ";
	}
	setValueToHtmlTag('consignorDetails', consignorDetailsname);
	setValueToHtmlTag('consignorPhone', consignorDetailsphone);
	setValueToHtmlTag('consigneeDetails', consigneeDetailsname);
	setValueToHtmlTag('consigneePhone', consigneeDetails.phoneNumber);
	setValueToHtmlTag('goods', goods);
	setValueToHtmlTag('saidToContain', saidToContain.substring(0,saidToContain.length-2));
	setValueToHtmlTag('srcBranchName', sourceBranch.name);
	setValueToHtmlTag('tobranch1', destinationBranch.name);
	setValueToHtmlTag('actualWeight',  (consignmentSummary.actualWeight != null) ? consignmentSummary.actualWeight : 0 ); 
	setValueToHtmlTag('totalQtty', totalQtty);
	setValueToHtmlTag('pvtMarka', consignmentSummary.privateMarka);
	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('bookDate', bookDate);
	if(consignmentSummary.paymentType == 1){
		setValueToHtmlTag('PayType', 'Cash');
	}else if (consignmentSummary.paymentType == 2) {
		setValueToHtmlTag('PayType', 'Cheque');
	}else if (consignmentSummary.paymentType == 3) {
		setValueToHtmlTag('PayType', 'Short - Credit');
	}
	
	clear();
}

function setCharges() {

	var freight				= 0;
	var hamali				= 0;
	var cc_gcn				= 0; 
	var d_d_booking			= 0;
	var other_booking		= 0;
	var Total			= 0;
	

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

	if (wayBillChrg != null) {
		freight			= (wayBillChrg.chargeAmount).toFixed();
	}

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.HAMALI];

	if (wayBillChrg != null) {
		hamali				= (wayBillChrg.chargeAmount).toFixed();
	}
	
	wayBillChrg	= wayBillCharges[ChargeTypeMaster.STATISTICAL];

	if (wayBillChrg != null) {
		cc_gcn			= (wayBillChrg.chargeAmount).toFixed();
	}
	
	wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DLY_BOOKING];

	if (wayBillChrg != null) {
		d_d_booking 	= (wayBillChrg.chargeAmount).toFixed();
	}
	
	wayBillChrg	= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];

	if (wayBillChrg != null) {
		other_booking		= (wayBillChrg.chargeAmount).toFixed();
	}
	
	Total = Number(freight)+Number(hamali)+Number(cc_gcn)+Number(d_d_booking)+Number(other_booking);
	
	setValueToHtmlTag('FREIGHT', freight);
	setValueToHtmlTag('HAMALI', hamali );
	setValueToHtmlTag('CC_GCN', cc_gcn);
	setValueToHtmlTag('DOOR_DLY_BOOKING', d_d_booking);
	setValueToHtmlTag('OTHER_BOOKING', other_booking);
	setValueToHtmlTag('TOTAL', Total);

}

function clear() {
	totalQtty 	= 0;	
}
function setCompanyName(){
	
	if(document.getElementById('Company').checked == true){
		printBillWindow('&nbsp;&nbsp;&nbsp;&nbsp;');
	
	}else if(document.getElementById('Agency').checked == true){
		printBillWindow('AGENCY');
	}else if(document.getElementById('Carriers').checked == true){
		printBillWindow('CARRIERS');
	}
}
function ShowDialogForCompanyName(){
    $("#companyNameOverlay").show();
    $("#companyNameDialog").fadeIn(300);
    $('#Company').focus();
    }

function HideSaidToContainDialog(){
    $("#companyNameOverlay").hide();
    $("#companyNameDialog").fadeOut(0);
    printBillWindow('');
    
}