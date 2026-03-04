var allowPreviousDeliveryNumber = false;
var generateAndValidateQROnUPIRechargePermission = false;
var isTCEBooking	= false;
var upiRechargeMessage					= '';
var deductPercentAmount					= 0;
var isDeductCharges						= false;
var openInvoicePrintPopUpAfterBkgDly = false;
function loadGenerateCRData(waybillNo,waybillId) {

	showLayer();
	var jsonObject		= new Object();
	jsonObject.filter	= 1;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("GenerateCRAjax.do?pageId=288&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error message on top of the window.
					$('#waybillNmber').prop('disabled', true);
					$('#waybillNmberDiv').hide();
					hideLayer();
				} else {
					jsondata					= data;
					executive					= jsondata.executive; // executive object
					execFldPermissions			= jsondata.execFldPermissions;
					// all constants
					taxes						= jsondata.taxes;
					TransportCommonMaster		= jsondata.TransportCommonMaster;
					WayBill						= jsondata.WayBill;
					Branch						= jsondata.Branch;
					ChargeTypeMaster			= jsondata.ChargeTypeMaster;
					PartyMaster					= jsondata.PartyMaster;
					WayBillType					= jsondata.WayBillType;
					CorporateAccount			= jsondata.CorporateAccount;
					FeildPermissionsConstant	= jsondata.FeildPermissionsConstant;
					showbillCredit				= jsondata.showbillCredit;
					DeliveryChargeConfiguration = jsondata.DeliveryChargeConfiguration;
					ReceivableTypeConstant		= jsondata.ReceivableTypeConstant;
					PaymentTypeConstant			= jsondata.PaymentTypeConstant;
					WayBillTypeConstant			= jsondata.WayBillTypeConstant;
					DeliveryChargeConstant		= jsondata.DeliveryChargeConstant;
					BookingChargeConstant		= jsondata.BookingChargeConstant;
					tdsConfiguration			= jsondata.tdsConfiguration;
					isTDSAllow					= tdsConfiguration.IsTdsAllow;
					isPanNumberMandetory		= tdsConfiguration.IsPANNumberMandetory;
					chargeIdsForTDSCalculation	= jsondata.DeliveryTimeChargeIdsForTDSCalculation;
					isDeliveryDiscountAllow		= jsondata.isDeliveryDiscountAllow;
					dbWiseSelfPartCA			= jsondata.dbWiseSelfPartCA;
					InfoForDeliveryConstant		= jsondata.InfoForDeliveryConstant;
					paymentTypeArr				= jsondata.paymentTypeArr;
					moduleId					= jsondata.moduleId;
					ModuleIdentifierConstant	= jsondata.ModuleIdentifierConstant;
					podDocumentTypeArr			= jsondata.podDocumentTypeArr;	
					incomeExpenseModuleId		= jsondata.incomeExpenseModuleId;
					branchId					= executive.branchId;
					branchOnNewCRPrint			= jsondata.branchOnNewCRPrint;
					ExecutiveTypeConstant		= jsondata.ExecutiveTypeConstant;
					godownList					= jsondata.GodownList;
					sendOTPForLrDelivery		= jsondata.sendOTPForLrDelivery;
					groupConfiguration			= jsondata.groupConfiguration;
					podConfiguration			= jsondata.podConfiguration;
					isAllowToEnterIDProof		= jsondata.idProofEntryALlow;
					maxFileSizeToAllow			= jsondata.maxFileSizeToAllow;
					idProofConstantArr			= jsondata.idProofConstantArr;
					IDProofConstant				= jsondata.IDProofConstant;
					discountInPercent			= jsondata.discountInPercent;
					shortCreditConfigLimit		= jsondata.shortCreditConfigLimit;
					branchWisePrepaidAmount		= jsondata.branchWisePrepaidAmount;
					allowPrepaidAmount 			= jsondata.allowPrepaidAmount;
					allowRechargeRequestAtBookingPage	= jsondata.allowRechargeRequestAtBookingPage;
					GeneralConfiguration				= jsondata.GeneralConfiguration;
					validatePhonePayTransaction 		= jsondata.validatePhonePeTxn;
					allowDynamicPhonepeQR		 		= jsondata.allowDynamicPhonepeQRDelivery;
					generateAndValidateQROnUPIRechargePermission = jsondata.GenerateAndValidateQROnUPIRechargePermission;
					upiRechargeMessage						= groupConfiguration.upiRechargeMessage;	
					deductPercentAmount						= jsondata.deductPercentAmount;	
					isDeductCharges							= jsondata.isDeductCharges;
					isGenerateQRCodePhonePeForUPIAllow		= jsondata.isGenerateQRCodePhonePeForUPIAllow;
					allowToSendQROnWhatsapp					= jsondata.allowToSendQROnWhatsapp;
					allowTransactionDateAndTimePhonePe	 	= jsondata.allowTransactionDateAndTimePhonePe;
					allowStandardCustomFlowPhonePe			=  jsondata.allowStandardCustomFlowPhonePe;
					
					if(branchWisePrepaidAmount != null && allowPrepaidAmount) {
						prepaidAmountId	= branchWisePrepaidAmount.prepaidAmountId;
						$('#currAmntDiv').css('display', 'inline')
						$('#currentBalAmountEle').html(branchWisePrepaidAmount.rechargeAmount);
					} else
						$('#currAmntDiv').css('display', 'none')
					
					if(allowRechargeRequestAtBookingPage) {
						$('#currAmntDiv').css('display', 'inline');
						$('#currentAmountLabel').css('display', 'none')
						$('#rcgRequest').show();
					}  else
						$('#rcgRequest').hide();
					
					if(shortCreditConfigLimit != null){
						if(shortCreditConfigLimit.creditType == 1)
							showMessage('info', 'Available Short Credit Limit ' + shortCreditConfigLimit.creditLimit + ' !');
						else if(shortCreditConfigLimit.creditType == 2)
							showMessage('info', 'Available Short Credit Balance ' + shortCreditConfigLimit.balance + ' !');
					}
					
					configuration			= data.configuration;
					DeliveryRateMaster		= data.DeliveryRateMaster;
					RateMaster				= data.RateMaster;
					ChargeTypeConstant		= data.ChargeTypeConstant;
					servicePermission		= data.servicePermission;
					
					isAllowBookingLockingWhenChequeBounce	= configuration.isAllowBookingLockingWhenChequeBounce;
					isAllowDeliveryLockingWhenChequeBounce	= configuration.isAllowDeliveryLockingWhenChequeBounce;
					allowAutoGenerateConEWaybill			= configuration.allowAutoGenerateConEWaybill;
					showTruckNumberField					= configuration.showTruckNumberField;
					wayBillTypeIds							= configuration.wayBillTypeWiseAllowPrepaidAmount;
					showPatialDeliveryButton				= data.showPatialDeliveryButton;
					
					setDeliveredToNameMobileLebel(jsondata);
					
					if(wayBillTypeIds != null && typeof wayBillTypeIds !=='undefined')
						wayBillTypeList		= wayBillTypeIds.split(',');
					
					stbsCreationAllowCheckBoxBySubregionIds 	= configuration.isShowStbsCreationAllowCheckBoxBySubregionId;
					headOfficeSubregionArr 				 		= stbsCreationAllowCheckBoxBySubregionIds.split(",");
					//octroiServiceCharge = jsondata.octroiServiceCharge ? Number(jsondata.octroiServiceCharge) : 0;

					//All Set Method Calling from generatecrSetReset.js
					setCharges(jsondata.bookingChgs, 'waybillBookingchargesList', BOOKING_CHARGE);
					
					if (configuration.branchWisePaymentTypeSelectionInDelivery == 'true') {
						var branchIdArr = (configuration.branchIdsForPaymentTypeSelectionInDelivery).split(',');
								
						if (isValueExistInArray(branchIdArr, branchId))
							configuration.showDeliveryPaymentType = 'true';
					}
					
					if(configuration.showDeliveryPaymentType == true || configuration.showDeliveryPaymentType == 'true')
						setPaymentType('deliveryPaymentType', paymentTypeArr);
					else
						$("#deliveryPaymentType").parent().addClass("hide");
					
					if(configuration.showGodownStockReportLink == true || configuration.showGodownStockReportLink == 'true')
						$("#godownStockLink").removeClass("hide");
					else
						$('#godownStockLink').remove();

					setSTPaidBy();
					execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_MANUAL_CR_DATE];
					
					if((configuration.showOnlyManualCrDate == 'true' || configuration.showOnlyManualCrDate == true) || 
							((execFeildPermission != null && execFeildPermission != undefined) && 
									(configuration.showManualCrOptionForUserWise == 'true'|| configuration.showManualCrOptionForUserWise == true))) {
						if((configuration.hideManualCrDateSubRegionWise == true || configuration.hideManualCrDateSubRegionWise == 'true')
								&& executive.subRegionId == configuration.SubRegionIdToHideManualCrDate) {
							$('#deliveryWithManualDate').hide();
						} else {
							$('#deliverySequenceCounter').remove();
							$('#manualCRDate').val(date(new Date(curDate),"-"));
						}
					} else {
						$('#deliveryWithManualDate').remove();
						setDeliverySequenceCounter();
					}
					
					setBillingBranchAutoComplete();
					setVehicleNumberAutocomplete();
					setCharges(jsondata.deliverChgs, 'deliveryCharges', DELIVERY_CHARGE);
					//setTaxes();
					setDiscountType();
					setAutocompleters();
					setReceivableTypes();
					showHideByProperty();
					setRecoveryBranchAutoComplete();
										
					if(GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
						$( "#chequeDetails" ).empty();
						$( "#creditDebitCardDetails" ).empty();
						$( "#paytmDetails" ).empty();
					} else {
						$( "#paymentTypeModal" ).remove();
						$( "#addedPaymentTypeModal" ).remove();
					}

					if ($('#chequeDate').exists()) {
						$('#chequeDate').val(date(new Date(),"-"));
						$('#chequeDate').datepicker({
							dateFormat: 'dd-mm-yy'
						});
					}

					if(!isAllowToEnterIDProof) {
						$( "#idProofModal" ).remove();
						$( "#addedIDProofModal" ).remove();
						$( "#openIdProofModel" ).remove();
						$( "#viewIDProofDetails" ).remove();
					}

					$('input:text').css("text-transform","uppercase");
					$('input:text').prop("autocomplete","off");
					$("input:text").focus(function() { $(this).select(); } );

					$('#waybillNmber').focus();

					if (configuration.DeliveryReceivedAmountAllowed != "true")
						$('#recvdAmt').switchClass("hide", "show");

					if(configuration.DisplayConsineeNameField == 'true') {
						switchHtmlTagClass('tableConsigneeName', 'show', 'hide');
						switchHtmlTagClass('consigneeNameAutocomplete', 'show', 'hide')
					}

					if(configuration.DisplayReceivablesTypeField == 'true') {
						changeDisplayProperty('tableReceivable', 'table-cell');
						switchHtmlTagClass('receivable', 'show', 'hide');
					}
					
					if(configuration.DisplayApprovedByField == 'true') {
						switchHtmlTagClass('tableApprovedBy', 'show', 'hide');
						switchHtmlTagClass('approvedBy', 'show', 'hide');
					}

					startServices();

					initialiseFocus();
					
					hideLayer();
					showEditDeliveryAt();
					displayApprovedByField();

					setPartialPaymentTypeOption();
					bindFocusOnLastCharge();
					
					if(window.opener != undefined)
						childwind	= window.opener;
					
					if(waybillId > 0)
						callfromStockReport(waybillNo,waybillId);
				}
			});
}

function callfromStockReport(waybillNo,waybillId){
	if(waybillNo != undefined && waybillNo != null && waybillNo != "null"){
		$('#waybillNmber').val(waybillNo);
		$('#oldLrNumber').val(waybillNo);
	}
	
	if(waybillId != undefined && waybillId != null && waybillId != "null")
		getWaybillData(waybillId);
}

var childwind;
function pendingDeliveryReport() {
	var godownStockIdentity		= configuration.GodownStockReportLink.split("?")[0];
	var godownStock				= configuration.GodownStockReportLink.split("?")[1];
		
	if(childwind != undefined && childwind.closed)
		openGodownStockReport(godownStockIdentity, false);
	else if(localStorage.getItem("flagForGodwonStockReport") == undefined && childwind == undefined)
		openGodownStockReport(godownStockIdentity, false);
	else if(childwind != undefined) {
		var reportUrl 		= childwind.location.href.split("?")[1];
		window.blur(); 
		childwind.focus();  
		childwind.alert("press OK");
		
		if(reportUrl != undefined) {
			var pageId						= reportUrl.split("&")[0];
			var eventId						= reportUrl.split("&")[1];
			var godownStockPageId			= godownStock.split("&")[0];
			var godownStockEventId			= godownStock.split("&")[1];
			
			if(godownStockPageId != pageId || godownStockEventId != eventId)
				openGodownStockReport(godownStockIdentity, true);
		}
	} 
}
	 
function openGodownStockReport(godownStockIdentity,locationReplace){
	localStorage.setItem("flagForGodwonStockReport", true);
	var godownId	= 0;

	if(godownList != null && godownList.length > 0) {
		godownId	= godownList[0].godownId;
	} 
	
	if(locationReplace) {
		if(/Reports/i.test(godownStockIdentity))
			childwind.location = configuration.GodownStockReportLink+'&region='+0+'&TosubRegion='+executive.subRegionId+'&SelectDestBranch='+branchId+'&subRegion='+0+'&branch='+0;
		else
			childwind.location = configuration.GodownStockReportLink+'&region='+executive.regionId+'&subRegion='+executive.subRegionId+'&branch='+branchId+'&godownId='+godownId;
	} else if(/Reports/i.test(godownStockIdentity))
		childwind = window.open (configuration.GodownStockReportLink+'&region='+0+'&TosubRegion='+executive.subRegionId+'&SelectDestBranch='+branchId+'&subRegion='+0+'&branch='+0);
	else
		childwind = window.open (configuration.GodownStockReportLink+'&region='+executive.regionId+'&subRegion='+executive.subRegionId+'&branch='+branchId+'&godownId='+godownId);
}

function checkIfWebCamIsStreaming(config){
	if(typeof $("#picVideo").attr('data-video') == 'undefined') {
		window.setTimeout(function() {checkIfWebCamIsStreaming(config)},500);
	} else {
		$('#photoService').prop('disabled', false);
		hideLayer();
	}
}

function disableDoorDeliverCharge() {
	if(document.getElementById('deliveryAt').style.display != 'none' && $('#deliveryTypeId').val() != InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
		$("#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).prop('readonly', true);
}

function setValueToPhoneNo() {
	//document.getElementById('deliveredToPhoneNo').value = 0;
}

function showHideByProperty() {
	if(showPatialDeliveryButton)
		changeDisplayProperty('partialDetails', 'inline');
		
	if(configuration.displayStatusDetails == 'true')
		changeDisplayProperty('statusDetails', 'inline');

	if(configuration.displayDispatchDetails == 'true')
		changeDisplayProperty('dispatchDetails', 'inline');

	if(configuration.ReceiveSingleLR == 'true')
		changeDisplayProperty('receiveSingleLR', 'inline');

	if(configuration.DefaultPanNumber == 'true')
		changeDisplayProperty('panNumber', 'inline');

	if(isTDSAllow)
		changeDisplayProperty('isTdsRequired', 'inline');
		
}

function checkEventforProcess(event) {
	var key	= getKeyCode(event);

	if (key == 8 || key == 46 ) {
		resetData();
		return;
	}

	if (key == 13) {
		if (enterCount == 0) {
			resetData();
			getWayBillDetails();
			goToManualSelection();
			setNextPreviousForDeliver();
			enterCount++;
		}
		
		return;
	} else {
		enterCount	= 0;
	}
}

function setWaybillDetailsData(data) {
	setViewPartialDeliveryButtons(data);
	setViewStatusDetailsButtons(data.wayBillId);
	setViewDispatchDetailsButtons(data.wayBillId);

	if (data.userErrorId) {
		if (data.userErrorDescription) {
			showMessage('error', data.userErrorDescription);

			if(data.flagToReceive) {
				setDataForReceive(data);
				setReceiveButtons(data.wayBillId);
			}
			
			hideLayer();
			return;
		} else {
			hideAllMessages();
		}
	}

	removeTableRows('taxes', 'tbody');
	$('#createInvoice').prop("checked", false);

	if(configuration.kalpanaCargoUnloadingCalculation == true || configuration.kalpanaCargoUnloadingCalculation == 'true')
		setUnloadingAmountKcpl(data);
	
	if(configuration.applyRatePerAerticle == true || configuration.applyRatePerAerticle == 'true')
		applayRatePerArticle(data);
		
	isTCEBooking	= data.isTCEBooking;
	
	setWayBillData(data);
	
	if(configuration.setPrevDeliveredToNameAndNumber == true || configuration.setPrevDeliveredToNameAndNumber == 'true')
		setPrevDeliveredToNameAndNumber();

	for(var i in taxes){
		if(transportModeId == 3)
			taxes[i].taxAmount = taxes[i].taxMasterId == 4 ? 18 : 9;
	}
	
	if(!isTCEBooking)
		setTaxes(data.wayBillId);
		
	if(isTCEBooking && (configuration.showDeliveryPaymentType == true || configuration.showDeliveryPaymentType == 'true')) {
		let newArray = paymentTypeArr.filter(function (el) {
			return el.paymentTypeId != PAYMENT_TYPE_CREDIT_ID && el.paymentTypeId != PAYMENT_TYPE_BILL_CREDIT_ID;
		});
			
		setPaymentType('deliveryPaymentType', newArray);
	}
	
	$('#waybillNmber').val("");

	if(configuration.applyRateAuto == 'true' && !isTCEBooking) {
		getDeliveryChargesConfigRates($('#consigneeCorpAccId').val(),data.wayBillId);
		wayBillConsignmentDetails 	= data.consignmentDetails;
		wayBillConsignmentSummary 	= data.consignmentSummary;
		unloadingChargeAmount 		= Number(configuration.unloadingChargeRatePerArticle) * wayBillConsignmentSummary.quantity;
		getDeliveryRates($('#consigneeCorpAccId').val(), data.consignmentDetails, data.consignmentSummary, 0);
	}

	if (configuration.GenerateCashReciptLinks == 'true' && !isTCEBooking)
		editlrlinks(execFldPermissions, TransportCommonMaster, ChargeTypeMaster, data, configuration);
	else
		$('.editlrlinkscharges').remove();

	if(jsondata.WayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate) {
		var wayBillTypeList		= (configuration.WayBillTypeIdsForDiscountAmountOnChangeOfConsigneePartyRate).split(',');

		if(isValueExistInArray(wayBillTypeList, $('#waybillTypeId').val()))
			getBookingRates($('#consigneeCorpAccId').val(),data.wayBillId); //defined in ApplyRate.js
	}

	disableDoorDeliverCharge();
	setPodDocumentTypes();

	calulateBillAmount();
	hideShowRecoveryBranch();
	switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
	initialiseFocus();
	hideLayer();
	$('#deliveryPaymentType').focus();
	
	if((configuration.isShowStbsCreationAllowCheckBox == 'true'|| configuration.isShowStbsCreationAllowCheckBox == true) &&
			(isValueExistInArray(headOfficeSubregionArr, executive.subRegionId) || isValueExistInArray(headOfficeSubregionArr, 0))) {	
		if(Number($('#deliveryPaymentType').val()) == PAYMENT_TYPE_CREDIT_ID) {
			$("#stbscreationallowId").css('display','inline-block');
			if(isValueExistInArray(headOfficeSubregionArr, executive.subRegionId)){
				$('#isstbscreationallowId').prop('checked', true);
				$('#isstbscreationallowId').prop('disabled', true);
			}
		} else {
			$("#stbscreationallowId").css('display','none');
			$("#isstbscreationallowId").prop("checked", false);
		}
	}
	
	if( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
			&& (configuration.isAllowDeliveryLockingWhenChequeBounce == 'true' || configuration.isAllowDeliveryLockingWhenChequeBounce == true))
			stopDeliveryWhenChequeBounce();
}

function getWaybillData(wayBillId) {
	resetData();

	var jsonObject					= new Object();

	jsonObject.filter				= 2;
	jsonObject.WayBillId			= wayBillId;

	var jsonStr = JSON.stringify(jsonObject);

	showLayer();

	$.getJSON("GenerateCRAjax.do?pageId=288&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					deliveryAllowed			= false;
					hideLayer();
				} else {
					if(data.deliveryAllowed == undefined)
						deliveryAllowed			= true;
					else
						deliveryAllowed			= data.deliveryAllowed;
					
					completeDeliveryLocking 	= data.completeDeliveryLocking;
					shortCreditDeliveryLocking 	= data.shortCreditDeliveryLocking;
					ConsigneeName 				= data.ConsigneeName;
					sendOTPForLrDelivery		= data.sendOTPForLrDelivery;
					configuration				= data.configuration;
					allowDeliveryTimeOtp		= data.ALLOW_DELIVERY_TIME_OTP;
					
					if(completeDeliveryLocking){
						showMessage('info', 'Cannot Deliver any further LR of party - '+ConsigneeName+'. Please clear all short credit outstanding.');
						hideLayer();
						return;
					}
					
					setWaybillDetailsData(data);
				
					if(data.showPODStatus)
						switchHtmlTagClass('poddispatchStatus', 'show', 'hide');
					else
						$('#poddispatchStatus').remove();
				
					if(podConfiguration.setDefaultPODStatusNo)
						switchHtmlTagClass('poddispatchStatus', 'hide', 'show');
					
					if(configuration.isAllowPopUpForPendingLRs == 'true')
						getLRByConsigneeNumber();
						
					if(showPatialDeliveryButton) {
						$('#paymentDetailsTable').removeClass('hide');
						$('.hideDlyCharges').removeClass('hide');
					}
				}
			});
}

function getWaybillNumber() {
	var waybillNmber =	$('#waybillNmber').val();
	return waybillNmber.replace(/\s+/g, "");
}

function setSTPaidEnterNavigation() {
	if (configuration.DeliverySTPaidBy == 'true' && !isTCEBooking) {
		prev = 'deliveredToName';
		next ='STPaidBy';
	} else {
		prev = 'deliveredToName';
		next ='deliveryRemark';
	}
}

function setWayBillData(wbData) {
	if (configuration.DeliverySTPaidBy == 'true' && !isTCEBooking)
		$('#STPaidByDiv').switchClass("show", "hide");
	else
		$('#STPaidByDiv').switchClass("hide", "show");

	if (configuration.ReceiverToNameValidate == 'true')
		$('#ReceiverToNameDiv').switchClass("show", "hide");
	else
		$('#ReceiverToNameDiv').switchClass("hide", "show");

	$('#bottom-border-boxshadow').switchClass("show", "hide");

	var waybillMod			= wbData.waybillMod;
	var consignmentSummary	= wbData.consignmentSummary;
	var consignorDetails	= wbData.consignorDetails;
	var consigneeDetails	= wbData.consigneeDetails;
	allowDeliveryTimeOtp    = wbData.ALLOW_DELIVERY_TIME_OTP;

	consignorGstn			= consignorDetails.gstn;
	consigneeGstn			= consigneeDetails.gstn;
	consignorEmail			= consignorDetails.emailAddress;
	consigneeEmail			= consigneeDetails.emailAddress;
	blackListed				= consigneeDetails.blackListed;
	discountOnTxnType		= consigneeDetails.discountOnTxnType;
	isConsigneePartyTbb		= consigneeDetails.isTbbParty != null && consigneeDetails.isTbbParty;
	deliveryCreditorId		= consigneeDetails.corporateAccountId;
	
	bookingServiceTax		= 0;
	deliveryTo				= consignmentSummary.deliveryTo;
	transportModeId			= waybillMod.transportModeId;
	billSelectionId	   		= consignmentSummary.billSelectionId;
	
	consignorBlackListed	= consignorDetails.blackListed;
	consigneeBlackListed	= consigneeDetails.blackListed;
	tbbBlackListed			= consignorDetails.tbbBlackListed;
	tbbPartyName			= consignorDetails.billingPartyName;
	matadiChargesApplicable	= consignorDetails.matadiChargesApplicable == true;
	consignorCorpId			= consignorDetails.corporateAccountId;
	consigneeCorpId			= consigneeDetails.corporateAccountId;
	billingPartyId			= consignorDetails.billingPartyId;

	if(configuration.showInvoiceCreationCheckBox == 'true' && waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
		$('#createInvoiceDiv').removeClass('hide');
		if (configuration.isInvoiceCreationCheckedAndDisabled == true || configuration.isInvoiceCreationCheckedAndDisabled == 'true') {
				$('#createInvoice').prop("checked", true).prop("disabled", true);
		}
	} else
		$('#createInvoiceDiv').addClass('hide');

	if(configuration.changeStPaidbyOnPartyGSTN == 'true' || configuration.changeStPaidbyOnPartyGSTN == true)
		changeStPaidbyOnPartyGSTN = true;
		
	if (configuration.ShowConsigneeDetailsInDeliveryDetails == "true")
		setDeliveryDetails(consigneeDetails);
	
	if (configuration.crPdfGenerationAllowed == 'true' || configuration.crPdfGenerationAllowed == true) {
		if((consignorEmail != null && !isBlank(consignorEmail) && consigneeEmail != null && !isBlank(consigneeEmail))
		|| (consignorEmail != null && !isBlank(consignorEmail)) || (consigneeEmail != null && !isBlank(consigneeEmail)))
			isCrPdfAllow = true;
	}
	
	if(configuration.showDeliveryPaymentType == true || configuration.showDeliveryPaymentType == 'true')
		setDefaultPaymentType(configuration.DefaultPaymentType);
	
	$('#lrNum').html('<a href="javascript:openWindowForView(' + waybillMod.wayBillId + ',' + LR_SEARCH_TYPE_ID + ', 0);">' + waybillMod.wayBillNumber +  '</a>');

	$('#receivedAt').html(wbData.ReceivedAtBranchName);

	if (executive.branchId != wbData.branchId)
		$('#receivedAt').css('color', 'red');
	
	bookingServiceTax		= setBookingTaxAmount(wbData);

	$('#waybillCurrStatus').html(waybillMod.waybillStatusString);
	$('#waybillType').html(waybillMod.wayBillType);
	$('#sourceBranch').html(waybillMod.sourceBranch);
	$('#destBranch').html(waybillMod.destinationBranch);
	$('#currStatusDate').html(waybillMod.creationDateTimeStampStr);
	$('#wbReceiveDate').val(date(waybillMod.creationDateTimeStamp,'-'));
	$('#consignorName').html(consignorDetails.name);
	$('#consignorName').css({"color": "black", "font-weight": "bold", "font-size":"14px"});
	
	$('#consignorPhone').html(waybillMod.consignorPhoneNo);
	$('#consignorAddr').html(consignorDetails.address);
	$('#consignorGstn').html(consignorDetails.gstn);
	$('#consigneeName').html(consigneeDetails.name);
	$('#consigneeName').css({"color": "black", "font-weight": "bold", "font-size":"14px"});
	$('#consigneeGstn').html(consigneeDetails.gstn);
	$('#newConsigneeCorpAccId').val(consigneeDetails.corporateAccountId);
	$('#consigneeNameAutocomplete').val(consigneeDetails.name);
	$('#consigneePhone').html(consigneeDetails.phoneNumber);
	$('#consigneeAddr').html(waybillMod.consigneeAddr);
	$('#shortCreditAllowOnTxnType').val(consigneeDetails.shortCreditAllowOnTxnType);
	$('#consignorInv').html(waybillMod.consignorInvoiceNo);
	$('#declrdVal').html(waybillMod.declaredValue);
	$('#Remark').html(waybillMod.remark);
	$('#waybillId').val(waybillMod.wayBillId);
	$('#totalAmnt').val(Math.round(waybillMod.amount));
	$('#bookingTotalAmnt').val(Math.round(waybillMod.amount + bookingServiceTax - waybillMod.bookingDiscount));
	
	setTimeout(function() { 
		calculateUnloadingChargeOnFreight(waybillMod.wayBillTypeId);
	}, 200);
		
	$('#GrandAmnt').val(Math.round(waybillMod.bookingTotal));

	if (waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		$('#billAmount').val(Math.round(waybillMod.grandTotal));

	destBranchId		= waybillMod.destinationBranchId;

	$('#destBranchId').val(waybillMod.destinationBranchId);
	$('#ConsignorCustDetailsId').val(consignorDetails.customerDetailsId);
	$('#consignorCorpAccId').val(consignorDetails.corporateAccountId);
	$('#wbBookingDate').val(date(waybillMod.bookingDateTime, '-'));
	$('#ConsigneeCustDetailsId').val(consigneeDetails.customerDetailsId);
	$('#consigneeCorpAccId').val(consigneeDetails.corporateAccountId);
	$('#waybillTypeId').val(waybillMod.wayBillTypeId);
	$('#ActlWt').html(consignmentSummary.actualWeight);
	$('#ChgdWt').html(consignmentSummary.chargeWeight);
	$('#serviceTaxBY').val(consignmentSummary.taxBy);
	$('#paymentType').val(consignmentSummary.paymentType);
	$('#bookingType').html(wbData.bookingType);
	$('#deliveryTypeId').val(waybillMod.deliveryTypeId);
	$('#formType').html(wbData.formType);
	$('#checkForServTax').val(wbData.taxTxnValue);
	$('#showbillCredit').val(wbData.showbillCredit);
	$('#paidLoading').val(wbData.paidLoading);
	
	bookingTimeTaxBy		= consignmentSummary.taxBy;
	
	if(executive.countryId == NIGERIA && waybillMod.deliveryTypeId == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
		$('#DeliveryTo').html(InfoForDeliveryConstant.DELIVERY_TO_TERMINAL_NAME);
	 else
		$('#DeliveryTo').html(wbData.deliveryType);
	
	if(wayBillTypeList.includes($('#waybillTypeId').val())) {
		if(tdsConfiguration.hideTDSForPrepaidAmount)
			$('#isTdsRequired').css('display', 'none');
		else
			$('#isTdsRequired').css('display', 'inline');
	} 
	
	if(configuration.allowDeliveryAfterDDMCreation == 'true') {
		if(wbData.drs == undefined || wbData.drs == 'undefined')
			$('#deliveryRunSheetLedgerId').val(0);
		else
			$('#deliveryRunSheetLedgerId').val(wbData.drs.deliveryRunSheetLedgerId);
	} else
		$('#deliveryRunSheetLedgerId').val(0);
		
	let isReadOnly = (configuration.readOnlyDeliveryDiscount == 'true' || waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY && configuration.readOnlyDeliveryDiscountForToPayOnly == 'true');
	
	if(configuration.configDiscount == "true") {
		if($('#txtDelDisc').exists() && $('#txtDelDisc').is(":visible")) {
			if ( $('#txtDelDisc').exists() ) {
				$('#txtDelDisc').val(waybillMod.deliveryDiscount);
				$('#txtDelDisc').prop("readonly", isReadOnly);
			} 

			if ( $('#discountTypes').exists() ) {
				$('#discountTypes').val(waybillMod.discountChargeTypeId);
				$('#discountTypes').prop("disabled", isReadOnly);
				$('#discountTypes').css({"color": "black", "font-weight": "bold"});
			}
		} else {
			if( waybillMod.deliveryDiscount > 0) {
				if($('#txtDelDisc').exists()) {
					$('#discountTR').removeClass('hide');
					$('#txtDelDisc').val(waybillMod.deliveryDiscount);
					$('#txtDelDisc').prop("readonly", true);
				}
			} else
				$('#discountTR').addClass('hide');
			
			if(waybillMod.discountChargeTypeId > 0) {
				if ( $('#discountTypes').exists()) {
					$('#discountTypesTR').removeClass('hide');
					
					removeOption('discountTypes', null);
					createOption('discountTypes', 0, '--Select--');
					createOption('discountTypes', waybillMod.discountChargeTypeId, waybillMod.discountChargeType);

					$('#discountTypes').val(waybillMod.discountChargeTypeId);
					$('#discountTypes').prop("disabled", true);
					$('#discountTypes').css({"color": "black", "font-weight": "bold"});
				}
			} else
				$('#discountTypesTR').addClass('hide');
		}
	}

	if(configuration.delivertTimeShowBillSelection == true || configuration.delivertTimeShowBillSelection == 'true') {	
	 	if(billSelectionId == BOOKING_WITH_BILL) {
			$('#billSelectionText').html(BOOKING_WITH_BILL_NAME);
			$('#billSelectionText').removeClass("withoutbill").addClass("withbill");
		} else if(billSelectionId == BOOKING_WITHOUT_BILL) {
			$('#billSelectionText').html(BOOKING_WITHOUT_BILL_NAME);
			$('#billSelectionText').removeClass("withbill").addClass("withoutbill");
		}
 	}
 	
	if(configuration.showClaimAmountField == 'true' && typeof consigneeDetails.claimAmount !== 'undefined') {
		$('#claimAmountTR').removeClass('hide');
		$('#claimAmountTd').removeClass('hide');
		
		$('#claimAmountSpan').html(consigneeDetails.claimAmount);
		changeColourForClaimAmount(waybillMod.wayBillTypeId);
		
		$('#totalClaimAmount').val(consigneeDetails.claimAmount);
		$('#claimAmount').prop('readonly', Number($('#totalClaimAmount').val()) <= 0);
	} else {
		$('#claimAmountTR').addClass('hide');
		$('#claimAmountTd').addClass('hide');
	}
	
	if ($('#waybillTypeId').val() != WAYBILL_TYPE_TO_PAY && $('#deliveryPaymentType').exists()) {
		$('#deliveryPaymentType option').each(function() {
			if(this.value == PAYMENT_TYPE_BILL_CREDIT_ID)
				$("#"+$(this).attr("id")).prop('disabled', true);
		});
	}
	
	if (shortCreditDeliveryLocking) {
		if ( $('#deliveryPaymentType').exists() ) {
			$('#deliveryPaymentType option').each(function(){
				if(this.value == PAYMENT_TYPE_CREDIT_ID)
					$("#"+$(this).attr("id")).prop('disabled', true);
			});
		}
		
		setTimeout(() => {
			$('#deliveryPaymentType').val(0);
		}, 200);
	}

	if(configuration.deliveryhandlingChargePerArticle == 'true')
		deliveryTimeChargeForHamali(wbData);
	
	let applicableArray = configuration.lrTypesForDemurrageCalculation.split(',');
	
	if(isValueExistInArray(applicableArray, waybillMod.wayBillTypeId)) {
		$('#configDamerageAmount').val(wbData.damerage);
		
		if ($('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).exists()) {
			if(wbData.showDemurrageCalculation) {
				demarageJsonObject		= wbData.finalDamerageVal
				getModelData();
				
				if(wbData.damerage > 0)
					$('#label' + DeliveryChargeConstant.DAMERAGE).html('<a href="#" data-toggle="modal" data-target="#bookingModal" rel="nofollow"><b>Demurrage</b></a>');
				else
					$('#label' + DeliveryChargeConstant.DAMERAGE).html('<b>Demurrage</b>');
				
				$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).val(wbData.damerage);
			} else
				$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).val(wbData.damerage);
		}
	}

	if ( waybillMod.wayBillTypeId == WAYBILL_TYPE_FOC ) {
		if ( $('#deliveryPaymentType').exists() ) {
			$('#deliveryPaymentType option').each(function(){
				if(this.value == PAYMENT_TYPE_BILL_CREDIT_ID)
					$("#"+$(this).attr("id")).prop('disabled', true);
			});
		}
		
		disableDeliveryCharges('deliveryCharges');
	} else
		enableDeliveryCharges('deliveryCharges');

	if(configuration.ApplyDeliveryCharges == 'true' && !isTCEBooking)
		applyDeliveryCharges(wbData.wayBillBookingCharges);

	$('#configOctroiAmount').val(wbData.chargeConfigAmount);
	
	if ( $('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).exists() )
		$('#deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY).val(wbData.chargeConfigAmount);

	if(configuration.isIncreaseMobileNoLength == 'true') {
		var prefix = configuration.prefixForMobileNumber;
		$('#deliveredToPrefix').val(prefix);
	} else{
		$('#deliveredToPrefix').attr('style', 'display: none');
		$('.deliveredToPrefix').attr('style', 'display: none');

	}
	
	if(isTDSAllow){
		if ($('#waybillTypeId').val() == WAYBILL_TYPE_FOC)
			$('#isTdsRequired').css('display', 'none');	
		else
			$('#isTdsRequired').css('display', 'inline');	
	}
		
	setDefaultSTPaidBy(waybillMod.wayBillTypeId);					//Method Calling from generatecrSetReset.js
	setConsignmentDetails(wbData.consignmentDetails);				//Method Calling from generatecrSetReset.js
	setWaybillBookingCharges(wbData.wayBillBookingCharges);			//Method Calling from generatecrSetReset.js
	
	if((wbData.showDeliveryCharges == 'true' || wbData.showDeliveryCharges == true) && wbData.waybillDeliveryChgs != undefined)
		setWaybillDeliveryCharges(wbData.waybillDeliveryChgs);			//Method Calling from generatecrSetReset.js
	
	changeColourforwaybillType(waybillMod.wayBillTypeId);
	disableSTPaidBy(waybillMod.wayBillTypeId);

	execFeildPermission = execFldPermissions[FeildPermissionsConstant.MANNUAL_CR_DELIVERY];

	if(execFeildPermission != null && execFeildPermission != undefined) {
		$('#deliverySequenceCounter').switchClass("show", "hide");
		$('#crNum').html(wbData.crNumber);
	} else {
		$('#deliverySequenceCounter').switchClass("hide", "show");
		$('#crNum').html("");
	}

	setConsineeNameAutoComplete('consigneeNameAutocomplete');

	if(consigneeDetails.panNumber)
		$('#deliveryPanNumber').val(consigneeDetails.panNumber);

	setDeliveryAt(waybillMod.deliveryTypeId);

	var sourceBranch		= wbData.sourceBranch;
	var destinationBranch	= wbData.destinationBranch;

	sourceBranchStateId			= sourceBranch.stateId;
	destinationBranchStateId	= destinationBranch.stateId;

	/*
	 * Work done to Hide Booking charges Panel and Booking AMount by LR Type
	 */
	hideBookingChargesAmountOnWayBillType(waybillMod.wayBillTypeId);
	showBookingChargesAmountOnExecutive(waybillMod,executive);
	
	if(sendOTPForLrDelivery && waybillMod.otpNumber != undefined && typeof waybillMod.otpNumber != 'undefined' && !allowDeliveryTimeOtp || (waybillMod.otpNumber != undefined && isTCEBooking)) {
		$('#deliveryOTPDiv').removeClass('hide');
		OTPNumber = (waybillMod.otpNumber).trim();
	}

	if (allowDeliveryTimeOtp)
		$("#OTPCheckbox").removeClass('hide');
	
	if(allowAutoGenerateConEWaybill == 'true' || showTruckNumberField == 'true')
		$('#deliveryVehicleDiv').removeClass('hide');
	
	if(groupConfiguration.showPartyIsBlackListedParty == true || groupConfiguration.showPartyIsBlackListedParty == 'true'){
		if(consignorBlackListed > 0 )
			showMessage('error', 'This Party ('+ $('#consignorName').html() +')  Is BlackListed');
		else if(consigneeBlackListed > 0 )
			showMessage('error', 'This Party ('+ $('#consigneeName').html() +')   Is BlackListed ');
		else if(tbbBlackListed > 0)
			showMessage('error', 'TBB Party   Is BlackListed ');
		else if (consignorBlackListed > 0  && tbbBlackListed > 0)
			showMessage('error', 'This Party ('+ $('#consignorName').html() +' and Tbb Paryt  Is BlackListed !');
	}
	
	if(wbData.showZeroAmount != undefined && wbData.showZeroAmount) {
		$("#waybillBookingchargesList input:text").val("0");
		$("#waybillBookingChgs input:text").val("0");
		$('#bookingTotalAmnt').val(0);
		$('#billAmount').val(0);
	}
	
	if(configuration.allowShortCreditPaymentTypeOnShortCreditParty == 'true' || configuration.allowShortCreditPaymentTypeOnShortCreditParty == true){
		if(Number(consigneeDetails.shortCreditAllowOnTxnType) == SHORT_CREDIT_TXN_TYPE_DELEIVERY || 
			Number(consigneeDetails.shortCreditAllowOnTxnType) == SHORT_CREDIT_TXN_TYPE_BOTH)
			$('#deliveryPaymentType').val(PAYMENT_TYPE_CREDIT_ID);
		else
			$('#deliveryPaymentType').val(PAYMENT_TYPE_CASH_ID);
	}
	
	var header = $('#deliveryTitle');
	
	if(isTCEBooking) {
		$('#deliveryCharges').addClass('hide');
		$('#waybillDlvryChgs').addClass('hide');
		header.attr('style', 'background: #1878F3; color: white; font-size: 20px; font-weight: bold;');
		header.html('Deliver TranCE LR')
		$('#bottom-border-boxshadow').attr('style','border: 10px solid #1878F3;')
		$('#bookingChargePanel').attr('style', 'display: none');
		changeDisplayProperty('isTdsRequired', 'none');
		startServicesForTCE();
		
	}else{
		header.attr('style', 'background: #d9edf7; color: #31708f; font-size: 20px; font-weight: bold;');
		header.html('Deliver LR')
		$('#bottom-border-boxshadow').attr('style','border: none;')
	}
	
}
function hideBookingChargesAmountOnWayBillType(wayBillTypeId) {
	if(configuration.HideBookingChargesPanelAndBookingAmountOnLRType == 'true') {
		var lrTypeList 		= (configuration.LRTypeToHideBookingChargesPanelAndBookingAmount).split(',');
		var checkLRType 	= isValueExistInArray(lrTypeList, wayBillTypeId);
		
		if(checkLRType) {
			$('#bookingChargePanel').attr('style', 'display: none');
			$("#waybillBookingchargesList input:text").val("0");
			$("#waybillBookingChgs input:text").val("0");
			$('#bookingTotalAmnt').val(0);
			$('#billAmount').val(0);
		}
	}
}

function showBookingChargesAmountOnExecutive(waybillMod,executive){
	var lrTypeList 		= (configuration.LRTypeToHideBookingChargesPanelAndBookingAmount).split(',');
	var checkLRType 	= isValueExistInArray(lrTypeList, waybillMod.wayBillTypeId);

	if(configuration.showChargesToExecutiveAndGroupAdmin == 'true' && checkLRType) {
		if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || waybillMod.executiveId == executive.executiveId) {
			$('#bookingChargePanel').attr('style', 'display: block');
			$('#bookingTotalAmnt').val(Math.round(waybillMod.amount));
		} else {
			//$('#bookingChargePanel').attr('style', 'display: none');
			$("#waybillBookingchargesList input:text").val("0");
			$("#waybillBookingChgs input:text").val("0");
			$('#bookingTotalAmnt').val(0);
			$('#billAmount').val(0);
			$('#bookingTotalAmnt').val(0);
		}
	}
}

function applyDeliveryCharges(wbBookingChargs){
	for (var i = 0; i < wbBookingChargs.length; i++) {
		var temp		= wbBookingChargs[i];

		if(temp.wayBillChargeMasterId == BookingChargeConstant.LOADING
			&& $('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).exists())
				$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val(45);
	}
}

function changeColourforwaybillType(waybillTypeId) {
	var waybillType = document.getElementById('waybillType');

	switch (waybillTypeId) {
	case WAYBILL_TYPE_PAID:
		waybillType.style.backgroundColor = "#0073BA";
		waybillType.style.color = "white";
		break;

	case WAYBILL_TYPE_TO_PAY:
		waybillType.style.backgroundColor = "#E77072";
		waybillType.style.color = "white";
		break;

	case WAYBILL_TYPE_CREDIT:
		waybillType.style.backgroundColor = "#52AEC6";
		waybillType.style.color = "white";
		break;

	case WAYBILL_TYPE_FOC:
		waybillType.style.backgroundColor = "#2CAE54";
		waybillType.style.color = "white";
		break;
	}
}

function changeColourForClaimAmount(waybillTypeId) {
	var claimAmount = document.getElementById('claimAmountSpan');

	switch (waybillTypeId) {
	case WAYBILL_TYPE_PAID:
		claimAmount.style.backgroundColor = "#0073BA";
		claimAmount.style.color = "white";
		break;

	case WAYBILL_TYPE_TO_PAY:
		claimAmount.style.backgroundColor = "#E77072";
		claimAmount.style.color = "white";
		break;

	case WAYBILL_TYPE_CREDIT:
		claimAmount.style.backgroundColor = "#52AEC6";
		claimAmount.style.color = "white";
		break;

	case WAYBILL_TYPE_FOC:
		claimAmount.style.backgroundColor = "#2CAE54";
		claimAmount.style.color = "white";
		break;
	}
}

function checkDiscountValidation() {
	if (isDeliveryDiscountAllow) {
		var discnt  = document.getElementById("txtDelDisc");
		var disType = document.getElementById("discountTypes");
		
		if(discnt.value > 0 && disType.value <= 0 ) {
			showMessage('error', discountTypeErrMsg);
			changeError1('discountTypes','0','0');
			return false;
		} else {
			hideAllMessages();
			removeError('discountTypes');
			return true;
		}
	}
	
	return true;
}

function checkForNewDeliveryCustomer(objId) {
	var obj = document.getElementById(objId);

	if (obj.value.length > 0 && $('#selectedDeliveryCustomerId').val() <= 0) {
		execFeildPermission = execFldPermissions[FeildPermissionsConstant.AUTO_SAVE_DELIVERED_TO_NAME];
		
		if(execFeildPermission != null)
			saveNewDeliveryCustomer(); //To Save Delivery time parties
	}
	
	return false;
}

function saveNewDeliveryCustomer() {
	if(!validateDeliverdToName(1, 'deliveredToName')){return false;}

	var deliveredToName = getValueFromInputField('deliveredToName');

	var jsonObject					= new Object();

	jsonObject.filter		= 4;
	jsonObject.name			= deliveredToName.toUpperCase();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription)
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				else
					$('#selectedDeliveryCustomerId').val(data.deliveryCustId);
			});
}

function printWindow(commonId) {
	var multipleCrPrint = configuration.multipleCrPrintForNewFlow  == 'true' || configuration.multipleCrPrintForNewFlow == true;
	
	if(isTCEBooking)
		childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=tceCrPrint&masterid='+commonId+'&isCrPdfAllow='+isCrPdfAllow+'&','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else if (configuration.GenerateCashReciptPrintFromNewFlow == "true")
		childwin = window.open ('GenerateCRPrint.do?pageId=302&eventId=2&crId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else if (configuration.isWSCRPrintNeeded == "true"){
		if (configuration.multiCRPrintNeeded == "false")
			childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid='+commonId,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		else if(configuration.allowBranchWiseCRPrint == 'true') {
			if(branchOnNewCRPrint == 'true' || branchOnNewCRPrint == true)
				childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid='+commonId+'&isCrPdfAllow='+isCrPdfAllow+'&','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else if(configuration.isOldFlowNeededIfBranchNotFoundForWs == 'true')
				childwin = window.open ('GenerateCRPrint.do?pageId=3&eventId=5&wayBillId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else
				childwin = window.open ('GenerateCRPrint.do?pageId=3&eventId=10&wayBillId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		} else if(configuration.isAllowSameAsNetCrPrintForNetcWithoutBill == 'true' && billSelectionId == BOOKING_WITHOUT_BILL)
			childwin = window.open ('GenerateCRPrint.do?pageId=302&eventId=1&wayBillId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		else if(configuration.singleCrPrintWithMultiLrNeeded == 'true' || configuration.singleCrPrintWithMultiLrNeeded == true)
			childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=singlecrmultilrprint&masterid='+commonId+'&isCrPdfAllow='+isCrPdfAllow+'&multipleCrPrint='+multipleCrPrint,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		else
			childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid='+commonId+'&isCrPdfAllow='+isCrPdfAllow+'&multipleCrPrint='+multipleCrPrint,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else if(configuration.isOldFlowNeeded == 'true')
		childwin = window.open ('GenerateCRPrint.do?pageId=3&eventId=5&wayBillId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else
		childwin = window.open ('GenerateCRPrint.do?pageId=302&eventId=1&wayBillId='+commonId+'&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');

	setFocusOnWayBill();
}

function printWindowForMR(deliveryContactDetailsId,moduleIdentifier) {
	childwin = window.open ("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+deliveryContactDetailsId+"&moduleIdentifier="+moduleIdentifier,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function printWindowForInvoice(wayBillBillId) {
	childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + wayBillBillId + '&isBkgDlyTimeInvoicePrint='+ true, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openWindowForInvoiceAfterDelivery(wayBillBillId) {
	childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + wayBillBillId + '&isBkgDlyTimeInvoicePrint='+ true+'&openInvoicePrintPopUpAfterBkgDly='+openInvoicePrintPopUpAfterBkgDly+'&billPdfEmailAllowed='+ true,'_blank','config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}


function setFocusOnWayBill() {
	$('#waybillNmber').focus();

	$(document).one("keyup",function(e) {
		if (e.keyCode === 27) {
			$('#waybillNmber').focus();   // esc
		}
	});
}

//only for Delivery time Hamali & Kondi Branch
function directDeliveryOption(obj) {
	/*if (obj.value > 0 && executive.branchId == Branch.BRANCH_ID_KONDI) {
		deliverWayBill(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
	}*/
}

function getServiceTaxExcludeCharges() {
	var charges	= jsondata.deliverChgs;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;
		
		if(charges[i].taxExclude == true)
			total  += Number($("#deliveryCharge" + chargeMasterId).val());
	}
	
	return total;
}

function getDeliveryChargesTotal() {
	var charges	= jsondata.deliverChgs;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;
		
		if ($("#deliveryCharge" + chargeMasterId).val() != "")
			total += parseFloat($("#deliveryCharge" + chargeMasterId).val());
	}
	
	return total;
}

function calculateDeliveryTimeST() {
	var bookingTotalAmnt	= $('#bookingTotalAmnt').val();
	var wayBillId			= $('#waybillId').val();
	var calcSTOn			= 0;

	if(bookingServiceTax == 0 && configuration.STCalOnBookingDeliveyTotalIfNotAllowedAtBookingTime == 'true') {
		//if no ST applied on booking time then take into delivery time consideration
		calcSTOn			= getDeliveryChargesTotal() - getServiceTaxExcludeCharges() + Number(bookingTotalAmnt);
	} else
		calcSTOn			= getDeliveryChargesTotal() - getServiceTaxExcludeCharges();

	var billAmt				= $('#billAmount').exists() ? Number($('#billAmount').val()) : 0;
	
	// Tax Calculation
	if(!jQuery.isEmptyObject(taxes))
		calculateGSTTaxes(taxes, wayBillId, 'STPaidBy', calcSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn, consignorCorpId, consigneeCorpId, billingPartyId, changeStPaidbyOnPartyGSTN);

	if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY && $('#billAmount').exists())
		$('#billAmount').val( Number($('#billAmount').val()) + (Number($('#GrandAmnt').val())));
}

function getPrevNextCharge(ele) {

	var charges	= jsondata.deliverChgs;

	for ( var i = 0; i < charges.length; i++) {
		var chargeId		= charges[i].chargeTypeMasterId;

		if('deliveryCharge' + chargeId == ele.id) {
			if (i == 0)
				prev = 'deliveryRemark';
			else
				prev = 'deliveryCharge' + charges[i - 1].chargeTypeMasterId;

			if (i + 1 == charges.length) {
				if(isDeliveryDiscountAllow) {

					if (configuration.DeliveryReceivedAmountAllowed == "true")
						next = "receivedAmnt";
					else
						next = "txtDelDisc";
				} else
					next = 'deliver';
			} else
				next = 'deliveryCharge'+charges[i+1].chargeTypeMasterId;
		}
	}
}

function goToManualSelection() {
	var chk = document.getElementById("isManualCR");
	
	if(chk != null) {
		if(chk.checked) {
			if(jsondata.DeliverySequenceCounter != undefined || configuration.isAllowManualCRWithoutSeqCounter == 'true') {
				$('#selectionCriteria').switchClass("show", "hide");
				$("#manualCRNumber").focus();
			} else{
				showMessage('info',manualCrSequenceErr);
				$('#isManualCR').attr( "checked", false);
				return false;
			}
			
			if(configuration.doNotShowManualCrBackDate == 'true')
				$('#manualCRDate').hide()
		} else {
			$('#selectionCriteria').switchClass("hide", "show");
			$("#manualCRNumber").val('');
		}
	}
}

function validateSTPaidBy(filter) {
	switch (Number(filter)) {
	case 1:
		if (configuration.DeliverySTPaidByValidate == "true") {
			if(!validateServiceTaxPaidBy(1, 'STPaidBy')){return false;}
		}
		break;

	case 2:
		var calcSTOn			= getDeliveryChargesTotal() - getServiceTaxExcludeCharges();

		if (configuration.DeliverySTPaidByValidate == "true" && calcSTOn > taxableAmount) {
			if(!validateServiceTaxPaidBy(1, 'STPaidBy')){return false;}
		}

		break;
	default:
		break;
	}

	return true;
}

function deliverWayBill(str) {
	
	if(matadiChargesApplicable || matadiChargesApplicableForBillCredit) {
		if($("#deliveryCharge" + DeliveryChargeConstant.MATADI_CHARGES).exists()
				&& $("#deliveryCharge" + DeliveryChargeConstant.MATADI_CHARGES).is(":visible"))
			var matadiCharges	= $("#deliveryCharge" + DeliveryChargeConstant.MATADI_CHARGES).val();
		
		if(typeof matadiCharges != 'undefined' && matadiCharges <= 0) {
			showMessage('error', " Please Enter Matadi Charges !");
			changeTextFieldColor('deliveryCharge'+DeliveryChargeConstant.MATADI_CHARGES, '', '', 'red');
			return false;
		}
	}
	
	if(bookingTimeTaxBy == TAX_PAID_BY_TRANSPORTER_ID && bookingTimeTaxBy != $('#STPaidBy').val() && configuration.validateDeliveryTaxWithBookingTax == 'true') {
		showMessage('error', "Plese Select GST Paid By Transporter");
		return false;
	}
		
	var deliveryTo		= getValueFromInputField('deliveryTypeId');
	
	if(configuration.validateShortCreditAllowOnTxnType == 'true'
		&& deliveryTo != InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID && Number($('#deliveryPaymentType').val()) == PAYMENT_TYPE_CREDIT_ID
		&& executive.branchId != 12
		&& executive.branchId != 139
		&& executive.branchId != 108) {
		if(Number($('#newConsigneeCorpAccId').val()) == 0) {
			if(execFldPermissions[FeildPermissionsConstant.ALLOW_SHORT_CREDIT_DELIVERY_FOR_GENERAL_PARTY] == null) {
				showMessage('error', " You Are Not Allowed For Short Credit Delivery  For General Party !");
				return false;
			}
		} else if(!isDeliveryTimeShortCreditParty()) {
			showMessage('error', "Short Credit Delivery Not Allowed For This Party !");
			return false;
		}
	}
	
	if(groupConfiguration.validateShortCreditAllowOnTxnTypeWithSubRegion == 'true') {
		var subregionList 		= (groupConfiguration.subRegionIdsForShortCredit).split(',');
		var checkSubRegion 		= isValueExistInArray(subregionList, executive.subRegionId);
		
		if(checkSubRegion && !isDeliveryTimeShortCreditParty()) {
			showMessage('error', "Short Credit Delivery Not Allowed For This Party !");
			return false;
		}
	}

	if(configuration.AllowToDeliverLRForSELFConsigneeParty == 'false' && !allowToDeliveryLRForSelfParty()) {
		showMessage('error', 'You cannot deliver LR for SELF Consignee Party !');
		return false;
	}
	
	if(configuration.isBlackListPartyCheckingAllow == 'true') {
		if(blackListed == CorporateAccount.CORPORATEACCOUNT_DELIVERY_BLACK_LISTED) {
			showMessage('info', 'This Party ('+ $('#consigneeName').html() +') Is BlackListed, LR Delivery Not Allowed !');
			return false;
		} else if(blackListed == CorporateAccount.CORPORATEACCOUNT_BOTH_BLACK_LISTED) {
			showMessage('info', 'This Party ('+ $('#consigneeName').html() +') Is BlackListed LR Booking & Delivery Not Allowed !');
			return false;
		}
	}
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_DELIVERY_FOR_BLACK_LISTED_PARTY];
	
	if(execFeildPermission == null  && (groupConfiguration.showPartyIsBlackListedParty == true || groupConfiguration.showPartyIsBlackListedParty == 'true')) {
		if(consignorBlackListed > 0 ){
			showMessage('info', 'This Party ('+ $('#consignorName').html() +')  Is BlackListed, LR Delivery Not Allowed !');
			return false;
		} else if(consigneeBlackListed > 0 ) {
			showMessage('info', 'This Party ('+ $('#consigneeName').html() +')   Is BlackListed  LR Delivery Not Allowed !');
			return false;
		} else if(tbbBlackListed > 0) {
			showMessage('info', 'TBB Party   Is BlackListed  LR Delivery Not Allowed !');
			return false;
		} else if (consignorBlackListed > 0  && tbbBlackListed > 0){
			showMessage('info', 'This Party ('+ $('#consignorName').html() +' and TbbParty  Is BlackListed, LR Delivery Not Allowed !');
			return false;
		}
	}
	
	let wayBillTypeId	= Number($('#waybillTypeId').val());

	//alert("dilve..");
	if(configuration.EditDoorDeliveryAllow == 'true' && wayBillTypeId != WAYBILL_TYPE_FOC) {
		var deliveryTo	=  $('#deliveryTypeId').val();

		if(deliveryTo == DELIVERY_TO_DOOR_ID) {
			if(document.getElementById('deliveryCharge' + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY) != null) {
				var doordel 				= document.getElementById('deliveryCharge' + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).value;
				var bookingTimeDelCharge 	= document.getElementById('deliveryCharge' + BookingChargeConstant.DOOR_DLY_BOOKING).value;

				if(doordel <= 0 && bookingTimeDelCharge <= 0) {
					//chargeValidation(14);
					showMessage('error', "You have to enter Door Delivery Charge Greater Than 0/-");
					$( "#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).focus();
					return false;
				}
			}
		}
	}

	let waybillTypeToNotAllowDeliveryWithZeroFreightAmount	= (configuration.lrTypesToNotAllowDeliveryWithZeroFreightAmount).split(',');
	
	// APS,PGT,S.F.C
	if(wayBillTypeId != WAYBILL_TYPE_FOC
		&& isValueExistInArray(waybillTypeToNotAllowDeliveryWithZeroFreightAmount, wayBillTypeId) 
		&& configuration.isTopayDeliveryAllowWithZeroFreightAmount == 'false') {
		let frieght = document.getElementById('deliveryCharge' + FREIGHT).value;
			
		if(frieght == 0 || frieght < 0) {
			showMessage('error', "You Can Not Deliver " + getLRTypeNameById(wayBillTypeId) + " LR With 0 Amount!!");
			return false;
		}
	}

	//disableButton();

	var paidLoading					= Number($('#paidLoading').val()); 

	if(!validateValidLRNumber(1, 'waybillId')) {
		enableButton();
		return false;
	}

	if(!pendingDeliveryFlag && (configuration.showDeliveryPaymentType == 'true' || configuration.showDeliveryPaymentType == true) && !validatePaymentType(1, 'deliveryPaymentType')) {
		enableButton();
		return false;
	}

	if(configuration.ValidateApprovedByField == 'true') {
		if(!validateApprovedByField()) {enableButton();return false;}
	}

	if (configuration.DeliveredToNameValidate == "true" && !validateDeliverdToName(1, 'deliveredToName')) {
		enableButton();
		return false;
	}
	
	if(configuration.doNotAllowToSelectDiscountType.trim() == true || configuration.doNotAllowToSelectDiscountType.trim() == 'true') {
		var discountIdsArr = (configuration.discountTypeIdToNotAllowForSelection).split(",");

		if ( discountIdsArr.includes($('#discountTypes').val())) {
			showMessage('error', "You can not select Freight in discount type.");
			enableButton();
			return false;
		}
	}
             
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.AUTO_SAVE_DELIVERED_TO_NAME];

	if (execFeildPermission != null && !validateValidDeliveredToName(1, 'selectedDeliveryCustomerId')) {
		enableButton();
		return false;
	}

	if (configuration.DeliveredToPhoneNumberValidate == "true" && !validateDeliveredPersonPhoneNumber()) {
		enableButton();
		return false;
	}

	if(isTDSAllow && tdsConfiguration.IsPANNumberRequired && isPanNumberMandetory && !validatePanNumber()) {
		enableButton();
		return false;
	}

	if (!validateSTPaidBy(configuration.DeliverySTPaidByValidateFlavor)) {
		enableButton();
		return false;
	}
	
	if (configuration.DeliveryRemarkValidate == "true") {
		if(configuration.deliveryRemarkValidateOnDiscount == "true") {
			if($('#txtDelDisc').val() > 0 && !validateRemark(1, 'deliveryRemark', 'deliveryRemark')) {
				enableButton();
				return false;
			}
		} else if(!validateRemark(1, 'deliveryRemark', 'deliveryRemark')) {
			enableButton();
			return false;
		}
	}

	/*if(!octroiServiceValidation()) {
		enableButton();
		return false;
	}*/
	
	if(!chkClaimAmount())
		return false;

	var deliveryPaymentType = document.getElementById('deliveryPaymentType');
	
	if ( deliveryPaymentType != null && (deliveryPaymentType.value == PAYMENT_TYPE_BILL_CREDIT_ID) ) {
		if(paidLoading <= 0) {
			if(!validateProperDeliveryCreditor(1, 'selectedDeliveryCreditorId')) {
				enableButton();
				return false;
			}
		} else {
			alert(changePaidLoadingChargeAlertMsg);
			enableButton();
			return false;
		}
	}
	
	if (deliveryPaymentType != null && deliveryPaymentType.value == PAYMENT_TYPE_CREDIT_ID
		&& configuration.DeliverySearchCollectionPersontValidate == "true") {
		if(!validateInput(1, 'searchCollectionPerson', 'searchCollectionPerson', 'DeliveryErrorDiv', collectionPersonErrMsg)) {
			enableButton();
			return false;
		}
			
		if($("#selectedCollectionPersonId").val() == 0 ) {
			showMessage('error', validCollectionPersionErrMsg);
			enableButton();
			return false;
		}
	}

	/*if(!validateInput(1, 'deliveryRemark', 'deliveryRemark', 'DeliveryErrorDiv', 'Please Enter Remark !')) {
		return false;
	}*/

	if((configuration.PhotoServiceValidate == 'true' || configuration.PhotoServiceValidate == true || isTCEBooking) 
		&& isCanvasBlank('pictureCanvas')) {
		showMessage('error', "Please take customer photo !");
		enableButton();
		return false;
	}

	if(configuration.SignatureServiceValidate == 'true' && isCanvasBlank('signaturepad')) {
		showMessage('error', "Please take customer signature !");
		enableButton();
		return false;
	}
	
	if((sendOTPForLrDelivery && !allowDeliveryTimeOtp || allowDeliveryTimeOtp && $('#OTPSelection').prop('checked')) && OTPNumber != null || (OTPNumber != null && isTCEBooking)) {
		var OTPNumberString = $('#OTPNumber').val();
		
		if(OTPNumberString == 0 || OTPNumberString == '') {
			$('#OTPNumber').focus();
			showMessage('error', "Please Enter OTP !");
			enableButton();
			return false;
		} else if(OTPNumber != OTPNumberString) {
			$('#OTPNumber').focus();
			showMessage('error', "Please Enter Valid OTP !");
			enableButton();
			return false;
		}
	}
	
	if(validateForPaymentTypeCheque()) {
		var chk = document.getElementById("isManualCR");
		execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_MANUAL_CR_DATE];
		
		if (chk != null && chk.checked) {
			var manualCRNumber 		= document.getElementById("manualCRNumber");
			var manualCRDate 		= document.getElementById("manualCRDate");
			var manualCRNumberVal 	= parseInt(manualCRNumber.value, 10);
			var manualCRNumberStr 	= manualCRNumber.value.trim();
			
			if(configuration.isAllowAlphanumericManualCR)
				manualCRNumberVal = manualCRNumberStr

			if (configuration.DeliveryManualCRNumbertValidate == "true" && !validateInput(1, 'manualCRNumber', 'manualCRNumber', 'DeliveryErrorDiv', manualCrNumberErrMsg)) {
				enableButton();
				return false;
			}

			if(!validateInput(1, 'manualCRDate', 'manualCRDate', 'DeliveryErrorDiv', manualCrDateErrMsg)) {
				enableButton();
				return false;
			} else {
				/*if ( manualCRDate.value.length<=0 || manualCRDate.value == 'CR Date' ) {
				showSpecificErrors('DeliveryErrorDiv',"Please Enter Manual CR Date !!");
				toogleElement('DeliveryErrorDiv','block');
				changeError1('manualCRDate','0','0');
				return false;
			} else {*/

				if ( chkDate(manualCRDate.value) ) {
					var maxRange  = 0;
					var minRange = 0;
					
					if(configuration.isAllowManualCRWithoutSeqCounter == 'false'){
						maxRange = Number($("#MaxRange").val());
						minRange = Number($("#MinRange").val());
					}

					if((manualCRNumberVal >= minRange && manualCRNumberVal <= maxRange) || (configuration.isAllowManualCRWithoutSeqCounter == 'true')) {
						hideAllMessages();
						//toogleElement('DeliveryErrorDiv','none');
						removeError('manualCRNumber');
						
						if ( checkedManualCRSave != manualCRNumberVal ) {
							if ( checkedManualCROnCancel != manualCRNumberVal ) {
								var jsonObject					= new Object();

								jsonObject.filter			= 5;
								jsonObject.manualCRNumber	= manualCRNumberVal;
								jsonObject.manualCRDate		= manualCRDate.value;

								var jsonStr = JSON.stringify(jsonObject);

								$.getJSON("GenerateCRAjax.do?pageId=9&eventId=16",
										{json:jsonStr}, function(data) {
											if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
												showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
											} else {
												var response = data.isManualCRNoExists;

												if(response == true) {
													var msg		= crNumberAlreadyCreatedInfoMsg;
													showMessage('error', msg);
													changeError1('manualCRNumber','0','0');
													manualCRNumber.focus();
													enableButton();
													return false;
												} else {
													//toogleElement('DeliveryErrorDiv','none');
													hideAllMessages();
													removeError('manualCRNumber');
													finallyDeliverWayBill(str);
												};
											}
										});

								checkedManualCRSave = manualCRNumberVal;
							} else {
								finallyDeliverWayBill(str);
							}
						} else {
							var msg		= crNumberAlreadyCreatedInfoMsg;
							showMessage('error', msg);
							changeError1('manualCRNumber','0','0');
							manualCRNumber.focus();
							enableButton();
							return false;
						};
					} else {
						showMessage('error', manualCrWithinRange);
						changeError1('manualCRNumber','0','0');
						enableButton();
						return false;
					};
				} else {
					enableButton();
					return false;
				};
			};
		} else if((configuration.showOnlyManualCrDate == true || configuration.showOnlyManualCrDate == 'true') || 
				((execFeildPermission != null  && execFeildPermission != undefined) && 
						(configuration.showManualCrOptionForUserWise == 'true'|| configuration.showManualCrOptionForUserWise == true))){
			if(!validateInput(1, 'manualCRDate', 'manualCRDate', 'DeliveryErrorDiv', manualCrDateErrMsg)) {
				enableButton();
				return false;
			}

			if((configuration.hideManualCrDateSubRegionWise == true || configuration.hideManualCrDateSubRegionWise == 'true')
					&& executive.subRegionId == configuration.SubRegionIdToHideManualCrDate)
				$('#deliveryWithManualDate').hide();

			var manualCRDate = document.getElementById("manualCRDate");

			if (!chkDate(manualCRDate.value) ) {
				enableButton();
				return false;
			} else
				finallyDeliverWayBill(str);
		} else
			finallyDeliverWayBill(str);
	} else {
		enableButton();
		return false;
	}
};

function validateDeliveredPersonPhoneNumber() {
	if(!validateDeliveredToPhoneNumber(1, 'deliveredToPhoneNo'))
		return false;
		
	var deliveredToPhoneNo 			= document.getElementById('deliveredToPhoneNo');

	if (deliveredToPhoneNo != null && (deliveredToPhoneNo.value.length < 8 || deliveredToPhoneNo.value.length > 10)) {
		showMessage('error', validPhoneNumberErrMsg);
		changeError1('deliveredToPhoneNo','0','0');
		return false;
	} else if (deliveredToPhoneNo != null && invalidNumberRegex.test(deliveredToPhoneNo.value)) {
		showMessage('error', "Invalid phone number. Please enter a valid number.");
		changeError1('deliveredToPhoneNo', '0', '0');
		return false;
	}
	
	return true;
}

function validateForPaymentTypeCheque() {
	if(isPaidByDynamicQRCode)
		return true;
		
	if(!pendingDeliveryFlag && (configuration.showDeliveryPaymentType == true || configuration.showDeliveryPaymentType == 'true') && !validateInput(1, 'deliveryPaymentType', 'deliveryPaymentType', 'DeliveryErrorDiv', paymentTypeErrMsg))
		return false;

	if(!pendingDeliveryFlag && configuration.showDeliveryPaymentType == 'true' || configuration.showDeliveryPaymentType == true) {
		var deliveryPaymentType = document.getElementById('deliveryPaymentType').value;
		
		if(GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
			if(deliveryPaymentType > 0 && deliveryPaymentType != PAYMENT_TYPE_CASH_ID && deliveryPaymentType != PAYMENT_TYPE_CREDIT_ID && deliveryPaymentType != PAYMENT_TYPE_BILL_CREDIT_ID
			&& $('#storedPaymentDetails').html() == '' &&  deliveryPaymentType != PAYMENT_TYPE_CROSSING_CREDIT_ID ) {
				showMessage('error', 'Please, Add Payment Details!');
				return false;
			}
			
			return true;
		}
		
		if(deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID) {
			if(!validateInput(1, 'chequeDate', 'chequeDate', 'DeliveryErrorDiv', chequeDateErrMsg))
				return false;

			if(!validateInput(1, 'chequeNo', 'chequeNo', 'DeliveryErrorDiv', chequeNumberErrMsg))
				return false;

			if(!validateInput(1, 'chequeAmount', 'chequeAmount', 'DeliveryErrorDiv', chequeAmountErrMsg))
				return false;

			if(!validateInput(1, 'bankName', 'bankName', 'DeliveryErrorDiv', bankNameErrMsg))
				return false;
		}
	}

	return true;
}

function checkReceivedAmount() {
	if (configuration.DeliveryReceivedAmountValidate == "true"
		&& !validateInput(1, 'receivedAmnt', 'receivedAmnt', 'DeliveryErrorDiv', receivedAmountErrMsg))
		return false;

	return true;
}

function finallyDeliverWayBill(str) {
	var deliveredToPhoneNo	= document.getElementById('deliveredToPhoneNo');

	checkedManualCRSave = null;

	if ( checkReceivedAmount() ) {
		//Calculate delivery Amount
		calulateBillAmount();

		//Discount Type Validation
		if (!checkDiscountValidation()) {
			enableButton();
			return false;	
		}
		
		if (!validateDiscountLimit(discountInPercent, dlyTotal, $('#txtDelDisc').val(), $('#txtDelDisc'))) {
			enableButton();
			return false;	
		}
		
		if (!validateShortCreditLimit()) {
			enableButton();
			return false;	
		}

		var delveryAmt 		= $('#billAmount').val();
		var delveryAmt		= Number(delveryAmt).toFixed(2);

		//check for cheque amount
		var deliveryPaymentType = document.getElementById('deliveryPaymentType');

		if ( deliveryPaymentType.value == PAYMENT_TYPE_BILL_CREDIT_ID )
			alert("LR Type will be TBB after Bill Credit !");

		if ( deliveryPaymentType.value == PAYMENT_TYPE_CHEQUE_ID )
			alert("Cheque Amount is Rs/- " + delveryAmt);

		if( deliveredToPhoneNo.value == '' )
			deliveredToPhoneNo.value = '0000000000';

		//Check if Delivery is being done from other than Destination Branch
		var execBranchId = executive.branchId;
		var wbDestBranchId = $('#destBranchId').val();

		if (parseInt(execBranchId,10) != parseInt(wbDestBranchId,10)  && !isPaidByDynamicQRCode) {
			if($('#billAmount').val() > 0) {
				if(!confirm("Are you sure you want to DELIVER LR of OTHER BRANCH ?")) {
					if( $("manualCRNumber").exists() ) {
						checkedManualCROnCancel = document.getElementById("manualCRNumber").value.trim();
					}
					
					enableButton();
					return;
				}
			}
		}

		if (isCRCreating) {
			enableButton();
			return false;
		}
		
		/*
		 if(allowPrepaidAmount)
			validatePrepaidAmount(str, delveryAmt);
		 else
			deliveryLROrShowPopup(str, delveryAmt)
		*/
		deliveryLROrShowPopup(str, delveryAmt)
	};
}

function deliveryLROrShowPopup(str, delveryAmt) {
	if(configuration.isAllowPopUpForPendingLRs == 'true')
		showPopUpForPendingLRs(str, delveryAmt);
	else
		deliveryOfLR(str, delveryAmt);
}


function deliveryOfLRWithNewPopup(str, deliveryAmt) {
	disableButton();
	
	if ($('#billAmount').val() < 0)
		return;
	
	var tdsAmount = Number($("#tdsAmount").val()) || 0;
	var confirmMessage = $('#billAmount').exists() ?
		"Are you sure you want to " + str + " LR of amount " + (deliveryAmt- tdsAmount) + " Rs ?" :
		"Are you sure you want to " + str + " LR ?";
		
	var submessage = `Collect Amount ${ deliveryAmt } First And Save. You won't be able to revert this !`;
	
	const swalWithBootstrapButtons = Swal.mixin({
		customClass: {
			confirmButton: "btn btn-success mr-2",
			cancelButton: "btn btn-danger"
		},
		
		buttonsStyling: true
	});

	swalWithBootstrapButtons.fire({
		title: confirmMessage,
		text: submessage, 
		icon: "warning",
		backdrop: `rgba(0,0,123,0.4)`,
		width:"fit-content",
		showCancelButton: true,
		confirmButtonText: "<span style='font-size:18px;'>Yes, proceed!</span>",
		cancelButtonText: "<span style='font-size:18px;'>No, cancel!</span>",
		reverseButtons: true
	}).then((result) => {
		if (result.isConfirmed) {
			if ($('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID && $('#selectedDeliveryCreditorId').val() > 0)
				$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER);

			$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);

			showLayer();
			forwardForDelivery();
		} else if (result.dismiss === Swal.DismissReason.cancel) {
			if ($("manualCRNumber").exists())
				checkedManualCROnCancel = document.getElementById("manualCRNumber").value.trim();
			
			enableButton();
			return false;
    	}
  	});

  // Add event listeners for Enter and Esc keys
	$(document).on('keydown', function(event) {
		if (event.keyCode === 13) { // Enter key
			$('.swal2-confirm').trigger('click');
		} else if (event.keyCode === 27) { // Esc key
			$('.swal2-cancel').trigger('click');
			enableButton();
		}
	});
}

function deliveryOfLR(str, delveryAmt) {
	if(isTCEBooking) {
		deliveryOfLRWithNewPopup(str, delveryAmt);
		return;
	}
	
	//disableButton();
	if($('#billAmount').val() < 0)
		return;

	if (isPaidByDynamicQRCode) {
		if( $('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID
				&& $('#selectedDeliveryCreditorId').val() > 0 ) {
			$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER);
		}

		$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);

		showLayer();
		forwardForDelivery();
	}else{
		var tdsAmount = Number($("#tdsAmount").val()) || 0;
		if ( $('#billAmount').exists())
			ans = confirm("Are you sure you want to "+ str +" LR of amount " + (delveryAmt- tdsAmount) + " Rs ?");
		else
			ans = confirm("Are you sure you want to "+ str +" LR ?");
	
		if (ans) {
			if( $('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID
					&& $('#selectedDeliveryCreditorId').val() > 0 ) {
				$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER);
			}
	
			$('#deliverString').val(WayBill.WAYBILL_DELIVERY_TYPE_DELIVER);
	
			showLayer();
			forwardForDelivery();
		} else {
			if( $("manualCRNumber").exists() )
				checkedManualCROnCancel = document.getElementById("manualCRNumber").value.trim();
			
			enableButton();
			return false;
		};
	}
	
	$('#waybillNmber').focus();
}


function getLRByConsigneeNumber(){
	var consigneePhone 				= $('#consigneePhone').html();
	var reg 						= /^[789]\d{9}$/ig;
	
	if(consigneePhone.length != 10)
		return false;
  	
  	if(!consigneePhone.match(reg))
  		return false;
  	
	var waybillId					= $('#waybillId').val();
	var fetchDataForReceivedLRs		= configuration.fetchDataForReceivedLRs;
	var fetchDataForDispatchedLRs	= configuration.fetchDataForDispatchedLRs;
	var jsonObj						= new Object();
	
	jsonObj.consigneePhone					= consigneePhone;
	jsonObj.branchId						= executive.branchId
	jsonObj.waybillId						= waybillId
	jsonObj.fetchDataForReceivedLRs			= fetchDataForReceivedLRs;
	jsonObj.fetchDataForDispatchedLRs		= fetchDataForDispatchedLRs;
	
	$.ajax({
		type		: 	"GET",
		url			: 	WEB_SERVICE_URL + '/deliveryWayBillWS/getLRsByConsigneeNumber.do',
		data		:	jsonObj,
		dataType	: 	'json',
		success		: 	function(response) {
			deliveryReminderLRDetails = response;
		}
	});
}

function showPopUpForPendingLRs(str,delveryAmt){
	var doneDelivery = false;
	if(deliveryReminderLRDetails != undefined && deliveryReminderLRDetails.PendingLRs != undefined && deliveryReminderLRDetails.PendingLRs.length > 0){
		if(deliveryReminderLRDetails.message != undefined) {
			deliveryOfLR(str,delveryAmt);
			return;
		}else{
			setPendingLRDetails(deliveryReminderLRDetails);
			$(".close").click(function(){
				if(!doneDelivery){
					setTimeout(function(){
						deliveryOfLR(str,delveryAmt);
					},200);
					doneDelivery = true;
				}
			})
		}
	} else {
		deliveryOfLR(str,delveryAmt);
	}
}

function stopDeliveryWhenChequeBounce(){

	accountGroupId			= executive.accountGroupId;
	consigneeCorpAccId		= $("#consigneeCorpAccId").val();
	consignorCorpAccId		= $("#consignorCorpAccId").val();

	chequeBounceCheckingForBothParty(accountGroupId, consignorCorpAccId, consigneeCorpAccId);
}

function forwardForDelivery() {
	isCRCreating	= true;
	var jsonObject					= new Object();

	jsonObject.filter		= 3;

	getUrlForSubmit(jsonObject);
	
	var jsonStr = null;
	var uri = null;
	
	showLayer();
	
	if(showPatialDeliveryButton) {
		jsonStr = jsonObject;
		uri	= 	WEB_SERVICE_URL + '/generatePartialCRWS/generatePartialCR.do';
	} else {
		jsonStr	= 'json='+JSON.stringify(jsonObject);
		uri = 'GenerateCRAjax.do?pageId=288&eventId=3';
	}
		
	$.ajax({
		type : "POST",
		url : uri,
		data : jsonStr,
		dataType : "json",

		// if received a response from the server
		success : function(data, textStatus, jqXHR) {
			if (data.errorDescription) {
				showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				hideLayer();
				isCRCreating = false;
				return false;
			} else if(showPatialDeliveryButton) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.description);
				hideLayer();
				
				if(errorMessage.type != MESSAGE_TYPE_SUCCESS) {
					isCRCreating = false;
					return false;
				} 
			
				partialConsignmentDataArr	= [];
				pendingDeliveryFlag			= false;
				$('#paymentDetailsTable').removeClass('hide');
				$('.hideDlyCharges').removeClass('hide');
			}
			
			branchWisePrepaidAmount			= data.branchWisePrepaidAmount;
			allowPrepaidAmount				= data.allowPrepaidAmount;
			
			if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CASH_ID && configuration.showPreviousCrNumberAndAmount == 'true')
				setDeliveryNumberInLocalStorage(data.wayBillDeliveryNumber);
			
			if(isAllowToEnterIDProof)
				saveIDProofDetails(data.crId);
			
			showCRPrintOptionAfterDelivery	= data.showCRPrintOptionAfterDelivery;

			if (configuration.AllowCRPrintOnNoDeliveryCharge == 'false' || !showCRPrintOptionAfterDelivery) {
				$('#reprinnt').switchClass("hide", "show");
			} else {
				if(isTCEBooking) {
					showReprintOption(data.waybillid);
					printWindow(data.waybillid);
				} else if (configuration.GenerateCashReciptPrintFromNewFlow == "true") {
					showReprintOption(data.crId);

					if(configuration.openCRPrintAfterDelivery == 'true')
						printWindow(data.crId);
				} else if(configuration.isWSCRPrintNeeded == 'true') {
					if(configuration.allowBranchWiseCRPrint == 'true') {
						if(branchOnNewCRPrint == 'true' || branchOnNewCRPrint == true) {
							showReprintOption(data.crId);
							
							if(configuration.openCRPrintAfterDelivery == 'true')
								printWindow(data.crId);
						} else {
							showReprintOption(data.waybillid);
							
							if(configuration.openCRPrintAfterDelivery == 'true')
								printWindow(data.waybillid);
						}
					} else {
						if(configuration.isAllowSameAsNetCrPrintForNetcWithoutBill == 'true' && billSelectionId == BOOKING_WITHOUT_BILL){
							showReprintOption(data.waybillid);
							
							if(configuration.openCRPrintAfterDelivery == 'true')
								printWindow(data.waybillid);
						} else {
							showReprintOption(data.crId);
							
							if(configuration.openCRPrintAfterDelivery == 'true')
								printWindow(data.crId);
						}
						
						if(data.isMoneyReceiptRequired == true && typeof data.mrNumber !== 'undefined' && data.mrNumber != null)
							showMrPrintOption(data.mrNumber, data.deliveryContactDetailsId, data.moduleId);
					}	
				} else {
					showReprintOption(data.waybillid);
					
					if(configuration.openCRPrintAfterDelivery == 'true')
						printWindow(data.waybillid);
				}

				$('#previousLrNumber').html('( Previous LR No. <b> <a href="javascript:openWindowForView(' + data.waybillid + ',' + LR_SEARCH_TYPE_ID + ', 0);">' + getValueFromInputField('oldLrNumber') +  '</a> </b> )');
				
				if(data.isMoneyReceiptRequired == true && typeof data.mrNumber !== 'undefined' && data.mrNumber != null) {
					$('#mrPrintBtn').removeClass('hide');
					$('#previousMrNumber').html('( Previous MR No. <b> ' + getValueFromInputField('oldMrNumber') + '</b> )');
				}
				
				if(data.allowToCreateInvoiceForToPayLR == true && typeof data.billIdForInvoice !== 'undefined' && Number(data.billIdForInvoice) > 0){
					$('#previousWayBillBillId').val(data.billIdForInvoice);
					$('#invoicePrintBtn').removeClass('hide');
				}
				
				if(branchWisePrepaidAmount != null && allowPrepaidAmount) {
					$('#currAmntDiv').css('display','inline')
					$('#currentBalAmountEle').html(branchWisePrepaidAmount.rechargeAmount);
				} else {
					$('#currAmntDiv').css('display','none')
				}
			}
			
			
			openInvoicePrintPopUpAfterBkgDly = data.openInvoicePrintPopUpAfterBkgDly

			if (openInvoicePrintPopUpAfterBkgDly && data.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				openWindowForInvoiceAfterDelivery(data.billIdForInvoice);

			$('#waybillNmber').val("");

			resetData();

			enableButton();
			
			if (configuration.showReprintButton == 'false')
				$('#reprinnt').switchClass("hide", "show");
			
			hideLayer();
			isCRCreating = false;
		},

		// If there was no resonse from the server
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("Something really bad happened " + textStatus);
			console.log(errorThrown);
			alert(jqXHR.responseText);
		},

		// this is called after the response or error functions are finsihed so that we can take some action
		complete : function(jqXHR, textStatus) {
			console.log(jqXHR);
			console.log(textStatus);
			clearCanvas('pictureCanvas');
			clearCanvas('signaturepad');
		}
	});
}

function saveIDProofDetails(crId) {
	var jsonObj	= new Object();
	
	jsonObj.crId				= crId;
	jsonObj.idProofDataObject	= JSON.stringify(idProofDataObject);
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/deliveryWayBillWS/idProofPhotoService.do',
		data		:	jsonObj,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				return;
			}
		}
	});
}

function showReprintOption(waybillId){
	$('#previouswayBillId').val(waybillId);
	$('#reprinnt').switchClass("show", "hide");
}

function showMrPrintOption(mrNumber,deliveryContactDetailsId,moduleId){
	$('#deliveryContactDetailsId').val(deliveryContactDetailsId);
	$('#oldMrNumber').val(mrNumber);
	$('#moduleId').val(moduleId);
	$('#mrPrintBtn').switchClass("show", "hide");
}

function openWindowForView(id, type, branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + type + '&BranchId=' + branchId);
}

function getUrlForSubmit(jsonObject) {

	var deliveredToName 		= $('#deliveredToName').val();
	var receiverToName 			= $('#receiverToName').val();
	var deliveredToPrefix 		= $('#deliveredToPrefix').val();
	var deliveredToPhoneNo 		= $('#deliveredToPhoneNo').val();
	var txtDelDisc 				= 0;
	var claimAmount 			= 0;
	var podStatus				= 0;
	var deliveredAmount 		= 0;
	var selectedDeliveryCustomerId = $('#selectedDeliveryCustomerId').val();
	
	if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CASH_ID)
		 deliveredAmount 		= $('#billAmount').val();
			
	if(document.getElementById('txtDelDisc')!= null)
		txtDelDisc = $('#txtDelDisc').val();
	
	if(document.getElementById('claimAmount')!= null)
		claimAmount = $('#claimAmount').val();
	
	var deliveryPaymentType 		= $('#deliveryPaymentType').val();
	var discountTypes 				= 0;

	if (isDeliveryDiscountAllow || ((configuration.configDiscount == 'true') && (txtDelDisc > 0)))
		discountTypes = $('#discountTypes').val();

	jsonObject.waybillId					= waybillId();
	jsonObject.consignorId					= $('#ConsignorCustDetailsId').val();
	jsonObject.consigneeId					= $('#ConsigneeCustDetailsId').val();
	jsonObject.wbBookingDate				= $('#wbBookingDate').val();
	jsonObject.deliveredToName				= convertToHex(deliveredToName);
	jsonObject.receiverToName				= convertToHex(receiverToName);
	jsonObject.wayBillTypeId				= $('#waybillTypeId').val();
	jsonObject.deliveryRunSheetLedgerId		= $('#deliveryRunSheetLedgerId').val();
	
	if(configuration.isIncreaseMobileNoLength == 'true')
		jsonObject.deliveredToPhoneNo		= deliveredToPrefix + deliveredToPhoneNo;
	else
		jsonObject.deliveredToPhoneNo		= deliveredToPhoneNo;

	jsonObject.deliveryRemark				= convertToHex($('#deliveryRemark').val());
	jsonObject.deliverString				= $('#deliverString').val();
	jsonObject.txtDelDisc					= txtDelDisc;
	jsonObject.deliveryClaim				= claimAmount;
	jsonObject.STPaidBy						= $('#STPaidBy').val();
	jsonObject.selectedDeliveryCustomerId	= $('#selectedDeliveryCustomerId').val();
	jsonObject.billingCreditorId			= $('#selectedDeliveryCreditorId').val();
	jsonObject.selectedDeliveryCreditorId	= $('#selectedDeliveryCreditorId').val();
	jsonObject.collectionPersonId			= $('#selectedCollectionPersonId').val();
	jsonObject.deliveryPaymentType			= deliveryPaymentType;
	jsonObject.IsStbsCreationAllowed 		= $('#isstbscreationallowId').is(':checked');
	jsonObject.createInvoice				= $('#createInvoice').prop("checked");
	
	if(configuration.showPreviousCrNumberAndAmount == 'true') {
		if(localStorage.getItem("prevDeliveryCustId") != null && localStorage.getItem("prevDeliveryCustId") != undefined) {
			if(localStorage.getItem("prevDeliveryCustId") == $('#selectedDeliveryCustomerId').val() && localStorage.getItem("prevDeliveredAmt") != null) {
				allowPreviousDeliveryNumber = true;
				localStorage.setItem("prevDeliveredAmt", Number(deliveredAmount) + Number(localStorage.getItem("prevDeliveredAmt")));
			} else {
				allowPreviousDeliveryNumber = false;
				localStorage.setItem("prevDeliveredAmt", deliveredAmount);
			}
		} else
			localStorage.setItem("prevDeliveredAmt", deliveredAmount);
	}
	
	localStorage.setItem("prevDeliveredToName", deliveredToName);
	localStorage.setItem("prevDeliveredToNumber", deliveredToPhoneNo);
	localStorage.setItem("prevDeliveryCustId", selectedDeliveryCustomerId);

	if(configuration.isPartialPaymentAllow == 'true') {
		jsonObject.receivedAmount		= $('#receivedAmount').val();
		jsonObject.balanceAmt			= $('#balanceAmount').val();
		jsonObject.partialPaymentMode	= $('#paymentMode').val();
		jsonObject.partialChequeDate	= $('#partialChequeDate').val();
		jsonObject.partialChequeNo		= $('#partialChequeNo').val();
		jsonObject.partialBankName		= $('#partialBankName').val();
	}
	
	if(allowPrepaidAmount)
		jsonObject.prepaidAmountId		= prepaidAmountId;

	getPaymentTypeandDetails(deliveryPaymentType, jsonObject);

	serviceTaxAmnt(jsonObject, waybillId());
	deliveryChargesWithIds(jsonObject);
	manualCrCheck(jsonObject);

	if (isDeliveryDiscountAllow || ((configuration.configDiscount == 'true') && (txtDelDisc > 0)))
		jsonObject.discountTypes	= discountTypes;

	getReceivableTypes(jsonObject);
	getApprovedBy(jsonObject);
	getConsigneeDetails(jsonObject);

	if (!isCanvasBlank('pictureCanvas'))
		jsonObject.image = encodeURIComponent(getCanvasImage('pictureCanvas'));

	if (!isCanvasBlank('signaturepad'))
		jsonObject.signature = encodeURIComponent(getCanvasImage('signaturepad'));

	if(isTDSAllow)
		getTdsDetails(jsonObject);

	if($('#podStatus').val() != undefined)
		podStatus = $('#podStatus').val();
	
	jsonObject.podStatus	= podStatus;

	if(podConfiguration.setDefaultPODStatusNo)
		jsonObject.podStatus	= 1;

	if(podStatus == 2)
		jsonObject.docTypeStr = getDocTypeArray();

	if( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
			&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true'))
		jsonObject.isAllowChequePayment	= isAllowChequePayment;
	
	jsonObject.vehicleNumber			= vehicleNumber;
	jsonObject.vehicleNumberMasterId	= vehicleNumberMasterId;
	jsonObject.partialConsignmentDataArr	= JSON.stringify(partialConsignmentDataArr);
	jsonObject.pendingDeliveryFlag		= pendingDeliveryFlag;
	
	if(configuration.billingBranch == 'true' || configuration.billingBranch == true)
		getBillingBranchData(jsonObject);
	
	if(configuration.showRecoveryBranchForShortCredit == 'true')
		getRecoveryBranchData(jsonObject);
}

function getDocTypeArray(){
	var  packingTypeIds			= "";
	var selected				= $("#podDocType option:selected");

	selected.each(function () {
		packingTypeIds += ( $(this).val() +",");
	});

	if(packingTypeIds.length > 0)
		packingTypeIds = packingTypeIds.slice(0, -1)

	return packingTypeIds;
}

function convertToHex(str) {
	var hex = '';
	for(var i = 0; i < str.length; i++) {
		hex += '' + str.charCodeAt(i).toString(16);
	}
	return hex;
}

function getTdsDetails(jsonObject) {
	let tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
	let tdsRate				= 0;
	
	if(tdsChargeInPercent != undefined && tdsChargeInPercent.includes(","))
		tdsRate				= tdsChargeInPercent.split(",")[0];
	else
		tdsRate				= tdsChargeInPercent;
	
	jsonObject.tdsAmount			= $('#tdsAmount').val();
	jsonObject.tdsOnAmount			= $('#tdsOnAmount').val();
	jsonObject.tdsRate				= tdsRate;
	jsonObject.deliveryPanNumber	= $('#deliveryPanNumber').val();
}

function manualCrCheck(jsonObject) {
	if ($('#isManualCR').exists()) {
		var isManualCR = document.getElementById('isManualCR');
		
		if (isManualCR.checked) {
			jsonObject.isManualCR		= isManualCR.checked;
			jsonObject.manualCRNumber	= $('#manualCRNumber').val();
			jsonObject.manualCRDate		= $('#manualCRDate').val();
		}
	}
	
	execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_MANUAL_CR_DATE];
	
	if((configuration.showOnlyManualCrDate == 'true' || configuration.showOnlyManualCrDate == true) ||
			((execFeildPermission != null && execFeildPermission != undefined) && (configuration.showManualCrOptionForUserWise == 'true'||configuration.showManualCrOptionForUserWise == true))) {
		var manualCRDate = document.getElementById('manualCRDate').value;
		jsonObject.manualCRDate		= manualCRDate;
		
		if((configuration.hideManualCrDateSubRegionWise == true || configuration.hideManualCrDateSubRegionWise == 'true')
			&& executive.subRegionId == configuration.SubRegionIdToHideManualCrDate)
				$('#deliveryWithManualDate').hide();
	}
}

function getPaymentTypeandDetails(deliveryPaymentType, jsonObject) {
	if (deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID || deliveryPaymentType == PAYMENT_TYPE_ONLINE_RTGS_ID || deliveryPaymentType == PAYMENT_TYPE_ONLINE_NEFT_ID) {
		chequeDetails(jsonObject);
	} else if (deliveryPaymentType == PAYMENT_TYPE_CREDIT_CARD_ID || deliveryPaymentType == PAYMENT_TYPE_DEBIT_CARD_ID) {
		cardDetails(jsonObject);
	} else if(deliveryPaymentType == PAYMENT_TYPE_PAYTM_ID || deliveryPaymentType == PAYMENT_TYPE_UPI_ID || deliveryPaymentType == PAYMENT_TYPE_PHONE_PAY_ID || deliveryPaymentType == PAYMENT_TYPE_GOOGLE_PAY_ID || deliveryPaymentType == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
		paytmDetails(jsonObject);
		
		if (validatePhonePayTransaction && deliveryPaymentType == PAYMENT_TYPE_PHONE_PAY_ID){
			jsonObject.qrCodeMapperId = $('#qrCodeMapperId').val();
			
			if(allowDynamicPhonepeQR){
				jsonObject.isPaidByDynamicQRCode = isPaidByDynamicQRCode;
				jsonObject.transactionId = $('#transactionFld').val();
				jsonObject.merchantId = $('#merchantIdFld').val();
				jsonObject.apiReqResDataId = $('#apiReqResDataIdFld').val();
			}
		}
	} else if(deliveryPaymentType == PAYMENT_TYPE_IMPS_ID) {
		getIMPSDetails(jsonObject);
	}

	jsonObject.paymentValues = $('#paymentCheckBox').val();
}

function chequeDetails(jsonObject) {
	jsonObject.chequeNumber		= $('#chequeNo').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.bankName			= $('#bankName').val();
	jsonObject.chequeDate		= $('#chequeDate').val();
	jsonObject.bankNameId		= $('#bankName_primary_key').val();
	jsonObject.accountNo		= $('#accountNo').val();
	jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
}

function cardDetails(jsonObject) {
	if(GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		jsonObject.chequeNumber		= $('#cardNo').val();
		jsonObject.cardNo			= $('#cardNo').val();
		jsonObject.chequeAmount		= $('#chequeAmount').val();
		jsonObject.bankName			= $('#bankName').val();
		jsonObject.bankNameId		= $('#bankName_primary_key').val();
		jsonObject.accountNo		= $('#accountNo').val();
		jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
	} else {
		jsonObject.chequeNumber		= $('#creditDebitCardNo').val();
		jsonObject.bankName			= $('#creditDebitBankName').val();
	}
}

function paytmDetails(jsonObject) {
	jsonObject.chequeNumber		= $('#referenceNumber').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.referenceNumber	= $('#referenceNumber').val();
	jsonObject.payerName		= $('#payerName').val();
}

function getIMPSDetails(jsonObject) {
	jsonObject.bankName			= $('#bankName').val();
	jsonObject.bankNameId		= $('#bankName_primary_key').val();
	jsonObject.chequeNumber		= $('#referenceNumber').val();
	jsonObject.referenceNumber	= $('#referenceNumber').val();
	jsonObject.payerName		= $('#payerName').val();
	jsonObject.chequeAmount		= $('#chequeAmount').val();
	jsonObject.accountNo		= $('#accountNo').val();
	jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
}

function calcDiscOnRecvdAmnt() {
	var amount	= 0;
	var recvdAmnt = $('#receivedAmnt').val();

	if (!jsondata.deliverChgs)
		return;

	amount	= getDeliveryChargesTotal();

	var bkgTotal = 0;

	if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY)
		bkgTotal = $('#GrandAmnt').val();

	if(recvdAmnt == '')
		recvdAmnt = 0;

	var discAmount	= (Number(bkgTotal) + Number(amount)) - Number(recvdAmnt);

	if (isNaN(discAmount) || discAmount < 0) {
		alert('Enter valid Amount');
		$('#receivedAmnt').val(0);
		calcDiscOnRecvdAmnt();
	} else
		$('#txtDelDisc').val(discAmount);

	chkDiscount();
	chkClaimAmount();
	calulateBillAmount();
}

function serviceTaxAmnt(jsonObject, wayBillId) {
	var taxModels = taxes;

	if(jQuery.isEmptyObject(taxModels))
		return;

	for(var i = 0; i < taxModels.length; i++) {
		jsonObject['tax_' + taxModels[i].taxMasterId + '_' + wayBillId] 					= $('#tax_' + taxModels[i].taxMasterId + '_' + wayBillId).val();
		jsonObject['calculateSTOnAmount_' + taxModels[i].taxMasterId + '_' + wayBillId] 	= $('#calculateSTOnAmount_' + taxModels[i].taxMasterId + '_' + wayBillId).val();
		jsonObject['actualTax_' + taxModels[i].taxMasterId + '_' + wayBillId] 				= $('#actualTax_' + taxModels[i].taxMasterId + '_' + wayBillId).val();
		jsonObject['unAddedST_' + taxModels[i].taxMasterId + '_' + wayBillId] 				= $('#unAddedST_' + taxModels[i].taxMasterId + '_' + wayBillId).val();
	}
}

function deliveryChargesWithIds(jsonObject) {
	var deliverChgs = jsondata.deliverChgs;

	if( !jsondata.deliverChgs || jQuery.isEmptyObject(deliverChgs))
		return;

	for(var i = 0; i < deliverChgs.length; i++) {
		jsonObject['deliveryCharge' + deliverChgs[i].chargeTypeMasterId]	= $('#deliveryCharge' + deliverChgs[i].chargeTypeMasterId).val();
	}
}

function chargeValidation(filter) {
	switch (Number(filter)) {

	case DeliveryChargeConstant.OCTROI_SERVICE:
		if (configuration.OctroiValidate == 'true') {
			var ele				= document.getElementById('deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE);
			
			if(ele) {
				var currentCharge	= parseFloat(ele.value);
				var dfaultCharge	= parseFloat($('#octroiServiceCharge').val());
				
				if(dfaultCharge > 0 ) {
					if(isNaN(currentCharge) || currentCharge == '' || currentCharge < dfaultCharge) {
						showMessage('error', 'You can not enter Octroi Serivce Charge Less Than ' + dfaultCharge + '/-');
						changeError1(ele.id);
						return false;
					} else {
						removeError(ele.id);
						hideAllMessages();
						return true;
					}
				} else
					return true;
			} else
				return true;
		} else
			return true;
	case DeliveryChargeConstant.OCTROI_DELIVERY:
		if (configuration.OctroiValidate == 'true') {
			var ele				= document.getElementById('deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY);

			if(ele) {
				var currentCharge	= parseFloat(ele.value);
				var dfaultCharge	= parseFloat($('#configOctroiAmount').val());

				if(dfaultCharge > 0 ) {
					if(isNaN(currentCharge) || currentCharge == '' || currentCharge < dfaultCharge) {
						showMessage('error', 'You can not enter Octroi Charge Less Than' + dfaultCharge + '/-');
						changeError1(ele.id);
						return false;
					} else {
						removeError(ele.id);
						hideAllMessages();
						return true;
					}
				} else
					return true;
			} else
				return true;
		} else
			return true;
	case DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY:
		var deliveryTypeId = getValueFromInputField('deliveryTypeId');

		if(configuration.EditDoorDeliveryAllow == 'true' && $('#waybillTypeId').val() != WAYBILL_TYPE_FOC) {
			if (deliveryTypeId == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
				var ele						= document.getElementById('deliveryCharge' + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY);
				var bookingTimeDelCharge 	= $('#deliveryCharge' + BookingChargeConstant.DOOR_DLY_BOOKING).val();

				if(ele) {
					var currentCharge	= parseFloat(ele.value);
					var dfaultCharge	= parseFloat($('#deliveryCharge' + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).val());

					if(currentCharge <= 0 && bookingTimeDelCharge <= 0 ) {
						if(isNaN(currentCharge) || currentCharge == '' || currentCharge <= dfaultCharge) {
							showMessage('error', 'You have to enter Door Delivery Charge Greater Than' +currentCharge+'/-');
							$( "#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).focus();
							changeError1(ele.id);
							return false;
						} else {
							removeError(ele.id);
							hideAllMessages();
							return true;
						}
					} else
						return true;
				} else
					return true;
			} 
		} else
			return true;
		break;
	case DeliveryChargeConstant.DAMERAGE:
		if(configuration.EditDemmurageAmountAllow == 'true')
			return;

		var damrageAmt 		= 0;
		var ele				= document.getElementById('deliveryCharge' + DeliveryChargeConstant.DAMERAGE);

		if(ele)
			damrageAmt	= parseFloat(ele.value);

		var configdamrageAmt 	= parseInt($('#configDamerageAmount').val());
		
		if(damrageAmt < configdamrageAmt) {
			$(ele).val(configdamrageAmt);
			$(ele).focus();
		}
		
		break;
	case ChargeTypeMaster.DR_CHARGE:
		if(configuration.validateDRCharge != 'true')
			return;

		var drAmt 		= 0;
		var ele			= document.getElementById('deliveryCharge' + DeliveryChargeConstant.DR_CHARGE);

		if(ele)
			drAmt	= ele.value;
		
		var configdrAmt 	= configuration.setDefaultDRChargeAmount;

		if(Number(drAmt) < Number(configdrAmt)) {
			showMessage('error', 'Value can not be less than ' +configdrAmt+'/-');
			setTimeout(function(){ ele.focus(); }, 10);
			changeError1(ele.id);
			return false;
		}
		
		break;
	case ChargeTypeMaster.UNLOADING:
		if(configuration.applyUnLoadingChargeOnFreightChargeAmt == 'true'
			&& Number($('#deliveryCharge' + BookingChargeConstant.FREIGHT).val()) > Number(configuration.minimumFreightChargeValueToApplyDeliveryRate)
			&& Number(unloadingChargeAmount) > Number($('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val()))
				$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val(unloadingChargeAmount);
		
		if(configuration.allowToRemoveDefaultUnloadingCharge == 'true') {
			execFeildPermission = execFldPermissions[FeildPermissionsConstant.ALLOW_TO_REMOVE_DEFAULT_UNLOADING_DELIVERY_CHARGE];
			
			if(unloadingChargeAmount > Number($('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val())
				&& (execFeildPermission == null || execFeildPermission == undefined))
				$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val(unloadingChargeAmount);
		}
		
		break;
	default:
		break;
	}
	
	if ($('#waybillTypeId').val() == WAYBILL_TYPE_FOC)
		disableDeliveryCharges('deliveryCharges');
}

function disableDeliveryCharges(id) {

	$('#deliveryCharges :input').attr("disabled", true);
	$('#deliveryCharges :input').val(0);
	$('#deliveryCharge'+ DeliveryChargeConstant.OCTROI_DELIVERY).attr("disabled", false);

	if($('#deliveryCharge'+ DeliveryChargeConstant.OCTROI_DELIVERY ).exists())
		$('#deliveryCharge'+ DeliveryChargeConstant.OCTROI_DELIVERY ).prop('readOnly', false);
}

function enableDeliveryCharges(id) {
	$('#deliveryCharges :input').attr("disabled", false);
}

function resetOnDelete(e){
	var keynum = getKeyCode(e);

	if(keynum == 8  || keynum == 46 )
		$('#selectedDeliveryCreditorId').val(0);
}

function checkDate(date,el,isFutureDateAllowed) {
	if(isValidDate(date)) {
		var dateParts = date.split("-");
		var manualCRDate = new Date(dateParts[2], parseInt(dateParts[1],10) - 1, dateParts[0]);
		
		if(manualCRDate <= curSystemDate) {
			hideAllMessages();
			removeError(el);
			return true;
		} else if(!isFutureDateAllowed) {
			showMessage('error', enterFutureDateErrMsg);
			changeError1(el,'0','0');
			return false;
		}
	} else {
		el.focus();
		showMessage('error', validDateErrMsg);
		changeError1(el,'0','0');
		return false;
	};
}

function waybillId() {
	return $('#waybillId').val();
}


function sanitizeCRNumber(evt){

    if (evt.ctrlKey == 1){
        return true;
    } else {
        var keynum = null;
        if (window.event) { // IE
            keynum = evt.keyCode;
        } else if (evt.which) { // Netscape/Firefox/Opera
            keynum = evt.which;
        }

        if (keynum != null) {
            if (keynum == 8)
                return true;
            else if (configuration.isAllowAlphanumericManualCR == 'true' && ((keynum >= 65 && keynum <= 90) ||   (keynum >= 97 && keynum <= 122))) 
                return true;
            else if (keynum == 45 || keynum == 47) 
                return false;
            else if (keynum < 48 || keynum > 57) 
                return false;
            
        }
        return true;
    }
}


function checkForCRNo() {
	var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
	var str = $("#manualCRNumber").val().replace(reg, '');
	
	if($("#manualCRNumber").val() && str.length > 0) {
		if((parseInt($("#manualCRNumber").val()) >= parseInt($("#MinRange").val()) && parseInt($("#manualCRNumber").val()) <= parseInt($("#MaxRange").val())) || (configuration.isAllowManualCRWithoutSeqCounter == 'true') ){
			hideAllMessages();
			return true;
		} else {
			showMessage('error', crNumberNotInRangeErrMsg);
			$('#manualCRNumber').focus();
			return false;
		};
	} else if(configuration.DeliveryManualCRNumbertValidate == "true") {
		showMessage('error', crNumberErrMsg);
		$('#manualCRNumber').focus();
		changeError1('manualCRNumber','0','0');
		return false;
	};
}

function chkDate(date) {
	if(isValidDate(date)) {
		var currentDate  	= new Date(curSystemDate);
		var previousDate 	= new Date(curSystemDate);
		var manualCRDate 	= new Date(curSystemDate);
		var receiveDate 	= new Date(curSystemDate);
		var wbReceiveDate 	= document.getElementById('wbReceiveDate').value;
		var wbBookingDate 	= document.getElementById('wbBookingDate').value;
		var pastDaysAllowed = jsondata.ManualCRDaysAllowed;

		if (pastDaysAllowed < '0') {
			showMessage('error', configManualDeliverErrMsg);
			changeError1('manualCRDate','0','0');
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);

		var manualCRDateParts = new String(date).split("-");
		manualCRDate.setFullYear(parseInt(manualCRDateParts[2],10));
		manualCRDate.setMonth(parseInt(manualCRDateParts[1]-1,10));
		manualCRDate.setDate(parseInt(manualCRDateParts[0],10));

		var receiveDateParts 		= new String(wbReceiveDate).split("-");
		receiveDate.setFullYear(parseInt(receiveDateParts[2], 10));
		receiveDate.setMonth(parseInt(receiveDateParts[1]-1, 10));
		receiveDate.setDate(parseInt(receiveDateParts[0], 10));
		
		var wbBkgDateParts = wbBookingDate.split("-");
		var wbRecDateParts = wbReceiveDate.split("-");
		
		var dateToCheck = null;
		
		if(configuration.AllowToDeliverIfManualCRDateEarlierToReceiveDate == 'true')
			dateToCheck = new Date( wbBkgDateParts[2], wbBkgDateParts[1] - 1, wbBkgDateParts[0]);
		else
			dateToCheck = new Date( wbRecDateParts[2], wbRecDateParts[1] - 1, wbRecDateParts[0]);
		
		if(dateToCheck != null) {
			dateToCheck.setHours(0, 0, 0, 0);
			
			if (manualCRDate.getTime() < dateToCheck.getTime()) {
				if(configuration.AllowToDeliverIfManualCRDateEarlierToReceiveDate == 'true')
					showMessage('error', 'Delivery Date Earlier Than Booking Date Not Allowed !');
				else
					showMessage('error', 'Delivery Date Earlier Than Receive Date Not Allowed !');
				
				changeError1('manualCRDate','0','0');
				return false;
			} else if(manualCRDate.getTime() > currentDate.getTime()) {
				showMessage('error', futureDateNotAllowdErrMsg);
				changeError1('manualCRDate','0','0');
				return false;
			} else if(manualCRDate.getTime() > previousDate.getTime()) {
				hideAllMessages();
				removeError('manualCRDate');
				return true;
			} else {
				showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
				changeError1('manualCRDate','0','0');
				return false;
			}
		} else if(manualCRDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			changeError1('manualCRDate','0','0');
			return false;
		} else if(manualCRDate.getTime() > previousDate.getTime()) {
			hideAllMessages();
			removeError('manualCRDate');
			return true;
		} else {
			showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
			changeError1('manualCRDate','0','0');
			return false;
		}
	} else {
		showMessage('error', validDateErrMsg);
		changeError1('manualCRDate','0','0');
		return false;
	}
}

function changeRecAmount() {
	var amount	= 0;

	amount	= getDeliveryChargesTotal();

	if ($('#receivedAmnt').exists()) {
		if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY)
			$('#receivedAmnt').val(Number(amount) + Number($('#GrandAmnt').val()));
		else
			$('#receivedAmnt').val(Number(amount));
	}
}

function calulateBillAmount() {
	
	if(configuration.discountTypeAutoSetToFreight == 'true') {
		let txtDelDiscId = $('#txtDelDisc').val()
		
		if(txtDelDiscId > 0)
			$('#discountTypes').val(BookingChargeConstant.FREIGHT);
		else if(txtDelDiscId == '')
			$('#discountTypes').val('0')
	}
	 
	if(configuration.CalculateFocBillAmountForOctroiCharges == 'true') {
		var wayBillTypeId		= getValueFromInputField('wayBillTypeId');

		if (wayBillTypeId == WAYBILL_TYPE_FOC)
			calculateFocBillAmount();
		else
			calculateTotalBillAmount();
	} else
		calculateTotalBillAmount();
}

function calculateTotalBillAmount() {
	var amount				= 0;
	var paidLoading  		= $('#paidLoading').val();
	var bookingTotalAmnt	= $('#bookingTotalAmnt').val();
	var txtDelDisc			= 0;
	var claimAmount			= 0;
	
	dlyTotal				= 0.00;

	amount	= getDeliveryChargesTotal();
	
	if ($('#txtDelDisc').val() > 0)
		txtDelDisc	= parseFloat($('#txtDelDisc').val());
	
	if ($('#claimAmount').val() > 0)
		claimAmount	= parseFloat($('#claimAmount').val());

	$('#billAmount').val((parseFloat(amount) - txtDelDisc - claimAmount - paidLoading));
	
	if($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY)
		dlyTotal =  parseFloat(bookingTotalAmnt) + parseFloat(amount);
	else
		dlyTotal =  parseFloat(amount);
	
	calculateDeliveryTimeST();
	setChequeAmount();		//Calling from generatecrSetReset.js

	if(isTDSEffect())
		calTDSAmount();
}

function calculateFocBillAmount() {
	var amount	= 0;
	var ch		= document.getElementById('deliveryCharges');

	if(ch != null) {
		var len 	= ch.getElementsByTagName('input').length;

		for(var i = 0; i < len; i++) {
			if(ch.getElementsByTagName('input')[i].value.length > 0 ) {
				if(ch.getElementsByTagName('input')[i].id == 'deliveryCharge' + DeliveryChargeConstant.OCTROI_DELIVERY
						|| ch.getElementsByTagName('input')[i].id == 'deliveryCharge' + DeliveryChargeConstant.OCTROI_SERVICE
						|| ch.getElementsByTagName('input')[i].id == 'deliveryCharge' + DeliveryChargeConstant.OCTROI_FORM) {

					amount = parseFloat(amount) + parseFloat(ch.getElementsByTagName('input')[i].value);
				}
			}
		}
	}

	setValueToTextField('billAmount', parseFloat(amount));
}

function chkDiscount() {
	if(configuration.isPartyDiscountCheckingAllowed == 'true'){
		if(discountOnTxnType == CorporateAccount.CORPORATEACCOUNT_NO_DISCOUNT || discountOnTxnType == CorporateAccount.CORPORATEACCOUNT_BOOKING_DISCOUNT){
			showMessage('info', 'Discount Not Allowed for ('+ $('#consigneeName').html() +') party !');
			$("#txtDelDisc").val("0");
			return false;
		} 
	}

	if($('#billAmount').val() < 0 && $('#claimAmount').val() < 0) {
		alert('Invalid Discount !');
		$('#txtDelDisc').val('0');
		$('#txtDelDisc').focus();
		calulateBillAmount();
	}
}

function chkClaimAmount() {
	if(configuration.showClaimAmountField == 'true'){
		if(Number($('#totalClaimAmount').val()) <= 0 && Number($('#claimAmount').val()) > 0){
			showMessage('info', 'Claim Not Allowed for ('+ $('#consigneeName').html() +') party !');
			$("#claimAmount").val("0");
			calulateBillAmount();
			return false;
		} 
		
		if(Number($('#totalClaimAmount').val()) > 0 && Number($('#claimAmount').val()) > Number($('#totalClaimAmount').val())){
			showMessage('info', 'Entered Claim Amount Cannot Be More Than Total Claim Amount !');
			$("#claimAmount").val("0");
			calulateBillAmount();
			return false;
		} 
		
		if($('#billAmount').val() < 0 && $('#claimAmount').val() > 0) {
			alert('Invalid Claim Amount !');
			$('#claimAmount').val('0');
			calulateBillAmount();
			return false;
		}
	}
	
	return true;
}

function hideShowPaymentTypeDetailsNew(obj) {
	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		hideShowBankPaymentTypeOptions(obj);
		setTimeout(function() { 
			getAccountNumberForGroup();
		}, 200);
		$(document).keypress(function(e) { 
			if (e.keyCode == 27) { 
				hideBTModel();
				setTimeout(function(){
					$('#deliveryPaymentType').focus();
				}, 1000);
			} 
		});
		var selectedDeliveryCreditor = document.getElementById('selectedDeliveryCreditorId');

		if(selectedDeliveryCreditor != null){
			selectedDeliveryCreditor.value = 0;
		}
		
		if($("#selectedDeliveryCreditorPanel").exists()) {
			if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
				$('#selectedDeliveryCreditorPanel').switchClass("show", "hide");
				if(isConsigneePartyTbb && configuration.billingPartyNameAutoCompleteOnBillCreditSelection == "true"){
					$("#deliveryCreditor").val(ConsigneeName);
					$("#selectedDeliveryCreditorId").val(deliveryCreditorId);
				}
			} else {
				$('#selectedDeliveryCreditorPanel').switchClass("hide", "show");
				$("#deliveryCreditor").val('');
				$("#selectedDeliveryCreditorId").val(0);
			}
		}

		if(configuration.SearchCollectionPersonAutocomplete == "true"){
			if($("#tableSearchCollectionPerson").exists()) {
				if(obj.value == PAYMENT_TYPE_CREDIT_ID ) {
					$('#tableSearchCollectionPerson').switchClass("show", "hide");
					changeDisplayProperty('searchCollectionPerson', 'block');
				} else {
					$('#tableSearchCollectionPerson').switchClass("hide", "show");
					$("#searchCollectionPerson").val('');
					$("#selectedCollectionPersonId").val(0);
				};
			};
		}

		//obj.blur();

		if($('#creditDeliver').exists()) {
			if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID)
				$('#creditDeliver').switchClass("show", "hide");
			else
				$('#creditDeliver').switchClass("hide", "show");
		}

		var deliver			= document.getElementById('deliver');
		deliver.style.display = 'table-cell';

	}
}

function getBankPayment(obj){

	hideShowBankPaymentTypeOptions(obj);

	$(document).keypress(function(e) { 
		if (e.keyCode == 27) { 
			hideBTModel();
			setTimeout(function(){
				$('#deliveryPaymentType').focus();
			}, 1000);
		} 
	});
	var selectedDeliveryCreditor = document.getElementById('selectedDeliveryCreditorId');

	if(selectedDeliveryCreditor != null){
		selectedDeliveryCreditor.value = 0;
	}

	if($("#selectedDeliveryCreditorPanel").exists()) {
		if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
			$('#selectedDeliveryCreditorPanel').switchClass("show", "hide");
		} else {
			$('#selectedDeliveryCreditorPanel').switchClass("hide", "show");
			$("#deliveryCreditor").val('');
			$("#selectedDeliveryCreditorId").val(0);
		}
	}

	if(configuration.SearchCollectionPersonAutocomplete == "true"){
		if($("#tableSearchCollectionPerson").exists()) {
			if(obj.value == PAYMENT_TYPE_CREDIT_ID ) {
				$('#tableSearchCollectionPerson').switchClass("show", "hide");
				changeDisplayProperty('searchCollectionPerson', 'block');
			} else {
				$('#tableSearchCollectionPerson').switchClass("hide", "show");
				$("#searchCollectionPerson").val('');
				$("#selectedCollectionPersonId").val(0);
			};
		};
	}

	//obj.blur();

	if($('#creditDeliver').exists()) {
		if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID )
			$('#creditDeliver').switchClass("show", "hide");
		else
			$('#creditDeliver').switchClass("hide", "show");
	}

	var deliver			= document.getElementById('deliver');
	deliver.style.display = 'table-cell';

}

function hideShowPaymentTypeDetails(obj) {  // replaced from hideShowChequeDetails(obj)
	if (GeneralConfiguration.BankPaymentOperationRequired == 'true' || GeneralConfiguration.BankPaymentOperationRequired == true) {
		return;
	} else {
		if(obj.value == PAYMENT_TYPE_CHEQUE_ID) {
			$('#chequeDetails').switchClass("show", "hide");
		} else {
			$('#chequeDetails').switchClass("hide", "show");
			$('#chequeNo').val('');
			$('#chequeAmount').val('');
			$('#bankName').val('');
		}

		if(obj.value == PAYMENT_TYPE_CREDIT_CARD_ID || obj.value == PAYMENT_TYPE_DEBIT_CARD_ID) {
			$('#creditDebitCardDetails').switchClass("show", "hide");
		} else {
			$('#creditDebitCardDetails').switchClass("hide", "show");
			$('#creditDebitCardNo').val('');
			$('#creditDebitBankName').val('');
		}

		if(obj.value == PAYMENT_TYPE_PAYTM_ID) {
			$('#paytmDetails').switchClass("show", "hide");
		} else {
			$('#paytmDetails').switchClass("hide", "show");
			$('#paytmTransactionNo').val('');
		}

		var selectedDeliveryCreditor = document.getElementById('selectedDeliveryCreditorId');

		if(selectedDeliveryCreditor != null)
			selectedDeliveryCreditor.value = 0;

		if($("#selectedDeliveryCreditorPanel").exists()) {
			if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID) {
				$('#selectedDeliveryCreditorPanel').switchClass("show", "hide");
			} else {
				$('#selectedDeliveryCreditorPanel').switchClass("hide", "show");
				$("#deliveryCreditor").val('');
				$("#selectedDeliveryCreditorId").val(0);
			}
		}

		if(configuration.SearchCollectionPersonAutocomplete == "true"){
			if($("#tableSearchCollectionPerson").exists()) {
				if(obj.value == PAYMENT_TYPE_CREDIT_ID ) {
					$('#tableSearchCollectionPerson').switchClass("show", "hide");
					changeDisplayProperty('searchCollectionPerson', 'block');
				} else {
					$('#tableSearchCollectionPerson').switchClass("hide", "show");
					$("#searchCollectionPerson").val('');
					$("#selectedCollectionPersonId").val(0);
				};
			};
		}

		//obj.blur();

		if($('#creditDeliver').exists()) {
			if(obj.value == PAYMENT_TYPE_BILL_CREDIT_ID )
				$('#creditDeliver').switchClass("show", "hide");
			else
				$('#creditDeliver').switchClass("hide", "show");
		}

		var deliver			= document.getElementById('deliver');
		deliver.style.display = 'table-cell';
	}
}

function charsForDate(e){
	var keynum = getKeyCode(e);

	if(keynum == 8 || keynum == 45)
		return true;
	
	if (keynum < 48 || keynum > 57 )
		return false;
	
	return true;
}

function setFocusForDeliveryPaymentType(eleObj) {

	if(eleObj.value == PAYMENT_TYPE_CHEQUE_ID )
		next	= 'chequeDate';
	else if( eleObj.value == PAYMENT_TYPE_CASH_ID) {
		if(configuration.DisplayConsineeNameField == 'true')
			next	= 'consigneeNameAutocomplete';
		else
			next	= 'deliveredToName';
	} else if( eleObj.value == PAYMENT_TYPE_BILL_CREDIT_ID )
		next	= 'deliveryCreditor';
	else if(eleObj.value == PAYMENT_TYPE_CREDIT_ID && configuration.SearchCollectionPersonAutocomplete == "true" )
		next ='searchCollectionPerson';
	else
		next ='deliveredToName';

	prev	= 'deliveryPaymentType';
}

function nextToDeliveryCharges() {
	var table = document.getElementById('deliveryCharges');
	
	if(table != null && table != undefined && table.rows[0] != undefined)
		next = table.rows[0].cells[1].children[0].id;
}

function getLastCharge() {
	var charges		= jsondata.deliverChgs;
	prev			= 'deliveryCharge'+charges[charges.length - 1].chargeTypeMasterId;
}

function editlrlinks(execFldPermissions, TransportCommonMaster, ChargeTypeMaster, data, configuration) {
	$("#editlrlinkscharges" ).load( "/ivcargo/html/lrLinks/lrLinks.html", function() {
		createEditList(execFldPermissions, TransportCommonMaster, ChargeTypeMaster, data, configuration);
	});
}

function disableButton() {
	var deliverButton = document.getElementById('deliver');

	if(deliverButton != null) {
		deliverButton.className = 'btn_print_disabled';
		deliverButton.style.display ='none'; 
		deliverButton.disabled=true;
	}
}

function enableButton() {
	var deliverButton = document.getElementById('deliver');

	if(deliverButton != null) {
		deliverButton.className = 'btn btn-primary btn-lg';
		deliverButton.style.display ='block'; 
		deliverButton.disabled=false;
	}
}

function displayApprovedByField() {
	var receivableType		= getValueFromInputField('receivable');

	if(receivableType == ReceivableTypeConstant.AGAINST_LETTER_HEAD_ID 
			|| receivableType == ReceivableTypeConstant.AGAINST_BOND_ID) {
		switchHtmlTagClass('tableApprovedBy', 'show', 'hide');
		switchHtmlTagClass('approvedBy', 'show', 'hide');
		next='approvedBy';
	} else {
		switchHtmlTagClass('tableApprovedBy', 'hide', 'show');
		switchHtmlTagClass('approvedBy', 'hide', 'show');
		next='deliveredToName';
		$("#approvedBy").val("");
	}
}

function validateApprovedByField() {
	var receivableType		= getValueFromInputField('receivable');

	if(receivableType != ReceivableTypeConstant.CONSINEE_COPY_ID && !validateApprovedBy(1, 'approvedBy'))
		return true;

	return true;
}

function getReceivableTypes(jsonObject) {
	if(getValueFromInputField('receivable') != null)
		jsonObject.receivableTypeId		= getValueFromInputField('receivable');
}

function getApprovedBy(jsonObject) {
	if(getValueFromInputField('approvedBy') != null)
		jsonObject.approvedBy			= getValueFromInputField('approvedBy');
}

function getConsigneeDetails(jsonObject) {
	if(validateConsigneeName()) {
		jsonObject.name				= convertToHex($('#consigneeNameAutocomplete').val());
		jsonObject.partyId			= $('#newConsigneeCorpAccId').val();
	} 
}

function validateConsigneeName() {
	var consigneeCorpAccId		= $('#consigneeCorpAccId').val();
	var newConsigneeCorpAccId	= $('#newConsigneeCorpAccId').val();

	return newConsigneeCorpAccId > 0 && newConsigneeCorpAccId != consigneeCorpAccId;
}

function startServicesForTCE() {
	$('#gcrPhotoCapture').switchClass('show','hide');
	startWebCam('picVideo', 'pictureCanvas', 'takePicture');
	
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
		showUpperSignLayer('Click'+' <i class="glyphicon glyphicon-facetime-video"></i>'+' to Grant Permission to access Webcam');
		
	checkIfWebCamIsStreaming(configuration);
}

function startServices() {
	if (servicePermission.isPhotoTxnService) {
		$('#gcrPhotoCapture').switchClass('show','hide');
		startWebCam('picVideo', 'pictureCanvas', 'takePicture');
	} else {
		$('#gcrPhotoCapture').switchClass('hide','show');
		stopWebCam();
		clearCanvas('pictureCanvas');
	}

	if (servicePermission.isSignatureTxnService) {
		$('#gcrSignature').switchClass('show','hide');
		loadDrawCanvas('signaturepad');
	} else {
		$('#gcrSignature').switchClass('hide','show');
		clearCanvas('signaturepad');
	}

	if (servicePermission.isPhotoTxnService || servicePermission.isSignatureTxnService) {
		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			showUpperSignLayer('Click'+' <i class="glyphicon glyphicon-facetime-video"></i>'+' to Grant Permission to access Webcam');
		}
	}

	if(!$('#clearSignature').hasClass('clearSignature')){
		$('#clearSignature').addClass('clearSignature');
		$('#clearSignature').click(function(){
			clearCanvas('signaturepad');
		});
	}

	if(!$('#closeSignatureModal').hasClass('closeSignatureModal')){
		$('#closeSignatureModal').addClass('closeSignatureModal');
		$('#closeSignatureModal').click(function(){
		$("#deliver").focus();
		});
	}
	
	if(configuration.PhotoServiceValidate == 'true' || configuration.PhotoServiceValidate == true)
		showUpperSignLayer('Click'+' <i class="glyphicon glyphicon-facetime-video"></i>'+' to Grant Permission to access Webcam');
	
	checkIfWebCamIsStreaming(configuration);
}

function setFocusToDoorDly() {
	var waybillId 			= getValueFromInputField('waybillId');
	var prevDeliveryTo		= getValueFromInputField('deliveryTypeId');

	if (confirm("Do you want to Change Delivery At Destination")){
		var deliveryTo	= $('#deliveryAt').val();

		if(deliveryTo == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
			editDeliveryTo(deliveryTo, waybillId, prevDeliveryTo);
			setValueToHtmlTag('DeliveryTo', getValueTextFromOptionField('deliveryAt'));
			setValueToTextField('deliveryTypeId', InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID);

			$("#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).prop('readonly', false);
			$("#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).focus();
		} else {
			$("#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).val(0);
			$("#deliveryCharge" + DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY).prop('readonly', true);
		}
	}
}

function editDeliveryTo(deliveryTo, waybillId, prevDeliveryTo) {
	var jsonObject					= new Object();
	jsonObject.deliveryTo			= deliveryTo;
	jsonObject.wayBillId			= waybillId;
	jsonObject.prevDeliveryTo		= prevDeliveryTo;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/updateDeliveryAtWS/updateDeliveryAtFromUI.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.errorCode) {
				showMessage('info', data.errorDescription);
				return;
			}
		}
	});
}

function showEditDeliveryAt() {
	if(configuration.EditDoorDeliveryAllow == 'true')
		$('#deliveryAt').show();
	else
		$('#deliveryAt').hide();
}

function setDeliveryAt(deliveryTypeId) {
	if(configuration.EditDoorDeliveryAllow == 'true') {
		if(deliveryTypeId == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
			$('#deliveryAt').hide();
		else if(deliveryTypeId == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
			$('#deliveryAt').show();
	}
}

function validatePanNumber() {
	let panNum 	= $('#deliveryPanNumber').val();

	if($('#tdsAmount').val() > 0 && (panNum == '' || panNum == undefined)) {
		showMessage('error', ' Please Enter PAN Number!');
		$('#deliveryPanNumber').focus();
		return false;
	}
			
	return checkValidPanNum('deliveryPanNumber');
}

//-----------------------------------------------------------------------------------
function setPartialReceivedAmount() {
	if(configuration.isPartialPaymentAllow == 'true'){
		if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID && $('#billAmount').val() > 0){
			var modal = document.getElementById('partialPaymentModal');
			var span = document.getElementsByClassName("close")[0];
			modal.style.display = "block";
			span.onclick = function() {
				modal.style.display = "none";
				$('#deliveryPaymentType').val(1);
				hideShowPaymentTypeDetails($('#deliveryPaymentType'));
				setResetPartialPaymentOption();
			}
			$('#receivedAmtEle').focus();
			setValueToTextField('grandTotalEle', $('#billAmount').val());
			setPaymentModeOption();
			showpartialChequeDetails();
			setResetPartialPaymentOption();
		} else {
			showMessage('error', "First Enter Amount To be Receive !");
		}
	}
}

function calculateBalance() {
	var grandTotal = $('#billAmount').val();
	var receivedAmt = $('#receivedAmtEle').val();

	if(Number(grandTotal) == Number(receivedAmt)) {
		showMessage('error', "If You Are Receive Full Amount, Then Please Select Cash Payment Type !");
		setValueToTextField('balanceAmtEle', 0);
	} else if(Number(grandTotal) < Number(receivedAmt)) {
		showMessage('error', "You Can Not Enter Excess Amount !");
		setValueToTextField('balanceAmtEle', 0);
		resetPartialChequePaymentDetails();
	} else {
		setValueToTextField('balanceAmtEle', (Number(grandTotal) - Number(receivedAmt)));
		return true;
	}
	return false;
}

function setResetPartialPaymentOption() {
	if(configuration.isPartialPaymentAllow == 'true'){
		if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CREDIT_ID) {
			switchHtmlTagClass('receivedAmountlPanel', 'show', 'hide');
			switchHtmlTagClass('balanceAmountPanel', 'show', 'hide');
			switchHtmlTagClass('partialPaymentModePanel', 'show', 'hide');
		} else {
			resetPartialPaymentDetails();
			resetPartialChequePaymentDetails();
			switchHtmlTagClass('partialPaymentModePanel', 'hide', 'show');
			switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
			switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		}
	}
	
	if(configuration.isAlertOnCashPayment == true || configuration.isAlertOnCashPayment == 'true') {
		var branchIdListForAlertOnCashPayment	= (configuration.branchIdsForAlertOnCashPayment).split(',');
		
		if(isValueExistInArray(branchIdListForAlertOnCashPayment, executive.branchId)) {
			if($('#deliveryPaymentType').val() == PAYMENT_TYPE_CASH_ID) {
				$('#paymentConfirmBox').bPopup({
					modalClose: false,
		            opacity: 0.6,
		            positionStyle: 'fixed'
				}, function() {
					var _thisMod = this;
						next	 = "confirmDiv";
					$('#confirmDiv').focus();
					
					$(this).html("<div class='confirm' id = 'confirmDiv' style='height:150px;width:250px; padding:5px'>"
					+"<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Are you sure you are receiving cash payment ?</b><div><br/>"		
					+"<button autofocus id='confirm'>OK</button></center>"
					+"<button id='cancelButton'>Cancel</button></div>")
					
						$("#confirm").click(function() {
							$('#confirmDiv').focus();
							$('#deliveryPaymentType').val(PAYMENT_TYPE_CASH_ID);
							_thisMod.close();
							$('#deliveredToName').focus();
						})
						$("#cancelButton").click(function() {
							$('#confirmDiv').focus();
							for(i=0;i<paymentTypeArr.length;i++){
								if(paymentTypeArr[i].paymentTypeId == PAYMENT_TYPE_CREDIT_ID){
									$('#deliveryPaymentType').val(PAYMENT_TYPE_CREDIT_ID);
									$('#deliveryPaymentType').focus();
									break;
								} else {
									$('#deliveryPaymentType').val(0);
									$('#deliveryPaymentType').focus();
								}
							}
							_thisMod.close();
						});
				});
			}
		}
	}
}

function resetPartialChequePaymentDetails() {
	setValueToTextField('paymentMode', 1);
	$('#partialChequeAmount').val(0);
	$('#partialChequeNo').val('');
	$('#partialBankName').val('');
	switchHtmlTagClass('partialChequeDetails', 'hide', 'show');
}

function resetPartialPaymentDetails() {
	$('#receivedAmount').val(0);
	$('#balanceAmount').val(0);
	$('#receivedAmtEle').val(0);
	$('#balanceAmtEle').val(0);
}

function setReceivedAndBalanceAmount() {
	if(!calculateBalance())
		return;
	
	if( $('#receivedAmtEle').val() == 0){
		showMessage('error',  receivedAmountErrMsg);
		return;
	}

	if($('#paymentMode').val() == 2){
		if( $('#partialChequeNo').val() == ''){
			showMessage('error', enterChequeNumberErrMsg);
			return;
		}
		
		if( $('#partialBankName').val() == ''){
			showMessage('error', enterBankNumberErrMsg);
			return;
		}
	}

	var modal = document.getElementById('partialPaymentModal');
	setValueToTextField('receivedAmount', $('#receivedAmtEle').val());
	setValueToTextField('balanceAmount', $('#balanceAmtEle').val());
	modal.style.display = "none";
}

function showpartialChequeDetails() {
	if($("#paymentMode").val() == PAYMENT_TYPE_CHEQUE_ID)
		switchHtmlTagClass('partialChequeDetails', 'show', 'hide');
	else
		switchHtmlTagClass('partialChequeDetails', 'hide', 'show');
	
	$( function() {
		$('#partialChequeDate').daterangepicker({
			singleDatePicker: true,
			showDropdowns: true,
			maxDate	: moment().add(3, 'month').endOf('month'),
			minDate	: moment().subtract(3, 'month').startOf('month')
		});
	} );
}

function setPartialChequeAmount() {
	if($("#partialChequeAmount").exists()) {
		if($("#paymentMode").val() == PAYMENT_TYPE_CHEQUE_ID)
			$("#partialChequeAmount").val($("#receivedAmtEle").val());
		else
			$("#partialChequeAmount").val('');
	}
}

function setPaymentModeOption() {
	removeOption('paymentMode',null);

	createOption('paymentMode', PAYMENT_TYPE_CASH_ID, PAYMENT_TYPE_CASH_NAME);
	createOption('paymentMode', PAYMENT_TYPE_CHEQUE_ID, PAYMENT_TYPE_CHEQUE_NAME);

}

function setPartialPaymentTypeOption() {
	removeOption('partialPaymentType', null);

	createOption('partialPaymentType', 0, '---Select Payment Type---');
	createOption('partialPaymentType', FeildPermissionsConstant.SHORT_CREDIT_PARTIAL_PAYMENT, 'Partial Payment');
}

function bindFocusOnLastCharge() {
	if(isDeliveryDiscountAllow != undefined) {
		$("#discountTypes").blur(function () {
			setFocusOnPartialPayment(this);
		});	
	} else {
		$("#"+$("#deliveryCharges tr:last input")[0].id).blur(function (){
			setFocusOnPartialPayment(this);
		});	
	}

	$("#saveBtn").click(function (){
		setFocusOnPartialPayment(this);
	});	
}

function setFocusOnPartialPayment(ele){
	if(isDeliveryDiscountAllow != undefined && ele.id == 'discountTypes')
		$('#partialPaymentType').focus();
	else if(ele.id == $("#deliveryCharges tr:last input")[0].id)
		$('#partialPaymentType').focus();
	else if(ele.id == 'saveBtn')
		$('#deliver').focus();
	else if(ele.id == 'paymentMode')
		$('#partialChequeDate').focus();
}

function allowToDeliveryLRForSelfParty() {
	var newConsigneeCorpAccId		= $('#newConsigneeCorpAccId').val();
	var consigneeCorpAccId			= $('#consigneeCorpAccId').val();

	if(dbWiseSelfPartCA) {
		if(dbWiseSelfPartCA.corporateAccountId == Number(newConsigneeCorpAccId))
			return false;
		else if(dbWiseSelfPartCA.corporateAccountId == Number(consigneeCorpAccId) && newConsigneeCorpAccId == 0)
			return false;
	}

	return true;
}

function checkForNewParty(objId) {

	var jsonObject					= new Object();
	var stringNew					= '(New)';
	var allowToSaveParty			= false;

	var consigneeNameAutocomplete	= $('#consigneeNameAutocomplete').val();

	var obj 	= document.getElementById(objId);
	var valObj 	= obj.value;

	if(valObj == '' || consigneeNameAutocomplete == '')
		return;

	allowToSaveParty				= valObj.includes(stringNew);

	$('#consigneeNameAutocomplete').val(consigneeNameAutocomplete.replace(stringNew, ''));

	if(configuration.ConsigneePartyAutoSaveAllow == 'false')
		return;

	if(allowToSaveParty) {
		if(confirm("Are you sure you want to save Party ?")) {
			jsonObject.partyType			= CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH;
			jsonObject.partyName			= consigneeNameAutocomplete.replace(stringNew, '');
			jsonObject.partyAddress			= executive.branchName;
			jsonObject.partyMobileNumber	= '0000000000';
			jsonObject.partyBranchId		= branchId;
			jsonObject.isPodRequired		= 0;

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("CorporatePartySaveAjaxAction.do?pageId=9&eventId=17",
					{json:jsonStr}, function(data) {
						if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
							showMessage('error', data.errorDescription);
						} else {
							var newPartyId = parseInt(data.partyid);

							if(newPartyId > 0) {
								setConsigneeDetails(newPartyId); //Defined in generatecrSetReset.js
								$('#receivable').focus();
							}
						}
					});
		} else {
			$('#receivable').focus();
		}
	}
}

setTimeout(function(){
	$('#findCR').click(function(){
		getWaybillData($('#waybillId').val());
	});
},500);

function calculateDiscountLimit() {
	if(checkDiscountValidation && !validateDiscountLimit(discountInPercent, dlyTotal, $('#txtDelDisc').val(), $('#txtDelDisc')))
		return false;
		
	return true;
}

function validateDiscountLimit(discountInPercent, totalAmount, enteredAmount, element) {
	var discountAmtLimit	 = Math.round((Math.abs(totalAmount) * discountInPercent) / 100);
	
	if(discountInPercent > 0 && Number(Math.abs(enteredAmount)) > Number(discountAmtLimit)) {
		if($('#isDiscountPercent').length && $("#isDiscountPercent").is(":visible")) {
			if($('#isDiscountPercent').prop("checked"))
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountInPercent + "%");
			else
				showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
		} else
			showMessage('error', "Discount Amount Cannot Be Greater Than " + discountAmtLimit);
			
		if(element != undefined && element != null)
			changeTextFieldColorNew(element, '', '', 'red');

		return false;
	}

	return true;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function getBillingBranch(branchId, billingBranchName){
	$('#billingBranchId').val(branchId);
}

function getBillingBranchData(jsonObject){
	if(getValueFromInputField('billingBranchId') != null)
		jsonObject.billingBranchId		= getValueFromInputField('billingBranchId');
	else
		jsonObject.billingBranchId		= 0;
}

function hideAndShowBillingBranch() {
	if(configuration.billingBranch == true || configuration.billingBranch == 'true') {
		if($('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID)
			$('#billingBranchPanel').removeClass('hide');
		else
			$('#billingBranchPanel').addClass('hide');
	} else
		$('#billingBranchPanel').addClass('hide');
	
	setBillingBranch();
}


function hideDiscountOnWayBillTypeTbb() {
	if(configuration.hideDiscountOnLrTypeTbb == "true") {
		if($('#waybillTypeId').val() == WAYBILL_TYPE_CREDIT) {
			$('#txtDelDisc').prop("readonly", true);
			$('#discountTypes').prop("disabled", true);
		} else if($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY && $('#deliveryPaymentType').val() == PAYMENT_TYPE_BILL_CREDIT_ID && configuration.showDiscountOnBillCredit == "false") {
			$('#txtDelDisc').prop("readonly", true);
			$('#discountTypes').prop("disabled", true);
		} else {
			$('#txtDelDisc').prop("readonly", false);
			$('#discountTypes').prop("disabled", false);
		}
	}
}
function disableCharge(chargeId) {
	setTimeout(() => {
		$("#deliveryCharge"+chargeId).attr('readonly', true);
	}, 200);
}

function isstbscreationallow(obj) {
	if (configuration.showShortCreditOutstandingAmount == "true" || configuration.showShortCreditOutstandingAmount == true) {
		if (obj.value == PAYMENT_TYPE_CREDIT_ID) {
			let jsonObject = new Object();
			jsonObject["corporateAccountId"] = consigneeCorpId;
			let consigneeName = $('#consigneeName').text()
			$.ajax({
				type: "POST",
				url: WEB_SERVICE_URL + '/creditPaymentModuleWS/getShortCreditDueAmount.do',
				data: jsonObject,
				dataType: 'json',
				success: function(data) {
					if (data.outStandingAmount > 0) {
						$('#NameforPopup').html(`The Previous Short Credit Amount of ${consigneeName} is  Rs `)
						$('#AmountSection').html(data.outStandingAmount)
						$('#exampleModalforShortCredit').modal('show')
						localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
						$(() => {
							$('#AmountSection').on('click', function() {
								childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditOutStandingReportLR&masterid=&tab=6", "_blank");
							})
						})
					}
				}
			});
		}
	}

	if((configuration.isShowStbsCreationAllowCheckBox == 'true'|| configuration.isShowStbsCreationAllowCheckBox == true) &&
			(isValueExistInArray(headOfficeSubregionArr, executive.subRegionId) || isValueExistInArray(headOfficeSubregionArr, 0))) {	
		if(obj.value == PAYMENT_TYPE_CREDIT_ID){
			$("#stbscreationallowId").css('display','inline-block');
			
			if(isValueExistInArray(headOfficeSubregionArr, executive.subRegionId)) {
				$('#isstbscreationallowId').prop('checked', true);
				$('#isstbscreationallowId').prop('disabled', true);
			}
		} else {
			$("#stbscreationallowId").css('display','none');
			$("#isstbscreationallowId").prop("checked", false);
		}
	}	
}  

function validatePrepaidAmount(str, delveryAmt) {
	if(!wayBillTypeList.includes($('#waybillTypeId').val())) {
		deliveryLROrShowPopup(str, delveryAmt)
	} else {
		var jsonObject			= new Object();

		if ($('#waybillTypeId').val() == WAYBILL_TYPE_TO_PAY)
			jsonObject["bookingTotal"]		= Number($('#deliveryCharge1'));

		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/wayBillWS/getCheckedBranchWisePrepaidAmount.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {

				if(data != null && !data.invalid){
					if(data.branchWisePrepaidAmount != undefined)
						prepaidAmountId	= data.branchWisePrepaidAmount.prepaidAmountId;
					
					deliveryLROrShowPopup(str, delveryAmt)
				} else {
					enableButton();
					showMessage('error', iconForErrMsg + ' ' + data.message);
					return;
				}
			},
		});
	}
}

function deliveryTimeChargeForHamali(wbData) {
	var remainingquntity			= 0;
	var bikequntity					= 0;
	var packingquntity				= 0;

	var handlingChargesNotApplicableArr 	= (configuration.handlingChargesNotApplicableForPackingTypeIds).split(',');
	var amountApplicableArr 				= (configuration.handlingChargesAmountApplicableForPackingTypeIds).split(',');
	var quantityWiseAmountArr 				= (configuration.quantity_Amount).split(",");

	for (var i = 0; i < wbData.consignmentDetails.length; i++) {
		var consinDets		= wbData.consignmentDetails[i];

		if(consinDets.packingTypeMasterId == 152 || consinDets.packingTypeMasterId == 99)
			bikequntity   		+= consinDets.quantity;
		else if(isValueExistInArray(amountApplicableArr, consinDets.packingTypeMasterId))
			packingquntity		+= consinDets.quantity; 
		else if(!isValueExistInArray(handlingChargesNotApplicableArr, consinDets.packingTypeMasterId))
			remainingquntity    += consinDets.quantity;
	}
	$('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val(0);
	for (var j = 0; j < quantityWiseAmountArr.length; j++) {
		var quantityAmount 			= quantityWiseAmountArr[j];
		var quantityAndAmountArr 	= quantityAmount.split('_');
		
		if(quantityAndAmountArr[0] >= remainingquntity) {
			$('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val(Number($('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val()) + (remainingquntity * quantityAndAmountArr[1]));
			break;
		}
	}
	
	$('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val(Number($('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val()) + (bikequntity * Number(configuration.perArticleAmountForBikePackingType)));
	$('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val(Number($('#deliveryCharge' + DeliveryChargeConstant.HANDLING).val()) + (packingquntity * Number(configuration.perArticleAmountForPacketPackingType)));
}

function setDeliveredToNameMobileLebel(jsondata) {
	$('#deliveredToNameLebel').text(jsondata.configuration.deliveredToNameLebel);
	$('#deliveredToName').attr("placeholder", jsondata.configuration.deliveredToNameLebel);
	
	$('#deliveredToName').bind('focus', function () {
		showInfo(this, jsondata.configuration.deliveredToNameLebel);
	});
		
	$('#deliveredToPhoneNumberLebel').text(jsondata.configuration.deliveredToPhoneNumberLebel);
	$('#deliveredToPhoneNo').attr("placeholder", jsondata.configuration.deliveredToPhoneNumberLebel);
		
	$('#deliveredToPhoneNo').bind('focus', function () {
		showInfo(this, jsondata.configuration.deliveredToPhoneNumberLebel);
	});
}

function calculateUnloadingChargeOnFreight(wayBillTypeId) {
	if(configuration.calculateUnloadingChargeOnFreight == 'true' && (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID)) {
		var freightCharge = $('#deliveryCharge' + BookingChargeConstant.FREIGHT).val();
		
		$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val(Math.round(Number(freightCharge) * configuration.percentageToCalculateUnloadingChargeOnFreight) / 100);
		$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).prop("readonly", "true");
		calulateBillAmount();
	}
}

function setUnloadingAmountKcpl(data) {
	var totalPacket	= 0;
	var checkDeliveryChargeArticleArr		= (configuration.deliveryChargeCalculatePerArticleByBranchId).split(',');
	var checkArticleAfterSomeQuantityArr	= (configuration.branchIdsForChangeInPerArticleAfterSomeQuantity).split(',');
	var branchIdForUnloadingChargeArr		= (configuration.branchIdForUnloadingCharge).split(',');
	var consignmentDetails					= data.consignmentDetails;
	var sourceBranchIdForUnloading			= parseInt(configuration.sourceBranchIdForUnloading);
	
	wayBillConsignmentSummary 	= data.consignmentSummary;
	waybillMod					= data.waybillMod;
	
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_PAID) {
		$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).prop('readonly', true);
		$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).prop('readonly', true);
	}
		
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
		$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).prop('readonly', true);
		$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).prop('readonly', true);
	}
		
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
		$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).prop('readonly', true);
	}
		
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_FOC){
		$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).prop('readonly', true);
		$('#deliveryCharge' + DeliveryChargeConstant.DAMERAGE).prop('readonly', true);
		$('#deliveryCharge' + DeliveryChargeConstant.LOCAL_FREIGHT_DELIVERY).prop('readonly', true);
	}
	
	for(var i = 0; i < consignmentDetails.length; i++) {
		var temp				= consignmentDetails[i];
		var quantity			= temp.quantity;
		var typeofPacking		= temp.packingTypeMasterId;
		
		if(waybillMod.wayBillTypeId != WAYBILL_TYPE_FOC) {
			if(isValueExistInArray(branchIdForUnloadingChargeArr, executive.branchId)) {
				if(typeofPacking == 342)
					totalPacket += quantity;
				
				if(isValueExistInArray(checkDeliveryChargeArticleArr, executive.branchId)) {
					if(isValueExistInArray(checkArticleAfterSomeQuantityArr, executive.branchId) && (wayBillConsignmentSummary.quantity - totalPacket) > 10)
						unloadingChargeAmount 	= wayBillConsignmentSummary.quantity * 15;
					else if(typeofPacking == 335 || typeofPacking == 336)
						unloadingChargeAmount 	+= 0;
					else if(typeofPacking == 342)
						unloadingChargeAmount	+= quantity * 10;
					else if((executive.branchId == sourceBranchIdForUnloading) && typeofPacking == 325)
						unloadingChargeAmount	+= quantity * 10;	
					else
						unloadingChargeAmount	+= quantity * 20;
				} 
			} else
				unloadingChargeAmount		= wayBillConsignmentSummary.quantity * 10;
		}
 	}
 	
	if(waybillMod.wayBillTypeId == WAYBILL_TYPE_CREDIT)
		unloadingChargeAmount	= 0;
			
	$('#deliveryCharge' + DeliveryChargeConstant.UNLOADING).val(unloadingChargeAmount);
	
}

function deliveryTimeOTP() {
	if ($('#OTPSelection').prop('checked'))
		$("#deliveryOTPDiv").removeClass('hide');
	else
		$("#deliveryOTPDiv").addClass('hide');
	
	if ($('#OTPSelection').prop('checked')) {
		if(!validateDeliveredPersonPhoneNumber())
			return;
		
		showLayer();
		
		var jsonObject = new Object()
		jsonObject.deliveredMobileNo 	= $('#deliveredToPhoneNo').val();
		jsonObject.wayBillNumber 		= $('#lrNum').text();
		jsonObject.waybillId	 		= $('#waybillId').val();
		
		OTPNumber	= 0;

		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if (data.message != undefined) {
					var errorMessage = data.message;
					OTPNumber = data.otpNumber;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					return;
				}
				
				hideLayer();
			}
		});
	}
}

function setPrevDeliveredToNameAndNumber() {
	if(localStorage.getItem("prevDeliveryCustId") != null && localStorage.getItem("prevDeliveryCustId") != undefined)
		$('#selectedDeliveryCustomerId').val(localStorage.getItem("prevDeliveryCustId"));
			
	if(localStorage.getItem("prevDeliveredToName") != null && localStorage.getItem("prevDeliveredToName") != undefined) 
		$('#deliveredToName').val(localStorage.getItem("prevDeliveredToName"));
		
	if(localStorage.getItem("prevDeliveredToNumber") != null && localStorage.getItem("prevDeliveredToNumber") != undefined)
		$('#deliveredToPhoneNo').val(localStorage.getItem("prevDeliveredToNumber"));
		
 	if(configuration.showPreviousCrNumberAndAmount == 'true') {
		$('#hidePrevAmtAndPreNumber').removeClass('hide');
		$('#prevDeliveredAmt').prop('disabled', true);
	
		if(localStorage.getItem("prevDeliveredAmt") != null && localStorage.getItem("prevDeliveredAmt") != undefined)
			$('#prevDeliveredAmt').val(localStorage.getItem("prevDeliveredAmt"));
			
		if(localStorage.getItem("prevDeliveryNumber") != null && localStorage.getItem("prevDeliveryNumber") != undefined) {
			$('#prevCrNumber').val(localStorage.getItem("prevDeliveryNumber"));
			$('#prevCrNumber').html(localStorage.getItem("prevDeliveryNumber"));
		}
	}
}

function setDeliveryNumberInLocalStorage(crNumber) {
	var preWayBillDeliveryNumber = null;
	
	preWayBillDeliveryNumber = localStorage.getItem("prevDeliveryNumber");
	
	if(preWayBillDeliveryNumber != undefined && preWayBillDeliveryNumber != null && allowPreviousDeliveryNumber)
		localStorage.setItem("prevDeliveryNumber", preWayBillDeliveryNumber + "," + crNumber);
	else
		localStorage.setItem("prevDeliveryNumber", crNumber);
}

function applayRatePerArticle(data) {
	if(data.waybillMod.wayBillTypeId == WAYBILL_TYPE_FOC)
		return;
		
 	wayBillConsignmentSummary = data.consignmentSummary;
 	let excludeBranchIdArr = (configuration.excludeBranchIdsToApplyPerArticleRate).split(',');
	let ChargeIdWithAmtArray = (configuration.chargeIdAndAmtToApplyPerArticleRate).split(',');

	if (configuration.applyRatePerAerticleBranchWise == 'true' || configuration.applyRatePerAerticleBranchWise == true) {
		let branchIdArr = (configuration.branchIdsToApplyPerArticleRate).split(',');
		
		if(isValueExistInArray(branchIdArr, branchId))
			setPerArticleAmount(ChargeIdWithAmtArray);
	} else if(!isValueExistInArray(excludeBranchIdArr, branchId))
		setPerArticleAmount(ChargeIdWithAmtArray);
}

function setPerArticleAmount(ChargeIdWithAmtArray){
	for(const element of ChargeIdWithAmtArray) {
		let chargeId = element.split("_")[0];
		let chargeAmt = Number(element.split("_")[1]);
		$('#deliveryCharge' + chargeId).val(chargeAmt * wayBillConsignmentSummary.quantity);
	}
}

function setNextPreviousForDeliver() {
	if (configuration.setFocusOnDeliverBtn =='true')
		next = 'deliver';
}
  
function isDeliveryTimeShortCreditParty() {
	if(Number($('#deliveryPaymentType').val()) != PAYMENT_TYPE_CREDIT_ID)
		return true;
			
	return Number($('#deliveryPaymentType').val()) == PAYMENT_TYPE_CREDIT_ID && 
				(Number($('#shortCreditAllowOnTxnType').val()) == SHORT_CREDIT_TXN_TYPE_DELEIVERY || Number($('#shortCreditAllowOnTxnType').val()) == SHORT_CREDIT_TXN_TYPE_BOTH)
}

function validateInputForQRPayment() {
	if(!allowDynamicPhonepeQR)
		return true;

	if(Number($('#deliveryPaymentType').val()) == PAYMENT_TYPE_PHONE_PAY_ID) {
		if (!validateDeliverdToName(1, 'deliveredToName') || !validateDeliveredPersonPhoneNumber() || !validateDeliveryRemark()) {
			setValueToTextField('deliveryPaymentType', configuration.DefaultPaymentType);
			return false;
		}
	}
	return true;
}

function validateDeliveryRemark() {
	if(configuration.DeliveryRemarkValidate == "true") {
		if (configuration.deliveryRemarkValidateOnDiscount == "true") {
			if ($('#txtDelDisc').val() > 0 && !validateRemark(1, 'deliveryRemark', 'deliveryRemark')) {
				enableButton();
				return false;
			}
		} else if (!validateRemark(1, 'deliveryRemark', 'deliveryRemark')) {
			enableButton();
			return false;
		}
	}
	
	return true;
}

function getLRTypeNameById(selectedTokenLRType) {
	switch(selectedTokenLRType) {
		case WAYBILL_TYPE_PAID:
			return "Paid";
		case WAYBILL_TYPE_TO_PAY:
			return "To Pay";
		case WAYBILL_TYPE_CREDIT:
			return "TBB";
		case WAYBILL_TYPE_FOC:
			return "FOC";
	}	
}

function hideShowRecoveryBranch() {
	if(configuration.showRecoveryBranchForShortCredit == 'true') {
		if(Number($('#deliveryPaymentType').val()) == PAYMENT_TYPE_CREDIT_ID)
			$('#recoveryBranchPanel').removeClass('hide');			
		else
			$('#recoveryBranchPanel').addClass('hide');
	} else
		$('#recoveryBranchPanel').addClass('hide');
	
	setRecoveryBranch();
}

function getRecoveryBranchData(jsonObject){
	if(getValueFromInputField('recoveryBranchId') != null)
		jsonObject.recoveryBranchId		= getValueFromInputField('recoveryBranchId');
	else
		jsonObject.recoveryBranchId		= 0;
}

function getRecoveryBranch(branchId){
	$('#recoveryBranchId').val(branchId);
}

function setDisabledChargesOnPaymentType(eleObj) {
	if(eleObj.value == PAYMENT_TYPE_CROSSING_CREDIT_ID){
		$('[id^="deliveryCharge"], #txtDelDisc, #discountTypes').prop('disabled', true).val('0');
		calculateTotalBillAmount();
	} else 
		$('[id^="deliveryCharge"], #txtDelDisc, #discountTypes').prop('disabled', false);

}