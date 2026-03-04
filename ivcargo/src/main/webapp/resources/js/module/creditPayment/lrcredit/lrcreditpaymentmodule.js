var isCheck 			= true;
var remAmt			 	= 0;
var totalAmtadd 		= 0;
var totalNumberOfLR 	= 0;

var PaymentTypeConstant							= null;
var BillClearanceStatusConstant					= null;
var ExecutiveTypeConstant						= null;
var lrCreditConfig								= null;
var tdsConfiguration							= null;
var previousDate								= null;
var discountTypes								= null;
var CreditPaymentTypeConstants					= null;
var searchByCollectionPersonAllow				= false;
var isBackDateEntryAllow						= false;
var bankPaymentOperationRequired				= false;
var ModuleIdentifierConstant					= null;
var moduleId									= 0;
var incomeExpenseModuleId						= 0;
var executive									= null;
var chequeBounceRequired						= false;
var	allowChequeBouncePayment					= false;
var discountInPercent							= 0;
var isApplyTDS									= false;
var GeneralConfiguration						= null;
var tdsRate	= 0;
var	minDate										= null;

function loadShortCreditPaymentModule() {
	showLayer();
	var jsonObject		= new Object();
	jsonObject.filter	= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("ShortCreditPaymentModuleAjaxAction.do?pageId=236&eventId=18",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else{
					if(typeof createVideoLink != 'undefined') createVideoLink(data);
					jsondata							= data;
					PaymentTypeConstant					= data.PaymentTypeConstant;
					BillClearanceStatusConstant			= data.BillClearanceStatusConstant;
					ExecutiveTypeConstant				= data.ExecutiveTypeConstant;
					lrCreditConfig						= data.lrCreditConfig;
					tdsConfiguration					= data.tdsConfiguration;
					previousDate						= data.previousDate;
					tdsRate								= data.tdsRate;
					discountTypes						= data.discountTypes;
					CreditPaymentTypeConstants			= data.CreditPaymentTypeConstants;
					searchByCollectionPersonAllow		= data.searchByCollectionPersonAllow;
					isBackDateEntryAllow				= data.isBackDateEntryAllow;
					ModuleIdentifierConstant			= data.ModuleIdentifierConstant;
					moduleId							= data.moduleId;
					incomeExpenseModuleId				= data.incomeExpenseModuleId;
					executive							= data.executive;
					allowChequeBouncePayment			= data.allowChequeBouncePayment;
					chequeBounceRequired				= data.chequeBounceRequired;
					discountInPercent					= data.discountInPercent;
					GeneralConfiguration				= data.GeneralConfiguration;
					bankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true;
					minDate								= data.minDate;
									
					if(bankPaymentOperationRequired) {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					}

					
					showHideSelection();
					checkOnloadCond();
					setDestinationAutoComplete();
					setPartyNameAutoComplete();
					setCollectionPersonAutoComplete();

					hideLayer();
				}
			});
}

function setDestinationAutoComplete() {
	
	$("#searchBy, #searchByBranchId").autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=3",
		minLength: 3,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			$('#BranchId').val((ui.item.id).split('_')[0]);
			$('#partyBranchId').val((ui.item.id).split('_')[0]);
			
			if(lrCreditConfig.showCRNumberSearchInMultipleClear && Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#txnType').val()) == 2 && Number($('#moduleType').val()) == 2)
				searchSingleCR(ui.item.id.split('_')[0]);
			else if(lrCreditConfig.showPartyWiseOptionInMultipleClear && Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#moduleType').val()) == 3)
				searchCreditData(0);
			else if(lrCreditConfig.showBranchWiseOptionInMultipleClear && Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#moduleType').val()) == 4)
				searchCreditData(0);
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
	$("#crNumber").keypress(function(e) {
		var key = e.which;
		
	  	if(lrCreditConfig.showCRNumberSearchInMultipleClear 
				&& Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR 
				&& Number($('#txnType').val()) == 2 && Number($('#moduleType').val()) == 2 
				&& $('#BranchId').val() > 0 && key == 13) {
			searchSingleCR($('#BranchId').val());
		}
	});
}

function setPartyNameAutoComplete() {
	$("#partyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3",
		minLength: 3,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			$('#partyMasterId').val(ui.item.id);

			if((ui.item.label).indexOf('(') == -1)
				$('#consigneePartyName').val(ui.item.label);
			else
				$('#consigneePartyName').val((ui.item.label).substring(0, (ui.item.label).indexOf('(')));
			
			if(lrCreditConfig.showPartyWiseOptionInMultipleClear && Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#moduleType').val()) == 3)
				searchCreditData(ui.item.id);
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setCollectionPersonAutoComplete() {
	$("#searchCollectionPerson").autocomplete({
		source: "AutoCompleteAjaxAction.do?pageId=9&eventId=13&filter=13",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			$('#selectedCollectionPersonId').val(ui.item.id);
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setPaymentStatus(obj) {
	var objName 	= obj.name;
	var splitVal 	= objName.split("_");

	var paymentStatus = $("#paymentStatus_" + splitVal[1]).val();
	
	if(tdsConfiguration.IsTdsAllow && splitVal[0] != 'receiveAmt') {
		if(parseInt(obj.value) > 0 && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID 
				&& parseInt($("#grandTotal_" + splitVal[1]).val()) != parseInt(obj.value, 10)) {
			selectOptionByValue(document.getElementById("paymentStatus_" + splitVal[1]), BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
			$('#hiddenPaymentStatus_' + splitVal[1]).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
		}
	} else if(!tdsConfiguration.IsTdsAllow) {
		if(parseInt(obj.value) > 0 && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID 
				&& parseInt($("#grandTotal_" + splitVal[1]).val()) != parseInt(obj.value, 10)) {
			selectOptionByValue(document.getElementById("paymentStatus_" + splitVal[1]), BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
			$('#hiddenPaymentStatus_' + splitVal[1]).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
		}
	}
}

function resetParty(obj) {
	if(obj.id == 'partyName'){
		document.getElementById('partyMasterId').value = '0';
	}
}

function viewSummary(creditWayBillTxnId,wayBillNumber,dateToDisplay,wayBillId,txnTypeId) {
	window.open('viewBillSummary.do?pageId=236&eventId=16&creditWayBillTxnId='+creditWayBillTxnId+'&wayBillNumber='+wayBillNumber+'&dateToDisplay='+dateToDisplay+'&wayBillId='+wayBillId+'&txnTypeId='+txnTypeId,'mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}

function validatePartyReceiveAmount(obj1) {

	var reportTable = document.getElementById('reportTable');
	var maxRecAmt   = 0;
	
	if(document.getElementById("receiveAmt_Party")) {
		maxRecAmt = document.getElementById("receiveAmt_Party").value;
	}
	
	if(maxRecAmt > 0 && reportTable != null) {

		var objId 		= obj1.id;
		var splitVal 	= objId.split("_");
		var lrAmt 		= parseInt(document.getElementById("balanceAmt_" + splitVal[1]).value);
		
		if(obj1.checked == true ) {
			selectOptionByValue(document.getElementById("paymentStatus_" + splitVal[1]), BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
			selectOptionByValue(document.getElementById("paymentMode_" + splitVal[1]), PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			$('#hiddenPaymentStatus_' + splitVal[1]).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
			$('#hiddenPaymentMode_' + splitVal[1]).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);

			if(tdsConfiguration.IsTdsAllow) {
				$('#txnAmount_' + splitVal[1]).val(lrAmt);
				$('#receiveAmt_' + splitVal[1]).val($('#txnAmount_' + splitVal[1]).val() - $('#tdsAmt_' + splitVal[1]).val());
			} else {
				$('#receiveAmt_' + splitVal[1]).val(lrAmt);
			}
			
			validateReceiveAmount(document.getElementById("receiveAmt_" + splitVal[1]));

			if(remAmt <= 0 && totalAmtadd == maxRecAmt){alert("Received amount is Less..!! you can not select Lr For Clear payment..");}
			calRecAmt(obj1);
		} else {
			document.getElementById("paymentStatus_" + splitVal[1]).selectedIndex = 0;
			document.getElementById("paymentMode_" + splitVal[1]).selectedIndex = 0;
			$('#receiveAmt_' + splitVal[1]).val(0);
			$('#txnAmount_' + splitVal[1]).val(0);
			validateReceiveAmount(document.getElementById("receiveAmt_" + splitVal[1]));
			calRecAmt(obj1);
		}
	} 
}

function calRecAmt(obj) {
	var objName 	= obj.name;
	var splitVal 	= objName.split("_");

	if(tdsConfiguration.IsTdsAllow && splitVal[0] == 'receiveAmt') {
		return;
	}
	
	var reportTable = document.getElementById('reportTable');
	var maxRecAmt 	= 0;
	
	if(document.getElementById("receiveAmt_Party")) {
		maxRecAmt = document.getElementById("receiveAmt_Party").value;
	}
	
	remAmt	= maxRecAmt;
	
	

	var alertFlag;
	
	if(!lrCreditConfig.allowOnAccountEntryOnSinglePaymentReceive && maxRecAmt > 0 && reportTable != null) {
		totalAmtadd 		= 0;
		totalNumberOfLR 	= 0;
		
		for(var row = 1; row < (reportTable.rows.length - 1); row++) {
			if(tdsConfiguration.IsTdsAllow) {
				var recRowAmt	= $("#txnAmount_" + row).val();
			} else {
				var recRowAmt	= $("#receiveAmt_" + row).val();
			}
			
			totalAmtadd		= parseInt(totalAmtadd) + parseInt(recRowAmt);

			if(maxRecAmt < totalAmtadd) {
				var lrNo  	= document.getElementById("billNumber_" + row).value;
				totalAmtadd	= parseInt(totalAmtadd) - parseInt(recRowAmt);
				document.getElementById("check1_" + row).checked	= false;
				document.getElementById("paymentStatus_" + row).selectedIndex	= 0;
				document.getElementById("paymentMode_" + row).selectedIndex		= 0;
				$("#receiveAmt_" + row).val(0);
				alertFlag = true;
			}
		}
		
		
		remAmt = parseInt(maxRecAmt) - parseInt(totalAmtadd);
		if(alertFlag && remAmt > 0){alert("you can not select Lr No "+lrNo+" For Clear payment.. you can negotiate with : "+(remAmt)+" Rs");}
		updateRowInfo();
	}
	calTotalAmounts();
}

function updateRowInfo() {
	var maxRecAmt = $("#receiveAmt_Party").val();
	
	if(maxRecAmt > 0) {
		var summData1 = 'Remaining Clerance Amount : ' + remAmt + '&nbsp&nbsp&nbsp Total Amount Added : ' + totalAmtadd; 
		$('#summData1').html(summData1);
	}
}

function validateReceiveAmount(obj) {
	var objName 	= obj.name;
	var objVal		= 0;
	var splitVal 	= objName.split("_");
	
	var grandTotal 			= parseInt($("#grandTotal_" + splitVal[1]).val(), 10);
	var receivedAmtLimit	= parseInt($("#receivedAmtLimit_" + splitVal[1]).val(), 10);
	var txnAmount			= parseInt($("#txnAmount_" + splitVal[1]).val());
	
	if(tdsConfiguration.IsTdsAllow && splitVal[0] == 'receiveAmt') {
		if(txnAmount == 0) {
			showMessage('error', txnAmountErrMsg);
			changeTextFieldColor("txnAmount_" + splitVal[1], '', '', 'red');
			$('#receiveAmt_' + splitVal[1]).val(0);
			return false;
		}
	}

	if(receivedAmtLimit > 0) {
		grandTotal = grandTotal - receivedAmtLimit;
	}

	if(obj.value.length > 0) {
		objVal = parseInt(obj.value,10);
	}
	
	if(objVal > grandTotal) {
		showMessage('info', receivedAmtCantBeGTBalanceAmtInfoMsg(grandTotal));
		obj.value 	= 0;
		objVal 		= 0;
	}
	
	var maxRecAmt = $('#receiveAmt_Party').val();

	if(objVal > grandTotal && maxRecAmt > 0) {
		showMessage('info', receivedAmtCantBeGTBalanceAmtInfoMsg(grandTotal));
		obj.value 	= 0;
		objVal 		= 0;
	} 
	
	$("#balanceAmt_" + splitVal[1]).val(grandTotal - objVal);
	
	if(lrCreditConfig.isReceivedAmtValidationAllow){
		var balanceAmount		= parseInt($("#balanceAmt_" + splitVal[1]).val(), 10);
		
		if(balanceAmount < 0) {
			$("#receiveAmt_" + splitVal[1]).val(0);
			showMessage('error', receivedAmtCantBeGTBalanceAmtInfoMsg(balanceAmount));
			changeTextFieldColor("receiveAmt_" + splitVal[1], '', '', 'red');
			$("#balanceAmt_" + splitVal[1]).val($("#grandTotal_" + splitVal[1]).val() - $("#receiveAmt_" + splitVal[1]).val());
		} else {
			removeError("receiveAmt_" + splitVal[1]);
		}
	}

	if($("#balanceAmt_" + splitVal[1]).val() <= 0) {
		$('#hiddenPaymentStatus_' + splitVal[1]).val(BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		selectOptionByValue(document.getElementById("paymentStatus_" + splitVal[1]), BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
	} 

	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {

		var tableEl 		= document.getElementById("reportTable");
		var balanceAmount 	= 0;
		var receiveAmount 	= 0;

		for (var i = 1; i <= tableEl.rows.length -1; i++) {
			if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null) {
				var wayBillId = tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
				balanceAmount += parseInt($('#balanceAmt_' + wayBillId).val());
				receiveAmount += parseInt($('#receiveAmt_' + wayBillId).val());
			};
		}
		
		$('#balanceAmt_CreditClearanceTable-1').val(balanceAmount);
		$('#receiveAmt_CreditClearanceTable-1').val(receiveAmount);

	}
	calTotalAmounts();
}

function formValidation(obj) {
	var objName         = obj.name;
	var mySplitResult   = objName.split("_");
	var grandTotal      = parseInt($("#grandTotal_" + mySplitResult[1]).val(), 10);
	var paymentStatus   = $("#paymentStatus_" + mySplitResult[1]).val();
	var receiveAmtLmt	= parseInt($("#receivedAmtLimit_" + mySplitResult[1]).val(), 10);
	
	if(basicValidation(obj)) {
		if(!tdsConfiguration.IsTdsAllow) {
			if(paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
				if((parseInt(obj.value,10) + receiveAmtLmt) < grandTotal) {
					alert("You are selecting clear payment then please enter total amount !");
					document.getElementById(obj.id).value = 0;
					return false;
				}
			} else if(paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
				if((parseInt(obj.value,10) + receiveAmtLmt) == grandTotal) {
					alert("Please Select Clear Payment because Total Amount and Recieved Amnount are equal!");
					return false;	
				}
			}
		}

		return true;
	}
}

function validateElement(id,msg){
	var splitVal 	= id.split("_");
	var el 			= document.getElementById(id);
	var chkValue 	= 0;

	if(document.getElementById('paymentMode_'+splitVal[1]) != null && document.getElementById('paymentMode_'+splitVal[1]).value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {

		if(el.type == 'text' && splitVal[0] == 'chequeNumber'){
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			//msg = 'Please Enter '+msg+' !';
			if (chkValue <= 0 || el.value == 'Cheque No'){
				showMessage('error','Please Enter '+msg+' !');
				toogleElement('error','block');
				changeError1(id,'0','0');
				return false;
			} else {
				toogleElement('error','none');
				removeError(id);
			}
		}
		if(el.type == 'text' && splitVal[0] == 'bankName'){
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			//msg = 'Please Enter '+msg+' !';
			if (chkValue <= 0 || el.value == 'Bank Name'){
				showMessage('error','Please Enter '+msg+' !');
				toogleElement('error','block');
				changeError1(id,'0','0');
				return false;
			} else {
				toogleElement('error','none');
				removeError(id);
			}
		}
	}

	if(el.type == 'text'){
		var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
		var str = el.value.replace(reg, '');
		chkValue = str.length;
		msg = 'Please Enter '+msg+' !';
	} else if(el.type == 'select-one'){
		chkValue = el.value;
		msg = 'Please Select '+msg+' !';
	}
	if (chkValue <= 0){
		showMessage('error',msg);
		toogleElement('error','block');
		changeError1(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
	}
	return true;
}

function showHideChequeDetails(obj) {
	if(bankPaymentOperationRequired && $('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
		if(!validateElement('paymentStatus_CreditClearanceTable-1', 'Payment Status')){return false;}
	}
	
	var objName 		= obj.name;
	var mySplitResult 	= objName.split("_");
	$('#hiddenPaymentMode_' + mySplitResult[1]).val($('#paymentMode_' + mySplitResult[1]).val());
	
	if(bankPaymentOperationRequired) {
		$('#uniqueWayBillId').val($('#billId_' + mySplitResult[1]).val());
		$('#uniqueWayBillNumber').val($('#billNumber_' + mySplitResult[1]).val());
		$('#uniquePaymentType').val($('#paymentMode_' + mySplitResult[1]).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + mySplitResult[1] + " option:selected").text());
		
		if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
			$( "#storedPaymentDetails" ).empty();
		}
		
		var	corporateAccountId  = ($("#partyMasterIdNo_" + mySplitResult[1]).val());
		
		if(corporateAccountId == 0 || corporateAccountId == undefined){
			var	corporateAccountId	= $("#partyMasterIdforCheck").val();
		}
	
		var accountGroupId		= ($("#accountGroupId_" + mySplitResult[1]).val());
		var type				= ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT;
		var branchId			= $("#selectedBranchId").val();
		
		if(chequeBounceRequired){
			if($("#paymentMode_" + mySplitResult[1] + " option:selected").val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
					chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
					setTimeout(function(){
						var size = checkObjectSize(chequeBounceDetails);
						if(size > 0){
							if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0){
								if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
									isAllowChequePayment	= 1;
									hideShowBankPaymentTypeOptions(obj);
									$('#isAllowChequePayment_' + mySplitResult[1]).val(isAllowChequePayment);
								} else {
									setChequeBounceDetails(chequeBounceDetails);
									$('#paymentMode_' + mySplitResult[1]).val(0);
								}
							} else {
								setChequeBounceDetails(chequeBounceDetails);
								$('#paymentMode_' + mySplitResult[1]).val(0);
							}
						}else {
							hideShowBankPaymentTypeOptions(obj);
						}
					},500);
			} else {
				hideShowBankPaymentTypeOptions(obj);
			}
		} else {
			hideShowBankPaymentTypeOptions(obj);
		}
	} else {
		if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID) {
			
				var	corporateAccountId  = ($("#partyMasterIdNo_" + mySplitResult[1]).val());
				if(corporateAccountId == 0 || corporateAccountId == undefined){
					var	corporateAccountId	= $("#partyMasterIdforCheck").val();
				}
				var accountGroupId		= ($("#accountGroupId_" + mySplitResult[1]).val());
				var type				= ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT;
				var branchId			= $("#selectedBranchId").val();
				if(chequeBounceRequired){
					if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){

						chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
							
						setTimeout(function(){
						var size = checkObjectSize(chequeBounceDetails);
							
						if(size > 0){
							if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0){
								if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
									isAllowChequePayment	= 1;
									showChequePaymentMode(mySplitResult);
									$('#isAllowChequePayment_' + mySplitResult[1]).val(isAllowChequePayment);
								} else {
									setChequeBounceDetails(chequeBounceDetails);
									hideChequePaymentMode(mySplitResult);
									$('#paymentMode_' + mySplitResult[1]).val(0);
								}
							} else {
								setChequeBounceDetails(chequeBounceDetails);
								$('#paymentMode_' + mySplitResult[1]).val(0);
								document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'none';
								document.getElementById('bankName_' + mySplitResult[1]).style.display = 'none';
								document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'none';
								document.getElementById('remark_' + mySplitResult[1]).value = '';
								document.getElementById('chequeNumber_' + mySplitResult[1]).value = '';
								document.getElementById('bankName_' + mySplitResult[1]).value = '';
							}
						}else {
							document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'block';
							document.getElementById('bankName_' + mySplitResult[1]).style.display = 'block';
							document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'block';
						}
					},500);
				} else {
					document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'block';
					document.getElementById('bankName_' + mySplitResult[1]).style.display = 'block';
					document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'block';
				}
			} else {
				document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'block';
				document.getElementById('bankName_' + mySplitResult[1]).style.display = 'block';
				document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'block';
			}
		} else {
			document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'none';
			document.getElementById('bankName_' + mySplitResult[1]).style.display = 'none';
			document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'none';
			document.getElementById('remark_' + mySplitResult[1]).value = '';
			document.getElementById('chequeNumber_' + mySplitResult[1]).value = '';
			document.getElementById('bankName_' + mySplitResult[1]).value = '';
		}
	}
}

function showChequePaymentMode(mySplitResult){
	document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'block';
	document.getElementById('bankName_' + mySplitResult[1]).style.display = 'block';
	document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'block';
}

function hideChequePaymentMode(mySplitResult){
	document.getElementById('chequeNumber_' + mySplitResult[1]).style.display = 'none';
	document.getElementById('bankName_' + mySplitResult[1]).style.display = 'none';
	document.getElementById('chequeDate_' + mySplitResult[1]).style.display = 'none';
	document.getElementById('remark_' + mySplitResult[1]).value = '';
	document.getElementById('chequeNumber_' + mySplitResult[1]).value = '';
	document.getElementById('bankName_' + mySplitResult[1]).value = '';
}

function selectOptionByValue(selObj, val){
	var A= selObj.options, L= A.length;
	while(L){
		if (A[--L].value== val){
			selObj.selectedIndex= L;
			L= 0;
		}
	}
}

function fillclearText(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	} else {
		text.value = textValue;
	}
}

function showHideDate(date){
	var elObj = document.getElementById('searchByDate');
	if(elObj != null && elObj.checked){
		document.getElementById('dateTD').style.display = 'inline';
	}else{
		document.getElementById('dateTD').style.display = 'none';
		document.getElementById('fromDate').value = date; 
	}
}

function showHideSelection() {
	var typeOfSelection	= document.getElementById("typeOfSelection");
	var selectedTypeId	= typeOfSelection.options[typeOfSelection.selectedIndex].value;

	if (lrCreditConfig.showBothOptionInTxnTypeSelectionForMultipleClear && selectedTypeId == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR)
		changeView("txnTypeBothOption", "block");
	else
		changeView("txnTypeBothOption", "none");

	if(selectedTypeId == 0) {
		changeView("tableForBranchSearch","none");
		changeView("transActionTypeTbl","none");
		changeView("tableForNameSearch","none");
		changeView("tableForSelection","none");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		changeView("trancActionTd","none");
		changeView("findRW","table-row");
		changeView("BillSelectionType","none");
		changeView("moduleTypeId","block");
		
		showPartyTextField1();
	} else if(selectedTypeId == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR || selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_LR) {
		changeView("tableForBranchSearch","none");
		changeView("transActionTypeTbl","block");
		changeView("tableForNameSearch","none");
		changeView("tableForSelection","block");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		changeView("trancActionTd","block");
		changeView("selectTxnTypeId","block");
		changeView("BillSelectionType","block");
		changeView("moduleTypeId","none");
		
		if(selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_LR){
			changeView("findRW","table-row");
			changeView("BillSelectionType","none");
		} else {
			changeView("findRW","none");
			if(allowToCalculateTDSOnManualPercentage)
				$('#applyTDSCheck').show();
		}
		
		showPartyTextField1();
	} else if(selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_TYPE_WISE || selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE) {
		changeView("tableForBranchSearch","block");
		changeView("transActionTypeTbl","block");
		changeView("tableForNameSearch","none");
		changeView("tableForSelection","none");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		changeView("trancActionTd","block");
		changeView("findRW","table-row");
		changeView("BillSelectionType","block");
		changeView("selectTxnTypeId","block");
		
		if(lrCreditConfig.showCRNumberSearchInMultipleClear)
			changeView("moduleTypeId","none");
		
		showPartyTextField1();

	} else if(selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_ALL) {
		changeView("tableForBranchSearch","block");
		changeView("transActionTypeTbl","block");
		changeView("tableForNameSearch","none");
		changeView("tableForSelection","none");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		changeView("findRW","table-row");
		changeView("BillSelectionType","block");
		if(showBillSelectionTypeId){
			changeView("trancActionTd","block");
			changeView("selectTxnTypeId","none");
		}else{
			changeView("trancActionTd","none");
			changeView("selectTxnTypeId","block");
		}
		showPartyTextField1();
	} else if(selectedTypeId == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_CR) {
		changeView("tableForBranchSearch","none");
		changeView("transActionTypeTbl","none");
		changeView("tableForNameSearch","none");
		changeView("tableForSelection","none");
		changeView("crNumberSelection","block");
		changeView("branchAutoComplete","inline-block");
		changeView("trancActionTd","none");
		changeView("findRW","table-row");
		showPartyTextField1();
	} else {
		changeView("tableForBranchSearch","none");
		changeView("transActionTypeTbl","block");
		changeView("tableForNameSearch","block");
		changeView("tableForSelection","none");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		changeView("trancActionTd","block");
		changeView("findRW","table-row");
		changeView("BillSelectionType","block");
		showPartyTextField1();
	}

	changeView("singleBranchSelection","none");
	changeView("singleBranchAutoComplete","none");
	document.getElementById('summDataTableHeaderRow').style.display  = 'none';
	document.getElementById('searchById').value = 0;
	document.getElementById('branchIdForCheck').value = 0;
	isCheck = true;
	
	$( function() {
		$('#backDate').val(dateWithDateFormatForCalender(new Date(curDate),"-"));
		$('#backDate').datepicker({
			maxDate		: new Date(curDate),
			minDate		: previousDate,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	});
	
	if(minDate != null && minDate != undefined && minDate != ""){
			$( function() {
			$('#fromDate1').datepicker({
				maxDate		: new Date(),
				minDate		: minDate,
				showAnim	: "fold",
				dateFormat	: 'dd-mm-yy'
			});
		});
	}else{	
		$( function() {
			$('#fromDate1').datepicker({
				maxDate		: new Date(),
				showAnim	: "fold",
				dateFormat	: 'dd-mm-yy'
			});
		});
	}
	  
	$( function() {
		$('#toDate1').datepicker({
			maxDate		: new Date(),
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	});
	
	$( function() {
		$('#fromDate').datepicker({
			maxDate		: new Date(),
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	});
}

function moduleTypeWiseShowHideSelection() {
		deleteTable();
	
	var moduleTypeId	= Number($('#moduleType').val());
	
	if(lrCreditConfig.showPartyWiseOptionInMultipleClear) {
		if(moduleTypeId	== 1) {
			changeView("tableForSelection","inline");
			changeView("crNumberSelection","none");
			changeView("branchAutoComplete","none");
			$('#applyTDSCheck').hide();
			changeView("partyWiseSelection","none");
			changeView("singleBranchSelection","none");
			changeView("singleBranchAutoComplete","none");
		} else if(moduleTypeId	== 2) {
			changeView("crNumberSelection","inline");
			changeView("branchAutoComplete","inline");
			changeView("tableForSelection","none");
			document.getElementById('crNumber').value='';
			document.getElementById('crNumber').focus();
			$('#CreditPaymentModuleId').removeClass('hide');
			$('#BranchId').val(0);
			$('#partyBranchId').val(0);
			$('#searchBy').val('');
			$('#searchByBranchId').val('');
			$('#applyTDSCheck').show();
			changeView("partyWiseSelection","none");
			changeView("singleBranchSelection","none");
			changeView("singleBranchAutoComplete","none");
		} else if(moduleTypeId	== 3) {
			changeView("tableForSelection","none");
			changeView("crNumberSelection","none");
			$('#BranchId').val(0);
			$('#partyBranchId').val(0);
			$('#searchBy').val('');
			$('#searchByBranchId').val('');
			$('#applyTDSCheck').show();
			if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
				changeView("singleBranchSelection","inline");
				changeView("singleBranchAutoComplete","inline-block");
				changeView("partyWiseSelection","block");
				changeView("clearanceId","none");
			}
		}
		document.getElementById('partyName').value = '';
		document.getElementById('partyMasterId').value = '0';
		document.getElementById('receiveAmt_Party').value = '';
		return;
	}
	
	if(lrCreditConfig.showBranchWiseOptionInMultipleClear) {
			if(moduleTypeId	== 1) {
				changeView("tableForSelection","inline");
				changeView("crNumberSelection","none");
				changeView("branchAutoComplete","none");
				$('#applyTDSCheck').hide();
				changeView("partyWiseSelection","none");
				changeView("singleBranchSelection","none");
				changeView("singleBranchAutoComplete","none");
			} else if(moduleTypeId	== 2) {
				changeView("crNumberSelection","inline");
				changeView("branchAutoComplete","inline");
				changeView("tableForSelection","none");
				document.getElementById('crNumber').value='';
				document.getElementById('crNumber').focus();
				$('#CreditPaymentModuleId').removeClass('hide');
				$('#BranchId').val(0);
				$('#partyBranchId').val(0);
				$('#searchBy').val('');
				$('#searchByBranchId').val('');
				$('#applyTDSCheck').show();
				changeView("partyWiseSelection","none");
				changeView("singleBranchSelection","none");
				changeView("singleBranchAutoComplete","none");
			} else if(moduleTypeId	== 3) {
				changeView("tableForSelection","none");
				changeView("crNumberSelection","none");
				$('#BranchId').val(0);
				$('#partyBranchId').val(0);
				$('#searchBy').val('');
				$('#searchByBranchId').val('');
				$('#applyTDSCheck').show();
				if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
					changeView("singleBranchSelection","inline");
					changeView("singleBranchAutoComplete","inline-block");
					changeView("partyWiseSelection","block");
					changeView("clearanceId","none");
				}
			}else if(moduleTypeId	== 4) {
				changeView("tableForSelection","none");
				changeView("crNumberSelection","none");
				$('#BranchId').val(0);
				$('#partyBranchId').val(0);
				$('#searchBy').val('');
				$('#searchByBranchId').val('');
				$('#applyTDSCheck').show();
				if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
					changeView("singleBranchSelection","inline");
					changeView("singleBranchAutoComplete","inline-block");
				}
			}
			return;
		}
	
	if(!lrCreditConfig.showCRNumberSearchInMultipleClear)
		return;
	
	if(Number($('#txnType').val()) == 1 || Number($('#txnType').val()) == 0)
		return;
	
	if(moduleTypeId	== 1) {
		changeView("tableForSelection","inline");
		changeView("crNumberSelection","none");
		changeView("branchAutoComplete","none");
		$('#applyTDSCheck').hide();
	} else if(moduleTypeId	== 2) {
		changeView("crNumberSelection","inline");
		changeView("branchAutoComplete","inline");
		changeView("tableForSelection","none");
		document.getElementById('crNumber').value='';
		document.getElementById('crNumber').focus();
		$('#CreditPaymentModuleId').removeClass('hide');
		$('#BranchId').val(0);
		$('#partyBranchId').val(0);
		$('#searchBy').val('');
		$('#searchByBranchId').val('');
		$('#applyTDSCheck').show();
	}
}

function changeView(id, view){
	if(document.getElementById(id) != null){
		document.getElementById(id).style.display = view;
	}
}

function HideShowDateRange(){
	if(document.getElementById('DateRange').checked == true){
		changeView("fromDateRow", "inline-block");
		changeView("toDateRow", "inline-block");
	}else{
		changeView("fromDateRow", "none");
		changeView("toDateRow", "none");
	}
}

function changeOnTxnType() {
	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
		deleteTable();
		
		if(lrCreditConfig.showCRNumberSearchInMultipleClear) {
			$('#moduleType').val(0);
			
			if(Number($('#txnType').val()) == 1) {
				changeView("tableForSelection","block");
				changeView("moduleTypeId","none");
				changeView("crNumberSelection","none");
				changeView("branchAutoComplete","none");
			} else if(Number($('#txnType').val()) == 2) {
				changeView("tableForSelection","none");
				changeView("moduleTypeId","block");

				if(Number($('#moduleType').val()) == 2) {
					changeView("crNumberSelection","inline");
					changeView("branchAutoComplete","inline");
				} else {
					changeView("crNumberSelection","none");
					changeView("branchAutoComplete","none");
				}
			}
		} else if(lrCreditConfig.showPartyWiseOptionInMultipleClear) {
			changeView("moduleTypeId","block");
			$('#moduleType').val(0);
			changeView("tableForSelection","none");
			changeView("singleBranchSelection","none");
			changeView("singleBranchAutoComplete","none");
			changeView("partyWiseSelection","none");
		} else if(lrCreditConfig.showBranchWiseOptionInMultipleClear) {
			changeView("moduleTypeId","block");
			$('#moduleType').val(0);
			changeView("tableForSelection","none");
			changeView("singleBranchSelection","none");
			changeView("singleBranchAutoComplete","none");
			changeView("partyWiseSelection","none");
		}
	}
}

function changeOnModuleType(){
	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
		deleteTable();
	}
}

function deleteTable(){
	if(document.getElementById('reportTable') != null){
		$("#reportTable tbody").remove();
		$("#reportTable").find('tr').slice(1).remove();
		changeView("reportData","none");
		document.getElementById('headerRow_0').style.display 	 		= 'none';
		document.getElementById('summDataTableHeaderRow').style.display = 'none';
		document.getElementById('upSaveTable').style.display     		= 'none';
		document.getElementById('downSaveTable').style.display   		= 'none';
	}
	if(document.getElementById('summDataTable') != null){
		$("#summDataTable tbody tr:not(:first-child)").remove();
	}
	if(document.getElementById('reportTable1') != null){
		$(reportTable1).empty();
	}
	document.getElementById('searchById').value = 0;
	document.getElementById('branchIdForCheck').value = 0;
	
	isCheck = true;
	$(tbody).empty();
}

function changeOntypeOfSelectionType(){
	showHideSelection();
	clearTableElements();
	deleteTable();
	changeView("reportData","none");
}

function clearTableElements(){
	document.getElementById('txnType').selectedIndex = 0;
	document.getElementById('wbNumber').value = '';
	
	if(document.getElementById('searchCollectionPerson') != null){
		document.getElementById('searchCollectionPerson').value = '';
		document.getElementById('selectedCollectionPersonId').value = '0';
	}

	if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
		document.getElementById('region').selectedIndex = 0;
		populateSubRegions(document.getElementById('region'));
		document.getElementById('branch').selectedIndex = 0;
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
		document.getElementById('subRegion').selectedIndex = 0;
		populateBranchesBySubRegionId(document.getElementById('subRegion').value, 'branch', false, true);;
		document.getElementById('branch').selectedIndex = 0;
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
		document.getElementById('branch').selectedIndex = 0;
	}
	
	if($('#billSelectionTypeId').exists()) {
		document.getElementById('billSelectionTypeId').selectedIndex = 0;
	}
	
	if($('#backDateDiv').exists() && $('#backDateDiv').is(":visible")) {
		$('#backDateDiv').hide();
	} else {
		$('#backDateDiv').show();
	}
}

function resetDestinationPointData() {
	document.getElementById('BranchId').value = '0';
	document.getElementById('partyBranchId').value = '0';
}

function resetCheckBox(){
	var reportTable = document.getElementById('reportTable');
	var lrTotalBalAmount = Number($('#lrTotalBalAmount').val());
	if(reportTable != null){
		for(var row = 1; row < (reportTable.rows.length - 1); row++) {
			document.getElementById("paymentStatus_"+row).selectedIndex=0;
			document.getElementById("paymentMode_"+row).selectedIndex=0;
			document.getElementById("receiveAmt_"+row).value=0;
			document.getElementById("check1_"+row).checked=false; 
		}; 
		totalAmtadd = 0;
	}  
	var maxRecAmt = document.getElementById("receiveAmt_Party").value;
	remAmt=maxRecAmt;
	
	
	if(lrCreditConfig.allowOnAccountEntryOnSinglePaymentReceive) {
		$('#receivePartyAmt').val(Number(document.getElementById("receiveAmt_Party").value));
		if(reportTable != null) {
			for(var elementId = 1; elementId < (reportTable.rows.length - 1); elementId++) {
				$('#balanceAmt_' + elementId).val(Number($('#saveBalanceAmt_' + elementId).val()));
				$('#txnAmount_' + elementId).val(0);
				$('#tdsAmt_' + elementId).val(0);
			}
			
			calTotalAmounts();
		}
		
		document.getElementById("paryWisePaymentMode").selectedIndex=0;
		
		if(lrTotalBalAmount < maxRecAmt) {
			showMessage('error',"Can't Pay Amount Greter Than Total LR Balance Amount....");
			$('#lrTotalAmount').focus();
			$('#receiveAmt_Party').val(0);
			return;
		}
	} else
		updateRowInfo();
}

function selectLrWithinReceiveAmount() {
	var maxRecAmt = Number(document.getElementById("receiveAmt_Party").value);
	if(!lrCreditConfig.allowOnAccountEntryOnSinglePaymentReceive && maxRecAmt > 0)
		return;
	
	var reportTable = document.getElementById('reportTable');
	var balRecAmt = maxRecAmt;
	var receiveAmtTotal 	= 0;
	var balanceAmount		= 0;
	var receivedAmtLimit	= 0;
	var totalAmt			= 0;
	var actTotalAmt			= 0;

	$('#receivePartyAmt').val(maxRecAmt);
	
	if(maxRecAmt == 0) {
		showMessage('error',"PLease Enter Receive Amount..... ");
		$('#lrTotalAmount').focus();
		resetCheckBox();
		return;
	}
	
	if(reportTable != null) {
		for(var elementId = 1; elementId < (reportTable.rows.length - 1); elementId++) {
			balanceAmount	= Number($('#saveBalanceAmt_' + elementId).val());
			receivedAmtLimit= parseInt($("#receivedAmtLimit_" + elementId).val());
			totalAmt		= parseInt($("#grandTotal_" + elementId).val());
			actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
			
			receiveAmtTotal += balanceAmount;

			if(receiveAmtTotal <= maxRecAmt) {
				document.getElementById("paymentStatus_" + elementId).selectedIndex = 1;
			
				if(tdsConfiguration.IsTdsAllow) {
					$("#txnAmount_" + elementId).val(actTotalAmt);
					$("#receiveAmt_" + elementId).val($("#txnAmount_" + elementId).val() - $("#tdsAmt_" + elementId).val());
					$("#receiveAmt_" + elementId).attr('readonly', true);
				} else {
					$("#receiveAmt_" + elementId).attr('readonly', false);
					$("#receiveAmt_" + elementId).val(actTotalAmt);
				}
				
				$("#balanceAmt_" + elementId).val(0);
		
				calTotalAmounts();
				allowTdsOnPaymentTypeSelection(elementId);
				document.getElementById("check1_" + elementId).checked = true;
				$('#hiddenPaymentStatus_' + elementId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
				balRecAmt -= balanceAmount;
				
				if(balRecAmt == 0)
					break;
			} else if((balRecAmt < maxRecAmt) || balRecAmt < balanceAmount) {
				$("#balanceAmt_" + elementId).val(actTotalAmt);
				$("#receiveAmt_" + elementId).val(0);
		
				if(tdsConfiguration.IsTdsAllow) {
					$("#receiveAmt_" + elementId).val(balRecAmt);
					$("#txnAmount_" + elementId).val(balRecAmt);
					$("#receiveAmt_" + elementId).attr('readonly', true);
				} else {
					$("#receiveAmt_" + elementId).attr('readonly', false);
					$("#receiveAmt_" + elementId).val(balRecAmt);
					$("#txnAmount_" + elementId).val(balRecAmt);
				}
				
				$("#balanceAmt_" + elementId).val(balanceAmount-balRecAmt);
				calTotalAmounts(balanceAmount-balRecAmt);
				document.getElementById("paymentStatus_" + elementId).selectedIndex = BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID;
				document.getElementById("check1_" + elementId).checked = true;
				allowTdsOnPaymentTypeSelection(elementId);
				$('#hiddenPaymentStatus_' + elementId).val(BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
				break;
			} else {
				document.getElementById("check1_"+elementId).checked=false;
			}
		}
	}
}

function noNumber(e ,obj){
	var keynum;

	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8){
		return true;
	}
	if (keynum < 48 || keynum > 57) {
		return false;	
	}
	return basicValidation(obj);
}

function isNumberKeyWithTwoDecimalInput(evt, obj) {
	let charCode = evt.which ? evt.which : evt.keyCode;

	if (charCode <= 31) return true;

	if (charCode == 46) {
		let txt = obj.value;
		if (!(txt.indexOf(".") > -1))
			return true;
	}

	if (charCode >= 48 && charCode <= 57) {
		let txt = obj.value;
		let decimalPos = txt.indexOf(".");
		if (decimalPos != -1) {
			let decimals = txt.substring(decimalPos + 1);
			if (decimals.length >= 2) {
				return false;
			}
		}
		return basicValidation(obj);
	}

	return false;
}

function isValidPaymentMode(paymentMode) {
	if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID 
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID 
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID 
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID 
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
		return true;
	}
	
	return false;
}

function basicValidation(obj) {

	var mySplitResult 	= obj.name.split("_");
	
	var paymentMode		= 0;
	
	if(bankPaymentOperationRequired) {
		if(!validateElement('paymentMode_' + mySplitResult[1], 'Payment Mode')){return false;}
		
		if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
			if(!validateElement('paymentStatus_CreditClearanceTable-1', 'Payment Status')){return false;}
			if(!validateElement('paymentMode_CreditClearanceTable-1', 'Payment Mode')){return false;}

			paymentMode			= $("#paymentMode_CreditClearanceTable-1").val();
			var receiveAmount	= $("#receiveAmt_CreditClearanceTable-1").val();
			var rowCount 		= $('#storedPaymentDetails tr').length;
			
			if(isValidPaymentMode(paymentMode) && receiveAmount > 0 && rowCount <= 0) {
				showMessage('info', 'Please, Add Payment details !');
				return false;
			}
		} else if(lrCreditConfig.clearPartyWiseMultiplePaymentInSinglePaymentMode && $('#typeOfSelection').val() == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE) {
			paymentMode			= $("#paryWisePaymentMode").val();
			var receiveAmount	= $("#totalReceivedAmt").html();
			var rowCount 		= $('#storedPaymentDetails tr').length;
			
			if(isValidPaymentMode(paymentMode) && receiveAmount > 0 && rowCount <= 0) {
				showMessage('info', 'Please, Add Payment details !');
				return false;
			}
		} else {
			var wayBillNumber	= $("#billNumber_" + mySplitResult[1]).val();
			var wayBillId		= $("#billId_" + mySplitResult[1]).val();
			var receiveAmount	= $("#receiveAmt_" + mySplitResult[1]).val();
			paymentMode			= $("#paymentMode_" + mySplitResult[1]).val();
			
			if(isValidPaymentMode(paymentMode) && receiveAmount > 0) {
				if(!$('#paymentDataTr_' + wayBillId).exists()) {
					showMessage('info', 'Please, Add Payment details for this LR ' + wayBillNumber + ' !');
					return false;
				}
			}
		}
	} else {
		if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
			if(!validateElement('paymentStatus_CreditClearanceTable-1', 'Payment Status')){return false;}
			if(!validateElement('paymentMode_CreditClearanceTable-1', 'Payment Mode')){return false;}
			paymentMode		= $("#paymentMode_CreditClearanceTable-1").val();
		} else {
			paymentMode		= $("#paymentMode_" + mySplitResult[1]).val();
		}
		
		if(!validateElement('paymentMode_' + mySplitResult[1], 'Payment Mode')){return false;}
		
		if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID || paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID) {
			if(!validateElement('chequeNumber_' + mySplitResult[1],'Cheque Number')){return false;}
			if(!validateElement('bankName_' + mySplitResult[1],'Bank Name')){return false;}
			if(!validateElement('paymentStatus_' + mySplitResult[1],'Payment Status')){return false;}
		}
	}

	return true;
}

function reportFormValidations() {

	var cAcc=document.getElementById('CreditorId');
	if(cAcc.value == 0){
		showMessage('error',creditorSelectErrMsg);
		toogleElement('error','block');
		changeError1('CreditorId','0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError('CreditorId');
	} 

	return true;	
}

function panNumChecker(id){
	var panNum = document.getElementById(id);
	var pattern = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
	var tdsAmt	= document.getElementById('tdsAmt_'+id.split('_')[1]);
	var tdsAmtVal	= parseInt(tdsAmt.value,10);

	if(tdsAmtVal != 0){ // if TDS is 0 then do not apply TDS checking effect

		if(!validateElement(id,'PAN Number')){return false;}

		if(!panNum.value.match(pattern)){
			showMessage('error',"Invalid PAN Card Number");
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		}else{
			toogleElement('error','none');
			removeError(id)
			return true;
		}

	}else{
		return true;
	}
}

function tanNumChecker(id){
	var tanNum = document.getElementById(id);
	var pattern = /^([a-zA-Z]){4}([0-9]){5}([a-zA-Z]){1}?$/;
	var tdsAmt	= document.getElementById('tdsAmt_'+id.split('_')[1]);
	var tdsAmtVal	= parseInt(tdsAmt.value,10);
	
	if(tdsAmtVal != 0){ // if TDS is 0 then do not apply TDS checking effect
		
		if(!validateElement(id,'TAN Number')){return false;}
		
		if(!tanNum.value.match(pattern)){
			showMessage('error',"Invalid TAN Number");
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		}else{
			toogleElement('error','none');
			removeError(id)
			return true;
		}
		
	}else{
		return true;
	}
}

function resetError(el){
	toogleElement('error','none');
	toogleElement('msg','none');
	removeError(el.id);
}

function storeSelectedValues(){
	var selectedRegion = document.getElementById('region');
	if(selectedRegion != null){
		document.getElementById('selectedRegion').value = selectedRegion.options[selectedRegion.selectedIndex].text;
	}
	var selectedSubRegion = document.getElementById('subRegion');
	if(selectedSubRegion != null){
		document.getElementById('selectedSubRegion').value = selectedSubRegion.options[selectedSubRegion.selectedIndex].text;
	}
	var selectedBranch = document.getElementById('branch');
	if(selectedBranch != null){
		document.getElementById('selectedBranch').value = selectedBranch.options[selectedBranch.selectedIndex].text;
	}
}

function selectAllWayBillToCreateBill(param){
	var tab 	= document.getElementById("reportTable");
	var count 	= parseFloat(tab.rows.length-1);
	var row;
	if(param == true) {
		for (row = count; row > 0; row--) {
			if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && !tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
			}
		}
	} else if(param == false) {
		for (row = count; row > 0; row--) {
			if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;
			}
		}
	}
}

function printPlainData(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader){
	var consigneeName = null;
	if(document.getElementById("partyMasterId") != null && document.getElementById("partyMasterId").value != 0){
		consigneeName = document.getElementById("partyName").value;
	}
	if(consigneeName != null){
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&consigneeName='+consigneeName , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}else{
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
	window.setTimeout(waitForPlainDelay, 500);
}

function waitForPlainDelay() {
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData2').innerHTML;
	childwin.print();
}

function laserPrintData1(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader){
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForLaserPrintData, 500);
}

function waitForLaserPrintData() {
	var dataTableId 	= 'reportTable2';
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData2').innerHTML;
	
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#'+dataTableId,childwin.document).css('width','100%');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text3');
	$('input',childwin.document).css('border','0px');
	$('input',childwin.document).removeClass().addClass('datatd_plain_text3');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text3').css({"font-weight":"bold","font-size":"40px",'letter-spacing': '7px', 'text-align': 'center'});
	$('#branchAddress',childwin.document).removeClass().addClass('datatd_plain_text3').css({"font-size":"25px",'text-align': 'center'});
	$('#branchPhoneNo',childwin.document).removeClass().addClass('datatd_plain_text3').css({"font-size":"25px",'text-align': 'center'});
	$('#headerTitle',childwin.document).removeClass().addClass('datatd_plain_text3').css({"font-weight":"bold","font-size":"30px",'text-align': 'center'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text3').css("font-weight", "bold");

	childwin.print();
}

function changeSelection(val){
	if(val == 4){
		document.getElementById('tableForBranchSearch').style.display='none'; 
		document.getElementById('tableForSelection').style.display='none';
		document.getElementById('tableForNameSearch').style.display='block';
	} else {
		document.getElementById('tableForBranchSearch').style.display='block'; 
		document.getElementById('tableForSelection').style.display='block';
		if(document.getElementById('tableForNameSearch') != null){
			document.getElementById('tableForNameSearch').style.display='none';
		}
		if(document.getElementById('searchCollectionPerson') != null){
			document.getElementById('searchCollectionPerson').value ='';
		}
		if(document.getElementById('selectedCollectionPersonId') != null){
			document.getElementById('selectedCollectionPersonId').value = 0;
		}
	}
	resetError(this);
}

function disableButtons(){
	var downButton = document.getElementById("DownSaveButton");
	if(downButton != null){
		downButton.className = 'btn_print_disabled';
		downButton.disabled=true;
		downButton.style.display ='none'; 
	}
	var upButton = document.getElementById("UpSaveButton");
	if(upButton != null){
		upButton.className = 'btn_print_disabled';
		upButton.disabled=true;
		upButton.style.display ='none'; 
	}
	var	find	= document.getElementById("find");
	if(find != null){
		find.disabled=true;
		find.style.display='none';
	}

}

function showPartyTextField1(){

	partyName 			= document.getElementById('partyName');
	receiveAmt_Party	= document.getElementById('receiveAmt_Party');

	if(document.getElementById('typeOfSelection').value == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE) {

		changeView("partyWiseSelection","block");
		changeView("dateRangeSelection","block");
	}else{
		changeView("partyWiseSelection","none");
		changeView("dateRangeSelection","none");
		if(document.getElementById('DateRange') != null) document.getElementById('DateRange').checked = false;
		document.getElementById('partyName').value = '';
		document.getElementById('partyMasterId').value = '0';
		document.getElementById('receiveAmt_Party').value = '';
	}
	if(isShowFromDateToDate){
		changeView("dateRangeSelection","block");
		if(document.getElementById('typeOfSelection').value == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE){
			changeView("partyWiseSelection","block");
		}else if(document.getElementById('typeOfSelection').value == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR 
				|| document.getElementById('typeOfSelection').value == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_LR){
			changeView("dateRangeSelection","none");
			if(document.getElementById('DateRange') != null) document.getElementById('DateRange').checked = false;
		}else{
			changeView("dateRangeSelection","block");
			document.getElementById('partyName').value = '';
			document.getElementById('partyMasterId').value = '0';
			document.getElementById('receiveAmt_Party').value = '';
		}
	}
	if(isShowFromDateToDate && document.getElementById('typeOfSelection').value ==  CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_COLLECTION_PERSON){
		$('#searcBdate').hide();
		if(document.getElementById('searchByDate') != null) document.getElementById('searchByDate').checked = false;
		
		if(document.getElementById('searchByDate')){
			document.getElementById('searchByDate').style.display = 'none';
		}
		if(document.getElementById('dateTD')){
			document.getElementById('dateTD').style.display = 'none';
		}
		if(document.getElementById('fromDate')){
			document.getElementById('fromDate').value = date; 
		}
	}
}

function hidePartyTextDetails(){
	partyName.style.display 			= 'none';
	document.getElementById('partyName').value = '';
	document.getElementById('partyMasterId').value = '0';
	document.getElementById('receiveAmt_Party').value = '';
}

function setAllPaymentMode(obj, tableId) {

	var tableEl = document.getElementById(tableId);
	
	if(lrCreditConfig.isCRNoColumnDisplay) {
		for(var row = 1; row < tableEl.rows.length; row++) {
			if(!bankPaymentOperationRequired) {
				tableEl.rows[row].cells[11].getElementsByTagName("select")[0].value = obj.value;
				showHideChequeDetails(tableEl.rows[row].cells[11].getElementsByTagName("select")[0]);
			}
			showHideChequeDetails(obj);
		}
	} else if(tdsConfiguration.IsTdsAllow) {
		for(var row = 1; row < tableEl.rows.length; row++) {
			if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired) {
				tableEl.rows[row].cells[11].getElementsByTagName("select")[0].value = obj.value;
				showHideChequeDetails(tableEl.rows[row].cells[11].getElementsByTagName("select")[0]);
			} else {
				$('#paymentMode_'+row).val(obj.value);
				showHideChequeDetails(document.getElementById('paymentMode_'+row));
			}
			showHideChequeDetails(obj);
		}
	} else {
		for(var row = 1; row < tableEl.rows.length; row++) {
			if(tableEl.rows[row].cells[9] != undefined && tableEl.rows[row].cells[9].getElementsByTagName("select")[0] != undefined) {
				tableEl.rows[row].cells[9].getElementsByTagName("select")[0].value = obj.value;
				showHideChequeDetails(tableEl.rows[row].cells[9].getElementsByTagName("select")[0]);
				showHideChequeDetails(obj);
			}
		}
	}
	
	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR
		|| lrCreditConfig.clearPartyWiseMultiplePaymentInSinglePaymentMode && $('#typeOfSelection').val() == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE) {
		for(var row = 1; row < tableEl.rows.length; row++) {
			$('#hiddenPaymentMode_' + row).val(obj.value);
			$('#paymentMode_' + row).val(obj.value);
		}
	}
}

function setAllPaymentStatus(obj, tableId) {
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && Number($('#paymentMode_CreditClearanceTable-1').val()) > 0) {
		if(bankPaymentOperationRequired)
			hideShowBankPaymentTypeOptions(document.getElementById("paymentMode_CreditClearanceTable-1"));
	}

	var totalReceivedAmount = 0;
	var receivedAmount 		= 0;
	
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
		$('#hiddenPaymentStatus_CreditClearanceTable-1').val(obj.value);
	}

	var tableEl = document.getElementById(tableId);

	var tableLength		= tableEl.rows.length;

	for(var row = 1; row < tableLength; row++) {
		$('#paymentStatus_' + row).val(obj.value);
		$('#hiddenPaymentStatus_' + row).val(obj.value);
		
		if(lrCreditConfig.allowPartialPaymentInMultipleClear && creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
			 $('#remark_'+ row).val($('#remark_CreditClearanceTable-1').val());
		}
		
		if(allowToCalculateTDSOnManualPercentage){
			if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR
				&& obj.value != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
					$('#discountTypes_' + row).val(0);
				}
			$('#applyTDSPercent').val(0)
			$('#tdsAmt_' + row).val(0);
		}
		
		if(obj.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
				if(!lrCreditConfig.allowPartialPaymentInMultipleClear)
					$('#paymentStatus_' + row).prop('disabled', 'disabled');
				
				$('#hiddenPaymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
				$('#paymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
				$('#paymentMode_' + row).prop('disabled', 'disabled');
			} else {
				$('#paymentMode_' + row).removeAttr("disabled");
				$('#paymentStatus_' + row).removeAttr("disabled");
			}
			
			if(tdsConfiguration.IsTdsAllow) {
				if(lrCreditConfig.allowPartialPaymentInMultipleClear && creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
					if(obj.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
						$('#txnAmount_' + row).val(Number($('#txnAmount_' + row).val()) + Number($('#balanceAmt_' + row).val()));
					}
				}else{
					$('#txnAmount_' + row).val($('#grandTotal_' + row).val());
				}
			} else {
				$('#receiveAmt_' + row).val($('#grandTotal_' + row).val());
			}
			if(lrCreditConfig.isCRNoColumnDisplay) {
				if(allowToCalculateTDS && $('#applyTDSCheck').is(':visible')){
					if($('#applyTDS').is(":checked")){
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[14].children[0]);
					} else {
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[15].children[0]);
					}
				} else {
					if(allowToCalculateTDS)
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[14].children[0]);						// -> pass txn obj
					else
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[15].children[0]);	
				}

				totalReceivedAmount = parseInt(totalReceivedAmount,10) + parseInt(receivedAmount,10);
			} else if (tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired){
				receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[15].children[0]);						// -> pass txn obj

				totalReceivedAmount = parseInt(totalReceivedAmount,10) + parseInt(receivedAmount,10);
			} else {
				receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[14].children[0]);						// -> pass txn obj

				totalReceivedAmount = parseInt(totalReceivedAmount,10) + parseInt(receivedAmount,10);
			}
		} else {
			$('#txnAmount_' + row).val(0);
			$('#tdsAmt_' + row).val(0);
			$('#receiveAmt_' + row).val(0);
			
			if(!lrCreditConfig.allowPartialPaymentInMultipleClear && creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR)
				$('#balanceAmt_' + row).val($('#grandTotal_' + row).val());
			
			if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
				if(!lrCreditConfig.allowPartialPaymentInMultipleClear){
					$('#paymentStatus_' + row).prop('disabled', 'disabled');
				}
				$('#hiddenPaymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
				$('#paymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
				$('#paymentMode_' + row).prop('disabled', 'disabled');
			} else {
				$('#paymentStatus_' + row).removeAttr("disabled");
				$('#paymentMode_' + row).removeAttr("disabled");
			}
		}
	}

	var summDataTable 	= document.getElementById('summDataTable');

	if(summDataTable != null){
		for(var row = 1; row < summDataTable.rows.length; row++) {
			document.getElementById('paymentStatus_CreditClearanceTable-1').value 	= obj.value;

			if(obj.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
				calSumDataTable(totalReceivedAmount);
				$('#receiveAmt_CreditClearanceTable-1').attr('readonly', true)
				$('#txnAmount_CreditClearanceTable-1').attr('readonly', true)
			} else {
				$('#txnAmount_CreditClearanceTable-1').val(0);
				$('#tdsAmt_CreditClearanceTable-1').val(0);
				$('#receiveAmt_CreditClearanceTable-1').val(0);
				$('#balanceAmt_CreditClearanceTable-1').val($('#grandTotal_CreditClearanceTable-1').val());
				if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
					if(allowToCalculateTDSOnManualPercentage && obj.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
						$('#txnAmount_CreditClearanceTable-1').attr('readonly', false)
					} else{
						$('#txnAmount_CreditClearanceTable-1').attr('readonly', true)
					}
				}
			}
		}
	}
}

function calSumDataTable(totalReceivedAmount){
	var tdsCharge 	= 0;
	var paymentStatus = $("#paymentStatus_CreditClearanceTable-1").val();
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	if(allowToCalculateTDSOnManualPercentage && $('#applyTDSPercent').val() != undefined && $('#applyTDSPercent').val() > 0)
		tdsCharge = $('#applyTDSPercent').val();
	else
		tdsCharge = Number(tdsRate);

	var tdsAmount  	= 0;
	
	if(!allowToCalculateTDSOnManualPercentage ||(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && 
			allowToCalculateTDSOnManualPercentage && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID))
		$('#txnAmount_CreditClearanceTable-1').val($('#grandTotal_CreditClearanceTable-1').val());
	
	$('#receiveAmt_CreditClearanceTable-1').val(totalReceivedAmount);

	if(allowToCalculateTDSOnManualPercentage && creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
		tdsAmount = tdsConfiguration.allowToEnterTDSAmountInDecimal ? toFixedWhenDecimal(($('#txnAmount_CreditClearanceTable-1').val() * tdsCharge) / 100) : Math.round(($('#txnAmount_CreditClearanceTable-1').val() * tdsCharge) / 100);
	} else if(tdsConfiguration.IsTDSInPercentAllow) {
		tdsAmount = tdsConfiguration.allowToEnterTDSAmountInDecimal ? toFixedWhenDecimal(($('#grandTotal_CreditClearanceTable-1').val() * tdsCharge) / 100) : Math.round(($('#grandTotal_CreditClearanceTable-1').val() * tdsCharge) / 100);
	} else {
		if($('#txnAmount_CreditClearanceTable-1').val() > 0) {
			tdsAmount	= Math.round(parseInt($('#txnAmount_CreditClearanceTable-1').val())) - totalReceivedAmount;
		}
	}
	
	if(allowToCalculateTDS && $('#applyTDSCheck').is(':visible') ){
		if($('#applyTDS').is(":checked"))
			$('#tdsAmt_CreditClearanceTable-1').val(tdsAmount);
		else 
			$('#tdsAmt_CreditClearanceTable-1').val(0);
	} else {
		$('#tdsAmt_CreditClearanceTable-1').val(tdsAmount);
	} 
		
	if(!allowToCalculateTDSOnManualPercentage ||(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && 
			allowToCalculateTDSOnManualPercentage && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID))
		$('#balanceAmt_CreditClearanceTable-1').val(0);
}

function validatePaymentSelection(obj) {
	var elementId 		= (obj.id).split('_')[1];

	var paymentStatus	= $('#paymentStatus_' + elementId).val();
	var balanceAmount	= parseFloat($('#balanceAmt_' + elementId).val());
	var receivedAmtLimit= parseInt($("#receivedAmtLimit_" + elementId).val());
	var totalAmt		= parseInt($("#grandTotal_" + elementId).val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	
	$('#hiddenPaymentStatus_' + elementId).val(paymentStatus);
	
	$('#paymentMode_' + elementId).prop('disabled', false);
	$('#txnAmount_' + elementId).prop('disabled', false);
	$('#tdsAmt_' + elementId).prop('disabled', false);
	$('#paymentMode_'+ elementId + " option[value='" + PAYMENT_TYPE_BAD_DEBT_ID + "']").remove();

	if(!lrCreditConfig.allowPartialPaymentInMultipleClear && lrCreditConfig.validateOtherPaymentTypeSelection && balanceAmount <= 0 && paymentStatus != BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
		showMessage('warning', otherPaymentTypeSelectionWarningMsg);
		$('#hiddenPaymentStatus_' + elementId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		$('#paymentStatus_' + elementId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		return;
	}

	if(paymentStatus == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
		if(tdsConfiguration.IsTdsAllow) {
			$("#txnAmount_" + elementId).val(actTotalAmt);
			$("#receiveAmt_" + elementId).val($("#txnAmount_" + elementId).val() - $("#tdsAmt_" + elementId).val());
			$("#receiveAmt_" + elementId).attr('readonly', true);
		} else {
			$("#receiveAmt_" + elementId).attr('readonly', false);
			$("#receiveAmt_" + elementId).val(actTotalAmt);
		}
		
		$("#balanceAmt_" + elementId).val(0);

		calTotalAmounts();
	} else if(paymentStatus == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID || paymentStatus == BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
		$("#balanceAmt_" + elementId).val(actTotalAmt);
		$("#receiveAmt_" + elementId).val(0);

		if(tdsConfiguration.IsTdsAllow) {
			$("#txnAmount_" + elementId).val(0);
			$("#receiveAmt_" + elementId).attr('readonly', true);
		} else {
			$("#receiveAmt_" + elementId).attr('readonly', false);
		}
		calTotalAmounts();
	} else if (paymentStatus == BILL_CLEARANCE_STATUS_BAD_DEBT_ID) {
		$("#paymentMode_" + elementId).val(PAYMENT_TYPE_BAD_DEBT_ID);
		$('#paymentMode_' + elementId).prepend("<option value='" + PAYMENT_TYPE_BAD_DEBT_ID + "' selected='selected'>Bad Debt</option>");
		$("#hiddenPaymentMode_" + elementId).val(PAYMENT_TYPE_BAD_DEBT_ID);
		$('#paymentMode_' + elementId).prop('disabled', true);
		$('#txnAmount_' + elementId).prop('disabled', true);
		$("#txnAmount_" + elementId).val(0);
		$('#tdsAmt_' + elementId).prop('disabled', true);
		$("#tdsAmt_" + elementId).val(0);
		$("#receiveAmt_" + elementId).val(0);
		$("#balanceAmount").val(actTotalAmt);
		$("#jsPanelDataContentForBill").show();
		calTotalAmounts();
	}

	allowTdsOnPaymentTypeSelection(elementId);
}

function allowTdsOnPaymentTypeSelection(elementId) {

	if(tdsConfiguration.IsTdsAllow) {
		if(tdsConfiguration.IsTDSInPercentAllow) {
			var receivedAmtLimit= parseInt($("#receivedAmtLimit_" + elementId).val());
			var totalAmt		= parseInt($("#grandTotal_" + elementId).val());
			var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
			var txnAmount		= parseInt($("#txnAmount_" + elementId).val());
 			let tdsAmt			= (txnAmount * Number(tdsRate)) / 100;

			if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
				$("#receiveAmt_" + elementId).val(toFixedWhenDecimal(txnAmount - toFixedWhenDecimal(tdsAmt)));
				$("#tdsAmt_" + elementId).val(toFixedWhenDecimal(tdsAmt));
			} else {
				$("#receiveAmt_" + elementId).val(Math.round(txnAmount - Math.round(tdsAmt)));
				$("#tdsAmt_" + elementId).val(Math.round(tdsAmt));
			}

			$("#balanceAmt_" + elementId).val(actTotalAmt - txnAmount);
		}
	}
}

function createBill() {

	var isAllowFlag			= false;
	var isMultipleClear		= true;
	var allowToSave			= false;
	var typeOfSelection		= document.getElementById('typeOfSelection').value;
	var table 				= document.getElementById('reportTable');
	var summDataTable   	= document.getElementById('summDataTable');
	var maxRecAmt			= 0;
	var totalReceivedAmount	= 0;
	
	var checkboxselected = getAllCheckBoxSelectValueByClassName('checkbox');
	
	if(checkboxselected.length == 0) {
		showMessage('error', "Please provide atleast one LR Amount for Receive payment !");
		return false;
	} else {
		for(var i = 1; i <= checkboxselected.length; i++) {
			if(isCheckBoxChecked('check1_' + i)) {
				var rcvdAmt    = document.getElementById('receiveAmt_' + parseInt(i));
				if(!formValidation(rcvdAmt)) {
					return false;
				}
			}
		}
	}

	if(lrCreditConfig.allowOnAccountEntryOnSinglePaymentReceive && $('#typeOfSelection').val() == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE){
		if(document.getElementById("receiveAmt_Party")){
			maxRecAmt		= Number(document.getElementById("receiveAmt_Party").value);
		}
		
		if(maxRecAmt > 0 && Number($('#totalTxnAmount').html()) != maxRecAmt){
			showMessage('error',"Please Select Lr Equal To Clerance Amount.");
			return false;
		}
	}
	
	var partyId 		= 0;
	if(document.getElementById("partyMasterId")){
		partyId         = document.getElementById("partyMasterId").value;
	}
	var rowCount 	    = table.rows.length;

	// Validation for Discount Type (start)
	var paymentRcvdAs	= 0;
	var discType		= 0;
	var balanceAmount	= 0;
	var receivedAmount	= 0;
	var totalamount		= 0;
	var receivedAmtLimit= 0;

	for(var m=1 ; m<rowCount; m++){
		paymentRcvdAs 	= parseInt($("#paymentStatus_" + m).val());//table.rows[m].cells[11].firstElementChild.value;

		discType		= parseInt($("#discountTypes_" + m).val());
		balanceAmount 	= parseInt($("#balanceAmt_" + m).val());
		receivedAmount 	= parseInt($("#receiveAmt_" + m).val());
		totalamount	   	= parseInt($("#grandTotal_" + m).val());
		receivedAmtLimit= parseInt($("#receivedAmtLimit_" + m).val());
		
		if(lrCreditConfig.isReceivedAmtValidationAllow){
			if((receivedAmount + balanceAmount) > totalamount) {
				showMessage('error',"Received Amount more than Balance Amount is not Allowed!");
				toogleElement('error','block');
				changeError1('receiveAmt_'+m,'0','0');
				return false;
			} else {
				removeError("receiveAmt_"+m);
			}
		}

		if(paymentRcvdAs == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID && discType == 0) {
			showMessage('error',"Please Select Discount Type");
			toogleElement('error','block');
			changeError1('discountTypes_'+m,'0','0');
			return false;
		}else{
			toogleElement('error','none');
			removeError('discountTypes_'+m);
		}
		
		if(paymentRcvdAs == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID && 
			!validateDiscountLimit(discountInPercent, Number(totalamount - receivedAmtLimit), balanceAmount, $("#txnAmount_" + m)))
				return false;
	}
	
	// Validation for Discount Type (end)

	var count 				= 0;
	var sumReceAmt			= 0; 

	if(typeOfSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && summDataTable != null && table != null){

		rowCount 			= rowCount + 1;
		sumReceAmt 			= document.getElementById('receiveAmt_CreditClearanceTable*'+typeOfSelection);
		var paymentStatus1	= $('#paymentStatus_CreditClearanceTable-1').val();
		isAllowFlag 		=  false;

		if(sumReceAmt) {
			if(parseInt(sumReceAmt.value) > 0) {
				if(!formValidation(sumReceAmt)) {
					isMultipleClear = false;
				} else {
					isMultipleClear	= true;
					count++;
				}
			} else if( paymentStatus1 == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_BAD_DEBT_ID){
				isMultipleClear	= true;
				count++;
			} else {
				alert('Please provide Amount for Receive payment !!');
				isMultipleClear = false;
			}
		} else {
			isMultipleClear	= true;
		}
	} 

	if(partyId > 0 && maxRecAmt > 0) {
		isMultipleClear	= true;
	}
	if(isMultipleClear) {

		for (var i = 1; i < rowCount - 1; i++) {
			if(lrCreditConfig.settleOnlySelectedLrs && !$("#check1_"+i).prop("checked"))
				continue;
				
			var rcvdAmt    = document.getElementById('receiveAmt_' + parseInt(i));
			var paymentStatus    = document.getElementById('paymentStatus_' + parseInt(i)).value;
			isAllowFlag =  false;

			if(rcvdAmt) {
				if(parseInt(rcvdAmt.value) > 0) {
					if(!formValidation(rcvdAmt)) {
						return false;
					} else {
						isAllowFlag	= true;
						count++;
					}
				} else if(paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_BAD_DEBT_ID){
					isAllowFlag	= true;
					count++;
				}  else {
					if(typeOfSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
						isAllowFlag	= false;
						break;
					} else {
						isAllowFlag	= true;
					}
				}
			}
		}
	}

	var txnAmtEle	= null;

	if(tdsConfiguration.IsTdsAllow) {
		if(tdsConfiguration.IsPANNumberMandetory) {
			for(var m = 1; m <= table.rows.length - 1; m++) {
				if(lrCreditConfig.isCRNoColumnDisplay) {
					if(table.rows[m].cells[15].childNodes[0] != null) {
						
					if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired){
						txnAmtEle = table.rows[m].cells[15].childNodes[0]; 
					} else {
						txnAmtEle = table.rows[m].cells[14].childNodes[0]; 
					}

						if(txnAmtEle != null){
							if(parseInt(txnAmtEle.value,10) > 0) {
								panNumberId = txnAmtEle.id.split('_')[1];
								if(panNumChecker('panNumber_'+panNumberId)) {
									allowToSave	= true;
								} else if(tanNumChecker('tanNumber_'+tanNumberId)) {
									allowToSave	= true;
								} else {
									allowToSave	= false;
									break;
								}
							}
						}
					}
				} else {
					if(table.rows[m].cells[14].childNodes[0] != null) {
						if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired){
							txnAmtEle = table.rows[m].cells[15].childNodes[0]; 
						} else {
							txnAmtEle = table.rows[m].cells[14].childNodes[0]; 
						}

						if(txnAmtEle != null) {
							if(parseInt(txnAmtEle.value,10) > 0) {
								panNumberId = txnAmtEle.id.split('_')[1];
								
								if(panNumChecker('panNumber_' + panNumberId)) {
									allowToSave	= true;
								} else if(tanNumChecker('tanNumber_'+panNumberId)) {
									allowToSave	= true;
								} else {
									allowToSave	= false;
									break;
								}
							}
						}
					}
				}
			}

			if(!allowToSave) {
				return false;
			}
		}
		
		var tanNumberId		= 0;
		
		if(tdsConfiguration.IsTANNumberMandetory) {
			for(var m = 1; m <= table.rows.length - 1; m++) {
				if(lrCreditConfig.isCRNoColumnDisplay) {
					if(table.rows[m].cells[15].childNodes[0] != null) {
						if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired){
							txnAmtEle = table.rows[m].cells[15].childNodes[0]; 
						} else {
							txnAmtEle = table.rows[m].cells[14].childNodes[0]; 
						}
						
						if(txnAmtEle != null){
							if(parseInt(txnAmtEle.value,10) > 0) {
								tanNumberId = txnAmtEle.id.split('_')[1];
								if(tanNumChecker('tanNumber_'+tanNumberId)) {
									allowToSave	= true;
								} else if(panNumChecker('panNumber_'+tanNumberId)) {
									allowToSave	= true;
								} else {
									allowToSave	= false;
									break;
								}
							}
						}
					}
				} else {
					if(table.rows[m].cells[14].childNodes[0] != null) {
						if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired){
							txnAmtEle = table.rows[m].cells[15].childNodes[0]; 
						} else {
							txnAmtEle = table.rows[m].cells[14].childNodes[0]; 
						}
						
						if(txnAmtEle != null) {
							if(parseInt(txnAmtEle.value,10) > 0) {
								tanNumberId = txnAmtEle.id.split('_')[1];
								if(tanNumChecker('tanNumber_' + tanNumberId)) {
									allowToSave	= true;
								} else if(panNumChecker('panNumber_'+tanNumberId)) {
									allowToSave	= true;
								} else {
									allowToSave	= false;
									break;
								}
							}
						}
					}
				}
			}
			
			if(!allowToSave) {
				return false;
			}
		}
	}

	if (isBackDateEntryAllow) {
		var backDate	= $('#backDate').val();

		if(backDate == '' || backDate == null) {
			showMessage('error', 'Please Select Date');
			changeTextFieldColorWithoutFocus('backDate', '', '', 'red');
			return false;
		}
	}
		
	if(checkboxselected.length > 0) {
		for (var i = 0; i < checkboxselected.length; i++) {
			var dateString = $('#creationDate_' + parseInt(checkboxselected[i])).val();

			if (!dateString) continue;

			var parts = dateString.split(',');

			var dateStr = parts[0];
			var wayBillNUmber = parts[1];
			var noOfDays = parseInt(parts[2]);

			var lrBookingDate = new Date(dateStr.replace(" ", "T"));

			var bookingDateOnly = new Date(lrBookingDate.getFullYear(), lrBookingDate.getMonth(), lrBookingDate.getDate());
			
			var backDate = $('#backDate').val();

			if(backDate){
				var bd = backDate.split('-');
				
				var lrCreditDate 	= new Date(parseInt(bd[2]), parseInt(bd[1]) - 1, parseInt(bd[0]));
				
				var currentDate 	= new Date();
				var currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
				var minBackDate 	= new Date(currentDateOnly);
				minBackDate.setDate(currentDateOnly.getDate() - noOfDays);

				if(lrCreditDate < bookingDateOnly){
					showMessage('error', "Back Date Should Not Be Less Than Booking/Delivery Date In LR Number " + wayBillNUmber);
					return false;
				}
			}
		}
	}
	
	if(isAllowFlag && count > 0 && isMultipleClear) {
		if(confirm("Are you sure you want to clear these LR's ?")) {
			var TotalBillCount = 0;
			
			for (var i = 1; i< rowCount - 1; i++) {
				TotalBillCount ++;
			}
			
			$('#TotalBillCount').val(TotalBillCount);
			
			if(partyId > 0 && maxRecAmt > 0) {
				$('#searchById').val(1);
			} else {
				$('#searchById').val(typeOfSelection);
			}

			disableButtons();
			//Disable page
			showLayer();
			count++;
			document.CreditPaymentModule.submit();
		}
	} else {
		alert('Please provide atleast one LR Amount for Receive payment !!');
	}
}

function createCreditBill() {
	var tableEl = document.getElementById("reportTable1");
	var flag = false;
	var i;
	for (i = 1; i < tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null && tableEl.rows[i].cells[0].getElementsByTagName("input")[0].checked){
			flag=true;
		}
	}
	if(flag == false){
		showMessage('error',"Please select the waybill.");
		toogleElement('error','block');
		return false;
	}else{
		toogleElement('error','none');
		var answer = confirm ("Are you sure you want to Create Bill ?");
		if (answer){
			document.CreditPaymentModule.pageId.value  	= 	'236';
			document.CreditPaymentModule.eventId.value 	= 	'11' ;
			document.CreditPaymentModule.action			=	"createBillForm.do";
			document.CreditPaymentModule.submit();
		}
		else{return false;}
	};
}

function val() {

	var regionId 	 		= $("#region").val(); 
	var subRegionId  		= $("#subRegion").val(); 
	var branchId 	 		= $("#branch").val();
	var singleBranch 		= $("#BranchId").val(); 
	var txnType 			= $("#txnType").val();
	var searchBy 	 		= $("#typeOfSelection").val();
	var collectionPersonId 	= $("#selectedCollectionPersonId").val();
	var wbNo 				= $('#wbNumber').val().trim();
	var crNo 				= $('#crNumber').val().trim();
	var billSelectionTypeId	= $('#billSelectionTypeId').val();
	var moduleTypeId		= Number($('#moduleType').val());
	
	if(searchBy  <= 0){
		showMessage('error','Please Select Search By !');
		toogleElement('error','block');
		changeError1('typeOfSelection','0','0');
		$("#typeOfSelection").focus(); 
		return false;
	}

	if(searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_TYPE_WISE ||  searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_ALL ||  searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE){
		if(regionId == -1){
			showMessage('error','Please Select Region !');
			toogleElement('error','block');
			changeError1('region','0','0');
			$("#region").focus(); 
			return false;
		}
		
		if(subRegionId == -1){
			showMessage('error','Please Select SubRegion !');
			toogleElement('error','block');
			changeError1('subRegion','0','0');
			$("#subRegion").focus(); 
			return false;
		}
		
		if(branchId == -1 ){
			showMessage('error','Please Select Branch !');
			toogleElement('error','block');
			changeError1('branch','0','0');
			$("#branch").focus(); 
			return false;
		}
	}

	if(searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_CR || moduleTypeId == 2){
		if(crNo.length <=0 && $('#crNumber').is(':visible')){
			showMessage('error','Please Enter CR Number !');
			toogleElement('error','block');
			changeError1('crNumber','0','0');
			$("#crNumber").focus(); 
			return false;
		}
	}

	if(searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_CR){
		if(singleBranch <=0){
			showMessage('error','Please Select Branch !');
			toogleElement('error','block');
			changeError1('searchBy','0','0');
			$("#searchBy").focus(); 
			return false;
		}
	}
	
	if(searchBy != CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_ALL && searchBy != CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_CR){

		if(txnType <=0){
			showMessage('error','Please Select Transaction Type !');
			toogleElement('error','block');
			changeError1('txnType','0','0');
			$("#txnType").focus(); 
			return false;
		}

		if(searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_COLLECTION_PERSON){
			if(collectionPersonId <=0){
				showMessage('error','Please Enter Valid Collection Person !');
				toogleElement('error','block');
				changeError1('searchCollectionPerson','0','0');
				if(document.getElementById('searchCollectionPerson') != null){
					$("#searchCollectionPerson").focus(); 
				}
				return false;
			}
		}

		if(searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_SINGLE_LR || moduleTypeId == 1){
			if(wbNo.length <=0 && $('#wbNumber').is(':visible')){
				showMessage('error','Please Enter WayBill Number !');
				toogleElement('error','block');
				changeError1('wbNumber','0','0');
				$("#wbNumber").focus(); 
				return false;
			}
		}
	}
	
	if(showBillSelectionTypeId){
		if(billSelectionTypeId == 0 && (searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE || searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_ALL
				|| searchBy == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR ||  searchBy == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_TYPE_WISE)) {
			showMessage('error','Please Enter BillType !');
			toogleElement('error','block');
			changeError1('billSelectionTypeId','0','0');
			$("#billSelectionTypeId").focus(); 
			return false;
		}
	}

	return checkValidationForPartyName();
}

function checkValidationForPartyName(){

	if($('#typeOfSelection').val() == CreditPaymentTypeConstants.CREDIT_PAYMENT_TYPE_PARTY_WISE && ($('#partyMasterId').val()  <= 0 || $('#consigneePartyName').val() == '')) {
		showMessage('error','Please Enter Party Name !');
		toogleElement('error','block');
		changeError1('partyName','0','0');
		$("#partyName").focus(); 
		return false;
	}

	return true;
}

function calTotalAmounts() {

	var reportTable = document.getElementById('reportTable');
	var txnRowAmt	= 0;
	var tdsRowAmt	= 0;
	var recRowAmt 	= 0;
	var balRowAmt 	= 0;
	var claimRowAmt = 0;
	var searchBy 	 		= $("#typeOfSelection").val();
	
	for(var row = 1; row < (reportTable.rows.length - 1); row++) {
		
		if(searchBy == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && lrCreditConfig.settleOnlySelectedLrs && !$("#check1_"+row).prop("checked"))
			continue;
					
		if(tdsConfiguration.IsTdsAllow) {
			txnRowAmt = Number(txnRowAmt) + Number($('#txnAmount_' + row).val());
			tdsRowAmt = Number(tdsRowAmt) + Number($('#tdsAmt_' + row).val());
			recRowAmt = Number(recRowAmt) + Number($('#receiveAmt_' + row).val());
			
			if(lrCreditConfig.isAllowClaimEntry){
				claimRowAmt = Number(claimRowAmt) + Number($('#claimAmt_' + row).val());
			}
		} else {
			recRowAmt = Number(recRowAmt) + Number($('#receiveAmt_' + row).val());
			if(lrCreditConfig.isAllowClaimEntry){
				claimRowAmt = Number(claimRowAmt) + Number($('#claimAmt_' + row).val());
			}
		}
		
		balRowAmt = Number(balRowAmt) + Number($('#balanceAmt_' + row).val());
	}	
	

	if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
		$('#totalTdsAmount').html(toFixedWhenDecimal(tdsRowAmt));
		$('#totalReceivedAmt').html(toFixedWhenDecimal(recRowAmt));
	} else {
		$('#totalTdsAmount').html(tdsRowAmt);
		$('#totalReceivedAmt').html(recRowAmt);
	}

	$('#totalTxnAmount').html(txnRowAmt);
	$('#totalBalanceAmt').html(balRowAmt);
	
	if(lrCreditConfig.isAllowClaimEntry)
		$('#totalClaimAmount').html(claimRowAmt);
	
	if(allowToCalculateTDSOnManualPercentage && searchBy == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR){
		var txnTotalAmt = 0;
		var tdsTotalAmt = 0;
		var recTotalAmt = 0;
		var balTotalAmt = 0;
				 
		for(var newrow = 1; newrow < (reportTable.rows.length); newrow++) {
			if(searchBy == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && lrCreditConfig.settleOnlySelectedLrs && !$("#check1_"+newrow).prop("checked"))
				continue;
			
			txnTotalAmt = Number(txnTotalAmt) + Number($('#txnAmount_' + newrow).val());
			tdsTotalAmt = Number(tdsTotalAmt) + Number($('#tdsAmt_' + newrow).val());
			recTotalAmt = Number(recTotalAmt) + Number($('#receiveAmt_' + newrow).val());
			balTotalAmt = Number(balTotalAmt) + Number($('#balanceAmt_' + newrow).val());
		}
		
		if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
			$('#tdsAmt_CreditClearanceTable-1').val(toFixedWhenDecimal(tdsTotalAmt));
			$('#receiveAmt_CreditClearanceTable-1').val(toFixedWhenDecimal(recTotalAmt))
		} else {
			$('#tdsAmt_CreditClearanceTable-1').val(tdsTotalAmt);
			$('#receiveAmt_CreditClearanceTable-1').val(recTotalAmt);
		}

		$('#txnAmount_CreditClearanceTable-1').val(txnTotalAmt);
		$('#balanceAmt_CreditClearanceTable-1').val(balTotalAmt);
	}
}

function validateClaimAmount(obj){
	
	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	
	var receivedAmtLimit= parseInt(document.getElementById("receivedAmtLimit_" + splitVal[1]).value,10);
	
	var totalAmt		= parseInt($("#grandTotal_" + splitVal[1]).val());
	var actTotalAmt		= Math.round(totalAmt - receivedAmtLimit);
	
	if(tdsConfiguration.IsTdsAllow){
		
		var txnAmt				= Math.round($("#txnAmount_" + splitVal[1]).val());
		var claimAmt			= Math.round($("#claimAmt_" + splitVal[1]).val());
		let tdsAmt				= $("#tdsAmt_" + splitVal[1]).val();
		
		if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
			$("#receiveAmt_" + splitVal[1]).val(toFixedWhenDecimal(txnAmt - toFixedWhenDecimal(tdsAmt) - claimAmt));
		else
			$("#receiveAmt_" + splitVal[1]).val(txnAmt - Math.round(tdsAmt) - claimAmt);

		$("#balanceAmt_" + splitVal[1]).val(actTotalAmt - txnAmt);
	
	} else{
		
		var claimAmt				= Math.round($("#claimAmt_" + splitVal[1]).val());
		$('#balanceAmt_' + splitVal[1]).val(actTotalAmt - $("#receiveAmt_" + splitVal[1]).val());
	}
	
	calTotalAmounts();
	
}

function selectPaymentTypeAuto(obj) {
	if(lrCreditConfig.isPaymentTypeAndModeSelectOnCheckBox) {
		var index 				= obj.id.split("_")[1];
		
		var totalTxnAmount 		= Number($("#totalTxnAmount").html());
		var totalTdsAmount	 	= Number($("#totalTdsAmount").html());
		var totalReceivedAmt 	= Number($("#totalReceivedAmt").html());
		var totalBalanceAmt	 	= Number($("#totalBalanceAmt").html());
		
		if(obj.checked) {
			$("#hiddenPaymentMode_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			$("#paymentMode_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			$("#hiddenPaymentStatus_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			$("#paymentStatus_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			
			if(tdsConfiguration.IsTdsAllow) {
				$("#txnAmount_" + index).val($("#balanceAmt_" + index).val());
				
				if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
					$("#receiveAmt_" + index).val(toFixedWhenDecimal($("#txnAmount_" + index).val() - Number($("#tdsAmt_" + index).val())));
				else
					$("#receiveAmt_" + index).val($("#txnAmount_" + index).val() - Number($("#tdsAmt_" + index).val()));

				totalTxnAmount		+= Number($("#txnAmount_" + index).val());
				totalTdsAmount		+= Number($("#tdsAmt_" + index).val());
			} else {
				if($("#balanceAmt_" + index).val() > 0) {
					$("#receiveAmt_" + index).val($("#balanceAmt_" + index).val());
				}
			}
			
			totalBalanceAmt		-= Number($("#balanceAmt_" + index).val());
			$("#balanceAmt_" + index).val(0);
			totalReceivedAmt	+= Number($("#receiveAmt_" + index).val());
		} else {
			$("#hiddenPaymentMode_" + index).val(0);
			$("#paymentMode_" + index).val(0);
			$("#hiddenPaymentStatus_" + index).val(0);
			$("#paymentStatus_" + index).val(0);
			
			if(tdsConfiguration.IsTdsAllow) {
				if($("#txnAmount_" + index).val() > 0) {
					$("#balanceAmt_" + index).val($("#txnAmount_" + index).val());
				}
				
				totalBalanceAmt		+= Number($("#balanceAmt_" + index).val());
				totalTxnAmount		-= Number($("#txnAmount_" + index).val());
				totalReceivedAmt	-= Number($("#receiveAmt_" + index).val());
				
				$("#txnAmount_" + index).val(0);
				$("#receiveAmt_" + index).val(0);
			} else {
				totalReceivedAmt	-= Number($("#receiveAmt_" + index).val());
				totalBalanceAmt		+= Number($("#receiveAmt_" + index).val());
				$("#balanceAmt_" + index).val($("#receiveAmt_" + index).val());
				$("#receiveAmt_" + index).val(0);
			}
		}
		
		if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
			$("#totalTdsAmount").html(toFixedWhenDecimal(totalTdsAmount));
			$("#totalReceivedAmt").html(toFixedWhenDecimal(totalReceivedAmt));
		} else {
			$("#totalTdsAmount").html(totalTdsAmount);
			$("#totalReceivedAmt").html(totalReceivedAmt);
		}

		$("#totalTxnAmount").html(totalTxnAmount);
		$("#totalBalanceAmt").html(totalBalanceAmt);
	}
}

function selectAllPaymentTypeAuto(obj) {
	if(lrCreditConfig.isPaymentTypeAndModeSelectOnCheckBoxOnAll) {
		var tab 	= document.getElementById("reportTable");
		var count 	= parseFloat(tab.rows.length - 1);
		var row;
		var totalTxnAmount 		= 0;
		var totalTdsAmount	 	= 0;
		var totalReceivedAmt 	= 0;
		var totalBalanceAmt	 	= 0;
		
		if(Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
			row = count;
		} else {
			row = count - 1;
		}
		
		if(obj.checked == true) {
			for (row; row > 0; row--) {
				if(!(Number($("#paymentMode_" + row).val()) > 0 && Number($("#paymentStatus_" + row).val()) > 0 && Number($("#receiveAmt_" + row).val()) > 0)) {
					$("#hiddenPaymentMode_" + row).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
					$("#paymentMode_" + row).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
					$("#hiddenPaymentStatus_" + row).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
					$("#paymentStatus_" + row).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
					
					if(tdsConfiguration.IsTdsAllow) {
						if($("#balanceAmt_" + row).val() > 0) {
							$("#txnAmount_" + row).val($("#balanceAmt_" + row).val());
						}
						
						if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
							$("#receiveAmt_" + row).val(toFixedWhenDecimal(Number($("#txnAmount_" + row).val()) - Number($("#tdsAmt_" + row).val())));
						else
							$("#receiveAmt_" + row).val(Number($("#txnAmount_" + row).val()) - Number($("#tdsAmt_" + row).val()));

					} else {
						$("#receiveAmt_" + row).val($("#balanceAmt_" + row).val());
					}
					
					$("#balanceAmt_" + row).val(0);
				}
				
				totalTxnAmount		+= Number($("#txnAmount_" + row).val());
				totalTdsAmount		+= Number($("#tdsAmt_" + row).val());
				totalBalanceAmt		+= Number($("#balanceAmt_" + row).val());
				totalReceivedAmt	+= Number($("#receiveAmt_" + row).val());
			}
		} else if(obj.checked == false) {
			for (row; row > 0; row--) {
				$("#hiddenPaymentMode_" + row).val(0);
				$("#paymentMode_" + row).val(0);
				$("#hiddenPaymentStatus_" + row).val(0);
				$("#paymentStatus_" + row).val(0);
				
				if(tdsConfiguration.IsTdsAllow) {
					if($("#txnAmount_" + row).val() > 0) {
						$("#balanceAmt_" + row).val($("#txnAmount_" + row).val());
					}
					
					$("#txnAmount_" + row).val(0);
					
					totalTxnAmount		-= Number($("#txnAmount_" + row).val());
					totalTdsAmount		-= Number($("#tdsAmt_" + row).val());
				} else {
					$("#balanceAmt_" + row).val($("#receiveAmt_" + row).val());
				}
				
				$("#receiveAmt_" + row).val(0);
				
				totalBalanceAmt		+= Number($("#balanceAmt_" + row).val());
				totalReceivedAmt	-= Number($("#receiveAmt_" + row).val());
			}
		}
		
		if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
			$("#totalTdsAmount").html(toFixedWhenDecimal(totalTdsAmount));
			$("#totalReceivedAmt").html(toFixedWhenDecimal(totalReceivedAmt));
		} else {
			$("#totalTdsAmount").html(totalTdsAmount);
			$("#totalReceivedAmt").html(totalReceivedAmt);
		}

		$("#totalTxnAmount").html(totalTxnAmount);
		$("#totalBalanceAmt").html(totalBalanceAmt);
	}
}

function selectPaymentTypeAutoForMultipleLR(obj) {
	if(lrCreditConfig.isPaymentTypeAndModeSelectOnCheckBox) {
		var index 				= obj.id.split("_")[1];
		
		var totalTxnAmount 		= Number($("#totalTxnAmount").html());
		var totalTdsAmount	 	= Number($("#totalTdsAmount").html());
		var totalReceivedAmt 	= Number($("#totalReceivedAmt").html());
		var totalBalanceAmt	 	= Number($("#totalBalanceAmt").html());
		
		if(obj.checked) {
			$("#hiddenPaymentMode_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			$("#paymentMode_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			$("#hiddenPaymentStatus_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			$("#paymentStatus_" + index).val(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			
			if(tdsConfiguration.IsTdsAllow) {
				$("#txnAmount_" + index).val($("#balanceAmt_" + index).val());
				
				if (tdsConfiguration.allowToEnterTDSAmountInDecimal)
					$("#receiveAmt_" + index).val(toFixedWhenDecimal($("#txnAmount_" + index).val() - Number($("#tdsAmt_" + index).val())));
				else
					$("#receiveAmt_" + index).val($("#txnAmount_" + index).val() - Number($("#tdsAmt_" + index).val()));

				totalTxnAmount		+= Number($("#txnAmount_" + index).val());
				totalTdsAmount		+= Number($("#tdsAmt_" + index).val());
			} else {
				if($("#balanceAmt_" + index).val() > 0) {
					$("#receiveAmt_" + index).val($("#balanceAmt_" + index).val());
				}
			}
			
			totalBalanceAmt		-= Number($("#balanceAmt_" + index).val());
			$("#balanceAmt_" + index).val(0);
			totalReceivedAmt	+= Number($("#receiveAmt_" + index).val());
		} else {
			$("#hiddenPaymentMode_" + index).val(0);
			$("#paymentMode_" + index).val(0);
			$("#hiddenPaymentStatus_" + index).val(0);
			$("#paymentStatus_" + index).val(0);
			
			if(tdsConfiguration.IsTdsAllow) {
				if($("#txnAmount_" + index).val() > 0) {
					$("#balanceAmt_" + index).val($("#txnAmount_" + index).val());
				}
				
				totalBalanceAmt		+= Number($("#balanceAmt_" + index).val());
				totalTxnAmount		-= Number($("#txnAmount_" + index).val());
				totalReceivedAmt	-= Number($("#receiveAmt_" + index).val());
				
				$("#txnAmount_" + index).val(0);
				$("#receiveAmt_" + index).val(0);
			} else {
				totalReceivedAmt	-= Number($("#receiveAmt_" + index).val());
				totalBalanceAmt		+= Number($("#receiveAmt_" + index).val());
				$("#balanceAmt_" + index).val($("#receiveAmt_" + index).val());
				$("#receiveAmt_" + index).val(0);
			}
		}
		
		if (tdsConfiguration.allowToEnterTDSAmountInDecimal) {
			$("#totalTdsAmount").html(toFixedWhenDecimal(totalTdsAmount));
			$("#totalReceivedAmt").html(toFixedWhenDecimal(totalReceivedAmt));
		} else {
			$("#totalTdsAmount").html(totalTdsAmount);
			$("#totalReceivedAmt").html(totalReceivedAmt);
		}
		
		$("#totalTxnAmount").html(totalTxnAmount);
		$("#totalBalanceAmt").html(totalBalanceAmt);
	}
}

function chequeBounceValidation(seqNo,corporateAccountId,branchId,accountGroupId){
	setTimeout(function(){
		var type		= ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT;
		
		if(chequeBounceRequired){
			chequeBounceChecking(accountGroupId,corporateAccountId,type,branchId);
			setTimeout(function(){
				var size = checkObjectSize(chequeBounceDetails);
				if(size > 0){
					if(chequeBounceDetails.chequeBounceDetailsModel.corporateAccountId > 0){
						if(chequeBounceDetails.chequeBounceDetailsModel.markForDelete == 0 && chequeBounceDetails.chequeBounceDetailsModel.isAllowChequePayment == 0){
							isAllowChequePayment	= 1;
							showChequePaymentMode(mySplitResult);
							$('#isAllowChequePayment_' + mySplitResult[1]).val(isAllowChequePayment);
						} else {
							$('#paymentMode_' + seqNo).val(0);
							$('#chequeNumber_' + seqNo).hide();
							$('#bankName_' + seqNo).hide();
							$('#chequeDate_' + seqNo).hide();
						}
					} else {
						$('#paymentMode_' + seqNo).val(0);
						$('#chequeNumber_' + seqNo).hide();
						$('#bankName_' + seqNo).hide();
						$('#chequeDate_' + seqNo).hide();
					}
				}
			},500);
		}
	},500);
}

function calculateTDS(obj){
	
	var paymentStatus				= $('#paymentStatus_CreditClearanceTable-1').val();
	var paymentId					= document.getElementById('paymentStatus_CreditClearanceTable-1');
	var tableEl 					= document.getElementById('reportTable');
	var totalReceivedAmount 		= 0;
	var receivedAmount 				= 0;
	var tableLength					= tableEl.rows.length;
	var creditPaymentTypeSelection	= $('#typeOfSelection').val();
	
	if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
		$('#hiddenPaymentStatus_CreditClearanceTable-1').val(paymentId.value);
	}
	if($('#applyTDS').is(":checked") && allowToCalculateTDSOnManualPercentage){
		$('#applyTDSPercentage').show();
	} else{
		$('#applyTDSPercent').val(0);
		$('#applyTDSPercentage').hide();
	}
	
	if(obj.checked == true || ($('#applyTDSPercent').val() != undefined && $('#applyTDSPercent').val() > 0)){
		isApplyTDS = true;
		if(paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID || paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
			for(var row = 1; row < tableLength; row++) {
				$('#paymentStatus_' + row).val(paymentId.value);
				$('#hiddenPaymentStatus_' + row).val(paymentId.value);

			var grandTotal = parseInt($('#grandTotal_' + row).val());
			var receivedAmtLimit	= parseInt($("#receivedAmtLimit_" + row).val());
			
			if(receivedAmtLimit > 0)
				grandTotal = grandTotal - receivedAmtLimit;
				
				if(paymentId.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID || paymentId.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
					if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
						$('#hiddenPaymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
						$('#paymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
						$('#paymentMode_' + row).prop('disabled', 'disabled');
					} else {
						$('#paymentMode_' + row).removeAttr("disabled");
					}
					
					if(tdsConfiguration.IsTdsAllow && paymentStatus != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
						$('#txnAmount_' + row).val(grandTotal);
					} else {
						$('#receiveAmt_' + row).val(grandTotal);
					}

					if(allowToCalculateTDSOnManualPercentage)
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[13].children[0]);
					else
						receivedAmount 		= tdsCalculation(tableEl.rows[row].cells[14].children[0]);
						
					totalReceivedAmount = parseInt(totalReceivedAmount,10) + parseInt(receivedAmount,10);
				} else {
					$('#txnAmount_' + row).val(0);
					$('#tdsAmt_' + row).val(0);
					$('#receiveAmt_' + row).val(0);
					$('#balanceAmt_' + row).val($('#grandTotal_' + row).val());
					
					if(creditPaymentTypeSelection == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
						$('#hiddenPaymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
						$('#paymentMode_' + row).val($('#paymentMode_CreditClearanceTable-1').val());
						$('#paymentMode_' + row).prop('disabled', 'disabled');
					} else {
						$('#paymentMode_' + row).removeAttr("disabled");
					}
				}
			}
			
			var summDataTable 	= document.getElementById('summDataTable');

			if(summDataTable != null){
				for(var row = 1; row < summDataTable.rows.length; row++) {
					document.getElementById('paymentStatus_CreditClearanceTable-1').value 	= paymentId.value;

					if(paymentId.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID || allowToCalculateTDSOnManualPercentage && paymentId.value == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID) {
						calSumDataTable(totalReceivedAmount);
					} else {
						$('#txnAmount_CreditClearanceTable-1').val(0);
						$('#tdsAmt_CreditClearanceTable-1').val(0);
						$('#receiveAmt_CreditClearanceTable-1').val(0);
						$('#balanceAmt_CreditClearanceTable-1').val($('#grandTotal_CreditClearanceTable-1').val());
					}
				}
			}
		}
	} else {
		isApplyTDS = false;
		var tableEl = document.getElementById('reportTable');

		var tableLength		= tableEl.rows.length;
		
		for(var row = 1; row < tableLength; row++) {
			$("#tdsAmt_" + row).val(0);
			$("#receiveAmt_" + row).val(Math.round($('#txnAmount_' + row).val()));
		}
		$("#tdsAmt_CreditClearanceTable-1").val(0);
		$("#receiveAmt_CreditClearanceTable-1").val(Math.round($('#txnAmount_CreditClearanceTable-1').val()));
	}
	
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
			
		if(element != undefined && element != null)
			changeTextFieldColorNew(element, '', '', 'red');

		return false;
	}

	return true;
}

function makeDisable(id) {
	var x = document.getElementById(id)
	x.disabled = true
	showMessage('error', "Cannot Receive Other Branch Lr Credit Payment");
	toogleElement('error','block');
	return false;
}


function setAllDiscountTypes(obj, tableId) {
	var tableEl = document.getElementById(tableId);
	var tableLength		= tableEl.rows.length;
	for(var row = 1; row < tableLength; row++)
		$('#discountTypes_' + row).val(obj.value);
	
}


function resetSummaryDetails(obj) {
		var tab 	= document.getElementById("reportTable");
		var count 	= parseFloat(tab.rows.length - 1);
		var row;
		var totalTxnAmount 		= 0;
		var totalTdsAmount	 	= 0;
		var totalReceivedAmt 	= 0;
		var totalBalanceAmt	 	= 0;
		var totalAmount			= 0;
		
		if(Number($('#typeOfSelection').val()) == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR) {
			row = count;
		} else {
			row = count - 1;
		}
			for (row; row > 0; row--) {
				 var checked  = tab.rows[row].cells[0].getElementsByTagName("input")[0].checked;
		
				 if(!checked)
				 	continue;
				if(!(Number($("#paymentMode_" + row).val()) > 0 && Number($("#paymentStatus_" + row).val()) > 0 && Number($("#receiveAmt_" + row).val()) > 0)) {
					if(tdsConfiguration.IsTdsAllow) {
						if($("#balanceAmt_" + row).val() > 0) {
							$("#txnAmount_" + row).val($("#balanceAmt_" + row).val());
						}
						
						$("#receiveAmt_" + row).val(Number($("#txnAmount_" + row).val()) - Number($("#tdsAmt_" + row).val()));
					} else {
						$("#receiveAmt_" + row).val($("#balanceAmt_" + row).val());
					}
					
					$("#balanceAmt_" + row).val(0);
				}
				totalAmount			+= Number($("#grandTotal_" + row).val());
				totalTxnAmount		+= Number($("#txnAmount_" + row).val());
				totalTdsAmount		+= Number($("#tdsAmt_" + row).val());
				totalBalanceAmt		+= Number($("#balanceAmt_" + row).val());
				totalReceivedAmt	+= Number($("#receiveAmt_" + row).val());
			}

		$("#grandTotal_CreditClearanceTable-1").val(totalAmount);
		$("#txnAmount_CreditClearanceTable-1").val(totalTxnAmount);
		$("#tdsAmt_CreditClearanceTable-1").val(totalTdsAmount);
		$("#balanceAmt_CreditClearanceTable-1").val(totalBalanceAmt);
		$("#receiveAmt_CreditClearanceTable-1").val(totalReceivedAmt);
}

function searchCreditData() {
	if(allowToCalculateTDS && $('#applyTDSCheck').is(':visible'))
		$('#applyTDS').prop('checked', false);
	
	var branchId		= $('#partyBranchId').val();
	var partyMasterId	= $('#partyMasterId').val();
	var txnType 		= document.getElementById("txnType");
	let filter			= Number($('#moduleType').val());
	
	
	if(branchId > 0 && (partyMasterId > 0 || lrCreditConfig.showBranchWiseOptionInMultipleClear)) {
		showLayer();
			
		var jsonObject	= new Object();
			
		jsonObject.destinationBranchId	= branchId;
		jsonObject.txnTypeId			= txnType.value;
		jsonObject.partyMasterId		= partyMasterId;
		jsonObject.filter				= filter;
			
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/creditPaymentModuleWS/getCreditPaymentData.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				hideLayer();
				
				if(typeof data.message !== 'undefined') {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.description);
					return;
				}
				
				var creditPaymentDataList	= data.creditPaymentDataList;
					
				if(typeof creditPaymentDataList !== 'undefined')
					setLRDetails(creditPaymentDataList, data, filter);
			}
		});
	} else {
		if(branchId <= 0){
			showMessage('error',"Please Select Branch !");
			toogleElement('error','block');
			changeError1('searchByBranchId','0','0');
			$("#txnType").focus(); 
			return;
		}
	}	
}