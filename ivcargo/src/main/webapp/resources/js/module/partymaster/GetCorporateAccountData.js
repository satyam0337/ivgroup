/**
 * 
 */

function findValue(li) {
	if( li == null ) return alert("No match!");
	// if coming from an AJAX call, let's use the Id as the value
	if( !!li.extra ) var sValue = li.extra[0];
	// otherwise, let's just display the value in the text box
	else var sValue = li.selectValue;
	if (sValue > 0 ){
		getSeletedItemData(sValue);
	}else{
		alert('Unable to get Data, Please enter again.');
	}
}

function selectItem(li) {
	findValue(li);
}

function lookupAjax(){
	var oSuggest = $("#creditor")[0].autocompleter;
	oSuggest.findValue();
	return false;
}

$(document).ready(function() {
	$("#creditor").autocomplete(
		"PartyAutocompleteWithStringBufferAjaxAction.do?pageId=9&eventId=19&",{delay:10,minChars:2,matchSubset:1,matchContains:1,maxItemsToShow:15,
			cacheLength:100,onItemSelect:selectItem,onFindValue:findValue,extraParams:{filter:56,billing:3},autoFill:false
		}
	);
});

$('input[type="text"]').css("text-transform","uppercase");
$('input[type="text"]').keypress(function(){resetError(this);});
$('select').change(function () {resetError(this);});
$('textarea').keypress(function () {resetError(this);});

function disableButtons(){
	var searchButton = document.getElementById("findlink");
	if(searchButton != null){
		searchButton.className = 'btn_print_disabled';
		searchButton.disabled=true;
		searchButton.style.display ='none';
	}
}

function getSeletedItemData(corpId) {
	resetElements();
	disableElements();
	getCorporateAccountData(corpId);
	document.corpAccMasterForm.edit.disabled = false ;
	document.corpAccMasterForm.edit.className = 'btn_print';
	document.corpAccMasterForm.deleteItem.disabled = false ;
	document.corpAccMasterForm.deleteItem.className = 'btn_print';

	document.corpAccMasterForm.editBottom.disabled = false ;
	document.corpAccMasterForm.editBottom.className = 'btn_print';
	document.corpAccMasterForm.deleteItemBottom.disabled = false ;
	document.corpAccMasterForm.deleteItemBottom.className = 'btn_print';

}

function getCorporateAccountData(corpId) {
	removeError('name');
	toogleElement('consignorError', 'none');
	
	setValueToTextField('selectedCorpId', corpId);
	
	var jsonObject		= new Object();

	jsonObject.filter					= 7;
	jsonObject.corpId					= corpId;
	jsonObject.isDisplayDeActiveBranch	= false;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("AjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					
					console.log(data);
					
					if (data.error) {
						return;
					}
					
					var corpAcc	= data.corpAcc;
					if(corpAcc.corporateAccountId != undefined){
						setValueToTextField('selectedCorpId', corpAcc.corporateAccountId);
					}
					if(corpAcc.name != undefined){
						setValueToTextField('name', corpAcc.name);
					}
					if(corpAcc.address != undefined){
						setValueToTextField('address', corpAcc.address);
					}
					if(corpAcc.pincode != undefined){
						setValueToTextField('pinCode', corpAcc.pincode);
					}
					if(corpAcc.contactPerson != undefined){
						setValueToTextField('contactPerson', corpAcc.contactPerson);
					}
					if(corpAcc.department != undefined){
						setValueToTextField('department', corpAcc.department);
					}
					
					if(corpAcc.mobileNumber != undefined){
						setValueToTextField('mobileNumber1', corpAcc.mobileNumber);
					}
					
					if(corpAcc.phoneNumber != null && (corpAcc.phoneNumber).length > 0){
						var stdCodeAndPhNo 	= new Array();
						stdCodeAndPhNo 		= (corpAcc.phoneNumber).split("-");
						
						setValueToTextField('stdCode1', stdCodeAndPhNo[0]);
						setValueToTextField('phNumber1', stdCodeAndPhNo[1]);
						setValueToTextField('phoneNumber1', corpAcc.phoneNumber);
					}
					
					if(corpAcc.faxNumber != undefined){
						setValueToTextField('faxNumber', corpAcc.faxNumber);
					}
					if(corpAcc.emailAddress != undefined){
						setValueToTextField('emailAddress', corpAcc.emailAddress);
					}
					
					if(corpAcc.location != undefined){
						setValueToTextField('location', corpAcc.location);
					}
					
					curName 		= corpAcc.name;
					curMobileNo		= corpAcc.mobileNumber;

					if(corpAcc.cityId != undefined){
						selectOptionByValue(document.corpAccMasterForm.city, corpAcc.cityId);
					}
					if(corpAcc.corporateAccountType != undefined){
						selectOptionByValue(document.corpAccMasterForm.corpAccType, corpAcc.corporateAccountType);
					}

					if(document.corpAccMasterForm.corpAccSubType !=null){
						selectOptionByValue(document.corpAccMasterForm.corpAccSubType, corpAcc.corporateAccountSubType);
					}

					if(corpAcc.phoneNumber2 != null && corpAcc.phoneNumber2 && (corpAcc.phoneNumber2).length > 0){
						var stdCodeAndPhNo = new Array();

						stdCodeAndPhNo 		= (corpAcc.phoneNumber2).split("-");
						
						setValueToTextField('stdCode2', stdCodeAndPhNo[0]);
						setValueToTextField('phNumber2', stdCodeAndPhNo[1]);
						setValueToTextField('phoneNumber2', corpAcc.phoneNumber2);
					}
					
					if(corpAcc.mobileNumber2 != undefined){
						setValueToTextField('mobileNumber2', corpAcc.mobileNumber2);
					}
					if(corpAcc.displayName != undefined){
						setValueToTextField('displayName', corpAcc.displayName);
					}
					
					enableDisableInputField('displayName', true);
					
					if(document.corpAccMasterForm.serviceTaxPaid !=null){
						selectOptionByValue(document.corpAccMasterForm.serviceTaxPaid,corpAcc.serviceTaxPaid);
					}
					if(document.corpAccMasterForm.insuredBy !=null){
						selectOptionByValue(document.corpAccMasterForm.insuredBy,corpAcc.insuredBy);
					}

					if(corpAcc.tBBParty == false ) {
						checkedUnchecked('isCreditor', 'false');
				 	} else {
				 		checkedUnchecked('isCreditor', 'true');
				 	}
					
					setValueToTextField('blackListed', corpAcc.blackListed);
					
					if(corpAcc.serviceTaxRequired == true) {//Set serviceTaxRequired value
						selectOptionByValue(document.corpAccMasterForm.serviceTaxRequired, 1);
					} else {
						selectOptionByValue(document.corpAccMasterForm.serviceTaxRequired, 0);
					}
					
					if(corpAcc.marketingPersonName != undefined){
						setValueToTextField('marketingPerson', corpAcc.marketingPersonName);
					}
					if(corpAcc.serviceTaxNumber != undefined){
						setValueToTextField('serviceTaxNo', corpAcc.serviceTaxNumber);
					}
					if(corpAcc.tinNumber != undefined){
						setValueToTextField('tinNo', corpAcc.tinNumber);
					}
					if(corpAcc.remark != undefined){
						setValueToTextField('remark', corpAcc.remark);
					}
					if(corpAcc.panNumber != undefined){
						setValueToTextField('panNumber', corpAcc.panNumber);
					}
					if(corpAcc.gstn != undefined){
						setValueToTextField('gstn', corpAcc.gstn);
						oldGSTN = corpAcc.gstn;
					}
										
					setSubRegion(data.subRegions);
					setsourceBranches(data.branches);
					editPartyBranchId = corpAcc.branchId;
					
					setValueToTextField('sourceBranch', corpAcc.branchId);
					setValueToTextField('subRegion', data.branchsubRegion);
					setValueToTextField('region', data.branchRegion);

					if(corpAcc.podRequired != undefined && corpAcc.podRequired == true){
						setValueToTextField('podRequired', PODRequiredConstant.POD_REQUIRED_YES_ID);
					} else {
						setValueToTextField('podRequired', PODRequiredConstant.POD_REQUIRED_NO_ID);
					}
					
					if(corpAcc.deliveryAt != undefined) {
						setValueToTextField('deliveryAt', corpAcc.deliveryAt);
					}
					
					
					if(corpAcc.chargedWeightRound != undefined && corpAcc.chargedWeightRound == true){
						setValueToTextField('ChargedWeightRound', CorporateAccountConstant.CHARGED_WEIGHT_ROUND_YES_ID);
						changeDisplayProperty('ChargedWeightRoundOffValueRow', 'table-row');
					} else {
						setValueToTextField('ChargedWeightRound', CorporateAccountConstant.CHARGED_WEIGHT_ROUND_NO_ID);
						changeDisplayProperty('ChargedWeightRoundOffValueRow', 'none');
					}
					
					if(corpAcc.chargedWeightRoundOffValue != undefined) {
						setValueToTextField('ChargedWeightRoundOffValue', corpAcc.chargedWeightRoundOffValue);
					}
					
					setValueToTextField('discountOnTxn', corpAcc.discountOnTxnType);
					
					if(corpAcc.podRequiredForInvoiceCreation != undefined && corpAcc.podRequiredForInvoiceCreation == true) {
						$('#PodRequiredForInvoiceCreation').val(PODRequiredConstant.POD_REQUIRED_FOR_INVOICE_CREATION_YES);
					} else {
						$('#PodRequiredForInvoiceCreation').val(PODRequiredConstant.POD_REQUIRED_FOR_INVOICE_CREATION_NO);
					}
					
					setValueToTextField('ShortCreditAllowOnTxnTypeId', corpAcc.shortCreditAllowOnTxnType);
					setValueToTextField('RateAllowOnWeightTypeId', corpAcc.weightType);
					if(corpAcc.partyCode != undefined){
						setValueToTextField('partyCode', corpAcc.partyCode);
					}
					if(corpAcc.tanNumber != undefined){
						setValueToTextField('tanNo', corpAcc.tanNumber);
					}
					
					if(corpAcc.smsRequiredId != undefined){
						setValueToTextField('smsRequiredId', corpAcc.smsRequiredId);
					}
					
					if(corpAcc.transporter != undefined && corpAcc.transporter == true){
						selectOptionByValue(document.corpAccMasterForm.isTransporter, corpAcc.transporter);
					} else {
						selectOptionByValue(document.corpAccMasterForm.isTransporter, corpAcc.transporter);
					}
				}
			});
	
}

function selectOptionByValue(selObj, val) {
	var A= selObj.options, L= A.length;

    while(L){
        if (A[--L].value== val){
            selObj.selectedIndex= L;
            L= 0;
        }
    }
}

function setSubRegion(subRegion) {
	
	if (document.getElementById('subRegion') == null) {
		return;
	}
	
	for (var key in subRegion) {
		createOption('subRegion', key, subRegion[key]);
	}
}

function setsourceBranches(branches) {
	
	var obj = document.getElementById('sourceBranch');
	if (obj == null || (obj != null && obj.type == 'hidden')) {
		return;
	}

	
	for (var key in branches) {
		createOption('sourceBranch', key, branches[key]);
	}
}

function setPhoneNumber(flag) {
	
	var stdCode	 	= document.getElementById('stdCode' + flag);
	var phNumber 	= document.getElementById('phNumber' + flag);
	var phoneNumber = document.getElementById('phoneNumber' + flag);
	
	if(stdCode.value.length > 0 && phNumber.value.length <= 0){
		phoneNumber.value = stdCode.value;
	} else {
		if(phNumber.value.length > 0 && stdCode.value.length <= 0){
			phoneNumber.value = phNumber.value;
		} else{
			if(phNumber.value.length > 0 && stdCode.value.length > 0){
				phoneNumber.value = stdCode.value +'-'+ phNumber.value;
			}
		}
	}
}