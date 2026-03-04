/**
 * @Author Manish Singh 25-06-16
 */

function printBillWindow() {
	window.resizeTo(0, 0);
	window.moveTo(0, 0);
	$("#tableContain").load("/ivcargo/html/print/waybill/246_waybillprint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

for(var key in  consignmentDetails){
	 key = consignmentDetails[key];
	
}
//Method Calling form CommonFunction.js file
var currentdate1	= getCurrentDate();
var currentdate		= new Date();
var currenttime1 	= currentdate.getHours() + ":" + currentdate.getMinutes();
var grandtotal		= 0;
var wayBillChrg		= null;
var NOT_RECEIVED	= 6;

function setPrintData() {
	setConsignment();
	setCharges();

	var packingTypeName 		= '';
	var sourceBranchAddress		= sourceBranch.address;
	var sourceBranchName		= (sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var sourceBranchMobile		= sourceBranch != null ? ( sourceBranch.mobileNumber) : "&nbsp;";
	var sourceBranchPhone		= sourceBranch != null ? ( sourceBranch.phoneNumber) : "&nbsp;";
	var destinationBranchname	= (destinationBranch.name).length > 15 ? (destinationBranch.name).substring(0, 15).replace("\\s", "&nbsp;&nbsp;") : (destinationBranch.name).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsname	= (consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0, 24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsphone	= consignorDetails != null ? (consignorDetails.phoneNumber) != null ? (consignorDetails.phoneNumber) == ("0000000000") ? " " : " "+consignorDetails.phoneNumber+" ":" ":" ";
	var consigneeDetailsname	= (consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var consigneeDetailsphone	= consigneeDetails != null ? (consigneeDetails.phoneNumber) == ("0000000000") ? " " : " "+consigneeDetails.phoneNumber+" " :" ";
	var wayBillType				= (wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	var consignorTinNo          = (consignorDetails.tinNo) != null ?  consignorDetails.tinNo : "&nbsp;" ;
	var consigneeTinNo          = (consigneeDetails.tinNo) != null ? (consigneeDetails.tinNo) : "&nbsp;" ;
	var invoiceDetails          = (consignmentSummary.invoiceNo) != null ? (consignmentSummary.invoiceNo) : "" ;
	var declaredValue           = (consignmentSummary.declaredValue) != null ? (consignmentSummary.declaredValue)  : "";
	var issuingOffice           = (sourceBranch.displayName) != null ? sourceBranch.displayName : "" 
	var actualWeight            = (consignmentSummary.actualWeight) != null ? consignmentSummary.actualWeight : "" ;
	var deliveryAt              = (destinationBranch.address) != null ? destinationBranch.address : "" ;
	var quantity                = (consignmentSummary.quantity) != null ? consignmentSummary.quantity : "" ;
//	var packingTypeName         = (consignmentDetails[0].packingTypeName != null) ? consignmentDetails[0].packingTypeName : "" ;
	var consigneePhNo           = (wayBill.consigneePhoneNumber) != null ? wayBill.consigneePhoneNumber : "" ;
	var consignorPhNo           = (consignorDetails.mobileNumber) != null ? consignorDetails.mobileNumber : "" ;
	var basisOfBooking          = (WayBillType.WAYBILL_TYPE_NAME_TOPAY) != null ? WayBillType.WAYBILL_TYPE_NAME_TOPAY : "" ;
	var privateMarka            = (consignmentSummary.privateMarka) != null ? consignmentSummary.privateMarka : "" ;
	var serviceTax              = (wayBillTaxTxn.taxName) != null ? wayBillTaxTxn.taxName : "" ;
	var chargeWeight            = (consignmentSummary.chargeWeight) != null ? consignmentSummary.chargeWeight : "" ;
	var roadPermitNumber		= (consignmentSummary.roadPermitNumber) != null ? consignmentSummary.roadPermitNumber : "&nbsp;" ;
	//var freightUptoBranchName   = (consignmentSummary.freightUptoBranchName) != null ? consignmentSummary.freightUptoBranchName : "" ;
	var address  				= destinationBranch != null ? ( destinationBranch.address) : "&nbsp;";
	var exciseInvoice			= consignmentSummary != null ? ( consignmentSummary.exciseInvoice == 1 ?'YES' : 'NO' ) : "&nbsp;";
	var consignmentInsured		= consignmentSummary != null ? ( consignmentSummary.consignmentInsured == 1 ?'YES' : 'NO' ) : "&nbsp;";
	var CT_FORM_TYPE			= consignmentSummary.formTypeId;
	var remark					= wayBill.remark;
	var typeOfLocation		    = destinationBranch.typeOfLocation != null ?destinationBranch.typeOfLocation == Branch.TYPE_OF_LOCATION_PHYSICAL? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;":destinationBranch.displayName  : "&nbsp;";
	
	var newDestinationAddress 	= null;
	var newConsigneeName		= null;
	var Date 					= (wayBill.bookingDateTime).substring(0, 16) ;
	var year  =Date.substring(0,4);
	var month = Date.substring(5,7);
	var day	  = Date.substring(8,10);
	var bookingDate				= day+"-"+month+"-"+year;
	console.log(bookingDate);
	
	var length					= address.length;

	if(length > 40) {
		newDestinationAddress	= address.substring(0, length/3);
		newDestinationAddress   = newDestinationAddress	+" <br/>"+ address.substring((length/3), (length/3)*2);
		newDestinationAddress   = newDestinationAddress	+" <br/>"+ address.substring((length/3)*2, length);
		
	} else {
		newDestinationAddress	= address;
	}
	  $('.sourceBranchPhone').append(sourceBranchPhone);
	  $('.sourceBranchAddress').append(sourceBranchAddress);
	  $('.remark').append(remark);
	  $('.typeOfLocation').append(typeOfLocation);
	  $('.address').append(newDestinationAddress);
	  $('.sourceBranchMobile').append(sourceBranchMobile);
	  $('.roadPermitNumber').append(roadPermitNumber);
	  $('.chargeWeight').append(chargeWeight);
	  $('.consignorPhNo').append(consignorPhNo);
	  $('.consigneePhNo').append(consigneePhNo);
	  $('.packingTypeName').append(packingTypeName);
	  $('.frombranch').append(sourceBranchName);
	  $('.tobranch').append(destinationBranchname);
	  $('.wayBillNumber').append(wayBill.wayBillNumber);
	  $('.wayBillType').append(wayBillType);
	  $('.crtdate').append(currentdate1);
	  $('.crttime').append(currenttime1);
	  $('.actualWeight').append(actualWeight);
	  $('.deliveryAt').append(deliveryAt);
	  $('.issuingOffice').append(issuingOffice);
	  $('.saidToContain').append(consignmentSummary.saidToContain);
	  $('.invoiceDetails').append(invoiceDetails);
	  $('.declaredValue').append(declaredValue);
	  $('.consignorTinNo').append(consignorTinNo);
	  $('.consigneeTinNo').append(consigneeTinNo);
	  $('.consignorDetails').append(consignorDetailsname);
	  $('.consignorDetailsphone').append(consignorDetailsphone);
	  $('.consigneeDetailsname').append(consigneeDetailsname);
	  $('.bookingDate').append(bookingDate);
	  
	  for(i=0; i<consignmentDetails.length;i++){
		  var concat = null;
		  if(i<consignmentDetails.length-1){
			   concat = " / "
		  }
		  else {
			  concat = " ) "
		  }
		  packingTypeName += consignmentDetails[i].packingTypeName+concat;
	  }
	  $('.pkg').append(quantity+" ( "+packingTypeName);
	   console.log(quantity+" ( "+packingTypeName);
	   
	var consineeLen		= consigneeDetailsname.length;
	if(consineeLen > 25) {
		newConsigneeName	= consigneeDetailsname.substring(0, consineeLen/3);
		newConsigneeName   	= newConsigneeName	+" <br/>"+ consigneeDetailsname.substring((consineeLen/3), (consineeLen/3)*2);
		newConsigneeName   	= newConsigneeName	+" <br/>"+ consigneeDetailsname.substring((consineeLen/3)*2, consineeLen);
	} else {
		newConsigneeName	= consigneeDetailsname;
	}
	$('.consigneeDetails').append(newConsigneeName);
	$('.consigneePhoneNo').append(consigneeDetailsphone);
	$('.privateMarka').append(privateMarka);
	$('.exciseInvoice').append(exciseInvoice);
	$('.consignmentInsured').append(consignmentInsured);
	$('.bookedByName').append(bookedByName);

	 $('.grandTotal').append((wayBill.grandTotal != null) ? (wayBill.grandTotal).toFixed(): " ");
	if(wayBillTaxTxn.length > 0) {
		for(var i = 0; i < wayBillTaxTxn.length; i++) {
			$('.taxAmount').append((wayBillTaxTxn[i].taxAmount != null) ? wayBillTaxTxn[i].taxAmount : 0);
		}
	} else {
		$('.taxAmount').append(0);
	}	
	
	if(CT_FORM_TYPE == NOT_RECEIVED) {
		$('.star').append( '***');
	}
	
	bookingtype();
	tobepaidby();
	setDeliveryandTaxes();
}

function bookingtype() {
	if(consignmentSummary.bookingTypeId != null) {
		if(consignmentSummary.bookingTypeId == TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID) {
			$('.bookingTypeId').append(TransportCommonMaster.BOOKING_TYPE_SUNDRY_NAME);
		} else if (consignmentSummary.bookingTypeId == TransportCommonMaster.BOOKING_TYPE_FTL_ID) {
			$('.bookingTypeId').append(TransportCommonMaster.BOOKING_TYPE_FTL_NAME);
		} else if (consignmentSummary.bookingTypeId == 3) {
			$('.bookingTypeId').append(DirectDeliveryDirectVasuli);
		}
	}
}

function tobepaidby() {
	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_TRANSPORTER_ID) {
		$('.staxPaidBy').append( "  " + "TRANSPORTER");
	}
	
	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_CONSINGOR_ID) {
		$('.staxPaidBy').append("  " + "CONSINGOR");
	}
 
	if(consignmentSummary.taxBy == TransportCommonMaster.TAX_PAID_BY_CONSINGEE_ID) {
		$('.staxPaidBy').append( "  " + "CONSINGEE");
	}
}

function setConsignment() {

	if(consignmentDetails != null ) {
		for(var i = 0; i < 3; i++) {
			if(i < consignmentDetails.length) {
				
				if(i == 0) {
					tableRow			= createRowInTable(i, '');
					quantityCol			= createColumnInRow(tableRow, i, '', '15%', 'center', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
					packingTypeCol		= createColumnInRow(tableRow, i+10, '', '15%', 'center', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
					saidToContain		= createColumnInRow(tableRow, i+100, '', '70%', 'center', 'padding-top: 1px; border-right: 0px solid black;', '');

					appendValueInTableCol(quantityCol, consignmentDetails[i].quantity);
					appendValueInTableCol(packingTypeCol, consignmentDetails[i].packingTypeName);
					appendValueInTableCol(saidToContain, consignmentDetails[i].saidToContain);

					appendRowInTable('consignmentSummaryquantity', tableRow);
				} else {
					tableRow			= createRowInTable(i, '');
					quantityCol			= createColumnInRow(tableRow, i, '', '15%', 'center', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
					packingTypeCol		= createColumnInRow(tableRow, i+10, '', '15%', 'center', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
					saidToContain		= createColumnInRow(tableRow, i+100, '', '70%', 'center', 'padding-top: 1px; border-right: 0px solid black;', '');

					appendValueInTableCol(quantityCol, consignmentDetails[i].quantity);
					appendValueInTableCol(packingTypeCol, consignmentDetails[i].packingTypeName);
					appendValueInTableCol(saidToContain, consignmentDetails[i].saidToContain);

					appendRowInTable('consignmentSummaryquantity', tableRow);
				}
				
			} else {
				tableRow		= createRow(i, '');

				blankCol1		= createColumnInRow(tableRow, i, '', '', 'left', 'padding-top: 1px; height:20px;', '');
				spaceCol		= createColumnInRow(tableRow, i+10, '', '10%', '', 'padding-top: 1px; padding-left: 7px;', '');
				blankCol3		= createColumnInRow(tableRow, i+100, '', '10%', '', '', '');
				blankCol4		= createColumnInRow(tableRow, i+100, '', '6%', 'Right', 'padding-right: 10px;', '');

				appendValueInTableCol(blankCol1, '');
				appendValueInTableCol(spaceCol, '&nbsp;');
				appendValueInTableCol(blankCol3, '');
				appendValueInTableCol(blankCol4, '');

				appendRowInTable('consignmentSummaryquantity', tableRow);
			}
		}
	}		
}


function setCharges() {

	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.FREIGHT)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];
		$('.FREIGHT').append((wayBillChrg.chargeAmount).toFixed());
	} else {
		$('.FREIGHT').append(0);
	}


	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.HAMALI)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.HAMALI];
		$('.HAMALI').append( (wayBillChrg.chargeAmount).toFixed());
	} else {
		$('.HAMALI').append(0);
	}


	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.STATIONARY_CHARGE	)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.STATIONARY_CHARGE	];
		$('.STATIONARY_CHARGE').append( (wayBillChrg.chargeAmount).toFixed());
	} else {
		$('.STATIONARY_CHARGE').append(0);
	}
	

	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.DOOR_PICKUP)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_PICKUP];
		$('.DOOR_PICKUP').append((wayBillChrg.chargeAmount).toFixed());
		 
	} else {
		$('.DOOR_PICKUP').append(0);

}
	

	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.DOOR_DELIVERY_BOOKING)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DELIVERY_BOOKING];
		$('.DOOR_DELIVERY_BOOKING').append((wayBillChrg.chargeAmount).toFixed());
		 
	} else {
		$('.DOOR_DELIVERY_BOOKING').append(0);
	}
	
	
	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.OTHER_BOOKING)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];
		$('.OTHER_BOOKING').append((wayBillChrg.chargeAmount).toFixed());
		 
	} else {
		$('.OTHER_BOOKING').append(0);
	}
	
	
	if(wayBillCharges.hasOwnProperty(ChargeTypeMaster.CASH_REFUND)){
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.CASH_REFUND];
		$('.CASH_REFUND').append((wayBillChrg.chargeAmount).toFixed());
		 
	} else {
		$('.CASH_REFUND').append(0);
	}
	
}


function setDeliveryandTaxes() {
	if(freightUptoBranch != null) {
		if(freightUptoBranch.typeOfLocation == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
			delivery	=	freightUptoBranch.name;
		} else {
			if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_DOOR_ID) {
				delivery	=	"DOOR &nbsp;" + freightUptoBranch.name.toUpperCase() ;
			} else if(consignmentSummary.deliveryTo == TransportCommonMaster.DELIVERY_TO_BRANCH_ID) {
				delivery	=	"GODOWN &nbsp;" + freightUptoBranch.name.toUpperCase() ;
			}
		}
	}

	var taxAmnt			= 0;
	var unaddedTax		= 0;
	var taxBy 			= "";
	
	for(var i = 0; i < wayBillTaxTxn.length; i++) {
		taxAmnt		=	wayBillTaxTxn[i].taxAmount;
		unaddedTax	=	wayBillTaxTxn[i].unAddedTaxAmount;
	}
	
	grandtotal = Number(grandtotal) + Number(taxAmnt);
	
	taxBy = (taxPaidBy) == ("--") ? "NA" : taxPaidBy;

	var taxamt	= taxAmnt > 0 ? (taxAmnt).toFixed() :"&nbsp;";

	delivery	+= '<span style="float: right; ">'+ taxamt +'</span>';

	var taxdis	= taxBy + (unaddedTax > 0 ? "&nbsp;(&nbsp;"+(unaddedTax).toFixed()+"/-&nbsp;)&nbsp;" : " ");

	taxes	=	'<span style="padding-right: 200px;">'+ taxdis +'</span>';

	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT) {
		grandtotal	=	'TBB';
	} else {
		grandtotal = Number(grandtotal) + Number(wayBillChrg.chargeAmount);
	}
}