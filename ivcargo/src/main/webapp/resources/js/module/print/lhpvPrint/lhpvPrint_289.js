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

				const allowedChargeKeys = [4, 171, 81]; 
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
					
					$(`[data-table='${tableName}'] [data-total='charge_4']`).html(
						dispatchLedger.map(r => r.charge_4 || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='charge_171']`).html(
						dispatchLedger.map(r => r.charge_171 || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='charge_81']`).html(
						dispatchLedger.map(r => r.charge_81 || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalPaidFreight']`).html(
						dispatchLedger.map(r => r.totalPaidFreight || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalToPayFreight']`).html(
						dispatchLedger.map(r => r.totalToPayFreight || 0).reduce((a, b) => a + b, 0)
					);
					$(`[data-table='${tableName}'] [data-total='totalTBBFreight']`).html(
						dispatchLedger.map(r => r.totalTBBFreight || 0).reduce((a, b) => a + b, 0)
					);
					
					const totalTopayFreightAmount = dispatchLedger.reduce(
					    (sum, r) => sum + (r.totalToPayFreight || 0),
					    0
					);
					
					const totalPaidFreightAmount = dispatchLedger.reduce(
					    (sum, r) => sum + (r.totalPaidFreight || 0),
					    0
					);
					
					const totalLoadingAmount = dispatchLedger.reduce(
					    (sum, r) => sum + (r.charge_4 || 0),
					    0
					);
					const totalCrossingAmount = dispatchLedger.reduce(
					    (sum, r) => sum + (r.charge_81 || 0),
					    0
					);
					
					let totalFreightAmount = totalTopayFreightAmount + totalPaidFreightAmount;
					$(`[data-table='${tableName}'] [data-total='totalFreightAmount']`).html(totalFreightAmount);
					
					let commissionOnFreight = Math.round(totalFreightAmount * 0.30);
					$(`[data-table='${tableName}'] [data-total='commissionOnFreight']`).html(commissionOnFreight);
					
					let grandTotal = totalFreightAmount - commissionOnFreight - totalLoadingAmount - totalCrossingAmount
					$(`[data-table='${tableName}'] [data-total='grandTotal']`).html(grandTotal);
					
					let balance = grandTotal -  totalTopayFreightAmount
					$(`[data-table='${tableName}'] [data-total='balance']`).html(balance);
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