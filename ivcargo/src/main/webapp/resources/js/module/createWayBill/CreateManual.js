/*
 * loadWayBillData-
 * it will load whole page and append data as par configuration file.
 */

/*
 * Rework by Anant Chaudhary	28-01-2016/29-01-2016
 */

/*
 * Please include CommonJsFunction.js file
 * Please include VariableForErrorMsg.js file
 * Please include VariableForCreateWayBill.js file
 * Please include WayBillSetReset.js file
 * Please include formTypes.js file
 * Please include createColumnForDataPanel file
 * Please include elementfocusnavigation.js file after this file
 * Please include commonFunctionForCreateWayBill.js file
 */
var token = "";

function loadWayBillDataForManual(dispatchLedgerId) {

	showLayer();

	let jsonObject			= new Object();
	jsonObject.filter		= 1;
	jsonObject.isManual		= true;
	jsonObject.isDummyLR	= false;
	jsonObject.dispatchLedgerId	= dispatchLedgerId;
	isManual 				= true;
	isBookingFromDummyLS	= false;
	
	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					
					if(data.configuration.redirectToHomePageIfBookingSequenceNotGivenToAdmin == 'true' && data.executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN
						&& homePageUrl != null)
						window.location.href = homePageUrl;
					
					hideLayer();
				} else {
					jsondata				= data;
					token					= data.token;

					executive				= jsondata.executive; // executive object
					branchId				= executive.branchId;
					accountGroupId			= executive.accountGroupId;
					accountGroup			= jsondata.accountGroup;
					isManualWayBill			= true;
					isFromDynamicPaymentTypeSelection = false;

					// all constants
					ChargeTypeMaster					= jsondata.ChargeTypeMaster;
					BookingChargeConstant				= jsondata.BookingChargeConstant;
					CustomerDetails						= jsondata.CustomerDetailsConstant;
					RateMaster							= jsondata.RateMasterConstant;
					State								= jsondata.State;
					WayBillType							= jsondata.WayBillTypeConstant;
					TransportCommonMaster				= jsondata.TransportCommonMaster;
					Branch								= jsondata.Branch;
					CorporateAccount					= jsondata.CorporateAccountConstant;
					PartyMaster							= jsondata.PartyMasterConstant;
					WayBill								= jsondata.WayBill;
					ChargeConfiguration					= jsondata.ChargeConfigurationConstant;
					GroupConfigurationProperties		= jsondata.GroupConfigurationProperties;
					PackingTypeMaster					= jsondata.PackingTypeConstant;
					FormTypeConstant					= jsondata.FormTypeConstant;
					PackingGroupMappingArr				= jsondata.packingGroupMappingArr;
					ConfigParam							= jsondata.ConfigParam;
					RateHm								= jsondata.rateHm;
					maxNoOfDaysAllowBeforeCashStmtEntry	= jsondata.maxNoOfDaysAllowBeforeCashStmtEntry;
					showWayBillTypes					= jsondata.showWayBillTypes;
					isPaidBookingPermission				= jsondata.isPaidBookingPermission;
					isTopayBookingPermission			= jsondata.isTopayBookingPermission;
					isTbbBookingPermission				= jsondata.isTbbBookingPermission;
					isFocBookingPermission				= jsondata.isFocBookingPermission;
					BusinessFunctionConstants			= jsondata.BusinessFunctionConstants;
					TaxPaidByConstant					= jsondata.TaxPaidByConstant;
					BookingTypeConstant					= jsondata.BookingTypeConstant;
					ChargeTypeConstant					= jsondata.ChargeTypeConstant;
					SequenceCounter 					= data.SequenceCounter;
					InfoForDeliveryConstant				= jsondata.InfoForDeliveryConstant;
					PaymentTypeConstant					= jsondata.PaymentTypeConstant;
					formTypeMastersArray 				= jsondata.formTypeMastersArray;
					vehicleTypeConstant 				= jsondata.VehicleTypeConstant;
					agentCommissionValue				= jsondata.agentCommissionValue;
					selfCorporateAccountId				= jsondata.selfCorporateAccountId;
					ServiceTypeConstant					= jsondata.ServiceTypeConstant;
					ExecutiveTypeConstant				= jsondata.ExecutiveTypeConstant;
					consignmentGoods					= jsondata.consignmentGoods;
					PODRequiredConstant					= jsondata.PODRequiredConstant;
					destinationBranch					= jsondata.destinationBranch;
					destinationBranchIds				= jsondata.destinationBranchIds;
					allowChequeBouncePayment			= jsondata.allowChequeBouncePayment;
					discountInPercent					= jsondata.discountInPercent;
					TaxMasterConstant					= jsondata.TaxMasterConstant;

					deliveryToArray						= jsondata.deliveryToArray;
					branchcache							= jsondata.branchcache;
					taxModelHm    						= jsondata.taxModelHm;
					packingTypeGoods    				= jsondata.packingTypeGoods;
					/*
					 * Compalsary for Bank Payment Operations
					 */
					ModuleIdentifierConstant			= jsondata.ModuleIdentifierConstant;
					paymentTypeArr						= jsondata.paymentTypeArr;
					moduleId							= jsondata.moduleId;
					incomeExpenseModuleId				= jsondata.incomeExpenseModuleId;
					SubRegion							= jsondata.SubRegion;
					loggedInExecutiveSubregion			= jsondata.loggedInExecutiveSubregion;
					tdsConfiguration					= jsondata.tdsConfiguration;
					podConfiguration					= jsondata.podConfiguration;
					isAllowToEnterIDProof				= jsondata.idProofEntryALlow;
					maxFileSizeToAllow					= jsondata.maxFileSizeToAllow;
					idProofConstantArr					= jsondata.idProofConstantArr;
					IDProofConstant						= jsondata.IDProofConstant;
					GeneralConfiguration				= jsondata.GeneralConfiguration;
					uploadPdfDetailsList				= jsondata.uploadPdfDetailsList;
					
					if(jsondata.taxes != undefined && jsondata.taxes.length > 2)
						defaultTaxValue 		= jsondata.taxes[2].taxAmount;
					
					// group configuration
					configuration				= data.configuration;
					loggedInBranch				= data.loggedInBranch;
					loggedInExecutiveBranch		= data.loggedInExecutiveBranch;
					subRegionIdsForOverNite		= configuration.subRegionIdsForOverNite;
					dispatchLedgerIdForManualLS	= data.dispatchLedgerId != undefined ? data.dispatchLedgerId : 0;
										
					if(dispatchLedgerIdForManualLS > 0 || configuration.groupSpecificManualLSModule == 'true')
						isAllowToEnterIDProof	= false;
					
					/*
						Change Rate flavour type subregion wise
					*/
					changeFlavourTypeSubregionWise();
					showOwnBranchInDestinationInManualOpenBooking();
					/*
						Change property to allow subregion wise volumetric
					*/
					showVolumetricRateSubregionWise();
					checkBranchIdForGstValidation();
					checkBranchIdForServiceTaxCalculation();
					
					chargeTypeFlavour			= configuration.ChargeTypeFlavour;
					minWeight					= configuration.MinWeight;
					defaultlrCharge				= configuration.LRCharge;
					aplyRateForCharges			= (configuration.ApplyRateForCharges).split(",");
					defaultDeliveryAt			= configuration.DefaultDeliveryAt;
					defaultSTPaidBy				= configuration.DefaultSTPaidBy;
					defaultPaymentType			= configuration.DefaultPaymentType;
					defaultServiceType			= configuration.defaultServiceType;
					
					minimumQuantityAmount				= parseInt(configuration.MinimumQuantityAmount);
					quantityAmountCharges   			= (configuration.QuantityAmountCharges).split(",");
					MinQtyAmtTobeAssigned				= parseInt(configuration.MinQtyAmtTobeAssigned);
					defaultActualWeight					= configuration.DefaultActualWeight;
					servicePermission					= jsondata.servicePermission;
					tdsChargeInPercent					= jsondata.TDSChargeInPercent;
					fixRateChargeIds					= (configuration.fixRateChargeIds).split(",");
					ContainerDetails					= jsondata.ContainerDetails;
					chargeIdsForCCAttachedArr			= jsondata.chargeIdsForCCAttached;
					articleTypeForGroup					= jsondata.articleTypeForGroup;
					taxTypeHm							= jsondata.taxTypeHm;
					LRTypeChargeIdHMToShowCharge		= jsondata.LRTypeChargeIdHMToShowCharge;
					branchWisePrepaidAmount				= jsondata.branchWisePrepaidAmount;
					slabWeightList							= jsondata.slabWeightList;
					valuationChargeList						= jsondata.valuationChargeList;
					consignorNameAutocomplete				= configuration.ConsignorNameAutocomplete == 'true';
					consignmentGoodsListForParty			= jsondata.consignmentGoodsListForParty;
					validateEwaybillNumberThroughApi		= configuration.validateEwaybillNumberByApi == "true" || configuration.validateEwaybillNumberByApi == true;
					groupWiseCompanyNameHm					= jsondata.groupWiseCompanyNameHm;
					allowToCheckSameCompanyGstnOnEwayBill	= configuration.allowToCheckSameCompanyGstnOnEwayBill == "true" || configuration.allowToCheckSameCompanyGstnOnEwayBill == true;
					packingTypesNameHM						= jsondata.packingTypesNameHM;
					dispatchLedger							= jsondata.DispatchLedger;
					chargesToApplyArticleWiseRateOnWeightType = (configuration.ChargesToApplyArticleWiseRateOnWeightType).split(",");
										
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
					
					if (servicePermission.isPhotoTxnService || servicePermission.isSignatureTxnService) {
						if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
							showUpperSignLayer('Click'+' <i class="glyphicon glyphicon-facetime-video"></i>'+' to Grant Permission to access Webcam');
						}
					}
					
					if(configuration.groupWiseRateFileAllowed == 'true')
						loadJS('/ivcargo/resources/js/module/createWayBill/Rate_'+accountGroupId+'.js?v=10.0');
					else
						loadJS('/ivcargo/resources/js/module/createWayBill/Rate.js?v=10.0');

					if(configuration.calculateDestBranchToDoorDlyDistance == 'true')
						loadJS('https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=AIzaSyCV4q95ixtS8JfJkuxlKLio2P6yzdugZ_c');
					
					isAutoSequenceCounter	= false;

					if (jsondata.isBookingDiscountAllow) isBookingDiscountAllow = true;
					if (jsondata.isBookingDiscountPercentageAllow) isBookingDiscountPercentageAllow = true;
					if (configuration.disableHamliChargeOnTopay) disableHamliChargeOnTopay = configuration.disableHamliChargeOnTopay;
					if (configuration.isNextPreviousNavigationAllow) isNextPreviousNavigationAllow	= configuration.isNextPreviousNavigationAllow;
					if (jsondata.allowReverseEntryLRBooking) allowReverseEntryLRBooking = true;
					
					if (configuration.branchWisePaymentTypeSelectionInBooking == 'true') {
						var branchIdArr = (configuration.branchIdsForPaymentTypeSelectionInBooking).split(',');
								
						if (isValueExistInArray(branchIdArr, branchId)) {
							configuration.PaymentType = 'true';
							configuration.addSelectOptionInPaymentType = 'true';
							defaultPaymentType	= 0;
						}
					}
					
					if(configuration.gstnNumber == 'true' && isValueExistInArray(groupListForGSTN, accountGroupId))
						configuration.gstnNumber = 'false';
					
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
						if (configuration.paidPartialPaymentOnBooking == 'true') loadelement.push(partialPaymentModal);
						if (configuration.showViewAllConsignmentGoodsLink == 'true') loadelement.push(viewAllConsignmentGoodsModal);
						if (jsondata.SHOW_BILL_SELECTION) loadelement.push(loadBillSelectionAtBooking);
						if (configuration.wayBillTypeOption == 'true') loadelement.push(loadWayBillTypeOption);
						if (configuration.showTransportationMode == 'true') loadelement.push(loadTransportationMode);
						if (configuration.showTransportationCategory == 'true') {loadelement.push(loadTransportationCategory);}
						
						if (configuration.BookingType == 'true') {
							if(configuration.allowFullLoadBookingOnly == 'true') {
								if(jsondata.ALLOW_FULL_LOAD_BOOKING_ONLY)
									loadelement.push(loadBookingType);
							} else
								loadelement.push(loadBookingType);
						}
						
						if (configuration.showDivisionSelection == 'true') loadelement.push(loadDivisionSelection);
						if (configuration.sourceBranch == 'true') loadelement.push(loadSourceBranch);
						if (configuration.LRNumberManual == 'true') loadelement.push(loadLRNumberManual);
						if (configuration.OTLrNumber == 'true') loadelement.push(loadOTLRNumber);
						if (configuration.LRDate == 'true') loadelement.push(loadLRDate);
						if (configuration.showSubRegionwiseDestinationBranchField == 'true') loadelement.push(loadSubregionDestination);
						if (configuration.DeliveryDestination == 'true') loadelement.push(loadDestination);
						if (showRegionWiseMovementType) loadelement.push(loadMovementTypeFeild);
						if (configuration.billingBranch == 'true') loadelement.push(loadBillingBranch);
						if (configuration.PickupType == 'true') loadelement.push(loadPickUp);
						if (configuration.FrightuptoDestination == 'true') loadelement.push(loadFrightUpTo);
						if (configuration.VehicleNumber == 'true' || configuration.vehicleNumberAfterBookingType == 'true') loadelement.push(loadVehicleNumber);
						if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') loadelement.push(loadVehicleType);
						if (configuration.Consignor == 'true') loadelement.push(loadConsignor);
						if (configuration.Consignee == 'true') loadelement.push(loadConsignee);
						if (configuration.AddArticle == 'true') loadelement.push(loadAddArticle);
						if (configuration.paidPartialPaymentOnBooking == 'true') loadelement.push(loadPartialPaymentType);
						if (configuration.WaightAndAmount == 'true') loadelement.push(loadWeightAndAmount);
						if (configuration.STPaidBy == 'true') loadelement.push(loadSTPaidBy);
						if (configuration.InvoiceNo == 'true') loadelement.push(loadInvoiceNo);
						if (configuration.showInvoiceDate == 'true') loadelement.push(loadInvoiceDate);
						if (configuration.cargoType == 'true') loadelement.push(loadCargoType);
						if (configuration.DeclaredValue == 'true') loadelement.push(loadDeclaredValue);
						if (configuration.PercentageRiskCover == 'true' || configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') loadelement.push(loadPercentageRiskCover);
						if (configuration.DeliveryAt == 'true' || configuration.deliveryAtAfterBookingType == 'true') loadelement.push(loadDeliveryTo);
						if (configuration.Remark == 'true') loadelement.push(loadRemark);
						if (configuration.additionalRemark == 'true') loadelement.push(loadAdditionalRemark);
						if (configuration.PaymentType == 'true') loadelement.push(loadPaymentType);
						if (configuration.showTopayAdvance == 'true') {loadelement.push(loadTopayAdvance);}
						if (configuration.ServiceType == 'true') loadelement.push(loadServiceType);
						if (jsondata.allowToAddMultipleInvoiceDetail) {loadelement.push(loadMultipleInvoiceDetails);							}
						/*if (configuration.TotalQuantity == 'true') {
							loadelement.push(loadTotalQuantity);
						}*/
						if (configuration.showInsurance  == 'true') {loadelement.push(loadInsurance);}
						if (configuration.allowedCashOnDelivery == 'true') {loadelement.push(loadCod);}
						if (configuration.CollectionPerson == 'true') loadelement.push(loadSearchCollectionPerson);
						if (configuration.PaymentTypeCheque == 'true') loadelement.push(loadChequeDetails);
						if (configuration.PaymentTypeCreditCard == 'true' || configuration.PaymentTypeDebitCard == 'true') loadelement.push(loadCreditCardDetails);
						
						//load element paytm details
						if (configuration.PaymentTypePaytm == 'true') loadelement.push(loadPaytmDetails);
						if (configuration.SaveButton == 'true') loadelement.push(loadSaveButton);
						if (configuration.WayBillCharges == 'true') loadelement.push(loadWayBillCharges);
						if (configuration.PreBookingChargeAmount == 'true') loadelement.push(loadPreBookingCharges);
						if (configuration.NewPartyAutoSave == 'true') loadelement.push(loadAddNewPartyOverlay);
						if (configuration.SaidToContainOverlay == 'true') loadelement.push(loadSaidToContainOverlay);
						if (configuration.CommodityType == 'true') loadelement.push(loadCommodityType);
						if (jsondata.allowBranchWiseInsuranceService) {loadelement.push(loadSubCommodityType);}
						if (configuration.WayBillType == 'true') loadelement.push(loadWayBillType);
						if (configuration.PrivateMark == 'true' || configuration.showPrivateMarkAsTripId == 'true') loadelement.push(loadPrivateMark);
						if (configuration.PrivateMarkBeforeFormType == 'true') loadelement.push(loadPrivateMark);
						if (configuration.DeclaredValueBeforeFormType == 'true') loadelement.push(loadDeclaredValue);
						
						//Commented By Anant Chaudhary	23-01-2016 due to created new forms selection by checkbox
						if (configuration.FormsWithMultipleSelection == 'true') loadelement.push(loadFormTypes);
						if (configuration.FormsWithSingleSlection == 'true') loadelement.push(loadSingleFormTypes);							
						if (configuration.Form403402 == 'true') loadelement.push(loadForm403402);
						if (configuration.CTForm == 'true') loadelement.push(loadFormCTForm);
						if (configuration.RoadPermitNumber == 'true') loadelement.push(loadRoadPermitNumber);
						if (configuration.ExciseInvoice == 'true') loadelement.push(loadExciseInvocie);
						if (podConfiguration.isPodRequired && podConfiguration.showPODRequiredFeildAtBooking) loadelement.push(loadPODRequired);
						if (configuration.ConsignmentInsured == 'true') loadelement.push(loadConsignmentInsured);

						if(configuration.showApprovalType == 'true') loadelement.push(loadApprovalTypeFeild);

						if(configuration.showForwardType == 'true') loadelement.push(loadForwardTypeFeild);
						if(configuration.showHsnCodeSelection == 'true') loadelement.push(loadHsnCodeFeild);
						if(configuration.showInsurancePolicyNumber == 'true') loadelement.push(loadInsurancePolicyNoFeild);
						if(configuration.showTemperatureSelection == 'true') loadelement.push(loadTemperatureFeild);
						if(configuration.showDeclarationSelection == 'true') loadelement.push(loadDeclarationFeild);
						//if(configuration.showCrossingAgentNameField == 'true') loadelement.push(loadCrossingAgentNameField);
						if(configuration.showDataLoggerNumber == 'true') loadelement.push(loadDataLoggerNoFeild);
						if(configuration.showConnectivityFeild == 'true') loadelement.push(loadConnectivityFeild);
					
						if (configuration.PanNumber == 'true' || configuration.TanNumber == 'true' || tdsConfiguration.IsPANNumberRequired)
							loadelement.push(loadPanNumber);
						
						if (configuration.TanNumber == 'true' || tdsConfiguration.IsTANNumberRequired) loadelement.push(loadTanNumber);
						if (GeneralConfiguration.BankPaymentOperationRequired == 'true') loadelement.push(loadBankPaymentOptions);
						if (configuration.showSmsRequiredFeild == 'true') loadelement.push(loadSmsRequiredFeild);
						if (configuration.isShowSingleEwayBillNumberField == 'false') loadelement.push(addMutipleEwayBillNumber);
						if (configuration.showCategoryType == 'true') {loadelement.push(loadCategoryFeild);}
						if (configuration.showGstType == 'true' || configuration.showGstType == true) {loadelement.push(loadGSTTypeFeild);}
						if (configuration.showBookedBy == 'true' || configuration.showBookedBy == 'true') {loadelement.push(loadBookedBy);}
						if (configuration.showInvoiceQtyField == 'true')loadelement.push(loadInvoiceQtyFeild);
						if (configuration.showSealNumber == 'true') loadelement.push(loadSealNumberFeild);
						if (configuration.showVehiclePoNumber == 'true') loadelement.push(loadVehiclePoNumberFeild);
						if (configuration.showRecoveryBranchForShortCredit == 'true') {loadelement.push(loadRecoveryBranch);}
						if (configuration.sendBookingTimeOTP == 'true') loadelement.push(loadBookingTimeOtpFeild);

						if (configuration.showExcludeCommissionOption == 'true') {
							loadelement.push(loadExcludeCommissionOption);
							$( "#excludeCommissionPanel" ).hide();
						} 
						
						if(jsondata.AUTO_LR_NUMBER_IN_MANUAL && configuration.allowAutoSequenceOnManual == 'true')
							loadelement.push(sequenceTypeSelection);
						
						if(allowReverseEntryLRBooking) loadelement.push(loadManualEntryType);
						
						if(jsondata.AUTO_LR_SEQUENCE_COUNTER_CHECK_BOX_IN_MANUAL)
							loadelement.push(LRSequenceCounterCheckBox);
							
						if (configuration.chequeBounceRequired == 'true' && configuration.isAllowBookingLockingWhenChequeBounce == 'true')
							loadelement.push(loadChequeBounce);
							
						if (configuration.showFocApprovedBy == 'true' || configuration.showFocApprovedBy == true) {loadelement.push(loadDirectorList);}

						// when apply load all ajax requests and done is call back function
						$.when.apply($, loadelement).done(function() {
							if(typeof createVideoLink != 'undefined') createVideoLink(data);
						
							if (configuration.BookingType == 'true') setBookingType();
							if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') setVehicleType();
							if (configuration.VehicleTypeWithConstantValue == 'true') VehicleTypeWithConstantValue();

							if (configuration.AddArticle == 'true') {
								configureAddArticle(executive);
								setChargeType();
								setPackingType();
							}

							if (configuration.STPaidBy == 'true') setSTPaidBy();
							if (configuration.PaymentType == 'true') setPaymentType('paymentType');
							if (configuration.PickupType == 'true') setPickupType();
							if (configuration.ServiceType == 'true') setServiceType();
							if (configuration.paidPartialPaymentOnBooking == 'true') setPartialPaymentTypeOption();
							if (configuration.wayBillChargeWiseRemarkNeeded == 'true') setChargeWiseRemarkPanel(); // file waybillsetreset
							if (configuration.PreBookingChargeAmount == 'true') setPreBookingCharges();
							if (configuration.showBranchServiceType == 'true' || configuration.showBranchServiceType == true ||
							configuration.showBranchServiceTypeAfterBookingType == 'true' || configuration.showBranchServiceTypeAfterBookingType == true) {loadelement.push(loadServiceTypeFeild);}

							if (configuration.WayBillCharges == 'true') {
								changeGstRatesOnTransportMode();
								setBookingCharges(configuration.DefaultWayBillTypeForManual);
							}
							
							if(jsondata.allowToAddMultipleInvoiceDetail)
								bindEventOnMultipleInvoiceDetails();
							
							if (configuration.DeliveryAt == 'true' || configuration.deliveryAtAfterBookingType == 'true') setDeliveryTo();
							
							if (configuration.FormsWithMultipleSelection == 'true' 
								|| configuration.FormsWithSingleSlection == 'true'
								|| configuration.CTForm == 'true' 
								|| configuration.Form403402 == 'true') {
									setFormTypes();
									bindEventOnFormNumber();
								}
								
							if (configuration.CommodityType == 'true') setCommodityType();
							if (jsondata.allowBranchWiseInsuranceService) setSubCommodityType();
							
							if (configuration.showCheckBoxToCalulateValuationChrgOnDeclareValue != 'true' && configuration.checkboxToApplyRiskCoverageOnDeclareValue == 'false') {
								$("#declaredValueCheckBox").addClass("hide");
								$("#declaredValueCheckBoxlbl").addClass("hide");
								$("#declaredValueCheckBox").hide();
							}
							
							/*
							if (configuration.checkboxToApplyRiskCoverageOnDeclareValue != 'true') {
								$("#declaredValueCheckBox").addClass("hide");
								$("#declaredValueCheckBoxlbl").addClass("hide");
								$("#declaredValueCheckBox").hide();
							}
							*/
							if(jsondata.AUTO_LR_NUMBER_IN_MANUAL && configuration.allowAutoSequenceOnManual == 'true') {
								setSequenceType();
								setSequeceCounterType();
							}
							
							if(jsondata.allowBranchWiseInsuranceService) { 
								configuration.Pincode			= 'true';
								configuration.InvoiceNo 		= 'true';
								configuration.showInvoiceDate	= 'true';
								configuration.DeclaredValue		= 'true';
							}
							
							configurePartyInfo();
							readCustomAmountCalculationProperty();//for kcpl
							disableChargesForAgentBranches();
							disableChargesForDoorPickUpCharge();
							checkForPartyAutoFill();
							
							disableCategoryType();
							
							if(tdsConfiguration.IsTdsAllow) {
								if($('#wayBillType').val() == WAYBILL_TYPE_PAID) {
									$('#isTdsRequired').show();
									setTDSChargeInPercent();
								} else {
									$('#isTdsRequired').hide();
								}
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
								
								if(configuration.allowChargeWeightFromSlabWeight == 'true')
									calculateChargedWeightFromSlabWeight();
									
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
							
							$( "#chargedWeight" ).blur(function() {
								editChargedWeight(this);
								getWeightTypeRates();
								if(typeof getFixedHamaliSlabRates != 'undefined') getFixedHamaliSlabRates();
								if(typeof getFixTypeRates != 'undefined') getFixTypeRates();
								hideInfo();
								clearIfNotNumeric(this,'0');
								if(typeof validateArticleAmountWithWeight != 'undefined') validateArticleAmountWithWeight();
								if(typeof calculateRouteWiseSlabRates != 'undefined') calculateRouteWiseSlabRates();
								calulateTotalConsigmentWeight();
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
							
							$( "#fixAmount" ).blur(function() {
								if(typeof getFixAmountNotChange != 'undefined') getFixAmountNotChange();
							});
							
							$("#lrNumberManual").blur(function() {
								clearTxtFeildIfNotNumeric(this,'');
								validateLrNumber();hideInfo();
								
								if(configuration.doNotLrNumberValidateTokenBooking == 'true') {
									checkIfLRNumberExist();
								} else {
									checkManualLRLengthValidation();
									checkIfManualLRNumberAndDate();
									validateManualLrNumberAndAutoLrSequence();
									getPartyWiseLrSequenceForManulLr();
								}
							});
							
							$("#lrNumberManual").keypress(function(event) {
								if(!regexValidationInputFeild(event)) return false;
								
								if(getKeyCode(event) == 17){return false;};
								validateLrNumber();
							});
							
							/*
							$("#lrNumberManual").keypress(function(e) {
								return allowSpecialCharactersIn(e, 'lrNumberManual');
							});*/
							
							$( "#lrDateManual" ).blur(function() {
								if(!configuration.doNotLrNumberValidateTokenBooking == 'true'){
									setMonthYear(this);
									checkIfManualLRNumberAndDate();
									validateManualLrNumberAndAutoLrSequence();
								}
							});
							
							if(configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true')
								bindEventOnDeclaredValue();
								
							if (configuration.DeliveryAt == 'true')
								bindEventOnDeliveryTo();
								
							if (configuration.validatePickupType == 'true' || configuration.validatePickupType == 'true') {
								$("#PickupType").blur(function() {
									hideInfo(); validatePickupType();
								});
							}
								
							setPrepaidAmountOnWaybillTypeChng(data);
							
							if (configuration.SaveButton == 'true') {
								$('#save').mouseup(function() {
									onSaveWayBill();
								}).keydown(function(event) {
									if(getKeyCode(event) == 13) {
										onSaveWayBill();
									}
								});
							}

							if(isBookingDiscountAllow) {
								setDiscountType();
							} else {
								$('#discountPanel').remove();
							}
							
							if(!isBookingDiscountPercentageAllow) {
								$('#discountPercentageRow').remove();
							} else {
								$('#isDiscountPercentDiv').remove();
								$('#rowdiscountTypes').remove();
							}

							if (configuration.OwnBranchLocationsRequired == 'true')
								isOwnBranchLocationsRequired = true;
							
							if(jsondata.AGENT_COMMISSION)
								displayCommissionFeild();
							
							if (configuration.ExciseInvoice == 'true') setExciseInvoice();
							if (configuration.ConsignmentInsured == 'true') setConsignmentInsured();
							if (configuration.showTransportationMode == 'true') setTransportationMode();
							if (configuration.isRiskAllocationAllow == 'true') setRiskAllocation();
							//if (allowReverseEntryLRBooking) setManualEntryType();
							if (configuration.setDefaultDateOnManual == 'true') setDefaultDateOnManual();
							if (configuration.showTaxType == 'true') setTaxType();
							if (configuration.businessTypeSelection == 'true') setBusinessType(); else $('#businessType').remove();
							if (configuration.cftUnitSelection == 'true') setCFTUnitSelection(); else $('#cftSelectionSpan').remove();
							if (configuration.packageConditionSelection == 'true') setPackageCondition(); else $('#packageCondition').remove();
	
							if(configuration.isIncreaseCRInsuranceChargeAllow == 'true')
								$('#charge' + ChargeTypeMaster.CR_INSUR_BOOKING).prop("readonly", "true");
							
							if (configuration.multipleRemarkField == 'true') setMultiSelectRemark();//Calling From CommonFunctions.js
							
							configureWeightAndAmount();
							setPage();
							if (allowReverseEntryLRBooking) setManualEntryType();
							
							if(configuration.allowAutoSequenceCounterForManual == 'true' || configuration.manualLrNoWithMonth == 'true' || configuration.showNextLrNumberInManualAuto == 'true')
								setWayBillNumber(jsondata);
							
							if(configuration.isAllowDefaultLengthForManualLR == 'true')
                                document.getElementById('lrNumberManual').maxLength = configuration.allowedDefaultLengthForManualLR;

							if(jsondata.AUTO_LR_SEQUENCE_COUNTER_CHECK_BOX_IN_MANUAL) {
								if(configuration.isSourceBranchWiseSeqCounterByDefaultChecked == 'true')
									$('#isSourceBranchWiseSeqCounter').prop('checked', 'true');
								else
									isExecutiveBranchWiseSeqCounterChecked = true;
							}
							
							setDefaultDestinationBranch(); // Calling From WayBillSetReset.js file
							
							if(configuration.groupSpecificManualLSModule == 'true')
								bindEventAndShowLSDetails();
								
							hideLayer();
							resetBookingPageByRegionId();
							//Calling from elementfocusnavigation.js file
							initialiseFocus();
							setFocusForNewLR();
							
							if(isNextPreviousNavigationAllow == 'true')
								setNextPreviousNavigationForElements(items);
							
							if(configuration.DefaultLoggedBranchInSourceBranch == 'true')
								$('#WBTypeManual').focus();
							
							if(configuration.bookingScreenBackgroundColorAllow == 'true'){
								$("td").css('background', configuration.bookingScreenBackgroundColor);
								$("#DisplayWayBillTypeForManual").css('background','#0073BA');
							}
								
							setGoodsClassification();
								
							validateRateFromRateMasterForLR = configuration.validateRateFromRateMasterForLR == 'true' || configuration.validateRateFromRateMasterForLR == true;
							validateRateFromRateMasterForLRWithoutDisableFields = configuration.validateRateFromRateMasterForLRWithoutDisableFields == 'true' || configuration.validateRateFromRateMasterForLRWithoutDisableFields == true;
							
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
							
							if (!isAllowToEnterIDProof) {
								$('.openIdProofModel').remove();
								$('.openAddedIDProofModal').remove();
							} else {
								$('.openIdProofModel').removeClass('hide');
								$('.openAddedIDProofModal').removeClass('hide');
							}
							
							if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING) {
								$('.addUpdateConsigneePartyGstnModal').removeClass('hide');

								if($('#wayBillType').val() != WAYBILL_TYPE_CREDIT)
									switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
							} else {
								switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'hide', 'show');
								$('.addUpdateConsigneePartyGstnModal').remove();
							}
							
							disablePODStatus();
							
							if(configuration.allowBackDateForManualLr == 'true' || configuration.allowBackDateForManualLr == true) setDefaultDateOnManual();
							
							isManual = true;
							setCustomeLebelForBookingPage(configuration);
							removeStarFromInvoiceAndDeclaredValue();
							addAsteriskStarForMandatoryFields();
							
							if(configuration.sendBookingTimeOTP == 'true') sendOTP();
							if(configuration.taxCalculationBasedOnGSTSelection == 'true') setGSTPerSelection();
							
							$("#totalAmountLabel").text(configuration.totalAmountLabel);
						
							if(configuration.InvoiceNo == 'true' && configuration.uploadInvoiceDocuments == 'true'){
								$('#uploadInvoiceDocument').removeClass('hide');
								$('#submitInvoice').on('click', function(){
									submitInvoice();
								});
								uploadInvoiceDocument(configuration.noOfFileToUpload, uploadPdfDetailsList, configuration.maxSizeOfFileToUpload);
							}
						
							bindEventOnDeclaredValueCheckBox();
							showCheckboxToCalculateInsuranceOnDeclareValue()
						}).fail(function() {
							console.log("Some error occured");
						});
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
	if (configuration.FocusOnQuantityAfterAddArticle == 'true') {
		$("#add").focus(function (){
			setFocusOnQuantityAfterAddArticle(this);
		});	
		$("#quantity").keypress(function () {
			setFocusOnQuantityAfterAddArticle(this);
		});
	}
	if(configuration.setFocusOnQuantityAfterLBHHeight == 'true') {
		$("#add").keyup(function (){
			setFocusOnQuantityAfterLBHHeight(this);
		});
	}
}

function bindFocusOnLastCharge(){
	if (configuration.paidPartialPaymentOnBooking == 'true') {
		$("#"+$("#charges tr:last input")[0].id).keyup(function (){
			var paymentType = $('#paymentType').val();
			if(Number(paymentType) == 3){
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
	
	$('#WBTypeManual').val(configuration.DefaultWayBillTypeForManual);
	$('#wayBillType').val(configuration.DefaultWayBillTypeForManual);
	
	changeWayBillTypeManual(configuration.DefaultWayBillTypeForManual);
	
	setBillSelection();
	
	if(jsondata.withoutBillWIthoutPopup != undefined && jsondata.withoutBillWIthoutPopup)
		setWithoutBillOption();
	else
		ShowBillSelectionDialog();
	
	swapConsignorConsigneeGstnPanel();
	
	setDefaultParty(jsondata.shortcutParam == null ? configuration.DefaultWayBillType : jsondata.shortcutParam);

	if ($('#chequeDate').exists()) {
		$('#chequeDate').val(date(new Date(),"-"));
		$('#chequeDate').datepicker({
			dateFormat: 'dd-mm-yy'
		});
	}

	//setFocusForNewLR();

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

function changeWayBillTypeManual(selectWayBillType) {

	var displayWbType						= document.getElementById('DisplayWayBillTypeForManual');
	var lrType								= document.getElementById('lrType');
	var value								= 'PAID';
	
	if (configuration.showToPayAdvanceField == 'true' && configuration.removeTopayAdvanceFieldFromChargesTable == 'true') {
		if ($("#topayAdvancePanel").length > 0) {
			if (selectWayBillType == WAYBILL_TYPE_TO_PAY) {
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
	
	createDeliveryToOption();
	
	if(selectWayBillType == WAYBILL_TYPE_PAID && !isReserveBookingChecked) {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_PAID);
		
		selectWayBillType = 'F7';
		value = 'PAID';
		displayWbType.className = 'paidWayBill';
		disableDiv('leftTD',false);
		$('#wayBillType').val(WAYBILL_TYPE_PAID);
		switchHtmlTagClass('paymentTypeDiv', 'show', 'hide');
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		setDefaultSTPaidBy(WAYBILL_TYPE_PAID);
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_PAID);
		
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
		$("#DisplayWayBillTypeForManual").css('background','#0073BA');
		
		validateDateDestOvernitecarrier();
		showCurrentDateInManualWayBill();
		
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			addMultipleEwayBillNo();
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		changeSTPaidByForPartyExemptedOnLRType($('#cnorExempted_' + $('#partyMasterId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForPaid == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');
		
		if(configuration.isAllowPaymentTypeInToPay == 'true')
			setPaymentType('paymentType');
	} else if(selectWayBillType == WAYBILL_TYPE_TO_PAY) {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_TO_PAY);
		
		selectWayBillType = 'F8';
		value = 'TO PAY';
		displayWbType.className = 'toPayWayBill';
		disableDiv('leftTD', configuration.doNotAllowToBookTopayLRWithAmount == 'true');
		$('#wayBillType').val(WAYBILL_TYPE_TO_PAY);
		setDefaultSTPaidBy(WAYBILL_TYPE_TO_PAY);
		hidePaymentTypeandDetails();
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_TO_PAY);
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');
		$('#panNumber').val('');

		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
		
		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		if(typeof reCalculateRates != 'undefined' && $('#destinationBranchId').val() > 0)
			reCalculateRates($('#destinationBranchId').val(), $('#consigneePartyMasterId').val());
		
		$("#agentcommission").attr("disabled",true);
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_TO_PAY);
		
		setDefaultPodRequired(WAYBILL_TYPE_TO_PAY);
		
		removePassenger();
		removeDoorDelivery();
		
		$("#DisplayWayBillTypeForManual").css('background','#E77072');
		validateDateDestOvernitecarrier();
		showCurrentDateInManualWayBill();
	
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			addMultipleEwayBillNo();
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		changeSTPaidByForPartyExemptedOnLRType($('#cneeExempted_' + $('#consigneePartyMasterId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForTopay == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');
			
		if(configuration.isAllowPaymentTypeInToPay == 'true') {
			switchHtmlTagClass('paymentTypeDiv', 'show', 'hide');
			setPaymentType('paymentType');
		}
	} else if(selectWayBillType == WAYBILL_TYPE_CREDIT) {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_CREDIT);
		
		selectWayBillType = 'F9';
		value = 'TBB';
		displayWbType.className = 'creditWayBill';
		disableDiv('leftTD',false);
		$('#wayBillType').val(WAYBILL_TYPE_CREDIT);
		setDefaultSTPaidBy(WAYBILL_TYPE_CREDIT);
		hidePaymentTypeandDetails();
		switchHtmlTagClass('billingbranchpanel', 'show', 'hide');
		setBillingBranch(WAYBILL_TYPE_CREDIT);
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');
		$('#panNumber').val('');

		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		if(configuration.ConsignorBillingPartyName == 'true') {
			switchHtmlTagClass('BillingPartyDetailsConsignor', 'show', 'hide');

			if (configuration.isAllowToShowBillingPartyGSTN == 'true')
				showBillingGstnAfterBillingPartyPanel();
		}
		
		if(configuration.showTransportationCategory == 'true') switchHtmlTagClass('transportationCategoryPanel', 'show', 'hide');
		
		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'hide', 'show');
		
		$("#agentcommission").attr("disabled",true);
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_CREDIT);
		
		setDefaultPodRequired(WAYBILL_TYPE_CREDIT);
		removePassenger();
		removeDoorDelivery();
		disableSpecificChargesOnTBB();

		$("#DisplayWayBillTypeForManual").css('background','#52AEC6');
		validateDateDestOvernitecarrier();
		showCurrentDateInManualWayBill();
	
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			addMultipleEwayBillNo();
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
		
		changeSTPaidByForPartyExemptedOnLRType($('#cnorExempted_' + $('#billingPartyId').val()).val());
		
		if(configuration.taxCalculationBasedOnGSTSelection == 'true' && configuration.taxCalculationBasedOnGSTSelectionForTBB == 'true')
			switchHtmlTagClass('gstSelectionDiv', 'show', 'hide');
	} else if(selectWayBillType == WAYBILL_TYPE_FOC  && !isReserveBookingChecked) {
		if(configuration.lrTypeWiseAmountInDecimal == 'true')
			setBookingCharges(WAYBILL_TYPE_FOC);
		
		selectWayBillType = 'F10';
		value = 'FOC';
		displayWbType.className = 'focWayBill';
		disableDiv('leftTD',true);
		$('#wayBillType').val(WAYBILL_TYPE_FOC);
		setDefaultSTPaidBy(WAYBILL_TYPE_FOC);
		
		hidePaymentTypeandDetails();
		switchHtmlTagClass('BillingPartyDetailsConsignor', 'hide', 'show');
		switchHtmlTagClass('BillingGstn', 'hide', 'show');
		switchHtmlTagClass('transportationCategoryPanel', 'hide', 'show');
		enableDisableInputField('fixAmount', 'true');
		switchHtmlTagClass('billingbranchpanel', 'hide', 'show');
		setBillingBranch(WAYBILL_TYPE_FOC);
		switchHtmlTagClass('createInvoicePanel', 'hide', 'show');
		$('#panNumber').val('');

		if(jsondata.ALLOW_ADD_UPDATE_PARTY_BUTTON_ON_BOOKING)
			switchHtmlTagClass('addUpdateConsignorPartyGstnModal', 'show', 'hide');
		
		if(typeof changeOnChargeType != 'undefined') changeOnChargeType();
		
		resetCharges();
		$("#agentcommission").attr("disabled",true);
		$("#qtyAmount").attr("disabled",true);
		
		if(configuration.wayBillTypeAndDestinationBranchWiseBooking == 'true' && Number($('#destinationBranchId').val()) > 0)
			checkWayBillTypeAndDestinationBranchWiseBooking();
		
		showLRTypeWiseBookingAmountToGroupAdmin(WAYBILL_TYPE_FOC);
		
		setDefaultPodRequired(WAYBILL_TYPE_FOC);
		
		removePassenger();
		removeDoorDelivery();
		
		$("#DisplayWayBillTypeForManual").css('background','#2CAE54');
		validateDateDestOvernitecarrier();
		showCurrentDateInManualWayBill();
	
		if(configuration.showEwaybillPopUpOnLoad == 'true') {
			addMultipleEwayBillNo();
			checkBoxArray		= new Array();
			eWayBillNumberArray	= new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$("#noEwaybillMsg").addClass('hide');
		}
	} else {
		$("#WBTypeManual").val($('#wayBillType').val());
		showMessage('error', iconForErrMsg + ' You can not book "Paid" or "FOC" LR for reserved!');
		return;
	}
	
	doNotAllowTBBPartyForConsignorAndConsigneeInPaidAndToPayBooking(isConsignorTBBParty, isConsigneeTBBParty);
	
	if(configuration.autoConvertWaybillTypeToTBBForTBBParty == 'true' && $('#wayBillType').val() != WAYBILL_TYPE_CREDIT) {
		if(isConsignorTBBParty) resetConsignor();
		if(isConsigneeTBBParty) resetConsignee();
	}
	
	if(tdsConfiguration.IsTdsAllow) {
		if($('#wayBillType').val() == WAYBILL_TYPE_PAID){
			$('#isTdsRequired').show();
			setTDSChargeInPercent();
		} else
			$('#isTdsRequired').hide();
	}
	
	if(LRTypeChargeIdHMToShowCharge) {
		for(var key in LRTypeChargeIdHMToShowCharge) {
			var lrTypeList	= LRTypeChargeIdHMToShowCharge[key];
			
			if(isValueExistInArray(lrTypeList, $('#wayBillType').val()))
				showCharge(key);
			else
				hideCharge(key);
		}
	}
	
	setDefaultRiskAllocation();
	setDefaultBranchServiceType();
	
	if(configuration.isSmsRequiredFeildChecked == 'true')
		$('#smsRequired').attr('checked', true);
		
	if(configuration.taxCalculationBasedOnGSTSelection == 'true')
		resetGSTTaxes(defaultTaxValue);
	
	if(typeof getBranchCommission != 'undefined' && configuration.showExcludeCommissionOption == 'true')
		getBranchCommission($('#destinationBranchId').val());
		
	resetDataOnWayBillType(selectWayBillType);
	resetBookingTypeByWayBillType(selectWayBillType);
	setCompanyWiseTaxes(0);
	
	lrType.innerHTML = value + " (MANUAL)";
	
	if(configuration.ExecutiveBranchWiseManualRangeSequenceCounter == 'true' || ($('#SequenceTypeSelection').val() == 2 && configuration.executiveBranchWiseOnlyManualRangeSequenceCounter == 'true'))
		setManualSequenceRange();
	
	if(configuration.showTransportationCategory == 'true')
		changeGstRatesOnTransportCategory();
		
	setDefaultDeliveryToOnWayBillType();
	
	if(configuration.lrTypeWiseAmountInDecimal == 'true')
		initialiseFocus();
	
	showTBBPartyNameInConsignor();
	resetSpecificCharges();
	
	setTimeout(function(){
		//done for kcpl to set default builty charge
		setBuiltyAndFreightCharge();//WayBillSetReset.js
	}, 100);
	
	$('#cftRate').val("0");
	CFTValue = 0;
	
	if(configuration.showTaxType == 'true') setTaxTypePartyWise();
	
	if(isTokenWayBill)
		resetDataForTokenBooking();
	
	/*
		Setting Prepaid Recharge Amount LR Type Wise
	*/
	setRechargeAmount(Number($('#wayBillType').val()));
	
	showDropDownAtWayBillTypeFoc();
	isInsuranceServiceAllow	= isLrTypeWiseInsuranceService(selectWayBillType);
	
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
	if (isAutoSequenceCounter) {
		if(numberInfo.NextWaybillNumber != null)
			$('#lrnumber').html(' Next LR No : '+ numberInfo.NextWaybillNumberBranchCode + '/' + numberInfo.NextWaybillNumber);
	}else if(configuration.isAllowDefaultLengthForManualLR == 'true')
			document.getElementById('lrNumberManual').maxLength = configuration.allowedDefaultLengthForManualLR;
	 else if (configuration.manualLrNoWithMonth == 'true') {
		let currentDate = new Date(); 
		let currentMonth = currentDate.getMonth() + 1;
		document.getElementById('lrNumberManual').maxLength = configuration.allowedLenghtForManualLR;
		$('#branhCode').val(loggedInBranch.branchCode + '/' + currentMonth + '/'); 
	} else if (configuration.LRNumberManual == 'true' && !isAutoSequenceCounter) {
		$('#branhCode').val(numberInfo.branchCode + '/');
		
		if (configuration.isAllowAutoSequenceInManualInAuto == 'true' && configuration.showNextLRNumberInManualLrField == 'true') {
			setValueToHtmlTag('lrnumber', ' Next LR No : ' + numberInfo.NextWaybillNumber);
			
			if ($('#lrNumberManual').exists())
				$('#lrNumberManual').val(Number(numberInfo.NextWaybillNumber));
		}	
		
		if(configuration.hideManualLRNumberInAutoSelection == 'true'){
			$('#lrnumber').html(' Next LR No : '+ numberInfo.NextWaybillNumberBranchCode + '/' + numberInfo.NextWaybillNumber);
		}
		
		if(configuration.showNextLrNumberInManualAuto == 'true' && $('#SequenceTypeSelection').val() == 1)
			$('#lrnumber').html(' Next LR No : '+ numberInfo.NextWaybillNumberBranchCode + '/' + numberInfo.NextWaybillNumber);
		
	} else if(configuration.allowAutoSequenceCounterForManual == 'true') {
		$('#seqRange').hide();
		$('#lrnumber').html(' Next LR No : '+ numberInfo.NextWaybillNumberBranchCode + '/0' + numberInfo.NextWaybillNumber);
	}
}

function saveWayBill(value) {
	if(isWayBillSaved)
		return false;
	
	beforeSaveLrPopup(value);
}

function setFocusForNewLR() {
	if (jsondata.SHOW_BILL_SELECTION) {
		if(jsondata.withoutBillWIthoutPopup!=undefined && jsondata.withoutBillWIthoutPopup)
			setWithoutBillOption();
		else {
			ShowBillSelectionDialog();
			bindFocusBillSelection();
		}
	} else if(configuration.isReservedLrBookingAllow == 'true' && jsondata.ALLOW_RESERVED_LR_BOOKING)
		$('#isReservedCheck').focus();
	else if (configuration.wayBillTypeOption == 'true')
		$('#WBTypeManual').focus();
	else if (configuration.BookingType == 'true')
		$('#bookingType').focus();
	else
		$('#destination').focus();
	
	if(configuration.showEwaybillPopUpOnLoad == 'true') {
		addMultipleEwayBillNo();
		checkBoxArray		= new Array();
		eWayBillNumberArray	= new Array();
		$("#isValidEwaybillMsg").addClass('hide');
		$("#noEwaybillMsg").addClass('hide');
	}
	
	if(jsondata.withoutBillWIthoutPopup != undefined && jsondata.withoutBillWIthoutPopup)
		setWithoutBillOption();
}


function createWayBill() {
	var jsonObject		= new Object();
	
	setJsonDataforCreateWayBill(jsonObject);

	jsonObject.filter		= 2;
	jsonObject.isDummyLR	= false;
	jsonObject.partySequenceExists	= partySequenceExists;
	jsonObject.isTransporter		= isTransporter;

	var jsonStr = JSON.stringify(jsonObject);
	
	var extraDataForPrint	= getExtraDataForPrint();
	
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
					pervwayBillId			= data.waybillId;
					billIdForInvoicePrint 	= data.billId
					token					= data.token;
					previsRePrint			= data.isRePrint;
					lrPrintLink				= data.lrPrintLink;
					lrPrintLinkConfig		= data.lrPrintLinkConfig;
					appendLrSuccess			= data.appendLrSuccess;
					
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
						jsonObjectNew.id			= pervwayBillId;
						jsonObjectNew.moduleId		= BOOKING;
						
						saveInvoiceDocument(jsonObjectNew);
						
						$('#photoContainer :input').each(function () {
							$(this).val(''); // Reset the value of each input
						});
					}
					
					setRePrintOption(data, pervwayBillId);
					
					if(!data.displayReprintOptionInManual)
						$('#reprint').addClass('hide');
					
					if(isAllowToEnterIDProof)
						saveIDProofDetails(data);
					
					if(data.isWSLRPrintNeeded && data.isLRPrintAllow) {
						jsonObject.accountGroupId	= accountGroupId;
						var printObj	= Object.assign(jsonObject, extraDataForPrint, data.objectOut);
						
						localStorage.setItem("wayBillId", pervwayBillId);
						localStorage.setItem("lrDataPrint", JSON.stringify(printObj));
					}

					if(data.isLRPrintAllow && configuration.groupSpecificManualLSModule == 'false') {
						if(data.displayReprintOptionInManual) $('#reprint').removeClass('hide');
						reprintWindow(previsRePrint);
					}
					
					if (jsondata.SHOW_BILL_SELECTION)
						setFocusOnBillSelection();
									
					resetAllData();
					
					setWayBillNumber(data);
					setDefaultPodRequired(data.wayBillTypeId);
					enableButton();
					setFocusForNewLR();
					setDefaultDateOnManual();
					setRechargeAmount(data.wayBillTypeId);
					setPrepaidAmountOnWaybillTypeChng();
					
					//$('#bookingType').focus();
					if(configuration.isSmsRequiredFeildChecked == 'true')
						document.getElementById("smsRequired").checked = true;
					
					if(appendLrSuccess != undefined && appendLrSuccess) {
						$('#lrCountInLS').html(Number($('#lrCountInLS').html()) + 1);
						
						if(Number($('#lrCountInLS').html()) == 20)
							alert('20 LRs has been added, Are you sure to add more ?');
						else if(Number($('#lrCountInLS').html()) == 40)
							alert('40 LRs has been added, Are you sure to add more ?');
						else if(Number($('#lrCountInLS').html()) == 60)
							alert('60 LRs has been added, Are you sure to add more ?');
						else if(Number($('#lrCountInLS').html()) == 80)
							alert('80 LRs has been added, Are you sure to add more ?');
						else if(Number($('#lrCountInLS').html()) == 100) {
							$('#isManualLS').attr('checked', false);
							changeOnLSNumberCheckbox(false);
							alert('100 LRs has been added, Sorry you cannot add more LRs ?');
						}
					}
				}
				
				hideLayer();
			});
	}
}

function checkPermissionToBookLr() {
	return validateAndSetWayBillType();
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function showCurrentDateInManualWayBill(){
	if(configuration.showCurrentDateInManualWayBill == 'true' || configuration.showCurrentDateInManualWayBill == true){
		var currentDate 			= new Date(curDate);
		var dd = String(currentDate.getDate()).padStart(2, '0');
		var mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = currentDate.getFullYear();
		$('#lrDateManual').val(dd + '-' + mm + '-' + yyyy);
	}
}

function setPrepaidAmountOnWaybillTypeChng() {
	if(configuration.allowPrepaidAmount == 'true') {
		$( "#WBTypeManual" ).change(function() {
			setRechargeAmount($( "#WBTypeManual" ).val());
		});
	}
}

function validateAndSetWayBillType() {
	const firstParam = configuration.DefaultWayBillTypeForManual;

	const permissionMap = {
		[WAYBILL_TYPE_PAID]: isPaidBookingPermission,
		[WAYBILL_TYPE_TO_PAY]: isTopayBookingPermission,
		[WAYBILL_TYPE_CREDIT]: isTbbBookingPermission,
		[WAYBILL_TYPE_FOC]: isFocBookingPermission
	};

	// If current type is allowed → nothing to change
	if (permissionMap[firstParam]) {
		return true;
	}

	// Fallback priority order (same as your original logic)
	const fallbackOrder = {
		[WAYBILL_TYPE_PAID]: [
			WAYBILL_TYPE_TO_PAY,
			WAYBILL_TYPE_CREDIT,
			WAYBILL_TYPE_FOC
		],
		[WAYBILL_TYPE_TO_PAY]: [
			WAYBILL_TYPE_PAID,
			WAYBILL_TYPE_CREDIT,
			WAYBILL_TYPE_FOC
		],
		[WAYBILL_TYPE_CREDIT]: [
			WAYBILL_TYPE_TO_PAY,
			WAYBILL_TYPE_PAID,
			WAYBILL_TYPE_FOC
		],
		[WAYBILL_TYPE_FOC]: [
			WAYBILL_TYPE_TO_PAY,
			WAYBILL_TYPE_CREDIT,
			WAYBILL_TYPE_PAID
		]
	};

	const nextAllowedType = fallbackOrder[firstParam].find(type => permissionMap[type]);

	if (!nextAllowedType) {
		handleNoPermission();
		return false;
	}

	configuration.DefaultWayBillTypeForManual = nextAllowedType;
	return true;
}