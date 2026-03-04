/**
 * 
 */

var TAX_PAID_BY_TRANSPORTER_ID	= 3;
var SGST_MASTER_ID				= 2;
var CGST_MASTER_ID				= 3;
var IGST_MASTER_ID				= 4;

function calculateGSTTaxes(taxes, wayBillId, taxPaidByEle, calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, consignorCorpId, consigneeCorpId ,billingPartyId, changeStPaidbyOnPartyGSTN) {
	var taxPaidByVal			= $('#' + taxPaidByEle).val();
	var leastTaxableAmount		= 0;
	var taxAmount				= 0;
	var isGSTNumberAvailable	= checkGSTNumberAvailableInDelivery(consignorGstn, consigneeGstn);

	if(!jQuery.isEmptyObject(taxes)) {
		for (var i = 0; i < taxes.length; i++) {
			var tax				= taxes[i];
			leastTaxableAmount	= tax.leastTaxableAmount;
			taxAmount			= 0.0;
			
			if(calculateSTOn > leastTaxableAmount) {
				if (tax.isTaxPercentage) {
					if(configuration.applyTaxesSameAsBookingPage == 'true' || configuration.applyTaxesSameAsBookingPage == true){
						if(((tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) 
						&& wayBillTax[0].taxMasterId == SGST_MASTER_ID || wayBillTax[0].taxMasterId == CGST_MASTER_ID)
						|| (tax.taxMasterId == IGST_MASTER_ID && wayBillTax[0].taxMasterId == IGST_MASTER_ID)
						){
							taxAmount		= Number(((tax.taxAmount) * (calculateSTOn / 100)).toFixed(2));
						}
					}else if(sourceBranchStateId == destinationBranchStateId) {
						if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * (calculateSTOn / 100)).toFixed(2));
						}
					} else {
						if(tax.taxMasterId == IGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * (calculateSTOn / 100)).toFixed(2));
						}
					}
					
					$('#calculateSTOnAmount_' + tax.taxMasterId + '_' + wayBillId).val(calculateSTOn);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					
					if(taxPaidByVal == TAX_PAID_BY_TRANSPORTER_ID) {
						if(!isGSTNumberAvailable) {
							billAmt		= billAmt + taxAmount;
						}
						
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					} else {
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					}
				} else {
					$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
				}
			} else {
				$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
			}
			
			if(isGSTNumberAvailable) {
				$('#tax_' + tax.taxMasterId + '_' + wayBillId).val(0);
			}
		}
	}
	
	$('#billAmount').val(billAmt);
}

function calculateDDMGSTTaxes(taxes, wayBillId, gstPaidBy, calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, isSTAllow) {
	var leastTaxableAmount		= 0;
	var taxAmount				= 0;
	var isGSTNumberAvailable	= checkGSTNumberAvailableInDelivery(consignorGstn, consigneeGstn);

	if(!jQuery.isEmptyObject(taxes)) {
		for (var i = 0; i < taxes.length; i++) {
			var tax				= taxes[i];
			leastTaxableAmount	= tax.leastTaxableAmount;
			taxAmount			= 0.0;
			
			if(calculateSTOn > leastTaxableAmount || isSTAllow) {
				if (tax.isTaxPercentage) {
					if(sourceBranchStateId == destinationBranchStateId) {
						if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * calculateSTOn / 100).toFixed(2));
						}
					} else {
						if(tax.taxMasterId == IGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * calculateSTOn / 100).toFixed(2));
						}
					}
					
					$('#calculateSTOnAmount_' + tax.taxMasterId + '_' + wayBillId).val(calculateSTOn);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					
					if(gstPaidBy == 0 || gstPaidBy == TAX_PAID_BY_TRANSPORTER_ID) {
						if(!isGSTNumberAvailable) {
							billAmt		= billAmt + taxAmount;
						}
						
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					} else {
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					}
				}
			} else {
				$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
			}
		}
	}
	
	$('#deliveryAmt_' + wayBillId).val(billAmt);
}

function calculateMultiLRDeliveryTaxes(taxes, wayBillId, taxPaidByEle, calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, isSTAllow) {
	var taxPaidByVal			= $('#' + taxPaidByEle + wayBillId).val();
	var leastTaxableAmount		= 0;
	var taxAmount				= 0;
	var isGSTNumberAvailable	= checkGSTNumberAvailableInDelivery(consignorGstn, consigneeGstn);
	
	if(!jQuery.isEmptyObject(taxes)) {
		for (var i = 0; i < taxes.length; i++) {
			var tax				= taxes[i];
			leastTaxableAmount	= tax.leastTaxableAmount;
			taxAmount			= 0.0;
			
			if((calculateSTOn > leastTaxableAmount) || isSTAllow) {
				if (tax.isTaxPercentage) {
					if(sourceBranchStateId == destinationBranchStateId) {
						if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * calculateSTOn / 100).toFixed(2));
						}
					} else {
						if(tax.taxMasterId == IGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * calculateSTOn / 100).toFixed(2));
						}
					}
					
					$('#calculateSTOnAmount_' + tax.taxMasterId + '_' + wayBillId).val(calculateSTOn);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					
					if(taxPaidByVal == TAX_PAID_BY_TRANSPORTER_ID) {
						if(!isGSTNumberAvailable) {
							billAmt		= billAmt + taxAmount;
						}
						
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					} else {
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					}
				} else {
					$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
				}
			} else {
				$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
			}
			
			if(isGSTNumberAvailable) {
				$('#tax_' + tax.taxMasterId + '_' + wayBillId).val(0);
			}
		}
	}
	
	$('#billAmount_' + wayBillId).val(billAmt);
}

function checkGSTNumberAvailableInDelivery(consignorGstn, consigneeGstn) {
	var isGSTNumberAvailable	= true;
	
	if(consignorGstn == '' && consigneeGstn == '') {
		isGSTNumberAvailable	= false;
	} else if(consignorGstn == undefined && consigneeGstn == undefined) {
		isGSTNumberAvailable	= false;
	} else if(jQuery.isEmptyObject(consignorGstn) && jQuery.isEmptyObject(consigneeGstn)) {
		isGSTNumberAvailable	= false;
	}
	
	return false;
}

function calculatePartialDlyGSTTaxes(taxes, wayBillId, taxPaidByEle, calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn) {
	var taxPaidByVal			= $('#' + taxPaidByEle).val();
	var leastTaxableAmount		= 0;
	var taxAmount				= 0;
	var isGSTNumberAvailable	= checkGSTNumberAvailableInDelivery(consignorGstn, consigneeGstn);

	if(!jQuery.isEmptyObject(taxes)) {
		for (var i = 0; i < taxes.length; i++) {
			var tax				= taxes[i];
			leastTaxableAmount	= tax.leastTaxableAmount;
			taxAmount			= 0.0;
			
			if(calculateSTOn > leastTaxableAmount) {
				if (tax.taxPercentage) {
					if(sourceBranchStateId == destinationBranchStateId) {
						if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
							taxAmount		= Number(((tax.taxAmount) * (calculateSTOn / 100)).toFixed(2));
						}
					} else  if(tax.taxMasterId == IGST_MASTER_ID)
						taxAmount		= Number(((tax.taxAmount) * (calculateSTOn / 100)).toFixed(2));
					
					$('#calculateSTOnAmount_' + tax.taxMasterId + '_' + wayBillId).val(calculateSTOn);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					
					if(taxPaidByVal == TAX_PAID_BY_TRANSPORTER_ID) {
						if(!isGSTNumberAvailable)
							billAmt		= billAmt + taxAmount;
						
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					} else {
						$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
						$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(taxAmount);
					}
				} else {
					$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
					$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
				}
			} else {
				$("#tax_" + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#unAddedST_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#actualTax_' + tax.taxMasterId + '_' + wayBillId).val(0);
				$('#calculateSTOnAmount_' +  tax.taxMasterId + '_' + wayBillId).val(0);
			}
			
			if(isGSTNumberAvailable)
				$('#tax_' + tax.taxMasterId + '_' + wayBillId).val(0);
		}
	}
	
	$('#dlyAmount').val(billAmt);
}

function getAccountNumberForGroup(){
	bankAccountList = null;
	
	var jsonObject			= new Object();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/bankAccountWS/getBankAccountForGroup.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			bankAccountList	= data.BankAccount;
			
			if(bankAccountList != undefined && bankAccountList.length == 1) {
				$("#accountNo").val(bankAccountList[0].bankAccountNumber);
				$("#accountNo_primary_key").val(bankAccountList[0].bankId);
				$("#bankAccountId").val(bankAccountList[0].bankId);
				$("#bankName").focus();
			}
		}
	});
}