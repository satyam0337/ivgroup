var selectedPartyId					= 0;
var selectedBranchId				= 0;
var selectedPartyName				= null;
var selectedBranchName				= null;
var path							= "jsp/masters/slabmaster/" ;
var selectedRegionId				= 0;
var jsondata 						= null;
var configuration					= null;
var SLAB_TYPE_BRANCH 		= 1;
var SLAB_TYPE_PARTY    		= 2;
var SLAB_TYPE_REGION  		= 3;

function loadSlabMater() {
	showLayer();
	var jsonObject		= new Object();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/slabMasterWS/loadSlabForSlabMaster.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
					
			hideLayer();
					
			jsondata		= data;
					
			configuration	= data.slabMasterConfig;
					
			$("#createnewslab").load("/ivcargo/jsp/masters/slabmaster/createnewslabpanel.html", function() {
				showPartOfPage('createnewslabTab');
				showPartOfPage('createnewslab');
			});
					
					if(configuration.addToPartySlabSection) {
						$("#addtoparty").load("/ivcargo/jsp/masters/slabmaster/addtopartypanel.html", function() {
							showPartOfPage('addtopartyTab');
							setPartyAutoCompleteForSlabMaster();
							
							$( "#viewAllSlabForParty" ).click(function() {
								viewAllSlab(SLAB_TYPE_PARTY, this.id);
							});
							
							$( "#saveSlabForParty" ).click(function() {
								saveSlabsForParty();
							});
						});
					}

					if(configuration.addToBranchSlabSection) {
						$("#addtobranch").load("/ivcargo/jsp/masters/slabmaster/addtobranchpanel.html", function() {
							showPartOfPage('addtobranchTab');
							setBranchAutoCompleteForSlabMaster();
							
							$( "#viewAllSlabForBranch" ).click(function() {
								viewAllSlab(SLAB_TYPE_BRANCH, this.id);
							});
							
							$( "#saveSlabForBranch" ).click(function() {
								saveSlabsForBranch();
							});
						});
					}
					
					if(configuration.addToRegionSlabSection) {
						$("#addtoregionpanel").load("/ivcargo/jsp/masters/slabmaster/addtoregionpanel.html", function() {
							showPartOfPage('addtoregionTab');
							setRegionAutoComplete('regionName');
							
							$( "#viewAllSlabForRegion" ).click(function() {
								viewAllSlab(SLAB_TYPE_REGION, this.id);
							});
							
							$( "#saveSlabForRegion" ).click(function() {
								saveSlabsForRegion();
							});
						});
					}
				}
	});
}

function validateMinValueForSlab() {
	return validateInputTextFeild(1, 'minValueForSlab', 'minValueForSlab', 'error', minValueGTZeroErrMsg);
}

function validateMaxValueForSlab() {
	return validateInputTextFeild(1, 'maxValueForSlab', 'maxValueForSlab', 'error', maxValueGTOneErrMsg)
	&& validateRange('minValueForSlab', 'maxValueForSlab', 'basicError', maxValueGTMinValueErrMsg);
}

function validatePartyName() {
	return validateInputTextFeild(1, 'corporateAccountId', 'partyName', 'error', partyNameErrMsg);
}

function validateBranchName() {
	return validateInputTextFeild(1, 'sourceBranchId', 'branchName', 'error', branchNameErrMsg);
}

function validateRegionName() {
	return validateInputTextFeild(1, 'sourceRegionId', 'regionName', 'error', regionNameErrMsg);
}

function validateSlabForParty() {
	return validateInputTextFeild(1, 'slab', 'slab', 'error', slabForPartyErrMsg);
}

function validateSlabForBranch() {
	return validateInputTextFeild(1, 'branchSlab', 'branchSlab', 'error', slabErrMsg);
}

function validateSlabForRegion() {
	return validateInputTextFeild(1, 'regionSlab', 'regionSlab', 'error', slabErrMsg);
}

function saveDataForSlab() {
	if(!configuration.allowSameValueInMinMaxFeild) {
		if(!validateMinValueForSlab()){return false;}
		if(!validateMaxValueForSlab()){return false;}
		if(!confirmSlabAction(saveSlabConfirmMsg)){return false;}
	}
	
	showLayer();
	
	var jsonObject = new Object();
	
	jsonObject.minValue = $('#minValueForSlab').val();
	jsonObject.maxValue = $('#maxValueForSlab').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/slabMasterWS/saveSlabForSlabMaster.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
				if(errorMessage.type == 1) 
					resetSlab();
						
				hideLayer();
				return;
			}
					
			hideLayer();
		}
	});
}

function resetSlab() {
	$('#minValueForSlab').val(0);
	$('#maxValueForSlab').val(0);
}

function validateRange(elementId1, elementId2, errorElementId, errorMsg) {
	var element1 = getValueFromInputField(elementId1);
	var element2 = getValueFromInputField(elementId2);
	
	if(Number(element2) <= Number(element1)) {
		showMessage('error', errorMsg);
		element1.value = "";
		element2.value = "";
		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
		return true;
	}
}

function setPartyAutoCompleteForSlabMaster() {
	/*$("#partyName").autocomplete({
		 source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?query=' + request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
		}, select: function (e, ui) {
	   		$('#corporateAccountId').val(ui.item.id);
			selectedPartyId		= ui.item.id;
			selectedPartyName 	= ui.item.label;
			setSlabs('slab'); 
		},
		minLength	: 3,
		delay		: 200,
		autoFocus	: true
	});*/
	$("#partyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#corporateAccountId').val(ui.item.id);
				selectedPartyId		= ui.item.id;
				selectedPartyName 	= ui.item.label;
				setSlabs('slab'); 
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setBranchAutoCompleteForSlabMaster() {
	$("#branchName").autocomplete({
		 source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteByAccountGroup.do?term=' + request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.branchName,
		                   value			: item.branchName,
		                   id				: item.branchId,
		                };
		            }));
		           }
		        });
		}, select: function (e, ui) {
	   		$('#sourceBranchId').val(ui.item.id);
			selectedBranchId	= ui.item.id;
			selectedBranchName 	= ui.item.label;
			setSlabs('branchSlab'); 
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setRegionAutoComplete(id) {
	$("#" + id).autocomplete({
		 source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getRegionAutocomplete.do?term=' + request.term, function (data) {
		          if(data && data.regionList) {
		           response($.map(data.regionList, function (item) {
		               return {
		                   label			: item.regionName,
		                   value			: item.regionName,
		                   id				: item.regionId,
		                };
		            }));
		           }
		        });
		}, select: function (e, ui) {
	   		$('#sourceRegionId').val(ui.item.id);
			selectedRegionId	= ui.item.id;
			selectedBranchName 	= ui.item.label;
			setSlabs('regionSlab'); 
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function resetPartyTextBox(event){
	var key	= getKeyCode(event);
	if (key == 8 || key == 46 ) {
		resetDataForParty();
		return;
	}
}

function resetBranchTextBox(event){
	var key	= getKeyCode(event);	
	if (key == 8 || key == 46 ) {
		resetDataForBranch();
		return;
	}
}

function resetRegionTextBox(event){
	var key	= getKeyCode(event);	
	if (key == 8 || key == 46 ) {
		resetDataForRegion();
		return;
	}
}

function resetDataForParty() {
	$('#corporateAccountId').val(0);
	selectedPartyId	 = 0;
}

function resetDataForBranch() {
	$('#sourceBranchId').val(0);
	selectedBranchId	 = 0;
}

function resetDataForRegion() {
	$('#sourceRegionId').val(0);
	selectedRegionId	 = 0;
}

function saveSlabsForParty() {
	if(!validatePartyName()){return false;}
	if(!validateSlabForParty()){return false;}
	if(!confirmSlabAction(saveSlabConfirmMsg)){return false;}
	
	showLayer();
	
	var jsonObject = new Object();
	
	jsonObject.slabMasterId 		= $('#slab').val();
	jsonObject.corporateAccountId 	= selectedPartyId;
	jsonObject.slabTypeId 			= SLAB_TYPE_PARTY;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/slabMasterWS/configSlab.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
					
			hideLayer();
		}
	});
}

function saveSlabsForBranch() {
	if(!validateBranchName()){return false;}
	if(!validateSlabForBranch()){return false;}
	if(!confirmSlabAction(saveSlabConfirmMsg)){return false;}
	
	showLayer();
			
	var jsonObject = new Object();
	
	jsonObject.slabMasterId 	= $('#branchSlab').val();
	jsonObject.sourceBranchId 	= selectedBranchId;
	jsonObject.slabTypeId 		= SLAB_TYPE_BRANCH;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/slabMasterWS/configSlab.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
					
			hideLayer();
		}
	});
}

function deleteConfigSlab(obj, slabTypeId) {
	if(!confirmSlabAction(deleteSlabConfirmMsg)){return false;}

	enableDisableInputField(obj.id, 'true');
	
	slabTypeId	= Number(slabTypeId);
	
	var jsonObject = new Object();
	
	jsonObject.slabMasterId 		= obj.value;
	
	if(slabTypeId == SLAB_TYPE_BRANCH)
		jsonObject.sourceBranchId 		= selectedBranchId;
	else if(slabTypeId == SLAB_TYPE_PARTY)
		jsonObject.corporateAccountId 	= selectedPartyId;
	else if(slabTypeId == SLAB_TYPE_REGION)
		jsonObject.sourceRegionId 		= selectedRegionId;
		
	jsonObject.slabTypeId			= slabTypeId;
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/deleteConfigSlab.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
					
			hideLayer();
		}
	});
}

function viewAllSlab(slabTypeId, buttonId) {
	if(slabTypeId == SLAB_TYPE_BRANCH && !validateBranchName()
		|| slabTypeId == SLAB_TYPE_PARTY && !validatePartyName()
		|| slabTypeId == SLAB_TYPE_REGION && !validateRegionName())
		return;
	
	var jsonObject = new Object();
	
	if(slabTypeId == SLAB_TYPE_BRANCH)
		jsonObject.sourceBranchId 		= selectedBranchId;
	else if(slabTypeId == SLAB_TYPE_PARTY)
		jsonObject.corporateAccountId 	= selectedPartyId;
	else if(slabTypeId == SLAB_TYPE_REGION)
		jsonObject.sourceRegionId 		= selectedRegionId;
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/viewAllConfigSlab.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			var url	= 'jsp/masters/slabmaster/slabTableForParty.html';
			viewDataForSlabPanel(data.SlabMaster, buttonId, url, 'slabTableForParty', 'View All Slabs', slabTypeId);
			hideLayer();
			removeTableRows('slabTableForParty', 'tbody');
					
			hideLayer();
		}
	});
}

function viewDataForSlab() {
	var jsonObject = new Object();
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/getSlabsForGroup.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			var url= 'jsp/masters/slabmaster/slabTableForSlabMaster.html';
			viewDataForSlabPanel(data.SlabMaster, 'view', url, 'slabTable', 'View All Slabs', 0);
					
			hideLayer();
		}
	});
}

function viewDataForSlabPanel(slabMasterList, buttonId, url, tableId, title, slabTypeId) {
	
	enableDisableInputField(buttonId, 'true');
	
	$.jsPanel({
		selector:      "#o-theme",
		position:      "center",
		title:         title,
		theme:         "info",
		size:     { width: 300, height: 300 },
		overflow: { horizontal: 'hidden', vertical: 'scroll' },
		load:     {url: url},
	});
	
	$('body').on( "jspanelloaded", function(event, id ) {
		event.preventDefault();
		loadTablecontent(tableId, slabMasterList, slabTypeId);
	});
	
	$("body").on( "jspanelclosed", function closeHandler(event, id) {
		enableDisableInputField(buttonId, 'false');
		$("body").off("jspanelclosed", closeHandler);
	});
}

function loadTablecontent(id, slabMasterList, slabTypeId) {
	removeTableRows(id, 'tbody');

	var jsonObject		= new Object();
	var jsonObject2		= new Object();
	
	jsonObject.type		= 'button';
	jsonObject.name		= 'delete';
	jsonObject.style	= 'width: 60px; text-align:left;';
	jsonObject.class	= 'btn btn-danger';
	jsonObject.html		= 'Delete';
	jsonObject.onclick	= 'deleteSlab(this)';
	
	jsonObject2.type		= 'button';
	jsonObject2.name		= 'delete';
	jsonObject2.style		= 'width: 60px; text-align:left;';
	jsonObject2.class		= 'btn btn-danger';
	jsonObject2.html		= 'Delete';
	jsonObject2.onclick		= 'deleteConfigSlab(this, "' + slabTypeId + '")';

	if(slabMasterList.length > 0) {
		for(var i = 0; i < slabMasterList.length; i++) {
			var row 	= createRowInTable('tr_' + i, '', '');

			var col1	= createColumnInRow(row, 'td_' + i, 'td_' + i, '2%', 'left', '', '');
			var col2	= createColumnInRow(row, 'td_' + i, 'td_' + i, '2%', 'left', '', '');

			jsonObject.value		= slabMasterList[i].slabMasterId;
			jsonObject.id			= 'button_' + slabMasterList[i].slabMasterId;
			
			jsonObject2.value		= slabMasterList[i].slabMasterId;
			jsonObject2.id			= 'button_' + slabMasterList[i].slabMasterId;
			
			appendValueInTableCol(col1, i + 1);
			appendValueInTableCol(col2, slabMasterList[i].minValue + "--" + slabMasterList[i].maxValue);
			
			if("#"+id =='#slabTable') {
				var col3	= createColumnInRow(row, slabMasterList[i].slabMasterId, slabMasterList[i].slabMasterId, '2%', 'left', '', '');
				createButton(col3, jsonObject);
			} else if("#"+id == '#slabTableForParty') {
				var col3	= createColumnInRow(row, slabMasterList[i].slabMasterId, slabMasterList[i].slabMasterId, '2%', 'left', '', '');
				createButton(col3, jsonObject2);
			} 
			
			appendRowInTable(id, row);
		}
	} else {
		var row 	= createRowInTable('tr_', '', '');
		var col1	= createColumnInRow(row, 'td_', 'td_', '2%', 'left', '', '5');
		appendValueInTableCol(col1, 'No slab Available  !');
		appendRowInTable(id, row);
	}
}

function setSlabs(id) {
	var jsonObject = new Object();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/getSlabsForGroup.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				operationOnSelectTag(id, 'addNew', 'none', '0-0');
				hideLayer();
				return;
			}
			
			var slabMasterList	= data.SlabMaster;
			
			operationOnSelectTag(id, 'removeAll', '', '');
			operationOnSelectTag(id, 'addNew', '-- Select slab --', 0);
					
			for(var i = 0; i < slabMasterList.length; i++) {
				operationOnSelectTag(id, 'addNew', slabMasterList[i].minValue + "--" + slabMasterList[i].maxValue, slabMasterList[i].slabMasterId);
			}
		}
	});
}

function confirmSlabAction(promptMsg) {
	if (!confirm(promptMsg)) {
		hideLayer();
		return false;
	}
	
	return true;
}

function deleteSlab(obj) {
	if(!confirmSlabAction(deleteSlabConfirmMsg)){return false;}

	var jsonObject 		= new Object();
	
	jsonObject.slabMasterId = obj.value;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/deleteSlabsForMaster.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				enableDisableInputField(obj.id, 'true');
				hideLayer();
				return;
			}
			
			var slabMasterList	= data.SlabMaster;
			
			url	=	"jsp/masters/slabmaster/partyNameTable.html" ;
					$.jsPanel({
						selector:      "#o-theme",
						position:      "center",
						title:         "WARNING !",
						theme:         "warning",
						size:     { width: 300, height: 300 },
						overflow: { horizontal: 'hidden', vertical: 'scroll' },
						load:     {url: url},
					});
					
					$('body').on( "jspanelloaded", function( event ) {
						event.preventDefault();
						$('#partyNamePanel'+' '+'tbody').remove();
						
						if(slabMasterList.length > 0) {
							var partyArray = slabMasterList.filter(function (el) {
								return el.slabTypeId == SLAB_TYPE_PARTY;
							});
							
							var branchArray = slabMasterList.filter(function (el) {
								return el.slabTypeId == SLAB_TYPE_BRANCH;
							});
							
							var regionArray = slabMasterList.filter(function (el) {
								return el.slabTypeId == SLAB_TYPE_REGION;
							});

							if(partyArray.length > 0)
								setConfigSlabDetails(partyArray);
							else if(branchArray.length > 0)
								setConfigSlabDetails(branchArray);
							else if(regionArray.length > 0)
								setConfigSlabDetails(regionArray);
							
							var row 	= createRowInTable('tr_', '', '');
							var col		= createColumnInRow(row, 'td_', 'td_', '2%', 'left', '', '5');
							
							if(partyArray.length > 0)
								appendValueInTableCol(col, slabIsUsedForPartyWarningMsg('Party'));
							else if(branchArray.length > 0)
								appendValueInTableCol(col, slabIsUsedForPartyWarningMsg('Branch'));
							else if(regionArray.length > 0)
								appendValueInTableCol(col, slabIsUsedForPartyWarningMsg('Region')); 
								
							appendRowInTable('partyNamePanel', row);
						}	
					});
					
					$("body").on( "jspanelclosed", function closeHandler(event, id) {
						$("body").off("jspanelclosed", closeHandler);
					});
					
			hideLayer();
		}
	});
}

function setConfigSlabDetails(slabMasterList) {
	for(var i = 0; i < slabMasterList.length; i++) { 
		var row 	= createRowInTable('tr_' + i, '', '');

		var col1	= createColumnInRow(row, 'td_' + i, 'td_' + i, '2%', 'left', '', '');
		var col2	= createColumnInRow(row, 'td_' + i, 'td_' + i, '2%', 'left', '', '');

		appendValueInTableCol(col1, i + 1);
								
		if(slabMasterList[i].slabTypeId == SLAB_TYPE_PARTY)
			appendValueInTableCol(col2, slabMasterList[i].partyName);
		else if(slabMasterList[i].slabTypeId == SLAB_TYPE_BRANCH)
			appendValueInTableCol(col2, slabMasterList[i].branchName);
		else if(slabMasterList[i].slabTypeId == SLAB_TYPE_REGION)
			appendValueInTableCol(col2, slabMasterList[i].regionName);
								
		appendRowInTable('partyNamePanel', row);
	}
}

function saveSlabsForRegion() {
	if(!validateRegionName()){return false;}
	if(!validateSlabForRegion()){return false;}
	if(!confirmSlabAction(saveSlabConfirmMsg)){return false;}
	
	showLayer();
			
	var jsonObject = new Object();
	
	jsonObject.slabMasterId 	= $('#regionSlab').val();
	jsonObject.sourceRegionId 	= selectedRegionId;
	jsonObject.slabTypeId 		= SLAB_TYPE_REGION;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL + '/slabMasterWS/configSlab.do',
		data		: jsonObject,
		dataType	: 'json',
		success		: function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
					
			hideLayer();
		}
	});
}