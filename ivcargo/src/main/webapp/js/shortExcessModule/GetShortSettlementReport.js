/**
 * @Author	Anant Chaudhary	16-10-2015
 */

function getAllShortSettlementList() {
	
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
	
	var fromDate	= document.getElementById('fromDate').value;
	var toDate		= document.getElementById('toDate').value;
	
	if(document.getElementById('subRegion') != null) {
		subRegion	= document.getElementById('subRegion').value;
	}
	
	if(document.getElementById('branch') != null) {
		branchId	= document.getElementById('branch').value;
	}

	if(document.getElementById('region') != null) {
		regionId	= document.getElementById('region').value;
	}
	
	var jsonObject 	= new Object();
	var jsonObjectData;
	
	jsonObjectData = new Object();
	
	jsonObjectData.FromDate		= fromDate;
	jsonObjectData.ToDate		= toDate;
	jsonObjectData.SubRegion	= subRegion;
	jsonObjectData.BranchId		= branchId;
	jsonObjectData.RegionId		= regionId;
	
	jsonObject	= jsonObjectData;
	
	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);
	showLayer();
	$.getJSON("getAllShortReceiveSettlementDetails.do?pageId=333&eventId=3", 
			{json:jsonStr}, function(data) {

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
					removeTableRows('shortSettleReport', 'tbody');
					removeTableRows('printShortSettlementReport', 'table');

					if (data.shSettlementReportCall) {

						var shoSettleReportData = data.shSettlementReportCall;

						if (shoSettleReportData.length > 0) {

							for (var i = 0; i < shoSettleReportData.length; i++) {
								shoSettleReport = shoSettleReportData[i];

								var srNo 				= (i + 1);
								var wayBillNumber 		= shoSettleReport.wayBillNumber;
								var wayBillId			= shoSettleReport.wayBillId;
								var shortDate 			= shoSettleReport.shortDate;
								var shortNumber 		= shoSettleReport.shortNumber;
								var shortBranch 		= shoSettleReport.shortBranch;
								var shortUser 			= shoSettleReport.shortUser;
								var settlementDate 		= shoSettleReport.shortSettleDate;
								var settlementNumber 	= shoSettleReport.settlementNumber;
								var settlementBranch 	= shoSettleReport.settlementBranch;
								var settlementUser 		= shoSettleReport.settlementUser;
								var settlementType 		= shoSettleReport.settlementType;
								var remark 				= shoSettleReport.remark;
								var excessNumber 		= null;
								var claimNumber			= null;
								var shortReceiveId 		= shoSettleReport.shortReceiveId;
								var excessReceiveId		= 0;

								var row 				= createRow('settlementNumber_'+settlementNumber, '');

								var srNoCol 				= createNewColumn(row,'srNo_'+(i+1), 'datatd', '', '', '', '');
								var wayBillNumberCol 		= createNewColumn(row,'wayBillNumber_'+(i+1), 'datatd', '','', 'background-color: #E6E6FA;', '');
								var shortDateCol 			= createNewColumn(row,'shortDate_'+(i+1), 'datatd', '','', '', '');
								var shortNumberCol 			= createNewColumn(row,'shortNumber_'+(i+1), 'datatd', '','', '', '');
								var shortBranchCol 			= createNewColumn(row,'shortBranch_'+(i+1), 'datatd', '','', '', '');
								var shortUserCol 			= createNewColumn(row,'shortUser_'+(i+1), 'datatd', '','', '', '');
								var settlementDateCol 		= createNewColumn(row,'settlementDate_'+(i+1), 'datatd', '', '', '','');
								var settlementNumberCol 	= createNewColumn(row,'settlementNumber_'+(i+1), 'datatd', '', '', '','');
								var settlementBranchCol 	= createNewColumn(row,'settlementBranch_'+(i+1), 'datatd', '', '', '','');
								var settlementUserCol 		= createNewColumn(row,'settlementUser_'+(i+1), 'datatd', '', '', '','');
								//var settlementTypeCol 		= createColumn(row,'settlementType_'+(i+1), 'datatd', '', '','display: none', '');
								var settlementTypeNameCol 	= null;

								$(srNoCol).append(srNo);
								$(wayBillNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+wayBillNumber+'</a>');
								$(shortDateCol).append(shortDate);
								$(shortNumberCol).append('<a href="#" onmouseover="onMouseOverDisplayShortArt('+shortReceiveId+')" onmouseout="onMouseOutHideShortArt('+shortReceiveId+')">'+ shortNumber+ '</a>');
								$(shortBranchCol).append(shortBranch);
								$(shortUserCol).append(shortUser);
								$(settlementDateCol).append(settlementDate);
								$(settlementNumberCol).append(settlementNumber);
								$(settlementBranchCol).append(settlementBranch);
								$(settlementUserCol).append(settlementUser);
								//$(settlementTypeCol).append(settlementType);
								
								var isSettlementTypeColumnDisplay	= data.isSettlementTypeColumnDisplay;
								var isShortArticleDetailsDisplay	= data.isShortArticleDetailsDisplay;
								var isExcessArticleDetailsDisplay	= data.isExcessArticleDetailsDisplay;

								if(isShortArticleDetailsDisplay != 'true') {
									
									//Please include this GetShortArticleDetails.js file to work this function
									shortArticleDetails(data, shortReceiveId);
								}

								if (settlementType == SETTLE_WITH_EXCESS) {

									settlementTypeCol = createNewColumn(row, 'excessSetleType', 'datatd', '','', 'background-color: #4C98A6;', '');
									$(settlementTypeCol).append("Excess");

								} else if (settlementType == SETTLE_WITH_CLAIM) {

									settlementTypeNameCol = createNewColumn(row, 'claimSettleType', 'datatd', '','', 'background-color: #85CBE2;', '');
									$(settlementTypeNameCol).append("Claim");

								} else if (settlementType == SETTLE_WITH_NOCLAIM) {

									settlementTypeNameCol = createNewColumn(row, 'noClaimSettleType', 'datatd', '','', 'background-color: #5A3ED6;', '');
									$(settlementTypeNameCol).append("No Claim");

								}

								$("#shortSettleReport").append(row);
								
								if (settlementType == SETTLE_WITH_EXCESS) {

									excessNumber 	= shoSettleReport.excessNumber;
									excessReceiveId = shoSettleReport.excessReceiveId;

									var excessRow 	= createRow('excessRow_'+(i+1), '');

									var blankCol 	= createNewColumn(excessRow, 'blankCol_'+(i+1), 'datatd', '', '','', '2');
									var excessCol 	= createNewColumn(excessRow, 'shortCol_'+(i+1), 'datatd', '', '','', '9');

									$(blankCol).append();

									var excessTable = createTable('excessTable_'+excessReceiveId,'pure-table pure-table-bordered settleType','width: 100%');

									$(excessCol).append(excessTable);

									excessDetails(data, excessReceiveId, excessTable);
									
									if(isExcessArticleDetailsDisplay != 'true') {
										//Please include this GetExcessArticleDetails.js file to work this function
										excessArticleDetails(data, excessReceiveId);
									}

									$("#shortSettleReport").append(excessRow);

									var isExcessSettlementDetailsDisplay		= data.isExcessSettlementDetailsDisplay;

									if(isExcessSettlementDetailsDisplay == 'true' || isSettlementTypeColumnDisplay == 'true') {
										document.getElementById('excessRow_'+(i+1)).style.display = 'none';
									}

								} else if (settlementType == SETTLE_WITH_CLAIM) {

									claimNumber = shoSettleReport.claimNumber;

									var claimRow = createRow('claimRow_'+(i+1), '');

									var blankCol = createNewColumn(claimRow, 'blankCol_'+(i+1), 'datatd', '', '','', '2');
									var claimCol = createNewColumn(claimRow, 'claimCol_'+(i+1), 'datatd', '', '','', '9');

									$(blankCol).append();

									var claimTable = createTable('claimTable_'+claimNumber,'pure-table pure-table-bordered settleType','width: 100%');

									$(claimCol).append(claimTable);

									getClaimDetails(data, claimNumber, claimTable);

									$("#shortSettleReport").append(claimRow);

									var isClaimSettlementDetailsDisplay 		= data.isClaimSettlementDetailsDisplay ;

									if(isClaimSettlementDetailsDisplay == 'true' || isClaimSettlementDetailsDisplay == 'true') {
										document.getElementById('claimRow_'+(i+1)).style.display = 'none';
									}

								} else if (settlementType == SETTLE_WITH_NOCLAIM) {

									var noClaimRow 		= createRow('noClaimRow_'+(i+1), '');

									var blankCol 	= createNewColumn(noClaimRow,'', 'datatd', '', '', '', '2');
									var remarkCol 	= createNewColumn(noClaimRow, '', 'datatd', '', '', '', '9');

									$(blankCol).append();

									var noClaimTable = createTable('noClaimTable_'+(i+1),'pure-table pure-table-bordered settleType','width: 100%');

									$(remarkCol).append(noClaimTable);

									noClaimDetails(remark, noClaimTable, i);

									$("#shortSettleReport").append(noClaimRow);

									var isNoclaimSettlementDetailsDisplay		= data.isNoclaimSettlementDetailsDisplay;

									if(isNoclaimSettlementDetailsDisplay == 'true' || isSettlementTypeColumnDisplay == 'true') {
										document.getElementById('noClaimRow_'+(i+1)).style.display = 'none';
									}
								}
								
								var isLrNumberColumnDisplay				= data.isLrNumberColumnDisplay;
								var isShortDateColumnDisplay			= data.isShortDateColumnDisplay;
								var isShortBranchColumnDisplay			= data.isShortBranchColumnDisplay;
								var isShortNumberColumnDisplay			= data.isShortNumberColumnDisplay;
								var isShortUserColumnDisplay			= data.isShortUserColumnDisplay;
								var isSettlementDateColumnDisplay		= data.isSettlementDateColumnDisplay;
								var isSettlementNumberColumnDisplay		= data.isSettlementNumberColumnDisplay;
								var isSettlementBranchColumnDisplay		= data.isSettlementBranchColumnDisplay;
								var isSettlementUserColumnDisplay		= data.isSettlementUserColumnDisplay;
		
								if(isLrNumberColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(2)').hide();
									document.getElementById('wayBillNumber_'+(i+1)).style.display = 'none';
								}
								
								if(isShortDateColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(3)').hide();
									document.getElementById('shortDate_'+(i+1)).style.display = 'none';
								}
								
								if(isShortNumberColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(4)').hide();
									document.getElementById('shortNumber_'+(i+1)).style.display = 'none';
								}
								
								if(isShortBranchColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(5)').hide();
									document.getElementById('shortBranch_'+(i+1)).style.display = 'none';
								}
								
								if(isShortUserColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(6)').hide();
									document.getElementById('shortUser_'+(i+1)).style.display = 'none';
								}
								
								if(isSettlementDateColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(7)').hide();
									document.getElementById('settlementDate_'+(i+1)).style.display = 'none';
								}
								
								if(isSettlementNumberColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(8)').hide();
									document.getElementById('settlementNumber_'+(i+1)).style.display = 'none';
								}
								
								if(isSettlementBranchColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(9)').hide();
									document.getElementById('settlementBranch_'+(i+1)).style.display = 'none';
								}
								
								if(isSettlementUserColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(10)').hide();
									document.getElementById('settlementUser_'+(i+1)).style.display = 'none';
								}
								
								if(isSettlementTypeColumnDisplay == 'true') {
									$('#shortSettleReport th:nth-child(11)').hide();
									$('#shortSettleReport td:nth-child(12)').hide();
									document.getElementById('settlementType_'+(i+1)).style.display = 'none';
								}
							}

						}
						
						printTable(data, 'reportData', 'shortRegisterSettlementReport', 'Short Register Settlement Summary', 'printShortSettlementReport');

						document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
						hideLayer();
					}
				}
			});
}

function excessDetails(data, excessReceiveId, table) {

	if (data.excessReceiveHMCall) {
		var exhm = data.excessReceiveHMCall;
		
		if (exhm.hasOwnProperty(excessReceiveId)) {
			var list = exhm[excessReceiveId];
		
			for (var i = 0; i < list.length; i++) {
				var excessDetails = list[i];
		
				var excessDate 		= excessDetails.excessDate;
				var excessBranch 	= excessDetails.branchName;
				var excessUser 		= excessDetails.userName;
				var excessNumber 	= excessDetails.excessNumber;

				var excessRow 				= createRow('excessArtRow_'+excessReceiveId, '');
		
				var excessDateNameCol 		= createNewColumn(excessRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var excessDateValueCol 		= createNewColumn(excessRow, '', 'datatd', '80px', '', 'background-color: #FFFFFF','');
				var excessNumberNameCol 	= createNewColumn(excessRow, '', 'datatd', '100px', '','font-weight: bold', '');
				var excessNumberValueCol 	= createNewColumn(excessRow, '', 'datatd', '', '','background-color: #FFFFFF', '');
				var excessBranchNameCol 	= createNewColumn(excessRow, '', 'datatd', '100px', '','font-weight: bold', '');
				var excessBranchValueCol 	= createNewColumn(excessRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var excessUserNameCol 		= createNewColumn(excessRow, '', 'datatd', '100px', '','font-weight: bold', '');
				var excessUserValueCol 		= createNewColumn(excessRow, '', 'datatd', '', '', 'background-color: #FFFFFF','');
		
				$(excessDateNameCol).append('Excess Date');
				$(excessDateValueCol).append(excessDate);
				$(excessNumberNameCol).append('Excess Number');
				$(excessNumberValueCol).append('<a href="#" onmouseover="onMouseOverShowExcessArt('+excessReceiveId+')" onmouseout="onMouseOutHideExcessArt('+excessReceiveId+')">' + excessNumber + '</a>');
				$(excessBranchNameCol).append('Excess Branch');
				$(excessBranchValueCol).append(excessBranch);
				$(excessUserNameCol).append('Excess User');
				$(excessUserValueCol).append(excessUser);

				$(table).append(excessRow);
			}
		}
	}
}
	
function noClaimDetails(remark, noClaimTable, i) {
	
	var noClaimResultRow 	= createRow('noClaimResultRow_'+(i+1), '');
	
	var remarkNameCol 	= createNewColumn(noClaimResultRow, '', 'datatd', '200px', '','font-weight: bold', '');
	var remarkValueCol 	= createNewColumn(noClaimResultRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
	
	$(remarkNameCol).append('<font color="black">Remark</font>');
	$(remarkValueCol).append(remark);
	
	$(noClaimTable).append(noClaimResultRow);
}
	

function getClaimDetails(data, claimNumber, table) {
	
	if(data.claimEntryHMCall) {
		var claimEntry = data.claimEntryHMCall;
		
		if (claimEntry.hasOwnProperty(claimNumber)) {
			var claimlist = claimEntry[claimNumber];
		
			for (var i = 0; i < claimlist.length; i++) {
				var claimDetails = claimlist[i];
		
				var claimNumber 	= claimDetails.claimEntryId;
				var lounchBy 		= claimDetails.lounchByName;
				var claimAmount		= claimDetails.claimAmount;
				var claimPersonName	= claimDetails.claimPersonName;
				var claimEntryDate	= claimDetails.claimEntryDate;
		
				var claimRow 				= createRow('claim_'+(i+1), '');
		
				var claimNumberNameCol 		= createNewColumn(claimRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var claimNumberValueCol 	= createNewColumn(claimRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var lounchByNameCol 		= createNewColumn(claimRow, '', 'datatd', '90px', '','font-weight: bold', '');
				var lounchByValueCol		= createNewColumn(claimRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var claimAmountNameCol 		= createNewColumn(claimRow, '', 'datatd', '80px', '','font-weight: bold', '');
				var claimAmountValueCol 	= createNewColumn(claimRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var claimPersonNameCol 		= createNewColumn(claimRow, '', 'datatd', '120px', '','font-weight: bold', '');
				var claimPersonNameValueCol = createNewColumn(claimRow, '', 'datatd', '', '', 'background-color: #FFFFFF', '');
				var claimEntryDateCol 		= createNewColumn(claimRow, '', 'datatd', '', '','display: none', '');
				var claimEntryDateValueCol 	= createNewColumn(claimRow, '', 'datatd', '', '','display: none', '');
		
				$(claimNumberNameCol).append('Claim Number');
				$(claimNumberValueCol).append(claimNumber);
				$(lounchByNameCol).append('Lounch By');
				$(lounchByValueCol).append(lounchBy);
				$(claimAmountNameCol).append('Claim Amount');
				$(claimAmountValueCol).append(claimAmount);
				$(claimPersonNameCol).append('Claim Person Name');
				$(claimPersonNameValueCol).append(claimPersonName);
				$(claimEntryDateCol).append('Claim Date');
				$(claimEntryDateValueCol).append(claimEntryDate);
		
				$(table).append(claimRow);
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