/**
 * @author Anant Chaudhary	28-11-2015
 */
var		damageUniqueValue	= 1;

function storeDamageEntriesData() {
	if(!damageReceiveFormValidation()) {return false;};
	if(!validateTotalDamageArt()) {return false;};
	
	var damagePrivateMark		= null;
	
	var damageLrNumber 			= $('#damageLrNumber').val();
	var damageWayBillId			= $('#damageWayBillId').val();
	var damageLsNumber 			= $('#damageLsNumber').val();
	var damageDispatchLedgerId	= $('#damageDispatchLedgerId').val();
	var damageTruckNumber 		= $('#damageTruckNumber').val();
	var damageVehicleMasterId	= $('#damageVehicleMasterId').val();	
	var damageActualWeight		= $('#damageActualWeight').val();
	var damageActUnloadWeight	= $('#damageActUnloadWeight').val();
	
	if($('#damagePrivateMark').val() != '') {
		damagePrivateMark		= $('#damagePrivateMark').val();
	}
	
	var damageWeight			= $('#damageWeight').val();
	var damageAmount			= $('#damageAmount').val();
	var damageRemark			= $('#damageRemark').val();
	
	if(isNaN(damageActUnloadWeight) || damageActUnloadWeight == '') {
		damageActUnloadWeight 	= 0;
	}
	
	if(isNaN(damageWeight) || damageWeight == '') {
		damageWeight			= 0;
	}
	
	if(isNaN(damageAmount) || damageAmount == '') {
		damageAmount			= 0;
	}
	
	var bindDamageData		= damageUniqueValue + '_' + damageLrNumber + '_' + damageWayBillId + '_' + damageLsNumber + '_' + damageDispatchLedgerId + '_' + damageTruckNumber + '_' + damageVehicleMasterId + '_' + damageActUnloadWeight + '_' + damagePrivateMark + '_' + damageWeight + '_' + damageAmount + '_' + damageRemark;
	
	var checkBoxJsonObject1		= new Object();
	var checkBoxJsonObject		= new Object();
	
	checkBoxJsonObject1.type	= 'checkbox';
	checkBoxJsonObject1.id		= '';
	checkBoxJsonObject1.name	= 'checkbox1';
	
	checkBoxJsonObject.type		= 'checkbox';
	checkBoxJsonObject.id		= 'damageCheckBox';
	checkBoxJsonObject.name		= 'damageCheckBox';
	checkBoxJsonObject.value	= bindDamageData;
	checkBoxJsonObject.checked	= 'checked';
	checkBoxJsonObject.style	= 'display: none';
	
	deleteButtonJsonObject		= new Object();
	
	deleteButtonJsonObject.type		= 'button';
	deleteButtonJsonObject.id		= 'delete';
	deleteButtonJsonObject.class	= 'button';
	deleteButtonJsonObject.name		= 'delete';
	deleteButtonJsonObject.value	= 'Delete';
	deleteButtonJsonObject.onclick	= 'deleteDamageEntries("damageDetails", "' + damageLrNumber + '", ' + damageUniqueValue + ', ' + damageWayBillId + ')';

	var damageRow		= createRowInTable('damageData', '', '');
	
	var checkBoxCol			= createNewColumn(damageRow, '', '', '', '', '', '');
	var damageLrNumberCol	= createNewColumn(damageRow, '', '', '', '', '', '');
	var damageWayBillIdCol	= createNewColumn(damageRow, '', '', '', '', 'display: none', '');
	var damageLsNumberCol	= createNewColumn(damageRow, '', '', '', '', '', '');
	var damagetDispatchIdCol= createNewColumn(damageRow, '', '', '', '', 'display: none', '');
	var truckNumberCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	
	if(damageReceiveConfig.ActualWeight == 'true') {
		var actualWeightCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	}
	
	if(damageReceiveConfig.ActUnloadWeight == 'true') {
		var actUnloadWeightCol	= createNewColumn(damageRow, '', '', '', '', '', '');
	}
	
	var damagePrivateMarkCol= createNewColumn(damageRow, '', '', '', '', '', '');
	var damageWeightCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	var amountCol			= createNewColumn(damageRow, '', '', '', '', '', '');
	var damageRemarkCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	var damageArtCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	var deleteButtonCol		= createNewColumn(damageRow, '', '', '', '', '', '');
	
	createCheckBox(checkBoxCol, checkBoxJsonObject1);
	createCheckBox(checkBoxCol, checkBoxJsonObject);
	
	$(damageLrNumberCol).append(damageLrNumber);
	$(damageWayBillIdCol).append(damageWayBillId);
	$(damageLsNumberCol).append(damageLsNumber);
	$(damagetDispatchIdCol).append(damageDispatchLedgerId);
	$(truckNumberCol).append(damageTruckNumber);
	
	if(damageReceiveConfig.ActualWeight == 'true') {
		$(actualWeightCol).append(damageActualWeight);
	}
	
	if(damageReceiveConfig.ActUnloadWeight == 'true') {
		$(actUnloadWeightCol).append(damageActUnloadWeight);
	}
	
	$(damagePrivateMarkCol).append(damagePrivateMark);
	$(damageWeightCol).append(damageWeight);
	$(amountCol).append(damageAmount);
	$(damageRemarkCol).append(damageRemark);
	
	createInput(deleteButtonCol, deleteButtonJsonObject);

	var damageArtTable = storeDamageArticleData(damageUniqueValue, damageLrNumber, damageWayBillId);
	
	$(damageArtCol).append(damageArtTable);
	
	appendRowInTable('damageDetails', damageRow);
	
	totalDamage++;
	damageUniqueValue++;
	
	setValueToHtmlTag('totalDamage', totalDamage);
	changeHtmlTagColor('lrcol_' + damageWayBillId, '', 'red', '', '');
	changeDisplayProperty('viewTotalDamage', 'inline');
	
	closeJqueryDialog('dialogDamageForm');
}

function storeDamageArticleData(uniqueVal, lrNumber, wayBillId) {

	var damageArtRow 			= null;
	var articleType				= null;
	var packingTypeId			= 0;
	var shortArticle			= 0;
	var damageArticle			= 0;
	var saidToContain			= "-----";
	var totalArticle			= 0;
	var totalDamageArticle		= 0;
	var consignmentDetailsId	= 0;

	var length = $("#articleDetailsForDamage tbody tr").length;

	var damageArtTable		= createTable('damageArtTable_' + wayBillId, 'pure-table pure-table-bordered', '');
	
	var shortArtTitleRow	= createRow('', '');
	
	var articleTypeNameCol		= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var totalArticleNameCol		= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var damageArticleNameCol	= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	var saidToContainNameCol	= createNewColumn(shortArtTitleRow, '', '', '', '', 'background-color: #A9A9A9; font-size: 11px; font-weight: bold;', '');
	
	$(articleTypeNameCol).append("Article Type");
	$(totalArticleNameCol).append("Total Art");
	$(damageArticleNameCol).append("Damage Art");
	$(saidToContainNameCol).append("Said To Contain");
	
	$(damageArtTable).append(shortArtTitleRow);

	for(var i = 0; i < length; i++) {
		articleType				= $('#damageArticleType_' + wayBillId + '_' + [i + 1]).val();
		packingTypeId			= $('#damagePackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
		totalArticle			= $('#totalDamageArticle_' + wayBillId + '_' + [i + 1]).val();
		damageArticle			= $('#damageArticle_' + wayBillId + '_' + [i + 1]).val();
		consignmentDetailsId	= $('#damageConsignmentDetailsId_' + wayBillId + '_' + [i + 1]).val();

		if(damageArticle > 0) {
			if($('#damageSaidToContain_' + wayBillId + '_' + [i + 1]).val() == '') {
				saidToContain 	= "-----";
			} else {
				saidToContain	= $('#damageSaidToContain_' + wayBillId + '_' + [i + 1]).val();
			}

			var bindDamageArtData	= uniqueVal + '_' + lrNumber + '_' + wayBillId + '_' + packingTypeId + '_' + totalArticle + '_' + damageArticle + '_' + consignmentDetailsId + '_' + saidToContain;

			var checkBoxJsonObject		= new Object();

			checkBoxJsonObject.type		= 'checkbox';
			checkBoxJsonObject.id		= 'damageArtCheckBox';
			checkBoxJsonObject.name		= 'damageArtCheckBox';
			checkBoxJsonObject.value	= bindDamageArtData;
			checkBoxJsonObject.checked	= 'checked';
			checkBoxJsonObject.style	= 'display: none';

			damageArtRow		= createRow('damageArt_1' + uniqueVal, '');

			var checkBoxCol			= createNewColumn(damageArtRow, '', '', '', '', 'display: none', '');
			var articleTypeCol		= createNewColumn(damageArtRow, '', '', '', '', 'font-size: 11px; width: 100px;', '');
			var packingTypeIdCol	= createNewColumn(damageArtRow, '', '', '', '', 'display: none; font-size: 11px; width: 20px;', '');
			var totalArticleCol		= createNewColumn(damageArtRow, '', '', '', '', 'font-size: 11px; width: 20px;', '');
			var damageArticleCol	= createNewColumn(damageArtRow, '', '', '', '', 'font-size: 11px; width: 20px;', '');
			var saidToContainCol	= createNewColumn(damageArtRow, '', '', '', '', 'font-size: 11px; width: 150px;', '');

			createCheckBox(checkBoxCol, checkBoxJsonObject);

			$(articleTypeCol).append(articleType);
			$(packingTypeIdCol).append(packingTypeId);
			$(totalArticleCol).append(totalArticle);
			$(damageArticleCol).append(damageArticle);
			$(saidToContainCol).append(saidToContain);

			$(damageArtTable).append(damageArtRow);	
		}
		
		totalDamageArticle	+= damageArticle;
		
		totalDamageArr.push({uniqueVal: uniqueVal, wayBill: wayBillId, packingType: packingTypeId, totalArt: totalArticle, damage: damageArticle});
	}
	
	totalDamageArtArr.push({uniqueVal: uniqueVal, wayBill: wayBillId, totalDamageArticle: totalDamageArticle});
	
	return damageArtTable;
	
}

function viewTotalAddDamage() {
	showDialogBox('damageOverlay', 'storeDamageData');
}

function deleteDamageEntries(shortTableId, damageLrNumber, uniqueVal1, damageWayBillId) {
	console.log("lllllllllllll",damageWayBillId)
	var noOfArticlesAdded	= 0;
	
	var tableEl 	= document.getElementById(shortTableId);
	
	var found 		= false;
	for (var row = tableEl.rows.length-1; row > 0; row--) {
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
			var el  = tableEl.rows[row];
			el.parentNode.removeChild(el);
			found = true;
			noOfArticlesAdded --;
			
			totalDamage -- ;
		}
	}
	
	setValueToHtmlTag('totalDamage', totalDamage);

	//remove row from array with particular index
	totalDamageArr 		= removeDamageEntryRowFromArray(totalDamageArr, uniqueVal1);
	totalDamageArtArr 	= removeDamageArticleEntryRowFromArray(totalDamageArtArr, uniqueVal1);

	if(!found) {
		if(tableEl.rows.length == 1) {
			alert('There is no Article to delete !');
			return false;
		} else {
			showMessage('error', selectDamageDetailsErrMsg);
			return false;
		}
	} 
		
	resetWayBillColor(damageLrNumber,damageWayBillId);
	
	if(totalDamage == 0) {
		HideDialog('damageOverlay', 'storeDamageData');
		changeDisplayProperty('viewTotalDamage', 'none');
	}
}

function removeDamageEntryRowFromArray(totalDamageArr, uniqueVal) {
	
	for(var i = totalDamageArr.length - 1; i >= 0; i--) {
		if(totalDamageArr[i].uniqueVal === uniqueVal) {
			totalDamageArr.splice(i, 1);
		}
	}
	
	return totalDamageArr;
}

function removeDamageArticleEntryRowFromArray(totalDamageArtArr, uniqueVal) {
	
	for(var i = totalDamageArtArr.length - 1; i >= 0; i--) {
		if(totalDamageArtArr[i].uniqueVal === uniqueVal) {
			totalDamageArtArr.splice(i, 1);
		}
	}
	
	return totalDamageArtArr;
}

function countTotalDamageArtAdded(wayBillNum, wayBillId) {
	var totalDamageArt	= 0;
	
	if(totalDamageArtArr.length > 0) {
		for(var i = 0; i < totalDamageArtArr.length; i++) {
			if(totalDamageArtArr[i].wayBill == wayBillId) {
				totalDamageArt	+= Number(totalDamageArtArr[i].totalDamageArticle);
			}
		}
	}

	return totalDamageArt;
}

function resetWayBillColor(damageLrNumber, damageWayBillId) {
	var damageDetailLen = $("#damageDetails tbody #damageData").length;
	var damageArtRow	= document.getElementById("damageArtRow");	
	var wayBillNum 		= null;
	var countLrNumber	= 0;
	
	for(var j = 0; j < damageDetailLen; j++) {
		
		wayBillNum 		= damageArtRow.rows[j].cells[1].innerHTML;
		
		if(wayBillNum == damageLrNumber) {
			countLrNumber++;
		}		
	}
	
	if(countLrNumber <= 0) {
		changeHtmlTagColor('lrcol_' + damageWayBillId, '#000', '', '', '');
	}
}