/**
 *  Author   : Manish Singh
 *  Added On : 25-04-2022
 */
 
 var alreadyRechargePending	= false;
 var stopTimer				= false;
 var timerInterval;
 let isApproved 			= false;
 var intervalId;
 let counter 				= 0;
 let iscancelled			= false;
 var jsonObjectPP			= new Object();
 let paymentShortLink;
 
$( document ).ready(function() {
	disableTextPasteOnNumberFeild();
	setRequestBankAccountAutocomplete();
   	setRequestBankNameAutocomplete();
   	getBranchRechargeRequestElements();
   	hideLayer();
});

function openBranchRequestPopup(){
	if(alreadyRechargePending != undefined && alreadyRechargePending){
		showMessage('error', 'Cannot Create Request , One Recharge Request Already Pending !');
		return false;
	}
	 resetBranchRechargeModal();
	initializeRechargeRequestData();
	$('#rechargeRequestModal').modal('show');
}

function initializeRechargeRequestData(){
	$('#requestBranchName').val(executive.branchName);
	
	if(typeof branchWisePrepaidAmount !== 'undefined' && branchWisePrepaidAmount != null)
		$('#balance').val(branchWisePrepaidAmount.rechargeAmount);
	
	$('#requestChequeDate').val(dateWithDateFormatForCalender(new Date(),"-")); //dateFormatForCalender defined in genericfunctions.js file
	$('#requestChequeDate').datepicker({
		dateFormat: 'dd-mm-yy',
		maxDate: new Date()
	});
	
	if(generateAndValidateQROnUPIRechargePermission){
		$("#generateQRBtn").click(function() { 
			if(allowStandardCustomFlowPhonePe)
				generateNewQRCode();
			else 
				generateQrCode();
		 });
		$("#linkShareBtn").click(function() { openLinkShareModal(); });
		$("#rechargeAmount").on("keyup", function() { setprocessingFeesAndTotalPayableAmount(); });
	}
}

function setBranchRechargePopupData(data){
	alreadyRechargePending	= data.alreadyRechargePending;
	
	if(data.paymentTypeArr != undefined){
		var options = '<option value="-1">Please Select</option>';
	
		for(var i=0;i<data.paymentTypeArr.length; i++){
			options += '<option value="'+data.paymentTypeArr[i].paymentTypeId+'">'+data.paymentTypeArr[i].paymentTypeName+'</option>';
		}
	
		$('#paymentModeId').html(options);
	}	
}

function getBranchRechargeRequestElements(){
	var jsonObject					= new Object();
	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/getRechargeRequestInitialData.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			setBranchRechargePopupData(data);
		}
	});
}

function setAmountToBePaid(){

	if(Number($('#rechargeAmount').val()) > 0){
		$('#amountToBePaid').val($('#rechargeAmount').val());
	}else{
		$('#amountToBePaid').val(0);
	}

}

function setRequestBankNameAutocomplete() {
	var issueBankAuto 			= Object();

	issueBankAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankNameAutocomplete.do';
	issueBankAuto.primary_key 	= 'bankId';
	issueBankAuto.field 		= 'bankName';
	issueBankAuto.callBack		= callBackBank;
	$("#rechargeBankName").autocompleteCustom(issueBankAuto);
	
	function callBackBank(res) {
		$('#rechargeBankNameId').val($('#rechargeBankName_primary_key').val());
	}
}


function setRequestBankAccountAutocomplete() {
	var issueBankAuto 			= Object();

	issueBankAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankAccountAutocomplete.do';
	issueBankAuto.primary_key 	= 'bankAccountId';
	issueBankAuto.field 		= 'bankAccountNumber';
	issueBankAuto.callBack		= callBackBank;
	$("#bankAccIdForRequest").autocompleteCustom(issueBankAuto);

	function callBackBank(res) {
		$('#bankAccIdForRequestId').val($('#bankAccIdForRequest_primary_key').val());
	}
}

function resetBranchRechargeModal(){
	$('#requestBranchName').val('');
	$('#balance').val('');
	$('#paymentModeId').val('-1');
	$('#rechargeAmount').val('');
	$('#amountToBePaid').val('');
	$('#rechargeBankName').val('');
	$('#rechargeBankName_primary_key').val(0);
	$('#bankAccIdForRequest_primary_key').val(0);
	$('#rechargeBankNameId').val(0);
	$('#transactionNumber').val('');
	//$('#requestChequeDate').val('');
	$('#chequeRalatedFeild').hide();
	$('#rechargeRemark').val('');
	$('#generateQRBtn').hide();
	$('#linkShareBtn').hide();
	$('#processingFeeRow').hide();
	$('#processingFee').val('');
	$('#totalPayableAmountRow').hide();
	$('#totalPayableAmount').val('');
	$('#qrmessage').hide();
	$('#amountToBePaidRow').show();
}

function saveRechargeRequestDetails(){

	if(!validateRechargeRequest()){
		return false;
	}
	
	showLayer();
	
	var jsonObject					= new Object();
	
	jsonObject.paymentModeId		= $('#paymentModeId').val();
	jsonObject.rechargeAmount		= $('#rechargeAmount').val();
	jsonObject.amountToBePaid		= $('#amountToBePaid').val();
	jsonObject.bankId				= $('#rechargeBankName_primary_key').val();
	jsonObject.bankAccountId		= $('#bankAccIdForRequest_primary_key').val();
	jsonObject.transactionNumber	= $('#transactionNumber').val();
	jsonObject.requestChequeDate	= $('#requestChequeDate').val();
	jsonObject.rechargeRemark		= $('#rechargeRemark').val();
	
			if (confirm('Are you sure you want to Save ?')) {
				$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/saveRechargeRequest.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data.success != undefined){
							showMessage('success', 'Branch Recharge Request Created Successfully !');
							resetBranchRechargeModal();
							$('#rechargeRequestModal').modal('hide');
							hideLayer();
						}else if(data.failure != undefined){
							showMessage('error', 'Cannot Create Request , One Recharge Request Already Pending Created On : '+data.previousRequest.instrumentDateStr);
							hideLayer();
						}
					}
				});
			} else {
				hideLayer();
			} 
	
}

function validateRechargeRequest(){
	if(Number($('#paymentModeId').val()) <= 0){
		$('#paymentModeId').focus();
		showMessage('info', 'Please Select Payment Mode !');
		return false;
	}
	if(Number($('#rechargeAmount').val()) <= 0){
		$('#rechargeAmount').focus();
		showMessage('info', 'Please Enter Recharge Amount !');
		return false;
	}
	if($('#rechargeRemark').val() == "" || $('#rechargeRemark').val() == undefined){
		$('#rechargeRemark').focus();
		showMessage('info', 'Please Enter Remark !');
		return false;
	}
	if(Number($('#amountToBePaid').val()) <= 0){
		$('#amountToBePaid').focus();
		showMessage('info', 'Please Enter  Amount To Be Paid !');
		return false;
	}
	
	if(Number($('#paymentModeId').val()) > PaymentTypeConstant.PAYMENT_TYPE_CASH_ID){
		if(Number($('#bankAccIdForRequest_primary_key').val()) <= 0){
			$('#bankAccIdForRequest').focus();
			showMessage('info', 'Please Select Bank Account !');
			return false;
		}
		if(Number($('#rechargeBankName_primary_key').val()) <= 0 && Number($('#paymentModeId').val()) != PaymentTypeConstant.PAYMENT_TYPE_UPI_ID){
			$('#rechargeBankName').focus();
			showMessage('info', 'Please Select Bank Name !');
			return false;
		}
		if($('#transactionNumber').val() != null && $('#transactionNumber').val().trim() == '' && Number($('#paymentModeId').val()) != PaymentTypeConstant.PAYMENT_TYPE_UPI_ID){
			$('#transactionNumber').focus();
			showMessage('info', 'Please Enter Transaction Number !');
			return false;
		}
	}
	
	return true;
}

function showHideChequeRelatedFeild(){
	if(Number($('#paymentModeId').val()) == 1 || Number($('#paymentModeId').val()) == -1 ){
		$('#chequeRalatedFeild').hide();
		$('#generateQRBtn').hide();
		$('#linkShareBtn').hide();
		$('#processingFeeRow').hide();
		$('#totalPayableAmountRow').hide();
		$('#qrmessage').hide();
		$('#processingFee').val('');
		$('#totalPayableAmount').val('');
		$('#amountToBePaidRow').show();
		$('#txnDetailsBtn1').show();

	}else if(Number($('#paymentModeId').val()) == 17 && isGenerateQRCodePhonePeForUPIAllow && generateAndValidateQROnUPIRechargePermission){
		$('#chequeRalatedFeild').hide();
		$('#rechargeBankNameRow').hide();
		$('#transactionNumberRow').hide();
		$('#requestChequeDateRow').hide();
		$('#rechargeBankAccountRow').hide();
		$('#generateQRBtn').show();
		
		if(allowStandardCustomFlowPhonePe)
			$('#linkShareBtn').show();
			
		console.log("qrmessage")
		$('#txnDetailsBtn').css('display','none');
		$('#txnDetailsBtn').hide();
		if(isDeductCharges){
			$('#qrmessage').text(upiRechargeMessage);
			$('#qrmessage').show();
			$('#processingFeeRow').show();
			$('#totalPayableAmountRow').show();
			$('#amountToBePaidRow').hide();
		}	
		$('#txnDetailsBtn1').hide()
		
		/*if (allowStandardCustomFlowPhonePe) {
		    $(`#paymentModeId option[value='${PaymentTypeConstant.PAYMENT_TYPE_UPI_ID}']`)
		        .text("UPI / Online");
		}*/
	}
	else{
		$('#chequeRalatedFeild').show();
		$('#generateQRBtn').hide();
		$('#linkShareBtn').hide();
		$('#processingFeeRow').hide();
		$('#totalPayableAmountRow').hide();
		$('#amountToBePaidRow').show();
		$('#rechargeBankNameRow').show();
		$('#transactionNumberRow').show();
		$('#requestChequeDateRow').show();
		$('#rechargeBankAccountRow').show();
		$('#txnDetailsBtn').show();
		$('#qrmessage').hide();
		$('#txnDetailsBtn1').show();

	}
}


function openModal(){
	$("#qrCodeMainModal").modal({
	    backdrop: 'static',
	    keyboard: false
	}).modal('show');
}

function openLinkShareModal() {
    $("#countdownRow").hide();    
    $("#countdown1").html("");

    $("#upiLinkShareModal").modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');
}


function confirmationModal(){
	if(allowStandardCustomFlowPhonePe) {
		finalCancelAction();
	}else{
		$("#confirmationModal").modal({
		    backdrop: 'static',
		    keyboard: false
		}).modal('show');
		
	}
}

function proceedCancellation() {
	resetAndCloseUPILinkShareModal();
}

function finalCancelAction() {
    if(allowStandardCustomFlowPhonePe) {
        cancelNewPaymentRequest();
    } else {
        cancelPaymentRequest();
    }
}

function generateQrCode(){
	clearTimeout(intervalId);
	   
	if(allowToSendQROnWhatsapp) {
		$('#mobileInputRow').show();
		$('#sendQRCodeBtnRow').show();
	} else {
		$('#mobileInputRow').hide();
		$('#sendQRCodeBtnRow').hide();
	}
	
	if(!prepareJsonPP(isDeductCharges))
		return false;
		
	paymentShortLink = '';
	console.log("jsonObject -- "+JSON.stringify(jsonObjectPP))
	showLayer();
	$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/generateQRCode.do',
					data		:	jsonObjectPP,
					dataType	: 	'json',
					success		: 	function(data) {
							console.log('data -- '+JSON.stringify(data))

						if(data.status){
							$('#merchantIdField').val(data.merchantId);
							$('#transactionField').val(data.transactionId);
							$('#amountFeild').val(data.rechargeAmount);
							$('#apiReqResDataId').val(data.apiRequestResponseDataId);
							
							var upiQrString	= data.qrString;
							paymentShortLink = upiQrString;
							
							let timeLeft = Number(data.expiresIn);
							
							var qrCodeElement = document.getElementById("QRCode");
    						while (qrCodeElement.firstChild){
        						qrCodeElement.removeChild(qrCodeElement.firstChild);
							}
   							 
						    var qrcode = new QRCode(document.getElementById("QRCode"),{
						        text: upiQrString,
						        width: 250,
						        height: 250,
						        colorDark: "#000000",
   						      	colorLight: "#ffffff"
						    });
						    
							hideLayer();
							
						    if(upiQrString != undefined){
								openModal();
								timer(timeLeft);
								
								intervalId = setTimeout(testing,30000);
							}
						}else if(data.status == undefined){
							console.log('data -- '+data)
							showMessage('error', 'Error Occured');
							hideLayer();
						}
					}
				});
}


function stopInterval(){
	clearTimeout(intervalId);
	$('#mobileNum').val('');
	paymentShortLink = '';
}

function cancelPaymentRequest(){
	showLayer();
	var jsonObject					= new Object();
	
	jsonObject.branchName 				= $('#requestBranchName').val();
	jsonObject.paymentModeId			= $('#paymentModeId').val();
	jsonObject.transactionId			= $('#transactionField').val();
	jsonObject.merchantId				= $('#merchantIdField').val();
	jsonObject.rechargeAmount			= $('#rechargeAmount').val();
	jsonObject.amountToBePaid			= $('#amountToBePaid').val();
	jsonObject.bankAccountId			= $('#bankAccIdForRequest_primary_key').val();
	jsonObject.bankAccountNumber		= $('#bankAccIdForRequest').val();
	jsonObject.apiRequestResponseDataId	= $('#apiReqResDataId').val();
	jsonObjectPP.moduleId				= PREPAID_RECHARGE_REQUEST;

	
	console.log("jsonObject -- "+JSON.stringify(jsonObject))
	hideLayer();
	$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/cancelPaymentRequest.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data != undefined){
							hideLayer();
							$('#qrCodeMainModal').modal('hide');
							stopTimer = true;
							iscancelled = true;
							stopInterval();  
							showMessage('success', "Payment Request Cancelled SuccessFully !");
						}else if(data == undefined){
							showMessage('error', 'Cannot Cancel the request!');
							hideLayer();
						}
					}
				});
}
    
function timer(durationInSeconds) {
	clearInterval(timerInterval);
	const targetTime = new Date().getTime() + durationInSeconds * 1000;

	timerInterval = setInterval(function() {
		const currentTime = new Date().getTime();
		const timeLeft = targetTime - currentTime;

		if(timeLeft <= 0) {
			finalCancelAction();
			stopTimerInterval();
			document.getElementById('countdown1').innerHTML = 'Expired!';
		}else if (isApproved){
			stopTimerInterval();
		} else {
			//const minutes = Math.floor((timeLeft / 1000) / 60);
			//const seconds = Math.floor((timeLeft / 1000) % 60);

			//document.getElementById('countdown1').innerHTML = `${minutes}m ${seconds}s`;
			if (!Number.isFinite(timeLeft) || timeLeft <= 0) {
			   document.getElementById('countdown').innerHTML = '00s';
			   return;
			 }

			 const totalSeconds = Math.floor(timeLeft / 1000);

			 const hours   = Math.floor(totalSeconds / 3600);
			 const minutes = Math.floor((totalSeconds % 3600) / 60);
			 const seconds = totalSeconds % 60;

			 const pad = (n) => String(n).padStart(2, '0');

			 let display = '';
			 if (hours > 0) {
			   display += `${pad(hours)}h `;
			 }
			 display += `${pad(minutes)}m ${pad(seconds)}s`;

			 document.getElementById('countdown1').innerHTML = display;
		}
	}, 1000);
}

function stopTimerInterval(){
	console.log('init stop')
	clearInterval(timerInterval);
}
 
 function checkPaymentStatus(jsonObject){
	 jsonObject.apiRequestResponseDataId	= $('#apiReqResDataId').val();
	  jsonObject.transactionId				= $('#transactionField').val();
	  console.log(jsonObject)
	  
	 $.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/rechargeRequestWS/checkPaymentStatus.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) { 	
						if(data != undefined){
							hideLayer();
							if(data.status){
								showMessage('success', 'Branch Recharge  Successfully !');
								$('#qrCodeMainModal').modal('hide');
								$('#rechargeRequestModal').modal('hide');
								resetBranchRechargeModal();
								isApproved =  true;
								stopTimer = true;
								stopInterval();
							}else{
								isApproved =  false;
							}
						}
					}
				});
 }
 
 function testing(){
	 if(counter === 40 || isApproved) {
		 stopInterval();
		 $('#qrCodeMainModal').modal('hide');
		 resetBranchRechargeModal();
	 } else {
		 if(allowStandardCustomFlowPhonePe)
			 checkNewPaymentStatus(jsonObjectPP);
		 else
			 checkPaymentStatus(jsonObjectPP);

		 counter++;
		 intervalId = setTimeout(testing, 15000);
	 }
 }
 
 
 function setprocessingFeesAndTotalPayableAmount(){
	let rechargeAmount = Number($('#rechargeAmount').val());
 
	if(rechargeAmount > 0){
		let amount = (rechargeAmount * deductPercentAmount) / 100;
		$('#processingFee').val(amount.toFixed(2));
		$('#totalPayableAmount').val((rechargeAmount + amount).toFixed(2));
	}else{
		$('#processingFee').val(0);
		$('#totalPayableAmount').val(0);
	}
 }
 

function sendQRCodeImage() {
	let mobile = $('#mobileNum').val().trim();

	if(!mobile || !/^\d{10}$/.test(mobile)) {
		showMessage('error', 'Please enter a valid 10-digit mobile number !');
		return;
	}

	let base64Image = getBase64QRCode();
	
	if (!base64Image) {
		alert('QR Code image not available.');
		return;
	}

	let jsonObjectPPP = new Object();
	jsonObjectPPP.mobileNumber 		= mobile;
	jsonObjectPPP.rechargeAmount	= $('#rechargeAmount').val();
	jsonObjectPPP.totalPayableAmount= $('#totalPayableAmount').val();
	jsonObjectPPP.transactionId 	= $('#transactionField').val();
	jsonObjectPPP.qrCodeImage 		= base64Image;
	jsonObjectPPP.paymentShortLink  = paymentShortLink;

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rechargeRequestWS/sendQRCodeOnWhatsapp.do',
		data: jsonObjectPPP,
		dataType: 'json',
		success: function(resultData) {
			hideLayer();
			showMessage(resultData.message.typeName, resultData.message.description);
		}, error: function() {
			hideLayer();
			showMessage('error', 'Error Occured !');
	 	}
	});
}

function getBase64QRCode() {
	let qrCanvas = document.querySelector('#QRCode canvas');
	
	if (qrCanvas)
		return qrCanvas.toDataURL('image/png');
	
	return null;
}

function prepareJsonPP(isDeductCharges) {
    if(Number($('#paymentModeId').val()) <= 0){
		$('#paymentModeId').focus();
		showMessage('info', 'Please Select Payment Mode !');
		return false;
	}

	if(Number($('#rechargeAmount').val()) <= 0){
		$('#rechargeAmount').focus();
		showMessage('info', 'Please Enter Recharge Amount !');
		return false;
	}
	
	if($('#rechargeRemark').val() == "" || $('#rechargeRemark').val() == undefined){
		$('#rechargeRemark').focus();
		showMessage('info', 'Please Enter Remark !');
		return false;
	}
	
	jsonObjectPP	= new Object();
	
	jsonObjectPP.branchName 		= $('#requestBranchName').val();
	jsonObjectPP.paymentModeId		= $('#paymentModeId').val();
	jsonObjectPP.rechargeRemark		= $('#rechargeRemark').val();
	jsonObjectPP.moduleId        	= PREPAID_RECHARGE_REQUEST;
	jsonObjectPP.rechargeAmount		= $('#rechargeAmount').val();
	jsonObjectPP.totalPayableAmount = $('#totalPayableAmount').val();

	if(isDeductCharges){
		if (Number($('#totalPayableAmount').val()) <= 0) {
			$('#totalPayableAmount').focus();
			showMessage('info', 'Please Enter Total Payable Amount !');
			return false;
		}

		jsonObjectPP.amountToBePaid = $('#rechargeAmount').val();
	}else{
		if (Number($('#amountToBePaid').val()) <= 0) {
			$('#amountToBePaid').focus();
			showMessage('info', 'Please Enter Amount To Be Paid !');
			return false;
		}

		jsonObjectPP.amountToBePaid = $('#amountToBePaid').val();
	}

    return true;
}
 
function checkNewPaymentStatus(jsonObject) {
	jsonObject.apiRequestResponseDataId = $('#apiReqResDataId').val();
	jsonObject.orderId 					= $('#orderIdField').val();
	jsonObject.tokenTypeId 				= $('#tokenTypeId').val();
	jsonObject.transactionId			= $('#transactionField').val();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rechargeRequestWS/checkNewPaymentStatus.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data != undefined) {
				hideLayer();
				if (data.status) {
					showMessage('success', 'Branch Recharge  Successfully !');
					
					if (jsonObject.tokenTypeId == 1)
						$('#qrCodeMainModal').modal('hide');
					else if (jsonObject.tokenTypeId == 2)
						resetAndCloseUPILinkShareModal();
				
					resetBranchRechargeModal();
					$('#rechargeRequestModal').modal('hide');
					isApproved = true;
					stopTimer = true;
					stopInterval();
				} else {
					isApproved = false;
				}
			}
		}
	});
}

function cancelNewPaymentRequest() {
	showLayer();
	resetAndCloseUPILinkShareModal();
	$('#qrCodeMainModal').modal('hide');
	stopTimer = true;
	iscancelled = true;
	stopInterval();
//	showMessage('success', "Payment Request Cancelled SuccessFully !");
	hideLayer();
}


function startTimer(durationInSeconds){
    clearInterval(timerInterval);

    const targetTime = Date.now() + (durationInSeconds * 1000);

    let initMinutes = Math.floor(durationInSeconds / 60);
    let initSeconds = durationInSeconds % 60;
    $("#countdown2").html(`${initMinutes}m ${initSeconds}s`);

    timerInterval = setInterval(function () {
        const timeLeft = targetTime - Date.now();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            stopInterval();         
            isApproved = false;
            document.getElementById('countdown2').innerHTML = 'Expired!';

            showMessage('warning', 'Payment link has expired!');

            setTimeout(() => {
                cancelNewPaymentRequest();
            }, 1200);

            return;
        }
        
        if (isApproved) {
            clearInterval(timerInterval);
            stopInterval();            
            return;
        }
		
		if (!Number.isFinite(timeLeft) || timeLeft <= 0) {
		   document.getElementById('countdown2').innerHTML = '00s';
		   return;
		 }

		 const totalSeconds = Math.floor(timeLeft / 1000);

		 const hours   = Math.floor(totalSeconds / 3600);
		 const minutes = Math.floor((totalSeconds % 3600) / 60);
		 const seconds = totalSeconds % 60;

		 const pad = (n) => String(n).padStart(2, '0');

		 let display = '';
		 if (hours > 0) {
		   display += `${pad(hours)}h `;
		 }
		 display += `${pad(minutes)}m ${pad(seconds)}s`;

		 document.getElementById('countdown2').innerHTML = display;

    }, 1000);
}

function resetAndCloseUPILinkShareModal() {
	$("#upiShareMobileNum").val("");
	$("#countdown2").html("");
	$("#countdownRow").hide();
	$("#amountFeild").val("");
	$("#orderIdField").val("");
	$("#transactionField").val("");
	$("#apiReqResDataId").val("");
	$("#merchantIdField").val("");
	clearInterval(timerInterval);
	$('#upiLinkShareModal').modal('hide');
	$('#tokenTypeId').val(0)
}

function generateNewQRCode(){
	clearTimeout(intervalId);

	if(allowToSendQROnWhatsapp){
		$('#mobileInputRow').show();
		$('#sendQRCodeBtnRow').show();
	}else{
		$('#mobileInputRow').hide();
		$('#sendQRCodeBtnRow').hide();
	}

	if (!prepareJsonPP(isDeductCharges))
		return false;

	paymentShortLink = '';
	showLayer();
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rechargeRequestWS/generateNewQRCode.do',
		data: jsonObjectPP,
		dataType: 'json',
		success: function(data) {
			console.log("data -- " + data.status);
			if (data.status) {
				$('#merchantIdField').val(data.merchantId);
				$('#amountFeild').val(data.rechargeAmount);
				$('#apiReqResDataId').val(data.apiRequestResponseDataId);
				$('#orderIdField').val(data.orderId);
				$('#transactionField').val(data.transactionId);
				$('#tokenTypeId').val(data.tokenTypeId);
				
				var upiQrString  = data.qrString;
				paymentShortLink = upiQrString;
				
				let timeLeft 		= Number(data.expiresIn);
				var qrCodeElement 	= document.getElementById("QRCode");

				while(qrCodeElement.firstChild){
					qrCodeElement.removeChild(qrCodeElement.firstChild);
				}

				qrCodeElement.innerHTML = "";


				var img = document.createElement("img");
				img.src = "data:image/png;base64," + upiQrString;
				img.width = 250;
				img.height = 250;
				qrCodeElement.appendChild(img);
				
				hideLayer();

				if (upiQrString != undefined) {
					openModal();
					timer(timeLeft);

					intervalId = setTimeout(testing, 30000);
				}
			} else if (data.status == undefined) {
				showMessage('error', 'Error Occured');
				hideLayer();
			}
		}
	});
}

function sendUPILinkToMobile() {
	if (!prepareJsonPP(isDeductCharges))
		return false;

	let mobile = $('#upiShareMobileNum').val().trim();

	if (!mobile || !/^\d{10}$/.test(mobile)) {
		showMessage('error', 'Please enter a valid 10-digit mobile number !');
		return;
	}

	jsonObjectPP.mobileNumber = mobile;

	showLayer();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rechargeRequestWS/sendUPILinkOnWhatsapp.do',
		data: jsonObjectPP,
		dataType: 'json',
		success: function(data) {
			if (data.status) {
				$('#amountFeild').val(data.rechargeAmount);
				$('#orderIdField').val(data.orderId);
				$('#apiReqResDataId').val(data.apiRequestResponseDataId);
				$('#merchantIdField').val(data.merchantId);
				$('#transactionField').val(data.transactionId);
				$('#tokenTypeId').val(data.tokenTypeId);
				
				$("#upiLinkShareModal").modal("show");

				let timeLeft = Number(data.expiresIn);
				startTimer(timeLeft);

				showMessage('success', "Payment Request Send SuccessFully !");

				$("#countdownRow").show();
				counter = 0;
				isApproved = false;
				testingNew();
			} else {
				showMessage('error', 'Something went wrong while sending link!');
			}

			hideLayer();
		}
	});
}

 function testingNew() {
    if(counter === 40 || isApproved) {
        stopInterval();
        clearInterval(timerInterval);
        resetAndCloseUPILinkShareModal();
        resetBranchRechargeModal();
        return;
    }

    checkNewPaymentStatus(jsonObjectPP);

    counter++;
    intervalId = setTimeout(testingNew, 15000);
}

