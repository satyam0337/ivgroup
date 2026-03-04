var shortCreditAllowOnTxnTypeHM = null;
function initializeDDMSettlement() {

	//Called from BranchAutoCompletor.js file
	initializeBranchAutoComplete();
}

//Called in DDMSearch.js
function loadDDMSearchedData(data) {
	jsonData	= data;
	
	if(searchedDDMNumber > -1 || searchedDDMNumber != "") { // do not reset page on first hit
		resetDDMSettlementPage();					
	} 
	
	switchHtmlTagClass('middle-border-boxshadow', 'show', 'hide');
	
	getDDMJSONData(jsonData);
	showReceiveButton();
}

function hideSettlementTables() {

	//if function is exist then call it .. if 1st time page user input wrong number..
	switchHtmlTagClass('DDMSettlementDetailsDiv', 'visibility-hidden', 'visibility-visible');
	changeDisplayProperty('DDMSettlementDetailsDiv', 'none');
	
	switchHtmlTagClass('settlementSummaryDiv', 'visibility-hidden', 'visibility-visible');
	changeDisplayProperty('settlementSummaryDiv', 'none');	
}

//settlement check box show / not show
function showReceiveButton() {
	let receiveBtn = document.getElementById('receiveBtn');
	
	if(receiveBtn != null) {
		receiveBtn.className 		= 'button button-primary button-3d button-rounded button-tiny button-icon-txt-small';
		receiveBtn.style.display 	= 'block'; 
		receiveBtn.disabled			= false;
	}
}

function hideReceiveButton() {
	let receiveBtn = document.getElementById('receiveBtn');
	
	if(receiveBtn != null) {
		receiveBtn.className 		= 'btn_print_disabled';
		receiveBtn.style.display 	= 'none'; 
		receiveBtn.disabled			= true;
	}
}

function resetDDMSettlementPage() {
	if(!isMultipleDDM && typeof hideSettlementTables == 'function')
		hideSettlementTables();

	if(typeof resetDDMSettlementDetailsTbl == 'function') {
		//Called from DDMSettlementDetails.js file
		resetDDMSettlementDetailsTbl();
	}
	
	if(typeof resetSettlementSummaryTbl == 'function') {
		//Called from SettlementSummaryDetails.js file
		resetSettlementSummaryTbl();
	}
	
	if(typeof resetsettlementLRTbl == 'function') {
		//Called from SettlementLRTableDetails.js file
		resetsettlementLRTbl();
	}
	
	if(typeof hideSettlementButton == 'function' && !isMultipleDDM) {
		switchHtmlTagClass('showHideDDMDetailsButtonDiv', 'visibility-hidden', 'visibility-visible');
		hideReceiveButton();
	}
}

//get Data From json object after got JSON response
function getDDMJSONData(data) {
	var discountTypes 				= null;
	var ddmSettlementSummaryModel	= null;
	var waybillModels				= null;
	var deliveryRunSheetLedger		= null;
	var activeDeliveryCharges		= null;
	var paymentTypePermissions		= null;
	var wbIdWiseDeliveryCharges		= null;
	var panNumberHM					= null;
	var wayBillDetails				= null;
	let tdsConfiguration			= data.tdsConfiguration;
	ddmSettlementConfig				= data.ddmSettlementConfig;
	podConfiguration				= data.podConfiguration;
	podDocumentTypeArr				= data.podDocumentTypeArr;
	moduleId						= data.moduleId;
	ModuleIdentifierConstant		= data.ModuleIdentifierConstant;
	PaymentTypeConstant				= data.PaymentTypeConstant;
	incomeExpenseModuleId			= data.incomeExpenseModuleId;
	jsondata						= data;
	discountInPercent				= data.discountInPercent;
	shortCreditConfigLimit			= data.shortCreditConfigLimit;
	executive						= data.executive;
	differentPaymentInMultiplePayment = ddmSettlementConfig.differentPaymentInMultiplePayment;
	subRegionId						  = data.subRegionId;
	validateShortCreditAllowOnTxnTypeWithSubRegion = data.validateShortCreditAllowOnTxnTypeWithSubRegion;
	subRegionIdsForShortCredit      = data.subRegionIdsForShortCredit;
	
	GeneralConfiguration			= data.GeneralConfiguration;
	wayBillDetails					= data.wayBillDetails;
	
	if(data.discountTypes)
		discountTypes	= data.discountTypes;

	if(data.ddmSettlementSummaryModel)
		ddmSettlementSummaryModel	= data.ddmSettlementSummaryModel;

	if(data.wayBillModels) {
		waybillModels		= data.wayBillModels;
		waybillModelsGlobal	= data.wayBillModels;
	}

	if(data.panNumberHM)
		panNumberHM  = data.panNumberHM;
		
   if(data.shortCreditAllowOnTxnTypeHM)
		shortCreditAllowOnTxnTypeHM  = data.shortCreditAllowOnTxnTypeHM;

	if(data.activeDeliveryCharges) {
		activeDeliveryCharges		= data.activeDeliveryCharges;
		activeDeliveryChargesGlobal	= data.activeDeliveryCharges;
	}

	if(!isMultipleDDM && data.deliveryRunSheetLedger)
		deliveryRunSheetLedger		= data.deliveryRunSheetLedger;
	
	if(data.paymentTypePermissions)
		paymentTypePermissions		= data.paymentTypePermissions;
	
	if(data.backDate)
		backDate		= data.backDate;
	
	if(data.wbIdWiseDeliveryCharges)
		wbIdWiseDeliveryCharges	= data.wbIdWiseDeliveryCharges;
	
	deliverychargForExessAmt 		= ddmSettlementConfig.deliverychargForExessAmt;
	
	if(data.deliveryChargeIds) 
		deliveryChargeIds			= data.deliveryChargeIds;
	
	if(data.chargeIdArray)
		chargeIdArray				= data.chargeIdArray;
	
	if(data.godownExist)
		godownExist			= data.godownExist;
	
	if(data.taxes)
		taxes			= data.taxes;
	
	if(data.taxDtlsColl)
		taxDtlsColl		= data.taxDtlsColl;
	
	if(data.lrColl)
		lrColl			= data.lrColl;
	
	if(tdsConfiguration.IsTdsAllow) {
		isTDSAllow								= tdsConfiguration.IsTdsAllow;
		isTDSAllowInPercent						= tdsConfiguration.IsTDSInPercentAllow;
		let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
		
		if(tdsChargeInPercent != undefined && tdsChargeInPercent.includes(","))
			LMTDeliveryTimeTDSRate				= tdsChargeInPercent.split(",")[0];
		else
			LMTDeliveryTimeTDSRate				= tdsChargeInPercent;
		
		isPanNumberRequired						= tdsConfiguration.IsPANNumberRequired;
		isPanNumberMandetory					= tdsConfiguration.IsPANNumberMandetory;
		deliveryTimeChargeIdsForTDSCalculation	= data.DeliveryTimeChargeIdsForTDSCalculation;
	}
	
	if(typeof data.octroiServiceCharge != 'undefined')
		octroiServiceCharge		= data.octroiServiceCharge;
	
	if(!isMultipleDDM) {
		$("#ddmSettlementDetails").load( "/ivcargo/html/ddmSettlement/DDMSettlementDetails.html", function() {
			//Called from DDMSettlementDetails.js
			displayDDMDetails(deliveryRunSheetLedger);
			switchHtmlTagClass('DDMSettlementDetailsDiv', 'visibility-visible', 'visibility-hidden');
			switchHtmlTagClass('showHideDDMDetailsButtonDiv', 'visibility-visible', 'visibility-hidden');
		});
	}
	
	$("#summaryTable").load( "/ivcargo/html/ddmSettlement/SettlementSummaryDetails.html", function() {
		//Called from SettlementSummaryDetails.js
		displaySettlementSummaryDetails(ddmSettlementSummaryModel);
		$("#showHideToPaySummary").css("display", "inline-block");
		switchHtmlTagClass('settlementSummaryDiv', 'visibility-visible', 'visibility-hidden');
	});
	
	$("#lrDetailsTable").load( "/ivcargo/html/ddmSettlement/SettlementLRTableDetails.html", function() {
		//Called from SettlementLRTableDetails.js
		displayLRDetailsTable(waybillModels, activeDeliveryCharges, paymentTypePermissions, discountTypes, wbIdWiseDeliveryCharges, panNumberHM, lrColl,wayBillDetails);
	});
	
	if (ddmSettlementConfig.BankPaymentOperationRequired) {
		$("#bankPaymentOperationPanel").load( "/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
			setIssueBankAutocomplete();
			setAccountNoAutocomplete();
		});
		$("#viewAddedPaymentDetailsCreate").css("display", "block");
	}
}