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
var JsonDataForPrint						= null;
//var miscExpEenseArr						= null;

function printWindowPumpReceipt(printId) {
	childwin = window.open('pumpReceiptPrint.do?pageId=347&eventId=3&Printno='+printId, config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function printTruckWindowPumpRecipt1() {
		/*createPrintButton(window.opener.printJsonForPumpRecipt);
		JsonDataForPrint = window.opener.printJsonForPumpRecipt;*/
		setPrintData(window.opener.printJsonForPumpRecipt);
		window.setTimeout(printAfterDelay, 500);
}

function printWindowPumpReceipt1(printId) {
	childwin = window.open('pumpReceiptPrint.do?pageId=347&eventId=3?Printno='+printId, config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function printTruckWindowPumpRecipt2() {
	var jsonData;
	if(typeof(Storage) === "undefined") {
		jsonData =  localStorage.getItem('JsonDataForPrint');
	} else {
		jsonData = localStorage.JsonDataForPrint;
	}
	
	console.log("@@window.sessionStorage.getItem('JsonDataForPrint')");
	console.log(JSON.stringify(jsonData));
	
	
	setPrintData(jsonData);
	window.setTimeout(printAfterDelay, 500);
}


function printAfterDelay(data) {
	window.print();
	//window.close();
}

function changeTimeFormat(dateFormatToChange){
	
	var date = new Date(dateFormatToChange);
	
	var options = {
	  hour: 'numeric',
	  minute: 'numeric',
	  hour12: true
	};
	var timeString = date.toLocaleString('en-US', options);
	
	return timeString;
}

function changeDateFormat(dateFormatToChange){
	var splitvar	= dateFormatToChange.split("-");
	var year			= splitvar[0]; 
	var month			= splitvar[1]; 
	var day			= splitvar[2];
	return day + "-" + month;
}

function changeDateFormatFullDate(dateFormatToChange){
	var splitvar		= dateFormatToChange.split("-");
	var year			= splitvar[0]; 
	var month			= splitvar[1]; 
	var day			= splitvar[2];
	return day + "-" + month + "-" +year;
}


var tempmisc1				= "";
var temptoll1				= "";
var tempDriverExDetails1	= "";

function setPrintData(data) {
	console.log("data 22 -- > ",data);
	var isLocal = false;
	var printNo =  GetURLParameter('Printno');
	var dieselAsPerSystem = 0;
	

	var  pumpReceiptArr					= data.pumpReceiptArr;
	var  pumpReceiptDetailsArr			= data.pumpReceiptDetails;
	var  pumpReceiptLHPVDetailsArr		= data.pumpReceiptLHPVDetailsArr;
	var  pumpReceiptDDMDetailsArr		= data.pumpReceiptDDMDetailsArr;
	var  pumpReceiptIntBrchLSDetailsArr	= data.pumpReceiptIntBrchLSDetailsArr;
	var  routeBranchNameStr				= data.routeBranchNameStr;
	var  vehicelNumber					= data.vehicleNumber;
	var  pumpReceiptLocal 				= data.pumpReceiptLocal;	
	var  vehicleAverage					= data.vehicleAverage;
	
	var driverNameString	= pumpReceiptArr[printNo].driverName;
	var driverName1			= driverNameString.split("-");
	var driverName2			= driverName1[0];
	var licNumber			= driverName1[1];
	var fuelToFillUp		= pumpReceiptArr[printNo].fuelToFillUp;
	//$(".SlipNumberPrint").html(pumpReceiptArr[printNo].pumpReceiptNumber);
	
	var DateString			=  pumpReceiptArr[printNo].createDateTime.split(" ");
	var currDate			=  changeDateFormatFullDate(DateString[0]);
	var currTime			=  changeTimeFormat(pumpReceiptArr[printNo].createDateTime);
	
	if(vehicleAverage > 0 && pumpReceiptDetailsArr.totalKilometer > 0){
		dieselAsPerSystem = parseInt(pumpReceiptDetailsArr.totalKilometer / vehicleAverage);
	}
		
	$(".datePrint").html(currDate);
	$(".branchPrint").html(pumpReceiptArr[printNo].branchName);
	$(".pumpNamePrint").html(pumpReceiptArr[printNo].pumpName);
	$(".RemarkPrint").html(pumpReceiptArr[printNo].remark);
	$(".driverNamePrint").html(driverName2);
	$(".driverLicPrint").html(licNumber);
	$(".dieselInLitersPrint").html(fuelToFillUp);
	$(".totalKMSPrint").html(pumpReceiptDetailsArr.totalKilometer);
	$(".executiveName").html(pumpReceiptArr[printNo].executiveName);
	$(".timePrint").html(currTime);
	
	$(".openingKMSPrint").html(pumpReceiptDetailsArr.openingKilometer);
	$(".currentKMSPrint").html(pumpReceiptDetailsArr.currentKilometer);
	$(".vehicleAveragePrint").html(pumpReceiptDetailsArr.vehicleAverage);
	$(".dieselAsPerSystemInLitersPrint").html(dieselAsPerSystem);
	$(".openingKmPrint").html(pumpReceiptDetailsArr.openingKilometer);
	$(".closingKmPrint").html(pumpReceiptDetailsArr.currentKilometer);
	$(".fuelTotal").html(pumpReceiptArr[printNo].fuelTotalRate);
	
	if(pumpReceiptLHPVDetailsArr != undefined){
		$(".LHPVNoPrint").html(pumpReceiptLHPVDetailsArr[0].lhpvNumber);
	}
	if(pumpReceiptDDMDetailsArr != undefined){
		console.log(pumpReceiptDDMDetailsArr[0]);
		$(".DDMNoPrint").html(pumpReceiptDDMDetailsArr[0].ddmNumber);
	}
	if(pumpReceiptIntBrchLSDetailsArr != undefined){
		$(".intLSNoPrint").html(pumpReceiptIntBrchLSDetailsArr[0].interBranchLSNumber);
	}
	$(".LHPVRoute").html(routeBranchNameStr);
	$(".truckPrint").html(vehicelNumber);
	
	if(pumpReceiptLocal != undefined){
		$(".Local").html(pumpReceiptLocal.fromLocation+ ' - ' +pumpReceiptLocal.toLocation);
	}
	if(pumpReceiptLHPVDetailsArr == undefined 
			&& pumpReceiptDDMDetailsArr == undefined 
			&& pumpReceiptIntBrchLSDetailsArr == undefined
			&& pumpReceiptLocal != undefined){
		isLocal = true;
	}
	if(isLocal){
		$(".SlipNumberPrint").html(pumpReceiptArr[printNo].pumpReceiptNumber +' ( LOCAL )');
	} else {
		$(".SlipNumberPrint").html(pumpReceiptArr[printNo].pumpReceiptNumber);
	}
}

/**
 *
 **/
function getPumpReceiptDataforPrint(pumpReceiptDetailsId,pumpReceiptId){
	var jsonObject 		= null;
	var jsonOutObject	= null;
	var printNo			= 0;
	jsonObject  = new Object();
	jsonOutObject  = new Object();
	
	jsonObject.pumpReceiptDetailsId	= pumpReceiptDetailsId;
	jsonObject.pumpReceiptId		= pumpReceiptId;
	jsonObject.Filter				= 7;
	showLayer();
	jsonOutObject = jsonObject;
	
	var jsonStr	  = JSON.stringify(jsonOutObject);
	$.getJSON("PrintReceiptAjaxAction.do?pageId=346&eventId=2", 
			{json:jsonStr}, function(data) {
				printJsonForPumpRecipt	= data.printForPumpRecipt;
				
				//console.log("printJsonForThv");
				//console.log(printJsonForThv);
				printWindowPumpReceipt(printNo);
				hideLayer();
			})
}

function getCurrentDate1(){
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


function GetURLParameter(sParam){
	  var sPageURL = window.location.search.substring(1);
	  var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++){
	    	  var sParameterName = sURLVariables[i].split('=');
	    	  if (sParameterName[0] == sParam){
	              return sParameterName[1];
	    	  }
	    }
}