let dataList = [];
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
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/loadBranchWiseDispatchConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getElementConfigDetails: function(response) {
			let loadelement = [];
			let baseHtml = $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/master/branchWiseDispatchConfigMaster/branchWiseDispatchConfigMaster.html", function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let branchList = response.branchList
				let branchAutoComplete = {
					primary_key: 'branchId',
					url: branchList,
					field: 'branchName',
					callBack : _this.showAllowedBranches

				};
				$("#sourceBranchEle").autocompleteCustom(branchAutoComplete).html();
				Selectizewrapper.setAutocomplete({
					jsonResultList: branchList,
					valueField: 'branchId',
					labelField: 'branchName',
					searchField: 'branchName',
					elementId: 'destBranchEle',
					create: false,
					maxItems: 10
				});
				var codBranchAutoComplete1 = new Object();
				codBranchAutoComplete1.primary_key = 'branchId';
				codBranchAutoComplete1.field = 'branchName';
				codBranchAutoComplete1.url = response.branchList;
				$("#codBranchElepopup").autocompleteCustom(codBranchAutoComplete1);
				const $destinationBranchSelect = $('#destinationBranch');
				$destinationBranchSelect.empty().append('<option value="">Select destination branch</option>');
				branchList.forEach(function(branch) {
					const $option = $('<option value="' + branch.branchId + '">' + branch.branchName +	'</option>');
					$destinationBranchSelect.append($option);
				});
				$("#addRowBtn").on("click", function() {
					$('#bottom-border-boxshadow').addClass('hide');
					if (_this.validateFeilds())
						_this.saveData();
				});
				$("#viewAllBtn").on("click", function() {
					_this.getAllData();
				});
				$('#saveRates').click(function() { 
					_this.saveDispatchConfig()
				});
			});
		},
		validateFeilds: function() {
			if ($("#sourceBranchEle").val() == 0) {
				showAlertMessage('error', 'Select Source Branch!');
				return false;
			}
			if ($("#destBranchEle").val() == 0) {
				showAlertMessage('error', 'Select Destination Branch!');
				return false;
			}
			return true;
		},
		saveData: function() {
			showLayer();
			let jsonObject = new Object();
			let selectize = $('#destBranchEle')[0].selectize;
			let selectedValues = selectize.getValue();
			jsonObject.allowedBranches = selectedValues;
			jsonObject.sourceBranchId = $('#sourceBranchEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/saveBranchWiseDispatchConfigDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		},
		setResponse: function(response) {
			hideLayer();
			if (response.message)
				$('#middle-border-boxshadow').addClass('hide');
				
				window.location.reload()
		},showAllowedBranches: function() {
			 let jsonObject = new Object();
			jsonObject.branchConfigIds = $('#sourceBranchEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/getBranchWiseDispatchConfigDetailsByIds.do?', _this.showAllowedBranchDetails, EXECUTE_WITH_ERROR);

		},showAllowedBranchDetails: function(response) {
			  if (response.message)
			 $('#bottom-border-boxshadow').addClass('hide');
					  
			if( response.expandedList != undefined)	 {		   
			 var allowList = response.expandedList
			const $detailBranchListForSingle = $('#detailBranchListForSingle');
			let tableHTML = `
				<table class="table table-custom width100per"  >
					<thead>
						<tr>
							<th width="25%"	 class="bold" > Branch</th>
							<th width="25%" class="bold" >Allowed Branch</th>
						</tr>
					</thead>
					<tbody>
			`;
			allowList.forEach(function(dest) {
				tableHTML += `
					<tr id="branchConfigId_${dest.allowedBranches}">
						<td>${dest.sourceBranch}</td>
						<td>${dest.destBranch}</td>
					</tr>
				`;
			});
			
			tableHTML += `
					</tbody>
				</table>
			`;
			$detailBranchListForSingle.html(tableHTML);
			$('#bottom-border-boxshadow').removeClass('hide');
			}
		},responseAfterScucess: function(response) {
			hideLayer();
			var rowCount = $('#detailBranchListTable tbody tr').length;
			if (rowCount == 0) {
				window.location.reload()
			}
		},getAllData: function() {
			 $('#bottom-border-boxshadow').addClass('hide');
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/getBranchWiseDispatchConfigDetails.do?', _this.setBranchdata, EXECUTE_WITHOUT_ERROR);
		},setBranchdata: function(response) {
			$('#middle-border-boxshadow').removeClass('hide');
			hideLayer();
			let branchDetailList = response.branchDetailList;
			let mainBranchList = $('#mainBranchList')
			mainBranchList.html('')
			branchDetailList.forEach((el) => {
				const $branchItem = $('<div class="branch-item"	 >' + '<i class="bi bi-building"></i>' +  '<span>' + el.sourceBranch + '</span>' +	'</div>');
				$branchItem.on('click', function() {
					$('.branch-item').removeClass('active');
					$('#deleteAll').removeClass('disabled')
					$('#addDestinationBtn').removeClass('disabled')
					$(this).addClass('active');
					$('#selectedBranchInfo').show();
					$('#selectedBranchName').text(el.sourceBranch);
					$('#selectedBranchName').attr('data-branchid', el.branchId);
					let jsonObject = {
						branchConfigIds: el.branchId
					};
					getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/getBranchWiseDispatchConfigDetailsByIds.do?', _this.showBranchDetails, EXECUTE_WITHOUT_ERROR);
				});
				mainBranchList.append($branchItem);
			});
		}, saveDispatchConfig : function() {
			  showLayer();
			let jsonObject = new Object();
			jsonObject.allowedBranches	= $('#destinationBranch').val();
			jsonObject.sourceBranchId	= $("#selectedBranchName").attr("data-branchid");
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/addBranchWiseDispatchConfigDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		},showBranchDetails: function(response) {
			dataList = response.expandedList
			let sourceBranchId = dataList[0].branchId;
			const $destinationContent = $('#detailBranchList');
			let tableHTML = `
				<table class="table table-custom width100per" id="detailBranchListTable" >
					<thead>
						<tr>
							<th width="25%" class="bold" >	<input type="checkbox" id="selectAllDestinations">	Select	All </th>
							<th width="25%"	 class="bold" > Branch</th>
							<th width="25%" class="bold" >Allowed Branch</th>
							<th class="bold" >Delete</th>
						</tr>
					</thead>
					<tbody>
			`;
			dataList.forEach(function(dest) {
				tableHTML += `
					<tr id="branchConfigId_${dest.allowedBranches}">
						<td> <input type="checkbox" name="deleteData" value="${dest.allowedBranches}" class="dest-checkbox" data-dest-id="${dest.allowedBranches}"> </td>
						<td>${dest.sourceBranch}</td>
						<td>${dest.destBranch}</td>
						<td>
							<div class="action-buttons">
								<button class="btn btn-sm btn-danger delete-dest-btn" data-dest-id="${dest.allowedBranches}" id="delete_${dest.allowedBranches}">
									<i class="bi bi-trash"></i>
								</button>
							</div>
						</td>
					</tr>
				`;
			});
			tableHTML += `
					</tbody>
				</table>
			`;
			$destinationContent.html(tableHTML);
			$('#selectAllDestinations').on('change', function() {
				$('.dest-checkbox').prop('checked', $(this).prop('checked'));
			});
		   
			$('.delete-dest-btn').on('click', function() {
				const deleteBranchId = parseInt($(this).data('dest-id'));
				_this.deleteDestination(deleteBranchId,sourceBranchId);
			});
		   
			$("#deleteAll").on("click", function() {
				let checkBoxArray = getAllCheckBoxSelectValue('deleteData');
				if (checkBoxArray.length == 0) {
					showAlertMessage('error', 'Please Select At least one Checkbox!');
					return false;
				}
				if (confirm('Are you sure you want to delete ' + checkBoxArray.length + ' destination ?')) {
					$.each($("input[name=deleteData]:checked"), function() {
						$(`#branchConfigId_${$(this).val()}`).remove();
					});
					let jsonObject = {
						branchConfigIds: checkBoxArray.join(','),
						sourceBranchId: sourceBranchId
					};
					getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/deleteBranchWiseDispatchConfigData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
				}
			});
			$('#addDestinationBtn').on('click', function() {
				$('#destinationBranch').val('')
				$('#addDestinationModal').modal('show');
			});
			$('#saveDestinationBtn').on('click', function() {
				const destinationBranchId = parseInt($('#destinationBranch').val());
				if (!destinationBranchId) {
					showAlertMessage('error', 'Please select a destination branch');
					return;
				}
				_this.saveDispatchConfig()
				const modal = bootstrap.Modal.getInstance(document.getElementById('addDestinationModal'));
				modal.hide();
			});
		}, deleteDestination : function (deleteBranchId,sourceBranchId) {
			if (!confirm('Are you sure you want to delete this destination?'))
				return;
						
			let jsonObject = {
				branchConfigIds: deleteBranchId,
				sourceBranchId: sourceBranchId
			};
		
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchConfigMasterWS/deleteBranchWiseDispatchConfigData.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
			$(`#branchConfigId_${deleteBranchId}`).remove();
		}
	});
});

function selectAllCheckBox(param) {
	let tab = document.getElementById('detailBranchList');
	for (let row = 1; row < tab.rows.length; row++) {
		if (tab.rows[row].cells[0].firstChild) {
			tab.rows[row].cells[0].firstChild.checked = param;
		}
	}
}
