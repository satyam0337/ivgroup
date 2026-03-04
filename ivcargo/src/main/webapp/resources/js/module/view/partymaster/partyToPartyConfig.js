define([
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'focusnavigation'
], function(Selectizewrapper) {
	'use strict';

	let jsonObject = {};
	let _this = '';
	let dataList = [];
	let list = null;
	let allowLrTypeSelection = false;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/partyToPartyConfigMasterWS/loadPartyConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = [];
			let baseHtml = $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/partyToPartyConfig.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				allowLrTypeSelection = response.allowLrTypeSelection;
				
				if(allowLrTypeSelection)
					$("#lrTypeDiv").show();

				Selectizewrapper.setAutocomplete({
					url: WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false',
					valueField: 'corporateAccountId',
					labelField: 'corporateAccountDisplayName',
					searchField: 'corporateAccountDisplayName',
					elementId: 'fromPartyEle',
					responseObjectKey: 'result',
					create: false,
					maxItems: 1
				});

				Selectizewrapper.setAutocomplete({
					url: WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false',
					valueField: 'corporateAccountId',
					labelField: 'corporateAccountDisplayName',
					searchField: 'corporateAccountDisplayName',
					elementId: 'toPartyEle',
					responseObjectKey: 'result',
					create: false,
					maxItems: 5
				});
				
				if(allowLrTypeSelection) {
					Selectizewrapper.setAutocomplete({
						jsonResultList: response.WayBillTypeConstantList,
						valueField: 'wayBillTypeId',
						labelField: 'wayBillType',
						searchField: 'wayBillType',
						elementId: 'lrType',
						create: false,
						maxItems: response.WayBillTypeConstantList.length
					});
				}

				let branchAutoComplete = {
					primary_key: 'branchId',
					url: response.branchList,
					field: 'branchName'
				};
				
				$("#sourceBranchEle").autocompleteCustom(branchAutoComplete).html();

				let destBranchAutoComplete = {
					primary_key: 'branchId',
					url: response.branchList,
					field: 'branchName'
				};
				
				$("#destBranchEle").autocompleteCustom(destBranchAutoComplete).html();

				$("#addRowBtn").on("click", function() {
					$('#bottom-border-boxshadow').addClass('hide');
					
					if (_this.validateFeilds())
						_this.addData();
				});

				$("#saveBtn").on("click", function() {
					_this.saveData();
				});
			
				$("#viewAllBtn").on("click", function() {
					$('#middle-border-boxshadow').addClass('hide');
					_this.getAllData();
				});

				$('#dataTable').on('click', '.deleteBtn', function() {
					const row = $(this).closest('tr');
					
					const consignorId 		= row.data('consignor-id');
					const consigneeId 		= row.data('consignee-id');
					const sourceBranchId 	= row.data('source-branch-id');
					const destBranchId 		= row.data('dest-branch-id');
					const lrTypeIds 		= row.data('lr-type-ids');
					
					dataList = dataList.filter(item =>
							!(item.consignorNameId === String(consignorId) &&
							  item.consigneeIdVal === String(consigneeId) &&
							  item.sourceBranchId === String(sourceBranchId) &&
							  item.destBranchId === String(destBranchId) &&
							  item.lrTypeIds === String(lrTypeIds))
						);
					row.remove();
				
					if ($('#dataTable tr').length == 1)
						$('#middle-border-boxshadow').addClass('hide');
				});

				hideLayer();
			});
		}, validateFeilds: function() {
			if ($("#fromPartyEle").val() == 0) {
				showAlertMessage('error', 'Select From Party !');
				return false;
			}
			
			if ($("#toPartyEle").val() == 0) {
				showAlertMessage('error', 'Select To Party !');
				return false;
			}
			
			if(allowLrTypeSelection && !$("#lrType").val()) {
				showAlertMessage('error', 'Select LR Type !');
				return false;
			}
			
			let consignorId = $('#fromPartyEle').val()?.trim();
			let consigneeIds = $('#toPartyEle').val()?.split(',');

			if (consignorId && consigneeIds && consigneeIds.includes(consignorId)) {
				showAlertMessage('error', 'Same Party !');
				return false;
			}

			if ($("#fromPartyEle").val() == $("#toPartyEle").val()) {
				showAlertMessage('error', 'Same Party !');
				return false;
			}
			
			if ($("#sourceBranchEle").val() == 0) {
				showAlertMessage('error', 'Select Source Branch!');
				return false;
			}
			
			if ($("#destBranchEle").val() == 0) {
				showAlertMessage('error', 'Select Destination Branch!');
				return false;
			}
			
			return true;
		}, addData: function() {
			$("#dataTable thead").empty();
			var headerColumnArray = new Array();
			
			headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Consignor</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Consignee</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Source</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Destination</th>');
			
			if(allowLrTypeSelection)
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">LR Types</th>');
			
			headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
			
			$("#dataTable thead").append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			
			let consignorName 		= $('#fromPartyEle')[0].selectize.getItem($('#fromPartyEle')[0].selectize.getValue()).text();
			
			let consigneeList 		= _this.getSelectedValuesFromSelectize('toPartyEle');
			let lrTypes 			= _this.getSelectedValuesFromSelectize('lrType');
			let lrTypesStr 			= lrTypes.join(', ');

			let consignorNameId		= $('#fromPartyEle').val().trim();
			let consigneeId			= $('#toPartyEle').val().split(',');
			let destBranch			= $('#destBranchEle').val().trim();
			let sourceBranch		= $('#sourceBranchEle').val().trim();
			let tableBody			= $('#dataTable tbody');
			let sourceBranchId		= $('#sourceBranchEle_primary_key').val().trim();
			let destBranchId		= $('#destBranchEle_primary_key').val().trim();
			let lrTypeIds			= $('#lrType').val().trim();

			$.each(consigneeList, function(index, consignee) {
				let consigneeIdVal = consigneeId[index];
				consignee = consignee.trim();
				$('#middle-border-boxshadow').removeClass('hide');

				let rowHtml = `
				<tr 
					data-consignor-id="${consignorNameId}" 
					data-consignee-id="${consigneeIdVal}" 
					data-source-branch-id="${sourceBranchId}" 
					data-dest-branch-id="${destBranchId}"
					data-lr-type-ids="${lrTypeIds}"
				>
					<td style="text-align:center;">${consignorName}</td>
					<td style="text-align:center;">${consignee}</td>
					<td style="text-align:center;">${sourceBranch}</td>
					<td style="text-align:center;">${destBranch}</td>
					${allowLrTypeSelection ? `<td style="text-align:center;">${lrTypesStr}</td>` : ''}
					<td style="text-align:center;"><button type="button" class="btn btn-danger btn-sm deleteBtn">Delete</button></td>
				</tr>`;

					
				tableBody.append(rowHtml);

				dataList.push({
					consignorNameId,
					consigneeIdVal,
					sourceBranch,
					destBranch,
					sourceBranchId,
					destBranchId,
					lrTypeIds
				});
			});

			$('#fromPartyEle').val('');
			$('#toPartyEle').val([]);
			$('#destBranchEle').val('');
			$('#sourceBranchEle').val('');
			$('#fromPartyEle')[0].selectize.clear();
			$('#toPartyEle')[0].selectize.clear();
			
			if(allowLrTypeSelection)
				$('#lrType')[0].selectize.clear();
		}, saveData: function() {
			showLayer();
			let jsonObject = _this.getDataToSave();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/partyToPartyConfigMasterWS/savePartyDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, getDataToSave: function() {
			let partyDetailsArray = dataList.map(item => ({
				fromBranchId: item.sourceBranchId,
				toBranchId: item.destBranchId,
				fromPartyId: item.consignorNameId,
				toPartyId: item.consigneeIdVal,
				lrTypeIds: item.lrTypeIds
				
			}));

			return {
				partyDetails: JSON.stringify(partyDetailsArray)
			};
		}, setData: function(response) {
			hideLayer();
			
			$('#mainTable').empty();
				list = response.partyDetailList;

			if (list.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');

				let headers = `
					<tr>
						<th style="text-align:center;">Select<br><input name="selectAll" id="selectAll" type="checkbox" onclick="selectAllCheckBox(this.checked);"></th>
						<th style="text-align:center;">Consignor</th>
						<th style="text-align:center;">Consignee</th>
						<th style="text-align:center;">From</th>
						<th style="text-align:center;">To</th>
						${allowLrTypeSelection ? `<th style="text-align:center;">LR Types</th>` : ''}
						<th style="text-align:center;">Delete</th>
					</tr>`;
				$('#mainTable').append(headers);

				for (let data of list) {
					let rowHtml = `
						<tr id="partyToPartyConfigId_${data.partyToPartyConfigId}">
							<td style="text-align:center;"><input type="checkbox" name="deleteData" value="${data.partyToPartyConfigId}"></td>
							<td style="text-align:center;">${data.consignor}</td>
							<td style="text-align:center;">${data.consignee}</td>
							<td style="text-align:center;">${data.sourceBranch}</td>
							<td style="text-align:center;">${data.destBranch}</td>
							${allowLrTypeSelection ? `<td style="text-align:center;">${data.lrTypesString}</td>` : ''}
							<td  style="text-align:center;"><button type="button" class="btn btn-danger bg-danger" id="delete_${data.partyToPartyConfigId}" >Delete</button></td>
							
						</tr>`;
					$('#mainTable').append(rowHtml);

					$(`#delete_${data.partyToPartyConfigId}`).on("click", function() {
						if (confirm("Are you sure want to delete?")) {
							let partyId = data.partyToPartyConfigId;
							let jsonObject = { partyToPartyConfigIds: partyId };
							
							getJSON(jsonObject, WEB_SERVICE_URL + '/master/partyToPartyConfigMasterWS/deletePartyData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
							$(`#partyToPartyConfigId_${partyId}`).remove();
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
				
				if (confirm("Are you sure want delete?")) {
					$.each($("input[name=deleteData]:checked"), function() {
						$(`#partyToPartyConfigId_${$(this).val()}`).remove();
					});
					
					jsonObject["partyToPartyConfigIds"] = checkBoxArray.join(',');
					getJSON(jsonObject, WEB_SERVICE_URL + '/master/partyToPartyConfigMasterWS/deletePartyData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
				}
			});
		}, setResponse: function(response) {
			hideLayer();
	
			if (response.message) {
				$('#middle-border-boxshadow').addClass('hide');
				$("#dataTable tbody").empty();
			}
		}, responseAfterScucess: function(response) {
			hideLayer();
			
			if (response.message !== undefined && $('#mainTable tr').length == 1)
				$('#bottom-border-boxshadow').addClass('hide');
		}, getAllData: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/partyToPartyConfigMasterWS/getPartyToPartyConfigDetails.do?', _this.setData, EXECUTE_WITHOUT_ERROR);
		}, getSelectedValuesFromSelectize : function (elementId) {
			const element = $(`#${elementId}`)[0];
				
			if (!element || !element.selectize)
				return [];
				
			let selectize = element.selectize;
			let selectedValues = selectize.getValue();
			selectedValues = Array.isArray(selectedValues) ? selectedValues : selectedValues.split(',');
	
			return selectedValues.map(value => {
				return selectize.getItem(value).clone().children('a.remove').remove().end().text().trim();
			});
		}
	});
});

function selectAllCheckBox(param) {
	let tab = document.getElementById('mainTable');

	for (let row = 1; row < tab.rows.length; row++) {
		if (tab.rows[row].cells[0].firstChild)
			tab.rows[row].cells[0].firstChild.checked = param;
	}
}
