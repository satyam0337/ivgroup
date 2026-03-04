define([], function() {
	return {
		getConfiguration: function(response) {
			return `text!/ivcargo/html/print/branchIncomeVoucherPrint/${response.branchIncomeVoucherPrintFlavor}.html`;
		}, getFilePathForLabel: function() {
			return `/ivcargo/resources/js/module/print/branchIncomeVoucherPrint/branchIncomeVoucherPrintFilePath.js`;
		}, setData: function(response) {	
			this.setHeaderDetails(response);
			this.setWayBillIncomeVoucherData(response);
			this.setWayBillIncomesData(response);
			setTimeout(() => { window.print(); }, 200);
		}, setHeaderDetails: function(response) {
			let headerModel = response.PrintHeaderModel;

			if (!headerModel.imagePath) {
				if (response.showCompanyLogo)
					$(".headerType1").removeClass("hide");
				else
					$(".headerType2").removeClass("hide");
			} else {
				$(".headerType3").removeClass("hide")
				$(".headerType3 img").attr("src", "/ivcargo/" + headerModel.imagePath)
			}

			$("[data-account='name']").html(headerModel.accountGroupName)
			setCompanyLogos(headerModel.accountGroupId)
		}, setWayBillIncomeVoucherData: function(response) {
			let wayBillIncomeVoucherDetails = response.wayBillIncomeVoucherDetails;

			$("[data-income='branch']").html(wayBillIncomeVoucherDetails.branch)
			$("[data-income='voucherNo']").html(wayBillIncomeVoucherDetails.receiptVoucherNumber)
			$("[data-income='voucherDate']").html(wayBillIncomeVoucherDetails.creationDateTimeStr)
			$("[data-income='preparedBy']").html(wayBillIncomeVoucherDetails.executive)
			
		}, setWayBillIncomesData: function(response) {
			let wayBillIncomes = response.wayBillIncomes

			if (!wayBillIncomes || wayBillIncomes.length === 0) {
				$("[data-container='wayBillIncomes']").remove()
				return
			}

			$("[data-table='wayBillIncomes'] [data-column]").closest("tr").before(
				wayBillIncomes
					.map((rowData, i) =>
						$("<tr/>").append(
							Array.from($("[data-table='wayBillIncomes'] [data-column]"))
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

			$("[data-table='wayBillIncomes'] [data-column]").closest("tr").remove()

			$("[data-table='wayBillIncomes'] [data-total='amount']").html(
				wayBillIncomes.map(r => r.amount).reduce((a, b) => a + b, 0)
			)
		}
	}
});