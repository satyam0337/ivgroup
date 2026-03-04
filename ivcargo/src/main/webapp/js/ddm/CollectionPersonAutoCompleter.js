function initilizeCollectionPersonAutoComplete() {
	setSearchCollectionPersonAutoComplete();
}

function setSearchCollectionPersonAutoComplete() {
	var branchId 		= $('#branch').val();
	
	$("#collectionPersonName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter=",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#collectionPersonId").val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}