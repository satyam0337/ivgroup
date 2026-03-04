define([
	'selectizewrapper',
	PROJECT_IVUIRESOURCES + '/js/generic/Utility.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'nodvalidation',
	'focusnavigation'
], function (SelectizeWrapper, Selection) {
	'use strict';
	var _this = '', myNod, configuration;

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON({}, WEB_SERVICE_URL + '/vehicleAgentMasterWS/loadCreateVehicleAgent.do?', _this.setMasterDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setMasterDetails : function(response) {
			hideLayer();
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/master/vehicleAgentMaster/vehicleAgentMaster.html", function () {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				configuration	= response;
				
				if (configuration.showVehicleAgentBankDetailsFields)
					$('.bankDetails').removeClass('hide');

				if (configuration.showBeneficiaryNameInBankDetails)
					$('.beneficiaryNameDetails').removeClass('hide');
							
				if (configuration.showOwnerType)
					$('#ownerTypeRow').removeClass('hide');

				if (response.tdsOwnerTypeList && Array.isArray(response.tdsOwnerTypeList)) {
					var ownerTypeEle = $('#ownerTypeEle');
					ownerTypeEle.empty().append('<option value="0">---- Select Owner Type ----</option>');
								
					response.tdsOwnerTypeList.forEach(item => {
						ownerTypeEle.append('<option value="' + item.tdsTypeId + '">' + item.tdsTypeName + '</option>');
					});
				}
							
				if (configuration.showIsSpecified) $('#isSpecifiedRow').removeClass('hide');
				if (configuration.showTdsDeductible) $('#tdsDeductibleRow').removeClass('hide');
				
				if (configuration.validateBeneficiaryName)
					$("*[data-attribute=beneficiaryName]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				
				if (configuration.validateVehicleAgentBankDetailsFields) {
					$("*[data-attribute=bankName]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute=accountNo]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute=ifscCode]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute=branchAddress]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
				
				if (configuration.validateVehicleAgentPanNumber)
					$("*[data-attribute=panNo]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
					
				if (configuration.validateVehicleAgentEmailAddress)
					$("*[data-attribute=emailAddress]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
					
				if (configuration.validateGstn)
					$("*[data-attribute=gstn]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				
				const VEHICLE_OWNERS = [
					{ vehicleOwnerId: HIRED_VEHICLE_ID, ownerName: HIRED_VEHICLE_NAME },
					{ vehicleOwnerId: ATTACHED_VEHICLE_ID, ownerName: ATTACHED_VEHICLE_NAME },
				];
									
				var ownerEle = $('#vehicleOwnerEle');
				ownerEle.empty().append('<option value="0">------ Select Owner ------</option>');
									
				VEHICLE_OWNERS.forEach(function(item) {
					ownerEle.append('<option value="' + item.vehicleOwnerId + '">' + item.ownerName + '</option>');
				});
				
				_this.bindEvents();
				_this.setVehicleAgent();
				_this.setCityAutoComplete();
				
				if (configuration.showVehicleAgentBankDetailsFields)
					_this.setBankNameAutoComplete();
			});
		}, setBankNameAutoComplete: function() {
			SelectizeWrapper.setAutocomplete({
				url: WEB_SERVICE_URL + '/selectOptionsWS/getBankMasterListOption.do',
				valueField			: 'bankId',
				labelField			: 'bankName',
				searchField			: 'bankName',
				elementId			: 'bankNameEle',
				responseObjectKey	: 'bankList',
				create				:	false,
				maxItems			:	1
			});
		}, setVehicleAgent: function () {
			SelectizeWrapper.setAutocomplete({
				url: WEB_SERVICE_URL + '/autoCompleteWS/getVehicleAgentAutocomplete.do?',
				valueField			: 'vehicleAgentMasterId',
				labelField			: 'name',
				searchField			: 'name',
				elementId			: 'searchVehicleAgentEle',
				responseObjectKey	: 'result',
				create				: false,
				maxItems			: 1,
				onChange: function (selectedId) {
					if (selectedId)
						_this.getVehicleAgentDetailsById(selectedId);
					else
						_this.toggleButtonsForAgentSelection(false);
				}
			});
		}, setCityAutoComplete: function () {
			SelectizeWrapper.setAutocomplete({
				url: WEB_SERVICE_URL + '/selectOptionsWS/getAllCityOfGroup.do',
				valueField			: 'cityId',
				labelField			: 'name',
				searchField			: 'name',
				elementId			: 'cityEle',
				responseObjectKey	: 'cityList',
				create				: 	false,
				maxItems			: 	1,
				onChange: function (value) {
					if (value) {
						setTimeout(function () {
							$('#pinCodeEle').focus();
						}, 100);
					}
				}
			});
		}, getVehicleAgentDetailsById: function (selectedId) {
			if (!selectedId) return;
			
			showLayer();
			let jsonDataObject = { vehicleAgentMasterId: selectedId };
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/vehicleAgentMasterWS/getVehicleAgentMasterDetailById.do', _this.getVehicleAgentDetails, EXECUTE_WITHOUT_ERROR);
		}, getVehicleAgentDetails: function(data) {
			hideLayer();
			if (data && data.vehicleAgentMaster) {
				_this.populateAgentDetails(data.vehicleAgentMaster);
				_this.toggleButtonsForAgentSelection(true, data.vehicleAgentMaster.status);
			} else {
				showAlertMessage('error', 'No data found for this Vehicle Agent.');
				_this.toggleButtonsForAgentSelection(false);
			}
		}, populateAgentDetails: function (agent) {
			$('#nameEle').val(agent.name || '');
			$('#addressEle').val(agent.address || '');
			$('#vehicleOwnerEle').val(agent.vehicleOwnerId || '0');
			
			var citySelectize = $('#cityEle')[0].selectize;
			citySelectize.addOption({ cityId: agent.cityId, cityName: agent.name });
			citySelectize.setValue(agent.cityId);
			
			$('#pinCodeEle').val(agent.pincode || '');
			$('#contactPersonEle').val(agent.contactPerson || '');
			
			if ((agent.phoneNumber && agent.phoneNumber.includes('-')) || (agent.PhoneNumber && agent.PhoneNumber.includes('-'))) {
				var phone1 = agent.phoneNumber || agent.PhoneNumber;
				var parts1 = phone1.split('-');
				$('#stdCode1Ele').val(parts1[0] || '');
				$('#phNumber1Ele').val(parts1[1] || '');
			} else {
				$('#stdCode1Ele').val(agent.stdCode1 || '');
				$('#phNumber1Ele').val(agent.phoneNumber || agent.PhoneNumber || '');
			}
			
			if((agent.phoneNumber2 && agent.phoneNumber2.includes('-')) || (agent.PhoneNumber2 && agent.PhoneNumber2.includes('-'))) {
				var phone2 = agent.phoneNumber2 || agent.PhoneNumber2;
				console.log('Splitting phone2:', phone2);
				var parts2 = phone2.split('-');
				console.log('Split parts:', parts2);
				$('#stdCode2Ele').val(parts2[0] || '');
				$('#phNumber2Ele').val(parts2[1] || '');
			} else {
				$('#stdCode2Ele').val(agent.stdCode2 || '');
				$('#phNumber2Ele').val(agent.phoneNumber2 || agent.PhoneNumber2 || '');
			} 
			
			$('#mobileNumber1Ele').val(agent.mobileNumber || '');
			$('#mobileNumber2Ele').val(agent.mobileNumber2 || '');
			$('#emailAddressEle').val(agent.emailId || '');
			$('#panNoEle').val(agent.panNo || '');
			$('#gstnEle').val(agent.gstn || '');
			$('#bankNameEle').val(agent.bankNameId || '0');
			$('#accountNoEle').val(agent.accountNo || '');
			$('#ifscCodeEle').val(agent.ifscCode || '');
			$('#branchAddressEle').val(agent.bankBranchAddress || '');
			$('#descriptionEle').val(agent.description || '');
			$('#ownerTypeEle').val(agent.ownerTypeId || '0');
			$('input[name="isSpecified"][value="' + (agent.isSpecified ? 'true' : 'false') + '"]').prop('checked', true);
			$('input[name="tdsDeductible"][value="' + (agent.tdsDeductible ? 'true' : 'false') + '"]').prop('checked', true);

			if (configuration.showBeneficiaryNameInBankDetails)
				$('#beneficiaryNameEle').val(agent.beneficiaryName || '');
			
			$('input, textarea').prop('disabled', true).css('background-color', '#fff !important');
			$('#searchVehicleAgentEle')[0].selectize.enable();
		}, bindEvents: function () {
			$('#addBtn, #addBtnBottom').click(function () { _this.addVehicleAgent(); });
			$('#editBtn, #editBtnBottom').click(function () { _this.editVehicleAgent(); });
			$('#deleteBtn, #deleteBtnBottom').click(function () { _this.deleteVehicleAgent(); });
			$('#resetBtn, #resetBtnBottom').click(function () { _this.resetElements(); });
			$('#viewAllBtn').click(function () { _this.viewAllAgents(); });
			$('#activateBtn, #activateBtnBottom').click(function () { _this.activateDeactivateVehicleAgent(0); });
			$('#deactivateBtn, #deactivateBtnBottom').click(function () { _this.activateDeactivateVehicleAgent(1); });
			
			$('#nameEle, #panNoEle').on('keyup', function () { this.value = this.value.toUpperCase(); });
		}, validateForm: function () {
			var name			= $('#nameEle').val().trim();
			var cityId			= $('#cityEle').val();
			var vehicleOwner	= $('#vehicleOwnerEle').val();
			var mobile1			= $('#mobileNumber1Ele').val()
			var pan				= $('#panNoEle').val().trim().toUpperCase();
			var email			=$('#emailAddressEle').val();
			var gstn			=$('#gstnEle').val();
			
			if (!name) {
				showAlertMessage('error', 'Please enter Agent Name!');
				setTimeout(() => $('#nameEle').focus(), 100);
				return false;
			}
			
			if (!cityId || cityId === '0') {
				showAlertMessage('error', 'Please select a City!');
				setTimeout(() => $('#cityEle')[0].selectize.focus(), 100);
				return false;
			}

			if (!vehicleOwner || vehicleOwner === '0') {
				showAlertMessage('error', 'Please select Vehicle Owner!');
				setTimeout(() => $('#vehicleOwnerEle').focus(), 100);
				return false;
			}
			
			if (!validateInputTextFeild(2, 'mobileNumber1Ele', 'mobileNumber1Ele', 'error', 'Please enter a valid 10-digit mobile number starting with 6-9.'))
				return false;

			if (configuration.validateVehicleAgentPanNumber) {
				if (!validateInputTextFeild(1, 'panNoEle', 'panNoEle', 'error', 'Please enter PAN Number!'))
					return false;
				
				if (!validateInputTextFeild(8, 'panNoEle', 'panNoEle', 'error', 'Please enter valid PAN Number!'))
					return false;
			}
			
			if (configuration.validateVehicleAgentEmailAddress) {
				if (!validateInputTextFeild(1, 'emailAddressEle', 'emailAddressEle', 'error', 'Please enter Email Address!'))
					return false;
				
				if (!validateInputTextFeild(15, 'emailAddressEle', 'emailAddressEle', 'error', 'Please enter valid Email Address!'))
					return false;
			}
			
			if (configuration.validateGstn) {
				if (!validateInputTextFeild(1, 'gstnEle', 'gstnEle', 'error', 'Please enter GSTN Number!'))
					return false;
				
				if (!validateInputTextFeild(10, 'gstnEle', 'gstnEle', 'error', 'Please enter valid GSTN Number!'))
					return false;
			}

			$('#nameEle').val(name.toUpperCase());
			$('#addressEle').val($('#addressEle').val().trim().toUpperCase());
			$('#contactPersonEle').val($('#contactPersonEle').val().trim().toUpperCase());
			$('#panNoEle').val(pan);
			$('#emailAddressEle').val(email);
			$('#gstnEle').val(gstn);
			
			return true;
		}, validateBankDetails: function () {
			var bankName = $('#bankNameEle').val();
			var accountNo = $('#accountNoEle').val();
			var ifsc = $('#ifscCodeEle').val();
			var branch = $('#branchAddressEle').val();
			var desc = $('#descriptionEle').val();
			var beneficiary = $('#beneficiaryNameEle').val();
			
			if (configuration.validateVehicleAgentBankDetailsFields) {
				if (!bankName || bankName === '0') {
					showAlertMessage('error','Please select Bank Name!');
					setTimeout(() => $('#bankNameEle').focus(), 200);
					return false;
				}
		
				if (!accountNo) {
					showAlertMessage('error','Please enter Account Number!');
					setTimeout(() => $('#accountNoEle').focus(), 200);
					return false;
				}
			
				if (!ifsc) {
					showAlertMessage('error','Please enter IFSC Code!');
					setTimeout(() => $('#ifscCodeEle').focus(), 200);
					return false;
				}
			
				if (!branch) {
					showAlertMessage('error','Please enter Branch Address!');
					setTimeout(() => $('#branchAddressEle').focus(), 200);
					return false;
				}
			
				if (!desc) {
					showAlertMessage('error','Please enter Description!');
					setTimeout(() => $('#descriptionEle').focus(), 200);
					return false;
				}
			}
			
			if (configuration.validateBeneficiaryName) {
				if (!beneficiary) {
					showAlertMessage('error','Please enter Beneficiary Name!');
					setTimeout(() => $('#beneficiaryNameEle').focus(), 200);
					return false;
				}
			}
			
			return true;
		}, addVehicleAgent: function () {
			if (event) {
				event.preventDefault();
				$(event.target).blur();
			}
			
			if (!_this.validateForm()) return;
			if (!_this.validateBankDetails()) return;
			if (!confirm('Are you sure you want to add this Vehicle Agent?')) return;

			showLayer();
			getJSON(_this.dataForInsertUpdate(), WEB_SERVICE_URL + '/vehicleAgentMasterWS/saveVehicleAgent.do', _this.onAddVehicleAgent, EXECUTE_WITH_ERROR);
		}, dataForInsertUpdate : function() {
			let jsonDataObject = {
				vehicleAgentName: $('#nameEle').val().trim().toUpperCase(),
				name: $('#nameEle').val().trim().toUpperCase(),
				vehicleAgentAddress: $('#addressEle').val(),
				address: $('#addressEle').val(),
				vehicleOwnerId: $('#vehicleOwnerEle').val(),
				vehicleOwner: $('#vehicleOwnerEle').val(),
				cityId: $('#cityEle').val(),
				CityId: $('#cityEle').val(),
				pincode: $('#pinCodeEle').val(),
				pinCode: $('#pinCodeEle').val(),
				contactPerson: $('#contactPersonEle').val(),
				contactPersonName: $('#contactPersonEle').val(),
				stdCode1: $('#stdCode1Ele').val().trim(),
				phoneNumber: $('#stdCode1Ele').val().trim() ? $('#stdCode1Ele').val().trim() + '-' + $('#phNumber1Ele').val().trim() : $('#phNumber1Ele').val().trim(),
				PhoneNumber: $('#stdCode1Ele').val().trim() ? $('#stdCode1Ele').val().trim() + '-' + $('#phNumber1Ele').val().trim() : $('#phNumber1Ele').val().trim(),
			
				stdCode2: $('#stdCode2Ele').val().trim(),
				phoneNumber2: $('#stdCode2Ele').val().trim() ? $('#stdCode2Ele').val().trim() + '-' + $('#phNumber2Ele').val().trim() : $('#phNumber2Ele').val().trim(),
				PhoneNumber2: $('#stdCode2Ele').val().trim() ? $('#stdCode2Ele').val().trim() + '-' + $('#phNumber2Ele').val().trim() : $('#phNumber2Ele').val().trim(),
				mobileNumber: $('#mobileNumber1Ele').val(),
				MobileNumber: $('#mobileNumber1Ele').val(),
				mobileNumber2: $('#mobileNumber2Ele').val(),
				MobileNumber2: $('#mobileNumber2Ele').val(),
				emailId: $('#emailAddressEle').val(),
				panNo: $('#panNoEle').val().trim() || ' ',
				PanNumber: $('#panNoEle').val().trim() || ' ',
				gstn: $('#gstnEle').val(),
				bankNameId: $('#bankNameEle').val(),
				bankId: $('#bankNameEle').val(),
				accountNo: $('#accountNoEle').val(),
				ifscCode: $('#ifscCodeEle').val(),
				ifsc: $('#ifscCodeEle').val(),
				bankBranchAddress: $('#branchAddressEle').val(),
				branchAddress: $('#branchAddressEle').val(),
				description: $('#descriptionEle').val(),
				beneficiaryName: $('#beneficiaryNameEle').val() || '',
				ownerTypeId: $('#ownerTypeEle').val() || '0',
				ownerType: $('#ownerTypeEle').val() || '0',
				isSpecified: $('input[name="isSpecified"]:checked').val() === 'true',
				tdsDeductible: $('input[name="tdsDeductible"]:checked').val() === 'true'
			};
						
			return jsonDataObject;
		}, onAddVehicleAgent: function (resp) {
			hideLayer();
			
			if (resp && resp.message && resp.message.type === MESSAGE_TYPE_SUCCESS){
				_this.resetElements();
				_this.render();			
			}

		}, editVehicleAgent: function () {
			if (event) {
				event.preventDefault();
				$(event.target).blur();
			}
			
			var selectedId = $('#searchVehicleAgentEle').val();
			if (!selectedId) { showAlertMessage('error', 'Please select a Vehicle Agent to edit.'); return; }
			
			if ($('#editBtn').text() === 'Edit') {
				$('#addBtn, #addBtnBottom').prop('disabled', true).addClass('btn_print_disabled');
				$('#editBtn, #editBtnBottom').text('Save');
				$('#deleteBtn, #deleteBtnBottom').text('Cancel');
				$('input, select, textarea').prop('disabled', false);
			} else {
				if (!_this.validateForm()) return;
				if (!_this.validateBankDetails()) return;
				if (!confirm('Are you sure you want to update this Vehicle Agent?')) return;

				let jsonDataObject = _this.dataForInsertUpdate();
				jsonDataObject.vehicleAgentMasterId = selectedId;

				showLayer();
				getJSON(jsonDataObject, WEB_SERVICE_URL + '/vehicleAgentMasterWS/updateVehicleAgent.do', _this.onEditVehicleAgent, EXECUTE_WITH_ERROR);
			}
		}, onEditVehicleAgent: function (resp) {
			hideLayer();
			
			if (resp.message && resp.message.type == MESSAGE_TYPE_SUCCESS) {
				$('#editBtn, #editBtnBottom').text('Edit');
				$('#deleteBtn, #deleteBtnBottom').text('Delete');
				$('#addBtn, #addBtnBottom').prop('disabled', false).removeClass('btn_print_disabled').addClass('btn_print');
				_this.resetElements();
				_this.render();			
			}
		}, deleteVehicleAgent: function () {
			var selectedId = $('#searchVehicleAgentEle').val();
			
			if ($('#deleteBtn').text() === 'Cancel') {
				$('#editBtn, #editBtnBottom').text('Edit');
				$('#deleteBtn, #deleteBtnBottom').text('Delete');
				$('#addBtn, #addBtnBottom').prop('disabled', false).removeClass('btn_print_disabled').addClass('btn_print');
				_this.resetElements();
				return;
			}

			if (!confirm('Are you sure you want to delete this Vehicle Agent?')) return;

			let jsonDataObject = { vehicleAgentMasterId: selectedId };
			showLayer();
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/vehicleAgentMasterWS/deleteVehicleAgent.do', _this.onDeleteVehicleAgent, EXECUTE_WITH_ERROR);
		}, onDeleteVehicleAgent: function (resp) {
			hideLayer();
		
			if (resp.message && resp.message.type == MESSAGE_TYPE_SUCCESS) {
				_this.resetElements();
				_this.render();			
			}
		}, activateDeactivateVehicleAgent: function (isDeactivate) {
			var selectedId = $('#searchVehicleAgentEle').val();
			
			if (!selectedId) {
				showAlertMessage('error', 'Please select a Vehicle Agent first!');
				return;
			}

			if (!confirm(isDeactivate ? 'Are you sure you want to deactivate this Vehicle Agent?' : 'Are you sure you want to activate this Vehicle Agent?')) 
				return;
			
			let jsonDataObject = {
				vehicleAgentMasterId: selectedId,
				status: isDeactivate ? 1 : 0
			};

			showLayer();
			
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/vehicleAgentMasterWS/updateVehicleAgentStatus.do', _this.onActivateDeactivateVehicleAgent, EXECUTE_WITH_ERROR);
		}, onActivateDeactivateVehicleAgent: function (resp) {
			hideLayer();
		
			if (resp.message && resp.message.type == MESSAGE_TYPE_SUCCESS) {
				_this.resetElements();
				_this.render();			
			}
		}, resetElements: function() {
			$('input[type="text"], textarea').val('');
			$('select').val('0');
			$('#cityEle').val('');
			$('#searchVehicleAgentEle')[0]?.selectize?.clear();
			$('#cityEle')[0]?.selectize?.clear();
			$('input, select, textarea').prop('disabled', false);
			_this.toggleButtonsForAgentSelection(false);
			$('#searchVehicleAgentEle')[0]?.selectize?.focus();
		}, viewAllAgents: function () {
			window.open('viewDetails.do?pageId=340&eventId=2&modulename=vehicleAgentMasterDetails', '_blank');
		}, toggleButtonsForAgentSelection: function (agentSelected, status) {
			if (agentSelected) {
				$('#addBtn, #addBtnBottom').prop('disabled', true).addClass('btn_print_disabled');
				$('#editBtn, #editBtnBottom, #deleteBtn, #deleteBtnBottom').prop('disabled', false).removeClass('btn_print_disabled').addClass('btn_print');
				
				if (status == 0) {
					$('#deactivateBtn, #deactivateBtnBottom').removeClass('hide').show();
					$('#activateBtn, #activateBtnBottom').hide().addClass('hide');
				} else {
					$('#activateBtn, #activateBtnBottom').removeClass('hide').show();
					$('#deactivateBtn, #deactivateBtnBottom').hide().addClass('hide');
				}
			} else {
				$('#addBtn, #addBtnBottom').prop('disabled', false).removeClass('btn_print_disabled').addClass('btn_print');
				$('#editBtn, #editBtnBottom, #deleteBtn, #deleteBtnBottom').prop('disabled', true).removeClass('btn_print').addClass('btn_print_disabled');
				$('#activateBtn, #activateBtnBottom, #deactivateBtn, #deactivateBtnBottom').hide().addClass('hide');
			}
		}
	});
});