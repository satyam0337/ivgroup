define([
		PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 'jqueryConfirm',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation'
		],//PopulateAutocomplete
		 function(Selection, UrlParameter) {
			'use strict';
		let jsonObject = new Object(), _this, doorPickupLedgerId = 0,pickupLsEditList, doorPickupDetailsIds = [],pickupLsNumber,myNod;
	
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/module/editPickupLSWS/loadEditPickupLsElement.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/editPickupLs/editPickupLs.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				let codBranchAutoComplete1 = new Object();
				codBranchAutoComplete1.primary_key 	= 'branchId';
				codBranchAutoComplete1.field 		= 'branchName';
				codBranchAutoComplete1.url			= response.branchList;
				$("#branchEle").autocompleteCustom(codBranchAutoComplete1);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select Branch !'
				});
				
				addElementToCheckEmptyInNode(myNod, 'numberEle', 'Enter Number !');

				$('#searchBtn').click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.getData();
				});
				
				$('#addPickupLs').click(function() {
					_this.addLrInPickupLs();
				});
				
				$("#removePickupLs").on("click", function() {
					_this.removeLRFromPickupLs();
				});
				
				$("#cancelPickupLs").on("click", function() {
					_this.cancelPickupLs();
				});
				
			});
		}, getData : function() {
			let jsonObject = new Object();
			jsonObject.number = $('#numberEle').val();
			jsonObject.branchId = $("#branchEle_primary_key").val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/module/editPickupLSWS/getPickupLsdata.do?', _this.setPickupLsDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, createHeader : function(isAppendLr) {
			let headerColumnArray = [];
	
			if(isAppendLr)
				headerColumnArray.push("<th><input style='font-weight:bold;background-colour:light green;' name ='appendLrDetails' type='checkbox' id='appendLrDetailsCheckAll' value='checkboxAll' checked> </th>");
			else
				headerColumnArray.push("<th><input style='font-weight:bold;background-colour:light green;' name ='pickupLs_details' type='checkbox' id='checkboxAll' value='checkboxAll' unchecked> </th>");
			
			headerColumnArray.push('<th>LR No</th>');
			headerColumnArray.push('<th>Date</th>');
			headerColumnArray.push('<th>Consignor</th>');
			headerColumnArray.push('<th>Consignee</th>');
			headerColumnArray.push('<th>Quantity</th>');
			headerColumnArray.push('<th>Weight</th>');

			if(isAppendLr)
				$('#lrDetailsThead').append('<tr class="bg-secondary text-white">' + headerColumnArray.join(' ') +' </tr>');
			else
				$('#mainTable').append('<tr class="bg-info">' + headerColumnArray.join(' ') +' </tr>');
			
			$('#checkboxAll').on('click', function() {
				for(const element of doorPickupDetailsIds) {
					$("#check_" + element).prop("checked", $(this).prop("checked"));
				}
			});
			
			$('#appendLrDetailsCheckAll').on('click', function() {
				let tab 	= document.getElementById('lrDetailsTbody');
				let count 	= parseFloat(tab.rows.length);
				
				for (let row = 0; row < count; row++) {
					if(tab.rows[row].cells[0].firstElementChild)
						tab.rows[row].cells[0].firstElementChild.checked = $("#appendLrDetailsCheckAll").is(":checked");
				}
			});
		}, setPickupLsDetailsData : function(response) {
			$('#left-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#right-border-boxshadow').removeClass('hide');
			
			$('#LRSearchBasicDetailsDiv').html("");
			
			$('#mainTable').empty();
			
			let doorPickupLedgerList	= response.doorPickupLedgerList;
				pickupLsEditList 		= response.doorPickupDetailsList;
				
				doorPickupLedgerId = doorPickupLedgerList[0].doorPickupLedgerId;
			_this.createHeader(false);

				let dataColumnArray		= [];

			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Ls No.</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Source</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Dest</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>No Of Lrs</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Vehicle No</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + dataColumnArray.join(' ') + '</tr>');

			for (const element of doorPickupLedgerList) {

				dataColumnArray = [];
				
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px'>" + element.doorPickupNumber + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.pickUpSource + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.pickUpDestination + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.creationDateTimeString + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.doorPickupLedgerTotalNoOfWayBills + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.doorPickupLedgerVehicleNumber + "</td>");

				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
			
			for (const element of pickupLsEditList) {
				let obj		= element;

				let doorPickupDetailsId	= obj.doorPickupDetailsId;
				let dataColumnArray = [];
					
				doorPickupDetailsIds.push(doorPickupDetailsId);
					
				dataColumnArray.push("<td style='text-align: center;'><input type='checkbox' name = 'pickupLs_details'  class='checkbox' id='check_" + doorPickupDetailsId + "' value='" + doorPickupDetailsId + "' unchecked></td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.wayBillNumber + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.creationdateTimeStr + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.consignorName + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.consigneeName + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.quantity + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.actualWeight + "</td>");

				$("#mainTable tbody").append('<tr "' + doorPickupDetailsId + '">' + dataColumnArray.join(' ') + '</tr>');
					
			}
		}, addLrInPickupLs : function() {
			$('#middle-border-boxshadow').removeClass('hide');
			$('#lrNumberEle').focus();
			goToPosition('middle-border-boxshadow', 'slow');
			
			$("#lrNumberEle").bind("keydown", function(event) {
				_this.getLrDetailsToAppend(event);
			});
			
			$("#findBtnForAppendLr").on("keydown click", function(event) {
				_this.getLrDetailsToAppend(event);
			});
			
			$("#appendBtn").on("click", function() {
				_this.appendLrDetails();
			});
		}, getLrDetailsToAppend : function(e) {
			if (e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER || e.type === 'click') {
				let lrNumberEle = $('#lrNumberEle').val();

				if (lrNumberEle == '') {
					showAlertMessage('info', 'Enter Lr Number !');
					e.preventDefault(); 
					e.stopPropagation();
					return false;
				}
				
				let jsonObject = new Object();

				jsonObject.wayBillNumber = lrNumberEle.replace(/\s+/g, "");
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/module/editPickupLSWS/getWaybillsToAppendInPickupLs.do', _this.addLrToAppendInPickupLs, EXECUTE_WITH_ERROR);
			}
		}, addLrToAppendInPickupLs : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#lrNumberEle').val('');
				return;
			}
			
			let lrList		= response.addLrData;
			let lrNumberEle	= $('#lrNumberEle').val();
			
			if($('#wayBillNumber_' + lrList[0].wayBillId).exists()) {
				showAlertMessage('error', `LR Number '${lrNumberEle}' is already added!`);
				return;
			}
			
			$('#lrDetails').removeClass('hide');
			$('#appendLrButtonDiv').removeClass('hide');
			
			if($('#lrDetailsThead tr').length == 0)
				_this.createHeader(true);
			
			_this.setLrDetailsDataForAppend(lrList);
		}, setLrDetailsDataForAppend : function(list) {
			for (const element of list) {
				let obj 		= element;
				let wayBillId		= obj.wayBillId;
				
				let dataColumnArray = [];
					
				dataColumnArray.push("<td style='text-align: center;display:'><input type='checkbox' name = 'lrToAppend'  class='checkbox' id='lrToAppend" + wayBillId + "' value='" + wayBillId + "' checked></td>");
				dataColumnArray.push("<td style='text-align: center' id='wayBillNumber_" + wayBillId + "'>" + obj.wayBillNumber + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='creationDateTimeStr_" + wayBillId + "'>" + obj.creationdateTimeStr + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='consignor_" + wayBillId + "'>" + obj.consignorName + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='consignee_" + wayBillId + "'>" + obj.consigneeName + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='quantity_" + wayBillId + "'>" + obj.pendingQuantity + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='actualWeight_" + wayBillId + "'>" + obj.pendingWeight + "</td>");

				$("#lrDetailsTable tbody").append('<tr "' +wayBillId+ '">' + dataColumnArray.join(' ') + '</tr>');
			}
		}, appendLrDetails : function () {
			let wayBillDetailsArray = new Array();
			let wayBillIdIdArr			= getAllCheckBoxSelectValue('lrToAppend');

			if ($('input[type="checkbox"]:checked').length === 0) {
				showAlertMessage('error', 'Please Select At Least One CheckBox');
				return false;
			}
			
			for(const element of wayBillIdIdArr) {
				let lrData 	= new Object();
				lrData.doorPickupDetailsWayBillId		= element;
				lrData.wayBillNumber					= $('#wayBillNumber_' + element).text();
				lrData.creationdateTimeStr				= $('#creationdateTimeStr_' + element).text();
				lrData.doorPickupDetailsQuantity		= $('#quantity_' + element).text();
				lrData.doorPickupDetailsActualWeight	= $('#actualWeight_' + element).text();
				
				wayBillDetailsArray.push(lrData);
			}
			
			let jsonObject 			= {};
			jsonObject.wayBillDetails 	= JSON.stringify(wayBillDetailsArray);
			jsonObject.doorPickupLedgerId 	= doorPickupLedgerId;
			jsonObject.pickupLsNumber		= pickupLsNumber;
			jsonObject.waybillCount			= wayBillIdIdArr.length;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Do you want to proceed with appending LR details?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/module/editPickupLSWS/appendLrInPickupLs.do', _this.responseAfterAdd, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, removeLRFromPickupLs : function () {
			let pickupLsIdArr			= getAllCheckBoxSelectValue('pickupLs_details');
			
			if(pickupLsIdArr.length == 0) {
				showAlertMessage('error', 'Please, Select atleast 1 LR to Remove !');
				return false;
			}

			if(pickupLsEditList.length == 1) {
				showAlertMessage('error', 'Please, Cancel this Pickup LS if Pickup LS has only 1 LR !');
				return false;
			}

			let jsonObject 			= {};
			jsonObject.pickupLsIds			= pickupLsIdArr.join(',');
			jsonObject.doorPickupLedgerId 	= doorPickupLedgerId;
			jsonObject.pickupLsNumber 		= pickupLsNumber;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Are you sure you want to remove LR?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/module/editPickupLSWS/removeLrFromPickupLs.do', _this.responseAfterAdd, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, cancelPickupLs : function () {
			let jsonObject 			= {};
			
			jsonObject.doorPickupLedgerId	= doorPickupLedgerId;
			jsonObject.pickupLsNumber	= pickupLsNumber;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Are you sure you want to cancel Pickup LS?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/module/editPickupLSWS/pickupLsCancellation.do', _this.responseAfterCancel, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, responseAfterAdd: function() {
			$('#lrDetails').addClass('hide');
			$('#lrDetailsTable').empty();
			
			_this.getData();
		}, responseAfterCancel : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('top-border-boxshadow', 'hide');
				
				$('#mainTable').addClass('hide');
				$('#LRSearchBasicDetailsDiv').addClass('hide');
				$('#ElementDiv').html(response.message.description);
			}
		}
	});
});

$('input[type="checkbox"]').change(function() {
	let anyChecked = $('input[type="checkbox"]:checked').length > 0;
	$('#saveRate').prop('disabled', !anyChecked);
});
