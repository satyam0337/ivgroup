/**
 * @author Anant Chaudhary	23-11-2015
 */
var sValue			= null;
var consignorAc		= null;
var partyType		= null;

var CLAIM_ENTRY_MODULE	= 'claimEntryModule';

function resetPartyData() {

	if(document.getElementById('partyMasterId').value > 0) {
		document.getElementById('partyMasterId').value = '0';
	}
}


function getPartyDetails(partyId ,name ,no ,add ,pin ,conName ,email ,dept ,fax) {
	// AJAX Call
	var xmlHttp;
	try {
		xmlHttp = new XMLHttpRequest();	// Firefox, Opera 8.0+, Safari
	} catch (e) {
		// Internet Explorer
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	var browser = navigator.appName;
	if(browser == "Microsoft Internet Explorer"){
		browser = "IE";
	}else{
		browser="NOTIE";
	}
	xmlHttp.onreadystatechange=function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/null/g,'');

			if(str == 'partynotfound') {
				showMessage('info', partyNotFoundInfoMsg);
			} else {
				var tempQty = new Array();
				tempQty 	= str.split(";");

				document.getElementById('partyMasterId').value	= $.trim(tempQty[0]);
				document.getElementById(name).value 			= tempQty[1];
			}
	
		}
	};

	xmlHttp.open("GET","/ivcargo/jsp/shortExcessModule/AjaxInterfaceForShortExcess.jsp?filter=8&partyId="+partyId,true);
	xmlHttp.send(null);
}

function findValue(li) {
	if( li == null ) 
		return alert("No match!");
	// if coming from an AJAX call, let's use the Id as the value
	if( !!li.extra ) 
		sValue = li.extra[0];
	// otherwise, let's just display the value in the text box
	else 
		sValue = li.selectValue;
	
	if (sValue > 0 ) {
		if(partyType == 3) {
			getPartyDetails(sValue ,'lounchBy', 'consignorPhn', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax');
		} else {
			getPartyDetails(sValue ,'lounchBy', 'consignorPhn', 'consignorAddress', 'consignorPin', 'consignorContactPerson', 'consignorEmail', 'consignorDept', 'consignorFax');
		}
	} else {
		alert('Unable to get Data, Please enter again.');
	}
}

function selectItem(li) {
	findValue(li);
}

function autoCompleteForPartyMaster(moduleName, textFiledId) {
	
	if(moduleName == CLAIM_ENTRY_MODULE) {
		$(document).ready(function() {
			$("#"+textFiledId).autocomplete(
				"PartyAutocompleteWithStringBufferAjaxAction.do?pageId=9&eventId=19&", {delay:10,minChars:3,matchSubset:1,matchContains:1,
					maxItemsToShow:15,cacheLength:100,onItemSelect:selectItem,onFindValue:findValue,
					extraParams:{filter:68,partyType:'1,2'},autoFill:false,selectOnly:true}
			);
		});
	}
}