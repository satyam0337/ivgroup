/**
 *  @Author	Shailesh Khandsare 21-01-2016
 */

function getPendingDamageSettlementRegisterReport() {
	
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

	showLayer();
	var jsonObject 	= new Object();
	var jsonObjectOut;
	
	jsonObjectOut = new Object();
	
	jsonObjectOut.FromDate	= fromDate;
	jsonObjectOut.ToDate	= toDate;
	jsonObjectOut.RegionId	= regionId;
	jsonObjectOut.SubRegion	= subRegion;
	jsonObjectOut.BranchId	= branchId;
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);

	$.getJSON("getAllPendingDamageDetailsForSettlement.do?pageId=333&eventId=7&filter=1", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();
			} else {
				hideAllMessages();
				showPartOfPage('bottom-border-boxshadow');
				
				var configuration		= data.configuration;
				
				document.getElementById('regionVal').innerHTML		= data.selectedRegion;
				document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
				document.getElementById('branchName').innerHTML		= data.selectedBranch;
				document.getElementById('fromDateVal').innerHTML	= data.fromDate;
				document.getElementById('toDateVal').innerHTML		= data.toDate;
				
				removeTableRows('pendingDamageSettlementList', 'tbody');
				removeTableRows('pendingDamageSettlementList', 'tfoot');
				removeTableRows('printPendingDamageReport', 'table');
				
				//Please include this CommonPendingShortDetailsForSettlement.js file to work this function
				commonDamageDetails(data, data.filter);
				
				data.isExcelButtonDisplay		= configuration.isExcelButtonDisplay;
				data.isLaserPrintAllow			= configuration.isLaserPrintAllow;
				data.isPlainPrintAllow			= configuration.isPlainPrintAllow;
				
				printTable(data, 'reportData', 'pendingDamageRegisterSettlementReport', 'Pending Damage Settlement Register Summary', 'printPendingDamageReport');
				
				document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
			}
		});
}