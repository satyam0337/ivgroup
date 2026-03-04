/**
 * 
 */

function setDataToEditWeightFreightRateAndArticleDetials() {
	if(jsondata.ChargeTypeId == CHARGETYPE_ID_WEIGHT) {
		if(jsondata.isWeightFreightRateAllowToEdit) {
			setDataToEditWeightFreightRate();
		}
	} else if(jsondata.ChargeTypeId == CHARGETYPE_ID_QUANTITY && jsondata.isConsignmentDetailsAllowToEdit)
		setDataToEditConsignmentDetails();
}

function setDataToEditWeightFreightRate() {
	$('#weightRateTable').switchClass('hide', 'show');
	$('#actualWeight').val(jsondata.ActualWeight);
	$('#chargeWeight').val(jsondata.ChargeWeight);
	$('#weightFreightRate').val(jsondata.WeightFreightRate);
	$('#preWeightFreightRate').val(jsondata.WeightFreightRate);
}

function setDataToEditConsignmentDetails() {
	$('#editLRAmount').switchClass('hide', 'show');
	
	if(typeof consignmentDetailsList != 'undefined') {
		let	 totalAmount	= 0;
		
		for(let i = 0; i < consignmentDetailsList.length; i++) {
			let consignmentDetails		= consignmentDetailsList[i];
			
			let packingTypeName			= consignmentDetails.packingTypeName;
			let saidToContain			= consignmentDetails.saidToContain;
			let quantity				= consignmentDetails.quantity;
			let amount					= consignmentDetails.amount;
			let consignmentDetailsId	= consignmentDetails.consignmentDetailsId;
			let packingTypeMasterId		= consignmentDetails.packingTypeMasterId;
			let consignmentGoodsId		= consignmentDetails.consignmentGoodsId;
			
			totalAmount					+= amount;
			
			let consignmentDetailsRow		= createRowInTable('', '', '');
			
			appendRowInTable('articleDetailsCol', consignmentDetailsRow);
			
			let packingTypeNameCol			= createColumnInRow(consignmentDetailsRow, '', '', '', '', '', '');
			let saidToContainNameCol		= createColumnInRow(consignmentDetailsRow, '', '', '', '', '', '');
			let quantityCol					= createColumnInRow(consignmentDetailsRow, '', '', '', '', '', '');
			let amountCol					= createColumnInRow(consignmentDetailsRow, '', '', '', '', '', '');
			
			appendValueInTableCol(packingTypeNameCol, packingTypeName);
			appendValueInTableCol(saidToContainNameCol, saidToContain);
			appendValueInTableCol(saidToContainNameCol, textFeildForSaidToContain(i, saidToContain));
			
			appendValueInTableCol(quantityCol, quantity);
			appendValueInTableCol(quantityCol, textFeildForQuantity(i, quantity));
			
			appendValueInTableCol(amountCol, textFeildForNewqtyAmt(i, amount));
			appendValueInTableCol(amountCol, textFeildForConsignmentDetailsId(i, consignmentDetailsId));
			appendValueInTableCol(amountCol, textFeildForPackingTypeMasterId(i, packingTypeMasterId));
			appendValueInTableCol(amountCol, textFeildForConsignmentGoodsId(i, consignmentGoodsId));
		}
		
		let totalAmountRow					= createRowInTable('', 'hide', '');
		
		let totalAmountCol					= createColumnInRow(totalAmountRow, '', '', '', '', '', '');
		
		appendValueInTableCol(totalAmountCol, textFeildForTotalQtyAmt(totalAmount));
		
		appendRowInTable('articleDetailsCol', totalAmountRow);
	}
}

function textFeildForSaidToContain(index, saidToContain) {
	let textFeildForSaidToContain	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'saidToContain_' + [index + 1],
		name			: 'saidToContain_' + [index + 1],
		class			: 'form-control',
		value			: saidToContain,
		'data-tooltip'	: saidToContain
	});

	return textFeildForSaidToContain;
}

function textFeildForQuantity(index, quantity) {
	let textFeildForQuantity	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'qty_' + [index + 1],
		name			: 'qty_' + [index + 1],
		class			: 'form-control',
		value			: quantity
	});

	return textFeildForQuantity;
}

function textFeildForConsignmentDetailsId(index, consignmentDetailsId) {
	let textFeildForConsignmentDetailsId	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'consignmentDetailsId_' + [index + 1],
		name			: 'consignmentDetailsId_' + [index + 1],
		class			: 'form-control',
		value			: consignmentDetailsId
	});

	return textFeildForConsignmentDetailsId;
}

function textFeildForPackingTypeMasterId(index, packingTypeMasterId) {
	let textFeildForPackingTypeMasterId	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'packingType_' + [index + 1],
		name			: 'packingType_' + [index + 1],
		class			: 'form-control',
		value			: packingTypeMasterId
	});

	return textFeildForPackingTypeMasterId;
}

function textFeildForNewqtyAmt(index, amount) {
	let textFeildForNewqtyAmt	= $("<input/>", { 
		type			: 'text', 
		id				: 'newqtyAmt_' + [index + 1],
		name			: 'newqtyAmt_' + [index + 1],
		class			: 'form-control',
		value			: Math.round(amount),
		onkeyup			: 'calculateTotalAmountAfterEditConsignmentAmount();',
		onkeypress		: 'calculateTotalAmountAfterEditConsignmentAmount();return validateFloatKeyPress(event,this);',
		'data-tooltip'	: 'Qty Amount'
	});

	return textFeildForNewqtyAmt;
}

function textFeildForConsignmentGoodsId(index, consignmentGoodsId) {
	let textFeildForConsignmentGoodsId	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'consignmentGoodsId_' + [index + 1],
		name			: 'consignmentGoodsId_' + [index + 1],
		class			: 'form-control',
		value			: consignmentGoodsId
	});

	return textFeildForConsignmentGoodsId;
}

function textFeildForTotalQtyAmt(totalAmount) {
	let textFeildForTotalQtyAmt	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'totalQtyAmt',
		name			: 'totalQtyAmt',
		class			: 'form-control',
		value			: Math.round(totalAmount)
	});

	return textFeildForTotalQtyAmt;
}

function setChargeTypeWiseChargesAfterApplyRate() {
	if(jsondata.ChargeTypeId == CHARGETYPE_ID_WEIGHT) {
		$('#weightFreightRate').val(weightFreightRate);
	} else if(jsondata.ChargeTypeId == CHARGETYPE_ID_QUANTITY) {
		if(typeof consignmentDetailsList != 'undefined') {
			for(let i = 0; i < consignmentDetailsList.length; i++) {
				let consignmentDetails		= consignmentDetailsList[i];
				let packingTypeMasterId		= consignmentDetails.packingTypeMasterId;
				let consignmentGoodsId		= consignmentDetails.consignmentGoodsId;
				
				if(totalQuantityFreightAmt >= minimumRateConfigValue && totalPreConsignmentAmount >= minimumRateConfigValue) {
					if(typeof qtyTypeWiseRateHM != 'undefined') {
						if(qtyTypeWiseRateHM.hasOwnProperty(packingTypeMasterId + "_" + consignmentGoodsId))
							$('#newqtyAmt_' + [i + 1]).val(qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]);
						else
							$('#newqtyAmt_' + [i + 1]).val(0);
					}
				} else if(totalPreConsignmentAmount > minimumRateConfigValue)
					$('#newqtyAmt_' + [i + 1]).val(0);
			}
		}
	}
}