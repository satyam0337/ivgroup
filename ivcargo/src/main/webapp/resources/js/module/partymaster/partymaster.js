/**
 * 
 */

var isEditMode 					= true;
var editPartyBranchId 			= 0;
var curName 					= null;
var curMobileNo					= null;
var partyMasterConfig			= null;
var configuration				= null;
var CorporateAccountConstant	= null;
var PODRequiredConstant			= null;
var oldGSTN						= null;

function initialize() {

	var jsonObject					= new Object();

	jsonObject.filter				= 1;
	
	var jsonStr = JSON.stringify(jsonObject);
	showLayer();
	$.getJSON("CorporatePartyInitializeAjaxAction.do?pageId=201&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					hideLayer();
				} else {
					partyMasterConfig			= data.partyMasterConfig;
					podConfiguration			= data.podConfiguration;
					CorporateAccountConstant	= data.CorporateAccountConstant;
					PODRequiredConstant			= data.PODRequiredConstant;
					PartyMasterConstant			= data.PartyMasterConstant;
					configuration				= data.configuration;
					
					showHideByProperty();
					
					if(partyMasterConfig.showChargedWeightRound == 'true') {
						var roundOffValueArray	= data.roundOffValueArray;
						
						if(!jQuery.isEmptyObject(roundOffValueArray)) {
							for(var i = 0; i < roundOffValueArray.length; i++) {
								operationOnSelectTag('ChargedWeightRoundOffValue', 'addNew', roundOffValueArray[i], roundOffValueArray[i]);
							}
						}
					}
					
					hideLayer();
				}
			});
}

function showHideByProperty() {
	if(partyMasterConfig.showLocationField == 'true') {
		changeDisplayProperty('showLocationField', 'table-row');
	}
	
	if(partyMasterConfig.numberTypeSelectionBoxDisplay == 'true') {
		changeDisplayProperty('showNumberTypeSelection', 'table-row');
	}
	
	if(podConfiguration.isPodRequired) {
		changeDisplayProperty('podRequiredId', 'table-row');
		changeDisplayProperty('podBillCreationAllowId', 'table-row');
	}
	
	if(partyMasterConfig.showLinkForPartyDetails == 'true') {
		changeDisplayProperty('showLinkForPartyDetails', 'inline');
	}
	
	if(partyMasterConfig.serviceTaxPaidByCreditor == 'true') {
		changeDisplayProperty('serviceTaxPaidByCreditor', 'table-row');
	}
	
	if(partyMasterConfig.isInsuredByRequired == 'true') {
		changeDisplayProperty('isInsuredByRequired', 'table-row');
	}
	
	if(partyMasterConfig.hideTinNo == 'true') {
		changeDisplayProperty('tinNoRow', 'none');
	}
	if(partyMasterConfig.showDeliveryAt == 'true' || partyMasterConfig.showDeliveryAt == true) {
		changeDisplayProperty('deliveryAtRow', 'table-row');
	}
	if(partyMasterConfig.showChargedWeightRound == 'true' || partyMasterConfig.showChargedWeightRound == true) {
		changeDisplayProperty('ChargedWeightRoundRow', 'table-row');
	}
	if(partyMasterConfig.shortCreditAllowOnTxnType == 'true') {
		changeDisplayProperty('ShortCreditAllowOnTxnTypeRow', 'table-row');
	}
	
	if(partyMasterConfig.rateSelectionAllowedOnWeightType == 'true'){
		changeDisplayProperty('RateAllowOnWeightTypeRow' ,'table-row' );
	}
	
	if(partyMasterConfig.partyCode == 'true'){
		changeDisplayProperty('PartyCodeRow','table-row');
	}
	
	if(partyMasterConfig.showTanNumberField == 'true'){
		changeDisplayProperty('tanNoRow','table-row');
	}
	
	if(partyMasterConfig.showSmsRequiedField == 'true'){
		changeDisplayProperty('SmsRequiredRow','table-row');
	}
	
	if(podConfiguration.isPodRequired)
		$('#podRequired').val(podConfiguration.defaultPODRequiredOnPartySave);
	
	if(partyMasterConfig.showIsTransporterField == 'true') {
		changeDisplayProperty('isTransporterRow','table-row');
	}
}

function addCreditorAfterCheckDuplicate() {
	if(!formValidations()) { // Called from partyMasterValidation.js
		return false;
	}

	if (confirm('Are you sure you want to add this Party ?')) {
		var jsonObject					= new Object();

		getDataToSaveOrUpdate(jsonObject);
		showLayer();
		
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/partyMasterWS/addNewParty.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					
					if(errorMessage.typeName == 'success') {
						resetValues();
					}
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				} else {
					resetValues();
				}
				
				hideLayer();
			}
		});
	}
}

function editPartyAftercheckForUniqueGSTNumber() {
	var reg = /\s/g;
	
	var selectedCorpId			= $('#selectedCorpId').val();
	var editButtonValue			= $('#Edit').val();
	var editBottomValue			= $('#editBottom').val();
	
	if(editButtonValue == 'Edit' || editBottomValue == 'Edit') {
		enableDisableInputField('add', 'true');
		document.corpAccMasterForm.add.className = 'btn_print_disabled';
		
		setValueToTextField('edit', 'Save');
		setValueToTextField('deleteItem', 'Cancel');

		enableDisableInputField('addBottom', 'true');
		document.corpAccMasterForm.addBottom.className = 'btn_print_disabled';
		
		setValueToTextField('editBottom', 'Save');
		setValueToTextField('deleteItemBottom', 'Cancel');
		enableElements();
		changeTextFieldColor('name', '', '', '');
		isEditMode 		= true;
	} else {
		if(selectedCorpId > 0) {
			var name	= $('#name').val();
			var str		= name.replace(reg, '');

			if($("#name").is('[readonly]') == false && str.length > 0 && isEditMode == true) {

				if(!formValidations()) { // Called from
											// partyMasterValidation.js
					return false;
				}

				if(confirm('Are you sure you want to update the Party ?')) {
					var jsonObject					= new Object();

					getDataToSaveOrUpdate(jsonObject);

					showLayer();
					$.ajax({
						type		: "POST",
						url			: WEB_SERVICE_URL+'/partyMasterWS/updatePartyMaster.do',
						data		: jsonObject,
						dataType	: 'json',
						success: function(data) {
							if(data.message != undefined) {
								var errorMessage = data.message;

								if(errorMessage.typeName == 'success') {
									resetElements();
									resetValues();
								}

								showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
							} else {
								resetElements();
								resetValues();
							}

							hideLayer();
						}
					});
				}
			}
		} else {
			resetElements();
		}
	}
}

function getDataToSaveOrUpdate(jsonObject) {
	jsonObject.partyNameEle				= $('#name').val();
	jsonObject.corporateAccountId		= $('#selectedCorpId').val();
	jsonObject.mobileNumber1Ele			= $('#mobileNumber1').val();
	jsonObject.branchEle				= $('#sourceBranch').val();
	jsonObject.isTBBEle					= getCheckedValue('isCreditor');
	if(jsonObject.isTBBEle == 1){
		jsonObject.isTBBEle = true;	
	} else {
		jsonObject.isTBBEle = false;
	}
	jsonObject.partyTypeEle_primary_key	= $('#corpAccType').val();
	jsonObject.addressEle				= $('#address').val();
	
	jsonObject.CorporateAccountSubType		= getValueFromInputField('corpAccSubType');
	jsonObject.cityEle						= getValueFromInputField('city');
	jsonObject.pincodeEle					= getValueFromInputField('pinCode');
	jsonObject.contactPersonEle				= getValueFromInputField('contactPerson');
	jsonObject.serviceTaxPaid				= getValueFromInputField('serviceTaxPaid');
	jsonObject.insuredByEle_primary_key		= getValueFromInputField('insuredBy');
	jsonObject.departmentEle				= getValueFromInputField('department');
	jsonObject.phoneNumber1Ele				= getValueFromInputField('phoneNumber1');
	jsonObject.phoneNumber2Ele				= getValueFromInputField('phoneNumber2');
	jsonObject.partyMobileNumber 			= getValueFromInputField('mobileNumber1');
	jsonObject.mobileNumber2Ele				= getValueFromInputField('mobileNumber2');
	jsonObject.faxNumberEle					= getValueFromInputField('faxNumber');
	jsonObject.emailAddressEle				= getValueFromInputField('emailAddress');
	jsonObject.marketingPersonEle			= getValueFromInputField('marketingPerson');
	jsonObject.serviceTaxNumberEle			= getValueFromInputField('serviceTaxNo');
	jsonObject.tinNumberEle					= getValueFromInputField('tinNo');
	jsonObject.panNumberEle					= getValueFromInputField('panNumber');
	jsonObject.gstnEle						= getValueFromInputField('gstn');
	jsonObject.remarkEle					= getValueFromInputField('remark');
	jsonObject.isBlackListedEle_primary_key	= getValueFromInputField('blackListed');
	jsonObject.serviceTaxRequired			= getValueFromInputField('serviceTaxRequired');
	jsonObject.locationEle								= getValueFromInputField('location');
	jsonObject.shortCreditTxnTypeEle_primary_key 		= getValueFromInputField('ShortCreditAllowOnTxnTypeId');
	jsonObject.rateAllowedOnWeightTypeEle_primary_key 	= getValueFromInputField('RateAllowOnWeightTypeId');
	jsonObject.partyCodeEle 			 	 			= getValueFromInputField('partyCode');
	jsonObject.deliveryAtEle_primary_key				= $("#deliveryAt").val();
	jsonObject.isChargedWeightRound						= $("#ChargedWeightRound").val();
	jsonObject.ChargedWeightRoundOffValueEle			= $("#ChargedWeightRoundOffValue").val();
	
	jsonObject.displayNameEle							= getValueFromInputField('displayName');
	jsonObject.currrentName								= curName;
	jsonObject.curMobileNo								= curMobileNo;
	jsonObject.isPodRequired							= $('#podRequired').val();
	jsonObject.isDiscountAllowedEle_primary_key			= getValueFromInputField('discountOnTxn');
	jsonObject.PodRequiredForInvoiceCreation			= $('#PodRequiredForInvoiceCreation').val();
	jsonObject.tanNumberEle								= getValueFromInputField('tanNo');
	jsonObject.smsRequiredId							= getValueFromInputField('smsRequiredId');
	jsonObject.isTransporter							= $('#isTransporter').val();
	jsonObject.cftValueEle								= getValueFromInputField('cftValue');
	jsonObject.cftUnit									= $('#cftUnitEle').val();
	
}

function resetValues() {
	setValueToTextField('selectedCorpId', '');
	setValueToTextField('name', '');
	checkedUnchecked('isCreditor', 'false');
	setValueToTextField('corpAccType', 0);
	setValueToTextField('corpAccSubType', '-1');
	setValueToTextField('address', '');
	setValueToTextField('city', 0);
	setValueToTextField('pinCode', '');
	setValueToTextField('contactPerson', '');
	setValueToTextField('department', '');
	setValueToTextField('stdCode1', '');
	setValueToTextField('phNumber1', '');
	setValueToTextField('phoneNumber1', '');
	setValueToTextField('stdCode2', '');
	setValueToTextField('phNumber2', '');
	setValueToTextField('phoneNumber2', '');
	setValueToTextField('displayName', '');
	setValueToTextField('mobileNumber1', '');
	setValueToTextField('mobileNumber2', '');
	setValueToTextField('faxNumber', '');
	setValueToTextField('emailAddress', '');
	setValueToTextField('marketingPerson', '');
	setValueToTextField('serviceTaxNo', '');
	setValueToTextField('tinNo', '');
	setValueToTextField('panNumber', '');
	setValueToTextField('gstn', '');
	setValueToTextField('remark', '');
	setValueToTextField('blackListed', 0);
	setValueToTextField('serviceTaxRequired', 0);
	setValueToTextField('numberType', 0);
	setValueToTextField('location', '');
	setValueToTextField('insuredBy', '0');
	setValueToTextField('serviceTaxPaid', '0');
	setValueToTextField('discountOnTxn', '0');
	$('#ShortCreditAllowOnTxnTypeId').val(0);
	$('#RateAllowOnWeightTypeId').val(0);
	setValueToTextField('partyCode', '');
	setValueToTextField('deliveryAt', 0);
	setValueToTextField('ChargedWeightRound', 1);
	changeDisplayProperty('ChargedWeightRoundOffValueRow', 'none');
	setValueToTextField('tanNo', '');
	setValueToTextField('smsRequiredId', '0');
	setValueToTextField('podRequired', podConfiguration.defaultPODRequiredOnPartySave);
	setValueToTextField('cftValue', '0');
}

function deleteCreditor(){
	if(document.corpAccMasterForm.selectedCorpId.value > 0 &&
			(document.corpAccMasterForm.deleteItem.value == 'Deactivate' ||
			 document.corpAccMasterForm.deleteItemBottom.value == 'Deactivate')){
		if (confirm('Are you sure you want to delete the Party ?')){
			var jsonObject					= new Object();

			jsonObject.corporateAccountId	= $('#selectedCorpId').val();
			
			showLayer();
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/partyMasterWS/deleteSingleParty.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						
						if(errorMessage.typeName == 'success') {
							resetElements();
						}
						
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					} else {
						resetElements();
					}
					
					hideLayer();
				}
			});
		}
	} else {
		 	// alert('Error : Please try again.');
		 	resetElements();
	}
}

function resetElements(){
	removeError('name');
	toogleElement('consignorError','none');
	
	document.corpAccMasterForm.add.disabled = false ;
	document.corpAccMasterForm.add.className = 'btn_print';
	document.corpAccMasterForm.edit.disabled = true ;
	document.corpAccMasterForm.edit.className = 'btn_print_disabled';
	document.corpAccMasterForm.deleteItem.disabled = true ;
	document.corpAccMasterForm.deleteItem.className = 'btn_print_disabled';
	document.corpAccMasterForm.edit.value = 'Edit';
	document.corpAccMasterForm.deleteItem.value = 'Deactivate';

	document.corpAccMasterForm.addBottom.disabled = false ;
	document.corpAccMasterForm.addBottom.className = 'btn_print';
	document.corpAccMasterForm.editBottom.disabled = true ;
	document.corpAccMasterForm.editBottom.className = 'btn_print_disabled';
	document.corpAccMasterForm.deleteItemBottom.disabled = true ;
	document.corpAccMasterForm.deleteItemBottom.className = 'btn_print_disabled';
	document.corpAccMasterForm.editBottom.value = 'Edit';
	document.corpAccMasterForm.deleteItemBottom.value = 'Deactivate';
	curName 		= null;
	curMobileNo		= null;

	var myTable = document.getElementById('details');

	var controls = myTable.getElementsByTagName("input");
	for( var i = 0; i < controls.length; i++) {
	    if(i!=1)
	    {	control = controls[i];
	    	control.value='';
	    	control.readOnly = false;
	      }
	    }
	controls= myTable.getElementsByTagName("select");
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.selectedIndex = 0;
	    control.readOnly = false;
	}
	document.corpAccMasterForm.address.value= '';
	document.corpAccMasterForm.address.readOnly= false;
	document.corpAccMasterForm.creditor.value= '';
	document.corpAccMasterForm.displayName.value= '';
	document.corpAccMasterForm.displayName.readOnly= false;
	document.corpAccMasterForm.selectedCorpId.value = 0 ;
	toogleElement('error','none');
	toogleElement('msg','none');

	document.corpAccMasterForm.isCreditor.value=1;
	document.corpAccMasterForm.isCreditor.checked=false;
	
	resetSubRegion();
	resetBranch();
	
	document.corpAccMasterForm.creditor.focus();
	oldGSTN = null;
}

function enableElements(){
	var myTable = document.getElementById('details');

	var controls = myTable.getElementsByTagName("input");
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = false;
	}
	controls= myTable.getElementsByTagName("select");
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = false;
	}
	document.corpAccMasterForm.address.readOnly= false;
	
	document.corpAccMasterForm.displayName.readOnly= false;
}

function disableElements(){
	document.corpAccMasterForm.add.disabled = true ;
	document.corpAccMasterForm.add.className = 'btn_print_disabled';
	document.corpAccMasterForm.addBottom.disabled = true ;
	document.corpAccMasterForm.addBottom.className = 'btn_print_disabled';
	
	var myTable = document.getElementById('details');
	var controls= myTable.getElementsByTagName("input");
	
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = true;
	}
	
	var controls= myTable.getElementsByTagName("select");
	
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = true;
	}
	document.corpAccMasterForm.address.readOnly= true;

}

function validatePodRequired() {
	var podRequired				= $('#podRequired').val();
	var podBillCreationAllow	= $('#PodRequiredForInvoiceCreation').val();
	
	if((Number(podRequired) == PODRequiredConstant.POD_REQUIRED_NO_ID) && (podBillCreationAllow == PODRequiredConstant.POD_REQUIRED_FOR_INVOICE_CREATION_YES)) {
		showMessage('info', 'You cannot change if POD for Bill Creation Allow !');
		$('#podRequired').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
	}
}

function setPodRequired() {
	var podBillCreationAllow	= $('#PodRequiredForInvoiceCreation').val();
	
	if(Number(podBillCreationAllow) == PODRequiredConstant.POD_REQUIRED_FOR_INVOICE_CREATION_YES) {
		$('#podRequired').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
	}
}

function setChargedWeightRoundOffValue() {
	if($("#ChargedWeightRound").val() == CorporateAccountConstant.CHARGED_WEIGHT_ROUND_YES_ID) {
		changeDisplayProperty('ChargedWeightRoundOffValueRow', 'table-row');
	} else {
		changeDisplayProperty('ChargedWeightRoundOffValueRow', 'none');
	}
}

function checkUniqueUniqueGstNumber() {
	if(partyMasterConfig.checkGSTNumberForUnique == 'false') {
		return;
	}
	
	var jsonObject		= new Object();
	jsonObject["gstNumber"]				= $('#gstn').val();
	jsonObject["corporateAccountId"]	= $('#selectedCorpId').val();
	jsonObject["filter"]				= 1;

	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/partyMasterWS/checkUniqueGstNumber.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}

			hideLayer();
		}
	});
}