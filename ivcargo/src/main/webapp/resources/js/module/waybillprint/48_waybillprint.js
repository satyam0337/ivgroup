/**
 * @Author Ashish Tiwari 10-05-2016
 */

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	
	$("#tableContain").load("/ivcargo/html/print/waybill/48_waybillprint.html", function() {
		
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
	var noOfPkg 		= 0;
	var packingTypeDetail	= null;
	var currentdate1	= getCurrentDate();
	var barnchoffice			= (executive.address != null ) ? executive.address : "A " ;
	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	destinationBranchname		= (destinationBranch.name);
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";
	var privateMarka			= consignmentSummary.privateMarka;
	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var LRType					= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_PAID
	var Date 					= (wayBill.actualBookingDateTime).substring(0, 16) ;
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	var hour  = Date.substring(11,13);
	var time = Date.substring(14,16);
	if(hour > 12){
		var bookDate = day+"-"+month+"-"+year+" "+(hour - 12)+":"+time+" PM";
	}else{
		var bookDate = day+"-"+month+"-"+year+" "+hour+":"+time+" AM";
	}

	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('bookDate', bookDate);
	setValueToHtmlTag('frombranch',srcCity.name+" ( " +sourceBranchName+" )");
	setValueToHtmlTag('tobranch',destCity.name + " ( " +destinationBranchname+" )");
	setValueToHtmlTag('consignorDetails', consignorDetailsname);
	setValueToHtmlTag('consigneeDetails', consigneeDetailsname);
	setValueToHtmlTag('consigneeDetailsphone', consigneeDetailsphone);
	setValueToHtmlTag('wayBillType', wayBillType);
	if(wayBill.remark == ""){
		setValueToHtmlTag('isRemark', "&nbsp;");
		setValueToHtmlTag('remark', "");
	}else {
		setValueToHtmlTag('isRemark', "Remark :");
		setValueToHtmlTag('remark', wayBill.remark);
	}
	for(var i = 0; i < consignmentDetails.length; i++) {
		noOfPkg += consignmentDetails[i].quantity;
	}
	for(var i = 0; i < consignmentDetails.length; i++) {
		packingTypeDetail += consignmentDetails[i].quantity + " " +consignmentDetails[i].packingTypeName+", ";
		
	}
	
	setValueToHtmlTag('noOfPkg', noOfPkg+" ( "+packingTypeDetail.substring(4,packingTypeDetail.length-2)+" )");
	setValueToHtmlTag('declaredValue',  consignmentSummary.declaredValue);
	
	setValueToHtmlTag('bookTotal', wayBill.bookingTotal);
	setValueToHtmlTag('bookedByName', bookedByName);
	setValueToHtmlTag('printedByName', bookedByName);
	setValueToHtmlTag('printTime', currentdate1+" "+currenttime1);
	if(destinationBranch.phoneNumber != null){
		setValueToHtmlTag('destAddress', destinationBranch.address +"&nbsp;&nbsp;Phone:&nbsp;"+destinationBranch.phoneNumber);
	}else{
		setValueToHtmlTag('destAddress', destinationBranch.address);
	}
	setPrintData1();
}
	
function setCharges() {
	var freight				= 0;
	var handling			= 0;
	var auto				= 0;

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];
	handlingChrg = wayBillCharges[ChargeTypeMaster.HANDLING];
	autoChrg 		 = wayBillCharges[ChargeTypeMaster.AUTO_BOOKING]
	if (wayBillChrg != null) {
		freight			= (wayBillChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeName', wayBillChrg.name +" :");
		setValueToHtmlTag('freight', freight);
	}
	if(handlingChrg != null){
		handling		= (handlingChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeNameHnd', handlingChrg.name +" :");
		setValueToHtmlTag('handling', handling);
	}
	if(autoChrg != null){
		auto		= (autoChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeNameauto', autoChrg.name +" :");
		setValueToHtmlTag('auto', auto);
	}
	

}

function setPrintData1() {

	setCharges1();	
	var noOfPkg 		= 0;
	var packingTypeDetail	= null;
	var currentdate1	= getCurrentDate();
	var barnchoffice			= (executive.address != null ) ? executive.address : "A " ;
	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	destinationBranchname		= (destinationBranch.name);
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";
	var privateMarka			= consignmentSummary.privateMarka;
	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var LRType					= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_PAID
	var Date 					= (wayBill.actualBookingDateTime).substring(0, 16) ;
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	var hour  = Date.substring(11,13);
	var time = Date.substring(14,16);
	if(hour > 12){
		var bookDate = day+"-"+month+"-"+year+" "+(hour - 12)+":"+time+" PM";
	}else{
		var bookDate = day+"-"+month+"-"+year+" "+hour+":"+time+" AM";
	}

	setValueToHtmlTag('wayBillNumber1', wayBill.wayBillNumber);
	setValueToHtmlTag('bookDate1', bookDate);
	setValueToHtmlTag('frombranch1',srcCity.name+" ( " +sourceBranchName+" )");
	setValueToHtmlTag('tobranch1',destCity.name + " ( " +destinationBranchname+" )");
	setValueToHtmlTag('consignorDetails1', consignorDetailsname);
	setValueToHtmlTag('consigneeDetails1', consigneeDetailsname);
	setValueToHtmlTag('consigneeDetailsphone1', consigneeDetailsphone);
	setValueToHtmlTag('wayBillType1', wayBillType);
	if(wayBill.remark == ""){
		setValueToHtmlTag('isRemark1', "&nbsp;");
		setValueToHtmlTag('remark1', "");
	}else {
		setValueToHtmlTag('isRemark1', "Remark :");
		setValueToHtmlTag('remark1', wayBill.remark);
	}
	for(var i = 0; i < consignmentDetails.length; i++) {
		noOfPkg += consignmentDetails[i].quantity;
	}
	for(var i = 0; i < consignmentDetails.length; i++) {
		packingTypeDetail += consignmentDetails[i].quantity + " " +consignmentDetails[i].packingTypeName+", ";
		
	}
	
	setValueToHtmlTag('noOfPkg1', noOfPkg+" ( "+packingTypeDetail.substring(4,packingTypeDetail.length-2)+" )");
	setValueToHtmlTag('declaredValue1',  consignmentSummary.declaredValue);
	
	setValueToHtmlTag('bookTotal1', wayBill.bookingTotal);
	setValueToHtmlTag('bookedByName1', bookedByName);
	setValueToHtmlTag('printedByName1', bookedByName);
	setValueToHtmlTag('printTime1', currentdate1+" "+currenttime1);
	if(destinationBranch.phoneNumber != null){
		setValueToHtmlTag('destAddress1', destinationBranch.address +"&nbsp;&nbsp;Phone:&nbsp;"+destinationBranch.phoneNumber);
	}else{
		setValueToHtmlTag('destAddress1', destinationBranch.address);
	}

}

function setCharges1() {
	var freight				= 0;
	var handling			= 0;
	var auto				= 0;

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];
	handlingChrg = wayBillCharges[ChargeTypeMaster.HANDLING];
	autoChrg 	= wayBillCharges[ChargeTypeMaster.AUTO_BOOKING];

	if (wayBillChrg != null) {
		freight			= (wayBillChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeName1', wayBillChrg.name +" :");
		setValueToHtmlTag('freight1', freight);
	}
	
	if(handlingChrg != null){
		handling		= (handlingChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeName2', handlingChrg.name +" :");
		setValueToHtmlTag('handling2', handling);
	}
	if(autoChrg != null){
		auto		= (autoChrg.chargeAmount).toFixed();
		setValueToHtmlTag('chargeNameauto2', autoChrg.name +" :");
		setValueToHtmlTag('auto2', auto);
	}

}
