define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility'
], function(UrlParameter) {
	'use strict';

	let jsonObject = new Object(),
		_this = '',
		mathadiCalculationId;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			mathadiCalculationId = UrlParameter.getModuleNameFromParam(MASTERID);
		}, render: function() {
			jsonObject.mathadiCalculationId = mathadiCalculationId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiPrintWS/getMathadiCalculationPrint.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getResponseForPrint: function(responseOut) {
			hideLayer();

			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/print/mathadiCalculationPrint/mathadiCalculationPrint.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				$('#excelDownLoad').bPopup({
				}, function() {
					var _thisMod = this;

					$(this).html("<div id='popUpDiv' class='confirm' style='height:88px;width:200px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
						+ "<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
						//+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
						+ "<input type='button' id='excelButton' value ='Excel' style='height:50px;width:120px;font-size:20px;position:relative;'></input>&nbsp;"
						+ "<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:120px;font-size:20px;position:relative;'></input></div>"
					)

					$("#cancelButton").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					})

					$("#excelButton").click(function(e) {
						_thisMod.close();
						var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
						window.open(path);

						e.preventDefault();
					});
				});

				const mathadiCalculationDataList = responseOut.mathadiCalculationDataList;

				const printHeaderModel = responseOut.PrintHeaderModel;

				$("*[data-account='name']").html(printHeaderModel.accountGroupName);
				$("*[data-account='address']").html(printHeaderModel.branchAddress);
				$("*[data-account='phoneNo']").html(printHeaderModel.branchContactDetailMobileNumber);
				$("*[data-ls='number']").html(mathadiCalculationDataList[0].mathadiNumber);
				$("*[data-ls='date']").html(mathadiCalculationDataList[0].lhpvCreationDateTimeStr);

				let columnArray = new Array();
				let actualLoading = 0;
				let actualThappi = 0;
				let leavy = 0;
				let total = 0;
				let loadAndThappiAMtTotal = 0;
				let warfareleavyAmtTotal = 0;
				let totalAMt = 0;
				let warfareTotal = 0;

				let firstWarfareAmount = Number(mathadiCalculationDataList[0].warfareAmount);
				let warfareLeavyAmt = Number(mathadiCalculationDataList[0].warfareLeavyAmt);

				for (let i = 0; i < mathadiCalculationDataList.length; i++) {
					let obj = mathadiCalculationDataList[i];
					let serialNumber = i + 1;

					actualLoading 			= Number(actualLoading) + Number(obj.actualLoading);
					actualThappi 			= Number(actualThappi) + Number(obj.actualThappi);
					leavy					= Number(leavy) + Number(obj.leavyAmt);
					loadAndThappiAMtTotal	+= Number(obj.loadingAmt + obj.thappiAmt);
					warfareTotal			= Number(obj.warfareAmount);
					warfareleavyAmtTotal	= Number(obj.warfareLeavyAmt);

					if (i === 0)
						totalAMt = Number(toFixedWhenDecimal(obj.totalAmt + firstWarfareAmount + warfareLeavyAmt));
					else
						totalAMt = Number(toFixedWhenDecimal(obj.totalAmt));// Only add the first warfareAmount once, not in subsequent rows

					total += Number(totalAMt);

					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + serialNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.lhpvNumber || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.lhpvCreationDateTimeStr || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.vehicleNumber || '--') + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.capacity || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.kata || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.unLadenWeight || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.collection || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.loading || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.actualLoading || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.loadingAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.loadingLeavyAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.actualThappi || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.thappiAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.warfareAmount || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.thappiLeavyAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.leavyAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.warfareLeavyAmt || 0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (totalAMt || 0) + "</td>");

					$('#transferledgerbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}

				actualLoading = toFixedWhenDecimal(actualLoading);
				actualThappi = toFixedWhenDecimal(actualThappi);
				leavy = toFixedWhenDecimal(leavy);
				total = toFixedWhenDecimal(total);
				warfareTotal = toFixedWhenDecimal(warfareTotal);
				warfareleavyAmtTotal = toFixedWhenDecimal(warfareleavyAmtTotal);

				let totalRow = "<tr>" +
					"<td style='text-align: right; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>Total</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + actualLoading + "</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + actualThappi + "</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + warfareTotal + "</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;' >" + leavy + "</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;' >" + warfareleavyAmtTotal + "</td>" +
					"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + total + "</td>" +
					"</tr>";

				$('#transferledgerbody').append(totalRow);
			});
		}
	});
});