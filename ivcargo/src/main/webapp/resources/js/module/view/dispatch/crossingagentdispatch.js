/**
 * 
 */

function showHideCrosiingFeilds() {
	let agentChkBx = document.getElementById('isAgentCrossing');
	
	if(agentChkBx.checked) {
		changeDisplayProperty('CrossingElementDiv', 'block');
		
		if(lsPropertyConfig.showBillSelectionOnCrossingAgent) {	
			changeDisplayProperty('ElementDiv', 'block');
			$('#SearchRegion').addClass("hide");
		} else {
			changeDisplayProperty('ElementDiv', 'none');
		}
	} else {
		changeDisplayProperty('CrossingElementDiv', 'none');
		changeDisplayProperty('ElementDiv', 'block');
		$('#SearchRegion').removeClass("hide");
		$('#crossingAgentSelectEle_primary_key').val('');
		$('#crossingAgentSelectEle').val('');
		$('#destinationAreaEle_primary_key').val('');
		$('#destinationAreaEle').val('');
	}
}

function calcToatal(obj) {
	console.log(obj.value);
}