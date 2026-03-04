/**
 * @Author	Shailesh Khandare  19-01-2016
 */


/**
 *Insert into Damage settlement
 */
function insertDamageSettlementData() {
	if(!damageSettlementFormValidation()) {return false;};
	
	var jsonObjectData = new Object();
	
	var row		= document.getElementById("getDamageValue");
	
	var damagesArticles 	= row.rows[0].cells[2].innerHTML;
	jsonObjectData.DamageSettleStatus	= DAMAGE_SETTLED;
	jsonObjectData.DamgeNumber 			= $("#damageReceiveId").val();
	jsonObjectData.WayBillNumber		= $("#lrNumber1").val();
	jsonObjectData.WayBillId			= $("#wayBillId").val();
	jsonObjectData.SettleType			= $("#damageSettleType").val();
	
	if($("#damageSettleType").val() == SETTLE_WITH_CLAIM) {
		jsonObjectData.ClaimNumber 		= $(".claimNumber").val();
		jsonObjectData.ClaimRemark 		= $(".claimRemark").val();
	} else if($("#damageSettleType").val() == SETTLE_WITH_NOCLAIM) {
		jsonObjectData.RemarkWitoutClaim = $("#remarkWitoutClaim").val();
	}
	
	var jsonStr = JSON.stringify(jsonObjectData);
	
	console.log(jsonStr);
	
	$.confirm({
		text: "Are you sure you want to do Damage Settlement ?",
		confirm: function() {
			$.getJSON("SaveDamageSettlementDataAction.do?pageId=331&eventId=10", 
					{json:jsonStr}, function(data) {
				
						if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							showMessage('error', data.errorDescription);
						} else {
							showMessage('success', damageSettlementDoneSuccessMsg);
							
							refreshAndHidePartOfPage('mainContent-top', 'refresh');
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							refreshAndHidePartOfPage('pendingShortSettlement-bottom', 'refresh');
							
							closeJqueryDialog('dialogDamageForm');
							
						}
			});
		},
		cancel: function() {
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}