/**
 * @Anant Chaudhary
 */

var excessReceiveId	= 0;

function checkExcessNumberForUpdatePhoto() {
	
	var excessNumber	= $("#excessNumber").val();
	
	if(excessNumber == '') {
		showMessage('error', excessNumberErrMsg);
		return false;
	}
	
	showLayer();
	
	var	jsonObject = new Object();
	
	jsonObject.ExcessNumber	= excessNumber;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/excessReceiveWS/getExcessDetailsForUploadPhoto.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
				hideLayer();
				return;
			} else {
				var excessReceiveDetails	= data.excessReceive;
				var columnArray				= new Array();
				
				showPartOfPage('middle-border-boxshadow');
				removeTableRows('excessDetailsList', 'tbody');
				
				for(var i = 0; i < excessReceiveDetails.length; i++) {
					var obj	= excessReceiveDetails[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.weight + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.excessArticle + "</td>");						
					
					if(obj.photoUploaded) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><font size='5' color='red'>Photo Already Uploaded !</font></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' id='uploadPhoto_" + obj.excessReceiveId + "' class='btn btn-primary'>Upload Photo</button></td>");
					}
					
					$('#excessDetailsList tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					$("#uploadPhoto_" + obj.excessReceiveId).bind("click", function() {
						var elementId		= $(this).attr('id');
							excessReceiveId	= elementId.split('_')[1];
							
							openModel();
					});
				}
			}
			hideLayer();
		}
	});
}

function openModel() {
	$("#addPhotoModal").modal({
		backdrop: 'static',
	    keyboard: false
	});
	
	if(!validateFileTypeAndSize()) {
		return;
	}
}

function resetModel() {
	$('#shortphoto').val('');
	refreshAndHidePartOfPage('addPhotoModal', 'refresh');
}

var photo			= '';

function previewFile() {
	var file    = document.querySelector('input[type=file]').files[0];
	var reader  = new FileReader();

	reader.addEventListener("load", function () {
		photo = reader.result;
	}, false);

	reader.readAsDataURL(file);
}

function uploadExcessPhoto() {
	var jsonObjectNew 	= new Object();
	
	if($('#photo').val() == '') {
		showMessage('error', selectFileToUploadErrMsg);
		return false;
	}
	
	showLayer();
	
	previewFile();

	setTimeout(() => {
		jsonObjectNew["photo"] 				= photo;
		jsonObjectNew["excessReceiveId"] 	= excessReceiveId;
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/excessReceiveWS/updateExcessReceiveForPhotoUpload.do',
			data		: jsonObjectNew,
			dataType	: 'json',
			success: function(response) {
				if (response.message) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}

				resetModel();
				$('#addPhotoModal').modal('hide');
				
				hideLayer();
			}
		});
	}, 500);
}