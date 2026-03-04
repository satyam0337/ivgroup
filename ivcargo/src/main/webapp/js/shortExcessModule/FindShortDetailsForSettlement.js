

/**
 * @author Anant Chaudhary	15-11-2015
 */

var shortNumGlb 	= null;
var shortNumArray;
var flagForShort 	= false;
var waybill 		= null;
var packingTypeId 	= null;
var isNoclaimAllow 	= false;

function findShortDetailsForSettlement() {
	var shortReceiveId = 0;

	var jsonObject 	= new Object();
	
	if($("#searchType").val() == "1"){
		jsonObject.shortNumber		= $("#wayBillNumber").val();
	}else if($("#searchType").val() == "2"){
		jsonObject.shortNumber		= $("#shortNumber").val();
	}
	jsonObject.searchType		= $("#searchType").val();
	jsonObject.Filter			= 3;
	
	showLayer();

	var jsonStr	= JSON.stringify(jsonObject);	
	$.getJSON("ArticleDetails.do?pageId=330&eventId=22", 
			{json:jsonStr}, function(data) {
				hideLayer();
				
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					changeDisplayProperty('bottom-border-boxshadow', 'hidden');
					return false;
				} else {
					if(data.errorDescription) {
						showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
						changeDisplayProperty('bottom-border-boxshadow', 'hidden');
						return false;
					}

					var shortReceive	= data.shortReceive;
					if(shortReceive.searchType == 1){
						waybill 			= shortReceive.wayBillId;
						packingTypeId 		= shortReceive.packingTypeIds;
						shortReceiveId 		= shortReceive.shortReceiveIds;
					}else if(shortReceive.searchType == 2){
						waybill 			= shortReceive.wayBillId;
						packingTypeId 		= shortReceive.packingTypeId;
						shortReceiveId 		= shortReceive.shortReceiveId;
					}
					
					getShortDetailsByWaybillIdForSettlemnt(waybill, shortReceiveId, packingTypeId,shortReceive.searchType);
				}
			})
}

function loadSelectedOption(){  
	if($("#searchType").val() == "1"){
		$("#lrNumberDiv").removeClass('hide');
		$("#shortNumberDiv").addClass('hide');
	}else if($("#searchType").val() == "2"){
		$("#lrNumberDiv").addClass('hide');
		$("#shortNumberDiv").removeClass('hide');
	}else{
		$("#lrNumberDiv").addClass('hide');
		$("#shortNumberDiv").addClass('hide');
	}
}

function findShortDetailsForSettlement1(shortReceiveId, flagForShort) {
	commonShort(shortReceiveId, flagForShort);
	openDialog('dialogShortForm');
}

function commonShort(shortReceiveId, flagForShort) {
	
	var jsonObjectOut = new Object();

	jsonObjectOut.ShortReceiveId	= shortReceiveId;

	var jsonStr	= JSON.stringify(jsonObjectOut);
	//alert(jsonStr);

	$.getJSON("FindShortdetailsForSettlement.do?pageId=330&eventId=5", 
			{json:jsonStr}, function(data) {

				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					showPartOfPage('bottom-border-boxshadow');

					var configuration			= data.configuration;
					isNoclaimAllow				= data.isNoclaimAllow;

					$("#shortReceiveDetails tbody tr").remove();
					$("#shortArtDetailsForShortSettle tbody tr").remove();
					$("#excessArtDetailsForShortSettle tbody tr").remove();

					if(data.shortReceiveCall) {
						var shortReceiveDetails		= data.shortReceiveCall;

						if(shortReceiveDetails.length > 0) {
							for(var i = 0; i < shortReceiveDetails.length; i++) {
								var shortDetails	= shortReceiveDetails[i];
								
								var shortNumber		= shortDetails.shortNumber;
								var shortReceiveId	= shortDetails.shortReceiveId;
								var lrNumber		= shortDetails.wayBillNumber;
								var wayBillId		= shortDetails.wayBillId;
								var lsNumber		= shortDetails.lsNumber;
								var vehicleNumber	= shortDetails.vehicleNumber;
								var shortBranch		= shortDetails.branchName;
								var shortDate		= shortDetails.shortDate;
								var actUnloadWeight	= shortDetails.actUnloadWeight;
								var articleType		= shortDetails.packingType;
								var totalArticle	= shortDetails.totalArticle;
								var shortArticle	= shortDetails.shortArticle;
								var pendingArticle	= shortDetails.pendingShort;
								var saidToContain	= shortDetails.saidToContain;
								var packingTypeId	= shortDetails.packingTypeId;

								var shortRow		= createRow('shortDetails', '');

								var shortNumberCol		= createNewColumn(shortRow, 'shortNumber_' + (i + 1), 'titletd', '', '', '', '');
								var lrNumberCol			= createNewColumn(shortRow, 'lrNumber_' + (i + 1), 'titletd', '', '', '', '');
								var wayBillIdCol		= createNewColumn(shortRow, 'wayBillId_' + (i + 1), 'titletd', '', '', 'display: none;', '');
								var lsNumberCol			= createNewColumn(shortRow, 'lsNumber_' + (i + 1), 'titletd', '', '', '', '');
								var vehicleNumberCol	= createNewColumn(shortRow, 'vehicleNumber_' + (i + 1), 'titletd', '', '', '', '');
								var shortBranchCol		= createNewColumn(shortRow, 'shortBranch_' + (i + 1), 'titletd', '', '', '', '');
								var shortDateCol		= createNewColumn(shortRow, 'shortDate', '', 'titletd', '', '', '');
								var actUnloadWeightCol	= createNewColumn(shortRow, 'actUnloadWeight_' + (i + 1), 'titletd', '', '', '', '');

								var shortNumberJsonObject	= new Object();

								shortNumberJsonObject.type		= "hidden";
								shortNumberJsonObject.id		= "shortReceiveId1";
								shortNumberJsonObject.name		= "shortNumber";
								shortNumberJsonObject.value		= shortReceiveId;

								createInput(shortNumberCol, shortNumberJsonObject);

								var lrNumberJsonObject		= new Object();

								lrNumberJsonObject.type		= "hidden";
								lrNumberJsonObject.id		= "lrNumber1";
								lrNumberJsonObject.name		= "lrNumber";
								lrNumberJsonObject.value	= lrNumber;

								createInput(lrNumberCol, lrNumberJsonObject);

								var wayBillIdJsonObject		= new Object();

								wayBillIdJsonObject.type	= "hidden";
								wayBillIdJsonObject.id		= "wayBillId1";
								wayBillIdJsonObject.name	= "wayBillId";
								wayBillIdJsonObject.value	= wayBillId;

								createInput(wayBillIdCol, wayBillIdJsonObject);

								var shortArticleJsonObject		= new Object();

								shortArticleJsonObject.type		= "hidden";
								shortArticleJsonObject.id		= "shortArticle1";
								shortArticleJsonObject.name		= "shortArticle1";
								shortArticleJsonObject.value	= shortArticle;

								createInput(wayBillIdCol, shortArticleJsonObject);

								var pendingArticleJsonObject	= new Object();

								pendingArticleJsonObject.type		= "hidden";
								pendingArticleJsonObject.id			= "pendingArticle1";
								pendingArticleJsonObject.name		= "pendingArticle1";
								pendingArticleJsonObject.value		= pendingArticle;

								createInput(wayBillIdCol, pendingArticleJsonObject);

								appendValueInTableCol(shortNumberCol, shortNumber);
								appendValueInTableCol(lrNumberCol, lrNumber);
								appendValueInTableCol(lsNumberCol, lsNumber);
								appendValueInTableCol(vehicleNumberCol, vehicleNumber);
								appendValueInTableCol(shortBranchCol, shortBranch);
								appendValueInTableCol(shortDateCol, shortDate);

								var shortDateJsonObject		= new Object();

								shortDateJsonObject.type		= "hidden";
								shortDateJsonObject.id			= "shortDate1";
								shortDateJsonObject.name		= "shortDate1";
								shortDateJsonObject.value		= shortDate;

								createInput(shortDateCol, shortDateJsonObject);

								appendValueInTableCol(actUnloadWeightCol, actUnloadWeight);

								$("#shortReceiveDetails").append(shortRow);

								var shortArtRow		= createRow('shortArt', '');

								var articleTypeCol		= createNewColumn(shortArtRow, 'articleType_' + (i + 1), 'titletd', '', '', '', '');
								var totalArticleCol		= createNewColumn(shortArtRow, 'totalArticle_' + (i + 1), 'titletd', '', '', '', '');
								var shortArticleCol		= createNewColumn(shortArtRow, 'shortArticle_' + (i + 1), 'titletd', '', '', '', '');
								var pendingArticleCol	= createNewColumn(shortArtRow, 'pendingArticle_' + (i + 1), 'titletd', '', '', '', '');
								var saidToContainCol	= createNewColumn(shortArtRow, 'saidToContain_' + (i + 1), 'titletd', '', '', '', '');

								appendValueInTableCol(articleTypeCol, articleType);
								appendValueInTableCol(totalArticleCol, totalArticle);
								appendValueInTableCol(shortArticleCol, shortArticle);
								appendValueInTableCol(pendingArticleCol, pendingArticle);
								appendValueInTableCol(saidToContainCol, saidToContain);
								appendValueInTableCol(articleTypeCol, createInputForShortPackingTypeId(i + 1, packingTypeId));

								$("#shortArtDetailsForShortSettle").append(shortArtRow);

								if(configuration.isArticleTypeColumnDisplay == 'true') {
									$('#shortArtDetailsForShortSettle th:nth-child(1)').hide();
									changeDisplayProperty('articleType_' + (i + 1), 'none');
								}

								if(configuration.isTotalArticleColumnDisplay == 'true') {
									$('#shortArtDetailsForShortSettle th:nth-child(2)').hide();
									changeDisplayProperty('totalArticle_' + (i + 1), 'none');
								}

								if(configuration.isShortArticleColumnDisplay == 'true') {
									$('#shortArtDetailsForShortSettle th:nth-child(3)').hide();
									changeDisplayProperty('shortArticle_' + (i + 1), 'none');
								}

								if(configuration.isDamageArticleColumnDisplay == 'true') {
									$('#shortArtDetailsForShortSettle th:nth-child(4)').hide();
									changeDisplayProperty('damageArticle_' + (i + 1), 'none');
								}

								if(configuration.isSaidToContainColumnDisplay == 'true') {
									$('#shortArtDetailsForShortSettle th:nth-child(5)').hide();
									changeDisplayProperty('saidToContain_' + (i + 1), 'none');
								}

								if(configuration.isShortNumberColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(1)').hide();
									changeDisplayProperty('shortNumber_' + (i + 1), 'none');
								}

								if(configuration.isLrNumberColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(2)').hide();
									changeDisplayProperty('lrNumber_' + (i + 1), 'none');
								}

								if(configuration.isLsNumberColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(3)').hide();
									changeDisplayProperty('lsNumber_' + (i + 1), 'none');
								}

								if(configuration.isTruckNumberColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(4)').hide();
									changeDisplayProperty('vehicleNumber_' + (i + 1), 'none');
								}

								if(configuration.isShortBranchColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(5)').hide();
									changeDisplayProperty('shortBranch_' + (i + 1), 'none');
								}

								if(configuration.isShortDateColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(6)').hide();
									changeDisplayProperty('shortDate', 'none');
								}

								if(configuration.isActUnloadWeightColumnDisplay == 'true') {
									$('#shortReceiveDetails th:nth-child(7)').hide();
									changeDisplayProperty('actUnloadWeight_' + (i + 1), 'none');
								}

								if(shortArticle > 0 && damageArticle <= 0) {
									$("#hideDamageArticleSettle").hide();
									$("#hideShortArticleSettle").show();
								} else if(shortArticle <= 0 && damageArticle > 0) {
									$("#hideShortArticleSettle").hide();
									$("#hideDamageArticleSettle").show();
								} else {
									$("#hideShortArticleSettle").show();
									$("#hideDamageArticleSettle").show();
								}
							}
						}
					}

					if(configuration.isArticleDetailsInfoDisplay == 'true') {
						changeDisplayProperty('shortArtDetailInfo', 'none');
					}

					if(configuration.isArticleTypeColumnDisplay == 'true') {
						$('#shortArtDetailsForShortSettle th:nth-child(1)').hide();
					}

					if(configuration.isTotalArticleColumnDisplay == 'true') {
						$('#shortArtDetailsForShortSettle th:nth-child(2)').hide();
					}

					if(configuration.isShortArticleColumnDisplay == 'true') {
						$('#shortArtDetailsForShortSettle th:nth-child(3)').hide();
					}

					if(configuration.isDamageArticleColumnDisplay == 'true') {
						$('#shortArtDetailsForShortSettle th:nth-child(4)').hide();
					}

					if(configuration.isSaidToContainColumnDisplay == 'true') {
						$('#shortArtDetailsForShortSettle th:nth-child(5)').hide();
					}

					createShortSettlementType(configuration);

					if(configuration.isClaimNumberFieldDisplay == 'true') {
						$('#settleWithClaimForm th:nth-child(1)').hide();
						$('#settleWithClaimForm td:nth-child(1)').hide();
					}

					if(configuration.isClaimRemarkFieldDisplay == 'true') {
						$('#settleWithClaimForm th:nth-child(2)').hide();
						$('#settleWithClaimForm td:nth-child(2)').hide();
					}

					if(data.excessReceiveCall) {
						var excessReceiveDetails	= data.excessReceiveCall;
						
						if(excessReceiveDetails.length > 0) {
							for(var k = 0; k < excessReceiveDetails.length; k++) {
								var excessArtDetailsForShortSettle	= excessReceiveDetails[k];

								var excessReceiveId		= excessArtDetailsForShortSettle.excessReceiveId;
								var excessNumber		= excessArtDetailsForShortSettle.excessNumber;
								var articleType			= excessArtDetailsForShortSettle.packingType;
								var excessArticle		= excessArtDetailsForShortSettle.pendingExcess;
								var excessWeight		= excessArtDetailsForShortSettle.weight;
								var excessBranch		= excessArtDetailsForShortSettle.branchName;
								var excessBranchId		= excessArtDetailsForShortSettle.branchId;

								var excessArtRow		= createRow('excessArt_'+(k+1), '');

								//var selectCol			= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var excessNumberCol		= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var articleTypeCol		= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var excessArticleCol	= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var excessWeightCol		= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var excessBranchCol		= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');
								var remarkCol			= createNewColumn(excessArtRow, '', 'titletd', '', '', '', '');

								//appendValueInTableCol(selectCol, createInputForExcessSettlement(excessArtDetailsForShortSettle.excessReceiveId));
								appendValueInTableCol(excessNumberCol, excessNumber);

								var excessNumberJsonObject		= new Object();
								var excessArticleJsonObject		= new Object();
								var excessWeightJsonObject		= new Object();
								var remarkJsonObject			= new Object();
								var excessBranchIdJsonObject	= new Object();

								excessNumberJsonObject.type		= "hidden";
								excessNumberJsonObject.id		= 'excessNumber_'+[k+1];
								excessNumberJsonObject.name		= 'excessNumber_'+[k+1];
								excessNumberJsonObject.value	= excessReceiveId;
								
								excessBranchIdJsonObject.type	= "hidden";
								excessBranchIdJsonObject.id		= 'excessBranchId_'+[k+1];
								excessBranchIdJsonObject.name	= 'excessBranchId_'+[k+1];
								excessBranchIdJsonObject.value	=  excessBranchId;

								createInput(excessNumberCol, excessNumberJsonObject);
								createInput(excessNumberCol, excessBranchIdJsonObject);
								
								appendValueInTableCol(articleTypeCol, articleType);

								excessArticleJsonObject.type	= 'text';
								excessArticleJsonObject.id		= 'excessArticle_'+[k+1];
								excessArticleJsonObject.class	= 'pure-input-1';
								excessArticleJsonObject.name	= 'excessArticle_'+[k+1];
								excessArticleJsonObject.value	= excessArticle;

								createInput(excessArticleCol, excessArticleJsonObject);

								excessWeightJsonObject.type		= 'text';
								excessWeightJsonObject.id		= 'excessWeight_'+[k+1];
								excessWeightJsonObject.class	= 'pure-input-1';
								excessWeightJsonObject.name		= 'excessWeight_'+[k+1];
								excessWeightJsonObject.value	= excessWeight;

								createInput(excessWeightCol, excessWeightJsonObject);

								appendValueInTableCol(excessBranchCol, excessBranch);

								remarkJsonObject.type			= 'text';
								remarkJsonObject.id				= 'remark_'+[k+1];
								remarkJsonObject.name			= 'remark_'+[k+1];
								remarkJsonObject.value			= '';

								createInput(remarkCol, remarkJsonObject);

								$("#excessArtDetailsForShortSettle").append(excessArtRow);

								if(configuration.isExcessNumberColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(1)').hide();
									changeDisplayProperty('excessNumber_1' + (k + 1), 'none');
								}

								if(configuration.isExcessArticleTypeColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(2)').hide();
									changeDisplayProperty('articleType_1' + (k + 1), 'none');
								}

								if(configuration.isExcessArticleColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(3)').hide();
									changeDisplayProperty('excessArticle_1' + (k + 1), 'none');
								}

								if(configuration.isExcessWeightColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(4)').hide();
									changeDisplayProperty('excessWeight_1' + (k + 1), 'none');
								}

								if(configuration.isExcessBranchColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(5)').hide();
									changeDisplayProperty('excessBranch_1' + (k + 1), 'none');
								}

								if(configuration.isExcessRemarkColumnDisplay == 'true') {
									$('#excessArtDetailsForShortSettle th:nth-child(6)').hide();
									changeDisplayProperty('excessRemark_1' + (k + 1), 'none');
								}
							}
						}

						$('#shortSettleType').val(0);
						changeVisibility('excessArtDetailsForShortSettle', 'visible');
					} else {
						changeVisibility('excessArtDetailsForShortSettle', 'hidden');
					}
					hideLayer();
				}
			});
}

/**
 * Get Short details by Waybill Id
 */

function getShortDetailsByWaybillIdForSettlemnt(waybillId, shortReceiveId, packingTypeId,searchType){
	shortNumGlb = shortReceiveId;
	var jsonObject = new Object();
	
	if(searchType == 1){
		jsonObject.WayBillId 		= waybillId;
		jsonObject.searchType 		= searchType;
	}else if(searchType == 2){
		jsonObject.WayBillId 		= waybillId;
		jsonObject.PackingTypeId 	= packingTypeId;
		jsonObject.searchType 		= searchType;
	}

	var jsonStr = JSON.stringify(jsonObject);
	console.log(jsonStr)

	$.getJSON("FindShortDetails.do?pageId=330&eventId=18",
			{json:jsonStr}, function(data){
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription){
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					changeDisplayProperty('bottom-border-boxshadow', 'hidden');
					hideLayer();
				}else{
					hideAllMessages();

					if(data.shDetailsListColl) {
						var shortReceiveDetails		= data.shDetailsListColl;

						if(shortReceiveDetails.length > 0) {
							var shortDetails	= shortReceiveDetails[0];

							if(shortReceiveDetails.length > 1) {
								openDialog('dialogshortFormOnShortPendingForm');
								populateShortTbl(data);
							} else {
								findShortDetailsForSettlement1(shortReceiveId, flagForShort);
							}
						}
					}
				}
			});
}

function populateShortTbl(shrtData){

	shortNumArray	= new Array();

	if(shrtData.shDetailsListColl) {
		var shrtReceiveDetails		= shrtData.shDetailsListColl;
		
		if(shrtReceiveDetails.length > 0) {
			$('#shortReceiveDetail tbody tr').remove();		

			$("#LRNOID").html(shrtReceiveDetails[0].wayBillNumber);

			for(var i = 0; i < shrtReceiveDetails.length; i++) {
				var shortDetails	= shrtReceiveDetails[i];

				var shortRow		= createRow('tr_'+shortDetails.shortReceiveId, '');
				
				var shortId1		= createColumn(shortRow ,'td_'+shortDetails.shortReceiveId,'10%','center','','');
				var shortNumber1	= createColumn(shortRow ,'td_'+shortDetails.shortNumber,'10%','center','','');
				var lrNumber		= createColumn(shortRow ,'td_'+shortDetails.wayBillNumber,'10%','center','','');
				var LsNumber		= createColumn(shortRow ,'td_'+shortDetails.lsNumber,'10%','center','','');
				var shortBranch		= createColumn(shortRow ,'td_'+shortDetails.branchName,'10%','center','','');
				var shortDate		= createColumn(shortRow ,'td_'+shortDetails.shortReceiveDate,'10%','center','','');
				var NoofAtcl		= createColumn(shortRow ,'td_'+shortDetails.shortArticle,'10%','center','','');
				
				$(shortId1).append(createInputForShortSettlement(shortDetails.shortReceiveId));
				$(shortNumber1).append(shortDetails.shortNumber);
				$(lrNumber).append(shortDetails.wayBillNumber);
				$(LsNumber).append(shortDetails.lsNumber);
				$(shortBranch).append(shortDetails.branchName);
				$(shortDate).append(shortDetails.shortDate);
				$(NoofAtcl).append(shortDetails.shortArticle);

				$('#shortReceiveDetail').append(shortRow);
				if(shortNumGlb != shortDetails.shortReceiveId){
					var jObject = new Object();
					jObject.shortReceiveId			= shortDetails.shortReceiveId;
					jObject.ShortNumb  				= shortDetails.shortNumber;
					jObject.WayBillNumber  			= shortDetails.wayBillNumber;
					jObject.WayBillID 	   			= shortDetails.wayBillId;
					jObject.LsNumber 	   			= shortDetails.lsNumber;
					jObject.DispatchLedgerId 	   	= shortDetails.dispatchLedgerId;
					jObject.TurNumber 	   			= shortDetails.turNumber;
					jObject.PrivateMark 	   		= shortDetails.privateMark;
					jObject.PackingTypeId 	   		= shortDetails.packingTypeId;
					jObject.SaidToContain 	   		= shortDetails.saidToContain;
					jObject.Remark 	   				= "";
					jObject.Status 	   				= 2;
					jObject.MarkForDelete 	   		= 0;
					jObject.BranchID 	   			= shortDetails.branchId;
					jObject.ExecutiveId 	   		= "";
					jObject.AccountGroupId 	   		= shortDetails.accountGroupId;
					jObject.ShortArticle 	   		= shortDetails.shortArticle;
					jObject.PendingShort 	   		= shortDetails.pendingShort;

					shortNumArray.push(jObject);
				}
			}
		}
	}
} 

/**
 * set Flag  for multiple short Settlemtnt
 * */
function setFlagForMultipleShortSettlement(flag){
	flagForShort = flag;
	closeJqueryDialog('dialogshortFormOnShortPendingForm');
	findShortDetailsForSettlement1($('input[name=shortReceiveId]:checked').val(),flag);
}

function createInputForShortPackingTypeId(i, packingTypeId) {
	var shortPackingTypeIdFeild	= $("<input/>", { 
		type			: 'hidden', 
		id				: 'packingTypeMasterId_' + i,
		name			: 'packingTypeMasterId_' + i,
		value			: packingTypeId,
		placeholder		: '0'});

	return shortPackingTypeIdFeild;
}

function createInputForShortSettlement(i) {
	var shortSettlementRadioFeild	= $("<input/>", { 
		type			: 'radio', 
		id				: 'shortReceiveId_' + i,
		name			: 'shortReceiveId',
		value			: i});

	return shortSettlementRadioFeild;
}

function createInputForExcessSettlement(i) {
	var shortSettlementRadioFeild	= $("<input/>", { 
		type			: 'checkbox', 
		id				: 'excessReceiveId_' + i,
		name			: 'excessReceiveId',
		value			: i});

	return shortSettlementRadioFeild;
}

function createShortSettlementType(configuration) {
	operationOnSelectTag('shortSettleType', 'removeAll', null, null);
	operationOnSelectTag('shortSettleType', 'addNew', '----Select----', 0);

	if(configuration.isSettleWithExcessDisplay == 'true') {
		operationOnSelectTag('shortSettleType', 'addNew', 'Settle With Excess', 1);
	}

	if(configuration.isSettleWithClaimDisplay == 'true') {
		operationOnSelectTag('shortSettleType', 'addNew', 'Settle With Claim Amount', 2);
	}

	if(configuration.isSettleWithNoClaimDisplay == 'true') {
		operationOnSelectTag('shortSettleType', 'addNew', 'Settle With No Claim', 3);
	}
}