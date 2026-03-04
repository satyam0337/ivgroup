function validateDDMNumber () {
	
	if(document.getElementById("ddmNumber")) {
		if(!validateInput(1, "ddmNumber", "ddmNumber", 1,  ddmNumberErrMsg))
			return false;
	}
	
	return true;
}

function validateDDMBranch () {

	if(document.getElementById("Branch")) {
		if(!validateInput(1, "Branch", "Branch", 1,  branchNameErrMsg))
			return false;
	}

	if(document.getElementById("branchId")) {
		if(!validateInput(1, "branchId", "branch", 1,  branchNameErrMsg))
			return false;
	}
	
	return true;
}

// Get DDM Data By DDM Number & Branch
function getDDMGetaForSettlement() {
	
	if(!validateDDMNumber()) {return false;}
	
	if(removeBranchNameForNormalExecutive && (!isNormalUser)){
		if(!validateDDMBranch()) {return false;}
	}

	if(isDuplicateSearch(getValueFromInputField('ddmNumber'))){
		showMessage('warning', ddmAlreadySearchedWarningMsg(getValueFromInputField('ddmNumber')));
		return false;
	}
	
	showLayer();
	
	var jsonObjectdata = null;
	jsonObjectdata = getJSONParam();
	
	var jsonStr = JSON.stringify(jsonObjectdata);
	
	$.getJSON("DDMSettlementGetDataAction.do?pageId=305&eventId=2",
			{json:jsonStr}, function(data) {

			//console.log(data);

				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.errorDescription == 'No records found, please try again.') {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
					switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
					switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
					//called From GenericDDMSettlement.js
					resetDDMSettlementPage();
					isMultipleDDM					= false;
					hideLayer();
				} else {
					
					var endKilometer				= data.endKilometer;
					 tripHisabProperties			= data.tripHisabProperties;
					var deliveryRunSheetLedger		= data.deliveryRunSheetLedger;
					ddmSettlementAllow				= data.ddmSettlementAllow;
					isMultipleDDM					= false;
					var allowBackTimeForSettlement  = data.allowBackTimeForSettlement
					var ddmSettlementConfig 		= data.ddmSettlementConfig;
					var openingKm					= 0;
					
					if(deliveryRunSheetLedger != undefined && typeof deliveryRunSheetLedger != 'undefined') {
						ddmCreationDate				= deliveryRunSheetLedger[0].creationDateForUser;
						openingKm					= deliveryRunSheetLedger[0].openingKM;
						closingKm					= deliveryRunSheetLedger[0].closingKm;
						$('#openingKilometerEle').val(openingKm);
						
						if(ddmSettlementConfig != undefined && typeof ddmSettlementConfig != 'undefined' && ddmSettlementConfig.showClosingKMField) {
							$('#endKilometer').removeClass('hide');
							
							if (closingKm > 0) {
								setTimeout(() => {
									$('#endKilometerEle').val(closingKm);
									$("#endKilometerEle").prop( "disabled", true );
								}, 500);
							} else {
								setTimeout(() => {
									$("#endKilometerEle").prop( "disabled", false );
								}, 500);
								
								$('#endKilometerEle').val("");
							}
						} else {
							$('#endKilometer').addClass('hide');
						}
					}
					
					if(typeof tripHisabProperties != 'undefined' && tripHisabProperties.tripHisabDDMRequired) {
						if(tripHisabProperties.endKilometerRequired) {
							$('#endKilometer').removeClass('hide');
							
							if(endKilometer > 0) {
								setTimeout(() => {
									$('#endKilometerEle').val(endKilometer);
									$("#endKilometerEle").prop( "disabled", true );
								}, 500);
							} else {
								setTimeout(() => {
									$("#endKilometerEle").prop( "disabled", false );
								}, 500);
							}
						} else {
							$('#endKilometer').addClass('hide');
						}
					}
					
					if(allowBackTimeForSettlement)
						$('#backTimeForAllDiv').removeClass('hide');
					else
						$('#backTimeForAllDiv').addClass('hide');
					
					//called From GenericDDMSettlement.js
					if(typeof deliveryRunSheetLedger != 'undefined' && deliveryRunSheetLedger.length == 1) {
						if(data.isAllLRSettled == true) {
							showMessage('info', iconForInfoMsg + ' ' + 'This DDM is Already Settled!');	
							$('#settledMessege').html('<b>This DDM is Already Settled !</b>');
							$('#settledStatus').removeClass('hide');
							$('#makeSettlementBtn').addClass('hide');
							$('#paymentTypeDiv').addClass('hide');
						} else {
							$('#settledMessege').html('');
							$('#settledStatus').addClass('hide');
							$('#makeSettlementBtn').removeClass('hide');
							$('#paymentTypeDiv').removeClass('hide');
						}
						
						loadDDMSearchedData(data);
						switchHtmlTagClass('bottom-border-boxshadow', 'show', 'hide');
					} else {
						$("#ddmSettlementDetails").load( "/ivcargo/html/ddmSettlement/DDMSettlementDetails.html", function() {
							isMultipleDDM		= true;
							
							displayDDMDetails(deliveryRunSheetLedger); //Called from DDMSettlementDetails.js
							switchHtmlTagClass('showHideDDMDetailsButtonDiv', 'visibility-visible', 'visibility-hidden');
							$('#showHideToPaySummary').hide();
							$("#DDMSettlementDetailsDiv").css("display", "block");
							$("#settleColumn").css("display", "block");
							switchHtmlTagClass('middle-border-boxshadow', 'show', 'hide');
							switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
						});
					}
				}
				hideLayer();
			});
}

function getDeliveryRunSheetSummary(deliveryRunSheetLedgerId) {
	showLayer();
	var jsonObjectdata 	= null;
	
	jsonObjectdata = getJSONParam();
	jsonObjectdata.deliveryRunSheetLedgerId	= deliveryRunSheetLedgerId;
	
	var jsonStr = JSON.stringify(jsonObjectdata);

	$.getJSON("DDMSettlement.do?pageId=305&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.errorDescription == 'No records found, please try again.') {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
					switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
					switchHtmlTagClass('bottom-border-boxshadow', 'hide', 'show');
					//called From GenericDDMSettlement.js
					resetDDMSettlementPage();
					hideLayer();
				} else {
					switchHtmlTagClass('bottom-border-boxshadow', 'show', 'hide');
					switchHtmlTagClass('makeSettlementBtn', 'show', 'hide');

					if(data.isAllLRSettled == true) {
						$("#showHideToPaySummary").css("display", "inline-block");
						showMessage('info', iconForInfoMsg + ' ' + 'This DDM is Already Settled!');	
						$('#settledMessege').html('<b>This DDM is Already Settled !</b>');
						$('#settledStatus').removeClass('hide');
						$('#makeSettlementBtn').addClass('hide');
					} else {
						$('#settledMessege').html('');
						$('#settledStatus').addClass('hide');
						$('#makeSettlementBtn').removeClass('hide');
					}
					
					ddmSettlementAllow				= data.ddmSettlementAllow;
					//called From GenericDDMSettlement.js
					loadDDMSearchedData(data);
				}
				hideLayer();
			});
}

// set JSON Parameter for JSON Hit
function getJSONParam() {
	
	jsonObjectdata 				= new Object();
	jsonObjectdata.ddmNumber 	= getValueFromInputField('ddmNumber'); 
	jsonObjectdata.branchId	 	= getValueFromInputField('branchId'); 
	jsonObjectdata.ddmBranchId 	= getValueFromInputField('branchId'); 
	
	return jsonObjectdata;
}

function isDuplicateSearch (searchingNumber) {
	
	if(searchingNumber == searchedDDMNumber) {
		return true; 
	} else {
		return false; 
	}
}