define([
	'slickGridWrapper2'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/agentWiseLRDetailReportWS/getAgentWiseLRDetailReportElement.do?', _this.renderAgentWiseLRDetailReportElement, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAgentWiseLRDetailReportElement: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/dispatchreport/agentWiseLRDetailReport/agentWiseLRDetailReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
			
				response.destinationSubRegionBranchSelection = true;
				
				if(response.destinationSubRegionBranchSelection) {
					response.destSubRegion = true;
					response.destBranch = true;
				}
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}

				let elementConfiguration = {};

				elementConfiguration.dateElement 			= $("#dateEle");
				elementConfiguration.regionElement 			= $("#regionEle");
				elementConfiguration.subregionElement 		= $("#subRegionEle");
				elementConfiguration.branchElement 			= $("#branchEle");
				elementConfiguration.vehicleElement 		= 'vehicleNumberEle';
				elementConfiguration.vehicleAgentElement 	= 'vehicleAgentEle';
				elementConfiguration.destSubregionElement 	= $("#destSubRegionEle");
				elementConfiguration.destBranchElement 		= $("#destBranchEle");
				elementConfiguration.destOperationalBranchElement 	= $("#toOperationalBranchEle");
				elementConfiguration.showOnlyActiveVehicles 		= response.showOnlyActiveVehicle;
				elementConfiguration.showAllOptionInVehicleNumber 	= response.showAllOptionInVehicleNumber;

				response.sourceAreaSelection = true;
				response.isCalenderSelection = true;
				response.groupMergingVehicleSelection = true;
				response.vehicleAgentSelection = true;
				response.isToOperationalBranchSelection = response.operationalBranchSelect;
				response.isPhysicalBranchesShow = true;

				response.elementConfiguration = elementConfiguration;
				
				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#findBtn").click(function() {
					$('#summaryBtn').hide();
					$('#destSummaryBtn').hide();
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onSubmit(_this);
				});
			});
		}, onSubmit: function() {
			showLayer();

			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/agentWiseLRDetailReportWS/getAgentWiseLRDetailReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			hideLayer();
			
			$('#destWiseSummaryTable tbody').empty();
			$('#destWiseSummaryTable thead').empty();
			$('#destWiseSummaryTable tfoot').empty();
			$('#categoryWiseSummaryTable tbody').empty();
			$('#categoryWiseSummaryTable thead').empty();
			$('#categoryWiseSummaryTable tfoot').empty();
			$('#agentWiseLRDetailReportDiv').empty();	
					
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			let headerDestColumnArray		= new Array();
			let footerDestColumnarray		= new Array();
			let headerCatColumnArray		= new Array();
			let footerCatColumnarray		= new Array();
			
			let destinationWiseSummaryList 	= response.destinationWiseSummaryList;
			let categoryWiseSummaryList 	= response.categoryWiseSummaryList;
			
			headerDestColumnArray.push("<th colspan=2 class='textAlignCenter bgcolor'>To Route</th>")
			headerDestColumnArray.push("<th colspan=3 class='textAlignCenter'>Cash (NAG)</th>")
			headerDestColumnArray.push("<th colspan=5 class='textAlignCenter'>To Pay (NAG)</th>")
			headerDestColumnArray.push("<th colspan=5 class='textAlignCenter'>UPI (NAG)</th>")
			headerDestColumnArray.push("<th colspan=5 class='textAlignCenter'>Total Amount (NAG)</th>")
		
			let paidCashTotal			= 0;
			let toPayTotal				= 0;
			let paidCashLessTotal		= 0;
			let totalBkgTotal			= 0;
			
			for(let data of destinationWiseSummaryList) {
				paidCashTotal		+= data.paidCashAmount;
				toPayTotal			+= data.toPayAmount;
				paidCashLessTotal 	+= data.paidCashLessAmount;
				totalBkgTotal		+= data.totalAmount;
				
				let dataColumnArray		= new Array();
				dataColumnArray.push("<td colspan=2 class='textAlignRight'>" + data.destinationBranch + "</td>");
				dataColumnArray.push("<td colspan=3 class='textAlignRight'>" + data.paidCashAmount + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.toPayAmount + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.paidCashLessAmount + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.totalAmount + "</td>");
					
				$('#destWiseSummaryTable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
			
			footerDestColumnarray.push("<td colspan=2 class='tfoot textAlignRight'>Total</td>");
			footerDestColumnarray.push("<td colspan=3 class='tfoot textAlignRight'>"+ paidCashTotal +"</td>");
			footerDestColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ toPayTotal +"</td>");
			footerDestColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ paidCashLessTotal +"</td>");
			footerDestColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ totalBkgTotal +"</td>");
			
			$('#destWiseSummaryTable thead').append('<tr class="danger">' + headerDestColumnArray.join(' ') + '</tr>');
			$('#destWiseSummaryTable tfoot').append('<tr class="textAlignCenter">' + footerDestColumnarray.join(' ') + '</tr>');
			
			headerCatColumnArray.push("<th colspan=2 class='textAlignCenter bgcolor'>Category</th>")
			headerCatColumnArray.push("<th colspan=3 class='textAlignCenter'>NAG</th>")
			headerCatColumnArray.push("<th colspan=5 class='textAlignCenter'>Amount</th>")
			headerCatColumnArray.push("<th colspan=5 class='textAlignCenter'>Commission</th>")
			headerCatColumnArray.push("<th colspan=5 class='textAlignCenter'>Net Amt.</th>")
		
			let qtyTotal			= 0;
			let totalAmt			= 0;
			let totalComm			= 0;
			let totalNetAMt			= 0;
			
			for(let data of categoryWiseSummaryList) {
				qtyTotal		+= data.noOfItems;
				totalAmt		+= data.totalAmount;
				totalComm		+= data.commissionAmount;
				totalNetAMt 	+= data.netAmount;
				
				let dataColumnArray		= new Array();
				dataColumnArray.push("<td colspan=2 class='textAlignRight'>" + data.categoryName + "</td>");
				dataColumnArray.push("<td colspan=3 class='textAlignRight'>" + data.noOfItems + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.totalAmount + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.commissionAmount.toFixed(2) + "</td>");
				dataColumnArray.push("<td colspan=5 class='textAlignRight'>" + data.netAmount.toFixed(2) + "</td>");
					
				$('#categoryWiseSummaryTable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
			
			footerCatColumnarray.push("<td colspan=2 class='tfoot textAlignRight'>Total</td>");
			footerCatColumnarray.push("<td colspan=3 class='tfoot textAlignRight'>"+ qtyTotal +"</td>");
			footerCatColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ totalAmt +"</td>");
			footerCatColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ totalComm +"</td>");
			footerCatColumnarray.push("<td colspan=5 class='tfoot textAlignRight'>"+ totalNetAMt +"</td>");
			
			$('#categoryWiseSummaryTable thead').append('<tr class="danger">' + headerCatColumnArray.join(' ') + '</tr>');
			$('#categoryWiseSummaryTable tfoot').append('<tr class="textAlignCenter">' + footerCatColumnarray.join(' ') + '</tr>');			
		}
	});
});