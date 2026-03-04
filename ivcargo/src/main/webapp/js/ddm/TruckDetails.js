var vehicleType		= new Object();
var vehicleAgent 	= new Object();

function displayTruckLoadingDetails() {
	$('#middle-border-boxshadow').removeClass("hide");
	
	setVehicleNumberAutocomplete();
	setDriverNameAutocomplete();
	setHamalLeaderAutoComplete();

	if(configuration.showVehicleAgentNameColumn){
		let vehicleAgentAutoComplete = new Object();
		vehicleAgentAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getVehicleAgentAutocomplete.do';
		vehicleAgentAutoComplete.primary_key = 'vehicleAgentMasterId';
		vehicleAgentAutoComplete.field = 'name';
		$("#vehicleAgentEle").autocompleteCustom(vehicleAgentAutoComplete);
	}
				
	if(configuration.showCollectionPerson)
		setSearchCollectionPersonAutoComplete();
	
	if(manualDDMWithAutoDDMSequence || (manualDDMWithManualDDMSequence || configuration.manualDDMWithoutSequence))
		changeDisplayProperty('ddmSequenceCounter', 'table-cell');
	
	showHidePanelForDDM(); 
	
	if($('#DestinationBranchId').exists() && $('#DestinationBranchId').is(":visible")) {
		let selectList = $("#DestinationBranchId");
		selectList.find("option:gt(0)").remove();
	}
	
	loadTruckDestinations('DestinationBranchId');
	
	if(isAllowToAddVehicleWhileDdmCreation) {
		var vehicleOwnerType 			= new Object();
		vehicleOwnerType.url			= WEB_SERVICE_URL+'/vehicleWS/getVehicleOwnerType.do';
		vehicleOwnerType.field			= 'vehicleOwnerType'; // response variable from WS
		vehicleOwnerType.primary_key	= 'vehicleOwner';
		$('#vehicleOwnerEle').autocompleteCustom(vehicleOwnerType);

		vehicleType.url					= WEB_SERVICE_URL+'/vehicleTypeWS/getVehicleType.do';
		vehicleType.field				= 'name'; // response variable from WS
		vehicleType.primary_key			= 'vehicleTypeId';
		$('#vehicleTypeEle').autocompleteCustom(vehicleType);

		vehicleAgent.url			= WEB_SERVICE_URL+'/vehicleAgentMasterWS/getVehicleAgentForDropDown.do';
		vehicleAgent.field			= 'name'; // response variable from WS
		vehicleAgent.primary_key	= 'vehicleAgentMasterId';
		$('#vehicleAgentEleWhileAddVehicle').autocompleteCustom(vehicleAgent);
	
		$('#newVehicleAgentSubmit').click(function() {
			saveNewVehicleAgent();
		});
		
		$('#newVehicleNumberSubmit').click(function() {
			saveNewVehicleDetails();
		});
		
		$('#newVehicleTypeSubmit').click(function() {
			saveNewVehicleType();
		});
	}
}

function setFocusOnLrDetails(){
	next = 'wayBills_2';
}

function showHidePanelForDDM() {
	if(!configuration.TruckNumber)
		$('#truckNumberDiv').remove();

	if(!configuration.DriverName)
		$('#DriverNameDetails').remove();
	
	if(!configuration.DriverNo)
		$('#driverMobileDetails').remove();
	
	if(!configuration.Remark)
		$('#RemarkDetails').remove();
	
	if(!configuration.LorryHire)
		$('#LorryHireDetails').remove();
	
	if(!configuration.Destination)
		$('#DestinationDetails').remove();
	
	if(!configuration.deliveryExecutiveName)
		$('#deliveryExecutiveDetail').remove();

	if(!configuration.deliveryExecutiveNumber)
		$('#deliveryExecutiveContact').remove();
	
	if(!configuration.TruckDestination)
		$('#TruckDestinationDetails').remove();
	
	if(!configuration.showCollectionPerson)
		$('#collectionPerson').remove();
		
	if(!configuration.showVehicleAgentNameColumn)
		$('#vehicleAgentDiv').remove();	
	
	if(!configuration.showLoaderNameField)
		$('#loaderNameField').remove();
	
	if(!configuration.showDeliveryMan1Field)
		$('#deliveryMan1Div').remove();
	
	if(!configuration.showDeliveryMan2Field)
		$('#deliveryMan2Div').remove();
		
	if(!configuration.showHamalLeaderSelection)
		$('#hamalTeamLeaderNameField').remove();
}

function goToManualSelection() {
	let chk = document.getElementById("isManualDDM");

	if(chk != null) {
		if(chk.checked && manualDDMWithAutoDDMSequence) {
			changeDisplayProperty('ddmDateSelection', 'table-cell');
			changeDisplayProperty('manualDDMDate', 'table-cell');
			document.getElementById("manualDDMDate").focus();
			setValueToTextField('manualDDMDate', getCurrentDate());
		} else if(chk.checked && (manualDDMWithManualDDMSequence || configuration.manualDDMWithoutSequence)) {
			changeDisplayProperty('ddmNumberSelection', 'table-cell');
			changeDisplayProperty('ddmNumberSelection', 'inline-block');
			changeDisplayProperty('manualDDMNumber', 'inline-block');
			changeDisplayProperty('ddmDateSelection', 'table-cell');
			changeDisplayProperty('manualDDMNumber', 'table-cell');
			changeDisplayProperty('manualDDMDate', 'table-cell');
			setValueToTextField('manualDDMDate', getCurrentDate());
			document.getElementById("manualDDMNumber").focus();
			changeDisplayProperty('ddmSequenceCounterRange', 'block');
			
			if(DoorDeliveryMemoSequenceCounter != undefined) {
				setValueToTextField('MaxRange', Number(DoorDeliveryMemoSequenceCounter.maxRange));
				setValueToTextField('MinRange', Number(DoorDeliveryMemoSequenceCounter.minRange));

				setValueToHtmlTag('ddmSequenceCounterRange', '[ ' + Number(DoorDeliveryMemoSequenceCounter.minRange) + ' - ' + Number(DoorDeliveryMemoSequenceCounter.maxRange) + ' ]');
			}
		} else {
			changeDisplayProperty('ddmNumberSelection', 'none');
			changeDisplayProperty('ddmDateSelection', 'none');
			changeDisplayProperty('ddmSequenceCounterRange', 'none');
			document.getElementById("manualDDMNumber").value='';
			changeDisplayProperty('msgbox', 'none');
		};
	};
}

function checkManualDDMRange(obj) {
	if(checkedManualDDM != obj.value){
		let reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
		let str = obj.value.replace(reg, '');
		
		if(obj.value && str.length > 0) {
			if(configuration.RangeCheckInManualDDM) {
				if(parseInt(obj.value) >= parseInt($("#MinRange").val()) && parseInt(obj.value) <= parseInt($("#MaxRange").val()) ){
					$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{ filter:32,manualDDMNumber:obj.value},function(data){
						if($.trim(data)=='true') {
							showMessage('info', ddmAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
							$('#manualDDMNumber').val('');
							$('#manualDDMNumber').focus();
						} else {
							//$("#msgbox").html('').removeClass();
						};
					});
				} else {
					showMessage('error', manualDDMWithinRngeErrMsg); //Defined in VariableForErrorMsg.js
					$('#manualDDMNumber').focus();
					$('#manualDDMNumber').val('');
				};
			} else {
				$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{ filter:32,manualDDMNumber:obj.value},function(data){
					if($.trim(data)=="true"){
						showMessage('info', ddmAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
						$('#manualDDMNumber').focus();
					}
				});
			}
		}

		checkedManualDDM = obj.value;
	}
}
function validateManualDDM(event) {
         let char = String.fromCharCode(event.which);
    if (configuration.allowAlphanumericInManualDDM) {
        let regex = /^[A-Za-z0-9]$/;
        return regex.test(char);
    }
    return /^\d$/.test(char);
}

function validateManualDDMSequence(tableId) {
	let tableEl = document.getElementById(tableId);
	let count 	= parseInt(tableEl.rows.length - 1);
	let chk 	= document.getElementById("isManualDDM");

	if(chk != null && chk.checked) {
		let manualDDMNumber 	= document.getElementById("manualDDMNumber");
		let manualDDMDate 		= document.getElementById("manualDDMDate");
		let manualDDMNumberVal 	= parseInt(manualDDMNumber.value,10);

		if(!validateManualDDMNumber(1, 'manualDDMNumber')) {
			setValueToTextField('manualDDMNumber', '');
			return false;
		}

		if(manualDDMDate.value.length <= 0 || manualDDMDate.value == 'DDM Date') {
			showMessage('error', manualDDMDateErrMsg);  //Defined in VariableForErrorMsg.js
			toogleElement('error', 'block');
			changeError1('manualDDMDate','0','0');
			return false;
		} else {
			for(var index = 1; index <= count; index++) {
				if(tableEl.rows[index].cells[0].firstElementChild) {
					let wayBillIdDis 	= tableEl.rows[index].cells[0].firstElementChild.value;
					let receivedDate 	= document.getElementById('wayBillReceivedDate_' + wayBillIdDis).value;
					let wayBillNumber 	= document.getElementById('wayBillNumber_' + wayBillIdDis).value;
					
					if(!chkDate(manualDDMDate.value, receivedDate, wayBillNumber))
						return false;
				}
			}
			
			let maxRange = parseInt(document.getElementById("MaxRange").value);
			let minRange = parseInt(document.getElementById("MinRange").value);
			
			if(configuration.RangeCheckInManualDDM && (manualDDMNumberVal < minRange || manualDDMNumberVal > maxRange)) {
				showMessage('error', manualDDMWithinRngeErrMsg); //Defined in VariableForErrorMsg.js
				$('#manualTURNumber').val('');
				toogleElement('selectError','block');
				changeError1('manualTURNumber','0','0');
				enableButtons();
				return false;
			}
			
			$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{
				filter:32,manualDDMNumber:manualDDMNumberVal},function(data) {
					let response = $.trim(data);
					
					if(response == 'true') {
						$('#manualDDMNumber').val('');
						showMessage('info', ddmAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
						toogleElement('selectError','block');
						changeError1('manualDDMNumber','0','0');
						manualDDMNumber.focus();
						enableButtons();
						return false;
					}
					
					toogleElement('selectError','none');
					removeError('manualDDMNumber');
			});
		}
	}
	
	return true;
}

function validateManualDDMDate(tableId) {
	let tableEl = document.getElementById(tableId);
	let count 	= parseInt(tableEl.rows.length - 1);
	let chk 	= document.getElementById("isManualDDM");

	if(chk != null && chk.checked) {
		let manualDDMDate 		= document.getElementById("manualDDMDate");

		if(manualDDMDate.value.length <= 0 || manualDDMDate.value == 'DDM Date') {
			showMessage('error', manualDDMDateErrMsg);  //Defined in VariableForErrorMsg.js
			toogleElement('error', 'block');
			changeError1('manualDDMDate','0','0');
			return false;
		} else {
			for(var index = 1; index <= count; index++) {
				if(tableEl.rows[index].cells[0].firstElementChild) {
					let wayBillIdDis 	= tableEl.rows[index].cells[0].firstElementChild.value;
					let receivedDate 	= document.getElementById('wayBillReceivedDate_' + wayBillIdDis).value;
					let wayBillNumber 	= document.getElementById('wayBillNumber_' + wayBillIdDis).value;

					if(!chkDate(manualDDMDate.value, receivedDate, wayBillNumber))
						return false;
				}
			}
		}
	}
	
	return true;
}

function chkDate(ddmDate, receivedDate, wayBillNumber) {
	if(isValidDate(ddmDate)) {
		let currentDate  	= new Date(curSystemDate);
		let previousDate 	= new Date(curSystemDate);
		let manualDDMDate 	= new Date(curSystemDate);
		let receivedLRDate 	= new Date(curSystemDate);
		let pastDaysAllowed = document.getElementById("manualDDMDaysAllowed").value;
		
		if(pastDaysAllowed == '0') {
			showMessage('warning', configureManualDDMDaysWarningMsg);
			toogleElement('selectError','block');
			changeError1('manualDDMDate','0','0');
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed, 10));
		previousDate.setHours(0, 0, 0, 0);

		let manualDDMDateParts 		= new String(ddmDate).split("-");

		manualDDMDate.setFullYear(parseInt(manualDDMDateParts[2], 10));
		manualDDMDate.setMonth(parseInt(manualDDMDateParts[1]-1, 10));
		manualDDMDate.setDate(parseInt(manualDDMDateParts[0], 10));
		
		let receiveDateParts 		= new String(receivedDate).split("-");
		receivedLRDate.setFullYear(parseInt(receiveDateParts[2], 10));
		receivedLRDate.setMonth(parseInt(receiveDateParts[1]-1, 10));
		receivedLRDate.setDate(parseInt(receiveDateParts[0], 10));
		
		if(receivedLRDate != null) {
			receivedLRDate.setHours(0,0,0,0);
			
			if(manualDDMDate.getTime() < receivedLRDate.getTime()) {
				showMessage('warning', 'DDM Date is earlier than Receive date Of LR Number ' +wayBillNumber+ ' not allowed !!');
				toogleElement('selectError','block');
				changeError1('manualDDMDate','0','0');
				return false;
			} else if(manualDDMDate.getTime() > currentDate.getTime()) {
				showMessage('error', futureDateNotAllowdErrMsg);
				toogleElement('selectError','block');
				changeError1('manualDDMDate','0','0');
				return false;
			} else if(manualDDMDate.getTime() > previousDate.getTime()) {
				toogleElement('selectError','none');
				removeError('manualDDMDate');
				return true;
			} else {
				showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
				toogleElement('selectError', 'block');
				changeError1('manualDDMDate','0','0');
				return false;
			}
		} else if(manualDDMDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			toogleElement('selectError','block');
			changeError1('manualDDMDate','0','0');
			return false;
		} else if(manualDDMDate.getTime() > previousDate.getTime()) {
			toogleElement('selectError','none');
			removeError('manualDDMDate');
			return true;
		} else {
			showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
			toogleElement('selectError','block');
			changeError1('manualDDMDate','0','0');
			return false;
		}
	} else {
		showMessage('error', validDateErrMsg);
		toogleElement('selectError','block');
		changeError1('manualDDMDate','0','0');
		return false;
	}
}

function validateManualDDMNumber(filter, elementID) {
	return validateInputTextFeild(filter, elementID, elementID, 'error', manualDDMErrMsg);
}
	
function showLoadingDetails () {
	$('#bottom-border-boxshadow').switchClass("show", "hide");
	$('#dispatchTableHeading').switchClass("visibility-visible", "visibility-hidden");
	$('#outboundresponse3').switchClass("visibility-visible", "visibility-hidden");
	$('#dispatchTable').switchClass("visibility-visible", "visibility-hidden");
	$('#middle-border-boxshadow').switchClass("show", "hide");
}

function lRAndSummaryDetailsDiv(){
	$('#lrDetailsTableDiv').switchClass("show", "hide");
	$('#summaryDiv').switchClass("show", "hide");
}

function hideLoadingDetails () {
	$('#bottom-border-boxshadow').switchClass("hide", "show");
	$('#dispatchTableHeading').switchClass("visibility-hidden", "visibility-visible");
	$('#outboundresponse3').switchClass("visibility-hidden", "visibility-visible");
	$('#dispatchTable').switchClass("visibility-hidden", "visibility-visible");
	$('#middle-border-boxshadow').switchClass("hide", "show");
}  

function isTruckLoadingDetailsExist () {
	return document.getElementById("vehicleNumber");
}

function resetDispatchTable () {
	$('#dispatchTable').find('tr').slice(1).remove();
}

function resetDispatchTableFeilds () {
	$('#totalNoOfWayBills').val(0);
	$('#totalNoOfPackages').val(0);
	$('#totalActualWeight').val(0);
	$('#totalNoOfForms').val(0);
}

function resetTruckDetails() {
	$('#loadingDetails').html('');
}

function resetDispatchDetails() {
	resetDispatchTable();
	resetDispatchTableFeilds();
	hideLoadingDetails();
}

function saveTripDetails(){ 
	
	$('#ravanaExpense').val($('#ravanaExpenseEle').val());
	$('#kilometerReading').val($('#kilometerReadingEle').val());
	$('#dieselRatePerLiter').val($('#dieselRatePerLiterEle').val());
	$('#dieselLiter').val($('#dieselLiterEle').val());
	$('#dieselLiterBy').val($('#dieselLiterByEle').val());
	$('#tripHisabRemark').val($('#tripHisabRemarkEle').val());
	
	if(tripHisabProperties.defaultDieselByBranch){
		$('#dieselLiterBy').val(defaultDieselBy);
	}
	
	$('#popUpContentOnVehicleNumber').modal('hide');
}

function setTripHisabDetails() {
	let vehicleType 		= document.getElementById('vehicleType').value;
	let vehicleOwnerIds		= tripHisabProperties.vehicleType;
	
	if(!vehicleOwnerIds.includes(vehicleType))
		return;
	
	$("#popUpContentOnVehicleNumber").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	setTimeout(function() {
		if(tripHisabProperties.dieselPerRateRequired)
			$('#dieselRatePerLiterTr').removeClass('hide');
		else
			$('#dieselRatePerLiterTr').addClass('hide');
		
		if(tripHisabProperties.defaultDieselByBranch) {
			$('#dieselLiterByTd').addClass('hide');
			$('#dieselLiterBySelectTd').addClass('hide');
		} else {
			$('#dieselLiterByTd').removeClass('hide');
			$('#dieselLiterBySelectTd').removeClass('hide');
		}
		
		$('#ravanaExpenseEle').focus();
		initialiseFocus();
	}, 500);
	
}

function setSearchCollectionPersonAutoComplete() {
	let branchId 		= $('#branch').val();
	
	$("#collectionPersonName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter=",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#collectionPersonId").val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setVehicleNumberAutocomplete() {
	$("#vehicleNumber").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=20",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id!=0){
				getVehicleDetails(ui.item.id);
				
				setTimeout(() => {
					if(tripHisabProperties.tripHisabDDMRequired){
						setTripHisabDetails();
					}
				}, 800);
			} else if(ui.item.id == "0" && isAllowToAddVehicleWhileDdmCreation) {
				createNewVehicle(this);
			} else if(ui.item.id == "0" && isAllowManualVehicle) {
				validateVehicleNumberOnBlur();
			} else {
	 			setLogoutIfEmpty(ui);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}
	
function setDriverNameAutocomplete() {
	$("#driverName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=28",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id > 0){
				getDriverDetails(ui.item.id);
			}
		},
		response: function(event, ui) {
		}
	});
}

function getDriverDetails(driverId){
	jsonObjectdata = new Object();
	jsonObjectdata.driverId = driverId; 
	jsonObjectdata.filter	= 3; 
	
	$('#driver1Insert').val(driverId);
	
	let jsonStr = JSON.stringify(jsonObjectdata);

	$.getJSON("Ajax.do?pageId=314&eventId=1",{json:jsonStr}, function(data) {
		let driverMaster 	= data.driverMaster;
		
		if(typeof driverMaster != 'undefined') {
			$('#driverMobileNumber').val(driverMaster.mobileNumber);
		}
	});
}

function loadTruckDestinations(id) {
	if(configuration.Destination) {
		let jsonObjectdata = new Object();
		jsonObjectdata.filter = 17; 
		let jsonStr = JSON.stringify(jsonObjectdata);

		$.getJSON("WayBillAjaxAction.do?pageId=9&eventId=16",
				{json:jsonStr}, function(data) {

					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', data.errorDescription);
						hideLayer();
					} else if(data.destinations) {
						let destinations	= data.destinations;

						if(destinations) {
							for (let key in destinations) {
								if (destinations.hasOwnProperty(key))
									createOption(id, key, destinations[key]);
							}

							sortDropDownList('DestinationBranchId');
								
							if(typeof defaultLogingInBranchInTruckDestination !== 'undefined' && defaultLogingInBranchInTruckDestination) {
								setTimeout(() => {
									$('#DestinationBranchId').val(executiveBranchId);
								}, 100);
							}
						}
					}
					
					hideLayer();
				});
	} else
		hideLayer();	
}

function setHamalLeaderAutoComplete() {
	var hamalLeaderAutoComplete 			= new Object();
	hamalLeaderAutoComplete.url 		= WEB_SERVICE_URL+'/autoCompleteWS/getHamalTeamLeaderAutocomplete.do?';
	hamalLeaderAutoComplete.primary_key = 'hamalMasterId';
	hamalLeaderAutoComplete.field 		= 'displayName';
	$("#hamalTeamLeaderNameEle").autocompleteCustom(hamalLeaderAutoComplete);
}