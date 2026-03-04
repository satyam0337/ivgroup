define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility'
], function (UrlParameter) {
	'use strict';

	let jsonObject = new Object(),
		_this = '',
		transferLedgerId;

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
			transferLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);
			_this = this;
		}, render: function () {
			jsonObject.transferLedgerId = transferLedgerId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/transferLedgerLsPrintWS/getTransferLSPrintData.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getResponseForPrint: function(responseOut) {
			hideLayer();

			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/template/tceLsPrint/transferLsPrint.html", function () {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				// initialiseFocus();

				const transferLedgerList 	= responseOut.transferLedgerList;
				const printHeaderModel 		= responseOut.printHeaderModel;
				let transferLedger			= responseOut.transferLedgerList[0];

				$("*[data-account='name']").html(printHeaderModel.accountGroupName);
				$("*[data-account='address']").html(printHeaderModel.branchAddress);
				$("*[data-account='phoneNo']").html(printHeaderModel.branchContactDetailMobileNumber);
				$("*[data-ls='transfeLedgerNumber']").html(transferLedger.transferLedgerNumber);
				$("*[data-ls='date']").html(transferLedger.transferDateTimeStr);
				$("*[data-ls='vehicleNo']").html(transferLedger.vehicleNumber);
				$("*[data-ls='driverName']").html(transferLedger.driverName);
				$("*[data-ls='from']").html(transferLedger.transferByBranchName);
				$("*[data-ls='to']").html(transferLedger.transferForBranchName);
				$("*[data-ls='driverMobileMo']").html(transferLedger.driverMobile);
				$("*[data-ls='bookedToBranch']").html('<span style="font-weight:bold;"  class="text-primary" >' + responseOut.bookedForAccountGroupName + " (" + responseOut.destinationBranchAddress + ", " + responseOut.destinationCityName +", "+"Contact Number : " + responseOut.destinationBranchMobile+ ")");
				$("*[data-ls='remark']").html(transferLedgerList[0].remark);


				let columnArray = new Array();
				let totalQuantity = 0;
				let totalWeight = 0;
				let total = 0;
				for (let i = 0; i < transferLedgerList.length; i++) {
					let obj = transferLedgerList[i];
					let serialNumber = i + 1; 


					let transferWeight = Number(obj.transferWeight) || 0;
					let transferTotal = Number(obj.total) || 0;

					totalQuantity 	+= obj.transferQuantity;
					totalWeight 	+= obj.transferWeight;
					total 			+= obj.total;

					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + serialNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.wayBillNumber || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.sender || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiver || '--') + "</td>");
/*					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiverNo || '--') + "</td>");
*/					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.wayBillType || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.transferQuantity || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (transferWeight > 0 ? transferWeight.toFixed(2) : '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (transferTotal > 0 ? transferTotal.toFixed(2) : '--') + "</td>");

					$('#transferledgerbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}

				let totalRow = "<tr>" +
				"<td colspan='5' style='text-align: right; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>Total</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + totalQuantity.toFixed(2)  + "</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + totalWeight.toFixed(2)  + "</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + total.toFixed(2)  + "</td>" +
			
				"</tr>";

				$('#transferledgerbody').append(totalRow);
				
				setTimeout(function() {
					window.print();
				}, 200);
			});
		}
	});
});
