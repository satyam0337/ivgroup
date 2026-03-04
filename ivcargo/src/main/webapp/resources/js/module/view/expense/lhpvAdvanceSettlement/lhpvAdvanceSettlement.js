/**
 * 
 */
var execFieldPermissions			= null;
var configuration					= null;
var paymentTypeArr					= null;
var moduleId						= 0;
var incomeExpenseModuleId			= 0;
var ModuleIdentifierConstant		= null;
var bankPaymentOperationRequired	= false;
var PaymentTypeConstant				= null;
var LHPVConstant					= null;
var FeildPermissionsConstant		= null;
var LHPVAdvanceTdsProperty			= false;
var tdsProperties					= null;
var doneTheStuff					= false;
var showTxnDateInImps				= false;
var GeneralConfiguration			= null;

function loadLhpvAdvanceSettlement() {
	let jsonObject		= new Object();
	
	showLayer();

			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL + '/lhpvAdvanceSettlementWS/loadLHPVTruckAdvance.do',
				data		: '',
				dataType	: 'json',
				success: function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						hideLayer();
					} else {
						console.log(data);
						jsondata				= data;

						configuration					= data.LhpvAdvanceSettlementConfiguration;
						executive						= data.executive;
						execFieldPermissions			= data.execFldPermissions;
						PaymentTypeConstant				= data.PaymentTypeConstant;
						LHPVConstant					= data.LHPVConstant;
						paymentTypeArr					= data.paymentTypeArr;
						moduleId						= data.moduleId;
						incomeExpenseModuleId			= data.incomeExpenseModuleId;
						ModuleIdentifierConstant		= data.ModuleIdentifierConstant;
						FeildPermissionsConstant		= data.FeildPermissionsConstant;
						tdsProperties					= data.LHPVAdvanceTdsProperty;
						GeneralConfiguration			= data.GeneralConfiguration;
						showTxnDateInImps				= GeneralConfiguration.showTxnDateInImps;
						bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;

						if(bankPaymentOperationRequired) {
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
						}
						
						$( function() {
							$('#expenseDateForAll').val(dateWithDateFormatForCalender(new Date(),"-"));
							$('#expenseDateForAll').datepicker({
								maxDate		: currentDate,
								minDate		: previousDate,
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						} );

						$( "#expenseDateForAll" ).val(currentDate);
						$( "#expenseDateForAll" ).prop("readonly", true);
												
						if(configuration.manualNumber){
							$('#isManualCheck').prop('checked', false);
							$('#manualNumberMainDiv').removeClass('hide');
							$('#isManualCheck').click(function(){
								if($('#isManualCheck').is(':checked'))
									$('#manualNumberDiv').removeClass('hide');
								else
									$('#manualNumberDiv').addClass('hide');
								$('#manualNumber').val('');
							});
						}else{
							$('#manualNumberMainDiv').remove();
						}
						
						if(configuration.showPaidToField) {
							$('#paymentMadeToDiv').removeClass('hide');
							initPaidToVendorAutocompleteForLHPV();
						} else
							$('#paymentMadeToDiv').addClass('hide');

						hideLayer();
					}
				}
			});
}

function validateElement() {

	let lhpvNo	= document.getElementById('lhpvNo');
	let str		= lhpvNo.value.replace(/\s/g, '');
	let paymentDetailsOnly = $('#paymentDetailsOnly').val();
	
	if(paymentDetailsOnly == 'true')
		$('#paymentDetailsOnly').val('false');
	
	if(str.length == 0) {
		showMessage('error', "Please Enter Number.");
		toogleElement('basicError','block');
		setTimeout(function(){
			if(lhpvNo) {
				lhpvNo.focus();lhpvNo.select();
			}
		},100);
		return false;
	}
	
	if ($("#expenseChargeMasterId").val() == "") {
		showMessage('error', "Please Select Proper Charge Type.");
		toogleElement('basicError','block');
		return false;
	}
	
	if ($("#mappingChargeTypeId").val() == "") {
		showMessage('error', "Please Select Proper Charge Type.");
		toogleElement('basicError','block');
		return false;
	}
	
	toogleElement('basicError','none');
	return true;

}

function validateReceiveAmount(obj) {
	let objVal		= 0;
	let maxAmt 		= parseInt(document.getElementById("advanceAmount").value,10);
	let minAmt 		= parseInt(document.getElementById("receivedAmtLimit").value,10);
	
	if(minAmt > 0)
		maxAmt = (maxAmt - minAmt);
	
	let isObjValshldzero = false;

	if(obj.value.length > 0)
		objVal = parseInt(obj.value,10);

	if(objVal > maxAmt) {
		obj.value = 0;
		showMessage('info', 'You can not enter greater value than ' + maxAmt);
		isObjValshldzero = true;
	}
	
	if(isObjValshldzero) {
		obj.value = 0;
		objVal = 0;
	}
	
	document.getElementById("balanceAmount").value 
	= (parseInt(document.getElementById("advanceAmount").value,10)) 
	- (parseInt(document.getElementById("receivedAmtLimit").value) + objVal);

}

function reprintVoucher() {
	let id = $('#previousVoucherDetailsId').val();
	console.log(id);
	openPrintForVoucherBill(id);
}

function printLhpv() {
	let id = $('#previousLhpvPrintId').val();
	openPrintForLhpvPrint(id);
}

function openPrintForVoucherBill(id) {
	newwindow=window.open('BillPrint.do?pageId=25&eventId=16&voucherDetailsId='+id, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function openPrintForLhpvPrint(id) {
	newwindow=window.open('LHPVView.do?pageId=48&eventId=1&lhpvId='+id+'&isOriginal=false');
}

function checkBalanceAmount(obj ,actualBalanceAmount) {
	let enteredBalAmt = parseInt(obj.value);

	if(enteredBalAmt > parseInt(actualBalanceAmount)) {
		obj.value = parseInt(actualBalanceAmount);
		showMessage('info', 'You can not enter Balance Amount more than ' + parseInt(actualBalanceAmount));
	}
}

function formValidation() {
	if($('#isManualCheck').is(':checked') && $('#manualNumber').val() == ''){
		showMessage('error','Please Enter LHPV Truck Advance Settlement Number!');
		$('#manualNumber').focus();
		hideLayer();
		return false;
	}
	if($( "#expenseDateForAll" ).val() != undefined){
		
		let manualLhpvDate  = $( "#expenseDateForAll" ).val();
		
		manualLhpvDate  = parseDate(manualLhpvDate);
		
		if(typeof lhpvDate == "string"){
			lhpvDate 		= parseDate(lhpvDate);
		}
		
		if(manualLhpvDate < lhpvDate){
			showMessage('error', "LHPV Voucher Date earlier than LHPV Creation Date");
			return false;
		}
	}
	
	let paymentType		= $('#paymentType').val();

	if(parseInt(document.getElementById("amount").value,10) <= 0) {
		showMessage('error', amountEnterErrMsg);
		toogleElement('basicError','block');
		changeError1('amount','0','0');
		return false;
	}
	
	if(tdsProperties.IsPANNumberRequired 
			|| tdsProperties.IsPANNumberMandetory) {

		if($("#tdsAmount").val() > 0) {
			if(tdsProperties.IsPANNumberRequired) {
				if(!validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', panNumberErrMsg)
				|| !validateInputTextFeild(8, 'panNumber', 'panNumber', 'error', validPanNumberErrMsg))
					return false;
			}

			if(tdsProperties.IsPANNumberMandetory) {
				if(!validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', tanNumberErrMsg)
				|| !validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'error', validTanNumberErrMsg))
					return false;
			}
		}
	}

	if($("#remark").val() == ''){
		showMessage('error', ramarkErrMsg);
		toogleElement('basicError','block');
		changeError1('remark','0','0');
		return false;
	}
	
	if(bankPaymentOperationRequired == 'true' || bankPaymentOperationRequired == true) {
		if(paymentType > 0 && paymentType != PAYMENT_TYPE_CASH_ID && paymentType != PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
			if($('#storedPaymentDetails').children().length == 0) {
				showMessage('error', 'Please, Add Payment Details !');
				return false;
			}
		}
	} else if (execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_CHEQUE] != undefined || execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_CREDIT] != undefined) {
		if(paymentType == PAYMENT_TYPE_CHEQUE_ID) {
			if (!ChequeValidation())
				return false;
		} else if(paymentType == PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
			if (!CreditValidation())
				return false;
		}
	}
	
	if(configuration.showPaidToField && $('#paymentMadeTo_primary_key').val() == 0) {
		showMessage('error', 'Please Select Paid To Person !!');
		return false;
	}
	
	if($('#paymentMode').exists() && $('#paymentMode').is(":visible")){
		if($('#paymentMode').val() <= 0){
			showMessage('error', 'Please, Select Payment Mode !');
			toogleElement('paymentMode','block');
			changeError1('paymentMode','0','0');
			return false;
		}
	}
	
	let advanceAmount	= configuration.advanceAmount;
	
	if(configuration.advanceAmountValidation && Number($("#amount").val()) > advanceAmount 
			&& Number($("#paymentType").val()) == PAYMENT_TYPE_CASH_ID) {
		showMessage('error','You Can Not Enter Above ' + advanceAmount + ', Cash Allowed Last '+ advanceAmount);
		$("#amount").focus();
		return false;
	}

	return true;
}

function ChequeValidation() {
	
	if(bankPaymentOperationRequired)
		return true;
	
	if($("#paymentType").val() == PAYMENT_TYPE_CHEQUE_ID) {
		if ($("#chequedatepicker").val() == '' || !isValidDate($("#chequedatepicker").val())) {
			showMessage('error', 'Please Select Proper Date');
			changeError1('chequedatepicker','0','0');
			return false;
		}

		if ($("#chequeNumber").val() == '') {
			showMessage('error', 'Please Enter Proper Cheque Number');
			changeError1('chequeNumber','0','0');
			return false;
		}

		if ($("#chequeNumber").val().length != 6) {
			showMessage('error', 'Please Enter Six Digit Cheque Number');
			changeError1('chequeNumber','0','0');
			return false;
		}

		if ($("#bankName").val() == '') {
			showMessage('error', bankErrMsg);
			changeError1('bankName','0','0');
			return false;
		}
	}

	if($("#paymentType").val() == PAYMENT_TYPE_ONLINE_RTGS_ID || $("#paymentType").val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		if ($("#chequedatepicker").val() == '' || !isValidDate($("#chequedatepicker").val())) {
			showMessage('error', 'Please Select Proper Date');
			changeError1('chequedatepicker','0','0');
			return false;
		}

		if ($("#chequeNumber").val() == '') {
			showMessage('error', 'Please Enter Proper Txn Number');
			changeError1('chequeNumber','0','0');
			return false;
		}

		if ($("#bankName").val() == '') {
			showMessage('error', bankErrMsg);
			changeError1('bankName','0','0');
			return false;
		}
	}

	return true;
}

function CreditValidation() {
	if($('#paymentType').val() == PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
		if (document.getElementById("creditdatepicker").value == '' || !isValidDate(document.getElementById("creditdatepicker").value)) {
			showMessage('error', 'Please Select Proper Date');
			changeError1('creditdatepicker','0','0');
			return false;
		}

		if (configuration.creditSlipNumberFeild) {
			if (document.getElementById("creditSlipNumber").value == '') {
				showMessage('error', 'Please Enter Proper Credit Slip Number');
				changeError1('creditSlipNumber','0','0');
				return false;
			}
		}

		if ($("#creditAccount").val() == '') {
			showMessage('error', 'Please Enter Proper Credit Account Name');
			changeError1('creditAccount','0','0');
			return false;
		}
	}

	return true;
}

function validateLHPVAdvanceSettlement() {
	if(formValidation()) {
		disableButtons();
		showLayer();
		
	
		//empty check
		let answer = confirm ("Are you sure you want to Save Amount ?");
		
		if(answer) {
			if($("#balanceAmount").val() == 0){
				$('#advanceSettlementStatus').val(LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_CLEAR);
			} else {
				$('#advanceSettlementStatus').val(LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_PARTIAL);
			}
			
			
			disableButtons();
			showLayer();
			let lhpvAdvanceVoucher										= new Object();
			lhpvAdvanceVoucher["lhpvId"]								= $('#lhpvId').val();
			lhpvAdvanceVoucher["lhpvNumber"]							= $('#lhpvNumber').val();
			lhpvAdvanceVoucher["paymentMadeTo"]							= $('#paymentMadeTo').val();
			lhpvAdvanceVoucher["vendorMasterId"]						= $('#paymentMadeTo_primary_key').val();

			if($('#expenseChargeMasterId1').val() != 0) {
				lhpvAdvanceVoucher["expenseChargeMasterId"]			= $('#expenseChargeMasterId1').val();
			} else {
				lhpvAdvanceVoucher["expenseChargeMasterId"]			= $('#expenseChargeMasterId').val();  
			}
			
			lhpvAdvanceVoucher["manualLHPVAdvanceDate"]					= $('#expenseDateForAll').val();
		
			if($('#mappingChargeTypeId1').val() != 0) {
				lhpvAdvanceVoucher["mappingChargeTypeId"]			= $('#mappingChargeTypeId1').val();
			} else {
				lhpvAdvanceVoucher["mappingChargeTypeId"]			= $('#mappingChargeTypeId').val();  
			}
			
			lhpvAdvanceVoucher["lhpvChargeExpenseVoucherSettlementId"]	= $('#lhpvChargeExpenseVoucherSettlementId').val();
			
			if($('#lhpvChargeSettledAmount').val() == '') {
				lhpvAdvanceVoucher["lhpvChargeSettledAmount"]			= parseFloat($('#amount').val());
			} else {
				lhpvAdvanceVoucher["lhpvChargeSettledAmount"]			= parseFloat($('#lhpvChargeSettledAmount').val()) + parseFloat($('#amount').val());
			}
			
			lhpvAdvanceVoucher["paymentType"]							= $('#paymentType').val();
			lhpvAdvanceVoucher["amount"]								= $('#amount').val();
			lhpvAdvanceVoucher["remark"]								= $('#remark').val();
			lhpvAdvanceVoucher["advanceSettlementStatus"]				= $('#advanceSettlementStatus').val();
			lhpvAdvanceVoucher["totalAdvanceAmount"]					= $('#totalAdvanceAmount').val();
			lhpvAdvanceVoucher["tdsOnAmount"]							= $('#amount').val();
			lhpvAdvanceVoucher["tdsAmount"]								= $('#tdsAmount').val();
			lhpvAdvanceVoucher["tdsRate"]								= $('#tdsRate').val();
			lhpvAdvanceVoucher["PanNumber"] 							= $('#panNumber').val();
			lhpvAdvanceVoucher["TanNumber"] 							= $('#tanNumber').val();
			
			if (execFieldPermissions[FeildPermissionsConstant.DEBIT_TO_BRANCH] != undefined) {
				lhpvAdvanceVoucher["debitToBranchId"] 							= $('#debitToBranchSelection').val();
			} else {
				lhpvAdvanceVoucher["debitToBranchId"] 							= 0;
			}
			
			if (bankPaymentOperationRequired || execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_CHEQUE] != undefined || execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_CREDIT] != undefined || execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_RTGS] != undefined || execFieldPermissions[FeildPermissionsConstant.LHPV_ADVANCE_SETTLEMENT_IN_NEFT] != undefined) {
				if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID) {
					if($('#chequeNumber').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNumber').val();
					} else if($('#chequeNo').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNo').val();
					}
					
					if($('#chequedatepicker').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequedatepicker').val();
					} else if($('#chequeDate').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequeDate').val();
					}
					
					if($('#accountNo_primary_key').exists()) {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#accountNo_primary_key').val();
					} else {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#bankName').val();
					}
					
					if($('#payeeName').exists()) {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#payeeName').val();
					} else {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#chequeGivenTo').val();
					}
				}
				
				if($('#paymentType').val() == PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
					lhpvAdvanceVoucher["creditSlipNumber"]					= $('#creditSlipNumber').val();
					lhpvAdvanceVoucher["creditdatepicker"]					= $('#creditdatepicker').val();
					lhpvAdvanceVoucher["creditAccountId"]					= $('#creditAccount').val();
					let obj = selectizeAccount[0].selectize;
					let item = obj.getItem($('#creditAccount').val());
					lhpvAdvanceVoucher["creditAccountName"]				= $(item[0].childNodes[0]).text();
				}
				
				if($('#paymentType').val() == PAYMENT_TYPE_ONLINE_RTGS_ID) {
					if($('#chequeNumber').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNumber').val();
					} else if($('#chequeNo').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNo').val();
					}
					
					if($('#chequedatepicker').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequedatepicker').val();
					} else if($('#chequeDate').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequeDate').val();
					}
					
					if($('#accountNo_primary_key').exists()) {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#accountNo_primary_key').val();
					} else {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#bankName').val();
					}
					
					if($('#payeeName').exists()) {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#payeeName').val();
					} else {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#chequeGivenTo').val();
					}
				}
				
				if($('#paymentType').val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
					if($('#chequeNumber').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNumber').val();
					} else if($('#chequeNo').exists()) {
						lhpvAdvanceVoucher["chequeNumber"]				= $('#chequeNo').val();
					}
					
					if($('#chequedatepicker').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequedatepicker').val();
					} else if($('#chequeDate').exists()) {
						lhpvAdvanceVoucher["chequeDate"]			= $('#chequeDate').val();
					}

					if($('#accountNo_primary_key').exists()) {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#accountNo_primary_key').val();
					} else {
						lhpvAdvanceVoucher["bankAccountId"]		= $('#bankName').val();
					}

					if($('#payeeName').exists()) {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#payeeName').val();
					} else {
						lhpvAdvanceVoucher["chequeGivenTo"]			= $('#chequeGivenTo').val();
					}
				}
				
				if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID || $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID) {
					lhpvAdvanceVoucher["chequeNumber"]				= $('#cardNo').val();
				}
				
				if($('#paymentType').val() == PAYMENT_TYPE_IMPS_ID || $('#paymentType').val() == PAYMENT_TYPE_PAYTM_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_UPI_ID || $('#paymentType').val() == PAYMENT_TYPE_PHONE_PAY_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_GOOGLE_PAY_ID || $('#paymentType').val() == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
					lhpvAdvanceVoucher["chequeNumber"]				= $('#referenceNumber').val();
					
					if(showTxnDateInImps && $('#paymentType').val() == PAYMENT_TYPE_IMPS_ID) {
						if($('#chequedatepicker').exists()) {
							lhpvAdvanceVoucher["chequeDate"]			= $('#chequedatepicker').val();
						} else if($('#chequeDate').exists()) {
							lhpvAdvanceVoucher["chequeDate"]			= $('#chequeDate').val();
						}
					}
				}
				
				lhpvAdvanceVoucher["paymentValues"]	= $('#paymentCheckBox').val();
				
				lhpvAdvanceVoucher["isManualVoucherNumber"]	= $('#isManualCheck').is(':checked');
				if($('#isManualCheck').is(':checked'))
					lhpvAdvanceVoucher["manualVoucherNumber"]	= $('#manualNumber').val();
			}
			
			if(!doneTheStuff) {
				doneTheStuff = true;
				$.ajax({
					type		: "POST",
					url			: WEB_SERVICE_URL + '/lhpvAdvanceSettlementWS/settleLHPVTruckAdvance.do',
					data		: lhpvAdvanceVoucher,
					dataType	: 'json',
					success: function(data) {
						if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							hideLayer();
						} else if(data.message) {
							let errorMessage = data.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

							if(errorMessage.typeName == 'success') {
								openPrintForVoucherBill(data.voucherDetailsId);
								$('#previousVoucherDetailsMessage').html("<h4> Voucher " + data.paymentVoucherNumber + " has been created !</h4>");
								$('#previousVoucherDetailsId').val(data.voucherDetailsId);
								$('#previousLhpvPrintId').val(data.lhpvId);
								$("#previousVoucherDetails").css("display", "block");
								$("#previousVoucherPrint").css("display", "block");
									
								if(data.showLhpvPrintButtonOnSuccess)
									$("#previousLhpvPrint").css("display", "block");
									
								refreshAndHidePartOfPage('bottom-border-boxshadow','hideAndRefresh');
								$("#lhpvNo").focus();
							}else
								doneTheStuff = false;
						}
							
						enableButtons();
						hideLayer();
					}
				});
			}
			
			return false;
		} else {
			doneTheStuff = false;
			enableButtons();
			hideLayer();
		}
	}	
}

function disableButtons(){
	let saveButton = document.getElementById("Save");
	
	if(saveButton != null){
		saveButton.className = 'btn btn-primary';
		saveButton.disabled=true;
		saveButton.style.display ='none'; 
	}
	
	let searchButton = document.getElementById("searchButton");
	if(searchButton != null){
		searchButton.className = 'btn btn-primary';
		searchButton.disabled=true;
		searchButton.style.display ='none'; 
	};
};

function enableButtons(){
	let saveButton = document.getElementById("Save");
		if(saveButton != null){
			saveButton.className = 'btn btn-primary';
			saveButton.disabled=false;
			saveButton.style.display ='inline-block'; 
		}
	let searchButton = document.getElementById("searchButton");
		if(searchButton != null){
			searchButton.className = 'btn btn-primary';
			searchButton.disabled=false;
			searchButton.style.display ='block'; 
		}
			
}

function calculateTDSAmount() {
	let amount		= $('#amount').val();
	let tdsrate		= $('#tdsRate').val();
	
	if(amount > 0 && tdsrate > 0) {
		let tdsamount	= (amount * tdsrate) / 100;
		
		$('#tdsAmount').val(tdsamount);
	}
}

function initPaidToVendorAutocompleteForLHPV() {
	if ($('#paymentMadeTo').length === 0) 
		return;

	$('#paymentMadeTo').off('focus click input keydown');
	setVendorAutocompleteForPaymentMadeTo();
	$('#paymentMadeTo').prop('disabled', false);
}

function setVendorAutocompleteForPaymentMadeTo() {
    if ($('#paymentMadeTo').data('autocomplete-initialized')) 
        return;
    
	let vendorAuto 				= Object();
	vendorAuto.url 				= WEB_SERVICE_URL + '/autoCompleteWS/getVendorNamesAutocomplete.do?isActiveOnly=true';
	vendorAuto.primary_key 		= 'vendorMasterId';
	vendorAuto.field 			= 'displayName';
	vendorAuto.searchFields 	= ['name', 'mobileNumber'];

	$("#paymentMadeTo").autocompleteCustom(vendorAuto);
}
