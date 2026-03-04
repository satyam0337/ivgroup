var driverMasterList;
function hideAjaxLoader () {
	$('#dispatchButton').switchClass("visibility-hidden", "visibility-visible");
}

function showAjaxLoader () {
	$('#dispatchButton').switchClass("visibility-visible", "visibility-hidden");
}

function getVehicleDetails(vehicleNoId) {
	let jsonObjectdata = new Object();
	jsonObjectdata.filter 		= 16; 
	jsonObjectdata.vehicleNoId 	= vehicleNoId; 
	
	let jsonStr = JSON.stringify(jsonObjectdata);
	
	$.getJSON("WayBillAjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					$("#vehicleTypeDetails").html('');
					$('#selectedVehicleNumberMasterId').val(0);
					$('#vehicleAgent').val(0);
					$('#vehicleType').val(0);
					$('#VehicleAgent_primary_key').val(0);
					$("#vehicleAgentEle").val('');
					$('#vehicleTypeDetailsDiv').addClass('hide');
					
					if(configuration.vehicleDriverMappingAllowed) {
						$('#driverName').removeClass('hide');
						$('#driverNameSelect').addClass('hide');
						$('#driverMobileNumber').val("");
						$('#driverName').val("");
						$('#driver1Insert').val(0);
					}
					hideLayer();
				} else {
					let vehicleNumberMaster = null;
					let vehicleOwnerForUser	= "";
					let vehicleType			= null;
					let vehicleAgentMaster	= null;
					let vehicleTypeName		= "";
					let vehicleCapacity		= "";
					let vehicleAgentName	= "";
					
					if(data.vehicleNumberMaster) {
						vehicleNumberMaster = data.vehicleNumberMaster;
						document.getElementById('selectedVehicleNumberMasterId').value 	= vehicleNumberMaster.vehicleNumberMasterId;
						document.getElementById('vehicleAgent').value 					= vehicleNumberMaster.vehicleAgentMasterId;
						document.getElementById('vehicleType').value 					= vehicleNumberMaster.vehicleOwner;
						isAllDDMSettled  = data.isAllDDMSettled;
						tripSheet       = data.tripSheet;	
						validateTripSheet = data.validateTripSheet;
						
						if(validateTripSheet){
							if(tripSheet == null || typeof tripSheet == 'undefined' || tripSheet == undefined) {
								showMessage('error', 'Trip Sheet is not created for this Vehicle, First Create Trip sheet in FLEETOP');
								$('#vehicleNumber').focus();
							}
					    }
						
						if(configuration.hideLorryHireFieldForOwnVehicle) {
							if(vehicleNumberMaster.vehicleOwner == HIRED_VEHICLE_ID) {
								document.getElementById('LorryHireDetails').style.visibility = 'visible';
								setLorryHire();
							} else {
								document.getElementById('LorryHireDetails').style.visibility = 'hidden';
								$('#ddmLorryHire').val(0);
							}
						}
						
						$("#VehicleAgent_primary_key").val(vehicleNumberMaster.vehicleAgentMasterId);
						$("#vehicleAgentEle").val(vehicleNumberMaster.vehicleAgentName);
					}
					
					if(data.vehicleOwnerForUser)
						vehicleOwnerForUser = data.vehicleOwnerForUser;
					
					if(data.vehicleType) {
						vehicleType 	= data.vehicleType;
						
						if(vehicleType.name)
							vehicleTypeName	= vehicleType.name;
							
						if(vehicleType.capacity)
							vehicleCapacity = Math.round(vehicleType.capacity);
					}
					
					if(data.vehicleAgentMaster) {
						vehicleAgentMaster 	= data.vehicleAgentMaster;
						
						if(vehicleAgentMaster.name)
							vehicleAgentName	= vehicleAgentMaster.name;
					}
					
					document.getElementById("vehicleTypeDetails").innerHTML = '<B>'+vehicleOwnerForUser+' - '+vehicleTypeName+' ( '+vehicleCapacity+' ) - '+vehicleAgentName+'</B>';
					$('#vehicleTypeDetailsDiv').removeClass('hide');
										
					if (configuration.showOTPCheckBoxAtDDMCreate)
						hideShowOTPSelection();
					
					if(configuration.vehicleDriverMappingAllowed) {
						let jsonObjectdata = new Object();
						jsonObjectdata.vehicleNumberMasterId 	= vehicleNoId; 
						
						$.ajax({
							type		: "POST",
							url			: WEB_SERVICE_URL+'/dispatchWs/getAssignedDriverDetailsForDispatch.do',
							data		: jsonObjectdata,
							dataType	: 'json',
							success: function(data) {
								console.log('data ',data)
								
								if(data.driverMasterList.length == 1) {
									let driverMaster = data.driverMasterList[0];
									$('#driver1Insert').val(driverMaster.driverMasterId);
									$('#driverName').val(driverMaster.driverName);
									$('#driverMobileNumber').val(driverMaster.mobileNumber);
								} else if(data.driverMasterList.length > 1){
									$('#driverName').addClass('hide');
									$('#driverNameSelect').removeClass('hide');
									$('#driverNameSelect').append($("<option>").attr('value', 0).text('Select Driver'));
									
									driverMasterList = data.driverMasterList;
									
									$(driverMasterList).each(function() {
										$('#driverNameSelect').append($("<option>").attr('value', this.driverMasterId).text(this.driverName));
									});
								} else {
									$('#driverName').removeClass('hide');
									$('#driverNameSelect').addClass('hide');
									$('#driverMobileNumber').val("");
									$('#driverName').val("");
									$('#driver1Insert').val(0);
								}
							}
						});
					}
					
					if (configuration.validatePendingDDMSettlementWithinDateByVehicleNumber)
						checkDdmOnVehicleNumber(vehicleNoId);
				}

				hideLayer();
			});
}

function setSelectedDriver(ele) {
	let elementId = ele.value;
	
	if(driverMasterList != undefined && driverMasterList.length > 1) {
		for(const element of driverMasterList) {
			if(element.driverMasterId == elementId) {
				$('#driverMobileNumber').val(element.mobileNumber);
				$('#driver1Insert').val(element.driverMasterId);
				$('#driverName').val(element.driverName);
			}
		}
	}
}

function validateVehicleNumberOnBlur() {
	let truckNumber	= $("#vehicleNumber").val().trim();
	let pattern 	= /^(?:[a-zA-z]{2}[0-9]{2}[a-zA-z]{1,2}[0-9]{4}|[a-zA-z]{2}[ -][0-9]{2}[ -][a-zA-z]{1,2}[ -][0-9]{4})$/;

	if(truckNumber != undefined && truckNumber != ''){
		if (truckNumber.match(pattern) || truckNumber.toUpperCase().includes("OTH")){
			setTimeout(() => {
				//mh 12 bj 1780
				$("#vehicleNumber").val(truckNumber.toUpperCase());
				$('#selectedVehicleNumberMasterId').val(0);
			}, 200);
			return true;
		} else {
			$("#vehicleNumber").focus();
			$("#vehicleNumber").val("");
			$('#selectedVehicleNumberMasterId').val(0);
			showMessage('error', " Vehicle Number "+ truckNumber +" is Invalid !");	
			return false;
		}						
	}
}

function checkDdmOnVehicleNumber(vehicleNoId) {
	let jsonObjectdata = new Object();
	jsonObjectdata.vehicleNumberMasterId = vehicleNoId;

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/deliveryRunsheetWS/checkDdmSettlementForCreateNewDdmOnVehicleNumber.do',
		data: jsonObjectdata,
		dataType: 'json',
		success: function(data) {
			if(data.ddmNumber != null && data.ddmNumber != undefined) {
				showMessage('error', "This DDM No '" + data.ddmNumber + "' is not Settled for the selected vehicle. Please settle the DDM first.");
				$('#vehicleNumber').val('');
				$('#selectedVehicleNumberMasterId').val('');
				$('#vehicleTypeDetails').val('');				
				$('#vehicleTypeDetailsDiv').addClass('hide');				
				$('#vehicleAgentEle').val('');
				$('#VehicleAgent_primary_key').val('');
				return false;
			}			
		}
	});
}
