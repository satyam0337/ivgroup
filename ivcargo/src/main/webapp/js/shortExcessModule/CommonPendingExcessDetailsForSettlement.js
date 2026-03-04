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
		
		if(pendingExSettlement.length > 0) {
			
			for(var i = 0; i < pendingExSettlement.length; i++) {
				pendingExcessReceive	= pendingExSettlement[i];
				
				var srNo			= (i+1);
				var lrNumber		= pendingExcessReceive.wayBillNumber;
				var wayBillId		= pendingExcessReceive.wayBillId;
				var excessDate		= pendingExcessReceive.excessDate;
				var branch			= pendingExcessReceive.branchName;
				var branchId		= pendingExcessReceive.branchId;
				var excessNumber	= pendingExcessReceive.excessNumber;
				var excessReceiveId	= pendingExcessReceive.excessReceiveId;
				var userName		= pendingExcessReceive.userName;						
				var articleType		= pendingExcessReceive.packingType;
				var noOfArticle		= pendingExcessReceive.excessArticle;
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
				
				var excessRow		= createRow('excessRow_'+(i+1), '');
				
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
				
				$("#pendingExcessSettlementList").append(excessRow);
				
				if(configuration.isLrNumberColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(2)').hide();
					document.getElementById('lrNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessDateColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(3)').hide();
					document.getElementById('excessDate_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessBranchColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(4)').hide();
					document.getElementById('branch_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessNumberColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(5)').hide();
					document.getElementById('excessNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessUserColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(6)').hide();
					document.getElementById('userName_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isArticleTypeColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(7)').hide();
					document.getElementById('articleType_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessArticleColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(8)').hide();
					document.getElementById('noOfArticle_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isSaidToContainColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(9)').hide();
					document.getElementById('saidTocontain_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessWeightColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(10)').hide();
					document.getElementById('excessWeight_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isLsNumberColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(11)').hide();
					document.getElementById('lsNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isTurNumberColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(12)').hide();
					document.getElementById('turNumber_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isPrivateMarkColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(13)').hide();
					document.getElementById('privateMark_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isRemarkColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(14)').hide();
					document.getElementById('remark_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isPendingDaysColumnDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(15)').hide();
					document.getElementById('pendingDays_s'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isExcessSettlementButtonDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(16)').hide();
					document.getElementById('hideShowExcessSettleButton_'+(i+1)).style.display = 'none';
				}
				
				if(configuration.isShortDetailsDisplay == 'false') {
					$('#pendingExcessSettlementList th:nth-child(17)').hide();
					document.getElementById('ShortCol_s'+(i+1)).style.display = 'none';
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
		
		hideLayer();
	}
}