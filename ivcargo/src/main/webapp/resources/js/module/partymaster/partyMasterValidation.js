/**
 * 
 */

function validateElement(id,msg){

	var el = document.getElementById(id);
	if(el != null) {

		var chkValue = 0;
		if(el.type == 'text') {
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			msg = 'Please Enter '+msg+' !';
		} else if(el.type == 'select-one') {
			chkValue = el.value;
			msg = 'Please Select '+msg+' !';
		} else if(el.type == 'textarea') {
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			msg = 'Please Enter '+msg+' !';
		} else if(el.type == 'hidden') {
			chkValue = el.value;
		}
		if(chkValue <= 0) {
			showMessage('error', iconForErrMsg + ' ' + msg);
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		} else {
			toogleElement('error','none');
			removeError(id);
		}
		return true;
	}
	return true;
}

function formValidations() {
	if (partyMasterConfig.validateBranchOnEdit == 'true' || editPartyBranchId != 0) {
		if(!validateElement('region','Region')){return false;}
		if(!validateElement('subRegion','SubRegion')){return false;}
		if(!validateElement('sourceBranch','sourceBranch')){return false;}
	}
	if(!validateElement('name','Name')){return false;}
	if(!validateElement('displayName','Display Name')){return false;}
	if(!validateElement('corpAccType','Party Type')){return false;}
	if(!validateElement('address','Address')){return false;}
	if(!validateElement('city','City')){return false;}
	//if(!validateElement('pinCode','Pin Code')){return false;}
	
	/*if(partyMasterConfig.contactPersonFeildMandatory == 'true'){
		if(!validateElement('contactPerson','Contact Person')){return false;}
	}*/
	
	if(partyMasterConfig.serviceTaxPaidByCreditor == 'true') {
		if(document.getElementById('serviceTaxPaid') != null) {
			var el = document.getElementById('serviceTaxPaid') ;
			var chkValue = 0;
			chkValue = el.value;
			msg = 'Please Select Service Tax Paid !';
			if(chkValue < 0) {
				showMessage('error', iconForErrMsg + ' ' + msg);
				toogleElement('error','block');
				changeError1('serviceTaxPaid','0','0');
				return false;
			} else {
				toogleElement('error','none');
				removeError('serviceTaxPaid');
			}
		}
	}
	
	/*if(partyMasterConfig.phoneNumberFeildMandatory == 'true'){
		if(!validateElement('stdCode1','Phone Number')){return false;}
		//if(!validateElement('phNumber1','Phone Number')){return false;}
	}*/
	
	if(!validatePhoneNumber(7, 'phNumber1')){return false;}
	if(!validatePhoneNumber(7, 'phNumber2')){return false;}
	//if(!validateElement('mobileNumber1','Mobile Number')){return false;}
	if(partyMasterConfig.emailAddressFeildMandatory == 'true'){
		if(!validateElement('emailAddress','Email Address')){return false;}
	}
	if(!validateLengthOfMobileNumber(5, 'mobileNumber1')) {return false;}
	if(!validateLengthOfMobileNumber(5, 'mobileNumber2')) {return false;}
	if(!validateEmailAddress('emailAddress','emailAddress')){return false;}
	
	/*if(partyMasterConfig.tinNoValidationAllow == 'true') {
		if(!validateElement('tinNo','Tin No')) {return false;}
	}*/
	
	if(!validateLengthOfTinNumber(4, 'tinNo')) {return false;}

	if(!validateLengthOfGSTNumber()) {return false;}
	if(partyMasterConfig.isInsuredByRequired == 'true') {
		if(document.getElementById('insuredBy') != null){
			var el = document.getElementById('insuredBy') ;
			var chkValue = 0;
			chkValue = el.value;
			msg = 'Please Select Insured By !';
			if(chkValue <= 0) {
				showMessage('error', iconForErrMsg + ' ' + msg);
				toogleElement('error','block');
				changeError1('insuredBy','0','0');
				return false;
			} else {
				toogleElement('error','none');
				removeError('insuredBy');
			}
		}
	}
	var el = document.getElementById('details').getElementsByTagName('input');
	for (var i = 0; i < el.length; i++) {
        if (el[i].type == 'text') {
        	el[i].value = el[i].value.toUpperCase();
        }
    }

	el = document.getElementById('details').getElementsByTagName('textarea');
	for (var i = 0; i < el.length; i++) {
       	el[i].value = el[i].value.toUpperCase();
    }
	if (partyMasterConfig.showTanNumberField == 'true') {
		
		if(!validateTanNumber('0','tanNo')){
			return false;
		}
	}
	// All validation check done
	return true;
}
function validateLengthOfGSTNumber() {
	if(!validateInputTextFeild(9, 'gstn', 'gstn', 'info', gstnErrMsg)) {
		return false;
	}

	return true;
}
function validateEmailAddress(filter, id) {
	if(!isValidEmailId(id)) {
		showMessage('info',' Please, Enter Valid Email Address');
		toogleElement('error','block');
		changeError1(id,'0','0');
		return false;
	} else {
		hideAllMessages();
		toogleElement('error','none');
		removeError(id);
		return true;
	}
}
