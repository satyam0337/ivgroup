/**
 *  @Author		Anant Chaudhary		14-11-2015
 */

function findShortReceiveDetails() {
	var shortNumber	= document.getElementById('shortNumber');
	
	var jsonObject 	= new Object();
	var jsonObjectOut;
	
	jsonObjectOut = new Object();
	
	jsonObjectOut.ShortNumber	= shortNumber;
	
	jsonObject	= jsonObjectOut;
	
	var jsonStr	= JSON.stringify(jsonObject);
	//alert(jsonStr);
	
	$.getJSON("findShortReceiveDetails.do?pageId=333&eventId=1", 
			{json:jsonStr}, function(data) {
		
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					alert(data.errorDescription);
					hideLayer();
				} else {
					
				}
			});
}