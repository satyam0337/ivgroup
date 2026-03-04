/***
 * Created By : Shailesh Khandare
 * Description :Autocomplete for Own vehicle 
 * Date : 28-04-2016 
 */

/**
 * This function to set autocomplete
 * */
function autoCompleteLoadOwnVehicle(routeTypeId){
	$("#truckOwnNumber").autocomplete({
		source: "AutoCompleteAjax.do?pageId=9&eventId=13&filter=40&routeTypeId="+routeTypeId,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getVehicleId(ui.item.id);
				setRouteTypeId(ui.item.routeType);
				
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function autoCompleteLoadAllVehicleData(routeTypeId){
	$("#truckOwnNumber").autocomplete({
		source: "AutoCompleteAjax.do?pageId=9&eventId=13&filter=20&routeTypeId="+routeTypeId,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getVehicleId(ui.item.id);
				setRouteTypeId(ui.item.routeType);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setLogoutIfEmpty(ui) {
	if(ui.content) {
		if(ui.content.length < 1) {
			ui.content.push (
					{
						"label": "You are logged out, Please login again !",
						"id": "0"
					}
			);
		}
	}
}


function getVehicleId(branchId_CityId) {
	var VehicleId 	= branchId_CityId
	$('#VehicleId').val(VehicleId);
}

function setRouteTypeId(routeTypeId) {
	$('#routeTypeId').val(routeTypeId);
}