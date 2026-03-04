define([], function() {
	return {
		setData: function(response) {	
			this.setWayBillIncomeVoucherData(response);
			this.setDispatchLedgerData(response);
			this.setExpenseSettelmentsData(response);
			this.setCharge(response)
			setTimeout(() => { window.print(); }, 200);
		}, setWayBillIncomeVoucherData: function(response) {
			const lhpvModel = response.lhpvModel; 
		
			$("[data-lhpvModel='payablebranch']").html(lhpvModel.balancePayableAtBranch)
			$("[data-lhpvModel='tripDate']").html(lhpvModel.creationDateTimeStringIn24HrFormat)
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
			$("[data-lhpvModel='divisionName']").html(lhpvModel.divisionName)
	
			$("[data-bank='bankAccountNo']").html(lhpvModel.bankAccountNo)
			$("[data-bank='bankName']").html(lhpvModel.bankName)
			$("[data-bank='bankBranchAddress']").html(lhpvModel.bankBranchAddress)
			$("[data-bank='ifscCode']").html(lhpvModel.ifscCode)
			$("[data-lhpvModel='openingKM']").html(lhpvModel.openingKM)

			$("[data-createdBranch='address']").html(lhpvModel.sourceBranchAddressStr)
			$("[data-createdBranch='gstn']").html(lhpvModel.sourceBranchGstnStr)
			$("[data-createdBranch='phoneNo']").html(lhpvModel.sourceBranchPhoneNoStr)
			$("[data-createdBranch='phoneNo2']").html(lhpvModel.sourceBranchPhoneNo2Str)
			$("[data-createdBranch='mobileNo']").html(lhpvModel.sourceBranchMobNoStr)
			$("[data-createdBranch='mobileNo2']").html(lhpvModel.sourceBranchMobNo2Str)
			$("[data-createdBranch='phoneNoAndPhone2']").html(lhpvModel.sourceBranchPhoneNoStr +'/'+lhpvModel.sourceBranchMobNo2Str)
			$("[data-createdBranch='mobNoAndMobNo2']").html(lhpvModel.sourceBranchMobNoStr +'/'+lhpvModel.sourceBranchMobNo2Str)
			$("[data-createdBranch='executiveName']").html(lhpvModel.executiveName)


			
			let fullDateTime = lhpvModel.creationDateTimeStringIn24HrFormat;
			let timeOnly = fullDateTime.split(' ')[1] + ' ' + fullDateTime.split(' ')[2];
			$("[data-lhpvModel='time']").html(timeOnly);
			
			const rawDate	= lhpvModel.creationDateTimeString;
			const [day, month, yearSuffix] = rawDate.split("-");
			const fullYear	= parseInt(yearSuffix, 10) + 2000;
			const dateObj	= new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));

			const options	= { weekday: 'long' };
			const weekday	= dateObj.toLocaleDateString('en-US', options);

			$("[data-lhpvModel='formattedTripDate']").html(`${rawDate} &nbsp;&nbsp;&nbsp;&nbsp; ${weekday}`);

		},setDispatchLedgerData: function(response) {
				let dispatchLedger = response.dispatchLedgerArrlist;
				if (!dispatchLedger || dispatchLedger.length === 0) {
					$("[data-container='dispatchLedger']").remove();
					$("[data-container='dispatchLedgerCopy']").remove(); 
					return;
				}
			
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
				}
			
						
					$("[data-firstLs='driver1MobileNumber1']").html(dispatchLedger[0].driver1MobileNumber1); 
					$("[data-firstLs='driverName']").html(dispatchLedger[0].driverName); 

				// Call for both tables
				populateTable("dispatchLedger");
				populateTable("dispatchLedgerCopy");
				this.setSplitLHPVData(response, "splitTable1");
				this.setSplitLHPVData(response, "splitTable2");
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
			}, setCharge : function(response) {
				const charges = response.AllLHPVCharges || [];
				const chargesColl = response.chargesColl || {};
				let subTotal = 0;
	
				// Helper 
				const getAmount = (id) => chargesColl[id] || 0;

				// Hide all rows initially
				$('[data-chargename]').closest('tr').hide();
	
				const lorryHire = charges.find(c => c.lhpvChargeTypeMasterId == LORRY_HIRE);
			
				if (lorryHire) {
					const amt = getAmount(LORRY_HIRE);
					subTotal += amt;
					showRow(LORRY_HIRE, lorryHire.displayName, amt);
				}

				/* ===============================
				   2. ADD CHARGES (operationType = 1)
				================================ */
				charges.filter(c => c.operationType == 1)
					.forEach(c => {
						const amt = getAmount(c.lhpvChargeTypeMasterId);
						subTotal += amt;
	
						showRow(c.lhpvChargeTypeMasterId, c.displayName, amt);
					});

				/* ===============================
				   3. SUB TOTAL
				================================ */
				showRow('subTotal', 'Sub Total', Math.round(subTotal));
	
				const advance = charges.find(c => c.lhpvChargeTypeMasterId == ADVANCE_AMOUNT);
				
				if (advance) {
					showRow(ADVANCE_AMOUNT, advance.displayName, getAmount(ADVANCE_AMOUNT), true);
				}

				/* ===============================
				   5. SUBTRACT (operationType = 2 && not ADVANCE)
				================================ */
				charges
					.filter(c => c.operationType == 2 && c.lhpvChargeTypeMasterId != ADVANCE_AMOUNT)
					.forEach(c => {
						showRow(c.lhpvChargeTypeMasterId, c.displayName, getAmount(c.lhpvChargeTypeMasterId));
					});
	
				const balance = charges.find(c => c.lhpvChargeTypeMasterId == BALANCE_AMOUNT);
				
				if (balance) {
					showRow(BALANCE_AMOUNT, balance.displayName, getAmount(BALANCE_AMOUNT));
				}

			function showRow(id, name, value,isBold) {
				const nameTd = $(`[data-chargename="${id}"]`);
				const valueTd = $(`[data-chargevalue="${id}"]`);

				nameTd.html(name);
				valueTd.html(Math.round(value));

				if (value == 0 && valueTd.hasClass('hideIfZero')) {
					nameTd.closest('tr').hide();
				} else {
					nameTd.closest('tr').show();
				}

				const table = $('#dynamicTableForCharges');
				const template = table.find('.chargeRowTemplate');

				if (value == 0) return; 

				const row = template.clone()
					.removeClass('chargeRowTemplate').addClass(isBold ? 'bold' : '')
					.show();
					
				row.find('.chargename').html(name);
				row.find('.chargevalue').html(Math.round(value));

				table.append(row);
			}
			
			function cloneCharges(selector) {
				const clone = $('#dynamicTableForCharges')
					.clone()
					.removeAttr('id');
			
				clone.find('.chargeRowTemplate').remove();
				$(selector).html(clone);
			}
			
			$('.chargeRowTemplate').remove()
			cloneCharges('#chargesCopy1');
		}, setSplitLHPVData: function(response,tableId) {
			const splitLHPV = response.splitLHPV;
			const splitList = response.finalsplitLHPVDataList || [];
			const lhpvModel = response.lhpvModel;
		
			const table = $("#" + tableId);
			const template = table.find(".splitRowTemplate");
		
			if (splitLHPV && splitList.length > 0) {
				// Case 1: multiple branches
				splitList.forEach(item => {
					const row = template.clone().removeClass("splitRowTemplate").show();
					row.find(".branchName").html(item.branchName);
					row.find(".payableAmount").html(item.payableAmount);
					table.append(row);
				});
				template.remove()
			} else {
				// Case 2: single branch (no split)
				const row = template.clone().removeClass("splitRowTemplate").show();
				row.find(".branchName").html(lhpvModel.balancePayableAtBranch);
				row.find(".payableAmount").html(lhpvModel.balanceAmount);
				table.append(row);
				template.remove()
			}
		}
	}
});