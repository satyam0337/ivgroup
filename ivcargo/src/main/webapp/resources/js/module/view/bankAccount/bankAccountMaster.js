let branchList;
let Selectizewrapper2;
let showStoreIdField = false;  // Variable to store the configuration

define([
	'marionette'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/bankAccount/bankAccountDetails.js'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'validation'
	,'autocompleteWrapper'
	,'focusnavigation'
	,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Marionette, Selectizewrapper, Selection, BankAcountDetails) {
	'use strict'; 
	let myNod,
	isAllowToSave = true,
	isAllowToUpdate	= false,
	isAllowToDelete	= false,
	_this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL	+ '/bankAccountWS/getBankAccountElementConfiguration.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/master/bankAccount/bankAccountMaster.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject 		= Object.keys(response);
				
				// Store the configuration value
				showStoreIdField = response.showStoreIdFieldInQRMapping || false;
				
				// Initialize table headers based on configuration
				initializeTableHeaders();
				
				prepareDynamicBranchFieldInTable();
				
				for (const element of keyObject) {
					if (!response[element])
						$("*[data-attribute="+ element+ "]").addClass("hide");
					
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				_this.setCreateData(response);
				
				let autobankName 			= new Object();
				autobankName.primary_key 	= 'bankAccountId';
				autobankName.field 			= 'bankAccountNumber';
				autobankName.callBack 		= _this.getBankAccountDetails;
				
				$("#searchAccountEle").autocompleteCustom(autobankName);
				
				$("#searchAccountEle").keypress(function(){
					getJSON(null, WEB_SERVICE_URL+'/bankAccountWS/getBankAccountForDropdown.do', _this.setBankAccount, EXECUTE_WITH_ERROR);
				});
				
				hideLayer();
			});
		}, setBankAccount : function(jsonObj){
			let autobankName = $("#searchAccountEle").getInstance();
			
			$( autobankName ).each(function() {
				this.option.source = jsonObj.BankAccount;
			});
		}, setCreateData : function(response) {
			let executive				= response.executive;
			let elementConfiguration	= new Object();
			
			response.bankNameSelection	= true;
			elementConfiguration.bankNameElement	= $('#bankAccountName');
			
			Selectizewrapper2 = Selectizewrapper;
			branchList = response.branchList;
			
			if (response['region'] || response['subRegion'] || response['branch']) {
				response.sourceAreaSelection		= true;
				response.AllOptionsForSubRegion		= false;
				response.AllOptionsForBranch		= false;
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region');
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Sub Region');
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch');
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Sub Region');
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch');
				}

				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN)
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch');
		  	}
		  
			response.elementConfiguration	= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			myNod.add({
				selector		: '#bankAccountName',
				validate		: 'presence',
				errorMessage	: 'Enter Bank Name'
			});
			
			if (response['bankAccountNumber']) {
				addElementToCheckEmptyInNode(myNod, 'bankAccountNumber', 'Enter Account Number');
				
				if(response.AllowAlphanumericBankAccountNumber)
					addElementToCheckAlphaNumeric(myNod, 'bankAccountNumber', 'Enter only Alphnumeric Number');
				else
					addElementToCheckNumericInNode(myNod, 'bankAccountNumber', 'Enter Account Number');
			}

			if (response['bankPhoneNumber'])
				addElementToCheckNumericInNode(myNod, 'bankPhoneNumber', 'Should be numeric');

			$("#saveBtn").click(function() {
				if(isAllowToSave) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.saveBankAccount();
				}
			});
			
			$("#updateBtn").click(function() {
				if(isAllowToUpdate) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateBankAccount();
				}
			});
			
			$("#deleteBtn").click(function() {
				if(isAllowToDelete) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.deleteBankAccount();
				}
			});
			
			$("#resetBtn").click(function() {
				_this.resetBankAccount();
			});
			
			$("#saveQrCodeMapping").click(function() {
				_this.saveQrCodeMappingData();
			});
			
			$("#viewBtn").click(function() {
				_this.viewBankAcountDetails();
			});
		}, setButtons : function(flag) {
			if (!flag) {
				$("#saveBtn").addClass("disabled");
				$("#deleteBtn").removeClass("disabled");
				
				$(".formInput").change(function() {
					isAllowToUpdate	= true;
					$('#updateBtn').removeClass("disabled");
				});
			}
		}, showResponseAfterOperation : function (response) {
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				_this.resetBankAccount();
				return;
			}
			
			hideLayer();
		}, getBankAccountDetails : function () {
			let jsonObject = new Object();
			jsonObject.bankAccountId = $("#searchAccountEle_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/bankAccountWS/getBankAccountById.do', _this.setForEdit, EXECUTE_WITH_ERROR);
		}, setForEdit : function (response) {
			let bankAccount	= response.BankAccount;
			$("#regionEle").val(bankAccount.regionName);
			$("#subRegionEle").val(bankAccount.subRegionName);
			$("#branchEle").val(bankAccount.branchName);
			$("#bankAccountName").val(bankAccount.bankAccountName);
			$("#bankAccountNumber").val(bankAccount.bankAccountNumber);
			$("#bankDescription").val(bankAccount.bankDescription);
			$("#bankPhoneNumber").val(bankAccount.bankPhoneNumber);
			$("#bankAddress").val(bankAccount.bankAddress);
			$("#regionEle_primary_key").val(bankAccount.regionId);
			$("#subRegionEle_primary_key").val(bankAccount.subRegionId);
			$("#branchEle_primary_key").val(bankAccount.branchId);
			$("#bankOpeningBalanceEle").val(bankAccount.openingBalance);
			$("#bankAccountName_primary_key").val(bankAccount.bankId);
			$("#ifscCode").val(bankAccount.ifscCode);
			$("#micrCode").val(bankAccount.micrCode);
			
			isAllowToSave		= false;
			isAllowToDelete		= true;

			_this.setButtons(false);
		}, getBankDetailsForSaveOrUpdate : function() {
			let jsonObject = new Object();
			let $inputs = $('#bottom-border-boxshadow :input');
			$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
				
			jsonObject.bankId			= $('#bankAccountName_primary_key').val();
			jsonObject.bankAccountId	= $('#searchAccountEle_primary_key').val();
			jsonObject.branchId			= $('#branchEle_primary_key').val();
			
			return jsonObject;
		}, saveBankAccount : function() {
			if (confirm("Are you sure?")) {
				showLayer();
				let jsonObject 	= _this.getBankDetailsForSaveOrUpdate();
				getJSON(jsonObject, WEB_SERVICE_URL+'/bankAccountWS/saveBankAccount.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, updateBankAccount : function() {
			if (confirm("Are you sure?")) {
				showLayer();
				let jsonObject 	= _this.getBankDetailsForSaveOrUpdate();
				getJSON(jsonObject, WEB_SERVICE_URL+'/bankAccountWS/updateBankAccount.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, deleteBankAccount : function() {
			if (confirm("Are you sure?")) {
				showLayer();
				let jsonObject 	= _this.getBankDetailsForSaveOrUpdate();
				getJSON(jsonObject, WEB_SERVICE_URL+'/bankAccountWS/deleteBankAccount.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, resetBankAccount : function() {
			$("#regionEle").val("");
			$("#subRegionEle").val("");
			$("#branchEle").val("");
			$("#bankAccountName").val("");
			$("#bankAccountNumber").val("");
			$("#bankDescription").val("");
			$("#bankPhoneNumber").val("");
			$("#bankAddress").val("");
			$("#regionEle_primary_key").val("");
			$("#subRegionEle_primary_key").val("");
			$("#branchEle_primary_key").val("");
			$("#searchAccountEle").val("");
			$("#ifscCode").val("");
			$("#micrCode").val("");
			isAllowToSave		= true;
			isAllowToUpdate		= false;
			isAllowToDelete		= false;
			$("#saveBtn").removeClass("disabled");
			$("#updateBtn").addClass("disabled");
			$("#deleteBtn").addClass("disabled");
			_this.setButtons(true);
		}, saveQrCodeMappingData : function() {
			showLayer();
	
			if(Number($('#searchAccountEle_primary_key').val()) <= 0) {
				showMessage("info","Select bank Account First ");
				return false;
			}
			
			let detailsArray 	= new Array();
			let branchIdsArray 	= new Array();
			let validateBranchEle 		= false;
			let validateStoreIdInput      = false;
			let validateQrCodeIdEle 	= false;
			let validateMerchandIdInput = false;
			
			$('input[name=branchSelection]').each(function() {
				if ($(this).val() == undefined || $(this).val().trim() == '') {
					$('#' + this.id).focus();
					validateBranchEle = true;
					return false;
				};

				let idArr = this.id.split('_');
				let appendId = '';
				
				if (idArr[1] != undefined)
					appendId = '_' + idArr[1];

				// Validate StoreId only if enabled
				if (showStoreIdField) {
					if ($('#storeIdInput' + appendId).val().trim() == '') {
						$('#storeIdInput' + appendId).focus();
						validateStoreIdInput = true;
						return false;
					};
				}

				if ($('#qrCodeIdInput' + appendId).val().trim() == '') {
					$('#qrCodeIdInput' + appendId).focus();
					validateQrCodeIdEle = true;
					return false;
				};

				if ($('#merchandIdInput' + appendId).val().trim() == '') {
					$('#merchandIdInput' + appendId).focus();
					validateMerchandIdInput = true;
					return false;
				};

				let detailsObject = new Object();
				detailsObject.branchIds 		= $(this).val();
				
				// Include StoreId only if enabled
				if (showStoreIdField) {
					detailsObject.storeId 			= $('#storeIdInput' + appendId).val().trim();
				}
				
				detailsObject.qrCodeId 			= $('#qrCodeIdInput' + appendId).val().trim().toUpperCase();
				detailsObject.merchantIdInput 	= $('#merchandIdInput' + appendId).val().trim().toUpperCase();
				
				let branchSplitArr = $(this).val().split(',');
				
				for(const element of branchSplitArr) {
					branchIdsArray.push(Number(element));	
				}
					
				detailsArray.push(detailsObject);
			});
			
			if(validateBranchEle) {
				showMessage("info", "Select Branch to process !!");
				hideLayer();
				return false;
			}
			
			// Check StoreId validation only if enabled
			if (showStoreIdField && validateStoreIdInput) {
				showMessage("info", "Enter Store Id to process !!");
				hideLayer();
				return false;
			}
			
			if(validateQrCodeIdEle) {
				showMessage("info", "Enter QR code Id to process !!");
				hideLayer();
				return false;
			}
			
			if(validateMerchandIdInput) {
				showMessage("info", "Enter merchant Id to process !!");
				hideLayer();
				return false;
			}
			
			let object = new Object();
			object.details 			= JSON.stringify(detailsArray);
			object.allBranchIds 	= [...new Set(branchIdsArray)].toString();
			object.bankAccountId	= $('#searchAccountEle_primary_key').val();
			
			getJSON(object, WEB_SERVICE_URL+'/bankAccountWS/saveQRcodeIdMappingToBankAccout.do', _this.showResponseAfterOperationDone, EXECUTE_WITH_ERROR);
		}, showResponseAfterOperationDone : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			if (data.message != undefined && data.message.messageId == 20)
				$('#qrCodeLinkToBankModal').modal('hide');
		}, viewBankAcountDetails : function() {
			var object = new Object();
	
			var btModal = new Backbone.BootstrapModal({
				content		: new BankAcountDetails(object),
				title		: 'Bank Account Details',
				modalWidth 	: 80,
				showFooter 	: true,
				cancelText	: "",
				okText		: "Close"
			}).open();
			object.btModal = btModal;
			new BankAcountDetails(object)
			btModal.open();
		}
	});
});

// Initialize table headers based on configuration
function initializeTableHeaders() {
	updateQRLinkingTableHeader();
	updateQRDisplayTableHeader();
}

// Update QR Linking Modal header
function updateQRLinkingTableHeader() {
	let thead = $('#qrLinkingTableHead');
	thead.empty();
	let tr = $('<tr></tr>');
	
	tr.append('<th>Branch</th>');
	
	// Conditionally add StoreId header
	if (showStoreIdField) {
		tr.append('<th>Store Id</th>');
	}
	
	tr.append('<th>QR code Id</th>');
	tr.append('<th>Merchant Id</th>');
	tr.append('<th>-</th>');
	
	thead.append(tr);
}

// Update QR Display Modal header
function updateQRDisplayTableHeader() {
	let thead = $('#qrDisplayTableHead');
	thead.empty();
	let tr = $('<tr></tr>');
	
	tr.append('<th>SR NO.</th>');
	tr.append('<th>Branch</th>');
	
	// Conditionally add StoreId header
	if (showStoreIdField) {
		tr.append('<th>Store Id</th>');
	}
	
	tr.append('<th>QR code Id</th>');
	tr.append('<th>Merchant Id</th>');
	tr.append('<th>Action</th>');
	
	thead.append(tr);
}

function showQRcodeMappingModal(){
	if(Number($('#searchAccountEle_primary_key').val()) <= 0){
		showMessage("info","Select bank Account to add QR code Mapping ");
		return false;
	}
	
	$('#AddQrTableBody').empty();
	let tr = $('<tr>');
	
	tr.append('<td><input class="form-control formInput" type="text" data-tooltip="Branch" name="branchSelection"  placeholder="Select Branch" id="branchSelection" /></td>');
	
	// Conditionally add StoreId field
	if (showStoreIdField) {
		tr.append('<td><input class="form-control formInput" type="text" data-tooltip="Store Id" name="storeIdInput"  placeholder="Store Id" id="storeIdInput" maxlength="16" /></td>');
	}
	
	tr.append('<td><input class="form-control formInput" type="text" data-tooltip="QR code Id" name="qrCodeIdInput"  placeholder="QR Code Id" id="qrCodeIdInput" maxlength="25" /></td>');
	tr.append('<td><input class="form-control formInput" type="text" data-tooltip="Merchant Id" name="merchandIdInput"  placeholder="Merchant Id" id="merchandIdInput" maxlength="25" /></td>');
	tr.append('<td></td>');
	
	$('#AddQrTableBody').append(tr);
	Selectizewrapper2.setAutocomplete({
		jsonResultList	: 	branchList,
		valueField		:	'branchId',
		labelField		:	'branchName',
		searchField		:	'branchName',
		elementId		:	'branchSelection',
		create			: 	false,
		maxItems		: 	branchList.length
	});
			
	$('#qrCodeLinkToBankModal').modal('show');
}

function prepareDynamicBranchFieldInTable(){
	let a = 2000,
	b = ('#AddQrTableBody'),
	c = ('.addMoreButton2'),
	d = 1;
	$(c).click(function(e){
		e.preventDefault(),a>d && (d++,$(b).append('<tr><td><input class="form-control formInput" type="text" data-tooltip="Branch" name="branchSelection" placeholder="Select Branch" id="branchSelection_'+d+'" /></td> '
		
		// Conditionally add StoreId field
		+ (showStoreIdField ? '<td><input class="form-control formInput" type="text" data-tooltip="Store Id" name="storeIdInput" placeholder="Store Id" id="storeIdInput_'+d+'" maxlength="16" /></td>' : '')
		
		+'<td><input class="form-control formInput" type="text" data-tooltip="QR code Id" name="qrCodeIdInput"  placeholder="QR Code Id" id="qrCodeIdInput_'+d+'" maxlength="25" /></td>'
		+'<td><input class="form-control formInput" type="text" data-tooltip="Merchant Id" name="merchandIdInput" placeholder="Merchant Id" id="merchandIdInput_'+d+'" maxlength="25" /></td>'
		+'<td><a class="remove" onclick="remove(this)" href="javascript:void(0)"><font color="FF00000"><i class="fa fa-trash"></i></a></font></td>'
		+' </tr>'),prepateBranchSelection("_"+d))
	});
}

function prepateBranchSelection(d){
	Selectizewrapper2.setAutocomplete({
		jsonResultList	: 	branchList,
		valueField		:	'branchId',
		labelField		:	'branchName',
		searchField		:	'branchName',
		elementId		:	'branchSelection'+d,
		create			: 	false,
		maxItems		: 	branchList.length
	});
}

function showQRcodeMappedDataModal() {
	if(Number($('#searchAccountEle').val()) <= 0) {
		showMessage("info","Select bank Account to add QR code Mapping ");
		return false;
	}

	showLayer();	
	let object = new Object();
	object['bankAccountId'] 	= $('#searchAccountEle_primary_key').val();
	
	$.ajax({
		url : WEB_SERVICE_URL+'/bankAccountWS/getBankAccountListWithQRcodeIds.do',
		type : "POST",
		dataType : "json",
		data : object,
		success : function(data){
			setQrCodeData(data);
			showResponseAfterOperationDone(data);
		},
		error : function(e){
			console.log(e);
		}
	});
}

function setQrCodeData(data){
	hideLayer();
	$('#qrTableBody').empty();
		
	if(data != undefined && data.bankAccountList != undefined && data.bankAccountList.length > 0) {
		let bankAccountList = data.bankAccountList;
		let columnArray = new Array();
		
		for(let i = 0 ; i < data.bankAccountList.length; i++) {
			let tr = $('<tr>');
			let td = $('<td>');
			let td2 = $('<td>');
			let td3 = $('<td>');
			let td4 = $('<td>');
			let td5 = $('<td>');
			let td6 = $('<td>');
			
			tr.append(td.append(i + 1));
			tr.append(td2.append(bankAccountList[i].branchName));
			
			// Conditionally add StoreId column
			if (showStoreIdField) {
				tr.append(td6.append(bankAccountList[i].storeId || ''));
			}
			
			tr.append(td3.append(bankAccountList[i].qrCode));
			tr.append(td5.append(bankAccountList[i].merchandId));
			tr.append(td4.append('<a style="color:FF00000" href="javascript:void(0)" onclick="removeBankAndQRMapBymapId('+bankAccountList[i].bankAccountQRcodeMapId+')"><i class="fa fa-trash"></i> Remove</a>'));
			columnArray.push(tr);
		}
		
		$('#qrTableBody').append(columnArray);
		$('#showQrCodeAndBankDataModal').modal('show');
	} else {
		$('#showQrCodeAndBankDataModal').modal('hide');
		showMessage('info','No records Found !!');
	}
}
	
function removeBankAndQRMapBymapId(id) {
	showLayer();
	let object = new Object();
	object['BankAccountQRcodeMapId'] 	= id;
	
	$.ajax({
		url : WEB_SERVICE_URL+'/bankAccountWS/removeBankAndQRMapBymapId.do',
		type : "POST",
		dataType : "json",
		data : object,
		success : function(data){
			showResponseAfterOperationDone(data);
			showQRcodeMappedDataModal();
		}, error : function(e){
			console.log(e);
		}
	});
}

function showResponseAfterOperationDone(response) {
	if (response.message != undefined) {
		hideLayer();
		let errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
	}
}
		
function remove(button){
	let row=button.parentNode.parentNode;
	row.parentNode.removeChild(row);
}