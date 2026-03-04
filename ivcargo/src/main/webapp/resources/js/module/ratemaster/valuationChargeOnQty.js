function getChargesConfigRatesForValuationCharge() {

	var jsonObject					= new Object();

	jsonObject["chargeTypeMasterId"] 	= VALUATION_CHARGE; 

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getValuationChargeData.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			valuationChargeList	= data.valuationChargeList;
			
			setValuesToFields();
			
			hideLayer();
		}
	});
}

function addQuantityAmount() {
	
	if($('#categoryType').val() > 0) {
		showMessage('error', iconForErrMsg + ' Valuation Charge is on Group Level, You cannot select Category !');
		return;
	}

	$.confirm({
		text: "Are you sure you want to Save ?",
		confirm: function() {	
		showLayer();

		var jsonObject							= new Object();

		jsonObject["quantityAmt"]				= $('#quantityAmt').val();
		jsonObject["otherQuantityAmt"]			= $('#otherQuantityAmt').val();
		jsonObject["firstQtyChargeConfigId"]	= $('#quantityAmtLabel').val();
		jsonObject["otherQtyChargeConfigId"]	= $('#otherQuantityAmtLabel').val();
		jsonObject["chargeTypeMasterId"] 		= VALUATION_CHARGE; 

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/saveQuantityAmountWise.do',
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

function saveCharge(){
	if($('#categoryType').val() > 0) {
		showMessage('error', iconForErrMsg + ' Valuation Charge is on Group Level, You cannot select Category !');
		return;
	}
	
	if(!validateValulationCharge())
		return false;

	$.confirm({
		text: "Are you sure you want Save ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();
		
		var charge = Number($('#chargeAmount').val().replace('%', ""));

		jsonObject["isPercent"] 				= true; 
		jsonObject["chargeTypeMasterId"] 		= $('#chargeDropDownValCharge').val(); 
		jsonObject["chargeMinAmount"]			= charge;
		jsonObject["fieldId"]					= $('#applChargeDropDownValCharge').val();
		jsonObject["applicableOnCategoryId"]	= ChargeConfigurationConstant.APPLICABLE_ON_CATEGORY_ID_FIELD;
		jsonObject["chargeTypeMasterId"] 		= VALUATION_CHARGE; 

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/saveValuationChargeInPercent.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					resetFields();
					return;
				}
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

function resetQuantityAmtFields(){
	$("#applOnQuantity").val(0);
	$("#quantityAmt").val(0);
	$("#otherQuantityAmt").val(0);
}

function resetFields(){
	$('#chargeDropDownValCharge').val(0);
	$('#chargeAmount').val("");
	$('#valChargePercent').prop("checked", false);
	$('#applChargeDropDownValCharge').val(0);
}

function deleteCharge(){
	if(!validateInput(1, 'chargeDropDownValCharge', 'chargeDropDownValCharge', 'basicError', 'Please, Select Charge !'))
		return false;

	$.confirm({
		text: "Are you sure you want Delete ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();
		
		jsonObject["chargeConfigurationId"]	= $('#chargeDropDownValCharge').val().split("_")[1];

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/deleteLrLevelRateMaster.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					resetFields();
					getChargesConfigRatesForValuationCharge();
					hideLayer();
					return;
				}
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

function setValuesToFields(){
	
	removeOption('chargeDropDownValCharge',null);
	createOption('chargeDropDownValCharge', 0, "-- Select Charges --");
	createOption('chargeDropDownValCharge', VALUATION_CHARGE, "Valuation Charge");
	
	if(!jQuery.isEmptyObject(valuationChargeList)){
		for(var i = 0; i < valuationChargeList.length; i++) {
			if(valuationChargeList[i].applOnQuantityId == 1){
				$("#quantityAmtLabel").val(valuationChargeList[i].chargeConfigurationId);
				$("#quantityAmt").val(valuationChargeList[i].quantityAmt);
			} else if(valuationChargeList[i].applOnQuantityId == 2){
				$("#otherQuantityAmtLabel").val(valuationChargeList[i].chargeConfigurationId);
				$("#otherQuantityAmt").val(valuationChargeList[i].quantityAmt);
			} else {
				removeOption('chargeDropDownValCharge',null);
				createOption('chargeDropDownValCharge', 0, "-- Select Charges --");
				createOption('chargeDropDownValCharge', VALUATION_CHARGE + "_" + valuationChargeList[i].chargeConfigurationId , "Valuation Charge");
			} 
		}
	} 
}

function setValuationChargeAmount(obj){
	if(obj.value == "0"){
		resetFields();
	} else if(!jQuery.isEmptyObject(valuationChargeList)){
		for(var i = 0; i < valuationChargeList.length; i++) {
			if(valuationChargeList[i].applOnQuantityId == 0){
				$('#chargeAmount').val(valuationChargeList[i].chargeMinAmount);
				$('#valChargePercent').prop("checked", valuationChargeList[i].ispercent);
				$('#applChargeDropDownValCharge').val(ChargeConfigurationConstant.FIELD_ID_DECLARED_VALUE);
				break;
			}
		}
	} 
}

function validateValulationCharge() {
	if(!validateInput(1, 'chargeDropDownValCharge', 'chargeDropDownValCharge', 'basicError', 'Please, Select Charge !'))
		return false;
	
	if(!validateInput(1, 'chargeAmount', 'chargeAmount', 'basicError', 'Please, Insert charge greater than zero !'))
		return false;
	
	if(!validateInput(1, 'applChargeDropDownValCharge', 'applChargeDropDownValCharge', 'basicError', 'Select Applicable on !'))
		return false;
		
	return true;
}