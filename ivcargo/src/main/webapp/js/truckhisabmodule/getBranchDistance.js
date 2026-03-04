/***
 * Created By : Shailesh Khandare
 * Description : Get SubRegion Wise Branch List
 */
var branchDistanceConfig = false;
var branchHoursConfig = false;
var rowCount = 0;
var showPhysicalOrOperationalBothBranch = false;

/***
 * Created By : Shailesh Khandare
 * Description : Get SubRegion Wise Branch List
 */
var branchDistanceConfig = false;
var branchDaysWiseConfig = false;

function loadContent() {
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/branchDistanceMapMasterWS/loadBranchDistanceMap.do',
		data: "",
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
			}

			var branchDistanceMapConfig = data.BranchDistanceMapConfig;
			branchDistanceConfig 		= branchDistanceMapConfig.branchDistanceConfig;
			branchHoursConfig 			= branchDistanceMapConfig.branchHoursConfig;
			branchDaysWiseConfig 		= branchDistanceMapConfig.branchDaysWiseConfig;
			showPhysicalOrOperationalBothBranch = branchDistanceMapConfig.showPhysicalOrOperationalBothBranch;

			setBranchAutoComplete('branchName', 'branchId', 'cityId');
			setBranchAutoComplete('ConfbranchName', 'branchId1', 'cityId1');
		}
	});
}

//main section branch autocomplete
function setBranchAutoComplete(id, branchId, cityId) {
	$("#" + id).autocomplete({
		source: "AutoCompleteAjax.do?pageId=9&eventId=28&typeOfLocaion=1&showPhysicalOrOperationalBothBranch=" + showPhysicalOrOperationalBothBranch,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if (ui.item.id != 0) {
				getDestination(ui.item.id, branchId, cityId);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setLogoutIfEmpty(ui) {
	if (ui.content) {
		if (ui.content.length < 1) {
			ui.content.push(
				{
					"label": "You are logged out, Please login again !",
					"id": "0"
				}
			);
		}
	}
}
//set branch and city id from auto complete. work on onselect of autocomplete
function getDestination(branchId_CityId, branchId, cityId) {
	var destData = branchId_CityId.split("_");

	$('#' + branchId).val(parseInt(destData[0]));
	$('#' + cityId).val(parseInt(destData[1]));
}

function getDistanceDetails() {
	$('#distanceMapTbl tbody tr').remove();

	if (!validateValidBranch(1, 'branchId', 'branchName'))
		return false;

	$('#ratesEditTableTBody').empty();

	showLayer();
	var jsonObject = new Object();

	jsonObject.sourceBranchId = $("#branchId").val();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getBranchDistanceMapDetails.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$("#middle-border-boxshadow").hide();
				hideLayer();
				return;
			}

			$("#Distance-Details1").hide();

			var braArrayList = data.braArrayList;

			$("#middle-border-boxshadow").show();
			$('#distanceMapTbl tbody tr').remove();

			if (branchDistanceConfig)
				$('.distanceTh').css('display', 'block')
			else
				$('.distanceTh').remove();
				
			if (branchHoursConfig)
				$('.hoursTh').css('display', 'block')
			else
				$('.hoursTh').remove();
				
			if (branchDaysWiseConfig)
				$('.daysCol').css('display', 'block')
			else
				$('.daysCol').remove();
			
			resetTable1("#distanceMapTbl");

			if (braArrayList.length > 0) {
				$('#distanceMapTbl tbody tr').remove();

				for (var i = 0; i < braArrayList.length; i++) {
					var branch 			= braArrayList[i];
					var SrNo 			= (i + 1);
					var region 			= branch.destRegionName;
					var subRegion 		= branch.destSubregionName;
					var branchName 		= branch.destBranchName;

					var row 			= createRow('Branch_' + (i + 1), '');
					var srNoCol 		= createColumn(row, 'srNo_' + (i + 1), '', 'left', '', '');
					var regionCol 		= createColumn(row, 'region_' + (i + 1), '', 'left', '', '');
					var subRegionCol 	= createColumn(row, 'subRegion_' + (i + 1), '', 'left', '', '');
					var branchCol 		= createColumn(row, 'branchName_' + (i + 1), '', 'left', '', '');
					
					if(branchDistanceConfig)
						var distanceCol = createNewColumn(row, '', 'distanceTh datatd', '10%', '', '', '');
					
					if(branchHoursConfig)
						var hoursCol 	= createNewColumn(row, '', 'hoursTh datatd', '10%', '', '', '');
					
					if (branchDaysWiseConfig)
						var daysCol 	= createNewColumn(row, '', 'daysCol datatd', '10%', '', '', '');
						
					var buttonCol 		= createColumn(row, 'button_' + (i + 1), 'datatd', '20%', '', '', '');

					var destBranchIdObject = new Object();

					destBranchIdObject.type 	= 'hidden';
					destBranchIdObject.id 		= 'destBranchId_' + [i + 1];
					destBranchIdObject.name 	= 'destBranchId_' + [i + 1];
					destBranchIdObject.value 	= branch.toBranchId;
					destBranchIdObject.readonly = 'readonly';

					createInput(branchCol, destBranchIdObject);
					
					appendValueInTableCol(srNoCol, SrNo);
					appendValueInTableCol(regionCol, region);
					appendValueInTableCol(subRegionCol, subRegion);
					appendValueInTableCol(branchCol, branchName);

					if(branchDistanceConfig)
						appendValueInTableCol(distanceCol, createInputForDistance('distance', branch.distance, i, 'Distance'));
					
					if(branchHoursConfig)
						appendValueInTableCol(hoursCol, createInputForDistance('hours', branch.hours, i, 'Hours'));
					
					if (branchDaysWiseConfig)
						appendValueInTableCol(daysCol, createInputForDistance('days', branch.hours / 24, i, 'Days'));
					
					appendValueInTableCol(buttonCol, createInputForSaveButton(i));
					appendValueInTableCol(buttonCol, createInputForEditButton(i));

					$('#ratesEditTableTBody').append(row);
				}

				setDataTableToJsPanel();
			}

			$("#middle-border-boxshadow").show();

			hideLayer();
		}
	});
}

function createInputForDistance(id, distance, i, label) {
	var distanceFeild = $("<input/>", {
		type: 'text',
		id: id + '_' + [i + 1],
		class: 'form-control pure-input-1',
		name: id + '_' + [i + 1],
		value: distance,
		readonly: 'readonly',
		onfocus: "showInfo(this, '" + label + "')",
		onkeypress: "return noNumbers(event)",
		maxlength: 7
	});

	return distanceFeild;
}

function createInputForSaveButton(i) {
	var saveButtonFeild = $("<input/>", {
		type: 'button',
		id: 'button1_' + [i + 1],
		class: 'pure-button pure-button-primary',
		name: 'button1_' + [i + 1],
		value: 'Save',
		onclick: "saveDistance(" + [i + 1] + ")",
		style: 'display : none'
	});

	return saveButtonFeild;
}

function createInputForEditButton(i) {
	var editSaveFeild = $("<input/>", {
		type: 'button',
		id: 'button2_' + [i + 1],
		class: 'pure-button pure-button-primary',
		name: 'button2_' + [i + 1],
		value: 'Edit',
		onclick: "editSave(this," + [i + 1] + ")"
	});

	return editSaveFeild;
}

function setDataTableToJsPanel() {
	var tableId = '#distanceMapTbl';
	setDatatable(tableId);
	// get DataTable Instance
	var table = $(tableId).DataTable();

	table.columns().eq(0).each(function(colIdx) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#distanceMapTbl #ratesEditTableTBody td:nth-child(' + (colIdx + 1) + ')',
			colIdx, '#filterContentTable');
	});

	setFilterOnTop('#distanceMapTbl #ratesEditTableTFoot .tfootClass', '#distanceMapTbl #ratesEditTableTHead tr');
	setFilterOverlayPopupToggle('#distanceMapTbl #toggle-popup');
}
//create Datatable
function setDatatable(tableId) {
	var tabledata = $(tableId).DataTable({

		"bPaginate": false,
		"bInfo": false,
		"bautoWidth": true,
		destroy: true,
		"sDom": '<"top"l>rt<"bottom"ip><"clear">',
		"fnDrawCallback": function(oSettings) {

			//Need to redo the counters if filtered or sorted 
			if (oSettings.bSorted || oSettings.bFiltered) {
				for (var i = 0, iLen = oSettings.aiDisplay.length; i < iLen; i++) {
					$('td:eq(0)', oSettings.aoData[oSettings.aiDisplay[i]].nTr).html(i + 1);
				}
			}
		},
		"aoColumnDefs": [{ "bSortable": false, "aTargets": [0] }],
		"aaSorting": [[1, 'asc']]
	});

	return tabledata;
}

//Set Serach Items
function createCheckBoxForMultiSearchFilter(table, tableColumnToIterate, colIdx, appendTableId) {
	var srcBranchArr = new Array();

	$(tableColumnToIterate).each(function(index) {
		if (srcBranchArr.indexOf($(this).html()) == -1) {
			srcBranchArr.push($(this).html());
			var row = createRow("tr_", '');
			var col1 = createColumn(row, "td_", '200px', 'left', '', '2');
			var inputAttr1 = new Object();
			inputAttr1.id = 'filter' + $(this).html();
			inputAttr1.type = 'checkbox';
			inputAttr1.value = $(this).html();
			inputAttr1.name = 'filterCB';
			inputAttr1.onclick = 'setFilter(this);';

			input = createInput(col1, inputAttr1);
			input.attr({
				'data-columnIdx': colIdx
			});
			$(col1).append("&emsp;" + $(this).html());
			$(appendTableId, table.column(colIdx).footer()).append(row);
		}
	});
}

function applySearchonDatatable(table, colIdx, searchId, searchFunction, toggalFilterId, toggelAllowed) {
	// Apply the search
	$(searchId, table.column(colIdx).footer()).on(searchFunction, function() {
		var valto = this.value;
		table
			.column(colIdx)
			.search(valto, true, false, true)
			.draw();

		if (toggelAllowed) {
			$(this).closest(toggalFilterId).toggle(); // closest function find closest tag of given id.			
		}
	});
}

function setFilterOnTop(dataId, headerId) {
	$(dataId).insertAfter($(headerId));
}

function setFilterOverlayPopupToggle(popurId) {
	$(popurId).click(function() {
		$(this).closest("th").find('#popup').toggle(); // closest function find closest tag of given id.
	});
}

function setFilter(obj) {
	var btnVal = $(obj).closest("#popup").find('#setData').val(); // closest function find closest tag of given id.
	
	if (obj.checked) {
		if (btnVal == "")
			$(obj).closest("#popup").find('#setData').val(obj.value);
		else
			$(obj).closest("#popup").find('#setData').val(btnVal + '|' + obj.value);
	} else {
		if (btnVal.match(/\|/g) == null)
			btnVal = "";
		else if (btnVal.substr(0, btnVal.indexOf('|')) == obj.value)
			btnVal = btnVal.replace(obj.value + '|', '');
		else
			btnVal = btnVal.replace('|' + obj.value, '');
		
		$(obj).closest("#popup").find('#setData').val(btnVal);
	}
}

function editSave(ele, num) {
	$("#distance_" + num).attr("readonly", false);
	$("#hours_" + num).attr("readonly", false);
	$("#days_" + num).attr("readonly", false);
	$('#button1_' + num).show();
	$('#button2_' + num).hide();
}

function resetTable1(tableId) {
	var table = $(tableId).DataTable();
	table.destroy();
}

function saveDistance(count) {
	if (branchDistanceConfig && !validateInputField('distance', count))
		return false;

	if (branchHoursConfig && !validateInputField('hours', count))
		return false;
	
	if (branchDaysWiseConfig && !validateInputField('days', count))
		return false;

	var jsonObject = new Object();

	jsonObject.fromBrachId 		= $("#branchId").val();
	jsonObject.toBranchId 		= $("#destBranchId_" + count).val();
	jsonObject.distance 		= $("#distance_" + count).val();
	
	if(branchDaysWiseConfig)
		jsonObject.hours  			= 24 * Number($("#days_" + count).val());
	else
		jsonObject.hours 			= $("#hours_" + count).val();

	showLayer();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/branchDistanceMapMasterWS/saveDistanceDetails.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
			}

			saveAfter(count);
		}
	});
}

function saveAfter(count) {
	$('#distance_' + count).attr('readonly', true);
	$('#hours_' + count).attr('readonly', true);
	$('#days_' + count).attr('readonly', true);
	$('#button2_' + count).show();
	$('#button1_' + count).hide();
}

function validateInputField(id, ct) {
	if ($("#" + id + "_" + ct).val() <= 0) {
		$("#" + id + "_" + ct).focus();
		showMessage('error', "Can not Enter zero!");
		return false;
	}

	return true;
}