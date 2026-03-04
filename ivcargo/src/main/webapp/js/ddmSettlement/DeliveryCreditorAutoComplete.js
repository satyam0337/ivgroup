function initializeCreditorAutoComplete(wbId) {
	//CORPORATEACCOUNT_TYPE_DELIVERY defined golbally in main page of js
	$("#deliveryCreditor_"+wbId).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType="+CORPORATEACCOUNT_TYPE_DELIVERY + "&billing=" + CORPORATEACCOUNT_TYPE_BILLING,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id!=0){
				setCreditorId (ui.item.id, wbId);
			} else {
				setLogoutIfEmpty(ui);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});

}

function setCreditorId (creditorId, wbId) {

	if(document.getElementById('selectedDeliveryCreditorId_'+wbId))
		document.getElementById('selectedDeliveryCreditorId_'+wbId).value = creditorId;
}

function resetCreditor (ele) {

	if(document.getElementById('selectedDeliveryCreditorId_'+ele.id.split("_")[1]))
		document.getElementById('selectedDeliveryCreditorId_'+ele.id.split("_")[1]).value = 0;

}