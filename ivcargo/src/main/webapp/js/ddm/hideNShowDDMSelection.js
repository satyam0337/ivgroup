function hideNShowDDMSelection(){
	console.log('hideNShowDDMSelection',$( "#searchBy" ).val())
	
	var searchBy = Number($( "#searchBy" ).val());
	$('#lrDetailsTableDiv').removeClass('show');
	$('#lrDetailsTableDiv').addClass('hide');
	$('#summaryTable').children().empty();
	$('#lrDetailsTable').children().empty();
	if(searchBy == 1){
		$('#lrSearch').removeClass('hide');
		$('#lrNoTable').removeClass('hide');
		$('#searchButtonDiv').addClass('hide');
		$('#multipleLR').addClass('hide');
		$('#deliveryForDiv').addClass('hide');
		
		
	} else if (searchBy == 2){
		$('#multipleLR').removeClass('hide');
		$('#searchButtonDiv').removeClass('hide');
		$('#deliveryForDiv').removeClass('hide');
		$('#lrSearch').addClass('hide');
		$('#lrNoTable').addClass('hide');
		$('#summaryDiv').addClass('hide');
		$('#middle-border-boxshadow').addClass('hide');
	}
}