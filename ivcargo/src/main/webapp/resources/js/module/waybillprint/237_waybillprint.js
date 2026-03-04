var wayBillChrg		= null;
var delivery		= "";

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	$("#tableContain").load( "/ivcargo/html/print/waybill/237_waybillprint.html", function() {
		window.setTimeout(printAfterDelay, 5000);	
		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {

	var	sourceBranchname 		= 	(sourceBranch.name).length > 15 ? (sourceBranch.name).substring(0,15).replace("\\s", "&nbsp;&nbsp;") : sourceBranch.name.replace("\\s", "&nbsp;&nbsp;");
	var destinationBranchname	=	(destinationBranch.name).length > 15 ? (destinationBranch.name).substring(0,15).replace("\\s", "&nbsp;&nbsp;") : (destinationBranch.name).replace("\\s", "&nbsp;&nbsp;");
	var consignorDetailsname	=	(consignorDetails.name).length < 25 ? consignorDetails.name : (consignorDetails.name).substring(0,24).replace("\\s", "&nbsp;&nbsp;")+"-<br/>-"+(consignorDetails.name).substring(24).replace("\\s", "&nbsp;&nbsp;");
	var consigneeDetailsname	=	(consigneeDetails.name).replace("\\s","&nbsp;&nbsp;");
	var waybilltypetext			=	(wayBill.wayBillTypeId) == WayBill.WAYBILL_TYPE_CREDIT ? "TBB" : (wayBill.wayBillType).toUpperCase().replace("\\s", "");
	
	if ( wayBill.wayBillTypeId == WayBill.WAYBILL_TYPE_PAID ) {
		if ( consignmentSummary.paymentType == TransportCommonMaster.PAYMENT_TYPE_CASH_ID){
			waybilltypetext	 ;
		} else if ( consignmentSummary.paymentType == TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID){
			waybilltypetext ;
		}
	}


	$('.wayBillNumber').append(wayBill.wayBillNumber);
	$('.creationdate').append(date(wayBill.creationDateTimeStamp,"-"));
	$('.consignorDetails').append( consignorDetailsname);
	$('.consigneeDetails').append(consigneeDetailsname);
	$('.consignorAddress').append(consignorDetails.address);
	$('.consigneeAddress').append(consigneeDetails.address);
	$('.srcbranch').append( sourceBranchname );
	$('.destbranch').append(destinationBranchname );
	$('.waybilltype').append(waybilltypetext);
	$('.quantity').append(consignmentSummary.quantity);
	$('.actualweight').append(consignmentSummary != null ? (consignmentSummary.actualWeight).toFixed() :"&nbsp;");
	$('.amount').append(wayBill.amount);	
	$('.remark').append(wayBill.remark);
	$('.quantityweight').append(consignmentSummary.quantity+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+consignmentSummary.actualWeight);
	$('.amountwaybilltype').append(wayBill.amount +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+waybilltypetext );
}


function resetPrint() {
	$('#wayBillNumber').html('');
	$('#creationdate').html('');
	$('#srcbranch').html('');
	$('#destbranch').html('');
	$('#freightUptoBranch').html('');
	$('#consignorDetails').html('');
	$('#consigneeDetails').html('');
	$('#waybilltype').html('');
	$('#consignmentSummaryquantity').empty();
	$('#consignmentSummarydetails').empty();
	$('#invoiceno').html('');
	$('#chargeweight').html('');
	$('#actualweight').html('');
	$('#declaredvalue').html('');
	$('#FREIGHT').html('');
	$('#HAMALI').html('');
	$('#LR_CHARGE').html('');
	//$('#CARTAGE_CHARGE').html('');
	$('#COLLECTION').html('');
	$('#DOOR_DELIVERY_BOOKING').html('');
	$('#DETENTION_BOOKING').html('');
	$('#OTHER_BOOKING').html('');
	$('#CROSSING_BOOKING').html('');
	$('#freightUptoBranchdelivery').html('');
	$('#taxes1').html('');
	$('#grandtotal').html('');
	$('#executivename').html('');
}