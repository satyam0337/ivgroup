define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	PROJECT_IVUIRESOURCES + '/resources/js/report/incomeexpensereport/branchIncomeReportLrDetails.js',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'focusnavigation'
], function(Selection, BranchIncomeReportLrDetails) {
	'use strict';
	let jsonObject = new Object(),
		myNod,
		_this = '', printHeaderModel, selectedFromDate, selectedToDate;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/branchIncomeReportWS/loadBranchIncomeReportElement.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/incomeexpensereport/branchIncomeReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				const keyObject = Object.keys(response);

				keyObject.forEach(key => {
					if (response[key])
						$(`*[data-attribute=${key}]`).removeClass("hide");
				});

				let elementConfiguration = new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration = elementConfiguration;

				response.sourceAreaSelection 		= true;
				response.isCalenderSelection 		= true;
				response.isPhysicalBranchesShow 	= true;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		}, onSubmit: function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			selectedFromDate = jsonObject["fromDate"];
			selectedToDate = jsonObject["toDate"];

			getJSON(jsonObject, WEB_SERVICE_URL + '/report/branchIncomeReportWS/getBranchIncomeReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			$("#branchIncomeReportNewDiv").empty();
			$('#printBranchIncomeReport').empty();

			printHeaderModel = response.PrintHeaderModel;

			if (response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			if (response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				_this.createReportTable(response);
			}

			let data = new Object();
			data.accountGroupNameForPrint 		= printHeaderModel.accountGroupName;
			data.branchAddress 					= printHeaderModel.branchAddress;
			data.branchPhoneNumber 				= printHeaderModel.branchContactDetailMobileNumber;
			data.isLaserPrintAllow 				= 'true';
			data.isPlainPrintAllow 				= 'false';
			data.isExcelButtonDisplay 			= 'true';

			printTable(data, 'reportData', 'BranchIncomeReportNew', 'Branch Income Report', 'printBranchIncomeReport');

			hideLayer();
		}, createReportTable: function(response) {
			const clickableClass = "clickable-amount";
			// Create table structure
			let tableHtml = `
                <table id="branchIncomeTable" class="table table-bordered table-striped">
                    <thead id="branchIncomeTableHead"></thead>
                    <tbody id="branchIncomeTableBody"></tbody>
                    <tfoot id="branchIncomeTableFooter"></tfoot>
                </table>
            `;

			$("#branchIncomeReportNewDiv").html(tableHtml);
			$("#branchIncomeTable").css("font-size", "14px");

			// Build table header
			let headerColumns = [];
			headerColumns.push("<th class='text-info text-center' rowspan='2' style='width: 5%;'>Sr No</th>");
			headerColumns.push("<th class='text-info text-center' rowspan='2' style='width: 20%;'>Branch</th>");
			headerColumns.push("<th class='text-info text-center' colspan='2'>Paid Amount</th>");
			headerColumns.push("<th class='text-info text-center' colspan='2' style='width: 10%;'>To Pay Amount</th>");
			headerColumns.push("<th class='text-info text-center' rowspan='2' style='width: 10%;'>Bill Amount</th>");
			headerColumns.push("<th class='text-info text-center' colspan='2'>Short Credit Amount</th>");
			headerColumns.push("<th class='text-info text-center' rowspan='2' style='width: 10%;'>Total</th>");

			$("#branchIncomeTableHead").append("<tr>" + headerColumns.join('') + "</tr>");

			headerColumns = [];
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cash</th>");
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cashless</th>");
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cash</th>");
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cashless</th>");
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cash</th>");
			headerColumns.push("<th class='text-info text-center' style='width: 8%;'>Cashless</th>");

			$("#branchIncomeTableHead").append("<tr>" + headerColumns.join('') + "</tr>");

			// Build table body
			let totals = {
				paidCash: 0,
				paidCashless: 0,
				toPayCash: 0,
				toPayCashless: 0,
				billAmount: 0,
				shortCreditCash: 0,
				shortCreditCashless: 0,
				grandTotal: 0
			};

			$.each(response.CorporateAccount, function(index, item) {
				let paidCash = item.paidCashAmount || 0;
				let paidCashless = item.paidCashlessAmount || 0;
				let toPayCash = item.topayCashAmount || 0;
				let toPayCashless = item.topayCashlessAmount || 0;
				let billAmount = item.billAmount || 0;
				let shortCreditCash = item.shortCreditCashAmount || 0;
				let shortCreditCashless = item.shortCreditCashlessAmount || 0;
				let rowTotal = item.totalAmount || 0;

				let rowColumns = [];
				rowColumns.push("<td class='text-center align-middle fs-6'>" + (index + 1) + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6'>" + item.branchName + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='1' data-amount='" + paidCash + "'>" + paidCash + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='2' data-amount='" + paidCashless + "'>" + paidCashless + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='3' data-amount='" + toPayCash + "'>" + toPayCash + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='4' data-amount='" + toPayCashless + "'>" + toPayCashless + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6'>" + billAmount + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='5' data-amount='" + shortCreditCash + "'>" + shortCreditCash + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6 " + clickableClass + "' data-branch-id='" + item.branchId + "' data-branch-name='" + item.branchName + "' data-type='6' data-amount='" + shortCreditCashless + "'>" + shortCreditCashless + "</td>");
				rowColumns.push("<td class='text-center align-middle fs-6'>" + rowTotal + "</td>");

				$("#branchIncomeTableBody").append("<tr>" + rowColumns.join('') + "</tr>");
				// Update totals
				totals.paidCash 				+= paidCash;
				totals.paidCashless 			+= paidCashless;
				totals.toPayCash 				+= toPayCash;
				totals.toPayCashless 			+= toPayCashless;
				totals.billAmount 				+= billAmount;
				totals.shortCreditCash 			+= shortCreditCash;
				totals.shortCreditCashless 		+= shortCreditCashless;
				totals.grandTotal 				+= rowTotal;
			});
			// Build table footer
			let footerRow = "<tr class='text-center'>" +
				"<td colspan='2' style='font-weight: bold; background-color: #d3d3d3;'>TOTAL :</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.paidCash + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.paidCashless + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.toPayCash + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.toPayCashless + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.billAmount + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.shortCreditCash + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.shortCreditCashless + "</td>" +
				"<td style='font-weight: bold; background-color: #d3d3d3;'>" + totals.grandTotal + "</td>" +
				"</tr>";

			$("#branchIncomeTableFooter").append(footerRow);

			_this.addClickHandlers();
		}, addClickHandlers: function() {
			$(".clickable-amount").off('click');
			$(".clickable-amount").on('click', function() {
				let branchId 			= $(this).data("branch-id");
				let branchName 			= $(this).data("branch-name");
				let amountType 			= $(this).data("type");
				let amount 				= $(this).data("amount");
				
				if (amount > 0)
					_this.getBranchIncomeDetails(branchId, branchName, amountType);
			});

			$(".clickable-amount").css({
				"cursor": "pointer", "text-decoration": "none"
			}).hover(function() {
				$(this).css({
					"background-color": "#f8f9fa", "text-decoration": "underline"
				});
			}, function() {
				$(this).css({
					"background-color": "", "text-decoration": "none"
				});
			});
		}, getBranchIncomeDetails: function(branchId, branchName, amountType) {
			let jsonObject 				= new Object();
			jsonObject["branchId"] 		= branchId;
			jsonObject["amountType"] 	= amountType;
			jsonObject["fromDate"] 		= selectedFromDate;
			jsonObject["toDate"] 		= selectedToDate;
			
			let object			= new Object();
			object.elementValue = jsonObject;
			
			let heading = '';
			switch (amountType) {
				case 1: heading = 'Paid Cash Amount Details'; break;
				case 2: heading = 'Paid Cashless Amount Details'; break;
				case 3: heading = 'To Pay Cash Amount Details'; break;
				case 4: heading = 'To Pay Cashless Amount Details'; break;
				case 5: heading = 'Short Credit Cash Amount Details'; break;
				case 6: heading = 'Short Credit Cashless Amount Details'; break;
				default: heading = 'Branch Income LR Details'; break;
			}

			let modalTitle = heading + (branchName ? ' Of ' + branchName : '');

			let btModal = new Backbone.BootstrapModal({
				content: new BranchIncomeReportLrDetails(object),
				modalWidth: 70,
				modalHeight: 160,
				title: modalTitle
			}).open();

			object.btModal = btModal;
			new BranchIncomeReportLrDetails(object)
			btModal.open();
		}
	});
});