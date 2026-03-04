/**
 * 
 */
 var newWayBillTaxes 	= null;
 var discountInPercent	= 0;
 
function setWayBillBookingChargesData(jsondata) {
	let allowToEditAgentcommission	= jsondata.allowToEditAgentcommission;
	let wayBill						= jsondata.wayBill;
	let bookingCharges				= jsondata.bookingCharges;
	let wayBillBookingChargesColl	= jsondata.wayBillBookingChargesColl;
	let taxes						= jsondata.taxes;
	discountInPercent			= jsondata.discountInPercent;
	let groupConfig					= jsondata.groupConfig;
	disableChargesForSpecificBranch	= groupConfig.disableChargesForSpecificBranch;	
	let	allowSpecificChargeShow			= groupConfig.AllowSpecificChargeShow;	
	let	enableAllChargesForGroupAdmin	= groupConfig.enableAllChargesForGroupAdmin;
	let wayBillTypeChargeIdToShowChargeArr 	= new Array();
	let hideChargeIdArray				= (groupConfig.hideChargesIds).split(",").map(Number);
	let disableChargeIdArray			= (groupConfig.disableChargeIds).split(",").map(Number);
 	let	branchIdArray					= (groupConfig.bracnhIdsForDisableCharges).split(",").map(Number);
	let hideChargesIdsFromLrRateArray	= (editLRRateProperties.HideChargesIds).split(",").map(Number);
	let	applyCgstAndSgst			= false;
	let checkSrcDestBranchStateId	= true;
	let wayBillBkgTaxTanHm			= jsondata.wayBillBkgTaxTan;
	newWayBillTaxes						= jsondata.taxes;
	let enableChargeIdArray			= (editLRRateProperties.chargesToEnableAfterReceive).split(",").map(Number);
	
	if(allowSpecificChargeShow)
		wayBillTypeChargeIdToShowChargeArr 	= (groupConfig.WayBillTypeChargeIdToShowCharge).split(",");
	
	let freightAmnt	= 0;
	let loadingAmnt	= 0;
	let doorDlyAmn	= 0;

	/*Code started for Charges */
	for(const element of bookingCharges) {
		let	wbChrg			= null;
		let chargeAmount	= 0;
		let chargeRemark	= '';

		let chargeTypeModel			= element;

		let chargeId				= chargeTypeModel.chargeTypeMasterId;
		let chargeName				= chargeTypeModel.displayName;
		
		if(typeof wayBillBookingChargesColl != 'undefined' && wayBillBookingChargesColl.hasOwnProperty(chargeId))
			wbChrg			= wayBillBookingChargesColl[chargeId];

		let	chargeRow		= createRowInTable('wayBillChargeRow_' + chargeId, '', '');

		appendRowInTable('chargesRowToEdit', chargeRow);

		let chargeNameCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
		let chargeValueCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');

		if(editLRRateProperties.wayBillChargeWiseRemarkNeeded)
			var chargeRemarkCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');

		createLabel(chargeNameCol, 'label' + chargeId, chargeName, 'width:auto', 'width-100px', 'Charges');

		if(wbChrg != null) {
			if (allowRateInDecimal)
				chargeAmount		= wbChrg.wayBillBookingChargeChargeAmount;
			else
				chargeAmount		= Math.round(wbChrg.wayBillBookingChargeChargeAmount);
			
			chargeRemark			= wbChrg.wayBillBookingChargeRemark;
			
			if(chargeId == FREIGHT) freightAmnt = wbChrg.wayBillBookingChargeChargeAmount;
			if(chargeId == LOADING) loadingAmnt = wbChrg.wayBillBookingChargeChargeAmount;
			if(chargeId == DOOR_DLY_BOOKING) doorDlyAmn = wbChrg.wayBillBookingChargeChargeAmount;
		}
		
		appendValueInTableCol(chargeNameCol, inputForActualChargeAmount(chargeId, chargeAmount));
		appendValueInTableCol(chargeValueCol, inputForWayBillCharges(chargeId, chargeAmount, jsondata, chargeName));
		
		if(groupConfiguration.applyIncludedTax) {
			let  chargeObj	= inputHiddenWayBillCharges(chargeId, chargeName)
			
			if(chargeObj != null)
				appendValueInTableCol(chargeValueCol, chargeObj);

			$('#wayBillCharge_' + FREIGHT).keyup(function(){
				let frtAmount	= Number($('#wayBillCharge_1').val());

				$('#wayBillChargeHidden_' + FREIGHT).val(frtAmount);
			});
		}
				
		if(groupConfiguration.makeDoorDlyChargesEditable) {
			let amount = freightAmnt + loadingAmnt;
			
			$('#wayBillCharge_' + DOOR_DLY_BOOKING).on('keydown blur', function(event) {
				if (event.type === 'blur' || event.key === "Enter" || event.key === "Tab") {
					let doorDlyAmount 	= Number($(this).val());
					let minDoorDlyAmnt 	= (amount * Number(groupConfiguration.percentageToCalculateDoorDlyChargeOnFreightForBooking) / 100);

					if(doorDlyAmount >= minDoorDlyAmnt) 
						$('#wayBillCharge_' + DOOR_DLY_BOOKING).val(doorDlyAmount);
					else
						$('#wayBillCharge_' + DOOR_DLY_BOOKING).val(doorDlyAmn);
				}
			});
		}

		if(editLRRateProperties.wayBillChargeWiseRemarkNeeded) {
			let chargeIdList 		= (editLRRateProperties.waybillChargeMasterIdsForRemark).split(',');

			if(isValueExistInArray(chargeIdList, chargeId)) {
				appendValueInTableCol(chargeRemarkCol, inputForWayBillChargesRemark(chargeId, chargeRemark, chargeName));
				
				if(chargeAmount > 0)
					$('#wayBillChargeRemark_' + chargeId).attr('readonly', false);
			}
		}

		if(editLRRateProperties.disableChargesExceptGroupAdmin && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN && isValueExistInArray(hideChargesIdsFromLrRateArray, chargeId)
		|| chargeId == REIMBURSEMENT_OF_INSURANCE_PREMIUM
		|| jsondata.enableLimitedChargesToEditAfterReceive && !isValueExistInArray(enableChargeIdArray, chargeId)
		|| ((enableAllChargesForGroupAdmin && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN || !enableAllChargesForGroupAdmin)
			&& (isValueExistInArray(hideChargeIdArray, chargeId) || groupConfig.setSubRegionWiseGroupLevelFixCharge && isSubregionForGroupLevelFixCharge() && isValueExistInArray(disableChargeIdArray, chargeId))))
				$('#wayBillCharge_' + chargeId).attr('readonly', true);
		
		if(disableChargesForSpecificBranch 
				&& !(isValueExistInArray(branchIdArray, executive.branchId))
				&& isValueExistInArray(disableChargeIdArray, chargeId)) {
			$('#wayBillChargeRow_' + chargeId).css("display", "none");
		}
	}
	
	/*this is the hidecharge from waybillType */
	if(allowSpecificChargeShow && wayBillTypeChargeIdToShowChargeArr != null && wayBillTypeChargeIdToShowChargeArr.length > 0) {
		for (const element of wayBillTypeChargeIdToShowChargeArr) {
			let wayBillTypeChargeIdArr 	= (element).split('_');

			if($('#wayBillTypeId').val() != wayBillTypeChargeIdArr[0])
				$('#wayBillChargeRow_' + wayBillTypeChargeIdArr[1]).css("display", "none");
		}
	}
	
	let otherChargesList	= jsondata.otherChargesList;
	
	if(jsondata.hideBookingChargesFlag && otherChargesList != undefined) {
		for(let charge of otherChargesList)
			$('#wayBillChargeRow_' + charge).css("display", "none");
	}
	
	setNonEditableDocCharge();
	
	/*End*/

	/*Code started for Discount Amount*/
	let bookingDiscount		= 0;

	if(wayBill != null && wayBill.wayBillIsDiscountPercent)
		bookingDiscount	= Math.round(wayBill.bookingDiscountPercentage);
	else if(wayBill != null)
		bookingDiscount	= Math.round(wayBill.bookingDiscount);

	if(!editLRRateProperties.allowToEditDiscountAmount && wayBill.bookingDiscount > 0) {
		let discountAmountRow			= createRowInTable('', '', '');

		appendRowInTable('chargesRowToEdit', discountAmountRow);

		let discountLableCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');
		let discountAmountCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');

		appendValueInTableCol(discountLableCol, '<b>Discount</b>');
		appendValueInTableCol(discountAmountCol, bkgDiscountTextFeild(bookingDiscount));
		appendValueInTableCol(discountAmountCol, txtBkgDiscTextFeild(bookingDiscount));

		let discountTypeRow				= createRowInTable('', '', '');

		appendRowInTable('chargesRowToEdit', discountTypeRow);

		let discountTypeLableCol		= createColumnInRow(discountTypeRow, '', '', '', '', '', '');
		let discountTypesBkgColumn		= createColumnInRow(discountTypeRow, '', '', '', '', '', '');

		appendValueInTableCol(discountTypeLableCol, '<b>Discount Type</b>');
		setDiscountTypesBkg(discountTypesBkgColumn);
	}

	let totalDiscountAmountRow			= createRowInTable('', '', '');

	appendRowInTable('chargesRowToEdit', totalDiscountAmountRow);

	let totalDiscountLableCol			= createColumnInRow(totalDiscountAmountRow, '', '', '', '', '', '');
	let totalDiscountAmountCol			= createColumnInRow(totalDiscountAmountRow, '', '', '', '', '', '');

	appendValueInTableCol(totalDiscountLableCol, '<b>Total</b>');
	
	if(wayBill != null)
		appendValueInTableCol(totalDiscountAmountCol, totalDiscountedAmountTextFeild(wayBill.bookingChargesSum));
	else
		appendValueInTableCol(totalDiscountAmountCol, totalDiscountedAmountTextFeild(0));

	if(typeof wayBillBookingChargesColl != 'undefined' && wayBillBookingChargesColl.hasOwnProperty(FREIGHT)) {
		wbChrg			= wayBillBookingChargesColl[FREIGHT];
	}
	
	if(editLRRateProperties.allowToEditDiscountAmount) {
		let discountAmountRow			= createRowInTable('', '', '');

		appendRowInTable('chargesRowToEdit', discountAmountRow);

		let discountLableCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');
		let discountAmountCol			= createColumnInRow(discountAmountRow, '', '', '', '', '', '');

		appendValueInTableCol(discountLableCol, '<b> Discount <br> Disc in %</b>');
		appendValueInTableCol(discountLableCol, discountPercentTextFeild(wayBill.wayBillIsDiscountPercent));
		appendValueInTableCol(discountAmountCol, discountTextFeild(bookingDiscount, wayBill.bookingChargesSum));
	}

	/*End*/

	/*Code started for Tax amount*/
	if(typeof taxes != 'undefined' && taxes != null) {
		let destStateId	= 0;

		if(typeof jsondata.destBranch != 'undefined')
			destStateId		= jsondata.destBranch.branchAddressStateId;
		
		let consigneeStateCode 	= 0;
		let consignorGstN		= jsondata.consignor.gstn;
		let consigneeGstN		= jsondata.consignee.gstn;
		let stateCodeNew		= null;

		if(!jsondata.bookedBeforeGST) {
			if((consignorGstN != null && (consignorGstN != undefined && consignorGstN != 'undefined')))
				stateCodeNew	= consignorGstN.slice(0, 2);

			if(consigneeGstN != null && (consigneeGstN != undefined && consigneeGstN != 'undefined'))
				consigneeStateCode		= consigneeGstN.slice(0, 2);
			
			if(groupConfiguration.applyOnlyCgstSgstForPaidLrs && $('#wayBillTypeId').val() == WAYBILL_TYPE_PAID)
				applyCgstAndSgst = true;
			
			if(groupConfiguration.applyCgstSgstOnBillingPartyState && $('#wayBillTypeId').val() == WAYBILL_TYPE_CREDIT) {
				if(stateCodeNew == jsondata.sourceBranch.stateGSTCode)
					applyCgstAndSgst = true;
				else
					checkSrcDestBranchStateId= false;
			}
			
			if(groupConfiguration.showGstType) {
				for (const element of taxes) {
					makeTaxesFeilds(element);
				}
			 } else if(groupConfiguration.gstCalculateOnPartyAndBranchStateCode) {
				if(groupConfiguration.validatePartyGstnWithGstnCodeFromDb){
					for(const element of taxes) {
						if (wayBillBkgTaxTanHm === undefined || wayBillBkgTaxTanHm[element.taxMasterId] !== undefined)
							makeTaxesFeilds(element);
					}
				} else if(((Number(groupConfiguration.PartyTypeToGstCalculateOnPartyAndBranchStateCode) == 1 || $('#wayBillType').val() == WAYBILL_TYPE_PAID || $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
				&& (consignorGstN == null || (stateCodeNew == jsondata.sourceBranch.stateGSTCode)))
				|| ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY
						&& (consigneeStateCode == 0 || consigneeStateCode == jsondata.sourceBranch.stateGSTCode))) {
					for(const element of taxes) {
						if(element.taxMasterId == SGST_MASTER_ID || element.taxMasterId == CGST_MASTER_ID)
							makeTaxesFeilds(element);
					}
				} else {
					for(const element of taxes) {
						if(element.taxMasterId == IGST_MASTER_ID)
							makeTaxesFeilds(element);
					}
				}
			} else if((jsondata.sourceBranch.branchAddressStateId == destStateId && checkSrcDestBranchStateId) || applyCgstAndSgst) {
				for(const element of taxes) {
					if(element.taxMasterId == SGST_MASTER_ID || element.taxMasterId == CGST_MASTER_ID)
						makeTaxesFeilds(element);
				}
			} else {
				for(const element of taxes) {
					if(element.taxMasterId == IGST_MASTER_ID)
						makeTaxesFeilds(element);
				}
			}
		}
	}

	/*End*/

	/*Code started for agent commission*/
	
	if(allowToEditAgentcommission) {
		let agentCommissionRow			= createRowInTable('', '', '');

		let agentCommissionLabelCol		= createColumnInRow(agentCommissionRow, '', '', '', '', '', '');
		let agentCommissionValueCol		= createColumnInRow(agentCommissionRow, '', '', '', '', '', '');

		appendValueInTableCol(agentCommissionLabelCol, '<strong>Commission</strong>');
		appendValueInTableCol(agentCommissionValueCol, textFeildForAgentCommission(wayBill.wayBillAgentCommission));

		appendRowInTable('chargesRowToEdit', agentCommissionRow);
	}

	/*End*/

	/*Code started for Grand Total amount*/

	let grandTotalAmountRow			= createRowInTable('', '', '');

	let grandTotalLabelCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');
	let grandTotalValueCol			= createColumnInRow(grandTotalAmountRow, '', '', '', '', '', '');

	appendValueInTableCol(grandTotalLabelCol, '<b> Grand Total </b>');

	if(wayBill != null) {
		appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(wayBill.wayBillGrandTotal));
		appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(wayBill.wayBillGrandTotal));
	} else {
		appendValueInTableCol(grandTotalLabelCol, textFeildForPrevGrandTotal(0));
		appendValueInTableCol(grandTotalValueCol, textFeildForGrandTotal(0));
	}
	
	appendValueInTableCol(grandTotalValueCol, textFeildForBookingTaxAmount());

	appendRowInTable('chargesRowToEdit', grandTotalAmountRow);

	/*End*/
	
	/*Code started for TDS amount*/
	
	if(editLRRateProperties.allowToEditTdsAmount && $('#wayBillTypeId').val() == WAYBILL_TYPE_PAID) {
		let tdsAmountRow	= createRowInTable('', '', '');

		let tdsLabelCol		= createColumnInRow(tdsAmountRow, '', '', '', '', '', '');
		let tdsValueCol		= createColumnInRow(tdsAmountRow, '', '', '', '', '', '');

		appendValueInTableCol(tdsLabelCol, '<strong>TDS Amount</strong>');
		appendValueInTableCol(tdsValueCol, textFeildForTDSAmount(wayBill.tdsAmount));

		appendRowInTable('chargesRowToEdit', tdsAmountRow);
	}

	/*End*/

	/*Code started for ST Paid by*/
	if(editLRRateProperties.isTaxCalculate) {
		if(typeof taxes != 'undefined' && taxes != null) {
			let stPaidByRow				= createRowInTable('', '', '');
			
			appendRowInTable('chargesRowToEdit', stPaidByRow);
			
			let stPaidByCol					= createColumnInRow(stPaidByRow, '', '', '', '', '', '2');
			setSTPaidBy(stPaidByCol, jsondata);
		}
	}
	/*End*/
	
	/*Code started for GST Type*/
	if(groupConfiguration.showGstType) {
		let gstTypeRow		= createRowInTable('', '', '');
			
		appendRowInTable('chargesRowToEdit', gstTypeRow);
			
		let gstTypeCol		= createColumnInRow(gstTypeRow, '', '', '', '', '', '2');
		setGSTType(gstTypeCol, jsondata.isIGSTType);
	}
	/*End*/

	/*Code started for Delivery To*/

	if(editLRRateProperties.allowToEditDeliveryTo) {
		let deliveryToRow			= createRowInTable('', '', '');

		appendRowInTable('chargesRowToEdit', deliveryToRow);

		let deliveryToCol				= createColumnInRow(deliveryToRow, '', '', '', '', '', '2');
		setDeliveryTo(deliveryToCol);
	}

	/*End*/

	/*Code started for Remark*/

	if(editLRRateProperties.allowToInsertRemark) {
		let remarkRow					= createRowInTable('', '', '');
		let remarkRowCol				= createColumnInRow(remarkRow, '', '', '', '', '', '2');

		appendValueInTableCol(remarkRowCol, textFeildForRemark());

		appendRowInTable('chargesRowToEdit', remarkRow);
	}
	/*End*/
}

function makeTaxesFeilds(element) {
	let taxAmount 		= 0.00;

	if(typeof wayBillBkgTaxTan != 'undefined') {
		if(wayBillBkgTaxTan.hasOwnProperty(element.taxMasterId)) {
			let wayBillTaxTxn	= wayBillBkgTaxTan[element.taxMasterId];
			taxAmount			= wayBillTaxTxn.taxAmount;
		}
	}
	
	let taxDetailsRow			= createRowInTable('', '', '');

	appendRowInTable('chargesRowToEdit', taxDetailsRow);

	let taxNameLabelCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');
	let taxAmountCol			= createColumnInRow(taxDetailsRow, '', '', '', '', '', '');

	let percentSymble			= "";

	if(element.isTaxPercentage)
		percentSymble			= '<b>' + element.taxAmount +' %</b>';

	appendValueInTableCol(taxNameLabelCol, '<b>' + element.taxName + '</b> ');
	appendValueInTableCol(taxNameLabelCol, percentSymble);
	appendValueInTableCol(taxAmountCol, textFeildForTaxAmount(element.taxMasterId, taxAmount, element.taxName));
	appendValueInTableCol(taxAmountCol, perctaxTextFeild(element.taxMasterId, element.taxAmount, element.isTaxPercentage));
}

function inputForWayBillChargesRemark(chargeId, chargeRemark, chargeName) {
	let onkeyupVal		= '';
	let isReadOnly		= true;
	onkeyupVal			= 'validateRemarkOnCharge(' + chargeId + ', "' + chargeName + '");';

	if(chargeRemark != "" && chargeRemark != undefined)
		isReadOnly	= false;

	let wayBillChargesRemarkFeild	= $("<input/>", { 
		type			: 'text',
		id				: 'wayBillChargeRemark_' + chargeId,
		name			: 'wayBillChargeRemark_' + chargeId,
		class			: 'form-control width-100px',
		value			: chargeRemark,
		readonly		: isReadOnly,
		onkeyup			: onkeyupVal,
		onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
		maxlength		: 250,
		style			: 'text-align: left; height: 30px;',
		'data-tooltip'	: chargeName + " Charge",
		placeholder		: chargeName + " Charge"
	});

	return wayBillChargesRemarkFeild;
}

function inputForActualChargeAmount(chargeId, chargeAmount) {
	let actualChargeAmountFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'actualChargeAmount' + chargeId,
		name			: 'actualChargeAmount' + chargeId,
		class			: 'form-control',
		value			: chargeAmount
	});

	return actualChargeAmountFeild;
}

function inputForWayBillCharges(chargeId, chargeAmount, jsondata, chargeName) {
	let onblurVal		= '';
	let onkeyupVal		= '';

	let onkeyPressVal;

	if (allowRateInDecimal && groupConfiguration.positiveValueOnlyInEditRate) 
		onkeyPressVal = 'return validateFloatKeyPress(event,this);';
	 else if (allowRateInDecimal) 
		onkeyPressVal = 'return validateFloatKeyPress(event,this);';
	 else if (groupConfiguration.positiveValueOnlyInEditRate) 
		onkeyPressVal = 'var k = (event.which)?event.which:event.keyCode; return (k==8 || (k>=48 && k<=57));';
	 else 
		onkeyPressVal = 'return noNumbers(event);';

	onblurVal		= "clearIfNotNumeric(this,'0');frieghtCantBeZero(this);calcGrandTotal();calcDeliveryGrandTotal();enableDeliveryTo(this);checkChargesRates(this);";
	onkeyupVal		= 'calcGrandTotal();calcDeliveryGrandTotal();enableDesableRemark(' + chargeId + ');if(event.which == 13){checkChargesRates(this);}';

	let wayBillChargesFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'wayBillCharge_' + chargeId,
		name			: 'wayBillCharge_' + chargeId,
		class			: 'form-control width-80px',
		value			: chargeAmount,
		onblur			: onblurVal,
		onkeyup			: onkeyupVal,
		onkeypress		: onkeyPressVal,
		onfocus			: "this.select(); if(this.value=='0')this.value=''; getprevnextCharge(this);",
		maxlength		: 8,
		style			: 'text-align: right; height: 30px;',
		'data-tooltip'	: chargeName
	});

	return wayBillChargesFeild;
}

function preFreightTextFeild(freightAmount) {
	let preFreightTextFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'preFreight',
		name			: 'preFreight',
		class			: 'form-control',
		value			: freightAmount
	});

	return preFreightTextFeild;
}

function discountPercentTextFeild(isDiscountPercent) {
	let isChecked		= false;

	if(isDiscountPercent) {
		isChecked		= true;
	}

	let discountPercentTextFeild	= $("<input/>", { 
		type			: 'checkbox', 
		id				: 'isDiscountPercent',
		name			: 'isDiscountPercent',
		class			: 'form-control',
		checked			: isChecked,
		onclick			: 'calcGrandTotal();calcDiscountLimit();',
		onchange		: 'calcGrandTotal();calcDiscountLimit();',
		'data-tooltip'	: 'Discount'
	});

	return discountPercentTextFeild;
}

function discountTextFeild(bookingDiscount, bookingChargesSum) {
	let discountTextFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'discount',
		name			: 'discount',
		class			: 'form-control',
		value			: bookingDiscount,
		style			: 'text-align: right;',
		onclick			: 'calcGrandTotal();',
		onkeyup			: 'calcGrandTotal();calcDiscountLimit();',
		onkeypress		: 'return noNumbers(event);',
		onblur			: "if(this.value=='')this.value='0';clearIfNotNumeric(this,'" + Math.round(bookingChargesSum) + "');calcDiscountLimit();",
		onfocus			: "if(this.value=='0')this.value='';",
		maxlength		: 5,
		'data-tooltip'	: 'Discount'
	});

	return discountTextFeild;
}

function txtBkgDiscTextFeild(bookingDiscount) {
	let txtBkgDiscTextFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'txtBkgDisc',
		name			: 'txtBkgDisc',
		class			: 'form-control',
		value			: bookingDiscount,
		style			: 'text-align: right;',
		onclick			: 'calcGrandtotal();',
		onkeyup			: 'calcGrandTotal();calcDeliveryGrandTotal();',
		onkeypress		: 'return noNumbers(event);',
		onblur			: "if(this.value=='')this.value='0';clearIfNotNumeric(this, '0');calcGrandTotal();calcDeliveryGrandTotal();",
		onfocus			: "if(this.value=='0')this.value='';",
		maxlength		: 5,
		'data-tooltip'	: 'Total Booking Discount'
	});

	return txtBkgDiscTextFeild;
}

function bkgDiscountTextFeild(bookingDiscount) {
	let isReadOnly		= false;

	if(!allowToEditBookingDiscount) {
		isReadOnly		= true;
	}

	let bkgDiscountTextFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'bkgDiscount',
		name			: 'bkgDiscount',
		class			: 'form-control',
		value			: bookingDiscount,
		readonly		: isReadOnly,
		'data-tooltip'	: 'Booking Discount'
	});

	return bkgDiscountTextFeild;
}

function totalDiscountedAmountTextFeild(bookingChargeSum) {
	if (!allowRateInDecimal) {
		bookingChargeSum	= Math.round(bookingChargeSum);
	}
	
	let totalDiscountedAmountTextFeild	= $("<input/>", { 
		type			: 'text', 
		id				: 'discountedAmountTotal',
		name			: 'discountedAmountTotal',
		class			: 'form-control',
		value			: bookingChargeSum,
		readonly		: 'readonly',
		onkeypress		: 'return noNumbers(event);',
		onblur			: "clearIfNotNumeric(this,'" + bookingChargeSum + "');",
		style			: 'text-align: right;',
		'data-tooltip'	: 'Total Amount'
	});

	return totalDiscountedAmountTextFeild;
}

function textFeildForTaxAmount(taxMasterId, taxAmount, taxName) {
	if(allowRateInDecimal)
		taxAmount	= taxAmount.toFixed(2);
	else
		taxAmount	= Math.round(taxAmount);
		
	console.log(taxAmount)
	
	let textFeildForTaxAmount	= $("<input/>", { 
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
		style			: 'text-align: right;',
		'data-tooltip'	: taxName
	});

	return textFeildForTaxAmount;
}

function perctaxTextFeild(taxMasterId, taxAmount, isTaxPercentage) {
	let isChecked		= false;

	if(isTaxPercentage) {
		isChecked		= true;
	}

	let perctaxTextFeild	= $("<input/>", { 
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

function textFeildForBookingTaxAmount() {
	let textFeildForBookingTaxAmount	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'bookingTaxAmount',
		name			: 'bookingTaxAmount',
		class			: 'form-control',
		value			: 0
	});

	return textFeildForBookingTaxAmount;
}

function textFeildForAgentCommission(agentCommission) {
	let textFeildForAgentCommission	= $("<input/>", { 
		type			: 'text', 
		id				: 'agentcommission',
		name			: 'agentcommission',
		class			: 'form-control',
		value			: Math.round(agentCommission),
		onkeyup			: 'calcGrandTotal();',
		onfocus			: "if(this.value=='0')this.value='';",
		onblur			: "if(this.value=='')this.value='0';calcGrandTotal();//ValidateCommission();",
		onkeypress		: 'return isValidDiscount(event,this);calcGrandTotal();',
		style			: 'text-align: right;',
		'data-tooltip'	: 'Commission'
	});

	return textFeildForAgentCommission;
}

function textFeildForRemark() {
	let textFeildForRemark	= $("<input/>", { 
		type			: 'text', 
		id				: 'remark',
		name			: 'remark',
		class			: 'form-control',
		value			: '',
		placeholder		: 'Remark',
		onkeyup			: '',
		onblur			: "toogleElement('basicError','none');",
		onkeypress		: "return noSpclChars(event);toogleElement('basicError','none'); removeError('remark');",
		maxlength		: 250,
		'data-tooltip'	: 'Remark'
	});

	return textFeildForRemark;
}

function textFeildForPrevGrandTotal(grandTotal) {
	let textFeildForPrevGrandTotal	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'prevGrandTotal',
		name			: 'prevGrandTotal',
		class			: 'form-control',
		value			: Math.round(grandTotal)
	});

	return textFeildForPrevGrandTotal;
}

function textFeildForGrandTotal(grandTotal) {
	let textFeildForGrandTotal	= $("<input/>", { 
		type			: 'text', 
		id				: 'grandTotal',
		name			: 'grandTotal',
		class			: 'form-control',
		value			: Math.round(grandTotal),
		readonly		: 'readonly',
		onblur			: "clearIfNotNumeric(this,'"+ Math.round(grandTotal) +"');",
		onkeypress		: 'return noNumbers(event);',
		onfocus			: "this.select(); if(this.value=='0')this.value='';",
		maxlength		: 8,
		style			: 'text-align: right;',
		'data-tooltip'	: 'Grand Total'
	});

	return textFeildForGrandTotal;
}

function textFeildForTDSAmount(tdsAmount) {
	let textFeildForTDSAmount	= $("<input/>", { 
		type			: 'text', 
		id				: 'tdsAmount',
		name			: 'tdsAmount',
		class			: 'form-control',
		value			: Math.round(tdsAmount),
		onfocus			: "if(this.value=='0')this.value='';",
		onblur			: "if(this.value=='')this.value='0';//ValidateCommission();",
		style			: 'text-align: right;',
		maxlength		: 8,
		'data-tooltip'	: 'TDS Amount'
	});

	return textFeildForTDSAmount;
}


function enableDesableRemark(chargeId) {

	if(!editLRRateProperties.wayBillChargeWiseRemarkNeeded) {
		return true;
	}
	
	let chargeValue = $('#wayBillCharge_' + chargeId).val();
	
	if(chargeValue != '' && Number(chargeValue) > 0){
		$('#wayBillChargeRemark_' + chargeId).attr('readonly', false);
		return false;
	} else{
		$('#wayBillChargeRemark_' + chargeId).val("");
		$('#wayBillChargeRemark_' + chargeId).attr('readonly', true);
		changeTextFieldColorWithoutFocus('wayBillChargeRemark_' + chargeId, '', '', 'green');
		return false;
	}
}

function setSTPaidBy(stPaidByCol, jsondata) {

	$('#STPaidBy').find('option').remove().end();

	let combo = $("<select></select>").attr("id", 'STPaidBy').attr("name", 'STPaidBy').attr("onchange", 'calcGrandTotal();').attr("onkeypress", 'if(event.altKey==1){return false;}').attr("class", 'form-control width-80px').attr('data-tooltip', 'ST Paid By');

	appendValueInTableCol(stPaidByCol, combo);
	createOptionForCreditorSTPaidBy();
}

function setGSTType(gstTypeCol, isIGSTType) {
	$('#gstType').find('option').remove().end();

	let combo = $("<select></select>").attr("id", 'gstType').attr("name", 'gstType').attr("onchange", 'changeGstType();').attr("class", 'form-control width-80px').attr('data-tooltip', 'GST Type');

	appendValueInTableCol(gstTypeCol, combo);
	createOptionForGSTType(isIGSTType);
}

function createOptionForGSTType(isIGSTType) {
	$('#gstType').append('<option value="0">-- Select Tax --</option>');
	$('#gstType').append('<option value="2">SGST-CGST</option>');
	$('#gstType').append('<option value="4">IGST</option>');
	
	if(jsondata.wayBillBkgTaxTan != undefined) {
		if(isIGSTType)
			$('#gstType').val(IGST_MASTER_ID);
		else
			$('#gstType').val(SGST_MASTER_ID);
	}
}

function createOptionForSTPaidBy() {
	$('#STPaidBy').append('<option value="' + 0 + '" id="' + 0 + '">' + '- ST PaidBy - ' + '</option>');
	
	if(groupConfiguration.showStPaidByConsignor)
		$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
	
	if(groupConfiguration.showStPaidByConsignee)
		$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
	
	if(!editLRRateProperties.hideStPaidByTransporter)
		$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
}

function createOptionForCreditorSTPaidBy() {
	let taxBy			= jsondata.TaxBy;
	let isPartyExempted	= jsondata.isPartyExempted;
	
	if(typeof taxBy != 'undefined') {
		$('#STPaidBy').append('<option value="' + 0 + '" id="' + 0 + '">' + '- ST PaidBy - ' + '</option>');

		if(taxBy > 0) {
			if(taxBy == TAX_PAID_BY_CONSINGOR_ID) {
				if(groupConfiguration.showStPaidByConsignor)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '" selected="selected">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				
				if(groupConfiguration.showStPaidByConsignee)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				
				if(!editLRRateProperties.hideStPaidByTransporter)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			} else if(taxBy == TAX_PAID_BY_CONSINGEE_ID) {
				if(groupConfiguration.showStPaidByConsignor)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				
				if(groupConfiguration.showStPaidByConsignee)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '" selected="selected">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				
				if(!editLRRateProperties.hideStPaidByTransporter)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			} else if(taxBy == TAX_PAID_BY_TRANSPORTER_ID) {
				if(groupConfiguration.showStPaidByConsignor)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				
				if(groupConfiguration.showStPaidByConsignee)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				
				if(!editLRRateProperties.hideStPaidByTransporter)
					$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '" selected="selected">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
			} else if(taxBy == TAX_PAID_BY_EXEMPTED_ID)
				$('#STPaidBy').append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
		} else if(isPartyExempted) {
			$('#STPaidBy').append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
			$('#STPaidBy').selectedIndex = TAX_PAID_BY_EXEMPTED_ID;
		} else if(!groupConfiguration.doNotCalculateGSTForEstimateLR || consignmentSummaryBillSelectionId != BOOKING_WITHOUT_BILL) {
			if(groupConfiguration.showStPaidByConsignor)
				$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');
				
			if(groupConfiguration.showStPaidByConsignee)
				$('#STPaidBy').append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
				
			if(!editLRRateProperties.hideStPaidByTransporter)
				$('#STPaidBy').append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
		}
	} 
}

function setDeliveryTo(deliveryToCol) {

	$('#DeliveryTo').find('option').remove().end();
	if(allowDeliveryToExpressBasedOnExpressCharge == true || allowDeliveryToExpressBasedOnExpressCharge == 'true'){
		var combo = $("<select></select>").attr("id", 'DeliveryTo').attr("name", 'DeliveryTo').attr("onchange", 'checkDoorDelivery(this);').attr("onkeydown", 'checkDoorDelivery(this);').attr("onkeypress", 'if(event.altKey==1){return false;}').attr("class", 'form-control width-80px').attr('data-tooltip', 'Delivery At');
	}else {
		var combo = $("<select></select>").attr("id", 'DeliveryTo').attr("name", 'DeliveryTo').attr("onchange", 'checkDoorDelivery(this);').attr("onkeydown", 'checkDoorDelivery(this);').attr("onkeypress", 'if(event.altKey==1){return false;}').attr("disabled", 'disabled').attr("class", 'form-control width-80px').attr('data-tooltip', 'Delivery At');
	}
	appendValueInTableCol(deliveryToCol, combo);

	createOptionForDeliveryTo();
}

function createOptionForDeliveryTo() {
	let DeliveryTo		= jsondata.DeliveryTo;

	if(typeof DeliveryTo != 'undefined' && DeliveryTo > 0) {
		if(DeliveryTo == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
			$('#DeliveryTo').append('<option value="' + DIRECT_DELIVERY_DIRECT_VASULI_ID + '" id="' + DIRECT_DELIVERY_DIRECT_VASULI_ID + '" selected="selected">' + DIRECT_DELIVERY_DIRECT_VASULI_NAME + '</option>');
		} else if(DeliveryTo == DELIVERY_TO_TRUCK_DELIVERY_ID) {
			$('#DeliveryTo').append('<option value="' + DELIVERY_TO_TRUCK_DELIVERY_ID + '" id="' + DELIVERY_TO_TRUCK_DELIVERY_ID + '" selected="selected">' + DELIVERY_TO_TRUCK_DELIVERY_NAME + '</option>');
		} else {
			for(const element of deliveryToArray) {
				if(element.deliveryAtId != DIRECT_DELIVERY_DIRECT_VASULI_ID && element.deliveryAtId != FROM_VEHICLE_ID) {
					if(DeliveryTo == element.deliveryAtId)
						$('#DeliveryTo').append('<option value=' + element.deliveryAtId + ' selected="selected">' + element.deliveryAtName + '</option>');
					else
						$('#DeliveryTo').append('<option value=' + element.deliveryAtId + '>' + element.deliveryAtName + '</option>');
				}
			}
		}
	}
}

function setDiscountTypesBkg(discountTypesBkgColumn) {
	$('#discountTypesBkg').find('option').remove().end();

	let combo = $("<select></select>").attr("id", 'discountTypesBkg').attr("name", 'discountTypesBkg').attr("onchange", 'removeError("discountTypesBkg");toogleElement("basicError","none");').attr("class", 'form-control width-80px').attr('data-tooltip', 'Discount Types Bkg');

	appendValueInTableCol(discountTypesBkgColumn, combo);

	createOptionForBkgDiscountType();
}

function createOptionForBkgDiscountType() {
	let bkgDisType		= 0;
	let discountTypes	= jsondata.discountTypes;

	if(typeof jsondata.bkgDisType != 'undefined') {
		bkgDisType		= jsondata.bkgDisType;
	}

	$('#discountTypesBkg').append('<option value="' + 0 + '" id="' + 0 + '">' + '--Select--' + '</option>');

	if(typeof discountTypes != 'undefined') {
		for(const element of discountTypes) {
			let discountType		= element;

			let discountTypeId		= discountType.discountMasterId;
			let discountName		= discountType.discountName;

			if(bkgDisType == discountTypeId) {
				$('#discountTypesBkg').append('<option value="' + discountTypeId + '" id="' + discountTypeId + '" selected="selected">' + discountName + '</option>');
			} else {
				$('#discountTypesBkg').append('<option value="' + discountTypeId + '" id="' + discountTypeId + '">' + discountName + '</option>');
			}
		}
	}
}

function getprevnextCharge(ele) {
	let ch 		= document.getElementById("results");
	let len 	= ch.getElementsByTagName("input").length;

	for(let i = 0; i < len; i++) {
		if(ch.getElementsByTagName("input")[i].name == ele.name) {
			if(ch.getElementsByTagName("input")[i] == null || i == 0) {
				prev 	= 'actualWeight';
			} else {
				prev	= ch.getElementsByTagName("input")[i - 1].name;
			}

			if(ch.getElementsByTagName("input")[i + 1] != null) {
				next	= ch.getElementsByTagName("input")[i + 1].name;
			} else {
				next 	= 'discount';
			}
		}
	}
}

function calcGrandTotal() {
	let amtTotal	 				= 0;
	let bookingDiscount 			= 0;
	let discountedAmountTotal     	= 0;
	
	let bookingCharges				= jsondata.bookingCharges;
	let wayBillBkgTaxTanHm			= jsondata.wayBillBkgTaxTan;
	
	for (const element of bookingCharges) {
		if ($('#wayBillCharge_' + element.chargeTypeMasterId).exists() && $('#wayBillCharge_' + element.chargeTypeMasterId).val() != '') {
			let chargeValue = allowRateInDecimal ? parseFloat($('#wayBillCharge_' + element.chargeTypeMasterId).val(), 10) : parseInt($('#wayBillCharge_' + element.chargeTypeMasterId).val(), 10);

			if(groupConfiguration.isAllowOperationTypeWiseChargesEffect) {
				if(element.operationType == OPERATION_TYPE_NUETRAL)
					chargeValue = 0;
				else if(element.operationType == CHARGE_OPERATION_TYPE_SUBTRACT)
					chargeValue = -Math.abs(chargeValue);
			} else if (element.operationType == CHARGE_OPERATION_TYPE_SUBTRACT)
				chargeValue = -Math.abs(chargeValue);
			
			amtTotal += chargeValue;
		}
	}

	if (allowRateInDecimal)
		$('#discountedAmountTotal').val(parseFloat(amtTotal.toFixed(2)));
	else 
		$('#discountedAmountTotal').val(Math.round(amtTotal.toFixed(2)));

	if($('#txtBkgDisc').val() != undefined) {
		bookingDiscount = $('#txtBkgDisc').val();
		bookingDiscount = Number(bookingDiscount);
	}
	
	discountedAmountTotal	= amtTotal.toFixed(2) - bookingDiscount.toFixed(2);
	
	if(editLRRateProperties.allowToEditDiscountAmount) {
		let discount 			= amtTotal * $('#discount').val() / 100;
		
		if($('#isDiscountPercent').is(":checked"))
			discountedAmount 	= parseInt(amtTotal) - parseInt(Math.round(discount));
		else if($('#discount').val() != '')
			discountedAmount 	= parseInt(amtTotal) - parseInt($('#discount').val());
		else
			discountedAmount 	= parseInt(amtTotal);
		
		discountedAmountTotal	= discountedAmount.toFixed(2);
	}
	
	let taxAmt			= 0;
	let totalTax		= 0;
	let nonTaxableAmt	= 0;
	let freightAmt		= 0;
	let finalTaxAmount	= 0;
	
	nonTaxableAmt 		= getServiceTaxExcludeCharges() ;
	freightAmt 			= $('#wayBillChargeHidden_'+FREIGHT).val();
	
	if((typeof taxBy != 'undefined' && Number(taxBy) > 0) && (typeof taxes != 'undefined' && taxes != null)) { 
		for(const element of taxes) {
			let tax	= element;
			taxAmt 	= 0;
			if($('#wayBillTaxes_' + tax.taxMasterId).exists()) {
				if(tax.isTaxPercentage) {
					if(parseInt((amtTotal - nonTaxableAmt), 10) > leastTaxableAmount) {
						if($("#perctax_" + tax.taxMasterId).prop("checked")) {
							if(jsondata.isPrevStaxAllow) {
								if (allowRateInDecimal)
									taxAmt = parseFloat($("#lastSTaxAmt").val() * (amtTotal - nonTaxableAmt) / 100);
								else						
									taxAmt = Math.round(parseFloat($("#lastSTaxAmt").val()) * (amtTotal - nonTaxableAmt) / 100);
							} else if (allowRateInDecimal)
								taxAmt = parseFloat(tax.taxAmount * (amtTotal - nonTaxableAmt) / 100);
							else if(groupConfiguration.applyIncludedTax){
								taxAmt	= Number(((freightAmt * tax.taxAmount) / (100 + tax.taxAmount)));
								taxAmt 	= Math.round(taxAmt);
								finalTaxAmount += taxAmt;
							} else
								taxAmt = Math.round(parseFloat(tax.taxAmount) * (amtTotal - nonTaxableAmt) / 100);
						} else if (allowRateInDecimal)
							taxAmt = parseFloat(tax.taxAmount);
						else			
							taxAmt = Math.round(tax.taxAmount);
						
						$('#STPaidBy').prop('disabled', false);
					} else {
						$('#STPaidBy').prop('disabled', true);
						$('#STPaidBy').selectedIndex 	= Number(taxBy);
					}
					
					if (allowRateInDecimal)
						totalTax += truncateToTwoDecimals(taxAmt);
					else
						totalTax += parseInt(taxAmt);
					
					if(groupConfiguration.applyIncludedTax && freightAmt == 0) {
						let  amt = 0;
						
						if(wayBillBkgTaxTanHm != null) {
							for(let key in wayBillBkgTaxTanHm) {
								if(wayBillBkgTaxTanHm.hasOwnProperty(key)){
									let wayBillBkgTaxAmount	= wayBillBkgTaxTanHm[key];

									if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) {
										if (allowRateInDecimal)
											$('#wayBillTaxes_' + wayBillBkgTaxAmount.taxMasterId).val((parseFloat(wayBillBkgTaxAmount.taxAmount)).toFixed(2));
										else
											$('#wayBillTaxes_' + wayBillBkgTaxAmount.taxMasterId).val(parseInt(wayBillBkgTaxAmount.taxAmount));
									} else
										$('#wayBillTaxes_' + tax.taxMasterId).val(0);
									
									amt = wayBillBkgTaxAmount.taxAmount
								}
							}
							
							totalTax += amt ;
						}
					} else if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) {
						if (allowRateInDecimal)
							$('#wayBillTaxes_' + tax.taxMasterId).val((parseFloat(taxAmt)).toFixed(2));
						else
							$('#wayBillTaxes_' + tax.taxMasterId).val(parseInt(taxAmt));
					} else
						$('#wayBillTaxes_' + tax.taxMasterId).val(0);
				}
			}
		}
	} else {
		if(typeof taxes != 'undefined' && taxes != null) {
			let stPaidBy 	= document.getElementById('STPaidBy');
			nonTaxableAmt 	= getServiceTaxExcludeCharges();

			for(const element of taxes) {
				let tax	= element;
				taxAmt 	= 0;

				if($('#wayBillTaxes_' + tax.taxMasterId).exists()) {
					if(tax.isTaxPercentage) {
						if(parseInt((discountedAmountTotal - nonTaxableAmt), 10) > leastTaxableAmount) {
							$('#STPaidBy').prop('disabled', false);

							if($("#perctax_" + tax.taxMasterId).prop("checked")) {
								if(jsondata.isPrevStaxAllow) {
									if (allowRateInDecimal)
										taxAmt 	= (parseFloat($("#lastSTaxAmt").val()) * (discountedAmountTotal - nonTaxableAmt) / 100);
									else					
										taxAmt 	= Math.round(parseFloat($("#lastSTaxAmt").val()) * (discountedAmountTotal - nonTaxableAmt) / 100);
								} else if (allowRateInDecimal)
									taxAmt 	= (parseFloat(tax.taxAmount) * (discountedAmountTotal - nonTaxableAmt) / 100);	
								else
									taxAmt 	= Math.round(parseFloat(tax.taxAmount) * (discountedAmountTotal - nonTaxableAmt) / 100);
							} else if (allowRateInDecimal)
								taxAmt = (tax.taxAmount);
							else			
								taxAmt = Math.round(tax.taxAmount);
							
							if($('#STPaidBy').val() <= 0) {
								if(jsondata.isPartyExempted) {
									$('#STPaidBy').val(TAX_PAID_BY_EXEMPTED_ID)
								} else if(partyId > 0) {
									if(jsondata.isTaxPaidByTrans)
										stPaidBy.selectedIndex = TAX_PAID_BY_TRANSPORTER_ID;
									else if(wayBillTypeId == WAYBILL_TYPE_PAID)
										stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGOR_ID;
									else
										stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGEE_ID;
								} else if(jsondata.isTaxPaidByTrans)
									stPaidBy.selectedIndex = TAX_PAID_BY_TRANSPORTER_ID;
								else
									stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGOR_ID;
							}
						} else {
							$('#STPaidBy').prop('disabled', true);
							stPaidBy.selectedIndex 	= 0;
						}

						if (allowRateInDecimal)
							totalTax += truncateToTwoDecimals(taxAmt);
						else			
							totalTax += parseInt(taxAmt);

						if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) {
							if (allowRateInDecimal)
								$('#wayBillTaxes_' + tax.taxMasterId).val((parseFloat(taxAmt)).toFixed(2));
							else
								$('#wayBillTaxes_' + tax.taxMasterId).val(parseInt(taxAmt));
						} else
							$('#wayBillTaxes_' + tax.taxMasterId).val(0);
					} else if (allowRateInDecimal)
						totalTax += parseFloat($('#wayBillTaxes_' + tax.taxMasterId).val());
					else		
						totalTax += parseInt($('#wayBillTaxes_' + tax.taxMasterId).val());
				}
			}

			if (allowRateInDecimal)
				$('#bookingTaxAmount').val(truncateToTwoDecimals(totalTax));
			else			
				$('#bookingTaxAmount').val(totalTax);
		}
	}
	
	if(groupConfiguration.applyIncludedTax) {
		if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID) {
			$( "#wayBillCharge_" + FREIGHT ).blur(function() {
				if(freightAmt > 0) {
					$("#wayBillCharge_" + FREIGHT).val((freightAmt - finalTaxAmount));
					$("#discountedAmountTotal").val((amtTotal - finalTaxAmount));
					$('#grandTotal').val(parseInt(discountedAmountTotal));
				}

			});
			$( "#STPaidBy" ).change(function() {
				if(freightAmt > 0){
					$("#wayBillCharge_" + FREIGHT).val((freightAmt - finalTaxAmount));
					$("#discountedAmountTotal").val((amtTotal - finalTaxAmount));
					$('#grandTotal').val(parseInt(discountedAmountTotal));
				}
			});
		} else {
			$("#STPaidBy" ).change(function() {
				if(freightAmt > 0) {
					$("#wayBillCharge_" + FREIGHT).val($('#wayBillChargeHidden_' + FREIGHT).val());
					$("#discountedAmountTotal").val(Number(freightAmt) + Number(nonTaxableAmt));
					$('#grandTotal').val(parseInt(Number(freightAmt) + Number(nonTaxableAmt)));
				}
			});
		}
	}
	
	if(groupConfiguration.showGstType)
		totalTax = calculateGstOnGstType(totalTax)

	let discounted 	= truncateToTwoDecimals(discountedAmountTotal);
	let tax 		= truncateToTwoDecimals(totalTax);

	let grandTotal;

	if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable)
		grandTotal = discounted + tax;
	else
		grandTotal = discounted;
	
	if(allowRateInDecimal)
		$('#grandTotal').val(truncateToTwoDecimals(grandTotal));
	else
		$('#grandTotal').val(Math.round(grandTotal));
}

function getServiceTaxExcludeCharges() {
	let total		= 0;
	let charge  	= null;

	let bookingCharges				= jsondata.bookingCharges;

	for(const element of bookingCharges) {
		if(element.taxExclude) {
			charge =  document.getElementById('wayBillCharge_' + element.chargeTypeMasterId);
			total += (charge != null ? parseInt(charge.value) : 0);
		}
	}
	
	return total;
}

function frieghtCantBeZero(obj) {
	if(!groupConfiguration.allowZeroAmountInTBB && editLRRateProperties.freightChargeMandatoryInTBB && $('#wayBillTypeId').val() == WAYBILL_TYPE_CREDIT) {
		if(obj.id == 'wayBillCharge_' + FREIGHT && obj.value == 0) {
			obj.value = parseInt($('#actualChargeAmount' + FREIGHT).val());
			showMessage('error', freightAmountRequiredErrMsg);
		}
	}

	if (!editLRRateProperties.allowRateLessThanCurrentRate) { 
		let preFreight 	= parseFloat($('#preFreight').val()); 

		if(obj.id == 'wayBillCharge_' + FREIGHT) {
			if(obj.value < preFreight) {
				showMessage('info', freightAmountLessThanInfoMsg(preFreight));
				$('#wayBillCharge_' + FREIGHT).val(preFreight);
				return false;
			} else {
				return true;
			}
		}
	}
}

function enableDeliveryTo(obj) {
	if(!editLRRateProperties.allowToEditDeliveryTo) {
		return;
	}

	let deliveryTo = document.getElementById("DeliveryTo");

	if(obj.id == 'wayBillCharge_' + DOOR_DELIVERY_BOOKING) {
		if(Number($('#prevDeliveryToId').val()) == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
			$('#DeliveryTo').find('option').remove().end();
			
			$('#DeliveryTo').append('<option value="'+DIRECT_DELIVERY_DIRECT_VASULI_ID+'" id="'+DIRECT_DELIVERY_DIRECT_VASULI_ID+'">'+DIRECT_DELIVERY_DIRECT_VASULI_NAME+'</option>');

			if(obj.value > 0) {
				$('#DeliveryTo').prop('disabled', false);
			} else {
				$('#DeliveryTo').prop('disabled', true);
			}
		} else {
			$('#DeliveryTo').find('option').remove().end();
			
			$('#DeliveryTo').append('<option value="'+DELIVERY_TO_BRANCH_ID+'" id="'+DELIVERY_TO_BRANCH_ID+'">'+DELIVERY_TO_BRANCH_NAME+'</option>');
			$('#DeliveryTo').append('<option value="'+DELIVERY_TO_DOOR_ID+'" id="'+DELIVERY_TO_DOOR_ID+'">'+DELIVERY_TO_DOOR_NAME+'</option>');
			$('#DeliveryTo').append('<option value="'+DELIVERY_TO_TRUCK_DELIVERY_ID+'" id="'+DELIVERY_TO_TRUCK_DELIVERY_ID+'">'+DELIVERY_TO_TRUCK_DELIVERY_NAME+'</option>');

			if(obj.value > 0){
				if(Number($('#prevDeliveryToId').val()) != DELIVERY_TO_DOOR_ID) {
					$('#DeliveryTo').prop('disabled', false);
				}
				if(Number($('#prevDeliveryToId').val()) == DELIVERY_TO_BRANCH_ID) {
					alert("You have entered the Door Delivery Charge . The delivery type will be changed from GODOWN to DOOR.")
				}
				deliveryTo.selectedIndex = 1;
			} else {
				$('#DeliveryTo').prop('disabled', true);

				if(Number($('#prevDeliveryToId').val()) == DELIVERY_TO_BRANCH_ID) {
					deliveryTo.selectedIndex = 0;
				} else if(Number($('#prevDeliveryToId').val()) == DELIVERY_TO_DOOR_ID) {
					deliveryTo.selectedIndex = 1;
				}
			}
		}
	}
	
	if(allowDeliveryToExpressBasedOnExpressCharge == true) {
		if(obj.id == 'wayBillCharge_' + EXPRESS) {
			if(Number($('#prevDeliveryToId').val()) == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
				$('#DeliveryTo').find('option').remove().end();
				$('#DeliveryTo').append('<option value="'+DIRECT_DELIVERY_DIRECT_VASULI_ID+'" id="'+DIRECT_DELIVERY_DIRECT_VASULI_ID+'">'+DIRECT_DELIVERY_DIRECT_VASULI_NAME+'</option>');
				$('#DeliveryTo').prop('disabled', obj.value <= 0);
			} else if(groupConfiguration.subRegionIdsForOverNite != undefined && groupConfiguration.subRegionIdsForOverNite.length > 0) {
				if(destnationSubRegionIdForOverNite > 0) {
					$("#wayBillCharge_" + EXPRESS).val(0);
					showMessage('error', 'You can not enter express charge while Delivery to is Door Delivery !');
					calcGrandTotal();
				} else if(Number($('#DeliveryTo').val()) == Number(DELIVERY_TO_EXPRESS_DELIVERY_ID)) {
					if(Number($("#wayBillCharge_"+ EXPRESS).val()) == 0){
						showMessage('error', 'You can not enter 0 express charge if Express Delivery is selected !');
						$("#wayBillCharge_"+ EXPRESS).val($("#wayBillCharge_"+ FREIGHT).val());
					} else if(Number($("#wayBillCharge_"+ EXPRESS).val()) < Number($("#wayBillCharge_"+ FREIGHT).val())){
						$("#wayBillCharge_"+ EXPRESS).val($("#wayBillCharge_"+ FREIGHT).val());
					}
				} else 	if(Number($('#DeliveryTo').val()) != Number(DELIVERY_TO_EXPRESS_DELIVERY_ID)) {
					if(Number($("#wayBillCharge_"+ EXPRESS).val())) {
						showMessage('error', 'Please, Select Express Delivery !');
						return;
					}
				}
			}
		}
	}
}

function calculateTotalAmountAfterEditConsignmentAmount() {
	let tableSize 		= $('#editLRAmount tbody tr').length;
	let totalAmt		= 0;
	let totalQTAmount	= 0;

	for(let i = 0; i < tableSize - 1; i++) {
		let qty		= $('#qty_' + [i + 1]).val();
		let amt		= $('#newqtyAmt_' + [i + 1]).val();

		totalQTAmount	+= Number(amt);
		totalAmt		+= Number(qty) * Number(amt); 
	}

	$('#wayBillCharge_' + FREIGHT).val(totalAmt);

	calcGrandTotal();
}

function calculateTotalFreight() {

	let totalAmount		= 0;
	let extraAmount		= 0;
	let lessAmount		= 0;

	let freightAmount			= $('#actualChargeAmount' + FREIGHT).val();
	let chargeWeight			= $('#chargeWeight').val();
	let weightRate				= $('#weightFreightRate').val();
	let preWeightFreightRate	= $('#preWeightFreightRate').val();
	let amountTotal				= $('#amountTotal').val();
	let grandTotal				= $('#prevGrandTotal').val();

	if(editLRRateProperties.AddExtraAmountOnChangeOfWeightRate) {
		if(weightRate >= preWeightFreightRate) {
			extraAmount		= Number(chargeWeight) * (Number(weightRate) - Number(preWeightFreightRate));
			totalAmount		= Number(freightAmount) + Number(extraAmount);
	
			$('#amountTotal').val(Number(amountTotal) + Number(extraAmount));
			$('#grandTotal').val(Number(grandTotal) + Number(extraAmount));
		} else if(preWeightFreightRate >= weightRate) {
			lessAmount		= Number(chargeWeight) * (Number(preWeightFreightRate) - Number(weightRate));
			totalAmount		= Number(freightAmount) - Number(lessAmount);
	
			$('#amountTotal').val(Number(amountTotal) - Number(lessAmount));
			$('#grandTotal').val(Number(grandTotal) - Number(lessAmount));
		}
	} else if(weightRate > 0)
		totalAmount		= Number(chargeWeight) * Number(weightRate);
	
	if(totalAmount > 0) {
		if(allowRateInDecimal) {
			$('#wayBillCharge_' + FREIGHT).val(totalAmount.toFixed(2));
		} else {
			$('#wayBillCharge_' + FREIGHT).val(totalAmount);
		}
	}

	calcGrandTotal();
}

function calcDeliveryGrandTotal() {
}

function validateRemarkOnCharge(chargeId, chargeName) {
	
	let waybillChargeMasterIdsForValidateRemark	= editLRRateProperties.waybillChargeMasterIdsForValidateRemark;
	let chargesToValidateRemark					= waybillChargeMasterIdsForValidateRemark.split(",");
	
	if(!editLRRateProperties.wayBillChargeWiseRemarkNeeded) {
		return true;
	}

	let chargeValue = $('#wayBillCharge_' + chargeId).val();

	if(chargeValue > 0 && jQuery.inArray(chargeId+"", chargesToValidateRemark) >= 0 ) {
		if($('#wayBillChargeRemark_' + chargeId).exists()) {
			let chargeRemark = $('#wayBillChargeRemark_' + chargeId).val();

			if(chargeRemark == "") {
				changeTextFieldColor('wayBillChargeRemark_' + chargeId, '', '', 'red');
				showMessage('error','Please Enter ' + chargeName + ' remark !');
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus('wayBillChargeRemark_' + chargeId, '', '', 'green');
				return true;
			}
		}
	}

	return true;
}

function checkDoorDelivery(obj) {
	if(allowDeliveryToExpressBasedOnExpressCharge == true) {
		if(groupConfiguration.subRegionIdsForOverNite != undefined && groupConfiguration.subRegionIdsForOverNite.length > 0) {
			if(destnationSubRegionIdForOverNite > 0) {
				showMessage('error', 'You are allowed to Select Door Delivery Only !');
				$("#DeliveryTo").val(DELIVERY_TO_DOOR_ID);
			} else if(!obj.disabled && obj.value != DELIVERY_TO_EXPRESS_DELIVERY_ID) {
				if(obj.value == DELIVERY_TO_DOOR_ID) {
					showMessage('error', 'You are not allowed to Select Door Delivery !');
					$("#DeliveryTo").val($('#prevDeliveryToId').val());
					return false;
				} else if($("#wayBillCharge_"+ EXPRESS).val() > 0) {
					showMessage('error', 'Please, Select Express Delivery !');
					return false;
				}
			} else if(!obj.disabled && obj.value == DELIVERY_TO_EXPRESS_DELIVERY_ID) {
				if(Number($("#wayBillCharge_"+ EXPRESS).val()) < Number($("#wayBillCharge_"+ FREIGHT).val())) {
					$("#wayBillCharge_"+ EXPRESS).val($("#wayBillCharge_"+ FREIGHT).val());
				}
			}
		}
	} else if(!obj.disabled && obj.value == DELIVERY_TO_BRANCH_ID) {
		alert('You entered Door Delivery Amount, Please select Door Delivery !');
	}
}

function calcDiscountLimit() {
	
	let disAmt 			= 0.00;
	let totalAmt		= 0.00;

	totalAmt = $('#discountedAmountTotal').val();
	
	if($("#isDiscountPercent").exists() && $("#isDiscountPercent").prop("checked")) {
		disAmt = (parseFloat($("#discount").val()) * parseFloat(totalAmt)) / 100;
	} else {
		disAmt = $('#discount').val();
	}

	if(!validateDiscountLimit(discountInPercent, totalAmt, disAmt, $('#discount'))) {
		changeTextFieldColor('discount', '', '', 'red');
		return false;
	}
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount) {
	let discountAmtLimit	 = Math.round((totalAmount * discountInPercent) / 100);
	
	if(discountInPercent > 0) {
		if(Number(enteredAmount) > Number(discountAmtLimit)) {
			if ($('#isDiscountPercent').prop("checked")) {
				showMessage('error', "Discount Amount Cannot Be Greater Than " +discountInPercent+ "%");
			} else {
				showMessage('error', "Discount Amount Cannot Be Greater Than " +discountAmtLimit);
			}
			changeTextFieldColor('discount', '', '', 'red');
			$('#discount').focus();
			return false;
		}
	}
	
	return true;
}

function checkChargesRates(obj){
	let chargeMasterId	= (obj.id).replace(/[^\d.]/g, '');
	
	if((allowToDecreaseRatesForGroupAdmin && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) ||  (!allowToDecreaseRatesForGroupAdmin && editLRRateProperties.checkChargesAfterApplyRateInAuto)){
		let actualInput		= Number($('#actualChargeAmount'+chargeMasterId).val());
		let chargeValue		= obj.value;
		
		if(chargeValue < actualInput && actualInput > 0) {
			showMessage('info', 'You can not enter less then this '+actualInput+' /-');
			setTimeout(function(){ $('#charge'+chargeMasterId).focus(); }, 0);
			$('#wayBillCharge_'+chargeMasterId).val('');
			$('#wayBillCharge_'+chargeMasterId).val(actualInput);
		}
	}
}

function inputHiddenWayBillCharges(chargeId, chargeName) {
	let wayBillChargesFeild = null ;

	if(chargeId == FREIGHT) {
		wayBillChargesFeild	= $("<input/>", { 
			type			: 'hidden', 
			id				: 'wayBillChargeHidden_' + chargeId,
			name			: 'wayBillChargeHidden_' + chargeId,
			class			: 'form-control width-80px',
			maxlength		: 8,
			style			: 'text-align: right; height: 30px;',
			'data-tooltip'	: chargeName
		});
	}

	return wayBillChargesFeild;
}

function changeGstType() {
	calcGrandTotal();
}

function calculateGstOnGstType(totalTax){
	let gstTypeId = Number($('#gstType').val());
	
	if(gstTypeId <= 0) {
		$('#wayBillTaxes_' + SGST_MASTER_ID).val(0);
		$('#wayBillTaxes_' + CGST_MASTER_ID).val(0);
		$('#wayBillTaxes_' + IGST_MASTER_ID).val(0);
		return 0;
	}
	
	if(newWayBillTaxes != null) {
		for(const element of newWayBillTaxes) {
			if(gstTypeId == SGST_MASTER_ID && (element.taxMasterId == SGST_MASTER_ID || element.taxMasterId == CGST_MASTER_ID)) {
				totalTax = totalTax - Number($('#wayBillTaxes_' + IGST_MASTER_ID).val());
				$('#wayBillTaxes_' + IGST_MASTER_ID).val(0);
			} else if(gstTypeId == IGST_MASTER_ID && element.taxMasterId == IGST_MASTER_ID) {
				totalTax = totalTax - Number($('#wayBillTaxes_' + CGST_MASTER_ID).val());
				totalTax = totalTax - Number($('#wayBillTaxes_' + SGST_MASTER_ID).val());
				$('#wayBillTaxes_' + SGST_MASTER_ID).val(0);
				$('#wayBillTaxes_' + CGST_MASTER_ID).val(0);
			}
		}
	}

	return totalTax;
}

function isSubregionForGroupLevelFixCharge() {
	return isValueExistInArray((groupConfiguration.subRegionIdsForGroupLevelFixCharge).split(','), executive.subRegionId);
}

function setNonEditableDocCharge() {
	let wayBillType				= $('#wayBillTypeId').val();
	$('#wayBillCharge_' + DOC_CHARGE).attr('readonly', 	(groupConfiguration.nonEditableDocChargeInPaid && wayBillType == WAYBILL_TYPE_PAID)	|| (groupConfiguration.nonEditableDocChargeInTopay && wayBillType == WAYBILL_TYPE_TO_PAY));
}
