/**
 * @author Shailesh Khandare 15-11-2015
 */


function getExcessDetailsByWaybillId(wayBillId) {
	
	commonShort1(wayBillId);
	openDialog('dialogExcessFormOnShortPendingForm');
}

//Populate Excess details Table Via Json.
function commonShort1(wayBillId) {
	$('#excessDetailsTbl tbody tr').remove();
	document.getElementById('serialNumber').style.display = 'none';
	document.getElementById('showHideExcessSettleButton').style.display = 'none';
	document.getElementById('shortDetails').style.display = 'none';
	document.getElementById('serialNumber1').style.display = 'none';
	document.getElementById('showHideExcessSettleButton1').style.display = 'none';
	document.getElementById('shortDetails1').style.display = 'none';

	var  jsonObjectOut = new Object();
	jsonObjectOut.WayBillId	= wayBillId;
	
	var jsonStr	= JSON.stringify(jsonObjectOut);
	
	$.getJSON("FindExcessDetails.do?pageId=330&eventId=17", 
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
					
					if(data.exessDetailsCall) {
						var excessReceiveDetails		= data.exessDetailsCall;
						
						if(excessReceiveDetails.length > 0) {
							for(var i = 0; i < excessReceiveDetails.length; i++) {
								var excessDetails	= excessReceiveDetails[i];
								var excessRow		= createRow('tr_'+excessDetails.excessReceiveId, '');
								
								var lrNumber		= createColumn(excessRow ,'td_'+excessDetails.wayBillNumber,'10%','center','','');
								var excessDate		= createColumn(excessRow ,'td_'+excessDetails.excessDate,'10%','center','','');
								var excessBranch	= createColumn(excessRow ,'td_'+excessDetails.branchName,'10%','center','','');
								var excessNumber	= createColumn(excessRow ,'td_'+excessDetails.excessReceiveId,'10%','center','','');
								var excessUser		= createColumn(excessRow ,'td_'+excessDetails.userName,'10%','center','','');
								var articleType		= createColumn(excessRow ,'td_'+excessDetails.packingType,'10%','center','','');
								var NoofAtcl		= createColumn(excessRow ,'td_'+excessDetails.excessArticle,'10%','center','','');
								var PendingExcess	= createColumn(excessRow ,'td_'+excessDetails.excessArticle,'10%','center','','');
								var SaidToContain	= createColumn(excessRow ,'td_'+excessDetails.saidToContain,'10%','center','','');
								var excessWeight	= createColumn(excessRow ,'td_'+excessDetails.weight,'10%','center','','');
								var lsNumber		= createColumn(excessRow ,'td_'+excessDetails.lsNumber,'10%','center','','');
								var turNumber		= createColumn(excessRow ,'td_'+excessDetails.turNumber,'10%','center','','');
								var privateMark		= createColumn(excessRow ,'td_'+excessDetails.privateMark,'10%','center','','');
								var remark			= createColumn(excessRow ,'td_'+excessDetails.remark,'10%','center','','');
								var pendingDays		= createColumn(excessRow ,'td_'+excessDetails.pendingDays,'10%','center','','');
								
								$(lrNumber).append(excessDetails.wayBillNumber);
								$(excessDate).append(excessDetails.excessDate);
								$(excessBranch).append(excessDetails.branchName);
								$(excessNumber).append(excessDetails.excessNumber);
								$(excessUser).append(excessDetails.userName);
								$(articleType).append(excessDetails.packingType);
								$(NoofAtcl).append(excessDetails.excessArticle);
								$(PendingExcess).append('');
								$(SaidToContain).append(excessDetails.saidToContain);
								$(excessWeight).append(excessDetails.weight);
								$(lsNumber).append(excessDetails.lsNumber);
								$(turNumber).append(excessDetails.turNumber);
								$(privateMark).append(excessDetails.privateMark);
								$(remark).append(excessDetails.remark);
								$(pendingDays).append(excessDetails.pendingDays);
								$('#excessDetailsTbl').append(excessRow);
							}
						}
					}
					hideLayer();
				}
			});
}