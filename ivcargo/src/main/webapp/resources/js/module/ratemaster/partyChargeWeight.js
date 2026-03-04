/**
 * @Author Anant Chaudhary	13-04-2016
 */

function setArticleTypeForPartyChargeWeightPannel() {

	operationOnSelectTag('articleType1', 'removeAll', '', null);

	if(!jQuery.isEmptyObject(packingType)) {
		for(var i = 0; i < packingType.length; i++) {
			operationOnSelectTag('articleType1', 'addNew', packingType[i].packingTypeName, packingType[i].typeOfPackingMasterId);
		}
	}
	multiselectArticleType();
}

function destroyMultiSelectArticleType() {
	$("#articleType1").multiselect('destroy');
}

function multiselectArticleType() {
	destroyMultiSelectArticleType();
	
	$('#articleType1').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}

function validateChargeWeightConfig() {
	if(!validateCategoryType()) return false;
	
	/*if(!validatePartySelection()) {
		return false;
	}*/
	
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	if(!validateChargeWeight()) return false;
	if(!validatePackingType()) return false;
	
	return true;
}

function validateChargeWeightConfigToDelete() {
	if(!validateCategoryType()) return false;
	
	/*if(!validatePartySelection()) {
		return false;
	}*/
	
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	if(!validatePackingType()) return false;
	
	return true;
}

function getChargeWeightConfigPackingTypeIds(){
	var  packingTypeIds			= "";
	var selected				= $("#articleType1 option:selected");
	
	selected.each(function () {
		packingTypeIds += ( $(this).val() +",");
	});
	
	if(packingTypeIds.length > 0) {
		packingTypeIds = packingTypeIds.slice(0, -1)
	}
	
	return packingTypeIds;
}

function addChargeWeightConfig() {
	
	if(!validateChargeWeightConfig()) {
		return false;
	}
	
	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			
			var jsonObject					= new Object();

			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeWeight"]			= $('#chargeWeight').val();
			jsonObject["packingTypeIds"]		= getChargeWeightConfigPackingTypeIds();
			jsonObject["corporateAccountIds"]	= getSelectedPartyIdsOnGstn();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/addIncreaseChargeWeightConfig.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetAllChargeWeightConfigData();
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

function viewChargeWeightConfigToEdit() {
	var jsonObject		= new Object();
	
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllChargeWeightConfigToEditOrDelete.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			var title			= 'Edit Increase Charge Weight';
			var mainId			= 'jsPanelMainContentForEditChargeWeightIncrease';
			var tableId			= 'EditChargeWeightEditTable';
			var theadId			= 'EditChargeWeightEditTableTHead';
			var tbodyId			= 'EditChargeWeightEditTableTBody';
			var tfootId			= 'EditChargeWeightEditTableTFoot';
			var tfootRowClass	= 'EditChargeWeightTfootClass';
			
			createChargeWeightEditTableTHead(theadId);
			createTableForChargeWeightConfigDetailsForEdit(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}

function createChargeWeightEditTableTHead(theadId) {
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var articleTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var chargeWeightCol		= createColumnInRow(row, '', '', '', '', '', '');
	var optionsCol			= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(articleTypeCol, '<b>Article Type</b>');
	appendValueInTableCol(chargeWeightCol, '<b>Increased Charge Weight</b>');
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);
}

function createTableForChargeWeightConfigDetailsForEdit(data, tbodyId) {
	var chargeWeightConfigArr	= data.chargeWeightConfigArr;
	
	$('#' + tbodyId).empty();
	
	if(chargeWeightConfigArr != null) {
		
		for(var i = 0; i < chargeWeightConfigArr.length; i++) {
			var chargeWeightConfig	= chargeWeightConfigArr[i];
			
			var chargeWtConfigId	= chargeWeightConfig.chargeWeightConfigId;
			var srcBranch			= chargeWeightConfig.branchName;
			var partyName			= chargeWeightConfig.partyName;
			var packingType			= chargeWeightConfig.packingTypeName;
			var chrgWt				= chargeWeightConfig.chargeWeight;
			
			var createRow			= createRowInTable('tr_' + chargeWtConfigId, '', '');
			
			var srNoCol				= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var srcBranchCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var partyNameCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var packingTypeCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var chrgeWtCol			= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var editBtnChrgWtTxtCol	= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', 'width: 400px;', '');
			
			appendValueInTableCol(srNoCol, (i + 1));
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(partyNameCol, partyName);
			appendValueInTableCol(packingTypeCol, packingType);
			
			var inputAttr1		= new Object();
			var input			= null;

			inputAttr1.id			= 'chrgWt' + chargeWtConfigId;
			inputAttr1.type			= 'text';
			inputAttr1.value		= chrgWt;
			inputAttr1.name			= 'chrgWt' + chargeWtConfigId;
			inputAttr1.class		= 'form-control1';
			inputAttr1.style		= 'width: 70px;text-align: right;';
			inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr1.disabled		= 'true';

			input	= createInput(chrgeWtCol, inputAttr1);
			input.attr( {
				'data-value' : chargeWtConfigId
			});

			var buttonEditJS		= new Object();
			var buttonEdit			= null;

			buttonEditJS.id			= 'editchrgWt' + chargeWtConfigId;
			buttonEditJS.name		= 'editchrgWt' + chargeWtConfigId;
			buttonEditJS.value		= 'Edit'; 
			buttonEditJS.html		= 'Edit';
			buttonEditJS.class		= 'btn btn-warning';
			buttonEditJS.onclick	= 'editPartyIncreaseChargeWeight(this);';
			buttonEditJS.style		= 'width: 50px;margin-left:20px;';

			buttonEdit			= createButton(editBtnChrgWtTxtCol, buttonEditJS);
			buttonEdit.attr({
				'data-value' : chargeWtConfigId
			});

			appendValueInTableCol(editBtnChrgWtTxtCol, '&emsp;');

			var buttonSaveJS		= new Object();
			var buttonSave			= null;

			buttonSaveJS.id			= 'savechrgWt' + chargeWtConfigId;
			buttonSaveJS.name		= 'savechrgWt' + chargeWtConfigId;
			buttonSaveJS.value		= 'Save';
			buttonSaveJS.html		= 'Save';
			buttonSaveJS.class		= 'btn btn-primary';
			buttonSaveJS.onclick	= 'updatePartyIncreaseChargeWeight(this);';
			buttonSaveJS.style		= 'width: 50px; display: none;';

			buttonSave			= createButton(editBtnChrgWtTxtCol, buttonSaveJS);
			buttonSave.attr({
				'data-value' : chargeWtConfigId
			});

			appendValueInTableCol(editBtnChrgWtTxtCol, '&emsp;');

			var buttonDeleteJS		= new Object();
			var buttonDelete			= null;

			buttonDeleteJS.id			= 'DeletechrgWt' + chargeWtConfigId;
			buttonDeleteJS.name			= 'DeletechrgWt' + chargeWtConfigId;
			buttonDeleteJS.value		= 'Delete';
			buttonDeleteJS.html			= 'Delete';
			buttonDeleteJS.class		= 'btn btn-danger';
			buttonDeleteJS.onclick		= 'deletePartyIncreaseChargeWeight(this);';
			buttonDeleteJS.style		= 'width: 60px;';

			buttonDelete			= createButton(editBtnChrgWtTxtCol, buttonDeleteJS);
			buttonDelete.attr({
				'data-value' : chargeWtConfigId
			});
			
			appendRowInTable(tbodyId, createRow);
		}
	}
}

function resetAllChargeWeightConfigData() {
	//setValueToContent('categoryType', 'formField', 0);
	setValueToContent('chargeWeight', 'formField', 0);
	setArticleTypeForPartyChargeWeightPannel();
}

function editPartyIncreaseChargeWeight(obj) {
	var chargeWtConfigId	= obj.getAttribute('data-value');
	$('#routewisejspanel #chrgWt' + chargeWtConfigId).removeAttr('disabled');
	$('#routewisejspanel #savechrgWt' + chargeWtConfigId).show();
	$(obj).hide();
}

function updatePartyIncreaseChargeWeight(obj) {
	var chargeWtConfigId	= obj.getAttribute('data-value');
	var chargeWeight		= $('#routewisejspanel #chrgWt' + chargeWtConfigId).val();
	updatePartyIncreaseCharge(chargeWtConfigId, chargeWeight);
	$('#routewisejspanel #chrgWt' + chargeWtConfigId).prop('disabled', true);
	$('#routewisejspanel #editchrgWt' + chargeWtConfigId).show();
	$(obj).hide();
}

function deletePartyIncreaseChargeWeight(obj) {
	var chargeWtConfigId		= obj.getAttribute('data-value');
	deletePartyIncreaseChargeById(chargeWtConfigId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function updatePartyIncreaseCharge(chargeWtConfigId, chargeWeight) {

	var jsonObject					= new Object();
	
	jsonObject["chargeWeightConfigId"]	= chargeWtConfigId;
	jsonObject["chargeWeight"]			= chargeWeight;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateIncreaseChargeWeightConfigByConfigId.do',
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

function deletePartyIncreaseChargeById(chargeWtConfigId) {

	var jsonObject					= new Object();
	
	jsonObject["chargeWeightConfigId"]	= chargeWtConfigId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteIncreaseChargeWeightConfigByConfigId.do',
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

function viewAllChargeWeightConfig() {
	var jsonObject					= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllChargeWeightConfigurationForGroup.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			var title			= 'View Increase Charge Weight';
			var mainId			= 'jsPanelMainContentForViewChargeWeightIncrease';
			var tableId			= 'ViewChargeWeightEditTable';
			var theadId			= 'ViewChargeWeightEditTableTHead';
			var tbodyId			= 'ViewChargeWeightEditTableTBody';
			var tfootId			= 'ViewChargeWeightEditTableTFoot';
			var tfootRowClass	= 'ViewChargeWeightTfootClass';
			
			createChargeWeightViewTableTHead(theadId);
			createTableForChargeWeightConfigDetailsForView(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}

function createChargeWeightViewTableTHead(theadId) {
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var articleTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var chargeWeightCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(articleTypeCol, '<b>Article Type</b>');
	appendValueInTableCol(chargeWeightCol, '<b>Increased Charge Weight</b>');
	
	appendRowInTable(theadId, row);
}

function createTableForChargeWeightConfigDetailsForView(data, tbodyId) {
	var chargeWeightConfigArr	= data.chargeWeightConfigArr;
	
	$('#' + tbodyId).empty();
	
	if(chargeWeightConfigArr != null) {
		
		for(var i = 0; i < chargeWeightConfigArr.length; i++) {
			var chargeWeightConfig	= chargeWeightConfigArr[i];
			
			var chargeWtConfigId	= chargeWeightConfig.chargeWeightConfigId;
			var srcBranch			= chargeWeightConfig.branchName;
			var partyName			= chargeWeightConfig.partyName;
			var packingType			= chargeWeightConfig.packingTypeName;
			var chrgWt				= chargeWeightConfig.chargeWeight;
			
			var createRow			= createRowInTable('tr_' + chargeWtConfigId, '', '');
			
			var srNoCol				= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var srcBranchCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var partyNameCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var packingTypeCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var chrgeWtCol			= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			
			appendValueInTableCol(srNoCol, (i + 1));
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(partyNameCol, partyName);
			appendValueInTableCol(packingTypeCol, packingType);
			appendValueInTableCol(chrgeWtCol, chrgWt);
			
			appendRowInTable(tbodyId, createRow);
		}
	}
}