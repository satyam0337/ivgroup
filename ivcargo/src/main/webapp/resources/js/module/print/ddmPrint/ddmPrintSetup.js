define([], function() {
	return {
		setData: function(response) {
			this.setDdmDetails(response);
			this.setHeaderDetails(response);
		setTimeout(() => { window.print(); }, 200);
		},

		setHeaderDetails: function(response) {
			var printHeaderModel = response.PrintHeaderModel;
			$("*[data-account='accountGroupName']").html(printHeaderModel.accountGroupName);
			$("*[data-account='branchAddress']").html(printHeaderModel.branchAddress);
			$("*[data-account='branchContactDetailMobileNumber']").html(printHeaderModel.branchContactDetailMobileNumber);
			
			setCompanyLogos(printHeaderModel.accountGroupId);
			if (response.showCompanyLogo == true) {
				$('.companyLogoCell').show()
				$('.companyLogo').show()
			}
		},setDdmDetails: function(response) {
			const ddmWiseHm = response.ddmWiseHm || {};
			const wayBillViewModelList = response.wayBillViewModelList || [];
			const sortedCollectionList = response.sortedCollectionList || {};
			const isDestWise = response.ddmPrintConfiguration.sortByDestBranchName;

			Object.keys(ddmWiseHm).forEach(ddmId => {
				const ddmData = ddmWiseHm[ddmId];

				const matchedWaybills = this.getMatchedWaybills(ddmId, wayBillViewModelList, sortedCollectionList, isDestWise);

				if (isDestWise) ddmData.destWiseList = this.groupByDestination(matchedWaybills);
				else ddmData.waybillList = matchedWaybills;

				ddmData.totalSummary = this.calculateSummary(matchedWaybills);
			});

			Object.keys(ddmWiseHm).forEach(ddmId => {
				this.renderDdmTable(ddmWiseHm[ddmId], isDestWise);
			});

			const firstTemplate = document.querySelector("table.width98per.marginAuto");
			if (firstTemplate) firstTemplate.remove();
		},

		getMatchedWaybills: function(ddmId, allWaybills, sortedCollectionList, isDestWise) {
			if (isDestWise) {
				const result = [];
				Object.values(sortedCollectionList).forEach(destList => {
					destList.forEach(wb => {
						if (String(wb.deliveryRunSheetLedgerId) === String(ddmId)) result.push(wb);
					});
				});
				return result;
			}
			return allWaybills.filter(wb => String(wb.deliveryRunSheetLedgerId) === String(ddmId));
		},

		groupByDestination: function(matchedWaybills) {
			const map = {};
			matchedWaybills.forEach(wb => {
				const destId = wb.wayBillDestinationBranchId || 0;
				if (!map[destId]) {
					map[destId] = {
						destinationBranchName: wb.wayBillDestinationBranchName || "N/A",
						waybills: []
					};
				}
				map[destId].waybills.push(wb);
			});
			return Object.values(map);
		},

		calculateSummary: function(waybills) {
			const summary = { paidAmt: 0, topayAmt: 0, tbbAmt: 0 };
			waybills.forEach(wb => {
				const amt = Number(wb.wayBillGrandTotal) || 0;
				if (wb.wayBillTypeId == 1) summary.paidAmt += amt;
				else if (wb.wayBillTypeId == 2) summary.topayAmt += amt;
				else if (wb.wayBillTypeId == 4) summary.tbbAmt += amt;
			});
			return summary;
		},

		renderDdmTable: function(ddmData, isDestWise) {
			const template = document.querySelector("table.width98per.marginAuto");
			if (!template) return; 

			const clone = template.cloneNode(true);

			this.setTextIfExists(clone, "[data-ddm='source']", ddmData.sourceBranchName);
			this.setTextIfExists(clone, "[data-ddm='destination']", ddmData.destinationBranchName);
			this.setTextIfExists(clone, "[data-ddm='ddmNo']", ddmData.ddmNumber);
			this.setTextIfExists(clone, "[data-ddm='dateTime']", ddmData.deliveryDateTimeString);
			this.setTextIfExists(clone, "[data-ddm='vechicleNo']", ddmData.vehicleNumber);
			this.setTextIfExists(clone, "[data-ddm='driverNameWithContactNumber']", ddmData.driverNameWithContactNumber);
			this.setTextIfExists(clone, "[data-ddm='consolidateEwaybill']", ddmData.consolidateEWaybillNumber);

			const waybillBody = clone.querySelector("#waybillBody");
			if (!waybillBody) return;

			const rowTemplate = waybillBody.querySelector("[data-template='row']");
			if (!rowTemplate) return;

			waybillBody.innerHTML = "";

			let totalQty = 0, totalAmt = 0, srNo = 1;

			if (isDestWise && ddmData.destWiseList) {
				ddmData.destWiseList.forEach(destData => {
					const destRow = document.createElement("tr");
					destRow.innerHTML = `<td colspan="9" style="font-weight:bold;background:#f2f2f2;">Destination: ${destData.destinationBranchName}</td>`;
					waybillBody.appendChild(destRow);

					destData.waybills.forEach(wb => {
						const tr = this.createWaybillRow(rowTemplate, wb, srNo++);
						waybillBody.appendChild(tr);
						totalQty += Number(wb.totalQuantity) || 0;
						totalAmt += Number(wb.wayBillGrandTotal) || 0;
					});
				});
			} else if (ddmData.waybillList) {
				ddmData.waybillList.forEach((wb, i) => {
					const tr = this.createWaybillRow(rowTemplate, wb, i + 1);
					waybillBody.appendChild(tr);
					totalQty += Number(wb.totalQuantity) || 0;
					totalAmt += Number(wb.wayBillGrandTotal) || 0;
				});
			}

			this.setTextIfExists(clone, "[data-setWaybillFotter='totalQuantity']", totalQty);
			this.setTextIfExists(clone, "[data-setWaybillFotter='grandTotal']", totalAmt.toFixed(2));

			const summary = ddmData.totalSummary || {};
			this.setTextIfExists(clone, "[data-setSummaryTotal='paidAmt']", summary.paidAmt);
			this.setTextIfExists(clone, "[data-setSummaryTotal='topayAmt']", summary.topayAmt);
			this.setTextIfExists(clone, "[data-setSummaryTotal='tbbAmt']", summary.tbbAmt);

			const wrapper = document.createElement("div");
			wrapper.classList.add("ddm-page");
			wrapper.style.pageBreakAfter = "always";
			wrapper.appendChild(clone);
			document.body.appendChild(wrapper);
		},

		createWaybillRow: function(rowTemplate, wb, srNo) {
			const tr = rowTemplate.cloneNode(true);
			this.setTextIfExists(tr, "[data-setWaybill='srNo']", srNo);
			this.setTextIfExists(tr, "[data-setWaybill='wayBillNumber']", wb.wayBillNumber);
			this.setTextIfExists(tr, "[data-setWaybill='destinationBranch']", wb.wayBillDestinationBranchName);
			this.setTextIfExists(tr, "[data-setWaybill='packageQuantity']", wb.totalQuantity);
			this.setTextIfExists(tr, "[data-setWaybill='consignerName']", wb.consignorName);
			this.setTextIfExists(tr, "[data-setWaybill='consigneeName']", wb.consigneeName);
			this.setTextIfExists(tr, "[data-setWaybill='grandTotal']", wb.wayBillGrandTotal);
			this.setTextIfExists(tr, "[data-setWaybill='wayBillType']", wb.wayBillType);
			this.setTextIfExists(tr, "[data-setWaybill='remark']", wb.wayBillRemark);
			return tr;
		},

		setTextIfExists: function(parent, selector, text) {
			let el = null;
			if (typeof parent === "string") el = document.querySelector(parent);
			else if (parent && parent.querySelector) el = parent.querySelector(selector);
			if (el) el.innerText = text != null ? text : "";
		}
	};
});
