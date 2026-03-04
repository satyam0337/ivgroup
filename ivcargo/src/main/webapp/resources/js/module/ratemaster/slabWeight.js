function addSlabWeightRate() {

	if (!weightSlabValidation()) return false;

	$.confirm({
		text: "Are you sure you want to Save Weight ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();

		jsonObject["branchId"]				= $('#branchId').val();
		jsonObject["corporateAccountId"]	= $('#partyId').val();
		jsonObject['minQty']				= $('#minQty').val();
		jsonObject["maxQty"]				= $('#maxQty').val();
		jsonObject["slabWeight"]			= $('#slabWeight').val();

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/addSlabWeightRate.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					resetSlabWeightFields();
					setSlabWeightDropDown();
					hideLayer();
					return;
				}
				resetSlabWeightFields();
				setSlabWeightDropDown();
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

function updateSlabWeightRate(){
	
	if (!updateSlabWeightValidation()) return false;

	$.confirm({
		text: "Are you sure you want to Update Weight ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();

		jsonObject['editWeight']			= $('#editWeight').val();
		jsonObject["slabWeightDetailsId"]	= $('#slabWeightDropDown').val().split("_")[0];

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/updateSlabWeightRate.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					setSlabWeightDropDown();
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

function deleteSlabWeightRate(){
	
	if (!updateSlabWeightValidation()) return false;

	$.confirm({
		text: "Are you sure you want to Delete Weight ?",
		confirm: function() {	
		showLayer();

		var jsonObject						= new Object();

		jsonObject['editWeight']			= $('#editWeight').val();
		jsonObject["slabWeightDetailsId"]	= $('#slabWeightDropDown').val().split("_")[0];

		$.ajax({
			url: WEB_SERVICE_URL+'/rateMasterWS/deleteSlabWeightRate.do',
			type: "POST",
			dataType: 'json',
			data:jsonObject,
			success: function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					setSlabWeightDropDown();
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

function setSlabWeightDropDown(){
	
	resetSlabWeightEditFields();
	
	var jsonObject		= new Object();
	var slabWeightList	= null;
	
	jsonObject["branchIdForSlab"]		= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getSlabWeightDetails.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}

			slabWeightList		= data.slabWeightList;
			
			createslabWeighDropDown(slabWeightList);

			hideLayer();
		}
	});
}

function createslabWeighDropDown(slabWeightList){
	
	removeOption('slabWeightDropDown',null);
	createOption('slabWeightDropDown', 0, "-- Select Slabs --");
	
	if(!jQuery.isEmptyObject(slabWeightList)){
		for (let value of slabWeightList) {
			createOption('slabWeightDropDown', value.slabWeightDetailsId + "_" + value.slabWeight, value.minArticle + " - " + value.maxArticle);
		}
	}
}

function setWeightAmount(obj){
	
	if(obj.value.length > 1){
		$("#editWeight").val(obj.value.split("_")[1]);
	} else {
		$("#editWeight").val(0);
	}
}

function resetSlabWeightFields(){
	$("#minQty").val(0);
	$("#maxQty").val(0);
	$("#slabWeight").val(0);
}

function resetSlabWeightEditFields(){
	$("#editWeight").val(0);
	$('#slabWeightDropDown').prop('selectedIndex',0);
}
