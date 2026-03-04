let doneTheStuff = false;

define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'
	, '/ivcargo/resources/js/module/redirectAfterUpdate.js'
	, '/ivcargo/resources/js/ajax/autocompleteutils.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let btModalConfirm, doorPickupLedgerId, myNod, _this = '', pickupChargesForGrpArrList = null, pickupSettleChargesHM = null;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;

			doorPickupLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);

			let jsonObject = new Object();
			jsonObject.doorPickupLedgerId = doorPickupLedgerId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/getDoorPickupDispatchElement.do', _this.renderUpdateCharges, EXECUTE_WITHOUT_ERROR);
		}, renderUpdateCharges: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/doorpickupls/update/updatePickupLSLorryHireAmount.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				pickupChargesForGrpArrList 	= response.pickupChargesForGrpArrList;
				pickupSettleChargesHM 		= response.pickupSettleChargesHM;

				_this.setCharges();

				$('#lorryHireAmountEle').val(Number(response.doorPickupLedgerLorryHireAmount));

				$("#update").bind("click", function() {
					_this.updateLorryHireAmount();
				});

				hideLayer();
			});
		}, setCharges : function() {
			let columnArray = new Array();
			
			for (let i = 0; i < pickupChargesForGrpArrList.length; i++) {
				let obj = pickupChargesForGrpArrList[i];
				
				let oldChargeAmount	= 0;

				if (pickupSettleChargesHM[obj.pickupChargeTypeMasterId] != undefined)
					oldChargeAmount = pickupSettleChargesHM[obj.pickupChargeTypeMasterId];
					
				columnArray.push("<td style='font-size: 15px;'><b>" + obj.displayName + "</b></td>");
				columnArray.push("<td style='font-size: 15px;'>" + "<input type='text' class='form-control' id='chargeAmt_" + obj.pickupChargeTypeMasterId + "' value='" + oldChargeAmount + "'>" + "</td>");

				$('#editChargeTable tbody').append('<tr id="chargeNames' + i + '">' + columnArray.join(' ') + '</tr>');
				columnArray = [];
				
				$("#chargeAmt_" + obj.pickupChargeTypeMasterId).bind("keyup", function() {
					_this.calculateTotalLorryHire();
				});
			}
			
			columnArray.push("<td style='font-size: 15px;'><b>Total Amount</b></td>");
			columnArray.push("<td style='font-size: 15px;'><input name='lorryHireAmountEle' placeholder='Total Amount' id='lorryHireAmountEle' class='form-control' data-tooltip='Total Amount' readonly/></td>");

			$('#editChargeTable tbody').append('<tr id="chargeNames">' + columnArray.join(' ') + '</tr>');
		}, getPickupSettlementChargesArrList : function() {
			let newPickupSettChrgsArrList = new Array();

			for (const element of pickupChargesForGrpArrList) {
				let picChargeObject = new Object;

				picChargeObject.chargeAmount 			= Number($('#chargeAmt_' + element.pickupChargeTypeMasterId).val());
				picChargeObject.pickupChargeMasterId 	= element.pickupChargeTypeMasterId;

				if (pickupSettleChargesHM[element.pickupChargeTypeMasterId] != null)
					picChargeObject.oldChargeAmount = pickupSettleChargesHM[element.pickupChargeTypeMasterId];

				newPickupSettChrgsArrList.push(picChargeObject);
			}
			
			return newPickupSettChrgsArrList;
		}, calculateTotalLorryHire : function() {
			let total = 0;
			
			for (const element of pickupChargesForGrpArrList) {
				if($('#chargeAmt_' + element.pickupChargeTypeMasterId).val() > 0)
					total 			+= Number($('#chargeAmt_' + element.pickupChargeTypeMasterId).val());
			}
			
			$('#lorryHireAmountEle').val(Number(total));
		}, updateLorryHireAmount: function() {
			let newPickupSettChrgsArrList	= _this.getPickupSettlementChargesArrList();
			
			let total = 0;

			for (const element of newPickupSettChrgsArrList) {
				total += element.chargeAmount;
			}
	
			$('#lorryHireAmountEle').val(Number(total));

			// Now 'total' contains the sum of all charge amounts in the newPickupSettChrgsArrList array

			let jsonObject = new Object();

			jsonObject.doorPickupLedgerId = doorPickupLedgerId;
			jsonObject.doorPickupLedgerLorryHireAmount = Number($('#lorryHireAmountEle').val());
			jsonObject["newPickupSettChargsArrList"] = JSON.stringify(newPickupSettChrgsArrList);

			if (!doneTheStuff) {
				doneTheStuff = true;
				$('#update').hide();

				btModalConfirm = new Backbone.BootstrapModal({
					content: "Do You Want To Update PickUp Lorry Hire?",
					modalWidth: 30,
					title: 'PickUp Lorry Hire',
					okText: 'YES',
					showFooter: true,
					okCloses: false
				}).open();

				btModalConfirm.on('ok', function() {
					showLayer();
					$('#update').hide();
					getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/updateDoorPickupLedgerChargeAmount.do', _this.setSuccess, EXECUTE_WITH_ERROR);
				});

				btModalConfirm.on('cancel', function() {
					doneTheStuff = false;
					$('#update').show();
				});
			}
		}, setSuccess: function(response) {
			if(response.redirectTo > 0) {
				showMessage("success", "Charges updated successfully !");
				
				setTimeout(function(){
					redirectToAfterUpdate(response);
				},1000);
			}
			   
			hideLayer();
		}
	});
});