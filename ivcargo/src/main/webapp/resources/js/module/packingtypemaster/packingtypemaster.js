/**
 * @Author Ashish Tiwari 09-06-2016
 */
var executive				= null;
var configuration			= null;
var packingGrpTypMstrArr	= null;
var isPackingGroupType		= null;
var packingGroupMapping		= null;
var packingTypeMaster		= null;

function loadPackingTypeMasterData() {
	
	initialiseFocus();
	
	showLayer();
	
	var jsonObject		= new Object();
	jsonObject.filter	= 1;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					jsondata				= data;

					executive				= jsondata.executive;
					configuration 			= jsondata.configuration
					packingGrpTypMstrArr	= jsondata.packingGroupTypeMasterArray;
					
					if(configuration.isPackingGroupType) {
						changeDisplayProperty('packingGroupPanel', 'inline');
					}

					createOptionForGroup();
					setPackingTypeAutoComplete();
					hideLayer();
				}
			});
	
}

function setPackingTypeAutoComplete() {
	
	$("#packingType").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=30&responseFilter="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		
		select: function(event, ui) {	
			if(ui.item.id && ui.item.id != 0) {
				console.log('ui.item.id : ' + ui.item.id)
				$("#packingType").val(ui.item.id);
				getSelectedItemData(ui.item.id);
			} else {
				resetAllValues();
			} 
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function createOptionForGroup() {
	var optionId 		= 0;
	var optionValue 	= 0;
	var optionText 		= null;
	
	createOptionInSelectTag('packingTypeGroup', optionId, optionValue, 'Select Group');
	
	if(packingGrpTypMstrArr != null) {
		for(var i = 0 ; i < packingGrpTypMstrArr.length ; i++) {
			optionId 	= packingGrpTypMstrArr[i].packingGroupTypeId;
			optionValue	= packingGrpTypMstrArr[i].packingGroupTypeId;
			optionText	= packingGrpTypMstrArr[i].packingGroupTypeName;
			
			createOptionInSelectTag('packingTypeGroup', optionId, optionValue, optionText);		
		}
	}
	
}

function getSelectedItemData(id) {
	var jsonObject				= new Object();
	jsonObject.filter			= 2;
	jsonObject.packingTypeId	= id;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					jsondata				= data;

					executive				= jsondata.executive;
					configuration 			= jsondata.configuration;
					packingGroupMapping		= jsondata.packingGroupMapping;
					packingTypeMaster		= jsondata.packingTypeMaster;
					
					setPackingTypeName();
					
					if(configuration.isPackingGroupType) {
						setPackingGroupOption();
					}
					
					hideLayer();
				}
			});
}

function setPackingTypeName() {
	var grpId = $('#packingTypeGroup').val();
	
	$( "#delete" ).prop( "disabled", false );
	$( "#edit" ).prop( "disabled", false );
	$( "#addToGrp" ).prop( "disabled", false );
	$( "#add" ).prop( "disabled", true );
	
	$( "#packingTypeName" ).prop( "readOnly", true );
	
	setValueToTextField('packingTypeName', packingTypeMaster.name);
	setValueToTextField('pkgTypeId', packingTypeMaster.packingTypeMasterId);
}

function setPackingGroupOption() {
	var grpId = 0;
	
	if(packingGroupMapping != null) {
		grpId = packingGroupMapping.packingGroupTypeId;
	}
	
	selectOptionByValue(document.getElementById("packingTypeGroup"), grpId);

	if(grpId > 0) {
		$('#packingTypeGroup').prop('disabled', true);
		document.getElementById("addToGrp").disabled = true;
	} else {
		document.getElementById("delete").disabled = true;
		document.getElementById("addToGrp").disabled = false;
	}
}

function selectOptionByValue(selObj, val) {
	var A= selObj.options, L= A.length;
   
	while(L) {
        if (A[--L].value == val) {
            selObj.selectedIndex = L;
            L= 0;
        }
    }
} 

//insert, Update And Delete

function addPkgType() {	
	if(formValidationForAdd()) {
		insertUpdatePackingType();
	}
}

function insertUpdatePackingType() {
	
	var packingTypeName			= $('#packingTypeName').val();
	var packingGrpId			= $('#packingTypeGroup').val();
	var jsonObject				= new Object();
	
	jsonObject.filter			= 3;
	jsonObject.pkgTypeName		= packingTypeName.trim();
	jsonObject.packingGrpId		= packingGrpId;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					if(data.duplicate == true) {
						showMessage('warning', packingTypeAlreadyExistInfoMsg);
					} else if(data.addSuccessGrp == 'true') {
						showMessage('success', packingTypeAddedAndMapInfoMsg);
						resetAllValues();
					} else if(data.addSuccess == 'true') {
						showMessage('success', packingTypeAddedSuccessMsg);
						resetAllValues();
					}
					
					hideLayer();
				}
			});
}

function addPkgTypeToGrp() {	
	if(formValidationForGrp()) {
		insertUpdatePackingTypeGroup();
	}
}

function insertUpdatePackingTypeGroup() {
	
	var packingTypeId			= $('#pkgTypeId').val();
	var packingGrpId			= $('#packingTypeGroup').val();
	var jsonObject				= new Object();
	
	jsonObject.filter			= 5;
	jsonObject.packingTypeId	= packingTypeId;
	jsonObject.packingGrpId		= packingGrpId;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					if(data.success == 'true') {
						showMessage('info', packingTypeAddedToGroupInfoMsg);
						resetAllValues();
					} else if(data.addSuccessGrp == 'true') {
						showMessage('info', packingTypeAddedAndMapInfoMsg);
						resetAllValues();
						changeDisplayProperty('save', 'none');
						changeDisplayProperty('edit', 'inline');
					}
					
					hideLayer();
				}
			});
}

function deletePackingType() {
	
	var packingTypeId			= $('#pkgTypeId').val();
	var jsonObject				= new Object();
	
	jsonObject.filter			= 4;
	jsonObject.packingTypeId	= packingTypeId;
	
	var jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				//alert(data.errorDescription);
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					if(data.success == 'true') {
						showMessage('info', packingTypeDeleteInfoMsg);
						resetAllValues();
					} else if(data.delSuccess == 'true') {
						showMessage('info', packingTypeDeleteFromMappInfoMsg);
						resetAllValues();
					}
					
					hideLayer();
				}
			});
}

function updatePkgTypeMaster() {

	var packingTypeName			= $('#packingTypeName').val();
	var packingTypeId			= $('#pkgTypeId').val();
	var packingGrpId			= $('#packingTypeGroup').val();
	
	var jsonObject				= new Object();
	jsonObject.filter			= 6;
	jsonObject.packingTypeId	= packingTypeId;
	jsonObject.packingTypeName	= packingTypeName.trim();
	jsonObject.packingGrpId		= packingGrpId;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Masters.do?pageId=200&eventId=2",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					console.log(data);
					
					if(data.success == 'true'){
						showMessage('info', packingTypeUpdateInfoMsg);
						resetAllValues();
						changeDisplayProperty('save', 'none');
						changeDisplayProperty('edit', 'inline');
					}
					hideLayer();
				}
			});

}

function formValidationForAdd(){
	if(!validatePackingTypeName(1, 'packingTypeName'))
		return false;
	
	if(configuration.isPackingGroupType && !validatePackingTypeGrp(1, 'packingTypeGroup'))
		return false;
	
	return true;
} 

function formValidationForGrp() {
	if(!validatePackingType(1, 'packingType'))
		return false;
	
	if(configuration.isPackingGroupType && !validatePackingTypeGrp(1, 'packingTypeGroup'))
		return false;
	
	return true;
}

function editPackingType() {
	changeDisplayProperty('save', 'inline');
	changeDisplayProperty('edit', 'none');
	
	document.getElementById("packingTypeName").readOnly = false;
	
	if(configuration.isPackingGroupType) {
		document.getElementById("addToGrp").disabled = false;	
	}
	
	$('#packingTypeGroup').prop('disabled', false);
}

function resetValues() {
	setValueToTextField('packingTypeName', '');
	setValueToTextField('packingTypeGroup', 0);
	$('#addToGrp').prop('disabled', true);
	$('#edit').prop('disabled', true);
	$('#packingTypeGroup').prop('disabled', false);
	document.getElementById("packingTypeName").readOnly = false;
}

function resetAllValues() {
	setValueToTextField('packingType', '');
	setValueToTextField('packingTypeName', '');
	setValueToTextField('packingTypeGroup', 0);
	
	$('#packingTypeGroup').prop('disabled', false);
	$('#add').prop('disabled', false);
	$('#addToGrp').prop('disabled', true);
	$('#edit').prop('disabled', true);
	$('#delete').prop('disabled', true);
	document.getElementById("packingTypeName").readOnly = false;
}