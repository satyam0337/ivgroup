var loadCentralizedCancellation						= new $.Deferred();	//	CentralizedCancellation

var jsondata 						= null;
var executiveObj						= null;
var Executive						= null;

function loadDataForWaybillCancel() {

	var jsonStr = {};
	//var jsonObject		= new Object();
	$.getJSON("WaybillCancellationAjaxAction.do?pageId=2&eventId=21",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else{
					console.log(data);
					jsondata				= data;

					executiveObj				= jsondata.executive; // executive object
					Executive				= jsondata.executiveCon; // executive object
					configuration			= data.configuration;
					loadCancellation(); // load content as per configuration
				}

			});
}

function setNextPrevForWeighbridge() {
	if(configuration.Weighbridge== 'true'){
		next='DestinationBranchId'; 
	}
}

function loadCancellation() {

	if (configuration.CentralizedCancellation == 'true') {

		document.getElementById("CentralizeWaybillcancellation").style.display = 'block';
		document.getElementById("centerlizeCancelltaion").value = configuration.CentralizedCancellation;
	} else {
		if(executiveObj.executiveType == Executive.EXECUTIVE_TYPE_GROUPADMIN ){
			document.getElementById("CentralizeWaybillcancellation").style.display = 'block';
		}else{
			document.getElementById("Execancellation").style.display = 'block';
			document.getElementById("centerlizeCancelltaion").value = configuration.CentralizedCancellation;
		}


	}

}

