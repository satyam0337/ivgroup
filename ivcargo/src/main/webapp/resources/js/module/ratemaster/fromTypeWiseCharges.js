/**
 * Author 			Ashish Tiwari
 * Description 		New Js for Form Type Wise Charges
 * @param data
 */

function setFormType() {

	 var formType 				= null;
	 var formTypeArr 			= [];
	
	 formType 				= rateMasterConfiguration.FormTypeIds;
	 formTypeArr 			= formType.split(",");
	 
	 removeOption('formType', null);
	 
	 //formTypeMastersArray Coming from Database

	//var packingTypeMasters = ;
	if(!jQuery.isEmptyObject(formTypeMastersArray)) {
		for(var i = 0; i < formTypeMastersArray.length; i++) {
			if(isValueExistInArray(formTypeArr, formTypeMastersArray[i].formTypeMasterId)) {  // isValueExistInArray coming from genericfunctions.js
				createOption('formType', formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].formTypeName);
			}
		}
	}
	
	multiselectFormType();
}

function destroyMultiselectFormType(){
	$("#formType").multiselect('destroy');
}

function multiselectFormType(){
	destroyMultiselectFormType();
	$('#formType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}

function setFormTypeForEdit() {

	 var formType 				= null;
	 var formTypeArr 			= [];
	
	 formType 				= rateMasterConfiguration.FormTypeIds;
	 formTypeArr 			= formType.split(",");
	 
	 removeOption('formTypeForUpdate', null);

	//var packingTypeMasters = ;
	if(!jQuery.isEmptyObject(formTypeMastersArray)) {
		for(var i = 0; i < formTypeMastersArray.length; i++) {
			if(isValueExistInArray(formTypeArr, formTypeMastersArray[i].formTypeMasterId)) {  // isValueExistInArray coming from genericfunctions.js
				createOption('formTypeForUpdate', formTypeMastersArray[i].formTypeMasterId, formTypeMastersArray[i].formTypeName);
			}
		}
	}
	
	multiselectFormTypeForUpdate();
}

function destroyMultiselectFormTypeForUpdate() {
	$("#formTypeForUpdate").multiselect('destroy');
}

function multiselectFormTypeForUpdate() {
	destroyMultiselectFormTypeForUpdate();
	$('#formTypeForUpdate').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}

function addFormTypeWiseCharge() {

	if (!formTypeWiseValidation()) return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			var jsonObject		= new Object();

			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["formTypeIds"]			= getFormTypeIds();	
			jsonObject["amount"]				= $('#formAmount').val();
			jsonObject["categoryType"]			= $('#categoryType').val();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertFormTypeWiseRate.do',
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

function getFormTypeIds() {
	var formTypeIds			= "";
	var selected			= $("#formType option:selected");
	
	selected.each(function () {
		formTypeIds += ( $(this).val() + ",");
	});
	
	if(formTypeIds.length > 0) {
		formTypeIds = formTypeIds.slice(0,-1)
	}
	
	return formTypeIds;
}

function resetFormTypeWiseCharges() {
	setFormType();
	$('#formAmount').val("0");
}

//get Form Type wise rates to edit
function getFormTypeWiseCharges() {

	if(!validateMainSection(0)) return false;

	showLayer();
	
	var jsonObject		= new Object();
	
	jsonObject["sourceBranchId"]		= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["categoryTypeId"]		= $('#categoryType').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllFormTypeWiseCharges.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			var title			= 'Edit Form Type Wise Charges';
			var mainId			= 'jsPanelMainContentForFormType';
			var tableId			= 'formRatesEditTable';
			var theadId			= 'formRatesEditTableTHead';
			var tbodyId			= 'formRatesEditTableTBody';
			var tfootId			= 'formRatesEditTableTFoot';
			var tfootRowClass	= 'FormtfootClass';
			
			createRatesEditDataForFormType(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}

function createRatesEditDataForFormType(data, tbodyId) {
	var formTypeWiseCharges		= data.formTypeWiseCharges;
	
	$('#' + tbodyId).empty();

	if(formTypeWiseCharges != undefined) {
		for (var i = 0; i < formTypeWiseCharges.length; i++) {
	
			var rmId	= formTypeWiseCharges[i].formTypeWiseChargesId;
			var row		= createRow("tr_" + rmId, '');
	
			var col1	= createColumn(row, "td_" + rmId, '2%', 'right', '', '');
			var col2	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col3	= createColumn(row, "td_" + rmId, '10%', 'left', '', '');
			var col4	= createColumn(row, "td_" + rmId, '5%', 'right', '', '');
			var col5	= createColumn(row, "td_" + rmId, '35%', 'left', '', '');
	
			col1.append(i);
	
			appendValueInTableCol(col2, formTypeWiseCharges[i].branch);
			appendValueInTableCol(col3, formTypeWiseCharges[i].formTypeName);
	
			var inputAttr1		= new Object();
			var input			= null;
	
			inputAttr1.id			= 'formTypeWiseRate' + rmId;
			inputAttr1.type			= 'text';
			inputAttr1.value		= formTypeWiseCharges[i].chargeAmount;
			inputAttr1.name			= 'formTypeWiseRate' + rmId;
			inputAttr1.class		= 'form-control';
			inputAttr1.style		= 'width: 50px;text-align: right;';
			inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr1.disabled		= 'true';
	
			input	= createInput(col4,inputAttr1);
			input.attr( {
				'data-value' : rmId
			});
			
			var inputAttr2		= new Object();
			var input			= null;
	
			inputAttr2.id			= 'branch' + rmId;
			inputAttr2.type			= 'hidden';
			inputAttr2.value		= formTypeWiseCharges[i].branchId;
			inputAttr2.name			= 'branch' + rmId;
			inputAttr2.style		= 'width: 50px;text-align: right;';
			inputAttr2.class		= 'form-control';
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
	
			inputAttr3.id			= 'form' + rmId;
			inputAttr3.type			= 'hidden';
			inputAttr3.value		= formTypeWiseCharges[i].formTypeId;
			inputAttr3.name			= 'form' + rmId;
			inputAttr3.style		= 'width: 50px;text-align: right;';
			inputAttr3.class		= 'form-control';
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
	
			inputAttr4.id			= 'formType' + rmId;
			inputAttr4.type			= 'hidden';
			inputAttr4.value		= formTypeWiseCharges[i].formTypeWiseChargesId;
			inputAttr4.name			= 'formType' + rmId;
			inputAttr4.style		= 'width: 50px;text-align: right;';
			inputAttr4.class		= 'form-control';
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
	
			buttonEditJS.id			= 'editFormCharges' + rmId;
			buttonEditJS.name		= 'editFormCharges' + rmId;
			buttonEditJS.type		= 'button';
			buttonEditJS.value		= 'Edit';
			buttonEditJS.html		= 'Edit';
			buttonEditJS.class		= 'btn btn-warning';
			buttonEditJS.onclick	= 'editFormTypeWiseCharges(this);';
			buttonEditJS.style		= 'width: 50px;';
	
			buttonEdit			= createButton(col5, buttonEditJS);
			buttonEdit.attr({
				'data-value' : rmId
			});
	
			col5.append('&emsp;');
	
			var buttonSaveJS		= new Object();
			var buttonSave			= null;
	
			buttonSaveJS.id			= 'saveFormTypeWiseCharge' + rmId;
			buttonSaveJS.name		= 'saveFormTypeWiseCharge' + rmId;
			buttonSaveJS.type		= 'button';
			buttonSaveJS.value		= 'Save';
			buttonSaveJS.html		= 'Save';
			buttonSaveJS.class		= 'btn btn-primary';
			buttonSaveJS.onclick	= 'updateRateForFormType(this)';
			buttonSaveJS.style		= 'width: 50px; display: none;';
	
			buttonSave			= createButton(col5, buttonSaveJS);
			buttonSave.attr({
				'data-value' : rmId
			});
	
			col5.append('&emsp;');
	
			var buttonDeleteJS		= new Object();
			var buttonDelete			= null;
	
			buttonDeleteJS.id			= 'Delete' + rmId;
			buttonDeleteJS.name			= 'Delete' + rmId;
			buttonDeleteJS.type			= 'button';
			buttonDeleteJS.value		= 'Delete';
			buttonDeleteJS.html			= 'Delete';
			buttonDeleteJS.class		= 'btn btn-danger';
			buttonDeleteJS.onclick		= 'deleteRateForFormType(this);';
			buttonDeleteJS.style		= 'width: 60px;';
	
			buttonDelete			= createButton(col5, buttonDeleteJS);
			buttonDelete.attr({
				'data-value' : rmId
			});
	
			$('#' + tbodyId).append(row);
		}
	}
}

function editFormTypeWiseCharges(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #formTypeWiseRate' + rmId).removeAttr('disabled');
	$('#routewisejspanel #saveFormTypeWiseCharge' + rmId).show();
	$(obj).hide();
}

function updateRateForFormType(obj) {
	var jsonObject		= new Object();

	var id				= obj.getAttribute('data-value');
	
	jsonObject["formTypeChrgId"]	= $('#formType' + id).val();
	jsonObject["formAmount"]		= $('#routewisejspanel #formTypeWiseRate' + id).val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateFormTypeRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#routewisejspanel #formTypeWiseRate' + id).prop('disabled', true);
				$('#routewisejspanel #editFormCharges' + id).show();
				$(obj).hide();
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function deleteRateForFormType(obj) {
	showLayer();
	var jsonObject		= new Object();

	var id			= obj.getAttribute('data-value');
	
	jsonObject["formTypeChrgId"]	= $('#formType' + id).val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteFormTypeWiseCharges.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$(obj).closest("tr").remove(); // closest function find closest tag of given id.
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}