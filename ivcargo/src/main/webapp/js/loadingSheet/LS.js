var loadweighbridge		= new $.Deferred();	//	weighbridge
var jsondata 			= null;

function loadDataForLs() {

	var jsonObject		= new Object();

	jsonObject.filter		= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("LoadingSheetAjaxAction.do?pageId=2&eventId=22",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.

				} else{
					jsondata				= data;
					configuration			= data.configuration;
					loadCreateWayBillPage(); // load content as per configuration
					LSValidation();
				}
			});
}

function LSValidation(){
	if(configuration.AgentCrossingTruckNoValidation == 'true'){
		$("#TruckNo").val("1");
	}
}

function setNextPrevForWeighbridge() {
	if(configuration.Weighbridge== 'true'){
		next='DestinationBranchId'; 
	}
}

function loadCreateWayBillPage() {

	if (configuration.Weighbridge== 'true') {
		$("#weighbridgepanel").load( "/ivcargo/jsp/LoadingSheet/Weighbridge.html", function() {
			loadweighbridge.resolve();
		});
	} else {
//		$( "#remarkpanel" ).remove();
	}
	if(configuration.LicenseNo == 'true') {
		$("#driverTD").load( "/ivcargo/jsp/LoadingSheet/Driver1LicenseNo.html",function(){
			if(configuration.LicenseNoAutoComplete == 'true') {
				setDriverLicenseNumberAutoComplete();
			}
			else{
				$('#driver1').prop("autocomplete","off");
			}
		});
	}
	
	SetVehicleNoAutocomplete();
}
function setDriverLicenseNumberAutoComplete(){
	$("#driver1").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=19",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id!=0){
				LicenseNoReset();
				getDriverDetails(ui.item);
			}
			else{
				setLogoutIfEmpty(ui);
			}
		}
	});
}

function SetVehicleNoAutocomplete(){
	$("#vehicleNumber").autocomplete({
		search: function( event, ui ) {
		},
		source: "Ajax.do?pageId=9&eventId=13&filter=20",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id!=0){
				resetFeild();
				document.getElementById('selectedVehicleNumberMasterId').value =ui.item.id;
				getVehicleDetails(ui.item.id);
				getLorryHireDetails(ui.item.id);
			}
			else{
				setLogoutIfEmpty(ui);
			}
		},
	});
}

function getDriverDetails(lic){
	jsonObjectdata = new Object();
	jsonObjectdata.lic = lic.value; 
	var jsonStr = JSON.stringify(jsonObjectdata);

	$.getJSON("Ajax.do?pageId=9&eventId=13&filter=21",{json:jsonStr}, function(data) {
		var DriverDataDetails = data.DriverDataDetails;
		var DriverDetails = data.DriverData;
		var errorMsgDiv = document.getElementById("errorSubmit");
		var driver1  = document.getElementById('driver1');
		var driver1Name = document.getElementById('driver1Name');
		var driver1MobileNumber1 = document.getElementById("driver1MobileNumber1");
		var driver1MobileNumber2 = document.getElementById("driver1MobileNumber2");
		if(DriverDetails == 'No Record Found') {
			errorMsgDiv.innerHTML = 'No Record Found for Licence No. '+lic.value+' !!!';
			errorMsgDiv.className = 'statusErr';
			errorMsgDiv.style.display='block';

			driver1Name.focus();
			driver1.value = lic.value;
			checkForDriver('driver1');
		}else{
			driver1.value = lic.value;
			driver1Name.value = DriverDataDetails.Name;
			if(DriverDataDetails.Mobile1!=null){
				if(driver1MobileNumber1){
					driver1MobileNumber1.value = DriverDataDetails.Mobile1;
				}
			} if(DriverDataDetails.Mobile2){
				if(driver1MobileNumber2){
					driver1MobileNumber2.value = DriverDataDetails.Mobile2;
				}
			}	}
		if(DriverDetails == 'License Expired') {
			errorMsgDiv.innerHTML = lic.value+' License Expired. Please Renew it first !!!';
			errorMsgDiv.className = 'statusErr';
			errorMsgDiv.style.display='block';
			driver1MobileNumber1.focus();
		} else if(DriverDetails == 'Update Details') {
			errorMsgDiv.innerHTML = 'Please Update Details for '+lic.value;
			errorMsgDiv.className = 'statusErr';
			errorMsgDiv.style.display='block';
			driver1MobileNumber1.focus();
		} else {
			driver1MobileNumber1.focus();
		}
	});
}

function LicenseNoReset(){
	document.getElementById('driver1').value = "";
	document.getElementById('driver1Name').value = 'DRIVER 1 NAME';
	document.getElementById('driver1MobileNumber1').value = 'DRIVER 1 MOB NO.';
	document.getElementById("driver1MobileNumber2").innerHTML = 'DRIVER 1 MOB NO.2';
}
