function validateSubRegion() {
	
	var subRegionId = $("#subRegion").val();
	if(subRegionId <=0){
		
		showMessage('error',branchNameErrMsg);
		toogleElement('error','block');
		changeError1('subRegion','0','0');
		$("#subRegion").focus(); 
		return false;
	}
	
}