define([], function() {
	return {
		getConfiguration: function(response) {
			return `text!/ivcargo/html/module/turprint/${response.turPrintFlavor}.html`;
		}, getFilePathForLabel: function() {
			return `/ivcargo/resources/js/module/print/turprint/turPrintFilePath.js`;
		}, setData: function(response) {
			this.setHeaderDetails(response);
			this.setReceiveLedgerData(response);
			this.setReceivedSummaryData(response);
			this.setShortReceivedSummaryData(response);
			this.setDamageReceivedSummaryData(response);
			this.setExcessReceivedSummaryData(response);
			this.setDestinationWiseWayBillHM(response);
			this.setDestWiseReceivedSummaryData(response);
			this.setBookingDetails(response);
			this.setLhpvData(response);
			
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
			setCompanyLogos(headerModel.accountGroupId)
			
			if(response.configuration.showCompanyWaterMarkLogo)
				$(".companyWaterMarkLogo").removeClass('hide');
								
			
		}, setReceiveLedgerData: function(response) {
			let receivedLedger = response.RECEIVEDLEDGER;
			
			$("[data-tur='sourceBranch']").html(receivedLedger.sourceBranch)
			$("[data-tur='destinationBranch']").html(receivedLedger.destinationBranch)
			$("[data-tur='vehicleNumber']").html(receivedLedger.vehicleNumber)
			$("[data-tur='tripDate']").html(receivedLedger.tripDateTimeStr)
			$("[data-tur='receivedLedgerDate']").html(receivedLedger.receivedLedgerDateStr)
			$("[data-tur='lsNumber']").html(receivedLedger.lsNumber)
			$("[data-tur='turNumber']").html(receivedLedger.turNumber)
			$("[data-tur='totalQuantity']").html(receivedLedger.totalQuantity)

			$("[data-tur='totalNoOfDoorDeliveryArticles']").html(receivedLedger.totalNoOfDoorDeliveryArticles)
			$("[data-tur='totalNoOfCrossingArticles']").html(receivedLedger.totalNoOfCrossingArticles)
			$("[data-tur='totalNoOfGodownArticles']").html(receivedLedger.totalNoOfGodownArticles)
			$("[data-tur='totalNoOfArticles']").html(receivedLedger.totalNoOfArticles)
			$("[data-tur='totalNoOfArticlesShort']").html(receivedLedger.totalNoOfArticlesShort)
			$("[data-tur='totalNoOfArticlesExcess']").html(receivedLedger.totalNoOfArticlesExcess)
			$("[data-tur='totalNoOfArticlesDamaged']").html(receivedLedger.totalNoOfArticlesDamaged)
			
			$("[data-tur='totalWeight']").html(receivedLedger.totalWeight);
			$("[data-tur='deductionAmount']").html(receivedLedger.deductionAmount)
			$("[data-tur='arrivalDateTime']").html(receivedLedger.arrivalDateTimeStr);
			$("[data-tur='receivedLedgerDateTime']").html(receivedLedger.receivedLedgerDateTimeStr)
			
			$("[data-tur='remark']").html(receivedLedger.remark)
			
			if (receivedLedger.remark == undefined)
				$(".remarkCell").empty()
			
			$("[data-tur='unloadedByExecutiveName']").html(receivedLedger.unloadedByExecutiveName)
			$("[data-tur='unloadedByHamal']").html(receivedLedger.unloadedByHamal)	

			if (receivedLedger.unloadedByExecutiveName != undefined)
				$("[data-tur='unloadedBy']").html(receivedLedger.unloadedByExecutiveName)
			else if (receivedLedger.unloadedByHamal != undefined) {
				$("[data-tur='unloadedBy']").html(receivedLedger.unloadedByHamal)
				$(".showIfUnloadedByHamal").removeClass("hide")
			} else
				$(".unloadedByCell").empty()
		}, setReceivedSummaryData: function(response) {
			let receivedSummary = response.receivedSummaryArr
			
			if (!receivedSummary || receivedSummary.length === 0) {
				$("[data-container='receivedSummary']").remove()
				return
			}

			$("[data-table='receivedSummary'] [data-column]").closest("tr").before(
				receivedSummary
				.map((rowData, i) => 
					$("<tr/>").append(
						Array.from($("[data-table='receivedSummary'] [data-column]"))
						.map(td => $(td))
						.map($td =>
							$("<td/>")
							.html((() => {
								let wayBillDetail = response.WayBillDetails[rowData.wayBillId]
								
								if ($td.data("column") === "srNo")
									return i + 1;
								
								if ($td.data("column") === "bookingDate")
									return wayBillDetail.wayBillCreationDateTimeStampString;
								
								if ($td.data("column") === "sourceSubRegionWithBranch")
									return wayBillDetail.sourceSubRegion + " (" + wayBillDetail.sourceBranch + ")";
								
								return rowData[$td.data("column")]
							})())
							.attr("class", $td.attr("class"))
						)
					)
				)
			)

			$("[data-table='receivedSummary'] [data-column]").closest("tr").remove()
			
			$("[data-table='receivedSummary'] [data-total='quantity']").html(
				receivedSummary.map(r => r.quantity).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='receivedSummary'] [data-total='actualWeight']").html(
				receivedSummary.map(r => r.actualWeight).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='receivedSummary'] [data-total='shortLuggage']").html(
				receivedSummary.map(r => r.shortLuggage).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='receivedSummary'] [data-total='damageLuggage']").html(
				receivedSummary.map(r => r.damageLuggage).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='receivedSummary'] [data-total='damageAmount']").html(
				receivedSummary.map(r => r.damageAmount).reduce((a, b) => a + b, 0)
			)
		}, setShortReceivedSummaryData: function(response) {
			let shortReceivedSummary = response.receivedShortSummaryArr
			
			if (!shortReceivedSummary || shortReceivedSummary.length === 0) {
				$("[data-container='shortReceivedSummary']").remove()
				return
			}

			$("[data-table='shortReceivedSummary'] [data-column]").closest("tr").before(
				shortReceivedSummary
				.map((rowData, i) => 
					$("<tr/>").append(
						Array.from($("[data-table='shortReceivedSummary'] [data-column]"))
						.map(td => $(td))
						.map($td =>
							$("<td/>")
							.html((() => {
								let wayBillDetail = response.shortWayBillDetails[rowData.wayBillId]
								
								if ($td.data("column") === "srNo")
									return i + 1;
								
								if ($td.data("column") === "bookingDate")
									return wayBillDetail.wayBillCreationDateTimeStampString;
								
								if ($td.data("column") === "sourceSubRegionWithBranch")
									return wayBillDetail.sourceSubRegion + " (" + wayBillDetail.sourceBranch + ")";
								
								if ($td.data("column") == "shortDateTime")
									return rowData.shortTime;
								
								return rowData[$td.data("column")]
							})())
							.attr("class", $td.attr("class"))
						)
					)
				)
			)

			$("[data-table='shortReceivedSummary'] [data-column]").closest("tr").remove()
			
			$("[data-table='shortReceivedSummary'] [data-total='quantity']").html(
				shortReceivedSummary.map(r => r.quantity).reduce((a, b) => a + b, 0)
			)

			$("[data-table='shortReceivedSummary'] [data-total='actualWeight']").html(
				shortReceivedSummary.map(r => r.actualWeight).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='shortReceivedSummary'] [data-total='shortLuggage']").html(
				shortReceivedSummary.map(r => r.shortLuggage).reduce((a, b) => a + b, 0)
			)
		}, setDamageReceivedSummaryData: function(response) {
			let damageReceivedSummary = response.receivedDamSummaryArr
			
			if (!damageReceivedSummary || damageReceivedSummary.length === 0) {
				$("[data-container='damageReceivedSummary']").remove()
				return
			}

			$("[data-table='damageReceivedSummary'] [data-column]").closest("tr").before(
				damageReceivedSummary
				.map((rowData, i) => 
					$("<tr/>").append(
						Array.from($("[data-table='damageReceivedSummary'] [data-column]"))
						.map(td => $(td))
						.map($td =>
							$("<td/>")
							.html((() => {
								let wayBillDetail = response.damageWayBillDetails[rowData.wayBillId]
								
								if ($td.data("column") === "srNo")
									return i + 1;
								
								if ($td.data("column") === "bookingDate")
									return wayBillDetail.wayBillCreationDateTimeStampString;
								
								if ($td.data("column") === "sourceSubRegionWithBranch")
									return wayBillDetail.sourceSubRegion + " (" + wayBillDetail.sourceBranch + ")";
								
								if ($td.data("column") == "damageDateTime")
									return rowData.damageTime
								
								return rowData[$td.data("column")]
							})())
							.attr("class", $td.attr("class"))
						)
					)
				)
			)
			
			$("[data-table='damageReceivedSummary'] [data-column]").closest("tr").remove()
			
			$("[data-table='damageReceivedSummary'] [data-total='quantity']").html(
				damageReceivedSummary.map(r => r.quantity).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='damageReceivedSummary'] [data-total='actualWeight']").html(
				damageReceivedSummary.map(r => r.actualWeight).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='damageReceivedSummary'] [data-total='damageLuggage']").html(
				damageReceivedSummary.map(r => r.damageLuggage).reduce((a, b) => a + b, 0)
			)
		}, setExcessReceivedSummaryData: function(response) {
			let excessReceivedSummary = response.receivedSummArForEx
			
			if (!excessReceivedSummary || excessReceivedSummary.length === 0) {
				$("[data-container='excessReceivedSummary']").remove()
				return
			}

			$("[data-table='excessReceivedSummary'] [data-column]").closest("tr").before(
				excessReceivedSummary
				.map((rowData, i) => 
					$("<tr/>").append(
						Array.from($("[data-table='excessReceivedSummary'] [data-column]"))
						.map(td => $(td))
						.map($td =>
							$("<td/>")
							.html((() => {
								if ($td.data("column") === "srNo")
									return i + 1;
								
								if ($td.data("column") == "excessDateTime")
									return rowData.excessReceiveDateStr
								
								return rowData[$td.data("column")]
							})())
							.attr("class", $td.attr("class"))
						)
					)
				)
			)
			
			$("[data-table='excessReceivedSummary'] [data-column]").closest("tr").remove()
			
			$("[data-table='excessReceivedSummary'] [data-total='excessArticle']").html(
				excessReceivedSummary.map(r => r.excessArticle).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='excessReceivedSummary'] [data-total='weight']").html(
				excessReceivedSummary.map(r => r.weight).reduce((a, b) => a + b, 0)
			)
		}, setDestinationWiseWayBillHM: function(response) {
			let destinationWiseWayBillHM = response.destinationWiseWayBillHM
			
			if (!destinationWiseWayBillHM) {
				$("[data-container='destinationWiseWayBillHM']").remove()
				return
			}
			
			let wayBills = Object.values(response.destinationWiseWayBillHM).flat()

			$("[data-table='destinationWiseWayBillHM'] [data-column]").closest("tr").before(
				wayBills
				.map((rowData, i) => 
					$("<tr/>").append(
						Array.from($("[data-table='destinationWiseWayBillHM'] [data-column]"))
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
			
			$("[data-table='destinationWiseWayBillHM'] [data-total='totalNoOfPkgs']").html(
				wayBills.map(r => r.wayBillNoOfPkgs).reduce((a, b) => a + b, 0)
			)
			
			$("[data-table='destinationWiseWayBillHM'] [data-total='bookingTotal']").html(
				wayBills.map(r => r.bookingTotal).reduce((a, b) => a + b, 0)
			)
		}, setDestWiseReceivedSummaryData: function(response) {

			
			let receivedSummary = Object.values(response.destWisereceivedSummList || {});


			if (!receivedSummary.length) {
				$("[data-container='destWiseReceivedSummary']").remove();
				return;
			}

			$("[data-table='destWiseReceivedSummary'] [data-column]").closest("tr").before(
				receivedSummary.map((rowData, i) =>
					$("<tr/>").append(
						Array.from($("[data-table='destWiseReceivedSummary'] [data-column]"))
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

			$("[data-table='destWiseReceivedSummary'] [data-column]").closest("tr").remove();


			$("[data-table='destWiseReceivedSummary'] [data-total='lrCount']").html(
				receivedSummary.reduce((total, r) => total + (r.lrCount), 0)
			);

			$("[data-table='destWiseReceivedSummary'] [data-total='totalQuantity']").html(
				receivedSummary.reduce((total, r) => total + (r.totalQuantity), 0)
			);

			$("[data-table='destWiseReceivedSummary'] [data-total='totalBookingTotal']").html(
				receivedSummary.reduce((total, r) => total + (r.totalBookingTotal), 0)
			);

			$("[data-table='destWiseReceivedSummary'] [data-total='dlyTotalForTruckdly']").html(
				receivedSummary.reduce((total, r) => total + (r.dlyTotalForTruckdly), 0)
			);

			$("[data-table='destWiseReceivedSummary'] [data-total='totalDeliveryGrandTotal']").html(
				receivedSummary.reduce((total, r) => total + (r.totalDeliveryGrandTotal), 0)
			);

			$("[data-table='destWiseReceivedSummary'] [data-total='dlyTotalForGodown']").html(
				receivedSummary.reduce((total, r) => total + (r.dlyTotalForGodown), 0)
			);
		}, setBookingDetails: function(response) {
			if(response.paidBookingTotal != undefined)
				$("[data-tur='paidBookingTotal']").html(Math.round(response.paidBookingTotal));
			
			if(response.tbbBookingTotal != undefined)
				$("[data-tur='tbbBookingTotal']").html(Math.round(response.tbbBookingTotal));
			
			if (response.toPayBookingTotal !== undefined)
				$("[data-tur='toPayBookingTotal']").html(response.toPayBookingTotal);
		}, setLhpvData: function(response) {
			let lhpvData = response.lhpvmodel;
			
			if(lhpvData == undefined)
				return;

			$("[data-tur='lhpvNumber']").html(lhpvData.lhpvNumber)
			$("[data-tur='totalAmount']").html(lhpvData.totalAmount)
			$("[data-tur='advanceAmount']").html(lhpvData.advanceAmount)
			$("[data-tur='balanceAmount']").html(lhpvData.balanceAmount)
			$("[data-tur='lhpvDate']").html(lhpvData.creationDateTimeString)
		}
	}
});