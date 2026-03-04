/**
 * @Author	Shailesh Khandare 21-01-2016
 * @Modified By Ashish Tiwari 06/05/2017
 */

function getDamageReports() {
		
	var subRegion	= 0;
	var	branchId	= 0;
	var regionId	= 0;
	
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
	
	$.getJSON("getAllDamageReceiveDetails.do?pageId=333&eventId=8", 
			{json:jsonStr}, function(data) {
		
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					showPartOfPage('bottom-border-boxshadow');
					
					var isLRNumberColumn		= data.isLRNumberColumn;
					var isDamageDateColumn		= data.isDamageDateColumn;
					var isDamageBranchColumn	= data.isDamageBranchColumn;
					var isDamageNumberColumn	= data.isDamageNumberColumn;
					var isDamageUserColumn		= data.isDamageUserColumn;
					var isArticleTypeColumn		= data.isArticleTypeColumn;
					var isTotalArticleColumn	= data.isTotalArticleColumn;
					var isSaidToContainColumn	= data.isSaidToContainColumn;
					var isDamageArticleColumn	= data.isDamageArticleColumn;
					var isLSNumberColumn		= data.isLSNumberColumn;
					var isTURNumberColumn		= data.isTURNumberColumn;
					var isPrivateMarkColumn		= data.isPrivateMarkColumn;
					var isRemarkColumn			= data.isRemarkColumn;
					var isTotalDamageRow		= data.isTotalDamageRow;
					 var isVehicleNumberColumn	= data.isVehicleNumberColumn;
					 var isWayBillTypeColumn	= data.isWayBillTypeColumn;
					 var isSourceBranchColumn	= data.isSourceBranchColumn;
					 var isDestinationBranchColumn	= data.isDestinationBranchColumn;
					 var isConsignorColumn		= data.isConsignorColumn;
					 var isConsigneeColumn		= data.isConsigneeColumn;
					
					document.getElementById('regionVal').innerHTML		= data.selectedRegion;
					document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
					document.getElementById('branchName').innerHTML		= data.selectedBranch;
					document.getElementById('fromDateVal').innerHTML	= data.fromDate;
					document.getElementById('toDateVal').innerHTML		= data.toDate;
					
					//Please include CommonJsFunction.js file to work this
					removeTableRows('damageReceiveDetails', 'tbody');
					removeTableRows('damageReceiveDetails', 'tfoot');
					removeTableRows('printDamageReport', 'table');

					if(data.damageReceiveCall) {

						var damageReceiveData = data.damageReceiveCall;

						if(damageReceiveData.length > 0) {
							for(var i = 0; i < damageReceiveData.length; i++) {
								var damageReceive	= damageReceiveData[i];

								var srNo			= (i+1);
								var wayBillNumber	= damageReceive.wayBillNumber;
								var wayBillId		= damageReceive.wayBillId;
								var wayBillType		= damageReceive.wayBillType;
								var sourceBranch	= damageReceive.sourceBranch;
								var destBranch		= damageReceive.destinationBranch;
								var damageDate		= damageReceive.damageDate;
								var branchName		= damageReceive.branchName;
								var damageReceiveId	= damageReceive.damageReceiveId;
								var userName		= damageReceive.userName;
								var articleType		= damageReceive.packingType;
								var totalArticle	= damageReceive.totalArticle;
								var saidToContain	= damageReceive.saidToContain;
								var damageArticle	= damageReceive.damageArticle;
								var consignor		= damageReceive.consignorName;
								var consignee		= damageReceive.consigneeName;
								var lsNumber		= damageReceive.lsNumber;
								var dispatchId		= damageReceive.dispatchLedgerId;
								var turNumber		= damageReceive.turNumber;
								var privateMark		= damageReceive.privateMark;
								var remark			= damageReceive.remark;
								var damageNumber	= damageReceive.damageNumber;
								var vehicleNumber	= damageReceive.vehicleNumber;

								var row				= createRow('', '');

								var	srNoCol				= createNewColumn(row, '', 'datatd', '', '', '', '');
								var lrNumberCol			= createNewColumn(row, 'wayBillNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
								var wayBillTypeCol		= createNewColumn(row, 'wayBillType_'+(i+1), 'datatd', '', '', '', '');
								var sourceBranchCol		= createNewColumn(row, 'sourceBranch_'+(i+1), 'datatd', '', '', '', '');
								var destBranchCol		= createNewColumn(row, 'destBranch_'+(i+1), 'datatd', '', '', '', '');
								var damageDateCol		= createNewColumn(row, 'damageDate_'+(i+1), 'datatd', '', '', '', '');
								var branchCol			= createNewColumn(row, 'branchName_'+(i+1), 'datatd', '', '', '', '');
								var damageNumberCol		= createNewColumn(row, 'damageNumber_'+(i+1), 'datatd', '', '', '', '');							
								var userNameCol			= createNewColumn(row, 'userName_'+(i+1), 'datatd', '', '', '', '');
								var articleTypeCol		= createNewColumn(row, 'articleType_'+(i+1), 'datatd', '', '', '', '');
								var tottalArticleCol	= createNewColumn(row, 'totalArticle_'+(i+1), 'datatd', '', '', '', '');
								var saidToContainCol	= createNewColumn(row, 'saidToContain_'+(i+1), 'datatd', '', '', '', '');
								var damageArticleCol	= createNewColumn(row, 'damageArticle_'+(i+1), 'datatd', '', '', '', '');
								var consignorCol		= createNewColumn(row, 'consignor_'+(i+1), 'datatd', '', '', '', '');
								var consigneeCol		= createNewColumn(row, 'consignee_'+(i+1), 'datatd', '', '', '', '');
								var lsNumberCol			= createNewColumn(row, 'lsNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
								var turNumberCol		= createNewColumn(row, 'turNumber_'+(i+1), 'datatd', '', '', '', '');
								var privateMarkCol		= createNewColumn(row, 'privateMark_'+(i+1), 'datatd', '', '', '', '');
								var remarkCol			= createNewColumn(row, 'remark_'+(i+1), 'datatd', '', '', '', '');
								var vehicleNumberCol	= createNewColumn(row, 'vehicleNumber_'+(i+1), 'datatd', '', '', '', '');

								$(srNoCol).append(srNo);
								$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+wayBillNumber+'</a>');
								$(wayBillTypeCol).append(wayBillType);
								$(sourceBranchCol).append(sourceBranch);
								$(destBranchCol).append(destBranch);
								$(damageDateCol).append(damageDate);
								$(branchCol).append(branchName);
								$(damageNumberCol).append(damageNumber);
								$(userNameCol).append(userName);
								$(articleTypeCol).append(articleType);
								$(tottalArticleCol).append(totalArticle);
								$(saidToContainCol).append(saidToContain);
								
								$(damageArticleCol).append(damageArticle);
								
								$(consignorCol).append(consignor);
								 $(consigneeCol).append(consignee);
								$(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
								$(turNumberCol).append(turNumber);
								
								if(privateMark != null && privateMark != '') {
									$(privateMarkCol).append(privateMark);
								} else {
									$(privateMarkCol).append('-----');
								}
								
								$(remarkCol).append(remark);
								$(vehicleNumberCol).append(vehicleNumber);

								$("#damageReceiveDetails").append(row);								
																
								if(isLRNumberColumn == 'false') {
									$('#damageReceiveDetails #damageReportLRNumber').remove();
									$('#wayBillNumber_'+(i+1)).remove();
								}
								
								if(isWayBillTypeColumn == 'false') {
									$('#damageReceiveDetails #damageReportWayBillType').remove();
									$('#wayBillType_'+(i+1)).remove();
								}

								if(isSourceBranchColumn == 'false') {
									$('#damageReceiveDetails #damageReportSourceBranch').remove();
									$('#sourceBranch_'+(i+1)).remove();
								}

								if(isDestinationBranchColumn == 'false') {
									$('#damageReceiveDetails #damageReportDestinationBranch').remove();
									$('#destBranch_'+(i+1)).remove();
								}
								
								if(isDamageDateColumn == 'false') {
									$('#damageReceiveDetails #damageReportDate').remove();
									$('#damageDate_'+(i+1)).remove();
								}
								
								if(isDamageBranchColumn == 'false') {
									$('#damageReceiveDetails #damageReportBranch').remove();
									$('#branchName_'+(i+1)).remove();
								}
								if(isDamageNumberColumn == 'false') {
									$('#damageReceiveDetails #damageReportNumber').remove();
									$('#damageNumber_'+(i+1)).remove();
								}
								
								if(isDamageUserColumn == 'false') {
									$('#damageReceiveDetails #damageReportUser').remove();
									$('#userName_'+(i+1)).remove();
								}
								
								if(isArticleTypeColumn == 'false') {
									$('#damageReceiveDetails #damageReportArticleType').remove();
									$('#articleType_'+(i+1)).remove();
								}
								
								if(isTotalArticleColumn == 'false') {
									$('#damageReceiveDetails #damageReportTotalArticle').remove();
									$('#totalArticle_'+(i+1)).remove();
								}
								
								if(isSaidToContainColumn == 'false') {
									$('#damageReceiveDetails #damageReportSaidToContain').remove();
									$('#saidToContain_'+(i+1)).remove();
								}
								
								if(isDamageArticleColumn == 'false') {
									$('#damageReceiveDetails #damageReportArticle').remove();
									$('#damageArticle_'+(i+1)).remove();
								}
								
								if(isConsignorColumn == 'false') {
									$('#damageReceiveDetails #damageReportConsignor').remove();
									$('#consignor_'+(i+1)).remove();
								}

								if(isConsigneeColumn == 'false') {
									$('#damageReceiveDetails #damageReportConsignee').remove();
									$('#consignee_'+(i+1)).remove();
								}
								
								if(isLSNumberColumn == 'false') {
									$('#damageReceiveDetails #damageReportLSNumber').remove();
									$('#lsNumber_'+(i+1)).remove();
								}
								
								if(isTURNumberColumn == 'false') {
									$('#damageReceiveDetails #damageReportTURNumber').remove();
									$('#turNumber_'+(i+1)).remove();
								}
								
								if(isPrivateMarkColumn == 'false') {
									$('#damageReceiveDetails #damageReportPrivateMark').remove();
									$('#privateMark_'+(i+1)).remove();
								}
								
								if(isRemarkColumn == 'false') {
									$('#damageReceiveDetails #damageReportRemark').remove();
									$('#remark_'+(i+1)).remove();
								}
								
								if(isVehicleNumberColumn == 'false') {
									$('#damageReceiveDetails #damageReportVehicleNumber').remove();
									$('#vehicleNumber_'+(i+1)).remove();
								}
							}
							
							if(isTotalDamageRow == 'true') {
								if(data.valueObjectForTotal) {
									var valueObjectForTotal			= data.valueObjectForTotal;
									var totalDamageWeight			= 0;
									var totalAmount					= 0;
									var totalArticle				= 0;
									var totalDamageArt				= 0;
									var totalDamageArt				= 0;
									var totalArtCol					= null;
									var totalDamageArtCol			= null;
									
									if(valueObjectForTotal.totalNoOfArticle) {
										totalArticle	= valueObjectForTotal.totalNoOfArticle;
									}
									
									if(valueObjectForTotal.totalDamageArticle) {
										totalDamageArt	= valueObjectForTotal.totalDamageArticle;
									}
									
									var totalRow		= createRow('', 'background-color: lightgrey');
									
									var totalCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'font-weight: bold', '');
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
									 if(isDamageDateColumn == 'true') {
										 var blankCol5		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									 if(isDamageBranchColumn == 'true') {
										 var blankCol6		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									 if(isDamageNumberColumn == 'true') {
										 var blankCol7		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									 if(isDamageUserColumn == 'true') {
										 var blankCol8		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									 if(isArticleTypeColumn == 'true') {
										 var blankCol9		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									if(isTotalArticleColumn == 'true') {
										totalArtCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
									}
									if(isSaidToContainColumn == 'true') {
										 var blankCol10		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									 }
									
									if(isDamageArticleColumn == 'true') {
										totalDamageArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
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
									
									$(totalCol).append('Total');
									
									if(isTotalArticleColumn == 'true') {
										$(totalArtCol).append(totalArticle);
									}						
									
									if(isDamageArticleColumn == 'true') {
										$(totalDamageArtCol).append(totalDamageArt);
									}
									
									$('#totalRow').append(totalRow);
								}
							}
						}
						
						printTable(data, 'reportData', 'damageRegisterReport', 'Damage Register Summary', 'printDamageReport');
												
						document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
						hideLayer();
					}
				}
				
	});
}