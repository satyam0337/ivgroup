/**
 *  @author Anant Chaudhary	16-11-2015
 */

function updateExcessRegister() {
	
	if(!validateUpdateExcessForm()) {return false;};
	
	var jsonObjectData = new Object();
	
	jsonObjectData.excessReceiveId		= $("#excessReceiveId").val();
	jsonObjectData.wayBillNumber 		= $("#excessLRNumber").val();
	jsonObjectData.waybillId			= $("#excessWayBillId").val();
	jsonObjectData.lsNumber				= $("#excessLSNumber").val();;
	jsonObjectData.dispatchLedgerId		= $("#excessDispatchLedgerId").val();
	jsonObjectData.TURNumber			= $("#turNumber").val();
	jsonObjectData.privateMark			= $("#privateMark").val();
	jsonObjectData.ExcessArticle		= $("#excessArticle").val();
	jsonObjectData.packingTypeMasterId	= $("#packingTypeMasterId").val();
	jsonObjectData.ExcessWeight			= $("#excessWeight").val();
	jsonObjectData.saidtoContain		= $("#saidToContain").val();
	jsonObjectData.remark				= $("#excessRemark").val();
	
	$.confirm({
		text: "Are you sure want to update excess entry ?",
		confirm: function() {
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/excessReceiveWS/updateExcessReceiveData.do',
				data		:	jsonObjectData,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if(errorMessage.typeName == 'success') {
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							$('#excessNumber').val('');
						}
						
						hideLayer();
						return;
					}
					hideLayer();
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
