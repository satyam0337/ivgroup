function showDialogBox(overlay, dialog) {
	 ShowDialog(false, overlay, dialog);
}

function ShowDialog(modal, overlay, dialog) {
	$("#"+overlay).show();
    $("#"+dialog).fadeIn(300);

    if (modal) {
    	$("#"+overlay).unbind("click");
    }
    
    else {
        $("#"+overlay).click(function (e) {
            HideDialog(overlay, dialog);
        });
    }
}

function HideDialog(overlay, dialog) {
	$("#"+overlay).hide();
    $("#"+dialog).fadeOut(300);
}