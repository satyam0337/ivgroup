/**
 * @author Anant Chaudhary	28-11-2015
 */

function deleteShortDetails(shortNumber) {
	
	var jsonObject 	= new Object();
	var jsonObjectOut;

	jsonObjectOut = new Object();

	jsonObjectOut.ShortNumber	= shortNumber;

	jsonObject	= jsonObjectOut;

	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);

	$.getJSON("deleteShortRegisterDetails.do?pageId=330&eventId=17", 
			{json:jsonStr} , function(data) {

				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					//alert(data.errorDescription);
					showMessage('error', '<i class="fa fa-times-circle"></i> '+data.errorDescription);
				} else {
					if(data.isSuccess) {
						showMessage('success', shortDeletedDone(data.shortNumber));
						setTimeout(function(){window.location.reload(1);}, 1000);
					}
				}
			});
}

function deleteExcessDetails(excessNumber) {
	
	var jsonObject 	= new Object();
	var jsonObjectOut;

	jsonObjectOut = new Object();

	jsonObjectOut.ExcessNumber	= excessNumber;

	jsonObject	= jsonObjectOut;

	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);

	$.getJSON("deleteExcessRegisterDetails.do?pageId=330&eventId=18", 
			{json:jsonStr} , function(data) {

				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					//alert(data.errorDescription);
					showMessage('error', '<i class="fa fa-times-circle"></i> '+data.errorDescription);
				} else {
					if(data.isSuccess) {
						showMessage('success', excessDeletedDone(data.excessNumber));
						setTimeout(function(){window.location.reload(1);}, 1000);
					}
				}
			});
}