/**
 * 
 */

function setWayBillDeliveryChargesData() {
	
	var wbDlyChrg		= null;
	var chargeTypeModel	= null;
	var chargeId		= 0;
	var chargeName		= null;
	var chargeAmount	= 0;
	var dlyTaxAmount	= 0;
	
	/*Code started for Charges */
	for(var i = 0; i < deliveryCharges.length; i++) {
		wbDlyChrg				= null;
		chargeAmount			= 0;
		
		chargeTypeModel			= deliveryCharges[i];
		
		chargeId				= chargeTypeModel.chargeTypeMasterId;
		chargeName				= chargeTypeModel.chargeName;
		
		if(typeof wayBillDeliveryChargesColl != 'undefined') {
			if(wayBillDeliveryChargesColl.hasOwnProperty(chargeId)) {
				wbDlyChrg		= wayBillDeliveryChargesColl[chargeId];
			}
		}
		
		var		chargeRow		= createRowInTable('wayBillChargeRow_' + chargeId, '', '');
		
		appendRowInTable('deliveryChargesRowToEdit', chargeRow);
		
		var 	chargeNameCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
		var 	chargeValueCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
		
		createLabel(chargeNameCol, 'label' + chargeId, chargeName, '', 'width-100px', 'Charges');
		
		if(wbDlyChrg != null) {
			chargeAmount		= Math.round(parseInt(wbDlyChrg.chargeAmount));
		}
		
		appendValueInTableCol(chargeValueCol, inputForWayBillDlyCharges(chargeId, chargeAmount));
	}
	
	/*End*/
	
	/*Code started for Discount Amount*/
	var deliveryDiscount		= 0;

	deliveryDiscount			= Math.round(wayBill.deliveryDiscount);

	if(editLRRateOfCreditor) {
		if(wayBill.deliveryDiscount > 0) {
			var discountAmountRow			= createRowInTable('', '', '');
			
			appendRowInTable('deliveryChargesRowToEdit', discountAmountRow);

			var discountLableCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');
			var discountAmountCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');
			
			appendValueInTableCol(discountLableCol, '<b>Discount</b>');
			appendValueInTableCol(discountAmountCol, textFeildForTxtDelDisc(deliveryDiscount));
			appendValueInTableCol(discountAmountCol, dlyDiscountTextFeild(deliveryDiscount));
			
			var discountTypeRow				= createRowInTable('', '', '');
			
			appendRowInTable('deliveryChargesRowToEdit', discountTypeRow);
			
			var discountTypeLableCol		= createColumnInRow(discountTypeRow, '', '', '', '', '', '');
			var discountTypesDlyColumn		= createColumnInRow(discountTypeRow, '', '', '', '', '', '');
			
			appendValueInTableCol(discountTypeLableCol, '<b>Discount Type</b>');
			setDiscountTypesDly(discountTypesDlyColumn);
		}
	}
	
	/*Code started for Total Amount*/
	var totalAmountRow			= createRowInTable('', '', '');
	
	var totalLableCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
	var totalAmountCol			= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
	
	var deliveryChargesSum		= Math.round(wayBill.deliveryChargesSum + wayBill.deliveryTimeServiceTax);

	appendValueInTableCol(totalLableCol, '<b>Total</b>');
	appendValueInTableCol(totalAmountCol, discountedDlyAmountTotalTextFeild(deliveryChargesSum));
	
	appendRowInTable('deliveryChargesRowToEdit', totalAmountRow);
	
	/*End*/
	
	/*Code started for Tax amount*/
	
	if(jsondata.allowToEditDeliverySTPaidBy) {
		if(typeof taxes != 'undefined') {
			for(var i = 0; i < taxes.length; i++) {
				dlyTaxAmount 		= 0.00;
				
				if(typeof wayBillDlyTaxTan != 'undefined') {
					if(wayBillDlyTaxTan.hasOwnProperty(taxes[i].taxMasterId)) {
						var wayBillDlyTaxTanObj		= wayBillDlyTaxTan[taxes[i].taxMasterId];
						
						dlyTaxAmount				= wayBillDlyTaxTanObj.taxAmount;
					}
				}
				
				var taxDetailsRow			= createRowInTable('', '', '');
				
				appendRowInTable('deliveryChargesRowToEdit', taxDetailsRow);
				
				var taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
				var taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
				
				var percentSymble			= "";
				
				if(taxes[i].isTaxPercentage) {
					percentSymble			= '%';
				}
				
				appendValueInTableCol(taxNameLabelCol, '<b>' + taxes[i].taxName + '</b> ');
				appendValueInTableCol(taxNameLabelCol, taxes[i].taxAmount);
				appendValueInTableCol(taxNameLabelCol, percentSymble);
				appendValueInTableCol(taxAmountCol, textFeildForDlyTaxAmount(taxes[i].taxMasterId, dlyTaxAmount));
				appendValueInTableCol(taxAmountCol, dlyPerctaxTextFeild(taxes[i].taxMasterId, taxes[i].taxAmount, taxes[i].isTaxPercentage));
				appendValueInTableCol(taxAmountCol, hiddenTextFeildForDlyTaxAmount());
			}
		}
	}
	
	/*End*/
	
	/*Code started for Grand Total amount*/
	
	var grandTotalAmountRow			= createRowInTable('', '', '');
	
	var grandTotalLabelCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
	var grandTotalValueCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
	
	appendValueInTableCol(grandTotalLabelCol, '<b> Grand Total </b>');
	appendValueInTableCol(grandTotalValueCol, textFeildForDlyGrandTotal(wayBill.grandTotal));
	
	appendRowInTable('deliveryChargesRowToEdit', grandTotalAmountRow);
	
	/*End*/
	
	/*Code started for ST Paid by*/
	
	if(jsondata.allowToEditDeliverySTPaidBy) {
		var stPaidByRow				= createRowInTable('', '', '');
		
		appendRowInTable('deliveryChargesRowToEdit', stPaidByRow);
		
		var deliverySTPaidByCol		= createColumnInRow(stPaidByRow, '', '', '', '', '', '2');
		setDeliverySTPaidBy(deliverySTPaidByCol);
	}
	
	/*End*/
	
}

function inputForWayBillDlyCharges(chargeId, chargeAmount) {
	var isReadOnly		= false;

	if(typeof creditWayBillTxn != 'undefined') {
		isReadOnly		= true;
	}

	if(typeof hideChargesIdsHM != 'undefined' && hideChargesIdsHM != null) {
		if(hideChargesIdsHM.hasOwnProperty(chargeId)) {
			isReadOnly	= true;
		}
	}
	
	var wayBillChargesFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'wayBillDlyCharge_' + chargeId,
		name			: 'wayBillDlyCharge_' + chargeId,
		class			: 'form-control',
		value			: chargeAmount,
		onblur			: "clearIfNotNumeric(this,'0');calcDeliveryGrandTotal();",
		onkeyup			: 'calcDeliveryGrandTotal();',
		onkeypress		: 'return noNumbers(event);',
		onfocus			: "this.select(); if(this.value=='0')this.value=''; getprevnextCharge(this);",
		maxlength		: 8,
		style			: 'text-align: right;',
		readonly		: isReadOnly
	});

	return wayBillChargesFeild;
}

function discountedDlyAmountTotalTextFeild(deliveryChargesSum) {
	var discountedDlyAmountTotalTextFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'discounteddlyAmountTotal',
		name			: 'discounteddlyAmountTotal',
		class			: 'form-control',
		value			: deliveryChargesSum,
		readonly		: 'readonly',
		onblur			: 'clearIfNotNumeric(this, "' + deliveryChargesSum + '");',
		onkeypress		: 'return noNumbers(event);',
		maxlength		: 8,
		style			: 'text-align: right;'
	});

	return discountedDlyAmountTotalTextFeild;
}

function textFeildForTxtDelDisc(deliveryDiscount) {
	var isReadOnly		= false;
	
	if(!allowToEditDeliveryDiscount) {
		isReadOnly		= true;
	} else if(typeof creditWayBillTxn != 'undefined') {
		isReadOnly		= true;
	}
	
	var textFeildForTxtDelDisc	= $("<input/>", { 
		type			: 'text', 
		id				: 'txtDelDisc',
		name			: 'txtDelDisc',
		class			: 'form-control',
		value			: deliveryDiscount,
		onkeyup			: 'calcDeliveryGrandTotal();',
		onblur			: "if(this.value=='')this.value='0'; clearIfNotNumeric(this,'0'); calcDeliveryGrandTotal(); chkDiscount();",
		onfocus			: "if(this.value=='')this.value='0';",
		onkeypress		: 'return noNumbers(event);',
		maxlength		: 5,
		size			: 6,
		style			: 'text-align: right;',
		readonly		: isReadOnly
	});

	return textFeildForTxtDelDisc;
}

function dlyDiscountTextFeild(deliveryDiscount) {
	
	var dlyDiscountTextFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'dlyDiscount',
		name			: 'dlyDiscount',
		class			: 'form-control',
		value			: deliveryDiscount,
		style			: 'text-align: right;'
	});

	return dlyDiscountTextFeild;
}

function textFeildForDlyTaxAmount(taxMasterId, dlyTaxAmount) {
	var textFeildForDlyTaxAmount	= $("<input/>", { 
		type			: 'text', 
		id				: 'wayBillTaxesDly_' + taxMasterId,
		name			: 'wayBillTaxesDly_' + taxMasterId,
		value			: Math.round(dlyTaxAmount),
		class			: 'form-control',
		readonly		: 'readonly',
		onblur			: "clearIfNotNumeric(this,'0');",
		onkeypress		: 'return noNumbers(event);',
		onfocus			: "this.select(); if(this.value=='0')this.value='';",
		maxlength		: 8,
		style			: 'text-align: right;'
	});
	
	return textFeildForDlyTaxAmount;
}

function dlyPerctaxTextFeild(taxMasterId, taxAmount, isTaxPercentage) {
	var isChecked		= false;
	
	if(isTaxPercentage) {
		isChecked		= true;
	}
	
	var dlyPerctaxTextFeild	= $("<input/>", { 
		type			: 'checkbox', 
		id				: 'dlyperctax_' + taxMasterId,
		class			: 'form-control',
		name			: 'dlyperctax_' + taxMasterId,
		style			: "display: none;",
		value			: taxAmount,
		checked			: isChecked
	});

	return dlyPerctaxTextFeild;
}

function hiddenTextFeildForDlyTaxAmount() {
	var hiddenTextFeildForDlyTaxAmount	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'deliveryTaxAmount',
		class			: 'form-control',
		name			: 'deliveryTaxAmount',
		value			: '0'
	});
	
	return hiddenTextFeildForDlyTaxAmount;
}

function textFeildForDlyGrandTotal(grandTotal) {
	var textFeildForDlyGrandTotal	= $("<input/>", { 
		type			: 'text', 
		id				: 'deliveryGrandTotal',
		name			: 'deliveryGrandTotal',
		class			: 'form-control',
		value			: Math.round(grandTotal),
		readonly		: 'readonly',
		onblur			: "clearIfNotNumeric(this,'"+ Math.round(grandTotal) +"');",
		onkeypress		: 'return noNumbers(event);',
		maxlength		: 8,
		style			: 'text-align: right;'
	});

	return textFeildForDlyGrandTotal;
}


function setDeliverySTPaidBy(deliverySTPaidByCol) {

	$('#deliverySTPaidBy').find('option').remove().end();
	
	var combo = $("<select></select>").attr("id", 'deliverySTPaidBy').attr("name", 'deliverySTPaidBy').attr("onchange", 'calcDeliveryGrandTotal();').attr("onkeyup", 'calcDeliveryGrandTotal();').attr("onkeypress", 'if(event.altKey==1){return false;}').attr("class", 'form-control width-80px');

	appendValueInTableCol(deliverySTPaidByCol, combo);

	createOptionForCreditorDeliverySTPaidBy();
}

function createOptionForCreditorDeliverySTPaidBy() {
	if(typeof deliveryTaxBy != 'undefined') {
		$('#deliverySTPaidBy').append('<option value="0" id="0">' + '- ST PaidBy - ' + '</option>');
		
		if(deliveryTaxBy > 0) {
			if(deliveryTaxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID) {
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			} else if(deliveryTaxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID) {
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			} else if(deliveryTaxBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID) {
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			}
		} else {
			$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
			$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
			$('#deliverySTPaidBy').append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
		}
	} 
}

function setDiscountTypesDly(discountTypesDlyColumn) {
	$('#discountTypesDly').find('option').remove().end();
	
	var combo = $("<select></select>").attr("id", 'discountTypesDly').attr("name", 'discountTypesDly').attr("onchange", 'removeError("discountTypesDly");toogleElement("basicError","none");').attr("class", 'form-control width-80px');
	
	appendValueInTableCol(discountTypesDlyColumn, combo);
	
	createOptionForDlyDiscountType();
}

function createOptionForDlyDiscountType() {
	var dlyDisType		= 0;
	
	if(typeof jsondata.dlyDisType != 'undefined') {
		dlyDisType		= jsondata.dlyDisType;
	}
	
	$('#discountTypesDly').append('<option value="' + 0 + '" id="' + 0 + '">' + '--Select--' + '</option>');
	
	if(typeof discountTypes != 'undefined') {
		for(var i = 0; i < discountTypes.length; i++) {
			var discountType		= discountTypes[i];
			
			var discountTypeId		= discountType.discountMasterId;
			var discountName		= discountType.discountName;
			
			if(dlyDisType == discountTypeId) {
				$('#discountTypesDly').append('<option value="' + discountTypeId + '" id="' + discountTypeId + '" selected="selected">' + discountName + '</option>');
			} else {
				$('#discountTypesDly').append('<option value="' + discountTypeId + '" id="' + discountTypeId + '">' + discountName + '</option>');
			}
		}
	}
}