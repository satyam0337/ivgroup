function showPopupForNextLRNumber(){
	
	if(showLRNumberPopup) {
		$("#validateNextLRNumberModel").modal({
			backdrop: 'static',
			keyboard: false
		});
		
		$("#minAndMaxRangeMsg").html("Enter Number in " + jsondata.MinRange + " - " + jsondata.MaxRange + " Range")
	}
}

function validateLRNumber(){
	if(!validateWithinRange()) { return false; }
	
	var jsonObject	= new Object();
	
	if(confirm('Are you sure you want add this LR Number ?')) {
		
		if($("#nextLRNumber").val() != jsondata.NextWaybillNumber){
			
			jsonObject["blockedLRNumber"]	= $("#nextLRNumber").val();
		
			$.ajax({
				url: WEB_SERVICE_URL+'/lrSequenceCounterWS/insertBlockedLRNumber.do',
				type: "POST",
				dataType: 'json',
				data:jsonObject,
				success: function(data) {
					$('#validateNextLRNumberModel').modal('toggle');
					$('#consignorCorpId').focus();
			
					setTimeout(function() {
						sweetAlert({
				    		 title: "Booking Blocked",
				    		 text: "Your Booking has been Blocked, Contact Admin! . " + data.message.description,
				    		 icon: "info",
				    		 allowOutsideClick: false,
							 allowEscapeKey: false,
				    		 showConfirmButton: false,
				    	});
					}, 200);
				}
			});
		} else {
			$('#validateNextLRNumberModel').modal('toggle');
			
			jsonObject.filter				= 9;
			jsonObject.showLRNumberPopup	= false;
			
			var jsonStr = JSON.stringify(jsonObject);
			
			$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13", {json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
				}
			});
		}
	}
}

function validateWithinRange(){
	if(!validateInputTextFeild(1, 'nextLRNumber', 'nextLRNumber', 'error', 'Enter Next LR Number')) {
		return false;
	}
	
	if($("#nextLRNumber").val() < jsondata.MinRange || $("#nextLRNumber").val() > jsondata.MaxRange){
		showMessage('error', iconForErrMsg + 'Enter Number Within Range ! ');
		return false;
	}
	
	return true;
}