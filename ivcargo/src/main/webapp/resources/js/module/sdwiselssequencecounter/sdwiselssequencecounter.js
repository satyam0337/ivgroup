/**
 * @Author Ashish Tiwari	04/09/2017
 */
var table = null;
var billSelectionList	= null;

function loadLsSequenceCounterData() {

	var jsonObject		= new Object();
	jsonObject.filter	= 1;

	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					jsondata				= data;
					executive				= jsondata.executive; // executive object
					branchId				= executive.branchId;
					accountGroupId			= executive.accountGroupId;
					// all constants
					billSelectionList		= jsondata.billSelectionList;

					// group configuration
					configuration			= data.configuration;

					setBranchAutoComplete();
					showHideByProperty();

					hideLayer();
				}
			});	
}

function setBranchAutoComplete() {
	$('#scrBranch').prop("autocomplete","off");
	$("#scrBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				var destData = (ui.item.id);
				var res = destData.substring(0,destData.indexOf("_"));
				document.getElementById("srcBranchId").value = res;
			}
		}
	});
}

function showHideByProperty() {

	if(configuration.isLSDestinationRegionShow == "true" || configuration.isLSDestinationRegionShow == true) {
		$('#destRegionDiv').removeClass("hide");
		setDestinationRegions(jsondata.regions);
	}

	if(configuration.isLSDestinationSubRegionShow == "true" || configuration.isLSDestinationSubRegionShow == true) {
		$('#destSubRegionDiv').removeClass("hide");
	}

	if(configuration.isLSDestinationBranchShow == "true" || configuration.isLSDestinationBranchShow == true) {
		$('#destBranchDiv').removeClass("hide");
	}
}

function setDestinationRegions(regions) {

	createOptionInSelectTag('destRegion', 0,0, '---- Select Region ----');
	for (var i = 0; i < regions.length; i++) {
		var reg = regions[i];
		createOptionInSelectTag('destRegion', reg.regionId, reg.regionId, reg.name)
	}
}


function populateDestinationSubRegions() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["regionSelectEle_primary_key"]		= $('#destRegion').val();
	jsonObject["AllOptionsForSubRegion"]					= false;
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setDestinationSubRegions(data.subRegion);
			hideLayer();
		}
	});
}

function setDestinationSubRegions(subRegions) {
	removeOption('destSubRegion', null);
	removeOption('destBranch', null);
	createOptionInSelectTag('destSubRegion', 0,0, '---- Select Sub Region ----');
	createOptionInSelectTag('destBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < subRegions.length; i++) {
		var subreg = subRegions[i];
		createOptionInSelectTag('destSubRegion', subreg.subRegionId, subreg.subRegionId, subreg.subRegionName)
	}
}

function populatedestinationBranch() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["subRegionSelectEle_primary_key"]		= $('#destSubRegion').val();
	jsonObject["AllOptionsForBranch"]						= false;
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setDestinationBranch(data.sourceBranch);
			hideLayer();
		}
	});
}

function setDestinationBranch(sourceBranch) {

	removeOption('destBranch', null);
	createOptionInSelectTag('destBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < sourceBranch.length; i++) {
		var srcBranch = sourceBranch[i];
		createOptionInSelectTag('destBranch', srcBranch.branchId, srcBranch.branchId, srcBranch.branchName)
	}
}

function addLSSequence() {
	if(formValidation()){
		addLSSeqenceCounter();
	}
}

function formValidation(){

	if(!validateSrcBranch(1, 'scrBranch')) {
		return false;
	}

	if(!validateDestRegion(1, 'destRegion')) {
		return false;
	}
	
	if(!validateDestSubRegion(1, 'destSubRegion')) {
		return false;
	}

	if(!validateDestBranch(1, 'destBranch')) {
		return false;
	}

	if(!validateSequenceMin(1, 'lsSequenceMin')) {
		return false;
	}

	if(!validateSequenceMax(1, 'lsSequenceMax')) {
		return false;
	} else if(!validateMaxRangeByMinRange()) {
		return false;
	}

	return true;
} 

function addLSSeqenceCounter() {

	showLayer();

	srcBranchId 					= getValueFromInputField('srcBranchId');
	destRegionId					= getValueFromInputField('destRegion');
	destSubRegionId					= getValueFromInputField('destSubRegion');
	destBranchId					= getValueFromInputField('destBranch');
	lsSequenceMin					= getValueFromInputField('lsSequenceMin');
	lsSequenceMax					= getValueFromInputField('lsSequenceMax');
	lsSequenceNext					= getValueFromInputField('lsSequenceNext');

	var jsonObject					= new Object();

	jsonObject["filter"]			= 9;
	
	jsonObject["SrcBranchId"]		= srcBranchId;
	jsonObject["DestRegionId"] 		= destRegionId;
	jsonObject["DestSubRegionId"] 	= destSubRegionId;
	jsonObject["DestBranchId"] 		= destBranchId;
	jsonObject["lsSequenceMin"] 	= lsSequenceMin;
	jsonObject["lsSequenceMax"] 	= lsSequenceMax;
	jsonObject["lsSequenceNext"] 	= lsSequenceNext;
	
	showLayer();

	$.ajax({
		url: WEB_SERVICE_URL+'/sdWiseLsSeqCounterWS/addSDWiseLsSeqCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				hideLayer();
			} else {
				if(data.duplicate == true){
					showMessage('info', lrSequnceCounterAlreadyExistInfoMsg);
				}else{
					showMessage('success', sequenceCounterAddedSuccessMsg);
					resetValues();
				}
				hideLayer();
			}
		}
	});

	hideLayer();
}
//---------------------------
function getFilterWiseLsSeqCounter() {


	if(!validateSequenceCounter()) {
		return;
	}

	showLayer();
	if(table != null) {
		table.destroy();
		$("#allLsSeqCounterjspanel #allLsSeqCounterTableTFoot").load( "/ivcargo/jsp/masters/sdWiseLrSeqCounter/footer.jsp");
	}
	$('#allLsSeqCounterjspanel #allLsSeqCounterTable').children('thead').empty();
	$('#allLsSeqCounterjspanel #allLsSeqCounterTable').children('tbody').empty();

	var jsonObject   			= new Object();
	jsonObject["filter"]		= 11;
	jsonObject["srcRegion"]		= $('#allLsSeqCounterjspanel #srcRegion').val();
	jsonObject["srcSubRegion"]	= $('#allLsSeqCounterjspanel #srcSubRegion').val();
	jsonObject["srcBranch"]		= $('#allLsSeqCounterjspanel #srcBranch').val();
	
	showLayer();

	$.ajax({
		url: WEB_SERVICE_URL+'/sdWiseLsSeqCounterWS/getSDWiseLsSeqCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.message) {
				showMessage('info', lsSequnceCounterNotFoundInfoMsg);
				hideLayer();
			} else {
				if(typeof data.sdWiseLSSeqCounterArrList !== 'undefined' || data.sdWiseLSSeqCounterArrList != undefined) {
					createRatesEditData(data.sdWiseLSSeqCounterArrList);
					setDataTableToJsPanel();
					$('#allLsSeqCounterjspanel #allLsSeqCounterTable').switchClass('show', 'hide');
				}
				hideLayer();
			}
		}
	});
}

function createRatesEditData(sdWiseLsSeqCounter) {
	emptyChildInnerValue('allLsSeqCounterTable','tbody');
	emptyChildInnerValue('allLsSeqCounterTable','thead');
	var tabHeader		= createRowInTable('HeaderTable', '', '');

	var blanckCell0		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	var blanckCell1		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	var blanckCell2		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	var blanckCell3		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	var blanckCell4		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	var blanckCell5		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell6		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell7		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell8		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');

	appendValueInTableCol(blanckCell0, 'Sr.NO');
	appendValueInTableCol(blanckCell1, 'Src Branch');
	appendValueInTableCol(blanckCell2, 'Dest Region');
	appendValueInTableCol(blanckCell3, 'Dest SubRegion');
	appendValueInTableCol(blanckCell4, 'Dest Branch');
	appendValueInTableCol(blanckCell5, 'Min Range');
	appendValueInTableCol(blanckCell6, 'Max Range');
	appendValueInTableCol(blanckCell7, 'Next Val');
	appendValueInTableCol(blanckCell8, '');

	$('#jsPanelDataContent #allLsSeqCounterTable #allLsSeqCounterTableTHead').append(tabHeader);

	for (var i = 0; i < sdWiseLsSeqCounter.length; i++) {

		var sdWiseLsSeqCount	= sdWiseLsSeqCounter[i];

		k = i+1;

		var row 								= createRowInTable('tr_'+k, '', '');

		var Srno								= createColumnInRow(row ,'td_' + k, '', '', 'left', '', ''); 
		var SrcBranch							= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.sourceBranchName, '', '', 'left', '', '');
		var DestRegion							= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.destinationRegionName, '', '', 'left', '', '');
		var DestSubRegion						= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.destinationSubRegionName, '', '', 'left', '', '');
		var DestBranch							= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.destinationBranchName, '', '', 'left', '', '');
		var MinRange							= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.minRange, '', '', 'right', '', '');
		var MaxRange							= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.maxRange, '', '', 'right', '', '');
		var NextVal								= createColumnInRow(row ,'td_' + sdWiseLsSeqCount.nextVal, '', '', 'right', '', '');
		var edit								= createColumnInRow(row ,'rate' , '', '', 'right', '', '');

		appendValueInTableCol(Srno, k);
		appendValueInTableCol(SrcBranch, sdWiseLsSeqCount.sourceBranchName);
		appendValueInTableCol(DestRegion, sdWiseLsSeqCount.destinationRegionName);
		appendValueInTableCol(DestSubRegion, sdWiseLsSeqCount.destinationSubRegionName);
		appendValueInTableCol(DestBranch, sdWiseLsSeqCount.destinationBranchName);

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'counterId'+k;
		inputAttr1.type			= 'hidden';
		inputAttr1.value		= sdWiseLsSeqCount.sourceDestinationWiseLSSequenceCounterId;
		inputAttr1.name			= 'counterId'+k;
		inputAttr1.style		= 'width: 50px;text-align: right;';
		inputAttr1.disabled		= 'true';

		input	= createInput(MinRange,inputAttr1);
		input.attr( {
			'data-value' : k
		});

		var inputAttr2		= new Object();
		var input			= null;

		inputAttr2.id			= 'minVal'+k;
		inputAttr2.class		= 'form-control';
		inputAttr2.type			= 'text';
		inputAttr2.value		= sdWiseLsSeqCount.minRange;
		inputAttr2.name			= 'minVal'+k;
		inputAttr2.style		= 'width: 100px;text-align: right;';
		inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr2.onkeypress	= 'return noNumbers(event);';
		inputAttr2.disabled		= 'true';

		input	= createInput(MinRange,inputAttr2);
		input.attr( {
			'data-value' : k
		});
		var inputAttr3		= new Object();
		var input			= null;

		inputAttr3.id			= 'maxVal'+k;
		inputAttr3.class		= 'form-control';
		inputAttr3.type			= 'text';
		inputAttr3.value		= sdWiseLsSeqCount.maxRange;
		inputAttr3.name			= 'maxVal'+k;
		inputAttr3.style		= 'width: 100px;text-align: right;';
		inputAttr3.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr3.onkeypress	= 'return noNumbers(event);';
		inputAttr3.disabled		= 'true';

		input	= createInput(MaxRange,inputAttr3);
		input.attr( {
			'data-value' : k
		});
		var inputAttr4		= new Object();
		var input			= null;

		inputAttr4.id			= 'nextVal'+k;
		inputAttr4.class		= 'form-control';
		inputAttr4.type			= 'text';
		inputAttr4.value		= sdWiseLsSeqCount.nextVal;
		inputAttr4.name			= 'nextVal'+k;
		inputAttr4.style		= 'width: 100px;text-align: right;';
		inputAttr4.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr4.onkeypress	= 'return noNumbers(event);';
		inputAttr4.disabled		= 'true';

		input	= createInput(NextVal,inputAttr4);
		input.attr( {
			'data-value' : k
		});

		var inputAttr5		= new Object();
		var input			= null;

		inputAttr5.id			= 'hideNextVal'+k;
		inputAttr5.type			= 'hidden';
		inputAttr5.value		= sdWiseLsSeqCount.nextVal;
		inputAttr5.name			= 'hideNextVal'+k;
		inputAttr5.style		= 'width: 50px;text-align: right;';
		inputAttr5.disabled		= 'true';

		input	= createInput(NextVal,inputAttr5);
		input.attr( {
			'data-value' : k
		});

		var inputAttr6		= new Object();
		var input			= null;

		inputAttr6.id			= 'hideMinRange'+k;
		inputAttr6.type			= 'hidden';
		inputAttr6.value		= sdWiseLsSeqCount.minRange;
		inputAttr6.name			= 'hideMinRange'+k;
		inputAttr6.style		= 'width: 50px;text-align: right;';
		inputAttr6.disabled		= 'true';

		input	= createInput(MinRange,inputAttr6);
		input.attr( {
			'data-value' : k
		});

		var inputAttr7		= new Object();
		var input			= null;

		inputAttr7.id			= 'hideMaxRange'+k;
		inputAttr7.type			= 'hidden';
		inputAttr7.value		= sdWiseLsSeqCount.maxRange;
		inputAttr7.name			= 'hideMaxRange'+k;
		inputAttr7.style		= 'width: 50px;text-align: right;';
		inputAttr7.disabled		= 'true';

		input	= createInput(MaxRange,inputAttr7);
		input.attr( {
			'data-value' : k
		});

		var inputAttr8		= new Object();
		var input			= null;

		inputAttr8.id			= 'sourceBranchId'+k;
		inputAttr8.type			= 'hidden';
		inputAttr8.value		= sdWiseLsSeqCount.sourceBranchId;
		inputAttr8.name			= 'sourceBranchId'+k;
		inputAttr8.style		= 'width: 50px;text-align: right;';
		inputAttr8.disabled		= 'true';

		input	= createInput(MinRange,inputAttr8);
		input.attr( {
			'data-value' : k
		});

		var inputAttr9		= new Object();
		var input			= null;

		inputAttr9.id			= 'destinationRegionId'+k;
		inputAttr9.type			= 'hidden';
		inputAttr9.value		= sdWiseLsSeqCount.destinationRegionId;
		inputAttr9.name			= 'destinationRegionId'+k;
		inputAttr9.style		= 'width: 50px;text-align: right;';
		inputAttr9.disabled		= 'true';

		input	= createInput(MinRange,inputAttr9);
		input.attr( {
			'data-value' : k
		});
		
		var inputAttr10		= new Object();
		var input			= null;
		
		inputAttr10.id			= 'destinationSubRegionId'+k;
		inputAttr10.type		= 'hidden';
		inputAttr10.value		= sdWiseLsSeqCount.destinationSubRegionId;
		inputAttr10.name		= 'destinationSubRegionId'+k;
		inputAttr10.style		= 'width: 50px;text-align: right;';
		inputAttr10.disabled	= 'true';
		
		input	= createInput(MinRange,inputAttr10);
		input.attr( {
			'data-value' : k
		});
		
		var inputAttr11		= new Object();
		var input			= null;
		
		inputAttr11.id			= 'destinationBranchId'+k;
		inputAttr11.type		= 'hidden';
		inputAttr11.value		= sdWiseLsSeqCount.destinationBranchId;
		inputAttr11.name		= 'destinationBranchId'+k;
		inputAttr11.style		= 'width: 50px;text-align: right;';
		inputAttr11.disabled	= 'true';
		
		input	= createInput(MinRange,inputAttr11);
		input.attr( {
			'data-value' : k
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+k;
		buttonEditJS.name		= 'edit'+k;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-info';
		buttonEditJS.onclick	= 'editRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(edit, buttonEditJS);
		buttonEdit.attr({
			'data-value' : k
		});

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+k;
		buttonSaveJS.name		= 'save'+k;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateNextVal(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(edit, buttonSaveJS);
		buttonSave.attr({
			'data-value' : k
		});		

		$('#jsPanelDataContent #allLsSeqCounterTable').append(row);
	}
}

function editRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	//$('#allLsSeqCounterjspanel #minVal'+rmId).removeAttr('disabled');
	//$('#allLsSeqCounterjspanel #maxVal'+rmId).removeAttr('disabled');
	$('#allLsSeqCounterjspanel #nextVal'+rmId).removeAttr('disabled');
	$('#allLsSeqCounterjspanel #save'+rmId).show();
	$(obj).hide();
}

function updateNextVal(obj) {

	var rmId			= obj.getAttribute('data-value');
	if(!InputValidationOnJSPanel(rmId)){
		return false;
	}

	showLayer();
	var jsonObject					= new Object();

	jsonObject["counterId"] 			= $('#allLsSeqCounterjspanel #counterId'+rmId).val();
	jsonObject["sourceBranchId"] 		= $('#allLsSeqCounterjspanel #sourceBranchId'+rmId).val();
	jsonObject["minVal"] 				= $('#allLsSeqCounterjspanel #minVal'+rmId).val();
	jsonObject["maxVal"] 				= $('#allLsSeqCounterjspanel #maxVal'+rmId).val();
	jsonObject["nextVal"] 				= $('#allLsSeqCounterjspanel #nextVal'+rmId).val();
	jsonObject["hideMinRange"]			= $('#allLsSeqCounterjspanel #hideMinRange'+rmId).val();
	jsonObject["hideMaxRange"]			= $('#allLsSeqCounterjspanel #hideMaxRange'+rmId).val();
	jsonObject["hideNextVal"]			= $('#allLsSeqCounterjspanel #hideNextVal'+rmId).val();


	$.ajax({
		url: WEB_SERVICE_URL+'/sdWiseLsSeqCounterWS/updateSrcDestWiseLsSeqCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				hideLayer();
			} else {
				if(data.duplicate == true){
					showDetailedMessage('info', data);
				}else if(data.nextValSuccess > 0){
					showMessage('success', updateNextValueSuccessMsg);
				} else {
					showMessage('success', updateSeqCounterSuccessMsg);
				}
				hideLayer();
			}
		}
	});
}

function showDetailedMessage(type, data) {
	var height = 33;
	$('.' + type).addClass("showElemnt");
	$('.' + type).removeClass("hideElemnt");
	var srcDestWiseLsSeqCounterArr = data.srcDestWiseLsSeqCounterArrLIst;
	$('.' + type).empty();
	$('.' + type).append('<p>Sequence Already Exists For :<span style="float : right;font-size: 20px;"><span onclick="hideAllMessages()" ><span class="glyphicon glyphicon-remove-sign"></span> Close</span></span></p>');
	for (var i = 0; i < srcDestWiseLsSeqCounterArr.length; i++) {
		height	= height + 33;
		$('.' + type).append("<p>Source Branch : " + srcDestWiseLsSeqCounterArr[i].sourceBranchName+ " To : "+srcDestWiseLsSeqCounterArr[i].destinationRegionName +" Destination Region"+srcDestWiseLsSeqCounterArr[i].destinationSubRegionName +" Destination Sub Region"+srcDestWiseLsSeqCounterArr[i].destinationBranchName +" Destination Branch ( Min - "+srcDestWiseLsSeqCounterArr[i].minRange+" And Max -"+srcDestWiseLsSeqCounterArr[i].maxRange+" )</p>")	
	}
	$('.' + type).animate({
		top : "0",
		height : height
	}, 400);
}

function InputValidationOnJSPanel(rmId) {

	minVal				= $('#allLsSeqCounterjspanel #minVal'+rmId).val();
	maxVal				= $('#allLsSeqCounterjspanel #maxVal'+rmId).val();
	nextVal				= $('#allLsSeqCounterjspanel #nextVal'+rmId).val();

	if(minVal = '' || Number(minVal) == 0 || Number(minVal) < 0){
		showMessage('info', minRangeGTZeroErrMsg);
		return false;
	} else if(maxVal = '' || maxVal == 0 || maxVal < 0) {
		showMessage('info', maxRangeGTZeroErrMsg);
		return false;
	} else if(Number($('#allLsSeqCounterjspanel #maxVal'+rmId).val()) <= Number($('#allLsSeqCounterjspanel #minVal'+rmId).val())) {
		showMessage('info', maxRangeGTMinRangeErrMsg);
		return false;
	} else if(nextVal == '' || Number(nextVal) == 0 || Number(nextVal) < 0) {
		showMessage('info', nextValGTZeroErrMsg);
		return false;
	} else if(Number($('#allLsSeqCounterjspanel #nextVal'+rmId).val()) >= Number($('#allLsSeqCounterjspanel #maxVal'+rmId).val()) || Number($('#allLsSeqCounterjspanel #nextVal'+rmId).val()) < Number($('#allLsSeqCounterjspanel #minVal'+rmId).val())) {
		showMessage('info', nextValueGTMinRangeAndLTMaxRangeInfoMsg);
		return false;
	} 

	return true;
}

function createJsPanel(title) {
	var jspanelContent	= $('#jsPanelLSMainContent').html();

	jspanelforratesEdit = $.jsPanel({
		id: 'allLsSeqCounterjspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function setDataTableToJsPanel() {
	var tableId	= '#allLsSeqCounterjspanel #allLsSeqCounterTable';
	// get DataTable Instance
	if(!($.fn.dataTable.isDataTable(tableId))) {
		table = $(tableId).DataTable( {

			"bPaginate": 	  false,
			"bInfo":     	  false,
			"bautoWidth":     false,
			"sDom": '<"top"l>rt<"bottom"ip><"clear">',
			"fnDrawCallback": function ( oSettings ) {

				//Need to redo the counters if filtered or sorted 
				if ( oSettings.bSorted || oSettings.bFiltered ) {
					for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
						$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
					}
				}
			},
			"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
			"aaSorting": [[ 1, 'asc' ]]
		});;
	} 
	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#allLsSeqCounterjspanel #allLsSeqCounterTable #allLsSeqCounterTableTBody td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#allLsSeqCounterjspanel #allLsSeqCounterTable #allLsSeqCounterTableTFoot .tfootClass', '#allLsSeqCounterjspanel #allLsSeqCounterTable #allLsSeqCounterTableTHead tr');
	setFilterOverlayPopupToggle('#allLsSeqCounterjspanel #toggle-popup');
}

function setFilter(obj) {
	var btnVal = $(obj).closest("#popup").find('#setData').val(); // closest function find closest tag of given id.
	if(obj.checked) {
		if(btnVal == "") {
			$(obj).closest("#popup").find('#setData').val(obj.value);
		} else {
			$(obj).closest("#popup").find('#setData').val(btnVal + '|' + obj.value);
		}
	} else {
		if (btnVal.match(/\|/g) == null) {
			btnVal	= "";
		} else {
			if (btnVal.substr(0, btnVal.indexOf('|')) == obj.value) {
				btnVal	= btnVal.replace(obj.value + '|', '');
			} else {
				btnVal	= btnVal.replace('|' + obj.value, '');
			}
		}
		$(obj).closest("#popup").find('#setData').val(btnVal);
	}
}

function setFilterOverlayPopupToggle(popurId) {
	$(popurId).click(function() {
		$(this).closest("th").find('#popup').toggle(); // closest function find closest tag of given id.
	});
}

function setFilterOnTop(dataId, headerId) {
	$(dataId).insertAfter(headerId);
}

function applySearchonDatatable(table, colIdx, searchId, searchFunction, toggalFilterId, toggelAllowed) {
	// Apply the search
	$( searchId, table.column( colIdx ).footer() ).on( searchFunction, function () {
		var valto	= this.value;
		table
		.column( colIdx )
		.search( valto, true, false, true)
		.draw();

		if (toggelAllowed) {
			$(this).closest(toggalFilterId).toggle(); // closest function find closest tag of given id.			
		}
	});
}

function createCheckBoxForMultiSearchFilter(table, tableColumnToIterate, colIdx, appendTableId) {
	var srcBranchArr	= new Array();
	$(tableColumnToIterate).each(function (index) {
		if (srcBranchArr.indexOf($(this).html()) == -1) {
			srcBranchArr.push($(this).html());
			var row		= createRow("tr_", '');
			var col1	= createColumn(row, "td_", '200px', 'left', '', '2');
			var inputAttr1			= new Object();
			inputAttr1.id			= 'filter'+$(this).html();
			inputAttr1.type			= 'checkbox';
			inputAttr1.value		= $(this).html();
			inputAttr1.name			= 'filterCB';
			inputAttr1.onclick		= 'setFilter(this);';

			input	= createInput(col1,inputAttr1);
			input.attr( {
				'data-columnIdx' : colIdx
			});
			$(col1).append("&emsp;" + $(this).html());
			$( appendTableId, table.column( colIdx ).footer() ).append(row);
		}
	});
}

function ValidateAndSearch() {
	srcBranchId 			= getValueFromInputField('srcBranchId');

	if(srcBranchId <= 0) {
		showMessage('error', validSourceBranchErrMsg);
		toogleElement('error','block');
		changeError1('scrBranch','0','0');
		resetValues();
		setValueToTextField('scrBranch', '');
	} else {
		callNextValue();
	}
}

function callNextValue() {
	showLayer();

	var jsonObject		= new Object();
	jsonObject.filter	= 2;

	srcBranchId 			= getValueFromInputField('srcBranchId');
	destRegionId			= getValueFromInputField('destRegion');
	destSubRegionId			= getValueFromInputField('destSubRegion');
	billSelectionId			= getValueFromInputField('billSelection');

	jsonObject.SrcBranchId 			= srcBranchId;
	jsonObject.DestRegionId 		= destRegionId;
	jsonObject.DestSubRegionId 		= destSubRegionId;
	jsonObject.BillSelectionId 		= billSelectionId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				}

				bookingSequenceMin			= data.MinRange;
				bookingSequenceMax			= data.MaxRange;
				bookingSequenceNext 		= data.NextVal;

				if(bookingSequenceMin == 0) {
					showMessage('info', recordNotFoundInfoMsg);
				}

				setMinRange();
				setMaxRange();
				setNextValue();
			});
	hideLayer();
}


function addManualLSSeqenceCounter() {

	showLayer();

	var jsonObject		= new Object();
	jsonObject["filter"]	= 10;

	srcBranchId 		= getValueFromInputField('srcBranchId');
	lsSequenceMin		= getValueFromInputField('manualLsSequenceMin');
	lsSequenceMax		= getValueFromInputField('manualLsSequenceMax');

	jsonObject["SrcBranchId"] 		= srcBranchId;
	jsonObject["LsSequenceMin"] 	= lsSequenceMin;
	jsonObject["LsSequenceMax"] 	= lsSequenceMax;
	
	$.ajax({
		url: WEB_SERVICE_URL+'/sdWiseLsSeqCounterWS/addSDWiseManualLsSeqCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				hideLayer();
			} else {
				if(data.duplicate == true){
					showMessage('info', manualLRSequnceAlreadyExistInfoMsg);
				}else{
					showMessage('success', manualSequenceCounterAddedSuccessMsg);
					resetManualFields();
				}
				hideLayer();
			}
		}
	});

	hideLayer();
}

function populateSubRegions() {

	var jsonObject			= new Object();
	jsonObject.filter		= 1;
	jsonObject.regionId 	= getValueFromInputField('destRegion');

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				}

				setSubRegions(data.subRegions);
			});
}

function setSubRegions(subRegions) {
	document.getElementById('destSubRegion').options.length=1;;
	document.getElementById('destSubRegion').options[0].text ='------ Sub Region  ----';
	document.getElementById('destSubRegion').options[0].value=0;

	for (var i = 0; i < subRegions.length; i++) {
		var reg = subRegions[i];

		createOptionInSelectTag('destSubRegion', reg.subRegionId, reg.subRegionId, reg.name);
	}
}

function setBillSelection() {
	for(const element of billSelectionList) {
		createOptionInSelectTag('billSelection', element.billSelectionId, element.billSelectionId, element.billSelectionName);
	}
}

function setManualBillSelection() {
	for(const element of billSelectionList) {
		createOptionInSelectTag('manualBillSelection', element.billSelectionId, element.billSelectionId, element.billSelectionName);
	}
}

function setMinRange() {
	setValueToTextField('bookingSequenceMin', bookingSequenceMin);
}

function setMaxRange() {
	setValueToTextField('bookingSequenceMax', bookingSequenceMax);
}

function setNextValue() {
	setValueToTextField('bookingSequenceNext', bookingSequenceNext);
	setValueToTextField('lrSequenceNextForUpdate', bookingSequenceNext);
}

function manualFormValidation() {
	if(!validateSrcBranch(1, 'scrBranch')) {
		return false;
	}

	if(!validatebManualSequenceMin(1, 'manualBookingSequenceMin')) {
		return false;
	}

	if(!validatebManualSequenceMax(1, 'manualBookingSequenceMax')) {
		return false;
	} else if(!validateManualMaxRangeByMinRange()) {
		return false;
	}

	if(!validateBillType(1, 'manualBillSelection')) {
		return false;
	}

	return true;
}

function addManualLsSequence() {
	if(manualFormValidation()){
		addManualLSSeqenceCounter();
	}
}

function validateMaxRangeByMinRange() {
	if(Number(getValueFromInputField('lsSequenceMax')) <= Number(getValueFromInputField('lsSequenceMin'))) {
		showMessage('error', maxRangeGTMinRangeErrMsg);
		toogleElement('error', 'block');
		changeError1('lsSequenceMax','0','0');
		return false;
	}
	return true;
}

function validateManualMaxRangeByMinRange() {
	if(Number(getValueFromInputField('manualLsSequenceMax')) <= Number(getValueFromInputField('manualLsSequenceMin'))) {
		showMessage('error', maxRangeGTMinRangeErrMsg);
		toogleElement('error','block');
		changeError1('manualLsSequenceMax', '0', '0');
		return false;
	}
	return true;
}

function resetValues() {
	setValueToTextField('scrBranch', '');
	setValueToTextField('srcBranchId', 0);
	setValueToTextField('destRegion', 0);
	setValueToTextField('destSubRegion', 0);
	setValueToTextField('destBranch', 0);
	setValueToTextField('lsSequenceMin', 0);
	setValueToTextField('lsSequenceMax', 0);
	setValueToTextField('lsSequenceNext', 0);	
}

function resetManualFields() {
	setValueToTextField('scrBranch', '');
	setValueToTextField('srcBranchId', 0);
	setValueToTextField('manualLsSequenceMin', 0);
	setValueToTextField('manualLsSequenceMax', 0);
}
//------------------------------------------------------------------------------------------------
//Work For Show LR Sequence Counter Filter Wise
function openLSSequenceCounterPannel() {
	createJsPanel("LS Sequence Counter");
	loadLSSequenceCounterPannel();
}

function loadLSSequenceCounterPannel() {
	showLayer();

	var jsonObject			= new Object();

	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getRegionOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setSourceRegions(data.region);
			hideLayer();
		}
	});
}

function populateSourceSubRegions() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["regionSelectEle_primary_key"]		= $('#allLsSeqCounterjspanel #srcRegion').val();
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setSourceSubRegions(data.subRegion);
			hideLayer();
		}
	});
}
function populateSourceBranch() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["subRegionSelectEle_primary_key"]		= $('#allLsSeqCounterjspanel #srcSubRegion').val();
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setSourceBranch(data.sourceBranch);
			hideLayer();
		}
	});
}

function setSourceRegions(regions) {

	createOptionInSelectTag('allLsSeqCounterjspanel #srcRegion', 0,0, '---- Select Region ----');
	for (var i = 0; i < regions.length; i++) {
		var reg = regions[i];
		createOptionInSelectTag('allLsSeqCounterjspanel #srcRegion', reg.regionId, reg.regionId, reg.regionName)
	}
	createOptionInSelectTag('allLsSeqCounterjspanel #srcRegion', -1,-1, 'ALL');
}
function setSourceSubRegions(subRegions) {
	removeOption('allLsSeqCounterjspanel #srcSubRegion', null);
	removeOption('allLsSeqCounterjspanel #srcBranch', null);
	createOptionInSelectTag('allLsSeqCounterjspanel #srcSubRegion', 0,0, '---- Select Sub Region ----');
	createOptionInSelectTag('allLsSeqCounterjspanel #srcBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < subRegions.length; i++) {
		var subreg = subRegions[i];
		createOptionInSelectTag('allLsSeqCounterjspanel #srcSubRegion', subreg.subRegionId, subreg.subRegionId, subreg.subRegionName)
	}
}
function setSourceBranch(sourceBranch) {

	removeOption('allLsSeqCounterjspanel #srcBranch', null);
	createOptionInSelectTag('allLsSeqCounterjspanel #srcBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < sourceBranch.length; i++) {
		var srcBranch = sourceBranch[i];
		createOptionInSelectTag('allLsSeqCounterjspanel #srcBranch', srcBranch.branchId, srcBranch.branchId, srcBranch.branchName)
	}
}

function validateSequenceCounter() {
	if(!validateInput('allLsSeqCounterjspanel #srcRegion','allLsSeqCounterjspanel #srcRegion','Select Region')){
		return false;
	}
	if(!validateInput('allLsSeqCounterjspanel #srcSubRegion','allLsSeqCounterjspanel #srcSubRegion','Select Sub Region')){
		return false;
	}
	if(!validateInput('allLsSeqCounterjspanel #srcBranch','allLsSeqCounterjspanel #srcBranch','Select Branch')){
		return false;
	}
	return true;
}

function validateInput(elementID, errorElementId, errorMsg) {

	if ($('#'+elementID).val() == '' || $('#'+elementID).val() == 0) {
		showMessage('error', errorMsg);
		$('#'+elementID).focus();
		isValidationError=true;

		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
	}
	return true;
}

function getSDWiseLSSequenceCounterForDisplay() {
	
	showLayer();

	srcBranchId 					= getValueFromInputField('srcBranchId');
	destRegionId					= getValueFromInputField('destRegion');
	destSubRegionId					= getValueFromInputField('destSubRegion');
	destBranchId					= getValueFromInputField('destBranch');

	var jsonObject					= new Object();

	jsonObject["SrcBranchId"]		= srcBranchId;
	jsonObject["DestRegionId"] 		= destRegionId;
	jsonObject["DestSubRegionId"] 	= destSubRegionId;
	jsonObject["DestBranchId"] 		= destBranchId;

	console.log("jsonObject : " ,jsonObject);
	
	$.ajax({
		url: WEB_SERVICE_URL+'/sdWiseLsSeqCounterWS/GetSDWiseLSSequenceCounterByBranchORSubRegionIdForDisplay.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			console.log("sdWiseLSSeqCounter : " ,data.sdWiseLSSeqCounter)
			if(data.sdWiseLSSeqCounter != undefined) {
				setMinMaxRange(data.sdWiseLSSeqCounter);
			}
			hideLayer();
		}
	});

	hideLayer();
}

function setMinMaxRange(sdWiseLSSeqCounter) {
	$('#lsSequenceMin').val(sdWiseLSSeqCounter.minRange);
	$('#lsSequenceMax').val(sdWiseLSSeqCounter.maxRange);
	$('#lsSequenceNext').val(sdWiseLSSeqCounter.nextVal + 1);
}