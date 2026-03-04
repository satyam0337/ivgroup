/*
 * moduleId, incomeExpenseModuleId are globally defined when page is load
 */
var timeIntervalId;
var jsonObjPP;
var timeInterval;
let isApprove 								= false;
var stopTime 								= false;
let counterInterval 						= 0;
let isCancelledPayment						= false;

 
function generateDynamicQRCode(){
	resetQRData();
	clearTimeout(timeIntervalId);
	var paymentType 		= $('#paymentType').val();
	var totalPayableAmount  = 0;
	let tdsAmount = Number($('#tdsAmount').val()) || 0;;

	if (moduleId == ModuleIdentifierConstant.BOOKING) {
		totalPayableAmount = Number($('#grandTotal').val()) - tdsAmount;
		paymentType = $('#paymentType').val();
	} else if (moduleId == ModuleIdentifierConstant.GENERATE_CR) {
		totalPayableAmount = Number($('#billAmount').val()) - tdsAmount;
		paymentType = $('#deliveryPaymentType').val();
	} else if (moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR) {
		totalPayableAmount= multiLRDeliveryTotalAmount-multiLRDeliveryTdsTotalAmount;
		paymentType = $('#deliveryPaymentType').val();
	}
			
	if(Number(totalPayableAmount) <= 0){
		showMessage('info', 'LR Amount Cannot Be Zero!');
		hideBTModel();
		return false;
	}
	
	showLayer();
	jsonObjPP 					= new Object();
	jsonObjPP.branchName 		= executive.branchName;
	jsonObjPP.paymentModeId		= paymentType;
	jsonObjPP.rechargeAmount	= totalPayableAmount;
	jsonObjPP.amountToBePaid	= totalPayableAmount;
	jsonObjPP.rechargeRemark	= $('#payableAmountRemark').val();
	jsonObjPP.totalPayableAmount = totalPayableAmount;
	jsonObjPP.moduleId			= moduleId;
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rechargeRequestWS/generateQRCode.do',
		data: jsonObjPP,
		dataType: 'json',
		success: function(data) {
			if (data.status) {
				$('#merchantIdFld').val(data.merchantId);
				$('#transactionFld').val(data.transactionId);
				$('#amountFld').val(data.rechargeAmount);
				$('#apiReqResDataIdFld').val(data.apiRequestResponseDataId);

				var upiQRString = data.qrString;
				let timeLeft = Number(data.expiresIn);
				var qrCodeElement = document.getElementById("qrCode");

				while (qrCodeElement.firstChild) {
					qrCodeElement.removeChild(qrCodeElement.firstChild);
				}

				var qrcode = new QRCode(document.getElementById("qrCode"), {
					text: upiQRString,
					width: 250,
					height: 250,
					colorDark: "#000000",
					colorLight: "#ffffff"
				});

				hideLayer();

				if (upiQRString != undefined) {
					openQRModal();
					timeDurationSec(timeLeft);

					timeIntervalId = setTimeout(testin, 5000);
				}
			} else if (data.status == undefined) {
				showMessage('error', 'Error Occured');
				hideLayer();
			}

		 }
	});
	
}

function openQRModal(){
	$("#mainQRCodeModal").modal({
	    backdrop: 'static',
	    keyboard: false
	}).modal('show');
}

function confirmCancellationModal(){
	$("#confirmCancellationModal").modal({
	    backdrop: 'static',
	    keyboard: false
	}).modal('show');
}


function stopTimeInterval(){
	clearTimeout(timeIntervalId);
}

function cancelQRPaymentRequest(){
	showLayer();
	var jsonObject					= new Object();
	
	jsonObject.branchName 				= $('#requestBranchName').val();
	jsonObject.paymentModeId			= $('#paymentModeId').val();
	jsonObject.transactionId			= $('#transactionFld').val();
	jsonObject.merchantId				= $('#merchantIdFld').val();
	jsonObject.rechargeAmount			= $('#rechargeAmount').val();
	jsonObject.amountToBePaid			= $('#amountToBePaid').val();
	jsonObject.bankAccountId			= $('#bankAccIdForRequest_primary_key').val();
	jsonObject.bankAccountNumber		= $('#bankAccIdForRequest').val();
	jsonObject.apiRequestResponseDataId	= $('#apiReqResDataIdFld').val();
	jsonObject.moduleId					= moduleId;
	
	hideLayer();
	$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/cancelPaymentRequest.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data != undefined){
							hideLayer();
							$('#mainQRCodeModal').modal('hide');
							stopTime = true;
							isCancelledPayment = true;
							isPaidByDynamicQRCode = false;
							stopTimeInterval();
							showMessage('success', "Payment Request Cancelled SuccessFully !");
							resetPaymentModel();
	       					hideBTModel();
						}else if(data == undefined){
							showMessage('error', 'Cannot Cancel the request!');
							hideLayer();
						}
					}
				});
}
    
function timeDurationSec(durationInSeconds) {
	clearInterval(timeInterval);
      const targetTime = new Date().getTime() + durationInSeconds * 1000;

      timeInterval = setInterval(function () {
        const currentTime = new Date().getTime();
        const timeLeft = targetTime - currentTime;
        if (timeLeft <= 0 ) {
          cancelQRPaymentRequest();
          stopTimerInterval();
          document.getElementById('countdown').innerHTML = 'Expired!';
        } else if(isApprove){//stopTime ||
			 stopTimerInterval();
		} else {
          const minutes = Math.floor((timeLeft / 1000) / 60);
          const seconds = Math.floor((timeLeft / 1000) % 60);

          document.getElementById('countdown').innerHTML = `${minutes}m ${seconds}s`;
        }
      }, 1000);
}

function stopTimerInterval(){
	clearInterval(timeInterval);
}
 
 function checkQRPaymentStatus(jsonObject){
	 jsonObject.apiRequestResponseDataId	= $('#apiReqResDataIdFld').val();
	  jsonObject.transactionId				= $('#transactionFld').val();
	  
	 $.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/checkPaymentStatus.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data != undefined){
							hideLayer();
							if(data.status){
								showMessage('success', 'Payment Done Successfully !');
								isPaidByDynamicQRCode = true;
								$('#mainQRCodeModal').modal('hide');
								$("#viewAddedPaymentDetailsCreate").addClass("hide");
								isApprove =  true;
								stopTime = true;
								stopTimeInterval();
								resetPaymentModel();
								hideBTModel();
								
								if(moduleId == ModuleIdentifierConstant.BOOKING)
									onSaveWayBill();
								else if(moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR)
									deliverWayBill(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
								
							}else{
								isApprove =  false;
							}
						}
					}
				});
 }
 
 function testin(){
	 if (counterInterval === 60 || isApprove) {
	        stopTimeInterval();
	        $('#mainQRCodeModal').modal('hide');
	       	hideBTModel();
	    } else {
	        checkQRPaymentStatus(jsonObjPP);
	        counterInterval++;
	        timeIntervalId = setTimeout(testin, 5000);
	    }
 }
 
 function resetQRData(){
	isApprove 			= false;
	isCancelledPayment 	= false;
	counterInterval		= 0;
	stopTime			= false; 
	
	isPaidByDynamicQRCode = false;
	$('#transactionFld').val("");
	$('#merchantIdFld').val("");
	$('#apiReqResDataIdFld').val("");
 }