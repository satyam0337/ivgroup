/**
 * @author Anant Chaudhary	15-11-2015
 */
var flagForExcess 	= false;
function findExcessDetailsForSettlement() {
	var filter		 = 1;
	
	var jsonObject 	= new Object();
	
	if($("#searchType").val() == "1"){
		jsonObject.ExcessNumber = $("#wayBillNumber").val();
	}else if($("#searchType").val() == "2"){
		jsonObject.ExcessNumber = $("#excessNumber").val();
	}
	jsonObject.filter			= filter;
	jsonObject.searchType		= $("#searchType").val();
	var jsonStr	= JSON.stringify(jsonObject);
	console.log(jsonStr)
	$.getJSON("FindExcessDetailsForSettlement.do?pageId=330&eventId=6", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					//alert(data.errorDescription);
					
					changeDisplayProperty('bottom-border-boxshadow', 'none');
					
					closeJqueryDialog('dialogExcessForm');
					
					hideLayer();
				} else {
					hideAllMessages();
					
					if(data.excessReceiveCall){
						var excessArticleDetails		= data.excessReceiveCall;
						
						if(excessArticleDetails.length > 0) {
							var excessArt	= excessArticleDetails[0];

							if(excessArticleDetails.length > 1) {
								openDialog('dialogExcessFormOnDamagePendingForm');
								populateExcessTbl(data);
							} else {
								findExcessDetailsForSettlement1(excessArt.excessReceiveId,flagForExcess);
							}
						}
					}
				}
			})
	
}

function populateExcessTbl(excessData){
	
	if(excessData.excessReceiveCall){
		var excessReceiveDetails		= excessData.excessReceiveCall;
		
		$('#excessReceiveDetail tbody tr').remove();
		$("#LRNOID").html(excessReceiveDetails[0].wayBillNumber);
		for(var i = 0; i < excessReceiveDetails.length; i++) {
			var excessDetails	= excessReceiveDetails[i];
			
			var excessRow		= createRow('tr_'+excessDetails.excessReceiveId, '');
			
			var excessId1		= createColumn(excessRow ,'td_'+excessDetails.excessReceiveId,'10%','center','','');
			var excessNumber1	= createColumn(excessRow ,'td_'+excessDetails.excessNumber,'10%','center','','');
			var lrNumber		= createColumn(excessRow ,'td_'+excessDetails.wayBillNumber,'10%','center','','');
			var LsNumber		= createColumn(excessRow ,'td_'+excessDetails.lsNumber,'10%','center','','');
			var excessBranch	= createColumn(excessRow ,'td_'+excessDetails.branchName,'10%','center','','');
			var excessDate		= createColumn(excessRow ,'td_'+excessDetails.excessReceiveDate,'10%','center','','');
			var NoofAtcl		= createColumn(excessRow ,'td_'+excessDetails.excessArticle,'10%','center','','');
			
			$(excessId1).append(createInputForExcessSettlement(excessDetails.excessReceiveId));
			$(excessNumber1).append(excessDetails.excessNumber);
			$(lrNumber).append(excessDetails.wayBillNumber);
			$(LsNumber).append(excessDetails.lsNumber);
			$(excessBranch).append(excessDetails.branchName);
			$(excessDate).append(excessDetails.excessReceiveDate);
			$(NoofAtcl).append(excessDetails.excessArticle);

			$('#excessReceiveDetail').append(excessRow);
			  
		}
	}
}

function createInputForExcessSettlement(i) {
	var excessSettlementRadioFeild	= $("<input/>", { 
		type			: 'radio', 
		id				: 'excessReceiveId_' + i,
		name			: 'excessReceive',
		value			: i});

	return excessSettlementRadioFeild;
}

function loadSelectedOption(){  
	if($("#searchType").val() == "1"){
		$("#lrNumberDiv").removeClass('hide');
		$("#excessNumberDiv").addClass('hide');
	}else if($("#searchType").val() == "2"){
		$("#lrNumberDiv").addClass('hide');
		$("#excessNumberDiv").removeClass('hide');
	}else{
		$("#lrNumberDiv").addClass('hide');
		$("#excessNumberDiv").addClass('hide');
	}
}

function findExcessDetailsForSettlement1(excessReceiveId,flagForExcess) {
	var filter		 = 2;
	commonExcess(null,excessReceiveId,filter);
	openDialog('dialogExcessForm');
}

function setFlagForMultipleExcessSettlement(flag){
	flagForExcess = flag;
	closeJqueryDialog('dialogExcessFormOnDamagePendingForm');
	findExcessDetailsForSettlement1($('input[name=excessReceive]:checked').val(),flag);
}

function commonExcess(excessNumber,excessReceiveId,filter) {
	
	var jsonObject 	= new Object();
	var jsonObjectOut;
	
	jsonObjectOut = new Object();
	
	jsonObjectOut.ExcessNumber		= excessNumber;
	jsonObjectOut.ExcessReceiveId	= excessReceiveId;
	jsonObjectOut.filter			= filter;
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);
	showLayer();
	
	$.getJSON("FindExcessDetailsForSettlement.do?pageId=330&eventId=6",
			{json:jsonStr}, function(data) {
				
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					//alert(data.errorDescription);
					
					changeDisplayProperty('bottom-border-boxshadow', 'none');
					
					closeJqueryDialog('dialogExcessForm');
					
					hideLayer();
				} else {
					hideAllMessages();
					
					var configuration				= data.configuration;
					
					$("#excessReceiveDetails tbody tr").remove();
					$("#excessArtDetailsForExcessSettle tbody tr").remove();
					$("#shortArtDetailsForExcessSettle tbody tr").remove();
					
					changeDisplayProperty('bottom-border-boxshadow', 'block');
					
					if(data.excessReceiveCall) {
						var excessArticleDetails		= data.excessReceiveCall;
						
						if(excessArticleDetails.length > 0) {
							for(var i = 0; i < excessArticleDetails.length; i++) {
								var excessArt	= excessArticleDetails[i];
								
								var excessNumber	= excessArt.excessNumber;
								var excessReceiveId	= excessArt.excessReceiveId;
								var lrNumber		= excessArt.wayBillNumber;
								var wayBillId		= excessArt.wayBillId;
								var lsNumber		= excessArt.lsNumber;
								var turNumber		= excessArt.turNumber;
								var privateMark		= excessArt.privateMark;
								var excessBranch	= excessArt.branchName;
								var excessDate		= excessArt.excessDate;
								var packingType		= excessArt.packingType;
								var packingTypeId	= excessArt.packingTypeMasterId;
								var saidToContain	= excessArt.saidToContain;
								var excessArticle	= excessArt.excessArticle;
								var pendingExcess	= excessArt.pendingExcess;
								var excessWeight	= excessArt.weight;
								
								var excessRow			= createRow('', '');
								
								var excessNumberCol		= createNewColumn(excessRow, 'excessNumber_'+(i+1), 'titletd', '', '', '', '');
								var excessNumberValCol	= createNewColumn(excessRow, '', 'titletd', '', '', 'display: none;', '');
								var lrNumberCol			= createNewColumn(excessRow, 'lrNumber_'+(i+1), 'titletd', '', '', '', '');
								var lrNumberValueCol	= createNewColumn(excessRow, '', 'titletd', '', '', 'display: none;', '');
								var wayBillIdCol		= createNewColumn(excessRow, '', 'titletd', '', '', 'display: none;', '');
								var lsNumberCol			= createNewColumn(excessRow, 'lsNumber_'+(i+1), 'titletd', '', '', '', '');
								var turNumberCol		= createNewColumn(excessRow, 'turNumber_'+(i+1), 'titletd', '', '', '', '');
								var privateMarkCol		= createNewColumn(excessRow, 'privateMark_'+(i+1), 'titletd', '', '', '', '');
								var excessBranchCol		= createNewColumn(excessRow, 'excessBranch_'+(i+1), 'titletd', '', '', '', '');
								var excessDateCol		= createNewColumn(excessRow, 'excessDate_'+(i+1), 'titletd', '', '', '', '');
								
								$(excessNumberCol).append(excessNumber);
								$(lrNumberCol).append(lrNumber);
								$(lsNumberCol).append(lsNumber);
								$(turNumberCol).append(turNumber);
								$(privateMarkCol).append(privateMark);
								$(excessBranchCol).append(excessBranch);
								$(excessDateCol).append(excessDate);
								
								var lrNumberJsonObject		= new Object();
								var wayBillIdJsonObject		= new Object();
								var excessNumberJsonObject	= new Object();
								
								lrNumberJsonObject.type		= "hidden";
								lrNumberJsonObject.id		= "lrNumber";
								lrNumberJsonObject.name		= "lrNumber";
								lrNumberJsonObject.value	= lrNumber;
								
								createInput(lrNumberValueCol, lrNumberJsonObject);
								
								wayBillIdJsonObject.type	= "hidden";
								wayBillIdJsonObject.id		= "wayBillId";
								wayBillIdJsonObject.name	= "wayBillId";
								wayBillIdJsonObject.value	= wayBillId;
								
								createInput(wayBillIdCol, wayBillIdJsonObject);
								
								excessNumberJsonObject.type		= "hidden";
								excessNumberJsonObject.id		= "excessReceiveId";
								excessNumberJsonObject.name		= "excessReceiveId";
								excessNumberJsonObject.value	= excessReceiveId;
								
								createInput(excessNumberValCol, excessNumberJsonObject);
								
								$("#excessReceiveDetails").append(excessRow);

								if(configuration.isExcessDetailsInfoDisplay == 'true') {
									document.getElementById('showHideExcessDetails').style.display = 'none';
								}
								
								if(configuration.isExcessNumberColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(1)').hide();
									document.getElementById('excessNumber_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isLrNumberColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(2)').hide();
									document.getElementById('lrNumber_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isLsNumberColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(3)').hide();
									document.getElementById('lsNumber_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isTurNumberColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(4)').hide();
									document.getElementById('turNumber_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isPrivateMarkColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(5)').hide();
									document.getElementById('privateMark_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isExcessBranchColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(6)').hide();
									document.getElementById('excessBranch_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isExcessDateColumnDisplay == 'true') {
									$('#excessReceiveDetails th:nth-child(7)').hide();
									document.getElementById('excessDate_'+(i+1)).style.display = 'none';
								}
								
								var excessArtRow		= createRow('excessArtRow_'+(i+1), '');
								
								var packingTypeCol		= createNewColumn(excessArtRow, 'packingType_'+(i+1), 'titletd', '', '', '', '');
								var packingTypeIdCol	= createNewColumn(excessArtRow, '', 'titletd', '', '', 'display: none;', '');
								var saidToContainCol	= createNewColumn(excessArtRow, 'saidToContain_'+(i+1), 'titletd', '', '', '', '');
								var excessArticleCol	= createNewColumn(excessArtRow, 'excessArticle_'+(i+1), 'titletd', '', '', '', '');
								var pendingExcessCol	= createNewColumn(excessArtRow, 'pendingExcess_'+(i+1), 'titletd', '', '', '', '');
								var excessWeightCol		= createNewColumn(excessArtRow, 'excessWeight_'+(i+1), 'titletd', '', '', '', '');
								
								$(packingTypeCol).append(packingType);
								$(saidToContainCol).append(saidToContain);
								$(excessArticleCol).append(excessArticle);
								$(pendingExcessCol).append(pendingExcess);
								$(excessWeightCol).append(excessWeight);
								
								var articleTypeJsonObject	= new Object();
								
								articleTypeJsonObject.type		= "hidden";
								articleTypeJsonObject.id		= "articleTypeMasterId";
								articleTypeJsonObject.name		= "articleTypeMasterId";
								articleTypeJsonObject.value		= packingTypeId;
								
								createInput(packingTypeIdCol, articleTypeJsonObject);

								if(configuration.isArticleDetailsInfoDisplay == 'false') {
									$("#excessArtDetailsForExcessSettle").append(excessArtRow);
								} else {
									document.getElementById('hodeShowexcessArtDetailsForExcessSettle').style.display = 'none';
								}

								if(configuration.isArticleTypeColumnDisplay == 'true') {
									$('#excessArtDetailsForExcessSettle th:nth-child(1)').hide();
									document.getElementById('packingType_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isSaidToContainColumnDisplay == 'true') {
									$('#excessArtDetailsForExcessSettle th:nth-child(2)').hide();
									document.getElementById('saidToContain_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isExcessArticleColumnDisplay == 'true') {
									$('#excessArtDetailsForExcessSettle th:nth-child(3)').hide();
									document.getElementById('excessArticle_'+(i+1)).style.display = 'none';
								}
								
								if(configuration.isExcessWeightColumnDisplay == 'true') {
									$('#excessArtDetailsForExcessSettle th:nth-child(4)').hide();
									document.getElementById('excessWeight_'+(i+1)).style.display = 'none';
								}
							}
						}	
					}
					
					createExcessSettlementType(configuration);

					if(configuration.isNewLrFieldDisplay == 'true') {
						$('#showHideSettleWithNewfocLr th:nth-child(1)').hide();
						$('#showHideSettleWithNewfocLr td:nth-child(1)').hide();
					}
					
					if(configuration.isFocRemarkFieldDisplay == 'true') {
						$('#showHideSettleWithNewfocLr th:nth-child(2)').hide();
						$('#showHideSettleWithNewfocLr td:nth-child(2)').hide();
					}
					
					if(data.shortArticleCall) {
						var shortArticleDetails		= data.shortArticleCall;
						
						if(shortArticleDetails.length > 0) {
							for(var j = 0; j < shortArticleDetails.length; j++) {
								var shortArt	= shortArticleDetails[j];
								
								var shortArtId		= shortArt.shortArticleId;
								var shortNumber		= shortArt.shortNumber;
								var shortReceiveId	= shortArt.shortReceiveId;
								var shortArticle	= shortArt.pendingShort;
								var shortWeight		= shortArt.shortWeight;
								var shortBranch		= shortArt.branchName;
								
								var shortArtRow			= createRow('shortArt_'+(j+1), '');
								var selectCol			= createNewColumn(shortArtRow, 'select_1'+(j+1), 'titletd', '', '', '', '');
								var shortArtIdCol		= createNewColumn(shortArtRow, '', 'titletd', '', '', 'display: none;', '');
								var shortNumberCol		= createNewColumn(shortArtRow, 'shortNumber_1'+(j+1), 'titletd', '', '', '', '');
								var shortArticleCol		= createNewColumn(shortArtRow, 'shortArticle_1'+(j+1), 'titletd', '', '', '', '');
								var shortWeightCol		= createNewColumn(shortArtRow, 'shortWeight_1'+(j+1), 'titletd', '', '', '', '');
								var shortBranchCol		= createNewColumn(shortArtRow, 'shortBranch_1'+(j+1), 'titletd', '', '', '', '');
								var remarkCol			= createNewColumn(shortArtRow, 'shortRemark_1'+(j+1), 'titletd', '', '', '', '');
								
								$(shortNumberCol).append(shortNumber);
								$(shortBranchCol).append(shortBranch);
								
								var shortArtIdJsonObject	= new Object();
								var shortNumberJsonObject	= new Object();
								var shortArticleJsonObject	= new Object();
								var shortWeightJsonObject	= new Object();
								var remarkJsonObject		= new Object();
								var selectJsonObject		= new Object();
								
								selectJsonObject.type		= "checkbox";
								selectJsonObject.id			= 'select_'+[j+1];
								selectJsonObject.name		= "select_"+[j+1];
								selectJsonObject.value		= "0";
								
								createInput(selectCol, selectJsonObject);
	
								shortArtIdJsonObject.type		= "hidden";
								shortArtIdJsonObject.id			= 'articleId_'+[j+1];
								shortArtIdJsonObject.name		= "articleId_"+[j+1];
								shortArtIdJsonObject.value		= shortArtId;
								
								createInput(shortArtIdCol, shortArtIdJsonObject);
								
								shortNumberJsonObject.type		= "hidden";
								shortNumberJsonObject.id		= 'shortNumber_'+[j+1];
								shortNumberJsonObject.name		= "shortNumber_"+[j+1];
								shortNumberJsonObject.value		= shortReceiveId;
								
								createInput(shortNumberCol, shortNumberJsonObject);
								
								shortArticleJsonObject.type		= 'text';
								shortArticleJsonObject.id		= 'shortArticle_'+[j+1];
								shortArticleJsonObject.class	= 'pure-input-1';
								shortArticleJsonObject.name		= 'shortArticle_'+[j+1];
								shortArticleJsonObject.value	= shortArticle;
								
								createInput(shortArticleCol, shortArticleJsonObject);
								
								shortWeightJsonObject.type		= 'text';
								shortWeightJsonObject.id		= 'shortWeight_'+[j+1];
								shortWeightJsonObject.class		= 'pure-input-1';
								shortWeightJsonObject.name		= 'shortWeight_'+[j+1];
								shortWeightJsonObject.value		= shortWeight;
								
								createInput(shortWeightCol, shortWeightJsonObject);
								
								remarkJsonObject.type		= "text";
								remarkJsonObject.id			= 'remark_'+[j+1];
								remarkJsonObject.name		= "remark_"+[j+1];
								remarkJsonObject.value		= "";
								
								createInput(remarkCol, remarkJsonObject);
								
								$("#shortArtDetailsForExcessSettle").append(shortArtRow);
								
								if(configuration.isShortNumberColumnDisplay == 'true') {
									$('#shortArtDetailsForExcessSettle th:nth-child(1)').hide();
									document.getElementById('shortNumber_1'+(j+1)).style.display = 'none';
								}
								
								if(configuration.isShortArticleColumnDisplay == 'true') {
									$('#shortArtDetailsForExcessSettle th:nth-child(2)').hide();
									document.getElementById('shortArticle_'+(j+1)).style.display = 'none';
								}
								
								if(configuration.isShortWeightColumnDisplay == 'true') {
									$('#shortArtDetailsForExcessSettle th:nth-child(4)').hide();
									document.getElementById('shortBranch_'+(j+1)).style.display = 'none';
								}
								
								if(configuration.isShortBranchColumnDisplay == 'true') {
									$('#shortArtDetailsForExcessSettle th:nth-child(5)').hide();
									document.getElementById('shortWeight_'+(j+1)).style.display = 'none';
								}
								
								if(configuration.isShortRemarkColumnDisplay == 'true') {
									$('#shortArtDetailsForExcessSettle th:nth-child(6)').hide();
									document.getElementById('shortRemark_'+(j+1)).style.display = 'none';
								}
							}
						}
						
						document.getElementById('excessSettleType').value = '0';
						document.getElementById('shortArtDetailsForExcessSettle').style.visibility = 'visible';
					} else {
						document.getElementById('shortArtDetailsForExcessSettle').style.visibility	= 'hidden';
					}
					hideLayer();
				}
			});
}

function createExcessSettlementType(configuration) {
	
	operationOnSelectTag('excessSettleType', 'removeAll', null, null);
	operationOnSelectTag('excessSettleType', 'addNew', '----Select----', 0);
	
	if(configuration.isSettleWithShortDisplay == 'true') {
		operationOnSelectTag('excessSettleType', 'addNew', 'Settle With Short', 1);
	}
	
	if(configuration.isSettleWithNewFocLrDisplay == 'true') {
		operationOnSelectTag('excessSettleType', 'addNew', 'Settle With new FOC LR', 2);
	}
	
	if(configuration.isSettleWithUGDDisplay == 'true') {
		operationOnSelectTag('excessSettleType', 'addNew', 'Transfer in UGD', 3);
	}
}