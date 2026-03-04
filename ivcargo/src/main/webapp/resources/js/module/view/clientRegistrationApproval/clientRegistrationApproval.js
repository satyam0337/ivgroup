var doneTheStuff = false;
define([
PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
,'JsonUtility'
, 'messageUtility'
, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
, 'focusnavigation'//import in require.config
], function(Selection) {
'use strict';
var jsonObject = new Object(), myNod, _this = '', totalVoucherCount = 0;
	return Marionette.LayoutView.extend({
	initialize: function() {
	_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/clientRegistrationApprovalWS/getPendingClientRegistrationElement.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			executive = response.executive;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/clientRegistrationApproval/clientRegistrationApproval.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let elementConfiguration				= new Object();

				elementConfiguration.regionElement 		= $('#regionEle');
				elementConfiguration.subregionElement 	= $('#subRegionEle');
				elementConfiguration.branchElement 		= $('#branchEle');

				response.elementConfiguration 	= elementConfiguration;
				response.sourceAreaSelection 	= true;
				response.isPhysicalBranchesShow = true;
				response.AllOptionsForRegion 	= true;
				response.AllOptionsForSubRegion = true;
				response.AllOptionsForBranch 	= true;

				Selection.setSelectionToGetData(response);
					if(response.isGroupAdmin) {
							$("*[data-attribute=region]").removeClass("hide");
							$("*[data-attribute=subRegion]").removeClass("hide");
							$("*[data-attribute=branch]").removeClass("hide");
						} else if(response.isRegionAdmin) {
							$("*[data-attribute=region]").addClass("hide");
							$("*[data-attribute=subRegion]").removeClass("hide");
							$("*[data-attribute=branch]").removeClass("hide");
						} else if(response.isSubRegionAdmin) {
							$("*[data-attribute=region]").addClass("hide");
							$("*[data-attribute=subRegion]").addClass("hide");
							$("*[data-attribute=branch]").removeClass("hide");
						}
				hideLayer();

				myNod = Selection.setNodElementForValidation(response);

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if (myNod.areAll('valid')) {
						_this.findPendingClientVoucherForApproval();
					}
				});
			});
		}, findPendingClientVoucherForApproval: function() {
			showLayer();

			var jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL + '/clientRegistrationApprovalWS/getAllPendingRequestedUserDetails.do', _this.setUsersDetails, EXECUTE_WITH_ERROR);
		}, setUsersDetails: function(response) {
			$('#pendingClientApprovalTable tbody').empty();
			removeTableRows('pendingClientApprovalTable', 'table');
			hideLayer();

			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			var pendingDetailsList = response.pendingApprovallist;
			$('#bottom-border-boxshadow').removeClass('hide');
			
			var columnHeadArray = new Array();

			columnHeadArray.push("<th style='width: 6%; text-align: center; vertical-align: middle;'>Select <br> <input name='selectAll' id='selectAll' type='checkbox' onclick='selectAllCheckBox(this.checked);'></th>");
			columnHeadArray.push("<th style='width: 6%; text-align: center; vertical-align: middle;'>Name</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center; vertical-align: middle;'>Mobile No</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center; vertical-align: middle;'>Email ID</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center; vertical-align: middle;'>GST No</th>");
			columnHeadArray.push("<th style='width: 15%; text-align: center; vertical-align: middle;'> Approve / Reject</th>");
			
			$('#pendingClientApprovalTable thead').append('<tr id="lrcloumn">' + columnHeadArray.join(' ') + '</tr>');

			for (var index = 0; index < pendingDetailsList.length; index++) {
				if (!$("#userDetailsId_" + pendingDetailsList[index].userId).exists()) {
					var columnArray = new Array();
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='clientToApprove' id='clientToApprove' value='" + pendingDetailsList[index].userId + "' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + pendingDetailsList[index].name + "</td>");
					columnArray.push("<td style='text-align: left;   vertical-align: middle;'>" + pendingDetailsList[index].mobileNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + pendingDetailsList[index].emaiId + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + pendingDetailsList[index].gstNumber + "</td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;' ><button type='button' id='approve_" + pendingDetailsList[index].userId + "' class='btn btn-success'>Approve</button> "
						+ " <button type='button' id='reject_" + pendingDetailsList[index].userId + "' class='btn btn-danger'>Reject</button></td>");

					$('#pendingClientApprovalTable tbody').append("<tr id='userDetailsId_" + pendingDetailsList[index].userId + "' >" + columnArray.join(' ') + "</tr>");

					$("#approve_" + pendingDetailsList[index].userId).bind("click", function() {
						var elementId = $(this).attr('id');
						var userId = elementId.split('_')[1];

						if (confirm("Are you sure want Appove Client ?")) {
							var jsonObject = new Object();

							jsonObject["userDetailsIds"] 	= userId;
							jsonObject["status"] 			= 2;
							getJSON(jsonObject, WEB_SERVICE_URL + '/clientRegistrationApprovalWS/insertApprovedClient.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
							$('#userDetailsId_' + userId).remove();
						}
					});
					
					$("#reject_" + pendingDetailsList[index].userId).bind("click", function() {
						var elementId = $(this).attr('id');

						var userId = elementId.split('_')[1];

						if (confirm("Are you sure want Reject Client ?")) {
							jsonObject["userId"] = userId;
							jsonObject["status"] = 3;

							getJSON(jsonObject, WEB_SERVICE_URL + '/clientRegistrationApprovalWS/insertApprovedClient.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
							$('#userDetailsId_' + userId).remove();
						}
					});
				}
			}
	
			$("#approveAll").bind("click", function() {
				var checkBoxArray = getAllCheckBoxSelectValue('clientToApprove');

				if (checkBoxArray.length == 0) {
					showAlertMessage('error', iconForErrMsg + 'Please Select At least one Checkbox !');
					return false;
				} else {
					var confirm = window.confirm("Are you sure want Appove Client ?");
					
					if (confirm) {
						$.each($("input[name=clientToApprove]:checked"), function() {
							$('#userDetailsId_' + $(this).val()).remove();
						});
						
						jsonObject["userDetailsIds"] = checkBoxArray.join(',');
						jsonObject["status"] = 2;
						getJSON(jsonObject, WEB_SERVICE_URL + '/clientRegistrationApprovalWS/insertApprovedClient.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
					}
				}
			});
		}, responseAfterScucess: function(response) {
			if (response.message != undefined) {
				var tableLength = $('#pendingClientApprovalTable tbody tr').length;
				
				if (tableLength == 0)
					$('#bottom-border-boxshadow').hide();
				
				hideLayer();
				return;
			}
		}
	});
});

function selectAllCheckBox(param) {

	var tab = document.getElementById('pendingClientApprovalTable');
	
	for (var row = 1; row < tab.rows.length; row++) {
		if (tab.rows[row].cells[0].firstChild != null) {
			tab.rows[row].cells[0].firstChild.checked = param;
		}
	}
}
