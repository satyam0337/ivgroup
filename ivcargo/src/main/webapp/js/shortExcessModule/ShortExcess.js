/**
 * @author Anant Chaudhary	25-09-2015	19:25 P.M.
 */

var LR_SEARCH_TYPE_ID 	= 1;

var	totalShort				= 0;
var totalDamage				= 0;
var totalShortArr			= [];
var totalDamageArr			= [];
var totalShortArtArr		= [];
var totalDamageArtArr		= [];

var executiveObj					= null;
var Executive						= null;
var execReqd						= true;

function openWindowForLRView(id, type, branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&TypeOfNumber='+type+'&BranchId='+branchId);
}

function openWindowForView(id, number, type, branchId, cityId, searchBy) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&wayBillNumber='+number+'&TypeOfNumber='+type+'&BranchId='+branchId+'&CityId='+cityId+'&searchBy='+searchBy);
}

//Please also import CommonVariable.js file to work this

function checkExcessNumber() {

	if(!excessNumber('excessNumber')) return false;
	
	return true;

}

function checkShortNumber() {

	if(!validateShortNumber('shortNumber')) return false;

	return true;
}

function checkWayBillNumber() {

	if(!validateWayBillNumber('wayBillNumber')) return false;

	return true;
}

function shortReceiveFormValidation() {

	//shortReceiveConfig coming from PropertiesEnableDisable.js file
	
	var wayBillId		= $('#shortWayBillId').val();
	
	if($("#hideshowLr").is(":visible") == true) {
		if(!lrNumber(1, 'shortLrNumber')) return false;
	}

	if($("#hideshowls").is(":visible") == true) {
		if(!lsNumber('shortLsNumber')) return false;
	}

	if($("#hideShowTruck").is(":visible") == true) {
		if(!validateVehicleNumber(1, 'truckNumber')) return false;
	}
	
	if($("#hideShowTur").is(":visible") == true) {
		if(!validateTurNumber(1, 'shortTurNumber')) return false;
	}
	
	if($("#hideShowActUnloadWeight").is(":visible") == true && shortReceiveConfig.isActualUnloadWeightEntryAllow == 'true') {
		if(!validateActUnloadWeight(1, 'actUnloadWeight')) return false;
	}
	
	if($("#hideShowShortWeight").is(":visible") == true && shortReceiveConfig.isShortWeightEntryAllow == 'true') {
		if(!validateShortWeight(1, 'shortWeight')) return false;
	}
	
	if($("#hideShowAmount").is(":visible") == true && shortReceiveConfig.isShortClaimAmountEntryAllow == 'true') {
		if(!shortAmount('amount')) return false;
	}

	if($("#showHideRemark").is(":visible") == true) {
		if(!remark(1, 'shortRemark')) return false;
	}
	
	if($("#articleDetailsForShort").is(":visible") == true) {
		if(!validateShortArticleCount(wayBillId)) {return false;};
	}
	
	if($("#showHideBranch").is(":visible") == true && shortReceiveConfig.doNotAllowShortEntryAfterBlhpvCreation == 'true' && Number($('#branchEle').val() == 0)) {
		if(!validateInputTextFeild(1, 'branchEle', 'branchEle', 'error', branchNameErrMsg)) return false;
	}
	
	if($("#showHideExecutive").is(":visible") == true && shortReceiveConfig.doNotAllowShortEntryAfterBlhpvCreation == 'true' && Number($('#executiveEle').val() == 0)) {
		if(!validateInputTextFeild(1, 'executiveEle', 'executiveEle', 'error', executiveNameErrMsg)) return false;
	}
	return true;
}

function damageReceiveFormValidation() {

	//damageReceiveConfig coming from PropertiesEnableDisable.js file
	
	var wayBillId		= $('#damageWayBillId').val();
	
	if($("#hideshowDamageLr").is(":visible") == true) {
		if(!lrNumber(1, 'damageLrNumber')) return false;
	}

	if($("#hideshowDamagels").is(":visible") == true) {
		if(!validateLsNumber(1, 'damageLsNumber')) return false;
	}

	if($("#hideShowDamageTruck").is(":visible") == true) {
		if(!validateVehicleNumber(1, 'damageTruckNumber')) return false;
	}
	
	if($("#hideShowDamageTur").is(":visible") == true) {
		if(!validateTurNumber(1, 'damageTurNumber')) return false;
	}
	
	if($("#hideShowDamageActUnloadWeight").is(":visible") == true && damageReceiveConfig.isActualUnloadWeightEntryAllow == 'true') {
		if(!validateActUnloadWeight(1, 'damageActUnloadWeight')) return false;
	}
	
	if($("#hideShowDamageWeight").is(":visible") == true && damageReceiveConfig.isDamageWeightEntryAllow == 'true') {
		if(!damageWeight('damageWeight')) return false;
	}
	
	if($("#hideShowDamageAmount").is(":visible") == true && damageReceiveConfig.isDamageClaimAmountEntryAllow == 'true') {
		if(!damageAmount('damageAmount')) return false;
	}

	if($("#showHideDamageRemark").is(":visible") == true) {
		if(!remark(1, 'damageRemark')) return false;
	}
	
	if($("#articleDetailsForDamage").is(":visible") == true) {
		if(!validateDamageArticleCount(wayBillId)) {return false;};
	}
	
	return true;
}


function validateShortArticleCount(wayBillId) {

	var totalShortCount 	= 0;
	var shortArticleCount	= 0;
	
	if($("#articleDetailsForShort").is(":visible") == true) {
		var count	= $("#shortArticleDetailsId tr").length;
		
		totalShortCount  = 0;
		
		for(var i = 0; i < count; i++) {
			shortArticleCount 	= 0;
			
			shortArticleCount	= parseInt($('#shortArticle_' + wayBillId + '_' + [i + 1]).val());
			
			totalShortCount  += (parseInt(shortArticleCount));
		}

		if(totalShortCount <= 0) {
			$('#shortWeight').val(0);
			$('#actUnloadWeight').val(0);
			showMessage('error', shortArticleErrMsg);
			return false;
		}
	}
	
	return true;
}

function validateDamageArticleCount(wayBillId) {

	var totalDamageCount 	= 0;
	var damageArticleCount	= 0;
	
	if($("#articleDetailsForDamage").is(":visible") == true) {
		var count	= $("#damageArticleDetailsId tr").length;
		
		totalDamageCount = 0;
		
		for(var i = 0; i < count; i++) {
			damageArticleCount   = 0;
			
			damageArticleCount		= parseInt($('#damageArticle_' + wayBillId + '_' + [i + 1]).val());
			
			totalDamageCount += (parseInt(damageArticleCount));
		}
		
		if(totalDamageCount <= 0) {
			$('#damageWeight').val(0);
			$('#damageActUnloadWeight').val(0);
			showMessage('error', damageArticleErrMsg);
			return false;
		}
	}
	
	return true;
}

function validateToAddTotalShortEntry(wayBillNum, wayBillId, totalShortArt) {
	
	if($('#shortFormId').val() == 1) { //From Receive Module
		var nonOfArt				= $("#LRTotalArt" + wayBillId).val();
		var totalAddedShortArt		= countTotalShortArtAdded(wayBillNum, wayBillId);
		var totalAddedDamageArt		= countTotalDamageArtAdded(wayBillNum, wayBillId);
		
		var totalShortDamage = parseInt(totalAddedShortArt) + parseInt(totalAddedDamageArt) + parseInt(totalShortArt);
		
		if(parseInt(totalShortDamage) > parseInt(nonOfArt)) {
			showMessage('info', validateToAddTotalShortAndDamageEntry(wayBillNum));
			$('#shortWeight').val(0);
			$('#actUnloadWeight').val(0);
			return false;
		}
	}
	
	return true;
}

function validateToAddTotalDamageEntry(wayBillNum, wayBillId, totalDamageArt) {
	
	if($('#damageFormId').val() == 1) { //From Receive Module
		var nonOfArt				=  $("#LRTotalArt" + wayBillId).val();
		var totalAddedShortArt		= countTotalShortArtAdded(wayBillNum, wayBillId);
		var totalAddedDamageArt		= countTotalDamageArtAdded(wayBillNum, wayBillId);
		
		var totalShortDamage = parseInt(totalAddedShortArt) + parseInt(totalAddedDamageArt) + parseInt(totalDamageArt);
		
		if(parseInt(totalShortDamage) > parseInt(nonOfArt)) {
			$('#damageWeight').val(0);
			$('#damageActUnloadWeight').val(0);
			showMessage('info', validateToAddTotalShortAndDamageEntry(wayBillNum));
			return false;
		}
	}
	
	return true;
}

function excessReceiveFormValidation() {

	//excessReceiveConfig coming from PropertiesEnableDisable.js file
	
	if($("#showHideExcessLr").is(":visible") == true && excessReceiveConfig.isLRNumberValidationAllow == 'true') {
		if(!lrNumber(1, 'excessLRNumber')) return false;
	}

	if($("#showHideExcessLs").is(":visible") == true && excessReceiveConfig.isLSNumberValidationAllow == 'true') {
		if(!validateLsNumber(1, 'excessLSNumber')) return false;
	}

	if($("#showHideExcessTur").is(":visible") == true && excessReceiveConfig.isTurNumberValidationAllow == 'true') {
		if(!turNumber('turNumber')) return false;
	}

	if($("#showHideExcessArticleType").is(":visible") == true) {
		if(!articleType('packingTypeMasterId')) return false;
	}
	
	if($("#showHideExcessArticle").is(":visible") == true) {
		if(!excessArticle('excessArticle')) return false;
	}
	
	if($("#showHideExcessWeight").is(":visible") == true) {
		if(!excessWeight('excessWeight')) return false;
	}

	if($("#showHideExcessRemark").is(":visible") == true) {
		if(!remark(1, 'excessRemark')) return false;
	}

	return true;
}

function validateUpdateExcessForm() {
	if(!excessArticle('excessArticle')) return false;
	if(!excessArticleType('packingTypeMasterId')) return false;
	if(!excessWeight('excessWeight')) return false;
	if(!remark(1, 'excessRemark')) return false;
	
	return true;
}

function claimEntryFormValidation() {

	if($("#showHideLr").is(":visible") == true) {
		if(!lrNumber(1, 'lrNumber')) return false;
	}

	if($("#showHideLounchBy").is(":visible") == true) {
		if(!lounchByParty(1, 'lounchBy')) return false;
	}

	if($("#showHideClaimAmount").is(":visible") == true) {
		if(!claimAmount(1, 'claimAmount')) return false;
	}
	
	if($("#showHideClaimPerson").is(":visible") == true) {
		if(!claimPersonName(1, 'claimPerson')) return false;
	}
	
	if($("#showHideRemark").is(":visible") == true) {
		if(!remark(1, 'remark')) return false;
	}
	
	if($("#claimType").is(":visible") == true) {
		if(!claimType(1, 'claimType')) return false;
	}

	return true;
}

function shortSettlementFormValidation() {	
	var type = Number($('#shortSettleType').val());

	if($("#selectShortSettleType").is(":visible") == true) {
		if(!shortSettleType(1, 'shortSettleType')) return false;
	}

	if(type == SETTLE_WITH_EXCESS) {

		if(!settleWithExcessFormValidation()) return false;

	} else if(type == SETTLE_WITH_CLAIM) {

		if(!settleWithClaimFormValidation()) return false;

	} else if(type == SETTLE_WITH_NOCLAIM) {

		if(!settleWithoutClaimFormValidation()) return false;

	}
	
	return true;
}

function excessSettlementFormValidation() {
	var type = Number($('#excessSettleType').val());

	if(!excessSettleType(1, 'excessSettleType')) return false;

	if(type == SETTLE_WITH_SHORT) {

		if(!settleWithShortFormValidation()) return false;

	} else if(type == SETTLE_WITH_FOCLR) {

		if(!settleWithNewFocLrFormValidation()) return false;

	} else if(type == SETTLE_WITH_UGD) {

		if(!remark(1, 'ugdRemark')) return false;

	}
	
	return true;
}

function damageSettlementFormValidation() {	
	var type = Number($('#damageSettleType').val());

	if($("#selectDamageSettleType").is(":visible") == true) {
		if(!damageSettleType(1, 'damageSettleType')) return false;
	}

	if(type == SETTLE_WITH_EXCESS) {

		if(!settleWithExcessFormValidation()) return false;

	} else if(type == SETTLE_WITH_CLAIM) {

		if(!settleWithClaimFormValidation()) return false;

	} else if(type == SETTLE_WITH_NOCLAIM) {

		if(!settleWithoutClaimFormValidation()) return false;

	}
	
	return true;
}

function settleWithExcessFormValidation() {

	var count			= 0;
	var excessArt		= 0;
	var totalExcessArt 	= 0;
	
	count	= $("#excessDetails tr").length;
	
	for(var i = 0; i < count; i++) {
		totalExcessArt 	+= Number($("#excessArticle_" + (i + 1)).val());
		
		if($("#excessArtDetailsForShortSettle td:nth-child(6)").is(":visible") == true) {
			if(!remark(1, 'remark_' + (i + 1))) return false;
			if(!excessNumber('excessArticle_' + (i + 1))) return false;
		}
		
		excessArt		= Number($("#excessArticle_" + (i + 1)).val());
		
		if(!validateTotNumExcessOnShortSettlemnt(excessArt, i)) return false;
	}
	
	if(!validateTotNumExcessOnShortSettlemnt(totalExcessArt, -1)) return false;

	return true;
}

function validateTotNumExcessOnShortSettlemnt(excessArt, i) {
	var table 			= document.getElementById("shortArtDetailsForShortSettle");
	var totalShort 		= table.rows[1].cells[2].innerHTML;

	if(Number(excessArt) > Number(totalShort)) {
		showMessage('error', excessMoreThanShortErrMsg);
		
		if(i >= 0) {
			changeTextFieldColor("excessArticle_" + (i + 1), '', '', 'red');
		}
		
		return false;
	} 
	
	return true;
}

function settleWithShortFormValidation() {
	var count			= 0;
	var checkBoxCount	= 0;
	var totalShortCount	= 0;

	count	= $("#articleDetailsId tr").length;
	
	for(var i = 0; i < count; i++) {
		if($("#shortArtDetailsForExcessSettle td:nth-child(6)").is(":visible") == true) {
			
			if($('#select_'+(i+1)).is(':checked')){
				if(!remark(1, 'remark_' + (i + 1))) return false;
			
				checkBoxCount 	= Number(checkBoxCount) + 1
				totalShortCount += Number($("#shortArticle_" + (i + 1)).val()); 
			}
		}
	}
	
	if(!select(checkBoxCount)) return false;
	if(!validateLessExcessArticle(checkBoxCount, totalShortCount)) return false;
	
	return true;
}

function select(checkBoxCount) {
	if(checkBoxCount <= 0) {
		showMessage('error', selectCheckBoxErrMsg);
		return false;
	} else {
		return true;
	}
}

function validateLessExcessArticle(checkBoxCount, totalShortCount) {
	var table 			= document.getElementById('excessArtDetailsForExcessSettle');
	var totalExcessArt  = table.rows[1].cells[3].innerHTML;
	
	if(checkBoxCount > 1 && totalShortCount > totalExcessArt) {
		showMessage('error', lessExcessArtiErrMsg);
		return false;
	} else {
		return true;
	}
}

function settleWithClaimFormValidation() {

	if($("#settleWithClaimForm td:nth-child(1)").is(":visible") == true) {
		if(!claimNumber('claimNumber')) return false;
	}

	if($("#settleWithClaimForm td:nth-child(2)").is(":visible") == true) {
		if(!remark(1, 'claimRemark')) return false;
	}
	
	return true;
}

function settleWithoutClaimFormValidation() {

	if(!remark(1, 'remarkWitoutClaim')) return false;

	return true;
}

function settleWithNewFocLrFormValidation() {
	
	if($("#showHideSettleWithNewfocLr td:nth-child(1)").is(":visible") == true) {
		if(!lrNumber('newLRNumber', 1)) return false;
	}

	if($("#showHideSettleWithNewfocLr td:nth-child(2)").is(":visible") == true) {
		if(!remark(1, 'focRemark')) return false;
	}
	
	return true;
}

function validateTotalShort(shortLrNumber, wayBillId, i) {
	
	var totalArticle			= 0;
	var prevTotalShort			= 0;
	var newTotalShort			= 0;
	var packingTypeId			= 0;
	var shortArticle			= 0;
	var totalShort				= 0;
	var articleType				= null;
		
	articleType		= $('#shortArticleType_' + wayBillId + '_' + [i + 1]).val();
	packingTypeId	= $('#shortPackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
	totalArticle	= $('#totalShortArticle_' + wayBillId + '_' + [i + 1]).val();
	shortArticle	= $('#shortArticle_' + wayBillId + '_' + [i + 1]).val();

	for(var j = 0; j < totalShortArr.length; j++) {
		if(totalShortArr[j].wayBill == wayBillId && totalShortArr[j].packingType == packingTypeId) {
			prevTotalShort	+= parseInt(totalShortArr[j].short);	
		}
	}
	
	newTotalShort		= parseInt(shortArticle);
	totalShort			= parseInt(prevTotalShort) + parseInt(newTotalShort);

	if(totalShort > totalArticle) {
		$('#shortWeight').val(0);
		$('#actUnloadWeight').val(0);
		showMessage('info', alreadyEnteredMoreThanTotalShortArt(shortLrNumber, articleType));
		$('#shortArticle_' + wayBillId + '_' + [i + 1]).val(0);
		return false;
	}

	return true;
}

function validateTotalDamage(damageLrNumber, wayBillId, i) {
	
	var totalArticle			= 0;
	var prevTotalDamage			= 0;
	var newTotalDamage			= 0;
	var packingTypeId			= 0;
	var damageArticle			= 0;
	var totalDamage				= 0;
	var articleType				= null;
		
	articleType		= $('#damageArticleType_' + wayBillId + '_' + [i + 1]).val();
	packingTypeId	= $('#damagePackingTypeMasterId_' + wayBillId + '_' + [i + 1]).val();
	totalArticle	= $('#totalDamageArticle_' + wayBillId + '_' + [i + 1]).val();
	damageArticle	= $('#damageArticle_' + wayBillId + '_' + [i + 1]).val();

	for(var j = 0; j < totalDamageArr.length; j++) {
		if(totalDamageArr[j].wayBill == wayBillId && totalDamageArr[j].packingType == packingTypeId) {
			prevTotalDamage	+= parseInt(totalDamageArr[j].damage);	
		}
	}
	
	newTotalDamage		= parseInt(damageArticle);
	totalDamage			= parseInt(prevTotalDamage) + parseInt(newTotalDamage);

	if(totalDamage > totalArticle) {
		$('#damageWeight').val(0);
		$('#damageActUnloadWeight').val(0);
		showMessage('info', alreadyEnteredMoreThanTotalDamageArt(damageLrNumber, articleType));
		setValueToTextField('damageArticle_' + wayBillId + '_' + [i + 1], '0');
		return false;
	}

	return true;
}

function validateTotalShortArt() {
	
	var totalArticle 	= 0;
	var shortArticle	= 0;
	var length 			= 0;
	var shortLrNumber	= null;
	var wayBillId		= 0;
	var totalShortArt	= 0;
	
	shortLrNumber	= $('#shortLrNumber').val();
	wayBillId		= $('#shortWayBillId').val();
	
	length = $("#articleDetailsForShort tbody tr").length;
	
	for(var i = 0 ; i < length; i++) {
		totalArticle	= Number($('#totalShortArticle_' + wayBillId + '_' + [i + 1]).val());
		
		if($('#shortArticle_' + wayBillId + '_' + [i + 1]).val() == '') {
			shortArticle	= 0;
		} else {
			shortArticle	= Number($('#shortArticle_' + wayBillId + '_' + [i + 1]).val());
		}
		
		totalShortArt	+= shortArticle;

		if(shortArticle > totalArticle) {
			$('#shortWeight').val(0);
			$('#actUnloadWeight').val(0);
			showMessage('error', shortArtGrTErrMsg);
			$('#amount').attr('readonly', true);
			$('#shortArticle_' + wayBillId + '_' + [i + 1]).val(0);
			changeError1('shortArticle_' + wayBillId + '_' + [i + 1],'0','0');
			return false;
		}
		 
		if(!validateTotalShort(shortLrNumber, wayBillId, i)) {return false;}
	}
	
	if(!validateShortArticleCount(wayBillId)) {return false;}
	if(!validateToAddTotalShortEntry(shortLrNumber, wayBillId, totalShortArt)) {return false;}
	
	$('#amount').attr('readonly', false);
	
	return true;
}

function validateTotalDamageArt() {
	var totalArticle 	= 0;
	var damageArticle	= 0;
	var length 			= 0;
	var damageLrNumber	= null;
	var wayBillId		= 0;
	var totalDamageArt	= 0;
	
	damageLrNumber	= $('#damageLrNumber').val();
	wayBillId		= $('#damageWayBillId').val();
	
	length = $("#articleDetailsForDamage tbody tr").length;
	
	for(var i = 0 ; i < length; i++) {
		totalArticle	= Number($('#totalDamageArticle_' + wayBillId + '_' + [i + 1]).val());
		damageArticle	= Number($('#damageArticle_' + wayBillId + '_' + [i + 1]).val());
		
		totalDamageArt	+= damageArticle;
		
		if(damageArticle > totalArticle) {
			$('#damageWeight').val(0);
			$('#damageActUnloadWeight').val(0);
			showMessage('error', damageArtGrTErrMsg);
			$('#damageActUnloadWeight').attr('readonly', true);
			$('#damageAmount').attr('readonly', false);
			$('#damageArticle_' + wayBillId + '_' + [i + 1]).val(0);
			changeError1('damageArticle_' + wayBillId + '_' + [i + 1],'0','0');
			return false;
		}
		
		if(!validateTotalDamage(damageLrNumber, wayBillId, i)) {return false;}
	}
	
	if(!validateDamageArticleCount(wayBillId)) {return false;}
	if(!validateToAddTotalDamageEntry(damageLrNumber, wayBillId, totalDamageArt)) {return false;}
	
	$('#damageActUnloadWeight').attr('readonly', true);
	$('#damageAmount').attr('readonly', true);
	
	return true;
}

function calculateActualUnloadWeightShortWeightForShort(wayBillId) {
	var length 				= $("#articleDetailsForShort tbody tr").length;
	var acutalWeight		= $('#actualWeight').val();
	var shortWeight			= 0;
	var totalShortArt		= 0;
	var totalArticle 		= 0;
	var shortArticle		= 0;
	var grandTotalArticle	= 0;
	
	for(var i = 0 ; i < length; i++) {
		totalArticle	= Number($('#totalShortArticle_' + wayBillId + '_' + [i + 1]).val());
		
		if($('#shortArticle_' + wayBillId + '_' + [i + 1]).val() == '') {
			shortArticle	= 0;
		} else {
			shortArticle	= Number($('#shortArticle_' + wayBillId + '_' + [i + 1]).val());
		}
		
		grandTotalArticle	+= totalArticle;
		totalShortArt		+= shortArticle;
	}
	
	if(totalShortArt > grandTotalArticle) {
		$('#shortWeight').val(0);
		$('#actUnloadWeight').val(0);
	} else {
		shortWeight		= Math.round((acutalWeight/grandTotalArticle) * totalShortArt);
		
		$('#shortWeight').val(shortWeight);
		$('#actUnloadWeight').val(acutalWeight - shortWeight);
	}
}

function calculateActualUnloadWeightShortWeightForDamage(wayBillId) {
	var length 				= $("#articleDetailsForDamage tbody tr").length;
	var acutalWeight		= $('#damageActualWeight').val();
	var damageWeight		= 0;
	var actualUnloadWeight	= 0;
	var totalDamageArt		= 0;
	var totalArticle 		= 0;
	var damageArticle		= 0;
	var grandTotalArticle	= 0;
	
	/*
	for(var i = 0 ; i < length; i++) {
		totalArticle	= Number($('#totalDamageArticle_' + wayBillId + '_' + [i + 1]).val());
		
		if($('#damageArticle_' + wayBillId + '_' + [i + 1]).val() == '') {
			damageArticle	= 0;
		} else {
			damageArticle	= Number($('#damageArticle_' + wayBillId + '_' + [i + 1]).val());
		}
		
		grandTotalArticle	+= totalArticle;
		totalDamageArt		+= damageArticle;
	}
	
	if(totalDamageArt > grandTotalArticle) {
		$('#damageWeight').val(0);
		$('#damageActUnloadWeight').val(0);
	} else {
		damageWeight		= Math.round((acutalWeight/grandTotalArticle) * totalDamageArt);
		
		$('#damageWeight').val(damageWeight);
		$('#damageActUnloadWeight').val(acutalWeight - damageWeight);
	}*/
}

function closeDialog(id) {
	
	if(document.getElementById('receiveButton') != null) {
		document.getElementById('receiveButton').style.display = 'inline';
	}
	
	if(document.getElementById('receiveButton1') != null) {
		document.getElementById('receiveButton1').style.display = 'none';
	}
	
	closeJqueryDialog(id);
}

function openDialog(id) {
	$("#"+id).dialog({
		modal: true,
		width:'auto',
		height: 'auto',
		minWidth: 700,
		maxWidth: 600,
	   // minHeight: 500,
	    position: ["center", 50],
		closeOnEscape: false,
		resizable: false,
		show: 'slide',
		hide: 'slide',
		draggable: false,
		open: function() {
	        $(this).closest(".ui-dialog")
	        .find(".ui-dialog-titlebar-close")
	        .removeClass("ui-dialog-titlebar-close")
	        .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
	    },
		close: function(ev, ui) {
			hideAllMessages();
			//Include this ResetInputFieldValue.js file to work this function 
			resetInputFieldData();
			//window.location.reload();
		}
	}).css("font-size", "12px");
	
	$(".ui-widget-header .ui-icon").css('background-color', 'red');
	$(".ui-widget-header button").css('padding', '0px');
	$(".ui-widget-header button").css('float', 'right');
}

function closeJqueryDialog(id) {
	if(document.getElementById(id) != null) {
		resetInputFieldData();
		$('#'+id).dialog('close');
	}
}

function displayShortSettlementType() {
	var type 	= $('#shortSettleType').val();

	var days	= diffBetweenTwoDays('shortDate1');
	
	var count	= $("#excessArtDetailsForShortSettle tbody tr").length;
	
	var row		= document.getElementById("getShortValue");
	
	var shortArticles 		= row.rows[0].cells[2].innerHTML;

	if(type == 0) {
		toogleElement('withExcess', 'none');
		toogleElement('shortWithClaim', 'none');
		toogleElement('shortWithoutClaim', 'none');
	} else if (type == SETTLE_WITH_EXCESS) {
		toogleElement('shortWithClaim', 'none');
		toogleElement('shortWithoutClaim', 'none');
		
		if(count > 0 && shortArticles > 0 ) {
			toogleElement('withExcess', 'block');
		} else {
			$('#shortSettleType').val(0);
			
			showMessage('info', excessEntriesNotFoundInfoMsg);
		}
		
	} else if(type == SETTLE_WITH_CLAIM) {
		toogleElement('withExcess', 'none');
		toogleElement('shortWithoutClaim', 'none');
		
		if(count <= 0 && days < 365 ) {
			toogleElement('shortWithClaim', 'block');
			toogleElement('shortWithoutClaim', 'none');
		} else {
			$('#shortSettleType').val(0);
			showMessage('info', settleWithClaimInfoMsg);
		}
	} else if(type == SETTLE_WITH_NOCLAIM) {
		toogleElement('withExcess', 'none');
		toogleElement('shortWithClaim', 'none');
		
		if(count <= 0 && days > 365 ) {
			toogleElement('shortWithoutClaim', 'block');
		} else {
			if(isNoclaimAllow){ // Getting from FindShortDetailsForSettlement.js
				toogleElement('shortWithoutClaim', 'block');
			}else{
				$('#shortSettleType').val(0);
				showMessage('info', settleWithNoClaimInfoMsg);
			}
		}
	}
}

function displayExcessSettlementType() {
	
	var type 	= Number($('#excessSettleType').val());
	
	var count	= $("#shortArtDetailsForExcessSettle tbody tr").length;

	if(type == 0) {
		toogleElement('withShort', 'none');
		toogleElement('withNewFocLr', 'none');
		toogleElement('ugd', 'none');
	} else if(type == SETTLE_WITH_SHORT) {
		
		if(count > 0) {
			toogleElement('withShort', 'block');
			toogleElement('withNewFocLr', 'none');
			toogleElement('ugd', 'none');
		} else {
			$('#excessSettleType').val(0);
			showMessage('info', shortEntriesNotFoundInfoMsg);
			toogleElement('withNewFocLr', 'none');
			toogleElement('ugd', 'none');
		}
	} else if(type == SETTLE_WITH_FOCLR) {	
		openDialog('settleWithFocMsg');
		$('#excessSettleType').val(0);
		toogleElement('withShort', 'none');
		//toogleElement('withNewFocLr', 'block');
		toogleElement('ugd', 'none');
	} else if(type == SETTLE_WITH_UGD) {		
		toogleElement('withShort', 'none');
		toogleElement('withNewFocLr', 'none');
		toogleElement('ugd', 'block');
	}
}

function displayDamageSettlementType() {
	var type 	= $('#damageSettleType').val();
	var days	= diffBetweenTwoDays('damageDate1');
	var row		= document.getElementById("getDamageValue");
	
	var minimumDays = 365;
	
	if(damageReceiveSettlementConfig != null )
	  minimumDays = Number(damageReceiveSettlementConfig.damageClaimSettlementMinDays);
	
	console.log('minimumDays ',minimumDays)
	
	var damagesArticles 	= row.rows[0].cells[2].innerHTML;

	if(type == 0) {
		toogleElement('damageWithClaim', 'none');
		toogleElement('damageWithoutClaim', 'none');
	} else if(type == SETTLE_WITH_CLAIM) {
		
		if(days < 365 && damagesArticles > 0) {
			toogleElement('damageWithClaim', 'block');
			toogleElement('damageWithoutClaim', 'none');
		} else {
			$('#damageSettleType').val(0);
			
			showMessage('info', settleWithClaimInfoMsg);
		}
	} else if(type == SETTLE_WITH_NOCLAIM) {
		
		if(days > minimumDays) {
			toogleElement('damageWithClaim', 'none');
			toogleElement('damageWithoutClaim', 'block');
		} else {
			$('#damageSettleType').val(0);
			
			showMessage('info', settleWithNoClaimInfoMsg);
			toogleElement('damageWithClaim', 'none');
		}
	}
}

function checkShortArtSettle() {
	var shortCheckVal	= document.getElementById('shortArticleSettle').checked;
	
	if(shortCheckVal == true) {
		document.getElementById('damageArticleSettle').checked = false;
		$('#shortSettleType').val(0);
		toogleElement('showShortSettlement', 'block');
		toogleElement('withClaim', 'none');
		toogleElement('withoutClaim', 'none');
		toogleElement('withExcess', 'none');
	} else {
		toogleElement('showShortSettlement', 'none');
		toogleElement('withClaim', 'none');
		toogleElement('withoutClaim', 'none');
		toogleElement('withExcess', 'none');
		showMessage('error', selectCheckBoxErrMsg);
		return false;
	}
	
	return true;
}

function checkDamageArtSettle() {
	var damageCheckVal	= document.getElementById('damageArticleSettle').checked;
	
	if(damageCheckVal == true) {
		document.getElementById('shortArticleSettle').checked = false;
		$('#damageSettleType').val(0);
		toogleElement('showShortSettlement', 'block');
		toogleElement('withClaim', 'none');
		toogleElement('withoutClaim', 'none');
		toogleElement('withExcess', 'none');
	} else {
		toogleElement('showShortSettlement', 'none');
		toogleElement('withClaim', 'none');
		toogleElement('withoutClaim', 'none');
		toogleElement('withExcess', 'none');
		showMessage('error', selectCheckBoxErrMsg);
		return false;
	}
	
	return true;
	
}

function selectCheckBox(shortCheckVal) {
	if(shortCheckVal == false) {
		$('#shortSettleType').val(0);
		showMessage('error', selectCheckBoxErrMsg);
		return false;
	}
	return true;
}

/*$(document).ready(function() {
    $("input[name$='settle_with_excess']").click(function() {
        var value = $(this).val();
        
        if(value == 'showShortSettlement' && document.getElementById("shortArticleSettle").checked == true) {
        	$("ul.desc").hide();
            $("#"+value).show();
            document.getElementById("damageArticleSettle").checked = false;
        } else if(value == 'showDamageSettlement' && document.getElementById("damageArticleSettle").checked == true) {
        	$("ul.desc").hide();
            $("#"+value).show();
            document.getElementById("shortArticleSettle").checked = false;
        }

    });
});
*/

function checkWayBillNoForShortReceive() {
	if($('#shortFormId').val() == 1) { //From Receive Module
		return;
	}
	
	if($('#shortLrNumber').val() == '') {
		changeTextFieldColor('shortLrNumber', '', '', 'red');
		showMessage('error', lrNumberErrMsg);
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.ShortLrNumber	= $('#shortLrNumber').val();
	jsonObject.filter			= 1;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("CheckWayBillAjaxActionInShortExcess.do?pageId=330&eventId=24",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.error) {
					if (data.errorDescription) {
						showMessage('info', lrNumberNotFound($('#shortLrNumber').val()));
						$('#shortLrNumber').val("");
					}
					
					hideLayer();
				} else {
					
					$('#shortWayBillId').val(data.wayBillId);
					
					hideLayer();
				}
			});
}

function checkWayBillNoForDamageReceive() {
	if($('#damageFormId').val() == 1) { //From Receive Module
		return;
	}
	
	if($('#damageLrNumber').val() == '') {
		changeTextFieldColor('damageLrNumber', '', '', 'red');
		showMessage('error', lrNumberErrMsg);
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.DamageLrNumber	= $('#damageLrNumber').val();
	jsonObject.filter			= 2;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("CheckWayBillAjaxActionInShortExcess.do?pageId=330&eventId=24",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.error) {
					if (data.errorDescription) {
						$('#damageLrNumber').val("");
						showMessage('info', lrNumberNotFound($('#damageLrNumber').val()));
					}
					
					hideLayer();
				} else {
					$('#damageWayBillId').val(data.wayBillId);
					
					hideLayer();
				}
			});
}

function checkWayBillNoForExcessReceive() {
	var jsonObject				= new Object();
	
	jsonObject.ExcessLrNumber	= $('#excessLRNumber').val();
	jsonObject.filter			= 3;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("CheckWayBillAjaxActionInShortExcess.do?pageId=330&eventId=24",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.error) {
					console.log("checkWayBillNoForExcessReceive :: "+data)
					if(data.errorDescription){
					$('#excessLRNumber').val("");
					showMessage('info', data.errorDescription);		
					}
					
					hideLayer();
				} else {
					$('#excessWayBillId').val(data.wayBillId);
					console.log("data.consingmentDetailsCall "+data.consingmentDetailsCall)
					getArticleDetails1(data.consingmentDetailsCall);
					hideLayer();
				}
			});
}

function checkLSNumberForShortReceive() {
	if($('#shortLsNumber').val() == '') {
		changeTextFieldColor('shortLsNumber', '', '', 'red');
		showMessage('error', lsNumberErrMsg);
		return false;
	}

	if($('#shortWayBillId').val() <= 0) {
		showMessage('error', lrNumberProperErrMsg);
		$('#shortLsNumber').val("");
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.ShortLsNumber	= $('#shortLsNumber').val();;
	jsonObject.wayBillId		= $('#shortWayBillId').val();
	jsonObject.filter			= 1;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("CheckLSAjaxActionForShortExcess.do?pageId=330&eventId=25",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('info', data.errorDescription);
					}
					hideLayer();
				} else {
					 if(typeof data.message !== 'undefined') {
						var errorMessage	= data.message
						showMessage('error', errorMessage.description);
						$('#shortLsNumber').val("");
						hideLayer();
						return false;
					}
					
					var dispatchLedger		= data.dispatchLedger;
					var receivedLedger		= data.receivedLedger;
					var executive			= data.executive;
					var consignmentSummary	= data.consignmentSummary;
					
					$('#shortDispatchLedgerId').val(dispatchLedger.dispatchLedgerId);
					$('#truckNumber').val(dispatchLedger.vehicleNumber);
					$('#vehicleMasterId').val(dispatchLedger.vehicleNumberMasterId);
					$('#shortTurNumber').val(receivedLedger.turNumber);
					$('#turBranchId').val(receivedLedger.turBranchId);
					$('#executiveBranchId').val(executive.branchId);
					$('#actualWeight').val(consignmentSummary.actualWeight);
					$('#shortPrivateMark').val(consignmentSummary.privateMarka);
					
					$('#truckNumber').prop('readonly', true);
					$('#shortTurNumber').prop('readonly', true);
					$('#actualWeight').prop('readonly', true);
					
					getActiveExecutive(data);
					if(document.getElementById('articleDetailsForShort')) {
						if($("#articleDetailsForShort").is(":visible") == true) {
							getArticleDetailsForShortEntry(data);
						}
					}
					
					hideLayer();
				}
			});
}

function checkLSNumberForDamageReceive() {
	var damageReceieve	= 2;
	
	if($('#damageLsNumber').val() == '') {
		changeTextFieldColor('damageLsNumber', '', '', 'red');
		showMessage('error', lsNumberErrMsg);
		return false;
	}

	if($('#damageWayBillId').val() <= 0) {
		showMessage('error', lrNumberProperErrMsg);
		$('#shortLsNumber').val("");
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.DamageLsNumber	= $('#damageLsNumber').val();
	jsonObject.wayBillId		= $('#damageWayBillId').val();
	jsonObject.filter			= 2;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("CheckLSAjaxActionForShortExcess.do?pageId=330&eventId=25",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					}
					hideLayer();
				} else {
					if(typeof data.message !== 'undefined') {
						var errorMessage	= data.message
						showMessage('error', errorMessage.description);
						$('#damageLsNumber').val("");
						hideLayer();
						return false;
					}
					
					var dispatchLedger		= data.dispatchLedger;
					var receivedLedger		= data.receivedLedger;
					var executive			= data.executive;
					var consignmentSummary	= data.consignmentSummary;
					
					$('#damageDispatchLedgerId').val(dispatchLedger.dispatchLedgerId);
					$('#damageTruckNumber').val(dispatchLedger.vehicleNumber);
					$('#damageVehicleMasterId').val(dispatchLedger.vehicleNumberMasterId);
					$('#damageTurNumber').val(receivedLedger.turNumber);
					$('#damageTurBranchId').val(receivedLedger.turBranchId);
					$('#executiveBranchId').val(executive.branchId);
					$('#damageActualWeight').val(consignmentSummary.actualWeight);
					$('#damagePrivateMark').val(consignmentSummary.privateMarka);
					
					$('#damageTruckNumber').prop('readonly', true);
					$('#damageTurNumber').prop('readonly', true);
					$('#damageActualWeight').prop('readonly', true);
					
					if(document.getElementById('articleDetailsForDamage')) {
						if($("#articleDetailsForDamage").is(":visible") == true) {
							getArticleDetailsForDamageEntry(data);
						}
					}
					
					hideLayer();
				}
			});
}

function checkLSNumberForExcess() {
	
	if($('#excessLSNumber').val() == '') {
		return true;
	}

	if($('#excessWayBillId').val() < 0) {
		showMessage('error', lrNumberProperErrMsg);
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.ExcessLsNumber	= $('#excessLSNumber').val();
	jsonObject.WayBillId		= $('#excessWayBillId').val();
	jsonObject.filter			= 3;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("CheckLSAjaxActionForShortExcess.do?pageId=330&eventId=25",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					}
					
					hideLayer();
				} else {
					if(typeof data.message !== 'undefined') {
						var errorMessage	= data.message
						showMessage('error', errorMessage.description);
						$('#excessLSNumber').val("");
						$('#turNumber').prop('readonly', false);
						hideLayer();
						return false;
					}
					
					var dispatchLedger		= data.dispatchLedger;
					var receivedLedger		= data.receivedLedger;
					var executive			= data.executive;
					
					$('#excessDispatchLedgerId').val(dispatchLedger.dispatchLedgerId);
					$('#truckNumber').val(dispatchLedger.vehicleNumber);
					$('#vehicleMasterId').val(dispatchLedger.vehicleNumberMasterId);
					
					if(receivedLedger != undefined) {
						$('#turNumber').val(receivedLedger.turNumber);
						$('#turBranchId').val(receivedLedger.turBranchId);
						$('#turNumber').prop('readonly', true);
					} else {
						$('#turNumber').val('');
						$('#turBranchId').val(0);
						$('#turNumber').prop('readonly', false);
					}
					
					$('#executiveBranchId').val(executive.branchId);
					
					$('#truckNumber').prop('readonly', true);
					
					hideAllMessages();
					hideLayer();
				}
			});
}

function resetDetailsToExcess() {

	$('#excessWayBillId').val(0);
	$('#saidToContain').val('');
	
	if(document.getElementById("saidToContain") != null) {
		document.getElementById('saidToContain').style.backgroundColor 	= "#FFF";
	}
	
	setPackingTypeForExcess();  //calling from bottom
}

function checkPackingTypeByLr() {
	
	var wayBillId	= 0;
	var lrNumber	= "";
	var packingTypeMasterId = null;

	if(wayBillId  > 0){
		if(document.getElementById('excessLRNumber') != null)
			lrNumber 	= document.getElementById('excessLRNumber').value;
		
		if(document.getElementById("wayBillId") != null)
			wayBillId 	= document.getElementById("wayBillId").value;

		if(document.getElementById("packingTypeMasterId") != null)
			packingTypeMasterId = document.getElementById("packingTypeMasterId").value;

		var typeOfPacking	= document.excessReceive.packingTypeMasterId[document.excessReceive.packingTypeMasterId.selectedIndex].text;
		
		var xhttp;    

		xhttp = new XMLHttpRequest();
		showLayer();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				var str = xhttp.responseText;
				
				str = str.replace(/null/g,'');
				str = $.trim(str);

				if(str=="articleTypenotfound") {
					showMessage('info', articleNotFound(typeOfPacking, lrNumber));
					
					$('#packingTypeMasterId').val('-1');
					$('#totalArticle').val('');
					$('#saidToContain').val('');
					
					document.getElementById('saidToContain').readOnly 		= false;
					
					hideLayer();		
					return false;
				} else {
					var tempQty = new Array();
					tempQty = str.split(";");
					
					$('#totalArticle').val(tempQty[1]);
					$('#saidToContain').val(tempQty[2]);
					
					document.getElementById('saidToContain').readOnly 	= true;
					
					hideAllMessages();
					hideLayer();	
				}
				
			}
		};

		xhttp.open("GET", "/ivcargo/jsp/shortExcessModule/AjaxInterfaceForShortExcess.jsp?wayBillId="+wayBillId+"&packingTypeMasterId="+packingTypeMasterId+"&filter="+3, true);
		xhttp.send(null);
	}
}

function checkNewFocLRNumber() {

	var newLRNumber	= null;

	if(document.getElementById("newLRNumber") != null)
		newLRNumber 	= document.getElementById("newLRNumber").value;

	if(newLRNumber == '') {
		showMessage('error', lrNumberErrMsg);
		return false;
	}
	
	var xhttp;    

	xhttp = new XMLHttpRequest();
	showLayer();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var str = xhttp.responseText;

			str = str.replace(/null/g,'');
			str = $.trim(str);

			if(str=="lrnotfound") {
				document.getElementById("newLRNumber").value = "";
				showMessage('info', lrNumberNotFound(newLRNumber));
				
				hideLayer();		
				return false;
			} else {
				if(document.getElementById("newLRNumber") != null) {
					removeError('newLRNumber');
					changeTextFieldColorWithoutFocus('newLRNumber', '#000000', '#F0F0F0', '#F0F0F0');
				}
				
				var tempQty = new Array();
				
				tempQty = str.split(";");
				$('#focWayBillId').val(tempQty[0]);
				
				hideAllMessages();
				hideLayer();	
			}
		}
	};

	xhttp.open("GET", "/ivcargo/jsp/shortExcessModule/AjaxInterfaceForShortExcess.jsp?newLRNumber="+newLRNumber+"&filter="+5, true);
	xhttp.send(null);
}

function checkClaimNumber() {

	if($('.claimNumber').val() == '') {
		showMessage('error', claimNumberErrMsg);
		return false;
	}
	
	var jsonObject				= new Object();
	
	jsonObject.claimNumber		= $('.claimNumber').val();
	jsonObject.wayBillId		= $('#wayBillId').val();
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("CheckClaimNumberAjaxActionForShortExcess.do?pageId=330&eventId=26",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					}
					hideLayer();
				} else {
					if(data.claimnotfound) {
						showMessage('info', claimNumberNotFound($('.claimNumber').val(), $('#lrNumber1').val()));
						$('.claimNumber').val("");
						hideLayer();
						return false;
					}
					
					hideLayer();
				}
			});
}

function checkWayBillNumberInClaim() {
		
	var jsonObject		= new Object();
	
	jsonObject.LRNumber		= $('#lrNumber').val();
	jsonObject.filter		= 4;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("CheckWayBillAjaxActionInShortExcess.do?pageId=330&eventId=24",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('info', lrNumberNotFound($('#lrNumber').val()));
						$('#lrNumber').val('');
					}
					
					hideLayer();
				} else {
					if(data.errorDescription) {
						showMessage('info', lrNumberNotFound($('#lrNumber').val()));
						hideLayer();
						return false;
					} else if(data.isWayBillNumberExist) {
						showMessage('info', claimAlreadyDone($('#lrNumber').val()));
						$('#lrNumber').val('');
						$('#wayBillId').val(0);
						hideLayer();
						return false;
					}
					
					$('#wayBillId').val(data.wayBillId);
					
					hideLayer();
				}
			});
}

function openWindowForShortReceive(wayBillNum, lsNo, dispatchLedgerId, vehicleNo, vehicleNoId, wayBillId, actualWeight, privateMarka) {
	var shortReceieveFilter		= 1;
	console.log("inisde revieverrrrr")
	$('#shortLrNumber').val(wayBillNum);
	$('#shortWayBillId').val(wayBillId);
	$('#shortLsNumber').val(lsNo);
	$('#shortDispatchLedgerId').val(dispatchLedgerId);
	$('#truckNumber').val(vehicleNo);
	$('#vehicleMasterId').val(vehicleNoId);
	$('#actualWeight').val(actualWeight);
	
	setReadOnly('shortLrNumber', true);
	setReadOnly('shortLsNumber', true);
	setReadOnly('truckNumber', true);
	setReadOnly('amount', true);
	setReadOnly('actUnloadWeight', true);
	setReadOnly('actualWeight', true);
	
	$('#shortFormId').val(1);
	
	changeDisplayProperty('hideShowTur', 'none');
	changeDisplayProperty('saveButton', 'none');
	changeDisplayProperty('addButton', 'block');
	
	$('#actUnloadWeight').val(0);
	$('#shortPrivateMark').val(privateMarka);
	$('#shortWeight').val(0);
	$('#amount').val(0);
	$('#shortRemark').val('');

	var nonOfArt		= getValueFromInputField('LRTotalArt' + wayBillId);
	var totalShortArt	= countTotalShortArtAdded(wayBillNum, wayBillId);
	
	if(totalShortArt == nonOfArt) {
		showMessage('info', alreadyEnteredTotalArt(wayBillNum, nonOfArt));
		return;
	}
	
	//Please insert GetArticleDetails.js file with file
	getArticleDetailsByDispatchLedger(wayBillId, dispatchLedgerId, shortReceieveFilter);
	openDialog('dialogShortForm');
	
	//initialiseFocus();
}

function openWindowForDamageReceive(wayBillNum, lsNo, dispatchLedgerId, vehicleNo, vehicleNoId, wayBillId, actualWeight, privateMarka) {
	var damageReceieveFilter		= 2;
	
	$('#damageLrNumber').val(wayBillNum);
	$('#damageWayBillId').val(wayBillId);
	$('#damageLsNumber').val(lsNo);
	$('#damageDispatchLedgerId').val(dispatchLedgerId);
	$('#damageTruckNumber').val(vehicleNo);
	$('#damageVehicleMasterId').val(vehicleNoId);
	$('#damageActualWeight').val(actualWeight);
	
	setReadOnly('damageLrNumber', true);
	setReadOnly('damageLsNumber', true);
	setReadOnly('damageTruckNumber', true);
	setReadOnly('damageActUnloadWeight', true);
	setReadOnly('damageAmount', true);
	setReadOnly('damageActualWeight', true);
	
	setValueToTextField('damageFormId', 1);
	
	changeDisplayProperty('hideShowDamageTur', 'none');
	changeDisplayProperty('saveDamageButton', 'none');
	changeDisplayProperty('addDamageButton', 'block');
	
	$('#damageActUnloadWeight').val('');
	$('#damagePrivateMark').val(privateMarka);
	$('#damageWeight').val('');
	$('#damageAmount').val('');
	$('#damageRemark').val('');
	
	var nonOfArt		= getValueFromInputField('LRTotalArt' + wayBillId);
	var totalDamageArt	= countTotalDamageArtAdded(wayBillNum, wayBillId);
	
	if(totalDamageArt == nonOfArt) {
		showMessage('info', alreadyEnteredTotalArt(wayBillNum, nonOfArt));
		return;
	}
	
	//Please insert GetArticleDetails.js file with file
	getArticleDetailsByDispatchLedger(wayBillId, dispatchLedgerId, damageReceieveFilter);
	openDialog('dialogDamageForm');
	//initialiseFocus();
}

function openWindowForExcessReceive(id) {
	changeDisplayProperty('showHideTur', 'none');
	changeDisplayProperty('saveExcessButton', 'none');
	changeDisplayProperty('addExcessButton', 'block');

	setValueToTextField('excessLSNumber', $('#lsNumber').val());
	setReadOnly('excessLSNumber', true);
	enableDisableInputField('excessLSNumber', true)
	
	setValueToTextField('excessDispatchLedgerId', $('#dispatchLedgerId').val());
	setValueToTextField('excessLRNumber', '');
	setValueToTextField('privateMark', '');

	if(document.getElementById('packingTypeMasterId') != null) {
		document.getElementById('packingTypeMasterId').selectedIndex	= 0;
	}
	
	setValueToTextField('saidToContain', '');
	setValueToTextField('excessArticle', '');
	setValueToTextField('excessWeight', '');
	setValueToTextField('excessRemark', '');
	
	openDialog(id);
	//initialiseFocus();
	setPackingTypeForExcess(); //calling from bottom
}

function countTotalEntriesOnWayBillNumber() {
	openDialog('dialog');
}

function removeArticleDetails() {
	removeTableRows('articleDetails', 'tbody');
}

function resetDispatchDetails() {
	setValueToTextField('excessDispatchLedgerId', 0);
	setValueToTextField('turNumber', '');
	setReadOnly('turNumber', false);
	setValueToTextField('turBranchId', 0);
	setValueToTextField('damageTurBranchId', 0);
	setValueToTextField('executiveBranchId', 0);
	setValueToTextField('shortDispatchLedgerId', 0);
	setValueToTextField('truckNumber', '');
	setReadOnly('truckNumber', false);
	setValueToTextField('damageTruckNumber', '');
	setReadOnly('damageTruckNumber', false);
	setValueToTextField('vehicleMasterId', 0);
	setValueToTextField('damageVehicleMasterId', 0);
	setValueToTextField('shortTurNumber', '');
	setReadOnly('shortTurNumber', false);
	setValueToTextField('damageTurNumber', '');
	setReadOnly('damageTurNumber', false);
	$('#actualWeight').val(0);
	$('#damageActualWeight').val(0);
	setReadOnly('actualWeight', false);
	setReadOnly('damageActualWeight', false);
}

function displayExcessOptType() {
	
	var type	= getValueFromInputField('selectExcessOptType');

	if(type == 0) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateExcessDetails', 'none');
	} else if(type == 1) {
		toogleElement('bottom-border-boxshadow', 'block');
		toogleElement('updateExcessDetails', 'none');
		toogleElement('updateExcessButton', 'none');
		toogleElement('deleteExcessButton', 'none');
		toogleElement('saveExcessButton', 'block');
		setPackingTypeForExcess(); //defined in ShortExcess.js
	} else if(type == 2) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateExcessDetails', 'block');
		toogleElement('updateButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('updatePhotoButton', 'none');
		toogleElement('saveExcessButton', 'none');
		$('#excessNumber').val('');
	} else if(type == 3) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateExcessDetails', 'block');
		toogleElement('updatePhotoButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('saveExcessButton', 'none');
		toogleElement('updateButton', 'none');
		$('#excessNumber').val('');
	}
	
	refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
	removeTableRows('excessDetailsList', 'tbody');
}

function displayShortOptType() {
	
	var type	= getValueFromInputField('selectShortOptType');

	if(type == 0) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateShortDetails', 'none');
		removeTableRows('shortDetailsList', 'tbody');
		refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
	} else if(type == 1) {
		toogleElement('bottom-border-boxshadow', 'block');
		toogleElement('updateShortDetails', 'none');
		toogleElement('saveExcessButton', 'block');
		removeTableRows('shortDetailsList', 'tbody');
		refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
	} else if(type == 2) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateShortDetails', 'block');
		toogleElement('updateButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('updatePhotoButton', 'none');
		toogleElement('saveExcessButton', 'none');
		$('#shortNumber').val('');
	} else if(type == 3) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateShortDetails', 'block');
		toogleElement('updatePhotoButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('saveExcessButton', 'none');
		toogleElement('updateButton', 'none');
		$('#shortNumber').val('');
	}
}

function displayDamageOptType() {
	
	var type	= getValueFromInputField('selectDamageOptType');

	if(type == 0) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateDamageDetails', 'none');
		removeTableRows('shortDetailsList', 'tbody');
		refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
	} else if(type == 1) {
		toogleElement('bottom-border-boxshadow', 'block');
		toogleElement('updateDamageDetails', 'none');
		toogleElement('saveExcessButton', 'block');
		removeTableRows('shortDetailsList', 'tbody');
		refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
	} else if(type == 2) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateDamageDetails', 'block');
		toogleElement('updateButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('updatePhotoButton', 'none');
		toogleElement('saveExcessButton', 'none');
		$('#damageNumber').val('');
	} else if(type == 3) {
		toogleElement('bottom-border-boxshadow', 'none');
		toogleElement('updateDamageDetails', 'block');
		toogleElement('updatePhotoButton', 'inline-block');
		toogleElement('fileUpload', 'none');
		toogleElement('saveExcessButton', 'none');
		toogleElement('updateButton', 'none');
		$('#damageNumber').val('');
	}
}

function hideFileUpload() {
	refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
}

function setPackingTypeForExcess() {
	operationOnSelectTag('packingTypeMasterId', 'removeAll', '', '');
	operationOnSelectTag('packingTypeMasterId', 'addNew', '---Article Type---', -1);
	
	//packingType - coming from PropertiesEnableDisable.js and 
	if(typeof packingType != 'undefined') {
		for(var i = 0; i < packingType.length; i++) {
			var packingTypeMaster	= packingType[i];
			
			var packingName			= packingTypeMaster.name;
			var packingTypeId		= packingTypeMaster.packingTypeMasterId;
			
			operationOnSelectTag('packingTypeMasterId', 'addNew', packingName, packingTypeId);
		}
	}
}

function getActiveExecutive(data){
	
	var executive				= data.executive;
	var branchesList			= data.branchesList;
	var ExecutiveTypeConstant	= data.ExecutiveTypeConstant;
	
	populateBranches(branchesList);
	
	if(shortReceiveConfig.doNotAllowShortEntryAfterBlhpvCreation == 'true' || shortReceiveConfig.doNotAllowShortEntryAfterBlhpvCreation == true){
		if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN){
			$('#showHideBranch').css('display','inline');
			$('#showHideExecutive').css('display','inline');
		}  else {
			$('#showHideBranch').css('display','none');
			$('#showHideExecutive').css('display','none');
		}
	}
}

function populateBranches(branchesList){
	
	var branchListEle = $("#branchEle");
	
	if(typeof branchesList !== 'undefined' && branchesList != null) {
		
		for(var i = 0; i < branchesList.length; i++) {
			
			var branch	= branchesList[i];
			
			branchListEle.append("<option value="+ branch.branchId +">" + branch.name + "</option>");
		}
	}
	$('#branchEle').change(function() {
		if($('#branchEle').val() > 0){
			execReqd	= true;
			populateActiveExecutiveByBranchId($('#branchEle').val(),'executiveEle');
		}
	});
}

