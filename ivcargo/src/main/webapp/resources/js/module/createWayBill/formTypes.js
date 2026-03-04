/**
 * @Author	Anant Chaudhary	27-01-2016
 */

function resetFormTypes() {
	$('#formTypes').html('');
	destroyMultiselectFormType();
	setFormTypes();
	
	if(Number($('#singleFormTypes').val()) == 0)
		changeDisplayProperty('eWayBillNumberDiv', 'none');
}

function setFormTypes() {
	let formTypeArr 			= (configuration.FormTypeIds).split(",");
	
	if(!jQuery.isEmptyObject(formTypeMastersArray)) {			//formTypeMastersArray - Coming from Database, Globally Defined
		for(const element of formTypeMastersArray) {
			formTypeArr.push(element.formTypeMasterId);
		}
	}

	operationOnSelectTag('singleFormTypes', 'removeAll', '', '');
	
	if(!isValueExistInArray(formTypeArr, configuration.DefaultFormType))
		operationOnSelectTag('singleFormTypes', 'addNew', 'Form Type', '0');
		
	removeOption('CTForm', null);
	createOption('CTForm', 0, '--SELECT--');
	
	removeOption('form_403_402', null);
	
	if(!jQuery.isEmptyObject(formTypeMastersArray)) {			//formTypeMastersArray - Coming from Database, Globally Defined
		for(const element of formTypeMastersArray) {
			var formTypeObj = element;
			
			if(formTypeObj.formTypeMasterId == FormTypeConstant.CT_FORM_NOT_APPLICABLE_ID
					|| formTypeObj.formTypeMasterId == FormTypeConstant.CT_FORM_RECEIVED_ID
					|| formTypeObj.formTypeMasterId == FormTypeConstant.CT_FORM_NOT_RECEIVED_ID) {
				if(configuration.CTForm == 'true')
					createOption('CTForm', formTypeObj.formTypeMasterId, formTypeObj.formTypeName);
			} else if(formTypeObj.formTypeMasterId == FormTypeConstant.FORM_403_402_NOT_APPLICABLE_ID
				|| formTypeObj.formTypeMasterId == FormTypeConstant.FORM_403_402_RECEIVED_ID
				|| formTypeObj.formTypeMasterId == FormTypeConstant.FORM_403_402_NOT_RECEIVED_ID) {
				if(configuration.Form403402 == 'true')
					createOption('form_403_402', formTypeObj.formTypeMasterId, formTypeObj.formTypeName);
			} else if (configuration.FormsWithSingleSlection == 'true') {
				operationOnSelectTag('singleFormTypes', 'addNew', formTypeObj.formTypeName, formTypeObj.formTypeMasterId);
				selectDefaultFormType(formTypeObj.formTypeMasterId);
			} else if (configuration.FormsWithMultipleSelection == 'true')
				createMultiSelectOption('formTypes', formTypeObj.formTypeMasterId, formTypeObj.formTypeName);
		}
		
		if(!isValueExistInArray(formTypeArr, FormTypeConstant.E_SUGAM_NO_ID))
			$('#sugamNumberDiv').remove();
			
		if(!isValueExistInArray(formTypeArr, FormTypeConstant.HSN_CODE))
			$('#hsnNumberDiv').remove();
			
		if(!isValueExistInArray(formTypeArr, FormTypeConstant.SAC_CODE))
			$('#sacNumberDiv').remove();
	}
	
	if(configuration.FormsWithMultipleSelection == 'true')
		multiselectFormType();
}

function destroyMultiselectFormType() {
	$("#formTypes").multiselect('destroy');
}

function multiselectFormType() {
	$('#formTypes').multiselect({
		header  :false,
		height	: 120,
		noneSelectedText : "FormType"
	});
	
	if(document.getElementById('formTypes_ms') != null) {
		document.getElementById('formTypes_ms').onfocus = function(){ showInfo(this, 'Form Type');}
	}

	$("#formTypes").on("multiselectclick", function(event, ui) {
		var formTypeId	= ui.value;
		var checked		= ui.checked;
		
		showAndHideOnMultipleFormSelection(formTypeId, checked);

		if(configuration.FormTypeWiseChargeAllow == 'true')
			getChargeAmountByFormType(formTypeId, checked); //Calling from formTypeWiseChargeAmount.js
	});
}

function createMultiSelectOption(id, key, value) {
	var newOption = $("<option />");
	$('#' + id).append(newOption);

	if(key == configuration.DefaultFormType)
		newOption.attr('selected', 'selected');

	newOption.attr('id', key);
	newOption.val(key);
	newOption.html(value);
	
	if(key == configuration.DefaultFormType)
		showAndHideOnMultipleFormSelection(key, true);
}

function selectDefaultFormType(id) {
	if(id == configuration.DefaultFormType) {
		$(function() {    
		    $("#singleFormTypes").val(id);
		    showAndHideOnSingleFormSelection(id);
		});
	}
}

function singleSelectFormType(obj) {
	var declaredValue	= $('#declaredValue').val();

	if((configuration.selectEWayBillONDeclaredValue == 'true' || configuration.selectHSNCodeOnDeclaredValue == 'true')
		&& Number(declaredValue) > Number(configuration.declaredValueForSelectEwayBill)) {
		if(configuration.selectEWayBillONDeclaredValue == 'true' && $('#singleFormTypes').val() != FormTypeConstant.E_WAYBILL_ID) {
			showMessage('error', selectOnlyEWayBillErrorMsg + Number(configuration.declaredValueForSelectEwayBill));
			$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
			showEWaybillNumberFormType();
		} else if(configuration.selectHSNCodeOnDeclaredValue == 'true' && $('#singleFormTypes').val() != FormTypeConstant.HSN_CODE) {
			$("#formNumber").attr("placeholder", "HSN Code");
			$("#formNumber").attr('maxlength', '15');
			changeDisplayProperty('formNumberDiv', 'inline');
	
			$('#singleFormTypes').val(FormTypeConstant.HSN_CODE);
			showMessage('error', selectHSNCodeErrorMsg + Number(configuration.declaredValueForSelectEwayBill));
		}
	}  else {
		showAndHideOnSingleFormSelection(obj.value);
		
		if(configuration.FormTypeWiseChargeAllow == 'true')
			getTotalFormChargeAmountOnCheck(obj.value, true); //Calling from formTypeWiseChargeAmount.js
	}
}

function showEWaybillNumberFormType() {
	if(configuration.isShowSingleEwayBillNumberField == 'true') {
		changeDisplayProperty('singleEWayBillNumberDiv', 'inline');
		$('#eWayBillNumberDiv').remove();
	} else {
		changeDisplayProperty('eWayBillNumberDiv', 'inline');
		$('#singleEWayBillNumberDiv').remove();
	}

	bindFocusOnFormNumber();
}

function hideEWaybillNumberFormType() {
	if($('#singleFormTypes').val() == 0)
		$('#ewayBillNumber').val('');
	
	if(configuration.isShowSingleEwayBillNumberField == 'true')
		changeDisplayProperty('singleEWayBillNumberDiv', 'none');
	else
		changeDisplayProperty('eWayBillNumberDiv', 'none');

	hideAllMessages();
	bindFocusOnFormNumber();
}

function showAndHideOnSingleFormSelection(formTypeId) {
	$('#formNumber').val('');
	$('#ewayBillNumber').val('');
	changeDisplayProperty('formNumberDiv', 'none');
	changeDisplayProperty('formNumber', 'none');
	changeDisplayProperty('singleEWayBillNumberDiv', 'none');
	changeDisplayProperty('eWayBillNumberDiv', 'none');
		
	if (formTypeId == FormTypeConstant.HSN_CODE) {
		$("#formNumber").attr("placeholder", "HSN Code");
		$("#formNumber").attr('maxlength', '15');
		changeDisplayProperty('formNumberDiv', 'inline');
		changeDisplayProperty('formNumber', 'inline');
	} else if(formTypeId == FormTypeConstant.WAY_BILL_FORM_ID  || formTypeId == FormTypeConstant.WAYBILL_AND_CC_ID) {
		$("#formNumber").attr("placeholder", "Way Bill Number");
		$("#formNumber").attr('maxlength', '15');
		changeDisplayProperty('formNumberDiv', 'inline');
		changeDisplayProperty('formNumber', 'inline');
	} else if(formTypeId == FormTypeConstant.E_SUGAM_NO_ID) {
		$("#formNumber").attr("placeholder", "E-SUGAM Number");
		$("#formNumber").attr('maxlength', '11');
		changeDisplayProperty('formNumberDiv', 'inline');
		changeDisplayProperty('formNumber', 'inline');
	} else if(formTypeId == FormTypeConstant.SAC_CODE) {
		$("#formNumber").attr("placeholder", "SAC Number");
		$("#formNumber").attr('maxlength', '15');
		changeDisplayProperty('formNumberDiv', 'inline');
		changeDisplayProperty('formNumber', 'inline');
	} else if(formTypeId == FormTypeConstant.E_WAYBILL_ID) {
		if(configuration.isShowSingleEwayBillNumberField == 'true') {
			changeDisplayProperty('singleEWayBillNumberDiv', 'inline');
			$('#eWayBillNumberDiv').remove();
		} else {
			changeDisplayProperty('eWayBillNumberDiv', 'inline');
			$('#singleEWayBillNumberDiv').remove();
		}
	}
}

function showAndHideOnMultipleFormSelection(formTypeId, checked) {
	if(formTypeId == FormTypeConstant.WAY_BILL_FORM_ID  || formTypeId == FormTypeConstant.WAYBILL_AND_CC_ID) {
		if(checked) {
			changeDisplayProperty('formNumberDiv', 'inline');
			changeDisplayProperty('formNumber', 'inline');
		} else {
			changeDisplayProperty('formNumberDiv', 'none');
			changeDisplayProperty('formNumber', 'none');
			hideAllMessages();
		}
			
		$('#formNumber').val('');
		bindFocusOnFormNumber();
	}
		
	if(formTypeId == FormTypeConstant.E_SUGAM_NO_ID) {
		$('#sugamNumber').val('');
		bindFocusOnFormNumber();
			
		if(checked) {
			changeDisplayProperty('sugamNumberDiv', 'inline');
			changeDisplayProperty('sugamNumber', 'inline');
		} else {
			changeDisplayProperty('sugamNumberDiv', 'none');
			changeDisplayProperty('sugamNumber', 'none');
			hideAllMessages();
		}
	}
		
	if(formTypeId == FormTypeConstant.HSN_CODE) {
		$('#hsnNumber').val('');
		bindFocusOnFormNumber();
			
		if(checked) {
			changeDisplayProperty('hsnNumberDiv', 'inline');
			changeDisplayProperty('hsnNumber', 'inline');
		} else {
			changeDisplayProperty('hsnNumberDiv', 'none');
			changeDisplayProperty('hsnNumber', 'none');
			hideAllMessages();
		}
	}
		
	if(formTypeId == FormTypeConstant.SAC_CODE) {
		$('#sacNumber').val('');
		bindFocusOnFormNumber();
			
		if(checked) {
			changeDisplayProperty('sacNumberDiv', 'inline');
			changeDisplayProperty('sacNumber', 'inline');
		} else {
			changeDisplayProperty('sacNumberDiv', 'none');
			changeDisplayProperty('sacNumber', 'none');
			hideAllMessages();
		}
	}
	
	if(formTypeId == FormTypeConstant.E_WAYBILL_ID) {
		if(checked)
			showEWaybillNumberFormType();
		else
			hideEWaybillNumberFormType();
	}
}

function selectEwaybillDropDownOnSingleEwaybill() {
	$("#singleFormTypes").val(E_WAYBILL_ID);
	$("#singleFormTypes").trigger("change");

	if($("#formTypes").length == 0) return;
	
	let selectedFormTypes = $("#formTypes").val() || [];
	
	if(!selectedFormTypes.includes(E_WAYBILL_ID.toString())) {
		selectedFormTypes.push(E_WAYBILL_ID.toString())
		$("#formTypes").val(selectedFormTypes);
	}
	
	$("#formTypes").multiselect("refresh");
	showAndHideOnMultipleFormSelection(E_WAYBILL_ID, true);
	
	if(configuration.FormTypeWiseChargeAllow == 'true')
		getChargeAmountByFormType(E_WAYBILL_ID, true);
}