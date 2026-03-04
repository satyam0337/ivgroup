
var jsondata 				= null;
var configuration			= null;
var executive				= null;
var ChargeTypeMaster		= null;
var DeliveryRateMaster		= null;
var RateMaster				= null;
var TransportCommonMaster	= null;
var Branch					= null;
var CorporateAccount		= null;
var PartyMaster				= null;
var ExecutiveCon			= null;
var WayBill					= null;
var DeliveryChargeConfiguration		= null;
var CustomerDetails			= null;
var crLevelCharges			= null;
var chargesConfigRates		= null;
var areaArr					= new Array;
var deliveryCharges			= null;
var checkboxcount			= 5;
var deliveryRateMasterArray = null; 
var ChargeTypeConstant		= null;
var showDDMLorryHireMaster	= false;

function showHidePanel(obj){
	
	applyRates();
	resetAllComboboxes();
	$('#'+obj.id+'PanelView').show();
	if(obj.id == 'crlevelSection'){
		$('#chargesConfigPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	} else if(obj.id == 'chargesConfig'){
		$('#crlevelSectionPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	}  else if(obj.id == 'chargeTypeWiseRate'){
		destroyMultiselectPackingType();
		$('#articleTypePanel').hide();
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	} else if(obj.id == 'octroiConfig'){
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	} else if(obj.id == 'demurrageConfig'){
		multiselectDemarragePackingType()
		$('#demarrageArticleTypePanel').hide();
		
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
		enableDisableNoOfDays();
	} else if(obj.id == 'partyminimumamount'){
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#chargeapplicablePanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	}  else if(obj.id == 'chargeapplicable'){
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#ddmLorryHirePanelView').hide();
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	} else if(obj.id == 'ddmLorryHire'){
		$('#articleTypePanel').hide();
		$('#crlevelSectionPanelView').hide();
		$('#chargesConfigPanelView').hide();
		$('#octroiConfigPanelView').hide();
		$('#demurrageConfigPanelView').hide();
		$('#partyminimumamountPanelView').hide();
		$('#chargeTypeWiseRatePanelView').hide();
		$("#saidToContain").val("");
		$("#destBranchName").val("");

	}
}

function enableDisableNoOfDays(){
	$('#noOfDays').val(0);
	if($('#isFromeceivedDate').prop('checked')){
		$("#noOfDays").prop("readonly", true);
		if (configuration.showMinMaxDaysOnDemurrage) {
			$("#minMaxDaysPanel").removeClass('show');
			$("#minMaxDaysPanel").addClass('hide');
		}
	} else {
		$("#noOfDays").prop("readonly", false);
		if (configuration.showMinMaxDaysOnDemurrage) {
			$('#minDays').val(0);
			$('#maxDays').val(0);
			$("#minMaxDaysPanel").removeClass('hide');
			$("#minMaxDaysPanel").addClass('show');
		}
		
	}
}

//Validation from category type branch and party. its compulsory for all except. 
function validateMainSection() {

	if(!validateCategoryType()) {
		return false;
	}

	if(!validateBranch()) {
		return false;
	}

	if(!validateParty()) {
		return false;
	}
	return true;
}

//CR Charge Section validation
function validateCRChargeSection() {

	if(!validateMainSection()) {
		return false;
	}

	// iterating charges array and validating LR level charges 

	var charges			= jsondata.charges;
	var chk				= 0;
	var chargecount		= 0;

	for ( var i = 0; i < charges.length; i++) {
		if(jQuery.inArray(charges[i].chargeTypeMasterId, crLevelCharges) != -1) {
			chargecount++;
			var element = document.getElementById('charge'+charges[i].chargeTypeMasterId);
			if(element) {
				if (element.value == '' || element.value == 0 || element.value < 0) {
					chk++;
				}
			}
		}
	}

	if (chk == chargecount) {
		alert("Please enter charge amount !");
		return false;
	}

	return true;
}

function validateOctroiChargeSection() {

	if(!validateMainSection()) {
		return false;
	}

	// iterating charges array and validating LR level charges 

	var charges			= jsondata.charges;
	var chk				= 0;
	var chargecount		= 0;

	for ( var j = 0; j < charges.length; j++) {
		if(charges[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE
				|| charges[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM) {
			chargecount++;
			var element = document.getElementById('charge'+charges[j].chargeTypeMasterId);
			if(element) {
				if (element.value == '' || element.value == 0 || element.value < 0) {
					chk++;
				}
			}
		}
	}

	if (chk == chargecount) {
		alert("Please enter charge amount !");
		return false;
	}

	return true;
}

function validateCategoryType() {
	if(!validateInput(1, 'categoryType', 'categoryType', 'basicError', 'Please, Select Category !')) {
		return false;
	}
	return true;
}

function validateBranch() {
	if(!validateInput(1, 'branchId', 'branchName', 'basicError', 'Please, Select Branch !')) {
		return false;
	}
	return true;
}

function validateParty() {
	if ($('#categoryType').val() == RateMaster.CATEGORY_TYPE_PARTY_ID) {
		if(!validateInput(1, 'partyId', 'partyName', 'basicError', 'Please, Select Party !')) {
			return false;
		}
	}
	return true;
}

function validateEditAmountChargesDropdown1() {
	if(!validateInput(1, 'chargesDropDown1', 'chargesDropDown1', 'basicError', 'Please, Select Charge !')) {
		return false;
	}
	return true;
}

function validateEditAmountChargesDropdown2() {
	if(!validateInput(1, 'chargesDropDown2', 'chargesDropDown2', 'basicError', 'Please, Select Charge !')) {
		return false;
	}
	return true;
}

function validateCRLevelChargesDropdown3() {
	if(!validateInput(1, 'chargesDropDown3', 'chargesDropDown3', 'basicError', 'Please, Select Charge !')) {
		return false;
	}
	return true;
}

function validateChargeType() {
	if (!validateInput(1, 'chargeType', 'chargeType', 'basicError', 'Please, Select Charge Type !')) {
		return false;
	}
	return true;
}

function validateArticleType() {
	if ($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		if (!validateInput(3, 'articleType', 'articleType', 'basicError', 'Please, Select Article !')) {
			return false;
		}
	} else {
		$('#articleType').val(0);
	}
	return true;
}

function validateSlabs() {
	if (!validateInput(1, 'slabs', 'slabs', 'basicError', 'Please, Select Slab !')) {
		return false;
	}
	return true;
}

function validateDestination() {
	if (!validateInput(1, 'destination', 'destination', 'basicError', 'Please, Select Destination Type !')) {
		return false;
	}
	return true;
}

function validateDestinationTypes() {
	if ($("#multiIdlist").find('tr').length == 0) {
		if ($('#destination').val() == RateMaster.DESTINATION_TYPE_BRANCH) {
			alert('Please Select at least 1 destination branch');
			return false;
		} else if ($('#destination').val() == RateMaster.DESTINATION_TYPE_SUB_REGION) {
			alert('Please Select at least 1 destination area');
			return false;
		}
	}
	return true;
}

function validateRouteAmount() {
	if (!validateInput(1, 'routeAmount', 'routeAmount', 'basicError', 'Please, Enter Amount For Route !')) {
		return false;
	}
	return true;
}

function validateRateType() {
	if ($('#categoryType').val() == RateMaster.CATEGORY_TYPE_PARTY_ID) {
		if (!validateInput(1, 'rateType', 'rateType', 'basicError', 'Please, Select rate type !')) {
			return false;
		}
	}
	return true;
}
function validateDDmChargeType() {
	if (!validateInput(1, 'ddmChargeType', 'ddmChargeType', 'basicError', 'Please, Select Charge Type !')) {
		return false;
	}
	return true;
}

function validateDDMArticleType() {
	if ($('#ddmChargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
		if (!validateInput(3, 'ddmArticleType', 'ddmArticleType', 'basicError', 'Please, Select Article !')) {
			return false;
		}
	} else {
		$('#ddmArticleType').val(0);
	}
	return true;
}

function validateDDMRouteAmount() {
	if (!validateInput(1, 'ddmRouteAmount', 'ddmRouteAmount', 'basicError', 'Please, Enter Amount For Route !')) {
		return false;
	}
	return true;
}

function validateDestBranch() {
	if(!validateInput(1, 'destBranchId', 'destBranchName', 'basicError', 'Please, Select Dest Branch !')) {
		return false;
	}
	return true;
}


function routeWiseValidation() {

	if(!validateMainSection()) {
		return false;
	}

	if(!validateRateType()) {
		return false;
	}

	if(!validateEditAmountChargesDropdown2()) {
		return false;
	}

	if(!validateChargeType()) {
		return false;
	}

	if(!validateArticleType()) {
		return false;
	}

	/*if(!validateSlabs()) {
		return false;
	}*/

	if(!validateDestination()) {
		return false;
	}

	if(!validateDestinationTypes()) {
		return false;
	}

	if(!validateRouteAmount()) {
		return false;
	}

	return true;
}

function demurrageValidation() {

	if(!$("#isGroupLevel").prop('checked') && !validateMainSection()) {
		return false;
	}

	if(!validateInput(1, 'demarrageCofigType', 'demarrageCofigType', 'basicError', 'Please, Select Config Type !')) {
		return false;
	}

	if(!validateDemurrageArticleType()) {
		return false;
	}
	
	if(!validateInput(1, 'charge'+ChargeTypeMaster.DAMERAGE, 'charge'+ChargeTypeMaster.DAMERAGE, 'basicError', 'Please, enter Demurrage rate !')) {
		return false;
	}
	
	/*
	if(!validateInput(1, 'noOfDays', 'noOfDays', 'basicError', 'Please, enter no of days after Demurrage applicable !')) {
		return false;
	}*/
	
	if(!validateDemurrageDate()) {
		return false;
	}
	
	if(!validateDemurrageAmountTypeConfig()) {
		return false;
	}

	
	return true;
}

function validateDemurrageArticleType() {
	if ($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_QUANTITY_ID) {
		if (!validateInput(3, 'demarrageArticleType', 'demarrageArticleType', 'basicError', 'Please, Select Article !')) {
			return false;
		}
	} else {
		$('#demarrageArticleType').val(0);
	}
	return true;
}

function validateDemurrageAmountTypeConfig() {
	var bookingChargeIds		   = getDemurrageBookingChargeIds();	
	var isChecked 				   = $('#isApplicableOnBookingTotal').prop('checked');
	if ($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_AMOUNT_ID) {
		if(isChecked == false && bookingChargeIds.length <= 0) {
			showMessage('error', 'Please select calculated on booking total or booking time charges !'); 
			return false;
		}
	} 
	return true;
}

function validateDemurrageDate() {
	var noOfDays		  	 = $('#noOfDays').val();	
	var isFromeceivedDate 	 = $('#isFromeceivedDate').prop('checked');
	if(isFromeceivedDate == false && noOfDays <= 0) {
		showMessage('error', 'Please select Date Applicable On or No Of Day After Demurrage Applicable !'); 
		return false;
	}
	return true;
}

/*
 * Loads and set data on page initialization.
 * if got any error form server it remove all page contains and print the error
 */
function loadDeliveryRateMasterData() {

	showLayer();
	var jsonObject		= new Object();
	jsonObject.filter	= 1;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {

					jsondata				= data;

					executive				= jsondata.executive;
					ChargeTypeMaster		= jsondata.ChargeTypeMaster;
					RateMaster				= jsondata.RateMaster;
					TransportCommonMaster	= jsondata.TransportCommonMaster;
					Branch					= jsondata.Branch;
					CorporateAccount		= jsondata.CorporateAccount;
					PartyMaster				= jsondata.PartyMaster;
					WayBill					= jsondata.WayBill;
					DeliveryChargeConfiguration		= jsondata.DeliveryChargeConfiguration;
					CustomerDetails			= jsondata.CustomerDetails;
					ExecutiveCon			= jsondata.ExecutiveCon;
					configuration			= data.configuration;
					crLevelCharges			= jsondata.crLevelCharges;
					DeliveryRateMaster		= jsondata.DeliveryRateMaster;
					ChargeTypeConstant		= jsondata.ChargeTypeConstant;
					showDDMLorryHireMaster	= jsondata.showDDMLorryHireMaster;
					
					if (configuration.CRLevelSection) {
						$('#crlevelSectionListEle').show();
					}

					if (configuration.ChargeConfiguration) {
						$('#chargesConfigListEle').show();
					}

					if (configuration.ChargeTypeWiseRate) {
						$('#chargeTypeWiseRateListEle').show();
					}

					if (configuration.OctroiConfiguration) {
						$('#octroiConfigListEle').show();
					}

					if (configuration.DemurrageConfiguration) {
						$('#demurrageConfigListEle').show();
					}
					
					if (configuration.MinimumChargeConfiguration) {
						$('#partyminimumamountListEle').show();
					}

					if (configuration.ChargeApplicable) {
						$('#chargeapplicableListEle').show();
					}
					
					if (configuration.isGroupLevelCheckboxForDemurrage)
						$('#isGroupLevelRow').removeClass('hide');

					setCategoryType();
					setCRSectionCharges();
					setChargesApplicable();
					setChargesDropDown();
					setBookingType();
					setVehicleType();
					setChargeType();
					setArticleType();
					setDestination();
					setBranchAutoComplete();
					setPartyAutoComplete(); 
					setSaidToContainAutoComplete();
					
					if (showDDMLorryHireMaster) {
						$('#ddmLorryHireListEle').show();
						setDestBranchAutoComplete();
						setddmChargeType();
					}
					//setDestinationBranchAutoComplete();  // Not in used
					setDestinationArea();
					setOctroiChargesApplicable();
					setOctroiSectionCharges();
					setDemarrageSectionCharges(); 
					setDemarrageConfigType();
					setDemarrageArticleType();
					setBookingChargeDropDownForDemurrage();
					setRateType();
					enableDisableNoOfDays();
					$('input:text').css("text-transform","uppercase");	// transform all text content to uppercase
					$('input:text').prop("autocomplete","off");	// Auto suggestion off
					$("input:text").focus(function() {$(this).select(); });	// to select all text content onfocus

					hideLayer();
				}
			});
}

/*
 * get rates form chargeconfiguration table.
 */
function getChargesConfigRates() {

	let jsonObject					= new Object();
	jsonObject.branchId				= $('#branchId').val();
	jsonObject.corporateAccountId	= $('#partyId').val();
	jsonObject.requestType			= DeliveryChargeConfiguration.REQUEST_TYPE_RATE_MASTER;
	jsonObject.categoryTypeId		= $('#categoryType').val();
	jsonObject.selectionFilter		= 1;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=15",
			{json:jsonStr,filter:6}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', data.errorDescription);
					} else {
						resetAllConfigurationCharges();
					}
				} else {
					chargesConfigRates	= null;
					chargesConfigRates	= data.chargesConfigRates;
					deliveryCharges		= data.deliveryCharges;
					deliveryRateMasterArray = data.deliveryRateMasterArray;
					applyRates();
				}
				
				$("#saidToContain").val("");   
				$("#consignmentGoodsId").val("");
				$("#destBranchName").val("");
			});
}

function addOctroiCharges() {

	if(!validateOctroiChargeSection()) {
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();

	var octroichargesArray	= [];
	var jsonObjectdata 		= null; 
	var jsonObject			= new Object();
	
	var IsChargePercent = false;
	var IschargedFixed	= true;
	jsonObject.filter	= 15;
	jsonObject.branchId	= $('#branchId').val();
	jsonObject.partyId	= $('#partyId').val();
	jsonObject.slabs	= $('#slabs').val();
	jsonObject.categoryType	= $('#categoryType').val();
	
	if($('#octroiServicePercentCheck').prop('checked')){
		IsChargePercent = true;
		IschargedFixed	= false;
	} 

	//jsonObject.IsChargePercent = IsChargePercent;
	var customCharges		   = jsondata.customCharges;
	
	for ( var i = 0; i < customCharges.length; i++) {
		if(customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE 
			|| customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM ){
			
			if ($('#charge'+customCharges[i].chargeTypeMasterId).val() != 0) {
				jsonObjectdata = new Object();
				
				jsonObjectdata.chargeTypeMasterId = customCharges[i].chargeTypeMasterId;
				jsonObjectdata.routeAmount		  = $('#charge'+customCharges[i].chargeTypeMasterId).val();
				
				if(customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE){
					jsonObjectdata.IsChargePercent					   = IsChargePercent
				} else {
					IschargedFixed 		= true;
				}
				jsonObjectdata.applicableOn					  	   = ChargeTypeMaster.OCTROI_DELIVERY
				jsonObjectdata.chargedFixed						   = IschargedFixed
				octroichargesArray.push(jsonObjectdata);
			}
		}
	}

	jsonObject.octroiChargeWiseDataValueObject = octroichargesArray;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					alert("Charges Saved.");
				}
				hideLayer();
				getChargesConfigRates();
			});
}

//save LR section chrges. save if new update if exist
function addCRSectionCharges() {

	if(!validateCRChargeSection()) {
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();

	var jsonObject		= new Object();
	var crcharges		= new Object();
	jsonObject.filter	= 2;
	jsonObject.branchId	= $('#branchId').val();
	jsonObject.partyId	= $('#partyId').val();

	var charges	= jsondata.charges;

	for ( var i = 0; i < charges.length; i++) {
		if(jQuery.inArray(charges[i].chargeTypeMasterId, crLevelCharges) != -1) {
			if ($('#charge'+charges[i].chargeTypeMasterId).val() != 0) {
				crcharges[charges[i].chargeTypeMasterId]	= $('#charge'+charges[i].chargeTypeMasterId).val();
			}
		}
	}

	jsonObject.crcharges	= crcharges;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					alert("Charges Saved.");
				}
				hideLayer();
				getChargesConfigRates();
			});
}

//delete LR section chrges. save if new update if exist
function deleteCRSectionCharges() {

	if(!validateMainSection()) {
		return false;
	}

	if(!validateCRLevelChargesDropdown3()) {
		return false;
	}

	var response = confirm('Are you sure you want to Delete Charge ?');
	if (!response) {
		return false;
	}

	showLayer();

	var jsonObject		= new Object();
	var lrcharges		= new Object();
	jsonObject.filter	= 2;
	jsonObject.branchId	= $('#branchId').val();
	jsonObject.partyId	= $('#partyId').val();

	lrcharges[$('#chargesDropDown3').val()]	= 0;

	jsonObject.lrcharges	= lrcharges;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					alert("Charges Delete.");
				}
				hideLayer();
				getChargesConfigRates();
			});
}

//charges applicable permission for branch. save if new update if exist
function addApplicableCharges(obj) {
	if(!validateMainSection()) {
		if(obj.checked == true) {
			obj.checked	= false;
		} else {
			obj.checked	= true;
		}
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		obj.checked	= false;
		return false;
	}

	showLayer();

	var jsonObject		= new Object();

	jsonObject.filter		= 3;
	jsonObject.branchId		= $('#branchId').val();
	jsonObject.partyId		= $('#partyId').val();
	jsonObject.chargeId		= obj.getAttribute("data-value");
	jsonObject.flag			= obj.checked;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.Success) {
						alert("Charge Updated.");
					}
				}
				hideLayer();
				getChargesConfigRates();
			});
}

//Add octroi charge to group
function addOctroiChargesToGroup(obj) {

	if(!validateMainSection()) {
		if(obj.checked == true) {
			obj.checked	= false;
		} else {
			obj.checked	= true;
		}
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		obj.checked	= false;
		return false;
	}

	showLayer();

	var jsonObject		= new Object();

	jsonObject.filter		= 14;
	jsonObject.branchId		= $('#branchId').val();
	jsonObject.chargeId		= obj.getAttribute("data-value");
	jsonObject.statusFlag	= obj.checked;
	jsonObject.categoryType	= $('#categoryType').val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.Success) {
						alert("Charge Updated.");
					}
				}
				hideLayer();
				getChargesConfigRates();
		});
}

function addChargeTypeWiseCharge() {

	if (!routeWiseValidation()) {
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();

	var jsonObject		= new Object();

	jsonObject.filter			= 5;
	jsonObject.branchId			= $('#branchId').val();
	jsonObject.partyId			= $('#partyId').val();
	jsonObject.chargeId			= $('#chargesDropDown2').val();
	jsonObject.chargeType		= $('#chargeType').val();
	jsonObject.rateType			= $('#rateType').val();
	if($('#articleType').val() == -1){
		jsonObject.articleType = 0;
	}else{
		jsonObject.articleType		= $('#articleType').val();
	}
	jsonObject.packingTypeIds	= getPackingTypeIds();
	jsonObject.slabs			= $('#slabs').val();
	jsonObject.routeAmount		= $('#routeAmount').val();
	jsonObject.categoryType		= $('#categoryType').val();
	jsonObject.spFilter			= 1;
	jsonObject.chargedFixed		= false;
	
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.Success) {
						alert("Charges Saved.");
					} else {
						alert("Charges Not Saved.");
					}
				}
				hideLayer();
				resetRouteWiseCharges();
			});	
}


//charges edit amounts and editable permission. save if new update if exist
function addChargessAmount(obj) {

	if(!validateMainSection()) {
		return false;
	}

	if(!validateEditAmountChargesDropdown1()) {
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();

	var jsonObject		= new Object();

	jsonObject.filter		= 4;
	jsonObject.branchId		= $('#branchId').val();
	jsonObject.partyId		= $('#partyId').val();
	jsonObject.chargeId		= $('#chargesDropDown1').val();
	jsonObject.editable		= $('#editable').prop("checked");

	if ($('#editAmountTypePercent').prop("checked") == true) {
		jsonObject.editAmountType	= DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_PERCENTAGE;
	} else {
		jsonObject.editAmountType	= DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_SIMPLE;
	}

	jsonObject.editMaxValue		= $('#maxEditValue').val();
	jsonObject.editMinAmount	= $('#editableMinVal').val();
	jsonObject.editMaxAmount	= $('#editableMaxVal').val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNewAjaxAction.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.Success) {
						alert("Charge Updated.");
						//getChargesConfigRates();
					}
				}
				hideLayer();
				getChargesConfigRates();
			});
}

//Add demurrage charge
function addDemurrageCharge() {

	if (!demurrageValidation()) {
		return false;
	}

	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();
	var isFromeceivedDate				= false;
	var isApplicableOnBookingTotal		= false;

	var jsonObject				= new Object();

	jsonObject.filter			= 13;
	if(!$("#isGroupLevel").prop('checked')){
		jsonObject.branchId			= $('#branchId').val();
		jsonObject.partyId			= $('#partyId').val();
	}
	jsonObject.cofigType		= $('#demarrageCofigType').val();
	jsonObject.noOfDays			= $('#noOfDays').val();
	if (configuration.showMinMaxDaysOnDemurrage) {
		jsonObject.minDays			= $('#minDays').val();
		jsonObject.maxDays			= $('#maxDays').val();
	}
	jsonObject.routeAmount		= $('#charge'+ChargeTypeMaster.DAMERAGE).val();
	jsonObject.chargeId			= ChargeTypeMaster.DAMERAGE;
	jsonObject.slabs			= $('#slabs').val();
	jsonObject.chargedFixed		= false;
	
	if($('#demarrageArticleType').val() == -1){
		jsonObject.articleType = 0;
	}else{
		jsonObject.articleType		= $('#demarrageArticleType').val();
	}
	
	jsonObject.packingTypeIds	= getDemarragePackingTypeIds();
	
	if($('#isFromeceivedDate').prop('checked')){
		isFromeceivedDate = true;
	}
	jsonObject.isFromeceivedDate			= isFromeceivedDate;
	
	if($('#isApplicableOnBookingTotal').prop('checked')){
		isApplicableOnBookingTotal = true;
	}
	jsonObject.isApplicableOnBookingTotal	= isApplicableOnBookingTotal;
	jsonObject.applicableOnChargeIds	   	= getDemurrageBookingChargeIds();
	jsonObject.categoryType					= $('#categoryType').val();
	jsonObject.isGroupLevel					= $("#isGroupLevel").prop('checked');
	
	jsonObject.spFilter			   = 	2;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.Success) {
						alert("Charges Saved.");
					} else {
						alert("Charges Not Saved.");
					}
				}
				hideLayer();
				resetRouteWiseCharges();
			});	
}

//save minimum weight and ddslab amount in rate master
function getMinimumPartyRates() {

	var jsonObject		= new Object();

	jsonObject.filter			= 11;
	jsonObject.partyId			= $('#partyId').val();
	jsonObject.categoryType		= RateMaster.CATEGORY_TYPE_PARTY_ID;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data[RateMaster.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID]) {
						var wght = data[RateMaster.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID];
						$('#minWeight').val(wght.rate);
					}

					if (data[RateMaster.CHARGE_SECTION_PARTY_DDSLAB_ID]) {
						var ddslab = data[RateMaster.CHARGE_SECTION_PARTY_DDSLAB_ID];
						$('#ddSlab').val(ddslab.rate);
					}
				}
				hideLayer();
			});	
}

//get route wise rates to edit
function getChargeWiseRate() {

	if(!validateMainSection()) {
		return false;
	}

	showLayer();

	var jsonObject				= new Object();
	jsonObject.filter			= 8;
	jsonObject.branchId			= $('#branchId').val();
	jsonObject.partyId			= $('#partyId').val();
	jsonObject.categoryTypeId	= $('#categoryType').val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.empty) {
						alert('No Rates Found.');
						hideLayer();
						return;
					}

					if (data.Success) {
						createRatesEditData(data.rateMaster);
					}
					createJsPanel("Edit Charge Wise Charges");
					setDataTableToJsPanel();
				}
				hideLayer();
			});
}

function getDemurrageRate(){
	
	if(!$("#isGroupLevel").prop('checked') && !validateMainSection()) {
		return false;
	}

	showLayer();
	
	var jsonObject				= new Object();
	jsonObject.filter			= 16;
	if(!$("#isGroupLevel").prop('checked')){
		jsonObject.branchId			= $('#branchId').val();
		jsonObject.partyId			= $('#partyId').val();
	}
	jsonObject.chargeTypeMasterId = ChargeTypeMaster.DAMERAGE;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					if (data.empty) {
						alert('No Rates Found.');
						hideLayer();
						return;
					}

					if (data.Success) {
						createDemurrageRatesEditData(data.rateMaster);
					}
					createDemurrageRateJsPanel("Edit Demurrage Charges");
					setDataTableToDemurrageJsPanel();
				}
				hideLayer();
			});
	
}

function updateRateMasterRate(deliveryRateMasterId, rate) {

	var jsonObject				= new Object();
	jsonObject.filter			= 9;
	jsonObject.deliveryRateMasterId	= deliveryRateMasterId;
	jsonObject.rate				= rate;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					jspanelforratesEdit.close();
				} else {
					if (data.Success) {
						alert('Rate Updated');
					}
				}
			});
}

function deleteRateMasterRate(deliveryRateMasterId) {

	var jsonObject				= new Object();
	jsonObject.filter			= 10;
	jsonObject.deliveryRateMasterId		= deliveryRateMasterId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					jspanelforratesEdit.close();
				} else {
					if (data.Success) {
						alert('Rate deleted');
					}
				}
			});
}

function createRatesEditData(rateMaster) {

	if(!configuration.showDestinationBranch){
		$('#destBranchHeader').remove();
		$('#destBranchFooter').remove();
	}
	
	if(!configuration.showSaidToContainField)
		$('.saidToContainEditColumn').remove();

	$('#ratesEditTableTBody').empty();

	for (var i = 0; i < rateMaster.length; i++) {

		var rmId	= rateMaster[i].deliveryRateMasterId;
		var row		= createRow("tr_"+rmId, '');

		var col1	= createColumn(row, "td_"+rmId, '2%', 'right', '', '');
		var col2	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		
		if(configuration.showDestinationBranch)
			var col6	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
				
		var col3	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');

		if(configuration.showSaidToContainField)
			var col4	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');

		var col5	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col7	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col8	= createColumn(row, "td_"+rmId, '35%', 'left', '', '');

		col1.append(i);

		setHtml(col2, rateMaster[i].branch);

		if(configuration.showDestinationBranch)
			setHtml(col6, rateMaster[i].destinationBranchName);
		
		setHtml(col3, rateMaster[i].articleType);
		
		if(configuration.showSaidToContainField)
			setHtml(col4, rateMaster[i].consignmentGoodsName || "--");

		setHtml(col5, rateMaster[i].chargeName);

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'rate'+rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= rateMaster[i].rate;
		inputAttr1.name			= 'rate'+rmId;
		inputAttr1.style		= 'width: 50px;text-align: right;';
		inputAttr1.onkeypress	= 'validAmount(event);return noNumbers(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col7,inputAttr1);
		input.attr( {
			'data-value' : rmId
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+rmId;
		buttonEditJS.name		= 'edit'+rmId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'pure-button pure-button-primary';
		buttonEditJS.onclick	= 'editRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(col8, buttonEditJS);
		buttonEdit.attr({
			'data-value' : rmId
		});

		col7.append('&emsp;');

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+rmId;
		buttonSaveJS.name		= 'save'+rmId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'pure-button pure-button-primary';
		buttonSaveJS.onclick	= 'updateRate(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(col8, buttonSaveJS);
		buttonSave.attr({
			'data-value' : rmId
		});

		col7.append('&emsp;');

		var buttonDeleteJS		= new Object();
		var buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete'+rmId;
		buttonDeleteJS.name			= 'Delete'+rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'pure-button pure-button-primary';
		buttonDeleteJS.onclick		= 'deleteRate(this);';
		buttonDeleteJS.style		= 'width: 50px;';

		buttonDelete			= createButton(col8, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' : rmId

		});

		$('#ratesEditTableTBody').append(row);
	}
}


function createDemurrageRatesEditData(rateMaster) {	
	$('#demurrageratesEditTableTBody').empty();

	for (var i = 0; i < rateMaster.length; i++) {

		var rmId	= rateMaster[i].deliveryRateMasterId;
		var row		= createRow("tr_"+rmId, '');

		var col1	= createColumn(row, "td_"+rmId, '2%', 'right', '', '');
		var col2	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col3	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col4	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col5	= createColumn(row, "td_"+rmId, '10%', 'right', '', '');
		var col6	= createColumn(row, "td_"+rmId, '10%', 'right', '', '');
		var col7	= createColumn(row, "td_"+rmId, '5%', 'right', '', '');
		var col8	= createColumn(row, "td_"+rmId, '5%', 'right', '', '');
		var col9	= createColumn(row, "td_"+rmId, '5%', 'right', '', '');
		var col10	= createColumn(row, "td_"+rmId, '35%', 'left', '', '');

		col1.append(i);

		setHtml(col2, rateMaster[i].branch);
		setHtml(col3, rateMaster[i].configTypeName);
		setHtml(col4, rateMaster[i].articleType);
		setHtml(col5, rateMaster[i].daysFromReceiveDate);
		setHtml(col6, rateMaster[i].daysFromReceiveDate);
		setHtml(col7, rateMaster[i].noOfDays);
		setHtml(col8, rateMaster[i].chargeName);

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'rate'+rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= rateMaster[i].rate;
		inputAttr1.name			= 'rate'+rmId;
		inputAttr1.style		= 'width: 50px;text-align: right;';
		inputAttr1.onkeypress	= 'validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col9,inputAttr1);
		input.attr( {
			'data-value' : rmId
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+rmId;
		buttonEditJS.name		= 'edit'+rmId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'pure-button pure-button-primary';
		buttonEditJS.onclick	= 'editDemurrageRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(col10, buttonEditJS);
		buttonEdit.attr({
			'data-value' : rmId
		});

		col7.append('&emsp;');

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+rmId;
		buttonSaveJS.name		= 'save'+rmId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'pure-button pure-button-primary';
		buttonSaveJS.onclick	= 'updateDemurrageRate(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(col10, buttonSaveJS);
		buttonSave.attr({
			'data-value' : rmId
		});

		col7.append('&emsp;');

		var buttonDeleteJS		= new Object();
		var buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete'+rmId;
		buttonDeleteJS.name			= 'Delete'+rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'pure-button pure-button-primary';
		buttonDeleteJS.onclick		= 'deleteDemurrageRate(this);';
		buttonDeleteJS.style		= 'width: 50px;';

		buttonDelete			= createButton(col10, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' : rmId

		});

		$('#demurrageratesEditTableTBody').append(row);
	}
}

//set content on page initialization.
function setCategoryType() {
	removeOption('categoryType',null);
	createOption('categoryType', 0, "-- Select Category --");
	createOption('categoryType',RateMaster.CATEGORY_TYPE_GENERAL_ID, RateMaster.CATEGORY_TYPE_GENERAL_NAME);
	createOption('categoryType',RateMaster.CATEGORY_TYPE_PARTY_ID, RateMaster.CATEGORY_TYPE_PARTY_NAME);
}

function setRateType() {
	removeOption('rateType',null);
	createOption('rateType', 0, "-- Select Rate Type --");
	createOption('rateType',CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_NAME);
	createOption('rateType',CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_NAME);
}

function setDestinationArea() {
	removeOption('destinationArea',null);
	createOption('destinationArea', 0, "-- Select Area --");

	areaArr	= new Array();
	var areaObj	= null;

	var areas	= null;

	if (jsondata.destRegionAreas) {
		areas	= jsondata.destRegionAreas;
		for ( var i = 0; i < areas.length; i++) {
			areaObj	= new Object();
			areaObj.label	= areas[i].name;
			areaObj.id	= areas[i].regionId;
			areaArr.push(areaObj);
		}
	} else if (jsondata.destSubRegionAreas) {
		areas	= jsondata.destSubRegionAreas;
		for ( var i = 0; i < areas.length; i++) {
			areaObj	= new Object();
			areaObj.label	= areas[i].name;
			areaObj.id	= areas[i].subRegionId;
			areaArr.push(areaObj);
		}
	} else if (jsondata.destBranches) {
		areas	= jsondata.destBranches;
		for ( var i = 0; i < areas.length; i++) {
			areaObj	= new Object();
			areaObj.label	= areas[i].name;
			areaObj.id	= areas[i].branchId;
			areaArr.push(areaObj);
		}
	}
}

function setCRSectionCharges() {
	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		if(jQuery.inArray(charges[i].chargeTypeMasterId, crLevelCharges) != -1) {
			createCRSectionChargesInput(charges[i],'#tr_crSectionCharges','',false);
		}
	}
	createColumn('#tr_crSectionCharges','','20%','','','');
	createColumn('#tr_crSectionCharges','','20%','','','');
}

function createCRSectionChargesInput(charge,tableRow, style,isSpan) {

	var inputAttr1		= new Object();
	var chargeId		= charge.chargeTypeMasterId;
	var tableCol1		= createColumn(tableRow,'td_'+chargeId,'10%','left','','');
	var tableCol		= createColumn(tableRow,'td_'+chargeId,'10%','left','','');

	inputAttr1.id			= 'charge'+chargeId;
	inputAttr1.type			= 'text';
	inputAttr1.value		= '0';
	inputAttr1.name			= 'charge'+chargeId;
	inputAttr1.style		= 'width: 50px;';
	inputAttr1.class		= 'textfield_medium';
	inputAttr1.maxlength	= 5;
	inputAttr1.onkeypress	= 'return validAmount(event);';
	inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';

	createLabel(tableCol1, 'label'+chargeId, charge.chargeName + '', style, '', '');
	createInput(tableCol,inputAttr1);
	if(isSpan){
		var span = $('<span id = "unit"/>').html('');
		tableCol.append(span);
	}
	if(chargeId == ChargeTypeMaster.OCTROI_SERVICE){
		var input = $('<input id = "octroiServicePercentCheck" type = "checkbox"/>');
		var space = '&nbsp;&nbsp;';
		var percent = '%';
		tableCol.append(space);
		tableCol.append(input);
		tableCol.append(space);
		tableCol.append(percent);
	}
}

function setOctroiChargesApplicable() {
	var customCharges	= jsondata.customCharges;
	for ( var i = 0; i < customCharges.length; i++) {
		if ((configuration.OctroiService 
			&& customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE)
			|| (configuration.OctroiForm 
					&& customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM)) {
		createOctroiChargeEnable(customCharges[i],'#tr_octroiChargesCheckBox');
	  }
   }
}

function createOctroiChargeEnable(charge,tableRow) {

	var charges			= jsondata.charges;
	var chargeId		= charge.chargeTypeMasterId;
	var tableCol		= createColumn(tableRow,'td_'+chargeId,'20%','','','');
	var input			= null;
	var inputAttr1		= new Object();

	inputAttr1.id			= 'octroi'+chargeId;
	inputAttr1.type			= 'checkbox';
	inputAttr1.value		= chargeId;
	inputAttr1.name			= 'octroi'+chargeId;
	inputAttr1.onclick		= 'addOctroiChargesToGroup(this);';
	
	for ( var i = 0; i < charges.length; i++) {
		if(charges[i].chargeTypeMasterId == chargeId){
			inputAttr1.checked		= true;
		}
	}

	input	= createInput(tableCol,inputAttr1);
	input.attr( {
		'data-value' : chargeId
	});

	$(tableCol).append("&emsp;" + charge.chargeName);
}

function setOctroiSectionCharges() {
	var customCharges	= jsondata.customCharges;
	if (configuration.OctroiConfiguration) {
		for ( var i = 0; i < customCharges.length; i++) {
			if (configuration.OctroiService 
				&& customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE) {
				createCRSectionChargesInput(customCharges[i],'#tr_octroiCharges','',false);
			}
			if(configuration.OctroiForm 
					&& customCharges[i].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM){
				createCRSectionChargesInput(customCharges[i],'#tr_octroiCharges','',false);
			} 
		}
		createColumn('#tr_octroiCharges','','20%','','','');
		createColumn('#tr_octroiCharges','','20%','','','');
	}
}

function setDemarrageSectionCharges() {
	var customCharges	= jsondata.customCharges;
	if (configuration.DemurrageConfiguration) {
		for ( var i = 0; i < customCharges.length; i++) {
			if(customCharges[i].chargeTypeMasterId == ChargeTypeMaster.DAMERAGE){
				/*createCRSectionChargesInput(customCharges[i],'#tr_demarrageCharges','font-size: 15px;font-weight: bold;',true);*/
				createCRSectionChargesInput(customCharges[i],'#tr_demarrageCharges','',true);
			}
		}
		createColumn('#tr_demarrageCharges','','20%','','','');
	}
}

var tableRow	= null;
var counts		= 2;

function setChargesApplicable() {
	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		if (i % counts == 0) {
			createColumn(tableRow,'','40%','','','');
			tableRow		= createRow('tr_'+i,'');
		}
		createChargesApplicableInput(charges[i],tableRow);
	}
}

function createChargesApplicableInput(charge,tableRow) {

	var chargeId		= charge.chargeTypeMasterId;
	var tableCol		= createColumn(tableRow,'td_'+chargeId,'20%','','','');
	var input			= null;
	var inputAttr1		= new Object();

	inputAttr1.id			= 'applicableCharge'+chargeId;
	inputAttr1.type			= 'checkbox';
	inputAttr1.value		= chargeId;
	inputAttr1.name			= 'ChargesApplicableCB';
	inputAttr1.onclick		= 'addApplicableCharges(this);';

	input	= createInput(tableCol,inputAttr1);
	input.attr( {
		'data-value' : chargeId
	});

	$(tableCol).append("&emsp;" + charge.chargeName);
	$('#chargesApplicable').append(tableRow);
}

function setBookingChargeDropDownForDemurrage() {
	removeOption('demrrageBookingCharge',null);
	
	var bookingCharges	= jsondata.bookingCharges;
	if(!jQuery.isEmptyObject(bookingCharges)) {
			for ( var i = 0; i < bookingCharges.length; i++) {
			createOption('demrrageBookingCharge',bookingCharges[i].chargeTypeMasterId, bookingCharges[i].chargeName);
		}
	}
	multiselectCharge();
}

function destroyMultiselectCharge(){
	$("#demrrageBookingCharge").multiselect('destroy');
}

function multiselectCharge(){
	destroyMultiselectCharge();
	$('#demrrageBookingCharge').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
	$('#demrrageBookingCharge').change(function(){
		$('#isApplicableOnBookingTotal').prop('checked',false);
	});
}

function getDemurrageBookingChargeIds(){
	var  bookingChargeIds			= "";
	var selected					= $("#demrrageBookingCharge option:selected");
	selected.each(function () {
		bookingChargeIds += ( $(this).val() +",");
	});
	if(bookingChargeIds.length > 0){
		bookingChargeIds = bookingChargeIds.slice(0,-1)
	}
	return bookingChargeIds;
}

function setChargesDropDown() {
	removeOption('chargesDropDown1',null);
	createOption('chargesDropDown1', 0, "-- Select Charges --");
	removeOption('chargesDropDown2',null);
	createOption('chargesDropDown2', 0, "-- Select Charges --");
	removeOption('chargesDropDown3',null);
	createOption('chargesDropDown3', 0, "-- Select Charges --");
	removeOption('chargesDropDownForLrLevel',null);
	createOption('chargesDropDownForLrLevel', 0, "-- Select Charges --");
	removeOption('chargesApplicableForLrLevel',null);
	createOption('chargesApplicableForLrLevel', 0, "-- Select Charges --");
	
	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		createOption('chargesDropDown1',charges[i].chargeTypeMasterId, charges[i].chargeName);
		if(charges[i].chargeTypeMasterId != ChargeTypeMaster.OCTROI_SERVICE
		&& charges[i].chargeTypeMasterId != ChargeTypeMaster.OCTROI_FORM
		&& charges[i].chargeTypeMasterId != ChargeTypeMaster.DAMERAGE){
			createOption('chargesDropDown2',charges[i].chargeTypeMasterId, charges[i].chargeName);
			createOption('chargesDropDownForLrLevel',charges[i].chargeTypeMasterId, charges[i].chargeName);
			createOption('chargesApplicableForLrLevel',charges[i].chargeTypeMasterId, charges[i].chargeName);
			if(jQuery.inArray(charges[i].chargeTypeMasterId, crLevelCharges) != -1) {
				createOption('chargesDropDown3',charges[i].chargeTypeMasterId, charges[i].chargeName);
			}
		}
	}
}

function setBookingType() {
	removeOption('bookingType',null);
	createOption('bookingType', 0, "-- Select Booking Type --");
	createOption('bookingType',TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID, TransportCommonMaster.BOOKING_TYPE_SUNDRY_NAME);
	createOption('bookingType',TransportCommonMaster.BOOKING_TYPE_FTL_ID, TransportCommonMaster.BOOKING_TYPE_FTL_NAME);
}

function setChargeType() {
	removeOption('chargeType',null);
	createOption('chargeType', 0, "-- Select Charge Type --");
	createOption('chargeType', ChargeTypeConstant.CHARGETYPE_ID_WEIGHT, ChargeTypeConstant.CHARGETYPE_NAME_WEIGHT);
	createOption('chargeType', ChargeTypeConstant.CHARGETYPE_ID_QUANTITY, ChargeTypeConstant.CHARGETYPE_NAME_QUANTITY);
	createOption('chargeType', ChargeTypeConstant.CHARGETYPE_ID_FIX, ChargeTypeConstant.CHARGETYPE_NAME_FIX);
}

function setddmChargeType() {
	removeOption('ddmChargeType',null);
	createOption('ddmChargeType', 0, "-- Select Charge Type --");
	createOption('ddmChargeType', ChargeTypeConstant.CHARGETYPE_ID_WEIGHT, ChargeTypeConstant.CHARGETYPE_NAME_WEIGHT);
	createOption('ddmChargeType', ChargeTypeConstant.CHARGETYPE_ID_QUANTITY, ChargeTypeConstant.CHARGETYPE_NAME_QUANTITY);
	createOption('ddmChargeType', ChargeTypeConstant.CHARGETYPE_ID_FIX, ChargeTypeConstant.CHARGETYPE_NAME_FIX);
}

function setDemarrageConfigType() {
	removeOption('demarrageCofigType',null);
	createOption('demarrageCofigType', 0, "-- Select Config Type --");
	
	if (configuration.demarrageCofigTypeWeight) {
		createOption('demarrageCofigType', DeliveryRateMaster.CONFIG_TYPE_WEIGHT_ID, DeliveryRateMaster.CONFIG_TYPE_WEIGHT_NAME);
	}
	if (configuration.demarrageCofigTypeFixed) {
		createOption('demarrageCofigType', DeliveryRateMaster.CONFIG_TYPE_FIXED_ID, DeliveryRateMaster.CONFIG_TYPE_FIXED_NAME);
	}
	if (configuration.demarrageCofigTypeQuantity) {
		createOption('demarrageCofigType', DeliveryRateMaster.CONFIG_TYPE_QUANTITY_ID, DeliveryRateMaster.CONFIG_TYPE_QUANTITY_NAME);
	}
	if (configuration.demarrageCofigTypeAmount) {
		createOption('demarrageCofigType', DeliveryRateMaster.CONFIG_TYPE_AMOUNT_ID, DeliveryRateMaster.CONFIG_TYPE_AMOUNT_NAME);
	}
}

function setDestination() {
	removeOption('destination',null);
	createOption('destination', 0, "-- Select Destination --");
	createOption('destination', RateMaster.DESTINATION_TYPE_BRANCH, 'Branch');
	createOption('destination', RateMaster.DESTINATION_TYPE_SUB_REGION, 'Area Office');
}

function setArticleType() {
	removeOption('articleType',null);

	var packingTypeMastersArray = jsondata.packingType;

	if(!jQuery.isEmptyObject(packingTypeMastersArray)) {
		for(var i=0; i < packingTypeMastersArray.length; i++) {
			createOption('articleType', packingTypeMastersArray[i].packingTypeMasterId, packingTypeMastersArray[i].name);
			
			if (showDDMLorryHireMaster) {
				createOption('ddmArticleType', packingTypeMastersArray[i].packingTypeMasterId, packingTypeMastersArray[i].name);
			} 
		}
	}
	
	multiselectPackingType();
	if (showDDMLorryHireMaster) {
		multiselectDDMPackingType();
	}
	
}

function multiselectPackingType(){
	destroyMultiselectPackingType();
	$('#articleType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}


function destroyMultiselectPackingType(){
	$("#articleType").multiselect('destroy');
}

function multiselectDDMPackingType(){
	destroyMultiselectDDMPackingType();
	$('#ddmArticleType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}


function destroyMultiselectDDMPackingType(){
	$("#ddmArticleType").multiselect('destroy');
}

function getPackingTypeIds(){
	var  packingTypeIds			= "";
	var selected				= $("#articleType option:selected");
	
	selected.each(function () {
		packingTypeIds += ( $(this).val() +",");
	});
	
	if(packingTypeIds.length > 0) {
		packingTypeIds = packingTypeIds.slice(0, -1)
	}
	
	return packingTypeIds;
}

function setDemarrageArticleType() {

	removeOption('demarrageArticleType',null);

	var packingTypeMastersArray = jsondata.packingType;

	if(!jQuery.isEmptyObject(packingTypeMastersArray)) {
		for(var i=0; i < packingTypeMastersArray.length; i++) {
			createOption('demarrageArticleType', packingTypeMastersArray[i].packingTypeMasterId, packingTypeMastersArray[i].name);
		}
	}
	
	multiselectDemarragePackingType();
}

function multiselectDemarragePackingType(){
	destroyMultiselectDemarragePackingType();
	$('#demarrageArticleType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}


function destroyMultiselectDemarragePackingType(){
	$("#demarrageArticleType").multiselect('destroy');
}

function getDemarragePackingTypeIds(){
	let demarragePackingTypeIds			= [];
	let selected				= $("#demarrageArticleType option:selected");
	
	selected.each(function () {
		demarragePackingTypeIds.push($(this).val());
	});
	
	return demarragePackingTypeIds.join(",");
}

function getDDMPackingTypeIds(){
	let ddmPackingTypeIds			= [];
	let selected				= $("#ddmArticleType option:selected");
	
	selected.each(function () {
		ddmPackingTypeIds.push($(this).val());
	});
	
	return ddmPackingTypeIds.join(",");
}

function setVehicleType() {

	removeOption('vehicleType',null);

	var vehicleType = jsondata.vehicleType;

	createOption('vehicleType',0, '--Truck Type--');

	if(!jQuery.isEmptyObject(vehicleType)) {
		for(var i=0; i < vehicleType.length; i++) {
			createOption('vehicleType', vehicleType[i].vehicleTypeId, vehicleType[i].name);
		}
	}
}

function changeOnChargeType() {
	if ($('#chargeType').val() == CHARGETYPE_ID_WEIGHT
		|| $('#chargeType').val() == CHARGETYPE_ID_FIX ) {
		$('#articleTypePanel').hide();
	} else if ($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
		$("#articleType").multiselect('destroy');
		$('#articleTypePanel').show();
		setArticleType();
	}
}

function changeOnDDMChargeType() {
	if ($('#ddmChargeType').val() == CHARGETYPE_ID_WEIGHT
		|| $('#ddmChargeType').val() == CHARGETYPE_ID_FIX ) {
		$('#ddmArticleTypePanel').hide();
		$('#ddmSaidToContainPanel').hide();
	} else if ($('#ddmChargeType').val() == CHARGETYPE_ID_QUANTITY) {
		$('#articleTypePanel').show();
		$('#ddmArticleTypePanel').show();

		if(configuration.showSaidToContainField)
			$('#ddmSaidToContainPanel').show();
		
		setArticleType();
	}
	
}

function changeOnDemarrageConfigType() {
	if ($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_WEIGHT_ID
			|| $('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_FIXED_ID
			) {
		$('#demarrageArticleTypePanel').hide();
		$("#demarrageArticleType")[0].selectedIndex = 0;
		$('#amountPanel').hide();
		$('#isApplicableOnBookingTotal').prop("checked", false);
		
		if($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_WEIGHT_ID){
			$('#unit').html(ChargeTypeMaster.CHARGE_TYPE_UNIT_WEIGHT_NAME);
		}
		
		if($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_FIXED_ID){
			$('#unit').html(ChargeTypeMaster.CHARGE_TYPE_UNIT_FIX_NAME);
		}
		//destroyMultiselectCharge();
	} else if ($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_QUANTITY_ID) {
		destroyMultiselectDemarragePackingType();
		setDemarrageArticleType();
		$('#demarrageArticleTypePanel').show();
		$('#amountPanel').hide()
		$('#isApplicableOnBookingTotal').prop("checked", false);;
		$('#unit').html(ChargeTypeMaster.CHARGE_TYPE_UNIT_QUANTITY_NAME);
		//destroyMultiselectCharge();
	} else if ($('#demarrageCofigType').val() == DeliveryRateMaster.CONFIG_TYPE_AMOUNT_ID) {
		$('#demarrageArticleTypePanel').hide();
		$("#demarrageArticleType")[0].selectedIndex = 0;
		$('#amountPanel').show();
		$('#unit').html('');
	} else {
		$('#demarrageArticleTypePanel').hide();
		$("#demarrageArticleType")[0].selectedIndex = 0;
		$('#amountPanel').hide()
		$('#isApplicableOnBookingTotal').prop("checked", false);;
		$('#unit').html('');
		//destroyMultiselectCharge();
	}

	setBookingChargeDropDownForDemurrage();
}

function changeOnCategoryType() {
	if ($('#categoryType').val() == RateMaster.CATEGORY_TYPE_GENERAL_ID) {
		$('#branchPanel').show();
		$('#partyPanel').hide();
		$('#rateTypePanel').hide();
	} else if ($('#categoryType').val() == RateMaster.CATEGORY_TYPE_PARTY_ID) {
		$('#branchPanel').show();
		$('#partyPanel').show();
		$('#rateTypePanel').show();
	} else {
		$('#branchPanel').hide();
		$('#partyPanel').hide();
		$('#rateTypePanel').hide();
	}

	$('#branchName').val("");
	$('#partyName').val("");
	$('#branchId').val(0);
	$('#partyId').val(0);
	$('#destBranchName').val("");
	$('#destBranchId').val(0);
}

function changeOnDestinationBranch() {
	if ($('#destination').val() == RateMaster.DESTINATION_TYPE_BRANCH) {
		$('#destinationTypeComboPanel').prop('colspan', '0');
		$('#destinationBranchPanel').show();
		$('#deleteSelection').show();
		$('#destinationAreaPanel').hide();
	} else if ($('#destination').val() == RateMaster.DESTINATION_TYPE_SUB_REGION) {
		$('#destinationTypeComboPanel').prop('colspan', '0');
		$('#destinationAreaPanel').show();
		$('#deleteSelection').show();
		$('#destinationBranchPanel').hide();
	} else {
		$('#destinationBranchPanel').hide();
		$('#destinationAreaPanel').hide();
		$('#deleteSelection').hide();
		$('#destinationTypeComboPanel').prop('colspan', '7');
	}

	$('#multiIdlist').empty();
	$('#destinationBranch').val("");
	$('#destinationArea').val("");

}

function changeOnBookingType() {
	if($('#bookingType').val() == TransportCommonMaster.BOOKING_TYPE_FTL_ID) {
		$('#vehicleType').show();
	} else if($('#bookingType').val() == TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID) {
		$('#vehicleType').hide();
	}
}

//apply rates for selected branch or party
function applyRates() {

	resetAllConfigurationCharges();

	var chargeIds = new Array();

	if(chargesConfigRates != null && chargesConfigRates.length > 0){
		for ( var i = 0; i < chargesConfigRates.length; i++) {
			chargeId	= chargesConfigRates[i].chargeTypeMasterId;
			if(jQuery.inArray(chargeId, crLevelCharges) != -1) {
				$('#charge'+chargeId).val(chargesConfigRates[i].chargeMinAmount);
			}
			
			$('#applicableCharge'+chargeId).prop("checked", chargesConfigRates[i].applicable);
			
			if (chargeId == $('#chargesDropDown1').val()) {
				$('#editable').prop("checked", chargesConfigRates[i].editable);
				if (chargesConfigRates[i].editAmountType == DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_SIMPLE) {
					$('#editAmountTypePercent').prop("checked", false);
				} else if (chargesConfigRates[i].editAmountType == DeliveryChargeConfiguration.EDIT_AMOUNT_TYPE_PERCENTAGE) {
					$('#editAmountTypePercent').prop("checked", true);
				}
				$('#maxEditValue').val(chargesConfigRates[i].editMaxValue);
				$('#editableMinVal').val(chargesConfigRates[i].editMinAmount);
				$('#editableMaxVal').val(chargesConfigRates[i].editMaxAmount);
			}
			chargeIds.push(chargeId);
		}
		
	}

	// set default charges if not found in db
	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		var chargeId	= charges[i].chargeTypeMasterId;
		if(jQuery.inArray(chargeId, crLevelCharges) != -1) {
			$('#applicableCharge'+chargeId).prop("checked", true);
			if (chargeId == $('#chargesDropDown1').val()) {
				$('#editable').prop("checked", true);
			}
		}
	}
	
	if(deliveryCharges != null && deliveryCharges.length > 0){
		for ( var j = 0; j < deliveryCharges.length; j++) {
			if(deliveryCharges[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE
					|| deliveryCharges[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM) {
				$('#octroi'+deliveryCharges[j].chargeTypeMasterId).prop('checked', true);
			}
		}
	}
	if(deliveryRateMasterArray != null && deliveryRateMasterArray.length > 0){
		for ( var j = 0; j < deliveryRateMasterArray.length; j++) {               
			if(deliveryRateMasterArray[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_SERVICE
					|| deliveryRateMasterArray[j].chargeTypeMasterId == ChargeTypeMaster.OCTROI_FORM) {
				$('#charge'+deliveryRateMasterArray[j].chargeTypeMasterId).val(deliveryRateMasterArray[j].rate);
				if(deliveryRateMasterArray[j].chargePercent){
					$('#octroiServicePercentCheck').prop('checked', true);
				}
			}
		}
	}
}

//Check box creation code when selecting route wise charges destination
function createCheckBoxInMutliIdList(id, name) {
	var rowscounts = $("#multiIdlist").find('tr').length;
	var columnscounts = 0;

	if (rowscounts == 0) {
		tableRow		= createRow('tr_'+id,'');
	} else {
		columnscounts = $("#multiIdlist").find('tr:last')[0].cells.length;
	}

	if (columnscounts % checkboxcount == 0) {
		tableRow		= createRow('tr_'+id,'');
	}

	var inputAttr1		= new Object();
	var tableCol		= createColumn(tableRow,'td_'+id,'20%','','','');

	inputAttr1.id			= 'checkbox'+id;
	inputAttr1.type			= 'checkbox';
	inputAttr1.name			= 'multiIdCheckBox';
	inputAttr1.onclick		= 'checkAllCheckBox();';

	if ($('#destination').val() == RateMaster.DESTINATION_TYPE_BRANCH) {
		inputAttr1.value		= id;
	} else if ($('#destination').val() == RateMaster.DESTINATION_TYPE_SUB_REGION) {
		inputAttr1.value		= id;
	}

	var	input	= createInput(tableCol,inputAttr1);

	if ($('#destination').val() == RateMaster.DESTINATION_TYPE_BRANCH) {
		name = name.substring(0,name.indexOf('(')-1);
	}

	$(tableCol).append(name);
	$('#multiIdlist').append(tableRow);
}

//Select all checkboxes
function selectAllCheckbox(flag) {
	$("input[name='multiIdCheckBox']").prop("checked" , flag);
}

//Check and uncheck checkboxs select all functionaly
function checkAllCheckBox() {
	if ($("input[name='multiIdCheckBox']").length == $("input[name='multiIdCheckBox']:checked").length) {
		$("#selectAllMultiId").prop("checked", true);
	} else {
		$("#selectAllMultiId").prop("checked", false);
	}
}

//delete checkbox
function deleteMultiIdList() {
	if ($("#selectAllMultiId").prop("checked") == true) {
		$('#multiIdlist').empty();
	} else {
		$("input[name='multiIdCheckBox']:checked").closest("td").remove(); // closest function find closest tag of given id. 
	}
}

//reset full page to default
function resetAllConfigurationCharges() {
	$("input:checkbox").prop("checked" , false);
	$("#panelViewTD input[type=text]").val("0");
	$("#maxEditValue").val(0);
	$("#editableMinVal").val(0);
	$("#editableMaxVal").val(0);
	$("#routeAmount").val(0);
	$("#minWeight").val(0);
	$("#ddSlab").val(0);

	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		if(jQuery.inArray(charges[i].chargeTypeMasterId, crLevelCharges) != -1) {
			$('#charge'+charges[i].chargeTypeMasterId).val(0);
		}
	}
	if ($('#isFromeceivedDate').exists()) {
		$('#isFromeceivedDate').prop("checked" , true);
	}
}

function resetAllComboboxes() {
	var panel	= document.getElementById('ratePanels');
	var combos	= panel.getElementsByTagName("select");

	for(var i = 0; i < combos.length; i++) {
		var control = combos[i];
		control.selectedIndex = 0;
	}
}

function resetRouteWiseCharges() {
	$('#multiIdlist').empty();
	$('#routeAmount').val("0");
	setComboBoxIndex('routeWiseChargesTable select', 0); //$("#routeWiseChargesTable select").prop('selectedIndex', 0); //To reset All DropDown
	$("#destination").trigger( "onchange" );
	resetAllData();
	destroyMultiselectPackingType();
	$('#articleTypePanel').hide();
	destroyMultiselectDemarragePackingType();
	$('#demarrageArticleTypePanel').hide();
	$('#ddmArticleTypePanel').hide();
	$('#ddmSaidToContainPanel').hide();
	$("#isGroupLevel").prop('checked', false);
}

function resetAllData() {
	
	$('#branchName').val('');
	$('#partyName').val('');
	$('#branchId').val(0);
	$('#partyId').val(0);
	$('#destBranchId').val(0);
	$('#destBranchName').val("");
	
	$("#demarrageCofigType").prop('selectedIndex', 0);
	$('#charge13').val(0);
	$('#isFromeceivedDate').prop('checked',true);
	enableDisableNoOfDays()
	$("#isGroupLevel").prop('checked', false);
}
//main section barnch autocomplete
function setBranchAutoComplete() {
	$("#branchName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+Branch.TYPE_OF_LOCATION_PHYSICAL,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getDestination(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//main section party autocomplete
function setPartyAutoComplete() {
	$("#partyName").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#partyId').val(ui.item.id);
				getChargesConfigRates();
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//set branch from auto complete. work on onselect of autocomplete
function getDestination(branchId) {
	var destData = new Array();
	destData = branchId.split("_");

	var branchId 	= parseInt(destData[0]);

	$('#branchId').val(branchId);

	getChargesConfigRates();
	enableDisableNoOfDays();
}

/*//check if branch rate exist or not and add check box with area name and id. work on onselect of autocomplete
function getDestinationBranchForRoute(branchId, branchName) {
	var destData = new Array();
	destData = branchId.split("_");

	var branchId 	= parseInt(destData[0]);

	if($("#checkbox"+branchId).length == 0) {
		createCheckBoxInMutliIdList(branchId, branchName);
	} else {
		alert("Branch Already added.");
		return true;
	}

	var isExist	= checkRateExist(branchId);
	if(isExist) {
		var response = confirm("Branch rate already exist. Click yes if you want to override.");
		if (!response) {
			$('#checkbox'+branchId).prop("checked", "true");
			deleteMultiIdList();
		}
	}

}*/

//add check box with area name and id. work on onselect of autocomplete
function getDestinationAreaForRoute(areaId, areaName) {
	if($("#checkbox"+areaId).length == 0) {
		createCheckBoxInMutliIdList(areaId, areaName);
	} else {
		alert("Area Already added.");
	}
}

var jspanelforratesEdit	= null;
function createJsPanel(title) {
	var jspanelContent	= $('#jsPanelMainContent').html();

	jspanelforratesEdit = $.jsPanel({
		id: 'routewisejspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

var jspanelfordemurrageratesEdit	= null;
function createDemurrageRateJsPanel(title) {
	var jspanelContent	= $('#jsPaneldemurrageMainContent').html();

	jspanelfordemurrageratesEdit = $.jsPanel({
		id: 'demurragejspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function setHtml(col, value) {
	if (value != null && value != 'null' && value != '') {
		col.append(value);
	} else {
		col.append('--');
	}
}

function editRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #rate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #save'+rmId).show();
	$(obj).hide();
}


function editDemurrageRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#demurragejspanel #rate'+rmId).removeAttr('disabled');
	$('#demurragejspanel #save'+rmId).show();
	$(obj).hide();
}

function updateRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#routewisejspanel #rate'+rmId).val();
	updateRateMasterRate(rmId,rateValue);
	$('#routewisejspanel #rate'+rmId).prop('disabled', true);
	$('#routewisejspanel #edit'+rmId).show();
	$(obj).hide();
}

function updateDemurrageRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#demurragejspanel #rate'+rmId).val();
	updateRateMasterRate(rmId,rateValue);
	$('#demurragejspanel #rate'+rmId).prop('disabled', true);
	$('#demurragejspanel #edit'+rmId).show();
	$(obj).hide();
}

function deleteRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	deleteRateMasterRate(rmId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}


function deleteDemurrageRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	deleteRateMasterRate(rmId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

//create Datatable
function setDatatable(tableId) {
	var tabledata = $(tableId).DataTable( {

		"bPaginate": 	  false,
		"bInfo":     	  false,
		"bautoWidth":     true,
		"sDom": '<"top"l>rt<"bottom"ip><"clear">',
		"fnDrawCallback": function ( oSettings ) {

			//Need to redo the counters if filtered or sorted 
			if ( oSettings.bSorted || oSettings.bFiltered ) {
				for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
					$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
				}
			}
		},
		"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
		"aaSorting": [[ 1, 'asc' ]]
	});

	return tabledata;
}

function applySearchonDatatable(table, colIdx, searchId, searchFunction, toggalFilterId, toggelAllowed) {
	// Apply the search
	$( searchId, table.column( colIdx ).footer() ).on( searchFunction, function () {
		var valto	= this.value;
		table
		.column( colIdx )
		.search( valto, true, false, true)
		.draw();

		if (toggelAllowed) {
			$(this).closest(toggalFilterId).toggle(); // closest function find closest tag of given id.			
		}
	});
}

//Set Serach Items
function createCheckBoxForMultiSearchFilter(table, tableColumnToIterate, colIdx, appendTableId) {
	var srcBranchArr	= new Array();
	$(tableColumnToIterate).each(function (index) {
		if (srcBranchArr.indexOf($(this).html()) == -1) {
			srcBranchArr.push($(this).html());
			var row		= createRow("tr_", '');
			var col1	= createColumn(row, "td_", '200px', 'left', '', '2');
			var inputAttr1			= new Object();
			inputAttr1.id			= 'filter'+$(this).html();
			inputAttr1.type			= 'checkbox';
			inputAttr1.value		= $(this).html();
			inputAttr1.name			= 'filterCB';
			inputAttr1.onclick		= 'setFilter(this);';

			input	= createInput(col1,inputAttr1);
			input.attr( {
				'data-columnIdx' : colIdx
			});
			$(col1).append("&emsp;" + $(this).html());
			$( appendTableId, table.column( colIdx ).footer() ).append(row);
		}
	});
}

function setFilterOnTop(dataId, headerId) {
	$(dataId).insertAfter($(headerId));
}

function setFilterOverlayPopupToggle(popurId) {
	$(popurId).click(function() {
		$(this).closest("th").find('#popup').toggle(); // closest function find closest tag of given id.
	});
}

function setDataTableToJsPanel() {
	var tableId	= '#routewisejspanel #ratesEditTable';
	var tabledata = setDatatable(tableId);
	// get DataTable Instance
	var table = $(tableId).DataTable();

	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#routewisejspanel #ratesEditTable #ratesEditTableTBody td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#routewisejspanel #ratesEditTable #ratesEditTableTFoot .tfootClass', '#routewisejspanel #ratesEditTable #ratesEditTableTHead tr');
	setFilterOverlayPopupToggle('#routewisejspanel #toggle-popup');
}

function setDataTableToDemurrageJsPanel() {
	var tableId	= '#demurragejspanel #demurrageratesEditTable';
	var tabledata = setDatatable(tableId);
	// get DataTable Instance
	var table = $(tableId).DataTable();

	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#demurragejspanel #demurrageratesEditTable #demurrageratesEditTableTBody td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#demurragejspanel #demurrageratesEditTable #demurrageratesEditTableTFoot .tfootClass', '#demurragejspanel #demurrageratesEditTable #demurrageratesEditTableTHead tr');
	setFilterOverlayPopupToggle('#demurragejspanel #toggle-popup');
}

//set Filter button
function setFilter(obj) {
	var btnVal = $(obj).closest("#popup").find('#setData').val(); // closest function find closest tag of given id.
	if(obj.checked) {
		if(btnVal == "") {
			$(obj).closest("#popup").find('#setData').val(obj.value);
		} else {
			$(obj).closest("#popup").find('#setData').val(btnVal + '|' + obj.value);
		}
	} else {
		if (btnVal.match(/\|/g) == null) {
			btnVal	= "";
		} else {
			if (btnVal.substr(0, btnVal.indexOf('|')) == obj.value) {
				btnVal	= btnVal.replace(obj.value + '|', '');
			} else {
				btnVal	= btnVal.replace('|' + obj.value, '');
			}
		}
		$(obj).closest("#popup").find('#setData').val(btnVal);
	}
}



function setChargesApplicableDropDown(obj){
	removeOption(obj.id,null);
	createOption(obj.id, 0, "-- Select Charges --");
	var charges	= jsondata.charges;
	for ( var i = 0; i < charges.length; i++) {
		createOption(obj.id,charges[i].chargeTypeMasterId, charges[i].chargeName);
		
	}
}

function populateNextDropDown(obj,select_id){
	for(i=select_id.options.length-1;i>=0;i--)
	{
		if(select_id.options[i].value == obj.value)
			select_id.remove(i);
	}
}

function setAmountType(text_id,obj){
	
	if(!validateInput(1, text_id.id, text_id.id, 'basicError', 'Please, Insert charge greater than zero !')){
		$('#'+obj.id).prop("checked", false);
		return false;
	}
	
	text_id.value = text_id.value.replace('%', "");
	if(obj.checked && text_id.value >0){
	$('#'+text_id.id).val(text_id.value+'%');
	}else{
		$('#'+text_id.id).val(text_id.value);
	}
}

function saveCrLevelCharge(select1,select1_msg, textBox,textBox_msg, checkBox, select2,msg4){
	
	if(!validateMainSection()) {
		return false;
	}
	
	if(!validateFields(select1,select1_msg, textBox,textBox_msg, checkBox, select2,msg4)){
		return false;
	}
	
	var response = confirm('Are you sure you want to save Charge ?');
	if (!response) {
		return false;
	}

	showLayer();
	
	
	var jsonObject		= new Object();
	setData(jsonObject,select1,textBox,checkBox,select2);
	
	jsonObject.filter	= 12;
	jsonObject.branchId	= $('#branchId').val();
	jsonObject.partyId	= $('#partyId').val();
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("RateMasterNewAjaxAction.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					alert("Charges Saved.");
				}
				hideLayer();
				//getChargesConfigRates();
			});
	resetFields(select1,textBox,checkBox,select2);
}

function validateFields(select1,select1_msg, textBox,textBox_msg, checkBox, select2,select2_msg){
	if(!validateInput(1, select1.id, select1.id, 'basicError', select1_msg)){
		return false;
	}
	if(!validateInput(1, textBox.id, textBox.id, 'basicError', textBox_msg)){
		return false;
	}
	if(!validateInput(1, select2.id, select2.id, 'basicError', select2_msg)){
		return false;
	}
	return true;
}

function setData(jsonObject,select1,textBox,checkBox,select2){
	var isPercent	= false;
	var charge = Number(textBox.value.replace('%', ""));
	if(checkBox.checked){
		isPercent = true;
	}
	var chargeId = select1.value;
	var chargeApplicableOnId = select2.value;

	jsonObject.isPercent = isPercent; 
	jsonObject.chargeApplicableOn = chargeApplicableOnId; 
	jsonObject.chargeId 	= chargeId; 
	jsonObject.charge		= charge;
}


function resetFields(select1,textBox,checkBox,select2){
	$('#'+select1.id).val(0);
	$('#'+textBox.id).val("");
	$('#'+checkBox.id).prop("checked", false);
	$('#'+select2.id).val(0);
}

function addDDMLorryHireRate() {
	if(!validateMainSection()
	|| !validateDDmChargeType()
	|| !validateDDMArticleType()
	||($('#destBranchId').val() != "-1" && !validateDestBranch()))
		return false;   

	if(configuration.showSaidToContainField && $('#ddmChargeType').val() == 3 && $("#consignmentGoodsId").val() == 0) {
		showMessage('error', 'Please select a valid Said To Contain!'); 
		return false;
	}  
	
	if (!confirm('Are you sure you want to save Charge ?'))
		return false;

	showLayer();

	let jsonObject		= new Object();

	jsonObject.filter			= 17;
	jsonObject.branchId			= $('#branchId').val();
	jsonObject.partyId			= $('#partyId').val();
	jsonObject.chargeType		= $('#ddmChargeType').val();
	jsonObject.rateType			= $('#rateType').val();
	jsonObject.destBranchId		= $('#destBranchId').val();
	jsonObject.saidToContain	= $('#saidToContain').val();
	jsonObject.consignmentGoodsId= $('#consignmentGoodsId').val();

	jsonObject.packingTypeIds = getDDMPackingTypeIds();
	
	if($('#ddmArticleType').val() == -1)
		jsonObject.articleType = 0;
	else
		jsonObject.articleType		= $('#ddmArticleType').val();

	jsonObject.slabs			= $('#slabs').val();
	jsonObject.routeAmount		= $('#ddmRouteAmount').val();
	jsonObject.categoryType		= $('#categoryType').val();
	jsonObject.spFilter			= 1;
	jsonObject.chargedFixed		= false;
	
	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					console.log(data);
					if (data.Success) {
						showMessage("success" , "Data Saved Successfully !!");
					} else {
						showMessage("error" , "Charges Not Saved !!");
					}
				}
				hideLayer();
				resetRouteWiseCharges();
			});	
}

function getDDMLorryHireRate() {

	if(!validateMainSection()) {
		return false;
	}

	showLayer();

	var jsonObject				= new Object();
	jsonObject.filter			= 18;
	jsonObject.branchId			= $('#branchId').val();
	jsonObject.partyId			= $('#partyId').val();
	jsonObject.categoryTypeId	= $('#categoryType').val();
	jsonObject.destBranchId		= $('#destBranchId').val();

	var jsonStr = JSON.stringify(jsonObject);
	console.log(jsonObject);

	$.getJSON("DeliveryRateMasterNew.do?pageId=238&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					console.log(data);

					if (data.empty) {
						alert('No Rates Found.');
						hideLayer();
						return;
					}

					if (data.Success) {
						createRatesEditData(data.rateMaster);
					}
					createJsPanel("Edit Charge Wise Charges");
					setDataTableToJsPanel();
				}
				hideLayer();
			});
}

function setDestBranchAutoComplete() {
	$("#destBranchName").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+Branch.TYPE_OF_LOCATION_PHYSICAL+"&showAllBranchOption="+configuration.showAllOptionInDestinationBranchSelection,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				var destData = new Array();
				destData = ui.item.id.split("_");

				var branchId 	= parseInt(destData[0]);

				$('#destBranchId').val(branchId);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setSaidToContainAutoComplete() {
	$("#saidToContain").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=12",
		minLength: 2,
		delay: 250,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#consignmentGoodsId").val((ui.item.id).split("_")[0]);
			} else {
				$("#saidToContain").val("");   
				$("#consignmentGoodsId").val("");

				showMessage('error', 'No Records Found!'); 
			}
		},change: function(event, ui) {
			if (!ui.item) {
				$("#saidToContain").val("");   
				$("#consignmentGoodsId").val(""); 
			}
		}, open: function(){
			$('.ui-autocomplete').css('width', '250px'); 
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}
