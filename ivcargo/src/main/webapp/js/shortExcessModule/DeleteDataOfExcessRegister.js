/**
 *  @author Anant Chaudhary	16-11-2015
 */

function deleteExcessRegister() {
	
	var jsonObjectData = new Object();
	
	jsonObjectData.excessReceiveId	= $("#excessReceiveId").val();
	
	$.confirm({
		text: "Are you sure you want to Delete excess entry ?",
		confirm: function() {
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/excessReceiveWS/deleteExcessReceiveData.do',
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
