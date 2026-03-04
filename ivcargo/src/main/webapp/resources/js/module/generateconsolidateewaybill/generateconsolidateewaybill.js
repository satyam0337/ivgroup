var allowConsolidateEwaybillNo = false;
function selectAllLS(param) {
	
	var tab 	= document.getElementById("results");
	var count 	= parseFloat(tab.rows.length-1);
	var row;

	if(param == true) {
			for (row = count-1; row > 0; row--) {
				if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && !tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
					tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
				} else {
					tab.rows[row].cells[1].getElementsByTagName("input")[0].checked = true;
				}
			}
	} else if(param == false) {
		for (row = count-1; row > 0; row--) {
			if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;
			} else {
				tab.rows[row].cells[1].getElementsByTagName("input")[0].checked = false;
			}
		}
	}
}

function genereateCEWB(identifire,AllowConsolidateEwaybillNo,allowGenerateConsolidateEWaybillForAnyBranch,executiveBranchId,lsBranchId) {
	var jsonObject						= {};
	var selectionMsgLs					= ' Please, Select atleast 1 LS for file generation !';
	var selectionMsgDDM					= ' Please, Select atleast 1 DDM for file generation !';
	var tableEl							=  document.getElementById('results');
	var dispatchIdString				= '';
	var deliveryRunSheetLedgerIdString	= '';
	var	lsDataArray						= [];
	var	ddmDataArray					= [];
	var dispatchLedgerId				= 0;
	var deliveryRunSheetLedgerId		= 0;
	var flag							= false;
	var moduleId                        = GENERATE_CONSOLIDATE_EWAYBILL_FROM_LS_REGI_REPORT;

	if(AllowConsolidateEwaybillNo == undefined)
	var	AllowConsolidateEwaybillNo	= false;
	
	if(allowConsolidateEwaybillNo != undefined && allowConsolidateEwaybillNo != false)
		AllowConsolidateEwaybillNo = 'true';
	
	for (i = 1; i < tableEl.rows.length -1; i++){
		
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null 
				&& tableEl.rows[i].cells[0].getElementsByTagName("input")[0].checked){

			flag	= true;
			
			if(AllowConsolidateEwaybillNo == 'true' && executiveBranchId != lsBranchId ){
				if(allowGenerateConsolidateEWaybillForAnyBranch != undefined && allowGenerateConsolidateEWaybillForAnyBranch != 'true' ){
					showMessage('info', "You can not Generate Other Branch's Consolidated EWaybill No. !");
					return false; 
				}
			}
			if(AllowConsolidateEwaybillNo == 'true' && tableEl.rows[i].cells[18].innerHTML != undefined 
					&& (tableEl.rows[i].cells[18].innerHTML).trim() != "--"){
				if(!confirm("Dispatch Number "+tableEl.rows[i].cells[2].children[0].innerHTML+" has already generated Consolidated EwaybillNo. :"+ (tableEl.rows[i].cells[18].innerHTML).trim() +". Do you want to continue ?")){
					return;
				}
			}
			//dispatchLedgerId = document.getElementById("check"+i).value;
			dispatchLedgerId   = tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
			lsDataArray.push(dispatchLedgerId)
			
		} 
		if(identifire == "DDM"){
			moduleId = GENERATE_CONSOLIDATE_EWAYBILL_FROM_DDM_REGI_REPORT;
			
			if(tableEl.rows[i].cells[1].getElementsByTagName("input")[0] != null 
					&& tableEl.rows[i].cells[1].getElementsByTagName("input")[0].checked){
				flag	= true;
				deliveryRunSheetLedgerId   				= tableEl.rows[i].cells[1].getElementsByTagName("input")[0].value;
				console.log("deliveryRunSheetLedgerId",deliveryRunSheetLedgerId);
				ddmDataArray.push(deliveryRunSheetLedgerId);
			}
		}
		jsonObject.dispatchIdString					= lsDataArray.join(',');
		jsonObject.deliveryRunSheetLedgerIdString	= ddmDataArray.join(',');
		jsonObject.moduleId							= moduleId;
	}
	
	if(!flag){
		if(identifire == "DDM"){
			showMessage('error', selectionMsgDDM);
		} else {
			showMessage('error', selectionMsgLs);
		}
		hideLayer();
		return false;
	}
	var url = WEB_SERVICE_URL + '/generateConsolidateEWayBillWS/generateConsolidateEWayBill.do';
	if(AllowConsolidateEwaybillNo != undefined && AllowConsolidateEwaybillNo == 'true'){
		showLayer();
		url = WEB_SERVICE_URL + '/generateConsolidateEWayBillWS/generateAutoConsolidateEWaybill.do';
	}
	
	$.ajax({
		type		: 	"POST",
		url			: 	url,
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(AllowConsolidateEwaybillNo != undefined && AllowConsolidateEwaybillNo == 'true'){
				setDataEWaybill(data);
			} else {
				if(data.message != undefined){
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					hideLayer();
				} else {
					generateJsonFile(data);
					hideLayer();
				}
			}
		}
	});
}

function generateJsonFile(response){
	if(response.tripSheets != undefined){
		var generateStateWiseFile = response.generateStateWiseFile;
		 
		if(!generateStateWiseFile){
			generateSingleJsonFile(response);
		} else {
			generateMultipleJsonFile(response);
		}
		
	}
}

function generateSingleJsonFile(response){
		var dataStr = JSON.stringify(response.tripSheets);
		var vehicleNumber = response.vehicleNumber;
		dataStr =   '{"version":"1.0.0618","tripSheets":' +dataStr+'}';
		var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
		var exportFileDefaultName = vehicleNumber+'IVCargo.json';
		
		var linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		
		document.body.appendChild(linkElement);
		linkElement.click();
 }

function generateMultipleJsonFile(response){
		var stateWiseTripSheets	 = response.tripSheets;
		var vehicleNumber 		 = response.vehicleNumber;
		var stateName			 = "";	
		var jsonObjectArray 	 = [];
		var jsonObjectdata 		 = null;
		
		for (var key in stateWiseTripSheets) {
			stateName   = key.split('_')[0];
			var data    = stateWiseTripSheets[key];
			var dataStr = JSON.stringify(data);
			dataStr 	= '{"version":"1.0.0618","tripSheets":' +dataStr+'}';
			var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
			var exportFileDefaultName = stateName+vehicleNumber+'IVCargo.json';
			
			jsonObjectdata 	 		= new Object();
			jsonObjectdata.value    = dataUri;
			jsonObjectdata.filename = exportFileDefaultName;
			
			jsonObjectArray.push(jsonObjectdata);
		}
		
		var temporaryDownloadLink = document.createElement("a");
	    temporaryDownloadLink.style.display = 'none';
	    document.body.appendChild( temporaryDownloadLink );
	    
	    for( var n = 0; n < jsonObjectArray.length; n++ ){
	        var download = jsonObjectArray[n];
	        temporaryDownloadLink.setAttribute( 'href', download.value);
	        temporaryDownloadLink.setAttribute( 'download', download.filename);

	        temporaryDownloadLink.click();
	    }
	    
	    document.body.removeChild( temporaryDownloadLink );
		
}


function selectAllLSOld(param) {

		var tab 	= document.getElementById("results");
		var count 	= parseFloat(tab.rows.length-1);
		var row;

		if(param == true) {
			for (i = 2; i < tab.rows.length ; i++){
				if(tab.rows[i].cells[0].getElementsByTagName("input")[0] != null && !tab.rows[i].cells[0].getElementsByTagName("input")[0].checked) {
					tab.rows[i].cells[0].getElementsByTagName("input")[0].checked = true;
				} 
			}
		} else if(param == false) {
			for (i = 2; i < tab.rows.length ; i++){
				if(tab.rows[i].cells[0].getElementsByTagName("input")[0] != null && tab.rows[i].cells[0].getElementsByTagName("input")[0].checked) {
					tab.rows[i].cells[0].getElementsByTagName("input")[0].checked = false;
				}
			}
		}
}

function genereateCEWBOld(AllowConsolidateEwaybillNo,allowGenerateConsolidateEWaybillForAnyBranch,executiveBranchId,lsBranchId) {
		var jsonObject	= {};
		var selectionMsg	= ' Please, Select atleast 1 LS for file generation !';
		var tableEl					=  document.getElementById('results');
		var dispatchIdString		= '';
		var	lsDataArray				= [];
		var dispatchLedgerId		= 0;
		var flag					= false;
		
		if(AllowConsolidateEwaybillNo == undefined)
			AllowConsolidateEwaybillNo	= false;

		for (i = 2; i < tableEl.rows.length ; i++){
			
			if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null 
					&& tableEl.rows[i].cells[0].getElementsByTagName("input")[0].checked){
				flag = true;
				if(AllowConsolidateEwaybillNo == 'true' && executiveBranchId != lsBranchId ){
					if(allowGenerateConsolidateEWaybillForAnyBranch != undefined && allowGenerateConsolidateEWaybillForAnyBranch != 'true' ){
						showMessage('info', "You can not Generate Other Branch's Consolidated EWaybill No. !");
						return false; 
					}
				}
				if(AllowConsolidateEwaybillNo == 'true' && tableEl.rows[i].cells[11].innerHTML != undefined 
						&& (tableEl.rows[i].cells[11].innerHTML).trim() != "--"){
					if(!confirm("Dispatch Number "+tableEl.rows[i].cells[2].children[0].innerHTML+" has already generated Consolidated EwaybillNo. :"+ (tableEl.rows[i].cells[11].innerHTML).trim() +". Do you want to continue ?")){
						return;
					}
				}
				//dispatchLedgerId = document.getElementById("check"+i).value;
				dispatchLedgerId   = tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
				lsDataArray.push(dispatchLedgerId)
			}
			jsonObject.dispatchIdString		= lsDataArray.join(',');
		}
		if(!flag){
			showMessage('error', selectionMsg);
			return false;
		}

		var url = WEB_SERVICE_URL + '/generateConsolidateEWayBillWS/generateConsolidateEWayBill.do';
		if(AllowConsolidateEwaybillNo != undefined && AllowConsolidateEwaybillNo == 'true'){
			showLayer();
			url = WEB_SERVICE_URL + '/generateConsolidateEWayBillWS/generateAutoConsolidateEWaybill.do';
		}
		
		$.ajax({
			type		: 	"POST",
			url			: 	url,
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(AllowConsolidateEwaybillNo != undefined && AllowConsolidateEwaybillNo == 'true'){
					setDataEWaybill(data);
				} else {
					
					if(data.message != undefined){
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					} else {
						generateJsonFile(data);
					}
				}
			}
		});
}

function setDataEWaybill(response){
	if(response.message != undefined){
		if(typeof response.message == 'string'){
			showMessage('error', response.message);
			hideLayer();
			return false;
		} else if(response.message.description == undefined){
			response.message	= response.message.htData.message;
		}
		showMessage('error', response.message.description);
		hideLayer();
		return false;
	}
	hideLayer();
	if(response.ConsolidateEWaybillGenerated == true){
		var consolidateEwaybill = response.consolidateEWayBillNumber; 
		showMessage('success', " Consolidated E-Waybill " + consolidateEwaybill + " successFully generated !!");
		setTimeout(function(){
			$("#find").trigger("click");
		},800)
	} else {
		var errorCode = 0;
		if(typeof response.exceptionString == 'string' && response.exceptionString.includes('errorCodes')){
			var messegeCode = JSON.parse(response.exceptionString); 
			errorCode = messegeCode.errorCodes.substring(0,(messegeCode.errorCodes.length -1));
		}
		console.log("errorCode>", errorCode)
		if(response.exceptionCode == 204){
			if(response.exceptionString.includes("An error has occurred.")){
				showMessage('error', "E-Waybill, Provided Is Wrong !");
			} else {
				showMessage('error', response.exceptionString);
			}
			return false;
		} else {
			showMessage('error', "Could not generate consolidated eway bill");
			return false;
		}

	}
}
