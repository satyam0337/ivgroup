/**
 * @author Anant Chaudhary	16-11-2015
 * 
 * Please Include this file where Jquery dialog box applied
 */

function resetInputFieldData() {
	$('#excessNumber').val('');
	$('#excessLRNumber').val('');
	$('#lrNumber').val('');
	$('#wayBillId').val(0);

	setReadOnly('excessLRNumber', false);
	changeTextFieldColorWithoutFocus('excessLRNumber', '', '', '');
	
	$('#excessLSNumber').val('');
	$('#excessWayBillId').val(0);
	
	setReadOnly('excessLSNumber', false);
	changeTextFieldColorWithoutFocus('excessLSNumber', '', '', '');
	
	$('#excessDispatchLedgerId').val(0);
	
	$('#turNumber').val('');
	setReadOnly('turNumber', false);
	changeTextFieldColorWithoutFocus('turNumber', '', '', '');
	
	$('#privateMark').val('');
	changeTextFieldColorWithoutFocus('privateMark', '', '', '');
	
	$('#excessArticle').val(0);
	changeTextFieldColorWithoutFocus('excessArticle', '', '', '');
	
	$('#excessWeight').val(0);
	changeTextFieldColorWithoutFocus('excessWeight', '', '', '');
	
	$('#excessArticleType').val('');
	setReadOnly('excessArticleType', false);
	changeTextFieldColorWithoutFocus('excessArticleType', '', '', '');
	
	$('#saidToContain').val('');
	setReadOnly('saidToContain', false);
	changeTextFieldColorWithoutFocus('saidToContain', '', '', '');
	
	changeTextFieldColorWithoutFocus('damageRemark', '', '', '');
	
	$('#excessRemark').val('');
	changeTextFieldColorWithoutFocus('excessRemark', '', '', '');
	
	$('#packingTypeMasterId').val('-1');
	changeDisplayProperty('packingTypeMasterId', 'block');
	
	changeDisplayProperty('excessArticleType', 'none');
	changeDisplayProperty('saveExcessButton', 'none');
	changeDisplayProperty('updateExcessButton', 'none');
	
	changeDisplayProperty('saveButton', 'block');
	changeDisplayProperty('updateButton', 'none');
	
	setReadOnly('shortLrNumber', false);
	setReadOnly('shortLsNumber', false);
	
	$('#shortLrNumber').val('');
	changeTextFieldColorWithoutFocus('shortLrNumber', '', '', '');
	
	$('#shortWayBillId').val('0');
	
	$('#shortLsNumber').val('');
	changeTextFieldColorWithoutFocus('shortLsNumber', '', '', '');
	
	$('#shortDispatchLedgerId').val('0');
	
	$('#truckNumber').val('');
	setReadOnly('truckNumber', false);
	changeTextFieldColorWithoutFocus('truckNumber', '', '', '');
	
	$('#shortTurNumber').val('');
	changeTextFieldColorWithoutFocus('shortTurNumber', '', '', '');
	
	$('#actUnloadWeight').val('');
	changeTextFieldColorWithoutFocus('actUnloadWeight', '', '', '');
	
	$('#shortPrivateMark').val('');
	changeTextFieldColorWithoutFocus('shortPrivateMark', '', '', '');
	
	$('#shortWeight').val('');
	changeTextFieldColorWithoutFocus('shortWeight', '', '', '');
	
	$('#actualWeight').val(0);
	
	$('#amount').val('');
	changeTextFieldColorWithoutFocus('amount', '', '', '');
	
	$('#shortRemark').val('');
	changeTextFieldColorWithoutFocus('shortRemark', '', '', '');
	
	$('#shortReceiveId').val('0');
	$('#shortArtId').val('');
	$('#packingTypeId').val('');
	
	$('#totalArticle').val('');
	changeTextFieldColorWithoutFocus('totalArticle', '', '', '');
	
	$('#shortArticle').val('');
	changeTextFieldColorWithoutFocus('shortArticle', '', '', '');
	
	$('#damageArticle').val('');
	changeTextFieldColorWithoutFocus('damageArticle', '', '', '');
	
	$('#settleType').val('0');
	
	changeDisplayProperty('withExcess', 'none');
	changeDisplayProperty('withClaim', 'none');
	changeDisplayProperty('withoutClaim', 'none');
	changeDisplayProperty('withShort', 'none');
	changeDisplayProperty('withNewFocLr', 'none');
	changeDisplayProperty('ugd', 'none');
	
	$('#lounchBy').val('');
	$('#claimAmount').val('');
	$('#claimPerson').val('');
	$('#vehicleMasterId').val('0');
	$('#turBranchId').val('0');
	$('#turNumber').val('');
	
	changeTextFieldColorWithoutFocus('turNumber', '', '', '');
	
	checkedUnchecked('shortArticleSettle', 'false');
	checkedUnchecked('damageArticleSettle', 'false');
	
	changeDisplayProperty('withExcess', 'none');
	
	$('#remarkWitoutClaim').val('');
	$('#claimRemark').val('');
	$('#ugdRemark').val('');
	$('#newLRNumber').val('');
	$('#focRemark').val('');
	$('#focWayBillId').val(0);
	$('#damageRemark').val('');
	$('#damageAmount').val(0);
	$('#damagePrivateMark').val(0);
	$('#damageWeight').val('');
	$('#damageActualWeight').val(0);
	$('#damageActUnloadWeight').val(0);
	$('#damageLrNumber').val('');
	$('#damageLsNumber').val('');
	$('#damageTruckNumber').val('');
	$('#damageVehicleMasterId').val(0);
	$('#damageDispatchLedgerId').val(0);
	$('#selectExcessOptType').val(0);
	$('#selectDamageOptType').val(0);
	$('#selectShortOptType').val(0);
	$('#damageSettleType').val(0);
	
	setTimeout(function() {
		$('#damageSettleType').val('0').trigger('change');
	}, 200); 
	
	showHideShortDetails();
	showHideDamageDetails();
	showHideExcessDetails();
}