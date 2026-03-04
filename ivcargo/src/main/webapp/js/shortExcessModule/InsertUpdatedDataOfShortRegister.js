/**
 * @author Anant Chaudhary	16-11-2015
 */

function updateShortRegister() {
	
	if(!shortReceiveFormValidation()) {return false;};
	
	var jsonObject = new Object();
	var jsonObjectData;
	
	jsonObjectData = new Object();
	
	jsonObjectData.LRNumber 				= $("#shortLrNumber").val();
	jsonObjectData.WayBillId				= $("#shortWayBillId").val();
	jsonObjectData.LSNumber					= $("#shortLsNumber").val();
	jsonObjectData.DispatchLedgerId 		= $("#shortDispatchLedgerId").val();
	jsonObjectData.TruckNumber 				= $("#truckNumber").val();
	jsonObjectData.TURNumber				= $("#shortTurNumber").val();
	jsonObjectData.ActUnloadWeight			= $("#actUnloadWeight").val();
	jsonObjectData.PrivateMark				= $("#shortPrivateMark").val();
	jsonObjectData.ShortWeight				= $("#shortWeight").val();
	jsonObjectData.Amount					= $("#amount").val();
	jsonObjectData.Remark					= $("#shortRemark").val();
	
	jsonObjectData.ShortReceiveId			= $("#shortReceiveId").val();
	jsonObjectData.ShortArtId				= $("#shortArtId").val();
	jsonObjectData.PackingTypeMasterId		= $("#packingTypeId").val();
	jsonObjectData.TotalArticle				= $("#totalArticle").val();
	jsonObjectData.ShortArticle				= $("#shortArticle_1").val();
	jsonObjectData.DamageArticle			= $("#damageArticle_1").val();
	jsonObjectData.SaidToContain			= $("#saidToContain").val();
	
	jsonObject = jsonObjectData;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	
	$.getJSON("UpdateShortReceiveData.do?pageId=330&eventId=14", 
			{json:jsonStr}, function(data) {
		
		if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
			showMessage('error', data.errorDescription);
		} else {
			showMessage('success', '<i class="fa fa-check"></i> Short Register Detail successfully Updated!');
			closeJqueryDialog('dialogShortForm');
		}
	});
}
