function addMinimumHamaliRates() {
	if(!hamaliSlabWiseValidation())
		return false;

		if ( $('#slabs3').val() == '0-0') {
		    alert('Please select slab range');
		    return false;
		}		
	$.confirm({
		text: "Are you sure you want to save hamali slab rate ?",
		confirm: function() {
			showLayer();
				let jsonObject		= new Object();
			
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["rate"]					= $('#minHamaliAmount').val();
			jsonObject["categoryTypeId"]		= $('#categoryType').val();
			jsonObject["slabMasterId"]			= $('#slabs3').val();
			jsonObject["wayBillTypeId"]			= $('#wayBillTypeForSlabRate').val();
			jsonObject["isGroupLevel"]			= $('#groupLevelFixedHamali').is(':checked');
				
				console.log("jssss:::",jsonObject)
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/addHamaliSlabWiseRates.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
	
}

function getHamaliSlabWiseRates() {
	if (!validateCategoryType()) return false;
	if (!validateBranch()) return false;
	if (!validateParty()) return false;
	
	let branchId = 0;
	
	if(!$('#groupLevelFixedHamali').is(':checked'))
		branchId = $('#branchId').val();
	
	let partyId = $('#partyId').val();

	window.open('viewDetails.do?pageId=340&eventId=2&modulename=viewFixedHamaliSlabRates&branchId=' + branchId + '&partyId=' + partyId, 'newwindow', config = 'toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}