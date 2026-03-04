/**
 * @Author Ashish Tiwari 27/04/2016
 */
var autoChrg = 0;
var Total	= 0;
var isChargedWtAllowOnCR = false;
//Method Calling form CommonFunction.js file

function printBillWindow() {
	hideDialog();
	window.resizeTo(0,0);
	window.moveTo(0,0);

	$("#tableContain").load( "/ivcargo/html/print/delivery/399_deliveryprint.html", function() {
		window.setTimeout(printAfterDelay, 500);
		autoChrg = getValueFromInputField('autoCharge');
		setPrintData();
		
	});
}

function showDialogForAutoChargeInput() {
	if(showAutoCharge){
		$("#autoChargeNameString").html(autoChargeNameString);
		$("#companyNameOverlay").show();
		$("#companyNameDialog").fadeIn(300);
		$('#autoCharge').focus();
		
	} else {
		printBillWindow();
	}
}

function hideDialogForAutoChargeInput(){
	hideDialog();
	//printBillWindow();
	window.close();
}

function hideDialog(){
	$("#companyNameOverlay").hide();
	$("#companyNameDialog").fadeOut(0);
}

function printAfterDelay() {
	window.print();
	window.close();
}



function setPrintData() {
	$('.User').append(executive.name);
	setConsignment();
	setLrToTable();
	setCharges();
	setStPaidBy();
}

function setConsignment() {

	var tableRow		= null;
	var packingTypeCol	= null;
	var blankCol1		= null;
	var blankCol2		= null;
	var blankCol3		= null;
	var blankCol4		= null;
	var blankCol5		= null;
	var amountCol		= null;
	var totalAmtCol		= null;
	var spaceCol		= null;
	var LrNo			= null;
	var BkgDt			= null;
	var ArrDt			= null;
	var Art				= null;
	var From			= null;
	var FrtAmt			= null;
	var discount		= 0;
	var pendingShort	= 0;
	var wbIdWiseBookChgs_values = null;

	discount		= dcdArray[0].deliveryDiscount;
	$('.discount').append(discount);
	taxBy			= dcdArray[0].taxBy;
	//if(dcdArray[0].deliveryTimeTax > 0){
		if(taxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID){
			$('.taxBy').append(TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME);	
		}
		if(taxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID){
			$('.taxBy').append(TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME);	
		}
		if(taxBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID){
			$('.taxBy').append(TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME);	
		}
	//}
	
	var consignee = consigneeHM;
	var consignee_values = new Array();

	for (var key in consignee) {
		consignee_values.push(consignee[key]);
	}
	$('.consigneeName').append(consignee_values[0].name);
	$('.consigneeGSTN').append(consignee_values[0].gstn);
	$('.wayBillType').append(wayBillArray[0].wayBillType);
	
	var consignor = consignorHM;
	var consignor_values = new Array();
	
	for(var key in consignor){
		consignor_values.push(consignor[key]);
	}
	$('.consignorName').append(consignor_values[0].name);
	$('.consignorGSTN').append(consignor_values[0].gstn);
	
	if(wayBillArray != null ) {

		for(var i = 0; i <1;i++){
			if(isRePrint){
				$('.CrNo').append(dcdArray[i].wayBillDeliveryNumber +" ( Duplicate )" );
			}else{
				$('.CrNo').append(dcdArray[i].wayBillDeliveryNumber);
			}
			
			if(lastGoDownUnload != undefined) {
				$('.godownName').append(lastGoDownUnload.godownName);
			} else {
				$('.godownName').append("--");
			}
			if(dcdArray[i].paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
				$('.paymentType').append("Due");
			} else {
				$('.paymentType').append(dcdArray[i].paymentTypeName);
			}
			var delDate =	getDateInDMYFromTimestamp( (wayBillArray[i].deliveryDateTime));
			$('.delDate').append(delDate);
			isChargedWtAllowOnCR = dcdArray[i].chargedWtAllowOnCR;
		}

		var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
		wbIdWiseBookChgs_values = new Array();

		for(var i = 0; i < wayBillArray.length; i++) {
			for (var key in wbIdWiseBookChgs) {
				if( key == wayBillArray[i].wayBillId+"_"+1) {
					wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);
				}
			}
		}
		
		for (var i = 0; i < shortReceiveArticlesArr.length; i++) {
			pendingShort = pendingShort + shortReceiveArticlesArr[i].pendingShort;
		}

		for(var i = 0; i < wayBillArray.length; i++) {
			var freight = 0;
			if(i < wayBillArray.length) {
				var consignmentSummary = consignmentSummaryHM;
				var consignmentSummary_values = new Array();
				var a = new Array();
				for (var key in consignmentSummary) {
					consignmentSummary_values.push(consignmentSummary[key]);
				}

				tableRow		= createRow(i,'');

				LrNo	= createColumnInRow(tableRow, i, '', '', 'center', 'font-weight: bold', '');
				BkgDt	= createColumnInRow(tableRow, i, '', '', 'center', '', '');			
				ArrDt	= createColumnInRow(tableRow, i, '', '', 'center', '', '')			
				Art		= createColumnInRow(tableRow, i, '', '', 'center', '', '')		
				From	= createColumnInRow(tableRow, i, '', '', 'center', '', '')			
				FrtAmt	= createColumnInRow(tableRow, i, '', '', 'right', 'padding-right: 15px', '')

				appendValueInTableCol(LrNo,  (wayBillArray[i].wayBillNumber));
				var bookDate = getCustomDateInDMYFromTimestamp((wayBillArray[i].bookingDateTime));
				appendValueInTableCol(BkgDt,  (bookDate));
				var ArrDate = '';
				if(lastGoDownUnload != undefined) {
					ArrDate = getCustomDateInDMYFromTimestamp(lastGoDownUnload.creationDateTime);
				}
				appendValueInTableCol(ArrDt,  (ArrDate));
				appendValueInTableCol(Art,  (consignmentSummary_values[i].quantity));
				appendValueInTableCol(From,  (wayBillArray[i].sourceBranchCode));

				if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) {
					freight = freight + 0;
				} else if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT) {
					freight = freight + 0;
				} else if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC) {
					freight = freight + 0;
				} else {
					freight = freight + totalBookingTotal;
				}

				appendValueInTableCol(FrtAmt,  Math.round(freight));

				$('.shortArticle').append(pendingShort);
				$('.LrDetailsTable').append(tableRow);
			} else {
				tableRow		= createRow(i,'');

				blankCol1		= createColumnInRow(tableRow, i, '', '', 'left', 'padding-top: 1px; height:20px; width:20%;', '');
				spaceCol		= createColumnInRow(tableRow, i+10, '', '10%', '', 'padding-top: 1px; padding-left: 7px;  width:80%;', '');

				appendValueInTableCol(blankCol1, '');
				appendValueInTableCol(spaceCol, '&nbsp;');
				$('.consignmentSummaryquantity').append(tableRow);
			}
		}
	}		
	
	$('.deliverToName').append((dcdArray[0].deliveredToName).substring(0, 15));
	$('.deliverToNumber').append(dcdArray[0].deliveredToNumber);
	$('.crttime').append(currentDateTime);
}

function setLrToTable() {

	var tableRow		= null;
	var LrNo			= null;
	var PvtMrk			= null;
	var WtChrg			= null;

	if(wayBillArray != null ) {
		for(var i = 0; i < wayBillArray.length; i++) {
			var consignmentSummary = consignmentSummaryHM;
			var consignmentSummary_values = new Array();
			var a = new Array();
			for (var key in consignmentSummary) {
				consignmentSummary_values.push(consignmentSummary[key]);
			}
			tableRow		= createRow(i,'');

			LrNo		= createColumnInRow(tableRow, i, '', '', 'left', '', '');
			PvtMrk		= createColumnInRow(tableRow, i, '', '', 'left', 'font-weight: bold', '');			
			WtChrg		= createColumnInRow(tableRow, i, '', '', 'left', '', '')			

			if(consignmentSummary_values[i].privateMarka != null){
				appendValueInTableCol(PvtMrk,  (consignmentSummary_values[i].privateMarka));	
				$('.pvtmarka').append((consignmentSummary_values[i].privateMarka));
			}else{
				appendValueInTableCol(PvtMrk,  "-----");
				$('.pvtmarka').append("-----");
			}
			if(!isChargedWtAllowOnCR) {
				$(".chargedWt").removeClass("hide");
				appendValueInTableCol(WtChrg,  (consignmentSummary_values[i].chargeWeight));
				$('.chargeWeight').append((consignmentSummary_values[i].chargeWeight));
				$('.LrDetailsTable2').append(tableRow);
			}
		}
	}
}

function setCharges() {

	var hamali	= 0;
	 Total	= 0;
	var wbIdWiseBookChgs   = wbIdWiseBookChgsHM;
	wbIdWiseBookChgs_values = new Array();

	for(var i = 0; i < wayBillArray.length; i++) {
		for (var key in wbIdWiseBookChgs) {
			if( key == wayBillArray[i].wayBillId+"_"+1) {
				wbIdWiseBookChgs_values.push(wbIdWiseBookChgs[key]);

				if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID) {
					Total = Total + 0;
				} else if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT) {
					if(dcdArray[0].paymentType == 4) {
						Total = Total + totalBookingTotal;
					} else {
						Total = Total + 0;
					}
				} else if(wayBillArray[i].wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC) {
					Total = Total + 0;
				} else {
					Total = Total + totalBookingTotal;
				}  
			}	
		}
	}
	
	$('.Total').append(Math.round(Total));
	for(var key in chargeIdWiseAmount){
		if(key == ChargeTypeMaster.HAMALI_DELIVERY){
			$('.HAMALI_DELIVERY').append(chargeIdWiseAmount[key]);
		}else if (key == ChargeTypeMaster.GR_DELIVERY) {
			$('.GR_DELIVERY').append(chargeIdWiseAmount[key]);
		} else if (key == ChargeTypeMaster.GI_DLY) {
			$('.GI_DELIVERY').append(chargeIdWiseAmount[key]);
		}else if (key == ChargeTypeMaster.C_CHARGES_DELIVERY) {
			$('.C_CHARGE').append(chargeIdWiseAmount[key]);
		}else if (key == ChargeTypeMaster.DAMERAGE) {
			$('.DAMERAGE').append(chargeIdWiseAmount[key]);
		}else if (key == ChargeTypeMaster.DOOR_DELIVERY_DELIVERY) {
			$('.DOOR_DELIVERY_DELIVERY').append(chargeIdWiseAmount[key]);
		}else if (key == ChargeTypeMaster.STATIONARY) {
			$('.STATIONARY').append(chargeIdWiseAmount[key]);
		}else if(key == ChargeTypeMaster.CTO_DELIVERY){
			$('.CTO_DELIVERY').append(chargeIdWiseAmount[key]);
		}
	}
	$('.AUTO_DELIVERY').append(autoChrg);
	getTotalAmt();
	//setTimeout(removeChargesWithZero, 200);
}
function getTotalAmt() {
	var TotalAmt = 0;
	var total = 0;
	var hamali	= 0;
	var gr	= 0;
	var gi	= 0;
	var ccharge	= 0;
	var dem	= 0;
	var DoorDel	= 0;
	var stat	= 0;
	var discount = 0;
	var cto = 0;
	var netAmount = 0;

	total		= getValueFromHtmlTag("Total");
	hamali		= getValueFromHtmlTag("HAMALI_DELIVERY");
	gr			= getValueFromHtmlTag("GR_DELIVERY");
	gi			= getValueFromHtmlTag("GI_DELIVERY");
	ccharge		= getValueFromHtmlTag("C_CHARGE");
	dem			= getValueFromHtmlTag("DAMERAGE");
	DoorDel		= getValueFromHtmlTag("DOOR_DELIVERY_DELIVERY");
	stat		= getValueFromHtmlTag("STATIONARY");
	cto 		= getValueFromHtmlTag("CTO_DELIVERY");
	discount	= getValueFromHtmlTag("discount");

	TotalAmt = Number(total)+Number(hamali)+Number(gr)+Number(gi)+Number(ccharge)+Number(dem)+Number(DoorDel)+Number(stat)+Number(cto)+Number(Math.round(dcdArray[0].deliveryTimeTax));
		 
	//TotalAmt = totalDeliveryTotal+total;
	$('.SERVICE_TAX').append(Math.round(dcdArray[0].deliveryTimeTax));
	
	if(autoChrg > 0){
		$('.TotalAmt').append(Math.round(Number(totalDeliveryChargeSum + totalDeliveryTimeTax)+Number(autoChrg)));
	} else {
		$('.TotalAmt').append(Math.round(totalDeliveryChargeSum + totalDeliveryTimeTax));
	}
	
	if(autoChrg > 0){
		$('.NetAmount').append(Math.round(Number(totalDeliveryTotal+Total)-Number(discount)+Number(autoChrg)));
		netAmount = Math.round(Number(totalDeliveryTotal+Total)-Number(discount)+Number(autoChrg));
	} else {
		$('.NetAmount').append(Math.round((totalDeliveryTotal+Total)-discount));
		netAmount = Math.round((totalDeliveryTotal+Total)-discount);
	}
	
	var  word = convertNumberToWord(Math.round(netAmount));

	$('.NumToWord').append("Rs. "+word + " ONLY");
	$('.destBranch').append(deliveryBranch.address);
	
	/*if((typeof srcBranch !== 'undefined' && srcBranch != undefined && srcBranch.regionId == 404) && deliveryBranch.regionId == 268){
		$('.companyName').append('NM LOGISTICS');
	} else {
		$('.companyName').append('BATO LOGISTICS');
	}*/
	
	if((typeof srcBranch !== 'undefined' && srcBranch != undefined && (srcBranch.subRegionId == 2880 || srcBranch.subRegionId == 4308))
			&& deliveryBranch.regionId == 770){
		$('.companyName').append('AGT LOGISTICS');
	} else {
		$('.companyName').append(companyHeader);
	}
	
}

function removeChargesWithZero() {
	// Run function for each tbody tr
	$("#chargesTable tbody tr").each(function() {
		var trToRemove	= $(this).closest('tr');
		// Within tr we find the last td child element and get content
		var value	=	$(this).find("td:last-child").html();
		if(value !='' || value != undefined){
			if(value == 0){
				trToRemove.remove();
			}
		}
	});

}
function onEnterKeyEvent(event){
	if(event.which == 13){
		$('#printCR').focus();
	}
  
}
function setStPaidBy(){
	/*if(dcdArray[0].deliveryTimeTax <= 0){
			$('.stby').html('');
	}*/
}

function getCustomDateInDMYFromTimestamp(timestamp) {
	var dateInDMY	= '';
	
	if(timestamp != undefined) {
		var Date 	= (timestamp).substring(0, 16) ;
		var year  	= Date.substring(2, 4);
		var month 	= Date.substring(5, 7);
		var day	  	= Date.substring(8, 10);
		
		dateInDMY 	= day + "-" + month + "-" + year;
	}
	
	return dateInDMY;
}