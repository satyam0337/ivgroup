/** 
 * Neha P. Mete [18-02-2025]
 */
function addEwayBilldetails() {
	
	$('#addEwayBillDetailModal').on('hidden.bs.modal', function () {
   	 	$('#ewayBillDetailsTable tr:not(:first)').remove();
    	$('#transpoterDetails').empty();
	});

	$("#addEwayBillDetailModal").modal({
		backdrop: 'static',
	    keyboard: false
	});

	let jsonObject			= new Object();

		jsonObject["crossingAgentId"]		= $('#selectedCrossingAgentId').val();
	
		showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/getTransporterDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if (data.success) {
				viewTransporterDetails(data.transporterDetailsList);
			} else if(data.message) {
				let message	= data.message;
				$('#viewTranspoterDetailsTable').html(message.typeSymble + ' ' + message.description);
			}
			
			hideLayer();
		}
	});
	
	hideLayer();

	$("#myModal").modal();
	
}

function addNewRow() {
    let inputCount = $("#ewayBillDetailsTable tr").length;

    for (let i = 0; i < inputCount; i++) {
        if (!validateTransporterDetailsFeilds(i)) return;
    }

    let lastRow = $("#ewayBillDetailsTable tr").last().clone();
    let oldId = Number(lastRow.attr('id').slice(-1));
    let newId = oldId + 1;

    if(isDuplicateStateCodeTransporterId(oldId)) {
        alert("This combination of State Code and Transporter ID already exists.");
        resetModel(oldId);
        return;
    }

    lastRow.attr('id', 'ewayBillDetails' + newId);
    lastRow.find('#stateCode' + oldId).attr('id', 'stateCode' + newId);
    lastRow.find('#transporterId' + oldId).attr('id', 'transporterId' + newId);
    lastRow.find('#userName' + oldId).attr('id', 'userName' + newId);
    lastRow.find('#userPassword' + oldId).attr('id', 'userPassword' + newId);

    $('#ewayBillDetailsTable').append(lastRow);
    $('#stateCode' + newId).val('');
    $('#transporterId' + newId).val('');
    $('#userName' + newId).val('');
    $('#userPassword' + newId).val('');

    $('#stateCode' + newId).focus();
}

function isDuplicateStateCodeTransporterId(currentRowId) {
    let stateCode = $('#stateCode' + currentRowId).val().trim();
    let transporterId = $('#transporterId' + currentRowId).val().trim();
	
	
    let matchFound = $("#viewTranspoterDetailsTable tbody tr").filter(function () {
        let existingStateCode = $(this).find("td:nth-child(1) input").val().trim();
        let existingTransporterId = $(this).find("td:nth-child(2) input").val().trim();
        return existingStateCode === stateCode && existingTransporterId === transporterId;
    }).length > 0;
    
    if (matchFound) {
        return true;
    }

    $("#ewayBillDetailsTable tr").each(function () {
        let rowId = $(this).attr("id").replace("ewayBillDetails", "").trim();
        
		if(Number(rowId)=== currentRowId)
			return;
        
        let existingStateCode = $('#stateCode' + rowId).val().trim();
        let existingTransporterId = $('#transporterId' + rowId).val().trim();

        if (existingStateCode === stateCode && existingTransporterId === transporterId) {
            matchFound = true;
            return false;
        }
    });
    
    return matchFound;
}


function removeTextValue() {
	let count = $('#ewayBillDetailsTable tr').length;
			
	if(count == 1) {
		showMessage('error', 'You cannot remove last row !');
		return;
	}
	
	let $last = $('#ewayBillDetailsTable').find("tr:last");
	$last.remove();
}

function addTransporterData() {
	let transporterDetailsArr	= new Array();	
	
	let inputCount = $("#ewayBillDetailsTable tr").length;
	
	for(let i = 0; i < inputCount; i++) {
		if(!validateTransporterDetailsFeilds(i))
			return;
			
		if(isDuplicateStateCodeTransporterId(i)) {
			alert("This combination of State Code and Transporter ID already exists.");
			resetModel(i);
			return;
		}
	}
	
	let i = 0;
	
	$("#ewayBillDetailsTable tr").each(function() {
		let ewayBillDetailsObj = {};
		
		ewayBillDetailsObj.idNum	= i+1;
		
		$(this).find("input, select").each(function() {
			const id	= $(this).attr("id");
			
			if(id == 'stateCode' + i)
				ewayBillDetailsObj.stateCode		= $(this).val();
				
			if(id == 'transporterId' + i)
				ewayBillDetailsObj.transporterId	= $(this).val();
						
			if(id == 'userName' + i)
				ewayBillDetailsObj.ewayBillPortalUserName		= $(this).val();
			
			if(id == 'userPassword' + i)
				ewayBillDetailsObj.ewayBillPortalPassword		= $(this).val();
			
			$(this).val('');
		});
		
		i++;

		transporterDetailsArr.push(ewayBillDetailsObj);
	});
		
	$('#addEwayBillDetailModal').modal('hide');

	var jsonObject = new Object();
				
	jsonObject.crossingAgentId = $('#selectedCrossingAgentId').val();

	if (transporterDetailsArr.length > 0) {
		jsonObject.transporterDetailsArr = JSON.stringify(transporterDetailsArr);
	
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/addTransporterDetails.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				hideLayer();
		
				if(data.message != undefined) {
					showMessage('error', data.message.description);
					toogleElement('error','block');
				}
			}
		});
	}
}

function resetModel(id) {
	$('#stateCode'+id).val('');
	$('#transporterId'+id).val('');
	$('#userName'+id).val('');
	$('#userPassword'+id).val('');
}

function viewTransporterDetails(transporterDetailsList) {
	$('#transpoterDetails').html("");

	setTimeout(function() {
		if(transporterDetailsList.length == 0) {
			$('#transpoterDetails').html('No records found !');
		}
		
	let lastRow = $("#ewayBillDetailsTable tr").last().clone();
    let oldId   = Number(lastRow.attr('id').slice(-1));
    resetModel(oldId);

		$('#viewTranspoterDetailsTable tbody').empty();
		
		let columnArray		= new Array();
		
		for (const element of transporterDetailsList) {
			let obj		= element;
						
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" +
		    "<input type='text' maxlength = '10' id='updateStateCode_" + obj.transporterDetailsId + "' value='" + obj.stateCode + "' readonly " +
		    "style='border: none; background: transparent; text-align: center; width: 100%;'>" +
		    "</td>");
		
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" +
			    "<input type='text' maxlength = '15' id='updateTransporterId_" + obj.transporterDetailsId + "' value='" + obj.transporterId + "' readonly " +
			    "style='border: none; background: transparent; text-align: center; width: 100%;'>" +
			    "</td>");
			
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" +
			    "<input type='text' maxlength = '30' id='updateEwayBillPortalUserName_" + obj.transporterDetailsId + "' value='" + obj.ewayBillPortalUserName + "' readonly " +
			    "style='border: none; background: transparent; text-align: center; width: 100%;'></td>");
			
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" +
			    "<input type='text' maxlength = '30' id='updateEwayBillPortalPassword_" + obj.transporterDetailsId + "' value='" + obj.ewayBillPortalPassword + "' readonly " +
			    "style='border: none; background: transparent; text-align: center; width: 100%;'></td>");

			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;' id='update1'>" +"<button class='btn btn-danger glyphicon glyphicon-pencil update-btn' type='button' " +
    		"onclick='updateTransporter(this, " + obj.transporterDetailsId + ");' " +"id='update_" + obj.transporterDetailsId + "'></button>" +"<button class='btn btn-success add-btn' onclick='saveUpdatedDetails(event, " + JSON.stringify(obj) + ");'" +
    		"$(\"#updateTransporterId_" + obj.transporterDetailsId + "\").val(), " + obj.transporterDetailsId + ");' " +"id='add_" + obj.transporterDetailsId + "' style='display:none;'> Add </button>" +
			"<button class='btn btn-secondary cancel-btn' id='cancel_" + obj.transporterDetailsId + "' style='display:none;' " + "onclick='cancelUpdate(event, " + obj.transporterDetailsId + ");'> Cancel </button>" +
   			"</td>");

			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'id='remove1" + obj.transporterDetailsId + "'" +"'>" + "<button class='btn btn-danger glyphicon glyphicon-remove' type='button' onclick='deleteTransporter("+ obj.transporterDetailsId +", this);' id='remove_" + obj.transporterDetailsId + "' value='Remove'>  </button></td>");

			$('#viewTranspoterDetailsTable tbody').append('<tr id="TransporterNumber' + obj.transporterDetailsId + '">' + columnArray.join(' ') + '</tr>');
			columnArray = []
		}
		
	},100);
}
function updateTransporter(el, transporterDetailsId){
	let row = $(event.target).closest('tr');
 	row.find('input[type="text"]').prop('readonly', false);
	el.style.display = "none";
	document.getElementById("add_" + transporterDetailsId).style.display = "inline-block";
    document.getElementById("cancel_"+ transporterDetailsId).style.display = "inline-block";
}

function validateFieldBeforeUpdate(id) {
	let stateCodeVal	 = $('#updateStateCode_' + id).val().trim();
    let transporterIdVal = $('#updateTransporterId_' + id).val().trim();
   	let userNameVal 	 = $('#updateEwayBillPortalUserName_' + id).val().trim();
   	let userPasswordVal  = $('#updateEwayBillPortalPassword_' + id).val().trim();

    if (stateCodeVal === '') {
        showMessage('error', 'Enter State Code');
        $('#updateStateCode_' + id).css('border-color', 'red').focus();
        return false;
    }
    
    if (transporterIdVal === '') {
        showMessage('error', '<i class="fa fa-times-circle"></i> Transporter Id Cannot be blank.');
        $('#updateTransporterId_' + id).css('border-color', 'red').focus();
        return false;
    }

    if (transporterIdVal.length !== 15) {
        showMessage('error', '<i class="fa fa-times-circle"></i> Enter 15-digit Transporter Number');
        $('#updateTransporterId_' + id).css('border-color', 'red').focus();
        return false;
    }

    if (userNameVal === '') {
        showMessage('error', 'Enter EwayBillPortal-Username');
        $('#updateEwayBillPortalUserName_' + id).css('border-color', 'red').focus();
        return false;
    }

    if (userPasswordVal === '') {
        showMessage('error', 'Enter EwayBillPortal-Password');
        $('#updateEwayBillPortalPassword_' + id).css('border-color', 'red').focus();
        return false;
    }

    return true;
}

function isDuplicateCheck(currentRowId) {
  	let stateCode	 = $('#updateStateCode_' + currentRowId).val().trim();
  	let transporterId = $('#updateTransporterId_' + currentRowId).val().trim();
	
    let matchFound = $("#viewTranspoterDetailsTable tbody tr").filter(function () {
        let existingStateCode = $(this).find("td:nth-child(1) input").val().trim();
        let existingTransporterId = $(this).find("td:nth-child(2) input").val().trim();
        return existingStateCode === stateCode && existingTransporterId === transporterId;
    }).length > 1;
    
    return matchFound;
}

function saveUpdatedDetails(event, obj) {
	event.preventDefault();

	let inputCount = $("#ewayBillDetailsTable tr").length;

	for (let i = 0; i < inputCount; i++) {
		resetModel(i);
	}

	let jsonObject = new Object();
	let transporterDetailsId = obj.transporterDetailsId;

	if(!validateFieldBeforeUpdate(transporterDetailsId))
		return;

	if(isDuplicateCheck(transporterDetailsId)) {
		alert("This combination of State Code and Transporter ID already exists.");
		return;
	}
	
	jsonObject["transporterDetailsId"]	 = transporterDetailsId;
	jsonObject["crossingAgentId"]		 = obj.crossingAgentId;
	jsonObject["stateCode"]			     = $('#updateStateCode_' + transporterDetailsId).val();
	jsonObject["transporterId"]			 = $('#updateTransporterId_' + transporterDetailsId).val();
	jsonObject["ewayBillPortalUserName"] = $('#updateEwayBillPortalUserName_' + transporterDetailsId).val();
	jsonObject["ewayBillPortalPassword"] = $('#updateEwayBillPortalPassword_' + transporterDetailsId).val();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/updateTransporterDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {
			if(response.message) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
				cancelUpdate(event, transporterDetailsId);

			hideLayer();
		}
	});
}

function cancelUpdate(event, transporterDetailsId) {
    event.preventDefault();
    if(!validateFieldBeforeUpdate(transporterDetailsId))
		return;
    document.getElementById("update_" + transporterDetailsId).style.display = "inline-block";
    document.getElementById("add_" + transporterDetailsId).style.display = "none";
    document.getElementById("cancel_" + transporterDetailsId).style.display = "none";
}


function deleteTransporter(el, obj) {
	deleteTrasporterData(el);
	$(obj).closest("tr").remove(); 
}

function deleteTrasporterData(transporterDetailsId) {
	let jsonObject		= new Object();

	jsonObject["transporterDetailsId"]	= transporterDetailsId;
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/deleteTransporterDetails.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {
			if (response.message) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}

			hideLayer();
		}
	});
}

function validateTransporterDetailsFeilds(i) {
    let stateCodeVal = $('#stateCode' + i).val().trim();
    let transporterIdVal = $('#transporterId' + i).val().trim();
    let userNameVal = $('#userName' + i).val().trim();
    let userPasswordVal = $('#userPassword' + i).val().trim();

    if (stateCodeVal === '') {
        showMessage('error', 'Enter State Code');
        $('#stateCode' + i).css('border-color', 'red').focus();
        return false;
    }
    
    if (transporterIdVal === '') {
        showMessage('error', '<i class="fa fa-times-circle"></i> Transporter Id Cannot be blank.');
        $('#transporterId' + i).css('border-color', 'red').focus();
        return false;
    }

    if (transporterIdVal.length !== 15) {
        showMessage('error', '<i class="fa fa-times-circle"></i> Enter 15-digit Transporter Number');
        $('#transporterId' + i).css('border-color', 'red').focus();
        return false;
    }

    if (userNameVal === '') {
        showMessage('error', 'Enter EwayBillPortal-Username');
        $('#userName' + i).css('border-color', 'red').focus();
        return false;
    }

    if (userPasswordVal === '') {
        showMessage('error', 'Enter EwayBillPortal-Password');
        $('#userPassword' + i).css('border-color', 'red').focus();
        return false;
    }

    return true;
}