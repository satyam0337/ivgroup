package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.RateMasterBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePrintPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.RateMasterDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.BillDAO;
import com.platform.dao.reports.CreditWayBillPaymentDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.waybill.WayBillChargesRemarkDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BillDetailsForPrintingBill;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.City;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.RateMaster;
import com.platform.dto.Region;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillDetailsForPrintingBill;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.waybill.WayBillChargesRemark;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PrintBillAfterCreationAction implements Action {
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			error 									= null;
		Branch								branch									= null;
		ReportViewModel 					reportViewModel 						= null;
		BillDetailsForPrintingBill			bill 									= null;
		WayBillDetailsForPrintingBill[]		wayBills								= null;
		WayBillDetailsForPrintingBill[]		finalWayBills							= null;
		ValueObject							valueOutObject							= null;
		Long[]								wayBillIdArray							= null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 							= null;
		HashMap<Long, WayBillDeatailsModel> wayBillBookingDetails					= null;
		HashMap<Long, CustomerDetails>		consigneeDetails						= null;
		HashMap<Long, CustomerDetails>		consignorDetails						= null;
		ConsignmentDetails[] 				consDetails 							= null;
		WayBillCharges[]					wayBillCharges							= null;
		WayBillTaxTxn[]  					taxes   								= null;
		ArrayList<WayBillIncome> 			wbIncomeArr 							= null;
		HashMap<Long, ArrayList<WayBillIncome>>	wbIncomeCol							= null;
		HashMap<Long, ConsignmentSummary> 	consSmry 	   							= null;
		HashMap<Long, ConsignmentDetails[]> 			conArrCol					= null;
		RateMaster[] 						rate  									= null;
		HashMap<Long,ConsignmentSummary> 	consumHM      							= null;
		HashMap<Long, DispatchLedger> 		dispatchHM 								= null;
		ValueObject							valObject								= null;
		String 								wayBillIdsStr 							= null;
		HashMap<Long, WayBill>				wbDtls									= null;
		Long[]								bookingIdArray							= null;
		Long[]								bothIdArray								= null;
		HashMap<Long, HashMap<Short, WayBillCharges>> lrWiseWayBillChargesCol 		= null;
		ArrayList<Long> 					bookingChargeWBIdList 					= null;
		ArrayList<Long> 					bothChargeWBIdList 	 					= null;
		ValueObject		valObjIn	= null;

		var totalRowsInPrint = 0;
		var   lineCountOnPage= 0;
		var count = 1;

		ConsignmentDetails[] 			consDetails2 		= null;
		Map<Long, List<WayBillChargesRemark>>	wayBillChargesRemarkHm		= null;
		List<WayBillChargesRemark>		wayBillChargeRemarkArryList	= null;
		var							isShowCRNumber				= false;
		Region							region						= null;
		City							city						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 		billId			= JSPUtility.GetLong(request, "billId" ,0);
			final var 	isOldLMTPrint	= JSPUtility.GetBoolean(request, "isOldLMTPrint" ,false);
			final var 	isPDF			= JSPUtility.GetBoolean(request, "isPDF" ,false);
			final var 	checkedVal		= request.getParameter("chkVal");
			final var cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	pageWiseLRPrint		= new HashMap<Integer, Integer>();

			final var	groupConfig						= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	searchConfiguration				= cache.getSearchConfiguration(request, executive.getAccountGroupId());
			final var	downloadToPDFForBillOnSearch	= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.DOWNLOAD_TO_PDF_FOR_BILL_ON_SEARCH, false);
			final var 	printConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDITOR_INVOICE_PRINT);
			final var 	sendWhatsApp					= (boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.SEND_PDF_WITH_WHATSAPP_MESSAGE, false);

			bill = BillDAO.getInstance().getBillDetailsForPrintingBill(billId);

			if(bill != null) {

				branch = cache.getGenericBranchDetailCache(request, bill.getBranchId());
				bill.setBranchName(branch.getName());
				bill.setBranchAddress(branch.getAddress());
				bill.setBranchGstn(branch.getGstn());
				bill.setBranchPanNo(branch.getPanNumber());
				bill.setBillSubRegionId(branch.getSubRegionId());
				bill.setBranchPhoneNumber(branch.getMobileNumber());

				region = cache.getGenericRegionById(request, branch.getRegionId());
				bill.setBillRegionName(region.getName());
				bill.setBillRegionId(branch.getRegionId());

				city  = cache.getCityById(request, branch.getCityId());
				bill.setBillingCity(city != null ? city.getName() : "");

				if(bill.getRemark() == null)
					bill.setRemark("");

				bill.setDueDateStr(DateTimeUtility.getDateFromTimeStamp(bill.getDueDate()));

				request.setAttribute("BillDetailsForPrintingBill", bill);
				request.setAttribute("sendWhatsApp", sendWhatsApp);

				final var	onlyPartyWiseMinimumValueConfigAllow	= groupConfig.getBoolean(GroupConfigurationPropertiesDTO.ONLY_PARTY_WISE_MINIMUM_VALUE_CONFIG_ALLOW, false);

				valObjIn	= new ValueObject();
				valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
				valObjIn.put(CorporateAccount.CORPORATE_ACCOUNT_ID, bill.getCreditorId());
				valObjIn.put(GroupConfigurationPropertiesDTO.ONLY_PARTY_WISE_MINIMUM_VALUE_CONFIG_ALLOW, onlyPartyWiseMinimumValueConfigAllow);

				final var rateMasterBLL	= new RateMasterBLL();
				final var	result	= rateMasterBLL.getPartyMinimumRatesInBooking(valObjIn);

				if (result != null && result.containsKey(RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID)) {
					final var	rm	= result.get(RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID);
					request.setAttribute("minAmount", rm.getRate());
				}

				valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForPrintingBill(billId);

				if(valueOutObject != null) {

					wayBills 		   	   = (WayBillDetailsForPrintingBill[])valueOutObject.get("WayBillDetailsForPrintingBill");
					wayBillIdArray 	   	   = (Long[])valueOutObject.get("WayBillIdArray");
					bothChargeWBIdList 	   = (ArrayList<Long> )valueOutObject.get("bothChargeWBIdList");
					bookingChargeWBIdList  = (ArrayList<Long> )valueOutObject.get("bookingChargeWBIdList");

					if(wayBills != null && wayBills.length > 0) {
						wayBillIdsStr 		= Utility.GetLongArrayToString(wayBillIdArray);
						consignorDetails 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
						consigneeDetails    = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);
						wbIncomeCol 		= WayBillIncomeDao.getInstance().getWayBillIncomeByWayBillIdArray(wayBillIdsStr);
						consSmry 			= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);
						conArrCol 			= ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(wayBillIdsStr);
						wbDtls 				= WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIdsStr);
						wayBillChargesRemarkHm	= WayBillChargesRemarkDao.getInstance().getWayBillChargesRemarkByWayBillIds(wayBillIdsStr);

						lrWiseWayBillChargesCol = new HashMap<>();

						//If only one LR in bill it could be FTL hence get the Vehicle Number
						if(wayBills.length == 1){
							consumHM = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIdsStr);

							if(consumHM != null && consumHM.get(wayBills[0].getWayBillId()).getBookingTypeId() == TransportCommonMaster.BOOKING_TYPE_FTL_ID){
								valObject	= DispatchSummaryDao.getInstance().getDispatchLedgerDetailsByWayBillIds(wayBillIdsStr);
								if(valObject != null)
									dispatchHM = (HashMap<Long, DispatchLedger>)valObject.get("dispatchHM");
							}
						}

						//Get Way Bill details
						if(bookingChargeWBIdList != null && !bookingChargeWBIdList.isEmpty()){
							bookingIdArray = new Long[bookingChargeWBIdList.size()];
							bookingChargeWBIdList.toArray(bookingIdArray);

							wayBillBookingDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(bookingIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
						}

						if(bothChargeWBIdList != null && !bothChargeWBIdList.isEmpty()){
							bothIdArray = new Long[bothChargeWBIdList.size()];
							bothChargeWBIdList.toArray(bothIdArray);

							wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(bothIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOTH ,true);
						}

						for (var i = 0; i < wayBills.length; i++) {
							String 	packageDetails 	= null;
							var		totalPkgQty 	= 0;
							var 	otherCharges 	= 0.00;
							var 	divsOfConsQty   = 0;
							final 	var wayBillChargesCol = new HashMap<Short, WayBillCharges>();
							final 	Map<Long, Double> waybillRelated 	  = new HashMap<>();
							var	wayBillChargeRemarkStr	= "";

							if(wayBills[i].getSourceBranchId() > 0 ){
								branch = cache.getGenericBranchDetailCache(request, wayBills[i].getSourceBranchId());
								wayBills[i].setSourceBranch(branch.getName());
								wayBills[i].setSourceSubRegionId(branch.getSubRegionId());
								wayBills[i].setSourceSubRegion(branch.getName());
							}

							wayBills[i].setDestinationBranch(cache.getGenericBranchDetailCache(request, wayBills[i].getDestinationBranchId()).getName());

							branch = cache.getGenericBranchDetailCache(request, wayBills[i].getDestinationBranchId());
							wayBills[i].setDestinationBranch(branch.getName());
							wayBills[i].setDestinationSubRegionId(branch.getSubRegionId());

							final var destSubRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
							wayBills[i].setDestinationSubRegion(destSubRegion != null ? destSubRegion.getName() : "");

							if(dispatchHM != null)
								for(final Long key : dispatchHM.keySet())
									wayBills[i].setVehicleNumber(dispatchHM.get(key).getVehicleNumber());

							wayBills[i].setConsigneeName(consigneeDetails.get(wayBills[i].getWayBillId()).getName());
							wayBills[i].setConsignorName(consignorDetails.get(wayBills[i].getWayBillId()).getName());

							if(wayBillChargesRemarkHm != null) {
								wayBillChargeRemarkArryList	= wayBillChargesRemarkHm.get(wayBills[i].getWayBillId());

								if(wayBillChargeRemarkArryList != null && !wayBillChargeRemarkArryList.isEmpty())
									wayBillChargeRemarkStr	= wayBillChargeRemarkArryList.stream().map(WayBillChargesRemark::getWayBillChargeRemark).collect(Collectors.joining(","));
							}

							wayBills[i].setWayBillRemark(wayBillChargeRemarkStr);

							final var otherChargeDetails		= new StringJoiner(", ");
							final var gstTransporterDetails  	= new StringJoiner(", ");
							final var gstOtherDetails			= new StringJoiner(", ");

							if(wayBills[i].getBookingAmount() > 0 && wayBills[i].getDeliveryAmount() > 0){
								consDetails 	  = wayBillDetails.get(wayBills[i].getWayBillId()).getConsignmentDetails();
								wayBillCharges 	  = wayBillDetails.get(wayBills[i].getWayBillId()).getWayBillCharges();
								taxes 			  = wayBillDetails.get(wayBills[i].getWayBillId()).getWayBillTaxTxn();
								wayBills[i].setDiscount(wbDtls.get(wayBills[i].getWayBillId()).getBookingDiscount());
								wayBills[i].setDeliveryDiscount(wbDtls.get(wayBills[i].getWayBillId()).getDeliveryDiscount());
							} else {
								consDetails 	  = wayBillBookingDetails.get(wayBills[i].getWayBillId()).getConsignmentDetails();
								wayBillCharges 	  = wayBillBookingDetails.get(wayBills[i].getWayBillId()).getWayBillCharges();
								taxes 			  = wayBillBookingDetails.get(wayBills[i].getWayBillId()).getWayBillTaxTxn();
								wayBills[i].setDiscount(wbDtls.get(wayBills[i].getWayBillId()).getBookingDiscount());
							}

							// Consignment Detail
							if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_JAGRUTI_TRANSPORTS
									|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SCC){
								if(consSmry != null) {
									if(consSmry.get(wayBills[i].getWayBillId()).getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY){
										final List<ConsignmentDetails> 	consDetailsList = new ArrayList<>();
										final var 		consDetailsdto 	= new ConsignmentDetails();

										for (final ConsignmentDetails consDetail : consDetails)
											if(waybillRelated.get(wayBills[i].getWayBillId()) == null)
												waybillRelated.put(wayBills[i].getWayBillId(), consDetail.getAmount());

										final var 	totalConsmAmount= (int) Stream.of(consDetails).map(ConsignmentDetails::getAmount).mapToDouble(Double::doubleValue).sum();
										final var	firstConsmAmt	= (int) Stream.of(consDetails).findFirst().orElse(new ConsignmentDetails()).getAmount();
										final var	firstConsmAmtDbl= Stream.of(consDetails).findFirst().orElse(new ConsignmentDetails()).getAmount();

										totalPkgQty		= (int) Stream.of(consDetails).map(ConsignmentDetails::getQuantity).mapToLong(Long::longValue).sum();
										packageDetails	= Stream.of(consDetails).map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining("/ "));

										divsOfConsQty = totalConsmAmount / consDetails.length;

										if(firstConsmAmt == divsOfConsQty) {
											consDetailsdto.setQuantity(totalPkgQty);
											consDetailsdto.setConsignmentRateEqual(true);
											consDetailsdto.setAmount(firstConsmAmtDbl);
											consDetailsList.add(consDetailsdto);
											consDetails2 = new ConsignmentDetails[consDetailsList.size()];
											consDetailsList.toArray(consDetails2);
											wayBills[i].setConsignmentDetails(consDetails2);
										} else
											wayBills[i].setConsignmentDetails(consDetails);
									} else {
										final List<ConsignmentDetails> 	consDetailsList = new ArrayList<>();
										final var		consDetailsdto 	= new ConsignmentDetails();

										for (final ConsignmentDetails consDetail : consDetails)
											consDetailsdto.setQuantity(consDetailsdto.getQuantity() + consDetail.getQuantity());

										totalPkgQty		= (int) Stream.of(consDetails).map(ConsignmentDetails::getQuantity).mapToLong(Long::longValue).sum();
										packageDetails	= Stream.of(consDetails).map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining("/ "));

										consDetailsList.add(consDetailsdto);
										consDetails2 = new ConsignmentDetails[consDetailsList.size()];
										consDetailsList.toArray(consDetails2);
										wayBills[i].setConsignmentDetails(consDetails2);

										packageDetails = packageDetails + "~" + consSmry.get(wayBills[i].getWayBillId()).getAmount();
										totalRowsInPrint += 1;
										lineCountOnPage  += 1;
									}

									if(lineCountOnPage > 42 || i == 27){
										lineCountOnPage = 0;
										pageWiseLRPrint.put(count, i);
										count++;
									} else
										pageWiseLRPrint.put(count, i);
								}
							} else {
								totalPkgQty		= (int) Stream.of(consDetails).map(ConsignmentDetails::getQuantity).mapToLong(Long::longValue).sum();
								packageDetails	= Stream.of(consDetails).map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining("/ "));
							}

							if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_JAGRUTI_TRANSPORTS
									&& consSmry.get(wayBills[i].getWayBillId()).getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY && waybillRelated != null)
								packageDetails = packageDetails + "~" + waybillRelated.get(wayBills[i].getWayBillId());

							wayBills[i].setPackageDetails(packageDetails);
							wayBills[i].setQuantity(totalPkgQty);

							//Charge Details
							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
									wayBills[i].setFreightCharge(wayBills[i].getFreightCharge() + wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.HAMALI)
									wayBills[i].setHamaliCharge(wayBills[i].getHamaliCharge() + wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.BUILTY_CHARGE)
									wayBills[i].setBiltyCharge(wayBills[i].getBiltyCharge() + wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getChargeAmount() > 0) {
									otherCharges += wayBillCharge.getChargeAmount();
									otherChargeDetails.add(cache.getChargeTypeMasterById(request, wayBillCharge.getWayBillChargeMasterId()).getChargeName() + " : " + wayBillCharge.getChargeAmount());
								}

								wayBillChargesCol.put((short) wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
							}

							//Tax Details
							for (final WayBillTaxTxn element : taxes) {
								element.setTaxName(cache.getTaxMasterById(request, element.getTaxMasterId()).getTaxMasterName());
								wayBills[i].setTaxAmount(element.getTaxAmount() + wayBills[i].getTaxAmount());
								wayBills[i].setUnAddedTaxAmount(element.getUnAddedTaxAmount()+ wayBills[i].getUnAddedTaxAmount());

								gstTransporterDetails.add(element.getTaxName() + " : " + element.getTaxAmount());
								gstOtherDetails.add(element.getTaxName() + " : " + element.getUnAddedTaxAmount());
							}

							wayBills[i].setWayBillTaxTxn(taxes);
							//Get Remark
							wayBills[i].setRemark(wbDtls.get( wayBills[i].getWayBillId()).getRemark());

							//Way bill Income
							if(wbIncomeCol !=  null) {
								wbIncomeArr = wbIncomeCol.get(wayBills[i].getWayBillId());

								if(wbIncomeArr!=null)
									for (final WayBillIncome wbIncome : wbIncomeArr) {
										otherCharges += wbIncome.getAmount();
										otherChargeDetails.add(wbIncome.getIncomeName() + " : " + Math.round(wbIncome.getAmount()));
									}
							}

							if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
								//Get the rate
								rate = RateMasterDao.getInstance().getRateMasterForCorporate(wayBills[i].getSourceBranchId(), wayBills[i].getDestinationBranchId(),executive.getAccountGroupId(), wayBills[i].getCreditorId(), TransportCommonMaster.RATE_CATEGORY_CREDITOR);

							if(rate != null)
								for (final RateMaster element : rate)
									if(element.getChargeTypeMasterId()== BookingChargeConstant.FREIGHT)
										wayBills[i].setRate(element.getRate());

							if(consSmry != null){
								wayBills[i].setChargeTypeId(consSmry.get(wayBills[i].getWayBillId()).getChargeTypeId());

								switch (wayBills[i].getChargeTypeId()) {
								case ChargeTypeConstant.CHARGETYPE_ID_FIX -> {
									wayBills[i].setRateType("FIXED");
									wayBills[i].setRate(0.0);
								}
								case ChargeTypeConstant.CHARGETYPE_ID_WEIGHT -> wayBills[i].setRateType(" (W)");
								case ChargeTypeConstant.CHARGETYPE_ID_QUANTITY -> wayBills[i].setRateType(" (Q)");
								default -> {
									break;
								}
								}

								wayBills[i].setBookingTypeId(consSmry.get(wayBills[i].getWayBillId()).getBookingTypeId());

								if(wayBills[i].getBookingTypeId()== BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
									wayBills[i].setRateType(BookingTypeConstant.getBookingType(wayBills[i].getBookingTypeId()));
									wayBills[i].setRate(0.0);
								}

								wayBills[i].setPrivateMarka(consSmry.get(wayBills[i].getWayBillId()).getPrivateMarka());
							}

							//Set otherCharges
							wayBills[i].setOtherCharge(otherCharges);
							//Set Other Charges Details

							if(otherChargeDetails.length() > 0)
								wayBills[i].setOtherChargeDetails(otherChargeDetails.toString());

							if(gstOtherDetails.length() > 0)
								wayBills[i].setGstOtherDetails(gstOtherDetails.toString());

							if(gstTransporterDetails.length() > 0)
								wayBills[i].setGstTransporterDetails(gstTransporterDetails.toString());

							wayBills[i].setActualWeight(consSmry.get(wayBills[i].getWayBillId()).getActualWeight());

							lrWiseWayBillChargesCol.put(wayBills[i].getWayBillId(), wayBillChargesCol);

							if(wayBills[i].isDeliveryTimeTbb())
								isShowCRNumber = true;

							final var 	pair	= SplitLRNumber.getNumbers(wayBills[i].getWayBillNumber());

							if(pair != null) {
								wayBills[i].setSrcBranchCode(pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
								wayBills[i].setLrNumberForSorting(pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
							}
						}

						final var subRegionList	= CollectionUtility.getLongListFromString((String) printConfiguration.getOrDefault(CreditorInvoicePropertiesConstant.SUB_REGION_IDS_FOR_LR_NUMBER_WISE_SORTING, "0"));

						if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.LR_NUMBER_WISE_SORTING, false) && (subRegionList.isEmpty() || subRegionList.contains(bill.getBillSubRegionId()))) {
							final List<WayBillDetailsForPrintingBill>	waybillsListArrNew = SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::getSrcBranchCode, WayBillDetailsForPrintingBill:: getLrNumberForSorting);
							finalWayBills = new WayBillDetailsForPrintingBill[waybillsListArrNew.size()];
							waybillsListArrNew.toArray(finalWayBills);

							request.setAttribute("WayBillDetailsForPrintingBill", finalWayBills);
						} else
							request.setAttribute("WayBillDetailsForPrintingBill", wayBills);

						request.setAttribute("lrWiseWayBillChargesCol", lrWiseWayBillChargesCol);
						request.setAttribute("bookingCharges", cache.getBookingCharges(request, executive.getBranchId()));
						request.setAttribute("deliveryCharges", cache.getDeliveryCharges(request, executive.getBranchId()));
						request.setAttribute("consSmry", consSmry);
						request.setAttribute("executiveAdress", cache.getGenericBranchDetailCache(request, executive.getBranchId()).getAddress());
						request.setAttribute("chargeTypeMaster", cache.getChargeTypeMasterData(request));
						request.setAttribute("totalRowsInPrint", totalRowsInPrint);
						request.setAttribute("pageWiseLRPrint", pageWiseLRPrint);
						request.setAttribute("checkedVal", checkedVal);
						request.setAttribute("isShowCRNumber", isShowCRNumber);
						request.setAttribute("conArrCol", conArrCol);
					}
				}

				request.setAttribute("customAddressBranchId", bill.getBranchId());
				request.setAttribute("customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("BillId", billId);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if(isOldLMTPrint)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId() + "_Old");
			else if(isPDF && downloadToPDFForBillOnSearch)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId() + "_PDF");
			else
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}