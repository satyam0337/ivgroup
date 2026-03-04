/**
 * 
 */
function searchLSToCreateLHPV(event) {
	if(event.which) { // Netscape/Firefox/Opera
		var keycode = event.which;
		if(keycode == 13) {
			hideInfo();
			getDetailsByLSNumber();
		};
	};
}

function getDetailsByLSNumber() {
	var jsonObject			= new Object();
	
	var lsNumber			= getValueFromInputField('lsNumber').trim();
	
	jsonObject.lsNumber		= lsNumber;
	jsonObject.filter		= 3;
	
	var jsonStr 			= JSON.stringify(jsonObject);
	var url =  "LHPVAjaxAction.do?pageId=228&eventId=3";
	
	showLayer();
	$.getJSON(url,{json:jsonStr}, function(data) {
		
		if(jQuery.isEmptyObject(data)) {
			showMessage('error', 'System could not process the request. Please contact on Support +91 8097000075.');
			hideLayer();
			return false;
		} else if(data.error != null) {
			//alert(data.error);
			showMessage('info', iconForInfoMsg + ' ' + data.error);
			hideLayer();
			return false;
		} else {
			hideLayer();
			setValueToTextField('lsNumber', '');
			
			var jsonArr 	= data.dispatchLedgerJsonArray;
			if(data.vehicle != undefined){
				vehicleTypeCapacity	= data.vehicle.vehicleTypeCapacity;
			}
			if(!checkSameLsNumber(lsNumber, jsonArr[0].dispatchLedgerId)) {return false;}
			if(!checkSameVehicleNumber(lsNumber, jsonArr[0].vehicleNumberMasterId)) {return false;}
			
			vehcileNumberArr.push({vehicleNumberId : jsonArr[0].vehicleNumberMasterId, vehicleNumber : jsonArr[0].vehicleNumber});
			dispatchLedgerArr.push(jsonArr[0].dispatchLedgerId);
			
			setTimeout(setDataForLHPV(data, lsNumber), 1000);
			$('#selectedVehicleNo').val(jsonArr[0].vehicleNumberMasterId);
		 
		 	if(isLhpvLockingAfterLsCreation == 'true'){
				$('#'+getParameterByName('dispatchLedgerId')).prop('checked', true);
				calculateAdvanceAmountfromTruckDlyLRTotal();
				calculateAmount();
				showFillingCriteria();
			}
		}	
	});
}

function checkSameLsNumber(lsNumber, newDispatchLedgerId) {

	if(dispatchLedgerArr != null) {
		if(dispatchLedgerArr.length > 0) {
			for(var i = 0; i < dispatchLedgerArr.length; i++) {
				if(newDispatchLedgerId == dispatchLedgerArr[i]) {
					showMessage('info', lsNumberAlreadyAddedInfoMsg(lsNumber));
					return false;
				}
			}
		}
	} 
	
	return true;
}

function checkSameVehicleNumber(lsNumber, vehicleNumberMasterId) {
	if(vehcileNumberArr != null) {
		if(vehcileNumberArr.length > 0) {
			for(var i = 0; i < vehcileNumberArr.length; i++) {
				if(vehicleNumberMasterId != vehcileNumberArr[i].vehicleNumberId) {
					showMessage('info', lsNumberSameInVehicleNumberInfoMsg(lsNumber, vehcileNumberArr[i].vehicleNumber));
					return false;
				}
			}
		}
	}
	
	return true;
}

function setDefaultDestination(data) {
	var jsonArr 	= data.dispatchLedgerJsonArray;
	
	var destinationBranchId			= jsonArr[0].destinationBranchId;
	var destinationSubRegionId		= jsonArr[0].destinationSubRegionId;
	var destinationBranchName 		= jsonArr[0].destinationBranch;
	
	operationOnSelectTag('DestinationSubBranchId', 'remove', '', destinationBranchId + '_' + destinationSubRegionId);
	operationOnSelectTag('BalancePayableSubBranchId', 'remove', '', destinationBranchId + '_' + destinationSubRegionId);
	operationOnSelectTag('DestinationSubBranchId', 'prepend', destinationBranchName, destinationBranchId + '_' + destinationSubRegionId);
	operationOnSelectTag('BalancePayableSubBranchId', 'prepend', destinationBranchName, destinationBranchId + '_' + destinationSubRegionId);
	operationOnSelectTag('DestinationSubBranchId', 'remove', '', 0);
	operationOnSelectTag('BalancePayableSubBranchId', 'remove', '', 0);
	
	setValueToTextField('DestinationBranchId', destinationBranchId);
	setValueToTextField('BalancePayableBranchId', destinationBranchId);
}