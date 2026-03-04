/**
 * @Author	Anant Chaudhary	14-10-2015
 */

function getShortReports() {
	
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
	if(typeof viewAll !== 'undefined'){
		jsonObjectOut.viewAll 	 = viewAll;
	} else {
		jsonObjectOut.viewAll 	 = false;
	}
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);
	
	$.getJSON("getAllShortReceiveDetails.do?pageId=333&eventId=1", 
			{json:jsonStr}, function(data) {
		
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					showPartOfPage('bottom-border-boxshadow');
					
					var isLRNumberColumn		= data.isLRNumberColumn;
					var isShortDateColumn		= data.isShortDateColumn;
					var isShortBranchColumn		= data.isShortBranchColumn;
					var isShortNumberColumn		= data.isShortNumberColumn;
					var isShortUserColumn		= data.isShortUserColumn;
					var isArticleTypeColumn		= data.isArticleTypeColumn;
					var isTotalArticleColumn	= data.isTotalArticleColumn;
					var isSaidToContainColumn	= data.isSaidToContainColumn;
					var isShortArticleColumn	= data.isShortArticleColumn;
					var isDamageArticleColumn	= data.isDamageArticleColumn;
					var isLSNumberColumn		= data.isLSNumberColumn;
					var isTURNumberColumn		= data.isTURNumberColumn;
					var isPrivateMarkColumn		= data.isPrivateMarkColumn;
					var isRemarkColumn			= data.isRemarkColumn;
					var isVehicleNumberColumn	= data.isVehicleNumberColumn;
					var isWayBillTypeColumn		= data.isWayBillTypeColumn;
					var isSourceBranchColumn	= data.isSourceBranchColumn;
					var isDestinationBranchColumn	= data.isDestinationBranchColumn;
					var isConsignorColumn		= data.isConsignorColumn;
					var isConsigneeColumn		= data.isConsigneeColumn;
					var isShortWeightColumn		= data.isShortWeightColumn;
					var isShortAmountColumn		= data.isShortAmountColumn;
					var isTotalValueColumn		= data.isTotalValueColumn;
					var isShortValueColumn		= data.isShortValueColumn
					
					document.getElementById('regionVal').innerHTML		= data.selectedRegion;
					document.getElementById('areaVal').innerHTML		= data.selectedSubRegion;
					document.getElementById('branchName').innerHTML		= data.selectedBranch;
					document.getElementById('fromDateVal').innerHTML	= data.fromDate;
					document.getElementById('toDateVal').innerHTML		= data.toDate;
					
					//Please include CommonJsFunction.js file to work this
					removeTableRows('shortReceiveDetails', 'tbody');
					removeTableRows('shortReceiveDetails', 'tfoot');
					removeTableRows('printShortReport', 'table');

					if(data.shortReceiveCall) {

						var shortReceiveData = data.shortReceiveCall;

						if(shortReceiveData.length > 0) {
							for(var i = 0; i < shortReceiveData.length; i++) {
								var shortReceive	= shortReceiveData[i];

								var srNo			= (i+1);
								var wayBillNumber	= shortReceive.wayBillNumber;
								var wayBillId		= shortReceive.wayBillId;
								var wayBillType		= shortReceive.wayBillType;
								var sourceBranch	= shortReceive.sourceBranch;
								var destBranch		= shortReceive.destinationBranch;
								var shortDate		= shortReceive.shortDate;
								var branchName		= shortReceive.branchName;
								var shortNumber		= shortReceive.shortNumber;
								var userName		= shortReceive.userName;
								var articleType		= shortReceive.packingType;
								var totalArticle	= shortReceive.totalArticle;
								var saidToContain	= shortReceive.saidToContain;
								var shortArticle	= shortReceive.shortArticle;
								var damageArticle	= shortReceive.damageArticle;
								var shortWeight		= shortReceive.shortWeight;
								var amount			= shortReceive.amount;
								var consignor		= shortReceive.consignorName;
								var consignee		= shortReceive.consigneeName;
								var lsNumber		= shortReceive.lsNumber;
								var dispatchId		= shortReceive.dispatchLedgerId;
								var turNumber		= shortReceive.turNumber;
								var privateMark		= shortReceive.privateMark;
								var remark			= shortReceive.remark;
								var vehicleNumber	= shortReceive.vehicleNumber;
								var declaredValue	= shortReceive.declaredValue;
								//var shortNumber		= Number((declaredValue/totalArticle)*shortNumber);;

								var row				= createRow('', '');

								var	srNoCol				= createNewColumn(row, '', 'datatd', '', '', '', '');
								var lrNumberCol			= createNewColumn(row, 'wayBillNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
								var wayBillTypeCol		= createNewColumn(row, 'wayBillType_'+(i+1), 'datatd', '', '', '', '');
								var sourceBranchCol		= createNewColumn(row, 'sourceBranch_'+(i+1), 'datatd', '', '', '', '');
								var destBranchCol		= createNewColumn(row, 'destBranch_'+(i+1), 'datatd', '', '', '', '');
								var shortDateCol		= createNewColumn(row, 'shortDate_'+(i+1), 'datatd', '', '', '', '');
								var branchCol			= createNewColumn(row, 'branchName_'+(i+1), 'datatd', '', '', '', '');
								var shortNumberCol		= createNewColumn(row, 'shortNumber_'+(i+1), 'datatd', '', '', '', '');							
								var userNameCol			= createNewColumn(row, 'userName_'+(i+1), 'datatd', '', '', '', '');
								var articleTypeCol		= createNewColumn(row, 'articleType_'+(i+1), 'datatd', '', '', '', '');
								var tottalArticleCol	= createNewColumn(row, 'totalArticle_'+(i+1), 'datatd', '', '', '', '');
								var saidToContainCol	= createNewColumn(row, 'saidToContain_'+(i+1), 'datatd', '', '', '', '');
								var shortArticleCol		= createNewColumn(row, 'shortArticle_'+(i+1), 'datatd', '', '', '', '');
								var shortWeightCol		= createNewColumn(row, 'shortWeight_'+(i+1), 'datatd', '', '', '', '');
								var amountCol			= createNewColumn(row, 'amount_'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
								var consignorCol		= createNewColumn(row, 'consignor_'+(i+1), 'datatd', '', '', '', '');
								var consigneeCol		= createNewColumn(row, 'consignee_'+(i+1), 'datatd', '', '', '', '');
								var lsNumberCol			= createNewColumn(row, 'lsNumber_'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
								var turNumberCol		= createNewColumn(row, 'turNumber_'+(i+1), 'datatd', '', '', '', '');
								var privateMarkCol		= createNewColumn(row, 'privateMark_'+(i+1), 'datatd', '', '', '', '');
								var remarkCol			= createNewColumn(row, 'remark_'+(i+1), 'datatd', '', '', '', '');
								var vehicleNumberCol	= createNewColumn(row, 'vehicleNumber_'+(i+1), 'datatd', '', '', '', '');
								var declaredValue		= createNewColumn(row, 'declaredValue_'+(i+1), 'datatd', '', '', '', '');
								//var shortNumber			= createNewColumn(row, 'shortNumber_'+(i+1), 'datatd', '', '', '', '');

								$(srNoCol).append(srNo);
								$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+wayBillNumber+'</a>');
								$(wayBillTypeCol).append(wayBillType);
								$(sourceBranchCol).append(sourceBranch);
								$(destBranchCol).append(destBranch);
								$(shortDateCol).append(shortDate);
								$(branchCol).append(branchName);
								$(shortNumberCol).append(shortNumber);
								$(userNameCol).append(userName);
								$(articleTypeCol).append(articleType);
								$(tottalArticleCol).append(totalArticle);
								$(saidToContainCol).append(saidToContain);
								$(shortArticleCol).append(shortArticle);
								$(shortWeightCol).append(shortWeight);
								$(amountCol).append(amount);
								$(consignorCol).append(consignor);
								$(consigneeCol).append(consignee);
								$(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
								$(turNumberCol).append(turNumber);
								$(declaredValue).append(declaredValue);
								//$(shortNumber).append(shortNumber);
								
								if(privateMark != null && privateMark != '') {
									$(privateMarkCol).append(privateMark);
								} else {
									$(privateMarkCol).append('-----');
								}
								
								$(remarkCol).append(remark);
								$(vehicleNumberCol).append(vehicleNumber);

								$("#shortReceiveDetails").append(row);								
																
								if(isLRNumberColumn == 'false') {
									$('#shortReceiveDetails #shortReportLRNumber').remove();
									$('#wayBillNumber_'+(i+1)).remove();
								}
								
								if(isWayBillTypeColumn == 'false') {
									$('#shortReceiveDetails #shortReportWayBillType').remove();
									$('#wayBillType_'+(i+1)).remove();
								}

								if(isSourceBranchColumn == 'false') {
									$('#shortReceiveDetails #shortReportSourceBranch').remove();
									$('#sourceBranch_'+(i+1)).remove();
								}

								if(isDestinationBranchColumn == 'false') {
									$('#shortReceiveDetails #shortReportDestinationBranch').remove();
									$('#destBranch_'+(i+1)).remove();
								}
								
								if(isShortDateColumn == 'false') {
									$('#shortReceiveDetails #shortReportDate').remove();
									$('#shortDate_'+(i+1)).remove();
								}
								
								if(isShortBranchColumn == 'false') {
									$('#shortReceiveDetails #shortReportBranch').remove();
									$('#branchName_'+(i+1)).remove();
								}
								if(isShortNumberColumn == 'false') {
									$('#shortReceiveDetails #shortReportNumber').remove();
									$('#shortNumber_'+(i+1)).remove();
								}
								
								if(isShortUserColumn == 'false') {
									$('#shortReceiveDetails #shortReportUser').remove();
									$('#userName_'+(i+1)).remove();
								}
								
								if(isArticleTypeColumn == 'false') {
									$('#shortReceiveDetails #shortReportArticleType').remove();
									$('#articleType_'+(i+1)).remove();
								}
								
								if(isTotalArticleColumn == 'false') {
									$('#shortReceiveDetails #shortReportTotalArticle').remove();
									$('#totalArticle_'+(i+1)).remove();
								}
								
								if(isSaidToContainColumn == 'false') {
									$('#shortReceiveDetails #shortReportSaidToContain').remove();
									$('#saidToContain_'+(i+1)).remove();
								}
								
								if(isShortArticleColumn == 'false') {
									$('#shortReceiveDetails #shortReportArticle').remove();
									$('#shortArticle_'+(i+1)).remove();
								}
								
								if(isShortWeightColumn == 'false') {
									$('#shortReceiveDetails #shortReportWeight').remove();
									$('#shortWeight_'+(i+1)).remove();
								}
								
								if(isShortAmountColumn == 'false') {
									$('#shortReceiveDetails #shortReportAmount').remove();
									$('#amount_'+(i+1)).remove();
								}

								if(isConsignorColumn == 'false') {
									$('#shortReceiveDetails #shortReportConsignor').remove();
									$('#consignor_'+(i+1)).remove();
								}

								if(isConsigneeColumn == 'false') {
									$('#shortReceiveDetails #shortReportConsignee').remove();
									$('#consignee_'+(i+1)).remove();
								}
								
								if(isLSNumberColumn == 'false') {
									$('#shortReceiveDetails #shortReportLSNumber').remove();
									$('#lsNumber_'+(i+1)).remove();
								}
								
								if(isTURNumberColumn == 'false') {
									$('#shortReceiveDetails #shortReportTURNumber').remove();
									$('#turNumber_'+(i+1)).remove();
								}
								
								if(isPrivateMarkColumn == 'false') {
									$('#shortReceiveDetails #shortReportPrivateMark').remove();
									$('#privateMark_'+(i+1)).remove();
								}
								
								if(isRemarkColumn == 'false') {
									$('#shortReceiveDetails #shortReportRemark').remove();
									$('#remark_'+(i+1)).remove();
								}

								if(isVehicleNumberColumn == 'false') {
									$('#shortReceiveDetails #shortReportVehicleNumber').remove();
									$('#vehicleNumber_'+(i+1)).remove();
								}

								if(typeof isDeclaredValueColumn !== 'undefined'){
									if(isDeclaredValueColumn == 'false') {
										$('#shortReceiveDetails #shortReportDeclaredValue').remove();
										$('#declaredValue_'+(i+1)).remove();
									}
								}
								if(isShortValueColumn == 'false') {
									$('#shortReceiveDetails #shortReportshortValue').remove();
									$('#shortValue_'+(i+1)).remove();
								}
							}
							
						if(typeof isTotalShortRow !== 'undefined'){
							if(isTotalShortRow == 'true') {
								if(data.valueObjectForTotal) {
									var valueObjectForTotal			= data.valueObjectForTotal;
									var totalShortWeight			= 0;
									var totalAmount					= 0;
									var totalArticle				= 0;
									var totalShortArt				= 0;
									var totalDamageArt				= 0;
									var totalArtCol					= null;
									var totalShortArtCol			= null; 
									var totalDamageArtCol			= null;
									var totalShortWeightCol			= null;
									var ammountCol					= null;
									
									if(valueObjectForTotal.totalShortWeight) {
										totalShortWeight	= valueObjectForTotal.totalShortWeight;
									}
									
									if(valueObjectForTotal.totalShortAmount) {
										totalAmount	= valueObjectForTotal.totalShortAmount;
									}
									
									if(valueObjectForTotal.totalNoOfArticle) {
										totalArticle	= valueObjectForTotal.totalNoOfArticle;
									}
									
									if(valueObjectForTotal.totalShortArticle) {
										totalShortArt	= valueObjectForTotal.totalShortArticle;
									}
									
									var totalRow		= createRow('', 'background-color: lightgrey');
									
									var totalCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'font-weight: bold', '');
									if(isLRNumberColumn == 'true') {
										var blankCol1			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isWayBillTypeColumn == 'true') {
										var blankCol2			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isSourceBranchColumn == 'true') {
										var blankCol3			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isDestinationBranchColumn == 'true') {
										var blankCol4			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isShortDateColumn == 'true') {
										var blankCol5			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isShortBranchColumn == 'true') {
										var blankCol6			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');								
									}
									if(isShortNumberColumn == 'true') {
										var blankCol7			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');								
									}
									if(isShortUserColumn == 'true') {
										var blankCol8			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');								
									}
									if(isArticleTypeColumn == 'true') {
										var blankCol9			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');								
									}

									if(isTotalArticleColumn == 'true') {
										totalArtCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
									}
									if(isSaidToContainColumn == 'true') {
										var blankCol10			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									
									if(isShortArticleColumn == 'true') {
										totalShortArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
									}
									
									if(isShortWeightColumn == 'true') {
										totalShortWeightCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
									}
									
									if(isShortAmountColumn == 'true') {
										ammountCol = createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
									}
									
									if(isConsignorColumn == 'true') {
										var blankCol11			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isConsigneeColumn == 'true') {
										var blankCol12			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isLSNumberColumn == 'true') {
										var blankCol13			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isTURNumberColumn == 'true') {
										var blankCol14			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isPrivateMarkColumn == 'true') {
										var blankCol15			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isRemarkColumn == 'true') {
										var blankCol16			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isVehicleNumberColumn == 'true') {
										var blankCol17			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isDeclaredValueColumn == 'true') {
										var blankCol18			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									if(isShortValueColumn == 'true') {
										var blankCol19			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
									}
									
									
									$(totalCol).append('Total');
									$(blankCol1).append();
									
									if(isTotalArticleColumn == 'true') {
										$(totalArtCol).append(totalArticle);
									}						
									
									$(blankCol2).append();
									
									if(isShortArticleColumn == 'true') {
										$(totalShortArtCol).append(totalShortArt);
									}
									
									if(isShortWeightColumn == 'true') {
										$(totalShortWeightCol).append(totalShortWeight);
									}

									if(isShortAmountColumn == 'true') {
										$(ammountCol).append(totalAmount);
									}
									$(blankCol10).append();
	
									$('#totalRow').append(totalRow);
								}
							}
						 }
						}
						
						printTable(data, 'reportData', 'shortRegisterReport', 'Short Register Summary', 'printShortReport');
												
						document.getElementById('bottom-border-boxshadow').style.visibility = 'visible';
						hideLayer();
					}
				}
				
	});
}