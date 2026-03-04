var _thisPopulate;
var executiveBranchId					= 0;
var allowAutoGenerateEWaybill 			= false;
var allowAutoGenerateEWaybillBranchWise = false;
var branchIdsToAutoGenerateConEWaybill 	= "";
var branchIdsToAutoGenConEWaybillArr;
var moduleIdForAutoConsolidateEWaybill 	= GENERATE_CONSOLIDATE_EWAYBILL_FROM_LS_REGI_REPORT;
var allowGenerateConsolidateEWaybillForAnyBranch	= false;
define(['JsonUtility', 
		'slickGridWrapper3'],
	function(JsonUtility, slickGridWrapper3) {
	return {
		generateConsolidatedEwaybill : function(response) {
			_thisPopulate = this;

			var selectionMsg					= ' Please, Select atleast 1 DDM/LS for file generation !';
			var selectedLSDetails 				= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
			
			if(typeof selectedLSDetails == 'undefined')
				return;
			
			if(response.GenerateEWaybillConfig != undefined) {
				allowAutoGenerateEWaybill						= response.GenerateEWaybillConfig.allowAutoGenerateEWaybill;
				allowAutoGenerateEWaybillBranchWise				= response.GenerateEWaybillConfig.allowAutoGenerateEWaybillBranchWise;
				branchIdsToAutoGenerateConEWaybill				= response.GenerateEWaybillConfig.branchIdsToAutoGenerateConEWaybill;
				executiveBranchId								= response.executive.branchId;
				allowGenerateConsolidateEWaybillForAnyBranch	= response.allowGenerateConsolidateEWaybillForAnyBranch;
				
				if(selectedLSDetails != undefined && selectedLSDetails.length > 0 && (allowAutoGenerateEWaybill 
						|| (allowAutoGenerateEWaybillBranchWise != undefined && jQuery.inArray(executiveBranchId+"", branchIdsToAutoGenConEWaybillArr) != -1))){
					for(var i = 0; i < selectedLSDetails.length; i++){
						if(selectedLSDetails[i].lsBranchId != executiveBranchId && !allowGenerateConsolidateEWaybillForAnyBranch) {
							showMessage("info", "You can not Generate Other Branch's Consolidated EWaybill No. !");
							return false;
						}

						if(selectedLSDetails[i].consolidateEwaybillNo != undefined && selectedLSDetails[i].consolidateEwaybillNo != '--'){
							if(!confirm("LS Number "+selectedLSDetails[i].lsNumber+" has already generated Consolidated EwaybillNo. :"+selectedLSDetails[i].consolidateEwaybillNo +". Do you want to continue ?"))
								return;
						}
					}
				}
				
				if(branchIdsToAutoGenerateConEWaybill != undefined)
					branchIdsToAutoGenConEWaybillArr	= branchIdsToAutoGenerateConEWaybill.split(",");
			}

			var dispatchLedgerIds	= [];
			var deliveryRunSheetLedgerIds	= [];
			var isValidateSameVehicle	= false;
			
			if(response.isValidateSameVehicle != undefined && typeof response.isValidateSameVehicle !== 'undefined')
				isValidateSameVehicle	= response.isValidateSameVehicle;
			
			var selectedLSDetailsLength	= selectedLSDetails.length;
			
			if(selectedLSDetailsLength > 0) {
				for(var i = 0; i < selectedLSDetailsLength; i++) {
					if(isValidateSameVehicle && selectedLSDetails[0].vehicleNumber != selectedLSDetails[i].vehicleNumber) {
						showMessage("info", "You can not Generate Consolidated EWaybill for Different Vehicle Number !");
						return;
					}
					
					if(selectedLSDetails[i].dispatchLedgerId != undefined)
						dispatchLedgerIds.push(selectedLSDetails[i].dispatchLedgerId);
					else if (selectedLSDetails[i].deliveryRunSheetLedgerId != undefined)
						deliveryRunSheetLedgerIds.push(selectedLSDetails[i].deliveryRunSheetLedgerId);
				}
				
				_thisPopulate.genereateCEWBNew(dispatchLedgerIds.join(','),deliveryRunSheetLedgerIds.join(','));
			}
		}, genereateCEWBNew : function(dispatchLedgerIds, deliveryRunSheetLedgerIds) {
			var jsonObject = new Object();
			jsonObject.dispatchIdString 				= dispatchLedgerIds;
			jsonObject.deliveryRunSheetLedgerIdString 	= deliveryRunSheetLedgerIds;
			jsonObject.moduleId 						= moduleIdForAutoConsolidateEWaybill;
			
			if(allowAutoGenerateEWaybill || (allowAutoGenerateEWaybillBranchWise != undefined && jQuery.inArray(executiveBranchId+"", branchIdsToAutoGenConEWaybillArr) != -1))
				getJSON(jsonObject, WEB_SERVICE_URL + '/generateConsolidateEWayBillWS/generateAutoConsolidateEWaybill.do', _thisPopulate.setDataEWaybill, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/generateConsolidateEWayBillWS/generateConsolidateEWayBill.do', _thisPopulate.generateJsonFile, EXECUTE_WITH_ERROR);
			
			showLayer();
		}, generateJsonFile : function(response) {
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.type, errorMessage.description);
			} else if(response.tripSheets != undefined){
				var generateStateWiseFile = response.generateStateWiseFile;
					 
				if(!generateStateWiseFile)
					generateSingleJsonFile(response);
				else
					generateMultipleJsonFile(response);
			}
			
			hideLayer();
		}, setDataEWaybill : function(response){
			if(response.message != undefined){
				if(typeof response.message == 'string'){
					showMessage('error', response.message);
					hideLayer();
					return false;
				} else if(response.message.description == undefined)
					response.message	= response.message.htData.message;

				showMessage('error', response.message.description);
				hideLayer();
				return false;
			}

			hideLayer();

			if(response.ConsolidateEWaybillGenerated == true){
				var consolidateEwaybill = response.consolidateEWayBillNumber; 
				showMessage('success', " Consolidated E-Waybill " + consolidateEwaybill + " successFully generated !!");
				$("#saveBtn").trigger("click");
			} else {
				if(typeof response.exceptionString == 'string' && response.exceptionString.includes('errorCodes')){
					var messegeCode = JSON.parse(response.exceptionString); 
					errorCode = messegeCode.errorCodes.substring(0,(messegeCode.errorCodes.length -1));
				}

				if(response.exceptionCode == 204) {
					if(response.exceptionString.includes("An error has occurred."))
						showMessage('error', "E-Waybill, Provided Is Wrong !");
					else
						showMessage('error', response.exceptionString);

					return false;
				} else {
					showMessage('error', "Could not generate consolidated eway bill");
					return false;
				}
			}
		}
	}
})

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