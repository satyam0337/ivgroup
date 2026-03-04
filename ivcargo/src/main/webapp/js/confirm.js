function showDialogBox(overlay, dialog) {
ShowDialog(false, overlay, dialog);
}

function ShowDialog(modal, overlay, dialog) {
$("#"+overlay).show();
   $("#"+dialog).fadeIn(300);

   if (modal) {
    $("#"+overlay).unbind("click");
   }
   
}

function HideDialog(overlay, dialog) {
$("#"+overlay).hide();
   $("#"+dialog).fadeOut(300);
}

var urlForNewModule = null;

function trialForGenericPage( url, targetDate, msg){
	$(document).keyup(function(evt) {
	    if (evt.keyCode == 13) {
	    	continueWithOldVersion();
	    }
	});	
		var  currentDate 	=  new Date();
		var  setTargetDate 	=  new Date(targetDate);
		var  curr_Date		=  currentDate.toLocaleDateString();
		var curr_Date_arr 	= 	curr_Date.split("/");
		var targetDate_arr	= 	targetDate.split("/");
		urlForNewModule		= url;
		
		var timeDiff = Math.abs(setTargetDate.getTime() - currentDate.getTime());
		var diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))); 
		var msg_arr	= msg.split(",");
		if( (parseInt(targetDate_arr[0]) >= parseInt(curr_Date_arr[0])) && (parseInt(targetDate_arr[1]) >= parseInt(curr_Date_arr[1])) && (parseInt(targetDate_arr[2]) >= parseInt(curr_Date_arr[2]) ))
			{
				$('#web_dialog_message1').text(msg_arr[0]+"\t '"+targetDate+"' \t "+msg_arr[1]);
				$('#web_dialog_message2').text(msg_arr[2]+"\t"+diffDays+"\t"+msg_arr[3]);
				showDialogBox('overlaySettle', 'dialogSettle');
			}else{
			window.location= url;
			}
}

function tryNewVersion(){
	 window.location= urlForNewModule;
}

function continueWithOldVersion(){
	HideDialog('overlaySettle', 'dialogSettle');
}