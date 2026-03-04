var jsondata 						= null;
var configuration					= null;
var tdsConfiguration				= null;
var generateCrConfiguration			= null;
var executive						= null;
var execFldPermissions				= null;
var ReceivableTypeConstant			= null;
var WayBill							= null;
var Branch							= null;
var DeliveryChargeConstant			= null;
var PartyMaster						= null;
var PaymentTypeConstant				= null;
var CorporateAccount				= null;
var FeildPermissionsConstant		= null;
var fontStyleSmall					= "";
var fontStyleBig					= "";
var execFeildPermission				= null;
var isDeliveryDiscountAllow			= false;
var octroiServiceCharge				= null;
var isOctroiServiceApplicable		= true;
var enterCount						= 0;
var taxableAmount					= 0;
var checkedManualCRSave 			= null;
var checkedManualCROnCancel 		= null;
var showbillCredit					= false;
var taxvalue						= null;
var BOOKING_CHARGE					= 1;
var DELIVERY_CHARGE					= 2;
var tableId 						= 'multipleLRTBL';
var headerCount    					= 1;
var tableRowId						= 1;
var dbWiseSelfPartCA				= null;
var groupConfiguration				= null;
var wayBillPartyName				= new Object;
var paymentTypeArr					= null;
var moduleId						= 0;
var ModuleIdentifierConstant		= null;
var incomeExpenseModuleId			= 0;
var BankPaymentOperationRequired	= false;
var deliveryPaymentType_0			= 0;
var chargeNameToBifurcate			= "";
var ConsigneePartyMasterIdArr		= new Array();
var GeneralConfiguration			= null;
var tdsRate							= 0;
var taxPaidByList					= null;
var vehicleNumber					= null;
var vehicleNumberMasterId			= 0;	
var billSelectionId               	= 0;
var divisionId               		= 0;

function loadGenerateCRData() {

	showLayer();
	let jsonObject		= new Object();
	jsonObject.filter	= 1;
	let jsonStr = JSON.stringify(jsonObject);

	$.post("GenerateCRMultipleLRAjaxAction.do?pageId=288&eventId=5",
			{json:jsonStr}, function(data) {

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					$('#waybillNmber').prop('disabled', true);
					$('#waybillNmberDiv').hide();
					hideLayer();
				} else {
					console.log(data);

					jsondata				= data;

					executive				= jsondata.executive; // executive object
					execFldPermissions		= jsondata.execFldPermissions;

					// all constants
					WayBill						= jsondata.WayBill;
					Branch						= jsondata.Branch;
					DeliveryChargeConstant		= jsondata.DeliveryChargeConstant;
					PartyMaster					= jsondata.PartyMaster;
					CorporateAccount			= jsondata.CorporateAccount;
					FeildPermissionsConstant	= jsondata.FeildPermissionsConstant;
					showbillCredit				= jsondata.showbillCredit;
					ReceivableTypeConstant		= jsondata.ReceivableTypeConstant;
					dbWiseSelfPartCA			= jsondata.dbWiseSelfPartCA;
					PaymentTypeConstant		 	= jsondata.PaymentTypeConstant;
					groupConfiguration			= jsondata.groupConfiguration;
					paymentTypeArr				= jsondata.paymentTypeArr;
					moduleId					= jsondata.moduleId;
					ModuleIdentifierConstant	= jsondata.ModuleIdentifierConstant;
					incomeExpenseModuleId		= jsondata.incomeExpenseModuleId;
					chargeNameToBifurcate		= jsondata.chargeNameToBifurcate;
					GeneralConfiguration		= jsondata.GeneralConfiguration;
					BankPaymentOperationRequired= GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true;
					validatePhonePayTransaction 		= jsondata.validatePhonePeTxn;
					allowDynamicPhonepeQR		 		= jsondata.allowDynamicPhonepeQRDelivery;
					taxPaidByList				= jsondata.taxPaidByList;
					servicePermission			= data.servicePermission;
					allowTransactionDateAndTimePhonePe	 	= jsondata.allowTransactionDateAndTimePhonePe;
					
					// generate cr for multi lr configuration
					configuration				= data.configuration;
					tdsConfiguration			= data.tdsConfiguration;
					generateCrConfiguration		= data.generateCrConfiguration;

					if(jsondata.isDeliveryDiscountAllow){
						isDeliveryDiscountAllow = true;
					}

					addHeaderDeliveryTable();
					setDeliverySequenceCounter();

					if(BankPaymentOperationRequired && configuration.PaymentType) {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					
						if(configuration.showPaymentTypeAllSelection) {
							$('#paymentTypeForAllDiv').removeClass('hide');
							setPaymentTypeForAll('deliveryPaymentType');
						}
					}
					
					if(configuration.showCentralizeDeliveryDetails) {
						$('#consigneeName').val('');
						$('#consigneeNumber').val('');
						$('.hideDeliveryDetails').show();
					} else
						$('.hideDeliveryDetails').remove();
						
					if(configuration.showCentralizeStPaidBy) {
						setSTPaidBy('centralizeSTPaidBy');
						$('.centralizeSTPaidByhide').show();
					} else
						$('.centralizeSTPaidByhide').remove();
					
					if(configuration.showSummaryTable)
						$('#summaryTable').removeClass('hide');
						
					if(configuration.allowPhotoServiceOnCR)
						$('#services').removeClass('hide');

					if(configuration.allowToBifurcateCharge) {
						$('#totalChargeAmountDiv').removeClass('hide');
						$('#totalChargeAmountSpan').html(chargeNameToBifurcate);
						$('#totalChargeAmountSpan').attr("id", "'"+configuration.chargeIdToBifurcate+"'");
					}
					
					if(configuration.showVehicleNumber) {
						$('#vehicleNumberDiv').removeClass('hide');
						setVehicleNumberAutocomplete();
					}
					
					if(servicePermission != undefined)
						startServices();
					
					$('#waybillNmber').focus();
					hideLayer();
				}
			});
}

function addHeaderDeliveryTable() {
	let table    = document.getElementById(tableId);
	let rowCount = table.rows.length;	
	let header   = table.createTHead();
	let k 		 = 0;
	row   		 = header.insertRow(rowCount);
	let taxes	 = jsondata.taxes;

	if(configuration.DeliveryDiscount || isDeliveryDiscountAllow){
		var DeliveryDiscount = true;
	}
	
	if(configuration.DiscountType || isDeliveryDiscountAllow){
		var DiscountType = true;
	}
	
	if(tdsConfiguration.IsTdsAllow) {
		$('#tdsoption').removeClass('hide');
		var tdsAmout = true;
	}
	
	if(tdsConfiguration.IsPANNumberRequired)
		var panNumbar = true;
	
	if(tdsConfiguration.IsTANNumberRequired)
		var tannumber = true;
	
	createElementAfterCheckintConfigurationExists(true, "", k++,' titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true,"Lr No.", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true,"Bkg. Date", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "From", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "To", k++, 'titletd', true, true, null);
	
	if(configuration.DeliveryCharges && configuration.showDeliveryChargesBeforeConsignorNameColumn) {
		charges = jsondata.deliverChgs;  
	
		for (const element of charges) {
			createNewCell(element.chargeName, 'titletd', 'center', k++, fontStyleSmall, true, null, true, null);
		}
	}
	
	createElementAfterCheckintConfigurationExists(true, "C/nor", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "C/nor No", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "C/nor GSTN", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "C/nee", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "C/nee No", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "C/nee GSTN", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "LR Type", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "Amt.", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "Art.", k++, 'titletd', true, true, null)
	createElementAfterCheckintConfigurationExists(true, "Weight", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.PaymentType, "Payment Type", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.DeliveryDetails, "Delivery Details", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.DisplayConsineeNameField, "Consignee Name", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.DisplayReceivablesTypeField, "Receivable", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.DisplayApprovedByField, "Approved By", k++, 'titletd', true, true, null);

	if(configuration.DeliveryCharges  && !configuration.showDeliveryChargesBeforeConsignorNameColumn) {
		charges = jsondata.deliverChgs;  
	
		for (const element of charges) {
			createNewCell(element.chargeName, 'titletd', 'center', k++, fontStyleSmall, true, null, true, null);
		}
	}

	if(!jQuery.isEmptyObject(taxes)) {
		if(configuration.showCentralizeStPaidBy)
			$('.centralizeSTPaidByhide').show();
		
		createElementAfterCheckintConfigurationExists(configuration.DeliverySTPaidBy, "GST Paid By", k++, 'titletd', true, true, null);

		taxableAmount	= taxes[0].leastTaxableAmount;
		for (const element of taxes) {
			taxvalue	= element.taxName;

			if (element.isTaxPercentage) {
				let taxAmnt = (element.taxAmount).toFixed(2);
				taxvalue	+= ' '+taxAmnt + '%';
			}
			createElementAfterCheckintConfigurationExists(configuration.DeliveryTimeServiceTax, taxvalue, k++, 'titletd', true, true, null);
		}
	} else
		$('.centralizeSTPaidByhide').hide();

	createElementAfterCheckintConfigurationExists(DeliveryDiscount, "Discount", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(DiscountType, "Discount Type", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(true, "Delivery Amount", k++, 'titletd', true, true, null);
	createElementAfterCheckintConfigurationExists(configuration.Remark, "Remark", k++, 'titletd', true, true, null);
	
	if(tdsConfiguration.IsTdsAllow)
		createElementAfterCheckintConfigurationExists(tdsAmout, "TDS Amount", k++, 'titletd', true, true, null);
	
	if(tdsConfiguration.IsPANNumberRequired)
		createElementAfterCheckintConfigurationExists(panNumbar, "Pan Number", k++, 'titletd', true, true, null);
	
	if(tdsConfiguration.IsTANNumberRequired)
		createElementAfterCheckintConfigurationExists(tannumber, "Tan Number", k++, 'titletd', true, true, null);
}

function updateTotalRow() {
	$('#deliveryTotalRow').remove();

	const table = document.getElementById(tableId);
	if (table.rows.length <= 1) return;

	const headerRow = table.rows[0];
	const totalRow = table.insertRow(table.rows.length);
	totalRow.id = 'deliveryTotalRow';
	totalRow.className = 'totalRow';
	totalRow.style.backgroundColor = '#f3f3f3';
	totalRow.style.fontWeight = 'bold';
	totalRow.style.color = '#000';

	const totals = {};
	const numericColumns = [];

	let lrColumnIndex = null;
	let articlesColumnIndex = null;

	for (let i = 0; i < headerRow.cells.length; i++) {
		const headerText = headerRow.cells[i].innerText.trim().toLowerCase();
		const cellHasDeliveryCharge = table.rows[1].cells[i].innerHTML.includes("deliveryCharge")

		if (headerText.includes('lr no') || headerText === 'lr')
			lrColumnIndex = i;
		else if (headerText.includes('art') || headerText === 'art') {
			articlesColumnIndex = i;
			totals[i] = 0;
			numericColumns.push(i);
		} else if (
			headerText.includes('amt') || headerText.includes('amount') ||
			headerText === 'weight' || headerText.includes('charge') ||
			headerText.includes('tds') ||
			headerText.includes('sgst') || headerText.includes('cgst') ||
			headerText.includes('igst') || headerText.includes('tax') ||
			cellHasDeliveryCharge ||
			(headerText.includes('discount') && !headerText.includes('type')) // Discount, not Discount Type
		) {
			totals[i] = 0;
			numericColumns.push(i);
		}
	}

	let lrCount = 0;

	for (let i = 1; i < table.rows.length - 1; i++) {
		const row = table.rows[i];

		if (lrColumnIndex !== null) {
			const lrCell = row.cells[lrColumnIndex];
			const lrValue = lrCell.querySelector('input')?.value.trim() || lrCell.innerText.trim();
			if (lrValue) lrCount++;
		}

		for (const colIndex of numericColumns) {
			const cell = row.cells[colIndex];
			let value = 0;

			const input = cell.querySelector('input');
			
			if (input) {
				value = parseFloat(input.value) || 0;
			} else {
				value = parseFloat(cell.innerText) || 0;
			}

			totals[colIndex] += value;
		}
	}
	
	for (let i = 0; i < headerRow.cells.length; i++) {
		const cell = totalRow.insertCell(i);
		cell.className = 'datatd';

		if (i === 0)
			cell.innerHTML = "<b>Total</b>";
		else if (i === lrColumnIndex) {
			cell.className += ' text-align-center';
			cell.innerHTML = `<b>${lrCount}</b>`;
		} else if (i === articlesColumnIndex) {
			cell.className += ' text-align-right';
			cell.innerHTML = `<b>${totals[i].toFixed(0)}</b>`;
		} else if (numericColumns.includes(i)) {
			cell.className += ' text-align-right';
			cell.innerHTML = `<b>${totals[i].toFixed(2)}</b>`;
		}
	}
}


function addDataInDeliveryTable(wbData) {
	if(configuration.validateLrTypeWhileBillCredit && $('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID && wbData.waybillMod.wayBillTypeId != WAYBILL_TYPE_TO_PAY) {
		showMessage('error', 'Only To Pay LR Allowed While Selected Bill Credit Payment Type !');
		return false;
	}
	

	let table    = document.getElementById(tableId);
	let rowCount = table.rows.length;	

	if(headerCount == 1) {
		tBody =  document.createElement('tbody');
		table.appendChild(tBody);
	}

	row 	= tBody.insertRow(rowCount - 1);

	row.id  = (tableRowId);
	let k 					= 0;
	let waybillMod			= wbData.waybillMod;
	let consignmentSummary	= wbData.consignmentSummary;
	let taxes	 			= jsondata.taxes;
	let consignorDetails	= wbData.consignorDetails;
	let consigneeDetails	= wbData.consigneeDetails;
	let sourceBranch		= wbData.sourceBranch;
	let destinationBranch	= wbData.destinationBranch;
	let isBlackListedParty  = false;
	let consignmentDetails  = wbData.consignmentDetails;
	
	if(configuration.allowOnlySameTypeOfBillSelection && billSelectionId > 0 && billSelectionId != consignmentSummary.billSelectionId) {
		showMessage('error', 'Bill Lrs Not Allowed with Estimate Lrs');
		return false;
	}
	
	billSelectionId = consignmentSummary.billSelectionId;
		
	if(configuration.allowOnlySameTypeOfDivisionLR && divisionId > 0 && divisionId != consignmentSummary.divisionId) {
		showMessage('error', 'You cannot mix the different Division LRs!');
		return false;
	}
	
	divisionId = consignmentSummary.divisionId;
	
	$('input[id="allowtds"]'). click(function() {
		if($(this).prop("checked")) {
			$('#tdsAmount_' + waybillMod.wayBillId).prop('disabled', false);
		} else if(!$(this).prop("checked")) {
			$('#tdsAmount_' + waybillMod.wayBillId).val(0);
			$('#tdsAmount_' + waybillMod.wayBillId).prop('disabled', true);
		}

		updateTotalRow();
	});

	if(groupConfiguration.showPartyIsBlackListedParty == 'true' || groupConfiguration.showPartyIsBlackListedParty == true){
		if (consignorDetails.consignorBlackListed > 0  && consignorDetails.tbbBlackListed > 0){
			wayBillPartyName[waybillMod.wayBillId] = consignorDetails.name +"And "+ consignorDetails.name;
			showMessage('error', 'TBB and Consignor is blackListed');
			isBlackListedParty = true;
		} else if(consignorDetails.consignorBlackListed > 0 ) {
			wayBillPartyName[waybillMod.wayBillId] = consignorDetails.name;
			showMessage('error', 'Consignor is BlackListed');
			isBlackListedParty = true;
		} else if(consigneeDetails.consigneeBlackListed > 0 ) {
			wayBillPartyName[waybillMod.wayBillId] = consigneeDetails.name;
			showMessage('error', 'Consignee  is BlackListed  !');
			isBlackListedParty = true;
		} else if(consignorDetails.tbbBlackListed > 0) {
			wayBillPartyName[waybillMod.wayBillId] = consignorDetails.name;
			showMessage('error', 'TBB is BlackListed ');
			isBlackListedParty = true;
		}
	}
	
	if(consignorDetails.phoneNumber == undefined)
		consignorDetails.phoneNumber = '0000000000'
	
	if(consigneeDetails.phoneNumber == undefined)
		consigneeDetails.phoneNumber = '0000000000'
	
	let ele 	 		= null;
	let newCell 		= row.insertCell(k++);
	newCell.className 	= 'datatd isBlackListed_'+waybillMod.wayBillId;
	ele 				= createElement('Remove', 'delete_' + row.id, 30, 'button button-tiny button-icon-txt-small button-uppercase button-caution', null, null, 'button', false);
	appendChild(newCell, ele);
	ele.onclick			= function(){deleteLRRow(ele); updateTotalRow();};

	if(configuration.allowToEditLRRate && waybillMod.allowEditRate) {
		let ele2 			= createElement('Edit Rate', 'edit_' + row.id,  30,'btn btn-primary', null, null,'button', false);

		appendChild(newCell, ele2);
		ele2.onclick			= function(){editWayBillCharges(waybillMod.wayBillId);};
	}
	
	row.appendChild(newCell);  

	createElementAfterCheckintConfigurationExists(true, waybillMod.wayBillNumber, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'LrNumber_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, date(waybillMod.bookingDateTime,'-'), k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'BookingDate_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, waybillMod.source, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'FromBranch_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, waybillMod.destination, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ToBranch_' + waybillMod.wayBillId);
	
	if(configuration.DeliveryCharges && configuration.showDeliveryChargesBeforeConsignorNameColumn) {
		charges = jsondata.deliverChgs;  

		for (const element of charges) {
			createChargeInputElement(0, 'deliveryCharge' + element.chargeTypeMasterId + "_" + waybillMod.wayBillId, k++, 5, 'width-50px text-align-right', false, waybillMod.wayBillId);
		}

		disableDeliveryCharges(waybillMod.wayBillTypeId, waybillMod.wayBillId);
		
	}
	
	createElementAfterCheckintConfigurationExists(true, consignorDetails.name, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsignorName_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consignorDetails.phoneNumber, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsignorNo_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consignorDetails.gstn, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsignorGstn_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consigneeDetails.name, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsigneeName_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consigneeDetails.phoneNumber, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsigneeNo_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consigneeDetails.gstn, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'ConsigneeGstn_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, waybillMod.wayBillType, k++, 'datatd isBlackListed_'+waybillMod.wayBillId+' '+waybillMod.wayBillTypeId, false, false, 'LRType_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, waybillMod.grandTotal, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'Amount_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, waybillMod.packageDetails, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'Article_' + waybillMod.wayBillId);
	createElementAfterCheckintConfigurationExists(true, consignmentSummary.actualWeight, k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, 'Weight_' + waybillMod.wayBillId);
	
	if(configuration.PaymentType) {
		createSelectElement(0, 'deliveryPaymentType_' + waybillMod.wayBillId, k++, true, 1);
	}
	
	if(BankPaymentOperationRequired) {
		if(configuration.PaymentType) {
			setTimeout(function() {
				setPaymentTypeForAll('deliveryPaymentType_' + waybillMod.wayBillId);
			}, 200);
		} else {
			$("#deliveryPaymentType").parent().addClass("hide");
		}
	} else {
		$("#viewPaymentDetails").remove();
		
		if(configuration.PaymentType) {
			setPaymentType('deliveryPaymentType_' + waybillMod.wayBillId, waybillMod.wayBillId);
			disablePaymentType(waybillMod.wayBillId, waybillMod.wayBillTypeId);
		}
	}
	
	if(configuration.showPaymentTypeAllSelection) {
		$('#deliveryPaymentType_'+ waybillMod.wayBillId).prop('disabled' , true);
		
		if(Number($('#deliveryPaymentType').val()) > 0) {
			setTimeout(function() { 
				$('#deliveryPaymentType_'+ waybillMod.wayBillId).val(Number($('#deliveryPaymentType').val()));
				$('#deliveryPaymentType_'+ waybillMod.wayBillId).trigger('change');
			}, 200);
		}
	}
	
	if(configuration.allowToBifurcateCharge && Number(configuration.chargeIdToBifurcate) > 0) {
		$("#deliveryCharge" + Number(configuration.chargeIdToBifurcate) + "_" + waybillMod.wayBillId).prop('disabled' , true);
	}

	createDeliveryDetailsAftetCheckingConfigurationExists(configuration.DeliveryDetails, 'DeliveryDetails', k++, 'datatd isBlackListed_'+waybillMod.wayBillId, false, false, waybillMod, consigneeDetails);

	if(configuration.DisplayConsineeNameField) {
		createConsigneeDetailsElement(waybillMod, row, k++, consigneeDetails);
	}

	if(configuration.DisplayReceivablesTypeField) {
		createSelectElement(0, 'receivable_' + waybillMod.wayBillId, k++, true, 3);
		setReceivableTypes('receivable_' + waybillMod.wayBillId, waybillMod.wayBillId);
		setDefaultReceivableType(waybillMod.wayBillId);
	}

	if(configuration.DisplayApprovedByField) {
		createApprovedByInputField(waybillMod, row, k);
	}

	if(configuration.DeliveryCharges && !configuration.showDeliveryChargesBeforeConsignorNameColumn) {
		charges = jsondata.deliverChgs;  

		for (const element of charges) {
			createChargeInputElement(0, 'deliveryCharge' + element.chargeTypeMasterId + "_" + waybillMod.wayBillId, k++, 5, 'width-50px text-align-right', false, waybillMod.wayBillId);
		}

		disableDeliveryCharges(waybillMod.wayBillTypeId, waybillMod.wayBillId);
	}

	getDeliveryDemmerageRates(consigneeDetails.corporateAccountId , waybillMod.wayBillId);

	if(wbData.finalDamerageVal != undefined && wbData.finalDamerageVal.damerage != undefined) {
        $('#deliveryCharge' + DAMERAGE + "_" + waybillMod.wayBillId).val(wbData.finalDamerageVal.damerage);
        calulateBillAmount(waybillMod.wayBillId);
    } else
	   getDeliveryDemmerageRates1(consigneeDetails.corporateAccountId , waybillMod.wayBillId);
	
	getDeliveryRates(consigneeDetails.corporateAccountId, consignmentDetails, consignmentSummary,waybillMod.wayBillId);
	
	if(!jQuery.isEmptyObject(taxes)) {
		if(configuration.DeliverySTPaidBy) {
			createSelectElement(0,  'STPaidBy_' + waybillMod.wayBillId, k++, true, 2);
			setSTPaidBy('STPaidBy_' + waybillMod.wayBillId);
			setDefaultSTPaidBy('STPaidBy_' + waybillMod.wayBillId, waybillMod.wayBillTypeId);
		}

		for (const element of taxes) {
			taxvalue	= element.taxName;

			if (element.isTaxPercentage) {
				let taxAmnt = (element.taxAmount).toFixed(2);
				taxvalue	+= ' ' + taxAmnt + '%';
			}

			newCell = row.insertCell(k++);
			newCell.className 	= 'datatd isBlackListed_'+waybillMod.wayBillId;

			newCell.appendChild(createInputElementForTaxes(0, 'tax_' + element.taxMasterId + '_' + waybillMod.wayBillId, 0, 5, 'width-50px text-align-right ', null, true));
			newCell.appendChild(createInputElementForTaxes(0, 'unAddedST_' + element.taxMasterId + '_' + waybillMod.wayBillId, 0, 5, 'width-50px text-align-right', 'none', true));
			newCell.appendChild(createInputElementForTaxes(0, 'actualTax_' + element.taxMasterId + '_' + waybillMod.wayBillId, 0, 5, 'width-50px text-align-right', 'none', true));
			newCell.appendChild(createInputElementForTaxes(0, 'calculateSTOnAmount_' + element.taxMasterId + '_' + waybillMod.wayBillId, 0, 5, 'width-50px text-align-right', 'none', true));

			row.appendChild(newCell);
		}
	}
	
	let isReadOnly = (generateCrConfiguration.readOnlyDeliveryDiscount == 'true' || waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY && generateCrConfiguration.readOnlyDeliveryDiscountForToPayOnly == 'true');

	if(configuration.DeliveryDiscount || isDeliveryDiscountAllow) {
		createDiscountInputElement(waybillMod.deliveryDiscount, 'txtDelDisc_' + waybillMod.wayBillId, k++, 5, 'width-50px text-align-right',false, waybillMod.wayBillId);	
			
		if(generateCrConfiguration.configDiscount == 'true') {
			$('#txtDelDisc_' + waybillMod.wayBillId).prop("readonly", isReadOnly);
			$('#discount_' + waybillMod.wayBillId).prop("readonly", isReadOnly);
		}
	}

	if(configuration.DiscountType || isDeliveryDiscountAllow) {
		createSelectElement(0,'discountTypes_' + waybillMod.wayBillId, k++, false, 0);
		setDiscountType('discountTypes_' + waybillMod.wayBillId);
	
		if(generateCrConfiguration.configDiscount == 'true') {	
			if(waybillMod.discountChargeTypeId > 0)
				$('#discountTypes_' + waybillMod.wayBillId).val(waybillMod.discountChargeTypeId);
			
			if(isReadOnly) {
				$('#discountTypes_' + waybillMod.wayBillId).prop("disabled", isReadOnly);
				$('#discountTypes_' + waybillMod.wayBillId).css({"color": "black", "font-weight": "bold"});
			}
		}
	}

	if(configuration.hideDiscountOnLrTypeTbb)
		hideDiscountOnLrTypeTbb(waybillMod.wayBillId, waybillMod.wayBillTypeId);
	
	createInputElement(0,'billAmount_' + waybillMod.wayBillId, k++, 9,'width-50px text-align-right', true,waybillMod.wayBillId);

	if(configuration.Remark)
		createInputElement("",'deliveryRemark_' + waybillMod.wayBillId, k++, 50, 'width-150px text-align-left', false, waybillMod.wayBillId);
	
	if(tdsConfiguration.IsTdsAllow) {
		createTdsAmountInputElement("",'tdsAmount_' + waybillMod.wayBillId, k++, 10, 'width-50px text-align-left', false, waybillMod.wayBillId);
		$('#tdsAmount_' + waybillMod.wayBillId).prop('disabled', true);
		$('#tdsAmount_' + waybillMod.wayBillId).val(0);
	}
	
	if(tdsConfiguration.IsPANNumberRequired)
		createInputElement("",'panNumber_' + waybillMod.wayBillId, k++, 10, 'width-100px text-align-left', false, waybillMod.wayBillId);
	
	if(tdsConfiguration.IsTANNumberRequired)
		createInputElement("",'tanNumber_' + waybillMod.wayBillId, k++, 20, 'width-100px text-align-left', false, waybillMod.wayBillId);
	
	createHiddenElement(waybillMod, consignmentSummary, wbData, k++, consignorDetails, consigneeDetails, sourceBranch, destinationBranch);
	calulateBillAmount(waybillMod.wayBillId);
	calculateDeliveryAmount(waybillMod.wayBillId);
	headerCount++;
	tableRowId++;
	$('#gcrData').switchClass("show", "hide");

	setConsineeNameAutoComplete('consigneeNameAutocomplete_' + waybillMod.wayBillId, waybillMod.destinationBranchId, waybillMod.wayBillId);
	
	if(isBlackListedParty) {
		$('.isBlackListed_'+waybillMod.wayBillId).css('background-color' , 'red');
		$('.isBlackListed_'+waybillMod.wayBillId).css('color' , 'black');
		$('.isBlackListed_'+waybillMod.wayBillId).css('font-weight' , 'bold');
		$('.isBlackListed_'+waybillMod.wayBillId).css('font-style' , 'oblique');
		
		if(consignorDetails.consignorBlackListed > 0 )
			$('#consigneeBlackList_'+waybillMod.wayBillId).val(consignorDetails.consignorBlackListed);
		else if(consigneeDetails.consigneeBlackListed > 0)
			$('#consigneeBlackList_'+waybillMod.wayBillId).val(consigneeDetails.consigneeBlackListed);
		else if (consignorDetails.tbbBlackListed > 0)
			$('#consigneeBlackList_'+waybillMod.wayBillId).val(consignorDetails.tbbBlackListed);
	}
	
	tdsCalculate(waybillMod.wayBillId);
	
	// For Summary Table
	$('#totalLrs').html(tableRowId - 1);
	
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		$('#bookingTotal').html(Number($('#bookingTotal').html()) + Number(waybillMod.bookingTotal));
	
	if(configuration.showCentralizeDeliveryDetails)
		setDeliveryDetailsForAll(true);
	
	if(configuration.showCentralizeStPaidBy)
		setAllSTPaidBy();
}

function tdsCalculate(wayBillId){
	if(tdsConfiguration.IsTDSInPercentAllow) {
		let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
		
		if(tdsChargeInPercent != undefined && tdsChargeInPercent.includes(","))
			tdsRate	= tdsChargeInPercent.split(",")[0];
		else
			tdsRate	= tdsChargeInPercent;
		
		$('input[id="allowtds"]'). click(function() {
			if($(this).prop("checked") == true) {
				var txnAmount = Number($('#billAmount_' +wayBillId ).val());
				var tdsCharge = Number(tdsRate) ;
				var tdsAmt				= Math.round((txnAmount * tdsCharge ) / 100);
				$('#tdsAmount_' + wayBillId).val(tdsAmt);
			}else{
				$('#tdsAmount_' + wayBillId).val(0);
			}
			updateTotalRow(); 
		});
		
		if($("#allowtds").prop("checked")){
			var txnAmount = Number($('#billAmount_' +wayBillId ).val());
			var tdsCharge = Number(tdsRate) ;
			var tdsAmt				= Math.round((txnAmount * tdsCharge ) / 100);
			
			$('#tdsAmount_' + wayBillId).val(tdsAmt);
			updateTotalRow();
		}
	}
}

function createConsigneeDetailsElement(waybillMod, row, k, consigneeDetails) {
	let ele1		= createElement(consigneeDetails.name, 'consigneeNameAutocomplete_' + waybillMod.wayBillId, 100, '', '', '', 'text', false);
	let ele2		= createElement(0, 'newConsigneeCorpAccId_' + waybillMod.wayBillId, 100, 'hide', '', '', 'text', false);

	let newCell = row.insertCell(k);
	appendChild(newCell, ele1);
	appendChild(newCell, ele2);
	row.appendChild(newCell);
}


function createApprovedByInputField(waybillMod, row, k) {
	let ele		= createElement('', 'approvedBy_' + waybillMod.wayBillId, 100, 'hide', '', 'Approved By', 'text', false);

	let newCell = row.insertCell(k);
	appendChild(newCell, ele);
	row.appendChild(newCell);
}

function setFunctionCallOnElement(ele, filter, wayBillId) {

	switch (filter) {
	case 1: // Discount Input Box
		ele.onkeyup		= function(){calulateBillAmount(wayBillId);};	
		ele.onblur		= function(){calulateBillAmount(wayBillId);chkDiscount(wayBillId);clearIfNotNumeric(ele,0);chkTdsAmount(wayBillId);};
		break;

	case 2: // Delivery Charge
		ele.onkeyup		= function(){calulateBillAmount(wayBillId);tdsCalculate(wayBillId);};	
		ele.onkeydown	= function(){hideAllMessages();};	
		ele.onblur		= function(){clearIfNotNumeric(ele,0);chkTdsAmount(wayBillId);tdsCalculate(wayBillId);};
		break;	

	case 3: // ST paid by
		ele.onchange		= function(){calulateBillAmount(wayBillId);};		
		ele.onkeyup			= function(){calulateBillAmount(wayBillId);};	
		break;		
	default:
		break;
	}
}

function createHiddenElement(waybillMod, consignmentSummary, wbData, position, consignorDetails, consigneeDetails, sourceBranch, destinationBranch) {
	let ele 	 		= null;
	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd';
	
	ele 				= createCheckboxElement(waybillMod.wayBillId, 'waybillids', '', true);
	appendChild(newCell, ele);
	
	ele 	= createElement(consignorDetails.customerDetailsId, 'ConsignorId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(consigneeDetails.customerDetailsId, 'ConsigneeId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.paidLoading, 'paidLoading_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.grandTotal, 'GrandAmnt_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(0, 'selectedDeliveryCreditorId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(0, 'selectedCollectionPersonId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	
	ele 	= createElement(wbData.destinationBranchId, 'recoveryBranchId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	
	ele 	= createElement(wbData.destinationBranchId, 'defaultRecoveryBranchId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	
	ele 	= createElement(waybillMod.destination, 'defaultRecoveryBranch_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.wayBillId, 'waybillId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.wayBillTypeId, 'waybillTypeId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.wayBillNumber, 'waybillNumber_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(waybillMod.wayBillId, 'LRRow_' + row.id,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(date(waybillMod.bookingDateTime, '-'), 'wbBookingDate_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(wbData.taxTxnValue, 'checkForServTax_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(consignmentSummary.taxBy, 'serviceTaxBY_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(0, 'deliveryAmount_' + waybillMod.wayBillId, 30, 'width-100px text-align-left', 'none', null, 'hidden', false);
	appendChild(newCell,ele);

	ele 	= createElement(consigneeDetails.corporateAccountId, 'consigneeCorpAccId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	ele 	= createElement(sourceBranch.stateId, 'SourceBranchStateId_' + waybillMod.wayBillId, 30, 'width-100px text-align-left', 'none', null, 'hidden', false);
	appendChild(newCell,ele);

	ele 	= createElement(destinationBranch.stateId, 'DestinationBranchStateId_' + waybillMod.wayBillId, 30, 'width-100px text-align-left', 'none', null, 'hidden', false);
	appendChild(newCell,ele);

	ele 	= createElement(destinationBranch.actualAccountGroupId, 'actualAccountGroupId_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	
	ele 	= createElement(consigneeDetails.blackList, 'consigneeBlackList_' + waybillMod.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	
	ele 	= createElement(consigneeDetails.discountOnTxnType, 'discountOnTxnType_' + waybillMod.wayBillId, 30, 'width-100px text-align-left', 'none', null, 'hidden', false);
	appendChild(newCell,ele);
	
	ele 	= createElement(consigneeDetails.mobileNumber, 'ConsigneeMobileNo_' + waybillMod.wayBillId, 30, 'width-100px text-align-left', 'none', null, 'hidden', false);
	appendChild(newCell,ele);

	newCell.style.display     = 'none';
	row.appendChild(newCell);
}

function createElementAfterCheckintConfigurationExists(property, displayName, position, className, isHeaderFooter, fontWeight, cellId) {
	if(property) {
		createNewCell(displayName, className, 'center', position, fontStyleSmall, fontWeight, cellId, isHeaderFooter, null);
	}
}

function deleteLRRow(obj) {
	let rowId   = obj.id.split("_")[1];
	let row 	= document.getElementById(rowId);
	
	if(row){
		row.parentNode.removeChild(row);
		bifurcateChargeAmount();
		setDeliveryChargesTotal();
		updateTotalRow();
	}
	
	if(tdsConfiguration.IsTdsAllow)
		hideTDSFeildForFOC();
}


function editWayBillCharges(wayBillId) {
	window.receiveGrandTotal = function(id, total, wayBillTypeId) {
		if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
			$('#billAmount_' + id).val(total).attr('value', total); 
		
		$('#GrandAmnt_' + id).val(total).attr('value', total);
	};
 
	window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId=' + wayBillId + '&redirectFilter=17','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}

function createDeliveryDetailsAftetCheckingConfigurationExists(property, displayName, position, className, isHeaderFooter, fontWeight, model, consigneeDetails) {
	if(property) {
		let ele 	 	 	= null;
		let newColumn	 	= null;
		let newCell 		= row.insertCell(position);
		newCell.id  		= displayName + "_" + model.wayBillId;
		newCell.className 	= 'datatd isBlackListed_'+model.wayBillId;

		let tbl = document.createElement('table');
		newCell.appendChild(tbl);
		tbl.insertRow(0);

		let r1 = document.createElement('tr');
		tbl.appendChild(r1);
		
		newColumn = r1.insertCell(0);
		r1.appendChild(newColumn);
		ele = createElement(consigneeDetails.name, 'deliveredToName_' + model.wayBillId, 30, 'width-100px text-align-left', 'none', 'ENTER NAME', null, false);
		appendChild(newColumn,ele);
		
		newColumn = r1.insertCell(1);
		r1.appendChild(newColumn );
		ele = createElement(consigneeDetails.phoneNumber, 'deliveredToPhoneNo_' + model.wayBillId, 10, 'width-100px text-align-left', 'none', 'ENTER NUMBER', null, false);
		appendChild(newColumn,ele);

		let r2 = document.createElement('tr');
		tbl.appendChild(r2);

		newColumn = r2.insertCell(0);
		r2.appendChild(newColumn);
		ele = createElement("", 'bankName_' + model.wayBillId, 30, 'width-100px text-align-left', 'none', 'BANK NAME', null, false);
		appendChild(newColumn,ele);

		newColumn = r2.insertCell(1);
		r2.appendChild(newColumn);
		ele = createElement("", 'chequeNo_' + model.wayBillId, 12, 'width-100px text-align-left', 'none', 'CHEQUE NO', null, false);
		appendChild(newColumn,ele);

		newColumn = r2.insertCell(2);
		r2.appendChild(newColumn);
		ele = createElement("", 'chequeAmount_' + model.wayBillId, 10, 'width-100px text-align-right', 'none', 'CHEQUE AMOUNT', null, false);
		appendChild(newColumn,ele);

		newColumn = r2.insertCell(3);
		r2.appendChild(newColumn);
		ele = createElement(date(new Date(),"-"), 'chequeDate_' + model.wayBillId, 10, 'w8em format-d-m-y highlight-days-67', 'none', null, null, false);
		appendChild(newColumn,ele);

		let r3 = document.createElement('tr');
		tbl.appendChild(r3);

		newColumn = r3.insertCell(0);
		r3.appendChild(newColumn);
		ele = createElement("", 'deliveryCreditor_' + model.wayBillId, 30, 'width-150px text-align-left', 'none', 'DELIVERY CREDITOR', null, false);
		appendChild(newColumn, ele);
		setDeliveryCreditorAutoComplete(model.wayBillId);

		if(configuration.SearchCollectionPersonAutocomplete) {

			let r4 = document.createElement('tr');
			tbl.appendChild(r4);

			newColumn = r4.insertCell(0);
			r4.appendChild(newColumn);
			ele = createElement("",'searchCollectionPerson_' + model.wayBillId, 30, 'width-150px text-align-left', 'none', 'COLLECTION PERSON', null, false);
			appendChild(newColumn,ele);
			setSearchCollectionPersonAutoComplete(model.wayBillId);
		}
		
		if(configuration.showRecoveryBranchForShortCredit) {
			let r5 = document.createElement('tr');
			tbl.appendChild(r5);

			newColumn = r5.insertCell(0);
			r5.appendChild(newColumn);
			ele = createElement(model.destination,'recoveryBranch_' + model.wayBillId, 30, 'width-150px text-align-left', 'none', 'RECOVERY BRANCH', null, false);
			appendChild(newColumn,ele);
			setRecoveryBranchAutoComplete(model.wayBillId);
		}

		/*
		 * 
		 setEventOnElement(ele);

		 */
		row.appendChild(newCell);
	}
}

function appendChild(cell,element){
	cell.appendChild(element);
}

function createNewCell(value, className, align, position, fontSizeValue, fontWeight, cellId, isHeaderFooter, style) {

	let newCell = null;

	if(isHeaderFooter) {
		newCell = document.createElement('th');
	} else {
		newCell = row.insertCell(position);
	}

	newCell.className 	= 'datatd';
	row.appendChild(newCell);
	newCell.innerHTML = value;
	newCell.className = className;
	newCell.align     = align;

	if(fontSizeValue != null) {
		newCell.style.fontSize  = fontSizeValue;
	}

	if(fontWeight) {
		newCell.style.fontWeight  = 'bold';
	}

	if(cellId != null && cellId.length > 0) {
		newCell.id     = cellId;
	}

	if(style != null) {
		newCell.style.display     = style;
	}
}

function createElement(value, elementId, lenght, className, style, placeHolder, type, isReadOnly) {
	let ele = document.createElement("input");

	if(elementId != null && elementId.length > 0) {
		ele.id     	= elementId;
		ele.name   	= elementId;
		ele.onkeypress = function(event){initialiseFocus();};
	}

	ele.className	= className;
	ele.maxLength 	= lenght;
	ele.value 		= value;

	if(style != null) {
		ele.style.display = style;
	}

	if(placeHolder != null) {
		ele.placeholder = placeHolder;
	}

	if(type != null) {
		ele.type = type;
	}

	if(isReadOnly) {
		ele.readOnly = true;
	}
	
	return ele;
}

function setEventOnElement(ele) {
	ele.onblur		= function(){return checkDate(this.value,ele.id,true);};
	ele.onkeypress	= function(){return charsForDate(event);};
}

function createDiscountInputElement(value, elementId, position, lenght, className, isReadOnly, wayBillId) {
	let ele    		= createElement(value, elementId, lenght, className, null, null, null, isReadOnly);
	ele.onkeyup		= function(){calulateBillAmount(wayBillId);tdsCalculate(wayBillId);setDeliveryChargesTotal();updateTotalRow();};	
	ele.onblur		= function(){calulateBillAmount(wayBillId);chkDiscount(wayBillId);clearIfNotNumeric(ele,0);tdsCalculate(wayBillId);setDeliveryChargesTotal();updateTotalRow();};
	ele.onkeypress 	= function(event){return noNumbers(event);};
	ele.onfocus		= function(event){if(this.value == 0) this.value = '';}	

	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd isBlackListed_'+wayBillId;
	newCell.appendChild(ele);
	row.appendChild(newCell);
}

function createChargeInputElement(value, elementId, position, lenght, className, isReadOnly, wayBillId) {
	let ele    			= createElement(value, elementId, lenght, className, null, null, null, isReadOnly);
	
	ele.onkeyup			= function(){calulateBillAmount(wayBillId); calculateDeliveryAmount(wayBillId);tdsCalculate(wayBillId);setDeliveryChargesTotal();updateTotalRow();};	
	ele.onkeydown		= function(){hideAllMessages();};	
	ele.onblur			= function(){clearIfNotNumeric(ele,0);tdsCalculate(wayBillId);setDeliveryChargesTotal();updateTotalRow();
};
	ele.onkeypress 		= function(event){return noNumbers(event);};
	ele.onkeypress 		= function(event){initialiseFocus();};
	ele.onfocus			= function(event){if(this.value == 0) this.value = ''; }		

	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd isBlackListed_'+wayBillId;
	newCell.appendChild(ele);
	row.appendChild(newCell);
}
function createTdsAmountInputElement(value, elementId, position, lenght, className, isReadOnly, wayBillId) {
	let ele    			= createElement(value, elementId, lenght, className, null, null, null, isReadOnly);
	
	ele.onkeyup			= function(){hideAllMessages();updateTotalRow();};		
	ele.onblur			= function(){chkTdsAmount(wayBillId);};
	ele.onfocus			= function(event){if(this.value == 0) this.value = ''; }

	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd isBlackListed_'+wayBillId;
	newCell.appendChild(ele);
	row.appendChild(newCell);
}

function createInputElement(value, elementId, position, lenght, className, isReadOnly,wayBillId) {
	let ele     	= createElement(value, elementId, lenght, className, null, null, null, isReadOnly);
	ele.onkeypress 	= function(event){initialiseFocus();};
	ele.onblur 	= function(event){panNumberValidation(wayBillId);};

	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd isBlackListed_'+wayBillId;
	newCell.appendChild(ele);
	row.appendChild(newCell);
	return ele;
}

function createInputElementForTaxes(value, elementId, position, lenght, className, style, isReadOnly) {
	let ele     	= createElement(value, elementId, lenght, className, style, null, null, isReadOnly);
	ele.onkeypress 	= function(event){initialiseFocus();setDeliveryChargesTotal();};
	ele.onblur 		= function(event){initialiseFocus();setDeliveryChargesTotal();};

	return ele;
}

function createSelectElement(value, elementId, position, isFunctionCall, filter) {

	let wayBillId   = elementId.split("_")[1];
	let selectList 	= document.createElement("select");		

	if(elementId != null && elementId.length > 0) {
		selectList.id    		= elementId;
		selectList.name   		= elementId;
		selectList.class		= 'deliveryPaymentTypeForAll';
	}
	
	selectList.className	= 'width-135px';
	
	if(isFunctionCall) {
		if(filter == 1) {
			selectList.onchange		= function(){hideShowPaymentTypeDetails(selectList);setChequeAmount(wayBillId);initialiseFocus();};
			selectList.onkeyup		= function(){hideShowPaymentTypeDetails(selectList);setChequeAmount(wayBillId);};
		} else  if(filter == 2) {
			selectList.onchange		= function(){calulateBillAmount(wayBillId);calculateDeliveryAmount(wayBillId);	updateTotalRow();};		
			selectList.onkeyup		= function(){calulateBillAmount(wayBillId);calculateDeliveryAmount(wayBillId);};
		} else if(filter == 3) {
			selectList.onchange		= function(){hideShowApprovedBy(selectList);};
		}
	}

	let newCell 		= row.insertCell(position);
	newCell.className 	= 'datatd isBlackListed_'+wayBillId;
	newCell.appendChild(selectList);
	row.appendChild(newCell);

	return selectList;
}

function hideShowApprovedBy(obj) {
	let wayBillId = obj.id.split("_")[1];

	if(obj.value != ReceivableTypeConstant.CONSINEE_COPY_ID) {
		switchHtmlTagClass('approvedBy_' + wayBillId, 'show', 'hide');
	} else {
		switchHtmlTagClass('approvedBy_' + wayBillId, 'hide', 'show');
	}
}

function validateApprovedByField(wayBillId) {
	let receivableType		= getValueFromInputField('receivable_' + wayBillId);

	if(receivableType != ReceivableTypeConstant.CONSINEE_COPY_ID) {
		return !(!validateApprovedBy(1, 'approvedBy_' + wayBillId));
	}

	return true;
}

function setAutocompleters() {
	setDeliveryCreditorAutoComplete();
	setSearchCollectionPersonAutoComplete();
	setDeliveredToNameAutoComplete();
}

function checkEventforProcess(event) {

	let key	= getKeyCode(event);

	if (key == 13) {
		//getWaybillData();
		getWayBillDetails();
		resetWayBillNumer();
		$('#allowtds').prop('checked', false);
	} 
}

function resetWayBillNumer() {
	$('#waybillNmber').val("");
	$('#allowtds').val("");
	$('#allowtds').prop('checked', false);
	$('#VehicleNumber').val("");
	$('#OTPSelection').attr("checked", false);
	$('#OTPNumber').val("");
	$("#deliveryOTPDiv").addClass('hide');
	switchHtmlTagClass('photoCaptureSuccess', 'hide', 'show');
}

function checkForDuplicateNumber(id, number, filter) {
	let tableEl 	= document.getElementById(tableId);
	let rowCount 	= tableEl.rows.length;

	if(filter == 2) {
		if(document.getElementById('waybillNumber_' + id)) {
			showMessage('info', lrNumberAlreadyAdded(number)); //Coming from VariableForErrorMsg.js
			return;
		}
	} else {
		for (let i = 0, row; row = tableEl.rows[i]; i++) {
			let wayBillId = 0;
			if(document.getElementById('LRRow_' + row.id)) {
				wayBillId = document.getElementById('LRRow_' + row.id).value;
			}
			
			let addedWbNo = null;
			if(document.getElementById('waybillNumber_' + wayBillId)) {
				addedWbNo = document.getElementById('waybillNumber_' + wayBillId).value;
			}
			
			if(filter == 1) {
				if(addedWbNo!= undefined) {
					if(addedWbNo.toUpperCase() == number.toUpperCase()) {
						showMessage('info', lrNumberAlreadyAdded(number)); //Coming from VariableForErrorMsg.js
						return;
					}else {
						hideAllMessages();
					};
				}
			} 
		}
	}

	return true;
}

function setWaybillDetailsData(data) {
	if (data.userErrorId) {
		if (data.userErrorDescription) {
			showMessage('error', data.userErrorDescription);
			hideLayer();
			return;
		} else {
			hideAllMessages();
		}
	}
	
	if(data.showZeroAmount){
		data.waybillMod.grandTotal = 0;
		data.waybillMod.amount = 0;
		data.waybillMod.bookingTotal = 0;
	}
	
	if(configuration.showPaymentTypeAllSelection) {
		$('#deliveryPaymentType').change(function(){
			setSelectedPaymentTypeForAll(document.getElementById('deliveryPaymentType'));
		});
	}
	
	if(!checkForDuplicateNumber(data.wayBillId, data.wayBillNumber, 2)) {
		hideLayer();
		return;
	}

	switchHtmlTagClass('bottom-border-boxshadow', 'show', 'hide');
	switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
	addDataInDeliveryTable(data);
	updateTotalRow();
	setDeliveryCashPaymentTypeForMultipleLr();
	
	bifurcateChargeAmount();
	
	if(tdsConfiguration.IsTdsAllow)
		hideTDSFeildForFOC();

	if(data.showZeroAmount) {
		$('#billAmount_' + data.waybillMod.wayBillId).val(0);
		$('#Amount_' + data.waybillMod.wayBillId).val(0);
		$('#txtDelDisc_' + data.waybillMod.wayBillId).val(0);
		$('#txtDelDisc_' + data.waybillMod.wayBillId).prop('disabled', true);
		$('#txtDelDisc_' + data.waybillMod.wayBillId).prop('readOnly', true);
	}

	multiLRDeliveryTotalAmount = 0;
	multiLRDeliveryTdsTotalAmount = 0;
	$('#deliveryPaymentType').change(function() {
		setMultiLRDeliveryTotalAmount();
	});

	hideLayer();
}

//Changes done by Anant 28-12-2015
function getWaybillData(wayBillId) {

	let jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.WayBillId			= wayBillId;

	let jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.post("GenerateCRAjax.do?pageId=288&eventId=5",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					setWaybillDetailsData(data);
				}
			});
}

function getWaybillNumber() {
	let waybillNmber =	$('#waybillNmber').val();
	return waybillNmber.replace(/\s+/g, "");
}

function setSTPaidEnterNavigation() {
	if (configuration.DeliverySTPaidBy) {
		prev 	= 'deliveredToName';
		next 	= 'STPaidBy';
	}else {
		prev 	= 'deliveredToName';
		next 	= 'deliveryRemark';
	}
}

function disablePaymentType(wayBillId, waybillTypeId) {
	if (waybillTypeId != WAYBILL_TYPE_TO_PAY && $('#paymenttypebillcredit_' + wayBillId).exists())
		$('#paymenttypebillcredit_' + wayBillId).prop('disabled', true);

	if (waybillTypeId == WAYBILL_TYPE_FOC && $('#paymenttypecredit_' + wayBillId).exists())
		$('#paymenttypecredit_' + wayBillId).prop('disabled', true);
}

function hideDiscountOnLrTypeTbb(wayBillId, waybillTypeId) {
	if(waybillTypeId == WAYBILL_TYPE_CREDIT || waybillTypeId == WAYBILL_TYPE_TO_PAY && $('#paymenttypebillcredit_' + wayBillId).exists()) {
		$('#txtDelDisc_' +  wayBillId).prop('disabled', true);
		$('#discountTypes_' + wayBillId).prop('disabled', true);
	} else {
		$('#txtDelDisc_' +  wayBillId).prop('disabled', false);
		$('#discountTypes_' + wayBillId).prop('disabled', false);
	}
}

function checkDiscountValidation(wayBillId) {
	if (isDeliveryDiscountAllow) {
		if($("#txtDelDisc_" + wayBillId).val() > 0 && $("#discountTypes_" + wayBillId).val() <= 0 ) {
			showMessage('error', discountTypeErrMsg);//Coming from VariableForErrorMsg.js
			changeError1('discountTypes_' + wayBillId,'0','0');
			return false;
		} else {
			hideAllMessages();
			removeError('discountTypes_' + wayBillId);
			return true;
		}
	}
	
	return true;
}

function checkForNewDeliveryCustomer(objId) {

	let obj = document.getElementById(objId);

	if (obj.value.length > 0 && $('#selectedDeliveryCustomerId').val() <= 0) {
		execFeildPermission = execFldPermissions[FeildPermissionsConstant.AUTO_SAVE_DELIVERED_TO_NAME];
	
		if(execFeildPermission != null) {
			saveNewDeliveryCustomer(); //To Save Delivery time parties
		}
	}
	
	return false;
}

function saveNewDeliveryCustomer() {

	if(!validateInput(1, 'deliveredToName', 'deliveredToName', 'basicErrorDiv', 'Please Enter Delivered To Name !')) {
		return false;
	}

	let deliveredToName = document.getElementById('deliveredToName').value.toUpperCase();

	let jsonObject					= new Object();

	jsonObject.filter		= 4;
	jsonObject.name			= deliveredToName;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else {
					$('selectedDeliveryCustomerId').val(data.deliveryCustId);
				}
			});
}

function printWindow(crId) {
	let isCrPdfAllow = false;
	let multipleCrPrint = false;
	
	if(generateCrConfiguration.multipleCrPrintForNewFlow == true || generateCrConfiguration.multipleCrPrintForNewFlow == 'true'){
		 multipleCrPrint 	= true;
	}
	
	if(generateCrConfiguration.isWSCRPrintNeeded == true || generateCrConfiguration.isWSCRPrintNeeded == 'true'){
		if(generateCrConfiguration.singleCrPrintWithMultiLrNeeded == 'true'   || generateCrConfiguration.singleCrPrintWithMultiLrNeeded== true){
			childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=singlecrmultilrprint&masterid='+crId+'&isCrPdfAllow='+isCrPdfAllow+'&multipleCrPrint='+multipleCrPrint,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		} else {
			childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid='+crId+'&isCrPdfAllow='+isCrPdfAllow+'&multipleCrPrint='+multipleCrPrint,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	} else {
		childwin = window.open ('GenerateCRPrint.do?pageId=302&eventId=2&crId='+crId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		$('#waybillNmber').focus();
	}
}

function printWindowForMR(deliveryContactDetailsId,moduleIdentifier) {
	childwin = window.open ("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+deliveryContactDetailsId+"&moduleIdentifier="+moduleIdentifier,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

//only for Delivery time Hamali & Kondi Branch
function directDeliveryOption(obj) {
	/*if (obj.value > 0 && executive.branchId == Branch.BRANCH_ID_KONDI) {
		deliverWayBill(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
	}*/
}

function getServiceTaxExcludeCharges(wayBillId) {
	let charges	= jsondata.deliverChgs;
	let total	= 0;

	for (const element of charges) {
		let chargeMasterId	= element.chargeTypeMasterId;

		if(element.taxExclude == true) {
			total  += Number($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val());
		}
	}

	return total;
}

function getDeliveryChargesTotal(wayBillId) {
	let charges	= jsondata.deliverChgs;
	let total	= 0;

	for (const element of charges) {
		let chargeMasterId	= element.chargeTypeMasterId;
		
		if ($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val() != "") {
			total += parseFloat($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val());
		}
	}

	return total;
}

function calculateDeliveryTimeST(wayBillId) {

	let calculateSTOn    			= getDeliveryChargesTotal(wayBillId) - getServiceTaxExcludeCharges(wayBillId);
	let billAmt	   	    			= $('#billAmount_' + wayBillId).exists() ? Number($('#billAmount_' + wayBillId).val()) : 0;
	let grandAmnt					= $('#GrandAmnt_' + wayBillId).exists() ? Number($('#GrandAmnt_' + wayBillId).val()) : 0;
	let checkForServTax 			= $('#checkForServTax_' + wayBillId).val();
	let serviceTaxBY				= $('#serviceTaxBY_' + wayBillId).val();
	let waybillTypeId				= $('#waybillTypeId_' + wayBillId).val();
	let isSTAllow  					= false;
	let sourceBranchStateId			= $('#SourceBranchStateId_' + wayBillId).val();
	let destinationBranchStateId	= $('#DestinationBranchStateId_' + wayBillId).val();
	let consignorGstn				= $('#ConsignorGstn_' + wayBillId).val();
	let consigneeGstn				= $('#ConsigneeGstn_' + wayBillId).val();

	if(checkForServTax != "true") {
		calculateSTOn 		= parseInt(calculateSTOn) + parseInt(parseInt(grandAmnt));
	}  else{
		isSTAllow 			= true;
	}

	if((serviceTaxBY == TAX_PAID_BY_CONSINGOR_ID 
			|| serviceTaxBY == TAX_PAID_BY_CONSINGEE_ID) &&
			(waybillTypeId == WAYBILL_TYPE_CREDIT || waybillTypeId == WAYBILL_TYPE_TO_PAY)) {
		calculateSTOn 		= parseInt(calculateSTOn) + parseInt(parseInt(grandAmnt) - parseInt(billAmt));
	}

	// Tax Calculation
	let taxes		= jsondata.taxes;

	calculateMultiLRDeliveryTaxes(taxes, wayBillId, 'STPaidBy_', calculateSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, isSTAllow);

	if ($('#waybillTypeId_' + wayBillId).val() == WAYBILL_TYPE_TO_PAY) {
		if ( $('#billAmount_' + wayBillId).exists() ) {
			$('#billAmount_' + wayBillId).val(Number($('#billAmount_' + wayBillId).val()) + (Number($('#GrandAmnt_' + wayBillId).val())) );
		}
	}
}

function goToManualSelection() {

	let chk = document.getElementById("isManualCR");
	if(chk != null) {
		if(chk.checked) {
			$('#selectionCriteria').switchClass("show", "hide");
			$("#manualCRNumber").focus();
		} else {
			$('#selectionCriteria').switchClass("hide", "show");
			$("#manualCRNumber").val('');
		}
	}
}

function validateSTPaidBy(filter,wayBillId) {

	switch (Number(filter)) {
	case 1:
		if (configuration.DeliverySTPaidByValidate) {
			if(!validateInput(1, 'STPaidBy_' + wayBillId, 'STPaidBy_' + wayBillId, 'DeliveryErrorDiv', 'Please Select Service Tax Paid By !')) {
				return false;
			}
		}
		break;

	case 2:

		let calcSTOn			= getDeliveryChargesTotal() - getServiceTaxExcludeCharges(wayBillId);

		if (configuration.DeliverySTPaidByValidate) {
			if (calcSTOn > taxableAmount) {
				if(!validateInput(1, 'STPaidBy_' + wayBillId, 'STPaidBy_' + wayBillId, 'DeliveryErrorDiv', 'Please Select Service Tax Paid By !')) {
					return false;
				}
			}
		}

		break;
	default:
		break;
	}

	return true;
}

function deliverWayBill(str) {
	//resetData();
	let tableEl 					= document.getElementById(tableId);
	let wayBillId 					= 0;
	let prevPaymentType 			= 0;
	let prevActualAccountGroupId  	= 0;
	let deliveryOTPNumber 			= $('#OTPNumber').val();
	
	if(configuration.allowDeliveryTimeOTP){
		if(deliveryOTPNumber != ''){
			if(deliveryOTPNumber != OTPNumber){
				showMessage('error', 'Please Enter Valid OTP !')
				return false;
			}
		}
		else{
			showMessage('error', 'Please Enter OTP !')
			return false;
		}
	}
	
	if(configuration.doNotAllowDeliveryWithSingleLR) {
		let totalNoOfLrs = totalLrCount();
			
		if(totalNoOfLrs <= 1) {
			showMessage('error', 'Please add at least 2 LRs!');
			return false;
		}
	}

	for (let i = 1, row; row = tableEl.rows[i]; i++) {
		wayBillId	= 0;
		
		if(document.getElementById('LRRow_' + row.id)) {
			wayBillId = document.getElementById('LRRow_' + row.id).value;
		}
		if(wayBillId == 0) continue;
		
		if(configuration.collectionPersonValidateAtShortCreditPayment){
			var collectionPerson = $('#selectedCollectionPersonId_' + wayBillId);
			
			if (collectionPerson.val() <= 0 && $('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID) {
				collectionPerson.focus();
				validateInput(1, 'selectedCollectionPersonId_' + wayBillId, 'selectedCollectionPersonId_' + wayBillId, 'DeliveryErrorDiv', "Please Enter Collection Person!");
				return false;
			}
		}
		
		let lrtypeId =  $('#waybillTypeId_' + wayBillId).val();
		
		if(configuration.validateLrTypeWhileBillCredit
		&& $('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID && lrtypeId != WAYBILL_TYPE_TO_PAY) {
			showMessage('error', 'Please Remove Other LR, Only To Pay LR Allowed While Selected Bill-Credit Payment Type ! ')
			return false; 
		}

		let deliveredToPhoneNo 			= document.getElementById('deliveredToPhoneNo_' + wayBillId);
		let paidLoading					= Number($('#paidLoading_' + wayBillId).val()); 

		if(!validateInput(1, 'waybillId_' + wayBillId, 'waybillId_' + wayBillId, 'basicErrorDiv', 'Please Provide valid LR Number !')) {
			return false;
		}

		let actualAccountGroup = $('#actualAccountGroupId_' + wayBillId).val();

		if(i == 1) {
			prevActualAccountGroupId		= (actualAccountGroup);
		}

		if(actualAccountGroup != prevActualAccountGroupId) {
			let msg		= lrAccountGroupSameInfoMsg;
			showMessage('error', msg);
			return;
		}

		if(!configuration.AllowToDeliverLRForSELFConsigneeParty) {
			if(!allowToDeliveryLRForSelfParty(wayBillId)) {
				showMessage('error', 'You cannot deliver LR for SELF Consignee Party !');
				return false;
			}
		}
		
		if(configuration.isBlackListPartyCheckingAllow) {
			if($('#consigneeBlackList_' + wayBillId).val() == CorporateAccount.CORPORATEACCOUNT_DELIVERY_BLACK_LISTED
			|| $('#consigneeBlackList_' + wayBillId).val() == CorporateAccount.CORPORATEACCOUNT_BOTH_BLACK_LISTED) {
				showMessage('info', 'This Party ('+ $('#ConsigneeName_' + wayBillId).html() +')  Is BlackListed, LR Delivery Not Allowed !');
				return false;
			}
		}
			
		if(groupConfiguration.showPartyIsBlackListedParty == 'true' || groupConfiguration.showPartyIsBlackListedParty == true) {
			execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_DELIVERY_FOR_BLACK_LISTED_PARTY];
			
			if(execFeildPermission == null && wayBillPartyName[wayBillId] != undefined) {
				showMessage('info', 'This Party ('+ wayBillPartyName[wayBillId] +')  Is BlackListed, LR:'+$('#LrNumber_'+wayBillId).text() +' Delivery Not Allowed !');
				return false;
			}
		}
		
		if(configuration.showPaymentTypeAllSelection) {
			if(!validateInput(1, 'deliveryPaymentType', 'deliveryPaymentType', 'DeliveryErrorDiv', paymentTypeErrMsg))
				return false;
		} else if(!validateInput(1, 'deliveryPaymentType_' + wayBillId, 'deliveryPaymentType_' + wayBillId, 'DeliveryErrorDiv', paymentTypeErrMsg))
			return false;

		if (configuration.DeliveredToNameValidate 
			&& !validateInput(1, 'deliveredToName_' + wayBillId, 'deliveredToName_' + wayBillId, 'DeliveryErrorDiv', deliverdNameErrMsg))
			return false;

		if(configuration.ValidateApprovedByField && !validateApprovedByField(wayBillId))
			return false;

		if (configuration.DeliveredToPhoneNumberValidate) {
			if(!validateInput(1, 'deliveredToPhoneNo_' + wayBillId, 'deliveredToPhoneNo_' + wayBillId, 'DeliveryErrorDiv', deliverdPhoneNumErrMsg))
				return false;

			if ( deliveredToPhoneNo != null && (deliveredToPhoneNo.value.length < 8 || deliveredToPhoneNo.value.length > 10)) {
				showMessage('error', validPhoneNumberErrMsg);
				changeError1('deliveredToPhoneNo_' + wayBillId,'0','0');
				return false;
			}
		}

		if (!validateSTPaidBy(configuration.DeliverySTPaidByValidateFlavor, wayBillId))
			return false;

		if (configuration.DeliveryRemarkValidate && !validateInput(1, 'deliveryRemark_' + wayBillId, 'deliveryRemark_' + wayBillId, 'DeliveryErrorDiv', ramarkErrMsg))
			return false;
		
		if(tdsConfiguration.IsPANNumberMandetory && !validateInput(1, 'panNumber_' + wayBillId, 'panNumber_' + wayBillId, 'DeliveryErrorDiv', "Please Enter PAN Number !"))
			return false;
		
		if(tdsConfiguration.IsTANNumberMandetory && !validateInput(1, 'tanNumber_' + wayBillId, 'tanNumber_' + wayBillId, 'DeliveryErrorDiv', "Please Enter TAN Number !"))
			return false;
		
		if(!validatePaymentMode(1, 'deliveryPaymentType_' + wayBillId))
			return false;
		
		if(BankPaymentOperationRequired && isValidPaymentMode($('#deliveryPaymentType_' + wayBillId).val())) { //Defined in paymentTypeSelection.js
			if(!$('#paymentDataTr_0').exists() && !isPaidByDynamicQRCode) {
				showMessage('info', iconForInfoMsg + 'Please, Add Payment details for LR Number ' + openFontTag + $('#LrNumber_'+ wayBillId).html() + closeFontTag + ' !');
				return false;
			}
		}
		
		if(!octroiServiceValidation())
			return false;

		let deliveryPaymentType = document.getElementById('deliveryPaymentType_' + wayBillId);
		
		if(i == 1)
			prevPaymentType 			= (deliveryPaymentType.value);
		
		if (deliveryPaymentType.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
			if(paidLoading <= 0) {
				if(!validateInput(1, 'selectedDeliveryCreditorId_' + wayBillId, 'selectedDeliveryCreditorId_' + wayBillId, 'DeliveryErrorDiv', properDeliveryCreditorNameErrMsg))
					return false;
			} else {
//				alert(changePaidLoadingChargeAlertMsg); /changePaidLoadingChargeAlertMsg coming from VariableForErrorMsg.js file
				return false;
			}
		}

		if(!validateForPaymentTypeCheque(wayBillId))
			return false;
		
		if(deliveryPaymentType.value != prevPaymentType) {
			showMessage('error', lrPaymentTypeSameInfoMsg);  //lrPaymentTypeSameInfoMsg coming from VariableForErrorMsg.js file
			return;
		}
	}
	
	/*
	if(configuration.showVehicleNumber && !validateInput(1, 'VehicleNumber', 'VehicleNumber', 'DeliveryErrorDiv', 'Please select Vehicle Number'))
			return false;
	*/		

	let chk = document.getElementById("isManualCR");
	
	if (chk != null && chk.checked) {

		let manualCRNumber 		= document.getElementById("manualCRNumber");
		let manualCRDate 		= document.getElementById("manualCRDate");
		let manualCRNumberVal 	= parseInt(manualCRNumber.value, 10);

		if(!validateInput(1, 'manualCRNumber', 'manualCRNumber', 'DeliveryErrorDiv', manualCrNumberErrMsg))
			return false;

		if(!validateInput(1, 'manualCRDate', 'manualCRDate', 'DeliveryErrorDiv', manualCrDateErrMsg)) {
			return false;
		} else {
			if (chkDate(manualCRDate.value) ) {

				let maxRange = Number($("#MaxRange").val());
				let minRange = Number($("#MinRange").val());

				if(manualCRNumberVal >= minRange && manualCRNumberVal <= maxRange) {
					hideAllMessages();
					removeError('manualCRNumber');
					
					if (checkedManualCRSave != manualCRNumberVal) {
						if (checkedManualCROnCancel != manualCRNumberVal) {
							let jsonObject					= new Object();

							jsonObject.filter			= 5;
							jsonObject.manualCRNumber	= manualCRNumberVal;
							jsonObject.manualCRDate		= manualCRDate.value;

							let jsonStr = JSON.stringify(jsonObject);

							$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16",
									{json:jsonStr}, function(data) {
										if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
											showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
										} else {
											let response = data.isManualCRNoExists;

											if(response == true) {
												showMessage('error', crNumberAlreadyCreatedInfoMsg);
												changeError1('manualCRNumber','0','0');
												manualCRNumber.focus();
												return false;
											} else {
												hideAllMessages();
												removeError('manualCRNumber');
												finallyDeliverWayBill(str);
											};
										}
									});

							checkedManualCRSave = manualCRNumberVal;
						} else {
							finallyDeliverWayBill(str);
						}
					} else {
						showMessage('error', crNumberAlreadyCreatedInfoMsg);
						changeError1('manualCRNumber','0','0');
						manualCRNumber.focus();
						return false;
					};
				} else {
					showMessage('error', manualCrWithinRange);
					changeError1('manualCRNumber','0','0');
					return false;
				};
			} else {
				return false;
			};
		};
	} else {
		finallyDeliverWayBill(str);
	};
};

function panNumberValidation(wayBillId){
	let panNumber = $('#panNumber_' + wayBillId ).val();

	if(tdsConfiguration.IsPANNumberRequired){
		if(typeof panNumber !== 'undefined' && panNumber !== 'undefined'){
			if(panNumber == ''){
				return true;
			} else {
				if(panNumber.length == 10)
					return true;
				
				showMessage('error', "Please enter 10 digit Pan number !");
				$('#panNumber_' + wayBillId).val('');
				$('#panNumber_' + wayBillId).focus();
				return false;
			} 
		} else {
			return true;
		}
	}
}

function validateForPaymentTypeCheque(wayBillId) {
	if(!validateInput(1, 'deliveryPaymentType_' + wayBillId, 'deliveryPaymentType_' + wayBillId, 'DeliveryErrorDiv', paymentTypeErrMsg))
		return false;
	
	if(BankPaymentOperationRequired)
		return true;

	if($('#deliveryPaymentType_' + wayBillId).val() == PAYMENT_TYPE_CHEQUE_ID) {
		if(!validateInput(1, 'chequeDate_'+wayBillId, 'chequeDate_' + wayBillId, 'DeliveryErrorDiv', chequeDateErrMsg)
		|| !validateInput(1, 'chequeNo_'+wayBillId, 'chequeNo_' + wayBillId, 'DeliveryErrorDiv', chequeNumberErrMsg)
		|| !validateInput(1, 'chequeAmount_' + wayBillId, 'chequeAmount_' + wayBillId, 'DeliveryErrorDiv', chequeAmountErrMsg)
		|| !validateInput(1, 'bankName_' + wayBillId, 'bankName_' + wayBillId, 'DeliveryErrorDiv', bankNameErrMsg))
			return false;
	}
	
	return true;
	
}

function checkReceivedAmount(wayBillId) {
	if (configuration.DeliveryReceivedAmountValidate) {
		if(!validateInput(1, 'receivedAmnt_' + wayBillId, 'receivedAmnt_' + wayBillId, 'DeliveryErrorDiv', receivedAmountErrMsg)) {
			return false;
		}
	}

	return true;
}

function disableButton(){
	let deliverButton = document.getElementById('deliver');
	
	if(deliverButton != null) {
		deliverButton.className 		= 'btn_print_disabled';
		deliverButton.style.display 	= 'none'; 
		deliverButton.disabled			= true;
	}
}

function enableButton() {
	let deliverButton = document.getElementById('deliver');
	
	if(deliverButton != null) {
		deliverButton.className 		= 'button button-3d button-primary button-rounded';
		deliverButton.style.display 	= 'block'; 
		deliverButton.disabled			= false;
	}
}

function finallyDeliverWayBill(str) {

	let tableEl 	= document.getElementById(tableId);
	
	let delveryAmt 		= 0;

	for (let i = 1, row; row = tableEl.rows[i]; i++) {

		let wayBillId = 0;
		if(document.getElementById('LRRow_'+row.id)){
			wayBillId = document.getElementById('LRRow_'+row.id).value;

			let deliveredToPhoneNo	= document.getElementById('deliveredToPhoneNo_'+wayBillId);

			checkedManualCRSave = null;
			
			if ( checkReceivedAmount(wayBillId) ) {
				//Calculate delivery Amount
				calulateBillAmount(wayBillId);
				calculateDeliveryAmount(wayBillId);
				//Discount Type Validation
				if (!checkDiscountValidation(wayBillId))
					return false;	
				
				if( deliveredToPhoneNo.value == '')
					deliveredToPhoneNo.value = '0000000000';
			};
			
			delveryAmt += Number($('#deliveryAmount_' + wayBillId).val());
		}
	}

	disableButton();
	
	setTimeout(function(){
		confirmSaveMultiCRPopup(str, delveryAmt);
	}, 100);
}

function forwardForDelivery() {

	let jsonObject					= new Object();

	jsonObject.filter				= 3;

	getUrlForSubmit(jsonObject);

	let jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.post("GenerateCRAjax.do?pageId=288&eventId=5",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					if(configuration.showCentralizedDeliveryCreditor) {
						$('.DeliveryCreditorNamediv').addClass('hide');
						$('#DeliveryCreditorName').val('');
						$('#centralizedDelCreditorId').val(0);
					}

					if (data.doNotPrint == true) {
						$('#reprinnt').switchClass("hide", "show");
						$('#mrPrintBtn').switchClass("hide", "show");
					} else {
						showReprintOption(data.crId);
						printWindow(data.crId);
						let prenum	= '<b>( Previous CR No. '+ data.crNumber +' )</b>';
						$('#previousLrNumber').html(prenum);
						
						if(typeof data.deliveryContactDetailsId !== 'undefined' && data.deliveryContactDetailsId > 0) {
							showMrPrintOption(data.deliveryContactDetailsId,data.moduleId);
							let prenum	= '<b>( Previous MR No. '+ data.mrNumber +' )</b>';
							$('#mrPrintBtn').removeClass('hide');
							$('#previousMrNumber').html(prenum);
						}
					}
					
					switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
					switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
					resetData();
					enableButton();
					hideLayer();
				}
			});
}

function showReprintOption(crId){
	$('#previouscrId').val(crId);
	$('#reprinnt').switchClass("show", "hide");
}

function showMrPrintOption(deliveryContactDetailsId,moduleId){
	$('#deliveryContactDetailsId').val(deliveryContactDetailsId);
	$('#moduleId').val(moduleId);
	$('#mrPrintBtn').switchClass("show", "hide");
}

function getUrlForSubmit(jsonObject) {

	let tableEl 		= document.getElementById(tableId);
	let rowCount 		= tableEl.rows.length;
	let wayBillId 		= 0;
	let jsonObjectArray = [];
	let jsonObjectdata 	= null; 
	let wayBillIdArr   	= [];

	manualCrCheck(jsonObject);

	for (let i = 1, row; row = tableEl.rows[i]; i++) {
		if(document.getElementById('LRRow_' + row.id))
			wayBillId = document.getElementById('LRRow_' + row.id).value;
		
		if(wayBillId > 0) {
			let deliveryPaymentType = $('#deliveryPaymentType_' + wayBillId).val();

			jsonObjectdata 								= new Object();

			jsonObjectdata.waybillId					= wayBillId;
			jsonObjectdata.consignorId					= $('#ConsignorId_' + wayBillId).val();
			jsonObjectdata.consigneeId					= $('#ConsigneeId_' + wayBillId).val();
			jsonObjectdata.deliveredToName				= $('#deliveredToName_' + wayBillId).val();
			jsonObjectdata.deliveredToPhoneNo			= $('#deliveredToPhoneNo_' + wayBillId).val();
			jsonObjectdata.deliveryRemark				= $('#deliveryRemark_' + wayBillId).val();
			jsonObjectdata.deliverString				= $('#deliverString').val();
			jsonObjectdata.txtDelDisc					= $('#txtDelDisc_' + wayBillId).val();
			jsonObjectdata.STPaidBy						= $('#STPaidBy_' + wayBillId).val();
			jsonObjectdata.selectedDeliveryCustomerId	= $('#selectedDeliveryCustomerId_' + wayBillId).val();
			jsonObjectdata.billingCreditorId			= $('#selectedDeliveryCreditorId_' + wayBillId).val();
			jsonObjectdata.collectionPersonId			= $('#selectedCollectionPersonId_' + wayBillId).val();
			jsonObjectdata.deliveryPaymentType			= deliveryPaymentType;
			jsonObjectdata.wbBookingDate				= $('#wbBookingDate_' + wayBillId).val();
			jsonObjectdata.tdsAmount					= $('#tdsAmount_' + wayBillId).val();
			jsonObjectdata.deliveryPanNumber			= $('#panNumber_' + wayBillId).val();
			jsonObjectdata.tanNumber					= $('#tanNumber_' + wayBillId).val();
			jsonObjectdata.tdsOnAmount					= $('#billAmount_' + wayBillId).val();
			jsonObjectdata.discountTypes				= $('#discountTypes_' + wayBillId).val();
			jsonObjectdata.wayBillTypeId				= $('#waybillTypeId_' + wayBillId).val();
			jsonObjectdata.recoveryBranchId				= $('#recoveryBranchId_' + wayBillId).val();

			if(tdsConfiguration.IsTDSInPercentAllow)
				jsonObjectdata.tdsRate					= tdsRate;
			
			if(BankPaymentOperationRequired)
				jsonObjectdata.chequeAmount		= $('#billAmount_' + wayBillId).val();
			else
				chequeDetails(deliveryPaymentType, jsonObjectdata, wayBillId);
				
			serviceTaxAmnt(jsonObjectdata, wayBillId);
			deliveryChargesWithIds(jsonObjectdata, wayBillId);
			getReceivableTypes(jsonObjectdata, wayBillId);
			getApprovedBy(jsonObjectdata, wayBillId);
			getConsineeDetails(jsonObjectdata, wayBillId);

			jsonObjectArray.push(jsonObjectdata);
			wayBillIdArr.push(wayBillId);
		}
	}

	jsonObject.lrWiseJsonDeliveryDataValueObject = jsonObjectArray;

	jsonObject.wayBillIds		= wayBillIdArr.join(',');
	
	rowCount 		= $('#storedPaymentDetails tr').length;

	if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
		let paymentCheckBoxArr			= getAllCheckBoxSelectValue('paymentCheckBox');
		jsonObject.paymentValues		= paymentCheckBoxArr.join(',');
	}
	
	jsonObject.deliveryPaymentType_0	= Number(deliveryPaymentType_0);
	
	if (validatePhonePayTransaction && Number(deliveryPaymentType_0) == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) {
			jsonObject.qrCodeMapperId = $('#qrCodeMapperId').val();
			
			if(allowDynamicPhonepeQR){
				jsonObject.isPaidByDynamicQRCode = isPaidByDynamicQRCode;
				jsonObject.transactionId = $('#transactionFld').val();
				jsonObject.merchantId = $('#merchantIdFld').val();
				jsonObject.apiReqResDataId = $('#apiReqResDataIdFld').val();
			}
	}
	jsonObject.vehicleNumber			= vehicleNumber;
	jsonObject.vehicleNumberMasterId	= vehicleNumberMasterId;
	
	if (!isCanvasBlank('pictureCanvas'))
		jsonObject.image = encodeURIComponent(getCanvasImage('pictureCanvas'));		
}

function getReceivableTypes(jsonObject, wayBillId) {
	if($('#receivable_' + wayBillId).val() != "") {
		jsonObject.receivableTypeId		= $('#receivable_' + wayBillId).val();
	}
}

function getApprovedBy(jsonObject, wayBillId) {
	if($('#approvedBy_' + wayBillId).val() != "") {
		jsonObject.approvedBy			= $('#approvedBy_' + wayBillId).val();
	}
}

function getConsineeDetails(jsonObject, wayBillId) {
	if(validateConsineeName(wayBillId)) {
		jsonObject.isExist			= 1;
		jsonObject.name				= $('#consigneeNameAutocomplete_' + wayBillId).val();
		jsonObject.partyId			= $('#newConsigneeCorpAccId_' + wayBillId).val();
	} 
}

function validateConsineeName(wayBillId) {
	let consigneeCorpAccId		= $('#consigneeCorpAccId_' + wayBillId).val();
	let consigneeNameId			= $('#newConsigneeCorpAccId_' + wayBillId).val();

	return consigneeNameId > 0 && consigneeNameId != consigneeCorpAccId;
}

function manualCrCheck(jsonObject) {
	if ($('#isManualCR').exists()) {
		let isManualCR = document.getElementById('isManualCR');

		if (isManualCR.checked) {
			jsonObject.isManualCR		= isManualCR;
			jsonObject.manualCRNumber	= $('#manualCRNumber').val();
			jsonObject.manualCRDate		= $('#manualCRDate').val();
		}
	}
}

function chequeDetails(deliveryPaymentType, jsonObjectdata, wayBillId) {
	if (deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID) {
		jsonObjectdata.chequeNumber		= $('#chequeNo_' + wayBillId).val();
		jsonObjectdata.chequeAmount		= $('#chequeAmount_' + wayBillId).val();
		jsonObjectdata.bankName			= $('#bankName_' + wayBillId).val();
		jsonObjectdata.chequeDate		= $('#chequeDate_' + wayBillId).val();
	}
}

function serviceTaxAmnt(jsonObjectdata, wayBillId) {

	let taxes	= jsondata.taxes;

	if(jQuery.isEmptyObject(taxes)) {
		return;
	}

	let taxModels = jsondata.taxes;

	if(jQuery.isEmptyObject(taxes)) {
		return true;
	}

	for(const element of taxModels) {
		jsonObjectdata['tax_' + element.taxMasterId + '_' + wayBillId] 				= $('#tax_' + element.taxMasterId + '_' + wayBillId).val();
		jsonObjectdata['unAddedST_' + element.taxMasterId + '_' + wayBillId] 			= $('#unAddedST_' + element.taxMasterId + '_' + wayBillId).val();
		jsonObjectdata['actualTax_' + element.taxMasterId + '_' + wayBillId] 			= $('#actualTax_' + element.taxMasterId + '_' + wayBillId).val();
		jsonObjectdata['calculateSTOnAmount_' + element.taxMasterId + '_' + wayBillId] = $('#calculateSTOnAmount_' + element.taxMasterId + '_' + wayBillId).val();
	}
}

function deliveryChargesWithIds(jsonObjectdata,wayBillId) {

	let deliverChgs = jsondata.deliverChgs;

	if( !jsondata.deliverChgs || jQuery.isEmptyObject(deliverChgs)) {
		return;
	}

	for(const element of deliverChgs) {
		jsonObjectdata['deliveryCharge' + element.chargeTypeMasterId]		= $('#deliveryCharge' + element.chargeTypeMasterId + '_' + wayBillId).val();
	}
}

function octroiServiceValidation() {

	let octServId		= 'deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE;
	let octAmt			= 0;
	let octroiSrv		= 0;
	let octroiSrvMin	= 0;

	if (!configuration.OctroiValidate) {
		return true;
	}

	if ($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).exists()) {
		octAmt			= parseInt($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).val());
	}

	if ($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).exists()) {
		octroiSrv		= parseInt($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val());
	}

	octroiSrvMin	= Math.round(octAmt * 0.03);

	if(octroiSrv < octroiSrvMin) {
		showMessage('error', octroiSrvMinInfoMsg(octroiSrvMin));
		changeError1(octServId,'0','0');
		return false;
	} else {
		hideAllMessages();
		removeError(octServId);
		return true;
	}
}

function calculateOctroiService(filter, obj) {

	switch (Number(filter)) {
	case 1:
		var octAmt 		= 0;
		if ($('#deliveryCharge'+ DeliveryChargeConstant.OCTROI_DELIVERY ).exists()) {
			octAmt 		= Number($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).val());
		}

		var octSrvAmt 	= Math.round((octAmt * octroiServiceCharge) / 100);
		if(octAmt > 0 && obj.value < octSrvAmt) {
			$(obj).val(octSrvAmt);
		}

		break;

	case 2:
		var octAmt 			 = parseInt($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).val());
		var octServiceAmt 	 = parseInt($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val());
		var calServiceamt    = Math.round(octAmt * 0.05);
		
		if (obj.value <= 10 && octAmt > 0 && calServiceamt < 10) {
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val(octServiceAmt);
		} else if (obj.value >= 10 && octAmt <= 0) {
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val(0);
		} else if (obj.value < calServiceamt) {
			if (isOctroiServiceApplicable) {
				$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val(calServiceamt);
				isOctroiServiceApplicable = false; 
			}
		}

		break;

	default:
		break;
	}
}

function calculateOctroiDelivery(filter, obj) {

	switch (Number(filter)) {
	case 1:
		var octAmt 			= parseInt(obj.value);
		var configOctAmt 	= parseInt($('#configOctroiAmount').val());
		
		if(octAmt >= configOctAmt) {
			var octSrvAmt 	= Math.round((octAmt * octroiServiceCharge) / 100);
			var octSrvice 	= document.getElementById('deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE);
			
			if(octSrvice != null) {
				if(octAmt > 0 && octSrvice.value < octSrvAmt) {
					octSrvice.value = octSrvAmt;
				}
			}
		} else {
			$(obj).val(configOctAmt);
			alert(octroiAmtLessThanConfiguredAmtAlertMsg);
			$(obj).focus();
		}

		break;

	case 2:
		var octAmt			= parseInt(obj.value);
		var configOctAmt	= parseInt($('#configOctroiAmount').val());
		var calServiceamt	= Math.round(octAmt * 0.05);

		if(octAmt > 0) {
			if (isOctroiServiceApplicable || calServiceamt > $('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE).val()) {
				$('#deliveryCharge'+ DeliveryChargeConstant.OCTROI_SERVICE).val(calServiceamt);
				isOctroiServiceApplicable = false;
			}
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_FORM).val(configuration.OctroiFormMinimumAmount);
		} else {
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_FORM ).val(0);
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE ).val(0);
		}

		if(octAmt >= configOctAmt) {
			var octSrvAmt 	= Math.round((octAmt * octroiServiceCharge) / 100);
			var octSrvice 	= document.getElementById('deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE);
		
			if(octSrvice != null) {
				if(octAmt > 0 && octSrvice.value < octSrvAmt) {
					octSrvice.value = octSrvAmt;
				}
			}
		} else {
			$(obj).val(configOctAmt);
			alert(octroiAmtLessThanConfiguredAmtAlertMsg);
			$(obj).focus();
		}

		break;

	default:
		break;
	}
}

function applyCharges(obj) {

	if (!($(obj).exists())) {
		return;
	}

	let chargeId	= $(obj).data('chargeid');

	if (chargeId == null || chargeId == undefined) {
		return;
	}

	switch (chargeId) {
	case DeliveryChargeConstant.OCTROI_SERVICE:
		calculateOctroiService(configuration.OctroiServiceCalculationFilter, obj);
		break;

	case DeliveryChargeConstant.OCTROI_DELIVERY:
		calculateOctroiDelivery(configuration.OctroiDeliveryCalculationFilter, obj);
		break;

	case DeliveryChargeConstant.DAMERAGE:

		var damrageAmt 			= parseInt(obj.value);
		var configdamrageAmt 	= parseInt($('#configDamerageAmount').val());
		if(damrageAmt < configdamrageAmt) {
			$(obj).val(configdamrageAmt);
			$(obj).focus();
		}

		break;

	case DeliveryChargeConstant.OCTROI_FORM:

		var octAmt 		= parseInt($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).val());
		if (obj.value <= configuration.OctroiFormMinimumAmount && octAmt > 0) {
			$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_FORM).val(configuration.OctroiFormMinimumAmount);
		}

		break;

	default:
		break;
	}

	if ($('#waybillTypeId').val() == WAYBILL_TYPE_FOC) {
		disableDeliveryCharges('deliveryCharges');
	}
}

function disableDeliveryCharges(waybillTypeId,wayBillId) {

	let charges = jsondata.deliverChgs;  
	if (waybillTypeId == WAYBILL_TYPE_FOC) {
		for (const element of charges) {
			$('#deliveryCharge' + element.chargeTypeMasterId + '_' + wayBillId).prop('disabled', true);
			$('#deliveryCharge' + element.chargeTypeMasterId + '_' + wayBillId).val(0);

			if($('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY + '_' + wayBillId).exists()) {
				$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY + '_' + wayBillId).prop('disabled', false);
				$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY + '_' + wayBillId).prop('readOnly', false);
			}
		}
	}
}

function resetOnDelete(e){
	let keynum = getKeyCode(e);

	if(keynum == 8  || keynum == 46 ){
		$('#selectedDeliveryCreditorId').val(0);
	}
}

function checkDate(date,el,isFutureDateAllowed) {
	if(isValidDate(date)) {
		let dateParts = date.split("-");
		let manualCRDate = new Date(dateParts[2], parseInt(dateParts[1],10) - 1, dateParts[0]);
		if(manualCRDate <= curSystemDate) {
			hideAllMessages();
			removeError(el);
			return true;
		} else {
			if(!isFutureDateAllowed) {
				showMessage('error', enterFutureDateErrMsg); //enterFutureDateErrMsg defined in VariableForErrorMsg.js file
				changeError1(el,'0','0');
				return false;
			}
		}
	} else {
		el.focus();
		showMessage('error', validDateErrMsg); //validDateErrMsg defined in VariableForErrorMsg.js file
		changeError1(el,'0','0');
		return false;
	};
}

function waybillId() {
	return $('#waybillId').val();
}

function checkForCRNo() {
	let reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
	let str = $("#manualCRNumber").val().replace(reg, '');
	if($("#manualCRNumber").val() && str.length > 0) {
		if(parseInt($("#manualCRNumber").val()) >= parseInt($("#MinRange").val()) && parseInt($("#manualCRNumber").val()) <= parseInt($("#MaxRange").val()) ){
			hideAllMessages();
			return true;
		} else {
			showMessage('error', crNumberNotInRangeErrMsg); //crNumberNotInRangeErrMsg defined in VariableForErrorMsg.js file
			$('#manualCRNumber').focus();
			return false;
		};
	} else {
		showMessage('error', crNumberErrMsg); //crNumberErrMsg defined in VariableForErrorMsg.js file
		$('#manualCRNumber').focus();
		return false;
	};
}

function chkDate(date) {

	if(isValidDate(date)) {

		let currentDate  	= new Date(curSystemDate);
		let previousDate 	= new Date(curSystemDate);
		let manualCRDate 	= new Date(curSystemDate);
		let wbBookingDate 	= new Date(document.getElementById('wbBookingDate').value);
		let pastDaysAllowed = jsondata.ManualCRDaysAllowed;

		if (pastDaysAllowed < '0') {
			showMessage('error', configManualDeliverErrMsg);
			changeError1('manualCRDate','0','0');
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);
		let manualCRDateParts = new String(date).split("-");
		manualCRDate.setFullYear(parseInt(manualCRDateParts[2],10));
		manualCRDate.setMonth(parseInt(manualCRDateParts[1]-1,10));
		manualCRDate.setDate(parseInt(manualCRDateParts[0],10));

		if(wbBookingDate != null) {
			wbBookingDate.setHours(0,0,0,0);
			if (manualCRDate.getTime() < wbBookingDate.getTime()) {
				showMessage('error', deliveryDateErlThanBookDateInfoMsg); //defined in VariableForErrorMsg.js file
				changeError1('manualCRDate','0','0');
				return false;
			} else {
				if(manualCRDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg); //defined in VariableForErrorMsg.js file
					changeError1('manualCRDate','0','0');
					return false;
				} else {
					if(manualCRDate.getTime() > previousDate.getTime()) {
						hideAllMessages();
						removeError('manualCRDate');
						return true;
					} else {
						showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));  //defined in VariableForErrorMsg.js file
						changeError1('manualCRDate','0','0');
						return false;
					};
				};
			};
		} else{
			if(manualCRDate.getTime() > currentDate.getTime()) {
				showMessage('error', futureDateNotAllowdErrMsg);  //defined in VariableForErrorMsg.js file
				changeError1('manualCRDate','0','0');
				return false;
			}else{
				if(manualCRDate.getTime() > previousDate.getTime()) {
					hideAllMessages();
					removeError('manualCRDate');
					return true;
				} else {
					showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));  //defined in VariableForErrorMsg.js file
					changeError1('manualCRDate','0','0');
					return false;
				};
			};
		};
	} else {
		showMessage('error', validDateErrMsg);  //defined in VariableForErrorMsg.js file
		changeError1('manualCRDate','0','0');
		return false;
	}
}

function resetData() {

	$('#gcrData').switchClass("hide", "show");

	hideAllMessages();
	hideInfo();

	$('#' + tableId).find('tr').slice(1).remove();
	if($('#isManualCR')){
		$("#isManualCR").attr("checked", false);
	}

	$('#ErrorForNorecords').html('');
	if ($('#selectionCriteria').exists()) {
		$("selectionCriteria").switchClass("hide", "show");
		$('#manualCRNumber').val('');
		hideAllMessages();
	}
	
	if(configuration.showPaymentTypeAllSelection) {
		$('#deliveryPaymentType').val(0);
	}
	
	if(configuration.allowToBifurcateCharge) {
		$('#totalChargeAmount').val('');
	}
	ConsigneePartyMasterIdArr		= new Array();
	multiLRDeliveryTotalAmount		= 0;
	multiLRDeliveryTdsTotalAmount = 0;
	isPaidByDynamicQRCode = false;
	$('#transactionFld').val("");
	$('#merchantIdFld').val("");
	$('#apiReqResDataIdFld').val("");
}

function setChequeAmount(wayBillId) {
	let chequeAmount = document.getElementById("chequeAmount_" + wayBillId);

	if(chequeAmount != null) {
		if($('#deliveryPaymentType_' + wayBillId).val() == PAYMENT_TYPE_CHEQUE_ID) {
			if($('#billAmount_' + wayBillId).exists()) {
				chequeAmount.value = $('#billAmount_' + wayBillId).val();
			}
		} else {
			chequeAmount.value = '0';
		}
	}
}

function changeRecAmount() {
	let amount	= 0;

	amount	= getDeliveryChargesTotal();

	if ($('#receivedAmnt').exists()) {
		if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY) {
			$('#receivedAmnt').val(Number(amount) + Number($('#GrandAmnt').val()));
		} else {
			$('#receivedAmnt').val(Number(amount));
		}
	}
}

function calulateBillAmount(wayBillId) {
	let billAmt 	= document.getElementById('billAmount_' + wayBillId);
	let paidLoading = $('#paidLoading_' + wayBillId).val();
	let	amount		= getDeliveryChargesTotal(wayBillId);
	
	if ($('#txtDelDisc_' + wayBillId).exists()) {
		if($('txtDelDisc_' + wayBillId).val() == '')
			$('txtDelDisc_' + wayBillId).val(0);
		
		if(billAmt)
			billAmt.value = (Number(amount) - Number($('#txtDelDisc_' + wayBillId).val()) - paidLoading);
	} else if(billAmt)
		billAmt.value = (parseFloat(amount) - paidLoading);

	calculateDeliveryTimeST(wayBillId);
	setChequeAmount(wayBillId);
}

function calculateDeliveryAmount(wayBillId) {
	$('#deliveryAmount_' + wayBillId).val($('#billAmount_' + wayBillId).val());
}

function chkDiscount(wayBillId) {
	let deliveryAmount 		= $('#deliveryAmount_' + wayBillId).val();
	let discountOnTxnType	= $('#discountOnTxnType_' + wayBillId).val();
	
	if(configuration.isPartyDiscountCheckingAllowed) {
		if(discountOnTxnType == CorporateAccount.CORPORATEACCOUNT_NO_DISCOUNT || discountOnTxnType == CorporateAccount.CORPORATEACCOUNT_BOOKING_DISCOUNT) {
			showMessage('info', 'Discount Not Allowed for (' + $('#ConsigneeName_' + wayBillId).html() + ') party !');
			$("#txtDelDisc_" + wayBillId).val("0");
			return false;
		} 
	}

	if(Number($('#billAmount_' + wayBillId).val()) < 0 || (Number($('#txtDelDisc_' + wayBillId).val()) > Number(deliveryAmount))) {
		alert('Invalid Discount !');
		$('#txtDelDisc_' + wayBillId).val('0');
		$('#txtDelDisc_' + wayBillId).focus();
		calulateBillAmount(wayBillId);
	}
}

function chkTdsAmount(wayBillId){
	let deliveryAmount 		= $('#deliveryAmount_' + wayBillId).val();
	if(Number($('#billAmount_' + wayBillId).val()) < 0 || (Number($('#tdsAmount_' + wayBillId).val()) > Number(deliveryAmount))) {
		alert('Invalid Amount!');
		$('#tdsAmount_' + wayBillId).val('0');
		$('#tdsAmount_' + wayBillId).focus();
	}
	updateTotalRow(); 
}

function hideShowChequeDetail(isShow, wayBilId) {
	if(isShow){
		$('#bankName_' + wayBilId).show();
		$('#chequeNo_' + wayBilId).show();
		$('#chequeAmount_' + wayBilId).show();
		$('#chequeDate_' + wayBilId).show('');
	} else {
		$('#bankName_' + wayBilId).hide();
		$('#bankName_' + wayBilId).val('');
		$('#chequeNo_' + wayBilId).hide();
		$('#chequeNo_' + wayBilId).val('');
		$('#chequeAmount_' + wayBilId).hide();
		$('#chequeAmount_' + wayBilId).val('');
		$('#chequeDate_' + wayBilId).hide('');
	}
}

function hideShowDeliveryCreditor(isShow, wayBilId) {
	if(isShow){
		$('#deliveryCreditor_' + wayBilId).show();
	} else {
		$('#deliveryCreditor_' + wayBilId).hide();
		$('#deliveryCreditor_' + wayBilId).val('');
		$("#selectedDeliveryCreditorId_" + wayBilId).val(0);
	}
}

function hideShowDeliveryContactDetail(isShow, wayBilId) {
	if(isShow) {
		$('#deliveredToName_' + wayBilId).show();
		$('#deliveredToPhoneNo_' + wayBilId).show();
	} else {
		$('#deliveredToName_' + wayBilId).hide();
		$('#deliveredToPhoneNo_' + wayBilId).hide();
	}
}

function hideShowCollectionPerson(isShow, wayBilId) { 
	if(isShow){
		$('#searchCollectionPerson_' + wayBilId).show();
	} else {
		$('#searchCollectionPerson_' + wayBilId).hide();
		$('#searchCollectionPerson_' + wayBilId).val('');
		$("#selectedCollectionPersonId_" + wayBilId).val(0);
	}
}

function hideShowRecoveryBranch(isShow, wayBilId) { 
	if(isShow){
		$('#recoveryBranch_' + wayBilId).show();
		$("#recoveryBranchId_" + wayBilId).val($("#defaultRecoveryBranchId_" + wayBilId).val());
		$('#recoveryBranch_' + wayBilId).val($("#defaultRecoveryBranch_" + wayBilId).val());
	}else{
		$('#recoveryBranch_' + wayBilId).hide();
		$("#recoveryBranchId_" + wayBilId).val(0);
		$('#recoveryBranch_' + wayBilId).val('');
	}
	
}

function hideShowPaymentTypeDetailsForAll(paymentType, wayBilId) {

	hideShowDeliveryContactDetail(true,wayBilId);

	if(paymentType == 0)
		hideShowDeliveryContactDetail(false,wayBilId);

	hideShowChequeDetail(false, wayBilId);
	hideShowRecoveryBranch(paymentType == PAYMENT_TYPE_CREDIT_ID && configuration.showRecoveryBranchForShortCredit, wayBilId);
	hideShowDeliveryCreditor(paymentType == PAYMENT_TYPE_BILL_CREDIT_ID, wayBilId);
	hideShowCollectionPerson(paymentType == PAYMENT_TYPE_CREDIT_ID, wayBilId);

	if(paymentType == 0
			|| paymentType == PAYMENT_TYPE_CASH_ID
			|| paymentType == PAYMENT_TYPE_CREDIT_ID
			|| paymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {

		$('#viewPaymentDetails').addClass("hide");
	} else {
		$('#viewPaymentDetails').removeClass("hide");
	}
}

function hideShowPaymentTypeDetails(obj) {  // replaced from hideShowChequeDetails(obj)
	let wayBilId = obj.id.split("_")[1];

	hideShowDeliveryContactDetail(obj.value != 0, wayBilId);
	hideShowChequeDetail(obj.value == PAYMENT_TYPE_CHEQUE_ID && !BankPaymentOperationRequired, wayBilId);
	hideShowDeliveryCreditor(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID, wayBilId);
	hideShowCollectionPerson(obj.value == PAYMENT_TYPE_CREDIT_ID, wayBilId);
	hideShowRecoveryBranch(obj.value == PAYMENT_TYPE_CREDIT_ID && configuration.showRecoveryBranchForShortCredit, wayBilId);

	if(BankPaymentOperationRequired && Number(obj.value) > 0) {
		if(obj.value == PAYMENT_TYPE_CASH_ID
			|| obj.value == PAYMENT_TYPE_CREDIT_ID
			|| obj.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
				
			$('#viewPaymentDetails').addClass("hide");
		} else {
			$('#viewPaymentDetails').removeClass("hide");
		}
	} else {
		$('#viewPaymentDetails').addClass("hide");
	}
}

function charsForDate(e){
	let keynum = getKeyCode(e);

	if(keynum == 8 || keynum == 45){
		return true;
	}
	if (keynum < 48 || keynum > 57 ) {
		return false;
	}
	return true;
}

function setFocusForDeliveryPaymentType(eleObj) {

	if(eleObj.value == PAYMENT_TYPE_CHEQUE_ID ) {
		next='chequeDate';
	} else if( eleObj.value == PAYMENT_TYPE_CASH_ID) {
		next='deliveredToName';
	} else if( eleObj.value == PAYMENT_TYPE_BILL_CREDIT_ID ) {
		next='deliveryCreditor';
	} else {
		if(eleObj.value == PAYMENT_TYPE_CREDIT_ID ) {
			next ='searchCollectionPerson';
		} else {
			next ='deliveredToName';
		}
	}
	prev='deliveryPaymentType';
}

function nextToDeliveryCharges(){
	let table = document.getElementById('deliveryCharges');
	if(table != null && table!= undefined){
		next = table.rows[0].cells[1].children[0].id;
	}
}

function getLastCharge() {
	let charges		= jsondata.deliverChgs;
	prev			= 'deliveryCharge'+charges[charges.length - 1].chargeTypeMasterId;
}

function allowToDeliveryLRForSelfParty(wayBillId) {
	let consigneeNameId			= $('#newConsigneeCorpAccId_' + wayBillId).val();
	let consigneeCorpAccId		= $('#consigneeCorpAccId_' + wayBillId).val();

	if(dbWiseSelfPartCA) {
		if(dbWiseSelfPartCA.corporateAccountId == Number(consigneeNameId)) {
			return false;
		} else if(dbWiseSelfPartCA.corporateAccountId == Number(consigneeCorpAccId) && consigneeNameId == 0) {
			return false;
		} else {
			return true;
		}
	}

	return true;
}

function checkForNewParty(objId, wayBillId) {

	if(!configuration.ConsigneePartyAutoSaveAllow) {
		return;
	}

	let jsonObject					= new Object();
	let stringNew					= '(New)';
	let allowToSaveParty			= false;

	let consigneeNameAutocomplete	= null;

	let obj 	= document.getElementById(objId);
	let valObj 	= obj.value;

	allowToSaveParty				= valObj.includes(stringNew);

	if(allowToSaveParty && confirm("Are you sure you want to save Party ?")) {
		if(valObj.indexOf("(") >= 0) {
			valObj = valObj.substring(0,valObj.indexOf('('));
			consigneeNameAutocomplete = valObj;
		}

		jsonObject.partyType			= CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH;
		jsonObject.partyName			= consigneeNameAutocomplete;
		jsonObject.partyAddress			= executive.branchName;
		jsonObject.partyMobileNumber	= '0000000000';
		jsonObject.partyBranchId		= branchId;
		jsonObject.isPodRequired		= 0;

		let jsonStr = JSON.stringify(jsonObject);

		$.getJSON("CorporatePartySaveAjaxAction.do?pageId=9&eventId=17",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						let newPartyId = parseInt(data.partyid);

						if(newPartyId > 0) {
							getPartyDetails(newPartyId, 'consigneeNameAutocomplete_', wayBillId);
						}
					}
				});

		next	= 'receivable';
	} else {
		next	= 'receivable';
	}
}

function getPartyDetails(partyId, name, wayBillId) {

	let jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.partyId				= partyId;
	jsonObject.getCharge			= 1;
	jsonObject.partyPanelType		= 1;
	jsonObject.partyType			= partyType;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {

					if(!data.partyDetails) {
						return;
					}

					let party = data.partyDetails;

					$('#newConsigneeCorpAccId_' + wayBillId).val(party.corporateAccountId);

					$('#' + name + wayBillId).val(party.displayName);
				}
			});
}

function getDeliveryDemmerageRates1(corporateAccountId, wayBillId) {
	
	let jsonObject					= new Object();
	jsonObject.corporateAccountId	= corporateAccountId;
	jsonObject.waybillId			= wayBillId;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=353&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						console.log("No rates");
					}
				} else {
					$('#deliveryCharge' + DAMERAGE + "_" + wayBillId).val(data.damerage);
					
					//applyRates();
					calulateBillAmount(wayBillId);
				}
			});
}

function setDefaultCharges(wayBillId) {
	if(configuration.setDefaultDRCharge) {
		$('#deliveryCharge' + DR_CHARGE + "_" + wayBillId).val(configuration.setDefaultDRChargeAmount);
	}
}

function setSelectedPaymentTypeForAll() {
	let obj				= document.getElementById('deliveryPaymentType');
	
	let checkBoxArray	= [];
	
	$.each($("input[name=waybillids]:checked"), function() { 
		checkBoxArray.push($(this).val());
	});
	
	if(obj.value > 0) {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');

		$('#storedPaymentDetails').empty();
		
		deliveryPaymentType_0	= Number(obj.value);
		
		hideShowBankPaymentTypeOptions(document.getElementById('deliveryPaymentType'));

		for (const element of checkBoxArray) {
			$('#deliveryPaymentType_' + Number(element)).prop('disabled' , true);
			$('#deliveryPaymentType_' + Number(element)).val(obj.value);
			hideShowPaymentTypeDetailsForAll(obj.value, Number(element));
			
			if(configuration.showCentralizeDeliveryDetails) {
				$('#deliveredToName_' + Number(element)).val('');
				$('#deliveredToPhoneNo_' + Number(element)).val('');
			}
		}
		
		$('#consigneeName').focus();
	} else {
		deliveryPaymentType_0	= 0;
	}
}

function setAllSTPaidBy() {
	let obj	= document.getElementById('centralizeSTPaidBy');
	let checkBoxArray	= getAllCheckBoxSelectValue('waybillids');
	
	for (const element of checkBoxArray) {
		$('#STPaidBy_' + Number(element)).val(obj.value);
		calculateDeliveryTimeST(Number(element));
	}
}

function updateNameAndPhoNo(flag, id, event) {
	if (event.keyCode === 13) {
		setDeliveryDetailsForAll(flag, id);
		$('#consigneeNumber').focus();
	}
}

function setDeliveryDetailsForAll(flag, id) {
	let checkBoxArray	= getAllCheckBoxSelectValue('waybillids');
		
		
	if(flag) {
		for (const element of checkBoxArray) {
			$('#deliveredToName_' + Number(element)).val($('#consigneeName').val());
			$('#deliveredToPhoneNo_' + Number(element)).val($('#consigneeNumber').val());
		}
	} else {
		for (const element of checkBoxArray) {
			if(id == 1)
				$('#deliveredToName_' + Number(element)).val($('#consigneeName').val());
			else
				$('#deliveredToPhoneNo_' + Number(element)).val($('#consigneeNumber').val());
		}
	}
}

function totalLrCount() {
	let tableEl 	= document.getElementById(tableId);
	let totalLrs	= 0;

	for (let i = 0, row; row = tableEl.rows[i]; i++) {
		let wayBillId 		= 0;
		
		if(document.getElementById('LRRow_' + row.id))
			wayBillId 		= document.getElementById('LRRow_' + row.id).value;
	
		if(wayBillId > 0)
			totalLrs++;
	}
	
	return totalLrs;
}

function setDeliveryChargesTotal() {
	
	if(configuration.showSummaryTable) {

		let tableEl 				= document.getElementById(tableId);
		let charges					= jsondata.deliverChgs;
		let totalLrs				= 0;
		let bookingTotal			= 0;
		let deliveryChargesTotal	= 0;
		let grandTotal				= 0;

		for (let i = 0, row; row = tableEl.rows[i]; i++) {

			let wayBillId 		= 0;
			let wayBillTypeId	= 0;

			if(document.getElementById('LRRow_' + row.id)) {
				wayBillId 		= document.getElementById('LRRow_' + row.id).value;
				wayBillTypeId	= $('#waybillTypeId_' + wayBillId).val();
			}

			if(wayBillId > 0) {
				totalLrs++;

				for (const element of charges) {
					let chargeMasterId	= element.chargeTypeMasterId;

					if ($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val() != "")
						deliveryChargesTotal += parseFloat($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val());
				}

				if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					bookingTotal	+= Number($('#Amount_' + wayBillId).html());

				grandTotal 		+= Number($('#billAmount_' + wayBillId).val());
			}
		}

		$('#totalLrs').html(totalLrs);
		$('#bookingTotal').html(bookingTotal);
		$('#deliveryChargesTotal').html(deliveryChargesTotal);
		$('#grandTotal').html(grandTotal);
		
	}
}

function bifurcateChargeAmount() {
	
	if(configuration.allowToBifurcateCharge && Number(configuration.chargeIdToBifurcate) > 0) {

		let tableEl 				= document.getElementById(tableId);
		let rowCount 				= tableEl.rows.length - 2;
		let chargeMasterId			= Number(configuration.chargeIdToBifurcate);
		let totalChargeAmount		= Number($('#totalChargeAmount').val());
		let chargeAmount			= 0;
		let roundOfChargeAmount		= 0;
		let chargeAmountForLastRow	= 0;
		
		if (!totalChargeAmount) { 
			$('[id^="deliveryCharge' + chargeMasterId + '_"]').val(0).prop('disabled', true).each(function() {
				let wayBillId = this.id.split('_')[1];
				calulateBillAmount(wayBillId);
				calculateDeliveryAmount(wayBillId);
			});
		}
		
		if(Number(totalChargeAmount > 0)) {
			chargeAmount			= Number(totalChargeAmount) / Number(rowCount);
		}
		
		for (let i = 0, row; row = tableEl.rows[i]; i++) {
			
			let wayBillId 		= 0;

			if(document.getElementById('LRRow_' + row.id)) {
				wayBillId 		= document.getElementById('LRRow_' + row.id).value;
			}
			
			if(wayBillId > 0 && Number(chargeAmount) > 0) {
				if(Number(rowCount) == i) {
					chargeAmountForLastRow	= Number(totalChargeAmount) - Number(roundOfChargeAmount);
					$("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val(Math.round(chargeAmountForLastRow));
				} else {
					$("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val(Math.round(chargeAmount));
					
					roundOfChargeAmount += Number($("#deliveryCharge" + chargeMasterId + "_" + wayBillId).val());
				}
				
				$("#deliveryCharge" + chargeMasterId + "_" + wayBillId).prop('disabled' , true);
				calulateBillAmount(wayBillId);
				calculateDeliveryAmount(wayBillId);
			}
		}
		
		setDeliveryChargesTotal();
		updateTotalRow();
	}
}

function isNumberKeyWithDecimal(evt,id) {

	let charCode = (evt.which) ? evt.which : event.keyCode;

	if(charCode==46){
		let txt=document.getElementById(id).value;

		if(!(txt.indexOf(".") > -1))
			return true;
	}

	if (charCode > 31 && (charCode < 48 || charCode > 57) )
		return false;

	return true;
}

function createCheckboxElement(value, elementId, className, checked) {
	let ele = document.createElement("input");

	if(elementId != null && elementId.length > 0) {
		ele.id     	= elementId;
		ele.name   	= elementId;
	}

	ele.className	= className;
	ele.value 		= value;
	ele.type 		= 'checkbox';
	
	if(checked)
		ele.checked		= 'checked';
	
	return ele;
}

function confirmSaveMultiCRPopup(str, delveryAmt){
	
	$('#confirmSaveCRWithMultiLR').bPopup({
		escClose: true,
		onOpen: function(){
			disableButton();
		},
		onClose: function(){
			enableButton();
		}
	},function(){
		disableButton();
		
		let _thisMod = this;
		
		if(isPaidByDynamicQRCode) {
			_thisMod.close();
			$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
			showLayer();
			forwardForDelivery();
		} else {
			$(this).html("<div class='confirm' style='min-width: 250pt;min-height: 132pt;'><h1 style='color: #2CAE54;font-size:20px'>Are you sure you want to "+ str +" LR of </h1>" +
							"<h1 style='color: #4A61A8;font-size:22px'> Amount :  "+delveryAmt+"</h1> " +
							"<p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p>" +
							"<button id='cancelButton' style='height: 25pt;font-size: 15px;'>NO</button><button autofocus id='confirm' style='height: 25pt;font-size: 15px;'>YES</button></div>")
					
			$("#confirm").focus();
			$("#confirm").one('click',function(){
				_thisMod.close();
				$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
				showLayer();
				forwardForDelivery();
			})
	
			$("#confirm").one('keydown', function(e) {
				if (e.which == 27) {  //escape
					_thisMod.close();
				}
			});
			$("#cancelButton").click(function(){
				if( $("manualCRNumber").exists() ) {
					checkedManualCROnCancel = document.getElementById("manualCRNumber").value.trim();
				}
				_thisMod.close();
				enableButton();
			})
		}
	});
}

function hideTDSFeildForFOC() {
	let tableEl 	= document.getElementById(tableId);
	let focFound 	= false;
	
	for (let i = 1, row; row = tableEl.rows[i]; i++) {
		let wayBillId	= 0;
		
		if(document.getElementById('LRRow_' + row.id)) {
			wayBillId = document.getElementById('LRRow_' + row.id).value;
		}
		
		let lrtypeId =  $('#waybillTypeId_' + wayBillId).val();
		
		if(lrtypeId == WAYBILL_TYPE_FOC) {
			focFound = true;
			break;
		}
	}
	
	if(focFound)
		$('#tdsoption').addClass('hide');
	else
		$('#tdsoption').removeClass('hide');
}

function deliveryTimeOTP() {
	
	wayBillId	= 0;
	let tableEl 					= document.getElementById(tableId);
	if(document.getElementById('LRRow_' + row.id)) {
		wayBillId = document.getElementById('LRRow_' + tableEl.rows[1].id).value;
	}
	var conMobileNumber = $('#ConsigneeMobileNo_' + wayBillId).val();

	if(!validateConsigneeMobileNumber(conMobileNumber))
		return;
		
	if ($('#OTPSelection').prop('checked'))
		$("#deliveryOTPDiv").removeClass('hide');
	else
		$("#deliveryOTPDiv").addClass('hide');
			
	if ($('#OTPSelection').prop('checked')) {

		showLayer();
		
		var jsonObject = new Object()
		jsonObject.deliveredMobileNo 	= conMobileNumber;
		jsonObject.wayBillNumber 		= $('#lrNum').text();
		
		OTPNumber	= 0;

		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if (data.message != undefined) {
					var errorMessage = data.message;
					OTPNumber = data.otpNumber;
					console.log("OTPNumber .... " + OTPNumber);
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					return;
				}
				
				hideLayer();
			}
		});
	}
}


function validateConsigneeMobileNumber(mobileNumber) {
    var reg = /^[789]\d{9}$/;  
    mobileNumber = String(mobileNumber).trim();

    if (mobileNumber.length !== 10 || !reg.test(mobileNumber)) {
        showMessage('error', 'Consignee Mobile Number Not Valid.');
        $('#OTPSelection').attr("checked", false)
        return false;
    }

    return true;
}

function startServices(){
	if (servicePermission.isPhotoTxnService && configuration.allowPhotoServiceOnCR) {
		console.log("startWebCam calllll");
		$('#gcrPhotoCapture').switchClass('show','hide');
		startWebCam('picVideo', 'pictureCanvas', 'takePicture');
	} else {
		$('#gcrPhotoCapture').switchClass('hide','show');
		stopWebCam();
		clearCanvas('pictureCanvas');
	}
	checkIfWebCamIsStreaming(configuration);
}

function checkIfWebCamIsStreaming(config){
	
	if(typeof $("#picVideo").attr('data-video') == 'undefined') {
		window.setTimeout(function() {checkIfWebCamIsStreaming(config)},500);
	} else {
		$('#photoService').prop('disabled', false);
		hideLayer();
	}
}

function setMultiLRDeliveryTotalAmount() {

	let tableEl 	= document.getElementById(tableId);
	
	multiLRDeliveryTotalAmount 		= 0;
	multiLRDeliveryTdsTotalAmount	= 0;

	for (let i = 1, row; row = tableEl.rows[i]; i++) {

		let wayBillId = 0;
		if(document.getElementById('LRRow_'+row.id)){
			wayBillId = document.getElementById('LRRow_'+row.id).value;
			
			if (checkReceivedAmount(wayBillId)) {
				calulateBillAmount(wayBillId);
				calculateDeliveryAmount(wayBillId);
				if(!checkDiscountValidation(wayBillId))
					return false;	
			};
			
			multiLRDeliveryTotalAmount += Number($('#deliveryAmount_' + wayBillId).val());
			multiLRDeliveryTdsTotalAmount += Number($('#tdsAmount_' + wayBillId).val());
		}
	}
}