define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/groupSetup/groupSetupFilePath.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'selectizewrapper'
		 ,'/ivcargo/resources/js/validation/regexvalidation.js'
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, BootstrapModal, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	masterLangKeySet,
	gridObject,
	masterLangObj,
	myNod,
	myNod1,
	myNod2,
	mobileFlag = false,
	emailFlag  = false,
	accGrpName,
	subscriptionDays,
	otpSent   = false,
	emailSent = false,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
		}, render: function() {
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/groupSetupWS/getGroupSetupElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
	
		}, setElements : function(response) {
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/groupSetup/groupSetup.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
                
				subscriptionDays    = response.accountGroupConfig.SubscriptionDays;
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.groupTypeList,
					valueField		:	'groupTypeId',
					labelField		:	'groupTypeName',
					searchField		:	'groupTypeName',
					elementId		:	'groupTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:	_this.getCityOnStateChange
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.stateList,
					valueField		:	'stateId',
					labelField		:	'stateName',
					searchField		:	'stateName',
					elementId		:	'stateEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:	_this.getCityOnStateChange
				});
				
				Selectizewrapper.setAutocomplete({
					valueField		:	'cityId',
					labelField		:	'cityName',
					searchField		:	'cityName',
					elementId		:	'cityEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				$("#companyCodeEle").bind("blur", function() {
					var jsonObject	= new Object();

					jsonObject.accountGroupCode	= this.value;

					getJSON(jsonObject, WEB_SERVICE_URL + '/groupSetupWS/checkDuplicateGroupCode.do?', _this.checkIfAccountGroupCodeExists, EXECUTE_WITHOUT_ERROR);
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#groupTypeEle_wrapper',
					validate		: 'validateAutocomplete:#groupTypeEle',
					errorMessage	: 'Please Select Group Type !'
				});
				
				myNod.add({
					selector		: '#firstNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter First Name'
				});
				
				myNod.add({
					selector		: '#lastNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter Last Name'
				});
				
				myNod.add({
					selector		: '#companyNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter Company Name'
				});
				
				myNod.add({
					selector		: '#companyCodeEle',
					validate		: 'presence',
					errorMessage	: 'Enter Company Code'
				});
				
				myNod.add({
					selector		: '#stateEle_wrapper',
					validate		: 'validateAutocomplete:#stateEle',
					errorMessage	: 'Please Select State !'
				});
				
				myNod.add({
					selector		: '#cityEle_wrapper',
					validate		: 'validateAutocomplete:#cityEle',
					errorMessage	: 'Please Select City !'
				});
				
				myNod.add({
					selector		: '#mobileNoEle',
					validate		: ['presence','min-length:10','max-length:10','integer'],
					errorMessage	: ['Enter Mobile No','Enter Valid Mobile No','Enter Valid Mobile No','Enter Valid Mobile No']
				});
				
				myNod.add({
					selector		: '#emailEle',
					validate		: ['presence','email'],
					errorMessage	: ['Enter Email Id','Enter Valid Email Id']
				});
				
				myNod1 = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod1.add({
					selector		: '#mobileNoEle',
					validate		: ['presence','min-length:10','max-length:10','integer'],
					errorMessage	: ['Enter Mobile No','Enter Valid Mobile No','Enter Valid Mobile No','Enter Valid Mobile No']
				});
				
				myNod2 = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod2.add({
					selector		: '#emailEle',
					validate		: ['presence','email'],
					errorMessage	: ['Enter Email Id','Enter Valid Email Id']
				});
				
				hideLayer();
				
				$("#verifyMobileNoEle").click(function() {

					var mobileNo 	= $("#mobileNoEle").val();

					myNod1.performCheck();

					if(myNod1.areAll('valid')) {
						if(!otpSent) {
							
							if(mobileNo == '0000000000' || Number(mobileNo.charAt(0)) < 6){
								showMessage('info', 'Please enter valid mobile number.');
								changeTextFieldColor('mobileNoEle', '', '', 'red');
								return false;
							}
							
							_this.verifyMobileNumber(mobileNo);
							otpSent = true;
						}
					}
				});
				
				$("#verifyEmailEle").click(function() {
					
					myNod2.performCheck();

					if(myNod2.areAll('valid')) {
						if(!emailSent) {
							_this.verifyEmail();
							emailSent	= true;
						}
					}
				});

				$("#nextBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
			});
		}, getCityOnStateChange : function() {
			
			jsonObject = new Object();
			
			jsonObject.stateEle_primary_key = Number($('#stateEle').val());
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/cityWS/getCityForDropDown.do?',	_this.setCity, EXECUTE_WITHOUT_ERROR);
			
		}, setCity : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.city,
				valueField		:	'cityId',
				labelField		:	'cityName',
				searchField		:	'cityName',
				elementId		:	'cityEle',
				create			: 	false,
				maxItems		: 	1
			});
			
			myNod.add({
				selector		: '#cityEle_wrapper',
				validate		: 'validateAutocomplete:#cityEle',
				errorMessage	: 'Please Select City !'
			});
			
		}, checkIfAccountGroupCodeExists : function(response) {
			
			var isDuplicateGroupCode	= response.isDuplicateGroupCode;
			var accountGroupCode		= response.accountGroupCode;
			
			if(isDuplicateGroupCode) {
				setTimeout(function(){
					showMessage('info', 'Group Code (' +accountGroupCode+ ') Alreday Exists! Please Choose Different Group Code.')
					changeTextFieldColor('companyCodeEle', '', '', 'red');
					return false;
				}, 100);
			}
			
		}, verifyMobileNumber : function(mobileNo) {
			
			jsonObject = new Object();

			jsonObject.mobileNumber = mobileNo;

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/groupSetupWS/verifyMobileNumber.do?',	_this.setOTPModal, EXECUTE_WITHOUT_ERROR);
			
		}, setOTPModal : function(repsonse){
			console.log('repsonse --- ', repsonse)
			var actualOTPString		= Number(repsonse.OTPNumber);
			var mobileNumber		= Number($("#mobileNoEle").val()); 
			var counter 			= 120;
			var interval 			= setInterval(function() {
			    counter--;
			    // Display 'counter' wherever you want to display it.verify();
			    if (counter <= 0) {
			     	clearInterval(interval);
			      	$('#timer').html('<button id="resendOTP" class="btn btn-info btn-xs"><span>Resend OTP</span></button>'); 
			      	actualOTPString = 0;
			      	$("#resendOTP").click(function() {
			      		$("#modalDialog .close").click();
						showMessage('info', 'OTP resent successfully.');
						_this.verify();
					});
			      	
			      	return;
			    }else{
			    	$('#time').text(counter);
			    }
			}, 1000);
			
			var contentTable		= 		'<div class="panel-body" >'
				+		'<div class="" id="oTPVerifyDiv" style="height:180px;">													'
				+		'<div class="validation-message">																		'
				+		'<div class="left-inner-addon">																			'
				+		'<table>                                                                                                 '
				+		'<thead><tr><th colspan="4" style="text-align: center;color: #3d78d0;background-color: ghostwhite;">We have sent you an OTP on your Mobile Number<br></th></tr>'
				+		'<tr><th colspan="4" style="text-align: center;center;color: #2fa43f;background-color: ghostwhite;" >'+mobileNumber+'</th></tr>		'
				+		'<tr><th colspan="4" style=" font-size: 12px;text-align: center;center;color: #e31414;background-color: ghostwhite;" ><span id="timer">Resend OTP in <span id="time"> '+(counter)+' </span> seconds</span></th></tr>		'
				+		'<tr><th colspan="4" style="text-align: center;" >&nbsp;</th></tr>		'
				+		'<tr><th colspan="4" style="text-align: center;" >&nbsp;</th></tr>			'
				+		'<tr><th colspan="4" style="text-align: center;" >Enter OTP</th></tr></thead>			'
				+	    '<tbody><tr>                                                                                             '
				+	    '<td>                                                                                                  	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit1" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit2" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit3" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                               	'                                                                                               
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit4" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '</tr>                                                                                                   '
				+	  	'</tbody></table>																						'
				+		'</div>																									'
				+		'</div>																									'
				+		'</div>																									'
				+		'</div>';

			
			var btModal = new Backbone.BootstrapModal({
				content		: contentTable,
				modalWidth 	: 25,
				okText		: 'Confirm',
				okCloses	: false,
				showFooter 	: true,
				title		: '<center>Mobile Number Verification</center>'

			}).open();

			btModal.on('ok', function() {
				
			var inputOTPString	 = $('#digit1').val() + $('#digit2').val() + $('#digit3').val() + $('#digit4').val();
			
				if(inputOTPString != actualOTPString || inputOTPString == ''){
					showMessage('error', 'Please enter correct OTP Number.');
				} else {
					mobileFlag = true;
					$("#modalDialog .close").click();
					showMessage('success', 'Mobile Number verified successfully.');
					setTimeout(() => {
						$('#verifyMobileNoEle').addClass('hide');
						$('#verifiedMobile').removeClass('hide');
					}, 200);
				}
			
			});

			btModal.on('cancel', function() {
				counter = 0;
				$(".ok").removeClass('hide');
				$(".ok").attr("disabled", false);
				otpSent  = false;
				hideLayer();
			});
			
			setTimeout(function(){
				$('#digit1').focus();
				$('#digit1').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit1').focus();
						}
					}
					if($('#digit1').val() != ''){
						// next = 'digit2';
						$('#digit2').val('');
						$('#digit2').focus();
					} else {
						$('#digit1').val('');
						$('#digit1').focus();
					}
				});
				
				$('#digit2').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit2').focus();
						}
					}
					if($('#digit2').val() != ''){
						//next = 'digit3';
						$('#digit3').val('');
						$('#digit3').focus();
					} else {
						$('#digit2').val('');
						$('#digit2').focus();
					}
				});
				
				$('#digit3').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit3').focus();
						}
					}
					if($('#digit3').val() != ''){
						$('#digit4').val('');
						$('#digit4').focus();
					} else {
						$('#digit3').val('');
						$('#digit3').focus();
					}
				});
				
				$('#digit4').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit4').focus();
						}
					}
					if($('#digit4').val() != ''){
						$('.ok').focus();
					} else {
						$('#digit1').val('');
						$('#digit1').focus();;
					}
				});
			}, 500);
			
		}, verifyEmail : function() {
			
			var pattern 	= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 
			var emailId 	= $('#emailEle').val();
			
			if(!emailId.match(pattern)){
				showMessage('error', 'Please enter a valid email address.');
				return false;
			}
			showLayer();
			
			jsonObject = new Object();
			jsonObject.EmailAddress = emailId;

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/groupSetupWS/verifyEmail.do?',	_this.setEmailResponse, EXECUTE_WITHOUT_ERROR);
			
		}, setEmailResponse : function(response) {
			
			console.log('repsonse --- ', response)
			if(response.OTPNumber != undefined){
				showMessage('success', 'Email sent successfully!');
			}
			hideLayer();
			var actualOTPString		= Number(response.OTPNumber);
			var emailId				= $('#emailEle').val(); 
			
			if(emailId.length > 32){
				emailId 			= emailId.substring(0,32) + "...";
			}
			
			var counter1 			= 120;
			var interval 			= setInterval(function() {
			    counter1--;
			    // Display 'counter' wherever you want to display it.verify();
			    if (counter1 <= 0) {
			     	clearInterval(interval);
			      	$('#timer').html('<button id="resendCode" class="btn btn-info btn-xs"><span>Resend Code</span></button>'); 
			      	actualOTPString = 0;
			      	$("#resendCode").click(function() {
			      		$("#modalDialog .close").click();
						showMessage('info', 'Code resent successfully.');
						_this.verifyEmail();
					});
			      	
			      	return;
			    }else{
			    	$('#time').text(counter1);
			     // console.log("Timer --> " + counter1);
			    }
			}, 1000);
			
			var contentTable		= 		'<div class="panel-body" >'
				+		'<div class="" id="emailIdVerifyDiv" style="height:180px;">													'
				+		'<div class="validation-message">																		'
				+		'<div class="left-inner-addon">																			'
				+		'<table>                                                                                                 '
				+		'<thead><tr><th colspan="4" style="text-align: center;color: #3d78d0;background-color: ghostwhite;">We have sent you a verification code on your Email Address<br></th></tr>'
				+		'<tr><th colspan="4" style="text-align: center;center;color: #2fa43f;background-color: ghostwhite;" >'+emailId+'</th></tr>		'
				+		'<tr><th colspan="4" style=" font-size: 12px;text-align: center;center;color: #e31414;background-color: ghostwhite;" ><span id="timer">Resend Code in <span id="time"> '+(counter1)+' </span> seconds</span></th></tr>		'
				+		'<tr><th colspan="4" style="text-align: center;" >&nbsp;</th></tr>		'
				+		'<tr><th colspan="4" style="text-align: center;" >&nbsp;</th></tr>			'
				+		'<tr><th colspan="4" style="text-align: center;" >Enter Verfication Code</th></tr></thead>			'
				+	    '<tbody><tr>                                                                                             '
				+	    '<td>                                                                                                  	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit1" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit2" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit3" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                               	'                                                                                               
				+	    '<td>                                                                                                 	'
				+	    '<input class="form-control" type="text" name="otpEle" maxlength="1" placeholder="0" id="digit4" onkeypress="return allowOnlyNumeric(event);">'
				+	    '</td>                                                                                                 	'
				+	    '</tr>                                                                                                   '
				+	  	'</tbody></table>																						'
				+		'</div>																									'
				+		'</div>																									'
				+		'</div>																									'
				+		'</div>';

			
			var btModal = new Backbone.BootstrapModal({
				content		: contentTable,
				modalWidth 	: 25,
				okText		: 'Confirm',
				okCloses	: false,
				showFooter 	: true,
				title		: '<center>Email Verification</center>'

			}).open();

			btModal.on('ok', function() {
				
			var inputOTPString	 = $('#digit1').val() + $('#digit2').val() + $('#digit3').val() + $('#digit4').val();
			
				if(inputOTPString != actualOTPString || inputOTPString == ''){
					showMessage('error', 'Please enter correct Verification Code.');
				} else {
					emailFlag = true;
					$("#modalDialog .close").click();
					showMessage('success', 'Email verified successfully.');
					setTimeout(() => {
						$('#verifyEmailEle').addClass('hide');
						$('#verifiedEmail').removeClass('hide');
					}, 200);
				}
			
			});

			btModal.on('cancel', function() {
				counter1 = 0;
				$(".ok").removeClass('hide');
				$(".ok").attr("disabled", false);
				emailSent  = false;
				hideLayer();
			});

			setTimeout(function(){
				$('#digit1').focus();
				$('#digit1').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit1').focus();
						}
					}
					if($('#digit1').val() != ''){
						$('#digit2').val('');
						$('#digit2').focus();
					} else {
						$('#digit1').val('');
						$('#digit1').focus();
					}
				});
				
				$('#digit2').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit2').focus();
						}
					}
					if($('#digit2').val() != ''){
						$('#digit3').val('');
						$('#digit3').focus();
					} else {
						$('#digit2').val('');
						$('#digit2').focus();
					}
				});
				
				$('#digit3').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit3').focus();
						}
					}
					if($('#digit3').val() != ''){
						$('#digit4').val('');
						$('#digit4').focus();
					} else {
						$('#digit3').val('');
						$('#digit3').focus();
					}
				});
				
				$('#digit4').keyup(function(evt){
					if(evt != undefined){
						if(evt.keycode == 13) {
							$('#digit4').focus();
						}
					}
					if($('#digit4').val() != ''){
						$('.ok').focus();
					} else {
						$('#digit1').val('');
						$('#digit1').focus();
					}
				});
			}, 500);
			
		}, onSubmit : function() {
			
			if(!mobileFlag){
				showMessage('error', 'Mobile number not verified.');
				return false;
			}

			if(!emailFlag){
				showMessage('error', 'Email-id not verified.');
				return false;
			}
			
			if (confirm("Are you sure you want to register?")) {

				showLayer();

				jsonObject = new Object();

				jsonObject.lastName							= 	$('#lastNameEle').val();
				jsonObject.executiveName					= 	$('#firstNameEle').val();
				jsonObject.accountGroupName					= 	$('#companyNameEle').val();
				
				var groupCode								= 	$('#companyCodeEle').val();
				jsonObject.accountGroupCode					= 	groupCode.trim();
				accGrpName									=   $('#companyNameEle').val();
				jsonObject.accountGroupDescription			= 	$('#companyNameEle').val();
				jsonObject.contactPersonName				= 	$('#firstNameEle').val();
				jsonObject.stateId							= 	Number($('#stateEle').val());
				jsonObject.CityId							= 	Number($('#cityEle').val());
				jsonObject.CountryId						= 	1;
				jsonObject.MobileNumber						= 	$('#mobileNoEle').val();
				jsonObject.EmailAddress						= 	$('#emailEle').val();

				//Region
				var regionSelectize 						= $('#stateEle').get(0).selectize;
				var currentRegion 							= regionSelectize.getValue(); 
				var regionOption 							= regionSelectize.options[ currentRegion ];

				jsonObject.regionName						= 	regionOption.stateName;

				//Sub Region
				var subRegionSelectize 	= $('#cityEle').get(0).selectize;
				var currentSubRegion 	= subRegionSelectize.getValue(); 
				var subRegionOption 	= subRegionSelectize.options[ currentSubRegion ];

				jsonObject.subRegionName					= 	subRegionOption.cityName;
				jsonObject.accountGroupAddress				= 	jsonObject.subRegionName;

				//Branch
				jsonObject.branchName						= 	subRegionOption.cityName;

				if(jsonObject.branchName != undefined) {
					if(jsonObject.branchName.length > 3) {
						jsonObject.branchCode				= jsonObject.branchName.substring(0,3);
					} else {
						jsonObject.branchCode				= jsonObject.branchName;
					}
				}

				jsonObject.branchDisplayName				= jsonObject.subRegionName + " - " + jsonObject.branchName;

				jsonObject.subscriptionDays                 = subscriptionDays;
				
				jsonObject.groupType                 		= $('#groupTypeEle').val();

				getJSON(jsonObject, WEB_SERVICE_URL	+ '/groupSetupWS/createGroup.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
			} else {
				hideLayer();
			}
		}, setSuccess : function (response) {
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			if(response.accountGroupId != undefined) {
				var accountGroupId	= response.accountGroupId;

				if(accountGroupId > 0) {
					_this.refreshCache();
				}
			}
			
		}, refreshCache : function() {
			// Assign handlers immediately after making the request,
			// and remember the jqXHR object for this request
			refreshCache(0, accountGroupId);
			
			hideLayer();
			setTimeout(() => {
				location.reload();
				window.open('login.do?');
			}, 1500);
		}
	});
});

function validateCompanyNameInput(evt) {

	var allowedChars 	= '32,34,38,39,40,41,43,44,45,46,47';
	var returnType		= true;
	var specialChars	= new Array();
	specialChars 		= allowedChars.split(",");

	var keynum 	= null;

	if(window.event){ // IE
		keynum = evt.keyCode;
	} else if(evt.which){ // Netscape/Firefox/Opera
		keynum = evt.which;
	}

	var charStr = String.fromCharCode(keynum);

	if(keynum != null) {
		if(keynum == 8 || keynum == 13) {
			hideAllMessages();
			return true;
		} else if (/[a-zA-Z]/i.test(charStr) ||keynum < 48 || keynum > 57 ) {
			for(var i = 0 ; specialChars.length > i ; i++){
				if(/[a-zA-Z]/i.test(charStr) || keynum == specialChars[i]) {
					hideAllMessages();
					return true;
				} else {
					showMessage('warning', otherCharacterAllowWarningMsg);
					returnType =  false;
				}
			}
		}
	}

	if(returnType == false){
		return false;
	}
}