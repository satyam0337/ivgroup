/**
 *  @Author	Anant Chaudhary	28-10-2015
 *  @MOdified Shailesh Khandare 12-01-2016
 */

function getPendingShortDetaislForSettlement() {
	//For avoid duplicate row of print put this line
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
	
	if(!ValidateFormElement()){return false;};

	var fromDate	= null;
	var toDate		= null;
	
	if (isDateRangeDisplay) {
		fromDate	= document.getElementById('fromDate').value;
		toDate		= document.getElementById('toDate').value;
	} else {
		
		fromDate	= new Date();
		toDate		= new Date();
		
		fromDate.setDate(1);
		fromDate.setMonth(0);
		fromDate.setYear(2009);
		
		fromDate	= date(fromDate, '-');
		toDate		= date(toDate, '-');
	}
	
	
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
	
	$.getJSON("getAllPendingShortDetailsForSettlement.do?pageId=333&eventId=5&filter=2", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();				
			} else {
				hideAllMessages();
				showPartOfPage('bottom-border-boxshadow');
				
				var configuration	= data.configuration;
				
				getShortProperties();
				getDamageProperties();
				getExcessFieldProperties();
				
				if(configuration.isDataTableAllow){
					var tableID = '#pendingShortSettlementList';
					resetTable(tableID);
				}
				removeTableRows('pendingShortSettlementList', 'tbody');
				removeTableRows('pendingShortSettlementList', 'tfoot');
				
				//Please include this CommonPendingShortDetailsForSettlement.js file to work this function
				commonShortDetails(data, data.filter);
				
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
				
				printTable(data, 'reportData', 'pendingShortRegisterSettlement', '', 'printPendingShort');
				
				/**
				 *Is datatables allowed or not  
				 *If yes datatables will apply on html table 
				 *isDataTableAllow fetched from properties file 
				 */
				if(configuration.isDataTableAllow) {
					var tableID = '#pendingShortSettlementList';
					
					setDataTableble(tableID,data);
				}
			}
		});
}
