/**
 * @Author Anant Chaudhary	06-06-2016
 */

var jsondata				= null;
var executive				= null;
var LHPVChargeTypeConstant	= null;
var loggedInBranchDetails	= null;
var allLHPVCharges			= null;
var chargesColl				= null;
var wayBillHM				= null;
var lhpvChargesHshmp		= null;
var waybillTypeHshmp		= null;
var reportData				= null;
var dispatchLedgerArrlist	= null;
var reportViewModel			= null;
var lhpvModel				= null;
var lhpvModels				= null;
var lhpvChargesAmt			= null;
var driverMasterModel		= null;
var loadingSheetDetails		= null;
var vehicleNumberMaster		= null;
var netLoadUnloadChargeHM	= null;
var bookingTypeConstant		= null;
var totalCrossingRateHM		= null;
var truckDeliverySummaryValObject	= null;
var lhpvCompanyDetails				= null;
var truckLoadTypeConstant		= null;
var lhpvSourceBranch		    = null;
var lhpvDestBranch				= null;
var isShowBankDetails			= false;

function getLhpvDataToPrint(lhpvId) {
	var jsonObject		= new Object();
	
	jsonObject.LhpvId			= lhpvId;
	jsonObject.filter			= 4;
	
	showLayer();
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("LHPVAjaxAction.do?pageId=228&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					
				} else{
					jsondata				= data;
					
					executive				= jsondata.executive;
					LHPVChargeTypeConstant	= jsondata.LHPVChargeTypeConstant;
					loggedInBranchDetails	= jsondata.LoggedInBranchDetails;
					allLHPVCharges			= jsondata.AllLHPVCharges;
					chargesColl				= jsondata.chargesColl;
					wayBillHM				= jsondata.wayBillHM;
					lhpvChargesHshmp		= jsondata.lhpvChargesHshmp;
					waybillTypeHshmp		= jsondata.waybillTypeHshmp;
					reportData				= jsondata.ReportData;
					dispatchLedgerArrlist	= jsondata.dispatchLedgerArrlist;
					reportViewModel			= jsondata.ReportViewModel;
					lhpvModel				= jsondata.ReportData;
					lhpvModels				= jsondata.lhpvModels;
					lhpvChargesAmt			= jsondata.lhpvChargesAmt;
					driverMasterModel		= jsondata.driverMasterModel1;
					loadingSheetDetails		= jsondata.loadingSheetDetails;
					vehicleNumberMaster		= jsondata.vehicleNumberMaster;
					netLoadUnloadChargeHM	= jsondata.netLoadUnloadChargeHM;
					totalCrossingRateHM		= jsondata.totalCrossingRateHM;
					truckDeliverySummaryValObject	= jsondata.truckDeliverySummaryValObject;
					bookingTypeConstant		= jsondata.BookingTypeConstant;
					lhpvCompanyDetails		= jsondata.lhpvCompanyDetails;
					truckLoadTypeConstant	= jsondata.truckLoadTypeConstant;
					lhpvSourceBranch		= jsondata.lhpvSourceBranch;
					lhpvDestBranch			= jsondata.lhpvDestBranch;
					isShowBankDetails		= jsondata.isShowBankDetails;
					
					printLhpvWindow();
					hideLayer();
				}
			});
}
