/***
 * Created By : Shailesh Khandare
 * Description : Validation for Truck Hisab voucher  
 * Date : 28-04-2016 05:17 P.M.
 */


$( "#findButton" ).click(function() {
	validationForTruckHisabVoucher();
});


function getfastTagData(){
	
	
	var vehiclenumberSttlement		= $("#truckOwnNumber").val();
	if(lastSellementDate == undefined || lastSellementDate=='undefined')
		lastSellementDate = defaultLastSellementDateMilliSec;
	
		 
	childwin = window.open('tollData.do?pageId=340&eventId=2&modulename=fastTagTollData&vehicleNumber='+vehicleNo+'&lastSettlementDate='+lastSellementDate+'','newwindow', config='height=600,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

/**
 * validation for truck hisab voucher settelement.
 */
function validationForTruckHisabVoucher() {
	
	if(!validateTruckNumber()){
		showMessage("error", truckHisabTruckErrMsg);
		toogleElement('error','block');
		changeError('truckOwnNumber','0','0');
		return;
	}
	
	var vehID = $("#VehicleId").val();
	
	$(".fastTagTd").show();
	getTruckHisabVoucher(vehID);
	/*getLastDateTransaction(vehID);
	getvehicleTypeByVehicleID(vehID);
	display();
	getLhpvDetailsByVehicleId(vehID);*/
}

/**
 *Validate For truck number
 */
function validateTruckNumber(){
		
	if($("#truckOwnNumber").val() == "" || $("#truckOwnNumber").val() <= 0){
		return false;
	}
	if($("#VehicleId").val() == "" || $("#VehicleId").val() <= 0){
		return false;
	}
	
	return true;
}

/**
 * Validate Allowance Tab
 * */
function validateAllowance(){
	if($("#fromDailyAllowdate").val() == "" || $("#fromDailyAllowdate").val() <= 0){
		showMessage("error", DailyAllowanceFromDateErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('fromDailyAllowdate', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('fromDailyAllowdate', '', '', 'green');
	}
	
	if($("#toDailyAllowdate").val() == "" || $("#toDailyAllowdate").val() <= 0){
		showMessage("error", DailyAllowanceToDateErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('toDailyAllowdate', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('toDailyAllowdate', '', '', 'green');
	}
	
	if($("#totalNumberDay").val() == "" || $("#totalNumberDay").val() <= 0){
		showMessage("error", DailyAllowanceTotdaysErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('totalNumberDay', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('totalNumberDay', '', '', 'green');
	}
	
	if($("#driverAllowanceAmount").val() == "" || $("#driverAllowanceAmount").val() <= 0){
		showMessage("error", DailyDriverAllowanceErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('driverAllowanceAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('driverAllowanceAmount', '', '', 'green');
	}
	
	if($("#totAmountAllowance").val() == "" || $("#totAmountAllowance").val() <= 0){
		showMessage("error", DailyAllowanceToalErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('totAmountAllowance', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('totAmountAllowance', '', '', 'green');
	}
	
	return true;
}

/**
 * Validate Toll Tab
 * */
function validateToll(){
	if($("#tollName").val() == "" || $("#tollName").val() <= 0 ){
		showMessage("error", DailyTollNameErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('fromDailyAllowdate', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('fromDailyAllowdate', '', '', 'green');
	}
	
	if($("#tollTypeMasterId").val() <= 0){
		showMessage("error", DailyTollNameErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('fromDailyAllowdate', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('fromDailyAllowdate', '', '', 'green');
	}
	
	if($("#TotTollAmount").val() == "" || $("#TotTollAmount").val() <= 0){
		showMessage("error", DailyTollAmountErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('TotTollAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('TotTollAmount', '', '', 'green');
	}
	
	/*if($("#TollRemark").val() == "" || $("#TollRemark").val() <= 0){
		showMessage("error", DailyRemarkErrMsg);
		toogleElement('error','block');
		changeError('TollRemark','0','0');
		return false;
	}
	*/
	
	return true;
}

/**
 * Validate Misc Tab
 * */
function validateMisc(){
	if($("#miscName").val() == "" || $("#miscName").val() <= 0 ){
		showMessage("error", MiscNameErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('miscName', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('miscName', '', '', 'green');
	}
	
	if( $("#miscMastertypeIduniq").val() <= 0){
		showMessage("error", MiscNameErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('miscName', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('miscName', '', '', 'green');
	}
	
	if($("#totMiscAmount").val() == "" || $("#totMiscAmount").val() <= 0){
		showMessage("error", MiscAmountErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('totMiscAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('totMiscAmount', '', '', 'green');
	}
	
	/*if($("#miscRemark").val() == "" || $("#miscRemark").val() <= 0){
		showMessage("error", MiscRemarkErrMsg);
		toogleElement('error','block');
		changeError('miscRemark','0','0');
		return false;
	}*/
	return true;
}


/**
 * Settlement Voucher
 */
$( "#SettleVoucher" ).click(function() {
	validateSettlement();
});

function validateSettlement(){
	/*if(!validateMisc()){
		return;
	}
	if(!validateToll()){
		return;
	}
	if(!validateAllowance()){
		return;
	}*/
	
	if($("#driverNameAuto").val() == "" || $("#driverNameAuto").val() <= 0){
		showMessage("error", DriverErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('driverNameAuto', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('driverNameAuto', '', '', 'green');
	}
	
	if($("#driverID").val() <= 0){
		showMessage("error", DriverErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('driverNameAuto', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('driverNameAuto', '', '', 'green');
	}
	
	if($("#TotalAllExpense").val() == "" || $("#TotalAllExpense").val() <= 0){
		showMessage("error", FinalErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('TotalAllExpense', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('TotalAllExpense', '', '', 'green');
	}
	
	if($("#DailyAllowanceExpensemasterTypeID1").val() == ""){
		showMessage("error", DailyDriverAllowanceErrMsg);
		$("#DailyAllowanceExpensemasterTypeID1").val(0);
		toogleElement('error','block');
		changeTextFieldColor('driverAllowanceAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('driverAllowanceAmount', '', '', 'green');
	}
	
	if($("#TollExpenseTypeID1").val() == ""){
		showMessage("error", DailyTollAmountErrMsg);
		toogleElement('error','block');
		$("#TollExpenseTypeID1").val(0);
		changeTextFieldColor('TotTollAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('TotTollAmount', '', '', 'green');
	}
	
	if($("#MiscExpenseID1").val() == ""){
		$("#MiscExpenseID1").val(0);
		showMessage("error", MiscAmountErrMsg);
		toogleElement('error','block');
		changeTextFieldColor('totMiscAmount', '', '', 'red');
		return false;
	} else {
		changeTextFieldColorWithoutFocus('totMiscAmount', '', '', 'green');
	}

	if(($("#MiscExpenseID1").val() <= 0 && $("#TollExpenseTypeID1").val() <= 0 && $("#DailyAllowanceExpensemasterTypeID1").val() <= 0 && !showFastTagTollDetails) || $("#TotalAllExpense").val() <= 0){
		showMessage("error", finalErrMsgFLv);
		toogleElement('error','block');
		return false;
	}
	
	insertIntoTruckHisabSettlement();
	return true;
}
