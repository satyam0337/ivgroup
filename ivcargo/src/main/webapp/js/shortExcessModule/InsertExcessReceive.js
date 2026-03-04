/**
 * @author Anant Chaudhary	13-10-2015
 */
var doneTheStuff = false;
function insertExcessReceive() {
	
	if(!excessReceiveFormValidation()) {return false;};
	
	var jsonObjectData = new Object();
	
	jsonObjectData.wayBillNumber 		= $('#excessLRNumber').val();
	jsonObjectData.wayBillId			= $('#excessWayBillId').val();
	jsonObjectData.lsNumber				= $('#excessLSNumber').val();
	jsonObjectData.dispatchLedgerId 	= $('#excessDispatchLedgerId').val();
	jsonObjectData.turNumber			= $('#turNumber').val();
	jsonObjectData.privateMark			= $('#privateMark').val();
	jsonObjectData.packingTypeMasterId	= $('#packingTypeMasterId').val();
	jsonObjectData.saidToContain		= $('#saidToContain').val();
	jsonObjectData.excessArticle		= $('#excessArticle').val();
	jsonObjectData.weight				= $('#excessWeight').val();
	jsonObjectData.remark				= $('#excessRemark').val();
	
	if(!doneTheStuff) {
		doneTheStuff = true;
		changeDisplayProperty('saveExcessButton', 'none');
	$.confirm({
		text: "Are you sure you want to save Excess LR entry ?",
		confirm: function() {
		doneTheStuff = false;
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/excessReceiveWS/saveExcessReceiveData.do',
				data		:	jsonObjectData,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if(errorMessage.typeName == 'success') {
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
							
							setTimeout(() => {
								resetInputFieldData();
							}, 200);
						}
						
						hideLayer();
						return;
					}
					hideLayer();
				}
			});
		},
		cancel: function() {
			doneTheStuff = false;
			changeDisplayProperty('saveExcessButton', 'block');
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
	}
}
