/**
 * @Author Manish Kumar Singh 12/07/2016
 */
/*function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/print/delivery/239_delivery.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();

	});
}

function printAfterDelay() {
	window.print();
	window.close();
}*/

function setPrintData() {

	var delDate	 		= getDateInDMYFromTimestamp(wayBillArray[0].creationDateTimeStamp);
	var bookDate 		= getDateInDMYFromTimestamp(wayBillArray[0].bookingDateTime);
	var receivedDate 	= getDateInDMYFromTimestamp(receivedSummary.wayBillReceivedTime);

	var consignee = consigneeHM;
	var consignee_values = new Array();
	
	for (var key in consignee) {
		consignee_values.push(consignee[key]);
	}

	var consignmentSummary = consignmentSummaryHM;
	var consignmentSummary_values = new Array();

	for (var key in consignmentSummary) {
		consignmentSummary_values.push(consignmentSummary[key]);
	}
	
	var consignmentDetails = consignmentDetailsHM;
	var consignmentDetails_values = new Array();

	for (var key in consignmentDetails) {
		consignmentDetails_values.push(consignmentDetails[key]);
	}
	console.log("allllll",wayBillArray[0])
	$('.receivedDate').append(receivedDate);
	$('.CrNo').append(dcdArray[0].wayBillDeliveryNumber);
	$('#crId').val(dcdArray[0].crId);
	$('.consigneeName').append(consignee_values[0].name);
	$('.deliveredTo').append(dcdArray[0].deliveredToName);
	$('.deliveredToNumber').append(dcdArray[0].deliveredToNumber);
	$('.delDate').append(delDate);
	$('.scrBranch').append(wayBillArray[0].sourceBranch+"( "+wayBillArray[0].sourceSubRegion+" )");
	$('.destBranch').append(wayBillArray[0].destinationBranch+" ( "+wayBillArray[0].destinationSubRegion+")");
	$('.destCity').append(wayBillArray[0].destinationSubRegion);
	$('.lrNo').append(wayBillArray[0].wayBillNumber);   
	$('.bookDate').append(bookDate);
	$('.ArtQnt').append(consignmentSummary_values[0].quantity);
	$('.type').append(wayBillArray[0].wayBillType);
	$('.saidToCont').append(consignmentDetails_values[0].saidToContain);
	$('.remark').append(wayBillArray[0].remark);
	$('.User').append(executive.name);
	$('.Address').append(deliveryBranch.address);
	$('.Number').append(wayBillArray[0].phoneNumber);
	setCharges();
	setSaidToContain();
	getWeight();
}

function setCharges() {
	var freight			= 0;
	var godownIns 		= 0;
	var hamali			= 0;
	var other			= 0;
	var demrage			= 0;
	var door_delivery 	= 0;
	var comm 			= 0;
	var total			= 0;
	var discount		= 0;
	var deliveryTimeTax = 0;

	for(var key in chargeIdWiseAmount){

		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.HAMALI_DELIVERY)){
			hamali = chargeIdWiseAmount[ChargeTypeMaster.HAMALI_DELIVERY];
		}
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DAMERAGE)){
			demrage = chargeIdWiseAmount[ChargeTypeMaster.DAMERAGE];
		}
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.GODOWN_INSURANCE)){
			godownIns = chargeIdWiseAmount[ChargeTypeMaster.GODOWN_INSURANCE];
		}	
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY)){
			door_delivery = chargeIdWiseAmount[ChargeTypeMaster.DOOR_DELIVERY_DELIVERY];
		}	
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.COMMISSION_DELIVERY)){
			comm = chargeIdWiseAmount[ChargeTypeMaster.COMMISSION_DELIVERY];
		}
		if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OTHER_DELIVERY)){
			other = chargeIdWiseAmount[ChargeTypeMaster.OTHER_DELIVERY];
		}
	}

	if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID){
		freight = 0;
	} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
		freight = 0;
	} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC){
		freight = 0;
	}else {
		freight =  (wayBillArray[0].bookingTotal) - discount;
	}

	discount		= dcdArray[0].deliveryDiscount;
	deliveryTimeTax	= dcdArray[0].deliveryTimeTax;

	total   = Math.round(other + comm + hamali + demrage + freight + godownIns + door_delivery - discount + deliveryTimeTax);
	$('.freight').append(freight);
	$('.TOTAL').append(total);
	$('.discount').append(wayBillArray[0].deliveryDiscount);
	$('.hamali').append(hamali);
	$('.demrage').append(demrage);
	$('.godownIns').append(godownIns);
	$('.door_delivery').append(door_delivery);
	$('.comm').append(comm);
	$('.other').append(other);
	$('.gst').append(deliveryTimeTax);
	if(deliveryTimeTax > 0){
		$('.gstdata').css('display','block');
	}
}

function setSaidToContain(){
	var qty ='';
	var paking ='';
	var saidTCont = null;
	for(i=0; i<consignmentDetailsHM.length;i++){
		qty				=  consignmentDetailsHM[i].quantity
		packingTypeName = consignmentDetailsHM[i].packingTypeName;
		saidTCont		=   consignmentDetailsHM[i].saidToContain;
		paking  		= qty+" "+packingTypeName+" of "+saidTCont;
		$('.saidToContain').append('<tr><td>'+paking+'</td></tr>');
	}
}
function getWeight() {
	var weight = 0;
	for(var key in consignmentSummaryHM) {
		weight += consignmentSummaryHM[key].actualWeight;
	}

	$('.weight').append(weight);
}
