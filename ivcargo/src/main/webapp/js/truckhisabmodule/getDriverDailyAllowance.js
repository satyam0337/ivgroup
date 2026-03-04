/***
 * Created By : Shailesh Khandare
 * Description : Get Driver Allowance Details
 * Date : 26-04-2016 
 */
var today		= null;

/**
 * Get Value of Allowance
 * */
function getDailyAllowanceDetails(driverId){
	var jsonObject 				= null; 
	var jsonOutObject 			= null;
	jsonObject   	= new Object();
	jsonOutObject   = new Object();
	
	jsonObject.DriverAllowId 		= driverId;
	jsonObject.Filter 			= 4;
	jsonOutObject 				= jsonObject;
	
	var jsonStr 	= JSON.stringify(jsonOutObject);
	
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2", 
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', "Allowance is not configure for driver !");
					$("#driverAllowanceAmount").val(0);
					$("#driverAllowanceAmountValidate").val(0);
					getCurrentDate();
				}else{
					
					var driverDailyAllowance		= data.driverDailyAllowanceColl;
					var allowanceAmount				= driverDailyAllowance[0];
					$("#driverAllowanceAmount").val(allowanceAmount.amount);
					$("#driverAllowanceAmountValidate").val(allowanceAmount.amount);
					getCurrentDate();
				}
			})
	
}

/**
 *Get current date  
 */
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
	    $("#toDailyAllowdate").val(today);
	    
	    getDateDiffrence(today);
}

/**
 * Date Difference for daily allowance
 **/
function getDateDiffrence(today){
	
	var date1 =convertDate($('#fromDailyAllowdate').val());  
	var date2 =convertDate(today);
	diffc = date2.getTime() - date1.getTime();
	  //getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
	 
	  days = Math.round(Math.abs(diffc/(1000*60*60*24)));
	  //this is the actual equation that calculates the number of days.
	
	/*
	
	var diffDays = date2 - date1;*/
	  console.log("days");  
	console.log(days);  
if(!isNaN(days)){
	$("#totalNumberDay").val(days);
	var totAllowance 	= Number(days * $("#driverAllowanceAmount").val());
	$("#totAmountAllowance").val(totAllowance);
}else{
	$("#totalNumberDay").val(0);
	$("#totAmountAllowance").val(0);
}
}

function  calTotalAllwanceAmount(){
	var calulation =  Number($("#totalNumberDay").val()) * Number($("#driverAllowanceAmount").val());
	if(!isNaN(calulation)){
		
		$("#totAmountAllowance").val(calulation);
	}else{
		$("#totAmountAllowance").val(0);
	}
}
/**
 *convert date to "-" to "/" 
 */
function convertDate( str ) {
	   var parts = str.split("-");
	   return new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
	}



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


/**
 * 
 **/
function validateDriverAllowance(){
	var driverAllowanceAmount1 = $("#driverAllowanceAmountValidate").val();
	if($("#driverAllowanceAmount").val() != ""){
		
	if($("#driverAllowanceAmount").val() > driverAllowanceAmount1){
		showMessage("error", "Cant");
		$("#driverAllowanceAmount").val(driverAllowanceAmount1);
		$("#totAmountAllowance").val(Number($("#driverAllowanceAmount").val()) * Number($("#totalNumberDay").val()));
		
		return false; 	
	}
	}
}