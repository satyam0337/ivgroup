function reverseEffectOfLoadingCompleted(routeBranchId, lorryHireId, nextRouteBranchId){
	showLayer();
	let jsonObject		= new Object();
	jsonObject.routeBranchId		= routeBranchId;
	jsonObject.lorryHireId			= lorryHireId;
	jsonObject.nextRouteBranchId 	= nextRouteBranchId;
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/vehicleLoadingCompletedWS/loadingUncompleted.do',
		data		:	jsonObject,
		dataType	: 	'json',
		
		success		: 	function(data) {
			if(data.message != undefined && data.message.typeName == "success") {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				showSummary("showSummaryBtn_1");
				return;
			} else if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
		}
	});
}