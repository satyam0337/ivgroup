/**
 * 
 */
var	paymentUniqueValue	= 1;
var accountNumberDisable	= false;
//var toBankAccountAutocomplete	= false;
var  generalConfigurationObj;
var hideChequeOrTxnNumberTextField	= false;
var hideUPIIdTextField				= false;
var bankAccountNotMandatory			= false;
var cardNumberNotMandatory			= false;
var showTxnDateInImps				= false;
var modal1                          = null;
var showTxnDateInPaymentMode		= false;
/*
 * moduleId, incomeExpenseModuleId are globally defined when page is load
 */
var validatePhonePayTransaction 			= false;
var accountMandatoryValidatedForPhonePe 	= false;
var allowDynamicPhonepeQR 					= false;
var accountMandatoryValidatedForLhpvCredit 	= false;
var allowTransactionDateAndTimePhonePe		= false;

function setIssueBankAutocomplete() {
	let issueBankAuto 			= Object();

	issueBankAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankNameAutocomplete.do';
	issueBankAuto.primary_key 	= 'bankId';
	issueBankAuto.field 		= 'bankName';
	issueBankAuto.callBack		= callBackBank;
	$("#bankName").autocompleteCustom(issueBankAuto);

	function callBackBank() {
		$('#bankNameId').val($('#bankName_primary_key').val());
	}
}

function setReceivingBankAutocomplete() {
	let issueBankAuto1 			= Object();

	issueBankAuto1.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankNameAutocomplete.do';
	issueBankAuto1.primary_key 	= 'bankId';
	issueBankAuto1.field 		= 'bankName';
	issueBankAuto1.callBack		= callBackBank;
	$("#tobankName").autocompleteCustom(issueBankAuto1);

	function callBackBank() {
		$('#tobankNameId').val($('#tobankName_primary_key').val());
	}
}

function setAccountNoAutocomplete() {
	let issueBankAuto 			= Object();

	issueBankAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankAccountAutocomplete.do';
	issueBankAuto.primary_key 	= 'bankAccountId';
	issueBankAuto.field 		= 'bankAccountNumber';
	issueBankAuto.callBack		= callBackBank;
	
	$("#accountNo").autocompleteCustom(issueBankAuto);

	function callBackBank() {
		$('#bankAccountId').val($('#accountNo_primary_key').val());
	}
	
	if (validatePhonePayTransaction) {
		issueBankAuto = new Object();
		issueBankAuto.url = WEB_SERVICE_URL + '/bankAccountWS/getBranchWiseBankAccountListWithQRcodeIds.do';
		issueBankAuto.primary_key = 'bankAccountIdStr';
		issueBankAuto.field = 'bankAccountNumber';
		issueBankAuto.callBack = callBackBank2;
		
		function callBackBank2(res) {
			let accoutQrArr = $('#accountNoWithQr_primary_key').val().split('_');
			$('#accountNoWithQrId').val(accoutQrArr[0]);
			$('#qrCodeMapperId').val(accoutQrArr[1]);
		}
		
		$("#accountNoWithQr").autocompleteCustom(issueBankAuto);
	}
}

function setReceivingAccountNoAutocomplete() {
	let issueBankAuto1 			= Object();

	issueBankAuto1.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankAccountAutocomplete.do';
	issueBankAuto1.primary_key 	= 'bankAccountId';
	issueBankAuto1.field 		= 'bankAccountNumber';
	issueBankAuto1.callBack		= callBackBank;
	$("#toaccountNo").autocompleteCustom(issueBankAuto1);

	function callBackBank() {
		$('#tobankAccountId').val($('#toaccountNo_primary_key').val());
	}
}

function hideShowBankPaymentTypeOptions(obj) {	// Previous Name hideShowChequeDetails()
	resetPaymentModel();
	
	if(typeof generalConfiguration != undefined && typeof generalConfiguration != 'undefined')
		generalConfigurationObj = generalConfiguration;
	else if(typeof GeneralConfiguration != undefined && typeof GeneralConfiguration != 'undefined')
		generalConfigurationObj = GeneralConfiguration;
	
	if(generalConfigurationObj != null) {
		hideChequeOrTxnNumberTextField	= generalConfigurationObj.hideChequeOrTxnNumberTextField  == true || generalConfigurationObj.hideChequeOrTxnNumberTextField  == 'true';
		hideUPIIdTextField				= generalConfigurationObj.hideUPIIdTextField  == true || generalConfigurationObj.hideUPIIdTextField  == 'true';
		bankAccountNotMandatory			= generalConfigurationObj.bankAccountNotMandatory  == true || generalConfigurationObj.bankAccountNotMandatory  == 'true';
		cardNumberNotMandatory			= generalConfigurationObj.cardNumberNotMandatory  == true || generalConfigurationObj.cardNumberNotMandatory  == 'true';
		showTxnDateInImps				= generalConfigurationObj.showTxnDateInImps  == true || generalConfigurationObj.showTxnDateInImps  == 'true';
		accountNumberDisable			= generalConfigurationObj.isAccountNumberDisable  == true || generalConfigurationObj.isAccountNumberDisable  == 'true';
		showTxnDateInPaymentMode		= generalConfigurationObj.showTxnDateInPaymentMode  == true || generalConfigurationObj.showTxnDateInPaymentMode  == 'true';
	}

	$('#chequeDate').val(dateWithDateFormatForCalender(new Date(),"-")); //dateFormatForCalender defined in genericfunctions.js file
	$('#chequeDate').datepicker({
		dateFormat: 'dd-mm-yy'
	});
		
	$('#creditDate').val(dateWithDateFormatForCalender(new Date(),"-")); //dateFormatForCalender defined in genericfunctions.js file
	$('#creditDate').datepicker({
		dateFormat: 'dd-mm-yy'
	});

	if(obj.value != 0) {
		if(validatePhonePayTransaction && obj.value == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && (moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR || moduleId == PARTIAL_DELIVERY)) {
			showStaticPaymentFeilds();
			$('#bankAccountIdDiv').addClass('hide');
			setTimeout(function() {
				$('#accountNoWithQr').focus();
			}, 1100);
			$('#accountNoWithQr').focus();
			$('#payment-modal-title').html('Phonepe Txn Details');
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$('#referenceNumberLebel').html("<span>Txn I'D</span><span style='color:red;font-size: 25px;'> *</span>");
			$('#referenceNumber').attr("placeholder","Txn I'D")

			if(allowDynamicPhonepeQR) {
				$('#dynamicPaymentButtonsRow').removeClass('hide');
				$('#referenceNumberRow').addClass('hide');  
				$('#txnDetailsBtn').addClass('hide');
				$('#accountNoWithQrDiv').addClass('hide');
				$("#accountNoRow").addClass("hide");
				$('#txnDateRow').addClass('hide');
				$('#txnTimeRow').addClass('hide');
			}

			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
			$("#issueBankRow").removeClass("hide");
			$("#chequeNumberRow").removeClass("hide");
			$("#chequeDateRow").removeClass("hide");
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$("#referenceNumberRow").removeClass("hide");
			$("#accountNoRow").removeClass("hide");
			hideDynamicPaymentRow();
			
			setTimeout(function(){
				$('#accountNo').focus();
			}, 1000);		

			if(hideChequeOrTxnNumberTextField)
				hideChequeOrTxnNumTextField();
			
			if(accountNumberDisable) {
				$("#accountNo").prop('disabled', true);
				$('.ac_result_area').hide();
			}
			
			$('#payment-modal-title').html('Cheque/RTGS/NEFT Txn Details');
			
			if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined) {
				if(typeof transferType !== 'undefined' && transferType != undefined && transferType == 3) {
					$("#toaccountNoRow").removeClass("hide");
					$("#toBankRow").removeClass("hide");
					$("#accountNoRow").removeClass("hide");
				} else {
					$("#toaccountNoRow").addClass("hide");
					$("#toBankRow").addClass("hide");
					$("#accountNoRow").removeClass("hide");
				}
			}
			
			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
			setTimeout(function() {
				$('#accountNo').focus();
			}, 1000);
			$("#referenceNumberRow").removeClass("hide");
			$("#accountNoRow").removeClass("hide");
			$("#mobileNumberRow").removeClass("hide");
			hideDynamicPaymentRow();
			
			if(showTxnDateInPaymentMode)					
				$("#chequeDateRow").removeClass("hide");
			
			$('#accountNo').focus();
			
			if(hideUPIIdTextField)
				hideUPITextField();
			
			if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID)
				$('#payment-modal-title').html('PAYTM Txn Details');
			else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID)
				$('#payment-modal-title').html('UPI Txn Details');
			else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
				$('#payment-modal-title').html('Phonepe Txn Details');
			else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID)
				$('#payment-modal-title').html('Google Pay Txn Details');
			else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID)
				$('#payment-modal-title').html('WhatsApp Pay Details');

			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$("#toaccountNoRow").addClass("hide");
			
			if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined) {
				if(typeof transferType !== 'undefined' && transferType != undefined && transferType == 3)
					$("#toaccountNoRow").removeClass("hide");
				else {
					$("#toaccountNoRow").addClass("hide");
					$("#toBankRow").addClass("hide");
				}
			}
			
			if(obj.value != PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID)
				$("#UpiIdRow").removeClass("hide");
			
			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
			if(accountNumberDisable) {
				$("#accountNo").prop('disabled', true);
				$('.ac_result_area').hide();
				$('#payerName').focus();
			} else
				$('#cardNo').focus();

			setTimeout(function(){
				$('#accountNo').focus();
			}, 1000);

			$("#cardNoRow").removeClass("hide");
			$("#accountNoRow").removeClass("hide");
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$('#payment-modal-title').html('Credit/Debit Txn Details');
			$("#toaccountNoRow").addClass("hide");
			hideDynamicPaymentRow();
			
			if(showTxnDateInPaymentMode)
				$("#chequeDateRow").removeClass("hide");
				
			if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined) {
				if(typeof transferType !== 'undefined' && transferType != undefined && transferType == 3)
					$("#toaccountNoRow").removeClass("hide");
				else {
					$("#toaccountNoRow").addClass("hide");
					$("#toBankRow").addClass("hide");
				}
			}

			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID) {
			setTimeout(function(){
				$('#accountNo').focus();
			}, 1000);

			if(accountNumberDisable) {
				$("#accountNo").prop('disabled', true);
				$('.ac_result_area').hide();
			}

			$("#issueBankRow").removeClass("hide");
			$("#referenceNumberRow").removeClass("hide");
			$("#accountNoRow").removeClass("hide");
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			hideDynamicPaymentRow();

			if(showTxnDateInImps)
				$("#chequeDateRow").removeClass("hide");

			$('#referenceNumber').focus();
			$('#payment-modal-title').html('IMPS Txn Details');

			if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined) {
				if(typeof transferType !== 'undefined' && transferType != undefined && transferType == 3) {
					$("#toaccountNoRow").removeClass("hide");
					$("#toBankRow").removeClass("hide");
				} else {
					$("#toaccountNoRow").addClass("hide");
					$("#toBankRow").addClass("hide");
				}
			}
			
			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_TRANSFER_ID || obj.value == PaymentTypeConstant.PAYMENT_TYPE_POS_ID) {
			$("#referenceNumberRow").removeClass("hide");
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$("#payerNameRow").addClass("hide");
			hideDynamicPaymentRow();
			
			setTimeout(function(){
				$('#accountNo').focus();
			}, 1000);
			
			if(accountNumberDisable) {
				$("#accountNo").prop('disabled', true);
				$('.ac_result_area').hide();
			}
			
			$('#payment-modal-title').html('POS/Transfer Txn Details');
				
			openBTModel();
		} else if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
			$("#creditDateRow").removeClass("hide");
			$("#creditSlipNoRow").removeClass("hide");
			$("#creditAccountNoRow").removeClass("hide");
			$("#payerNameRow").addClass("hide");
			$("#chequeGivenByRow").addClass("hide");
			$("#accountNoRow").addClass('hide')
		    $('#chequeAmount').removeAttr('readonly');
		    $('#chequeAmount').removeAttr('readonly');
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			$('#payment-modal-title').html('Credit Details');

			hideDynamicPaymentRow();
			
			openBTModel();
		} else {
			hideBTModel();
			
			if(typeof differentPaymentInMultiplePayment !== 'undefined' && differentPaymentInMultiplePayment != undefined 
					&& (differentPaymentInMultiplePayment == 'true' || differentPaymentInMultiplePayment == true))
				$("#viewAddedPaymentDetailsCreate").removeClass("hide");
			else
				$("#viewAddedPaymentDetailsCreate").addClass("hide");
		}

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID) {
			if(validatePhonePayTransaction && obj.value == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && (moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR || moduleId == PARTIAL_DELIVERY)) 
				$("#payerNameRow").addClass("hide");
			else
				$("#payerNameRow").removeClass("hide");

			if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
				$("#chequeGivenByRow").removeClass("hide");
		}
		
		if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID)
			$("#payerNameRow").addClass("hide");

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID) {
			$("#payeeNameRow").removeClass("hide");

			if(obj.value == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
				$("#chequeGivenToRow").removeClass("hide");
		}
		
		$('#chequeAmount').val($('#grandTotal').val());
	}

	$('#staticPaymentBtn').click(function() {
		showStaticPaymentFeilds();
	});
	
	$(document).keypress(function(e) { 
		if (e.keyCode == 27) { 
			setTimeout(function(){
				$('#paymentType').focus();
			}, 1000);
		} 
	});
}

function openBTModel() {
	if(typeof isNewBS !== 'undefined' && isNewBS != undefined && isNewBS == true) {
		modal1 		= new bootstrap.Modal(document.getElementById('paymentTypeModal'));
		modal1.show();
	} else {
		$("#paymentTypeModal").modal({
			backdrop: 'static',
			keyboard: false
		});
	}
}

function hideBTModel() {
	$('#paymentTypeModal').modal('hide');
}

function validatePaymentDetails(paymentType) {
	if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID 
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID 
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID 
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID) {
		if($('#bankName_primary_key').val() <= 0 || $('#bankName_primary_key').val() == "") {
			setTimeout(function(){
				$('#bankName').focus();
			}, 1000);
		}

		if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined 
			&& typeof transferType !== 'undefined' && transferType != undefined && transferType == 3
			&& ($('#tobankName_primary_key').val() <= 0 || $('#tobankName_primary_key').val() == "")) {
				setTimeout(function(){
					$('#tobankName').focus();
				}, 1000);

			showMessage('error', 'Please, Select valid bank name. !');
			$('#tobankName').css('border-color', 'red');
			$('#tobankName').focus();
			return false;
		}

		if(paymentType != PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID) {
			if($('#chequeNo').val() <= 0 || $('#chequeNo').val() == "") {
				setTimeout(function(){
					$('#chequeNo').focus();
				}, 1000);

				showMessage('error', 'Please, Insert Cheque No. / txn No. !');
				$('#chequeNo').css('border-color', 'red');
				$('#chequeNo').focus();
				return false;
			}
		}
	}

	if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
		if($('#cardNo').val() == "") {
			if(!cardNumberNotMandatory) {
				setTimeout(function(){
					$('#cardNo').focus();
				}, 1000);

				showMessage('error', 'Please, Enter Card No. !');
				$('#cardNo').css('border-color', 'red');
				$('#cardNo').focus();
				return false;
			}
		}
	}

	if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
		if($('#referenceNumber').val() == "") {
			setTimeout(function(){
				$('#referenceNumber').focus();
			}, 1000);

			showMessage('error', 'Please, Enter Reference Number. !');
			$('#referenceNumber').css('border-color', 'red');
			$('#referenceNumber').focus();
			return false;
		}
	}
	
	if(validatePhonePayTransaction && paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && (moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR || moduleId == PARTIAL_DELIVERY)) {
		if(Number($('#accountNoWithQrId').val()) <= 0) {
			showMessage('error', 'Account Number is Mandatory for PhonePe Transaction validation !')
			$('#accountNoWithQr').css('border-color', 'red');
			$('#accountNoWithQr').focus();
			return false;
		}
			
		accountMandatoryValidatedForPhonePe = true;
	}
	
	if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
		if(Number($('#creditAccountNo_primary_key').val()) <= 0) {
			showMessage('error', 'Please Enter Proper Credit Account Name !')
			$('#creditAccountNo').css('border-color', 'red');
			$('#creditAccountNo').focus();
			return false;
		}

		accountMandatoryValidatedForLhpvCredit = true;
	}

	if(($('#bankAccountId').val() <= 0 || $('#accountNo_primary_key').val() == "") && !accountMandatoryValidatedForPhonePe && !accountMandatoryValidatedForLhpvCredit) {
		if(!bankAccountNotMandatory) {
			setTimeout(function(){
				$('#accountNo').focus();
			}, 1000);

			showMessage('error', 'Please, Select account no. !');
			$('#accountNo').css('border-color', 'red');
			$('#accountNo').focus();
			return false;
		}
	}

	return true;
}

function resetPaymentModel() {
	$('#bankAccountIdDiv').removeClass('hide');
	$('#referenceNumber').attr('placeholder', 'Party A/c / UTR No.');
	$('#referenceNumberLebel').html('Party A/c / Reference No');
	$('#accountNoWithQrDiv').addClass('hide');
	$("#issueBankRow").addClass("hide");
	$("#toBankRow").addClass("hide");
	$("#chequeNumberRow").addClass("hide");
	$("#chequeDateRow").addClass("hide");
	$("#amountRow").addClass("hide");
	$("#cardNoRow").addClass("hide");
	$("#referenceNumberRow").addClass("hide");
	$("#mobileNumberRow").addClass("hide");
	$("#payerNameRow").addClass("hide");
	$("#payeeNameRow").addClass("hide");
	$("#chequeGivenByRow").addClass("hide");
	$("#chequeGivenToRow").addClass("hide");
	$("#UpiIdRow").addClass("hide");
	$('#bankAccountId').val(0);
	$('#bankName').val('');
	$('#bankName_primary_key').val(0);
	$('#chequeNo').val('');
	$('#cardNo').val('');
	$('#referenceNumber').val('');
	$('#payerName').val('');
	$('#payeeName').val('');
	$('#mobileNumber').val('');
	$('#accountNo').val('');
	$('#accountNo_primary_key').val(0);
	$('#chequeGivenTo').val('');
	$('#chequeGivenBy').val('');
	$('#toaccountNo').val('');
	$('#toaccountNo_primary_key').val(0);
	$('#tobankName').val('');
	$('#tobankName_primary_key').val(0);
	$('#upiId').val('');
	$('#accountNoWithQr').val('');
	$('#accountNoWithQr_primary_key').val(0);
	$('#accountNoWithQrId').val(0);
	$('#payableAmountRemark').val('');
	$('#payableAmount').val(0);
	$("#creditCol").addClass("hide");
	$("#creditSlipNoRow").addClass("hide");
	$("#creditAccountNoRow").addClass("hide");
	$('#creditAccountNo_primary_key').val(0);
	$('#creditSlipNo').val('');
	$('#creditAccountNo').val('');
	$(".creditCol").addClass("hide");
	$('#txnDateEle').val('');
	$('#txnTimeEle').val('');
	/*This condition is for multiple payment*/
	let wayBillId		= $('#uniqueWayBillId').val();

	if(wayBillId > 0) {
		$('#chequeAmount').val(0);
		$('#paymentDataTr_' + wayBillId).remove();
	}
	
	if(typeof isFtl !== 'undefined' && isFtl) {
		if(moduleId == ModuleIdentifierConstant.LHPV)
			$('#paymentDataTr_LHPV').remove();
		else if(moduleId == ModuleIdentifierConstant.BILL_PAYMENT)
			$('#paymentDataTr_BillPayment').remove();
		else if(moduleId == ModuleIdentifierConstant.BOOKING)
			$('#paymentDataTr_Booking').remove();
	}

	//bindFocusOnCancel();
	/*
		This condition is for single payment
	 */
	if(typeof isFtl == 'undefined'
		&& (moduleId == ModuleIdentifierConstant.BOOKING 
			|| moduleId == ModuleIdentifierConstant.GENERATE_CR
			|| moduleId == ModuleIdentifierConstant.LHPV
			|| moduleId == ModuleIdentifierConstant.BLHPV
			|| moduleId == ModuleIdentifierConstant.BRANCH_INCOME
			|| moduleId == ModuleIdentifierConstant.BRANCH_EXPENSE
			|| moduleId == ModuleIdentifierConstant.CONSOLIDATED_BLHPV
			|| moduleId == ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE
			|| moduleId == ModuleIdentifierConstant.FUND_TRANSFER
			//|| moduleId == ModuleIdentifierConstant.AGENT_BILL_SETTLEMENT
			|| moduleId == ModuleIdentifierConstant.DOOR_PICKUP_DISPATCH
			//|| moduleId == ModuleIdentifierConstant.STBS_BILL_SETTLEMENT
			|| moduleId == ModuleIdentifierConstant.ON_ACCOUNT
			|| moduleId == ModuleIdentifierConstant.TCE_BOOKING
			|| moduleId == PARTIAL_DELIVERY
			)
			) {
		$('#storedPaymentDetails').empty();
	}
	
	if(modal1 != null) modal1.hide();
}

function addPaymentDetailsData() {
	/*
	 * Do not set this for Single operation
	 */
	let wayBillId		= $('#uniqueWayBillId').val();

	if(wayBillId == null || wayBillId == '' || wayBillId == undefined)
		wayBillId		= 0;

	//These are compulsory to set on payment type change in hidden in case of multiple payment
	//1 - uniquePaymentTypeName, 2 - uniquePaymentType, 3 - uniqueWayBillNumber, 4 - uniqueWayBillId
	//uniqueWayBillId - can be waybillid or billId depends on module
	//uniqueWayBillNumber - can be LR number or Bill No
	let paymentMode		= '';
	let paymentType		= 0;
	let selectize 		= null;
	let current 		= null;
	let option 			= null;
	
	if(wayBillId > 0) {
		paymentMode		= $('#uniquePaymentTypeName').val();
		paymentType		= $('#uniquePaymentType').val();
	} else if(typeof isFtl == 'undefined' && moduleId == ModuleIdentifierConstant.BOOKING) {
			paymentMode		= $("#paymentType option:selected").text();
			paymentType		= $('#paymentType').val();
		} else if(moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR || moduleId == PARTIAL_DELIVERY) {
			paymentMode		= $("#deliveryPaymentType option:selected").text();
			paymentType		= $('#deliveryPaymentType').val();
		} else if(moduleId == ModuleIdentifierConstant.LHPV || moduleId == ModuleIdentifierConstant.DOOR_PICKUP_DISPATCH || moduleId == ModuleIdentifierConstant.ON_ACCOUNT
			|| moduleId == ModuleIdentifierConstant.CONSOLIDATED_BLHPV) {
			selectize 		= $('#paymentType').get(0).selectize;
			current 		= selectize.getValue(); 
			option 			= selectize.options[ current ];
			paymentMode		= option.paymentTypeName;
			paymentType		= $('#paymentType').val();
		} else if(moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT) {
			if($('#paryWisePaymentMode').val() > 0) {
				paymentMode		= $("#paryWisePaymentMode option:selected").text();
				paymentType		= $('#paryWisePaymentMode').val();
			} else {
				paymentMode		= $("#paymentMode_CreditClearanceTable-1 option:selected").text();
				paymentType		= $('#paymentMode_CreditClearanceTable-1').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.CROSSING_HISAB_SETTLEMENT) {
			paymentMode		= $("#paymentMode_CreditClearanceTable-1 option:selected").text();
			paymentType		= $('#paymentMode_CreditClearanceTable-1').val();
		
			if(!paymentMode && !paymentType) {
				paymentMode		= $('#uniquePaymentTypeName').val();
				paymentType		= $('#uniquePaymentType').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.STBS_SETTLEMENT || moduleId == ModuleIdentifierConstant.FUND_TRANSFER || moduleId == ModuleIdentifierConstant.DDM_LORRY_HIRE_SETTLEMENT || (typeof isFtl == 'undefined' && moduleId == ModuleIdentifierConstant.BILL_PAYMENT) || moduleId == ModuleIdentifierConstant.DOOR_PICKUP_LORRY_HIRE_SETTLEMENT ||  moduleId == ModuleIdentifierConstant.CROSSING_AGENT_RECEIVE) {
			paymentMode		= $("#paymentMode option:selected").text();
			paymentType		= $('#paymentMode').val();
		} else if(moduleId == ModuleIdentifierConstant.AGENT_BILL_SETTLEMENT) {
			paymentMode		= $("#paymentModeForAll option:selected").text();
			paymentType		= $('#paymentModeForAll').val();
		} else if(moduleId == ModuleIdentifierConstant.STBS_BILL_SETTLEMENT) {
			selectize 		= $('#paymentModeId').get(0).selectize;
			current 		= selectize.getValue(); 
			option 			= selectize.options[ current ];
			paymentMode		= option.paymentTypeName;
			paymentType		= $('#paymentModeId').val();
		} else if(moduleId == ModuleIdentifierConstant.BLHPV) {
			paymentMode		= $("#paymentType option:selected").text();
			paymentType		= $('#paymentType').val();
			
			if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_PART_PAYMENT_ID) {
				paymentMode	= $("#partPaymentType option:selected").text();
				paymentType	= $('#partPaymentType').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.DDM_SETTLEMENT || moduleId == ModuleIdentifierConstant.RECEIVE_AND_DELIVERY || moduleId == ModuleIdentifierConstant.HAMALI_SETTLEMENT) {
			paymentMode		= $("#deliveryPaymentType_0 option:selected").text();
			paymentType		= $('#deliveryPaymentType_0').val();
		}  else if(typeof isFtl !== 'undefined' && isFtl && moduleId == ModuleIdentifierConstant.BILL_PAYMENT) {
			selectize 		= $('#paymentTypeBill').get(0).selectize;
			current 		= selectize.getValue(); 
			option 			= selectize.options[ current ];
			paymentMode		= option.paymentTypeName;
			paymentType		= $('#paymentTypeBill').val();
		} else if(typeof isFtl !== 'undefined' && isFtl && moduleId == ModuleIdentifierConstant.BOOKING) {
			selectize 		= $('#paymentTypePaidLr').get(0).selectize;
			current 		= selectize.getValue(); 
			option 			= selectize.options[ current ];
			paymentMode		= option.paymentTypeName;
			paymentType		= $('#paymentTypePaidLr').val();
		} else if(moduleId == ModuleIdentifierConstant.PREPAID_AMT_PAYMENT) {
			selectize 		= $('#prepaidPaymentType').get(0).selectize;
			current 		= selectize.getValue(); 
			option 			= selectize.options[ current ];
			paymentMode		= option.paymentTypeName;
			paymentType		= $('#prepaidPaymentType').val();
		} else if(moduleId == ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT) {
			if($('#paymentModeForAll').val() > 0) {
				paymentMode		= $("#paymentModeForAll option:selected").text();
				paymentType		= $('#paymentModeForAll').val();
			} else {
				paymentMode		= $("#paymentMode_CreditClearanceTable-1 option:selected").text();
				paymentType		= $('#paymentMode_CreditClearanceTable-1').val();
			}
		} else {
			paymentMode		= $("#paymentType option:selected").text();
			paymentType		= $('#paymentType').val();

			if(paymentMode == '') {
				selectize 		= $('#paymentType').get(0).selectize;
				current 		= selectize.getValue(); 
				option 			= selectize.options[ current ];
				paymentMode		= option.paymentTypeName;
			}
		}
	
	if(typeof isFtl !== 'undefined' && isFtl) {
		$('.moduleWiseName').removeClass('hide');
		
		if(moduleId == ModuleIdentifierConstant.LHPV) {
			if(paymentMode == '' && $('#paymentType').get(0).selectize != undefined) {
				selectize 		= $('#paymentType').get(0).selectize;
				current 		= selectize.getValue(); 
				option 			= selectize.options[ current ];
				paymentMode		= option.paymentTypeName;
				
				if(paymentType == '' || typeof paymentType == 'undefined')
					paymentType		= $('#paymentType').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.BILL_PAYMENT) {
			if(paymentMode == '' && $('#paymentTypeBill').get(0).selectize != undefined) {
				selectize 		= $('#paymentTypeBill').get(0).selectize;
				current 		= selectize.getValue(); 
				option 			= selectize.options[ current ];
				paymentMode		= option.paymentTypeName;
				
				if(paymentType == '' || typeof paymentType == 'undefined')
					paymentType		= $('#paymentTypeBill').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.BOOKING) {
			if(paymentMode == '' && $('#paymentTypePaidLr').get(0).selectize != undefined) {
				selectize 		= $('#paymentTypePaidLr').get(0).selectize;
				current 		= selectize.getValue(); 
				option 			= selectize.options[ current ];
				paymentMode		= option.paymentTypeName;
				
				if(paymentType == '' || typeof paymentType == 'undefined')
					paymentType		= $('#paymentTypePaidLr').val();
			}
		} else if(moduleId == ModuleIdentifierConstant.PREPAID_AMT_PAYMENT) {
			if(paymentMode == '' && $('#prepaidPaymentType').get(0).selectize != undefined) {
				selectize 		= $('#prepaidPaymentType').get(0).selectize;
				current 		= selectize.getValue(); 
				option 			= selectize.options[ current ];
				paymentMode		= option.paymentTypeName;
				
				if(paymentType == '' || typeof paymentType == 'undefined')
					paymentType		= $('#prepaidPaymentType').val();
			}
		}
	} else if(paymentMode == '' && $('#paymentType').get(0) != undefined && $('#paymentType').get(0).selectize != undefined) {
		selectize 		= $('#paymentType').get(0).selectize;
		current 		= selectize.getValue(); 
		option 			= selectize.options[ current ];
		paymentMode		= option.paymentTypeName;
			
		if(paymentType == undefined || paymentType =='undefined')
			paymentType		= $('#paymentType').val();
	}

	if($('#accountNo').val() > 0 && $('#toaccountNo').val() > 0) {
		if ($('#accountNo').val() == $('#toaccountNo').val()) {
	  		 	showMessage('error', 'Please select different account numbers to transfer. !');
	  		 	$('#toaccountNo').focus();
	   		return false; 
		}
	}	
	
	if(!validatePaymentDetails(paymentType))
		return false;

	if(confirm("Are you sure you want to do payment in " + paymentMode)) {
		let wayBillNumber	= null;
		let bankName		= null;
		let bankNameId		= 0;
		let payerName		= null;
		let payeeName		= null;
		let accountNoId		= 0;
		let toaccountNoId	= 0;
		let tobankName		= null;
		let tobankNameId	= 0;

		if($('#accountNo_primary_key').val() != "")
			accountNoId		= $('#accountNo_primary_key').val()

		if($('#toaccountNo_primary_key').val() != "")
			toaccountNoId	= $('#toaccountNo_primary_key').val()

		let chequeNo		= null;
		let mobileNo		= '0000000000';
		let chequeDate		= null;
		let referenceNo		= null;
		let cardNo			= null;
		let accountNo		= null;
		let toaccountNo		= null;
		let amount			= 0;
		let chequeGivenTo	= null;
		let chequeGivenBy	= null;
		let upiId			= null;
		let creditSlipNo	= null;
		let creditAccountNo	= null;
		let creditAccountId	= 0;
		let txnDate		= null;
		let txnTime		= null;
		
		if($('#uniqueWayBillNumber').val() != '') wayBillNumber	= $('#uniqueWayBillNumber').val();
		if($('#payerName').val() != '') 	payerName		= $('#payerName').val();
		if($('#payeeName').val() != '') 	payeeName		= $('#payeeName').val();
		if($('#bankName').val() != '') 		bankName		= $('#bankName').val();
		if($('#tobankName').val() != '') 	tobankName		= $('#tobankName').val();
		if($('#bankName_primary_key').val() != undefined  && $('#bankName_primary_key').val() != '') bankNameId	= $('#bankName_primary_key').val();
		if($('#tobankName_primary_key').val() != '') tobankNameId		= $('#tobankName_primary_key').val();
		if($('#chequeNo').val() != '') 		chequeNo		= $('#chequeNo').val();
		if($('#chequeDate').val() != '') 	chequeDate		= $('#chequeDate').val();
		if($('#chequeAmount').val() != '') 	amount			= $('#chequeAmount').val();
		if($('#accountNo').val() != '') 	accountNo		= $('#accountNo').val();
		if($('#toaccountNo').val() != '') 	toaccountNo		= $('#toaccountNo').val();
		if($('#cardNo').val() != '') 		cardNo			= $('#cardNo').val();	
		if($('#referenceNumber').val() != '') referenceNo		= $('#referenceNumber').val(); 
		if($('#mobileNumber').val() != '') 	mobileNo		= $('#mobileNumber').val();
		if($('#chequeGivenTo').val() != '') chequeGivenTo	= $('#chequeGivenTo').val();
		if($('#chequeGivenBy').val() != '') chequeGivenBy	= $('#chequeGivenBy').val();
		if($('#upiId').val() != '') 		upiId	= $('#upiId').val();
			
		if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID && $('#creditDate').val() != '')        
			chequeDate			= $('#creditDate').val();
		
		if($('#creditSlipNo').val() != '') 	creditSlipNo		= $('#creditSlipNo').val();
		if($('#creditAccountNo').val() != '') 	creditAccountNo	= $('#creditAccountNo').val();
		if($('#creditAccountNo_primary_key').val() != '') 	creditAccountId	= $('#creditAccountNo_primary_key').val();
		
		if(validatePhonePayTransaction && paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && (moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR || moduleId == PARTIAL_DELIVERY)) {
			if($('#accountNoWithQrId').val() != "")
				accountNoId		= $('#accountNoWithQrId').val();
		
			if($('#accountNoWithQr').val() != "")
				accountNo 		= $('#accountNoWithQr').val();
				
			if($('#txnDateEle').val() != '') 	
				txnDate		= $('#txnDateEle').val();
				
			if($('#txnTimeEle').val() != '') 	
				txnTime		= $('#txnTimeEle').val();
		}

		if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
			$('#chequeDate').val(chequeDate);
			$('#chequeNo').val(chequeNo);
			$('#bankName').val(bankName);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
			$('#chequeNo').val(cardNo);
			$('#bankName').val(bankName);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
			$('#chequeNo').val(referenceNo);

			if(showTxnDateInPaymentMode || typeof showTxnDateInImps !== 'undefined' && showTxnDateInImps != undefined && paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID && (showTxnDateInImps == true || showTxnDateInImps == 'true'))
				$('#chequeDate').val(chequeDate);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
			$('#chequeDate').val(chequeDate);
			$('#bankName').val(bankName);
		}

		let bindPaymentData		= paymentUniqueValue + '_' + wayBillNumber + '_' + wayBillId + '_' + bankNameId + '_' + chequeNo + '_' + chequeDate + '_' + amount + '_' + payerName + '_' + accountNo + '_' + cardNo + '_' + referenceNo + '_' + mobileNo + '_' + accountNoId + '_' + bankName + '_' + payeeName + '_' + paymentType + '_' + chequeGivenTo + '_' + chequeGivenBy + '_' + upiId + '_' + creditSlipNo + '_' + creditAccountNo + "_" + creditAccountId + "_" + txnDate + '_' + txnTime; 

		let moduleWiseName	= null;
		
		if(typeof isFtl !== 'undefined' && isFtl) {
			$('.moduleWiseName').removeClass('hide');
			
			if(moduleId == ModuleIdentifierConstant.LHPV) {
				moduleWiseName	= 'LHPV';
				wayBillId		= "LHPV";
				$('#lhpvPaymentDetails').val(bindPaymentData);
			} else if(moduleId == ModuleIdentifierConstant.BILL_PAYMENT) {
				moduleWiseName	= 'Bill Payment';
				wayBillId		= "BillPayment";
				$('#billPaymentDetails').val(bindPaymentData);
			} else if(moduleId == ModuleIdentifierConstant.BOOKING) {
				moduleWiseName	= 'Booking';
				wayBillId		= "Booking";
				$('#paidLrPaymentDetails').val(bindPaymentData);
			}
		}
		
		if(moduleId == ModuleIdentifierConstant.CREDIT_DEBIT_NOTE)
			$('#prepaidPaymentValCreditDebit').val(bindPaymentData);
			
		$('<tr id="paymentDataTr_' + wayBillId + '">').appendTo('#storedPaymentDetails');
		
		let hiddenInput	= '<input type="checkbox" id="paymentCheckBox" name="paymentCheckBox" value="' + bindPaymentData + '" checked="checked" style="display: none"/>';

		if(moduleWiseName != null)
			$('<td class="moduleWiseName"><b>' + moduleWiseName + '</b>' + hiddenInput + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		else if(wayBillNumber != null && wayBillNumber != '' && wayBillNumber != undefined)
			$('<td class="moduleWiseNo"><b>' + wayBillNumber + '</b>' + hiddenInput + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		else if(moduleId == ModuleIdentifierConstant.DOOR_PICKUP_LORRY_HIRE_SETTLEMENT || moduleId == ModuleIdentifierConstant.DDM_LORRY_HIRE_SETTLEMENT || moduleId == ModuleIdentifierConstant.AGENT_BILL_SETTLEMENT
		|| moduleId == ModuleIdentifierConstant.CROSSING_HISAB_SETTLEMENT || moduleId == ModuleIdentifierConstant.CROSSING_AGENT_RECEIVE)
			$('<td>' + hiddenInput + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		else
			$('<td class="hide">' + hiddenInput + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		
		$('<td>' + paymentMode + '</td>').appendTo('#paymentDataTr_' + wayBillId);

		if(chequeDate == null) chequeDate		= '';
		if(chequeNo == null) chequeNo		= '';
		if(accountNo == null) accountNo		= '';
		if(payerName == null) payerName	= '';
		if(payeeName == null) payeeName = '';
		if(bankName == null) bankName		= '';
		if(chequeGivenTo == null) chequeGivenTo		= '';
		if(chequeGivenBy == null) chequeGivenBy		= '';
		if(upiId == null) upiId		= '';

		$('<td class = "bankNameCol">' + bankName + '</td>').appendTo('#paymentDataTr_' + wayBillId);

		if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
			$('<td>' + chequeNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			$('<td>' + chequeDate + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
			$('<td>' + referenceNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);

			if(chequeDate)
				$('<td>' + chequeDate + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			else
				$('<td></td>').appendTo('#paymentDataTr_' + wayBillId);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
			$('<td>' + cardNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			$('<td></td>').appendTo('#paymentDataTr_' + wayBillId);
		} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_POS_ID ||paymentType == PaymentTypeConstant.PAYMENT_TYPE_TRANSFER_ID) {
			$('<td>' + referenceNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			$('<td></td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		$('<td id="addedPaymentTxnAmount" style="display: none">' + amount + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		$('<td>' + accountNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID) {
			$("#payerNameCol").removeClass("hide");//put this inside in each condition
			$('<td>' + payerName + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID) {
			$("#payeeNameCol").removeClass("hide");//put this inside in each condition
			$('<td>' + payeeName + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID) {
			$("#chequeGivenByCol").removeClass("hide");//put this inside in each condition
			$('<td>' + chequeGivenBy + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID) {
			$("#chequeGivenToCol").removeClass("hide");//put this inside in each condition
			$('<td>' + chequeGivenTo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		$('<td class = "mobileNumberCol">' + mobileNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		$('<td>' + upiId + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		
		if (paymentType == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID) {
			$(".creditCol").removeClass("hide");
			$('<td>' + chequeDate + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			$('<td>' + creditSlipNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
			$('<td>' + creditAccountNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
		}

		$('</tr>').appendTo('#storedPaymentDetails');

		if(moduleId == ModuleIdentifierConstant.FUND_TRANSFER && toBankAccountAutocomplete != undefined
			&& typeof transferType !== 'undefined' && transferType != undefined && transferType == 3) {
					wayBillId		= 1;

					if(chequeDate == '') chequeDate		= null;
					if(chequeNo == '') chequeNo		= null;
					if(toaccountNo == '') toaccountNo		= null;
					if(tobankName == '') tobankName		= null;
					if(chequeGivenTo == '') chequeGivenTo		= null;
					if(chequeGivenBy == '') chequeGivenBy		= null;
					if(upiId == '') upiId		= null;

					bindPaymentData		= paymentUniqueValue + '_' + wayBillNumber + '_' + wayBillId + '_' + tobankNameId + '_' + chequeNo + '_' + chequeDate + '_' + amount + '_' + payerName + '_' + toaccountNo + '_' + cardNo + '_' + referenceNo + '_' + mobileNo + '_' + toaccountNoId + '_' + tobankName + '_' + payeeName + '_' + paymentType + '_' + chequeGivenTo + '_' + chequeGivenBy + '_' + upiId;

					$('<tr id="paymentDataTr_' + wayBillId + '">').appendTo('#storedPaymentDetails');

					if(wayBillNumber != null && wayBillNumber != '' && wayBillNumber != undefined)
						$('<td class="moduleWiseNo"><b>' + wayBillNumber + '</b><input type="checkbox" id="topaymentCheckBox" name="topaymentCheckBox" value="' + bindPaymentData + '" checked="checked" style="display: none"/></td>').appendTo('#paymentDataTr_' + wayBillId);
					else
						$('<td class="hide"><input type="checkbox" id="topaymentCheckBox" name="topaymentCheckBox" value="' + bindPaymentData + '" checked="checked" style="display: none"/></td>').appendTo('#paymentDataTr_' + wayBillId);

					$('<td>' + paymentMode + '</td>').appendTo('#paymentDataTr_' + wayBillId);

					if(chequeDate == null) chequeDate			= '';
					if(chequeNo == null) chequeNo				= '';
					if(toaccountNo == null) toaccountNo			= '';
					if(tobankName == null) tobankName			= '';
					if(chequeGivenTo == null) chequeGivenTo		= '';
					if(chequeGivenBy == null) chequeGivenBy		= '';
					if(upiId == null) upiId						= '';

					$('<td>' + tobankName + '</td>').appendTo('#paymentDataTr_' + wayBillId);

					if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
						$('<td>' + chequeNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
						$('<td>' + chequeDate + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID) {
						$('<td>' + referenceNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);

						if(chequeDate)
							$('<td>' + chequeDate + '</td>').appendTo('#paymentDataTr_' + wayBillId);
						else
							$('<td></td>').appendTo('#paymentDataTr_' + wayBillId);
					} else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID) {
						$('<td>' + cardNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
						$('<td></td>').appendTo('#paymentDataTr_' + wayBillId);
					}

					$('<td id="addedPaymentTxnAmount" style="display: none">' + amount + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					$('<td>' + toaccountNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);

					if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID) {
						$("#payerNameCol").removeClass("hide");//put this inside in each condition
						$('<td>' + payerName + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					}

					if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID) {
						$("#payeeNameCol").removeClass("hide");//put this inside in each condition
						$('<td>' + payeeName + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					}

					if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID) {
						$("#chequeGivenByCol").removeClass("hide");//put this inside in each condition
						$('<td>' + chequeGivenBy + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					}

					if(typeof incomeExpenseModuleId !== 'undefined' && incomeExpenseModuleId == ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID) {
						$("#chequeGivenToCol").removeClass("hide");//put this inside in each condition
						$('<td>' + chequeGivenTo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					}

					$('<td>' + mobileNo + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					$('<td>' + upiId + '</td>').appendTo('#paymentDataTr_' + wayBillId);
					$('</tr>').appendTo('#storedPaymentDetails');
		}
		
		if(moduleId == ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT) {
			let paymentStatus	= $('#paymentStatus_CreditClearanceTable-1').val();
			paymentMode		= $("#paymentMode_CreditClearanceTable-1").val();

			if($('#typeOfSelection').val() == PaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && paymentStatus == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('LR No');
			}
		} else if(moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT) {
			let paymentStatus	= $('#paymentStatus_CreditClearanceTable-1').val();
			paymentMode		= $("#paymentMode_CreditClearanceTable-1").val();

			if($('#typeOfSelection').val() == CreditPaymentTypeConstants.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR && paymentStatus == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('LR No');
			}
		} else if(moduleId == ModuleIdentifierConstant.AGENT_BILL_SETTLEMENT) {
			$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
			$('#moduleWiseNo').html('LR No');
		} else if(moduleId == ModuleIdentifierConstant.CROSSING_HISAB_SETTLEMENT) {
			$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
			$('#moduleWiseNo').html('Bill No');
		} else if(moduleId == ModuleIdentifierConstant.DDM_SETTLEMENT || moduleId == ModuleIdentifierConstant.RECEIVE_AND_DELIVERY || moduleId == ModuleIdentifierConstant.CHEQUE_BOUNCE_SETTLEMENT || moduleId == ModuleIdentifierConstant.HAMALI_SETTLEMENT || moduleId == ModuleIdentifierConstant.CROSSING_AGENT_RECEIVE) {
			if($('#deliveryPaymentType_0').val() > 0) {
				if(typeof differentPaymentInMultiplePayment !== 'undefined' && differentPaymentInMultiplePayment != undefined 
						&& (differentPaymentInMultiplePayment == 'true' || differentPaymentInMultiplePayment == true)) {
					$("#moduleWiseNo").removeClass("hide");

					if(moduleId == ModuleIdentifierConstant.HAMALI_SETTLEMENT)
						$('#moduleWiseNo').html('No.');
					else
						$('#moduleWiseNo').html('LR No');
				} else {
					$("#moduleWiseNo").addClass("hide");
				}
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('LR No');
			}
		} else if(moduleId == ModuleIdentifierConstant.BLHPV_CREDIT_PAYMENT) {
			paymentMode		= $("#paymentType").val();

			if(paymentMode > 0) {
				$("#moduleWiseNo").addClass("hide");
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('BLHPV No');
			}
		} else if(moduleId == ModuleIdentifierConstant.STBS_SETTLEMENT) {
			if($("#selectAllforPaymentMode").val() == 'true')
				$("#moduleWiseNo").addClass("hide");
			
			if($("#selectAllforPaymentMode").val() == 'false') {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('LR No');
			}
		} else if(moduleId == ModuleIdentifierConstant.DDM_LORRY_HIRE_SETTLEMENT) {
			$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
			$('#moduleWiseNo').html('DDM NO');
		} else if(moduleId == ModuleIdentifierConstant.DOOR_PICKUP_LORRY_HIRE_SETTLEMENT) {
			$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
			$('#moduleWiseNo').html('Door Pickup No');
		} else if(typeof isFtl == 'undefined' && moduleId == ModuleIdentifierConstant.BILL_PAYMENT) {
			if($('#paymentMode').val() > 0) {
				$("#moduleWiseNo").addClass("hide");
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('Bill No');
			}
		} else if(typeof isFtl == 'undefined' && moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR) {
			if($('#deliveryPaymentType').val() > 0) {
				$("#moduleWiseNo").addClass("hide");
			} else {
				$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
				$('#moduleWiseNo').html('LR No');
			}
		} else if(moduleId == ModuleIdentifierConstant.PENDING_LS_FOR_PAYMENT) {
			$("#moduleWiseNo").removeClass("hide");//put this inside in each condition
			$('#moduleWiseNo').html('LS NO');
		} 
		
		if(paymentMode == PaymentTypeConstant.PAYMENT_TYPE_TRANSFER_ID || paymentMode == PaymentTypeConstant.PAYMENT_TYPE_POS_ID) {
			$('.bankNameCol').addClass('hide');
			$('.chequeDateCol').addClass('hide');
			$('.mobileNumberCol').addClass('hide');
			$('.upidCol').addClass('hide');
			$('#chequeNumberCol').html('Party A/c / Reference No');
		}
		
		isPaidByDynamicQRCode = false;
		
		paymentUniqueValue++;

		hideBTModel();

		bindFocusOnAddPayment();
	} else {
		bindFocusOnCancel();
		hideBTModel();
	}
}

function openAddedPaymentTypeModel() {
	if(typeof isNewBS !== 'undefined' && isNewBS != undefined && isNewBS == true) {
		modal1 		= new bootstrap.Modal(document.getElementById('addedPaymentTypeModal'));
		modal1.show();
	
		if(modal1 != null) modal1.hide();
	} else {
		$("#addedPaymentTypeModal").modal({
			backdrop: 'static',
			keyboard: false
		});
	}
}

function bindFocusOnAddPayment() {
	if(moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == PARTIAL_DELIVERY) {
		setTimeout(function() {
			$('#deliveredToName').focus();
		}, 500);
	} else if(moduleId == ModuleIdentifierConstant.BOOKING) {
		if($('#podRequiredStatus').exists())
			$('#podRequiredStatus').focus();
		else if(accountGroupId != undefined && accountGroupId == 556 && $('#charge2').exists()) {
			setTimeout(function() {
				$('#charge2').focus();
			}, 100);
		} else if(accountGroupId != undefined && accountGroupId == 50 && $('#charge4').exists()) {
			setTimeout(function() {
				$('#charge4').focus();
			}, 100);
		} else if(accountGroupId != undefined && accountGroupId == 3 && $('#save').exists()) {
			setTimeout(function() {
				$('#save').focus();
			}, 100);
		} else if(accountGroupId != undefined && accountGroupId == 363 && $('#charge24').exists()) {
			setTimeout(function() {
				$('#charge24').focus();
			}, 100);
		}
	}
}

function bindFocusOnCancel() {
	if(moduleId == ModuleIdentifierConstant.GENERATE_CR || moduleId == PARTIAL_DELIVERY) {
		$('#deliveryPaymentType').focus();
	} else if(moduleId == ModuleIdentifierConstant.BOOKING 
			|| moduleId == ModuleIdentifierConstant.BLHPV
			|| moduleId == ModuleIdentifierConstant.BRANCH_INCOME
			|| moduleId == ModuleIdentifierConstant.BRANCH_EXPENSE
			|| moduleId == ModuleIdentifierConstant.CONSOLIDATED_BLHPV) {
		$('#paymentType').focus();
	}
}

function isValidPaymentMode(paymentMode) {
	return paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_TRANSFER_ID
			|| paymentMode == PaymentTypeConstant.PAYMENT_TYPE_POS_ID;
}

function dateWithDateFormatForCalender(dateObject, identifier) {
	let d = new Date(dateObject);

	if(d == 'Invalid Date' || d == 'NaN') {
		let t = dateObject.split(/[- :]/);
		d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
	}

	let day 	= d.getDate();
	let month 	= d.getMonth() + 1;
	let year 	= d.getFullYear();

	if (day < 10)
		day = "0" + day;

	if (month < 10)
		month = "0" + month;

	let date = day + identifier + month + identifier + year;

	return date;
}

function cardNumberValidation(evt){
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		let keynum = null;
		
		if(window.event) // IE
			keynum = evt.keyCode;
		else if(evt.which) // Netscape/Firefox/Opera
			keynum = evt.which;
		
		if(keynum!=null){
			if(keynum == 8 || keynum == 32)
				return true;
			else if(keynum == 45 || keynum == 47)
				return true;
			else if (keynum < 48 || keynum > 57 )
				return false;
		}
		
		return true;
	}
}

function hideChequeOrTxnNumTextField() {
	$("#referenceNumberRow").addClass("hide");
	$('#chequeNo').attr('placeholder','Cheque/UTR Number');
	
	$('#chequeNumberLebel').html('Cheque/UTR Number');
	$('.chequeNumberCol').html('Cheque No/Card No/UTR No');
}

function hideUPITextField() {
	$("#UpiIdRow").addClass("hide");
	$("#referenceNumberRow").removeClass("hide");
	$('#referenceNumber').attr('placeholder','Party A/c / UTR No.');
	$('#referenceNumberLebel').html('Party A/c / UTR No');
	$('.chequeNumberCol').html('Cheque No/Card No/UTR No');
}

function showStaticPaymentFeilds(){
	$("#accountNoRow").removeClass("hide");
	$('#accountNoWithQrDiv').removeClass('hide');
	$('#referenceNumberRow').removeClass('hide');

	if(allowTransactionDateAndTimePhonePe) {
		$('#txnDateRow').removeClass('hide');
		$('#txnTimeRow').removeClass('hide');
	
		$('#paymentTypeModal').on('shown.bs.modal', function () {
			$('#txnTimeEle').clockpicker({
				autoclose: true,
				placement: 'bottom',
				align: 'left',
				autoclose: true,
				twelvehour: false,
				container: '#paymentTypeModal',
				donetext: 'Done'
			});
	 	});
	}
	
	hideDynamicPaymentRow();
}

function hideDynamicPaymentRow() {
	$('#dynamicPaymentButtonsRow').addClass('hide');
	$('#txnDetailsBtn').removeClass('hide');
}

function setPumpNameAutocomplete() {
	let pumpNameAutoComplete = new Object();
	pumpNameAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getPumpNameAutocomplete.do';
	pumpNameAutoComplete.primary_key = 'pumpNameMasterId';
	pumpNameAutoComplete.field = 'name';
	
	$("#creditAccountNo").autocompleteCustom(pumpNameAutoComplete);
}

function generateDynamicQR() {
	$('#referenceNumberRow').addClass('hide');
	$('#txnDetailsBtn').addClass('hide');
	$('#dynamicPaymentButtonsRow').addClass('hide');

	let tdsAmount = Number($('#tdsAmount').val()) || 0;

	if (typeof payableAmount !== 'undefined' && payableAmount != null) {
		if (moduleId == ModuleIdentifierConstant.BOOKING)
			$('#payableAmount').val($('#grandTotal').val()-tdsAmount);
		else if (moduleId == ModuleIdentifierConstant.GENERATE_CR)
			$('#payableAmount').val($('#billAmount').val()-tdsAmount);
		else if (moduleId == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR)
			$('#payableAmount').val(multiLRDeliveryTotalAmount-multiLRDeliveryTdsTotalAmount);
	}

	generateDynamicQRCode();
}