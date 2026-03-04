/**
 * 
 */

function getDetailsByVehicleNumber(id) {
	var jsonObject			= new Object();
	
	jsonObject.vehicleMasterId		= id;
	jsonObject.filter				= 2;
	
	var jsonStr 			= JSON.stringify(jsonObject);
	var url =  "LHPVAjaxAction.do?pageId=228&eventId=4";
	
	showLayer();
	$.getJSON(url,{json:jsonStr}, function(data) {
		
		if(jQuery.isEmptyObject(data)) {
			alert("Sorry, an error occurred in the system. Please report this problem to the System Administrator.");
			showMessage('error', 'Sorry, an error occurred in the system. Please report this problem to the System Administrator.');
			hideLayer();
			return false;
		} else if(data.error != null) {
			//alert(data.error);
			showMessage('info', iconForInfoMsg + ' ' + data.error);
			hideLayer();
			return false;
		} else {
			hideLayer();
			setValueToTextField('lsNumber', '');
			setTimeout(setDataForLHPV(data, 0), 1000);
		}	
	});
}