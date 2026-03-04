
var selectTypeId = 0;

define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(Selection, Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod, _thisRender = '', selectParty, showPartyContactNumber = false;

	return Marionette.LayoutView.extend({
		initialize : function() {
			_thisRender = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseBillsStatusReportWS/getPartyWiseBillsStatusReportElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport : function(response) {
			hideLayer();
			
			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/accountreport/partyWiseBillsStatusReport/partyWiseBillsStatusReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				showPartyContactNumber	= response.showPartyContactNumber;

				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				$("#partyDiv").hide();
				$("#dateSelect").show();

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.sourceAreaSelection			= true;
				response.partySelection					= true;
				response.isSearchByAllParty				= false;

				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				var dataTypeList 		= new Array();

				dataTypeList[0] = {'dataTypeId':1,'dataTypeName':'Due Payment'};
				dataTypeList[1] = {'dataTypeId':2,'dataTypeName':'Recieved Payment'};
				dataTypeList[2] = {'dataTypeId':0,'dataTypeName':'All'};

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	dataTypeList,
					valueField		:	'dataTypeId',
					labelField		:	'dataTypeName',
					searchField		:	'dataTypeName',
					elementId		:	'dataTypeEle',
					create			: 	false,
					maxItems		: 	1,
				});

				myNod.add({
					selector		: '#dataTypeEle_wrapper',
					validate		: 'validateAutocomplete:#dataTypeEle',
					errorMessage	: 'Select Proper Bill Type !'
				});

				$('#selectParty').click(function() {
					$("#partyNameEle").val(0);

					selectParty = $('#selectParty').is(':checked');

					if(selectParty)
						$("#partyDiv").show();
					else
						$("#partyDiv").hide();
				});

				hideLayer();

				$("#saveBtn").click(function() {
					if(selectParty && Number($("#partyNameEle").val()) == 0) {
						showMessage('error', 'Please Select Party !');
						return false;
					} 
					
					if(!selectParty)
						$("#partyNameEle").val(0);

					myNod.performCheck();

					if(myNod.areAll('valid'))
						_thisRender.onSubmit();
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			var jsonObject = Selection.getElementData();

			jsonObject["billTypeId"] 			= $('#dataTypeEle').val();

			if($('#selectTypeEle').val() == 1)
				jsonObject["selectTypeId"] 		= $('#selectTypeEle').val();
			else
				jsonObject["selectTypeId"] 		= selectTypeId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseBillsStatusReportWS/getPartyWiseBillsStatusReportData.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			var partyWisePendingBillsHmp 		= response.partyWisePendingBillsHmp;
			var partyDetailsHM 					= response.partyDetailsHM;
			var branch							= response.branchDetails;
			var accountGroup					= response.accountGroup;
			var partyWiseBillsStatusReport		= response.partyWiseBillsStatusReport;

			$("#printPartyBillstatusReport").empty();
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();

			var columnHeadArray				= new Array();
			var columnPartyArray			= new Array();
			var columnBillArray				= new Array();

			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Bill Date</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Bill No</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>LR No</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>LR Date</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>From</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>To</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>MR No</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Received Date</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Amount</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Received Amnt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color:aliceblue;font-size: 14px;color:#46318f;'>Balance</th>");

			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" style="background-color:aqua" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');

			var headerSize = columnHeadArray.length;
			
			if (typeof partyWisePendingBillsHmp !== 'undefined' && partyWisePendingBillsHmp != null) {
				var aggregatedData = []; // Step 1: Array to hold all data

				for (let key in partyWisePendingBillsHmp) {
					let partyDetails = partyDetailsHM[key];

					aggregatedData.push({
						partyName: partyDetails.partyName,
						mobileNumber: partyDetails.mobileNumber,
						billDetailsHm: partyWisePendingBillsHmp[key]
					});
				}

				aggregatedData.sort(function(a, b) {
					return a.partyName.localeCompare(b.partyName);
				});

				for (var id = 0; id < aggregatedData.length; id++) {
					let partyData = aggregatedData[id];
					let partyName = partyData.partyName;
					let billDetailsHm = partyData.billDetailsHm;

					var grandTotal = 0;
					var receivedAmt = 0;
					var balanceAmt = 0;
					var columnPartyArray = [];

					if (showPartyContactNumber)
						columnPartyArray.push("<td colspan='" + headerSize + "' style='text-align: center; vertical-align: middle;'><b style='font-size: 18px; color: #961d2e;'>" + partyName + " (" + partyData.mobileNumber + ")</b></td>");
					else
						columnPartyArray.push("<td colspan='" + headerSize + "' style='text-align: center; vertical-align: middle;'><b style='font-size: 18px; color: #961d2e;'>" + partyName +"</b></td>" );

					$('#reportDetailsTable tbody').append('<tr>' + columnPartyArray.join(' ') + '</tr>');
					columnPartyArray = [];

					for (let billId in billDetailsHm) {
						let billDetailsList = billDetailsHm[billId];
						let rowSpanSize = billDetailsList.length;

						for (var i = 0; i < rowSpanSize; i++) {
							var billdetails = billDetailsList[i];
							var columnBillArray = [];

							if (i == 0) {
								columnBillArray.push("<td rowspan ='" +rowSpanSize +"' style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.billDateTimeStr +"</b></td>" );
								columnBillArray.push("<td rowspan ='" + rowSpanSize +"' style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.billNumber +"</b></td>" );
							}

							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.wayBillNumber +"</b></td>");
							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.bookingDateTimeStr +"</b></td>");
							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.srcBranchNameStr + "</b></td>");
							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.destBranchNameStr +"</b></td>");
							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.mrNumber +"</b></td>");
							columnBillArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.receivedDateTimeStr +"</b></td>");

							if (i == 0) {
								grandTotal	+= billdetails.grandTotal;
								receivedAmt += billdetails.receivedAmount;
								balanceAmt	+= billdetails.balanceAmount;

								columnBillArray.push("<td rowspan ='" + rowSpanSize +"' style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.grandTotal + "</b></td>");
								columnBillArray.push("<td rowspan ='" + rowSpanSize +"' style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.receivedAmount +"</b></td>");
								columnBillArray.push("<td rowspan ='" + rowSpanSize +"' style='text-align: center; vertical-align: middle;'><b style='font-size: 14px;'>" + billdetails.balanceAmount +"</b></td>");
							}

							$('#reportDetailsTable tbody').append('<tr>' + columnBillArray.join(' ') + '</tr>');
						}
					}

					var totalRow = createRowInTable('', '', '');
					var totalLabel = 'Total';

					var blankCol 			= createColumnInRow(totalRow, '', '', '', '', '', '7');
					var TotalCol 			= createColumnInRow(totalRow, '', '', '', 'center','font-weight: bold;color:#00FF00;font-size: 14px;','');
					var grandTotalCol		= createColumnInRow(totalRow, '', '', '', 'center','font-weight: bold;color:#00FF00;font-size: 14px;','');
					var receivedTotalCol	= createColumnInRow(totalRow, '', '', '', 'center', 'font-weight: bold;color:#00FF00;font-size: 14px;','');
					var balanceAmntCol		= createColumnInRow(totalRow, '', '', '', 'center', 'font-weight: bold;color:#00FF00;font-size: 14px;','');

					appendValueInTableCol(blankCol, '');
					appendValueInTableCol(TotalCol, totalLabel);
					appendValueInTableCol(grandTotalCol, grandTotal);
					appendValueInTableCol(receivedTotalCol, receivedAmt);
					appendValueInTableCol(balanceAmntCol, balanceAmt);

					appendRowInTable('reportDetailsTable', totalRow);
				}
			}

			var columnFooterArray	= [];

			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;color:#042BFF;font-size: 14px;'>All Total</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;color:#042BFF;font-size: 14px;'>" + partyWiseBillsStatusReport.grandTotal + "</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;color:#042BFF;font-size: 14px;'>" + partyWiseBillsStatusReport.receivedAmount + "</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;color:#042BFF;font-size: 14px;'>" + partyWiseBillsStatusReport.balanceAmount + "</td>");

			$('#reportDetailsTable tfoot').append('<tr>' + columnFooterArray.join(' ') + '</tr>');
			columnFooterArray = [];

			$('#middle-border-boxshadow').removeClass('hide');

			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailMobileNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPartyWiseBillsStatusReport = 'true';
			printTable(data, 'reportData', 'partyWiseBillStatusReport', 'Party Wise Bill Status', 'printPartyBillstatusReport');

			hideLayer();
		}
	});
});

function showHideDateSelection(ele) {
	selectTypeId 	= ele.value;

	if(selectTypeId == 0)
		$("#dateSelect").hide();
	else if(selectTypeId == 1)
		$("#dateSelect").show();
}