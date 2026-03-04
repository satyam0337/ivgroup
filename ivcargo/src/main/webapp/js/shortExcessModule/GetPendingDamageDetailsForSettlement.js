/**
 *  @Author	Shailesh Khandare	19-01-2016
 *  
 */

function getPendingDamageDetaislForSettlement() {
	//For avoid duplicate row of print put this line
	
	refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
	$('#printPendingShort tbody tr').remove();
	/*
	 * for configuratrion of date range is dispalying or not
	 * if date range is hidden then or not available then default date rage will be used
	 * from date - Thu Jan 01 2009 00:00:01 GMT+0530 (India Standard Time)
	 * to date - current data and time
	 * 
	 * else normal selected date will be used
	 */ 
	var isDateRangeDisplay	= false;
	
	var subRegion	= 0;
	var	branchId	= 0;
	var regionId	= 0;
	var count1 		= 0;
	
	if(!ValidateFormElement()){return false;};

	var fromDate	= null;
	var toDate		= null;
	
	if (isDateRangeDisplay) {
		fromDate	= $('#fromDate').val();
		toDate		= $('#toDate').val();
	} else {
		
		fromDate	= new Date();
		toDate		= new Date();
		
		fromDate.setDate(1);
		fromDate.setMonth(0);
		fromDate.setYear(2009);
		
		fromDate	= date(fromDate, '-');
		toDate		= date(toDate, '-');
	}

	showLayer();
	var jsonObjectOut;
	
	jsonObjectOut = new Object();
	
	jsonObjectOut.FromDate	= fromDate;
	jsonObjectOut.ToDate	= toDate;
	jsonObjectOut.RegionId	= $('#region').val();
	jsonObjectOut.SubRegion	= $('#subRegion').val();
	jsonObjectOut.BranchId	= $('#branch').val();
	
	var jsonStr	= JSON.stringify(jsonObjectOut);
	
	$.getJSON("getAllPendingDamageDetailsForSettlement.do?pageId=333&eventId=7&filter=2", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();				
			} else {
				hideAllMessages();
				
				var configuration		= data.configuration;
				
				/**
				 * Reset Tables
				 */
				if(count1 > 0){
					console.log("count "+count1);
					if(data.isDataTableAllow){
						var tableID = '#pendingShortSettlementList';
						resetTable(tableID,data);
					}
				}
				
				showPartOfPage('bottom-border-boxshadow');
				
				removeTableRows('pendingShortSettlementList', 'tbody');
				removeTableRows('pendingShortSettlementList', 'tfoot');
				
				//Please include this CommonPendingDamageDetailsForSettlement.js file to work this function
				commonDamageDetails(data, data.filter);
				
				var count	= $("#pendingShortSettlementList tbody tr").length;
				
				if(count > 0) {
					document.getElementById('pendingShortSettlementList').style.display = 'block';
				}
				
				/**
				 * Print Function for Pending Sort Details for Settlement Module
				 * printReport.js and printButton.css are included in
				 * PendingShortRegisterSettlement.jsp
				 */ 	
				
				data.isExcelButtonDisplay		= configuration.isExcelButtonDisplay;
				data.isLaserPrintAllow			= configuration.isLaserPrintAllow;
				data.isPlainPrintAllow			= configuration.isPlainPrintAllow;
				
				printTable(data, 'reportData', 'pendingDamageRegisterSettlement', '', 'printPendingDamage');
				
				/**
				 *Is datatables allowed or not  
				 *If yes datatables will apply on html table 
				 *isDataTableAllow fetched from properties file 
				 */
							
				if(configuration.isDataTableAllow) {
					var tableID = '#pendingShortSettlementList';
					setDataTableble(tableID, data);
				}
				
			}
		});
}
