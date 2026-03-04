var isStuffDone = false;
var selectedRequests = [];
var selectedRequestIds = [];
define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'focusnavigation'
], function (Selection) {
	'use strict';
	var _this, jsonObject = {}, pickupRequestId = 0, NOT_ASSIGNED = 1, ASSIGNED = 2;
	
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/pickupRequestWS/getPendingPickupRequestElement.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},  getElementConfigDetails: function(response) {
			var loadElementPromises = [];
			var baseHtmlPromise = new $.Deferred();
	
			loadElementPromises.push(baseHtmlPromise);
	
			$("#mainContent").load("/ivcargo/html/module/pickupRequest/pickupRequest.html", function() {
				baseHtmlPromise.resolve();
			});
	
			$.when.apply($, loadElementPromises).done(function() {
				initialiseFocus();
	
				Object.keys(response).forEach(function(key) {
					if (response[key]) {
						$("[data-attribute=" + key + "]").removeClass("hide");
					}
				});
	
				var elementConfiguration = {
					regionElement		: $('#regionEle'),
					subregionElement	: $('#subRegionEle'),
					branchElement		: $('#branchEle'),
					vehicleElement		: $('#vehicleNumberEle'),
					executiveElement	: $('#executiveNameEle')
				};
	
				Object.assign(response, {
					elementConfiguration		: elementConfiguration,
					sourceAreaSelection		: true,
					isPhysicalBranchesShow	: true,
					AllOptionsForRegion		: true,
					AllOptionsForSubRegion	: true,
					AllOptionsForBranch		: true,
					vehicleSelection		: true,
					executiveListSelection	: true
				});
	
				Selection.setSelectionToGetData(response);
	
				let autoVehicleNumber = new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				$("#vehicleNumberEle1").autocompleteCustom(autoVehicleNumber);
	
				$('#assignmentEle').change(function() {
					if ($('#assignmentEle_primary_key').val() == ASSIGNED)
						$('.assignedVehicleNumber').show();
					else {
						$('.assignedVehicleNumber').hide();
						$('#vehicleNumberEle').val('');
					}
				});
	
				let validator	= Selection.setNodElementForValidation(response);
	
				_this.setAssignmentSelection();
				
				$("#searchBtn").click(function() {
					validator.performCheck();
					
					if (validator.areAll('valid'))
						_this.findPendingRequest();
				});
				
				$('#savebtn').click(function() {
					_this.savePickupRequest();
				});
				
				$('#assignVehicleDetails').click(function() {
					_this.assignVehicleDetails();
				});
			});
		}, findPendingRequest: function() {
			showLayer();
	
			var jsonObject = Selection.getElementData();
	
			jsonObject["assignmentId"] 	 		= $('#assignmentEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/pickupRequestWS/getAllPendingRequestedUserDetails.do', _this.setPickupRequestDetails, EXECUTE_WITH_ERROR);
		},  setPickupRequestDetails: function(response) {
			$('#pendingPickupRequestTable tbody').empty();
			removeTableRows('pendingPickupRequestTable', 'table');
			showPartOfPage('bottom-border-boxshadow');
	
			if (response.message) {
				$('#bottom-border-boxshadow').addClass('hide');
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				hideLayer();
				return false;
			}
			
			hideLayer();
	
			var pendingDetailsList = response.pendingApprovallist;
	
			$('#bottom-border-boxshadow').removeClass('hide');
	
			var columnHeadArray = [
				"<th style='width: 6%; text-align: center; vertical-align: middle;'>Select <br> <input name='lrDetailsSelectAll' id='lrDetailsSelectAll' type='checkbox' value='lrDetailsTable' onclick='selectAllCheckBox(this.checked,this.value);'></th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Lr No</th>",
				"<th style='width: 6%; text-align: center; vertical-align: middle;'>Consignor</th>",
				"<th style='width: 6%; text-align: center; vertical-align: middle;'>Consignee</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Source Branch</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Destination Branch</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Consignor Address</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Quantity</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Actual Weight</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Date</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>Vehicle No.</th>",
				"<th style='width: 8%; text-align: center; vertical-align: middle;'>User Name</th>",
				"<th style='width: 15%; text-align: center; vertical-align: middle;'> Save / View</th>"
			];
	
			if (!$("#pendingPickupRequestTable").children().find('#lrcloumn').length) {
				$('#pendingPickupRequestTable thead').append('<tr id="lrcloumn">' + columnHeadArray.join(' ') + '</tr>');
			}
	
			pendingDetailsList.forEach(function(details) {
				pickupRequestId = details.pickupRequestId;
				var buttonName = details.status === 1 ? "Assign" : "Update";
				let vehicleNumer = details.vehicleNumber == null ? "--" : details.vehicleNumber;
				let userName = details.assignExecutiveName == null ? "--" : details.assignExecutiveName;
				 
				if (!$("#voucherDetailsId_" + details.pickupRequestId).length) {
					var columnArray = [
						"<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='voucherToApprove' id='" + details.pickupRequestId + "' value='" + details.pickupRequestId + "' /></td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.wayBillNumber + "</td>",
						"<td style='text-align: center; vertical-align: middle;display:none;'><input id = 'wayBillId_" + details.pickupRequestId + "' value = '" + details.wayBillId + "'></td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.consignorName + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.consigneeName + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.sourceBranch + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.destinationBranch + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.consignorAddress + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.quantity + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.actualWeight + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + details.creationDate + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + vehicleNumer + "</td>",
						"<td style='text-align: center; vertical-align: middle;'>" + userName + "</td>",
						"<td style='text-align: center; vertical-align: middle;'><button type='button' id='approve_" + details.pickupRequestId + "' class='btn btn-success ' style='padding: 7px 12px; font-size: 15px;'>",buttonName,"</button> "
							+ "<button type='button' id='view_" + details.pickupRequestId + "' class='btn btn-info 'style='padding: 7px 12px; font-size: 15px;'>View</button> " + "<button type='button' id='reject_" + details.pickupRequestId + "' class='btn btn-danger'  style='padding: 7px 12px; font-size: 15px;'>Cancel</button></td>"
					];
	
					$('#pendingPickupRequestTable tbody').append("<tr id='voucherDetailsId_" + details.pickupRequestId + "'>" + columnArray.join(' ') + "</tr>");
					
					if(details.status == ASSIGNED) {
						$("#view_" + details.pickupRequestId).hide();
						$("#"+details.pickupRequestId).hide();
						$("#approve_" + details.pickupRequestId).bind("click", function() {
							_this.editPickupDetails(details.wayBillId);
						});
					} else {
						$("#approve_" + details.pickupRequestId).bind("click", function() {
							var elementId = $(this).attr('id');
								
							$('#executiveNameEle').val('');
							$('#vehicleNumberEle1').val('');
							$('#hiddenVar').val(elementId.split('_')[1]);
							$('#exampleModal').modal('show');
						});
					}
					
					$("#reject_" + details.pickupRequestId).bind("click", function() {
						var elementId = $(this).attr('id');
						let pickupRequestId	= elementId.split('_')[1];
						
						_this.cancelRequest($('#wayBillId_' + pickupRequestId).val(), pickupRequestId);
					});
					
					$("#view_" + details.pickupRequestId).bind("click", function() {
						var elementId = $(this).attr('id');
			
						_this.viewRequest(elementId.split('_')[1]);
					});
				}
			});
	
			pendingDetailsList = [];
			hideLayer();
		}, editPickupDetails : function(wayBillId) {
				 window.open ('pickupDetails.do?pageId=340&eventId=2&modulename=updatePickupDetails&wayBillId=' + wayBillId,'newwindow', 'left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');			
		}, assignVehicleDetails : function() {
			let truckNo 		= $('#vehicleNumberEle1').val();
			let userName		= $('#executiveNameEle').val();
			let vehicleNumberId = $('#vehicleNumberEle1_primary_key').val();
			let executiveId		= $('#executiveNameEle_primary_key').val();
			let pickupRequestId = $('#hiddenVar').val();
			
			if(vehicleNumberId == null || vehicleNumberId == undefined || vehicleNumberId == 0) {
				showAlertMessage('error', 'Please Select Proper Vehicle !');
				return;
			}
						
			if(executiveId == null || executiveId == undefined || executiveId == 0) {
				showAlertMessage('error', 'Please Select Proper Executive !');
				return;
			}
	
			if (!selectedRequestIds.includes(pickupRequestId)) {
				selectedRequests.push({
					pickupRequestId: pickupRequestId,
					truckNo: truckNo,
					userName: userName,
					vehicleNumberId: vehicleNumberId,
					executiveId: executiveId,
					status: 2
				});
			} else {
				for (let key in selectedRequests) {
					if (selectedRequests[key].pickupRequestId == pickupRequestId) {
						selectedRequests[key].truckNo = truckNo;
						selectedRequests[key].userName = userName;
						selectedRequests[key].vehicleNumberId = vehicleNumberId;
						selectedRequests[key].executiveId = executiveId;
					}
				}
			}
	
			selectedRequestIds.push(pickupRequestId);
			$('#voucherDetailsId_' + pickupRequestId).addClass('colorPink');
			$('#exampleModal').modal('hide');
		}, savePickupRequest : function() {
			let checkedIds	= getAllCheckBoxSelectValue('voucherToApprove');
			
			if (checkedIds.length === 0) {
				showAlertMessage('error', 'Please Select At Least One CheckBox');
				return false;
			}
	
			var finalPickupData = selectedRequests.filter(item => checkedIds.includes(item.pickupRequestId));;
					
			if (finalPickupData.length > 0) {
				let jsonObject = {};
				var confirm = window.confirm('Are You Sure To Save ');
						
				jsonObject.pickupDetails = JSON.stringify(finalPickupData);
	
				if (confirm)
					getJSON(jsonObject, WEB_SERVICE_URL + '/pickupRequestWS/insertAndUpdatePickupDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
			} else {
				showAlertMessage('error', 'Please Select Vehicle And User');
			}
		}, viewRequest : function(requestId) {
			$('#viewExecutiveNameEle').val('');
			$('#viewVehicleNumberEle').val('');
			$('#hiddenVarView').val(requestId);
		
			selectedRequests.forEach(function(request) {
				if (request.pickupRequestId == requestId) {
					$('#viewExecutiveNameEle').val(request.userName);
					$('#viewVehicleNumberEle').val(request.truckNo);
				}
			});
		
			$('#viewModal').modal('show');
		}, cancelRequest : function(waybillId, requestId) {
			let remark = prompt("Please Enter Cancellation Remark");
		
			if (remark != null && remark !='') {
				let jsonObject = new Object();
		
				jsonObject.waybillId = waybillId;
				jsonObject.cancelRemark = remark;
				jsonObject.pickupRequestId = requestId;
				
				pickupRequestId	= requestId;
			
				showLayer();
	
				getJSON(jsonObject, WEB_SERVICE_URL + '/lrCancellationWS/cancelWayBill.do?', _this.setCancelResponse, EXECUTE_WITHOUT_ERROR);
			}
		}, setResponse: function(response) {
			hideLayer();
	
			if (response.message) {
				var errorMessage = response.message;
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
	
				if (errorMessage.type === MESSAGE_TYPE_SUCCESS)
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
			}
		}, setCancelResponse: function(response) {
			hideLayer();
	
			if (response.message) {
				var errorMessage = response.message;
	
				if (errorMessage.type === MESSAGE_TYPE_SUCCESS) {
					let jsonObject = new Object();
					jsonObject.pickupRequestId = pickupRequestId;
				
				 	getJSON(jsonObject, WEB_SERVICE_URL + '/pickupRequestWS/updateCancellationStatusInPickupRequest.do?',_this.setResponse, EXECUTE_WITHOUT_ERROR);
	
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				}
			}
		}, setAssignmentSelection : function() {
			_this.setAssignmentSelectionAutocomplete();
				
			let autoSelection = $("#assignmentEle").getInstance();
				
			let SelectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "Not Assigned" },
				{ "selectTypeId":2, "selectTypeName": "Assigned" },
				{ "selectTypeId":3, "selectTypeName": "All"}
			]
			
			$( autoSelection ).each(function() {
				this.option.source = SelectTYPE;
			});
		}, setAssignmentSelectionAutocomplete : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';
	
			$("#assignmentEle").autocompleteCustom(autoSelectTypeName)
		}
	});
});

function selectAllCheckBox(isChecked, tableName) {
	var table = document.getElementById('pendingPickupRequestTable');
	var checkedIds = [];

	for (var row = 1; row < table.rows.length; row++) {
		if (table.rows[row].cells[0].firstChild != null && table.rows[row].cells[0].firstChild.type === 'checkbox') {
			table.rows[row].cells[0].firstChild.checked = isChecked;

			if (isChecked && table.rows[row].cells[0].firstChild.checked) {
				checkedIds.push(table.rows[row].cells[0].firstChild.id);
			}
		}
	}

	for (var row = 1; row < table.rows.length; row++) {
		if (table.rows[row].cells[0].firstChild != null) {
			table.rows[row].cells[0].firstChild.checked = isChecked;
		}
	}
}