var configuration	= null;
var urlBillId	= 0;
var urlBillNumber	= null;
var urlIsWSInvoicePrintNeeded	= false;
var urlIsPrintBillGroup	= false;
var urlBillPdfEmailAllowed	= false;
var billcreationEmailPopup	= false;

function loadCreateInvoiceData() {
	$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL+'/creditorInvoiceWS/initialiseCreateBill.do',
			data:'',
			dataType	:	'json',
			success: function(response) {
				configuration	 = response;
				
				//variables defined in regexvalidation.js
				allowSpecialCharacterForRemark		= configuration.allowSpecialCharacterForRemark
				allowedSpecialCharactersForRemark	= configuration.allowedSpecialCharactersForRemark
				
				showHiddenData(response);
				
				setCalender(response);
				showHideDate();
				showHidePodStatus();
				showHideAmount();
				setPartyNameAutoComplete();
				setCollectionPersonAutoComplete(configuration.showGroupWiseCollectionPerson);
				$('#additionalChargeLable').html(configuration.additionalChargeLable);
			}
	});
}

function showHiddenData(response) {
	if(response.allowToEnterSACCode) {
		$('#sacCodeOption').removeClass('hide');
		$('#sacCode').val(response.byDefaultSACCode);
	} else
		$('#sacCodeOption').remove();
		
	if(response.allowToEnterHSNCode) {
		$('#hsnCodeOption').removeClass('hide');
		$('#hsnCode').val(response.byDefaultHSNCode);
	} else
		$('#hsnCodeOption').remove();

	if(response.allowToEnterVCode)
		$('#vCodeOption').removeClass('hide');
	else
		$('#vCodeOption').remove();
		
	if(response.allowToEnterMSMINumber)
		$('#msmiNoOption').removeClass('hide');
	else
		$('#msmiNoOption').remove();
		
	if(response.allowToEnterPODate)
		$('#poDateOption').removeClass('hide');
	else
		$('#poDateOption').remove();
		
	if(response.allowToEnterPONumber)
		$('#poNumberOption').removeClass('hide');
	else
		$('#poNumberOption').remove();
		
	if(response.addAutoRateUpdateRequest)
		$('#addRateUpdateRequest1').removeClass('hide');
					
	if(response.collectionPersonPermission)
		$('#collectionPersonNameCol').removeClass('hide');
	else
		$('#collectionPersonNameCol').remove();
					
	if(response.showPartyNameFeildForPrint)
		$('#partyNameFeildForPrintCol').removeClass('hide');
	else
		$('#partyNameFeildForPrintCol').remove();
		
	if(response.allowManualInvoiceNumber)
		$('#manualInvoiceNumberCol').removeClass('hide');
	else
		$('#manualInvoiceNumberCol').remove();
		
	if(response.podHoldPermission)
		$('#podHoldCol').removeClass('hide');
	else
		$('#podHoldCol').remove();
		
	if(response.showAdditionalDiscountOption)
		$('#additionalDiscountCol').removeClass('hide');
	else
		$('#additionalDiscountCol').remove();
		
	if(response.showAdditionalDiscountOptionWithPercentage)
		$('#additionalDiscountColWithPercentageCol').removeClass('hide');
	else
		$('#additionalDiscountColWithPercentageCol').remove();		
		
	if(response.showBillOfSupplierCheckbox)
		$('#billOfSupplyChecboxCol').removeClass('hide');
	else
		$('#billOfSupplyChecboxCol').remove();
}

function setCalender(response) {
	let dateStr		= getCurrentFormattedDate(curDate);
	
	$('#manualInvoiceDate').val(dateStr);
	
	if(response.allowBackDate) {
		if(response.lastBillDate != undefined) {
			$( function() {
				$('#manualInvoiceDate').datepicker({
					minDate		: response.lastBillDate,
					maxDate		: dateStr,
					defaultDate	: dateStr,
					showAnim	: "fold",
					dateFormat	: 'dd-mm-yy'
				});
			});
		} else {
			$( function() {
				$('#manualInvoiceDate').datepicker({
					minDate		: minDateFromProperty,
					maxDate		: dateStr,
					defaultDate	: dateStr,
					showAnim	: "fold",
					dateFormat	: 'dd-mm-yy'
				});
			});
		}
	} else
		setReadOnly('manualInvoiceDate', true);
			  
	$( function() {
		$('#fromDate').datepicker({
			minDate		: minDateFromProperty,
			maxDate		: dateStr,
			defaultDate	: dateStr,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	});
	
	$( function() {
		$('#toDate').datepicker({
			minDate		: minDateFromProperty,
			maxDate		: dateStr,
			defaultDate	: dateStr,
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	});
	
	$(function() {
		$('#poDate').datepicker({
			showAnim : "fold",
			dateFormat : 'dd-mm-yy'
		});
	});
}

function showHideDate() {
	var elObj	= document.getElementById('searchByDate');
	let dateStr	= getCurrentFormattedDate(curDate);
	
	if(elObj != null && elObj.checked) {
		document.getElementById('dateTD').style.display = 'inline';
	} else {
		document.getElementById('dateTD').style.display = 'none';
		document.getElementById('fromDate').value = dateStr; 
		document.getElementById('toDate').value = dateStr; 
	}
}

function editWayBillCharges(wayBillId) {
	let creditorId		= document.createBillForm.CorporateAccountId.value;
	window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+0+'&creditorInvoice=true&redirectFilter=11','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}
function updateWayBillDestination(wayBillId,wbSourceSubRegionId,destSubRegionId ,destBranchId ,wayBillStatus,wbSrcBranchId){
	childwin = window.open ('updateDestination.do?pageId=25&eventId=17&wayBillId='+wayBillId+'&wbSrcSubRegionId='+wbSourceSubRegionId+'&destSubRegionId='+destSubRegionId+'&destBranchId='+destBranchId+'&wayBillStatus='+wayBillStatus+'&wbSrcBranchId='+wbSrcBranchId+'&redirectFilter=11','newwindow',config='left=300,top=100,height=825,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateConsignment(wayBillId) {
	let creditorName	= document.createBillForm.CorporateAccountName.value;
	let creditorId		= document.createBillForm.CorporateAccountId.value;
	window.open('updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId='+wayBillId+'&creditorId='+creditorId+'&creditorName='+creditorName+'&redirectFilter=11','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}
function updateCustomer(wayBillId) {
	let creditorName	= document.createBillForm.CorporateAccountName.value;
	childwin = window.open('updateTBBCustomer.do?pageId=25&eventId=3&wayBillId='+wayBillId+'&creditorName='+creditorName+'&redirectFilter=11&isUpdateTBBCustomer=true','newwindow','left=300,top=120,height=500,width=900,toolbar=no,resizable=no,scrollbars=yes');
}
function editLrInvoiceNumber(wayBillId) {
	childwin = window.open('updateWayBillInvoiceNo.do?pageId=340&eventId=2&modulename=updateLrInvoiceNumber&wayBillId='+wayBillId+'&redirectFilter=11','newwindow','left=300,top=100,height=500,width=700, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function editLrSource(waybillId, bookingBranchId, sourceBranchId) {
	childwin = window.open('updateWayBillFormType.do?pageId=340&eventId=2&modulename=editLRSource&waybillId='+waybillId+'&bookingBranchId='+bookingBranchId+'&sourceBranchId='+sourceBranchId+'&redirectFilter=11','newwindow','left=300,top=100,height=200,width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function updateTransportationMode(wayBillId, billId) {
	childwin = window.open ('updateTransportationMode.do?pageId=340&eventId=2&modulename=updateTransportationMode&wayBillId='+wayBillId+'&billId='+billId+'&redirectFilter=11','newwindow','left=300,top=100,height=825,width=900, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function reportFormValidations() {

	let cAcc=document.getElementById('CreditorId');
	if(cAcc.value == 0){
		showMessage('error',creditorSelectErrMsg);
		toogleElement('error','block');
		changeError1('CreditorId','0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError('CreditorId');
	} 

	return true;	
}

function storeSelectedValues(){
	let selectedCorporateAccount = document.getElementById('CreditorId');

	if(selectedCorporateAccount!= null){
		document.getElementById('selectedCorporateAccount').value = selectedCorporateAccount.options[selectedCorporateAccount.selectedIndex].text;
	}
}

function removeCreaatebillCalumns(){
	$(".removeColumns").remove();
	
	setTimeout(function(){
	$("#Find").trigger('click');
	},500);
}

function setPartyNameAutoComplete() {
	$("#creditor").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=3",
		minLength: 3,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			$('#selectedCorporateAccountId').val(ui.item.id);

			if((ui.item.label).indexOf('(') == -1) {
				$('#consigneePartyName').val(ui.item.label);
			} else {
				$('#consigneePartyName').val((ui.item.label).substring(0, (ui.item.label).indexOf('(')));
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setCollectionPersonAutoComplete(showGroupWiseCollectionPerson) {
	$("#searchCollectionPerson").autocomplete({
		source: "AutoCompleteAjaxAction.do?pageId=9&eventId=13&showGroupWiseCollectionPerson="+showGroupWiseCollectionPerson+"&filter=13",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			$('#selectedCollectionPersonId').val(ui.item.id);
		},
		response: function(event, ui) {
			$('#selectedCollectionPersonId').val(ui.content[0].id);
			setLogoutIfEmpty(ui);
		}
	});
}

function checkDuplicate(seqInput) {
	let inputNo = Number(seqInput.value);
	let inputId	= seqInput.id;
	
	let checkBoxArray	= getAllCheckBoxSelectValue('wayBillIdsForSeq');
	let seqArray	= [];
	
	if(checkBoxArray.length > 0) {
		for(let i = 0; i < checkBoxArray.length; i++) {
			if(inputId != 'sequenceWise_' + checkBoxArray[i] && $('#sequenceWise_' + checkBoxArray[i]).val() > 0)
				seqArray.push(Number($('#sequenceWise_' + checkBoxArray[i]).val()));
		}
	}
	
	if(isValueExistInArray(seqArray, inputNo)) {
		$('#' + inputId).val('');
		$('#' + inputId).focus();
		showMessage('error', inputNo + ' is already added!');
		return;
	} else if(inputNo == 0) {
		$('#' + inputId).val('');
		$('#' + inputId).focus();
		showMessage('error', ' We can not add zero!');
		return;
	}
}

function validateCollectionPerson() {
	let collPersonName	= $("#searchCollectionPerson").val();
	let collPersonId	= Number($("#selectedCollectionPersonId").val());
	
	if(configuration.validateCollectionPerson && $('#searchCollectionPerson').exists() && $('#searchCollectionPerson').is(":visible")
		&& (collPersonName.length <= 0 || collPersonId <= 0 || $('#selectedCollectionPersonId').val() <= 0)) {
		showMessage('error', collectionPersonErrMsg1);
		changeTextFieldColor('searchCollectionPerson', '', '', 'red');
		return false;
	}
	
	return true;
}

function openPrintTypePopup(wayBillNumberArr){
		$('#popUpForPrint').bPopup({
		},function(){
			
			let _thisMod = this;
			$(this).html("<div class='confirm' style='height:250px;width:500px; text-align: center;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
					+"<b style='font-size:18px; color:DodgerBlue;'>POD is not Uploaded For LR No - "+wayBillNumberArr.join(', ')+"</b><br/><br/>"		
					+"<input type='button' id='cancelButton' value ='OK' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
				
			$("#cancelButton").click(function(){
				_thisMod.close();
				setTimeout(function(){
					createInvoiceBill();
					},300);
				
			});
		});
	}
	
function disableButtons(){
	let downButton = document.getElementById("generateBillDownButton");
	
	if(downButton != null){
		downButton.className = 'btn_print_disabled';
		downButton.disabled=true;
		downButton.style.display ='none'; 
	}
	
	let upButton = document.getElementById("generateBillUpButton");
	
	if(upButton != null){
		upButton.className = 'btn_print_disabled';
		upButton.disabled=true;
		upButton.style.display ='none'; 
	}
	
	let find = document.getElementById('Find');	
	
	if(find != null){
		find.disabled = true;
		find.style.display = 'none';
	}
}

function setCountAndColor(wbId) {
	$('#flagFor_' + wbId).val('true');
	$('#viewExp_' + wbId).css('color','#ec4009');
}

function calculateDataForSumm(){
	let totalAmount = 0;
	let totalPkgs = 0;
	let totalActWght = 0;
	let totalChgWght = 0;
	
	let wayBillIdArray	= getAllCheckBoxSelectValue('wayBillIdsForBill');
	
	for (let wayBillId of wayBillIdArray) {
		if(configuration.allowRateInDecimal)
			totalAmount += parseFloat($('#amount_' + wayBillId).html());
		else
			totalAmount += parseInt($('#amount_' + wayBillId).html());
			
		if (configuration.showActualWeightWithoutRoundOff)
			totalActWght += parseFloat($('#actWght_' + wayBillId).html());
		else
			totalActWght += parseInt($('#actWght_' + wayBillId).html());

		if (configuration.showChargeWeightWithoutRoundOff)
			totalChgWght += parseFloat($('#chgWght_' + wayBillId).html());
		else
			totalChgWght += parseInt($('#chgWght_' + wayBillId).html());

		
		let part		= ($('#packages_' + wayBillId).html()).split(' ');;

		for (const element of part) {
			// checking perpart value is avaliable
			if (typeof element!== 'undefined') { 
				let thenum = element.replace( /^\D+/g, '');

				if (thenum !=='')
					totalPkgs += parseInt(thenum);
			}
		}
	}
	
	if(wayBillIdArray.length > 0) {
		$('#lrs').html(wayBillIdArray.length);
		
		if(configuration.allowRateInDecimal)
			$('#tamount').html(totalAmount.toFixed(2));
		else
			$('#tamount').html(totalAmount);

		if (configuration.showActualWeightWithoutRoundOff)
			$('#tactwght').html(totalActWght.toFixed(2));
		else
			$('#tactwght').html(totalActWght);

		if (configuration.showChargeWeightWithoutRoundOff)
			$('#tchgwght').html(totalChgWght.toFixed(2));
		else
			$('#tchgwght').html(totalChgWght);

		$('#tpkgs').html(totalPkgs);

		document.getElementById('reportTitleData').removeAttribute("hidden");
	} else
		document.getElementById('reportTitleData').setAttribute("hidden", "");
	
	updateAdditionalCharge();
	
	if(configuration.applyTaxOnBill && wayBillIdArray.length > 0 && 
		(!$('#billOfSupply').exists() || $('#billOfSupply').exists() && !$('#billOfSupply').is(":checked")))
		applyTaxOnBill();
}

function applyTaxOnBill() {
	let wayBillIdArray	= getAllCheckBoxSelectValue('wayBillIdsForBill');
	
	if(wayBillIdArray.length == 0) {
		showMessage('error', wayBillSelectErrMsg);
		$('#applyTax').prop("checked", false);
		toogleElement('error','block');
		return false;
	}
	
	if(configuration.isTransportationModeDropDownAllow) {
		let transportModeString			= getTransportationModeBill(wayBillIdArray);
		let transportModeStringpart		= transportModeString.split("_");
		
		if($('#applyTax').is(':checked') && transportModeStringpart[0] == "Mix") {
			showMessage("info", "You cannot apply tax on Mix transportation Mode !");
			$('#applyTax').prop("checked", false);
			return false;
		}
	}
}

function getTransportationModeBill(wayBillIds){
	let countRoad			= 0;
	let countRail			= 0;
	let countAir			= 0;
	let countRoadExpress	= 0;
	let countRoadQuicker	= 0;
	let transportModeId		= 0;
	
	for(let wayBillId of wayBillIds) {
		transportModeId = $("#transportMode_" + wayBillId).val();
		
		if(transportModeId == TRANSPORTATION_MODE_AIR_ID)
			++countAir;
		else if(transportModeId == TRANSPORTATION_MODE_RAIL_ID)
			++countRail;
		else if(transportModeId == TRANSPORTATION_MODE_ROAD_EXPRESS_ID)
			++countRoadExpress;
		else if(transportModeId == TRANSPORTATION_MODE_ROAD_ID)
			++countRoad;
		else if(transportModeId == TRANSPORTATION_MODE_ROAD_QUICKER_ID)
			++countRoadQuicker;
	}
	
	transportModeId = 0;
	
	if(countRoad == wayBillIds.length) {
		transportModeId = TRANSPORTATION_MODE_ROAD_ID;
		return TRANSPORTATION_MODE_ROAD_NAME + '_' + transportModeId;
	} else if(countAir == wayBillIds.length) {
		transportModeId = TRANSPORTATION_MODE_AIR_ID;
		return TRANSPORTATION_MODE_AIR_NAME + '_' + transportModeId;
	} else if(countRoadExpress == wayBillIds.length) {
		transportModeId = TRANSPORTATION_MODE_ROAD_EXPRESS_ID;
		return TRANSPORTATION_MODE_ROAD_EXPRESS_NAME + '_' + transportModeId;
	} else if(countRoadQuicker == wayBillIds.length) {
		transportModeId =  TRANSPORTATION_MODE_ROAD_QUICKER_ID;
		return TRANSPORTATION_MODE_ROAD_QUICKER_NAME + '_' + transportModeId;
	} else if(countRail == wayBillIds.length) {
		transportModeId = TRANSPORTATION_MODE_RAIL_ID;
		return TRANSPORTATION_MODE_RAIL_NAME+ '_' + transportModeId;
	} else if(countRail <= 0 && countAir <= 0) {
		transportModeId	= TRANSPORTATION_MODE_ROAD_MIXED_ID;
		return TRANSPORTATION_MODE_ROAD_MIXED_NAME + '_' + transportModeId;
	} else
		transportModeId	= TRANSPORTATION_MODE_MIXED_ID;
	
	return "Mix" + "_" + transportModeId;
}

function restrictCreateBill(wayBillIds) {
	let transportModeIds = [];
	
	for (let wayBillId of wayBillIds) {
		let transportModeId = $("#transportMode_" + wayBillId).val();
		
		if((isValueExistInArray(transportModeIds, TRANSPORTATION_MODE_AIR_ID) && transportModeId != TRANSPORTATION_MODE_AIR_ID) || transportModeIds.length > 0 && (!isValueExistInArray(transportModeIds, TRANSPORTATION_MODE_AIR_ID) && transportModeId == TRANSPORTATION_MODE_AIR_ID)) 
			 return true;
		
		transportModeIds.push(transportModeId);
	}
	
	return false;
}

function createInvoiceBill() {
	checkedManualInvoiceSave = null;
	let destinationBranchId		= new Array();
	let wayBillNumberArr		= new Array();
	let wayBillIdWiseObj		= new Object();
	let countSequence			= 0;
	let wayBillDelNumberArr		= new Array();

	
	let wayBillIdArray	= getAllCheckBoxSelectValue('wayBillIdsForBill');
	
	let additionalDiscount			= $('#additionalDiscount').val();
	let totalBookingAmount			= 0;
	let	invoiceAdditionalCharge		= $('#additionalCharge').val();

	if(wayBillIdArray.length == 0) {
		showMessage('error', wayBillSelectErrMsg);
		toogleElement('error', 'block');
		return false;
	}
	
	for (let wayBillId of wayBillIdArray) {
		destinationBranchId.push($('#wayBillDestination_' + wayBillId).val());
	
	
		if(configuration.isAllowToEnterSequenceForPrintLRInOrder && Number($('#sequenceWise_' + wayBillId).val()) > 0)
			countSequence++;
		
		totalBookingAmount += parseInt($("#amount_" + wayBillId).html());
	
		let	lrWiseData	= new Object();	
				
		lrWiseData["waybillId"]					= wayBillId;
		lrWiseData["billRemark"]				= $('#billRemark_' + wayBillId).val();
		lrWiseData["wayBillSequance"]			= $('#sequenceWise_' + wayBillId).val();
		wayBillIdWiseObj['waybillId_' + wayBillId]	= lrWiseData;
		
		if(configuration.isPartyRateMismatchCheckingAllowed && $("#amount_" + wayBillId).html() != $("#lrRate_" + wayBillId).val())
			wayBillNumberArr.push($("#wayBillNumber_" + wayBillId).val());	
		
		if(configuration.createBillOnlyInDeliveredLR && $('#wayBillStatus_' + wayBillId).val() != WAYBILL_STATUS_DELIVERED)
			wayBillDelNumberArr.push($("#wayBillNumber_" + wayBillId).val());		
		
	}
	
	if(invoiceAdditionalCharge != undefined )
		totalBookingAmount += parseInt(invoiceAdditionalCharge);
	
	if(configuration.isAllowToEnterSequenceForPrintLRInOrder && countSequence > 0 && countSequence < wayBillIdArray.length) {
		showMessage("info", "Please Enter Sequance for All Selected LR !");
		return false;
	}
	
	if(additionalDiscount != undefined && additionalDiscount > 0 && totalBookingAmount > 0 && totalBookingAmount <= additionalDiscount) {
		showMessage("error", "Please Enter Additional Discount Amount Less Than Booking Amount !");
		return false;
	}
	
	if(configuration.allowSingleDestinationWiseBillCreation) {
		let isUniqueDestBranchId	= true;
		
		for(let i = 0; i < destinationBranchId.length - 1; i++) {
			if(destinationBranchId[i] != destinationBranchId[i + 1]) {
				isUniqueDestBranchId = false;
				break;
			}
		}
		
		if(!isUniqueDestBranchId) {
			showMessage("info", "Please select the LRs of same destination only.");
			return false;
		}
	}
	
	if(configuration.showPartyNameFeildForPrint) {
		if($("#selectedCorporateAccountId").val() <= 0){
			showMessage('error', 'Please Enter correct party name !');
			changeTextFieldColor('creditor', '', '', 'red');
			return false;
		}
		
		changeTextFieldColor('creditor', '', '', 'green');
	}
	if (wayBillDelNumberArr.length > 0) {
		showMessage('error', 'You Cannot Create Bill As LR No : ' + wayBillDelNumberArr.join(", ") + ' is Not Delivered !');
		return false;
	}
	
	if(wayBillNumberArr.length > 0) {
		let result = confirm("Rate Difference Found For LRs " + wayBillNumberArr.join(", ") + " Do you want to continue ?");
			
		if(!result) {
			doneTheStuff = false;
			return false;
		}
	}
	
	toogleElement('error','none');
	
	let answer = confirm (createBillAlertMsg);
	
	if (answer) {
		showLayer();
			
		let jsonObject						= new Object();
			
		jsonObject["wayBills"]					= wayBillIdArray.join(',');
		jsonObject["corporateAccountId"]		= $("#CreditorId").val();
		jsonObject["applyTax"]					= $('#applyTax').is(':checked');
		jsonObject["manualInvoiceDate"]			= $('#manualInvoiceDate').val();
		jsonObject["remark"]					= $('#remark').val();
		jsonObject["selectedCorporateAccountId"]= $('#selectedCorporateAccountId').val();
		jsonObject["collectionPersonId"]		= $('#selectedCollectionPersonId').val();
		jsonObject["additionalCharge"]			= $('#additionalCharge').val();
		jsonObject["transportationModeId"]		= $('#transportMode').val();
		jsonObject["wayBillIdWiseData"]			= JSON.stringify(wayBillIdWiseObj);
		jsonObject["fromDate"]					= $('#fromDate').val();
		jsonObject["toDate"]					= $('#toDate').val();
		jsonObject["taxId"]						= $('#taxId').val();
		jsonObject["applyTaxTypeId"]			= $('#applyTaxTypeId').val();
		jsonObject["poNumber"]					= $('#poNumber').val();
		jsonObject["msmiNumber"]				= $('#msmiNumber').val();
		jsonObject["sacCode"]					= $('#sacCode').val();
		jsonObject["vCode"]						= $('#vCode').val();
		jsonObject["poDate"]					= $('#poDate').val();
		jsonObject["additionalDiscount"]		= $('#additionalDiscount').val();
		jsonObject["totalMatadiCharges"]		= $('#totalMatadiChargesAmount').val();
		jsonObject["isSearchByDate"]			= $('#searchByDate').is(":checked");
		jsonObject["isBillOfSupply"]			= $('#billOfSupply').is(":checked");
		jsonObject["manualInvoiceNo"]			= $("#manualInvoiceNo").val();
		jsonObject["hsnCode"]					= $('#hsnCode').val();
		jsonObject["billBranchId"]				= $('#branch').val();
		jsonObject["billSelectionId"]			= $("#billSelection").val();
		jsonObject["divisionId"]				= $("#divisionSelection").val();
													
		if(!doneTheStuff) {
			doneTheStuff = true;
			$.ajax({
				type		:	"POST",
				url			:	WEB_SERVICE_URL + '/creditorInvoiceWS/createBill.do',
				data		:	jsonObject,
				dataType	:	'json',
				success		:	function(data) {
					if (!data) {
						showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
					} else {
						let errorMessage = data.message;
					
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
						if(errorMessage.messageId == 461) {
							$("#manualInvoiceNo").val('');
							$("#manualInvoiceNo").focus();
						}
						
						if(errorMessage.typeName != 'success') {
							doneTheStuff = false;
							hideLayer();
							return;
						}
						
						let billId					= data.billId;
						let billNumber				= data.billNumber;
						let isWSInvoicePrintNeeded	= data.isWSInvoicePrintNeeded;
						let isPrintBillGroup		= data.isPrintBillGroup;
						let billPdfEmailAllowed		= data.billPdfEmailAllowed;
						let billcreationEmailPopup	= data.billCreationTimeEmailPopupAllow;
						
						if(billId > 0) {
							printBill(billId, isPrintBillGroup, isWSInvoicePrintNeeded, billPdfEmailAllowed, billcreationEmailPopup);
					
							location.replace("/ivcargo/CreateBill.do?pageId=215&eventId=1&successMsg="+billId+"&billNumber="+billNumber+"&isWSInvoicePrintNeeded="+isWSInvoicePrintNeeded+"&billPdfEmailAllowed="+billPdfEmailAllowed+"&isPrintBillGroup="+isPrintBillGroup+'&isSearchBillPDFEmail='+billcreationEmailPopup);
							
							setTimeout(function(){ 
								location.reload(); 
							}, 1000);
						
							setTimeout(function() { 
								//window.open("BillAfterCreation.do?pageId=215&eventId=4&successMsg="+billId+"&billNumber="+billNumber+"&isWSInvoicePrintNeeded="+isWSInvoicePrintNeeded+"&billPdfEmailAllowed="+billPdfEmailAllowed);
							}, 1000);
						}
					}
				}
			});
		}
	} else {	
		doneTheStuff = false;
		return false;
	}
}

function printBill(billBillId, isPrintBillGroup, isWSInvoicePrintNeeded, urlBillPdfEmailAllowed, billcreationEmailPopup) {
	if(isWSInvoicePrintNeeded)
		window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billBillId + '&billPdfEmailAllowed='+ urlBillPdfEmailAllowed+'&isSearchBillPDFEmail='+billcreationEmailPopup, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else if(isPrintBillGroup || (typeof urlIsPrintBillGroup !== 'undefined' && urlIsPrintBillGroup)) {
		if(configuration.showFullscreenWindowForInvoicePrint)
			window.open('BillPrint.do?pageId=215&eventId=5&billId=' + billBillId + '&billPdfEmailAllowed=' + urlBillPdfEmailAllowed + '&isSearchBillPDFEmail=' + billcreationEmailPopup, 'newwindow', 'fullscreen=yes, resizable=no');	
		else
			window.open('BillPrint.do?pageId=215&eventId=5&billId=' + billBillId + '&billPdfEmailAllowed='+ urlBillPdfEmailAllowed+'&isSearchBillPDFEmail='+billcreationEmailPopup, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else
		window.open('BillPrint.do?pageId=215&eventId=6&billId=' + billBillId + '&billPdfEmailAllowed='+ urlBillPdfEmailAllowed+'&isSearchBillPDFEmail='+billcreationEmailPopup, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function reDirectPODHoldModule() {
	childwin = window.open ('PodWayBillsDetails.do?pageId=340&eventId=2&modulename=podHold&masterid='+$("#wayBillIds").val(),'newwindow', config='height=600,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showPercentage(isChecked){
	let percentage = document.getElementById('percentage');
	let adtnlChg = document.getElementById('additionalCharge');
	if(percentage) {
		if(isChecked){
			percentage.style.display = 'inline';
		}else{
			percentage.value = 0;
			percentage.style.display = 'none';
		};
	}
	if(adtnlChg) adtnlChg.readOnly = isChecked;
}

function showPercentageForAdditionalDiscount(isChecked) {
	let percentage = document.getElementById('percentagee');
	let adtnlDiscount = document.getElementById('additionalDiscount');
	
	if(percentage) {
		if(isChecked) {
			percentage.style.display = 'inline';
		} else {
			percentage.value = 0;
			percentage.style.display = 'none';
		}
	}
	
	if(adtnlDiscount) adtnlDiscount.readOnly = isChecked;
}

function updateAdditionalCharge() {
	let wayBillIdArray	= getAllCheckBoxSelectValue('wayBillIdsForBill');
	
	let percentage		= parseInt($('#percentage').val(), 10);
	let adtnlChg		= document.getElementById('additionalCharge');
	let isPercentage	= document.getElementById('isPercentage');
	let totalAmount		= 0;
	
	for (let wayBillId of wayBillIdArray) {
		if(configuration.allowRateInDecimal) 
			totalAmount += parseFloat($('#amount_' + wayBillId).html());
		else
			totalAmount += parseInt($('#amount_' + wayBillId).html());
	}
	
	if(adtnlChg) {
		if(parseInt(percentage,10) > 0 && isPercentage.checked)
			adtnlChg.value = Math.round((totalAmount * parseFloat(percentage)) / 100);
		else if(isPercentage && isPercentage.checked)
			adtnlChg.value = 0;
	}
	
	updateAdditionalDiscount();
}

function updateAdditionalDiscount() {
	let wayBillIdArray = getAllCheckBoxSelectValue('wayBillIdsForBill');

	let percentage		= parseInt($('#percentagee').val(), 10);
	let adtnlDiscount	= document.getElementById('additionalDiscount');
	let isPercentage	= document.getElementById('isPercentagee');
	let adtnlChg		= parseInt($('#additionalCharge').val()) || 0; 
	let totalAmount		= 0;

	for (let wayBillId of wayBillIdArray) {
		let amount = $('#amount_' + wayBillId).html();
		totalAmount += configuration.allowRateInDecimal ? parseFloat(amount) : parseInt(amount);
	}
	
	if (adtnlDiscount && isPercentage && isPercentage.checked) {
		let baseAmount = configuration.calculateAdditionalDiscountAmountOnAdditionalCharge ? totalAmount + adtnlChg : totalAmount;
		
		adtnlDiscount.value = percentage > 0 ? Math.round((baseAmount * percentage) / 100) : 0;
	}
}

function resetPartyData() {
	$('#selectedCorporateAccountId').val(0);
}

function checkRateDifference(element) {
	
	if(element.checked){
		let elementData = element.value;
		let wayBillId = elementData.split("_")[0];
		
		let jsonObject						= new Object();
		
		jsonObject["waybillId"]				= wayBillId;
		jsonObject["corporateAccountId"]	= $("#CreditorId").val();
		jsonObject["checkRateDifference"]	= true;

		$.ajax({
			type		:	"POST",
			url			:	WEB_SERVICE_URL + '/deliveryWayBillWS/getTotalBookingRateByParty.do',
			data		:	jsonObject,
			dataType	:	'json',
			success		:	function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				} else {
					$("#lrRate_"+wayBillId).val(data.totalBookingPartyRate);
					if(data.totalBookingPartyRate != Number($("#amount_"+wayBillId).html())){
						$("#row_"+wayBillId+" td").removeClass("datatd").addClass("colorshade");
					}
				}
			}
		});
	}
}

function checkDateToUploadOrReceivePOD(podStartDate, creationDateTime) {
	if(podStartDate == undefined)
		return false;
	
	let bkgDate			= new Date(parseInt(creationDateTime));
	let podDate			= new Date(curSystemDate);
	
	let podStartDateParts = podStartDate.split("-");
	podDate.setFullYear(parseInt(podStartDateParts[2], 10));
	podDate.setMonth(parseInt(podStartDateParts[1] - 1, 10));
	podDate.setDate(parseInt(podStartDateParts[0], 10));
	
	return bkgDate.getTime() > podDate.getTime();
}

function chkDate(lsDate, creationDateTime, wayBillNumber, lrDate, pastDaysAllowed) {
	let bkgDate = new Date(parseInt(creationDateTime));
	
	if(isValidDate(lsDate)) {
		let currentDate	 = new Date(curDate);
		let previousDate = new Date(curDate);
		let manualInvoiceDate = new Date(curDate);

		if(pastDaysAllowed < '0'){
			showMessage('error',"Please Configure Manual Invoice Days Allowed For Branch !!");
			toogleElement('error','block');
			changeError1('manualInvoiceDate','0','0');
			return false;
		}
		
		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);
		let manualLSDateParts = lsDate.split("-");
		manualInvoiceDate.setFullYear(parseInt(manualLSDateParts[2],10));
		manualInvoiceDate.setMonth(parseInt(manualLSDateParts[1]-1,10));
		manualInvoiceDate.setDate(parseInt(manualLSDateParts[0],10));

		if(bkgDate != null) {
			bkgDate.setHours(0, 0, 0, 0);
			
			if(manualInvoiceDate.getTime() > currentDate.getTime()) {
				showMessage('info',futureDateNotAllowdErrMsg);
				toogleElement('error','block');
				changeError1('manualInvoiceDate','0','0');
				return false;
			} else if(manualInvoiceDate.getTime() < bkgDate.getTime()) {
				showMessage('info',"You Cannot Enter Bill Date Before LR Date " + lrDate);
				toogleElement('error','block');
				changeError1('manualInvoiceDate','0','0');
				return false;
			} else if(manualInvoiceDate.getTime() > previousDate.getTime()) {
				toogleElement('error','none');
				removeError('manualInvoiceDate');
				return true;
			} else {
				showMessage('info',"Please enter date till "+pastDaysAllowed+" days back from today !!");
				toogleElement('error','block');
				changeError1('manualInvoiceDate','0','0');
				return false;
			}
		} else if(manualInvoiceDate.getTime() > currentDate.getTime()) {
			showMessage('error','Future Date not allowed !!');
			toogleElement('error','block');
			changeError1('manualInvoiceDate','0','0');
			return false;
		} else if(manualInvoiceDate.getTime() > previousDate.getTime()) {
			toogleElement('error','none');
			removeError('manualInvoiceDate');
			return true;
		} else {
			showMessage('info',"Please enter date till "+pastDaysAllowed+" days back from today !!");
			toogleElement('basicError','block');
			changeError1('manualInvoiceDate','0','0');
			return false;
		}
	} else {
		showMessage('error',validDateErrMsg);
		toogleElement('error','block');
		changeError1('manualInvoiceDate','0','0');
		return false;
	}
}

function showHidePodStatus(){
	let elObj = document.getElementById('searchByPodStatus');

	if(document.getElementById('podStatusTD') != null) {
		if(elObj != null && elObj.checked){
			document.getElementById('podStatusTD').style.display = 'inline';
		}else{
			document.getElementById('podStatusTD').style.display = 'none';
		}
	}
}

function showHideAmount(){
	let elObj = document.getElementById('searchByAmount');
	
	if(document.getElementById('amountTD') != null) {
		if(elObj != null && elObj.checked){
			document.getElementById('amountTD').style.display = 'inline';
		}else{
			document.getElementById('amountTD').style.display = 'none';
		}
	}
}

function populateSubRegionSelectionByRegionId(obj){
	
	let jsonObject			= new Object();
	jsonObject["regionSelectEle_primary_key"]	= obj.value;
	jsonObject["AllOptionsForSubRegion"]		= !configuration.hideAllOptionInAreaSelection;
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let subRegion	= data.subRegion;
			if(typeof subRegion == 'undefined' || subRegion.length == 0) {
				showMessage('info', 'Sub Region Not Found');
			}
			
			operationOnSelectTag('subRegion', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('subRegion', 'addNew', '-- Select	Sub Region --', 0); //function calling from genericfunction.js
			
			if(subRegion != null && typeof subRegion != 'undefined') {
				for(const element of subRegion) {
					operationOnSelectTag('subRegion', 'addNew', element.subRegionName, element.subRegionId);
				} 
			}
			hideLayer();
		}
	});
}  

function populateBranchSelectionBySubRegionId(obj){
	
	let jsonObject			= new Object();
	jsonObject["subRegionSelectEle_primary_key"]	= obj.value;
	jsonObject["AllOptionsForBranch"]				= !configuration.hideAllOptionInAreaSelection;
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getPhysicalBranchOption.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			
			let branch	= data.sourceBranch;
			if(typeof branch == 'undefined' || branch.length == 0) {
				showMessage('info', 'Branch Not Found');
			}
			operationOnSelectTag('branch', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('branch', 'addNew', '-- Select	 Branch --', 0); //function calling from genericfunction.js
			
			if(branch != null && typeof branch != 'undefined') {
				for(const element of branch) {
					operationOnSelectTag('branch', 'addNew', element.branchName, element.branchId);
				} 
			}
			hideLayer();
		}
	});
}

function findData() {
	if(configuration.isPodRequiredForGroup && configuration.podStatusSelection) {
		let searchByPodStatus	= document.getElementById('searchByPodStatus');
		let podStatus			= document.getElementById('podStatus').value;
		
		if(searchByPodStatus.checked && podStatus == 0) {
			showMessage('error','Please Select POD Status');
			changeTextFieldColor('podStatus', '', '', 'red');
			return false;
		}
	}
	
	if (configuration.showSearchByAmountOption) {
		let searchByAmount	= document.getElementById('searchByAmount');
		let enteredAmount	= document.getElementById('enteredAmount').value;
		let amountFilter	= document.getElementById('amountFilter').value;
	
		if(searchByAmount.checked && enteredAmount == 0 && amountFilter == 0) {
			showMessage('error','Please Select Amount');
			changeTextFieldColor('enteredAmount', '', '', 'red');
			changeTextFieldColor('amountFilter', '', '', 'red');
			return false;
		}
		
	   if(amountFilter == 1 && enteredAmount <= 0) {
			showMessage('error','Please Enter Valid Amount');
			return false;
		} else if(amountFilter == 0 && enteredAmount > 0){
			showMessage('error','Please Select Valid Option');	
			changeTextFieldColor('amountFilter', '', '', 'red');
			return false;
		} 
	}
	
	if(configuration.isTransportationModeDropDownAllow) {
		let transportMode = $('#transportModeId option:selected').val();
		
		if(transportMode < 0) {
			showMessage('error','Please Select TransportMode');
			return false;	
		}
	}
	
	if(configuration.isDivisionWiseBillCreationAllow) {
		let divisioId = $('#divisionSelection option:selected').val();
		
		if(divisioId <= 0) {
			showMessage('error','Please Select Division Type');
			return false;	
		}
	}
	
	if(configuration.isTaxTypeDropDownAllow) {
		let taxTypeId = $('#taxTypeId option:selected').val();
		
		if(taxTypeId < 0) {
			showMessage('error','Please Select Tax Type');
			return false;	
		}
	}
	
	if (configuration.showLrStatusWiseBillSearchDropdown) {
		let moduleFilter	= document.getElementById('moduleFilter').value;
	
		if(moduleFilter == 0) {
			showMessage('error','Please Select Module');
			changeTextFieldColor('moduleFilter', '', '', 'red');
			return false;
		}
	}
	
	if(configuration.isRegionWiseSelectionAllow && !validateBranchSelection())
		return;
	
	if(reportFormValidations()) {
		disableFindButtons('Find');
		showLayer();
		document.createBillSerachCriteriaForm.pageId.value		= '215';
		document.createBillSerachCriteriaForm.eventId.value		= '2' ;
		document.createBillSerachCriteriaForm.action			= "GetDataForBill.do";
		disableButtons();
		showLayer();
		document.createBillSerachCriteriaForm.submit();
	}
}

function validateBranchSelection() {
	let regionId = $('#region option:selected').val();
		
		if(regionId == 0){
			showMessage('error','Please Select Region');
			changeTextFieldColor('region', '', '', 'red');
			return false;	
		}
		 
		let subRegionId = $('#subRegion option:selected').val();
		
		if(subRegionId == 0) {
			showMessage('error','Please Select Sub Region');
			changeTextFieldColor('subRegion', '', '', 'red');
			return false;	
		}
	
		let branchId = $('#branch option:selected').val();
		
		if(branchId == 0) {
			showMessage('error','Please Select Branch');
			changeTextFieldColor('branch', '', '', 'red');
			return false;	
		}
		
	return true;
}

function resetAll() {
	$('#subRegion').val(0);
	$('#branch').val(0);
	$('#CreditorId').val(0); 
} 

function disableFindButtons(obj) {
	let saveButton = document.getElementById(obj);
	
	if(saveButton != null) {
		saveButton.style.display ='none'; 
		saveButton.className = 'btn_print_disabled';
		saveButton.disabled=true;
	}
}

function openWindowForView(id, type, branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId);
}

function populateCreditorDropDownByBranchId(obj){
	
	let jsonObject			= new Object();
	
	jsonObject["regionId"]		= $('#region').val();
	jsonObject["subRegionId"]	= $('#subRegion').val();
	jsonObject["branchId"]		= obj.value;
	
	if(jsonObject["branchId"] == 0)
		return false;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/creditorInvoiceWS/getCreditorDetailsForCreatingBill.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			let creditorDetailsList	= data.creditorDetailsList;
			
			if(typeof creditorDetailsList == 'undefined' || creditorDetailsList.length == 0)
				showMessage('info', 'Party Not Found');
			
			operationOnSelectTag('CreditorId', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('CreditorId', 'addNew', '---- Select Creditor----', 0); //function calling from genericfunction.js 
			
			if(creditorDetailsList != null && typeof creditorDetailsList != 'undefined') {
				for(const element of creditorDetailsList) {
					operationOnSelectTag('CreditorId', 'addNew', element.creditWayBillPaymentModuleCreditorDisplayName, element.creditWayBillPaymentModuleCreditorId);
				} 
			}
			hideLayer();
		}
	});
}

function createBill() {
	if(!validateCollectionPerson())
		return false;

	let manualInvoiceDate		= document.getElementById("manualInvoiceDate");
	
	if(manualInvoiceDate != null || showMatadiChargesColumn) {
		if(manualInvoiceDate != null && (manualInvoiceDate.value.length <= 0 || manualInvoiceDate.value == 'Invoice Date')) {
			showMessage('error',invoiceDateErrMsg);
			toogleElement('error','block');
			let elPos = getPosition('manualInvoiceDate');
			changeError1('manualInvoiceDate',elPos.x,elPos.y);
			$("#manualInvoiceDate").focus(); 
			return false;
		} else {
			let taxTypeId			= 0;
			let fcmCount			= 0;
			let rcmCount			= 0;
			let exemptedCount		= 0;
			let nonTaxTypeCount		= 0;
			let showPodPopUp		= false;
			let wayBillNumberArr	= [];
				
			let podStartDate		= configuration.PODStartDate;
				
			let wbNumber = [];
			
			let wayBillIdArray	= getAllCheckBoxSelectValue('wayBillIdsForBill');
				
			for(let wayBillId of wayBillIdArray) {
				let bkgDate			= $('#wayBillWiseBkgTime_' + wayBillId).val();
				let lrDate			= $('#wayBillWiseBkgDate_' + wayBillId).val();
				let lrDateTime		= $('#wayBillWiseBkgDateTime_' + wayBillId).val();
				let wayBillNumber	= $('#wayBillNumber_' + wayBillId).val();
				let podRequiredStatus		= $('#isLrForPod_'+ wayBillId).val();
					
				if(configuration.isTaxTypeDropDownAllow)
					taxTypeId		= $('#taxTypeId_' + wayBillId).val();
						
				if(isPodRequired && configuration.validatePodUploadedToCreateInvoice && configuration.uploadPOD) {
					  if(podRequiredStatus === '1') {
						let podUploaded			= $('#podUploaded_' + wayBillId).val();

					if(configuration.showOnlyAlertMessageForPODUploadedOrNot) {
						if(podUploaded == POD_STATUS_UPLOADED_NO) {
							showPodPopUp = true;
							wayBillNumberArr.push(wayBillNumber);
						}
					} else if($('#podUploaded_' + wayBillId).val() == POD_STATUS_UPLOADED_NO) {
						showMessage('info', podUploadedToCreateInvoiveInfoMsg(wayBillNumber)); //defined in VariableForErrorMsg.js
						return false;
					}
				}
				
				}

				if(configuration.showMatadiChargesColumn && matadiChargesApplicable && $('#wayBillStatus_' + wayBillId).val() != WAYBILL_STATUS_DELIVERED) {
					showMessage('error', 'You Cannot Create Bill As LR No : ' + wayBillNumber + ' is Not Delivered !');
					return false;
				}
						
				if(podRequiredForInvoiceCreation && isPodRequired) { 
					if(configuration.uploadPOD) {
						let podUploaded			= $('#podUploaded_' + wayBillId).val();
							
						if(checkDateToUploadOrReceivePOD(podStartDate, bkgDate) && podUploaded == POD_STATUS_UPLOADED_NO) {
							showMessage('info', podUploadedToCreateInvoiveInfoMsg(wayBillNumber)); //defined in VariableForErrorMsg.js
							return false;
						}
					}
							
					if(configuration.receivePOD) {
						let podReceived			= $('#podReceived_' + wayBillId).val();
							
						if(checkDateToUploadOrReceivePOD(podStartDate, bkgDate) && podReceived == POD_STATUS_RECEIVED_NO) {
							showMessage('info', podReceivedToCreateInvoiveInfoMsg(wayBillNumber)); //defined in VariableForErrorMsg.js
							return false;
						}
					}
				}
						
				if(taxTypeId == FCM)
					fcmCount++;
				else if(taxTypeId == RCM)
					rcmCount++;
				else if(taxTypeId == EXEMPTED)
					exemptedCount++;
				else
					nonTaxTypeCount++;
				
				if(!chkDate(manualInvoiceDate.value, lrDateTime, wayBillNumber, lrDate, manualInvoiceDaysAllowed))
					return false;
					
				if(configuration.isLrWiseBillRemarkInputNeeded && configuration.lrWiseBillRemarkValidationAllowed) {
					let lrBillRemark = $('#billRemark_' + wayBillId).val();
						
					if(lrBillRemark == '') {
						showMessage('info', 'Please Enter Bill Remark for selected Bills'); //defined in VariableForErrorMsg.js
						return false;
					}
				}
						
				if(configuration.isVlidateViewedLRExpense && isLrExpenseExists && $('#flagFor_' + wayBillId).exists()) {
					let	 wbno =	 $('#flagFor_' + wayBillId).val();
								
					if(wbno == false || wbno == 'false')
						wbNumber.push(wayBillNumber);
				}	
			}
				
			if(wbNumber.length > 0) {
				showMessage('error', 'Please open & view expense of LR Nos ' + wbNumber.join(", ") + ' before creating bill');
				changeTextFieldColor('generateBillDownButton', '', '', 'red');
				return false;
			}
				
			if(configuration.isTaxTypeDropDownAllow) {
				if((fcmCount > 0 && rcmCount > 0 && exemptedCount > 0 && nonTaxTypeCount > 0) || 
					(rcmCount > 0 && (exemptedCount > 0 || nonTaxTypeCount > 0)) ||
					((fcmCount > 0 || exemptedCount > 0) && nonTaxTypeCount > 0) ||
					((fcmCount > 0 || rcmCount > 0) && nonTaxTypeCount > 0) ||
					(fcmCount > 0 && (rcmCount > 0 || exemptedCount > 0))) {
					showMessage("error", "Please Select Same Tax Type LRs !");
					return false ;
				}
				
				if($('#applyTax').is(':checked') && exemptedCount > 0) {
					showMessage("info", "You cannot apply tax on Tax Type Exempted!");
					$('#applyTax').prop("checked", false);
					return false;
				}
			}
		
			if (configuration.restrictBillOnAirTransportationMode) {
				let checkTransport = restrictCreateBill(wayBillIdArray);
				
				if (checkTransport) {
					showMessage("error", "You cannot create the AIR transportation invoice with other transportation Mode !");
					return false;
				}
			}
			
			if(configuration.isTransportationModeDropDownAllow) {
				let transportModeString			= getTransportationModeBill(wayBillIdArray);
				let transportModeStringpart		= transportModeString.split("_");
				let result	= null;
				
				if(transportModeStringpart[0] == "Mix") {
					if (configuration.doNotAllowCreateMixTransportationModeLr) {
						showMessage("error", "You cannot create the invoice of Mix transportation Mode !");
						return false;
					}

					if(configuration.applyTaxOnBill && $('#applyTax').is(':checked')) {
						showMessage("info", "You cannot apply tax on Mix transportation Mode !");
						$('#applyTax').prop("checked", false);
						return false;
					}
						
					result = confirm("You are creating the invoice of MIXED TRANSPORTATION mode. Are you sure you want to create ?");
				} else
					result = confirm("Transportation Mode is : " + transportModeStringpart[0]);
				
				if(result)
					$('#transportMode').val(transportModeStringpart[1]);
				else {
					if(configuration.isTaxTypeDropDownAllow && fcmCount > 0)
						$('#applyTax').prop("checked", false);
				
					$('#generateBillDownButton').removeClass('hide');
					$('#generateBillUpButton').removeClass('hide');
					doneTheStuff = false;
					return false;
				}
			} else
				$('#transportMode').val(TRANSPORTATION_MODE_ROAD_ID);
				
			if(configuration.showSgstOrCgstAndIgstDropDown && $('#applyTax').is(':checked') && $("#taxId").val() == 0) {
				showMessage('error', 'Please Select Tax !');
				changeTextFieldColor('taxId', '', '', 'red');
				return false;
			}
				
			if(configuration.applyTaxOnTaxTypeId && $('#applyTax').is(':checked') && $("#applyTaxTypeId").val() == 0) {
				showMessage('error', 'Please Select Tax Type !');
				changeTextFieldColor('applyTaxTypeId', '', '', 'red');
				return false;
			}
				
			if(configuration.doNotCreateBillWithoutPartyGstNumber) {
				if((PartyGSTNumberstr != null && PartyGSTNumberstr != "") && PartyGSTNumberstr != 'null')
					createInvoiceBill();
				else
					showMessage("error", "Billing Party Should Have Valid GSTN To Create Bill !");
			} else if(showPodPopUp)
				openPrintTypePopup(wayBillNumberArr);
			else
				createInvoiceBill();
		}
	} else
		createInvoiceBill();
}

function selectAllWayBillToCreateBill(param) {
	let tab		= document.getElementById("reportTable");
	let count	= parseFloat(tab.rows.length - 1);
	let row;

	if(param) {
		for (row = count - 1; row > 0; row--) {
			if(tab.rows[row].cells[0] != undefined && tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && !tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
					
				if(configuration.isPartyRateMismatchCheckingAllowed)
					checkRateDifference(tab.rows[row].cells[0].getElementsByTagName("input")[0]);
			}
		}
	} else {
		for (row = count - 1; row > 0; row--) {
			if(tab.rows[row].cells[0] != undefined && tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && tab.rows[row].cells[0].getElementsByTagName("input")[0].checked)
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;
		}
	}

	calculateDataForSumm();
}

function addRateUpdateRequest() {
	if(configuration.isRegionWiseSelectionAllow && !validateBranchSelection() || !reportFormValidations())
		return;
		
	 let jsonObject	= {};
	 
	 jsonObject.corporateAccountId	= $('#CreditorId').val();
	 jsonObject.regionId			= $('#region').val();
	 jsonObject.subRegionId			= $('#subRegion').val();
	 jsonObject.sourceBranchId		= $('#branch').val();
	 
	 if($('#searchByDate').is(":checked")) {
		jsonObject.fromDate			= $('#fromDate').val();
		jsonObject.toDate			= $('#toDate').val();
	 }
	 
	 showLayer();
	 
	 $.ajax({
			type		:	"POST",
			url			:	WEB_SERVICE_URL + '/editLRRateWS/addRateUpdateRequest.do',
			data		:	jsonObject,
			dataType	:	'json',
			success		:	function(data) {
				hideLayer();
				
				if (!data) {
					showMessage('error', iconForErrMsg + ' ' + "No Rates Found !"); // show message to show system processing error massage on top of the window.
				} else {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					$('#rateUpdateRequestMessage').html(errorMessage.description);
					$('#rateUpdateRequestMessage').removeClass('hide');
				}
			}
	 });
}

function billOfSupplySelection(){
	 if($('#billOfSupply').is(":checked"))
		$(".taxInvoiceHide").addClass('hide');
	else
		$(".taxInvoiceHide").removeClass('hide');
}

function sumAmount() {
	const tableTrCell 	= $('#totalRow td');
	var tfootLength 	= tableTrCell.length;
	
	for(var i = 1; i < tfootLength; i++) {
		const [isColumnTotal, total] = calculateColumnTotal(i);
		
		if(isColumnTotal)
			tableTrCell[i].textContent = total; 
	}
}

function calculateColumnTotal(index) {
	var tableEle		= document.getElementById('reportTable');
	var total			= 0;
	let isColumnTotal	= true;

	for(var i = 1; i < tableEle.rows.length - 2; i++) {
		let cells	= tableEle.rows[i].cells[index];
		
		if(cells == null || cells == undefined || cells == 'undefined' || cells.className.includes('invoiceNo')
		|| cells.innerHTML.includes('-') || cells.hidden) {
			isColumnTotal	= false;
			total			= 0;
			break;
		}

		total += parseInt(cells.innerHTML);
		
		if(isNaN(total)) total = '';
	}
	
	return [isColumnTotal, total];
}