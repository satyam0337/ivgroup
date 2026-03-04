/**
 * 
 */

//add fixed party Rates irrespective of Charge Type in rate master. save if new update if exist.

function addFixedPartyCharges() {

	if (!fixedPartyRateValidation()) return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();

		jsonObject["branchId"]				= $('#branchId').val();
		jsonObject["corporateAccountId"]	= $('#partyId').val();
		jsonObject['chargeTypeMasterId']	= $('#fixedPartyChargesDropDown').val();
		jsonObject["chargeTypeId"]			= $('#fixedPartyChargeType').val();
		jsonObject["rate"]					= $('#fixedPartyAmount').val();
		jsonObject["categoryTypeId"]		= 2;
		jsonObject["chargeSectionId"] 		= 8;

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/addFixedPartyCharges.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					return;
				}
				hideLayer();
			}
		});

		hideLayer();
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

//get route wise rates to edit
function getFixedPartyCharges() {
	if (validateFixedMainSection()) {
		var branchId		= getValueFromInputField('branchId');
		var partyId			= getValueFromInputField('partyId');
		window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewFixedPartyRate&branchId='+branchId+'&partyId='+partyId,'newwindow', config='toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}