/**
 * @Author Ashish Tiwari 13-07-2016
 */
 
function chkForDuplicateLR(rowNo,checkLrNumberAgentWise) {

	var date = document.getElementById('LRDate_'+rowNo);
	var crossingAgentId = $("#crossingAgentId").val();
	var crossingAgentCode = $("#crossingAgentCode").val();

	var jsonObject		= new Object();
	if(!crossingAgentCode === "null"){
		jsonObject.lrNumberManual	= crossingAgentCode+$("#LRNumber_"+rowNo).val();
	}else{
		jsonObject.lrNumberManual	= $("#LRNumber_"+rowNo).val();
	}

	jsonObject.lrDateManual		= $("#LRDate_"+rowNo).val();
	jsonObject.crossingAgentId	= crossingAgentId;
	jsonObject.isDummyLR		= false;
	if(checkLrNumberAgentWise == 'true'){
		if(crossingAgentId > 0){
			jsonObject.filter			= 4;
		}else{
			jsonObject.filter			= 3;
		}
	}else {
		jsonObject.filter			= 3;
	}

	var jsonStr = JSON.stringify(jsonObject);
	
	if(date.value != '' && chkDate(date.id)) {
		if(enterManualNumber(rowNo)) {
//			code to be Write
			$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
					{json:jsonStr}, function(data) {
						console.log(data);
						if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							
							document.getElementById("save").disabled = true ;
							document.getElementById("addRow").disabled = true ;
							showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				 			toogleElement('error','block');
				 			changeError1('LRNumber_'+rowNo,'0','0');
						}else {
							document.getElementById("save").disabled = false ;
							document.getElementById("addRow").disabled = false ;
							toogleElement('error','none');
							removeError('LRNumber_'+rowNo);
							if(chkForDuplicateLrInTable($("#LRNumber_"+rowNo).val(),rowNo)) {
								return true;
							}
						}
					});
		}
	}
	return false;
}

function enterManualNumber(rowNo) {
	var manualLRNumber = document.getElementById("LRNumber_"+rowNo);
	var manualLRNumberVal = parseInt(manualLRNumber.value,10);
	if(manualLRNumber.value == '' || manualLRNumber.value == '0'){
		document.getElementById("LRNumber_"+rowNo).value = '';
		showSpecificErrors('error',"Please Enter Manual LR Number !!");
		toogleElement('error','block');
		changeError1("LRNumber_"+rowNo,'0','0');
		return false;
	}
	return true;
}

function validateFormDetails() {
	if(!validateLSBasicDetails()) return false;
	
	var isValid	= true;
	var wayBillNos 		= new Array();
	
	$('#mainTable tbody tr').each(function(row, tr) {
		$(tr).find('input, select').each(function() {
			var inputId		= $(this).attr("id");
			var inputValue	= $(this).val();
			
			var first		= inputId.split('_')[0];
			var second		= inputId.split('_')[1];
			
			if(first == 'LRType' && inputValue <= 0) {
				showMessage('error', 'Please, Select LR Type !');
				changeError1(inputId, '0', '0');
				isValid	= false;
				return false;
			}
			
			if(first == 'LRNumber' && !validateElement(inputId)) {
				isValid	= false;
				return false;
			}
			
			if(first == 'LRDate' && (!vaildateLRDate(inputId) || !chkFutureDate(inputId) 
										|| !chkDate(inputId) || !chkManualDaysAllowForLR(inputId))) {
				isValid	= false;
				return false;
			}
				
			if(first == 'consignorName' && !validateElement(inputId)) {
				isValid	= false;
				return false;
			}
				
			if(first == 'billingPartyName' && $('#LRType_' + second).val() == WAYBILL_TYPE_CREDIT 
					&& (!validateElement(inputId) || !validateHiddenValue('billingPartyId_' + second, 'billingPartyName_' + second, 'Invalid Billing Party Name please enter again !'))) {
				isValid	= false;
				return false;
			}
				
			if(first == 'consigneeName' && !validateElement(inputId)) {
				isValid	= false;
				return false;
			}
				
			if(first == 'Source' && !validateLRSourceBranch(inputId, second)) {
				isValid	= false;
				return false;
			}
				
			if(first == 'Destination' && !validateLRDestinationBranch(inputId, second)) {
				isValid	= false;
				return false;
			}
			
			if(first == 'quantity' && inputValue <= 0) {
				showMessage('error', 'Please, Enter Quantity !');
				changeError1(inputId, '0', '0');
				isValid	= false;
				return false;
			}
			
			if(first == 'packingType' && inputValue <= 0) {
				showMessage('error', 'Please, Select Packing Type !');
				changeError1(inputId, '', '');
				isValid	= false;
				return false;
			}
				
			if($('#isAgent').is(':checked') && (first == 'declaredValue' || first == 'ewaybillNumber')) {
				var declaredValue 	= parseInt($('#declaredValue_' + second).val());
				var ewayBillNo		= $('#ewaybillNumber_' + second).val();
								
				if(declaredValue <= 0) {
					showMessage('error', 'Please Enter Declared Value !'); 
					changeError1('declaredValue_' + second, '0', '0');
					isValid	= false;
					return false;
				}
								
				if(declaredValue >= 50000 && ewayBillNo == '') {
					showMessage('error', 'Please Enter EwayBill Number !'); 
					changeError1('ewaybillNumber_' + second, '0', '0');
					isValid	= false;
					return false;
				}
			}
			
			if(first == 'amount' && $('#LRType_' + second).val() != WAYBILL_TYPE_FOC && !validateElement(inputId)) {
				isValid	= false;
				return false;
			}
	    });
	});
	
	return isValid;
}

function validateLRSourceBranch(inputId, second) {
	if(!validateHiddenValue('LSDestinationBranchId', 'LSDestination','Please enter valid LS Destination Branch first !')) return false;
				
	if($('#LRSourceBranchId_' + second).val() <= 0) {
		showMessage('error', 'Invalid Source Branch please enter again !');
		changeError1('Source_' + second, '0', '0');
		return false;
	}
				
	var lsDestBranchId 		= $('#LSDestinationBranchId').val();
	var lrSourceBranchId 	= $('#LRSourceBranchId_' + second).val();
	
	if(!$('#isAgent').is(':checked')) {
		if(lsDestBranchId == lrSourceBranchId) {
			showMessage('error', iconForErrMsg + ' ' + 'You can not enter LR Source Branch same as LS Destination Branch !');
			toogleElement('error', 'block');
			changeError1(inputId, '0', '0');
			return false;
		} else {
			toogleElement('error', 'none');
			removeError(inputId);
		}
	}
		
	return true;
}

function validateLRDestinationBranch(inputId, second) {
	if(!validateHiddenValue('LSSourceBranchId', 'LSSource', 'Invalid Source Branch please enter again !')) return false;
	if(!validateHiddenValue('LRDestinationBranchId_' + second, 'Destination_' + second, 'Invalid Destination Branch please enter again !')) return false;

	var lsSrcBranchId 	= $('#LSSourceBranchId').val();
	var lrDestBranchId 	= $('#LRDestinationBranchId_' + second).val();
	
	if(lsSrcBranchId == lrDestBranchId) {
		showMessage('error', iconForErrMsg + ' You can not enter LR Destination Branch same as LS Source Branch !');
		toogleElement('error', 'block');
		changeError1(inputId, '0', '0');
		return false;
	}
	
	toogleElement('error', 'none');
	removeError(inputId);
	
	return true;
}

function validateLSBasicDetails() {
	var isAgentCheck = $('#isAgent').is(':checked');
	
	//alert(isAgentCheck.checked);
	if(isAgentCheck) {
		if(!validateElement('searchCrossingAgent')) return false;
		if(!validateHiddenValue('crossingAgentId', 'searchCrossingAgent', 'Invalid Crossing Agent please enter again !')) return false;
		//if(!validateElement('lsCrossingHire')) return false;
	}
	
	if(!validateElement('LSNumber')) return false;
	
	var lsNo = document.getElementById('LSNumber');
	
	if(isDuplicateLS && lsNo != null) {
		lsNo.focus();
		alert('LS Number : ' + lsNo.value + ' already exists !'); 
		return false;
	}
	
	if(!validateElement('LSDate')) return false;
	if(!chkDate('LSDate')) return false;
	
	if(!isAgentCheck) {
		if(!validateElement('LSVehicleNumber')) return false;
		if(!validateHiddenValue('LSVehicleNumberId', 'LSVehicleNumber', 'Invalid Truck Number please enter again !')) return false;
	}
	
	if(!validateElement('LSSource')) return false;
	
	if(!validateHiddenValue('LSSourceCityId', 'LSSource', 'Invalid Source Branch please enter again !')) return false;
	if(!validateHiddenValue('LSSourceBranchId', 'LSSource', 'Invalid Source Branch please enter again !')) return false;
	if(!validateElement('LSDestination')) return false;
	if(!validateHiddenValue('LSDestinationCityId', 'LSDestination', 'Invalid Destination Branch please enter again !')) return false;
	if(!validateHiddenValue('LSDestinationBranchId', 'LSDestination', 'Invalid Destination Branch please enter again !')) return false;
	
	if(!isAgentCheck) {
		if(!validateFromTo('LSSourceBranchId', 'LSDestinationBranchId', 'LSSource', 'LSDestination', 'Source Branch', 'Destination Branch')) return false;
	}
	
	return true;
}