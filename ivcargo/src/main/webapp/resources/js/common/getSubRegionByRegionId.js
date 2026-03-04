/**
 * 
 */
var subRegions	= null;

function getSubRegionByRegionId() {
	var jsonObject		= new Object();
	
	jsonObject.regionId	= getValueFromInputField('region');
	jsonObject.filter	= 1;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("PopulateDetailsById.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					
				} else { 
					
					subRegions		= data.subRegions
					
					setSubregionByRegionIdList();
					
					sortDropDownList('subRegion');
				}
			}
			);
}

function setSubregionByRegionIdList() {
	operationOnSelectTag('subRegion', 'removeAll', '', '');
	
	if(configuration.AllOptionsForSubRegion == 'true')
		operationOnSelectTag('subRegion', 'subRegion', '--select--', -1);
	else
		operationOnSelectTag('subRegion', 'subRegion', 'ALL', 0);
	
	if(subRegions != null) {
		for(var i = 0; i < subRegions.length; i++) {
			operationOnSelectTag('subRegion', 'addNew', subRegions[i].name, subRegions[i].subRegionId);
		}
	}
	
	operationOnSelectTag('branch', 'removeAll', '', ''); //function calling from genericfunction.js

	if(configuration.AllOptionsForBranch == 'false')
		operationOnSelectTag('branch', 'addNew', '--select--', -1);
	else
		operationOnSelectTag('branch', 'addNew', 'ALL', 0);
	
	operationOnSelectTag('locationId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('locationId', 'addNew', 'ALL', 0);
}