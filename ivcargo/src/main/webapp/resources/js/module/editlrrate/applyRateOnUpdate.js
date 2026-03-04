/**
 * 
 */
var taxes							= null;
var taxBy							= 0;
var wayBillDetails					= null;
var freightAmount					= 0;
var rateHM							= null;
var wayBillBkgTaxTan				= null;
var wayBillBookingChargesHM			= null;
var sourceBranch					= null;
var destBranch						= null;
var tempFreight						= 0;
var consignmentDetailsList			= null;
var totalQuantityFreightAmt			= 0;
var totalPreConsignmentAmount		= 0;
var minimumRateConfigValue			= 0;
var qtyTypeWiseRateHM				= null;
var allowRateInDecimal				= false;
var chargeTypeId					= 0;
var isGstNoAvalable					= false;
var bookingCharges					= null;
var rateApplyOnChargeType			= 0;
var leastTaxableAmount				= 749;
var weightFreightRate				= 0;
var subRegionFoundForUnchangeableRate		= false;
var subRegionWiseUnchangeableRate	= false;
var isTaxPaidByTransporter			= 0;
var partyIdForCommission			= 0;

/*
 * This function creates text field to apply rate
 */
function setDataToApplyRate(data) {
	var chargeAmount				= 0;
	var totalAmount					= 0;
	var isLimitedChargesUpdateAllow	= EditLRRateConfiguration.isLimitedChargesUpdateAllow;
	var chargeIdsToUpdate 			= EditLRRateConfiguration.chargeIdsToUpdate; 
	
	if(rateHM != null) {
		for(var i = 0; i < bookingCharges.length; i++) {
			chargeAmount	= 0;
			
			let chargeTypeModel			= bookingCharges[i];
			let chargeId				= chargeTypeModel.chargeTypeMasterId;
			let chargeName				= chargeTypeModel.chargeName;
			
			if(rateHM.hasOwnProperty(chargeId)) {
				if(isLimitedChargesUpdateAllow) {
					var chargeIdsToUpdateArr = chargeIdsToUpdate.split(',').map(function(item) {
					    return parseInt(item.trim(), 10);
					});
					
					if(chargeIdsToUpdateArr.includes(chargeId))
						chargeAmount		= rateHM[chargeId];
				} else
					chargeAmount		= rateHM[chargeId];
			}
			
			totalAmount				+= chargeAmount;
			
			if(allowRateInDecimal)
				chargeAmount	= chargeAmount.toFixed(2);
			else
				chargeAmount	= Math.round(chargeAmount);
			
			var		chargeRow		= createRowInTable('wayBillChargeRow_' + chargeId, '', '');
			
			appendRowInTable('chargesRowToEdit', chargeRow);
			
			var 	chargeNameCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
			var 	chargeValueCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
			
			createLabel(chargeNameCol, 'label' + chargeId, chargeName, '', 'width-100px', 'Charges');
			
			appendValueInTableCol(chargeNameCol, inputForActualChargeAmount(chargeId, chargeAmount));
			appendValueInTableCol(chargeValueCol, inputForChargeAmount(chargeId, chargeAmount));
		}
		
		var totalAmountRow			= createRowInTable('', '', '');
		
		var totalLableCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
		var totalAmountCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
		
		appendValueInTableCol(totalLableCol, '<b>Total</b>');
		appendValueInTableCol(totalAmountCol, inputForTotalAmount(totalAmount));
		appendRowInTable('chargesRowToEdit', totalAmountRow);
		
		if(typeof taxes != 'undefined' && taxes != null) {
			if(sourceBranch.regionId == destBranch.regionId) {
				if(typeof taxes != 'undefined' && taxes != null) {
					for(var i = 0; i < taxes.length; i++) {
						if(taxes[i].taxMasterId == 2 || taxes[i].taxMasterId == 3) {
							taxAmount 		= 0.00;
							
							if(typeof wayBillBkgTaxTan != 'undefined') {
								if(wayBillBkgTaxTan.hasOwnProperty(taxes[i].taxMasterId)) {
									wayBillTaxTxn		= wayBillBkgTaxTan[taxes[i].taxMasterId];
									
									taxAmount			= wayBillTaxTxn.taxAmount;
								}
							}
							var taxDetailsRow			= createRowInTable('', '', '');
							
							appendRowInTable('chargesRowToEdit', taxDetailsRow);
							
							var taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							var taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							
							var percentSymble			= "";
							
							if(taxes[i].taxPercentage) {
								percentSymble			= '<b> %</b>';
							}
							
							var taxAmounts 				= $('<span />').attr({'class' : 'taxAmounts_' + taxes[i].taxMasterId, 'id' : 'taxAmounts_' + taxes[i].taxMasterId });
							
							appendValueInTableCol(taxNameLabelCol, '<b>' + taxes[i].taxName + '</b> ');
							appendValueInTableCol(taxNameLabelCol, taxAmounts);
							appendValueInTableCol(taxNameLabelCol, percentSymble);
							appendValueInTableCol(taxAmountCol, textFeildForTaxAmount(taxes[i].taxMasterId, taxAmount));
							appendValueInTableCol(taxAmountCol, perctaxTextFeild(taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].taxPercentage));
						}
					}
				}
			} else {
				if(typeof taxes != 'undefined' && taxes != null) {
					for(var i = 0; i < taxes.length; i++) {
						if(taxes[i].taxMasterId == 4){
							taxAmount 		= 0.00;
							if(typeof wayBillBkgTaxTan != 'undefined') {
								if(wayBillBkgTaxTan.hasOwnProperty(taxes[i].taxMasterId)) {
									wayBillTaxTxn		= wayBillBkgTaxTan[taxes[i].taxMasterId];
									taxAmount			= wayBillTaxTxn.taxAmount;
								}
							}
							
							var taxDetailsRow			= createRowInTable('', '', '');
							
							appendRowInTable('chargesRowToEdit', taxDetailsRow);
							
							var taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							var taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							
							var percentSymble			= "";
							
							if(taxes[i].taxPercentage) {
								percentSymble			= '<b> %</b>';
							}
							
							var taxAmounts 				= $('<span />').attr({'class' : 'taxAmounts_' + taxes[i].taxMasterId, 'id' : 'taxAmounts_' + taxes[i].taxMasterId });
							
							appendValueInTableCol(taxNameLabelCol, '<b>' + taxes[i].taxName + '</b> ');
							appendValueInTableCol(taxNameLabelCol, taxAmounts);
							appendValueInTableCol(taxNameLabelCol, percentSymble);
							appendValueInTableCol(taxAmountCol, textFeildForTaxAmount(taxes[i].taxMasterId, taxAmount));
							appendValueInTableCol(taxAmountCol, perctaxTextFeild(taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].taxPercentage));
						}
					}
				}
			}
		}
		
		/*Code started for Grand Total amount*/
		
		var grandTotalAmountRow			= createRowInTable('', '', '');
		
		var grandTotalLabelCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
		var grandTotalValueCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
		
		appendValueInTableCol(grandTotalLabelCol, '<b> Grand Total </b>');
		
		if(wayBill != null) {
			appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(wayBill.wayBillGrandTotal));
			appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(wayBill.wayBillGrandTotal));
		} else {
			appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(0));
			appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(0));
		}
		
		appendRowInTable('chargesRowToEdit', grandTotalAmountRow);
		
		/*End*/
		
		var stPaidByRow				= createRowInTable('', '', '');
		
		appendRowInTable('chargesRowToEdit', stPaidByRow);
		
		var stPaidByLableCol			= createColumnInRow(stPaidByRow, '', '', '', '', '', '');
		var stPaidByCol					= createColumnInRow(stPaidByRow, '', '', '', '', '', '');
		
		appendValueInTableCol(stPaidByLableCol, '<b>Tax Paid By</b>');
		setSTPaidBy(stPaidByCol);
	}
	
	highlightRow();
	
	let otherChargesList	= data.otherChargesList;
	
	if(data.hideBookingChargesFlag && otherChargesList != undefined) {
		for(let charge of otherChargesList)
			hideCharge(charge);
	}
	
	calcGrandTotal();
}

function setDataforEditConsignment(configuration, data){
	$("#results tr").remove();
	var chargeAmount		= 0;
	var totalAmount			= 0;
	tempFreight	= 0;
	
	if(rateHM != null) {
		for(var i = 0; i < bookingCharges.length; i++) {
			chargeAmount	= 0;
			
			let chargeTypeModel			= bookingCharges[i];
			let chargeId				= chargeTypeModel.chargeTypeMasterId;
			let chargeName				= chargeTypeModel.chargeName;
			
			if(rateHM.hasOwnProperty(chargeId)) {
				if(configuration.isLimitedChargesUpdateAllow) {
					var chargeIdsToUpdate = (configuration.chargeIdsToUpdate).toString();
					var chargeIdsToUpdateArr = chargeIdsToUpdate.split(',').map(function(item) {
					    return parseInt(item.trim(), 10);
					});
					
					if(chargeIdsToUpdateArr.includes(chargeId))
						chargeAmount		= rateHM[chargeId];
				} else
					chargeAmount		= rateHM[chargeId];
			}
			
			if(allowRateInDecimal)
				chargeAmount	= chargeAmount.toFixed(2);
			else
				chargeAmount	= Math.round(chargeAmount);
			
			totalAmount				= chargeAmount;
			
			var		chargeRow		= createRowInTable('wayBillChargeRow_' + chargeId, '', '');
			
			appendRowInTable('chargesRowToEdit', chargeRow);
			
			var 	chargeNameCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
			var 	chargeValueCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
			
			createLabel(chargeNameCol, 'label' + chargeId, chargeName, '', 'width-100px', 'Charges');
			
			appendValueInTableCol(chargeNameCol, inputForActualChargeAmount(chargeId, chargeAmount));
			appendValueInTableCol(chargeValueCol, inputForChargeAmount(chargeId, chargeAmount));
		}
		
		var totalAmountRow			= createRowInTable('', '', '');
		
		var totalLableCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
		var totalAmountCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
		
		appendValueInTableCol(totalLableCol, '<b>Total</b>');
		appendValueInTableCol(totalAmountCol, inputForTotalAmount(totalAmount));
		
		appendRowInTable('chargesRowToEdit', totalAmountRow);
		
		if(typeof taxes != 'undefined' && taxes != null) {
			if(sourceBranch.regionId == destBranch.regionId) {
				if(typeof taxes != 'undefined' && taxes != null) {
					for(var i = 0; i < taxes.length; i++) {
						if(taxes[i].taxMasterId == 2 || taxes[i].taxMasterId == 3) {
							taxAmount 		= 0.00;
							
							if(typeof wayBillBkgTaxTan != 'undefined') {
								if(wayBillBkgTaxTan.hasOwnProperty(taxes[i].taxMasterId)) {
									wayBillTaxTxn		= wayBillBkgTaxTan[taxes[i].taxMasterId];
									
									taxAmount			= wayBillTaxTxn.taxAmount;
								}
							}
							
							var taxDetailsRow			= createRowInTable('', '', '');
							
							appendRowInTable('chargesRowToEdit', taxDetailsRow);
							
							var taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							var taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							
							var percentSymble			= "";
							
							if(taxes[i].taxPercentage) {
								percentSymble			= '<b> %</b>';
							}
							
							var taxAmounts 				= $('<span />').attr({'class' : 'taxAmounts_' + taxes[i].taxMasterId, 'id' : 'taxAmounts_' + taxes[i].taxMasterId });
							
							appendValueInTableCol(taxNameLabelCol, '<b>' + taxes[i].taxName + '</b> ');
							appendValueInTableCol(taxNameLabelCol, taxAmounts);
							appendValueInTableCol(taxNameLabelCol, percentSymble);
							appendValueInTableCol(taxAmountCol, textFeildForTaxAmount(taxes[i].taxMasterId, taxAmount));
							appendValueInTableCol(taxAmountCol, perctaxTextFeild(taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].taxPercentage));

						}
					}
				}
			} else {
				if(typeof taxes != 'undefined' && taxes != null) {
					for(var i = 0; i < taxes.length; i++) {
						if(taxes[i].taxMasterId == 4){
							taxAmount 		= 0.00;
							if(typeof wayBillBkgTaxTan != 'undefined') {
								if(wayBillBkgTaxTan.hasOwnProperty(taxes[i].taxMasterId)) {
									wayBillTaxTxn		= wayBillBkgTaxTan[taxes[i].taxMasterId];
									taxAmount			= wayBillTaxTxn.taxAmount;
								}
							}
							
							var taxDetailsRow			= createRowInTable('', '', '');
							
							appendRowInTable('chargesRowToEdit', taxDetailsRow);
							
							var taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							var taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
							
							var percentSymble			= "";
							
							if(taxes[i].taxPercentage) {
								percentSymble			= '<b> %</b>';
							}
							
							var taxAmounts 				= $('<span />').attr({'class' : 'taxAmounts_' + taxes[i].taxMasterId, 'id' : 'taxAmounts_' + taxes[i].taxMasterId });
							
							appendValueInTableCol(taxNameLabelCol, '<b>' + taxes[i].taxName + '</b> ');
							appendValueInTableCol(taxNameLabelCol, taxAmounts);
							appendValueInTableCol(taxNameLabelCol, percentSymble);
							appendValueInTableCol(taxAmountCol, textFeildForTaxAmount(taxes[i].taxMasterId, taxAmount));
							appendValueInTableCol(taxAmountCol, perctaxTextFeild(taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].taxPercentage));
						}
					}
				}
			}
		}
		
		/*Code started for Grand Total amount*/
		
		var grandTotalAmountRow			= createRowInTable('', '', '');
		
		var grandTotalLabelCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
		var grandTotalValueCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
		
		appendValueInTableCol(grandTotalLabelCol, '<b> Grand Total </b>');
		
		if(wayBill != null) {
			appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(wayBill.wayBillGrandTotal));
			appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(wayBill.wayBillGrandTotal));
		} else {
			appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(0));
			appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(0));
		}
		
		appendRowInTable('chargesRowToEdit', grandTotalAmountRow);
		
		/*End*/
		
		var stPaidByRow				= createRowInTable('', '', '');
		
		appendRowInTable('chargesRowToEdit', stPaidByRow);
		
		var stPaidByLableCol			= createColumnInRow(stPaidByRow, '', '', '', '', '', '');
		var stPaidByCol					= createColumnInRow(stPaidByRow, '', '', '', '', '', '');
		
		appendValueInTableCol(stPaidByLableCol, '<b>Tax Paid By</b>');
		setSTPaidBy(stPaidByCol);
	}
	
	highlightRowForEditConsignment(configuration);
	
	let otherChargesList	= data.otherChargesList;
	
	if(data.hideBookingChargesFlag && otherChargesList != undefined) {
		for(let charge of otherChargesList)
			hideCharge(charge);
	}
	
	calcGrandTotal();
}

function textFeildForTaxAmount(taxMasterId, taxAmount) {
	
	if(!allowRateInDecimal) {
		taxAmount	= Math.round(taxAmount);
	}
	
	var textFeildForTaxAmount	= $("<input/>", { 
		type			: 'text', 
		id				: 'wayBillTaxes_' + taxMasterId,
		name			: 'wayBillTaxes_' + taxMasterId,
		class			: 'form-control',
		value			: taxAmount,
		readonly		: 'readonly',
		onblur			: "clearIfNotNumeric(this,'0');",
		onkeypress		: 'return noNumbers(event);',
		onfocus			: "this.select(); if(this.value=='0')this.value='';",
		maxlength		: 8,
		style			: 'width : 100px; height: 25px; text-align: right;'
	});
	return textFeildForTaxAmount;
}

function perctaxTextFeild(taxMasterId, taxAmount, taxPercentage) {
	var isChecked		= false;
	
	if(taxPercentage) {
		isChecked		= true;
	}
	var perctaxTextFeild	= $("<input/>", { 
		type			: 'checkbox', 
		id				: 'perctax_' + taxMasterId,
		name			: 'perctax_' + taxMasterId,
		class			: 'form-control',
		style			: "display: none;",
		value			: taxAmount.toFixed(2),
		checked			: isChecked
	});

	return perctaxTextFeild;
}

function inputForChargeAmount(chargeId, chargeAmount) {
	var inputForChargeAmount	= $("<input/>", { 
		type			: 'text', 
		id				: 'wayBillCharge_' + chargeId,
		name			: 'wayBillCharge_' + chargeId,
		class			: 'form-control',
		style			: 'width : 100px; height: 25px; text-align: right;',
		readonly		: 'readonly',
		value			: chargeAmount
	});

	return inputForChargeAmount;
}

function inputForActualChargeAmount(chargeId, chargeAmount) {
	var actualChargeAmountFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'actualChargeAmount' + chargeId,
		name			: 'actualChargeAmount' + chargeId,
		class			: 'form-control',
		value			: chargeAmount
	});

	return actualChargeAmountFeild;
}

function inputForTotalAmount(totalAmount) {
	if(!allowRateInDecimal) {
		totalAmount	= Math.round(totalAmount);
	}
	
	var inputForTotalAmount	= $("<input/>", { 
		type			: 'text', 
		id				: 'amountTotal',
		name			: 'amountTotal',
		class			: 'form-control',
		value			: totalAmount,
		readonly		: 'readonly',
		onblur			: 'clearIfNotNumeric(this, "' + totalAmount + '");',
		onkeypress		: 'return noNumbers(event);',
		maxlength		: 8,
		style			: 'width : 100px; height: 25px; text-align: right;'
	});

	return inputForTotalAmount;
}

function textFeildForPrevGrandTotal(grandTotal) {
	if(!allowRateInDecimal) {
		grandTotal	= Math.round(grandTotal);
	} else {
		grandTotal	= grandTotal.toFixed(2);
	}
	
	var textFeildForPrevGrandTotal	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'prevGrandTotal',
		name			: 'prevGrandTotal',
		class			: 'form-control',
		value			: grandTotal,
		style			: 'width : 100px; height: 25px; text-align: right;'
	});

	return textFeildForPrevGrandTotal;
}

function textFeildForGrandTotal(grandTotal) {
	if(!allowRateInDecimal) {
		grandTotal	= Math.round(grandTotal);
	}
	
	var textFeildForGrandTotal	= $("<input/>", { 
		type			: 'text', 
		id				: 'grandTotal',
		name			: 'grandTotal',
		class			: 'form-control',
		value			: grandTotal,
		readonly		: 'readonly',
		onblur			: "clearIfNotNumeric(this,'"+ grandTotal +"');",
		onkeypress		: 'return noNumbers(event);',
		onfocus			: "this.select(); if(this.value=='0')this.value='';",
		maxlength		: 8,
		style			: 'width : 100px; height: 25px; text-align: right;'
	});

	return textFeildForGrandTotal;
}

function setSTPaidBy(stPaidByCol) {

	$('#STPaidBy').find('option').remove().end();
	
	var combo = $("<select></select>").attr("id", 'STPaidBy').attr("name", 'STPaidBy').attr("onchange", 'calcGrandTotal();').attr("onkeypress", 'if(event.altKey==1){return false;}').attr("class", 'form-control width-80px');

	appendValueInTableCol(stPaidByCol, combo);
	
	createOptionForSTPaidBy();
	
	if(typeof taxBy != 'undefined') {
		$('#STPaidBy').val(taxBy);
	} else {
		$('#STPaidBy').prop('disabled', true);
	}
}

function createOptionForSTPaidBy() {
	$('#STPaidBy').append('<option value="' + 0 + '" id="' + 0 + '">' + '- ST PaidBy - ' + '</option>');
	$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
	$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
	$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
}

/*
 * Function to Get Rate in Update destination to Apply
 * */
function getRateToApplyInUpdateDestination() {
	var jsonObject						= new Object();
	
	if($('#ApplyAutoRates').is(":checked")) {
		if(!validateProperDestination(1, 'destinationBranchId', 'destination')) {
			$('#ApplyAutoRates').prop('checked', false);
			return false;
		}
	}
	
	jsonObject["destinationBranchId"]				= $('#destinationBranchId').val();
	jsonObject["currentDestinationSubRegionId"]		= $('#currentDestinationSubRegionId').val();
	jsonObject["waybillId"]							= $('#wayBillId').val();
	jsonObject["doNotApplyLessRate"]				= EditLRRateConfiguration.doNotApplyLessRate;
	jsonObject["stopPaidDestChangeOnMoreAmountForDiffCity"]	= EditLRRateConfiguration.stopPaidDestChangeOnMoreAmountForDiffCity;
	jsonObject["allowToChangePaidLRRate"]			= EditLRRateConfiguration.allowToChangePaidLRRate;
	jsonObject["doNotChangeRateInSameCity"]			= EditLRRateConfiguration.doNotChangeRateInSameCity;
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getBookingRateToApplyRateInUpdates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				hideLayer();
				$('#destinationWiseRateDiv').addClass('hide');

				$("#results tbody tr").remove();
				
				if(data.message != undefined) {
					var message = data.message;
					showMessage(message.typeName, message.typeSymble + ' ' + message.description);
					
					var allowToChangeDestination	= data.allowToChangeDestination;
					
					if(allowToChangeDestination != undefined && !allowToChangeDestination)
						$('#Update').addClass('hide');
					else
						$('#Update').removeClass('hide');

					if($('#ApplyAutoRates').is(":checked"))
						$('#ApplyAutoRates').attr('checked', false); 
					
					if(EditLRRateConfiguration.doNotApplyRateAutomatically)
						$('#Update').removeClass('hide');
						
					return;
				}
				
				$('#Update').removeClass('hide');
		
				if(typeof data.rateHM != 'undefined') {
					$('#destinationWiseRateDiv').removeClass('hide');

					wayBill								= data.wayBillDetails;
					rateHM								= data.rateHM;
					bookingCharges						= data.bookingCharges;
					freightAmount						= data.freightAmount;
					taxes								= data.taxes;
					allowToEditSTPaidBy					= data.allowToEditSTPaidBy;
					taxBy								= data.taxBy;
					wayBillBkgTaxTan					= data.wayBillBkgTaxTan;
					partyId								= data.partyId;
					wayBillBookingChargesHM 			= data.wayBillBookingChargesHM;
					destBranch							= data.destBranch;
					sourceBranch						= data.sourceBranch;
					weightFreightRate					= data.weightFreightRate;
					allowRateInDecimal					= data.allowRateInDecimal;
					chargeTypeId						= data.chargeTypeId;
					rateApplyOnChargeType				= data.rateApplyOnChargeType;
					subRegionFoundForUnchangeableRate	= data.subRegionFoundForUnchangeableRate;
					subRegionWiseUnchangeableRate		= data.subRegionWiseUnchangeableRate;
					partyIdForCommission				= data.partyIdForCommission;
					qtyTypeWiseRateHM					= data.qtyTypeWiseRateHM;
					
					if(destBranch.subRegionId == Number($('#currentDestinationSubRegionId').val()) && subRegionFoundForUnchangeableRate && subRegionWiseUnchangeableRate) {
						if($('#ApplyAutoRates').is(":checked")) {
							$('#ApplyAutoRates').attr('checked', false); 
						}

						$("#results").addClass('hide');

						$("#ApplyAutoRates").click(function(){
							showMessage('info', "Rate Remains Unchanged Under Same Sub Region !");
						});

						return;
					} else {
						$("#results").removeClass('hide');
					}

					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#wayBillTypeId').val(wayBill.wayBillTypeId);

					setDataToApplyRate(data); 
				}

				if(freightAmount <= 0) {
					showMessage('error', "Rate Not Found !");
					
					if(EditLRRateConfiguration.checkApplyRateAutomatically)
						$('#ApplyAutoRates').prop("disabled", false);
				} else {
					if(EditLRRateConfiguration.checkApplyRateAutomatically) {
						$('#ApplyAutoRates').prop('checked', true);
						$('#ApplyAutoRates').prop("disabled", true);
					}
				}
				
				if(EditLRRateConfiguration.doNotApplyRateAutomatically){
					$('#ApplyAutoRates').prop("disabled", false);
				}
			}
		}
	});
}

/*
 * Function to Get Rate in Edit Consignment to Apply
 * */
function getAllPackingTypeRatesForEditConsignment(configuration, packingDetails) {
	var jsonObject			= new Object();
	
	jsonObject["actualWeight"]					= $('#actWeight').val();
	jsonObject["chargedWeight"]					= $('#chWeight').val();
	jsonObject["waybillId"]						= $('#wayBillId').val();
	jsonObject["packingDetails"] 				= packingDetails;
	jsonObject["chargeTypeId"] 					= $('#newChargeType').val();
	jsonObject['applyRatefromEditConsignment'] 	= true;
	jsonObject["doNotApplyLessRate"]			= configuration.doNotApplyLessRate;
	
	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getBookingRateToApplyRateInUpdates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				hideLayer();
				$('#editConsignmentRate').hide();
				
				$("#results tbody tr").remove();

				if(data.message != undefined) {
					var message = data.message;
					showMessage(message.typeName, message.typeSymble + ' ' + message.description);
					
					if($('#isRateAutoMaster').is(":checked")) {
						$('#isRateAutoMaster').attr('checked', false); 
					}
					
					return;
				}
				
				if(typeof data.rateHM != 'undefined') {
					$('#editConsignmentRate').show();
					rateHM						= data.rateHM;
					bookingCharges				= data.bookingCharges;
					wayBill						= data.wayBillDetails;
					freightAmount				= data.freightAmount;
					taxes						= data.taxes;
					allowToEditSTPaidBy			= data.allowToEditSTPaidBy;
					taxBy						= data.taxBy;
					wayBillBkgTaxTan			= data.wayBillBkgTaxTan;
					wayBillBookingChargesHM 	= data.wayBillBookingChargesHM;
					destBranch					= data.destBranch;
					sourceBranch				= data.sourceBranch;
					weightFreightRate			= data.weightFreightRate;
					consignmentDetailsList		= data.consignmentDetailsList;
					totalQuantityFreightAmt		= data.totalQuantityFreightAmt;
					qtyTypeWiseRateHM			= data.qtyTypeWiseRateHM;
					totalPreConsignmentAmount	= data.totalPreConsignmentAmount;
					minimumRateConfigValue		= data.minimumRateConfigValue;
					allowRateInDecimal			= data.allowRateInDecimal;
					chargeTypeId				= data.chargeTypeId;
					rateApplyOnChargeType		= data.rateApplyOnChargeType;
					partyIdForCommission		= data.partyIdForCommission;
					
					$('#totalQuantity').val(data.quantity);

					setDataforEditConsignment(configuration, data); 
				}
				
				if(freightAmount <= 0) {
					showMessage('error', "No Rates Found !");
					if(configuration.checkApplyRateAutomatically == 'true' || configuration.checkApplyRateAutomatically == true){
						$('#isRateAutoMaster').prop('disabled',false);
						$('#isRateAutoMaster').prop('checked',false);
					}
					return;
				}else{
					if(configuration.checkApplyRateAutomatically == 'true' || configuration.checkApplyRateAutomatically == true){
						$('#isRateAutoMaster').prop('checked',true);
						$('#isRateAutoMaster').prop('disabled',true);
					}
				}
				
				if(chargeTypeId == CHARGETYPE_ID_WEIGHT || chargeTypeId == CHARGETYPE_ID_KILO_METER) {
					$('#weightFreightRate').val(weightFreightRate);
				} else if(chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					$('.qtyAmt').val(0);
					
					if(typeof consignmentDetailsList != 'undefined') {
						for(var i = 0; i < consignmentDetailsList.length; i++) {
							var consignmentDetails		= consignmentDetailsList[i];
							
							var packingTypeMasterId		= consignmentDetails.packingTypeMasterId;
							var consignmentGoodsId		= consignmentDetails.consignmentGoodsId;
							
							if(totalQuantityFreightAmt >= minimumRateConfigValue && totalPreConsignmentAmount >= minimumRateConfigValue) {
								if(typeof qtyTypeWiseRateHM != 'undefined') {
									if(qtyTypeWiseRateHM.hasOwnProperty(packingTypeMasterId + "_" + consignmentGoodsId)) {
										$('#newqtyAmt_' + i).val(qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]);
										$('#qtyAmt_' + i).val(qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]);
									} else {
										$('#newqtyAmt_' + i).val(0);
										$('#qtyAmt_' + i).val(0);
									}
								}
							} else if(totalPreConsignmentAmount > minimumRateConfigValue) {
								$('#newqtyAmt_' + i).val(0);
								$('#qtyAmt_' + i).val(0);
							}
						}
					}
				}
			}
		}
	});
}

/*
 * Function to Get Rate in Update Customer to Apply
 * */

function getRateToApplyOnUpdateParty() {
	
	var jsonObject						= new Object();
	
	jsonObject["ConsignorCorporateAccountId"]	= $('#consignorPartyId').val();
	jsonObject["ConsigneeCorporateAccountId"]	= $('#consigneePartyId').val();
	jsonObject["BillingPartyId"]				= $('#billingPartyId').val();
	jsonObject["waybillId"]						= $('#wayBillId').val();
	jsonObject["doNotApplyLessRate"]			= EditLRRateConfiguration.doNotApplyLessRate;
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getBookingRateToApplyRateInUpdates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				hideLayer();
				$('#partyWiseRatePanelDiv').switchClass('hide', 'show');
				
				$("#results tbody tr").remove();
				
				if(data.message != undefined) {
					var message = data.message;
					showMessage(message.typeName, message.typeSymble + ' ' + message.description);
					
					if($('#ApplyAutoRates').is(":checked")) {
						$('#ApplyAutoRates').attr('checked', false); 
					}
					
					return;
				}
				
				if(typeof data.rateHM != 'undefined') {
					$('#partyWiseRatePanelDiv').switchClass('show', 'hide');
					
					rateHM					= data.rateHM;
					bookingCharges			= data.bookingCharges;
					wayBill					= data.wayBillDetails;
					freightAmount			= data.freightAmount;
					taxes					= data.taxes;
					taxBy					= data.taxBy;
					allowToEditSTPaidBy		= data.allowToEditSTPaidBy;
					wayBillBkgTaxTan		= data.wayBillBkgTaxTan;
					partyId					= data.partyId;
					destBranch				= data.destBranch;
					sourceBranch			= data.sourceBranch;
					wayBillBookingChargesHM	= data.wayBillBookingChargesHM;
					weightFreightRate		= data.weightFreightRate;
					allowRateInDecimal		= data.allowRateInDecimal;
					chargeTypeId			= data.chargeTypeId;
					rateApplyOnChargeType	= data.rateApplyOnChargeType;
					partyIdForCommission	= data.partyIdForCommission;
					qtyTypeWiseRateHM		= data.qtyTypeWiseRateHM;
					
					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#wayBillTypeId').val(wayBill.wayBillTypeId);
					
					setDataToApplyRate(data); 
				}
				
				if(freightAmount <= 0) {
					showMessage('error', "Rate Not Found !");
					$('#ApplyRatesWithChangeParty').prop('checked',false);
				} else {
					$('#ApplyRatesWithChangeParty').prop('checked',true);
					$('#ApplyRatesWithChangeParty').prop('disabled',true);
				}
			}
		}
	});
}

/*
 * Function to Get Rate in Update LR Type to Apply
 * */

function getRateToApplyOnUpdateLRType() {
	var jsonObject						= new Object();
	
	jsonObject["ConsignorCorporateAccountId"]	= $('#consignorPartyId').val();
	jsonObject["ConsigneeCorporateAccountId"]	= $('#consigneePartyId').val();
	jsonObject["BillingPartyId"]				= $('#billingPartyId').val();
	jsonObject["waybillId"]						= $('#wayBillId').val();
	jsonObject["wayBillTypeId"]					= $('#WBType').val();
	jsonObject['applyRatefromEditLRType'] 		= true;
	jsonObject["doNotApplyLessRate"]			= EditLRRateConfiguration.doNotApplyLessRate;
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/wayBillWS/getBookingRateToApplyRateInUpdates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				hideLayer();
				$('#partyWiseRatePanelDiv').switchClass('show', 'hide');
				
				$("#results tbody tr").remove();
				
				if(data.message != undefined) {
					var message = data.message;
					showMessage(message.typeName, message.typeSymble + ' ' + message.description);
					
					if($('#ApplyAutoRates').is(":checked")) {
						$('#ApplyAutoRates').attr('checked', false); 
					}
					
					return;
				}
				
				if(typeof data.rateHM != 'undefined') {
					$('#partyWiseRatePanelDiv').switchClass('show', 'hide');
					
					rateHM					= data.rateHM;
					bookingCharges			= data.bookingCharges;
					wayBill					= data.wayBillDetails;
					freightAmount			= data.freightAmount;
					taxes					= data.taxes;
					taxBy					= data.taxBy;
					allowToEditSTPaidBy		= data.allowToEditSTPaidBy;
					wayBillBkgTaxTan		= data.wayBillBkgTaxTan;
					partyId					= data.partyId;
					wayBillBookingChargesHM	= data.wayBillBookingChargesHM;
					destBranch				= data.destBranch;
					sourceBranch			= data.sourceBranch;
					weightFreightRate		= data.weightFreightRate;
					allowRateInDecimal		= data.allowRateInDecimal;
					chargeTypeId			= data.chargeTypeId;
					rateApplyOnChargeType	= data.rateApplyOnChargeType;
					partyIdForCommission	= data.partyIdForCommission;
					qtyTypeWiseRateHM		= data.qtyTypeWiseRateHM;
					
					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#wayBillTypeId').val(wayBill.wayBillTypeId);
					
					setDataToApplyRate(data); 
				}
				
				if(freightAmount <= 0) {
					showMessage('error', "Rate Not Found !");
					if(EditLRRateConfiguration.checkApplyRateAutomatically){
						$('#ApplyAutoRates').prop('disabled',false);
						$('#ApplyAutoRates').prop('checked',false);
					}
				} else {
					if(EditLRRateConfiguration.checkApplyRateAutomatically){
						$('#ApplyAutoRates').prop('checked',true);
						$('#ApplyAutoRates').prop('disabled',true);
					}
				}
			}
		}
	});
}

function highlightRowForEditConsignment(configuration){
	var chargeIdsToUpdate = (configuration.chargeIdsToUpdate).toString();
	var chargeIdsToUpdateArr = chargeIdsToUpdate.split(',').map(function(item) {
	    return parseInt(item.trim(), 10);
	});
	
	if(typeof wayBillBookingChargesHM != 'undefined' && wayBillBookingChargesHM != null) {
		for(var i in wayBillBookingChargesHM) {
		    if (wayBillBookingChargesHM.hasOwnProperty(i)) {
		    	if(configuration.retainPreviousCharges == true){
		    		if(!chargeIdsToUpdateArr.includes(Number(i))){
		      			$('#wayBillCharge_'+i).val(wayBillBookingChargesHM[i]);
		    		}else{
		    			 $('#wayBillCharge_'+i).attr('style', "background-color: #ff8551;");
		    		}
	        	}
		    }
		}
	}
}

function highlightRow(){
	var chargeIdsToUpdate 		= EditLRRateConfiguration.chargeIdsToUpdate;
	var retainPreviousCharges	= EditLRRateConfiguration.retainPreviousCharges;
	
	var chargeIdsToUpdateArr = chargeIdsToUpdate.split(',').map(function(item) {
	    return parseInt(item.trim(), 10);
	});
	
	if(typeof wayBillBookingChargesHM != 'undefined' && wayBillBookingChargesHM != null) {
		for(var i in wayBillBookingChargesHM) {
		    if (wayBillBookingChargesHM.hasOwnProperty(i)) {
		    	if(retainPreviousCharges) {
		    		if(!chargeIdsToUpdateArr.includes(Number(i))) {
		      			$('#wayBillCharge_'+i).val(wayBillBookingChargesHM[i]);
		    		} else {
		    			 $('#wayBillCharge_'+i).attr('style', "background-color: #ff8551;");
		    		}
	        	}
		    }
		}
	}
}

function calcGrandTotal() {
	var cahargeTable 	= document.getElementById('results');
	var inputs			= cahargeTable.getElementsByTagName("input");
	var len			 	= inputs.length;
	var amtTotal	 	= 0;

	for(var i = 0; i < len; i++) {
		if(inputs[i].type == 'text') {
			if(/wayBillCharge_/i.test(inputs[i].id)) {

				if(inputs[i].value != '') {
					if (lrWiseDecimalAmountAllow()) {
						amtTotal 	+= (parseFloat(inputs[i].value,10));
					} else {						
						amtTotal 	+= parseInt(inputs[i].value,10);
					}
				}
			}
		}
	}

	if (lrWiseDecimalAmountAllow()) {
		$('#amountTotal').val(amtTotal.toFixed(2));
	} else {		
		$('#amountTotal').val(amtTotal);
	}
	
	getGrandTotalForTopayLRRate(amtTotal);
}

function getGrandTotalForTopayLRRate(amtTotal) {
	var cahargeTable 		= document.getElementById('results');
	var inputs				= cahargeTable.getElementsByTagName("input");
	var len			 		= inputs.length;
	var taxAmt				= 0;
	var totalTax			= 0;
	var nonTaxableAmt		= 0;
	var wayBillTypeId		= Number($('#wayBillTypeId').val());
	var isDiscountPercentage = $('#isDiscountPercent').is(":checked");
	var discountVal			 = $('#discount').val();
	
	if(isDiscountPercentage){
		if(discountVal != undefined){
			amtTotal	= amtTotal - ((amtTotal * Number(discountVal))/100);
		}
	}else{
		if(discountVal != undefined){
			amtTotal	= amtTotal - Number(discountVal);
		}
	}
	
	if(discountVal > 0){
		if (lrWiseDecimalAmountAllow()) {
			$('#amountTotal').val(amtTotal.toFixed(2));
		} else {		
			$('#amountTotal').val(amtTotal);
		}
	}
	
	if(allowToEditSTPaidBy) {
		
		nonTaxableAmt	= getServiceTaxExcludeCharges();
		
		if(typeof taxBy !== 'undefined' && Number(taxBy) > 0) { 
			for(var i = 0; i < len; i++) {
				taxAmt 	= 0;

				if(inputs[i + 1] && inputs[i + 1].type == 'checkbox') {
					if(/perctax_/i.test(inputs[i + 1].id)) {
						if(parseInt((amtTotal - nonTaxableAmt), 10) > leastTaxableAmount) {
							if(inputs[i + 1].checked) {
								if($("#isPrevStaxAllow").val() == 'true') {
									if (lrWiseDecimalAmountAllow()) {
										taxAmt = parseFloat($("#lastSTaxAmt").val() * (amtTotal - nonTaxableAmt) / 100);
									} else {										
										taxAmt = Math.round(parseFloat($("#lastSTaxAmt").val()) * (amtTotal - nonTaxableAmt) / 100);
									}
									$("#taxAmounts_" + (inputs[i + 1].id).split('_')[1]).html(parseFloat($("#lastSTaxAmt").val()));
								} else {
									if (lrWiseDecimalAmountAllow()) {
										taxAmt = parseFloat(inputs[i+1].value * (amtTotal - nonTaxableAmt) / 100);
									} else {										
										taxAmt = Math.round(parseFloat(inputs[i+1].value) * (amtTotal - nonTaxableAmt) / 100);
									}
									$("#taxAmounts_" + (inputs[i + 1].id).split('_')[1]).html(parseFloat(inputs[i + 1].value));
								}
							} else {
								if (lrWiseDecimalAmountAllow()) {
									taxAmt = parseFloat(inputs[i + 1].value);
								} else {									
									taxAmt = Math.round(inputs[i + 1].value);
								}
							}
							$('#STPaidBy').prop('disabled', false);
						} else {
							$("#taxAmounts_" + (inputs[i + 1].id).split('_')[1]).html(parseFloat(inputs[i + 1].value));
							$('#STPaidBy').prop('disabled', true);
							$('#STPaidBy').val(Number(taxBy));
						}
					}
				}

				if(inputs[i].type == 'text') {
					if(/wayBillTaxes_/i.test(inputs[i].id)) {
						if (lrWiseDecimalAmountAllow()) {
							totalTax += parseFloat(taxAmt);
						} else {
							totalTax += parseInt(taxAmt);
						}
						
						if((Number(taxBy) == TAX_PAID_BY_TRANSPORTER_ID || $('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID) && !isGstNoAvalable) {
							if (lrWiseDecimalAmountAllow()) {
								inputs[i].value = (parseFloat(taxAmt)).toFixed(2);
							} else {						
								inputs[i].value = parseInt(taxAmt);
							}
						}
					}
				}
			}
		} else {
			for(var i = 0; i < len; i++) {
				taxAmt = 0;

				if(inputs[i + 1] && inputs[i + 1].type == 'checkbox') {
					if(/perctax_/i.test(inputs[i + 1].id)) {
						if((amtTotal - nonTaxableAmt) > leastTaxableAmount) {
							$('#STPaidBy').prop('disabled', false);

							if(inputs[i + 1].checked) {
								if($("#isPrevStaxAllow").val() == 'true') {
									if (lrWiseDecimalAmountAllow()) {
										taxAmt 	= (parseFloat($("#lastSTaxAmt").val()) * (amtTotal - nonTaxableAmt) / 100);
									} else {										
										taxAmt 	= Math.round(parseFloat($("#lastSTaxAmt").val()) * (amtTotal - nonTaxableAmt) / 100);
									}
									$("#taxAmounts_" + (inputs[i + 1].id).split('_')[1]).html(parseFloat($("#lastSTaxAmt").val()));
								} else {
									if (lrWiseDecimalAmountAllow()) {
										taxAmt = (parseFloat(inputs[i+1].value) * (amtTotal - nonTaxableAmt) / 100);
									} else {										
										taxAmt = Math.round(parseFloat(inputs[i+1].value) * (amtTotal - nonTaxableAmt) / 100);
									}
									$("#taxAmounts_" + (inputs[i + 1].id).split('_')[1]).html(parseFloat(inputs[i+1].value));
								}
							} else {
								if (lrWiseDecimalAmountAllow()) {
									taxAmt = (inputs[i + 1].value);
								} else {									
									taxAmt = Math.round(inputs[i + 1].value);
								}
							}

							if($('#STPaidBy').val() <= 0) {
								if(partyId > 0) {
									if(isTaxPaidByTransporter) { //isTaxPaidByTransporter globally defined
										$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
									} else if((groupConfiguration.showStPaidByConsignor == "false" || groupConfiguration.showStPaidByConsignor == false) && (groupConfiguration.showStPaidByConsignee == "false" || groupConfiguration.showStPaidByConsignee == false)){
										$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
									} else if(wayBillTypeId == WAYBILL_TYPE_PAID) {
										$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
									} else {
										$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
									}
								} else {
									if((groupConfiguration.showStPaidByConsignor == "false" || groupConfiguration.showStPaidByConsignor == false) && (groupConfiguration.showStPaidByConsignee == "false" || groupConfiguration.showStPaidByConsignee == false)){
										$('#STPaidBy').val(TAX_PAID_BY_TRANSPORTER_ID);
									} else if(wayBillTypeId == WAYBILL_TYPE_PAID) {
										$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
									} else {
										$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
									}
								}
							}
						} else {
							$('#STPaidBy').prop('disabled', true);
							$('#STPaidBy').val(0);
						}
					}
				}
				
				if(inputs[i].type == 'text') {
					if(/wayBillTaxes_/i.test(inputs[i].id)) {
						if (lrWiseDecimalAmountAllow()) {
							totalTax += parseFloat(taxAmt);
						} else {							
							totalTax += parseInt(taxAmt);
						}
						
						if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !isGstNoAvalable) {
							if (lrWiseDecimalAmountAllow()) {
								inputs[i].value = (parseFloat(taxAmt)).toFixed(2);
							} else {								
								inputs[i].value = parseInt(taxAmt);
							}
						} else {
							inputs[i].value = '0';
						}
					}
				}
			}
		}
	}
	
	if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !isGstNoAvalable) {
		if (lrWiseDecimalAmountAllow()) {
			$('#grandTotal').val((parseFloat(amtTotal) + parseFloat(totalTax)).toFixed(2));
			$('#wayBillTaxes_1').val(totalTax.toFixed(2));
		} else {			
			$('#grandTotal').val(parseInt(amtTotal) + parseInt(totalTax));
			$('#wayBillTaxes_1').val(totalTax);
		}
	} else {
		if (lrWiseDecimalAmountAllow()) {
			$('#grandTotal').val((parseFloat(amtTotal)).toFixed(2));
		} else {			
			$('#grandTotal').val(parseInt(amtTotal));
		}
		$('#wayBillTaxes_1').val(0);
		$('#wayBillTaxes_2').val(0);
		$('#wayBillTaxes_3').val(0);
		$('#wayBillTaxes_4').val(0);
	}
}

function lrWiseDecimalAmountAllow() {
	if(allowRateInDecimal == 'true' || allowRateInDecimal) {
		return true;
	}
	
	return false;
}

function getServiceTaxExcludeCharges() {
	var total		= 0;
	var charge  	= null;

	for(var i = 0; i < bookingCharges.length; i++) {
		if(bookingCharges[i].taxExclude) {
			charge =  document.getElementById('wayBillCharge_' + bookingCharges[i].chargeTypeMasterId);
			total += (charge != null ? parseInt(charge.value) : 0);
		}
	}
	return total;
}
function hideCharge(chargeId) {
	changeDisplayProperty('wayBillChargeRow_' + chargeId, 'none');
}