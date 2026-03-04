var TAX_PAID_BY_CONSINGOR_NAME;
var TAX_PAID_BY_CONSINGEE_NAME;
var TAX_PAID_BY_TRANSPORTER_NAME;
var TAX_PAID_BY_CONSINGOR_ID;
var TAX_PAID_BY_CONSINGEE_ID;
var TAX_PAID_BY_TRANSPORTER_ID;
var PAYMENT_TYPE_CASH_NAME;
var PAYMENT_TYPE_CHEQUE_NAME;
var PAYMENT_TYPE_CREDIT_NAME;
var PAYMENT_TYPE_BILL_CREDIT_NAME;
var PAYMENT_TYPE_RECEIVE_AT_GODOWN_NAME;
var PAYMENT_TYPE_DUE_UNDELIVERED_NAME;
var PAYMENT_TYPE_CROSSING_CREDIT_NAME;
var PAYMENT_TYPE_CASH_ID;
var PAYMENT_TYPE_CHEQUE_ID;
var PAYMENT_TYPE_CREDIT_ID;
var PAYMENT_TYPE_BILL_CREDIT_ID;
var PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID;
var PAYMENT_TYPE_DUE_UNDELIVERED_ID;
var PAYMENT_TYPE_CROSSING_CREDIT_ID;
var WayBillTypeConstant		= null;
var TaxPaidByConstant		= null;
var PaymentTypeConstant		= null;
var DeliveryChargeConstant	= null;

var wayBillId;
var reprint		= true;

function renderCashReceiptOnScreen() {
	wayBillId	= parseInt(jsonObject.wayBill.wayBillId);
	$("#crPrintDiv1").load( "/ivcargo/html/printhtml/crPrint.html", function() {
		renderPrintData();
	});
	/*$("#crPrintDiv2").load( "/ivcargo/html/printhtml/crPrint.html", function() {
		renderPrintData();
	});
	$("#crPrintDiv3").load( "/ivcargo/html/printhtml/crPrint.html", function() {
		renderPrintData();
	});*/
}

function renderPrintData() {
	var consigneeObj				= jsonObject.consignee;
	var consignmentSummaryObj		= jsonObject.consignmentSummary;
	var consignor					= jsonObject.consignor;
	var deliveryContactDetails		= jsonObject.deliveryContactDetails;
	var lastGoDownUnload			= jsonObject.lastGoDownUnload;
	var srcBranch					= jsonObject.srcBranch;
	var branch						= jsonObject.branch;
	var wayBill						= jsonObject.wayBill;
	var wayBillTaxTxn				= jsonObject.wayBillTaxTxn;
	var destBranch					= jsonObject.destBranch;
	var wayBillChargesCol			= jsonObject.wayBillChargesCol;
	var transportCommonMaster		= jsonObject.TransportCommonMaster;
	var chargeTypeMaster			= jsonObject.ChargeTypeMaster;
	var wayBillTaxObject			= jsonObject.WayBillTaxObject;
	var tdsTxnDetails				= jsonObject.tdsTxnDetails;
	WayBillTypeConstant				= jsonObject.WayBillTypeConstant;
	TaxPaidByConstant				= jsonObject.TaxPaidByConstant;
	PaymentTypeConstant				= jsonObject.PaymentTypeConstant;
	DeliveryChargeConstant			= jsonObject.DeliveryChargeConstant;
	TAX_PAID_BY_CONSINGOR_ID		= TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
	TAX_PAID_BY_CONSINGEE_ID		= TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID;
	TAX_PAID_BY_TRANSPORTER_ID		= TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
	var discountDetails				= jsonObject.discountDetails;
	
	var discountAmount				= 0;
	if (discountDetails != undefined ) {
		discountAmount				= discountDetails.amount;
	}
	
	TAX_PAID_BY_CONSINGOR_NAME		= TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME;
	TAX_PAID_BY_CONSINGEE_NAME		= TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME;
	TAX_PAID_BY_TRANSPORTER_NAME	= TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME;
	
	var WAYBILL_TAX_TXN_TYPE_BOTH		= wayBillTaxObject.waybillTaxTxnTypeBoth;
	var WAYBILL_TAX_TXN_TYPE_BOOKING	= wayBillTaxObject.waybillTaxTxnTypeBooking;
	var WAYBILL_TAX_TXN_TYPE_DELIVERY	= wayBillTaxObject.waybillTaxTxnTypeDelivery;	
	
	if (DeliveryChargeConstant != undefined ) {
		var OCTROI_DELIVERY			=	DeliveryChargeConstant.OCTROI_DELIVERY;
		var OCTROI_SERVICE			=	DeliveryChargeConstant.OCTROI_SERVICE;
		var OCTROI_FORM				=	DeliveryChargeConstant.OCTROI_FORM;
		var HAMALI_DELIVERY			=	DeliveryChargeConstant.HAMALI_DELIVERY;
		var BFC						=	DeliveryChargeConstant.BFC;
		var RC						=	DeliveryChargeConstant.RC;
		var DAMERAGE				=	DeliveryChargeConstant.DAMERAGE;
		var OTHER_DELIVERY			=	DeliveryChargeConstant.OTHER_DELIVERY;
		var DOOR_DELIVERY_DELIVERY	=	DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY;	
	} else {
		var OCTROI_DELIVERY;
		var OCTROI_SERVICE;
		var OCTROI_FORM;
		var HAMALI_DELIVERY;
		var BFC;
		var RC;
		var DAMERAGE;
		var OTHER_DELIVERY;
		var DOOR_DELIVERY_DELIVERY;
	}

	PAYMENT_TYPE_CASH_NAME				= PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME;
	PAYMENT_TYPE_CHEQUE_NAME 			= PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME;
	PAYMENT_TYPE_CREDIT_NAME			= PaymentTypeConstant.PAYMENT_TYPE_CREDIT_NAME;
	PAYMENT_TYPE_BILL_CREDIT_NAME		= PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_NAME;
	PAYMENT_TYPE_RECEIVE_AT_GODOWN_NAME	= PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_NAME;
	PAYMENT_TYPE_DUE_UNDELIVERED_NAME	= PaymentTypeConstant.PAYMENT_TYPE_DUE_UNDELIVERED_NAME;
	PAYMENT_TYPE_CROSSING_CREDIT_NAME	= PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_NAME;
	
	PAYMENT_TYPE_CASH_ID				= PaymentTypeConstant.PAYMENT_TYPE_CASH_ID;
	PAYMENT_TYPE_CHEQUE_ID				= PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID;
	PAYMENT_TYPE_CREDIT_ID				= PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID;
	PAYMENT_TYPE_BILL_CREDIT_ID			= PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID;
	PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID	= PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID;
	PAYMENT_TYPE_DUE_UNDELIVERED_ID		= PaymentTypeConstant.PAYMENT_TYPE_DUE_UNDELIVERED_ID;
	PAYMENT_TYPE_CROSSING_CREDIT_ID		= PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID;
	
	var freeDays					= 7;
	var totalDelvryAmt = 0;
	if(wayBillChargesCol != undefined ) {
		if (wayBill.wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
				|| (wayBill.wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT 
						&& deliveryContactDetails.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID)		
		) {
			totalDelvryAmt	= parseInt(wayBill.grandTotal);
		} else {			
			totalDelvryAmt = parseInt(wayBill.deliveryTotal);
		}
	}
	totalDelvryAmtWords = convertNumberToWord(totalDelvryAmt)
	
	var receiveDate         = "";
	if(lastGoDownUnload != undefined ) {
		receiveDate		= getDateInDMYFromTimestamp(lastGoDownUnload.creationDateTime);
	}
	var bookingDate			= getDateInDMYFromTimestamp(jsonObject.BookingDateTime);
	var WayBillCreationDate	= getDateInDMYFromTimestamp(wayBill.creationDateTimeStamp);
	
	var storageDays =	jsonObject.DaysDiff;
	
	var diffOfDays	= 0;
	if (storageDays>freeDays) {
		diffOfDays	= storageDays-freeDays;
	}
		console.log(destBranch.accountGroupId,destBranch.regionId,destBranch.subRegionId)
	setQrSourceRegionAndSubRegionWise(destBranch.accountGroupId,destBranch.regionId,destBranch.subRegionId);

	var time = getTime(wayBill.creationDateTimeStamp);
	var addDetail = destBranch.address;
	if(destBranch.phoneNumber != null) {
		addDetail = addDetail+". ContactNumber: "+destBranch.phoneNumber;
	}
	if(destBranch.phoneNumber2 != null) {
		addDetail = addDetail+"/"+destBranch.phoneNumber2;
	}
	
	$("*[data-crPrint='destinationBranchAdd']").html(addDetail); 
	$("*[data-crPrint='destinationBranchGSTN']").html(destBranch.gstn); 
	$("*[data-crPrint='wayBillDeliveryNumber']").html(deliveryContactDetails.wayBillDeliveryNumber);
	$("*[data-crPrint='wayBillCreationDate']").html(WayBillCreationDate);
	$("*[data-crPrint='consignee']").html(consigneeObj.name);
	$("*[data-crPrint='consignor']").html(consignor.name);
	$("*[data-crPrint='deliveredTo']").html(deliveryContactDetails.deliveredToName);
	$("*[data-crPrint='sourceBranchName']").html(srcBranch.name);
	$("*[data-crPrint='branchName']").html(branch.address);
	$("*[data-crPrint='noOfArticle']").html(jsonObject.noOfPackages);
	$("*[data-crPrint='dispatchVehicleNumber']").html(jsonObject.dispatchVehicleNumber);
	$("*[data-crPrint='chargedWeight']").html(consignmentSummaryObj.chargeWeight);
	if ((wayBill.remark).length > 50) {
		$("*[data-crPrint='remark1']").html((wayBill.remark).slice(1,50));
		$("*[data-crPrint='remark2']").html((wayBill.remark).slice(51,(wayBill.remark).length));
	} else {		
		$("*[data-crPrint='remark1']").html(wayBill.remark);
	}
	if(wayBill.WAYBILL_TYPE_TO_PAY == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
			|| wayBill.wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
		if((consignmentSummaryObj.taxBy == TAX_PAID_BY_CONSINGEE_ID
			|| consignmentSummaryObj.taxBy == TAX_PAID_BY_CONSINGOR_ID)
				&& deliveryContactDetails.taxBy== TAX_PAID_BY_TRANSPORTER_ID){
			var valueA	= getTaxBy(consignmentSummaryObj.taxBy);
			var valueB	= getTaxBy(deliveryContactDetails.taxBy);
			$("*[data-crPrint='serviceTaxChangeDetails']").html("GST Paid by changed from'"+valueA +"'to'"+valueB +"'&nbsp;");
		} else {
			$("*[data-crPrint='serviceTaxChangeDetails']").html("&nbsp;");
		}
	}
	if(wayBillTaxTxn.length <= 0 ) {
		$("*[data-crPrint='serviceTaxDetails']").html("&nbsp;");
	}else {
		$("*[data-crPrint='serviceTaxDetails']").html("GST:");
		var paidBy	= getTaxBy(deliveryContactDetails.taxBy);
		var amount = 0;
		for(var i=0; i<wayBillTaxTxn.length;i++) {
			if(wayBillTaxTxn[i].taxTxnType == WAYBILL_TAX_TXN_TYPE_DELIVERY) {
				if (parseInt(wayBillTaxTxn[i].taxAmount) > 0) {
					amount	+= parseInt(wayBillTaxTxn[i].taxAmount);
				} else {
					amount	+= parseInt(wayBillTaxTxn[i].unAddedTaxAmount);
				}
				$("*[data-crPrint='serviceTaxDetails']").html("GST: " + amount + "	Paid By	" + paidBy);
			}
		}
	}
	if(lastGoDownUnload != undefined ) {
		$("*[data-crPrint='godownDetails']").html(lastGoDownUnload.godownAddress);
	} else {
		$("*[data-crPrint='godownDetails']").html("");
	}
	$("*[data-crPrint='amountInWord']").html(totalDelvryAmtWords);
	var paymentType	= getPaymentType(deliveryContactDetails.paymentType);
	$("*[data-crPrint='paymentType']").html(paymentType);
	if (paymentType == "Cheque") {
		$('table#details tr#chequeRemove').remove();
		$("*[data-crPrint='chequeDetails']").html(deliveryContactDetails.chequeNumber);
		$("*[data-crPrint='chequeNoWithBracket']").html('('+ deliveryContactDetails.chequeNumber + ')');
	}else {
		$('table#details tr#chequeRow').remove();
	}
	$("*[data-crPrint='creationTime']").html(time);
	$("*[data-crPrint='wayBillNumber']").html(wayBill.wayBillNumber);
	$("*[data-crPrint='bookingDate']").html(bookingDate);
	$("*[data-crPrint='receiveDate']").html(receiveDate);
	$("*[data-crPrint='storageDays']").html(storageDays);
	$("*[data-crPrint='freeDays']").html(freeDays);
	$("*[data-crPrint='diffOfStorage&Free']").html(diffOfDays);
	if (wayBillChargesCol != null) {
		if (wayBill.wayBillTypeId	== WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
				|| (wayBill.wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT 
						&& deliveryContactDetails.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID)) {
			$("*[data-crPrint='toPayAmount']").html(parseInt(wayBill.bookingTotal));
		}else {
			$("*[data-crPrint='toPayAmount']").html("0");
		}
		if (wayBillChargesCol[OCTROI_DELIVERY] == undefined) {
			$("*[data-crPrint='octroiAmount']").html("0");
		} else {
			var octroi	= wayBillChargesCol[OCTROI_DELIVERY];
			$("*[data-crPrint='octroiAmount']").html(octroi);			
		}
		if (wayBillChargesCol[OCTROI_SERVICE] == undefined) {
			$("*[data-crPrint='octroiServiceAmount']").html("0");
		} else {
			var octroi	= wayBillChargesCol[OCTROI_SERVICE];
			$("*[data-crPrint='octroiServiceAmount']").html(octroi);
		}
		if (wayBillChargesCol[OCTROI_FORM] == undefined) {
			$("*[data-crPrint='octroiFormAmount']").html("0");
		} else {
			var octroi	= wayBillChargesCol[OCTROI_FORM];
			$("*[data-crPrint='octroiFormAmount']").html(octroi);
		}
		if (wayBillChargesCol[HAMALI_DELIVERY] == undefined) {
			$("*[data-crPrint='hamaliAmount']").html("0");
		} else {
			var hamali	= wayBillChargesCol[HAMALI_DELIVERY];
			$("*[data-crPrint='hamaliAmount']").html(hamali);
		}
		if (wayBillChargesCol[BFC] == undefined) {
			$("*[data-crPrint='bfsAmount']").html("0");
		} else {
			var bf	= wayBillChargesCol[BFC];
			$("*[data-crPrint='bfsAmount']").html(bf);
		}
		if (wayBillChargesCol[RC] == undefined) {
			$("*[data-crPrint='rcAmount']").html("0");
		} else {
			var rc	= wayBillChargesCol[RC];
			$("*[data-crPrint='rcAmount']").html(rc);
		}
		if (wayBillChargesCol[DAMERAGE] == undefined) {
			$("*[data-crPrint='damarageAmount']").html("0");
		} else {
			var damrage	= wayBillChargesCol[DAMERAGE];
			$("*[data-crPrint='damarageAmount']").html(damrage-discountAmount);
			
		}
		if (wayBillChargesCol[OTHER_DELIVERY] == undefined) {
			$("*[data-crPrint='otherAmount']").html("0");
		} else {
			var other	= wayBillChargesCol[OTHER_DELIVERY];
			$("*[data-crPrint='otherAmount']").html(other);
		}
		if (wayBillTaxTxn.length > 0 && deliveryContactDetails.taxBy == TAX_PAID_BY_TRANSPORTER_ID) {
			for (var i=0; i<wayBillTaxTxn.length; i++) {
				var taxTxn = wayBillTaxTxn[i]
				if (taxTxn.taxTxnType == WAYBILL_TAX_TXN_TYPE_DELIVERY){
					if (parseInt(taxTxn.taxAmount)){
						$("*[data-crPrint='serviceTaxAmount']").html(parseInt(taxTxn.taxAmount));
					}else {
						$("*[data-crPrint='serviceTaxAmount']").html(parseInt(taxTxn.unAddedTaxAmount));
					}
				}
			}
		} else {
			$("*[data-crPrint='serviceTaxAmount']").html("0");
		}
		if (wayBillChargesCol[DOOR_DELIVERY_DELIVERY] != undefined) {
			$('table#chargeslables tr#extra').remove();
			$("*[data-crPrint='DD']").html("Door Dly.");
			var doorDelivery	= wayBillChargesCol[DOOR_DELIVERY_DELIVERY];
			$("*[data-crPrint='DDAmount']").html(doorDelivery);
		} else {
			$('table#chargeslables tr#doorDly').remove();			
		}
		if (tdsTxnDetails == undefined || tdsTxnDetails.tdsAmount == undefined) {
			$("*[data-crPrint='tds']").html("0");
		} else {
			$("*[data-crPrint='tds']").html(tdsTxnDetails.tdsAmount);
		}
		$("*[data-crPrint='total']").html(totalDelvryAmt);
	}
}
function getTaxBy(valueId) {
	if (valueId == TAX_PAID_BY_CONSINGOR_ID) {
		return TAX_PAID_BY_CONSINGOR_NAME;
	}
	
	if (valueId == TAX_PAID_BY_CONSINGEE_ID) {
		return TAX_PAID_BY_CONSINGEE_NAME;
	}
	
	if (valueId == TAX_PAID_BY_TRANSPORTER_ID) {
		return TAX_PAID_BY_TRANSPORTER_NAME;
	}
}
function getPaymentType(typeId) {
	
	if (typeId == PAYMENT_TYPE_CASH_ID) {
		return PAYMENT_TYPE_CASH_NAME;
	}
	if (typeId == PAYMENT_TYPE_CHEQUE_ID) {
		return PAYMENT_TYPE_CHEQUE_NAME;
	}
	if (typeId == PAYMENT_TYPE_CREDIT_ID) {
		return PAYMENT_TYPE_CREDIT_NAME;
	}
	if (typeId == PAYMENT_TYPE_BILL_CREDIT_ID) {
		return PAYMENT_TYPE_BILL_CREDIT_NAME;
	}
	if (typeId == PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
		return PAYMENT_TYPE_RECEIVE_AT_GODOWN_NAME;
	}
	if (typeId == PAYMENT_TYPE_DUE_UNDELIVERED_ID) {
		return PAYMENT_TYPE_DUE_UNDELIVERED_NAME;
	}
}
function getTime(inputDate) {
  // Parse input date string
  var inputDateTime = new Date(inputDate);
  var hours = inputDateTime.getHours();
  var minutes = inputDateTime.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';

  // Adjust hours for 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be treated as 12

  // Format the date and time
  var formattedTime = padZero(hours) + ':' + padZero(minutes) + ' ' + ampm;

  // Combine date and time
  var result = formattedTime;

  return result;
}

// Helper function to pad single digits with a leading zero
function padZero(number) {
  return number < 10 ? '0' + number : number;
}


function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	window.setTimeout(printAfterDelay, 1000);
}
function printAfterDelay() {
	window.print();
	window.close();
}
function checkCookie() {
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
	}
	if(cookieValue == "laser") {
		HideSaidToContainDialog();
	} else if(cookieValue == "dotmatrix") {
		setDotMatrixPrint();
	} else {		
	ShowDialogForPrint()
	}
}

function setLaserPrint(){
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
		document.cookie	= "print=laser; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	}
	HideSaidToContainDialog();
}

function ShowDialogForPrint(){
    $("#companyNameOverlay").show();
    $("#companyNameDialog").fadeIn(300);
}

function setDotMatrixPrint(){
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
		document.cookie	= "print=dotmatrix; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	}
	window.open('edit.do?pageId=3&eventId=10&wayBillId='+wayBillId+'&isRePrint='+reprint,"_self")
}

function HideSaidToContainDialog(){
    $("#companyNameOverlay").hide();
    $("#companyNameDialog").fadeOut(0);
    printBillWindow();
}