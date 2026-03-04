define([], function() {
	return {
		getConfiguration: function(response) {
			return `text!/ivcargo/html/print/branchExpenseVoucherPrint/${response.branchExpenseVoucherPrintFlavor}.html`;
		}, getFilePathForLabel: function() {
			return `/ivcargo/resources/js/module/print/branchExpenseVoucherPrint/branchExpenseVoucherPrintFilePath.js`;
		}, setData: function(response) {	
			this.setHeaderDetails(response);
			this.setVoucherDetailsData(response);
			this.setWayBillExpensesData(response);
			this.setLhpvDetailsData(response);
			this.setExpenseVoucherPaymentDetails(response);
			this.setDoorPickupData(response);

			setTimeout(() => { window.print(); }, 200);
		}, setHeaderDetails: function(response) {
			let headerModel = response.PrintHeaderModel;

			if (!headerModel.imagePath) {
				if (response.configuration.showCompanyLogo)
					$(".headerType1").removeClass("hide")
				else
					$(".headerType2").removeClass("hide")
			} else {
				$(".headerType3").removeClass("hide")
				$(".headerType3 img").attr("src", "/ivcargo/" + headerModel.imagePath)
			}

			$("[data-account='name']").html(headerModel.accountGroupName)
			$("[data-account='branchAddress']").html(headerModel.branchAddress)

			setCompanyLogos(headerModel.accountGroupId)
		}, setVoucherDetailsData: function(response) {
			let voucherDetails = response.voucherDetails;

			$("[data-expense='branch']").html(voucherDetails.branch)
			$("[data-expense='voucherNo']").html(voucherDetails.paymentVoucherNumber)
			$("[data-expense='voucherDate']").html(voucherDetails.expenseDateTimeStr)
			$("[data-expense='preparedBy']").html(voucherDetails.executive)
			
			
			$("[data-expense='doorPickupLsNo']").html(voucherDetails.doorPickupLsNo)
			$("[data-expense='doorPickupLsCreationDateTimeStr']").html(voucherDetails.doorPickupLsCreationDateTimeStr)
			$("[data-expense='doorPickupLsVehicleNo']").html(voucherDetails.doorPickupLsVehicleNo)
			$("[data-expense='doorPickupLsPickupSource']").html(voucherDetails.doorPickupLsPickupSource)
			$("[data-expense='doorPickupLsPickupDestination']").html(voucherDetails.doorPickupLsPickupDestination)
			$("[data-expense='doorPickupLsDriverName']").html(voucherDetails.doorPickupLsDriverName)
			$("[data-expense='doorPickupLsDriverMobileNo']").html(voucherDetails.doorPickupLsDriverMobileNo)
			$("[data-expense='doorPickupLsRemark']").html(voucherDetails.doorPickupLsRemark)
			
		}, setExpenseVoucherPaymentDetails: function(response) {
			let expenseVoucherPaymentDetails = response.expenseVoucherPaymentDetails;

			$("[data-payment='paymentModeName']").html(expenseVoucherPaymentDetails.paymentModeName)
			$("[data-payment='refrenceNumber']").html(expenseVoucherPaymentDetails.refrenceNumber)
			$("[data-payment='bankAccountNumber']").html(expenseVoucherPaymentDetails.bankAccountNumber)
			$("[data-payment='chequeDateTimeStr']").html(expenseVoucherPaymentDetails.chequeDateTimeStr)
					
		}, setWayBillExpensesData: function(response) {
			let wayBillExpenses = response.wayBillExpenses

			if (!wayBillExpenses || wayBillExpenses.length === 0) {
				$("[data-container='wayBillExpenses']").remove()
				return
			}

			$("[data-table='wayBillExpenses'] [data-column]").closest("tr").before(
				wayBillExpenses
					.map((rowData, i) =>
						$("<tr/>").append(
							Array.from($("[data-table='wayBillExpenses'] [data-column]"))
								.map(td => $(td))
								.map($td =>
									$("<td/>")
										.html((() => {
											if ($td.data("column") === "srNo")
												return i + 1;

											return rowData[$td.data("column")]
										})())
										.attr("class", $td.attr("class"))
								)
						)
					)
			)

			$("[data-table='wayBillExpenses'] [data-column]").closest("tr").remove()
			$("[data-name='expenseName']").html(wayBillExpenses[0].expenseName + ' Voucher')

			$("[data-table='wayBillExpenses'] [data-total='amount']").html(
				wayBillExpenses.map(r => r.amount).reduce((a, b) => a + b, 0)
			)
			
			$("*[data-total='amountInWord']").html(convertNumberToWord(Math.round(wayBillExpenses.map(r => r.amount).reduce((a, b) => a + b, 0))));
			$("[data-wayBillExpenses='wayBillExpensesRemark']").html(wayBillExpenses[0].remark)
		}, setLhpvDetailsData: function(response) {
			let lhpvModel = response.lhpvModel;
			let wayBillExpenses = response.wayBillExpenses

			if (!wayBillExpenses || wayBillExpenses.length === 0) {
				$("[data-container='wayBillExpenses']").remove()
				return
			}
			
			let typeOfExpenseId = response.wayBillExpenses[0].typeOfExpenseId;
			
			if(typeOfExpenseId != CHARGE_MAPPING_EXPENSE_ID)
				$("[data-container='branchExpense']").remove();
			
			if (lhpvModel == undefined || lhpvModel == null) {
				$("[data-container='lhpvData']").remove()
				return;
			}
			
			$("[data-container='branchExpense']").remove();
			$("[data-lhpv='lHPVNumber']").html(lhpvModel.lHPVNumber)
			$("[data-lhpv='truckNo']").html(lhpvModel.vehicleNumber)
			$("[data-lhpv='branch']").html(lhpvModel.branch)
			$("[data-lhpv='destinationBranch']").html(lhpvModel.destinationBranch)	
			$("[data-lhpv='panNumber']").html(lhpvModel.panNumber)	
			$("[data-lhpv='vehicleAgentName']").html(lhpvModel.vehicleAgentName)	
			$("[data-lhpv='divisionName']").html(lhpvModel.divisionName)	
		}, setDoorPickupData: function(response) {
			let doorPickupLedgerArr = response.doorPickupLedgerArr || [];
			let dispatchLedgerArr = response.dispatchLedgerArr || [];

			if (doorPickupLedgerArr.length > 0 && doorPickupLedgerArr[0].divisionName) 
				$("[data-doorPickup='divisionName']").html(doorPickupLedgerArr[0].divisionName);
			 else if (dispatchLedgerArr.length > 0 && dispatchLedgerArr[0].divisionName) 
				$("[data-doorPickup='divisionName']").html(dispatchLedgerArr[0].divisionName);
			 else 
				$("[data-container='doorPickup']").remove();
				
			}
		}
	});