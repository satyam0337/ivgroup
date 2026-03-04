/***
 * Created By : Shailesh Khandare
 * Description : Get Lhpv and Loading Sheet details for truck Hisab 
 * Date : 23-04-2016 
 */

var executive = null;
var globLhpv =null;
var globLhpvCollecton =null;
var globLSCollecton =null;
var vehicleNo;


/**
 * Get Lhpv details by vehicle id 
 */
var lhpvDtls 	= null;
function getLhpvDetailsByVehicleId(lhpvId){
	
	var JsonObject 			= new Object();
	var JsonOutObject 		= new Object();
	globLhpv = new Object();
	showLayer();
	JsonObject.lhpvId		= lhpvId;
	JsonObject.Filter		= 2;
	
	JsonOutObject 			= JsonObject;
	var jsonStr 			= JSON.stringify(JsonOutObject);
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2", 
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				hideLayer();
				}else{
					
					
					$('#lhpvDetailsTableTbody tbody tr').remove();
					$('#lhpvDetailsTableTbody').empty();
					var lhpv =   data.lhpvListColl;
					console.log("@@lhpv");
					console.log(lhpv);
					globLhpvCollecton	= data.lhpvListColl;
					executive =   data.executive;
					console.log("@@executive");
					console.log(executive);
					globLhpv 	= lhpv[0];
					vehicleNo = lhpv[0].vehicleNumber;
					checkForDestination(lhpv[0]);
					$('#lhpvDetailsTable').show();
					if(lhpv.length > 0){
						for(var i = 0; i < lhpv.length; i++) {
							
							lhpvDtls	= lhpv[i];
							var lhpvId 		= lhpvDtls.lhpvId;
							$("#lHPVID").val(lhpvId);
							getLsDetails(lhpvId);
							var lhpvNum 	= lhpvDtls.lhpvNum;
							var date 		= lhpvDtls.creationDate;
							var From	 	= lhpvDtls.lhpvBranchName;
							var To 			= lhpvDtls.destinationBranch;
							var remark	 	= lhpvDtls.remark;
							
							var row			= createRow('LHPV_'+(i+1), '');
							
							var lhpvNumCol			= createColumn(row, 'lhpvNumber_'+(i+1), 'datatd', '', 'left', 'height:2px;', '');
							var dateCol				= createColumn(row, 'dateCol_'+(i+1), 'datatd', '', 'left', 'height:2px;', '');
							var FromCol				= createColumn(row, 'FromCol_'+(i+1), 'datatd', '', 'left', 'height:2px;', '');
							var ToCol				= createColumn(row, 'ToCol_'+(i+1), 'datatd', '', 'left', 'height:2px;', '');
							var remarkCol			= createColumn(row, 'remarkCol_'+(i+1), 'datatd', '', 'left', 'height:2px;', '');
							
							
							$(lhpvNumCol).append('<a href="javascript:openWindowForView('+lhpvId+', '+lhpvNum+', 3, 0, 0, 0)">'+lhpvNum+'</a>');
							$(dateCol).append(date);
							$(FromCol).append(From);
							$(ToCol).append(To);
							$(remarkCol).append(remark);
							$('#lhpvDetailsTableTbody').append(row);
							
						}
					}
					hideLayer();
				}
			})
}



var statusCount 	= 0;
function getLsDetails(lhpvId){
	var JsonObject 			= new Object();
	var JsonOutObject 		= new Object();
	var totDDLR				= 0;
	var totWeight			= 0;
	var totForm				= 0;
	var totArticle			= 0;
	

	JsonObject.LHPVID		= lhpvId;
	JsonObject.Filter		= 3;
	
	JsonOutObject 			= JsonObject;
	var jsonStr 			= JSON.stringify(JsonOutObject);
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2", 
			{json:jsonStr}, function(data) {
				console.log("@@ls");
				console.log(data);
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', "All Loading Sheets Are not Attached !");
				}	else{
					
					
					$('#lsDetailsTableBody tbody tr').remove();
					$('#lsDetailsTableBody').empty();
					$('#lsDetailsTableFoot').empty();
					$('#lsDetailsTable').show();
					
					var dispatchLedger =   data.dispatchLedgerListColl;
					 globLSCollecton =   data.dispatchLedgerListColl;
				
					if(dispatchLedger.length > 0){
						for(var i = 0; i < dispatchLedger.length; i++) {
							
							dispatchLedgerDtls	= dispatchLedger[i];
							var dispatchLedgerId 		= dispatchLedgerDtls.lhpvId;
							var lsNum 		= dispatchLedgerDtls.lsNumber;
							var date 		= dispatchLedgerDtls.creationDate;
							var From	 	= dispatchLedgerDtls.sourceBranch;
							var To 			= dispatchLedgerDtls.destinationBranch;
							var DDLR 		= dispatchLedgerDtls.totalNoOfDoorDelivery;
							var Weight	 	= dispatchLedgerDtls.totalActualWeight;
							var totalForm	= dispatchLedgerDtls.totalNoOfForms;
							var article		= dispatchLedgerDtls.totalNoOfPackages;
							var Status	 	= dispatchLedgerDtls.statusString;
							if(dispatchLedgerDtls.turNumber == null){
								var TURNumber	= "";
								
							}else{
								var TURNumber	= dispatchLedgerDtls.turNumber;
							}
							var Status	 	= dispatchLedgerDtls.statusString;
							var flagShortExcess	= dispatchLedgerDtls.flagShortExcessDamage;
							
							/*if(dispatchLedgerDtls.status == 0 ){
								statusCount		= Number( statusCount )+ 1 ;
							}*/
							totDDLR	=	Number(DDLR) + Number(totDDLR);
							totWeight	=	Number(Weight) + Number(totWeight);
							totForm		= 	Number(totalForm) + Number(totForm);
							totArticle		= 	Number(totArticle) + Number(article);
							
							var row			= createRow('LHPV_'+(i+1), '');
							
							var lsNumCol			= createColumn(row, 'lsNum_'+(i+1), 'datatd', '', 'left', '', '');
							var dateCol				= createColumn(row, 'dateCol_'+(i+1), 'datatd', '', 'left', '', '');
							var FromCol				= createColumn(row, 'FromCol_'+(i+1), 'datatd', '', 'left', '', '');
							var ToCol				= createColumn(row, 'ToCol_'+(i+1), 'datatd', '', 'left', '', '');
							var DDLRCol				= createColumn(row, 'DDLRCol_'+(i+1), 'datatd', '', 'left', '', '');
							var WeightCol			= createColumn(row, 'WeightCol_'+(i+1), 'datatd', '', 'left', '', '');
							var totalFormCol		= createColumn(row, 'totalFormCol_'+(i+1), 'datatd', '', 'left', '', '');
							var totArticleCol		= createColumn(row, 'totArticleCol_'+(i+1), 'datatd', '', 'left', '', '');
							var StatusCol			= createColumn(row, 'StatusCol_'+(i+1), 'datatd', '', 'left', '', '');							
							var TURNumberCol		= createColumn(row, 'TURNumberCol_'+(i+1), 'datatd', '', 'left', '', '');
							
							$(lsNumCol).append('<a href="javascript:openWindowForView('+dispatchLedgerId+', '+lsNum+', 2, 0, 0, 0)">'+lsNum+'</a>');
							$(dateCol).append(date);
							$(FromCol).append(From);
							$(ToCol).append(To);
							$(DDLRCol).append(DDLR);
							$(WeightCol).append(Weight);
							$(totalFormCol).append(totalForm);
							$(totArticleCol).append(article);
							$(StatusCol).append(Status);
							$(TURNumberCol).append('<a href="javascript:openWindowForView('+dispatchLedgerDtls.receivedLedgerId+', '+TURNumber+', 4, 0, 0, 0)" title="'+dispatchLedgerDtls.turRemark+'"> '+TURNumber+'</a>');
							if(flagShortExcess){
								$(TURNumberCol).append('<span style="color: red;"><b>&nbsp;*</b></span>');
							}
							
							$('#lsDetailsTableBody').append(row);
						
							
						}
						
						var rowFoot					= createRow('rowFoot_'+(i+1), '');
						
						var lsNumFootCol			= createColumn(rowFoot, 'lsNumFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var dateFootCol				= createColumn(rowFoot, 'dateFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var FromFootCol				= createColumn(rowFoot, 'FromFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var ToFootCol				= createColumn(rowFoot, 'ToFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var DDLRFootCol				= createColumn(rowFoot, 'DDLRFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var WeightFootCol			= createColumn(rowFoot, 'WeightFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var totalFormFootCol		= createColumn(rowFoot, 'totalFormFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var totArticleFootCol		= createColumn(rowFoot, 'totArticleFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						var StatusFootCol			= createColumn(rowFoot, 'StatusFootCol_'+(i+1), 'datatd', '', 'left', '', '');							
						var TURNumberFootCol		= createColumn(rowFoot, 'TURNumberFootCol_'+(i+1), 'datatd', '', 'left', '', '');
						
						$(lsNumFootCol).append("");
						$(dateFootCol).append("");
						$(FromCol).append("");
						$(ToFootCol).append("");
						$(DDLRFootCol).append(totDDLR);
						$(WeightFootCol).append(totWeight);
						$(totalFormFootCol).append(totForm);
						$(totArticleFootCol).append(totArticle);
						$(StatusFootCol).append("");
						$(TURNumberFootCol).append("");
						
						$('#lsDetailsTableFoot').append(rowFoot);
						
						//checkReceiveStatus(statusCount);
					}
				}
			})
}




function checkForDestination(lhpv) {
	var settlementFlag = false;
	if(executive.regionId  != lhpv.regionId && !settlementFlag){
		showMessage('info', "You can not settle other Region Voucher !");
		 /*$("#truck-hisab-details").hide();*/
		return true;
	}else{
		$("#truckHisabDetails").show();
		$("#truckDriverdetails").show();
		$("#addTruckHisabExpense").removeAttr('disabled');
		return false;
	}
}

function checkReceiveStatus(statusCount){
	
	if(checkForDestination(globLhpv)){
		return;
	}
	
	if(Number(statusCount) > 0 ){
		showMessage('error', 'Loading Sheets Are not received, !');
		showMessage('info', "All Loading Sheets Are not received, !");
	}else{
		
		$("#addTruckHisabExpense").removeAttr('disabled');
	}
}