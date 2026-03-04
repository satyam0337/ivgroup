

function printTUR(lsId) {

	var pageId				= document.getElementById('pageIdForPrint').value;
	var eventId				= document.getElementById('eventIdForPrint').value;
	var receivedLedgerId	= document.getElementById('TUR_' + lsId).value;
	var dispatchLedgerId	= document.getElementById('LS_' + lsId).value;

	childwin = window.open ('TURPrint.do?pageId='+pageId+'&eventId='+eventId+'&receivedLedgerId='+receivedLedgerId+'&dispatchLedgerId='+dispatchLedgerId,'newwindow',config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function resetError(el){
	toogleElement('basicError','none');
	toogleElement('msg','none');
	removeError(el.id);
}

function disableButtons() {
	 var findButton = document.getElementById("findButton");
	 if(findButton != null) {
		 findButton.disabled = true;
		 findButton.style.display = 'none';
	 };
}

function vehicleNumberAutocomplete() {
	
	$("#vehicleNumber").autocomplete({
		source: "AutoCompleteAjaxAction.do?pageId=9&eventId=13&filter=31&responseFilter="+1+"&routeTypeId="+VehicleNumberMasterConstant.ROUTE_TYPE_ROUTING_AND_BOTH,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#vehicleNumberId').val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function resetReceivableDetails() {
	setValueToTextField('vehicleNumberId', 0);
	$('#results tbody').remove();
	$('#resultsSummaryOfTotal tbody').remove();
	changeDisplayProperty('bottom-border-boxshadow', 'none');
	changeDisplayProperty('middle-border-boxshadow', 'none');
}