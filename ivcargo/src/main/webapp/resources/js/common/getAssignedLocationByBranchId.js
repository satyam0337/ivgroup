/**
 * 
 */
var locationMappingList	= null;

function getAssignedLocationByBranchId() {
	var jsonObject		= new Object();
	
	jsonObject.branchId		= getValueFromInputField('branch');
	jsonObject.filter		= 8;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("PopulateDetailsById.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					
				} else { 
					
					locationMappingList		= data.locationMappingList
					
					setAssignedLocationByBranchId();
					
					sortDropDownList('locationId');
				}
			}
			);
}

function setAssignedLocationByBranchId() {
	if(locationMappingList != null) {
		operationOnSelectTag('locationId', 'removeAll', '', '');
		operationOnSelectTag('locationId', 'addNew', 'ALL', 0);
		
		for(var i = 0; i < locationMappingList.length; i++) {
			operationOnSelectTag('locationId', 'addNew', locationMappingList[i].name, locationMappingList[i].assignedLocationId);
		}
	}
}