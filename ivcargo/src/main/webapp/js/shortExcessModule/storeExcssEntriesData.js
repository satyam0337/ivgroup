/**
 * @Author Anant Chaudhary	29-11-2015
 */

var totalExcess	= 0;

function storeExcessEntriesData() {

	if(!excessReceiveFormValidation()) {return false;};

	var lrNumber		= getValueFromInputField('excessLRNumber');
	var wayBillId		= getValueFromInputField('excessWayBillId');
	var lsNumber		= getValueFromInputField('excessLSNumber');
	var dispatchId		= getValueFromInputField('excessDispatchLedgerId')
	var privateMark		= getValueFromInputField('privateMark');
	var packingTypeId	= getValueFromInputField('packingTypeMasterId');
	var typeOfPacking	= document.excessReceive.packingTypeMasterId[document.excessReceive.packingTypeMasterId.selectedIndex].text;
	var saidToContain	= getValueFromInputField('saidToContain');
	var excessArticle	= getValueFromInputField('excessArticle');
	var excessWeight	= getValueFromInputField('excessWeight');
	var remark			= getValueFromInputField('excessRemark');
	
	if(saidToContain == '') saidToContain	= null;
	if(remark == '') remark	= null;
	
	var bindExcessData	= wayBillId + '_' + lrNumber + '_' + lsNumber + '_' + dispatchId + '_' + privateMark + '_' + packingTypeId + '_' + saidToContain + '_' + excessArticle + '_' + excessWeight + '_' + remark;
	
	checkBoxJsonObject1		= new Object();
	checkBoxJsonObject		= new Object();
	
	checkBoxJsonObject1.type	= 'checkbox';
	checkBoxJsonObject1.id		= '';
	checkBoxJsonObject1.name	= 'checkbox';
	
	checkBoxJsonObject.type		= 'checkbox';
	checkBoxJsonObject.id		= 'excessCheckBox';
	checkBoxJsonObject.name		= 'excessCheckBox';
	checkBoxJsonObject.value	= bindExcessData;
	checkBoxJsonObject.checked	= 'checked';
	checkBoxJsonObject.style	= 'display: none';
	
	deleteButtonJsonObject		= new Object();
	
	deleteButtonJsonObject.type		= 'button';
	deleteButtonJsonObject.id		= 'delete';
	deleteButtonJsonObject.class	= 'button';
	deleteButtonJsonObject.name		= 'delete';
	deleteButtonJsonObject.value	= 'Delete';
	deleteButtonJsonObject.onclick	= 'deleteExcessEntries("excessDetails", "' + lrNumber + '")';
	
	var excessRow		= createRow('', '');
	
	var srNoCol				= createNewColumn(excessRow, '', '', '', '', '', '');
	var lrNumberCol			= createNewColumn(excessRow, '', '', '', '', '', '');
	var wayBillIdCol		= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
	var lsNumberCol			= createNewColumn(excessRow, '', '', '', '', '', '');
	var dispatchIdCol		= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
	var privateMarkCol		= createNewColumn(excessRow, '', '', '', '', '', '');
	var packingTypeIdCol	= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
	var packingTypeNameCol	= createNewColumn(excessRow, '', '', '', '', '', '');
	var saidToContainCol	= createNewColumn(excessRow, '', '', '', '', '', '');
	var excessArticleCol	= createNewColumn(excessRow, '', '', '', '', '', '');
	var excessWeightCol		= createNewColumn(excessRow, '', '', '', '', '', '');
	var remarkCol			= createNewColumn(excessRow, '', '', '', '', '', '');
	var deleteButtonCol		= createNewColumn(excessRow, '', '', '', '', '', '');
	
	createCheckBox(srNoCol, checkBoxJsonObject1);
	createCheckBox(srNoCol, checkBoxJsonObject);

	lrNumberCol.append(lrNumber);
	wayBillIdCol.append(wayBillId);
	lsNumberCol.append(lsNumber);
	dispatchIdCol.append(dispatchId);
	privateMarkCol.append(privateMark);
	packingTypeIdCol.append(packingTypeId);
	packingTypeNameCol.append(typeOfPacking);
	saidToContainCol.append(saidToContain != null ? saidToContain : "--");
	excessArticleCol.append(excessArticle);
	excessWeightCol.append(excessWeight);
	remarkCol.append(remark);
	
	createInput(deleteButtonCol, deleteButtonJsonObject);
	
	$("#excessDetails").append(excessRow);
	
	totalExcess++;
	
	setValueToHtmlTag('totalExcess', totalExcess);

	if(document.getElementById('wayBillNumber_'+lrNumber)) {
		document.getElementById('wayBillNumber_'+lrNumber).style.color  = "magenta";
	}
	
	changeDisplayProperty('viewTotalExcess', 'inline');
	
	closeJqueryDialog('dialogExcessForm');
}

function storeExcessEntriesFromDBData(excessEntryDetails) {
	var excessEntryDetail = null;
	
	if(excessEntryDetails != undefined && excessEntryDetails.length > 0) {
		for (var i = 0; i < excessEntryDetails.length; i++) {
			excessEntryDetail	= excessEntryDetails[i];
			var lrNumber		= excessEntryDetail.wayBillNumber;
			var wayBillId		= excessEntryDetail.wayBillId;
			var lsNumber		= excessEntryDetail.lsNumber;
			var dispatchId		= excessEntryDetail.dispatchLedgerId;
			var privateMark		= "";
			var packingTypeId	= excessEntryDetail.packingTypeId;
			var typeOfPacking	= excessEntryDetail.packingTypeName;
			var saidToContain	= excessEntryDetail.packingTypeName;
			var excessArticle	= excessEntryDetail.totalQuantity;
			var excessWeight	= excessEntryDetail.totalWeight;
			var remark			= excessEntryDetail.remark;
			
			var bindExcessData	= wayBillId + '_' + lrNumber + '_' + lsNumber + '_' + dispatchId + '_' + privateMark + '_' + packingTypeId + '_' + saidToContain + '_' + excessArticle + '_' + excessWeight + '_' + remark;
			
			checkBoxJsonObject1		= new Object();
			checkBoxJsonObject		= new Object();
			
			checkBoxJsonObject1.type	= 'checkbox';
			checkBoxJsonObject1.id		= '';
			checkBoxJsonObject1.name	= 'checkbox';
			
			checkBoxJsonObject.type		= 'checkbox';
			checkBoxJsonObject.id		= 'excessCheckBox';
			checkBoxJsonObject.name		= 'excessCheckBox';
			checkBoxJsonObject.value	= bindExcessData;
			checkBoxJsonObject.checked	= 'checked';
			checkBoxJsonObject.style	= 'display: none';
			
			deleteButtonJsonObject		= new Object();
			
			deleteButtonJsonObject.type		= 'button';
			deleteButtonJsonObject.id		= 'delete';
			deleteButtonJsonObject.class	= 'button';
			deleteButtonJsonObject.name		= 'delete';
			deleteButtonJsonObject.value	= 'Delete';
			deleteButtonJsonObject.onclick	= 'deleteExcessEntries("excessDetails", "' + lrNumber + '")';
			
			var excessRow		= createRow('', '');
			
			var srNoCol				= createNewColumn(excessRow, '', '', '', '', '', '');
			var lrNumberCol			= createNewColumn(excessRow, '', '', '', '', '', '');
			var wayBillIdCol		= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
			var lsNumberCol			= createNewColumn(excessRow, '', '', '', '', '', '');
			var dispatchIdCol		= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
			var privateMarkCol		= createNewColumn(excessRow, '', '', '', '', '', '');
			var packingTypeIdCol	= createNewColumn(excessRow, '', '', '', '', 'display: none;', '');
			var packingTypeNameCol	= createNewColumn(excessRow, '', '', '', '', '', '');
			var saidToContainCol	= createNewColumn(excessRow, '', '', '', '', '', '');
			var excessArticleCol	= createNewColumn(excessRow, '', '', '', '', '', '');
			var excessWeightCol		= createNewColumn(excessRow, '', '', '', '', '', '');
			var remarkCol			= createNewColumn(excessRow, '', '', '', '', '', '');
			var deleteButtonCol		= createNewColumn(excessRow, '', '', '', '', '', '');
			
			createCheckBox(srNoCol, checkBoxJsonObject1);
			createCheckBox(srNoCol, checkBoxJsonObject);
			
			lrNumberCol.append(lrNumber);
			wayBillIdCol.append(wayBillId);
			lsNumberCol.append(lsNumber);
			dispatchIdCol.append(dispatchId);
			privateMarkCol.append(privateMark);
			packingTypeIdCol.append(packingTypeId);
			packingTypeNameCol.append(typeOfPacking);
			saidToContainCol.append(saidToContain);
			excessArticleCol.append(excessArticle);
			excessWeightCol.append(excessWeight);
			remarkCol.append(remark);
			
			createInput(deleteButtonCol, deleteButtonJsonObject);
			
			$("#excessDetails").append(excessRow);
			
			totalExcess++;
			
			setValueToHtmlTag('totalExcess', totalExcess);
			
			if(document.getElementById('wayBillNumber_'+lrNumber)) {
				document.getElementById('wayBillNumber_'+lrNumber).style.color  = "magenta";
			}
			
			changeDisplayProperty('viewTotalExcess', 'inline');
		}
	}
}

function viewTotalAddExcess() {
	showDialogBox('excessOverlay', 'storeExcessData');
}

function deleteExcessEntries(excessTableId, lrNumber) {
	
	var noOfArticlesAdded	= 0;
	
	var tableEl 	= document.getElementById(excessTableId);
	
	var found 		= false;
	for (var row = tableEl.rows.length-1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
			var el  = tableEl.rows[row];
			el.parentNode.removeChild(el);
			found = true;
			noOfArticlesAdded --;
			
			totalExcess -- ;
		}
	}
	
	setValueToHtmlTag('totalExcess', totalExcess);

	if(!found) {
		if(tableEl.rows.length==1) {
			alert('There is no Article to delete !');
			return false;
		} else {
			showMessage('error', selectExcessDetailsErrMsg);
			return false;
		}
	} 

	if(totalExcess == 0) {
		HideDialog('excessOverlay', 'storeExcessData');
		changeDisplayProperty('viewTotalExcess', 'none');
	}
}