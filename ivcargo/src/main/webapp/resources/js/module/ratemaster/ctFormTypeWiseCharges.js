/**
 * Author 			Ashish Tiwari
 * Description 		New Js for CT Form Type Wise Charges
 * @param data
 */
					
function setPackingTypeAutoComplete() {
	$("#ctFormPackingType").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=30&responseFilter="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		
		select: function(event, ui) {			
			if(ui.item.id && ui.item.id != 0) {
				$("#ctFormPackingType").val(ui.item.id);
				getSelectedItemData(ui.item.id);
				setValueToTextField('pkgTypeId', ui.item.id);
			} 
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function getSelectedItemData(id) {
	var jsonObject				= new Object();
	jsonObject.filter			= 2;
	jsonObject.packingTypeId	= id;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					
					jsondata				= data;

					executive				= jsondata.executive;
					packingGroupMapping		= jsondata.packingGroupMapping;
					packingTypeMaster		= jsondata.packingTypeMaster;
					
					setPackingGroupOption();
					hideLayer();
					
				}
			});
}

function setPackingGroupOption() {
	var grpId = 0;

	if(packingGroupMapping != null) {
		grpId = packingGroupMapping.packingGroupTypeId;
	}

	selectOptionByValue(document.getElementById("ctFormPackingTypeGroup"), grpId);

	if(grpId > 0) {
		$('#ctFormPackingTypeGroup').prop('disabled', true);
	}
}

function selectOptionByValue(selObj, val) {
	var A= selObj.options, L= A.length;
   
	while(L) {
        if (A[--L].value == val) {
            selObj.selectedIndex = L;
            L= 0;
        }
    }
} 

function setPackingTypeGroup() {

	var jsonObject		= new Object();
	jsonObject.filter	= 1;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					
					jsondata				= data;

					executive				= jsondata.executive;
					var packingGrpArr		= jsondata.packingGroupTypeMasterArray;

					createOptionForGroup(packingGrpArr);
				}
			});
}

function createOptionForGroup(packingGrpArr) {
	var optionId 		= 0;
	var optionValue 	= 0;
	var optionText 		= null;
	
	createOptionInSelectTag('ctFormPackingTypeGroup', optionId, optionValue, 'Select Group');
	
	if(packingGrpArr != null) {
		for(var i = 0 ; i < packingGrpArr.length ; i++) {
			optionId 	= packingGrpArr[i].packingGroupTypeId;
			optionValue	= packingGrpArr[i].packingGroupTypeId;
			optionText	= packingGrpArr[i].packingGroupTypeName;
			
			createOptionInSelectTag('ctFormPackingTypeGroup', optionId, optionValue, optionText);		
		}
	}
}

function setCTForm() {

	//formTypeMastersArray - Coming from Database, Globally Defined
	
	createOptionInSelectTag('ctFormType', 0, 0, 'Select Form');
	
	if(!jQuery.isEmptyObject(formTypeMastersArray)) {
		for(var i = 0; i < formTypeMastersArray.length; i++) {
			if(formTypeMastersArray[i].formTypeMasterId == FormTypeConstant.CT_FORM_NOT_APPLICABLE_ID) {
				createOptionInSelectTag('ctFormType', formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].displayName);
			}
			
			if(formTypeMastersArray[i].formTypeMasterId == FormTypeConstant.CT_FORM_RECEIVED_ID) {
				createOptionInSelectTag('ctFormType', formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].displayName);
			}
			
			if(formTypeMastersArray[i].formTypeMasterId == FormTypeConstant.CT_FORM_NOT_RECEIVED_ID) {
				createOptionInSelectTag('ctFormType', formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].displayName);
			}
		}
	}
}

function addCTFormTypeWiseCharge() {
	
	if (!ctFormTypeWiseValidation()) {
		return false;
	}

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			var jsonObject		= new Object();

			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["FormTypeMasterId"]		= $('#ctFormType').val();
			jsonObject["packingGroupTypeId"]	= $('#ctFormPackingTypeGroup').val();
			jsonObject["packingTypeMasterId"]	= $('#pkgTypeId').val();
			jsonObject["amount"]				= $('#ctFormAmount').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertCTFormTypeWiseRate.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetFormTypeWiseCharges();
						resetValues();
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

//get Form Type wise rates to edit
function getCTFormTypeWiseCharges() {

	if(!validateMainSection(0)) return false;

	showLayer();

	var jsonObject				= new Object();
	jsonObject.filter			= 24;
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["categoryTypeId"]		= $('#categoryType').val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllCTFormTypeWiseChargesInRateMaster.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			var title			= 'Edit CT Form Type Wise Charges';
			var mainId			= 'jsPanelMainContentForCTFormType';
			var tableId			= 'ctFormRatesEditTable';
			var theadId			= 'ctFormRatesEditTableTHead';
			var tbodyId			= 'ctFormRatesEditTableTBody';
			var tfootId			= 'ctFormRatesEditTableTFoot';
			var tfootRowClass	= 'FormtfootClass';
			
			createCTFormTypeWiseTableTHead(theadId);
			createRatesEditDataForCTFormType(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}

function createCTFormTypeWiseTableTHead(theadId) {
	$('#' + theadId).empty();
	
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var formTypeCol			= createColumnInRow(row, '', '', '', '', '', '');
	var packingTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var packingGroupCol		= createColumnInRow(row, '', '', '', '', '', '');
	var packingRateCol		= createColumnInRow(row, '', '', '', '', '', '');
	var optionsCol			= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(formTypeCol, '<b>CT Form Type</b>');
	appendValueInTableCol(packingTypeCol, '<b>Packing Type</b>');
	appendValueInTableCol(packingGroupCol, '<b>Packing Group</b>');
	appendValueInTableCol(packingRateCol, '<b>Rate</b>');
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);	
}

function createRatesEditDataForCTFormType(data, tbodyId) {
	var ctFormTypeWiseCharges		= data.ctFormTypeWiseCharges;
	
	$('#' + tbodyId).empty();

	if(ctFormTypeWiseCharges != undefined) {
		for (var i = 0; i < ctFormTypeWiseCharges.length; i++) {
	
			var rmId	= ctFormTypeWiseCharges[i].ctFormTypeWiseChargesId;
			var row		= createRow("tr_" + rmId, '');
	
			var col1	= createColumn(row, "td_" + rmId, '2%', 'right', '', '');
			var col2	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col3	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col4	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col5	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col6	= createColumn(row, "td_" + rmId, '5%', 'right', '', '');
			var col7	= createColumn(row, "td_" + rmId, '35%', 'left', '', '');
	
			col1.append(i);
	
			appendValueInTableCol(col2, ctFormTypeWiseCharges[i].branch);
			appendValueInTableCol(col3, ctFormTypeWiseCharges[i].ctFormName);
			appendValueInTableCol(col4, ctFormTypeWiseCharges[i].packingTypeName);
			appendValueInTableCol(col5, ctFormTypeWiseCharges[i].packingGroupName);
	
			var inputAttr1		= new Object();
			var input			= null;
	
			inputAttr1.id			= 'ctFormRate' + rmId;
			inputAttr1.type			= 'text';
			inputAttr1.value		= ctFormTypeWiseCharges[i].chargeAmount;
			inputAttr1.name			= 'ctFormRate' + rmId;
			inputAttr1.class		= 'form-control';
			inputAttr1.style		= 'width: 50px;text-align: right;';
			inputAttr1.onkeypress	= 'validAmount(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr1.disabled		= 'true';
	
			input	= createInput(col6,inputAttr1);
			input.attr( {
				'data-value' : rmId
			});
			
			var inputAttr2		= new Object();
			var input			= null;
	
			inputAttr2.id			= 'branch' + rmId;
			inputAttr2.type			= 'hidden';
			inputAttr2.value		= ctFormTypeWiseCharges[i].branchId;
			inputAttr2.name			= 'branch' + rmId;
			inputAttr2.class		= 'form-control';
			inputAttr2.style		= 'width: 50px;text-align: right;';
			inputAttr2.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr2.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr2.disabled		= 'true';
	
			input	= createInput(col2,inputAttr2);
			input.attr( {
				'data-value' : rmId
			});
			
			var inputAttr3		= new Object();
			var input			= null;
	
			inputAttr3.id			= 'ctForm' + rmId;
			inputAttr3.type			= 'hidden';
			inputAttr3.value		= ctFormTypeWiseCharges[i].ctFormTypeId;
			inputAttr3.name			= 'form' + rmId;
			inputAttr3.class		= 'form-control';
			inputAttr3.style		= 'width: 50px;text-align: right;';
			inputAttr3.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr3.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr3.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr3.disabled		= 'true';
	
			input	= createInput(col3,inputAttr3);
			input.attr( {
				'data-value' : rmId
			});
			
			var inputAttr4		= new Object();
			var input			= null;
	
			inputAttr4.id			= 'ctFormType' + rmId;
			inputAttr4.type			= 'hidden';
			inputAttr4.value		= ctFormTypeWiseCharges[i].ctFormTypeWiseChargesId;
			inputAttr4.name			= 'formType' + rmId;
			inputAttr4.class		= 'form-control';
			inputAttr4.style		= 'width: 50px;text-align: right;';
			inputAttr4.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr4.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr4.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr4.disabled		= 'true';
	
			input	= createInput(col1,inputAttr4);
			input.attr( {
				'data-value' : rmId
			});
	
			var buttonEditJS		= new Object();
			var buttonEdit			= null;
	
			buttonEditJS.id			= 'edit' + rmId;
			buttonEditJS.name		= 'edit' + rmId;
			buttonEditJS.value		= 'Edit';
			buttonEditJS.html		= 'Edit';
			buttonEditJS.class		= 'btn btn-warning';
			buttonEditJS.onclick	= 'viewSave(this);';
			buttonEditJS.style		= 'width: 50px;';
	
			buttonEdit			= createButton(col7, buttonEditJS);
			buttonEdit.attr({
				'data-value' : rmId
			});
	
			col7.append('&emsp;');
	
			var buttonSaveJS		= new Object();
			var buttonSave			= null;
	
			buttonSaveJS.id			= 'saveCtFormRate' + rmId;
			buttonSaveJS.name		= 'saveCtFormRate' + rmId;
			buttonSaveJS.value		= 'Save';
			buttonSaveJS.html		= 'Save';
			buttonSaveJS.class		= 'btn btn-primary';
			buttonSaveJS.onclick	= 'updateRateForCTFormType(this)';
			buttonSaveJS.style		= 'width: 50px; display: none;';
	
			buttonSave			= createButton(col7, buttonSaveJS);
			buttonSave.attr({
				'data-value' : rmId
			});
	
			col7.append('&emsp;');
	
			var buttonDeleteJS		= new Object();
			var buttonDelete			= null;
	
			buttonDeleteJS.id			= 'Delete' + rmId;
			buttonDeleteJS.name			= 'Delete' + rmId;
			buttonDeleteJS.value		= 'Delete';
			buttonDeleteJS.html			= 'Delete';
			buttonDeleteJS.class		= 'btn btn-danger';
			buttonDeleteJS.onclick		= 'deleteRateForCTFormType(this);';
			buttonDeleteJS.style		= 'width: 60px;';
	
			buttonDelete			= createButton(col7, buttonDeleteJS);
			buttonDelete.attr({
				'data-value' : rmId
			});
	
			$('#' + tbodyId).append(row);
		}
	}
}

function viewSave(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #ctFormRate' + rmId).removeAttr('disabled');
	$('#routewisejspanel #saveCtFormRate' + rmId).show();
	$(obj).hide();
}

function updateRateForCTFormType(obj) {
	var jsonObject		= new Object();

	var id				= obj.getAttribute('data-value');
	
	jsonObject["formTypeChrgId"]	= $('#ctFormType' + id).val();
	jsonObject["formAmount"]		= $('#routewisejspanel #ctFormRate' + id).val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateCTFormTypeRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function deleteRateForCTFormType(obj) {
	showLayer();
	var jsonObject		= new Object();

	var id			= obj.getAttribute('data-value');
	
	jsonObject["formTypeChrgId"]	= $('#ctFormType' + id).val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteCTFormTypeRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function resetValues() {
	setValueToTextField('ctFormType', 0);
	setValueToTextField('ctFormPackingType', '');
	setValueToTextField('ctFormPackingTypeGroup', 0);
	setValueToTextField('ctFormAmount', 0);
}

function resetPackingGroup() {
	setValueToTextField('ctFormPackingTypeGroup', 0);
	$('#ctFormPackingTypeGroup').prop('disabled', false);
}