/**
 * @Author Nagesh 
 */
function printBillWindow() {
	window.resizeTo(0, 0);
	window.moveTo(0, 0);
	$("#tableContain").load( "/ivcargo/html/print/waybill/216_waybillprint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {

	var ser_tax=0; 
	$('.waybillNumber').append(wayBill.wayBillNumber);
	$('.creationdate').append(getDateInDMYFromTimestamp(wayBill.creationDateTimeStamp));
     if(freightUptoBranch.abbrevationName != null){
    	 $('.freightUptoBranch').append((freightUptoBranch.abbrevationName).toUpperCase());
     }
	
	if(consignorDetails.phoneNumber > 0){
		$('.consignor').append((consignorDetails.name).toUpperCase()+"("+consignorDetails.phoneNumber+")");

	}else{
		$('.consignor').append((consignorDetails.name).toUpperCase());
	}

	if(consigneeDetails != null){
		if(consigneeDetails.mobileNumber != null) {
			$('.consignee').append((consigneeDetails.name).toUpperCase()+"("+consigneeDetails.mobileNumber+")");
		}
		else {
			$('.consignee').append((consigneeDetails.name).toUpperCase());
		}
	}

	if(sourceBranch.phoneNumber != null){
		$('.srcbranch').append((sourceBranch.name).toUpperCase()+" ( "+sourceBranch.phoneNumber+" )");
	}else{
		$('.srcbranch').append((sourceBranch.name).toUpperCase()+" ("+sourceBranch.mobileNumber+")");
	}

	$('.declaredvalue').append(consignmentSummary.declaredValue);
	if(consignmentSummary.vehicleNumber!=null){
		$('.truck_no').append(consignmentSummary.vehicleNumber);

	}
	$('.remark').append(wayBill.remark);
	$('.lr_type').append((wayBill.wayBillType).toUpperCase());
	$('.executive_name').append(bookedByName);

	if(taxPaidBy != null && taxPaidBy != '--'){
		changeDisplayProperty('seriveTaxPaidById', 'block');
		setValueToHtmlTag('seriveTaxPaidBy', taxPaidBy);
	}

	$('.actualWeight').append(consignmentSummary.actualWeight);

	$('.invoice').append(wayBill.consignorInvoiceNo);

	$('.chargedWeight').append(consignmentSummary.chargeWeight);

	if(destinationBranch.phoneNumber != null){
		$('.destBranch').append((destinationBranch.name).toUpperCase()+" ("+destinationBranch.phoneNumber+")");
	}else{
		$('.destBranch').append((destinationBranch.name).toUpperCase()+" ("+destinationBranch.mobileNumber+")");	
	}
	$('.service_tax').append(taxPaidBy);
	setConsignment();
	setGodown();
	setTaxAmount();
	setCharges();
	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT) {
		setAmountBlanckIfTBBLR()
	}
}

function setConsignment() {
	if(consignmentDetails != null ) {
		var noOfArt		= 0;
		
		var noOfArtCol		= null;
		var artNameCol		= null;
		
		for(var i = 0; i < consignmentDetails.length; i++) {
			var row			= createRowInTable('', '', 'height:10px;');
			
			var quantity		= consignmentDetails[i].quantity;
			var packingTypeName	= (consignmentDetails[i].packingTypeName).toUpperCase();
			var saidToContain	= (consignmentDetails[i].saidToContain).toUpperCase();
			
			noOfArt				+= quantity;
			
			noOfArtCol		= createColumnInRow(row, 'article_' + (i + 1), '', '50px;', 'center', 'height: 10px;padding-left: 20px;', '');
			artNameCol		= createColumnInRow(row, 'articleName_' + (i + 1), '', '', '', 'height: 10px;', '');
			
			appendValueInTableCol(noOfArtCol, quantity);
			appendValueInTableCol(artNameCol, packingTypeName + ' OF ' + saidToContain);
			
			$(".consignmentDetails").append(row);
		}
		
		countTotalConsignment(noOfArt);
	}
}

function countTotalConsignment(noOfArt) {
	var totalRow		= createRowInTable('', '', '');
	
	var totalBlankCol		= createColumnInRow(totalRow, '', '', '50px;', '', 'padding-left: 20px;', '');
	var totalArtCol			= createColumnInRow(totalRow, '', '', '', '', '', '');
	appendValueInTableCol(totalBlankCol, '');
	appendValueInTableCol(totalArtCol, 'Total - ' + noOfArt);
	
	$(".totalAddedArt").append(totalRow);
}

function setCharges() {

	var freight				= 0;
	var HAMALI  			= 0;
	var COLLECTION			= 0;
	var door_dly			= 0;
	var lr_charges			= 0;
	var other				= 0;
	var CROSSING_BOOKING	= 0;
	var DETENTION_BOOKING   = 0;
	var Total 				=0;
	if(wayBillCharges != undefined) {

		wayBillChrg	  	= wayBillCharges[ChargeTypeMaster.FREIGHT];

		if (wayBillChrg != null) {
			freight			= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.LOADING];

		if (wayBillChrg != null) {
			HAMALI		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.LR_CHARGE];

		if (wayBillChrg != null) {
			lr_charges		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.COLLECTION];

		if (wayBillChrg != null) {
			COLLECTION				= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.DOOR_DELIVERY_BOOKING];

		if (wayBillChrg != null) {
			door_dly					= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.DETENTION_BOOKING];

		if (wayBillChrg != null) {
			DETENTION_BOOKING 	= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];

		if (wayBillChrg != null) {
			other 		= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg		= wayBillCharges[ChargeTypeMaster.CROSSING_BOOKING];

		if (wayBillChrg != null) {
			CROSSING_BOOKING 	= (wayBillChrg.chargeAmount).toFixed();
		}
	}
	
	var Total = 0;
	if(taxPaidBy=="Transporter"){
		Total = Number(freight)+Number(HAMALI)+Number(lr_charges)+Number(COLLECTION)+Number(door_dly)+Number(DETENTION_BOOKING)+Number(other)+Number(CROSSING_BOOKING)+Number(ser_tax);
	}else{
		Total = Number(freight)+Number(HAMALI)+Number(lr_charges)+Number(COLLECTION)+Number(door_dly)+Number(DETENTION_BOOKING)+Number(other)+Number(CROSSING_BOOKING);
	}

	var noOfCharges			= 0;

	$('.freight').append(freight);
	$('.HAMALI').append(HAMALI);
	$('.lr_charges').append(lr_charges);
	$('.COLLECTION').append(COLLECTION);
	$('.door_dly').append(door_dly);
	$('.DETENTION_BOOKING').append(DETENTION_BOOKING);
	$('.other').append(other);
	$('.CROSSING_BOOKING').append(CROSSING_BOOKING);
	$('.ser_tax').append(ser_tax);
	$('.Total').append(Total);
}

function setTaxAmount() {

	if(( wayBillTaxTxn[0] != undefined )) {
		if (wayBillTaxTxn[0].taxAmount != undefined){
			if(taxPaidBy=="Transporter"){
				ser_tax= wayBillTaxTxn[0].taxAmount;
			}else{
				ser_tax= 0;
			}
		}
	}
}

function setGodown() {
	if(wayBill.deliveryTypeId == TransportCommonMaster.DELIVERY_TO_BRANCH_ID) {
		$('.delivery_at').append("Godown"); 

	} else if(wayBill.deliveryTypeId == TransportCommonMaster.DELIVERY_TO_DOOR_ID) {
		$('.delivery_at').append("Door Dly");
	}
}
function setAmountBlanckIfTBBLR(){
	/*setValueToHtmlTag("freight", "");
	setValueToHtmlTag("HAMALI", "");
	setValueToHtmlTag("COLLECTION", "");
	setValueToHtmlTag("lr_charges", "");
	setValueToHtmlTag("door_dly", "");
	setValueToHtmlTag("DETENTION_BOOKING", "");
	setValueToHtmlTag("other", "");
	setValueToHtmlTag("CROSSING_BOOKING", "");
	setValueToHtmlTag("Total", "");*/
	$('.freight').html('');
	$('.HAMALI').html('');
	$('.COLLECTION').html('');
	$('.lr_charges').html('');
	$('.door_dly').html('');
	$('.DETENTION_BOOKING').html('');
	$('.other').html('');
	$('.CROSSING_BOOKING').html('');
	$('.Total').html('');
	$('.ser_tax').html('');
}
