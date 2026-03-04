/**
 * @Author Manish Kumar Singh 26/05/2016
 */
function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/transport/ndt/ndtDeliveryPrint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();

	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {
	
	var delDate = null;
	var bookDate = null;
	var Date 		= (wayBillArray[0].creationDateTimeStamp).substring(0, 16) ;
	var year  		= Date.substring(0,4);
	var month 		= Date.substring(5,7);
	var day	  		= Date.substring(8,10);
	delDate 		= day+"-"+month+"-"+year;
	
	var Date1 		= (wayBillArray[0].bookingDateTime).substring(0, 16) ;
	var year1  		= Date1.substring(0,4);
	var month1 		= Date1.substring(5,7);
	var day1	  	= Date1.substring(8,10);
	bookDate 		= day1+"-"+month1+"-"+year1;
	
	
	var consignee = consigneeHM;
	var consignee_values = new Array();
	var a = new Array();
	for (var key in consignee) {
		consignee_values.push(consignee[key]);
	}
	
	var consignmentSummary = consignmentSummaryHM;
	var consignmentSummary_values = new Array();
	var a = new Array();
	for (var key in consignmentSummary) {
		consignmentSummary_values.push(consignmentSummary[key]);
	}
	var consignmentDetails = consignmentDetailsHM;
	var consignmentDetails_values = new Array();
	var a = new Array();
	for (var key in consignmentDetails) {
		consignmentDetails_values.push(consignmentDetails[key]);
	}
	$('.CrNo').append(dcdArray[0].wayBillDeliveryNumber);
	$('.consigneeName').append(consignee_values[0].name);
	if(dcdArray[0].paymentType == 1){
		$('.paymentType').append('Cash');
	}else if (dcdArray[0].paymentType == 2) {
		$('.paymentType').append('Cheque');
	}else if (dcdArray[0].paymentType == 3) {
		$('.paymentType').append('Short - Credit');
	}
      $('.deliveredTo').append(dcdArray[0].deliveredToName);
      $('.delDate').append(delDate);
      $('.scrBranch').append(wayBillArray[0].sourceBranch);
      $('.destBranch').append(wayBillArray[0].destinationBranch);
      $('.destCity').append(wayBillArray[0].destinationSubRegion);
      $('.lrNo').append(wayBillArray[0].wayBillNumber);   
      $('.bookDate').append(bookDate);
      $('.ArtQnt').append(consignmentSummary_values[0].quantity);
	  $('.type').append(wayBillArray[0].wayBillType);
	

	    
	   
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId+"_"+1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);
			}
		}
	}
	
	
	/*setValueToHtmlTag('FrtAmt', wayBillArray[0].bookingTotal);*/
	$('.saidToCont').append(consignmentDetails_values[0].saidToContain);
	$('.remark').append(wayBillArray[0].remark);
	$('.User').append(executive.name);
	setCharges();
}

function setCharges() {
	var freight			= 0;
	var octroi 			= 0;
	var octroi_exp 		= 0;
	var hamali			= 0;
	var other			= 0;
	var demrage			= 0;
	var door_delivery 	= 0;
	var dly_comm 		= 0;
	var total			= 0;
	var service_chrg	= 0;
	var discount		= 0;
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();
	
	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId+"_"+1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);				
			}	
		}
	}
	
	if(dcdArray[0].settledByBranchId == 17018 || dcdArray[0].settledByBranchId == 17032 || dcdArray[0].settledByBranchId == 17031){
		if(chargeIdWiseAmount != null){
			
			if(Object.keys(chargeIdWiseAmount).length == 0){
				$('.HAMALI_DELIVERY').append(0);
				$('.DILIVERY_COMM').append(0);
				$('.DOOR_DELIVERY').append(0);
				$('.DAMERAGE').append(0);
			}else { 
				for(var key in chargeIdWiseAmount){
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.HAMALI_DELIVERY)){
					hamali = chargeIdWiseAmount[ChargeTypeMaster.HAMALI_DELIVERY];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_COMMISSION)){
						dly_comm = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_COMMISSION];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DOOR_DELIVERY_DELIVERY)){
						door_delivery = chargeIdWiseAmount[ChargeTypeMaster.DOOR_DELIVERY_DELIVERY];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DAMERAGE)){
						demrage = chargeIdWiseAmount[ChargeTypeMaster.DAMERAGE];
					}		
				}
			} 
	
		}
		
		discount		= dcdArray[0].deliveryDiscount;
		if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID){
			freight = 0;
		} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT){
			freight =  0;
		} else if(wayBillArray[0].wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC){
			freight = 0;
		}else {
			freight =  (wayBillArray[0].bookingTotal) - discount;
		}

		total   = Math.round(hamali + dly_comm + door_delivery + demrage + freight);
		createTableRowForIndore('FREIGHT',freight,'chargeTable');
		 console.log(freight);
		createTableRowForIndore('HAMALI_DELIVERY',hamali,'chargeTable');
		createTableRowForIndore('DELIVERY_COMMISSION',dly_comm,'chargeTable');
		createTableRowForIndore('DOOR_DELIVERY_DELIVERY',door_delivery,'chargeTable');
		createTableRowForIndore('DAMERAGE',demrage,'chargeTable');
		$('.TOTAL').append(total);
		//setValueToHtmlTag('TOTAL', total);
		
	}else {
		if(chargeIdWiseAmount != null){
			
			if(Object.keys(chargeIdWiseAmount).length == 0){
				$('.DAMERAGE').append(0);
				$('.OTHER_DELIVERY').append(0);
				$('.OCT_EXP').append(0);
				$('.HAMALI_DELIVERY').append(0);
				$('.DILIVERY_COMM').append(0);
				$('.OCTROI').append(0);
				
			}else { 
				for(var key in chargeIdWiseAmount){
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OTHER_DELIVERY)){
						other = chargeIdWiseAmount[ChargeTypeMaster.OTHER_DELIVERY];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DAMERAGE)){
						demrage = chargeIdWiseAmount[ChargeTypeMaster.DAMERAGE];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OCTROI_EXPENSE)){
						octroi_exp = chargeIdWiseAmount[ChargeTypeMaster.OCTROI_EXPENSE];
					}
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.HAMALI_DELIVERY)){
						hamali = chargeIdWiseAmount[ChargeTypeMaster.HAMALI_DELIVERY];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.DELIVERY_COMMISSION)){
						dly_comm = chargeIdWiseAmount[ChargeTypeMaster.DELIVERY_COMMISSION];
					}
					
					if(chargeIdWiseAmount.hasOwnProperty(ChargeTypeMaster.OCTROI_DELIVERY)){
						octroi = chargeIdWiseAmount[ChargeTypeMaster.OCTROI_DELIVERY];
					}				
				}
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
		
		total   = Math.round(other + dly_comm + hamali+ octroi_exp + demrage + freight+octroi);
		createTableRowForMumbai('FREIGHT',freight,'chargeTable');
		   console.log(freight);
		createTableRowForMumbai('OCTROI',octroi,'chargeTable');
		createTableRowForMumbai('OCTROI_EXP',octroi_exp,'chargeTable');
		createTableRowForMumbai('HAMALI_DELIVERY' ,hamali,'chargeTable');
		createTableRowForMumbai('DLY_COMM',dly_comm,'chargeTable');
		createTableRowForMumbai('DEMRAGE',demrage,'chargeTable');
		createTableRowForMumbai('OTHER', other,'chargeTable');
		
		$('.TOTAL').append(total);
		//setValueToHtmlTag('TOTAL', total);
	}
	$('.discount').append(wayBillArray[0].deliveryDiscount);
	//setValueToHtmlTag('discount', wayBillArray[0].deliveryDiscount);
		
	getTotalAmt();
}

function createTableRowForMumbai(name,value,tableId) {
	var i = 1;
	var chrgName = null;
	var chrgAmt = null;
	tableRow		= createRow(i,'');
	
	chrgName		= createColumnInRow(tableRow, name, '', '75%', 'left', 'padding-right: 50px; line-height: 0px;height: 17px; border-right: 0px solid black;', '');
	chrgAmt			= createColumnInRow(tableRow, name, '', '25%', 'right', 'padding-right: 50px; line-height: 0px;height: 17px; border-right: 0px solid black;', '');
	
	appendValueInTableCol(chrgName, '');
	appendValueInTableCol(chrgAmt, value);
	
	$('.'+tableId).append(tableRow);
	//appendRowInTable(tableId, tableRow);
}

function createTableRowForIndore(name,value,tableId) {
	var i = 1;
	var chrgName = null;
	var chrgAmt = null;
	tableRow		= createRow(i,'');
	
	chrgName		= createColumnInRow(tableRow, name, '', '75%', 'left', 'padding-right: 50px; line-height: 0px;height: 20px; border-right: 0px solid black;', '');
	chrgAmt			= createColumnInRow(tableRow, name, '', '25%', 'right', 'padding-right: 50px; line-height: 0px;height: 20px; border-right: 0px solid black;', '');
	
	appendValueInTableCol(chrgName, '');
	appendValueInTableCol(chrgAmt, value);
	
	$('.'+tableId).append(tableRow);
	//appendRowInTable(tableId, tableRow);
}

function getTotalAmt() {
	var TotalAmt 		= 0;
	var freight			= 0;
	var octroi 			= 0;
	var octroi_exp 		= 0;
	var hamali			= 0;
	var other			= 0;
	var demrage			= 0;
	var door_delivery 	= 0;
	var dly_comm 		= 0;
	var discount		= 0;
	
	//console.log(dcdArray[0].settledByBranchId);
	if(dcdArray[0].settledByBranchId == 17018 || dcdArray[0].settledByBranchId == 17032 || dcdArray[0].settledByBranchId == 17031){
		freight			= getValueFromHtmlTag("FREIGHT");
		hamali			= getValueFromHtmlTag("HAMALI_DELIVERY");
		dly_comm		= getValueFromHtmlTag("DELIVERY_COMMISSION");
		door_delivery	= getValueFromHtmlTag("DOOR_DELIVERY_DELIVERY");
		demrage			= getValueFromHtmlTag("DAMERAGE");

		TotalAmt = (Number(freight)+Number(hamali)+Number(dly_comm)+Number(door_delivery)+Number(demrage));
	}else {
		freight			= getValueFromHtmlTag("FREIGHT");
		octroi 			= getValueFromHtmlTag(ChargeTypeMaster.OCTROI_DELIVERY);
		octroi_exp 		= getValueFromHtmlTag(ChargeTypeMaster.OCTROI_EXPENSE);
		other			= getValueFromHtmlTag(ChargeTypeMaster.OTHER_DELIVERY);
		demrage			= getValueFromHtmlTag(ChargeTypeMaster.DAMERAGE);
		dly_comm 		= getValueFromHtmlTag(ChargeTypeMaster.DELIVERY_COMMISSION);
		
		TotalAmt = (Number(freight)+Number(octroi)+Number(dly_comm)+Number(octroi_exp)+Number(demrage)+Number(other));
	}
	
	// TotalAmt = (Number(FrtAmt)+Number(oct)+Number(octExp)+Number(dem)+Number(other))+Number(serCharge)+Number(delComm);
	 return TotalAmt;
}

