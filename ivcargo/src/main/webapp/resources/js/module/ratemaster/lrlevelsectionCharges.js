/**
 * 
 */
//LR Charge Section validation
function validateLRChargeSection() {

	if(!validateMainSection(2)) return false;

	// iterating charges array and validating LR level charges 

	if(rateMasterConfiguration.destinationWiseLRLevelCharges) {
		if(!validateDestination()) return false;
		if(!validateDestinationTypes()) return false;
	}

	return true;
}

function validateDestination() {
	return validateInputTextFeild(1, 'lrLevelDestination', 'lrLevelDestination', 'error', destinationTypeErrMsg);
}

function validateDestinationTypes() {
	if ($("#lrLevelMultiIdlist").find('tr').length == 0) {
		if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_BRANCH) {
			showMessage('info', destinationBranchInfoMsg);
			changeTextFieldColor('lrLevelDestinationBranch', '', '', 'red');
			return false;
		} else if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_SUB_REGION) {
			showMessage('info', destinationAreaInfoMsg);
			changeTextFieldColor('lrLevelDestinationArea', '', '', 'red');
			return false;
		} else if ($('#lrLevelDestination').val() == RateMasterConstant.DESTINATION_TYPE_REGION) {
			showMessage('info', destinationRegionInfoMsg);
			changeTextFieldColor('lrLevelDestinationRegion', '', '', 'red');
			return false;
		}
	}
	return true;
}

//save LR section chrges. save if new update if exist
function addLRSectionCharges() {
	if(!validateLRChargeSection()) return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();

			let jsonObject		= new Object();
			
			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["sourceCityId"] 			= $('#cityId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["lrLevelDestination"]	= $('#lrLevelDestination').val();
			jsonObject["billSelectionId"] 		= $('#billSelection').val();
			jsonObject["corporateAccountIds"]	= getSelectedPartyIdsOnGstn();
			
			if(rateMasterConfiguration.showWayBillTypeInLRLevelSection)
				jsonObject["wayBillTypeId"] = $('#wayBillTypeIds').val();
			
			let checkBoxArray	= new Array();
			
			$("input[name=lrLevelMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');
			
			let lrcharges 	= new Object(); 

			for (const element of charges) {
				if(jQuery.inArray(element.chargeTypeMasterId, lrLevelCharges) != -1 && $('#charge' + element.chargeTypeMasterId).val() >= 0) {
					lrcharges[element.chargeTypeMasterId] = $('#charge' + element.chargeTypeMasterId).val() + '_' + $('#chargeUnit' + element.chargeTypeMasterId).val();
					jsonObject["isGroupLevel_" + element.chargeTypeMasterId] = $('#isGroupLevel_' + element.chargeTypeMasterId).is(':checked');
					jsonObject["isEditable_" + element.chargeTypeMasterId] = $('#isEditable_' + element.chargeTypeMasterId).is(':checked');
				}
			}

			jsonObject.lrcharges = JSON.stringify(lrcharges);

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/saveLRSectionCharge.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						getChargesConfigRates();
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

//delete LR section chrges. save if new update if exist
function deleteLRSectionCharges() {

	if(!validateMainSection(2)) return false;
	if(!validateLRLevelChargesDropdown3()) return false;
	
	if(rateMasterConfiguration.destinationWiseLRLevelCharges) {
		if(!validateDestination()) return false;
		if(!validateDestinationTypes()) return false;
	}

	$.confirm({
		text: "Are you sure you want to Delete Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();

			jsonObject["sourceBranchId"]		= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown3').val();
			jsonObject["lrLevelDestination"]	= $('#lrLevelDestination').val();
			jsonObject["billSelectionId"] 		= $('#billSelection').val();
			jsonObject["sourceCityId"] 			= $('#cityId').val();
			
			let checkBoxArray	= new Array();
			
			$("input[name=lrLevelMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteLRSectionCharge.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						getChargesConfigRates();
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			// nothing to do
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

function saveLrLevelCharge(checkBox) {
	if((!$('#isGroupLevel').exists() || !$('#isGroupLevel').is(':checked')) && !validateMainSection(2)) return false;

	if(rateMasterConfiguration.destinationWiseLRLevelCharges) {
		if(!validateDestination()) return false;
		if(!validateDestinationTypes()) return false;
	}
	
	if(!validateFields())
		return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			let chargeApplicableOnId = 0;
			let fieldId				 = 0;
		
			if(!checkForFieldInApplicableOn) {
				chargeApplicableOnId 	= $('#chargesApplicableForLrLevel').val();
				applicableOnCategoryId  = ChargeConfigurationConstant.APPLICABLE_ON_CATEGORY_ID_CHARGE;
			} else {
				fieldId				 	= $('#chargesApplicableForLrLevel').val();
				applicableOnCategoryId  = ChargeConfigurationConstant.APPLICABLE_ON_CATEGORY_ID_FIELD;
			}
			
			jsonObject["isPercent"] 						= checkBox.checked; 
			jsonObject["chargeApplicableOn"] 				= chargeApplicableOnId; 
			jsonObject["chargeTypeMasterId"] 				= $('#chargesDropDownForLrLevel').val(); 
			jsonObject["chargeMinAmount"]					= Number($('#chargeValueId').val().replace('%', ""));
			jsonObject["checkForFieldInApplicableOn"]		= checkForFieldInApplicableOn;
			jsonObject["fieldId"]							= fieldId;
			jsonObject["applicableOnCategoryId"]			= applicableOnCategoryId;
			
			jsonObject["lrLevelDestination"]	= $('#lrLevelDestination').val();
			jsonObject["billSelectionId"] 		= $('#billSelection').val();
			jsonObject["isGroupLevel"] 			= $('#isGroupLevel').is(':checked');
			jsonObject["isEditable"] 			= !rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate || $('#isEditableConditionalBaseRate').is(':checked');
			
			if(!$('#isGroupLevel').is(':checked')) {
				jsonObject["sourceBranchId"]		= $('#branchId').val();
				jsonObject["corporateAccountId"]	= $('#partyId').val();
				jsonObject["sourceCityId"] 			= $('#cityId').val();
			}
			
			let checkBoxArray	= new Array();
			
			$("input[name=lrLevelMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/savePercentWiseLRSectionCharge.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						$('#chargesDropDownForLrLevel').val(0);
						$('#charge' + $('#chargesDropDownForLrLevel').val()).val(Number($('#chargeValueId').val().replace('%', "")));
						$('#chargeValueId').val("");
						$('#'+checkBox.id).prop("checked", false);
						$('#isEditableConditionalBaseRate').prop("checked", false);
						$('#isGroupLevel').prop("checked", false);
						$('#chargesApplicableForLrLevel').val(0);
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

function validateFields() {
	if(!validateInput(1, 'chargesDropDownForLrLevel', 'chargesDropDownForLrLevel', 'basicError', 'Please, Select Charge Type !'))
		return false;
	
	if(!validateInput(1, 'chargeValueId', 'chargeValueId', 'basicError', 'Please, Insert charge greater than zero !'))
		return false;
	
	return !(!validateInput(1, 'chargesApplicableForLrLevel', 'chargesApplicableForLrLevel', 'basicError', 'Select Applicable on !'));
}

function viewAllLrLevelCharge() {

	if((!$('#isGroupLevel').exists() || !$('#isGroupLevel').is(':checked')) && !validateMainSection(2)) return false;

	showLayer();

	let jsonObject				= new Object();
	
	jsonObject["billSelectionId"] 		= $('#billSelection').val();
	jsonObject["isGroupLevel"] 			= $('#isGroupLevel').is(':checked');
			
	if(!$('#isGroupLevel').is(':checked')) {
		jsonObject["sourceBranchId"]		= $('#branchId').val();
		jsonObject["corporateAccountId"]	= $('#partyId').val();
		jsonObject["sourceCityId"] 			= $('#cityId').val();
	}
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/viewAllLrLevelCharge.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			let title			= 'LR Level Charges';
			let mainId			= 'jsPanelMainContentForLrLevelCharges';
			let tableId			= 'lrLevelRatesEditTable';
			let theadId			= 'lrLevelRatesEditTableTHead';
			let tbodyId			= 'lrLevelRatesEditTableTBody';
			let tfootId			= 'lrLevelRatesEditTableTFoot';
			let tfootRowClass	= 'tfootClass';
			
			createLrLevelRatesTHead(theadId);
			createLrLevelRatesEditData(data, tbodyId);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
		}
	});
}

function createLrLevelRatesTHead(theadId) {
	if(!rateMasterConfiguration.destinationWiseLRLevelCharges)
		$('#destbranchfilterId').remove();
	
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol				= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	if(rateMasterConfiguration.destinationWiseLRLevelCharges)
		var destBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	var partyNameColCol		= createColumnInRow(row, '', '', '', '', '', '');
	var chargeTypeCol		= createColumnInRow(row, '', '', '', '', '', '');
	var isPresentCol		= createColumnInRow(row, '', '', '', '', '', '');
	var applicableOnCol		= createColumnInRow(row, '', '', '', '', '', '');
	
	if(rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate)
		var editableCol		= createColumnInRow(row, '', '', '', '', '', '');
		
	var amountCol			= createColumnInRow(row, '', '', '', '', '', '');
	var optionsCol			= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	
	if(isCityWiseRates)
		appendValueInTableCol(srcBranchCol, '<b>City Name</b>');
	else if(isRegionWiseRates)
		appendValueInTableCol(srcBranchCol, '<b>Region Name</b>');
	else
		appendValueInTableCol(srcBranchCol, '<b>Branch Name</b>');
	
	if(rateMasterConfiguration.destinationWiseLRLevelCharges)
		appendValueInTableCol(destBranchCol, '<b>Destination</b>');
		
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(chargeTypeCol, '<b>Charge Type</b>');
	appendValueInTableCol(isPresentCol, '<b>Is Percent</b>');
	appendValueInTableCol(applicableOnCol, '<b>Applicable On</b>');
	
	if(rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate)
		appendValueInTableCol(editableCol, '<b>Editable</b>');
	
	appendValueInTableCol(amountCol, '<b>Amount</b>');
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);
}

function createLrLevelRatesEditData(data, tbodyId) {

	let LrLevelCharges	= data.chargeConfigurationArr;
	
	$('#' + tbodyId).empty();

	for (let i = 0; i < LrLevelCharges.length; i++) {

		let chargeConfigurationId	= LrLevelCharges[i].chargeConfigurationId;
		let row		= createRowInTable("tr_" + chargeConfigurationId, '', '');
		
		let col1	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '2%', 'right', '', '');
		let col2	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '10%', 'left', '', '');
		
		if(rateMasterConfiguration.destinationWiseLRLevelCharges)
			var destBranchCol		= createColumnInRow(row, '', '', '', '', '', '');
		
		let col3	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '10%', 'left', '', '');
		let col4	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '4%', 'left', '', '');
		let col5	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '4%', 'right', '', '');
		let col6	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '10%', 'left', '', '');
		let col7	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '10%', 'left', '', '');
		
		if(rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate)
			var editableCol	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '10%', 'left', '', '');
		
		let col8	= createColumnInRow(row, "td_" + chargeConfigurationId, '', '35%', 'left', '', '');

		appendValueInTableCol(col1, i);
		appendValueInTableCol(col2, LrLevelCharges[i].branchName);
		appendValueInTableCol(destBranchCol, LrLevelCharges[i].destinationBranchName);
		appendValueInTableCol(col3, LrLevelCharges[i].partyName);
		appendValueInTableCol(col4, LrLevelCharges[i].chargeName);
		
		if(LrLevelCharges[i].ispercent)
			appendValueInTableCol(col5, 'YES');
		else
			appendValueInTableCol(col5, 'NO');
		
		appendValueInTableCol(col6, LrLevelCharges[i].chargeApplicableOnName);
		
		if(rateMasterConfiguration.isShowEditableCheckboxInConditionalLRLevelRate) {
			if(LrLevelCharges[i].editable)
				appendValueInTableCol(editableCol, 'YES');
			else
				appendValueInTableCol(editableCol, 'NO');
		}

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'lrlevelRate' + chargeConfigurationId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= LrLevelCharges[i].chargeMinAmount;
		inputAttr1.name			= 'lrlevelRate' + chargeConfigurationId;
		inputAttr1.class		= 'form-control';
		inputAttr1.style		= 'width: 70px;text-align: right;';
		inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col7, inputAttr1);
		input.attr( {
			'data-value' : chargeConfigurationId
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'editLrlevelRate' + chargeConfigurationId;
		buttonEditJS.name		= 'editLrlevelRate' + chargeConfigurationId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-warning';
		buttonEditJS.onclick	= 'editLrLevelRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(col8, buttonEditJS);
		buttonEdit.attr({
			'data-value' : chargeConfigurationId
		});

		appendValueInTableCol(col8, '&emsp;');

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'saveLrlevelRate' + chargeConfigurationId;
		buttonSaveJS.name		= 'saveLrlevelRate' + chargeConfigurationId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateLrLevelRate(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(col8, buttonSaveJS);
		buttonSave.attr({
			'data-value' : chargeConfigurationId
		});

		appendValueInTableCol(col8, '&emsp;');

		var buttonDeleteJS		= new Object();
		var buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete' + chargeConfigurationId;
		buttonDeleteJS.name			= 'Delete' + chargeConfigurationId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'btn btn-danger';
		buttonDeleteJS.onclick		= 'deleteLrLevelRate(this);';
		buttonDeleteJS.style		= 'width: 60px;';

		buttonDelete			= createButton(col8, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' : chargeConfigurationId
		});
		
		appendRowInTable(tbodyId, row);
	}
}

function editLrLevelRate(obj) {
	var chargeConfigurationId	= obj.getAttribute('data-value');
	$('#routewisejspanel #lrlevelRate' + chargeConfigurationId).removeAttr('disabled');
	$('#routewisejspanel #saveLrlevelRate' + chargeConfigurationId).show();
	$(obj).hide();
}

function updateLrLevelRate(obj) {
	var chargeConfigurationId		= obj.getAttribute('data-value');
	var rateValue	= $('#routewisejspanel #lrlevelRate' + chargeConfigurationId).val();
	updateLrLevelRateMaster(chargeConfigurationId, rateValue);
	$('#routewisejspanel #lrlevelRate' + chargeConfigurationId).prop('disabled', true);
	$('#routewisejspanel #editLrlevelRate' + chargeConfigurationId).show();
	$(obj).hide();
}

function deleteLrLevelRate(obj) {
	var chargeConfigurationId		= obj.getAttribute('data-value');
	deleteLrLevelRateMaster(chargeConfigurationId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function updateLrLevelRateMaster(chargeConfigurationId, rate) {

	var jsonObject							= new Object();
	
	jsonObject["chargeConfigurationId"]	= chargeConfigurationId;
	jsonObject["rate"]					= rate;

	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateLrLevelCharge.do',
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

function deleteLrLevelRateMaster(chargeConfigurationId) {

	var jsonObject		= new Object();

	jsonObject["chargeConfigurationId"]	= chargeConfigurationId;
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteLrLevelRateMaster.do',
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

/*
 * get rates form chargeconfiguration table.
 */
function getChargesConfigRates() {

	let jsonObject					= new Object();

	jsonObject["sourceBranchId"]		= $('#branchId').val();
	jsonObject["sourceCityId"] 			= $('#cityId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["billSelectionId"] 		= $('#billSelection').val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getLRLevelChargeConfiguration.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				resetAllConfigurationCharges();
				hideLayer();
				return;
			}
			
			chargesConfigRates	= null;
			chargesConfigRates	= data.chargesConfigRates;
			applyRates();
			
			hideLayer();
		}
	});
}