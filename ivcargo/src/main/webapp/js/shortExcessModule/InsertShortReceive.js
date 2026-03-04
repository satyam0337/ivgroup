/**
 * Anant Chaudhary	13-10-2015
 */
var doneTheStuff = false;
var shortReceiveId	= 0;

function checkForTurBranch(){
	var turBranchId 				= $("#turBranchId").val();
	var executiveBranchId			= $("#executiveBranchId").val();
	
	if(turBranchId != executiveBranchId) {
		showMessage('info', turBranchAndExecutiveBranchSameInfoMsg);
		return false;
	}
	return true;
}

function insertShortReceive() {
	
	if(!shortReceiveFormValidation()) {return false;};
	//if(!checkForTurBranch()) {return false;};
	
	if(!validateTotalShortArt()) {return false;};
	
	var articleArray	= new Array();
	var jsonObjectData 	= new Object();
	
	var wayBillId							= $("#shortWayBillId").val();
	
	jsonObjectData.wayBillNumber			= $("#shortLrNumber").val();
	jsonObjectData.wayBillId				= wayBillId;
	jsonObjectData.lsNumber					= $("#shortLsNumber").val();
	jsonObjectData.dispatchLedgerId 		= $("#shortDispatchLedgerId").val();
	jsonObjectData.vehicleNumber			= $("#truckNumber").val();
	jsonObjectData.turNumber				= $("#shortTurNumber").val();
	jsonObjectData.vehicleMasterId			= $("#vehicleMasterId").val();
	jsonObjectData.actUnloadWeight			= $("#actUnloadWeight").val();
	jsonObjectData.privateMark				= $("#shortPrivateMark").val();
	jsonObjectData.shortWeight				= $("#shortWeight").val();
	jsonObjectData.amount					= $("#amount").val();
	jsonObjectData.remark					= $("#shortRemark").val();
	jsonObjectData.branchId					= $("#branchEle").val();
	jsonObjectData.executiveeleid			= $("#executiveEle").val();
	
	var count	= $("#shortArticleDetailsId tr").length;

	if(count > 0) {
		for(var i = 0; i < count; i++) {
			var articleData = new Object();
			
			var	shortArticalCount  = $('#shortArticle_' + wayBillId + '_' + [i + 1]).val();
			
			if(shortArticalCount > 0) {
				articleData.wayBillNumber 			= $("#shortLrNumber").val();
				articleData.wayBillId				= wayBillId;
				articleData.articleType 			= $('#shortArticleType_' + wayBillId + '_' + [i + 1]).val();
				articleData.articleTypeMasterId		= $('#shortPackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
				articleData.totalArticle			= $('#totalShortArticle_' + wayBillId + '_' + [i + 1]).val();
				articleData.shortArticle			= $('#shortArticle_' + wayBillId + '_' + [i + 1]).val();
				articleData.saidToContain			= $('#shortSaidToContain_' + wayBillId + '_' + [i + 1]).val();
				articleData.consignmentDetailsId	= $('#shortConsignmentDetailsId_' + wayBillId + '_' + [i + 1]).val();
				
				articleArray.push(articleData);
			}
		}
	}
	
	jsonObjectData.ArticleArray				= JSON.stringify(articleArray);
	
	if(!doneTheStuff) {
		doneTheStuff = true;
		changeDisplayProperty('saveButton', 'none');
	$.confirm({
		text: "Are you sure you want to save short LR entry ?",
		confirm: function() {
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/shortReceiveWS/saveShortReceiveData.do',
				data		:	jsonObjectData,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if(errorMessage.typeName == 'success') {
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							setTimeout(() => {
								resetInputFieldData();
							}, 200);
						}
						
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			doneTheStuff = false;
			changeDisplayProperty('saveButton', 'block');
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
	}
}

function checkShortNumberForUpdatePhoto() {
	var jsonObject	= new Object();
	
	if(!validateInputTextFeild(1, 'shortNumber', 'shortNumber', 'error', shortNumberErrMsg)) {
		return false;
	}
	
	jsonObject.ShortNumber	= $('#shortNumber').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/shortReceiveWS/getShortDetailsForUploadPhoto.do',
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
				var shortReceiveDetails	= data.ShortReceiveDetails;
				var columnArray			= new Array();
				
				showPartOfPage('middle-border-boxshadow');
				removeTableRows('shortDetailsList', 'tbody');
				
				for(var i = 0; i < shortReceiveDetails.length; i++) {
					var obj	= shortReceiveDetails[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.shortWeight + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.actUnloadWeight + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.amount + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalArticle + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.shortArticle + "</td>");
					
					if(obj.photoUploaded) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><font size='5' color='red'>Photo Already Uploaded !</font></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' id='uploadPhoto_" + obj.shortReceiveId + "' class='btn btn-primary'>Upload Photo</button></td>");
					}
					
					$('#shortDetailsList tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					$("#uploadPhoto_" + obj.shortReceiveId).bind("click", function() {
						var elementId		= $(this).attr('id');
							shortReceiveId	= elementId.split('_')[1];
							
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

function uploadShortPhoto() {
	var jsonObjectNew 	= new Object();
	
	if($('#photo').val() == '') {
		showMessage('error', selectFileToUploadErrMsg);
		return false;
	}
	
	showLayer();
	
	previewFile();
	
	setTimeout(() => {
		jsonObjectNew["photo"] 			= photo;
		jsonObjectNew["shortReceiveId"] = shortReceiveId;
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/shortReceiveWS/uploadShortReceivePhoto.do',
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