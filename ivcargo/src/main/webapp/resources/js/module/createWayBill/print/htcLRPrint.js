/**
 * @Author Ashish Tiwari 06/05/2016 
 */

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/htc/htcPrintWayBill.html", function() {

		window.setTimeout(printAfterDelay, 500);
		setPrintData();

	});
}

function printAfterDelay() {
	window.print();
	window.close();

}

//Method Calling form genericfunctions.js file
var hours = 0;
var currentdate1	= getCurrentDate();
var currentdate		= new Date();
if(currentdate.getHours() > 12){
	hours = (currentdate.getHours() - 12)+ ":" + currentdate.getMinutes() + " PM";
}
var currenttime1 	= hours;

var totalQtty		= 0;

function setPrintData() {

	setCharges();
	setConsignment();

	var totalQtty		= 0;
	var consignmentLength = 3;
	var containDetails  = null;
	var wayBillType		= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var privateMarka	= consignmentSummary.privateMarka;
	var Date 			= (wayBill.creationDateTimeStamp).substring(0, 16) ;
	console.log(Date);
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	var hour  = Date.substring(11,13);
	var min   = Date.substring(14,16);
	console.log(min);
	var bookDateTime = day+"-"+month+"-"+year+" "+hour+":"+min;
	
	var Material 		= null;

	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('frombranch', sourceBranch.name);
	setValueToHtmlTag('tobranch', destinationBranch.name);
	setValueToHtmlTag('bookDateTime', bookDateTime);
	setValueToHtmlTag('consignorDetails', consignorDetails.name);
	setValueToHtmlTag('consignorDetailsPhone', consignorDetails.phoneNumber);
	setValueToHtmlTag('consigneeDetails', consigneeDetails.name);
	setValueToHtmlTag('consigneeDetailsPhone', consigneeDetails.phoneNumber);
	setValueToHtmlTag('wayBillType', wayBillType);
	setValueToHtmlTag('remark', wayBill.remark);
	setValueToHtmlTag('actWgt', consignmentSummary.actualWeight);
	setValueToHtmlTag('chrgWgt', consignmentSummary.chargeWeight);
	for( var i = 0 ; i < consignmentLength;i++){
		totalQtty			+= consignmentDetails[i].quantity;
	}
	setValueToHtmlTag('noOfPck', totalQtty);
	setValueToHtmlTag('privateMarka', privateMarka);
	setValueToHtmlTag('deliverAt',  destinationBranch.handlingBranchName);
	setValueToHtmlTag( 'PhoneNo', destinationBranch.phoneNumber)
	setValueToHtmlTag('InvoiceNo',  wayBill.consignorInvoiceNo);
	if(consignmentSummary.declaredValue == 0){
		setValueToHtmlTag('declaredValue',  "");
	}else{
		setValueToHtmlTag('declaredValue',  consignmentSummary.declaredValue);
	}
	
	if(freightUptoBranch != null){
			if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_DOOR_ID){
				setValueToHtmlTag('freightUpto',  "D.Delivery&nbsp;&nbsp;Frt Upto :&nbsp;"+destinationBranch.handlingBranchName);
			}else if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_BRANCH_ID){
				setValueToHtmlTag('freightUpto',  "Godown&nbsp;&nbsp;Frt Upto :&nbsp;"+destinationBranch.handlingBranchName);
			}else {
				setValueToHtmlTag('freightUpto',  "DDDV&nbsp;&nbsp;Frt Upto :&nbsp;"+destinationBranch.handlingBranchName);
			}
	}
	if(taxPaidBy != null){
		setValueToHtmlTag('taxPaidBy',taxPaidBy);
	}
	
	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		setValueToHtmlTag('taxAmt',  "");
	}else{
		if(wayBillTaxTxn != null && wayBillTaxTxn.length > 0) {
			setValueToHtmlTag('taxAmt',wayBillTaxTxn[0].taxAmount);
		}
	}
	
	
	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		setValueToHtmlTag('wayBillType', "TBB");
		setValueToHtmlTag('selValue', "");
		setValueToHtmlTag('selValue1', "");
		setValueToHtmlTag('bookTotal', "TBB");
	}else{
		setValueToHtmlTag('wayBillType', wayBillType);
		setValueToHtmlTag('selValue', "0");
		setValueToHtmlTag('selValue1', "0");
		setValueToHtmlTag('bookTotal', wayBill.bookingTotal);
	}
	
	
	setValueToHtmlTag('bookedByName', bookedByName);

}

function setConsignment() {

	var tableRow		= null;
	var quantityCol		= null;
	var saidToContain	= null;
	var common			= null;
	var consignmentLength = 3;

	if(consignmentDetails != null ) {
		for(var i = 0; i < consignmentLength; i++) {
				tableRow		= createRow(i,'');

				quantityCol		= createColumnInRow(tableRow, i, '', '10%', 'right', 'font: 14px Courier New;', '');
				saidToContain	= createColumnInRow(tableRow, i+10, '', '', 'left', 'padding-left : 20px;font: 14px Courier New;', '');
				
				appendValueInTableCol(quantityCol,  (consignmentDetails[i].quantity));
				appendValueInTableCol(saidToContain,consignmentDetails[i].packingTypeName+" of "+ consignmentDetails[i].saidToContain);

				appendRowInTable('consignmentDetails', tableRow);
		}
	}		
}

function setCharges() {

	var freight				= 0;
	var cross_booking		= 0;
	var hamali				= 0;
	var bc_Chrg				= 0;
	var door_dly_booking	= 0;

	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		setValueToHtmlTag('freight', '');
		setValueToHtmlTag('hamali', '');
		setValueToHtmlTag('cross_booking', '');
		setValueToHtmlTag('door_dly_booking', "");
		setValueToHtmlTag('bc_Chrg', "");

	}else {
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

		if (wayBillChrg != null) {
			freight			= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.CROSSING_BOOKING];

		if (wayBillChrg != null) {
			cross_booking		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.HAMALI];

		if (wayBillChrg != null) {
			hamali				= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.B_C_CHARGE];

		if (wayBillChrg != null) {
			bc_Chrg					= (wayBillChrg.chargeAmount).toFixed();
		}
		
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DELIVERY_BOOKING];

		if (wayBillChrg != null) {
			door_dly_booking 	= (wayBillChrg.chargeAmount).toFixed();
			console.log("door_dly_booking : "+door_dly_booking);
		}
		var taxAmt = wayBillTaxTxn[0].taxAmount;
		setValueToHtmlTag('freight', freight);
		setValueToHtmlTag('taxAmt1',taxAmt);
		if(hamali == 0){
			setValueToHtmlTag('hamali', "");
		}else{
			setValueToHtmlTag('hamali', hamali);
		}
		if(door_dly_booking == 0){
			setValueToHtmlTag('door_dly_booking', "");
		}else{
			setValueToHtmlTag('door_dly_booking', door_dly_booking);
		}
		if(cross_booking == 0){
			setValueToHtmlTag('cross_booking', "");
		}else{
			setValueToHtmlTag('cross_booking', cross_booking);
		}
		if(bc_Chrg == 0){
			setValueToHtmlTag('bc_Chrg', "");
		}else{
			setValueToHtmlTag('bc_Chrg', bc_Chrg);
		}
		setTotal(freight,cross_booking,hamali,door_dly_booking,bc_Chrg,taxAmt);
	}
	
}

function setTotal(freight,cross_booking,hamali,door_dly_booking,bc_Chrg,taxAmt) {
	var Total = 0;
	Total = Number(freight)+Number(cross_booking)+Number(hamali)+Number(door_dly_booking)+Number(bc_Chrg)+Number(taxAmt);
	setValueToHtmlTag('Total', Total);
}

function clear() {
	totalQtty 	= 0;	
}