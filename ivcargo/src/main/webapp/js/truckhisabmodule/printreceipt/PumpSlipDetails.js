/**
 * Created By : shailesh Khanadare 
 **/
/**
 * Load necessary function for print receipt 
 * */
var data = null;
var tableContains = new Array();
var odometer	= 0;
var openingKM   = 0;
var totalKilometerCalByGPS = 0;
var k	= 0;

function loadPumpRecept(){
	//include pumpAutoComplete
	//setPump(data,'petrolPumpName')
	getPetrolPump();
	setAutoCompleters();
} 

function setAutoCompleters() {
	$("#DDMBranch").autocomplete({
		source : "DestinationBranchAutoCompleteForDDMAjaxAction.do?pageId=9&eventId=27",
		minLength : 2,
		delay : 10,
		autoFocus : true,
		select : function(event, ui) {
			if (ui.item.id != 0) {
				getDestination(ui.item.id);
			}
		},
		response : function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function getDestination(branchId_CityId) {
	var branchId 	= parseInt(branchId_CityId.substr(0, branchId_CityId.indexOf('_')));
	var cityId 		= parseInt(branchId_CityId.substr(branchId_CityId.lastIndexOf('_') + 1, branchId_CityId.length));
	
	$('#BranchId').val(branchId);
	$('#CityId').val(cityId);
}

/**
 *Hide show function for pump receipt  
 **/
function displayPumpDetails(){
	if($("#pumpReceiptType").val() == 0 ){
		$("#ddmHideShow").hide()
		$("#lhpvHideShow").hide();
	}
	if($("#pumpReceiptType").val() == 1 ){
		$("#lhpvHideShow").show();
		$("#ddmHideShow").hide();
	}
	if($("#pumpReceiptType").val() == 2){
		$("#ddmHideShow").show()
		$("#lhpvHideShow").hide();
	}
}

function hideShowDiv(ele){
	
	$('#'+ele).show();
	$('#tripDetails').show();
	
}

$(function() {
	$("#findButton" ).click(function() {
		resetLastPumpReceiptData();
		clearData();
		if(!validateTruckOwnNumber(1, 'truckOwnNumber', 'truckOwnNumber')) {
			return false;
		}
		
		if(!validateTruckNumber(1, 'VehicleId', 'truckOwnNumber')) {
			return false;
		}
		$('#truckDriverdetails').hide();
		$('#tripDetails').hide();
		
		if(showAllVehicleData){
			hideShowDiv('truckDriverdetails');
		} else {
			getLastPumpReceiptDetails($("#VehicleId").val());
		}
	});
});

function getLastPumpReceiptDetails(VehicleId) {
	var jsonObject 			= new Object();

	jsonObject.VEHICLEID	= VehicleId;
	jsonObject.Filter		= 8;
	
	var jsonStr				= JSON.stringify(jsonObject);
	
	$.getJSON("PrintReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					//showMessage('error', "Hisab Voucher Not Found On Truck!");
				//	$("#driverAllowanceAmount").val(0);
					//getCurrentDate();
				}else{
					
					var pumpReceipt =  data.pumpReceipt;
					//$("#lastPumpReceiptNumber").html(pumpReceipt.pumpReceiptNumber);
					//$("#lastPumpReceiptNumber").text(pumpReceipt.pumpReceiptNumber);
					$("#dieselOpeningBalance").html(pumpReceipt.fuelToFillUp);
					console.log("pumpReceipt --> ", pumpReceipt)
					console.log("pumpReceipt.maxFuel --> ", pumpReceipt.maxFuel)
					console.log("pumpReceipt.fuelToFillUp --> ", pumpReceipt.fuelToFillUp)
					console.log("pumpReceipt.isRouteTypeLocal --> ", pumpReceipt.routeTypeLocal)
					if(pumpReceipt.routeTypeLocal && Number(pumpReceipt.pendingPumpReceiptfuel) >= Number(pumpReceipt.maxFuel)){
						showMessage('error', "Please Create Fuel Hisab Voucher.");
						return false;
					}
					hideShowDiv('truckDriverdetails');
					//$("#dieselOpeningBalance").text(pumpReceipt.fuelToFillUp);
					//$("#truckHisabVocherNumber").val(TruckCol.truckHisabNumber);
					//$("#lastPumpReceiptNumberHeading").show();
					//$("#lastPumpReceiptNumber").show();
					$("#dieselOpeningBalanceHeading").show();
					$("#dieselOpeningBalance").show();
					$("#lastPumpReceiptDetailTD").show();
					//$("#truckHisabVocherId").val(TruckCol.truckHisabVoucherId);
					//getLastDateTransaction(VehicleId);
					//getvehicleTypeByVehicleID(VehicleId);
					//display();
					//getLhpvDetailsByVehicleId(TruckCol.lhpvId);
					if(pumpReceipt.average != null) {
						var average = pumpReceipt.average;
						$("#averageLiter").val(average.toString().split(".")[0]);
						$("#averageLiterDecimal").val(average.toString().split(".")[1]);
					} else {
						$("#averageLiter").val(0);
					}
					getLastLHPVDataOnVehicle(VehicleId);
					
					if(pumpReceipt.gpsConfigured == true || pumpReceipt.gpsConfigured == 'true') {
						
						if(pumpReceipt.currentKilometer != null) {
							
							var openingKilometer	= pumpReceipt.currentKilometer;
							$('#openingKilometerTD').show();
							$('#openingKilometer').html(openingKilometer);
						} 
						
						$('#kilometerDetails').show();
						calcTotalKmsFromGpsApi(openingKilometer, pumpReceipt);
						/*if(pumpReceipt.average != null) {
							var average = pumpReceipt.average;
							$("#averageLiter").val(average.toString().split(".")[0]);
							$("#averageLiterDecimal").val(average.toString().split(".")[1]);
							calcultaeDiesel();
						}*/
					} else {
						$('#openingKilometerTD').hide();
						$('#kilometerDetails').hide();
						openingKM = 0;
						odometer  = 0;
						totalKilometerCalByGPS = 0;
						
					}
				}
			})		
}

function getLastLHPVDataOnVehicle(VehicleId){
	
	var jsonObject 			= new Object();
	var jsonOutObject		= new Object();
	jsonObject.VehicleId	= $("#VehicleId").val();
	jsonObject.Filter		= 9;
	jsonOutObject 			= jsonObject;
	
	var jsonStr		= JSON.stringify(jsonOutObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					// showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					clearData();
					// hideLayer();
				} else{
					var lhpvDto			= data.lhpvDto;
					var distance		= data.distance;
					
					$("#LHPVNumberForPrintReceipt").val(lhpvDto.lhpvNum);
					$("#LhpvFromForPrintReceipt").val(lhpvDto.branch);
					$("#LHPVIdForPrintReceipt").val(lhpvDto.lhpvId);
					$("#LhpvFromForPrintReceiptId").val(lhpvDto.branchId);
					$("#LhpvToPrintReceiptId").val(lhpvDto.destinationBranchId);
					$("#LhpvToPrintReceipt").val(lhpvDto.destinationBranch);
					$("#LHPVDistanceInKm").val(distance);
				}
			})			
}

/**
 *Get Lhpv data by lhpv number 
 **/
function getLhpvIdForPumpReceiptByLhpvNumber() {
	
	if(!validateLHPVNumber(1, 'LHPVNumberForPrintReceipt', 'LHPVNumberForPrintReceipt')) {
		return false;
	}
	
	var jsonObject 		= new Object();

	var lhpvNumberString 	= $("#LHPVNumberForPrintReceipt").val();
	jsonObject.LhpvNumber	= lhpvNumberString.trim(); 
	jsonObject.VehicleId	=  $("#VehicleId").val();
	jsonObject.Filter		= 1;
	
	var jsonStr		= JSON.stringify(jsonObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					clearData();
					hideLayer();
				} else{
					var lhpvDto				= data.lhpvDto;
					var distance			= data.distance;
					var manualLHPVNumber	= data.manualLHPVNumber;
					
					$("#LhpvFromForPrintReceipt").val(lhpvDto.branch);
					$("#LHPVIdForPrintReceipt").val(lhpvDto.lhpvId);
					$("#LhpvFromForPrintReceiptId").val(lhpvDto.branchId);
					$("#LhpvToPrintReceiptId").val(lhpvDto.destinationBranchId);
					$("#LhpvToPrintReceipt").val(lhpvDto.destinationBranch);
					if(!manualLHPVNumber)
						$("#LHPVDistanceInKm").val(distance);
				}
			})			
}

/**
 *Get DDM data by DDM number Details
 **/
function getDDMDetailsByDDMNumber() {
	if(!validateDDMNumber(1, 'DDMNumberForPumpReceipt', 'DDMNumberForPumpReceipt')) {
		return false;
	}
	
	if(!validateDDMBranch(1, 'BranchId', 'DDMBranch')) {
		return false;
	}
	
	var jsonObject 		= new Object();

	var ddmNumberString 	= $("#DDMNumberForPumpReceipt").val();
	jsonObject.DDMNumber 	= ddmNumberString.trim(); 
	jsonObject.DDMBRANCHID 	= $("#BranchId").val(); 
	jsonObject.VehicleId	= $("#VehicleId").val(); 
	jsonObject.Filter		= 2;
	
	var jsonStr		= JSON.stringify(jsonObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "No records found!"); // show message to show system processing error massage on top of the window.
					clearData();
					hideLayer();
				} else{
					var deliveryRunSheetLedgerDto	= data.deliveryRunSheetLedgerDto;
					var distance					= data.distance;
					var manualDDMNumber				= data.manualDDMNumber;
					
					$("#DDMFromForPumpReceipt").val(deliveryRunSheetLedgerDto.sourceBranch);
					$("#DDMToForPumpReceipt").val(deliveryRunSheetLedgerDto.destinationBranch);
					$("#DDMIdForPumpReceipt").val(deliveryRunSheetLedgerDto.deliveryRunSheetLedgerId);
					if(!manualDDMNumber)
						$("#DDMDistance").val(distance);
					$("#DDMFromForPumpReceiptId").val(deliveryRunSheetLedgerDto.sourceBranchId);
					$("#DDMToForPumpReceiptId").val(deliveryRunSheetLedgerDto.destinationBranchId);
				}
			})			
}

/**
 * 
 * */

/**
 *Get LR data by LR number Details
 **/
function getLRDetailsByLRNumber(){
	
	var jsonObject 		= new Object();

	var ddmNumberString 	= $("#CollectionLrNumber").val();
	jsonObject.LRNumber 	= ddmNumberString.trim(); 
	jsonObject.Filter		= 4;
	
	var jsonStr		= JSON.stringify(jsonObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					clearData();
					hideLayer();
				} else{
					var wayBillDto		= data.wayBillDto;
					var distance		= data.distance;
					var manualLRNumber	= data.manualLRNumber;
					
					$("#CollectionInFromBranch").val(wayBillDto.sourceBranch);
					$("#CollectionLrId").val(wayBillDto.wayBillId);
					$("#CollectionInToBranch").val(wayBillDto.destinationBranch);
					if(!manualLRNumber)
						$("#CollectionInKM").val(distance);
					$("#CollectionInFromBranchId").val(wayBillDto.sourceBranchId);
					$("#CollectionInToBranchId").val(wayBillDto.destinationBranchId);
				}
			})			
}

function getInterBranchLSIdForPumpReceiptByInterBranchLSNumber(){
	if(!validateInterBranchLSNumber(1, 'InterBranchLSForPrintReceipt', 'InterBranchLSForPrintReceipt')) {
		return false;
	}
	
	var jsonObject 		= new Object();

	var intBrLSNumberString 	= $("#InterBranchLSForPrintReceipt").val();
	jsonObject.InterBranchLSNo	= intBrLSNumberString.trim(); 
	jsonObject.VehicleId		= $("#VehicleId").val();
	jsonObject.Filter			= 10;
	
	var jsonStr		= JSON.stringify(jsonObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					clearData();
					hideLayer();
				} else{
					var dispatchLedgerDto		= data.dispatchLedgerDto;
					var distance				= data.distance;
					var manualIntBranchLSNumber	= data.manualIntBranchLSNumber;
					
					$("#InterBranchLSFromForPrintReceipt").val(dispatchLedgerDto.sourceBranch);
					$("#InterBranchLSIdForPrintReceipt").val(dispatchLedgerDto.dispatchLedgerId);
					$("#InterBranchLSFromForPrintReceiptId").val(dispatchLedgerDto.sourceBranchId);
					$("#InterBranchLSToPrintReceiptId").val(dispatchLedgerDto.destinationBranchId);
					$("#InterBranchLSToPrintReceipt").val(dispatchLedgerDto.destinationBranch);
					if(!manualIntBranchLSNumber)
						$("#InterBranchLSDistanceInKm").val(distance);
				}
			})
}

/**
 * Add to table to display DDM LHPV and collection and Local Details.
 * Methods add all of above distrance additon.
 */
var totalKilometer = 0;
var i = 0;
function addPumpSlipTable(num,from,to,TypeString,km,fromId,toId,PumpReciptTypeIdentiidentifier,Id,remark){
	
	var ids	=  $("#"+Id).val();
	
	var found = $.inArray(ids, tableContains) > -1;
	if(!found){
	if(ids > 0){
		tableContains.push(ids);
	}
	$("#totalDistanceCountDiv").show();
	$("#distanceSummaryFoot").remove();
	var srNo 			= (i + 1);
	var type 			= TypeString;
	var number 			= $("#"+num).val();
	var numId 			= $("#"+Id).val();
	//var currentDate 	= new Date();
	//var today 		= new Date();
	var Date 			= getCurrentDate();
	var from 			= $("#"+from).val();
	var to 				= $("#"+to).val();
	var fromIdVal 		= $("#"+fromId).val();
	var toIdVal 		= $("#"+toId).val();
	var kilometer 		= $("#"+km).val();
	var remark 			= $("#"+remark).val();
	var distanceTypeId 	= $("#"+PumpReciptTypeIdentiidentifier).val();
	if(totalKilometerCalByGPS > 0){
		totalKilometer		= totalKilometerCalByGPS;
	} else {
		totalKilometer		= Number(kilometer) + Number(totalKilometer)
	}
	calcultaeDiesel();
	var row 			= createRow('distanceSummary_'+i, '');
	
	var srNoCol 					= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var typeCol 					= createColumn(row,'type_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var numberCol 					= createColumn(row,'number_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var dateCol 					= createColumn(row,'date_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromCol 					= createColumn(row,'from_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toCol 						= createColumn(row,'to_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var kilometerCol 				= createColumn(row,'kilometer_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkCol 					= createColumn(row,'remark_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoCol).append(srNo);
	$(srNoCol).append('<input type ="hidden" id="distanceType_'+(i+1)+'" value= '+distanceTypeId+' />');
	$(typeCol).append(type);
	$(numberCol).append(number);
	$(srNoCol).append('<input type ="hidden" id="NumberId_'+(i+1)+'" value= '+numId+' />');
	$(dateCol).append(Date);
	$(fromCol).append(from);
	$(srNoCol).append('<input type ="hidden" id="fromId_'+(i+1)+'" value= '+fromIdVal+' />');
	$(toCol).append(to);
	$(srNoCol).append('<input type ="hidden" id="toId_'+(i+1)+'" value= '+toIdVal+' />');
	$(kilometerCol).append(kilometer);
	$(remarkCol).append(remark);
	
	$("#totalDistanceCountTableBody").append(row);
	
	var rowFoot 						= createRow('distanceSummaryFoot', '');
	var srNoColFoot 					= createColumn(rowFoot,'srNoColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var typeColFoot 					= createColumn(rowFoot,'typeColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var numberColFoot 					= createColumn(rowFoot,'numberColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var dateColFoot 					= createColumn(rowFoot,'dateColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromColFoot 					= createColumn(rowFoot,'fromColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toColFoot 						= createColumn(rowFoot,'toColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var kilometerColFoot 				= createColumn(rowFoot,'kilometerColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkColFoot 					= createColumn(rowFoot,'remarkColFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoColFoot).append("");
	$(typeColFoot).append("");
	$(numberColFoot).append("");
	$(dateColFoot).append("");
	$(fromColFoot).append("");
	$(toColFoot).append("Total : ");
	$(kilometerColFoot).append(totalKilometer);
	$("#totalDistanceCountTableFoot").append(rowFoot);
	$("#totalKm").val(totalKilometer);
	$(remarkColFoot).append("");
	
	clearData();
	i=i+1;
	$('#tripDetails1').show();
	$('#tripDetails2').show();
	$('#tripDetails3').show();
	}else{
		showMessage('info', "Number "+$("#"+num).val()+" is already present in table!"); 
	}

}
/*clear date of selection feild*/
function clearData(){
	
	$("#LHPVNumberForPrintReceipt").val("");
	$("#LhpvFromForPrintReceipt").val("");
	$("#LhpvToPrintReceipt").val("");
	$("#PrintReceiptLHPVRemark").val("");
	$("#LHPVDistanceInKm").val("");
	$("#DDMNumberForPumpReceipt").val("");
	$("#DDMBranch").val("");
	$("#DDMFromForPumpReceipt").val("");
	$("#DDMToForPumpReceipt").val("");
	$("#DDMDistance").val(0);
	$("#DeiselDDMRemark").val("");
	$("#CollectionLrNumber").val("");
	$("#CollectionInFromBranch").val("");
	$("#CollectionInToBranch").val("");
	$("#CollectionInKM").val(0);
	$("#DeiselCollectionRemark").val("");
	$("#fromLocal").val("");
	$("#toLocal").val("");
	$("#localDistance").val("");
	$("#DeiselLHPVRemark").val("");
	$("#DeiselLocalRemark").val("");
	$("#InterBranchLSForPrintReceipt").val("");
	$("#InterBranchLSFromForPrintReceipt").val("");
	$("#InterBranchLSFromForPrintReceiptId").val("");
	$("#InterBranchLSToPrintReceipt").val("");
	$("#InterBranchLSDistanceInKm").val("");
	$("#PrintReceiptInterBranchLSRemark").val("");
}

/*calculate Diesel*/
function calcultaeDiesel(){
	var vehicleAvg         = $("#averageLiter").val();
	var vehicleDecimalAvg  = $("#averageLiterDecimal").val();
	var stringWithDot	   = "."+vehicleDecimalAvg 	
	var fnalAvg			   = vehicleAvg.concat(stringWithDot);	
	var totalKm	   		   = Number($("#totalKm").val());
	var totalKmDecimal	   = Number($("#averageLiterDecimal").val());
	var totalDiesel		   = 0;
	if(fnalAvg > 0 && totalKm > 0){
		totalDiesel		   = Number(totalKm) /Number(fnalAvg);
	}
	$("#totalDiesel").val(Math.round(totalDiesel));
		$("#TotalFuelInLiter").val(Math.round(totalDiesel.toFixed(2)));
	//$("#TotalFuelInLiterHidden").val(totalDiesel);
	} 
	
/*function regexForTwoDecimal(){
	 \d{0,2}(\.\d{1,2})?
}*/
function regexForTwoDecimal(amt){
	return amt.match(/^\d*(.\d{0,2})?$/);
}

/*validation for lhpv block**/
function validateLhpv(){
	//alert('lhpvCount '+lhpvCount);
	if(lhpvCount > 0){
		showMessage("error", "You can add only one LHPV per receipt ! ");
		toogleElement('error','block');
		return false;
	}
	if($("#LHPVNumberForPrintReceipt").val() < 0 ||  $("#LHPVNumberForPrintReceipt").val() ==  "" ){
		showMessage("error", "LHPV Number is not valid!");
		toogleElement('error','block');
		changeError('LHPVNumberForPrintReceipt','0','0');
		return false;
	}
	if($("#LhpvFromForPrintReceipt").val() < 0 ||  $("#LhpvFromForPrintReceipt").val() ==  "" ){
		showMessage("error", "Source Branch is not valid!");
		toogleElement('error','block');
		changeError('LHPVNumberForPrintReceipt','0','0');
		return false;
	}
	if($("#LhpvToPrintReceipt").val() < 0 ||  $("#LhpvToPrintReceipt").val() ==  "" ){
		showMessage("error", "Destination Branch is not valid!");
		toogleElement('error','block');
		changeError('LhpvToPrintReceipt','0','0');
		return false;
	}
	if($("#LHPVDistanceInKm").val() <= 0 ||  $("#LHPVDistanceInKm").val() ==  "" ){
		showMessage("error", "Distance can not be blank or Less than zero!");
		toogleElement('error','block');
		changeError('LHPVDistanceInKm','0','0');
		return false;
	}
	addPumpSlipTable('LHPVNumberForPrintReceipt','LhpvFromForPrintReceipt','LhpvToPrintReceipt','LHPV','LHPVDistanceInKm','LhpvFromForPrintReceiptId','LhpvToPrintReceiptId','PumpReciptDistanceLhpvTypeId','LHPVIdForPrintReceipt','PrintReceiptLHPVRemark');
	lhpvCount++;
}


/*validation for lhpv block**/
function validateDDM(){
	if($("#DDMNumberForPumpReceipt").val() < 0 ||  $("#DDMNumberForPumpReceipt").val() ==  "" ){
		showMessage("error", "DDM Number is not valid!");
		toogleElement('error','block');
		changeError('DDMNumberForPumpReceipt','0','0');
		return false;
	}
	if($("#DDMBranch").val() < 0 ||  $("#DDMBranch").val() ==  "" ){
		showMessage("error", "Branch Is not proper!");
		toogleElement('error','block');
		changeError('DDMBranch','0','0');
		return false;
	}
	if($("#BranchId").val() < 0 ||  $("#BranchId").val() ==  "" ){
		showMessage("error", "Branch Is not proper!");
		toogleElement('error','block');
		changeError('DDMBranch','0','0');
		return false;
	}
	if($("#DDMFromForPumpReceipt").val() < 0 ||  $("#DDMFromForPumpReceipt").val() ==  "" ){
		showMessage("error", "Source Is not proper!");
		toogleElement('error','block');
		changeError('DDMFromForPumpReceipt','0','0');
		return false;
	}
	if($("#DDMToForPumpReceipt").val() < 0 ||  $("#DDMToForPumpReceipt").val() ==  "" ){
		showMessage("error", "Destination Is not proper!");
		toogleElement('error','block');
		changeError('DDMToForPumpReceipt','0','0');
		return false;
	}
	if($("#DDMDistance").val() <= 0 ||  $("#DDMDistance").val() ==  "" ){
		showMessage("error", "Enter kilometer !");
		toogleElement('error','block');
		changeError('DDMDistance','0','0');
		return false;
	}
	
	addPumpSlipTable('DDMNumberForPumpReceipt','DDMFromForPumpReceipt','DDMToForPumpReceipt','DDM','DDMDistance','DDMFromForPumpReceiptId','DDMToForPumpReceiptId','PumpReciptDistanceDDMTypeId','DDMIdForPumpReceipt','DeiselDDMRemark');
	ddmCount++;
}


/*validation for Collection block**/
function validateCollection(){
	if($("#CollectionLrNumber").val() < 0 ||  $("#CollectionLrNumber").val() ==  "" ){
		showMessage("error", "LR Number is not valid!");
		toogleElement('error','block');
		changeError('CollectionLrNumber','0','0');
		return false;
	}
	if($("#CollectionInFromBranch").val() < 0 ||  $("#CollectionInFromBranch").val() ==  "" ){
		showMessage("error", "Branch Is not proper!");
		toogleElement('error','block');
		changeError('CollectionInBranch','0','0');
		return false;
	}
	if($("#CollectionInToBranch").val() < 0 ||  $("#CollectionInToBranch").val() ==  "" ){
		showMessage("error", "Enter Proper Entry!");
		toogleElement('error','block');
		changeError('CollectionInToBranch','0','0');
		return false;
	}
	
	if($("#CollectionInKM").val() <= 0 ||  $("#CollectionInKM").val() ==  "" ){
		showMessage("error", "Enter kilometer !");
		toogleElement('error','block');
		changeError('DDMDistance','0','0');
		return false;
	}
	
	addPumpSlipTable('CollectionLrNumber','CollectionInFromBranch','CollectionInToBranch','Collection','CollectionInKM','CollectionInFromBranchId','CollectionInToBranchId','PumpReciptDistanceCollectionTypeId','CollectionLrId','DeiselCollectionRemark');
}


/*validation Local*/
function validateLocal(){
	if($("#fromLocal").val() < 0 ||  $("#fromLocal").val() ==  "" ){
		showMessage("error", "Please,Enter valid source branch!");
		toogleElement('error','block');
		changeError('fromLocal','0','0');
		return false;
	}
	if($("#toLocal").val() < 0 ||  $("#toLocal").val() ==  "" ){
		showMessage("error", "Please,Enter valid Destination branch!");
		toogleElement('error','block');
		changeError('toLocal','0','0');
		return false;
	}
	if($("#localDistance").val() <= 0 ||  $("#localDistance").val() ==  "" ){
		showMessage("error", "Distance is proper!");
		toogleElement('error','block');
		changeError('localDistance','0','0');
		return false;
	}
	
	addPumpSlipTable('-','fromLocal','toLocal','Local','localDistance','0','0','PumpReciptDistanceLocalTypeId','0','DeiselLocalRemark');
}
function validateInterBranchLS(){
	if($("#InterBranchLSForPrintReceipt").val() < 0 ||  $("#InterBranchLSForPrintReceipt").val() ==  "" ){
		showMessage("error", "Inter Branch LS Number is not valid!");
		toogleElement('error','block');
		changeError('InterBranchLSForPrintReceipt','0','0');
		return false;
	}
	
	if($("#InterBranchLSDistanceInKm").val() <= 0 ||  $("#InterBranchLSDistanceInKm").val() ==  "" ){
		showMessage("error", "Distance can not be blank or Less than zero!");
		toogleElement('error','block');
		changeError('InterBranchLSDistanceInKm','0','0');
		return false;
	}
	
	addPumpSlipTable('InterBranchLSForPrintReceipt','InterBranchLSFromForPrintReceipt','InterBranchLSToPrintReceipt','Inter Branch LS','InterBranchLSDistanceInKm','InterBranchLSFromForPrintReceiptId','InterBranchLSToPrintReceiptId','PumpReciptDistanceInterBranchLSIdTypeId','InterBranchLSIdForPrintReceipt','PrintReceiptInterBranchLSRemark');
	intLSCount++;
}

function getCurrentDate(){
	var st = srvTime();
	var today = new Date(st);
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	dd	= Number(dd);
	var yyyy = today.getFullYear();
	    if(dd<10){
	        dd='0'+dd
	    } 
	    if(mm<10){
	        mm='0'+mm
	    } 
	    today = dd+'-'+mm+'-'+yyyy;
	 return today 
	    
	 var xmlHttp;
	 function srvTime(){
	 try {
	     //FF, Opera, Safari, Chrome
	     xmlHttp = new XMLHttpRequest();
	 }
	 catch (err1) {
	     //IE
	     try {
	         xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
	     }
	     catch (err2) {
	         try {
	             xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
	         }
	         catch (eerr3) {
	             //AJAX not supported, use CPU time.
	             alert("AJAX not supported");
	         }
	     }
	 }
	 xmlHttp.open('HEAD',window.location.href.toString(),false);
	 xmlHttp.setRequestHeader("Content-Type", "text/html");
	 xmlHttp.send('');
	 return xmlHttp.getResponseHeader("Date");
	 }
}

/**
 *Add to pump recipt trable  
 **/
var l = 0;
var fuelTofillUp = 0;
function addPumpReceiptTable(){
	
	if(!validatePumpReceiptTable()){
		return false;
	}
	
	var srNo 			= (l + 1);
	
	var pumpName		= $("#petrolPumpName").val();
	var pumpNameId		= $("#petrolPumpNameId").val();
	
	var fuelInliter		= $("#FuelInLiter").val();
	var fuelUnitRate	= $("#fuelUnitRate").val();
	var fuelTotalRate	= $("#fuelTotalRate").val();
	var fuelRemak		= $("#fuelRemark").val();
	fuelTofillUp 		= Number(fuelInliter) + Number(fuelTofillUp);  
	var row 			= createRow('pumpReceipt_'+l, '');
	
	var srNoCol 					= createColumn(row,'srNo_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var pumpNameCol  				= createColumn(row,'pumpName_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fuelInliterCol 				= createColumn(row,'fuelInliter_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fuelUnitRateCol 			= createColumn(row,'fuelUnitRate_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fuelTotalRateCol 			= createColumn(row,'fuelTotalRate_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fuelRemakCol 				= createColumn(row,'fuelRemak_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoCol).append(srNo);
	$(pumpNameCol).append(pumpName);
	$(srNoCol).append('<input type ="hidden" id="pumpNamId_'+(l+1)+'" value= '+pumpNameId+' />');
	$(fuelInliterCol).append(fuelInliter);
	$(fuelUnitRateCol).append(fuelUnitRate);
	$(fuelTotalRateCol).append(fuelTotalRate);
	$(fuelRemakCol).append(fuelRemak);
	
	$("#pumpReceiptTableBody").append(row);
	$("#TotalFuelInLiterHidden").val($("#TotalFuelInLiter").val());
	l=l+1;
	$("#pumpReceiptTable").show();
	clearFeilds();
}

/**Clear feilds*/
function clearFeilds(){
	$("#petrolPumpName").val("");   
	$("#petrolPumpNameId").val(""); 
	$("#FuelInLiter").val(0);      
	$("#fuelUnitRate").val(0);     
	$("#fuelTotalRate").val(0);    
	$("#fuelRemark").val("");       
}

function hasDecimalPlace(value, x) {
    var pointIndex = value.indexOf('.');
    return  pointIndex >= 0 && pointIndex < value.length - x;
}


function validatePumpReceiptTable(){
	
	if($("#petrolPumpName").val() == "" ||  $("#petrolPumpName").val() <= 0){
		showMessage("error", "Pump name is not valid!");
		toogleElement('error','block');
		changeError('petrolPumpName','0','0');
		return false;
	}
	if($("#petrolPumpNameId").val() == "" ||  $("#petrolPumpNameId").val() <= 0){
		showMessage("error", "Pump name is not valid!");
		toogleElement('error','block');
		changeError('petrolPumpName','0','0');
		return false;
	}

	
	if($("#FuelInLiter").val() == "" ||  $("#FuelInLiter").val() <= 0){
		showMessage("error", "Enter the fuel to fillup!");
		toogleElement('error','block');
		changeError('FuelInLiter','0','0');
		return false;
	}
	if( Number($("#FuelInLiter").val()) > Number($("#totalDiesel").val()) ){
		showMessage("error", "You can not enter fuel more than "+$("#totalDiesel").val()+" Liters");
		toogleElement('error','block');
		changeError('FuelInLiter','0','0');
		return false;
	}
	
	var totDiesel = Number(fuelTofillUp) + Number( $("#FuelInLiter").val());
	
	if(Number(totDiesel) > $("#totalDiesel").val() ){
		showMessage("error", "You can not fill fuel more than "+$("#totalDiesel").val()+" Liters!");
		toogleElement('error','block');
		changeError('FuelInLiter','0','0');
		return false;
	}
	
	if(validateFuelUnitRate){
		if($("#fuelUnitRate").val() == "" ||  $("#fuelUnitRate").val() <= 0){
			showMessage("error", "Enter the fuel to Unit rate!");
			toogleElement('error','block');
			changeError('fuelUnitRate','0','0');
			return false;
		}
	}
	if($("#fuelTotalRate").val() == "" ||  $("#fuelTotalRate").val() <= 0){
		showMessage("error", "Enter the fuel total rate!");
		toogleElement('error','block');
		changeError('fuelTotalRate','0','0');
		return false;
	}
	
	if($("#openingKM").val() == "" ||  $("#openingKM").val() <= 0){
		showMessage("error", "Enter Opening KM!");
		toogleElement('error','block');
		changeError('openingKM','0','0');
		return false;
	}
	
	if(validateClosingKM && ($("#closingKM").val() == "" ||  $("#closingKM").val() <= 0)){
		showMessage("error", "Enter Closing KM!");
		toogleElement('error','block');
		changeError('closingKM','0','0');
		return false;
	}
	
	return true;
	
}

/***/

function calculateRemainingFuelInLiter(){
	var tableRowCount	=  $("#pumpReceiptTable tr").length;	
	
	if(tableRowCount == 1){
	 var remainDisel =  Number($("#totalDiesel").val())  -  Number($("#FuelInLiter").val());
	}
	if(tableRowCount >= 2){
		var remainDisel =  Number($("#TotalFuelInLiterHidden").val())  -  Number($("#FuelInLiter").val())  ;
		}

		if(showFuelUnitRateInDecimal){
			$("#TotalFuelInLiter").val(remainDisel.toFixed(2));
		}else{
			$("#TotalFuelInLiter").val(remainDisel);
		}		
	calculateTotalFuelRate();
}

function calculateTotalFuelRate(){
	if(!autoCalculateFuelInLiter){
	var totalFuelRate =  Number($("#fuelUnitRate").val())  *  Number($("#FuelInLiter").val())  ;
	$("#fuelTotalRate").val(Math.round(totalFuelRate));
}
}

function calculateFuelInLiter(){
	var fuelInLiter =  0;
	
	if(Number($("#fuelUnitRate").val()) > 0) {
		fuelInLiter =  Number($("#fuelTotalRate").val())  /  Number($("#fuelUnitRate").val());
	}
	if(showFuelUnitRateInDecimal){
	$("#FuelInLiter").val(fuelInLiter.toFixed(2));
	}else{
		$("#FuelInLiter").val(Math.round(fuelInLiter));
	}
}
function isNumberKey(evt)
{
   var charCode = (evt.which) ? evt.which : evt.keyCode;
   if (charCode != 46 && charCode > 31 
     && (charCode < 48 || charCode > 57))
      return false;

   return true;
}
function isNumberKey(evt, element) {
	//var charCode = (evt.which) ? evt.which : event.keyCode
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	  if (charCode > 31 && (charCode < 48 || charCode > 57) && !(charCode == 46 || charcode == 8))
	    return false;
	  else {
	    var len = $(element).val().length;
	    var index = $(element).val().indexOf('.');
	    if (index > 0 && charCode == 46) {
	      return false;
	    }
	    if (index > 0) {
	      var CharAfterdot = (len + 1) - index;
	      if (CharAfterdot > 3) {
	        return false;
	      }
	    }

	  }
	  return true;
	}

function getPumpFuelRate(pumpRateId){
	if(!manualFuelUnitRate)
		$("#fuelUnitRate").val(pumpObjectGobal[pumpRateId]);
	
	calculateTotalFuelRate();
}


function calcTotalKmsFromGpsApi(openingKilometer, pumpReceipt) {
	 
	var truckOwnNumber = $('#truckOwnNumber').val();
	//alert('inside');
	$.ajax({
			type		: 'POST',
			dataType	: 'json',
			url		: 'http://track.panachetelematics.com/webservice?token=getLiveData&user=laljimulji&pass=india&vehicle_no='+truckOwnNumber,
			success		: function(data){
			var root               = data.root;
			var vehicleData        = Object.values(root);
			var vehicleDetails     = Object.values(vehicleData[0]);
			var vehicleDetails1    = vehicleDetails[0];
            
			openingKM = openingKilometer;
            if(typeof vehicleDetails1 != 'undefined' && vehicleDetails1 != null) {
           
                odometer    = vehicleDetails1.Odometer;
                $('#odometerReadingTd').show();
                $('#odometerReading').html(parseInt(odometer));
                //alert('openingKilometer '+openingKilometer);
                if(openingKilometer > 0) {
                	//alert('odometer '+odometer);
                    var totalKilometer    = odometer - openingKilometer;
                	//alert('totalKilometer '+totalKilometer);
                    if(totalKilometer > 0){
                    	$('#totalKm').val(parseInt(totalKilometer));
                    	totalKilometerCalByGPS = parseInt(totalKilometer);
                    	calcultaeDiesel();
                    } else {
                    	totalKilometer = 0;
                    }
                } else{
                    $('#totalKm').val(0);
                    totalKilometer = 0;
                }
                
                //getKilometerDetails(odometer);
                
            } else {
            	odometer = 0;
            	totalKilometer = 0;
                showMessage('error',"Data Not Found !");
                return;
            }
		}
   });
}

function getKilometerDetails(odometer) {
	
	var jsonObject			= new Object();
	
	jsonObject["odometer"]	= odometer;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/pumpReceiptWS/getTotalKilometersForPumpReceipt.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			
			if(data.message != undefined) {
				$('#totalKm').html(0);
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			var openingKilometer	= data.openingKilometer;
			
			if(openingKilometer != null && typeof openingKilometer != 'undefined') {
				
				if(openingKilometer > 0) {
					var totalKilometer	= openingKilometer - odometer;
					$('#totalKm').html(totalKilometer);
				} else{
					$('#totalKm').html(0);
				}
			}
		}	
	});
}