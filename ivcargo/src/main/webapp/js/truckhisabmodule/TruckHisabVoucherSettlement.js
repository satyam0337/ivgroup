/***
 * Created By : Shailesh Khandare
 * Description : Get Truck Hisab Settlement Module.
 */
var expenseVoucherDetails	= new Array();
var dailyAllwanceArray		= new Array();
var tollArray				= new Array();
var miscArray1				= new Array();
var printJsonForThv			= null;
var doneTheStuff			= false;
var tollMasterArray	= null;
var fastTagtollArray	= null;

/**
 *Process for settlement of voucher. 
 */

function insertIntoTruckHisabSettlement(){

	$("#SettleVoucher").addClass("hide");
	$("#SettleVoucher").attr("disabled", true);
	
	

	
if(confirm("Are You Sure You Want To Settle ?")) {
	showLayer();
	var JsonObject 			= new Object();
	var JsonOutObject 		= new Object();
	
	var truckHisabVoucherID			= $("#truckHisabVocherId").val();
	
	var truckHisabVoucherNumber		= $("#truckHisabVocherNumber").val();
	
	var vehicleIdSttlement			= $("#VehicleId").val();
	var vehiclenumberSttlement		= $("#truckOwnNumber").val();
	var driverNameSttlement			= $("#driverNameAuto").val();
	var driverIdSttlement			= $("#driverID").val();
	var lhpvIdSttlement				= $("#lHPVID").val();
	var filnalTotalSttlement		= $("#TotalAllExpense").val();
	var remarkSttlement				= $("#Remark-1-18").val();
	var chargeMasterId		        = Number($("#ExpenseChargeMasterId").val());
	var closingKilometer			= $("#closingKilometer").val();
	var prevClosingKilometer			= $("#closingKilometerPrev").html();

	JsonObject.TruckHisabVoucherID		= truckHisabVoucherID;
	JsonObject.TruckHisabVoucherNumber	= truckHisabVoucherNumber;
	JsonObject.VehicleIdSttlement		= vehicleIdSttlement;
	JsonObject.VEHICLENUMBERSTTLEMENT	= vehiclenumberSttlement;
	JsonObject.DriverNameSttlement		= driverNameSttlement;
	JsonObject.DriverIdSttlement		= driverIdSttlement;
	JsonObject.LhpvIdSttlement			= lhpvIdSttlement;
	JsonObject.FilnalTotalSttlement		= filnalTotalSttlement;
	JsonObject.RemarkSttlement			= remarkSttlement;
	JsonObject.Filter					= 7;
	JsonObject.paymentType				= 1;
	JsonObject.closingKilometer			= closingKilometer;
	JsonObject.prevClosingKilometer		= prevClosingKilometer;
	
	if(showBackDateInTruckHisabSettlement)
		JsonObject.settlementBackDate	= $('#settlementBackDate').val();
	
	
	/*if($("#DailyAllowanceExpensemasterTypeID1").val()>0){
		var expenseModel = new Object();
		expenseModel.ExpenseMasterTypeID		= $("#DailyAllowanceExpensemasterTypeID").val();
		expenseModel.Amount						= $("#DailyAllowanceExpensemasterTypeID1").val();
		expenseModel.Remark						= $("#allowanceRemark").val();
		expenseVoucherDetails.push(expenseModel);
	}
	if($("#TollExpenseTypeID1").val() > 0){
		var expenseModel = new Object();
		expenseModel.ExpenseMasterTypeID		= $("#TollExpenseTypeID").val();
		expenseModel.Amount						= $("#TollExpenseTypeID1").val();
		expenseModel.Remark						= $("#TollRemark").val();
		expenseVoucherDetails.push(expenseModel);
	}
	if($("#MiscExpenseID1").val() > 0){
		var expenseModel = new Object();
		expenseModel.ExpenseMasterTypeID		= $("#MiscExpenseID").val();
		expenseModel.Amount						= $("#MiscExpenseID1").val();
		expenseModel.Remark						= $("#miscRemark").val();
		expenseVoucherDetails.push(expenseModel);
	}*/
	if(chargeMasterId > 0){
		var expenseModel = new Object();
		expenseModel.ExpenseMasterTypeID		= chargeMasterId;
		expenseModel.Amount						= filnalTotalSttlement;
		expenseModel.Remark						= $("#miscRemark").val();
		expenseVoucherDetails.push(expenseModel);
	}
	JsonObject.ExpenseVoucherDetails		= expenseVoucherDetails;
	
	var count	= $("#dailyAllowance tr").length;
	if(Number(count) >= 3 ){
		for(var i = 0; i < count-2; i++) {
				var dailyAllwanceData = new Object();
				dailyAllwanceData.AllowanceFromDate			= $("#fromDate_"+(i+1)).html();
				dailyAllwanceData.AllowanceTODate			= $("#toDate_"+(i+1)).html();
				dailyAllwanceData.AllowanceTotalDays		= $("#totDays_"+(i+1)).html();
				dailyAllwanceData.AllowanceDriverAmt		= $("#driverAmt_"+(i+1)).html();
				dailyAllwanceData.AllowanceTotAmt			= $("#totAmt_"+(i+1)).html();
				dailyAllwanceData.AllowanceRemark			= $("#remark_"+(i+1)).html();
				dailyAllwanceArray.push(dailyAllwanceData);
		}
	}
	
	if(showFastTagTollDetails){
		
		 fastTagtollArray = JSON.parse(localStorage.getItem("fastTagtollArray"));
		 tollMasterArray = JSON.parse(localStorage.getItem("tollMasterArray"));
		//s tollArray.push(tollMasterArray);
		
	}else{
		var count1	= $("#tollExpense tr").length;
		if(Number(count1) >= 3){
			for(var i = 0; i < count1-2; i++) {
				var tollData = new Object();

				tollData.TollMasterTypeId		= $("#TollTypeMasterId_"+(i+1)).val();
				tollData.TollMasterAmt			= $("#TotTollAmount_"+(i+1)).html();
				tollData.TollMasterRemark		= $("#tollRemark_"+(i+1)).html();
				tollData.TollMasteName			= $("#tolltype_"+(i+1)).html();
				tollArray.push(tollData);
			}
		}	
	}
	
	var count2	= $("#miscExpense tr").length;
	if(count2 >= 3){
	for(var i = 0; i < count2-2; i++) {
			var miscData6 = new Object();
		
			miscData6.MiscMasterTypeId555	= $("#miscTypeMasterId123_"+(i+1)).val();
			miscData6.MiscMasterAmt			= $("#TotMISCAmount_"+(i+1)).html();
			miscData6.MiscMasterRemark		= $("#remarkAmountCol_"+(i+1)).html();
			miscData6.MiscMasterName		= $("#typeOfExpense_"+(i+1)).html();
			
			miscArray1.push(miscData6);
	}
	}
	
	JsonObject.dailyAllwanceArray		= dailyAllwanceArray;
	if(showFastTagTollDetails && fastTagtollArray != null){
		JsonObject.TollArray					= tollMasterArray;
		JsonObject.fastTagtollArray				= fastTagtollArray;
	}else{
		JsonObject.TollArray				= tollArray;
		JsonObject.fastTagtollArray				= new Array();
	}
	
	
	JsonObject.MiscArray21			    = miscArray1;
	JsonObject.GLOBLHPVCOLLECTON		= globLhpvCollecton;
	JsonObject.GLOBLSCOLLECTON			= globLSCollecton;
	
	JsonOutObject 					= JsonObject;
	
	var jsonStr 	= JSON.stringify(JsonOutObject);
	
	if(!doneTheStuff){
		doneTheStuff = true;
		$.post("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2", 
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						hideLayer();
						
						if(data.errorDescription != null)
							showMessage('error', data.errorDescription);
						else
							showMessage('error', "Sorry An Error Occured in the system!!");
					
					}else{
						showMessage('success', "Inserted Successfully!");
						printJsonForThv				= data.printForThv;
						hideLayer();
						reset();
						printWindowTHV(printJsonForThv);
						
					}
				});
	}
	} else {
		$("#SettleVoucher").removeClass("hide");
		$("#SettleVoucher").attr("disabled", false);
		doneTheStuff = false;
		hideLayer();
	}
localStorage.removeItem("fastTagtollArray");
localStorage.removeItem("tollMasterArray");
localStorage.removeItem("totalSelectedTollAmt");
}



function reset(){
	
	$("#TruckPannelTable").val("");
	/*$('#TruckPannelTable tr').remove();
	$('#TruckPannelTable').empty();*/
	$('#truckDriverdetailsTbl tr').remove();
	$('#truckDriverdetailsTbl').empty();
	$('#totalSummaryTable').empty();
	$('#lhpvDetailsTable').empty();
	$('#lhpvDetailsTable re').remove();
	$('#totalSummaryTable tr').remove();
	$('#tabs').hide();
	$('#truckDriverdetails').hide();
	$('#lhpvDetailsTable tr').remove();
	$('#lhpvDetailsTable').empty();
	$('#lhpvDetailsTable').hide();
	$('#truckHisabDetails').hide();
	$('#truckHisabDetails').remove();
	$('#lsDetailsTable tr').remove();
	$('#lsDetailsTable').empty();
	$('#lsDetailsTable').hide();
	
	$('#tripDetails').hide();
	$('#truckOwnNumber').val("");
	$('#voucherID1').hide("");
	$('#voucherID').hide("");
	$('#voucherID').val("");
	loadTruckHisabSettlement();
}