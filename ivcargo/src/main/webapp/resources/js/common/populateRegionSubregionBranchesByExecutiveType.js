/**
 * 
 */

var executive			= null;

//Data is comming from this AjaxActionToGetDataById.java file
function populateRegionSubregionBranchesByExecutiveType() {
	var jsonObject		= new Object();
	
	jsonObject.filter	= 7;
	jsonObject.showRegionSelectionForRegionAdmin	= showRegionSelectionForRegionAdmin != undefined && showRegionSelectionForRegionAdmin;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("AjaxActionToGetDataById.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else { 
					executive				= data.executive;
					var regionForGroup		= data.regionForGroup;
					var subRegions			= data.subRegionForGroup;
					var subRegionBranches	= data.subRegionBranches;
					var locationMappingList	= data.locationMappingList;

					displayDropdown();
					setRegionList(regionForGroup);
					setSubregionList(subRegions);
					setBranchList(subRegionBranches);
					setLocationMappingList(locationMappingList);
					
					sortDropDownList('region');
				}
			}
			);
}

function displayDropdown() {
	if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
		displayRegionDropdown();
		displaySubregionDropdown();
		displayBranchDropdown();
		displayLocationMappingDropDown();
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
		displaySubregionDropdown();
		displayBranchDropdown();
		displayLocationMappingDropDown();
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
		displayBranchDropdown();
		displayLocationMappingDropDown();
	} else {
		displayLocationMappingDropDown();
	}
}

function displayRegionDropdown() {
	changeDisplayProperty('displayRegion', 'block'); //function calling from genericfunction.js
}

function displaySubregionDropdown() {
	changeDisplayProperty('displaySubRegion', 'block'); //function calling from genericfunction.js
}

function displayBranchDropdown() {
	changeDisplayProperty('displayBranch', 'block'); //function calling from genericfunction.js
}

function displayLocationMappingDropDown() {
	changeDisplayProperty('displayDestination', 'block'); //function calling from genericfunction.js
}

function setRegionList(regionForGroup) {
	operationOnSelectTag('region', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('region', 'addNew', '---- Select  Region ----', 0); //function calling from genericfunction.js
	
	if(regionForGroup != null) {
		for(var i = 0; i < regionForGroup.length; i++) {
			operationOnSelectTag('region', 'addNew', regionForGroup[i].name, regionForGroup[i].regionId);
		} 
	}
}

function setSubregionList(subRegions) {
	operationOnSelectTag('subRegion', 'removeAll', '', ''); //function calling from genericfunction.js
	
	if(configuration.AllOptionsForSubRegion == 'false')
		operationOnSelectTag('subRegion', 'addNew', '--Select SubRegion--', -1);
	else
		operationOnSelectTag('subRegion', 'addNew', 'ALL', 0);
	
	if(subRegions != null) {
		for(var i = 0; i < subRegions.length; i++) {
			operationOnSelectTag('subRegion', 'addNew', subRegions[i].name, subRegions[i].subRegionId);
		} 
	}
}

function setBranchList(subRegionBranches) {
	operationOnSelectTag('branch', 'removeAll', '', ''); //function calling from genericfunction.js
	
	if(configuration.AllOptionsForBranch == 'false')
		operationOnSelectTag('branch', 'addNew', '--Select Branch--', -1);
	else
		operationOnSelectTag('branch', 'addNew', 'ALL', 0);
	
	if(subRegionBranches != null) {
		var branch		= null;
		
		for(var key in subRegionBranches) {
			branch			= subRegionBranches[key];
			
			operationOnSelectTag('branch', 'addNew', branch.name, branch.branchId);
		}
	}
}

function setLocationMappingList(locationMappingList) {
	operationOnSelectTag('locationId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('locationId', 'addNew', 'ALL', 0);
	
	if(locationMappingList != null) {
		for(var i = 0; i < locationMappingList.length; i++) {
			operationOnSelectTag('locationId', 'addNew', locationMappingList[i].name, locationMappingList[i].assignedLocationId);
		}
	}
}

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
					var subRegionBranches		= data.subRegionBranches;
					setBranchesBySubregionId(subRegionBranches);
					sortDropDownList('branch');
				}
			}
	);
}

function setBranchesBySubregionId(subRegionBranches) {
	operationOnSelectTag('branch', 'removeAll', '', '');
	
	if(configuration.AllOptionsForBranch == 'false')
		operationOnSelectTag('branch', 'addNew', '--Select Branch--', -1);
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
					var subRegions		= data.subRegions;
					setSubregionByRegionIdList(subRegions);
					sortDropDownList('subRegion');
				}
			}
			);
}

function setSubregionByRegionIdList(subRegions) {
	operationOnSelectTag('subRegion', 'removeAll', '', '');
	
	if(configuration.AllOptionsForSubRegion == 'false')
		operationOnSelectTag('subRegion', 'addNew', '--Select SubRegion--', -1);
	else
		operationOnSelectTag('subRegion', 'addNew', 'ALL', 0);
	
	if(subRegions != null) {
		for(var i = 0; i < subRegions.length; i++) {
			operationOnSelectTag('subRegion', 'addNew', subRegions[i].name, subRegions[i].subRegionId);
		}
	}
	
	operationOnSelectTag('branch', 'removeAll', '', ''); //function calling from genericfunction.js

	if(configuration.AllOptionsForBranch == 'false')
		operationOnSelectTag('branch', 'addNew', '--Select Branch--', -1);
	else
		operationOnSelectTag('branch', 'addNew', 'ALL', 0);
	
	operationOnSelectTag('locationId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('locationId', 'addNew', 'ALL', 0);
}

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
					var locationMappingList		= data.locationMappingList;
					setLocationMappingList(locationMappingList);
					sortDropDownList('locationId');
				}
			}
			);
}