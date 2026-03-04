/**
 * @Author Anant Chaudhary	23-04-2016
 */

function setArticleTypeForArticleWiseWeightDiffPannel() {

	operationOnSelectTag('articleType2', 'removeAll', '', null);
	
	if(!jQuery.isEmptyObject(packingType)) {
		for(var i = 0; i < packingType.length; i++) {
			operationOnSelectTag('articleType2', 'addNew', packingType[i].packingTypeName, packingType[i].typeOfPackingMasterId);
		}
	}
	multiselectArticleType2();
}

function destroyMultiSelectArticleType2() {
	$("#articleType2").multiselect('destroy');
}

function multiselectArticleType2() {
	destroyMultiSelectArticleType2();
	
	$('#articleType2').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}

function validateArticleWiseWeightConfig() {

	var categoryType		= getValueFromInputField('categoryType');

	if(!validateCategoryType()) return false;

	if(categoryType == branchTypeCategory) {
		if(!validateBranch()) return false;
	} else if(categoryType == partyTypeCategory) {
		if(!validateBranch()) return false;
		if(!validateParty()) return false;
	}

	if(!validateMinValueInArticleWiseWeight()) return false;
	if(!validateMaxValueInArticleWiseWeight('minValue', 'maxValue')) return false;
	if(!validatePackingTypeInArticleWiseWeight()) return false;
	
	return true;
}

function getArticleWiseWeightDiffPackingTypeIds(){
	var  packingTypeIds			= "";
	var selected				= $("#articleType2 option:selected");
	
	selected.each(function () {
		packingTypeIds += ( $(this).val() +",");
	});
	
	if(packingTypeIds.length > 0) {
		packingTypeIds = packingTypeIds.slice(0, -1)
	}
	
	return packingTypeIds;
}

function saveArticleWiseWeightDifferenceDetails() {
	if(!validateArticleWiseWeightConfig()) return false;
	
	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			var jsonObject					= new Object();
			
			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["minWeight"]				= $('#minValue').val();
			jsonObject["maxWeight"]				= $('#maxValue').val();
			jsonObject["packingTypeIds"]		= getArticleWiseWeightDiffPackingTypeIds();
			jsonObject["destinationBranchId"]	= $('#destBranchId').val();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/addUpdateArticleWiseWeightDiffConfig.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetAllArticleWiseWeightConfigData();
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

function resetAllArticleWiseWeightConfigData() {
	setValueToTextField('minValue', 0);
	setValueToTextField('maxValue', 0);
	setArticleTypeForArticleWiseWeightDiffPannel();
}

function validateArticleWiseWeightDifference() {

	var categoryType		= getValueFromInputField('categoryType');

	if(!validateCategoryType()) return false;

	if(categoryType == branchTypeCategory) {
		if(!validateBranch()) return false;
	} else if(categoryType == partyTypeCategory) {
		if(!validateBranch()) return false;
		if(!validateParty()) return false;
	}

	return true;
}

function editArticleWiseWeightDifference() {
	if(!validateArticleWiseWeightDifference()) return false;
	
	var jsonObject					= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["destinationBranchId"]	= $('#destBranchId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllArticleWiseWeightDifferenceDetailsForEditOrDelete.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} else {
				var title			= 'Edit Article Wise Weight Difference Charge';
				var mainId			= 'jsPanelMainContentForEditArtWiseWeightDiff';
				var tableId			= 'EditArtWiseWeightDiffEditTable';
				var theadId			= 'EditArtWiseWeightDiffEditTableTHead';
				var tbodyId			= 'EditArtWiseWeightDiffEditTableTBody';
				var tfootId			= 'EditArtWiseWeightDiffEditTableTFoot';
				var tfootRowClass	= 'EditArtWiseWeightDiffTfootClass';
				
				createArtWiseWeightEditTableTHeadForEdit(theadId);
				createTableForArtWiseWeightConfigDetailsForEdit(data, tbodyId);
				createJsPanelForRateMaster(title, mainId);
				setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
				
				if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff) {
					changeDisplayProperty('editMinWeightHeaderCol', 'block');
					changeDisplayProperty('editMinWeightCol', 'block');
				}
			}
			hideLayer();
		}
	});
}

function createArtWiseWeightEditTableTHeadForEdit(theadId) {
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var articleTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var minWeightCol		= createColumnInRow(row, 'editMinWeightCol', '', '', '', 'display: none;', '');
	var maxWeightCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
		var destBranchCol	= createColumnInRow(row, '', '', '', '', '', '');
	}
	
	var optionsCol			= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(articleTypeCol, '<b>Article Type</b>');
	appendValueInTableCol(minWeightCol, '<b>Min Weight</b>');
	appendValueInTableCol(maxWeightCol, '<b>Max Weight</b>');
	
	if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
		appendValueInTableCol(destBranchCol, '<b>Dest Branch</b>');
	}
	
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);
}

function createTableForArtWiseWeightConfigDetailsForEdit(data, tbodyId) {
	var articleWiseWeightDiffConfig	= data.articleWiseWeightDiffConfig;
	
	$('#' + tbodyId).empty();
	
	if(articleWiseWeightDiffConfig != null) {
		
		for(var i = 0; i < articleWiseWeightDiffConfig.length; i++) {
			var articleWiseWeightConfig	= articleWiseWeightDiffConfig[i];
			
			var articleWiseWeightDiffId	= articleWiseWeightConfig.articleWiseWeightDiffId;
			var srcBranch				= articleWiseWeightConfig.branchName;
			var partyName				= articleWiseWeightConfig.partyName;
			var packingType				= articleWiseWeightConfig.packingTypeName;
			var minWeight				= articleWiseWeightConfig.minWeight;
			var maxWeight				= articleWiseWeightConfig.maxWeight;
			var destBranch				= articleWiseWeightConfig.destBranchName;
			
			var createRow				= createRowInTable('tr_' + articleWiseWeightDiffId, '', '');
			
			var srNoCol					= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var srcBranchCol			= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var partyNameCol			= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var packingTypeCol			= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var minWeightCol			= createColumnInRow(createRow, 'editMinWeightColtd_' + articleWiseWeightDiffId, '', '', '', 'display: none;', '');
			var maxWeightCol			= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			
			if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
				var destBranchCol		= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			}
			
			var editBtnWeightDiffCol	= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', 'width: 100%; display: inline-block', '');
			
			appendValueInTableCol(srNoCol, (i + 1));
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(partyNameCol, partyName);
			appendValueInTableCol(packingTypeCol, packingType);
			
			if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
				appendValueInTableCol(destBranchCol, destBranch);
			}
			
			var inputAttr1		= new Object();
			var input1			= null;
			var inputAttr2		= new Object();
			var input2			= null;

			inputAttr1.id			= 'minWeight' + articleWiseWeightDiffId;
			inputAttr1.type			= 'text';
			inputAttr1.value		= minWeight;
			inputAttr1.name			= 'minWeight' + articleWiseWeightDiffId;
			inputAttr1.class		= 'form-control1';
			inputAttr1.style		= 'width: 70px;text-align: right;';
			inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr1.disabled		= 'true';

			input2	= createInput(minWeightCol, inputAttr1);
			input2.attr( {
				'data-value' : articleWiseWeightDiffId
			});

			inputAttr2.id			= 'maxWeight' + articleWiseWeightDiffId;
			inputAttr2.type			= 'text';
			inputAttr2.value		= maxWeight;
			inputAttr2.name			= 'maxWeight' + articleWiseWeightDiffId;
			inputAttr2.class		= 'form-control1';
			inputAttr2.style		= 'width: 70px;text-align: right;margin-left: 10px;';
			inputAttr2.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr2.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr2.disabled		= 'true';

			input2	= createInput(maxWeightCol, inputAttr2);
			input2.attr( {
				'data-value' : articleWiseWeightDiffId
			});

			var buttonEditJS		= new Object();
			var buttonEdit			= null;

			buttonEditJS.id			= 'editchrgWt' + articleWiseWeightDiffId;
			buttonEditJS.name		= 'editchrgWt' + articleWiseWeightDiffId;
			buttonEditJS.value		= 'Edit'; 
			buttonEditJS.html		= 'Edit';
			buttonEditJS.class		= 'btn btn-warning';
			buttonEditJS.onclick	= 'editArtWiseWeightDiffConfig(this);';
			buttonEditJS.style		= 'width: 50px;margin-left: 10px;';

			buttonEdit			= createButton(editBtnWeightDiffCol, buttonEditJS);
			buttonEdit.attr({
				'data-value' : articleWiseWeightDiffId
			});

			appendValueInTableCol(editBtnWeightDiffCol, '&emsp;');

			var buttonSaveJS		= new Object();
			var buttonSave			= null;

			buttonSaveJS.id			= 'saveWeightDiff' + articleWiseWeightDiffId;
			buttonSaveJS.name		= 'saveWeightDiff' + articleWiseWeightDiffId;
			buttonSaveJS.value		= 'Save';
			buttonSaveJS.html		= 'Save';
			buttonSaveJS.class		= 'btn btn-primary';
			buttonSaveJS.onclick	= 'updateArtWiseWeightDiffConfigWeight(this);';
			buttonSaveJS.style		= 'width: 50px; display: none;';

			buttonSave			= createButton(editBtnWeightDiffCol, buttonSaveJS);
			buttonSave.attr({
				'data-value' : articleWiseWeightDiffId
			});

			appendValueInTableCol(editBtnWeightDiffCol, '&emsp;');

			var buttonDeleteJS		= new Object();
			var buttonDelete			= null;

			buttonDeleteJS.id			= 'DeleteWeightDiff' + articleWiseWeightDiffId;
			buttonDeleteJS.name			= 'DeleteWeightDiff' + articleWiseWeightDiffId;
			buttonDeleteJS.value		= 'Delete';
			buttonDeleteJS.html			= 'Delete';
			buttonDeleteJS.class		= 'btn btn-danger';
			buttonDeleteJS.onclick		= 'deleteArtWiseWeightDiffConfig(this);';
			buttonDeleteJS.style		= 'width: 60px;';

			buttonDelete			= createButton(editBtnWeightDiffCol, buttonDeleteJS);
			buttonDelete.attr({
				'data-value' : articleWiseWeightDiffId
			});
			
			if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff) {
				changeDisplayProperty('editMinWeightColtd_' + articleWiseWeightDiffId, 'block');
			}
			
			if(!rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
				$("#destbranchfilter").remove();
			}
			
			appendRowInTable(tbodyId, createRow);
		}
	}
}

function resetAllChargeWeightConfigData() {
	//setValueToContent('categoryType', 'formField', 0);
	setValueToContent('chargeWeight', 'formField', 0);
	setArticleTypeForPartyChargeWeightPannel();
}

function editArtWiseWeightDiffConfig(obj) {
	var articleWiseWeightDiffId	= obj.getAttribute('data-value');
	$('#routewisejspanel #minWeight' + articleWiseWeightDiffId).removeAttr('disabled');
	$('#routewisejspanel #maxWeight' + articleWiseWeightDiffId).removeAttr('disabled');
	$('#routewisejspanel #saveWeightDiff' + articleWiseWeightDiffId).show();
	$(obj).hide();
}

function updateArtWiseWeightDiffConfigWeight(obj) {
	var articleWiseWeightDiffId	= obj.getAttribute('data-value');
	var minWeight		= $('#routewisejspanel #minWeight' + articleWiseWeightDiffId).val();
	var maxWeight		= $('#routewisejspanel #maxWeight' + articleWiseWeightDiffId).val();
	
	updateArtWiseWeightDiffConfig(articleWiseWeightDiffId, minWeight, maxWeight);
	$('#routewisejspanel #minWeight' + articleWiseWeightDiffId).prop('disabled', true);
	$('#routewisejspanel #maxWeight' + articleWiseWeightDiffId).prop('disabled', true);
	$('#routewisejspanel #editchrgWt' + articleWiseWeightDiffId).show();
	$(obj).hide();
}

function deleteArtWiseWeightDiffConfig(obj) {
	var articleWiseWeightDiffId		= obj.getAttribute('data-value');
	deleteArtWiseWeightDiffConfigById(articleWiseWeightDiffId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function updateArtWiseWeightDiffConfig(articleWiseWeightDiffId, minWeight, maxWeight) {

	if(!validateMaxValueInArticleWiseWeight('minWeight' + articleWiseWeightDiffId, 'maxWeight' + articleWiseWeightDiffId)) {
		return false;
	}
	
	var jsonObject					= new Object();
	
	jsonObject["articleWiseWeightDiffId"]	= articleWiseWeightDiffId;
	jsonObject["minWeight"]					= minWeight;
	jsonObject["maxWeight"]					= maxWeight;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateArticleWiseWeightDiffConfigById.do',
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

function deleteArtWiseWeightDiffConfigById(articleWiseWeightDiffId) {

	var jsonObject							= new Object();

	jsonObject["articleWiseWeightDiffId"]	= articleWiseWeightDiffId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteArticleWiseWeightDiffConfigById.do',
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

function viewAllArticleWiseWeightDifference() {
	var categoryType		= getValueFromInputField('categoryType');

	if(categoryType == branchTypeCategory) {
		if(!validateBranch()) return false;
	} else if(categoryType == partyTypeCategory) {
		if(!validateBranch()) return false;
		if(!validateParty()) return false;
	}
	
	var jsonObject					= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["destinationBranchId"]	= $('#destBranchId').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/viewAllArticleWiseWeightDiffConfig.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} else {
				var title			= 'Article Wise Weight Difference Charge';
				var mainId			= 'jsPanelMainContentForArtWiseWeightDiff';
				var tableId			= 'ViewArtWiseWeightDiffEditTable';
				var theadId			= 'ViewArtWiseWeightDiffEditTableTHead';
				var tbodyId			= 'ViewArtWiseWeightDiffEditTableTBody';
				var tfootId			= 'ViewArtWiseWeightDiffEditTableTFoot';
				var tfootRowClass	= 'ViewArtWiseWeightDiffTfootClass';
				
				createArtWiseWeightEditTableTHead(theadId);
				createTableForArtWiseWeightConfigDetails(data, tbodyId);
				createJsPanelForRateMaster(title, mainId);
				setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
				
				if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff) {
					changeDisplayProperty('minWeightCol', 'block');
					changeDisplayProperty('minweightfilterCol', 'block');
				}
			}
			hideLayer();
		}
	});
}

function createArtWiseWeightEditTableTHead(theadId) {
	$('#' + theadId).empty();
	
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var articleTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var minWeightCol		= createColumnInRow(row, 'minWeightCol', '', '', '', 'display: none;', '');
	var maxWeightCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
		var destBranchCol	= createColumnInRow(row, '', '', '', '', '', '');
	}
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Src. Branch</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(articleTypeCol, '<b>Article Type</b>');
	appendValueInTableCol(minWeightCol, '<b>Min Weight</b>');
	appendValueInTableCol(maxWeightCol, '<b>Max Weight</b>');
	
	if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
		appendValueInTableCol(destBranchCol, '<b>Dest Branch</b>');
	}
	
	appendRowInTable(theadId, row);	
}

function createTableForArtWiseWeightConfigDetails(data, tbodyId) {
	var articleWiseWeightDiffConfig	= data.articleWiseWeightDiffConfig;
	
	$('#' + tbodyId).empty();
	
	if(articleWiseWeightDiffConfig != null) {
		
		for(var i = 0; i < articleWiseWeightDiffConfig.length; i++) {
			var articleWiseWeightConfig	= articleWiseWeightDiffConfig[i];
			
			var articleWiseWeightDiffId	= articleWiseWeightConfig.articleWiseWeightDiffId;
			var srcBranch				= articleWiseWeightConfig.branchName;
			var partyName				= articleWiseWeightConfig.partyName;
			var packingType				= articleWiseWeightConfig.packingTypeName;
			var minWeight				= articleWiseWeightConfig.minWeight;
			var maxWeight				= articleWiseWeightConfig.maxWeight;
			var destBranch				= articleWiseWeightConfig.destBranchName;
			
			var createRow			= createRowInTable('tr_' + articleWiseWeightDiffId, '', '');
			
			var srNoCol				= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var srcBranchCol		= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var partyNameCol		= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var packingTypeCol		= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			var minWeightCol		= createColumnInRow(createRow, 'minWeightColtd_' + articleWiseWeightDiffId, '', '', '', 'display: none;', '');
			var maxWeightCol		= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			
			if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
				var destBranchCol	= createColumnInRow(createRow, 'td_' + articleWiseWeightDiffId, '', '', '', '', '');
			}
			
			appendValueInTableCol(srNoCol, (i + 1));
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(partyNameCol, partyName);
			appendValueInTableCol(packingTypeCol, packingType);
			appendValueInTableCol(minWeightCol, minWeight);
			appendValueInTableCol(maxWeightCol, maxWeight);
			
			if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff) {
				appendValueInTableCol(destBranchCol, destBranch);
			}
			
			if(rateMasterConfiguration.DisplayMinWeightInArticleWiseWeightDiff) {
				changeDisplayProperty('minWeightColtd_' + articleWiseWeightDiffId, 'block');
			}
			
			if(rateMasterConfiguration.isShowDestBranchInArticleWiseWeightDiff == 'false') {
				$("#destbranchfilter").remove();
			}
			
			appendRowInTable(tbodyId, createRow);
		}
	}
}

function resetAllChargeWeightConfigData() {
	//setValueToContent('categoryType', 'formField', 0);
	setValueToContent('chargeWeight', 'formField', 0);
	setArticleTypeForPartyChargeWeightPannel();
}