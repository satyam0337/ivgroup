var executiveBranchId 					= 0;	
var executiveSubRegionId				= 0;	
var jsonLocationList 					= null;	
var isbranchSelectionByPendingStock 	= false;
var bookingChargeIdsList				= new Array();
var executive							= null;
var activeBookingCharges			= null;
var activeDeliveryChargesGlobal			= null; 
var paymentTypePermissionsGlobal		= null;
var discountTypesGlobal					= null;
var wbIdWiseBookingCharges				= null;
var wbIdWiseDeliveryCharges				= null;
var multipleRemarkGlobal				= null;


var CORPORATEACCOUNT_TYPE_DELIVERY		= 2;
var CORPORATEACCOUNT_TYPE_BILLING		= 4;
var configuration 						= null;
var tripHisabProperties					= null;
var allowDeliveryForBlackListedParty	= false;
var manualDDMWithAutoDDMSequence		= false;
var manualDDMWithManualDDMSequence		= false;
var showPartyIsBlackListedParty			= false;
var DoorDeliveryMemoSequenceCounter		= null;
var checkedManualDDM 					= null;
var manualDDMDaysAllowed 				= 0;
var vehicleDriverMappingAllowed			= false;
var	isAllowToAddVehicleWhileDdmCreation	= false;
var isNewDDMCreation					= false;
var defaultDieselBy						= 0;
var isAllowManualVehicle				= false;
var showOpeningKilometer				= false;
var totalLorryHire						= 0;
var showLrWiseLorryHireColumn			= false;
var showDivisionSelection			= false;
var ddbWiseSelfPartyId;
var validatePendingDDMSettlementWithinDateByVehicleNumber = false;

function showTruckLoadingDetails() {
	showLayer();

	displayTruckLoadingDetails();

	showLoadingDetails();
	showDispatchButton();
}

function showLRAndSummaryDetails(){
	lRAndSummaryDetailsDiv();
}

function initializeDetailsToGenerateDDM() {
	let jsonObjectdata = new Object();
	jsonObjectdata.filter = 18; 
	let jsonStr = JSON.stringify(jsonObjectdata);
	
	setTimeout(function() {
		console.log('configuration', configuration);
		showLayer();
	}, 500);

	$.getJSON("AjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					
					if(data.errorCode == 355 || data.errorCode == 382) {//if ddm sequence missing then remove fields and display message
						$('#branchSeelctionTR').remove();
						$('#destinationBranchSelectionTR').remove();
						$('#deliveryForDiv').remove();
						$('#lrSearchDiv').remove();
						$('#errorMessage').html(data.errorDescription);
					}
					
					hideLayer();
				} else {
					if(data.executive) {
						if(typeof createVideoLink != 'undefined') createVideoLink(data);
						configuration 					= data.configuration;
						showLrWiseLorryHireColumn		= data.showLrWiseLorryHireColumn;
						showDivisionSelection			= data.showDivisionSelection;
						
						let allowDDMValidationForSettlement = data.configuration.allowDDMValidationForSettlement;

						if(allowDDMValidationForSettlement) {
							let unsettledDDMNumbers = data.unsettledDDMNumbers;

							if(unsettledDDMNumbers.length != 0) {
								$("#top-border-boxshadow").hide();
								hideLayer();

								$('#popUpContentOnDDMLoad').bPopup({
									modalClose: false,
									opacity: 0.6,
									positionStyle: 'fixed'
								},function(){
									let _thisMod 			= this;
									$(this).html("<div class='confirm' style='font-size:15px; font-color:white; width: 435px;height: 180px;padding: 20px; border-width:4px;'><h1 style='font-size:20px;'>To create new DDM, please settle the DDM no :- <span style='font-size:20px;color:blue;'>"+unsettledDDMNumbers+"</span></h1>" +
									"<br/><input type='button'class='btn btn-primary' id='cancel' value='CANCEL' style='width:45%'/><input type='button'class='btn btn-danger' id='settleDDM' value='DDM Settlement' style='float:right;width:45%'/></div>" )

									$("#confirm").focus();
									$("#cancel").click(function(){
										location.reload(false);
										_thisMod.close();
									})

									$('#settleDDM').click(function() {
										window.location = "DoorDeliveryMemo.do?pageId=305&eventId=1";
									});
								});
								
								return false;
							}
						}

						tripHisabProperties						= data.tripHisabProperties;
						defaultDieselBy							= DEISEL_LITER_BY_BRANCH_ID;
						allowDeliveryForBlackListedParty	    = data.allowDeliveryForBlackListedParty;
						showPartyIsBlackListedParty				= data.showPartyIsBlackListedParty;
						manualDDMWithAutoDDMSequence			= data.manualDDMWithAutoDDMSequence;
						manualDDMWithManualDDMSequence			= data.manualDDMWithManualDDMSequence;
						DoorDeliveryMemoSequenceCounter			= data.DoorDeliveryMemoSequenceCounter;
						vehicleDriverMappingAllowed				= data.vehicleDriverMappingAllowed;
						manualDDMDaysAllowed					= data.manualDDMDaysAllowed;
						isNewDDMCreation						= configuration.isNewDDMCreation;
						isAllowManualVehicle					= configuration.isAllowManualVehicle;
						isAllowToAddVehicleWhileDdmCreation		= data.isAllowToAddVehicleWhileDdmCreation;
						ddbWiseSelfPartyId						= data.ddbWiseSelfPartyId;
						allowToDecreaseDefaultMemoCharge		= data.allowToDecreaseDefaultMemoCharge;
						validatePendingDDMSettlementWithinDateByVehicleNumber = configuration.validatePendingDDMSettlementWithinDateByVehicleNumber;
						
						if(data.discountTypes)
							discountTypesGlobal				= data.discountTypes;
						
						setValueToTextField('manualDDMDaysAllowed', manualDDMDaysAllowed);

						executive	= data.executive; 
						
						if(executive.branchId)
							executiveBranchId 	= executive.branchId; //executiveBranchId defined globally on main page
						
						if(executive.subRegionId)
							executiveSubRegionId 	= executive.subRegionId;
							
						if(data.bookingChargeIdsList)
							bookingChargeIdsList		= data.bookingChargeIdsList; 
							
						if(data.activeBookingCharges)
							activeBookingCharges			= data.activeBookingCharges;
							
						if(data.paymentTypePermissions)
							paymentTypePermissionsGlobal	= data.paymentTypePermissions;
						
						if(data.activeDeliveryCharges)
							activeDeliveryChargesGlobal		= data.activeDeliveryCharges;
						
						if(data.multipleRemark)
							multipleRemarkGlobal			= data.multipleRemark; 

						if(data.jsonLocationList) 
							jsonLocationList 	= data.jsonLocationList;	//jsonLocationList defined globally on main page
				
						if(configuration.showConsigneeNameAutoComplete) {
							setConsineeNameAutoComplete('consigneeNameAutocomplete');
							$("#consigneeNameId").removeClass('hide');
						} else
							$("#consigneeNameId").addClass('hide');
							
						if(configuration.showCustomerOptionForLRSearch) {
							setConsineeNameAutoComplete('customerNameId');
							$("#customerNameDiv").removeClass('hide');
						} else
							$("#customerNameDiv").remove();
						
						if(configuration.updateArticleRate)
							$("#articleRateId").removeClass('hide');
						else
							$("#articleRateId").addClass('hide');
						
						//hideLayer();
					}
				}
				
				setTimeout(function() {
					console.log('configuration', configuration);
					hideLayer();
				}, 1000);
			});
}

function searchDDMData () {
	getDataToGenerateDDM ();
}

function resetLRDetailsTable() {
	$('#middle-border-boxshadow').addClass('hide');
	$('#bottom-border-boxshadow').addClass('hide');
}

function hideNShowDDMSelection() {
	var searchBy = Number($( "#searchBy" ).val());

	$('#lrDetailsTableDiv').removeClass('show');
	$('#lrDetailsTableDiv').addClass('hide');
	$('#summaryTable').children().empty();
	$('#lrDetailsTable').children().empty();

	if(searchBy == 1) {
		$('#lrSearch').removeClass('hide');
		$('#lrNoTable').removeClass('hide');
		$('#searchButtonDiv').addClass('hide');
		$('#multipleLR').addClass('hide');
		$('#deliveryForDiv').addClass('hide');
	} else if (searchBy == 2) {
		$('#multipleLR').removeClass('hide');
		$('#searchButtonDiv').removeClass('hide');
		$('#deliveryForDiv').removeClass('hide');
		$('#lrSearch').addClass('hide');
		$('#lrNoTable').addClass('hide');
		$('#summaryDiv').addClass('hide');
		$('#middle-border-boxshadow').addClass('hide');
	}
}