/**
 * @Author Anant Chaudhary	19-12-2015
 */

/*
 * To work this file please import genericfunctions.js and VariableForErrMsg.js, 
 * and variableForBranchCrossing.js, and CommonFunctionForInputFieldValidation.js file
 */

 function resetError(el){
	 toogleElement('error','none');
	 toogleElement('msg','none');
	 removeError(el.id);
 }

 function populateSubRegions(obj,id){
	 populateSubRegionsByRegionId(obj.value, id, false, false);
 }

 function populateBranches(obj, id){
	 subregionName 	= getSeletedTextFromList('subRegion');

	 setValueToHtmlTag('subregionName', subregionName);
	 changeHtmlTagColor('subregionName', '#F71616', '', '', '');
	 
	 populateActivePhysicalBranchesOnlyBySubRegionId(obj.value, id, false, false);
	 alert("All Branches for " + subregionName);
	 
	 removeOptionValFromList('branch', 0);
 }
 
 function populateDestinationBranches(obj, id){
	 destsubregionName 	= getSeletedTextFromList('destSubRegion');

	 setValueToHtmlTag('destsubregionName', destsubregionName);
	 changeHtmlTagColor('destsubregionName', '#F71616', '', '', '');
	 
	 populateActivePhysicalBranchesOnlyBySubRegionId(obj.value, id, false, false);
	 alert("All Branches for " + destsubregionName);
	 
	 removeOptionValFromList('destBranch', 0);
 }

//Get all crossing branches by account group
function getCrossingBranch() {
	
	var jsonObject 	= new Object();

	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/crossingBranchMapWS/getCrossingHubBranchForGroup.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			crossingBranchArr		= data.crossingBranchArr;
			mergedAccountGroupArr	= data.mergedAccountGroupArr;
			regionList				= data.regionList;
			subRegionList			= data.subRegionList;
			branchList				= data.branchList;
			executive				= data.executive;
			branchModel				= data.branch;
			ourNetwork				= data.ourNetwork;
			sharedNetwork			= data.sharedNetwork;
			sourceDestinationWiseCrossingMap = data.sourceDestinationWiseCrossingMap;
			showMergedGroupInRegionSelection = data.ShowMergedGroupInRegionSelection;
			
			if(typeof regionList != 'undefined') {
				$('#selectRegion').removeClass('hide');
				$('#selectSubregion').removeClass('hide');
				
				if(sourceDestinationWiseCrossingMap){
					$('#selectDestRegion').removeClass('hide');
					$('#selectDestSubregion').removeClass('hide');
				}
				
				operationOnSelectTag('region', 'addNew', '---Select Region---', 0);
				operationOnSelectTag('subRegion', 'addNew', '---Select Sub-Region---', 0);
				
				if(sourceDestinationWiseCrossingMap){
					//operationOnSelectTag('destRegion', 'addNew', '---Select Destination Region---', 0);
					operationOnSelectTag('destSubRegion', 'addNew', '---Select Destination Sub-Region---', 0);
				}
				
				for(var i = 0; i < regionList.length; i++) {
					operationOnSelectTag('region', 'addNew', regionList[i].regionName, regionList[i].regionId);
				}
				
				sortDropDownList('region');
			
				if(sourceDestinationWiseCrossingMap) {
					if(!showMergedGroupInRegionSelection) {
						$('#' + ourNetwork).remove();
						$('#' + sharedNetwork).remove();
					}
					
					if(showMergedGroupInRegionSelection && mergedAccountGroupArr != undefined) {
						for(var i = 1; i < regionList.length; i++) {
							operationOnSelectTag(ourNetwork, 'addNew', regionList[i].regionName, regionList[i].regionId);
						}
						
						setTimeout(function() {
							if(mergedAccountGroupArr != undefined && mergedAccountGroupArr.length > 0) {
								for(var i = 0; i < mergedAccountGroupArr.length; i++) {
									operationOnSelectTag(sharedNetwork, 'addNew', mergedAccountGroupArr[i].assignedAccountGroupName, mergedAccountGroupArr[i].assignBranchAccountGroupId);
								}
							}
						}, 500);
						
					} else {
						for(var i = 0; i < regionList.length; i++) {
							operationOnSelectTag('destRegion', 'addNew', regionList[i].regionName, regionList[i].regionId);
						}
					}
					
					sortDropDownList('destRegion');
				}
				
			}
			
			if(typeof subRegionList != 'undefined') {
				$('#selectSubregion').removeClass('hide');
				
				operationOnSelectTag('subRegion', 'addNew', '---Select Sub-Region---', 0);
				
				for(var i = 0; i < subRegionList.length; i++) {
					operationOnSelectTag('subRegion', 'addNew', subRegionList[i].subRegionName, subRegionList[i].subRegionId);
				}
				
				sortDropDownList('subRegion');
				
				if(sourceDestinationWiseCrossingMap){
					$('#selectDestSubregion').removeClass('hide');
					
					operationOnSelectTag('destSubRegion', 'addNew', '---Select Sub-Region---', 0);
					
					for(var i = 0; i < subRegionList.length; i++) {
						operationOnSelectTag('destSubRegion', 'addNew', subRegionList[i].subRegionName, subRegionList[i].subRegionId);
					}
					
					sortDropDownList('destSubRegion');
				}
				
			}
			
			if(typeof branchList != 'undefined') {
				for(var i = 0; i < branchList.length; i++) {
					operationOnSelectTag('branch', 'addNew', branchList[i].branchName, branchList[i].branchId);
				}
			}
			
			if(sourceDestinationWiseCrossingMap){
				if(typeof branchList != 'undefined') {
					for(var i = 0; i < branchList.length; i++) {
						operationOnSelectTag('destBranch', 'addNew', branchList[i].branchName, branchList[i].branchId);
					}
				}
			}
			
			if(executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN 
					|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
				operationOnSelectTag('branch', 'addNew', branchModel.branchName, branchModel.branchId);
				operationOnSelectTag('region', 'addNew', branchModel.regionId, branchModel.regionId);
				operationOnSelectTag('subRegion', 'addNew', branchModel.subRegionId, branchModel.subRegionId);
			}
			
			if(crossingBranchArr != undefined && crossingBranchArr.length > 0) {
				for(var i = 0; i < crossingBranchArr.length; i++) {
					operationOnSelectTag('crossingBranch', 'addNew', crossingBranchArr[i].branchName, crossingBranchArr[i].branchId);
				}
			}
			
			if(sourceDestinationWiseCrossingMap)
				$('#crossing-hub-master-content1').removeClass('hide');
			
			hideLayer();
		}
	});
}

//Save and update crossing branches map
function insertUpdateCrossingBranches(filter) {

	if(!ValidateFormElement()) {return false;};
	
	var jsonObjectData = new Object();
	
	if(document.getElementById('branch_to') != null) {
		branchArrFromRight			= getAllOptionValueFromList('branch_to');
		
		if(branchArrFromRight.length <= 0) {
			showMessage('error', selectBranchesFromLeftErrMsg);
			changeTextFieldColor('branch', '', '', '#F71616');
			return false;
		}
	}
	
	if(sourceDestinationWiseCrossingMap && document.getElementById('destBranch_to') != null) {
		destbranchArrFromRight			= getAllOptionValueFromList('destBranch_to');
			
		if(destbranchArrFromRight.length <= 0) {
			showMessage('error', selectBranchesFromLeftErrMsg);
			changeTextFieldColor('destBranch', '', '', '#F71616');
			return false;
		}
	}

	if(document.getElementById('crossingBranch_to') != null) {
		crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
		
		if(crossingBranchArrFromRight.length <= 0) {
			showMessage('error', selectCrossingBranchesFromLeftErrMsg);
			changeTextFieldColor('crossingBranch', '', '', '#F71616');
			return false;
		}
	}

	var branchArr			= new Array();
	var destbranchArr		= new Array();
	var crossingBranchArr	= new Array();
	
	var branchArr	= new Array();
	
	for(var i = 0; i < branchArrFromRight.length; i++) {
		branchArr.push(branchArrFromRight[i]);
	}
	
	if(sourceDestinationWiseCrossingMap) {
		for(var i = 0; i < destbranchArrFromRight.length; i++) {
			destbranchArr.push(destbranchArrFromRight[i]);
		}
	}
	
	jsonObjectData["branchArr"]			= branchArr.join(',');
	jsonObjectData["destbranchArr"]		= destbranchArr.join(',');
	
	var crossingBranchArr	= new Array();
	
	for(var j = 0; j < crossingBranchArrFromRight.length; j++) {
		crossingBranchArr.push(crossingBranchArrFromRight[j]);
	}
	
	jsonObjectData["crossingBranchArr"]		= crossingBranchArr.join(',');
	
	ans = confirm(questionToSaveCrossingBranches);
	
	if (!ans)
		return false;

	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/crossingBranchMapWS/insertCrossingBranches.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				hideLayer();
			} else {
				if(data.success) {
					showMessage('success', crossingBranchMapSaveSuccess);
					reloadPage();
				}
				hideLayer();
			}
		}
	});
}

//Function to delete crossing branch map
function deleteCrossingBranches(jsonObjectData) {	

	ans = confirm(questionToDeleteCrossingBranches);
	
	if (!ans)
		return false;

	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/crossingBranchMapWS/deleteCrossingBranches.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				hideLayer();
			} else {
				if(data.success) {
					showMessage('success', crossingBranchMapDeleteSuccess);
					reloadPage();
				}
				hideLayer();
			}
		}
	});
}

//Function to deactivate the crossing branch maps
function deactivateCrossingBranches(jsonObjectData) {	
	ans = confirm(questionToDeactivateCrossingBranches);
	
	if (!ans)
		return false;
	
	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/crossingBranchMapWS/deactivateCrossingBranches.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				hideLayer();
			} else {
				if(data.success) {
					showMessage('success', crossingBranchMapDeactivatedSuccess);
					reloadPage();
				}
				hideLayer();
			}
		}
	});
}

//Common function to deactivate crossing branch map
function deleteOrDeactivateCrossingBranchMap(filter) {
	var jsonObjectData = new Object();

	selectedBranchVal			= getValueFromInputField('branch_to');
	selectedDestBranchVal		= getValueFromInputField('destBranch_to');
	selectedCrossingBranchValue	= getValueFromInputField('crossingBranch_to'); 

	var branchArr			= new Array();
	var destBranchArr		= new Array();
	var crossingBranchArr	= new Array();
	
	if(selectedBranchVal == null) {
		showMessage('error', selectBranchesFromRightErrMsg);
		changeTextFieldColor('branch_to', '', '', '#F71616');
		return false;
	}
	
	if(sourceDestinationWiseCrossingMap && selectedDestBranchVal == null) {
		showMessage('error', selectBranchesFromRightErrMsg);
		changeTextFieldColor('destBranch_to', '', '', '#F71616');
		return false;
	}
	
	if(selectedCrossingBranchValue == null) {
		showMessage('error', selectCrossingBranchesFromRightErrMsg);
		changeTextFieldColor('crossingBranch_to', '', '', '#F71616');
		return false;
	}
	
	for(var i = 0; i < selectedBranchVal.length; i++) {
		branchArr.push(selectedBranchVal[i]);
	}
	
	jsonObjectData["branchArr"]		= branchArr.join(',');
	
	if(sourceDestinationWiseCrossingMap) {
		destBranchArr = new Array()
		
		for(var i = 0; i < selectedDestBranchVal.length; i++) {
			destBranchArr.push(selectedDestBranchVal[i]);
		}
		
		jsonObjectData["destBranchArr"]		= destBranchArr.join(',');
	}
	
	var crossingBranchArr	= new Array();
	
	for(var j = 0; j < selectedCrossingBranchValue.length; j++) {
		crossingBranchArr.push(selectedCrossingBranchValue[j]);
	}
	
	jsonObjectData["crossingBranchArr"]		= crossingBranchArr.join(',');
	
	if(filter == 5)
		deleteCrossingBranches(jsonObjectData);
	else if(filter == 6)
		deactivateCrossingBranches(jsonObjectData);
}

//Function to get crossing branches map for single branch
function getCrossingBranchByBranch() {
	selectedBranchVal		= getSeletedValueFromList('branch');
	selectedBranchName 		= getSeletedTextFromList('branch');
	
	removeOptionValFromList('branch', selectedBranchVal);
	operationOnSelectTag('branch_to', 'addNew', selectedBranchName, selectedBranchVal);
	
	branchArrFromRight 		= getAllOptionValueFromList('branch_to');
	
	getCrossingBranchForBranch(branchArrFromRight);
	
	if(branchArrFromRight.length > 0) {
		for(var i = 0; i < branchArrFromRight.length; i++) {
			if(selectedBranchVal == branchArrFromRight[i]) {
				removeOptionValFromList('branch_to', selectedBranchVal);
				operationOnSelectTag('branch_to', 'addNew', selectedBranchName, branchArrFromRight[i]);
			}
		}
	}
}

function getCrossingBranchBySrcDestBranch() {
	
	selectedBranchVal		= getSeletedValueFromList('branch');
	selectedBranchName 		= getSeletedTextFromList('branch');
	
	removeOptionValFromList('branch', selectedBranchVal);
	
	if(typeof selectedBranchVal !== 'undefined')
		operationOnSelectTag('branch_to', 'addNew', selectedBranchName, selectedBranchVal);
	
	branchArrFromRight 		= getAllOptionValueFromList('branch_to');
	
	if(sourceDestinationWiseCrossingMap){
		selectedDestinationBranchName		= getSeletedTextFromList('destBranch');
		selectedDestinationBranchVal 		= getSeletedValueFromList('destBranch');
		
		removeOptionValFromList('destBranch', selectedDestinationBranchVal);
		
		if(typeof selectedDestinationBranchVal !== 'undefined')
			operationOnSelectTag('destBranch_to', 'addNew', selectedDestinationBranchName, selectedDestinationBranchVal);
		
		destbranchArrFromRight 		= getAllOptionValueFromList('destBranch_to');
		getCrossingBranchBySourceDestinationSelection(branchArrFromRight, destbranchArrFromRight);
	} else
		getCrossingBranchForBranch(branchArrFromRight); 

	if(branchArrFromRight.length > 0) {
		for(var i = 0; i < branchArrFromRight.length; i++) {
			if(selectedBranchVal == branchArrFromRight[i]) {
				removeOptionValFromList('branch_to', selectedBranchVal);
				operationOnSelectTag('branch_to', 'addNew', selectedBranchName, branchArrFromRight[i]);
			}
		}
	}
	
	if(destbranchArrFromRight.length > 0) {
		for(var i = 0; i < destbranchArrFromRight.length; i++) {
			if(selectedDestinationBranchVal == destbranchArrFromRight[i]) {
				removeOptionValFromList('destBranch_to', selectedDestinationBranchVal);
				operationOnSelectTag('destBranch_to', 'addNew', selectedDestinationBranchName, destbranchArrFromRight[i]);
			}
		}
	}
}

//Function to get crossing branches map for multiple branch
function getCrossingBranchForBranch(branches) {
	if(branches.length == 0) {
		showMessage('error', selectBranchesFromLeftErrMsg);
		changeTextFieldColor('branch', '', '', '#F71616');
		return false;
	}
	
	var jsonObjectData = new Object();
	
	var branchArr	= new Array();
	
	for(var i = 0; i < branches.length; i++) {
		branchArr.push(branches[i]);
	}
	
	jsonObjectData["branchArr"]		= branchArr.join(',');

	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/crossingBranchMapWS/getMappedCrossingBranches.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: function(data) {
			if(!data || jQuery.isEmptyObject(data) || data.message) {
				if(branches.length > 0)
					showMessage('info', crBranchesNotFoundForSeletedErrMsg);
				
				getAllValueFromRightCrossingBranch();
				operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
				$("#delete").prop('disabled', true);
				$("#deactivate").prop('disabled', true);
				changeTextFieldColor('crossingBranch_to', '', '', '');
				
				hideLayer();
			} else {
				getAllValueFromRightCrossingBranch();
				operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
				$("#delete").prop('disabled', false);
				$("#deactivate").prop('disabled', false);
				changeTextFieldColor('crossingBranch_to', '', '#F5F3F3', 'green');
				
				if(data.crBranchMapList) {
					crossingBranches	= data.crBranchMapList;
					
					if(crossingBranches.length > 0) {
						for(var i = 0; i < crossingBranches.length; i++) {
							crossingBranch		= crossingBranches[i];
							
							crossingBranchId		= crossingBranch.crossingBranchId;
							crossingBranchName		= crossingBranch.crossingBranchName;
							
							operationOnSelectTag('crossingBranch_to', 'addNew', crossingBranchName, crossingBranchId);
						}
					}					
				}

				hideLayer();
			}
		}
	});
}

function getCrossingBranchBySourceDestinationSelection(branches, destBranches){
	if(branches.length == 0) {
		showMessage('error', selectBranchesFromLeftErrMsg);
		changeTextFieldColor('branch', '', '', '#F71616');
		return false;
	}
	
	if(destBranches.length == 0) {
		showMessage('error', selectBranchesFromLeftErrMsg);
		changeTextFieldColor('destBranch', '', '', '#F71616');
		return false;
	}
	
	var jsonObjectData = new Object();
	
	var branchArr	= new Array();
	
	for(var i = 0; i < branches.length; i++) {
		branchArr.push(branches[i]);
	}
	
	var destBranchArr	= new Array();
	
	for(var i = 0; i < destBranches.length; i++) {
		destBranchArr.push(destBranches[i]);
	}

	jsonObjectData["branchArr"]			= branchArr.join(',');
	jsonObjectData["destBranchArr"]		= destBranchArr.join(',');
	
	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/crossingBranchMapWS/getMappedCrossingBranchesBySourceAndDestination.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: function(data) {
			
			if(!data || jQuery.isEmptyObject(data) || data.message) {
				if(branches.length > 0)
					showMessage('info', crBranchesNotFoundForSeletedErrMsg);
				
				getAllValueFromRightCrossingBranch();
				operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
				$("#delete").prop('disabled', true);
				$("#deactivate").prop('disabled', true);
				changeTextFieldColor('crossingBranch_to', '', '', '');
				hideLayer();
			} else {
				getAllValueFromRightCrossingBranch();
				operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
				$("#delete").prop('disabled', false);
				$("#deactivate").prop('disabled', false);
				changeTextFieldColor('crossingBranch_to', '', '#F5F3F3', 'green');
				
				if(data.crBranchMapList) {
					crossingBranches	= data.crBranchMapList;
					
					if(crossingBranches.length > 0) {
						for(var i = 0; i < crossingBranches.length; i++) {
							crossingBranch		= crossingBranches[i];
							
							crossingBranchId		= crossingBranch.crossingBranchId;
							crossingBranchName		= crossingBranch.crossingBranchName;
							
							operationOnSelectTag('crossingBranch_to', 'addNew', crossingBranchName, crossingBranchId);
						}
					}					
				}

				hideLayer();
			}
		}
	});
}

function populateSubReg(obj,destSubRegion) {

	$('#destSubRegion').show();

	if ($(obj.options[obj.selectedIndex]).closest('optgroup').prop('id') == ourNetwork) {
		isOtherGroupSelected	= false;
		populateSubRegions(obj, destSubRegion);
	} else if ($(obj.options[obj.selectedIndex]).closest('optgroup').prop('id') == sharedNetwork) {
		$('#destSubRegion').hide();
		isOtherGroupSelected	= true;
		$('#destBranch').empty();
		populateAssingedBranchesByAssignedAccGroupId($('#destRegion').val(), executive.accountGroupId, sharedNetwork);
	}
}