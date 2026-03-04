var truckHisabSettlementForPrint 		= null;
var executiveForPrint 					= null;
var lhpvPrint		 					= null;
var driverAllowancePrint		 		= null;
var tollExpesnePrint		 			= null;
var dispatchLedgerPrint		 			= null;
var miscExoensePrint		 			= null;
var distabcePrint			 			= null;
var lsArray								= new Array();
var lsString							= "";
//var miscExpEenseArr						= null;

function printWindowTHV() {
	childwin = window.open('truckHisabVoucherPrint.do?pageId=347&eventId=1', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function printTruckWindowTHV() {
	 	ShowDialogForPrint();
		setPrintData(window.opener.printJsonForThv);
	//	window.setTimeout(printAfterDelay, 500);
}

function printAfterDelay(data) {
	window.print();
	window.close();
}


function changeDateFormat(dateFormatToChange){
	var splitvar		= dateFormatToChange.split("-");
	var year			= splitvar[0]; 
	var month			= splitvar[1]; 
	var day				= splitvar[2];
	return day + "-" + month;
}

function changeDateFormatFullDate(dateFormatToChange){
	var splitvar		= dateFormatToChange.split("-");
	var year			= splitvar[0]; 
	var month			= splitvar[1]; 
	var day				= splitvar[2];
	return day + "-" + month + "-" +year;
}


var tempmisc1				= "";
var temptoll1				= "";
var tempDriverExDetails1	= "";
function setPrintData(data) {
	truckHisabSettlementForPrint 		= data.truckHisabVoucherSettlement; 
	executiveForPrint				 	= data.executive;
	lhpvPrint						 	= data.lhpv;
	driverAllowancePrint				= data.driverAllowanceDetailsArr;
	tollExpesnePrint					= data.tollExpenseDetails;
	dispatchLedgerPrint					= data.dispatchLedgerArr;
	miscExoensePrint					= data.miscExpenseDetails;
	distabcePrint						= data.distance;
	var miscExpEenseArr					= data.miscExpenseDetailsArr;
	var tollExpEenseArr					= data.tollExpenseDetailsArr;
	var totalMiscAmt					= 0;
	var totalTollAmt					= 0;
	var rounte							= data.routeBranchNameStr;
	
	if(miscExpEenseArr != undefined){
	for(var i = 0 ; i < miscExpEenseArr.length; i++){
		var model 	= miscExpEenseArr[i];
		var name = model.name;
		var amount = model.amount;
		totalMiscAmt = Number(amount) +  Number(totalMiscAmt);
		var tempmisc   = name.slice(0,5)+"-"+amount;
		
		tempmisc1  = tempmisc1+","+tempmisc;
		
	}
	}

	if(tollExpEenseArr != undefined){
	for(var j = 0 ; j < tollExpEenseArr.length; j++){
		var model1 	= tollExpEenseArr[j];
		var name1 = model1.name;
		var amount1 = model1.amount;
		totalTollAmt = Number(amount1)+Number(totalTollAmt);
		var temptoll   = name1.slice(0,5)+"-"+amount1;
		temptoll1  = temptoll1+","+temptoll;
	}
	}
	
	
	var VehicleNumber 					= truckHisabSettlementForPrint.vehicleNumber;
	var Paybranch	  					= truckHisabSettlementForPrint.branchName;
	var hisabVoucherNumber	  			= truckHisabSettlementForPrint.truckHisabNumber;
	if(truckHisabSettlementForPrint.driverName != null){
		var driverNameLic	  				= truckHisabSettlementForPrint.driverName;
		var driverString		  			= driverNameLic.split("-");
		var driverName		  				= driverString[0];
		var LicNumber			  			= driverString[1];
	}else{
		var driverName		  				= truckHisabSettlementForPrint.driverNameString;
		var LicNumber			  			= truckHisabSettlementForPrint.licNumber;
	}
	var DateString			  			=  truckHisabSettlementForPrint.createDateTime.split(" ");
	var currDate						=  changeDateFormatFullDate(DateString[0]);
	if(lhpvPrint != null){
		var LhpvNumber						= '&nbsp;'+lhpvPrint.lHPVNumber;
		var LHPVFROM						= lhpvPrint.lhpvBranchName;
		var TOFROM							= lhpvPrint.destinationBranch;
	}else{
		var LhpvNumber						= '&nbsp;'+truckHisabSettlementForPrint.lhpvNumber;
	}
	if(driverAllowancePrint!= undefined){
	var DriverAllowanceFROMString		= driverAllowancePrint[0].fromDateTime.split(" ");
	var DriverAllowanceFROM				= '&nbsp;'+changeDateFormat(DriverAllowanceFROMString[0]);
	var DriverAllowanceTOString			= driverAllowancePrint[0].toDateTime.split(" ");
	var DriverAllowanceTO				= changeDateFormat(DriverAllowanceTOString[0]);
	var DriverDailyAllowance			= driverAllowancePrint[0].allowanceRate;
	var totalNumDays					= driverAllowancePrint[0].totalNumberDays;
	var DriverDailyAllowanceTot			= driverAllowancePrint[0].amount;
	}
//	var TollName						= tollExpesnePrint.name;
//	var TollAmount						= tollExpesnePrint.amount;
//	var TollTotalAmount					= tollExpesnePrint.amount;
	var totPkgsLs						= 0;
	var totWgtLs						= 0;
	var totDDLs							= 0;
	var totFormLs						= 0;
		for(var i = 0;i < dispatchLedgerPrint.length ; i++){
			 lsString = lsString+","+dispatchLedgerPrint[i].lsNumber;
			 
			 totPkgsLs = Number(dispatchLedgerPrint[i].totalNoOfPackages) + Number(totPkgsLs);
			 totWgtLs  = Number(dispatchLedgerPrint[i].totalActualWeight) + Number(totWgtLs);
			 totDDLs  = Number(dispatchLedgerPrint[i].totalNoOfDoorDelivery) + Number(totDDLs);
			 totFormLs  = Number(dispatchLedgerPrint[i].totalNoOfForms) + Number(totFormLs);
		}
	//var miscName							= miscExoensePrint.name
	//var miscAmount						= miscExoensePrint.amount;
	var grandTotal						= truckHisabSettlementForPrint.amount;
	var remark							= truckHisabSettlementForPrint.remark;
	
	$("#TruckNumberPrint").html(VehicleNumber);
	$("#PayBranchNamePrint").html(Paybranch);
	$("#truckHisabSettlemntPrint").html(hisabVoucherNumber);
	$("#driverNamePrint").html('&nbsp;&nbsp;&nbsp;&nbsp;'+driverName);
	$("#LICNumberPrint").html('&nbsp;&nbsp;'+LicNumber);
	$("#ThvDatePrint").html(currDate);
	$("#LHPVNoPrint").html(LhpvNumber);
	if(rounte != null){
		$("#LHPVFromPrint").html(rounte.split((rounte.length)));
	}
	//$("#LHPVTOPrint").html(TOFROM);
	$("#DriverAllowanceFromDatePrint").html(DriverAllowanceFROM);
	$("#DriverAllowanceTODatePrint").html(DriverAllowanceTO);
	$("#DricerBhattaPrint").html(DriverDailyAllowance);
	$("#NumberOfDaysPrint").html(totalNumDays);
	$("#totalAllowancePrint").html(DriverDailyAllowanceTot);
	$("#TOllExpenseNamePrint").html('&nbsp;'+temptoll1.slice(1));
//	$("#TOllExpenseNamePrint11").html(TollTotalAmount);
	$("#TotalExpensePrint").html(totalTollAmt);
	$("#LsnumberPrint").html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+lsString.slice(1));
	$("#MiscPrint").html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+tempmisc1.slice(1));
	$("#RemarkPrint").html('&nbsp;&nbsp;&nbsp;&nbsp;'+remark);
	$("#TotalVoucherTotalPrint").html(grandTotal);
	$("#TotalMiscPrint").html(totalMiscAmt);
	$("#NumberOfPkgsPrint").html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+totPkgsLs);
	$("#NumberOfWGTPrint").html(totWgtLs);
	$("#NumberOfDDPrint").html(totDDLs);
	$("#NumberOfFormPrint").html(totFormLs);
	if(distabcePrint > 0){
		$("#TotalDistancePrint").html(distabcePrint);
	}else{
		$("#TotalDistancePrint").html("No Distance Configure");
	}
}

/**
 *
 **/
function getDataforPrint(truckHisabId,vehicleId){
	var jsonObject 		= null;
	var jsonOutObject	= null;
	jsonObject  = new Object();
	jsonOutObject  = new Object();
	jsonObject.TruckHisabId			= truckHisabId;
	jsonObject.VehicleId			= vehicleId;
	jsonObject.Filter				= 10;
	showLayer();
	jsonOutObject = jsonObject;
	
	var jsonStr	  = JSON.stringify(jsonOutObject);
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2", 
			{json:jsonStr}, function(data) {
				printJsonForThv	= data.printForThv;
				console.log("printJsonForThv");
				console.log(printJsonForThv);
				printWindowTHV();
				hideLayer();
			})
	
}

// code related to popup

function setView() {
	  HideSaidToContainDialogForView();
}



function ShowDialogForPrint(){
  $("#companyNameOverlay").show();
  $("#companyNameDialog").fadeIn(300);
  $('#print').focus();
  }
  
function setPrint(){
	HideSaidToContainDialog();
	window.close();
}

function HideSaidToContainDialog(){
  $("#companyNameOverlay").hide();
  $("#companyNameDialog").fadeOut(0);
  window.print();
}
function HideSaidToContainDialogForView(){
  $("#companyNameOverlay").hide();
  $("#companyNameDialog").fadeOut(0);

}
