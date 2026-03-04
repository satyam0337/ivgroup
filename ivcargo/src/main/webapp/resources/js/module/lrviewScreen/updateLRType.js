/**
 * 
 */
var jsondata					= null;
var applyRateWithUpdateLRType	= false;
var CorporateAccountConstant	= null;
var ConsignorDetails			= null;
var PaymentTypeConstant			= null;
var moduleId					= null;
var incomeExpenseModuleId		= null;
var ModuleIdentifierConstant	= null;
var groupConfiguration			= null;
var paymentTypeSelectionAllowed = false;
var bankPaymentOperationRequired= false;
var partyType					= 0;
var paymentTypeArr				= null;
var updateLrTypeConfiguration	= null;
var EditLRRateConfiguration		= null;
var wayBillTypeId				= 0;
var wayBillTypes				= null;
var shortCreditConfigLimit			= null;
var bookingTotal					= 0;
var doneTheStuff 					= false;
var groupConfig						= null;
var GeneralConfiguration			= null;

function loadPageToUpdateLRType(wayBillId) {

	var jsonObject		= new Object();

	jsonObject.waybillId	= wayBillId;
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/updateLrTypeWS/loadLRTypeUpdateData.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			jsondata	= data;

			hideLayer();

			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

				setTimeout(() => {
					window.close();
				}, 1500);
			}

			EditLRRateConfiguration				= jsondata.applyRateConfig;
			applyRateWithUpdateLRType			= EditLRRateConfiguration.ApplyRate;
			updateLrTypeConfiguration			= jsondata.UpdateLrTypeConfiguration;
			CorporateAccountConstant			= jsondata.CorporateAccountConstant;
			ConsignorDetails					= jsondata.CustomerDetails;
			PaymentTypeConstant					= jsondata.PaymentTypeConstant;
			moduleId							= jsondata.moduleId;
			incomeExpenseModuleId				= jsondata.incomeExpenseModuleId;
			ModuleIdentifierConstant			= jsondata.ModuleIdentifierConstant;
			groupConfiguration					= jsondata.GroupConfiguration;
			paymentTypeSelectionAllowed			= jsondata.paymentTypeSelectionAllowed;
			paymentTypeArr						= jsondata.paymentTypeArr;
			wayBillTypeId						= jsondata.wayBillTypeId;
			wayBillTypes						= jsondata.wayBillTypes;
			shortCreditConfigLimit				= jsondata.shortCreditConfigLimit;
			groupConfig							= jsondata.GroupConfiguration;
			GeneralConfiguration				= jsondata.GeneralConfiguration
			bankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
			
			if(shortCreditConfigLimit != null && shortCreditConfigLimit != undefined){
				if(shortCreditConfigLimit.creditType == 1)
					showMessage('info', " Short Credit Limit Available " + shortCreditConfigLimit.creditLimit + "  !");
				else if (shortCreditConfigLimit.creditType == 2)
					showMessage('info', " Short Credit Balance Available " + shortCreditConfigLimit.balance + "  !");
			}

			bookingTotal						= jsondata.bookingTotal;

			if(paymentTypeSelectionAllowed) {
				$('#chequeDate').val(date(new Date(),"-"));
				$('#chequeDate').datepicker({
					dateFormat: 'dd-mm-yy'
				});
			}

			if(applyRateWithUpdateLRType) {
				$("#partyWiseRateDiv").load( "/ivcargo/html/module/waybill/editCustomer/partyWiseRatePanel.html", function() {
				});
			}

			if(paymentTypeSelectionAllowed) {
				if (bankPaymentOperationRequired) {
					$("#bankPaymentOperationPanel").load( "/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					});
				} else
					$( "#bankPaymentOperationPanel").remove();
			}

			setWaybillType();
			showHideCorporateAccount();
			setBillingPartyNameAutocomplete();
			setConsignorNameAutocomplete();

			if(updateLrTypeConfiguration) {
				showHideBillingBranch();
				setBillingBranchNameAutocomplete();
			}
			
			if(paymentTypeSelectionAllowed) {
				showHideLrType();

				if(!jQuery.isEmptyObject(paymentTypeArr)) {
					for(var i = 0; i < paymentTypeArr.length; i++) {
						if(paymentTypeArr[i] != null)
							$('#paymentType').append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
					}
				}
			}

			document.getElementById('WBType').focus();
			$('#lrNumber').html('<b>LR No :- ' + jsondata.wayBillNumber + '</b>');

			if(ConsignorDetails != undefined){
				$('#consignorPartyId').val(ConsignorDetails.corporateAccountId);
				$('#consignorParty').val(ConsignorDetails.customerDetailsName);
				$('#consignorId').val(ConsignorDetails.customerDetailsId);
			}
			
			$('#WBType').change(function() {
				var wbTypeId = document.getElementById('WBType');
				
				if(wbTypeId.value == WAYBILL_TYPE_TO_PAY && groupConfig.applyPartyCommissionFromPartyMaster && EditLRRateConfiguration.checkApplyRateAutomatically)
					getRateToApplyOnUpdateLRType();
				
			});
			
			hideLayer();
		}
	});
}

function setWaybillType() {
	var isManual				= false;
	var deliveryTo				= jsondata.deliveryTo;
	var bookingCrossingAgentId	= jsondata.bookingCrossingAgentId;
	var accountGroupId			= jsondata.accountGroupId;
	
	if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
		if(accountGroupId == ACCOUNT_GROUP_ID_SNGT || accountGroupId == ACCOUNT_GROUP_ID_KATIRA)
			isManual			= jsondata.isManual;
		
		if(!isManual) {
			for(var i = 0; i < wayBillTypes.length; i++) {
				if(wayBillTypes[i] == CONFIG_KEY_WAYBILLTYPE_PAID && deliveryTo != DIRECT_DELIVERY_DIRECT_VASULI_ID)
					$('#WBType').append('<option value="'+CONFIG_KEY_WAYBILLTYPE_PAID+'" id="'+CONFIG_KEY_WAYBILLTYPE_PAID+'">PAID</option>');
			}
		}
		
		if(bookingCrossingAgentId <= 0) {
			for(var i = 0; i < wayBillTypes.length; i++) {
				if(wayBillTypes[i] == CONFIG_KEY_WAYBILLTYPE_CREDITOR)
					$('#WBType').append('<option value="'+CONFIG_KEY_WAYBILLTYPE_CREDITOR+'" id="'+CONFIG_KEY_WAYBILLTYPE_CREDITOR+'">TBB</option>');
			}
		}
		
		for(var i = 0; i < wayBillTypes.length; i++) {
			if(wayBillTypes[i] == CONFIG_KEY_WAYBILLTYPE_FOC && updateLrTypeConfiguration.focLROptionAllowedInEditLrTypeSelection)
				$('#WBType').append('<option value="'+CONFIG_KEY_WAYBILLTYPE_FOC+'" id="'+CONFIG_KEY_WAYBILLTYPE_FOC+'">FOC</option>');
		}
	} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
		for(var i = 0; i < wayBillTypes.length; i++) {
			if(wayBillTypes[i] == CONFIG_KEY_WAYBILLTYPE_TO_PAY)
				$('#WBType').append('<option value="'+CONFIG_KEY_WAYBILLTYPE_TO_PAY+'" id="'+CONFIG_KEY_WAYBILLTYPE_TO_PAY+'">ToPay</option>');
			
			if(wayBillTypes[i] == CONFIG_KEY_WAYBILLTYPE_FOC && updateLrTypeConfiguration.focLROptionAllowedInEditLrTypeSelection)
				$('#WBType').append('<option value="'+CONFIG_KEY_WAYBILLTYPE_FOC+'" id="'+CONFIG_KEY_WAYBILLTYPE_FOC+'">FOC</option>');
		}
	}
}

function setBillingPartyNameAutocomplete() {
	$("#billingParty").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing="+CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				var name		= ui.item.label;
				$('#billingPartyId').val(ui.item.id);

				if(name.indexOf("(") >= 0)
					$('#billingParty').val(name.substring(0, name.indexOf('(')));
			}
			
			if(EditLRRateConfiguration.checkApplyRateAutomatically)
				getRateToApplyOnUpdateLRType();
			
			if(groupConfiguration.showPartyIsBlackListedParty)
				getCreditorDetails(ui.item.id)
		},response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setBillingBranchNameAutocomplete() {
    $("#billingBranch").autocomplete({
        source: function (request, response) {
 			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteByAccountGroup.do?term='+request.term+'&showOnlyPhysicalBranchOption=true',function (data) {
                if (typeof data.message !== 'undefined') {
                    $("#billingBranch").focus();
                    return false;
                } else {
					if (data && data.result) {
						response($.map(data.result, function(item) {
							return {
								label: item.branchName,
								value: item.branchName,
								id: item.branchId
							};
						}));
					}
                }
            });
        },
        select: function (event, ui) {
            if (ui.item.id != 0) {
                getBillingBranch(ui.item.id, ui.item.label);
            }
        },
        minLength: 2,
        delay: 10,
        autoFocus: true,
        response: function (event, ui) {
            setLogoutIfEmpty(ui);
        }
    });
}


/*
function setBillingBranchNameAutocomplete(){
	
	$("#billingBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0)
				getBillingBranch(ui.item.id, ui.item.label); // function defined in commonFunctionForCreateWayBill.js
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}
*/
function getBillingBranch(branchId,billingBranchName){
	
	$('#billingBranchId').val(branchId);
	$('#billingBranch').val(billingBranchName);
}

function setConsignorNameAutocomplete() {
	$("#consignorParty").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&responseFilter="+1,
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			var name		= ui.item.label;

			$('#consignorPartyId').val(ui.item.id);
			partyType = 1;
			
			if(name.indexOf("(") >= 0)
				$('#consignorParty').val(name.substring(0, name.indexOf('(')));
			
			if(groupConfiguration.showPartyIsBlackListedParty)
				getPartyDetails(ui.item.id);
		},response: function(event, ui) {
			//setLogoutIfEmpty(ui);
		}
	});
}

function resetBillingParty() {
	$('#billingPartyId').val(0);
}

function resetBillingBranch(){
	$('#billingBranchId').val(0);
}

function resetParty() {
	$('#consignorPartyId').val(0);
}

function isValidPaymentMode(paymentMode) {
	return paymentMode == PAYMENT_TYPE_CHEQUE_ID 
			|| paymentMode == PAYMENT_TYPE_ONLINE_RTGS_ID 
			|| paymentMode == PAYMENT_TYPE_ONLINE_NEFT_ID 
			|| paymentMode == PAYMENT_TYPE_IMPS_ID
			|| paymentMode == PAYMENT_TYPE_CREDIT_CARD_ID 
			|| paymentMode == PAYMENT_TYPE_DEBIT_CARD_ID
			|| paymentMode == PAYMENT_TYPE_PAYTM_ID;
}

function updateLRType() {
	var jsonObject		= new Object();

	if(paymentTypeSelectionAllowed) {
		if($('#WBType').val() == WAYBILL_TYPE_PAID &&  $('#paymentType').val() <= 0) {
			showMessage('info', 'Select Payment Type !');
			return false;
		}

		if(bankPaymentOperationRequired && isValidPaymentMode($('#paymentType').val()) && $('#storedPaymentDetails').html() == '') {
			showMessage('info', 'Please, Add Payment details for this LR !');
			return false;
		}
	}	
	
	if(groupConfiguration.shortCreditConfigLimitAllowed) {
		if(shortCreditConfigLimit != null) {
			if(shortCreditConfigLimit.creditType == 1) {
				if($('#WBType').val() == WAYBILL_TYPE_PAID && $('#paymentType').val() == PAYMENT_TYPE_CREDIT_ID
					&& bookingTotal > shortCreditConfigLimit.creditLimit) {
					showMessage('info', " Short Credit Amount Limit of "+ shortCreditConfigLimit.creditLimit +" Exceeded !");
					return false;
				}
			} else if(shortCreditConfigLimit.creditType == 2 && $('#WBType').val() == WAYBILL_TYPE_PAID && $('#paymentType').val() == PAYMENT_TYPE_CREDIT_ID
					&& bookingTotal > shortCreditConfigLimit.balance) {
				showMessage('info', " Short Credit Balance Limit of "+ shortCreditConfigLimit.balance +" Exceeded !");
				return false;
			}
		}
	}

	if(updateLrTypeConfiguration.billingBranchRequired
		&& $('#WBType').val() == WAYBILL_TYPE_CREDIT && $('#billingBranchId').val() <= 0) {
		showMessage('info', " Please Enter Billing Branch !");
		return false;
	}

	if($('#ApplyAutoRates').is(":checked") && freightAmount <= 0) {
		alert('Rate not found !');
		return false;
	}

	var applyAutoRates			= false;

	jsonObject.redirectTo		= $('#redirectTo').val();
	jsonObject.filter			= 2;
	jsonObject.waybillId		= $('#wayBillId').val();
	jsonObject.wayBillTypeId	= $('#WBType').val();
	jsonObject.BillingPartyId	= $('#billingPartyId').val();
	jsonObject.BillingBranchId	= $('#billingBranchId').val();
	jsonObject.consignorPartyId	= $('#consignorPartyId').val();
	jsonObject.consignorId		= $('#consignorId').val();
	jsonObject.remark			= $('#remark').val();
	jsonObject.consignorParty	= $('#consignorParty').val();
	jsonObject.wayBillNo		= jsondata.wayBillNumber;

	if(paymentTypeSelectionAllowed){
		jsonObject.paymentType		= $('#paymentType').val();
		jsonObject.chequeNumber		= $('#chequeNo').val();
		jsonObject.chequeDate		= $('#chequeDate').val();
		jsonObject.bankName			= $('#bankName').val();

		if($('#grandTotal').val() > 0)
			jsonObject.grandTotal		= $('#grandTotal').val();
		else
			jsonObject.grandTotal		= bookingTotal;

		jsonObject.paymentValues	= $('#paymentCheckBox').val();
	}

	if($('#ApplyAutoRates').is(":checked")) {
		applyAutoRates				= true;

		jsonObject.STPaidBy				= $('#STPaidBy').val();
		jsonObject.bookingGrandTotal	= $('#grandTotal').val();
		jsonObject.serviceTaxAmount		= $('#wayBillTaxes_1').val();
		jsonObject.weightFreightRate	= weightFreightRate;
		jsonObject.rateApplyOnChargeType= rateApplyOnChargeType;

		var chargesColl = new Object(); 

		for ( var i = 0; i < bookingCharges.length; i++) {
			chargesColl["charge_" + bookingCharges[i].chargeTypeMasterId] = $('#wayBillCharge_' + bookingCharges[i].chargeTypeMasterId).val();
		}

		jsonObject.lrBookingCharges 	= JSON.stringify(chargesColl);
		jsonObject.qtyTypeWiseRateHM 	= qtyTypeWiseRateHM;
	}

	jsonObject.applyAutoRates		= applyAutoRates;

	if(groupConfiguration.applyPartyCommissionFromPartyMaster && typeof partyIdForCommission !== 'undefined' && partyIdForCommission > 0)
		jsonObject["partyIdForCommission"] 			= partyIdForCommission;
	
	if(ValidateFormElement()) {
		if(!doneTheStuff) {
			$("#updateBT").addClass('hide');
			doneTheStuff = true;

			if($('#ApplyAutoRates').is(":checked"))
				var answer = confirm ("Highlighted charges will be replaced with old value! \n Are you sure you want to Update LR Type?");
			else
				var answer = confirm ("Are you sure you want to Update LR Type?");
		
			if (answer) {
				showLayer();
				
				$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/updateLrTypeWS/updateLRType.do',
					data		:	jsonObject,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data.message != undefined) {
							var errorMessage = data.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
							hideLayer();

							if(errorMessage.typeName == 'success') {
								setTimeout(() => {
									$("#updateBT").removeClass('hide');
									redirectToAfterUpdate(data);
								}, 1000);
							}
						}
						hideLayer();
					}
				});
			} else {
				doneTheStuff = false;
				setTimeout(() => {
					$("#updateBT").removeClass('hide');
				}, 200);
			}
		}
	}
}

function ValidateFormElement() {
	var WBType 					= Number($('#WBType').val());

	if(!validateInputTextFeild(1, 'WBType', 'WBType', 'error', lrSelectTypeErrMsg)) return false;

	if(jsondata.bookingTimeDebitCharge > 0) {
		alert("Booking Time Debit Charge are present In LR You Can Not Change Type! ");
		return false;
	}

	if(WBType == WAYBILL_TYPE_PAID && jsondata.paidLoading > 0) {
		alert("Please change Paid Loading charge with other charge from Edit LR Rate because Paid Loading is only applicable for ToPay LR and after Update LR Type will Change From ToPay to Paid ! ");
		return false;
	}

	if((WBType == WAYBILL_TYPE_CREDIT || WBType == WAYBILL_TYPE_TO_PAY)
		&& jsondata.paidLoading > 0) {
		alert("Please Remove Booking Type Credit Charges before changing Type ! ");
		return false;
	}

	if(WBType == WAYBILL_TYPE_CREDIT) {
		if(jsondata.paidLoading <= 0) {
			if(!validateBillingParty(1, 'billingParty', 'billingPartyId')) {
				return false;
			}
		} else {
			alert("Please change Paid Loading charge with other charge from Edit LR Rate because Paid Loading is only applicable for ToPay LR and after Update LR Type will Change From ToPay to TBB ! ");
			return false;
		}
	}

	if(WBType == WAYBILL_TYPE_TO_PAY) {
		if(!validateConsignorName(1, 'consignorParty', 'consignorParty')) return false;

		if (updateLrTypeConfiguration.valdateConsignorParty
			&& !validateValidConsignorName(1, 'consignorParty', 'consignorPartyId'))
				return false;
	}

	if(!validateRemark(1, 'remark', 'remark')) return false;

	return true;
}

function disableButtons() {
	var updateButton	= document.getElementById('updateBT');

	if(updateButton != null) {
		updateButton.className 		= 'btn_print_disabled';
		updateButton.style.display 	= 'none'; 
		updateButton.disabled		= true;
	}
	
	var closeButton	= document.getElementById('closeBT');

	if(closeButton != null) {
		closeButton.className 		= 'btn_print_disabled';
		closeButton.style.display 	= 'none'; 
		closeButton.disabled		= true;
	}
}

function checkChargeType() {
	var WBType 					= $('#WBType').val();
	
	if(!validateInputTextFeild(1, 'WBType', 'WBType', 'error', lrSelectTypeErrMsg)) {
		$('#ApplyAutoRates').attr('checked', false); 
		return false;
	}
	
	if(WBType == WAYBILL_TYPE_TO_PAY) {
		if(!validateConsignorName(1, 'consignorParty', 'consignorParty')) {
			$('#ApplyAutoRates').attr('checked', false); 
			return false;
		}

		if(updateLrTypeConfiguration.valdateConsignorParty && !validateValidConsignorName(1, 'consignorParty', 'consignorPartyId')) {
			$('#ApplyAutoRates').attr('checked', false); 
			return false;
		}
	} else if(WBType == WAYBILL_TYPE_CREDIT && !validateBillingParty(1, 'billingPartyId', 'billingParty')) {
		$('#ApplyAutoRates').prop('checked', false);
		return false;
	}

	return $('#ApplyAutoRates').is(":checked");
}

function getCreditorDetails(corporateAccountId) {
	if(corporateAccountId > 0) {

		var jsonObject					= new Object();

		jsonObject.filter				= 2;
		jsonObject.getCharge			= 1;
		jsonObject.partyId				= corporateAccountId;
		jsonObject.partyPanelType		= 1;
		jsonObject.partyType			= 2;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("Ajax.do?pageId=9&eventId=16",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log(data);

						if(!data.partyDetails)
							return;
						
						var party = data.partyDetails;

						if(groupConfiguration.showPartyIsBlackListedParty && party.blackListed > 0)
							showMessage('error','Party '+ party.displayName + ' is  blacklisted')
					}
				});
	} else {
		alert('Unable to get Data, Please enter again.');
	}
}

function getPartyDetails(partyId) {

	var jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.getCharge			= 1;
	jsonObject.partyType			= partyType;
	jsonObject.partyPanelType		= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("AjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if(!data.partyDetails)
						return;
					
					var party = data.partyDetails;
					
					if(groupConfiguration.showPartyIsBlackListedParty && party.blackListed > 0)
						showMessage('error', 'Party ' + party.displayName + ' is blacklisted')
				}
	});
}

function showHideChequeDetailPanel(ele) {
	if(bankPaymentOperationRequired)
		hideShowBankPaymentTypeOptions(ele);
	else {
		if($('#paymentType').val() ==  PAYMENT_TYPE_CHEQUE_ID)
			$('#chequeDetailPanel').css('display','block');
		else {
			$('#chequeDetailPanel').css('display','none');
			$('#chequeNo').val('');
			$('#bankName').val('');
		}
	}
}

function showHideLrType() {
	if(paymentTypeSelectionAllowed) {
		var wbTypeId = document.getElementById('WBType');
		
		if(wbTypeId.value == WAYBILL_TYPE_PAID)
			$('#paymentTypeDiv').css('display','block');
		else {
			$('#paymentTypeDiv').css('display','none');
			$('#chequeDetailPanel').css('display','none');
			$('#paymentType').val(0);
		}
	}
}

function showHideBillingBranch(){
	if(updateLrTypeConfiguration.billingBranchRequired) {
		var wbTypeId = document.getElementById('WBType');
		
		if(wayBillTypeId > 0) {
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				if(wbTypeId.value == WAYBILL_TYPE_TO_PAY) {
					$('#billingBranchRw').css('display','none');
					removeError('billingBranch');
				} else if(wbTypeId.value == WAYBILL_TYPE_CREDIT) {
					$('#billingBranchRw').css('display','block');
				} else {
					$('#billingBranchRw').css('display','none');
					removeError('billingBranch');
				}

				document.getElementById('billingBranch').value = '';
				document.getElementById('billingBranchId').value = '0';
			} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$('#billingBranchRw').css('display','none');
				document.getElementById('billingBranch').value = '';
				document.getElementById('billingBranchId').value = '0';
			}
		}
	}	
}

function showHideCorporateAccount(){
	var wbTypeId = document.getElementById('WBType');
	
	if(wayBillTypeId > 0) {
		if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
			if(wbTypeId.value == WAYBILL_TYPE_TO_PAY) {
				document.getElementById('billingPartyRw').style.display = 'none';
				removeError('billingParty');
			} else if(wbTypeId.value == WAYBILL_TYPE_CREDIT) {
				document.getElementById('billingPartyRw').style.display = 'block';
			} else {
				document.getElementById('billingPartyRw').style.display = 'none';
				removeError('billingParty');
				
				if(applyRateWithUpdateLRType)
					$('#applyRateDetails').switchClass('show', 'hide');
			}
			
			document.getElementById('consignorRw').style.display = 'none';
			document.getElementById('billingParty').value = '';
			document.getElementById('billingPartyId').value = '0';
		} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
			document.getElementById('billingPartyRw').style.display = 'none';
			document.getElementById('billingParty').value = '';
			document.getElementById('billingPartyId').value = '0';
			
			if(applyRateWithUpdateLRType)
				$('#applyRateDetails').switchClass('show','hide');
		}
	}
	removeError('remark');
}

function validatePartyOnShortCreditPayment() {
	if(!updateLrTypeConfiguration.allowShortCreditPaymentForSavedParties)
		return true;
	
	if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_ID) {
		var consignorId = $('#consignorPartyId').val();
		
		if(consignorId <= 0){
			setTimeout(function(){ 
				$('#paymentType').val(0);
				showMessage('info', " Short Credit Not Allowed For Consignor Party !");	
			}, 200);
			return false;
		}
	}
	
	return true;
}