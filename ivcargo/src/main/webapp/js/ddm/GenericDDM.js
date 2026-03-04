var deliveryDetailsDefaultTblId 		= 'deliveryDetailsTable_Def';
var deliveryDetailsTblId				= 'deliveryDetailsTable';
var deliveryDetailsDivId				= 'deliveryDetailsDiv';
var chequeDetailsRowId					= 'chequeDetailsRow';
var DeliveryCreditorRowId				= 'DeliveryCreditorRow';
var deliveredToRowId					= 'deliveredToRow';
var lrDetailsTableNewId					= 'dispatchTable';
var lrDetailsTableNewId2				= 'lrDetailsTable';
var blackListedObject					= new Array();
var isAllDDMSettled = false;
var tripSheet = null
var validateTripSheet = false;

//make clone of table and put it into div
function createDeliveryDetailsTableForSingleRow(dlyDetailsColumn, uniqueId) {
	let deliveryDetailsTblClone	= $('#' + deliveryDetailsDefaultTblId).clone();

	$(dlyDetailsColumn).append(deliveryDetailsTblClone);

	changeElementId(deliveryDetailsTblClone, deliveryDetailsTblId+'_'+uniqueId);

	let eleId		= '';
	let ele			= null;

	let commonId		= '#'+dlyDetailsColumn.attr('id')+' #'+deliveryDetailsTblClone.attr('id');

	//change row Id for each LR
	eleId	= commonId +' #'+chequeDetailsRowId;
	ele		= $(eleId);

	changeElementId(ele, chequeDetailsRowId+'_'+uniqueId);

	eleId	= commonId +' #'+DeliveryCreditorRowId;
	ele		= $(eleId);

	changeElementId(ele, DeliveryCreditorRowId+'_'+uniqueId);

	eleId	= commonId +' #'+deliveredToRowId;
	ele		= $(eleId);

	changeElementId(ele, deliveredToRowId+'_'+uniqueId);

	//change column Id inside that LR's
	eleId	= commonId +' #chequeDate';
	ele		= $(eleId);

	changeElementId(ele, 'chequeDate_'+uniqueId);
	changeElementName(ele, 'chequeDate_'+uniqueId);

	eleId	= commonId +' #chequeNo';
	ele		= $(eleId);

	changeElementId(ele, 'chequeNo_'+uniqueId);
	changeElementName(ele, 'chequeNo_'+uniqueId);

	eleId	= commonId +' #chequeAmount';
	ele		= $(eleId);

	changeElementId(ele, 'chequeAmount_'+uniqueId);
	changeElementName(ele, 'chequeAmount_'+uniqueId);

	eleId	= commonId +' #bankName';
	ele		= $(eleId);

	changeElementId(ele, 'bankName_'+uniqueId);
	changeElementName(ele, 'bankName_'+uniqueId);

	eleId	= commonId +' #selectedDeliveryCreditorId';
	ele		= $(eleId);

	changeElementId(ele, 'selectedDeliveryCreditorId_'+uniqueId);
	changeElementName(ele, 'selectedDeliveryCreditorId_'+uniqueId);

	eleId	= commonId +' #deliveryCreditor';
	ele		= $(eleId);

	changeElementId(ele, 'deliveryCreditor_'+uniqueId);
	changeElementName(ele, 'deliveryCreditor_'+uniqueId);

	eleId	= commonId +' #deliveredToName';
	ele		= $(eleId);

	changeElementId(ele, 'deliveredToName_'+uniqueId);
	changeElementName(ele, 'deliveredToName_'+uniqueId);

	eleId	= commonId +' #deliveredToPhoneNo';
	ele		= $(eleId);

	changeElementId(ele, 'deliveredToPhoneNo_'+uniqueId);
	changeElementName(ele, 'deliveredToPhoneNo_'+uniqueId);

	//Called from DeliveryCreditorAutoComplete.js file
	initializeCreditorAutoComplete(uniqueId);

}

function hideShowDelDetails(ele) {
	let rcvDlyAs	= $(ele).val();
	let uniqueId	= $(ele).attr('id').split("_")[1];
	switch (rcvDlyAs) {

	case '1':
		cashSelected(uniqueId);
		break;
	case '2':
		chequeSelected(uniqueId);
		break;
	case '3':
		shortCreditSelected(uniqueId);
		break;
	case '4':
		billCreditSelected(uniqueId);
		break;
	case '6':
		receivedAtGodownSelected(uniqueId);
		break;
	}
}

function cashSelected (uniqueId) {
	showDeliveredToRow(uniqueId);
	hideChequeDetailsRow(uniqueId);
	hideDeliveryCreditorRow(uniqueId);
}

function chequeSelected (uniqueId) {
	showChequeDetailsRow(uniqueId);
	showDeliveredToRow(uniqueId);
	hideDeliveryCreditorRow(uniqueId);
}

function shortCreditSelected (uniqueId) {
	showDeliveredToRow(uniqueId);
	hideChequeDetailsRow(uniqueId);
	hideDeliveryCreditorRow(uniqueId);
}

function billCreditSelected (uniqueId) {
	showDeliveryCreditorRow(uniqueId);
	hideChequeDetailsRow(uniqueId);
	hideDeliveredToRow(uniqueId);
}

function receivedAtGodownSelected (uniqueId) {
	hideChequeDetailsRow(uniqueId);
	hideDeliveryCreditorRow(uniqueId);
	hideDeliveredToRow(uniqueId);
}

function showChequeDetailsRow (uniqueId) {
	$('#' + chequeDetailsRowId + "_" + uniqueId).switchClass("show", "hide");
}

function showDeliveryCreditorRow (uniqueId) {
	$('#' + DeliveryCreditorRowId + "_" + uniqueId).switchClass("show", "hide");
}

function showDeliveredToRow (uniqueId) {
	$('#' + deliveredToRowId + "_" + uniqueId).switchClass("show", "hide");
}

function hideChequeDetailsRow (uniqueId) {
	$('#' + chequeDetailsRowId + "_" + uniqueId).switchClass("hide", "show");
}

function hideDeliveryCreditorRow (uniqueId) {
	$('#' + DeliveryCreditorRowId + "_" + uniqueId).switchClass("hide", "show");
}

function hideDeliveredToRow (uniqueId) {
	$('#' + deliveredToRowId + "_" + uniqueId).switchClass("hide", "show");
}


function validateLRDetails() {
	let tableEl		= null;

	if($('#dispatchTable').exists() && $('#dispatchTable').is(':visible'))
		tableEl = document.getElementById('dispatchTable');
	else if($('#lrDetailsTable').exists() && $('#lrDetailsTable').is(':visible'))
		tableEl = document.getElementById('lrDetailsTable');

	let count = parseInt(tableEl.rows.length);

	for(let i = 1; i < count; i++) {
		let chkBox = tableEl.rows[i].cells[0].children[0];

		if(chkBox && chkBox.checked) {
			if(!validateSingleLR(chkBox.value))
				return false;
			
			if(showPartyIsBlackListedParty && !allowDeliveryForBlackListedParty) {
				let wayBillNumber = checkBlackListedLR(Number(chkBox.value));
					
				if(wayBillNumber != '') {
					showMessage('error', "You can not Create DDM of BlackListed Party LR's !!");
					return false;
				}
			}
		}
	}

	return true;

}

function validateDeliveryChargesEntry() {
	let tableEl = document.getElementById('lrDetailsTable');

	let count = parseInt(tableEl.rows.length);
	let withoutDeliveryChargesLr = new Array();

	for(let i = 1; i < count; i++) {
		let chkBox = tableEl.rows[i].cells[0].children[0];

		if(chkBox && Number($('#totalAmt_' + chkBox.value).text()) == Number($('#grandTotal_' + chkBox.value).val()))
			withoutDeliveryChargesLr.push($("#wayBillNumber_" + chkBox.value).val());	
	}

	if(withoutDeliveryChargesLr.length > 0) {
		let result = confirm("Delivery Charge Not Taken For Following LRs " + withoutDeliveryChargesLr.join() + ". Do you want to continue ? ");

		if (!result)
			return false;
	}

	return true;
}

function validateSingleLR(wbId) {
	if(configuration.DeliveredTo) {
		if(!validateInput(1, 'deliveredToName_' + wbId, 'deliveredToName_' + wbId, '', deliverdNameErrMsg)) 
			return false;

		let dlvrToNo = document.getElementById('deliveredToPhoneNo_' + wbId);
		
		if (dlvrToNo.value == '' || dlvrToNo.value == ' ')
			dlvrToNo.value = '0000000000';
	}

	if(configuration.isDiscountShow) {
		let disc		= $("#discount_" + wbId).val();
		
		if(disc > 0 && !validateInput(1, 'discountTypes_' + wbId, 'discountTypes_' + wbId, '', discountTypeErrMsg)) 
			return false;
		// Validation for Discount Type (end)
		
		let discountAmount  = Number($('#discount_' + wbId).val());
		let grandTotal      = Number($('#grandTotal_' + wbId).val());
		let bookingAmount   = Number(0);
		
		if(Number($('#wayBillType_' + wbId).val()) == Number(WAYBILL_TYPE_TO_PAY)) {
			if(activeDeliveryChargesGlobal != null) {
				let dataKey		= Object.keys(activeDeliveryChargesGlobal);

				for (const element of dataKey) {
					let objKey	= Object.keys(activeDeliveryChargesGlobal[element]);

					for (const element1 of objKey) {
						grandTotal += Number($('#delCharge_' + element1 + '_' + wbId).val());
					}
				}
			}
			
			if(discountAmount > grandTotal) {
				showMessage('error', 'Discount cannot be more than Delivery Amount');
				$('#discount_' + wbId).focus();
				$('#discount_' + wbId).val(0);
				return false;
			}
		} else {
			if(activeDeliveryChargesGlobal != null) {
				let dataKey		= Object.keys(activeDeliveryChargesGlobal);
			
				for (const element of dataKey) {
					let objKey	= Object.keys(activeDeliveryChargesGlobal[element]);
			
					for (const element1 of objKey) {
						bookingAmount += Number($('#delCharge_' + element1 + '_' + wbId).val());
					}
				}
			}
			
			if(discountAmount > bookingAmount) {
				showMessage('error', 'Discount cannot be more than Delivery Amount');
				$('#discount_' + wbId).focus();
				$('#discount_' + wbId).val(0);
				return false;
			}
		}
	}

	return true;
}

function validateDate(str) {
	return str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
}

function add(ddm) {
	let tableDEST = document.getElementById('tableBody');

	if(checkIfExistsWithId(ddm.wayBillId)) {
		showMessage('error', lrNumberAlreadyAdded(ddm.wayBillNumber));
		return false;
	}
	
	if(configuration.allowBillSelection && checkIfExistsWithBillId(ddm.billSelectionId)) {
		showMessage('error', 'Bill Lrs Not Allowed with Estimate Lrs');
		return false;
	}
	
	if(showDivisionSelection && ddm.divisionId > 0 && checkIfExistsWithDivisionId(ddm.divisionId)) {
		showMessage('error', 'You cannot mix the different Division LRs');
		return false;
	}
	
	let duplicateNumber	= checkIfExists(ddm.wayBillNumber, ddm.wayBillId);
	
	if(duplicateNumber) {
		$.confirm({
			text: "LR no " + ddm.wayBillNumber + " is already added to the list.Are you sure you want to add another LR with same number ?",
			confirm : function() {
				addDDmTable(ddm, tableDEST);
			}, cancel : function() {
				showMessage('error', lrNumberAlreadyAdded(ddm.wayBillNumber));
				return false;
			},
			position			: 'center',
			confirmButton		: 'YES',
			cancelButton		: 'NO',
			confirmButtonClass	: 'btn-info',
			cancelButtonClass	: 'btn-danger'
		});
		$(".confirm").removeClass('confirm');
	} else
		addDDmTable(ddm, tableDEST);
}

function addDDmTable(ddm, tableDEST) {
	let wayBillNo		= ddm.wayBillNumber;
	let wayBillId		= ddm.wayBillId;
	
	let NewRow 		= document.createElement("tr");
		
	let one 		= document.createElement("td");
	let two 		= document.createElement("td");
	let three 		= document.createElement("td");
	let four 		= document.createElement("td");
	let five 		= document.createElement("td");
	let six 		= document.createElement("td");
	let seven 		= document.createElement("td");
	let eight 		= document.createElement("td");
	let nine 		= document.createElement("td");
	let ten 		= document.createElement("td");
	let eleven 		= document.createElement("td");
	let twelve 		= document.createElement("td");
	let thirteen	= document.createElement("td");
	let seventeen		= document.createElement("td");
	let rcvDlyAsCol		= document.createElement("td");
	let delDetailsCol	= document.createElement("td");
	let remarkCol		= document.createElement("td");
	let discountCol		= document.createElement("td");
	let discountTypeCol	= document.createElement("td");
	let ctoDetainStatusCol	= document.createElement("td");
	let lorryHireCol	= document.createElement("td");
	let manualCRCol		= document.createElement("td");
	
	one.innerHTML 		= "<input name='wayBills' id='wayBills' type='checkbox' value="+wayBillId+" onclick='setLorryHire();'>";
	one.innerHTML		+= "<input name='wayBillBranchId_"+ wayBillId+"' id='wayBillBranchId_"+wayBillId+"'  type='hidden' value='"+ddm.branchId+"'/>";
	one.innerHTML		+= "<input name='wayBillNumber_"+wayBillId+"' id='wayBillNumber_"+wayBillId+"'  type='hidden' value='"+wayBillNo+"'/>";
	one.innerHTML		+= "<input name='wayBillType_"+wayBillId+"' id='wayBillType_"+wayBillId+"'  type='hidden' value='"+ddm.wayBillTypeId+"'/>";
	one.innerHTML		+= "<input name='lrActualWeight_"+wayBillId+"' id='lrActualWeight_"+wayBillId+"'  type='hidden' value='"+ddm.actualWeight+"'/>";
	one.innerHTML		+= "<input name='quantity_"+wayBillId+"' id='quantity_"+wayBillId+"'  type='hidden' value='"+ddm.quantity+"'/>";
	
	if(ddm.compareLRReceiveDateWhileDDMCreation)
	 	one.innerHTML		+= "<input name='wayBillReceivedDate_"+wayBillId+"' id='wayBillReceivedDate_"+wayBillId+"'  type='hidden' value='"+ddm.lrReceivedDateTimeStr+"'/>";
	else
		one.innerHTML		+= "<input name='wayBillReceivedDate_"+wayBillId+"' id='wayBillReceivedDate_"+wayBillId+"'  type='hidden' value='"+ddm.creationDateForUser+"'/>";
	
	one.innerHTML		+= "<input name='wayBillSubRegionId_"+wayBillId+"' id='wayBillSubRegionId_"+wayBillId+"'  type='hidden' value='"+ddm.subRegionId+"'/>";
	one.innerHTML		+= "<input name='grandTotal_"+wayBillId+"' id='grandTotal_"+wayBillId+"'  type='hidden' value='"+ddm.grandTotal+"'/>";
	one.innerHTML		+= "<input name='wayBills_"+wayBillId+"' id='wayBills_"+wayBillId+"'  type='hidden' value='"+wayBillId+"'/>";
	one.innerHTML		+= "<input name='addedBillSelection' id='addedBillSelection'  type='hidden' value='"+ddm.billSelectionId+"'/>";
	one.innerHTML		+= "<input name='addedDivisionSelection' id='addedDivisionSelection'  type='hidden' value='"+ddm.divisionId+"'/>";
	two.innerHTML 		= ddm.creationDateForUser;
	three.innerHTML 	= wayBillNo;
	four.innerHTML 		= wayBillId;
	five.innerHTML 		= ddm.sourceBranch;
	six.innerHTML 		= ddm.destinationBranch;
	seven.innerHTML		= ddm.destinationBranchId;
	eight.innerHTML		= ddm.quantity;
	nine.innerHTML		= ddm.actualWeight;
	ten.innerHTML		= ddm.grandTotal;
	eleven.innerHTML	= ddm.deliveryToForUser;
	twelve.innerHTML	= ddm.consignorDetailsName;
	thirteen.innerHTML	= ddm.consigneeDetailsName;
	seventeen.innerHTML	= ddm.wayBillTypeStr;
	ctoDetainStatusCol.innerHTML	= ddm.ctoDetainedStatus;
	lorryHireCol.innweHTML    = 0;
	
	if(paymentTypePermissionsGlobal && !jQuery.isEmptyObject(paymentTypePermissionsGlobal)) {
		let combo 	= document.getElementById('paymentType_Def').cloneNode(true);
		rcvDlyAsCol.appendChild(combo);
		combo.id 	= 'paymentType_' + wayBillId;
		combo.name 	= 'paymentType_' + wayBillId;

		let count = 1;
		
		for (let id in paymentTypePermissionsGlobal) {
			if (paymentTypePermissionsGlobal.hasOwnProperty(id) && id != 6) {
				let option = document.createElement('option');
				option.text  = paymentTypePermissionsGlobal[id];
				option.value = id;
				combo.add(option, count);
				count++;
			}
		}
	}

	removeAllContentFromDiv('deliveryDetailsDiv_Def2');

	createDeliveryDetailsTableForSingleRow($('#deliveryDetailsDiv_Def2'), wayBillId);
	delDetailsCol.innerHTML	= document.getElementById('deliveryDetailsDiv_Def2').innerHTML;
	remarkCol.innerHTML	= '<input id="remark_'+wayBillId+'" type="text" name="remark_'+wayBillId+'" value="" placeholder="Remark">'	

	if(configuration.isAllowManualCRWithoutSeqCounter)
		manualCRCol.innerHTML = '<input id="manualCRNo_' + wayBillId + '" type="text" name="manualCRNo_' + wayBillId + '" value="" placeholder="Manual CR No" maxlength="8" oninput="allowCRInput(this);" onblur="checkDuplicateCR(' + wayBillId + ', this);">';
		
	lorryHireCol.innerHTML = '<input id="lorryHire_'+wayBillId+'" onkeyup="validateLorryHireLrWise(this,'+ wayBillId + ');" onkeypress="return noNumbers(event);" class="width-80px text-align-right" type="text" name="lorryHire_'+wayBillId+'" value="" placeholder="0">';

	if (configuration.configDiscount)
		discountCol.innerHTML = '<input id="discount_' + wayBillId + '" class="width-50px text-align-right" type="text" value="' + (ddm.discountAmount || ddm.dlyDiscount || 0) + '"  name="discount_' + wayBillId + '" placeholder="0">'
	else
		discountCol.innerHTML = '<input id="discount_' + wayBillId + '" onkeyup="validateDeliveryDiscount(this,' + 0 + ',' + ddm.grandTotal + ',' + ddm.wayBillTypeId + ');" class="width-50px text-align-right" type="text" name="discount_' + wayBillId + '" value="" placeholder="0">'

	if(discountTypesGlobal && !jQuery.isEmptyObject(discountTypesGlobal)) {
		let combo 	= document.getElementById('discountTypes_Def').cloneNode(true);
		discountTypeCol.appendChild(combo);
		combo.id 	= 'discountTypes_' + wayBillId;
		combo.name 	= 'discountTypes_' + wayBillId;

		for (let id in discountTypesGlobal) {
			let count = 1;

			if (discountTypesGlobal.hasOwnProperty(id)) {
				let option = document.createElement('option');
				option.text  = discountTypesGlobal[id];
				option.value = id;
				combo.add(option, count);
				count++;
			}
		}
	}

	one.className			='datatd isBlackListedParty_'+wayBillId;
	two.className			='datatd isBlackListedParty_'+wayBillId;
	three.className			='datatd isBlackListedParty_'+wayBillId;
	four.className			='datatd isBlackListedParty_'+wayBillId;
	five.className			='datatd isBlackListedParty_'+wayBillId;
	six.className			='datatd isBlackListedParty_'+wayBillId;
	seven.className			='datatd isBlackListedParty_'+wayBillId;
	eight.className			='datatd isBlackListedParty_'+wayBillId;
	nine.className			='datatd isBlackListedParty_'+wayBillId;
	ten.className			='datatd isBlackListedParty_'+wayBillId;
	eleven.className		='datatd isBlackListedParty_'+wayBillId;
	twelve.className		='datatd isBlackListedParty_'+wayBillId;
	thirteen.className		='datatd isBlackListedParty_'+wayBillId;
	seventeen.className		='datatd isBlackListedParty_'+wayBillId;
	rcvDlyAsCol.className	='datatd isBlackListedParty_'+wayBillId;
	ctoDetainStatusCol.className = 'datatd isBlackListedParty_'+wayBillId;
	ctoDetainStatusCol.id = 'cto_'+wayBillId;
	remarkCol.className = 'datatd isBlackListedParty_'+wayBillId;
	lorryHireCol.className = 'datatd isBlackListedParty_'+wayBillId;

	one.align 		= 'left';
	two.align 		= 'left';
	three.align 	= 'left';
	four.align 		= 'left';
	five.align 		= 'left';
	six.align 		= 'left';
	seven.align 	= 'left';
	eight.align 	= 'right';
	nine.align		= 'right';
	ten.align		= 'right';
	eleven.align	= 'left';
	twelve.align	= 'left';
	seventeen.align	= 'left';
	thirteen.align	= 'left';
	rcvDlyAsCol.align	= 'left';

	four.style.display	='none';
	seven.style.display	='none';
	rcvDlyAsCol.style.display	='none';
	ctoDetainStatusCol.style.display	='none';

	NewRow.appendChild(one);
	NewRow.appendChild(two);
	NewRow.appendChild(three);
	NewRow.appendChild(four);
	NewRow.appendChild(five);
	NewRow.appendChild(six);
	NewRow.appendChild(seven);
	NewRow.appendChild(eight);
	NewRow.appendChild(nine);
	
	let bkgChargeMasterIdWiseAmount = null;

	if(wbIdWiseBookingCharges && wbIdWiseBookingCharges[wayBillId] && !jQuery.isEmptyObject(wbIdWiseBookingCharges[wayBillId]))
		bkgChargeMasterIdWiseAmount = wbIdWiseBookingCharges[wayBillId];

	for (let sequence in activeBookingCharges) {
		chargeAmount = '0';
		let bkgChargeIdWiseName	= activeBookingCharges[sequence];

		for(let chargeId in bkgChargeIdWiseName) {
			if(bkgChargeMasterIdWiseAmount && bkgChargeMasterIdWiseAmount[chargeId])
				chargeAmount = bkgChargeMasterIdWiseAmount[chargeId];
			
			if(typeof bookingChargeIdsList !== 'undefined' && bookingChargeIdsList != null && bookingChargeIdsList.length > 0) {
				if(bookingChargeIdsList.includes(Number(chargeId))) {
					let chrgColBkg		= document.createElement("td");

					chrgColBkg.innerHTML		= chargeAmount;
					chrgColBkg.className		= 'datatd isBlackListedParty_' + wayBillId;
					chrgColBkg.id 				= 'bkgCharge_' + chargeId + '_' + wayBillId;
					chrgColBkg.name 			= 'bkgCharge_' + chargeId + '_' + wayBillId;
					chrgColBkg.align 			= 'right';
					
					if(configuration.showBookingCharges)
						NewRow.appendChild(chrgColBkg);
				}
			}
		}
	}
	
	if(!configuration.showBookingCharges) {
		for (let sequence in activeBookingCharges) {
			let bkgChargeIdWiseName	= activeBookingCharges[sequence];

			for(let chargeId in bkgChargeIdWiseName) {
				if (bkgChargeIdWiseName.hasOwnProperty(chargeId))
					document.getElementById("bkgCharges_" + chargeId).className = 'hide';
			}
		}
	}
	
	NewRow.appendChild(ten);
	NewRow.appendChild(eleven);
	NewRow.appendChild(twelve);
	NewRow.appendChild(thirteen);
	NewRow.appendChild(seventeen);
	NewRow.appendChild(rcvDlyAsCol);
	
	if(configuration.DeliveredTo)
		NewRow.appendChild(delDetailsCol);
	
	NewRow.appendChild(remarkCol);
	
	if(configuration.isAllowManualCRWithoutSeqCounter)
		NewRow.appendChild(manualCRCol);

	if(showLrWiseLorryHireColumn)
		NewRow.appendChild(lorryHireCol);

	let chargeMasterIdWiseAmount = null;
	
	if(wbIdWiseDeliveryCharges && wbIdWiseDeliveryCharges[wayBillId] && !jQuery.isEmptyObject(wbIdWiseDeliveryCharges[wayBillId]))
		chargeMasterIdWiseAmount = wbIdWiseDeliveryCharges[wayBillId];

	for (let sequence in activeDeliveryChargesGlobal) {
		chargeAmount = '0';
		let delChargeIdWiseName	= activeDeliveryChargesGlobal[sequence];

		for(let chargeId in delChargeIdWiseName) {
			if(chargeMasterIdWiseAmount != null && chargeMasterIdWiseAmount && chargeMasterIdWiseAmount[chargeId])
				chargeAmount = chargeMasterIdWiseAmount[chargeId];

			if (delChargeIdWiseName.hasOwnProperty(chargeId)) {
				let chrgCol		= document.createElement("td");
				let idArray 	= (configuration.HideChargesIds).split(',');
				
				let flag	= isValueExistInArray(idArray, chargeId);
				
				if(configuration.hideLorryHireFieldForOwnVehicle) {
					if((flag && configuration.HideChargesIfDoorDelivery && ddm.deliveryToForUser == 'Door Dly') || (Number(chargeId) == DOOR_DLY_HIRED))
						chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '" readonly class="width-50px text-align-right " type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0" onkeyup="setLorryHire()">'
					else
						chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '"  class="width-50px text-align-right " type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0" onkeyup="setLorryHire()">'
				} else if(flag && configuration.HideChargesIfDoorDelivery && ddm.deliveryToForUser == 'Door Dly')
					chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '" readonly class="width-50px text-align-right" type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0" onkeyup="setLorryHire()">'
				else
					chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '" class="width-50px text-align-right" type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0" onkeyup="setLorryHire()">'
				
				if(configuration.DdmCharges)
					NewRow.appendChild(chrgCol);
			}
		}
	}
	
	if(!configuration.DdmCharges) {
		for (let sequence in activeDeliveryChargesGlobal) {
			let delChargeIdWiseName	= activeDeliveryChargesGlobal[sequence];

			for(let chargeId in delChargeIdWiseName) {
				if (delChargeIdWiseName.hasOwnProperty(chargeId))
					document.getElementById("delCharges_" + chargeId).className = 'hide';
			}
		}
	}
	
	if(configuration.isDiscountShow) {
		$("#discount").removeClass('hide');
		$("#discountTypes").removeClass('hide');
		NewRow.appendChild(discountCol);
		NewRow.appendChild(discountTypeCol);
	}
	
	NewRow.appendChild(ctoDetainStatusCol);

	tableDEST.appendChild(NewRow);

	appendDestinationInDestination(ddm.destinationBranchId, ddm.destinationBranch);
	
	if(ddm.locationId != undefined && ddm.locationName != undefined && ddm.locationId != '' && ddm.locationName != '')
		appendDestinationInDestination(ddm.locationId, ddm.locationName);

	if(configuration.DeliveredTo) {
		showDeliveredToRow(wayBillId);

		if(configuration.DeliveredToAutoFill) {
			if(document.getElementById('deliveredToName_' + wayBillId))
				document.getElementById('deliveredToName_' + wayBillId).value = ddm.consigneeDetailsName;

			if(document.getElementById('deliveredToPhoneNo_' + wayBillId))
				document.getElementById('deliveredToPhoneNo_' + wayBillId).value = ddm.consigneePhoneNumber;
		}
	} else
		document.getElementById("DdmDeliveryDetails").className = 'hide'; 
	
	if(ddm.showBlackListedParty) {
		let wayBillDetilsObject 	= new Object();
		
		wayBillDetilsObject.wayBillId = wayBillId;
		wayBillDetilsObject.wayBillNo = wayBillNo;
		
		blackListedObject.push(wayBillDetilsObject)
		
		$('.isBlackListedParty_' + wayBillId).css('background-color', 'tomato');
		$('.isBlackListedParty_' + wayBillId).css('color', 'black');
		$('.isBlackListedParty_' + wayBillId).css('font-weight', 'bold');
	}
	
	let isReadOnly	= (configuration.readOnlyDeliveryDiscount || ddm.wayBillTypeId == WAYBILL_TYPE_TO_PAY && configuration.readOnlyDeliveryDiscountForToPayOnly);
	
	if(ddm.discountMasterId > 0)
		$('#discountTypes_' + wayBillId).val(ddm.discountMasterId);

	if(isReadOnly) {
		$('#discount_' + wayBillId).prop("readonly", isReadOnly);
		$('#discountTypes_' + wayBillId).prop("disabled", isReadOnly);
		$('#discountTypes_' + wayBillId).css({"color": "black", "font-weight": "bold"});
	}
}

function allowCRInput (el) {
	if (configuration.allowNumericForManualCRNo)
		el.value = el.value.replace(/[^0-9]/g, '');
	else
		el.value = el.value.replace(/[^a-zA-Z0-9]/g, '');
}

function addWithNewOrder(ddm) {
	let tableDEST = document.getElementById('tableBody');
	
	if(checkIfExistsWithId(ddm.wayBillId)) {
		showMessage('error', lrNumberAlreadyAdded(ddm.wayBillNumber));
		return false;
	}
	
	if(checkIfExists(ddm.wayBillNumber, ddm.wayBillId)) {
		$.confirm({
			text: "LR no "+ddm.wayBillNumber+" is already added to the list.Are you sure you want to add another LR with same number ?",
			confirm: function() {
				addDDmTableWithNewOrder(ddm, tableDEST);
			}, cancel: function() {
				showMessage('error', lrNumberAlreadyAdded(ddm.wayBillNumber));
				return false;
			},
			position			: 'center',
			confirmButton		: 'YES',
			cancelButton		: 'NO',
			confirmButtonClass	: 'btn-info',
			cancelButtonClass	: 'btn-danger'
		});
		$(".confirm").removeClass('confirm');
	} else
		addDDmTableWithNewOrder(ddm, tableDEST);
}

function addDDmTableWithNewOrder(ddm, tableDEST) {
	let wayBillNo		= ddm.wayBillNumber;
	let wayBillId		= ddm.wayBillId;
	let lrWiseLorryHireAmount	= ddm.lrWiseLorryHireAmount;

	let NewRow 				= document.createElement("tr");
	
	let checkBoxCol			= document.createElement("td");
	let lrNoCol				= document.createElement("td");
	let wayBillIdCol		= document.createElement("td");
	let lrTypeCol			= document.createElement("td");
	let sourceBranchCol		= document.createElement("td");
	let destinationBranchCol= document.createElement("td");
	let destBranchIdCol 	= document.createElement("td");
	let quantityCol			= document.createElement("td");
	let actualWeightCol		= document.createElement("td");
	let grandTotalCol		= document.createElement("td");
	let deliveryToCol		= document.createElement("td");
	let consigneeNameCol	= document.createElement("td");
	let delDetailsCol		= document.createElement("td");
	let remarkCol			= document.createElement("td");
	let discountCol			= document.createElement("td");
	let discountTypeCol		= document.createElement("td");
	let manualCRCol			= document.createElement("td");
	let lorryHireCol		= document.createElement("td");
	checkBoxCol.innerHTML 		= '<input name="wayBills" id="wayBills_'+wayBillId+'"  type="checkbox" value="'+wayBillId+'">';
	checkBoxCol.innerHTML		+= "<input name='wayBillBranchId_"+ wayBillId+"' id='wayBillBranchId_"+wayBillId+"'  type='hidden' value='"+ddm.branchId+"'/>";
	checkBoxCol.innerHTML		+= "<input name='wayBillNumber_"+wayBillId+"' id='wayBillNumber_"+wayBillId+"'  type='hidden' value='"+wayBillNo+"'/>";
	checkBoxCol.innerHTML		+= "<input name='wayBillType_"+wayBillId+"' id='wayBillType_"+wayBillId+"'  type='hidden' value='"+ddm.wayBillTypeId+"'/>";
	checkBoxCol.innerHTML		+= "<input name='lrActualWeight_"+wayBillId+"' id='lrActualWeight_"+wayBillId+"'  type='hidden' value='"+ddm.actualWeight+"'/>";
	checkBoxCol.innerHTML		+= "<input name='quantity_"+wayBillId+"' id='quantity_"+wayBillId+"'  type='hidden' value='"+ddm.quantity+"'/>";
	checkBoxCol.innerHTML		+= "<input name='wayBillReceivedDate_"+wayBillId+"' id='wayBillReceivedDate_"+wayBillId+"'  type='hidden' value='"+ddm.date+"'/>";
	checkBoxCol.innerHTML		+= "<input name='grandTotal_"+wayBillId+"' id='grandTotal_"+wayBillId+"'  type='hidden' value='"+ddm.grandTotal+"'/>";
	
	lrNoCol.innerHTML 			= wayBillNo;
	lrTypeCol.innerHTML 		= ddm.wayBillTypeStr;
	wayBillIdCol.innerHTML 		= wayBillId;
	
	if(ddm.srcBranchAbrCode != 'null' && typeof ddm.srcBranchAbrCode != 'undefined')
		sourceBranchCol.innerHTML 		= ddm.srcBranchAbrCode;
	else
		sourceBranchCol.innerHTML 		= ddm.sourceBranch;
	
	if(ddm.destBranchAbrCode != 'null' && typeof ddm.destBranchAbrCode != 'undefined')
		destinationBranchCol.innerHTML 		= ddm.destBranchAbrCode;
	else
		destinationBranchCol.innerHTML 		= ddm.destinationBranch;
	
	destBranchIdCol.innerHTML		= ddm.destinationBranchId;
	quantityCol.innerHTML			= ddm.quantity;
	actualWeightCol.innerHTML		= ddm.actualWeight;
	grandTotalCol.innerHTML			= ddm.grandTotal;
	deliveryToCol.innerHTML			= ddm.deliveryToForUser;
	consigneeNameCol.innerHTML		= ddm.consigneeDetailsName;

	removeAllContentFromDiv('deliveryDetailsDiv_Def2');

	createDeliveryDetailsTableForSingleRow($('#deliveryDetailsDiv_Def2'), wayBillId);
	delDetailsCol.innerHTML	= document.getElementById('deliveryDetailsDiv_Def2').innerHTML;

	checkBoxCol.className				= 'datatd isBlackListedParty_'+wayBillId;
	lrNoCol.className					= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	lrTypeCol.className					= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	sourceBranchCol.className			= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	destinationBranchCol.className		= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	destBranchIdCol.className			= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	quantityCol.className				= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	actualWeightCol.className			= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	grandTotalCol.className				= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	deliveryToCol.className				= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	consigneeNameCol.className			= 'datatd font-size-12px isBlackListedParty_'+wayBillId;
	remarkCol.className 				= 'datatd isBlackListedParty_'+wayBillId;
	delDetailsCol.className 			= 'datatd isBlackListedParty_'+wayBillId;
	discountCol.className 				= 'datatd isBlackListedParty_'+wayBillId;
	discountTypeCol.className 			= 'datatd isBlackListedParty_'+wayBillId;
	lorryHireCol.className 				= 'datatd isBlackListedParty_'+wayBillId;
	
	checkBoxCol.align 				= 'left';
	lrNoCol.align 					= 'left';
	lrTypeCol.align 				= 'left';
	wayBillIdCol.align 				= 'left';
	sourceBranchCol.align 			= 'left';
	destinationBranchCol.align 		= 'left';
	destBranchIdCol.align 			= 'left';
	quantityCol.align 				= 'right';
	actualWeightCol.align			= 'right';
	grandTotalCol.align				= 'right';
	deliveryToCol.align				= 'left';
	consigneeNameCol.align			= 'left';

	wayBillIdCol.style.display			='none';
	destBranchIdCol.style.display		='none';

	NewRow.appendChild(checkBoxCol);
	NewRow.appendChild(lrNoCol);
	NewRow.appendChild(lrTypeCol);
	NewRow.appendChild(wayBillIdCol);
	NewRow.appendChild(sourceBranchCol);
	NewRow.appendChild(destinationBranchCol);
	NewRow.appendChild(destBranchIdCol);
	NewRow.appendChild(quantityCol);
	NewRow.appendChild(actualWeightCol);
	NewRow.appendChild(grandTotalCol);
	NewRow.appendChild(deliveryToCol);
	NewRow.appendChild(consigneeNameCol);
	
	if(configuration.DeliveredTo)
		NewRow.appendChild(delDetailsCol);

	let chargeMasterIdWiseAmount = null;
	
	if(wbIdWiseDeliveryCharges && wbIdWiseDeliveryCharges[wayBillId] && !jQuery.isEmptyObject(wbIdWiseDeliveryCharges[wayBillId]))
		chargeMasterIdWiseAmount = wbIdWiseDeliveryCharges[wayBillId];

	for (let sequence in activeDeliveryChargesGlobal) {
		chargeAmount = '';
		let delChargeIdWiseName	= activeDeliveryChargesGlobal[sequence];

		for(let chargeId in delChargeIdWiseName) {
			if(chargeMasterIdWiseAmount != null && chargeMasterIdWiseAmount && chargeMasterIdWiseAmount[chargeId])
				chargeAmount = chargeMasterIdWiseAmount[chargeId];

			if (delChargeIdWiseName.hasOwnProperty(chargeId)) {
				let chrgCol		= document.createElement("td");
				let idArray 	= (configuration.HideChargesIds).split(',');
				let flag		= isValueExistInArray(idArray, chargeId);

				chrgCol.className = 'datatd isBlackListedParty_' + wayBillId;

				if(flag && configuration.HideChargesIfDoorDelivery && ddm.deliveryToForUser == 'Door Dly')
					chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '" readonly class="width-50px text-align-right" type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0">'
				else
					chrgCol.innerHTML	= '<input id="delCharge_' + chargeId + '_' + wayBillId + '" class="width-50px text-align-right" type="text" name="delCharge_' + chargeId + '_' + wayBillId + '" value="' + chargeAmount + '" onkeypress="return noNumbers(event);" placeholder="0">'

				if(configuration.DdmCharges)
					NewRow.appendChild(chrgCol);
			}
		}
	}
	
	if(!configuration.DdmCharges){
		for (let sequence in activeDeliveryChargesGlobal) {
			let delChargeIdWiseName	= activeDeliveryChargesGlobal[sequence];

			for(let chargeId in delChargeIdWiseName) {
				if (delChargeIdWiseName.hasOwnProperty(chargeId)) {
					document.getElementById("delCharges_"+chargeId).className = 'hide';
				}	
			}
		}
	}	
	
	NewRow.appendChild(remarkCol);
	
	if(configuration.isAllowManualCRWithoutSeqCounter)
		NewRow.appendChild(manualCRCol);
	
	if(showLrWiseLorryHireColumn)
		NewRow.appendChild(lorryHireCol);

	tableDEST.appendChild(NewRow);

	appendDestinationInDestination(ddm.destinationBranchId, ddm.destination);
	
	if(ddm.locationId != undefined && ddm.locationName != undefined && ddm.locationId != '' && ddm.locationName != '')
		appendDestinationInDestination(ddm.locationId, ddm.locationName);
	
	if(configuration.DeliveredTo)
		showDeliveredToRow(wayBillId);
	
	if(configuration.DeliveredTo) {
		if(configuration.DeliveredToAutoFill) {
			if(ddm.ddbWiseSelfPartyId != ddm.consigneeCorpId) {
				$('#deliveredToName_' + wayBillId).val(ddm.consigneeDetailsName);
				$('#deliveredToPhoneNo_' + wayBillId).val(ddm.consigneePhoneNumber);
				$("#deliveredToRow_" + wayBillId).switchClass('hide', 'show');
			} else if(ddm.ddbWiseSelfPartyId == ddm.consigneeCorpId)
				$("#deliveredToPhoneNo_" + wayBillId).css('display', 'none');
		}
	} else
		document.getElementById("DdmDeliveryDetails").className = 'hide'; 
	
	remarkCol.innerHTML	= '<input id="remark_' + wayBillId + '" type="text" name="remark_' + wayBillId + '" value="" placeholder="Remark" onblur="setFocusOnNextWayBillDelivery(this);">'
	remarkCol.className ='isBlackListedParty_'+wayBillId;

	if(configuration.isAllowManualCRWithoutSeqCounter)
		manualCRCol.innerHTML = '<input id="manualCRNo_' + wayBillId + '" type="text" name="manualCRNo_' + wayBillId + '" value="" placeholder="Manual CR No" maxlength="8" oninput="allowCRInput(this);" onblur="checkDuplicateCR(' + wayBillId + ', this);">';

	let isLrWiseLorryHireReadOnly = Number(lrWiseLorryHireAmount) > 0 ? 'readonly' : '';
	lorryHireCol.innerHTML	= '<input id="lrWiseLorryHireAmount_' + wayBillId + '" type="text" name="lrWiseLorryHireAmount_' + wayBillId + '" value="'+ lrWiseLorryHireAmount +'" placeholder="Lorry Hire" onblur="setFocusOnNextWayBillDelivery(this);" '+ isLrWiseLorryHireReadOnly+'>'
	lorryHireCol.className	= 'isBlackListedParty_' + wayBillId;		
	
	if(ddm.showBlackListedParty) {
		let wayBillDetils = new Object();
		wayBillDetils.wayBillId = wayBillId;
		wayBillDetils.wayBillNo = wayBillNo;
		blackListedObject.push(wayBillDetils)
		
		$('.isBlackListedParty_' + wayBillId).css('background-color', 'red');
		$('.isBlackListedParty_' + wayBillId).css('color', 'black');
		$('.isBlackListedParty_' + wayBillId).css('font-weight', 'bold');
	}		
}

function setFocusOnNextWayBillDelivery(ele) {
	let elementData = ele.name;
	let elePos = Number(elementData.split("_")[1]) + Number(1);
	next = 'wayBills_' + elePos;
}

function setFocusOnNextchkBox(ele){
	let elementData = ele.name;
	let elePos = elementData.split("_")[1];
	
	next = 'wayBills_'+(elePos+1);
	
}

function checkIfExists(wayBillNo, wayBillId) {
	return $('#wayBillNumber_' + wayBillId).val() == wayBillNo;
}

function checkIfExistsWithId(wayBillId) {
	return Number($('#wayBills_' + wayBillId).val()) == wayBillId;
}

function checkIfExistsWithBillId(id) {
	return $('#addedBillSelection').val() != undefined && Number($('#addedBillSelection').val()) != id;
}

function checkIfExistsWithDivisionId(id) {
	return $('#addedDivisionSelection').val() != undefined && Number($('#addedDivisionSelection').val()) != id;
}

function appendDestinationInDestination(destBranchId, destination) {
	if(!destinationExists(destBranchId)) {
		$('#DestinationBranchId').append('<option value=' + destBranchId + '>' + destination + '</option>');
		$("#DestinationBranchId").val(destination);
	}
}

function destinationExists(val) {
	return $("#DestinationBranchId option[value='" + val + "']").length !== 0;
}

function selectAllOutboundCargo(param) {
	let tab 	= document.getElementById('dispatchTable');
	let count 	= parseFloat(tab.rows.length - 1);
	
	for (let row = count; row > 0; row--) {
		if(document.getElementById('dispatchTable').rows[row].style.display == '')
			tab.rows[row].cells[0].firstChild.checked = param; 
	}
	
	if(configuration.hideLorryHireFieldForOwnVehicle && Number($('#vehicleType').val()) == HIRED_VEHICLE_ID)
		setLorryHire();
}

function selectAll(param) {
	let tab 	= document.getElementById('lrDetailsTable');
	let count 	= parseFloat(tab.rows.length - 1);
	
	for (let row = count; row > 0; row--) {
		if(document.getElementById('lrDetailsTable').rows[row].style.display == '')
			tab.rows[row].cells[0].firstChild.checked = param; 
	}
}

function deleteDispatchWayBills(tableId) {
	let tableEl 		= document.getElementById(tableId);
	let found 			= false;
	let selectAll       = $("#selectAll").is(':checked');

	for (let row = tableEl.rows.length - 1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0] 
		&& tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
			if(selectAll) {
				if(confirm('Are you sure you want to Remove all LRs?')) {
					resetDDMData();
					let el = tableEl.rows[row];
					el.parentNode.removeChild(el);
					found = true;
				}
			} else {
				let el = tableEl.rows[row];
				el.parentNode.removeChild(el);
				found = true;
			}
		}
	}
	
	updateSummary();
	
	if(!found && !selectAll) {
		if(tableEl.rows.length == 1)
			showMessage('error', "There is no LR to delete !!");
		else
			showMessage('error', "Please select atleast one LR to delete !!");
	}
}

function setSummaryTable() {
	if(!$("#summaryTableHead").exists() || $("#summaryTableHead").exists() == 'false'){
		$('#left-border-boxshadow').removeClass('hide');
		$('#summaryDetails').empty();
		
		let columnArray		= new Array();
		
		columnArray.push("<th style='width: 6%; text-align: center;'>Total LRs</th>");
		columnArray.push("<th style='width: 6%; text-align: center;'>Total Articles</th>");
		columnArray.push("<th style='width: 6%; text-align: center;'>Total Weight</th>");
		columnArray.push("<th style='width: 6%; text-align: center;'>Total Dly Amt</th>");
		
		$('#summaryTable thead').append('<tr id="summaryTableHead" class="text-info text-center danger">' + columnArray.join(' ') + '</tr>');
		
		columnArray	= [];
		
		columnArray.push("<td id='totalLR' style='text-align: center; vertical-align: middle;'></td>");
		columnArray.push("<td id='totalArticle' style='text-align: center; vertical-align: middle;'></td>");
		columnArray.push("<td id='totalWeight' style='text-align: center; vertical-align: middle;'></td>");
		columnArray.push("<td id='totalDlyAmt' style='text-align: center; vertical-align: middle;'></td>");
		
		$('#summaryTable tbody').append('<tr id="summaryTableBody">' + columnArray.join(' ') + '</tr>');
	}
}

function updateSummary() {
	let tableEl	= document.getElementById('dispatchTable');
	
	if(tableEl == null)
		tableEl = document.getElementById('lrDetailsTable');
	
	if(tableEl == null) return;
	
	let tableLength		= tableEl.rows.length - 1;
	let totalDlyAmt		= 0; 
	let totalArticles	= 0; 
	let totalWeight		= 0; 

	for (let row = tableLength; row > 0; row--) {
		let cellsLength	= tableEl.rows[row].cells.length;
		let tableEle    = tableEl.rows[row].cells;

		totalDlyAmt 	+= Number(tableEle[cellsLength - 4].innerHTML);
		totalArticles 	+= Number(tableEle[cellsLength - 3].innerHTML);
		totalWeight 	+= Number(tableEle[cellsLength - 2].innerHTML);

		let index = totalQtyArr.indexOf(totalArticles);

		if (index > -1) {
			totalQtyArr.splice(index, 1);
			totalDlyArr.splice(index, 1);
		}
	}
	
	setTimeout(() => {
		$('#totalArticle').html(totalArticles);
		$('#totalWeight').html(totalWeight);
		$('#totalDlyAmt').html(totalDlyAmt);
		$('#totalLR').html(tableLength);
	}, 200);
}


function arrayRemove(arr, value) {
   return arr.filter(function(ele){
       return ele == value;
   });

}

function resetDDMData(){
	$('#lrDetailsTable').empty();
	$('#summaryHeader').empty();
	$('#summaryDetails').empty();
	wayBillIdList	= [];          
	count 			= 0;           
	totalQtyArr 	= new Array(); 
	totalWeightArr 	= new Array(); 
	totalToPayArr 	= new Array(); 
	totalAmtArr 	= new Array(); 
	totalDlyArr 	= new Array(); 
	wayBillIdArr 	= new Array(); 
	wayBillIdArr2 	= new Array(); 
	ddmData			= null;        
	doneTheStuff	= false;       
	headerExist 	= false;       
	response		= null;                      

	setTimeout(function(){
		$('lrDetailsTableDiv').addClass('hide');
		$('summaryDiv').addClass('hide');
	}, 500);
	
}

function hideDispatchButton() {
	let dispatchButton = document.getElementById('dispatchButton');
	
	if(dispatchButton != null) {
		dispatchButton.className 		= 'btn_print_disabled';
		dispatchButton.style.display 	= 'none'; 
		dispatchButton.disabled			= true;
	}
}

function showDispatchButton() {
	let dispatchButton = document.getElementById('dispatchButton');
	
	if(dispatchButton != null) {
		dispatchButton.className 		= 'btn btn-primary';
		dispatchButton.style.display 	= 'block'; 
		dispatchButton.disabled			= false;
	}
}

function selectAllEle(tableId) {
	hideDispatchButton();
	showLayer();

	if(!startProcess (tableId)) {
		showDispatchButton();
		hideLayer();
	}
}

function driverNameOnChange() {
	let tab	= '';
	
	if($('#dispatchTable').exists() && $('#dispatchTable').is(":visible"))
		tab 		= document.getElementById('dispatchTable');
	else if($('#lrDetailsTable').exists() && $('#lrDetailsTable').is(":visible"))
		tab 		= document.getElementById('lrDetailsTable');
	
	let count 		= parseFloat(tab.rows.length - 1);
	let driver		= $("#driverName").val().split("(")[0];
	let vehicleNum	= $("#vehicleNumber").val();
	let deliveredToName = driver + '(' + vehicleNum + ')';
	
	if(configuration.deliveredToNameFillWithDriverName) {
		for (let row = count; row > 0; row--) {
			$("#deliveredToName_" + tab.rows[row].cells[0].firstChild.value).val(deliveredToName);
		}
	}
	
	if(configuration.deliveredToNumberFillWithDriverNumber) {
		for (let row = count; row > 0; row--) {
			$("#deliveredToPhoneNo_" + tab.rows[row].cells[0].firstChild.value).val($("#driverMobileNumber").val());
		}
	}
}

function startProcess (tableId) {
	if($('#middle-border-boxshadow').css('display') == 'none')
		hideNShowVehcileDetails();
	
	if(configuration.TruckNumber && configuration.TruckNumberValidation) {
		if(!validateInput(1, "vehicleNumber", "vehicleNumber", "",  truckNumberErrMsg))
			return false;
		
		if(!validateInput(1, "selectedVehicleNumberMasterId", "vehicleNumber", "", properTruckNumberErrMsg))
			return false;
	}
	
	if(configuration.allowDDMCreationAfterAllDDMSettled && !isAllDDMSettled) {
		showMessage('error', "Please Clear Pending DDM Settlement On This Vehicle Number");
		return false;
	}
	
	if(configuration.DriverName) {
		if(configuration.DriverNameValidation && !validateInput(1, "driverName", "driverName", "",  DriverErrMsg))
			return false;
		
		if(configuration.validateDriverNameFromMaster && $('#driver1Insert').val() == 0) {
			showMessage('error', "Please Enter Valid Driver Name !!");
		    return false;
		} 
	}
	
	if(configuration.DriverNo && configuration.DriverNoValidation
		&& !validateInput(1, "driverMobileNumber", "driverMobileNumber", "",  driveryNumberErrMsg))
			return false;
	
	if(configuration.TruckDestination && configuration.TruckDestinationValidation
		&& !validateInput(1, "truckDestination", "truckDestination", "",destinationErrMsg))
		return false;
	
	if(configuration.Destination && configuration.DestinationValidation
		&& !validateInput(1, "DestinationBranchId", "DestinationBranchId", "", destinationBranchErrMsg))
		return false;
	
	if(configuration.Remark && configuration.RemarkValidation && !validateInput(1, "remark", "remark", "",  ramarkErrMsg))
		return false;

	if(configuration.LorryHire && configuration.LorryHireValidation) {
		if(configuration.hideLorryHireFieldForOwnVehicle) {
			if(Number($('#vehicleType').val()) == HIRED_VEHICLE_ID
				&& !validateInput(1, "ddmLorryHire", "ddmLorryHire", "", lorryHireAmountErrMsg))
				return false;
		} else if(!validateInput(1, "ddmLorryHire", "ddmLorryHire", "", lorryHireAmountErrMsg))
			return false;
	}
	
	if(configuration.deliveryExecutiveName && configuration.validateDeliveryExecutiveName
		&& !validateInput(1, "deliveryExecutiveName", "deliveryExecutiveName", "",  deliveryExecutiveErrMsg))
		return false;

	if(configuration.deliveryExecutiveNumber && configuration.validateDeliveryExecutiveContact 
		&& !validateInput(1, "deliveryExecutiveNumber", "deliveryExecutiveNumber", "",  deliveryExecutiveNumberErrMsg))
		return false;
	
	if(configuration.openingKilometerValidation && !validateInput(1, "openingkilometerEle", "openingkilometerEle", "",  openingKilometerErrMsg))
		return false;
		
	if(manualDDMWithAutoDDMSequence && !validateManualDDMDate(tableId))
		return false;
	
	if((manualDDMWithManualDDMSequence || configuration.manualDDMWithoutSequence) && !validateManualDDMSequence(tableId))
		return false;

	if(configuration.hideLorryHireFieldForOwnVehicle && $('#LorryHireDetails').exists() && $('#LorryHireDetails').is(":visible")
		&& !validateLorryHire())
			return false;

	if(configuration.showCollectionPerson
		&& !validateInput(1, "collectionPersonName", "collectionPersonName", "",  validCollectionPersionErrMsg))
		return false;

	let configuredVehicleTypes	= configuration.configuredVehicleTypesToSendDDMCreationSms;
	let vehicleTypeArray		= configuredVehicleTypes.split(',').map(Number);
	let selectedVehicleType		= Number($('#vehicleType').val());	

	let driverNo = $('#driverMobileNumber').val();
	
	if (!validateDriverPhoneNumber(driverNo))
		return; 
	
	if (configuration.showOTPCheckBoxAtDDMCreate && vehicleTypeArray.includes(selectedVehicleType)) {
		if (!$('#OTPSelection').prop('checked')) {
 			showMessage('error', 'Please check the SEND OTP box to proceed.');
			return false; 
		}
	
		if (validateDriverPhoneNumber(driverNo) && $('#OTPSelection').prop('checked'))
			$("#ddmTimeOTPDiv").removeClass('hide');
		else {
			$("#ddmTimeOTPDiv").addClass('hide');
			return false;
		}

		if ($('#OTPSelection').prop('checked')) {
			let otpNumberString = $('#OTPNo').val();
		
			if(otpNumberString == 0 || otpNumberString == '') {
				$('#OTPNo').focus();
				showMessage('error', "Please Enter OTP !");
				return false;
			} else if(OTPNumber != otpNumberString) {
				$('#OTPNumber').focus();
				showMessage('error', "Please Enter Valid OTP !");
				return false;
			}
		}
	}

	return validateLRDetails() && checkProcessData(tableId);
}

function checkProcessData(tableId) {
	let tableEl = document.getElementById(tableId);
	let count	= parseFloat(tableEl.rows.length - 1);

	if(count < 1) {
		showMessage('error', "Please select atleast one LR for Door Delivery !!");
		return false;
	}

	let branchflag 		= false;
	let noOtherBranchLR	= true;
	let isCTODetainLR	= false;
	
	for (let row = count; row > 0; row--) {
		// first set all check boxes to unchecked
		tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;

		// check WayBill destination branch with selected destination branch

		let wayBillId		= tableEl.rows[row].cells[0].getElementsByTagName("input")[0].value;
		
		let ctoDetainStatus = Number($('#cto_' + wayBillId).html());
		let branchId 		= Number($('#wayBillBranchId_' + wayBillId).val());
		let subRegiond 		= Number($('#wayBillSubRegionId_' + wayBillId).val());
		
		if(configuration.subRegionWiseDDMSearch) {
			if(!isNaN(parseInt(subRegiond))) {
				if(parseInt(executiveSubRegionId) == parseInt(subRegiond)) {
					branchflag = true;
					tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
				}
			} else if(parseInt(executiveBranchId) == parseInt(branchId)) { //executiveBranchId defined global on main page
				branchflag = true;
				tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
			}
		} else if(parseInt(executiveBranchId) == parseInt(branchId)) { //executiveBranchId defined global on main page
			branchflag = true;
			// check those way bills which are dispatching in wrong branch
			tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
		} else if(configuration.validateLRForOwnBranch)
			noOtherBranchLR = false;
		
		if(configuration.isCTODetainAllowed && ctoDetainStatus == 1) {
			tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;
			isCTODetainLR = true;
		}
		
		if(configuration.lorryHireValidationLrWise && showLrWiseLorryHireColumn) {
			let rawVal		= $("#lorryHire_" + wayBillId).val();
			
			let lorryHireVal = parseFloat(rawVal);
			
			if (rawVal === undefined || rawVal.trim() === "" || isNaN(lorryHireVal) || Number(lorryHireVal) <= 0) {
				showMessage('error', "Please Enter Lorry Hire.!");
				$("#lorryHire_" + wayBillId).css("border", "1px solid red");
				return;
			}
		}
	}

	if(branchflag && noOtherBranchLR && !isCTODetainLR) { // condition for Wrong Branch
		return dispatchWayBill(tableEl, count);
	} else {
		if(isCTODetainLR) {
			showMessage('error', "You are not allowed to Load CTO Detained LR Remove Unchecked LR's !!");
			return false;
		}
		
		showMessage('error', "You are not allowed to Load other Branch LR's !! !!");
		return false;
	}
} 

function dispatchWayBill(tableEl, count) {
	let answer = confirm ("Loaded " + parseFloat(tableEl.rows.length - 1) + " LR's for Door Delivery ?");

	if (answer) {
		let totalNoOfWayBills				= 0;
		let totalNoOfPackages				= 0;
		let totalActualWeight				= 0.00;
		let totalNoOfForms					= 0;

		for (let row = count; row > 0; row--) {
			tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
			
			totalNoOfWayBills ++;
			
			let wayBillId			= tableEl.rows[row].cells[0].getElementsByTagName("input")[0].value;
			
			totalNoOfPackages		= totalNoOfPackages	+ Number($('#quantity_' + wayBillId).val());
			totalActualWeight		= totalActualWeight	+ Number($('#lrActualWeight_' + wayBillId).val());
		}

		$("#totalNoOfWayBills").val(totalNoOfWayBills);
		$("#totalNoOfPackages").val(totalNoOfPackages);
		$("#totalActualWeight").val(totalActualWeight);
		$("#totalNoOfForms").val(totalNoOfForms);

		generateDDM();
		return true;
	}
		
	return false;
}

function generateDDM() {
	let jsonObjectdata 	= new Object();
	jsonObjectdata	= setJsonObj();

	let jsonStr 	= JSON.stringify(jsonObjectdata);
	$.post("WayBillAjaxAction.do?pageId=304&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					hideLayer();
					showDispatchButton();
				} else {
					let deliveryRunSheetLedgerId 	= null;
					let DDMNo				 		= '';

					if(data.deliveryRunSheetLedgerId) {
						deliveryRunSheetLedgerId = data.deliveryRunSheetLedgerId; 

						if(data.DDMNo)
							DDMNo = data.DDMNo;

						window.open('DDMPrint.do?pageId=304&eventId=4&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId+'&DDMNo='+DDMNo);
						resetPage();
					} else {
						showMessage('error', 'Try Again !!');
						showDispatchButton();
					}
				}

				hideLayer();
			});
}

function setJsonObj () {
	let jsonObjectdata 	= new Object();
	let waybillIdArray 	= new Array();

	jsonObjectdata.selectedVehicleNumberMasterId 		= $('#selectedVehicleNumberMasterId').val(); 
	jsonObjectdata.destinationBranchId 					= $('#DestinationBranchId').val(); 
	jsonObjectdata.remark 								= $('#remark1').val(); 
	jsonObjectdata.vehicleNumber 						= $('#vehicleNumber').val(); 
	jsonObjectdata.driverName 							= $('#driverName').val(); 
	jsonObjectdata.driverMobileNumber 					= $('#driverMobileNumber').val(); 
	jsonObjectdata.driverId			 					= $('#driver1Insert').val(); 
	jsonObjectdata.vehicleAgent 						= $('#vehicleAgent').val(); 
	jsonObjectdata.totalActualWeight 					= $('#totalActualWeight').val(); 
	jsonObjectdata.totalNoOfForms 						= $('#totalNoOfForms').val(); 
	jsonObjectdata.totalNoOfPackages 					= $('#totalNoOfPackages').val(); 
	jsonObjectdata.totalNoOfWayBills 					= $('#totalNoOfWayBills').val(); 
	jsonObjectdata.ddmLorryHire							= $('#ddmLorryHire').val(); 
	jsonObjectdata.deliveryExecutiveName 				= $('#deliveryExecutiveName').val(); 
	jsonObjectdata.deliveryExecutiveNumber 				= $('#deliveryExecutiveNumber').val(); 
	jsonObjectdata.truckDestination 					= $('#truckDestination').val();
	jsonObjectdata.openingkilometerEle 					= $('#openingkilometerEle').val();
	jsonObjectdata.collectionPersonId 					= $('#collectionPersonId').val();
	jsonObjectdata.billSelectionId 						= $('#billSelection').val();
	jsonObjectdata.vehicleAgentMasterId					= $('#VehicleAgent_primary_key').val();
	jsonObjectdata.divisionId							= $('#divisionSelection').val();

	if(manualDDMWithAutoDDMSequence) {
		if($('#isManualDDM').prop( "checked")) {
			jsonObjectdata.isManualDDM		= true
			jsonObjectdata.manualDDMDate	= $('#manualDDMDate').val();
		} else
			jsonObjectdata.isManualDDM		= false
	} else if(manualDDMWithManualDDMSequence || configuration.manualDDMWithoutSequence) {
		if($('#isManualDDM').prop( "checked")) {
			jsonObjectdata.isManualDDM		= true
			jsonObjectdata.manualDDMDate	= $('#manualDDMDate').val();
			jsonObjectdata.manualDDMNumber	= $('#manualDDMNumber').val();
		} else
			jsonObjectdata.isManualDDM		= false;
	} else
		jsonObjectdata.isManualDDM		= false;
	
	$('input[name="wayBills"]:checked').each(function() {
		waybillIdArray.push(this.value);
	});

	jsonObjectdata.waybillIdArray		= waybillIdArray; 
	jsonObjectdata.wbWiseObj			= getWBOtherData(waybillIdArray, jsonObjectdata);
	jsonObjectdata.ravanaExpense		= $('#ravanaExpense').val();
	
	if(showOpeningKilometer)
		jsonObjectdata.kilometerReading		= $('#openingkilometerEle').val();
	else
		jsonObjectdata.kilometerReading		= $('#kilometerReading').val();
	
	jsonObjectdata.dieselRatePerLiter		= $('#dieselRatePerLiter').val();
	jsonObjectdata.dieselLiter				= $('#dieselLiter').val();
	jsonObjectdata.dieselLiterBy			= $('#dieselLiterBy').val();
	jsonObjectdata.tripHisabRemark			= $('#tripHisabRemark').val();
	jsonObjectdata.vehicleType				= $('#vehicleType').val();
	jsonObjectdata.newConsigneeCorpAccId 	= $('#newConsigneeCorpAccId').val();
	jsonObjectdata.articleRate 			 	= $('#articleRate').val();
	jsonObjectdata.loaderName				= $('#loaderName').val();
	jsonObjectdata.deliveryMan1				= $('#deliveryMan1').val();
	jsonObjectdata.deliveryMan2				= $('#deliveryMan2').val();
	jsonObjectdata.hamalMasterId			= $('#hamalTeamLeaderNameEle_primary_key').val();

	return jsonObjectdata;
}

function resetPage() {
	if (isbranchSelectionByPendingStock) {
		resetBranchSelectionByPendingStock();
	} else {
		require(["BranchSelection/Destination"], function (result) {
			resetBranchSelection();
		});
	}

	resetDeliveryFor();
	resetLRNumber();
	resetTruckDetails();
	resetDispatchDetails();
	hideDispatchButton();
	location.reload(true);
}

function resetLRNumber() {
	$('#wayBillNumber').val('');
}

function getWBChargesData (uniqueId) {
	let wbCharges		= new Object;

	for (let sequence in activeDeliveryChargesGlobal) {
		let delChargeIdWiseName	= activeDeliveryChargesGlobal[sequence];

		for(let chargeId in delChargeIdWiseName) {
			if (delChargeIdWiseName.hasOwnProperty(chargeId))
				wbCharges[uniqueId + "_" + chargeId] = $('#delCharge_' + chargeId + '_' + uniqueId).val();
		}
	}

	return wbCharges;
}

function getWBOtherData (waybillIdArray, jsonObjectdata) {
	let wbWiseObj	= new Object;

	for(const uniqueId of waybillIdArray) {
		let wbDetailsObj	= new Object();

		wbDetailsObj.waybillId					= uniqueId; 
		wbDetailsObj.deliveryPaymentType		= $('#paymentType_' + uniqueId).val();
		wbDetailsObj.deliveredToName			= $('#deliveredToName_' + uniqueId).val();
		wbDetailsObj.deliveredToPhoneNo			= $('#deliveredToPhoneNo_' + uniqueId).val();
		wbDetailsObj.chequeDate					= $('#chequeDate_' + uniqueId).val();
		wbDetailsObj.chequeNo					= $('#chequeNo_' + uniqueId).val();
		wbDetailsObj.chequeAmount				= $('#chequeAmount_' + uniqueId).val();
		wbDetailsObj.bankName					= $('#bankName_' + uniqueId).val();
		wbDetailsObj.selectedDeliveryCreditorId	= $('#deliveryCreditor_' + uniqueId).val();
		wbDetailsObj.discount					= $('#discount_' + uniqueId).val();
		wbDetailsObj.discountTypes				= Number($('#discountTypes_' + uniqueId).val());
		wbDetailsObj.remark						= $('#remark_' + uniqueId).val();
		wbDetailsObj.wbCharges					= getWBChargesData(uniqueId);
		
		jsonObjectdata['lrActualWeight_' + uniqueId]	= $('#lrActualWeight_' + uniqueId).val();
		jsonObjectdata['wayBillNumber_' + uniqueId]		= $('#wayBillNumber_' + uniqueId).val();
		jsonObjectdata['wayBillType_' + uniqueId]		= $('#wayBillType_' + uniqueId).val();
		
		if(configuration.isAllowManualCRWithoutSeqCounter)
			jsonObjectdata['manualCRNo_' + uniqueId]		= $('#manualCRNo_' + uniqueId).val();
		
		if($('#lrWiseLorryHireAmount_' + uniqueId) != undefined)
			jsonObjectdata['lrWiseLorryHireAmount_' + uniqueId]		= $('#lrWiseLorryHireAmount_' + uniqueId).val();
		else
			jsonObjectdata['lrWiseLorryHireAmount_' + uniqueId]		= 0;

		wbWiseObj[uniqueId]		= wbDetailsObj;
	}
	
	return wbWiseObj;
}

function checkBlackListedLR(wbId) {
	let wayBillNumber = '';
	
	for(const element of blackListedObject) {
		if(Number(element.wayBillId) == wbId)
			wayBillNumber = element.wayBillNo; 
	}
	
	return wayBillNumber;
}

function validateDeliveryDiscount(obj, bookingAmount, grandTotal, lrType) {
	let array 			= obj.id.split('_', 2);
	let wayBillId 		= array[1];
	let discountAmount  = Number(obj.value);
	
	if(lrType == WAYBILL_TYPE_TO_PAY) {
		if(activeDeliveryChargesGlobal != null) {
			let dataKey				= Object.keys(activeDeliveryChargesGlobal);
			
			for (const element of dataKey) {
				let objKey	= Object.keys(activeDeliveryChargesGlobal[element]);
			
				for (const element of objKey) {
					grandTotal += Number($('#delCharge_' + element + '_' + wayBillId).val());
				}
			}
		}
		
		if(discountAmount > grandTotal) {
			showMessage('error', 'Discount cannot be more than Delivery Amount');
			$("#" + obj.id).focus();
			$("#" + obj.id).val(0);
			return false;
		}
	} else {
		if(activeDeliveryChargesGlobal != null) {
			let dataKey		= Object.keys(activeDeliveryChargesGlobal);
			
			for (const element of dataKey) {
				let objKey	= Object.keys(activeDeliveryChargesGlobal[element]);
				
				for (const element of objKey) {
					bookingAmount += Number($('#delCharge_' + element + '_' + wayBillId).val());
				}
			}
		}
		
		if(discountAmount > bookingAmount) {
			showMessage('error', 'Discount cannot be more than Delivery Amount');
			$("#" + obj.id).focus();
			$("#" + obj.id).val(0);
			return false;
		}
	}
}
 
function setLorryHire() {
	if(configuration.hideLorryHireFieldForOwnVehicle) {
		if(Number($('#vehicleType').val()) == HIRED_VEHICLE_ID) {
			let totalLorryHireAmount	= 0;
			let tableEl	= '';

			if($('#dispatchTable').exists() && $('#dispatchTable').is(':visible'))
				tableEl = document.getElementById(lrDetailsTableNewId);
			else if($('#lrDetailsTable').exists() && $('#lrDetailsTable').is(':visible'))
				tableEl = document.getElementById(lrDetailsTableNewId2);

			let count = parseInt(tableEl.rows.length);

			for(let i = 1; i < count; i++) {
				let bkgTimeDoorDlyOwn		= 0;
				let bkgTimeDoorDlyHired		= 0;
				let dlyTimeDoorDlyOwn		= 0;
				let dlyTimeDoorDlyHired		= 0;

				let chkBox = tableEl.rows[i].cells[0].children[0];

				if(chkBox && chkBox.checked) {
					let selectedWayBillId	= chkBox.value;

					bkgTimeDoorDlyOwn		= Number($('#bkgCharge_' + DOOR_DLY_OWN + '_' + selectedWayBillId).html());
					bkgTimeDoorDlyHired		= Number($('#bkgCharge_' + DOOR_DLY_HIRED + '_' + selectedWayBillId).html());

					dlyTimeDoorDlyOwn		= Number($('#delCharge_' + DOOR_DLY_OWN + '_' + selectedWayBillId).val());
					dlyTimeDoorDlyHired		= Number($('#delCharge_' + DOOR_DLY_HIRED + '_' + selectedWayBillId).val());
				}
				
				totalLorryHireAmount 	+= (bkgTimeDoorDlyOwn + bkgTimeDoorDlyHired + dlyTimeDoorDlyOwn + dlyTimeDoorDlyHired);
			}

			if($('#LorryHireDetails').exists() && $('#LorryHireDetails').is(":visible"))
				$('#ddmLorryHire').val(Number(totalLorryHireAmount));

			totalLorryHire	= Number(totalLorryHireAmount);
		} else
			$('#ddmLorryHire').val(0);
	}
}

function validateLorryHire() {
	if(configuration.hideLorryHireFieldForOwnVehicle && Number($('#vehicleType').val()) == HIRED_VEHICLE_ID) {
		let lorryHireAmount	= Number($('#ddmLorryHire').val());

		if(Number(lorryHireAmount) > Number(totalLorryHire)) {
			showMessage('error', 'Lorry Hire Cannot Be More Than Total Door Dly Charges!');
			$('#ddmLorryHire').focus();
			return false;
		}
	}
	
	return true;
}
function focusOnDriverName(){
	if($("#vehicleNumber").val() != null)
		$('#driverName').focus();
}

function ddmTimeOTP() {
	let driverNo = $('#driverMobileNumber').val();
	let configuredVehicleTypes = configuration.configuredVehicleTypesToSendDDMCreationSms;
	let vehicleTypeArray = configuredVehicleTypes.split(',').map(Number);
	let selectedVehicleType = Number($('#vehicleType').val());

	if (vehicleTypeArray.includes(selectedVehicleType)) {
		if ($('#OTPSelection').prop('checked')) {
			if (!validateInput(1, "driverMobileNumber", "driverMobileNumber", "", driverPhoneNumErrMsg) || !validateDriverPhoneNumber(driverNo)) {
				return false;
			}


			if (!validateInput(1, "vehicleNumber", "vehicleNumber", "", truckNumberErrMsg)) {
				return false;
			}

			$("#ddmTimeOTPDiv").removeClass('hide');
			//showLayer();
			let jsonObject = {
				deliveredMobileNo: $('#driverMobileNumber').val(),
				moduleId: CREATE_DDM,
				vehicleNumber: $('#vehicleNumber').val()
			};

			let queryString = $.param(jsonObject);

			$.ajax({
				type: "POST",
				url: WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do?' + queryString,
				contentType: 'application/x-www-form-urlencoded',
				dataType: 'json',
				success: function(data) {
					if (data.message) {
						const errorMessage = data.message;
						OTPNumber = data.otpNumber;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					hideLayer();
				},
				error: function(xhr, status, error) {
					console.error("Error in AJAX call:", error);
					showMessage('error', 'Failed to send OTP. Please try again.');
					hideLayer();
				}
			});


		} else {
			// Hide OTP input section
			$("#ddmTimeOTPDiv").addClass('hide');
		}
	} else {
		let vehicleTypeName = "";
		if (selectedVehicleType == OWN_VEHICLE_ID) {
			vehicleTypeName = OWN_VEHICLE_NAME;
		} else if (selectedVehicleType == HIRED_VEHICLE_ID) {
			vehicleTypeName = HIRED_VEHICLE_NAME;
		} else if (selectedVehicleType == ATTACHED_VEHICLE_ID) {
			vehicleTypeName = ATTACHED_VEHICLE_NAME;
		}
		if (!vehicleTypeArray.includes(selectedVehicleType)) {
			showMessage('error', `OTP Cannot Be Sent For ${vehicleTypeName}`);
		}
	}
}


function validateDriverPhoneNumber(mobileNumber) {
	var reg = /^[6789]\d{9}$/;
	mobileNumber = String(mobileNumber).trim();

	// Check if the mobile number is exactly 10 digits long and matches the regex pattern
	if (mobileNumber.length !== 10 || !reg.test(mobileNumber)) {
		showMessage('error', validPhoneNumberErrMsg || 'Please enter a valid 10-digit phone number.');
		changeError1('driverMobileNumber', '0', '0');
		return false;
	}

	return true;
}

function hideShowOTPSelection() {

	let configuredVehicleTypes = configuration.configuredVehicleTypesToSendDDMCreationSms;
	let vehicleTypeArray = configuredVehicleTypes.split(',').map(Number);
	let selectedVehicleType = Number($('#vehicleType').val());

	if (vehicleTypeArray.includes(selectedVehicleType)) {
		$("#OTPSelectionDiv").removeClass('hide');
	} else {
		$("#OTPSelectionDiv").addClass('hide');
		$("#ddmTimeOTPDiv").addClass('hide');
		$('#OTPSelection').prop('checked', false);
	}
}

function calculateTotalLorryHire() {
	
	if(!configuration.validateLorryHireOnDoorDelivery) {
		return;
	}
	
	let total = 0;

	$("input[name='wayBills']:checked").each(function () {
		let lorryHireVal = parseFloat($("#lorryHire_" + $(this).val()).val()) || 0;
		total += lorryHireVal;
	});
	
	$("#ddmLorryHire").val(Math.round(total));
	$('#ddmLorryHire').prop('readonly', true);
}

$(document).on('change', "input[name='wayBills']", function () {
	calculateTotalLorryHire();
});

$(document).on('keyup change', "input[name^='lorryHire_']", function () {
	calculateTotalLorryHire();
});

$("#selectAll").on("change", function () {
	$("input[name='wayBills']").prop("checked", this.checked);
	calculateTotalLorryHire();
});
   
function validateLorryHireLrWise(inputEl, waybillId) {
	if(configuration.validateLorryHireOnDoorDelivery) {
		let enteredVal = parseFloat(inputEl.value) || 0;
		let doorDeliveryVal = $('#bkgCharge_25_' + waybillId).text();
		$(inputEl).css("border", "");
		
		let maxAllowedPercentage = configuration.maxLorryHirePercentOfDoorDelivery;
		
		if (doorDeliveryVal > 0) {
			let maxAllowed = Math.round((doorDeliveryVal * maxAllowedPercentage) / 100);
			
			if (enteredVal > maxAllowed) {			
				inputEl.value = maxAllowed;
				showMessage('error', "You can't enter more than " + maxAllowedPercentage + "% of Door Delivery (" + maxAllowed + ")");
				$(inputEl).css("border", "1px solid red");
			}
	
			$(inputEl).off("keypress.lorryHire").on("keypress.lorryHire", function (e) {
				let char = String.fromCharCode(e.which);
				
				if (!/[0-9.]/.test(char)) {
					e.preventDefault();
					return;
				}
	
				let inputVal = this.value + char;
				
				if (parseFloat(inputVal) > maxAllowed) {
					e.preventDefault();
					showMessage('error', "Max allowed " + maxAllowed);
				}
			});
		} else {
			$(inputEl).off("keypress.lorryHire");
		}
	}
}

function checkDuplicateCR(wayBillId, inputElement) {
	let value = inputElement.value.trim();

	if (value === "") return;

	let allInputs = document.querySelectorAll('[id^="manualCRNo_"]');
	let duplicateFound = false;

	allInputs.forEach(function(inp) {
		if (inp !== inputElement && inp.value.trim() === value) {
			duplicateFound = true;
		}
	});

	if (duplicateFound) {
		showMessage("error", "Manual CR Number already entered, Please enter a different number !");
		inputElement.focus();
		return false;
	}

	let jsonData = {
		filter: 5,
		manualCRNumber: inputElement.value,
		manualCRDate:date(new Date(serverCurrentDate),"-")
	};

	$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16", { json: JSON.stringify(jsonData) 
		}, function (data) {
			if (!data || data.errorDescription) {
				showMessage('error', data?.errorDescription || "System error");
				return;
			}

			if (data.isManualCRNoExists === true) {
				showMessage('error', crNumberAlreadyCreatedInfoMsg);
				$("#manualCRNo_" + wayBillId).focus();
				checkDuplicate=false;
				return false;
			} else {
				checkDuplicate=true;
				hideAllMessages();
			}
		}
	);
}