/**
 * 
 */
function generateExcelForTally(filter) {
	var url	= '';
	
	switch (filter) {
	case 1://Cash Statement old
		if(!ValidateFormElement()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/cashStatementReportWS/generateExcelForTally.do?';
		break;

	case 2://Bill Register Report
		if(!validation()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/billRegisterReportWS/generateExcelForTally.do?';
		break;
		
	case 3://LHPV Register Report
		if(!ValidateFormElement()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/lhpvRegisterReportWS/generateExcelForTally.do?';
		break;
		
	case 4://Vehicle Number Wise Dispatch Details
		if(!ValidateFormElement()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/vehicleAgentWiseDispatchDetailsWS/generateExcelForTally.do?';
		break;
	
	case 5://Vehicle Number Wise Dispatch Details
		if(!ValidateFormElement()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/vehicleAgentWiseDispatchDetailsWS/generateExcelForVehicleWiseDispatchForTally.do?';
		break;

	case 6://Tur Report, Get Lhpv Details
		if(!ValidateFormElement()) {
			return false;
		}
		
		url		= WEB_SERVICE_URL+'/LHPVWS/generateExcelForLhpvDetails.do?';
		break;

	case 7://Branch Wise Analysis Report
		url		= WEB_SERVICE_URL+'/branchWiseAnalysisReportWS/generateExcelForTally.do?';
		break;
	case 8://Truck Analyzing Details
		
		url		= WEB_SERVICE_URL+'/truckAnalyzingReportWS/generateExcelForTruckAnaLyzingReport.do?';
		break;
	case 9://Unbilled Register Creditor Wise Report
		if(!ValidateFormElement()) return false;
		
		url		= WEB_SERVICE_URL+'/report/unbilledRegisterCreditorWiseReportWS/generateExcelForTally.do?';
		break;		
	default:
		break;
	}
	
	let jsonObject	= new Object();
	
	jsonObject.fromDate					= $('#fromDate').val();
	jsonObject.toDate					= $('#toDate').val();
	jsonObject.regionId					= $('#region').val();
	jsonObject.subRegionId				= $('#subRegion').val();
	jsonObject.sourceBranchId			= $('#branch').val();
	jsonObject.vehicleAgentId			= $('#selectedVehicleAgentId').val();
	jsonObject.destinationSubRegionId	= $('#TosubRegion').val();
	jsonObject.toSubRegionId			= $('#TosubRegion').val();
	jsonObject.destinationBranchId		= $('#SelectDestBranch').val();
	jsonObject.selectDestBranchId		= $('#SelectDestBranch').val();
	jsonObject.timeDuration				= $('#timeDuration').val();
	jsonObject.wayBillTypeId			= $('#WayBillType').val();
	jsonObject.selectionType			= $('#selectionType').val();
	jsonObject.lrMode					= $('#lrMode').val();
	jsonObject.wayBillStatusId			= $('#WayBillStatus').val();
	jsonObject.corporateAccountId		= $('#selectedCorpId').val();
	
	showLayer();
	$.ajax({
		type	: "POST",
		url		: url,
		dataType: 'json',
		data	:jsonObject,
		success: function (data) {
			if(data.message.messageId == 21 || data.message.messageId == 4) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return false;
			}
			generateFileToDownload(data);
		},
		error: function (e) {
			hideLayer();
		}
	});
}