/**
 * @Author	Anant Chaudhary	16-01-2015
 */

var	srNo					= 0;

function allowNavigation() {
	initialiseFocus();
	$("#selectiontype").focus();
	setCollectionPersonAutoComplete();
	setPartyAutoComplete();
	setCollectionPersonAutoCompleteForDataSearch();
}

function makeSelection() {
	var selectiontype = getValueFromInputField('selectiontype');

	if(isShowBothOptionInPartyWiseSelection && selectiontype == 3) {
		$("#txnType option[value='3']").show();
	}else if(isShowBothOptionInBranchWiseSelection && selectiontype == 1) {
		$("#txnType option[value='3']").show();
	}else if(isShowBothOptionInLrNumberWiseSelection && selectiontype == 2) {
		$("#txnType option[value='3']").show();
	}else  {
		$("#txnType option[value='3']").hide();
	}

	if(selectiontype == 1) {

		changeDisplayProperty('middle-border-boxshadow',  'none');
		changeDisplayProperty('selectFromLRNumbers', 'none');
		changeDisplayProperty('selectParty', 'none');
		changeDisplayProperty('selectBranches', 'inline');
		changeDisplayProperty('selectTxnType', 'table-row');
		changeDisplayProperty('findButton', 'table-row');
		changeDisplayProperty('noRecordsFoundRow', 'table-row');
		setValueToTextField('txnType', 0);
		setValueToTextField('partyAuto', "");
		setValueToTextField('partyId', 0);
		setValueToTextField('searchPartyName', "");
		changeDisplayProperty('collectionPersonDiv', 'none');
		setValueToTextField('billSelectionTypeId', '0');

		deleteTableData();
		emptyChildInnerValue('selectedLRNumbers', 'tbody');
	} else if(selectiontype == 2) {

		removeTableRows('reportTable', 'table');

		changeDisplayProperty('selectFromLRNumbers', 'inline');
		changeDisplayProperty('selectTxnType', 'table-row');
		changeDisplayProperty('selectBranches', 'none');
		changeDisplayProperty('selectParty', 'none');
		changeDisplayProperty('findButton', 'none');
		changeDisplayProperty('noRecordsFoundRow', 'none');
		setValueToTextField('txnType', 0);
		setValueToTextField('region', -1);
		setValueToTextField('subRegion', -1);
		setValueToTextField('branch', 0);
		setValueToTextField('partyAuto', "");
		setValueToTextField('partyId', 0);
		setValueToTextField('searchPartyName', "");
		changeDisplayProperty('middle-border-boxshadow',  'none');
		changeDisplayProperty('collectionPersonDiv', 'none');
		setValueToTextField('billSelectionTypeId', '0');

		emptyChildInnerValue('selectedLRNumbers', 'tbody');
	} else if(selectiontype == 3) {
		$(".searchPartyDiv").addClass('hide');
		removeTableRows('reportTable', 'table');

		changeDisplayProperty('selectFromLRNumbers', 'none');
		changeDisplayProperty('selectParty', 'inline');
		changeDisplayProperty('selectTxnType', 'table-row');
		changeDisplayProperty('selectBranches', 'inline');
		changeDisplayProperty('findButton', 'table-row');
		changeDisplayProperty('noRecordsFoundRow', 'none');
		setValueToTextField('txnType', 0);
		setValueToTextField('region', -1);
		setValueToTextField('subRegion', -1);
		setValueToTextField('branch', 0);
		setValueToTextField('partyAuto', "");
		//setValueToTextField('partyId', 0);
		changeDisplayProperty('middle-border-boxshadow',  'none');
		changeDisplayProperty('collectionPersonDiv', 'none');
		emptyChildInnerValue('selectedLRNumbers', 'tbody');
		setValueToTextField('billSelectionTypeId', 0);

		setPartyAutoComplete();

		/*$("#branch").change(function() {
			setPartyAutoComplete();
			setSearchPartyNameAutoComplete();
		});*/

		partyWiseStbsCreation();
	} else if(selectiontype == 4) {
		removeTableRows('reportTable', 'table');

		changeDisplayProperty('selectParty', 'none');
		changeDisplayProperty('selectFromLRNumbers', 'none');
		changeDisplayProperty('collectionPersonDiv', 'inline');
		changeDisplayProperty('selectTxnType', 'table-row');
		changeDisplayProperty('selectBranches', 'inline');
		changeDisplayProperty('findButton', 'table-row');
		changeDisplayProperty('noRecordsFoundRow', 'none');
		setValueToTextField('txnType', 0);
		setValueToTextField('region', -1);
		setValueToTextField('subRegion', -1);
		setValueToTextField('branch', 0);
		setValueToTextField('partyAuto', "");
		setValueToTextField('partyId', 0);
		changeDisplayProperty('middle-border-boxshadow',  'none');
		setValueToTextField('billSelectionTypeId', 0);

		emptyChildInnerValue('selectedLRNumbers', 'tbody');

		$('#collectionPersonAuto').val(''); 
		setCollectionPersonAutoCompleteForDataSearch();
		collectionPersionWiseStbsCreation();
	}

	wayBillIdList	= [];

	changeDisplayProperty('createBillButtonRow', 'none');

	if(stbsCreationWithParty) {
		setSearchPartyNameAutoComplete();
	}

	$("#region").change(function(){
		$('#partyAuto').val('');
	});

	$("#subRegion").change(function(){
		$('#partyAuto').val('');
	});


	$("#branch").change(function(){
		$('#partyAuto').val('');
	});

}
function collectionPersionWiseStbsCreation(){
	$("#collectionPersonAuto").change(function(){
		deleteTableData();
		removeTableRows('reportTable2', 'table');
		//$("#find").trigger('click');
	});
}

function partyWiseStbsCreation(){
	$("#partyAuto").change(function(){
		deleteTableData();
		removeTableRows('reportTable2', 'table');
		//$("#find").trigger('click');
	});
}

function deleteTableData() {

	var reportTable 	= document.getElementById("reportTable");

	if(reportTable.rows.length > 2) {
		removeTableRows('reportTable', 'table');
		removeTableRows('selectedLRNumbers', 'table');

		setValueToTextField('searchCollectionPerson', '');
		setValueToTextField('remark', '');
		setValueToTextField('selectedCollectionPersonId', 0);
	}
}

function disableButtons() {
	setClassName('DownSaveButton', 'btn_print_disabled');
	enableDisableInputField('DownSaveButton', 'true');
	changeDisplayProperty('DownSaveButton', 'none');

	setClassName('UpSaveButton', 'btn_print_disabled');
	enableDisableInputField('UpSaveButton', 'true');
	changeDisplayProperty('UpSaveButton', 'none');

	enableDisableInputField('Find', 'true');
	changeDisplayProperty('Find', 'none');
}

function validatecheck() {
	var tableEle 		= document.getElementById('reportTable');
	var conter 			= 0;
	
	if(allowBackDateEntryForStbsCreation) {
		var stbsDate 		= $('#stbsBillCreationDate').val();
		
		var newStbsDate 	= stbsDate.split("-");
		var stbsDateTime 	= new Date( newStbsDate[2], newStbsDate[1] - 1, newStbsDate[0]);
	}

	for(i = 1; i < tableEle.rows.length - 1; i++) {
		if(tableEle.rows[i].cells[1].children[0].checked) {
			conter++;
			
			if(allowBackDateEntryForStbsCreation) {
				var wayBillId	= Number(tableEle.rows[i].cells[1].children[0].value.split(";")[0]);
				
				var lrDate 		= $('#bookDate_'+wayBillId).text();
				
				var newLrDate 	= lrDate.split("-");
				var lrDateTime 	= new Date(newLrDate[2], newLrDate[1] - 1, newLrDate[0]);
				
				if(stbsDateTime.getTime() < lrDateTime.getTime()) {
					showMessage('info',"You Cannot Enter STBS Date Before LR Date " + lrDate);
					return false;
				} 
			}
		}
	}

	if(conter > 0) {
		if(checkForCollectionPerson()) {
			if(checkForParty()){
				if(confirm(createBillAlertMsg)) {
					disableButtons();
					showLayer();
					document.createBill.submit();
				}
			}
		}
	} else {
		showMessage('error', selectLrErrMsg);
		toogleElement('error', 'block');
		return false;
	}
}

function checkForCollectionPerson() {
	if(allowSTBSCreationWithoutCollectionPerson)
		return true;
		
	var collectionPersonId = getValueFromInputField('selectedCollectionPersonId');

	if(collectionPersonId == 0 || collectionPersonId == '' || collectionPersonId == null) {
		showMessage('error', validCollectionPersionErrMsg);
		changeTextFieldColor('searchCollectionPerson', '', '', 'red');
		return false;
	} else
		return true;
}

function checkForParty() {

	if(!$('.searchPartyDiv').length || !$('.searchPartyDiv').is(':visible')) {
		return true
	}

	if(isPartyRequired && stbsCreationWithParty && isPartyRequiredBySubRegionWise) {
		var partyId = getValueFromInputField('partyId');

		if(partyId == 0 || partyId == '' || partyId == null) {
			showMessage('error', validPartyNameErrMsg);
			changeTextFieldColor('searchPartyName', '', '', 'red');
			return false;
		} else
			return true;
	}
	return true
}

function openWindowForView(id, type, branchId) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId);
}

function storeSelectedValues() {
	var selectedRegion 		= document.getElementById('region');
	var selectedSubRegion 	= document.getElementById('subRegion');
	var selectedBranch 		= document.getElementById('branch');

	if(selectedRegion != null) {
		setValueToTextField('selectedRegion', selectedRegion.options[selectedRegion.selectedIndex].text);
	}

	if(selectedSubRegion != null) {
		setValueToTextField('selectedSubRegion', selectedSubRegion.options[selectedSubRegion.selectedIndex].text);
	}

	if(selectedBranch != null) {
		setValueToTextField('selectedBranch', selectedBranch.options[selectedBranch.selectedIndex].text);
	}
}

function ValidateFormElement() {
	var selectiontype 	= getValueFromInputField('selectiontype');
	var selectBranches 	= document.getElementById('selectBranches');
	var regionId 		= getValueFromInputField('region');
	var subRegionId 	= getValueFromInputField('subRegion');
	var branchId 		= getValueFromInputField('branch');
	var txnTypeId 		= getValueFromInputField('txnType');

	if(selectiontype <= 0) {
		showMessage('error', selectionErrMsg);
		changeTextFieldColor('selectiontype', '', '', 'red');
		return false;
	}

	if(txnTypeId <= 0) {
		showMessage('error', transactionTypeErrMsg);
		changeTextFieldColor('txnType', '', '', 'red');
		return false;
	}

	if(regionId != null) {
		if(regionId <= 0) {
			showMessage('error', regionNameErrMsg);
			changeTextFieldColor('region', '', '', 'red');
			return false;
		}
	}

	if(subRegionId != null) {
		if(subRegionId <= 0) {
			showMessage('error', subRegionNameErrMsg);
			changeTextFieldColor('subRegion', '', '', 'red');
			return false;
		}
	}

	if(branchId != null) {
		if(branchId <= -1) {
			showMessage('error', branchNameErrMsg);
			changeTextFieldColor('branch', '', '', 'red');
			return false;
		}
	}

	return true;
}

function resetError1(el) {
	toogleElement('error', 'none');
	toogleElement('msg', 'none');
	removeError(el.id);
}

function resetError(el) {
	toogleElement('basicError', 'none');
	toogleElement('msg', 'none');
	removeError(el.id);
}

function setCollectionPersonAutoComplete() {
	$('#searchCollectionPerson').prop("autocomplete", "on");

	$("#searchCollectionPerson").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter=1",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#selectedCollectionPersonId").val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setCollectionPersonAutoCompleteForDataSearch() {
	$('#collectionPersonAuto').prop("autocomplete", "on");

	$("#collectionPersonAuto").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter=1",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#collectionPersonId").val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setPartyAutoComplete() {

	var branchId = $("#branch").val();


	if(branchId == undefined) {
		branchId	= -1;
	}
	$("#partyAuto").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType="+2+"&destinationId="+branchId+"&destinationBranchId="+branchId+"&responseFilter="+2+"&isBlackListPartyCheckingAllow="+false+"&moduleFilterForBlackListPartyChecking=1&searchPartyOnAllDest=true&partyAutoCompleteWithNameAndGST="+partyAutoCompleteWithNameAndGST,
		minLength: 2,
		delay: 5,
		autoFocus: true,
		select: function(event, ui) {
			$("#partyId").val(ui.item.id);
		}
	});
}

function setSearchPartyNameAutoComplete() {

	var branchId = $("#branch").val();

	if(branchId == undefined) {
		branchId	= -1;
	}

	$("#searchPartyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType="+0+"&destinationId="+branchId+"&destinationBranchId="+branchId+"&responseFilter="+2+"&isBlackListPartyCheckingAllow="+false+"&moduleFilterForBlackListPartyChecking=1&searchPartyOnAllDest=true",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			$("#partyId").val(ui.item.id);
		}
	});
}

function HideShowDateRange(){
	if(document.getElementById('DateRange').checked == true){
		$("#dateHideShow").removeClass('hide');
	}else{
		$("#dateHideShow").addClass('hide');
	}
}