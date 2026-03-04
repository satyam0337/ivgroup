/**
 * @Author Ashish Tiwari 03/05/2016
 */

function printBillWindow(company) {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/netc/netcPrintWayBill.html", function() {
		
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
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? "&nbsp; " : " "+consigneeDetails.phoneNumber+" " :" ";
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
	setValueToHtmlTag('consigneePhone', consigneeDetailsphone);
	setValueToHtmlTag('goods', goods);
	setValueToHtmlTag('saidToContain', saidToContain.substring(0,saidToContain.length-2));
	if(wayBill.remark == ""){
		setValueToHtmlTag('remark', "");
	}else{
		setValueToHtmlTag('remark', wayBill.remark);
	}
	setValueToHtmlTag('tobranch', destinationBranch.name);
	setValueToHtmlTag('wayBillType', wayBillType);
	setValueToHtmlTag('AmtInWords', AmtInWords+" Only");
	setValueToHtmlTag('bookDate', bookDate);
	setValueToHtmlTag('bookTime', bookTime);
	setValueToHtmlTag('totalQtty', totalQtty);
	setValueToHtmlTag('actualWeight',  (consignmentSummary.actualWeight != null) ? consignmentSummary.actualWeight : 0 ); 
	setValueToHtmlTag('chargeWeight',  (consignmentSummary.chargeWeight != null) ? consignmentSummary.chargeWeight : 0 );
	setValueToHtmlTag('privateMarka', privateMarka);
	setValueToHtmlTag('invoiceNo', consignmentSummary.invoiceNo);
	setValueToHtmlTag('declaredValue',  consignmentSummary.declaredValue);
	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('srcBranchAdd', srcBranchAdd + " Ph.:"+ sourceBranch.mobileNumber);
	setValueToHtmlTag('srcBranchName', sourceBranch.name);
	setValueToHtmlTag('tobranch1', destinationBranch.name);


	setValueToHtmlTag('grandTotal', (wayBill.grandTotal != null) ? (wayBill.grandTotal).toFixed(): " ");
	setValueToHtmlTag('barnchoffice', barnchoffice);
	
	
	setValueToHtmlTag('bookingTotal',  (wayBill.bookingTotal != null) ? (wayBill.bookingTotal).toFixed() : "" );
	setValueToHtmlTag('bookedByName', bookedByName);
	

	/*
	 * consignee tin no 
	 * setValueToHtmlTag('consigneetinno', consigneeDetails.tinNo);
	 */
	if(wayBillTaxTxn.length > 0){
		for(var i = 0; i < wayBillTaxTxn.length; i++) {
			if(LRType == WayBill.WAYBILL_TYPE_PAID ){
				setValueToHtmlTag('sTaxPaid', (wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
			}else if(LRType == WayBill.WAYBILL_TYPE_TOPAY){
				setValueToHtmlTag('sTaxToPay', (wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
			}


		}
	} 
	clear();
}

/*function tobepaidby() {
	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_TRANSPORTER_ID) {
		setValueToHtmlTag('staxPaidBy', '<font>' + '&radic;'+'</font>');
	}

	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_CONSINGOR_ID) {
		setValueToHtmlTag('staxPaidBy1', '<font>' + '&radic;'+'</font>');
	}

	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_CONSINGEE_ID) {
		setValueToHtmlTag('staxPaidBy2', '<font>' + '&radic;'+'</font>');
	}
}
*/
/*function setConsignment() {

	var totalQtty		= 0;
	var tableRow		= null;
	var packingTypeCol	= null;
	var blankCol1		= null;
	var quantityCol		= null;
	var blankCol2		= null;
	var blankCol3		= null;
	var blankCol4		= null;
	var blankCol5		= null;
	var amountCol		= null;
	var totalAmtCol		= null;
	var spaceCol		= null;

	if(consignmentDetails != null ) {
		for(var i = 0; i < 5; i++) {
			if(i < consignmentDetails.length) {
				tableRow		= createRow(i,'');

				quantityCol		= createColumnInRow(tableRow, i, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
				saidToContain	= createColumnInRow(tableRow, i+10, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');

				appendValueInTableCol(quantityCol,  (consignmentDetails[i].quantity));
				appendValueInTableCol(saidToContain, consignmentDetails[i].packingTypeName + " ( " + consignmentDetails[i].saidToContain  + ")" );


				totalQtty			+= consignmentDetails[i].quantity;

				appendRowInTable('consignmentSummaryquantity', tableRow);

			} else {
				tableRow		= createRow(i,'');

				blankCol1		= createColumnInRow(tableRow, i, '', '', 'left', 'padding-top: 1px; height:20px; width:20%;', '');
				spaceCol		= createColumnInRow(tableRow, i+10, '', '10%', '', 'padding-top: 1px; padding-left: 7px;  width:80%;', '');

				appendValueInTableCol(blankCol1, '');
				appendValueInTableCol(spaceCol, '&nbsp;');

				appendRowInTable('consignmentSummaryquantity', tableRow);
			}
		}

		appendRowInTable('consignmentSummarytotalquantity', totalQtty);
	}		
}*/

/*function deliveryAt() {
	var deliveryAt		=	null;

	if(consignmentSummary.deliveryTo != null)
	{
		if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_BRANCH_ID) {
			deliveryAt = TransportCommonMaster.DELIVERY_TO_BRANCH_NAME;
		} else if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_DOOR_ID) {
			deliveryAt = TransportCommonMaster.DELIVERY_TO_DOOR_NAME;
		} else if(consignmentSummary.deliveryTo == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
			deliveryAt = TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_NAME;
		}
	}

	setValueToHtmlTag('deliveryAt', deliveryAt);
}*/

function setCharges() {

	var freight				= 0;
	var basic				= 0;
	var fov					= 0;
	var hamali				= 0;
	var cc_gcn				= 0; 
	var d_d_booking			= 0;
	var other_booking		= 0;
	var aoc					= 0;
	var Total			= 0;
	

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

	if (wayBillChrg != null) {
		freight			= (wayBillChrg.chargeAmount).toFixed();
	}

	wayBillChrg	= wayBillCharges[ChargeTypeMaster.LOCAL_BOOKING];

	if (wayBillChrg != null) {
		basic		= (wayBillChrg.chargeAmount).toFixed();	
	}
	
	wayBillChrg	= wayBillCharges[ChargeTypeMaster.FOV];

	if (wayBillChrg != null) {
		fov					= (wayBillChrg.chargeAmount).toFixed();
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
	
	wayBillChrg	= wayBillCharges[ChargeTypeMaster.AOC];

	if (wayBillChrg != null) {
		aoc					= (wayBillChrg.chargeAmount).toFixed();
	}
	Total = Number(freight)+Number(basic)+Number(fov)+Number(hamali)+Number(cc_gcn)+Number(d_d_booking)+Number(other_booking);
	
	setValueToHtmlTag('FREIGHT', freight);
	setValueToHtmlTag('BASIC', basic );
	setValueToHtmlTag('FOV', fov);
	setValueToHtmlTag('HAMALI', hamali );
	setValueToHtmlTag('CC_GCN', cc_gcn);
	setValueToHtmlTag('DOOR_DLY_BOOKING', d_d_booking);
	setValueToHtmlTag('OTHER_BOOKING', other_booking);
	setValueToHtmlTag('TOTAL', Total);
	setValueToHtmlTag('AOC', aoc );
	setValueToHtmlTag('TOTAL_FREIGHT', wayBill.bookingTotal);
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
	/*HideSaidToContainDialog();
	printBillWindow();*/
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