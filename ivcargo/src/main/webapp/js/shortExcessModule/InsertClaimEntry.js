/**
 * @Author	Anant Chaudhary	14-10-2015
 */

function insertClaimEntry() {
	
	if(!claimEntryFormValidation()) {return false;};

	ans = confirm("Are you sure you want to save claim entry ?");
	
	if (!ans) {
		return false;
	}
	
	var jsonObjectData = new Object();
	
	jsonObjectData.LRNumber		= $("#lrNumber").val();
	jsonObjectData.WayBillId	= $("#wayBillId").val();
	jsonObjectData.PartyId		= $("#partyMasterId").val();
	jsonObjectData.LounchBy		= $("#lounchBy").val();
	jsonObjectData.ClaimAmount	= $("#claimAmount").val();
	jsonObjectData.ClaimPerson	= $("#claimPerson").val();
	jsonObjectData.Remark		= $("#remark").val();
	jsonObjectData.ClaimType	= $("#claimType").val();
	
	var jsonStr	= JSON.stringify(jsonObjectData);

	$.getJSON("SaveClaimEntryData.do?pageId=334&eventId=2", 
			{json:jsonStr}, function(data) {
				
		if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
			showMessage('error', data.errorDescription);
		} else {
			showMessage('success', claimDoneSuccessMsg(data.claimEntryId));
			refreshAndHidePartOfPage('claim_entry_module', 'refresh');
			//please include ResetInputFieldValue.js file to work this function
			resetInputFieldData();
		}
	});
}