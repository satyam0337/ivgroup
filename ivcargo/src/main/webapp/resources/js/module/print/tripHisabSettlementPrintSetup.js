define([], function(){	
	var totalDieselQty	  = 0.0;
	var totalvehicleAvg	  = 0.0;
	var totalKm			  = 0.0;
	var vehicleRatePerKM  = 0.0;
	var dieselCost		  = 0.0;
	var dieselAmt		  = 0.0;
	var totalAmount		  = 0.0;
	var miscChargesTotal  = 0.0;
	var totalExpenses	  = 0.0;
	var rawanaTotalAdvance = 0.0;
	var totalTollAmount	   = 0.0;
	var allLsActualWt	   = 0.0;
	var totalRunningKM	   = 0.0;
	return {
		setHeaderDetails : function(PrintHeaderModel){
			setTimeout(() => {
				$("*[data-account='accountGroupName']").html(PrintHeaderModel.accountGroupName);
				$("*[data-account='branchAddress']").html(PrintHeaderModel.branchAddress);
				$("*[data-account='branchContactDetailMobileNumber']").html(PrintHeaderModel.branchContactDetailMobileNumber);
				$("*[data-account='branchMobileNumbers']").html(PrintHeaderModel.branchMobileNumbers);

			}, 100);
			setCompanyLogos(PrintHeaderModel.accountGroupId);

		}, setTripHisabSettlementPrintData(response) {
			setTimeout(() => {
				var tripHisabSettlementList = response.tripHisabSettlementList;
				var tripArr = tripHisabSettlementList[0];
				$("*[data-lr='driverName']").html(tripArr.driverName);
				$("*[data-lr='vehicleNumber']").html(tripArr.vehicleNumber);
				$("*[data-lr='tripHisabSettlementNumber']").html(tripArr.tripHisabSettlementNumber);
				$("*[data-lr='driverMobNumber']").html(tripArr.driverMobNumber);
				$("*[data-lr='TripsettledBy']").html(tripArr.settledBy);
				$("*[data-lr='settlementDateTimeStr']").html(tripArr.settlementDateTimeStr);
				$("*[data-lr='driverAllowance']").html(tripArr.driverAllowance);
				
				tripHisabSettlementList.forEach((trip, index) => {
					const sectionId = `#object${index + 1}`;
					$(sectionId).find('[data-lr="lsTotalActualWeight"]').html(trip.lsTotalActualWeight);
					$(sectionId).find('[data-lr="destinationBranchName"]').html(trip.destinationBranchName);
					$(sectionId).find('[data-lr="destinationBranchCode"]').html(trip.destinationBranchCode);
					$(sectionId).find('[data-lr="sourceBranchName"]').html(trip.sourceBranchName);
					$(sectionId).find('[data-lr="sourceBranchCode"]').html(trip.sourceBranchCode);
					$(sectionId).find('[data-lr="lsCreationDateTimeStr"]').html(trip.lsCreationDateTimeStr);
					$(sectionId).find('[data-lr="lsCreationTimeStr"]').html(trip.lsCreationTimeStr);
					$(sectionId).find('[data-lr="arrivalDateTime"]').html(trip.arrivalDateTimeStr);
					$(sectionId).find('[data-lr="arrivalTime"]').html(trip.arrivalTimeStr);
					$(sectionId).find('[data-lr="openingKM"]').html(trip.openingKM);
					$(sectionId).find('[data-lr="endKMReading"]').html(trip.endKMReading);
					$(sectionId).find('[data-lr="dieselLiter"]').html(trip.dieselLiter);
					$(sectionId).find('[data-lr="dieselRate"]').html(trip.dieselRate);
					$(sectionId).find('[data-lr="lsExecutiveName"]').html(trip.lsExecutiveName);
					$(sectionId).find('[data-lr="rawanaExpenseAmt"]').html(trip.rawanaExpenseAmt);
					$(sectionId).find('[data-lr="tripTotalHour"]').html(trip.tripTotalHour);
					$(sectionId).find('[data-lr="totalKmRunning"]').html(trip.totalRunningKM);
					$(sectionId).find('[data-lr="vehicleAvg"]').html(trip.vehicleAvg);
					$(sectionId).find('[data-lr="loadType"]').html(trip.bookingTypeName);
					
					if(sectionId == "#object1") {
						totalRunningKM = trip.totalRunningKM;
					}
					
					
					
					
					if(trip.bookingTypeId == BOOKING_TYPE_FTL_ID)
						$(sectionId).find('[data-lr="bookingTotal"]').html(trip.bookingTotal);
					else
						$(sectionId).find('[data-lr="bookingTotal"]').html("");

					totalDieselQty		+= trip.dieselLiter;
					totalvehicleAvg		+= trip.vehicleAvg;
					totalKm				+= trip.totalRunningKM;
					dieselCost			+= trip.dieselLiter * trip.tripDieselPerLiter;
					rawanaTotalAdvance	+= trip.rawanaExpenseAmt;
					vehicleRatePerKM	= trip.vehicleRatePerKM;
					allLsActualWt		+= trip.lsTotalActualWeight;
					
					$("*[data-lr='vehicleRatePerKM']").html(vehicleRatePerKM.toFixed(2));
					$("*[data-lr='tripDieselPerLiter']").html(trip.tripDieselPerLiter);
					
					if (index == tripHisabSettlementList.length - 1)
						$("[data-lr='lastLsDestinationName']").html(trip.destinationBranchName);
				});
				$('[data-lr="totalKmRunningObject1"]').html(totalRunningKM);
				$("*[data-lr='totalDieselQty']").html(totalDieselQty.toFixed(2));
				$("*[data-lr='totalKm']").html(totalKm.toFixed(2));
				
				const isAllFTL = tripHisabSettlementList.every(trip => trip.bookingTypeId === BOOKING_TYPE_FTL_ID);
				const overallLoadType = isAllFTL ? "FTL" : "Sundry";
				  
				dieselAmt = ((totalKm * vehicleRatePerKM) - dieselCost);
				totalAmount = (totalKm * vehicleRatePerKM).toFixed(2)
				
				$("*[data-lr='totalvehicleAvg']").html((totalvehicleAvg / 2).toFixed(2));
				$("*[data-lr='totalAmount']").html(totalAmount);
				$("*[data-lr='dieselCost']").html((dieselCost).toFixed(2));
				$("*[data-lr='dieselAmt']").html(dieselAmt);
				$("*[data-lr='perKmRate']").html((dieselAmt / totalKm).toFixed(2));
				$("*[data-lr='rawanaTotalAdvance']").html(rawanaTotalAdvance.toFixed(2));
				$("*[data-lr='allLsActualWt']").html(allLsActualWt.toFixed(2));
				$("*[data-lr='overallLoadType']").html(overallLoadType);
				$("*[data-lr='allLsTotalDieselQty']").html(totalDieselQty.toFixed(2));
					  //Process misc charges Details dynamically
				
				let tripHisabSettlementMiscDetailsList = response.tripHisabSettlementMiscDetailsList;
				
				tripHisabSettlementMiscDetailsList.forEach(function(charge) {
					miscChargesTotal += charge.amount;
					
					$('#chargesTable').append(`<tr class=" borderBottom textAlignCenter bold">
								<td class="width60per"> ${charge.miscChargeName} </td>
								<td class="width20per borderLeft borderRight">&nbsp;</td>
								<td class="width20per textAlignRight paddingRight10px "> ${charge.amount} </td>
							</tr>`);
				});
				
				response.tripHisabSettlementTollDetailsList.forEach(function(tollCharges) {
					totalTollAmount += tollCharges.amount
				});
				
				$("*[data-lr='totalTollAmount']").html(totalTollAmount.toFixed(2));
				
				totalExpenses = (Number(miscChargesTotal) + Number(totalAmount) + Number(totalTollAmount));
				
				///	  Calculation for  total expenses details
				var totalExpensesWithDriverAllow = (Number(totalExpenses) + Number(tripArr.driverAllowance));
				
				$("*[data-lr='driverTotalExpensesForAccurate']").html( rawanaTotalAdvance - totalExpensesWithDriverAllow );				 
				$("*[data-lr='totalExpenses']").html(Number(totalExpenses).toFixed(2));
				$("*[data-lr='totalExpensesWithDriverAllow']").html(totalExpensesWithDriverAllow.toFixed(2));
				$("*[data-lr='driverTotalExpenses']").html((totalExpenses - rawanaTotalAdvance).toFixed(2));
				$("*[data-lr='totalAmtPayToDriver']").html(((totalExpenses - rawanaTotalAdvance) - dieselCost).toFixed(2));

			}, 100);
			hideLayer();
		}
	}
});