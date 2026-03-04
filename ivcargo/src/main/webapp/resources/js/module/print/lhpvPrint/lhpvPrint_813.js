define([], function() {
	return {
		setData: function(response) {
			this.setWayBillIncomeVoucherData(response);
			this.setDispatchLedgerData(response);
			this.setExpenseSettelmentsData(response);
			this.SetCharge(response)
			setTimeout(() => { window.print(); }, 200);
		}, setWayBillIncomeVoucherData: function(response) {
		 	const lhpvModel = response.lhpvModel; 
		
			$("[data-lhpvModel='payablebranch']").html(lhpvModel.balancePayableAtBranch)
			$("[data-lhpvModel='tripDate']").html(lhpvModel.creationDateTimeString)
			$("[data-lhpvModel='lhpvNumber']").html(lhpvModel.lhpvNumber)
			$("[data-lhpvModel='vehicleNumber']").html(lhpvModel.vehicleNumber)
			$("[data-lhpvModel='registeredOwner']").html(lhpvModel.registeredOwner)
			$("[data-lhpvModel='engineNumber']").html(lhpvModel.engineNumber)
			$("[data-lhpvModel='lhpvDriverName']").html(lhpvModel.lhpvDriverName)
			$("[data-lhpvModel='chasisNumber']").html(lhpvModel.chasisNumber)
			$("[data-lhpvModel='lhpvDriverMobileNo']").html(lhpvModel.lhpvDriverMobileNo)
			$("[data-lhpvModel='lhpvDriverLicenceNumber']").html(lhpvModel.lhpvDriverLicenceNumber)
			$("[data-lhpvModel='lhpvSourceBranch']").html(lhpvModel.lhpvSourceBranch)
			$("[data-lhpvModel='remark']").html(lhpvModel.remark)
			$("[data-lhpvModel='additionalRemark']").html(lhpvModel.additionalRemark)
			$("[data-lhpvModel='balanceAmount']").html(lhpvModel.balanceAmount)
			$("[data-lhpvModel='advanceAmount']").html(lhpvModel.advanceAmount)
			$("[data-lhpvModel='totalAmount']").html(lhpvModel.totalAmount)
			$("[data-lhpvModel='cleanerName']").html(lhpvModel.cleanerName)
			$("[data-lhpvModel='executiveName']").html(lhpvModel.executiveName)
			$("[data-lhpvModel='openingKM']").html(lhpvModel.openingKM)

			let fullDateTime = lhpvModel.creationDateTimeStringIn24HrFormat;
			let timeOnly = fullDateTime.split(' ')[1] + ' ' + fullDateTime.split(' ')[2];
			$("[data-lhpvModel='time']").html(timeOnly);
			
			const rawDate 	= lhpvModel.creationDateTimeString;
			const [day, month, yearSuffix] = rawDate.split("-");
			const fullYear 	= parseInt(yearSuffix, 10) + 2000;
			const dateObj 	= new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));

			const options 	= { weekday: 'long' };
			const weekday 	= dateObj.toLocaleDateString('en-US', options);

			$("[data-lhpvModel='formattedTripDate']").html(`${rawDate} &nbsp;&nbsp;&nbsp;&nbsp; ${weekday}`);

		},setDispatchLedgerData: function(response) {
			let dispatchLedger = response.dispatchLedgerArrlist;
			let waybillHm = response.waybillTypeHshmp;
			let lsWiseBookingChargeHm = response.lsWiseBookingChargeHm;
			
			if (!dispatchLedger || dispatchLedger.length === 0) {
				$("[data-container='dispatchLedger']").remove();
				$("[data-container='dispatchLedgerCopy']").remove(); 
				return;
			}

			dispatchLedger = dispatchLedger.map(entry => {
				const mergedWaybillData = waybillHm[entry.dispatchLedgerId] || {};
				const chargeData = lsWiseBookingChargeHm[entry.dispatchLedgerId] || {};

				const allowedChargeKeys = [154, 59, 25]; // PF, CARTAGE_CHARGE, DOOR_DELIVERY_BOOKING
				const filteredCharges = {};

				allowedChargeKeys.forEach(key => {
					filteredCharges[`charge_${key}`] = chargeData[key] != null ? chargeData[key] : 0;
				});

				return {
					...entry,
					...mergedWaybillData,
					...filteredCharges
				};
			});

				function populateTable(tableName) {
					$(`[data-table='${tableName}'] [data-column]`).closest("tr").before(
						dispatchLedger.map((rowData, i) =>
							$("<tr/>").append(
								Array.from($(`[data-table='${tableName}'] [data-column]`))
									.map(td => $(td))
									.map($td =>
										$("<td/>")
											.html((() => {
												if ($td.data("column") === "srNo")
													return i + 1;
			
												return rowData[$td.data("column")];
											})())
											.attr("class", $td.attr("class"))
									)
							)
						)
					);
			
					$(`[data-table='${tableName}'] [data-column]`).closest("tr").remove();
					
					// Totals
					$(`[data-table='${tableName}'] [data-total='amount']`).html(
						dispatchLedger.map(r => r.totalBookingAmount).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalActualWeight']`).html(
						dispatchLedger.map(r => r.totalActualWeight).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalNoOfPackages']`).html(
						dispatchLedger.map(r => r.totalNoOfPackages).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalNoOfWayBills']`).html(
						dispatchLedger.map(r => r.totalNoOfWayBills).reduce((a, b) => a + b, 0)
					);
					
					$(`[data-table='${tableName}'] [data-total='totalToPayAmount']`).html(
						  dispatchLedger.map(r => Number(r?.totalToPayAmount) || 0) .reduce((a, b) => a + b, 0) .toFixed(2)

					);
					$(`[data-table='${tableName}'] [data-total='totalPaidAmount']`).html(
					  dispatchLedger.map(r => Number(r?.totalPaidAmount) || 0) .reduce((a, b) => a + b, 0) .toFixed(2)
					);
					
					$(`[data-table='${tableName}'] [data-total='totalCreditAmount']`).html(
						 dispatchLedger.map(r => Number(r?.totalCreditAmount) || 0) .reduce((a, b) => a + b, 0) .toFixed(2)
					);
					
					$(`[data-table='${tableName}'] [data-total='charge_154']`).html(
						dispatchLedger.map(r => r.charge_154 || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='charge_59']`).html(
						dispatchLedger.map(r => r.charge_59 || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='charge_25']`).html(
						dispatchLedger.map(r => r.charge_25 || 0).reduce((a, b) => a + b, 0)
					);

					$(`[data-table='${tableName}'] [data-total='commission']`).html(
						dispatchLedger.map(r => r.commission || 0).reduce((a, b) => a + b, 0)
					);
					
					$(`[data-table='${tableName}'] [data-total='debitCreditAmount']`).html(
   					 dispatchLedger.map(r => Number(r?.debitCreditAmount) || 0) .reduce((a, b) => a + b, 0) .toFixed(2));

					
				}
			
				// Call for both tables
				populateTable("dispatchLedger");
				populateTable("dispatchLedgerCopy");
			},setExpenseSettelmentsData: function(response) {
				let expense = response.expenseSettelmentsDetails;
			
				if (!expense || expense.length === 0) {
					$("#expenseDiv").remove();
					$("#expenseCopyDiv").remove(); // also remove second one if needed
					return;
				}
			
				function populateExpenseTable(tableName) {
					$(`[data-table='${tableName}'] [data-column]`).closest("tr").before(
						expense.map((rowData, i) =>
							$("<tr/>").append(
								Array.from($(`[data-table='${tableName}'] [data-column]`))
									.map(td => $(td))
									.map($td =>
										$("<td/>")
											.html((() => {
												if ($td.data("column") === "srNo")
													return i + 1;
			
												return rowData[$td.data("column")];
											})())
											.attr("class", $td.attr("class"))
									)
							)
						)
					);
			
					// Remove template row after populating
					$(`[data-table='${tableName}'] [data-column]`).closest("tr").remove();
				}
			
				// Call the function for both tables
				populateExpenseTable("expense");
				populateExpenseTable("expenseCopy");
			}, SetCharge : function(response){
			let AllLHPVCharges = response.AllLHPVCharges;
			
			AllLHPVCharges.forEach((el)=>{
				console.log(el.displayName + "   " + el.amount)
			})

		}
	}
});