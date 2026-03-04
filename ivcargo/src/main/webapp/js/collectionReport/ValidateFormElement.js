/**
 * @Author Anant Chaudhary	03-02-2016
 */

function ValidateFormElement(){

	if(!validateInput(1, 'TosubRegion', 'TosubRegion', 'packageError', subRegionNameErrMsg)) {
		return false;
	}
	
	if(!validateInput(1, 'SelectDestBranch', 'SelectDestBranch', 'packageError', branchNameErrMsg)) {
		return false;
	}
	
	if(!validateInputWithSelectedText('Executive', 'No Executive', 'Executive', 'packageError', executiveNotAvailableInfoMsg)) {
		return false;
	}
	
	if(!validateInput(1, 'Executive', 'Executive', 'packageError', executiveNameErrMsg)) {
		return false;
	}

	return true;
}