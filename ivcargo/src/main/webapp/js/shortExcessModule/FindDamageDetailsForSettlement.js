/**
 * @author Shailesh Khandare	19-01-2016
 */
var flagForDamage 	= false;
function findDamageDetailsForSettlement() {
	var filter		= 1;
	
	var jsonObject 	= new Object();
	
	if($("#searchType").val() == "1"){
		jsonObject.DamgeNumber	 = $("#wayBillNumber").val();
	}else if($("#searchType").val() == "2"){
		jsonObject.DamgeNumber = $("#damageNumber").val();
	}
	
	jsonObject.filter			= filter;
	jsonObject.searchType		= $("#searchType").val();
	var jsonStr	= JSON.stringify(jsonObject);
	console.log(jsonStr)
	$.getJSON("FindDamagedetailsForSettlement.do?pageId=330&eventId=21", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					
					if(data.damageReceiveList) {
						var damageReceiveDetails		= data.damageReceiveList;
						
						if(damageReceiveDetails.length > 0) {
							var damageDetails	= damageReceiveDetails[0];

							if(damageReceiveDetails.length > 1) {
								openDialog('dialogdamageFormOnDamagePendingForm');
								populateDamageTbl(data);
							} else {
								findDamageDetailsForSettlement1(damageDetails.damageReceiveId,flagForDamage);
							}
						}
					}
				}
			})
}

function loadSelectedOption(){  
	if($("#searchType").val() == "1"){
		$("#lrNumberDiv").removeClass('hide');
		$("#damageNumberDiv").addClass('hide');
	}else if($("#searchType").val() == "2"){
		$("#lrNumberDiv").addClass('hide');
		$("#damageNumberDiv").removeClass('hide');
	}else{
		$("#lrNumberDiv").addClass('hide');
		$("#damageNumberDiv").addClass('hide');
	}
}

function findDamageDetailsForSettlement1(damageReceiveId,flagForDamage) {
	var filter		= 2;
	commonDamage(null,damageReceiveId,filter);
	openDialog('dialogDamageForm');
}

function commonDamage(dmageNumber,damageReceiveId,filter) {

	var jsonObject 	= new Object();
	var jsonObjectOut;
	
	jsonObjectOut = new Object();

	jsonObjectOut.DamgeNumber		= dmageNumber;
	jsonObjectOut.DamageReceiveId	= damageReceiveId;
	jsonObjectOut.filter			= filter;
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);
	console.log(jsonStr)
	
	$.getJSON("FindDamagedetailsForSettlement.do?pageId=330&eventId=21", 
			{json:jsonStr}, function(data) {
				
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					showPartOfPage('bottom-border-boxshadow');
					
					var configuration			= data.configuration;
					
					$("#damageReceiveDetails tbody tr").remove();
					$("#damageArtDetails tbody tr").remove();
					
					if(data.damageReceiveList) {
						var damageReceiveDetails		= data.damageReceiveList;
						
						if(damageReceiveDetails.length > 0) {
							for(var i = 0; i < damageReceiveDetails.length; i++) {
								var damageDetails	= damageReceiveDetails[i];
								
								var damageNumber	= damageDetails.damageNumber;
								var damageReceiveId	= damageDetails.damageReceiveId;
								var lrNumber		= damageDetails.wayBillNumber;
								var wayBillId		= damageDetails.wayBillId;
								var lsNumber		= damageDetails.lsNumber;
								var vehicleNumber	= damageDetails.vehicleNumber;
								var shortBranch		= damageDetails.branchName;
								var damageDate		= damageDetails.damageDate;
								var actUnloadWeight	= damageDetails.actUnloadWeight;
								var articleType		= damageDetails.packingType;
								var totalArticle	= damageDetails.totalArticle;
								var shortArticle	= damageDetails.shortArticle;
								var damageArticle	= damageDetails.damageArticle;
								var saidToContain	= damageDetails.saidToContain;
								
								var shortRow		= createRow('shortDetails', '');
								
								var damageNumberCol		= createNewColumn(shortRow, 'damageNumber_'+(i+1), 'titletd', '', '', '', '');
								var lrNumberCol			= createNewColumn(shortRow, 'lrNumber_'+(i+1), 'titletd', '', '', '', '');
								var wayBillIdCol		= createNewColumn(shortRow, 'wayBillId_'+(i+1), 'titletd', '', '', 'display: none;', '');
								var lsNumberCol			= createNewColumn(shortRow, 'lsNumber_'+(i+1), 'titletd', '', '', '', '');
								var vehicleNumberCol	= createNewColumn(shortRow, 'vehicleNumber_'+(i+1), 'titletd', '', '', '', '');
								var damageBranchCol		= createNewColumn(shortRow, 'shortBranch_'+(i+1), 'titletd', '', '', '', '');
								var damageDateCol		= createNewColumn(shortRow, 'damageDate', '', 'titletd', '', '', '');
								var actUnloadWeightCol	= createNewColumn(shortRow, 'actUnloadWeight_'+(i+1), 'titletd', '', '', '', '');
								
								var damageNumberJsonObject	= new Object();
								
								damageNumberJsonObject.type		= "hidden";
								damageNumberJsonObject.id		= "damageReceiveId";
								damageNumberJsonObject.name		= "damageReceiveId";
								damageNumberJsonObject.value	= damageReceiveId;
								
								createInput(damageNumberCol, damageNumberJsonObject);
								
								var lrNumberJsonObject		= new Object();
								
								lrNumberJsonObject.type		= "hidden";
								lrNumberJsonObject.id		= "lrNumber1";
								lrNumberJsonObject.name		= "lrNumber";
								lrNumberJsonObject.value	= lrNumber;
								
								createInput(lrNumberCol, lrNumberJsonObject);
								
								var wayBillIdJsonObject		= new Object();
								
								wayBillIdJsonObject.type	= "hidden";
								wayBillIdJsonObject.id		= "wayBillId";
								wayBillIdJsonObject.name	= "wayBillId";
								wayBillIdJsonObject.value	= wayBillId;
								
								createInput(wayBillIdCol, wayBillIdJsonObject);
								
								$(damageNumberCol).append(damageNumber);
								$(lrNumberCol).append(lrNumber);
								$(lsNumberCol).append(lsNumber);
								$(vehicleNumberCol).append(vehicleNumber);
								$(damageBranchCol).append(shortBranch);
								
								var damageDateJsonObject		= new Object();
								
								damageDateJsonObject.type	= "hidden";
								damageDateJsonObject.id		= "damageDate1";
								damageDateJsonObject.name	= "damageDate1";
								damageDateJsonObject.value	= damageDate;
								
								createInput(damageDateCol, damageDateJsonObject);
								
								$(damageDateCol).append(damageDate);
								$(actUnloadWeightCol).append(actUnloadWeight);
								
								$("#damageReceiveDetails").append(shortRow);
								
								var shortArtRow		= createRow('shortArt', '');
								
								var articleTypeCol		= createNewColumn(shortArtRow, 'articleType_'+(i+1), 'titletd', '', '', '', '');
								var totalArticleCol		= createNewColumn(shortArtRow, 'totalArticle_'+(i+1), 'titletd', '', '', '', '');
								var damageArticleCol	= createNewColumn(shortArtRow, 'damageArticle_'+(i+1), 'titletd', '', '', '', '');
								var saidToContainCol	= createNewColumn(shortArtRow, 'saidToContain_'+(i+1), 'titletd', '', '', '', '');
								
								$(articleTypeCol).append(articleType);
								$(totalArticleCol).append(totalArticle);
								
								$(damageArticleCol).append(damageArticle);
								$(saidToContainCol).append(saidToContain);
								
								$("#damageArtDetails").append(shortArtRow);
								
								if(configuration.isArticleTypeColumnDisplay == 'true') {
									$('#damageArtDetails th:nth-child(1)').hide();
									changeDisplayProperty('articleType_' + (i + 1), 'none');
								}
								
								if(configuration.isTotalArticleColumnDisplay == 'true') {
									$('#damageArtDetails th:nth-child(2)').hide();
									changeDisplayProperty('totalArticle_' + (i + 1), 'none');
								}
								
								if(configuration.isShortArticleColumnDisplay == 'true') {
									$('#damageArtDetails th:nth-child(3)').hide();
									changeDisplayProperty('shortArticle_' + (i + 1), 'none');
								}
								
								if(configuration.isDamageArticleColumnDisplay == 'true') {
									$('#damageArtDetails th:nth-child(4)').hide();
									changeDisplayProperty('damageArticle_' + (i + 1), 'none');
								}
								
								if(configuration.isSaidToContainColumnDisplay == 'true') {
									$('#damageArtDetails th:nth-child(5)').hide();
									changeDisplayProperty('saidToContain_' + (i + 1), 'none');
								}
								
								if(configuration.isShortNumberColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(1)').hide();
									changeDisplayProperty('shortNumber_' + (i + 1), 'none');
								}
								
								if(configuration.isLrNumberColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(2)').hide();
									changeDisplayProperty('lrNumber_' + (i + 1), 'none');
								}
								
								if(configuration.isLsNumberColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(3)').hide();
									changeDisplayProperty('lsNumber_' + (i + 1), 'none');
								}
								
								if(configuration.isTruckNumberColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(4)').hide();
									changeDisplayProperty('vehicleNumber_' + (i + 1), 'none');
								}
								
								if(configuration.isShortBranchColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(5)').hide();
									changeDisplayProperty('shortBranch_' + (i + 1), 'none');
								}
								
								if(configuration.isShortDateColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(6)').hide();
									changeDisplayProperty('shortDate', 'none');
								}
								
								if(configuration.isActUnloadWeightColumnDisplay == 'true') {
									$('#damageReceiveDetails th:nth-child(7)').hide();
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
						document.getElementById('shortArtDetailInfo').style.display = 'none';
					}
	
					if(configuration.isArticleTypeColumnDisplay == 'true') {
						$('#damageArtDetails th:nth-child(1)').hide();
					}
								
					if(configuration.isTotalArticleColumnDisplay == 'true') {
						$('#damageArtDetails th:nth-child(2)').hide();
					}
							
					if(configuration.isShortArticleColumnDisplay == 'true') {
						$('#damageArtDetails th:nth-child(3)').hide();
					}
								
					if(configuration.isDamageArticleColumnDisplay == 'true') {
						$('#damageArtDetails th:nth-child(4)').hide();
					}
								
					if(configuration.isSaidToContainColumnDisplay == 'true') {
						$('#damageArtDetails th:nth-child(5)').hide();
					}
					if(configuration.isSettleWithClaimDisplay == 'true') {
						document.getElementById('settleWithClaimForm').style.display = 'none';
					}
					
					if(configuration.isSettleWithNoClaimDisplay == 'true') {
						document.getElementById('damageWithoutClaim').style.display = 'none';
					}
					
					if(configuration.isClaimNumberFieldDisplay == 'true') {
						$('#settleWithClaimForm th:nth-child(1)').hide();
						$('#settleWithClaimForm td:nth-child(1)').hide();
					}
					
					if(configuration.isClaimRemarkFieldDisplay == 'true') {
						$('#settleWithClaimForm th:nth-child(2)').hide();
						$('#settleWithClaimForm td:nth-child(2)').hide();
					}

					hideLayer();
				}
			});
}

function populateDamageTbl(damageData){
	
	if(damageData.damageReceiveList){
		var damageReceiveDetails		= damageData.damageReceiveList;
		
		$('#damageReceiveDetail tbody tr').remove();
		$("#LRNOID").html(damageReceiveDetails[0].wayBillNumber);
		for(var i = 0; i < damageReceiveDetails.length; i++) {
			var damageDetails	= damageReceiveDetails[i];
			
			var damageRow		= createRow('tr_'+damageDetails.damageReceiveId, '');
			
			var damageId1		= createColumn(damageRow ,'td_'+damageDetails.damageReceiveId,'10%','center','','');
			var damageNumber1	= createColumn(damageRow ,'td_'+damageDetails.damageNumber,'10%','center','','');
			var lrNumber		= createColumn(damageRow ,'td_'+damageDetails.wayBillNumber,'10%','center','','');
			var LsNumber		= createColumn(damageRow ,'td_'+damageDetails.lsNumber,'10%','center','','');
			var damageBranch	= createColumn(damageRow ,'td_'+damageDetails.branchName,'10%','center','','');
			var damageDate		= createColumn(damageRow ,'td_'+damageDetails.damageReceiveDate,'10%','center','','');
			var NoofAtcl		= createColumn(damageRow ,'td_'+damageDetails.damageArticle,'10%','center','','');
			
			$(damageId1).append(createInputForDamageSettlement(damageDetails.damageReceiveId));
			$(damageNumber1).append(damageDetails.damageNumber);
			$(lrNumber).append(damageDetails.wayBillNumber);
			$(LsNumber).append(damageDetails.lsNumber);
			$(damageBranch).append(damageDetails.branchName);
			$(damageDate).append(damageDetails.damageReceiveDate);
			$(NoofAtcl).append(damageDetails.damageArticle);

			$('#damageReceiveDetail').append(damageRow);
			  
		}
	}
}

function createInputForDamageSettlement(i) {
	var damageSettlementRadioFeild	= $("<input/>", { 
		type			: 'radio', 
		id				: 'damageReceiveId_' + i,
		name			: 'damageReceive',
		value			: i});

	return damageSettlementRadioFeild;
}

function setFlagForMultipleDamageSettlement(flag){
	flagForDamage = flag;
	closeJqueryDialog('dialogdamageFormOnDamagePendingForm');
	findDamageDetailsForSettlement1($('input[name=damageReceive]:checked').val(),flag);
}