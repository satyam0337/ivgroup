
define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
], function(UrlParameter) {
	'use strict'; 

	let jsonObject = new Object(),	_this = '', dispatchLedgerIds;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			dispatchLedgerIds				= UrlParameter.getModuleNameFromParam('dispatchLedgerIds');
		}, render: function() {
			var jsonObject = new Object();
			jsonObject.dispatchIdString				= dispatchLedgerIds;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/getLSDataForConsolidatePrint.do', _this.setDataForPrint, EXECUTE_WITH_ERROR);
			return _this;
		}, setDataForPrint: function(response) {
			hideLayer();
			
			let htmlPath	= '/ivcargo/html/print/consolidateLSPrint/' + response.flavorConfig.consolidateLSPrintFlavor + '.html';
					
			if (!urlExists(htmlPath))
				htmlPath = '/ivcargo/html/print/consolidateLSPrint/consolidateLSPrint_default.html';

			let templatePath = _this.getConfiguration(htmlPath);

			require([templatePath], function(View) {
				_this.$el.html(_.template(View));
				_this.setData(response);
			});
			
		}, getConfiguration: function(htmlPath) {
			return 'text!' + htmlPath;
		}, setData: function(response) {
			this.setHeaderDetails(response);
			let html = '';

			if(response.flavorConfig.sourceDestinationWiseConsolidateLsPrint)
				html = this.sourceDestinationWiseTables(response);
			else
				html = this.buildSingleConsolidatedTable(response.dispatchLedgerList, response.wayBillChargeMap);
			
			html += this.buildSummaryTable(response.dispatchLedgerMap);
			
			document.getElementById('consolidatedTableContainer').innerHTML = html;
			
			setTimeout(() => { window.print(); }, 200);
		}, setHeaderDetails: function(response) {
			var printHeaderModel = response.printHeaderModel;
			
			let vehicleinfo = Object.values(Object.values(response.dispatchLedgerMap).at(0)).at(0)?.[0];
			  
			$("*[data-account='accountGroupName']").html(printHeaderModel.accountGroupName);

			$("*[data-info='vehicleNumber']").html(vehicleinfo.vehicleNumber);
			$("*[data-info='driverNameAndNumber']").html(vehicleinfo.driverName + ' (' + vehicleinfo.driverMobileNumber + ')');
			$("*[data-info='sourceBranchNames']").html(response.sourceBranchNames);
			$("*[data-info='destinationBranchNames']").html(response.destinationBranchNames);
			
			if (response.flavorConfig.showCompanyLogo) {
				setCompanyLogos(printHeaderModel.accountGroupId);
				$('.companyLogoCell').show()
				$('.companyLogo').show()
				$('.companyLogoEmptyCell').hide();
            } else
                $('.companyLogoEmptyCell').show();
			
		}, sourceDestinationWiseTables : function(response) {
			let dispatchLedgerMap = response.dispatchLedgerMap;
			let wayBillChargeMap = response.wayBillChargeMap;
			let html = '';

			Object.values(dispatchLedgerMap).forEach(destMap => {
				Object.values(destMap).forEach(lsRows => {
				   if (!lsRows || !lsRows.length) return;

				   html += this.buildLSTable(lsRows, wayBillChargeMap);
			   });
		   });

		   return html;
		}, buildLSTable : function(rows, wayBillChargeMap) {
			   const first = rows[0];
			   let totalQty = 0, totalFreight = 0, totalNet = 0, lsNumber = [], lrCharges = [], totalPickupCartage = 0,DispatchDate = '';

			   let bodyRows = rows.map((r, i) => {
				   totalQty += r.quantity || 0;
				   totalFreight += r.wayBillFreightAmount || 0;
				   totalNet += r.wayBillGrandTotal || 0;
				   totalPickupCartage += (wayBillChargeMap[r.wayBillId]?.[PICKUP_CARTAGE] || 0); // Pickup Cartage
				   DispatchDate = formatDate( new Date(r.actualDispatchDateTime))

				   r.lsNumber && lsNumber.indexOf(r.lsNumber) === -1 && lsNumber.push(r.lsNumber);

				   lrCharges = wayBillChargeMap[r.wayBillId] || {};

				   return `
					   <tr>
						   <td style="text-align: center;">${i + 1}</td>
						   <td style="text-align: center;">${r.wayBillNumber}</td>
						   <td style="text-align: center;">${r.lrTypeName}</td>
						   <td style="text-align: center;">${r.articleTypeCommaSeperated}</td>
						   <td style="text-align: center;">${r.quantity}</td>
						   <td>${r.wayBillConsignorName}</td>
						   <td>${r.wayBillConsigneeName}</td>
						   <td>${r.wayBillDestinationBranchName}</td>
						   <td style="text-align: right;">${r.wayBillFreightAmount}</td>
							<td style="text-align: right;">${lrCharges[PICKUP_CARTAGE] || 0}</td> <!-- Pickup Cartage -->
						   <td style="text-align: right;">${r.wayBillGrandTotal}</td>
					   </tr>
				   `;
			   }).join('');

			   return `
				   <div class="ls-title print-section" style="page-break-inside:avoid; margin-bottom: 5px; margin-top: 10px;">
					  <b> ${first.dispatchLSSourceBranchName} To ${first.dispatchLSDestinationBranchName} (LS No. ${lsNumber})  &emsp; &emsp; Dispatch Date : ${DispatchDate}</b>
				   </div>

				   <table class="width100per marginAuto" border="1">
					   <thead style="margin-top: 10px;">
						   <tr>
							   <th>S. No</th>
							   <th>LR Number</th>
							   <th>LR Type</th>
							   <th>Items</th>
							   <th>No. Of Articles</th>
							   <th>Consignor Name</th>
							   <th>Consignee Name</th>
							   <th>Destination</th>
							   <th>Freight Amount</th>
							   <th>Pickup Cartage</th>
							   <th>Net Amount</th>
						   </tr>
					    </thead>

					   <tbody>
						   ${bodyRows}
					   </tbody>

					   <tr>
						   <th colspan="4">Total</th>
						   <th>${totalQty}</th>
						   <th colspan="3"></th>
						   <th style="text-align:right;">${totalFreight}</th>
						   <th style="text-align:right;">${totalPickupCartage}</th>
						   <th style="text-align:right;">${totalNet}</th>
					   </tr>
				   </table>
			   `;
		   }, buildSummaryTable : function(dispatchLedgerMap) {

			   const summary = {};

			   Object.values(dispatchLedgerMap).forEach(destMap => {
				   Object.values(destMap).forEach(rows => {
					   rows.forEach(r => {
						   const type = r.lrTypeName || '';
						   summary[type] ??= { lr: 0, qty: 0, freight: 0, net: 0 };

						   summary[type].lr++;
						   summary[type].qty += r.quantity || 0;
						   summary[type].freight += r.wayBillFreightAmount || 0;
						   summary[type].net += r.wayBillGrandTotal || 0;
					   });
				   });
			   });

			   let total = { lr: 0, qty: 0, freight: 0, net: 0 };

			   let rowsHtml = Object.entries(summary).map(([k, v]) => {
				   total.lr += v.lr;
				   total.qty += v.qty;
				   total.freight += v.freight;
				   total.net += v.net;

				   return `
					   <tr>
						   <td style="text-align: center;">${k}</td>
						   <td style="text-align: center;">${v.lr}</td>
						   <td style="text-align: center;">${v.qty}</td>
						   <td style="text-align: right;">${v.freight}</td>
						   <td style="text-align: right;">${v.net}</td>
					   </tr>
				   `;
			   }).join('');

			   return `
				   <div class="ls-title" style="text-align: center; margin-top: 10px; page-break-inside:avoid;"><b>Report Summary Based on Categories</b></div>
				   <table class="width60per marginAuto" border="1">
					   <thead>
						   <tr>
							   <th>Category</th>
							   <th>LR Count</th>
							   <th>No. of Articles</th>
							   <th>Freight</th>
							   <th>Net Amount</th>
						   </tr>
					   </thead>
					   <tbody>${rowsHtml}</tbody>
					   <tfoot>
						   <tr>
							   <th>Total</th>
							   <th>${total.lr}</th>
							   <th>${total.qty}</th>
							   <th style="text-align:right;">${total.freight}</th>
							   <th style="text-align:right;">${total.net}</th>
						   </tr>
					   </tfoot>
				   </table>
			   `;
		   }, buildSingleConsolidatedTable: function(rows, wayBillChargeMap) {
			   if (!rows || !rows.length) return '';

			   let totalQty = 0, totalFreight = 0, totalNet = 0, lsNumber = [], lrCharges = [], totalPickupCartage = 0;

			   let bodyRows = rows.map((r, i) => {
				   totalQty += r.quantity || 0;
				   totalFreight += r.wayBillFreightAmount || 0;
				   totalNet += r.wayBillGrandTotal || 0;
				   totalPickupCartage += (wayBillChargeMap[r.wayBillId]?.[PICKUP_CARTAGE] || 0); // Pickup Cartage

				   r.lsNumber && lsNumber.indexOf(r.lsNumber) === -1 && lsNumber.push(r.lsNumber);
				   
				   lrCharges = wayBillChargeMap[r.wayBillId] || {};
				   
				   return `
					   <tr>
						   <td style="text-align: center;">${i + 1}</td>
						   <td style="text-align: center;">${r.wayBillNumber || ''}</td>
						   <td style="text-align: center;">${r.lrTypeName || ''}</td>
						   <td style="text-align: center;">${r.articleTypeCommaSeperated || ''}</td>
						   <td style="text-align:center;">${r.quantity || 0}</td>
						   <td>${r.wayBillConsignorName || ''}</td>
						   <td>${r.wayBillConsigneeName || ''}</td>
						   <td>${r.wayBillDestinationBranchName || ''}</td>
						   <td style="text-align:right;">${r.wayBillFreightAmount || 0}</td>
						   <td style="text-align:right;">${lrCharges[PICKUP_CARTAGE] || 0}</td> <!-- Pickup Cartage -->
						   <td style="text-align:right;">${r.wayBillGrandTotal || 0}</td>
					   </tr>
				   `;
			   }).join('');

			   return `
					<div class="ls-title print-section" style="page-break-inside:avoid; margin-bottom: 5px; margin-top: 10px;">
					  <b>LS No. ${lsNumber}</b>
				   </div>
				   <table class="width100per marginAuto" border="1">
				   <thead>
					   <tr>
						   <th>S. No</th>
						   <th>LR Number</th>
						   <th>LR Type</th>
						   <th>Items</th>
						   <th>No. Of Articles</th>
						   <th>Consignor Name</th>
						   <th>Consignee Name</th>
						   <th>Destination</th>
						   <th>Freight Amount</th>
						   <th>Pickup Cartage</th>
						   <th>Net Amount</th>
					   </tr>
					</thead>

					   <tbody>
						   ${bodyRows}
					   </tbody>

					   <tr>
						   <th colspan="4">Total</th>
						   <th>${totalQty}</th>
						   <th colspan="3"></th>
						   <th style="text-align:right;">${totalFreight}</th>
						   <th style="text-align:right;">${totalPickupCartage}</th>
						   <th style="text-align:right;">${totalNet}</th>
					   </tr>
				   </table>
			   `;
		   }
	});
});

function formatDate(dateObj) {
    let d = String(dateObj.getDate()).padStart(2, '0');
    let m = String(dateObj.getMonth() + 1).padStart(2, '0');
    let y = dateObj.getFullYear();
    return d + '-' + m + '-' + y;
}
