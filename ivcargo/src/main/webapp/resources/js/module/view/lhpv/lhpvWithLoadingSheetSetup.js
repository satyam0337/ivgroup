let LHPVConstant, lhpvConfiguration;
define(['selectizewrapper'
	    ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/lhpv/lhpvfilepath.js'//FilePath
	    ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/lhpv/splitlhpv.js?v=1.0'
		,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/lhpv/addMultipleRemarksInLHPV.js'
	  ]
,function(Selectizewrapper, FilePath, SplitLhpv, BootStrapModal, MultipleRemark) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	data,
	generalConfiguration,
	localData,
	dispatchLedgerIds	= new Array(),
	dispatchLedger		= new Array(),
	charges 			= new Object(),
	subCharges 			= new Array(),
	addCharges 			= new Array(),
	lhpvTypeSelection,
	manualLHPVNod,
	lhpvNodCheck,
	lhpvOperationSelection,
	tdsChargesList,
	calculatedBalanceAmount = 0,
	isOwnTruck			= false,
	allowedSpecialCharacters,
	lhpvofddm,
	allowLhpvWithZeroLorryHireAmt = false,
	lsNumberToCheck,
	manualLHPVDatePermission = false,
	vehcileNumberArr	= [],
	tdsConfiguration	= null,
	isCheckboxOptionToAllowTDS	= false, doneTheStuff = false,
	totalColunmInLsDeatils,
	totalRowInLsDetails,
	setVehiclePanNumber,
	vehicleNumberMaster,
	executive,
	languageKeyset,
	showSplitBranchWiseLhpv = false,
	dieselWiseSplitAmtList = new Array(),
	regionIdsArr = new Array(),
	showSplitDieselWiseLhpv = false, showLiterAmout = false, showPerLiterRateAmount = false, showMultipleAddInDieselDetails = false,
	isLhpvAfterLS = false, dddv = false, driverMasterId = 0, isSingleLs = false, divisionID = 0,
	TOKEN_KEY = null, TOKEN_VALUE = null, validateLhpvToken,
	chargemasterIds, ratePMTTypeList = null, showUploadedTdsMessage = false,
	rateUnitTypeList = null, totalWeight = 0, totalBasicFreight = 0, showTotalFreight = false, finalRemarkArr = new Array(), tdsOnAmount = 0;
	
	return {
		searchLS : function(vehicleId, lhpvNumber, lsNumber, response,lhpvType, lhpvOperation,searchOperation, divisionId) {
			showLayer();
			_this							= this;
			data							= response;
			lhpvConfiguration				= response;
			LHPVConstant					= response.LHPVConstant;
			tdsChargesList					= response.tdsChargesList;
			ratePMTTypeList					= response.ratePMTTypeList;
			rateUnitTypeList				= response.rateUnitTypeList;
			allowLhpvWithZeroLorryHireAmt	= lhpvConfiguration.allowLhpvWithZeroLorryHireAmt;
			lhpvTypeSelection				= lhpvType;
			lhpvOperationSelection			= lhpvOperation;
			allowedSpecialCharacters		= lhpvConfiguration.AllowedSpecialCharacters;
			lhpvofddm						= lhpvConfiguration.LHPVOfDDM;
			generalConfiguration			= response.generalConfiguration;
			lsNumberToCheck					= lsNumber;
			manualLHPVDatePermission		= response.manualLHPVDatePermission;
			tdsConfiguration				= response.tdsConfiguration;
			isCheckboxOptionToAllowTDS		= tdsConfiguration.IsCheckboxOptionToAllowTDS;
			totalColunmInLsDeatils			= lhpvConfiguration.totalColunmInLsDeatils;
			totalRowInLsDetails				= lhpvConfiguration.totalRowInLsDetails;
			setVehiclePanNumber				= lhpvConfiguration.setVehiclePanNumber;
			showSplitBranchWiseLhpv 		= lhpvConfiguration.showSplitBranchWiseLhpv;
			showSplitDieselWiseLhpv 		= lhpvConfiguration.showSplitDieselWiseLhpv;
			showLiterAmout 					= lhpvConfiguration.showLiterAmout;
			showPerLiterRateAmount 			= lhpvConfiguration.showPerLiterRateAmount;
			showMultipleAddInDieselDetails 	= lhpvConfiguration.showMultipleAddInDieselDetails;
			chargemasterIds					= data.chargemasterIds;
			isLhpvAfterLS					= response.isLhpvAfterLS;
			isSingleLs						= response.isSingleLs;
			TOKEN_KEY						= response.TOKEN_KEY;
			TOKEN_VALUE						= response.TOKEN_VALUE;
			validateLhpvToken				= lhpvConfiguration.tokenWiseCheckingForDuplicateTransaction;
			showUploadedTdsMessage			= lhpvConfiguration.showUploadedTdsMessage;
			totalWeight = 0;
			showTotalFreight				= lhpvConfiguration.validateLorryHireWithBasicFreight;

			let keyObject = Object.keys(lhpvConfiguration);
			
			for (const element of keyObject) {
				if (!lhpvConfiguration[element]) {
					$("*[data-attribute=" + element + "]").addClass("hide");
					$("*[data-attribute=" + element + "]").remove();
				}
			}

			let jsonObject	= new Object();
			
			jsonObject.divisionId = divisionId;

			if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDDV && lhpvOperation == LHPVConstant.CREATE_ID) { //INTERBRANCH AND CREATE
				jsonObject.vehicleNumberMasterId	= vehicleId;
				jsonObject.filter					= 1;
			}
			
			if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_BOTH && lhpvOperation == LHPVConstant.CREATE_ID) { //DDDV AND CREATE
				jsonObject.vehicleNumberMasterId	= vehicleId;
				jsonObject.filter					= 2;
			}
			
			if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDDV && lhpvOperation == LHPVConstant.APPEND_ID) { //INTERBRANCH AND APPEND
				jsonObject.lhpvNumber	= lhpvNumber.trim();
				jsonObject.filter		= 3;
			}
			
			if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_BOTH && lhpvOperation == LHPVConstant.APPEND_ID) { //DDDV AND APPEND
				jsonObject.lhpvNumber	= lhpvNumber.trim();
				jsonObject.filter		= 4;
			}
			
			if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_NORMAL && lhpvOperation == LHPVConstant.CREATE_ID && searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) { //Search BY vehicleId
				jsonObject.vehicleNumberMasterId	= vehicleId;
				jsonObject.filter		= 5;
			}
			if (lsNumber > 0 && lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_NORMAL && lhpvOperation == LHPVConstant.CREATE_ID && searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER) { //Search BY LS NUMBER
				jsonObject.lsNumber	= lsNumber.trim();
				jsonObject.filter		= 6;
			} else if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_NORMAL && lhpvOperation == LHPVConstant.CREATE_ID) { //NORMAL AND CREATE
				jsonObject.vehicleNumberMasterId	= vehicleId;
				jsonObject.filter					= 7;
			} else if (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_NORMAL && lhpvOperation == LHPVConstant.APPEND_ID) { //NORMAL AND APPEND
				jsonObject.lhpvNumber	= lhpvNumber.trim();
				jsonObject.filter		= 8;
			}
			
			if(lhpvofddm && (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDM && lhpvOperation == LHPVConstant.CREATE_ID)){
				jsonObject.vehicleNumberMasterId	= vehicleId;
				jsonObject.filter					= 9;
			}
			
			if(lhpvofddm && (lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDM && lhpvOperation == LHPVConstant.APPEND_ID)){
				jsonObject.lhpvNumber	= lhpvNumber.trim();
				jsonObject.filter					= 10;
			}
			
			if(showUploadedTdsMessage) {
				let jsonObj		= new Object();
				jsonObj.id			= vehicleId;
				jsonObj.moduleId	= VEHICLE_NUMBER_MASTER;
				
				$.ajax({
					type		: 	"POST",
					url			: 	WEB_SERVICE_URL + '/uploadPdfDetailsWS/getDownloadPdfDataDetails.do',
					data		:	jsonObj,
					dataType	: 	'json',
					success		: 	function(data) {
						if(data.message == undefined) {
							showMessage('info', 'TDS documents are uploaded');
							
							if (tdsConfiguration.declarationGiven && lhpvConfiguration.disableDeclarationGivenOnUploadedTdsDocument) {
								$("#declarationGiven")[0].selectize.setValue('1');
								$("#declarationGiven")[0].selectize.disable();
							}
						} else if (tdsConfiguration.declarationGiven && lhpvConfiguration.disableDeclarationGivenOnUploadedTdsDocument) {
							$("#declarationGiven")[0].selectize.setValue('2');
							$("#declarationGiven")[0].selectize.disable();
						}
					}
				});
			}	

			getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/getLoadingSheetsForLHPV.do?', _this.renderLoadingSheetData, EXECUTE_WITH_ERROR);
		}, renderLoadingSheetData : function(response) {
			hideLayer();
			if (response.message != undefined) {
				$('#loadingSheetTable tbody').empty();
				$('#lhpvChargesDiv').empty();
				$("#createInterBranchLHPVElements").css("display", "none");
				return;
			}
			
			$( "#saveBtn").unbind( "click" );
			
			if(lsNumberToCheck > 0) {
				$('#lsNumberEle').val('');
				
				if(isSingleLs == undefined || !isSingleLs)
					$('#lsNumberEle').focus();
				
				$('#lhpvChargesDiv').empty();
			}
			
			localData					= response;
			
			dispatchLedger				= response.dispatchLedger;
			
			dispatchLedgerIds			= response.dispatchLedgerId;
			moduleId					= response.moduleId;
			ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
			incomeExpenseModuleId		= response.incomeExpenseModuleId;
			vehicleNumberMaster			= response.vehicleNumberMaster;
			executive					= response.executive;
			regionIdsArr 				= (lhpvConfiguration.regionIdsForSourceBranchWork).split(",");
			dddv						= dispatchLedger[0].dddv;
			driverMasterId				= dispatchLedger[0].driverId;
			divisionID					= dispatchLedger[0].divisionId;
		
			totalBasicFreight 			= 0;

			//load language is used to get the value of labels 
			let langObj 	= FilePath.loadLanguage();
			languageKeyset 	= loadLanguageWithParams(langObj);
			
			if(lsNumberToCheck > 0) {
				if(!_this.checkSameLsNumber(lsNumberToCheck, dispatchLedger[0].dispatchLedgerId)) {return false;}
				if(!_this.checkSameVehicleNumber(lsNumberToCheck, dispatchLedger[0].vehicleNumberMasterId)) {return false;}
			
				vehcileNumberArr.push({vehicleNumberId : dispatchLedger[0].vehicleNumberMasterId, vehicleNumber : dispatchLedger[0].vehicleNumber});
			} else {
				$('#loadingSheetTable tbody').empty();
				$('#lhpvChargesDiv').empty();
			}
			
			if(!lhpvConfiguration.PaymentType) $('#paymentMode').remove();
			if(!lhpvConfiguration.AdditionalRemark) 
				$('#additionalRemark').remove();
			else {
				$('#additionalRemarkEle').attr("placeholder", lhpvConfiguration.additionalRemarkFeildLebel);
				$("[data-selector='additionalRemark']").text(lhpvConfiguration.additionalRemarkFeildLebel);
			}

			if(lhpvConfiguration.displayWeighBridgeInputField) {
				$("*[data-attribute=weighBridge]").removeClass("hide");
				
				$('#weighBridgeEle').attr('data-tooltip', lhpvConfiguration.weighBridgeWeightLabelName);
				$("*[data-selector=weighBridge]").html(lhpvConfiguration.weighBridgeWeightLabelName);
				$('#weighBridgeEle').attr("placeholder", lhpvConfiguration.weighBridgeWeightLabelName);
			} else
				$("*[data-attribute=weighBridge]").remove();
			
			if(!generalConfiguration.BankPaymentOperationRequired && !lhpvConfiguration.PaymentType)
				$('#viewAddedPaymentDetailsCreate').remove();
			else if(!lhpvConfiguration.PaymentType)
				$('#viewAddedPaymentDetailsCreate').remove();
			else
				$('#viewAddedPaymentDetailsCreate').show();
			
			if(lhpvConfiguration.PaymentStatus) {
				$("#paymentStatusEle").css("display", "block");
				$("#amountEle").removeClass('hide');
			} else
				$('#paymentStatusEle').remove();
			
			if(lhpvConfiguration.removeSelectAllCheckBox)
				$('#checkAll').remove();
			
			if(tdsConfiguration.IsTdsAllow) {
				if(tdsConfiguration.declarationGiven)
					$("#declarationGivenDiv").css("display", "block");
				else
					$("#declarationGivenDiv").remove();
				
				if(!tdsConfiguration.IsPANNumberRequired)
					$("#panNumber").remove();
				
				if(!tdsConfiguration.IsTANNumberRequired)
					$("#tanNumber").remove();
				
				if(tdsConfiguration.individualFirm)
					$("#individualFirmDiv").css("display", "block");
				else
					$("#individualFirmDiv").remove();
				
				if(tdsConfiguration.IsTDSInPercentAllow)
					$("#tdsRate").css("display", "block");
				else
					$("#tdsRate").remove();
			} else {
				$("#declarationGivenDiv").remove();
				$("#tdsRate").remove();
				$("#individualFirmDiv").remove();
				$("#panNumber").remove();
				$("#tanNumber").remove();
			}
			
			if(lhpvConfiguration.showLorryHireModeSelection) {
				$("#openingKM").css("display", "block");
				
				$('#lorryHireModeEle').change(function() {
					if(Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE){
						$("#div_charge" + RATE_PER_KM).css("display", "block");
						$("#charge" + LORRY_HIRE).attr('readonly', true);
					} else {
						$("#div_charge" + RATE_PER_KM).css("display", "none");
						$("#charge" + LORRY_HIRE).attr('readonly', false);
					}
				});
				
				setTimeout(() => {
					$("#charge" + LORRY_HIRE).attr('readonly', Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE);
				}, 200);
			} else
				$("#openingKM").css("display", "none");
				
			if(lhpvConfiguration.showSourceBranchesSelection) {
				$('#sourceBranch').removeClass('hide');
				$('#sourceBranchEle').val(executive.branchId);
			}
			
			if(lhpvConfiguration.showOpeningKMSelection) 	
				$("#openingKM").css("display", "block");
			
			if(lhpvConfiguration.showClosingKMInputField) 	
				$("#closingKM").css("display", "block");
			else
				$("#closingKM").remove();
			
			if(lhpvConfiguration.allowMultipleRemarks && isValueExistInArray((lhpvConfiguration.subRegionIdsForMultipleRemarks).split(','), executive.subRegionId)) {
				$('#addMultipleRemarks').show();
				$('#viewMultipleRemarks').show();
				MultipleRemark.bindElements();
			}

			if(lhpvConfiguration.PaymentType && !jQuery.isEmptyObject(response.paymentTypeArr)) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.paymentTypeArr,
					valueField		:	'paymentTypeId',
					labelField		:	'paymentTypeName',
					searchField		:	'paymentTypeName',
					elementId		:	'paymentType',
					onChange		:	_this.onPaymentTypeSelect
				});
			}
			
			if(lhpvConfiguration.PaymentStatus && !jQuery.isEmptyObject(response.paymentStatusArr)) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.paymentStatusArr,
					valueField		:	'paymentStatusId',
					labelField		:	'paymentStatusName',
					searchField		:	'paymentStatusName',
					elementId		:	'paymentStatus',
					onChange		:	_this.onPaymentStatusSelect
				});
			} 
			
			if(lhpvConfiguration.destinationSubRegion) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.subRegion,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'destinationSubRegionEle',
					onChange		:	_this.onDestinationSubRegionSelect
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	{},
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destinationBranchEle'
				});
			} else {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branches,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destinationBranchEle',
					onChange		:	_this.getSourceDestinationBranchWiseLHPVSequenceCounter	
				});
			}
			
			if(lhpvConfiguration.showSourceBranchesSelection){
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branches,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'sourceBranchEle'
				});
			}
			
			if(response.debitToBranch) {
				$("#debitToBranch").css("display", "block");
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.debitTobranchArr,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'debitToBranchEle'
				});
			}
			
			if(lhpvConfiguration.balancePayeeSubRegion){
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.subRegion,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'balancePayeeSubRegionEle',
					onChange		:	_this.onBalancePayeeSubRegionSelect
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	{},
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'balancePayeeBranchEle'
				});
			} else {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branches,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'balancePayeeBranchEle'
				});
			}

			if(tdsConfiguration.IsTdsAllow) {
				if(tdsChargesList != undefined && tdsChargesList.length > 0) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	tdsChargesList,
						valueField		:	'tdsChargeId',
						labelField		:	'tdsChargeValue',
						searchField		:	'tdsChargeValue',
						elementId		:	'tdsRateEle',
						onChange		:	_this.allowTDSAmount
					});
				} else
					$('#tdsRate').remove();
			}
			
			if(lhpvConfiguration.showRatePMTSelection && ratePMTTypeList != undefined && ratePMTTypeList.length > 0) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	ratePMTTypeList,
					valueField		:	'ratePMTTypeId',
					labelField		:	'ratePMTTypeName',
					searchField		:	'ratePMTTypeName',
					elementId		:	'ratePMTTypeEle'
				});
			}
			
			if(lhpvConfiguration.showRateUnitTypeSelection && rateUnitTypeList != undefined && rateUnitTypeList.length > 0) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	rateUnitTypeList,
					valueField		:	'rateUnitTypeId',
					labelField		:	'rateUnitTypeName',
					searchField		:	'rateUnitTypeName',
					elementId		:	'rateUnitTypeEle'
				});
			}
			
			if(showSplitBranchWiseLhpv) {
				let branchAutoComplete 			= new Object();
				branchAutoComplete.url			= WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteByAccountGroup.do?'
				branchAutoComplete.primary_key 	= 'branchId';
				branchAutoComplete.field 		= 'branchName';
				$("#branchEle").autocompleteCustom(branchAutoComplete);
			}
			
			if(showSplitDieselWiseLhpv){
				let fuelPumpEleAutoComplete = new Object();
				fuelPumpEleAutoComplete.url = response.pumpNameMasterList;
				fuelPumpEleAutoComplete.primary_key = 'pumpNameMasterId';
				fuelPumpEleAutoComplete.field = 'name';
				$("#fuelPumpEle").autocompleteCustom(fuelPumpEleAutoComplete);
			}
			
			if(lhpvConfiguration.driverName) {
				let autoLicenceNumber = new Object();
				autoLicenceNumber.url 			= WEB_SERVICE_URL+'/dispatchWs/getLicenceNumberForDispatch.do';
				autoLicenceNumber.primary_key 	= 'driverMasterId';
				autoLicenceNumber.field 		= 'driverName';
				autoLicenceNumber.callBack 		= _this.getDriverNameAndMobNum;
				autoLicenceNumber.show_field 	= 'driverMasterId, licenceNumber, mobileNumber'; //do not remove driverMasterId from here
				autoLicenceNumber.sub_info 		= true;
				autoLicenceNumber.sub_as = {licenceNumber : languageKeyset['licenceNumber'], mobileNumber : languageKeyset['driverNumber']};
				
				$("#driverNameEle").autocompleteCustom(autoLicenceNumber);
			}
			
			if(lhpvConfiguration.showVehicleDetails) {
				$(".vehicleDetail").show();
				
				if(typeof vehicleNumberMaster !== 'undefined') {
					$("#panNumberEleNew").val(vehicleNumberMaster.panNumber);
					$("#vehicleAgentEleNew").val(vehicleNumberMaster.vehicleAgentName);
					$("#registeredOwnerEle").val(vehicleNumberMaster.registeredOwner);
				}
				
				$("#panNumberEleNew").attr('readonly', true);
				$("#vehicleAgentEleNew").attr('readonly', true);
				$("#registeredOwnerEle").attr('readonly', true);
			}
			
			if(lhpvConfiguration.showVehicleAgentInLhpv && typeof vehicleNumberMaster !== 'undefined' && vehicleNumberMaster.vehicleOwner != OWN_VEHICLE_ID) {
				$("#vehicleAgentDiv").css("display", "block");
				
				Selectizewrapper.setAutocomplete({
					url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?',
					valueField			: 'vehicleAgentMasterId',
					labelField			: 'name',
					searchField			: 'name',
					elementId			: 'vehicleAgentEle',
					responseObjectKey 	: 'vehicleAgentAutoCompleteList'
				});
				
				setTimeout(() => {
					let vehicleAgentSelectize 	= $('#vehicleAgentEle').get(0).selectize;
					
					if(typeof vehicleNumberMaster !== 'undefined') {
						if(typeof vehicleAgentSelectize.search(vehicleNumberMaster.vehicleAgentName).items[0] !== 'undefined')
							vehicleAgentSelectize.setValue(vehicleAgentSelectize.search(vehicleNumberMaster.vehicleAgentName).items[0].id);
						else
							vehicleAgentSelectize.setValue();
						
						$("#vehicleAgentEle").val(vehicleNumberMaster.vehicleAgentMasterId)
					}
				}, 600);
			}
			
			if(isSingleLs != undefined && isSingleLs)
				$("#interBranchlhpvVehicle").text('LHPV For LS No. ' + dispatchLedger[0].lsNumber);
			else if(lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_NORMAL && (lhpvOperationSelection == LHPVConstant.CREATE_ID || lhpvOperationSelection == LHPVConstant.APPEND_ID))
				$("#interBranchlhpvVehicle").text('LHPV For ' + dispatchLedger[0].vehicleNumber);
			else if(lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDM && lhpvofddm)
				$("#interBranchlhpvVehicle").text('DDM LHPV For ' + dispatchLedger[0].vehicleNumber);
			else
				$("#interBranchlhpvVehicle").text('Interbranch LHPV For ' + dispatchLedger[0].vehicleNumber);
			
			_this.getVehicleData(dispatchLedger[0].vehicleOwner);
			
			let columnArray	= new Array();
			
			if(lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDM && lhpvofddm) {
				$("#lsNo").css("display", "none");
				$("#lsDate").css("display", "none");
			} else {
				$("#ddmNo").css("display", "none");
				$("#ddmDate").css("display", "none");
			}
			
			let totatalNoOfArticle	= 0.0;
			let totalActualWeight	= 0.0;
			let totalNoOfLR			= 0;
			let bookingTotalAmount	= 0.0;
			
			for (const element of dispatchLedger) {
				let obj		= element;
				let amount			= obj.bookingTotal;
				let basicFreight 	= obj.freightAmount;
			
				bookingTotalAmount	+= obj.bookingTotal;
				totatalNoOfArticle	+= obj.totalNoOfPackages;
				totalActualWeight	+= obj.totalActualWeight;
				//totalWeight			+= obj.totalActualWeight;
				totalNoOfLR			+= obj.totalNoOfWayBills;
				
				if(isSingleLs != undefined && isSingleLs)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='dispatchLedger' type='checkbox' value='" + obj.dispatchLedgerId + "' id='dispatchLedger_" + obj.dispatchLedgerId + "' name='dispatchLedger' data-tooltip = '" + obj.lsNumber + "' checked/></td>");
				else
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='dispatchLedger' type='checkbox' value='" + obj.dispatchLedgerId + "' id='dispatchLedger_" + obj.dispatchLedgerId + "' name='dispatchLedger' data-tooltip = '" + obj.lsNumber + "'/></td>");

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.tripDateTimeForString + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.sourceBranch + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.sourceSubRegion + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.destinationBranch + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.destinationSubRegion + "</td>");
				columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + obj.totalNoOfWayBills + "</td>");
				columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + obj.totalNoOfPackages + "</td>");
				columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + obj.totalActualWeight + "</td>");
				
				if(totalColunmInLsDeatils) {
					$(".bookingTotalAmount").removeClass('hide');
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + amount + "</td>");
				}
				
				if(showTotalFreight) {
					$(".totalBasicFreight").removeClass('hide');
					columnArray.push("<td id='freight_" + obj.dispatchLedgerId + "' value='" + basicFreight + "' style='text-align: right; vertical-align: middle;'>" + basicFreight + "</td>");
				}
				
				if (obj.dddv)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>DDDV</td>");
				else
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>--</td>");
			
				columnArray.push("<td style='text-align: center; vertical-align:middle;'><button type='button' class='btn btn-danger' id='" + obj.dispatchLedgerId + "'>Remove</button></td>");
				$('#loadingSheetTable tbody').append('<tr id="row' + obj.dispatchLedgerId+'">' + columnArray.join(' ') + '</tr>');
				
				$("#" + obj.dispatchLedgerId).bind("click", function() {
					_this.removeLoadingSheet(this.id);
				});
				
				$("#dispatchLedger_" + obj.dispatchLedgerId).bind("click", function() {
					if ($(this).is(":checked")) {
						totalWeight			+= obj.totalActualWeight;
						totalBasicFreight	+= obj.freightAmount;
					} else {
						totalWeight			-= obj.totalActualWeight;
						totalBasicFreight	-= obj.freightAmount;
					}
					
					_this.reCalculateAdvanceAmount(Number(this.value), obj.topayGrandTotalAmount);
					_this.calculateTotalLSWeight(totalWeight);
					
					if(lhpvConfiguration.validateLorryHireWithBasicFreight)
						_this.validateLorryHireWithBasicFreight();
				});
				
				if(isSingleLs != undefined && isSingleLs) {
					totalWeight				+= obj.totalActualWeight;
					totalBasicFreight 		+= obj.freightAmount;
					
					_this.reCalculateAdvanceAmount(Number(obj.dispatchLedgerId), obj.topayGrandTotalAmount);
					_this.calculateTotalLSWeight(totalWeight);
										
					if(lhpvConfiguration.validateLorryHireWithBasicFreight)
						_this.validateLorryHireWithBasicFreight();
				}
				
				columnArray	= [];
				
				if(totalRowInLsDetails) {
					$("#totalNoOfArticle").html(totatalNoOfArticle);
					$("#totalNoOfActualWeight").html(totalActualWeight);
					$("#totalNoOfLR").html(totalNoOfLR);
					$("#bookingTotalAmount").html(bookingTotalAmount);
					$("#totalDiv").removeClass('hide');
				} else
					$("#totalDiv").addClass('hide');

				if(setVehiclePanNumber && obj.vehiclePanNumber != null && obj.vehiclePanNumber != undefined && obj.vehiclePanNumber != "NULL")
					$("#panNumberEle").val(obj.vehiclePanNumber);
			}
		
			$("#checkAll").click(function () {
				let tab 	= document.getElementById('loadingSheetTable');
				let count 	= parseFloat(tab.rows.length - 1);
				let totalTopayTruckDelAmt = 0;
				totalBasicFreight	= 0.0;
				totalWeight			= 0.0;
				  
				for (let row = count; row > 0; row--) {
					if(tab.rows[row].cells[0].firstElementChild) {
						tab.rows[row].cells[0].firstElementChild.checked = $("#checkAll").is(":checked");
					};
				};

				if($("#checkAll").is(":checked")) {
					for (const element of dispatchLedger) {
						totalTopayTruckDelAmt 	+= element.topayGrandTotalAmount;
						totalBasicFreight 		+= element.freightAmount;
						totalWeight 			+= element.totalActualWeight;
					}
						  
					if(lhpvConfiguration.CalculateAdvanceFromTruckDlyTopayLR) {
						$("#charge" + ADVANCE_AMOUNT).val(totalTopayTruckDelAmt);
						$("#charge" + ADVANCE_AMOUNT).attr('readonly', 'readonly');
					}
					
					_this.calculateTotalLSWeight(totalWeight);
					
					if(lhpvConfiguration.validateLorryHireWithBasicFreight)
						_this.validateLorryHireWithBasicFreight();
				} else if(lhpvConfiguration.CalculateAdvanceFromTruckDlyTopayLR) {
					$("#charge" + ADVANCE_AMOUNT).val(0);
					$("#charge" + ADVANCE_AMOUNT).attr('readonly', 'readonly');
				} else
					_this.resetAdditionalWeightFields();
			});

			if(showSplitBranchWiseLhpv) {
				$("#openSplitLhpv").click(function() {
					if($('#charge' + LORRY_HIRE).val() > 0) {
						if($('#charge' + ADVANCE_AMOUNT).val() > 0) {
							showMessage('error', "You can't split Lorry Hire Amount if advance amount is greater than 0 !");
							changeTextFieldColor('charge' + ADVANCE_AMOUNT, '', '', 'red');
							return false;
						} else
							SplitLhpv.openSplitLhpv(data);
					} else {
						showMessage('error', 'Please Enter Lorry Hire Amount');
						changeTextFieldColor('charge' + LORRY_HIRE, '', '', 'red');
						return false;
					}
				});
			} else {
				$("#openSplitLhpv").remove();
			}
			//--------------------
			if(showSplitDieselWiseLhpv) {
				$(".close").click(function(){
					_this.resetTable();
					$('#dieselBalanceAmt').val(0);
					changeTextFieldColor('dieselBalanceAmt', '', '', 'black');
				});
			
				$("#openSplitDiesel").click(function() {
					if($('#charge' + DIESEL).val() > 0)
						_this.openSplitDiesel();
					else {
						showMessage('error', 'Please Enter Diesel  Amount');
						changeTextFieldColor('charge' + DIESEL, '', '', 'red');
						return false;
					}
				});
				
				$("#liter").keypress(function() {
					_this.calculateLiterAmount();
				});
				
				$("#dieselAmounts").keypress(function() {
					_this.calculateLiterAmount();
				});
				
				$("#dieselDeductPayment").click(function() {
					_this.calculateLiterAmount();
					_this.splitDieselAmount();
				});
				
				$("#saveAllDieselpaymentData").click(function() {
					if(Number($("#dieselBalanceAmt").val()) > 0) {
						showMessage('error', 'Please Split Full Diesel Amount !');
						changeTextFieldColor('dieselBalanceAmt', '', '', 'red');
						return false;
					}

					_this.onSaveDieselPaymentDetails();
				});
			} else {
				$("#openSplitDiesel").remove();
			}
			
			let keyObject	= null;

			//---------------------------------------
			if (lhpvOperationSelection == LHPVConstant.CREATE_ID) {
				
				let lhpvSubChargesHshmp	= data.lhpvSubChrgHshmp;
				keyObject 			= Object.keys(lhpvSubChargesHshmp);
				
				subCharges 	= new Array();
			
				for (const element of keyObject) {
					subCharges.push("charge" + lhpvSubChargesHshmp[element].lhpvChargeTypeMasterId);
				}
				
				let lhpvAddChargesHshmp	= data.lhpvAddChrgHshmp;
				keyObject 			= Object.keys(lhpvAddChargesHshmp);
				
				addCharges 	= new Array()
				
				for (const element of keyObject) {
					let chargeObject		= lhpvAddChargesHshmp[element];
					let chargeIdentifier 	= "charge" + chargeObject.lhpvChargeTypeMasterId;
					addCharges.push(chargeIdentifier);
				}
				
				let lhpvChargesHshmp	= data.lhpvChargesHshmp;
				keyObject 			= Object.keys(lhpvChargesHshmp);
				
				for (const element of keyObject) {
					let chargeObject			= lhpvChargesHshmp[element];
					let chargeIdentifier 		= "charge" + chargeObject.lhpvChargeTypeMasterId;
					charges[chargeIdentifier]	= 0;
					
					let chargeDiv;
					
					if (chargeObject.operationType == OPERATION_TYPE_STATIC || chargeObject.operationType == OPERATION_TYPE_NO_EFFECT_BALANCE) {			
						if(chargeObject.lhpvChargeTypeMasterId == RATE_PER_KM) {
							chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span><span style='color: red;font-size: 20px;'>*</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i>&#x20B9</i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " +
									"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
						} else {
							chargeDiv	= ("<div class='row'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span><span style='color: red;font-size: 20px;'>*</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i>&#x20B9</i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " +
									"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
						}
					}
					
					if (chargeObject.operationType == OPERATION_TYPE_STATIC && chargeObject.lhpvChargeTypeMasterId == LORRY_HIRE) {
						chargeDiv	= ("<div class='row'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span><span style='color: red;font-size: 20px;'>*</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i>&#x20B9</i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " +
						"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
					} else if (chargeObject.operationType == OPERATION_TYPE_STATIC) {					
						chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i>&#x20B9</i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " +
							"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
					} 
					
					if (chargeObject.operationType == OPERATION_TYPE_ADD) {
						if(chargeObject.lhpvChargeTypeMasterId == OVER_LOAD && lhpvConfiguration.showExtraWeight) {
							chargeDiv	= ("<div class='row'>" 
							+ "<div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-plus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" 
							+ "onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div>" 
							+ "<div class='col-xs-4'><label class='col-xs-5'><span>" + lhpvConfiguration.extraWeightLabelName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-th'></i><input class='form-control' value='0' type='number' name='extraWeight' id='extraWeightEle' data-tooltip='" + lhpvConfiguration.extraWeightLabelName + "' placeholder='" + lhpvConfiguration.extraWeightLabelName + "'"
							+ "onkeypress='return noNumbers(event);' /></div></div></div>" 
							+ "</div>");
						} else {
							chargeDiv	= ("<div class='row'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-plus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" +
							"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
						}
					}
					
					if (chargeObject.operationType == OPERATION_TYPE_SUBTRACT) {
						if(isCheckboxOptionToAllowTDS && chargeObject.lhpvChargeTypeMasterId == TDS) {
							chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-minus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" +
									"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div>"
									+ "<div class='col-xs-4'><label class='col-xs-3'><span>TDS in % <input id='isCharge_"+chargeObject.lhpvChargeTypeMasterId+"'  type='checkbox' data-tooltip='TDS in %'/></span></label><div class='col-xs-7 validation-message'>"
									+ "<input id='charge_"+chargeObject.lhpvChargeTypeMasterId+"'class='form-control  hide' type='text' value='0' data-tooltip='% Amount'"
									+ "type='text'/></div></div></div>");
						} else {
							chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xs-4'><label class='col-xs-5' id='lhpvlable_" + chargeIdentifier + "'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-minus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" +
									"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
						}
					}
					
					$( "#lhpvChargesDiv" ).append(chargeDiv);
					
					if(chargeObject.lhpvChargeTypeMasterId == TDS && (vehicleNumberMaster.tdsRate != undefined && vehicleNumberMaster.tdsRate > 0)) {
						let tdsChargeInPercent	= vehicleNumberMaster.tdsRate;
						$('#lhpvlable_' + chargeIdentifier).html(chargeObject.displayName + ' (' + tdsChargeInPercent + '%)');
					} else if(chargeObject.lhpvChargeTypeMasterId == TDS && !isCheckboxOptionToAllowTDS && tdsConfiguration.showTdsPercentageWithName) {
						let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
						
						if(tdsChargeInPercent != undefined && !tdsChargeInPercent.includes(","))
							$('#lhpvlable_' + chargeIdentifier).html(chargeObject.displayName + ' (' + tdsChargeInPercent + '%)');
					}
					
					if(lhpvConfiguration.PaymentStatus && chargeObject.lhpvChargeTypeMasterId == ADVANCE_AMOUNT) {
						$( "#div_" + chargeIdentifier + "" ).append("<div class='col-xs-4' ><label class='col-xs-4'><span>Amount</span></label><div class='col-xs-8 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-th'></i><input class='form-control calculation' value='0' type='text' id='amountEle' data-tooltip='Amount' readOnly " +
							"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
					}
				}
				
				initialiseFocus();
				
				if(isSingleLs != undefined && isSingleLs)
					goToPosition('createOnlyDiv', 500);
				
				$( "#lhpvChargesDiv :input" ).focus(function() {
					$(this).select();
				})
				
				if(lhpvConfiguration.showPassingWeight)
					$("#passingWeight").css("display", "block");
				
				if(lhpvConfiguration.showAddtionalWeight)
					$("#additionalWeight").css("display", "block");
				
				if(lhpvConfiguration.showLsWeight)
					$("#lsWeight").css("display", "block");
				
				$("#passingWeightEle").on('blur', function() {
					if (_this.validatePassingWeight())
						_this.calculateTotalLSWeight(totalWeight);
				});

				$("#passingWeightEle").on('keyup', function() {
					_this.calculateTotalLSWeight(totalWeight);
				});

				$("#charge" + LORRY_HIRE).blur(function() {
					if(lhpvConfiguration.showLsWeight){
						_this.calculateTotalLorryHire();
						_this.calculateTotal();
					}
					
					if(lhpvConfiguration.validateLorryHireWithBasicFreight && !(lhpvTypeSelection == LHPVConstant.LHPV_TYPE_ID_DDM))
						_this.validateLorryHireWithBasicFreight();
				});
				
				$("#charge" + ADDITIONAL_WEIGHT_CHARGE).on('keyup', function() {
					if(lhpvConfiguration.enableAdditionalWeightCharge)
						_this.calculateTotalLorryHire();
				});
				
				$("#charge" + ADVANCE_AMOUNT).blur(function() {
					if(lhpvConfiguration.validatePrecentOfLorryHireWithAdvanceAmount && lhpvTypeSelection != LHPVConstant.LHPV_TYPE_ID_DDM)
						_this.validateLorryHireWithAdvanceAmount();
				});
				
				if(tdsConfiguration.IsTdsAllow) {
					$( "#lhpvChargesDiv :input" ).blur(function() {
						_this.calculateBalanceAmount($(this).attr('id') == ('charge' + TDS) || $(this).attr('id') == ('charge' + ADVANCE_AMOUNT));
					});
					
					$( "#lhpvChargesDiv :input" ).keyup(function() {
						if($(this).attr('id') == ('charge' + TDS))
							_this.calculateBalanceAmount(true);
					});
				}
				
				if(isCheckboxOptionToAllowTDS) {//work done for STS #23452
					$("#charge_" + TDS).blur(function() {
						if(_this.checkCalculateTDSInPercentage())
							_this.calculateBalanceAmount(false);
						else
							$('#charge' + TDS).val(0);
					});
					
					$("#isCharge_" + TDS).click(function() {
						if(this.checked) {
							$("#charge" + TDS).attr('readonly', true);
							$("#charge_" + TDS).removeClass('hide');
						} else {
							$("#charge" + TDS).attr('readonly', false);
							$("#charge_" + TDS).addClass('hide');
							$("#charge_" + TDS).val(0);
						}
						
						$("#charge" + TDS).val(0);
						_this.calculateBalanceAmount(false);
					});
				}
				
				$("#charge_" + TDS).on('keypress', function(e) {
					return validateFloatKeyPress(e, this);
				});
				
				if(lhpvConfiguration.isAllowAlphnumericWithSpecialCharactersSeq) {
					$("#manualNumberEle").on('keyup', function(e) {
						_this.allowAlphaNumericAndSpecialCharacters(e, 'manualNumberEle');
					});
				}
				
				if(lhpvConfiguration.isAllowAlphaNumericOnly) {
				$("#manualNumberEle").on('keypress', function (e) {
				    return _this.allowAlphaNumericOnly(e, 'manualNumberEle');
				});
				}

				$("#charge" + BALANCE_AMOUNT).prop("readonly", true);
				$("#charge" + KANTA_RATE).prop("readonly", true);
				$("#charge" + KANTA_RATE).val(lhpvConfiguration.defaultKantaRate);
				
				if(tdsConfiguration.IsTdsAllow && !tdsConfiguration.isTDSEditable)
					$("#charge" + TDS).prop("readonly", true);
				
				if(lhpvConfiguration.lorryHireCalculationOnNetWeight) {//Work done for RGLPL - #26961
					$( "#lhpvChargesDiv :input" ).keyup(function() {
						if($(this).attr('id') == ('charge' + RATE_PMT) && $("#weighBridgeEle").exists()) {
							let netWeight 		= Number($("#weighBridgeEle").val());
							let ratePMT 		= Number($("#charge" + RATE_PMT).val());
							let lorryHireAmt 	= (netWeight * ratePMT) / 1000;
							$("#charge" + LORRY_HIRE).val(Math.round(lorryHireAmt));
							_this.calculateBalanceAmount(false);
						}
					});
					
					$( "#weighBridgeEle" ).keyup(function() {
						let netWeight 		= Number($("#weighBridgeEle").val());
						let ratePMT 		= Number($("#charge" + RATE_PMT).val());
						let lorryHireAmt 	= (netWeight * ratePMT) / 1000;
						$("#charge" + LORRY_HIRE).val(Math.round(lorryHireAmt));
						_this.calculateBalanceAmount(false);
					});
				}

				if(lhpvConfiguration.lorryHireCalculationOnNetWeightInTons) {//Work done for BARL
					$( "#lhpvChargesDiv :input" ).keyup(function() {
						if($(this).attr('id') == ('charge' + PER_TON_AMOUNT) && $("#weighBridgeEle").exists())
							_this.calculateLorryHireOnPerTonAmount();
					});
					
					$( "#weighBridgeEle" ).keyup(function() {
						_this.calculateLorryHireOnPerTonAmount();
					});
				}
				
				if(lhpvConfiguration.showLorryHireModeSelection) {
					$("#openingKMEle").on('keyup', function() {
						_this.validateOpeningKM();
					});
					
					$('#charge' + RATE_PER_KM).on('keyup', function() {
						_this.validateRatePerKM();
					});
					
					$('#charge' + LORRY_HIRE).on('keyup', function() {
						_this.validateLorryHireAmount();
					});
				}
				
				manualLHPVNod	= nod();
				manualLHPVNod.configure({
					parentClass:'validation-message'
				});
				manualLHPVNod.add({
					selector	: '#manualNumberEle',
					validate	: 'presence',
					errorMessage: 'Enter LHPV Number !'
				});
				
				if(lhpvConfiguration.isAllowOnlyNumeric) {
					manualLHPVNod.add({
						selector	: '#manualNumberEle',
						validate	: 'integer',
						errorMessage: 'Enter Valid LHPV Number !'
					});
				}
				
				manualLHPVNod.add({
					selector	: '#manualDateEle',
					validate	: 'presence',
					errorMessage: 'Select Manual LHPV Date !'
				});
				
				lhpvNodCheck = nod();

				if(lhpvConfiguration.remark && lhpvConfiguration.remarkValidate) {
					lhpvNodCheck.add({
						selector	: "#remarkEle",
						validate	: "presence",
						errorMessage: "Provide Remark"
					});
				}
				
				if(lhpvConfiguration.showExtraWeight) {
					lhpvNodCheck.add({
						selector	: "#extraWeightEle",
						validate	: "float",
						errorMessage: "Provide Valid " + lhpvConfiguration.extraWeightLabelName
					});
				}
				
				if (lhpvConfiguration.driverName && lhpvConfiguration.validateDriverNameOnVehicleOwnerTypeWise)
					_this.validateDriverNameOnVehicleOnwerTypeWise();
				else if (lhpvConfiguration.driverName)
					_this.validateDriverName();

				
				if(lhpvConfiguration.driverContact) {
					lhpvNodCheck.add({
						selector	: "#driverContactEle",
						validate	: "presence",
						errorMessage: "Enter Driver Contact"
					});
				}
				
				if (lhpvConfiguration.PaymentType && lhpvConfiguration.validatePaymentTypeAndPaymentStatusOnAdvanceAmount) {
					$('#charge' + ADVANCE_AMOUNT).on('blur', function() {
						_this.validatePaymentTypeAndPaymentStatusOnAdvanceAmount();
					});
				} else if (lhpvConfiguration.PaymentType)
					_this.validatePaymentTypeAndPaymentStatus();

				if(lhpvConfiguration.destinationbranch){
					lhpvNodCheck.add({
						selector	: "#destinationBranchEle_wrapper",
						validate	: "validateAutocomplete:#destinationBranchEle",
						errorMessage: "Provide valid Destination Branch"
					});
				}
				
				if(lhpvConfiguration.showSourceBranchesSelection) {
					lhpvNodCheck.add({
						selector	: "#sourceBranchEle_wrapper",
						validate	: "validateAutocomplete:#sourceBranchEle",
						errorMessage: "Provide valid Source Branch"
					});
				}
				
				if(lhpvConfiguration.balancePayeeBranch) {
					lhpvNodCheck.add({
						selector	: "#balancePayeeBranchEle_wrapper",
						validate	: "validateAutocomplete:#balancePayeeBranchEle",
						errorMessage: "Provide valid Bal Payee Branch"
					});
				}

				if(lhpvConfiguration.validateVehicleAgent && lhpvConfiguration.showVehicleAgentInLhpv
					&& typeof vehicleNumberMaster !== 'undefined' && vehicleNumberMaster.vehicleOwner != OWN_VEHICLE_ID) {
					lhpvNodCheck.add({
						selector	: "#vehicleAgentEle_wrapper",
						validate	: "validateAutocomplete:#vehicleAgentEle",
						errorMessage: "Please Select Vehicle Agent"
					});
 					 $("#vehicleAgentStar").show();
				}

				if(tdsConfiguration.individualFirm) {
					lhpvNodCheck.add({
						selector	: "#individualFirm_wrapper",
						validate	: "validateAutocomplete:#individualFirm",
						errorMessage: "Provide Is Individual OR Firm"
					});
				}

				if(tdsConfiguration.declarationGiven) {
					lhpvNodCheck.add({
						selector	: "#declarationGiven_wrapper",
						validate	: "validateAutocomplete:#declarationGiven",
						errorMessage: "Provide is declaration given"
					});
				}
				
				if(!allowLhpvWithZeroLorryHireAmt && !lhpvConfiguration.showLorryHireModeSelection) {
					lhpvNodCheck.add({
						"selector"		: "#charge4",
						"validate"		: "min-number:1",
						"errorMessage"	: "Please Provide Amount"
					});
				}
				
				if(lhpvConfiguration.routeTime) {
					$('#routeTimeHrsEle').blur(function() {
						setTimeout(() => {
							if($('#routeTimeHrsEle').val() > 100) {
								showMessage('error','Hours Cannot Be More Than 100 !');
								changeTextFieldColor('routeTimeHrsEle', '', '', 'red');
								$('#routeTimeHrsEle').focus();
								return false;
							}
						}, 100);
					});
					
					$('#routeTimeMinEle').blur(function() {
						setTimeout(() => {
							if($('#routeTimeMinEle').val() > 59) {
								showMessage('error','Minutes Cannot Be More Than 59 !');
								changeTextFieldColor('routeTimeMinEle', '', '', 'red');
								$('#routeTimeMinEle').focus();
								return false;
							}
						}, 100);
					});
				}
				
				if(lhpvConfiguration.lorryHireBy) {
					$("*[data-attribute=lorryHireBy]").removeClass("hide");

					if(lhpvConfiguration.validateLorryHireBy) {
						lhpvNodCheck.add({
							selector	: "#lorryHireByEle",
							validate	: "presence",
							errorMessage: "Provide Lorry Hire By!"
						});
					}
				} else
					$("*[data-attribute=lorryHireBy]").remove();
				
				if(lhpvConfiguration.showRatePMTSelection)
					$("*[data-attribute=ratePMTType]").removeClass("hide");
				else
					$("*[data-attribute=ratePMTType]").remove();
				
				if(lhpvConfiguration.showRateUnitTypeSelection)
					$("*[data-attribute=rateUnitType]").removeClass("hide");
				else
					$("*[data-attribute=rateUnitType]").remove();
				
				if(lhpvConfiguration.showRateValue)
					$("*[data-attribute=rate]").removeClass("hide");
				else
					$("*[data-attribute=rate]").remove();
				
				lhpvNodCheck.add([{
					"selector": "#destinationSubRegionEle_wrapper",
					"validate": "validateAutocomplete:#destinationSubRegionEle",
					"errorMessage": "Provide valid Destination Area"
				},{
					"selector": "#balancePayeeSubRegionEle_wrapper",
					"validate": "validateAutocomplete:#balancePayeeSubRegionEle",
					"errorMessage": "Provide valid Bal Payee Area"
				}
				]);
				
				if(lhpvConfiguration.showLorryHireModeSelection && Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE)
					$("#div_charge" + RATE_PER_KM).css("display", "block");
				else
					$("#div_charge" + RATE_PER_KM).css("display", "none");
				
				$( ".calculation" ).bind("change", function() {
					_this.calculateTotal();
				});
				
				$( "#saveBtn" ).bind("click", function() {
					if ($('#isManualEle').is(':checked')) {
						manualLHPVNod.performCheck();
						
						if(!manualLHPVNod.areAll('valid'))
							return;
					}
					
					lhpvNodCheck.performCheck();
					
					if(!lhpvNodCheck.areAll('valid'))
						return;
					
					if(lhpvConfiguration.showLorryHireModeSelection) {
						if(!_this.validateOpeningKM()) return;
						if(!_this.validateRatePerKM()) return;
						if(!_this.validateLorryHireAmount()) return;
					}
				
					let checkBoxArray	= getAllCheckBoxSelectValue('dispatchLedger');

					if(checkBoxArray.length <= 0) {
						showAlertMessage('error', 'Provide select atleast one LS !');
						return;
					}
					
					if (!_this.validatePassingWeight())
						return;
					
					if(tdsConfiguration.declarationGiven)
						_this.checkTDSAmount()
						
					if(lhpvConfiguration.showSourceBranchesSelection) {
						if($('#controlinput_sourceBranchEle').is(":visible") && ($("#destinationBranchEle").val() == $("#sourceBranchEle").val())) {
							showAlertMessage('error', iconForErrMsg + ' Source and Destination Branch cannot be same.');
							$('#controlinput_destinationBranchEle').focus();
							return false;
						}
					}
					
					let jsonObject	= new Object();
					
					jsonObject.operationType			= LHPVConstant.CREATE_ID;
					jsonObject.isSeqCounterPresent		= data.isSeqCounterPresent;
					
					if(checkBoxArray.length > 0)
						jsonObject.dlIdS			= checkBoxArray.join(',');
					else
						jsonObject.dlIdS			= dispatchLedgerIds.join(',');
					
					if(lhpvConfiguration.roundOffChargeAmount)
						jsonObject.totalAmount		= Math.round($("#charge" + BALANCE_AMOUNT).val());
					else
						jsonObject.totalAmount		= $("#charge" + BALANCE_AMOUNT).val();
					
					jsonObject.lhpvType					= $('#lhpvType').val();
					
					keyObject = Object.keys(charges);
					
					for (const element of keyObject) {
						if(lhpvConfiguration.roundOffChargeAmount)
							jsonObject[element]	= Math.round($("#" + element).val());
						else
							jsonObject[element]	= $("#" + element).val();
					}
					
					if (data.isSeqCounterPresent || lhpvConfiguration.allowManualLHPVWithoutCounter || data.allowManualLHPVWithoutCounterPermission) {
						jsonObject.isManualLHPV	= $('#isManualEle').is(':checked');
						
						if (jsonObject.isManualLHPV) {
							jsonObject.manualLHPVNumber	= $("#manualNumberEle").val();
							jsonObject.manualLHPVDate	= $("#manualDateEle").attr('data-date');
						}
					}
					
					if(manualLHPVDatePermission) {
						if($("#manualDateEle").attr('data-date') != undefined)
							jsonObject.manualLHPVDate		= $("#manualDateEle").attr('data-date');
						else
							jsonObject.manualLHPVDate		= $("#manualDateEle").attr('data-startdate');
					}
					
					if(lhpvConfiguration.driverName) {
						if($("#driverNameEle_primary_key").val())
							jsonObject.driverMasterId		= $("#driverNameEle_primary_key").val();
						
						jsonObject.driverName			= $("#driverNameEle").val();
						jsonObject.driverContact		= $("#driverContactEle").val();
					}
					
					if(dddv && !lhpvConfiguration.driverName)
						jsonObject.driverMasterId			= driverMasterId;

					jsonObject.balancePayableBranchId	= $("#balancePayeeBranchEle").val();
					jsonObject.materials				= $("#materialsEle").val();
					jsonObject.DestinationBranchId		= $("#destinationBranchEle").val();
					jsonObject.remark					= $("#remarkEle").val();
					jsonObject.additionalRemark			= $("#additionalRemarkEle").val();
					jsonObject.ownerName				= $("#ownerNameEle").val();
					jsonObject.contactPerson			= $("#contactPersonEle").val();
					jsonObject.declarationGiven			= $("#declarationGiven").val();
					jsonObject.PanNumber				= $("#panNumberEle").val();
					jsonObject.TanNumber				= $("#tanNumberEle").val();
					jsonObject.category					= $("#individualFirm").val();
					jsonObject.vehicleNumberMasterId	= $("#vehicleNumberEle").val();
					jsonObject.lorryHireby				= $("#lorryHireByEle").val();
					jsonObject.ratePMTType				= $("#ratePMTTypeEle").val();
					jsonObject.extraWeight				= $("#extraWeightEle").val();
					jsonObject.rateUnitTypeEle			= $("#rateUnitTypeEle").val();
					jsonObject.rateValueEle				= $("#rateValueEle").val();
					jsonObject.passingWeight			= $("#passingWeightEle").val();
					jsonObject.additionalWeight			= $("#additionalWeightEle").val();
					jsonObject.additionalWeightChrg		= $("#charge" + ADDITIONAL_WEIGHT_CHARGE).val();
					jsonObject.sourceBranchId			= $("#sourceBranchEle").val();
					jsonObject.tdsOnAmount				= tdsOnAmount;
					
					if(lhpvConfiguration.roundOffChargeAmount)
						jsonObject.tdsAmount			= Math.round($("#charge" + TDS).val());
					else
						jsonObject.tdsAmount			= $("#charge" + TDS).val();
					
					jsonObject.tdsRate					= $("#tdsRateEle").val();
					jsonObject.paymentType				= $('#paymentType').val();
					jsonObject.debitToBranchId			= $("#debitToBranchEle").val();
					jsonObject.vehicleAgentMasterId		= $("#vehicleAgentEle").val();
					jsonObject.weightBridge				= $("#weighBridgeEle").val();
					jsonObject.divisionId				= divisionID;
					
					if($('#isCharge_' + TDS).is(":checked")) {
						if(lhpvConfiguration.roundOffChargeAmount)
							jsonObject.tdsRate			= Math.round($('#charge_' + TDS).val());
						else
							jsonObject.tdsRate			= $('#charge_' + TDS).val();
					}
					
					if($('#paymentStatus').val() != undefined) {
						if($('#paymentStatus').val() == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_CLEAR && $('#amountEle').val() == "0") {
							if(lhpvConfiguration.roundOffChargeAmount)
								jsonObject.amount		= Math.round($('#charge' + ADVANCE_AMOUNT).val());
							else
								jsonObject.amount		= $('#charge' + ADVANCE_AMOUNT).val();
						}
						
						if($('#paymentStatus').val() == "")
							jsonObject.paymentStatus	= LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_CLEAR;
						else
							jsonObject.paymentStatus	= $('#paymentStatus').val();
					}
					
					if($('#amountEle').exists() && $('#amountEle').is(":visible")) {
						if($('#amountEle').val() != undefined ){
							if(lhpvConfiguration.roundOffChargeAmount)
								jsonObject.amount		= Math.round($('#amountEle').val());
							else
								jsonObject.amount		= $('#amountEle').val();
							
							if(Number($('#amountEle').val()) >= Number($('#charge' + ADVANCE_AMOUNT).val()) && $('#paymentStatus').val() == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_PARTIAL){
								showAlertMessage('info', 'Please select Payment Status as Clear Payment. Because You Clear Advance Amount!');
								$('#paymentStatus_wrapper').find('div').css('borderColor','red');
								return false;
							}
							
							$('#paymentStatus_wrapper').find('div').css('borderColor','green');
						}
					} else if(lhpvConfiguration.roundOffChargeAmount)
						jsonObject.amount		= Math.round($('#charge' + ADVANCE_AMOUNT).val());
					else
						jsonObject.amount		= $('#charge' + ADVANCE_AMOUNT).val();
					
					if(showSplitDieselWiseLhpv) {
						let totalDieselWiseSplitAmt = 0;
						
						for(const element of dieselWiseSplitAmtList) {
							totalDieselWiseSplitAmt  += element.dieselAmount
						}
						
						if($('#charge' + DIESEL).val() > 0 && (totalDieselWiseSplitAmt != $('#charge' + DIESEL).val())){
							$('#tableDieselElements tbody').empty();
							dieselWiseSplitAmtList = new Array();
							$("#dieselDeductPayment").attr("disabled", false);
							showAlertMessage('error', iconForErrMsg + ' Please Split Diesel Amount');
							changeTextFieldColor('openSplitDiesel', '', '', 'red');
							return false;
						}
					}
					
					if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_RTGS_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
						jsonObject.chequeNumber				= $('#chequeNo').val();
						jsonObject.chequeDate				= $('#chequeDate').val();
						
						if($('#accountNo_primary_key').exists())
							jsonObject.bankAccountId		= $('#accountNo_primary_key').val();
						else
							jsonObject.bankAccountId		= $('#bankName').val();
						
						jsonObject.chequeGivenTo			= $('#payeeName').val();
					}
					
					if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID 
							|| $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID)
						jsonObject.chequeNumber				= $('#cardNo').val();
					
					if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID 
							|| $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_IMPS_ID) {
					
						if($('#accountNo_primary_key').exists())
							jsonObject.bankAccountId		= $('#accountNo_primary_key').val();
						else
							jsonObject.bankAccountId		= $('#bankName').val();
					}
					
					if($('#paymentType').val() == PAYMENT_TYPE_IMPS_ID 
							|| $('#paymentType').val() == PAYMENT_TYPE_PAYTM_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_UPI_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_PHONE_PAY_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_GOOGLE_PAY_ID
							|| $('#paymentType').val() == PAYMENT_TYPE_WHATSAPP_PAY_ID)
						jsonObject.chequeNumber				= $('#referenceNumber').val();
					
					jsonObject.paymentValues	= $('#paymentCheckBox').val();
					
					if($('#charge' + ADVANCE_AMOUNT).val() <= 0)
						jsonObject.paymentStatus	= 0;
					
					jsonObject.branchWiseSplitAmountStr = localStorage.getItem("branchWiseSplitAmountStr");
					jsonObject.dieselWiseSplitAmtList = JSON.stringify(dieselWiseSplitAmtList);
					jsonObject.routeTimeHrs		= $("#routeTimeHrsEle").val();
					jsonObject.routeTimeMin		= $("#routeTimeMinEle").val();
					jsonObject.lorryHireMode	= $("#lorryHireModeEle").val();
					jsonObject.openingKM		= $("#openingKMEle").val();
					
					if(validateLhpvToken) {
						jsonObject.TOKEN_KEY				= TOKEN_KEY;
						jsonObject.TOKEN_VALUE				= TOKEN_VALUE;
						jsonObject.validateLhpvToken		= validateLhpvToken;
					}
					
					jsonObject.openingKM		= $("#openingKMEle").val();
					jsonObject.closingKM		= $("#closingKMEle").val();
					
					if(lhpvConfiguration.allowMultipleRemarks && isValueExistInArray((lhpvConfiguration.subRegionIdsForMultipleRemarks).split(','), executive.subRegionId))
						jsonObject.lhpvRemarks = MultipleRemark.getFinalRemarksArray().join(',');
					
					$("#saveBtn").addClass('hide');
					$("#saveBtn").attr("disabled", true);
					
					if(!doneTheStuff) {
						let btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to continue ?",
							modalWidth 	: 	30,
							title		:	'LHPV',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();

						btModalConfirm.on('ok', function() {
							if(!doneTheStuff) {
								getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/saveLHPV.do?', _this.onSaveLHPV, EXECUTE_WITH_ERROR);
								showLayer();
							}
							setTimeout(()=>{
								$("#saveBtn").removeClass('hide');
								$("#saveBtn").attr("disabled", false);
							},100)
						});
						btModalConfirm.on('cancel', function() {
							$("#saveBtn").removeClass('hide');
							$("#saveBtn").attr("disabled", false);
							doneTheStuff = false;
							hideLayer();
						});
						
					}
				});
			}
			
			if (lhpvOperationSelection == LHPVConstant.APPEND_ID) {
				$( "#appendBtn" ).bind("click", function() {
					_this.appendLHPV();
				});
				
				$("#createOnlyDiv").css("display", "none");
				$("#saveBtnDiv").css("display", "none");
				$("#appendBtnDiv").css("display", "block");
			}
			
			$("#createInterBranchLHPVElements").css("display", "block");
			
			if(tdsConfiguration.declarationGiven) {
				$('#declarationGiven').bind('change', function() {
					_this.allowTDSAmount();
				});
			}
		}, getDriverNameAndMobNum : function() {
			let jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			let obj 		= eval( '(' + jsonValue + ')' );
			
			$("#driverContactEle").val(obj.mobileNumber);
		}, getVehicleData : function(vehicleOwner) {
			isOwnTruck = vehicleOwner == 1;
			
			_this.setOwnTruck();
		}, setOwnTruck : function() {
			$("#ownerNameEle").val('');
			
			if(isOwnTruck) {
				$('#category').attr("disabled", "disabled");
				$('#declarationGiven').attr("disabled", "disabled");
				
				if(tdsConfiguration.IsTdsAllow)
					$('#panNumberEle').removeAttr("disabled");
				else
					$('#panNumberEle').attr("disabled", "disabled");
			} else {
				$('#category').removeAttr("disabled");
				$('#declarationGiven').removeAttr("disabled");
				$('#panNumberEle').removeAttr("disabled");
			}
			
			_this.allowTDSAmount();
		}, removeLoadingSheet : function(dispatchLedgerId) {
			dispatchLedgerIds = jQuery.grep(dispatchLedgerIds, function(value) {return value != dispatchLedgerId;});
			$('table#loadingSheetTable tr#row' + dispatchLedgerId).remove();
			
			let loadingSheetTableLength	= $('#loadingSheetTable tbody tr').length;
			
			if(loadingSheetTableLength <= 0) {
				$('#createInterBranchLHPVElements').css('display', "none");
				$('#lhpvChargesDiv').empty();
				$('#loadingSheetTable tbody').empty();
				
				vehcileNumberArr	= [];
			}
		}, calculateTotal : function() {
			let chargeAmount	 = parseInt(0);

			if(lhpvConfiguration.calculateTotalOnAdvance) {
				let lorryFreight	= 0;
				let margin			= 0;
				let advance			= 0;
				let commission		= 0;
				let loadingHamali	= 0;
				let other			= 0;
				let otherCharges	= 0;
				let tds				= 0;
				let gpsCharges		= 0;
				let penaltyCharges	= 0;
				let tarpulinCharges = 0;
				let extraCharges			= 0;
				let overloadCharges 		= 0;
				let labourCharges			= 0;
				let multiplePointCharges 	= 0;
				let heightCharges			= 0;
				let additionaWtCharges		= 0;
				
				if(!isNaN(parseInt($("#charge" + LORRY_HIRE).val()))) 
					lorryFreight	= parseInt($("#charge" + LORRY_HIRE).val());
				
				if(!isNaN(parseInt($("#charge" + MARGIN).val()))) 
					margin			= parseInt($("#charge" + MARGIN).val());
					
				if(!isNaN(parseInt($("#charge" + OTHER_ADDITIONAL).val()))) 
					otherCharges	= parseInt($("#charge" + OTHER_ADDITIONAL).val());
					
				if(!isNaN(parseInt($("#charge" + TDS).val())))
					tds			= parseInt($("#charge" + TDS).val());
					
				let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
					
				if(tdsChargeInPercent != undefined && !tdsChargeInPercent.includes(",")) {
					let tdsAmount	= 0;
					if($("#charge" + TDS).val() != undefined && $("#charge" + TDS).val() != 'undefined' && Number($("#charge" + TDS).val()) != 0)
						tdsAmount = Number($("#charge" + TDS).val());
					else
						tdsAmount	= lorryFreight * Number(tdsChargeInPercent) / 100;
						
					$("#charge" + TDS).val(tdsAmount);
				}

				let incentiveAmount = lorryFreight * lhpvConfiguration.incentivePercentageValueOfLorryHire / 100;
				
					//$("#charge" + INCENTIVE_AMOUNT).val(incentiveAmount);
				
				let incentiveAmt	= 0;
				
				if (!isNaN(parseInt($("#charge" + INCENTIVE_AMOUNT).val()))) {
					 incentiveAmt = parseInt($("#charge" + INCENTIVE_AMOUNT).val());

					if (incentiveAmt > incentiveAmount) {
						showMessage('error', "Incentive Amount " + incentiveAmt + " can not be more than " + lhpvConfiguration.incentivePercentageValueOfLorryHire + "% of Lorry Hire !");
						$("#charge" + INCENTIVE_AMOUNT).val(incentiveAmount);
						$("#charge" + INCENTIVE_AMOUNT).focus();
					}
				}

				if(!isNaN(parseInt($("#charge" + ADVANCE_AMOUNT).val())))
					advance			= parseInt($("#charge" + ADVANCE_AMOUNT).val());
					
				if(!isNaN(parseInt($("#charge" + COMMISSION).val())))
					commission		= parseInt($("#charge" + COMMISSION).val());
				
				if(!isNaN(parseInt($("#charge" + LOADING_HAMALI).val())))
					loadingHamali	= parseInt($("#charge" + LOADING_HAMALI).val());
				
				if(!isNaN(parseInt($("#charge" + OTHER_NEGATIVE).val())))
					other			= parseInt($("#charge" + OTHER_NEGATIVE).val());
					
				if(!isNaN(parseInt($("#charge" + GPS_CHARGES).val())))
					gpsCharges			= parseInt($("#charge" + GPS_CHARGES).val());
					
				if(!isNaN(parseInt($("#charge" + TARPULIN_CHARGES).val())))
					tarpulinCharges		= parseInt($("#charge" + TARPULIN_CHARGES).val());	
					
				if(!isNaN(parseInt($("#charge" + PENALTY_CHARGES).val())))
					penaltyCharges		= parseInt($("#charge" + PENALTY_CHARGES).val());
				
				if(!isNaN(parseInt($("#charge" + EXTRA_CHARGE).val())))
					extraCharges		= parseInt($("#charge" + EXTRA_CHARGE).val());
				
				if(!isNaN(parseInt($("#charge" + OVERLOAD_CHARGE).val())))
					overloadCharges		= parseInt($("#charge" + OVERLOAD_CHARGE).val());
				
				if(!isNaN(parseInt($("#charge" + LABOUR_CHARGE).val())))
					labourCharges		= parseInt($("#charge" + LABOUR_CHARGE).val());
				
				if(!isNaN(parseInt($("#charge" + MULTIPLE_POINT).val())))
					multiplePointCharges = parseInt($("#charge" + MULTIPLE_POINT).val());
				
				if(!isNaN(parseInt($("#charge" + HEIGHT_CHARGE).val())))
					heightCharges = parseInt($("#charge" + HEIGHT_CHARGE).val());
					
				if(!isNaN(parseInt($("#charge" + ADDITIONAL_WEIGHT_CHARGE).val())))
					additionaWtCharges = parseInt($("#charge" + ADDITIONAL_WEIGHT_CHARGE).val());
					
				let totalLorryHire	= Math.round(lorryFreight - margin + otherCharges + extraCharges + overloadCharges + labourCharges + multiplePointCharges + heightCharges + additionaWtCharges);
				
				if(vehicleNumberMaster.tdsRate != undefined && vehicleNumberMaster.tdsRate > 0) {
					tds	= (vehicleNumberMaster.tdsRate * totalLorryHire) / 100;
					$("#charge" + TDS).val(Math.round(tds)); 
				}
				
				$("#charge" + TOTAL_LORRY_HIRE).val(totalLorryHire);
				$("#charge" + BALANCE_ADVANCE).val(Math.round(advance - commission - loadingHamali - other));
				$("#charge" + BALANCE_AMOUNT).val(Math.round(totalLorryHire - advance - tds  - incentiveAmt  + gpsCharges + tarpulinCharges + penaltyCharges));
			} else {
				if(!isNaN(parseInt($("#charge" + LORRY_HIRE).val())))
					chargeAmount = parseInt($("#charge" + LORRY_HIRE).val());
				
				let total	= parseInt(chargeAmount);

				$.each(addCharges, function( index, value ) {
					chargeAmount = parseInt(0);
					
					if(!isNaN(parseInt($("#" + value).val())))
						chargeAmount = parseInt($("#" + value).val());
					
					total += parseInt(chargeAmount)
				});

				$.each(subCharges, function( index, value ) {
					chargeAmount = parseInt(0);
					
					if(!isNaN(parseInt($("#" + value).val())))
						chargeAmount = parseInt($("#" + value).val());
					
					total -= parseInt(chargeAmount);
				});
				
				if(lhpvConfiguration.roundOffChargeAmount)
					total = Math.round(total);
				
				if(total >= 0) {
					$("#charge" + BALANCE_AMOUNT).val(total);
					$("#charge" + REFUND_AMOUNT).val(0);
				} else {
					$("#charge" + BALANCE_AMOUNT).val(0);
					$("#charge" + REFUND_AMOUNT).val(Math.abs(total));
				}
				
				if(lhpvConfiguration.showLorryHireModeSelection && Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE
					&& Number($('#charge' + LORRY_HIRE).val()) <= 0) {
					$('#charge' + BALANCE_AMOUNT).val(0);
					calculatedBalanceAmount = 0;
				}
			}
		}, resetTable : function(){
			$('#tableDieselElements tbody').empty();
			return false;
		}, onSaveLHPV : function(response) {
			hideLayer();
			
			let lhpvId						= response.lhpvId;
			let exepenseVoucherDetailsId	= response.exepenseVoucherDetailsId;
			let paymentStatus				= response.paymentStatus;
			let typeOfLhpvId				= response.typeoflhpvforPrint;
			TOKEN_KEY						= response.TOKEN_KEY;
			TOKEN_VALUE						= response.TOKEN_VALUE;

			if (lhpvId != undefined) {
				let MyRouter = new Marionette.AppRouter({});
				
				localStorage.setItem("lsNumbersString", response.lsNumbersString);
				localStorage.setItem("dispatchLedgerIdS", response.dispatchLedgerIdS);
				localStorage.setItem("isLhpvAfterLS", isLhpvAfterLS);
				localStorage.removeItem("branchWiseSplitAmountStr");
				localStorage.removeItem("totalSplitAmount");
				
				MyRouter.navigate('&modulename=lhpvAction&lhpvId='+lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&lhpvNumber='+response.lhpvNumber+'&print=true&paymentStatus='+paymentStatus+'&exepenseVoucherDetailsId='+exepenseVoucherDetailsId+'&paymentVoucherNumber='+response.paymentVoucherNumber,{trigger: true});
				location.reload();
			}

		},appendLHPV : function() {
			let checkBoxArray	= getAllCheckBoxSelectValue('dispatchLedger');
			
			let jsonObject	= new Object();
			jsonObject.operationType			= LHPVConstant.APPEND_ID;
			jsonObject.lhpvType					= $('#lhpvType').val();
			jsonObject.isSeqCounterPresent		= data.isSeqCounterPresent;

			if(checkBoxArray.length > 0)
				jsonObject.dlIdS				= checkBoxArray.join(',');
			else
				jsonObject.dlIdS				= dispatchLedgerIds.join(',');
			
			jsonObject.lhpvId					= localData.lhpvId;
			jsonObject.vehicleNumberMasterId	= localData.vehicleNumberMasterId;
			
			let btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to continue ?",
				modalWidth 	: 	30,
				title		:	'LHPV Append',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/saveLHPV.do?', _this.onAppendLHPV, EXECUTE_WITH_ERROR);
				showLayer();
			});
			
			btModalConfirm.on('cancel', function() {
				hideLayer();
			});
		},onAppendLHPV : function(response){
			hideLayer();
			
			let lhpvId						= response.lhpvId;
			let exepenseVoucherDetailsId	= response.exepenseVoucherDetailsId;
			let typeOfLhpvId	= response.typeoflhpvforPrint;

			if (lhpvId != undefined) {
				let MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=lhpvAction&lhpvId='+lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&lhpvNumber='+response.lhpvNumber+'&print=true&exepenseVoucherDetailsId='+exepenseVoucherDetailsId+'&paymentVoucherNumber='+response.paymentVoucherNumber,{trigger: true});
				location.reload();
			}
		}, onDestinationSubRegionSelect : function(subRegionId) {
			let jsonObject	= new Object();
			
			jsonObject.subRegionSelectEle_primary_key	= subRegionId;
			
			if(lhpvConfiguration.showOperationalBranches && lhpvConfiguration.regionWiseSourceBranchWork && isValueExistInArray(regionIdsArr, executive.regionId))
				getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do?displayOnlyPhysicalBranch=false', _this.setDestinationBranch, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do?', _this.setDestinationBranch, EXECUTE_WITH_ERROR);
		}, onPaymentTypeSelect	: function(_this){
			hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
		}, onPaymentStatusSelect	: function(_this){
			$('#paymentStatus_wrapper').find('div').css('borderColor','lightGray');
			let paymentstatus  = $('#paymentStatus').val();
			
			if(paymentstatus  == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_PARTIAL)
				$('#amountEle').attr('readOnly',false);
			else
				$('#amountEle').attr('readOnly','true');
			
			$('#amountEle').val($("#charge" + ADVANCE_AMOUNT).val());
			
			$(document).ready(function(){
				$("#charge" + ADVANCE_AMOUNT).keyup(function(){
					let lorryhireAmt	= parseInt($("#charge" + LORRY_HIRE).val());
					$('#amountEle').val($("#charge" + ADVANCE_AMOUNT).val());
					
					if(lorryhireAmt < parseInt(this.value)) {
						showMessage('info','You can not enter Advance Amount more than Lorry Hire!');
						$("#charge" + ADVANCE_AMOUNT).val(0);
						$('#amountEle').val(0);
					}
				});
				
				$('#amountEle').keyup(function() {
					if(Number($('#amountEle').val()) > Number($("#charge" + ADVANCE_AMOUNT).val())) {
						showMessage('info','You can not enter amount more than Advance Amount!');
						$('#amountEle').val($("#charge" + ADVANCE_AMOUNT).val());
					}
				});
			});
		}, checkAmountForLhpvSettlement : function() {
			$(document).ready(function() {
				$("#charge" + ADVANCE_AMOUNT).keyup(function() {
					$('#amountEle').val($("#charge" + ADVANCE_AMOUNT).val());
				});
				
				$('#amountEle').keyup(function() {
					if(Number($('#amountEle').val()) > Number($("#charge" + ADVANCE_AMOUNT).val())) {
						showMessage('error','You can not enter amount more than Advance Amount!');
						$('#amountEle').val($("#charge" + ADVANCE_AMOUNT).val());
					}
				});
			});
		}, setDestinationBranch : function(branches) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	branches.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'destinationBranchEle'
			});
		}, onBalancePayeeSubRegionSelect : function(subRegionId) {
			let jsonObject	= new Object();
			jsonObject.subRegionSelectEle_primary_key	= subRegionId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do?', _this.setBalancePayeeBranch, EXECUTE_WITH_ERROR);
		}, setBalancePayeeBranch : function(branches) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	branches.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'balancePayeeBranchEle'
			});
		}, allowTDSAmount : function() {
			let declaration 			= $('#declarationGiven').val();

			if(tdsConfiguration.declarationGiven) {
				if(declaration == LHPVConstant.DECLARATION_GIVEN_YES) {  //	Yes
					$('#charge' + TDS).val(0);
					$('#tdsRateEle_wrapper').attr("disabled", "disabled");
					$('#charge' + TDS).attr("disabled", "disabled");
				} else if(declaration == LHPVConstant.DECLARATION_GIVEN_NO) {	//	No
					$('#charge' + TDS).val(0);
					$('#tdsRateEle_wrapper').removeAttr("disabled");
					$('#charge' + TDS).removeAttr("disabled");
					$('#charge' + TDS).attr('readonly', false);
					
					_this.setDefaultTDSChargeRate();
				} else {
					$('#tdsRateEle_wrapper').attr("disabled", "disabled");
					$('#charge' + TDS).attr("disabled", "disabled");
				}
			}

			_this.calculateBalanceAmount(false);
		}, calculateBalanceAmount : function(flag) {
			let totalAmount				= $('#charge' + LORRY_HIRE).val();
			let hamaliCharge			= 0;
			let otherAdditionalCharges	= 0;
			let detaintionCharges		= 0;
			let advanceAmount			= $('#charge' + ADVANCE_AMOUNT).val();
			let deduction				= 0;
			let tdsAmt 					= 0;
			let isCalculateTDSInPercentage  = false;
			
			if($('#isCharge_' + TDS).exists())
				isCalculateTDSInPercentage  = $('#isCharge_' + TDS).is(":checked");
			
			if ($('#charge' + UNLOADING_LHPV).exists())
				hamaliCharge			= $('#charge' + UNLOADING_LHPV).val();
			
			if ($('#charge' + OTHER_ADDITIONAL).exists())
				otherAdditionalCharges	= $('#charge' + OTHER_ADDITIONAL).val();
			
			if ($('#charge' + DETENTION).exists())
				detaintionCharges		= $('#charge' + DETENTION).val();
			
			if ($('#charge' + DEDUCTION).exists())
				deduction		= $('#charge' + DEDUCTION).val();
			
			totalAmount		= parseInt(totalAmount) + parseInt(hamaliCharge) + parseInt(otherAdditionalCharges) + parseInt(detaintionCharges);
			
			if(totalAmount >= 0) {
				advanceAmount	= parseInt(advanceAmount);
				let deductionAmount	= parseInt(deduction);

				if(deductionAmount > totalAmount) {
					deductionAmount = 0;
					$('#charge' + DEDUCTION).val(deductionAmount);
					showMessage('info','You can not enter Deduction charge more than Balance Amount');
					return false;
				}
				
				totalAmount = totalAmount - deductionAmount;

				if(advanceAmount > totalAmount) {
					advanceAmount = 0;
					$('#charge' + ADVANCE_AMOUNT).val(advanceAmount);
					showMessage('info','You can not enter Advance Amount more than Balance Amount');
					return false;
				}
				
				if(flag || (isCheckboxOptionToAllowTDS && !isCalculateTDSInPercentage)) {
					if ($('#charge' + TDS).exists())
						tdsAmt	= $('#charge' + TDS).val();
				} else {
					tdsAmt = _this.calTDSAmount();
					
					if(lhpvConfiguration.roundOffChargeAmount)
						$('#charge' + TDS).val(Math.round(tdsAmt));
					else
						$('#charge' + TDS).val(tdsAmt);
				}
				
				if(lhpvConfiguration.roundOffChargeAmount)
					$('#charge' + BALANCE_AMOUNT).val(Math.round(totalAmount - advanceAmount - tdsAmt));
				else
					$('#charge' + BALANCE_AMOUNT).val(totalAmount - advanceAmount - tdsAmt);
				
				calculatedBalanceAmount = parseInt($('#charge' + BALANCE_AMOUNT).val());
				
				if(lhpvConfiguration.showLorryHireModeSelection && Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE
					&& Number($('#charge' + LORRY_HIRE).val()) <= 0) {
					$('#charge' + BALANCE_AMOUNT).val(0);
					calculatedBalanceAmount = 0;
				}
			} else {
				$('#charge' + UNLOADING_LHPV).val(0);
				
				totalAmount				= $('#charge' + LORRY_HIRE).val();
				let unloadingCharges	= $('#charge' + UNLOADING_LHPV).val();
				
				if(lhpvConfiguration.roundOffChargeAmount)
					$('#charge' + BALANCE_AMOUNT).val(Math.round(parseInt(totalAmount) + parseInt(unloadingCharges) + parseInt(otherAdditionalCharges) + parseInt(detaintionCharges)));
				else
					$('#charge' + BALANCE_AMOUNT).val(parseInt(totalAmount) + parseInt(unloadingCharges) + parseInt(otherAdditionalCharges) + parseInt(detaintionCharges));
				
				calculatedBalanceAmount = $('#charge' + BALANCE_AMOUNT).val();
				
				if(lhpvConfiguration.showLorryHireModeSelection && Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE
					&& Number($('#charge'+ LORRY_HIRE).val()) <= 0) {
					$('#charge' + BALANCE_AMOUNT).val(0);
					calculatedBalanceAmount = 0;
				}
			}
			
			_this.calculateRefundAmount();
			_this.calculateTotal();
		}, calculateRefundAmount : function() {
			let toPayReceivedAmount	= 0;
			
			if($('#charge' + TOPAY_RECEIVED).exists())
				toPayReceivedAmount	= parseInt($('#charge' + TOPAY_RECEIVED).val());
			
			let refundAmount		= parseInt((calculatedBalanceAmount - toPayReceivedAmount),10);
			
			if(refundAmount < 0) {
				if(lhpvConfiguration.roundOffChargeAmount)
					$('#charge' + REFUND_AMOUNT).val(Math.abs(Math.round(refundAmount)));
				else
					$('#charge' + REFUND_AMOUNT).val(Math.abs(refundAmount));
				
				$('#charge' + BALANCE_AMOUNT).val(0);
			} else {
				$('#charge' + REFUND_AMOUNT).val(0);
				
				if(lhpvConfiguration.roundOffChargeAmount)
					$('#charge' + BALANCE_AMOUNT).val(Math.abs(Math.round(refundAmount)));
				else
					$('#charge' + BALANCE_AMOUNT).val(Math.abs(refundAmount));
			}
			
			$('#charge' + REFUND_AMOUNT).val(0);
		}, calTDSAmount : function() {
			if(!tdsConfiguration.IsTdsAllow)
				return 0;
			
			if(tdsConfiguration.declarationGiven) {
				let declaration		= $('#declarationGiven').val();
				
				if(declaration == LHPVConstant.DECLARATION_GIVEN_NO)
					return _this.calculateTDSInPercentage();
			} else
				return _this.calculateTDSInPercentage();
			
			return 0;
		}, isFloat : function(num) {
			return (num % 1 !== 0);
		}, calculateTDSInPercentage : function() {
			let tdsRate			= 0;
			let tdsAmt			= 0;
			
			if($('#tdsRateEle').val() > 0)
				tdsRate			= $('#tdsRateEle').val();
			else if($('#charge_' + TDS).val() > 0)
				tdsRate			= Number($('#charge_' + TDS).val());
				
			let totalAmt		= 0;
			
			if(tdsConfiguration.calculateTdsOnSelectedCharges) {
				let chargeList	= (tdsConfiguration.chargesToCalculateTDS).split(",");
				
				for(const charge of chargeList) {
					totalAmt	+= parseInt($('#charge' + charge).val()) || 0;
				}
			} else
				totalAmt	= parseInt($('#charge' + LORRY_HIRE).val());

			tdsOnAmount		= totalAmt;
			
			if(_this.isFloat(tdsRate)) {
				tdsAmt		= (totalAmt * tdsRate) / 100;
				tdsAmt		= tdsAmt.toFixed(2);
			} else
				tdsAmt		= Math.round((totalAmt * tdsRate) / 100);
			
			if(tdsAmt == 0 && $('#charge' + TDS).val() > 0)
				 tdsAmt = $('#charge' + TDS).val();
				 
			if(!_this.isVehicleOwnerForTds()) 
				tdsAmt = 0;

			return tdsAmt;
		}, checkCalculateTDSInPercentage : function(){
			let isCalculateTDSInPercentage  = $('#isCharge_' + TDS).is(":checked");
			let tdsINPercentage 			= Number($('#charge_' + TDS).val());
			
			if(isCalculateTDSInPercentage) {
				if(tdsINPercentage == 0  ) {
					showMessage('warning', 'TDS % is not Calculate on '+tdsINPercentage);
					return false;
				}
				
				if(tdsINPercentage > 100) {
					$('#charge_' + TDS).val(0)
					showMessage('warning', 'TDS % should not greater than ' + tdsINPercentage);
					return false;
				}
			}
			
			return true;
		}, checkTDSAmount : function() {
			let declarationGiven = $('#declarationGiven').val();
			let tdsAmount = $('#charge' + TDS).val();
			
			if(declarationGiven != '' && declarationGiven == LHPVConstant.DECLARATION_GIVEN_NO && tdsAmount == 0 && _this.isVehicleOwnerForTds())
				alert('Declaration Form is Not Given & You did TDS Amount 0');
						
			return true;
		}, allowAlphaNumericAndSpecialCharacters : function(evt, elementId) {
			let returnType		= true;
			let specialChars	= (allowedSpecialCharacters).split(",");

			let keynum 	= null;

			if(window.event) // IE
				keynum = evt.keyCode || evt.charCode;
			else if(evt.which) // Netscape/Firefox/Opera
				keynum = evt.which;

			let charStr = String.fromCharCode(keynum);
			
			if(keynum != null) {
				if(keynum == 8 || keynum == 13) {
					hideAllMessages();
					return returnType;
				} 
				
				if (/[a-zA-Z]/i.test(charStr) || keynum < 48 || keynum > 57 ) {
					if(/[a-zA-Z]/i.test(charStr) || isValueExistInArray(specialChars, Number(keynum))) {//calling from genericfunctions.js
						hideAllMessages();
						return returnType;
					}
					
					showMessage('warning', 'No other Character Allowed !');
					$('#' + elementId).val($('#' + elementId).val().substring(0, $('#' + elementId).val().length - 1));
					$('#' + elementId).focus();
					returnType = false;
				}
			}
			
			if(!returnType)
				return false;
		}, allowAlphaNumericOnly : function(evt, elementId) {

		    let key = evt.which || evt.keyCode;
		    let charStr = String.fromCharCode(key);

		    if (key === 8 || key === 13) {
		        hideAllMessages();
		        return true;
		    }

		    if (!/^[a-zA-Z0-9]$/.test(charStr)) {
		        showMessage('warning', 'Only alphanumeric characters allowed!');
		        $('#' + elementId).focus();
		        return false;
		    }

		    hideAllMessages();
		    return true;
		}, checkSameLsNumber : function(lsNumber, newDispatchLedgerId) {
			let preDispatchLedgerId	= $('#dispatchLedger_' + newDispatchLedgerId).val();
			
			if(newDispatchLedgerId == preDispatchLedgerId) {
				showMessage('info', lsNumberAlreadyAddedInfoMsg(lsNumber));
				return false;
			}
			
			return true;
		}, checkSameVehicleNumber : function(lsNumber, vehicleNumberMasterId) {
			if(vehcileNumberArr != null && vehcileNumberArr.length > 0) {
				for(const element of vehcileNumberArr) {
					if(vehicleNumberMasterId != element.vehicleNumberId) {
						showMessage('info', lsNumberSameInVehicleNumberInfoMsg(lsNumber, element.vehicleNumber));
						return false;
					}
				}
			}
			
			return true;
		}, getDriverMasterDetails : function(response){
			let jsonObject = new Object();
			jsonObject.driverMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/driverWS/getDriverDetailsById.do', _this.setDriverContactNumberData, EXECUTE_WITHOUT_ERROR);
		}, setDriverContactNumberData : function (response) {
			if(response.DriverMaster)
				$("#driverContactEle").val(response.DriverMaster.mobileNumber);
		}, reCalculateAdvanceAmount : function(dispatchLedgerId, topayGrandTotalAmount) {
			if(lhpvConfiguration.CalculateAdvanceFromTruckDlyTopayLR) {
				if($("#dispatchLedger_" + dispatchLedgerId).is(":checked")) {
					$("#charge" + ADVANCE_AMOUNT).val(Number($("#charge" + ADVANCE_AMOUNT).val()) + Number(topayGrandTotalAmount));
					$("#charge" + ADVANCE_AMOUNT).attr('readonly', 'readonly');
				} else {
					$("#charge" + ADVANCE_AMOUNT).val(Number($("#charge" + ADVANCE_AMOUNT).val()) - Number(topayGrandTotalAmount));
					$("#charge" + ADVANCE_AMOUNT).attr('readonly', 'readonly');
				}
			}
		}, validateOpeningKM : function() {
			return Number($('#lorryHireModeEle').val()) != LHPVConstant.LORRY_HIRE_MODE_KM_WISE
				|| validateInputTextFeild(1, 'openingKMEle', 'openingKMEle', 'error', 'Please Enter Opening KM !');
		}, validateRatePerKM : function() {
			return Number($('#lorryHireModeEle').val()) != LHPVConstant.LORRY_HIRE_MODE_KM_WISE
				|| validateInputTextFeild(1, 'charge' + RATE_PER_KM, 'charge' + RATE_PER_KM, 'error', 'Please Enter Rate Per KM !');
		}, validateLorryHireAmount : function() {
			return Number($('#lorryHireModeEle').val()) != LHPVConstant.LORRY_HIRE_MODE_TRIP_WISE
				|| validateInputTextFeild(1, 'charge' + LORRY_HIRE, 'charge' + LORRY_HIRE, 'error', 'Please Enter Lorry Hire !');
		}, openSplitDiesel : function() {
			$("#splitDieselDataDetailPanel").modal({
				backdrop : 'static',
				keyboard : false
			});

			setTimeout(function() {
				let dieselTotalAmount 	= $('#charge' + DIESEL).val();
				let dieselBalanceAmount	= dieselTotalAmount;

				if($('#charge' + DIESEL).val() > 0)
					dieselBalanceAmount	= $('#charge' + DIESEL).val();

				$('#dieselTotalAmount').val(dieselTotalAmount);
				$('#dieselBalanceAmt').val(dieselBalanceAmount);
			}, 500);

			if(showLiterAmout) {
				$("#literDiv").removeClass('hide');
				$("#literHeader").removeClass('hide');
			} else {
				$("#literDiv").addClass('hide');
				$("#literHeader").addClass('hide');
			}
			
			if(showPerLiterRateAmount) {
				$("#perLiterRateDiv").removeClass('hide');
				$("#perLiterRateHeader").removeClass('hide');
			} else {
				$("#perLiterRateDiv").addClass('hide');
				$("#perLiterRateHeader").addClass('hide');
			}
		}, splitDieselAmount : function() {
			let fuelPumpId = $('#fuelPumpEle_primary_key').val();
			
			if($("#row_" + fuelPumpId).exists()) {
				showMessage('error','Please enter a new Pump');
				return false;
			}
			
			let amount	= $("#dieselAmounts").val();
			
			if(amount == '' || amount == 0) {
				showMessage('error',iconForErrMsg + ' Please Enter Amount');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}
			
			if(fuelPumpId == '' || fuelPumpId == 0) {
				showMessage('error',iconForErrMsg + ' Please Enter Pump Name');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}
			
			if($('#dieselBalanceAmt').val() == 0) {
				showMessage('info','Balance Amount is Zero');
				return false;
			}
			
			if(Number($('#dieselAmounts').val()) > Number($('#dieselBalanceAmt').val())) {
				showMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				return false;
			}
			
			if(!showMultipleAddInDieselDetails)
				$("#dieselDeductPayment").attr("disabled", $('#tableDieselElements tr').length == 2);
			
			_this.createDieselAmountTable(fuelPumpId, amount);

			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');
		}, createDieselAmountTable : function(fuelPumpId, amount) {
			let pumpName 		= $('#fuelPumpEle').val();
			let liter			= 0;
			let perLiterRate	= 0;
			
			if($('#liter').exists())
				liter 		= $('#liter').val();
			
			if($('#perLiterRate').exists())
				perLiterRate 		= $('#perLiterRate').val();
			
			let columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center;'>" + pumpName + "</td>");
			columnArray.push("<td style='text-align: center;' id = 'amount_" + fuelPumpId + "'>" + amount + "</td>");
			
			if(showLiterAmout) {
				if(liter != '' && typeof liter !== 'undefined')
					columnArray.push("<td style='text-align: center;' id = 'liter_" + fuelPumpId + "'>" + liter + "</td>");
				else
					columnArray.push("<td style='text-align: center;'>--</td>");
			}
			
			if(showPerLiterRateAmount) {
				if(perLiterRate != '' && typeof perLiterRate !== 'undefined')
					columnArray.push("<td style='text-align: center;' id = 'perLiterRate_" + fuelPumpId + "'>" + perLiterRate + "</td>");
				else
					columnArray.push("<td style='text-align: center;'>--</td>");
			}

			columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
			
			$('#tableDieselElements tbody').append("<tr id='row_" + fuelPumpId + "'>" + columnArray.join(' ') + "</tr>");
			
			$('#dieselBalanceAmt').val(Number($('#dieselBalanceAmt').val()) - Number(amount));

			$("#removeRowElement_" + fuelPumpId).bind("click", function() {
				let elementId		= $(this).attr('id');
				let fuelPumpId		= elementId.split('_')[1];
				
				if(!showMultipleAddInDieselDetails)
					$("#dieselDeductPayment").attr("disabled", $('#tableDieselElements tr').length == 2);
					
				_this.deletePumpWiseRow(fuelPumpId);
			});
		}, deletePumpWiseRow : function(fuelPumpId) {
			if(confirm("Are you sure to delete?")) {
				$('#dieselBalanceAmt').val(Number($("#dieselBalanceAmt").val()) + Number($("#amount_" + fuelPumpId).html()));
				$("#row_" + fuelPumpId).remove();
			}

			if($('#tableDieselElements tbody tr').length <= 0 && chargemasterIds) {
				for(const element of chargemasterIds) {
					if(element != BALANCE_AMOUNT)
						$('#charge' + element).attr('readonly', false);
				}
			}
		}, onSaveDieselPaymentDetails : function() {
			if(chargemasterIds) {
				for(const element of chargemasterIds) {
					if(element == DIESEL)
						$('#charge' + element).attr('readonly', false);
				}
			}
			
			$("#tableDieselElements tbody tr").each(function () {
				let elementId		= $(this).attr('id');
				let fuelPumpId		= elementId.split('_')[1];
				
				let splitDiesel 			= new Object();

				splitDiesel.fuelPumpId		= Number(fuelPumpId);
				splitDiesel.dieselAmount	= Number($("#amount_" + fuelPumpId).html());
				splitDiesel.liter			= Number($("#liter_" + fuelPumpId).html());
				splitDiesel.perLiterRate	= Number($("#perLiterRate_" + fuelPumpId).html());
				dieselWiseSplitAmtList.push(splitDiesel);
			})
			
			$("#splitDieselDataDetailPanel").modal('hide');
		}, calculateLiterAmount : function(){
			setTimeout(() => {
				let liter 		  = Number($('#liter').val());
				let dieselAmounts = Number($('#dieselAmounts').val());
				
				if(liter > 0 && dieselAmounts > 0)
					$("#perLiterRate").val((dieselAmounts / liter).toFixed(2));
				else
					$("#perLiterRate").val('');
			}, 100);
		}, calculateLorryHireOnPerTonAmount : function() {
			let noOfTons 			= Number($("#weighBridgeEle").val());
			let perTonAmount 		= Number($("#charge" + PER_TON_AMOUNT).val());
							
			if(noOfTons > 0 && perTonAmount > 0)
				$("#charge" + LORRY_HIRE).val(Math.round(noOfTons * perTonAmount));
		}, calculateTotalLSWeight : function(totalWeight) {
			if(lhpvConfiguration.showLsWeight) {
				$("#lsWeightEle").val(totalWeight);
				_this.calculateAdditonalWeight();
			}
		}, calculateAdditonalWeight : function () {
			let passingWeightEle	= 0;
			
			if($("#passingWeightEle").val() != '' && $("#passingWeightEle").val() != undefined)
				passingWeightEle	= $("#passingWeightEle").val();
				
			$("#additionalWeightEle").val(Number($("#lsWeightEle").val()) - Number(passingWeightEle));
			
			if(!lhpvConfiguration.enableAdditionalWeightCharge)
				_this.calculateAdditionWeightCharge();
		}, calculateAdditionWeightCharge: function () { 
			$("#charge" + ADDITIONAL_WEIGHT_CHARGE).val(Math.round(Number($("#additionalWeightEle").val()) * lhpvConfiguration.additionalWeightChargeRate));
			$("#charge" + ADDITIONAL_WEIGHT_CHARGE).attr('readonly', 'readonly');
				
			_this.calculateTotalLorryHire();
		}, calculateTotalLorryHire : function () {
			$("#charge" + TOTAL_LORRY_HIRE).val(Number($("#charge" + LORRY_HIRE).val()) + Number($("#charge" + ADDITIONAL_WEIGHT_CHARGE).val()));
			$("#charge" + TOTAL_LORRY_HIRE).attr('readonly', 'readonly');
		}, resetAdditionalWeightFields : function() {
			$("#lsWeightEle").val(0);
			$("#additionalWeightEle").val(0);
			$("#charge" + ADDITIONAL_WEIGHT_CHARGE).val(0);
			$("#charge" + TOTAL_LORRY_HIRE).val(0);
		}, validateLorryHireWithAdvanceAmount : function() {
			let advanceAmount 		= $("#charge" + ADVANCE_AMOUNT).val();
			let lorryHireAmount 	= $("#charge" + LORRY_HIRE).val();
			let allowedPercent 		= lhpvConfiguration.percentageOfLorryHireToValidateWithAdvanceAmount;
			let percentOfLorryHire 	= Math.round((lorryHireAmount * allowedPercent) / 100);
			
			if(advanceAmount > Math.round(percentOfLorryHire)) {
				$("#charge" + ADVANCE_AMOUNT).val(0);
				$("#charge" + ADVANCE_AMOUNT).focus();
				$("#charge" + BALANCE_AMOUNT).val(lorryHireAmount);
				showAlertMessage('error', 'Advance Amount cannot Be Greater Than ' + allowedPercent + '% of Lorry Hire Amount');
			}
		}, validateLorryHireWithBasicFreight : function() {
			let checkBoxArray	= getAllCheckBoxSelectValue('dispatchLedger');
			
			if (checkBoxArray.length === 0) {
				$("#charge" + LORRY_HIRE).val(0);
				$("#charge" + BALANCE_AMOUNT).val(0);
				showAlertMessage('error', 'Provide select atleast one LS !');
				return;
			}
			
			let lorryHireAmount = $("#charge" + LORRY_HIRE).val();
			
			if(lorryHireAmount >= totalBasicFreight) {
				$("#charge" + LORRY_HIRE).val(0);
				$("#charge" + LORRY_HIRE).focus();
				$("#charge" + BALANCE_AMOUNT).val(0);
				showAlertMessage('error', 'Lorry Hire Amount Should Be Less From Freight Amount ' + totalBasicFreight);
			}
		}, validatePassingWeight : function() {
			if (!lhpvConfiguration.validatePassingWeight) 
				return true;;
			
			let checkBoxArray	= getAllCheckBoxSelectValue('dispatchLedger');

			if(checkBoxArray.length <= 0) {
				showAlertMessage('error', 'Provide select atleast one LS !');
				return false;
			}
				
			let	minimumAllowedPassingWeight		= lhpvConfiguration.minimumAllowedPassingWeight;

			let passingWeightEle	= 0;
			
			if($("#passingWeightEle").val() != '' && $("#passingWeightEle").val() != undefined)
				passingWeightEle	= $("#passingWeightEle").val();

			if (parseFloat(passingWeightEle) < parseFloat(minimumAllowedPassingWeight)) {
				$("#passingWeightEle").val('0');
				$("#passingWeightEle").focus();
				$("#additionalWeightEle").val(0);
				$("#charge" + ADDITIONAL_WEIGHT_CHARGE).val(0);
				$("#charge" + TOTAL_LORRY_HIRE).val(0);
				showAlertMessage('error', 'Please enter passing weight greater than ' + minimumAllowedPassingWeight);
				return false;
			}

			return true;
		}, getSourceDestinationBranchWiseLHPVSequenceCounter : function() {
			if(lhpvConfiguration.srcDestWiseSeqCounter) {
				showLayer();
				let jsonObject			= new Object();

				jsonObject["truckDestinationId"] 		= $('#destinationBranchEle').val();
				
				if ($('#isManualLHPV').is(':checked')) {
					jsonObject["isManualLHPV"]			= $('#isManualLHPV').is(':checked');
					jsonObject["manualLHPVNumber"]		= $('#manualLHPVNumber').val();
				}
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/getSourceDestinationWiseLHPVequenceCounter.do?', function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					} 
				}, EXECUTE_WITHOUT_ERROR);
							
				hideLayer();
			}
		}, validatePaymentTypeAndPaymentStatusOnAdvanceAmount: function() {
			let advanceAmt = Number($('#charge' + ADVANCE_AMOUNT).val());
			
			if (advanceAmt > 0) {
				_this.validatePaymentTypeAndPaymentStatus();
			} else {
				lhpvNodCheck.remove("#paymentType_wrapper");
				lhpvNodCheck.remove("#paymentStatus_wrapper");
				$("#paymentType_wrapper, #paymentStatus_wrapper").removeClass('error-boder');
				$("#paymentMode").find('label b').remove();
				$("#paymentStatusEle").find('label b').remove();
			}
		}, validatePaymentTypeAndPaymentStatus: function() {
			if ($("#paymentMode").find('label b').length == 0)
				$("#paymentMode").find('label').append('<b style="color: red; font-size: 20px;">*</b>');
			
			if ($("#paymentStatusEle").find('label b').length == 0)
				$("#paymentStatusEle").find('label').append('<b style="color: red; font-size: 20px;">*</b>');

			lhpvNodCheck.add({
				selector: "#paymentType_wrapper",
				validate: "validateAutocomplete:#paymentType",
				errorMessage: "Please Select Payment Type"
			});

			lhpvNodCheck.add({
				selector: "#paymentStatus_wrapper",
				validate: "validateAutocomplete:#paymentStatus",
				errorMessage: "Please Select Payment Status"
			});
		}, validateDriverNameOnVehicleOnwerTypeWise: function() {
			if (typeof vehicleNumberMaster !== 'undefined') {
				if (lhpvConfiguration.vehicleOwnerTypeForValidateDriverName.split(',').map(Number).includes(vehicleNumberMaster.vehicleOwner)) {
					$("#driverName").find('label').append('<b style="color: red; font-size: 20px;">*</b>');
					_this.validateDriverName();
				}
			}
		}, validateDriverName: function() {
			lhpvNodCheck.add({
				selector: "#driverNameEle",
				validate: "presence",
				errorMessage: "Enter Or Select Driver Name"
			});
		}, setDefaultTDSChargeRate: function() {
			if(!tdsConfiguration.isTDSMandatoryWithoutDeclaration)
				return;

			let declaration = $('#declarationGiven').val();
			let defaultTDSChargeInPercent = tdsConfiguration.defaultTDSChargeInPercent;

			if (declaration == LHPVConstant.DECLARATION_GIVEN_NO) {
				let selectize = null;

				if ($('#tdsRateEle').length > 0)
					selectize = $('#tdsRateEle')[0].selectize;
						
				if (!selectize) return;

				let currentValue = selectize.getValue();
				let isValid = tdsChargesList.some(item => item.tdsChargeId == currentValue);
						
				if (!isValid || currentValue == "" || currentValue == "0") {
					let exists = tdsChargesList.some(item => item.tdsChargeId == defaultTDSChargeInPercent);
							
					if (exists)
						selectize.setValue(defaultTDSChargeInPercent);
					else if (tdsChargesList.length > 0)
						selectize.setValue(tdsChargesList[0].tdsChargeId);
				}

				selectize.settings.allowEmptyOption = false;

				selectize.off('change.enforceDefault');
				selectize.on('change.enforceDefault', function(value) {
					if (value === "" || value === "0" || !tdsChargesList.some(item => item.tdsChargeId == value)) {
						let exists = tdsChargesList.some(item => item.tdsChargeId == defaultTDSChargeInPercent);
								
						if (exists)
							selectize.setValue(defaultTDSChargeInPercent);
						else
							selectize.setValue(tdsChargesList[0].tdsChargeId);
					}
				});
				
				$("#charge" + TDS).prop("readonly", true);
			}
		}, isVehicleOwnerForTds : function() {
			if(!tdsConfiguration.calculateTdsOnVehicleOwnerType)
				return true;
			
			return isValueExistInArray((tdsConfiguration.vehicleOwnerTypeToCalculateTds).split(','), vehicleNumberMaster.vehicleOwner)
		}
	}
});
