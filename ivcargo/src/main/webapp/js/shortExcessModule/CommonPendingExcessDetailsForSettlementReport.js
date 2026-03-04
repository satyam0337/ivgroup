/**
 * Include this file into Pending excess details for settlement page and report page
 */

function cannotSettle() {
	showMessage('info', otherUserCannotSettleInfoMsg);
	return false;
}

function commonExcessDetails(data, filter) {
	var configuration		= data.configuration;
	
	console.log(configuration);
	
	showLayer();
	if(data.pendingExSettlementCall) {
		
		var pendingExSettlement = data.pendingExSettlementCall;
		var accountGroupId		= data.accountGroupId;
		if(pendingExSettlement.length > 0) {
			
			for(var i = 0; i < pendingExSettlement.length; i++) {
				pendingExcessReceive	= pendingExSettlement[i];
				var accountGroupId		= data.accountGroupId;
				var accountGroupLMT		= 201;
				
				var srNo			= (i+1);
				var lrNumber		= pendingExcessReceive.wayBillNumber;
				var wayBillId		= pendingExcessReceive.wayBillId;
				var excessDate		= pendingExcessReceive.excessDate;
				var excessArticle	= pendingExcessReceive.excessArticle;
				var branch			= pendingExcessReceive.branchName;
				var branchId		= pendingExcessReceive.branchId;
				var excessNumber	= pendingExcessReceive.excessNumber;
				var excessReceiveId	= pendingExcessReceive.excessReceiveId;
				var userName		= pendingExcessReceive.userName;						
				var articleType		= pendingExcessReceive.packingType;
				var noOfArticle		= pendingExcessReceive.quantity;
				var pendingExcess	= pendingExcessReceive.pendingExcess;
				var saidTocontain	= pendingExcessReceive.saidToContain;
				var excessWeight	= pendingExcessReceive.weight;
				var lsNumber		= pendingExcessReceive.lsNumber;
				var dispatchId		= pendingExcessReceive.dispatchLedgerId;	
				var turNumber		= pendingExcessReceive.turNumber;
				var privateMark		= pendingExcessReceive.privateMark;
				var remark			= pendingExcessReceive.remark;							
				var pendingDays		= pendingExcessReceive.pendingDays;
				var Short			= pendingExcessReceive.shortReceiveId;
				var receivedLedgerId = pendingExcessReceive.receivedLedgerId;
				var packingTypeId	 = pendingExcessReceive.packingTypeMasterId;
				var totalValue		= pendingExcessReceive.declaredValue;
				var articleQuantity	= pendingExcessReceive.quantity;
				var excessValue		= pendingExcessReceive.excessValue;
				var destBranch		= pendingExcessReceive.lrDestinationBranch;
				var srcBranch		= pendingExcessReceive.lrSourceBranch;
				var srcBranch		= pendingExcessReceive.lrSourceBranch;
				var turBranchId		= pendingExcessReceive.turBranchId;
				var turBranchName	= pendingExcessReceive.turBranchName;
				
				var excessRow		= createRow('excessRow_'+(i+1), '');
				if(accountGroupId == accountGroupLMT){
					var srNoCol				= createNewColumn(excessRow, 'srNo_'+(i+1), 'datatd', '', '', '', '');
					var lrNumberCol			= createNewColumn(excessRow, 'lrNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
					var srcBranchCol		= createNewColumn(excessRow, 'srcBranch_s'+(i+1), 'datatd', '', '', '', '');
					var destBranchCol		= createNewColumn(excessRow, 'destBranch_s'+(i+1), 'datatd', '', '', '', '');
					var noOfArticleCol		= createNewColumn(excessRow, 'noOfArticle_s'+(i+1), 'datatd', '', '', '', '');
					var articleTypeCol		= createNewColumn(excessRow, 'articleType_s'+(i+1), 'datatd', '', '', '', '');
					var saidTocontainCol	= createNewColumn(excessRow, 'saidTocontain_s'+(i+1), 'datatd', '', '', '', '');
					var excessDateCol		= createNewColumn(excessRow, 'excessDate_s'+(i+1), 'datatd', '', '', '', '');
					var branchCol			= createNewColumn(excessRow, 'branch_s'+(i+1), 'datatd', '', '', '', '');
					var excessNumberCol		= createNewColumn(excessRow, 'excessNumber_s'+(i+1), 'datatd', '', '', 'background-color: #FFFFFF;', '');
					var excessArticleCol	= createNewColumn(excessRow, 'excessArticle_s'+(i+1), 'datatd', '', '', 'background-color: #FFFFFF;', '');
					var excessWeightCol		= createNewColumn(excessRow, 'excessWeight_s'+(i+1), 'datatd', '', '', '', '');
					var lsNumberCol			= createNewColumn(excessRow, 'lsNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
					var turNumberCol		= createNewColumn(excessRow, 'turNumber_s'+(i+1), 'datatd', '', '', '', '');
					var remarkCol			= createNewColumn(excessRow, 'remark_s'+(i+1), 'datatd', '', '', '', '');
					var totalValueCol		= createNewColumn(excessRow, 'totalValue_s'+(i+1), 'datatd', '', '', '', '');
					var excessValueCol			= createNewColumn(excessRow, 'excessValue_s'+(i+1), 'datatd', '', '', '', '');
					var pendingDaysCol		= createNewColumn(excessRow, 'pendingDays_s'+(i+1), 'datatd', '', '', '', '');
					var userNameCol			= null;
					if(data.userName != userName) {
						userNameCol			= createNewColumn(excessRow, 'userName_s'+(i+1), 'datatd', '', '', '', '');
					} else {
						userNameCol			= createNewColumn(excessRow, 'userName_s'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
					}
					
					$(srNoCol).append(srNo);
					if(lrNumber != '-----') {
						$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+lrNumber+'</a>');
					} else {
						$(lrNumberCol).append('-----');
					}
					$(srcBranchCol).append(srcBranch);
					$(destBranchCol).append(destBranch);
					$(noOfArticleCol).append(noOfArticle);
					$(articleTypeCol).append(articleType);
					$(saidTocontainCol).append(saidTocontain);
					$(excessDateCol).append(excessDate);
					$(branchCol).append(branch);
					$(excessNumberCol).append(excessNumber);
					$(excessArticleCol).append(excessArticle);
					$(excessWeightCol).append(excessWeight);
					if(lsNumber != '-----') {
						$(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
					} else {
						$(lsNumberCol).append('-----');
					}
					$(turNumberCol).append('<a href="javascript:openWindowForView('+receivedLedgerId+', '+turNumber+', 4, '+turBranchId+', 0, 0)">'+turNumber+'</a>');
					$(remarkCol).append(remark);
					$(totalValueCol).append(totalValue);
					$(excessValueCol).append(excessValue);	
					$(pendingDaysCol).append(pendingDays);
					$(userNameCol).append(userName);

				}else{
					var srNoCol				= createNewColumn(excessRow, 'srNo_'+(i+1), 'datatd', '', '', '', '');
					var lrNumberCol			= createNewColumn(excessRow, 'lrNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
					var excessDateCol		= createNewColumn(excessRow, 'excessDate_s'+(i+1), 'datatd', '', '', '', '');
					var branchCol			= createNewColumn(excessRow, 'branch_s'+(i+1), 'datatd', '', '', '', '');
					var excessNumberCol		= createNewColumn(excessRow, 'excessNumber_s'+(i+1), 'datatd', '', '', 'background-color: #FFFFFF;', '');

					var userNameCol			= null;

					if(data.userName != userName) {
						userNameCol			= createNewColumn(excessRow, 'userName_s'+(i+1), 'datatd', '', '', '', '');
					} else {
						userNameCol			= createNewColumn(excessRow, 'userName_s'+(i+1), 'datatd', '', '', 'background-color: #EEE8AA;', '');
					}

					var articleTypeCol		= createNewColumn(excessRow, 'articleType_s'+(i+1), 'datatd', '', '', '', '');
					var noOfArticleCol		= createNewColumn(excessRow, 'noOfArticle_s'+(i+1), 'datatd', '', '', '', '');
					var pendingExcessCol	= createNewColumn(excessRow, 'pendingExcess_s'+(i+1), 'datatd', '', '', '', '');
					var saidTocontainCol	= createNewColumn(excessRow, 'saidTocontain_s'+(i+1), 'datatd', '', '', '', '');
					var excessWeightCol		= createNewColumn(excessRow, 'excessWeight_s'+(i+1), 'datatd', '', '', '', '');
					var lsNumberCol			= createNewColumn(excessRow, 'lsNumber_s'+(i+1), 'datatd', '', '', 'background-color: #E6E6FA;', '');
					var turNumberCol		= createNewColumn(excessRow, 'turNumber_s'+(i+1), 'datatd', '', '', '', '');
					var privateMarkCol		= createNewColumn(excessRow, 'privateMark_s'+(i+1), 'datatd', '', '', '', '');
					var remarkCol			= createNewColumn(excessRow, 'remark_s'+(i+1), 'datatd', '', '', '', '');
					var pendingDaysCol		= createNewColumn(excessRow, 'pendingDays_s'+(i+1), 'datatd', '', '', '', '');

					var settlementCol		= null;

					if(filter == 2) {
						settlementCol		= createNewColumn(excessRow, 'hideShowExcessSettleButton_'+(i+1), 'datatd', '', '', '', '');
					}

					var ShortCol			= createNewColumn(excessRow, 'ShortCol_s'+(i+1), 'datatd', '', '', '', '');
					$(srNoCol).append(srNo);

					if(lrNumber != '-----') {
						$(lrNumberCol).append('<a href="javascript:openWindowForLRView('+wayBillId+', 1, 0)">'+lrNumber+'</a>');
					} else {
						$(lrNumberCol).append('-----');
					}

					$(excessDateCol).append(excessDate);
					$(branchCol).append(branch);
					$(excessNumberCol).append(excessNumber);
					$(userNameCol).append(userName);
					$(articleTypeCol).append(articleType);
					$(noOfArticleCol).append(noOfArticle);
					$(pendingExcessCol).append(pendingExcess);
					$(saidTocontainCol).append(saidTocontain);
					$(excessWeightCol).append(excessWeight);
					if(lsNumber != '-----') {
						$(lsNumberCol).append('<a href="javascript:openWindowForView('+dispatchId+', '+lsNumber+', 2, 0, 0, 0)">'+lsNumber+'</a>');
					} else {
						$(lsNumberCol).append('-----');
					}

					$(turNumberCol).append('<a href="javascript:openWindowForView('+receivedLedgerId+', '+turNumber+', 4, 0, 0, 0)">'+turNumber+'</a>');
					$(privateMarkCol).append(privateMark);
					$(remarkCol).append(remark);
					$(pendingDaysCol).append(pendingDays);

					if(data.branchId != branchId) {
						$(settlementCol).append('<a href="#" class="btn blue" onclick="cannotSettle();">Click</a>');
					} else {
						$(settlementCol).append('<a href="#" class="btn blue" onclick="findExcessDetailsForSettlement1('+excessReceiveId+');">Click</a>');
					}

					if(Short > 0 &&  Short != null){
						$(ShortCol).append('<a href="#" class="btn blue" onclick="getShortDetailsByWaybillId('+wayBillId+','+packingTypeId+');">Sh. Dtls.</a>');
					}else{
						$(ShortCol).append('');
					}
				}
				$("#pendingExcessSettlementList").append(excessRow);
				
				if(configuration.isLrNumberColumnDisplay == 'false') {
					document.getElementById('lrNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessDateColumnDisplay == 'false') {
					document.getElementById('excessDate_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessBranchColumnDisplay == 'false') {
					document.getElementById('branch_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessNumberColumnDisplay == 'false') {
					document.getElementById('excessNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessUserColumnDisplay == 'false') {
					document.getElementById('userName_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isArticleTypeColumnDisplay == 'false') {
					document.getElementById('articleType_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessArticleColumnDisplay == 'false') {
					document.getElementById('noOfArticle_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isSaidToContainColumnDisplay == 'false') {
					document.getElementById('saidTocontain_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessWeightColumnDisplay == 'false') {
					document.getElementById('excessWeight_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isLsNumberColumnDisplay == 'false') {
					document.getElementById('lsNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isTurNumberColumnDisplay == 'false') {
					document.getElementById('turNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isPrivateMarkColumnDisplay == 'false') {
					document.getElementById('privateMark_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isRemarkColumnDisplay == 'false') {
					document.getElementById('remark_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isPendingDaysColumnDisplay == 'false') {
					document.getElementById('pendingDays_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessSettlementButtonDisplay == 'false') {
					document.getElementById('hideShowExcessSettleButton_'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isTotalValueColumn == 'false') {
					document.getElementById('totalValue_s'+(i+1)).style.display = 'none';
				}
				if(configuration.isExcessValueColumn == 'false') {
					document.getElementById('excessValue_s'+(i+1)).style.display = 'none';
				}
			}
			if(accountGroupId == accountGroupLMT){
				if(data.valueObjectForTotal) {
					var valueObjectForTotal	= data.valueObjectForTotal;
					console.log('valueObjectForTotal --- ', valueObjectForTotal)
					var totalExcessArticle	= 0;
					var totalNoOfArticles	= 0;
					var totalExcessWeight	= 0;
					var totalDeclaredValue	= 0;
					var totalExcessValue	= 0;
					
					if(valueObjectForTotal.totalExcessArticle) {
						totalExcessArticle		= valueObjectForTotal.totalExcessArticle;
					}
					if(valueObjectForTotal.totalNoOfArticles) {
						totalNoOfArticles		= valueObjectForTotal.totalNoOfArticles;
					}

					if(valueObjectForTotal.totalExcessWeight) {
						totalExcessWeight		= valueObjectForTotal.totalExcessWeight;
					}
					
					if(valueObjectForTotal.totalDeclaredValue) {
						totalDeclaredValue		= valueObjectForTotal.totalDeclaredValue;
					}
					
					if(valueObjectForTotal.totalExcessValue) {
						totalExcessValue		= valueObjectForTotal.totalExcessValue;
					}

					var totalRow		= createRow('totalRow', 'background-color: lightgrey');

					var blankCol		= createNewColumn(totalRow, '', 'titletd', '', '', 'font-weight: bold', '');
					var blankCol1		= createNewColumn(totalRow, '', 'titletd', '', '', '', '3');
					var excessArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol4		= createNewColumn(totalRow, '', 'titletd', '', '', '', '3');
					var blankCol5		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol7		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var excessArtCol2	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var excessWeightCol= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol6		= createNewColumn(totalRow, '', 'titletd', '', '', '', '3');
					var blankCol61		= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol62		= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol6		= createNewColumn(totalRow, '', 'titletd', '', '', '', '2');

					$(blankCol).append('Total');
					$(blankCol1).append();
					$(excessArtCol).append(totalNoOfArticles);
					$(blankCol4).append();
					$(blankCol5).append();
					$(blankCol7).append();
					$(excessArtCol2).append(totalExcessArticle);
					$(excessWeightCol).append(totalExcessWeight);
					$(blankCol6).append();
					$(blankCol61).append(totalDeclaredValue);
					$(blankCol62).append(totalExcessValue);
					$(blankCol6).append();

					$("#totalRow").append(totalRow);
					$("#totalRow1").append(totalRow);
				}
			}else{

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
					var blankCol1		= createNewColumn(totalRow, '', 'titletd', '', '', '', '6');
					var excessArtCol	= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol4		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var blankCol5		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');
					var excessWeightCol= createNewColumn(totalRow, '', 'titletd', '', '', 'background-color: #F5DEB3; font-weight: bold', '');
					var blankCol6		= createNewColumn(totalRow, '', 'titletd', '', '', '', '6');
					var blankCol7		= createNewColumn(totalRow, '', 'titletd', '', '', '', '');


					$(blankCol).append('Total');
					$(blankCol1).append();
					$(excessArtCol).append(totalExcessArticle);
					$(blankCol4).append();
					$(blankCol5).append();
					$(excessWeightCol).append(totalExcessWeight);
					$(blankCol6).append();
					$(blankCol7).append();

					$("#totalRow").append(totalRow);
					$("#totalRow1").append(totalRow);
				}
			}
		}
		
		hideLayer();
	}
}