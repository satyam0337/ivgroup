define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'//import in require.config
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function(Selection) {
	'use strict'; 
	let jsonObject = new Object(), _this = '', BRANCH_SELECTION = 1, GROUP_SELECTION = 4, REGION_SELECTION = 3, SUBREGION_SELECTION = 2, list = null;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/bookingControlMasterWS/getBookingControlMasterElement.do?', _this.setElementDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElementDetails: function(response) {
			initialiseFocus();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/bookingControlMaster/bookingControlMaster.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}

				let elementConfiguration = {
					sourceBranchElement		   : $('#sourceBranchEle'),
					destinationBranchElement   : $('#destinationBranchEle'),
					sourceRegionElement		   : $('#sourceRegionEle'),
					destinationRegionElement   : $('#destinationregionEle'),
					sourceSubregionElement	   : $('#sourceSubRegionEle'),
					destinationSubregionElement: $('#destinationSubRegionEle'),
				};
				
				Object.assign(response, {
					elementConfiguration	: elementConfiguration,
					sourceAreaSelection		: true,
					isPhysicalBranchesShow	: true,
					AllOptionsForRegion		: true,
					AllOptionsForSubRegion	: true,
					AllOptionsForBranch		: true
				});

				Selection.setSelectionToGetData(response);

				let options = [{ optionId: 4, optionName: "Group" }, { optionId: 1, optionName: "Branch" }, { optionId: 3, optionName: "Region" },{ optionId: 2, optionName: "SubRegion" }]
				let optionAutoComplete = new Object();
				optionAutoComplete.primary_key = 'optionId';
				optionAutoComplete.field = 'optionName';
				optionAutoComplete.url = options;
				$("#sourceSelectLevelEle").autocompleteCustom(optionAutoComplete);
				
				let destinationAutoComplete = {
					...optionAutoComplete,
					url: options.filter(opt => opt.optionName !== "Group")
				};
				
				$("#destinationSelectLevelEle").autocompleteCustom(destinationAutoComplete);
				
				response.wayBillTypeList.forEach(opt => {
					$('#wayBillTypeEle').append(new Option(opt.wayBillType, opt.wayBillTypeId));
				});
				
				$('#wayBillTypeEle').select2({
					placeholder: "Select LR Type",
					allowClear: true
				});
				
				response.regionList.forEach(region => {
					$('#sourceRegionEle1').append(new Option(region.regionName, region.regionId));
					$('#destinationRegionEle1').append(new Option(region.regionName, region.regionId));
				});
				
				$('#sourceRegionEle1, #destinationRegionEle1').select2({
					width: '250px',
					placeholder: "Select Region",
					allowClear: true
				});
				
				response.branchList.forEach(branch => {
					$('#sourceBranchEle1').append(new Option(branch.branchName, branch.branchId));
					$('#destinationBranchEle1').append(new Option(branch.branchName, branch.branchId));
				});

				$('#sourceBranchEle1, #destinationBranchEle1').select2({
					width: '250px',
					placeholder: "Select Branch",
					allowClear: true
				});
				
				response.subRegionList.forEach(subRegion => {
					$('#sourceSubRegionEle1').append(new Option(subRegion.subRegionName, subRegion.subRegionId));
					$('#destinationSubRegionEle1').append(new Option(subRegion.subRegionName, subRegion.subRegionId));
				});

				$('#sourceSubRegionEle1, #destinationSubRegionEle1').select2({
					width: '250px',
					placeholder: "Select Sub-Region",
					allowClear: true
				});
				
				hideLayer();

				$("#saveBtn").click(function() {
					let isValid = true;

					const fieldsToCheck = [
						{ selector: "#sourceSelectLevelEle", name: "Select Source Level" },
						{ selector: ".sourceRegionDiv:visible #sourceRegionEle1", name: "Source Region" },
						{ selector: ".sourceSubRegionDiv:visible #sourceSubRegionEle1", name: "Source Sub Region" },
						{ selector: ".sourceBranchDiv:visible #sourceBranchEle1", name: "Source Branch" },
						{ selector: "#destinationSelectLevelEle", name: "Select Destination Level" },
						{ selector: ".destinationRegionDiv:visible #destinationRegionEle1", name: "Destination Region" },
						{ selector: ".destinationSubRegionDiv:visible #destinationSubRegionEle1", name: "Destination Sub Region" },
						{ selector: ".destinationBranchDiv:visible #destinationBranchEle1", name: "Destination Branch" },
						{ selector: ".wayBillType:visible #wayBillTypeEle", name: "LR Type" }
					];

					fieldsToCheck.forEach(field => {
						const element = $(field.selector);
						
						if (element.is("input[type='text']") && !element.val().trim()
						|| element.is("select") && element.find("option:selected").length === 0) {
							isValid = false;
							showAlertMessage('error', `Please select ${field.name}!`);
							return false; 
						}
					});

					if (isValid)
						_this.saveBookingControl();
						
					$('#bottom-border-boxshadow').addClass('hide');
				});
				
				$("#viewAllBtn").on("click", function() {
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#middle-border-boxshadow').addClass('hide');
					_this.getAllData();
				});

				$('#sourceSelectLevelEle').change(function() {
					let value = parseInt($('#sourceSelectLevelEle_primary_key').val());
					$('.sourceGroupDiv, .sourceBranchDiv, .sourceRegionDiv, .sourceSubRegionDiv').addClass('hide');
				
					if (value === BRANCH_SELECTION)
						$('.sourceBranchDiv').removeClass('hide');
					else if (value === GROUP_SELECTION)
						$('.sourceGroupDiv').removeClass('hide');
					else if (value === REGION_SELECTION)
						$('.sourceRegionDiv').removeClass('hide');
					else if (value === SUBREGION_SELECTION)
						$('.sourceSubRegionDiv').removeClass('hide');
				});
				
				$('#destinationSelectLevelEle').change(function() {
					let value = parseInt($('#destinationSelectLevelEle_primary_key').val());
					$('.destinationGroupDiv, .destinationBranchDiv, .destinationRegionDiv, .destinationSubRegionDiv').addClass('hide');
					
					if (value === BRANCH_SELECTION)
						$('.destinationBranchDiv').removeClass('hide');
					else if (value === GROUP_SELECTION)
						$('.destinationGroupDiv').removeClass('hide');
					else if (value === REGION_SELECTION)
						$('.destinationRegionDiv').removeClass('hide');
					else if (value === SUBREGION_SELECTION)
						$('.destinationSubRegionDiv').removeClass('hide');
				});
			});
		}, saveBookingControl: function() {
			showLayer();

			let jsonObject = Selection.getElementData();
			
			jsonObject.sourceType			= $('#sourceSelectLevelEle_primary_key').val();
			jsonObject.destinationType		= $('#destinationSelectLevelEle_primary_key').val();
			jsonObject.wayBillType			= getValuesFromSelectElement('wayBillTypeEle');
			jsonObject.sourceGroup			= getValuesFromSelectElement('sourceGroupEle1');
			jsonObject.destinationGroup		= getValuesFromSelectElement('destinationGroupEle1');
			jsonObject.sourceRegion			= getValuesFromSelectElement('sourceRegionEle1');
			jsonObject.destinationRegion	= getValuesFromSelectElement('destinationRegionEle1');
			jsonObject.sourceSubRegion		= getValuesFromSelectElement('sourceSubRegionEle1');
			jsonObject.destinationSubRegion = getValuesFromSelectElement('destinationSubRegionEle1');
			jsonObject.sourceBranch			= getValuesFromSelectElement('sourceBranchEle1');
			jsonObject.destinationBranch	= getValuesFromSelectElement('destinationBranchEle1');
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/bookingControlMasterWS/insertBookingControlDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, setResponse: function(response) {
			hideLayer();
			
			if (response.message)
				$('#middle-border-boxshadow').addClass('hide');
			
			resetForm();
			refreshCache(BOOKING_CONTROL_MASTER, response.accountGroupId);
		}, responseAfterScucess: function(response) {
			hideLayer();
			
			if (response.message !== undefined) {
				if ($('#mainTable tr').length == 1)
					$('#bottom-border-boxshadow').addClass('hide');
				
				refreshCache(BOOKING_CONTROL_MASTER, response.accountGroupId);
			}
		}, setData: function(response) {
			hideLayer();
			
			$('#mainTable').empty();
				list = response.bookingControlMasterDetailsList;
				
			if (list.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');

				let headers = `
					<tr>
						<th style="text-align:center;">Select<br><input name="selectAll" id="selectAll" type="checkbox" onclick="selectAllCheckBox(this.checked);"></th>
						<th style="text-align:center;">Sr. No.</th>
						<th style="text-align:center;">LR Type</th>
						<th style="text-align:center;">Source Branch</th>
						<th style="text-align:center;">Source Type</th>
						<th style="text-align:center;">Destination Branch</th>
						<th style="text-align:center;">Destination Type</th>
						<th style="text-align:center;">Delete</th>
					</tr>`;
				$('#mainTable').append(headers);

				let count = 1;
				
				for (let data of list) {
					let rowHtml = `
						<tr id="brachWaybillTypeConfigId_${data.branchWayBillTypeConfigurationId}">
							<td style="text-align:center;"><input type="checkbox" name="deleteData" value="${data.branchWayBillTypeConfigurationId}"></td>
							<td style="text-align:center;">${count++}</td>
							<td style="text-align:center;">${data.wayBillType}</td>
							<td style="text-align:center;">${data.sourceBranch ? data.sourceBranch : 'All'}</td>
							<td style="text-align:center;">${data.sourceTypeName}</td>
							<td style="text-align:center;">${data.destBranch ? data.destBranch : 'All'}</td>
							<td style="text-align:center;">${data.destinationTypeName}</td>
							<td	 style="text-align:center;"><button type="button" class="btn btn-danger bg-danger" id="delete_${data.branchWayBillTypeConfigurationId}" >Delete</button></td>
							
						</tr>`;
					$('#mainTable').append(rowHtml);

					$(`#delete_${data.branchWayBillTypeConfigurationId}`).on("click", function() {
						if (confirm("Are you sure want to delete?")) {
							let branchWayWillTypeId = data.branchWayBillTypeConfigurationId;
							let jsonObject = { branchWayBillTypeConfigurationIds: branchWayWillTypeId };
							
							getJSON(jsonObject, WEB_SERVICE_URL + '/master/bookingControlMasterWS/deleteBranchWayBillTypeConfigData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
							$(`#brachWaybillTypeConfigId_${branchWayWillTypeId}`).remove();
						}
					});
				}
			}

			$("#deleteAll").on("click", function() {
				let checkBoxArray = getAllCheckBoxSelectValue('deleteData');

				if (checkBoxArray.length == 0) {
					showAlertMessage('error', 'Please Select At least one Checkbox!');
					return false;
				}
				
				if (confirm("Are you sure want delete " + checkBoxArray.length + " records ?")) {
					$.each($("input[name=deleteData]:checked"), function() {
						$(`#brachWaybillTypeConfigId_${$(this).val()}`).remove();
					});
					
					jsonObject["branchWayBillTypeConfigurationIds"] = checkBoxArray.join(',');
					getJSON(jsonObject, WEB_SERVICE_URL + '/master/bookingControlMasterWS/deleteBranchWayBillTypeConfigData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
				}
			});
		}, getAllData: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/bookingControlMasterWS/showBookingControlDetails.do?', _this.setData, EXECUTE_WITHOUT_ERROR);
		}
	});
});

function getValuesFromSelectElement(elementId) {
	const selectedOptions = $(`#${elementId}`).val() || [];
	return selectedOptions.filter(value => value !== '' && value !== undefined).join(',');
}

function resetForm() {
	$('#sourceSelectLevelEle').val('').trigger('change');
	$('#destinationSelectLevelEle').val('').trigger('change');

	$('#sourceRegionEle1').val(null).trigger('change');
	$('#sourceSubRegionEle1').val(null).trigger('change');
	$('#sourceBranchEle1').val(null).trigger('change');
	$('#destinationRegionEle1').val(null).trigger('change');
	$('#destinationSubRegionEle1').val(null).trigger('change');
	$('#destinationBranchEle1').val(null).trigger('change');

	$('#wayBillTypeEle1').val(null).trigger('change'); 
	$('#wayBillTypeEle1').select2('val', null);
	$('#wayBillTypeEle').val(null).trigger('change').select2('val', null);

	$('.sourceRegionDiv, .sourceSubRegionDiv, .sourceBranchDiv').addClass('hide');
	$('.destinationRegionDiv, .destinationSubRegionDiv, .destinationBranchDiv').addClass('hide');
}

function selectAllCheckBox(param) {
	let tab = document.getElementById('mainTable');

	for (let row = 1; row < tab.rows.length; row++) {
		if (tab.rows[row].cells[0].firstChild) {
			tab.rows[row].cells[0].firstChild.checked = param;
		}
	}
}

