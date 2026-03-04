/**
 * @Author Anant Chaudhary 23-10-2015
 */

function getAllExcessSettlementList() {
	
	var subRegion	= 0;
	var	branchId	= 0;
	var regionId	= 0;
	
	if(document.getElementById('region') != null) {
		if(!validateRegion(1, 'region')) return false;
	}
	
	if(document.getElementById('subRegion') != null) {
		if(!validateSubRegion(1, 'subRegion')) return false;
	}
	
	if(document.getElementById('branch') != null) {
		if(!validateBranch(6, 'branch')) return false;
	}

	var fromDate 	= document.getElementById('fromDate').value;
	var toDate 		= document.getElementById('toDate').value;
	
	if(document.getElementById('subRegion') != null) {
		subRegion	= document.getElementById('subRegion').value;
	}
	
	if(document.getElementById('branch') != null) {
		branchId	= document.getElementById('branch').value;
	}

	if(document.getElementById('region') != null) {
		regionId	= document.getElementById('region').value;
	}

	var jsonObject = new Object();
	var jsonObjectData;

	jsonObjectData = new Object();

	jsonObjectData.FromDate 	= fromDate;
	jsonObjectData.ToDate 		= toDate;
	jsonObjectData.SubRegion	= subRegion;
	jsonObjectData.BranchId		= branchId;
	jsonObjectData.RegionId		= regionId;

	jsonObject 	= jsonObjectData;

	var jsonStr = JSON.stringify(jsonObject);

	// alert(jsonStr);
	showLayer();

	$.getJSON("getAllExcessReceiveSettlementDetails.do?pageId=333&eventId=4",
				{json : jsonStr},
					function(data) {

						if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							hideLayer();
						} else {
							hideAllMessages();
							showPartOfPage('bottom-border-boxshadow');
							
							document.getElementById('regionVal').innerHTML		= data.selectedRegion;
							document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
							document.getElementById('branchName').innerHTML		= data.selectedBranch;
							document.getElementById('fromDateVal').innerHTML	= data.fromDate;
							document.getElementById('toDateVal').innerHTML		= data.toDate;

							//Please include CommonJsFunction.js file to work this
							removeTableRows('excessSettleReport', 'tbody');
							removeTableRows('printExcessSettlementReport', 'table');

							if (data.excSettlementReportsCall) {
								var excSettleReportData = data.excSettlementReportsCall;

								if (excSettleReportData.length > 0) {

									for (var i = 0; i < excSettleReportData.length; i++) {
										excSettleReport = excSettleReportData[i];

										var srNo 				= (i + 1);
										var wayBillNumber 		= excSettleReport.wayBillNumber;
										var wayBillId			= excSettleReport.wayBillId;
										var excessDate 			= excSettleReport.excessDate;
										var excessNumber 		= excSettleReport.excessNumber;
										var excessReceiveId		= excSettleReport.excessReceiveId;
										var excessBranch 		= excSettleReport.excessBranch;
										var excessUser 			= excSettleReport.excessUser;
										var settlementDate 		= excSettleReport.settlementDate;
										var settlementNumber 	= excSettleReport.settlementNumber;
										var settlementBranch 	= excSettleReport.settlementBranch;
										var settlementUser 		= excSettleReport.settlementUser;
										var settlementType 		= excSettleReport.settlementType;
										var remark 				= excSettleReport.remark;
										var shortNumber 		= null;
										var focLRWayBillId		= 0;
										var shortReceiveId 		= 0;

										var row 				= createRow('settlementNumber_'+(i+1), 'background-color: ');

										var srNoCol 				= createNewColumn(row,'srNo_'+(i+1), 'datatd', '', '', '', '');
										var wayBillNumberCol 		= createNewColumn(row,'wayBillNumber_'+(i+1), 'datatd', '','', 'background-color: #E6E6FA;', '');
										var excessDateCol 			= createNewColumn(row,'excessDate_'+(i+1), 'datatd', '','', '', '');
										var excessNumberCol 		= createNewColumn(row,'excessNumber_'+(i+1), 'datatd', '','', '', '');
										var excessBranchCol 		= createNewColumn(row,'excessBranch_'+(i+1), 'datatd', '','', '', '');
										var excessUserCol 			= createNewColumn(row,'excessUser_'+(i+1), 'datatd', '','', '', '');
										var settlementDateCol 		= createNewColumn(row,'settlementDate_'+(i+1), 'datatd', '', '', '','');
										var settlementNumberCol 	= createNewColumn(row,'settlementNumber_'+(i+1), 'datatd', '', '', '','');
										var settlementBranchCol 	= createNewColumn(row,'settlementBranch_'+(i+1), 'datatd', '', '', '','');
										var settlementUserCol 		= createNewColumn(row,'settlementUser_'+(i+1), 'datatd', '', '', '','');
										//var settlementTypeCol 		= createNewColumn(row,'settlementType_'+(i+1), 'datatd', '', '','display: none', '');
										var settlementTypeNameCol 	= null;

										$(srNoCol).append(srNo);
										
										if(wayBillNumber != '' && wayBillNumber != null) {
											$(wayBillNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+wayBillNumber+'</a>');
										} else {
											$(wayBillNumberCol).append('-----');
										}
										
										$(excessDateCol).append(excessDate);
										$(excessNumberCol).append('<a href="#" onmouseover="onMouseOverShowExcessArt('+excessReceiveId+')" onmouseout="onMouseOutHideExcessArt('+excessReceiveId+')" style="text-decoration: none;">' + excessNumber + '</a>');
										$(excessBranchCol).append(excessBranch);
										$(excessUserCol).append(excessUser);
										$(settlementDateCol).append(settlementDate);
										$(settlementNumberCol).append(settlementNumber);
										$(settlementBranchCol).append(settlementBranch);
										$(settlementUserCol).append(settlementUser);
										//$(settlementTypeCol).append(settlementType);
										
										var isSettlementTypeColumnDisplay	= data.isSettlementTypeColumnDisplay;
										var isShortArticleDetailsDisplay	= data.isShortArticleDetailsDisplay;
										var isExcessArticleDetailsDisplay	= data.isExcessArticleDetailsDisplay;
										
										if(isExcessArticleDetailsDisplay != 'true') {
											// Please include this GetExcessArticleDetails.js file to work this method
											excessArticleDetails(data, excessReceiveId);
										}

										if (settlementType == SETTLE_WITH_SHORT) {

											settlementTypeCol = createNewColumn(row, 'shortSetleType', 'datatd', '','', 'background-color: #4C98A6;', '');
											$(settlementTypeCol).append("Short");

										} else if (settlementType == SETTLE_WITH_FOCLR) {

											settlementTypeNameCol = createNewColumn(row, 'focSettleType', 'datatd', '','', 'background-color: #85CBE2;', '');
											$(settlementTypeNameCol).append('<font color="#000">FOC LR</font>');

										} else if (settlementType == SETTLE_WITH_UGD) {

											settlementTypeCol = createNewColumn(row, 'ugdSettleType', 'datatd', '','', 'background-color: #5A3ED6;', '');
											$(settlementTypeCol).append("UGD");

										}

										$("#excessSettleReport").append(row);

										if (settlementType == SETTLE_WITH_SHORT) {

											shortNumber 		= excSettleReport.shortNumber;
											shortReceiveId		= excSettleReport.shortReceiveId;

											var shortRow = createRow('shortRow_'+(i+1), '');
											
											var blankCol = createNewColumn(shortRow, 'blankCol_'+(i+1), 'datatd', '', '','', '2');
											var shortCol = createNewColumn(shortRow, 'shortCol_'+(i+1), 'datatd', '', '','', '9');

											$(blankCol).append();

											var shortTable = createTable('shortTable_'+shortReceiveId,'pure-table pure-table-bordered settleType','width: 100%');

											$(shortCol).append(shortTable);

											shortDetails(data, shortReceiveId, shortTable);

											if(isShortArticleDetailsDisplay != 'true') {
												//Please include this GetShortArticleDetails.js file to work this function
												shortArticleDetails(data, shortReceiveId);
											}

											$("#excessSettleReport").append(shortRow);
											
											var isShortSettlementDetailsDisplay		= data.isShortSettlementDetailsDisplay;
											
											if(isShortSettlementDetailsDisplay == 'true' || isSettlementTypeColumnDisplay == 'true') {
												document.getElementById('shortRow_'+(i+1)).style.display = 'none';
											}
											

										} else if (settlementType == SETTLE_WITH_FOCLR) {

											focLRWayBillId 		= excSettleReport.newFOCWayBillId;

											var focLrRow = createRow('focLrRow_'+(i+1), '');
											
											var blankCol = createNewColumn(focLrRow, 'blankCol_'+(i+1), 'datatd', '', '','', '2');
											var focLrCol = createNewColumn(focLrRow, 'focLrCol_'+(i+1), 'datatd', '', '','', '9');

											$(blankCol).append();

											var lrTable = createTable('','pure-table pure-table-bordered settleType','width: 100%');

											$(focLrCol).append(lrTable);

											getFOCLRDetails(data, focLRWayBillId, lrTable);

											$("#excessSettleReport").append(focLrRow);
											
											var isFOCLRSettlementDetailsDisplay		= data.isFOCLRSettlementDetailsDisplay;
											
											if(isFOCLRSettlementDetailsDisplay == 'true' || isSettlementTypeColumnDisplay == 'true') {
												document.getElementById('focLrRow_'+(i+1)).style.display = 'none';
											}

										} else if (settlementType == SETTLE_WITH_UGD) {

											var ugdRow 		= createRow('ugdRow_'+ (i + 1), '');
											
											var blankCol 	= createNewColumn(ugdRow,'', 'datatd', '', '', '', '2');
											var remarkCol 	= createNewColumn(ugdRow, '', 'datatd', '', '', '', '9');

											$(blankCol).append();

											var ugdTable = createTable('','pure-table pure-table-bordered settleType','width: 100%');

											$(remarkCol).append(ugdTable);

											udgDetails(remark, ugdTable, i);

											$("#excessSettleReport").append(ugdRow);
											
											var isUGDSettlementDetailsDisplay		= data.isUGDSettlementDetailsDisplay;
											
											if(isUGDSettlementDetailsDisplay == 'true' || isSettlementTypeColumnDisplay == 'true') {
												document.getElementById('ugdRow_'+(i+1)).style.display = 'none';
											}
										}
										
										var isLrNumberColumnDisplay				= data.isLrNumberColumnDisplay;
										var isExcessDateColumnDisplay			= data.isExcessDateColumnDisplay;
										var isExcessNumberColumnDisplay			= data.isExcessNumberColumnDisplay;
										var isExcessBranchColumnDisplay			= data.isExcessBranchColumnDisplay;
										var isExcessUserColumnDisplay			= data.isExcessUserColumnDisplay;
										var isSettlementDateColumnDisplay		= data.isSettlementDateColumnDisplay;
										var isSettlementNumberColumnDisplay		= data.isSettlementNumberColumnDisplay;
										var isSettlementBranchColumnDisplay		= data.isSettlementBranchColumnDisplay;
										var isSettlementUserColumnDisplay		= data.isSettlementUserColumnDisplay;
				
										if(isLrNumberColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(2)').hide();
											document.getElementById('wayBillNumber_'+(i+1)).style.display = 'none';
										}
										
										if(isExcessDateColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(3)').hide();
											document.getElementById('excessDate_'+(i+1)).style.display = 'none';
										}
										
										if(isExcessNumberColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(4)').hide();
											document.getElementById('excessNumber_'+(i+1)).style.display = 'none';
										}
										
										if(isExcessBranchColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(5)').hide();
											document.getElementById('excessBranch_'+(i+1)).style.display = 'none';
										}
										
										if(isExcessUserColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(6)').hide();
											document.getElementById('excessUser_'+(i+1)).style.display = 'none';
										}
										
										if(isSettlementDateColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(7)').hide();
											document.getElementById('settlementDate_'+(i+1)).style.display = 'none';
										}
										
										if(isSettlementNumberColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(8)').hide();
											document.getElementById('settlementNumber_'+(i+1)).style.display = 'none';
										}
										
										if(isSettlementBranchColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(9)').hide();
											document.getElementById('settlementBranch_'+(i+1)).style.display = 'none';
										}
										
										if(isSettlementUserColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(10)').hide();
											document.getElementById('settlementUser_'+(i+1)).style.display = 'none';
										}
										
										if(isSettlementTypeColumnDisplay == 'true') {
											$('#excessSettleReport th:nth-child(11)').hide();
											$('#excessSettleReport td:nth-child(12)').hide();
											document.getElementById('settlementType_'+(i+1)).style.display = 'none';
										}
									}

								}

								printTable(data, 'reportData', 'excessRegisterSettlementReport', 'Excess Settlement Register Summary', 'printExcessSettlementReport');
								
								document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
								hideLayer();
							}
						}
					});
}

function shortDetails(data, shortReceiveId, table) {

	if (data.shortReceiveHMCall) {
		var shm = data.shortReceiveHMCall;

		if (shm.hasOwnProperty(shortReceiveId)) {
			var list = shm[shortReceiveId];

			for (var i = 0; i < list.length; i++) {
				var shortDetails = list[i];

				var shortNumber 	= shortDetails.shortNumber;
				var shortDate 		= shortDetails.shortDate;
				var shortBranch 	= shortDetails.branchName;
				var shortUser 		= shortDetails.userName;

				var shortRow 				= createRow('shortRow_' + (i + 1), '');

				var shortDateNameCol 		= createNewColumn(shortRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var shortDateValueCol 		= createNewColumn(shortRow, '', 'datatd', '90px', '', 'background-color: #FFFFFF','');
				var shortNumberNameCol 		= createNewColumn(shortRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var shortNumberValueCol 	= createNewColumn(shortRow, '', 'datatd', '', '','background-color: #FFFFFF', '');
				var shortBranchNameCol 		= createNewColumn(shortRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var shortBranchValueCol 	= createNewColumn(shortRow, '', 'datatd', '', '','background-color: #FFFFFF', '');
				var shortUserNameCol 		= createNewColumn(shortRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var shortUserValueCol 		= createNewColumn(shortRow, '', 'datatd', '', '', 'background-color: #FFFFFF','');

				$(shortDateNameCol).append('Short Date');
				$(shortDateValueCol).append(shortDate);
				$(shortNumberNameCol).append('Short Number');
				$(shortNumberValueCol).append('<a href="#" onmouseover="onMouseOverDisplayShortArt('+shortReceiveId+')" onmouseout="onMouseOutHideShortArt('+shortReceiveId+')" style="text-decoration: none;">'+ shortNumber+ '</a>');
				$(shortBranchNameCol).append('Short Branch');
				$(shortBranchValueCol).append(shortBranch);
				$(shortUserNameCol).append('Short User');
				$(shortUserValueCol).append(shortUser);

				$(table).append(shortRow);
			}
		}
	}
}

function udgDetails(remark, ugdTable, i) {

	var ugdResultRow 	= createRow('ugdResultRow_' + (i + 1), '');

	var remarkNameCol 	= createNewColumn(ugdResultRow, '', 'datatd', '200px', '','font-weight: bold', '');
	var remarkValueCol 	= createNewColumn(ugdResultRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');

	$(remarkNameCol).append('<font color="black">Remark</font>');
	$(remarkValueCol).append(remark);

	$(ugdTable).append(ugdResultRow);
}

function getFOCLRDetails(data, focLRWayBillId, table) {

	if (data.focLRJsHMCall) {
		var foclr = data.focLRJsHMCall;

		if (foclr.hasOwnProperty(focLRWayBillId)) {
			var foclist = foclr[focLRWayBillId];

			for (var i = 0; i < foclist.length; i++) {
				var focDetails = foclist[i];

				var bookedDate 	= focDetails.bookedDate;
				var branchName 	= focDetails.branchName;
				var userName 	= focDetails.userName;
				var focLRNumber = focDetails.focLRNumber;
				var wayBillId	= focDetails.wayBillId;

				var focRow 				= createRow('focLR_' + (i + 1), '');

				var bookedDateNameCol 	= createNewColumn(focRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var bookedDateCol 		= createNewColumn(focRow, '', 'datatd', '90px', '', 'background-color: #FFFFFF', '');
				var branchNameCol 		= createNewColumn(focRow, '', 'datatd', '90px', '','font-weight: bold', '');
				var branchValueCol		= createNewColumn(focRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var userNameCol 		= createNewColumn(focRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var userNameValueCol 	= createNewColumn(focRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var lrNumberNameCol 	= createNewColumn(focRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var lrNumberValueCol 	= createNewColumn(focRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');

				$(bookedDateNameCol).append('Booked Date');
				$(bookedDateCol).append(bookedDate);
				$(branchNameCol).append('Booking Branch');
				$(branchValueCol).append(branchName);
				$(userNameCol).append('Booked User');
				$(userNameValueCol).append(userName);
				$(lrNumberNameCol).append('LR Number');
				$(lrNumberValueCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+focLRNumber+'</a>');

				$(table).append(focRow);
			}
		}
	}
}

function onMouseOverDisplayShortArt(shortNumber) {
	document.getElementById('shArticle_'+shortNumber).style.display = "table";
}

function onMouseOutHideShortArt(shortNumber) {
	document.getElementById('shArticle_'+shortNumber).style.display = "none";
}

function onMouseOverShowExcessArt(excessNumber) {
	document.getElementById('exArticle_'+excessNumber).style.display = "table";
}

function onMouseOutHideExcessArt(excessNumber) {
	document.getElementById('exArticle_'+excessNumber).style.display = "none";
}