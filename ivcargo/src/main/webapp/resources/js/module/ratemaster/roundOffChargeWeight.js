/**
 * @Author Nikhil Saujani	19-11-2024
 */

 
function addRoundOffChargeWeightConfig(){
	if(!validateChargeWeightRoundOffConfig()) {
		return false;
	}
	
	$.confirm({
		text: "Are you sure you want to save Round Off Amount ?",
		confirm: function() {
			showLayer();
			
			var jsonObject					= new Object();

			jsonObject["branchId"]					= $('#branchId').val();
			jsonObject["corporateAccountId"]		= $('#partyId').val();
			jsonObject["chargeWeightRoundOffAmt"]	= $('#chargeWeightRoundOffAmt').val();
			jsonObject["corporateAccountIds"]		= getSelectedPartyIdsOnGstn();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/addRoundOffChargeWeightConfig.do',
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

function validateChargeWeightRoundOffConfig() {
	if(!validateCategoryType()) return false;	
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	if(!validateRoundOffChargeWeight()) return false;
	
	return true;
}
function resetAllChargeWeightConfigData() {
	setValueToContent('chargeWeightRoundOffAmt', 'formField', 0);
}

function viewRoundOffChargeWeightConfigToEdit() {
	var jsonObject		= new Object();
	
	if(!validateCategoryType()) return false;
	if(!validateBranch()) return false;
	if(!validateParty()) return false;
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllRoundOffChargeWeightConfigToEditOrDelete.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			console.log('data== ',data);
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			var title			= 'Edit Round Off Charge Weight';
			var mainId			= 'jsPanelMainContentForEditChargeWeightRoundOff';
			var tableId			= 'EditChargeWeightRoundOffEditTable';
			var theadId			= 'EditChargeWeightRoundOffEditTableTHead';
			var tbodyId			= 'EditChargeWeightRoundOffEditTableTBody';
			var tfootId			= 'EditChargeWeightRoundOffEditTableTFoot';
			var tfootRowClass	= 'EditChargeWeightRoundOffTfootClass';
			
			chargeWeightRoundOffEditTableTHead(theadId);
			chargeWeightConfigDetailsForEdit(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}


function chargeWeightRoundOffEditTableTHead(theadId) {
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var chargeWeightCol		= createColumnInRow(row, '', '', '', '', '', '');
	var optionsCol			= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(chargeWeightCol, '<b>RoundOff Charge Weight</b>');
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);
}

function chargeWeightConfigDetailsForEdit(data, tbodyId) {
	var chargeWeightConfigArr	= data.chargeWeightConfigArr;
	
	$('#' + tbodyId).empty();
	
	if(chargeWeightConfigArr != null) {
		
		for(var i = 0; i < chargeWeightConfigArr.length; i++) {
			var chargeWeightConfig	= chargeWeightConfigArr[i];
			
			var chargeWtConfigId	= chargeWeightConfig.chargeWeightConfigId;
			var srcBranch			= chargeWeightConfig.branchName;
			var partyName			= chargeWeightConfig.partyName;
			var chrgWt				= chargeWeightConfig.chargeWeightRoundOffAmt;
			
			var createRow			= createRowInTable('tr_' + chargeWtConfigId, '', '');
			
			var srNoCol				= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var srcBranchCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var partyNameCol		= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var chrgeWtCol			= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', '', '');
			var editBtnChrgWtTxtCol	= createColumnInRow(createRow, 'td_' + chargeWtConfigId, '', '', '', 'width: 400px;', '');
			
			appendValueInTableCol(srNoCol, (i + 1));
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(partyNameCol, partyName);
			
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
			buttonEditJS.onclick	= 'editRoundOffChargeWeight(this);';
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
			buttonSaveJS.onclick	= 'updateRoundOffChargeWeight(this);';
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
			buttonDeleteJS.onclick		= 'deleteRoundOffChargeWeight(this);';
			buttonDeleteJS.style		= 'width: 60px;';

			buttonDelete			= createButton(editBtnChrgWtTxtCol, buttonDeleteJS);
			buttonDelete.attr({
				'data-value' : chargeWtConfigId
			});
			
			appendRowInTable(tbodyId, createRow);
		}
	}
}
function editRoundOffChargeWeight(obj) {
	var chargeWtConfigId	= obj.getAttribute('data-value');
	$('#routewisejspanel #chrgWt' + chargeWtConfigId).removeAttr('disabled');
	$('#routewisejspanel #savechrgWt' + chargeWtConfigId).show();
	$(obj).hide();
}

function updateRoundOffChargeWeight(obj) {
	var chargeWtConfigId	= obj.getAttribute('data-value');
	var chargeWeight		= $('#routewisejspanel #chrgWt' + chargeWtConfigId).val();
	
	updateRoundOffChargeAmount(chargeWtConfigId, chargeWeight);
	$('#routewisejspanel #chrgWt' + chargeWtConfigId).prop('disabled', true);
	$('#routewisejspanel #editchrgWt' + chargeWtConfigId).show();
	$(obj).hide();
}

function updateRoundOffChargeAmount(chargeWtConfigId, chargeWeight) {

	var jsonObject					= new Object();
	
	jsonObject["chargeWeightConfigId"]		= chargeWtConfigId;
	jsonObject["chargeWeightRoundOffAmt"]	= chargeWeight;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateRoundOffChargeWeightConfigByConfigId.do',
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


function deleteRoundOffChargeWeight(obj) {
	var chargeWtConfigId		= obj.getAttribute('data-value');
	deleteRoundOffAmountById(chargeWtConfigId);
	$(obj).closest("tr").remove();
}

function deleteRoundOffAmountById(chargeWtConfigId) {

	var jsonObject					= new Object();
	
	jsonObject["chargeWeightConfigId"]	= chargeWtConfigId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteRoundOffChargeWeightConfigByConfigId.do',
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