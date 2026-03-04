/**
 * @author Anant Chaudhary	28-11-2015
 */
var		shortUniqueValue	= 1;

function storeShortEntriesData() {
	if(!shortReceiveFormValidation()) {return false;};
	if(!validateTotalShortArt()) {return false;};
	
	var shortPrivateMark		= null;
	
	var shortLrNumber 			= $('#shortLrNumber').val();
	var shortWayBillId			= $('#shortWayBillId').val();
	var shortLsNumber 			= $('#shortLsNumber').val();
	var shortDispatchLedgerId	= $('#shortDispatchLedgerId').val();
	var truckNumber 			= $('#truckNumber').val();
	var vehicleNumberMasterId	= $('#vehicleMasterId').val();	
	var actualWeight			= $('#actualWeight').val();
	var actUnloadWeight			= $('#actUnloadWeight').val();
	var shortWeight				= $('#shortWeight').val();
	var amount					= $('#amount').val();
	
	if($('#shortPrivateMark').val() != '') {
		shortPrivateMark		= $('#shortPrivateMark').val();
	}
	
	var shortRemark				= $('#shortRemark').val();
	
	if(isNaN(actUnloadWeight) || actUnloadWeight == '') {
		actUnloadWeight 	= 0;
	}
	
	if(isNaN(shortWeight) || shortWeight == '') {
		shortWeight			= 0;
	}
	
	if(isNaN(amount) || amount == '') {
		amount				= 0;
	}
	
	var bindShortData		= shortUniqueValue + '_' + shortLrNumber + '_' + shortWayBillId + '_' + shortLsNumber + '_' + shortDispatchLedgerId + '_' + truckNumber + '_' + vehicleNumberMasterId + '_' + actUnloadWeight + '_' + shortPrivateMark + '_' + shortWeight + '_' + amount + '_' + shortRemark;
	
	var checkBoxJsonObject1		= new Object();
	var checkBoxJsonObject		= new Object();
	
	checkBoxJsonObject1.type	= 'checkbox';
	checkBoxJsonObject1.id		= '';
	checkBoxJsonObject1.name	= 'checkbox1';
	
	checkBoxJsonObject.type		= 'checkbox';
	checkBoxJsonObject.id		= 'shortCheckBox';
	checkBoxJsonObject.name		= 'shortCheckBox';
	checkBoxJsonObject.value	= bindShortData;
	checkBoxJsonObject.checked	= 'checked';
	checkBoxJsonObject.style	= 'display: none';
	
	deleteButtonJsonObject		= new Object();
	
	deleteButtonJsonObject.type		= 'button';
	deleteButtonJsonObject.id		= 'delete';
	deleteButtonJsonObject.class	= 'button';
	deleteButtonJsonObject.name		= 'delete';
	deleteButtonJsonObject.value	= 'Delete';
	deleteButtonJsonObject.onclick	= 'deleteShortEntries("shortDetails", "' + shortLrNumber + '", ' + shortUniqueValue + ', ' + shortWayBillId +  ')';

	var shortRow		= createRow('shortData', '');
	
	var checkBoxCol			= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortLrNumberCol	= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortWayBillIdCol	= createNewColumn(shortRow, '', '', '', '', 'display: none', '');
	var shortLsNumberCol	= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortDispatchIdCol	= createNewColumn(shortRow, '', '', '', '', 'display: none', '');
	var truckNumberCol		= createNewColumn(shortRow, '', '', '', '', '', '');
	
	if(shortReceiveConfig.ActualWeight == 'true') {
		var actualWeightCol		= createNewColumn(shortRow, '', '', '', '', '', '');
	}
	
	if(shortReceiveConfig.ActUnloadWeight == 'true') {
		var actUnloadWeightCol	= createNewColumn(shortRow, '', '', '', '', '', '');
	}
	
	var shortPrivateMarkCol	= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortWeightCol		= createNewColumn(shortRow, '', '', '', '', '', '');
	var amountCol			= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortRemarkCol		= createNewColumn(shortRow, '', '', '', '', '', '');
	var shortArtCol			= createNewColumn(shortRow, '', '', '', '', '', '');
	var deleteButtonCol		= createNewColumn(shortRow, '', '', '', '', '', '');
	
	createCheckBox(checkBoxCol, checkBoxJsonObject1);
	createCheckBox(checkBoxCol, checkBoxJsonObject);
	
	$(shortLrNumberCol).append(shortLrNumber);
	$(shortWayBillIdCol).append(shortWayBillId);
	$(shortLsNumberCol).append(shortLsNumber);
	$(shortDispatchIdCol).append(shortDispatchLedgerId);
	$(truckNumberCol).append(truckNumber);
	
	if(shortReceiveConfig.ActualWeight == 'true') {
		$(actualWeightCol).append(actualWeight);
	}
	
	if(shortReceiveConfig.ActUnloadWeight == 'true') {
		$(actUnloadWeightCol).append(actUnloadWeight);
	}
	
	$(shortPrivateMarkCol).append(shortPrivateMark);
	$(shortWeightCol).append(shortWeight);
	$(amountCol).append(amount);
	$(shortRemarkCol).append(shortRemark);
	
	createInput(deleteButtonCol, deleteButtonJsonObject);

	var shortArtTable = storeShortArticleData(shortUniqueValue, shortLrNumber, shortWayBillId);
	
	$(shortArtCol).append(shortArtTable);
		
	$("#shortDetails").append(shortRow);
	
	totalShort++;
	shortUniqueValue++;
	
	setValueToHtmlTag('totalShort', totalShort);
	changeHtmlTagColor('lrcol_' + shortWayBillId, '', 'red', '', '');
	changeDisplayProperty('viewTotalShort', 'inline');
	
	closeJqueryDialog('dialogShortForm');
}

function storeShortArticleData(uniqueVal, lrNumber, wayBillId) {

	var shortArtRow 			= null;
	var articleType				= null;
	var packingTypeId			= 0;
	var shortArticle			= 0;
	var saidToContain			= "-----";
	var totalArticle			= 0;
	var totalShortArticle		= 0;
	var consignmentDetailsId	= 0;

	var length = $("#articleDetailsForShort tbody tr").length;

	var shortArtTable		= createTable('shortArtTable_' + wayBillId, 'pure-table pure-table-bordered', '');
	
	var shortArtTitleRow	= createRow('', '');
	
	var articleTypeNameCol		= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var totalArticleNameCol		= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var shortArticleNameCol		= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var saidToContainNameCol	= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	
	$(articleTypeNameCol).append("Article Type");
	$(totalArticleNameCol).append("Total Art");
	$(shortArticleNameCol).append("Short Art");
	$(saidToContainNameCol).append("Said To Contain");
	
	$(shortArtTable).append(shortArtTitleRow);

	for(var i = 0; i < length; i++) {
		articleType				= $('#shortArticleType_' + wayBillId + '_' + [i + 1]).val();
		packingTypeId			= $('#shortPackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
		totalArticle			= $('#totalShortArticle_' + wayBillId + '_' + [i + 1]).val();
		shortArticle			= $('#shortArticle_' + wayBillId + '_' + [i + 1]).val();
		consignmentDetailsId	= $('#shortConsignmentDetailsId_' + wayBillId + '_' + [i + 1]).val();

		if(shortArticle > 0) {
			if($('#shortSaidToContain_' + wayBillId + '_' + [i + 1]).val() == '') {
				saidToContain 	= "-----";
			} else {
				saidToContain	= $('#shortSaidToContain_' + wayBillId + '_' + [i + 1]).val();
			}

			var bindShortArtData	= uniqueVal + '_' + lrNumber + '_' + wayBillId + '_' + packingTypeId + '_' + totalArticle + '_' + shortArticle + '_' + consignmentDetailsId + '_' + saidToContain;

			var checkBoxJsonObject		= new Object();

			checkBoxJsonObject.type		= 'checkbox';
			checkBoxJsonObject.id		= 'shortArtCheckBox';
			checkBoxJsonObject.name		= 'shortArtCheckBox';
			checkBoxJsonObject.value	= bindShortArtData;
			checkBoxJsonObject.checked	= 'checked';
			checkBoxJsonObject.style	= 'display: none';

			shortArtRow		= createRow('shortArt_1' + uniqueVal, '');

			var checkBoxCol			= createNewColumn(shortArtRow, '', '', '', '', 'display: none', '');
			var articleTypeCol		= createNewColumn(shortArtRow, '', '', '', '', 'font-size: 11px; width: 100px;', '');
			var packingTypeIdCol	= createNewColumn(shortArtRow, '', '', '', '', 'display: none; font-size: 11px; width: 20px;', '');
			var totalArticleCol		= createNewColumn(shortArtRow, '', '', '', '', 'font-size: 11px; width: 20px;', '');
			var shortArticleCol		= createNewColumn(shortArtRow, '', '', '', '', 'font-size: 11px; width: 20px;', '');
			var saidToContainCol	= createNewColumn(shortArtRow, '', '', '', '', 'font-size: 11px; width: 150px;', '');

			createCheckBox(checkBoxCol, checkBoxJsonObject);

			$(articleTypeCol).append(articleType);
			$(packingTypeIdCol).append(packingTypeId);
			$(totalArticleCol).append(totalArticle);
			$(shortArticleCol).append(shortArticle);
			$(saidToContainCol).append(saidToContain);

			$(shortArtTable).append(shortArtRow);	
		}
		
		totalShortArticle	+= shortArticle;
		totalShortArr.push({uniqueVal: uniqueVal, wayBill: wayBillId, packingType: packingTypeId, totalArt: totalArticle, short: shortArticle});
	}
	
	totalShortArtArr.push({uniqueVal: uniqueVal, wayBill: wayBillId, totalShortArticle: totalShortArticle});
	
	return shortArtTable;
}

function viewTotalAddShort() {
	showDialogBox('overlay', 'storeShortData');
}

function deleteShortEntries(shortTableId, shortLrNumber, uniqueVal1, shortWayBillId) {
	
	var tableEl 	= document.getElementById(shortTableId);
	
	var found 		= false;
	for (var row = tableEl.rows.length-1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
			var el  = tableEl.rows[row];
			el.parentNode.removeChild(el);
			found = true;
			
			totalShort -- ;
		}
	}
	
	setValueToHtmlTag('totalShort', totalShort);

	//remove row from array with particular index
	totalShortArr 		= removeShortEntryRowFromArray(totalShortArr, uniqueVal1);
	totalShortArtArr	= removeShortArticleEntryRowFromArray(totalShortArtArr, uniqueVal1);
	
	if(!found) {
		if(tableEl.rows.length == 1) {
			alert('There is no Article to delete !');
			return false;
		} else {
			showMessage('error', selectShortDetailsErrMsg);
			return false;
		}
	}
		
	resetShortWayBillColor(shortLrNumber, shortWayBillId);
	
	if(totalShort == 0) {
		HideDialog('overlay', 'storeShortData');
		changeDisplayProperty('viewTotalShort', 'none');
	}
}

function removeShortEntryRowFromArray(totalShortArr, uniqueVal) {
	
	for(var i = totalShortArr.length - 1; i >= 0; i--) {
		if(totalShortArr[i].uniqueVal === uniqueVal) {
			totalShortArr.splice(i, 1);
		}
	}
	
	return totalShortArr;
}

function removeShortArticleEntryRowFromArray(totalShortArtArr, uniqueVal) {
	
	for(var i = totalShortArtArr.length - 1; i >= 0; i--) {
		if(totalShortArtArr[i].uniqueVal === uniqueVal) {
			totalShortArtArr.splice(i, 1);
		}
	}
	
	return totalShortArtArr;
}

function countTotalShortArtAdded(wayBillNum, wayBillId) {
	var totalShortArt	= 0;
	
	if(totalShortArtArr.length > 0) {
		for(var i = 0; i < totalShortArtArr.length; i++) {
			if(totalShortArtArr[i].wayBill == wayBillId) {
				totalShortArt	+= Number(totalShortArtArr[i].totalShortArticle);
			}
		}
	}

	return totalShortArt;
}

function resetShortWayBillColor(shortLrNumber, shortWayBillId) {
	var shortDetailLen 	= $("#shortDetails tbody #shortData").length;
	var shortArtRow		= document.getElementById("shortArtRow");	
	var wayBillNum 		= null;
	var countLrNumber	= 0;
	
	for(var j = 0; j < shortDetailLen; j++) {
		
		wayBillNum 		= shortArtRow.rows[j].cells[1].innerHTML;
		
		if(wayBillNum == shortLrNumber) {
			countLrNumber++;
		}		
	}
	
	if(countLrNumber <= 0) {
		changeHtmlTagColor('lrcol_' + shortWayBillId, '', '', '', '');
	}
}