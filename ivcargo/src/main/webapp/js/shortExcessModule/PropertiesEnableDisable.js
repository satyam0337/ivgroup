/**
 * @author Anant Chaudhary	17-11-2015
 */

var shortReceiveConfig				= null;
var damageReceiveConfig				= null;
var excessReceiveConfig				= null;
var claimEntryConfig				= null;
var packingType						= null;
var shortReceiveSettlementConfig	= null;
var damageReceiveSettlementConfig   = null;
function getShortProperties() {
	
	var jsonObject				= new Object();
	
	jsonObject.filter			= 1;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					
					hideLayer();
				} else {
					shortReceiveConfig		= data.shortReceiveConfig;
					
					showHideShortDetails();
					
					hideLayer();
				}
			});
}

function showHideShortDetails() {
	if(shortReceiveConfig.allowToUploadShortLRPhoto == 'false') {
		$("#uploadShortLRPhoto").css("display", "none");
	}
	
	if(shortReceiveConfig.LRNumber == 'false') {
		$("#hideshowLr").css("display", "none");
	}
	
	if(shortReceiveConfig.LSNumber == 'false') {
		$("#hideshowls").css("display", "none");
	}
	
	if(shortReceiveConfig.TruckNumber == 'false') {
		$("#hideShowTruck").css("display", "none");
	}
	
	if(shortReceiveConfig.TURNumber == 'false') {
		$("#hideShowTur").css("display", "none");
	}
	
	if(shortReceiveConfig.ActualWeight == 'true') {
		$("#hideShowActualWeight").css("display", "block");
		$("#storedShortActualWeight").css("display", "block");
	} 
	
	if(shortReceiveConfig.ActUnloadWeight == 'false') {
		$("#hideShowActUnloadWeight").css("display", "none");
		$("#storedShortActUnloadWeight").css("display", "none");
	} 
	
	if(shortReceiveConfig.PrivateMark == 'false') {
		$("#hideShowPrivateMark").css("display", "none");
	}
	
	if(shortReceiveConfig.ShortWeight == 'false') {
		$("#hideShowShortWeight").css("display", "none");
	}
	
	if(shortReceiveConfig.Amount == 'false') {
		$("#hideShowAmount").css("display", "none");
	}
	
	if(shortReceiveConfig.Remark == 'false') {
		$("#showHideRemark").css("display", "none");
	}
	
	if(shortReceiveConfig.isArticleDetailsDisplay == 'false') {
		$("#articleDetailsForShort").css("display", "none");
	}
	
	if(shortReceiveConfig.editableActualUnloadWeight == 'false') {
		$('#actUnloadWeight').attr('readonly', true);
	}
	
	if(shortReceiveConfig.editableShortWeight == 'false') {
		$('#shortWeight').attr('readonly', true);
	}
}

function getDamageProperties() {
	
	var jsonObject				= new Object();
	
	jsonObject.filter			= 2;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					
					hideLayer();
				} else {
					damageReceiveConfig		= data.damageReceiveConfig;
					
					showHideDamageDetails();
					
					hideLayer();
				}
			});
}

function showHideDamageDetails() {
	if(damageReceiveConfig.allowToUploadDamageLRPhoto == 'false') {
		$("#uploadDamageLRPhoto").css("display", "none");
	}
	
	if(damageReceiveConfig.LRNumber == 'false') {
		$("#hideshowDamageLr").css("display", "none");
	}
	
	if(damageReceiveConfig.LSNumber == 'false') {
		$("#hideshowDamagels").css("display", "none");
	}
	
	if(damageReceiveConfig.TruckNumber == 'false') {
		$("#hideShowDamageTruck").css("display", "none");
	}
	
	if(damageReceiveConfig.TURNumber == 'false') {
		$("#hideShowDamageTur").css("display", "none");
	}
	
	if(damageReceiveConfig.ActualWeight == 'false') {
		$("#storedDamageActualWeight").css("display", "none");
		$("#hideShowDamageActualWeight").css("display", "none");
	} 
	
	if(damageReceiveConfig.ActUnloadWeight == 'false') {
		$("#storedDamageActUnloadWeight").css("display", "none");
		$("#hideShowDamageActUnloadWeight").css("display", "none");
	} 
	
	if(damageReceiveConfig.PrivateMark == 'false') {
		$("#hideShowDamagePrivateMark").css("display", "none");
	}
	
	if(damageReceiveConfig.ShortWeight == 'false') {
		$("#hideShowDamageWeight").css("display", "none");
	}
	
	if(damageReceiveConfig.DamageArticleClaimAmount == 'false') {
		$("#hideShowDamageAmount").css("display", "none");
	}
	
	if(damageReceiveConfig.Remark == 'false') {
		$("#showHideDamageRemark").css("display", "none");
	}
	
	if(damageReceiveConfig.isArticleDetailsDisplay == 'false') {
		$("#articleDetailsForDamage").css("display", "none");
	}
	
	if(damageReceiveConfig.editableActualUnloadWeight == 'false') {
		$('#damageActUnloadWeight').attr('readonly', true);
	}
	
	if(damageReceiveConfig.editableDamageWeight == 'false') {
		$('#damageWeight').attr('readonly', true);
	}
	
	if(damageReceiveConfig.editableDamageArticleClaimAmount == 'false') {
		$('#damageWeight').attr('readonly', true);
	}
}

function getExcessFieldProperties() {
	
	var jsonObject				= new Object();
	
	jsonObject.filter			= 3;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					
					hideLayer();
				} else {
					excessReceiveConfig		= data.excessReceiveConfig;
					packingType				= data.packingType;

					showHideExcessDetails();
					
					setPackingTypeForExcess(); //defined in ShortExcess.js
					
					hideLayer();
				}
			});
}

function showHideExcessDetails() {
	if(excessReceiveConfig.allowToUploadExcessLRPhoto == 'false') {
		$("#updateExcessLRPhoto").css("display", "none");
	}
	
	if(excessReceiveConfig.LRNumber == 'false') {
		$("#showHideExcessLr").css("display", "none");
	}
	
	if(excessReceiveConfig.LSNumber == 'false') {
		$("#showHideExcessLs").css("display", "none");
	}
	
	if(excessReceiveConfig.TURNumber == 'false') {
		$("#showHideExcessTur").css("display", "none");
	}
	
	if(excessReceiveConfig.PrivateMark == 'false') {
		$("#showHideExcessPrivateMark").css("display", "none");
	}
	
	if(excessReceiveConfig.ArticleType == 'false') {
		$("#showHideExcessArticleType").css("display", "none");
	} 
	
	if(excessReceiveConfig.SaidToContain == 'false') {
		$("#showHideExcessSaidToContain").css("display", "none");
	}
	
	if(excessReceiveConfig.ExcessArticle == 'false') {
		$("#showHideExcessArticle").css("display", "none");
	}
	
	if(excessReceiveConfig.Weight == 'false') {
		$("#showHideExcessWeight").css("display", "none");
	}
	
	if(excessReceiveConfig.Remark == 'false') {
		$("#showHideExcessRemark").css("display", "none");
	}
}

function getClaimFieldProperties() {
	var jsonObject				= new Object();
	
	jsonObject.filter			= 4;
	
	var jsonStr = JSON.stringify(jsonObject);

	showLayer();
	
	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					
					hideLayer();
				} else {
					claimEntryConfig		= data.claimEntryConfig;
					
					if(claimEntryConfig.LRNumber == 'false') {
						$("#showHideLr").css("display", "none");
					}
					
					if(claimEntryConfig.LounchBy == 'false') {
						$("#showHideLounchBy").css("display", "none");
					}
					
					if(claimEntryConfig.ClaimAmount == 'false') {
						$("#showHideClaimAmount").css("display", "none");
					}
					
					if(claimEntryConfig.ClaimPerson == 'false') {
						$("#showHideClaimPerson").css("display", "none");
					}
					
					if(claimEntryConfig.Remark == 'false') {
						$("#showHideRemark").css("display", "none");
					} 
					
					hideLayer();
				}
			});
	
}

function getShortReceiveSettlementProperties() {

	var jsonObject				= new Object();

	jsonObject.filter			= 5;

	var jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
				} else {
					shortReceiveSettlementConfig		= data.shortReceiveSettlementConfig;

					if(shortReceiveSettlementConfig.searchByLRNo == 'false')
						$("#searchByLrNo").css("display", "none");

					if(shortReceiveSettlementConfig.searchByShortNumber == 'false')
						$("#searchByShortNo").css("display", "none");
					
					hideLayer();
				}
			})
}

function getExcessReceiveSettlementProperties() {

	var jsonObject				= new Object();

	jsonObject.filter			= 6;

	var jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
				} else {
					excessReceiveSettlementConfig		= data.excessReceiveSettlementConfig;

					if(excessReceiveSettlementConfig.searchByLRNo == 'false')
						$("#searchByLrNo").css("display", "none");

					if(excessReceiveSettlementConfig.searchByExcessNumber == 'false')
						$("#searchByExcessNo").css("display", "none");
					
					hideLayer();
				}
			})
}

function getDamageReceiveSettlementProperties() {

	var jsonObject				= new Object();

	jsonObject.filter			= 7;

	var jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.getJSON("GetShortExcessPropertiesAction.do?pageId=330&eventId=27",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
				} else {
					damageReceiveSettlementConfig		= data.damageReceiveSettlementConfig;
					//console.log('damageReceiveSettlementConfig ',damageReceiveSettlementConfig)
					if(damageReceiveSettlementConfig.searchByLRNo == 'false'){
						$("#searchByLrNo").css("display", "none");
					}

					if(damageReceiveSettlementConfig.searchByDamageNumber == 'false'){
						$("#searchByDamageNo").css("display", "none");
					}
					
					hideLayer();
				}
			})
}

function regexValidationInputFeild(evt) {
	if( shortReceiveConfig !=null &&  shortReceiveConfig.isAllowAlphnumericWithSpecialCharacters == 'true') {
		if(!allowAlphaNumericAndSpecialCharacters(evt)) {return false;}
		return true;
	}else if( damageReceiveConfig != null && damageReceiveConfig.isAllowAlphnumericWithSpecialCharacters == 'true'){
		if(!allowAlphaNumericAndSpecialCharacters(evt)) {return false;}
		return true;
	}
	
}

function allowAlphaNumericAndSpecialCharacters(evt) {
	var filter = 0;
	
	if(shortReceiveConfig !=null && shortReceiveConfig.specialCharacterFilter) {
		filter = shortReceiveConfig.specialCharacterFilter;
	} else if( damageReceiveConfig != null && damageReceiveConfig.specialCharacterFilter) {
		filter = damageReceiveConfig.specialCharacterFilter;
	}
	
	switch (Number(filter)) {
	case 1:
		var keynum = null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which) {// Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum == 8 || keynum == 95 ){
			return true;
		}
		if ((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127) ) {
			return false;
		}
		
		break;

	case 2:
		var allowedChars = 0 ;
		
		if(shortReceiveConfig != null && shortReceiveConfig.AllowedSpecialCharacters != undefined) { 			
			allowedChars 	= shortReceiveConfig.AllowedSpecialCharacters;
		} else if(damageReceiveConfig != null && damageReceiveConfig.AllowedSpecialCharacters != undefined) {
			allowedChars	= damageReceiveConfig.AllowedSpecialCharacters;	
		}
		
		var returnType		= true;
		var specialChars	= new Array();
		specialChars 		= allowedChars.split(",");

		var keynum 	= null;

		if(window.event) { // IE
			keynum = evt.keyCode;
		} else if(evt.which) { // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		var charStr = String.fromCharCode(keynum);
		
		if(keynum != null) {
			if(keynum == 8 || keynum == 13) {
				hideAllMessages();
				return true;
			} else if(keynum != 46) {
				if (/[a-zA-Z]/i.test(charStr) ||keynum < 48 || keynum > 57 ) {
					for(var i = 0 ; specialChars.length > i ; i++){
						if(/[a-zA-Z]/i.test(charStr) || keynum == specialChars[i]) {
							hideAllMessages();
							return true;
						} else {
							showMessage('warning', otherCharacterAllowWarningMsg);
							returnType =  false;
						}
					}
				}
			} else {
				showMessage('warning', otherCharacterAllowWarningMsg);
				returnType =  false;
			}
		}
		
		if(returnType == false){
			return false;
		}
		
		break;
		
	default:
		break;
	}
	
	return true;
}

function regexValidationInputFeild(evt) {
	
	if(claimEntryConfig != null && claimEntryConfig.isAllowAlphnumericWithSpecialCharacters == 'true') {
		if(!allowAlphaNumericAndSpecialCharacters(evt)) {return false;}
	}

	return true;
}

function allowAlphaNumericAndSpecialCharacters(evt) {
	if(claimEntryConfig == null)
		return;
	
	var filter = claimEntryConfig.specialCharacterFilter;

	switch (Number(filter)) {
	case 1:
		var keynum =null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which) {// Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum == 8 || keynum == 95 ){
			return true;
		}
		if ((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127) ) {
			return false;
		}

		break;

	case 2:
		var allowedChars = claimEntryConfig.AllowedSpecialCharacters;
		var returnType	= true;
		var specialChars	= new Array();
		specialChars =  allowedChars.split(",");

		var keynum = null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		var charStr = String.fromCharCode(keynum);

		if(keynum != null) {
			if(keynum == 8 || keynum == 13) {
				hideAllMessages();
				return true;

			} else if(keynum != 46){
				console.log("keynumm11 ",keynum)
				if (/[a-zA-Z]/i.test(charStr) ||keynum < 48 || keynum > 57 ) {
					for(var i = 0 ; specialChars.length > i ; i++){
						if(/[a-zA-Z]/i.test(charStr) || keynum == specialChars[i]) {
							hideAllMessages();
							return true;
						} else {
							showMessage('warning', otherCharacterAllowWarningMsg);
							returnType =  false;
						}
					}

				}
			} else {
				showMessage('warning', otherCharacterAllowWarningMsg);
				return false;
			} 
		}
		if(returnType == false){
			return false;
		}

		break;

	default:
		break;
	}

	return true;

}