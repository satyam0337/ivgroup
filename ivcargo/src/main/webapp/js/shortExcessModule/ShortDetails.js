/**
 * @author Shailesh Khandare 15-11-2015
 */

/*function findShortDetailsForSettlement() {
	var shortNumber = $("#shortNumber").val();

	commonShort(shortNumber);
	document.getElementById('short-receive-settlement').style.visibility = 'visible';
}*/
//Get Short Details By wayBillIds. 

function getShortDetailsByWaybillId(wayBillId,packingTypeId) {
	populateShortTable(wayBillId,packingTypeId);
	
}

//Populate Short details Table Via Json.
function populateShortTable(wayBillId,packingTypeId) {
	$('#shortDetailsTbl tbody tr').remove();
	document.getElementById('SrNo').style.display = 'none';
	document.getElementById('hideShowShortSettleButton').style.display = 'none';
	document.getElementById('hideShowExcessDetails').style.display = 'none';
	document.getElementById('SrNo1').style.display = 'none';
	document.getElementById('hideShowShortSettleButton1').style.display = 'none';
	document.getElementById('hideShowExcessDetails1').style.display = 'none';
	var jsonObject 	= new Object();
	var jsonObjectOut;
	jsonObjectOut = new Object();
	jsonObjectOut.WayBillId		= wayBillId;
	jsonObjectOut.PackingTypeId	= packingTypeId;
	jsonObject	= jsonObjectOut;
	var jsonStr	= JSON.stringify(jsonObject);
	$.getJSON("FindShortsDetails.do?pageId=330&eventId=18", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					console.log("data ");
					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
					refreshAndHidePartOfPage('short-receive-settlement', 'hideAndRefresh');
					hideLayer();
				} else {
					hideAllMessages();
					showPartOfPage('short-receive-settlement');
														
					$("#excessReceive tbody tr").remove();
					$("#shortArtDetails tbody tr").remove();
					$("#excessArtDetails tbody tr").remove();
					console.log("shDetailsListColl "+data.shDetailsListColl);
					if(data.shDetailsListColl) {
						var shortReceiveDetails		= data.shDetailsListColl;
						
						if(shortReceiveDetails.length > 0) {
							for(var i = 0; i < shortReceiveDetails.length; i++) {
								var shortDetails	= shortReceiveDetails[i];
								/*if(shortReceiveDetails.length > 1){
									openDialog('dialogshortFormOnShortPendingForm');
								} else{
									findShortDetailsForSettlement1(shortDetails.shortReceiveId);
								}*/
								openDialog('dialogshortFormOnShortPendingForm');
								
								var shortRow		= createRow('tr_'+shortDetails.shortReceiveId, '');
								
								var lrNumber		= createColumn(shortRow ,'td_'+shortDetails.wayBillNumber,'10%','center','','');
								var shortDate		= createColumn(shortRow ,'td_'+shortDetails.shortReceiveDate,'10%','center','','');
								var shortBranch		= createColumn(shortRow ,'td_'+shortDetails.branchName,'10%','center','','');
								var shortNumber		= createColumn(shortRow ,'td_'+shortDetails.shortReceiveId,'10%','center','','');
								var shortUser		= createColumn(shortRow ,'td_'+shortDetails.userName,'10%','center','','');
								var articleType		= createColumn(shortRow ,'td_'+shortDetails.packingType,'10%','center','','');
								var NoofAtcl		= createColumn(shortRow ,'td_'+shortDetails.shortArticle,'10%','center','','');
								var SaidToContain	= createColumn(shortRow ,'td_'+shortDetails.saidToContain,'10%','center','','');
								var ShtrAtcl		= createColumn(shortRow ,'td_'+shortDetails.shortArticle,'10%','center','','');
								var pendingAtcl		= createColumn(shortRow ,'td_'+shortDetails.pendingShort,'10%','center','','');
								/*var DmageAtcl		= createColumn(shortRow ,'td_'+shortDetails.damageArticle,'10%','center','','');*/
								var ShrtWgt			= createColumn(shortRow ,'td_'+shortDetails.shortWeight,'10%','center','','');
								var shtAmt			= createColumn(shortRow ,'td_'+shortDetails.amount,'10%','center','','');
								var LsNumber		= createColumn(shortRow ,'td_'+shortDetails.lsNumber,'10%','center','','');
								var TurNumber		= createColumn(shortRow ,'td_'+shortDetails.turNumber,'10%','center','','');
								var PrivateMark		= createColumn(shortRow ,'td_'+shortDetails.privateMark,'10%','center','','');
								var remark			= createColumn(shortRow ,'td_'+shortDetails.remark,'10%','center','','');
								var pendingDays		= createColumn(shortRow ,'td_'+shortDetails.pendingDays,'10%','center','','');
								
								$(lrNumber).append('<a href="#" onclick="">'+shortDetails.wayBillNumber+'</a>');
								$(shortDate).append(shortDetails.shortDate);
								$(shortBranch).append(shortDetails.branchName);
								$(shortNumber).append(shortDetails.shortReceiveId);
								$(shortUser).append(shortDetails.userName);
								$(articleType).append(shortDetails.packingType);
								$(NoofAtcl).append(shortDetails.shortArticle);
								$(SaidToContain).append(shortDetails.saidToContain);
								$(ShtrAtcl).append(shortDetails.shortArticle);
								$(pendingAtcl).append(shortDetails.pendingShort);
								$(ShrtWgt).append(shortDetails.shortWeight);
								$(shtAmt).append(shortDetails.amount);
								$(LsNumber).append(shortDetails.lsNumber);
								$(TurNumber).append(shortDetails.turNumber);
								$(PrivateMark).append(shortDetails.privateMark);
								$(remark).append(shortDetails.remark);
								$(pendingDays).append(shortDetails.pendingDays);
								
								$('#shortDetailsTbl').append(shortRow);
							}
						}
					}
					hideLayer();
				}
			});
}