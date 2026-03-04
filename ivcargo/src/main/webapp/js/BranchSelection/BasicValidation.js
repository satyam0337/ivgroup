function validateSelection () {
	
	if(document.getElementById("region")) {
		if(!validateInput(1, "region", "region", 1,  regionNameErrMsg))
			return;
	}
	
	if(document.getElementById("subRegion")) {
		if(!validateInput(1, "subRegion", "subRegion", 1,  subRegionNameErrMsg))
			return;
	}

	if(document.getElementById("branch")) {
		if(!validateInput(1, "branch", "branch", 1, branchNameErrMsg))
			return;
	}
		
	/*if(document.getElementById("locationId")) {
		if(!validateInput(1, "locationId", "locationId", 1,  "Please, Select Destination !! "))
			return;
	}*/
		
	if(document.getElementById("destinationSubRegionId")) {
		if(!validateInput(1, "destinationSubRegionId", "destinationSubRegionId", 1,  areaSelectErrMsg))
			return;
	}
	
	if(document.getElementById("DeliveryFor")) {
		if(!validateInput(1, "DeliveryFor", "DeliveryFor", 1,  deliveryForErrMsg))
			return;
	}

	if(document.getElementById("billSelection")) {
		if(!validateInput(1, "billSelection", "billSelection", 1,  billSelectionErrMsg))
			return;
	}
	
	if(document.getElementById("divisionSelection") && !validateInput(1, "divisionSelection", "divisionSelection", 1,  divisionSelectionErrMsg))
		return;
	
	// override this method in your code for futher flow
	getData();
}

function resetRegion() {
	
	if(document.getElementById('region'))
		document.getElementById('region').value = 0;
	
}

function resetSubRegion() {
	
	if(document.getElementById('subRegion'))
		document.getElementById('subRegion').value = 0;
	
}

function resetBranchSelection() {

	if(document.getElementById("region"))
		resetRegion();
	
	if(document.getElementById("subRegion"))
		resetSubRegion();
	
	if(document.getElementById("branch"))
		resetBranch();
	
	if(document.getElementById("locationId"))
		resetDestination();
	
}