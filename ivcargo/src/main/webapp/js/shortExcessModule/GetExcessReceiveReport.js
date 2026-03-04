/**
 * @Author	Anant Chaudhary	16-10-2015
 */

function getExcessReports() {
	
	var subRegion	= 0;
	var	branchId	= 0;
	var	regionId	= 0;
	
	if(document.getElementById('region') != null) {
		if(!validateRegion(6, 'region')) return false;
	}
	
	if(document.getElementById('subRegion') != null) {
		if(!validateSubRegion(6, 'subRegion')) return false;
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
	//alert(jsonStr);
	
	$.getJSON("getAllExcessReceiveDetails.do?pageId=333&eventId=2", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();
			} else {
				hideAllMessages();
				showPartOfPage('bottom-border-boxshadow');
				
				var photoSrc	= null;
				
				document.getElementById('regionVal').innerHTML		= data.selectedRegion;
				document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
				document.getElementById('branchName').innerHTML		= data.selectedBranch;
				document.getElementById('fromDateVal').innerHTML	= data.fromDate;
				document.getElementById('toDateVal').innerHTML		= data.toDate;
				
				//Please include CommonJsFunction.js file to work this
				removeTableRows('excessReceiveDetails', 'tbody');
				removeTableRows('excessReceiveDetails', 'tfoot');
				removeTableRows('printExcessReport', 'table');
				
				if(data.excessReceiveCall) {
					 var excessDetails = data.excessReceiveCall;
					 
					 
					 if(excessDetails.length > 0) {
						 for(var i = 0; i < excessDetails.length; i++) {
							 var excessReceive = excessDetails[i];
							 
							 var srNo			= (i+1);
							 var lrNumber		= excessReceive.wayBillNumber;
							 var wayBillId		= excessReceive.wayBillId;
							 var wayBillType	= excessReceive.wayBillType;
							 var sourceBranch	= excessReceive.sourceBranch;
							 var destBranch		= excessReceive.destinationBranch;
							 var excessDate		= excessReceive.excessDate;
							 var excessBranch	= excessReceive.branchName;
							 var excessNumber	= excessReceive.excessNumber;
							 var articleType	= excessReceive.packingType;
							 var noOfArticle	= excessReceive.excessArticle;
							 var saidToContain	= excessReceive.saidToContain;
							 var excessWeight	= excessReceive.weight;
							 var consignor		= excessReceive.consignorName;
							 var consignee		= excessReceive.consigneeName;
							 var lsNumber		= excessReceive.lsNumber;
							 var dispatchId		= excessReceive.dispatchLedgerId;
							 var turNumber		= excessReceive.turNumber;
							 var privateMark	= excessReceive.privateMark;
							 var remark			= excessReceive.remark;
							 var userName		= excessReceive.userName;
							 var photoName		= excessReceive.excessPhoto;
							 var vehicleNumber	= excessReceive.vehicleNumber;
							 
							 var row				= createRow('', '');
							 
							 var srNoCol			= createNewColumn(row, 'srNo_'+(i+1), 'datatd', '', '', '', '');
							 var lrNumberCol		= createNewColumn(row, 'wayBillNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
							 var wayBillTypeCol		= createNewColumn(row, 'wayBillType_'+(i+1), 'datatd', '', '', '', '');
							 var sourceBranchCol	= createNewColumn(row, 'sourceBranch_'+(i+1), 'datatd', '', '', '', '');
							 var destBranchCol		= createNewColumn(row, 'destBranch_'+(i+1), 'datatd', '', '', '', '');
							 var excessDateCol		= createNewColumn(row, 'excessDate_'+(i+1), 'datatd', '', '', '', '');
							 var excessBranchCol	= createNewColumn(row, 'excessBranch_'+(i+1), 'datatd', '', '', '', '');
							 var excessNumberCol	= createNewColumn(row, 'excessNumber_'+(i+1), 'datatd', '', '', '', '');
							 var userNameCol		= createNewColumn(row, 'userName_'+(i+1), 'datatd', '', '', '', '');
							 var articleTypeCol		= createNewColumn(row, 'articleType_'+(i+1), 'datatd', '', '', '', '');
							 var totalArticleCol	= createNewColumn(row, 'noOfArticle_'+(i+1), 'datatd', '', '', '', '');
							 var saidToContainCol	= createNewColumn(row, 'saidToContain_'+(i+1), 'datatd', '', '', '', '');
							 var excessWeightCol	= createNewColumn(row, 'excessWeight_'+(i+1), 'datatd', '', '', '', '');
							 var consignorCol		= createNewColumn(row, 'consignor_'+(i+1), 'datatd', '', '', '', '');
							 var consigneeCol		= createNewColumn(row, 'consignee_'+(i+1), 'datatd', '', '', '', '');
							 var lsNumberCol		= createNewColumn(row, 'lsNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
							 var turNumberCol		= createNewColumn(row, 'turNumber_'+(i+1), 'datatd', '', '', '', '');
							 var privateMarkCol		= createNewColumn(row, 'privateMark_'+(i+1), 'datatd', '', '', '', '');
							 var remarkCol			= createNewColumn(row, 'remark_'+(i+1), 'datatd', '', '', '', '');
							 var vehicleNumberCol	= createNewColumn(row, 'vehicleNumber_'+(i+1), 'datatd', '', '', '', '');
							 
							 $(srNoCol).append(srNo);
							 
							 if(lrNumber != '-----') {
								 $(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+lrNumber+'</a>'); 
							 } else {
								 $(lrNumberCol).append('-----');
							 }
							 $(wayBillTypeCol).append(wayBillType);
							 $(sourceBranchCol).append(sourceBranch);
							 $(destBranchCol).append(destBranch);
							 $(excessDateCol).append(excessDate);
							 $(excessBranchCol).append(excessBranch);
							 $(userNameCol).append(userName);
							 $(excessNumberCol).append(excessNumber);
							 $(articleTypeCol).append(articleType);
							 $(totalArticleCol).append(noOfArticle);
							 $(saidToContainCol).append(saidToContain);
							 $(excessWeightCol).append(excessWeight);
							 $(consignorCol).append(consignor);
							 $(consigneeCol).append(consignee);
							 if(lsNumber != '-----') {
								 $(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
							 } else {
								 $(lsNumberCol).append('-----');
							 }
							 
							 $(turNumberCol).append(turNumber);
							 $(privateMarkCol).append(privateMark);
							 $(remarkCol).append(remark);
							 $(vehicleNumberCol).append(vehicleNumber);
							 
							 $("#excessReceiveDetails").append(row);
							 
							 var isLRNumberColumn		= data.isLRNumberColumn;
							 var isExcessDateColumn		= data.isExcessDateColumn;
							 var isExcessBranchColumn	= data.isExcessBranchColumn;
							 var isExcessNumberColumn	= data.isExcessNumberColumn;
							 var isExcessUserColumn		= data.isExcessUserColumn;
							 var isArticleTypeColumn	= data.isArticleTypeColumn;
							 var isExcessArticleColumn	= data.isExcessArticleColumn;
							 var isSaidToContainColumn	= data.isSaidToContainColumn;
							 var isExcessWeightColumn	= data.isExcessWeightColumn;
							 var isLSNumberColumn		= data.isLSNumberColumn;
							 var isTURNumberColumn		= data.isTURNumberColumn;
							 var isPrivateMarkColumn	= data.isPrivateMarkColumn;
							 var isRemarkColumn			= data.isRemarkColumn;
							 var isPhotoColumn			= data.isPhotoColumn;
							 var isVehicleNumberColumn	= data.isVehicleNumberColumn;
							 var isWayBillTypeColumn	= data.isWayBillTypeColumn;
							 var isSourceBranchColumn	= data.isSourceBranchColumn;
							 var isDestinationBranchColumn	= data.isDestinationBranchColumn;
							 var isConsignorColumn		= data.isConsignorColumn;
							 var isConsigneeColumn		= data.isConsigneeColumn;
							 
							if(isLRNumberColumn == 'false') {
								$('#excessReceiveDetails #excessReportLRNumber').remove();
								$('#wayBillNumber_'+(i+1)).remove();
							}
							
							if(isWayBillTypeColumn == 'false') {
								$('#excessReceiveDetails #excessReportWayBillType').remove();
								$('#wayBillType_'+(i+1)).remove();
							}

							if(isSourceBranchColumn == 'false') {
								$('#excessReceiveDetails #excessReportSourceBranch').remove();
								$('#sourceBranch_'+(i+1)).remove();
							}

							if(isDestinationBranchColumn == 'false') {
								$('#excessReceiveDetails #excessReportDestinationBranch').remove();
								$('#destBranch_'+(i+1)).remove();
							}
							
							if(isExcessDateColumn == 'false') {
								$('#excessReceiveDetails #excessReportDate').remove();
								$('#excessDate_'+(i+1)).remove();
							}
							
							if(isExcessBranchColumn == 'false') {
								$('#excessReceiveDetails #excessReportBranch').remove();
								$('#excessBranch_'+(i+1)).remove();
							}
							
							if(isExcessNumberColumn == 'false') {
								$('#excessReceiveDetails #excessReportNumber').remove();
								$('#excessNumber_'+(i+1)).remove();
							}
							
							if(isExcessUserColumn == 'false') {
								$('#excessReceiveDetails #excessReportUser').remove();
								$('#userName_'+(i+1)).remove();
							}
							
							if(isArticleTypeColumn == 'false') {
								$('#excessReceiveDetails #excessReportArticleType').remove();
								$('#articleType_'+(i+1)).remove();
							}
							
							if(isExcessArticleColumn == 'false') {
								$('#excessReceiveDetails #excessReportArticle').remove();
								$('#noOfArticle_'+(i+1)).remove();
							}
							
							if(isSaidToContainColumn == 'false') {
								$('#excessReceiveDetails #excessReportSaidToContain').remove();
								$('#saidToContain_'+(i+1)).remove();
							}
							
							if(isExcessWeightColumn == 'false') {
								$('#excessReceiveDetails #excessReportWeight').remove();
								$('#excessWeight_'+(i+1)).remove();
							}
							
							if(isConsignorColumn == 'false') {
								$('#excessReceiveDetails #excessReportConsignor').remove();
								$('#consignor_'+(i+1)).remove();
							}

							if(isConsigneeColumn == 'false') {
								$('#excessReceiveDetails #excessReportConsignee').remove();
								$('#consignee_'+(i+1)).remove();
							}
							
							if(isLSNumberColumn == 'false') {
								$('#excessReceiveDetails #excessReportLSNumber').remove();
								$('#lsNumber_'+(i+1)).remove();
							}
							
							if(isTURNumberColumn == 'false') {
								$('#excessReceiveDetails #excessReportTURNumber').remove();
								$('#turNumber_'+(i+1)).remove();
							}
							
							if(isPrivateMarkColumn == 'false') {
								$('#excessReceiveDetails #excessReportPrivateMark').remove();
								$('#privateMark_'+(i+1)).remove();
							}
							
							if(isRemarkColumn == 'false') {
								$('#excessReceiveDetails #excessReportRemark').remove();
								$('#remark_'+(i+1)).remove();
							}
							
							if(isVehicleNumberColumn == 'false') {
								$('#excessReceiveDetails #excessReportVehicleNumber').remove();
								$('#vehicleNumber_'+(i+1)).remove();
							}
						 }
						
						 if(data.valueObjectForTotal) {
							 var valueObjectForTotal	= data.valueObjectForTotal;
							 
							 var totalExcessArticle	= 0;
							 var totalExcessWeight	= 0;
							 
							 if(valueObjectForTotal.totalExcessArticle) {
								 totalExcessArticle		= valueObjectForTotal.totalExcessArticle;
							 }
							 
							 if(valueObjectForTotal.totalExcessWeight) {
								 totalExcessWeight		= valueObjectForTotal.totalExcessWeight;
							 }
							 
							 var totalRow		= createRow('totalRow', 'background-color: lightgrey');
							 
							 var blankCol		= createNewColumn(totalRow, '', 'titletd', '', '', 'font-weight: bold', '');
							 if(isLRNumberColumn == 'true') {
								 var blankCol1		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isWayBillTypeColumn == 'true') {
								 var blankCol2		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isSourceBranchColumn == 'true') {
								 var blankCol3		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isDestinationBranchColumn == 'true') {
								 var blankCol4		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessDateColumn == 'true') {
								 var blankCol5		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessBranchColumn == 'true') {
								 var blankCol6		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessNumberColumn == 'true') {
								 var blankCol7		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessUserColumn == 'true') {
								 var blankCol8		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isArticleTypeColumn == 'true') {
								 var blankCol9		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessArticleColumn == 'true') {
								 var excessArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
							 }
							 if(isSaidToContainColumn == 'true') {
								 var blankCol10		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isExcessWeightColumn == 'true') {
								 var excessWeightCol= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
							 }
							 if(isConsignorColumn == 'true') {
								 var blankCol11		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isConsigneeColumn == 'true') {
								 var blankCol12		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isLSNumberColumn == 'true') {
								 var blankCol13		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isTURNumberColumn == 'true') {
								 var blankCol14		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isPrivateMarkColumn == 'true') {
								 var blankCol15		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isRemarkColumn == 'true') {
								 var blankCol16 	= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }
							 if(isVehicleNumberColumn == 'true') {
								 var blankCol17 	= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							 }

							 $(blankCol).append('Total');
							 $(excessArtCol).append(totalExcessArticle);
							 $(excessWeightCol).append(totalExcessWeight);

							 $("#totalRow").append(totalRow);
						 }
					 }
					 
					 printTable(data, 'reportData', 'excessRegisterReport', 'Excess Register Summary', 'printExcessReport');
					 
					 document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
					 hideLayer();
				}
			}
	});
}
