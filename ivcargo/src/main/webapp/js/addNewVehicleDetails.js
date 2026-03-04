function createNewVehicle(obj) {
	$('.modal-backdrop').show();

	$('addNewVehicleDetailsDiv').addClass('show');
	$('addNewVehicleDetailsDiv').removeClass('hide');

	$('#vehicleOwnerEle').val("");
	$('#vehicleOwnerEle_primary_key').val("");  

	$('#vehicleTypeEle').val("");
	$('#vehicleTypeEle_primary_key').val("");  

	$('#vehicleAgentEleWhileAddVehicle').val("");
	$('#vehicleAgentEleWhileAddVehicle_primary_key').val("");  

	$("#regOwnerNameEle").val("");
	$("#regOwnerNameEle").attr("placeholder", "Enter Owner");
	
	$("#vehicleAgentPanNoEle").val("");
	$("#vehicleAgentPanNoEle").attr("placeholder", "Enter Pan Number");  
	
	$('#newVehicleNumberELe').val(obj.value);

	if(confirm("Vehicle does not exist, do you want to add?")){
		$('#addNewVehicleModal').addClass('show');
		$('#addNewVehicleModal').removeClass('hide');

		$("#addNewVehicleModal").modal({
			backdrop: 'static',
			focus	: this,
			keyboard: false
		});

		setTimeout(function() { 
			$("#newVehicleNumberELe").focus();
		}, 1000);
	} else {
		return false;
	}
}

function saveNewVehicleDetails() {
	if(!validateNewVehicleElements()) {
		return false;
	} else {
		var vehicleTypeId			= 	$('#vehicleTypeEle_primary_key').val();
		var vehicleAgentMasterId	= 	$('#vehicleAgentEleWhileAddVehicle_primary_key').val();

		var jsonObject	= new Object();
	
		jsonObject.vehicleNumber			=  $("#newVehicleNumberELe").val();
		jsonObject.vehicleOwner				=  $('#vehicleOwnerEle_primary_key').val();
		jsonObject.vehicleTypeId			=  vehicleTypeId;
		jsonObject.vehicleAgentMasterId		=  vehicleAgentMasterId;
		jsonObject.registeredOwner			=  $("#regOwnerNameEle").val();
		jsonObject.panNumber				=  $("#vehicleAgentPanNoEle").val();
		jsonObject.moduleId					=  CREATE_DDM;
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}

				if(data.vehicleNumberMasterId != undefined)
					$('#selectedVehicleNumberMasterId').val(data.vehicleNumberMasterId);

				if(data.vehicleNumber != undefined)
					$('#vehicleNumber').val(data.vehicleNumber);

				$('#vehicleType').val(vehicleTypeId);
				$('#vehicleAgent').val(vehicleAgentMasterId);
				
				if(data.vehicleNumberMasterId > 0) {
					$('.modal-backdrop').hide();
					$('#addNewVehicleModal').addClass('hide');
					$('#addNewVehicleModal').modal('hide');
					$('#addNewVehicleModal').removeClass('show');
					$('#vehicleNumber').focus();
				}
			}
		});
	}
}

function createNewVehicleType(obj) {
	var vehicleTypeEle	= $('#vehicleTypeEle').val();

	$('#newVehicleTypeEle').val(vehicleTypeEle);
	$("#vehicleCapacityEle").val("");
	$("#vehicleCapacityEle").attr("placeholder", "Enter Capacity");   
	
	if(confirm("Vehicle Type does not exist, Do you want to add?")){
		$('#addNewVehicleTypeModal').addClass('show');
		
		$("#addNewVehicleTypeModal").modal({
			backdrop: 'static',
			keyboard: false
		});

		setTimeout(function() { 
			$("#newVehicleTypeEle").focus();
		}, 200);
	} else {
		return false;
	}
}

function saveNewVehicleType() {
	var newVehicleTypeEle	= $('#newVehicleTypeEle').val();
	var vehicleCapacityEle	= $('#vehicleCapacityEle').val();

	if(newVehicleTypeEle.length <= 0) {
		showMessage('error',"Please Enter Vehicle Type");
		changeTextFieldColor('newVehicleTypeEle', '', '', 'red');
		next = "newVehicleTypeEle";
		return false;
	}

	if(vehicleCapacityEle.length <= 0) {
		showMessage('error',"Please Enter Capacity");
		changeTextFieldColor('vehicleCapacityEle', '', '', 'red');
		next = "vehicleCapacityEle";
		return false;
	}

	var jsonObject	= new Object();

	jsonObject.name					=  $("#newVehicleTypeEle").val();
	jsonObject.capacity				=  $("#vehicleCapacityEle").val();
	jsonObject.moduleId				=  CREATE_DDM;

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleTypeWS/saveVehicleType.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			if(data.vehicleTypeId != undefined)
				$('#vehicleTypeEle_primary_key').val(data.vehicleTypeId);

			if(data.name != undefined)
				$('#vehicleTypeEle').val(data.name);
			
			if(data.vehicleTypeId > 0) {
				$('#addNewVehicleTypeModal').addClass('hide');
				$('#addNewVehicleTypeModal').removeClass('show');
				$('#newVehicleNumberELe').focus();
			}
		}
	});
}

function createNewVehicleAgent(obj) {
	var vehicleAgentEle	= $("#vehicleAgentEle").val();

	$('#newVehicleAgentElement').val(vehicleAgentEle);
	$('#newVehicleAgentElement').focus();

	$("#newVehicleAgentEle").val("");
	$("#newVehicleAgentEle").attr("placeholder", "Enter Agent Name");   

	$("#vehicleAgentPanNoEle").val("");
	$("#vehicleAgentPanNoEle").attr("placeholder", "Enter Pan Number");

	$("#vehicleAgentAddEle").val("");
	$("#vehicleAgentAddEle").attr("placeholder", "Enter Address");

	if(confirm("Vehicle Agent does not exist, do you want to add?")){
		$('#addNewVehicleAgentModal').addClass('show');

		$("#addNewVehicleAgentModal").modal({
			modalId	: 'newVehicleAgentModal',
			backdrop: 'static',
			keyboard: false
		});

		setTimeout(function() { 
			$("#newVehicleAgentElement").focus();
		}, 1000);
	} else {
		return false;
	}
}

function saveNewVehicleAgent() {
	if(!validateNewVehicleAgentElements()) {
		return false;
	} else {
		var jsonObject	= new Object();

		jsonObject.vehicleAgentNameEle		=  $("#newVehicleAgentElement").val();
		jsonObject.vehicleAgentPanNoEle		=  $("#vehicleAgentPanNoEle").val();
		jsonObject.vehicleAgentAddressEle	=  $("#vehicleAgentAddEle").val();
		jsonObject.vehicleOwner				=  $('#vehicleOwnerEle_primary_key').val();
		jsonObject.moduleId					=  CREATE_DDM;

		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/vehicleAgentMasterWS/saveVehicleAgent.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}

				if(data.vehicleAgentMasterId != undefined) {
					$('#vehicleAgentEleWhileAddVehicle_primary_key').val(data.vehicleAgentMasterId);
					$('#vehicleAgentEle_primary_key').val(data.vehicleAgentMasterId);
				}

				if(data.name != undefined) {
					$('#vehicleAgentEleWhileAddVehicle').val(data.name);
					$('#vehicleAgentEle').val(data.name);
				}

				if(data.vehicleAgentMasterId > 0) {
					$('#addNewVehicleAgentModal').addClass('hide');
					$('#addNewVehicleAgentModal').removeClass('show');
					$("#newVehicleNumberELe").focus();
				}
			}
		});
	}
}

function validateNewVehicleElements() {
	var newVehicleNumber	= $('#newVehicleNumberELe').val();

	var reg 		 = null;

	if(configuration.isNewVehicleNumberValidate){
		if(newVehicleNumber.length == 12){
			reg = /[A-Za-z][A-Za-z][-][\d][\d][-][A-Za-z][-][\d][\d][\d][\d]/ig;
			//numberFormat = 'CC-DD-C-DDDD';
		} else if(newVehicleNumber.length == 8){
			reg = /[A-Za-z][A-Za-z][A-Za-z][-][\d][\d][\d][\d]/ig;
			//numberFormat = 'CCC-DDDD';
		}else if(newVehicleNumber.length == 7){
			reg = /[A-Za-z][A-Za-z][A-Za-z][-][\d][\d][\d]/ig;
			//numberFormat = 'CCC-DDD'; 
		} else {
			if(newVehicleNumber.length == 13){
				reg = /[A-Za-z][A-Za-z][-][\d][\d][-][A-Za-z][A-Za-z][-][\d][\d][\d][\d]/ig;
				//numberFormat = 'CC-DD-CC-DDDD';
			} else {
				showMessage('error',"Please Enter Valid Vehicle Number");
				changeTextFieldColor('newVehicleNumberELe', '', '', 'red');
				next = "newVehicleNumberELe";
				return false;
			}
		}
	}

	if(!newVehicleNumber.match(reg) && configuration.isNewVehicleNumberValidate){
		showMessage('error',"Please Enter Valid Vehicle Number");
		changeTextFieldColor('newVehicleNumberELe', '', '', 'red');
		next = "newVehicleNumberELe";
		return false;
	} else {
		var vehicleOwner	= $("#vehicleOwnerEle_primary_key").val();

		if(vehicleOwner == "") {
			showMessage('error',"Please Enter Vehicle Owner");
			changeTextFieldColor('vehicleOwnerEle', '', '', 'red');
			next = "vehicleOwnerEle";
			return false;
		}	

		var vehicleType 	= $("#vehicleTypeEle").val();
		var vehicleTypeId 	= $("#vehicleTypeEle_primary_key").val();

		if(vehicleType.length <= 0) {
			showMessage('error',"Please Enter Vehicle Type");
			changeTextFieldColor('vehicleTypeEle', '', '', 'red');
			next = "vehicleTypeEle";
			return false;
		} else if(vehicleType.length > 0 && vehicleTypeId == "") {
			var createNewVehicleTypeFlag = createNewVehicleType(this);
		} else if(vehicleTypeId > 0) {
			var vehicleAgent 	= $("#vehicleAgentEleWhileAddVehicle").val();
			var vehicleAgentId 	= $("#vehicleAgentEleWhileAddVehicle_primary_key").val();

			if(vehicleAgent.length == 0) {
				showMessage('error',"Please Enter Vehicle Agent");
				changeTextFieldColor('vehicleAgentEleWhileAddVehicle', '', '', 'red');
				next = "vehicleAgentEle";
				return false;
			} else if(vehicleAgent.length > 0 && (vehicleAgentId == "" || vehicleAgentId == undefined)) {
				var createNewVehicleAgentFlag  = createNewVehicleAgent(this);
			} else {
				var regOwner	= $("#regOwnerNameEle").val();

				if(regOwner.length <= 0) {
					showMessage('error',"Please Enter Reg. Owner");
					changeTextFieldColor('regOwnerNameEle', '', '', 'red');
					next = "regOwnerNameEle";
					return false;
				}
			}
		} else if(vehicleTypeId > 0 && vehicleAgentId > 0) {
			var regOwner	= $("#regOwnerNameEle").val();

			if(regOwner.length <= 0) {
				showMessage('error',"Please Enter Reg. Owner");
				changeTextFieldColor('regOwnerNameEle', '', '', 'red');
				next = "regOwnerNameEle";
				return false;
			}
		}
	}
	
	if(vehicleType.length > 0 && vehicleTypeId == "" && !createNewVehicleTypeFlag 
	|| vehicleAgent.length > 0 && vehicleAgentId == "" && !createNewVehicleAgentFlag)
		return;
	
	return true;
}

function validateNewVehicleAgentElements() {
	var newVehicleAgent	= $('#newVehicleAgentElement').val();
	
	if(newVehicleAgent.length <= 0) {
		showMessage('error',"Please Enter Vehicle Agent");
		changeTextFieldColor('newVehicleAgentElement', '', '', 'red');
		next = "newVehicleAgentElement";
		return false;
	}
	
	var vehicleAgentPan	= $('#vehicleAgentPanNoEle').val();
	
	if(vehicleAgentPan.length <= 0) {
		showMessage('error',"Please Enter Pan Number");
		changeTextFieldColor('vehicleAgentPanNoEle', '', '', 'red');
		next = "vehicleAgentPanNoEle";
		return false;
	}
	
	var vehicleAgentAdd	= $('#vehicleAgentAddEle').val();
	
	if(vehicleAgentAdd.length <= 0) {
		showMessage('error',"Please Enter Address");
		changeTextFieldColor('vehicleAgentAddEle', '', '', 'red');
		next = "vehicleAgentAddEle";
		return false;
	}

	return true;
}

function validateNewVehicleTypeElements() {
	var newVehicleType	= $('#newVehicleTypeEle').val();
	
	if(newVehicleType.length <= 0) {
		showMessage('error',"Please Enter Vehicle Owner");
		changeTextFieldColor('newVehicleTypeEle', '', '', 'red');
		next = "newVehicleTypeEle";
		return false;
	}
	
	var vehicleCapacity	= $('#vehicleCapacityEle').val();
	
	if(vehicleCapacity.length <= 0) {
		showMessage('error',"Please Enter Vehicle Capacity");
		changeTextFieldColor('vehicleCapacityEle', '', '', 'red');
		next = "vehicleCapacityEle";
		return false;
	}

	return true;
}