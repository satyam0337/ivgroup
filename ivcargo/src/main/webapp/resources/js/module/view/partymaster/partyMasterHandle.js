$('#partyMasterTab a').click(function(e) {
	e.preventDefault();
	$(this).tab('show');
});

$(function() {
	$('#partyMasterTab a:first').tab('show');
});

function resetAutcomplete(jsonArray) {
	for ( var eleId in jsonArray) {
		var elem = $(jsonArray[eleId]).getInstance();
		$(elem).each(function() {
			var elemObj = this.elem.combo_input;
			$(elemObj).each(function() {
				$("#" + $(this).attr("id")).val('');
				$("#" + $(this).attr("id") + '_primary_key').val("");
			})
		})
	}
}