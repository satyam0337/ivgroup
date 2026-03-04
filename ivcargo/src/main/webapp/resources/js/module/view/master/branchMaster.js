var stateList		= null;
var doneTheStuff	= false;
var MAX_RESEND_LIMIT = 3;
var	otpSessionMap = {};
var currentExecutiveId = null;
var otpCountdownInterval;
function getCityByStateId(srcState, target) {
	var	stateId = srcState.options[srcState.selectedIndex].value;
	
	if(stateId == 0) {
		resetCombo(target);
		return false;
	}
	
	var jsonObject				= new Object();
	jsonObject["stateId"]		= stateId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getCityListByStateId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var cityList	= data.cityList;
			
			operationOnSelectTag('city', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('city', 'addNew', '---- Select	City ----', 0); //function calling from genericfunction.js
			
			if(cityList != null && typeof cityList !== 'undefined') {
				for(var i = 0; i < cityList.length; i++) {
					operationOnSelectTag('city', 'addNew', cityList[i].cityName, cityList[i].cityId);
				} 
			}
			
			if(selectedCityId > 0) {
				selectOptionByValue(document.branchMasterForm.city, selectedCityId);
			}
			
			hideLayer();
		}
	});
}

function getCitiesByStateId() {
	
	var jsonObject				= new Object();

	jsonObject["stateId"]		= $('#stateEle').val();
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getCityListByStateId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var cityList		= data.cityList;
			var isFtlBooking	= data.isFtlBooking;
			
			operationOnSelectTag('cityEle', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('cityEle', 'addNew', '---- Select City ----', 0); //function calling from genericfunction.js
			
			if(cityList != null && typeof cityList !== 'undefined') {
				for(var i = 0; i < cityList.length; i++) {
					operationOnSelectTag('cityEle', 'addNew', cityList[i].cityName, cityList[i].cityId);
				} 
			}
			
			$('#cityEle').change(function() {
				var cityId = Number($('#cityEle').val());
				
				if(isFtlBooking && cityId > 0){
					$('#cityId').val(cityId);
					$('#branchNameEle').focus();
					//$('#branchNameEle').val($("#cityEle option:selected").text());

				}else if(cityId > 0) {
					$('#cityId').val(cityId);
					$('#branchNameEle').focus();
					$('#branchNameEle').val($("#cityEle option:selected").text());
				}
			});
			
			hideLayer();
		}
	});
}

function validateInput() {
	
	var stateId				= $('#stateEle').val();
	var cityId				= $('#cityEle').val();
	var handlingBranchId	= $('#handlingBranchId').val();
	
	if(stateId <= 0) {
		showMessage('error','Please Select State !');
		changeTextFieldColor('stateEle', '', '', 'red');
		$('#stateEle').focus();
		return false;
	}
	
	if(cityId <= 0) {
		showMessage('error','Please Select City !');
		changeTextFieldColor('cityEle', '', '', 'red');
		$('#cityEle').focus();
		return false;
	}
	
	if(handlingBranchId <= 0) {
		showMessage('error','Please Select Handling Branch !');
		changeTextFieldColor('handlingBranchEle', '', '', 'red');
		$('#handlingBranchEle').focus();
		return false;
	}
	
	return true;
}

function resetValues() {
	$('#stateEle').val(0);
	$('#cityEle').val(0);
	$('#handlingBranchId').val(0);
	$('#branchName').val("");
	$('#branchDisplayName').val("");
	$('#isDeliveryPlaceOperational').val("");
}

function createOperationalBranch() {
	document.operationalBranchForm.filter.value = 1;
	document.operationalBranchForm.submit();
}

function showInMobApp() {
	if($('#isAllowInMobApp').is(":checked")) {
		$('#isAllowInMobApp').val(1);
	} else {
		$('#isAllowInMobApp').val(0);
	}
}
function showisParentBranch() {
	if($('#isParentBranch').is(":checked")) {
		$('#limitDiv').removeClass('hide');
		$('#isParentBranch').val(1);
	} else {
		$('#limitDiv').addClass('hide');
		$('#isParentBranch').val(0);
	}
}

function openwindowforBranchDetail(){
	document.branchMasterForm.pageId.value = '276';
	document.branchMasterForm.eventId.value = '1';
	document.branchMasterForm.submit();
}

function openCreateBranchModal() {
		
		$('#details').addClass('hide');
		
		setTimeout(() => {
			$("#handlingBranchEle").autocomplete({
				source: function (request, response) {
					$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBranchWiseDestinationByNameWithOutDeliveryPlace.do?term=' + request.term + '&isOwnBranchRequired=true&branchType=3', function (data) {
						
						if(typeof data.message !== 'undefined') {
							showMessage('error', data.message.description);
							$("#handlingBranchEle").focus();
							return false;
						} else {
							response($.map(data.result, function (item) {
								
								return {
									label				: item.branchName,
									value				: item.branchName,
									toBranchId			: item.branchId
								};
							}));
						}
					});
				}, select: function (e, u) {
					if(u.item.toBranchId > 0) {
						$('#handlingBranchId').val(u.item.toBranchId);
					}
				},
				minLength	: 2,
				delay		: 20,
				autoFocus	: true
			});
		}, 200);

		
		var contentTable2	=		'<div><form method="post" name="operationalBranchForm" action="/ivcargo/Masters.do"><input type="hidden" name="pageId" value="209"/><input type="hidden" name="eventId" value="1"/><input type="hidden" name="filter" value="0"/><input type="hidden" name="stateId" id="stateId" value="0"><input type="hidden" name="cityId" id="cityId" value="0"><input type="hidden" name="handlingBranchId" id="handlingBranchId" value="0"><input type="hidden" name="branchType" id="branchType" value="3"><input type="hidden" name="branchName" id="branchName" value=""><input type="hidden" name="branchDisplayName" id="branchDisplayName" value="">'
									+	'<table style="width:630px;" class="" id="operationalBranchTable"><thead class="thead-inverse"><tr><th><span style="padding-left: 125px;">State</span></th><th><span style="padding-left: 190px;">City</span></th></tr>'
									+	'<tr><td  style="line-height: 2; font-size: larger; padding-left: 50px; width: 200px;"><select style="width: 200px" id="stateEle" class="form-control"></select></td><td style="line-height: 2; font-size: larger; padding-left: 120px;"><select style="width: 200px" id="cityEle" class="form-control"></select></td></tr>'
									+	'<tr><th><span style="padding-left: 100px;">Branch Name</span></th><th><span style="padding-left: 160px;">Handling Branch</span></th></tr>'
									+	'<tr><td style="padding-left: 50px; width: 200px;"><input style="width: 200px" id="branchNameEle" class="form-control" onkeypress="return noSpclChars(event);"></input></td><td style="padding-left:120px;"><input style="width: 200px" id="handlingBranchEle" class="form-control"></input></td></tr></thead></table></form></div>';


		var btModal = new Backbone.BootstrapModal({
			content		:	contentTable2,
			modalWidth	:	50,
			title		:	'<center> Create Operational Branch</center>',
			okText		:	'Create Branch',
			showFooter	:	true,
			okCloses	:	false
		}).open();
		
		setTimeout(() => {
			$('#stateEle').focus();
		}, 500);
		
		setTimeout(() => {
			$('#stateEle').keyup(function(){
				if(Number($('#stateEle').val()) > 0) {
					next ='cityEle';
				} else {
					showMessage('error', 'Please Select State');
					return false;
				}
			});
		}, 500);
		
		setTimeout(() => {
			$('#cityEle').keyup(function(){
				if(Number($('#cityEle').val()) > 0) {
					next ='branchNameEle';
				} else {
					showMessage('error', 'Please Select City');
					return false;
				}
			});
		}, 500);
		
		setTimeout(() => {
			$('#branchNameEle').focus(function(){
				next ='handlingBranchEle';
			});
		}, 500);
		
		btModal.on('ok', function() {
			
			if(!validateInput()) {
				return false;
			}
			
			$.get("/ivcargo/jsp/masters/MasterAjaxInterface.jsp",{ filter:32,branchName:$('#branchNameEle').val(),cityId:$.trim($("#cityEle").val())},function(data){
				 if($.trim(data)=="true"){ //if Branch found avaiable
				   showMessage('info','This Branch already exists!')
				   changeTextFieldColor('branchNameEle', '', '', 'red');
				   $('#branchNameEle').focus();
				   doneTheStuff	= false;
				   return false;
				 } else {
					 
					var branchName			= $('#branchNameEle').val();
					var branchDisplayName	= $("#cityEle option:selected").text()+ ' - ' + branchName.toUpperCase();
						
					$('#branchName').val(branchName);
					$('#branchDisplayName').val(branchDisplayName);
						
					if(!doneTheStuff) {
						var btModalConfirm = new Backbone.BootstrapModal({
							content		:	"Are you sure you want Create Branch ?",
							modalWidth	:	30,
							title		:	'Create Branch',
							okText		:	'YES',
							showFooter	:	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							btModal.close();
							createOperationalBranch();
							showLayer();
						});
						
						btModalConfirm.on('cancel', function() {
							doneTheStuff	= false;
							hideLayer();
						});
					}
					
					doneTheStuff	= true;
					
				 }
			});
		});
		
		btModal.on('cancel', function() {
			resetValues();
			doneTheStuff	= false;
			$('#details').removeClass('hide');
		});
		
		setTimeout(() => {
			operationOnSelectTag('cityEle', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('cityEle', 'addNew', '---- Select City ----', 0); //function calling from genericfunction.js

			operationOnSelectTag('stateEle', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('stateEle', 'addNew', '---- Select	State ----', 0); //function calling from genericfunction.js
			
			if(stateList != null && typeof stateList !== 'undefined') {
				for(var i = 0; i < stateList.length; i++) {
					operationOnSelectTag('stateEle', 'addNew', stateList[i].stateName, stateList[i].stateId);
				} 
			}
			
			$('#stateEle').change(function(){
				$('#stateId').val(Number($('#stateEle').val()));
				getCitiesByStateId();
			});
		}, 200);
		
	}
	
function getStates() {
		
		$('#details').removeClass('hide');
		
		var jsonObject = new Object();
		
		setTimeout(() => {
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/stateWS/getStateList.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					stateList	= data.stateList;
					hideLayer();
				}
			});
		}, 400);
	}
	
	function getCompanyNameByAccountGroupId() {
		var jsonObject				= new Object();
		
		showLayer();
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/selectOptionsWS/getAllCompanyNamesByAcountGroupId.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				var companyHeadMasterList		= data.companyHeadMasterList;
				operationOnSelectTag('companyName', 'removeAll', '', ''); //function calling from genericfunction.js
				operationOnSelectTag('companyName', 'addNew', '---- Select Company ----', 0); //function calling from genericfunction.js
				
				if(companyHeadMasterList != null && typeof companyHeadMasterList !== 'undefined') {
					for(var i = 0; i < companyHeadMasterList.length; i++) {
						operationOnSelectTag('companyName', 'addNew', companyHeadMasterList[i].companyHeadName, companyHeadMasterList[i].companyHeadMasterId);
					} 
				}
				hideLayer();
			}
		});
	}
	
	
 function addBranchPermission() {
	if($('#branch').val() == 0) {
		showMessage('error', branchNameErrMsg);
		$('#branch').css('border-color', 'red');
		$('#branch').focus();
		return;
	}
		
	let jsonObject			= new Object();

	jsonObject["configBranchId"]		= $('#branch').val();
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/branchMasterWS/insertIntoBranchPermission.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			showMessage(data.message.typeName, data.message.description);
			hideLayer();
		}
	});

}

function startOtpCountdown(executiveId) {
	clearInterval(otpCountdownInterval);

	$('#otpCountdownMsg').remove();
	$('#resendOtpBtn').remove();

	const otpData = otpSessionMap[executiveId];
	if (!otpData) return;

	const $countdown = $('<div id="otpCountdownMsg" style="white-space: nowrap; color:#555;"></div>');
	const $resendBtn = $('<button id="resendOtpBtn" class="btn btn-sm btn-primary" style="display: none;">Resend OTP</button>');

	// Append in same row
	$('#otpInputGroup').append($resendBtn).append($countdown);

	// Bind resend click
	$resendBtn.click(() => {
		$resendBtn.prop('disabled', true);
		sendOtpToWhatsapp(true);
	});

	// Start countdown
	otpCountdownInterval = setInterval(() => {
		const now = Date.now();
		const remaining = otpData.validDateTime - now;

		if (remaining <= 0) {
			clearInterval(otpCountdownInterval);
			$countdown.text('OTP expired.');
			$resendBtn.show();
			$('#otpInput').prop('disabled', true);
		} else {
			const seconds = Math.floor(remaining / 1000);
			$countdown.text(`OTP valid for ${seconds} seconds`);
		}
	}, 1000);
}

function handleSendOtpCheckbox() {
	const $checkbox = $('#sendOtpCheckbox');
	const $otpInput = $('#otpInput');
	const $otpInputGroup = $('#otpInputGroup');

	$checkbox.change(function () {
		if (!$checkbox.is(':checked')) {
			if ($checkbox.data('locked')) {
				$checkbox.prop('checked', true);
				return;
			} else {
				$otpInputGroup.hide();
				$otpInput.val("").prop("disabled", true);
				currentExecutiveId = null;
				clearInterval(otpCountdownInterval);
				$('#otpCountdownMsg').remove();
				$('#resendOtpBtn').remove();
				$('#otpAttemptsLeftMsg').hide();
			}
		} else {
			$otpInputGroup.show();
			$otpInput.prop("disabled", false).focus();
			$checkbox.data('locked', true);
			clearInterval(otpCountdownInterval);
			$('#otpCountdownMsg').remove();
			sendOtpToWhatsapp(false);
		}
	});
}

function validateBeforeSave() {
	const EPSILON = 0.000001;
	const $otpGroup			= $("#sendOtpCheckbox").closest(".form-group");
	const $otpInputGroup	= $("#otpInputGroup");
	const $otpInput			= $("#otpInput");
	const $attempLeft		= $("#otpAttemptsLeftMsg");

	const currentRaw = $("#branchLimit").val().trim();
	const current = currentRaw === "" ? null : parseFloat(currentRaw);

	const changed =
		(trueOriginalBranchLimit === null && current !== null && current > 0) ||
		(trueOriginalBranchLimit !== null && current === null) ||
		(trueOriginalBranchLimit !== null && current !== null &&
			Math.abs(trueOriginalBranchLimit - current) > EPSILON);

	const otpChecked = $("#sendOtpCheckbox").is(":checked");

	// CASE 1: Limit is changed
	if (changed) {
		$otpGroup.show();
		$("#otpRequiredMsg").show();

		// If OTP hasn't been sent yet or was invalidated due to reverting, reset UI
		if (!otpAlreadySent) {
			$("#sendOtpCheckbox").prop("checked", false).prop("disabled", false);
			$otpInputGroup.hide();
			$otpInput.val("");
			showMessage("error", "Please send OTP before proceeding.");
			$('#sendOtpCheckbox').focus();
			return false;
		}

		// ð¢ OTP Sent & Checkbox is locked (disabled)
		if (otpChecked && otpAlreadySent) {
			const enteredOtp = $otpInput.val().trim();

			if (!enteredOtp) {
				showMessage('error', 'Please enter the OTP.');
				return false;
			}

			if (!currentExecutiveId || !otpSessionMap[currentExecutiveId]) {
				showMessage('error', 'No OTP received from server.');
				return false;
			}

			const { otpNumber, validDateTime } = otpSessionMap[currentExecutiveId];

			if (Date.now() > validDateTime) {
				showMessage('error', 'OTP has expired. Please resend OTP.');
				return false;
			}

			if (enteredOtp !== otpNumber.toString()) {
				showMessage('error', 'Invalid OTP. Please try again.');
				return false;
			}

			return true;
		}

		showMessage("error", "Please send OTP before proceeding.");
		$('#sendOtpCheckbox').focus();
		return false;
	} else {
		$otpGroup.hide();
		$otpInputGroup.hide();
		$("#otpRequiredMsg").hide();
		$attempLeft.hide();
		$otpInput.val("");

		$("#sendOtpCheckbox").prop("checked", false).prop("disabled", false);
		otpAlreadySent = false;

		return true;
	}
}

function sendOtpToWhatsapp(isResendOTP) {
	if (!mobileNoToSendOTP || mobileNoToSendOTP === '') {
		showMessage('error', 'Mobile number not configured.');
		return;
	}

	const jsonObject = {
		deliveredMobileNo: mobileNoToSendOTP,
		moduleId: BRANCH_MASTER,
		isResendOTP: isResendOTP
	};

	const queryString = $.param(jsonObject);
	const executiveIdKey = currentExecutiveId;

	if (!otpSessionMap[executiveIdKey]) {
		otpSessionMap[executiveIdKey] = {
			resendCount: 0
		};
	}

	const session = otpSessionMap[executiveIdKey];

	if (session.resendCount >= MAX_RESEND_LIMIT) {
		showMessage('warning', 'You have reached the maximum OTP resend limit.');
		return;
	}

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do?' + queryString,
		contentType: 'application/x-www-form-urlencoded',
		dataType: 'json',
		success: function (data) {
			otpAlreadySent = true;
			const executiveId	= data.executiveId;
			const otpNumber		= data.otpNumber;
			const validDateTime = data.validDateTimeForOTP;

			currentExecutiveId = executiveId;

			if (!otpSessionMap[executiveId]) {
				otpSessionMap[executiveId] = {
					resendCount: 0
				};
			}
					
			const session = otpSessionMap[executiveId];

			session.otpNumber = otpNumber;
			session.validDateTime = validDateTime;
			session.resendCount++;

			$('#otpInput').val('').prop('disabled', false);
			$('#sendOtpCheckbox').data('locked', true);
											
			const attemptsLeft = MAX_RESEND_LIMIT - session.resendCount;
			$('#otpAttemptsLeftMsg').text(`(Attempts left: ${attemptsLeft})`).show();

			startOtpCountdown(executiveId);
										
			if ($('#sendOtpCheckbox').is(':checked')) {
				if (!$('#resendOtpBtn').length) {
					const $resendBtn = $('<button>')
					.attr('id', 'resendOtpBtn')
					.addClass('btn btn-sm btn-link mt-1 ms-2')
					.text('Resend OTP')
					.click(() => sendOtpToWhatsapp(true));

					$('#otpInputGroup').append($resendBtn);
				}
			}
									
			showMessage(data.message.typeName, data.message.description);
			hideLayer();
		},
		error: function () {
			$("#sendOtpCheckbox").prop("checked", false);
			showMessage('error', 'Failed to send OTP.');
		}
	});
}

function showBranchEditLogsDetails(){
	var branchId = $("#branch").val();
	childwin = window.open ('masters.do?pageId=340&eventId=1&modulename=viewDetails&branchId='+branchId+'&filter=9');
}