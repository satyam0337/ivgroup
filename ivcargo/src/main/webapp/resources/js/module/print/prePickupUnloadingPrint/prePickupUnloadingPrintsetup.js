define([], function(){	
	
	return {
		setHeaderDetails : function(PrintHeaderModel){
			setTimeout(() => {
				$("*[data-account='accountGroupName']").html(PrintHeaderModel.accountGroupName);
				$("*[data-account='branchAddress']").html(PrintHeaderModel.branchAddress);
				$("*[data-account='branchContactDetailMobileNumber']").html(PrintHeaderModel.branchContactDetailMobileNumber);

			}, 100);
		}, setPrePickupUnloadingPrintData(response) {
			let columnArray = new Array();
			let totalQuantity = 0;
			let totalWeight = 0;
			let pickupUnloadingDataList = response.pickupUnloadingDataList;

			for (let i = 0; i < pickupUnloadingDataList.length; i++) {
				let obj = pickupUnloadingDataList[i];
				let serialNumber = i + 1;

				totalQuantity += Number(toFixedWhenDecimal(obj.quantity));
				totalWeight += Number(toFixedWhenDecimal(obj.actualWeight));

				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + serialNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.pickupRequestNumber || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.wayBillNumber || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.sourceBranch || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.destinationBranch || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.consignorName || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.consigneeName || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.quantity || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.actualWeight || '--') + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.creationdateTimeStr || '--') + "</td>");

				$('#prePickupDatabody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			let totalRow = "<tr>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>Total</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + totalQuantity + "</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + totalWeight + "</td>" +
				"<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'></td>" +
				"</tr>";

			$('#prePickupDatabody').append(totalRow);
			hideLayer();
		}
	}
});