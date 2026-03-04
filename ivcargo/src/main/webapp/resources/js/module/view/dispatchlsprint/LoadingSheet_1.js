define([], function(){	
	var
	summeryObject				= new Object();
	totalArticleQtyForPAID		= 0, // For Summary Table
	totalArticleQtyForTOPAY		= 0, // For Summary Table
	totalArticleQtyForFOC		= 0, // For Summary Table
	totalArticleQtyForCREDIT	= 0, // For Summary Table
	
	totalFreightForPAID			= 0, // For Summary Table
	totalFreightForTOPAY		= 0, // For Summary Table
	totalFreightForCREDIT		= 0, // For Summary Table
	
	totalLoadingForPAID			= 0, // For Summary Table
	totalLoadingForTOPAY		= 0, // For Summary Table
	totalLoadingForCREDIT		= 0, // For Summary Table
	
	totalReceiptChargeForPAID	= 0, // For Summary Table
	totalReceiptChargeForTOPAY	= 0, // For Summary Table
	totalReceiptChargeForCREDIT	= 0, // For Summary Table
	
	totalAmountWithoutHamaliForPAID	  = 0, // For Summary Table
	totalAmountWithoutHamaliForCREDIT = 0, // For Summary Table
	
	totalCollectionChargeForPAID	= 0, // For Summary Table
	totalCollectionChargeForTOPAY	= 0, // For Summary Table
	totalCollectionChargeForCREDIT	= 0, // For Summary Table
	
	totalServiceTaxForPAID		= 0;
	totalServiceTaxForTOPAY		= 0, // For Summary Table
	totalServiceTaxForCREDIT	= 0;

	totalAmountForPAID			= 0, // For Summary Table
	totalAmountForTOPAY			= 0, // For Summary Table
	totalAmountForCREDIT		= 0, // For Summary Table

	totalOtherAmountForPAID		= 0, // For Summary Table
	totalOtherAmountForTOPAY	= 0, // For Summary Table
	totalOtherAmountForCREDIT	= 0, // For Summary Table
	
	totalFOVAmountForPAID		= 0, // For Summary Table
	totalFOVAmountForTOPAY		= 0, // For Summary Table
	totalFOVAmountForCREDIT		= 0, // For Summary Table
	
	totalStationaryAmountForPAID	= 0,
	totalStationaryAmountForTOPAY	= 0,
	totalStationaryAmountForCREDIT	= 0,
	
	totalHamaliAmountForPAID	= 0,
	totalHamaliAmountForTOPAY	= 0,
	totalHamaliAmountForCREDIT	= 0,
	
	totalTollAmountForPAID		= 0,
	totalTollAmountForTOPAY		= 0,
	totalTollAmountForCREDIT	= 0,
	
	totalDoorCollectionAmountForPAID	= 0,
	totalDoorCollectionAmountForTOPAY	= 0,
	totalDoorCollectionAmountForCREDIT	= 0,
	
	totalDoorDeliveryAmountForPAID		= 0,
	totalDoorDeliveryAmountForTOPAY		= 0,
	totalDoorDeliveryAmountForCREDIT	= 0,
	
	totalSmsAmountForPAID	= 0,
	totalSmsAmountForTOPAY	= 0,
	totalSmsAmountForCREDIT	= 0,
	
	totalActualWeightForPAID			= 0,
	totalActualWeightForNmlPAID			= 0,
	totalActualWeightForPAIDRoundOff	= 0;
	totalActualWeightForTOPAY			= 0,
	totalActualWeightForNmlTOPAY		= 0,
	totalActualWeightForTOPAYRoundOff	= 0;
	totalActualWeightForFOC				= 0,
	totalActualWeightForNmlFOC			= 0,
	totalActualWeightForFOCRoundOff		= 0,
	totalActualWeightForCREDIT			= 0,
	totalActualWeightForNmlCREDIT		= 0,
	totalActualWeightForCREDITRoundOff	= 0;
	totalChargeWeightForPAID			= 0,
	totalChargeWeightForTOPAY			= 0,
	totalChargeWeightForFOC				= 0,
	totalChargeWeightForCREDIT			= 0,
	
	totalOtherAmount1ForPAID	= 0, // For Summary Table
	totalOtherAmount1ForTOPAY	= 0, // For Summary Table
	totalOtherAmount1ForCREDIT	= 0, // For Summary Table
	
	totalDoorPickupAmountForPAID	= 0,// For Summary Table
	totalDoorPickupAmountForTOPAY	= 0,// For Summary Table
	totalDoorPickupAmountForCREDIT	= 0,// For Summary Table
	
	totalOtherAmountAptcForPAID		= 0,// For Summary Table
	totalOtherAmountAptcForTOPAY	= 0,// For Summary Table
	totalOtherAmountAptcForCREDIT	= 0,// For Summary Table
	
	totalAdvancePaidAptcForPAID		= 0,// For Summary Table
	totalAdvancePaidAptcForTOPAY	= 0,// For Summary Table
	totalAdvancePaidAptcForCREDIT	= 0,// For Summary Table
	
	totalBalanceAmountAptcForPAID	= 0,// For Summary Table
	totalBalanceAmountAptcForTOPAY	= 0,// For Summary Table
	totalBalanceAmountAptcForCREDIT	= 0,// For Summary Table
	
	totalCartageAmountForPAID		= 0,// For Summary Table
	totalCartageAmountForTOPAY		= 0,// For Summary Table
	totalCartageAmountForCREDIT		= 0,// For Summary Table
	
	totalCodAmountForPAID			= 0,// For Summary Table
	totalCodAmountForTOPAY			= 0,// For Summary Table
	totalCodAmountForCREDIT			= 0,// For Summary Table
	
	totalDocketAmountForPAID		= 0,// For Summary Table
	totalDocketAmountForTOPAY		= 0,// For Summary Table
	totalDocketAmountForCREDIT		= 0,// For Summary Table
	
	totalLrChargeAmountForPAID		= 0,//For Summary Table
	totalLrChargeAmountForTOPAY		= 0,//For Summary Table
	totalLrChargeAmountForCREDIT	= 0,//For Summary Table
	
	totalCrossingChargeAmountForPAID	= 0,//For Summary Table
	totalCrossingChargeAmountForTOPAY	= 0,//For Summary Table
	totalCrossingChargeAmountForCREDIT	= 0,//For Summary Table
	
	totalUnloadingForPAID			= 0,//For Summary Table
	totalUnloadingForTOPAY			= 0,//For Summary Table
	totaltotalUnloadingForCREDIT	= 0,//For Summary Table
	
	totalHandlingChargeForPAID		= 0,//For Summary Table
	totalHandlingChargeForTOPAY		= 0,//For Summary Table
	totalHandlingChargeForCREDIT	= 0,//For Summary Table
	
	totalStaticalChargeForPAID		= 0,//For Summary Table
	totalStaticalChargeForTOPAY		= 0,//For Summary Table
	totalStaticalChargeForCREDIT	= 0,//For Summary Table
	
	totalTollGateChargeForPAID		= 0,//For Summary Table
	totalTollGateChargeForTOPAY		= 0,//For Summary Table
	totalTollGateChargeForCREDIT	= 0,//For Summary Table
	
	totalCantonmentChargeForPAID		= 0,//For Summary Table
	totalCantonmentChargeForTOPAY		= 0,//For Summary Table
	totalCantonmentChargeForCREDIT		= 0,//For Summary Table
	
	totalWeightBridgeChargeForPAID		= 0,//For Summary Table
	totalWeightBridgeChargeForTOPAY		= 0,//For Summary Table
	totalWeightBridgeChargeForCREDIT	= 0,//For Summary Table
	
	totalUnldingForPAID		= 0,//For Summary Table
	totalUnldingForTOPAY	= 0,//For Summary Table
	totalUnldingForCREDIT	= 0,//For Summary Table
	
	totalTotalForPAID	= 0,//For Summary Table
	totalTotalForTOPAY	= 0,//For Summary Table
	totalTotalForCREDIT	= 0,//For Summary Table
	
	totalGrandTotalForPAID	= 0,//For Summary Table
	totalGrandTotalForTOPAY	= 0,//For Summary Table
	totalGrandTotalForCREDIT	= 0,//For Summary Table
	
	totalWayBillCodVppAmountForPAID	  = 0,// For Summary Table
	totalWayBillCodVppAmountForTOPAY  = 0,// For Summary Table
	totalWayBillCodVppAmountForCREDIT = 0,// For Summary Table
	
	totalDoorDeliveryForPAID	 = 0,
	totalDoorDeliveryForTOPAY	 = 0,
	totalDoorDeliveryForCREDIT	 = 0,
	
	totalSTChargeForPAID	 = 0,
	totalSTChargeForTOPAY	 = 0,
	totalSTChargeForCREDIT	 = 0,
	
	totalTempoBhadaBookingForPAID	 = 0,
	totalTempoBhadaBookingForTOPAY	 = 0,
	totalTempoBhadaBookingForCREDIT	 = 0,
	
	totalCrossingHireForPAID	 = 0,
	totalCrossingHireForTOPAY	 = 0,
	totalCrossingHireForCREDIT	 = 0,
			
	totallrCountForPAID		= 0,
	totallrCountForTOPAY	= 0,
	totallrCountForFOC		= 0,
	totallrCountForCREDIT	= 0,
	
	totalWayBillDiscountForPAID		= 0,
	totalWayBillDiscountForTOPAY	= 0,
	totalWayBillDiscountForCREDIT	= 0,
	
	lrDetailsTotalActualWeightForPAID	= 0,
	lrDetailsTotalActualWeightForTOPAY	= 0,
	lrDetailsTotalActualWeightForFOC	= 0,
	lrDetailsTotalActualWeightForCREDIT = 0,
	
	lrDetailsTotalActualWeightForNmlPAID	= 0,
	lrDetailsTotalActualWeightForNmlTOPAY	= 0,
	lrDetailsTotalActualWeightForNmlFOC		= 0,
	lrDetailsTotalActualWeightForNmlCREDIT	= 0,
	
	lrDetailsTotalArticleQtyForPAID		= 0,
	lrDetailsTotalArticleQtyForTOPAY	= 0,
	lrDetailsTotalArticleQtyForFOC		= 0,
	lrDetailsTotalArticleQtyForCREDIT	= 0,
	
	totalPickupChargeAmountForPAID			= 0,
	totalPickupChargeAmountForTOPAY			= 0,
	totalPickupChargeAmountForCREDIT		= 0,
	
	totalPaidHamaliAmountForPAID			= 0,
	totalPaidHamaliAmountForTOPAY			= 0,
	totalPaidHamaliAmountForCREDIT			= 0,
	
	totalIandSAmountForPAID					 = 0,
	totalIandSAmountForTOPAY				 = 0,
	totalIandSAmountForCREDIT				 = 0,
	
	totalDCChargeAmountForPAID			= 0;
	totalDCChargeAmountForTOPAY			= 0;
	totalDCChargeAmountForCREDIT		= 0;
	
	totalDDChargeAmountForPAID			= 0;
	totalDDChargeAmountForTOPAY			= 0;
	totalDDChargeAmountForCREDIT		= 0;
	
	totalUnloadingAmtForPAID	= 0,//For Summary Table
	totalUnloadingAmtForTOPAY	= 0,//For Summary Table
	totalUnloadingAmtForCREDIT	= 0,//For Summary Table
	
	totalSurChargeAmtForPAID	= 0,//For Summary Table
	totalSurChargeAmtForTOPAY	= 0,//For Summary Table
	totalSurChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalArtChargeAmtForPAID	= 0,//For Summary Table
	totalArtChargeAmtForTOPAY	= 0,//For Summary Table
	totalArtChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalWithPassChargeAmtForPAID	= 0,//For Summary Table
	totalWithPassChargeAmtForTOPAY	= 0,//For Summary Table
	totalWithPassChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalLucChargeAmtForPAID	= 0,//For Summary Table
	totalLucChargeAmtForTOPAY	= 0,//For Summary Table
	totalLucChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalVscChargeAmtForPAID	= 0,//For Summary Table
	totalVscChargeAmtForTOPAY	= 0,//For Summary Table
	totalVscChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalDoorBookChargeAmtForPAID	= 0,//For Summary Table
	totalDoorBookChargeAmtForTOPAY	= 0,//For Summary Table
	totalDoorBookChargeAmtForCREDIT	= 0,//For Summary Table
	
	totalBuiltyForPAID			= 0, // For Summary Table
	totalBuiltyForTOPAY			= 0, // For Summary Table
	totalBuiltyForCREDIT		= 0, // For Summary Table
	
	totalHCChargeForPAID		= 0, // For Summary Table
	totalHCChargeForTOPAY		= 0, // For Summary Table
	totalHCChargeForCREDIT		= 0, // For Summary Table
	
	totalToPayHamaliForPAID		= 0, // For Summary Table
	totalToPayHamaliForTOPAY	= 0, // For Summary Table
	totalToPayHamaliForCREDIT	= 0, // For Summary Table
		
	totalDCChargeAmountForPAID			= 0; // For Summary Table
	totalDCChargeAmountForTOPAY			= 0; // For Summary Table
	totalDCChargeAmountForCREDIT		= 0; // For Summary Table
	
	totalDDChargeAmountForPAID			= 0; // For Summary Table
	totalDDChargeAmountForTOPAY			= 0; // For Summary Table
	totalDDChargeAmountForCREDIT		= 0; // For Summary Table
	
	totalDBCChargeAmountForPAID		= 0; // For Summary Table
	totalDBCChargeAmountForTOPAY		= 0; // For Summary Table
	totalDBCChargeAmountForCREDIT		= 0; // For Summary Table
	
	totalDDCChargeAmountForPAID		= 0; // For Summary Table
	totalDDCChargeAmountForTOPAY	= 0; // For Summary Table
	totalDDCChargeAmountForCREDIT		= 0; // For Summary Table
	
	totalCommissionOnPaidFreight		= 0; // For Branch Commission Calculation
	totalCommissionOnToPayFreight		= 0; // For Branch Commission Calculation
	totalCommissionOnTBBFreight			= 0; // For Branch Commission Calculation
	
	totalEwayBillCountForPAID		= 0; // For Summary Table
	totalEwayBillCountForTOPAY		= 0; // For Summary Table
	totalEwayBillCountForCREDIT		= 0; // For Summary Table
	totalEwayBillCountForFOC		= 0; // For Summary Table
	
	totalBookingTotalForPAID		= 0; // For Summary Table
	totalBookingTotalForTOPAY		= 0; // For Summary Table
	totalBookingTotalForCREDIT		= 0; // For Summary Table
	totalBookingTotalForFOC			= 0; // For Summary Table
	
	totalCrossingLrActualWeightForPAID = 0;
	totalCrossingLrActualWeightForTOPAY = 0;
	totalCrossingLrActualWeightForCREDIT = 0;
	totalCrossingLrActualWeightForFOC = 0;

	agentCommissionOnPaidFreight		= 0;
	agentCommissionOnTopayFreight		= 0;

	WAYBILL_TYPE_PAID_STRING	= "Paid", // Constant For LR Type
	WAYBILL_TYPE_TOPAY_STRING	= "To Pay", // Constant For LR Type
	WAYBILL_TYPE_FOC_STRING		= "FOC", // Constant For LR Type
	WAYBILL_TYPE_CREDIT_STRING	= "TBB", // Constant For LR Type
	LR_CATEGORY					= "lrCategory",
	columnObjectForDetails	= "",
	columnObjectForDataTableDetails = "",
	pageCounter	= 1,
	srNumber = "",
	lrNumber = "",
	lrSourceBranch = "",
	lrDestinationBranch = "",
	consignor = "",
	consignorFullName = "",
	consignee = "",
	consigneeFullName = "",
	consigneeNameWithMob = "",
	consigneeContact = "",
	packingTypeMasterName = "",
	packingTypeCommaSeperated  = "",
	lrType = "",
	bookingDate = "",
	consignmentPackingDetails = 0, // For PageWise Summary
	consignmentPackingDetails1 = 0, // For PageWise Summary
	consignmentPackingDetails2 = 0,// For PageWise Summary
	freightCharge	= 0, // For PageWise Summary
	toPayTotalPageWiseFreightCharge	= 0, // For PageWise Summary
	actualWeight	= 0, // For PageWise Summary
	deliveryCommissionRate	= 0,
	deliveryCommission	= 0,
	newDeliveryCommission	= 0,
	deliveryCommissionOnToPay	= 0,
	deliveryCommissionOnToPayRate	= 0,
	chargeWeight	= 0, // For PageWise Summary
	advancePaid	= 0, // For PageWise Summary
	balanceAmount	= 0, // For PageWise Summary
	loadingCharge	= 0, // For PageWise Summary
	loadingChargeRT	= 0, // For PageWise Summary
	loadingChargeformls	= 0, // For PageWise Summary
	amount	= 0, // For PageWise Summary
	amountWithoutTbb	= 0, // For PageWise Summary
	fov						= 0, // For PageWise Summary
	other					= 0, // For PageWise Summary
	otherAmount				= 0,
	otherAmountMgt			= 0,
	otherChargeOPs			= 0,
	totalArticle			= 0,
	otherAmountAptc			= 0,
	stationaryCharge		= 0,
	hamaliCharge			= 0,
	ddCharge				= 0,
	srsHamaliCharge			= 0,
	tollCharge				= 0,
	doorCollectionCharge	= 0,
	doorDeliveryCharge		= 0,
	doorPickupCharge		= 0,
	artCharge				= 0,
	smsCharge				= 0,
	serviceTax				= 0,
	wayBillDiscount			= 0,
	destWisePayableAmount		= 0,
	payableAmountCommissionWise	= 0,
	payableDetail	= '',
	payableDetailOthers	= '',
	payableAmountCommissionWiseOthers	= 0,
	bkgTotal	= 0,
	pickupCharge = 0,
	toPayHmali = 0,
	lrCharge = 0,
	pfCharge = 0,
	tempoBhadaBooking = 0,
	crossingHire = 0,
	totalWithoutHamali = 0,
	topayHamali = 0,
	iandSCharge				= 0,
	totalTopay	= 0,
	toPayFreight	= 0, // For PageWise Summary
	fullToPayFreight	= 0, // For PageWise Summary
	paidAndToPayTotalForGTM	= 0,
	paidFreight		= 0, // For PageWise Summary
	tbbFright		= 0, // For PageWise Summary
	noOfLr			= 0, 
	partyTINNo		= 0,
	lorryHireAdvance = 0,
	wayBillDocCharge			= 0,
	wayBillInsurance			= 0,
	crossingHireAmt				= 0,
	payableAmount				= 0,
	receivableAmount			= 0,
	declaredValue				= 0.0,
	bookingCommission			= 0,
	cartageAmount				= 0,
	handlingCharge				= 0,
	paidAmount					= 0,
	topayAmount					= 0,
	tbbAmount					= 0,
	lrCharge					= 0,
	crossingCharge				= 0,
	unloadingAmount				= 0,
	DocketAmount				= 0,
	stCharge					= 0,
	total						= 0,
	grandTotalSks				= 0,
	totalcrossingHireAmtTopay	= 0,
	bookingCommissionRate		= 0,
	newBookingCommission		= 0,
	DDC							= 0,
	deliveryDDCCommission		= 0,
	bookingCommission			= 0,
	otherCharge					= 0,
	doorDeliveryCharge			= 0,
	vehicleCommission			= 0,
	lc							= 0,
	csCharge					= 0,
	totalServiceCharge			= 0,
	otherChargeForKavi			= 0,
	paidFreightChargeWithDD		= 0,
	toPayFreightChargeWithDD	= 0,
	tbbFreightChargeWithDD		= 0,
	totalPaidLr				= 0,
	totalToPayLr			= 0,
	totalFocLr				= 0,
	totalTbbLr				= 0,
	totalPaidDoorDly		= 0,
	totalToPayDoorDly		= 0,
	totalTbbDoorDly			= 0,
	totalFocDoorDly			= 0,
	toPayHamali				= 0,
	totalDirectFreightForPAID		= 0,
	totalConnectingFreightForPAID	= 0,
	totalDirectFreightForTOPAY		= 0,
	totalConnectingFreightForTOPAY = 0,
	totalDirectFreightForCREDIT		= 0,
	totalConnectingFreightForCREDIT	= 0,
	totalDirectFreightForFOC		= 0,
	totalConnectingFreightForFOC	= 0,
	totalKantAmt					= 0,
	CodAmount						= 0,
	wayBillCodVppAmount				= 0,
	totalFreightForPAIDSTL			= 0,
	totalFreightForTOPAYSTL			= 0,
	totalFreightForCREDITSTL		= 0,
	totalFreightForStl				= 0,
	totalFreightForFOCSTL			= 0,
	totalSTL						= 0,
	lrChargeSTL						= 0,
	numberOfLr						= 0,
	commissionPecentage				= false;
	commisionforStl					= 0;
	crossingCommision				= 0;
	crossingHireshiv				= 0;
	wayBillBuiltyAmount				= 0;
	showTbbForGroupAdmin  			= false;
	PaidTopayTBBtotalAmount			= 0;	
	var _this = "";
	
	return {
		getConfiguration : function(flaverNo, isCrossingLS, crossingAgentId) {
			_this	= this;
			var josnObject = new Object();
			josnObject.loadingSheet_default		= 'text!/ivcargo/html/print/dispatch/LoadingSheet_56.html';
			
			var dispatchLSPrintFlavor			= flaverNo.charAt(0).toUpperCase() + flaverNo.slice(1);
		
			if(flaverNo != 'loadingSheet_default')
				josnObject[flaverNo]			= 'text!/ivcargo/html/print/dispatch/' + dispatchLSPrintFlavor + '.html';
			
			if(isCrossingLS && crossingAgentId > 0)
				josnObject.loadingSheet_16		= 'text!/ivcargo/html/print/dispatch/LoadingSheet_270.html';
				
			josnObject.LsPrintConfiguration_2	= 'text!/ivcargo/html/print/dispatch/' + flaverNo + '.html';
			josnObject.loadingSheet_Laser_341	= 'text!/ivcargo/html/print/dispatch/loadingSheet_Laser_341.html';
			josnObject.lsCommission_554			= 'text!/ivcargo/html/print/dispatch/lsCommission_554.html';
			josnObject.lsCommission_default		= 'text!/ivcargo/html/print/dispatch/lsCommission_default.html';
			josnObject.lsCommission_557			= 'text!/ivcargo/html/print/dispatch/lsCommission_557.html';
			/*
				Do not write anything here
				flavour name format -> loadingSheet_accountGroupId
				html file name format	-> LoadingSheet_accountGroupId.html
			*/
			return josnObject[flaverNo];
		}, getFilePathForLabel : function(flaverNo) {
			let josnObject = new Object();
			
			if(urlExists('/ivcargo/resources/js/module/print/lsprint/' + flaverNo + '_FilePath.js'))
				josnObject[flaverNo]	= '/ivcargo/resources/js/module/print/lsprint/' + flaverNo + '_FilePath.js';
			else
				josnObject[flaverNo]	= '/ivcargo/resources/js/module/print/lsprint/loadingSheetPrint_FilePath.js';
			
			/*
				Do not write anything here
				engb file name format -> loadingsheet_accountGroupId-en-GB.txt
			*/
			return josnObject[flaverNo];
		}, setHeadersForPrint : function(headerData, response, pageNumber, dispatchLSPrintModel) {
			var flavorConfiguration				= response.FlavorConfiguration;

			vehicleCommission	= dispatchLSPrintModel.vehicleCommission;
			
			let keyAdd		= Object.keys(response.PrintHeaderModel);
			let print_Model = null;
			
			lrNumber = "TOTAL";
			
			for (const element of keyAdd) {
				print_Model	= response.PrintHeaderModel[element];
				break;
			}
				
			//for Renukaaa
			if(print_Model.accountGroupPhoneNo != null && print_Model.accountGroupPhoneNo != undefined)
				$("[data-phnumber='phnumber']").html(print_Model.accountGroupPhoneNo);
				  
			if(print_Model.branchContactDetailEmailAddress != null && print_Model.branchContactDetailEmailAddress != undefined)
				$("[data-email='emailr']").html(print_Model.branchContactDetailEmailAddress); 
			
			var pageNo = Number(pageNumber) + Number(1);
			
			if(flavorConfiguration.removeHeaderInPrint) {
/*				$('.header').empty();
				$('.header').css("margin-top",headerTopMargin);*/
				$('.header').css("padding-top", flavorConfiguration.headerTopMargin);
				$("[data-group]").html('&nbsp;');
				$("h4").empty();
				$('.header').addClass("page-break");
				$( ".header" ).first().removeClass("page-break");
				pageCounter++;
			} else {
				if(flavorConfiguration.customGroupLogoAllowed) {
					if(headerData.imagePath != undefined && headerData.imagePath != null && headerData.imagePath != 'null') {
						$(".header").css('height','130px');
						$("#imgSrc").attr('src', headerData.imagePath);
						$("#imgSrc").css('width','100%');
						$("#imgSrc").css('height','130px');
						$("*[data-group]").remove();
						$("*[data-selector='branchAddressLabel']").remove();
						$("*[data-address]").remove();
						$("[data-selector='branchPhoneNumberLabel']").remove();
						$("[data-phoneNumber]").remove();
					} else {
						$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
						$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
						$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
						$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");
						
						if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
							var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
							var zerosReg = /[1-9]/g;
							
							if(zerosReg.test(replacedString))
								$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
							else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]))
								$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
							else
								$("[data-phoneNumber]").html('');
						}
					}
				} else if(flavorConfiguration.allowLSPrintForWSWithoutBill && BOOKING_WITHOUT_BILL == dispatchLSPrintModel.lsBillSelectionId) {
					$("[data-group='name']").html('');
					$("[data-selector='branchAddressLabel']").hide();
					$("[data-address='branchAddress']").html('');
					$("[data-address]").html('');
					$("[data-cityName]").html('');
					$("[data-selector='branchPhoneNumberLabel']").hide();
					$("[data-phoneNumber='branchPhoneNumber']").html('');
					$("[data-selector='gst']").hide();
					$("[data-ls='branchGSTN']").html('');
					$('.showHeaderInWithBill').hide()
				} else {
					$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
					$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
					$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
					$("[data-cityName]").html(headerData[$("[data-cityName]").attr("data-cityName")]);
					$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");
					$('.showHeaderInWithoutBill').hide()
					if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
						var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
						var zerosReg = /[1-9]/g;
							
						if(zerosReg.test(replacedString))
							$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
						else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]))
							$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
						else
							$("[data-phoneNumber]").html('');
					}
						
					if((headerData.branchPhoneNumber) != null)
						$("[data-ls='phoneNo']").html(headerData.branchPhoneNumber + ", ");
					
					if((headerData.branchPhoneNumber2) != null)
						$("[data-ls='phoneNo2']").html(headerData.branchPhoneNumber2);
						
					if((headerData.branchMobileNumber) != null)
						$("[data-ls='mobileNo']").html(headerData.branchMobileNumber);
					
					if((headerData.branchMobileNumber2) != null)
						$("[data-ls='mobileNo2']").html(headerData.branchMobileNumber2);
						
					if((headerData.branchGSTN) != null)
						$("[data-ls='branchGSTN']").html(headerData.branchGSTN);
					
					if((headerData.branchEmail) != null)
						$("[data-ls='branchEmail']").html(headerData.branchEmail);	
				}
				
				var headerbreak	= $("[data-group='name']");
				
				if (pageCounter > 1) {
					var indexToRemove = 0;
					var numberToRemove = 1;
					headerbreak.splice(indexToRemove, numberToRemove);
					headerbreak.each(function(){					
						$(this).attr("class","page-break");
					});
				}
				
				if(!flavorConfiguration.isHeaderDisplayOnNextPage && pageNo > 1) {
					$("*[data-group]:not(:first)").remove();
					$("*[data-selector='branchAddressLabel']:not(:first)").remove();
					$("*[data-address]:not(:first)").remove();
					
					//$("[data-selector='branchAddressLabel']").remove();
					//$("[data-address]").remove();
					$("[data-selector='branchPhoneNumberLabel']:not(:first)").remove();
					$("[data-phoneNumber]:not(:first)").remove();
					$('.reportHeaderType:not(:first)').each(function(){$(this).empty()});
					$("[data-selector='dispatchNumberLabel']:not(:first)").remove();
					$("[data-info='dispatchNumber']:not(:first)").remove();
					$("[data-selector='vehicleNumberLabel']:not(:first)").remove();
					$("[data-info='vehicleNumber']:not(:first)").remove();
					$("[data-info='date']:not(:first)").remove();
					$("[data-info='time']:not(:first)").remove();
					$("[data-selector='fromBranchLabel']:not(:first)").remove();
					$("[data-info='fromBranch']:not(:first)").remove();
					$("[data-selector='toBranchLabel']:not(:first)").remove();
					$("[data-info='toBranch']:not(:first)").remove();
					$("[data-selector='billSelectioLable']:not(:first)").remove();
					$("[data-info='billSelectioTypeString']:not(:first)").remove();
					$("[data-selector='currentDateTimeLabel']:not(:first)").remove();
					$("[data-info='currentDateTime']:not(:first)").remove();
					
				}
				
				pageCounter++;
			}
			if(dispatchLSPrintModel.crossingAgentId != undefined && dispatchLSPrintModel.crossingAgentId > 0){
				$("[data-reportName]").html("Crossing Challan");
				$('.agentName').removeClass('hide');
				$("[data-info='crossingAgentName']").html(dispatchLSPrintModel.crossingAgentName);
				$("[data-info='crossingAgentPhone']").html(dispatchLSPrintModel.crossingAgentPhone);
				$("[data-info='crossingAgentGST']").html(dispatchLSPrintModel.crossingAgentGST);
				$('.chargeWeightPSR').removeClass('hide');
			} else {
				$("[data-reportName]").html("Dispatch Stock Report");
				$('.actualWeightPSR').removeClass('hide');
				$("[data-report]").html("Dispatch Stock Report");
			}
			
			if(flavorConfiguration.doNotShowBranchGSTN)
				$('#branchGSTNDetailsDiv').remove();
		}, setInformationDivs : function(infoData, response, tableData, removeAmountBranchIdsWise) {
			var flavorConfiguration				= response.FlavorConfiguration;
			var tripHisabLSDetails				= response.tripHisabLSDetails;
			var showMissingLRNumber				= response.showMissingLRNumber;
			var commaSeperatedMissingValues		= response.commaSeperatedMissingValues;
			var commision30TableforBitla		= response.commision30TableforBitla;
			var	 isRailwayBranch				= response.isRailwayBranch;
			
			if(response.lsDestBranch.branchAgentBranch == true  || response.crossingAgentId > 0 ){
				$('.hidetaxtd').removeClass('hide')
			}
			
			$("[data-selector='dispatchNumberLabel']").html($("[data-selector='dispatchNumberLabel']").attr("data-selector")+":");
			$("[data-selector='" +"Label']").html($("[data-selector='dispatchNumberLabel']").attr("data-selector")+":");
			$("[data-info='dispatchNumber']").html(infoData[$("[data-info='dispatchNumber']").attr("data-info")]);
			$("[data-info='dispatchLedgerId']").html(infoData[$("[data-info='dispatchLedgerId']").attr("data-info")]);
			$("[data-info='dispatchRoute']").html(infoData[$("[data-info='dispatchRoute']").attr("data-info")]);
			$("[data-selector='vehicleNumberLabel']").html($("[data-selector='vehicleNumberLabel']").attr("data-selector")+":");
			$("[data-info='vehicleNumber']").html(infoData[$("[data-info='vehicleNumber']").attr("data-info")]);
			$("[data-selector='dispatchDateLabel']").html($("[data-selector='dispatchDateLabel']").attr("data-selector")+":");
			$("[data-info='dispatchDate']").html(infoData[$("[data-info='dispatchDate']").attr("data-info")]);
			$("[data-info='date']").html(infoData[$("[data-info='date']").attr("data-info")]);
			$("[data-info='dayName']").html(infoData[$("[data-info='dayName']").attr("data-info")]);
			$("[data-info='time']").html(infoData[$("[data-info='time']").attr("data-info")]);
			$("[data-selector='lhpvNumberLabel']").html($("[data-selector='lhpvNumberLabel']").attr("data-selector")+":");
			$("[data-info='lhpvNumber']").html(infoData[$("[data-info='lhpvNumber']").attr("data-info")]);
			$("[data-selector='fromBranchLabel']").html($("[data-selector='fromBranchLabel']").attr("data-selector")+":");
			$("[data-selector='engineNumberLabel']").html($("[data-selector='engineNumberLabel']").attr("data-selector")+":");
			$("[data-info='engineNumber']").html(infoData[$("[data-info='engineNumber']").attr("data-info")]);
			$("[data-selector='chasisNumberLabel']").html($("[data-selector='chasisNumberLabel']").attr("data-selector")+":");
			$("[data-info='chasisNumber']").html(infoData[$("[data-info='chasisNumber']").attr("data-info")]);
			$("[data-info='toBranch']").html(infoData[$("[data-info='toBranch']").attr("data-info")]);
			$("[data-info='OwnerPanNumber']").html(infoData[$("[data-info='OwnerPanNumber']").attr("data-info")]);
			$("[data-info='VehicleAgentMobileNumber']").html(infoData[$("[data-info='VehicleAgentMobileNumber']").attr("data-info")]);
			$("[data-selector='registeredOwnerLabel']").html($("[data-selector='registeredOwnerLabel']").attr("data-selector")+":");
			$("[data-info='registeredOwner']").html(infoData[$("[data-info='registeredOwner']").attr("data-info")]);
			$("[data-info='registeredOwner2']").html(response.dispatchLSPrintModel.registeredOwner);
			$("[data-selector='trucktype']").html($("[data-selector='trucktype']").attr("data-selector")+":");
			$("[data-info='vehicleTypeName']").html(infoData[$("[data-info='vehicleTypeName']").attr("data-info")]);
			$("[data-info='destMobileNumber']").html(infoData[$("[data-info='destMobileNumber']").attr("data-info")]);
			$("[data-info='destbranchAddress']").html(infoData[$("[data-info='destbranchAddress']").attr("data-info")]);
			$("[data-info='sourceBranchCode']").html(infoData[$("[data-info='sourceBranchCode']").attr("data-info")]);
			$("[data-info='destinationBranchCode']").html(infoData[$("[data-info='destinationBranchCode']").attr("data-info")]);
			$("[data-info='sourceBranchAddress']").html(infoData[$("[data-info='sourceBranchAddress']").attr("data-info")]);
			$("[data-info='sourceBranchName']").html(infoData[$("[data-info='sourceBranchName']").attr("data-info")]);
			$("[data-info='sourceBranchMobileNumber']").html(infoData[$("[data-info='sourceBranchMobileNumber']").attr("data-info")]);
			$("[data-info='sourceBranchGSTN']").html(infoData[$("[data-info='sourceBranchGSTN']").attr("data-info")]);
			$("[data-info='destBranchName']").html(infoData[$("[data-info='destBranchName']").attr("data-info")]);
			$("[data-info='destBranchGSTN']").html(infoData[$("[data-info='destBranchGSTN']").attr("data-info")]);
			$("[data-info='startKM']").html(infoData[$("[data-info='startKM']").attr("data-info")]);
			$("[data-info='dispatchTime24HourFormat']").html(infoData[$("[data-info='dispatchTime24HourFormat']").attr("data-info")]);
			$("[data-info='docketNumber']").html(infoData[$("[data-info='docketNumber']").attr("data-info")]);
			$("[data-info='transportationModeName']").html(infoData[$("[data-info='transportationModeName']").attr("data-info")]);
			$("[data-info='sealNumber']").html(infoData[$("[data-info='sealNumber']").attr("data-info")]);
			$("[data-info='awbNumber']").html(infoData[$("[data-info='awbNumber']").attr("data-info")]);
			$("[data-selector='billSelectioLable']").html($("[data-selector='billSelectioLable']").attr("data-selector")+":");
			$("[data-info='billSelectioTypeString']").html(infoData[$("[data-info='billSelectioTypeString']").attr("data-info")]);
			$("[data-selector='currentDateTimeLabel']").html($("[data-selector='currentDateTimeLabel']").attr("data-selector")+":");
			$("[data-info='currentDateTime']").html(infoData[$("[data-info='currentDateTime']").attr("data-info")]);
			$("[data-info='flightNumber']").html(infoData[$("[data-info='flightNumber']").attr("data-info")]);
			$("[data-info='airlineName']").html(infoData[$("[data-info='airlineName']").attr("data-info")]);
			$("[data-info='arrivalDateTimeString']").html(infoData[$("[data-info='arrivalDateTimeString']").attr("data-info")]);
			$("[data-info='divisionName']").html(response.dispatchLSPrintModel.divisionName);
			$("[data-info='trainName']").html(infoData[$("[data-info='trainName']").attr("data-info")]);
			$("[data-info='vesselName']").html(infoData[$("[data-info='vesselName']").attr("data-info")]);
			$("[data-info='coachNumber']").html(infoData[$("[data-info='coachNumber']").attr("data-info")]);
			$("[data-info='containerNumber']").html(infoData[$("[data-info='containerNumber']").attr("data-info")]);

			if(tableData != undefined) {
				for(var i = 0; i < tableData.length; i++) {
					$("[data-info='receivedLsDateTimes']").html(tableData[i].receivedLsDateTimes);
				}
			}
			
			if(isRailwayBranch)
				$(".rrNumber").removeClass('hide')

			if(typeof tripHisabLSDetails !== 'undefined') {
				$("[data-info='rawana']").html(tripHisabLSDetails.rawanaAmount);
				$("[data-info='odometer']").html(tripHisabLSDetails.kilometerReading);
				$("[data-info='diesel']").html(tripHisabLSDetails.dieselLiter);
				$("[data-info='paymentVoucherNumber']").html(tripHisabLSDetails.paymentVoucherNumber);
			} else
				$(".tripHisabLSDetails").remove();
			
			$("[data-info='lsSourceBranchName']").html(infoData[$("[data-info='lsSourceBranchName']").attr("data-info")]);
			
			if(flavorConfiguration.showCityWithBranch)
				$("[data-info='fromBranch']").html(infoData[$("[data-info='fromBranch']").attr("data-info")] + " ("+infoData.sourceCityName+")");
			else
				$("[data-info='fromBranch']").html(infoData[$("[data-info='fromBranch']").attr("data-info")]);
			
			$("[data-info='fromBranchAbrvn']").html(infoData.fromBranchAbrvn);
			$("[data-selector='toBranchLabel']").html($("[data-selector='toBranchLabel']").attr("data-selector")+": ");
			$("[data-selector='fromBranchLabel']").html($("[data-selector='fromBranchLabel']").attr("data-selector")+": ");
			
			if(flavorConfiguration.showCityWithBranch)
				$("[data-info='toBranch']").html(infoData[$("[data-info='toBranch']").attr("data-info")] + " ("+infoData.destinationCityName+")");
			else
				$("[data-info='toBranch']").html(infoData[$("[data-info='toBranch']").attr("data-info")]);
			
			$("[data-info='toBranchAbrvn']").html(infoData.toBranchAbrvn);
			$("[data-selector='ownerNameLabel']").html($("[data-selector='ownerNameLabel']").attr("data-selector")+":");
			
			if(infoData[$("[data-info='ownerName']").attr("data-info")] != undefined)
				$("[data-info='ownerName']").html(infoData[$("[data-info='ownerName']").attr("data-info")]);
			
			if(infoData[$("[data-info='ownerAddress']").attr("data-info")] != undefined)
				$("[data-info='ownerAddress']").html(infoData[$("[data-info='ownerAddress']").attr("data-info")]);
			
			if(infoData[$("[data-info='registerdOwnerName']").attr("data-info")] != undefined)
				$("[data-info='registerdOwnerName']").html(infoData[$("[data-info='registerdOwnerName']").attr("data-info")]);
			
			if(infoData[$("[data-info='registerdOwnerAddr']").attr("data-info")] != undefined)
				$("[data-info='registerdOwnerAddr']").html(infoData[$("[data-info='registerdOwnerAddr']").attr("data-info")]);
			
			if(infoData[$("[data-info='driverAddress']").attr("data-info")] != undefined)
				$("[data-info='driverAddress']").html(infoData[$("[data-info='driverAddress']").attr("data-info")]);
			
			if(infoData[$("[data-info='driverLicenceNumber']").attr("data-info")] != undefined)
				$("[data-info='driverLicenceNumber']").html(infoData[$("[data-info='driverLicenceNumber']").attr("data-info")]);
			
			if(infoData[$("[data-info='vehicleAgentName']").attr("data-info")] != undefined)
				$("[data-info='vehicleAgentName']").html(infoData[$("[data-info='vehicleAgentName']").attr("data-info")]);
			
			if(infoData[$("[data-info='policyNo']").attr("data-info")] != undefined)
				$("[data-info='policyNo']").html(infoData[$("[data-info='policyNo']").attr("data-info")]);
			
			if(infoData[$("[data-info='insuranceName']").attr("data-info")] != undefined)
				$("[data-info='insuranceName']").html(infoData[$("[data-info='insuranceName']").attr("data-info")]);
			
			if(infoData[$("[data-info='crossingAgentName']").attr("data-info")] != undefined)
				$("[data-info='crossingAgentName']").html(infoData[$("[data-info='crossingAgentName']").attr("data-info")]);
			
			if(infoData[$("[data-info='consolidatedEwaybillNumber']").attr("data-info")] != undefined)
				$("[data-info='consolidatedEwaybillNumber']").html(infoData[$("[data-info='consolidatedEwaybillNumber']").attr("data-info")]);
			
			if(infoData[$("[data-info='vehicleMasterAgentName']").attr("data-info")] != undefined)
				$("[data-info='vehicleMasterAgentName']").html(infoData[$("[data-info='vehicleMasterAgentName']").attr("data-info")]);
			
			if(infoData.manualLs == true)
				$("[data-info='dispatchNumberManual']").html(infoData.dispatchNumber);
			else
				$("[data-info='dispatchNumberLs']").html(infoData.dispatchNumber);
			
			if(infoData.crossingAgentId != undefined && infoData.crossingAgentId > 0)
				$("[data-info='crossingAgentName']").html(response.dispatchLSPrintModel.crossingAgentName);
			else
				$("[data-info='crossingAgentName']").html("Self");

			setTimeout(() => {
				if(infoData.vehicleOwner == OWN_VEHICLE_ID || infoData.vehicleOwner == ATTACHED_VEHICLE_ID) {
					if(tripHisabLSDetails != undefined)
						$("[data-selector='kgsAmnt']").html(tripHisabLSDetails.rawanaAmount);
				} else
					$("[data-selector='kgsAmnt']").html(lorryHireAdvance);
			}, 1000);
			
			if(infoData.vehicleOwner == HIRED_VEHICLE_ID) {
				$("*[data-selector='agent']").html('');
				$("*[data-selector='agent']").html('Agent : ');
			} else {
				$("*[data-selector='agent']").html('');
				$("*[data-selector='agent']").html('Owner : ');
			}
			
			if(infoData[$("[data-info='driver2Name']").attr("data-info")] != undefined)
				$("[data-info='driver2Name']").html(infoData[$("[data-info='driver2Name']").attr("data-info")]);
			else
				$("*[data-info='driver2Name']").html('');
			
			if(infoData[$("[data-info='driver2MobileNumber']").attr("data-info")] != undefined)
				$("[data-info='driver2MobileNumber']").html(infoData[$("[data-info='driver2MobileNumber']").attr("data-info")]);
			else
				$("*[data-info='driver2MobileNumber']").html('');
			
			if(infoData[$("[data-info='driverName']").attr("data-info")] != undefined)
				$("[data-info='driverName']").html(infoData[$("[data-info='driverName']").attr("data-info")]);
			else
				$("*[data-info='driverName']").html('');
			
			$("[data-info='driverNameWithNumber']").html(infoData[$("[data-info='driverNameWithNumber']").attr("data-info")]);
			
			if(infoData[$("[data-info='loaderName']").attr("data-info")] != undefined)
				$("[data-info='loaderName']").html(infoData[$("[data-info='loaderName']").attr("data-info")]);
			else
				$("*[data-info='loaderName']").html('');
			
			if(infoData[$("[data-info='loaderMobileNo']").attr("data-info")] != undefined)
				$("[data-info='loaderMobileNo']").html(infoData[$("[data-info='loaderMobileNo']").attr("data-info")]);
			else
				$("*[data-info='loaderMobileNo']").html('');
			
			if(infoData[$("[data-info='bookingRRnumber']").attr("data-info")] != undefined)
				$("[data-info='bookingRRnumber']").html(infoData[$("[data-info='bookingRRnumber']").attr("data-info")]);
			else
				$("*[data-info='bookingRRnumber']").html('');
			
			if(infoData[$("[data-info='vpsrlNumber']").attr("data-info")] != undefined)
				$("[data-info='vpsrlNumber']").html(infoData[$("[data-info='vpsrlNumber']").attr("data-info")]);
			else
				$("*[data-info='vpsrlNumber']").html('');
			
			if(infoData[$("[data-info='lsRemark']").attr("data-info")] != undefined)
				$("[data-info='lsRemark']").html(infoData[$("[data-info='lsRemark']").attr("data-info")]);
			else
				$("*[data-info='lsRemark']").html('--');
				
			if(infoData[$("[data-info='driverMobileNumber']").attr("data-info")] != undefined)
				$("[data-info='driverMobileNumber']").html("&nbsp;("+infoData[$("[data-info='driverMobileNumber']").attr("data-info")]+")");
			else
				$("*[data-info='driverMobileNumber']").html('');
			
			$("[data-info='openingKm']").html(infoData[$("[data-info='openingKm']").attr("data-info")]);
			$("[data-info='vehicleOwnerName']").html(infoData[$("[data-info='vehicleOwnerName']").attr("data-info")]);
			
			$("[data-info='fromBranchWithSubRegion']").html(infoData.fromBranch + " ("+infoData.dispatchLsSourceSubRegionName+")");
			$("[data-info='toBranchWithSubRegion']").html(infoData.toBranch + " ("+infoData.dispatchLsDestinationSubRegionName+")");
			
			if(showMissingLRNumber == true || showMissingLRNumber == 'true')
				$("*[data-info='missingLR']").html(commaSeperatedMissingValues);
			
			if(removeAmountBranchIdsWise == true || removeAmountBranchIdsWise == 'true') {
				var target	= $('#dataTable').find('th[data-selector="amountLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if(commision30TableforBitla == true || commision30TableforBitla == 'true') {
				$("#hidetable").css("display", "table");
				$("div.hidetable").css("display", "block");
			}
			
			if(response.dispatchLSPrintModel.transportModeId == TRANSPORTATION_MODE_AIR_ID)
				$(".transportModeRoad").hide(); // Hide the entire row
			else if(response.dispatchLSPrintModel.transportModeId != TRANSPORTATION_MODE_AIR_ID)
				$(".transportModeAir").hide(); // Hide the entire row
				
			if(response.dispatchLSPrintModel.transportModeId == TRANSPORTATION_MODE_AIR_ID){
				$('.transportationModeAir').removeClass('hide');
				$(".transportModeOther").hide();
			}else if(response.dispatchLSPrintModel.transportModeId == TRANSPORTATION_MODE_RAIL_ID){
				$('.transportationModeRail').removeClass('hide');
				$(".transportModeOther").hide();
			}else if(response.dispatchLSPrintModel.transportModeId == TRANSPORTATION_MODE_SHIP_ID) {
				$('.transportationModeShip').removeClass('hide');
				$(".transportModeOther").hide();
			}
				
		}, setDataTableHeader : function() {
			var columnHeaderObject		= $("[data-row='dataTableHeaders']").children();	
			for (var i = 0; i < columnHeaderObject.length; i++) {
				var header = $(columnHeaderObject[i]).attr("data-selector");
				$(columnHeaderObject[i]).attr("data-selector", header).html(header);
			}
		}, setDataTableDetails : function(tableData, response) {
			var sourceDataArray = [];
			
			for(let i=0; i<tableData.length; i++) {
				if(tableData[i].lrType == 'Paid' || tableData[i].lrType == 'To Pay' ||tableData[i].lrType == 'TBB')
					numberOfLr++;
				
				sourceDataArray.push(tableData[i].lrSourceBranchSubstring);
			}
			
			_this.resetData();
			var flavorConfiguration					= response.FlavorConfiguration;
			var subStringLength						= flavorConfiguration.subStringLength;
		
			var dispatchdata = response.dispatchLSPrintModel;

			if(tableData[tableData.length - 2] != undefined){
				var narrationForRT	= tableData[tableData.length - 2].narrationForRT;
				var crossingTotal	= tableData[tableData.length - 2].crossingTotal;
				var narrationForRTLen	= narrationForRT.length;
				
				if(crossingTotal > 0) {
					$("[data-table='narrationForRT']").html(narrationForRT.substr(0, narrationForRTLen - 2));
					$("[data-table='crossingTotal']").html(crossingTotal);
				} else
					$('#crossingDetails').remove();
			}

			var lastItrObj	= tableData[tableData.length - 1];
			
			if (lastItrObj.lastITR == false) {
				$("[data-table='summaryTable']").remove();
				$("[data-headerDiv='summary']").remove();
				$("[data-footerDetails='footerInfo']").remove();
				$("[data-commissionDetails='commision30Table']").remove();
				$("[data-footerDriverSignature='driversignature']").remove();
			}
			
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			var tbody1	= $("[data-dataTableDetail2='srNumber1']").parent().parent();
			
			tbody		= (tbody[tbody.length - 1]);
			tbody1		= (tbody1[tbody1.length - 1]);
			
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			columnObjectForDetails2		= $("[data-row='dataTableDetails2']").children();
			columnObjectForDataTableDetails		= columnObjectForDetails;
			
			$(tbody).before($("#TableDataHtml"));
			$(tbody1).before($("#TableDataHtml2"));
			
			sourceDataArray = Array.from(new Set(sourceDataArray));
			
			var checkData = tableData[0].lrSourceBranch;
			var checkData2 = tableData[0].lrDestinationBranch;
			var checkDataFlag = true;
			var checkDataIndex = 0;
			var totalArtFORHUMSAFAR = 0;
			let destinationCount = {};

			for (let i = 0; i < tableData.length; i++) {
			    let branch = tableData[i].lrDestinationBranch;
			    if (!destinationCount[branch]) {
			        destinationCount[branch] = 0;
			    }
			    destinationCount[branch]++;
			}
				for(var i = 0; i < tableData.length; i++) {
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				if(flavorConfiguration.displaySrcBranchWiseTableDetails){
					if(tableData[i].lrSourceBranch != checkData){
						checkDataFlag = true;
						checkData = tableData[checkDataIndex].lrSourceBranch;
						
					}
					if(checkDataFlag){
						if(i!= tableData.length){
							if(i==0){
								$(tbody).before($(newtr).append($("<td colspan='11'>" + tableData[checkDataIndex].lrSourceBranch + "</td>")));
							
							}else{
								$(tbody).before($(newtr).append($("<td colspan='5'>" + tableData[checkDataIndex].lrSourceBranch + "</td>" + "<td style='text-align: center; border-right: 2px solid #333333;'>" + totalArtFORHUMSAFAR + "</td>" )));
							}
							newtr = $("<tr></tr>");
							totalArtFORHUMSAFAR =0;
							
						}
						checkDataFlag = false;
					}
					
					totalArtFORHUMSAFAR = totalArtFORHUMSAFAR + tableData[i].totalArticle
					
					checkDataIndex++;
					if(i==tableData.length-1){
						$("[data-selector='totalArt']").html(totalArtFORHUMSAFAR);
					
					}
				}
				
				if(flavorConfiguration.displayDestBranchWiseTableDetails){
					if(tableData[i].lrDestinationBranch != checkData2){
						checkDataFlag = true;
						checkData2 = tableData[checkDataIndex].lrDestinationBranch;
						
					}
					if(checkDataFlag){
						
						if(i!= tableData.length){
							let branch = tableData[checkDataIndex].lrDestinationBranch;
							let count = destinationCount[branch];
							
							$(tbody).before($(newtr).append($("<td colspan='11'>" + branch + " (" + count + ")</td>")));
							newtr = $("<tr></tr>");
						}
						checkDataFlag = false;
					}
					checkDataIndex++;
				}
				
				var branchArray = typeof flavorConfiguration.branchIdsToshowDirectAmt === "string" ? (flavorConfiguration.branchIdsToshowDirectAmt).split(",") : [];
				
				
				var isDirectAmtCondition = isValueExistInArray(branchArray, tableData[i].wayBillSourceBranchId) || (tableData[i].wayBillSourceBranchId == response.lsSrcBranch.branchId && tableData[i].wayBillDestinationBranchId == response.lsDestBranch.branchId);
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("id", $(columnObjectForDetails[j]).attr("id"));
					if(tableData[i]['lrType'] == 'Paid' && dataPicker == 'amount'){
						$(newtd).addClass('paidLrCell')
					}
					if ((dataPicker == 'paidFreightCharge' || dataPicker == 'toPayFreightCharge' || dataPicker == 'tbbFreightCharge' || dataPicker == 'paidAmount' || dataPicker == 'topayAmount' || dataPicker == 'tbbAmount' || dataPicker == 'otherAmount' ||dataPicker == 'fullToPayFreightCharge' || dataPicker == 'PaidFreightChargeWithDD'|| dataPicker == 'toPayFreightChargeWithDD' || dataPicker == 'TbbFreightChargeWithDD') && (flavorConfiguration.showSeparateColumnForPaidAmount || flavorConfiguration.showSeparateColumnForToPayAmount || flavorConfiguration.showSeparateColumnForTBBAmount || flavorConfiguration.showToPayAndPaidHamali)) {
						if (dataPicker == 'paidFreightCharge') {
							$(newtd).attr("data-dataTableDetail", "paidFreightCharge");
							
							if (flavorConfiguration.showSeparateColumnForPaidAmount && tableData[i]['lrType'] == 'Paid') {
								$(newtd).html(tableData[i]['freightCharge']);
								paidFreight		= paidFreight + tableData[i].freightCharge;
							}else if(flavorConfiguration.showSeparateColumnForPaidAndTbbAmount && (tableData[i]['lrType'] == 'Paid' || (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))){
								$(newtd).html(tableData[i]['freightCharge']);
								paidFreight		= paidFreight + tableData[i].freightCharge;
							} else if(flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("");
							else
								$(newtd).html("0");
						}
						
						if (dataPicker == 'PaidFreightChargeWithDD') {
							$(newtd).attr("data-dataTableDetail", "PaidFreightChargeWithDD");

							if (flavorConfiguration.showSeparateColumnForToPayAmount && tableData[i]['lrType'] == 'Paid') {
								$(newtd).html(tableData[i]['freightCharge'] + tableData[i]['doorDeliveryCharge'] + tableData[i]['lrCharge'] + tableData[i]['withPassCharge']);
								paidFreight		=  (paidFreight + tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i]['lrCharge'] + tableData[i]['withPassCharge']);
							} else
								$(newtd).html("0");
						}
						
						if (dataPicker == 'toPayFreightCharge') {
							$(newtd).attr("data-dataTableDetail","toPayFreightCharge");

							if (flavorConfiguration.showSeparateColumnForToPayAmount && tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i]['freightCharge']);
								toPayFreight		= toPayFreight + tableData[i].freightCharge;
							} else if(flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("");
							else
								$(newtd).html("0");
						}
						
						if (flavorConfiguration.clubFreightChargeAndLoadingChargeForToPay && dataPicker == 'fullToPayFreightCharge') {
							$(newtd).attr("data-dataTableDetail", "fullToPayFreightCharge");
							
							if (tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i]['fullToPayfreightCharge']);
								fullToPayFreight		= fullToPayFreight + tableData[i].fullToPayfreightCharge;
							} else
								$(newtd).html("0");
						}

						if (dataPicker == 'toPayFreightChargeWithDD') {
							$(newtd).attr("data-dataTableDetail", "toPayFreightChargeWithDD");
							
							if (flavorConfiguration.showSeparateColumnForToPayAmount && tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i]['freightCharge'] + tableData[i]['doorDeliveryCharge'] + tableData[i]['lrCharge'] + tableData[i]['withPassCharge']);
								toPayFreight	= (toPayFreight + tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i].lrCharge + tableData[i].withPassCharge);
							} else
								$(newtd).html("0");
						}
						
						if (dataPicker == 'tbbFreightCharge') {
							$(newtd).attr("data-dataTableDetail", "tbbFreightCharge");
							
							if (flavorConfiguration.showSeparateColumnForTBBAmount && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html(tableData[i]['freightCharge']);
								tbbFright		= tbbFright + tableData[i].freightCharge;
							} else if(flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("");
							else
								$(newtd).html("0");
						}
						
						if (dataPicker == 'TbbFreightChargeWithDD') {
							$(newtd).attr("data-dataTableDetail", "TbbFreightChargeWithDD");
							
							if (flavorConfiguration.showSeparateColumnForToPayAmount &&(tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html(tableData[i]['freightCharge'] + tableData[i]['doorDeliveryCharge'] + tableData[i]['lrCharge'] + tableData[i]['withPassCharge']);
								tbbFright		= tbbFright + (tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i].lrCharge + tableData[i].withPassCharge);
							} else
								$(newtd).html("0");
						}
						if (dataPicker == 'paidAmount') {
							$(newtd).attr("data-dataTableDetail", "paidAmount");

							if (flavorConfiguration.showSeparateColumnForPaidAmount	 && tableData[i]['lrType'] == 'Paid') {
								$(newtd).html(tableData[i]['amount']);
								paidAmount		= paidAmount + tableData[i].amount;
							}else if(flavorConfiguration.showSeparateColumnForPaidAndTbbAmount && (tableData[i]['lrType'] == 'Paid' || (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))){
								$(newtd).html(tableData[i]['amount']);
								paidAmount		= paidAmount + tableData[i].amount;
							} else if (flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("")
							else
								$(newtd).html("0");
						}
							
						if (dataPicker == 'topayAmount') {
							$(newtd).attr("data-dataTableDetail","topayAmount");
							
							if (flavorConfiguration.showSeparateColumnForToPayAmount && tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i]['amount']);
								topayAmount		= topayAmount + tableData[i].amount;
							} else if (flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("")
							else
								$(newtd).html("0");
						}
						
						if (dataPicker == 'tbbAmount') {
							$(newtd).attr("data-dataTableDetail", "tbbAmount");
							
							if (flavorConfiguration.showSeparateColumnForTBBAmount && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html(tableData[i]['amount']);
								tbbAmount		= tbbAmount + tableData[i].amount;
							} else if (flavorConfiguration.replaceZeroAmountWithBlank)
								$(newtd).html("")
							else
								$(newtd).html("0");
						}
				
						if (dataPicker == 'otherAmount') {
							$(newtd).attr("data-dataTableDetail","otherAmount");
							$(newtd).html(tableData[i]['otherAmount']);
							otherAmount		= otherAmount + tableData[i].otherAmount;
						}
				
						if(flavorConfiguration.replaceTbbAmountWithLrType && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
							$(newtd).html('TBB');
					} else {
						$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));						
						$(newtd).html(tableData[i][dataPicker]);
					}
			
					if (flavorConfiguration.customReplacechagesForUniqueGroup && dataPicker == 'amount' && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).addClass('typeTBB');
				
					if (typeof dataPicker !== 'undefined' && (dataPicker === 'consignor' || dataPicker === 'consignee')) {
						if (tableData[i] && typeof tableData[i][dataPicker] !== 'undefined') {
							if ((tableData[i][dataPicker]).length > subStringLength) {
								$(newtd).html((tableData[i][dataPicker]).substring(0, subStringLength) + '..');
							} else {
								$(newtd).html(tableData[i][dataPicker]);
							}
						}
					}
			
					if(flavorConfiguration.showConsignorConsigneeFullName && (dataPicker == 'consignor' || dataPicker == 'consignee'))
						$(newtd).html(tableData[i][dataPicker]);
			
					$(newtr).append($(newtd));
			
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidTbbAmountWithLrType && (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))						
						$(newtd).html(tableData[i]['lrType']);
					
					if(dataPicker == 'paidFreightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrType && tableData[i]['lrType'] == 'Paid')						
						$(newtd).html(tableData[i]['lrType']);
					
					if(dataPicker == 'tbbFreightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrType && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))						
						$(newtd).html(tableData[i]['lrType']);
					
					if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidTbbFreightWithZero && (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('0');
					
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidTBBAmountWithDash && (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('-');
					
					if(dataPicker == 'loadingChargeRT' && flavorConfiguration.showLoadingChargeZeroInPaidLr && tableData[i]['lrType'] == 'Paid')
						$(newtd).html('0');
					
					if(dataPicker == 'loadingChargeformls' && flavorConfiguration.showLoadingChargeZeroInPaidLr && tableData[i]['lrType'] == 'Paid')
						$(newtd).html('0');
					
					if (dataPicker == 'totalAmountForGTM') {
						$(newtd).attr("data-dataTableDetail", "totalAmountForGTM");
						
						if (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i]['totalAmountForGTM']);
							paidAndToPayTotalForGTM		= paidAndToPayTotalForGTM + tableData[i].totalAmountForGTM;
						} else
							$(newtd).html("0");
					}
					
					if(dataPicker == 'amount' && flavorConfiguration.replaceTbbAmountWithZero && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('0');
						
					if(dataPicker == 'amount' && flavorConfiguration.replaceTbbAmountWithBlank && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('');	
					
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidAmountWithPAID && (tableData[i]['lrType'] == 'Paid'))
						$(newtd).html('PAID');	
					
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidAmountWithPAID && flavorConfiguration.replaceTbbAmountWithBlank && (tableData[i]['lrType'] == 'To Pay'))
						$(newtd).html(tableData[i]['amount']);	
					
					//SKY	
					if(dataPicker == 'amount' && response.accountGroupId == 598 && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('TBB');
					   
					if(dataPicker == 'amount' && flavorConfiguration.replaceTbbAmountWithLrType && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('TBB');
					
					if(dataPicker == 'amountWithoutTbb') {
						if(tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
							$(newtd).html('TBB');
						else
							$(newtd).html(tableData[i]['amount']);
					}
					
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidAmountWithZero && tableData[i]['lrType'] == 'Paid')
						$(newtd).html('0');
					
					if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidChargesWithZero && tableData[i]['lrType'] == 'Paid')
						$(newtd).html('0');
										
					if(dataPicker == 'loadingCharge' && flavorConfiguration.replacePaidChargesWithZero && tableData[i]['lrType'] == 'Paid')
						$(newtd).html('0');
										  
					if(flavorConfiguration.replacePaidTbbTotalAmountWithLrType) {
						if(dataPicker == 'amount' && flavorConfiguration.replacePaidAmountWithZero && flavorConfiguration.replaceTbbAmountWithZero && flavorConfiguration.replacePaidTbbAmountWithLrType
						 && (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB'))
							$(newtd).html(tableData[i]['lrType']);
					}					
					
					if(dataPicker == 'freightChargeForsmdtcl' && tableData[i]['lrType'] == 'TBB' && $(newtd).hasClass('showTbbForGroupAdmin')) {
						if(response.executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
							$(newtd).html(tableData[i].freightCharge);
							showTbbForGroupAdmin = true;
						} else
							$(newtd).html(tableData[i]['lrType']);
					} 
					
					if (dataPicker === "amountWithType") {
						let type = tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID ? "P" :
							tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY ? "T" :
							tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT ? "TBB" :
							tableData[i].wayBillTypeId == WAYBILL_TYPE_FOC ? "F" : undefined
						  
						$(newtd).html(`${tableData[i].amount} (${type})`)
					}
					  
					if (dataPicker == 'cartageAmount') {
						$(newtd).attr("data-dataTableDetail","cartageAmount	");
						$(newtd).html(tableData[i]['cartageAmount']);
						cartageAmount	= cartageAmount	 + tableData[i].cartageAmount;
					}
					if (dataPicker == 'handlingCharge') {
						$(newtd).attr("data-dataTableDetail","handlingCharge	");
						$(newtd).html(tableData[i]['handlingCharge']);
						handlingCharge	= handlingCharge	 + tableData[i].handlingCharge;
					}

					if (dataPicker == 'CodAmount') {
						$(newtd).attr("data-dataTableDetail","CodAmount	");
						$(newtd).html(tableData[i]['CodAmount']);
						CodAmount	= CodAmount	 + tableData[i].CodAmount;
					}
					
					if (dataPicker == 'wayBillCodVppAmount') {
						$(newtd).attr("data-dataTableDetail","wayBillCodVppAmount");
						$(newtd).html(tableData[i]['wayBillCodVppAmount']);
						wayBillCodVppAmount	= wayBillCodVppAmount	 + tableData[i].wayBillCodVppAmount;
					}
					
				
					$(newtr).append($(newtd));
					
					if(dataPicker == 'lrType' && flavorConfiguration.renameTbbLrAsOnAcc && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
						$(newtd).html('ON-ACC');
					
					if(dataPicker == 'crossingHireAmt' && flavorConfiguration.replaceCrossingHireAmountWithZero) {
						if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
							$(newtd).html('0');
						else
							$(newtd).html(tableData[i].crossingHireAmt);
					}
						
					if(dataPicker == 'paidFreightCharge' && flavorConfiguration.replacePaidAndTBBAmountWithBlank)
						$(newtd).html('&nbsp');
					
					if(dataPicker == 'tbbFreightCharge' && flavorConfiguration.replacePaidAndTBBAmountWithBlank)
						$(newtd).html('&nbsp');
						
					
					if (dataPicker == 'hamaliChargeForToPay') {
						$(newtd).attr("data-dataTableDetail", "hamaliChargeForToPay");
						
						if (flavorConfiguration.showToPayAndPaidHamali && tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i]['hamaliCharge']);
							hamaliCharge		= hamaliCharge + tableData[i].hamaliCharge;
						} else
							$(newtd).html("0");
					}
					if (dataPicker == 'cartageAmountForToPay') {
						$(newtd).attr("data-dataTableDetail", "cartageAmountForToPay");
						
						if (tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i]['cartageAmount']);
							cartageAmount		= cartageAmount + tableData[i].cartageAmount;
						} else
							$(newtd).html("0");
					}
					if (dataPicker == 'otherChargeForToPay') {
						$(newtd).attr("data-dataTableDetail", "otherChargeForToPay");
						
						if (tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i]['otherCharge']);
							otherCharge		= otherCharge + tableData[i].otherCharge;
						} else
							$(newtd).html("0");
					}
					
					if (dataPicker == 'hamaliChargeForPaid') {
						$(newtd).attr("data-dataTableDetail", "hamaliChargeForPaid");
						
						if (flavorConfiguration.showToPayAndPaidHamali && tableData[i]['lrType'] == 'Paid') {
							$(newtd).html(tableData[i]['hamaliCharge']);
							hamaliCharge		= hamaliCharge + tableData[i].hamaliCharge;
						} else
							$(newtd).html("0");
					}
					
					if (flavorConfiguration.replacePaidAndTBBAmountWithBlank && dataPicker == 'paidFreightCharge') {
						$(newtd).attr("data-dataTableDetail", "paidFreightCharge");
						$(newtd).html("&nbsp;");
						paidFreight = " "; 
					}
					
					if (flavorConfiguration.replacePaidAndTBBAmountWithBlank && dataPicker == 'tbbFreightCharge') {
						$(newtd).attr("data-dataTableDetail", "tbbFreightCharge");
						$(newtd).html("&nbsp;");
						tbbFright = " ";
					}
					
					if(dataPicker == 'amount' && flavorConfiguration.replaceAmountWithZero) {
						if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
							$(newtd).html('0');
						else
							$(newtd).html(tableData[i].amount);
					}
					
					if(dataPicker == 'amount' && flavorConfiguration.replaceAmountWithBlank) {
						$(newtd).attr("data-dataTableDetail","amount");
						$(newtd).html(" ");
					}
					
					if(dataPicker == 'otherChargeForKavi')
						$(newtd).html( tableData[i].otherCharge + tableData[i].hamaliCharge + tableData[i].doorCollectionCharge + tableData[i].doorDeliveryCharge +	 tableData[i].wayBillCrossingAmount + tableData[i].stationary);
					
					if(dataPicker == 'otherChargeforsgt') {
						$(newtd).attr("data-dataTableDetail", "otherChargeforsgt");
						$(newtd).html(tableData[i].pickupCharge + tableData[i].doorDeliveryCharge + tableData[i].wayBillCrossingAmount +  tableData[i].otherCharge);
					}
					
					if(dataPicker == 'lrNumber' && tableData[i].isInvalidEwayBill && flavorConfiguration.showStarMarkOnInvalidEwayBill)
						$(newtd).html("**" + tableData[i][dataPicker]);
						
					if(dataPicker == 'doorDeliveryCharge' && flavorConfiguration.replaceZeroAmountWithBlank && tableData[i].doorDeliveryCharge == 0)
						$(newtd).html("");
					
					if(dataPicker == 'declaredValue' && flavorConfiguration.replaceZeroAmountWithBlank && tableData[i].declaredValue == 0)
						$(newtd).html("");
					
					if(dataPicker == 'pfCharge' && flavorConfiguration.replaceZeroAmountWithBlank && tableData[i].pfCharge == 0)
							$(newtd).html("");
					
					if(dataPicker == 'cartageAmount' && flavorConfiguration.replaceZeroAmountWithBlank && tableData[i].cartageAmount == 0)
							$(newtd).html("");
					
					if(dataPicker == 'crossingHamali' && flavorConfiguration.replaceZeroAmountWithBlank && tableData[i].crossingHamali == 0)
						$(newtd).html("");
										
							
					if(dataPicker == 'deliveryType') {
						if(flavorConfiguration.printOnlyDDForDoorDeliveryLR) {
							if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
								$(newtd).html("DD");
							else
								$(newtd).html("--");
						} else if(tableData[i].deliveryTypeId == DELIVERY_TO_BRANCH_ID)
							$(newtd).html("GD");
						else if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
							$(newtd).html("DD");
					}
					

					if (dataPicker == 'directAmt') {
						if (isDirectAmtCondition) {
							$(newtd).attr("data-dataTableDetail", "directAmt");
							$(newtd).html(tableData[i].freightCharge);
						} else {
							$(newtd).html(0);
						}
					} else if (dataPicker == 'connectingAmt') {
						if (!isDirectAmtCondition) {
							$(newtd).attr("data-dataTableDetail", "connectingAmt");
							$(newtd).html(tableData[i].freightCharge);
						} else {
							$(newtd).html(0);
						}
					}

					if(dataPicker == 'packingTypeQtyAndSaidToContain') {
						var packingTypeArr = (tableData[i].consignmentSummaryString).split(" /");
						$(newtd).append(packingTypeArr.join(', '));
					}
					
					if(dataPicker == 'firstSaidToContain')
						$(newtd).html(tableData[i].firstSaidToContain)
						
					if(response.dispatchLSPrintModel.crossingAgentId != undefined && response.dispatchLSPrintModel.crossingAgentId > 0){	
						if(dataPicker == 'kant') {
							totalKantAmt += tableData[i].crossingHireAmt;
							$(newtd).html(tableData[i].crossingHireAmt);
						}
						
						if(dataPicker == 'balanceAmt')
							$(newtd).html(tableData[i].amount - tableData[i].crossingHireAmt);
					}
					
					if(dataPicker == 'totalLrAndServiceCharge'){
						$(newtd).html(tableData[i].wayBillLrCharge + tableData[i].wayBillServiceCharge);
					}
					
					if(dataPicker == 'commission'){ 
					  $(newtd).html(tableData[i].wayBillCrossingAmount);
					}
					
					crossingCommision = tableData[i].crossingCommission;
					  if(dataPicker == 'stl_CommissionLR'){
						 if(tableData[i].crossingCommission > 0){
							$(newtd).html(tableData[i].crossingCommission);
						} else if (dispatchdata.commission > 0 && tableData[i].wayBillTypeId != WAYBILL_TYPE_FOC){
							  if(dispatchdata.commissionPecentage != undefined && dispatchdata.commissionPecentage == false){
								  $(newtd).html(dispatchdata.commission / numberOfLr);
							  } else if(dispatchdata.commissionPecentage == true){
								   $(newtd).html(Number(tableData[i].freightCharge * dispatchdata.commission) / 100);
							  }
						  }
					}
					if (dataPicker == 'articleTypeNewlineSeperated') {
						$(newtd).html(tableData[i].articleTypeCommaSeperated.split(" /").join("<br/>"))
					}
					
					$(newtr).append($(newtd));
				}
				
				if(columnObjectForDetails2.length > 0) {
					for(var j = 0; j < columnObjectForDetails2.length; j++) {
						var newtd1 = $("<td></td>");
						var dataPicker = $(columnObjectForDetails2[j]).attr("data-dataTableDetail2");
						$(newtd1).attr("class", $(columnObjectForDetails2[j]).attr("class"));
						$(newtd1).attr("data-dataTableDetail2", $(columnObjectForDetails2[j]).attr("data-dataTableDetail2"));
					
						$(newtd1).html(tableData[i][dataPicker]);
						$(newtr1).append($(newtd1));
						$(tbody1).before(newtr1);
					}
				}
				
				packingTypeMasterName		= tableData[i].packingTypeMasterName;
				consignmentPackingDetails	= consignmentPackingDetails + tableData[i].totalArticle;
				consignmentPackingDetails1	= consignmentPackingDetails1 + tableData[i].totalArticle;
				consignmentPackingDetails2 =  consignmentPackingDetails2 + tableData[i].totalArticle;
				otherChargeOPs				= otherChargeOPs + tableData[i].otherChargeOPs;
				totalArticle				= totalArticle + tableData[i].totalArticle;
				freightCharge				= freightCharge + tableData[i].freightCharge;
				loadingCharge				= loadingCharge + tableData[i].loadingCharge;
				pickupCharge				= pickupCharge + tableData[i].pickupCharge;
				toPayHmali					= toPayHmali + tableData[i].toPayHmali;
				pfCharge					= pfCharge + tableData[i].pfCharge;
				tempoBhadaBooking			= tempoBhadaBooking + tableData[i].tempoBhadaBooking;
				crossingHire				= crossingHire + tableData[i].crossingHire;
				unloadingAmount				= unloadingAmount + tableData[i].unloadingAmount;
				DocketAmount				= DocketAmount + tableData[i].DocketAmount;
				otherCharge					= otherCharge + tableData[i].otherCharge;
				lc							= lc + tableData[i].lc;
				csCharge					= csCharge + tableData[i].csCharge;
				otherChargeForKavi			= Math.round(otherChargeForKavi + tableData[i].otherCharge + tableData[i].hamaliCharge + tableData[i].doorCollectionCharge + tableData[i].doorDeliveryCharge +	tableData[i].wayBillCrossingAmount + tableData[i].stationary);
				wayBillBuiltyAmount				= wayBillBuiltyAmount + tableData[i].wayBillBuiltyAmount;
				
				if(tableData[i]['lrType'] != 'Paid')
					loadingChargeRT			= loadingChargeRT + tableData[i].loadingChargeRT;
				
				if(tableData[i]['lrType'] != 'Paid')
					loadingChargeformls		= loadingChargeformls + tableData[i].loadingChargeformls;
				
				if(tableData[i]['lrType'] == 'Paid')
					paidFreightChargeWithDD	= Math.round(paidFreightChargeWithDD + tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i].lrCharge + tableData[i].withPassCharge);
				
				if(tableData[i]['lrType'] == 'To Pay')
					toPayFreightChargeWithDD= Math.round(toPayFreightChargeWithDD + tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i].lrCharge + tableData[i].withPassCharge);
				
				if(tableData[i]['lrType'] == 'TBB')
					tbbFreightChargeWithDD	= Math.round(tbbFreightChargeWithDD + tableData[i].freightCharge + tableData[i].doorDeliveryCharge + tableData[i].lrCharge + tableData[i].withPassCharge);
				
				if(flavorConfiguration.replaceAmountWithBlank)
					amount				= " ";
				else
					amount				= Math.round(amount + tableData[i].amount);
					
				other					= other + tableData[i].otherCharge;
				fov						= fov + tableData[i].fovCharge;
				stationaryCharge		= stationaryCharge + tableData[i].stationaryCharge;
				hamaliCharge			= hamaliCharge + tableData[i].hamaliCharge;
				ddCharge				= ddCharge + tableData[i].ddCharge;
				srsHamaliCharge			= srsHamaliCharge + tableData[i].srsHamaliCharge;
				tollCharge				= tollCharge + tableData[i].tollCharge;
				doorCollectionCharge	= doorCollectionCharge + tableData[i].doorCollectionCharge;
				doorDeliveryCharge		= doorDeliveryCharge +	tableData[i].doorDeliveryCharge;
				doorPickupCharge		= doorPickupCharge +  tableData[i].doorPickupCharge;
				artCharge				= artCharge +  tableData[i].artCharge;
				smsCharge				= smsCharge + tableData[i].smsCharge;
				actualWeight			= actualWeight	+ tableData[i].actualWeight;
				chargeWeight			= chargeWeight	+ tableData[i].chargeWeight;
				advancePaid				= advancePaid	+ tableData[i].advancePaid;
				balanceAmount			= balanceAmount	+ tableData[i].balance;
				otherAmount				= otherAmount + tableData[i].otherAmount;
				serviceTax				= serviceTax + tableData[i].serviceTax;
				wayBillDiscount			= wayBillDiscount + tableData[i].wayBillDiscount;
				otherAmountAptc			= otherAmountAptc + tableData[i].otherChargeAmountAptc;
				wayBillDocCharge		= wayBillDocCharge + tableData[i].wayBillDocCharge;
				wayBillInsurance		= wayBillInsurance + tableData[i].wayBillInsurance;
				crossingHireAmt			= crossingHireAmt + tableData[i].crossingHireAmt;
				payableAmount			= payableAmount + tableData[i].payableAmount;
				receivableAmount		= receivableAmount + tableData[i].receivableAmount;
				declaredValue			= declaredValue + Number(tableData[i].declaredValue);
				bookingCommission		= bookingCommission + Number(tableData[i].bookingCommission);
				lrCharge				= lrCharge + Number(tableData[i].lrCharge);
				crossingCharge			= crossingCharge + Number(tableData[i].wayBillCrossingAmount);
				totalWithoutHamali		= totalWithoutHamali + (tableData[i].amount-tableData[i].hamaliCharge)
				
				if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY && flavorConfiguration.showOnlyTopayHamali){
					topayHamali = topayHamali + tableData[i].hamaliCharge;
					amount				= Math.round(amount + tableData[i].amount);
				}
				
				bkgTotal				= bkgTotal + tableData[i].amount;
				DDC						= DDC + tableData[i].DDC;
				deliveryDDCCommission	= tableData[i].deliveryDDCCommission;
				iAndSAmount				= tableData[i].iandSCharge;
		
				if (tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					totalTopay			= totalTopay + tableData[i].amount;

					if(tableData[i].bookingCommission != undefined)
						bookingCommissionRate	= tableData[i].bookingCommission;
					
					if(tableData[i].deliveryCommission != undefined)
						deliveryCommissionOnToPayRate	= tableData[i].deliveryCommission;
				}
				
				if (tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY && tableData[i].bookingTypeId == BOOKING_TYPE_SUNDRY_ID) {
					if(bookingCommissionRate > 0) {
						newBookingCommission		= bookingCommissionRate * totalTopay / 100;
						payableAmountCommissionWise = toPayTotalPageWiseFreightCharge - bookingCommission ;
					}
					
					if(deliveryCommissionOnToPayRate > 0)
						deliveryCommissionOnToPay	= deliveryCommissionOnToPayRate * totalTopay / 100;
				}
				
				if(tableData[i].deliveryCommission != undefined)
					deliveryCommissionRate	= tableData[i].deliveryCommission;
					
				if(deliveryCommissionRate > 0)
					deliveryCommission			= deliveryCommissionRate * freightCharge / 100;
						
				if(deliveryCommissionRate > 0 || deliveryDDCCommission > 0)
					newDeliveryCommission	= (deliveryCommissionRate * freightCharge / 100) + (deliveryDDCCommission * DDC / 100);
				
				//unloadingAmount			= unloadingAmount + tableData[i].doorDeliveryCharge + tableData[i].unloadingAmount;
				//total					= tableData[i].freightCharge + tableData[i].loadingCharge + tableData[i].stCharge + tableData[i].otherAmount;
				//grandTotalSks				= unloadingAmount + total;
				
				if (tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID) { // For SummaryTable
					totalArticleQtyForPAID				= totalArticleQtyForPAID + tableData[i].totalArticle;
					lrDetailsTotalArticleQtyForPAID		= lrDetailsTotalArticleQtyForPAID + tableData[i].totalArticle;
					$("[data-selector='totalArticleQtyForPAID']").html(totalArticleQtyForPAID);
					totalFreightForPAID			= totalFreightForPAID + tableData[i].freightCharge;
					totalLoadingForPAID			= totalLoadingForPAID + tableData[i].loadingCharge;
					totalReceiptChargeForPAID	= totalReceiptChargeForPAID + tableData[i].receiptCharge;
					totalAmountWithoutHamaliForPAID				= totalAmountWithoutHamaliForPAID + tableData[i].totalWithoutHamali;
					
					totalCommissionOnPaidFreight	+= (tableData[i].freightCharge * tableData[i].deliveryCommission) / 100;

					totalFreightForPAIDSTL			+= tableData[i].freightCharge + tableData[i].lrCharge + tableData[i].serviceCharge;
					
					if(flavorConfiguration.replaceAmountWithBlank)
						totalAmountForPAID = " ";
					else
						totalAmountForPAID			= totalAmountForPAID + tableData[i].amount;

					if(flavorConfiguration.replacePaidAmountWithZero)
						 totalAmountForPAID			= 0;
					
					if(flavorConfiguration.showLoadingChargeZeroInPaidLr)
						totalLoadingForPAID			= 0;
						
					if(isDirectAmtCondition)
						totalDirectFreightForPAID += tableData[i].freightCharge;
					else 
						totalConnectingFreightForPAID += tableData[i].freightCharge;

					$("[data-selector='totalAmountForPAID']").html(totalAmountForPAID);
					totalOtherAmountForPAID		= totalOtherAmountForPAID + tableData[i].otherCharge;
					totalFOVAmountForPAID		= totalFOVAmountForPAID + tableData[i].fovCharge;
					
					totalStationaryAmountForPAID		= totalStationaryAmountForPAID + tableData[i].stationaryCharge;
					totalHamaliAmountForPAID			= totalHamaliAmountForPAID + tableData[i].hamaliCharge;
					totalTollAmountForPAID				= totalTollAmountForPAID + tableData[i].tollCharge;
					totalDoorCollectionAmountForPAID	= totalDoorCollectionAmountForPAID + tableData[i].doorCollectionCharge;
					totalDoorDeliveryAmountForPAID		= totalDoorDeliveryAmountForPAID + tableData[i].doorDeliveryCharge;
					totalSmsAmountForPAID				= totalSmsAmountForPAID + tableData[i].smsCharge;
					totalServiceTaxForPAID				= totalServiceTaxForPAID +	tableData[i].serviceTax;
					totalWayBillDiscountForPAID			= totalWayBillDiscountForPAID +	 tableData[i].wayBillDiscount;
					totalActualWeightForPAID			= totalActualWeightForPAID +  tableData[i].actualWeight;
					lrDetailsTotalActualWeightForPAID	= lrDetailsTotalActualWeightForPAID +  tableData[i].actualWeight;
					totalActualWeightForPAIDRoundOff	= totalActualWeightForPAID.toFixed(2);
					totalActualWeightForNmlPAID			= totalActualWeightForPAID - (5 * totalArticleQtyForPAID);
					lrDetailsTotalActualWeightForNmlPAID= lrDetailsTotalActualWeightForPAID - (5 * totalArticleQtyForPAID);
					totalChargeWeightForPAID			= totalChargeWeightForPAID +  tableData[i].chargeWeight;
					totalOtherAmount1ForPAID			= totalOtherAmount1ForPAID + tableData[i].otherAmount;
					totalDoorPickupAmountForPAID		= totalDoorPickupAmountForPAID + tableData[i].doorPickupCharge;
					totalOtherAmountAptcForPAID			= totalOtherAmountAptcForPAID + tableData[i].otherChargeAmountAptc;
					totalAdvancePaidAptcForPAID			= totalAdvancePaidAptcForPAID + tableData[i].advancePaid;
					totalBalanceAmountAptcForPAID		= totalBalanceAmountAptcForPAID + tableData[i].balance;
					totalCartageAmountForPAID			= totalCartageAmountForPAID + tableData[i].cartageAmount;
					totalCodAmountForPAID				= totalCodAmountForPAID + tableData[i].CodAmount;
					totalDocketAmountForPAID			= totalDocketAmountForPAID + tableData[i].DocketAmount;
					totalLrChargeAmountForPAID			= totalLrChargeAmountForPAID + tableData[i].lrCharge;
					totalCrossingChargeAmountForPAID	= totalCrossingChargeAmountForPAID + tableData[i].wayBillCrossingAmount;
					totalUnloadingForPAID				= Math.round(totalUnloadingForPAID + tableData[i].doorDeliveryCharge +	tableData[i].unloadingAmount);
					totalTotalForPAID					= Math.round(totalTotalForPAID	+ tableData[i].freightCharge + tableData[i].loadingCharge + tableData[i].stCharge +	 tableData[i].otherCharge) ;
					totalGrandTotalForPAID				= Math.round(totalTotalForPAID + totalUnloadingForPAID);
					totalDoorDeliveryForPAID			= Math.round(totalDoorDeliveryForPAID + tableData[i].doorDeliveryCharge);
					totalSTChargeForPAID			= totalSTChargeForPAID + tableData[i].stCharge;
					totalTempoBhadaBookingForPAID			= totalTempoBhadaBookingForPAID + tableData[i].tempoBhadaBooking;
					totalCrossingHireForPAID			= totalCrossingHireForPAID + tableData[i].crossingHire;
					totalUnldingForPAID				= totalUnldingForPAID + tableData[i].unloadingAmount;
					totalHandlingChargeForPAID		= totalHandlingChargeForPAID + tableData[i].handlingCharge;
					totalStaticalChargeForPAID		= totalStaticalChargeForPAID + tableData[i].staticalCharge;
					totalTollGateChargeForPAID		= totalTollGateChargeForPAID + tableData[i].tollGateCharge;
					totalCantonmentChargeForPAID	= totalCantonmentChargeForPAID + tableData[i].cantonmentCharge;
					totalWeightBridgeChargeForPAID	= totalWeightBridgeChargeForPAID + tableData[i].weightBridgeCharge;
					totalPickupChargeAmountForPAID	= totalPickupChargeAmountForPAID + tableData[i].pickupCharge;
					totalPaidHamaliAmountForPAID	= totalPaidHamaliAmountForPAID + tableData[i].paidHamaliCharge;
					totalIandSAmountForPAID			= totalIandSAmountForPAID + tableData[i].iandSCharge;
					totalUnloadingAmtForPAID		= totalUnloadingAmtForPAID+tableData[i].unloadingAmount;
					totalSurChargeAmtForPAID		= totalSurChargeAmtForPAID + tableData[i].surCharge;
					totalArtChargeAmtForPAID		= totalArtChargeAmtForPAID + tableData[i].artCharge;
					totalWithPassChargeAmtForPAID	= totalWithPassChargeAmtForPAID + tableData[i].withPassCharge;
					totalLucChargeAmtForPAID		= totalLucChargeAmtForPAID + tableData[i].lucCharge;
					totalVscChargeAmtForPAID		= totalVscChargeAmtForPAID + tableData[i].vscCharge;
					totalDoorBookChargeAmtForPAID	= totalDoorBookChargeAmtForPAID + tableData[i].doorBookCharge;
					totalBuiltyForPAID				= totalBuiltyForPAID + tableData[i].wayBillBuiltyAmount;
					totalHCChargeForPAID			= totalHCChargeForPAID + tableData[i].hcCharge;
					totalToPayHamaliForPAID			= totalToPayHamaliForPAID + tableData[i].toPayHmali;
					totalWayBillCodVppAmountForPAID	= totalWayBillCodVppAmountForPAID + tableData[i].wayBillCodVppAmount;
					totalDCChargeAmountForPAID		= totalDCChargeAmountForPAID + tableData[i].dcCharge;
					totalDDChargeAmountForPAID		= totalDDChargeAmountForPAID + tableData[i].ddCharge;
					totalDBCChargeAmountForPAID		= totalDBCChargeAmountForPAID + tableData[i].dbcCharge;
					totalDDCChargeAmountForPAID		= totalDDCChargeAmountForPAID + tableData[i].ddcCharge;
					totalEwayBillCountForPAID		= totalEwayBillCountForPAID  + tableData[i].ewayBillCount;
					totalBookingTotalForPAID			= totalBookingTotalForPAID  + tableData[i].bookingTotal;

					if(tableData[i].crossingLR)
						totalCrossingLrActualWeightForPAID = totalCrossingLrActualWeightForPAID + tableData[i].actualWeight;
					
					totalPaidLr++;
					
					if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
						totalPaidDoorDly++;
				}
		
				if (tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) { // For SummaryTable
					totalArticleQtyForTOPAY			= totalArticleQtyForTOPAY + tableData[i].totalArticle;
					lrDetailsTotalArticleQtyForTOPAY= lrDetailsTotalArticleQtyForTOPAY + tableData[i].totalArticle;
					totalFreightForTOPAY			= totalFreightForTOPAY + tableData[i].freightCharge;
					totalLoadingForTOPAY			= totalLoadingForTOPAY + tableData[i].loadingCharge;
					totalReceiptChargeForTOPAY		= totalReceiptChargeForTOPAY + tableData[i].receiptCharge;
					totalCollectionChargeForTOPAY	= totalCollectionChargeForTOPAY	+ tableData[i].collectionCharge;
					
					totalCommissionOnToPayFreight	+= (tableData[i].freightCharge * tableData[i].deliveryCommission) / 100;
					
					$("[data-selector='totalArticleQtyForTOPAY']").html(totalArticleQtyForTOPAY);
					
					if(flavorConfiguration.replaceAmountWithBlank)
						totalAmountForTOPAY = " ";
					else
						totalAmountForTOPAY			= totalAmountForTOPAY + tableData[i].amount;
					
					$("[data-selector='totalAmountForTOPAY']").html(totalAmountForTOPAY);
					
					totalFreightForTOPAYSTL		  += tableData[i].freightCharge + tableData[i].lrCharge + tableData[i].serviceCharge;
					
					totalOtherAmountForTOPAY			= totalOtherAmountForTOPAY + tableData[i].otherCharge;
					totalFOVAmountForTOPAY				= totalFOVAmountForTOPAY + tableData[i].fovCharge;
					totalcrossingHireAmtTopay			= totalcrossingHireAmtTopay + tableData[i].crossingHireAmt;
					totalStationaryAmountForTOPAY		= totalStationaryAmountForTOPAY + tableData[i].stationaryCharge;
					totalHamaliAmountForTOPAY			= totalHamaliAmountForTOPAY +  tableData[i].hamaliCharge;
					totalTollAmountForTOPAY				= totalTollAmountForTOPAY + tableData[i].tollCharge;
					totalDoorCollectionAmountForTOPAY	= totalDoorCollectionAmountForTOPAY + tableData[i].doorCollectionCharge;
					totalDoorDeliveryAmountForTOPAY		= totalDoorDeliveryAmountForTOPAY + tableData[i].doorDeliveryCharge;
					totalSmsAmountForTOPAY				= totalSmsAmountForTOPAY + tableData[i].smsCharge;
					totalServiceTaxForTOPAY				= totalServiceTaxForTOPAY + tableData[i].serviceTax;
					totalWayBillDiscountForTOPAY		= totalWayBillDiscountForTOPAY + tableData[i].wayBillDiscount;
					totalActualWeightForTOPAY			= totalActualWeightForTOPAY + tableData[i].actualWeight;
					lrDetailsTotalActualWeightForTOPAY	= lrDetailsTotalActualWeightForTOPAY + tableData[i].actualWeight;
					totalActualWeightForNmlTOPAY			= totalActualWeightForTOPAY - (5 * totalArticleQtyForTOPAY);
					lrDetailsTotalActualWeightForNmlTOPAY	= lrDetailsTotalActualWeightForTOPAY - (5 * totalArticleQtyForTOPAY)
					
					if(!isNaN(totalActualWeightForTOPAY))
						totalActualWeightForTOPAYRoundOff	= totalActualWeightForTOPAY.toFixed(2);
					
					totalChargeWeightForTOPAY			= totalChargeWeightForTOPAY +  tableData[i].chargeWeight;
					totalOtherAmount1ForTOPAY			= totalOtherAmount1ForTOPAY + tableData[i].otherAmount;
					totalDoorPickupAmountForTOPAY		= totalDoorPickupAmountForTOPAY + tableData[i].doorPickupCharge;
					totalOtherAmountAptcForTOPAY		= totalOtherAmountAptcForTOPAY + tableData[i].otherChargeAmountAptc;
					totalAdvancePaidAptcForTOPAY		= totalAdvancePaidAptcForTOPAY + tableData[i].advancePaid;
					totalBalanceAmountAptcForTOPAY		= totalBalanceAmountAptcForTOPAY + tableData[i].balance;
					totalCartageAmountForTOPAY			= totalCartageAmountForTOPAY+ tableData[i].cartageAmount;
					totalCodAmountForTOPAY				= totalCodAmountForTOPAY+ tableData[i].CodAmount;
					totalDocketAmountForTOPAY			= totalDocketAmountForTOPAY+ tableData[i].DocketAmount;
					totalLrChargeAmountForTOPAY			= totalLrChargeAmountForTOPAY + tableData[i].lrCharge;
					totalCrossingChargeAmountForTOPAY	= totalCrossingChargeAmountForTOPAY + tableData[i].wayBillCrossingAmount;
					totalUnloadingForTOPAY				= Math.round(totalUnloadingForTOPAY + tableData[i].doorDeliveryCharge + tableData[i].unloadingAmount);
					totalTotalForTOPAY					= Math.round(totalTotalForTOPAY + tableData[i].freightCharge + tableData[i].loadingCharge + tableData[i].stCharge +	 tableData[i].otherCharge) ;
					totalGrandTotalForTOPAY				= Math.round(totalTotalForTOPAY + totalUnloadingForTOPAY);
					totalSTChargeForTOPAY				= totalSTChargeForTOPAY + tableData[i].stCharge;
					totalTempoBhadaBookingForTOPAY		= totalTempoBhadaBookingForTOPAY + tableData[i].tempoBhadaBooking;
					totalCrossingHireForTOPAY			= totalCrossingHireForTOPAY + tableData[i].crossingHire;
					totalUnldingForTOPAY				= totalUnldingForTOPAY + tableData[i].unloadingAmount;
					totalHandlingChargeForTOPAY			= totalHandlingChargeForTOPAY + tableData[i].handlingCharge;
					totalStaticalChargeForTOPAY			= totalStaticalChargeForTOPAY + tableData[i].staticalCharge;
					totalTollGateChargeForTOPAY			= totalTollGateChargeForTOPAY + tableData[i].tollGateCharge;
					totalCantonmentChargeForTOPAY		= totalCantonmentChargeForTOPAY + tableData[i].cantonmentCharge;
					totalWeightBridgeChargeForTOPAY		= totalWeightBridgeChargeForTOPAY + tableData[i].weightBridgeCharge;
					totalPickupChargeAmountForTOPAY		= totalPickupChargeAmountForTOPAY + tableData[i].pickupCharge;
					totalPaidHamaliAmountForTOPAY		= totalPaidHamaliAmountForTOPAY + tableData[i].paidHamaliCharge;
					totalIandSAmountForTOPAY			= totalIandSAmountForTOPAY + tableData[i].iandSCharge;
					totalUnloadingAmtForTOPAY			= totalUnloadingAmtForTOPAY+tableData[i].unloadingAmount;
					totalSurChargeAmtForTOPAY			= totalSurChargeAmtForTOPAY + tableData[i].surCharge;
					totalArtChargeAmtForTOPAY			= totalArtChargeAmtForTOPAY + tableData[i].artCharge;
					totalWithPassChargeAmtForTOPAY		= totalWithPassChargeAmtForTOPAY + tableData[i].withPassCharge;
					totalLucChargeAmtForTOPAY			= totalLucChargeAmtForTOPAY + tableData[i].lucCharge;
					totalVscChargeAmtForTOPAY			= totalVscChargeAmtForTOPAY + tableData[i].vscCharge;
					totalDoorBookChargeAmtForTOPAY		= totalDoorBookChargeAmtForTOPAY + tableData[i].doorBookCharge;
					totalBuiltyForTOPAY					= totalBuiltyForTOPAY + tableData[i].wayBillBuiltyAmount;
					totalHCChargeForTOPAY				= totalHCChargeForTOPAY + tableData[i].hcCharge;
					totalToPayHamaliForTOPAY			= totalToPayHamaliForTOPAY + tableData[i].toPayHmali;
					totalWayBillCodVppAmountForTOPAY	= totalWayBillCodVppAmountForTOPAY+ tableData[i].wayBillCodVppAmount;
					totalDCChargeAmountForTOPAY			= totalDCChargeAmountForTOPAY + tableData[i].dcCharge;
					totalDDChargeAmountForTOPAY			= totalDDChargeAmountForTOPAY + tableData[i].ddCharge;
					totalDBCChargeAmountForTOPAY		= totalDBCChargeAmountForTOPAY + tableData[i].dbcCharge;
					totalDDCChargeAmountForTOPAY		= totalDDCChargeAmountForTOPAY + tableData[i].ddcCharge;
					totalEwayBillCountForTOPAY			= totalEwayBillCountForTOPAY  + tableData[i].ewayBillCount;
					totalBookingTotalForTOPAY			= totalBookingTotalForTOPAY  + tableData[i].bookingTotal;

					
					if(tableData[i].crossingLR)
					totalCrossingLrActualWeightForTOPAY = totalCrossingLrActualWeightForTOPAY + tableData[i].actualWeight;
					
					totalToPayLr++;
					
					if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
						totalToPayDoorDly++;
						
					if(isDirectAmtCondition)
						totalDirectFreightForTOPAY += tableData[i].freightCharge;
					else
						totalConnectingFreightForTOPAY += tableData[i].freightCharge;
				}
				
				if (tableData[i].wayBillTypeId == WAYBILL_TYPE_FOC) { // For SummaryTable
					totalArticleQtyForFOC				= totalArticleQtyForFOC + tableData[i].totalArticle;
					lrDetailsTotalArticleQtyForFOC		= lrDetailsTotalArticleQtyForFOC + tableData[i].totalArticle;
					
					$("[data-selector='totalArticleQtyForFOC']").html(totalArticleQtyForFOC);
					
					$("[data-selector='totalAmountForFOC']").html(0);
					
					totalFreightForFOCSTL		 += tableData[i].freightCharge + tableData[i].lrCharge + tableData[i].serviceCharge;
					
					totalActualWeightForFOC				= totalActualWeightForFOC +	 tableData[i].actualWeight;
					lrDetailsTotalActualWeightForFOC	= lrDetailsTotalActualWeightForFOC +  tableData[i].actualWeight;
					totalActualWeightForFOCRoundOff		= totalActualWeightForFOC.toFixed(2);
					totalActualWeightForNmlFOC			= totalActualWeightForFOC - (5 * totalArticleQtyForFOC);
					lrDetailsTotalActualWeightForNmlFOC	= lrDetailsTotalActualWeightForFOC - (5 * totalArticleQtyForFOC)
					totalChargeWeightForFOC				= totalChargeWeightForFOC +	 tableData[i].chargeWeight;
					totalEwayBillCountForFOC			= totalEwayBillCountForFOC  + tableData[i].ewayBillCount;
					totalBookingTotalForFOC				= totalBookingTotalForFOC  + tableData[i].bookingTotal;

					
					if(tableData[i].crossingLR)
					totalCrossingLrActualWeightForFOC = totalCrossingLrActualWeightForFOC + tableData[i].actualWeight;
					
					totalFocLr++;
					
					if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
						totalFocDoorDly++;
				}
				
				if (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit') { // For SummaryTable
					totalArticleQtyForCREDIT			= totalArticleQtyForCREDIT + tableData[i].totalArticle;
					lrDetailsTotalArticleQtyForCREDIT	= lrDetailsTotalArticleQtyForCREDIT + tableData[i].totalArticle;
					$("[data-selector='totalArticleQtyForCREDIT']").html(totalArticleQtyForCREDIT);
					totalFreightForCREDIT				= totalFreightForCREDIT + tableData[i].freightCharge;
					totalLoadingForCREDIT				= totalLoadingForCREDIT + tableData[i].loadingCharge;
					totalReceiptChargeForCREDIT			= totalReceiptChargeForCREDIT + tableData[i].receiptCharge;
					totalCollectionChargeForCREDIT		= totalCollectionChargeForCREDIT + tableData[i].collectionCharge;
					totalAmountWithoutHamaliForCREDIT				= totalAmountWithoutHamaliForCREDIT + tableData[i].totalWithoutHamali;
					
					if(flavorConfiguration.replaceAmountWithBlank)
						totalAmountForCREDIT = " ";
					else
						totalAmountForCREDIT		= totalAmountForCREDIT + tableData[i].amount;
						
					totalCommissionOnTBBFreight		+= (tableData[i].freightCharge * tableData[i].deliveryCommission) / 100;
					
					$("[data-selector='totalAmountForCREDIT']").html(totalAmountForCREDIT);
					totalOtherAmountForCREDIT			= totalOtherAmountForCREDIT + tableData[i].otherCharge;
					totalFOVAmountForCREDIT				= totalFOVAmountForCREDIT + tableData[i].fovCharge;
					
					totalStationaryAmountForCREDIT		= totalStationaryAmountForCREDIT + tableData[i].stationaryCharge;
					totalHamaliAmountForCREDIT			= totalHamaliAmountForCREDIT + tableData[i].hamaliCharge;
					totalTollAmountForCREDIT			= totalTollAmountForCREDIT + tableData[i].tollCharge;
					totalDoorCollectionAmountForCREDIT	= totalDoorCollectionAmountForCREDIT + tableData[i].doorCollectionCharge;
					totalDoorDeliveryAmountForCREDIT	= totalDoorDeliveryAmountForCREDIT + tableData[i].doorDeliveryCharge;
					totalSmsAmountForCREDIT				= totalSmsAmountForCREDIT + tableData[i].smsCharge;
					totalServiceTaxForCREDIT			= totalServiceTaxForCREDIT +  tableData[i].serviceTax;
					totalWayBillDiscountForCREDIT		= totalWayBillDiscountForCREDIT +  tableData[i].wayBillDiscount;
					totalActualWeightForCREDIT			= totalActualWeightForCREDIT +	tableData[i].actualWeight;
					lrDetailsTotalActualWeightForCREDIT = lrDetailsTotalActualWeightForCREDIT +	 tableData[i].actualWeight;
					totalActualWeightForCREDITRoundOff	= totalActualWeightForCREDIT.toFixed(2);
					totalActualWeightForNmlCREDIT			= totalActualWeightForCREDIT -(5 * totalArticleQtyForCREDIT);
					lrDetailsTotalActualWeightForNmlCREDIT	= lrDetailsTotalActualWeightForCREDIT -(5 * totalArticleQtyForCREDIT)
					totalChargeWeightForCREDIT				= totalChargeWeightForCREDIT +	tableData[i].chargeWeight;
					totalOtherAmount1ForCREDIT				= totalOtherAmount1ForCREDIT + tableData[i].otherAmount;
					totalDoorPickupAmountForCREDIT			= totalDoorPickupAmountForCREDIT + tableData[i].doorPickupCharge;
					totalOtherAmountAptcForCREDIT		= totalOtherAmountAptcForCREDIT + tableData[i].otherChargeAmountAptc;
					totalAdvancePaidAptcForCREDIT		= totalAdvancePaidAptcForCREDIT + tableData[i].advancePaid;
					totalBalanceAmountAptcForCREDIT		= totalBalanceAmountAptcForCREDIT + tableData[i].balance;
					totalCartageAmountForCREDIT			= totalCartageAmountForCREDIT + tableData[i].cartageAmount;
					totalCodAmountForCREDIT				= totalCodAmountForCREDIT + tableData[i].CodAmount;
					totalDocketAmountForCREDIT			= totalDocketAmountForCREDIT + tableData[i].DocketAmount;
					totalLrChargeAmountForCREDIT		= totalLrChargeAmountForCREDIT + tableData[i].lrCharge;
					totalCrossingChargeAmountForCREDIT	= totalCrossingChargeAmountForCREDIT + tableData[i].wayBillCrossingAmount;
					totaltotalUnloadingForCREDIT		= Math.round(totaltotalUnloadingForCREDIT + tableData[i].doorDeliveryCharge + tableData[i].unloadingAmount);
					totalTotalForCREDIT					= Math.round(totalTotalForCREDIT + tableData[i].freightCharge + tableData[i].loadingCharge + tableData[i].stCharge +  tableData[i].otherCharge);
					totalGrandTotalForCREDIT			= Math.round( totalTotalForCREDIT + totaltotalUnloadingForCREDIT);
					totalDoorDeliveryForCREDIT			= totalDoorDeliveryForCREDIT + tableData[i].doorDeliveryCharge;
					totalSTChargeForCREDIT				= totalSTChargeForCREDIT + tableData[i].stCharge;
					totalTempoBhadaBookingForCREDIT		= totalTempoBhadaBookingForCREDIT + tableData[i].tempoBhadaBooking;
					totalCrossingHireForCREDIT			= totalCrossingHireForCREDIT + tableData[i].crossingHire;
					totalUnldingForCREDIT				= totalUnldingForCREDIT + tableData[i].unloadingAmount;
					totalHandlingChargeForCREDIT		= totalHandlingChargeForCREDIT + tableData[i].handlingCharge;
					totalStaticalChargeForCREDIT		= totalStaticalChargeForCREDIT + tableData[i].staticalCharge;
					totalTollGateChargeForCREDIT		= totalTollGateChargeForCREDIT + tableData[i].tollGateCharge;
					totalCantonmentChargeForCREDIT		= totalCantonmentChargeForCREDIT + tableData[i].cantonmentCharge;
					totalWeightBridgeChargeForCREDIT	= totalWeightBridgeChargeForCREDIT + tableData[i].weightBridgeCharge;
					totalPickupChargeAmountForCREDIT	= totalPickupChargeAmountForCREDIT + tableData[i].pickupCharge;
					totalPaidHamaliAmountForCREDIT		= totalPaidHamaliAmountForCREDIT + tableData[i].paidHamaliCharge;
					totalIandSAmountForCREDIT			= totalIandSAmountForCREDIT + tableData[i].iandSCharge;
					totalUnloadingAmtForCREDIT			= totalUnloadingAmtForCREDIT+tableData[i].unloadingAmount;
					totalSurChargeAmtForCREDIT			= totalSurChargeAmtForCREDIT + tableData[i].surCharge;
					totalArtChargeAmtForCREDIT			= totalArtChargeAmtForCREDIT + tableData[i].artCharge;
					totalWithPassChargeAmtForCREDIT		= totalWithPassChargeAmtForCREDIT + tableData[i].withPassCharge;
					totalLucChargeAmtForCREDIT			= totalLucChargeAmtForCREDIT + tableData[i].lucCharge;
					totalVscChargeAmtForCREDIT			= totalVscChargeAmtForCREDIT + tableData[i].vscCharge;
					totalDoorBookChargeAmtForCREDIT		= totalDoorBookChargeAmtForCREDIT + tableData[i].doorBookCharge;
					totalBuiltyForCREDIT				= totalBuiltyForCREDIT + tableData[i].wayBillBuiltyAmount;
					totalHCChargeForCREDIT				= totalHCChargeForCREDIT + tableData[i].hcCharge;
					totalToPayHamaliForCREDIT			= totalToPayHamaliForCREDIT + tableData[i].toPayHmali;
					totalWayBillCodVppAmountForCREDIT	= totalWayBillCodVppAmountForCREDIT + tableData[i].wayBillCodVppAmount;
					totalFreightForCREDITSTL		   += tableData[i].freightCharge + tableData[i].lrCharge + tableData[i].serviceCharge;
					totalDCChargeAmountForCREDIT			= totalDCChargeAmountForCREDIT + tableData[i].dcCharge;
					totalDDChargeAmountForCREDIT			= totalDDChargeAmountForCREDIT + tableData[i].ddCharge;
					totalDBCChargeAmountForCREDIT		= totalDBCChargeAmountForCREDIT + tableData[i].dbcCharge;
					totalDDCChargeAmountForCREDIT		= totalDDCChargeAmountForCREDIT + tableData[i].ddcCharge;
					totalEwayBillCountForCREDIT			= totalEwayBillCountForCREDIT  + tableData[i].ewayBillCount;
					totalBookingTotalForCREDIT			= totalBookingTotalForCREDIT  + tableData[i].bookingTotal;
					
					if(tableData[i].crossingLR)
					totalCrossingLrActualWeightForCREDIT = totalCrossingLrActualWeightForCREDIT + tableData[i].actualWeight;
					
					totalTbbLr++;
					
					if(tableData[i].deliveryTypeId == DELIVERY_TO_DOOR_ID)
						totalTbbDoorDly++;
						
					if(isDirectAmtCondition)
						totalDirectFreightForCREDIT += tableData[i].freightCharge;
					else
						totalConnectingFreightForCREDIT += tableData[i].freightCharge;
				}
				if (tableData[i].isBold) {
					$(newtr).addClass("bold , fontSize20px")
				}
				
				$(tbody).before(newtr);
			}

			agentCommissionOnPaidFreight	= (totalFreightForPAID * 10) / 100;
			agentCommissionOnTopayFreight	= (totalFreightForTOPAY * 10) / 100;

			summeryObject.totalArticleQtyForPAID			= totalArticleQtyForPAID;
			summeryObject.lrDetailsTotalArticleQtyForPAID	= lrDetailsTotalArticleQtyForPAID;
			summeryObject.totalArticleQtyForTOPAY			= totalArticleQtyForTOPAY;
			summeryObject.lrDetailsTotalArticleQtyForTOPAY	= lrDetailsTotalArticleQtyForTOPAY;
			summeryObject.totalArticleQtyForFOC				= totalArticleQtyForFOC;
			summeryObject.lrDetailsTotalArticleQtyForFOC	= lrDetailsTotalArticleQtyForFOC;
			summeryObject.totalArticleQtyForCREDIT			= totalArticleQtyForCREDIT;
			summeryObject.lrDetailsTotalArticleQtyForCREDIT	= lrDetailsTotalArticleQtyForCREDIT;
			summeryObject.totalFreightForPAID		= totalFreightForPAID;
			summeryObject.totalFreightForTOPAY		= totalFreightForTOPAY;
			summeryObject.totalFreightForFOC		= 0;
			summeryObject.totalFreightForCREDIT		= totalFreightForCREDIT;
			summeryObject.totalLoadingForPAID		= totalLoadingForPAID;
			summeryObject.totalLoadingForTOPAY		= totalLoadingForTOPAY;
			summeryObject.totalLoadingForFOC		= 0;
			summeryObject.totalLoadingForCREDIT		= totalLoadingForCREDIT;
			summeryObject.totalAmountForPAID		= Number(Number(totalAmountForPAID).toFixed(2));
			summeryObject.totalAmountForTOPAY		= Number(Number(totalAmountForTOPAY).toFixed(2));
			summeryObject.totalAmountForFOC			= 0;
			summeryObject.totalAmountForCREDIT		= Number(Number(totalAmountForCREDIT).toFixed(2));
			summeryObject.totalOtherAmountForPAID	= totalOtherAmountForPAID;
			summeryObject.totalOtherAmountForTOPAY	= totalOtherAmountForTOPAY;
			summeryObject.totalOtherAmountForFOC	= 0;
			summeryObject.totalOtherAmountForCREDIT	= totalOtherAmountForCREDIT;
			summeryObject.totalFOVAmountForPAID		= totalFOVAmountForPAID;
			summeryObject.totalFOVAmountForTOPAY	= totalFOVAmountForTOPAY;
			summeryObject.totalFOVAmountForFOC		= 0;
			summeryObject.totalFOVAmountForCREDIT	= totalFOVAmountForCREDIT;
			
			summeryObject.totalStationaryAmountForPAID		= totalStationaryAmountForPAID;
			summeryObject.totalStationaryAmountForTOPAY		= totalStationaryAmountForTOPAY;
			summeryObject.totalStationaryAmountForFOC		= 0;
			summeryObject.totalStationaryAmountForCREDIT	= totalStationaryAmountForCREDIT;
			summeryObject.totalHamaliAmountForPAID			= totalHamaliAmountForPAID;
			summeryObject.totalHamaliAmountForTOPAY			= totalHamaliAmountForTOPAY;
			summeryObject.totalHamaliAmountForFOC			= 0;
			summeryObject.totalHamaliAmountForCREDIT		= totalHamaliAmountForCREDIT;
			summeryObject.totalTollAmountForPAID			= totalTollAmountForPAID;
			summeryObject.totalTollAmountForTOPAY			= totalTollAmountForTOPAY;
			summeryObject.totalTollAmountForFOC				= 0;
			summeryObject.totalTollAmountForCREDIT			= totalTollAmountForCREDIT;
			summeryObject.totalDoorCollectionAmountForPAID	= totalDoorCollectionAmountForPAID;
			summeryObject.totalDoorCollectionAmountForTOPAY	= totalDoorCollectionAmountForTOPAY;
			summeryObject.totalDoorCollectionAmountForFOC	= 0;
			summeryObject.totalDoorCollectionAmountForCREDIT= totalDoorCollectionAmountForCREDIT;
			summeryObject.totalDoorDeliveryAmountForPAID	= totalDoorDeliveryAmountForPAID;
			summeryObject.totalDoorDeliveryAmountForTOPAY	= totalDoorDeliveryAmountForTOPAY;
			summeryObject.totalDoorDeliveryAmountForFOC		= 0;
			summeryObject.totalDoorDeliveryAmountForCREDIT	= totalDoorDeliveryAmountForCREDIT;
			
			summeryObject.totalSmsAmountForPAID		= totalSmsAmountForPAID;
			summeryObject.totalSmsAmountForTOPAY	= totalSmsAmountForTOPAY;
			summeryObject.totalSmsAmountForFOC		= 0;
			summeryObject.totalSmsAmountForCREDIT	= totalSmsAmountForCREDIT;
			
			summeryObject.totalActualWeightForPAID				= totalActualWeightForPAID;
			summeryObject.lrDetailsTotalActualWeightForPAID		= lrDetailsTotalActualWeightForPAID;
			summeryObject.totalActualWeightForPAIDRoundOff		= totalActualWeightForPAIDRoundOff;
			summeryObject.totalActualWeightForTOPAY				= totalActualWeightForTOPAY;
			summeryObject.lrDetailsTotalActualWeightForTOPAY	= lrDetailsTotalActualWeightForTOPAY;
			summeryObject.totalActualWeightForTOPAYRoundOff		= totalActualWeightForTOPAYRoundOff;
			summeryObject.totalActualWeightForFOC				= totalActualWeightForFOC;
			summeryObject.lrDetailsTotalActualWeightForFOC		= lrDetailsTotalActualWeightForFOC;
			summeryObject.totalActualWeightForFOCRoundOff		= totalActualWeightForFOCRoundOff
			summeryObject.totalActualWeightForCREDIT			= totalActualWeightForCREDIT;
			summeryObject.lrDetailsTotalActualWeightForCREDIT	= lrDetailsTotalActualWeightForCREDIT;
			summeryObject.totalActualWeightForCREDITRoundOff	= totalActualWeightForCREDITRoundOff;
			
			summeryObject.totalActualWeightForNmlPAID			= totalActualWeightForNmlPAID;
			summeryObject.totalActualWeightForNmlTOPAY			= totalActualWeightForNmlTOPAY;
			summeryObject.totalActualWeightForNmlFOC			= totalActualWeightForNmlFOC;
			summeryObject.totalActualWeightForNmlCREDIT			= totalActualWeightForNmlCREDIT;
			
			summeryObject.totalChargeWeightForPAID	= totalChargeWeightForPAID;
			summeryObject.totalChargeWeightForTOPAY	= totalChargeWeightForTOPAY;
			summeryObject.totalChargeWeightForFOC	= totalChargeWeightForFOC;
			summeryObject.totalChargeWeightForCREDIT= totalChargeWeightForCREDIT;
			
			summeryObject.totalOtherAmount1ForPAID	= totalOtherAmount1ForPAID;
			summeryObject.totalOtherAmount1ForTOPAY	= totalOtherAmount1ForTOPAY;
			summeryObject.totalOtherAmount1ForFOC	= 0;
			summeryObject.totalOtherAmount1ForCREDIT= totalOtherAmount1ForCREDIT;
			
			summeryObject.totalServiceTaxForPAID	= totalServiceTaxForPAID;
			summeryObject.totalServiceTaxForTOPAY	= totalServiceTaxForTOPAY;
			summeryObject.totalServiceTaxForFOC		= 0;
			summeryObject.totalServiceTaxForCREDIT	= totalServiceTaxForCREDIT;
			
			summeryObject.totalWayBillDiscountForPAID		= totalWayBillDiscountForPAID
			summeryObject.totalWayBillDiscountForTOPAY		= totalWayBillDiscountForTOPAY
			summeryObject.totalWayBillDiscountForFOC		= 0
			summeryObject.totalWayBillDiscountForCREDIT		= totalWayBillDiscountForCREDIT
			
			summeryObject.totalPaidLr		= totalPaidLr;
			summeryObject.totalToPayLr		= totalToPayLr;
			summeryObject.totalFocLr		= totalFocLr;
			summeryObject.totalTbbLr		= totalTbbLr;
			
			summeryObject.totalDoorPickupAmountForPAID		= totalDoorPickupAmountForPAID;
			summeryObject.totalDoorPickupAmountForTOPAY		= totalDoorPickupAmountForTOPAY;
			summeryObject.totalDoorPickupAmountForFOC		= 0;
			summeryObject.totalDoorPickupAmountForCREDIT	= totalDoorPickupAmountForCREDIT;
			
			summeryObject.totalOtherAmountAptcForPAID		= totalOtherAmountAptcForPAID;
			summeryObject.totalOtherAmountAptcForTOPAY		= totalOtherAmountAptcForTOPAY;
			summeryObject.totalOtherAmountAptcForFOC		= 0;
			summeryObject.totalOtherAmountAptcForCREDIT		= totalOtherAmountAptcForCREDIT;
			
			summeryObject.totalPaidDoorDly		= totalPaidDoorDly;
			summeryObject.totalToPayDoorDly		= totalToPayDoorDly;
			summeryObject.totalFocDoorDly		= totalFocDoorDly;
			summeryObject.totalTbbDoorDly		= totalTbbDoorDly;
		
			summeryObject.totalAdvancePaidAptcForPAID		= totalAdvancePaidAptcForPAID;
			summeryObject.totalAdvancePaidAptcForTOPAY		= totalAdvancePaidAptcForTOPAY;
			summeryObject.totalAdvancePaidAptcForFOC		= 0;
			summeryObject.totalAdvancePaidAptcForCREDIT		= totalAdvancePaidAptcForCREDIT;
			
			summeryObject.totalBalanceAmountAptcForPAID		= totalBalanceAmountAptcForPAID;
			summeryObject.totalBalanceAmountAptcForTOPAY	= totalBalanceAmountAptcForTOPAY;
			summeryObject.totalBalanceAmountAptcForFOC		= 0;
			summeryObject.totalBalanceAmountAptcForCREDIT	= totalBalanceAmountAptcForCREDIT;
			
			summeryObject.totalCartageAmountForPAID			= totalCartageAmountForPAID;
			summeryObject.totalCartageAmountForTOPAY		= totalCartageAmountForTOPAY;
			summeryObject.totalCartageAmountForFOC			= 0;
			summeryObject.totalCartageAmountForCREDIT		= totalCartageAmountForCREDIT;
			
			summeryObject.totalCodAmountForPAID				= totalCodAmountForPAID;
			summeryObject.totalCodAmountForTOPAY			= totalCodAmountForTOPAY;
			summeryObject.totalCodAmountForCREDIT			= totalCodAmountForCREDIT;
			
			summeryObject.totalDocketAmountForPAID			= totalDocketAmountForPAID;
			summeryObject.totalDocketAmountForTOPAY			= totalDocketAmountForTOPAY;
			summeryObject.totalDocketAmountForFOC			= 0;
			summeryObject.totalDocketAmountForCREDIT		= totalDocketAmountForCREDIT;
			
			summeryObject.totalLrChargeAmountForPAID		= totalLrChargeAmountForPAID
			summeryObject.totalLrChargeAmountForTOPAY		= totalLrChargeAmountForTOPAY
			summeryObject.totalLrChargeAmountForFOC			= 0
			summeryObject.totalLrChargeAmountForCREDIT		= totalLrChargeAmountForCREDIT
			
			summeryObject.totalCrossingChargeAmountForPAID		= totalCrossingChargeAmountForPAID
			summeryObject.totalCrossingChargeAmountForTOPAY		= totalCrossingChargeAmountForTOPAY
			summeryObject.totalCrossingChargeAmountForFOC		= 0
			summeryObject.totalCrossingChargeAmountForCREDIT	= totalCrossingChargeAmountForCREDIT
			
			summeryObject.totalUnloadingForPAID					= totalUnloadingForPAID
			summeryObject.totalUnloadingForTOPAY				= totalUnloadingForTOPAY
			summeryObject.totaltotalUnloadingForFOC				= 0
			summeryObject.totaltotalUnloadingForCREDIT			= totaltotalUnloadingForCREDIT
			
			summeryObject.totalUnldingForPAID					= totalUnldingForPAID
			summeryObject.totalUnldingForTOPAY					= totalUnldingForTOPAY
			summeryObject.totalUnldingForFOC					= 0
			summeryObject.totalUnldingForCREDIT					= totalUnldingForCREDIT
			
			summeryObject.totalTotalForPAID						= totalTotalForPAID
			summeryObject.totalTotalForTOPAY					= totalTotalForTOPAY
			summeryObject.totalTotalForFOC						= 0
			summeryObject.totalTotalForCREDIT					= totalTotalForCREDIT	
			
			summeryObject.totalGrandTotalForPAID				= totalGrandTotalForPAID
			summeryObject.totalGrandTotalForTOPAY				= totalGrandTotalForTOPAY
			summeryObject.totalGrandTotalForFOC					= 0
			summeryObject.totalGrandTotalForCREDIT				= totalGrandTotalForCREDIT 
			
			summeryObject.totalDoorDeliveryForPAID				= totalDoorDeliveryForPAID	
			summeryObject.totalDoorDeliveryForTOPAY				= totalDoorDeliveryForTOPAY	
			summeryObject.totalDoorDeliveryForFOC				= 0	
			summeryObject.totalDoorDeliveryForCREDIT			= totalDoorDeliveryForCREDIT
			
			summeryObject.totalSTChargeForPAID				= totalSTChargeForPAID	
			summeryObject.totalSTChargeForTOPAY				= totalSTChargeForTOPAY	
			summeryObject.totalSTChargeForFOC				= 0	
			summeryObject.totalSTChargeForCREDIT			= totalSTChargeForCREDIT
			
			summeryObject.totalTempoBhadaBookingForPAID		= totalTempoBhadaBookingForPAID	
			summeryObject.totalTempoBhadaBookingForTOPAY	= totalTempoBhadaBookingForTOPAY	
			summeryObject.totalTempoBhadaBookingForFOC		= 0	
			summeryObject.totalTempoBhadaBookingForCREDIT	= totalTempoBhadaBookingForCREDIT
			
			summeryObject.totalCrossingHireForPAID			= totalCrossingHireForPAID	
			summeryObject.totalCrossingHireForTOPAY			= totalCrossingHireForTOPAY	
			summeryObject.totalCrossingHireForFOC			= 0	
			summeryObject.totalCrossingHireForCREDIT		= totalCrossingHireForCREDIT
						
			summeryObject.totalPickupChargeForPAID				= totalPickupChargeAmountForPAID	
			summeryObject.totalPickupChargeForTOPAY				= totalPickupChargeAmountForTOPAY	
			summeryObject.totalPickupChargeForFOC				= 0	
			summeryObject.totalPickupChargeForCREDIT			= totalPickupChargeAmountForCREDIT
			
			summeryObject.totalHandlingChargeForPAID			= totalHandlingChargeForPAID	
			summeryObject.totalHandlingChargeForTOPAY			= totalHandlingChargeForTOPAY	
			summeryObject.totalHandlingChargeForFOC				= 0	
			summeryObject.totalHandlingChargeForCREDIT			= totalHandlingChargeForCREDIT
			
			summeryObject.totalPaidHamaliAmountForPAID		= totalPaidHamaliAmountForPAID
			summeryObject.totalPaidHamaliAmountForTOPAY		= totalPaidHamaliAmountForTOPAY
			summeryObject.totalPaidHamaliAmountForFOC		= 0
			summeryObject.totalPaidHamaliAmountForCREDIT	= totalPaidHamaliAmountForCREDIT
			
			summeryObject.totalIandSAmountForPAID			 = totalIandSAmountForPAID
			summeryObject.totalIandSAmountForTOPAY			 = totalIandSAmountForTOPAY
			summeryObject.totalIandSAmountForFOC			 = 0
			summeryObject.totalIandSAmountForCREDIT			 = totalIandSAmountForCREDIT
			
			summeryObject.totalUnloadingAmtForPAID			 = totalUnloadingAmtForPAID
			summeryObject.totalUnloadingAmtForTOPAY			 = totalUnloadingAmtForTOPAY
			summeryObject.totalUnloadingAmtForFOC			 = 0
			summeryObject.totalUnloadingAmtForCREDIT		 = totalUnloadingAmtForCREDIT
			
			summeryObject.totalArtChargeAmtForPAID			 = totalArtChargeAmtForPAID
			summeryObject.totalArtChargeAmtForTOPAY			 = totalArtChargeAmtForTOPAY
			summeryObject.totalArtChargeAmtForFOC			 = 0
			summeryObject.totalArtChargeAmtForCREDIT		 = totalArtChargeAmtForCREDIT
			
			summeryObject.totalWithPassChargeAmtForPAID		 = totalWithPassChargeAmtForPAID
			summeryObject.totalWithPassChargeAmtForTOPAY	 = totalWithPassChargeAmtForTOPAY
			summeryObject.totalWithPassChargeAmtForCREDIT	 = totalWithPassChargeAmtForCREDIT
			
			summeryObject.totalLucChargeAmtForPAID			 = totalLucChargeAmtForPAID
			summeryObject.totalLucChargeAmtForTOPAY			 = totalLucChargeAmtForTOPAY
			summeryObject.totalLucChargeAmtForFOC			 = 0
			summeryObject.totalLucChargeAmtForCREDIT		 = totalLucChargeAmtForCREDIT
			
			summeryObject.totalVscChargeAmtForPAID			 = totalVscChargeAmtForPAID
			summeryObject.totalVscChargeAmtForTOPAY			 = totalVscChargeAmtForTOPAY
			summeryObject.totalVscChargeAmtForFOC			 = 0
			summeryObject.totalVscChargeAmtForCREDIT		 = totalVscChargeAmtForCREDIT
			
			summeryObject.totalDoorBookChargeAmtForPAID		 = totalDoorBookChargeAmtForPAID
			summeryObject.totalDoorBookChargeAmtForTOPAY	 = totalDoorBookChargeAmtForTOPAY
			summeryObject.totalDoorBookChargeAmtForFOC		 = 0
			summeryObject.totalDoorBookChargeAmtForCREDIT	 = totalDoorBookChargeAmtForCREDIT
			
			summeryObject.totalSurChargeAmtForPAID			 = totalSurChargeAmtForPAID
			summeryObject.totalSurChargeAmtForTOPAY			 = totalSurChargeAmtForTOPAY
			summeryObject.totalSurChargeAmtForFOC			 = 0
			summeryObject.totalSurChargeAmtForCREDIT		 = totalSurChargeAmtForCREDIT
			
			summeryObject.totalBuiltyForPAID		 = totalBuiltyForPAID
			summeryObject.totalBuiltyForTOPAY		 = totalBuiltyForTOPAY
			summeryObject.totalBuiltyForFOC			 = 0
			summeryObject.totalBuiltyForCREDIT		 = totalBuiltyForCREDIT
			
			summeryObject.totalHCChargeForPAID		= totalHCChargeForPAID
			summeryObject.totalHCChargeForTOPAY		= totalHCChargeForTOPAY
			summeryObject.totalHCChargeForFOC		= 0
			summeryObject.totalHCChargeForCREDIT	= totalHCChargeForCREDIT
			
			summeryObject.totalToPayHamaliForPAID		= totalToPayHamaliForPAID
			summeryObject.totalToPayHamaliForTOPAY		= totalToPayHamaliForTOPAY
			summeryObject.totalToPayHamaliForFOC		= 0
			summeryObject.totalToPayHamaliForCREDIT	= totalToPayHamaliForCREDIT
			
			summeryObject.totalWayBillCodVppAmountForPAID	 = totalWayBillCodVppAmountForPAID;
			summeryObject.totalWayBillCodVppAmountForTOPAY	 = totalWayBillCodVppAmountForTOPAY;
			summeryObject.totalWayBillCodVppAmountForCREDIT	 = totalWayBillCodVppAmountForCREDIT;
			
			summeryObject.totalDCChargeAmountForPAID		   = totalDCChargeAmountForPAID	
			summeryObject.totalDCChargeAmountForTOPAY			= totalDCChargeAmountForTOPAY	
			summeryObject.totalDCChargeAmountForCREDIT			= totalDCChargeAmountForCREDIT
			
			summeryObject.totalDDChargeAmountForPAID		   = totalDDChargeAmountForPAID	
			summeryObject.totalDDChargeAmountForTOPAY		   = totalDDChargeAmountForTOPAY	
			summeryObject.totalDDChargeAmountForCREDIT		  = totalDDChargeAmountForCREDIT
			
			summeryObject.totalDBCChargeAmountForPAID		   = totalDBCChargeAmountForPAID	
			summeryObject.totalDBCChargeAmountForTOPAY		   = totalDBCChargeAmountForTOPAY	
			summeryObject.totalDBCChargeAmountForCREDIT		   = totalDBCChargeAmountForCREDIT
			
			summeryObject.totalDDCChargeAmountForPAID		   = totalDDCChargeAmountForPAID	
			summeryObject.totalDDCChargeAmountForTOPAY		   = totalDDCChargeAmountForTOPAY	
			summeryObject.totalDDCChargeAmountForCREDIT		   = totalDDCChargeAmountForCREDIT
			
			summeryObject.totalEwayBillCountForPAID		  		= totalEwayBillCountForPAID	
			summeryObject.totalEwayBillCountForTOPAY	   		= totalEwayBillCountForTOPAY
			summeryObject.totalEwayBillCountForCREDIT		   	= totalEwayBillCountForCREDIT
			summeryObject.totalEwayBillCountForFOC		   	= totalEwayBillCountForFOC
			
			summeryObject.totalBookingTotalForPAID		  		= totalBookingTotalForPAID	
			summeryObject.totalBookingTotalForTOPAY	   			= totalBookingTotalForTOPAY
			summeryObject.totalBookingTotalForCREDIT		   	= totalBookingTotalForCREDIT
			summeryObject.totalBookingTotalForFOC		   		= totalBookingTotalForFOC
			
			summeryObject.zeroAmt							= 0
			summeryObject.totalDirectFreightForPAID			 = totalDirectFreightForPAID
			summeryObject.totalConnectingFreightForPAID		 = totalConnectingFreightForPAID
			summeryObject.totalDirectFreightForTOPAY		 = totalDirectFreightForTOPAY
			summeryObject.totalConnectingFreightForTOPAY	 = totalConnectingFreightForTOPAY
			summeryObject.totalDirectFreightForCREDIT		 = totalDirectFreightForCREDIT
			summeryObject.totalConnectingFreightForCREDIT	 = totalConnectingFreightForCREDIT
			summeryObject.totalDirectFreightForFOC			 = 0
			summeryObject.totalConnectingFreightForFOC		 = 0
			summeryObject.totalKantAmt						= totalKantAmt;
			summeryObject.totalFreightForCREDITSTL			= totalFreightForCREDITSTL;
			summeryObject.totalFreightForTOPAYSTL			= totalFreightForTOPAYSTL;
			summeryObject.totalFreightForPAIDSTL			= totalFreightForPAIDSTL;
			summeryObject.totalFreightForFOCSTL				= totalFreightForFOCSTL;					
			summeryObject.totalFreightForStl				= totalFreightForFOCSTL + totalFreightForCREDITSTL + totalFreightForTOPAYSTL + totalFreightForPAIDSTL;
			
			totalSTL			  = totalFreightForCREDITSTL + totalFreightForTOPAYSTL + totalFreightForPAIDSTL + totalFreightForFOCSTL;
			summeryObject.totalSTL = totalSTL;
			
			summeryObject.agentCommissionOnPaidFreight		= agentCommissionOnPaidFreight
			summeryObject.agentCommissionOnTopayFreight		= agentCommissionOnTopayFreight
			summeryObject.agentCommissionOnFocFreight		= 0;

			summeryObject.totalAmountWithoutHamaliForPAID			= totalAmountWithoutHamaliForPAID;
			summeryObject.totalAmountWithoutHamaliForCREDIT			= totalAmountWithoutHamaliForCREDIT;
			
			summeryObject.totalCrossingLrActualWeightForPAID		= totalCrossingLrActualWeightForPAID;
			summeryObject.totalCrossingLrActualWeightForTOPAY		= totalCrossingLrActualWeightForTOPAY;
			summeryObject.totalCrossingLrActualWeightForFOC			= totalCrossingLrActualWeightForFOC;
			summeryObject.totalCrossingLrActualWeightForCREDIT		= totalCrossingLrActualWeightForCREDIT;
			
			$("[data-row='dataTableDetails']").remove();
			$("[data-row='dataTableDetails2']").remove();
			
			if(response.executive.branchId == DRIVER_ACCOUNT_BRANCH_734) {
				$('.consigneeNumber').show();
				$('.lrNoSource').hide();
			} else {
				$('.consigneeNumber').hide();
				$('.lrNoSource').show();
			}
		}, setDataTableTruckDetails : function(tableData, response) {
			var flavorConfiguration					= response.FlavorConfiguration;
			
			if(flavorConfiguration.showPopUpForTruckLs) {
				$('#popUpForPrint').bPopup({
				},function(){
					var _thisMod = this;
					$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
					
					$('#confirm').focus();
					$("#confirm").click(function(){
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					})
					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  //escape
							$('.deliveryCommission').hide();
							$('.payableDetailOthers').hide();
							$('.payableDetail').hide();
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						}
					});
					$("#cancelButton").click(function(){
						$('.deliveryCommission').hide();
						$('.payableDetailOthers').hide();
						$('.payableDetail').hide();
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					});
				});
			}
				
			tableData.pop();
			var tbody					= $("[data-dataTruckTableDetail='srNumber']").parent().parent();
			tbody						= (tbody[tbody.length-1]);
			var totalLRs				= 0;
			actualWeight				= 0;
			deliveryCommission			= 0;
			deliveryCommissionRate		= 0;
			totalArticle					= 0;
			toPayTotalPageWiseFreightCharge	= 0;
			freightCharge					= 0;
			unloadingAmount					= 0;
			bkgTotal						= 0;
			paidAmount						= 0;
			tbbAmount						= 0;
			topayAmount						= 0;
			payableAmountCommissionWise		= 0;
			toPayHamali						= 0;	
			columnObjectForDetails			= $("[data-row='dataTruckTableDetails']").children();
			lc								= 0;
			
			for(var i = 0; i < tableData.length; i++) {
				totalLRs		= tableData[i].srNumber;
				freightCharge	= freightCharge + tableData[i].freightCharge;
				unloadingAmount	= unloadingAmount + tableData[i].unloadingAmount + tableData[i].doorDeliveryCharge;
				actualWeight	= actualWeight	+ tableData[i].actualWeight;
				totalArticle	= totalArticle + tableData[i].totalArticle;
				bkgTotal		= bkgTotal + tableData[i].amount;
				toPayHamali		= toPayHamali + tableData[i].toPayHamali;
				lc				= lc + tableData[i].lc;
					
				if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					toPayTotalPageWiseFreightCharge	= toPayTotalPageWiseFreightCharge + tableData[i].freightCharge;
					
				if(tableData[i].deliveryCommission != undefined)
					deliveryCommissionRate	= tableData[i].deliveryCommission;
				
				if(deliveryCommissionRate > 0) {
					if(flavorConfiguration.calculateCommissionOnFreightCharge)
						deliveryCommission			= deliveryCommissionRate * freightCharge / 100;
					else
						deliveryCommission			= deliveryCommissionRate * bkgTotal / 100;
					
					payableAmountCommissionWise = toPayTotalPageWiseFreightCharge - deliveryCommission ;
				}
					
				var newtr	= $("<tr class='height30px'></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTruckTableDetail");
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("id", $(columnObjectForDetails[j]).attr("id"));
					
					if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
						if (dataPicker == 'paidFreightCharge') {
							if(tableData[i]['lrType'] == 'Paid') {
								$(newtd).html('Paid');
								paidFreight		= paidFreight + tableData[i].freightCharge;
								paidAmount		= paidAmount + tableData[i].amount;
							}
							
							if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html('TBB');
								tbbFright		= tbbFright + tableData[i].freightCharge;
								tbbAmount		= tbbAmount + tableData[i].amount;
							}
						} else if (dataPicker == 'toPayFreightCharge') {
							if (tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i].amount);
								toPayFreight		= toPayFreight + tableData[i].freightCharge;
								topayAmount		= topayAmount + tableData[i].amount;
							}
						} else if (dataPicker == 'tbbFreightCharge') {
							if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html('TBB');
								tbbFright		= tbbFright + tableData[i].freightCharge;
								tbbAmount		= tbbAmount + tableData[i].amount;
							}
						} else if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrDashed) {
							if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
								$(newtd).html('--');
							else
								$(newtd).html(tableData[i].freightCharge);
						} else {
							$(newtd).attr("data-dataTruckTableDetail", $(columnObjectForDetails[j]).attr("data-dataTruckTableDetail"));						
							$(newtd).html(tableData[i][dataPicker]);
						}
					} else {
						if (dataPicker == 'paidFreightCharge') {
							if(tableData[i]['lrType'] == 'Paid') {
								$(newtd).html(tableData[i].amount);
								paidFreight		= paidFreight + tableData[i].freightCharge;
								paidAmount		= paidAmount + tableData[i].amount;
							}
						} else if (dataPicker == 'toPayFreightCharge') {
							if (tableData[i]['lrType'] == 'To Pay') {
								$(newtd).html(tableData[i].amount);
								toPayFreight		= toPayFreight + tableData[i].freightCharge;
								topayAmount		= topayAmount + tableData[i].amount;
							}
						} else if (dataPicker == 'tbbFreightCharge') {
							if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
								$(newtd).html(tableData[i].amount);
								tbbFright		= tbbFright + tableData[i].freightCharge;
								tbbAmount		= tbbAmount + tableData[i].amount;
							}
						} else if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrDashed) {
							if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
								$(newtd).html('--');
							else
								$(newtd).html(tableData[i].freightCharge);
						} else {
							$(newtd).attr("data-dataTruckTableDetail", $(columnObjectForDetails[j]).attr("data-dataTruckTableDetail"));						
							$(newtd).html(tableData[i][dataPicker]);
						}
					}
					
					$(newtr).append($(newtd));
				}
				
				$(tbody).before(newtr);
			}
			
			if(payableAmountCommissionWise > 0)
				payableDetail = 'PLEASE DEPOSIT THE BALANCE	 IN BANK AND INFORM : ';
			else if(payableAmountCommissionWise < 0)
				payableDetail = 'PLEASE COLLECT THE BALANCE FROM BRANCH : ';
			else
				payableDetail = 'NILL : '
			
			if(flavorConfiguration.dispatchLSPrintFlavor == 'loadingSheet_Laser_341' || flavorConfiguration.dispatchLSPrintFlavor == 'loadingSheet_57') {
				$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom"></td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
				+'</td><td class="borderTop truncate borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
				+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td></tr>');
			} else if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
				if(flavorConfiguration.replacePaidTbbAmountWithLrDashed)
					freightCharge =	 '';
				
				$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
				+'</td><td class="borderTop borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom centerAlign font20">'+freightCharge+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
				+'<td class="truncate borderTop borderBottom"></td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
			} else {
				$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
				+'</td><td class="borderTop truncate borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
				+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
			}
			
			$(tbody).append('<tr class="deliveryCommission hide"><td colspan="10" class="infoStyle"><span>GODOWN COMMISION : </span>0</td></tr>');
			$(tbody).append("<tr class='height30px payableDetail hide'><td colspan='10'><span>NILL</span><span id='payableAmountOthers_'>0</span></td></tr>");
			$("[data-row='dataTruckTableDetails']").remove();
		}, setDataTableDDDVDetails : function(tableData, response) {
			var flavorConfiguration						= response.FlavorConfiguration;
			
			$('#popUpForPrint').bPopup({
			},function(){
				var _thisMod = this;
				$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
				
				$('#confirm').focus();
				$("#confirm").click(function(){
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				})
				$("#confirm").on('keydown', function(e) {
					if (e.which == 27) {  //escape
						$('.deliveryCommission').hide();
						$('.payableDetailOthers').hide();
						$('.payableDetail').hide();
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}
				});
				$("#cancelButton").click(function(){
					$('.deliveryCommission').hide();
					$('.payableDetailOthers').hide();
					$('.payableDetail').hide();
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
			});
			
		tableData.pop();
		var tbody					= $("[data-dataTruckTableDetail='srNumber']").parent().parent();
		tbody						= (tbody[tbody.length-1]);
		var totalLRs				= 0;
		actualWeight				= 0;
		deliveryCommission			= 0;
		deliveryCommissionRate		= 0;
		totalArticle					= 0;
		toPayTotalPageWiseFreightCharge	= 0;
		freightCharge					= 0;
		bkgTotal						= 0;
		paidAmount						= 0;
		tbbAmount						= 0;
		topayAmount						= 0;
		payableAmountCommissionWise		= 0;
		columnObjectForDetails			= $("[data-row='dataTruckTableDetails']").children();
		
		for(var i = 0; i < tableData.length; i++) {
			totalLRs		= tableData[i].srNumber;
			freightCharge	= freightCharge + tableData[i].freightCharge;
			unloadingAmount	= unloadingAmount + tableData[i].unloadingAmount + tableData[i].doorDeliveryCharge;
			actualWeight	= actualWeight	+ tableData[i].actualWeight;
			totalArticle	= totalArticle + tableData[i].totalArticle;
			
			if(flavorConfiguration.replaceWeightWithFTL)
				actualWeight = 'FTL';
			
			bkgTotal		= bkgTotal + tableData[i].amount;
			
			if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				toPayTotalPageWiseFreightCharge	= toPayTotalPageWiseFreightCharge + tableData[i].freightCharge;
				
			if(tableData[i].deliveryCommission != undefined)
				deliveryCommissionRate	= tableData[i].deliveryCommission;
			
			if(deliveryCommissionRate > 0) {
				if(flavorConfiguration.calculateCommissionOnFreightCharge)
					deliveryCommission			= deliveryCommissionRate * freightCharge / 100;
				else
					deliveryCommission			= deliveryCommissionRate * bkgTotal / 100;
					
				payableAmountCommissionWise		= toPayTotalPageWiseFreightCharge - deliveryCommission ;
			}
				
			var newtr	= $("<tr class='height30px'></tr>");
			
			for(var j = 0; j < columnObjectForDetails.length; j++){
				var newtd = $("<td></td>");
				var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTruckTableDetail");
				$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
				$(newtd).attr("id", $(columnObjectForDetails[j]).attr("id"));
				
				if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
					if (dataPicker == 'paidFreightCharge') {
						if(tableData[i]['lrType'] == 'Paid') {
							$(newtd).html('Paid');
							paidFreight		= paidFreight + tableData[i].freightCharge;
							paidAmount		= paidAmount + tableData[i].amount;
						}
						
						if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
							$(newtd).html('TBB');
							tbbFright		= tbbFright + tableData[i].freightCharge;
							tbbAmount		= tbbAmount + tableData[i].amount;
						}
					} else if (dataPicker == 'toPayFreightCharge') {
						if (tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i].amount);
							toPayFreight		= toPayFreight + tableData[i].freightCharge;
							topayAmount		= topayAmount + tableData[i].amount;
						}
					} else if (dataPicker == 'tbbFreightCharge') {
						if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
							$(newtd).html('TBB');
							tbbFright		= tbbFright + tableData[i].freightCharge;
							tbbAmount		= tbbAmount + tableData[i].amount;
						}
					} else {
						$(newtd).attr("data-dataTruckTableDetail",$(columnObjectForDetails[j]).attr("data-dataTruckTableDetail"));						
						$(newtd).html(tableData[i][dataPicker]);
					}
				} else {
					if (dataPicker == 'paidFreightCharge') {
						if(tableData[i]['lrType'] == 'Paid'){
							$(newtd).html(tableData[i].amount);
							paidFreight		= paidFreight + tableData[i].freightCharge;
							paidAmount		= paidAmount + tableData[i].amount;
						}
					} else if (dataPicker == 'toPayFreightCharge') {
						if (tableData[i]['lrType'] == 'To Pay') {
							$(newtd).html(tableData[i].amount);
							toPayFreight		= toPayFreight + tableData[i].freightCharge;
							topayAmount		= topayAmount + tableData[i].amount;
						}
					} else if (dataPicker == 'tbbFreightCharge') {
						if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
							$(newtd).html(tableData[i].amount);
							tbbFright		= tbbFright + tableData[i].freightCharge;
							tbbAmount		= tbbAmount + tableData[i].amount;
						}
					} else {
						$(newtd).attr("data-dataTruckTableDetail",$(columnObjectForDetails[j]).attr("data-dataTruckTableDetail"));						
						$(newtd).html(tableData[i][dataPicker]);
					}
				}
				
				$(newtr).append($(newtd));
			}
			$(tbody).before(newtr);
		}
		
		if(payableAmountCommissionWise > 0)
			payableDetail = 'PLEASE DEPOSIT THE BALANCE	 IN BANK AND INFORM : ';
		else if(payableAmountCommissionWise < 0)
			payableDetail = 'PLEASE COLLECT THE BALANCE FROM BRANCH : ';
		else
			payableDetail = 'NILL : '
		
		if(flavorConfiguration.dispatchLSPrintFlavor == 'loadingSheet_Laser_341' || flavorConfiguration.dispatchLSPrintFlavor == 'loadingSheet_57') {
			$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom"></td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
			+'</td><td class="borderTop borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
			+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td></tr>');
		} else if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
			$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
			+'</td><td class="borderTop borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom centerAlign font20">'+freightCharge+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
			+'<td class="truncate borderTop borderBottom"></td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
		} else {
			$(tbody).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
			+'</td><td class="borderTop borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
			+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
		}
		
		$(tbody).append('<tr class="deliveryCommission hide"><td colspan="10" class="infoStyle"><span>GODOWN COMMISION : </span>0</td></tr>');
		$(tbody).append("<tr class='height30px payableDetail hide'><td colspan='10'><span>NILL</span><span id='payableAmountOthers_'>0</span></td></tr>");
		$("[data-row='dataTruckTableDetails']").remove();
	}, setDestWiseDispatchLSSummary : function(mainDataLength, destWiseDispatchLSSummArrList, FlavorConfiguration) {
		var wayBillSrNo							= null;
		var wayBillLRCount						= null;
		var wayBillTotalParcel					= null;
		var wayBillTopayTotal					= null;
		var wayBillPaidTotal					= null;
		var wayBillTBBTotal						= null;
		var wayBillGrandTotal					= null;
		var wayBillToPayFreightTotal			= null;
		var wayBillPaidFreightTotal				= null;
		var wayBillTBBFreightTotal				= null;
		var wayBillToPayLoadingChargeTotal		= null;
		var wayBillPaidLoadingChargeTotal		= null;
		var wayBillTBBLoadingChargeTotal		= null;
		var wayBillArtCountTotal				= null;
		var wayBillActualWeightTotal			= null;
		
		if(Number(mainDataLength + destWiseDispatchLSSummArrList.length) <= Number(FlavorConfiguration.pageBreakCount))
			$("#destWiseSummary").removeClass("page-break");
		
		var tbody	= $("[data-destSummaryDetail='wayBillDestinationBranchName']").parent().parent();
		tbody		= (tbody[tbody.length - 1]);
		columnObjectForDetails		= $("[data-row='destSummaryDetails']").last().children();
		
		for(var i = 0; i < destWiseDispatchLSSummArrList.length; i++) {
			var newtr = $("<tr></tr>");
			wayBillSrNo++;

			for(var j = 0; j < columnObjectForDetails.length; j++) {
				var newtr1 = $("<tr></tr>");
				var newtr2 = $("<tr></tr>");
				var newTable1 = $("<table class='width' id='summarypaiddetails' cellpadding='0' cellspacing='0'></table>")
				var newTable2 = $("<table class='width' id='summaryptopayetails' cellpadding='0' cellspacing='0'></table>")
				var newTable3 = $("<table class='width' id='summarytbbdetails' cellpadding='0' cellspacing='0'></table>'")
				var newTable4 = $("<table class='width' id='destinationbranchname ' cellpadding='0' cellspacing='0'></table>")
				var newTable5 = $("<table class='width' id='summarytotalparcel' cellpadding='0' cellspacing='0'></table>")
				var newTable6 = $("<table class='width' id='summarybillartcount' cellpadding='0' cellspacing='0'></table>")
				var newTable7 = $("<table class='width' id='summarybillactualweight' cellpadding='0' cellspacing='0'></table>")
				var newTable8 = $("<table class='width' id='summarybillsrno' cellpadding='0' cellspacing='0'></table>")
				var newtd = $("<td class='centerAlign font15 truncate'></td>");
				var newtd1 = $("<td class='borderRight'></td>");
				var newtd2 = $("<td class='borderRight'></td>");
				var newtd3 = $("<td class=''></td>");
				var newtd4 = $("<td class='borderRight'></td>");
				var newtd5 = $("<td class='borderRight'></td>");
				var newtd6 = $("<td class=''></td>");
				var newtd7 = $("<td class='borderRight'></td>");
				var newtd8 = $("<td class='borderRight'></td>");
				var newtd9 = $("<td class=''></td>");
				var newtd10 = $("<td></td>");
				var newtd11 = $("<td></td>");
				var newtd12 = $("<td></td>");
				var newtd13 = $("<td></td>");
				var newtd14 = $("<td></td>");
				var dataPicker = $(columnObjectForDetails[j]).attr("data-destSummaryDetail");
				
				if(dataPicker == 'wayBillSrNo') {
					$(newtr1).append("<td class='centerAlign'> </td>");
					$(newtr2).append($(newtd14));
					$(newtd14).html(wayBillSrNo);
					$(newTable8).append($(newtr1));
					$(newTable8).append($(newtr2));
					$(newtd).append($(newTable8));
				}
				
				if(FlavorConfiguration.showChargesInDestWiseSummaryTable){
					if(dataPicker == 'wayBillDestinationBranchName') {
						$(newtr1).append("<td class='centerAlign'></td>");
						$(newtr2).append($(newtd10));
						$(newtd10).html(destWiseDispatchLSSummArrList[i].wayBillDestinationBranchName);
						$(newTable4).append($(newtr1));
						$(newTable4).append($(newtr2));
						$(newtd).append($(newTable4));
					}
						
					if(dataPicker == 'wayBillTotalParcel') {
						$(newtr1).append("<td class='centerAlign'> </td>");
						$(newtr2).append($(newtd11));
						$(newtd11).html(destWiseDispatchLSSummArrList[i].wayBillTotalParcel);
						$(newTable5).append($(newtr1));
						$(newTable5).append($(newtr2));
						$(newtd).append($(newTable5));
					}
						
					if(dataPicker == 'wayBillArtCount') {
						$(newtr1).append("<td class='centerAlign'> </td>");
						$(newtr2).append($(newtd12));
						$(newtd12).html(destWiseDispatchLSSummArrList[i].wayBillArtCount);
						$(newTable6).append($(newtr1));
						$(newTable6).append($(newtr2));
						$(newtd).append($(newTable6));
					}
						
					if(dataPicker == 'wayBillActualWeight') {
						$(newtr1).append("<td class='centerAlign'> </td>");
						$(newtr2).append($(newtd13));
						$(newtd13).html(destWiseDispatchLSSummArrList[i].wayBillActualWeight);
						$(newTable7).append($(newtr1));
						$(newTable7).append($(newtr2));
						$(newtd).append($(newTable7));
					}
						
					if(destWiseDispatchLSSummArrList[i].wayBillPaidFreightTotal > 0) {
						if(dataPicker == wayBillPaidTotal || dataPicker == 'wayBillPaidTotal'){
							$(newtr1).append("<td class='borderRight borderBottom'>Frt</td>");
							$(newtr2).append($(newtd1));
							$(newtd1).html(destWiseDispatchLSSummArrList[i].wayBillPaidFreightTotal);
							$(newtr1).append("<td class='borderRight borderBottom'>Ldg</td>");
							$(newtr2).append($(newtd2));
							$(newtd2).html(destWiseDispatchLSSummArrList[i].wayBillPaidLoadingChargeTotal);
							$(newtr1).append("<td class='borderBottom'>Tot</td>");
							$(newtr2).append($(newtd3));
							$(newtd3).html(destWiseDispatchLSSummArrList[i].wayBillPaidFreightTotal+destWiseDispatchLSSummArrList[i].wayBillPaidLoadingChargeTotal);
							$(newTable1).append($(newtr1));
							$(newTable1).append($(newtr2));
							$(newtd).append($(newTable1));
						}
					}
						
					if(destWiseDispatchLSSummArrList[i].wayBillToPayFreightTotal > 0) {
						if(dataPicker == wayBillTopayTotal || dataPicker == 'wayBillTopayTotal') {
							$(newtr1).append("<td class='borderRight borderBottom'>Frt</td>");
							$(newtr2).append($(newtd4));
							$(newtd4).html(destWiseDispatchLSSummArrList[i].wayBillToPayFreightTotal);
							$(newtr1).append("<td class='borderRight borderBottom'>Ldg</td>");
							$(newtr2).append($(newtd5));
							$(newtd5).html(destWiseDispatchLSSummArrList[i].wayBillToPayLoadingChargeTotal);
							$(newtr1).append("<td class='borderBottom'>Tot</td>");
							$(newtr2).append($(newtd6));
							$(newtd6).html(destWiseDispatchLSSummArrList[i].wayBillToPayFreightTotal+destWiseDispatchLSSummArrList[i].wayBillToPayLoadingChargeTotal);
							$(newTable2).append($(newtr1));
							$(newTable2).append($(newtr2));
							$(newtd).append($(newTable2));
						}
					}
						
					if(destWiseDispatchLSSummArrList[i].wayBillTBBFreightTotal > 0) {
						if(dataPicker == wayBillTBBTotal || dataPicker == 'wayBillTBBTotal') {
							$(newtr1).append("<td class='borderRight borderBottom'>Frt</td>");
							$(newtr2).append($(newtd7));
							$(newtd7).html(destWiseDispatchLSSummArrList[i].wayBillTBBFreightTotal);
							$(newtr1).append("<td class='borderRight borderBottom'>Ldg</td>");
							$(newtr2).append($(newtd8));
							$(newtd8).html(destWiseDispatchLSSummArrList[i].wayBillTBBLoadingChargeTotal);
							$(newtr1).append("<td class='borderBottom'>Tot</td>");
							$(newtr2).append($(newtd9));
							$(newtd9).html(destWiseDispatchLSSummArrList[i].wayBillTBBFreightTotal+destWiseDispatchLSSummArrList[i].wayBillTBBLoadingChargeTotal);
							$(newTable3).append($(newtr1));
							$(newTable3).append($(newtr2));
							$(newtd).append($(newTable3));
						}
					}
						
					$(newtr).append($(newtd));
				} else {
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-destSummaryDetail",$(columnObjectForDetails[j]).attr("data-destSummaryDetail"));	
					$(newtd).html(destWiseDispatchLSSummArrList[i][dataPicker]);
					$(newtr).append($(newtd));
				}
			}
				
			$(tbody).before(newtr);
		
			wayBillLRCount		= wayBillLRCount	+ destWiseDispatchLSSummArrList[i].wayBillLRCount;
			wayBillTotalParcel	= wayBillTotalParcel+ destWiseDispatchLSSummArrList[i].wayBillTotalParcel;
			wayBillTopayTotal	= wayBillTopayTotal	+ destWiseDispatchLSSummArrList[i].wayBillTopayTotal;
			wayBillPaidTotal	= wayBillPaidTotal	+ destWiseDispatchLSSummArrList[i].wayBillPaidTotal;
			wayBillTBBTotal		= wayBillTBBTotal	+ destWiseDispatchLSSummArrList[i].wayBillTBBTotal;
			wayBillGrandTotal	= wayBillGrandTotal	+ destWiseDispatchLSSummArrList[i].wayBillGrandTotal;
			wayBillToPayFreightTotal		= wayBillToPayFreightTotal	+ destWiseDispatchLSSummArrList[i].wayBillToPayFreightTotal;
			wayBillPaidFreightTotal			= wayBillPaidFreightTotal	+ destWiseDispatchLSSummArrList[i].wayBillPaidFreightTotal;
			wayBillTBBFreightTotal			= wayBillTBBFreightTotal	+ destWiseDispatchLSSummArrList[i].wayBillTBBFreightTotal;
			wayBillToPayLoadingChargeTotal	= wayBillToPayLoadingChargeTotal	+ destWiseDispatchLSSummArrList[i].wayBillToPayLoadingChargeTotal;
			wayBillPaidLoadingChargeTotal	= wayBillPaidLoadingChargeTotal		+ destWiseDispatchLSSummArrList[i].wayBillPaidLoadingChargeTotal;
			wayBillTBBLoadingChargeTotal	= wayBillTBBLoadingChargeTotal		+ destWiseDispatchLSSummArrList[i].wayBillTBBLoadingChargeTotal;
			wayBillArtCountTotal			= wayBillArtCountTotal				+ destWiseDispatchLSSummArrList[i].wayBillArtCount;
			wayBillActualWeightTotal		= wayBillActualWeightTotal			+ destWiseDispatchLSSummArrList[i].wayBillActualWeight;
		}

		if(!FlavorConfiguration.showDestWiseDispatchLSSummaryTopayCol)
			$('.wayBillTopayTotal').addClass('hide');
		
		if(!FlavorConfiguration.showDestWiseDispatchLSSummaryPaidCol)
			$('.wayBillPaidTotal').addClass('hide');
		
		if(!FlavorConfiguration.showDestWiseDispatchLSSummaryTBBCol)
			$('.wayBillTBBTotal').addClass('hide');
		
		if(!FlavorConfiguration.showDestWiseDispatchLSSummaryTopayCol || !FlavorConfiguration.showDestWiseDispatchLSSummaryPaidCol || !FlavorConfiguration.showDestWiseDispatchLSSummaryTBBCol)
			$('.wayBillGrandTotal').addClass('hide');

		$("[data-destSummaryFooterDetail='wayBillLRCount']").html(wayBillLRCount);
		$("[data-destSummaryFooterDetail='wayBillTotalParcel']").html(wayBillTotalParcel);
		$("[data-destSummaryFooterDetail='wayBillTopayTotal']").html(wayBillTopayTotal);
		$("[data-destSummaryFooterDetail='wayBillPaidTotal']").html(wayBillPaidTotal);
		$("[data-destSummaryFooterDetail='wayBillTBBTotal']").html(wayBillTBBTotal);
		$("[data-destSummaryFooterDetail='wayBillGrandTotal']").html(wayBillGrandTotal);
		$("[data-destSummaryFooterDetail='wayBillToPayFreightTotal']").html(wayBillToPayFreightTotal);
		$("[data-destSummaryFooterDetail='wayBillPaidFreightTotal']").html(wayBillPaidFreightTotal);
		$("[data-destSummaryFooterDetail='wayBillTBBFreightTotal']").html(wayBillTBBFreightTotal);
		$("[data-destSummaryFooterDetail='wayBillToPayLoadingChargeTotal']").html(wayBillToPayLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillPaidLoadingChargeTotal']").html(wayBillPaidLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillTBBLoadingChargeTotal']").html(wayBillTBBLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillToPayTotal']").html(wayBillToPayFreightTotal + wayBillToPayLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillPaidTotal']").html(wayBillPaidFreightTotal + wayBillPaidLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillTBBTotal']").html(wayBillTBBFreightTotal + wayBillTBBLoadingChargeTotal);
		$("[data-destSummaryFooterDetail='wayBillArtCountTotal']").html(wayBillArtCountTotal);
		$("[data-destSummaryFooterDetail='wayBillActualWeightTotal']").html(wayBillActualWeightTotal);
	}, setDataTableDetailsWithoutSummary : function(tableData, response) {
			var flavorConfiguration					= response.FlavorConfiguration;
			var subStringLength						= flavorConfiguration.subStringLength;
		
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
		
			for(var i = 0; i < tableData.length; i++) {
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));						
					$(newtd).html(tableData[i][dataPicker]);
					
					if (dataPicker == 'consignor' || dataPicker == 'consignee') {
						if ((tableData[i][dataPicker]).length > subStringLength)						
							$(newtd).html((tableData[i][dataPicker]).substring(0,subStringLength) + '..');
						else
							$(newtd).html(tableData[i][dataPicker]);							
					}
					
					$(newtr).append($(newtd));
					
					if(dataPicker == 'amount' && flavorConfiguration.replacePaidTbbAmountWithLrType
						&& (tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit'))
							$(newtd).html(tableData[i]['lrType']);
					
					$(newtr).append($(newtd));
					
				}
			}
			
			$(tbody).before(newtr);
			$("[data-wayBillFooterDetail='totalArticle']").html(totalArticleQtyForTOPAY + totalArticleQtyForPAID + totalArticleQtyForCREDIT + totalArticleQtyForFOC);
			$("[data-wayBillFooterDetail='totalWeight']").html(actualWeight.toFixed(2));
			$("[data-wayBillFooterDetail='totalFreightAmountForPAID']").html(totalFreightForPAID);
			$("[data-wayBillFooterDetail='totalAmountForPAID']").html(totalAmountForPAID);
			$("[data-wayBillFooterDetail='totalAmountForTOPAY']").html(totalAmountForTOPAY);
			$("[data-wayBillFooterDetail='totalFreightAmountForTOPAY']").html(totalFreightForTOPAY);
			$("[data-wayBillFooterDetail='totalWeightWithoutRound']").html(actualWeight);
			$("[data-wayBillFooterDetail='loadingChargeRT']").html(loadingChargeRT);
			$("[data-wayBillFooterDetail='loadingChargeformls']").html(loadingChargeformls);
			$("[data-wayBillFooterDetail='crossingHireAmt']").html(crossingHireAmt);
			$("[data-wayBillFooterDetail='payableAmount']").html(payableAmount);
			$("[data-wayBillFooterDetail='receivableAmount']").html(receivableAmount);
			$("[data-wayBillFooterDetail='declaredValue']").html(declaredValue);
			$("[data-wayBillFooterDetail='totalChargeWeight']").html(chargeWeight.toFixed(2));
			$("[data-wayBillFooterDetail='totalChargeWeightWithoutRound']").html(chargeWeight);
			$("[data-wayBillFooterDetail='totalAmount']").html(totalAmountForPAID + totalAmountForTOPAY + totalAmountForCREDIT);
			
			$("[data-wayBillFooterDetail='totalAmountWithoutTBB']").html(totalAmountForPAID + totalAmountForTOPAY);
		}, setDestinationWiseSummaryDetails : function(tableData) {
			var totalLRs				= 0;
			var totalArticle			= 0;
			var actualWeight			= 0;
			var chargeWeight			= 0;
			var crossing				= 0;
			//var loadingCharge			= 0;
			var totalPaidFreightCharge	= 0;
			var totalToPayFreightCharge	= 0;
			var totalTBBFreightCharge	= 0;
			var totalPaidGrandTotal		= 0;
			var totalToPayGrandTotal	= 0;
			var totalTBBGrandTotal		= 0;
			var totalBookingGrandTotal	= 0;
			var grandTotal				= 0;
			var grandTotalSks			= 0;
			var totalLoadingCharge		= 0;
			var totalPaidTbb			= 0;
			
			var tbody	= $("[data-destWiseSummaryDetail='lrDestinationBranch']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			columnObjectForDetails		= $("[data-row='destWiseSummaryDetails']").children();
			
			for(var i = 0; i < tableData.length; i++) {
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd		= $("<td></td>");
					var dataPicker	= $(columnObjectForDetails[j]).attr("data-destWiseSummaryDetail");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-destWiseSummaryDetail", dataPicker);						
					$(newtd).html(tableData[i][dataPicker]);
					
					if(dataPicker == 'DsAmount'){
						if(tableData[i].wayBilldestBranchId == tableData[i].lsDestBranch.branchId && tableData[i].lsDestBranch.branchAgentBranch)
							$(newtd).html(tableData[i].actualWeight * tableData[i].deliveryCommissionChargePerKgOnActualWeight);
						else
							$(newtd).html(0);
					}
					
					$(newtr).append($(newtd));
				}

				totalLRs					= totalLRs + tableData[i].totalLRs;
				totalArticle				= totalArticle + tableData[i].totalArticle;
				actualWeight				= actualWeight + tableData[i].actualWeight;
				chargeWeight				= chargeWeight + tableData[i].chargeWeight;
				crossing					= crossing + tableData[i].crossing;
				totalToPayFreightCharge		= totalToPayFreightCharge + tableData[i].totalToPayFreightCharge;
				totalPaidFreightCharge		= totalPaidFreightCharge + tableData[i].totalPaidFreightCharge;
				totalTBBFreightCharge		= totalTBBFreightCharge + tableData[i].totalTBBFreightCharge;
				totalPaidGrandTotal			= totalPaidGrandTotal + tableData[i].totalPaidGrandTotal;
				totalToPayGrandTotal		= totalToPayGrandTotal + tableData[i].totalToPayGrandTotal;
				totalTBBGrandTotal			= totalTBBGrandTotal + tableData[i].totalTBBGrandTotal;
				totalBookingGrandTotal		= totalBookingGrandTotal + tableData[i].totalBookingGrandTotal;
				loadingCharge				= loadingCharge + tableData[i].loadingCharge;
				unloadingAmount				= unloadingAmount + tableData[i].unloadingAmount + tableData[i].doorDeliveryCharge; 
				grandTotal					= grandTotal + tableData[i].grandTotal;
				grandTotalSks				= grandTotalSks + tableData[i].grandTotalSks;
				totalPaidTbb				= totalTBBGrandTotal + totalPaidGrandTotal;
				
				$(tbody).before(newtr);
			}

			$("[data-destWiseSummaryFooterDetail='totalLRs']").html(totalLRs);
			$("[data-destWiseSummaryFooterDetail='totalArticle']").html(totalArticle);
			$("[data-destWiseSummaryFooterDetail='actualWeight']").html(actualWeight);
			$("[data-destWiseSummaryFooterDetail='chargeWeight']").html(chargeWeight);
			$("[data-destWiseSummaryFooterDetail='crossing']").html(crossing);
			$("[data-destWiseSummaryFooterDetail='loadingCharge']").html(totalLoadingCharge);
			$("[data-destWiseSummaryFooterDetail='totalToPayFreightCharge']").html(totalToPayFreightCharge);
			$("[data-destWiseSummaryFooterDetail='totalPaidFreightCharge']").html(totalPaidFreightCharge);
			$("[data-destWiseSummaryFooterDetail='totalTBBFreightCharge']").html(totalTBBFreightCharge);
			$("[data-destWiseSummaryFooterDetail='totalPaidGrandTotal']").html(totalPaidGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalToPayGrandTotal']").html(totalToPayGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalTBBGrandTotal']").html(totalTBBGrandTotal);
			$("[data-destWiseSummaryFooterDetail='grandTotal']").html(grandTotal);
			$("[data-destWiseSummaryFooterDetail='totalBookingGrandTotal']").html(totalBookingGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalPaidTbb']").html(totalPaidTbb);
			
			$("[data-row='destWiseSummaryDetails']").remove();
		}, setPkgTypeWiseSummaryDetails : function(packingTypeWiseSummaryDetails) {
			var totalPkgs				= 0;
			
			var tbody	= $("[data-pkgWiseSummaryDetail='packingTypeName']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			columnObjectForDetails		= $("[data-row='pkgsWiseSummaryDetails']").children();
			
			for(var i = 0; i < packingTypeWiseSummaryDetails.length; i++) {
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd		= $("<td></td>");
					var dataPicker	= $(columnObjectForDetails[j]).attr("data-pkgWiseSummaryDetail");
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-pkgWiseSummaryDetail", $(columnObjectForDetails[j]).attr("data-pkgWiseSummaryDetail"));						
					$(newtd).html(packingTypeWiseSummaryDetails[i][dataPicker]);
					$(newtr).append($(newtd));
				}

				totalPkgs	= totalPkgs + packingTypeWiseSummaryDetails[i].totalPkgs;
				
				$(tbody).before(newtr);
			}

			$("[data-pkgWiseSummaryFooterDetail='totalPkgs']").html(totalPkgs);
			$("[data-row='pkgsWiseSummaryDetails']").remove();
		}, setWayBillArrDetails : function(tableData, subStringLength) {
			var tbody	= $("[data-wayBillDataTableDetail='lrNumber']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			columnObjectForDetails		= $("[data-row='wayBillDataTableDetails']").children();
			
			for(var i = 0; i < tableData.length; i++) {
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-wayBillDataTableDetail");
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-wayBillDataTableDetail", $(columnObjectForDetails[j]).attr("data-wayBillDataTableDetail"));						
					$(newtd).html(tableData[i][dataPicker]);
					
					if (dataPicker == 'consignor' || dataPicker == 'consignee') {
						if ((tableData[i][dataPicker]).length > subStringLength)						
							$(newtd).html((tableData[i][dataPicker]).substring(0, subStringLength) + '..');
						else
							$(newtd).html(tableData[i][dataPicker]);							
					}
					
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}
			
			
			$("[data-wayBillFooterDataTableDetail='actualWeight']").html(actualWeight);
			$("[data-wayBillFooterDataTableDetail='chargeWeight']").html(chargeWeight);
			$("[data-wayBillFooterDataTableDetail='freightCharge']").html(freightCharge);
			$("[data-wayBillFooterDataTableDetail='advancePaid']").html(advancePaid);
			$("[data-wayBillFooterDataTableDetail='balance']").html(balanceAmount);
			
			$("[data-row='wayBillDataTableDetails']").remove();
		}, setCrossingWiseSummaryData : function(response) {
			var wayBillTypeWiseMap	= response.wayBillTypeWiseMap;
			var chargeNameMap		= response.chargeNameMap;
			var chargeTotalMap		= response.chargeTotalMap;
			var columnArray			= [];
			var totalQty			= 0;
			var totalDisc			= 0;
			var totalTax			= 0;
			var totalAmt			= 0;

			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Catgegory</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Nag</th>");
			
			for(var chargeMasterId in chargeNameMap) {
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + chargeNameMap[chargeMasterId] + "</th>");
			}
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total Discount</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total Tax</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
			
			$('#crossingDetailsLrTypeWise').append('<thead><tr>' + columnArray.join(' ') + '</tr></thead>');
			
			columnArray			= [];
			
			for(var wayBillType in wayBillTypeWiseMap) {
				totalQty	+= wayBillTypeWiseMap[wayBillType].totalQuantity;
				totalDisc	+= wayBillTypeWiseMap[wayBillType].totalBookingDiscount;
				totalTax	+= wayBillTypeWiseMap[wayBillType].totalTax;
				totalAmt	+= wayBillTypeWiseMap[wayBillType].totalAmount;
				
				var chargeCollection = wayBillTypeWiseMap[wayBillType].chargesCollection;
				
				columnArray.push("<td style='text-align: center;'>" + wayBillType + "</td>");
				columnArray.push("<td style='text-align: center;'>" + wayBillTypeWiseMap[wayBillType].totalQuantity + "</td>");
				
				for(var chargeMasterId in chargeNameMap) {
					if(chargeCollection != undefined && chargeCollection[chargeMasterId] != undefined)
						columnArray.push("<td style='text-align: center;'>" + chargeCollection[chargeMasterId] + "</td>");
					else
						columnArray.push("<td style='text-align: center;'>0</td>");
				}
				
				columnArray.push("<td style='text-align: center;'>" + wayBillTypeWiseMap[wayBillType].totalBookingDiscount + "</td>");
				columnArray.push("<td style='text-align: center;'>" + wayBillTypeWiseMap[wayBillType].totalTax + "</td>");
				columnArray.push("<td style='text-align: center;'>" + wayBillTypeWiseMap[wayBillType].totalAmount + "</td>");
				
				$('#crossingDetailsLrTypeWise').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnArray			= [];
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalQty + "</th>");
			
			for(var chargeMasterId in chargeNameMap) {
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + chargeTotalMap[chargeMasterId] + "</th>");
			}
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalDisc + "</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalTax + "</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmt + "</th>");
			
			$('#crossingDetailsLrTypeWise').append('<tfoot><tr>' + columnArray.join(' ') + '</tr></tfoot>');
		}, setDataTableDetailsWithoutPaid : function(wayBillTableData, paidTableData, lhpvChargeData, subStringLength) {
			var k = 0;
			var tbody	= $("[data-wayBillDataTableDetail='lrDestinationBranch']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			columnObjectForDetails		= $("[data-row='wayBillDataTableDetail']").children();
			for(var i = 0; i < wayBillTableData.length; i++) {
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-wayBillDataTableDetail");
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					
					$(newtd).attr("data-wayBillDataTableDetail",$(columnObjectForDetails[j]).attr("data-wayBillDataTableDetail"));
						
					if((dataPicker == 'freightCharge' ||dataPicker == 'hamaliColl'|| dataPicker == 'doorDeliveryCharge' || dataPicker == 'serviceTax' || dataPicker == 'amount' ) && (wayBillTableData[i].wayBillTypeId == 1 || wayBillTableData[i].wayBillTypeId == 0)){
						for(var p = k; p <= paidTableData.length ; p++){
							if(p == 0){
								$(newtr).append($(newtd));
								$(newtd).attr('class', 'freight0 centerAlign');
								$(newtd).html(lhpvChargeData.paidDebit + lhpvChargeData.paidCredit);
								k++;
							}
						}
					} else {
						$(newtd).html(wayBillTableData[i][dataPicker]);
						$(newtr).append($(newtd));
					}
					
					if (dataPicker == 'consignor' || dataPicker == 'consignee') {
						if ((wayBillTableData[i][dataPicker]).length > subStringLength)						
							$(newtd).html((wayBillTableData[i][dataPicker]).substring(0,subStringLength) + '..');
						else
							$(newtd).html(wayBillTableData[i][dataPicker]);							
					}
				}
				
				$(tbody).before(newtr);
			}
			
			$('.freight0').attr('colspan', 5);
			$('.freight0').attr('rowspan', paidTableData.length);
			
			var totalHamali		= totalLoadingForTOPAY + totalReceiptChargeForTOPAY + totalCollectionChargeForTOPAY;
			var totalFrieght	= totalFreightForTOPAY;
			
			$("[data-wayBillFooterDetail='totalArticle']").html(totalArticleQtyForTOPAY + totalArticleQtyForPAID + totalArticleQtyForCREDIT + totalArticleQtyForFOC);
			$("[data-wayBillFooterDetail='freightCharge']").html(totalFrieght + lhpvChargeData.paidDebit);
			$("[data-wayBillFooterDetail='loadingCharge']").html(totalHamali);
			$("[data-wayBillFooterDetail='doorDeliveryCharge']").html(totalDoorDeliveryAmountForTOPAY + totalDoorDeliveryAmountForCREDIT);
			$("[data-wayBillFooterDetail='serviceTax']").html(totalServiceTaxForTOPAY);
			$("[data-wayBillFooterDetail='amount']").html(totalFrieght +  totalHamali + totalServiceTaxForTOPAY + totalDoorDeliveryAmountForTOPAY + totalDoorDeliveryAmountForCREDIT);
			
			if(wayBillTableData.length >= 24) {
				$('#footerDetails').attr('class', 'page-break');
				$('#heightCol').attr('class', 'hight160');
			}
			
			$("[data-row='wayBillDataTableDetail']").remove();
		}, setSummaryTableHeaders:function() {
			var columnHeaderObject		= $("[data-row='summaryTableHeaders']").children();
			
			for (var i = 0; i < columnHeaderObject.length; i++) {
				var header = $(columnHeaderObject[i]).attr("data-selector");
				$(columnHeaderObject[i]).attr("data-selector", header).html(header);					
			}
		}, setLhpvChargesDetails : function(lhpvChargeData,lsSrcBranch, blhpvChargeData, flavorConfiguration) {
			if (lhpvChargeData != undefined) {
				var total	= totalServiceTaxForTOPAY + lhpvChargeData.commision + lhpvChargeData.crossing + lhpvChargeData.hamali + lhpvChargeData.thapi + lhpvChargeData.refund;
				var cash	= total - lhpvChargeData.paidDebit + lhpvChargeData.paidCredit;
				var totalforlhpv  = lhpvChargeData.lorryHireAmount + lhpvChargeData.extraLorryHire + lhpvChargeData.Loadingpoint ;
				$("[data-lhpvCharge='serviceTax']").html(totalServiceTaxForTOPAY);
				$("[data-lhpvCharge='commision']").html(lhpvChargeData.commision);
				$("[data-lhpvCharge='crossing']").html(lhpvChargeData.crossing);
				$("[data-lhpvCharge='refund']").html(lhpvChargeData.refund);
				$("[data-lhpvCharge='hamali']").html(lhpvChargeData.hamali);
				$("[data-lhpvCharge='thapi']").html(lhpvChargeData.thapi);
				$("[data-lhpvCharge='total']").html(total);
				$("[data-lhpvCharge='paidDebit']").html(lhpvChargeData.paidDebit);
				$("[data-lhpvCharge='paidCredit']").html(lhpvChargeData.paidCredit);
				$("[data-lhpvCharge='lorryHire']").html(lhpvChargeData.lorryHireAmount);
				lorryHireAdvance = lhpvChargeData.lorryHireAdvance;
				$("[data-lhpvCharge='lorryHireAdvance']").html(lhpvChargeData.lorryHireAdvance);
				$("[data-lhpvCharge='totalTopay']").html(topayAmount);
				$("[data-lhpvCharge='other']").html(lhpvChargeData.other);
				$("[data-lhpvCharge='lhpvHamali']").html(lhpvChargeData.lhpvhamali);
				$("[data-lhpvCharge='overload']").html(lhpvChargeData.overload);
				$("[data-lhpvCharge='diesel']").html(lhpvChargeData.diesel);
				$("[data-lhpvCharge='subTotal']").html(lhpvChargeData.lhpvhamali + lhpvChargeData.other + lhpvChargeData.overload + lhpvChargeData.lorryHireAmount);
				$("[data-lhpvCharge='lhpvCreationDate']").html(lhpvChargeData.lhpvCreationDateTimeString);
				$("[data-lhpvCharge='otherForAccurate']").html(lhpvChargeData.lhpvhamali + lhpvChargeData.other + lhpvChargeData.overload);
				
				if(flavorConfiguration.replaceLHPVPaidAmountWithBlank)
					$("[data-lhpvCharge='totalPaid']").html("&nbsp");
				else
					$("[data-lhpvCharge='totalPaid']").html(totalAmountForPAID);
				
				if(flavorConfiguration.replaceLHPVTBBAmountWithBlank)
					$("[data-lhpvCharge='totalTBB']").html("&nbsp");
				else
					$("[data-lhpvCharge='totalTBB']").html(totalAmountForCREDIT);
				
				$("[data-lhpvCharge='lorryHireBalance']").html(lhpvChargeData.lorryHireBalance);
				$("[data-lhpvCharge='lessAdvance']").html(lhpvChargeData.lessAdvance);
				$("[data-lhpvCharge='extraLorryHire']").html(lhpvChargeData.extraLorryHire);
				$("[data-lhpvCharge='TDS']").html(lhpvChargeData.TDS);
				$("[data-lhpvCharge='totalforlhpv']").html(totalforlhpv);
				$("[data-lhpvCharge='totalinWords']").html(convertNumberToWord(totalforlhpv).toUpperCase());
				$("[data-lhpvCharge='balancePayableAtBranchName']").html(lhpvChargeData.balancePayableAtBranchName);
				$("[data-lhpvCharge='lorryHireBalanceinWords']").html(convertNumberToWord(lhpvChargeData.lorryHireBalance).toUpperCase());
				$("[data-lhpvCharge='lorryHireAdvanceinWords']").html(convertNumberToWord(lhpvChargeData.lorryHireAdvance).toUpperCase());
				$("[data-lhpvCharge='Loadingpoint']").html(lhpvChargeData.Loadingpoint);
				$("[data-lhpvCharge='Halting']").html(lhpvChargeData.Halting);
				
				if(Number(lhpvChargeData.paidDebit) > 0)
					$('#paidDebitRow').attr('class', 'show');
				else
					$('#paidCreditRow').attr('class', 'show');
				
				if(cash > 0) {
					$("[data-lhpvCharge='cash']").html(cash);
					
					if(blhpvChargeData != null)
						$("[data-lhpvCharge='balance']").html(cash - blhpvChargeData.received);
					else
						$("[data-lhpvCharge='balance']").html(cash);
				} else {
					$("[data-lhpvCharge='cash']").html(-(cash));
					
					if(blhpvChargeData != null)
						$("[data-lhpvCharge='balance']").html(-(cash) - blhpvChargeData.received);
					else
						$("[data-lhpvCharge='balance']").html(-(cash));
				}
				
				if(blhpvChargeData != null)
					$("[data-lhpvCharge='received']").html(blhpvChargeData.received);
				else
					$("[data-lhpvCharge='received']").html(0);
				
				if(Number(total) - (Number(lhpvChargeData.paidDebit) +	Number(lhpvChargeData.paidCredit)) > 0)
					$('#receivedComm').attr('class', 'show');
				else
					$('#paidComm').attr('class', 'show');
					
				if(lhpvChargeData.lorryHireAdvance >0)
					$("[data-lhpvCharge='advancePayableBranchName']").html(lsSrcBranch.branchName);
				else
					$("[data-lhpvCharge='advancePayableBranchName']").html(" ");
						
			}
		}, setSummaryTableDetails : function(response, tableData, crossingSummary) {
			var flavorConfiguration					= response.FlavorConfiguration;
			var tbody	= $("[data-summaryTablePaidDetails='lrCategory']").parent().parent();
			var tbody1	= $("[data-summaryTablePaidDetails1='lrCategory']").parent().parent();
			
			if (totalArticleQtyForPAID > 0) {
				var columnObject		= $("[data-row='summaryTablePaidDetails']").children();
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				for(const element of columnObject) {
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					var dataPicker = $(element).attr("data-summaryTablePaidDetails");
					
					$(newtd).attr("class",$(element).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(element).attr("data-dataTableDetail"));
					$(newtd1).attr("class",$(element).attr("class"));
					$(newtd1).attr("data-dataTableDetail1",$(element).attr("data-dataTableDetail"));
					
					if (dataPicker == LR_CATEGORY) {
						$(newtd).html(WAYBILL_TYPE_PAID_STRING);
						$(newtd1).html(WAYBILL_TYPE_PAID_STRING);	
					} else {
						if(dataPicker == 'totalAmountForPAID' && flavorConfiguration.replacePaidTbbAmountWithLrType)
							$(newtd).html(WAYBILL_TYPE_PAID_STRING);
						else if(dataPicker == 'totalFreightForPAID' && flavorConfiguration.replacePaidTbbFreightWithZero)
							$(newtd).html('0');
						else if(dataPicker == 'totalAmountForPAID' && flavorConfiguration.replacePaidTBBAmountWithDash)
							$(newtd).html('-');
						else if(dataPicker == 'totalAmountForPAID' && flavorConfiguration.doNotShowPaidAmount)
							$(newtd).html('');
						else if(dataPicker == 'totalAmountForPAID' && flavorConfiguration.replacePaidAmountWithPAID)
							$(newtd).html('PAID');
						else if(flavorConfiguration.replaceAllChargesWithZero) {
							if(dataPicker == 'totalOtherAmountForPAID' || dataPicker == 'totalFOVAmountForPAID' || dataPicker == 'totalLoadingForPAID')
								$(newtd).html('0');
							else
								$(newtd).html(summeryObject[dataPicker]);
						} else {
							$(newtd).html(summeryObject[dataPicker]);
							$(newtd1).html(summeryObject[dataPicker]);	
						}
					}
					
					if(crossingSummary != null && crossingSummary.summaryTotalFlag && dataPicker == 'totalAmountForPAID')
						$(newtd).html(crossingSummary.paidTotal);
					
					$(newtr).append($(newtd));
					$(newtr1).append($(newtd1));
				}
				
				$(tbody).before(newtr);
				$(tbody1).before(newtr1);
			}
			
			if (totalArticleQtyForTOPAY > 0) {
				var columnObject		= $("[data-row='summaryTableToPayDetails']").children();
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				for(var j = 0; j < columnObject.length; j++) {
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					
					var dataPicker = $(columnObject[j]).attr("data-summaryTableToPayDetails");
					$(newtd).attr("class", $(columnObject[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail", $(columnObject[j]).attr("data-dataTableDetail"));
					$(newtd1).attr("class", $(columnObject[j]).attr("class"));
					$(newtd1).attr("data-dataTableDetail1", $(columnObject[j]).attr("data-dataTableDetail"));
					
					if (dataPicker == LR_CATEGORY) {
						$(newtd).html(WAYBILL_TYPE_TOPAY_STRING);
						$(newtd1).html(WAYBILL_TYPE_TOPAY_STRING);	
					} else {
						$(newtd).html(summeryObject[dataPicker]);
						$(newtd1).html(summeryObject[dataPicker]);
					}
								
					if(crossingSummary != null && crossingSummary.summaryTotalFlag && dataPicker == 'totalAmountForTOPAY')
						$(newtd).html(crossingSummary.toPayTotal);
						
					$(newtr).append($(newtd));
					$(newtr1).append($(newtd1));
				}
				
				$(tbody).before(newtr);
				$(tbody1).before(newtr1);
			}
			
			if (totalArticleQtyForFOC > 0) {
				var columnObject		= $("[data-row='summaryTableFocDetails']").children();
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				for(var j = 0; j < columnObject.length; j++) {
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					
					var dataPicker = $(columnObject[j]).attr("data-summaryTableFocDetails");
					$(newtd).attr("class", $(columnObject[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail", $(columnObject[j]).attr("data-dataTableDetail"));
					$(newtd1).attr("class", $(columnObject[j]).attr("class"));
					$(newtd1).attr("data-dataTableDetail1", $(columnObject[j]).attr("data-dataTableDetail"));
					
					if (dataPicker == LR_CATEGORY) {
						$(newtd).html(WAYBILL_TYPE_FOC_STRING);
						$(newtd1).html(WAYBILL_TYPE_FOC_STRING);
					} else {
						$(newtd).html(summeryObject[dataPicker]);
						$(newtd1).html(summeryObject[dataPicker]);
					}
						
					if(crossingSummary != null && crossingSummary.summaryTotalFlag && dataPicker == 'totalAmountForFOC')
						$(newtd).html(0);
					
					$(newtr).append($(newtd));
					$(newtr1).append($(newtd1));
				}
				
				$(tbody).before(newtr);
				$(tbody1).before(newtr1);
			}
			
			if (totalArticleQtyForCREDIT > 0) {
				var columnObject		= $("[data-row='summaryTableCreditDetails']").children();
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				for(var j = 0; j < columnObject.length; j++) {
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObject[j]).attr("data-summaryTableCreditDetails");
					$(newtd).attr("class", $(columnObject[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail", $(columnObject[j]).attr("data-dataTableDetail"));
					$(newtd1).attr("class", $(columnObject[j]).attr("class"));
					$(newtd1).attr("data-dataTableDetail1", $(columnObject[j]).attr("data-dataTableDetail"));
					
					if (dataPicker == LR_CATEGORY) {
						$(newtd).html(WAYBILL_TYPE_CREDIT_STRING);
						$(newtd1).html(WAYBILL_TYPE_CREDIT_STRING);
					} else {
						if(flavorConfiguration.customReplacechagesForUniqueGroup) {
							if (dataPicker == 'totalAmountForCREDIT') {
								for(var i = 0; i < tableData.length; i++) {
									if(tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
										$(newtd).addClass('typeTBB');
								}
							}
						}
						
						if(dataPicker == 'totalAmountForCREDIT' && flavorConfiguration.replacePaidTbbAmountWithLrType) {
							$(newtd).html(WAYBILL_TYPE_CREDIT_STRING);
						} else if (dataPicker == 'totalAmountForCREDIT' && (flavorConfiguration.replaceTbbAmountWithZero || flavorConfiguration.replaceTbbAmountWithLrType)){
							if(flavorConfiguration.replaceTbbAmountWithLrType)
								$(newtd).html('TBB');
							else
								$(newtd).html('0');
						} else if (dataPicker == 'totalFreightForCREDIT' && flavorConfiguration.replacePaidTbbFreightWithZero)
							$(newtd).html('0');
						else if (dataPicker == 'totalAmountForCREDIT' && flavorConfiguration.replacePaidTBBAmountWithDash)
							$(newtd).html('-');
						else if (dataPicker == 'totalAmountForCREDIT' && flavorConfiguration.doNotShowTBBAmount)
							$(newtd).html('');
						else if(flavorConfiguration.replaceTbbAmountWithLrType && 
							(dataPicker == 'totalFreightForCREDIT' || dataPicker == 'totalHamaliAmountForCREDIT' || 
							dataPicker == 'totalStationaryAmountForCREDIT' || dataPicker == 'totalFOVAmountForCREDIT' || 
							dataPicker == 'totalLoadingForCREDIT' || dataPicker == 'totalOtherAmountForCREDIT' || 
							dataPicker == 'totalTollAmountForCREDIT' || dataPicker == 'totalDoorCollectionAmountForCREDIT' || 
							dataPicker == 'totalDoorPickupAmountForCREDIT' || dataPicker == 'totalDoorDeliveryAmountForCREDIT' ||
							dataPicker == 'totalSmsAmountForCREDIT' || dataPicker == 'totalCartageAmountForCREDIT' ||
							dataPicker == 'totalCodAmountForCREDIT' || dataPicker == 'totalDocketAmountForCREDIT' || dataPicker == 'totalAmountForCREDIT' || dataPicker == 'totalPaidHamaliAmountForCREDIT')
							){
							$(newtd).html('TBB');
						} else if(flavorConfiguration.replaceAllChargesWithZero) {
							if(dataPicker == 'totalFOVAmountForCREDIT' || dataPicker == 'totalLoadingForCREDIT' || dataPicker == 'totalOtherAmountForCREDIT')
								$(newtd).html('0');
							else
								$(newtd).html(summeryObject[dataPicker]);
						} else {
							$(newtd).html(summeryObject[dataPicker]);
							$(newtd1).html(summeryObject[dataPicker]);
						}
					}
					
					if(crossingSummary != null && crossingSummary.summaryTotalFlag && dataPicker == 'totalAmountForCREDIT')
						$(newtd).html(crossingSummary.tbbTotal);
					
					$(newtr).append($(newtd));
					$(newtr1).append($(newtd1));
				}
				
				$(tbody).before(newtr);
				$(tbody1).before(newtr1);
			}
			
			if(flavorConfiguration.dispatchLSPrintFlavor == "loadingSheet_894") {
				let $paidTr = $(tbody).siblings(`tr:contains(${WAYBILL_TYPE_PAID_STRING})`).clone();
				let $toPayTr = $(tbody).siblings(`tr:contains(${WAYBILL_TYPE_TOPAY_STRING})`).clone();
				let $tbbTr = $(tbody).siblings(`tr:contains(${WAYBILL_TYPE_CREDIT_STRING})`).clone();
				let $focTr = $(tbody).siblings(`tr:contains(${WAYBILL_TYPE_FOC_STRING})`).clone();
				
				$(tbody).siblings("tr").remove();
				$(tbody).before($toPayTr);
				$(tbody).before($tbbTr);
				$(tbody).before($paidTr);
				$(tbody).before($focTr);
			}
			
			var totalTopayPaidFreight		= totalFreightForPAID + totalFreightForTOPAY;
			var totalFreight				= totalFreightForPAID + totalFreightForTOPAY + totalFreightForCREDIT;
			var totalDirectFreight			= totalDirectFreightForPAID + totalDirectFreightForTOPAY + totalDirectFreightForCREDIT;
			var totalConnFreight			= totalConnectingFreightForPAID + totalConnectingFreightForTOPAY + totalConnectingFreightForCREDIT;
			let totalPaidTopayTBBAmount		= totalAmountForPAID + totalAmountForTOPAY + totalAmountForCREDIT;
				PaidTopayTBBtotalAmount		= totalPaidTopayTBBAmount;
			$("[data-row='summaryTablePaidDetails']").remove();
			$("[data-row='summaryTableToPayDetails']").remove();
			$("[data-row='summaryTableFocDetails']").remove();
			$("[data-row='summaryTableCreditDetails']").remove();
			$("[data-row='summaryTablePaidDetails1']").remove();
			$("[data-row='summaryTableToPayDetails1']").remove();
			$("[data-row='summaryTableFocDetails1']").remove();
			$("[data-row='summaryTableCreditDetails1']").remove();
		
			$("[data-summarytotal='TotalLrcount']").html(totallrCountForPAID + totallrCountForTOPAY + totallrCountForFOC + totallrCountForCREDIT);
			$("[data-summarytotal='totalEwayBillCount']").html(totalEwayBillCountForPAID + totalEwayBillCountForTOPAY + totalEwayBillCountForCREDIT +totalEwayBillCountForFOC) 
			$("[data-summarytotal='totalBookingTotal']").html(totalBookingTotalForCREDIT + totalBookingTotalForTOPAY + totalBookingTotalForPAID +totalBookingTotalForFOC) 
			$("[data-summarytotal='totalWayBillLRCount']").html(totalPaidLr + totalToPayLr + totalFocLr + totalTbbLr);
			$("[data-summarytotal='totalArticleQty']").html(totalArticleQtyForPAID + totalArticleQtyForTOPAY + totalArticleQtyForFOC + totalArticleQtyForCREDIT);
			$("[data-summarytotal='totalPickupCharge']").html(totalPickupChargeAmountForPAID + totalPickupChargeAmountForTOPAY + totalPickupChargeAmountForCREDIT);
			$("[data-summarytotal='totalIAndSCharge']").html(totalIandSAmountForPAID + totalIandSAmountForTOPAY + totalIandSAmountForCREDIT);
			$("[data-summarytotal='totalUnloading']").html(totalUnloadingForPAID + totalUnloadingForTOPAY + totaltotalUnloadingForCREDIT)

			if(flavorConfiguration.replacePaidTbbFreightWithZero) {
				$("[data-summarytotal='totalFreight']").html(totalFreightForTOPAY);
			} else{
				$("[data-summarytotal='totalFreight']").html(totalFreight);
				$("[data-summarytotal='totalFreightATM']").html(totalFreight);
				$("[data-summarytotal='totalPickupCharge']").html(totalFreightForTOPAY);
				$("[data-summarytotal='totalDirectFreight']").html(totalDirectFreight);
				$("[data-summarytotal='totalConnFreight']").html(totalConnFreight);
				$("[data-crossingSummarytotal='totalKantAmt']").html(totalKantAmt);
				$("[data-crossingSummarytotal='totalToPayAmount']").html(totalAmountForTOPAY);
				$("[data-crossingSummarytotal='balanceAmount']").html(totalKantAmt - totalAmountForTOPAY);
			}
			
			$("[data-summarytotalArc='totalFreightForPAID']").html(totalFreightForPAID);
			$("[data-summarytotalArc='totalFreightForTOPAY']").html(totalFreightForTOPAY);
			$("[data-summarytotalSmtc='totalFreightForCREDIT']").html(totalFreightForCREDIT);
			$("[data-summarytotalArcSum='totalFreightForPAID']").html(totalAmountForPAID);
			$("[data-summarytotalArcSum='totalFreightForTOPAY']").html(totalAmountForTOPAY);
			$("[data-summarytotalSmtc='totalOtherAmount1ForPAID']").html(totalOtherAmount1ForPAID);
			$("[data-summarytotalSmtc='totalOtherAmount1ForTOPAY']").html(totalOtherAmount1ForTOPAY);
			$("[data-summarytotalSmtc='totalOtherAmount1ForCREDIT']").html(totalOtherAmount1ForCREDIT);
			$("[data-summarytotalArc='totalOtherForArc']").html(totalOtherAmount1ForPAID + totalOtherAmount1ForTOPAY);
			$("[data-summarytotalArc='totalAmountArc']").html(totalFreightForTOPAY + totalFreightForPAID);
			$("[data-summarytotal='totalAmt']").html(totalTopayPaidFreight + (totalOtherAmount1ForPAID + totalOtherAmount1ForTOPAY));
			$("[data-summarytotal='totalAmountSmtc']").html(totalFreightForTOPAY + totalFreightForPAID + totalFreightForCREDIT);
			$("[data-summarytotal='totalFreightForStl']").html(totalFreightForStl);
			$("[data-summarytotal='totalFreightForCREDITSTL']").html(totalFreightForCREDITSTL);
			$("[data-summarytotal='totalFreightForTOPAYSTL']").html(totalFreightForTOPAYSTL);
			$("[data-summarytotal='totalFreightForPAIDSTL']").html(totalFreightForPAIDSTL);
			$("[data-summarytotal='totalFreightForFOCSTL']").html(	totalFreightForFOCSTL);
			$("[data-summarytotal='totalSTL']").html(totalSTL);
			$("[data-summarytotalArcSum='totalFreightForCREDIT']").html(totalAmountForCREDIT);
			$("[data-summarytotalArc='totalFreightForCREDIT']").html(totalAmountForCREDIT);
			$("[data-summarytotal='totalPaidTopayTBBAmount']").html(totalPaidTopayTBBAmount);
			$("[data-summarytotalMKR='totalAmt']").html(totalAmountForPAID + totalAmountForTOPAY);
			$("[data-summarytotal='totalTopayTbb']").html(totalAmountForCREDIT + totalAmountForTOPAY);
			$("[data-summarytotalAgentCommission='totalAgentCommission']").html(agentCommissionOnTopayFreight + agentCommissionOnPaidFreight);
			$("[data-summarytotal='totalForBABAT']").html(totalAmountWithoutHamaliForPAID + totalAmountForTOPAY + totalAmountWithoutHamaliForCREDIT);
			
			if(flavorConfiguration.replaceTbbAmountWithLrType) {
				$("[data-summarytotal='totalFreight']").html(totalTopayPaidFreight);
				$("[data-summarytotal='totalStationary']").html(totalStationaryAmountForPAID + totalStationaryAmountForTOPAY);
				$("[data-summarytotal='totalFOVAmount']").html(totalFOVAmountForPAID + totalFOVAmountForTOPAY);
				$("[data-summarytotal='totalLoading']").html(totalLoadingForPAID + totalLoadingForTOPAY);
				$("[data-summarytotal='totalOther']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY);
				$("[data-summarytotal='otherCharge']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY);
				$("[data-summarytotal='totalHamali']").html(totalHamaliAmountForPAID + totalHamaliAmountForTOPAY);
				$("[data-summarytotal='totalToll']").html(totalTollAmountForPAID + totalTollAmountForTOPAY);
				$("[data-summarytotal='totalDoorCollection']").html(totalDoorCollectionAmountForPAID + totalDoorCollectionAmountForTOPAY);
				$("[data-summarytotal='totalDoorPickup']").html(totalDoorPickupAmountForPAID + totalDoorPickupAmountForTOPAY);
				$("[data-summarytotal='totalDoorDelivery']").html(totalDoorDeliveryAmountForPAID + totalDoorDeliveryAmountForTOPAY);
				$("[data-summarytotal='totalSms']").html(totalSmsAmountForPAID + totalSmsAmountForTOPAY);
				$("[data-summarytotal='totalOther']").html(totalOtherAmount1ForPAID + totalOtherAmount1ForTOPAY);
				$("[data-summarytotal='totalCartageAmount']").html(totalCartageAmountForPAID + totalCartageAmountForTOPAY);
				$("[data-summarytotal='totalCodAmount']").html(totalCodAmountForPAID + totalCodAmountForTOPAY);
				$("[data-summarytotal='totalDocketAmount']").html(totalDocketAmountForPAID + totalDocketAmountForTOPAY);
				$("[data-summarytotal='totalAmount']").html(totalAmountForPAID + totalAmountForTOPAY);
				$("[data-summarytotal='totalLrChargeAmount']").html(totalLrChargeAmountForPAID + totalLrChargeAmountForTOPAY);
				$("[data-summarytotal='totalCrossingChargeAmount']").html(totalCrossingChargeAmountForPAID + totalCrossingChargeAmountForTOPAY);
				$("[data-summarytotal='totalAmountForRT']").html(totalFreightForPAID + totalAmountForTOPAY);
				$("[data-summarytotal='unloadingAmnt']").html(totalUnloadingForPAID + totalUnloadingForTOPAY);
				$("[data-summarytotal='totalUnloadingAmnt']").html(totalUnldingForPAID + totalUnldingForTOPAY);
				$("[data-summarytotal='totalAmnt']").html(totalTotalForPAID + totalTotalForTOPAY);
				$("[data-summarytotal='grandTotalAmntSks']").html(totalGrandTotalForPAID + totalGrandTotalForTOPAY);
				$("[data-summarytotal='totalSTCharge']").html(totalSTChargeForPAID + totalSTChargeForTOPAY);
				$("[data-summarytotal='totalTempoBhadaBooking']").html(totalTempoBhadaBookingForPAID + totalTempoBhadaBookingForTOPAY);
				$("[data-summarytotal='totalCrossingHire']").html(totalCrossingHireForPAID + totalCrossingHireForTOPAY);
				$("[data-summarytotal='totalHandlingCharge']").html(totalHandlingChargeForPAID + totalHandlingChargeForTOPAY);
				$("[data-summarytotal='totalStaticalCharge']").html(totalStaticalChargeForPAID + totalStaticalChargeForTOPAY);
				$("[data-summarytotal='totalTollGateCharge']").html(totalTollGateChargeForPAID + totalTollGateChargeForTOPAY);
				$("[data-summarytotal='totalCantonmentCharge']").html(totalCantonmentChargeForPAID + totalCantonmentChargeForTOPAY);
				$("[data-summarytotal='totalWeightBridgeCharge']").html(totalWeightBridgeChargeForPAID + totalWeightBridgeChargeForTOPAY);
				$("[data-summarytotal='totalPickupCharge']").html(totalPickupChargeAmountForTOPAY + totalPickupChargeAmountForPAID + totalPickupChargeAmountForCREDIT);
				$("[data-summarytotal='totalIAndSCharge']").html(totalIandSAmountForPAID + totalIandSAmountForTOPAY + totalIandSAmountForCREDIT);
				$("[data-summarytotal='totalOtherforsrisai']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY + totalOtherAmountForCREDIT);	
				$("[data-summarytotal='totalUnloadingAmtForSsls']").html(totalUnloadingAmtForPAID + totalUnloadingAmtForTOPAY + totalUnloadingAmtForCREDIT);
				$("[data-summarytotal='totalArtCharge']").html(totalArtChargeAmtForPAID + totalArtChargeAmtForTOPAY);
				$("[data-summarytotal='totalWithPassCharge']").html(totalWithPassChargeAmtForPAID + totalWithPassChargeAmtForTOPAY);				
				$("[data-summarytotal='totalLucCharge']").html(totalLucChargeAmtForPAID + totalLucChargeAmtForTOPAY);				
				$("[data-summarytotal='totalVscCharge']").html(totalVscChargeAmtForPAID + totalVscChargeAmtForTOPAY);				
				$("[data-summarytotal='totalDoorBookCharge']").html(totalDoorBookChargeAmtForPAID + totalDoorBookChargeAmtForTOPAY);
				$("[data-summarytotal='totalSurCharge']").html(totalSurChargeAmtForPAID + totalSurChargeAmtForTOPAY);	
				$("[data-summarytotal='totalAmountForCREDIT']").html(totalAmountForCREDIT);	
				$("[data-summarytotal='totalAmountForPAID']").html(totalAmountForPAID);	
				$("[data-summarytotal='totalAmountForTOPAY']").html(totalAmountForTOPAY);
				$("[data-summarytotal='totalBuiltyCharge']").html(totalBuiltyForPAID + totalBuiltyForTOPAY + totalBuiltyForCREDIT);
				$("[data-summarytotal='totalWayBillCodVppAmount']").html(totalWayBillCodVppAmountForPAID + totalWayBillCodVppAmountForTOPAY);
				$("[data-summarytotal='totalAmountdhl']").html((totalAmountForPAID + totalAmountForTOPAY) - (totalLoadingForPAID + totalLoadingForTOPAY + totalLoadingForCREDIT));
			} else {
				$("[data-summarytotal='totalFreight']").html(totalFreight);
				$("[data-summarytotal='totalFreightForToPay']").html(totalFreightForTOPAY);
				$("[data-summarytotal='totalStationary']").html(totalStationaryAmountForPAID + totalStationaryAmountForTOPAY + totalStationaryAmountForCREDIT);
				$("[data-summarytotal='totalFOVAmount']").html(totalFOVAmountForPAID + totalFOVAmountForTOPAY + totalFOVAmountForCREDIT);
				$("[data-summarytotal='totalFOVAmountForToPay']").html(totalFOVAmountForTOPAY);
				$("[data-summarytotal='totalLoading']").html(totalLoadingForPAID + totalLoadingForTOPAY + totalLoadingForCREDIT);
				$("[data-summarytotal='totalLoadingForToPay']").html(totalLoadingForTOPAY);
				$("[data-summarytotal='totalOther']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY + totalOtherAmountForCREDIT);
				$("[data-summarytotal='totalOtherForToPay']").html(totalOtherAmountForTOPAY);
				$("[data-summarytotal='otherCharge']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY + totalOtherAmountForCREDIT);
				$("[data-summarytotal='totalHamali']").html(totalHamaliAmountForPAID + totalHamaliAmountForTOPAY + totalHamaliAmountForCREDIT);
				$("[data-summarytotal='totalToll']").html(totalTollAmountForPAID + totalTollAmountForTOPAY + totalTollAmountForCREDIT);
				$("[data-summarytotal='totalDoorCollection']").html(totalDoorCollectionAmountForPAID + totalDoorCollectionAmountForTOPAY + totalDoorCollectionAmountForCREDIT);
				$("[data-summarytotal='totalDoorPickup']").html(totalDoorPickupAmountForPAID + totalDoorPickupAmountForTOPAY + totalDoorPickupAmountForCREDIT);
				$("[data-summarytotal='totalDoorDelivery']").html(totalDoorDeliveryAmountForPAID + totalDoorDeliveryAmountForTOPAY + totalDoorDeliveryAmountForCREDIT);
				$("[data-summarytotal='totalSms']").html(totalSmsAmountForPAID + totalSmsAmountForTOPAY + totalSmsAmountForCREDIT);
				$("[data-summarytotal='totalOther']").html(totalOtherAmount1ForPAID + totalOtherAmount1ForTOPAY + totalOtherAmount1ForCREDIT);
				$("[data-summarytotal='totalCartageAmount']").html(totalCartageAmountForPAID + totalCartageAmountForTOPAY + totalCartageAmountForCREDIT);
				$("[data-summarytotal='totalCodAmount']").html(totalCodAmountForPAID + totalCodAmountForTOPAY + totalCodAmountForCREDIT);
				$("[data-summarytotal='totalDocketAmount']").html(totalDocketAmountForPAID + totalDocketAmountForTOPAY + totalDocketAmountForCREDIT);
				$("[data-summarytotal='totalLrChargeAmount']").html(totalLrChargeAmountForPAID + totalLrChargeAmountForTOPAY + totalLrChargeAmountForCREDIT);
				$("[data-summarytotal='totalCrossingChargeAmount']").html(totalCrossingChargeAmountForPAID + totalCrossingChargeAmountForTOPAY + totalCrossingChargeAmountForCREDIT);
				$("[data-summarytotal='totalAmountForRT']").html(totalFreightForPAID + totalAmountForTOPAY + totalAmountForCREDIT);
				$("[data-summarytotal='unloadingAmnt']").html(totalUnloadingForPAID + totalUnloadingForTOPAY + totaltotalUnloadingForCREDIT);
				$("[data-summarytotal='totalAmnt']").html(totalTotalForPAID + totalTotalForTOPAY + totalTotalForCREDIT);
				$("[data-summarytotal='grandTotalAmntSks']").html(totalGrandTotalForPAID + totalGrandTotalForTOPAY + totalGrandTotalForCREDIT);
				$("[data-summarytotal='totalUnloadingAmnt']").html(totalUnldingForPAID + totalUnldingForTOPAY + totalUnldingForCREDIT);
				$("[data-summarytotal='totalSTCharge']").html(totalSTChargeForPAID + totalSTChargeForTOPAY + totalSTChargeForCREDIT);
				$("[data-summarytotal='totalTempoBhadaBooking']").html(totalTempoBhadaBookingForPAID + totalTempoBhadaBookingForTOPAY + totalTempoBhadaBookingForCREDIT);
				$("[data-summarytotal='totalCrossingHire']").html(totalCrossingHireForPAID + totalCrossingHireForTOPAY + totalCrossingHireForCREDIT);
				$("[data-selector='lrDetailsTotalActualWeight']").html(lrDetailsTotalActualWeightForPAID + lrDetailsTotalActualWeightForTOPAY + lrDetailsTotalActualWeightForFOC + lrDetailsTotalActualWeightForCREDIT);
				$("[data-summarytotal='totalHandlingCharge']").html(totalHandlingChargeForPAID + totalHandlingChargeForTOPAY + totalHandlingChargeForCREDIT);
				$("[data-summarytotal='totalStaticalCharge']").html(totalStaticalChargeForPAID + totalStaticalChargeForTOPAY + totalStaticalChargeForCREDIT);
				$("[data-summarytotal='totalTollGateCharge']").html(totalTollGateChargeForPAID + totalTollGateChargeForTOPAY + totalTollGateChargeForCREDIT);
				$("[data-summarytotal='totalCantonmentCharge']").html(totalCantonmentChargeForPAID + totalCantonmentChargeForTOPAY + totalCantonmentChargeForCREDIT);
				$("[data-summarytotal='totalWeightBridgeCharge']").html(totalWeightBridgeChargeForPAID + totalWeightBridgeChargeForTOPAY + totalWeightBridgeChargeForCREDIT);
				$("[data-summarytotal='totalPickupCharge']").html(totalPickupChargeAmountForPAID + totalPickupChargeAmountForTOPAY + totalPickupChargeAmountForCREDIT);
				$("[data-summarytotal='totalPaidHamali']").html(totalPaidHamaliAmountForPAID + totalPaidHamaliAmountForTOPAY + totalPaidHamaliAmountForCREDIT);
				$("[data-summarytotal='totalOtherforMcargo']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY + totalOtherAmountForCREDIT);	
				$("[data-summarytotal='totalIAndSCharge']").html(totalIandSAmountForPAID + totalIandSAmountForTOPAY + totalIandSAmountForCREDIT);
				$("[data-summarytotal='totalOtherforsrisai']").html(totalOtherAmountForPAID + totalOtherAmountForTOPAY + totalOtherAmountForCREDIT);	
				$("[data-summarytotal='totalUnloadingAmtForSsls']").html(totalUnloadingAmtForPAID + totalUnloadingAmtForTOPAY + totalUnloadingAmtForCREDIT);
				$("[data-summarytotal='totalArtCharge']").html(totalArtChargeAmtForPAID + totalArtChargeAmtForTOPAY + totalArtChargeAmtForCREDIT);				
				$("[data-summarytotal='totalWithPassCharge']").html(totalWithPassChargeAmtForPAID + totalWithPassChargeAmtForTOPAY + totalWithPassChargeAmtForCREDIT);				
				$("[data-summarytotal='totalLucCharge']").html(totalLucChargeAmtForPAID + totalLucChargeAmtForTOPAY + totalLucChargeAmtForCREDIT);				
				$("[data-summarytotal='totalVscCharge']").html(totalVscChargeAmtForPAID + totalVscChargeAmtForTOPAY + totalVscChargeAmtForCREDIT);				
				$("[data-summarytotal='totalDoorBookCharge']").html(totalDoorBookChargeAmtForPAID + totalDoorBookChargeAmtForTOPAY + totalDoorBookChargeAmtForCREDIT);				
				$("[data-summarytotal='totalSurCharge']").html(totalSurChargeAmtForPAID + totalSurChargeAmtForTOPAY + totalSurChargeAmtForCREDIT);				
			
				$("[data-summarytotal='totalAmountForCREDIT']").html(totalAmountForCREDIT);	
				$("[data-summarytotal='totalAmountForPAID']").html(totalAmountForPAID);	
				$("[data-summarytotal='totalAmountForTOPAY']").html(totalAmountForTOPAY);	
				$("[data-summarytotal='totalArticleForCREDIT']").html(totalArticleQtyForCREDIT);	
				$("[data-summarytotal='totalArticleForPAID']").html(totalArticleQtyForPAID);	
				$("[data-summarytotal='totalArticleForTOPAY']").html(totalArticleQtyForTOPAY);	
				$("[data-summarytotal='totalArticleForFOC']").html(totalArticleQtyForFOC);	
				$("[data-summarytotal='totalActualWeightForNML']").html(totalActualWeightForNmlPAID + totalActualWeightForNmlTOPAY + totalActualWeightForNmlFOC + totalActualWeightForNmlCREDIT);
				$("[data-summarytotal='totalAmountstl']").html(totalFreightForPAID + totalAmountForTOPAY + totalFreightForCREDIT);
				$("[data-summarytotal='totalBuiltyCharge']").html(totalBuiltyForPAID + totalBuiltyForTOPAY + totalBuiltyForCREDIT);
				$("[data-summarytotal='totalHCCharge']").html(totalHCChargeForPAID + totalHCChargeForTOPAY + totalHCChargeForCREDIT);
				$("[data-summarytotal='totalToPayHamaliCharge']").html(totalToPayHamaliForPAID + totalToPayHamaliForTOPAY + totalToPayHamaliForCREDIT);
				$("[data-summarytotal='totalWayBillCodVppAmount']").html(totalWayBillCodVppAmountForPAID + totalWayBillCodVppAmountForTOPAY + totalWayBillCodVppAmountForCREDIT);
				$("[data-summarytotal='totalDDChargeAmount']").html(totalDDChargeAmountForPAID + totalDDChargeAmountForTOPAY + totalDDChargeAmountForCREDIT);
				$("[data-summarytotal='totalDDCChargeAmount']").html(totalDDCChargeAmountForPAID + totalDDCChargeAmountForTOPAY + totalDDCChargeAmountForCREDIT);
				$("[data-summarytotal='totalDCChargeAmount']").html(totalDCChargeAmountForPAID + totalDCChargeAmountForTOPAY + totalDCChargeAmountForCREDIT);

				if(flavorConfiguration.replacePaidTbbAmountWithLrType)
					$("[data-summarytotal='totalAmount']").html(totalAmountForTOPAY);
				else if (flavorConfiguration.replaceTbbAmountWithZero)
					$("[data-summarytotal='totalAmount']").html(totalAmountForPAID + totalAmountForTOPAY);
				else if (flavorConfiguration.replacePaidAmountWithPAID)
					$("[data-summarytotal='totalAmount']").html(totalAmountForCREDIT + totalAmountForTOPAY );
				else if (flavorConfiguration.replaceAmountWithBlank)
					$("[data-summarytotal='totalAmount']").html("&nbsp;");
				else if(flavorConfiguration.replacePaidTBBAmountWithDash || (flavorConfiguration.doNotShowTBBAmount && flavorConfiguration.doNotShowPaidAmount))
					$("[data-summarytotal='totalAmount']").html(totalAmountForTOPAY);
				else
					$("[data-summarytotal='totalAmount']").html(Math.round(totalPaidTopayTBBAmount));
										
				$("[data-summarytotal='totalAmountSadashiva']").html(Math.round(totalPaidTopayTBBAmount));
				$("[data-summarytotal='totalAmountGeeta']").html(Math.round(totalFreightForPAID + totalAmountForTOPAY + totalFreightForCREDIT));
								
												
				let commissionGTT = (totalFreight * 25) / 100;
				let newAmnt = totalFreight - commissionGTT;
					
				$("[data-ls='commissionGtt']").html(commissionGTT);	
				$("[data-ls='netAmntGtt']").html(newAmnt);	
					
				if(flavorConfiguration.replacePaidAmountWithZero)
					$("[data-summarytotal='totalAmountForSSTS']").html(totalAmountForTOPAY + totalAmountForCREDIT);
			}
			
			for(var i = 0; i < tableData.length; i++) {
				crossingHireshiv += tableData[i].crossingHireAmt;
			}
		
			var totalCrossingHire = totalPaidTopayTBBAmount - crossingHireshiv
			$("[data-summarytotal ='crossingHireshiv']").html("Crossing Hire( " +crossingHireshiv+" ) ");
			$("[data-summarytotal='totalCrossingHireRate']").html("Total Crossing Hire( " + totalCrossingHire + " ) ");
			$("[data-summarytotal='totalAmountShiv']").html("Total( "+totalPaidTopayTBBAmount +" )");
			$("[data-summarytotal='totalActualWeight']").html(totalActualWeightForPAID + totalActualWeightForTOPAY + totalActualWeightForFOC + totalActualWeightForCREDIT);
			$("[data-summarytotal='totalChargeWeight']").html(totalChargeWeightForPAID + totalChargeWeightForTOPAY + totalChargeWeightForFOC + totalChargeWeightForCREDIT);
			$("[data-summarytotal='totalOtherAptc']").html(totalOtherAmountAptcForPAID + totalOtherAmountAptcForTOPAY + totalOtherAmountAptcForCREDIT);
			$("[data-summarytotal='totaldoordeliverylrs']").html(totalPaidDoorDly + totalToPayDoorDly + totalFocDoorDly + totalTbbDoorDly);
			$("[data-selector='lrDetailsTotalActualWeight']").html(lrDetailsTotalActualWeightForPAID + lrDetailsTotalActualWeightForTOPAY + lrDetailsTotalActualWeightForFOC + lrDetailsTotalActualWeightForCREDIT);
			$("[data-selector='lrDetailsTotalArticleQty']").html(lrDetailsTotalArticleQtyForPAID + lrDetailsTotalArticleQtyForTOPAY + lrDetailsTotalArticleQtyForFOC + lrDetailsTotalArticleQtyForCREDIT);
			
			$("[data-summarytotalArcSum='totalFreightForCREDIT']").html(totalFreightForCREDIT);
			$("[data-summarytotalPaidArt='totalArticleQtyForPaid']").html(totalArticleQtyForPAID);
			$("[data-summarytotalPaidArt='totalArticleQtyForToPay']").html(totalArticleQtyForTOPAY);
			$("[data-summarytotalPaidArt='totalArticleQtyForCredit']").html(totalArticleQtyForCREDIT);
			$("[data-summarytotalPaidArt='totalArticleQtyForFOC']").html(totalArticleQtyForFOC);
			
			$("[data-summarytotal='totalServiceTax']").html(totalServiceTaxForPAID + totalServiceTaxForTOPAY + totalServiceTaxForCREDIT);
			$("[data-summarytotal='totalWayBillDiscount']").html(totalWayBillDiscountForPAID + totalWayBillDiscountForTOPAY + totalWayBillDiscountForCREDIT);
			$("[data-summarytotal='totalLrs']").html(totalPaidLr + totalToPayLr + totalFocLr + totalTbbLr);
			$("[data-summarytotalArc='totalLrsArc']").html(totalArticleQtyForPAID + totalArticleQtyForTOPAY + totalArticleQtyForCREDIT);
			$("[data-summarytotalSmtc='totalQtyForSmtc']").html(totalArticleQtyForPAID + totalArticleQtyForTOPAY + totalArticleQtyForCREDIT);
			$("[data-summarytotal='totalAdvance']").html(totalAdvancePaidAptcForPAID + totalAdvancePaidAptcForTOPAY + totalAdvancePaidAptcForCREDIT);
			$("[data-summarytotal='totalBalance']").html(totalBalanceAmountAptcForPAID + totalBalanceAmountAptcForTOPAY + totalBalanceAmountAptcForCREDIT);
			$("[data-summarytotal='summarytotalAmount']").html(totalAmountForPAID + totalAmountForTOPAY + totalAmountForCREDIT);
				
			$("[data-summarytotal='totalCrossingLrActualWeight']").html(
				totalCrossingLrActualWeightForPAID +
				totalCrossingLrActualWeightForTOPAY + 
				totalCrossingLrActualWeightForCREDIT + 
				totalCrossingLrActualWeightForFOC
			)
			
		}, setFooterDiv : function(footerData, response, totalObjects, wayBillTableData, isSearchModule) { //function defined in dispatchlsprintdestinationwise.js file
			var flavorConfiguration					= response.FlavorConfiguration;
			var totalBookingAmount					= response.totalBookingAmount;
			var subRegionAllowedForPopup			= response.subRegionAllowedForPopup;
			
			$("[data-selector='lsRemarkLabel']").html($("[data-selector='lsRemarkLabel']").attr("data-selector")+":");
			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);
			$("[data-selector='driverNameLabel']").html($("[data-selector='driverNameLabel']").attr("data-selector")+":");
			$("[data-info='driverName']").html(footerData[$("[data-info='driverName']").attr("data-info")]);
			$("[data-info='driverNameWithNumber']").html(footerData[$("[data-info='driverNameWithNumber']").attr("data-info")]);
			$("[data-info='loaderName']").html(footerData[$("[data-info='loaderName']").attr("data-info")]);
			$("[data-selector='driverLicenseLabel']").html($("[data-selector='driverLicenseLabel']").attr("data-selector")+":");
			$("[data-info='driverLicense']").html(footerData[$("[data-info='driverLicense']").attr("data-info")]);
			$("[data-info='time']").html(footerData[$("[data-info='time']").attr("data-info")]);
			$("[data-selector='dateTimeLabel']").html($("[data-selector='dateTimeLabel']").attr("data-selector")+":");
			$("[data-info='dateTime']").html(footerData[$("[data-info='dateTime']").attr("data-info")]);
			$("[data-selector='cleanerNameLabel']").html($("[data-selector='cleanerNameLabel']").attr("data-selector")+":");
			$("[data-info='cleanerName']").html(footerData[$("[data-info='cleanerName']").attr("data-info")]);
			$("[data-info='cleanerNameWithNumber']").html(footerData[$("[data-info='cleanerNameWithNumber']").attr("data-info")]);
			$("[data-selector='receiverNameLabel']").html($("[data-selector='receiverNameLabel']").attr("data-selector")+":");
			$("[data-info='receiverName']").html(footerData[$("[data-info='receiverName']").attr("data-info")]);
			$("[data-selector='preparedByLabel']").html($("[data-selector='preparedByLabel']").attr("data-selector")+":");
			$("[data-info='preparedBy']").html(footerData[$("[data-info='preparedBy']").attr("data-info")]);
			$("[data-selector='loadedByLabel']").html($("[data-selector='loadedByLabel']").attr("data-selector")+":");
			$("[data-info='loadedBy']").html(footerData[$("[data-info='loadedBy']").attr("data-info")]);
			$("[data-selector='checkedByLabel']").html($("[data-selector='checkedByLabel']").attr("data-selector")+":");
			$("[data-info='checkedBy']").html(footerData[$("[data-info='checkedBy']").attr("data-info")]);
			$("[data-info='dispatchLSExecutiveBranchName']").html(footerData[$("[data-info='dispatchLSExecutiveBranchName']").attr("data-info")]);
			$("[data-info='preparedByN']").html(footerData.preparedBy);
			
			if(footerData[$("[data-info='ownerName']").attr("data-info")] != undefined)
				$("[data-info='ownerName']").html(footerData[$("[data-info='ownerName']").attr("data-info")]);
				
			if(footerData[$("[data-info='ownerAddress']").attr("data-info")] != undefined)
				$("[data-info='ownerAddress']").html(footerData[$("[data-info='ownerAddress']").attr("data-info")]);
			
			$("[data-info='driverMobileNumber']").html(footerData[$("[data-info='driverMobileNumber']").attr("data-info")]);
			
			if(footerData.driverMobileNumber != undefined)
				$("[data-info='driverMobileNumberWithBracket']").html("&nbsp;("+footerData.driverMobileNumber+")");
			
			if(totalBookingAmount != undefined){
				$("[data-info='totalBookingAmount']").html(totalBookingAmount);
				$("[data-info='totalBookingAmountInWord']").html(convertNumberToWord(totalBookingAmount).toUpperCase()+" ONLY ");
			}
				
			
			if (!flavorConfiguration.showDriverSignLabel) {
				var target	= $('#fixedFooterForMps').find('td[data-selector="driverSignLabel"]');
				var index	= (target).index();
				$('#fixedFooterForMps tr').find('td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showUnloadedByLabel) {
				var target	= $('#fixedFooterForMps').find('td[data-selector="unLoadedByLabel"]');
				var index	= (target).index();
				$('#fixedFooterForMps tr').find('td:eq(' + index + ')' ).remove();
			}
			
			if(flavorConfiguration.showDriverSignLabel && flavorConfiguration.showUnloadedByLabel)
				$('#mpsfooter').show();
			
			// removeAmount = 'true';
			var _this = this;
			var showPopup			= false;
			
			$("*[data-popup='popup']").each(function(){
				showPopup			= true;
			});
			
			
			
			if(showPopup) {
				$('#printAndViewPopUpKcpl').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:70pt;width:218pt; text-align: left;padding-top:12px; padding-left:52px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='viewKcpl' value ='View' style='height:50px;width:90px;font-size:20px;'></input>"
							+"<input type='button' id='printKcpl' value ='Print' style='height:50px;width:90px;font-size:20px;'></input></div>")
				
					$("#viewKcpl").click(function(){
						_thisMod.close();
					});
					$("#printKcpl").click(function(){
						_thisMod.close();
						$('.ReceiverNumberKcpl').hide();
						setTimeout(function(){window.print();},200);
					});
				
				});
				
				$('#popupconent515').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:200px;width:250px; text-align: left; padding:15px'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Charges</b><br/><br/>"		
							+"<input type='radio' id='printRegularLS515'  name='print' checked>&nbsp;<b style='font-size:14px;'>Print Regular LS</b><br/><br/>"
							+"<input type='radio' id='printLSwithLC515'name='print'>&nbsp;<b style='font-size:14px;'>Print LS with LC</b><br/><br/>"
							+"<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+"<button id='cancelButton'>CANCEL</button></center>"
							+"<button autofocus id='confirm'>YES</button></div>")

					$('#confirm').focus();
					$("#confirm").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					})
					
					$("#confirm").on('keydown', function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					
					$("#cancelButton").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					
					$("#confirm").click(function() {
						if($('#printRegularLS515').prop("checked") == true){
							$('.hideCharges515').hide();
							_thisMod.close();
							
							setTimeout(function() { }, 200);
						}
					});
					
					$("#confirm").click(function() {
						if($('#printLSwithLC515').prop("checked") == true){
							$('.LChideCharges515').hide();
							_thisMod.close();
							
							setTimeout(function() { }, 200);
						}
					});
				});
				
				$('#popupconent839').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:200px;width:250px; text-align: left; padding:15px'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Charges</b><br/><br/>"		
							+"<input type='radio' id='printRegularLS515'  name='print' >&nbsp;<b style='font-size:14px;'>PRINT PAID AMOUNT</b><br/><br/>"
							+"<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+"<button id='cancelButton'>CANCEL</button></center>"
							+"<button autofocus id='confirm'>YES</button></div>")

					$('#confirm').focus();
					$("#confirm").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					})
					
					$("#confirm").on('keydown', function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					
					$("#cancelButton").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					
					$("#confirm").click(function() {
						if($('#printRegularLS515').prop("checked") == true){
							
							$('.showPaidCharge').show();
							$('.hidePaidCharge').hide();
							_thisMod.close();
							
							setTimeout(function() { }, 200);
						}
					});
					
				});
				
				$('#popUpContent').bPopup({
				}, function() {
					var _thisMod = this;
					var removeAmount = false;
					$(this).html("<div class='confirm' style='height:200px;width:250px; text-align: left; padding:15px'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
							+"<input type='checkbox' id='printCharges' checked>&nbsp;<b style='font-size:14px;'>Print Charges</b><br/><br/>"
							+"<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+"<button autofocus id='confirm'>YES</button>"
							+"<button id='cancelButton'>CANCEL</button></center></div>")
							
					$("#confirm").focus();
					
					$(document).ready(function() {
						var n = $( "input:checked" ).length;
						removeAmount = !(n > 0);
						
						$('input[id="printCharges"]'). click(function() {
							removeAmount = !($(this).prop("checked"));
						});
					});
					
					$("#confirm").click(function(){
						_thisMod.close();
						_this.removeSelectedTableColumn(removeAmount);
						setTimeout(function(){window.print();},200);
					})
					
					$("#cancelButton").click(function(){
						_thisMod.close();
					})
					
					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  //escape
							_thisMod.close();
							_this.removeSelectedTableColumn(removeAmount);
							setTimeout(function(){window.print();},200);
						}
					});
				});
				
				$('#popUpContent1').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:80px;width:250px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
							+"<input type='button' id='laserPrintButton' value ='Laser' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
							
							$("#laserPrintButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
									var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
									window.open(path);

									e.preventDefault();
								});
				});
				
				$('#excelDownLoad').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div id='popUpDiv' class='confirm' style='height:80px;width:250px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
							
							$("#laserPrintButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
								 _thisMod.close();
								   var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
								   window.open(path);

								   e.preventDefault();
							   });
				});
				
				$('#LSExcelPopUp').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:80px;width:250px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
							+"<input type='button' id='laserPrintButton' value ='Laser' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='checkbox' id='printChargesbato' unchecked>&nbsp;<b style='font-size:14px; margin-top=5px;'>Print Amount</b></div>")
							
							$("#laserPrintButton").click(function(){
								if(!$('#printChargesbato').prop("checked"))
									$('.hideCharges442').hide();
								
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
								 showLayer();
										var data = new Object();
										
										data.dispatchLedgerId	= dispatchLedgerId;
										
										$.ajax({
											  type: "POST",
											  url: WEB_SERVICE_URL+"/dispatchWs/getDispatchPrintExcel.do?",
											  data: data,
											  dataType: "json",
											  success: function(resultData){
												  hideLayer();
													
												if(resultData.message != undefined) {
													var errorMessage = resultData.message;
													showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
													generateFileToDownload(resultData);//genericfunctions.js
													hideLayer();
												}
											  }, error: function() {
												  hideLayer();
												  showMessage('error', 'Something Really Bad Happened !');
											  }
										});
								});
				});
				
				$('#missingLRPopup').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div id='popUpDiv' class='confirm' style='height:80px;width:250px; text-align: center;padding-top:12px;padding-bottom:50px;'>"
						+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
						+"<input type='button' id='showLR' value ='Show Missing LR' style='height:50px;width:150px;font-size:17px;position:relative;'></input>"
						+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:100px;font-size:17px;position:relative;margin-left: 10px;'></input></div>")
						
						$("#showLR").click(function(){
							$(".missingLR").show();
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						})
				
						$("#cancelButton").click(function(){
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						})
							
				});
				
				$('#commissionTablePopup').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div id='popUpDiv' class='confirm' style='height:80px;width:250px; text-align: center;padding-top:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='showLR' value ='Show Commission Table' style='height:50px;width:150px;font-size:17px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:100px;font-size:17px;position:relative;margin-left: 10px;'></input></div>")
							
							$("#showLR").click(function(){
								$(".commissionTable").show();
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
							
							$("#cancelButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
							
				});
				
				$('#excelDownLoadPDF').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:70pt;text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
							+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;margin-left: 20pt;'></input>"
							/*+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='pdfButton' value ='PDF' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"*/
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;margin-left: 20pt;'></input></div>")
							
							$("#laserPrintButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
								 var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcelAndPDF').html());
								 window.open(path);
								 e.preventDefault();
							  });
					
						(function () {	
							$('#pdfButton').on('click', function () {  
								_thisMod.close();
								setTimeout(function(){exportPDF(document,'LoadingSheetPrint.pdf');},200);
							});	 
						}());
				});
				
				$('#excelDownLoadPDF_313').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:70pt;width:288pt; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
							+"<input type='button' id='laserPrintButton' value ='Laser' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='pdfButton' value ='PDF' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
							
							$("#laserPrintButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
								 var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(document.body.innerHTML);
								 window.open(path);
								 e.preventDefault();
								 _thisMod.close();
								});
					
						(function () {	
							$('#pdfButton').on('click', function () {  
									_thisMod.close();
									setTimeout(function(){exportPDF(document,'LoadingSheetPrint.pdf');},200);
								 _thisMod.close();
							});	 
						}());
				});
				
				$('#popupconentforsrlipl').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:200px;width:250px; text-align: left; padding:15px'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Freight Charges</b><br/><br/>"		
							+"<input type='checkbox' id='printFreighcharges' checked>&nbsp;<b style='font-size:14px;'>Print Charges</b><br/><br/>"
							+"<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+"<button id='cancelButton'>CANCEL</button></center>"
							+"<button autofocus id='confirm'>YES</button></div>")

					$('#confirm').focus();
					$("#confirm").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					})
					$("#confirm").on('keydown', function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					$("#cancelButton").click(function() {
						_thisMod.close();
						setTimeout(function() { window.print(); }, 200);
					});
					$("#confirm").click(function() {
						if($('#printFreighcharges').prop("checked") == false){
							$('.hideFreightCharges').hide();
							_thisMod.close();
							setTimeout(function() { }, 200);
						}
					});
				});
				
				if(flavorConfiguration.showPopUpOnLsOpenFromSearchModule){
					if(isSearchModule == 'true'){
						$('#excelDownLoadPDF_268').bPopup({
						}, function() {
							var _thisMod = this;
							$(this).html("<div class='confirm' style='height:70pt;width:288pt; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
									+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
									+"<input type='button' id='laserPrintButton' value ='Laser' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
									+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
									+"<input type='button' id='pdfButton' value ='PDF' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
									+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
									
									$("#laserPrintButton").click(function(){
										_thisMod.close();
										setTimeout(function(){window.print();},200);
									})
									
									$("#cancelButton").click(function(){
										_thisMod.close();
									})
									
									$("#excelButton").click(function(e) {
										var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(document.body.innerHTML);
										window.open(path);
										e.preventDefault();
									});
							
							(function () { 
								$('#pdfButton').on('click', function () {  
									_thisMod.close();
									setTimeout(function(){exportPDF(document,'LoadingSheetPrint.pdf');},200);
									_thisMod.close();
								});	 
							}());
						});
					} else if(!$('.openPrintWindow').length) {
						setTimeout(function(){window.print();},200);
					}
				}
				
				$('#popUpContent_292').bPopup({
				}, function() {
					var _thisMod = this;
					//backdrop: 'static',
							
					if(footerData.receivedLedgerId > 0) {
						$(this).html("<div id='popUpDiv' class='confirm' style='height:120px;width:350px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
								+"<b style='font-size:18px; color:DodgerBlue;'><input type='radio' name='bnt' id='original' checked value ='Duplicate copy'>Duplicate copy<br><br> <input type='radio' name='bnt' id='driver' value='Destination / Driver copy (Duplicate)'>Destination / Driver copy (Duplicate)<br><br>" +
								"<input type='radio' name='bnt' id='hocopy1'  value='HO copy (Duplicate)'>HO copy (Duplicate)<br><br>" +
								"<input type='button' id='ok' value='ok' style='height:30px;width:60px;font-size:20px;position:relative;' ></input> </div>")
						
						$('.originalcopy').html('DUPLICATE COPY');
						$('.drivercopy').html('Destination / Driver copy (Duplicate)');
						$('.hocopy').html(' HO Copy (Duplicate)');
					} else {
						$(this).html("<div id='popUpDiv' class='confirm' style='height:120px;width:280px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
								+"<b style='font-size:18px; color:DodgerBlue;'><input type='radio' name='bnt' id='original' checked value ='Original copy'>Original copy<br><br> <input type='radio' name='bnt' id='driver'	 value='Destination / Driver copy'>Destination / Driver copy<br><br>" +
								"<input type='radio' name='bnt' id='hocopy1'  value='HO copy'>HO copy <br><br>" +
								"<input type='button' id='ok' value='ok' style='height:30px;width:60px;font-size:20px;position:relative;' ></input> </div>")
								
						$('.originalcopy').html('ORIGINAL COPY FOR PAYMENT ONLY');
						$('.drivercopy').html('Destination / Driver copy');
						$('.hocopy').html('HO Copy');
					}
					
					$('.originalcopy').show();
					$('.drivercopy').hide();
					$('.hocopy').hide();
							
					$('#original').click(function() {
						if($("#original").prop("checked")) {
							$('.originalcopy').show();
							$('.drivercopy').hide();
							$('.hocopy').hide();
						}
					});
					
					$('#driver').click(function() {
						if($("#driver").prop("checked")) {
							$('.drivercopy').show();
							$('.originalcopy').hide();
							$('.hocopy').hide();
						}
					});
					
					$('#hocopy1').click(function() {
						if($("#hocopy1").prop("checked")) {
							$('.hocopy').show();
							$('.originalcopy').hide();
							$('.drivercopy').hide();
						}
					});
					
					$('#ok').click(function() {
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					});
				});
				$('#popUpContent_355').bPopup({
				},function() {
					var _thisMod = this;
					$(this).html(("<div class='confirm' style='height:70pt;width:288pt; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='printCharges' value ='TBB' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>"));

					$("#cancelButton").click(function(){
						_thisMod.close();
					})
					
					 $("#excelButton").click(function(e) {
						 var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(document.body.innerHTML);
						 window.open(path);
						 e.preventDefault();
						 _thisMod.close();
					   });
					   
					$("[data-selector='totalAmount']").html(totalObjects.totalBookingAmount);
					$("#printCharges").click(function(){
						if ($("#printTBBAmount").is(":checked") ) {
							$("[data-total='totalBookingAmount']").html(totalObjects.totalBookingAmount);
							$("[data-selector='totalAmount']").html(totalObjects.totalBookingAmount);
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						} else {
							for(var i = 0; i < wayBillTableData.length; i++) {
								if(wayBillTableData[i].lrType == 'TBB') {
									$("[data-total='totalBookingAmount']").html(totalObjects.paidLRTotal+totalObjects.toPayLRTotal);
									$("[data-selector='totalAmount']").html(totalObjects.paidLRTotal+totalObjects.toPayLRTotal);
									$('.typeTBB').html('TBB');
								}
							}
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						}});
				});
				
				$('#popUpContent_555').bPopup({
				},function() {
					var _thisMod = this;
					$(this).html(("<div class='confirm' style='height:70px;width:350px; text-align:left; padding-top:12px;padding-right:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<div style='font-size:18px; color:DodgerBlue;height:20px'></div><table><tr><td style='text-align:left;padding-top:20px; padding-left:30px'>"
							+"<input type='button' id='view' value ='View' style='height:30px;width:80px;font-size:20px;color:DodgerBlue'></input></td>"
							+"<td style='text-align:right; padding-top:20px; padding-left:115px'><input type='button' id='print' value ='Print' style='height:30px;width:80px;font-size:20px;color:DodgerBlue;'></input></td></tr></table></div>"));
						
					$("#view").click(function(){
						_thisMod.close();
						$(document).bind("keyup keydown", function(e){
							if(e.ctrlKey || e.keyCode == 80) {
								$('.hideTotalBtc').hide();
							}
						});
					});
					$("#print").click(function(){
						$('.hideTotalBtc').hide();
						_thisMod.close();	
							setTimeout(function(){window.print();},200);
					});
				});
				
				$('#excelDownLoad_270').bPopup({
				}, function() {
					 $('.weightHide').hide()
					var _thisMod = this;
					$(this).html("<div id='popUpDiv' class='confirm' style='height:80px;width:400px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='view' value ='View' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
							
							$("#view").click(function() {
								 $('.weightHide').show();
								 _thisMod.close();
							 });
					
							$("#laserPrintButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})
					
							$("#cancelButton").click(function(){
								_thisMod.close();
							})
							
							 $("#excelButton").click(function(e) {
								 _thisMod.close();
									var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
									window.open(path);
									e.preventDefault();
								});
				});
				$('#popUpContent_597').bPopup({
							},function(){
								var _thisMod = this;
								$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button  id='cancelButton'>NO</button><button autofocus  id='confirm'>YES</button></div>");
								
								$('#confirm').focus();
								$("#confirm").click(function(){
								$('.CommissionTable').removeClass('hide');
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
								
								
								
								$("#cancelButton").click(function(){
									$('.CommissionTable').hide();
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
							});
				if(subRegionAllowedForPopup){
					$('#popUpContent_270').bPopup({
					}, function() {
						 $('.weightHide').hide();
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:80px;width:250px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
								+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"		
								+"<input type='button' id='view' value ='View' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
								+"<input type='button' id='print' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
								+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")
								
						 $("#view").click(function() {
							 $('.weightHide').show();
							 _thisMod.close();
						 });
						$("#print").click(function(){
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						})
						$("#cancelButton").click(function(){
							_thisMod.close();
						})
					});
				} else {
					/*setTimeout(function(){window.print();},200);*/
				}
				
				$('#popUpContent_588').bPopup({
							},function(){
								var _thisMod = this;
								$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button  id='cancelButton'>NO</button><button autofocus  id='confirm'>YES</button></div>");
								
								$('#confirm').focus();
								$("#confirm").click(function(){
										$('.CommissionTable').removeClass('hide');
										var tdElement = $('td[data-dataTableDetail="crossingCommission"]');
										 tdElement.show();								

									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
								
								$("#cancelButton").click(function(){
									$('.CommissionTable').hide();
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
							});
							
				$('#popUpForPrintMlt').bPopup({
					},function(){
					var _thisMod = this;
					$(this).html("<div class='confirm'><h1>Do You Want New LS Print? </h1><p>Shortcut Keys : Enter = Yes </p><button  id='cancelButton'>NO</button><button autofocus  id='confirm'>YES</button></div>");
					
					$('#confirm').focus();
					$("#confirm").click(function(){
						  $("#logo").remove();
						  $('.hideNewLSData').hide();
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					})
					$("#confirm").on('keydown', function(e) {
						if (e.which == 13) {  //enter
							$('.showNewLSPrint').show();
							 $("#logo").remove();
							  $('.hideNewLSData').hide();
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						}
					});
					$("#cancelButton").click(function(){
							$('.showNewLSPrint').hide();
							$("#logo").show();
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						
					});
				});
						
						
				let paidMinusAmount = 	PaidTopayTBBtotalAmount - totalAmountForPAID 
				 $('#popupForPrintPaidAmount').bPopup({
					 // for jstc 995 
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:150px;width:250px; text-align: left; padding:15px'>"
								+"<b style='font-size:18px; color:DodgerBlue;'>Print Charges</b><br/><br/>"		
								+"<input type='checkbox' checked id='printPaidAmount'  name='print' >&nbsp;<b style='font-size:14px;'>PRINT PAID AMOUNT</b><br/><br/>"
								+"<button id='cancelButton'>CANCEL</button></center>"
								+"<button autofocus id='confirm'>YES</button></div>")


						$('#confirm').focus();
						
						$("#cancelButton").click(function() {
							_thisMod.close();
							setTimeout(function() { window.print(); }, 200);
						});
						
						$("#confirm").click(function() {
							if($('#printPaidAmount').prop("checked") == false){
									$("#dataTable tbody tr").find("[data-dataTableDetail='amount']").html(paidMinusAmount);
									$('.paidLrCell').html('')
								    $("[data-summarytotal='totalAmount']").html(paidMinusAmount);

							}
								_thisMod.close();
							setTimeout(function() { window.print(); }, 200);
						});
						
					});
					
		
		
			} else if(!$('.openPrintWindow').length) {
				setTimeout(function(){window.print();},200);
			}
			
			
			totalArticleQtyForPAID				= 0;
			totalArticleQtyForTOPAY				= 0;
			totalArticleQtyForFOC				= 0;
			totalArticleQtyForCREDIT			= 0;
			totalFreightForPAID					= 0;
			totalFreightForTOPAY				= 0;
			totalFreightForCREDIT				= 0;
			totalLoadingForPAID					= 0;
			totalLoadingForTOPAY				= 0;
			totalServiceTaxForTOPAY				= 0;
			totalLoadingForCREDIT				= 0;
			totalAmountForPAID					= 0;
			totalAmountForTOPAY					= 0;
			totalAmountForCREDIT				= 0;
			totalOtherAmountForPAID				= 0;
			totalOtherAmountForTOPAY			= 0;
			totalOtherAmountForCREDIT			= 0;
			totalFOVAmountForPAID				= 0;
			totalFOVAmountForTOPAY				= 0;
			totalFOVAmountForCREDIT				= 0;
			totalStationaryAmountForPAID		= 0;
			totalStationaryAmountForTOPAY		= 0;
			totalStationaryAmountForCREDIT		= 0;
			totalHamaliAmountForPAID			= 0;
			totalHamaliAmountForTOPAY			= 0;
			totalHamaliAmountForCREDIT			= 0;
			totalTollAmountForPAID				= 0;
			totalTollAmountForTOPAY				= 0;
			totalTollAmountForCREDIT			= 0;
			totalDoorCollectionAmountForPAID	= 0;
			totalDoorCollectionAmountForTOPAY	= 0;
			totalDoorCollectionAmountForCREDIT	= 0;
			totalDoorDeliveryAmountForPAID		= 0;
			totalDoorDeliveryAmountForTOPAY		= 0;
			totalDoorDeliveryAmountForCREDIT	= 0;
			totalSmsAmountForPAID				= 0;
			totalSmsAmountForTOPAY				= 0;
			totalSmsAmountForCREDIT				= 0;
			consignmentPackingDetails			= 0;
			consignmentPackingDetails1			= 0;
			consignmentPackingDetails2			= 0;
			freightCharge						= 0;
			loadingCharge						= 0;
			pickupCharge						= 0;
			toPayHmali							= 0;
			lrCharge							= 0;
			pfCharge							= 0;
			tempoBhadaBooking					= 0;
			crossingHire						= 0;
			amount								= 0;
			amountWithoutTbb					= 0;
			fov									= 0;
			other								= 0;
			stationaryCharge					= 0;
			hamaliCharge						= 0;
			srsHamaliCharge						= 0;
			tollCharge							= 0;
			doorCollectionCharge				= 0;
			doorDeliveryCharge					= 0;
			smsCharge							= 0;
			toPayFreight						= 0;
			paidFreight							= 0;
			tbbFright							= 0;
			partyTINNo							= 0;
			wayBillDocCharge					= 0;
			wayBillInsurance					= 0;
			lrCharge							= 0;
			totalLrChargeAmountForPAID			= 0;
			totalLrChargeAmountForTOPAY			= 0;
			totalLrChargeAmountForCREDIT		= 0;
			totalCrossingChargeAmountForPAID	= 0;
			totalCrossingChargeAmountForTOPAY	= 0;
			totalCrossingChargeAmountForCREDIT	= 0;
			totalPickupChargeAmountForPAID		= 0;
			totalPickupChargeAmountForTOPAY		= 0;
			totalPickupChargeAmountForCREDIT	= 0;
			unloadingAmount						= 0;
			otherCharge							= 0;
			doorDeliveryCharge					= 0;
			totalKantAmt						= 0;
			totalDCChargeAmountForPAID			= 0;
			totalDCChargeAmountForTOPAY			= 0;
			totalDCChargeAmountForCREDIT		= 0;
			totalDDChargeAmountForPAID			= 0;
			totalDDChargeAmountForTOPAY			= 0;
			totalDDChargeAmountForCREDIT		= 0;
			totalDBCChargeAmountForPAID			= 0;
			totalDBCChargeAmountForTOPAY		= 0;
			totalDBCChargeAmountForCREDIT		= 0;
			totalDDCChargeAmountForPAID			= 0;
			totalDDCChargeAmountForTOPAY		= 0;
			totalDDCChargeAmountForCREDIT		= 0;
			wayBillBuiltyAmount					= 0;
			
		}, removeSelectedTableColumn : function(removeAmount) {
			if(removeAmount) {
				var target	= $('#dataTable').find('th[data-selector="amountLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();

				var target	= $('#summaryTable').find('th[data-selector="totalAmountLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
		}, removeChargesColumn : function(response) {
				var flavorConfiguration					= response.FlavorConfiguration;	
				
				if(flavorConfiguration.branchIdsToShowChargesColumn != response.dispatchLSPrintModel.dispatchLSSourceBranchId){
					var target	= $('#dataTable').find('th[data-selector="freight"]');
					var index	= (target).index();
					$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
					
					var target	= $('#dataTable').find('th[data-selector="stationary"]');
					var index	= (target).index();
					$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
					
					var target	= $('#dataTable').find('th[data-selector="hamali"]');
					var index	= (target).index();
					$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
										
					var target	= $('#summaryTable').find('th[data-selector="totalFreightLabel"]');
					var index	= (target).index();
					$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
					
					var target	= $('#summaryTable').find('th[data-selector="totalStationaryLabel"]');
					var index	= (target).index();
					$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
					
					var target	= $('#summaryTable').find('th[data-selector="totalHamaliLabel"]');
					var index	= (target).index();
					$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				}
		}, setPageWiseTotals : function(response) {
			var flavorConfiguration					= response.FlavorConfiguration;
			
			
			var totalObject	= new Object();
			totalObject.srNumber			= srNumber
			totalObject.lrNumber			= lrNumber
			totalObject.lrSourceBranch		= lrSourceBranch
			totalObject.lrDestinationBranch	= lrDestinationBranch
			totalObject.consignor			= consignor
			totalObject.consignorFullName	= consignor
			totalObject.consignee			= consignee
			totalObject.consigneeFullName	= consignee
			totalObject.consigneeNameWithMob = consigneeNameWithMob
			totalObject.consigneeContact	= consigneeContact
			totalObject.lrType				= lrType
			totalObject.bookingDate			= bookingDate
			totalObject.otherChargeOPs		= otherChargeOPs
			totalObject.totalArticle		= totalArticle
			totalObject.consignmentPackingDetails	= consignmentPackingDetails
			totalObject.consignmentPackingDetails1	= consignmentPackingDetails1
			totalObject.consignmentPackingDetails2	= consignmentPackingDetails2
			totalObject.paidFreightCharge			= paidFreight
			totalObject.toPayFreightCharge			= toPayFreight
			totalObject.fullToPayFreightCharge		= fullToPayFreight
			totalObject.totalAmountForGTM		= paidAndToPayTotalForGTM
			totalObject.tbbFreightCharge		= tbbFright
			totalObject.freightCharge			= freightCharge
			if(showTbbForGroupAdmin){
				totalObject.freightChargeForsmdtcl			= totalFreightForTOPAY + totalFreightForPAID + totalFreightForCREDIT;
			}else{
				totalObject.freightChargeForsmdtcl			= totalFreightForTOPAY + totalFreightForPAID 
			}
			totalObject.loadingCharge			= loadingCharge
			totalObject.loadingChargeRT			= loadingChargeRT
			totalObject.loadingChargeformls		= loadingChargeformls
			totalObject.amount					= amount
			if(flavorConfiguration.totalWeightForNml)
				totalObject.actualWeight		= actualWeight - (5 * totalArticle);
			else
				totalObject.actualWeight		= actualWeight;
			totalObject.chargeWeight			= chargeWeight
			totalObject.wayBillDocCharge		= wayBillDocCharge;
			totalObject.wayBillInsurance		= wayBillInsurance;
			totalObject.serviceTax				= serviceTax;
			totalObject.crossingHireAmt			= crossingHireAmt;
			totalObject.payableAmount			= payableAmount;
			totalObject.receivableAmount		= receivableAmount;
			totalObject.declaredValue			= declaredValue;
			totalObject.amountWithoutTbb		= totalAmountForTOPAY + totalAmountForPAID;
			totalObject.paidAmount				= paidAmount;
			totalObject.topayAmount				= topayAmount;
			totalObject.unloadingAmount			= unloadingAmount;
			totalObject.DocketAmount			= DocketAmount;
			totalObject.doorDeliveryCharge		= doorDeliveryCharge;
			totalObject.doorPickupCharge		= doorPickupCharge;
			totalObject.artCharge				= artCharge;
			totalObject.pickupCharge			= pickupCharge
			totalObject.toPayHmali				= toPayHmali
			totalObject.lrCharge				= lrCharge
			totalObject.pfCharge				= pfCharge
			totalObject.tempoBhadaBooking		= tempoBhadaBooking
			totalObject.crossingHire			= crossingHire
			totalObject.otherCharge				= otherCharge;
			totalObject.lc						= lc;
			totalObject.csCharge				= csCharge;
			totalObject.hamaliCharge			= hamaliCharge;
			totalObject.ddCharge				= ddCharge;
			totalObject.srsHamaliCharge			= srsHamaliCharge;
			totalObject.otherChargeForKavi		= otherChargeForKavi;
			totalObject.PaidFreightChargeWithDD		= paidFreightChargeWithDD;
			totalObject.toPayFreightChargeWithDD	= toPayFreightChargeWithDD;
			totalObject.TbbFreightChargeWithDD		= tbbFreightChargeWithDD;
			totalObject.cartageAmount		= cartageAmount;
			totalObject.CodAmount			= CodAmount;
			totalObject.wayBillCodVppAmount	= wayBillCodVppAmount;
			totalObject.tbbAmount				= tbbAmount;
			totalObject.wayBillBuiltyAmount				= wayBillBuiltyAmount;
			totalObject.totalWithoutHamali				= totalWithoutHamali;
			totalObject.topayHamali						= topayHamali;
			totalObject.stationaryCharge				= stationaryCharge;
			totalObject.crossingHamali			=response.totalCrossingHamali;
			totalObject.cartageAmountForToPay = totalCartageAmountForTOPAY;
			totalObject.hamaliChargeForToPay = totalHamaliAmountForTOPAY;
			totalObject.otherChargeForToPay = totalOtherAmountForTOPAY;
			totalObject.Crossingcharge		=crossingCharge
			totalObject.handlingCharge		= handlingCharge;
			totalObject.doorCollectionCharge			= doorCollectionCharge;
			

			if(flavorConfiguration.replacePaidAmountWithZero)
				totalObject.amount			= totalAmountForTOPAY + totalAmountForCREDIT;
			
			if(flavorConfiguration.replaceTbbAmountWithZero || flavorConfiguration.replaceTbbAmountWithBlank) {
					totalObject.amount			= totalAmountForTOPAY + totalAmountForPAID;		
			}
			 
			if(flavorConfiguration.replacePaidChargesWithZero){
				totalObject.freightCharge			= totalFreightForTOPAY + totalFreightForCREDIT;
							totalObject.loadingCharge			= totalLoadingForTOPAY + totalLoadingForCREDIT;
}
									
			if(flavorConfiguration.replaceAmountWithZero)
				totalObject.amount			= totalAmountForTOPAY;
			
			if( flavorConfiguration.replaceCrossingHireAmountWithZero)
				totalObject.crossingHireAmt			= totalcrossingHireAmtTopay;
			
			if(flavorConfiguration.replacePaidAndTBBAmountWithBlank)
				totalObject.paidFreightCharge		= paidFreight
			
			if(flavorConfiguration.replaceTbbAmountWithLrType)
				totalObject.amount		= totalAmountForTOPAY + totalAmountForPAID;
				
			if(flavorConfiguration.replacePaidAmountWithPAID && flavorConfiguration.replaceTbbAmountWithBlank)
				totalObject.amount		=totalAmountForTOPAY
			
			if(flavorConfiguration.replacePaidAmountWithPAID)
				totalObject.amount		=totalAmountForTOPAY + totalAmountForCREDIT
							
				
			if(totalObject.pfCharge == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.pfCharge		= " "
			
			if(totalObject.cartageAmount == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.cartageAmount		= " "
			
			if(totalObject.crossingHamali == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.crossingHamali		= " "
						
			if(totalObject.doorDeliveryCharge == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.doorDeliveryCharge		= " "
			
			if(totalObject.topayAmount == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.topayAmount		= " "
			
			if(totalObject.paidAmount == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				totalObject.paidAmount		= " "
				
			totalObject.amountWithType = totalObject.amount
			
			var tbody = $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			var newtr = $("<tr></tr>");
			
			for(var j = 0; j < columnObjectForDataTableDetails.length; j++) {
				var newtd = $("<td></td>");
				var dataPicker = $(columnObjectForDataTableDetails[j]).attr("data-dataTableDetail");
				$(newtd).attr("class", $(columnObjectForDataTableDetails[j]).attr("class"));
				$(newtd).removeClass("infoStyle")
				$(newtd).addClass("tableHeader")
				$(newtd).addClass("bold")
				$(newtd).addClass("centerAlign")
				$(newtd).attr("data-dataTableDetail", $(columnObjectForDataTableDetails[j]).attr("data-dataTableDetail"));
				$(newtd).html(totalObject[dataPicker]);
				$(newtr).append($(newtd));
			}
			
			$(tbody).append(newtr);
			consignmentPackingDetails	= 0;
			consignmentPackingDetails1	= 0;
			consignmentPackingDetails2	= 0;
			paidFreight					= 0; 
			toPayFreight				= 0;
			tbbFright					= 0;
			freightCharge				= 0;
			loadingCharge				= 0;
			loadingChargeRT				= 0;
			loadingChargeformls			= 0;
			amount						= 0;
			amountWithoutTbb			= 0;
			fov							= 0;
			other						= 0;
			actualWeight				= 0;
			chargeWeight				= 0;
			partyTINNo					= 0;
			wayBillDocCharge			= 0;
			crossingHireAmt				= 0;
			payableAmount				= 0;
			receivableAmount			= 0;
			declaredValue				= 0.0;
			otherChargeForKavi			= 0;
			toPayFreightChargeWithDD	= 0;
			paidFreightChargeWithDD		= 0;
			tbbFreightChargeWithDD		= 0;
			wayBillBuiltyAmount			= 0;
			pfCharge					= 0;
			tempoBhadaBooking			= 0;
			crossingHire				= 0;
			totalWithoutHamali			= 0;
			pickupCharge				= 0;
			toPayHmali					= 0;
			lrCharge					= 0;
			topayHamali					= 0;
			stationaryCharge			= 0;
			totalCrossingHamali            = 0;
			cartageAmountForToPay            = 0;
			hamaliChargeForToPay            = 0;
			otherChargeForToPay            = 0;
						
			
		}, setCommissionTable : function(lhpvChargeData, lsData, flavorConfiguration) {
			let totalTopayPaidFreight		= totalFreightForPAID + totalFreightForTOPAY;
			let totalFreight				= totalFreightForPAID + totalFreightForTOPAY + totalFreightForCREDIT;
			let totalArticle				= totalArticleQtyForPAID + totalArticleQtyForTOPAY + totalArticleQtyForCREDIT;
			let totalCartageAmount			= totalCartageAmountForPAID + totalCartageAmountForTOPAY + totalCartageAmountForCREDIT;
			let totalStaticalCharge			= totalStaticalChargeForPAID + totalStaticalChargeForTOPAY + totalStaticalChargeForCREDIT;
			let totalHamaliAmount			= totalHamaliAmountForPAID + totalHamaliAmountForTOPAY + totalHamaliAmountForCREDIT;
			let totalTollGateCharge			= totalTollGateChargeForPAID + totalTollGateChargeForTOPAY + totalTollGateChargeForCREDIT;
			let totalDoorDeliveryAmount		= totalDoorDeliveryAmountForPAID + totalDoorDeliveryAmountForTOPAY + totalDoorDeliveryAmountForCREDIT;
			let totalCantonmentCharge		= totalCantonmentChargeForPAID + totalCantonmentChargeForTOPAY + totalCantonmentChargeForCREDIT;
			let totalWeightBridgeCharge		= totalWeightBridgeChargeForPAID + totalWeightBridgeChargeForTOPAY + totalWeightBridgeChargeForCREDIT;
			let totalHandlingCharge			= totalHandlingChargeForPAID + totalHandlingChargeForTOPAY + totalHandlingChargeForCREDIT;
			let totalPaidTopayAmount		= totalAmountForPAID + totalAmountForTOPAY;
			let commision					= totalTopayPaidFreight * 30 / 100;
			let totalPaidFreightPlusTopayAmt= totalFreightForPAID + totalAmountForTOPAY;
			let totalCrossingcharge			= totalCrossingChargeAmountForPAID + totalCrossingChargeAmountForTOPAY + totalCrossingChargeAmountForCREDIT;
			let totalPaidTopayTBBAmount		= totalAmountForPAID + totalAmountForTOPAY + totalAmountForCREDIT;
			let totalBookingAmtPaidTopayTBB	= totalBookingTotalForPAID + totalBookingTotalForTOPAY + totalBookingTotalForCREDIT;
			let totalDDC					= totalDDCChargeAmountForPAID + totalDDCChargeAmountForTOPAY + totalDDCChargeAmountForCREDIT
			let totalDBC					= totalDBCChargeAmountForPAID + totalDBCChargeAmountForTOPAY + totalDBCChargeAmountForCREDIT
			let commPerSres					= Math.round((10 * totalFreight) / 100)
			let netPaySres					= commPerSres + totalDDC;
			let toPayminusNetPaySRES		= totalAmountForTOPAY - netPaySres;
			
			let commissionHanumann			= totalPaidTopayTBBAmount - totalDoorDeliveryAmount
			let commPerHanumann				= Math.round((10 * commissionHanumann) / 100)
			let netPayHanumann				= commPerHanumann + totalDoorDeliveryAmount;
			let toPayminusNetPayHanumann	= totalAmountForTOPAY - netPayHanumann;
			let totalCommission				= totalCommissionOnPaidFreight + totalCommissionOnToPayFreight + totalCommissionOnTBBFreight;

			$("[data-commissionLabel='total']").html('Total');
			$("[data-commission='total']").html(totalTopayPaidFreight);
			$("[data-commission_acc_citylink='total']").html(totalPaidFreightPlusTopayAmt + totalFreightForCREDIT - totalCartageAmount);
			$("[data-commission30Label='commission']").html('Commission');
			$("[data-commission30='commission']").html(commision);
			$("[data-commission30='RDPS_DDC']").html(DDC);
			$("[data-commission30='RDPS_Commission']").html(newDeliveryCommission);
			
			$("[data-commission30='lsExpense']").html("- "+lsData.lsExpense);
			$("[data-commission_acc_citylink='commission']").html(bookingCommission);
			$("[data-commissionGrandTotalLabel='grandTotal']").html('Grand&nbsp;Total');
			$("[data-commission_acc_citylink='grandTotal']").html(totalPaidFreightPlusTopayAmt + totalFreightForCREDIT - totalCartageAmount - bookingCommission);
			$("[data-commissionGrandTotal='grandTotal']").html(totalTopayPaidFreight - commision);
			$("[data-commissionToPayLabel='toPay']").html('To&nbsp;Pay&nbsp;Amount');
			$("[data-commissionToPay='toPay']").html(totalFreightForTOPAY);
			$("[data-commissionToPay='PaidtoPay']").html(totalTopayPaidFreight);
			$("[data-commission30='VPT_Commission']").html(totalTopayPaidFreight * deliveryCommissionRate / 100);
			$("[data-balanceVpt='balance']").html(totalAmountForTOPAY -	 $("[data-commission30='VPT_Commission']").html());
			
			if (lsData.crossingAgentId > 0)
				$("#commission-details").show();
				
			$("[data-commission='total_commission']").html(lsData.commission);
			$("[data-commission='net_amount_withpaidtopay']").html(totalTopayPaidFreight - lsData.commission);
			
			$("[data-commissionBalanceLabel='balance']").html('Balance');
			$("[data-commissionBalance='balance']").html(((totalTopayPaidFreight - commision) - totalFreightForTOPAY).toFixed(2));
			$("[data-commissionBalance='RDPS_balance']").html(totalAmountForTOPAY - newDeliveryCommission);
			$("[data-commissionDetails='commision30Table']").show();
			
			$("[data-commissionToPay='paid']").html(totalFreightForPAID);
			$("[data-commissionToPay='paidAmt']").html(totalAmountForPAID);
			$("[data-commission='totalLoadingForTOPAY']").html(totalLoadingForTOPAY);
			$("[data-commission='totalCartegAmount']").html(totalCartageAmount);
			$("[data-commission_AT_Freight='total']").html((totalFreightForPAID + totalFreightForCREDIT));
			$("[data-commission_Total_AT_Freight='total']").html(totalFreight);
			$("[data-commission='totalCrossingcharge']").html(totalCrossingcharge);
			$("[data-commission='paidTopayFright']").html(totalTopayPaidFreight);
			
			let at_total	= totalFreight - bookingCommission - totalCartageAmount -totalCrossingcharge;
			
			$("[data-commission='AT_total']").html(at_total);
			$("[data-commissionBalance='AT_balance']").html(at_total - totalFreightForTOPAY);
			
			$("[data-commission='totalDeliveryCommission']").html(deliveryCommission);
			$("[data-commission='freightWithoutCommission']").html(totalFreight - deliveryCommission);
			$("[data-commission='totalST']").html(totalPaidTopayAmount);
			$("[data-commissionToPay='toPayST']").html(totalAmountForTOPAY);
			$("[data-commission='totalPaidAmount']").html(totalFreightForPAID);
			$("[data-commission='totalToPayAmount']").html(totalAmountForTOPAY);
			$("[data-commission='totalKtc']").html(totalPaidFreightPlusTopayAmt);
			$("[data-commission30='totalPaidTopayTBBAmount']").html(totalPaidTopayTBBAmount);
			$("[data-commission30='totalBookingAmtPaidTopayTBB']").html(totalBookingAmtPaidTopayTBB);
			$("[data-commission30='DBC']").html(totalDBC);
			$("[data-commission30='DDC']").html(totalDDC);
			$("[data-commission30='SRES']").html(totalFreight);
			$("[data-commission30='commPerSres']").html(commPerSres);
			$("[data-commission30='netPaySres']").html(netPaySres);
			$("[data-commission30='toPayminusNetPaySRES']").html(toPayminusNetPaySRES);
			$("[data-commission30='Hanumann']").html(commissionHanumann);
			$("[data-commission30='commPerHanumann']").html(commPerHanumann);
			$("[data-commission30='netPayHanumann']").html(netPayHanumann);
			$("[data-commission30='toPayminusNetPayHanumann']").html(toPayminusNetPayHanumann);
			
			if(flavorConfiguration.calculateDeliveryCommissionOnPaidTopayLR) {
				totalCommission		= totalCommissionOnPaidFreight + totalCommissionOnToPayFreight;
				$("[data-commission='paidTopayTbbFright']").html(totalTopayPaidFreight);
				$('#paidTopayTbbFrightLabel').html('Basic Freight(Paid/Topay)');
				$('#commissionFromBranchCommissionMasterLabel').html("Com. Amount(Excluding TBB LR's)");
			} else {
				$("[data-commission='paidTopayTbbFright']").html(totalFreight);
				$('#paidTopayTbbFrightLabel').html('Basic Freight(Paid/Topay/TBB)');
				$('#commissionFromBranchCommissionMasterLabel').html('Com. Amount');
				$('#totalBookingWithoutTbb').remove();
			}

			let agentTotal					= totalCommission + totalDoorDeliveryAmount;
			let netPayBranchCommi			= totalAmountForTOPAY - agentTotal;
			
			$("[data-commission='commissionFromBranchCommissionMaster']").html(totalCommission);
			$("[data-commission='netPayBranchCommi']").html(netPayBranchCommi);
			$("[data-commission='totalDDC']").html(totalDoorDeliveryAmount);
			$("[data-commission='agentTotal']").html(agentTotal);
			$("[data-commission='netPayVPT']").html(netPayBranchCommi);
			
			let totalVehicleCommission	= totalPaidTopayAmount * vehicleCommission / 100;
			let stcommission			= totalPaidTopayAmount - Math.round(totalVehicleCommission);
			
			$("[data-commissionST='commission']").html(Math.round(totalVehicleCommission));
			$("[data-commissionGrandTotalST='commission']").html(stcommission);
			$("[data-commissionBalanceST='balance']").html(stcommission - totalAmountForTOPAY);
			
			if(lsData.lsExpense <= 0)
				$('.lsExpense').hide();
			
			if(toPayminusNetPaySRES < 0)
				$('.agent').hide();
			else
				$('.office').hide();
				
			if (toPayminusNetPayHanumann < 0)
				$('.HanumannAgent').hide();
			else
				$('.HanumannOffice').hide();
	
			if(netPayBranchCommi < 0)
				$('.agentAmount').hide();
			else
				$('.officeAmount').hide();
			
			$("[data-commissionToPay='toPay_default']").html("- " + totalAmountForTOPAY);
			$("[data-commission30Label='commission_default']").html('Commission (' + lsData.commission + "%)");
			$("[data-commissionBalanceLabel_NSTC='balance']").html('NET PAY/Company Due');
			$("[data-commission30='stl_total']").html(totalFreight);
		
			commissionPecentage = lsData.commissionPecentage;
		
			let grandTotal_default	= 0;
			let balance				= 0;
			let stlBalance			= 0;
			let balanceSaidisha  	= 0;
		
			if(commissionPecentage) {
				let default_Commission	= (totalTopayPaidFreight - lsData.lsExpense) * lsData.commission / 100;
				let commissionOnFreight	= totalFreight * lsData.commission / 100;
				let commissionKtc		= totalPaidFreightPlusTopayAmt * lsData.commission / 100;
				let netAmount			= totalPaidFreightPlusTopayAmt - commissionKtc;
				let toPayCharges		= totalAmountForTOPAY - totalFreightForTOPAY;
				let amount				= netAmount - toPayCharges;
				let lessTopay			= amount - totalAmountForTOPAY;
				let commissionPercent 	= lsData.commission * 100 / totalFreight
				$("[data-commission30Label='commission_saidisha']").html('Commission (' + commissionPercent.toFixed() + "%) (-)");
				$("[data-commissionGrandTotal='grandTotal_saidisha']").html(totalFreight - lsData.commission);

				$("[data-commission30Label='commission_stl']").html('Commission (' + lsData.commission + "%) (-)");
				$("[data-commission30='default_Commission']").html("- " + default_Commission);
				$("[data-commission30='stl_Commission']").html(commissionOnFreight);
				$("[data-commission30='saidisha_Commission']").html(lsData.commission);
				$("[data-commission30='stl_finalAmt']").html(commissionOnFreight + totalLrChargeAmountForPAID + totalLrChargeAmountForTOPAY + totalLrChargeAmountForCREDIT + totalServiceCharge - totalFreightForPAID);
				$("[data-commission30='ktc_Commission']").html(commissionKtc);
				$("[data-commission30='ktc_netAmount']").html(netAmount);
				$("[data-commission30='ktc_toPayCharges']").html(toPayCharges);
				$("[data-commission30='ktc_amount']").html(amount);
				$("[data-commission30='ktc_lessTopay']").html(totalAmountForTOPAY);

				$("[data-commission30='stl_CommissionLR']").html(Math.round(commissionOnFreight / numberOfLr));

				grandTotal_default	= totalTopayPaidFreight - default_Commission;
				
				$("[data-commissionGrandTotal='grandTotal_default']").html(grandTotal_default - lsData.lsExpense);
				$("[data-commissionBalance='balance_default']").html(grandTotal_default - lsData.lsExpense - totalAmountForTOPAY);
				$("[data-commissionGrandTotal='grandTotal_stl1']").html(totalFreight - commissionOnFreight);
				$("[data-commissionTotal='total_STL']").html(totalPaidTopayTBBAmount);
			
				balance		= totalFreight - commissionOnFreight - totalAmountForTOPAY;
				stlBalance	= totalFreight - commissionOnFreight  - (totalAmountForTOPAY - totalPickupChargeAmountForTOPAY - totalDoorDeliveryAmountForTOPAY - totalCrossingChargeAmountForTOPAY);
				balanceSaidisha = totalFreight - lsData.commission - totalAmountForTOPAY;
				
				$("[data-commissionLessToPay='lessTopay_ktc']").html(Math.round(lessTopay));

				if(lessTopay >= 0)
					$("[data-commissionKTCLable='ktcLable']").html('Office To Bus');
				else
					$("[data-commissionKTCLable='ktcLable']").html('Bus to Office');
			} else {
				grandTotal_default	= totalTopayPaidFreight - lsData.commission - lsData.lsExpense;
				$("[data-commission30Label='commission_stl']").html('Commission (' + lsData.commission + ") (-)");
				$("[data-commission30='default_Commission']").html("- " + lsData.commission);
				$("[data-commission30='stl_Commission']").html((lsData.commission));
				$("[data-commission30='stl_finalAmt']").html(lsData.commission + totalLrChargeAmountForPAID + totalLrChargeAmountForTOPAY + totalLrChargeAmountForCREDIT + totalServiceCharge - totalFreightForPAID);
				$("[data-commissionGrandTotal='grandTotal_default']").html(grandTotal_default);
				$("[data-commissionBalance='balance_default']").html(grandTotal_default - totalAmountForTOPAY);
				$("[data-commissionGrandTotal='grandTotal_stl1']").html(totalFreight - lsData.commission);
				$("[data-commission30='ktc_Commission']").html(lsData.commission);
				$("[data-commission30='stl_CommissionLR']").html(lsData.commission);
				
				balance		= totalFreight - lsData.commission - totalAmountForTOPAY;
				stlBalance	= totalFreight - lsData.commission - (totalAmountForTOPAY - totalPickupChargeAmountForTOPAY - totalDoorDeliveryAmountForTOPAY - totalCrossingChargeAmountForTOPAY);
			}
				
			$("[data-commissionToPay='stl_toPay']").html(totalAmountForTOPAY - totalPickupChargeAmountForTOPAY - totalDoorDeliveryAmountForTOPAY - totalCrossingChargeAmountForTOPAY);
			$("[data-commissionBalance='stl_balance']").html(stlBalance);
			
			$("[data-commissionToPay='toPay_stl']").html(totalAmountForTOPAY)
			$("[data-commissionBalance='balance_STL']").html(balance);
			$("[data-commissionBalance='balanceSaidisha']").html(balanceSaidisha);
						
			if(balance > 0 ) {
				$('#checkBoxForNetPay').removeClass('hide');
				$('#checkBoxForCompanyDue').addClass('hide');	
			} else {
				$('#checkBoxForNetPay').addClass('hide');
				$('#checkBoxForCompanyDue').removeClass('hide');
			}
		
			if(stlBalance > 0) {
				$('#checkBoxForNetPayStl').removeClass('hide');
				$('#checkBoxForCompanyDueStl').addClass('hide');	
			} else {
				$('#checkBoxForNetPayStl').addClass('hide');
				$('#checkBoxForCompanyDueStl').removeClass('hide');
			}
			
			let freightAmtWitoutCommission	= totalFreight - deliveryCommission;
			let	amount						= (totalAmountForTOPAY - deliveryCommission)
			
			if(amount > 0) {
				$(".negative").hide();
				$(".positive").show();
			} else if(amount == 0){
				$(".negative").hide();
				$(".positive").hide();
			} else {
				$(".negative").show();
				$(".positive").hide();
			}
				
			$("[data-commission='grandTotal']").html(freightAmtWitoutCommission + totalStaticalCharge + totalCartageAmount + totalHamaliAmount + totalTollGateCharge + totalDoorDeliveryAmount + totalCantonmentCharge + totalWeightBridgeCharge + totalHandlingCharge);
			
			let commissionwithToPayLoading	= (commision + totalLoadingForTOPAY);
			let totalrecovery				= (commissionwithToPayLoading - totalFreightForPAID);
			
			$("[data-commission='commissionwithToPayLoading']").html(commissionwithToPayLoading);
			$("[data-commission='totalrecovery']").html(totalrecovery);
			$("[data-commissionTotalToPay='toPay']").html(totalAmountForTOPAY);
			$("[data-commission='commission']").html(newBookingCommission);
			$("[data-commission='deliveryCommissionOnTopay']").html(deliveryCommissionOnToPay);
			$("[data-commissionGrandTotal='subTotal']").html(totalAmountForTOPAY - newBookingCommission)
			$("[data-commissionGrandTotal='newGrandTotal']").html(totalAmountForTOPAY - newBookingCommission - lhpvChargeData.lorryHireBalance);
			
			let balanceNtcp = totalAmountForTOPAY - (deliveryCommissionOnToPay + totalDoorDeliveryAmount + 3 * totalArticle);
			
			$("[data-perArticleRs='perArticleRs']").html(3 * totalArticle);
			$("[data-doorDeliveryCharge='doorDelivery']").html(totalDoorDeliveryAmount);
			$("[data-commissionNTCP='commission']").html(deliveryCommissionOnToPay + totalDoorDeliveryAmount + 3 * totalArticle);
			$("[data-commissionNTCP='balance']").html(balanceNtcp);
			
			if(balanceNtcp > 0)
				$("[data-NTCPAmountGivenTo='givenTo']").html('Agent Given to Newaskar Transport');
			else
				$("[data-NTCPAmountGivenTo='givenTo']").html('Newaskar Transport given to Agent');
		}, removeTableColumn : function(response, isPrivateMarkExists, crossingAgentId, executive) {
			var flavorConfiguration					= response.FlavorConfiguration;
			
			if (!flavorConfiguration.showSeparateColumnForPaidAmount) {
				var target	= $('#dataTable').find('th[data-selector="paidFreightChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showSeparateColumnForToPayAmount) {
				var target	= $('#dataTable').find('th[data-selector="toPayFreightChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showSeparateColumnForTBBAmount) {
				var target	= $('#dataTable').find('th[data-selector="tbbFreightChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeFreightColumn) {
				var target	= $('#dataTable').find('th[data-selector="freightChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				
			}
			
			if(!isPrivateMarkExists) {
				var target	= $('#dataTable').find('th[data-selector="privateMark"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if(crossingAgentId <= 0 && flavorConfiguration.replaceCrossingHireAmountWithZero) {
				var target	= $('#dataTable').find('th[data-selector="amountLabel1"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				
				var target	= $('#dataTable').find('th[data-selector="crossingChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeSummaryFreightColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalFreightLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeLoadingColumn) {
				var target	= $('#dataTable').find('th[data-selector="loadingChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeSummaryLoadingColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalLoadingLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeAmountColumn) {
				var target	= $('#dataTable').find('th[data-selector="amountLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				
				var target	= $('#summaryTable').find('th[data-selector="totalAmountLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeFOVColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalFOVLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeOtherColumn) {
				var target	= $('#dataTable').find('th[data-selector="otherChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				
				var target	= $('#summaryTable').find('th[data-selector="totalOtherLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.removeConsigneePhoneNumberColumn) {
				var target	= $('#dataTable').find('th[data-selector="consigneeContactLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showSourceBranchColumn) {
				var target	= $('#dataTable').find('th[data-selector="lrSourceBranchLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showDestinationBranchColumn) {
				var target	= $('#dataTable').find('th[data-selector="lrDestinationBranchLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showStationaryChargeColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalStationaryLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showHamaliChargeColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalHamaliLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showTollChargeColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalTollLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showDoorCollectionColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalDoorCollectionLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showDoorDeliveryColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalDoorDeliveryLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showSmsChargeColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalSmsLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.hideLrTypeColumn) {
				var target	= $('#dataTable').find('th[data-selector="lrTypeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (flavorConfiguration.hideSrNoColumn) {
				var target	= $('#dataTable').find('th[data-selector="srNumberLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}

			if (flavorConfiguration.hideLrChargeColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalLrChargeLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}	

			if (flavorConfiguration.showPickUpColumn) {
				var target	= $('#dataTable').find('th[data-selector="totalPickupChargeLabel"]');
				var index	= (target).index();
				$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showPaidHamaliColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalPaidHamaliLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (!flavorConfiguration.showServiceAmountColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalServiceTaxLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
			
			if (executive.accountGroupId == 465) {
				if (!flavorConfiguration.showToPayAndPaidHamali) {
					var target	= $('#dataTable').find('th[data-selector="paidHamaliLabel"]');
					var index	= (target).index();
					$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();

					target	= $('#dataTable').find('th[data-selector="toPayHamaliCharge"]');
					index	= (target).index();
					$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
				}
			}
			
			if(flavorConfiguration.removeSummaryUnLoadingColumn) {
				var target	= $('#summaryTable').find('th[data-selector="totalUnLoadingLabel"]');
				var index	= (target).index();
				$('#summaryTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			}
		}, removeSrNoColumn : function() {
			var target	= $('#dataTable').find('th[data-selector="srNumberLabel"]');
			var index	= (target).index();
			$('#dataTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
			
			var target	= $('#dataTruckTable').find('th[data-selector="srNumberLabel"]');
			var index	= (target).index();
			$('#dataTruckTable tr').find('th:eq(' + index + '),td:eq(' + index + ')' ).remove();
		}, setTotalsToFooter : function(totalObjects, tableData, flavorConfiguration) {
			$("[data-difference='bookingCommPfCartageforMgllp']").html(totalObjects.bookingCommPfCartage);
			$("[data-total='totalActualWeight']").html(totalObjects.totalActualWeight);
			$("[data-total='totalChargedWeight']").html(totalObjects.totalChargedWeight);
			$("[data-total='totalBookingAmount']").html(totalObjects.totalBookingAmount);
			$("[data-total='totalNoOfArticles']").html(totalObjects.totalNoOfArticles);
			$("[data-total='totalActualChrageWT']").html(totalObjects.totalActualWeight + "/" + totalObjects.totalChargedWeight);
			$("[data-total='totalPayableAmount']").html(totalObjects.totalPayableAmount);
			$("[data-total='totalReceivableAmount']").html(totalObjects.totalReceivableAmount);
			$("[data-total='totalCrossingHireAmount']").html(totalObjects.totalCrossingHireAmount);
			$("[data-total='totalUnloadingAmount']").html(totalObjects.totalUnloadingAmount);
			$("[data-total='totaSksAmnt']").html(totalObjects.totaSks);
			$("[data-total='grandTotalSksAmnt']").html(totalObjects.grandTotalSksAmnt);
			$("[data-total='totalLoadingCharge']").html(totalObjects.loadingCharge);
			$("[data-total='totalFreight']").html(totalObjects.totalFreight);
			$("[data-total='totalFreightForPAID']").html(totalObjects.totalFreightForPaid)
			$("[data-total='totalFreightForTOPAY']").html(totalObjects.totalFreightForTOPAY)
			$("[data-total='totalFreightForTBB']").html(totalObjects.totalFreightForTbb)
			$("[data-total='totalFreightNew']").html(totalObjects.totalFreight);
			$("[data-total='SixPercentOftotalFreight']").html((totalObjects.totalFreight/100 * 6).toFixed(2));
			$("[data-total='totalFreightSRSTC']").html(totalObjects.totalFreight);
			$("[data-total='totalLoading']").html(totalObjects.totalLoading);
			$("[data-total='totalUnloading']").html(totalObjects.totalUnloading);
			$("[data-total='totalDoordelivery']").html(totalObjects.totalDoordelivery);
			$("[data-total='totalST']").html(totalObjects.totalST);
			$("[data-total='totalOther']").html(totalObjects.totalOther);
			$("[data-total='totalGST']").html(totalObjects.totalGST);
			$("[data-total='totalAmount']").html(totalObjects.totalBookingAmount + totalObjects.totalGST);
			$("[data-total='totalAmountDrwl']").html(totalObjects.totalBookingAmount );
			$("[data-total='totalOtherMgt']").html(totalObjects.totalOtherMgt);	
			$("[data-total='totalOtherMgt']").html(totalObjects.totalOtherMgt);	
			$("[data-total='totalCrossingChrg']").html(totalObjects.totalCrossingChrg);	
			$("[data-total='toPayLRTotal']").html(totalObjects.toPayLRTotal);	
			$("[data-total='totalPickupCharge']").html(totalObjects.totalPickup);
			$("[data-total='totalDoorcollection']").html(totalObjects.totalDoorcollection);
			$("[data-total='totalHamali']").html(totalObjects.totalHamali);
			$("[data-total='totalPaidHamali']").html(totalObjects.totalPaidHamali);
			$("[data-total='grandTotalForMcargo']").html(totalObjects.grandTotalForMcargo);
			$("[data-total='totalToPayHamali']").html(totalObjects.totalToPayHamali);
			$("[data-total='totalLrCharge']").html(totalObjects.totalLrCharge);
			$("[data-total='totalDoorPickup']").html(totalObjects.totalDoorPickup);
			$("[data-total='totalHandlingCharge']").html(totalObjects.totalHandlingCharge);
			$("[data-total='totalLc']").html(totalObjects.totalLc);
			totalServiceCharge = totalObjects.totalServiceCharge;
			$("[data-total='ServiceCharge']").html(totalServiceCharge);
			$("[data-total='totalBuiltyCharge']").html(totalObjects.totalBuiltyCharge);
			$("[data-total='freightChargeforstl']").html(totalObjects.totalFreight);
			$("[data-total='OtherChargeforstlgrp']").html(totalObjects.totalCrossingChrg + totalObjects.totalDoordelivery + totalObjects.totalPickup + totalObjects.totalOther);
			$("[data-total='grandTotalForStl']").html(totalObjects.grandTotalForMcargo);
			$("[data-total='directAmt']").html(totalObjects.totalDirectAmt);
			$("[data-total='connectingAmt']").html(totalObjects.totalConnectingAmt);
			$("[data-total='totalLrAndServiceChargeNew']").html(totalObjects.totalLrAndServiceChargeNew);
			$("[data-total='AnsaritotalFreight']").html(totalObjects.totalFreight);
			$("[data-total='totalCashRefund']").html(totalObjects.totalCashRefund);
			$("[data-total='totalStationaryCharge']").html(totalObjects.totalStationaryCharge);
			$("[data-total='totalStationary']").html(totalObjects.totalStationary);
			$("[data-total='totalAfCharge']").html(totalObjects.totalAfCharge);
			$("[data-total='totalSurCharge']").html(totalObjects.totalSurCharge);	
			$("[data-total='totalFreightOm']").html(totalObjects.totalfreightOm);	
			$("[data-total='totalDeclaredValue']").html(totalObjects.totalDeclaredValue);
			$("[data-total='totalCommSres']").html(totalObjects.totalCommSres);
			$("[data-total='totalDDCCharge']").html(totalObjects.totalDDCCharge);		
			$("[data-total='totalSrsHamaliCharge']").html(totalObjects.totalSrsHamaliCharge);
			$("[data-total='totalLoadedArticle']").html(totalObjects.totalLoadedArticle);
			$("[data-total='collectFromDriverAmt']").html(totalObjects.collectFromDriverAmt);
			$("[data-total='netUnloading']").html(totalObjects.crossingNetUnloading);
			$("[data-total='totalCrossingHamali']").html(totalObjects.totalCrossingHamali);
			$("[data-total='drInOurAcForMgllp']").html(totalObjects.drInOurAcForMgllp);
			$("[data-total='drInOurAc']").html(totalObjects.drInOurAc);
			$("[data-total='totalToPayMgllp']").html(totalObjects.totalToPayMgllp);
			$("[data-total='totalToPayToDriverMgllp']").html((totalObjects.totalToPayMgllp + totalObjects.collectFromDriverAmt) - totalObjects.crossingNetUnloading);
			$("[data-total='totalBalanceAmount']").html(totalObjects.totalBookingAmount-totalObjects.totalCrossingHireAmount-totalObjects.totalDoordelivery);
			
			for(var i = 0; i < tableData.length; i++) {
				if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$("[data-total='totalToPayFreight']").html(totalObjects.totalFreight);
					$("[data-total='totalHamaliForTOPAY']").html(totalObjects.totalHamaliForTOPAY);
					$("[data-total='totalFreightForTOPAY']").html(totalObjects.totalFreightForTOPAY);
				} else
					$("[data-total='totalFreight']").html(0);
				
				$("[data-total='totalIandSCharge']").html(totalObjects.totalIandSCharge);
				
				if(tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID) {
					$("[data-total='totalPaidFreight']").html(totalObjects.totalFreight);
					$("[data-total='totalHamaliForPaid']").html(totalObjects.totalHamaliForPaid);
					$("[data-total='totalFreightForPaid']").html(totalObjects.totalFreightForPaid);
				} else
					$("[data-total='totalPaidFreight']").html(0);
					
				if(tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$("[data-total='totalFreightForTbb']").html(totalObjects.totalFreightForTbb);
			}
		
			const chargeMap = {
				totalFreightForTbb: "totalFreightForTbb",
				totalFreight: "totalFreight",
				totalLoading: "totalLoading",
				totalUnloading: "totalUnloading",
				totalDoordelivery: "totalDoordelivery",
				totalST: "totalST",
				totalOther: "totalOther",
				totalGST: "totalGST",
				totalPickup: "totalPickupCharge",
				totalIandSCharge: "totalIandSCharge",
				totalLc: "totalLc",
				totalHandlingCharge: "totalHandlingCharge",
				totalDoorPickup: "totalDoorPickup",
				totalStationary: "totalStationary",
				totalCrossingChrg: "totalCrossingChrg",
				totalCsCharge: "totalCsCharge",
				totalHamali: "totalHamali",
				totalCartage: "totalCartage"
				// Add charge keys here to hide charges whose total amount is zero for all LRs
			};
			
			
			$.each(chargeMap, function (key, className) {
				$("." + className).toggleClass("hide", !(totalObjects[key] > 0));
			});
				 
			if(totalObjects.totalDoordelivery == 0 && flavorConfiguration.replaceZeroAmountWithBlank)
				$("[data-total='totalDoordelivery']").html("");


		}, openPrintTypePopup : function() {
			$('#popUpForPrintType').bPopup({
			},function() {
				
				var _thisMod = this;
				$(this).html("<div class='confirm'>" +
						"<table style='width: 170px;height:; border: 0px;' cellpadding='3' cellspacing='0' border='0'>" +
						"<tr style='width: 170px;' align='center;'><td style='height:50px;width:150px;font-size:20px;position:relative;' colspan='2' align='center;' ><b>Select LR Print.</b></td></tr>" +
						"<tr><td align='center'><input	style='height:50px;width:150px;font-size:20px;position:relative;' type='button' id='printDotMatrix' value='Dot Matrix Print'></td>" +
						"<td align='center'><input	style='height:50px;width:150px;font-size:20px;position:relative;' type='button' id='printLaser' value='Laser Print'></td></tr></table></div>");
				
				$("#printLaser").click(function() {
					var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
						
					if (cookieValue == "")	
						document.cookie	= "print=laserlr; expires=Fri, 31 Dec 9999 23:59:59 GMT";
						
					_this.setLaserPrint();
					_thisMod.close();
				});
				
				$("#printDotMatrix").click(function(){
					var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
					
					if (cookieValue == "")
						document.cookie	= "print=dotmatrixlr; expires=Fri, 31 Dec 9999 23:59:59 GMT";
					
					_this.setDotMatrixPrintOrCallPopup();
					_thisMod.close();
				});
			});
		}, checkCookieForPrint : function() {
			var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			
			if(cookieValue == "laserlr")
				_this.setLaserPrint();
			else if(cookieValue == "dotmatrixlr")
				_this.setDotMatrixPrintOrCallPopup();
			else
				_this.openPrintTypePopup();
		}, setLaserPrint : function() {
			setTimeout(function() { 
				$(".infoStyle").each(function() {
					$(this).removeClass("infoStyle");
					$(this).addClass("infoStyle1");
				})
			});
			
			$(".tableHeader").each(function() {
				$(this).removeClass("tableHeader");
				$(this).addClass("tableHeader1");
			})
			
			setTimeout(function() { 
				$(".truncate").each(function() {
					$(this).removeClass("truncate");
					$(this).addClass("truncate1");
				})
			}, 500);
			
			$(".font20").each(function() {
				$(this).removeClass("font20");
				$(this).addClass("font20px");
			})
			
			$(".font27").each(function() {
				$(this).removeClass("font27");
				$(this).addClass("font27px");
			})
			
			$(".bold").each(function() {
				$(this).removeClass("bold");
				$(this).addClass("bold1");
			})
			
			$(".margin").each(function() {
				$(this).removeClass("margin");
				$(this).addClass("margin1");
			})
			
			$(".borderTop").each(function() {
				$(this).removeClass("borderTop");
				$(this).addClass("borderTop1");
			})
			
			$(".letterspacing").each(function() {
				$(this).removeClass("letterspacing");
				$(this).addClass("letterspacing1");
			})
			
			//('.groupname').hide();
			_this.setDotMatrixPrintOrCallPopup();
		}, setDotMatrixPrintOrCallPopup : function(){
			$('#popUpForPrint').bPopup({
			},function(){
				var _thisMod = this;
				$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
				
				$('#confirm').focus();
				$("#confirm").click(function(){
					_thisMod.close();
					setTimeout(function(){window.print();}, 200);
				})
				$("#confirm").on('keydown', function(e) {
					if (e.which == 27) {  //escape
						$('.deliveryCommission').hide();
						$('.payableDetailOthers').hide();
						$('.payableDetail').hide();
						_thisMod.close();
						setTimeout(function(){window.print();}, 200);
					}
				});
				$("#cancelButton").click(function() {
					$('.deliveryCommission').hide();
					$('.payableDetailOthers').hide();
					$('.payableDetail').hide();
					_thisMod.close();
					setTimeout(function(){window.print();}, 200);
				});
			});
			
			if($('.openPrintWindow').length) {
				$(".openPrintWindow").html(setTimeout(function(){window.print();}, 200));
			}
		}, resetDataForAcwAndChw : function() {
			totalActualWeightForPAID				= 0;																																																																																																																																																																							
			totalActualWeightForTOPAY				= 0;	
			totalActualWeightForFOC					= 0;
			totalActualWeightForCREDIT				= 0;
			totalChargeWeightForPAID				= 0;
			totalChargeWeightForTOPAY				= 0;
			totalChargeWeightForFOC					= 0;
			totalChargeWeightForCREDIT				= 0;
			totalPaidLr								= 0;		
			totalToPayLr							= 0;
			totalFocLr								= 0;
			totalTbbLr								= 0;
		}, resetData : function() {
			totalArticle							= 0;
			lrDetailsTotalActualWeightForPAID		= 0;
			lrDetailsTotalActualWeightForTOPAY		= 0;
			lrDetailsTotalActualWeightForFOC		= 0;
			lrDetailsTotalActualWeightForCREDIT		= 0;
			lrDetailsTotalArticleQtyForPAID			= 0;
			lrDetailsTotalArticleQtyForTOPAY		= 0;
			lrDetailsTotalArticleQtyForFOC			= 0;
			lrDetailsTotalArticleQtyForCREDIT		= 0;
		}, setCustomCommision(responseData, totalObjects) {
			var commnConfig			 = responseData.branchCommisionPropObj;
			var totalLsAmt			 = responseData.totalBookingAmount;
			var totalTopayLsAmt		 = totalObjects.toPayLRTotal;
			var lsComnPer			 = commnConfig.collectionPercentage;
			var dispatchLRSummary	 = responseData.dispatchLRSummary;
			var totalLSComnInPer	 = 0;
			var totalLSComnn		 = 0;
			var lsAmtForComn		 = 0;
			var lsPerAmt			 = 0;
			var topayCollCharge		 = 0;
			var topayForComn		 = 0;
			var topayForFinalComn	 = 0;
			var paybleAfterPod		 = 0;
			var lsPerAmtSky			 = 0;
			var lsAmtForCollSky		 = 0;
			var totalLSComnnSky		 = 0;
			var commInPerSky		 = 0;
			var collInPerSky		 = 0;
			var lsSubRegionId		 = responseData.lsDestBranch.subRegionId;
			flavorConfiguration		 = responseData.FlavorConfiguration;

			if(flavorConfiguration.subRegionWiseCollectionAndCommissionInLSPrint) {
				var commissionBranchIdsArr	= (flavorConfiguration.subRegionWiseCollectionAndCommission).split(",");

				for (i = 0; i < commissionBranchIdsArr.length; i++) {
					var commissionCharges = commissionBranchIdsArr[i];
					var branchIdSky = commissionCharges.split('_')[0];
				
					if (branchIdSky == lsSubRegionId) {
						commInPerSky = commissionCharges.split('_')[1];
						collInPerSky = commissionCharges.split('_')[2];
					}
				}
			}

			lsPerAmt		= Math.round((lsComnPer * totalLsAmt) / 100);
			lsPerAmtSky		= Math.round((collInPerSky * totalLsAmt) / 100);
			lsAmtForComn	= totalLsAmt - lsPerAmt;
			lsAmtForCollSky	= totalLsAmt - lsPerAmtSky;
			
			topayCollCharge = Math.round((lsComnPer	 * totalTopayLsAmt)) / 100;
			topayForComn	= totalTopayLsAmt - topayCollCharge;
			
			for (var dispatchObj in dispatchLRSummary) {
				var dispatchMap = dispatchLRSummary[dispatchObj];
				
				for (var dispatchData in dispatchMap) {
					var dispatchDataList = dispatchMap[dispatchData];
					
					if(dispatchDataList != null && dispatchDataList!= undefined && dispatchDataList.length > 0) {
						var data = dispatchDataList[0];
						totalLSComnInPer = data.deliveryCommission;
					}
				}
			} 
		
			totalLSComnn	  = Math.round((lsAmtForComn / 100) * totalLSComnInPer);
			totalLSComnnSky		 = Math.round((lsAmtForCollSky / 100) * commInPerSky);
			
			topayForFinalComn = Math.round((topayForComn / 100) * totalLSComnInPer);
			paybleAfterPod	  = totalLSComnn - topayForFinalComn;

			$("[data-commissionTotalLSAmt='toLSAmt']").html(totalLsAmt);
			
			$("[data-commission='comnInPer']").html("-"+lsComnPer+"%");
			$("[data-commission='collInPerSky']").html("-"+collInPerSky+"%");
			
			$("[data-commission='comnAmt']").html(lsPerAmt);
			$("[data-commission='collAmtSky']").html(lsPerAmtSky);
			$("[data-commission='comnAmtFinal']").html(Math.round(lsAmtForComn));
			$("[data-commission='collAmtFinalSky']").html(Math.round(lsAmtForCollSky));
			$("[data-commission='delPer']").html("-" + totalLSComnInPer + "%");
			$("[data-commission='delPerFinal']").html(Math.round(totalLSComnn));
			$("[data-commission='commPerSky']").html("-" + commInPerSky + "%");
			$("[data-commission='commPerFinalSky']").html(Math.round(totalLSComnnSky));
			$("[data-commission='topayComn']").html(Math.round(topayCollCharge));
			$("[data-commission='topayFinalComn']").html(Math.round(topayForComn));
			$("[data-commission='topayComnAmts']").html(topayForFinalComn);
			$("[data-commission='payAfterPOD']").html(paybleAfterPod);
		}, LrTypeWiseSummary : function(tableData, LrCount) {
			if (tableData['lrType'] == 'Paid') {
				totalArticleQtyForPAID	= totalArticleQtyForPAID + tableData.totalArticle;
				totalFreightForPAID		= totalFreightForPAID + tableData.freightCharge;
				totalLoadingForPAID		= totalLoadingForPAID + tableData.loadingCharge;
				totalUnloadingForPAID	= totalUnloadingForPAID + tableData.unloadingCharge;
				totalDoorCollectionAmountForPAID = totalDoorCollectionAmountForPAID + tableData.doorCollectionCharge;
				totalDoorDeliveryAmountForPAID = totalDoorDeliveryAmountForPAID + tableData.doorDeliveryCharge;
				totalDoorPickupAmountForPAID = totalDoorPickupAmountForPAID + tableData.doorPickupCharge;
				totalOtherAmountForPAID = totalOtherAmountForPAID + tableData.otherCharge;
				totalLrChargeAmountForPAID = totalLrChargeAmountForPAID + tableData.lrCharge;
				totalToPayHamaliForPAID = totalToPayHamaliForPAID + tableData.toPayHamali;
				totalDDCChargeAmountForPAID = totalDDCChargeAmountForPAID + tableData.ddcCharge;
				totalAmountForPAID		= totalAmountForPAID + tableData.amount;
				totallrCountForPAID		= ++LrCount;
			}
							
			if (tableData['lrType'] == 'To Pay') {
				totalArticleQtyForTOPAY		= totalArticleQtyForTOPAY + tableData.totalArticle;
				totalFreightForTOPAY		= totalFreightForTOPAY + tableData.freightCharge;
				totalLoadingForTOPAY		= totalLoadingForTOPAY + tableData.loadingCharge;
				totalUnloadingForTOPAY		= totalUnloadingForTOPAY + tableData.unloadingCharge;
				totalDoorCollectionAmountForTOPAY = totalDoorCollectionAmountForTOPAY + tableData.doorCollectionCharge;
				totalDoorDeliveryAmountForTOPAY = totalDoorDeliveryAmountForTOPAY + tableData.doorDeliveryCharge;
				totalDoorPickupAmountForTOPAY = totalDoorPickupAmountForTOPAY + tableData.doorPickupCharge;
				totalOtherAmountForTOPAY = totalOtherAmountForTOPAY + tableData.otherCharge;
				totalLrChargeAmountForTOPAY = totalLrChargeAmountForTOPAY + tableData.lrCharge;
				totalToPayHamaliForTOPAY = totalToPayHamaliForTOPAY + tableData.toPayHamali;
				totalDDCChargeAmountForTOPAY = totalDDCChargeAmountForTOPAY + tableData.ddcCharge;
				totalAmountForTOPAY			= totalAmountForTOPAY + tableData.amount;
				totallrCountForTOPAY		= ++LrCount;
			}
			
			if (tableData['lrType'] == 'FOC') {
				totalArticleQtyForFOC		= totalArticleQtyForFOC + tableData.totalArticle;
				totallrCountForFOC			= ++LrCount;
			}
			
			if (tableData['lrType'] == 'TBB') {
				totalArticleQtyForCREDIT= totalArticleQtyForCREDIT + tableData.totalArticle;
				totalFreightForCREDIT	= totalFreightForCREDIT + tableData.freightCharge;
				totalLoadingForCREDIT	= totalLoadingForCREDIT + tableData.loadingCharge;
				totaltotalUnloadingForCREDIT	= totaltotalUnloadingForCREDIT + tableData.unloadingCharge;
				totalDoorCollectionAmountForCREDIT = totalDoorCollectionAmountForCREDIT + tableData.doorCollectionCharge;
				totalDoorDeliveryAmountForCREDIT = totalDoorDeliveryAmountForCREDIT + tableData.doorDeliveryCharge;
				totalDoorPickupAmountForCREDIT = totalDoorPickupAmountForCREDIT + tableData.doorPickupCharge;
				totalOtherAmountForCREDIT = totalOtherAmountForCREDIT + tableData.otherCharge;
				totalLrChargeAmountForCREDIT = totalLrChargeAmountForCREDIT + tableData.lrCharge;
				totalToPayHamaliForCREDIT = totalToPayHamaliForCREDIT + tableData.toPayHamali;
				totalDDCChargeAmountForCREDIT = totalDDCChargeAmountForCREDIT + tableData.ddcCharge;
				totalAmountForCREDIT	= totalAmountForCREDIT + tableData.amount;
				totallrCountForCREDIT	= ++LrCount;
			}
		
			summeryObject.totalArticleQtyForPAID	= totalArticleQtyForPAID;
			summeryObject.totalArticleQtyForTOPAY	= totalArticleQtyForTOPAY;
			summeryObject.totalArticleQtyForCREDIT	= totalArticleQtyForCREDIT;
			summeryObject.totalArticleQtyForFOC		= totalArticleQtyForFOC;
			
			summeryObject.totalFreightForPAID		= totalFreightForPAID;
			summeryObject.totalFreightForTOPAY		= totalFreightForTOPAY;
			summeryObject.totalFreightForFOC		= 0;
			summeryObject.totalFreightForCREDIT		= totalFreightForCREDIT;
			
			summeryObject.totalLoadingForPAID		= totalLoadingForPAID;
			summeryObject.totalLoadingForTOPAY		= totalLoadingForTOPAY;
			summeryObject.totalLoadingForFOC		= 0;
			summeryObject.totalLoadingForCREDIT		= totalLoadingForCREDIT;
			
			summeryObject.totalUnloadingForPAID		= totalUnloadingForPAID;
			summeryObject.totalUnloadingForTOPAY	= totalUnloadingForTOPAY;
			summeryObject.totalUnloadingForFOC		= 0;
			summeryObject.totalUnloadingForCREDIT	= totaltotalUnloadingForCREDIT;
			
			summeryObject.totalDoorCollectionAmountForPAID = totalDoorCollectionAmountForPAID;
			summeryObject.totalDoorCollectionAmountForTOPAY = totalDoorCollectionAmountForTOPAY;
			summeryObject.totalDoorCollectionAmountForFOC = 0;
			summeryObject.totalDoorCollectionAmountForCREDIT = totalDoorCollectionAmountForCREDIT;
			
			summeryObject.totalDoorDeliveryAmountForPAID = totalDoorDeliveryAmountForPAID;
			summeryObject.totalDoorDeliveryAmountForTOPAY = totalDoorDeliveryAmountForTOPAY;
			summeryObject.totalDoorDeliveryAmountForFOC = 0;
			summeryObject.totalDoorDeliveryAmountForCREDIT = totalDoorDeliveryAmountForCREDIT;
			
			summeryObject.totalDoorPickupAmountForPAID = totalDoorPickupAmountForPAID;
			summeryObject.totalDoorPickupAmountForTOPAY = totalDoorPickupAmountForTOPAY;
			summeryObject.totalDoorPickupAmountForFOC = 0;
			summeryObject.totalDoorPickupAmountForCREDIT = totalDoorPickupAmountForCREDIT;
						
			summeryObject.totalOtherAmountForPAID = totalOtherAmountForPAID;
			summeryObject.totalOtherAmountForTOPAY = totalOtherAmountForTOPAY;
			summeryObject.totalOtherAmountForFOC = 0;
			summeryObject.totalOtherAmountForCREDIT = totalOtherAmountForCREDIT;
			
			summeryObject.totalLrChargeAmountForPAID = totalLrChargeAmountForPAID;
			summeryObject.totalLrChargeAmountForTOPAY = totalLrChargeAmountForTOPAY;
			summeryObject.totalLrChargeAmountForFOC = 0;
			summeryObject.totalLrChargeAmountForCREDIT = totalLrChargeAmountForCREDIT;	
							
			summeryObject.totalToPayHamaliForPAID = totalToPayHamaliForPAID;
			summeryObject.totalToPayHamaliForTOPAY = totalToPayHamaliForTOPAY;
			summeryObject.totalToPayHamaliForFOC = 0;
			summeryObject.totalToPayHamaliForCREDIT = totalToPayHamaliForCREDIT;
			
			summeryObject.totalDDCChargeAmountForPAID = totalDDCChargeAmountForPAID;
			summeryObject.totalDDCChargeAmountForTOPAY = totalDDCChargeAmountForTOPAY;
			summeryObject.totalDDCChargeAmountForFOC = 0;
			summeryObject.totalDDCChargeAmountForCREDIT = totalDDCChargeAmountForCREDIT;
			
			summeryObject.totalAmountForPAID		= Math.round(totalAmountForPAID);
			summeryObject.totalAmountForTOPAY		= Math.round(totalAmountForTOPAY);
			summeryObject.totalAmountForFOC			= 0;
			summeryObject.totalAmountForCREDIT		= Math.round(totalAmountForCREDIT);
			
			summeryObject.totallrCountForPAID		= totallrCountForPAID;
			summeryObject.totallrCountForTOPAY		= totallrCountForTOPAY;
			summeryObject.totallrCountForCREDIT		= totallrCountForCREDIT;
			summeryObject.totallrCountForFOC		= totallrCountForFOC;
	
		}, setLRWiseEWayBillDetails : function(lrWiseEwayBillDetails){
			$('#lrWiseEwayBill tbody').empty();
			
			var len = Object.keys(lrWiseEwayBillDetails).length;
			
			setTimeout(() => {
				if(len == 0) {
					$('#lrWiseEwayBill').remove();
					return;
				}
			},50);
			
			var tr;
			
			setTimeout(() => {
				for (var key in lrWiseEwayBillDetails) {
					tr = $('<tr/>');
					tr.append("<td align = 'center' style = 'width: 50%'>" + key + "</td>");
					tr.append("<td align = 'center' style = 'width: 50%'>" + lrWiseEwayBillDetails[key] + "</td>");
					
					$('#lrWiseEwayBill tbody').append(tr);
				}
			}, 50);
		}, setNormalLrsCommissionTable : function(lsData) {
			totalFreightForPAID		= lsData.normalLrPaidFreight;
			totalFreightForTOPAY	= lsData.normalLrToPayFreight;
			totalAmountForTOPAY		= lsData.normalLrToPayAmount;
			totalFreightForCREDIT	= lsData.normalLrTbbFreight;
			
			var totalCrossingFreightForPAID		= lsData.crossingLrPaidFreight;
			var totalCrossingFreightForTOPAY	= lsData.crossingLrToPayFreight;
			var totalCrossingAmountForTOPAY		= lsData.crossingLrToPayAmount;
			var totalCrossingFreightForCREDIT	= lsData.crossingLrTbbFreight;
			
			var totalFreight			= totalFreightForPAID + totalFreightForTOPAY + totalFreightForCREDIT;
			var totalCrossingFreight	= totalCrossingFreightForPAID + totalCrossingFreightForTOPAY + totalCrossingFreightForCREDIT;
			
			$("[data-commissionLabel='total']").html('Total');
			$("[data-commission='total']").html(totalFreight);
			$("[data-commission30='lsExpense']").html(lsData.lsExpense);
			$("[data-commissionToPayLabel='toPay']").html('To&nbsp;Pay&nbsp;Amount (-)');
			$("[data-commission='net']").html(totalFreight - lsData.lsExpense);

			if(lsData.lsExpense <= 0)
				$('.lsExpense').hide();
			
			$("[data-commissionToPay='toPay_NTCS']").html(totalAmountForTOPAY);
			$("[data-commission30Label='commission_NTCS']").html('Commission (' + (lsData.commission) + "%) (-)");
			$("[data-commissionBalanceLabel_NSTC='balance']").html('NET PAY/Company Due');
			
			if(lsData.commissionPecentage) {
				var commission	= (totalFreight - lsData.lsExpense) * lsData.commission / 100;
				var balance		= (totalFreight - commission - lsData.lsExpense - totalAmountForTOPAY);

				$("[data-commission30='NSTC_Commission']").html(commission);
				$("[data-commissionGrandTotal='grandTotal_NSTC']").html(totalFreight - commission - lsData.lsExpense);

				if(balance > 0) {
					$('#checkBoxForNetPay').removeClass('hide');
					$('#checkBoxForCompanyDue').addClass('hide');
				} else {
					$('#checkBoxForNetPay').addClass('hide');
					$('#checkBoxForCompanyDue').removeClass('hide');
				}
				
				if(lsData.showConnectingAmount) {
					$("[data-commissionSubTotal='subTotal']").html((totalFreight - commission - lsData.lsExpense)+ totalCrossingFreight);
					$("[data-commissionBalance='balance_NSTC']").html((totalFreight - commission - lsData.lsExpense) + totalCrossingFreight - (totalAmountForTOPAY + totalCrossingAmountForTOPAY));
				} else
					$("[data-commissionBalance='balance_NSTC']").html(balance);
			} else if(lsData.showConnectingAmount) {
				$("[data-commissionSubTotal='subTotal']").html((totalFreight - lsData.commission - lsData.lsExpense)+ totalCrossingFreight);
				$("[data-commissionBalance='balance_NSTC']").html((totalFreight - lsData.commission - lsData.lsExpense) + totalCrossingFreight - (totalAmountForTOPAY + totalCrossingAmountForTOPAY));
			} else {
				$("[data-commission30='NSTC_Commission']").html(lsData.commission);
				$("[data-commissionGrandTotal='grandTotal_NSTC']").html(totalFreight - lsData.commission - lsData.lsExpense);
				$("[data-commissionBalance='balance_NSTC']").html(totalFreight - lsData.commission - lsData.lsExpense - totalAmountForTOPAY);
			}
			
			if(lsData.showConnectingAmount) {
				$('#conAmount').removeClass('hide');
				$('#subTot').removeClass('hide');
				$("[data-coonectingAmount='connAmount']").html(totalCrossingFreight);
				$("[data-commissionToPay='toPay_NTCS']").html(totalAmountForTOPAY + totalCrossingAmountForTOPAY);
			}
		},setbookingCommisionFromRateMaster : function(totalCommission,cartageAmount){
			
			totalCommission  = Math.round(totalCommission)
			$("[data-bookinCommision='totalCommisionFromRateMaster']").html(totalCommission);
		}, setIsInvalidEwayBillDataLr: function(isInvalidEwayBillDataLr) {
			let $tbody = $('.isInValidEwayBilldataTable tbody').last();
			const templateRow = document.querySelector('[data-row="isInValidEwayBillDataTableDetails"]');
			
			isInvalidEwayBillDataLr.forEach(item => {
				const newRow = templateRow.cloneNode(true);
				newRow.classList.remove('hide');
				newRow.querySelectorAll('[data-lrDetails]').forEach(td => {
					const key = td.getAttribute('data-lrDetails');
					td.innerHTML = item[key] ?? '';
				});
				
				$tbody.append(newRow);
			});
			$('.isInValidEwayBilldataTable').last().removeClass('hide')
		}
	}
});