	let list = null;

define([PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'//import in require.config
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, myNod, _this = '', PICKUP_NUMBER_SELECTION = 1, VEHICLE_NUMBER_SELECTION = 2, BRANCH_SELECTION = 3;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLsReceiveWS/getPickupLsReceiveElement.do?', _this.setElementDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElementDetails: function(response) {
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/pickupLsReceive/pickupLsReceive.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}

				response.isCalenderSelection = response['date'];

				var elementConfiguration = {
					regionElement		: $('#regionEle'),
					subregionElement	: $('#subRegionEle'),
					branchElement		: $('#branchEle'),
					vehicleElement		: $('#vehicleNumberEle')
				};

				Object.assign(response, {
					elementConfiguration	: elementConfiguration,
					sourceAreaSelection		: true,
					isPhysicalBranchesShow	: true,
					AllOptionsForRegion		: true,
					AllOptionsForSubRegion	: true,
					AllOptionsForBranch		: true,
					vehicleSelection		: true
				});

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				var options = [{ optionId: 1, optionName: "Pickup LS Number" }, { optionId: 2, optionName: "Vehicle Number" }, { optionId: 3, optionName: "Branch" }]
				var optionAutoComplete = new Object();
				optionAutoComplete.primary_key = 'optionId';
				optionAutoComplete.field = 'optionName';
				optionAutoComplete.url = options;
				$("#searchByOption").autocompleteCustom(optionAutoComplete);

				hideLayer();
				
				$("#searchBtn").click(function() {
					var optionType = $('#searchByOption_primary_key').val();
					
					myNod.performCheck();
					
					if (optionType == BRANCH_SELECTION) {
						if (myNod.areAll('valid'))
							_this.searchPickupLsReceive();
					} else if(optionType == '')
						showAlertMessage('error', 'Please Select Options !');
					else if(optionType == VEHICLE_NUMBER_SELECTION && $('#vehicleNumberEle_primary_key').val() == '')
						showAlertMessage('error', 'Please Select Vehicle !');
					else if(optionType == PICKUP_NUMBER_SELECTION && $('#doorPickupNumberEle').val() == '')
						showAlertMessage('error', 'Please Enter Doop Pickup Number !');
					else
						_this.searchPickupLsReceive();
				});

				$('.branchDiv').addClass('hide');

				$('#searchByOption').change(function() {
					let value = $('#searchByOption_primary_key').val();
					
					$('#mainTable').empty();
					$('#bottom-border-boxshadow').addClass('hide');
					
					if (value == PICKUP_NUMBER_SELECTION) {
						$('.pickupLsNumDiv').show()
						$('.branchDiv').addClass('hide');
						$('.vehicleNumberDiv').hide()
					} else if (value == VEHICLE_NUMBER_SELECTION) {
						$('.vehicleNumberDiv').show()
						$('.pickupLsNumDiv').hide()
						$('.branchDiv').addClass('hide');
					} else if (value == BRANCH_SELECTION) {
						$('.pickupLsNumDiv').hide();
						$('.vehicleNumberDiv').hide();
						
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
					}
				});
			});
		}, searchPickupLsReceive: function() {
			showLayer();

			let jsonObject = Selection.getElementData();

			jsonObject.doorPickupNumber 	= $('#doorPickupNumberEle').val();
			jsonObject.searchBy 			= $('#searchByOption_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLsReceiveWS/getPickupLsReceiveDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData: function(response) {
			hideLayer();
			$('#mainTable').empty();
			
			if (response.message) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return false;
			}

			 list = response.pickupLsReceiveList;

			if (list.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');

				let headerColumnArray = new Array();
				headerColumnArray.push("<th style='width:50px; text-align: center; font-size:18px;box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white'   ><label class='switch m-auto'> <input type='checkbox' id='checkboxAll' onchange='checkBoxForAll();'  value='checkboxAll' unchecked> <span class='slider round'></span></label> </th>");
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Receive</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Pickup LS Number</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">From</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">To</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Date</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">No Of LRs</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Truck No</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Total PKG</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">Total Weight</th>');

				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + ' </tr>');
				
				let totalNoOfPackages	= 0;
				let totalActualWeight	= 0;

				for (let i = 0; i < list.length; i++) {
					var data = list[i];
					
					totalNoOfPackages += data.totalNoOfPackages;
					totalActualWeight += data.totalActualWeight;

					let dataColumnArray = new Array();
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px; '> <label class='switch m-auto'> <input  id='check_"+i+"' value='"+ data.doorPickupledgerId +"' type='checkbox' unchecked><span class='slider round'></span></label> </td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='dpl_" + data.doorPickupledgerId + "'><button class='btn btn-primary' id='recieve_" + data.doorPickupledgerId + "'>Recieve</button></td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.doorPickupNumber + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.pickupSource + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.pickupDestination + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.creationdateTimeStr + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.totalNoOfWayBills + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.vehicleNumber + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.totalNoOfPackages + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.totalActualWeight + "</td>");

					$("#mainTable").append('<tr>' + dataColumnArray.join(' ') + '</tr>');

					$('#recieve_' + data.doorPickupledgerId).click(function() {
						let elementId				= $(this).attr('id');
						let doorPickupledgerId		= elementId.split('_')[1];
						_this.recieve(data.doorPickupNumber, doorPickupledgerId);
					});
				}
				
				$('#printBtn').click(function() {
					let doorPickupledgerIdArrayList = [];
					let vehicleNumbers = new Set();

					for (let i = 0; i < list.length; i++) {
						let ischeck = $("#check_" + i).prop("checked");
						if (ischeck) {
							doorPickupledgerIdArrayList.push($("#check_" + i).val());
							vehicleNumbers.add(list[i].vehicleNumber);
						}
					}

					if ($('input[type="checkbox"]:checked').length === 0) {
						showAlertMessage('error', 'Please Select At Least One CheckBox');
						return false;
					}

					if (vehicleNumbers.size > 1) {
						showAlertMessage('error', 'Please select  with the same Vehicle No.');
						return false;
					}

					_this.print(doorPickupledgerIdArrayList.join(','));
				});

				let footerColumnArray = new Array();
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"></th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">' + totalNoOfPackages + '</th>');
				footerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white">' + totalActualWeight + '</th>');

				$('#mainTable').append('<tr>' + footerColumnArray.join(' ') + ' </tr>');
			}
		}, recieve: function(doorPickupNumber, doorPickupledgerId) {
			window.open('PickupLsReceive.do?pageId=340&eventId=1&modulename=pickupSingleLsReceive&doorPickupNumber=' + doorPickupNumber + '&doorPickupledgerId=' + doorPickupledgerId);
		}, print: function(doorPickupledgerIds) {
			window.open('prints.do?pageId=340&eventId=10&modulename=prePickupUnloadingPrint&doorPickupledgerIds=' + doorPickupledgerIds);
		}
	});
});

function checkBoxForAll(){
	for(let i = 0; i < list.length; i++) {
		$("#check_"+i).prop("checked", $("#checkboxAll").prop("checked"));
	}
}
