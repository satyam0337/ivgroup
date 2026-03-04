/**
 * 
 */
var subRegionBranches	= null;

function getBranchesBySubregionId() {
	var jsonObject		= new Object();

	jsonObject.subRegionId	= getValueFromInputField('subRegion');
	jsonObject.filter		= 5;

	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("PopulateDetailsById.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.

				} else { 

					subRegionBranches		= data.subRegionBranches;

					setBranchesBySubregionId();
					
					sortDropDownList('branch');
				}
			}
	);
}

function setBranchesBySubregionId() {
	operationOnSelectTag('branch', 'removeAll', '', '');
	
	if(configuration.AllOptionsForBranch == 'false')
		operationOnSelectTag('branch', 'addNew', '--select--', -1);
	else
		operationOnSelectTag('branch', 'addNew', 'ALL', 0);

	if(subRegionBranches != null) {
		for(var i = 0; i < subRegionBranches.length; i++) {
			operationOnSelectTag('branch', 'addNew', subRegionBranches[i].name, subRegionBranches[i].branchId);
		}
	}

	operationOnSelectTag('locationId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('locationId', 'addNew', 'ALL', 0);
}