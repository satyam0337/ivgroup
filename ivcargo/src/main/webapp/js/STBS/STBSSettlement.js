var stbsBillClearanceConstant 					= null;
var PaymentTypeConstant 						= null;
var bankPaymentOperationRequired				= false;
var ModuleIdentifierConstant					= null;
var moduleId									= 0;
var incomeExpenseModuleId						= 0;
var tdsConfiguration							= null;
var previousDate								= null;
var allowBackDateEntryForStbsSettlement			= false;
var discountInPercent							= 0;
var tdsChargesArray								= 0;
var tdsRateLst									= new Array();
var GeneralConfiguration						= null;

function loadSTBSSettlementData() {

	showLayer();
	var jsonObject		= new Object();
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("STBSAjaxAction.do?pageId=286&eventId=10",
			{json:jsonStr}, function(data) {

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error message on top of the window.
					hideLayer();
				} else {
					jsondata						= data;
					executive						= jsondata.executive; // executive object
					configuration					= jsondata.configuration;
					stbsBillClearanceConstant		= jsondata.StbsBillClearanceConstant;
					PaymentTypeConstant				= jsondata.PaymentTypeConstant;
					ModuleIdentifierConstant		= data.ModuleIdentifierConstant;
					moduleId						= data.moduleId;
					incomeExpenseModuleId			= data.incomeExpenseModuleId;
					tdsConfiguration				= data.tdsConfiguration;
					previousDate					= data.previousDate;
			allowBackDateEntryForStbsSettlement		= data.allowBackDateEntryForStbsSettlement;
					discountInPercent				= data.discountInPercent;
					tdsChargesArray					= data.tdsChargesArray;
					GeneralConfiguration			= data.GeneralConfiguration;
					bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
					
					if(tdsConfiguration.IsCheckboxOptionToAllowTDS){
						$(".hideData").hide();
						$("#tdsCheckBox").removeClass('hide');
						$(".tdschk").removeClass('hide');
						if ( $("#tdsCheckBox").is(":checked") ) {

							$(".tdsRateCol").show();
						}else if ( $("#tdsCheckBox").not(":checked") ) {
							$(".tdsRateCol").hide();
						}

						if(typeof tdsChargesArray == 'undefined') {
							$('.tdsRateCol').remove();
						} else {
							var tdsRateList	= tdsChargesArray;

							for (var i = 0; i < tdsRateList.length; i++) {
								var tdsObject		= new Object();
								var tdsRate			= tdsRateList[i];
								tdsObject.tdsRate	= tdsRate + '%';
								tdsObject.tdsValue	= tdsRate;
								tdsRateLst.push(tdsObject);
							}

							$("#tdsRate").selectize({
								options 		: tdsRateLst,
								valueField 		: 'tdsValue',
								labelField 		: 'tdsRate',
								searchField 	: 'tdsRate',
								create			: false,
								maxItems 		: 1,
								onChange: function () {
									if($("#tdsCheckBox").is(":checked")){
										setTdsAmt();
									}
								}
							});
						}
					}else{
						$("#tdsCheckBox").hide();
						$(".tdsRateCol").hide();
					}
					
					if(configuration.allowSTBSCreationWithoutCollectionPerson) {
						$("#collectionPersonDiv").addClass("hide")
					} else {
						$("#collectionPersonDiv").removeClass("hide")
					}
					
					if (configuration.AllowAllSelectionForSTBSBillClearance) {
						$('.allselection').css("display", "block");	
					}else{
						$('.allselection').css("display", "none");
					}

					if(bankPaymentOperationRequired == 'true' || bankPaymentOperationRequired == true) {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					}
					
					$( function() {
						$('.chequeDate').val(dateWithDateFormatForCalender(new Date(),"-"));
						$('.chequeDate').datepicker({
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					} );

					if(allowBackDateEntryForStbsSettlement){
						backDateForAll();
						$(function() {
							$('.backDate').val(dateWithDateFormatForCalender(new Date(),"-"));
							$('.backDate').datepicker({
								maxDate		: new Date(),
								minDate		: previousDate,
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						});
					}
					hideLayer();
				}
			});
}

//work for htc for automatic bill clearance - Ravi Prajapati
// Modified By Ashish Tiwari
function clearBillSettlement(){
	
	var disabled = $("#receivedAmountValue").is(":disabled");
	var receivedBillAmount = document.getElementById('receivedAmountValue').value;
	
	if(!validateInput(1, 'receivedAmountValue', 'receivedAmountValue', 'receivedAmountValueError',  'Please Enter Amount For Settelement First...')) {
		return false;
	}

	if(!disabled){
		document.getElementById("receivedAmountValue").disabled = true;
		var finalAmnt = 0 ,receiveAmt = 0,balanceAmt = 0,diff = 0;
		var ArrayData	= new Array();
		var billObject = null;
		var tableEl = document.getElementById("reportTable");
		var clearBackGround 	= "#c7d854";
		var partialBackGround 	= "#ff9999";
		for(var i=0;i<wayBillIdArray.length;i++){
			finalAmnt = document.getElementById('finalAmount_'+wayBillIdArray[i]).value;
			receiveAmt = document.getElementById('receiveAmt_'+wayBillIdArray[i]).value;
			balanceAmt = document.getElementById('balanceAmt_'+wayBillIdArray[i]).value;

			if(receivedBillAmount > 0){
				diff = Number(receivedBillAmount) - Number(balanceAmt);
				if(receiveAmt > 0 && balanceAmt == 0){
					for(var j = 0;j<13;j++){
						tableEl.rows[i+1].cells[j].style.backgroundColor = clearBackGround;
					}
					continue;
				}
				if(diff > 0){//if clear payment
					$('#receiveAmt_'+wayBillIdArray[i]).val(Number(balanceAmt));
					$('#balanceAmt_'+wayBillIdArray[i]).val(0);
					for(var j = 0;j<13;j++){
						tableEl.rows[i+1].cells[j].style.backgroundColor = clearBackGround;
					}

				} else {//if partial payment
					$('#receiveAmt_'+wayBillIdArray[i]).val(Number(receivedBillAmount));
					$('#balanceAmt_'+wayBillIdArray[i]).val(Number(balanceAmt) - Number(receivedBillAmount));
					if($('#balanceAmt_'+wayBillIdArray[i]).val() == 0) {
						for(var j = 0;j<13;j++){
							tableEl.rows[i+1].cells[j].style.backgroundColor = clearBackGround;
						}
					} else {
						for(var j = 0;j<13;j++){
							tableEl.rows[i+1].cells[j].style.backgroundColor = partialBackGround;
						}
					}
				}
				receivedBillAmount = diff;
			}


			if(Number($('#balanceAmt_'+wayBillIdArray[i]).val()) == 0) {//to set status for clear payment
				$('#paymentStatus_'+wayBillIdArray[i]).val(stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);// clear status
				$('#paymentMode_'+wayBillIdArray[i]).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			} else if(Number($('#receiveAmt_'+wayBillIdArray[i]).val()) > 0 && Number($('#balanceAmt_'+wayBillIdArray[i]).val()) > 0){//to set status for partial payment
				$('#paymentStatus_'+wayBillIdArray[i]).val(stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);// partial payment
				$('#paymentMode_'+wayBillIdArray[i]).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			} 
			billObject = new Object();
			billObject.WayBillId    	= wayBillIdArray[i];
			billObject.WayBillNumber    = $('#wayBillNumber_'+wayBillIdArray[i]).val();
			billObject.ReceivedAmount	= $('#receiveAmt_'+wayBillIdArray[i]).val();
			billObject.BalanceAmount	= $('#balanceAmt_'+wayBillIdArray[i]).val();
			billObject.PaymentStatus	= $('#paymentStatus_'+wayBillIdArray[i]).val();
			ArrayData.push(billObject);

			$('#paymentStatus_' + wayBillIdArray[i]).change();
		}

		for(var j = 0; j < ArrayData.length; j++) {
			if(ArrayData[j].PaymentStatus == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID) {
				$('#partialPaymentMsgText').html("LR Number "+ ArrayData[j].WayBillNumber + " Will Be Partial Payment with Received Amount " + ArrayData[j].ReceivedAmount +" And Balance Amount Rs "+ ArrayData[j].BalanceAmount +".");
			}
		}
		$('#partialPaymentMsgText').css('font-weight', 'bold');

	}
}

function checkEventforProcessBillSettlement(event) {
	
	var key	= getKeyCode(event);
	
	if (key == 8 || key == 46 ) {
		return;
	}

	if (key == 13) {
		if (enterCount == 0) {
			clearBillSettlement();
			enterCount++;
		}
		return;
	} else {
		enterCount	= 0;
	}
}

function calcSlctdAmntTyp(){
	 var tableEl = document.getElementById("reportTable");
	var counter = 0;
//	for(var i=1;i< tableEl.rows.length-1 ; i++){
		
		document.getElementById('clearLrCount').value = 0;
		$('#partialLrCount').val(0);
		$('#negotiaitedLrCount').val(0);
		$('#notReceivedLrCount').val(0);
		$('#receivedAmnt').val(0);
		$('notReceivedAmnt').val(0);
		$('pendingAmnt').val(0);
		$('cashLrCount').val(0);
		$('cashAmount').val(0);
		$('chequeLrCount').val(0);
		$('chequeAmount').val(0);
		$('partialNotReceivedAmnt').val(0);
		$('negotiatedDiscountAmnt').val(0);
		
		
		var cashCount = 0;
		var chequeCount = 0;
		var clearCount = 0;
		var partialCount = 0;
		var negotiatedCount = 0;
		var notReceivedLrs = 0;
		var paymentType = 0;
		var paymentMode	= 0;
		var cashAmount = 0;
		var chequeAmount = 0;
		var negotiatedAmnt = 0;
		var receivedAmount = 0;
		var notReceivedAmount = 0;
		var waybillAmount = 0;	
		var totalReceivedAmount = 0;
		var pendingLrcount = 0;
		var partialNotReceivedAmnt = 0;
		var negotiatedDiscountAmnt = 0;
		
		for(var j=1;j<tableEl.rows.length-1 ;j++){
			
		 var wayBillId = tableEl.rows[j].cells[0].children[0].value;
			paymentMode = document.getElementById('paymentMode_'+wayBillId.split("_")[0]).value;
			paymentType = document.getElementById('paymentStatus_'+wayBillId.split("_")[0]).value;
			receivedAmount = document.getElementById('receiveAmt_'+wayBillId.split("_")[0]).value;
			waybillAmount = document.getElementById('finalAmount_'+wayBillId.split("_")[0]).value;
			
		 	if(receivedAmount >0 	||	paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_NOT_RECEIVED_ID){
		 		  
			if(paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID ){
				clearCount ++;
				document.getElementById('clearLrCount').value = clearCount;
				
			}else if(paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID){
				partialCount++;
				document.getElementById('partialLrCount').value = partialCount;
				partialNotReceivedAmnt += parseInt(waybillAmount)-parseInt(receivedAmount);
				document.getElementById('partialNotReceivedAmnt').value = partialNotReceivedAmnt ;
			}else if(paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_NEGOTIATED_ID){
				negotiatedCount++;
				document.getElementById('negotiaitedLrCount').value = negotiatedCount;
				negotiatedAmnt += parseInt(document.getElementById('balanceAmt_'+wayBillId.split("_")[0]).value);
				negotiatedDiscountAmnt += parseInt(waybillAmount)-parseInt(receivedAmount);
				document.getElementById('negotiatedDiscountAmnt').value = negotiatedDiscountAmnt;
			}else if(paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_NOT_RECEIVED_ID ){
				notReceivedLrs++;
				document.getElementById('notReceivedLrCount').value = notReceivedLrs;
				notReceivedAmount += parseInt(waybillAmount);
				document.getElementById('notReceivedAmnt').value =	notReceivedAmount;
				
			}
			if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID){
				cashCount++;
				document.getElementById('cashLrCount').value=cashCount;
				cashAmount += parseInt(receivedAmount);
				document.getElementById('cashAmount').value = cashAmount;
			}else  if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
					|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID
					|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID) {
					chequeCount ++;
					document.getElementById('chequeLrCount').value=chequeCount;
					chequeAmount += parseInt(receivedAmount);
					document.getElementById('chequeAmount').value = chequeAmount;
				}
		 	}
		 	
		 	if(paymentType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID ){
		 		totalReceivedAmount += parseInt(waybillAmount);
		 	} else {
		 		totalReceivedAmount += parseInt(receivedAmount);
		 	}
		 	document.getElementById('receivedAmnt').value = totalReceivedAmount;
		 	if(document.getElementById('chequeAmount_'+wayBillId.split("_")[0])){
			 	document.getElementById('chequeAmount_'+wayBillId.split("_")[0]).value = receivedAmount;
			}

		 	var pendingAmount = parseInt(parseInt(document.getElementById('receivedAmnt').value)+parseInt(document.getElementById('notReceivedAmnt').value)
			+parseInt(negotiatedAmnt)+parseInt(partialNotReceivedAmnt));
			document.getElementById('pendingAmnt').value = parseInt(document.getElementById('totalBillAmnt').value-pendingAmount );
			document.getElementById('totalPendingLrCount').value = parseInt(document.getElementById('totalLrCount').value)-( clearCount+partialCount+negotiatedCount+notReceivedLrs);  
		}
		
//	} 
}

function showHideChequeDetails(obj) {
	
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	
	if(bankPaymentOperationRequired == 'true' || bankPaymentOperationRequired == true) {
		$('#uniqueWayBillId').val($('#wayBillId_' + mySplitResult[1]).val());
		$('#uniqueWayBillNumber').val($('#wayBillNumber_' + mySplitResult[1]).val());
		$('#uniquePaymentType').val($('#paymentMode_' + mySplitResult[1]).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + mySplitResult[1] + " option:selected").text());
		hideShowBankPaymentTypeOptions(obj);
	} else {
		if(Number(obj.value) == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID 
				|| obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID 
				|| obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID) {
			
			
			$("#chequeNo_"+mySplitResult[1]).css("display", "block");
			$("#bankName_"+mySplitResult[1]).css("display", "block");
			$("#chequeDate_"+mySplitResult[1]).css("display", "block");
			$("#allLRchequeNumber").css("display", "block");
			$("#allLRbankName").css("display", "block");
			$("#allLRchequeDate").css("display", "block");
			changeView("chequeDetails_"+mySplitResult[1],"block");
			//document.getElementById('chequeNo_'+mySplitResult[1]).style.display = 'block';
			//document.getElementById('bankName_'+mySplitResult[1]).style.display = 'block';
			//document.getElementById('chequeDate_'+mySplitResult[1]).style.display = 'block';
		} else {
			$("#allLRchequeNumber").css("display", "none");
			$("#allLRbankName").css("display", "none");
			$("#allLRchequeDate").css("display", "none");
			changeView("chequeDetails_"+mySplitResult[1],"none");
		}
	}
}

function backDateForAll(){
	
	$("#backDateForAll").datepicker({
		showAnim	: "fold",
		maxDate		: new Date(curDate),
		minDate	: previousDate,
		dateFormat	: 'dd-mm-yy',
		onSelect: function(date) {
		    setBackDateForAll(date);
		}
		
	});
	
	$('#backDateForAll').val(dateWithDateFormatForCalender(curDate,"-"));
	
}

function setBackDateForAll(date) {
	
	var waybillId;
	var backDateParse 		= date.split("-");
	if(!wayBillIdArray || jQuery.isEmptyObject(wayBillIdArray)){
		return;
	}
	
	for(var i = 0; i < wayBillIdArray.length; i++) {
		waybillId 	= wayBillIdArray[i];

		if(!waybillId || jQuery.isEmptyObject(waybillId))
			continue;
		
		$("#backDate_"+ waybillId).datepicker('setDate', new Date(backDateParse[2], backDateParse[1] - 1, backDateParse[0]));
	}
}

function setPaymentTypeForSelected(){
	document.getElementById("selectAllforPaymentType").checked = false;
	if(!wayBillIdArray || jQuery.isEmptyObject(wayBillIdArray)){
		return false;
	}
	var counter 	= 0;
	var isChecked 	= false;
	var isTdsAllow 	= tdsConfiguration.IsTdsAllow;
	var paymenType 	= document.getElementById("paymentType").value;
	var waybillId;
	
	if(paymenType <= 0){
		for(var i = 0; i < wayBillIdArray.length; i++) {
			waybillId = wayBillIdArray[i];
			
			if(!waybillId || jQuery.isEmptyObject(waybillId))
				continue;
			
			document.getElementById('rowWayBillId_'+waybillId+"_1").checked = false;
		}
	}
	
	for(var i = 0; i < wayBillIdArray.length; i++) {
		waybillId = wayBillIdArray[i];
		
		if(!waybillId || jQuery.isEmptyObject(waybillId))
			continue;
		
		if($('#rowWayBillId_'+waybillId+'_1').exists() && $('#rowWayBillId_'+waybillId+'_1').is(":visible") ){
			var checkBox = $('#rowWayBillId_'+waybillId+'_1').prop('checked');
			
			if(checkBox){
				counter++;
				isChecked = true;
				$('#paymentStatus_'+waybillId).val(paymenType);
				
				if(isTdsAllow == true || isTdsAllow == 'true'){
					if(paymenType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID){			
						$('#receiveAmt_' + waybillId).val($('#finalAmount_' + waybillId).val());
						$('#txnAmount_' + waybillId).val($('#finalAmount_' + waybillId).val());
						$('#balanceAmt_' + waybillId).val(0);
					} else {
						$('#balanceAmt_' + waybillId).val($('#finalAmount_' + waybillId).val());
						$('#receiveAmt_' + waybillId).val(0);
						$('#txnAmount_' + waybillId).val(0);
					}
				} else {
					if(paymenType == stbsBillClearanceConstant.STBS_CLEARANCE_STATUS_CLEAR_PAYMENT_ID){			
						$('#receiveAmt_' + waybillId).val($('#finalAmount_' + waybillId).val());
						$('#balanceAmt_' + waybillId).val(0);
					} else {
						$('#balanceAmt_' + waybillId).val($('#finalAmount_' + waybillId).val());
						$('#receiveAmt_' + waybillId).val(0);
					}
				}
			}
		}
	}
	if(counter == wayBillIdArray.length){
		document.getElementById("selectAllforPaymentMode").checked = true;
	}
	return isChecked;
}

function setPaymentModeForSelected(){

	var counter = 0;
	
	if(!wayBillIdArray || jQuery.isEmptyObject(wayBillIdArray)){
		return false;
	}
	
	var isChecked 	= false;
	
	var paymentMode 	= document.getElementById("paymentMode").value;
	document.getElementById("paymentMode").value = paymentMode;
	var waybillId;

	
	for(var i = 0; i < wayBillIdArray.length; i++){
		
		waybillId = wayBillIdArray[i];
		
		if(!waybillId || jQuery.isEmptyObject(waybillId))
			continue;
		if(paymentMode <= 0){
			document.getElementById('rowWayBillId_'+waybillId+"_1").checked = false;
			document.getElementById("paymentMode_"+waybillId).disabled = false;
		} else {
			if($('#rowWayBillId_'+waybillId+'_1').exists() && $('#rowWayBillId_'+waybillId+'_1').is(":visible") ){
				var checkBox = $('#rowWayBillId_'+waybillId+'_1').prop('checked');
				
				if(checkBox){
					counter++;
					isChecked = true;
					$('#paymentMode_'+waybillId).prop('')
					document.getElementById("paymentMode_"+waybillId).disabled = true;
					$('#paymentMode_'+waybillId).val(paymentMode);
					changeDeliveryDetailsForSelected(waybillId,paymentMode);
				}
			}
		}
		
	}
	$('#storedPaymentDetails').empty();
	document.getElementById("selectAllforPaymentMode").checked 	= true;
	document.getElementById("selectAllforPaymentMode").value 	= true;
	return isChecked;
}


function changeDeliveryDetailsForSelected(waybillId,paymentMode){
	var wbId = waybillId;
	
	switch (paymentMode) {
	case PaymentTypeConstant.PAYMENT_TYPE_CASH_ID :
	case PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID:
		changeViewForSelected("chequeDetails_"+wbId,"none");
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID:
		changeViewForSelected("chequeDetails_"+wbId,"block");
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID:
		changeViewForSelected("chequeDetails_"+wbId,"block");
		break;
	case PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID:
		changeViewForSelected("chequeDetails_"+wbId,"block");
		break;
	case '0' :
		changeViewForSelected("chequeDetails_"+wbId,"none");
		break;
	default:
		break;
	}
}

function changeViewForSelected(id, view){
	$("#"+id).css('display', view);
}

function setTdsAmt(){
	if(tdsConfiguration.IsCheckboxOptionToAllowTDS){
		if ( $("#tdsCheckBox").is(":checked") ) {
			$(".hideData").hide();
			$(".tdsRateCol").show();
			var tdsRate		= $('#tdsRate').val();
			var tdsAmt		= 0;
			for(var i=0;i<wayBillIdArray.length;i++){
				$('#tdsRate_'+wayBillIdArray[i]).val(tdsRate);
				txnAmount = $('#txnAmount_'+wayBillIdArray[i]).val();
				tdsAmt = Math.round(txnAmount*(tdsRate/100));
				$('#tdsAmount_'+wayBillIdArray[i]).val(tdsAmt);
				$('#receiveAmt_'+wayBillIdArray[i]).val(txnAmount-tdsAmt);
			}
		}else if ( $("#tdsCheckBox").not(":checked") ) {
			$(".tdsRateCol").hide();
		}
	}else{
		$("#tdsCheckBox").hide();
		$(".tdsRateCol").hide();
	}	
}