/**
 * @Author Anant Chaudhary	20-02-2016
 */
var wayBillChrg			= null;

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	
	$("#tableContain").load( "/ivcargo/html/print/waybill/236_waybillprint.html", function() {
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

var totalQtty		= 0;

function setPrintData() {
	setConsignment();
	setCharges();

	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchphone		= (sourceBranch.phoneNumber) != null ? (sourceBranch.phoneNumber) == ("00000-00000000") ? " ":"("+sourceBranch.phoneNumber+")":" ";
	var destinationBranchname	= (destinationBranch.name).length > 15 ? (destinationBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : (destinationBranch.name).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";

	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");

	setValueToHtmlTag('frombranch', sourceBranchName);
	setValueToHtmlTag('tobranch', destinationBranchname);
	setValueToHtmlTag('wayBillNumber', wayBill.wayBillNumber);
	setValueToHtmlTag('wayBillType', wayBillType);
	setValueToHtmlTag('crtdate', currentdate1);
	setValueToHtmlTag('crttime', currenttime1);
	setValueToHtmlTag('consignorDetails', consignorDetailsname);
	setValueToHtmlTag('consignorPhoneNo', consignorDetailsphone);
	setValueToHtmlTag('consigneeDetails', consigneeDetailsname);
	setValueToHtmlTag('consigneePhoneNo', consigneeDetailsphone);
	setValueToHtmlTag('grandTotal', (wayBill.grandTotal != null) ? (wayBill.grandTotal).toFixed(): " ");

	if(wayBillTaxTxn.length > 0){
		for(var i = 0; i < wayBillTaxTxn.length; i++) {
			setValueToHtmlTag('sTax', (wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
		}
	} else {
		setValueToHtmlTag('sTax', 0);
	}	

	clear();
}

function setConsignment() {

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

				packingTypeCol		= createColumnInRow(tableRow, i, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
				blankCol1			= createColumnInRow(tableRow, i+10, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
				quantityCol			= createColumnInRow(tableRow, i+100, '', '10%', '', 'padding-top: 1px; border-right: 0px solid black;', '');
				blankCol2			= createColumnInRow(tableRow, i+100, '', '15%', '', 'padding-top: 1px; border-right: 0px solid black;', '');
				amountCol			= createColumnInRow(tableRow, i+100, '', '10%', 'Right', 'padding-right: 5px; padding-top: 1px; border-right: 0px solid black;', '');
				totalAmtCol			= createColumnInRow(tableRow, i, '', '25%', 'Right', 'padding-right: 10px; padding-top: 1px; border-right: 0x solid black', '');

				appendValueInTableCol(packingTypeCol, consignmentDetails[i].packingTypeName);
				appendValueInTableCol(blankCol1, '');
				appendValueInTableCol(quantityCol, consignmentDetails[i].quantity);
				appendValueInTableCol(blankCol2, '');
				appendValueInTableCol(amountCol, consignmentDetails[i].amount);
				appendValueInTableCol(totalAmtCol, consignmentDetails[i].amount * consignmentDetails[i].quantity);

				totalQtty			+= consignmentDetails[i].quantity;

				appendRowInTable('consignmentSummaryquantity', tableRow);

			} else {
				tableRow		= createRow(i,'');

				blankCol1		= createColumnInRow(tableRow, i, '', '', 'left', 'padding-top: 1px; height:20px;', '');
				spaceCol		= createColumnInRow(tableRow, i+10, '', '10%', '', 'padding-top: 1px; padding-left: 7px;', '');
				blankCol2		= createColumnInRow(tableRow, i+100, '', '4%', '', '', '');
				blankCol3		= createColumnInRow(tableRow, i+100, '', '10%', '', '', '');
				blankCol4		= createColumnInRow(tableRow, i+100, '', '6%', 'Right', 'padding-right: 10px;', '');
				blankCol5		= createColumnInRow(tableRow, i+100, '', '6%', 'Right', 'padding-right: 10px;', '');

				appendValueInTableCol(blankCol1, '');
				appendValueInTableCol(spaceCol, '&nbsp;');
				appendValueInTableCol(blankCol2, '');
				appendValueInTableCol(blankCol3, '');
				appendValueInTableCol(blankCol4, '');
				appendValueInTableCol(blankCol5, '');

				appendRowInTable('consignmentSummaryquantity', tableRow);
			}
		}

		appendRowInTable('consignmentSummarytotalquantity', totalQtty);
	}		
}

function setCharges() {
	if (wayBillCharges != undefined) {
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.LOADING];

		if (wayBillChrg != null) {
			setValueToHtmlTag('LOADING', (wayBillChrg.chargeAmount).toFixed());
		} else  {
			setValueToHtmlTag('LOADING', 0);
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.BUILTY_CHARGE];

		if (wayBillChrg != null) {
			setValueToHtmlTag('BUILTY_CHARGE', (wayBillChrg.chargeAmount).toFixed());
		} else	{
			setValueToHtmlTag('BUILTY_CHARGE', 0);
			}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.INSURANCE];

		if (wayBillChrg != null) {
			setValueToHtmlTag('INSURANCE', (wayBillChrg.chargeAmount).toFixed());
		} else {
			setValueToHtmlTag('INSURANCE', 0);
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_PICKUP];

		if (wayBillChrg != null) {
			setValueToHtmlTag('DOOR_PICKUP', (wayBillChrg.chargeAmount).toFixed());
		} else {
			setValueToHtmlTag('DOOR_PICKUP', 0);
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DLY_BOOKING];

		if (wayBillChrg != null) {
			setValueToHtmlTag('DOOR_DLY_BOOKING', (wayBillChrg.chargeAmount).toFixed());
		} else{
			setValueToHtmlTag('DOOR_DLY_BOOKING', 0);
		}
	}
}

function clear() {
	totalQtty 	= 0;	
}