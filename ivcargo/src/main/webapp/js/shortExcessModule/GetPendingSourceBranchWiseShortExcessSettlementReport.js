/**
 *  @Author	Shailesh Khandare	10-02-2016
 */

function selectionpannel(){
	refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
	refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
	
	if(Number($("#searchType").val()) == 1) {
		setTimeout(function() {
			getSourceBranchWisePendingShortSettlementRegisterReport();
		}, 500);
	} else {
		setTimeout(function() {
			getSourceBranchWisePendingExcessSettlementRegisterReport();
		}, 500);
	}
}

function getSourceBranchWisePendingShortSettlementRegisterReport() {
	
	//if(!ValidateFormElement()){return false;};

	var jsonObjectOut = new Object();
	
	objectToData(jsonObjectOut);
	
	var jsonStr	= JSON.stringify(jsonObjectOut);

	showLayer();
	$.getJSON("PendingSourceBranchwiseShortExcessSettlementReportAction.do?pageId=333&eventId=10&filter=1", 
			{json:jsonStr}, function(data) {
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();
			} else {
				hideAllMessages();
				showPartOfPage('middle-border-boxshadow');
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				
				var configuration	= data.configuration;
				document.getElementById('regionVal').innerHTML		= data.selectedRegion;
				document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
				document.getElementById('branchName').innerHTML		= data.selectedBranch;
				
				if(document.getElementById('viewAllCheck') != null && document.getElementById('viewAllCheck').checked){
					document.getElementById('fromDateVal').innerHTML	= '--';
					document.getElementById('toDateVal').innerHTML	= '--';
				}else{
					document.getElementById('fromDateVal').innerHTML	= data.fromDate;
					document.getElementById('toDateVal').innerHTML		= data.toDate;
				}
				$('#searchType').val(data.selectType);
				
				dataTableId = 'pendingShortSettlementList';
				
				removeTableRows('pendingShortSettlementList', 'tbody');
				removeTableRows('pendingShortSettlementList', 'tfoot');
				removeTableRows('printPendingShortReport', 'table');
				
				//Please include this CommonPendingShortDetailsForSettlement.js file to work this function
				commonShortDetails(data, data.filter);
				
				data.isExcelButtonDisplay		= configuration.isExcelButtonDisplay;
				data.isLaserPrintAllow			= configuration.isLaserPrintAllow;
				data.isPlainPrintAllow			= configuration.isPlainPrintAllow;
				
				$('#reportData').attr('id', 'reportExcessData');
				$('#reportShortData').attr('id', 'reportData');

				printTable(data, 'reportData', 'pendingShortRegisterSettlementReport', 'Pending Short Settlement Register Summary', 'printPendingShortReport');
				
				document.getElementById('middle-border-boxshadow').style.visibility = 'visible';
				
				hideLayer();
			}
		});
}


function getSourceBranchWisePendingExcessSettlementRegisterReport() {
	//if(!ValidateFormElement()){return false;};

	var jsonObjectOut = new Object();
	
	objectToData(jsonObjectOut);
	
	var jsonStr	= JSON.stringify(jsonObjectOut);
	
	showLayer();
	$.getJSON("getAllPendingExcessDetailsForSettlement.do?pageId=333&eventId=10&filter=2", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
				hideLayer();
			} else {
				hideAllMessages();
				showPartOfPage('bottom-border-boxshadow');
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
				
				var configuration		= data.configuration;
				
				document.getElementById('regionValExcess').innerHTML		= data.selectedRegion;
				document.getElementById('areaValExcess').innerHTML			= data.selectedSubRegion;
				document.getElementById('branchNameExcess').innerHTML		= data.selectedBranch;
			
				if(document.getElementById('viewAllCheck') != null && document.getElementById('viewAllCheck').checked){
					document.getElementById('fromDateValExcess').innerHTML	= '--';
					document.getElementById('toDateValExcess').innerHTML	= '--';
				}else{
					document.getElementById('fromDateValExcess').innerHTML	= data.fromDate;
					document.getElementById('toDateValExcess').innerHTML	= data.toDate;
				}
				
				dataTableId = 'pendingExcessSettlementList';
				
				removeTableRows('pendingExcessSettlementList', 'tbody');
				removeTableRows('pendingExcessSettlementList', 'tfoot');
				removeTableRows('printPendingExcessReport', 'table');
			
				//Please include this CommonPendingExcessDetailsForSettlement.js file to work this function
				commonExcessDetails(data, data.filter);

				data.isExcelButtonDisplay		= configuration.isExcelButtonDisplay;
				data.isLaserPrintAllow			= configuration.isLaserPrintAllow;
				data.isPlainPrintAllow			= configuration.isPlainPrintAllow;
				
				$('#reportData').attr('id', 'reportShortData');
				$('#reportExcessData').attr('id', 'reportData');
				
				printTable(data, 'reportData', 'pendingShortRegisterSettlementReport', 'Pending Excess Settlement Register Summary', 'printPendingExcessReport');
				document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
				
				hideLayer();
			}
			
		});
}

function objectToData(jsonObjectOut) {
	var subRegion	= 0;
	var	branchId	= 0;
	var regionId	= 0;
	var selectType	= 0;
	var branchType	= 0;
	
	var fromDate	= document.getElementById('fromDate').value;
	var toDate		= document.getElementById('toDate').value;
	var viewAll		= $('#viewAllCheck').prop("checked");
	
	if(document.getElementById('subRegion') != null) {
		subRegion	= document.getElementById('subRegion').value;
	}
	
	if(document.getElementById('branch') != null) {
		branchId	= document.getElementById('branch').value;
	}
	
	if(document.getElementById('region') != null) {
		regionId	= document.getElementById('region').value;
	}
	
	if(document.getElementById('searchType') != null) {
		selectType	= document.getElementById('searchType').value;
	}
	branchType	= $('#branchType').val();
	
	jsonObjectOut.FromDate	 = fromDate;
	jsonObjectOut.ToDate	 = toDate;
	jsonObjectOut.RegionId	 = regionId;
	jsonObjectOut.SubRegion	 = subRegion;
	jsonObjectOut.BranchId	 = branchId;
	jsonObjectOut.SelectType = selectType;
	jsonObjectOut.branchType = branchType;
	jsonObjectOut.viewAll 	 = viewAll;
}
