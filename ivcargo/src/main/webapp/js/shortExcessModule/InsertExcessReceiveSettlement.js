/**
 * @Author	Anant Chaudhary	13-10-2015
 */

function insertExcessSettlementData() {
	
	if(!excessSettlementFormValidation()) {return false;};

	var tableId 			= document.getElementById("excessArtDetailsForExcessSettle");
	var pendingExcess 		= tableId.rows[1].cells[3].innerHTML;
	
	var settleType			= $("#excessSettleType").val();
	
	var shortArtArray		= null;

	var jsonObjectData = null;
	
	jsonObjectData = new Object();
	
	jsonObjectData.ExcessReceiveId 		= $("#excessReceiveId").val();
	jsonObjectData.WayBillNumber 		= $("#lrNumber").val();
	jsonObjectData.WayBillId 			= $("#wayBillId").val();
	jsonObjectData.ArticleTypeMasterId 	= $("#articleTypeMasterId").val();
	jsonObjectData.SettleType			= settleType;
	jsonObjectData.PendingExcess		= pendingExcess;
		
	if(settleType == SETTLE_WITH_SHORT) {

		var count	= $("#articleDetailsId tr").length;

		shortArtArray	= new Array();
		
		for(var i = 0; i < count; i++) {
			if($('#select_' + (i + 1)).is(':checked')) {
				var articleData = new Object();
			
				articleData.ShortNumber		= $("#shortNumber_" + (i + 1)).val();
				articleData.ShortArticle	= $("#shortArticle_" + (i + 1)).val();
				articleData.DamageArticle	= $("#damageArticle_" + (i + 1)).val();
				articleData.ShortWeight		= $("#shortWeight_" + (i + 1)).val();
				articleData.Remark			= $("#remark_" + (i + 1)).val();

				shortArtArray.push(articleData);
			}
		}
		jsonObjectData.ShortArtArray	= shortArtArray;
		
	}  else if(settleType == SETTLE_WITH_FOCLR) {
		
		jsonObjectData.NewLRNumber	= $("#newLRNumber").val();
		jsonObjectData.FocWayBillId	= $("#focWayBillId").val();
		jsonObjectData.FOCRemark	= $("#focRemark").val();
		
	} else if(settleType == SETTLE_WITH_UGD) {
		
		jsonObjectData.UGDRemark	= $("#ugdRemark").val();
		
	}	
	
	var jsonStr = JSON.stringify(jsonObjectData);
	//alert(jsonStr);
	
	$.confirm({
		text: "Are you sure you want to do Excess Settlement ?",
		confirm: function() {
			showLayer();
			$.getJSON("SaveExcessSettlementData.do?pageId=331&eventId=4", 
					{json:jsonStr}, function(data) {
				
					if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
					} else {
						showMessage('success', excessSettlementDoneSuccessMsg);
						
						if(document.getElementById('excessNumber') != null) {
							document.getElementById('excessNumber').value	= '';
						}
						
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
						refreshAndHidePartOfPage('pendingExcessSettlement-bottom', 'refresh');
						resetInputFieldData();
						closeJqueryDialog('dialogExcessForm');
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