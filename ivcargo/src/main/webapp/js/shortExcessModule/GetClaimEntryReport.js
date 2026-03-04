/**
 * @Author	Anant Chaudhary	27-10-2015
 */

function getAllClaimEntries() {
	
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
	jsonObjectOut.SubRegion	= subRegion;
	jsonObjectOut.BranchId	= branchId;
	jsonObjectOut.RegionId	= regionId;
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);
	
	$.getJSON("getAllClaimEntries.do?pageId=335&eventId=2", 
			{json:jsonStr}, function(data) {
		
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
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
					let configuration	= data.configuration;
					
					var isClaimNumberColumnDisplay		= configuration.isClaimNumberColumnDisplay;
					var isLrNumberColumnDisplay			= configuration.isLrNumberColumnDisplay;
					var isLounchByColumnDisplay			= configuration.isLounchByColumnDisplay;
					var isClaimAmountColumnDisplay		= configuration.isClaimAmountColumnDisplay;	
					var isClaimPersonNameColumnDisplay	= configuration.isClaimPersonNameColumnDisplay;
					var isClaimDateColumnDisplay		= configuration.isClaimDateColumnDisplay;
					var isRemarkColumnDisplay			= configuration.isRemarkColumnDisplay;
					
					removeTableRows('claimEntryDetails', 'tbody');
					removeTableRows('printClaimReport', 'table');

					if(data.claimEntriesCall) {
						var claimDetails	= data.claimEntriesCall;
						
						if(claimDetails.length > 0) {
							for(var i = 0; i < claimDetails.length; i++) {
								var claimEntry	= claimDetails[i];
								
								var srNo			= (i+1);
								
								var claimEntryId	= claimEntry.claimEntryId;								
								var wayBillNumber	= claimEntry.wayBillNumber;
								var wayBillId		= claimEntry.wayBillId;
								var lounchBy		= claimEntry.lounchByName;
								var claimAmount		= claimEntry.claimAmount;
								var claimPersonName	= claimEntry.claimPersonName;
								var claimDate		= claimEntry.claimEntryDate;
								var remark			= claimEntry.remark;
								
								var claimRow			= createRow('claimEntry_'+(i+1), '');
								
								var srNoCol				= createNewColumn(claimRow, 'srNo_'+(i+1), 'datatd', '', '', '', '');
								var claimEntryIdCol		= createNewColumn(claimRow, 'claimEntryId_'+(i+1), 'datatd','', '', '', '');
								var wayBillNumberCol	= createNewColumn(claimRow, 'wayBillNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
								var lounchByCol			= createNewColumn(claimRow, 'lounchBy_'+(i+1), 'datatd', '', '', '', '');
								var claimAmountCol		= createNewColumn(claimRow, 'claimAmount_'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
								var claimPersonNameCol	= createNewColumn(claimRow, 'claimPersonName_'+(i+1), 'datatd', '', '', '', '');
								var claimDateCol		= createNewColumn(claimRow, 'claimDate_'+(i+1), 'datatd', '', '', '', '');
								var remarkCol			= createNewColumn(claimRow, 'remark_'+(i+1), 'datatd', '', '', '', '');
								
								$(srNoCol).append(srNo);
								$(claimEntryIdCol).append(claimEntryId);
								$(wayBillNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+wayBillNumber+'</a>');
								$(lounchByCol).append(lounchBy);
								$(claimAmountCol).append(claimAmount);
								$(claimPersonNameCol).append(claimPersonName);
								$(claimDateCol).append(claimDate);
								$(remarkCol).append(remark);
								
								$('#claimEntryDetails').append(claimRow);

								if(isClaimNumberColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(2)').hide();
									document.getElementById('claimEntryId_'+(i+1)).style.display = 'none';
								}
								
								if(isLrNumberColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(3)').hide();
									document.getElementById('wayBillNumber_'+(i+1)).style.display = 'none';
								}
								
								if(isLounchByColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(4)').hide();
									document.getElementById('lounchBy_'+(i+1)).style.display = 'none';
								}

								if(isClaimAmountColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(5)').hide();
									document.getElementById('claimAmount_'+(i+1)).style.display = 'none';
								}
								
								if(isClaimPersonNameColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(6)').hide();
									document.getElementById('claimPersonName_'+(i+1)).style.display = 'none';
								}
								
								if(isClaimDateColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(7)').hide();
									document.getElementById('claimDate_'+(i+1)).style.display = 'none';
								}
								
								if(isRemarkColumnDisplay == 'true') {
									$('#claimEntryDetails th:nth-child(8)').hide();
									document.getElementById('remark_'+(i+1)).style.display = 'none';
								}
								
							}
							
							if(data.totalClaimAmount) {
								var totalAmount			= data.totalClaimAmount;
								
								var ammountRow		= createRow('ammountRow', 'background-color: lightgrey');
								
								var blankCol		= createNewColumn(ammountRow, '', 'titletd', '', '', 'font-weight: bold', '');
								var blankCol1		= createNewColumn(ammountRow, '', 'titletd', '', '', '', '3');
								var ammountCol		= createNewColumn(ammountRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
								var blankCol4		= createNewColumn(ammountRow, '', 'titletd', '', '', '', '3');
								
								$(blankCol).append('Total Amount');
								$(blankCol1).append();
								//$(ammountCol).append('Rs. '+totalAmount+' /-');
								$(ammountCol).append(totalAmount);
								$(blankCol4).append();

								$('#claimEntryDetails').append(ammountRow);
							}
						}

						document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
						hideLayer();
					}
				}
				printTable(data, 'reportData', 'claimEntryReport', 'Claim Entry Summary', 'printClaimReport');
	});
}