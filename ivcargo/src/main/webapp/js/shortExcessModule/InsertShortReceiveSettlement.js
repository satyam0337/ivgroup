/**
 * @Author	Anant Chaudhary	13-10-2015
 * @Modified Shailesh Khandare
 */

function insertShortSettlementData() {
	var shortCheckVal	= null;

	if(document.getElementById('shortArticleSettle') != null)
		shortCheckVal	= document.getElementById('shortArticleSettle').checked;

	if(!selectCheckBox(shortCheckVal)) {return false;};
	if(!shortSettlementFormValidation()) {return false;};

	var excessNumArray		= null;

	var jsonObjectData = null;

	jsonObjectData = new Object();

	var settleType			= $("#shortSettleType").val();

	jsonObjectData.ShortSettleStatus	= SHORT_SETTLED;

	var count	= 0;
	jsonObjectData.ShortNumber 			= $("#shortReceiveId1").val();
	jsonObjectData.WayBillNumber		= $("#lrNumber1").val();
	jsonObjectData.WayBillId			= $("#wayBillId1").val();
	jsonObjectData.ShortArticle			= $("#shortArticle1").val();
	jsonObjectData.PendingArticle		= $("#pendingArticle1").val();
	jsonObjectData.SettleType			= $("#shortSettleType").val();
	jsonObjectData.ArticleTypeMasterId 	= $("#packingTypeMasterId_1").val();
	jsonObjectData.ShortNumArray		= shortNumArray;
	jsonObjectData.FlagForShort			= flagForShort;

	if(settleType == SETTLE_WITH_EXCESS) {		//Include CommonVariable.js file

		excessNumArray	= new Array();

		count	= $("#excessDetails tr").length;

		for(var i = 0; i < count; i++) {
			var excessData = new Object();

			excessData.ExcessNumber		= $("#excessNumber_" + (i + 1)).val();
			excessData.ExcessArticle	= $("#excessArticle_" + (i + 1)).val();
			excessData.ExcessWeight		= $("#excessWeight_" + (i + 1)).val();
			excessData.Remark			= $("#remark_" + (i + 1)).val();
			excessData.BranchId			= $("#excessBranchId_" + (i + 1)).val();

			excessNumArray.push(excessData);
		}

		jsonObjectData.ExcessNumArray	= excessNumArray;

	} else if(settleType == SETTLE_WITH_CLAIM) {
		jsonObjectData.ClaimNumber = $("#claimNumber").val();
		jsonObjectData.ClaimRemark = $("#claimRemark").val();
	} else if(settleType == SETTLE_WITH_NOCLAIM) {
		jsonObjectData.RemarkWitoutClaim = $("#remarkWitoutClaim").val();
	}
	
	var jsonStr = JSON.stringify(jsonObjectData);
	//alert(jsonStr);
	$.confirm({
		text: "Are you sure you want to do Short Settlement ?",
		confirm: function() {
			showLayer();
			
			$.getJSON("SaveShortSettlementData.do?pageId=331&eventId=3", 
					{json:jsonStr}, function(data) {
						if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							showMessage('error', data.errorDescription);
						} else {
							showMessage('success', shortSettlementDoneSuccessMsg);

							refreshAndHidePartOfPage('mainContent-top', 'refresh');
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							refreshAndHidePartOfPage('pendingShortSettlement-bottom', 'refresh');
							
							if(shortReceiveSettlementConfig != null) {
								if(shortReceiveSettlementConfig.searchByLRNo == 'false')
									$("#searchByLrNo").css("display", "none");
			
								if(shortReceiveSettlementConfig.searchByShortNumber == 'false')
									$("#searchByShortNo").css("display", "none");
							}

							closeJqueryDialog('dialogShortForm');

						}
						
						hideLayer();
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