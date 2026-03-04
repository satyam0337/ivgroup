/**
 * load all neccesory data for deisel hisab
 **/

var driverDetails = new Object();
/*Load Hisab */
function loadDeiselHisab(routeTypeId){
	autoCompleteLoadOwnVehicle(routeTypeId);
	loadDataDriver();
}

function loadAllVehicleData(routeTypeId){
	autoCompleteLoadAllVehicleData(routeTypeId);
	loadDataDriver();
}
/*Display lhpv details*/
function displaylhpvdetails(){
	$("#dailyAllowanceDiv11").show();
} 
/**Load Driver details**/
function loadDataDriver() {
	showLayer();
	var jsonObject		= new Object();
	jsonObject.Filter	= 1;
	
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "you are Logged of Please login again!!"); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else{
					jsondata	= data;
					var drivDtls1 			= jsondata.driverMasterArr;
					for(var i = 0 ; i < drivDtls1.length ; i++){
						var driverDtlsData	= new Object();
						var driverDtlsModel = drivDtls1[i];
						driverDtlsData.Name	= driverDtlsModel.name;
						driverDtlsData.LicenceNumber	= driverDtlsModel.licenceNumber;
						driverDetails[driverDtlsModel.driverMasterId] = driverDtlsData; 
					}
					setDriver(data);
				}
				hideLayer();
			});
}

var driverarr  = new Array();
/*Set Driver Details*/
function setDriver(data) {
	var driverMasterArr = jsondata.driverMasterArr;

	for(var i = 0 ; i < driverMasterArr.length ; i++){
		var driverData	= new Object();
		var driverModel = driverMasterArr[i];
		driverData.id = driverModel.driverMasterId; 
		driverData.name = driverModel.displayName;
		driverarr.push(driverData);
	}

	$('#driverNameAuto').ajaxComboBox(
			driverarr,
			{
				lang: 'en',
				sub_info: false,
				sub_as: {
					name: 'name',
					post: 'Post',
					position: 'Position'
				},
				primary_key: 'id'
			}
	);

}

/*Display HideDetails*/
function displayDriverDetails(){
	$("#dirverDetails").show();
	$("#dirverDetails1").show();
	var driverId  =	 getDriverId('driverNameAuto');
	$("#driverID").val(driverId);
	var drv = new Object();
	var json 		= new Object();
	json	= driverDetails[driverId];

	if(json != undefined){
		$("#driverNameToDisplayId").text(json.Name);
		$("#licenceToDisplayId").text(json.LicenceNumber);
	}
}
/*getDirver details*/
function getDriverId(id) {
	if($('#' + id + '_primary_key').val() != ""){
		var  primaryId =   $('#' + id + '_primary_key').val();
		return primaryId; 
	}else{
		return null;
	}
}

/**
 * Get Pending pump receipt details for settlement 
 */ 
function getPendingPumpReceiptDetailsByVehicleId(){
	var jsonObject 				= new Object();
	var jsonOutObject			= new Object();

	var dieselVehicleId			= $("#VehicleId").val(); 

	jsonObject.DIESELVEHICLEID	= dieselVehicleId;
	jsonObject.Filter			= 1;

	jsonOutObject =  jsonObject;
	var jsonStr	  =JSON.stringify(jsonOutObject);
	$.getJSON("DieselHisabAjaxAction.do?pageId=345&eventId=2",
			{json:jsonStr}, function(data) {

			})			
}