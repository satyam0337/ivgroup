/**
 * @Author Anant Chaudhary	06-06-2016
 */

var jsondata				= null;
var executive				= null;
var LhpvChargeTypeMaster	= null;
var loggedInBranchDetails	= null;
var lsDetails				= null;
var lhpvChargesForGroup		= null;
var blhpvChargesHashMap		= null;
var lhpvChargesHashMap		= null;
var ftlLRModel				= null;
var reportViewModel			= null;
var totalShortPkgsInTUR		= 0;
var totalDamagePkgsInTUR	= 0;
var wayBillModelsArr		= null;
var totalWithBillQty		= 0;
var totalWithoutBillQty		= 0;
var blhpv					= 0;

function getBlhpvDataToPrint(blhpvId) {
	var jsonObject		= new Object();
	
	jsonObject.BlhpvId			= blhpvId;
	jsonObject.filter			= 4;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("BLHPVAjaxAction.do?pageId=48&eventId=10",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					
				} else{
					jsondata				= data;
					
					executive				= jsondata.executive;
					LhpvChargeTypeMaster	= jsondata.LhpvChargeTypeMaster;
					loggedInBranchDetails	= jsondata.LoggedInBranchDetails;
					lsDetails				= jsondata.lsDetails;
					reportViewModel			= jsondata.ReportViewModel;
					lhpvChargesForGroup		= jsondata.lhpvChargesForGroup;
					blhpvChargesHashMap		= jsondata.blhpvChargesHashMap;
					lhpvChargesHashMap		= jsondata.lhpvChargesHashMap;
					ftlLRModel				= jsondata.ftlLRModel;
					totalShortPkgsInTUR		= jsondata.totalShortPkgsInTUR;
					totalDamagePkgsInTUR	= jsondata.totalDamagePkgsInTUR;
					wayBillModelsArr		= jsondata.wayBillModelsArr;
					totalWithBillQty		= jsondata.totalWithBillQty;
					totalWithoutBillQty		= jsondata.totalWithoutBillQty;
					blhpv					= jsondata.blhpv;
					
					printBlhpvWindow();
				}
			});
}