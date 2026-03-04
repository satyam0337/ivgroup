function initializeBranchAutoComplete () {
	
	$("#Branch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=27&branchType=3",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id!=0){
				setBranchId (ui.item.id.split("_")[0]);
			} else {
	 				setLogoutIfEmpty(ui);
				}
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
	});
	
}

function setBranchId (branchId) {
	
	if(document.getElementById('branchId'))
		document.getElementById('branchId').value = branchId.trim();
}

function resetBranch () {
	
	if(document.getElementById('Branch'))
		document.getElementById('Branch').value = '';

	if(document.getElementById('branchId'))
		document.getElementById('branchId').value = 0;
	
}