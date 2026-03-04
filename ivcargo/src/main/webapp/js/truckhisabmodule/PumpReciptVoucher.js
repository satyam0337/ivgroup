/**
 * author : SHailesh Khanadare
 * Description : Intert in to pump Recipt 
 * Date 	   : 06-08-2016
 **/

var lhpvDetailsArray		= new Array();
var ddmDetailsArray			= new Array();
var collectionDetailsArray	= new Array();
var locationDetailsArray	= new Array();
var intBranchLSDetailsArray	= new Array();
var pumpReciptInsertArray	= new Array();
var printJsonForPumpRecipt	= null;
var lhpvCount				= 0;
var ddmCount				= 0;
var intLSCount				= 0;
var doneTheStuff			= false;


/*TO create generate pump recipt**/
function generatePumpRecipt(id){
	
	lhpvDetailsArray		= new Array();         
	ddmDetailsArray			= new Array(); 
	collectionDetailsArray	= new Array();         
	locationDetailsArray	= new Array();         
	pumpReciptInsertArray	= new Array();     
	intBranchLSDetailsArray	= new Array();

	if(!validateFinalPumpRecipt()) {
		return false;
	}

	$( "#generatePump" ).prop( "disabled", true );
	var jsonObject 		= new Object();
	var jsonOutObject	= new Object();
	
	var truckHisabVoucherID			= $("#truckHisabVocherId").val();	
	
	jsonObject.PumpReciptVehicleId	= $("#VehicleId").val();
	jsonObject.PumpReciptDriverId	= $("#driverID").val();
	jsonObject.PumpReciptDriverName	= $("#driverNameAuto").val();
	var vehicleAvg			        = $("#averageLiter").val();
	var vehicleDecimalAvg  			= $("#averageLiterDecimal").val();
	var stringWithDot	   			= "."+vehicleDecimalAvg 	
	var fnalAvg			 			= vehicleAvg.concat(stringWithDot);
	jsonObject.VehicleAverage		= fnalAvg;
	jsonObject.TotalFuel			= $("#totalDiesel").val();
	jsonObject.TotalKilometer		= $("#totalKm").val();
	jsonObject.Odometer				= parseInt(odometer);
	jsonObject.OpeningKilometer		= parseInt(openingKM);
	jsonObject.OpeningKM			= $("#openingKM").val();
	jsonObject.ClosingKM			= $("#closingKM").val();
	
	var tableRowCount	= $("#totalDistanceCountTable tr").length;
	
	for(var i = 0; i < tableRowCount-2; i++) {
		var distType	= $("#distanceType_"+(i+1)).val();
		console.log('distType '+distType);
		if(distType == 1){
			var lhpvTypeModel = new Object();
			lhpvTypeModel.LHPVID		= $("#NumberId_"+(i+1)).val();
			lhpvTypeModel.LHPVNumber	= $("#number_"+(i+1)).html();
			lhpvTypeModel.KILOMETER		= $("#kilometer_"+(i+1)).html();
			lhpvTypeModel.REMARKS		= $("#remark_"+(i+1)).html();
			lhpvDetailsArray.push(lhpvTypeModel);
			//lhpvCount++;
		}
		//console.log('lhpvCount '+lhpvCount);
		
		if(distType == 2){
			var ddmTypeModel = new Object();
			ddmTypeModel.DDMID			= $("#NumberId_"+(i+1)).val();
			ddmTypeModel.DDMNumber		= $("#number_"+(i+1)).html();
			ddmTypeModel.KILOMETER		= $("#kilometer_"+(i+1)).html();
			ddmTypeModel.REMARKS		= $("#remark_"+(i+1)).html();
			ddmDetailsArray.push(ddmTypeModel);
		}
		if(distType == 3){
			var collectionTypeModel = new Object();
			collectionTypeModel.COLLECTIONID	= $("#NumberId_"+(i+1)).val();
			collectionTypeModel.KILOMETER		= $("#kilometer_"+(i+1)).html();
			collectionTypeModel.LRNumber		= $("#number_"+(i+1)).html();
			collectionTypeModel.REMARKS			= $("#remark_"+(i+1)).html();
			collectionDetailsArray.push(collectionTypeModel);
		}
		if(distType == 4){
			var locationTypeModel = new Object();
			locationTypeModel.FromLocation		= $("#from_"+(i+1)).html();
			locationTypeModel.ToLocation		= $("#to_"+(i+1)).html();
			locationTypeModel.KILOMETER			= $("#kilometer_"+(i+1)).html();
			locationTypeModel.REMARKS			= $("#remark_"+(i+1)).html();
			locationDetailsArray.push(locationTypeModel);
		}
		
		if(distType == 5){
			var interBranchLSTypeModel	= new Object();
			interBranchLSTypeModel.InterBranchLSID	= $("#NumberId_"+(i+1)).val();
			interBranchLSTypeModel.InterBranchLSNo	= $("#number_"+(i+1)).html();
			interBranchLSTypeModel.KILOMETER		= $("#kilometer_"+(i+1)).html();
			interBranchLSTypeModel.REMARKS			= $("#remark_"+(i+1)).html();
			intBranchLSDetailsArray.push(interBranchLSTypeModel);
		}
	}
	
	if(mandotaryLhpvForRouteAndBoth){
		if($('#routeTypeId').val() != 2){
			if(lhpvCount <= 0){
				showMessage("error", "Please add LHPV first !");
				toogleElement('error','block');
				changeError('LHPVNumberForPrintReceipt','0','0');
				enable(id);
				return false;
			}
		}
	}
	
	if(mandotaryDDMAndIntLSForLocal && $('#routeTypeId').val() == 2){
		if(intLSCount <= 0 && ddmCount <= 0){
			showMessage("error", "Please add DDM Or Inter Branch LS!");
			toogleElement('error','block');
			enable(id);
			return false;
		}
	}
	disable(id);
	$('#generatePumpReciptBtn').addClass("hide");
	
	var answer = confirm ("Are you sure you want to Generate Pump Receipt ?");
	if (!answer) {
		enable(id);
		$('#generatePumpReciptBtn').removeClass("hide");
		doneTheStuff = false;
		return false;
	}

	showLayer();
	jsonObject.LHPVDETAILSARRAY				= lhpvDetailsArray;
	jsonObject.DDMDETAILSARRAY				= ddmDetailsArray;
	jsonObject.COLLECTIONDETAILSARRAY		= collectionDetailsArray;
	jsonObject.LOCATIONDETAILSARRAY			= locationDetailsArray;
	jsonObject.INTBRANCHLSDETAILSARRAY		= intBranchLSDetailsArray;
	
	var printReceiptRowCount	= $("#pumpReceiptTable tr").length;
	for(var j = 0; j < printReceiptRowCount-1; j++) {
		var pumpReceiptModel = new Object();
		
		pumpReceiptModel.PumpName		   	= $("#pumpName_"+(j+1)).html();
		pumpReceiptModel.PumpNamesId		= $("#pumpNamId_"+(j+1)).val();
		pumpReceiptModel.FuelToFillUp   	= $("#fuelInliter_"+(j+1)).html();
		
		if($("#fuelUnitRate_"+(j+1)).html() != "")
			pumpReceiptModel.FuelUnitRate   	= $("#fuelUnitRate_"+(j+1)).html();
		else
			pumpReceiptModel.FuelUnitRate   	= 0;
		
		pumpReceiptModel.FuelTotalRate   	= $("#fuelTotalRate_"+(j+1)).html();
		pumpReceiptModel.Remark 		  	= $("#fuelRemak_"+(j+1)).html();
		pumpReciptInsertArray.push(pumpReceiptModel);	
	}
	jsonObject.PUMPRECIPTINSERTARRAY		= pumpReciptInsertArray;
	jsonObject.Filter						= 5;
	jsonOutObject							= jsonObject;	
	var jsonStr		= JSON.stringify(jsonOutObject);
	
	if(!doneTheStuff) {
		doneTheStuff = true;
		$.post("printReceiptAjaxAction.do?pageId=346&eventId=2", 
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', "Sorry an error occured!"); // show message to show system processing error massage on top of the window.
						hideLayer();
						enable(id);
						hideLayer();
						$( "#generatePump" ).prop( "disabled", false );
					} else{
						$( "#generatePump" ).prop( "disabled", false );
						showMessage('success', "Pump Receipt has been generated successfully !");
						resetdata();
						printJsonForPumpRecipt				= data.printForPumpRecipt;
						createPrintButton(printJsonForPumpRecipt);
						$("#truckOwnNumber").focus();
						enable(id);
						hideLayer();
						//printWindowPumpReceipt(printJsonForPumpRecipt);
					}
				})
	}
}

function resetLastPumpReceiptData(){
	 $("#lastPumpReceiptDetailTD").hide();
	 $("#lastPumpReceiptNumberHeading").hide();
	 $("#lastPumpReceiptNumber").hide();
	 $("#dieselOpeningBalanceHeading").hide();
	 $("#dieselOpeningBalance").hide();
	 $("#lastPumpReceiptNumber").hide();
	 $("#lastPumpReceiptNumber").html("");
	 $("#dieselOpeningBalance").html("");
	 lhpvCount 	= 0;
	 intLSCount	= 0;
	 ddmCount	= 0;
}

function resetdata(){
		 lhpvDetailsArray		= null; 
		 ddmDetailsArray		= null;
		 collectionDetailsArray	= null;
		 locationDetailsArray	= null;
		 pumpReciptInsertArray	= null;
	     tableContains			= null;
	     data 					= null;
		 tableContains 			= null; 
		 tableContains 			= new Array();
		 lhpvDetailsArray		= new Array();         
		 ddmDetailsArray		= new Array(); 
		 collectionDetailsArray	= new Array();         
		 locationDetailsArray	= new Array();         
		 pumpReciptInsertArray	= new Array();     
		 intBranchLSDetailsArray	= new Array();
		 
		 $("#totalDistanceCountTableBody").empty();
		 $("#totalDistanceCountTableFoot").empty();
		 $("#pumpReceiptTableBody").empty();
		 $("#pumpReceiptTable").hide();
		 $("#truckDriverdetails").hide();
		 $("#tripDetails").hide();
		 $("#tripDetails1").hide();
		 $("#tripDetails2").hide();
		 $("#tripDetails3").hide();
		 $("#truckOwnNumber").val("");
		 $("#driverNameAuto").val("");
		 $("#averageLiter").val(0);
		 $("#totalKm").val(0);
		 $("#totalDiesel").val(0);
		 $("#dirverDetails").hide();
		 $("#dirverDetails1").hide();
		 $("#openingKM").val(0)
		 $("#closingKM").val(0)
		 resetLastPumpReceiptData();
		 totalKilometer = 0;
		 i = 0;
		 l = 0;
		 fuelTofillUp = 0;
		 odometer	= 0;
		 openingKM  = 0;
		 totalKilometerCalByGPS = 0;
		 
		 
}

function validateFinalPumpRecipt(){
	if($("#driverNameAuto").val() == "" ||  $("#driverNameAuto").val() <= 0){
		showMessage("error", "Driver name is not valid!");
		toogleElement('error','block');
		changeError('driverNameAuto','0','0');
		return false;
	}
	
	if($("#averageLiter").val() == "" ){
		showMessage("error", "Driver name is not valid!");
		toogleElement('error','block');
		changeError('averageLiter','0','0');
		return false;
	}
	
	//if($('#routeTypeId').val() != 2){
	if(Number($("#TotalFuelInLiter").val()) > 0 ){
		showMessage("error", "Please provide total Fuel!");
		toogleElement('error','block');
		changeError('TotalFuelInLiter','0','0');
		return false;
	}
	//}
	
	if($("#driverID").val() == "" ||  $("#driverID").val() <= 0){
		showMessage("error", "Driver name is not valid!");
		toogleElement('error','block');
		changeError('driverNameAuto','0','0');
		return false;
	}

	var ss = 	$("#pumpReceiptTable tr").length;
	
	//if($('#routeTypeId').val() != 2){
	if(Number(ss)<=1 ){
		showMessage("error", "Please provide total Fuel!");
		toogleElement('error','block');
		changeError('petrolPumpName','0','0');
		return false;
	} 
	//}
	
	return true;
}


function createPrintButton(data){
	
	JsonDataForPrint					    = data;
var pumpReceiptArray				    	= data.pumpReceiptArr;
	JsonDataForPrint 						= data;
		
	var row = createRow('distanceSummaryFoot', '');
	for(var i = 0; i < pumpReceiptArray.length; i++) {
		var col_i = createColumn(row,'Print_'+(i+1), 'datatd', '', '', 'letter-spacing:2px;', '');
		$(col_i).append('<input type="button" value="Print '+(i+1)+'" onclick="printWindowPumpReceipt('+i+')";" style="width: 95px;" class="button pure-button pure-button-primary display form-control"/>');
	}
	$("#printSelectionTable").append(row);
}

function disable(id){
	var buttonObj = document.getElementById(id);
	if(buttonObj != null){
		buttonObj.className = 'btn_print_disabled';
		
		$("#generatePumpReciptBtn").prop("disabled", true);
		//buttonObj.style.display ='none';
	};
}

function enable(id){
	var buttonObj	= document.getElementById(id);
	
	if(buttonObj != null){
		buttonObj.className = 'button pure-button pure-button-primary';
		$("#generatePumpReciptBtn").removeAttr("disabled");
		buttonObj.style.display ='inline';
	};
}

