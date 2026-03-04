function setBookingChargeDropDownForFs(charges , BookingChargeConstant) {
	removeOption('chargeNameforFs',null);

	if(!jQuery.isEmptyObject(charges)) {
		for ( var i = 0; i < charges.length; i++) {
			if(charges[i].chargeTypeMasterId != BookingChargeConstant.FS){
				createOption('chargeNameforFs', charges[i].chargeTypeMasterId, charges[i].chargeTypeMasterDisplayName);
			}
		}
	}

	multiselectCharge();
}

function destroyMultiselectCharge(){
	$('#chargeNameforFs').multiselect('destroy');
}

function multiselectCharge(){
	destroyMultiselectCharge();
	$('#chargeNameforFs').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
	$('#chargeNameforFs').change(function(){
		$('#isApplicableOnBookingTotal').prop('checked',false);
	});
}

function saveFSLevelRate(){
	if(!validateMainSection(0)) return false;
	if(!validateFSRATE()) return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			var jsonObject		= new Object();

			jsonObject["sourceBranchId"]			= $('#branchId').val();
			jsonObject["corporateAccountId"]		= $('#partyId').val();
			jsonObject["chargeMinAmount"]			= $('#rateValueId').val();
			jsonObject["chargeTypeMasterId"]		= BookingChargeConstant.FS;

			var checkBoxArray	= new Array();
			
			$("input[name=chargeNameforFs]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["chargeNameforFs"]	= $('#chargeNameforFs').val().join(',');
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertFsRateConfiguration.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetFSChargesPanel();
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

function resetFSChargesPanel() {
	$('#rateValueId').val("0");
}