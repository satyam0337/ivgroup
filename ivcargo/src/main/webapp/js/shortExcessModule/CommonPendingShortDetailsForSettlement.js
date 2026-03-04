/**
 * Please include this file into Pending Short register settlement page and report page
 */

function cannotSettle() {
	showMessage('info', otherUserCannotSettleInfoMsg);
	return false;
}

function commonShortDetails(data, filter) {
	var configuration			= data.configuration;
	var totalPendingArticle		= 0;
	
	showLayer();
	if(data.pendingShSettlementCall) {
		
		var pendingShSettlement = data.pendingShSettlementCall;
		
		if(pendingShSettlement.length > 0) {
			for(var i = 0; i < pendingShSettlement.length; i++) {
				pendingShortReceive	= pendingShSettlement[i];
				
				var srNo			= (i+1);
				var lrNumber		= pendingShortReceive.wayBillNumber;
				var wayBillId		= pendingShortReceive.wayBillId;
				var shortDate		= pendingShortReceive.shortDate;
				var branch			= pendingShortReceive.branchName;
				var branchId		= pendingShortReceive.branchId;
				var shortReceiveId	= pendingShortReceive.shortReceiveId;	
				var shortNumber		= pendingShortReceive.shortNumber;		
				var userName		= pendingShortReceive.userName;	
				var articleType		= pendingShortReceive.packingType;
				var totalArticle	= pendingShortReceive.totalArticle;
				var saidToContain	= pendingShortReceive.saidToContain;
				var shortArticle	= pendingShortReceive.shortArticle;
				var pendingArticle	= pendingShortReceive.pendingShort;
				var damageArticle	= pendingShortReceive.damageArticle;
				var shortWeight		= pendingShortReceive.shortWeight;
				var amount			= pendingShortReceive.amount;
				var lsNumber		= pendingShortReceive.lsNumber;
				var dispatchId		= pendingShortReceive.dispatchLedgerId;
				var turNumber		= pendingShortReceive.turNumber;
				var privateMark		= pendingShortReceive.privateMark;
				var remark			= pendingShortReceive.remark;							
				var pendingDays		= pendingShortReceive.pendingDays;
				var Excess			= pendingShortReceive.excessReceiveId;
				var receivedLedgerId= pendingShortReceive.receivedLedgerId;
				var packingTypeId	= pendingShortReceive.packingTypeId;
				
				totalPendingArticle	+= pendingArticle;
				
				//Please include createDom.js file to create dynamic table
				
				var row				= createRow('', '');
				
				var	srNoCol				= createNewColumn(row, 'srNo_'+(i+1), 'datatd', '', '', '', '');
				var lrNumberCol			= createNewColumn(row, 'lrNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
				var shortDateCol		= createNewColumn(row, 'shortDate_s'+(i+1), 'datatd', '', '', '', '');
				var branchCol			= createNewColumn(row, 'branch_s'+(i+1), 'datatd', '', '', '', '');
				var shortNumberCol		= createNewColumn(row, 'shortNumber_s'+(i+1), 'datatd', '', '', '', '');
				
				var userNameCol		= null;
				
				if(data.userName != userName) {
					userNameCol			= createNewColumn(row, 'userName_s'+(i+1), 'datatd', '', '', '', '');
				} else {
					userNameCol			= createNewColumn(row, 'userName_s'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
				}
				
				var articleTypeCol		= createNewColumn(row, 'articleType_s'+(i+1), 'datatd', '', '', '', '');
				var tottalArticleCol	= createNewColumn(row, 'totalArticle_s'+(i+1), 'datatd', '', '', '', '');
				var saidToContainCol	= createNewColumn(row, 'saidToContain_s'+(i+1), 'datatd', '', '', '', '');
				var shortArticleCol		= createNewColumn(row, 'shortArticle_s'+(i+1), 'datatd', '', '', '', '');
				var pendingArticleCol	= createNewColumn(row, 'pendingArticle_s'+(i+1), 'datatd', '', '', '', '');
				var shortWeightCol		= createNewColumn(row, 'shortWeight_s'+(i+1), 'datatd', '', '', '', '');
				var amountCol			= createNewColumn(row, 'amount_s'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
				var lsNumberCol			= createNewColumn(row, 'lsNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
				var turNumberCol		= createNewColumn(row, 'turNumber_s'+(i+1), 'datatd', '', '', '', '');
				var privateMarkCol		= createNewColumn(row, 'privateMark_s'+(i+1), 'datatd', '', '', '', '');
				var remarkCol			= createNewColumn(row, 'remark_s'+(i+1), 'datatd', '', '', '', '');
				var pendingDaysCol		= createNewColumn(row, 'pendingDays_s'+(i+1), 'datatd', '', '', '', '');
				
				var settlementCol	= null;
				
				if(filter == 2) {
					settlementCol	= createNewColumn(row, 'hideShowShortSettleButton_'+(i+1), 'datatd', '', '', '', '');
				}
				var ExcessCol			= createNewColumn(row, 'ExcessCol_s'+(i+1), 'datatd', '', '', '', '');
				
				$(srNoCol).append(srNo);
				$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+lrNumber+'</a>');
				$(shortDateCol).append(shortDate);
				$(branchCol).append(branch);
				$(shortNumberCol).append(shortNumber);
				$(userNameCol).append(userName);
				$(articleTypeCol).append(articleType);
				$(tottalArticleCol).append(totalArticle);
				$(saidToContainCol).append(saidToContain);
				$(shortArticleCol).append(shortArticle);
				$(pendingArticleCol).append(pendingArticle);
				$(shortWeightCol).append(shortWeight);
				$(amountCol).append(amount);
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
					$(settlementCol).append('<a href="#" class="btn blue" onclick="getShortDetailsByWaybillIdForSettlemnt('+wayBillId+','+shortReceiveId+','+packingTypeId+',1);">Click</a>');
				}
				if(Excess > 0 &&  Excess != null){
					$(ExcessCol).append('<a href="#" class="btn blue" onclick="getExcessDetailsByWaybillId('+wayBillId+');">Ex. Dtls.</a>');
				}else{
					$(ExcessCol).append('');
				}
				
				$("#pendingShortSettlementList").append(row);
										
				if(configuration.isLrNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(2)').hide();
					changeDisplayProperty('lrNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isShortDateColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(3)').hide();
					changeDisplayProperty('shortDate_s'+(i+1), 'none');
				}

				if(configuration.isShortBranchColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(4)').hide();
					changeDisplayProperty('branch_s'+(i+1), 'none');
				}
				
				if(configuration.isShortNumberColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(5)').hide();
					changeDisplayProperty('shortNumber_s'+(i+1), 'none');
				}
				
				if(configuration.isShortUserColumnDisplay == 'false') {
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
					changeDisplayProperty('shortDate_s'+(i+1), 'none');
					document.getElementById('saidToContain_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isShortArticleColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(10)').hide();
					changeDisplayProperty('shortDate_s'+(i+1), 'none');
					document.getElementById('shortArticle_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isShortWeightColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(12)').hide();
					changeDisplayProperty('shortWeight_s'+(i+1), 'none');
				}
				
				if(configuration.isShortAmountColumnDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(13)').hide();
					changeDisplayProperty('amount_s'+(i+1), 'none');
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
				
				if(configuration.isShortSettlementButtonDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(19)').hide();
					changeDisplayProperty('hideShowShortSettleButton_'+(i+1), 'none');
				}
				
				if(configuration.isExcessDetailsDisplay == 'false') {
					$('#pendingShortSettlementList th:nth-child(20)').hide();
					changeDisplayProperty('ExcessCol_s'+(i+1), 'none');
				}
			}
	
			if(configuration.isTotalShortRowDisplay == 'true') {
				if(data.valueObjectForTotal) {
					var valueObjectForTotal		= data.valueObjectForTotal;
					
					var totalShortWeight			= 0;
					var totalAmount					= 0;
					var totalArticle				= 0;
					var totalShortArt				= 0;
					var totalPendingShortArt		= 0;
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
					
					totalPendingShortArt	= valueObjectForTotal.totalPendingShort;
	
					var totalRow		= createRow('totalRow', 'background-color: lightgrey');
					
					var totalCol			= createNewColumn(totalRow, '', 'titletd', '5%', '', 'font-weight: bold', '');
					var blankCol1			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol202			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol99			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol100			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol101			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol102			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					/*var blankCol103			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');*/
					
					if(configuration.isTotalArticleColumnDisplay == 'true') {
						totalArtCol			= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					}
					
					var blankCol2			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					
					if(configuration.isShortArticleColumnDisplay == 'true') {
						totalShortArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					}
					
					totalDamageArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					
					if(configuration.isShortWeightColumnDisplay == 'true') {
						totalShortWeightCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					}
					
					if(configuration.isShortAmountColumnDisplay == 'true') {
						ammountCol 			= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					}
					
					var blankCol10			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol104			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol105			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol106			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol107			= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					
					var blankCol15		= null;
					var blankCol17 		= null;
					
					blankCol15		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					
					if(filter == 2) {
						blankCol16		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					}
					
					$(totalCol).append('Total');
					$(blankCol1).append();
					
					if(configuration.isTotalArticleColumnDisplay == 'true') {
						$(totalArtCol).append(totalArticle);
					}	
					
					$(blankCol2).append();
					
					if(configuration.isShortArticleColumnDisplay == 'true') {
						$(totalShortArtCol).append(totalShortArt);
					}
					
					$(totalDamageArtCol).append(totalPendingArticle);
					
					if(configuration.isShortWeightColumnDisplay == 'true') {
						$(totalShortWeightCol).append(totalShortWeight);
					}
					
					//$(ammountCol).append('Rs. '+totalAmount+' /-');
					if(configuration.isShortAmountColumnDisplay == 'true') {
						$(ammountCol).append(totalAmount);
					}
					
					//$(blankCol1).append();
					$(blankCol202).append();
					$(blankCol10).append();
					$(blankCol15).append();
					$(blankCol99).append();
					$(blankCol100).append();
					$(blankCol101).append();
					$(blankCol102).append();
					$(blankCol104).append();
					$(blankCol105).append();
					$(blankCol106).append();
					$(blankCol107).append();
	
					$('#totalRow').append(totalRow);
				}
			}
		}
		
		hideLayer();
	}
}
