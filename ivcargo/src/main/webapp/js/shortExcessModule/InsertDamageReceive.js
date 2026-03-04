/**
 * Shailesh Khandare	16-01-2016 
 */
var doneTheStuff = false;
var damageReceiveId	= 0;

function checkForTurBranch(){
	var turBranchId 				= $("#turBranchId").val();
	var executiveBranchId			= $("#executiveBranchId").val();
	
	if(turBranchId != executiveBranchId){
		showMessage('info', turBranchAndExecutiveBranchSameInfoMsg);
		return false;
	}
	return true;
}


function insertDamageReceive() {
	
	if(!damageReceiveFormValidation()) {return false;};
	//if(!checkForTurBranch()) {return false;};
	
	if(!validateTotalDamageArt()) {return false;};
	
	var articleArray	= new Array();
	var jsonObjectData 	= new Object();
	
	var wayBillId							= $('#damageWayBillId').val();
	
	jsonObjectData.wayBillNumber			= $('#damageLrNumber').val();
	jsonObjectData.wayBillId				= wayBillId;
	jsonObjectData.dispatchLedgerId 		= $('#damageDispatchLedgerId').val();
	jsonObjectData.turNumber				= $('#damageTurNumber').val();
	jsonObjectData.vehicleMasterId			= $('#damageVehicleMasterId').val();
	jsonObjectData.actUnloadWeight			= $('#damageActUnloadWeight').val();
	jsonObjectData.privateMark				= $('#damagePrivateMark').val();
	jsonObjectData.remark					= $('#damageRemark').val();
	
	var count	= $("#damageArticleDetailsId tr").length;

	if(count > 0) {
		for(var i = 0; i < count; i++) {
			var articleData = new Object();
			
			var	damageArticalCount	= $('#damageArticle_' + wayBillId + '_' + [i + 1]).val();
			
			if(damageArticalCount > 0) {
				articleData.wayBillNumber 			= $('#damageLrNumber').val();
				articleData.wayBillId 				= wayBillId;
				articleData.articleType 			= $('#damageArticleType_' + wayBillId + '_' + [i + 1]).val();
				articleData.articleTypeMasterId		= $('#damagePackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
				articleData.totalArticle			= $('#totalDamageArticle_' + wayBillId + '_' + [i + 1]).val();
				articleData.damageArticle			= $('#damageArticle_' + wayBillId + '_' + [i + 1]).val();
				articleData.saidToContain			= $('#damageSaidToContain_' + wayBillId + '_' + [i + 1]).val();
				articleData.consignmentDetailsId	= $('#damageConsignmentDetailsId_' + wayBillId + '_' + [i + 1]).val();
				
				articleArray.push(articleData);
			}
		}
	}
	
	jsonObjectData.ArticleArray				= JSON.stringify(articleArray);
	
	if(!doneTheStuff) {
		doneTheStuff = true;
		changeDisplayProperty('saveDamageButton', 'none');
	$.confirm({
		text: "Are you sure you want to save Damage LR entry ?",
		confirm: function() {
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/damageReceiveWS/saveDamageReceiveData.do',
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
			changeDisplayProperty('saveDamageButton', 'block');
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

function checkDamageNumberForUpdatePhoto() {
	var jsonObject	= new Object();
	
	if(!validateInputTextFeild(1, 'damageNumber', 'damageNumber', 'error', damageNumberErrMsg)) {
		return false;
	}
	
	jsonObject.DamageNumber	= $('#damageNumber').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/damageReceiveWS/getDamageDetailsForUploadPhoto.do',
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
				var damageReceiveDetails	= data.DamageReceive;
				var columnArray				= new Array();
				
				showPartOfPage('middle-border-boxshadow');
				removeTableRows('damageDetailsList', 'tbody');
				
				for(var i = 0; i < damageReceiveDetails.length; i++) {
					var obj	= damageReceiveDetails[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.actUnloadWeight + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.amount + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalArticle + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.damageArticle + "</td>");
					
					if(obj.photoUploaded) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><font size='5' color='red'>Photo Already Uploaded !</font></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' id='uploadPhoto_" + obj.damageReceiveId + "' class='btn btn-primary'>Upload Photo</button></td>");
					}
					
					$('#damageDetailsList tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					$("#uploadPhoto_" + obj.damageReceiveId).bind("click", function() {
						var elementId		= $(this).attr('id');
							damageReceiveId	= elementId.split('_')[1];
							
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

function uploadDamagePhoto() {
	var jsonObjectNew 	= new Object();
	
	if($('#photo').val() == '') {
		showMessage('error', selectFileToUploadErrMsg);
		return false;
	}
	
	showLayer();
	
	previewFile();

	setTimeout(() => {
		jsonObjectNew["photo"] 				= photo;
		jsonObjectNew["damageReceiveId"] 	= damageReceiveId;
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/damageReceiveWS/updateDamageReceiveForPhotoUpload.do',
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