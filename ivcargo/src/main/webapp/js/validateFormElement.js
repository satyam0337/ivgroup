function ValidateFormElement(){
	
	if(document.getElementById('region') != null) {
		if(!region('region')) return false;
	}
	
	if(document.getElementById('subRegion') != null) {
		if(!subRegion('subRegion')) return false;
	}
	
	if(document.getElementById('branch') != null) {
		if(!branchName(6, 'branch')) return false;
	}
	
	return true;
}