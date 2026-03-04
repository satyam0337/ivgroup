/**
 * @Author Ashish Tiwari 06/05/2016 
 */

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/jrl/jrlPrintWayBill.html", function() {

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
	var containDetails  = null;
	var wayBillType		= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var Date 			= (wayBill.actualBookingDateTime).substring(0, 16) ;
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	var bookDate = day+"-"+month+"-"+year;
	
	var Material 		= null;

	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('bookDateTime', bookDate);
	
	setValueToHtmlTag('frombranch', sourceBranch.name);
/*	setValueToHtmlTag('srcPhone', sourceBranch.phoneNumber);*/
	setValueToHtmlTag('tobranch', destinationBranch.name);
	setValueToHtmlTag('frtUptoBranch', freightUptoBranch.name);
	
	setValueToHtmlTag('consignorDetails', consignorDetails.name);
	setValueToHtmlTag('consigneeDetails', consigneeDetails.name);
	setValueToHtmlTag('consignorDetailsPhone', consignorDetails.phoneNumber);
	setValueToHtmlTag('consigneeDetailsPhone', consigneeDetails.phoneNumber);
	setValueToHtmlTag('wayBillType', wayBillType);
	for( var i = 0 ; i < consignmentDetails.length;i++){
		totalQtty			+= consignmentDetails[i].quantity;
	}

	setValueToHtmlTag('chrgWgt', consignmentSummary.chargeWeight);
	setValueToHtmlTag('actWgt', consignmentSummary.actualWeight);


	setValueToHtmlTag('noOfPck', totalQtty);
	if(consignmentSummary.declaredValue == 0){
		setValueToHtmlTag('declaredValue',  "");
	}else{
		setValueToHtmlTag('declaredValue',  consignmentSummary.declaredValue);
	}
	setValueToHtmlTag('InvoiceNo',  wayBill.consignorInvoiceNo);
	
	
	if(freightUptoBranch != null){
		if(freightUptoBranch.typeOfLocation == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE){
			setValueToHtmlTag('freightUpto',  freightUptoBranch.name);
		}else{
			if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_DOOR_ID){
				setValueToHtmlTag('freightUpto',  "&nbsp;DOOR");
			}else if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_BRANCH_ID){
				setValueToHtmlTag('freightUpto',  "&nbsp;GODOWN");
			}
		}
	}
	if(taxPaidBy != null){
		setValueToHtmlTag('taxPaidBy',  "Service Tax Payable by : "+taxPaidBy);
	}
	
	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		setValueToHtmlTag('taxAmt',  "");
	}else{
		if(wayBillTaxTxn != null && wayBillTaxTxn.length > 0) {
			setValueToHtmlTag('taxAmt',  "(4.35%)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+wayBillTaxTxn[0].unAddedTaxAmount);;
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

	if(consignmentDetails != null ) {
		for(var i = 0; i < consignmentDetails.length; i++) {
				tableRow		= createRow(i,'');

				quantityCol		= createColumnInRow(tableRow, i, '', '30%', 'left', 'padding-left:22px; font: 18px Courier New;', '');
				saidToContain	= createColumnInRow(tableRow, i+10, '', '', 'left', 'padding-left:22px;font: 18px Courier New;', '');
				appendValueInTableCol(quantityCol,  (consignmentDetails[i].quantity+" "+consignmentDetails[i].packingTypeName));
				appendValueInTableCol(saidToContain, consignmentDetails[i].saidToContain);

				appendRowInTable('consignmentDetails', tableRow);
		}
	}		
}

function setCharges() {

	var freight				= 0;
	var lr_charge			= 0;
	var hamali				= 0;
	var det_booking			= 0;
	var collection			= 0;
	var door_dly_booking	= 0;
	var crossing_booking	= 0;
	var other_booking		= 0;
	var cartage_Chrg		= 0;
	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		setValueToHtmlTag('freight', '');
		setValueToHtmlTag('hamali', '');
		setValueToHtmlTag('lr_charge', '');
		setValueToHtmlTag('cartage_Chrg', '');
		setValueToHtmlTag('book_Chrg_Sum', '');
		setValueToHtmlTag('collection', "");
		setValueToHtmlTag('door_dly_booking', "");
		setValueToHtmlTag('det_booking', "");
		setValueToHtmlTag('other_booking', "");
		setValueToHtmlTag('crossing_booking', "");

	}else {
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

		if (wayBillChrg != null) {
			freight			= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.LR_CHARGE];

		if (wayBillChrg != null) {
			lr_charge		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.HAMALI];

		if (wayBillChrg != null) {
			hamali				= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DETENTION_BOOKING];

		if (wayBillChrg != null) {
			det_booking					= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.COLLECTION];

		if (wayBillChrg != null) {
			collection			= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DLY_BOOKING];

		if (wayBillChrg != null) {
			door_dly_booking 	= (wayBillChrg.chargeAmount).toFixed();
		}


		wayBillChrg	= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];

		if (wayBillChrg != null) {
			other_booking		= (wayBillChrg.chargeAmount).toFixed();
		}
		
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.CROSSING_BOOKING];

		if (wayBillChrg != null) {
			crossing_booking		= (wayBillChrg.chargeAmount).toFixed();
		}
		
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.CARTAGE_CHARGE];

		if (wayBillChrg != null) {
			cartage_Chrg		= (wayBillChrg.chargeAmount).toFixed();
		}
		
		setValueToHtmlTag('freight', freight);
		setValueToHtmlTag('hamali', hamali);
		setValueToHtmlTag('lr_charge', lr_charge);
		setValueToHtmlTag('cartage_Chrg', cartage_Chrg);
		setValueToHtmlTag('book_Chrg_Sum', wayBill.bookingChargesSum);
		if(collection == 0){
			setValueToHtmlTag('collection', "");
		}else{
			setValueToHtmlTag('collection', collection);
		}
		if(door_dly_booking == 0){
			setValueToHtmlTag('door_dly_booking', "");
		}else{
			setValueToHtmlTag('door_dly_booking', door_dly_booking);
		}
		if(det_booking == 0){
			setValueToHtmlTag('det_booking', "");
		}else{
			setValueToHtmlTag('det_booking', det_booking);
		}
		if(other_booking == 0){
			setValueToHtmlTag('other_booking', "");
		}else{
			setValueToHtmlTag('other_booking', other_booking);
		}
		if(crossing_booking == 0){
			setValueToHtmlTag('crossing_booking', "");
		}else{
			setValueToHtmlTag('crossing_booking', crossing_booking);
		}
	}
	
}

function clear() {
	totalQtty 	= 0;	
}