let configuration = null;
define([
	'selectizewrapper'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/validation/regexvalidation.js'
], function (Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '', isDuplicateGroupCode = false, otpSent = false, mailSent = false, testing, serverIdentifier = 0;

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON(jsonObject, WEB_SERVICE_URL + '/groupSetupWS/getGroupSetupElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function (response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/master/createGroup.html", function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
				
				$('#planTypeEle').focus();
				
				testing				= response.testing;
				serverIdentifier	= response.serverIdentifier;
				
				if(response.countryWithCityAndStateSelection)
					$("*[data-attribute=country]").removeClass("hide");
				
				_this.setGroupTypeList(response);
				_this.setServerTypeList(response);
				_this.setPlanTypeList(response);
				
				let elementConfiguration	= {};
				
				elementConfiguration.countryElement		= $('#countryEle');
				elementConfiguration.stateElement		= $('#stateEle');
				elementConfiguration.cityElement		= $('#cityEle');
				elementConfiguration.destStateElement	= $('#toStateEle');
				elementConfiguration.destCityElement	= $('#toCityEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.destinationCityWithStateSelection	= true;

				Selection.setSelectionToGetData(response);
				
				response.country	= response.countryWithCityAndStateSelection;
				response.state		= true;
				response.city		= true;
				response.toState	= true;
				response.toCity		= true;
				
				let myNod = Selection.setNodElementForValidation(response);
				
				//addAutocompleteElementInNode1(myNod, 'serverTypeEle', 'Select Server !');
				addAutocompleteElementInNode1(myNod, 'planTypeEle', 'Select Plan Type !');
				addAutocompleteElementInNode1(myNod, 'groupTypeEle', 'Select Group Type !');
				addElementToCheckEmptyInNode(myNod, 'firstNameEle', 'Enter First Name !');
				addElementToCheckEmptyInNode(myNod, 'lastNameEle', 'Enter Last Name !');
				addElementToCheckEmptyInNode(myNod, 'companyNameEle', 'Enter Company Name !');
				addElementToCheckEmptyInNode(myNod, 'companyCodeEle', 'Enter Company Code !');
				addElementToCheckEmptyInNode(myNod, 'addressEle', 'Enter Address !');
				
				myNod.add({
					selector		: '#mobileNoEle',
					validate		: ['min-length:10','max-length:10','integer'],
					errorMessage	: ['Enter Valid Mobile No','Enter Valid Mobile No','Enter Valid Mobile No']
				});
							
				myNod.add({
					selector		: '#emailEle',
					validate		: ['email'],
					errorMessage	: ['Enter Valid Email Id']
				});
				
				/*myNod.add({
					selector		: '#supportEmailEle',
					validate		: ['email'],
					errorMessage	: ['Enter Valid Support Email Id']
				});*/
				
				const requiredFields = [
					'serverType', 'groupType', 'planType', 'firstName', 'lastName',
					'companyName', 'companyCode', 'mobileNo', 'email', 'address'
				];

				const requiredMark = "<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>";

				requiredFields.forEach(attr => {
					$(`[data-attribute=${attr}]`).find('label').append(requiredMark);
				});

				hideLayer();
				
				configuration	= {};
				configuration.specialCharacterFilter	= 2;
				configuration.AllowedSpecialCharacters	= '32,34,38,39,40,41,43,44,45,46,47';

				$("#nextBtn").click(function () {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.register();								
				});
				
				$("#companyCodeEle").bind("blur", function() {
					_this.validateGroupCode();
				});
				
				$("#panNumberEle").bind("blur", function() {
					if(!validateInputTextFeild(8, 'panNumberEle', 'panNumberEle', 'info',  validPanNumberErrMsg)) {
						setTimeout(function(){ 
							$('#panNumberEle').focus(); 
						}, 200);
						return false;
					}
				});
				
				$("#gstNumberEle").bind("blur", function() {
					if(!validateInputTextFeild(9, 'gstNumberEle', 'gstNumberEle', 'info',  gstnErrMsg)) {
						setTimeout(function(){ 
							$('#gstNumberEle').focus(); 
						}, 200);
						return false;
					}
				});
				
				let myNod1 = nod();
					myNod.configure({
					parentClass:'validation-message'
				});
							
				myNod1.add({
					selector		: '#mobileNoEle',
					validate		: ['presence','min-length:10','max-length:10','integer'],
					errorMessage	: ['Enter Mobile No','Enter Valid Mobile No','Enter Valid Mobile No','Enter Valid Mobile No']
				});
							
				let myNod2 = nod();
					myNod.configure({
					parentClass:'validation-message'
				});
							
				myNod2.add({
					selector		: '#emailEle',
					validate		: ['presence','email'],
					errorMessage	: ['Enter Email Id','Enter Valid Email Id']
				});
				
				$("#verifyMobileNoEle").click(function() {
					myNod1.performCheck();
			
					if(myNod1.areAll('valid'))
						_this.verifyMobileNumber();
				});
			
				$("#verifyEmailEle").click(function() {
					myNod2.performCheck();
			
					if(myNod2.areAll('valid'))
						_this.verifyEmail();
				});
			});		
		}, validateGroupCode : function() {
			isDuplicateGroupCode	= false;
		
			let jsonObject	= new Object();
		
			jsonObject.accountGroupCode	= $('#companyCodeEle').val();
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/groupSetupWS/checkDuplicateGroupCode.do?', _this.setResponseOfDuplicateCode, EXECUTE_WITH_NEW_ERROR);
		}, setResponseOfDuplicateCode : function(response) {
			if(response.isDuplicateGroupCode) {
				isDuplicateGroupCode = response.isDuplicateGroupCode;
				$('#companyCodeEle').val('');
			}
			
			hideLayer();
		}, setGroupTypeList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	:	response.groupTypeList,
				valueField		:	'groupTypeId',
				labelField		:	'groupTypeName',
				searchField		:	'groupTypeName',
				elementId		:	'groupTypeEle',
				create			:	false,
				maxItems		:	1
			});
		}, setServerTypeList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	:	response.serverTypeList,
				valueField		:	'serverTypeId',
				labelField		:	'serverTypeName',
				searchField		:	'serverTypeName',
				elementId		:	'serverTypeEle',
				create			:	false,
				maxItems		:	1
			});
		}, setPlanTypeList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	:	response.planTypeList,
				valueField		:	'planTypeId',
				labelField		:	'planTypeName',
				searchField		:	'planTypeName',
				elementId		:	'planTypeEle',
				create			:	false,
				maxItems		:	1
			});
		}, verifyMobileNumber : function() {
			if(!otpSent) {
				otpSent						= true;
				
				let jsonObjectdata			= new Object();
				jsonObjectdata.mobileNumber	= $('#mobileNoEle').val();
				
				showLayer();
				getJSON(jsonObjectdata, WEB_SERVICE_URL + '/groupSetupWS/verifyMobileNumber.do?', _this.setResponseAfterVerifyMobileNumber, EXECUTE_WITH_NEW_ERROR);
			}
		}, setResponseAfterVerifyMobileNumber : function(response) {
			if(response.otpNumber != undefined)
				showAlertMessage('success', 'OTP Sent Successfully!');
		}, verifyEmail : function() {
			if(!mailSent) {
				mailSent		= true;
				
				let pattern		= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 
				let emailEle	= $('#emailEle').val();
				
				if(!emailEle.match(pattern)) {
					showMessage('error', 'Please enter a valid email address.');
					$('#emailEle').focus();
					return false;
				}
				
				showLayer();
		
				let jsonObjectdata			= new Object();
				jsonObjectdata.filter		= 4;
				jsonObjectdata.EmailAddress	= emailEle;
				getJSON(jsonObjectdata, WEB_SERVICE_URL + '/groupSetupWS/verifyEmail.do?', _this.setResponseAfterVerifyEmail, EXECUTE_WITH_NEW_ERROR);
			}
		}, setResponseAfterVerifyEmail : function(response) {
			if(response.otpNumber != undefined)
				showAlertMessage('success', 'Email Sent Successfully!');
		}, register : function() {
			if(isDuplicateGroupCode) {
				showAlertMessage('info', 'Group Code (' +$('#companyCodeEle').val() + ') Alreday Exists! Please Choose Different Group Code.');
				return false;
			}
			
			jsonObject.lastName							= $('#lastNameEle').val();
			jsonObject.executiveName					= $('#firstNameEle').val();
			jsonObject.accountGroupName					= $('#companyNameEle').val();
			jsonObject.accountGroupCode					= $('#companyCodeEle').val().trim();
			jsonObject.accountGroupDescription			= $('#companyNameEle').val();
			jsonObject.contactPersonName				= $('#firstNameEle').val();
			jsonObject.CityId							= Number($('#cityEle_primary_key').val());
			jsonObject.MobileNumber						= $('#mobileNoEle').val();
			jsonObject.EmailAddress						= $('#emailEle').val();
			jsonObject.supportEmailAddress				= $('#supportEmailEle').val();
			jsonObject.address							= $('#addressEle').val();
			jsonObject.gstNumber						= $('#gstNumberEle').val();
			jsonObject.PanNumber						= $('#panNumberEle').val();
			jsonObject.companyWebsite					= $('#websiteEle').val();
			jsonObject.helpLineNumbers					= $('#helplineNumbersEle').val();
			//jsonObject.serverId							= $('#serverTypeEle').val();
			jsonObject.serverId							= serverIdentifier;
			jsonObject.destinationCityId				= Number($('#toCityEle_primary_key').val());
			jsonObject.subscriptionDays			= 15;
			jsonObject.groupTypeId				= $('#groupTypeEle').val();
			jsonObject.planTypeId				= $('#planTypeEle').val();
			jsonObject.testing					= testing;

			if (jsonObject.CityId === jsonObject.destinationCityId) {
				showAlertMessage('error', 'Source City and Destination City cannot be the same.');
				return;
			}
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/groupSetupWS/createGroup.do?', _this.setResponseAfterGroupCreation, EXECUTE_WITH_NEW_ERROR);
		}, setResponseAfterGroupCreation : function(response) {
			hideLayer();
			
			if(response.accountGroupId != undefined) {
				_this.resetData();
				refreshCache(0, accountGroupId);
				
				setTimeout(function() {
					//location.reload(true);
				}, 1500);
			}
		}, resetData : function() {
			$('input').val('');
			$('textarea').val('');
			$('input:checkbox, input:radio').prop('checked', false);
			$('select').prop('selectedIndex', 0);
		}
	});
});