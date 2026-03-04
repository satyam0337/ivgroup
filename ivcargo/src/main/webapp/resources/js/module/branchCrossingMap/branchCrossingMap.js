/**
 * @author Anant Chaudhary	19-12-2015
 */

/*
 * To work this file please import genericfunctions.js and VariableForErrMsg.js, and variableForBranchCrossing.js file
 */
			
jQuery(document).ready(function($) {
	$('#branch').multiselect({
		search: {
			left: '<input type="text" name="q" class="form-control" placeholder="Search Branches..."  onfocus="showInfo(this,"Select Sub-Region")"/>',
			right: '<input type="text" name="q" class="form-control" placeholder="Search Selected Branches..."  onfocus="showInfo(this,"Select Sub-Region")"/>',
		}
	});
});
jQuery(document).ready(function($) {
	$('#destBranch').multiselect({
		search: {
			left: '<input type="text" name="q" class="form-control" placeholder="Search Destination Branches..." onfocus="showInfo(this,"Select Sub-Region")"/>',
			right: '<input type="text" name="q" class="form-control" placeholder="Search Selected Destination Branches..." onfocus="showInfo(this,"Select Sub-Region")"/>',
		}
	});
});
jQuery(document).ready(function($) {
	$('#crossingBranch').multiselect({
		search: {
			left: '<input type="text" name="q" class="form-control" placeholder="Search Crossing Branches..." />',
			right: '<input type="text" name="q" class="form-control" placeholder="Search Selected Crossing Branches..." />',
		}
	});
});

function resetAllElements() {
	$('#branch').val(0);
	$('#region').val(0);
	$('#subRegion').val(0);
	
	$('#destBranch').val(0);
	$('#destRegion').val(0);
	$('#destSubRegion').val(0);
	
	operationOnSelectTag('branch', 'removeAll', '', '');
	operationOnSelectTag('selectedBranch', 'removeAll', '', '');
	operationOnSelectTag('branch_to', 'removeAll', '', '');
	operationOnSelectTag('destBranch', 'removeAll', '', '');
	operationOnSelectTag('selectedDestBranch', 'removeAll', '', '');
	operationOnSelectTag('destBranch_to', 'removeAll', '', '');
	operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
	
	setValueToHtmlTag('subregionName', '');
	setValueToHtmlTag('destsubregionName', '');
	changeTextFieldColor('branch', '', '', '');
	changeTextFieldColor('branch_to', '', '', '');
	changeTextFieldColor('destBranch', '', '', '');
	changeTextFieldColor('destBranch_to', '', '', '');
	changeTextFieldColor('crossingBranch', '', '', '');
	changeTextFieldColor('crossingBranch_to', '', '', '');
	$("#delete").prop('disabled', true);
	$("#deactivate").prop('disabled', true);
	
	resetCrossingBranches();
}

function resetCrossingBranches() {
	crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft	= getAllOptionValueFromList('crossingBranch');
	
	if(crossingBranchArrFromRight.length > 0) {
		for(var i = 0; i < crossingBranchArrFromRight.length; i++) {
			crossingBranchFromRight		= crossingBranchArrFromRight[i];
			
			selectedBranchName 			= getOptionTextFromList('crossingBranch_to', crossingBranchFromRight);
	
			isCrossingBranchExist		= isValueExistInArray(crossingBranchArrFromLeft, crossingBranchFromRight);
			
			if(!isCrossingBranchExist) {
				operationOnSelectTag('crossingBranch', 'addNew', selectedBranchName, crossingBranchFromRight);
			}
			
			removeOptionValFromList('crossingBranch_to', crossingBranchFromRight);
		}
	}
}

function moveElementFromRightBranchBox() {
	
	if(!ValidateFormElement()) {return false;};
	
	branchArrFromRight	= getAllOptionValueFromList('branch_to');
	branchFromRight		= getValueFromInputField('branch_to');
	
	if(branchArrFromRight.length <= 0) {
		showMessage('info', noBranchFoundToMove);
	} else if(branchFromRight == null && branchArrFromRight.length > 0) {
		showMessage('error', selectBranchesFromRightErrMsg);
		changeTextFieldColor('branch_to', '', '', '#F71616');
	} else {
		changeTextFieldColor('branch_to', '', '', '');
		changeTextFieldColor('crossingBranch_to', '', '', '');
	}
}

function moveElementFromRightDestBranchBox() {
	
	if(!ValidateFormElement()) {return false;};
	
	destbranchArrFromRight	= getAllOptionValueFromList('destBranch_to');
	destbranchFromRight		= getValueFromInputField('destBranch_to');
	
	if(destbranchArrFromRight.length <= 0) {
		showMessage('info', noBranchFoundToMove);
	} else if(destbranchFromRight == null && destbranchArrFromRight.length > 0) {
		showMessage('error', selectBranchesFromRightErrMsg);
		changeTextFieldColor('destBranch_to', '', '', '#F71616');
	} else {
		changeTextFieldColor('destBranch_to', '', '', '');
		changeTextFieldColor('crossingBranch_to', '', '', '');
	}
}

function moveElementFromLeftBranchBox() {

	if(!ValidateFormElement()) {return false;};
	
	branchFromLeft 		= getSeletedValueFromList('branch');
	branchArrFromRight	= getAllOptionValueFromList('branch_to');
	
	if(branchFromLeft == null) {
		showMessage('error', selectBranchesFromLeftErrMsg);
		changeTextFieldColor('branch', '', '', '#F71616');
		return false;
	}
	
	if(branchArrFromRight != null) {
		for(var i = 0; i < branchArrFromRight.length; i++) {
			if(branchFromLeft == branchArrFromRight[i]) {
				removeOptionValFromList('branch_to', branchArrFromRight[i]);
			}
		}
	}
}

function moveElementFromLeftDestinationBranchBox() {

	if(!ValidateFormElement()) {return false;};
	
	destbranchFromLeft 		= getSeletedValueFromList('destBranch');
	destbranchArrFromRight	= getAllOptionValueFromList('destBranch_to');
	
	if(destbranchFromLeft == null) {
		showMessage('error', selectBranchesFromLeftErrMsg);
		changeTextFieldColor('destBranch', '', '', '#F71616');
		return false;
	}
	
	if(destbranchArrFromRight != null) {
		for(var i = 0; i < destbranchArrFromRight.length; i++) {
			if(destbranchFromLeft == destbranchArrFromRight[i]) {
				removeOptionValFromList('destBranch_to', destbranchArrFromRight[i]);
			}
		}
	}
}

function moveAllElementFromLeftBranchBox() {

	if(!ValidateFormElement()) {return false;};

	branchArrFromLeft		= getAllOptionValueFromList('branch');
	branchArrFromRight		= getAllOptionValueFromList('branch_to');

	if(branchArrFromRight != null) {
		for(var i = 0; i < branchArrFromLeft.length; i++) {
			for(var j = 0; j < branchArrFromRight.length; j++) {
				if(branchArrFromRight[j] == branchArrFromLeft[i]) {
					removeOptionValFromList('branch_to', branchArrFromRight[j]);
				}
			}
		}
	}
	getAllValueFromRightCrossingBranch();
	operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
	getCrossingBranchForBranch(branchArrFromLeft);
}

function moveAllElementFromLeftDestBranchBox() {

	if(!ValidateFormElement()) {return false;};
	
	branchArrFromLeft		= getAllOptionValueFromList('branch');
	branchArrFromRight		= getAllOptionValueFromList('branch_to');
	
	destbranchArrFromLeft		= getAllOptionValueFromList('destBranch');
	destbranchArrFromRight		= getAllOptionValueFromList('destBranch_to');

	if(destbranchArrFromRight != null) {
		for(var i = 0; i < destbranchArrFromLeft.length; i++) {
			for(var j = 0; j < destbranchArrFromRight.length; j++) {
				if(destbranchArrFromRight[j] == destbranchArrFromLeft[i]) {
					removeOptionValFromList('destBranch_to', destbranchArrFromRight[j]);
				}
			}
		}
	}
	getAllValueFromRightCrossingBranch();
	operationOnSelectTag('crossingBranch_to', 'removeAll', '', '');
	getCrossingBranchBySourceDestinationSelection(branchArrFromRight,destbranchArrFromLeft);
}


function moveAllElementFromRightBranchBox() {

	if(!ValidateFormElement()) {return false;};
	
	branchArrFromRight	= getAllOptionValueFromList('branch_to');
	branchArrFromLeft	= getAllOptionValueFromList('branch');
	
	if(branchArrFromLeft != null) {
		for(var i = 0; i < branchArrFromRight.length; i++) {
			for(var j = 0; j < branchArrFromLeft.length; j++) {
				if(branchArrFromLeft[j] == branchArrFromRight[i]) {
					removeOptionValFromList('branch', branchArrFromLeft[j]);
				}
			}
		}
		changeTextFieldColor('branch_to', '', '', '');
	}
	getAllValueFromRightCrossingBranch();
	resetSelectedCrossingBranch();
}

function moveAllElementFromRightDestinationBranchBox() {

	if(!ValidateFormElement()) {return false;};
	
	destbranchArrFromRight	= getAllOptionValueFromList('destBranch_to');
	destbranchArrFromLeft	= getAllOptionValueFromList('destBranch');
	
	if(destbranchArrFromLeft != null) {
		for(var i = 0; i < destbranchArrFromRight.length; i++) {
			for(var j = 0; j < destbranchArrFromLeft.length; j++) {
				if(destbranchArrFromLeft[j] == destbranchArrFromRight[i]) {
					removeOptionValFromList('destBranch', destbranchArrFromLeft[j]);
				}
			}
		}
		changeTextFieldColor('destBranch_to', '', '', '');
	}
	getAllValueFromRightCrossingBranch();
	resetSelectedCrossingBranch();
}

function resetSelectedCrossingBranch() {
	document.branchMapForm.selectedCrossingBranch.options.length 			= 0;
	changeTextFieldColor('crossingBranch_to', '', '', '');
}

function moveElementFromLeftCrossingBranch() {
	
	if(!ValidateFormElement()) {return false;};

	branchArrFromRight			= getAllOptionValueFromList('branch_to');
	crossingBranchFromLeft 		= getSeletedValueFromList('crossingBranch');
	crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
	
	if(branchArrFromRight.length <= 0) {
		showMessage('error', selectBranchesFromRightErrMsg);
		changeTextFieldColor('branch_to', '', '', '#F71616');
		return false;
	}
	
	if(crossingBranchFromLeft == null) {
		showMessage('error', selectCrossingBranchesFromLeftErrMsg);
		changeTextFieldColor('crossingBranch', '', '', '#F71616');
		return false;
	}
	
	if(crossingBranchArrFromRight != null) {
		for(var i = 0; i < crossingBranchArrFromRight.length; i++) {
			if(crossingBranchFromLeft == crossingBranchArrFromRight[i]) {
				removeOptionValFromList('crossingBranch_to', crossingBranchArrFromRight[i]);
			}
		}
	}
}

function moveAllElementFromLeftCrossingBranch() {

	if(!ValidateFormElement()) {return false;};
	
	crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft	= getAllOptionValueFromList('crossingBranch');
	
	if(crossingBranchArrFromRight != null) {
		for(var i = 0; i < crossingBranchArrFromRight.length; i++) {
			for(var j = 0; j < crossingBranchArrFromLeft.length; j++) {
				if(crossingBranchArrFromRight[i] == crossingBranchArrFromLeft[j]) {
					removeOptionValFromList('crossingBranch_to', crossingBranchArrFromRight[i]);
				}
			}
		}
	}
}

function moveElementFromRightCrossingBranch() {
	
	if(!ValidateFormElement()) {return false;};

	crossingBranchFromRight 		= getSeletedValueFromList('crossingBranch_to');
	selectedCrossingBranchValue		= getValueFromInputField('crossingBranch_to');
	crossingBranchArrFromRight 		= getAllOptionValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft		= getAllOptionValueFromList('crossingBranch');
	
	if(crossingBranchArrFromRight.length <= 0) {
		showMessage('info', noCrossingBranchFoundToMove);
		changeTextFieldColor('crossingBranch_to', '', '', 'green');
		return false;
	} else if(selectedCrossingBranchValue == null) {
		showMessage('error', selectCrossingBranchesFromRightErrMsg);
		changeTextFieldColor('crossingBranch_to', '', '', '#F71616');
		return false;
	}

	if(crossingBranchArrFromLeft.length > 0) {
		for(var i = 0; i < crossingBranchArrFromLeft.length; i++) {
			
			if(crossingBranchFromRight == crossingBranchArrFromLeft[i]) {
				removeOptionValFromList('crossingBranch', crossingBranchArrFromLeft[i]);
			} 
		}
	}
}

function moveAllElementFromRightCrossingBranch() {
	
	if(!ValidateFormElement()) {return false;};
	
	crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft	= getAllOptionValueFromList('crossingBranch');
	
	if(crossingBranchArrFromRight == null) {
		showMessage('info', noCrossingBranchFoundToMove);
		return false;
	}

	for(var j = 0; j < crossingBranchArrFromRight.length; j++) {
		for(var i = 0; i < crossingBranchArrFromLeft.length; i++) {
			if(crossingBranchArrFromLeft[i] == crossingBranchArrFromRight[j]) {
				removeOptionValFromList('crossingBranch', crossingBranchArrFromLeft[i]);
			}
		}
	}	
	
	branchArrFromRight 	= getAllOptionValueFromList('branch_to');
	
	if(branchArrFromRight.length >= 0) {
		for(var k = 0; k < branchArrFromRight.length; k++) {
			selectedBranchName	= getOptionTextFromList('branch_to', branchArrFromRight[k]);
			operationOnSelectTag('branch', 'addNew', selectedBranchName, branchArrFromRight[k]);
			removeOptionValFromList('branch_to', branchArrFromRight[k]);
		}
	}
	
	changeTextFieldColor('crossingBranch_to', '', '', '');
}

function removeValueFromRightCrossingBranch() {
	
	crossingBranchFromRight 	= getSeletedValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft	= getAllOptionValueFromList('crossingBranch');
	selectedBranchName 			= getSeletedTextFromList('crossingBranch_to');

	ans = confirm(questionToRemoveCrossingBranches);
	
	if (!ans) {
		return false;
	}

	removeOptionValFromList('crossingBranch_to', crossingBranchFromRight);
	
	isCrossingBranchExist		= isValueExistInArray(crossingBranchArrFromLeft, crossingBranchFromRight);
	
	if(!isCrossingBranchExist) {
		operationOnSelectTag('crossingBranch', 'addNew', selectedBranchName, crossingBranchFromRight);
	}
}

function getAllValueFromRightCrossingBranch() {
	crossingBranchArrFromRight	= getAllOptionValueFromList('crossingBranch_to');
	crossingBranchArrFromLeft	= getAllOptionValueFromList('crossingBranch');
	
	if(crossingBranchArrFromLeft.length <= 0) {
		for(var i = 0; i < crossingBranchArrFromRight.length; i++) {
			selectedBranchName 		= getOptionTextFromList('crossingBranch_to', crossingBranchArrFromRight[i]);

			operationOnSelectTag('crossingBranch', 'addNew', selectedBranchName, crossingBranchArrFromRight[i]);
		}
	} else if(crossingBranchArrFromLeft.length > 0) {
		for(var i = 0; i < crossingBranchArrFromRight.length; i++) {
			selectedBranchName 			= getOptionTextFromList('crossingBranch_to', crossingBranchArrFromRight[i]);
			crossingBranchFromRight		= crossingBranchArrFromRight[i];

			isCrossingBranchExist		= isValueExistInArray(crossingBranchArrFromLeft, crossingBranchFromRight);
			
			if(!isCrossingBranchExist) {
				operationOnSelectTag('crossingBranch', 'addNew', selectedBranchName, crossingBranchFromRight);
			}
		}
	}
}

function ValidateFormElement(){
	
	if(document.getElementById('region') != null) {
		if(!region('region')) return false;
	}
	
	if(document.getElementById('subRegion') != null) {
		if(!subRegion('subRegion')) return false;
	}
	
	if(sourceDestinationWiseCrossingMap == true || sourceDestinationWiseCrossingMap == 'true'){	
		if(document.getElementById('destRegion') != null) {
			if(!region('destRegion')) return false;
		}

		if(!showMergedGroupInRegionSelection || (showMergedGroupInRegionSelection && !isOtherGroupSelected)) {
			if(document.getElementById('destSubRegion') != null) {
				if(!subRegion('destSubRegion')) return false;
			}
		}
	}
	
	return true;
}