define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'selectizewrapper',
	PROJECT_IVUIRESOURCES + '/js/generic/Utility.js',
	'JsonUtility',
	'nodvalidation',
	'messageUtility',
	'focusnavigation'//import in require.config
], function(Selection, Selectizewrapper) {
	'use strict';
	let jsonObject = {}, _this = '', myNod, myNod2;
	let currentVendorId = '';
	
	return Marionette.LayoutView.extend({
		initialize: function() { _this = this; },

		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/vendorMasterWS/loadVendorMasterData.do?', _this.setMasterDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setMasterDetails: function(response) {
			if (response.message !== undefined) {
				hideLayer();
				setTimeout(() => window.close(), 200);
				return;
			}

			let baseHtml = new $.Deferred();
			$("#mainContent").load("/ivcargo/html/master/vendorMaster/vendorMaster.html", function() { baseHtml.resolve(); });

			$.when(baseHtml).done(function() {
				initialiseFocus();
				let elementConfiguration = { serviceType: 'serviceType', searchVendorName: 'searchVendorName', bankNameElement : 'bankNameEle' };
				response.elementConfiguration		= elementConfiguration;
				response.serviceTypeSelection		= true;
				response.vendorNameSelection		= true;
				response.bankNameSelection			= true;
				
				Selection.setSelectionToGetData(response);
				
				_this.initializeValidation();
				_this.initializeEventHandlers();

				hideLayer();
			});
		},  initializeValidation: function() {
			myNod = nod();
			myNod.configure({ parentClass: 'validation-message' });
			myNod.add({ selector: '#vendorName', validate: 'presence', errorMessage: 'Enter Name !' });
			myNod.add({ selector: '#mobile1', validate: 'presence', errorMessage: 'Enter Mobile Number !' });
			myNod.add({ selector: '#serviceType', validate: 'validateAutocomplete:#serviceType', errorMessage: 'Select at least one Service Type !' });

			myNod2 = nod();
			myNod2.configure({ parentClass: 'validation-message' });
			myNod2.add({ selector: '#searchVendorName', validate: 'presence', errorMessage: 'Enter Name Or Mobile No. !' });
		}, initializeEventHandlers: function() {
			$("#createBtn").off("click").on("click", () => _this.switchToCreateMode());
			$("#editBtn").off("click").on("click", () => _this.switchToEditMode());
			$("#searchBtn").off("click").on("click", () => _this.searchVendor());
			$("#viewAllBtn").off("click").on("click", () => _this.viewAllVendors());

			$('#vendorName, #mobile1, #mobile2, #searchVendorName, #bankAccountNo, #bankNameEle, #gstn, #email, #ifsc').on('input', function() {
				let val = $(this).val();
				if ($(this).is('#vendorName, #bankNameEle, #searchVendorName')) {
					val = val.replace(/\s{2,}/g, ' ');
					val = val.trimStart(); 
				} else {
					val = val.replace(/\s+/g, '');
				}
				$(this).val(val);
			});
			
			$("#editRecordBtn").off("click").on("click", function() {
				_this.enableAllFields();
				$("#editRecordBtn").addClass("d-none");
				$("#updateBtn, #activateBtn, #deactivateBtn").removeClass("d-none");

				let markForDelete = $('#vendorFormSection').data('markForDelete');
				_this.updateActivateDeactivateButtons(markForDelete);
			});

			$("#updateBtn").off("click").on("click", function() {
				myNod.performCheck();
				if (myNod.areAll('valid')) _this.updateVendorRecord();
			});

			$("#activateBtn").off("click").on("click", function() {
				myNod.performCheck();
				if (!myNod.areAll('valid')) return; 
				
				if (!$(this).prop('disabled') && confirm("Are you sure you want to activate this vendor?")) {
					_this.setVendorStatus(false);
				}
			});

			$("#deactivateBtn").off("click").on("click", function() {
				myNod.performCheck();
				if (!myNod.areAll('valid')) return; 
				
				if (!$(this).prop('disabled') && confirm("Are you sure you want to deactivate this vendor?")) {
					_this.setVendorStatus(true);
				}
			});
			
			_this.setupSaveButtonForCreate();			
		}, switchToCreateMode: function() {
			$("#editSearchSection").addClass('d-none');
			$("#vendorFormSection").removeClass('d-none');
			$("#formTitle").text("Create New Vendor");
			$("#createBtn").addClass('active');
			$("#editBtn").removeClass('active');

			currentVendorId = '';
			$("#saveBtn").show();
			$("#editActionButtons").addClass("d-none");
			_this.clearAllFields();
			_this.enableAllFields();		  
			_this.setupSaveButtonForCreate();
		}, switchToEditMode: function() {
			$("#editSearchSection").removeClass('d-none');
			$("#vendorFormSection").addClass('d-none');
			$("#createBtn").removeClass('active');
			$("#editBtn").addClass('active');
			currentVendorId = '';
			_this.clearAllFields();
		}, setupSaveButtonForCreate: function() {
			$("#saveBtn").off("click").on("click", function() {
				myNod.performCheck();
				if (myNod.areAll('valid')) _this.saveVendorRecord();
			});
		}, validateInputs: function() {
			const mobile1 	= $('#mobile1').val().trim();
			const mobile2 	= $('#mobile2').val().trim();
			const email 	= $('#email').val().trim();
			const gstn 		= $('#gstn').val().trim();
			
			 if (mobile1.length !== 10) {
				showMessage('error', 'Primary mobile number must be exactly 10 digits.');
				return false;
			 }
			 if (mobile2 !== '') {
				if (mobile2.length !== 10) {
					showMessage('error', 'Alternate mobile number must be exactly 10 digits.');
					return false;
				}
		    }
		   
			if (!validateInput(2, 'mobile1', '', '', 'Please enter a valid 10-digit mobile number starting with 6-9.'))
				return false;

			if (mobile2 !== '' && !validateInput(2, 'mobile2', '', '', 'Please enter a valid 10-digit alternate mobile number starting with 6-9.'))
				return false;

			if (mobile2 !== '' && mobile1 === mobile2) {
				showMessage('error', 'Primary and alternate mobile numbers cannot be the same.');
				return false;
			}
			
			if (email !== '' && !isValidEmailId('email')) {
				showMessage('error', 'Please enter a valid email address.');
				return false;
			}
			//genericfunction.js
			if (gstn !== '' && !validateValidGSTNumber('gstn', 'error')) {
				return false;
			}
			
			return true;
		}, searchVendor: function() {
			myNod2.performCheck();
			if (!myNod2.areAll('valid')) return;

			let vendorMasterId = $("#searchVendorName").val();
			showLayer();

			let jsonObject = { vendorMasterId: vendorMasterId };
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/vendorMasterWS/getVendorDetailsById.do?', _this.onVendorSearch, EXECUTE_WITHOUT_ERROR);
		}, onVendorSearch: function(response) {
			hideLayer();
			if (response.message !== undefined) {
				let msg = response.message;
				showMessage(msg.typeName, msg.typeSymble + " " + msg.description);
				$("#vendorFormSection").addClass('d-none');
				return;
			}
			
			if (response.vendorData) {
				$("#vendorFormSection").removeClass('d-none');
				_this.populateEditForm(response.vendorData);
				_this.disableAllFields();

				$("#saveBtn").hide();
				$("#editActionButtons").removeClass("d-none");
				$("#editRecordBtn").removeClass("d-none");
				$("#updateBtn, #activateBtn, #deactivateBtn").addClass("d-none");

				$("#formTitle").text("Edit Vendor");

				$('#vendorFormSection').data('markForDelete', response.vendorData.markForDelete);

				_this.updateActivateDeactivateButtons(response.vendorData.markForDelete);
			}
		}, populateEditForm: function(vendorData) {
			currentVendorId 		= vendorData.vendorMasterId;

			$("#vendorName").val(vendorData.name || '');
			$("#mobile1").val(vendorData.mobileNumber || '');
			$("#mobile2").val(vendorData.alternateMobileNumber || '');
			$("#email").val(vendorData.email || '');
			$("#gstn").val(vendorData.gstn || '');
			$("#bankAccountNo").val(vendorData.bankAccountNo || '');
			$("#ifsc").val(vendorData.ifscCode || '');
			
			if ($('#bankNameEle').exists()) {
				let selectizeInstance = $('#bankNameEle')[0].selectize;
				
				if (selectizeInstance) {
					selectizeInstance.enable();
					selectizeInstance.onSearchChange(' '); 
				
					setTimeout(() => {
						selectizeInstance.setValue(vendorData.bankId.toString());
					}, 800);
				}
			}
			
			let serviceTypeIds	= vendorData.serviceTypeMasterIds;

			if ($('#serviceType').exists()) {
				let selectizeInstance = $('#serviceType')[0].selectize;
				if (selectizeInstance) {
					let idsToSet = (serviceTypeIds && serviceTypeIds.length > 0) ? serviceTypeIds.split(",") : [];
					selectizeInstance.setValue(idsToSet);
				}
			}
			
			 $('#vendorFormSection').data('markForDelete', vendorData.markForDelete);
		}, saveVendorRecord: function() {
			if (!_this.validateInputs()) return;
			if (!confirm("Are you sure you want to save this vendor?")) return;

			showLayer();
			let jsonDataObject 	= _this.prepareVendorData();
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/master/vendorMasterWS/createNewVendor.do?', _this.onSaveVendor, EXECUTE_WITHOUT_ERROR);
		}, onSaveVendor: function(response) {
			hideLayer();
			if (response.message == undefined)
				return;
			else
				 _this.clearAllFields();
		}, updateVendorRecord: function() {
			let markForDelete 		= $('#vendorFormSection').data('markForDelete');
			if (markForDelete == 1 || markForDelete === true) {
				showMessage('error', 'Cannot update an inactive vendor. Please activate the vendor first.');
				return;
			}
			if (!_this.validateInputs()) return;
			if (!confirm("Are you sure you want to update this vendor?")) return;

			showLayer();
			let jsonDataObject 				= _this.prepareVendorData();
			jsonDataObject.vendorMasterId 	= currentVendorId;
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/master/vendorMasterWS/updateVendor.do?', _this.onUpdateVendor, EXECUTE_WITHOUT_ERROR);
		}, onUpdateVendor: function(response) {
			hideLayer();
			if (response.message == undefined)
				return;
		}, prepareVendorData: function() {
			let jsonDataObject = {
				name:						$('#vendorName').val(),
				mobileNumber:				$('#mobile1').val(),
				alternateMobileNumber:		$('#mobile2').val(),
				gstn:						$('#gstn').val(),
				email:						$('#email').val(),
				bankAccountNo:				$('#bankAccountNo').val(),
				bankId:						$('#bankNameEle').val(),
				ifscCode:					$('#ifsc').val(),
			};
			
			if ($('#serviceType').exists()) {
				jsonDataObject.serviceTypeMasterIds = $('#serviceType').val();
			}

			return jsonDataObject;
		}, setVendorStatus: function(isActive) {
			showLayer();
			let jsonDataObject = { vendorMasterId: currentVendorId, markForDelete: isActive };
			getJSON(jsonDataObject, WEB_SERVICE_URL + '/master/vendorMasterWS/updateVendorStatusByVendorMasterId.do?',_this.onUpdateVendorStatus, EXECUTE_WITHOUT_ERROR)			   
		}, onUpdateVendorStatus: function(response) {
			hideLayer();
			
			if (response.message == undefined)
				return;
			$('#vendorFormSection').data('markForDelete', response.markForDelete);
			
			_this.updateActivateDeactivateButtons(response.markForDelete);
		}, updateActivateDeactivateButtons: function(markForDelete) {
			if (markForDelete == 0 || markForDelete === false) { 
				$("#activateBtn").prop("disabled", true);
				$("#deactivateBtn").prop("disabled", false);
			} else { 
				$("#activateBtn").prop("disabled", false);
				$("#deactivateBtn").prop("disabled", true);
			}
		}, viewAllVendors: function() {
			window.open('viewDetails.do?pageId=340&eventId=2&modulename=vendorMasterDetails', 'newwindow','height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, clearAllFields: function() {
			$('#vendorName, #mobile1, #mobile2, #email, #gstn, #bankAccountNo, #ifsc').val('');

			if ($('#serviceType').exists()) {
				let selectizeInstance = $('#serviceType')[0].selectize;
				if (selectizeInstance) selectizeInstance.clear();
			}
			
			if ($('#searchVendorName').exists()) {
				let searchInstance = $('#searchVendorName')[0].selectize;
				if (searchInstance) searchInstance.clear();
			}			
			
			if ($('#bankNameEle').exists()) {
				let bankInstance = $('#bankNameEle')[0].selectize;
				if (bankInstance) bankInstance.clear();
			}
		}, disableAllFields: function() {
			$('#vendorName, #mobile1, #mobile2, #email, #gstn, #bankAccountNo, #ifsc').prop('disabled', true);
			
			if ($('#serviceType').exists()) {
				let selectizeInstance = $('#serviceType')[0].selectize;
				if (selectizeInstance) selectizeInstance.disable();
			}
			
			if ($('#bankNameEle').exists()) {
				let selectizeInstance = $('#bankNameEle')[0].selectize;
				if (selectizeInstance) selectizeInstance.disable();
			}
		}, enableAllFields: function() {
			$('#vendorName, #mobile1, #mobile2, #email, #gstn, #bankAccountNo, #ifsc').prop('disabled', false);
			
			if ($('#serviceType').exists()) {
				let selectizeInstance = $('#serviceType')[0].selectize;
				if (selectizeInstance) selectizeInstance.enable();
			}
			
			if ($('#bankNameEle').exists()) {
				let selectizeInstance = $('#bankNameEle')[0].selectize;
				if (selectizeInstance) selectizeInstance.enable();
			}
		}
	});
});
