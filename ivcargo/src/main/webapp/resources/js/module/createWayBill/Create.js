/*
 * loadWayBillData-
 * it will load whole page and append data as par configuration file.
 */

/*
 * Rework by Anant Chaudhary	28-01-2016/29-01-2016
 */

/*
 * Please include genericfunctions.js file
 * Please include VariableForErrorMsg.js file
 * Please include VariableForCreateWayBill.js file
 * Please include WayBillSetReset.js file
 * Please include formTypes.js file
 * Please include createColumnForDataPanel file
 * Please include elementfocusnavigation.js file after this file
 * Please include commonFunctionForCreateWayBill.js file
 * Please include autocomplete.js file
 */
var usedDummyLRFlag;
var token = "";

var QR_CODE_USING_CONSIGNMENT		= 1;

function checkUsedDummyLR(usedLRFlag) {
	usedDummyLRFlag	= usedLRFlag;
	if (usedLRFlag) {
		var overlay = jQuery('<div id="overlay1"></div>');
		overlay.appendTo(document.body)
		if (confirm("Delete Used Dummy LR To Continue !")) {
			$("#overlay").remove();
			usedDummyLRFlag	= false;
			var jsonObject	= new Object();
			jsonObject.filter	= 6;
			var jsonStr	= JSON.stringify(jsonObject);
			$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					showMessage('success', 'Used Dummy LR Deleted From Records !!!');
				}
			});
		} else {
			$("#overlay").remove();
		}
	}
}
function loadWayBillData(dummyFlag) {
	showLayer();
	isDummyLR	= dummyFlag;
	
	var jsonObject		= new Object();
	if (isDummyLR) {
		jsonObject.filter		= 5;
	} else {
		jsonObject.filter	= 1;
	}
	
	jsonObject.isDummyLR	= isDummyLR;
	jsonObject.isManual	= false;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13", {json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					
					if(data.configuration.redirectToHomePageIfBookingSequenceNotGivenToAdmin == 'true' && data.executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN
						&& homePageUrl != null)
						window.location.href = homePageUrl;
					
					hideLayer();
				} else {

					jsondata							= data;
					token								= data.token;

					executive							= jsondata.executive; // executive object
					branchId							= executive.branchId;
					cityId								= executive.cityId;
					accountGroupId						= executive.accountGroupId;
					accountGroup						= jsondata.accountGroup;
					isManualWayBill						= false;
					isFromDynamicPaymentTypeSelection	= false;

					// all constants  
					BookingTypeConstant					= jsondata.BookingTypeConstant;
					ChargeTypeMaster					= jsondata.ChargeTypeMaster;
					BookingChargeConstant				= jsondata.BookingChargeConstant;
					CustomerDetails						= jsondata.CustomerDetailsConstant;
					RateMaster							= jsondata.RateMasterConstant;
					State								= jsondata.State;
					WayBillType							= jsondata.WayBillTypeConstant;
					TransportCommonMaster				= jsondata.TransportCommonMaster;
					Branch								= jsondata.Branch;
					CorporateAccount					= jsondata.CorporateAccountConstant;
					TaxPaidByConstant					= jsondata.TaxPaidByConstant;
					ChargeTypeConstant					= jsondata.ChargeTypeConstant;
					InfoForDeliveryConstant				= jsondata.InfoForDeliveryConstant;
					PartyMaster							= jsondata.PartyMasterConstant;
					WayBill								= jsondata.WayBill;
					ChargeConfiguration					= jsondata.ChargeConfigurationConstant;
					GroupConfigurationProperties		= jsondata.GroupConfigurationProperties;
					PackingTypeMaster					= jsondata.PackingTypeConstant;
					FormTypeConstant					= jsondata.FormTypeConstant;
					PackingGroupMappingArr				= jsondata.packingGroupMappingArr;
					RateHm								= jsondata.rateHm;
					PaymentTypeConstant					= jsondata.PaymentTypeConstant;
					formTypeMastersArray 				= jsondata.formTypeMastersArray;
					vehicleTypeConstant 				= jsondata.VehicleTypeConstant;
					destinationBranch					= jsondata.destinationBranch;
					destinationBranchIds				= jsondata.destinationBranchIds;
					agentCommissionValue				= jsondata.agentCommissionValue;
					selfCorporateAccountId				= jsondata.selfCorporateAccountId;
					ServiceTypeConstant					= jsondata.ServiceTypeConstant;
					ExecutiveTypeConstant				= jsondata.ExecutiveTypeConstant;
					consignmentGoods					= jsondata.consignmentGoods;
					PODRequiredConstant					= jsondata.PODRequiredConstant;
					deliveryToArray						= jsondata.deliveryToArray;
					tdsConfiguration					= jsondata.tdsConfiguration;
					podConfiguration					= jsondata.podConfiguration;
					allowChequeBouncePayment			= jsondata.allowChequeBouncePayment;
					discountInPercent					= jsondata.discountInPercent;
					TaxMasterConstant					= jsondata.TaxMasterConstant;
					waybillNumber						= jsondata.waybillNumber;
					GeneralConfiguration				= jsondata.GeneralConfiguration;
					uploadPdfDetailsList				= jsondata.uploadPdfDetailsList;

					/*
					 * Compalsary for Bank Payment Operations
					 */
					ModuleIdentifierConstant			= jsondata.ModuleIdentifierConstant;
					paymentTypeArr						= jsondata.paymentTypeArr;
					moduleId							= jsondata.moduleId;
					incomeExpenseModuleId				= jsondata.incomeExpenseModuleId;
					SubRegion							= jsondata.SubRegion;
					loggedInExecutiveSubregion			= jsondata.loggedInExecutiveSubregion;
					showLRNumberPopup					= jsondata.showLRNumberPopup;
					// group configuration
					configuration				= data.configuration;
					subRegionIdsForOverNite		= configuration.subRegionIdsForOverNite;
					loggedInBranch				= data.loggedInBranch;
					loggedInExecutiveBranch		= data.loggedInExecutiveBranch;
					sourceBranchStateId			= loggedInBranch.stateId;
				    isTokenThroughLRBooking     = jsondata.isTokenThroughLRBooking;
				    taxModelHm    			 	= jsondata.taxModelHm;
				    branchcache					= jsondata.branchcache;
				    packingTypeGoods			= jsondata.packingTypeGoods;
								
					/*
						Change Rate flavour type subregion wise
					*/
					changeFlavourTypeSubregionWise();
					/*
						Change property to allow subregion wise volumetric
					*/
					showVolumetricRateSubregionWise();
					checkValidateNextLRNumberOnLogin();
					checkBranchIdForServiceTaxCalculation();
				
					checkBranchIdForGstValidation();
					chargeTypeFlavour		= configuration.ChargeTypeFlavour;
					minWeight				= configuration.MinWeight;
					defaultlrCharge			= configuration.LRCharge;
					aplyRateForCharges		= (configuration.ApplyRateForCharges).split(",");
					fixRateChargeIds		= (configuration.fixRateChargeIds).split(",");
					chargesToApplyArticleWiseRateOnWeightType = (configuration.ChargesToApplyArticleWiseRateOnWeightType).split(",");
					defaultDeliveryAt		= configuration.DefaultDeliveryAt;
					defaultSTPaidBy			= configuration.DefaultSTPaidBy;
					defaultPaymentType		= configuration.DefaultPaymentType;
					defaultServiceType		= configuration.defaultServiceType;
					setPartyOnGSTNChange 	= configuration.setPartyOnGSTNChange;
					
					minimumQuantityAmount	= parseInt(configuration.MinimumQuantityAmount);
					quantityAmountCharges   = (configuration.QuantityAmountCharges).split(",");
					MinQtyAmtTobeAssigned	= parseInt(configuration.MinQtyAmtTobeAssigned);

					isAutoSequenceCounter					= jsondata.isAutoSequenceCounter;
					strDate 								= jsondata.strDate;
					defaultActualWeight						= configuration.DefaultActualWeight;
					applyDiscountThroughMaster				= configuration.applyDiscountThroughMaster;
					servicePermission						= jsondata.servicePermission;
					tdsChargeInPercent						= jsondata.TDSChargeInPercent;
					isAllowToEnterIDProof					= jsondata.idProofEntryALlow;
					maxFileSizeToAllow						= jsondata.maxFileSizeToAllow;
					idProofConstantArr						= jsondata.idProofConstantArr;
					IDProofConstant							= jsondata.IDProofConstant;
					isPaidBookingPermission					= jsondata.isPaidBookingPermission;
					isTopayBookingPermission				= jsondata.isTopayBookingPermission;
					isTbbBookingPermission					= jsondata.isTbbBookingPermission;
					isFocBookingPermission					= jsondata.isFocBookingPermission;
					BusinessFunctionConstants				= jsondata.BusinessFunctionConstants;
					ContainerDetails						= jsondata.ContainerDetails;
					chargeIdsForCCAttachedArr				= jsondata.chargeIdsForCCAttached;
					articleTypeForGroup						= jsondata.articleTypeForGroup;
					branchWisePrepaidAmount					= jsondata.branchWisePrepaidAmount;
					taxTypeHm								= jsondata.taxTypeHm;
					LRTypeChargeIdHMToShowCharge			= jsondata.LRTypeChargeIdHMToShowCharge;
					slabWeightList							= jsondata.slabWeightList;
					valuationChargeList						= jsondata.valuationChargeList;
					consignorNameAutocomplete				= configuration.ConsignorNameAutocomplete == 'true';
					consignmentGoodsListForParty			= jsondata.consignmentGoodsListForParty;
					validateEwaybillNumberThroughApi		= configuration.validateEwaybillNumberByApi == "true" || configuration.validateEwaybillNumberByApi == true;
					isGenerateQRCodePhonePeForUPIAllow		= jsondata.isGenerateQRCodePhonePeForUPIAllow;
					generateAndValidateQROnUPIRechargePermission = jsondata.GenerateAndValidateQROnUPIRechargePermission;
					groupWiseCompanyNameHm					= jsondata.groupWiseCompanyNameHm;
					allowToCheckSameCompanyGstnOnEwayBill	= configuration.allowToCheckSameCompanyGstnOnEwayBill == "true" || configuration.allowToCheckSameCompanyGstnOnEwayBill == true;
					upiRechargeMessage						= configuration.upiRechargeMessage;	
					deductPercentAmount						= jsondata.deductPercentAmount;	
					isDeductCharges							= jsondata.isDeductCharges;
					packingTypesNameHM						= jsondata.packingTypesNameHM;
					allowToSendQROnWhatsapp					= jsondata.allowToSendQROnWhatsapp;
					allowStandardCustomFlowPhonePe			=  jsondata.allowStandardCustomFlowPhonePe;
					
					if(jsondata.taxes != undefined && jsondata.taxes.length > 0){
						defaultTaxValue 						= jsondata.taxes[2].taxAmount;
					}
										
					if(configuration.gstnNumber == 'true' && isValueExistInArray(groupListForGSTN, accountGroupId))
						configuration.gstnNumber = 'false';
						
					if (servicePermission.isPhotoTxnService) {
						$('#photservices').removeClass('hide');
						$('#gcrPhotoCapture').removeClass('hide');
						startWebCam('picVideo', 'pictureCanvas', 'takePicture');
					} else {
						$('#gcrPhotoCapture').switchClass('hide','show');
						stopWebCam();
						clearCanvas('pictureCanvas');
					}
					
					if (servicePermission.isSignatureTxnService) {
						$('#gcrSignature').switchClass('show','hide');
						$('#photservices').removeClass('hide');
						loadDrawCanvas('signaturepad');
					} else {
						$('#gcrSignature').switchClass('hide','show');
						clearCanvas('signaturepad');
					}
					
					if((servicePermission.isPhotoTxnService || servicePermission.isSignatureTxnService) && navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
						showUpperSignLayer('Click'+' <i class="glyphicon glyphicon-facetime-video"></i>'+' to Grant Permission to access Webcam');
					
					if(configuration.groupWiseRateFileAllowed == 'true')
						loadJS('/ivcargo/resources/js/module/createWayBill/Rate_' + accountGroupId + '.js?v=10.0');
					else
						loadJS('/ivcargo/resources/js/module/createWayBill/Rate.js?v=10.0');
					
					if(configuration.calculateDestBranchToDoorDlyDistance == 'true'){
						loadJS('https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=AIzaSyCV4q95ixtS8JfJkuxlKLio2P6yzdugZ_c');
					}		

					if(configuration.isSequenceRangeCheckOnAutoLRBooking == 'true' || configuration.branchCodeAndAlphaSeparatorWiseSequence == 'true')
						SequenceCounter 	= jsondata.SequenceCounter;
					
					if(configuration.AllowAjaxCheckOnDestinationBranchSelect)
						allowAjaxCheckOnDestinationBranchSelect = configuration.AllowAjaxCheckOnDestinationBranchSelect; 
					
					if(configuration.ShowCityAndDestinationBranch)
						showCityAndDestinationBranch = configuration.ShowCityAndDestinationBranch; 
					
					if(jsondata.isBookingDiscountAllow)
						isBookingDiscountAllow = true;
					
					if(jsondata.isBookingDiscountPercentageAllow)
						isBookingDiscountPercentageAllow = true;

					if(configuration.disableHamliChargeOnTopay)
						disableHamliChargeOnTopay		= configuration.disableHamliChargeOnTopay;

					if(configuration.isNextPreviousNavigationAllow)
						isNextPreviousNavigationAllow	= configuration.isNextPreviousNavigationAllow;
					
					if (configuration.branchWisePaymentTypeSelectionInBooking == 'true') {
						var branchIdArr = (configuration.branchIdsForPaymentTypeSelectionInBooking).split(',');
								
						if (isValueExistInArray(branchIdArr, branchId)) {
							configuration.PaymentType = 'true';
							configuration.addSelectOptionInPaymentType = 'true';
							defaultPaymentType	= 0;
						}
					}
					
					if(configuration.showRegionWiseMovementType == 'true') {
						let regionIdsForMovment = (configuration.sourceRegionForMovementType).split(',');
						
						showRegionWiseMovementType	= isValueExistInArray(regionIdsForMovment, loggedInBranch.regionId);
					}
					
					if(configuration.showBranchCodeWiseTokenLrNumberInManualLRField == 'true')
						configuration.clearTxtFeildIfNotNumeric = 'false';
					
					if (configuration.SaidToContain == 'false') {
						configuration.SaidToContainValidate = 'false';
						configuration.validateSaidToContainOnDeclaredValue = 'false';
						configuration.SaidToContainAutoSave = 'false';
					}

					//Please include createColumnForDataPanel.js file
					if(createColumnForDataPanel(configuration) && checkPermissionToBookLr()) {

						//Please include loadCreateWayBillPage.js file
						loadCreateWayBillPage(configuration); 

						var loadelement 	= new Array();
						
						if (configuration.documentTypeSelection == 'true') {loadelement.push(loadDocumentType);}
						if (configuration.paidPartialPaymentOnBooking == 'true') {loadelement.push(partialPaymentModal);}
						if (configuration.showViewAllConsignmentGoodsLink == 'true') {loadelement.push(viewAllConsignmentGoodsModal);}
						if (jsondata.SHOW_BILL_SELECTION){loadelement.push(loadBillSelectionAtBooking);}
						if (configuration.showTransportationMode == 'true') {loadelement.push(loadTransportationMode);}
						if (configuration.showTransportationCategory == 'true') {loadelement.push(loadTransportationCategory);}
						
						if (configuration.BookingType == 'true') {
							if(configuration.allowFullLoadBookingOnly == 'true') {
								if(jsondata.ALLOW_FULL_LOAD_BOOKING_ONLY)
									loadelement.push(loadBookingType);
							} else
								loadelement.push(loadBookingType);
						}

						if(configuration.showDivisionSelection == 'true') loadelement.push(loadDivisionSelection);

						if(configuration.regionWiseSourceBranchWork == 'true' 
								&& configuration.sourceBranchAuto == 'true' && configuration.sourceBranch == 'true') {
							var regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
						
							if(isValueExistInArray(regionIdsArr, executive.regionId))
								loadelement.push(loadSourceBranch);
						}
						
						if (configuration.LRNumberManual == 'true' && !isAutoSequenceCounter) {loadelement.push(loadLRNumberManual);}
						if (configuration.OTLrNumber == 'true') {loadelement.push(loadOTLRNumber);}
						if (configuration.BranchCode == 'true' && !isAutoSequenceCounter) {loadelement.push(loadLRNumberManual);}
					
						if (configuration.showExtraSingleEwaybillField == 'true') {
							if(configuration.showExtraSingleEwaybillFieldBranchWise == 'true' ) {
								var	branchIds 	= configuration.branchIdsToShowExtraSingleEwaybillField.split(',');
								
								if(isValueExistInArray(branchIds, executive.branchId)){
									showEwayBillPopupOnLoad	= false;
									loadelement.push(loadSingleEwayBillNumber);
								}
							} else
								loadelement.push(loadSingleEwayBillNumber);
						}
						
						if (configuration.showSubRegionwiseDestinationBranchField == 'true') {loadelement.push(loadSubregionDestination);}
						if (configuration.DeliveryDestination == 'true') {loadelement.push(loadDestination);}
						if (showRegionWiseMovementType) loadelement.push(loadMovementTypeFeild);
						if (configuration.billingBranch == 'true'){loadelement.push(loadBillingBranch);}
						if (configuration.PickupType == 'true') {loadelement.push(loadPickUp);}
						if (configuration.FrightuptoDestination == 'true') {loadelement.push(loadFrightUpTo);}
						if (configuration.VehicleNumber == 'true' || configuration.vehicleNumberAfterBookingType == 'true') {loadelement.push(loadVehicleNumber);}
						if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') {loadelement.push(loadVehicleType);}
						if (configuration.FutureDate == 'true') {loadelement.push(loadFutureDate);}
						if (configuration.ShowBillSelectionText == 'true') {loadelement.push(billSelectionText);}
						if (configuration.Consignor == 'true') {loadelement.push(loadConsignor);}
						if (configuration.Consignee == 'true') {loadelement.push(loadConsignee);}
						if (configuration.AddArticle == 'true') {loadelement.push(loadAddArticle);}
						if (configuration.WaightAndAmount == 'true') {loadelement.push(loadWeightAndAmount);}
						if (configuration.STPaidBy == 'true') {loadelement.push(loadSTPaidBy);}
						if (configuration.InvoiceNo == 'true') {loadelement.push(loadInvoiceNo);}
						if (configuration.showInvoiceDate == 'true') {loadelement.push(loadInvoiceDate);}
						if (configuration.cargoType == 'true') {loadelement.push(loadCargoType);}
						if (configuration.DeclaredValue == 'true') {loadelement.push(loadDeclaredValue);}
						if (configuration.PercentageRiskCover == 'true' || configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {loadelement.push(loadPercentageRiskCover);}
						if (configuration.DeliveryAt == 'true' || configuration.deliveryAtAfterBookingType == 'true') {loadelement.push(loadDeliveryTo);}
						if (configuration.Remark == 'true') {loadelement.push(loadRemark);}
						if (configuration.additionalRemark == 'true') {loadelement.push(loadAdditionalRemark);}
						if (configuration.PaymentType == 'true') {loadelement.push(loadPaymentType);}
						if (configuration.showTopayAdvance == 'true') {loadelement.push(loadTopayAdvance);}
						if (configuration.ServiceType == 'true'){loadelement.push(loadServiceType);}
						if (configuration.paidPartialPaymentOnBooking == 'true') {loadelement.push(loadPartialPaymentType);}
						if (configuration.showInsurance == 'true') {loadelement.push(loadInsurance);}
						if (configuration.allowedCashOnDelivery == 'true') {loadelement.push(loadCod);}
						if (configuration.taxCalculationBasedOnGSTSelection == 'true') {loadelement.push(loadGstPercentSelection);}
						if (configuration.showSealNumber == 'true') loadelement.push(loadSealNumberFeild);
						if (configuration.showVehiclePoNumber == 'true') loadelement.push(loadVehiclePoNumberFeild);
						if (configuration.showBookingPrintDate == 'true') {loadelement.push(loadBookingPrintDate);}

						/*if (configuration.TotalQuantity == 'true') {
							loadelement.push(loadTotalQuantity);
						}*/

						if (configuration.CollectionPerson == 'true') {loadelement.push(loadSearchCollectionPerson);}
						if (configuration.PaymentTypeCheque == 'true') {loadelement.push(loadChequeDetails);}
						//load element credit card details
						if (configuration.PaymentTypeCreditCard == 'true' || configuration.PaymentTypeDebitCard == 'true') {loadelement.push(loadCreditCardDetails);}
						
						//load element paytm details
						if (configuration.PaymentTypePaytm == 'true') {loadelement.push(loadPaytmDetails);}
						if (configuration.SaveButton == 'true') {loadelement.push(loadSaveButton);}
						if (configuration.WayBillCharges == 'true') {loadelement.push(loadWayBillCharges);}
						if (configuration.PreBookingChargeAmount == 'true') {loadelement.push(loadPreBookingCharges);}
						if (configuration.NewPartyAutoSave == 'true'){loadelement.push(loadAddNewPartyOverlay);}
						if (configuration.SaidToContainOverlay == 'true') {loadelement.push(loadSaidToContainOverlay);}
						if (configuration.CommodityType == 'true') {loadelement.push(loadCommodityType);}
						if (jsondata.allowBranchWiseInsuranceService) {loadelement.push(loadSubCommodityType);}
						if (configuration.WayBillType == 'true') {loadelement.push(loadWayBillType);}
						if (configuration.PrivateMark == 'true' || configuration.showPrivateMarkAsTripId == 'true') {loadelement.push(loadPrivateMark);}
						if (configuration.PrivateMarkBeforeFormType == 'true') {loadelement.push(loadPrivateMark);}
						if (configuration.DeclaredValueBeforeFormType == 'true') {loadelement.push(loadDeclaredValue);}
						if (configuration.isRiskAllocationAllow == 'true') {loadelement.push(loadRiskAllocation);}
						if (configuration.FormsWithMultipleSelection == 'true') {loadelement.push(loadFormTypes);}
						if (configuration.FormsWithSingleSlection == 'true') {loadelement.push(loadSingleFormTypes);							}
						if (configuration.Form403402 == 'true') {loadelement.push(loadForm403402);}
						if (configuration.CTForm == 'true') {loadelement.push(loadFormCTForm);}
						if (configuration.RoadPermitNumber == 'true') {loadelement.push(loadRoadPermitNumber);}
						if (configuration.ExciseInvoice == 'true') {loadelement.push(loadExciseInvocie);}
						if (podConfiguration.isPodRequired && podConfiguration.showPODRequiredFeildAtBooking) {loadelement.push(loadPODRequired);}
						if (configuration.ConsignmentInsured == 'true') {loadelement.push(loadConsignmentInsured);}
						if (configuration.PanNumber == 'true' || tdsConfiguration.IsPANNumberRequired) {loadelement.push(loadPanNumber);}
						if (configuration.TanNumber == 'true' || tdsConfiguration.IsTANNumberRequired) {loadelement.push(loadTanNumber);}
						if (GeneralConfiguration.BankPaymentOperationRequired == 'true') {loadelement.push(loadBankPaymentOptions);}
						if (configuration.showPaymentRequiredFeild == 'true') {loadelement.push(loadPaymentRequiredFeild);}
						if (configuration.showSmsRequiredFeild == 'true') {loadelement.push(loadSmsRequiredFeild);}
						if (configuration.isShowSingleEwayBillNumberField == 'false') {loadelement.push(addMutipleEwayBillNumber);}
						if (configuration.validateNextLRNumberOnLogin == 'true') {loadelement.push(loadAddNextNumberOfLR);}
						if (configuration.showFocApprovedBy == 'true' || configuration.showFocApprovedBy == true) {loadelement.push(loadDirectorList);}
						if (configuration.showCategoryType == 'true') {loadelement.push(loadCategoryFeild);}
						if (configuration.showGstType == 'true' || configuration.showGstType == true) {loadelement.push(loadGSTTypeFeild);}
						if (configuration.showBookedBy == 'true' || configuration.showBookedBy == 'true') {loadelement.push(loadBookedBy);}
						if (configuration.showBranchServiceType == 'true' || configuration.showBranchServiceType == true ||
							configuration.showBranchServiceTypeAfterBookingType == 'true' || configuration.showBranchServiceTypeAfterBookingType == true) {loadelement.push(loadServiceTypeFeild);}
						if (configuration.showExcludeCommissionOption == 'true' && loggedInBranch.agentBranch) {
							loadelement.push(loadExcludeCommissionOption);
						} else {$( "#excludeCommissionPanel" ).hide();}

						if ( (configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
								&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true')) {loadelement.push(loadChequeBounce);}
							
						if(configuration.showApprovalType == 'true') loadelement.push(loadApprovalTypeFeild);
						if(configuration.showForwardType == 'true') loadelement.push(loadForwardTypeFeild);
						if(configuration.showHsnCodeSelection == 'true') loadelement.push(loadHsnCodeFeild);
						if(configuration.showInsurancePolicyNumber == 'true') loadelement.push(loadInsurancePolicyNoFeild);
						if(configuration.showTemperatureSelection == 'true') loadelement.push(loadTemperatureFeild);
						if(configuration.showDeclarationSelection == 'true') loadelement.push(loadDeclarationFeild);
						if(configuration.showDataLoggerNumber == 'true') loadelement.push(loadDataLoggerNoFeild);
						if(configuration.showConnectivityFeild == 'true') loadelement.push(loadConnectivityFeild);
						if(configuration.showRecoveryBranchForShortCredit == 'true') {loadelement.push(loadRecoveryBranch);}
						if(configuration.sendBookingTimeOTP == 'true') loadelement.push(loadBookingTimeOtpFeild);

						// when apply load all ajax requests and done is call back function
						$.when.apply($, loadelement).done(function() {
							if(typeof createVideoLink != 'undefined') createVideoLink(data);
							
							if(configuration.showBillSelectionInAutoBooking == 'true' && jsondata.SHOW_BILL_SELECTION)
								setBillSelection();
							
							if (configuration.isRiskAllocationAllow == 'true') {setRiskAllocation();}
							if (configuration.BookingType == 'true') {setBookingType();}

							if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') setVehicleType();
							if (configuration.VehicleTypeWithConstantValue == 'true') VehicleTypeWithConstantValue();
							if (configuration.FutureDate == 'true') setFutureDate(); 
							if (configuration.showBookingPrintDate == 'true') setBookingPrintDate();

							if (configuration.AddArticle == 'true') {
								configureAddArticle(executive);
								setChargeType();
								setPackingType();
							}
							
							if(configuration.validateNextLRNumberOnLogin == 'true')
								showPopupForNextLRNumber();
							
							if (configuration.STPaidBy == 'true') setSTPaidBy();
							if (configuration.PaymentType == 'true') setPaymentType('paymentType');
							if (configuration.PickupType == 'true') setPickupType();
							if (configuration.ServiceType == 'true') setServiceType();
							if (configuration.wayBillChargeWiseRemarkNeeded == 'true') setChargeWiseRemarkPanel(); // file waybillsetreset
							if (configuration.PreBookingChargeAmount == 'true') setPreBookingCharges();

							if (configuration.WayBillCharges == 'true') {
								changeGstRatesOnTransportMode();
								
								if(configuration.DefaultWayBillType == 'F7')
									setBookingCharges(WAYBILL_TYPE_PAID);
								else if(configuration.DefaultWayBillType == 'F8')
									setBookingCharges(WAYBILL_TYPE_TO_PAY);
								else if(configuration.DefaultWayBillType == 'F9')
									setBookingCharges(WAYBILL_TYPE_CREDIT);
								else if(configuration.DefaultWayBillType == 'F10')
									setBookingCharges(WAYBILL_TYPE_FOC);
							}

							if (configuration.DeliveryAt == 'true' || configuration.deliveryAtAfterBookingType == 'true') setDeliveryTo();
							
							if (configuration.cargoType == 'true') {
								if(Number($('#bookingType').val()) == BookingTypeConstant.BOOKING_TYPE_FTL_ID)
									$('#cargoTypePanel').removeClass('hide');
								else
									$('#cargoTypePanel').addClass('hide');
							}
							
							if(jsondata.allowToAddMultipleInvoiceDetail)
								bindEventOnMultipleInvoiceDetails();
						
							if (configuration.showCheckBoxToCalulateValuationChrgOnDeclareValue != 'true' && configuration.checkboxToApplyRiskCoverageOnDeclareValue == 'false'){
								$("#declaredValueCheckBox").addClass("hide");
								$("#declaredValueCheckBoxlbl").addClass("hide");
								$("#declaredValueCheckBox").hide();
							}
							
							if (configuration.FormsWithMultipleSelection == 'true' 
								|| configuration.FormsWithSingleSlection == 'true'
								|| configuration.CTForm == 'true' 
								|| configuration.Form403402 == 'true') {
								setFormTypes();
								bindEventOnFormNumber();
							}
								
							if (configuration.CommodityType == 'true') setCommodityType();
							if (jsondata.allowBranchWiseInsuranceService) setSubCommodityType();
							if (configuration.paidPartialPaymentOnBooking == 'true') setPartialPaymentTypeOption();
							
							if(tdsConfiguration.IsTdsAllow) {
								$('#isTdsRequired').show();
								setTDSChargeInPercent();
							} else {
								$('#isTdsRequired').remove();
								$('#tdspercentcol').remove();
							}
							
							if(configuration.documentTypeSelection == 'true') {
								setArticleType();
								
								$( "#natureOfArticle" ).change(function() {
									resetArticleWithTable();
								});	
								
								$( "#natureOfArticle" ).keyup(function() {
									resetArticleWithTable();
								});
							}
							
							$( "#actualWeight" ).blur(function() {
								changeChargeTypeToWeightOnAboveFixedActualWeight();
								calculateChargedWeight(this);
								getChargeWeightToAppend();
								checkRoundOffChargeWeightDB();
								if(configuration.allowChargeWeightFromSlabWeight == 'true') calculateChargedWeightFromSlabWeight();
								hideInfo();
								clearIfNotNumeric(this,'0');
								getWeightTypeRates();
								if(typeof getFixedHamaliSlabRates != 'undefined') getFixedHamaliSlabRates();
								if(typeof getFixTypeRates != 'undefined') getFixTypeRates();
								if(typeof validateArticleAmountWithWeight != 'undefined') validateArticleAmountWithWeight();
								checkPackingTypeAllowedOnWeight();
								calulateTotalConsigmentWeight();
								if(isBranchCommissionOnWeight) validateWeightField($(this),'Actual Weight');
							});
							
							$("#chargedWeight").blur(function() {
								editChargedWeight(this);
								getWeightTypeRates();
								if(typeof getFixedHamaliSlabRates != 'undefined') getFixedHamaliSlabRates();
								if(typeof getFixTypeRates != 'undefined') getFixTypeRates();
								hideInfo();
								clearIfNotNumeric(this,'0');
								if(typeof validateArticleAmountWithWeight != 'undefined') validateArticleAmountWithWeight();
								if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
								calulateTotalConsigmentWeight();
								calculateWeigthRate();
								//checkChargedWt();
							});
							
							$( "#chargedWeight" ).keyup(function() {
								getWeightTypeRates();
								if(typeof getFixedHamaliSlabRates != 'undefined') getFixedHamaliSlabRates();
								if(typeof validateArticleAmountWithWeight != 'undefined') validateArticleAmountWithWeight();
								if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
								focusOnInVoiceNumberForTokenBooking();
							});
							
							$( "#cftAmount" ).blur(function() {
								if(typeof getCFTWiseRate != 'undefined') getCFTWiseRate();
							});
							
							$( "#cbmAmount" ).blur(function() {
								if(typeof getCBMWiseRate != 'undefined') getCBMWiseRate();
							});
							
							bindEventOnBookingType();
							bindEventOnDestination();

							if(configuration.showSubRegionwiseDestinationBranchField == 'true' && configuration.DeliveryDestinationDropdown == 'true') {
								bindEventOnSubRegion();
								bindEventOnDestBranchEle();
							}	
							
							bindEventOnLRNumberManual();
							
							$( "#fixAmount" ).blur(function() {
								if(typeof getFixAmountNotChange != 'undefined') getFixAmountNotChange();
							});
							
							if (configuration.SaveButton == 'true') {
								$('#save').mouseup(function() {
									onSaveWayBill();
								}).keydown(function(event) {
									if(getKeyCode(event) == 13) {
										onSaveWayBill();
									}
								});
							}
							
							validatePhonePayTransaction 	= jsondata.validatePhonePeTxn;
							allowDynamicPhonepeQR		 	= jsondata.allowDynamicPhonepeQRBooking;
							allowTransactionDateAndTimePhonePe	 	= jsondata.allowTransactionDateAndTimePhonePe;

							if(isBookingDiscountAllow)
								setDiscountType();
							else if(jsondata.DiscountMaster == undefined || jsondata.DiscountMaster == 'undefined')
								$('#discountPanel').remove();

							if(!isBookingDiscountPercentageAllow)
								$('#discountPercentageRow').remove();
							else {
								$('#isDiscountPercentDiv').remove();
								$('#rowdiscountTypes').remove();
							}
							
							if((configuration.applyDiscountThroughMaster  == 'true' || configuration.applyDiscountThroughMaster  == true) && jsondata.DiscountMaster != undefined){
								setDiscountType();
								setDefaultDiscountType();
							}
							
							if (configuration.OwnBranchLocationsRequired == 'true')
								isOwnBranchLocationsRequired = true;

							if(configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true')
								bindEventOnDeclaredValue();
							
							if (configuration.DeliveryAt == 'true')
								bindEventOnDeliveryTo();
								
							if (configuration.validatePickupType == 'true') {
								$("#PickupType").blur(function() {
									hideInfo(); validatePickupType();
								});
							}
							if(jsondata.AGENT_COMMISSION)
								displayCommissionFeild();
							
							if(data.allowRechargeRequestAtBookingPage)
								$('#rcgRequest').show();
							
							if (configuration.ExciseInvoice == 'true') setExciseInvoice();
							if (configuration.ConsignmentInsured == 'true') setConsignmentInsured();
							if (configuration.showTransportationMode == 'true') setTransportationMode();
							if (configuration.showTaxType == 'true') setTaxType();
							if (configuration.businessTypeSelection == 'true') setBusinessType(); else $('#businessType').remove();
							if (configuration.cftUnitSelection == 'true') setCFTUnitSelection(); else $('#cftSelectionSpan').remove();
							if (jsondata.allowToAddMultipleInvoiceDetail) {loadelement.push(loadMultipleInvoiceDetails);}
							if (configuration.packageConditionSelection == 'true') setPackageCondition(); else $('#packageCondition').remove();

							if(jsondata.allowBranchWiseInsuranceService) { 
								configuration.Pincode			= 'true';
								configuration.InvoiceNo 		= 'true';
								configuration.showInvoiceDate	= 'true';
								configuration.DeclaredValue		= 'true';
							}
							
							configurePartyInfo();
							readCustomAmountCalculationProperty();//for kcpl
							
							//Calling From Consignment.js
							configureWeightAndAmount();
							setPage();
							setWayBillNumber(jsondata);
							
							setDefaultDestinationBranch(); // Calling From WayBillSetReset.js file
							disableChargesForAgentBranches();
							disableChargesForDoorPickUpCharge();
							checkForPartyAutoFill();
							resetBookingPageByRegionId();
							
							if(configuration.AllowEnableDoorDelivery == 'true')
								$('#charge' + configuration.doorDeliveryChargeId).prop("readonly", "true");
							
							if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
								$('#charge' + ChargeTypeMaster.CR_INSUR_BOOKING).prop("readonly", "true");
							
							if (configuration.multipleRemarkField == 'true') {
								//Calling From CommonFunctions.js
								setMultiSelectRemark();
							}

							if(configuration.bookingScreenBackgroundColorAllow == 'true'){
								$("td").css('background', configuration.bookingScreenBackgroundColor);
								$("#DisplayWayBillType").css('background','#0073BA');
							}
							
							setGoodsClassification();
							
							validateRateFromRateMasterForLR = configuration.validateRateFromRateMasterForLR == 'true' || configuration.validateRateFromRateMasterForLR == true;
							validateRateFromRateMasterForLRWithoutDisableFields = configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true;
								
							hideLayer();
							
							//Calling from elementfocusnavigation.js file
							initialiseFocus();
							setFocusForNewLR();
							
							if(isNextPreviousNavigationAllow == 'true')
								setNextPreviousNavigationForElements(items);
							
							bindEventsOnDifferentFeilds();
							eventOnCFTAmount();
							eventOnCBMAmount();
							eventOnCFTFreightRate();
							eventOnCBMFreightRate();
							
							if(configuration.showFocApprovedBy == 'true' || configuration.showFocApprovedBy == true)
								setDirectorList();
							
							if(consignmentGoods != undefined)
								setDefaultSaidToContain(consignmentGoods);
							
							if(packingTypeGoods != undefined)
								setDefaultPackingType(packingTypeGoods);
							
							if (usedDummyLRFlag)
								$('#save').prop('disabled', true);
							
							disableCategoryType();
							
							if (configuration.branchAbbrevationWiseWayBillNumberGenerationAllow == 'true' || configuration.branchAbbrevationWiseWayBillNumberGenerationAllow == true) {
								if(loggedInBranch.abbrevationName == undefined || loggedInBranch.abbrevationName == 'undefined') {
									showMessage('error', iconForErrMsg + 'Source Branch Abbrevation Not Found ! Please Update Source Branch Abbrevation First To Create LR ! ! ! ');
								}
							}
							
							setEwaybillNumberAutomatically();
							
							if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING) {
								$('.addUpdateConsigneePartyGstnModal').removeClass('hide');

								if ($('#wayBillType').val() != WAYBILL_TYPE_CREDIT)
									switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
							} else {
								switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'hide', 'show');
								$('.addUpdateConsigneePartyGstnModal').remove();
							}
							
							if (!isAllowToEnterIDProof) {
								$('.openIdProofModel').remove();
								$('.openAddedIDProofModal').remove();
							} else {
								$('.openIdProofModel').removeClass('hide');
								$('.openAddedIDProofModal').removeClass('hide');
							}
							
							disablePODStatus();						
							if(configuration.billSelectionWiseRangeIncrement == 'false'){
								if(configuration.showBranchCodeWiseNextLRNumberInManualLrField == 'true' || configuration.showBranchCodeWiseNextLRNumberInManualLrField == true)
									$('#lrNumberManual').val(jsondata.NextWaybillNumberBranchCode + configuration.waybillNumberSeperator + jsondata.NextWaybillNumber);
								else if (configuration.showNextLRNumberInManualLrField == 'true' || configuration.showNextLRNumberInManualLrField == true)
									$('#lrNumberManual').val(Number(jsondata.waybillNumber) + 1);
							}

							setCustomeLebelForBookingPage(configuration);
							removeStarFromInvoiceAndDeclaredValue();
							addAsteriskStarForMandatoryFields();
							
							if(configuration.sendBookingTimeOTP == 'true') sendOTP();
							
							$("#totalAmountLabel").text(configuration.totalAmountLabel);				
							if(configuration.taxCalculationBasedOnGSTSelection == 'true') setGSTPerSelection();
							
							if(configuration.InvoiceNo == 'true' && configuration.uploadInvoiceDocuments == 'true') {
								$('#uploadInvoiceDocument').removeClass('hide');
								
								$('#submitInvoice').on('click', function() {
									submitInvoice();
								});
								
								uploadInvoiceDocument(configuration.noOfFileToUpload, uploadPdfDetailsList, configuration.maxSizeOfFileToUpload);
							}
							
							bindEventOnDeclaredValueCheckBox();
							showCheckboxToCalculateInsuranceOnDeclareValue();
						}).fail(function() {
							console.log("Some error occured");
						});
					}
					
					if(configuration.showCFTWeightFeild == "true") {
						if($('#volumetric') != null && $('#volumetric').is(':checked'))
							$("#cftWeightDiv").removeClass("hide");
						else
							$("#cftWeightDiv").addClass("hide");
					}
				}
			});
	//return false;
}

/*
 * create panels for formas private marks etc. according to configuration for line adjustment.
 * 5 panel for each line
 */

function bindFocusOnAddButton(){
	
	if(configuration.VolumetricRate == 'true') {
		 validateCFTFeildOnAdd							 = true;
		 validateCFTFeildOnSave							 = false;
	}
	
	if (configuration.FocusOnQuantityAfterAddArticle == 'true') {
		$("#add").keyup(function (){
			setFocusOnQuantityAfterAddArticle(this);
		});	
		$("#quantity").keyup(function (){
			setFocusOnQuantityAfterAddArticle(this);
		});
	}
	
	if(configuration.setFocusOnQuantityAfterLBHHeight == 'true') {
		$("#add").keyup(function (){
			setFocusOnQuantityAfterLBHHeight(this);
		});
	}
}

function setFocusOnPrivateMarkAfterActualWeight(ele) {
	next = 'privateMark';
}

function bindFocusOnLastCharge(){
	if (configuration.paidPartialPaymentOnBooking == 'true') {
		$("#"+$("#charges tr:last input")[0].id).keyup(function (){
			var paymentType = $('#paymentType').val();
			if(Number(paymentType) == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID){
				setFocusOnPartialPayment(this);
			}
		});	
		$("#partialPaymentType").keyup(function (){
			setFocusOnPartialPayment(this);
		});	
		$("#receivedAmtEle").keyup(function (){
			setFocusOnPartialPayment(this);
		});
		$("#paymentMode").keyup(function (){
			setFocusOnPartialPayment(this);
		});
		$("#saveBtn").click(function (){
			setFocusOnPartialPayment(this);
		});	
	}
}

//set create way bill page on load
function setPage() {
	setAutoCompleters();
	if(typeof jsondata.shortcutParam == undefined) {
		jsondata.shortcutParam	= null;
	}

	changeWayBillType(jsondata.shortcutParam == null ? configuration.DefaultWayBillType : jsondata.shortcutParam, true);
	setDefaultParty(jsondata.shortcutParam == null ? configuration.DefaultWayBillType : jsondata.shortcutParam);
	
	if ($('#chequeDate').exists()) {
		$('#chequeDate').val(date(new Date(),"-"));
		$('#chequeDate').datepicker({
			dateFormat: 'dd-mm-yy'
		});
	}

	if(typeof setDefaultChargeType != 'undefined') {
		setDefaultChargeType(); //Cretaed in WayBillSetReset.js
	}

	//Calling from WayBillSetReset.js
	setWayBillBookingType();

	$('input:text').css("text-transform","uppercase");
	$('input:text').prop("autocomplete","on");
	$("input:text").focus(function() { $(this).select(); } );
	$('input').keypress(function(event) {if(event.altKey == 1){return false;} } );
	$('select').keypress(function(event) {if(event.altKey == 1){return false;} } );
	$('button').keypress(function(event) {if(event.altKey == 1){return false;} } );
	setWeight();
	setLoggedBranchInSourceBranch();
	hideShowRecoveryBranch();
}

function changeWayBillType(keys, isReload) {
 
	if(!validateTokenLRType(keys)) return false;

	var displayWbType						= document.getElementById('DisplayWayBillType');
	var lrType								= document.getElementById('lrType');
	var currentWayBillTypeId				= $('#wayBillType').val();
	var value								= 'PAID';
	isInsuranceServiceAllow				= false;
	
	if (configuration.showToPayAdvanceField == 'true' && configuration.removeTopayAdvanceFieldFromChargesTable == 'true') {
		if ($("#topayAdvancePanel").length > 0) {
			if (keys == 'F8') {
				$("#topayAdvancePanel").show();
			} else {
				$("#topayAdvancePanel").hide();
			}
		}
	}

	if (configuration.isInvoiceCreationCheckedByDefault == true || configuration.isInvoiceCreationCheckedByDefault == 'true')
		$('#createInvoice').prop("checked", true);
	else if(configuration.isInvoiceCreationCheckedAndDisabled == true || configuration.isInvoiceCreationCheckedAndDisabled == 'true')
		$('#createInvoice').prop("checked", true).prop("disabled", true);
	else
		$('#createInvoice').prop("checked", false);
		
	switchHtmlTagClass('gstSelectionDiv', 'hide', 'show');

	if(currentWayBillTypeId == WAYBILL_TYPE_CREDIT)
		resetElements();

	if(configuration.showBillSelectionInAutoBooking == 'true') {
		setBillSelection();
	
		if(jsondata.withoutBillWIthoutPopup != undefined && jsondata.withoutBillWIthoutPopup)
			setWithoutBillOption();
		else
			ShowBillSelectionDialog();
		
		hideShowGstOnEstimateLR();
	}
	
	createDeliveryToOption();
	swapConsignorConsigneeGstnPanel();

	if(keys == 'F7') {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_PAID);
		
		value = 'PAID';
		displayWbType.className = 'paidWayBill';
		disableDiv('leftTD', false);
		setValueToContent('wayBillType', 'formField', WAYBILL_TYPE_PAID);
		switchHtmlTagClass('paymentTypeDiv', 'show', 'hide');
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		setDefaultSTPaidBy(WAYBILL_TYPE_PAID);
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_PAID);
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		
		if(configuration.showInvoiceCreationCheckBox == 'true')
			switchHtmlTagClass('createInvoicePanel', 'show', 'hide');

		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');

		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		if(typeof reCalculateRates != 'undefined' && $('#destinationBranchId').val() > 0)
			reCalculateRates($('#destinationBranchId').val(), $('#partyMasterId').val());
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_PAID);
		
		setDefaultPodRequired(WAYBILL_TYPE_PAID);
		
		if(configuration.seperateSequenceRequiredForTbbParty == 'true') {
			switchHtmlTagClass('lrNumberManual', 'hide', 'show');
			setWayBillNumber(jsondata);
		}
		
		if(configuration.BookingTypeWiseSequenceCounter == 'true')
			setWayBillNumber(jsondata);
		
		$("#DisplayWayBillType").css('background','#0073BA');
		$('#isTdsRequired').show();
		
		if(configuration.showEwaybillPopUpOnLoad  == 'true') {
			if(showEwayBillPopupOnLoad)
				addMultipleEwayBillNo();
			
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true'
			|| configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
			checkWayBillTypeWiseLRSequence(undefined);

		if(configuration.differentRangeIncrementSequenceForTopayLR == 'true')
			setNextLrNumberLrTypeWise();

		changeSTPaidByForPartyExemptedOnLRType($('#cnorExempted_' + $('#partyMasterId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForPaid == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');

		if(configuration.isAllowPaymentTypeInToPay == 'true')
			setPaymentType('paymentType');
				
		isInsuranceServiceAllow	= isLrTypeWiseInsuranceService(WAYBILL_TYPE_PAID);
	} else if(keys == 'F8') {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_TO_PAY);
	
		value = 'TO PAY';
		displayWbType.className = 'toPayWayBill';
		disableDiv('leftTD', configuration.doNotAllowToBookTopayLRWithAmount == 'true');
		setValueToContent('wayBillType', 'formField', WAYBILL_TYPE_TO_PAY);
		setDefaultSTPaidBy(WAYBILL_TYPE_TO_PAY);
		hidePaymentTypeandDetails();  //defined in WayBillSetReset.js
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_TO_PAY);
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		$('#panNumber').val('');
		
		if(configuration.isAllowPaymentTypeInToPay == 'true') {
			switchHtmlTagClass('paymentTypeDiv', 'show', 'hide');
			setPaymentType('paymentType');
		}
		
		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
		
		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		if(typeof reCalculateRates != 'undefined' && $('#destinationBranchId').val() > 0)
			reCalculateRates($('#destinationBranchId').val(), $('#consigneePartyMasterId').val());
		
		setDestinationBranchLimit($('#destinationBranchId').val(),$('#isDestAgentBranch').val());

		$("#agentcommission").attr("disabled",true);
		switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
		switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
		switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_TO_PAY);
		
		setDefaultPodRequired(WAYBILL_TYPE_TO_PAY);
		
		if(configuration.seperateSequenceRequiredForTbbParty == 'true') {
			switchHtmlTagClass('lrNumberManual', 'hide', 'show');
			setWayBillNumber(jsondata);
		}
		
		if(configuration.BookingTypeWiseSequenceCounter == 'true')
			setWayBillNumber(jsondata);
		
		removePassenger();
		removeDoorDelivery();
		$("#DisplayWayBillType").css('background','#E77072');
		$('#isTdsRequired').hide();
		
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			if(showEwayBillPopupOnLoad)
				addMultipleEwayBillNo();
			
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true'
					|| configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
			checkWayBillTypeWiseLRSequence(undefined);

		if(configuration.differentRangeIncrementSequenceForTopayLR == 'true')
			setNextLrNumberLrTypeWise();
			
		changeSTPaidByForPartyExemptedOnLRType($('#cneeExempted_' + $('#consigneePartyMasterId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForTopay == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');
		
		isInsuranceServiceAllow	= isLrTypeWiseInsuranceService(WAYBILL_TYPE_TO_PAY);
	} else if(keys == 'F9') {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_CREDIT);
		
		value = 'TBB';
		displayWbType.className = 'creditWayBill';
		disableDiv('leftTD',false);
		$('#wayBillType').val(WAYBILL_TYPE_CREDIT);
		//setValueToContent('wayBillType', 'formField', WAYBILL_TYPE_CREDIT);
		setDefaultSTPaidBy(WAYBILL_TYPE_CREDIT);
		hidePaymentTypeandDetails();  //defined in WayBillSetReset.js
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');
		$('#panNumber').val('');

		if(configuration.ConsignorBillingPartyName == 'true') {
			switchHtmlTagClass('BillingPartyDetailsConsignor', 'show', 'hide');

			if(configuration.isAllowToShowBillingPartyGSTN == 'true')
				showBillingGstnAfterBillingPartyPanel();
		}
		
		if(configuration.showTransportationCategory == 'true') switchHtmlTagClass('transportationCategoryPanel', 'show', 'hide');
		switchHtmlTagClass('billingbranchpanel', 'show', 'hide');
		setBillingBranch(WAYBILL_TYPE_CREDIT);
		
		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'hide', 'show');
		
		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		$("#agentcommission").attr("disabled",true);
		
		switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
		switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
		switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_CREDIT);
		
		setDefaultPodRequired(WAYBILL_TYPE_CREDIT);
		
		if(configuration.seperateSequenceRequiredForTbbParty == 'true'){
			$('#lrNumberManual').prop('disabled', true);
			switchHtmlTagClass('lrNumberManual', 'show', 'hide');
			setWayBillNumber(jsondata);
		}

		if(configuration.BookingTypeWiseSequenceCounter == 'true')
			setWayBillNumber(jsondata);

		removePassenger();
		removeDoorDelivery();
		disableSpecificChargesOnTBB();
		
		$("#DisplayWayBillType").css('background','#52AEC6');
		$('#isTdsRequired').hide();

		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			if(showEwayBillPopupOnLoad)
				addMultipleEwayBillNo();

			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true')
			setValueToHtmlTag('lrnumber', '');
			
		if(configuration.differentRangeIncrementSequenceForTopayLR == 'true')
			setNextLrNumberLrTypeWise();
		
		if(configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
			checkWayBillTypeWiseLRSequence(undefined);
			
		changeSTPaidByForPartyExemptedOnLRType($('#cnorExempted_' + $('#billingPartyId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForTBB == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');
				
		isInsuranceServiceAllow	= isLrTypeWiseInsuranceService(WAYBILL_TYPE_CREDIT);
	} else if(keys == 'F10') {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_FOC);
		
		value = 'FOC';
		displayWbType.className = 'focWayBill';
		disableDiv('leftTD',true);
		$('#wayBillType').val(WAYBILL_TYPE_FOC);
		setDefaultSTPaidBy(WAYBILL_TYPE_FOC);
		hidePaymentTypeandDetails();  //defined in WayBillSetReset.js
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		$('#panNumber').val('');
		
		$("#fixAmount").prop('disabled', true);
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_FOC);
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');

		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
		
		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		$("#agentcommission").attr("disabled",true);
		
		switchHtmlTagClass('partialPaymentTypeDiv', 'hide', 'show');
		switchHtmlTagClass('receivedAmountlPanel', 'hide', 'show');
		switchHtmlTagClass('balanceAmountPanel', 'hide', 'show');
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_FOC);
		
		setDefaultPodRequired(WAYBILL_TYPE_FOC);
		
		if(configuration.seperateSequenceRequiredForTbbParty == 'true') {
			switchHtmlTagClass('lrNumberManual', 'hide', 'show');
			setWayBillNumber(jsondata);
		}
		
		if(configuration.BookingTypeWiseSequenceCounter == 'true')
			setWayBillNumber(jsondata);
		
		removePassenger();
		removeDoorDelivery();
		
		$("#DisplayWayBillType").css('background','#2CAE54');
		$('#isTdsRequired').hide();
	
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			if(showEwayBillPopupOnLoad)
				addMultipleEwayBillNo();
	
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true'
					|| configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
			checkWayBillTypeWiseLRSequence(undefined);
	}
	
	doNotAllowTBBPartyForConsignorAndConsigneeInPaidAndToPayBooking(isConsignorTBBParty, isConsigneeTBBParty);
	
	if(configuration.autoConvertWaybillTypeToTBBForTBBParty == 'true' && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT) {
		if(isConsignorTBBParty) resetConsignor();
		if(isConsigneeTBBParty) resetConsignee();
	}
	
	if(configuration.differentRangeIncrementSequenceForTopayLR == 'true')
		setNextLrNumberLrTypeWise();
		
	if(configuration.taxCalculationBasedOnGSTSelection == 'true')
		resetGSTTaxes(defaultTaxValue);
	
	if(LRTypeChargeIdHMToShowCharge) {
		for(var key in LRTypeChargeIdHMToShowCharge) {
			var lrTypeList	= LRTypeChargeIdHMToShowCharge[key];
			
			if(isValueExistInArray(lrTypeList, $('#wayBillType').val()))
				showCharge(key);
			else
				hideCharge(key);
		}
	}
	
	if(configuration.showTransportationCategory == 'true') 
		changeGstRatesOnTransportCategory();
	
	if(configuration.isSmsRequiredFeildChecked == 'true' || configuration.isSmsRequiredFeildChecked == true)
		$('#smsRequired').attr('checked',true);
	
	if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
		resetArticleWithTable();
		
	if(typeof getBranchCommission != 'undefined' && configuration.showExcludeCommissionOption == 'true')
		getBranchCommission($('#destinationBranchId').val());
		
	if(typeof getBranchCommission != 'undefined' && configuration.makeWeightMandatoryForBranchCommission == 'true')
		checkBranchCommissionForWeight($('#destinationBranchId').val());
	
	/*
		Setting Prepaid Recharge Amount LR Type Wise
	*/
	setRechargeAmount(Number($('#wayBillType').val()));
	
	if($('#wayBillType').val() != WAYBILL_TYPE_TO_PAY)
		$("#branchBalance").addClass('hide');	
		
	if(configuration.showTaxType == 'true') setTaxTypePartyWise();
	
	if(isTokenWayBill)
		resetDataForTokenBooking();
		
	setDefaultRiskAllocation();
	setDefaultBranchServiceType();
		
	if(configuration.sameSequenceForAllWaybillTypesPerShortCode == 'true')
		setWayBillNumber(jsondata);

	resetCharges();
	resetDataOnWayBillType(keys);
	resetBookingTypeByWayBillType(keys);
	setCompanyWiseTaxes(0);
	checkTopayLRBookingAllow();
	lrType.innerHTML = value;
	$('#cftRate').val("0");
	CFTValue = 0;
	freightRatePartyId = 0;
	showTBBPartyNameInConsignor();
	setDefaultDeliveryToOnWayBillType();
	setTimeout(function(){
		//done for kcpl to set default builty charge
		setBuiltyAndFreightCharge();//WayBillSetReset.js
	}, 100);
	
	if(configuration.lrTypeWiseAmountInDecimal == 'true')
		initialiseFocus();
		
	showDropDownAtWayBillTypeFoc();
	
	if(configuration.consigneeWiseRateApplyInToPayLrs == true || configuration.consigneeWiseRateApplyInToPayLrs == 'true')
		ajaxCallForRates();
	
	if(!isInsuranceServiceAllow)
		$('#subCommodityTypePanel').addClass('hide');
	else
		$('#subCommodityTypePanel').removeClass('hide');
		
	if(configuration.lrTypeWisePartyToPartyConfiguration == 'true' && !singleLrTypeAllowedForPartyToPartyConfig)
		lrTypesValidationForPartyToPartyConfig();
		
	hideShowRecoveryBranch();
	if(configuration.sendBookingTimeOTP == 'true') resetOtpData();
}

function setWayBillNumber(numberInfo) {
	if(configuration.doNotShowManualLRNumberInAutoBooking == 'true'){
		if ($('#lrNumberManual').exists()) {
			switchHtmlTagClass('lrNumberManual', 'hide', 'show');
		}
	}
		
	nextLrNumberSeq    = numberInfo.NextWaybillNumber;
	
	let sequenceNumberFormat = Number(configuration.sequenceNumberFormat);
		
	if(configuration.showNextLRNumberWithDestBranchCode == 'true' 
		|| sequenceNumberFormat == 17 || sequenceNumberFormat == 18)
		return;
	else if(sequenceNumberFormat  == 1 || sequenceNumberFormat == 2 || sequenceNumberFormat == 3
		|| sequenceNumberFormat == 4 || sequenceNumberFormat == 5 || sequenceNumberFormat == 6
		|| sequenceNumberFormat == 7 || sequenceNumberFormat == 8 || sequenceNumberFormat == 9
		|| sequenceNumberFormat == 10 || sequenceNumberFormat == 11 || sequenceNumberFormat == 12
		|| sequenceNumberFormat == 13 || sequenceNumberFormat == 15	|| sequenceNumberFormat == 16
		|| sequenceNumberFormat == 23 || sequenceNumberFormat == 24 || sequenceNumberFormat == 25
	) {
		setValueToHtmlTag('lrnumber', ' Next LR No : '+ numberInfo.NextWaybillNumber);
		return;
	}
	 
	let seperator = configuration.waybillNumberSeperator;
	let branchIdsForBranchWiseSequenceWithoutSepratorArr = configuration.branchIdsForBranchWiseSequenceWithoutSeprator.split(",");
	
	if (isDummyLR) {
		setValueToHtmlTag('lrnumber', ' Next LR No : '+ numberInfo.NextWaybillNumber);
		$("#lrNumberManual").val(numberInfo.NextWaybillNumber);
	} else if(configuration.BookingTypeWiseSequenceCounter == 'false') {
			if (isAutoSequenceCounter) {
				if(configuration.SourceDestinationWiseWayBillNumberGeneratorAllow == 'false') {
					if(numberInfo.NextWaybillNumber != null) {
						if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true') {
							if (configuration.branchCodeAndFinancialYearWiseWayBillNumber == 'true') {
								if (configuration.lrNumberFormatForWithBill == 16) {
									$('#billSelection').on('change', function() {
										setNextWaybillNumber(numberInfo, seperator);
									});
									setNextWaybillNumber(numberInfo, seperator);
								} else
									setNextWaybillNumber(numberInfo, seperator);
							} else if (configuration.MonthWiseWayBillNumberGeneration == 'true') {
								NextWaybillNumber = setAndValidateNextWaybillNumber(numberInfo.NextWaybillNumber, configuration);

								if(configuration.removeSlashFromWayBillNumber == 'true')
									setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumberBranchCode  + strDate  + NextWaybillNumber);
								else
									setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumberBranchCode + '/' + strDate + '/' + NextWaybillNumber);
							} else if(configuration.BranchCodeWiseWaybillNumberWithoutSuffix == 'true')
								setValueToHtmlTag('lrnumber', ' Next LR No : ' + (numberInfo.NextWaybillNumberBranchCode ? numberInfo.NextWaybillNumberBranchCode : '') + '' + numberInfo.NextWaybillNumber);
							else if(configuration.resetSequenceCounterAfterMaxRange == 'true' && numberInfo.NextWaybillNumber  > configuration.maxRangeToResetSequenceCounter)
								setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumberBranchCode + '/' + 1);
							else if(isValueExistInArray(branchIdsForBranchWiseSequenceWithoutSepratorArr, executive.branchId))	
							 	setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumberBranchCode + numberInfo.NextWaybillNumber);
							else if(configuration.generateLRSequenceWithBranchCodeAndLRType == 'true') {
								if($('#wayBillType').val() != WAYBILL_TYPE_CREDIT)
									checkWayBillTypeWiseLRSequence(undefined)
								else
									setValueToHtmlTag('lrnumber', '');
							} else if(configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
								checkWayBillTypeWiseLRSequence(undefined)
							else
								setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumberBranchCode + seperator + numberInfo.NextWaybillNumber);
						} else if(configuration.differentRangeIncrementSequenceForTopayLR == true || configuration.differentRangeIncrementSequenceForTopayLR == 'true')
							setNextLrNumberLrTypeWise();
						else
							setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumber);
						
						if(configuration.sameSequenceForAllWaybillTypesPerShortCode == 'true')
							setNextWaybillNumberShortCode(numberInfo, seperator);
					}
				}
			} else {
				// For Set Next LR number at the Time of Manual LR Entry On Auto LR Booking
				if(configuration.isSequenceRangeCheckOnAutoLRBooking == 'true') {
					if(numberInfo.NextWaybillNumber != null) {
						if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true') {
							if(configuration.showSequenceRangeInAutoBooking == 'true'){
								setSequenceRange();
							 } else {
								setValueToHtmlTag('lrnumber', ' Next LR No : '+ numberInfo.NextWaybillNumberBranchCode + seperator + numberInfo.NextWaybillNumber);
							}
						} else {
							setValueToHtmlTag('lrnumber', ' Next LR No : '+ numberInfo.NextWaybillNumber);
						}
					}
				} else if(configuration.showNextLRNumberInManualLrField == 'true') {
					setValueToHtmlTag('lrnumber', ' Next LR No : '+ numberInfo.NextWaybillNumber);
							if ($('#lrNumberManual').exists()) {
								$('#lrNumberManual').val(Number(numberInfo.NextWaybillNumber));
							}
				}
				
				if (configuration.LRNumberManual == 'true' && !isAutoSequenceCounter)
					$('#branhCode').val(numberInfo.branchCode + seperator);
			}
		} else if(configuration.showLRNumberOnBookingPage == 'true')
			setBookingTypeWiseSequenceCounter();
}

function saveWayBill(value) {
	if(isWayBillSaved)
		return false;
	
	beforeSaveLrPopup(value);
}


function setFocusForNewLR() {
	if (configuration.showBillSelectionInAutoBooking == 'true' && jsondata.SHOW_BILL_SELECTION && !isDummyLR) {
		if(jsondata.withoutBillWIthoutPopup != undefined && jsondata.withoutBillWIthoutPopup)
			setWithoutBillOption();
		else
			ShowBillSelectionDialog();
		
		bindFocusBillSelection();
	} else {
		if(configuration.showBillSelectionInAutoBooking == 'true' && jsondata.withoutBillWIthoutPopup != undefined && jsondata.withoutBillWIthoutPopup)
			setWithoutBillOption();
		
		setFocusOnBookingType();
	}
	
	if(configuration.showEwaybillPopUpOnLoad == 'true') {
		if(showEwayBillPopupOnLoad)
			addMultipleEwayBillNo();
		
		checkBoxArray		= new Array();
		eWayBillNumberArray	= new Array();
		$("#isValidEwaybillMsg").addClass('hide');
		$("#noEwaybillMsg").addClass('hide');
	}
	
	if(isTokenThroughLRBooking!= undefined && isTokenThroughLRBooking && branchId != 38324)
		$('#lrNumberManual').focus();
	
	if(accountGroupId == 442  && branchId == 38324)
		$('#destination').focus();
}

function createWayBill() {
	var jsonObject		= new Object();
	setJsonDataforCreateWayBill(jsonObject);   
	
	jsonObject.filter		= 2;
	jsonObject.isDummyLR	= isDummyLR;
	jsonObject.grandTotal	= Number($('#grandTotal').val());
	
	if(typeof formTypeDetailsId !== 'undefined' && formTypeDetailsId != undefined && formTypeDetailsId > 0)
		jsonObject.formTypeDetailsId   = formTypeDetailsId;
	
	if(configuration.hideStPaidByTransporter == 'false'
		&& !($("#STPaidBy option[value='"+ TAX_PAID_BY_TRANSPORTER_ID + "']").length > 0))
		$("#STPaidBy").append('<option value="'+ TAX_PAID_BY_TRANSPORTER_ID + '">Transporter</option>');
	
	var extraDataForPrint	= getExtraDataForPrint();
	

	var jsonStr = JSON.stringify(jsonObject);
	
	if(!doneTheStuff) {
		doneTheStuff = true;
		
	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
					enableButton();
					isWayBillSaving = false;
					isWayBillSaved	= false;
					doneTheStuff	= false;
					token			= data.token;
					
					hideLayer();
				} else {
					var showQrCodeWithOutGSTNo  	= configuration.showQrCodeWithOutGSTNo;
					token							= data.token;
					
					pervwayBillId	= data.waybillId;
					billIdForInvoicePrint = data.billId
					
					if(servicePermission.isPhotoTxnService){
						var jsonObj		= new Object();
						var finalObj	= new Object();
						
						for (var i = 1 ; i <= imageArr.length ; i++){
							jsonObj["photo_"+i] 		= imageArr[i - 1];
						}
						
						jsonObj.imageCount 		= imageArr.length;
						jsonObj["waybillId"] 	= pervwayBillId;
						
						var jsonStr 			    = JSON.stringify(jsonObj);
						
						finalObj["imageObjet"]	= jsonStr;
						localStorage.setItem("imageObjet",imageArr);
						savephoto(jsonObj);
						$("#photoCaptureSuccessDiv").addClass("hide");
					}
					
					if(configuration.uploadInvoiceDocuments == 'true' && pervwayBillId > 0 && jsonObjectNew != null) {
						jsonObjectNew.id	 		= pervwayBillId;
						jsonObjectNew.moduleId		= BOOKING;
						saveInvoiceDocument(jsonObjectNew);
						
						$('#photoContainer :input').each(function () {
							$(this).val(''); // Reset the value of each input
						});
					}
					
					setRePrintOption(data, pervwayBillId);
					
					if(isAllowToEnterIDProof)
						saveIDProofDetails(data);

					previsRePrint		= data.isRePrint;
					lrPrintLink			= data.lrPrintLink;
					lrPrintLinkConfig	= data.lrPrintLinkConfig;
					prevLRNo			= data.wayBillNumber;
					
					if(data.isWSLRPrintNeeded) {
						jsonObject.accountGroupId	= accountGroupId;
						var printObj	= Object.assign(jsonObject, extraDataForPrint, data.objectOut);

						localStorage.setItem("wayBillId", pervwayBillId);
						//localStorage.setItem("lrDataPrint", JSON.stringify(data.objectOut));
						localStorage.setItem("lrDataPrint", JSON.stringify(printObj));
					}

					if(data.isLRPrintAllow) {
						if(configuration.displayReprintOption == 'true') 
							$('#reprint').removeClass('hide');
						else
							$('#reprint').addClass('hide');
							
						reprintWindow(previsRePrint);
						
						if (data.openInvoicePrintPopUpAfterBkgDly && data.wayBillTypeId == WAYBILL_TYPE_PAID)
							billPrintWindowAfterBooking(data.openInvoicePrintPopUpAfterBkgDly);
						
						if (jsondata.SHOW_BILL_SELECTION)
							setFocusOnBillSelection();

						$(document).one("keyup",function(e) {
							if (e.keyCode === 27) {
								if($('#bookingType').exists()) {
									if(isTokenThroughLRBooking){
										 // esc
										setTimeout(function(){$('#lrNumberManual').focus();},200);
									} else
										$('#bookingType').focus();   // esc
								} else if($('#destination').exists())
									$('#destination').focus();
							}
						});
					} else {
						$('#reprint').addClass('hide');
						
						if(showQrCodeWithOutGSTNo == 'true')
							setQRDetails(JSON.parse(localStorage.lrDataPrint));
					}

					resetAllData();
					
					setWayBillNumber(data);
					setNextLRNumberAfterBookingOnAutoBooking();
					setDefaultPodRequired(data.wayBillTypeId);
					enableButton();
					setFocusForNewLR();
					formTypeDetailsId = 0;
					
					branchWisePrepaidAmount		= data.branchWisePrepaidAmount;
					
					setRechargeAmount(data.wayBillTypeId);
					
					if(configuration.showNextLRNumberOnAutoManualLRBooking == 'true') {
						if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true')
							$('#lrNumberManual').val(Number(((data.wayBillNumber).split("/"))[1]) + 1);
						else
							$('#lrNumberManual').val(Number(data.wayBillNumber) + 1);
					}
					
					if(configuration.isSmsRequiredFeildChecked == 'true')
						document.getElementById("smsRequired").checked = true;
				}
				
				hideLayer();
			});
	  }
}

function setAndValidateNextWaybillNumber(nextVal,configuration) {
	var valuesToAppend	= '';
	
	if((configuration.checkSizeOfWayBillNumber == true || configuration.checkSizeOfWayBillNumber == 'true')
		&& !(Number(nextVal.toString().length) > Number(configuration.wayBillNumberSizeForCheck))) {
		for(var i = 0; i < (Number(configuration.wayBillNumberSizeForCheck) - Number(nextVal.toString().length)); i++) {
			valuesToAppend = valuesToAppend + '0';
		}
		
		NextWaybillNumber = valuesToAppend + nextVal;
	} else
		NextWaybillNumber = nextVal;
	
	return NextWaybillNumber;
}

function getYearCombinationWiseWayBillNumberGeneration(nextVal, branchCode, seperator) {
	let NextWaybillNumber 	= null;
	
	let createDate = new Date(); 
	let creationMonth = createDate.getMonth() + 1;
	let creationYear = createDate.getFullYear() % 100; 
	let lrNumberFormatForWithBill = configuration.lrNumberFormatForWithBill;

	if(lrNumberFormatForWithBill > 0 && $('#billSelection').val() == BOOKING_WITH_BILL) {
		if(lrNumberFormatForWithBill == 16)
			NextWaybillNumber = branchCode + seperator + creationYear + seperator + nextVal;
	} else if (configuration.showFinancialYearAfterBranchCodeAndWaybillNumberAtEnd == 'true') {
		if (creationMonth > 3)
			NextWaybillNumber =	branchCode + seperator + creationYear + '-' + (creationYear + 1) + seperator+nextVal ;
		else
			NextWaybillNumber = branchCode + seperator + (creationYear -1) + '-' + creationYear + seperator +nextVal ;
	} else if (configuration.showFinancialYearBeforeBranchCode == true || configuration.showFinancialYearBeforeBranchCode == 'true') {
		if (creationMonth > 3)
			NextWaybillNumber =  creationYear + '-' + (creationYear + 1) + seperator + branchCode + seperator + nextVal;
		else
			NextWaybillNumber = creationYear + '-' + (creationYear - 1) + seperator + branchCode + seperator + nextVal;

	}else if (configuration.showFinancialYearAfterBranchCode == true || configuration.showFinancialYearAfterBranchCode == 'true')   {
		if (creationMonth > 3)
			NextWaybillNumber =	branchCode + seperator + nextVal + seperator + creationYear + '-' + (creationYear + 1);
		else
			NextWaybillNumber = branchCode + seperator + nextVal + seperator + creationYear + '-' + (creationYear - 1);

	}else if (creationMonth > 3)
		NextWaybillNumber = creationYear + '-' + (creationYear + 1) + seperator + branchCode + nextVal;
	else
		NextWaybillNumber = creationYear + '-' + (creationYear - 1) + seperator + branchCode + nextVal;

	return NextWaybillNumber;
}

function setQRDetails(jsonStr) {
	var dataObjectColl 				= new Object();
	
	dataObjectColl.qrCodeSize 	= 8;
	dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
	
	var accountGroupObj 		= jsonStr.PrintHeaderModel;
	var consignmentDetailsArr 	= jsonStr.consignmentMap;
	var consigneeName 	= jsonStr.consigneeName;
	if (consigneeName.length > 12)
		consigneeName = consigneeName.substring(0, 16);	
									
	
	dataObjectColl.waybillId 			= jsonStr.wayBillId;
	dataObjectColl.lrType	 			= jsonStr.wayBillTypeName;
	dataObjectColl.waybillNumber 		= jsonStr.wayBillNumber;			
	dataObjectColl.numberOfPackages 	= jsonStr.quantity;
	dataObjectColl.destinationTo		= jsonStr.wayBillDestinationCityName;
	dataObjectColl.sourceFrom 			= jsonStr.wayBillSourceCityName;
	
	var templateArray = new Array();
	var consignmentVal = 1;
	
	for (var i = 0; i < consignmentDetailsArr.length; i++) {
		for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
			var dataObject = new Object();
			_.map(dataObjectColl,function(val,key){
				dataObject[key] = val;
			})
			
			dataObject.currentPackage 		= consignmentVal++;
			dataObject.currentPackingType 	= consignmentDetailsArr[i].packingTypeName;
			
		
			if(accountGroupObj.accountGroupId == ACCOUNT_GROUP_ID_FALCON) 
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 3px; " cellpadding="0" cellspacing="0"><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">To<br>Branch</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + jsonStr.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style=" border-right: solid 3px; padding: 0px 10px 0px 10px;">Consignee</td><td style=" padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr></table>')({ dataObject: dataObject });
			else
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;text-align:center;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+jsonStr.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+jsonStr.wayBillDestinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr style="width:25%; font-size: 20px;"><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVcargo</td></tr></table>')({dataObject : dataObject});
			
			dataObject.qrCodeString = dataObject.waybillId + "~"+ consignmentDetailsArr[i].consignmentDetailsId + "~" + QR_CODE_USING_CONSIGNMENT + "~" +j;
			templateArray.push(dataObject);
		}
	}
	//genericfunction.js
	printAllQRCodeWithoutLimit(templateArray);
}

function setEwaybillNumberAutomatically() {
	var url_string = window.location.href;
	var url = new URL(url_string);
	var ewaybillNumberStr = url.searchParams.get("ewNo");
	
	if(ewaybillNumberStr != null && ewaybillNumberStr != undefined && ewaybillNumberStr != ""){
		setTimeout(function() {
			$('#ewaybill0').val(ewaybillNumberStr);
			$('#singleFormTypes').val(FormTypeConstant.E_WAYBILL_ID);
			$('#eWayBillNumberDiv').css('display','inline');
			$('#singleFormTypes').attr('disabled','disabled');
			$('#btSubmit').trigger('click');
		}, 600);
	}
}

function checkPermissionToBookLr() {
	return validateLRTypesForAllowBooking(jsondata, configuration, executive);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function setNextWaybillNumber(numberInfo, seperator) {
	NextWaybillNumber = getYearCombinationWiseWayBillNumberGeneration(numberInfo.NextWaybillNumber, numberInfo.NextWaybillNumberBranchCode, seperator);
	setValueToHtmlTag('lrnumber', ' Next LR No : ' + NextWaybillNumber);
}

function setNextWaybillNumberShortCode(numberInfo, seperator) {
	NextWaybillNumber = getNextWaybillNumberShortCode(numberInfo.NextWaybillNumber, numberInfo.NextWaybillNumberBranchCode, seperator);
	setValueToHtmlTag('lrnumber', ' Next LR No : ' + NextWaybillNumber);
}

function getNextWaybillNumberShortCode(nextVal, branchCode, seperator) {
	let NextWaybillNumber = null;

	if ($('#wayBillType').val() == WAYBILL_TYPE_PAID)
		NextWaybillNumber = branchCode + seperator + configuration.codeForSequenceNumberGenerationForPaid + seperator + nextVal;
	else if ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		NextWaybillNumber = branchCode + seperator + configuration.codeForSequenceNumberGenerationForToPay + seperator + nextVal;
	else if ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		NextWaybillNumber = branchCode + seperator + configuration.codeForSequenceNumberGenerationForTBB + seperator + nextVal;
	else if ($('#wayBillType').val() == WAYBILL_TYPE_FOC)
		NextWaybillNumber = branchCode + seperator + configuration.codeForSequenceNumberGenerationForFOC + seperator + nextVal;

	return NextWaybillNumber;
}

function validateLRTypesForAllowBooking(jsondata, configuration, executive) {
	const firstParam = jsondata.shortcutParam ?? configuration.DefaultWayBillType;

	const permissions = {
		F7: isPaidBookingPermission,
		F8: isTopayBookingPermission,
		F9: isTbbBookingPermission,
		F10: isFocBookingPermission
	};
	
	// Priority order to fallback
	const fallbackOrder = ['F7', 'F8', 'F9', 'F10'];

	// If permission exists → keep it
	if (permissions[firstParam]) {
		jsondata.shortcutParam = firstParam;
		return true;
	}

	// Try fallback booking types
	for (const key of fallbackOrder) {
		if (permissions[key]) {
			jsondata.shortcutParam = key;
			return true;
		}
	}
	
	handleNoPermission();

	hideLayer();
	return false;
}