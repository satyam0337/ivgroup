/**
 * 
 */
var idProofDataObject	= null;
var idProofDataObject1	= null;
var idProofDataObject2	= null;
var idProofPartyType	= 0;
var uploadPdfInPod		= false;

function openIdProofModel(partyType) {
	$("#idProofModal").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	$('#idLable').empty();
	$('#idProofSelection').empty();
	
	if(typeof isVehicleMasterIdProof != 'undefined' && isVehicleMasterIdProof) {
		$('#personNameRow').hide();
		$('#contactNumberRow').hide();
	} else {
		$('#personNameRow').show();
		$('#contactNumberRow').show();
	}
	
	for(var i = 0; i < idProofConstantArr.length; i++) {
		var idProofId	= idProofConstantArr[i].idProofId;
		var idProofName	= idProofConstantArr[i].idProofName;
		
		if(typeof isVehicleMasterIdProof !== 'undefined' && isVehicleMasterIdProof) {
			if(typeof isPanCardExists !== 'undefined' && isPanCardExists && idProofId == ID_PROOF_PAN_CARD) {
				$('#panCardExistsRow').show();
				
				if(displayMsg != undefined && displayMsg != 'undefined' && displayMsg != null)
					$('#displayMsgLabel').html(displayMsg);
				
				$('#viewVehDocsBtn').click(function() {
					showIDProofPhoto(moduleId);
				});
			} else if(typeof isPanCardExists !== 'undefined' && isPanCardExists && idProofId != ID_PROOF_PAN_CARD) {
				var li			= $('<ul style="height: 30px;padding-top : 10px"><li style="width: 120px;"><b>' + idProofName + '</b></li></ul>');
				$(li).appendTo('#idLable');
						
				var li1			= $('<ul><li id="idProofCheckBox" style="width: 15px;margin-right:10px;"> <input type="checkbox" id="idProofId_' + idProofId + '" name="idProofId_' + idProofId + '"/></li><li><input type="text" class="form-control" id="cardNumber_' + idProofId + '" name="cardNumber_' + idProofId + '" placeholder="' + idProofName + ' Number" style="text-transform: uppercase;" maxlength = "9"/></li><li id="idProofTextBox" style="width: 200px;margin-left:10px;"><input type="file" id="photo_' + idProofId + '" name="photo_' + idProofId + '"/></li></ul>');
				$(li1).appendTo('#idProofSelection');
			} else if(typeof isRCBookExists !== 'undefined' && isRCBookExists && idProofId == ID_PROOF_RC_BOOK) {
				$('#panCardExistsRow').show();
				
				if((displayMsg != undefined || displayMsg != 'undefined') && displayMsg != null)
					$('#displayMsgLabel').html(displayMsg);
				
				$('#viewVehDocsBtn').click(function() {
					showIDProofPhoto(moduleId);
				});
			} else if(typeof isRCBookExists != 'undefined' && isRCBookExists && idProofId != ID_PROOF_RC_BOOK) {
				var li			= $('<ul style="height: 30px;padding-top : 10px"><li style="width: 120px;"><b>' + idProofName + '</b></li></ul>');
				$(li).appendTo('#idLable');
					
				var li1			= $('<ul><li id="idProofCheckBox" style="width: 15px;margin-right:10px;"> <input type="checkbox" id="idProofId_' + idProofId + '" name="idProofId_' + idProofId + '"/></li><li><input type="text" class="form-control" id="cardNumber_' + idProofId + '" name="cardNumber_' + idProofId + '" placeholder="' + idProofName + ' Number" style="text-transform: uppercase;"/></li><li id="idProofTextBox" style="width: 200px;margin-left:10px;"><input type="file" id="photo_' + idProofId + '" name="photo_' + idProofId + '"/></li></ul>');
				$(li1).appendTo('#idProofSelection');
			} else {
				$('#panCardExistsRow').hide();
				
				var li			= $('<ul style="height: 30px;padding-top : 10px"><li style="width: 120px;"><b>' + idProofName + '</b></li></ul>');
				$(li).appendTo('#idLable');
				
				var maxlength	= 20;
				
				if(idProofId == ID_PROOF_PAN_CARD)
					maxlength	= 10;
				else if(idProofId == ID_PROOF_RC_BOOK)
					maxlength	= 9;
				
				var li1			= $('<ul><li id="idProofCheckBox" style="width: 15px;margin-right:10px;"> <input type="checkbox" id="idProofId_' + idProofId + '" name="idProofId_' + idProofId + '"/></li><li><input type="text" class="form-control" maxlength="' + maxlength + '" id="cardNumber_' + idProofId + '" name="cardNumber_' + idProofId + '" placeholder="' + idProofName + ' Number" style="text-transform: uppercase;"/></li><li id="idProofTextBox" style="width: 200px;margin-left:10px;"><input type="file" id="photo_' + idProofId + '" name="photo_' + idProofId + '"/></li></ul>');
				$(li1).appendTo('#idProofSelection');
			}
		} else {
			var li			= $('<ul style="height: 30px;padding-top : 10px"><li style="width: 120px;"><b>' + idProofName + '</b></li></ul>');
			$(li).appendTo('#idLable');
				
			var li1			= $('<ul><li id="idProofCheckBox" style="width: 15px;margin-right:10px;"> <input type="checkbox" id="idProofId_' + idProofId + '" name="idProofId_' + idProofId + '"/></li><li><input type="text" class="form-control" id="cardNumber_' + idProofId + '" name="cardNumber_' + idProofId + '" placeholder="' + idProofName + ' Number" style="text-transform: uppercase;" maxlength="20"/></li><li id="idProofTextBox" style="width: 200px;margin-left:10px;"><input type="file" id="photo_' + idProofId + '" name="photo_' + idProofId + '"/></li></ul>');
			$(li1).appendTo('#idProofSelection');
		}
	}
	
	idProofPartyType	= partyType;
	
	setTimeout(() => {
		$('#personName').val($('#deliveredToName').val());
		$('#contactNumber').val($('#deliveredToPhoneNo').val());
		
		if(partyType == Number(1)) {
			$('#personName').val($('#consignorName').val());
			$('#contactNumber').val($('#consignorPhn').val());
		} else if(partyType == Number(2)) {
			$('#personName').val($('#consigneeName').val());
			$('#contactNumber').val($('#consigneePhn').val());
		}
	}, 200);
	
	if(!validateFileTypeAndSizeForMultiPhoto(idProofConstantArr.length, maxFileSizeToAllow, uploadPdfInPod))
		return;
}

function hideIdProofModel() {
	$('#idProofModal').modal('hide');
}

function previewFile() {
	var file    = document.querySelector('input[type=file]').files[0];
	var reader  = new FileReader();

	reader.addEventListener("load", function () {
		photo = reader.result;
	}, false);

	reader.readAsDataURL(file);
}

function addIDProofDetailsData() {
	if(!validateCardNumber())
		return false;
	
	idProofDataObject	= new Object();
	
	for(var i = 0; i < idProofConstantArr.length; i++) {
		var idProofId	= idProofConstantArr[i].idProofId;
		
		if($('#idProofId_' + idProofId).prop("checked")) {
			idProofDataObject[$('#idProofId_' + idProofId).attr('name')]	= $('#idProofId_' + idProofId).prop("checked");
			idProofDataObject[$('#cardNumber_' + idProofId).attr('name')]	= $('#cardNumber_' + idProofId).val();
		}
	}
	
	idProofDataObject.personName	= $('#personName').val();
	idProofDataObject.PhoneNumber	= $('#contactNumber').val();
	
	var $inputs = $('#idProofRow :input');
	//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
	$inputs.each(function () {
		if($(this).val() != "") {
			var fileName	= $(this).attr('name');

			if (this.files && this.files[0]) {
				var FR	= new FileReader();

				FR.addEventListener("load", function(e) {
					idProofDataObject[fileName] = e.target.result;
				}); 

				FR.readAsDataURL(this.files[0]);
			}
		}
	});
	
	if(idProofPartyType == 1)
		$('#storedIDProofDetails1 tr').empty();
	else if(idProofPartyType == 2)
		$('#storedIDProofDetails tr').empty();
	else
		$('#storedIDProofDetails tr').empty();
	
	setTimeout(() => {
		for(var i = 0; i < idProofConstantArr.length; i++) {
			var idProofId	= idProofConstantArr[i].idProofId;
			
			if(idProofPartyType == 1) {
				if(idProofDataObject['cardNumber_' + idProofId] != undefined) {
					$('<tr id="idProofDataTr1_' + idProofId + '">').appendTo('#storedIDProofDetails1');
					$('<td>' + idProofConstantArr[i].idProofName + '</td>').appendTo('#idProofDataTr1_' + idProofId);
					$('<td>' + (idProofDataObject['cardNumber_' + idProofId]).toUpperCase() + '</td>').appendTo('#idProofDataTr1_' + idProofId);
					
					if(idProofDataObject['photo_' + idProofId] != undefined)
						$('<td><img src="' + idProofDataObject['photo_' + idProofId] + '" style="height: 150px;" class="zoom"/></td>').appendTo('#idProofDataTr1_' + idProofId);
					else
						$('<td></td>').appendTo('#idProofDataTr1_' + idProofId);
					
					$('</tr>').appendTo('#storedIDProofDetails1');
				}
			} else if(idProofDataObject['cardNumber_' + idProofId] != undefined) {
				$('<tr id="idProofDataTr_' + idProofId + '">').appendTo('#storedIDProofDetails');
				$('<td>' + idProofConstantArr[i].idProofName + '</td>').appendTo('#idProofDataTr_' + idProofId);
				$('<td>' + (idProofDataObject['cardNumber_' + idProofId]).toUpperCase() + '</td>').appendTo('#idProofDataTr_' + idProofId);
					
				if(idProofDataObject['photo_' + idProofId] != undefined)
					$('<td><img src="' + idProofDataObject['photo_' + idProofId] + '" style="height: 150px;" class="zoom"/></td>').appendTo('#idProofDataTr_' + idProofId);
				else
					$('<td></td>').appendTo('#idProofDataTr_' + idProofId);
					
				$('</tr>').appendTo('#storedIDProofDetails');
			}
		}
		
		if(idProofPartyType == 1)
			idProofDataObject1	= idProofDataObject;
		else if(idProofPartyType == 2)
			idProofDataObject2	= idProofDataObject;
	}, 1000);
	
	hideIdProofModel();
}

function validateCardNumber() {
	var countIds	= 0;
	
	if(typeof isVehicleMasterIdProof == 'undefined' || !isVehicleMasterIdProof) {
		if(!validateInputTextFeild(1, 'personName', 'personName', 'error', 'Enter Person Name !'))
			return false;

		if(!validateInputTextFeild(1, 'contactNumber', 'contactNumber', 'error', 'Enter Contact Number !'))
			return false;
		
		if(!validateInputTextFeild(5, 'contactNumber', 'contactNumber', 'error', 'Enter 10 Digit Contact Number !'))
			return false;
		
		if(!validateInputTextFeild(2, 'contactNumber', 'contactNumber', 'error', 'Enter Valid Contact Number !'))
			return false;
	}
	
	for(var i = 0; i < idProofConstantArr.length; i++) {
		var idProofId	= idProofConstantArr[i].idProofId;
		
		if($('#idProofId_' + idProofId).prop("checked"))
			countIds++;
	}
	
	if(countIds == 0) {
		showMessage('error', 'Please, Select atleast 1 ID Proof !');
		return false;
	}
	
	for(var i = 0; i < idProofConstantArr.length; i++) {
		var idProofId	= idProofConstantArr[i].idProofId;
		
		if($('#idProofId_' + idProofId).prop("checked")) {
			if(!validateInputTextFeild(1, 'cardNumber_' + idProofId, 'cardNumber_' + idProofId, 'error', "Please, Enter Card Number !"))
				return false;
			
			if(idProofId == ID_PROOF_PAN_CARD
				&& !validateInputTextFeild(8, 'cardNumber_' + idProofId, 'cardNumber_' + idProofId, 'error', validPanNumberErrMsg))
				return false;
			
			if(idProofId == ID_PROOF_AADHAR_CARD
				&& !validateInputTextFeild(14, 'cardNumber_' + idProofId, 'cardNumber_' + idProofId, 'error', "Enter valid Aadhar Number !"))
				return false;
			
			/*if(!validateInputTextFeild(1, 'photo_' + idProofId, 'photo_' + idProofId, 'error', 'Select Photo !')) {
				return false;
			}*/
		}
	}
	
	return true;
}

function openAddedIDProofModal(partyType) {
	if(partyType == 1) {
		$("#addedIDProofModal1").modal({
			backdrop: 'static',
			keyboard: false
		});
	} else {
		$("#addedIDProofModal").modal({
			backdrop: 'static',
			keyboard: false
		});
	}
}