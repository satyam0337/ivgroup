var configuration				= null;
var showVehicleAgentColumn		= false;
var executive					= null;
var showFcValidityField			= false;
var accountGroupId				= 0;
var customVehicleFormatAllowed	= false;
var isAllowToEnterIDProof	= false;
var maxFileSizeToAllow	= 0;
var idProofConstantArr	= null;
var displayMsg	= null;
var isPanCardExists				= false;
var isRCBookExists				= false;
var doNotResetOwnerDetails		= false;
var agentsForGroup				= null;
var isAllowToUploadPdf			= false;
var noOfFileToUpload			= 1;
var tdsConfiguration			= null;
var tdsChargeList				= null;
var vehicleOwnerTypeValue       = 0;
var fieldLableConfigurationMappings  = null;

function loadVehicleNumber() {
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleNumberMasterWS/loadCreateVehicle.do',
		data		: '',
		dataType	: 'json',
		success: function(data) {
			configuration				= data;
			executive					= data.executive;
			showVehicleAgentColumn		= data.showVehicleAgentColumn;
			showFcValidityField			= data.showFcValidityField;
			accountGroupId				= data.accountGroupId;
			customVehicleFormatAllowed	= data.customVehicleFormatAllowed;
			isAllowToEnterIDProof		= data.idProofEntryALlow;
			maxFileSizeToAllow			= data.maxFileSizeToAllow;
			idProofConstantArr			= data.idProofConstantArr;
			doNotResetOwnerDetails		= data.doNotResetOwnerDetails;
			agentsForGroup				= data.agentsForGroup;
			noOfFileToUpload			= data.noOfPDFToUpload;
			isAllowToUploadPdf			= data.isAllowToUploadPdf;

			tdsConfiguration			= data.tdsConfiguration;
			tdsChargeList				= data.tdsChargeList;
			
			initCalenderValidation('Default');
			setAgentList();
			setVehicleOwnerList(data.vehicleOwnerList);
			setVehicleTypeList(data.vehicleTypeForGroup);
			setRegionList(data.regionForGroup);
			
			if(!isAllowToEnterIDProof) {
				$( "#idProofModal" ).remove();
				$( "#addedIDProofModal" ).remove();
				$( "#openIdProofModel" ).remove();
				$( "#viewIDProofDetails" ).remove();
				$( "#idProofDocumentRow" ).remove();
			} else
				$('#idProofDocumentRow').removeClass('hide');
				
			if(isAllowToUploadPdf) {
				$('#idPDFRow').removeClass('hide');
			} else {
				$( "#modalForOpenPdf" ).remove();
				$( "#addedModalForOpenPdf" ).remove();
				$( "#openPdfModel" ).remove();
				$( "#viewIDPDFDetails" ).remove();
				$( "#idPDFRow" ).remove();
			}
			
			if(configuration.showVehicleOwnerColumn) {
				$( "#vehicleOwnerRow" ).removeClass('hide');
				$( "#vehicleOwnerCol" ).remove();
			} else
				$( "#vehicleOwnerRow" ).remove();
				
			if(!configuration.showGPSConfiguredColumn)
				$( "#gpsConfiguredRow" ).remove();
			else
				$( "#gpsConfiguredRow" ).removeClass('hide');
				
			if(!configuration.showVehicleAgentColumn)
				$( "#vehicleAgentRow" ).remove();
			else
				$( "#vehicleAgentRow" ).removeClass('hide');
				
			if(!configuration.showFcValidityField)
				$( "#fcValidityRow" ).remove();
			else
				$( "#fcValidityRow" ).removeClass('hide');
				
			if(!configuration.showRemarkField)
				$( "#remarkRow" ).remove();
			else
				$( "#remarkRow" ).removeClass('hide');
				
			if(!configuration.showMaxFuelEntryField)
				$( "#maxFuelRow" ).remove();
			else
				$( "#maxFuelRow" ).removeClass('hide');
				
			if(!configuration.showThappiWeight)
				$( "#thappiWeightRow" ).remove();
			else
				$( "#thappiWeightRow" ).removeClass('hide');
				
			if(!configuration.showVehicleCommission)
				$( "#vehicleCommissionRow" ).remove();
			else {
				$( "#vehicleCommissionRow" ).removeClass('hide');
				$( "#commissionColumnName" ).html('<label>' + data.commissionColumnName + '</label>');
			}
			
			if(!configuration.showDeviceIdTextField)
				$( "#deviceIdRow" ).remove();
			else
				$( "#deviceIdRow" ).removeClass('hide');
				
			if(!configuration.showBanKDetailsFields) {
				$( "#bankNameRow" ).remove();
				$( "#accountNoRow" ).remove();
				$( "#ifscCodeRow" ).remove();
				$( "#bankBranchRow" ).remove();
			} else {
				$( "#bankNameRow" ).removeClass('hide');
				$( "#accountNoRow" ).removeClass('hide');
				$( "#ifscCodeRow" ).removeClass('hide');
				$( "#bankBranchRow" ).removeClass('hide');
			}
			
			if(configuration.showRatePerKM)
				$( "#ratePerKMRow" ).removeClass('hide');
			else
				$( "#ratePerKMRow" ).remove();
				
			if(configuration.showRegisterDate)
				$( "#regdDateRowId" ).removeClass('hide');
			else
				$( "#regdDateRowId" ).remove();
			if(configuration.showRegisterAtRTO)
				$( "#registeredAtRTORowId" ).removeClass('hide');
			else
				$( "#registeredAtRTORowId" ).remove();
			if(configuration.showModel)
				$( "#modelRowId" ).removeClass('hide');
			else
				$( "#modelRowId" ).remove();
			if(configuration.showRouteType)
				$( "#routeTypeRowId" ).removeClass('hide');
			else
				$( "#routeTypeRowId" ).remove();
			if(configuration.showAverage)
				$( "#averageRowId" ).removeClass('hide');
			else
				$( "#averageRowId" ).remove();
			if(configuration.showMake)
				$( "#makeRowId" ).removeClass('hide');
			else
				$( "#makeRowId" ).remove();
			if(configuration.showGrossWgt)
				$( "#grossWgtRowId" ).removeClass('hide');
			else
				$( "#grossWgtRowId" ).remove();
			if(configuration.showUnLadenWgt)
				$( "#unLadenWgtRowId" ).removeClass('hide');
			else
				$( "#unLadenWgtRowId" ).remove();
			if(configuration.showLoadCapacity)
				$( "#loadCapacityRowId" ).removeClass('hide');
			else
				$( "#loadCapacityRowId" ).remove();
			if(configuration.showFinanceHP)
				$( "#financeHPRowId" ).removeClass('hide');
			else
				$( "#financeHPRowId" ).remove();
			if(configuration.showHPValidUpto)
				$( "#hpValidityRowId" ).removeClass('hide');
			else
				$( "#hpValidityRowId" ).remove();
			if(configuration.showTCPaidUpto)
				$( "#tcPaidUptoRowId" ).removeClass('hide');
			else
				$( "#tcPaidUptoRowId" ).remove();
			if(configuration.showForm15HSubmitted)
				$( "#form15HSubmittedRowId" ).removeClass('hide');
			else
				$( "#form15HSubmittedRowId" ).remove();
			if(configuration.showAllotedRegion)
				$( "#allotedRegionRowId" ).removeClass('hide');
			else
				$( "#allotedRegionRowId" ).remove();
			if(configuration.showAllotedSubRegion)
				$( "#allotedSubRegionRowId" ).removeClass('hide');
			else
				$( "#allotedSubRegionRowId" ).remove();
			if(configuration.showAllotedBranch)
				$( "#allotedBranchRowId" ).removeClass('hide');
			else
				$( "#allotedBranchRowId" ).remove();
			if(configuration.showNoOfTyres)
				$( "#noOfTyresRowId" ).removeClass('hide');
			else
				$( "#noOfTyresRowId" ).remove();
			if(configuration.showMfdDate)
				$( "#mfdDateRowId" ).removeClass('hide');
			else
				$( "#mfdDateRowId" ).remove();
			if(configuration.showPassingDate)
				$( "#passingDateRowId" ).removeClass('hide');
			else
				$( "#passingDateRowId" ).remove();
			if(configuration.showPassingAt)
				$( "#passingAtRowId" ).removeClass('hide');
			else
				$( "#passingAtRowId" ).remove();
			if(configuration.showStartKM)
				$( "#startKMRowId" ).removeClass('hide');
			else
				$( "#startKMRowId" ).remove();
			if(configuration.showSignBy)
				$( "#signByRowId" ).removeClass('hide');
			else
				$( "#signByRowId" ).remove();
			if(configuration.showBodyType)
				$( "#bodyTypeRowId" ).removeClass('hide');
			else
				$( "#bodyTypeRowId" ).remove();
			if(configuration.showValidity)
				$( "#validityRow" ).removeClass('hide');
			else
				$( "#validityRow" ).remove();
			if(configuration.showAadharPanLink)
				$( "#aadharPanLinkRowId" ).removeClass('hide');
			else
				$( "#aadharPanLinkRowId" ).remove();
			if(configuration.showPermitNumber)
				$( "#permitNumberRowId" ).removeClass('hide');
			else
				$( "#permitNumberRowId" ).remove();
			if(configuration.showPermitDate)
				$( "#permitDateRowId" ).removeClass('hide');
			else
				$( "#permitDateRowId" ).remove();
			
			if(tdsConfiguration.IsTdsAllow) {
				$( "#tdsInPercentRow" ).removeClass('hide');
				
				if(tdsChargeList != undefined) {
					setTDSChargeInPercentList();
					$( "#tdsAmountRow" ).remove();
				} else {
					$( "#tdsAmountRow" ).removeClass('hide');
					$( "#tdsInPercentRow" ).remove();
				}
			} else {
				$( "#tdsAmountRow" ).remove();
				$( "#tdsInPercentRow" ).remove();
			}
			if(configuration.showRcValidityField)
				$( "#rcValidityRow" ).removeClass('hide');
			else
				$( "#rcValidityRow" ).remove();
			
			
			if(data.tdsOwnerTypeList != undefined)
				setTDSOwnerTypeList(data.tdsOwnerTypeList);
				
			document.getElementById('searchVehicle').focus();
			
			$('#grossWgt').bind("keypress", function(event) {
				if(configuration.allowToEnterGrossWeightInDecimal)
					return validateFloatKeyPress(event, this);
				else
					return noNumbers(event);
			});
			
			$('#thappiWeight').bind("keypress", function(event) {
				return validateFloatKeyPress(event, this);
			});
			
			$('#unLadenWgt').bind("keypress", function(event) {
				if(configuration.allowToEnterUnLadenWeightInDecimal)
					return validateFloatKeyPress(event, this);
				else
					return noNumbers(event);
			});
			
			$('#loadCapacity').bind("keypress", function(event) {
				if(configuration.allowToEnterLoadCapacityInDecimal)
					return validateFloatKeyPress(event, this);
				else
					return noNumbers(event);
			});
			
			if(configuration.appendAutoHyphenInVehicalNumberFeild) {
				$('#vehicleNo').bind("keyup", function(event) {
					setVehicleNumberHyphen(event);
					return noSpclCharsExcludingDash(event);
				});
			} else {
				$('#vehicleNo').bind("keypress", function(event) {
					return noSpclCharsExcludingDash(event);
				});
			}

			if(configuration.addDocumentInformation)
				$('#vehicleDocumentReceivedRow').removeClass('hide');
			else {
				$('#documentReceivedDateRow').remove();
				$('#documentFileNoRow').remove();
				$('#vehicleDocumentReceivedRow').remove();
			}
			
			if(configuration.showTdsDeductible)
				$('#tdsDeductibleRow').removeClass('hide');
			else
				$('#tdsDeductibleRow').remove();
				
			if(configuration.showIsSpecified)
				$('#isSpecifiedRow').removeClass('hide');
			else
				$('#isSpecifiedRow').remove();
			
			if(configuration.showOwnerType)
				$('#ownerTypeRowId').removeClass('hide');
			else
				$('#ownerTypeRowId').remove();
				
			if(configuration.registeredOwnerFieldMandotory) $("#regdOwnerRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.showInsuranceRelatedFieldMandotory) $("#insuranceNameRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.showInsuranceRelatedFieldMandotory) $("#policyNoRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.showInsuranceRelatedFieldMandotory && configuration.showValidity) $("#validityRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.engineNumberFieldMandotory) $("#engineNoRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.chasisNumberFieldMandotory) $("#chasisNoRow").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			if(configuration.validatePanNumber || configuration.validateHiredVehiclePanNumber ||configuration.validateAttachedVehiclePanNumber) $("#panNumberROW").find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');

			 fieldLableConfigurationMappings = [
				{ selector: "#regdOwnerRow", condition: configuration.vehicleOwnerTypeForValidateRegdOwner },
				{ selector: "#regdOwnerContactNoRow", condition: configuration.vehicleOwnerTypeForValidateRegisteredOwnerContactNumber },
				{ selector: "#regdOwnerAddressRow", condition: configuration.vehicleOwnerTypeForValidateRegisteredOwnerAddress },
				{ selector: "#regdDateRowId", condition: configuration.vehicleOwnerTypeForValidateRegisteredDate },
				{ selector: "#registeredAtRTORowId", condition: configuration.vehicleOwnerTypeForValidateRegisteredAtRTO },
				{ selector: "#modelRowId", condition: configuration.vehicleOwnerTypeForValidateModel },
				{ selector: "#insuranceNameRow", condition: configuration.vehicleOwnerTypeForValidateInsuranceName },
				{ selector: "#policyNoRow", condition: configuration.vehicleOwnerTypeForValidatePolicyNumber },
				{ selector: "#validityRow", condition: configuration.vehicleOwnerTypeForValidatePolicyValidityDate },
				{ selector: "#averageRowId", condition: configuration.vehicleOwnerTypeForValidateAverage },
				{ selector: "#makeRowId", condition: configuration.vehicleOwnerTypeForValidateMake },
				{ selector: "#engineNoRow", condition: configuration.vehicleOwnerTypeForValidateEngineNumber },
				{ selector: "#chasisNoRow", condition: configuration.vehicleOwnerTypeForValidateChasisNumber },
				{ selector: "#grossWgtRowId", condition: configuration.vehicleOwnerTypeForValidateGrossWgt },
				{ selector: "#unLadenWgtRowId", condition: configuration.vehicleOwnerTypeForValidateUnLadenWgt },
				{ selector: "#loadCapacityRowId", condition: configuration.vehicleOwnerTypeForValidateLoadCapacity },
				{ selector: "#thappiWeightRow", condition: configuration.vehicleOwnerTypeForValidateThappiWeight },
				{ selector: "#financeHPRowId", condition: configuration.vehicleOwnerTypeForValidateFinanceHP },
				{ selector: "#hpValidityRowId", condition: configuration.vehicleOwnerTypeForValidateHPValidUpto },
				{ selector: "#tcPaidUptoRowId", condition: configuration.vehicleOwnerTypeForValidateTCPaidUpto },
				{ selector: "#fcValidityRow", condition: configuration.vehicleOwnerTypeForValidateFCValidityDate },
				{ selector: "#permitNumberRowId", condition: configuration.vehicleOwnerTypeForValidatePermitNumber },
				{ selector: "#permitDateRowId", condition: configuration.vehicleOwnerTypeForValidatePermitDate },
				{ selector: "#rcValidityRow", condition: configuration.vehicleOwnerTypeForValidateRCVailidity },
				{ selector: "#allotedRegionRowId", condition: configuration.vehicleOwnerTypeForValidateAllotedRegion },
				{ selector: "#allotedSubRegionRowId", condition: configuration.vehicleOwnerTypeForValidateAllotedSubRegion },
				{ selector: "#allotedBranchRowId", condition: configuration.vehicleOwnerTypeForValidateAllotedBranch },
				{ selector: "#noOfTyresRowId", condition: configuration.vehicleOwnerTypeForValidateNoOfTyres },
				{ selector: "#mfdDateRowId", condition: configuration.vehicleOwnerTypeForValidateMgfDate },
				{ selector: "#panNumberRow", condition: configuration.vehicleOwnerTypeForValidatePanNumber},
				{ selector: "#passingDateRowId", condition: configuration.vehicleOwnerTypeForValidatePassingDate },
				{ selector: "#passingAtRowId", condition: configuration.vehicleOwnerTypeForValidatePassingAt },
				{ selector: "#startKMRowId", condition: configuration.vehicleOwnerTypeForValidateStartKM },
				{ selector: "#signByRowId", condition: configuration.vehicleOwnerTypeForValidateSignBy },
				{ selector: "#bodyTypeRowId", condition: configuration.vehicleOwnerTypeForValidateBodyType },
				{ selector: "#remarkRow", condition: configuration.vehicleOwnerTypeForValidateRemark },
				{ selector: "#bankNameRow", condition: configuration.vehicleOwnerTypeForValidateBankName },
				{ selector: "#accountNoRow", condition: configuration.vehicleOwnerTypeForValidateAccountNumber },
				{ selector: "#ifscCodeRow", condition: configuration.vehicleOwnerTypeForValidateIFSCCode },
				{ selector: "#bankBranchRow", condition: configuration.vehicleOwnerTypeForValidateBankBranch },
				{ selector: "#maxFuelRow", condition: configuration.vehicleOwnerTypeForValidateMaxFuel },
				{ selector: "#ratePerKMRow", condition: configuration.vehicleOwnerTypeForValidateRatePerKM },
				{ selector: "#ownerTypeRowId", condition: configuration.vehicleOwnerTypeForValidateOwnerType },
			];

			if (configuration.startVehicleOwnerTypeWiseValidation == true || configuration.startVehicleOwnerTypeWiseValidation == 'true') {
				$('#vehicleOwner').on('change', function() {
					vehicleOwnerTypeValue = Number($(this).val());
					updateMandatoryFieldLabelsWithAsterisks(fieldLableConfigurationMappings, vehicleOwnerTypeValue);
				});
			}

			initialiseFocus();
			
			hideLayer();
		}
	});
}

function setAgentList() {
	operationOnSelectTag('agent', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('agent', 'addNew', '---- Select  Agent ----', 0); //function calling from genericfunction.js
	
	if(agentsForGroup != undefined) {
		for(var i = 0; i < agentsForGroup.length; i++) {
			operationOnSelectTag('agent', 'addNew', agentsForGroup[i].name, agentsForGroup[i].vehicleAgentMasterId);
		} 
	}
}

function setVehicleTypeList(vehicleTypeForGroup) {
	operationOnSelectTag('vehicleType', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('vehicleType', 'addNew', '---- Select	Vehicle Type ----', 0); //function calling from genericfunction.js
	
	if(vehicleTypeForGroup != undefined) {
		for(var i = 0; i < vehicleTypeForGroup.length; i++) {
			operationOnSelectTag('vehicleType', 'addNew', vehicleTypeForGroup[i].name, vehicleTypeForGroup[i].vehicleTypeId);
		} 
	}
}

function setVehicleOwnerList(vehicleOwnerList) {
	operationOnSelectTag('vehicleOwner', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('vehicleOwner', 'addNew', '---- Select Owner ----', 0); //function calling from genericfunction.js
	
	if(vehicleOwnerList != undefined) {
		for(var i = 0; i < vehicleOwnerList.length; i++) {
			operationOnSelectTag('vehicleOwner', 'addNew', vehicleOwnerList[i].vehicleOwnerName, vehicleOwnerList[i].vehicleOwnerId);
		} 
	}
}

function setTDSChargeInPercentList() {
	operationOnSelectTag('tdsRate', 'removeAll', '', '');
	operationOnSelectTag('tdsRate', 'addNew', '---- Select TDS ----', 0);

	tdsChargeList.forEach(value => {
		operationOnSelectTag('tdsRate', 'addNew', value, value);
	});
}

function setTDSOwnerTypeList(tdsOwnerTypeList) {
	operationOnSelectTag('ownerType', 'removeAll', '', '');
	operationOnSelectTag('ownerType', 'addNew', '---- Select Owner Type ----', 0);

	tdsOwnerTypeList.forEach(value => {
		operationOnSelectTag('ownerType', 'addNew', value.tdsTypeName, value.tdsTypeId);
	});
}

function setRegionList(regionForGroup) {
	operationOnSelectTag('allotedRegionId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('allotedRegionId', 'addNew', '---- Select Region ----', 0); //function calling from genericfunction.js
	
	if(regionForGroup != undefined) {
		for(var i = 0; i < regionForGroup.length; i++) {
			operationOnSelectTag('allotedRegionId', 'addNew', regionForGroup[i].regionName, regionForGroup[i].regionId);
		} 
	}
}

function populateSubRegions(obj) {
	operationOnSelectTag('allotedSubRegionId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('allotedSubRegionId', 'addNew', '---- Select Sub-Region ----', 0); //function calling from genericfunction.js
	
	operationOnSelectTag('allotedBranchId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('allotedBranchId', 'addNew', '---- Select Branch ----', 0); //function calling from genericfunction.js
	
	let jsonObject	= {};
	
	jsonObject.regionId	= obj.value;

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionListByRegion.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			let subRegion	= data.subRegion;
			
			if(subRegion != undefined) {
				for(var i = 0; i < subRegion.length; i++) {
					operationOnSelectTag('allotedSubRegionId', 'addNew', subRegion[i].subRegionName, subRegion[i].subRegionId);
				}
			}
		}
	});
}

function populateBranches(obj) {
	operationOnSelectTag('allotedBranchId', 'removeAll', '', ''); //function calling from genericfunction.js
	operationOnSelectTag('allotedBranchId', 'addNew', '---- Select Branch ----', 0); //function calling from genericfunction.js
	
	let jsonObject	= {};
	
	jsonObject.subRegionSelectEle_primary_key	= obj.value;
	jsonObject.AllOptionsForBranch	= false;

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getPhysicalBranchOption.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			let branch	= data.sourceBranch;

			operationOnSelectTag('branch', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('branch', 'addNew', '-- Select	 Branch --', 0); //function calling from genericfunction.js
			
			if(branch != null) {
				for(const element of branch) {
					operationOnSelectTag('allotedBranchId', 'addNew', element.branchName, element.branchId);
				} 
			}
		}
	});
}

function validateVehicleOwnerFeilds() {
	if(!validateElement('vehicleOwner','Vehicle Owner')){return false;}
	if(!validateElement('vehicleType','Vehicle Type')){return false;}
	if(!validateElement('agent','Agent')){return false;}
	if(!validateElement('vehicleNo','Vehicle No')){return false;}
	if(!validateVehicleNumber(document.getElementById('vehicleNo'))){return false;}
	if(configuration.registeredOwnerFieldMandotory && !validateElement('regdOwner','Registered Owner')){return false;}

	if(configuration.showRouteType && !validateElement('routeType','Route Type')){return false;}

	if(configuration.showInsuranceRelatedFieldMandotory) {
		if(!validateElement('insuranceName','Insurance Name')){return false;}
		if(!validateElement('policyNo','Policy Number')){return false;}
		if(configuration.showValidity && !validateElement('polValidity','Policy Validity')){return false;}
	}
	
	let vehicleOwner	= Number($('#vehicleOwner').val());
	
	if(configuration.engineNumberFieldMandotory && !validateElement('engineNo','Engine Number')){return false;}
	if(configuration.chasisNumberFieldMandotory && !validateElement('chasisNo','Chasis Number')){return false;}
	if((configuration.validateHiredVehiclePanNumber && vehicleOwner == HIRED_VEHICLE_ID 
		|| configuration.validateAttachedVehiclePanNumber && vehicleOwner == ATTACHED_VEHICLE_ID) && !validateElement('panNo','Pan No')){return false;}
	
	return true;
}

function formValidations() {
	if(!validateInputTextFeild(8, 'panNo', 'panNo', 'info',	 validPanNumberErrMsg)) {
		setTimeout(function() { 
			$('#panNo').focus(); 
		}, 200);
		return false;
	}
	
	const validationMappingArray = [
	{ key: 'vehicleOwnerTypeForValidateRegdOwner', element: 'regdOwner', description: 'Regd. Owner' },
	{ key: 'vehicleOwnerTypeForValidateRegisteredOwnerContactNumber', element: 'regdOwnerContactNo', description: 'Regd. Owner Contact No.' },
    { key: 'vehicleOwnerTypeForValidateRegisteredOwnerAddress', element: 'address', description: 'Address' },
    { key: 'vehicleOwnerTypeForValidateAccountNumber', element: 'accountno', description: 'Account No' },
    { key: 'vehicleOwnerTypeForValidateRegisteredDate', element: 'regdDate', description: 'Regd. Date' },
    { key: 'vehicleOwnerTypeForValidateRegisteredAtRTO', element: 'registeredAtRTO', description: 'Registered at RTO' },
    { key: 'vehicleOwnerTypeForValidateModel', element: 'model', description: 'Model' },
    { key: 'vehicleOwnerTypeForValidateInsuranceName', element: 'insuranceName', description: 'Insurance Name' },
    { key: 'vehicleOwnerTypeForValidatePolicyNumber', element: 'policyNo', description: 'Policy No.' },
    { key: 'vehicleOwnerTypeForValidatePolicyValidityDate', element: 'polValidity', description: 'Policy Validity.' },
    { key: 'vehicleOwnerTypeForValidateAverage', element: 'average', description: 'Average' },
    { key: 'vehicleOwnerTypeForValidateMake', element: 'make', description: 'Make' },
    { key: 'vehicleOwnerTypeForValidateEngineNumber', element: 'engineNo', description: 'Engine No.' },
    { key: 'vehicleOwnerTypeForValidateChasisNumber', element: 'chasisNo', description: 'Chasis No.' },
    { key: 'vehicleOwnerTypeForValidateGrossWgt', element: 'grossWgt', description: 'Gross Wgt' },
    { key: 'vehicleOwnerTypeForValidateUnLadenWgt', element: 'unLadenWgt', description: 'UnLaden Wgt' },
    { key: 'vehicleOwnerTypeForValidateLoadCapacity', element: 'loadCapacity', description: 'Load Capacity' },
    { key: 'vehicleOwnerTypeForValidateThappiWeight', element: 'thappiWeight', description: 'Thappi Weight' },
    { key: 'vehicleOwnerTypeForValidateFinanceHP', element: 'financeHP', description: 'Finance H.P' },
    { key: 'vehicleOwnerTypeForValidateHPValidUpto', element: 'hpValidity', description: 'H.P. Valid Upto' },
    { key: 'vehicleOwnerTypeForValidateTCPaidUpto', element: 'tcPaidUpto', description: 'T.C. Paid Upto' },
    { key: 'vehicleOwnerTypeForValidateFCValidityDate', element: 'fcValidity', description: 'FC Validity' },
    { key: 'vehicleOwnerTypeForValidatePermitNumber', element: 'permitNumber', description: 'Permit Number' },
    { key: 'vehicleOwnerTypeForValidatePermitDate', element: 'permitDate', description: 'Permit Date' },
    { key: 'vehicleOwnerTypeForValidateRCVailidity', element: 'rcValidity', description: 'RC Validity' },
    { key: 'vehicleOwnerTypeForValidateAllotedRegion', element: 'allotedRegionId', description: 'Alloted Region' },
    { key: 'vehicleOwnerTypeForValidateAllotedSubRegion', element: 'allotedSubRegionId', description: 'Alloted Sub Region' },
    { key: 'vehicleOwnerTypeForValidateAllotedBranch', element: 'allotedBranchId', description: 'Alloted Branch' },
    { key: 'vehicleOwnerTypeForValidateNoOfTyres', element: 'noOfTyres', description: 'No. of Tyres' },
    { key: 'vehicleOwnerTypeForValidateMgfDate', element: 'mfdDate', description: 'Mfg Date' },
    { key: 'vehicleOwnerTypeForValidatePassingDate', element: 'passingDate', description: 'Passing Date' },
    { key: 'vehicleOwnerTypeForValidatePanNumber', element: 'panNo', description: 'Pan No' },
    { key: 'vehicleOwnerTypeForValidatePassingAt', element: 'passingAt', description: 'Passing At' },
    { key: 'vehicleOwnerTypeForValidateStartKM', element: 'startKM', description: 'Start K.M' },
    { key: 'vehicleOwnerTypeForValidateSignBy', element: 'signBy', description: 'Sign By' },
    { key: 'vehicleOwnerTypeForValidateRemark', element: 'remark', description: 'Remark' },
    { key: 'vehicleOwnerTypeForValidateMaxFuel', element: 'maxFuel', description: 'Max. Fuel' },
    { key: 'vehicleOwnerTypeForValidateBankName', element: 'bankName', description: 'Bank Name' },
    { key: 'vehicleOwnerTypeForValidateIFSCCode', element: 'ifscCode', description: 'IFSC Code' },
    { key: 'vehicleOwnerTypeForValidateBankBranch', element: 'bankBranch', description: 'Bank Branch' },
    { key: 'vehicleOwnerTypeForValidateRatePerKM', element: 'ratePerKM', description: 'Rate Per K.M' },
    { key: 'vehicleOwnerTypeForValidateOwnerType', element: 'ownerType', description: 'Owner Type' },
];
	
	if (configuration.startVehicleOwnerTypeWiseValidation == true || configuration.startVehicleOwnerTypeWiseValidation == 'true') {
		for (const { key, element, description } of validationMappingArray) {
			if (configuration[key] && configuration[key] != "0") {
				const validationConfigurationArray = configuration[key].split(',').map(Number);
				if (validationConfigurationArray.includes(vehicleOwnerTypeValue) && !validateElement(element, description)) {
					return false;
				}
			}
		}
	}
	
	if($('#vehicleOwner').val() != OWN_VEHICLE_ID) {
		return validateVehicleOwnerFeilds();
	} else {
		if(configuration.showVehicleOwnerColumn && !validateElement('vehicleOwner','Vehicle Owner')){return false;}
		
		if(!validateElement('vehicleType','Vehicle Type')){return false;}
		if(!validateElement('vehicleNo','Vehicle No')){return false;}
		if(!validateVehicleNumber(document.getElementById('vehicleNo'))){return false;}
		if(configuration.registeredOwnerFieldMandotory && !validateElement('regdOwner','Registered Owner')){return false;}
		if(configuration.showRouteType && !validateElement('routeType','Routing Type')){return false;}
		
		if(configuration.showInsuranceRelatedFieldMandotory){
			if(!validateElement('insuranceName','Insurance Name')){return false;}
			if(!validateElement('policyNo','Policy Number')){return false;}
			if(configuration.showValidity && !validateElement('polValidity','Policy Validity')){return false;}
		}
		
		if(configuration.engineNumberFieldMandotory && !validateElement('engineNo','Engine Number')){return false;}
		if(configuration.chasisNumberFieldMandotory && !validateElement('chasisNo','Chasis Number')){return false;}
		if(configuration.validatePanNumber && !validateElement('panNo','Pan No')){return false;}
		if(configuration.showVehicleAgentColumn && !document.getElementById('agent').disabled && !validateElement('agent','Agent')){return false;}
	
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
		
		if(configuration.allotedBranchFieldMandatory && !validateElement('allotedBranchId','Alloted Branch')){return false;}
		if(configuration.showBanKDetailsFields && !validateBankName()){return false;}

		// All validation check done
		
		if (document.vehicleNoMasterForm.vehicleDocumentReceived != null && document.querySelector('input[name="vehicleDocumentReceived"]:checked').value == 'true' && document.getElementById('documentReceivedDate').value == ''){
			document.getElementById('documentReceivedDate').focus();
			showMessage('error',"Please Select Document Received Date.");
			return false;
		}
		
		if (document.vehicleNoMasterForm.vehicleDocumentReceived != null && document.querySelector('input[name="vehicleDocumentReceived"]:checked').value == 'true' && document.getElementById('documentFileNo').value == ''){
			document.getElementById('documentFileNo').focus();
			showMessage('error',"Please Enter Document Number.");
			return false;
		}
			

		return true;
	}
}

function getVehicleDetails(vehicleNumberMasterId) {
	let jsonObject	= {};
	jsonObject.vehicleNumberMasterId	= vehicleNumberMasterId;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleNumberMasterWS/getVehicleNumberDetailsForEdit.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var vehicleNumberMaster	= data.vehicleNumberMaster;
			var vehicleAgentMaster	= data.vehicleAgentMaster;
			
			document.vehicleNoMasterForm.selectedVehicleNoId.value	= vehicleNumberMasterId;

			if(showVehicleAgentColumn) {
				document.vehicleNoMasterForm.isAgent.checked			= false;
				document.vehicleNoMasterForm.agent.disabled				= true;
				document.vehicleNoMasterForm.agent.selectedIndex		= 0;
			}
			
			document.vehicleNoMasterForm.vehicleType.selectedIndex	= 0;
			
			$('#vehicleNo').val(vehicleNumberMaster.vehicleNumber);
			curVehNo = vehicleNumberMaster.vehicleNumber;
			
			if(document.vehicleNoMasterForm.agent != null) {
				if(vehicleNumberMaster.vehicleAgentMasterId > 0) {
					document.vehicleNoMasterForm.isAgent.checked	= true;
					document.vehicleNoMasterForm.agent.disabled		= false;
					selectOptionByValue(document.vehicleNoMasterForm.agent, vehicleNumberMaster.vehicleAgentMasterId);
				} else
					document.vehicleNoMasterForm.agent.selectedIndex = 0;
			}
			
			if(document.vehicleNoMasterForm.vehicleType != null) {
				if(vehicleNumberMaster.vehicleTypeId > 0)
					selectOptionByValue(document.vehicleNoMasterForm.vehicleType, vehicleNumberMaster.vehicleTypeId);
				else
					document.vehicleNoMasterForm.vehicleType.selectedIndex = 0;
			}
			
			$('#startKM').val(vehicleNumberMaster.startKM);
			$('#noOfTyres').val(vehicleNumberMaster.noOfTyres);	
			$('#ratePerKM').val(vehicleNumberMaster.ratePerKM);
			
			if(vehicleNumberMaster.vehicleOwner > 0) {
				if(configuration.showVehicleOwnerColumn)
					selectOptionByValue(document.vehicleNoMasterForm.vehicleOwner, vehicleNumberMaster.vehicleOwner);
			} else
				document.vehicleNoMasterForm.vehicleOwner.selectedIndex = 0;
				
			$('#regdDate').val(vehicleNumberMaster.registeredVehicleDate);
			$('#regdOwner').val(vehicleNumberMaster.registeredOwner);
			$('#signBy').val(vehicleNumberMaster.signBy);
			$('#address').val(vehicleNumberMaster.address);
			$('#model').val(vehicleNumberMaster.model);
			$('#make').val(vehicleNumberMaster.make);
			$('#bodyType').val(vehicleNumberMaster.bodyType);
			$('#engineNo').val(vehicleNumberMaster.engineNumber);
			$('#chasisNo').val(vehicleNumberMaster.chasisNumber);
			$('#grossWgt').val(vehicleNumberMaster.grossWeight);
			$('#unLadenWgt').val(vehicleNumberMaster.unLadenWeight);
			$('#loadCapacity').val(vehicleNumberMaster.loadCapacity);
			$('#financeHP').val(vehicleNumberMaster.financeHP);
			$('#hpValidity').val(vehicleNumberMaster.hpValidityDate);
			$('#tcPaidUpto').val(vehicleNumberMaster.tcPaidUpToDate);
			$('#panNo').val(vehicleNumberMaster.panNumber);
			$('#mfdDate').val(vehicleNumberMaster.manufactureDateTime);
			$('#passingAt').val(vehicleNumberMaster.passingAt);
			$('#passingDate').val(vehicleNumberMaster.passingDateStr);
			$('#registeredAtRTO').val(vehicleNumberMaster.registeredAtRTO);
			$('#deviceId').val(vehicleNumberMaster.deviceId);
			if(configuration.showForm15HSubmitted)
				if(vehicleNumberMaster.form15HSubmitted)//Set form15HSubmitted value
					selectOptionByValue(document.vehicleNoMasterForm.form15HSubmitted, 1);
				else
					selectOptionByValue(document.vehicleNoMasterForm.form15HSubmitted, 0);
				
			if(vehicleNumberMaster.allotedRegionId > 0)
				selectRegionSubReginAndBranch(vehicleNumberMaster.allotedRegionId, vehicleNumberMaster.allotedSubRegionId, vehicleNumberMaster.allotedBranchId);
			else if(document.vehicleNoMasterForm.allotedRegionId != null)
				document.vehicleNoMasterForm.allotedRegionId.selectedIndex = 0;
				
			if(vehicleNumberMaster.allotedBranchId > 0)
				selectedBranch = vehicleNumberMaster.allotedBranchId;
			else if(document.vehicleNoMasterForm.allotedBranchId != null)
				document.vehicleNoMasterForm.allotedBranchId.selectedIndex = 0;
			
			if(configuration.showRouteType){selectOptionByValue(document.vehicleNoMasterForm.routeType, vehicleNumberMaster.routingType);}
				
			if(accountGroupId == ACCOUNT_GROUP_ID_LMT && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
				if(vehicleNumberMaster.vehicleOwner == OWN_VEHICLE_ID) {
					$("#vehicleNoMasterForm :input").not("#resetBottom").not("#reset").attr("disabled", true);
					document.vehicleNoMasterForm.edit.className = 'btn_print_disabled';	
					document.vehicleNoMasterForm.editBottom.className = 'btn_print_disabled';	
					document.vehicleNoMasterForm.deleteItem.className = 'btn_print_disabled';	
					document.vehicleNoMasterForm.deleteItemBottom.className = 'btn_print_disabled';
					$('#vehicleOwner').append('<option value="' + OWN_VEHICLE_ID + '" selected="selected">' + OWN_VEHICLE_NAME + '</option>');
				} else
					$("#vehicleNoMasterForm :input").attr("disabled", false);
			}
				
			$('#average').val(vehicleNumberMaster.vehicleAverage);
			$('#regdOwnerContactNo').val(vehicleNumberMaster.registeredOwnerContact);
			$('#insuranceName').val(vehicleNumberMaster.insuranceName);
			$('#policyNo').val(vehicleNumberMaster.policyNo);
			if(configuration.showValidity){	$('#polValidity').val(vehicleNumberMaster.policyValidityDateStr);}
				
			if(configuration.showGPSConfiguredColumn) {
				if(vehicleNumberMaster.gpsConfigured)//Set GPSConfigured value
					selectOptionByValue(document.vehicleNoMasterForm.gpsConfigured, 1);
				else
					selectOptionByValue(document.vehicleNoMasterForm.gpsConfigured, 0);
			}
				
			$('#fcValidity').val(vehicleNumberMaster.fcValidityDateStr);
			$('#bankName').val(vehicleNumberMaster.bankName);
			$('#accountno').val(vehicleNumberMaster.accountNo);
			$('#ifscCode').val(vehicleNumberMaster.ifscCode);
			$('#bankBranch').val(vehicleNumberMaster.bankBranchName);
			$('#bankId').val(vehicleNumberMaster.bankId);
			$('#maxFuel').val(vehicleNumberMaster.maxFuel);
			$('#commission').val(vehicleNumberMaster.vehicleCommission);
			$('#remark').val(vehicleNumberMaster.remark);
			$('#thappiWeight').val(vehicleNumberMaster.thappiWeight);
			$('#tdsRate').val(vehicleNumberMaster.tdsRate);
			$('#tdsAmount').val(vehicleNumberMaster.tdsAmount);
			$('#documentReceivedDate').val(vehicleNumberMaster.documentReceivedDateStr);
			$('#documentFileNo').val(vehicleNumberMaster.documentFileNo);
			$('#permitNumber').val(vehicleNumberMaster.permitNumber);
			$('#permitDate').val(vehicleNumberMaster.permitDateStr);
			$('#rcValidity').val(vehicleNumberMaster.rcValidityDateStr);

			if(document.vehicleNoMasterForm.aadharPanLink != null) {
				if (vehicleNumberMaster.aadharPanLink)
					document.vehicleNoMasterForm.aadharPanLink[1].checked = true;
				else
					document.vehicleNoMasterForm.aadharPanLink[0].checked = true;
			}
				
			if(document.vehicleNoMasterForm.vehicleDocumentReceived != null) {		
				if (vehicleNumberMaster.vehicleDocumentReceived)
					document.vehicleNoMasterForm.vehicleDocumentReceived[1].checked = true;
				else
					document.vehicleNoMasterForm.vehicleDocumentReceived[0].checked = true;
			}

			if(document.vehicleNoMasterForm.tdsDeductible != null) {
				if(vehicleAgentMaster != undefined && vehicleAgentMaster.tdsDeductible || vehicleNumberMaster.tdsDeductible)
					document.vehicleNoMasterForm.tdsDeductible[1].checked = true;
				else
					document.vehicleNoMasterForm.tdsDeductible[0].checked = true;
			}
			
			if(document.vehicleNoMasterForm.isSpecified != null) {
				if (vehicleAgentMaster != undefined && vehicleAgentMaster.isSpecified || vehicleNumberMaster.isSpecified)
					document.vehicleNoMasterForm.isSpecified[1].checked = true;
				else
					document.vehicleNoMasterForm.isSpecified[0].checked = true;
			}
			
			if(document.vehicleNoMasterForm.ownerType != null) {
				if(vehicleAgentMaster != undefined && vehicleAgentMaster.ownerTypeId > 0)
					selectOptionByValue(document.vehicleNoMasterForm.ownerType, vehicleAgentMaster.ownerTypeId);
				else if(vehicleNumberMaster.ownerTypeId > 0)
					selectOptionByValue(document.vehicleNoMasterForm.ownerType, vehicleNumberMaster.ownerTypeId);
				else
					document.vehicleNoMasterForm.ownerType.selectedIndex = 0;
			}

			if(vehicleAgentMaster != undefined) {
				if(document.vehicleNoMasterForm.isSpecified != null && vehicleAgentMaster.vehicleOwner != OWN_VEHICLE_ID) {
					document.vehicleNoMasterForm.isSpecified[1].disabled = true;
					document.vehicleNoMasterForm.isSpecified[0].disabled = true;
				}

				if(document.vehicleNoMasterForm.tdsDeductible != null && vehicleAgentMaster.vehicleOwner != OWN_VEHICLE_ID) {
					document.vehicleNoMasterForm.tdsDeductible[1].disabled = true;
					document.vehicleNoMasterForm.tdsDeductible[0].disabled = true;
				}
				
				if(vehicleAgentMaster.ownerTypeId > 0 && vehicleAgentMaster.vehicleOwner != OWN_VEHICLE_ID && document.vehicleNoMasterForm.ownerType != null)
					document.vehicleNoMasterForm.ownerType.disabled = true;
			} else {
				if(document.vehicleNoMasterForm.isSpecified != null) {
					document.vehicleNoMasterForm.isSpecified[1].disabled = false;
					document.vehicleNoMasterForm.isSpecified[0].disabled = false;
				}

				if(document.vehicleNoMasterForm.tdsDeductible != null ) {
					document.vehicleNoMasterForm.tdsDeductible[1].disabled = false;
					document.vehicleNoMasterForm.tdsDeductible[0].disabled = false;
				}
				
				if(vehicleNumberMaster.ownerTypeId > 0 && document.vehicleNoMasterForm.ownerType != null)
					document.vehicleNoMasterForm.ownerType.disabled = false;
			}
			
			if(vehicleNumberMaster.vehicleDocumentReceived) {
				$('#documentReceivedDateRow').removeClass('hide');
				$('#documentFileNoRow').removeClass('hide');
			} else {
				$('#documentReceivedDateRow').addClass('hide');
				$('#documentFileNoRow').addClass('hide');
			}
			
			if(isAllowToEnterIDProof) {
				setTimeout(function() {
					getPhotoServiceDetails(vehicleNumberMasterId, VEHICLE_NUMBER_MASTER, $('#vehicleOwner').val(), OWN_VEHICLE_ID);
				}, 100);
			}
			
			if(isAllowToUploadPdf) {
					setTimeout(function() {
						getDocumentPhotoServiceDetails(vehicleNumberMasterId, VEHICLE_NUMBER_MASTER, $('#vehicleOwner').val(), OWN_VEHICLE_ID);
					}, 100);
				}
		}
	});
}

function addVehicle() {
	let jsonObject	= new Object();

	if(!validateIdProofDetails())
		return false;

	getDataToSaveOrUpdate(jsonObject);

	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			if(isAllowToUploadPdf)
				saveVehiclePDFDocumentDetails(data.vehicleNumberMasterId);
			
			if(data.message != undefined) {
				let errorMessage = data.message;

				if(errorMessage.typeName == 'success') {
					let PreviousRecodsMsg	= data.PreviousRecodsMsg;

					if(PreviousRecodsMsg != null) {
						showMessage("info", data.PreviousRecodsMsg);

						setTimeout(() => {
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						}, 2000);
					} else {
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					refreshCacheManip();
					resetElements();
					hideLayer();
					return;
				}
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				resetElements();
			}

			hideLayer();
		}
	});
}

function updateVehicle(curVehNo) {
	let vehicleNumberMasterId	= document.vehicleNoMasterForm.selectedVehicleNoId.value;
	
	if(vehicleNumberMasterId > 0) {
		if (confirm('Are you sure you want to update the vehicle ?')) {
			document.vehicleNoMasterForm.agent.disabled = false;
			
			let jsonObject	= new Object();

			if(!validateIdProofDetails())
				return false;

			getDataToSaveOrUpdate(jsonObject);
			
			jsonObject.vehicleNumberMasterId		= vehicleNumberMasterId;
			jsonObject.isVehicleNumberMasterSave	= false;
			jsonObject.curVehNo						= curVehNo.trim();
			
			showLayer();

			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/vehicleWS/updateVehicle.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					if(data.message != undefined) {

						let errorMessage = data.message;

						if(errorMessage.typeName == 'success') {
							refreshCacheManip();
							resetElements();
							var searchField = document.getElementById('searchVehicle');
								searchField.disabled = false;
						}

						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					} else
						resetElements();
				
					hideLayer();
				}
			});

			if(isAllowToUploadPdf)
				saveVehiclePDFDocumentDetails(vehicleNumberMasterId);
				
			if(isAllowToEnterIDProof)
				saveVehicleDocumentDetails(vehicleNumberMasterId);
		}
	} else
		resetElements();
}

function deleteVehicle(){

	if(document.vehicleNoMasterForm.deleteItem.value=='Delete'
			|| document.vehicleNoMasterForm.deleteItemBottom.value=='Delete'){
		if (document.vehicleNoMasterForm.selectedVehicleNoId.value > 0){
			if (confirm('Are you sure you want to delete the vehicle ?')){

				let jsonObject		= new Object();

				jsonObject.vehicleNumberMasterId = (document.vehicleNoMasterForm.selectedVehicleNoId.value).trim();

				showLayer();
				
				$.ajax({
					type		: "POST",
					url			: WEB_SERVICE_URL+'/vehicleWS/deleteVehicle.do',
					data		: jsonObject,
					dataType	: 'json',
					success: function(data) {
						if(data.message != undefined) {
							let errorMessage = data.message;

							if(errorMessage.typeName == 'success') {
								refreshCacheManip();
								resetElements();
							}
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						} else {
							resetElements();
						}

						hideLayer();
					}
				});
			}
		}
	} else {
		resetElements();
	}
}


function getDataToSaveOrUpdate(jsonObject) {
	jsonObject.vehicleOwner					= getValueFromInputField('vehicleOwner');
	jsonObject.vehicleTypeId				= getValueFromInputField('vehicleType');
	jsonObject.vehicleAgentMasterId			= getValueFromInputField('agent');
	jsonObject.vehicleNumber				= getValueFromInputField('vehicleNo');
	jsonObject.registeredOwner				= getValueFromInputField('regdOwner');
	jsonObject.registeredOwnerContact		= getValueFromInputField('regdOwnerContactNo');
	jsonObject.address						= getValueFromInputField('address');
	jsonObject.registeredVehicleDate		= getValueFromInputField('regdDate');
	jsonObject.registeredAtRTO				= getValueFromInputField('registeredAtRTO');
	jsonObject.model						= getValueFromInputField('model');
	jsonObject.routeType					= getValueFromInputField('routeType');
	jsonObject.insuranceName				= getValueFromInputField('insuranceName');
	jsonObject.policyNo						= getValueFromInputField('policyNo');
	jsonObject.policyValidityDateStr		= getValueFromInputField('polValidity');
	jsonObject.vehicleAverage				= getValueFromInputField('average');
	jsonObject.make							= getValueFromInputField('make');
	jsonObject.engineNumber					= getValueFromInputField('engineNo');
	jsonObject.chasisNumber					= getValueFromInputField('chasisNo');
	jsonObject.grossWeight					= getValueFromInputField('grossWgt');
	jsonObject.unLadenWeight				= getValueFromInputField('unLadenWgt');
	jsonObject.loadCapacity					= getValueFromInputField('loadCapacity');
	jsonObject.financeHP					= getValueFromInputField('financeHP');
	jsonObject.hpValidityDate				= getValueFromInputField('hpValidity');
	jsonObject.tcPaidUpToDate				= getValueFromInputField('tcPaidUpto');
	jsonObject.allotedRegionId				= getValueFromInputField('allotedRegionId');
	jsonObject.allotedSubRegionId			= getValueFromInputField('allotedSubRegionId');
	jsonObject.allotedBranchId				= getValueFromInputField('allotedBranchId');
	jsonObject.noOfTyres					= getValueFromInputField('noOfTyres');
	jsonObject.manufactureDateTime			= getValueFromInputField('mfdDate');
	jsonObject.passingDateStr				= getValueFromInputField('passingDate');
	jsonObject.panNumber					= getValueFromInputField('panNo');
	jsonObject.passingAt					= getValueFromInputField('passingAt');
	jsonObject.startKM						= getValueFromInputField('startKM');
	jsonObject.signBy						= getValueFromInputField('signBy');
	jsonObject.bodyType						= getValueFromInputField('bodyType');
	jsonObject.form15HSubmitted				= getValueFromInputField('form15HSubmitted') == 1;
	jsonObject.gpsConfigured				= getValueFromInputField('gpsConfigured') == 1;
	jsonObject.bankId						= getValueFromInputField('bankId');
	jsonObject.accountNo					= getValueFromInputField('accountno');
	jsonObject.ifscCode						= getValueFromInputField('ifscCode');
	jsonObject.bankBranch					= getValueFromInputField('bankBranch');
	jsonObject.maxFuel						= getValueFromInputField('maxFuel');
	jsonObject.commission					= getValueFromInputField('commission');
	jsonObject.remark						= getValueFromInputField('remark');
	jsonObject.thappiWeight					= getValueFromInputField('thappiWeight');
	jsonObject.fcValidityDateStr			= getValueFromInputField('fcValidity');
	jsonObject.deviceId						= getValueFromInputField('deviceId');
	jsonObject.idProofDataObject			= JSON.stringify(idProofDataObject);
	jsonObject.isVehicleNumberMasterSave	= true;
	jsonObject.tdsRate						= $('#tdsRate').val();
	jsonObject.tdsAmount					= $('#tdsAmount').val();
	jsonObject.ratePerKM					= $('#ratePerKM').val();
	jsonObject.permitNumber					= $('#permitNumber').val();
	jsonObject.permitDateStr				= getValueFromInputField('permitDate');
	jsonObject.rcValidityDateStr			= getValueFromInputField('rcValidity');

	jsonObject.documentFileNo				= $('#documentFileNo').val();
	jsonObject.documentReceivedDateStr		= $('#documentReceivedDate').val();
	jsonObject.ownerTypeId					= $('#ownerType').val();
	
	if(document.querySelector('input[name="vehicleDocumentReceived"]:checked') != null)
		jsonObject.vehicleDocumentReceived		= document.querySelector('input[name="vehicleDocumentReceived"]:checked').value;
	
	if(document.querySelector('input[name="tdsDeductible"]:checked') != null)
		jsonObject.tdsDeductible			= document.querySelector('input[name="tdsDeductible"]:checked').value;
	
	if(document.querySelector('input[name="isSpecified"]:checked') != null)
		jsonObject.isSpecified				= document.querySelector('input[name="isSpecified"]:checked').value;
		
	if(document.querySelector('input[name="aadharPanLink"]:checked') != null)
		jsonObject.aadharPanLink				= document.querySelector('input[name="aadharPanLink"]:checked').value;
		
	if(document.querySelector('input[name="vehicleDocumentReceived"]:checked') != null && document.querySelector('input[name="vehicleDocumentReceived"]:checked').value == 'false'){
		jsonObject.documentFileNo = '';
		jsonObject.documentReceivedDateStr = '';
	}
}

function resetElementsForOtherGroups(){

	document.vehicleNoMasterForm.add.disabled = false ;
	document.vehicleNoMasterForm.add.className = 'btn_print';
	document.vehicleNoMasterForm.edit.disabled = true ;
	document.vehicleNoMasterForm.edit.className = 'btn_print_disabled';
	document.vehicleNoMasterForm.deleteItem.disabled = true ;
	document.vehicleNoMasterForm.deleteItem.className = 'btn_print_disabled';
	document.vehicleNoMasterForm.edit.value = 'Edit';
	document.vehicleNoMasterForm.deleteItem.value = 'Delete';

	document.vehicleNoMasterForm.addBottom.disabled = false ;
	document.vehicleNoMasterForm.addBottom.className = 'btn_print';
	document.vehicleNoMasterForm.editBottom.disabled = true ;
	document.vehicleNoMasterForm.editBottom.className = 'btn_print_disabled';
	document.vehicleNoMasterForm.deleteItemBottom.disabled = true ;
	document.vehicleNoMasterForm.deleteItemBottom.className = 'btn_print_disabled';
	document.vehicleNoMasterForm.editBottom.value = 'Edit';
	document.vehicleNoMasterForm.deleteItemBottom.value = 'Delete';

	let myTable = document.getElementById('details');
	let controls = myTable.getElementsByTagName("input"); 

	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.value='';
		control.readOnly = false;		 
	}
	controls= myTable.getElementsByTagName("select"); 

	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.selectedIndex = 0;		  
		control.readOnly = false;		 
	}

	document.vehicleNoMasterForm.address.value= '';
	document.vehicleNoMasterForm.searchVehicle.value= '';
	document.vehicleNoMasterForm.selectedVehicleNoId.value = 0 ;
	toogleElement('error','none');
	toogleElement('msg','none');
	document.vehicleNoMasterForm.searchVehicle.focus();
}

function enableElements(){
	var myTable = document.getElementById('details');
	var controls = myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = false;		 
	}
	controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = false;		 
	}
}

function disableElements(){
	document.vehicleNoMasterForm.add.disabled = true ;
	document.vehicleNoMasterForm.add.className = 'btn_print_disabled';
	document.vehicleNoMasterForm.addBottom.disabled = true ;
	document.vehicleNoMasterForm.addBottom.className = 'btn_print_disabled';
	var myTable = document.getElementById('details');
	var controls= myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = true;		
	}
	var controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = true;		
	}
	
	if(document.vehicleNoMasterForm.isAgent != null)
		document.vehicleNoMasterForm.isAgent.readOnly = false;
	
	if(document.vehicleNoMasterForm.panNo !=null){
		let pattern		= /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
		let element = document.getElementById('panNo');

		if(!element.value.match(pattern))
			document.vehicleNoMasterForm.panNo.readOnly = false;
	}
}

function refreshCacheManip() {
	refreshCache(83, accountGroupId);
}

function openPhotoServiceDetails() {
	isVehicleMasterIdProof	= true;
	openIdProofModel();
}

function getPhotoServiceDetails(vehicleNumberMasterId, moduleId, vehicleOwnerType, ownVehicleTypeId) {

	let jsonObject		= new Object();

	jsonObject.masterid	= vehicleNumberMasterId;
	jsonObject.moduleId	= moduleId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/photoTransactionWS/getIDProofPhotoDetail.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {

			let photoModelList = data.photoModelList;

			if(typeof photoModelList !== 'undefined' && photoModelList.length > 0) {

				isPanCardExists			= false;
				isRCBookExists			= false;
				isVehicleMasterIdProof	= true;
				
				$('#viewVehDocs').show();
				
				for(const element of photoModelList) {
					if(photoModelList.length > 1) {
						displayMsg	= 'All Documents Already Uploaded !';
						$('#uploadVehDocs').replaceWith("<span id='docUploadedMsgSpan' style=' font-size : 14px; font-weight: bold; color: red;'>Documents Already Uploaded</span>");
						isPanCardExists			= true;
						isRCBookExists			= true;
					} else if(element.idProofId == ID_PROOF_PAN_CARD) {
						isPanCardExists = true;
						displayMsg	= 'Pan Card Already Uploaded !';
						$('#docUploadedMsgSpan').remove();
						$('#uploadVehDocs').show();
					} else if(element.idProofId == ID_PROOF_RC_BOOK) {
						isRCBookExists	= true;
						displayMsg	= 'RC Book Already Uploaded !';
						$('#docUploadedMsgSpan').remove();
						$('#uploadVehDocs').show();
					}
				}
			} else {
				isPanCardExists = false;
				isRCBookExists	= false;
				$('#viewVehDocs').hide();
				$('#docUploadedMsgSpan').replaceWith("<td type='button' id='uploadVehDocs' name ='uploadVehDocs' class='btn btn-primary' onclick='openPhotoServiceDetails();'>Upload Veh. Docs.</button></td>");
			}

			hideLayer();
		}
	});
	
}

function getDocumentPhotoServiceDetails(vehicleNumberMasterId, moduleId, vehicleOwnerType, ownVehicleTypeId) {

	let jsonObject		= new Object();

	jsonObject.masterid	= vehicleNumberMasterId;
	jsonObject.moduleId	= moduleId;
	
	showLayer();

	if(isAllowToUploadPdf) {
		jsonObject.id		= vehicleNumberMasterId;
		jsonObject.moduleId	= moduleId;
	
		$.ajax({
			type		:	"POST",
			url			:	WEB_SERVICE_URL + '/uploadPdfDetailsWS/getDownloadPdfDataDetails.do',
			data		:	jsonObject,
			dataType	:	'json',
			success		:	function(data) {
				if(data.message != undefined)
					return;
				
				$('#viewVehPdf').show();
			}
		});
		hideLayer();
	}
}

function vehicleNumberAutocomplete() {
	$("#searchVehicle").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?term=' + request.term, function (data) {
				if(typeof data.message !== 'undefined') {
					showMessage('error', data.message.description);
					$("#searchVehicle").focus();
					return false;
				} else {
					response($.map(data.result, function (item) {
						return {
							label					: item.vehicleNumber,
							value					: item.vehicleNumber,
							vehicleNumberMasterId	: item.vehicleNumberMasterId
						};
					}));
				}
			});
		}, select: function (e, u) {
			if(u.item.vehicleNumberMasterId > 0) {
				$('#selectedVehicleNoId').val(u.item.vehicleNumberMasterId);
				getSeletedItemData(u.item.vehicleNumberMasterId);
			}
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function getSeletedItemData(vehicleNoId){
		
		disableElements();
	
		document.vehicleNoMasterForm.edit.disabled = false ;
		document.vehicleNoMasterForm.edit.className = 'btn_print';
		document.vehicleNoMasterForm.deleteItem.disabled = false ;
		document.vehicleNoMasterForm.deleteItem.className = 'btn_print';

		document.vehicleNoMasterForm.editBottom.disabled = false ;
		document.vehicleNoMasterForm.editBottom.className = 'btn_print';
		document.vehicleNoMasterForm.deleteItemBottom.disabled = false ;
		document.vehicleNoMasterForm.deleteItemBottom.className = 'btn_print';
	
		getVehicleDetails(vehicleNoId);

		if(vehicleNoId > 0 && configuration.vehicleDriverMappingAllowed)
			$("#vehicleDriverMap").removeClass('hide');
		else
			$("#vehicleDriverMap").addClass('hide');
}

function bankNameAutocomplete() {
	$("#bankName").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBankNameAutocomplete.do?term=' + request.term, function (data) {

				if(typeof data.message !== 'undefined') {
					$("#bankName").focus();
					return false;
				} else {
					response($.map(data.result, function (item) {
						return {
							label				: item.bankName,
							value				: item.bankName,
							bankId				: item.bankId
						};
					}));
				}
			});
		}, select: function (e, u) {
			if(u.item.bankId > 0) {
				$('#bankId').val(u.item.bankId);
			}
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function validateIdProofDetails() {
	if(isAllowToEnterIDProof && typeof idProofConstantArr !== 'undefined') {
		for(const element of idProofConstantArr) {
			let idProofId	= element.idProofId;
			
			if(idProofId == ID_PROOF_PAN_CARD && typeof isPanCardExists !== 'undefined' && !isPanCardExists && !$('#idProofId_' + idProofId).is(":checked")) {
				showMessage('error', "Please Select Pan Card ID");
				document.vehicleNoMasterForm.agent.disabled = true;
				return false;
			} else if(configuration.validateRCBook && idProofId == ID_PROOF_RC_BOOK && typeof isRCBookExists !== 'undefined' && !isRCBookExists && !$('#idProofId_' + idProofId).is(":checked")) {
				showMessage('error', "Please Select RC Book");
				document.vehicleNoMasterForm.agent.disabled = true;
				return false;
			}
		}
	}
	
	return true;
}

function showIDProofPhoto(moduleIdentifier) {
	let vehicleNumberMasterId	= 0;
	
	if((document.vehicleNoMasterForm.selectedVehicleNoId.value).trim() != '')
		vehicleNumberMasterId = (document.vehicleNoMasterForm.selectedVehicleNoId.value).trim();
	 
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + vehicleNumberMasterId + '&moduleId=' + moduleIdentifier + '&isIDProofPhotoDetails=true','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showVehiclePdf() {
	let vehicleNumberMasterId	= 0;

	if((document.vehicleNoMasterForm.selectedVehicleNoId.value).trim() != '')
		vehicleNumberMasterId = (document.vehicleNoMasterForm.selectedVehicleNoId.value).trim();
		
	childwin = window.open('view.do?pageId=340&eventId=2&modulename=viewUploadedPdf&masterid='+vehicleNumberMasterId+'&moduleId=' + VEHICLE_NUMBER_MASTER,'mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}

function validateFcValidityDate() {
	
	let currDate		= moment().format('DD-MM-YYYY');
	
	let fcValidityDate	= moment($('#fcValidity').val(), "DD-MM-YYYY");
	let currentDate		= moment(currDate, "DD-MM-YYYY");
	
	let diffInDays		= fcValidityDate.diff(currentDate,'days');

	if(diffInDays < 0) {
		showMessage('info', 'You Can Select Only Future Date!');
		changeTextFieldColor('fcValidity', '', '', 'red');
		return false;
	}

	return true;
}

function assignVehicleDriver(){
	let vehicleNumberMasterId = (document.vehicleNoMasterForm.selectedVehicleNoId.value).trim();
	childwin = window.open('updateWayBillFormType.do?pageId=340&eventId=2&modulename=vehicleDriverConfigurationMaster&vehicleNumberMasterId=' + vehicleNumberMasterId ,'newwindow', config='height=400,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function saveVehicleDocumentDetails(vehicleMasterId) {
	let jsonObj	= new Object();
	
	jsonObj.vehicleNumberMasterId	= vehicleMasterId;
	jsonObj.idProofDataObject		= JSON.stringify(idProofDataObject);
	
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/vehicleWS/vehicleDocumentsPhotoService.do',
		data		:	jsonObj,
		dataType	:	'json',
		success		:	function(data) {
			if(data.message != undefined) {
				return;
			}
		}
	});
}

function saveVehiclePDFDocumentDetails(vehicleMasterId) {
	let jsonObj = {
		id: vehicleMasterId, moduleId : VEHICLE_NUMBER_MASTER, noOfFileToUpload, ...pdfDataObject
	};
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/uploadPdfDetailsWS/uploadPdfWayBills.do',
		data		:	jsonObj,
		dataType	:	'json',
		success		:	function(data) {
			if(data.message != undefined) {
				return;
			}
		}
	});
}

function validateBankName(){
	if($('#bankName').val() != ''){
		if(!validateInputTextFeild(1, 'bankId', 'bankName', 'info',	 bankNameErrMsg)) {
			$('#bankName').focus(); 
			return false;
		}
	}
	
	return true;
}

function addVehicleNo() {
	if(showFcValidityField && !validateFcValidityDate())
		return false;
		
	if (configuration.allowAlphaNumericVehicleNo) {
		let vehicleNo = document.getElementById('vehicleNo').value.trim();
		
		if (!validateVehicleNumberForAlphaNumeric(vehicleNo)) {
			document.getElementById('vehicleNo').focus();
			return;
		}
	}
		
	if(formValidations()) {
		if(accountGroupId == ACCOUNT_GROUP_ID_LMT && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
			if(document.getElementById('vehicleOwner').value == OWN_VEHICLE_ID) {
				alert("Not Allowed to add own vehicle ! ");
			} else if (confirm('Are you sure you want to add this vehicle ?')) {
				document.vehicleNoMasterForm.filter.value = 1;
				
				if(showVehicleAgentColumn)
					document.vehicleNoMasterForm.agent.disabled = false; 

				addVehicle();
			}
		} else if (confirm('Are you sure you want to add this vehicle ?')) {
			if(showVehicleAgentColumn)
				document.vehicleNoMasterForm.agent.disabled = false; 

			addVehicle();
		}
	}
}

function editVehicleNoAfterDuplicateCheck() {
	if(showFcValidityField && !validateFcValidityDate())
		return false;
	
	if (document.vehicleNoMasterForm.edit.value == 'Edit'|| document.vehicleNoMasterForm.editBottom.value == 'Edit') {
		document.vehicleNoMasterForm.add.disabled = true;
		document.vehicleNoMasterForm.add.className = 'btn_print_disabled';	
		document.vehicleNoMasterForm.edit.value= 'Save';
		document.vehicleNoMasterForm.deleteItem.value= 'Cancel';
		var searchField = document.getElementById('searchVehicle');
		searchField.disabled = true;

		document.vehicleNoMasterForm.addBottom.disabled = true ;
		document.vehicleNoMasterForm.addBottom.className = 'btn_print_disabled';	
		document.vehicleNoMasterForm.editBottom.value= 'Save';
		document.vehicleNoMasterForm.deleteItemBottom.value= 'Cancel';
		enableElements();
		document.vehicleNoMasterForm.vehicleNo.focus();
	} else if(formValidations())
		updateVehicle(curVehNo);
}

function deleteVehicleNo(){
	deleteVehicle();
}

function enableElements(){
	var myTable = document.getElementById('details');
	var controls = myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = false;		 
	}
	controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
		control.readOnly = false;		 
	}
}

function resetElements() {
	if(accountGroupId == ACCOUNT_GROUP_ID_LMT && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
		$("#vehicleNoMasterForm :input").attr("disabled", false);
		$('#vehicleOwner option[value="<%= TransportCommonMaster.OWN_VEHICLE_ID %>"]').remove();
	}
		
	resetElementsForOtherGroups();
}

function switchAgent(el) {
	var isAgent = document.getElementById(el).checked;
	
	document.vehicleNoMasterForm.agent.disabled = !isAgent;
}

function validateVehicleNumber(el) {
	if(accountGroupId == ACCOUNTGORUPID_DURGAMBA_MOTORS) {
		return true;
	}
	
	var reg = null;
	var numberFormat = null;
	
	if(customVehicleFormatAllowed){
		if(el.value.length == 12){
		reg = /[A-Za-z][A-Za-z][-][\d][\d][-][A-Za-z][-][\d][\d][\d][\d]/ig;
		numberFormat = 'CC-DD-C-DDDD';
	}else {
		if(el.value.length == 13){
			reg = /[A-Za-z][A-Za-z][-][\d][\d][-][A-Za-z][A-Za-z][-][\d][\d][\d][\d]/ig;
			numberFormat = 'CC-DD-CC-DDDD';
		}else{
			showMessage('error','Invalid Vehicle Number! The format is CC-DD-CC-DDDD or CC-DD-C-DDDD where C = Any Character [A-Z] and D = any Digit [0-9]');
			toogleElement('error','block');
			changeError1(el.id,'0','0');
			return false;
		}
		}
		
		if(el.value.match(/\s/ig) || !el.value.match(reg)){
			
			showMessage('error','Invalid Vehicle Number! The format is '+numberFormat+ 'where C = Any Character [A-Z] and D = any Digit [0-9]');
			toogleElement('error','block');
			changeError1(el.id,'0','0');
			return false;
		} else {
			toogleElement('error','none');
			removeError(el.id);
			return true;
		}
		
	}
	
	reg = /[\d]/ig;
	if(el.value.match(/\s/ig) || !el.value.match(reg)){
		
		showMessage('error','Invalid Truck Number! Enter any Digit [0-9] without spaces');
		/* showMessage('error','Invalid Vehicle Number! The format is '+numberFormat+' where C = Any Character [A-Z] and D = any Digit [0-9]'); */
		toogleElement('error','block');
		changeError1(el.id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(el.id);
		return true;
	}
}

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
		}
		if(chkValue <= 0) {
			showMessage('error',msg);
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		} else {
			toogleElement('error','none');
			removeError(id);
		}
		return true;
	};
}

function viewAllVehicles(){
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=vehicleNumberMasterDetails','newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function setHyphen(el) {
	if(el.value.length == 2 || el.value.length == 5){
		el.value = el.value+'-';
	}
}

function AllowDecimal(input) {
	input.value = input.value.replace(/[^0-9.]/g, '');

	var decimalCount = (input.value.match(/\./g) || []).length;

	if (decimalCount > 1) {
		input.value = input.value.substring(0, input.value.lastIndexOf('.'));
	}

	var parts = input.value.split('.');

	if (parts.length > 1) {
		input.value = parts[0] + '.' + parts[1].slice(0, 3);
	}
}

function setVehicleNumberHyphen(e) {
		var keynum;
		if(window.event){ // IE
			keynum = e.keyCode;
		} else if(e.which){ // Netscape/Firefox/Opera
			keynum = e.which;
		}
		//	Set Hyphen on CC-DD-CCDDDD
		var el = document.getElementById('vehicleNo');
		if(keynum != 8 && keynum != 46){
			if(el.value.length == 2 || el.value.length == 5){
				el.value = el.value+'-';
			}
		}
}

function initCalenderValidation(filter)
{	
	
	if ($('.fromDate').exists()) {
		$('.fromDate').datepicker({
			showWeek: true,
			dateFormat: 'dd-mm-yy',
			minDate:'01-01-1947',
			maxDate:'01-12-2050',
			buttonImage: "ui-icon-calendar",
			regional: "sv",
			showButtonPanel: false,
			buttonImageOnly: true,
			showWeekNumber: true,
			firstDay: 1,
			showOtherMonths: true,
			selectOtherMonths: true,
			changeMonth: true,
			changeYear: true,
			showOn: "both",
			showAnim: "slideDown"
		});
		
		$("#ui-datepicker-div").addClass("metro-skin");
	}
	
	//initCalender(configCalenderObject);
} 

function charsForAverage(e){
	var keynum;
	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8 || keynum == 45 || keynum == 46){
		return true;
	}
	if (keynum < 48 || keynum > 57 ) {
		return false;	
	}
	return true;
}

function charsForMaxFuel(e){
	var keynum;
	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8 || keynum == 45 || keynum == 46){
		return true;
	}
	if (keynum < 48 || keynum > 57 ) {
		return false;	
	}
	return true;
}

function setVehicleOwner(obj) {
	if(doNotResetOwnerDetails)
		return;
	
	document.vehicleNoMasterForm.regdOwner.value	= obj.options[obj.selectedIndex].text;
		
	if(agentsForGroup != undefined && agentsForGroup.length > 0) {
		for (let i = 0; i < agentsForGroup.length; i++) {
			if(obj.options[obj.selectedIndex].value == agentsForGroup[i].vehicleAgentMasterId) {
				document.vehicleNoMasterForm.panNo.value		= agentsForGroup[i].panNo;
				
				if(document.vehicleNoMasterForm.tdsDeductible != null) {
					if (agentsForGroup[i].tdsDeductible) {
						document.vehicleNoMasterForm.tdsDeductible[1].checked = true;
						
						document.vehicleNoMasterForm.tdsDeductible[1].disabled = true;
						document.vehicleNoMasterForm.tdsDeductible[0].disabled = true;
					} else
					    document.vehicleNoMasterForm.tdsDeductible[0].checked = true;
				}
				
				if( document.vehicleNoMasterForm.isSpecified != null) {
					if (agentsForGroup[i].isSpecified) {
					    document.vehicleNoMasterForm.isSpecified[1].checked = true;
					    
					    document.vehicleNoMasterForm.isSpecified[1].disabled = true;
						document.vehicleNoMasterForm.isSpecified[0].disabled = true;
					} else
					    document.vehicleNoMasterForm.isSpecified[0].checked = true;
				}
				
				if(document.vehicleNoMasterForm.ownerType != null) {
					if(agentsForGroup[i].ownerTypeId > 0)
						selectOptionByValue(document.vehicleNoMasterForm.ownerType, agentsForGroup[i].ownerTypeId);
					else
						document.vehicleNoMasterForm.ownerType.selectedIndex = 0;
				}
			}
		}
	}
}

function selectOptionByValue(selObj, val){
	var A= selObj.options, L= A.length;
  
	while(L) {
		if (A[--L].value == val) {
			selObj.selectedIndex= L;
			L= 0;
		}
	}
}

function selectOptionByRegion(selObj, subRegionId) {
	populateSubRegions(selObj);
	
	setTimeout(function() {
		if(subRegionId > 0)
			$('#allotedSubRegionId').val(subRegionId);
	}, 200);
}

function selectOptionBySubRegion(selObj, branchId) {
	populateBranches(selObj);
	
	setTimeout(function() {
		if(branchId > 0)
			selectOptionByValue(document.vehicleNoMasterForm.allotedBranchId, branchId);
	}, 200);
}

function selectRegionSubReginAndBranch(regionId, subRegionId, branchId) {
	$('#allotedRegionId').val(regionId);
	
	selectOptionByRegion(document.vehicleNoMasterForm.allotedRegionId, subRegionId);
	
	setTimeout(function() {
		selectOptionBySubRegion(document.vehicleNoMasterForm.allotedSubRegionId, branchId);
	}, 300);
}

function setMandatoryVehicleOwnerFeilds(el) {
	if (el.value != OWN_VEHICLE_ID) {
		$("b[title!='Required']").css('visibility', 'hidden');

		if (el.value == HIRED_VEHICLE_ID) {
			document.vehicleNoMasterForm.isAgent.disabled = false;
			document.vehicleNoMasterForm.isAgent.checked= true;
			document.vehicleNoMasterForm.agent.disabled = false;
			populateAgent(el);
		} else if (el.value == ATTACHED_VEHICLE_ID) {
			document.vehicleNoMasterForm.isAgent.disabled = false;
			document.vehicleNoMasterForm.isAgent.checked= true;
			document.vehicleNoMasterForm.agent.disabled = false;
			populateAgent(el);
		} else {
			document.vehicleNoMasterForm.isAgent.checked= false;
			document.vehicleNoMasterForm.agent.disabled = true;
			document.vehicleNoMasterForm.isAgent.disabled = true;
		}
		
		if(document.vehicleNoMasterForm.tdsDeductible != null) {
			document.vehicleNoMasterForm.tdsDeductible[1].disabled = true;
			document.vehicleNoMasterForm.tdsDeductible[0].disabled = true;
		}
			
		if(document.vehicleNoMasterForm.isSpecified != null) {
			document.vehicleNoMasterForm.isSpecified[1].disabled = true;
			document.vehicleNoMasterForm.isSpecified[0].disabled = true;
		}
			
		if(document.vehicleNoMasterForm.ownerType != null)
			document.vehicleNoMasterForm.ownerType.disabled = true;
	} else {
		if(accountGroupId == ACCOUNT_GROUP_ID_LMT)
			document.vehicleNoMasterForm.regdOwner.value = 'LALJI MULJI TRANSPORT CO.';

		document.vehicleNoMasterForm.isAgent.disabled = true;
		document.vehicleNoMasterForm.isAgent.checked= false;
		document.vehicleNoMasterForm.agent.disabled = true; 
		document.vehicleNoMasterForm.agent.selectedIndex = 0; 
		
		if(document.vehicleNoMasterForm.tdsDeductible != null) {
			document.vehicleNoMasterForm.tdsDeductible[1].disabled = false;
			document.vehicleNoMasterForm.tdsDeductible[0].disabled = false;
		}
		
		if(document.vehicleNoMasterForm.isSpecified != null) {
			document.vehicleNoMasterForm.isSpecified[1].disabled = false;
			document.vehicleNoMasterForm.isSpecified[0].disabled = false;
		}
		
		if(document.vehicleNoMasterForm.ownerType != null)
			document.vehicleNoMasterForm.ownerType.disabled = false;
	}
}

function populateAgent(obj){
	
	if(document.vehicleNoMasterForm.selectedVehicleNoId.value == ''
		|| document.vehicleNoMasterForm.selectedVehicleNoId.value == 0) {
		document.vehicleNoMasterForm.regdOwner.value = '';
		var listLength = 0;
		var k = 0;
		var agent = document.getElementById('agent');
	
		for(var i = 0; i < agentsForGroup.length; i++) {
			if(obj.value == agentsForGroup[i].vehicleOwnerId) {
			   listLength += 1;
			}			
		} 
	
		agent.options.length = listLength + 1;
	
		for(var i= 0; i < agentsForGroup.length; i++) {
			var temp = agentsForGroup[i].vehicleOwnerId;
		
			if(obj.value == temp) {
				if(k < listLength) {
					k += 1;
				}
			
				agent.options[k].value	= agentsForGroup[i].vehicleAgentMasterId; 
				agent.options[k].text	= agentsForGroup[i].name;
			}
		}
	}
}

function noSpclCharsExcludingDash(e) {
	var keynum = null;

	if(window.event) { // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}
	
	if(keynum == 8 || keynum == 45)
		return true;
	
	if((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127))
		return false;
	
	return true;
}

function showHideDocumentReceiveDateAndFileNumber(yesChecked){
	
	if(yesChecked) {
		$('#documentReceivedDateRow').removeClass('hide');
		$('#documentFileNoRow').removeClass('hide');
	} else {
		$('#documentReceivedDateRow').addClass('hide');
		$('#documentFileNoRow').addClass('hide');
	}
}

function validatepanNumber(){
	if(!validateInputTextFeild(8, 'panNo', 'panNo', 'info',	 validPanNumberErrMsg)) {
		setTimeout(function(){ 
			$('#panNo').focus(); 
			//showMessage('error', validPanNumberErrMsg);	
		}, 200);
		return false;
	}
}

function openPDFDetails() {
	$('#pdfSelection').empty();
	openPdfModel(noOfFileToUpload);
}

function updateMandatoryFieldLabelsWithAsterisks(fieldLableConfigurationMappings, vehicleOwnerTypeValue) {
	fieldLableConfigurationMappings.forEach(mandatoryField => {
		const { selector, condition } = mandatoryField;
		const isConditionMet = condition.split(',').map(Number).includes(vehicleOwnerTypeValue)		
		if (isConditionMet && vehicleOwnerTypeValue != 0) {
			if ($(selector).find('label b').length == 0) {
				$(selector).find('label').append('<b style="color: red; font-size: 20px;" title="Required">*</b>');
			}
		} else {
			$(selector).find('label b').remove();
		}
	});
}

function downloadAllVehicleDetailsCsv() {
    showLayer();    
    let jsonObject 			= new Object();
    jsonObject.isCSV 		= true;
    $.ajax({
        type: "POST",
        url: WEB_SERVICE_URL + '/vehicleNumberMasterWS/getAllVehicleNumberMasterDetail.do',
        data: jsonObject,
        dataType: 'json',
        success: function(response) {
            hideLayer();  
            if(response.message && response.message.messageId == 21)
                return;          
            if(response) { 
                generateFileToDownload(response);
                setTimeout(() => {
                    window.close();
                }, 1000);
            } else {
                showMessage('error', 'Failed to generate download file.');
            }
        }
    });
}