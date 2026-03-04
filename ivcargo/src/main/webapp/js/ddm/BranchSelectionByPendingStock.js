function populateSubRegionBranches(subRegionId, targetId, allReqd){
	var target = document.getElementById(targetId);
	
	if(subRegionId > 0){
		var x = 0;
		target.options.length=1;
		target.options[0].text= (allReqd)?' ALL ':'---- Select Area ----';
		target.options[0].value=(allReqd)? -1 : 0;
		if(strDestBranchList!=null){
			var destBranchList = new Array();
			var subRegionBranchList = new Array();
			destBranchList = strDestBranchList.split(";");
			
			for (var i=0; i<destBranchList.length;i++){
				var idValuePair = new Array();
				idValuePair = destBranchList[i].split("=");
				for (var j=0; j<idValuePair.length;j=j+2){
					var ids = new Array();
					ids = idValuePair[j].split("_");
					var branchSubRegionId = ids[0];
					//alert('BranchSubRegionId '+branchSubRegionId+" _ SubRegionId "+subRegionId);
					if(branchSubRegionId==subRegionId){
						subRegionBranchList[x]=idValuePair;
						x++;
					}
				}
			}
			
			if(subRegionBranchList.length==1){
				target.options.length=subRegionBranchList.length;
				var idValuePair = subRegionBranchList[0];
				target.options[0].value=idValuePair[0];
				target.options[0].textContent=idValuePair[1];
			}else {
				//target.options.length=(allReqd)?subRegionBranchList.length+1:subRegionBranchList.length;
				target.options.length=subRegionBranchList.length+1;
				for (var k=0; k<subRegionBranchList.length;k++){
					var idValuePair = subRegionBranchList[k];
					target.options[k+1].value=idValuePair[0];
					target.options[k+1].textContent=idValuePair[1];
				}
			}
		} else {
			alert('Drop Point / Area not Found!');
		}
		
	} else {
		target.options.length=1;
		target.options[0].text= (allReqd)?' ALL ':'---- Select Area ----';
		target.options[0].value=0;
	}
}

function resetBranchSelectionByPendingStock () {
	
	if(document.getElementById('destinationSubRegionId'))
		document.getElementById('destinationSubRegionId').value = 0;

	if(document.getElementById('destBranchId'))
		document.getElementById('destBranchId').value = 0;
	
}