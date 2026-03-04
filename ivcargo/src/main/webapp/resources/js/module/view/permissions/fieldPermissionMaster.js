/**
 * Anant 26-Feb-2024 5:39:41 pm 2024
 */
let reportPermissionIds = '4,1347,4338';
let isSmsThroughIVCargo = false;
let isSmsFeaturesDisable = false;
let isWpThroughIVCargo = false;
let selectedPermissions = [];


function getConfigParamDetails (groupId){
	if(groupId == 0) {
		return false;
	}
	
	let jsonObject				= new Object();

	jsonObject["accountGroupId"]	= groupId;
	jsonObject["configKey"]			= 34;
	
	showLayer();

	$.ajax({
		url : WEB_SERVICE_URL+ '/configParamWS/getConfigParamValueByConfigKey.do',
		type : "POST",
		dataType : 'json',
		data : jsonObject,
		success : function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
				hideLayer();
			} else {
				$('#configParam').val(data.manualDaysConfigValue);
			}
		}
	});
}

function populateRegionsOnGroup(groupId, target) {
	if(groupId == 0) {
		resetCombo(target);
		return false;
	}
	
	let jsonObject				= new Object();

	jsonObject["bookedForAccountGroupId"]	= groupId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getRegionListByGroup.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let region	= data.region;
			
			if(typeof region == 'undefined' || region.length == 0) {
				showMessage('info', 'Region Not Found');
			}
			
			operationOnSelectTag('region', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('region', 'addNew', '---- Select  Region ----', 0); //function calling from genericfunction.js
			
			if(region != null && typeof region !== 'undefined') {
				for(const element of region) {
					operationOnSelectTag('region', 'addNew', element.regionName, element.regionId);
				} 
			}
			
			hideLayer();
		}
	});
}

function getAccountGroupDetails(groupId) {
	
	let jsonObject				= new Object();

	jsonObject["accountGroupId"]	= groupId;
	
	if(groupId == 0) {
		$('#activategroupCol').addClass('hide');
		$('#deactivateGroupCol').addClass('hide');
		$('#groupStatus').html('');
	}
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/accountGroupWS/getGroupDetailsById.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let ACTIVE			= data.ACTIVE;
			
			if(ACTIVE) {
				$('#deactivateGroupCol').removeClass('hide');
				$('#activategroupCol').addClass('hide');
				$('#groupStatus').removeClass('alert alert-danger col-xm-6');
				$('#groupStatus').addClass('alert alert-success col-xm-6');
				$('#groupStatus').html('Group is Active !');
			} else {
				$('#deactivateGroupCol').addClass('hide');
				$('#activategroupCol').removeClass('hide');
				$('#groupStatus').html('Group is DeActive !');
				$('#groupStatus').removeClass('alert alert-success col-xm-6');
				$('#groupStatus').addClass('alert alert-danger col-xm-6');
			}
			
			hideLayer();
		}
	});
}

function populateSubRegions(groupId, target) {
	let	stateId = groupId.options[groupId.selectedIndex].value;
	
	document.getElementById('Executive').options.length=1;;
	document.getElementById('Executive').options[0].text ='---Select Executive---';
	document.getElementById('Executive').options[0].value=0;
	document.getElementById('searchBranch').options.length=1;;
	document.getElementById('searchBranch').options[0].text ='------Select Branch  ----';
	document.getElementById('searchBranch').options[0].value=0;
	document.getElementById('subRegion').options.length=1;;
	document.getElementById('subRegion').options[0].text ='------Select SubRegion  ----';
	document.getElementById('subRegion').options[0].value=0;
	
	let jsonObject			= new Object();

	jsonObject["regionId"]	= stateId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionListByRegion.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let subRegion	= data.subRegion;
			
			if(typeof subRegion == 'undefined' || subRegion.length == 0) {
				showMessage('info', 'Sub-Region Not Found');
			}
			
			operationOnSelectTag('subRegion', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('subRegion', 'addNew', '---- Select  Sub-Region ----', 0); //function calling from genericfunction.js
			
			if(subRegion != null && typeof subRegion !== 'undefined') {
				for(const element of subRegion) {
					operationOnSelectTag('subRegion', 'addNew', element.subRegionName, element.subRegionId);
				} 
			}
			
			hideLayer();
		}
	});
}

function populateBranches(groupId, target) {
	let	stateId = groupId.options[groupId.selectedIndex].value;
	
	document.getElementById('Executive').options.length=1;;
	document.getElementById('Executive').options[0].text ='---Select Executive---';
	document.getElementById('Executive').options[0].value=0;
	document.getElementById('searchBranch').options.length=1;;
	document.getElementById('searchBranch').options[0].text ='------Select Branch  ----';
	document.getElementById('searchBranch').options[0].value=0;
	
	let jsonObject			= new Object();

	jsonObject["subRegionSelectEle_primary_key"]	= stateId;
	jsonObject.isDisplayDeActiveBranch				= false;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionBranches.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let sourceBranch	= data.sourceBranch;
			
			if(typeof sourceBranch == 'undefined' || sourceBranch.length == 0) {
				showMessage('info', 'Branch Not Found');
			}
			
			operationOnSelectTag('searchBranch', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('searchBranch', 'addNew', '---- Select Branch ----', 0); //function calling from genericfunction.js
			
			if(sourceBranch != null && typeof sourceBranch !== 'undefined') {
				for(const element of sourceBranch) {
					operationOnSelectTag('searchBranch', 'addNew', element.branchName, element.branchId);
				} 
			}
			
			hideLayer();
		}
	});
}

function populateExecutiveForBranch(groupId, displaySuperAdmin,displayOnlyActiveUsers) {
	let	stateId = groupId.options[groupId.selectedIndex].value;
	
	document.getElementById('Executive').options.length=1;;
	document.getElementById('Executive').options[0].text ='---Select Executive---';
	document.getElementById('Executive').options[0].value=0;
	
	let jsonObject			= new Object();

	if($('#accountGroupId').val() > 0) {
		jsonObject["bookedForAccountGroupId"]	= $('#accountGroupId').val();
	}
	
	jsonObject["sourceBranchId"]			= stateId;
	jsonObject["displaySuperAdmin"]			= true;
	jsonObject["displayOnlyActiveUsers"]	= true;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getExecutiveListByBranch.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let executiveList	= data.executiveList;
			
			operationOnSelectTag('Executive', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('Executive', 'addNew', '---- Select Executive ----', 0); //function calling from genericfunction.js
			
			if(executiveList != null && typeof executiveList !== 'undefined') {
				for(const element of executiveList) {
					operationOnSelectTag('Executive', 'addNew', element.executiveName, element.executiveId);
				} 
			}
			
			hideLayer();
		}
	});
}

function getExecutivePermissions(executiveId){
	$('input:checkbox').removeAttr('checked');
	executiveId =parseInt(executiveId); 
	
	if( executiveId <= 0){
		return false;
	} else {
		let jsonObject				= new Object();

		jsonObject["selectedExecutiveId"]	= executiveId;
		
		showLayer();
		
		$.ajax({
			url : WEB_SERVICE_URL+ '/feildPermissionMasterWS/getAllPermissionsByUser.do',
			type : "POST",
			dataType : 'json',
			data : jsonObject,
			success : function(data) {
				hideLayer();
					
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
					hideLayer();
				} else {
					let feildPermissionMaster	= data.feildPermissionMaster;

					for(const obj of feildPermissionMaster) {
						let element	= obj.permissionIdWithMenuGroup;

						let permissionChkbx = document.getElementById(element);
						if (permissionChkbx != null)
							document.getElementById(element).checked = true;
					}
				}
			}
		});
	}
}
	
function setExecutivePermission(checkBox) {
	let permissionKey		= checkBox.id;
	
	if(!validateRegion(1, 'region')) {
		checkBox.checked	= false;
		return false;
	}
	
	if(!validateSubRegion(1, 'subRegion')) {
		checkBox.checked	= false;
		return false;
	}
	
	if(!validateBranch(1, 'searchBranch')) {
		checkBox.checked	= false;
		return false;
	}
	
	if(!validateExecutive(1, 'Executive')) {
		checkBox.checked	= false;
		return false;
	}
	
	let jsonObject = new Object();

	jsonObject.permissionKey		= permissionKey;
	jsonObject.permissionFlag		= checkBox.checked;
	jsonObject.currentExecutiveId	= $('#Executive').val();
	
	if($('#accountGroupId').val() > 0) {
		jsonObject.accountGroupId			= $('#accountGroupId').val();
		jsonObject.isGroupPermssion			= $('#isGroupPermssion').prop( "checked" );
	}
	
	showLayer();

	$.ajax({
		url : WEB_SERVICE_URL+ '/feildPermissionMasterWS/addRemovePermissions.do',
		type : "POST",
		dataType : 'json',
		data : jsonObject,
		success : function(data) {
			if (data.isPermissionSet) {
				showMessage('success', checkBox.checked ? 'Permission for "' + checkBox.value + '" granted.' : 'Permission for "' + checkBox.value + '" removed.');
			} else {
				showMessage('error', "An error occured, please try again.");
			}
			
			hideLayer();
		}
	});
}
	
function activateDeactivateReport(bool) {
	if (validateAccountGroup()) {
		if(!validateRemark('remark'))
			return;
		
		let jsonObject = new Object();
		jsonObject["accountGroupId"]	= $('#accountGroupId').val();
		jsonObject["permissionId"]		= reportPermissionIds;
		jsonObject["permissionTypeId"]	= 1;
		jsonObject["markForDelete"]		= bool;
		jsonObject["name"]				= 'Report';
		jsonObject["remark"]			= $('#remark').val();
		
		showLayer();

		$.ajax({
			url : WEB_SERVICE_URL+ '/executiveFunctionsWS/activateDeactivatePermissionForGroup.do',
			type : "POST",
			dataType : 'json',
			data : jsonObject,
			success : function(data) {
				hideLayer();
				
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
					$('#remark').val('');
					
					if (data.mfd) {
						$('.deactiveBtn').hide();
						$('.activeBtn').show();
					} else {
						$('.deactiveBtn').show();
						$('.activeBtn').hide();
					}
				}
			}
		});
	}
}

function validateAccountGroup() {
	return validateInputTextFeild(1, 'accountGroup', 'accountGroup', 'error',	'Please Select Account Group');
}

function validateManualDays() {
	return validateInputTextFeild(1, 'configParam', 'configParam', 'error',	'Please Enter Manual Days');
}

function activateDeactivateGroup(id) {
	let valid = validateAccountGroup();
	
	let msg = '';
	
	if(id == 0)
		msg = "Are you sure you want to Activate Group ?";
	else
		msg = "Are you sure you want to DeActivate Group ?";
	
	if (valid && confirm(msg)) {
		if(!validateRemark('remark'))
			return;
		
		let jsonObject = new Object();
		jsonObject["accountGroupId"]	= $('#accountGroupId').val();
		jsonObject["status"]			= id;
		jsonObject["remark"]			= $('#remark').val();
		
		showLayer();

		$.ajax({
			url : WEB_SERVICE_URL+ '/accountGroupWS/activateDeactivateGroup.do',
			type : "POST",
			dataType : 'json',
			data : jsonObject,
			success : function(data) {
				hideLayer();
				
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
					$('#remark').val('');
				}
			}
		});
	}
}

function setAccountGroupAutocomplete() {
	$("#accountGroup").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getAccountGroupDetailsByName.do?term=' + request.term + '&displayActiveGroups=true', function (data) {
				response($.map(data.result, function (item) {
					return {
						label				: item.accountGroupDescription,
						value				: item.accountGroupDescription,
						accountGroupId		: item.accountGroupId
					};
				}));
			});
		}, select: function (e, u) {
			$('#accountGroupId').val(u.item.accountGroupId);
			populateRegionsOnGroup(u.item.accountGroupId, 'region');
			getAccountGroupDetails(u.item.accountGroupId);
			getConfigParamDetails(u.item.accountGroupId);
			sortDropDownList('region')
			checkReportPermission(u.item.accountGroupId);
			checkGroupLevelPermissions(u.item.accountGroupId)
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function activateDeActivateModule(checkBox, markForDelete) {
	let valid = validateAccountGroup();
	
	if(!valid)
		checkBox.checked	= false;
	
	if (valid) {
		let permissionKey		= checkBox.id;
		let value				= checkBox.value;
		
		if(!validateRemark('remark')) {
			checkBox.checked	= false;
			return;
		}
		
		let jsonObject = new Object();
		jsonObject["accountGroupId"]	= $('#accountGroupId').val();
		jsonObject["permissionId"]		= permissionKey.split('_')[0];
		jsonObject["permissionTypeId"]	= Number(permissionKey.split('_')[1]);
		jsonObject["menuGroupId"]		= Number(permissionKey.split('_')[2]);
		jsonObject["markForDelete"]		= Number(markForDelete) != 0;
		jsonObject["name"]				= value;
		jsonObject["remark"]			= $('#remark').val();
		
		showLayer();

		$.ajax({
			url : WEB_SERVICE_URL+ '/executiveFunctionsWS/activateDeactivatePermissionForGroup.do',
			type : "POST",
			dataType : 'json',
			data : jsonObject,
			success : function(data) {
				hideLayer();
				
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
					checkBox.checked	= false;
					
					if(errorMessage.typeName == 'success') {
						$('#remark').val('');
						
						setTimeout(function() {
							location.reload();
						}, 1000);
					}
				}
			}
		});
	}
}

function activateDeactivateSMSService() {
	if(validateAccountGroup())
		addRemovePermission(isSmsThroughIVCargo, DISABLE_SMS_FEATURES);
}

function validateRemark(id) {
	let remark			= $('#' + id).val();
			
	if(remark == '' || remark == undefined) {
		$('#' + id).focus();
		showMessage('error', 'Enter Remark !');
		return false;
	} else if (remark.trim().length < 15) {
		$('#' + id).focus();
		showMessage('error', 'Enter Remark atleast 15 Character !');
		return false;
	} else if(remark.trim().toUpperCase() === 'OK' || /^(.)\1+$/.test(remark.trim())) {
		$('#' + id).focus();
		showMessage('error', 'Enter Valid Remark !');
		return false;
	}
		
	return true;
}

function activateDeactivateLsComission(bool) {
	let msg = '';
	
	if(!bool)
		msg = "Are you sure you want to Activate Ls Comission ?";
	else
		msg = "Are you sure you want to DeActivate Ls Comission ?";
	
	if (validateAccountGroup() && confirm(msg))
		addRemovePermission(bool, ALLOW_LS_COMMISSION);
}

function activateDeactivateLsExpense(bool) {
	let msg = '';
	
	if(!bool)
		msg = "Are you sure you want to Activate Ls Expense ?";
	else
		msg = "Are you sure you want to DeActivate Ls Expense ?";
	
	if (validateAccountGroup() && confirm(msg))
		addRemovePermission(bool, ALLOW_LS_EXPENSE);
}


function showHideDeActivateUser(bool) {
	let msg = '';
	
	if(!bool)
		msg = "Are you sure you want to show DeActivate User ?";
	else
		msg = "Are you sure you don't want to show DeActivate User ?";
	
	if(validateAccountGroup() && confirm(msg))
		addRemovePermission(bool, SHOW_DEACTIVATE_USER);
}

function showHideDeActivateBranch(bool) {
	let msg = '';
	
	if(!bool)
		msg = "Are you sure you want to show DeActivate Branch ?";
	else
		msg = "Are you sure you don't want to show DeActivate Branch ?";
	
	if(validateAccountGroup() && confirm(msg))
		addRemovePermission(bool, SHOW_DEACTIVATE_BRANCH);
}

function updateManulDays() {
	if (validateAccountGroup() && validateManualDays()) {
		let jsonObject = new Object();
		jsonObject["accountGroupId"]	= $('#accountGroupId').val();
		jsonObject["configKey"]			= 34;
		jsonObject["configParam"]		= $('#configParam').val();
		
		showLayer();

		$.ajax({
			url : WEB_SERVICE_URL+ '/configParamWS/updateConfigParamValueByConfigKey.do',
			type : "POST",
			dataType : 'json',
			data : jsonObject,
			success : function(data) {
				hideLayer();
				
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
					refreshCache(207, $('#accountGroupId').val());
				}
			}
		});
	}
}

function allowDisallowMobileBooking(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, ALLOW_MOBILE_BOOKING);
}

function allowDisallowPaidMobileBooking(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, ALLOW_PAID_MOBILE_BOOKING);
}

function allowDisallowNewDefaultLRPrintPermission(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, NEW_DEFAULT_LR_PRINT_FOR_GROUP);
}

function allowDisallowNewDefaultLSPrintPermission(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, NEW_DEFAULT_LS_PRINT_FOR_GROUP);
}

function allowNewDefaultCRPrintPermission(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, NEW_DEFAULT_CR_PRINT_FOR_GROUP);
}

function allowDisallowNewDefaultInvoicePrint(bool) {
	if(validateAccountGroup())
		addRemovePermission(bool, NEW_DEFAULT_INVOICE_PRINT_FOR_GROUP);
}

function addRemovePermission(bool, permissionId) {
	if(!validateRemark('remark'))
		return;
			
	let jsonObject = new Object();
	
	jsonObject["accountGroupId"]	= $('#accountGroupId').val();
	jsonObject["markForDelete"]		= bool;
	jsonObject["permissionId"]		= permissionId;
	jsonObject["message"]			= $('#remark').val();
	
	showLayer();
	
	$.ajax({
		url : WEB_SERVICE_URL+ '/accountGroupPermissionWS/activateDeactivatePermissions.do',
		type : "POST",
		dataType : 'json',
		data : jsonObject,
		success : function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + errorMessage.description);
				$('#remark').val('');
				
				if(errorMessage.type != 1)
					return;
								
				if(permissionId == IS_WP_THROUGH_IV_CARGO) {
					isWpThroughIVCargo = !isWpThroughIVCargo;
					onoffIvcargoWp();
				} else if(permissionId == IS_SMS_THROUGH_IV_CARGO) {
					isSmsThroughIVCargo = !isSmsThroughIVCargo;
					onoffIvcargoSMS();
				} else if(permissionId == DISABLE_SMS_FEATURES) {
					isSmsFeaturesDisable = !isSmsFeaturesDisable;
					onoffSMSFeature();
				}
				
				setTimeout(function() {
					refreshCache(ACCOUNT_GROUP_PERMISSION_MASTER, $('#accountGroupId').val());
				}, 500);
			}
		}
	});
}

function checkReportPermission(accountGroupId) {
	let jsonObject = new Object();
	
	jsonObject["accountGroupId"]		= accountGroupId;
	jsonObject["permissionTypeId"]		= 1;
	jsonObject["permissionId"]			= reportPermissionIds;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/accountGroupPermissionWS/isReportActiveOrDeactive.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(data.isActive) {
				$('.activeBtn').hide();
				$('.deactiveBtn').show();
			} else {
				$('.activeBtn').show();
				$('.deactiveBtn').hide();
			}
			
			hideLayer();
		}
	});
}

function checkGroupLevelPermissions(accountGroupId) {
	let jsonObject = new Object();
	
	jsonObject["accountGroupId"]		= accountGroupId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/accountGroupPermissionWS/getGroupLevelPermission.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			isSmsThroughIVCargo		= data.isSmsThroughIVCargo;
			isSmsFeaturesDisable	= data.isSmsFeaturesDisable;
			isWpThroughIVCargo		= data.isWpThroughIVCargo;

			onoffIvcargoSMS();
			onoffSMSFeature();
			onoffIvcargoWp();
			
			hideLayer();
		}
	});
}

function allowDisallowSmsThroughIVCargo() {
	if(validateAccountGroup())
		addRemovePermission(isSmsThroughIVCargo, IS_SMS_THROUGH_IV_CARGO);
}

function onoffIvcargoSMS() {
	if (isSmsThroughIVCargo)
		$('#smsThroughIVCargo').text('Disallow SMS Through IVCargo').removeClass('btn-success').addClass('btn-danger');
	else
		$('#smsThroughIVCargo').text('Allow SMS Through IVCargo').removeClass('btn-danger').addClass('btn-success');
}

function onoffSMSFeature() {
	if (isSmsFeaturesDisable)
		$('#enableSMS').text('Activate SMS Service').removeClass('btn-danger').addClass('btn-success');
	else
		$('#enableSMS').text('DeActivate SMS Service').removeClass('btn-success').addClass('btn-danger');
}

function allowDisallowWpThroughIVCargo() {
	if(validateAccountGroup())
		addRemovePermission(isWpThroughIVCargo, IS_WP_THROUGH_IV_CARGO);
}

function onoffIvcargoWp() {
	if (isWpThroughIVCargo)
		$('#wpThroughIVCargo').text('Disallow Whatsapp Through IVCargo').removeClass('btn-success').addClass('btn-danger');
	else
		$('#wpThroughIVCargo').text('Allow Whatsapp Through IVCargo').removeClass('btn-danger').addClass('btn-success');
}

function generateCsv() {
	showLayer();

	$.ajax({
		url: WEB_SERVICE_URL + '/feildPermissionMasterWS/generateCsv.do',
		type: "POST",
		dataType: "json",
		success: function (data) {
			hideLayer();

			if (data.message) {
				const files = data.generatedFiles || [];

				let html = `
					<div style="text-align:center; font-size:15px; line-height:1.6;">
						<div style="margin-bottom:10px;">
							<b style="font-size:16px;">Download Files</b>
						</div>
				`;

				if (files.length > 0) {
					html += `<div style="display:flex; flex-direction:column; align-items:center; gap:8px;">`;
					files.forEach(file => {
						html += `
							<button class="btn btn-sm"
									style="color:#007bff; background:none; border:none; cursor:pointer; text-decoration:underline; font-size:14px;"
									onclick="handleDownload('${file.fileWithUrl}', this)">
								${file.fileName}
							</button>
						`;
					});
					html += `</div>`;
				} else {
					html += `<div>No files generated.</div>`;
				}

				html += `</div>`;
				
				  const unloadHandler = () => {
					  files.forEach(file => {
						  $.ajax({
							  url: WEB_SERVICE_URL + '/feildPermissionMasterWS/deleteCsv.do',
							  type: 'POST',
							  async: false,
							  data: { fileUrl: file.fileWithUrl }
						  });
					  });
				  };

				window.addEventListener("beforeunload", unloadHandler);

				Swal.fire({
					title: "<div style='font-size:20px; font-weight:600; text-align:center;'>CSV Generated Successfully!</div>",
					html: html,
					icon: "success",
					showConfirmButton: true,
					confirmButtonText: "Close",
					allowOutsideClick: false,
					width: 500,
					background: "#f9fafb",
					customClass: {
						popup: "shadow-lg rounded-3"
					},
					didClose: () => {
						// Delete files on modal close
						files.forEach(file => {
							$.ajax({
								url: WEB_SERVICE_URL + '/feildPermissionMasterWS/deleteCsv.do',
								type: 'POST',
								data: { fileUrl: file.fileWithUrl },
								success: function () {
									console.log('File deleted on modal close.');
								},
								error: function () {
									console.warn('Failed to delete file.');
								}
							});
						});
						window.removeEventListener("beforeunload", unloadHandler);
					}
				});
			} else {
				Swal.fire({
					title: "Error!",
					text: "An error occurred, please try again.",
					icon: "error",
					confirmButtonText: "OK"
				});
			}
		},
		error: function () {
			hideLayer();
			Swal.fire({
				title: "Request Failed!",
				text: "Something went wrong while generating the CSV.",
				icon: "error",
				confirmButtonText: "OK"
			});
		}
	});
}


function handleDownload(fileUrl, buttonElement) {
	// Anchor to trigger download.
	const a = document.createElement('a');
	a.href = fileUrl;
	a.download = '';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	// Disable download link so the user doesn't get an error of file not found.
	$(buttonElement)
		.prop('disabled', true)
		.css('color', 'gray')
		.text('Downloaded');
		
		
	// Delete file from server after the user downloads the file. Timeout added to ensure download initiates.
	setTimeout(() => {
		$.ajax({
			url: WEB_SERVICE_URL + '/feildPermissionMasterWS/deleteCsv.do',
			type: 'POST',
			data: { fileUrl: fileUrl },
			success: function () {
				console.log('File deleted from server.');
			},
			error: function () {
				console.log('Failed to delete file from server.');
			}
		});
	},2000);
}

/// STEP 1: Capture initial state
let initiallyChecked = new Set();

function captureInitiallyChecked() {
	initiallyChecked.clear();
	document.querySelectorAll('input[type=checkbox]').forEach(cb => {
		if(cb.checked){
			initiallyChecked.add(cb.id);
		}
	});
}

// STEP 2: Track newly selected checkboxes dynamically
function getNewlySelected() {
	let newOnes = [];
	document.querySelectorAll('input[type=checkbox]').forEach(cb => {
		// If it is currently checked AND was NOT initially checked
		if(cb.checked && !initiallyChecked.has(cb.id)){
			newOnes.push(cb.id);
		}
	});
	return newOnes;
}

function removePermissionGroupLevel() {
	const accountGroup = $('#accountGroup').val();
	const accountGroupId = $('#accountGroupId').val();

	if (!accountGroup || accountGroupId <= 0) {
		showMessage('error', 'Please select Account Group!');
		return;
	}
	
	if($('#Executive').val() > 0) {
		showMessage('error', 'Do not select Executive !');
		return;
	}

	if (selectedPermissions.length === 0) {
		showMessage('error', 'Please select at least one permission !');
		return;
	}

	const jsonObject = {
		permissionFlag: false,
		accountGroupId: accountGroupId,
		regionId: $('#region').val(),
		subRegionId: $('#subRegion').val(),
		sourceBranchId: $('#searchBranch').val(),
		permissions: selectedPermissions.join(",")	
	};
  
	showLayer();

	$.ajax({
		url: WEB_SERVICE_URL + '/feildPermissionMasterWS/addRemovePermissionsForGroupLevel.do',
		type: "POST",
		dataType: 'json',
		data: jsonObject,
		success: function(data) {
			hideLayer();
			if (data.isPermissionSet) {
				showMessage('success', 'Permissions removed successfully.');
				// Clear selected checkboxes
				selectedPermissions.forEach(id => $('#' + id).prop('checked', false));
				selectedPermissions = [];
			} else {
				showMessage('error', 'An error occurred, please try again.');
			}
		},
		error: function() {
			hideLayer();
			showMessage('error', 'Server error, please try again.');
		}
	});
}

function givePermissionGroupLevel() {
	const accountGroup = $('#accountGroup').val();
	const accountGroupId = $('#accountGroupId').val();

	if (!accountGroup || accountGroupId <= 0) {
		showMessage('error', 'Please select Account Group!');
		return;
	}
	
	if($('#Executive').val() > 0) {
		showMessage('error', 'Do not select Executive !');
		return;
	}

	if (selectedPermissions.length === 0) {
		showMessage('error', 'Please select at least one permission.');
		return;
	}
	
	const jsonObject = {
		permissionFlag: true,
		accountGroupId: accountGroupId,
		regionId: $('#region').val(),
		subRegionId: $('#subRegion').val(),
		sourceBranchId: $('#searchBranch').val(),
		permissions: selectedPermissions.join(",")	
	};
  
	showLayer();

	$.ajax({
		url: WEB_SERVICE_URL + '/feildPermissionMasterWS/addRemovePermissionsForGroupLevel.do',
		type: "POST",
		dataType: 'json',
		data: jsonObject,
		success: function(data) {
			hideLayer();
			if (data.isPermissionSet) {

				showMessage('success', 'Permissions granted successfully.');
				// Clear selected checkboxes
				selectedPermissions.forEach(id => $('#' + id).prop('checked', false));
				selectedPermissions = [];
			} else {
				showMessage('error', 'An error occurred, please try again.');
			}
		},
		error: function() {
			hideLayer();
			showMessage('error', 'Server error, please try again.');
		}
	});
}

function handlePermissionSelection(checkBox) {
	let accountGroup	= $('#accountGroupId').val();
	
	if(!isSuperGroup || $('#Executive').val() > 0)
		setExecutivePermission(checkBox);
	else if (accountGroup && Number(accountGroup) > 0) {
		const permissionId = checkBox.id;
		let permissionTypeId	= Number(permissionId.split('_')[1]);
		let menuGroupId			= Number(permissionId.split('_')[2]);
			
		let activateModule = $("input[name='activateModule']:checked").val();
				
		if(activateModule && (permissionTypeId == 1 && menuGroupId == 2)) {
			activateDeActivateModule(checkBox, activateModule);
			return;
		}

		if (checkBox.checked) {
			if (selectedPermissions.length >= 5) {
				showMessage('error', "You can select a maximum of 5 permissions.");
				checkBox.checked = false;
				return;
			}
			
			selectedPermissions.push(permissionId);
		} else {
			selectedPermissions = selectedPermissions.filter(id => id !== permissionId);
		}
	} else {
		showMessage('error', "Please Enter Account Group.");
		checkBox.checked = false;
	}
}
