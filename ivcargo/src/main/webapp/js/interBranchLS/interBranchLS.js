/**
 * Author - Ashish Tiwari
 **/

function getSourceDestinationWiseLSSequenceCounter() {

	showLayer();
	var jsonObject			= new Object();
	var destinationId		= $('#DestinationBranchId').val().split('_');

	jsonObject["truckDestinationId"] 		= destinationId[0];
	console.log(jsonObject);
	$.ajax({
		url: WEB_SERVICE_URL+'/dispatchWs/getSourceDestinationWiseLSSequenceCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
			} 
			hideLayer();
		}
	});
}