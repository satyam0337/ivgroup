/**
 * Shailesh Khandare
 * Please include this file into Pending Short register settlement page and report page
 */

function cannotSettle() {
	showMessage('info', otherUserCannotSettleInfoMsg);
	return false;
}

function commonDamageDetails(data, filter) {
	
	var configuration		= data.configuration;
	
	showLayer();
	
	if(data.pendingDmSettlementCall) {
		var pendingDmSettlement = data.pendingDmSettlementCall;
		
		if(pendingDmSettlement.length > 0) {
			for(var i = 0; i < pendingDmSettlement.length; i++) {
				pendingDamageReceive	= pendingDmSettlement[i];
				
				var srNo			= (i+1);
				var lrNumber		= pendingDamageReceive.wayBillNumber;
				var wayBillId		= pendingDamageReceive.wayBillId;
				var damageDate		= pendingDamageReceive.damageDate;
				var branch			= pendingDamageReceive.branchName;
				var branchId		= pendingDamageReceive.branchId;
				var damageNumber	= pendingDamageReceive.damageNumber;
				var damageReceiveId	= pendingDamageReceive.damageReceiveId;
				var userName		= pendingDamageReceive.userName;	
				var articleType		= pendingDamageReceive.packingType;
				var totalArticle	= pendingDamageReceive.totalArticle;
				var saidToContain	= pendingDamageReceive.saidToContain;
				var damageArticle	= pendingDamageReceive.damageArticle;
				var lsNumber		= pendingDamageReceive.lsNumber;
				var dispatchId		= pendingDamageReceive.dispatchLedgerId;
				var turNumber		= pendingDamageReceive.turNumber;
				var privateMark		= pendingDamageReceive.privateMark;
				var remark			= pendingDamageReceive.remark;							
				var pendingDays		= pendingDamageReceive.pendingDays;
				var receivedLedgerId= pendingDamageReceive.receivedLedgerId;
				
				/**
				 * Please include createDom.js file to create dynamic table
				 */
				
				var row				= createRow('', '');
				
				var	srNoCol				= createNewColumn(row, 'srNo_'+(i+1), 'datatd', '', '', '', '');
				var lrNumberCol			= createNewColumn(row, 'lrNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
				var damageDateCol		= createNewColumn(row, 'damageDate_s'+(i+1), 'datatd', '', '', '', '');
				var branchCol			= createNewColumn(row, 'branch_s'+(i+1), 'datatd', '', '', '', '');
				var damageNumberCol		= createNewColumn(row, 'damageNumber_s'+(i+1), 'datatd', '', '', '', '');
				
				var userNameCol		= null;
				
				if(data.userName != userName) {
					userNameCol			= createNewColumn(row, 'userName_s'+(i+1), 'datatd', '', '', '', '');
				} else {
					userNameCol			= createNewColumn(row, 'userName_s'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
				}
				
				var articleTypeCol		= createNewColumn(row, 'articleType_s'+(i+1), 'datatd', '', '', '', '');
				var tottalArticleCol	= createNewColumn(row, 'totalArticle_s'+(i+1), 'datatd', '', '', '', '');
				var saidToContainCol	= createNewColumn(row, 'saidToContain_s'+(i+1), 'datatd', '', '', '', '');
				var damageArticleCol	= createNewColumn(row, 'damageArticle_s'+(i+1), 'datatd', '', '', '', '');
				var lsNumberCol			= createNewColumn(row, 'lsNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');	
				var turNumberCol		= createNewColumn(row, 'turNumber_s'+(i+1), 'datatd', '', '', '', '');
				var privateMarkCol		= createNewColumn(row, 'privateMark_s'+(i+1), 'datatd', '', '', '', '');
				var remarkCol			= createNewColumn(row, 'remark_s'+(i+1), 'datatd', '', '', '', '');
				var pendingDaysCol		= createNewColumn(row, 'pendingDays_s'+(i+1), 'datatd', '', '', '', '');
				
				var settlementCol	= null;
				
				if(filter == 2) {
					settlementCol	= createNewColumn(row, 'hideShowShortSettleButton_'+(i+1), 'datatd', '', '', '', '');
				}
				
				$(srNoCol).append(srNo);
				$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+lrNumber+'</a>');
				$(damageDateCol).append(damageDate);
				$(branchCol).append(branch);
				$(damageNumberCol).append(damageNumber);
				$(userNameCol).append(userName);
				$(articleTypeCol).append(articleType);
				$(tottalArticleCol).append(totalArticle);
				$(saidToContainCol).append(saidToContain);
				$(damageArticleCol).append(damageArticle);
				$(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
				$(turNumberCol).append('<a href="javascript:openWindowForView('+receivedLedgerId+', '+turNumber+', 4, 0, 0, 0)">'+turNumber+'</a>');
				
				if(privateMark != null && privateMark != '') {
					$(privateMarkCol).append(privateMark);
				} else {
					$(privateMarkCol).append('-----');
				}
				
				$(remarkCol).append(remark);
				$(pendingDaysCol).append(pendingDays);
				
				if(data.branchId != branchId) {
					$(settlementCol).append('<a href="#" class="btn blue" onclick="cannotSettle();">Click</a>');
				} else {
					$(settlementCol).append('<a href="#" class="btn blue" onclick="findDamageDetailsForSettlement1('+damageReceiveId+');">Click</a>');
				}
				
				$("#pendingShortSettlementList").append(row);
										
				if(configuration.isLrNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(2)').hide();
					changeDisplayProperty('lrNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isDamageDateColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(3)').hide();
					changeDisplayProperty('shortDate_s'+(i+1), 'none');
				}

				if(configuration.isDamageBranchColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(4)').hide();
					changeDisplayProperty('branch_s'+(i+1), 'none');
				}
				
				if(configuration.isDamageNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(5)').hide();
					changeDisplayProperty('shortNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isDamageUserColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(6)').hide();
					changeDisplayProperty('userName_s'+(i+1), 'none');
				}
				
				if(configuration.isArticleTypeColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(7)').hide();
					changeDisplayProperty('articleType_s'+(i+1), 'none');
				}
				
				if(configuration.isTotalArticleColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(8)').hide();
					changeDisplayProperty('totalArticle_s'+(i+1), 'none');
				}
				
				if(configuration.isSaidToContainColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(9)').hide();
					changeDisplayProperty('saidToContain_s'+(i+1), 'none');
				}
				
				if(configuration.isDamageArticleColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(11)').hide();
					changeDisplayProperty('damageArticle_s'+(i+1), 'none');
				}
				
				if(configuration.isLsNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(14)').hide();
					changeDisplayProperty('lsNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isTurNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(15)').hide();
					changeDisplayProperty('turNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isPrivateMarkColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(16)').hide();
					changeDisplayProperty('privateMark_s'+(i+1), 'none');
				}
				
				if(configuration.isRemarkColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(17)').hide();
					changeDisplayProperty('remark_s'+(i+1), 'none');
				}
				
				if(configuration.isPendingDaysColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(18)').hide();
					changeDisplayProperty('pendingDays_s'+(i+1), 'none');
				}
				
				if(filter == 2) {
					if(configuration.isDamageSettlementButtonDisplay == 'false') {
						$('#pendingShortSettlementList th:nth-child(19)').hide();
						changeDisplayProperty('hideShowShortSettleButton_'+(i+1), 'none');
					}
				}
			}

			if(configuration.isTotalDamageRowDisplay == 'true') {
				if(data.valueObjectForTotal) {
					var valueObjectForTotal		= data.valueObjectForTotal;
					
					var totalArticle				= 0;
					var totalDamageArt				= 0;
					
					if(valueObjectForTotal.totalNoOfArticle) {
						totalArticle	= valueObjectForTotal.totalNoOfArticle;
					}
					
					if(valueObjectForTotal.totalDamageArticle) {
						totalDamageArt	= valueObjectForTotal.totalDamageArticle;
					}
	
					var totalRow		= createRow('totalRow', 'background-color: lightgrey');
					
					var totalCol			= createNewColumn(totalRow, '', 'titletd', '5%', '', 'font-weight: bold', '');
					
					appendValueInTableCol(totalCol, 'Total');
					
					if(configuration.isLrNumberColumnDisplay == 'true') {
						var blankCol1			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol1, '');
					}
					
					if(configuration.isDamageDateColumnDisplay == 'true') {
						var blankCol2			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol2, '');
					}
					
					if(configuration.isDamageBranchColumnDisplay == 'true') {
						var blankCol3			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol3, '');
					}
					
					if(configuration.isDamageNumberColumnDisplay == 'true') {
						var blankCol4			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol4, '');
					}
					
					if(configuration.isDamageUserColumnDisplay == 'true') {
						var blankCol5			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol5, '');
					}
					
					if(configuration.isArticleTypeColumnDisplay == 'true') {
						var blankCol6			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol6, '');
					}

					if(configuration.isTotalArticleColumnDisplay == 'true') {
						var totalArtCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
						appendValueInTableCol(totalArtCol, totalArticle);
					}

					if(configuration.isSaidToContainColumnDisplay == 'true') {
						var blankCol7			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol7, '');
					}
					
					if(configuration.isDamageArticleColumnDisplay == 'true') {
						var totalDamageArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
						appendValueInTableCol(totalDamageArtCol, totalDamageArt);
					}
					
					if(configuration.isLsNumberColumnDisplay == 'true') {
						var blankCol8			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol8, '');
					}
					
					if(configuration.isTurNumberColumnDisplay == 'true') {
						var blankCol9			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol9, '');
					}
					
					if(configuration.isPrivateMarkColumnDisplay == 'true') {
						var blankCol10			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol10, '');
					}
					
					if(configuration.isRemarkColumnDisplay == 'true') {
						var blankCol11			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol11, '');
					}
					
					if(configuration.isPendingDaysColumnDisplay == 'true') {
						var blankCol12			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
						appendValueInTableCol(blankCol12, '');
					}
					
					if(filter == 2) {
						if(configuration.isDamageSettlementButtonDisplay == 'true') {
							var blankCol13			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
							appendValueInTableCol(blankCol13, '');
						}
					}
					
					$('#totalRow').append(totalRow);
				}
			}
		}
		
		hideLayer();
	}
}
