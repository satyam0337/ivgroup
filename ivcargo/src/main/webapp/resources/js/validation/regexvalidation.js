/**
 * Include Utility.js file also with this
 */


//Regex Validator Message

var iconForWarningMsg		= '<i class="fa fa-warning"></i>';

var alphaNumericAllowWarningMsg				= iconForWarningMsg+' Only A-Z and 0-9 allowed, No other Character Allowed !';
var numericAllowWarningMsg					= iconForWarningMsg+' Only 0-9 allowed !';
var characterAllowWarningMsg				= iconForWarningMsg+' Only A-Z allowed !';
var specialCharacterNumberAllowWarningMsg	= iconForWarningMsg+' Only Special Characters and 0-9 allowed, No other Character Allowed !'; 
var otherCharacterAllowWarningMsg			= iconForWarningMsg+' Other character not allowed !';
var allowSpecialCharacterForPartyName		= false;
var allowedSpecialCharactersForPartyName	= '';
var allowSpecialCharacterForRemark			= false;
var allowedSpecialCharactersForRemark		= '';

function regexValidationInputFeild(evt) {
	
	if(configuration.isAllowOnlyAlphanumeric == true || configuration.isAllowOnlyAlphanumeric == 'true') {
		if(!allowOnlyAlphanumeric(evt)) {return false;}
	}

	if(configuration.isAllowOnlyNumeric == true || configuration.isAllowOnlyNumeric == 'true') {
		if(!allowOnlyNumeric(evt)) {return false;}
	}

	if(configuration.isAllowOnlyCharacter == true || configuration.isAllowOnlyCharacter == 'true') {
		if(!allowOnlyCharacter(evt)) {return false;}
	}

	if(configuration.isAllowSpecialCharacter == true || configuration.isAllowSpecialCharacter == 'true') {
		if(!allowSpecialCharacters(evt)) {return false;}
	}
	
	if(configuration.isAllowAlphnumericWithSpecialCharacters == true || configuration.isAllowAlphnumericWithSpecialCharacters == 'true') {
		if(!allowAlphaNumericAndSpecialCharacters(evt)) {return false;}
	}

	return true;
}

function getKeynum(evt) {
	let keynum = null;

	if(window.event){ // IE
		keynum = evt.keyCode;
	} else if(evt.which){ // Netscape/Firefox/Opera
		keynum = evt.which;
	}
	
	return keynum;
}

function allowOnlyAlphanumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		let keynum = getKeynum(evt);

		if(keynum == 8 || keynum == 13)
			return true;

		var charStr = String.fromCharCode(keynum);
		
		if (/[a-z0-9]/i.test(charStr)) {
			hideAllMessages();
			return true;
		}
		
		showMessage('warning', alphaNumericAllowWarningMsg);
		return false;
	}
}

function allowOnlyNumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum 	= getKeynum(evt);

		if(keynum != null) {
			if(keynum == 13 || keynum == 8 || keynum == 45) {
				hideAllMessages();
				return true;
			} else if (keynum < 48 || keynum > 57) {
				showMessage('warning', numericAllowWarningMsg);
				return false;
			}
		}
		
		return true;
	}
}

function allowOnlyCharacter(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum = getKeynum(evt);

		if(keynum == 8)
			return true;

		var charStr = String.fromCharCode(keynum);
		
		if (/[a-zA-Z]/i.test(charStr)) {
			hideAllMessages();
			return true;
		}
		
		showMessage('warning', characterAllowWarningMsg);
		return false;
	}
}

function allowSpecialCharacters(evt) {

	var allowedChars	= configuration.AllowedSpecialCharacters;
	var returnType		= true;
	var specialChars	= new Array();
	
	if(allowedChars != 0)
		specialChars = allowedChars.split(",");

	var keynum 	= getKeynum(evt);

	if(keynum != null) {
		if(keynum == 8) {
			hideAllMessages();
			return true;
		} else if (keynum < 48 || keynum > 57 ) {
			for(var i = 0 ; specialChars.length > i; i++) {
				if(keynum == specialChars[i]) {
					hideAllMessages();
					return true;
				}
				
				showMessage('warning', specialCharacterNumberAllowWarningMsg);
				returnType =  false;
			}
		}
	}

	if(returnType == false)
		return false;
	
	return true;
}

function allowDecimalCharacterOnly(evt) {
	var allowDecimalCharacter	= configuration.allowDecimalCharacter;
	var allowedChars = configuration.AllowedSpecialCharacters;
	var returnType	= true;
	var specialChars	= new Array();

	if(allowedChars != undefined && allowedChars != 0)
		specialChars = allowedChars.split(",");

	var keynum 	= getKeynum(evt);

	if(keynum != null) {
		if(keynum == 8) {
			hideAllMessages();
			return true;
		} else if (keynum < 48 || keynum > 57) {
			if(allowDecimalCharacter == true || allowDecimalCharacter == 'true') {
				for(var i = 0; specialChars.length > i; i++) {
					if(keynum == specialChars[i]) {
						hideAllMessages();
						return true;
					}
					
					returnType =  false;
				}
			} else
				returnType =  false;
		}
	}
	
	if(returnType == false)
		return false;
	
	return true;
}

function clearTxtFeildIfNotNumeric(obj, text) {
	if(configuration.clearTxtFeildIfNotNumeric == false || configuration.clearTxtFeildIfNotNumeric == 'false')
		return;

	var textValue = obj.value;

	if(obj.value.length > 0 && isNaN(obj.value)) {
		obj.value = text;
		alert('Invalid Number !');
		//showMessage('warning', iconForWarningMsg+ ' Invalid Number !');
		setTimeout(function(){if(obj)obj.focus();obj.select();},100); // Used to set focus as obj.focus(); doesn't work after alert90
		return false;
	} else if(textValue == '') {
		obj.value 	= text;
	} else {
		text.value = textValue;
	}

	return false;
}

function allowAlphaNumericAndSpecialCharacters(evt) {
	let filter = configuration.specialCharacterFilter;
	var keynum = getKeynum(evt);

	switch (Number(filter)) {
	
	case 1:
		if(keynum == 8 || keynum == 95)
			return true;
		
		if (keynum > 32 && keynum < 48 || keynum > 57 && keynum < 65 || keynum > 90 && keynum < 97 || keynum > 122 && keynum < 127)
			return false;
		
		break;

	case 2:
		var allowedChars 	= configuration.AllowedSpecialCharacters;
		var returnType		= true;
		var specialChars	= new Array();
		specialChars 		= allowedChars.split(",");

		var charStr = String.fromCharCode(keynum);
		
		if(keynum != null) {
			if(keynum == 8 || keynum == 13) {
				hideAllMessages();
				return true;
			} else if (/[a-zA-Z]/i.test(charStr) ||keynum < 48 || keynum > 57 ) {
				for(let i = 0 ; specialChars.length > i ; i++){
					if(/[a-zA-Z]/i.test(charStr) || keynum == specialChars[i]) {
						hideAllMessages();
						return true;
					}
						
					showMessage('warning', otherCharacterAllowWarningMsg);
					returnType =  false;
				}

			}
		}
		
		if(returnType == false)
			return false;
		
		break;
		
	default:
		break;
	}
	
	return true;

}

function regIsDigit(fData){
	if(configuration.isAllowOnlyNumeric == true || configuration.isAllowOnlyNumeric == 'true') {
		var reg = /[^0-9]/;
		if(reg.test(fData.value)){
			$('#'+fData.id).focus();
			setTimeout(function(){ $('#'+fData.id).focus(); }, 200);
			showMessage('warning', numericAllowWarningMsg);
			return false;
		}else{
			hideAllMessages();
			return true;
		}
	}
}
function removeSpecialCharacterAfterPaste(e){
	setTimeout( function(){
		$('#'+e.id).val(function(i, v) {
			return v.replace(/[^\d.]/gi, '');
		});
	}, 50);
}

function isElementExist(elementId) {
	return elementId == 'consigneeName' || elementId == 'consignorName' || elementId == 'billingPartyName'
		|| elementId == 'remark';
}

function allowSpecialCharactersIn(evt, elementId) {
	if(elementId.includes('_'))
		elementId	= elementId.split('_')[0];
		
	if(!isElementExist(elementId)) return true;
	
	let returnType		= true;
	let specialChars	= [];
	
	if((elementId == 'consigneeName' || elementId == 'consignorName' || elementId == 'billingPartyName') 
		&& allowSpecialCharacterForPartyName != undefined && allowSpecialCharacterForPartyName)
		specialChars	= allowedSpecialCharactersForPartyName.split(",");
		
	if(elementId == 'remark' && allowSpecialCharacterForRemark != undefined && allowSpecialCharacterForRemark)
		specialChars	= allowedSpecialCharactersForRemark.split(",");
		
	if(elementId == 'lrNumberManual' && waybillNumberSeperator != undefined)
		specialChars	= waybillNumberSeperator.split(",");
		
	if(specialChars.length == 0) return noSpclChars(evt);

	let keynum 	= getKeynum(evt);
	
	let charStr = String.fromCharCode(keynum);
		
	if(keynum != null) {
		if(keynum == 8 || keynum == 13 || /[a-zA-Z0-9]/i.test(charStr)) {
			hideAllMessages();
			return true;
		}
		
		if (keynum < 48 || keynum > 57) {
			if(isValueExistInArray(specialChars, keynum)) {
				hideAllMessages();
				return true;
			}
			
			showMessage('warning', otherCharacterAllowWarningMsg);
			returnType = false;
		}
	}
	
	return returnType;
}

function trimSpaces(input){
	input.value = input.value.trim();
}

function checkHyphen() {
	let manualLrNumber = $('#lrNumberManual').val();

	if (configuration.checkSingleHyphenInManualLRNumber == true || configuration.checkSingleHyphenInManualLRNumber == 'true') {
		if (countNonConsecutiveOccurrences(manualLrNumber, "-") > 1) {
			setTimeout(function() {
				showMessage("error", "Please enter single -");
				$('#lrNumberManual').focus();
			}, 200);
		}
	}

	return true;
}

function countNonConsecutiveOccurrences(str, char) {
	let regex = new RegExp(char, 'g');
	let matches = str.match(regex);
	return matches ? matches.length : 0;
}

function allowOnlyAlphanumericWithSpace(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		let keynum = getKeynum(evt);

		if(keynum == 8 || keynum == 13 || keynum == 32)
			return true;

		let charStr = String.fromCharCode(keynum);
		
		if (/[a-z0-9]/i.test(charStr)) {
			hideAllMessages();
			return true;
		}
		
		showMessage('warning', alphaNumericAllowWarningMsg);
		return false;
	}
}