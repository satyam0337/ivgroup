/**
 * 
 */
var doneTheStuff 	= false;

function loadDataForLs() {

	var jsonObject		= new Object();
	jsonObject.filter	= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("LHPVAjaxAction.do?pageId=228&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForInfoMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.

				} else{
					jsondata					= data;

					if(data.errorCode) {
						showMessage('info', data.errorDescription);
						return;
					}

					configuration				= data.lhpvConfiguration;
					executive					= data.executive;
					LHPVConstant				= data.LHPVConstant;
					VehicleNumberMasterConstant	= data.VehicleNumberMasterConstant;
					pastDaysAllowed				= data.ManualLHPVDaysAllowed;
					lhpvSequenceCounter			= data.lhpvSequenceCounter;
					isSeqCounterPresent			= data.isSeqCounterPresent;
					lhpvChargesHshmp			= data.lhpvChargesHshmp;
					lhpvLryHirChrgHshmp			= data.lhpvLryHirChrgHshmp;
					lhpvStatChrgHshmp			= data.lhpvStatChrgHshmp;
					lhpvAddChrgHshmp			= data.lhpvAddChrgHshmp;
					lhpvSubChrgHshmp			= data.lhpvSubChrgHshmp;
					ManualLHPVDaysAllowed		= data.ManualLHPVDaysAllowed;
					VehicleDetails				= data.VehicleDetails;
					isAllowBackDateInAutoLhpv	= data.isAllowBackDateInAutoLhpv;
					isAllowManualLhpv			= data.isAllowManualLhpv;
					TruckLoadType				= data.truckLoadType;
					tdsConfiguration			= data.tdsConfiguration;
					VehicleOwnerConstant		= data.VehicleOwnerConstant;
					sameSequenceForLsAndLhpv	= data.sameSequenceForLsAndLhpv;
					disableLhpvCharges			= data.disableLhpvCharges;
					lhpvChargeIdsToDisableList	= data.lhpvChargeIdsToDisableList;
					minDate						= data.minDate;
					maxDate						= data.maxDate;
					
					configuration.isAllowAlphnumericWithSpecialCharacters	= configuration.isAllowAlphnumericWithSpecialCharactersSeq;

					isLhpvLockingAfterLsCreation= getParameterByName('isLhpvLockingAfterLsCreation');
					loadConfiguration(); // load content as per configuration
					driverAutocomplete();
					vehicleNumberAutocomplete();
					
					if(configuration.isAutomaticSelectCreateLhpv)
						showHideCreateAndAppend();
					else
						$('#createAppendDiv').show();

					if(configuration.removeAppendLhpvOption)
						$("#selectType option[value='2']").remove();                                     
					         
					if(isAllowBackDateInAutoLhpv && !isAllowManualLhpv)
						goToBackDateSelection();

					if(isLhpvLockingAfterLsCreation == 'true'){
						showMessage('success','LS '+getParameterByName('lsNumber')+' created successfully ! Please Create Lhpv For It');
						setValueToTextField('lsNumber', getParameterByName('lsNumber'));
						getDetailsByLSNumber();
					}
				}
			});
}

function loadConfiguration() {
	if(!configuration.lorryHireEnable)
		$("#charge" + LORRY_HIRE).attr('readonly', 'readonly');

	if(!configuration.balanceAmountEnable)
		$("#charge" + BALANCE_AMOUNT).attr('readonly', 'readonly');

	if(!configuration.refunAmountEnable)
		$("#charge" + REFUND_AMOUNT).attr('readonly', 'readonly');

	if(!configuration.isRefundAmountShow)
		changeDisplayProperty('charge_' + REFUND_AMOUNT, 'none');

	if(configuration.EnterAdvanceAmount) {
		if(configuration.DisableAdvanceAmountInputField) {
			$("#charge" + ADVANCE_AMOUNT).attr('readonly', 'readonly');
			document.getElementById("charge" + ADVANCE_AMOUNT).style.color = "#787878";
		}
	} else
		$("#charge_" + ADVANCE_AMOUNT).attr('class', 'hide');

	if(!configuration.isDDDVShow)
		changeDisplayProperty('isdddv', 'none');

	if(!configuration.isRemoveButtonDisplay)
		changeDisplayProperty('isRemoveButton', 'none');

	if(configuration.isDisplayMaterialsInputField)
		changeDisplayProperty('materialsCol', 'table-row');

	if(configuration.driverNameAutocomplete)
		changeDisplayProperty('driverNameCol', 'table-row');

	if(configuration.DisplayLoadedWeightBridgeInputField)
		changeDisplayProperty('loadedWeightBridgeCol', 'table-row');

	if(configuration.showTotalAddition)
		changeDisplayProperty('totalAdditionCol', 'table-row');

	if(configuration.displayLoadedByInputField)
		changeDisplayProperty('loadedByCol', 'table-row');

	if(configuration.displayDestinationAreaField)
		changeDisplayProperty('destinationAreaCol', 'table-row');

	if(configuration.displayBalanacePayableCityField)
		changeDisplayProperty('balancePayableCityCol', 'table-row');
	
	if(configuration.LHPVOfDDM)
		changeDisplayProperty('ddmWithLHPVSelection', 'inline-block');
	
	if(!configuration.additionalAdvanceEnable)
		$("#charge" + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', 'readonly');
	
	if(!configuration.additionalExpenseEnable)
		$("#charge" + ADDITIONAL_EXPENSE).attr('readonly', 'readonly');
	
	if(configuration.isManualLhpvNumberFieldChecked) {
		$('#isManualLHPV').prop('checked', 'true');
		goToManualSelection();
	}
	
	if(configuration.disableLhpvCharges) {
		if(typeof lhpvChargeIdsToDisableList !== 'undefined' && lhpvChargeIdsToDisableList != null) {
			for (var i = 0; i < lhpvChargeIdsToDisableList.length; i++) {
				$("#charge" + lhpvChargeIdsToDisableList[i]).attr('readonly', 'readonly');
			}
		}
	}
}

function resetTable(){
	var table = $('#dispatchTable').DataTable({
		"bPaginate": false,
		"bFilter": false,
		"sDom": "frtiS",
		"bInfo": false,
		"scrollY":  "220px",
		"processing": true,
		"bJQueryUI" : true,
		"destroy" : true,
		"order": [[ 1, "asc" ]],
	});

	$( "span" ).removeClass( "DataTables_sort_icon css_right ui-icon ui-icon-carat-2-n-s" );

	return table; 
}

function showHideCreateAndAppend() {
	if(configuration.isAutomaticSelectCreateLhpv)
		$('#selectType').val(LHPVConstant.CREATE_ID);
	
	var selectType = $('#selectType').val(); 
	
	if(selectType == LHPVConstant.CREATE_ID) {
		setValueToTextField('lhpvNoForAppendId', '');
		setValueToTextField('ddmInterBranchLSNoForAppendId', '');

		if(configuration.createLhpvOnVehicleNumber)
			changeDisplayProperty('truckNoForCreate', 'inline-block');

		if(configuration.createLhpvOnLSNumber)
			changeDisplayProperty('lsNoForCreate', 'inline-block');

		changeDisplayProperty('lhpvNoForAppend','none');
		changeDisplayProperty('ddmInterBranchLSNoForAppend','none');
		changeDisplayProperty('appendButton', 'none');
	} else if(selectType == LHPVConstant.APPEND_ID) {
		countAddedLS		= 0;
		truckNumberId		= 0;
		vehcileNumberArr	= new Array();
		dispatchLedgerArr	= new Array();
		changeDisplayProperty('lhpvNoForAppend', 'inline-block');
		changeDisplayProperty('ddmInterBranchLSNoForAppend', 'inline-block');
		changeDisplayProperty('lsNoForCreate', 'none');
		changeDisplayProperty('bottom-border-boxshadow', 'none');
		changeDisplayProperty('truckNoForCreate', 'none');
		setValueToTextField('lhpvNoForAppendId', '');
		setValueToTextField('selectedVehicleNoId', '0');
		setValueToTextField('VehicleNo', '');
		
		changeLableValue();
	} else {
		setValueToTextField('lhpvNoForAppendId', '');
		setValueToTextField('ddmInterBranchLSNoForAppendId', '');
		setValueToTextField('selectedVehicleNoId', '0');
		changeDisplayProperty('truckNoForCreate', 'none');
		changeDisplayProperty('lhpvNoForAppend', 'none');
		changeDisplayProperty('ddmInterBranchLSNoForAppend', 'none');
	}
}

function searchLSForAppend(event) {
	if(event.which) { // Netscape/Firefox/Opera
		var keycode = event.which;
		if(keycode == 13) {
			hideInfo();
			validationFormElement();
		};
	};
}

function validationFormElement() {
	var vehicleNoId = 0;
	
	if(validateLHPVNumberForAppend()) {
		showLayer();
		getVehicleDataForLHPV(vehicleNoId, 2);
	}
}

function resetElement(){
	//document.getElementById('selectedVehicleNo').value='0';
	removeLHPVTable();
}

function removeLHPVTable() {
	changeDisplayProperty('dispatchTable', 'none');
	changeDisplayProperty('mainTable', 'none');
	changeDisplayProperty('middle-border-boxshadow', 'none');
	changeDisplayProperty('createButton', 'none');
	changeDisplayProperty('deleteLR', 'none');
	changeDisplayProperty('CreateLHPV', 'none');
	changeLableValue();
	
	var table = $('#dispatchTable').DataTable();
	table.clear().draw();
}

function changeLableValue() {
	if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL) {
		$('#ddmInterBranchLSNoForAppendLabel').html('Inter Branch LS No. For Append : ');
		document.getElementsByName('ddmInterBranchLSNoForAppendId')[0].placeholder = 'LS Number';
		$('#detailsHeaderLabel').html('LS Details (Please Select LS which is required in this LHPV)');
	} else if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
		document.getElementsByName('ddmInterBranchLSNoForAppendId')[0].placeholder = 'DDM number';
		$('#ddmInterBranchLSNoForAppendLabel').html('Inter Branch DDM No. For Append : ');
		$('#detailsHeaderLabel').html('DDM Details (Please Select DDM which is required in this LHPV)');
	}
}

function changeConfigForAdvanceBalanceValidation() {
	if(configuration.calculateAdvanceFromTopayLRTotal) {
		if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
			configuration.lhpvAdvanceAmountChecking = false;
		else if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
			configuration.lhpvAdvanceAmountChecking = true;
	}
}

function getSeletedItemData(id) {
	$('#selectedVehicleNo').val(id);
	
	if(configuration.LHPVOfDDM) {
		if($('#selectLHPVType').val() == 0) {
			$('#VehicleNo').val('');
			showMessage('error', 'Please, Select type of LHPV !');
			changeTextFieldColor('selectLHPVType', '', '', 'red');
			return false;
		}
		
		changeTextFieldColorWithoutFocus('selectLHPVType', '', '', 'green');
	}
	
	//getDetailsByVehicleNumber(id);
	getVehicleDataForLHPV(id, 1);
}

function getVehicleDataForLHPV(vehicleId, filter) {
	var jsonObject				= new Object();

	if(filter == 1) {
		jsonObject.vehicleMasterId 		= vehicleId;
	} else if(filter == 2) {
		var lhpvNo 						= document.getElementById('lhpvNoForAppendId').value.trim();
		var ddmInterBranchLSNoForAppend = document.getElementById('ddmInterBranchLSNoForAppendId').value.trim();

		jsonObject.lhpvNo 						= lhpvNo;
		jsonObject.ddmInterBranchLSNoForAppend 	= ddmInterBranchLSNoForAppend;
	}
	
	jsonObject.typeOfLHPV 		= $('#typeOfLHPV').val();
	jsonObject.filter			= 2;

	var jsonStr 				= JSON.stringify(jsonObject);
	var url =  "LHPVAjaxAction.do?pageId=228&eventId=3";

	showLayer();
	$.getJSON(url,{json:jsonStr}, function(data) {

		if(jQuery.isEmptyObject(data)) {
			alert("Sorry, an error occurred in the system. Please report this problem to the System Administrator.");
			showMessage('error', 'Sorry, an error occurred in the system. Please report this problem to the System Administrator.');
			hideLayer();
			return false;
		} else if(data.error != null) {
			//alert(data.error);
			showMessage('error', iconForInfoMsg + ' ' + data.error);
			hideLayer();
			return false;
		} else {
			hideLayer();
			$('#lsNumber').val('');
			changeLableValue();
			changeConfigForAdvanceBalanceValidation();
			setTimeout(setDataForLHPV(data, 0), 1000);
		}	
	});
}

function searchDDMInterBranchLSForAppend(event) {
	if(event.which) { // Netscape/Firefox/Opera
		var keycode = event.which;
		if(keycode == 13) {
			hideInfo();
			validationDDMInterBranchLSForAppend();
		};
	};
}

function validationDDMInterBranchLSForAppend(){
	var vehicleNoId = 0;

	if(validateLHPVNumberForAppend()){
		var ddmInterBranchLSNoForAppend = document.getElementById('ddmInterBranchLSNoForAppendId');

		if(ddmInterBranchLSNoForAppend != null) {
			var ddmInterBranchLSNoForAppendId = ddmInterBranchLSNoForAppend.value.trim();	

			if(ddmInterBranchLSNoForAppendId == "" || ddmInterBranchLSNoForAppendId == "0") {
				showMessage('error', ddmNumberErrMsg);
				toogleElement('basicError','block');
				var obj = document.getElementById('ddmInterBranchLSNoForAppendId');
				setTimeout(function(){if(obj)obj.focus();obj.select();},100);
				return false;
			} else {
				toogleElement('basicError','none');
			};
		}

		showLayer();
		getVehicleDataForLHPV(vehicleNoId, 2);
	}
}

function validateLHPVNumberForAppend(){
	var lhpvNo 		= document.getElementById('lhpvNoForAppendId').value.trim();

	if(lhpvNo != null) {
		if(lhpvNo == "" || lhpvNo == "0") {
			showMessage('error', lhpvNumberErrMsg);
			var obj = document.getElementById('lhpvNoForAppendId');
			setTimeout(function(){if(obj)obj.focus();obj.select();},100);
			return false;
		} else {
			hideAllMessages();
		};
	}

	return true;
}

function setInputElement(eleId,val){
	document.getElementById(eleId).value= val;
}

function setDisplayElemnt(eleId,type){
	document.getElementById(eleId).style.display = type;
}

function setDataForLHPV(data, lsNumber) {

	txnDecision();
	var table = resetTable();

	var jsonArr 	= data.dispatchLedgerJsonArray;
	var lorryHire 	= data.lorryHirejsonObj;
	var lhpv 		= data.lhpvjsonObj;
	var vehicle 	= data.vehicle;

	if(configuration.createLhpvOnLSNumber) {
		if(countAddedLS == 0)
			setDefaultDestination(data);

		countAddedLS++;
	}

	$('#lhpvJagrutiFlag').val(data.configValueForJagruti);
	
	if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
		$('#number').html('DDM No.');
		$('#date').html('DDM Date');
	} else {
		$('#number').html('LS No.');
		$('#date').html('LS Date');
	}

	calculateAdvanceFromTruckDlyTopayLR 		= configuration.CalculateAdvanceFromTruckDlyTopayLR;
	calculateAdvanceFromTopayLRTotal 			= configuration.calculateAdvanceFromTopayLRTotal;
	isDisplayUnladenWeight					 	= configuration.DisplayUnladenWeight;
	hideAdvanceFromTruckDlyLRBySubrRegionIdExclude	= configuration.hideAdvanceFromTruckDlyLRBySubrRegionIdExclude;
	
	if(hideAdvanceFromTruckDlyLRBySubrRegionIdExclude == 0)
		hideAdvanceFromTruckDlyLRBySubrRegionIdExclude	= '0';

	for(var key in jsonArr) {
		if (jsonArr.hasOwnProperty(key)) {
			var dipatchLedgers = jsonArr[key];
			var dispatchLedgerId 	= dipatchLedgers.dispatchLedgerId;
			lsDispatchLedgerId		= dipatchLedgers.dispatchLedgerId
			var topayGrandTotal 	= '<input name="topayGrandTotal_' + dispatchLedgerId + '" id="topayGrandTotal_' + dispatchLedgerId + '" type="hidden" value="' + dipatchLedgers.topayGrandTotalAmount + '">'
			var otherAdditionEle 	= '<input name="otherAdditionalCharges_' + dispatchLedgerId + '" id="otherAdditionalCharges_' + dispatchLedgerId + '" type="hidden" value="' + dipatchLedgers.otherAdditionalAmount + '">';
			var vehicleNumberId		= '<input name="vehicleNumber_' + dipatchLedgers.vehicleNumberMasterId + '" id="vehicleNumber_' + dipatchLedgers.vehicleNumberMasterId + '" type="hidden" value="' + dipatchLedgers.vehicleNumberMasterId + '">';
			var dispatchNumber 		= dipatchLedgers.lsNumber + '<input name="lsNumber_' + dispatchLedgerId + '" id="lsNumber_' + dispatchLedgerId + '" class="lsNumber" type="hidden" value="' + dipatchLedgers.lsNumber + '">' + otherAdditionEle + topayGrandTotal + vehicleNumberId;
			var dispatchDate 		= dipatchLedgers.dispatchDateTime + '<input name="lsCreationTime_' + dispatchLedgerId + '" id="lsCreationTime_' + dispatchLedgerId + '" type="hidden" value="' + dipatchLedgers.dispatchTimeString + '">';
			var sourceBranch 		= dipatchLedgers.sourceBranch;
			var destinationBranch 	= dipatchLedgers.destinationBranch;
			var totalNoOfPackages 	= dipatchLedgers.totalNoOfPackages + '<input name="totalNoOfPackages_' + dispatchLedgerId + '" id="totalNoOfPackages_' + dispatchLedgerId + '" type="hidden" value="' + dipatchLedgers.totalNoOfPackages + '">';
			var totalActualWeight 	= dipatchLedgers.totalActualWeight + '<input name="actualWeight_' + dispatchLedgerId + '" id="actualWeight_' + dispatchLedgerId + '" type="hidden" value="' + dipatchLedgers.totalActualWeight + '">';
			var DDVCheckString 		= dipatchLedgers.ddvCheckString;
			var delteLSButton 		= '<input type=button class="button button-tiny button-icon-txt-small button-uppercase  button-caution" id="deleteLRbtn" value="Remove" onclick="deleteLSRow(' + dispatchLedgerId + ')" />'
			var inputEle 			= '<input name="lsIds" id=' + dispatchLedgerId + ' type=checkbox class="checkBox1" value=' + dispatchLedgerId + ' onclick=resetError1(this);calculateAdvanceAmountfromTruckDlyLRTotal();calculateAmount();>';
			
			setTimeout(function() { 
				$("#singleLsNumber").val($(".lsNumber").val());
			}, 200);
			
			if(configuration.isDDDVShow && !configuration.isRemoveButtonDisplay)
				table.row.add([inputEle, dispatchNumber, dispatchDate, sourceBranch, destinationBranch, totalNoOfPackages, totalActualWeight, DDVCheckString, '']).draw();
			else if(!configuration.isDDDVShow && configuration.isRemoveButtonDisplay)
				table.row.add([inputEle, dispatchNumber, dispatchDate, sourceBranch, destinationBranch, totalNoOfPackages, totalActualWeight, delteLSButton, '']).draw();
			else if(!configuration.isDDDVShow && !configuration.isRemoveButtonDisplay)
				table.row.add([inputEle, dispatchNumber, dispatchDate, sourceBranch, destinationBranch, totalNoOfPackages, totalActualWeight, '', '']).draw();
			else
				table.row.add([inputEle, dispatchNumber, dispatchDate, sourceBranch, destinationBranch, totalNoOfPackages, totalActualWeight, DDVCheckString, delteLSButton]).draw();
		}
	}

	setLHPVData(lhpv);
	setLorryHireTable(lorryHire);
	setVehicleData(vehicle);
	setTruckType();
	
	$('html,body').animate({
        scrollTop: $("#middle-border-boxshadow").offset().top},
      'slow');
}

function setTruckType(){
	if(configuration.isTruckLoadTypeRequired) {
		$('#truckLoadTypeRow').show();
		$('#boliWeightRow').show();
		//Create array of options to be added
		//Create and append the options
		Object.keys(TruckLoadType).forEach(function(key) {
			var option = document.createElement("option");
			option.value = key;
			option.text = TruckLoadType[key];
			$('#truckLoadTypeId').append(option);
		});
	}
}
function setBoliWeight(){
	var truckLoadTypeId	=  Number($('#truckLoadTypeId').val());
	
	if(truckLoadTypeId == LHPVConstant.TRUCK_LOAD_TYPE_PART_LOAD)
		$('#boliWeightId').val($('#actualWeight_' + lsDispatchLedgerId).val());
	else if(truckLoadTypeId == LHPVConstant.TRUCK_LOAD_TYPE_FULL_LOAD)
		$('#boliWeightId').val(vehicleTypeCapacity);
}

function deleteLSRow(dispatchLedgId) {
	var tableEl 	= document.getElementById("dispatchTable");
	var table 		= $('#dispatchTable').DataTable();
	var rowFound 	= false;

	for (var row = tableEl.rows.length-1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0]) {
			if(tableEl.rows[row].cells[0].children[0].value == dispatchLedgId) {
				var el = tableEl.rows[row];
				table.row(el).remove().draw( false );
				rowFound = true;
			};
		} else {
			showMessage('warning', noLSToDeleteWarningMsg);
			rowFound = true;
		};
	}

	if(!rowFound) {
		showMessage('info', selectLSToDeleteInfoMsg);
	};
}

function selectAllOutboundCargo(param) {
	resetError1(this);
	if(param) { // check select status
		$('.checkBox1').each(function() { //loop through each checkbox
			this.checked = true;  //select all checkboxes with class "checkbox1"              
		});
	} else {
		$('.checkBox1').each(function() { //loop through each checkbox
			this.checked = false; //deselect all checkboxes with class "checkbox1"                      
		});        
	};

	calculateAdvanceAmountfromTruckDlyLRTotal();
	calculateAmount();
}

function calculateAmount() {

	var tableEl 		= document.getElementById("dispatchTable");
	var totActualWgt 	= 0;
	var totNoOfArtcl 	= 0;

	document.getElementById('reportTitleData').removeAttribute("hidden");

	changeDisplayProperty('actualwt', '');
	changeDisplayProperty('noOfarticle', '');
	changeDisplayProperty('unledenWeight', '');

	for(var i = 1; i < tableEl.rows.length; i++) {
		if(tableEl.rows[i].cells[0].children[0].checked) {
			var dispatchLedgerId = tableEl.rows[i].cells[0].children[0].value;
			totActualWgt += parseInt(document.getElementById('actualWeight_' + dispatchLedgerId).value);
			totNoOfArtcl += parseInt(document.getElementById('totalNoOfPackages_' + dispatchLedgerId).value);
		}
	}

	setValueToHtmlTag('actualwt', 'Selected Weight : ' + totActualWgt + ' kg');
	setValueToHtmlTag('noOfarticle', 'Total No Of Article : ' + totNoOfArtcl);

	if(parseInt(totActualWgt) == 0 ) {
		changeDisplayProperty('actualwt', 'none');
		changeDisplayProperty('noOfarticle', 'none');
		changeDisplayProperty('unledenWeight', 'none');

		document.getElementById('reportTitleData').setAttribute("hidden", "");
	}

	var flagForJagriti = document.getElementById("lhpvJagrutiFlag").value;

	if(flagForJagriti == 1) {

		var topayGrandTotal 	= 0;
		var otherChargeTotal 	= 0;
		var lhpvAmount 			= 0;
		var otherFreightAmount	= 0;

		for(var i = 1; i < tableEl.rows.length; i++) {
			if(tableEl.rows[i].cells[0].children[0].checked) {
				var dispatchLedgerId = tableEl.rows[i].cells[0].children[0].value;

				topayGrandTotal 	+= parseInt(document.getElementById('topayGrandTotal_' + dispatchLedgerId).value);
				otherChargeTotal 	+= parseInt(document.getElementById('otherAdditionalCharges_' + dispatchLedgerId).value);
			}
		}

		if(otherChargeTotal > 0) {
			lhpvAmount = parseFloat(otherChargeTotal * (LHPVConstant.JAGRUTI_LHPV_PERCENT_ON_PAID_TBB));
			otherFreightAmount = parseFloat(otherChargeTotal - lhpvAmount);
		}

		var finalAmount = parseInt(topayGrandTotal + otherFreightAmount);
		//alert('finalAmount : '+finalAmount);
		setValueToTextField('charge' + LORRY_HIRE, finalAmount);
	}

	calculateBalanceAmount();
}

function calculateAdvanceAmountfromTruckDlyLRTotal() {
	var tableEl 	= document.getElementById("dispatchTable");
	var totalAmount = 0;
		
	var executiveSubRegionId = executive.subRegionId + "";
	
	if((calculateAdvanceFromTruckDlyTopayLR || calculateAdvanceFromTopayLRTotal) && !(hideAdvanceFromTruckDlyLRBySubrRegionIdExclude.includes(executiveSubRegionId))) {
		//if(108 != 108){
			for(var i = 1; i < tableEl.rows.length; i++) {
				if(tableEl.rows[i].cells[0].children[0].checked){
					var dispatchLedgerId = tableEl.rows[i].cells[0].children[0].value;
					totalAmount += parseInt(document.getElementById('topayGrandTotal_' + dispatchLedgerId).value);
				}
			}

			if(document.getElementById("charge" + ADVANCE_AMOUNT)) {
				if(calculateAdvanceFromTopayLRTotal == 'true'){
					if($('#typeOfLHPV').val() == LHPVConstant.TYPE_OF_LHPV_ID_DDM){
						document.getElementById("charge" + ADVANCE_AMOUNT).value = parseInt(totalAmount);
					} 
				} else {
					document.getElementById("charge" + ADVANCE_AMOUNT).value = parseInt(totalAmount);
				}
			}
		//}
	} else if(hideAdvanceFromTruckDlyLRBySubrRegionIdExclude.includes(executiveSubRegionId))
		$("#charge" + ADVANCE_AMOUNT).attr('readonly', false);
}

function setLorryHireTable(lorryHire) { 
	if(lorryHire != undefined) {
		var lorryHireObj = lorryHire;
		setValueToHtmlTag('lorrySupplierName', lorryHireObj.lorrySupplierName);
		setValueToHtmlTag('vehicleType', lorryHireObj.vehicleType);
		setValueToHtmlTag('paymentType', lorryHireObj.paymentTypeString);
		selectOptionByValue(document.getElementById("DestinationSubRegionId"), lorryHireObj.destinationSubregionId);
		//alert(lorryHireObj.destinationSubregionId);
		setValueToTextField('DestinationBranchId', lorryHireObj.destinationBranchId);
	
		if(configuration.isDefaultSelectForDestBranch)
			populateBranchesWithCityBySubRegionIdForLocal(document.getElementById("DestinationSubRegionId").value,'DestinationSubBranchId',true,true,lorryHireObj.destinationBranchId+'_'+lorryHireObj.destinationSubregionId);
		else
			populateBranchesWithCityBySubRegionIdForLocal(document.getElementById("DestinationSubRegionId").value,'DestinationSubBranchId',false,true,lorryHireObj.destinationBranchId+'_'+lorryHireObj.destinationSubregionId);

		selectOptionByValue(document.getElementById("BalancePayableSubRegionId"),lorryHireObj.balancePayableAtBranchSubRegionId);

		setValueToTextField('BalancePayableBranchId', lorryHireObj.balancePayableAtBranchId);

		if(configuration.isDefaultSelectForBalancePayable)
			populateBranchesWithCityBySubRegionIdForLocal(document.getElementById("BalancePayableSubRegionId").value,'BalancePayableSubBranchId',true,true,lorryHireObj.balancePayableAtBranchId+'_'+lorryHireObj.balancePayableAtBranchSubRegionId);
		else
			populateBranchesWithCityBySubRegionIdForLocal(document.getElementById("BalancePayableSubRegionId").value,'BalancePayableSubBranchId',false,true,lorryHireObj.balancePayableAtBranchId+'_'+lorryHireObj.balancePayableAtBranchSubRegionId);

		if(document.getElementById("charge" + RATE_PMT) && lorryHireObj.ratePerTon != null)
			document.getElementById("charge" + RATE_PMT).value = parseInt(lorryHireObj.ratePerTon);

		if(document.getElementById("charge" + LORRY_HIRE) && lorryHireObj.totalLorryHireAmount != null)
			document.getElementById("charge" + LORRY_HIRE).value = parseInt(lorryHireObj.totalLorryHireAmount);

		if(document.getElementById("charge" + ADVANCE_AMOUNT) && lorryHireObj.advanceAmount != null)
			document.getElementById("charge" + ADVANCE_AMOUNT).value = parseInt(lorryHireObj.advanceAmount);

		if(document.getElementById("charge" + BALANCE_AMOUNT) && lorryHireObj.balanceAmount != null) {
			document.getElementById("charge" + BALANCE_AMOUNT).value = parseInt(lorryHireObj.balanceAmount);
			calculatedBalanceAmount = document.getElementById("charge" + BALANCE_AMOUNT).value;
		}

		if(lorryHireObj.paymentType == PAYMENT_TYPE_CHEQUE_ID) {
			setValueToHtmlTag('chequeDate', lorryHireObj.chequeDateString);
			setValueToHtmlTag('chequeDate_val', lorryHireObj.chequeDateString);
			setValueToHtmlTag('chequeNo', lorryHireObj.chequeNumber);
			setValueToHtmlTag('chequeNo_val', lorryHireObj.chequeNumber);
			setValueToHtmlTag('chequeAmount', lorryHireObj.chequeAmount);
			setValueToHtmlTag('chequeAmount_val', lorryHireObj.chequeAmount);
			setValueToHtmlTag('bankName', lorryHireObj.bankName);
			setValueToHtmlTag('bankName_val', lorryHireObj.bankName);

			dispayChequeELements('table-cell');
		} else
			dispayChequeELements('none');
	} else
		changeDisplayProperty('lorryHireDetails', 'none');
}

function setLHPVData(lhpv) {

	if(lhpv != undefined) {
		var lhpvNo 	 			= lhpv.lHPVNumber;
		var lhpvId 	 			= parseInt(lhpv.lhpvId);
		var lhpvBranchId 		= parseInt(lhpv.lHPVBranchId);
		var lhpvCreationTime 	= parseInt(lhpv.lhpvCreationDateTimeString);

		createLHPVButtonAllow = true;
		appendLHPVButtonAllow = true;

		changeDisplayProperty('lhpvDetails', 'table-cell');
		setValueToHtmlTag('lhpvNoDIV', 'LHPV No : ' + lhpvNo);
		setValueToTextField('lhpvNo', lhpvNo);
		setValueToTextField('lhpvId', lhpvId);
		setValueToTextField('lhpvBranchId', lhpvBranchId);
		setValueToTextField('lhpvCreationTime', lhpvCreationTime);
	}
}

function setVehicleData(vehicle) {
	if(vehicle != undefined) {
		var unladenWeight 	 			= vehicle.unLadenWeight;
		vehicleOwner 	 				= vehicle.vehicleOwner;
		
		if(isDisplayUnladenWeight)
			document.getElementById("unledenWeight").innerHTML = "Unladen Weight : "+unladenWeight;
	}
}

function txnDecision() {
	changeDisplayProperty('dispatchTable', 'block');
	changeDisplayProperty('mainTable', 'block');
	changeDisplayProperty('middle-border-boxshadow', 'block');
	changeDisplayProperty('deleteLR', 'block');

	var selectType = getValueFromInputField('selectType');

	if(selectType == LHPVConstant.CREATE_ID)
		changeDisplayProperty('createButton', 'block');
	else
		changeDisplayProperty('createButton', 'none');

	if(selectType == LHPVConstant.APPEND_ID)
		changeDisplayProperty('appendButton', 'table-cell');
	else
		changeDisplayProperty('appendButton', 'none');
}

function driverAutocomplete() {

	$("#lhpvDriver").autocomplete({
		source: "AutoCompleteAjaxAction.do?pageId=9&eventId=13&filter=28&responseFilter="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(Number(ui.item.id) != Number(0)) {
				selectedSource = ui.item.id;
				$('#driverMasterId').val(ui.item.id);
			}
		}
	});
}

function vehicleNumberAutocomplete() {

	$("#VehicleNo").autocomplete({
		source: "AutoCompleteAjaxAction.do?pageId=9&eventId=13&filter=31&responseFilter="+1+"&routeTypeId="+VehicleNumberMasterConstant.ROUTE_TYPE_ROUTING_AND_BOTH,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(configuration.vehiclePanNumberValidation == 'true' || configuration.vehiclePanNumberValidation == true ){
				if(ui.item.panNumber == null || ui.item.panNumber == undefined || ui.item.panNumber.length == "" ){
					return	showMessage('error', vehiclePanNumberErrMsg);
				}
			}
			
			if(ui.item.id != 0) {
				getSeletedItemData(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function validateFillSelection() {

	var lsDate 	 	= null;
	var lsNumber 	= null;
	var tbl  		= document.getElementById('dispatchTable');
	var rowCount 	= tbl.rows.length;
	var lsId 		= 0;

	if(configuration.isTruckLoadTypeRequired == 'true'){
		if(Number($('#truckLoadTypeId').val()) == 0){
			setTimeout(function(){ 
				showMessage('error', 'Please Select Truck Load Type'); 
			}, 200);
			changeSpecificError('truckLoadTypeId');
			return false;
		}
		
		if(Number($('#boliWeightId').val()) == 0){
			showMessage('error', 'Please Enter Boli Weight'); 
			changeSpecificError('boliWeightId');
			return false;
		}
		
		if(Number($('#charge' + RATE_PMT).val()) == 0) {
			showMessage('error', 'Please Enter Rate PMT'); 
			changeSpecificError('charge' + RATE_PMT);
			return false;
		}
	}
	
	if(configuration.ratePmtValidateOnHiredvehicle && vehicleOwner == VehicleOwnerConstant.HIRED_VEHICLE_ID && Number($('#charge' + RATE_PMT).val()) == 0) {
		showMessage('error', 'Please Enter Rate PMT'); 
		changeSpecificError('charge' + RATE_PMT);
		return false;
	}
	
	disableButtons();

	var isAllowManual 		 = $('#isAllowManual').val();
	var	isSeqCounterPresent	 = $('#isSeqCounterPresent').val();

	var chk = document.getElementById("isManualLHPV");

	if(chk != null && chk.checked) {
		var manualLHPVNumber 	= document.getElementById("manualLHPVNumber");

		var manualLHPVNumberVal = parseInt($('#manualLHPVNumber').val(), 10);

		if($('#manualLHPVNumber').val() == '' || $('#manualLHPVNumber').val() == '0') {
			$('#manualLHPVNumber').val('');
			showMessage('error', manualLHPVNumberErrMsg);
			changeSpecificError('manualLHPVNumber');
			enableButtons();
			return false;
		}

		if($('#manualLHPVDate').val().length <= 0 || $('#manualLHPVDate').val() == 'LHPV Date') {
			showMessage('error', manualLHPVDateErrMsg);
			changeSpecificError('manualLHPVDate');
			enableButtons();
			return false;
		} else {
			var maxRange = parseInt($('#MaxRange').val());
			var minRange = parseInt($('#MinRange').val());

			for(var index = 0; index < rowCount; index++) {
				if(tbl.rows[index].cells[0].firstChild.checked) {

					lsId 	 = tbl.rows[index].cells[0].firstChild.value;
					lsDate 	 = document.getElementById('lsCreationTime_' + lsId).value;
					lsNumber = document.getElementById('lsNumber_' + lsId).value;
					//alert(manualLHPVDate);
					if(chkDate($('#manualLHPVDate').val(), lsDate, lsNumber, 1)) {
					} else {
						enableButtons();
						return false;
					};
				};
			}
		
			if(isSeqCounterPresent == 'false' || (isSeqCounterPresent == 'true' && ((configuration.checkManualLHPVSequenceRange && 
					!configuration.checkManualLHPVSequenceRange) || (manualLHPVNumberVal >= minRange && manualLHPVNumberVal <= maxRange)))) {
				resetErrorMessages('manualLHPVNumber');

				if(checkedManualLHPVSave != manualLHPVNumberVal ) {
					if(checkedManualLHPVOnCancel != manualLHPVNumberVal){
						$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{
							filter:26,manualLHPVNumber:manualLHPVNumberVal},function(data){
								var response = $.trim(data);
								if(response == 'true'&& isAllowManual =='false'){
									showMessage('info', lhpvNumberAlreadyCreatedInfoMsg);
									changeSpecificError('manualLHPVNumber');
									manualLHPVNumber.focus();
									enableButtons();
									return false;
								} else {
									resetErrorMessages('manualLHPVNumber');
									finallyCreateLHPV();
								};
							});
						checkedManualLHPVSave = manualLHPVNumberVal;
					} else {
						finallyCreateLHPV();
					};
				} else {
					showMessage('info', lhpvNumberAlreadyCreatedInfoMsg);
					changeSpecificError('manualLHPVNumber');
					manualLHPVNumber.focus();
					enableButtons();
					return false;
				};
			} else {
				showMessage('info', manualLHPVNumberWithinRangeInfoMsg(minRange, maxRange));
				changeSpecificError('manualLHPVNumber');
				enableButtons();
				return false;
			};
		};
	} else if(isAllowBackDateInAutoLhpv && !isAllowManualLhpv) {
		if(validateLsNumberDate())
			finallyCreateLHPV();
	} else
		finallyCreateLHPV();
}

function finallyCreateLHPV() {
	if(!validateSelection()){
		enableButtons();
		return false;
	}
	/*if(validateTruckLoad()){
		console.log(validateTruckLoad());
		enableButtons();
		return false;
	}*/
	var DestinationSubBranchId = document.getElementById("DestinationSubBranchId");

	if(DestinationSubBranchId.style.display != 'none' && DestinationSubBranchId.value == 0) {
		showMessage('error', truckDestinationBranchErrMsg);
		changeTextFieldColor('DestinationSubBranchId', '', '', 'red');
		toogleElement('errorSubmit', 'block');
		enableButtons();
		return false;
	} else {
		resetErrorMessages('DestinationSubBranchId');
	}

	if(DestinationBranchId.value == executive.branchId) {
		showMessage('warning', branchAsTruckDestinationBranchWarningMag);
		changeSpecificError('DestinationSubBranchId');
		enableButtons();
		return false;
	} else {
		resetErrorMessages('DestinationSubBranchId');
	}
	
	if (configuration.isValidateLoadingHamaliAndUnloadingHamaliAmt == 'true' || configuration.isValidateLoadingHamaliAndUnloadingHamaliAmt == true) {
		var loadingHamaliAmount = 0;
		var unLoadingHamaliAmount = 0;
			loadingHamaliAmount = document.getElementById('charge' + LOADING_HAMALI).value;
			unLoadingHamaliAmount = document.getElementById('charge' + UNLOADING_HAMALI).value;

		if(unLoadingHamaliAmount == 0) {
			showMessage('error', 'Unloading Amount Cannot Be 0 !');
			$("#charge" + UNLOADING_HAMALI).focus();
			enableButtons();
			return false;
		} else if (loadingHamaliAmount == 0) {
			showMessage('error', 'Loading Amount Cannot Be 0 !');
			$("#charge" + LOADING_HAMALI).focus();
			enableButtons();
			return false;
		}
	}

//	var driverMasterId = document.getElementById("driverMasterId");

//	if(driverMasterId.style.display != 'none' && driverMasterId.value == 0) {

//	showMessage('error', driverMasterErrMsg);
//	changeTextFieldColor('lhpvDriver', '', '', 'red');
//	$("#lhpvDriver").val('');
//	enableButtons();
//	return false;
//	} else {
//	resetErrorMessages('lhpvDriver');
//	}

	var totalAmount = document.getElementById('charge' + LORRY_HIRE); 

	if(totalAmount.value < 0) {
		showMessage('info', lorryHireAmountLTZeroInfoMag);
		changeSpecificError('charge' + LORRY_HIRE);
		enableButtons();
		return false;
	} else
		resetErrorMessages('charge' + LORRY_HIRE);
	
	if(configuration.lhpvAdvanceAmountChecking) { 
		var totalAmount 		= 0;
		var advanceAmount 		= 0;

		totalAmount 	= chargesAmountCalWithoutAdvance();

		if(document.getElementById('charge' + ADVANCE_AMOUNT))
			advanceAmount = document.getElementById('charge' + ADVANCE_AMOUNT).value;
		
		if(!configuration.allowLhpvWithZeroLorryHireAmt && parseInt(advanceAmount) > 0 && parseInt(advanceAmount) > parseInt(totalAmount)) {
			showMessage('warning', advanceAmountMTBalanaceAmtWarningMag);
			changeSpecificError('charge' + ADVANCE_AMOUNT);
			setTimeout(function(){ $('#charge' + ADVANCE_AMOUNT).focus(); }, 0);
			enableButtons();
			return false;
		}
	}
	if (!validateAdvanceAgainstLorryHire()) {
    enableButtons();
    return false;
    }
    
	var balanceAmount = document.getElementById('charge' + BALANCE_AMOUNT); 

	if(balanceAmount.value != '0') {
		if(!validateBalancePayableBranch(1, 'BalancePayableBranchId')) {
			enableButtons();
			return false;
		}

		if(!validateBalancePayableSubBranch(1, 'BalancePayableSubBranchId')) {
			enableButtons();
			return false;
		}
	} else {
		document.getElementById("BalancePayableSubRegionId").selectedIndex = 0;
		document.getElementById("BalancePayableSubBranchId").selectedIndex = 0;
		setValueToTextField('BalancePayableBranchId', 0);
	}

	var remark = document.getElementById("remark"); 

	if(!driverNameValidation()) {
		enableButtons();
		return false;
	}

	var weighBridge		= document.getElementById('weighBridge');

	if(configuration.DisplayLoadedWeightBridgeInputField == 'true') {
		if(weighBridge != null) {
			if(weighBridge.style.display != 'none' && weighBridge.value == 0) {
				showMessage('error', weighBridgeErrMsg);
				changeTextFieldColor('weighBridge', '', '', 'red');
				toogleElement('errorSubmit', 'block');
				enableButtons();
				return false;
			} else {
				resetErrorMessages('weighBridge');
			}
		}
	}

	var answer = confirm (createLHPVConfirmMsg);

	if (answer) {
		var remark = document.getElementById("remark"); 

		if(remark.value == 'Remark')
			setValueToTextField('remark', '');

		if(document.getElementById("manualLHPVNumber") != null 
				&& document.getElementById("manualLHPVNumber").value == '') {
			document.getElementById("manualLHPVNumber").value = '0';
		}

		//disableButtons();
		//Disable page
		if(!doneTheStuff) {
			doneTheStuff	= true;
			showLayer();
			document.CreateLHPV.action = "CreateLHPV.do";
			document.CreateLHPV.submit();
		}

	} else {
		if(document.getElementById("manualLHPVNumber"))
			checkedManualLHPVOnCancel = document.getElementById("manualLHPVNumber").value.trim();

		doneTheStuff = false;
		enableButtons();
		checkedManualLHPVSave = null;
		return false;
	};	
}

function resetDriverData() {
	$('#driverMasterId').val(0);
}

function validateBalancePayableBranch(filter, elementID) {
	return validateInput(filter, elementID, elementID, elementID, balancePayableBranchErrMsg);
}

function validateBalancePayableSubBranch(filter, elementID) {
	return validateInput(filter, elementID, elementID, elementID, balancePayableSubBranchErrMsg);
}

function showFillingCriteria() {
	if(!validateSelection())
		return false;
	
	//first set append realated feilds to basic
	document.getElementById('operationType').value = '1';
	var tab 	= document.getElementById('dispatchTable');
	var count 	= parseFloat(tab.rows.length-1);
	
	if(count >= 1) {
		changeDisplayProperty('CreateLHPV', 'table-cell');
		changeDisplayProperty('bottom-border-boxshadow', 'block');
		getSourceDestinationWiseLHPVSequenceCounter();
	} else {
		alert("Please add LS first !!");
	};
	
	$('html,body').animate({
        scrollTop: $("#bottom-border-boxshadow").offset().top},
      'slow');
}

function appendDispatchLLedger(){
	disableAppendButtons();
	validateAppendLHPV();
}

function validateAppendLHPV() {

	var lsDate 	 		= null;
	var lsNumber 		= null;
	var tbl 			= document.getElementById("dispatchTable");
	var rowCount 		= tbl.rows.length;
	var lsId			= 0;
	var manualLHPVDate 	= new Date(parseInt(document.getElementById('lhpvCreationTime').value));

	var year  			= manualLHPVDate.getFullYear();
	var month 			= (manualLHPVDate.getMonth()) + 1;
	var date  			= manualLHPVDate.getDate();

	if(!validateSelection()) {
		enableAppendButtons();
		return false;
	}

	for(var index = 0; index < rowCount; index++) {
		if(tbl.rows[index].cells[0].firstChild.checked) {
			lsId 	 = tbl.rows[index].cells[0].firstChild.value;

			lsDate 	 = document.getElementById('lsCreationTime_' + lsId).value;
			lsNumber = document.getElementById('lsNumber_' + lsId).value;

			if(chkDate(date + "-" + month + "-" + year, lsDate, lsNumber, 2)) {
			} else {
				enableAppendButtons();
				return false;
			} 
		}
	}

	//first set create realated feilds to basic
	changeDisplayProperty('CreateLHPV', 'none');
	changeDisplayProperty('bottom-border-boxshadow', 'none');
	setValueToTextField('operationType', '2');

	var lhpvNo 	= document.getElementById('lhpvNo');
	var tab 	= document.getElementById('dispatchTable');
	var count 	= parseFloat(tab.rows.length-1);

	calculateAdvanceAmountfromTruckDlyLRTotal();

	if(count >= 1) {
		var answer = confirm (appendLSInLHPVConfirmMsg(lhpvNo.value));

		if (answer) {
			document.CreateLHPV.action = "AppendLHPV.do";
			//Disable page
			showLayer();
			document.CreateLHPV.submit();
		} else {
			enableAppendButtons();
			return false;
		};

	} else {
		alert(addLSAlertMsg);
	};
}

function chkDate(lhpvDate,creationDateTime,lsNumber,selection) {
	var lsDate = new Date(parseInt(creationDateTime));
	//alert(selection);
	if(isValidDate(lhpvDate)) {
		var currentDate  	= new Date(curSystemDate);
		var previousDate 	= new Date(curSystemDate);
		var manualLHPVDate 	= new Date(curSystemDate);

		if(pastDaysAllowed < '0') {
			showMessage('info', noLSToDeleteInfoMsg);
			changeSpecificError('manualLHPVDate');
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed, 10));
		previousDate.setHours(0,0,0,0);

		var manualLHPVDateParts = new String(lhpvDate).split("-");

		manualLHPVDate.setFullYear(parseInt(manualLHPVDateParts[2],10));
		manualLHPVDate.setMonth(parseInt(manualLHPVDateParts[1]-1,10));
		manualLHPVDate.setDate(parseInt(manualLHPVDateParts[0],10));

		if(lsDate != null) {
			lsDate.setHours(0,0,0,0);

			if(configuration.allowAppendLSinLHPVAfterCurrentDate) {
				var diffDays		= diffBetweenTwoDate(manualLHPVDate, lsDate);

				if(diffDays >= configuration.appendLSinLHPVWithinDays) {
					showMessage('warning', appendLSWithinDaysInfoMsg(lsNumber, configuration.appendLSinLHPVWithinDays));
					changeSpecificError('manualLHPVDate');
					return false;
				}
			} else if(manualLHPVDate.getTime() < lsDate.getTime()) {
				showMessage('warning', lHPVDateIsEarlierThanLSDateInfoMsg(lsNumber));
				changeSpecificError('manualLHPVDate');
				return false;
			}
		}

		if(manualLHPVDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			changeSpecificError('manualLHPVDate');
			return false;
		} else if(manualLHPVDate.getTime() > previousDate.getTime()) {
			resetErrorMessages('manualLHPVDate');
			return true;
		} else {
			showMessage('info', enterDateTillDaysInfoMsg(pastDaysAllowed));
			changeSpecificError('manualLHPVDate');
			return false;
		}
	} else {
		showMessage('error', validDateErrMsg);
		changeSpecificError('manualLHPVDate');
		return false;
	}
}

function validateSelection() {

	var selectedLSCount = 0;
	var tableEl = document.getElementById("dispatchTable");

	for (var row = tableEl.rows.length - 1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0]) {
			if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				selectedLSCount ++;
			};
		};
	};

	if(selectedLSCount <= 0) {
		showMessage('error', selectLSToAppendInLHPVErrMsg);
		return false;
	}

	return true;
}

function dispayChequeELements(type) {
	changeDisplayProperty('chequeDate', type);
	changeDisplayProperty('chequeDateHead', type);
	changeDisplayProperty('chequeNo', type);
	changeDisplayProperty('chequeNoHead', type);
	changeDisplayProperty('chequeAmount', type);
	changeDisplayProperty('chequeAmountHead', type);
	changeDisplayProperty('bankName', type);
	changeDisplayProperty('bankNameHead', type);
}

function calculateBalanceAmount() {
	if(configuration.lhpvAdvanceAmountChecking) 
		checkForAdvanceAmount();

	var totalAmount = 0;
	totalAmount = chargesAmountCal();

	if(totalAmount >= 0) {
		setValueToTextField('charge' + BALANCE_AMOUNT, Math.abs(totalAmount));
		setValueToTextField('charge' + REFUND_AMOUNT, 0);
	} else {
		setValueToTextField('charge' + BALANCE_AMOUNT, 0);
		setValueToTextField('charge' + REFUND_AMOUNT, Math.abs(totalAmount));

		if(isNaN(document.getElementById('charge' + REFUND_AMOUNT).value)) {
			setValueToTextField('charge' + REFUND_AMOUNT, 0);
		}
	}
	
	$("#tdsAmount").val(parseFloat($("#charge" + TDS).val()));
}

function checkForAdvanceAmount() {
	var totalAmount 		= 0;
	var advanceAmount 		= 0;

	totalAmount 	= chargesAmountCalWithoutAdvance();

	if(document.getElementById('charge' + ADVANCE_AMOUNT)) {
		advanceAmount = document.getElementById('charge' + ADVANCE_AMOUNT).value;
	}
	
	if(!configuration.allowLhpvWithZeroLorryHireAmt && parseInt(advanceAmount) > 0 && parseInt(advanceAmount) > parseInt(totalAmount)) {
		showMessage('warning', advanceAmountMTBalanaceAmtWarningMag);
		changeSpecificError('charge' + ADVANCE_AMOUNT);
		setTimeout(function(){ $('#charge' + ADVANCE_AMOUNT).focus(); }, 0);
	}
}


function changeSpecificError(id) {
	var obj = document.getElementById(id);
	//alert(id);
	var posiArr = findPos(obj);
	changeError1(id, posiArr[0], posiArr[1]);
}

function populateBranchesWithCityBySubRegionIdForLocal(subRegionId,targetId,isDefaultSelect,isListAll,BranchIdAndCityId) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			};
		};
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;   
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
			if(isDefaultSelect){
				selectOptionByValue(document.getElementById(targetId),BranchIdAndCityId);	
			}
		};
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=67&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function resetError1(el) {
	hideAllMessages();
	resetErrorMessages(el.id);
};

function goToManualSelection(){
	var chk = document.getElementById("isManualLHPV");
	if(chk != null) {
		if(chk.checked) {
			changeDisplayProperty('selectionCriteria', 'table-row');
			changeDisplayProperty('rangeDisplay', 'table-row');
			document.getElementById("manualLHPVNumber").focus();
		} else {
			changeDisplayProperty('selectionCriteria', 'none');
			changeDisplayProperty('rangeDisplay', 'none');
			document.getElementById("manualLHPVNumber").value='';
			$('#msgbox').fadeTo('fast', 0);
		};
	};
}

function goToBackDateSelection(){
	changeDisplayProperty('selectionCriteria', 'table-row');
	changeDisplayProperty('isManualLHPVTD', 'none');
	changeDisplayProperty('manualLHPVNumber', 'none');
//	changeDisplayProperty('manualDateLabel', 'inline-block');

}

function getPrevNextCharge(ele) {
	var ch 	= document.getElementById("lhpvCharges");
	var len = ch.getElementsByTagName("input").length;

	for(var i=0;i<len;i++){
		if(ch.getElementsByTagName("input")[i].id == ele.id) {
			if(ch.getElementsByTagName("input")[i] == null || i==0) {
				prev = 'remark';
			} else {
				prev = ch.getElementsByTagName("input")[i-1].id;
			}
			if(ch.getElementsByTagName("input")[i+1] != null) {
				if(configuration.showTotalAddition == 'false') {
					if(ch.getElementsByTagName("input")[i+1].id == 'total'){
						next = ch.getElementsByTagName("input")[i+2].id;
					} else {
						next = ch.getElementsByTagName("input")[i+1].id;
					}
				} else {
					if(configuration.isRefundAmountShow == 'false' && ch.getElementsByTagName("input")[i+1].id == 'charge7') {
						next = ch.getElementsByTagName("input")[i+2].id;
					} else {
						next = ch.getElementsByTagName("input")[i+1].id;
					}
				}
			} else {
				next = 'Save';
			};
		};
	};
}

function getSourceDestinationWiseLHPVSequenceCounter() {
	if(configuration.srcDestWiseSeqCounter == 'true'){
		showLayer();
		var jsonObject			= new Object();
		var destinationId		= $('#DestinationSubBranchId').val().split('_');

		jsonObject["truckDestinationId"] 		= destinationId[0];
		if ($('#isManualLHPV').is(':checked') == true) {
			jsonObject["isManualLHPV"]			= $('#isManualLHPV').is(':checked');
			jsonObject["manualLHPVNumber"]		= $('#manualLHPVNumber').val();
		}
		$.ajax({
			url: WEB_SERVICE_URL+'/LHPVWS/getSourceDestinationWiseLHPVequenceCounter.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined){
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				} 
				hideLayer();
			}
		});
	}
}

function validateSubsAmountWithLhpvTotal(obj) {
	if(configuration.validateSubsAmountWithLhpvTotal) {
		if(Number($('#total').val()) < Number($('#'+obj.id).val())) {
			setValueToTextField(obj.id, 0);
			showMessage('warning', 'You can not enter amount more than Total Amount !');
			changeError1(obj.id, '0', '0');
			setTimeout(function(){ $('#'+obj.id).focus(); }, 0);
		}
		calculateBalanceAmount();
	}
}

function validateLsNumberDate(){
	var lsDate 	 				= null;
	var lsNumber 				= null;
	var tbl 					= document.getElementById("dispatchTable");
	var rowCount 				= tbl.rows.length;
	var lsId					= 0;
	var currentDateString 		= null;
	var manualLHPVDateString	= null;
	var dayDiff					= 0;
	var manualLHPVDate		= document.getElementById("manualLHPVDate");
	
	for(var index = 0; index < rowCount; index++) {
		if(tbl.rows[index].cells[0].firstChild.checked) {

			lsId 	 = tbl.rows[index].cells[0].firstChild.value;
			lsDate 	 = document.getElementById('lsCreationTime_' + lsId).value;
			lsNumber = document.getElementById('lsNumber_' + lsId).value;
	
			if(chkDate(manualLHPVDate.value, lsDate, lsNumber, 1)) {
				manualLHPVDateString	= manualLHPVDate.value;
				currentDateString 		= getCurrentDate();
	
				if(manualLHPVDateString < currentDateString) {
					dayDiff	= daydiff(parseDate(manualLHPVDateString),parseDate(currentDateString));
	
					if(dayDiff > Number(configuration.noOfBackDaysAllowedInAutoLhpv)) {
						enableButtons();
						showMessage('warning', 'Back Date More Then '+Number(configuration.noOfBackDaysAllowedInAutoLhpv)+' days not allowed!');
						changeSpecificError('manualLHPVDate');
						return false;
					}
					
					return true;
				}
				
				return true;
			} else {
				enableButtons();
				return false;
			};
		};
	}
}

function daydiff(first, second) {
	return Math.round((second-first)/(1000*60*60*24));
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function calculateLorryHireAmount(){
	setTimeout(function(){ 
		var boliWeight = $('#boliWeightId').val();
		var ratePmt	   = $('#charge' + RATE_PMT).val();
		$('#charge' + LORRY_HIRE).val((boliWeight * ratePmt) / 1000);
	}, 200);

	setTimeout(function(){ 
		calculateBalanceAmount();
		calculateTotal();
	}, 200);
}

function setNextElement(){
	if(configuration.driverNameAutocomplete)
		next	= 'lhpvDriver';
	else
		next	= 'charge4';
}

function setNextElementForDriver() {
	if(configuration.isTruckLoadTypeRequired)
		next	= 'truckLoadTypeId';
	else
		next	= 'charge4';
}

function driverNameValidation(){
	if(configuration.driverNameValidation) {
		if($("#lhpvDriver").val() == '') {
			showMessage('error', 'Please Enter driver name !');
			return false;
		}

		if($("#driverMasterId").val() <= 0) {
			showMessage('error', 'Please Enter correct driver name !');
			return false;
		}
	}
	
	return true;
}

function tdsCalculation() {
	var lorryHireAmount		= 0;
	var tdsAmount			= 0;
	
	var lorryHireAmount		= parseInt($("#charge" + LORRY_HIRE).val());
	var tdsCharge 			= $('#TDSRate').val();
	
	if(tdsConfiguration.IsTdsAllow) {
		if(document.getElementById('tdsInPercent') != null && document.getElementById('tdsInPercent').checked) {
			tdsAmount		= parseFloat(lorryHireAmount) * parseFloat(tdsCharge) / 100;
			$("#charge" + TDS).val(tdsAmount);
		} else {
			tdsAmount		= parseFloat($("#charge" + TDS).val());
		}
	}
	
	$("#tdsAmount").val(tdsAmount);
	
	calculateBalanceAmount();
	calculateTotal();
}

function validateAdvanceAgainstLorryHire() {
	 if (!configuration.advAmtLessThanLorryHireValidation)
        return true; 
        
	 var advanceAmount = 0;
	 var lorryHireAmount = 0;
		
	 if(document.getElementById('charge' + LORRY_HIRE)) 
    	lorryHireAmount = parseInt(document.getElementById('charge' + LORRY_HIRE).value) || 0;

	 if(document.getElementById('charge' + ADVANCE_AMOUNT))
		advanceAmount = parseInt(document.getElementById('charge' + ADVANCE_AMOUNT).value) || 0;
		    
	 if (lorryHireAmount > 0 && advanceAmount > 0 && advanceAmount > lorryHireAmount) {
		 showMessage('error', 'Advance amount  cannot be greater than Lorry Hire amount !');
		 changeSpecificError('charge' + ADVANCE_AMOUNT);
		 setTimeout(function(){if(document.getElementById('charge' + ADVANCE_AMOUNT)) {
								  document.getElementById('charge' + ADVANCE_AMOUNT).focus();
		                		  document.getElementById('charge' + ADVANCE_AMOUNT).select();}}, 0);
		 enableButtons();
		 return false;
	}
	
	return true;
}
